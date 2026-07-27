# SFCC Architect Challenge

Test interactivo con **190+ preguntas** sobre Salesforce B2C Commerce (Demandware). Cubre SFRA, OCAPI, SCAPI, SLAS, PWA Kit, catálogo, checkout, promociones, persistencia, SRE y migraciones. Diseñado para desarrolladores y arquitectos SFCC que se preparan para entrevistas, certificaciones o migraciones SiteGenesis → SFRA.

## Características

- **190+ preguntas** distribuidas en 27 bloques temáticos con 4 niveles de dificultad
- **4 modos de práctica**: formación (con explicación inmediata), repaso de fallos, marcadores y examen global (20 preguntas aleatorias)
- **i18n integrado**: interfaz en español e inglés con detección automática del navegador
- **Modo oscuro**: tema claro/oscuro con persistencia en `localStorage` y detección de preferencia del sistema
- **Preguntas balanceadas**: distribución de respuestas ~25% por posición (A/B/C/D)
- **Estadísticas**: seguimiento de aciertos, fallos, racha y progreso por bloque
- **PWA**: instalable como aplicación, funciona offline (caché de assets)
- **SEO**: meta tags, Open Graph, JSON-LD (WebApplication, FAQPage, BreadcrumbList, ItemList, Organization), sitemap, robots.txt, hreflang ES/EN

## Temas cubiertos

| Bloque | Área |
|---|---|
| 1 | Plataforma y modelo mental SaaS multi-tenant |
| 2 | SFRA, cartridges, hooks, module.superModule |
| 3 | OCAPI: endpoints, scopes, rate limits, RFC 7807 |
| 4 | SCAPI: Shopper API, custom endpoints, diferencia con OCAPI |
| 5 | SLAS: OAuth 2.1, PKCE, session bridge, Hybrid Auth |
| 6 | PWA Kit: Retail React App, SSR, Managed Runtime, template extensibility |
| 7–8 | Catálogo, price books, customer groups |
| 9–10 | Promociones, source codes, exclusion sets |
| 11–14 | Checkout, pagos, webhooks, RMAs, devoluciones |
| 15–17 | Custom Objects, System Objects, Transaction.wrap, búsqueda |
| 18–19 | SRE, SLO/SLI, postmortems, incident response |
| 20–23 | SiteGenesis → SFRA, OCAPI hooks → custom endpoints, regresión |
| 24–27 | Temas avanzados: CI/CD, SEO técnico, performance, patrones de integración |

## Tecnología

- HTML + CSS plano (sin frameworks ni dependencias)
- JavaScript vanilla (sin bundlers, sin npm)
- Variables CSS para theming claro/oscuro
- i18n con atributos `data-i18n` y `data-i18n-html`
- PWA via Service Worker (cache-first)
- SVG favicon, manifest.webmanifest

## Cómo usar

Abre `index.html` directamente en el navegador (soporta protocolo `file://`).

No requiere servidor ni instalación de dependencias.

## Modos de práctica

| Modo | Descripción |
|---|---|
| **Formación** | Recorre las preguntas de un bloque viendo la explicación tras cada respuesta. Ideal para estudio. |
| **Repaso de fallos** | Solo las preguntas que has fallado anteriormente. |
| **Marcadores** | Preguntas que marcaste manualmente para revisar después. |
| **Examen global** | 20 preguntas aleatorias de todos los bloques, con filtro opcional de dificultad. |

## Preguntas

Cada pregunta incluye:
- Enunciado en español con terminología técnica en inglés
- 4 opciones de respuesta (orden aleatorio en cada render)
- Explicación detallada de por qué es correcta
- Dificultad asignada (1: básico, 2: intermedio, 3: avanzado)
- Bloque temático de pertenencia

## Temas planificados

- Customer Insights / CDP
- Einstein AI / Recomendaciones
- Self-Service Commerce / Order Management
- Content Assets / Content Slots / Page Designer avanzado
- A/B testing con Optimization
- Federated Search y catálogos headless
- B2B Commerce (organizations, role-based pricing)

## Contribuir

Las preguntas se definen en `app.js` mediante la función helper `q()`:

```js
q("enunciado", ["opción A", "opción B", "opción C", "opción D"], índiceCorrecto, "explicación", dificultad)
```

Para aportar preguntas nuevas, envía un PR o abre un issue.

## Licencia

MIT
