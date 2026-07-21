# Arquitectura SEO — Landings temáticas AppMenuQR

## Objetivo

Posicionar intenciones de búsqueda distintas sin canibalizar las homes regionales (`/AR`, `/ES`) ni duplicar contenido. Cada URL indexable es una **landing independiente** con H1, estructura H2/H3, metadata y copy propios.

**Homes geo (middleware, cookie, precios, hreflang, enlaces):** ver [`docs/GEO-LANDING.md`](./GEO-LANDING.md).  
**País en registro / facturación / restaurante:** ver [`backend/docs/GEOLOCATION.md`](../backend/docs/GEOLOCATION.md).

## Homes regionales (geo)

| URL | Mercado | Nota |
|-----|---------|------|
| `/` | — | Redirect al home regional según cookie/geo |
| `/AR` | Argentina (`es-AR`) | Home + precios ARS; absorbe la keyword «menú qr restaurante» |
| `/ES` | España / resto (`es-ES`) | Home + precios GLOBAL (USD) |

**Redirect histórico:** `/menu-qr-restaurante` → `/` (301 en `next.config.js`). El middleware elige `/AR` o `/ES`.

**Regla:** landings de keyword en la **raíz** (sin prefijo `/AR`/`/ES`) salvo que el contenido sea realmente distinto por país. No duplicar por geo “por si acaso”.

## Estructura de URLs SEO (keyword)

| URL | Keyword principal | Intención |
|-----|-------------------|-----------|
| `/carta-digital-restaurante-qr` | carta digital restaurante qr | Profesional / gestión / QR mesas / tiempo real |
| `/software-carta-digital-restaurante` | software carta digital restaurante | SaaS B2B / panel / escalabilidad (`noIndex` si aplica) |

**Convención:** slugs en minúsculas, guiones, sin stop words innecesarias, alineados con la query principal.

## Estrategia de keywords por landing

### 1. `/carta-digital-restaurante-qr`

- **Principal:** carta digital restaurante qr  
- **Secundarias:** carta digital para restaurantes, carta qr restaurante, código qr menú restaurante  
- **Distribución:** principal en H1, title y primer párrafo; secundarias en H3, bullets y FAQ (1 mención natural cada una).  

### 2. `/software-carta-digital-restaurante`

- **Principal:** software carta digital restaurante  
- **Secundarias:** app carta digital restaurante, plataforma menú qr, sistema de carta digital  
- **Distribución:** principal en H1/title; secundarias en features y bullets del detalle.  

## Canonical strategy

- Cada landing declara **canonical a sí misma** (`NEXT_PUBLIC_APP_URL` + path).  
- `/AR` y `/ES` tienen canonical propio + `hreflang` (`es-AR` / `es-ES` / `es` / `x-default`).  
- No usar `noindex` en landings indexables (salvo las marcadas `noIndex` en config).  
- Contenido duplicado entre landings: **prohibido** — solo enlaces contextuales en «Recursos».

## Headings por página (resumen)

### `/carta-digital-restaurante-qr`

- H1: Carta digital restaurante QR para tu local  
- H2: Gestión profesional de tu carta digital con QR  
- H3: (4 tarjetas — gestión, QR mesas, tiempo real, platos)  
- H2: Por qué elegir una carta QR restaurante gestionada en la nube  
- H3: Operación diaria más simple  
- H2: Cómo poner en marcha tu carta digital restaurante QR  
- H2: Preguntas frecuentes  

### `/software-carta-digital-restaurante`

- H1: Software carta digital restaurante en la nube  
- H2: Plataforma para operar tu carta digital a escala  
- H2: Sistema de carta digital para negocios gastronómicos  
- H3: Qué resuelve el software frente a soluciones aisladas  
- H2: Preguntas frecuentes  

*(Homes regionales: ver `frontend/lib/home-landing-copy.ts` y `frontend/components/HomeLanding.tsx`.)*

## Interlinking recomendado

```
              ┌──────── / ────────┐
              │  (geo → /AR|/ES)  │
              └─────────┬─────────┘
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
       /AR            /ES     landings keyword
         │              │              │
         └──────────────┴──────────────┘
              footer + recursos
         ┌──────────────┴──────────────┐
         ▼              ▼              ▼
    /precios*      /plantillas    /documentacion
```

\* `/precios` redirige a `#precios` del home regional (salvo query de upgrade).

- **Footer (páginas públicas):** landings SEO restantes (texto = keyword).  
- **En cada landing SEO:** bloque «Recursos» → precios regionales, plantillas, documentación.  
- **Anchor text footer:** keyword principal de cada URL.  

## Anti-canibalización

1. Una keyword principal por URL.  
2. `/AR` / `/ES` = mensaje de marca + precios regionales; landings = long-tail específico.  
3. No copiar párrafos entre landings; reescribir ángulo.  
4. Máximo 1–2 menciones de la keyword principal por bloque H2.  
5. FAQ distintas por página (schema FAQPage no duplicado).

## Mantenimiento

Al editar copy de landings SEO, modificar solo `seo-landings-config.ts`. Para una nueva landing: añadir slug a `SEO_LANDING_SLUGS`, config en `SEO_LANDINGS`, página en `pages/`, entrada en sitemap (automática vía slug array) y `llms.txt`.

Redirects permanentes: `frontend/next.config.js` → `redirects()`.

Cambios de homes `/AR`/`/ES`, cookie o hreflang: actualizar también [`GEO-LANDING.md`](./GEO-LANDING.md).
