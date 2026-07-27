# Plan de SEO — SFCC Architect Challenge

> Estrategia y ejecución orientadas a posicionar la web como **test interactivo para repasar conceptos de SFCC** (Salesforce B2C Commerce Cloud), dirigida a **desarrolladores y arquitectos**.

## 1. Objetivos de posicionamiento

| Objetivo | Métrica objetivo |
|---|---|
| Aparecer en top 10 para "test SFCC" / "examen SFCC" | Top 10 en Google.es (ES) y Google.com (EN) |
| Captar tráfico long-tail de devs/arquitectos en preparación | 200+ visitas orgánicas/mes tras 6 meses |
| Conseguir rich snippets de `Quiz` y `FAQPage` | Aparición en SERP con estrellas y acordeón |
| Reducir bounce rate en landing | < 45 % |

## 2. Buyer persona y search intent

| Persona | Intención de búsqueda | Query típica |
|---|---|---|
| Dev SFCC junior | Repasar fundamentos antes de una entrevista | "preguntas entrevista SFCC", "test SFCC" |
| Tech lead SFCC | Validar su equipo antes de una migración | "SFCC B2C Commerce test", "SFRA quiz" |
| Arquitecto | Repasar antes de una discovery o un RFI | "OCAPI vs SCAPI", "PWA Kit architecture" |
| Candidato a certificación | Practicar antes del examen oficial | "SFCC certification practice", "B2C Commerce mock test" |

Long-tail prioritarios (ES/EN):
- `preguntas entrevista SFCC senior`
- `test SFCC B2C Commerce arquitecto`
- `quiz SFRA controller middleware`
- `OCAPI vs SCAPI diferencias`
- `SLAS public vs private client`
- `PWA Kit managed runtime test`
- `preparar certificación SFCC B2C`
- `Salesforce Commerce Cloud interview questions`
- `SFCC architect challenge`

## 3. SEO técnico (on-page)

### 3.1 `<head>` optimizado
- `<title>` con keyword principal + modificador (≤ 60 chars)
- `<meta name="description">` con beneficio, prueba social implícita, CTA (≤ 160 chars)
- `<meta name="keywords">` con long-tails principales
- `<link rel="canonical">` con URL absoluta
- `<link rel="alternate" hreflang="es">` y `hreflang="en"` + `x-default`
- Open Graph completo: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:locale`
- Twitter Cards: `summary_large_image` con `twitter:title/description/image`
- `<meta name="robots" content="index, follow, max-image-preview:large">`
- `<meta name="theme-color">` (mobile)

### 3.2 Datos estructurados (JSON-LD)
- **`Quiz`** → posiciona la página como quiz interactivo, eligible para rich snippet.
- **`WebApplication`** → nombre, autor, navegador, SO, pricing.
- **`FAQPage`** → 8-10 preguntas con `Question`/`Answer` que cubren long-tails.
- **`Organization`** → branding, logo, mismos enlaces.
- **`BreadcrumbList`** → ayuda al crawler a entender la estructura.
- **`ItemList`** con los bloques temáticos como `ListItem` (categorías del quiz).

### 3.3 Performance y Core Web Vitals
- CSS inline crítico para FCP < 1.5 s
- Preconnect a Google Fonts
- Lazy load de secciones no críticas (`loading="lazy"` en iframes)
- PWA manifest → instalable, FCP aún más rápido en segunda visita
- Tamaño bundle actual: < 110 KB JS + < 16 KB CSS → excelente

### 3.4 Indexación
- `robots.txt` permite todo + apunta a sitemap
- `sitemap.xml` con hreflang ES/EN
- Sin canonicalización incorrecta
- 404, 500 y redirects correctos (no orphans)

## 4. SEO de contenido (en página)

### 4.1 Hero reescrito
Encima del quiz, copy con keywords principales:
- H1: "SFCC Architect Challenge: test SFCC con 180+ preguntas"
- Subtítulo con palabras clave: SFRA, OCAPI, SCAPI, SLAS, PWA Kit
- Trust signals: "Diseñado por un senior SFCC", "Basado en documentación oficial"

### 4.2 Sección "Temas cubiertos"
Lista de los 27 bloques del quiz, cada uno con anchor link. Esto:
- Da cobertura de long-tail keywords (cada bloque es un mini-cluster)
- Genera enlazado interno fuerte
- Permite a Google ver la profundidad del sitio

### 4.3 Sección "Cómo usar el test SFCC"
3-4 párrafos explicando:
1. Selecciona un bloque temático o el modo "examen global"
2. Responde preguntas, ve explicación tras cada respuesta
3. Usa "repaso de fallos" para reforzar conceptos
4. Marca preguntas para revisitar después

### 4.4 FAQ (colapsable, structured data)
10 preguntas, cada una con `Question`/`Answer` JSON-LD. Ejemplos:
- ¿Qué es SFCC Architect Challenge?
- ¿Cuántas preguntas tiene el test?
- ¿Qué temas cubre SFCC?
- ¿SFRA vs SiteGenesis?
- ¿OCAPI vs SCAPI?
- ¿Qué es SLAS y cómo se usa?
- ¿Cómo preparo una entrevista SFCC senior?
- ¿Es un simulacro del examen oficial de Salesforce?
- ¿Qué nivel de dificultad tiene?
- ¿Puedo usarlo gratis?

### 4.5 Footer
- Links a docs oficiales de SFCC
- Anchor al quiz
- Idioma switcher ya implementado
- Copyright + última fecha de actualización

## 5. Estrategia de palabras clave

| Keyword (ES) | Volumen estimado | Dificultad | Prioridad |
|---|---|---|---|
| `test SFCC` | 50-100 | Baja | Alta |
| `examen SFCC` | 50-100 | Baja | Alta |
| `preguntas entrevista SFCC` | 30-80 | Media | Alta |
| `preparar entrevista SFCC` | 20-50 | Media | Alta |
| `SFRA controller` | 10-30 | Baja | Media |
| `OCAPI SCAPI diferencias` | 50-100 | Baja | Media |
| `PWA Kit SFCC` | 20-50 | Baja | Media |
| `SLAS SFCC` | 10-30 | Baja | Media |
| `quiz SFCC B2C` | 20-50 | Baja | Media |
| `B2C Commerce architect` | 20-50 | Media | Media |

| Keyword (EN) | Volumen estimado | Dificultad | Prioridad |
|---|---|---|---|
| `SFCC interview questions` | 100-300 | Media | Alta |
| `Salesforce Commerce Cloud quiz` | 50-100 | Baja | Alta |
| `SFCC B2C Commerce practice test` | 30-80 | Baja | Alta |
| `SFRA controller questions` | 10-30 | Baja | Media |
| `OCAPI vs SCAPI` | 100-300 | Media | Alta |
| `PWA Kit interview` | 30-80 | Baja | Media |
| `SLAS authentication` | 20-50 | Media | Media |
| `B2C Commerce architect interview` | 20-50 | Media | Media |

## 6. Estrategia de enlazado

- **Interno:** cada bloque temático enlaza a la documentación oficial relevante en `developer.salesforce.com/docs/commerce`.
- **Externo (link building natural):**
  - Trailhead (`trailhead.salesforce.com`)
  - Documentación oficial de SFRA
  - Repositorio oficial `SalesforceCommerceCloud/pwa-kit`
- **Social signals:** enlaces a discusiones de SFCC en Stack Overflow, Reddit, etc. (cuando proceda)

## 7. Métricas y monitorización

- **Google Search Console**: indexación, CTR, posiciones
- **PageSpeed Insights**: Core Web Vitals (LCP, FID, CLS)
- **Schema Markup Validator**: rich snippets
- **Google Analytics 4** (opcional): engagement

## 8. Roadmap de implementación

| Fase | Acción | Estado |
|---|---|---|
| 1 | `<head>` completo (title, description, OG, Twitter, canonical, hreflang) | En esta entrega |
| 2 | JSON-LD (Quiz, WebApplication, FAQPage, Organization, BreadcrumbList) | En esta entrega |
| 3 | FAQ colapsable + about + topics (visible y crawlable) | En esta entrega |
| 4 | `robots.txt`, `sitemap.xml`, `manifest.json`, `favicon.svg` | En esta entrega |
| 5 | Estilos para las nuevas secciones | En esta entrega |
| 6 | Validar con Schema.org Validator y PageSpeed | Pendiente (manual) |

## 9. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Thin content si solo hay quiz | Añadir FAQ + topics + about → depth real |
| Contenido duplicado entre ES/EN | hreflang correcto, contenido paralelo, no copia idéntica |
| SPA con poco HTML rastreable | Mantener todas las secciones en el HTML inicial (SSR-friendly) |
| Poca autoridad de dominio | Construir backlinks a documentación oficial y blogs SFCC |
| Traducción de preguntas a EN pendiente | i18n actual solo cubre UI; las preguntas permanecen en ES con terminología técnica bilingüe (ya traducida en iteración previa) |
