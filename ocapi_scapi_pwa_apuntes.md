# Apuntes: OCAPI, SCAPI (SLAS) y PWA Kit

> Notas de repaso para entrevistas de arquitectura SFCC. Compara la API tradicional (OCAPI) frente a la moderna (SCAPI) y el stack de storefront composable (PWA Kit + Managed Runtime + SLAS).
>
> Fuentes: documentación oficial de Salesforce B2C Commerce, repositorio `SalesforceCommerceCloud/pwa-kit`, `plugin_slas` y `commerce-sdk-react`.

---

## Índice

1. [Visión general del ecosistema de APIs](#1-visión-general-del-ecosistema-de-apis)
2. [OCAPI (Open Commerce API)](#2-ocapi-open-commerce-api)
3. [SCAPI (Shopper / ShopperCustomers / ShopperBaskets)](#3-scapi-shopper--shoppercustomers--shopperbaskets)
4. [SLAS (Shopper Login and API Access Service)](#4-slas-shopper-login-and-api-access-service)
5. [PWA Kit y Managed Runtime](#5-pwa-kit-y-managed-runtime)
6. [Híbridos: Plugin SLAS, Hybrid Auth, eCDN](#6-híbridos-plugin-slas-hybrid-auth-ecdn)
7. [Tabla comparativa OCAPI vs SCAPI](#7-tabla-comparativa-ocapi-vs-scapi)
8. [Checklist de decisión para entrevista](#8-checklist-de-decisión-para-entrevista)

---

## 1. Visión general del ecosistema de APIs

Salesforce B2C Commerce expone tres familias de APIs hacia storefronts y sistemas externos:

| Familia | Audiencia | Autenticación | Estilo | Estado |
|---|---|---|---|---|
| **OCAPI** (Shop / Data / Meta) | Cliente server-side o agente | JWT u OAuth 2.0 | REST + JSON | Soportado (legacy) |
| **SCAPI** (Shopper APIs) | Cliente JS / mobile / BFF | SLAS access token (JWT) | REST + JSON, OpenAPI 3 | **Recomendado** |
| **SLAS** | Cualquier shopper context | OAuth 2.1 (public + private) | `/oauth2/*` + JWKS | Servicio de identidad |

Puntos clave:

- **OCAPI está marcada como "deprecated"** en la documentación para flujos de storefront. SCAPI es la sucesora.
- SCAPI **no es 1:1 con OCAPI**: la forma de los payloads, los scopes y el modelo de autenticación difieren.
- SLAS es el **único** mecanismo válido para autenticarse contra SCAPI (no vale un JWT de Business Manager).
- Algunas capacidades (ej. `hooks` de extensibilidad OCAPI) **no existen en SCAPI**; en SCAPI la extensibilidad va por `custom endpoints`.

---

## 2. OCAPI (Open Commerce API)

API tradicional, basada en REST, dividida en tres sub-APIs.

### 2.1 Sub-APIs

| Sub-API | Uso típico | Auth |
|---|---|---|
| **Shop API** | Cliente que actúa como shopper o como agente | JWT de cliente (header `Authorization: Bearer`) u OAuth 2.0 |
| **Data API** | CRUD sobre recursos (catálogo, clientes, contenido, cupones, jobs) | OAuth 2.0 contra un usuario de Business Manager |
| **Meta API** | Auto-descubrimiento de documentos y recursos | Igual que la sub-API que la use |

### 2.2 Formato de URL

```
https://{shortCode}.api.commercecloud.salesforce.com/cc/shop/v1/{resource}
https://{shortCode}.api.commercecloud.salesforce.com/dw/shop/v23.2/{resource}  ; client_id=...
```

- **shortCode**: identificador único del realm (visible en Account Manager).
- **client_id**: obligatorio en cada request, se configura en Account Manager.
- **Versión**: el segmento `v1`, `v2`, `v23.2` etc. es la versión de la API que se quiere usar.

### 2.3 Autenticación

- **Shopper (Shop API)**: se intercambia un JWT de cliente por credenciales shopper. Se usa cuando la lógica del carrito la hace el cliente del lado servidor.
- **Agente (Shop API acting on behalf)**: OAuth 2.0 contra un usuario Business Manager.
- **Data API**: OAuth 2.0 client_credentials contra un usuario BM con scopes específicos (por ejemplo `SALESFORCE_COMMERCE_API:1234:data:rw`).

### 2.4 Configuración (Open Commerce API Settings)

En Business Manager: **Administration → Site Development → Open Commerce API Settings**

- **Global** (`dw.json` no toca): permite definir qué client IDs tienen acceso a qué recursos para todos los sites.
- **Site-specific**: sobreescribe la global para un site concreto.

Reglas típicas:
- Limitar los client IDs por site.
- Restringir el acceso a recursos sensibles (PII, customer lists, etc.).
- Definir scopes efectivos (lectura/escritura por recurso).

### 2.5 Hooks OCAPI

Permiten ejecutar Script API antes o después de operaciones OCAPI concretas. Útiles para personalizar comportamiento sin tocar el backend, pero **añaden coupling con la plataforma**.

- **Pros**: rápidos para extender, sin redeploy.
- **Contras**: difíciles de testear, pueden romperse en upgrades, el catálogo de hooks disponibles es limitado.

### 2.6 Limitaciones prácticas

- Payload máximo (~25 MB en la mayoría de endpoints).
- Cuotas por tenant.
- Diseñada originalmente para **render server-side**; no pensada para mobile o BFF.
- Los hooks son extensibilidad legacy; en SCAPI la extensibilidad es por **custom endpoints** en cartuchos.

---

## 3. SCAPI (Shopper / ShopperCustomers / ShopperBaskets)

API moderna, basada en REST, con definición OpenAPI 3. Sustituye a OCAPI para flujos de storefront.

### 3.1 Estructura

SCAPI está organizada por dominios (`Shopper*`). Algunos ejemplos:

| API | Propósito |
|---|---|
| `Shopper Products` | Búsqueda, detalle, variantes, inventario, recomendaciones |
| `Shopper Baskets` | Carrito: items, shipments, payment instruments, coupones |
| `Shopper Customers` | Cuenta del shopper: profile, address book, payment methods, lists |
| `Shopper Orders` | Historial y creación de pedidos desde el basket |
| `Shopper Search` | Búsqueda con filtros, facets, paginación |
| `Shopper Gift Certificates` | Gift cards |
| `Shopper Promotions` | Promociones aplicables al carrito |
| `Shopper Context` | Contexto del shopper (site, locale, currency, dsfs) |
| `Shopper Product Lists` | Wishlists |

URL base:

```
https://{shortCode}.api.commercecloud.salesforce.com/scapi/v1/{api}/{resource}
```

- **`{api}`**: nombre del API (`products`, `baskets`, `customers`, etc.).
- **Versión**: `v1` actualmente.

### 3.2 Diferencias estructurales con OCAPI

| Aspecto | OCAPI | SCAPI |
|---|---|---|
| Paths | `dw/shop/...`, `cc/shop/...` | `scapi/v1/...` |
| Identificador de site | `site_id` en path | `siteId` en query param |
| Currency/Locale | en path o context | en headers (`x-currency`, `accept-language`) |
| Paginación | `count`, `start` | `count`, `offset` (más consistente entre APIs) |
| Errores | `fault` con `type`, `message`, `arguments` | `type`, `title`, `detail`, `problem` (RFC 7807 problem+json) |
| Custom attributes | `c_<name>` | `c_<name>` (igual) |
| Extensibilidad | Hooks OCAPI | Custom endpoints en un cartridge + header `x-mobify` |
| ID generation | `resource/{id}` con `ResourceID` | `id` plano en JSON |

### 3.3 Errores (RFC 7807)

SCAPI devuelve `application/problem+json`:

```json
{
  "type": "https://api.commercecloud.salesforce.com/documentation/error/v1/bad-request",
  "title": "Bad Request",
  "detail": "Invalid basket id",
  "problem": "invalid-basket-id"
}
```

- `type`: URI identificando la familia de error.
- `title`: nombre legible.
- `detail`: mensaje específico.
- `problem`: código máquina-legible.

### 3.4 Endpoints clave (ejemplos)

- `GET  /scapi/v1/products/{id}` — detalle de producto.
- `POST /scapi/v1/baskets` — crear basket.
- `POST /scapi/v1/baskets/{basketId}/items` — añadir item al basket.
- `GET  /scapi/v1/customers/{customerId}` — datos del customer.
- `POST /scapi/v1/orders` — convertir basket en order.
- `GET  /scapi/v1/search/shopper-search` — búsqueda con facets.

### 3.5 Headers típicos

| Header | Uso |
|---|---|
| `Authorization: Bearer <access_token>` | Token SLAS para endpoints autenticados |
| `x-currency: USD` | Moneda del contexto |
| `x-mobify: true` | Indica que la llamada viene de un BFF / PWA Kit (habilita ciertas optimizaciones y custom endpoints) |
| `x-correlation-id` | Para correlación de logs extremo a extremo |

### 3.6 Custom endpoints (extensibilidad SCAPI)

A diferencia de los hooks OCAPI, SCAPI se extiende mediante **custom endpoints** definidos en un cartridge:

```javascript
// en el cartridge custom_ext
const server = require('server');

server.get('CustomProducts', function (req, res, next) {
    res.json({
        products: [...customData]
    });
    return next();
});

module.exports = server.exports();
```

- Se accede vía `/scapi/v1/custom/{apiName}/{resource}`.
- Solo disponibles si la llamada lleva `x-mobify: true`.
- Requieren configuración en el **SLAS private client** (scopes adicionales).

### 3.7 SLAS Private Client en SCAPI

- Los endpoints SCAPI **requieren token SLAS** en casi todos los casos (incluso lectura pública usa guest token).
- El SLAS private client permite que el BFF haga llamadas con un **client secret** en lugar del flujo PKCE.
- **Recomendado para producción**: usar private client + BFF/PWA Kit (el secret nunca sale del server).

---

## 4. SLAS (Shopper Login and API Access Service)

Servicio de identidad y autorización para SCAPI y OCAPI shopper. Basado en **OAuth 2.1**.

### 4.1 Tipos de clientes

| Tipo | Cuándo usarlo | Características |
|---|---|---|
| **Public client** | SPAs, mobile apps sin BFF | Usa `authorization_code + PKCE`, **sin client secret** (no se puede confiar) |
| **Private client** | Apps full-stack o cualquier app con BFF | Guarda `client secret` en server, soporta varios grant types |

### 4.2 Endpoints clave

| Endpoint | Grant Type | Uso |
|---|---|---|
| `/oauth2/authorize` | (intermediario) | Devuelve code tras login (público) |
| `/oauth2/login` | n/a | Login B2C directo con Basic auth (credenciales SFCC) |
| `/oauth2/token` | varios | Intercambia code/refresh por access token |
| `/oauth2/jwks` | n/a | Claves públicas para verificar la firma JWT |
| `/oauth2/sessions/bridge` | session_bridge | Une sesiones SFRA (dwsid) con sesiones SLAS (en híbrido) |
| `/admin/v1/clients` | client_credentials | SLAS Admin API: gestión de clientes |

### 4.3 Tokens

- **Access token**: JWT, expira a los **30 minutos**.
- **Refresh token**:
  - Producción: **90 días** (registered), **30 días** (guest).
  - No-producción: **9 días**.
  - **Single-use** en public clients; multi-use en private.
- **JWT claims principales**:
  - `iss`: URL del issuer (mismo que `jku`).
  - `kid`: id de la clave pública.
  - `sub`: `{client_id}.{tenant_id}.{usid}`.
  - `scp`: scopes.
  - `isb`: shopper info block (IDP origin, guest/registered id, channel_id).
  - `dnt`: Do Not Track flag.

### 4.4 Flujos

#### 4.4.1 Guest (público)
```
GET /oauth2/authorize?hint=guest&response_type=code&client_id=...&code_challenge=...&redirect_uri=...
GET /oauth2/token?grant_type=authorization_code_pkce&code_verifier=...&code=...&client_id=...&redirect_uri=...
```

#### 4.4.2 Registered B2C login (público)
```
GET /oauth2/login (Basic auth: shopperId:password)
        + code_challenge + usid + channel_id + client_id + redirect_uri
GET /oauth2/token?grant_type=authorization_code_pkce
```

#### 4.4.3 Guest (privado, recomendado para BFF)
```
POST /oauth2/token
     Authorization: Basic <clientId:clientSecret>
     grant_type=client_credentials&channel_id=...
```

#### 4.4.4 Hybrid Auth (session bridge)
```
POST /oauth2/sessions/bridge
     - Une sesión SFRA existente (dwsid) con un token SLAS
     - Habilita coexistencia SFRA + PWA Kit
```

### 4.5 Parámetro `channel_id` (importante)

- Obligatorio para guest token requests con `client_credentials` o `authorization_code_pkce` (enforced desde 25/03/2025 para prod).
- Representa el **site** (no el realm).
- Tokens SLAS shopper de Site A **no se pueden usar** para llamar a SCAPI/OCAPI de Site B.

### 4.6 Limitación de rate y protección

- Rate limit por USID/endpoint (devuelve 409 si se abusa).
- SLAS multi-tenant: prioriza producción sobre no-prod (diferencias entre PRD y non-PRD que se irán resolviendo).
- Hard cap: **30 custom object scopes** como máximo en SLAS.

### 4.7 Errores SLAS

- `400 invalid_request` — parámetros faltantes o mal formados.
- `401 invalid_client` — client_id/secret incorrectos.
- `409` — rate limit (mismo USID+endpoint en poco tiempo).
- `5xx` — consultar SLAS logs en Log Center (filtrable por `httpStatus` y `Service Type: SLAS logs`).

---

## 5. PWA Kit y Managed Runtime

Stack oficial para construir storefronts composables sobre B2C Commerce.

### 5.1 Componentes

| Componente | Rol |
|---|---|
| **PWA Kit** | Framework open-source (monorepo) con React + SSR |
| **Retail React App** | Template oficial con PDP, PLP, cart, checkout, account |
| **pwa-kit-react-sdk** | SSR, routing, caching pipeline |
| **pwa-kit-runtime** | Node.js runtime para correr el bundle en Managed Runtime |
| **pwa-kit-dev** | CLI: `start`, `build`, `push`, `lint`, `format` |
| **commerce-sdk-react** | Hooks React Query sobre SCAPI (`useProduct`, `useBasket`, etc.) |
| **commerce-sdk-isomorphic** | Cliente SCAPI isomorphic (server + browser) |
| **Managed Runtime (MRT)** | Hosting serverless + CDN para los bundles |

### 5.2 Retail React App (template)

- Versión actual: `10.2.0-dev` (paquete `@salesforce/retail-react-app`).
- Stack: React 18, Chakra UI, React Router 5, React Hook Form, TanStack Query, MSW para mocks, Helmet para SEO.
- Bundle budgets (`bundlesize`):
  - `main.js` ≤ 103 kB
  - `vendor.js` ≤ 400 kB
- Comandos clave:
  ```bash
  npm start                     # dev local con SSR
  npm run build                 # bundle de producción
  npm run push                  # push del bundle a MRT
  pwa-kit-dev tail-logs         # logs en vivo de MRT
  ```

### 5.3 Managed Runtime (MRT)

- Hosting **serverless** sobre Node.js.
- CDN integrado con caché configurable.
- **TTL por defecto del page cache: 600 s** (10 min).
- `getProps` de cada page puede sobreescribir `Cache-Control` (`res.setHeader('Cache-Control', 'max-age=900, s-maxage=900')`).
- Para cambios dinámicos renderiza en server; para contenido estable sirve desde CDN.
- Query string filtering vía **request processor** (`app/request-processor.js`): modifica la URL antes del lookup de caché (ej. quitar `utm_*`, `gclid`).

### 5.4 Caching strategy

| Tipo de página | TTL recomendado | Razón |
|---|---|---|
| Home | 300-600 s | Cambia con campañas |
| PLP | 300-600 s | Stock, precio y facets cambian |
| PDP | 600-3600 s | Estable si precio/inventario se sirven vía remote include |
| Carrito | 0 (no cachear) | Datos personales y dinámicos |
| Checkout / Account | 0 (no cachear) | Datos sensibles |
| Contenido estático (CMS) | 3600-86400 s | Lo más cacheable |

Técnica clave: **render condicional** — el shell cacheable se sirve en SSR y los fragmentos personalizados (minicart, wishlist) se hidratan en cliente.

### 5.5 commerce-sdk-react (hooks clave)

```javascript
import { useProduct, useBasket, useShopperBasketsMutation } from '@salesforce/commerce-sdk-react';

// Query
const { data: product, isLoading } = useProduct({
  parameters: { id: '25592770M', locale: 'en-US' }
});

// Mutation
const addItemToBasket = useShopperBasketsMutation('addItemToBasket');
addItemToBasket.mutate({ parameters: { basketId }, body: { productId, quantity: 1 } });
```

Categorías:
- **Query hooks**: corresponden a GET endpoints (`useProduct`, `useBasket`, `useCustomer`).
- **Mutation hooks**: corresponden a POST/PUT/PATCH/DELETE.
- **Utilidades**: `useCommerceApi`, `useAccessToken`, `useCustomerId`, `useCustomerType`, `useUsid`.

### 5.6 PWA Kit y la `CommerceApiProvider`

```javascript
<CommerceApiProvider
  clientId="..."
  organizationId="..."
  proxy="/mobify/proxy/api"        // proxy local en dev
  redirectURI="..."
  siteId="..."
  shortCode="..."
  locale="en-US"
  currency="USD"
  headers={{ 'correlation-id': '...' }}
  enablePWAKitPrivateClient={true}  // recomendado en producción
>
  {children}
</CommerceApiProvider>
```

- `enablePWAKitPrivateClient`: usa el flujo private client (más seguro, recomendado en PWA Kit 3.5+).
- `disableAuthInit`: si true, evita la inicialización automática de SLAS (útil en templates legacy con SSR manual).

### 5.7 Request processor (mejorar cache hit ratio)

```javascript
// app/request-processor.js
export const processRequest = (request) => {
  const params = new URLSearchParams(request.queryString);
  params.delete('utm_source');
  params.delete('utm_medium');
  params.delete('gclid');
  return { ...request, queryString: params.toString() };
};
```

- El request processor corre en el **edge** antes del lookup de caché.
- Permite mapear URLs similares a la misma respuesta cacheada.
- Cuidado: no filtrar parámetros que la página necesita para renderizar.

### 5.8 Custom endpoints vía PWA Kit

- Configurar SLAS private client con scopes `sfcc.shopper-custom-objects` o equivalentes.
- Añadir header `x-mobify: true` en las llamadas.
- Implementar endpoints en un cartridge con `server.get('CustomName', ...)`.
- Cuidar la **performance** (latencia añadida en cada request).

---

## 6. Híbridos: Plugin SLAS, Hybrid Auth, eCDN

Cuando SFRA y PWA Kit coexisten (rollout por fases), se necesitan componentes puente.

### 6.1 Plugin SLAS (legacy, hasta v23.x)

- Cartridge `plugin_slas` que añade los endpoints SLAS sobre SFRA.
- Habilita session bridging entre SFRA (dwsid) y SLAS (access token).
- A partir de **25.3** se reemplaza por **Hybrid Auth**.

### 6.2 Hybrid Auth (>= 25.3)

- Solución soportada para coexistencia SFRA + PWA Kit.
- Mantiene cookies sincronizadas y sesión unificada.
- A diferencia de Plugin SLAS, no requiere un cartridge específico.

### 6.3 Cookies clave (hybrid)

| Cookie | Significado | Uso |
|---|---|---|
| `dwsid` | Sesión SFCC clásica | Tracking + sesión SFRA |
| `cc-nx` | Refresh token SLAS (registered) | Renovación de access token |
| `cc-nx-g` | Refresh token SLAS (guest) | Renovación de access token para invitados |
| `token` | Access token SLAS | Llamadas SCAPI/OCAPI shopper |
| `cc-at_{siteId}` | Access token compartido SFRA↔PWA Kit | Bridge entre arquitecturas |

### 6.4 Session bridging

- Un shopper navega SFRA → se genera un access token SLAS ligado al dwsid.
- Navega a PWA Kit → la cookie `cc-at_{siteId}` viaja, no necesita re-login.
- Logout en SFRA → invalida el token SLAS (revocación).

### 6.5 eCDN (embedded CDN)

- CDN Cloudflare gestionado para enrutar tráfico entre SFRA y Managed Runtime.
- Hasta **100 reglas por instancia** en proxy zones; 100 compartidas en legacy zones.
- Expresiones Cloudflare disponibles: `http.host`, `http.request.uri.path`, `http.request.uri`, `http.cookie`.
- Configuración vía API: `createMrtRules` en Commerce API.
- Limitaciones: **no soporta geolocation**; staging requiere onboarding por API (no UI).

---

## 7. Tabla comparativa OCAPI vs SCAPI

| Criterio | OCAPI | SCAPI |
|---|---|---|
| Auth | JWT cliente o OAuth BM | SLAS access token (siempre) |
| Paths | `dw/...` o `cc/...` | `scapi/v1/...` |
| Custom attributes | `c_<name>` | `c_<name>` (mismo) |
| Extensibilidad | Hooks (legacy) | Custom endpoints + scopes privados |
| Errors | `fault` (custom) | RFC 7807 `application/problem+json` |
| Site identifier | `site_id` en path | `siteId` en query param |
| Documentación | Parcialmente deprecada | OpenAPI 3 + Postman collection oficial |
| Multi-currency/locale | Path o context headers | Headers + query params |
| Soporte headless | Limitado (pensado para SSR) | Diseñado para headless (mobile, BFF) |
| Cacheabilidad | Limitada por hooks | Optimizada para cachear respuestas |
| Rendimiento | Típicamente lento por sesión de usuario | Diseñado para CDN + edge caching |

**Cuándo elegir uno u otro:**

- **Nuevo proyecto headless/mobile** → SCAPI + SLAS Private Client.
- **Proyecto SFRA existente que se mantiene** → OCAPI Shop API (es estable).
- **Migración gradual a composable** → SCAPI con Hybrid Auth + Plugin SLAS (si < 25.3) o Hybrid Auth (>= 25.3).
- **Operaciones admin / backoffice** → OCAPI Data API (no hay equivalente SCAPI admin).

---

## 8. Checklist de decisión para entrevista

Antes de responder cualquier pregunta sobre APIs en SFCC, verifica:

1. **¿Quién consume la API?** ¿Storefront JS, mobile nativo, BFF, sistema externo, agente BM?
2. **¿Storefront tradicional o headless?** SFRA → OCAPI; PWA Kit / composable → SCAPI.
3. **¿Es crítica la latencia?** SCAPI + CDN + caching edge. OCAPI hereda SFRA.
4. **¿Necesito escribir datos sensibles?** Refuerza scopes y SLAS scopes mínimos.
5. **¿Cómo afecta a SLAS?** ¿Guest, registered, federated, agent, session bridge? ¿Public o Private?
6. **¿Necesito extensibilidad?** Custom endpoints en SCAPI vs hooks OCAPI.
7. **¿Cómo se mide el éxito?** p95/p99 latencia, cache hit ratio, error rate 4xx/5xx, fallback entre APIs.
8. **¿Hay coexistencia con SFRA?** Sí → Hybrid Auth, cookies compartidas, eCDN rules.
9. **¿Cuál es el plan de rollback?** SLAS admite JWT firmado con `kid` rotable; OCAPI depende de `client_id` revocar.
10. **¿Está versionada la API?** OCAPI por path (`v23.2`), SCAPI por header y `v1`. Nunca hardcodear versiones.

### 8.1 Decisiones típicas en arquitectura

| Decisión | Recomendación |
|---|---|
| ¿OCAPI o SCAPI para un nuevo storefront? | SCAPI + SLAS Private |
| ¿Public o Private SLAS? | Private si hay BFF (recomendado), Public si es SPA pura sin backend |
| ¿Custom endpoint o hook OCAPI? | Custom endpoint SCAPI; hooks solo legacy |
| ¿PWA Kit o Express custom? | PWA Kit (template oficial, MRT gestionado) |
| ¿SSR completo o render condicional? | Render condicional para páginas con fragmentos personalizados |
| ¿Cómo comparto tokens entre SFRA y PWA Kit? | Hybrid Auth + cookies `cc-nx` + `cc-at_{siteId}` |
| ¿Qué headers pongo siempre? | `correlation-id`, `x-mobify` (en SCAPI), `Authorization` (si autenticado) |

### 8.2 Trampas comunes en entrevistas

- Confundir OCAPI (legacy) con SCAPI (moderno). Pista: si el enunciado menciona **SLAS**, casi seguro es SCAPI.
- Olvidar que **SCAPI requiere SLAS token** incluso para lectura pública (guest token).
- Decir que Plugin SLAS sigue siendo la solución recomendada: desde 25.3 es **Hybrid Auth**.
- Asumir que `dwsid` se puede usar como Bearer en SCAPI: NO, SLAS usa sus propias cookies.
- Olvidar `channel_id` en guest token requests: requerido desde 25/03/2025.
- Confundir `x-mobify: true` con "es opcional": es **obligatorio** para custom endpoints.
- Creer que SCAPI soporta hooks OCAPI: **no**, la extensibilidad es por custom endpoints.
- Pensar que SLAS es un servidor de tokens: también expone **Admin API** para gestionar clientes, scopes, etc.

---

## Apéndice: secuencia rápida de un checkout en PWA Kit

1. El usuario abre la PDP → SLAS guest token via Plugin SLAS o Hybrid Auth.
2. PWA Kit renderiza PDP (SSR en MRT) + hidratación en cliente.
3. `useProduct` consulta `GET /scapi/v1/products/{id}` con Bearer token.
4. Click en "Add to cart" → `useShopperBasketsMutation('addItemToBasket')`.
5. Mutación `POST /scapi/v1/baskets/{id}/items` con Bearer token.
6. Hooks de cache invalidan `useBasket` automáticamente.
7. Checkout: navegación a `/checkout` (PWA Kit route).
8. `useShopperBasketsMutation('createOrder')` con address, payment instrument.
9. SLAS se asegura de que el token sigue siendo válido; si expiró, lo renueva con refresh token.
10. Order creado → redirige a `/checkout/confirmation/{orderId}`.
11. Log Center correlaciona logs por `correlation-id` desde PDP hasta confirmación.

Esta cadena toca: **MRT edge cache** (PDP), **commerce-sdk-react** (hooks), **SCAPI Shopper Baskets + Orders**, **SLAS token refresh**, **OCAPI Shop** (legacy paths si los hay), **Hybrid Auth** (si convive con SFRA).