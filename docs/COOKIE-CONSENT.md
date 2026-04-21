# Consentimiento de cookies y Google Tag Manager

Entorno local: variables `NEXT_PUBLIC_*` del front → `frontend/.env.example` y [ENV-LOCAL.md](./ENV-LOCAL.md).

Este documento describe el **banner único de cookies** del frontend Next.js y cómo interactúa con **Google Tag Manager (GTM)**.

## Objetivo

- Un solo flujo para todos los visitantes: barra fija minimalista con decisión explícita.
- **GTM y scripts asociados no se cargan** hasta que el usuario pulse **Aceptar** (cookies no esenciales / medición).
- La opción **Solo necesarias** guarda la preferencia y **no inyecta GTM**.

## Archivos relevantes

| Archivo | Rol |
|--------|-----|
| `frontend/components/CookieConsentRoot.tsx` | Lógica de consentimiento, `localStorage`, carga condicional de GTM (`next/script`). |
| `frontend/styles/cookie-consent.css` | Estilos del banner. |
| `frontend/pages/_app.tsx` | Monta `<CookieConsentRoot />` en toda la app e importa el CSS. |
| `frontend/pages/_document.tsx` | **No** incluye GTM; evita carga previa al consentimiento. |
| `frontend/pages/legal/politica-de-cookies.tsx` | Política enlazada desde el banner. |
| `frontend/pages/legal/politica-de-privacidad.tsx` | Privacidad enlazada desde el banner. |

## Clave de almacenamiento

- **Clave:** `menuqr-cookie-consent`
- **Valores:**
  - `essential` — el usuario eligió solo cookies necesarias; GTM no se carga.
  - `all` — el usuario aceptó el uso descrito (incl. medición vía GTM cuando el entorno lo permite).

La decisión persiste en `localStorage` del navegador.

## Variables de entorno (prefijo `NEXT_PUBLIC_`)

Definidas en el **build** del frontend (Next.js).

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_GTM_CONTAINER_ID` | ID del contenedor GTM (ej. `GTM-XXXX`). Si no se define, se usa el valor por defecto del código (solo conviene sobrescribirlo en despliegues propios). |
| `NEXT_PUBLIC_GTM_DEV` | Si es `true`, en **desarrollo** (`NODE_ENV=development`) también se permite cargar GTM tras **Aceptar**. Por defecto en dev GTM no se ofrece salvo que esta variable esté activa. |
| `NEXT_PUBLIC_GTM_DISABLED` | Si es `true`, **no** se carga GTM aunque el usuario pulse Aceptar (útil para entornos de prueba sin analítica). |

Condición resumida para **intentar** cargar GTM tras consentimiento `all`:

- `NEXT_PUBLIC_GTM_DISABLED` ≠ `true`, y
- `NODE_ENV === 'production'` **o** `NEXT_PUBLIC_GTM_DEV === 'true'`.

## Flujo de usuario

1. Primera visita (sin clave en `localStorage`): se muestra el banner.
2. **Solo necesarias** → se guarda `essential`, el banner desaparece, GTM no se monta.
3. **Aceptar** → se guarda `all`, el banner desaparece; si las reglas de entorno lo permiten, se inyecta el script de GTM (`afterInteractive`) y el `noscript` de respaldo.

## Pruebas locales

- **Ver de nuevo el banner:** borrar la entrada `menuqr-cookie-consent` en las herramientas de desarrollo (Application → Local Storage) o usar una ventana privada.
- **Probar GTM en desarrollo:** definir `NEXT_PUBLIC_GTM_DEV=true` en el `.env` del frontend, reiniciar `next dev`, aceptar cookies.

## Nota legal

La implementación técnica retrasa la carga de GTM hasta el consentimiento **Aceptar**. Los textos legales publicados (política de cookies y de privacidad) deben permanecer alineados con las cookies y proveedores reales que configure el contenedor GTM. Revisión jurídica recomendable para mercados con normativa específica (UE, EE. UU., etc.).

## Export para otros módulos

Si en el futuro se necesita leer la preferencia desde otro componente cliente:

```ts
import {
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
} from '../components/CookieConsentRoot';
```

(`CookieConsentChoice` es `'all' | 'essential'`.)
