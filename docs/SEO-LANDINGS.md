# Arquitectura SEO — Landings temáticas AppMenuQR

## Objetivo

Posicionar intenciones de búsqueda distintas sin canibalizar la homepage (`/`) ni duplicar contenido. Cada URL es una **landing independiente** con H1, estructura H2/H3, metadata y copy propios.

## Estructura de URLs (SEO friendly)

| URL | Keyword principal | Intención |
|-----|-------------------|-----------|
| `/` | carta digital restaurante qr (pilar) | Marca + producto general |
| `/carta-digital-restaurante-qr` | carta digital restaurante qr | Profesional / gestión / QR mesas / tiempo real |
| `/menu-qr-restaurante` | menú qr restaurante | Creación rápida / móvil / experiencia cliente |
| `/software-carta-digital-restaurante` | software carta digital restaurante | SaaS B2B / panel / escalabilidad |

**Convención:** slugs en minúsculas, guiones, sin stop words innecesarias, alineados con la query principal.

## Estrategia de keywords por landing

### 1. `/carta-digital-restaurante-qr`

- **Principal:** carta digital restaurante qr  
- **Secundarias:** carta digital para restaurantes, carta qr restaurante, código qr menú restaurante  
- **Distribución:** principal en H1, title y primer párrafo; secundarias en H3, bullets y FAQ (1 mención natural cada una).  
- **Evitar:** repetir “menú qr” como foco (reservado a landing 2).

### 2. `/menu-qr-restaurante`

- **Principal:** menú qr restaurante  
- **Secundarias:** qr menú restaurante, menú digital restaurante, crear menú qr  
- **Distribución:** principal en H1/title; “crear menú qr” en pasos y FAQ; “menú digital” en cuerpo.  
- **Evitar:** posicionar como “software” (landing 3).

### 3. `/software-carta-digital-restaurante`

- **Principal:** software carta digital restaurante  
- **Secundarias:** app carta digital restaurante, plataforma menú qr, sistema de carta digital  
- **Distribución:** principal en H1/title; secundarias en features y bullets del detalle.  
- **Evitar:** CTA tipo “en 5 minutos” como eje (eso es landing 2).

## Canonical strategy

- Cada landing declara **canonical a sí misma** (`NEXT_PUBLIC_APP_URL` + path).  
- La homepage **no** canonicaliza a las landings ni al revés.  
- No usar `noindex` en landings indexables.  
- Contenido duplicado entre landings: **prohibido** — solo enlaces contextuales en “Recursos relacionados”.

## Headings por página (resumen)

### `/carta-digital-restaurante-qr`

- H1: Carta digital restaurante QR para tu local  
- H2: Gestión profesional de tu carta digital con QR  
- H3: (4 tarjetas — gestión, QR mesas, tiempo real, platos)  
- H2: Por qué elegir una carta QR restaurante gestionada en la nube  
- H3: Operación diaria más simple  
- H2: Cómo poner en marcha tu carta digital restaurante QR  
- H2: Preguntas frecuentes  

### `/menu-qr-restaurante`

- H1: Menú QR restaurante listo en minutos  
- H2: Crear menú QR sin fricción para tu restaurante  
- H2: Menú digital restaurante pensado para el día a día  
- H2: Pasos para crear tu menú QR restaurante  
- H2: Preguntas frecuentes  

### `/software-carta-digital-restaurante`

- H1: Software carta digital restaurante en la nube  
- H2: Plataforma para operar tu carta digital a escala  
- H2: Sistema de carta digital para negocios gastronómicos  
- H3: Qué resuelve el software frente a soluciones aisladas  
- H2: Preguntas frecuentes  

*(La homepage mantiene su propia jerarquía; ver `frontend/pages/index.tsx`.)*

## Interlinking recomendado

```
                    ┌─────────────┐
                    │  / (home)   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   /carta-digital-   /menu-qr-      /software-carta-
   restaurante-qr   restaurante    digital-restaurante
           │               │               │
           └───────────────┴───────────────┘
                     (enlaces cruzados
                      "Recursos relacionados")
           ┌───────────────┴───────────────┐
           ▼               ▼               ▼
      /precios        /plantillas    /documentacion
```

- **Desde home:** sin bloque de guías (evita ruido en la landing pilar).  
- **Footer (todas las páginas públicas):** segunda fila con las 3 landings (texto = keyword).  
- **En cada landing SEO:** bloque «Recursos» → precios, plantillas, documentación (sin enlazar otras landings SEO).  
- **Anchor text footer:** keyword principal de cada URL.  

## Implementación técnica

| Archivo | Rol |
|---------|-----|
| `frontend/lib/seo-landings-config.ts` | Copy, metadata, FAQ, related links |
| `frontend/components/SeoKeywordLanding.tsx` | Layout y `<Head>` |
| `frontend/pages/{slug}.tsx` | Rutas Next.js |
| `frontend/lib/json-ld-appmenuqr.ts` | `buildSeoLandingJsonLd` |
| `frontend/lib/sitemap-xml.ts` | URLs en sitemap (priority 0.88) |
| `frontend/public/llms.txt` | Mapa para crawlers IA |

## Anti-canibalización

1. Una keyword principal por URL.  
2. Homepage = mensaje de marca amplio; landings = long-tail específico.  
3. No copiar párrafos entre landings; reescribir ángulo.  
4. Máximo 1–2 menciones de la keyword principal por bloque H2.  
5. FAQ distintas por página (schema FAQPage no duplicado).

## Mantenimiento

Al editar copy, modificar solo `seo-landings-config.ts`. Para una cuarta landing: añadir slug a `SEO_LANDING_SLUGS`, config en `SEO_LANDINGS`, página en `pages/`, entrada en sitemap (automática vía slug array) y `llms.txt`.
