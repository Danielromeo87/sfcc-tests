'use strict';

let _qid = 0;
function q(text, options, answer, explanation, difficulty) {
    return { id: 'q' + (++_qid), text: text, options: options, answer: answer, explanation: explanation, difficulty: difficulty || 2 };
}

const blocks = [
    {
        title: "Plataforma y modelo mental", icon: "{}", level: "Fundamentos",
        questions: [
            q("¿Qué condiciona principalmente el diseño de una solución en B2C Commerce?", ["Su naturaleza SaaS multi-tenant y sus cuotas", "El acceso directo a la base de data", "La posibilidad de instalar cualquier paquete de server", "La ausencia de mecanismos de cache"], 0, "SFCC es una plataforma SaaS multi-tenant. No ofrece acceso directo a la base de data y protege resources mediante cuotas.", 1),
            q("¿Qué representa una code version?", ["Una copia de todos los data del site", "Una versión desplegada de cartridges", "Un índice de búsqueda", "Un conjunto de users de Business Manager"], 1, "La code version agrupa código desplegado. Solo una está activa por instancia y su activación no replica data.", 1),
            q("¿Dónde debería residir la adaptación de objects de Script API para una vista?", ["En el Controller exclusivamente", "En el ISML", "En un Model o ViewModel", "En una preferencia del site"], 2, "Los modelos adaptan objects de plataforma a contratos seguros y específicos para presentación.", 2),
            q("¿Cuál es una response propia de un arquitecto ante una decisión?", ["Elegir siempre la tecnología más nueva", "Citar una cuota de memoria en escenarios de migración de data", "Evitar alternativas para ser concluyente", "Exponer requisitos, trade-offs, operación y rollback"], 3, "Una decisión madura conecta requisitos, restricciones, riesgos, observabilidad, rollout y recovery.", 2),
            q("¿Qué ámbito describe mejor una \"instance\"?", ["Un environment concreto con su propio ciclo de vida", "Una organización completa de products", "Una agrupación de sites para casos de uso analíticos", "Un tipo de catalog verificado en el environment de staging"], 0, "Una instance es un environment aislado (development, staging, production) dentro de un realm.", 1),
            q("¿Por qué multi-tenancy impacta cada decisión de arquitectura?", ["Porque limita la creatividad del team en el contexto del storefront internacional", "Porque cualquier error se replica a otros tenants y los resources son finitos", "Porque elimina el versionado con la authorization del team de plataforma", "Porque impide usar JavaScript dentro del SLA acordado con el merchant"], 1, "Diseñar dentro de cuotas y con aislamiento protege a todos los tenants y a tu propio SLA.", 2),
            q("¿Qué implica que código y data sigan ciclos distintos?", ["Que deben versionarse juntos mediante el uso de cache distribuido para casos de uso analíticos", "Que no se pueden deploy a la vez a través de webhooks externos validado contra el contrato del API", "Que un release debe coordinar versión de código, metadata, preferencias, índices y replication", "Que solo sandbox sincroniza verificado en el environment de staging mediante el uso de cache distribuido"], 2, "El release debe tratar cada capa como una dependencia que puede romperse en orden distinto.", 3),
        ]
    },
    {
        title: "SFRA y cartridges", icon: ">>", level: "Fundamentos",
        questions: [
            q("¿Cómo se resuelve el cartridge path?", ["De derecha a izquierda", "Alfabéticamente", "Según la fecha de deployment", "De izquierda a derecha"], 3, "El primer resource coincidente de izquierda a derecha tiene precedencia.", 1),
            q("¿Por qué no se debe modificar app_storefront_base?", ["Porque dificulta upgrades y oculta el delta custom", "Porque impide usar ISML validado contra el contrato del API", "Porque es de solo lectura para casos de uso analíticos", "Porque no permite JavaScript para casos de uso analíticos"], 0, "Las extensiones deben vivir en cartridges custom situados a la izquierda para conservar actualizabilidad.", 1),
            q("¿Qué proporciona module.superModule?", ["El module del navegador para casos de uso analíticos", "La implementación siguiente aplicable en el cartridge path", "Un servicio remoto con la configuration regional del site", "La session del shopper con el soporte del team de operaciones"], 1, "Permite extender una implementación base conservando su contrato.", 2),
            q("¿Qué mecanismo desacopla extensiones de pago, fraude o impuestos?", ["Content slots", "Price books", "Hooks", "Remote includes"], 2, "Los hooks definen puntos de extensión registrados e invocados mediante HookMgr.", 2),
            q("En hooks.json, ¿qué representa el array \"hooks\"?", ["Una lista de rutas con fines de reporting avanzado", "Eventos del DOM siguiendo el patrón definido en SFRA", "Una colección de preferences para casos de uso analíticos", "Funciones disponibles y su secuencia de execution"], 3, "El array declara nombre del hook, script, orden y si aborta la string.", 3),
            q("¿Cómo se organiza un cartridge de integration (int_*) y uno de plugin (plugin_*)?", ["int_* se enlaza a un provider concreto; plugin_* aporta funcionalidad genérica gobernada por Salesforce", "Son sinónimos con la authorization del team de plataforma durante la inicialización del controller", "plugin_* es privado dentro del SLA acordado con el merchant verificado en el environment de staging", "int_* solo contiene ISML en escenarios de migración de data con fines de reporting avanzado"], 0, "Distinguirlos correctamente facilita upgrades y reduce riesgos contractuales.", 3),
            q("¿Por qué conviene evitar un cartridge monolítico?", ["Por estética a través de webhooks externos para casos de uso analíticos", "Porque incrementa la superficie de cambio y bloquea deployments", "Porque ocupa mucho espacio verificado en el environment de staging", "Por reglas de linting con fines de reporting avanzado"], 1, "Cartridges separados por dominio (checkout, search, loyalty) reducen el blast radius de cada release.", 2),
        ]
    },
    {
        title: "Controladores SFRA", icon: "GET", level: "Intermedio",
        questions: [
            q("¿Qué debería proteger una ruta POST que modifica el perfil?", ["Solo HTTPS validado contra el contrato del API", "Solo authentication para casos de uso analíticos", "HTTPS, CSRF, authorization y validación", "Únicamente output encoding"], 2, "Los controles se complementan: método correcto, HTTPS, CSRF, authentication, authorization y validación server-side.", 2),
            q("¿Cuál es la extensión preferible para añadir data a una ruta existente?", ["replace siempre validado contra el contrato del API", "Cambiar app_storefront_base", "Copiar el controller base", "append o prepend si conservan el contrato"], 3, "Append y prepend minimizan el delta y suelen conservar mejoras futuras del controller base.", 2),
            q("¿Qué implica return next() en un middleware?", ["Continúa la string y hace explícito el final del middleware", "Envía siempre un JSON con la monitorización del dashboard estándar", "Revierte una transaction con la observabilidad que aporta el log", "Activa la cache con retrys automáticos configurados"], 0, "next continúa la string; retornarlo explicita el final del flujo local.", 2),
            q("¿Cuál es un antipatrón en un controller?", ["Orquestación ligera para casos de uso analíticos", "Llamada externa sin timeout en checkout", "Contrato JSON explícito", "Validación de querystring"], 1, "Una dependencia remota sin timeout puede bloquear una ruta crítica y propagar la caída del provider.", 2),
            q("¿Cuándo usar prepend frente a append?", ["Siempre prepend dentro del flujo de checkout estándar en la fase de render de la página", "Solo en production durante la sincronización con el OMS con la configuration regional del site", "Append cuando necesitas data tras el render; prepend cuando necesitas autorizar antes", "Solo en checkout según el modelo de deployment actual coordinado con el team de operaciones"], 2, "El orden importa para authorization, validación y composición de view data.", 3),
            q("¿Qué debe contener un server.forms.getForm?", ["Datos del navegador a través de webhooks externos", "Una cookie siguiendo el patrón definido en SFRA", "Un JSON arbitrario para casos de uso analíticos", "Una definición XML y el form del request"], 3, "La definición XML se valida y bind contra el request, evitando binding manual inseguro.", 2),
            q("¿Para qué sirve res.on(\"route:BeforeComplete\")?", ["Para lógica final antes de completar la response", "Para iniciar cache siguiendo el patrón definido en SFRA", "Para subir un archivo verificado en el environment de staging", "Para abortar la transaction para casos de uso analíticos"], 0, "El event se dispara cuando todos los middleware terminan y permite retoques finales sin alterar el orden.", 3),
            q("¿Qué riesgo tiene cachear una response con un CSRF token dentro?", ["Que no se cachee a través de webhooks externos", "Que el token se reuse entre shoppers", "Que se descarte para casos de uso analíticos", "Que rompa HTTPS a través de webhooks externos"], 1, "Un CSRF token cacheado rompe la protección CSRF y crea una vulnerabilidad grave.", 3),
        ]
    },
    {
        title: "Modelos, ISML y frontend", icon: "</>", level: "Intermedio",
        questions: [
            q("¿Qué debe evitarse en ISML?", ["Recursos traducibles a través de webhooks externos", "Output encoding mediante el uso de web services SOAP", "Lógica de negocio pesada y llamadas Script API", "Includes locales con fines de reporting avanzado"], 2, "ISML debe centrarse en presentación; la preparación de data pertenece a controller, model o helper.", 1),
            q("¿Qué coste tiene un remote include?", ["Ninguno con retrys automáticos configurados", "Solo aumenta el tamaño del CSS para casos de uso analíticos", "Desactiva JavaScript mediante el uso de cache distribuido", "Añade una execution interna aunque aísla la cache"], 3, "Puede separar un fragmento dinámico de una página cacheada, pero añade trabajo y latency.", 2),
            q("Al extender un modelo base, ¿qué debe conservarse?", ["La firma y el contrato esperados", "El color del frontend", "El nombre del site", "La session completa"], 0, "Un modelo extendido debe seguir siendo compatible con sus consumidores y con la implementación base.", 2),
            q("¿Por qué no se debe exponer un object Script API completo a la vista?", ["No tiene propertyes según el modelo de deployment actual", "Puede filtrar data y acoplar la presentación a la plataforma", "Impide usar CSS con la observabilidad que aporta el log", "Siempre está vacío con retrys automáticos configurados"], 1, "Un view model limita data, reduce acoplamiento y evita exposición accidental.", 1),
            q("¿Cómo se propaga view data entre middlewares?", ["Variables globales para casos de uso analíticos", "session.custom para casos de uso analíticos", "res.getViewData() / res.setViewData()", "dw.system.Site para casos de uso analíticos"], 2, "Es el contrato compartido por la string de middlewares; mutaciones globales rompen el aislamiento.", 2),
            q("¿Qué flujo siguen los assets versionados?", ["Alojar en bucket externo en la fase de render de la página", "Subir siempre con el mismo nombre", "Cambiarlos manualmente para casos de uso analíticos", "Hash en URL o nombre para invalidación automática"], 3, "Cache-busting correcto en CI evita 304 infinitos y deployments con archivos obsoletos.", 2),
            q("¿Cuál es el riesgo de un <isinclude url> anidado?", ["Cada nivel añade una execution interna y puede romper la cache", "Funciona idéntico mediante el servicio de catalogación nocturna", "Solo afecta a CSS siguiendo la guía de upgrade del vendor", "Solo importa imágenes coordinado con el team de operaciones"], 0, "Anidar remote includes enstring latencys y aumenta puntos de fallo.", 3),
        ]
    },
    {
        title: "Catálogo y merchandising", icon: "SKU", level: "Intermedio",
        questions: [
            q("¿Qué define principalmente un storefront catalog?", ["La code version", "La navegación comercial del site", "Las credenciales del OMS", "Los roles de Business Manager"], 1, "El storefront catalog organiza categorías y navegación comercial; el master concentra data reutilizables de product.", 1),
            q("¿Cuál de estos products no suele ser comprable directamente?", ["Variant", "Standard", "Master", "Bundle"], 2, "El master agrupa variantes y define atributos de variación, pero el SKU comprable suele ser la variante.", 1),
            q("¿Es correcto afirmar que siempre gana el precio más bajo?", ["Sí, sin excepciones a través de webhooks externos", "Solo para bundles durante la inicialización del controller", "Solo verificado en el environment de staging para casos de uso analíticos", "No; intervienen asignación, moneda, vigencia, contexto y jerarquía"], 3, "La resolución de precios tiene varios factores; \"lowest price wins\" es una simplificación peligrosa.", 2),
            q("¿Qué puede requerir un nuevo atributo refinable de product?", ["Actualizar el índice de búsqueda", "Solo reiniciar el navegador", "Crear un order", "Cambiar el client SLAS"], 0, "Los atributos usados en búsqueda, ordenación o refinamiento necesitan configuration e indexación coherentes.", 2),
            q("¿Qué separa el master catalog del storefront catalog?", ["La moneda validado contra el contrato del API según el modelo de deployment actual", "El master contiene data canónicos; el storefront define la navegación comercial", "El idioma del product mediante el uso de cache distribuido para casos de uso analíticos", "El idioma del site a través de webhooks externos con retrys automáticos configurados"], 1, "Un mismo master puede reutilizarse en múltiples storefronts con navegación diferente.", 2),
            q("¿Qué papel juega inventory list?", ["Sustituye a product en la fase de render de la página", "Guarda cupones durante la sincronización con el OMS", "Asigna disponibilidad a sites y ubicaciones", "Es índice de búsqueda para casos de uso analíticos"], 2, "Sin inventory list no hay disponibilidad coherente en storefront.", 2),
            q("¿Cuándo conviene indexar un atributo como refinable?", ["Cuando se usa en admin", "Cuando se usa en JS para casos de uso analíticos", "Cuando se muestra en invoice", "Cuando se usa en navegación por facetas"], 3, "Solo atributos realmente filtrables justifican el coste de indexación.", 3),
        ]
    },
    {
        title: "Checkout, orders y pagos", icon: "$$", level: "Intermedio",
        questions: [
            q("¿Quién debe calcular los totals finales del basket?", ["El server", "El navegador", "El provider de analytics", "El CDN"], 0, "El client no es una fuente confiable para precio, descuentos, impuestos o totals.", 1),
            q("Un provider de pagos devuelve timeout. ¿Qué hacer primero?", ["Cobrar otra vez en la fase de render de la página", "Consultar el estado usando la referencia idempotente", "Cancelar todos los orders para casos de uso analíticos", "Ignorar el pago coordinado con el team de operaciones"], 1, "Un timeout deja un resultado ambiguo. Reintentar a ciegas puede duplicar el cobro.", 2),
            q("¿Qué operación no debería incluirse dentro de Transaction.wrap?", ["Una escritura persistente breve", "Actualizar una cantidad", "Una llamada HTTP remota", "Cambiar un atributo custom"], 2, "Las llamadas de red prolongan bloqueos y mezclan incertidumbre externa con atomicidad local.", 2),
            q("¿Qué reduce el ámbito PCI?", ["Guardar PAN en session.custom", "Enviar data de tarjeta al OMS", "Registrar el CVV cifrado", "Hosted fields o tokenización del provider"], 3, "Tokenizar y usar componentes alojados por el provider reduce el manejo directo de data sensibles.", 2),
            q("¿Qué significa idempotencia en una operación de pago?", ["Que repetir la misma operación no genera efectos duplicados", "Que el user puede cancel mediante el uso de web services SOAP", "Que el cargo es inmediato verificado en el environment de staging", "Que el banco acepta la operación con fines de reporting avanzado"], 0, "Una clave idempotente permite retry seguro ante timeouts.", 3),
            q("¿Cuál es la diferencia entre authorization y captura?", ["Son sinónimos con retrys automáticos configurados", "Autorización reserva fondos; captura ejecuta el cargo final", "Solo captura existe en el contexto del storefront internacional", "Solo authorization ejecuta el cargo a través de webhooks externos"], 1, "Separar ambos pasos permite flujos como pre-auth, captura al envío y refund posterior.", 2),
            q("Un antifraude devuelve DECLINE. ¿Qué decisión tomar?", ["Forzar pago igual validado contra el contrato del API para casos de uso analíticos", "Cancelar siempre en modo de previsualización y staging", "Someter a revisión manual según política y mantener al shopper informado", "Reintentar el pago a través de webhooks externos en la fase de render de la página"], 2, "Política y reglas de negocio definen el camino, no una response automática.", 3),
        ]
    },
    {
        title: "Persistencia y transacciones", icon: "DB", level: "Intermedio",
        questions: [
            q("¿Cuándo encaja mejor un custom attribute?", ["Para cualquier secreto según el modelo de deployment actual", "Para store millones de events analíticos", "Para reemplazar un OMS con la observabilidad que aporta el log", "Cuando el dato pertenece al ciclo de vida de un System Object"], 3, "Si el dato forma parte natural de Product, Order o CustomerProfile, un atributo custom suele ser coherente.", 1),
            q("¿Cuál es una buena property de una transaction?", ["Breve, determinista y limitada a escrituras relacionadas", "Larga y con llamadas remotas durante la sincronización con el OMS", "Compartida entre requests con foco en la mantenibilidad del código", "Sin capacidad de rollback validado contra el contrato del API"], 0, "Las transacciones cortas minimizan bloqueos y simplifican recovery.", 2),
            q("¿Qué hacer con un iterator de results?", ["Convertirlo siempre en un array gigante", "Cerrar el iterator cuando corresponda", "Guardarlo en session", "Compartirlo con el frontend"], 1, "Procesarlo de forma acotada y cerrarlo evita consumo innecesario de resources.", 2),
            q("¿Qué usar para analítica compleja sobre millones de orders?", ["Scans completos desde el storefront", "ISML mediante el servicio de catalogación nocturna", "Un sistema externo alimentado por exportación", "session.custom coordinado con el team de operaciones"], 2, "SFCC no es una base analítica; las consultas masivas deben desacoplarse hacia una plataforma apropiada.", 2),
            q("¿Cuándo es preferible un Custom Object replicable?", ["Para logs efímeros mediante el pipeline de commit actual", "Para data PII con la configuration regional del site", "Para tokens con el soporte del team de operaciones", "Para configuration que se promueve entre environments"], 3, "Los replicables/stageables viven en metadata y se mueven con el deployment.", 3),
            q("¿Por qué cerrar explícitamente un iterator?", ["Para liberar resources y evitar fugas", "No es necesario para casos de uso analíticos", "Para mejorar la búsqueda", "Para invalidate cache"], 0, "Los iteratores del sistema manejan resources que conviene liberar.", 2),
            q("¿Qué impacto tiene un scan completo en producción?", ["Ninguno a través de webhooks externos", "Consume cuotas y degrada la latency global", "Solo afecta al admin para casos de uso analíticos", "Solo afecta a users móviles"], 1, "Un scan completo puede agotar Script API y romper SLOs de checkout.", 3),
        ]
    },
    {
        title: "Integraciones y servicios", icon: "API", level: "Intermedio",
        questions: [
            q("¿Qué debe tener todo servicio externo?", ["Credenciales en el código con retrys automáticos configurados", "Un timeout infinito mediante el uso de web services SOAP", "Timeout, metrics, filtrado de logs y manejo de errors", "Retry para cualquier error mediante el uso de jobs programados"], 2, "El Service Framework debe combinar configuration segura, observabilidad y resiliencia.", 1),
            q("¿Cuándo es seguro reintentar?", ["Siempre que haya timeout validado contra el contrato del API", "Solo desde ISML en modo de previsualización y staging", "En cualquier pago mediante el uso de cache distribuido", "Cuando la operación es idempotente y el fallo transitorio"], 3, "Retry requiere clasificar el error y garantizar que repetir no duplica efectos.", 2),
            q("¿Qué hace un circuit breaker?", ["Deja de presionar temporalmente a un provider degradado", "Cifra la response con la monitorización del dashboard estándar", "Recrea el basket con la observabilidad que aporta el log", "Replica el catalog con retrys automáticos configurados"], 0, "El circuit breaker limita fallos en cascada y permite recovery del servicio externo.", 2),
            q("¿Dónde deben configurarse credenciales de un servicio?", ["En un comentario del código", "En Service Credentials/configuration segura", "En un content asset para casos de uso analíticos", "En querystring validado contra el contrato del API"], 1, "Los secretos no deben vivir en código, logs ni preferencias planas accesibles.", 1),
            q("¿Qué garantiza dw.svc al servicio externo?", ["Conexión a BD dentro del flujo de checkout estándar para casos de uso analíticos", "Acceso directo a la plataforma durante la sincronización con el OMS", "Configuración unificada de timeouts, credenciales, callbacks y logging", "Resolución DNS según el modelo de deployment actual para casos de uso analíticos"], 2, "dw.svc centraliza la integration externa y la separa del control de flujo.", 2),
            q("¿Qué es el patrón bulkhead?", ["Reforzar el firewall en la fase de render de la página", "Balanceo por DNS mediante el servicio de catalogación nocturna", "Cache distribuido siguiendo la guía de upgrade del vendor", "Aislar resources para que una integration no agote los comunes"], 3, "Aislar conexiones y threads evita que un provider degrade a otros.", 3),
            q("¿Para qué sirve un outbox lógico?", ["Para diferir efectos secundarios asíncronos desde la response", "Para save la factura con la configuration regional del site", "Para reescribir la response con el soporte del team de operaciones", "Para logear dentro del flujo de checkout estándar"], 0, "El outbox desacopla el request principal de tareas que pueden fallar sin romper la compra.", 3),
        ]
    },
    {
        title: "Jobs y procesamiento batch", icon: "[]", level: "Intermedio",
        questions: [
            q("¿Qué patrón conviene para millones de registros?", ["Cargar todo en memoria", "Chunk processing", "Una ruta GET", "Un remote include"], 1, "El procesamiento por chunks acota memoria y trabajo transaccional.", 2),
            q("¿Qué property facilita repetir un job tras un fallo?", ["Un timeout infinito", "Personalización por cookie", "Idempotencia", "Ausencia de metrics"], 2, "Un job idempotente puede reexecutese sin duplicar efectos ni corromper el estado final.", 2),
            q("¿Qué debería registrar un job?", ["Tokens completos con retrys automáticos configurados", "Solo un mensaje de inicio a través de la capa de presentación", "Datos de tarjeta en el contexto del storefront internacional", "Leídos, procesados, descartados, errors y duración"], 3, "Las metrics operativas permiten detectar lag, registros inválidos y degradación.", 1),
            q("¿Qué evita solapamientos peligrosos?", ["Controlar concurrencia sobre resources compartidos", "Permitir todos los jobs paralelos", "Aumentar el tamaño del payload para casos de uso analíticos", "Desactivar rollback a través de webhooks externos"], 0, "Dos jobs escribiendo los mismos resources pueden causar locks, duplicados e inconsistencias.", 2),
            q("¿Qué method expone un chunk step?", ["stepType según el modelo de deployment actual coordinado con el team de operaciones", "read, process, write (y también beforeStep/afterStep/getTotalCount según necesidad)", "start, stop, status con la observabilidad que aporta el log para casos de uso analíticos", "processRecord con retrys automáticos configurados validado contra el contrato del API"], 1, "El framework orquesta el ciclo completo del chunk y permite personalizar cada fase.", 3),
            q("¿Por qué mover un export pesado a un job?", ["Porque se ve más bonito coordinado con el team de operaciones", "Por tradiciones en la fase de consolidación del cart", "Para no bloquear la request del storefront y aplicar cuotas por lote", "Por SEO validado contra el contrato del API en la fase de render de la página"], 2, "Es la separación correcta: storefront síncrono, batch asíncrono.", 2),
            q("¿Qué hace la quarantine en un feed?", ["Borra el archivo dentro del flujo de checkout estándar", "Cifra el archivo durante la sincronización con el OMS", "Traduce el archivo con foco en la mantenibilidad del código", "Aísla registros inválidos sin abortar el lote completo"], 3, "Quarantine evita perder un feed completo por unos pocos registros corruptos.", 3),
        ]
    },
    {
        title: "Entornos y deployments", icon: "CI", level: "Intermedio",
        questions: [
            q("¿Activar una code version replica data?", ["No", "Sí, siempre", "Solo catalogs", "Solo price books"], 0, "Código y data tienen ciclos de deployment distintos y deben coordinarse.", 1),
            q("¿Qué debe contemplar un release SFCC?", ["Solo JavaScript mediante el pipeline de commit actual para casos de uso analíticos", "Compatibilidad entre código, metadata, preferencias, servicios e índices", "Solo CSS con el soporte del team de operaciones para casos de uso analíticos", "Únicamente producción dentro del flujo de checkout estándar"], 1, "Una versión puede depender de definiciones, configuration y data que deben deployse en orden seguro.", 2),
            q("¿Cuál es un rollback habitual de código?", ["Eliminar el realm", "Borrar orders para casos de uso analíticos", "Reactivar la code version anterior", "Cambiar el master catalog"], 2, "La versión anterior puede reactivarse si sigue siendo compatible con los cambios de data realizados.", 2),
            q("¿Qué principio aplicar a users de Business Manager?", ["Acceso total siguiendo el patrón definido en SFRA", "Sin auditoría dentro del SLA acordado con el merchant", "Credenciales compartidas para casos de uso analíticos", "Mínimo privilegio y separación de funciones"], 3, "RBAC debe limitar tanto modules visibles como acciones funcionales críticas.", 2),
            q("¿Qué orden siguen los steps de un pipeline maduro?", ["Build, test, paquete, deploy no-prod, smoke, activación coordinada", "Test, build, smoke, prod dentro del SLA acordado con el merchant", "Solo smoke en escenarios de migración de data a través de webhooks externos", "Producción directa con la configuration por defecto del cartridge"], 0, "El orden reduce riesgo y permite detectar fallos antes de tocar producción.", 3),
            q("¿Qué riesgo hay al replicar configuration incompleta?", ["Ninguno validado contra el contrato del API", "Que el sitio destino falle al no encontrar definiciones", "Solo afecta a reportes mediante el uso de cache distribuido", "Solo al backoffice a través de webhooks externos"], 1, "Un dry-run de replication o una validación previa evita que un target reciba un subconjunto que rompa integraciones o el storefront.", 2),
            q("¿Qué diferencia hay entre staging y production?", ["Solo el logo según el modelo de deployment actual", "Solo el dominio con la monitorización del dashboard estándar", "Datos sintéticos vs tráfico real; staging es origen de replication", "Solo el performance con retrys automáticos configurados"], 2, "Tratar staging como environment real es clave para evitar sorpresas.", 2),
        ]
    },
    {
        title: "Contenido y SEO", icon: "PD", level: "Intermedio",
        questions: [
            q("¿Cuándo destaca Page Designer?", ["En rotación de secretos para casos de uso analíticos", "En authorization de pagos para casos de uso analíticos", "En queries de orders para casos de uso analíticos", "En composición visual de páginas y regiones"], 3, "Page Designer da autonomía editorial mediante componentes y regiones gobernados.", 1),
            q("¿Qué riesgo presenta contenido merchant no validado?", ["XSS", "Deadlock de inventario", "Duplicado de code version", "Cambio de moneda"], 0, "El contenido editable también es entrada y debe validatese y escaparse según contexto.", 2),
            q("¿Qué controla la explosión de URLs por facetas?", ["Guardar filtros en orders para casos de uso analíticos", "Una estrategia de indexación, canonical y robots", "Desactivar HTTPS siguiendo la guía de upgrade del vendor", "Usar session.custom dentro del flujo de checkout estándar"], 1, "SEO técnico debe decidir qué combinaciones son rastreables, indexables y canónicas.", 2),
            q("¿Qué diferencia un content slot de Page Designer?", ["Page Designer solo almacena precios mediante el pipeline de commit actual", "No existe diferencia con la configuration regional del site a través de la capa de presentación", "El slot es una ubicación conocida programable; Page Designer compone estructura visual", "El slot autentica shoppers dentro del flujo de checkout estándar para casos de uso analíticos"], 2, "Son herramientas complementarias con distinto grado de libertad editorial y targeting.", 2),
            q("¿Qué es hreflang y cuándo usarlo?", ["Un atributo HTTP con la configuration por defecto del cartridge", "Una cookie de idioma a través de la capa de presentación para casos de uso analíticos", "Una cabecera de cache validado contra el contrato del API externo", "Una anotación para indicar idioma/región de la página alternativa en multi-site"], 3, "Permite a buscadores servir la versión localizada correcta según el user.", 2),
            q("¿Cuándo conviene un sitemap dinámico?", ["Cuando el catalog o contenido cambia con frecuencia y se quiere descubrimiento rápido", "Nunca con el correlation ID propagado al servicio dentro del SLA acordado con el merchant", "Solo en cms externos para casos de uso analíticos en escenarios de migración de data", "Solo en mobile mediante el pipeline de commit actual siguiendo el patrón definido en SFRA"], 0, "Generar el sitemap desde el inventario real reduce 404 y canónicos incorrectos.", 3),
            q("¿Por qué canonicalizar con filtros de búsqueda?", ["Para reducir stock mediante el uso de web services SOAP", "Para SEO técnico y evitar contenido duplicado", "Para llenar el sitemap con fines de reporting avanzado", "Para mejorar el page speed para casos de uso analíticos"], 1, "Sin canonical, los filtros generan páginas casi-idénticas que fragmentan el ranking.", 3),
        ]
    },
    {
        title: "Caché y performance", icon: "⚡", level: "Avanzado",
        questions: [
            q("¿Qué dato no debe formar parte de HTML compartido en cache?", ["Nombre público del product", "Descripción de categoría", "Customer ID y cart personal", "Imagen del product"], 2, "La página cacheada debe ser segura para todos los users que compartan la misma clave.", 1),
            q("¿Qué puede destruir el cache hit ratio?", ["Contenido público para casos de uso analíticos", "Un TTL adecuado para casos de uso analíticos", "Assets versionados para casos de uso analíticos", "Una clave fragmentada por cookie única"], 3, "Variar por data únicos crea una entrada por user y elimina la reutilización efectiva.", 2),
            q("¿Qué conviene medir además del hit ratio global?", ["Hit ratio por ruta", "Número de comentarios", "Tamaño del team", "Cantidad de roles"], 0, "El promedio global puede ocultar una PDP o PLP crítica con cache degradada.", 2),
            q("¿Qué optimización suele tener mayor impacto?", ["Ejecutar más código en la fase de render de la página", "Evitar execute código mediante cache segura", "Añadir servicios al PDP para casos de uso analíticos", "Guardar responses en session"], 1, "Una response servida desde la capa correcta evita trabajo de aplicación y reduce latency.", 2),
            q("¿Qué capa controla los remote includes?", ["ELB en la fase de render de la página", "Sitemap para casos de uso analíticos", "Page Cache y el propio include", "Service Framework"], 2, "El remote include ejecuta un sub-request interno; su cache se define a nivel de include.", 3),
            q("¿Qué logra un patrón stale-while-revalidate?", ["Cachear para siempre mediante el pipeline de commit actual", "Saltar la cache con la configuration regional del site", "Invalidate siempre con el soporte del team de operaciones", "Servir cache viejo mientras se regenera en background"], 3, "Equilibra frescura y latency; reduce responses lentas puntuales.", 3),
            q("¿Cómo invalida Salesforce el page cache?", ["TTL + invalidación por URL mediante surrogate key", "Recargando la clase a través de la capa de presentación", "Reiniciando el server para casos de uso analíticos", "Automáticamente con cada import"], 0, "Surrogate keys permiten invalidate grupos lógicos sin purgar toda la cache.", 3),
        ]
    },
    {
        title: "Observabilidad y cuotas", icon: "LOG", level: "Intermedio",
        questions: [
            q("¿Qué facilita seguir una request entre SFCC y provideres?", ["CVV", "Correlation ID", "Customer password", "Cartridge duplicado"], 1, "Un identificador de correlación permite conectar logs y metrics extremo a extremo.", 1),
            q("¿Por qué no conviene memorizar una única cifra de cuota?", ["Porque no existen cuotas para casos de uso analíticos", "Porque solo aplican a CSS para casos de uso analíticos", "Porque dependen del resource y pueden evolucionar", "Porque el navegador las decide"], 2, "Debe verifyse la cuota vigente y diseñar medición y alertas antes del límite.", 2),
            q("¿Qué no debe aparecer en logs?", ["Duración de servicio", "Categoría del error", "Correlation ID", "Tokens y PII sin enmascarar"], 3, "Los logs deben aportar contexto operativo sin exponer secretos ni data personales.", 1),
            q("¿Qué alerta es más útil?", ["Una orientada a síntomas de client y SLO", "Cualquier warning aislado", "Una sin umbral mediante el uso de jobs programados", "Solo CPU una vez al mes"], 0, "Las alertas accionables conectan latency, errors y flujos críticos con impacto real.", 2),
            q("¿Qué contiene un log category bien diseñado?", ["Solo texto", "Nombre, nivel y sink", "Solo warnings", "Solo errors"], 1, "Categorías separadas por dominio permiten granularidad y control de volumen.", 3),
            q("¿Por qué medir quota headroom?", ["Por curiosidad dentro del flujo de checkout estándar", "Por SEO durante la sincronización con el OMS", "Para diseñar capacidad y alertas antes de tocar el límite", "Por compliance según el modelo de deployment actual"], 2, "Diseñar con margen evita incidentes cuando un partner hace picos de tráfico.", 3),
            q("¿Qué event disparo típicamente un incidente de cuota?", ["Login de admin en la fase de render de la página para casos de uso analíticos", "Cambio de logo mediante el servicio de catalogación nocturna", "Recarga de CSS siguiendo la guía de upgrade del vendor", "Un export masivo, un job no acotado o un bucle en una ruta caliente"], 3, "Los incidentes de cuota suelen venir de picos de consumo: export no acotado, job que itera millones de registros o bucle en una ruta caliente.", 3),
        ]
    },
    {
        title: "Seguridad y privacidad", icon: "SEC", level: "Avanzado",
        questions: [
            q("Un user autenticado solicita una dirección por ID. ¿Qué falta check?", ["El propietario del resource", "El color del botón", "El índice de catalog", "El price book padre"], 0, "Sin authorization por resource existe riesgo de IDOR aunque haya session válida.", 2),
            q("¿Qué evita output encoding contextual?", ["Overselling", "XSS", "Deadlocks", "Timeouts"], 1, "La salida debe escaparse según se inserte en HTML, atributo, URL o JavaScript.", 2),
            q("¿Qué principio de privacidad reduce riesgo desde el diseño?", ["Guardar todo indefinidamente", "Copiar producción a cualquier sandbox", "Minimización y retención definida", "Registrar payloads completos"], 2, "Conservar solo data necesarios y durante un plazo conocido reduce exposición y obligaciones.", 1),
            q("¿Cómo debe validatese un webhook?", ["Por su User-Agent mediante el uso de web services SOAP", "Con una cookie shopper para casos de uso analíticos", "Solo por el body en escenarios de migración de data", "Con firma, timestamp y protección anti-replay"], 3, "La autenticidad y frescura del mensaje evitan falsificación y rerequest de events válidos.", 2),
            q("¿Por qué CSRF no sustituye a la authentication?", ["Porque CSRF solo evita acciones desde un contexto foráneo; no test identidad", "Porque es incompatible verificado en el environment de staging para casos de uso analíticos", "Porque es lento con fines de reporting avanzado mediante el uso de jobs programados", "Porque no funciona en mobile siguiendo el patrón definido en SFRA"], 0, "Defensas en profundidad: cada control cubre una amenaza distinta.", 3),
            q("¿Qué contextos de output encoding aplican en ISML?", ["Solo HTML para casos de uso analíticos", "HTML, atributo, URL, JavaScript", "Solo URL a través de webhooks externos", "Solo CSS para casos de uso analíticos"], 1, "Cada contexto tiene reglas de escape específicas; un mismo value puede requerir tratamientos distintos.", 3),
            q("¿Qué es una DSAR y cómo afecta a SFCC?", ["Una consulta SQL", "Una request de acceso/eliminación del client que debe coordinar sistemas downstream", "Un tipo de promotion", "Un job de export"], 2, "Cumplir DSAR exige trazabilidad de data en SFCC y en integraciones.", 3),
        ]
    },
    {
        title: "OCAPI, SCAPI y SLAS", icon: "JWT", level: "Avanzado",
        questions: [
            q("¿Qué significa SLAS?", ["Salesforce Local Auth Server", "Secure Login Administration Site", "Storefront Link Access System", "Shopper Login and API Access Service"], 3, "SLAS es Shopper Login and API Access Service para acceso y authentication shopper composable.", 1),
            q("¿Qué flujo corresponde a un client público?", ["Authorization Code con PKCE", "Client Credentials con secreto en browser", "Contraseña en localStorage", "Basic Auth compartido"], 0, "Un client público no puede custodiar secretos; PKCE protege el intercambio del código.", 2),
            q("¿OCAPI y SCAPI son equivalentes?", ["Sí durante la inicialización del controller mediante el uso de web services SOAP", "No; son familias con authentication, extensibilidad y evolución distintas", "Solo difieren en el nombre con fines de reporting avanzado", "SCAPI es una template ISML siguiendo el patrón definido en SFRA"], 1, "Deben evaluarse por caso de uso y arquitectura, no tratarse como alias.", 2),
            q("En headless, ¿dónde debe quedar un client secret?", ["En JavaScript del browser", "En querystring", "En un server o BFF", "En una cookie pública"], 2, "Solo un componente confidencial de server puede custodiar secretos de client.", 1),
            q("¿Qué cubren los OCAPI Hooks?", ["Cachear páginas en modo de previsualización y staging para casos de uso analíticos", "Sustituir templates mediante el uso de cache distribuido", "Compilar código a través de webhooks externos validado contra el contrato del API", "Personalización de la response Shop API y Data API en puntos soportados"], 3, "Los hooks añaden lógica en puntos concretos, pero añaden coupling con la plataforma.", 3),
            q("¿Qué diferencia hay entre SLAS private y public client?", ["El private guarda secreto en server; el public usa PKCE sin secreto", "Ninguna con la observabilidad que aporta el log para casos de uso analíticos", "El public es para admin con retrys automáticos configurados", "El private es móvil mediante el uso de web services SOAP"], 0, "Elegir el modelo correcto impacta en seguridad y arquitectura del BFF.", 3),
            q("¿Qué contiene el shopper context?", ["Solo siteId en la fase de consolidación del cart", "siteId, locale, currency y data relevantes del shopper", "Solo currency validado contra el contrato del API", "Nada normalizado en modo de previsualización y staging"], 1, "El shopper context viaja en la mayoría de llamadas SCAPI y aplica reglas de selección.", 3),
        ]
    },
    {
        title: "Testing y actualizaciones", icon: "QA", level: "Intermedio",
        questions: [
            q("¿Qué protege mejor una ruta extendida durante un upgrade?", ["Eliminar logs", "Un replace sin documentar", "Regression tests", "No update nunca"], 2, "Las tests detectan cambios de contrato y comportamiento en SFRA o cartridges de terceros.", 1),
            q("¿Qué test valida el contrato con un OMS?", ["Un sitemap", "Solo snapshot CSS", "Una test de tipografía", "Contract/integration test"], 3, "Las tests de contrato detectan incompatibilidades de payload, estados y errors.", 2),
            q("¿Qué reduce el coste de update SFRA?", ["Overrides pequeños y documentados", "Copiar controllers completos", "Modificar base para casos de uso analíticos", "Un cartridge monolítico"], 0, "Cuanto menor y más explícito sea el delta custom, más fácil es comparar y adoptar cambios base.", 2),
            q("¿Qué debe incluir una estrategia de calidad completa?", ["Solo unit tests con la authorization del team de plataforma", "Unit, integration, API, E2E, performance y seguridad según riesgo", "Solo tests manuales en escenarios de migración de data", "Solo lint con la configuration por defecto del cartridge"], 1, "Cada nivel detecta clases distintas de fallo y debe priorizar los flujos de negocio críticos.", 2),
            q("¿Cómo se mockea dw/* en unit tests?", ["Se conecta a producción", "No se puede verificado en el environment de staging", "Con stubs específicos que emulen el API", "Solo con sandbox para casos de uso analíticos"], 2, "Los mocks de dw/* aíslan el código bajo test y permiten executelo en CI estándar.", 3),
            q("¿Qué revelan las tests de contrato?", ["Estilos CSS mediante el uso de web services SOAP", "Detección de XSS mediante el uso de cache distribuido", "Velocidad del sitio mediante el uso de jobs programados", "Compatibilidad de payloads y manejo de errors"], 3, "Las tests de contrato blindan la integration frente a cambios upstream no coordinados.", 3),
            q("¿Qué estrategia de upgrade es más segura?", ["Rollout por cartucho, por ruta o por feature flag con smoke tests", "Big bang mediante el uso de cache distribuido para casos de uso analíticos", "Solo en sandbox a través de webhooks externos para casos de uso analíticos", "Saltar releases durante la inicialización del controller"], 0, "Dividir el cambio reduce blast radius y facilita rollback granular.", 2),
        ]
    },
    {
        title: "Escenarios de arquitectura", icon: "ADR", level: "Avanzado",
        questions: [
            q("El ERP debe queryse en cada PDP. ¿Cuál es el mejor enfoque?", ["Llamada síncrona sin timeout con la monitorización del dashboard estándar", "Réplica incremental, dato eventualmente consistente y revalidación crítica", "Guardar stock en una cookie con retrys automáticos configurados", "Desactivar cache global mediante el uso de web services SOAP"], 1, "La arquitectura desacopla navegación del ERP y reserva la validación fuerte para puntos críticos.", 2),
            q("¿Cómo exportar orders al OMS de forma robusta?", ["Sin clave externa en la fase de consolidación del cart", "Solo manualmente alineado con la práctica recomendada actual", "Incremental, idempotente, confirmada y reconciliable", "Marcarlos exportados antes de send"], 2, "Watermark, idempotencia, confirmación, retry y reconciliación evitan pérdida y duplicados.", 2),
            q("¿Cómo personalizar sin destruir la cache?", ["Variar toda PDP por customer ID durante la sincronización con el OMS", "Cachear la cuenta con foco en la mantenibilidad del código", "Desactivar CDN según el modelo de deployment actual", "Aislar fragmentos dinámicos y mantener el shell compartido"], 3, "El contenido común permanece cacheable y solo la parte personal se resuelve dinámicamente.", 2),
            q("¿Cuál es el deployment seguro de un nuevo atributo obligatorio?", ["Metadata, código tolerante, data, índice y activación gradual", "Código que falla si falta, antes de metadata", "Borrar el catalog coordinado con el team de operaciones", "Cambiar producción directamente en la fase de consolidación del cart"], 0, "Ordenar dependencias y usar compatibilidad temporal permite rollout y rollback seguros.", 3),
            q("¿Cómo abordar multi-site internacional?", ["Replicar todo con la configuration regional del site a través de la capa de presentación", "Decidir qué se comparte (master) y qué se localiza (storefront, precio, idioma)", "Un site monolítico dentro del flujo de checkout estándar para casos de uso analíticos", "Replicar configuration manualmente durante la sincronización con el OMS"], 1, "Definir el modelo de compartición es la decisión arquitectónica más importante.", 3),
            q("¿Por qué evitar un cut-over big bang en un híbrido SFRA→PWA Kit?", ["No es elegante a través de la capa de presentación", "Es ilegal validado contra el contrato del API externo", "Implica migrar todo a la vez con riesgo alto y recovery costosa", "No se puede mediante el servicio de catalogación nocturna"], 2, "Phased rollouts con eCDN y session bridging reducen riesgo y permiten feedback temprano.", 3),
            q("¿Qué atributo justifica un nuevo índice de búsqueda?", ["Cualquier cambio de CSS para casos de uso analíticos", "Cambio de hostname verificado en el environment de staging", "Cambio de logo con fines de reporting avanzado", "Un atributo que se vuelve refinable o sortable"], 3, "Solo atributos reflejados en la UI de búsqueda justifican mantener un índice actualizado.", 3),
        ]
    },
    {
        title: "Customer lists y segmentación", icon: "👤", level: "Intermedio",
        questions: [
            q("¿Qué describe mejor un customer group?", ["Un conjunto de shoppers que comparten elegibilidad para precios, promociones y cupones", "Una etiqueta estética en el contexto del storefront internacional para casos de uso analíticos", "Un bucket de import mediante el uso de jobs programados a través de webhooks externos", "Una carpeta de archivos con la authorization del team de plataforma"], 0, "Customer groups gobiernan pricing, descuentos y muchas reglas de negocio.", 1),
            q("¿Para qué sirve una customer list?", ["Guardar cart durante la sincronización con el OMS", "Targeting de cupones, contenido y campañas", "Indexar products a través de webhooks externos", "Cachear responses para casos de uso analíticos"], 1, "Las listas agrupan shoppers para campañas de comunicación y promociones dirigidas.", 2),
            q("¿Qué rol existe típicamente en una account hierarchy B2B?", ["Visitante durante la sincronización con el OMS", "Solo root para casos de uso analíticos", "Approver, buyer, admin y roles custom", "Solo email mediante el uso de web services SOAP"], 2, "Cada rol define permisos y rutas de aprobación coherentes con la jerarquía.", 3),
            q("¿Qué dato NO debería persistirse en session.custom?", ["El idioma temporal para casos de uso analíticos", "El ID anonimo para casos de uso analíticos", "El estado del wizard para casos de uso analíticos", "PII que pertenece al perfil consolidado"], 3, "session.custom es efímero y pequeño; la PII debe consolidarse en CustomerProfile.", 2),
            q("¿Por qué es delicado mover un shopper a otro customer group?", ["Cambia su elegibilidad para precio, promociones y cupones; debe auditarse", "No es delicado con foco en la mantenibilidad del código", "Afecta a SEO según el modelo de deployment actual en la fase de render de la página", "Cambia URL con la monitorización del dashboard estándar"], 0, "Un cambio de grupo puede romper expectativas de precio y cupones.", 2),
            q("¿Qué workflow debe existir al pasar de guest a registered?", ["Ninguno mediante el servicio de catalogación nocturna", "Transferencia de basket idempotente y reconciliación de line items", "Sobreescribir el basket coordinado con el team de operaciones", "Generar un order en la fase de consolidación del cart"], 1, "El merge evita perder selecciones del shopper y reduce tickets de soporte.", 3),
            q("¿Qué event del ciclo de vida dispara la consolidación de un guest en Customer?", ["Logout de la session", "Eliminación de cookies", "Registro con email o social login", "Cambio de idioma"], 2, "El registro con credenciales válidas dispara la creación del Customer y la consolidación de baskets y data del guest shopper.", 2),
        ]
    },
    {
        title: "Promociones en profundidad", icon: "🎯", level: "Intermedio",
        questions: [
            q("¿Qué controla la prioridad de una promotion?", ["Solo la estética a través de la capa de presentación", "La duración validado contra el contrato del API externo", "El idioma en la fase de render de la página para casos de uso analíticos", "El orden de evaluación frente a otras promociones del mismo basket"], 3, "Una prioridad bien definida evita combinaciones de descuentos no deseadas.", 2),
            q("¿Qué ocurre si dos promociones son excluyentes?", ["Se aplica la prioritaria y la otra queda descartada para combos del mismo item", "Se cancela el basket para casos de uso analíticos en escenarios de migración de data", "Se duplican mediante el pipeline de commit actual siguiendo el patrón definido en SFRA", "Ninguna se aplica con la configuration regional del site para casos de uso analíticos"], 0, "La exclusión protege márgenes y debe ser explícita en la lógica de negocio.", 2),
            q("¿Qué pasa al añadir un coupon al basket?", ["El total no cambia mediante el uso de web services SOAP", "El motor recalcula y aplica (o no) según reglas y elegibilidad", "El coupon se encola mediante el uso de jobs programados", "Se crea un order con la authorization del team de plataforma"], 1, "El recalculado inmediato evita descuentos fantasma y mantiene la UX coherente.", 2),
            q("¿Qué riesgo trae un coupon de un solo uso sin control?", ["Nada en modo de previsualización y staging con la monitorización del dashboard estándar", "Reducción de stock mediante el uso de cache distribuido para casos de uso analíticos", "Que se canjee más de una vez si dos requests entran casi simultáneamente (race)", "Caída del sitio durante la inicialización del controller para casos de uso analíticos"], 2, "El control de concurrencia (lock, atomic counter) es obligatorio para cupones sensibles.", 3),
            q("¿Qué test es esencial para validate combinatoria de promociones?", ["Snapshot con la monitorización del dashboard estándar para casos de uso analíticos", "Manual con la observabilidad que aporta el log para casos de uso analíticos", "Solo A/B con retrys automáticos configurados en la fase de render de la página", "Test que recorra todas las combinaciones activas con redondeos por moneda"], 3, "La combinatoria y redondeos descubren bugs caros en producción.", 3),
            q("¿Qué atributo exporta metrics fiables de promociones?", ["Canjes, revenue incremental, abandono y uplift por segmento", "Nada alineado con la práctica recomendada actual", "Campo libre validado contra el contrato del API", "Solo nombre en modo de previsualización y staging"], 0, "Métricas estructuradas permiten proteger margen y tomar decisiones informadas.", 2),
            q("¿Qué atributo de una promotion controla si puede combinarse con otras del mismo nivel?", ["Solo el nombre interno durante la sincronización con el OMS", "El flag de exclusividad o la configuration de exclusión", "La duración de la campaña según el modelo de deployment actual", "El idioma del sitio con la monitorización del dashboard estándar"], 1, "La configuration de exclusividad y los exclusion sets determinan qué promociones pueden coexistir o se descartan mutuamente.", 2),
        ]
    },
    {
        title: "Búsqueda y merchandising avanzado", icon: "🔎", level: "Avanzado",
        questions: [
            q("¿Para qué sirve un sinónimo en búsqueda?", ["Para ordenar mediante el servicio de catalogación nocturna", "Para cachear siguiendo la guía de upgrade del vendor para casos de uso analíticos", "Para expandir la query con términos equivalentes y mejorar la cobertura", "Para paginar en la fase de consolidación del cart para casos de uso analíticos"], 2, "Sinónimos evitan cero results cuando el shopper usa un término distinto al del catalog.", 2),
            q("¿Qué hace un boost rule?", ["Ordena por precio con la configuration regional del site", "Cambia el idioma con el soporte del team de operaciones", "Excluye results dentro del flujo de checkout estándar", "Promueve ciertos products en queries concretas"], 3, "El boost es una herramienta de merchandising por query, no un cambio global.", 3),
            q("¿Qué es un redirect de búsqueda?", ["Mostrar una URL alternativa cuando la query no tiene results relevantes", "Una página 404 validado contra el contrato del API externo", "Una redirect HTTP en la fase de render de la página para casos de uso analíticos", "Una promotion mediante el servicio de catalogación nocturna"], 0, "Los redirects convierten búsquedas infructuosas en landings útiles.", 2),
            q("¿Qué estrategia de paginación es más compatible con SEO?", ["Scroll infinito sin paginación para casos de uso analíticos", "Paginación con URLs únicas y canonical cuando proceda", "Solo JavaScript mediante el pipeline de commit actual", "No indexar con la configuration regional del site"], 1, "URLs reales y únicas permiten rastreo, posicionamiento y canonical coherente; el scroll infinito puro no aporta señales de paginación a buscadores.", 2),
            q("¿Cuándo conviene un autocomplete del lado server?", ["Siempre dentro del SLA acordado con el merchant", "Nunca en escenarios de migración de data", "Cuando la fuente de data es pesada o requiere authorization", "Cuando hay red 5G a través de la capa de presentación"], 2, "delegar al server reduce coste client y permite reglas de negocio centralizadas.", 3),
            q("¿Qué atributo no debería ser refinable?", ["Color para casos de uso analíticos", "Talla para casos de uso analíticos", "Tipo de product", "Atributo de auditoría interna"], 3, "Refinar por campos internos expone información y deforma la UI.", 2),
            q("¿Qué consecuencia tiene un atributo marcado como searchable sin reindexar el catalog?", ["No aparece en los results hasta que se reindexa", "Aumenta la latency de búsqueda para casos de uso analíticos", "Rompe el sitemap con retrys automáticos configurados", "Invalida el cache mediante el uso de web services SOAP"], 0, "El índice de búsqueda solo refleja los atributos del momento del último rebuild; sin reindexar, el atributo no influye en los results.", 2),
        ]
    },
    {
        title: "Post-compra y devoluciones", icon: "↩️", level: "Intermedio",
        questions: [
            q("¿Qué es un RMA?", ["Una promotion en la fase de consolidación del cart", "Una authorization de devolución con motivo y política", "Un job validado contra el contrato del API", "Una cookie en modo de previsualización y staging"], 1, "El RMA es el ancla de cualquier flujo de devolución controlado.", 1),
            q("¿Qué dato clave debe tener un refund?", ["Solo monto durante la sincronización con el OMS", "Token de pago con foco en la mantenibilidad del código", "Referencia idempotente, método y monto alineados con captura", "Comentario con la monitorización del dashboard estándar"], 2, "Sin idempotencia, un refund puede duplicarse y dejar el sistema en estado inconsistente.", 2),
            q("¿Qué hacer con el inventario en un RMA aceptado?", ["Bloquear a todos los shoppers para casos de uso analíticos", "Nada siguiendo la guía de upgrade del vendor", "Eliminar products coordinado con el team de operaciones", "Liberar ATS o marcar como dañado y notificar al OMS"], 3, "La política define si el product vuelve a stock, se descarta o se inspecciona.", 2),
            q("¿Una cancelación antes del envío es trivial?", ["Requiere liberar reserva, reembolsar y notificar a integraciones", "Sí con el soporte del team de operaciones para casos de uso analíticos", "Solo cancel dentro del flujo de checkout estándar", "No se permite durante la sincronización con el OMS"], 0, "Garantizar consistencia evita dobles cobros y libera capacidad logística.", 2),
            q("¿Por qué evitar un edit complejo post-placeOrder?", ["Por estética a través de la capa de presentación dentro del SLA acordado con el merchant", "Porque reconstruir un order válido y propagarlo a OMS es más seguro que mutarlo", "No se permite técnicamente en la fase de render de la página para casos de uso analíticos", "Por SEO mediante el servicio de catalogación nocturna a través de la capa de presentación"], 1, "Anular + nuevo order reduce errors y mantiene auditoría limpia.", 3),
            q("¿Qué log de auditoría debe existir en un refund?", ["Solo monto con el correlation ID propagado al servicio", "Solo client para casos de uso analíticos", "Operador, motivo, correlation ID, monto y método", "Solo fecha con la configuration regional del site"], 2, "La auditoría permite entender disputas y reproducir decisiones.", 3),
            q("¿Qué dato NO debe exponerse en una response RMA al shopper?", ["Estado actual del RMA para casos de uso analíticos", "Motivo general y política aplicada", "Pasos siguientes del proceso", "Identificadores internos del OMS o del agente"], 3, "Exponer IDs internos del OMS o del agente permite correlación entre incidentes y revela arquitectura; deben quedarse en el log.", 2),
        ]
    },
    {
        title: "PWA Kit y Managed Runtime", icon: "PWA", level: "Avanzado",
        questions: [
            q("¿Qué es el Retail React App?", ["Un template SSR/CSR de PWA Kit optimizado para ecommerce", "Un CMS con fines de reporting avanzado", "Un add-on de Business Manager siguiendo el patrón definido en SFRA", "Una librería de checkout dentro del SLA acordado con el merchant"], 0, "El Retail React App es el template oficial que aporta páginas, componentes y tooling.", 1),
            q("¿Qué hace el request processor en PWA Kit?", ["Renderiza server side con la monitorización del dashboard estándar", "Modifica la query string en el edge para mejorar cache hit ratio", "Compila bundles con retrys automáticos configurados", "Conecta a BD mediante el uso de web services SOAP"], 1, "Filtrar parameters irrelevantes (utm, gclid) antes del lookup de cache incrementa el hit ratio.", 2),
            q("¿Cuál es el TTL por defecto del page cache en Managed Runtime?", ["60 s", "Una hora", "600 s", "24 h"], 2, "El default puede ajustarse por página en `getProps` o centralizado en `app/ssr.js`.", 2),
            q("¿Qué aporta commerce-sdk-react?", ["Una BD durante la sincronización con el OMS", "Un ERP con foco en la mantenibilidad del código", "Una licencia para SFRA según el modelo de deployment actual", "Hooks para SLAS y SCAPI con caching de TanStack Query"], 3, "Es la capa recomendada para hablar con SCAPI y SLAS en PWA Kit.", 2),
            q("¿Qué es template extensibility?", ["Override en overrides/app para reducir huella y deuda de upgrade", "Borrar el base siguiendo la guía de upgrade del vendor", "Hardcodear coordinado con el team de operaciones", "Compilar offline en la fase de consolidación del cart"], 0, "Customizar en overrides permite upgrade limpios del template base.", 3),
            q("¿Qué navegadores soporta oficialmente PWA Kit?", ["Cualquiera con la configuration regional del site", "Las dos últimas versiones mayores de navegadores modernos estándar", "Solo Chrome dentro del flujo de checkout estándar", "Solo Safari durante la sincronización con el OMS"], 1, "El soporte está documentado y conviene alinearlo con analytics reales.", 3),
            q("¿Qué decisión arquitectónica reduce TCO?", ["Forks manuales a través de la capa de presentación", "No update validado contra el contrato del API externo", "Adoptar template extensibility y update con frecuencia", "Reescribir cada año mediante el servicio de catalogación nocturna"], 2, "Pequeñas actualizaciones periódicas reducen el coste total frente a big upgrades.", 3),
            q("¿Qué técnica de MRT permite servir páginas cacheadas cuando parte del contenido depende del user?", ["Invalidación total de cache con el correlation ID propagado al servicio dentro del SLA acordado con el merchant", "Desactivar la CDN para casos de uso analíticos en escenarios de migración de data para casos de uso analíticos", "Cachear la cookie del user mediante el pipeline de commit actual siguiendo el patrón definido en SFRA", "Render condicional: server side sin data personales + hidratación en client para contenido dinámico"], 3, "El server side entrega el shell cacheable y la hidratación client añade los fragmentos personalizados sin romper el cache hit ratio.", 3),
        ]
    },
    {
        title: "Migración SiteGenesis a SFRA", icon: "↗️", level: "Avanzado",
        questions: [
            q("¿Qué patrón es más seguro para migrar un legacy?", ["Strangler pattern con coexistencia y session bridging", "Borrar el legacy en escenarios de migración de data", "Solo documentar con la configuration por defecto del cartridge", "Big bang a través de la capa de presentación"], 0, "Strangler introduce SFRA/composable por rutas y minimiza los big bang.", 1),
            q("¿Qué error frecuente arruina una migración?", ["Testear poco verificado en el environment de staging", "Copiar SiteGenesis a SFRA en lugar de reescribir", "Escribir tests siguiendo el patrón definido en SFRA", "Versiones con el correlation ID propagado al servicio"], 1, "Copiar SiteGenesis literal en SFRA conserva los antipatrones del legacy (scripts transaccionales, ISML espagueti, hooks innecesarios) y duplica la deuda técnica.", 2),
            q("¿Qué se hace con los OCAPI Hooks del legacy?", ["Se descartan en el contexto del storefront internacional", "Se renombran mediante el uso de jobs programados", "Se reescriben como SFRA extensions o se justifican en composable", "Se ignoran dentro del SLA acordado con el merchant"], 2, "Cada hook debe evaluarse individualmente: algunos siguen siendo útiles, otros quedan obsoletos por la migración a SCAPI y otros pueden reescribirse como extensions de SFRA o lógica en el BFF.", 2),
            q("¿Qué decisión pesa más al inicio del proyecto?", ["Elegir framework en la fase de consolidación del cart", "Elegir color alineado con la práctica recomendada actual", "Elegir hosting validado contra el contrato del API", "Inventariar cartridges, customizaciones y data"], 3, "Sin inventario, el plan se vuelve promesa y el cronograma termina siendo ficticio.", 2),
            q("¿Cómo se compara el QA entre legacies?", ["Regression suite contra SiteGenesis y comparación de comportamiento", "Solo unit con foco en la mantenibilidad del código", "Solo smoke según el modelo de deployment actual para casos de uso analíticos", "A ojo con la monitorización del dashboard estándar"], 0, "Sin una regression suite reproducible contra el legacy, no se puede afirmar paridad funcional ni detectar regresiones introducidas por la migración.", 3),
            q("¿Por qué importa la comunicación al merchant?", ["No importa mediante el servicio de catalogación nocturna", "Para alinear expectativas sobre cortes, contenido y campañas", "Solo al inicio coordinado con el team de operaciones", "Solo al final en la fase de consolidación del cart"], 1, "Un merchant bien informado sobre cortes, contenido y campañas reduce tickets, previene crisis y mantiene la confianza incluso cuando hay incidentes técnicos.", 3),
            q("¿Qué riesgo tiene un cut-over tipo big bang en un storefront en producción?", ["Reducción de costes operativos con la configuration regional del site", "Mejora de SEO automática con el soporte del team de operaciones", "Pérdida de negocio si hay regresiones sin posibilidad de rollback rápido", "Reducción de la deuda técnica durante la sincronización con el OMS"], 2, "Sin rollback rápido, una regresión crítica impacta directamente en revenue y la recovery es cara; phased rollouts reducen este riesgo.", 2),
        ]
    },
    {
        title: "Storefront híbrido y session bridging", icon: "🔗", level: "Avanzado",
        questions: [
            q("¿Qué permite el session bridging?", ["Unir dos sites a través de la capa de presentación verificado en el environment de staging", "Fusionar catalogs validado contra el contrato del API externo", "Fusionar orders en la fase de render de la página a través de la capa de presentación", "Compartir identidad entre storefronts SFRA y PWA Kit (o SiteGenesis con POC)"], 3, "El shopper mantiene su session al navegar entre arquitecturas.", 2),
            q("¿Qué cookie corresponde al refresh token SLAS para guest?", ["cc-nx-g", "cc-at", "dwsid", "PHPSESSID"], 0, "cc-nx-g guarda el refresh token de guest; cc-nx para shoppers registrados.", 3),
            q("¿Qué hace el cartridge Plugin SLAS hoy?", ["Es obsoleto dentro del SLA acordado con el merchant verificado en el environment de staging", "Actúa como puente SFRA-SLAS; en versiones nuevas se reemplaza por Hybrid Auth", "Compila Java con la configuration por defecto del cartridge", "Hace SEO a través de la capa de presentación dentro del SLA acordado con el merchant"], 1, "Plugin SLAS habilitó el hibridismo; Hybrid Auth es la solución soportada a partir de 25.3.", 3),
            q("¿Qué regla usa eCDN para enrutar a PWA Kit?", ["Hash del browser verificado en el environment de staging", "Cookie de session con fines de reporting avanzado", "Expresión Cloudflare por host, path, uri o cookie", "Token del user dentro del SLA acordado con el merchant"], 2, "eCDN se apoya en Rule Expressions; conviene mantener reglas simples y testeables.", 3),
            q("¿Cuántas reglas admite eCDN por instancia en proxy zones?", ["10", "Sin límite", "1000", "100"], 3, "100 reglas por instancia en proxy zones; 100 compartidas en legacy zones.", 3),
            q("¿Qué atributo usan shared-cookies para mantener el basket?", ["dwsid", "PHPSESSID", "cc-at_{siteId}", "session.custom"], 0, "cc-at_{siteId} lleva el access token a través de la frontera arquitectónica.", 3),
            q("¿Qué cookie se actualiza cuando el shopper transita entre SFRA y PWA Kit autenticado?", ["cc-nx-g durante la sincronización con el OMS", "dwsid tras la llamada a /sessions de OCAPI", "PHPSESSID según el modelo de deployment actual", "JSESSIONID en la fase de consolidación del cart"], 1, "PWA Kit notifica a SFRA mediante POST /sessions de OCAPI; la response incluye un nuevo dwsid que enlaza la session B2C Commerce con SLAS.", 3),
        ]
    },
    {
        title: "Operación y SRE para SFCC", icon: "🚨", level: "Avanzado",
        questions: [
            q("¿Qué SLO es prioritario para un storefront?", ["Estética mediante el servicio de catalogación nocturna", "Cantidad de features siguiendo la guía de upgrade del vendor", "Conversión checkout y latency p95 por ruta crítica", "Tamaño del team en la fase de consolidación del cart"], 2, "Los SLOs deben reflejar el impacto real en el shopper y en el negocio.", 2),
            q("¿Qué contiene un runbook útil?", ["Solo URL con la configuration regional del site", "Solo una descripción con el soporte del team de operaciones", "Solo contacto dentro del flujo de checkout estándar", "Síntomas, metrics, logs, mitigación preaprobada y escalado"], 3, "Un runbook accionable describe síntomas detectables, metrics clave, queries de log, mitigaciones preaprobadas (incluido kill switch) y contactos de escalado; reduce MTTR y evita heroísmo.", 2),
            q("¿Qué alerta es accionable?", ["Latencia p95 + 5xx rate por ruta crítica", "CPU una vez al mes para casos de uso analíticos", "Cada warning en la fase de render de la página", "Log aleatorio a través de la capa de presentación"], 0, "Una buena alerta incluye umbral, síntoma y ruta hacia el runbook.", 2),
            q("¿Qué postmortem es correcto?", ["Busca culpable con el correlation ID propagado al servicio", "Documenta timeline, causas y action items sin culpabilizar", "Se oculta mediante el pipeline de commit actual", "Solo comparte con manager con la configuration regional del site"], 1, "La cultura sin culpa permite aprender del incidente y prevenir recurrencias.", 2),
            q("¿Qué decisión tomar ante MTTR creciente?", ["Rotar on-call dentro del SLA acordado con el merchant", "Aumentar gravedad en escenarios de migración de data", "Identificar gaps en runbooks, alertas y observabilidad", "Reducir on-call a través de la capa de presentación"], 2, "El MTTR creciente suele indicar runbooks incompletos, alertas mal diseñadas o falta de observabilidad; rotar on-call solo redistribuye el síntoma sin resolverlo.", 3),
            q("¿Qué hacer ante un rollback que no aplica?", ["Cambiar de plataforma verificado en el environment de staging", "Forzar con fines de reporting avanzado a través de webhooks externos", "Borrar data siguiendo el patrón definido en SFRA", "Identificar incompatibilidad de data y preparar fix-forward"], 3, "Forzar rollback cuando los data cambiaron puede romper integraciones.", 3),
            q("¿Qué es un error budget en SRE?", ["Cantidad máxima de error tolerable en una ventana (1 - SLO)", "Presupuesto financiero para incidentes a través de webhooks externos", "Plantilla de runbook con la authorization del team de plataforma", "Costo de la rotación on-call dentro del SLA acordado con el merchant"], 0, "El error budget se calcula como 1 menos el SLO (p. ej. 0.1% de error permitido si el SLO es 99.9%); limita cuánto riesgo se puede tomar antes de congelar releases.", 3),
        ]
    },
    {
        title: "Experimentación y feature flags", icon: "🧪", level: "Intermedio",
        questions: [
            q("¿Qué distingue un release flag de un experiment flag?", ["Nada mediante el uso de cache distribuido para casos de uso analíticos", "El release flag activa rollout; el experiment flag mide impacto", "Solo el nombre durante la inicialización del controller", "El color del panel verificado en el environment de staging"], 1, "Un release flag responde a '¿está listo para todos?' y un experiment flag a '¿qué variante funciona mejor?'; mezclarlos invalida metrics y rollout.", 2),
            q("¿Cuándo decir NO a un A/B test?", ["Nunca con la observabilidad que aporta el log con foco en la mantenibilidad del código", "Siempre con retrys automáticos configurados validado contra el contrato del API", "Cuando la muestra no llega, la metric no está clara o el cambio es cosmético", "Solo en mobile en el contexto del storefront internacional para casos de uso analíticos"], 2, "Un test mal diseñado es ruido y puede consumir tiempo precioso.", 2),
            q("¿Qué riesgo SEO tiene un A/B test?", ["Ninguno mediante el servicio de catalogación nocturna para casos de uso analíticos", "Solo robots siguiendo la guía de upgrade del vendor para casos de uso analíticos", "Solo canonical coordinado con el team de operaciones", "Que las variantes difieran en HTML y los buscadores vean inconsistencias"], 3, "Mantener canonical y metadata constants reduce el riesgo.", 2),
            q("¿Qué property debe tener un feature flag?", ["Default off, kill switch simple y limpieza tras el rollout", "Complejidad con el soporte del team de operaciones", "Ser asíncrono dentro del flujo de checkout estándar", "Cambiar en cada commit durante la sincronización con el OMS"], 0, "Un flag bien diseñado es un toggle explícito y finito en el tiempo.", 2),
            q("¿Qué herramienta es común para feature flags en SFCC?", ["Solo custom a través de la capa de presentación para casos de uso analíticos", "Preferencias custom, LaunchDarkly, Optimizely u otra según contrato", "Solo Business Manager en la fase de render de la página", "Ninguna mediante el servicio de catalogación nocturna"], 1, "La herramienta depende de presupuesto y madurez.", 3),
            q("¿Qué error común arruina una experimentación?", ["Definir metric verificado en el environment de staging", "Tomar baseline para casos de uso analíticos", "Peeking y parar el test al primer indicio,", "Limpieza post-test para casos de uso analíticos"], 2, "Peeking invalida la significancia y produce decisiones ruidosas.", 3),
            q("¿Qué problema introduce dividir el tráfico por cookie en lugar de por shopper ID?", ["Mayor latency dentro del SLA acordado con el merchant para casos de uso analíticos", "Rompe el sitemap en escenarios de migración de data con fines de reporting avanzado", "Reduce el cache hit con la configuration por defecto del cartridge", "Sesiones con múltiples cookies rompen la asignación y contaminan la muestra"], 3, "La división por cookie puede asignar a un mismo shopper a variantes distintas entre sesiones/dispositivos, contaminando metrics y experiencias.", 3),
        ]
    },
    {
        title: "Performance testing y presupuestos", icon: "📈", level: "Avanzado",
        questions: [
            q("¿Qué mide un load test?", ["Latencia, error rate y throughput bajo carga esperada", "Solo accesibilidad con fines de reporting avanzado", "Solo SEO siguiendo el patrón definido en SFRA", "Estilos con el correlation ID propagado al servicio"], 0, "Un load test valida que el sistema soporta el tráfico planeado.", 2),
            q("¿Qué test sostiene la carga horas para detectar leaks?", ["Stress", "Soak test", "Spike", "Unit"], 1, "El soak test expone fugas de memoria y degradación progresiva.", 2),
            q("¿Qué metrics Core Web Vitals importan al PDP?", ["Solo TTFB", "Solo JavaScript", "LCP, INP y CLS", "Solo CSS"], 2, "Las tres metrics resumen experiencia real del user.", 2),
            q("¿Qué decisión tomar ante un presupuesto de performance excedido?", ["Ignorar con la observabilidad que aporta el log para casos de uso analíticos", "Subir el presupuesto con retrys automáticos configurados", "Subir precio mediante el uso de web services SOAP", "Reducir dependencias, dividir bundles o aliviar trabajo en runtime"], 3, "El presupuesto es una decisión de diseño que se revisa en cada PR.", 2),
            q("¿Qué tráfico simula un spike test?", ["Picos súbitos como campañas virales", "Solo admin en la fase de render de la página", "Solo login para casos de uso analíticos", "Tráfico plano para casos de uso analíticos"], 0, "El spike test valida la elasticidad frente a events no previstos.", 3),
            q("¿Qué tener en cuenta al execute load test en SFCC?", ["Que ralentice producción con la configuration regional del site", "Que las cuotas se compartan y los results no sean válidos en sandbox", "Solo hacer dentro del flujo de checkout estándar para casos de uso analíticos", "No importa durante la sincronización con el OMS para casos de uso analíticos"], 1, "Compartir environment con data reales distorsiona; conviene aislar.", 3),
            q("¿Qué diferencia un load test de un stress test?", ["No hay diferencia a través de la capa de presentación para casos de uso analíticos", "Solo cambia el nombre validado contra el contrato del API externo", "El load test valida carga esperada; el stress test busca el punto de rotura", "El stress test solo mide SEO mediante el servicio de catalogación nocturna"], 2, "Load test confirma que el sistema soporta tráfico esperado; stress test lo lleva al límite para detectar degradación y modos de fallo.", 2),
        ]
    }
];

;

;

;

;

;

const MODES = {
    CHALLENGE: 'challenge',
    TRAINING: 'training',
    REVIEW_FAILED: 'review',
    GLOBAL: 'global',
    BOOKMARKS: 'bookmarks',
    SEARCH: 'search'
};

// =============================================================
// i18n: traducciones y selector de idioma
// =============================================================
const I18N = {
    es: {
        title: 'SFCC Architect Challenge',
        resetProgress: 'Reiniciar progreso',
        eyebrow: 'Preparación técnica avanzada',
        heroDesc: '180+ preguntas sobre SFRA, OCAPI, SCAPI, SLAS y PWA Kit para repasar conceptos de Salesforce B2C Commerce. Modo desafío, formación, repaso de fallos y examen global. Diseñado para desarrolladores y arquitectos SFCC que se preparan para entrevistas, certificaciones o migraciones.',
        startBtn: 'Comenzar test',
        modesBtn: 'Modos de práctica',
        exploreBtn: 'Explorar bloques',
        questionsLabel: 'preguntas',
        blocksStat: 'bloques temáticos',
        failedStat: 'fallos guardados',
        bookmarksStat: 'marcadores',
        pathEyebrow: 'Ruta de aprendizaje',
        blocksTitle: 'Bloques temáticos',
        progressLabel: '{done} de {total} respondidas',
        progressAria: 'Progreso general',
        modesEyebrow: 'Modos de práctica',
        modesTitle: 'Entrena como un arquitecto',
        backToBlocks: '← Volver a bloques',
        blockLabel: 'Bloque:',
        modeTrainingBadge: 'Recomendado',
        modeTrainingTitle: 'Modo formación',
        modeTrainingDesc: 'Recorre un bloque viendo la explicación tras cada respuesta. Ideal para asentar conceptos.',
        modeReviewBadge: 'Repaso',
        modeReviewTitle: 'Repaso de fallos',
        modeReviewDescStart: 'Solo preguntas que has fallado.',
        available: 'disponibles.',
        modeBookmarksBadge: 'Marcadores',
        modeBookmarksTitle: 'Marcadores',
        modeBookmarksDescStart: 'Practica las preguntas que marcaste para revisar.',
        saved: 'guardados.',
        modeExamBadge: 'Examen',
        modeExamTitle: 'Examen global',
        modeExamDesc: '20 preguntas aleatorias de todos los bloques. Filtro de dificultad opcional.',
        modeSearchBadge: 'Búsqueda',
        modeSearchTitle: 'Buscar preguntas',
        modeSearchDesc: 'Filtra por palabra clave en el enunciado, opciones o explicación.',
        searchPlaceholder: 'p. ej. CSRF, PWA Kit, hook',
        searchBtn: 'Buscar',
        difficultyLabel: 'Dificultad:',
        diffAll: 'Todas',
        diff1: 'Básico',
        diff2: 'Intermedio',
        diff3: 'Avanzado',
        langAria: 'Selector de idioma',
        brandAria: 'SFCC Architect Challenge, inicio',
        themeToggleAria: 'Cambiar tema claro/oscuro',
        panelAria: 'Resumen del cuestionario',
        quizBack: '← Volver a bloques',
        correctLabel: 'Aciertos',
        feedbackCorrect: 'Decisión correcta',
        feedbackWrong: 'Revisa este concepto',
        feedbackTraining: 'Explicación',
        nextBtn: 'Siguiente pregunta',
        viewResult: 'Ver resultado',
        resultsEyebrow: 'Bloque completado',
        retryBtn: 'Repetir',
        chooseOtherBtn: 'Elegir otro bloque',
        levelArchitect: 'Arquitecto',
        levelSenior: 'Senior',
        levelProgress: 'En progreso',
        levelReview: 'Necesita repaso',
        resultMsg100: 'Dominio excelente. Has identificado correctamente todas las decisiones y sus implicaciones arquitectónicas.',
        resultMsg75: 'Buen criterio técnico. Revisa las explicaciones de los fallos para consolidar los matices de plataforma.',
        resultMsg50: 'La base es correcta, pero todavía hay decisiones que conviene justificar con mayor precisión.',
        resultMsg0: 'Este bloque merece una segunda vuelta. Repásalo con el modo formación para fijar los fundamentos.',
        resultMsgChallenge100: 'Dominio excelente del programa de revisión.',
        resultMsgChallenge75: 'Buen criterio. Refuerza los conceptos con el modo formación.',
        resultMsgChallenge50: 'Aprobado por poco. Repasa los temas donde has fallado.',
        resultMsgChallenge0: 'Necesitas más preparación. Vuelve al modo formación.',
        confirmReset: '¿Quieres borrar todo el progreso guardado?',
        bookmarkAria: 'Marcar para revisar',
        scoreEmpty: '— / —',
        modeLabels: {
            challenge: 'Desafío',
            training: 'Formación',
            review: 'Repaso de fallos',
            global: 'Examen global',
            bookmarks: 'Marcadores',
            search: 'Búsqueda'
        },
        levelNames: {
            'Fundamentos': 'Fundamentos',
            'Intermedio': 'Intermedio',
            'Avanzado': 'Avanzado'
        },
        searchNoResults: 'Sin coincidencias. Prueba con otros términos.',
        searchPractica: 'Practicar las {n} preguntas',
        noQuestions: 'No hay preguntas para este modo todavía.',
        confirmReset: '¿Quieres borrar todo el progreso guardado?',
        startArrow: 'Empezar →',
        failedLabelCount: 'fallidas',
        navAbout: 'Acerca de',
        navFaq: 'FAQ',
        learnMoreBtn: 'Saber más',
        topicsEyebrow: 'Cobertura',
        topicsTitle: 'Temas cubiertos en el test SFCC',
        topic1Title: 'SFRA y arquitectura de cartridges',
        topic1Desc: 'Cartridge path, module.superModule, hooks.json, append/prepend/replace, ciclo de vida del Controller.',
        topic2Title: 'OCAPI y SCAPI',
        topic2Desc: 'Open Commerce API legacy vs Shopper Commerce API moderna, endpoints, errores RFC 7807, custom endpoints.',
        topic3Title: 'SLAS y autenticación',
        topic3Desc: 'OAuth 2.1, public vs private client, PKCE, session bridge, Hybrid Auth, channel_id obligatorio.',
        topic4Title: 'PWA Kit y Managed Runtime',
        topic4Desc: 'Retail React App, SSR/CSR, commerce-sdk-react, request processor, template extensibility, hybrid storefronts.',
        topic5Title: 'Catálogo, precios y promociones',
        topic5Desc: 'Master vs storefront catalog, price books, customer groups, source codes, exclusion sets, combinatoria.',
        topic6Title: 'Checkout, pagos y devoluciones',
        topic6Desc: 'Flujo de checkout, autorización vs captura, idempotencia, webhooks firmados, RMAs, refunds.',
        topic7Title: 'Persistencia y transacciones',
        topic7Desc: 'System Objects vs Custom Objects, Transaction.wrap, iteradores, búsqueda, paginación.',
        topic8Title: 'Operación, SRE y runbooks',
        topic8Desc: 'SLO/SLI, postmortems sin culpa, alertas accionables, rollback vs fix-forward, incident response.',
        topic9Title: 'Migración SiteGenesis a SFRA',
        topic9Desc: 'Estrategia strangler, OCAPI hooks a custom endpoints, plan de rollback, regresión y comunicación al merchant.',
        aboutEyebrow: 'Acerca del test',
        aboutTitle: '¿Qué es SFCC Architect Challenge?',
        aboutP1: 'SFCC Architect Challenge es un test interactivo de <strong>Salesforce B2C Commerce Cloud (SFCC)</strong> con más de 180 preguntas distribuidas en 27 bloques temáticos. Está pensado para repasar conceptos reales de plataforma: SFRA, OCAPI, SCAPI, SLAS, PWA Kit, Managed Runtime, seguridad, observabilidad y arquitectura.',
        aboutP2: 'El test no es un examen oficial de Salesforce, sino una herramienta de preparación complementaria para entrevistas técnicas, discovery assessments en proyectos de migración, validación de equipos y refuerzo de conceptos antes de una certificación. Las preguntas se inspiran en escenarios reales de proyectos enterprise y en la documentación oficial.',
        howUseTitle: 'Cómo usar el test SFCC',
        howUse1: '<strong>Selecciona un bloque</strong> según el tema que quieras repasar (SFRA, OCAPI, SLAS, PWA Kit, seguridad…).',
        howUse2: '<strong>Responde con honestidad</strong> y revisa la explicación tras cada respuesta. El modo formación muestra el razonamiento incluso si aciertas.',
        howUse3: '<strong>Usa "Repaso de fallos"</strong> para reforzar lo que más te cuesta. Solo aparecen las preguntas que has fallado previamente.',
        howUse4: '<strong>Haz el examen global</strong> cuando te sientas preparado: 20 preguntas aleatorias con filtro de dificultad, ideal para simular la presión de una entrevista real.',
        howUse5: '<strong>Marca con ☆</strong> las preguntas que quieras repasar más adelante. Se guardan en marcadores persistentes.',
        faqEyebrow: 'Preguntas frecuentes',
        faqTitle: 'FAQ sobre SFCC y el test',
        faq1Q: '¿Qué es SFCC Architect Challenge?',
        faq1A: 'Es un test interactivo con más de 180 preguntas técnicas diseñado para repasar conceptos de Salesforce B2C Commerce Cloud. Cubre SFRA, OCAPI, SCAPI, SLAS, PWA Kit, Managed Runtime, seguridad, performance y arquitectura. Está orientado a desarrolladores y arquitectos que se preparan para entrevistas técnicas, certificaciones o migraciones.',
        faq2Q: '¿Cuántas preguntas tiene el test SFCC?',
        faq2A: 'El test contiene más de 180 preguntas distribuidas en 27 bloques temáticos: SFRA y cartridges, controladores, modelos e ISML, catálogo y precios, checkout y pedidos, persistencia, integraciones, jobs batch, entornos y despliegues, contenido y SEO, caché y rendimiento, observabilidad, seguridad, OCAPI/SCAPI/SLAS, PWA Kit, híbrido SFRA+headless, SRE, experimentación y performance testing.',
        faq3Q: '¿SFRA vs SiteGenesis?',
        faq3A: 'SFRA (Storefront Reference Architecture) es la arquitectura de referencia actual basada en controllers, ISML y Script API. SiteGenesis es la arquitectura legacy. SFRA aporta modularidad por cartridges, mejor extensibilidad, hooks bien definidos y compatibilidad con el framework de tests. SiteGenesis está en modo mantenimiento y no se recomienda para proyectos nuevos.',
        faq4Q: '¿OCAPI vs SCAPI?',
        faq4A: 'OCAPI (Open Commerce API) es la API tradicional REST de SFCC con sub-APIs Shop, Data y Meta. SCAPI (Shopper Commerce API) es la API moderna diseñada para arquitecturas headless, mobile y BFF. SCAPI usa SLAS para autenticación, está mejor documentada con OpenAPI 3 y se integra de forma nativa con PWA Kit. OCAPI sigue siendo válida para integraciones legacy o backoffice.',
        faq5Q: '¿Qué es SLAS y cómo se usa?',
        faq5A: 'SLAS (Shopper Login and API Access Service) es el servicio OAuth 2.1 que gestiona la autenticación y autorización de shoppers contra SCAPI y OCAPI. Soporta clientes públicos (PKCE, sin secret) y privados (con client secret, recomendado en BFF). Devuelve access tokens JWT de 30 minutos y refresh tokens de 90 días en producción. El parámetro <code>channel_id</code> es obligatorio en guest tokens desde marzo de 2025.',
        faq6Q: '¿Qué es PWA Kit y Managed Runtime?',
        faq6A: 'PWA Kit es el framework oficial de Salesforce para construir storefronts composables basados en React. Incluye el Retail React App (template con PDP, PLP, cart, checkout) y el SDK commerce-sdk-react para hablar con SCAPI. Managed Runtime (MRT) es el hosting serverless de Salesforce para PWA Kit, con CDN integrado y TTL por defecto de 600 s. Es la opción recomendada para storefronts headless sobre SFCC.',
        faq7Q: '¿Cómo preparo una entrevista SFCC senior?',
        faq7A: 'Empieza por SFRA y la arquitectura de cartridges, después controla ISML y los hooks. Domina OCAPI y SCAPI con SLAS para autenticación. Practica decisiones de diseño: cuándo usar middleware, cómo estructurar transacciones, cuándo migrar a PWA Kit, qué poner en un runbook. El test SFCC Architect Challenge te ayuda a detectar lagunas y reforzar conceptos con explicación tras cada respuesta.',
        faq8Q: '¿Es un simulacro del examen oficial de certificación?',
        faq8A: 'No es un examen oficial de Salesforce ni está afiliado a Salesforce. Es una herramienta de repaso comunitario. Para la certificación oficial consulta Trailhead y los programas de certificación de Salesforce. SFCC Architect Challenge sirve como preparación complementaria para entrevistas técnicas, discovery assessments y validación de conocimientos en migraciones.',
        faq9Q: '¿Qué nivel de dificultad tiene el test?',
        faq9A: 'Hay preguntas en tres niveles: básico, intermedio y avanzado. El examen global mezcla 20 preguntas aleatorias con filtro de dificultad. El modo repaso se centra en preguntas falladas. Las preguntas avanzadas cubren migraciones SiteGenesis, storefronts híbridos con eCDN, SRE y performance testing.',
        faq10Q: '¿Puedo usar SFCC Architect Challenge gratis?',
        faq10A: 'Sí, es una herramienta gratuita. El progreso se guarda en localStorage del navegador, sin necesidad de registro. Puedes usarlo tantas veces como quieras y practicar todos los bloques temáticos en modo desafío, formación, repaso de fallos o examen global.',
        footerDocs: 'Documentación oficial SFCC',
        footerPwaKit: 'PWA Kit en GitHub',
        footerBack: 'Volver arriba',
        footerAttribution: 'Con el fin de refrescar conceptos de cara a una entrevista de trabajo, esta web ha sido creada haciendo <em>vibe coding</em> y utilizando el modelo <strong>MiniMax - M3</strong>.<br>Autor: <strong>Esmallao</strong>. Co-autoría técnica: <strong>MiniMax-M3</strong>.',
        heroTitleStart: 'Test SFCC: ¿Piensas como un arquitecto de',
        heroTitleEnd: 'Salesforce B2C Commerce?',
        noSearchYet: 'Empieza a escribir para buscar.',
        searchStartPractica: 'Practica las {n} preguntas encontradas',
        bookmark: 'Marcador',
        noQuestions: 'No hay preguntas para este modo todavía.',
        noAnswer: 'Sin respuesta',
        startBlockTitle: 'Bloque {n} · {title}',
        searchResultSample: 'Buscar "{q}"',
        langEs: 'ES',
        langEn: 'EN'
    },
    en: {
        title: 'SFCC Architect Challenge',
        resetProgress: 'Reset progress',
        eyebrow: 'Advanced technical prep',
        heroTitleStart: 'Do you think like a',
        heroTitleEnd: 'SFCC architect?',
        heroDesc: '180+ questions on SFRA, OCAPI, SCAPI, SLAS and PWA Kit to review Salesforce B2C Commerce concepts. Challenge, training, review mistakes and global exam modes. Designed for SFCC developers and architects preparing for interviews, certifications or migrations.',
        startBtn: 'Start test',
        modesBtn: 'Practice modes',
        exploreBtn: 'Explore blocks',
        learnMoreBtn: 'Learn more',
        questionsLabel: 'questions',
        blocksStat: 'topic blocks',
        failedStat: 'saved mistakes',
        bookmarksStat: 'bookmarks',
        pathEyebrow: 'Learning path',
        blocksTitle: 'Topic blocks',
        progressLabel: '{done} of {total} answered',
        progressAria: 'Overall progress',
        modesEyebrow: 'Practice modes',
        modesTitle: 'Train like an architect',
        backToBlocks: '← Back to blocks',
        blockLabel: 'Block:',
        modeTrainingBadge: 'Recommended',
        modeTrainingTitle: 'Training mode',
        modeTrainingDesc: 'Walk through a block seeing the explanation after each answer. Ideal for solidifying concepts.',
        modeReviewBadge: 'Review',
        modeReviewTitle: 'Review mistakes',
        modeReviewDescStart: 'Only questions you have failed.',
        available: 'available.',
        modeBookmarksBadge: 'Bookmarks',
        modeBookmarksTitle: 'Bookmarks',
        modeBookmarksDescStart: 'Practice the questions you bookmarked for review.',
        saved: 'saved.',
        modeExamBadge: 'Exam',
        modeExamTitle: 'Global exam',
        modeExamDesc: '20 random questions from all blocks. Optional difficulty filter.',
        modeSearchBadge: 'Search',
        modeSearchTitle: 'Search questions',
        modeSearchDesc: 'Filter by keyword in the prompt, options or explanation.',
        searchPlaceholder: 'e.g. CSRF, PWA Kit, hook',
        searchBtn: 'Search',
        difficultyLabel: 'Difficulty:',
        diffAll: 'All',
        diff1: 'Basic',
        diff2: 'Intermediate',
        diff3: 'Advanced',
        langAria: 'Language selector',
        brandAria: 'SFCC Architect Challenge, home',
        themeToggleAria: 'Toggle light/dark theme',
        panelAria: 'Quiz summary',
        quizBack: '← Back to blocks',
        correctLabel: 'Correct',
        feedbackCorrect: 'Correct decision',
        feedbackWrong: 'Review this concept',
        feedbackTraining: 'Explanation',
        nextBtn: 'Next question',
        viewResult: 'View result',
        resultsEyebrow: 'Block completed',
        retryBtn: 'Retry',
        chooseOtherBtn: 'Choose another block',
        levelArchitect: 'Architect',
        levelSenior: 'Senior',
        levelProgress: 'In progress',
        levelReview: 'Needs review',
        resultMsg100: 'Excellent mastery. You correctly identified all decisions and their architectural implications.',
        resultMsg75: 'Good technical judgment. Review the explanations of the failed questions to consolidate platform nuances.',
        resultMsg50: 'The foundation is correct, but there are still decisions that should be justified with greater precision.',
        resultMsg0: 'This block deserves a second pass. Review it in training mode to solidify the fundamentals.',
        resultMsgChallenge100: 'Excellent mastery of the review syllabus.',
        resultMsgChallenge75: 'Good judgment. Strengthen the concepts with training mode.',
        resultMsgChallenge50: 'Barely passed. Review the topics where you failed.',
        resultMsgChallenge0: 'You need more preparation. Go back to training mode.',
        confirmReset: 'Do you want to delete all saved progress?',
        bookmarkAria: 'Bookmark for review',
        scoreEmpty: '— / —',
        modeLabels: {
            challenge: 'Challenge',
            training: 'Training',
            review: 'Review mistakes',
            global: 'Global exam',
            bookmarks: 'Bookmarks',
            search: 'Search'
        },
        levelNames: {
            'Fundamentos': 'Foundations',
            'Intermedio': 'Intermediate',
            'Avanzado': 'Advanced'
        },
        searchNoResults: 'No matches. Try other terms.',
        searchPractica: 'Practice the {n} questions',
        noQuestions: 'No questions available for this mode yet.',
        confirmReset: 'Do you want to delete all saved progress?',
        startArrow: 'Start →',
        failedLabelCount: 'failed',
        navAbout: 'About',
        navFaq: 'FAQ',
        learnMoreBtn: 'Learn more',
        topicsEyebrow: 'Coverage',
        topicsTitle: 'Topics covered in the SFCC test',
        topic1Title: 'SFRA and cartridge architecture',
        topic1Desc: 'Cartridge path, module.superModule, hooks.json, append/prepend/replace, controller lifecycle.',
        topic2Title: 'OCAPI and SCAPI',
        topic2Desc: 'Legacy Open Commerce API vs modern Shopper Commerce API, endpoints, RFC 7807 errors, custom endpoints.',
        topic3Title: 'SLAS and authentication',
        topic3Desc: 'OAuth 2.1, public vs private client, PKCE, session bridge, Hybrid Auth, mandatory channel_id.',
        topic4Title: 'PWA Kit and Managed Runtime',
        topic4Desc: 'Retail React App, SSR/CSR, commerce-sdk-react, request processor, template extensibility, hybrid storefronts.',
        topic5Title: 'Catalog, pricing and promotions',
        topic5Desc: 'Master vs storefront catalog, price books, customer groups, source codes, exclusion sets, combinations.',
        topic6Title: 'Checkout, payments and returns',
        topic6Desc: 'Checkout flow, authorize vs capture, idempotency, signed webhooks, RMAs, refunds.',
        topic7Title: 'Persistence and transactions',
        topic7Desc: 'System Objects vs Custom Objects, Transaction.wrap, iterators, search, pagination.',
        topic8Title: 'Operations, SRE and runbooks',
        topic8Desc: 'SLO/SLI, blameless postmortems, actionable alerts, rollback vs fix-forward, incident response.',
        topic9Title: 'SiteGenesis to SFRA migration',
        topic9Desc: 'Strangler strategy, OCAPI hooks to custom endpoints, rollback plan, regression and merchant communication.',
        aboutEyebrow: 'About the test',
        aboutTitle: 'What is SFCC Architect Challenge?',
        aboutP1: 'SFCC Architect Challenge is an interactive test on <strong>Salesforce B2C Commerce Cloud (SFCC)</strong> with 180+ questions spread across 27 topic blocks. It is designed to review real platform concepts: SFRA, OCAPI, SCAPI, SLAS, PWA Kit, Managed Runtime, security, observability and architecture.',
        aboutP2: 'The test is not an official Salesforce exam, but a complementary preparation tool for technical interviews, discovery assessments in migration projects, team validation and concept reinforcement before a certification. The questions are inspired by real enterprise project scenarios and the official documentation.',
        howUseTitle: 'How to use the SFCC test',
        howUse1: '<strong>Pick a block</strong> according to the topic you want to review (SFRA, OCAPI, SLAS, PWA Kit, security…).',
        howUse2: '<strong>Answer honestly</strong> and review the explanation after each response. Training mode shows the reasoning even if you get it right.',
        howUse3: '<strong>Use "Review mistakes"</strong> to reinforce what you struggle with. Only previously failed questions appear.',
        howUse4: '<strong>Take the global exam</strong> when you feel ready: 20 random questions with a difficulty filter, ideal to simulate real interview pressure.',
        howUse5: '<strong>Mark with ☆</strong> the questions you want to review later. They are saved in persistent bookmarks.',
        faqEyebrow: 'Frequently asked questions',
        faqTitle: 'SFCC and test FAQ',
        faq1Q: 'What is SFCC Architect Challenge?',
        faq1A: 'It is an interactive test with 180+ technical questions designed to review Salesforce B2C Commerce Cloud concepts. It covers SFRA, OCAPI, SCAPI, SLAS, PWA Kit, Managed Runtime, security, performance and architecture. It is aimed at developers and architects preparing for technical interviews, certifications or migrations.',
        faq2Q: 'How many questions does the SFCC test have?',
        faq2A: 'The test has 180+ questions distributed across 27 topic blocks: SFRA and cartridges, controllers, models and ISML, catalog and pricing, checkout and orders, persistence, integrations, batch jobs, environments and deployments, content and SEO, cache and performance, observability, security, OCAPI/SCAPI/SLAS, PWA Kit, SFRA+headless hybrid, SRE, experimentation and performance testing.',
        faq3Q: 'SFRA vs SiteGenesis?',
        faq3A: 'SFRA (Storefront Reference Architecture) is the current reference architecture based on controllers, ISML and the Script API. SiteGenesis is the legacy architecture. SFRA provides cartridge-based modularity, better extensibility, well-defined hooks and compatibility with the test framework. SiteGenesis is in maintenance mode and is not recommended for new projects.',
        faq4Q: 'OCAPI vs SCAPI?',
        faq4A: 'OCAPI (Open Commerce API) is the traditional REST API of SFCC with Shop, Data and Meta sub-APIs. SCAPI (Shopper Commerce API) is the modern API designed for headless, mobile and BFF architectures. SCAPI uses SLAS for authentication, is better documented with OpenAPI 3 and integrates natively with PWA Kit. OCAPI remains valid for legacy or backoffice integrations.',
        faq5Q: 'What is SLAS and how is it used?',
        faq5A: 'SLAS (Shopper Login and API Access Service) is the OAuth 2.1 service that manages authentication and authorization of shoppers against SCAPI and OCAPI. It supports public clients (PKCE, no secret) and private clients (with client secret, recommended in BFF). It returns 30-minute JWT access tokens and 90-day refresh tokens in production. The <code>channel_id</code> parameter is mandatory in guest tokens since March 2025.',
        faq6Q: 'What is PWA Kit and Managed Runtime?',
        faq6A: 'PWA Kit is the official Salesforce framework for building React-based composable storefronts. It includes the Retail React App (template with PDP, PLP, cart, checkout) and the commerce-sdk-react SDK to talk to SCAPI. Managed Runtime (MRT) is the serverless hosting of Salesforce for PWA Kit, with built-in CDN and 600s default TTL. It is the recommended option for headless storefronts on SFCC.',
        faq7Q: 'How do I prepare for a senior SFCC interview?',
        faq7A: 'Start with SFRA and the cartridge architecture, then master ISML and hooks. Master OCAPI and SCAPI with SLAS for authentication. Practice design decisions: when to use middleware, how to structure transactions, when to migrate to PWA Kit, what to put in a runbook. The SFCC Architect Challenge test helps you detect gaps and reinforce concepts with explanations after each answer.',
        faq8Q: 'Is it a mock of the official certification exam?',
        faq8A: 'It is not an official Salesforce exam nor affiliated with Salesforce. It is a community review tool. For the official certification consult Trailhead and Salesforce certification programs. SFCC Architect Challenge serves as complementary preparation for technical interviews, discovery assessments and knowledge validation in migrations.',
        faq9Q: 'What difficulty level does the test have?',
        faq9A: 'There are questions at three levels: basic, intermediate and advanced. The global exam mixes 20 random questions with a difficulty filter. The review mode focuses on failed questions. The advanced questions cover SiteGenesis migrations, hybrid storefronts with eCDN, SRE and performance testing.',
        faq10Q: 'Can I use SFCC Architect Challenge for free?',
        faq10A: 'Yes, it is a free tool. Progress is saved in the browser localStorage, no registration required. You can use it as many times as you want and practice all topic blocks in challenge, training, review mistakes or global exam modes.',
        footerDocs: 'Official SFCC docs',
        footerPwaKit: 'PWA Kit on GitHub',
        footerBack: 'Back to top',
        footerAttribution: 'This website was created as a personal <em>vibe coding</em> project using <strong>MiniMax - M3</strong>. Technical co-author: <strong>MiniMax-M3</strong>.',
        noSearchYet: 'Start typing to search.',
        searchStartPractica: 'Practice the {n} found questions',
        bookmark: 'Bookmark',
        noQuestions: 'No questions available for this mode yet.',
        noAnswer: 'No answer',
        startBlockTitle: 'Block {n} · {title}',
        searchResultSample: 'Search "{q}"',
        langEs: 'ES',
        langEn: 'EN'
    }
};

function t(key, params) {
    const lang = (state && state.lang) || 'es';
    const dict = I18N[lang] || I18N.es;
    let value = dict[key];
    if (value === undefined) value = I18N.es[key] !== undefined ? I18N.es[key] : key;
    if (params && typeof value === 'string') {
        Object.keys(params).forEach(function (k) {
            value = value.split('{' + k + '}').join(String(params[k]));
        });
    }
    return value;
}

function applyI18n() {
    const lang = state.lang || 'es';
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', lang === 'es'
        ? 'Juego de preguntas para preparar entrevistas técnicas de Salesforce B2C Commerce.'
        : 'Quiz app to prepare for Salesforce B2C Commerce technical interviews.');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // Use innerHTML for elements that contain markup in the translation
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-aria-label');
        el.setAttribute('aria-label', t(key));
    });
    document.title = t('title');
    // Update active state of language buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
}

const DIFFICULTIES = {
    1: 'Básico',
    2: 'Intermedio',
    3: 'Avanzado'
};

function difficultyName(level) {
    return t('diff' + level);
}

function loadLang() {
    try {
        const stored = localStorage.getItem('sfccQuizLang');
        if (stored === 'es' || stored === 'en') return stored;
    } catch (e) {}
    const nav = (navigator && navigator.language) || 'es';
    return nav.toLowerCase().startsWith('en') ? 'en' : 'es';
}

function saveLang(lang) {
    try { localStorage.setItem('sfccQuizLang', lang); } catch (e) {}
}

// Theme management
function loadTheme() {
    try {
        const stored = localStorage.getItem('sfccQuizTheme');
        if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {}
    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function saveTheme(theme) {
    try { localStorage.setItem('sfccQuizTheme', theme); } catch (e) {}
}

function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
}

function toggleTheme() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

const state = {
    mode: MODES.CHALLENGE,
    blockIndex: 0,
    questionIndex: 0,
    correct: 0,
    answered: false,
    questionList: [],
    progress: loadProgress(),
    failed: loadFailed(),
    bookmarks: loadBookmarks(),
    difficultyFilter: 'all',
    searchQuery: '',
    lang: loadLang(),
    theme: loadTheme()
};

const $ = (id) => document.getElementById(id);
const homeView = $('home');
const dashboard = $('blocks');
const quizView = $('quizView');
const resultsView = $('resultsView');
const modeView = $('modes');
const blockGrid = $('blockGrid');
const answers = $('answers');
const feedback = $('feedback');
const nextButton = $('nextButton');

function loadProgress() {
    try { return JSON.parse(localStorage.getItem('sfccQuizProgress')) || {}; }
    catch (e) { return {}; }
}
function saveProgress() {
    localStorage.setItem('sfccQuizProgress', JSON.stringify(state.progress));
}
function loadFailed() {
    try { return JSON.parse(localStorage.getItem('sfccQuizFailed')) || {}; }
    catch (e) { return {}; }
}
function saveFailed() {
    localStorage.setItem('sfccQuizFailed', JSON.stringify(state.failed));
}
function loadBookmarks() {
    try { return JSON.parse(localStorage.getItem('sfccQuizBookmarks')) || []; }
    catch (e) { return []; }
}
function saveBookmarks() {
    localStorage.setItem('sfccQuizBookmarks', JSON.stringify(state.bookmarks));
}

function allQuestions() {
    return blocks.flatMap((b, bi) => b.questions.map((q) => Object.assign({}, q, { blockIndex: bi, blockTitle: b.title })));
}
function getQuestionById(id) {
    return allQuestions().find((q) => q.id === id);
}
function getBlockByQuestionId(id) {
    const q = getQuestionById(id);
    if (!q) return null;
    return blocks[q.blockIndex];
}

function totalQuestions() {
    return blocks.reduce((s, b) => s + b.questions.length, 0);
}

function totalAnswered() {
    return Object.keys(state.progress).reduce((sum, key) => sum + (state.progress[key].answered || blocks[key].questions.length), 0);
}

function questionsForBlock(index) {
    return blocks[index].questions.slice();
}

function failedQuestions() {
    return allQuestions().filter((q) => state.failed[q.id]);
}

function bookmarkedQuestions() {
    return allQuestions().filter((q) => state.bookmarks.includes(q.id));
}

function searchQuestions(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return allQuestions().filter((q) =>
        q.text.toLowerCase().includes(needle) ||
        q.explanation.toLowerCase().includes(needle) ||
        q.options.some((o) => o.toLowerCase().includes(needle)) ||
        q.blockTitle.toLowerCase().includes(needle)
    );
}

function globalQuestions() {
    const all = allQuestions();
    let pool = all;
    if (state.difficultyFilter !== 'all') {
        pool = pool.filter((q) => String(q.difficulty) === String(state.difficultyFilter));
    }
    return pool.slice().sort(() => Math.random() - 0.5).slice(0, 20);
}

function renderBlocks() {
    blockGrid.innerHTML = '';
    blocks.forEach((block, index) => {
        const result = state.progress[index];
        const failedCount = block.questions.filter((q) => state.failed[q.id]).length;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'block-card' + (result ? ' completed' : '');
        card.innerHTML = `
            <span class="block-number">BLOQUE ${String(index + 1).padStart(2, '0')}</span>
            <span class="block-icon" aria-hidden="true">${block.icon}</span>
            <h3>${block.title}</h3>
            <span class="block-level">${block.level ? (t('levelNames')[block.level] || block.level) : ''}</span>
            <span class="block-card-footer">
                <span>${block.questions.length} ${t('questionsLabel')}${failedCount ? ' · ' + failedCount + ' ' + t('failedLabelCount') : ''}</span>
                <strong>${result ? `${result.correct}/${block.questions.length}` : t('startArrow')}</strong>
            </span>`;
        card.addEventListener('click', () => startBlock(index));
        blockGrid.appendChild(card);
    });
    updateOverallProgress();
}

function updateOverallProgress() {
    const total = totalQuestions();
    const completed = totalAnswered();
    $('progressLabel').textContent = t('progressLabel', { done: completed, total: total });
    $('progressBar').style.width = `${(completed / total) * 100}%`;
    const failedCount = Object.keys(state.failed).length;
    const bookmarkCount = state.bookmarks.length;
    $('failedLabel').textContent = failedCount;
    $('bookmarksLabel').textContent = bookmarkCount;
    $('totalQuestions').textContent = total;
    $('totalBlocks').textContent = blocks.length;
}

function startBlock(index) {
    state.mode = MODES.CHALLENGE;
    state.blockIndex = index;
    state.questionList = questionsForBlock(index);
    state.questionIndex = 0;
    state.correct = 0;
    state.answered = false;
    showQuiz();
}

function startMode(mode, customList) {
    state.mode = mode;
    if (mode === MODES.GLOBAL) {
        state.questionList = globalQuestions();
    } else if (mode === MODES.REVIEW_FAILED) {
        state.questionList = failedQuestions();
    } else if (mode === MODES.BOOKMARKS) {
        state.questionList = bookmarkedQuestions();
    } else if (mode === MODES.SEARCH) {
        state.questionList = customList || [];
    } else if (mode === MODES.TRAINING) {
        const select = $('trainingBlockSelect');
        const idx = select ? Number(select.value) : 0;
        state.blockIndex = isNaN(idx) ? 0 : idx;
        state.questionList = questionsForBlock(state.blockIndex);
    }
    if (!state.questionList.length) {
        alert(t('noQuestions'));
        return;
    }
    state.questionIndex = 0;
    state.correct = 0;
    state.answered = false;
    showQuiz();
}

function populateTrainingBlockSelect() {
    const select = $('trainingBlockSelect');
    if (!select) return;
    select.innerHTML = '';
    blocks.forEach((b, i) => {
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `B${String(i + 1).padStart(2, '0')} · ${b.title}`;
        select.appendChild(option);
    });
}

function showQuiz() {
    homeView.classList.add('hidden');
    dashboard.classList.add('hidden');
    resultsView.classList.add('hidden');
    modeView.classList.add('hidden');
    quizView.classList.remove('hidden');
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shuffleOptions(options, originalAnswer) {
    const indexed = options.map((opt, i) => ({ text: opt, isCorrect: i === originalAnswer }));
    for (let i = indexed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return {
        options: indexed.map(x => x.text),
        answer: indexed.findIndex(x => x.isCorrect)
    };
}

function renderQuestion() {
    const question = state.questionList[state.questionIndex];
    const total = state.questionList.length;
    const isGlobal = state.mode === MODES.GLOBAL || state.mode === MODES.REVIEW_FAILED || state.mode === MODES.BOOKMARKS || state.mode === MODES.SEARCH;
    state.answered = false;
    const shuffled = shuffleOptions(question.options, question.answer);
    state.currentShuffle = shuffled;
    $('topicPill').textContent = isGlobal ? question.blockTitle : blocks[state.blockIndex].title;
    $('modePill').textContent = modeLabel(state.mode);
    $('questionCounter').textContent = `${state.questionIndex + 1} / ${total}`;
    $('questionText').textContent = question.text;
    $('quizScore').textContent = `${state.correct}/${state.questionIndex}`;
    $('questionProgressBar').style.width = `${(state.questionIndex / total) * 100}%`;
    $('difficultyPill').textContent = difficultyName(question.difficulty) || '';
    $('difficultyPill').className = 'difficulty-pill difficulty-' + (question.difficulty || 2);
    feedback.classList.add('hidden');
    nextButton.classList.add('hidden');
    answers.innerHTML = '';
    $('bookmarkButton').classList.toggle('active', state.bookmarks.includes(question.id));
    $('bookmarkButton').setAttribute('aria-pressed', String(state.bookmarks.includes(question.id)));

    shuffled.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'answer';
        button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span>`;
        button.addEventListener('click', () => selectAnswer(index));
        answers.appendChild(button);
    });
}

function modeLabel(mode) {
    const labels = t('modeLabels');
    return (labels && labels[mode]) || 'Quiz';
}

function selectAnswer(selectedIndex) {
    if (state.answered) return;
    state.answered = true;
    const question = state.questionList[state.questionIndex];
    const shuffledAnswer = state.currentShuffle ? state.currentShuffle.answer : question.answer;
    const correct = selectedIndex === shuffledAnswer;
    if (correct) state.correct += 1;

    const buttons = [...answers.children];
    buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === shuffledAnswer) button.classList.add('correct');
        if (index === selectedIndex && !correct) button.classList.add('wrong');
    });

    if (state.mode === MODES.TRAINING) {
        $('feedbackTitle').textContent = t('feedbackTraining');
        $('feedbackText').textContent = `${correct ? (state.lang === 'en' ? '✓ Your answer is correct. ' : '✓ Tu respuesta es correcta. ') : ''}${question.explanation}`;
    } else {
        $('feedbackTitle').textContent = correct ? t('feedbackCorrect') : t('feedbackWrong');
        $('feedbackText').textContent = question.explanation;
    }
    feedback.classList.remove('hidden');

    recordProgress(question, correct);
    nextButton.textContent = state.questionIndex === state.questionList.length - 1 ? t('viewResult') : t('nextBtn');
    nextButton.classList.remove('hidden');
    $('quizScore').textContent = `${state.correct}/${state.questionIndex + 1}`;
    $('questionProgressBar').style.width = `${((state.questionIndex + 1) / state.questionList.length) * 100}%`;
}

function recordProgress(question, correct) {
    const blockIndex = state.mode === MODES.CHALLENGE || state.mode === MODES.TRAINING
        ? state.blockIndex
        : question.blockIndex;
    if (!state.progress[blockIndex]) {
        state.progress[blockIndex] = { correct: 0, answered: 0, perQuestion: {} };
    }
    const blockState = state.progress[blockIndex];
    if (!blockState.perQuestion) blockState.perQuestion = {};
    const prev = blockState.perQuestion[question.id];
    if (!prev) {
        blockState.answered += 1;
        if (correct) blockState.correct += 1;
    } else if (!prev.correct && correct) {
        blockState.correct += 1;
    }
    blockState.perQuestion[question.id] = { correct: correct, ts: Date.now() };
    if (correct) {
        delete state.failed[question.id];
    } else {
        state.failed[question.id] = true;
    }
    saveProgress();
    saveFailed();
}

function nextQuestion() {
    if (!state.answered) return;
    if (state.questionIndex < state.questionList.length - 1) {
        state.questionIndex += 1;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const total = state.questionList.length;
    const percent = Math.round((state.correct / total) * 100);
    quizView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    $('resultPercent').textContent = `${percent}%`;
    $('resultLevel').textContent = percent === 100 ? t('levelArchitect') : percent >= 75 ? t('levelSenior') : percent >= 50 ? t('levelProgress') : t('levelReview');
    $('resultTitle').textContent = resultTitle();
    $('resultText').textContent = resultMessage(percent);
    updateOverallProgress();
}

function resultTitle() {
    switch (state.mode) {
        case MODES.TRAINING: return t('modeLabels').training;
        case MODES.REVIEW_FAILED: return t('modeLabels').review;
        case MODES.GLOBAL: return t('modeLabels').global;
        case MODES.BOOKMARKS: return t('modeLabels').bookmarks;
        case MODES.SEARCH: return t('modeLabels').search;
        default: return blocks[state.blockIndex].title;
    }
}

function resultMessage(percent) {
    if (state.mode === MODES.GLOBAL) {
        if (percent === 100) return t('resultMsgChallenge100');
        if (percent >= 75) return t('resultMsgChallenge75');
        if (percent >= 50) return t('resultMsgChallenge50');
        return t('resultMsgChallenge0');
    }
    if (percent === 100) return t('resultMsg100');
    if (percent >= 75) return t('resultMsg75');
    if (percent >= 50) return t('resultMsg50');
    return t('resultMsg0');
}

function showDashboard() {
    quizView.classList.add('hidden');
    resultsView.classList.add('hidden');
    homeView.classList.remove('hidden');
    dashboard.classList.remove('hidden');
    modeView.classList.add('hidden');
    renderBlocks();
    if (window.location.protocol !== 'file:') {
        document.getElementById('blocks').scrollIntoView({ behavior: 'smooth' });
    }
}

function showModeView() {
    homeView.classList.add('hidden');
    dashboard.classList.add('hidden');
    quizView.classList.add('hidden');
    resultsView.classList.add('hidden');
    modeView.classList.remove('hidden');
    renderModeView();
    if (window.location.protocol !== 'file:') {
        modeView.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderModeView() {
    $('failedCount').textContent = Object.keys(state.failed).length;
    $('bookmarksCount').textContent = state.bookmarks.length;
    $('searchInput').value = state.searchQuery;
    populateTrainingBlockSelect();
}

function runSearch() {
    const query = $('searchInput').value;
    state.searchQuery = query;
    const results = searchQuestions(query);
    $('searchResults').innerHTML = '';
    if (!results.length) {
        $('searchResults').innerHTML = `<p class="muted">${t('searchNoResults')}</p>`;
        return;
    }
    const list = document.createElement('div');
    list.className = 'search-list';
    results.slice(0, 30).forEach((q) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'search-card';
        card.innerHTML = `
            <span class="block-number">${q.blockTitle}</span>
            <span class="difficulty-pill difficulty-${q.difficulty}">${difficultyName(q.difficulty)}</span>
            <p>${q.text}</p>`;
        card.addEventListener('click', () => startMode(MODES.SEARCH, [q]));
        list.appendChild(card);
    });
    $('searchResults').appendChild(list);
    const startAll = document.createElement('button');
    startAll.type = 'button';
    startAll.className = 'button button-primary';
    startAll.textContent = t('searchStartPractica', { n: results.length });
    startAll.addEventListener('click', () => startMode(MODES.SEARCH, results));
    $('searchResults').appendChild(startAll);
}

function toggleBookmark() {
    const question = state.questionList[state.questionIndex];
    if (!question) return;
    const idx = state.bookmarks.indexOf(question.id);
    if (idx >= 0) {
        state.bookmarks.splice(idx, 1);
    } else {
        state.bookmarks.push(question.id);
    }
    saveBookmarks();
    $('bookmarkButton').classList.toggle('active', state.bookmarks.includes(question.id));
    $('bookmarkButton').setAttribute('aria-pressed', String(state.bookmarks.includes(question.id)));
    updateOverallProgress();
}

$('startButton').addEventListener('click', () => startBlock(0));
$('backButton').addEventListener('click', showDashboard);
$('continueButton').addEventListener('click', showDashboard);
$('retryButton').addEventListener('click', () => {
    if (state.mode === MODES.CHALLENGE) {
        startBlock(state.blockIndex);
    } else {
        startMode(state.mode);
    }
});
$('modesButton').addEventListener('click', showModeView);
$('backFromModes').addEventListener('click', showDashboard);
nextButton.addEventListener('click', nextQuestion);
$('bookmarkButton').addEventListener('click', toggleBookmark);
$('resetButton').addEventListener('click', () => {
    if (window.confirm(t('confirmReset'))) {
        state.progress = {};
        state.failed = {};
        state.bookmarks = [];
        saveProgress();
        saveFailed();
        saveBookmarks();
        showDashboard();
    }
});

$('modeTraining').addEventListener('click', () => startMode(MODES.TRAINING));
$('modeReview').addEventListener('click', () => startMode(MODES.REVIEW_FAILED));
$('modeBookmarks').addEventListener('click', () => startMode(MODES.BOOKMARKS));
$('modeGlobal').addEventListener('click', () => {
    state.difficultyFilter = 'all';
    startMode(MODES.GLOBAL);
});
$('difficultyFilter').addEventListener('change', (e) => {
    state.difficultyFilter = e.target.value;
});
$('searchInput').addEventListener('input', () => {
    state.searchQuery = $('searchInput').value;
    runSearch();
});
$('searchButton').addEventListener('click', runSearch);

// Language selector
document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang !== state.lang) {
            state.lang = lang;
            saveLang(lang);
            applyI18n();
            renderBlocks();
            updateOverallProgress();
        }
    });
});

// Theme toggle
$('themeToggle').addEventListener('click', toggleTheme);

// Detect file:// protocol and remove manifest link.
// PWA manifest requires HTTPS to load; on file:// it triggers a CORS error
// even with relative paths, because each file:// URL is treated as a unique origin.
if (window.location.protocol === 'file:') {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) manifestLink.remove();
}

// Apply theme on initial load (sets data-theme attribute on <html>)
document.documentElement.setAttribute('data-theme', state.theme);

// Apply i18n on initial load (after DOM is ready)
applyI18n();

renderBlocks();
