# Geolocalización y región (país) en AppMenuQR

## Resumen

La aplicación usa **geolocalización solo a nivel de país** (código ISO o nombre). No se usa GPS, ni coordenadas (latitud/longitud), ni la API del navegador `navigator.geolocation`. La detección se hace por **IP** en backend y en frontend mediante APIs externas o el header de Cloudflare.

---

## 1. Usuario al registrarse (backend)

- **Dónde**: `GeoService` (`backend/src/geo/geo.service.ts`) y endpoint `POST /auth/register` (`backend/src/auth/auth.controller.ts`).
- **Cómo**:
  1. Se intenta leer el header **`CF-IPCountry`** (Cloudflare). Si existe y es válido (2 letras, distinto de `XX`), se usa como código de país.
  2. Si no hay Cloudflare, se llama a la API externa **ip-api.com** con la IP del cliente (`req.ip` o `req.socket?.remoteAddress`). Solo se consulta para IPs públicas (no localhost ni redes privadas).
- **Uso del país detectado**:
  - Se guarda en el usuario como **`registration_country`** (y opcionalmente el usuario puede tener **`declared_country`** en su perfil).
  - Se guarda en la suscripción inicial como **`billing_country`**.
  - Pensado para futura lógica de proveedor de pago (ej. MercadoPago por Argentina) y métricas.

---

## 2. Restaurante en el wizard (frontend)

- **Dónde**: `RestaurantWizard` (`frontend/components/RestaurantWizard.tsx`), en un `useEffect` al montar el componente.
- **Cuándo**: Solo si el formulario **no tiene país seleccionado** (`!formData.country`).
- **Cómo**:
  1. Se llama a **`https://ipapi.co/json/`** y se usa `country_name`.
  2. Si falla, se usa **`https://ip-api.com/json/`** y se usa `country`.
  - El nombre se mapea a la lista interna de países (ej. "United States" → "Estados Unidos") y solo se asigna si está en `validCountries`.
- **Uso**: Rellenar automáticamente el campo **país** del restaurante para facilitar moneda, provincias/ciudades y formato de WhatsApp.

---

## 3. Uso del país del restaurante

- **Moneda por defecto**: En `admin/restaurants/index.tsx` hay un mapa `countryCurrencies`; al elegir país se sugiere la moneda (ej. Argentina → ARS).
- **Dirección**: País, provincia y ciudad se usan en el formulario de restaurante y se envían al backend (address, timezone, etc.).
- **WhatsApp**: En la vista pública del menú y en las plantillas (Classic, Minimalist, Foodie, Italian Food) se usa el **país del restaurante** para formatear el link de WhatsApp con el prefijo correcto (`formatWhatsAppForLink(whatsapp, restaurant.country)`), de modo que el número tenga el código de país si no lo incluye el usuario.

---

## 4. Qué no se hace

- No se usa **geolocalización precisa** (sin GPS ni coordenadas).
- No se guardan **latitud/longitud** del usuario ni del restaurante.
- No se usa **`navigator.geolocation`** en el navegador.

---

## 5. Archivos relevantes

| Ámbito   | Archivo |
|----------|--------|
| Backend  | `backend/src/geo/geo.service.ts` — detección de país por IP/headers |
| Backend  | `backend/src/auth/auth.controller.ts` — registro y llamada a `GeoService` |
| Backend  | `backend/src/auth/auth.service.ts` — guardado de `registrationCountry` y `billingCountry` |
| Frontend | `frontend/components/RestaurantWizard.tsx` — detección de país por IP (ipapi.co / ip-api.com) |
| Frontend | `frontend/pages/admin/restaurants/index.tsx` — país, moneda, timezone, WhatsApp |
| Frontend | `frontend/pages/restaurant/[slug].tsx` y plantillas — uso de `country` para WhatsApp |
