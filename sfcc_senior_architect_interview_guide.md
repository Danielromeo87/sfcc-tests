# Guía de preparación técnica: Salesforce B2C Commerce (SFCC)

> Manual de repaso para entrevistas de desarrollador senior, tech lead y arquitecto.
>
> El objetivo no es memorizar APIs, sino demostrar criterio: límites de la plataforma, extensibilidad, seguridad, rendimiento, operación y capacidad para justificar decisiones.

---

## Índice

1. [Modelo mental de la plataforma](#1-modelo-mental-de-la-plataforma)
2. [Arquitectura SFRA y cartridges](#2-arquitectura-sfra-y-cartridges)
3. [Controladores SFRA en profundidad](#3-controladores-sfra-en-profundidad)
4. [Modelos, ISML y frontend](#4-modelos-isml-y-frontend)
5. [Catálogo, productos, precios, inventario y promociones](#5-catálogo-productos-precios-inventario-y-promociones)
6. [Carrito, checkout, pedidos, pagos e impuestos](#6-carrito-checkout-pedidos-pagos-e-impuestos)
7. [Persistencia, transacciones y búsqueda](#7-persistencia-transacciones-y-búsqueda)
8. [Integraciones y Service Framework](#8-integraciones-y-service-framework)
9. [Jobs, importación y exportación](#9-jobs-importación-y-exportación)
10. [Business Manager, entornos y despliegues](#10-business-manager-entornos-y-despliegues)
11. [Contenido, Page Designer y SEO](#11-contenido-page-designer-y-seo)
12. [Caché, rendimiento, observabilidad y cuotas](#12-caché-rendimiento-observabilidad-y-cuotas)
13. [Seguridad y privacidad](#13-seguridad-y-privacidad)
14. [OCAPI, SCAPI, SLAS y headless](#14-ocapi-scapi-slas-y-headless)
15. [Calidad, testing y estrategia de actualización](#15-calidad-testing-y-estrategia-de-actualización)
16. [Escenarios de arquitectura](#16-escenarios-de-arquitectura)
17. [Preguntas rápidas de entrevista](#17-preguntas-rápidas-de-entrevista)
18. [Customer lists, segmentación y account hierarchy](#18-customer-lists-segmentación-y-account-hierarchy)
19. [Promociones en profundidad](#19-promociones-en-profundidad)
20. [Búsqueda y merchandising avanzado](#20-búsqueda-y-merchandising-avanzado)
21. [Post-compra, devoluciones y refunds](#21-post-compra-devoluciones-y-refunds)
22. [PWA Kit, Managed Runtime y arquitectura composable](#22-pwa-kit-managed-runtime-y-arquitectura-composable)
23. [Migración SiteGenesis a SFRA y storefronts legacy](#23-migración-sitegenesis-a-sfra-y-storefronts-legacy)
24. [Storefront híbrido y session bridging](#24-storefront-híbrido-y-session-bridging)
25. [Operación, incident response y SRE para SFCC](#25-operación-incident-response-y-sre-para-sfcc)
26. [Experimentación, A/B testing y feature flags](#26-experimentación-ab-testing-y-feature-flags)
27. [Performance testing, presupuestos y optimización continua](#27-performance-testing-presupuestos-y-optimización-continua)

---

## 1. Modelo mental de la plataforma

Salesforce B2C Commerce es una plataforma SaaS multi-tenant. El arquitecto controla el código, la configuración y los datos de negocio, pero no la infraestructura subyacente. Esto condiciona todas las decisiones:

- Hay cuotas de Script API, almacenamiento y recursos; deben verificarse en la documentación vigente del realm y la versión de plataforma.
- El storefront debe tolerar fallos de sistemas externos.
- La caché es parte de la arquitectura, no una optimización tardía.
- Los cambios de código y los cambios de datos/configuración siguen ciclos distintos.
- No existe acceso directo a la base de datos ni libertad para instalar dependencias de servidor arbitrarias.

### 1.1 Scopes que conviene distinguir

- **Realm:** conjunto de instancias pertenecientes a una organización.
- **Instance:** entorno concreto, normalmente development, staging o production.
- **Organization:** ámbito de datos globales y administración.
- **Site:** storefront con catálogo, moneda, locales, preferencias y configuración propios.
- **Code version:** versión desplegada de cartridges; solo una está activa por instancia.

### 1.2 Separación de responsabilidades

| Capa | Responsabilidad |
| --- | --- |
| Controller | HTTP, validación de entrada, middleware, selección de respuesta y orquestación ligera |
| Model/ViewModel | Adaptar objetos de Script API a datos seguros y adecuados para presentación |
| Script/helper | Lógica reutilizable y orquestación de dominio |
| Service | Comunicación con sistemas externos |
| ISML | Presentación, sin lógica de negocio pesada |
| Job | Procesamiento batch, reconciliación, import/export y tareas programadas |

Una respuesta senior explica no solo dónde colocar código, sino cómo mantenerlo testeable, actualizable y observable.

---

## 2. Arquitectura SFRA y cartridges

### 2.1 Cartridge path y resolución

Los cartridges empaquetan controladores, scripts, modelos, plantillas, recursos estáticos y metadatos. El cartridge path se resuelve de izquierda a derecha: el primer recurso coincidente tiene precedencia.

```text
app_custom_brand:app_custom_core:plugin_payment:int_oms:app_storefront_base
```

Principios:

- No modificar `app_storefront_base` ni cartridges de terceros directamente.
- Extender desde cartridges custom situados a la izquierda.
- Mantener integraciones aisladas en `int_*` o `plugin_*`.
- Evitar un único cartridge custom monolítico.
- Documentar dependencias y orden; cambiarlo puede alterar controladores, modelos, ISML y scripts resueltos con `*/`.

### 2.2 Resolución de módulos

- `require('dw/...')`: módulo de Script API.
- `require('server')`: framework de controladores SFRA.
- `require('*/cartridge/...')`: primer módulo coincidente del cartridge path.
- `module.superModule`: implementación del siguiente cartridge aplicable; base del patrón de extensión.

`module.superModule` es potente, pero crea dependencia de la firma y comportamiento del módulo base. Debe conservarse el contrato y revisarse en actualizaciones de SFRA.

### 2.3 Hooks

Los hooks desacoplan puntos de extensión, por ejemplo pagos, fraude, impuestos o lógica específica de integración. Se registran en `hooks.json` y se invocan mediante `HookMgr`.

Buenas prácticas:

- Definir un contrato estable de parámetros y retorno.
- Incorporar comportamiento por defecto cuando el hook sea opcional.
- No ocultar flujos críticos en cadenas de hooks imposibles de rastrear.
- Registrar errores con contexto funcional, nunca secretos o datos sensibles.

---

## 3. Controladores SFRA en profundidad

### 3.1 Anatomía de una ruta

```javascript
'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

server.get(
    'Show',
    consentTracking.consent,
    function (req, res, next) {
        res.render('example/show', {
            locale: req.locale.id
        });
        return next();
    }
);

server.post(
    'Submit',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        res.json({ success: true });
        return next();
    }
);

module.exports = server.exports();
```

Aspectos que un candidato debe mencionar:

- La ruta pública se identifica como `Controller-Route`.
- Elegir el verbo HTTP correcto y no cambiar estado mediante GET.
- Aplicar HTTPS, CSRF, autenticación y consentimiento cuando proceda.
- Validar y normalizar toda entrada; no confiar en querystring, body ni headers.
- `next()` continúa la cadena. Por convención se usa `return next()` para hacer explícito el fin del middleware.
- El controller debe finalizar exportando `server.exports()`.

### 3.2 `req`, `res` y datos de vista

`req` expone parámetros, locale, sesión, cliente actual y metadatos de la solicitud. `res` permite renderizar, devolver JSON, redirigir y gestionar view data.

```javascript
var viewData = res.getViewData();
viewData.availabilityMessage = 'InStock';
res.setViewData(viewData);
```

Buenas prácticas:

- Devolver contratos JSON explícitos y estables.
- Evitar exponer objetos de Script API completos al navegador.
- No incluir PII ni detalles internos en errores.
- Para redirects, validar destinos permitidos y evitar open redirects.
- Distinguir errores funcionales de fallos técnicos y usar códigos HTTP coherentes.

### 3.3 Extensión de rutas

```javascript
'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.customMessage = 'value';
    res.setViewData(viewData);
    return next();
});

module.exports = server.exports();
```

- **`prepend`**: añade middleware antes de la cadena existente.
- **`append`**: añade middleware después de la cadena existente.
- **`replace`**: reemplaza la ruta y obliga a mantener íntegramente su contrato.

Preferencia arquitectónica: `append`/`prepend` antes que `replace`. Un reemplazo aumenta el coste de actualización y puede perder correcciones de seguridad del código base.

Importante: `append` no significa necesariamente “antes del render”. Si el middleware original ya llamó a `res.render`, el append modifica el view data acumulado antes de que el framework complete la respuesta; debe comprobarse el comportamiento real de la ruta.

### 3.4 Eventos de ruta

Una respuesta puede registrar callbacks en eventos del ciclo de vida, siendo especialmente habitual `route:BeforeComplete` para ejecutar lógica cuando todos los middlewares han terminado pero antes de completar la respuesta.

```javascript
res.on('route:BeforeComplete', function () {
    // Operación final que depende de validaciones previas
});
```

Debe usarse con moderación: mover demasiado comportamiento a eventos vuelve el flujo difícil de leer y probar.

### 3.5 Formularios y CSRF

Los formularios SFRA se definen mediante XML y se obtienen con `server.forms.getForm`. En una operación de escritura:

1. Usar POST.
2. Validar CSRF.
3. Limpiar y validar datos en servidor.
4. Verificar autorización sobre el recurso, no solo que exista sesión.
5. Ejecutar escrituras en una transacción corta.
6. Devolver errores de campo y un resultado consistente.

CSRF protege acciones autenticadas basadas en cookies, pero no sustituye autenticación, autorización ni validación de negocio.

### 3.6 Sesión y privacidad

- `session.custom` sirve para estado pequeño y transitorio, no como base de datos.
- Evitar almacenar objetos grandes, información sensible o datos que deban sobrevivir a la sesión.
- No asumir afinidad infinita de sesión ni usarla para coordinación distribuida.
- Respetar consentimiento antes de activar tracking o cookies no esenciales.

### 3.7 Errores y redirects

Diseño recomendado:

- Capturar errores donde se pueda añadir contexto o aplicar recuperación.
- No usar `catch` vacío.
- Mostrar mensajes genéricos al comprador y registrar un correlation ID.
- No revelar stack traces, IDs internos o payloads de proveedores.
- Evitar bucles de redirect y validar `location`/`rurl` contra una allowlist.

### 3.8 Antipatrones de controladores

- Lógica de negocio extensa directamente en la ruta.
- Llamadas externas sin timeout en PDP, cart o checkout.
- Consultas o escrituras dentro de bucles sin límites.
- `replace` para cambios pequeños.
- Cambiar estado con GET.
- Confiar en precio, customer ID, product ID o totals enviados por el cliente.
- Cachear HTML personalizado o respuestas con datos de sesión.
- Renderizar antes de decidir si la operación transaccional ha tenido éxito.

---

## 4. Modelos, ISML y frontend

### 4.1 Modelos y decoradores

SFRA transforma objetos de Script API en view models. Los decoradores permiten componer responsabilidades como precio, imágenes, variaciones y disponibilidad.

```javascript
'use strict';

var base = module.superModule;

function ProductModel(apiProduct, options) {
    base.call(this, apiProduct, options);
    this.ean = apiProduct.custom.ean || null;
}

module.exports = ProductModel;
```

Recomendaciones:

- Mantener compatibilidad con la firma base.
- Consultar atributos opcionales defensivamente.
- No convertir el modelo en una capa que llama repetidamente a servicios externos.
- Exponer solo lo que la vista necesita.

### 4.2 ISML

Elementos habituales:

- `<isinclude template="...">`: inclusión local.
- `<isinclude url="...">`: remote include mediante una petición interna separada.
- `<isdecorate>` y `<isreplace>`: layouts.
- `<isloop>`, `<isif>` y `<isset>`: lógica de presentación limitada.
- `<iscontent>`: tipo de contenido y encoding.
- `<iscache>`: política de caché cuando aplique.

Reglas:

- Escapar correctamente la salida según el contexto HTML, atributo, URL o JavaScript.
- Evitar Script API y lógica de dominio pesada en plantillas.
- Usar bundles de recursos para internacionalización.
- No abusar de remote includes: aíslan contenido dinámico y caché, pero cada uno añade trabajo y latencia interna.

### 4.3 Frontend y assets

- Separar JavaScript por componentes y páginas según las convenciones del proyecto.
- Tratar el navegador como entorno no confiable.
- Mantener accesibilidad, progressive enhancement y Core Web Vitals.
- Versionar/minificar assets con el pipeline existente; no asumir que cualquier paquete npm puede ejecutarse en el runtime de SFCC.

---

## 5. Catálogo, productos, precios, inventario y promociones

### 5.1 Master y storefront catalog

| Concepto | Master catalog | Storefront catalog |
| --- | --- | --- |
| Objetivo | Datos maestros de producto, variaciones y atributos | Navegación y asignación comercial por categorías |
| Reutilización | Compartible entre sitios | Se asigna al sitio |
| Categorías | Puede contener clasificación maestra | Define el árbol visible y refinamientos del storefront |

La separación permite reutilizar SKUs y adaptar navegación, surtido y presentación por marca, país o site.

### 5.2 Tipos de producto

- **Standard:** SKU independiente.
- **Master:** padre no comprable de variantes.
- **Variant:** SKU comprable definido por valores de variación.
- **Variation group:** agrupación parcial de variantes.
- **Bundle:** producto compuesto con reglas específicas de precio/disponibilidad.
- **Set:** agrupación de presentación; sus componentes suelen añadirse individualmente.
- **Option product:** producto con opciones configurables que pueden influir en precio.

### 5.3 Price books

Los price books pueden estar asignados al site o a grupos de clientes y admitir vigencia y herencia. No conviene resumir la resolución como “siempre gana el menor precio”: intervienen asignación, moneda, vigencia, contexto de sesión, customer groups y jerarquía configurada.

Preguntas de diseño:

- ¿Cuál es la fuente de verdad del precio?
- ¿Cómo se propagan precios delta?
- ¿Qué ocurre si falta el precio de una variante?
- ¿Se muestra precio mínimo/rango del master?
- ¿Cómo se invalidan índices y cachés tras un cambio?

### 5.4 Inventario

Conceptos relevantes de `ProductInventoryRecord`:

- Allocation y ATS.
- Turnover y reservas.
- Backorder/preorder y fechas de disponibilidad.
- Perpetual inventory.
- Inventory list asignada al site y posibles listas específicas de ubicación según la solución.

No derivar el stock exclusivamente de un valor enviado por frontend. Antes de confirmar un pedido deben revalidarse disponibilidad y reglas de negocio.

### 5.5 Promociones y campañas

El motor evalúa campañas, promociones, cupones, source codes y customer groups. Puede actuar sobre producto, pedido o envío.

Puntos de entrevista:

- Prioridad, exclusividad y compatibilidad entre promociones.
- Recalcular el basket tras cambios relevantes.
- Evitar implementar descuentos manuales si el motor estándar puede resolverlos.
- Proteger cupones de abuso y condiciones de carrera.
- Diseñar pruebas de combinatoria y redondeo por moneda.

### 5.6 Índices de búsqueda

Cambios de catálogo, precios, disponibilidad o configuración de búsqueda pueden requerir actualización de índices. El arquitecto debe contemplar:

- Full rebuild frente a actualización incremental.
- Searchable/sortable/refinable attributes.
- Sinónimos, redirects de búsqueda y reglas de ordenación.
- Replicación y activación coordinada para evitar catálogo e índice inconsistentes.

---

## 6. Carrito, checkout, pedidos, pagos e impuestos

### 6.1 Basket

El basket es mutable y debe recalcularse cuando cambian cantidades, direcciones, métodos de envío, cupones o disponibilidad. Las operaciones de escritura sobre objetos persistentes deben usar `Transaction.wrap` o `begin/commit` con alcance mínimo.

```javascript
var Transaction = require('dw/system/Transaction');

Transaction.wrap(function () {
    productLineItem.setQuantityValue(quantity);
});
```

No incluir llamadas remotas dentro de una transacción: alarga bloqueos y combina fallos de red con persistencia local.

### 6.2 Flujo de checkout

Un flujo robusto valida en cada frontera:

1. Cliente y basket vigentes.
2. Productos, cantidades y disponibilidad.
3. Direcciones y restricciones de envío.
4. Métodos y costes de envío.
5. Promociones, cupones y totals.
6. Impuestos.
7. Instrumentos y autorización de pago.
8. Fraude.
9. Creación y colocación del pedido.
10. Confirmación y comunicación asíncrona posterior.

El servidor recalcula totals; nunca acepta como autoridad los importes enviados por el cliente.

### 6.3 Pedidos

Distinguir:

- Creación del order a partir del basket.
- Autorización/captura del pago.
- `placeOrder` y estados de confirmación/exportación.
- Cancelación o fallo controlado si un paso crítico no se completa.
- Exportación al OMS y reconciliación posterior.

La idempotencia es esencial: reintentar no debe duplicar pedidos, autorizaciones ni mensajes.

### 6.4 Pagos

Diseño recomendado:

- Encapsular proveedor mediante hooks/cartridge de integración.
- Tokenizar; no almacenar PAN/CVV.
- Definir una clave de idempotencia estable.
- Separar autorización, captura, refund y void.
- Validar webhooks con firma y protección anti-replay.
- Resolver estados ambiguos consultando/reconciliando, no cobrando de nuevo a ciegas.
- Reducir el ámbito PCI mediante hosted fields o componentes del proveedor cuando sea posible.

### 6.5 Impuestos y envíos

- Aclarar si el cálculo es net/gross y cómo varía por jurisdicción.
- Definir fallback cuando el tax provider no responde.
- Aplicar timeouts estrictos y circuit breaker.
- Mantener reglas de envío consistentes entre estimación y checkout.
- Contemplar split shipment, restricciones y productos no enviables.

---

## 7. Persistencia, transacciones y búsqueda

### 7.1 System Objects y custom attributes

System Objects incluyen Product, CustomerProfile, Basket, Order y Category. Extenderlos con atributos custom suele ser apropiado cuando el dato pertenece claramente al ciclo de vida del objeto.

Antes de añadir un atributo, evaluar:

- Scope global/site y replicación.
- Sensibilidad y retención.
- Necesidad de búsqueda o exportación.
- Cardinalidad y tamaño.
- Compatibilidad con integraciones.

### 7.2 Custom Objects

Adecuados para configuración o datos simples que no encajan en el modelo estándar. No deben convertirse por defecto en una base de datos operacional masiva.

- **Replicables/stageable:** configuración administrada en staging y promovida.
- **No replicables:** datos propios de la instancia, normalmente operacionales.

La terminología y comportamiento exactos deben validarse en Business Manager y documentación vigente. No memorizar cifras universales de cuota: dependen del recurso y pueden cambiar.

### 7.3 Transacciones

- Solo operaciones que escriben objetos persistentes.
- Mantenerlas pequeñas y deterministas.
- No hacer HTTP, sleeps, logging pesado ni procesamiento extenso dentro.
- Evitar transacciones anidadas difíciles de razonar.
- Diseñar para rollback y reintento seguro.

### 7.4 Iteradores y consultas

Los resultados de búsquedas suelen exponer iteradores. Deben cerrarse cuando corresponda y procesarse de forma acotada.

```javascript
var iterator = result.iterator();
try {
    while (iterator.hasNext()) {
        var item = iterator.next();
    }
} finally {
    iterator.close();
}
```

Evitar scans completos en storefront. Si la consulta no puede limitarse, moverla a un job, índice especializado o sistema externo.

### 7.5 Customer y order search

Las APIs de búsqueda tienen restricciones y no equivalen a SQL. En arquitectura se debe revisar:

- Campos consultables e indexados.
- Ventanas temporales y paginación.
- Retención de pedidos y privacidad.
- Acceso solo bajo permisos adecuados.
- Export batch o OMS para analítica y consultas complejas.

---

## 8. Integraciones y Service Framework

`dw.svc` centraliza credenciales, configuración, timeouts, callbacks y métricas de llamadas externas.

```javascript
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

module.exports = LocalServiceRegistry.createService('oms.http', {
    createRequest: function (service, params) {
        service.setRequestMethod('POST');
        service.addHeader('Content-Type', 'application/json');
        return JSON.stringify(params);
    },
    parseResponse: function (service, response) {
        return JSON.parse(response.text);
    },
    filterLogMessage: function (message) {
        return message.replace(/"token":"[^"]+"/g, '"token":"***"');
    }
});
```

### 8.1 Principios

- Configurar service profile, credential y service en Business Manager.
- Timeouts cortos y explícitos.
- Circuit breaker y rate limits según criticidad.
- Sanitizar logs mediante `filterLogMessage`.
- No registrar tokens, direcciones completas ni payloads de pago.
- Mapear respuestas externas a contratos internos estables.
- Distinguir errores reintentables de errores funcionales.

### 8.2 Resiliencia

Patrones habituales:

- **Fallback:** respuesta degradada o dato cacheado.
- **Retry:** solo para operaciones idempotentes, con backoff y jitter.
- **Circuit breaker:** dejar de presionar a un proveedor degradado.
- **Bulkhead:** aislar integraciones para que una no agote recursos comunes.
- **Async/outbox lógico:** desacoplar acciones no necesarias para responder al comprador.
- **Reconciliation job:** resolver operaciones cuyo resultado quedó incierto.

No reintentar automáticamente una operación de pago no idempotente.

### 8.3 Integraciones síncronas vs. asíncronas

Usar síncrono solo si la respuesta es necesaria para continuar, por ejemplo autorización de pago. Preferir batch/eventual consistency para catálogo, inventario masivo, export de pedidos, loyalty no crítico y analítica.

---

## 9. Jobs, importación y exportación

### 9.1 Tipos de step

- **Task-oriented step:** ejecuta una tarea y devuelve `Status`.
- **Chunk-oriented step:** procesa grandes volúmenes con ciclo `beforeStep`, `getTotalCount`, `read`, `process`, `write` y `afterStep`, según las funciones implementadas.

```javascript
'use strict';

function read(parameters, stepExecution) {
    return null;
}

function process(item, parameters, stepExecution) {
    return item;
}

function write(items, parameters, stepExecution) {
}

module.exports = {
    read: read,
    process: process,
    write: write
};
```

Los módulos se declaran en `steptypes.json`; la configuración define parámetros, tipos y ejecución paralela permitida.

### 9.2 Diseño batch

- Procesamiento incremental y reiniciable.
- Checkpoints o watermarks cuando proceda.
- Archivos en IMPEX con lifecycle claro: incoming, working, archive y error.
- Validación antes de importar y cuarentena de registros inválidos.
- Tamaño de chunk ajustado por memoria, duración y coste transaccional.
- Cierre de streams e iteradores.
- Métricas de leídos, procesados, descartados, errores y duración.

### 9.3 Idempotencia y concurrencia

- Ejecutar dos veces debe producir el mismo estado final o detectar duplicados.
- Evitar jobs solapados sobre los mismos recursos.
- Definir claves externas y reglas de upsert.
- No marcar un elemento como exportado antes de confirmar recepción cuando el protocolo exige garantía.
- Diseñar reintentos parciales, no reiniciar siempre millones de registros.

### 9.4 Importación/exportación

Las importaciones pueden reemplazar, fusionar o actualizar según el tipo de objeto y modo. Antes de producción:

- Validar schema y referencias.
- Probar con volúmenes representativos.
- Determinar efecto en índices, caché y replicación.
- Preparar rollback o reimportación del snapshot anterior.
- Evitar que un feed incompleto borre datos válidos.

---

## 10. Business Manager, entornos y despliegues

### 10.1 Topología habitual

- **Development/sandboxes:** desarrollo e integración.
- **Staging:** authoring, validación y origen de replicación de datos.
- **Production:** tráfico real.

La topología exacta y capacidades contratadas pueden variar.

### 10.2 Código y datos

- El código se carga como una code version y se activa por instancia.
- Datos y configuración se mueven mediante import/export o replicación según su tipo.
- Activar código no replica datos.
- Replicar datos no activa una nueva versión de código.

Un release debe coordinar compatibilidad entre código, metadata, preferencias, servicios, jobs, catálogos e índices.

### 10.3 Replicación

La replicación promueve datos compatibles desde staging hacia otros targets, normalmente producción. Distinguir organización y site, y replicable frente a instance-specific.

Riesgos:

- Replicar configuración incompleta.
- Sobrescribir cambios operacionales.
- Activar contenido antes que el código que lo entiende.
- Ignorar índices o invalidación de caché.

### 10.4 RBAC y configuración

- Mínimo privilegio para usuarios y roles.
- Separación entre merchandising, operaciones y desarrollo.
- Credenciales en Service Credentials, no en código ni preferencias visibles.
- Auditoría de cambios críticos y cuentas técnicas.
- Preferencias custom para flags/configuración no secreta, con defaults seguros.

### 10.5 Pipeline de despliegue

Una estrategia madura incluye:

1. Build reproducible.
2. Análisis estático y tests.
3. Empaquetado de cartridges y metadata.
4. Despliegue a entorno no productivo.
5. Smoke tests.
6. Activación coordinada.
7. Verificación de logs, rutas críticas y métricas.
8. Rollback por reactivación de la code version anterior, considerando compatibilidad de datos.

---

## 11. Contenido, Page Designer y SEO

### 11.1 Page Designer

Un component/page type normalmente consta de:

- JSON de metadatos.
- Script `render(context)`.
- ISML.
- Regiones y componentes hijos cuando aplique.

Principios:

- Componentes pequeños, reutilizables y con defaults seguros.
- Validar contenido introducido por el merchant.
- Evitar servicios externos en cada render.
- Diseñar preview y storefront con comportamiento consistente.
- Considerar caché, localización y permisos de edición.

### 11.2 Page Designer vs. content slots/assets

- **Page Designer:** composición visual de páginas y regiones.
- **Content slots:** ubicaciones conocidas con programación y reglas de targeting.
- **Content assets:** contenido estructurado/reutilizable tradicional.

La decisión depende de libertad editorial, gobernanza, reutilización, targeting y coste de renderizado.

### 11.3 SEO

- URLs canónicas y redirects controlados.
- Metadatos por producto, categoría y contenido.
- `hreflang` en escenarios multi-site/multi-locale.
- Sitemaps y robots coherentes con disponibilidad.
- Structured data válido.
- Gestión de filtros/facetas para evitar explosión de URLs.
- 301 para migraciones permanentes; no convertir todos los errores en redirects.

---

## 12. Caché, rendimiento, observabilidad y cuotas

### 12.1 Capas de caché

Distinguir CDN/eCDN, Web Adapter/page cache, remote includes, cachés de plataforma e índice de búsqueda. Cada capa tiene claves, TTL e invalidación diferentes.

Una página cacheable debe ser segura para todos los usuarios que comparten su clave. Datos de cuenta, carrito, precios personalizados o CSRF suelen requerir fragmentación dinámica o respuestas no cacheadas.

### 12.2 Estrategia

- Maximizar caché en PLP, PDP y contenido público cuando el negocio lo permita.
- Aislar fragmentos personalizados con remote includes o llamadas cliente, midiendo el coste.
- Evitar cookies y query parameters innecesarios que fragmenten la caché.
- Definir TTL e invalidación según frescura requerida.
- No cachear respuestas de error accidentalmente.
- Medir hit ratio por ruta, no solo global.

### 12.3 Rendimiento de código

- Evitar búsquedas y servicios en bucles.
- Reducir creación de modelos pesados para datos no usados.
- Paginar y limitar resultados.
- Mover trabajo no crítico fuera de la request.
- Revisar remote includes, tamaño HTML/JSON y número de assets.
- Probar con tráfico y datos representativos.

### 12.4 Observabilidad

- Loggers por categoría con niveles adecuados.
- Correlation ID propagado a integraciones.
- Métricas de latencia, error rate, cache hit, circuit breaker, jobs y checkout conversion.
- Dashboards y alertas orientados a síntomas del cliente.
- No usar logs como almacén ilimitado ni incluir PII/secrets.

### 12.5 Cuotas

Las cuotas protegen la plataforma multi-tenant. En entrevista es mejor explicar cómo descubrirlas y diseñar dentro de ellas que citar cifras susceptibles de estar obsoletas.

Proceso:

1. Identificar APIs y recursos consumidos.
2. Consultar cuota vigente y logs de quota status.
3. Reproducir con volumen realista.
4. Limitar, paginar, cachear o mover a batch.
5. Establecer alertas antes del límite.

---

## 13. Seguridad y privacidad

### 13.1 Controles esenciales

- HTTPS en rutas sensibles.
- CSRF en operaciones basadas en sesión/cookie.
- Autenticación y autorización por recurso.
- Validación server-side y output encoding.
- Protección contra open redirects.
- Gestión segura de secretos y rotación.
- Headers y CSP según la arquitectura.
- Dependencias y cartridges de terceros revisados.
- Rate limiting y controles anti-bot donde corresponda.

### 13.2 PII y privacidad

- Minimización: almacenar solo lo necesario.
- Finalidad y consentimiento explícitos.
- Retención y borrado definidos.
- Exportación/eliminación de datos del cliente contemplando sistemas downstream.
- Enmascarado en logs y entornos no productivos.
- No copiar producción a sandboxes sin anonimización y autorización.

### 13.3 Amenazas frecuentes

- XSS por contenido merchant o parámetros no escapados.
- CSRF en perfil, direcciones, wishlist o checkout.
- IDOR al consultar recursos por ID sin validar propietario.
- Credential stuffing y account takeover.
- Manipulación de precio/cantidad/promo desde frontend.
- Webhooks falsos o reproducidos.
- SSRF o llamadas a destinos construidos desde entrada no confiable.

---

## 14. OCAPI, SCAPI, SLAS y headless

### 14.1 OCAPI

- **Shop API:** operaciones shopper tradicionales.
- **Data API:** acceso administrativo e integraciones, sujeto a permisos.
- **Meta API:** metadatos y schemas.

La configuración de clientes y recursos debe aplicar mínimo privilegio y versionarse cuidadosamente. Hooks OCAPI permiten personalización en puntos soportados, pero añaden acoplamiento y coste de actualización.

### 14.2 SCAPI

Shopper APIs son la opción moderna para experiencias headless/composable. El diseño debe considerar:

- Contratos y versiones de API.
- Shopper context, site, locale y currency.
- CORS y trusted origins.
- Límites de tasa y caché en el BFF/CDN.
- Extensibilidad soportada frente a lógica que pertenece al BFF.

### 14.3 SLAS

SLAS significa **Shopper Login and API Access Service**. Gestiona autenticación/autorización shopper para APIs composables.

- Clientes públicos: Authorization Code con PKCE; no pueden guardar secretos.
- Clientes privados: secretos solo en servidor/BFF.
- Guest shoppers y registered shoppers tienen ciclos de token distintos.
- Refresh, logout, revocación y transición guest-to-registered deben diseñarse explícitamente.

No describir SLAS como “Salesforce Local Auth Server” ni equiparar todos sus tokens de forma genérica con una sesión SFRA.

### 14.4 Arquitectura headless

Piezas habituales:

```text
Browser/App -> CDN/Managed Runtime -> BFF/PWA Kit -> SCAPI/SLAS -> B2C Commerce
                                            -> APIs de terceros
```

Decisiones:

- Qué lógica reside en B2C Commerce y cuál en BFF.
- SSR frente a CSR y estrategia de caché.
- Protección de secretos y tokens.
- Agregación de APIs sin crear un BFF monolítico.
- Degradación cuando recomendaciones, CMS o loyalty fallan.
- Trazabilidad extremo a extremo.

---

## 15. Calidad, testing y estrategia de actualización

### 15.1 Pirámide de pruebas

- Unit tests de helpers, modelos y transformaciones con mocks de `dw/*`.
- Integration/contract tests para servicios externos.
- API tests para controllers, OCAPI/SCAPI y permisos.
- E2E de navegación, cart, checkout, registro y cuenta.
- Performance tests de rutas y feeds críticos.
- Security tests para autorización, CSRF, XSS e inputs maliciosos.

### 15.2 Revisiones de código

Checklist:

- ¿Extiende en lugar de copiar base?
- ¿Respeta contratos y cartridge path?
- ¿La ruta tiene verbo, HTTPS, CSRF y autorización correctos?
- ¿Hay transacciones cortas?
- ¿Los servicios tienen timeout y logs filtrados?
- ¿La respuesta es cacheable de forma segura?
- ¿Se cierran iteradores/streams?
- ¿Existen métricas, manejo de errores y tests?

### 15.3 Actualización de SFRA y cartridges

- Mantener customizaciones pequeñas y aisladas.
- Registrar overrides y replacements.
- Comparar versiones base y release notes.
- Ejecutar regression suite sobre rutas extendidas.
- Revisar cambios de contratos internos, modelos, middleware y frontend.
- Actualizar cartridges de terceros con pruebas de seguridad y pagos.

---

## 16. Escenarios de arquitectura

### Escenario 1: inventario en tiempo real en PDP

**Pregunta:** El negocio quiere consultar el ERP en cada PDP.

**Respuesta esperada:**

- No bloquear cada PDP con una dependencia remota: aumenta latencia, reduce caché y propaga caídas.
- Mantener una réplica de inventario en SFCC mediante delta feeds/eventos.
- Mostrar disponibilidad cacheable o eventualmente consistente.
- Revalidar en add-to-cart y checkout si el negocio lo exige.
- Usar timeout, circuit breaker y fallback.
- Definir qué ocurre con overselling y cómo se reconcilia.

### Escenario 2: flash sale con CPU y latencia elevadas

**Plan:**

1. Confirmar impacto por ruta, región, device y código HTTP.
2. Revisar cache hit ratio y cambios recientes de cookies/querystrings.
3. Identificar controllers, services y remote includes más lentos.
4. Buscar scans, modelos pesados, bucles y personalización que impide caché.
5. Aplicar mitigación: desactivar features no críticas, aumentar TTL, limitar bots o degradar integraciones.
6. Validar checkout/pagos antes de priorizar páginas secundarias.
7. Documentar causa raíz y prueba de carga preventiva.

### Escenario 3: alertas de back-in-stock

**Decisión:**

- Custom Objects pueden servir para volumen pequeño y requisitos simples.
- Para volumen alto, campañas, deduplicación, compliance y eventos, preferir una plataforma externa especializada.
- En ambos casos: consentimiento, retención, clave idempotente shopper/email + SKU + site, rate limiting y borrado.
- No decidir por una cifra memorizada; modelar crecimiento, cuota vigente y operaciones requeridas.

### Escenario 4: proveedor de pagos devuelve timeout

**Respuesta esperada:**

- Un timeout no demuestra que el cobro falló.
- No reintentar ciegamente.
- Consultar por idempotency key/merchant reference.
- Dejar el pedido en estado recuperable si el flujo lo permite.
- Ejecutar reconciliación y alertar operaciones.
- Diseñar webhook firmado como confirmación adicional.

### Escenario 5: exportación de pedidos al OMS

**Diseño:**

- Export incremental por estado/watermark.
- Payload versionado y clave externa idempotente.
- Confirmación antes de marcar exportado.
- Retry con backoff para fallos transitorios.
- Dead-letter/quarantine para errores funcionales.
- Reconciliación de pedidos ausentes o duplicados.
- Dashboard de lag, errores y antigüedad del pedido más antiguo pendiente.

### Escenario 6: multi-site internacional

**Puntos de decisión:**

- Compartición de master catalog y customer lists.
- Storefront catalogs, surtido, price books, inventory y promotions por site.
- Locale, currency, tax y reglas legales.
- `hreflang`, dominios, redirects y contenido localizado.
- Configuración global frente a site-specific.
- Equipos, permisos y calendario de replicación.

### Escenario 7: personalización sin destruir la caché

**Solución:**

- Mantener shell de PLP/PDP compartido y cacheable.
- Aislar wishlist, minicart, mensajes de loyalty o recomendaciones personalizadas.
- Evitar variar toda la página por customer ID.
- Agrupar por segmentos solo cuando el valor comercial supera la fragmentación.
- Medir hit ratio, TTFB y conversión antes/después.

### Escenario 8: nuevo atributo de producto urgente

**Plan:**

1. Definir metadata y alcance.
2. Hacer el código tolerante a atributo ausente.
3. Importar/replicar definición antes de habilitar su uso obligatorio.
4. Importar valores.
5. Actualizar índice si es searchable/refinable/sortable.
6. Activar feature flag.
7. Validar cachés y rollback compatible.

---

## 17. Preguntas rápidas de entrevista

### Arquitectura

**¿Por qué no modificar `app_storefront_base`?**  
Porque dificulta upgrades, oculta el delta custom y puede perder correcciones base.

**¿Cuándo usar `replace`?**  
Cuando el contrato completo debe cambiar y prepend/append/helper/hook no bastan; requiere regression tests y revisión en cada upgrade.

**¿Controller o hook?**  
Controller para la frontera HTTP; hook para una extensión desacoplada de un dominio o integración.

### Datos y transacciones

**¿Custom attribute o Custom Object?**  
Atributo si el dato pertenece al ciclo de vida de un System Object; Custom Object para entidad/configuración independiente y de escala acotada.

**¿Por qué evitar servicios dentro de `Transaction.wrap`?**  
Porque prolongan bloqueos y un fallo de red complica atomicidad y recuperación.

### Integraciones

**¿Qué debe tener todo servicio?**  
Timeout, contrato, filtrado de logs, métricas, clasificación de errores y estrategia de fallback/retry.

**¿Cuándo reintentar?**  
Solo si el fallo es transitorio y la operación es idempotente o dispone de una clave de idempotencia fiable.

### Rendimiento

**¿Cuál es la optimización de mayor impacto habitual?**  
Evitar ejecutar código mediante una caché segura y con alto hit ratio.

**¿Por qué un remote include no es gratis?**  
Porque añade otra ejecución interna; mejora aislamiento de caché, pero aumenta coste y latencia.

### Seguridad

**¿CSRF es suficiente para proteger una ruta?**  
No; también hacen falta autenticación, autorización, validación, método HTTP correcto y output encoding.

**¿Dónde guardar secretos?**  
En credenciales/configuración segura del Service Framework o gestor autorizado, nunca en código, logs o preferencias planas.

### Headless

**¿OCAPI y SCAPI son lo mismo?**  
No. Son familias de APIs diferentes, con modelos de autenticación, extensibilidad y evolución distintos.

**¿Qué es SLAS?**  
Shopper Login and API Access Service, usado para acceso/autenticación shopper en arquitecturas composables.

---

## 18. Customer lists, segmentación y account hierarchy

SFCC distingue entre **Customer** (cuenta autenticada), **CustomerProfile** (datos persistentes) y **session customer** (basket y personalización anónima). Comprender esta separación evita errores de diseño y fugas de datos.

### 18.1 Customer groups

- Definen elegibilidad para price books, promociones, cupones y contenido.
- Son jerárquicas (un grupo puede contener otros).
- Asignar un shopper a un grupo tiene impacto en pricing y campañas; debe auditarse.
- Migrar clientes entre grupos puede requerir reindexado de precios y campañas.

### 18.2 Customer lists

- Listas nombradas de clientes usadas para targeting (cupones, contenido, source codes).
- Idóneas para campañas de marketing.
- Deben gestionarse considerando retención, RGPD y replicación.
- Su tamaño y churn afectan a operaciones de import/export.

### 18.3 Account hierarchy (B2B / B2C con cuenta)

En escenarios con jerarquía de cuentas (B2B, cuentas corporativas con múltiples compradores):

- Roles: administrador, comprador, aprobador, etc.
- Permisos por cuenta y por sub-cuenta.
- Listas de compra, wishlists y listas de aprobación por nivel.
- Cuotas de gasto y reglas de aprobación.
- El modelo de datos de cliente y orden debe contemplar la jerarquía.

### 18.4 Guest vs. registered

- Sesiones guest tienen un timeout y pueden migrar a registered (basket transfer).
- El merge de baskets debe ser idempotente y manejar conflictos de line items.
- Datos sensibles no deben escribirse en sesión guest más allá de lo necesario.
- La decisión sobre qué guardar en `session.custom` y dónde promover a perfil debe estar documentada.

### 18.5 Decisiones de entrevista

- ¿Dónde guardo datos "casi definitivos" del visitante sin cuenta?
- ¿Customer Profile guarda atributos PII? ¿Cumple retención y borrado?
- ¿Cómo se transfiere el basket guest a un usuario recién registrado?
- ¿Customer groups por país/canal impactan en replicación y reporting?

---

## 19. Promociones en profundidad

El motor de promociones evalúa campañas, promociones, cupones, source codes y customer groups. Un arquitecto debe entender el orden de evaluación y los efectos combinados.

### 19.1 Estructura

- **Campaign:** contenedor con fecha de inicio/fin, prioridad y estado.
- **Promotion:** reglas (condiciones) y acciones (descuentos, envío gratuito, regalo).
- **Coupon:** código con usos máximos, restricciones y estado.
- **Source code:** código ligado a campañas de marketing con atribución.
- **Customer group:** elegibilidad.

### 19.2 Evaluación

- Prioridad: promociones con mayor prioridad se evalúan antes.
- Exclusiones: una promoción puede impedir otras en el mismo basket.
- Stacking: varias promociones pueden combinarse si las reglas lo permiten.
- Recalcular el basket tras cualquier cambio (cantidad, cupón, dirección, envío).
- Forzar recalculación al añadir un cupón para evitar descuentos fantasma.

### 19.3 Antipatrones frecuentes

- Implementar descuentos a mano en el código cuando el motor puede resolverlos.
- Ignorar la prioridad y acabar aplicando descuentos no deseados.
- Cupones de un solo uso sin protección contra condición de carrera (reto concurrent).
- Reglas demasiado permisivas que permiten stacking agresivo.
- Redondeos y discrepancias por moneda entre promociones y totals.

### 19.4 Testing

- Pruebas de combinatoria (varias promociones activas simultáneamente).
- Redondeo por moneda.
- Exclusividad y respeto de customer groups.
- Comportamiento con cupones caducados o ya canjeados.
- Limpieza post-test de cupones de un solo uso.

### 19.5 Reporting

- Métricas de canje, abandono de cupón y revenue incremental.
- Detección de abuso (un mismo shopper canjeando repetidamente).
- Sincronización con plataformas externas (analytics, BI).

---

## 20. Búsqueda y merchandising avanzado

Buscar y encontrar es uno de los caminos más rentables del storefront. El arquitecto debe diseñar para relevancia, latencia y mantenibilidad.

### 20.1 Indexación

- Atributos `searchable`, `sortable`, `refinement definition type`.
- Sinonimos y redirects de búsqueda.
- Full rebuild vs update incremental.
- Replicación de índices entre staging y producción.
- Coherencia entre disponibilidad, precio y resultados.

### 20.2 Reglas de búsqueda (search rules)

- Boost: promover productos en queries concretas.
- Bury: hundir resultados no deseados.
- Filter: añadir restricciones automáticas.
- Block: bloquear combinaciones que no hagan sentido comercial.
- Definir reglas por temporada, inventario o estrategia.

### 20.3 Merchandising dinámico

- Ordenar resultados por margen, novedades, top ventas o stock.
- Pinning manual de productos para campañas.
- Slots curados por categoría.
- Cambios de merchandising con rollback claro.

### 20.4 Searchandising y UX

- Sugerencias y corrección ortográfica.
- Autocomplete con debouncing y cancelación.
- Paginación o scroll infinito con paginación real (no cargar miles).
- Filtros de faceta seguros para no destruir la caché.
- URLs de búsqueda estables y canónicas.

### 20.5 SEO técnico de búsqueda

- Páginas de resultados no indexables salvo decisión estratégica.
- Canonical a la versión principal cuando hay ordenación/filtros.
- Páginas de cero resultados con alternativas y enlaces útiles.
- `nofollow` en filtros o combinaciones no rastreables.

### 20.6 Caching de búsqueda

- Cachear resultados por query canónica.
- Invalidar según catálogo, precio o reglas de merchandising.
- Aislar fragmentos dinámicos (filtros, num. resultados) del shell.

---

## 21. Post-compra, devoluciones y refunds

El ciclo de vida de un pedido no termina en `placeOrder`. El diseño post-compra es clave para CX, operaciones y fraude.

### 21.1 Estados de pedido

- Creado, exportado, enviado, entregado, devuelto, cancelado.
- No abusar de estados custom que rompan integraciones downstream.
- Export incremental por estado y watermark robusto.

### 21.2 Devoluciones (RMA)

- Motivo, condición del producto, política aplicable.
- Validación de elegibilidad (plazo, tipo de producto, canal).
- Impacto en inventario: liberar ATS, devolver a stock o marcar como dañado.
- Notificación al OMS/ERP.

### 21.3 Refunds

- Restitución al método de pago original o como store credit.
- Parciales (línea, envío, descuento proporcional).
- Confirmación idempotente: no reembolsar dos veces.
- Manejo de rounding y comisiones.

### 21.4 Cancelaciones

- Cancelación previa a fulfillment: reembolso completo.
- Cancelación parcial o post-envío: flujo RMA.
- Liberar inventario reservado y propagar a OMS.

### 21.5 Cambios y excepciones

- Edits de pedido post-`placeOrder` suelen no ser triviales.
- Mejor diseñar una anulación + nuevo pedido que un edit complejo.
- Registrar motivo, autorizador y correlation ID.

### 21.6 Self-service vs. atención

- Endpoints claros para el shopper con autenticación y rate limit.
- Atención al cliente con roles y auditoría.
- No exponer endpoints administrativos a shoppers.

---

## 22. PWA Kit, Managed Runtime y arquitectura composable

Composable Storefront es la evolución headless oficial. Combinada con SFRA o como sustituto, requiere decisiones arquitectónicas claras.

### 22.1 PWA Kit

- React-based storefront open source.
- **Retail React App** como template (SSR, autenticación, carrito, checkout).
- SDK: `@salesforce/pwa-kit-react-sdk` (rendering, routing, caching pipeline).
- `commerce-sdk-react` con hooks para SLAS y SCAPI.
- SSR + CSR: misma base de código en server y client; el navegador hidrata para contenido dinámico.
- Soporte de navegador y SO oficial (ver guía de compatibilidad).

### 22.2 Managed Runtime (MRT)

- Hosting serverless Node.js.
- CDN gestionado con caché configurable (default 600s).
- **Request processor** (`app/request-processor.js`) en el edge para modificar query strings y mejorar cache hit ratio.
- Bundles desplegables vía `npm run push`.
- Múltiples environments (staging, production) con promoción.

### 22.3 Cache strategy en PWA Kit

- TTL por página (en `getProps` o `app/ssr.js`).
- Render condicional: campos personalizados y cambiantes solo en cliente.
- Query string filtering para evitar fragmentación.
- Proxying para reuso de cookies y tokens en API calls.

### 22.4 Trade-offs

- PWA Kit: mejor time-to-market, código abierto, gran ecosistema; menor control de detalle bajo nivel.
- Custom Node.js/Next.js sobre SCAPI: máxima flexibilidad, pero más responsabilidad.
- SFRA headless (phase-out progresivo): reuso, pero coupling con web adapter.

### 22.5 Cuándo abandonar PWA Kit

- Requisitos muy específicos de routing o rendering no soportados fácilmente.
- Necesidad de frameworks distintos a React.
- Inversión enorme en plantillas legacy.

### 22.6 Buenas prácticas

- Template Extensibility (`overrides/`) para reducir deuda y coste de upgrade.
- Chunks pequeños y code splitting.
- Mantener `default.js` y `sites.js` revisados.
- Monitorear TBT, LCP y CLS con Lighthouse integrado.

---

## 23. Migración SiteGenesis a SFRA y storefronts legacy

Migrar un storefront legacy a SFRA o a composable es un proyecto de varios meses. El plan marca la diferencia.

### 23.1 Estrategia

- **Strangler pattern:** introducir SFRA/composable por rutas.
- **Big bang:** solo viable en proyectos pequeños; riesgo elevado.
- Convivencia con SiteGenesis no soportada oficialmente para composable (existe POC comunitario).

### 23.2 Inventario

- Cartridges, ISML, JS controller, OCAPI hooks.
- Customizaciones, integraciones, scripts de import/export.
- Datos: customers, orders, content assets.
- Reglas de negocio implícitas en SiteGenesis que no serán triviales en SFRA.

### 23.3 Conversión de código

- Reescribir controllers como rutas SFRA (no copiar SiteGenesis).
- Reemplazar ISML por componentes SFRA o por React components en composable.
- Reemplazar pipelines Java personalizados.
- Validar que los hooks OCAPI no se pierdan en la migración.

### 23.4 Datos

- Importar catálogo antes de activar las nuevas rutas.
- Customer profile y baskets en transición: cookies, session bridging, handoff.
- Evitar "producción escribe a dos sistemas": definir fuente de verdad.

### 23.5 Testing

- Regression suite contra SiteGenesis para comparar.
- Pruebas A/B en producción con feature flags.
- Smoke tests en rutas críticas.

### 23.6 Riesgo y rollback

- Reverse-proxy que enrute a storefront legacy como fallback.
- Snapshot de datos y estrategia de re-import.
- Plan de comunicación al merchant.

---

## 24. Storefront híbrido y session bridging

No todos los equipos pueden cortar a composable de golpe. Salesforce ofrece un modelo híbrido soportado.

### 24.1 Plugin SLAS y Hybrid Auth

- **Plugin SLAS** (legacy): extiende SLAS en SFRA para session bridging.
- **Hybrid Auth** (>= 25.3): sustituye Plugin SLAS como solución soportada.
- Habilita coexistencia de páginas SFRA y PWA Kit con sesión unificada.

### 24.2 Sesiones

- `dwsid`: cookie de sesión SFRA tradicional.
- `cc-nx-g`: refresh token SLAS guest.
- `cc-nx`: refresh token SLAS registered.
- `token`: SLAS access token.
- `cc-at_{siteId}`: access token compartido entre SFRA y PWA Kit (>= v3.5.0).

### 24.3 Flujo

1. Shopper se autentica en PWA Kit → SLAS devuelve tokens.
2. PWA Kit hace `POST /sessions` en OCAPI → genera `dwsid` puente.
3. Cookies quedan sincronizadas; navegar a SFRA conserva el contexto.
4. Logout en un sistema invalida en el otro.

### 24.4 eCDN y routing

- eCDN (Cloudflare) enruta por path, host o cookie.
- Hasta 100 reglas por instancia en proxy zones.
- Staging debe onboardearse vía API.
- Rutas PWA Kit (`/`, `/category`, `/product`) y SFRA (`/cart`, `/checkout`) coexisten.

### 24.5 Decisiones

- ¿Qué rutas migra a PWA Kit primero? ¿Por qué?
- ¿Cómo se conserva el basket entre arquitecturas?
- ¿Qué pasa con wishlists y store credit?
- ¿Hay analytics unificado?

---

## 25. Operación, incident response y SRE para SFCC

SFCC es SaaS, pero la operación del storefront propio sigue requiriendo madurez. La diferencia arquitectónica importa: responder rápido sin acceso a la base ni al servidor.

### 25.1 SLOs y SLIs

- Latencia p50/p95/p99 por ruta.
- Error rate por tipo (4xx, 5xx, timeouts de provider).
- Cache hit ratio por ruta.
- Conversión checkout como SLO de negocio.
- Disponibilidad medida extremo a extremo, no solo "el sitio responde".

### 25.2 Runbooks

- Runbooks por ruta crítica (PDP, add-to-cart, checkout, payment).
- Comprobación de estado: loggers, dashboards, métricas, errores reproducibles.
- Pasos de mitigación preaprobados: feature flag, degradación, desactivar.
- Contactos y escalado.

### 25.3 Incident response

- Severidad 1-4 con criterios claros.
- Rol de incident commander, scribe, comms.
- Bridges de comunicación y status page.
- Postmortem sin culpa con timeline y action items.

### 25.4 On-call

- Rotación con cobertura y handoff.
- Acceso a runbooks desde el teléfono.
- Reducción de alertas ruidosas.
- Métricas de MTTR y MTTA.

### 25.5 Observabilidad mínima viable

- Correlation ID propagado a integraciones.
- Dashboards por flujo de negocio.
- Alertas orientadas a síntomas del cliente.
- Logs estructurados sin secretos.
- No logs en producción con payloads de pago.

### 25.6 Desastres y recuperación

- Activación de code version anterior.
- Contingencia de integraciones críticas (pago, OMS).
- Plantilla de failover para cache.
- Backups y replicación de Custom Objects sensibles.

---

## 26. Experimentación, A/B testing y feature flags

Experimentar es una herramienta para tomar decisiones. SFCC se integra con herramientas externas y permite feature flags en código.

### 26.1 Feature flags

- **Release flag:** rollout gradual.
- **Experiment flag:** división de tráfico para A/B.
- **Ops flag:** conmutación operativa.
- Implementación: simple booleano en preferencias, sistema dedicado, o servicio externo.
- Default off; apagado en error no debe romper la app.

### 26.2 A/B testing

- Hipótesis, métrica primaria, duración y muestra necesarias.
- División de tráfico consistente (sticky).
- Evitar peeking (mirar cada día).
- Documentar resultados y archivar learnings.

### 26.3 Integración con analytics

- Emitir eventos desde el storefront con shopper context.
- Coordinar con el equipo de CRO/Marketing.
- No correr muchos tests simultáneamente sobre la misma superficie.

### 26.4 Decisiones de entrevista

- ¿Qué feature flag usaría para un rollout seguro?
- ¿Cómo evitaría que un test infecte el SEO?
- ¿Cuándo NO hacer A/B testing?
- ¿Cómo evalúo el éxito de una variación?

---

## 27. Performance testing, presupuestos y optimización continua

SFCC ya gestiona multi-tenancy y cuotas, pero la responsabilidad del storefront es no abusar de la plataforma.

### 27.1 Metodología de load testing

- Objetivos claros: pico de tráfico, duración, ruta.
- Datos representativos: catálogo, inventario, customer groups.
- Aislamiento del entorno de pruebas.
- Ramp-up realista y backout plan.
- Cuidado con throttling del lado Salesforce.

### 27.2 Tipos de tests

- **Load test:** carga esperada.
- **Stress test:** sobrecarga para encontrar el punto de rotura.
- **Soak test:** carga sostenida para detectar leaks.
- **Spike test:** picos súbitos (campaign, viral).

### 27.3 Métricas

- TTFB, LCP, FID/INP, CLS.
- Tasa de errores 5xx.
- Latencia por provider.
- Cache hit ratio.
- Tiempo hasta respuesta en checkout.

### 27.4 Performance budgets

- Tamaño máximo de bundles JS/CSS.
- Latencia objetivo por ruta.
- Número máximo de remote includes.
- Tamaño de HTML.
- Aplicar en CI con `bundlesize` o similar.

### 27.5 Optimización continua

- Profiling en rutas lentas.
- Revisar features infrautilizadas.
- Purgar cartridges no usados.
- Reducir `append` que duplican trabajo.
- Aceptar deuda explícita y remediarla.

### 27.6 Decisiones de entrevista

- ¿Cómo valida un arquitecto que el storefront soporta Black Friday?
- ¿Qué presupuesto de performance establece para un nuevo PDP?
- ¿Cómo decide entre caché y CDN?
- ¿Cuándo mover un servicio de síncrono a batch?

---

## Cierre: cómo responder como arquitecto

Una respuesta sólida suele seguir esta estructura:

1. Aclarar requisitos funcionales y no funcionales.
2. Identificar fuente de verdad, volumen, latencia y consistencia.
3. Delimitar componentes y contratos.
4. Explicar seguridad, caché, cuotas y resiliencia.
5. Diseñar observabilidad, operación y recuperación.
6. Exponer trade-offs y alternativas.
7. Definir pruebas, rollout y rollback.

Evita respuestas absolutas. En SFCC, “depende” solo es una buena respuesta si se especifica claramente **de qué depende** y cómo se tomará la decisión.

---

## Apéndice: rutas de aprendizaje recomendadas

### Para reforzar los temas nuevos

- **Customer management y account hierarchy:** ejecutar `CustomerMgr` desde un script, experimentar con grupos y listas en staging.
- **Promociones:** diseñar un test de combinatoria con prioridad y exclusiones.
- **Búsqueda y merchandising:** probar sinonimos y redirects; revisar reglas en producción.
- **Post-compra:** simular una RMA y medir el flujo de inventario.
- **PWA Kit y Managed Runtime:** levantar el Retail React App localmente y desplegar un bundle en sandbox.
- **Storefront híbrido:** configurar Plugin SLAS (o Hybrid Auth en versiones nuevas) en staging.
- **Operación y SRE:** escribir un runbook real para `placeOrder`; correr un game day.
- **Experimentación:** diseñar un A/B test con muestra, métrica y criterios de decisión.
- **Performance testing:** correr un k6 contra staging y comparar con presupuesto.

### Referencias oficiales

- SFRA: `developer.salesforce.com/docs/commerce/sfra`.
- PWA Kit y Managed Runtime: `developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime`.
- Commerce API (SCAPI/SLAS): `developer.salesforce.com/docs/commerce/commerce-api`.
- eCDN rules: `developer.salesforce.com/docs/commerce/commerce-api/guide/ecdn-rules-for-phased-headless-rollout.html`.
- Repositorios: `github.com/SalesforceCommerceCloud` (pwa-kit, plugin_slas, plugin_redirect, plugin_wishlists, storefront-reference-architecture).

---

## Apéndice A: Glosario de términos

Términos recurrentes que conviene manejar con soltura en una entrevista de arquitectura SFCC.

| Término | Definición operativa |
| --- | --- |
| **Realm** | Conjunto de instancias que pertenecen a una organización. |
| **Instance** | Entorno concreto (development, staging, production) con su propio ciclo de vida. |
| **Organization** | Ámbito global de datos y administración que agrupa sites. |
| **Site** | Storefront con catálogo, moneda, locales, preferencias y configuración propios. |
| **Code version** | Versión desplegada de cartridges; solo una está activa por instancia. |
| **Cartridge** | Empaquetado de controladores, scripts, modelos, plantillas y metadatos. |
| **Cartridge path** | Lista ordenada de cartridges; el primer recurso coincidente de izquierda a derecha tiene precedencia. |
| **SFRA** | Storefront Reference Architecture: la base de referencia actual para storefronts. |
| **Script API** | API de servidor en JavaScript de la plataforma (paquete `dw/...`). |
| **ISML** | Lenguaje de plantillas servidor de SFCC. |
| **Hook** | Punto de extensión registrado en `hooks.json` y orquestado por `HookMgr`. |
| **OCAPI** | Open Commerce API: API REST tradicional (Shop, Data, Meta). |
| **SCAPI** | Shopper Commerce API: familia moderna de APIs para arquitecturas composables. |
| **SLAS** | Shopper Login and API Access Service: autenticación y autorización para SCAPI. |
| **BFF** | Backend for Frontend: capa de servidor para un cliente (PWA, mobile, etc.). |
| **PWA Kit** | Framework open source de Salesforce para storefronts headless. |
| **Managed Runtime (MRT)** | Hosting serverless Node.js con CDN integrado donde se despliegan bundles de PWA Kit. |
| **Retail React App** | Template SSR/CSR oficial de PWA Kit optimizado para ecommerce. |
| **Request processor** | Función en el edge de MRT que modifica la query string antes del lookup de caché. |
| **Template extensibility** | Mecanismo de override en `overrides/app` para personalizar sin reescribir el template base. |
| **Plugin SLAS** | Cartridge legacy para session bridging entre SFRA y PWA Kit. |
| **Hybrid Auth** | Solución soportada a partir de 25.3 que reemplaza a Plugin SLAS. |
| **eCDN** | Embedded CDN basado en Cloudflare, permite enrutar entre SFRA y MRT. |
| **dwsid** | Cookie de sesión B2C Commerce tradicional. |
| **cc-nx-g / cc-nx** | Refresh tokens SLAS (guest y registered). |
| **cc-at_{siteId}** | Access token SLAS compartido entre arquitecturas. |
| **Tokenization (PCI)** | Proceso del proveedor de pagos que intercambia PAN por un token opaco. |
| **Idempotency key** | Identificador estable que permite reintentar operaciones sin duplicar efectos. |
| **Webhook** | Notificación HTTP firmada enviada por un proveedor a un endpoint propio. |
| **SLO / SLI** | Service Level Objective / Indicator. Métrica objetivo e indicador medible. |
| **Error budget** | Margen de error permitido (1 - SLO) en una ventana temporal. |
| **Runbook** | Documento accionable para diagnosticar y mitigar incidentes. |
| **Postmortem** | Análisis sin culpa de un incidente con timeline, causas y action items. |
| **Chunk step** | Tipo de step de job que procesa grandes volúmenes por lotes. |
| **Custom Object** | Entidad personalizada para configuración o datos que no encajan en System Objects. |
| **Master catalog** | Catálogo canónico de productos reutilizable entre sites. |
| **Storefront catalog** | Catálogo de navegación comercial asignado a un site. |
| **Inventory list** | Lista que asigna disponibilidad de productos a sites y ubicaciones. |
| **Price book** | Conjunto de precios y reglas para asignar precio a un producto en un contexto. |
| **Customer group** | Conjunto de shoppers que comparten elegibilidad para pricing, promociones y cupones. |
| **Customer list** | Lista nombrada de clientes usada para targeting de campañas. |
| **Source code** | Código de cupón ligado a una campaña de marketing con atribución. |
| **Page Designer** | Herramienta editorial para componer páginas y regiones con componentes. |
| **Content slot** | Ubicación programable en una página con reglas de targeting. |
| **Strangler pattern** | Patrón de migración que introduce la nueva arquitectura por rutas conviviendo con la legacy. |
| **Circuit breaker** | Patrón que deja de llamar a un proveedor degradado para evitar fallos en cascada. |
| **Bulkhead** | Patrón que aísla recursos para que un fallo no agote los comunes. |
| **Outbox** | Patrón que difiere efectos secundarios asíncronos desacoplados de la request. |
| **Cache hit ratio** | Proporción de requests servidos desde caché sin ejecutar código. |
| **Surrogate key** | Identificador lógico para invalidar grupos de entradas de caché de página. |
| **Stale-while-revalidate** | Estrategia de caché que sirve versión vieja mientras se regenera la nueva. |
| **PII** | Personally Identifiable Information: dato que identifica a una persona. |
| **DSAR** | Data Subject Access Request: solicitud de acceso/eliminación de un cliente. |
| **DSAR/GDPR** | Conjunto de derechos de los usuarios sobre sus datos y obligaciones de la empresa. |
| **RBAC** | Role-Based Access Control: control de acceso por roles. |

---

## Apéndice B: Matriz de decisión rápida

### B.1 SFRA vs SiteGenesis vs PWA Kit vs Custom headless

| Criterio | SFRA | SiteGenesis | PWA Kit | Custom headless |
| --- | --- | --- | --- | --- |
| Estado oficial | Soportado | No soportado en proyectos nuevos | Soportado | n/a |
| Curva de aprendizaje | Media | Alta (legacy) | Media-Alta | Alta |
| Velocidad de time-to-market | Alta | Baja | Alta | Baja |
| Libertad UI/UX | Media | Baja | Alta | Muy alta |
| Ecosistema React | No (ISML) | No | Sí | Sí |
| Reuso de integraciones existentes | Sí | Sí | Con bridge | No |
| Coste de upgrade SFRA | Bajo si overrides pequeños | Alto | Bajo (template extensibility) | n/a |
| Cacheabilidad built-in | Buena | Aceptable | Excelente (MRT) | Depende |
| Adecuado para | Mayoría de proyectos | Solo legacy mantenible | Composable | Casos muy específicos |

### B.2 Síncrono vs asíncrono para integraciones

| Caso de uso | Recomendación | Por qué |
| --- | --- | --- |
| Autorización de pago en checkout | Síncrono con timeout estricto | Necesario para confirmar la orden |
| Captura de pago | Híbrido (pre-auth + captura) | Permite cancelar antes del cargo |
| Stock en PDP | Eventual (réplica) | Latencia crítica; no bloquea navegación |
| Stock en checkout | Síncrono con revalidación | Última comprobación antes de cobrar |
| Export de pedidos a OMS | Asíncrono (job) | No debe bloquear la respuesta al shopper |
| Loyalty accrue | Asíncrono | Puede esperar; fallo no rompe compra |
| Tax provider | Síncrono con fallback | Necesario para totales correctos |
| Analytics events | Asíncrono con buffer | No debe afectar latencia |
| Notificaciones transaccionales | Asíncrono | El shopper no espera la entrega |
| Catálogo delta feed | Asíncrono (job) | Volumen alto; eventual consistency |

### B.3 Cuándo usar Custom Attribute vs Custom Object

| Caso | Recomendación |
| --- | --- |
| Dato de producto que se busca/refina | Custom attribute |
| Estado adicional del pedido | Custom attribute |
| Configuración que se promueve entre entornos | Custom Object replicable |
| Log de eventos por shopper | Custom Object no replicable (o sistema externo) |
| Datos con cardinalidad variable y propia entidad | Custom Object |
| Millones de eventos de analytics | Sistema externo, no SFCC |
| Tokens o secretos | Service Credentials, no CO |

### B.4 Estrategia de caché por tipo de página

| Página | Default TTL | Notas |
| --- | --- | --- |
| Home | 600s | Bajo si hay campañas activas |
| PLP | 300-600s | Invalidar por categoría y reglas de merchandising |
| PDP | 600-3600s | Más estable; cuidado con precio/inventario |
| Carrito | 0 (no cachear) | Contiene precio y datos personalizados |
| Checkout | 0 (no cachear) | Totalmente dinámico y sensible |
| Account | 0 (no cachear) | Datos privados del shopper |
| Contenido estático (CMS) | 3600-86400s | El más cacheable |
| Búsqueda con filtros | 60-300s | Invalidar por cambios de catálogo |

---

## Apéndice C: Checklist de code review para SFCC

### C.1 Cartridge y arquitectura

- [ ] La extensión está en un cartridge custom a la izquierda del path.
- [ ] No se modifica `app_storefront_base` ni cartridges de terceros.
- [ ] Los overrides están documentados (qué base extienden y por qué).
- [ ] El cartridge tiene propósito claro y nombre coherente (`int_*`, `plugin_*`, `app_custom_*`).
- [ ] Existe `hooks.json` cuando se añaden hooks nuevos.
- [ ] Los hooks tienen contrato estable y comportamiento por defecto.

### C.2 Controladores y rutas

- [ ] Cada ruta POST tiene HTTPS, CSRF, autenticación y autorización.
- [ ] Validación server-side de querystring, body y headers.
- [ ] `append`/`prepend` preferido sobre `replace`.
- [ ] `return next()` para hacer explícito el final del middleware.
- [ ] No hay `replace` sin documentar y sin regression tests.
- [ ] No se cachean respuestas con tokens CSRF o datos de sesión.
- [ ] Output encoding contextual en todas las respuestas (HTML, atributo, URL, JS).
- [ ] Errores genéricos al usuario, contexto interno en logs.
- [ ] Validación de redirects contra allowlist (no open redirects).

### C.3 Servicios externos

- [ ] Configurado en Service Framework (no credenciales en código).
- [ ] Timeout explícito y corto.
- [ ] Retry solo para operaciones idempotentes con backoff.
- [ ] Circuit breaker cuando la criticidad lo justifique.
- [ ] `filterLogMessage` para enmascarar PII y secretos.
- [ ] Métricas de latencia, error rate y status.
- [ ] Clasificación de errores reintentables vs funcionales.

### C.4 Persistencia y transacciones

- [ ] `Transaction.wrap` con operaciones de escritura únicamente.
- [ ] Sin llamadas remotas dentro de transacciones.
- [ ] Iteradores cerrados en `finally`.
- [ ] No scans completos desde storefront; jobs o sistemas externos.
- [ ] Custom attributes tienen propósito claro y no crecen sin control.
- [ ] Custom Objects con replicación configurada explícitamente.

### C.5 Frontend y assets

- [ ] Output encoding contextual en cada punto de inserción.
- [ ] Sin lógica de negocio en ISML.
- [ ] Remote includes justificados y medidos.
- [ ] Assets versionados para evitar 304 infinitos.
- [ ] Page cache no incluye datos de cuenta, carrito o CSRF.
- [ ] Fragmentos personalizados aislados del shell cacheable.
- [ ] Tamaño de bundles JS dentro del presupuesto.
- [ ] Tests de Lighthouse automatizados en CI.

### C.6 Seguridad

- [ ] HTTPS forzado en rutas que tocan sesión o datos.
- [ ] CSRF en operaciones de escritura.
- [ ] Output encoding en cada contexto.
- [ ] Autorización por recurso (no solo por sesión) en endpoints.
- [ ] Validación de webhooks con firma, timestamp y anti-replay.
- [ ] Secretos en Service Credentials, no en preferencias ni código.
- [ ] PII minimizada y con retención definida.
- [ ] Rate limiting donde aplique.
- [ ] Sin logs con tokens, CVV, PAN u otros datos sensibles.

### C.7 Release y operaciones

- [ ] Build reproducible con versiones fijadas.
- [ ] Regression suite contra rutas extendidas.
- [ ] Smoke tests post-despliegue.
- [ ] Plan de rollback compatible con datos.
- [ ] Dashboards y alertas orientados a síntomas del shopper.
- [ ] Runbook actualizado para rutas críticas.
- [ ] Logs con correlation ID end-to-end.

---

## Apéndice D: Catálogo de antipatrones

Lista rápida de errores recurrentes que un arquitecto debe detectar y corregir en revisión.

### D.1 Controladores y rutas

- `replace` cuando `append` o `prepend` bastan.
- Cambios de estado por GET.
- Lógica de negocio extensa en la ruta.
- Falta de CSRF en POST.
- Render antes de confirmar una operación transaccional.
- Confiar en `productId` enviado por el cliente sin revalidar.

### D.2 Modelos e ISML

- Exponer `dw.catalog.Product` completo a la vista.
- Llamadas a Script API dentro de plantillas.
- Filtros CSS/JS como única medida de seguridad.
- Output encoding único (HTML) para contextos mixtos.

### D.3 Caché y rendimiento

- Cachear respuestas con datos personalizados.
- Claves de caché fragmentadas por cookie única.
- Cachear errores accidentalmente.
- Remote includes innecesarios que rompen la cache del shell.
- No medir hit ratio por ruta.

### D.4 Servicios externos

- Sin timeout en checkout o PDP.
- Retry ciego de pagos.
- Reintento sin clasificar el error.
- Secretos en código o comentarios.
- Logs con payloads completos.

### D.5 Datos y transacciones

- HTTP dentro de `Transaction.wrap`.
- Iteradores no cerrados.
- Scans completos desde storefront.
- Atributos custom para datos que deberían ser Custom Object.
- Custom Object replicable con PII.

### D.6 Despliegues y operaciones

- Big bang sin fallback documentado.
- Replicar sin validar primero.
- Activar código antes de la metadata.
- Rollback incompatible con datos cambiados.
- Sin runbook para rutas críticas.
- Alertas sin umbral o sin runbook asociado.

### D.7 Seguridad y privacidad

- Open redirect sin validar destino.
- PII en logs no enmascarada.
- Webhook validado solo por IP o User-Agent.
- Customer Profile con campos no documentados ni con retención.
- Producción copiada a sandbox sin anonimizar.

### D.8 PWA Kit y headless

- Client secret en el navegador.
- Tokens en `localStorage` en lugar de cookies.
- Rutas PWA Kit cacheando respuestas personalizadas.
- Configuración de eCDN sin probar el routing.
- Session bridging sin probar el flujo end-to-end.

### D.9 Experimentación

- Peeking frecuente en A/B tests.
- Métrica primaria poco clara.
- Variantes que afectan el SEO sin canonical.
- Feature flag sin kill switch.
- Test sobre superficie con poca muestra.

### D.10 Performance testing

- Load test contra producción o sandbox con cuotas compartidas.
- Métricas Core Web Vitals no monitorizadas.
- Presupuesto de performance no aplicado en CI.
- Sin soak test (leaks no detectados).
- Spike test ausente ante eventos previsibles (Black Friday, campañas).

---

## Apéndice E: Plantillas reutilizables

### E.1 Plantilla de ADR (Architecture Decision Record)

```markdown
# ADR-XXX: <Título corto y descriptivo>

## Contexto
- ¿Qué problema o requisito motiva la decisión?
- ¿Qué restricciones aplican (plataforma, presupuesto, plazos)?

## Decisión
- ¿Qué se ha decidido?
- ¿Qué alternativas se consideraron?

## Consecuencias
- Positivas:
  - ...
- Negativas / riesgos:
  - ...
- Mitigaciones:
  - ...

## Operación
- ¿Cómo se observa?
- ¿Cómo se rollback?
- ¿Qué SLO aplica?
```

### E.2 Plantilla de runbook

```markdown
# Runbook: <Ruta o servicio>

## Síntomas detectables
- Métrica: ...
- Log: ...
- Alerta: ...

## Diagnóstico
1. Verificar <métrica o log>
2. Comprobar <servicio dependiente>
3. ...

## Mitigación preaprobada
- [ ] Acción 1 (autorización: ...)
- [ ] Acción 2 (kill switch: ...)

## Escalado
- Nivel 1: ...
- Nivel 2: ...
- Nivel 3: ...

## Postmortem
- Disparar postmortem si: ...
```

### E.3 Plantilla de postmortem sin culpa

```markdown
# Postmortem: <Incidente>

## Resumen
- Fecha:
- Duración:
- Impacto en shoppers / negocio:
- Severidad:

## Timeline
- HH:MM — Evento 1
- HH:MM — Evento 2
- ...

## Causa raíz
- Causa inmediata:
- Causa sistémica:

## Qué funcionó
- ...

## Qué no funcionó
- ...

## Action items
- [ ] Acción — responsable — fecha
- [ ] Acción — responsable — fecha
```

---

## Apéndice F: Temas de entrevista por seniority

Útil para ajustar la profundidad esperada en cada nivel.

### Junior / Mid

- SFRA, cartridges, modelo mental.
- Controllers, validación y CSRF.
- ISML y modelos básicos.
- Custom attributes vs Custom Objects.
- Diferencia entre OCAPI y SCAPI.
- Conceptos de caché.

### Senior

- Diseño de jobs y chunk steps.
- Estrategias de reintento y circuit breaker.
- Page Designer, SEO técnico, facetas.
- Persistencia, transacciones e iteradores.
- Service Framework, SLAS y session bridging.
- Estrategia de release y rollback.
- Pruebas de rendimiento y presupuestos.

### Arquitecto / Lead

- Decisiones multi-tenant y cuotas.
- Phased rollouts SFRA → PWA Kit.
- eCDN y routing híbrido.
- SLOs, error budgets y runbooks.
- Privacidad, RGPD, DSAR y consentimiento.
- Estrategias de experimentación y feature flags.
- Migración SiteGenesis → SFRA.
- Diseño de catálogos y price books a escala.
- Decisión síncrono vs asíncrono.
- Postmortems y cultura operativa.
