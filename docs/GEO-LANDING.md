# Homes regionales (geo landing) — `/AR` y `/ES`

## Objetivo

Servir una **home de marketing distinta** según el mercado:

| URL | Mercado | Copy | Precios (`GET /pricing`) |
|-----|---------|------|---------------------------|
| `/AR` | Argentina | Español argentino (voseo) | `?country=AR` → ARS / Mercado Pago |
| `/ES` | España y resto del mundo | Español peninsular / internacional | `?country=GLOBAL` → USD / PayPal |
| `/` | — | No indexa contenido propio | Redirect al home regional |

La versión en **inglés** se planifica en otra rama/prefijo (p. ej. `/EN`); no forma parte de este documento aún.

Documentación SEO relacionada: [`docs/SEO-LANDINGS.md`](./SEO-LANDINGS.md).  
Geolocalización de registro/pagos/wizard: [`backend/docs/GEOLOCATION.md`](../backend/docs/GEOLOCATION.md).

---

## Flujo al entrar a `/`

```
Visitante → /
     │
     ├─ Cookie menuqr-landing-region = AR|ES  →  /AR o /ES
     ├─ Header CF-IPCountry / x-vercel-ip-country = AR  →  /AR
     ├─ Accept-Language contiene es-AR  →  /AR
     └─ Resto  →  /ES
```

1. **`frontend/middleware.ts`**: si el path es `/`, resuelve región, setea cookie y redirige a `/AR` o `/ES`.
2. **Fallback cliente** (`frontend/pages/index.tsx`): si el middleware no aplica, lee usuario en `localStorage` (país AR), cookie o `navigator.languages`, y hace `router.replace` al home regional.
3. Visitar `/AR` o `/ES` **persiste** la cookie de región.

### Prioridad de región

1. Cookie `menuqr-landing-region` (`AR` \| `ES`)
2. País del usuario logueado: `declaredCountry` \|\| `registrationCountry` → solo `AR` fuerza Argentina
3. Geo por headers / Accept-Language (middleware)
4. Fallback: `ES`

---

## Cookie

| Nombre | Valores | Max-Age |
|--------|---------|---------|
| `menuqr-landing-region` | `AR`, `ES` | 1 año |

- **Set** en middleware al visitar `/`, `/AR`, `/ES`.
- **Set** en cliente al montar `HomeLanding`, login/registro (`syncLandingRegionCookieFromUser`) y `_app.tsx` si hay `user` en `localStorage`.
- Helpers: `frontend/lib/landing-region.ts`.

---

## Precios por región

- **Backend**: `GET /pricing?country=AR|GLOBAL`
  - Si viene `country` en whitelist, **fuerza** esos precios (también con sesión).
  - Sin query: usuario autenticado → `billingCountry` / `declaredCountry` / `registrationCountry`; anónimo → GLOBAL.
  - Archivo: `backend/src/payment/pricing.controller.ts`.
- **Frontend home**: `HomeLanding` llama `/pricing` con `country` según `HOME_LANDING_AR` / `HOME_LANDING_ES`.
- **`/precios`**: sin `?reason=…` redirige a `{/AR|/ES}#precios`. Con `?reason=pro_template` (u otro reason) se queda en `/precios` y carga precios según cookie regional.

---

## SEO técnico (homes)

En cada `/AR` y `/ES` (`HomeLanding`):

- **Canonical** propio (`NEXT_PUBLIC_APP_URL` + path).
- **`hreflang`** (HTML + sitemap xhtml):
  - `es-AR` → `/AR`
  - `es-ES` → `/ES`
  - `es` → `/ES`
  - `x-default` → `/ES`
- **`content-language`** / `document.documentElement.lang`: `es-AR` o `es-ES`.
- **`og:locale`**: `es_AR` / `es_ES` (+ alternate del otro).
- Sitemap: `frontend/lib/sitemap-xml.ts` incluye `/AR` y `/ES` con `xhtml:link` alternates.

No usar meta `geo.region` (Google las ignora).

---

## Enlaces internos

Todos los “inicio”, anclas de nav (`#beneficios`, `#precios`, `#como-funciona`, `#faq`) y CTAs de precios deben apuntar al **home regional**, no a `/` como página final.

| Pieza | Comportamiento |
|-------|----------------|
| `LandingNav` | Logo y secciones vía `useLandingHomeHref` |
| `LandingFooter` | Marca + Precios → home regional `#precios` |
| `LandingHomeLink` | Link genérico al home regional |
| Landings SEO / plantillas | “Inicio” y “Planes y precios” resueltos a región |
| Login, legales, verify-email | Logo / volver → home regional |

Helpers: `landingSectionHref`, `useLandingHomeHref`, `resolveLandingHomeHref` en `landing-region.ts`.

---

## Landings SEO en la raíz (sin `/AR` ni `/ES`)

Las landings de **keyword** (`/carta-digital-restaurante-qr`, etc.) **permanecen en la raíz**: no se duplican por país salvo que el copy/precios cambien de verdad por mercado.

**Redirect histórico (canibalización):**

| Origen | Destino | Tipo |
|--------|---------|------|
| `/menu-qr-restaurante` | `/` | 301 en `frontend/next.config.js` |

El middleware luego envía a `/AR` o `/ES`. La keyword «menú QR restaurante» la absorbe sobre todo `/AR`.

Detalle SEO: [`docs/SEO-LANDINGS.md`](./SEO-LANDINGS.md).

---

## Copy y componentes

| Archivo | Rol |
|---------|-----|
| `frontend/lib/home-landing-copy.ts` | Textos `HOME_LANDING_AR` / `HOME_LANDING_ES` |
| `frontend/components/HomeLanding.tsx` | Layout compartido de la home |
| `frontend/pages/AR/index.tsx` | `region="AR"` |
| `frontend/pages/ES/index.tsx` | `region="ES"` |
| `frontend/pages/index.tsx` | Redirect cliente de respaldo |
| `frontend/middleware.ts` | Redirect geo + cookie |
| `frontend/lib/landing-region.ts` | Cookie, paths, hreflang, hooks |
| `frontend/public/llms.txt` | URLs para crawlers IA |

---

## Auth y país del usuario

En login/registro el backend incluye `registrationCountry` y `declaredCountry` en el objeto `user`. El frontend llama `syncLandingRegionCookieFromUser` para que la próxima visita a `/` respete Argentina si el usuario ya tiene país AR.

---

## Qué no hacer

- No redirigir landings SEO globales **fijas** a `/AR` (rompe precios/copy para no-AR). Preferir `/` + middleware.
- No indexar `/` como home canónica de contenido (redirige; las canónicas son `/AR` y `/ES`).
- No duplicar landings keyword en `/AR/...` y `/ES/...` sin copy realmente distinto.
- No olvidar el cluster `hreflang` bidireccional al agregar inglés u otra región.

---

## Checklist al agregar una región nueva (ej. `/EN`)

1. Copy en `home-landing-copy.ts` + página `pages/EN/index.tsx`.
2. Extender `LandingRegion`, cookie, middleware matcher y `buildLandingHreflangLinks`.
3. Precios: whitelist en `pricing.controller` si hace falta país/moneda nueva.
4. Sitemap + `llms.txt` + este doc + `SEO-LANDINGS.md`.
5. Enlaces: `useLandingHomeHref` / `landingHomePath` deben reconocer el path.
