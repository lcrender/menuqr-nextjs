# Geolocalización y región (país) en AppMenuQR

## Resumen

La aplicación usa **geolocalización solo a nivel de país** (código ISO o nombre). No se usa GPS, ni coordenadas (latitud/longitud), ni la API del navegador `navigator.geolocation`. La detección se hace por **IP** / headers CDN y, en marketing, por cookie de región de landing.

Hay **dos usos distintos** del “país/región”:

1. **Cuenta, facturación y restaurante** (este documento, secciones 1–5).
2. **Home de marketing `/ar` vs `/es`** — ver [`docs/GEO-LANDING.md`](../../docs/GEO-LANDING.md).

---

## 1. Usuario al registrarse (backend)

- **Dónde**: `GeoService` (`backend/src/geo/geo.service.ts`) y endpoint `POST /auth/register` (`backend/src/auth/auth.controller.ts`).
- **Cómo**:
  1. Se intenta leer el header **`CF-IPCountry`** (Cloudflare). Si existe y es válido (2 letras, distinto de `XX`), se usa como código de país.
  2. Si no hay Cloudflare, se llama a la API externa **ip-api.com** con la IP del cliente. Solo se consulta para IPs públicas (no localhost ni redes privadas).
  3. Fallback opcional: `Accept-Language` (ej. `es-AR` → `AR`) dentro de `GeoService`.
- **Uso del país detectado**:
  - Se guarda en el usuario como **`registration_country`** (y opcionalmente **`declared_country`** en perfil).
  - Se guarda en la suscripción inicial como **`billing_country`**.
  - Define proveedor de pago (Argentina → Mercado Pago; resto → PayPal, según `payment-provider`).
- **Respuesta login/registro**: el objeto `user` incluye `registrationCountry` y `declaredCountry` para que el frontend sincronice la cookie de landing (`menuqr-landing-region`).

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
- **WhatsApp**: En la vista pública del menú y en las plantillas se usa el **país del restaurante** para formatear el link de WhatsApp con el prefijo correcto (`formatWhatsAppForLink(whatsapp, restaurant.country)`).

---

## 4. Precios por país (API)

- **Endpoint**: `GET /pricing` (`backend/src/payment/pricing.controller.ts`).
- **Query opcional**: `?country=AR` o `?country=GLOBAL`.
  - Si está presente y es válido, **fuerza** esa tabla de precios (landings `/ar` y `/es`), aunque haya sesión.
  - Si no hay query: usuario autenticado → `billingCountry` / `declaredCountry` / `registrationCountry`; anónimo → **GLOBAL** (USD).
- Filas en BD: `plan_prices.country` = `AR` | `GLOBAL` (y futuros países).

Detalle de homes y cookie: [`docs/GEO-LANDING.md`](../../docs/GEO-LANDING.md).

---

## 5. Qué no se hace

- No se usa **geolocalización precisa** (sin GPS ni coordenadas).
- No se guardan **latitud/longitud** del usuario ni del restaurante.
- No se usa **`navigator.geolocation`** en el navegador.
- Las meta HTML `geo.region` / `geo.placename` **no** se usan para SEO (Google las ignora); el targeting de marketing usa `hreflang` en las homes regionales.

---

## 6. Archivos relevantes

| Ámbito | Archivo |
|--------|---------|
| Backend | `backend/src/geo/geo.service.ts` — detección de país por IP/headers |
| Backend | `backend/src/auth/auth.controller.ts` — registro y llamada a `GeoService` |
| Backend | `backend/src/auth/auth.service.ts` — `registrationCountry` / `billingCountry` en respuestas |
| Backend | `backend/src/payment/pricing.controller.ts` — precios por país / `?country=` |
| Backend | `backend/src/payment/payment-provider.service.ts` — MP vs PayPal por país |
| Frontend | `frontend/components/RestaurantWizard.tsx` — país del restaurante por IP |
| Frontend | `frontend/middleware.ts` + `frontend/lib/landing-region.ts` — home `/ar`\|`/es` |
| Frontend | `frontend/pages/admin/restaurants/index.tsx` — país, moneda, timezone, WhatsApp |
| Docs | [`docs/GEO-LANDING.md`](../../docs/GEO-LANDING.md) — marketing geo |
| Docs | [`docs/SEO-LANDINGS.md`](../../docs/SEO-LANDINGS.md) — SEO landings + homes |
