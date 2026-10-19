# PROMPT MAESTRO — Marketplace local de ayuda entre particulares («AyudaCerca»)

> **Cómo usar este documento**
> 1. Pega este prompt completo en la primera sesión con el agente de código (Claude Code, Copilot Agent, Cursor, etc.).
> 2. Lo primero que hará el agente es guardarlo íntegro en `docs/PRODUCT_SPEC.md`. A partir de ahí, ese archivo es la **fuente de verdad**.
> 3. En las sesiones siguientes usa los **prompts de continuación** del Anexo C, que son cortos y remiten a esta especificación.

---

## 0. Rol, contexto y reglas de comportamiento del agente

Actúa como **equipo técnico senior** (arquitecto full-stack, ingeniero de seguridad, diseñador de producto y QA) que construye un producto real que saldrá a producción en España.

### 0.1 Reglas de trabajo

1. **Fuente de verdad.** Guarda este documento en `docs/PRODUCT_SPEC.md` antes de hacer nada más. Si una decisión tuya contradice la especificación, regístrala en `docs/adr/` (Architecture Decision Record) explicando por qué.
2. **Decide y documenta; no preguntes lo obvio.** Si algo no está especificado, elige la opción más segura, sencilla y estándar, y anótala en `docs/adr/NNNN-titulo.md`. Pregunta solo si estás bloqueado (por ejemplo, falta una credencial imprescindible o hay dos opciones con consecuencias legales o económicas distintas).
3. **Nada de maquetas que fingen funcionar.** No dejes botones sin acción, datos inventados en código de producción ni `TODO` silenciosos. Si algo queda pendiente, el botón no se muestra o aparece deshabilitado con explicación, y la tarea se registra en `ROADMAP.md`.
4. **Informa con honestidad.** Al final de cada fase di qué funciona, qué no, qué has simulado y qué pruebas fallan. No marques nada como terminado si no cumple la «Definición de terminado» (sección 25).
5. **No reescribas lo que funciona.** Si el repositorio ya tiene piezas útiles, adáptate a ellas. Si decides sustituir algo, justifícalo en un ADR.
6. **Commits pequeños y descriptivos** (Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`). Un commit por unidad lógica, nunca un único commit gigante por fase.
7. **Sin secretos en el repositorio.** Nunca escribas claves reales en código, tests, seeds, documentación ni logs.
8. **Servicios externos detrás de adaptadores.** Pagos, correo, push, SMS, almacenamiento, antivirus, geocodificación y rate limiting se usan a través de interfaces propias con una implementación real y una implementación de desarrollo/simulada. La aplicación debe arrancar y poder recorrerse de principio a fin **sin ninguna clave externa** (modo demo).

### 0.2 Originalidad y propiedad intelectual

- El producto se inspira **solo funcionalmente** en marketplaces de servicios entre particulares (tipo Findya, TaskRabbit, Wallapop Servicios, etc.).
- Nombre, logotipo, ilustraciones, iconografía propia, paleta, textos de interfaz, textos comerciales y código deben ser **originales**.
- No copies código, imágenes, fotografías, textos legales, estructuras de página idénticas ni microcopias de terceros.
- Iconos: Lucide (licencia ISC). Ilustraciones: SVG propios generados en el proyecto. Fotografías de demo: ninguna con personas reales; usa ilustraciones, avatares de iniciales generados o imágenes abstractas generadas por código.
- Fuentes: solo con licencia libre (por ejemplo, Google Fonts con licencia OFL), autoalojadas mediante `next/font`.

---

## 1. Producto

### 1.1 Nombre y marca

- Nombre provisional: **AyudaCerca**.
- Todo lo relativo a marca vive en **un único archivo** `src/config/brand.ts` (nombre, nombre corto, eslogan, URL de logotipo, colores, correo de soporte, redes sociales, dominio, razón social, NIF, dirección de la empresa para el aviso legal). Los colores se exponen como variables CSS (tokens) en `src/styles/tokens.css`, generadas o sincronizadas desde `brand.ts`.
- Cambiar el nombre o la paleta no debe requerir tocar más de 2 archivos. Añade un test que busque el literal «AyudaCerca» fuera de `brand.ts`, traducciones y documentación, y falle si aparece.

### 1.2 Propuesta de valor (una frase)

Plataforma local donde cualquier persona puede **pedir** o **ofrecer** ayuda cotidiana (recados, gestiones, acompañamiento, tecnología, hogar, mascotas, clases…), hablar por un chat interno, acordar condiciones, pagar con protección y valorar el resultado.

### 1.3 Recorrido principal (flujo crítico)

1. Publicar una necesidad («Necesito ayuda») o un servicio («Ofrezco ayuda»).
2. Encontrar personas o anuncios cercanos (categoría, población, distancia, precio, disponibilidad).
3. Contactar mediante chat interno.
4. Negociar.
5. Enviar o recibir una **propuesta formal** versionada.
6. Aceptar y pagar con protección.
7. Prestar el servicio.
8. Confirmar la finalización.
9. Liberar el pago al prestador.
10. Valorarse mutuamente.
11. Abrir una incidencia si algo sale mal.

Este flujo es la prioridad absoluta: **todo lo demás es secundario hasta que este recorrido funcione de extremo a extremo con datos reales y pruebas E2E.**

### 1.4 Público y tono

- Personas de cualquier edad, incluidas personas mayores o con poca experiencia digital.
- Tono cercano, claro y respetuoso. Frases cortas. Sin anglicismos innecesarios ni jerga técnica («pago protegido», no «escrow»; «incidencia», no «ticket de disputa»).
- Tutea por defecto (configurable en las traducciones).

### 1.5 Categorías de servicio cubiertas

La plataforma **no** se limita a la informática. Ver sección 7 para el catálogo completo.

### 1.6 Prioridades (alcance por versión)

Cada funcionalidad de este documento está etiquetada:

- **[MVP]** imprescindible para el primer lanzamiento.
- **[V1]** necesaria poco después del lanzamiento.
- **[V2]** opcional, detrás de *feature flag*.

Si el tiempo apremia, termina todo lo [MVP] con calidad de producción antes de empezar lo [V1].

---

## 2. Stack tecnológico

Usa versiones **estables actuales** en el momento de iniciar el proyecto (compruébalas; no fijes versiones de memoria). Si el repositorio ya usa equivalentes que funcionan, consérvalos.

| Área | Elección | Notas |
|---|---|---|
| Framework | Next.js (App Router) + React | Server Components por defecto; Server Actions para mutaciones; Route Handlers para webhooks, cron y API públicas |
| Lenguaje | TypeScript `strict` | Además: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Estilos | Tailwind CSS + shadcn/ui + Lucide | Tokens de diseño en variables CSS |
| Formularios | React Hook Form + Zod | Los **mismos esquemas Zod** validan cliente y servidor |
| BD | PostgreSQL (Supabase) | Extensiones: `postgis`, `pg_trgm`, `unaccent`, `pgcrypto`, `pg_cron` |
| Auth | Supabase Auth con `@supabase/ssr` | Cookies httpOnly, PKCE, captcha integrado (Cloudflare Turnstile) |
| Almacenamiento | Supabase Storage | Buckets públicos solo para imágenes de anuncios ya procesadas; resto privado con URL firmada de corta duración |
| Tiempo real | Supabase Realtime | Canales privados con autorización; Broadcast/Presence para «escribiendo…» |
| Pagos | Stripe Connect (cuentas Express) + Payment Intents / Checkout | Modo test; simulador propio sin claves |
| Correo | Resend + React Email | Adaptador de consola en desarrollo |
| Push | Web Push (VAPID, librería `web-push`) | |
| i18n | next-intl | es (por defecto), ca, en |
| PWA | Serwist o service worker propio | Ver sección 17 |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) | Alternativa en Postgres si no hay Redis |
| Imágenes | `sharp` en servidor | Recompresión, eliminación de EXIF, generación de tamaños |
| Tests | Vitest, Testing Library, Playwright, `@axe-core/playwright`, pgTAP (RLS), fast-check (propiedades) | |
| Observabilidad | Sentry (activado solo si hay DSN), logs JSON estructurados (pino) | |
| Calidad | ESLint, Prettier, `tsc --noEmit`, Husky + lint-staged, CI en GitHub Actions | |
| Despliegue | Vercel + Supabase gestionado | Vercel Cron o `pg_cron` para tareas |
| Gestor de paquetes | pnpm | |

---

## 3. Arquitectura

### 3.1 Principios

- **Lógica de dominio pura** en `src/domain/` (dinero, comisiones, cancelaciones, máquinas de estado, permisos, validaciones). Sin dependencias de Next.js, Supabase ni Stripe. Cobertura de pruebas ≥ 95 %.
- **Servicios de servidor** en `src/server/services/` que orquestan dominio, repositorios y adaptadores. Toda operación sensible pasa por aquí.
- **Autorización doble:** comprobación en el servicio (por rol, propiedad y estado) **y** RLS en la base de datos. La interfaz nunca es la barrera de seguridad.
- **Una sola fuente de verdad por dato.** Por ejemplo, el estado del pago vive en `transactions` y el de la reserva en `bookings`; no dupliques estados que se puedan derivar.
- **Historial inmutable.** Los cambios de estado de reservas, pagos, incidencias y moderación se registran como eventos *append-only*.

### 3.2 Estructura de carpetas propuesta

```
/
├─ docs/
│  ├─ PRODUCT_SPEC.md        ← este documento
│  ├─ adr/                   ← decisiones de arquitectura
│  └─ legal/                 ← borradores legales (marcados «PENDIENTE DE REVISIÓN JURÍDICA»)
├─ supabase/
│  ├─ migrations/            ← SQL versionado
│  ├─ seed/                  ← semilla de demo (nunca se ejecuta en producción)
│  └─ tests/                 ← pgTAP: pruebas de RLS y funciones
├─ src/
│  ├─ app/[locale]/
│  │  ├─ (public)/           ← portada, explorar, anuncios, categorías, ayuda, legal
│  │  ├─ (auth)/             ← entrar, registro, recuperar…
│  │  ├─ (app)/              ← zona autenticada: publicar, mensajes, reservas, cuenta
│  │  └─ admin/              ← panel administrativo (layout y guardas propios)
│  ├─ app/api/               ← webhooks, cron, health, push
│  ├─ config/                ← brand.ts, site.ts, features.ts, limits.ts
│  ├─ domain/                ← lógica pura + tests
│  ├─ server/
│  │  ├─ services/
│  │  ├─ repositories/
│  │  ├─ adapters/           ← payments/, email/, push/, sms/, storage/, ratelimit/, geo/
│  │  ├─ auth/               ← obtener sesión, exigir rol, exigir MFA
│  │  └─ jobs/
│  ├─ components/
│  │  ├─ ui/                 ← shadcn
│  │  └─ …                   ← por funcionalidad (listings/, chat/, booking/…)
│  ├─ i18n/messages/{es,ca,en}.json
│  ├─ lib/                   ← utilidades sin lógica de negocio
│  └─ styles/
├─ tests/
│  ├─ integration/
│  └─ e2e/
└─ public/                   ← iconos PWA, manifest, offline
```

### 3.3 Variables de configuración (no secretos)

- `src/config/features.ts`: *feature flags* por defecto (mapa, intercambio, SMS, PRO, destacados, asistente de ayuda con IA, login con Google). Sobrescribibles desde la tabla `feature_flags`.
- `src/config/limits.ts`: tamaños de archivo, número de imágenes, longitudes de texto, límites de frecuencia, plazos (caducidad de propuestas, confirmación automática, ventana de valoraciones…). Valores por defecto en código, sobrescribibles desde `platform_settings`.
- Las **comisiones** y **políticas de cancelación** viven **solo** en base de datos (gestionables desde administración), con valores iniciales en la semilla de producción mínima (`supabase/seed/required.sql`).

---

## 4. Roles, capacidades y verificaciones

### 4.1 Modelo

Una misma cuenta puede pedir y ofrecer ayuda. Por eso:

- **Roles de sistema** (tabla `user_roles`): `user` (implícito), `moderator`, `admin`. Solo los asigna un administrador, con registro en auditoría.
- **Capacidades derivadas** (no son roles): «puede cobrar» = tiene cuenta conectada de Stripe con `charges_enabled` y `payouts_enabled`; «PRO» = suscripción activa; etc. Se calculan en una función `getCapabilities(userId)` probada.

### 4.2 Permisos

| Acción | Visitante | Usuario | Usuario que puede cobrar | Moderador | Admin |
|---|:-:|:-:|:-:|:-:|:-:|
| Ver portada, categorías, anuncios publicados, perfiles públicos, ayuda | ✔ | ✔ | ✔ | ✔ | ✔ |
| Registrarse / iniciar sesión | ✔ | | | | |
| Editar su perfil, publicar, mensajes, favoritos, denunciar | | ✔ | ✔ | ✔ | ✔ |
| Contratar y pagar, valorar, abrir incidencias | | ✔ | ✔ | ✔ | ✔ |
| Enviar propuestas **de pago** | | ✖ (solo gratuitas o «a convenir») | ✔ | | |
| Recibir cobros, ver saldo y operaciones | | | ✔ | | |
| Revisar denuncias, ocultar contenido, advertir, suspender temporalmente, ver incidencias asignadas | | | | ✔ | ✔ |
| Gestionar usuarios, roles, categorías, comisiones, políticas, reembolsos, suscripciones, contenido, configuración, ver auditoría y métricas | | | | | ✔ |

- Moderadores y administradores **deben** tener MFA (TOTP) activo; las rutas `/admin` exigen sesión con nivel `aal2`.
- Ningún administrador puede modificar sus propios roles ni borrar registros de auditoría.

### 4.3 Verificaciones (no mezclar)

Cada verificación es **independiente**, tiene su propia insignia, su propio texto explicativo («qué significa / qué NO significa») y su registro en `user_verifications` (tipo, estado, fecha, método, quién la revisó, caducidad):

| Verificación | Cómo se obtiene | Qué significa | Qué NO significa |
|---|---|---|---|
| Correo verificado | Enlace por correo | Controla esa dirección | Nada sobre su identidad |
| Teléfono verificado [V1] | Código SMS | Controla ese número | Nada sobre su identidad |
| Identidad verificada | KYC de Stripe Connect | Stripe ha comprobado su identidad para poder cobrar | **No** acredita formación, experiencia ni antecedentes |
| Profesional acreditado [V1] | Revisión manual de título, colegiación o alta de autónomo | Hemos revisado un documento profesional concreto, en una fecha concreta | No garantizamos la calidad del trabajo |
| Documentación específica [V1] | Revisión manual (por ejemplo, certificado negativo de delitos sexuales para cuidado de menores) | Se ha visto el documento en fecha X | No se conserva el documento más allá de lo imprescindible (ver 19.3) |

Además, el perfil indica si la persona actúa como **particular** o como **profesional** (autónomo o empresa). Esto tiene consecuencias legales (derechos de consumidores, facturación, trazabilidad del comerciante según la DSA) y debe mostrarse en anuncios y propuestas.

---

## 5. Autenticación y cuenta [MVP]

- Registro con nombre, correo y contraseña; aceptación **versionada** de condiciones y privacidad (se guarda versión, fecha, IP truncada y *user agent*).
- Verificación de correo obligatoria antes de publicar, chatear o pagar.
- Inicio de sesión, cierre de sesión, recuperación y restablecimiento de contraseña.
- Login con Google [V1], detrás de *feature flag*.
- Gestión de sesiones: ver dispositivos activos y cerrar sesión en todos.
- MFA opcional (TOTP) para usuarios; obligatorio para moderadores y administradores.
- Eliminación de cuenta (con periodo de gracia configurable, por defecto 14 días, y anonimización de lo que deba conservarse por ley).
- Exportación de datos personales (JSON + archivos) generada en segundo plano y entregada por enlace firmado de un solo uso.

**Protecciones:**
- Mensajes idénticos para «correo no existe» y «contraseña incorrecta» (anti-enumeración), también en registro y recuperación.
- Rate limiting por IP y por cuenta en login, registro, recuperación y verificación.
- Captcha (Turnstile) en registro y recuperación, y en login tras varios fallos.
- Protección de contraseñas filtradas (Supabase lo permite) y longitud mínima de 10 caracteres.
- Rotación de tokens de sesión y cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
- Aviso por correo ante inicio de sesión desde un dispositivo nuevo, cambio de contraseña o cambio de correo.

---

## 6. Perfil de usuario [MVP]

### 6.1 Separación público / privado

RLS filtra por fila, no por columna. Por eso los datos se dividen:

- `profiles` (lectura pública): nombre público, foto, biografía, municipio, provincia, zona aproximada, idiomas, fecha de alta, última actividad **redondeada** («activo esta semana»), insignias, tipo (particular/profesional), métricas agregadas (valoración media, número de valoraciones, servicios completados, tiempo de respuesta estimado), PRO sí/no.
- `profiles_private` (solo el propio usuario y servidor): nombre y apellidos legales, teléfono, código postal, coordenadas aproximadas, radio de desplazamiento, fecha de nacimiento si se pide, preferencias de privacidad.
- `user_addresses` (solo el propio usuario; se comparte **solo** con la otra parte de una reserva confirmada y solo si la modalidad es presencial o a domicilio).
- Estado KYC, estado de cuenta, suscripción y preferencias de notificación en sus tablas propias.

### 6.2 Ubicación

- Nunca se publica la dirección exacta.
- Se guardan dos puntos: `location_private` (centro del código postal o dirección geocodificada, solo servidor) y `location_public` (ajustado a una cuadrícula de ~1 km o geohash de precisión 6).
- Las distancias que se muestran se redondean («a menos de 2 km», «a unos 5 km»).
- Los resultados nunca devuelven coordenadas exactas al navegador. El mapa [V2] usa solo `location_public`.

### 6.3 Perfil público

Ruta `/personas/[usuario]`: foto, nombre público, biografía, municipio, insignias con explicación, valoraciones (media, distribución y comentarios), anuncios activos, servicios completados, «suele responder en…».

---

## 7. Categorías [MVP]

### 7.1 Catálogo inicial (slugs editables)

| # | Nombre | Slug | Notas |
|---|---|---|---|
| 1 | Hogar y limpieza | `hogar-limpieza` | |
| 2 | Mudanzas y transporte | `mudanzas-transporte` | |
| 3 | Montaje y reparaciones | `montaje-reparaciones` | Instalaciones de gas, electricidad o similares reguladas → requieren profesional habilitado |
| 4 | Recados y gestiones | `recados-gestiones` | Advertencias de credenciales (ver 7.3) |
| 5 | Acompañamiento de mayores | `acompanamiento-mayores` | Persona vulnerable (ver 19.2) |
| 6 | Mascotas | `mascotas` | |
| 7 | Clases y formación | `clases-formacion` | Si es con menores → reglas de 19.2 |
| 8 | Jardinería y exterior | `jardineria-exterior` | |
| 9 | Tecnología y soporte | `tecnologia-soporte` | Nunca pedir contraseñas |
| 10 | Eventos y servicios personales | `eventos-servicios-personales` | |
| 11 | Cuidado de niños | `cuidado-ninos` | Persona vulnerable, verificación reforzada (ver 19.2) |
| 12 | Belleza a domicilio | `belleza-domicilio` | |
| 13 | Obras y pintura | `obras-pintura` | Obras que requieran licencia → advertencia |
| 14 | Cocina a domicilio | `cocina-domicilio` | Advertencia de alérgenos e higiene |
| 15 | Otros servicios | `otros` | Moderación previa obligatoria |

Cada categoría tiene 3–8 subcategorías iniciales razonables (créalas tú, en los tres idiomas).

### 7.2 Campos de cada categoría

Nombre (traducible), slug, descripción, icono Lucide, color (token), imagen opcional, subcategorías, orden, activa sí/no, **requiere moderación previa** sí/no, **verificaciones exigidas** (lista), advertencias (texto traducible mostrado al publicar y en el detalle), restricciones (por ejemplo, «sin fotos de menores»), y **campos personalizados**.

Campos personalizados (`category_fields`): clave, etiqueta traducible, tipo (`text`, `textarea`, `number`, `boolean`, `select`, `multiselect`, `date`), opciones, obligatorio, visible en público sí/no, orden, validación (mín./máx./regex). El asistente de publicación los genera dinámicamente y se validan con un esquema Zod construido a partir de la definición.

### 7.3 Ejemplo: «Recados y gestiones»

Campos: tipo de gestión, organismo, telemática o presencial, necesita desplazamiento, fecha límite, documentos requeridos (solo descripción, no el documento), requiere representación, requiere firma del titular.

Advertencia obligatoria (al publicar, en el detalle y como mensaje del sistema al iniciar un chat en esa categoría):

> Por tu seguridad: nunca compartas contraseñas, PIN, códigos recibidos por SMS, certificados digitales ni claves Cl@ve. Nadie puede hacerse pasar por ti ante un organismo. Si alguien debe actuar en tu nombre, usad una representación o apoderamiento oficial.

---

## 8. Anuncios (publicaciones) [MVP]

### 8.1 Tipos

- **Necesito ayuda** (`request`): una tarea concreta. Normalmente admite **una** reserva.
- **Ofrezco ayuda** (`offer`): un servicio que se puede contratar **varias veces**.

La diferencia debe ser evidente en tarjetas, detalle y filtros (etiqueta, icono **y** texto; nunca solo color).

### 8.2 Campos

ID, autor, tipo, título (10–80 caracteres), descripción (40–4.000), categoría, subcategoría, imágenes (máx. 6; 12 con PRO [V1]), municipio, ubicación aproximada, modalidad, precio en céntimos, tipo de precio, disponibilidad (franjas semanales o fechas concretas), fecha deseada, urgencia, radio, estado, visibilidad (pública / solo enlace), fechas de creación, actualización, publicación y caducidad, contadores (visitas únicas, contactos, favoritos), etiquetas, requisitos, medidas de seguridad, estado de moderación, motivo de rechazo, `slug` legible con identificador corto (`montar-armario-ikea-k3f9a2`).

**Modalidades:** telemático, presencial, híbrido, a domicilio, en ubicación acordada.

**Tipos de precio:** fijo, por hora, por día, presupuesto a convenir, gratuito, intercambio [V2, *feature flag*].

Los precios se muestran **siempre con impuestos incluidos** para el cliente final.

### 8.3 Máquina de estados

| Estado | Llega desde | Quién | Notas |
|---|---|---|---|
| `draft` | — | Autor | Guardado automático |
| `pending_review` | `draft` | Sistema | Si la categoría o la moderación automática lo exige |
| `published` | `draft`, `pending_review`, `paused` | Autor / moderador | Fija `published_at` y `expires_at` (30 días; 60 con PRO) |
| `rejected` | `pending_review` | Moderador | Con motivo comunicado al autor y vía de reclamación |
| `paused` | `published` | Autor / sistema (inactividad) | |
| `reserved` | `published` | Sistema | **Solo `request`**, cuando su reserva se confirma |
| `completed` | `reserved` | Sistema | Cuando la reserva se completa |
| `expired` | `published` | Tarea programada | Renovable por el autor |
| `removed` | cualquiera | Autor (borrado lógico) / moderador (ocultación) | Nunca borrado físico inmediato |

Implementa las transiciones en `src/domain/listings/state-machine.ts` con una tabla de transiciones permitidas y pruebas que recorran **todas** las combinaciones (las no permitidas deben fallar).

### 8.4 Asistente de publicación (`/publicar`)

Pasos: 1) ¿Necesitas o das ayuda? · 2) Categoría y subcategoría · 3) Título, descripción y campos específicos · 4) Modalidad y ubicación · 5) Fecha, horario y disponibilidad · 6) Precio · 7) Fotos · 8) Vista previa · 9) Confirmación.

Requisitos:
- Borrador creado en servidor al terminar el paso 1 y guardado automático (con *debounce*) en cada cambio; el borrador sobrevive a recargas y a cambios de dispositivo.
- Barra de progreso accesible («Paso 3 de 9») y botón Atrás sin perder datos.
- Validación por paso con el esquema Zod correspondiente; los errores se anuncian a lectores de pantalla.
- Vista previa en tiempo real de la tarjeta (en escritorio, panel lateral; en móvil, paso 8).
- Consejos para escribir un buen anuncio, contextuales por categoría.
- **Detección de datos de contacto** en título y descripción: teléfonos españoles e internacionales (incluidas variantes con espacios, puntos o escritos con letras: «seis cero cero…»), correos (incluido «arroba»/«at»), URLs, IBAN, perfiles de redes sociales. Se avisa y se bloquea la publicación hasta corregir.
- Moderación automática básica: lista configurable de términos prohibidos o sensibles por idioma; si hay coincidencia → `pending_review`.
- Aviso antes de subir documentos: «no subas DNI, recetas, informes médicos ni documentos con datos personales».
- Imágenes: JPEG/PNG/WebP/HEIC, máx. 10 MB de entrada; en servidor se comprueba el tipo real (*magic bytes*), se **eliminan metadatos EXIF** (incluida la geolocalización), se recomprime a WebP y se generan 3 tamaños. Los originales no se conservan.
- Al publicar: comprobaciones finales en servidor (nunca confiar en el cliente), cálculo de estado (`published` o `pending_review`) y notificación al autor.

---

## 9. Portada (`/`) [MVP]

1. **Cabecera:** logotipo, buscador compacto, Explorar, Cómo funciona, Ofrecer ayuda, botón Publicar, Entrar o menú de usuario (con contador de no leídos), menú móvil accesible (drawer con trampa de foco).
2. **Hero:** titular original de una frase, subtítulo, buscador «¿Qué necesitas?» + «¿Dónde?» (municipio con autocompletado o «Usar mi ubicación», que solo se usa para calcular la zona aproximada), botones «Necesito ayuda» y «Quiero ofrecer ayuda», ilustración SVG original, mensaje de confianza («Pagos protegidos y valoraciones solo de servicios reales»).
3. **Accesos rápidos:** Recados, Gestiones, Tecnología, Limpieza, Mayores, Mascotas, Clases, Mudanzas.
4. **Indicadores:** usuarios, personas con identidad verificada, servicios completados, valoración media. **Se calculan con datos reales** (cacheados) y **se ocultan** si están por debajo de un umbral configurable. Nunca cifras inventadas (sería publicidad engañosa).
5. **Dos caminos:** tarjeta «Pide ayuda» y tarjeta «Ofrece ayuda» con 3 pasos cada una.
6. **Casos de uso cotidianos:** acompañar a una cita médica, recoger documentación, ayudar con una gestión telemática, configurar un móvil, montar un mueble, pasear a un perro, dar una clase, hacer una entrega.
7. **Anuncios recientes:** pestañas accesibles «Ofrecen ayuda» / «Necesitan ayuda», 8 tarjetas, enlace «Ver todos».
8. **Categorías:** cuadrícula responsive con icono, nombre y número de anuncios activos.
9. **Cómo funciona:** Publica → Habla → Acuerda → Reserva con protección → Confirma → Valora.
10. **Seguridad:** pagos protegidos, identidad verificada (explicando qué significa), valoraciones vinculadas a reservas, soporte, denuncias, privacidad de ubicación.
11. **Pie:** categorías, información, ayuda, seguridad, legal (aviso legal, condiciones, privacidad, cookies, normas de la comunidad, cómo ordenamos los resultados), redes sociales (desde `brand.ts`), selector de idioma y contacto.

---

## 10. Búsqueda y listado (`/explorar`) [MVP]

### 10.1 Filtros

Texto, tipo, categoría, subcategoría, municipio, radio (5/10/25/50 km), modalidad, precio mín./máx., tipo de precio, disponibilidad (hoy, esta semana, fechas), valoración mínima, identidad verificada, solo con foto, solo recientes (7 días), solo urgentes.

### 10.2 Orden

Relevancia (por defecto), más recientes, más cercanos, menor precio, mayor valoración, mejor tiempo de respuesta. Los anuncios **promocionados** se muestran marcados como «Promocionado» y en posiciones fijas y limitadas (por ejemplo, 2 por página); nunca alteran valoraciones ni se presentan como resultado orgánico.

Publica la página **«Cómo ordenamos los resultados»** con los parámetros principales de clasificación (obligación de transparencia en la UE).

### 10.3 Implementación

- Búsqueda de texto completo en Postgres (`tsvector` con configuración `spanish`, `unaccent`, ponderación título > etiquetas > descripción) + `pg_trgm` para tolerar errores tipográficos.
- Distancia con PostGIS (`ST_DWithin` sobre `location_public`, tipo `geography`).
- Una función SQL o vista `search_listings(...)` con paginación por cursor (*keyset*) y sin consultas N+1 (autor, insignias y primera imagen en la misma consulta).
- Filtros sincronizados con la URL (parámetros de búsqueda validados con Zod); resultados compartibles; botón atrás del navegador respeta el estado.
- Vistas: lista y cuadrícula; mapa [V2] desactivable.
- Escritorio: filtros en panel lateral. Móvil: botón «Filtros (3)» que abre un *drawer* inferior con «Ver N resultados».
- Estados vacíos útiles: sugerir ampliar radio, quitar filtros o **publicar una solicitud** con los criterios ya rellenados.
- Carga incremental con botón «Ver más» (accesible), no *scroll* infinito puro.
- SEO: solo se indexan `/explorar`, categoría y subcategoría + municipio; el resto de combinaciones de filtros llevan `noindex, follow` y *canonical* a la versión base.

### 10.4 Tarjeta de anuncio

Imagen (o ilustración de la categoría si no hay), tipo, categoría, título, precio y tipo de precio, modalidad, municipio y distancia aproximada, avatar y nombre, insignias, valoración y número de valoraciones, fecha relativa, etiquetas «Urgente» / «Promocionado», botón de favorito (con `aria-pressed`) y disponibilidad. Toda la tarjeta es un único enlace accesible; el botón de favorito es un control independiente.

---

## 11. Detalle de anuncio (`/anuncios/[slug]`) [MVP]

- Galería accesible (teclado, contador, texto alternativo), título, tipo, categoría, precio, modalidad, ubicación aproximada, descripción completa, campos específicos públicos, disponibilidad, requisitos, advertencias de la categoría y consejos de seguridad.
- Bloque del autor: foto, nombre, biografía breve, valoración, servicios completados, insignias con explicación, tiempo de respuesta, fecha de alta, enlace a perfil.
- Valoraciones recientes y anuncios parecidos (misma categoría y zona).
- Acciones: **Contactar**, **Solicitar propuesta**, Guardar, Compartir (Web Share API con alternativa de copiar enlace), Denunciar.
- En móvil: barra inferior fija con precio + «Contactar» + «Guardar», respetando `safe-area-inset-bottom`.
- Si el visitante no ha iniciado sesión, las acciones llevan a entrar y **vuelven** al anuncio con la acción pendiente.
- Nunca se muestran: correo, teléfono, dirección exacta, documentos, datos bancarios.
- Estados especiales: anuncio pausado, reservado, caducado, eliminado (página 410 con anuncios parecidos), autor suspendido.
- SEO: metadatos únicos, Open Graph con imagen generada (`opengraph-image`), JSON-LD `Service` + `BreadcrumbList`. **No** incluyas `AggregateRating` sobre el propio negocio si las directrices de buscadores no lo permiten para valoraciones autogestionadas.

---

## 12. Chat interno (`/mensajes`, `/mensajes/[conversationId]`) [MVP]

### 12.1 Funciones

- Una conversación por par de usuarios **y** anuncio (se reutiliza si ya existe).
- Lista con búsqueda, filtros (todas, no leídas, archivadas, bloqueadas), último mensaje y contador de no leídos.
- Mensajes en tiempo real, indicador «escribiendo…» (Broadcast, no se guarda en BD), estados enviado / entregado / leído (respetando una preferencia de privacidad para desactivar el «leído»).
- Adjuntos (imágenes y PDF) [MVP], respuesta a un mensaje concreto [V1], eliminación local («borrar para mí») [V1].
- Mensajes del sistema (propuesta enviada, pago completado, reserva cancelada, advertencias de seguridad) con estilo diferenciado.
- Agrupación por fecha, enlace al anuncio relacionado, reportar conversación, silenciar, bloquear usuario.
- Envío optimista con reintento y cola local si no hay conexión (sin guardar contenido en caché persistente sin cifrar; ver 17).

### 12.2 Móvil

Lista a pantalla completa; al abrir una conversación ocupa toda la pantalla con cabecera fija (volver, avatar, nombre, enlace al anuncio, menú), caja de texto fija abajo compatible con teclado virtual (`visualViewport`, `interactive-widget=resizes-content`) y área segura en iPhone.

### 12.3 Seguridad del chat

- Antes de existir una reserva confirmada: detectar teléfonos, correos, enlaces externos e IBAN; mostrar aviso a quien escribe y a quien recibe («Si pagas fuera de la plataforma pierdes la protección»). No bloquear por defecto, pero registrar y permitir que moderación lo revise; umbral configurable para bloquear a reincidentes.
- Texto plano siempre: nunca renderizar HTML; enlaces detectados se muestran con `rel="noopener noreferrer nofollow ugc"` y aviso al salir.
- Adjuntos: lista blanca de tipos, verificación de tipo real, tamaño máximo 10 MB, sin ejecutables ni archivos comprimidos, escaneo antivirus mediante adaptador [V1], almacenamiento privado y acceso mediante URL firmada de 5 minutos solo para participantes.
- Rate limiting por usuario (por ejemplo, 30 mensajes/minuto y 10 conversaciones nuevas/hora, configurable) y límite de conversaciones nuevas para cuentas recientes.
- Bloquear impide nuevos mensajes en ambos sentidos y oculta al bloqueado los anuncios de quien bloquea.

---

## 13. Propuestas formales [MVP]

### 13.1 Contenido

Título, descripción, precio (céntimos) y tipo, fecha, hora, duración estimada, lugar o modalidad, qué incluye, qué no incluye, gastos adicionales previstos, condiciones, fecha de caducidad (por defecto 72 h), política de cancelación aplicable (se elige entre las configuradas y se **copia** una instantánea), desglose de importes calculado en servidor.

Puede crearla quien prestará el servicio. El cliente también puede **solicitar** una propuesta desde el anuncio.

### 13.2 Versionado

- `proposals` es el contenedor; `proposal_versions` guarda cada versión **inmutable**.
- «Pedir cambios» o editar crea una versión nueva y marca la anterior como `superseded`.
- Una versión aceptada no se modifica nunca.

### 13.3 Estados

`draft → sent → viewed → accepted → paid`; desde `sent`/`viewed`: `rejected`, `withdrawn`, `expired`, `superseded`.

Los estados posteriores al pago (`completed`, `cancelled`, `in_dispute`) **no se guardan en la propuesta**: se derivan de la reserva para evitar dos fuentes de verdad.

### 13.4 En el chat

Tarjeta claramente diferenciada con resumen, desglose, caducidad visible y acciones: **Aceptar y pagar**, Rechazar (motivo opcional), Pedir cambios, Hacer una pregunta. La aceptación ocurre en servidor, comprueba que la versión sigue vigente y crea la reserva en `pending_payment` dentro de una transacción con clave de idempotencia.

---

## 14. Reservas [MVP]

### 14.1 Estado de la reserva (`bookings.status`)

| Estado | Transición desde | Disparador |
|---|---|---|
| `pending_payment` | — | Aceptación de propuesta |
| `confirmed` | `pending_payment` | Webhook de pago correcto (nunca el navegador) |
| `in_progress` | `confirmed` | Prestador marca inicio o llega la hora de inicio |
| `awaiting_confirmation` | `in_progress` | Prestador marca «terminado» |
| `completed` | `awaiting_confirmation` | Cliente confirma o confirmación automática a las 72 h (configurable) **si no hay incidencia abierta** |
| `cancelled_by_client` | `pending_payment`, `confirmed` | Cliente, según política |
| `cancelled_by_provider` | `confirmed` | Prestador |
| `no_show_provider` / `no_show_client` | `confirmed`, `in_progress` | Declaración de una parte + revisión |
| `in_dispute` | `in_progress`, `awaiting_confirmation`, `completed` (dentro de plazo) | Apertura de incidencia |
| `expired` | `pending_payment` | Sin pago en 30 min |

- «Próxima» **no es un estado**: es una etiqueta de interfaz (confirmada y empieza en menos de 24 h).
- Reembolsos y transferencias **no son estados de la reserva**: viven en `transactions` / `refunds` / `transfers` y se muestran como «estado del pago» junto a la reserva.
- Cada transición crea un registro en `booking_events` (actor, estado anterior, estado nuevo, motivo, metadatos) mediante una función SQL que valida la transición.

### 14.2 Vista de reserva (`/reservas/[id]`)

Resumen, participantes, anuncio, propuesta aceptada (versión exacta), fecha y hora con zona horaria, ubicación (dirección completa solo si procede y solo a participantes), importe y desglose, estado del pago, política de cancelación aplicada, historial de eventos, acciones disponibles según estado y rol (calculadas en servidor), botón «Añadir al calendario» (.ics), contacto con soporte.

---

## 15. Pagos con Stripe Connect [MVP en modo test]

### 15.1 Modelo de fondos (decisión documentada)

Documenta en `PAYMENT_FLOW.md` y en un ADR el modelo elegido. Recomendación inicial, **a validar con la documentación vigente de Stripe y con asesoría jurídica**:

- Cuentas **Express** para prestadores.
- **Cargos separados y transferencias** (*separate charges and transfers*): el cliente paga a la plataforma; tras la confirmación del servicio se crea un `Transfer` a la cuenta conectada usando `transfer_group = booking_id`; la plataforma retiene su comisión.
- Comprueba y documenta: límites de tiempo para mantener fondos antes de transferir, países admitidos, quién asume contracargos y comisiones de Stripe, qué aparece en el extracto del cliente, y si el modelo encaja con la normativa de servicios de pago (PSD2) o si conviene otro modelo (*destination charges* con `on_behalf_of`).
- **No** describas el sistema como «depósito en garantía», «escrow» ni «custodia» en textos de interfaz ni legales. Usa «pago protegido» y explica exactamente qué cubre.
- No uses autorización con captura manual para servicios futuros (la autorización caduca en pocos días).

### 15.2 Flujo

1. El prestador inicia el alta en Stripe (Account Link) desde `/cuenta/cobros`; se guarda `connected_accounts` con `charges_enabled`, `payouts_enabled`, `requirements` y estado.
2. Stripe verifica su identidad (KYC). El resultado actualiza la insignia «Identidad verificada».
3. El cliente acepta una propuesta → servidor calcula importes (sección 15.4) y crea el PaymentIntent (o Checkout Session) con `idempotency_key`, metadatos (`booking_id`, `proposal_version_id`) y el importe calculado en servidor.
4. Antes de pagar se muestran todos los importes desglosados.
5. El webhook `payment_intent.succeeded` (no la redirección del navegador) marca la transacción como pagada y la reserva como `confirmed`.
6. Tras `completed`, una tarea crea el `Transfer` al prestador (idempotente), y las valoraciones se habilitan.

### 15.3 Entidades y webhooks

Modela: PaymentIntent, Checkout Session (si se usa), Connected Account, Transfer, Refund, Application Fee (si aplica), Payout (informativo, desde eventos de la cuenta conectada), **Dispute de Stripe (contracargo)** y estado de conciliación.

> **No confundas** «incidencia» (disputa interna entre usuarios, sección 16) con «contracargo» (*chargeback* abierto por el banco del cliente). Son tablas y flujos distintos.

Webhooks (`/api/webhooks/stripe`):
- Verifican la firma con el cuerpo crudo.
- Guardan cada evento en `payment_events` con `stripe_event_id` **único** (idempotencia) antes de procesarlo.
- Procesan en una transacción; si fallan, quedan marcados para reintento seguro por una tarea programada.
- Registran eventos desconocidos sin romper.
- Responden 2xx rápido.
- Nunca confían en importes o estados enviados por el navegador.

Conciliación [V1]: tarea diaria que compara transacciones internas con el saldo y los objetos de Stripe y marca discrepancias (`reconciliation_status`).

Libro contable interno [V1]: tabla `ledger_entries` de doble entrada (cliente → plataforma → prestador / comisión / impuestos / reembolso) para poder auditar cada céntimo.

### 15.4 Comisiones

- Configurables desde administración, nunca en componentes: porcentaje y fijo al prestador, porcentaje y fijo al cliente, comisión mínima y máxima, impuesto aplicable a la comisión (por ejemplo, IVA 21 %, configurable), reglas por categoría, reducción para PRO, promociones con fechas.
- Las reglas se versionan: cada transacción guarda **la regla exacta aplicada** (instantánea JSON).
- **Una única función pura** `calculateFees(input, rules)` en `src/domain/money/fees.ts` que devuelve: base, comisión cliente, impuesto sobre comisión cliente, total cliente, comisión prestador, impuesto sobre comisión prestador, neto prestador, ingreso de plataforma, impuestos totales.
- Dinero siempre en **enteros de céntimos** + código de moneda (`EUR`). Prohibido `number` con decimales para importes: crea un tipo `Money` (o *branded type* `Cents`) y una regla de lint/test que lo vigile.
- Redondeo: «mitad hacia arriba» en cada línea; los totales se calculan sumando líneas ya redondeadas.
- **Invariante probada con tests de propiedades (fast-check):** `total_cliente = neto_prestador + ingreso_plataforma + impuestos` para cualquier entrada válida; ningún valor negativo; neto ≤ base.

Ejemplo de prueba (valores ilustrativos, no definitivos): base 40,00 €; cliente 5 % + 0,50 € → 2,50 € + IVA 0,53 € → total cliente 43,03 €; prestador 10 % → 4,00 € + IVA 0,84 € → neto 35,16 €; plataforma 6,50 € + impuestos 1,37 €. Comprobación: 35,16 + 6,50 + 1,37 = 43,03 ✔.

### 15.5 Simulador de pagos

Si no hay `STRIPE_SECRET_KEY`, el adaptador `FakePaymentProvider`:
- Implementa la misma interfaz que el adaptador real.
- Muestra una página de pago simulada claramente marcada «MODO DEMO — no se cobra dinero» con botones «pago correcto», «pago rechazado» y «requiere autenticación».
- Genera eventos con el mismo formato que los webhooks reales y los procesa por el mismo código.
- Nunca puede activarse en producción (comprobación al arrancar: si `NODE_ENV=production` y no hay claves reales, la aplicación se niega a habilitar pagos).

---

## 16. Cancelaciones, reembolsos e incidencias [MVP]

### 16.1 Motor de cancelación

Función pura `evaluateCancellation(booking, actor, now, policy)` en `src/domain/cancellation/` que considera: quién cancela, horas restantes, si el servicio empezó, fuerza mayor, no presentación, incidencia abierta y decisión de administración. Devuelve importe reembolsado, importe no reembolsable, compensación al prestador y explicación legible.

Política inicial de ejemplo (editable en administración y versionada):

| Caso | Reembolso al cliente |
|---|---|
| Cliente cancela con más de 24 h | 100 % de la base; comisión de servicio no reembolsable (configurable) |
| Cliente cancela entre 24 h y 2 h | 50 % de la base |
| Cliente cancela con menos de 2 h / no se presenta | 0 % de la base (el prestador cobra según política) |
| Prestador cancela o no se presenta | 100 % del total, incluidas comisiones; queda registrado en su historial |
| Fuerza mayor acreditada | Decisión de soporte; por defecto 100 % |
| Servicio ya iniciado | No se puede cancelar: se abre una incidencia |

Antes de confirmar: mostrar el cálculo, el importe que se recupera y lo no reembolsable, pedir motivo, pedir confirmación explícita y guardar una instantánea de la política aplicada.

### 16.2 Incidencias (disputas internas)

- Se abren desde la reserva (hasta N días después de completada, configurable).
- Campos: motivo (lista), explicación, pruebas (fotos y documentos privados), importe reclamado, resolución solicitada.
- Estados: `open → awaiting_info → under_review → resolved_client | resolved_provider | partial_agreement → closed`.
- Mientras está abierta: se bloquea la confirmación automática y cualquier transferencia; se permiten mensajes con soporte (`dispute_messages`); toda decisión queda registrada con autor, fecha, motivo e importes; se notifica a ambas partes en cada cambio.
- Las resoluciones con dinero ejecutan reembolsos o transferencias a través del servicio de pagos, nunca manualmente en BD.

### 16.3 Inmutabilidad

`booking_events`, `payment_events`, `moderation_actions`, `audit_logs`, `legal_acceptances` son **append-only**: sin permisos `UPDATE`/`DELETE` para ningún rol de aplicación (incluido admin) y un *trigger* que lo impide. Las correcciones se hacen añadiendo un evento nuevo que referencia al anterior.

---

## 17. PWA y notificaciones

### 17.1 PWA [MVP]

- `manifest.webmanifest` con nombre desde `brand.ts`, iconos originales (192, 512, *maskable*, Apple touch icon), `theme_color`, `background_color`, `display: standalone`, accesos directos (Publicar, Mensajes).
- Service worker:
  - Precaché del *shell* y página `/offline`.
  - *Stale-while-revalidate* solo para recursos estáticos y páginas **públicas**.
  - **Nunca** cachear respuestas autenticadas, mensajes, reservas, pagos ni URLs firmadas.
  - Al cerrar sesión, limpiar cachés y datos locales.
- Banner de instalación no intrusivo (tras la segunda visita o tras una acción con éxito; se puede descartar y se recuerda).
- Instrucciones específicas para iOS («Compartir → Añadir a pantalla de inicio») antes de ofrecer notificaciones push, que en iOS solo funcionan con la PWA instalada.
- Actualización controlada: aviso «Hay una versión nueva» con botón para recargar; nunca recargar a mitad de un formulario.
- Soporte de `safe-area-inset-*` y `viewport-fit=cover`.

### 17.2 Notificaciones

Canales: dentro de la aplicación [MVP], correo [MVP], push web [V1], SMS para eventos críticos [V2].

Eventos: nuevo mensaje (agrupado, con retardo para no duplicar si el usuario está conectado), nueva propuesta, propuesta aceptada/rechazada/caducada, pago completado, recordatorio de reserva (24 h y 2 h), cancelación, servicio pendiente de confirmación, pago liberado, nueva valoración, incidencia actualizada, anuncio caducado o rechazado, seguridad de la cuenta (no desactivable).

Implementa: preferencias por tipo × canal, contador de no leídas en tiempo real, marcar una / todas como leídas, enlaces profundos, registro de envíos (`notification_deliveries`) con estado y reintentos, eliminación automática de suscripciones push inválidas (respuestas 404/410), activación por dispositivo, horario de silencio [V1], enlace de baja en cada correo no transaccional.

---

## 18. Valoraciones y favoritos

### 18.1 Valoraciones [MVP]

- Solo participantes de una reserva `completed`, una por participante y reserva, dentro de una ventana de 14 días.
- **Publicación ciega:** ninguna se muestra hasta que ambas partes valoran o termina la ventana (evita represalias).
- Puntuación general 1–5 y subpuntuaciones (puntualidad, comunicación, calidad, relación calidad-precio), comentario (opcional, 20–1.000 caracteres).
- Edición permitida durante 48 h; una única respuesta pública de la persona valorada.
- Denuncia de valoraciones y moderación (ocultar con motivo, nunca editar el texto del usuario).
- Etiqueta «Servicio realizado a través de la plataforma».
- Página que explica **cómo se verifican las valoraciones** (exigencia de la normativa europea de consumo).
- Media y distribución calculadas en BD (vista materializada o columnas agregadas actualizadas por *trigger*).
- Sin reseñas anónimas ni reseñas sin reserva.

### 18.2 Favoritos [MVP]

Guardar y quitar, listado en `/cuenta/favoritos`, sincronizado entre dispositivos, interfaz optimista con reversión y aviso si falla, aviso cuando un favorito se pausa o caduca [V1].

---

## 19. Seguridad del contenido, menores y personas vulnerables

### 19.1 Contenido prohibido o restringido

Prohibido: actividades ilegales, suplantación, venta o intercambio de credenciales y certificados digitales, acceso no autorizado a cuentas, armas, drogas, material robado, fraude, servicios financieros no autorizados, contenido discriminatorio, explotación, actividades inseguras, servicios sexuales, pagos externos para eludir la protección o las comisiones.

Restringido (requiere acreditación y revisión manual; la categoría o subcategoría se puede desactivar): servicios sanitarios regulados, instalaciones reguladas (gas, electricidad, climatización), asesoramiento legal o financiero, transporte de personas con vehículo.

Publica unas **Normas de la comunidad** claras y enlázalas al publicar y al denunciar.

### 19.2 Menores y personas vulnerables (cuidado de niños, acompañamiento de mayores, clases a menores)

- Reglas específicas visibles al publicar y contratar.
- Verificaciones adicionales configurables por categoría (por ejemplo, identidad verificada obligatoria y, para actividades con contacto habitual con menores, revisión del **certificado negativo del Registro Central de Delincuentes Sexuales**, exigido por la normativa española en ese ámbito; confírmalo con asesoría).
- Prohibido publicar nombres, fotos, colegio u otros datos de menores; el sistema bloquea imágenes en esas categorías y avisa en el texto.
- Nunca mostrar direcciones; revisión reforzada (moderación previa obligatoria).
- Botón informativo de emergencia («Si hay un peligro inmediato, llama al 112»), sin prometer asistencia de la plataforma.
- Registro de incidencias de seguridad con prioridad alta.
- Recomendaciones para la primera reunión (lugar público, acompañado, videollamada previa).

### 19.3 Moderación y obligaciones de plataforma (UE)

Diseña el sistema para cumplir la **Ley de Servicios Digitales (Reglamento (UE) 2022/2065)**, aunque como pequeña empresa algunas obligaciones puedan no aplicar al principio:
- Mecanismo de denuncia sencillo para cualquier persona, incluso sin cuenta.
- **Exposición de motivos** al usuario afectado por cada decisión de moderación (qué, por qué, base en las normas, si fue automático, cómo reclamar).
- Sistema interno de reclamación contra decisiones de moderación.
- Trazabilidad de los prestadores profesionales (datos de identificación del comerciante).
- Transparencia de la publicidad (anuncios promocionados) y de los criterios de clasificación.
- Prohibición de patrones oscuros en la interfaz (cancelar PRO tan fácil como contratarlo, rechazar cookies tan fácil como aceptarlas).

Obligaciones fiscales: prepara la recogida de datos de prestadores y el informe anual exigidos por la normativa **DAC7** (en España, modelo 238) en una tabla `tax_profiles` [V1]. Valida umbrales y campos con asesoría fiscal.

Documenta todo en `MODERATION.md` y `docs/legal/COMPLIANCE.md`.

---

## 20. Privacidad y RGPD [MVP]

- Consentimientos documentados y versionados (`legal_documents`, `legal_acceptances`, `cookie_consents`).
- Banner de cookies conforme a la guía de la AEPD: botones «Aceptar», «Rechazar» y «Configurar» al mismo nivel; nada no esencial se carga antes del consentimiento; preferencias granulares; enlace permanente para cambiarlas.
- Minimización: no pedir datos que no se usan; justificar cada campo en `DATABASE.md` (finalidad y base jurídica).
- Derechos de acceso, rectificación, supresión, portabilidad, oposición y limitación desde `/cuenta/privacidad` (con flujo de solicitud registrado y plazo de respuesta).
- Política de retención por tipo de dato (por ejemplo, mensajes 2 años tras la última actividad, datos de facturación según plazos legales) aplicada por tareas programadas.
- Anonimización al eliminar cuenta cuando haya obligación de conservar (transacciones, facturas, incidencias).
- Registro de brechas de seguridad (`security_incidents`) y procedimiento en `SECURITY.md`.
- Lista de encargados del tratamiento (Supabase, Vercel, Stripe, Resend, Sentry, Upstash…) con su ubicación de datos.
- Documentos legales como **borradores** en `docs/legal/` y en `legal_documents`, con la marca visible «BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA». No inventes textos definitivos ni datos de la empresa.
- Páginas: aviso legal (LSSI-CE), condiciones de uso, política de privacidad, política de cookies, normas de la comunidad, cómo ordenamos los resultados, cómo verificamos las valoraciones, política de cancelación.

---

## 21. Suscripción PRO, destacados y panel de usuario

### 21.1 PRO [V1, *feature flag*]

- Ventajas configurables: insignia PRO, más fotos, mayor duración de anuncios, estadísticas, X destacados al mes, menor comisión, soporte prioritario, personalización del perfil.
- Planes mensual y anual con Stripe Billing, renovación automática, cancelación en dos clics, periodo vigente, portal de facturación de Stripe, facturas, webhooks, periodo de gracia ante fallo de cobro, gestión del derecho de desistimiento de 14 días para consumidores.
- PRO **no** implica identidad verificada ni profesional acreditado; la interfaz lo deja claro.

### 21.2 Anuncios urgentes o destacados [V1, *feature flag*]

Compra de visibilidad temporal con etiqueta visible «Promocionado», fechas de inicio y fin, posición limitada, sin alterar valoraciones, reembolso proporcional si moderación retira el anuncio.

### 21.3 Panel de usuario (`/cuenta`)

Resumen (próximos servicios, mensajes no leídos, propuestas pendientes, saldo, acciones necesarias, rendimiento de anuncios, alertas), perfil, mis anuncios, borradores, favoritos, mensajes, mis reservas (como cliente), servicios prestados, pagos, cobros, valoraciones, verificación, suscripción, notificaciones, seguridad (contraseña, MFA, sesiones), privacidad y datos personales, eliminar cuenta, soporte.

---

## 22. Panel administrativo (`/admin`) [MVP básico → V1 completo]

- Layout separado, `noindex`, MFA obligatorio, comprobación de rol en **cada** acción de servidor.
- Apartados: dashboard, usuarios, anuncios, categorías y campos, denuncias (anuncios, mensajes, valoraciones, usuarios), reservas, pagos, reembolsos, incidencias, contracargos, valoraciones, suscripciones, promociones, comisiones y políticas, notificaciones, contenido (ayuda, FAQ, textos legales), *feature flags* y configuración, auditoría, salud del sistema.
- [MVP]: usuarios, anuncios, denuncias, categorías, reservas, incidencias, comisiones, auditoría.
- Métricas [V1]: altas, usuarios activos, anuncios activos y por categoría, conversión contacto → reserva, volumen bruto, ingresos de plataforma, ticket medio, cancelaciones, incidencias, tiempo de respuesta, servicios completados, retención por cohortes, distribución geográfica por provincia.
- Toda acción delicada: diálogo de confirmación, motivo obligatorio, registro en `audit_logs` (actor, fecha, IP truncada, entidad, valores antes/después **sin datos sensibles completos**), y principio de mínimo acceso (los datos personales se muestran enmascarados salvo que se pulse «mostrar», lo cual también se audita).

---

## 23. Soporte y centro de ayuda

- [MVP] «Cómo funciona», centro de ayuda con artículos en BD o MDX traducibles, buscador, FAQ, formulario de contacto (con captcha) que crea un ticket.
- [V1] Tickets con seguimiento en `/cuenta/soporte`, respuestas de soporte, prioridad y asignación.
- [V2] Asistente de ayuda con IA (*feature flag*) que responde solo con artículos del centro de ayuda, cita la fuente y deriva a un humano.
- Temas: primeros pasos, anuncios, chat, propuestas, pagos, cobros, verificaciones, cancelaciones, reembolsos, incidencias, seguridad, PRO, notificaciones, cuenta.

---

## 24. Base de datos

### 24.1 Reglas generales

- Migraciones SQL versionadas en `supabase/migrations/`; nunca cambios manuales en producción.
- `id uuid` (PK), `created_at` y `updated_at` (`timestamptz`, *trigger* de actualización), `deleted_at` donde haya borrado lógico, `created_by`/`updated_by` donde aporte trazabilidad.
- Todas las fechas en UTC (`timestamptz`); la zona horaria de presentación por defecto es `Europe/Madrid`.
- Importes: `bigint` en céntimos + `currency char(3)`; `CHECK (amount >= 0)`.
- Estados como `enum` de Postgres o `text` con `CHECK`; transiciones validadas en funciones SQL además de en el dominio.
- Índices: todas las FK, campos de filtrado frecuente, GIN para `tsvector` y trigramas, GiST para geografía, índices parciales para estados activos.
- RLS **activado en todas las tablas** sin excepción; una prueba automatizada falla si alguna tabla del esquema `public` no lo tiene.
- La clave `service_role` solo se usa en servidor y en código claramente aislado (`src/server/supabase/admin.ts`, con `import 'server-only'`).

### 24.2 Tablas

`auth.users` es gestionada por Supabase (no dupliques una tabla `users`).

- **Identidad y cuenta:** `profiles`, `profiles_private`, `user_addresses`, `user_roles`, `user_verifications`, `user_devices`, `push_subscriptions`, `notification_preferences`, `user_blocks`, `tax_profiles` [V1], `account_deletion_requests`, `data_export_requests`
- **Catálogo:** `categories`, `subcategories`, `category_fields`
- **Anuncios:** `listings`, `listing_images`, `listing_custom_values`, `listing_favorites`, `listing_views` (agregadas por día, sin IP completa), `listing_reports`
- **Mensajería:** `conversations`, `conversation_participants`, `messages`, `message_attachments`, `message_reports`
- **Contratación:** `proposals`, `proposal_versions`, `bookings`, `booking_events`, `cancellation_policies` (versionadas)
- **Pagos:** `transactions`, `payment_events`, `connected_accounts`, `transfers`, `refunds`, `chargebacks`, `fee_rules` (versionadas), `ledger_entries` [V1]
- **Incidencias:** `disputes`, `dispute_messages`, `dispute_evidence`
- **Reputación:** `reviews`, `review_reports`
- **Monetización:** `subscriptions`, `promoted_listings`
- **Notificaciones:** `notifications`, `notification_deliveries`
- **Soporte:** `support_tickets`, `support_messages`, `help_articles`
- **Moderación y cumplimiento:** `moderation_actions`, `moderation_appeals`, `blocked_terms`, `audit_logs`, `security_incidents`
- **Legal:** `legal_documents`, `legal_acceptances`, `cookie_consents`
- **Sistema:** `feature_flags`, `platform_settings`, `idempotency_keys`, `job_runs`

`DATABASE.md` debe incluir para cada tabla: finalidad, columnas, PK, FK, índices, restricciones, políticas RLS (en lenguaje natural y SQL), retención y base jurídica de los datos personales, y un diagrama ER en Mermaid.

### 24.3 Políticas RLS mínimas (cada una con prueba pgTAP)

- Un usuario solo lee y edita su `profiles_private` y sus direcciones.
- `profiles` es legible públicamente solo para cuentas activas.
- Anuncios `published` visibles para todos; borradores y demás estados solo para su autor y moderación.
- Solo participantes leen una conversación y sus mensajes; solo participantes no bloqueados insertan mensajes.
- Solo participantes (y administración vía servidor) leen una reserva y sus eventos.
- Nadie modifica `booking_events`, `payment_events`, `audit_logs`, `moderation_actions` ni `legal_acceptances` desde el cliente.
- Pruebas de incidencias privadas: solo las partes y soporte.
- Los buckets de almacenamiento privados exigen ser participante del recurso asociado.
- Tablas de pagos, comisiones y configuración: sin acceso desde el cliente (solo servidor).

---

## 25. Lógica de servidor, seguridad y calidad

### 25.1 Servidor

Toda operación sensible se ejecuta en servidor: crear cobros, aceptar propuestas, calcular comisiones, reembolsos, cancelaciones, cambios de rol, moderación, liberación de pagos, acceso administrativo, firma de URLs privadas.

Cada Server Action / Route Handler sigue el mismo patrón (créalo como utilidad reutilizable):
1. Obtener sesión → 2. Validar entrada con Zod → 3. Rate limit → 4. Autorizar (rol + propiedad + estado) → 5. Ejecutar en transacción con clave de idempotencia cuando haya efectos económicos → 6. Auditar → 7. Devolver un resultado tipado `{ ok: true, data } | { ok: false, error: { code, message } }` sin filtrar detalles internos.

### 25.2 Seguridad web

- Cabeceras: CSP con *nonce*, HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva, `frame-ancestors 'none'`.
- CSRF: Server Actions de Next ya validan origen; los Route Handlers que modifican datos comprueban `Origin`.
- Logs JSON con `correlation_id` por petición (propagado a Sentry), sin datos sensibles (enmascarar correos, teléfonos, IBAN, tokens).
- Dependencias: `pnpm audit` en CI y Dependabot/Renovate.
- `SECURITY.md`: modelo de amenazas (STRIDE resumido), lista de controles, procedimiento de respuesta a incidentes y de divulgación responsable.

### 25.3 Accesibilidad (objetivo WCAG 2.2 AA)

Navegación por teclado completa, foco visible (anillo de al menos 2 px con contraste suficiente), etiquetas y errores asociados (`aria-describedby`), contraste ≥ 4,5:1, áreas táctiles ≥ 44×44 px, `aria-live` para avisos y nuevos mensajes, nunca depender solo del color, `prefers-reduced-motion`, jerarquía de encabezados correcta, diálogos accesibles (Radix), texto escalable al 200 % sin pérdida, enlace «Saltar al contenido». Pruebas con axe en Playwright para todas las páginas clave (cero violaciones serias o críticas).

### 25.4 SEO

Metadatos únicos, Open Graph y Twitter Cards, *canonical*, `sitemap.xml` dinámico (anuncios publicados, categorías, artículos de ayuda), `robots.txt`, JSON-LD (Organization, WebSite con SearchAction, Service, BreadcrumbList, FAQPage), migas de pan, URLs legibles, `hreflang` entre idiomas, `noindex` en cuenta, mensajes, reservas, publicar, admin y filtros no canónicos.

### 25.5 Internacionalización

- next-intl; español por defecto sin prefijo, `/ca` y `/en` con prefijo. Rutas localizadas si es viable (por ejemplo, `/ca/explorar` puede mantenerse; decide y documenta).
- Ningún texto visible en componentes: todo en `src/i18n/messages/*.json`, con plurales ICU, fechas, horas, moneda y unidades formateadas con `Intl`.
- Catalán **completo y revisado**, no traducción automática a medias; inglés preparado.
- Test que falla si falta una clave en algún idioma o si hay claves sin usar.
- Contenido generado por usuarios no se traduce automáticamente [V2 opcional].

### 25.6 Rendimiento

Objetivos en móvil de gama media: LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Presupuesto de JS inicial en páginas públicas ≤ 170 KB comprimido. `next/image` con tamaños correctos, *lazy loading*, Server Components por defecto, componentes cliente solo cuando haga falta interactividad, consultas paginadas e indexadas, sin N+1, caché de contenido público con revalidación por etiqueta, nunca caché compartida de contenido privado. Lighthouse CI en las páginas públicas principales.

### 25.7 Estados de interfaz

Cada pantalla contempla: cargando (esqueletos), vacío útil, error recuperable con reintento, sin conexión, sin permiso, contenido eliminado, cuenta suspendida, éxito, acción en curso (botón deshabilitado con indicador). Incluye `error.tsx`, `not-found.tsx` y `loading.tsx` en cada segmento relevante.

### 25.8 Observabilidad

Sentry (si hay DSN), logs estructurados, registro de webhooks, alertas por pagos y transferencias fallidas, picos de errores de autenticación, métricas de tareas programadas (`job_runs`), seguimiento de correos (eventos de Resend) y push, endpoint `/api/health` (BD, almacenamiento, proveedores; sin datos sensibles) y página interna de salud en admin.

### 25.9 Tareas programadas

Protegidas con `CRON_SECRET`, idempotentes, con bloqueo para no ejecutarse en paralelo, y registro en `job_runs` (inicio, fin, elementos procesados, errores):
caducar propuestas · expirar reservas sin pago · pasar reservas a `in_progress` · solicitar confirmación · confirmación automática · procesar transferencias pendientes · reintentar webhooks fallidos · caducar y pausar anuncios inactivos · recordatorios de reserva · cerrar ventanas de valoración y publicar valoraciones ciegas · limpiar notificaciones antiguas · eliminar archivos huérfanos · revisar suscripciones · reintentar notificaciones fallidas · aplicar retención de datos · ejecutar eliminaciones de cuenta vencidas · conciliación diaria [V1].

### 25.10 Definición de terminado

Una funcionalidad está terminada solo si:
- [ ] La interfaz funciona y persiste datos reales.
- [ ] Tiene validación (cliente y servidor) y autorización (servicio + RLS).
- [ ] Tiene estados de carga, vacío y error.
- [ ] Funciona en móvil (360 px) y escritorio, con teclado y lector de pantalla.
- [ ] Tiene pruebas (unitarias para la lógica, integración o E2E para el flujo).
- [ ] Está traducida a es y ca.
- [ ] Está documentada.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm test:e2e` pasan.

---

## 26. Pruebas

- **Unitarias (Vitest):** dinero y céntimos, comisiones (incluidas pruebas de propiedades), motor de cancelación (tabla de casos), máquinas de estado (todas las transiciones válidas e inválidas), permisos y capacidades, detección de datos de contacto, validaciones Zod, valoraciones (ventana, ciego, edición), fechas y zonas horarias (incluido cambio de horario de verano), caducidades.
- **Base de datos (pgTAP):** cada política RLS con usuario anónimo, autor, otra persona, participante, moderador y admin; inmutabilidad de tablas de eventos; funciones de transición.
- **Integración (contra Supabase local):** crear anuncio, enviar mensaje, enviar propuesta, aceptar propuesta, crear pago (simulador), procesar webhook (incluido duplicado y fuera de orden), crear reserva, confirmar servicio, abrir incidencia, reembolso, transferencia.
- **E2E (Playwright, móvil y escritorio):**
  1. Registro → verificación de correo (bandeja simulada) → completar perfil → publicar solicitud.
  2. Otro usuario contacta → envía propuesta → cliente acepta → paga en modo test o simulador → prestador marca terminado → cliente confirma → ambos valoran → valoraciones visibles.
  3. Cancelación con cálculo mostrado.
  4. Incidencia y resolución por admin.
  5. Bloqueo y denuncia.
  6. Recuperación de contraseña.
  7. Instalabilidad PWA (manifest y service worker válidos) y página offline.
  8. Navegación móvil completa con teclado y axe.
- Cobertura mínima: 95 % en `src/domain`, 70 % global.
- CI en GitHub Actions: instalar → lint → typecheck → unit → levantar Supabase local → migraciones → pgTAP → integración → build → E2E. Las ramas no se fusionan con CI en rojo.

---

## 27. Datos de demostración

- Semilla determinista (misma semilla → mismos datos) en `supabase/seed/demo/`, ejecutable con `pnpm db:seed:demo`, **bloqueada en producción**.
- 30 usuarios ficticios (nombres generados, correos `@example.com`, avatares de iniciales), varias ciudades (por ejemplo, Barcelona, Girona, Lleida, Tarragona, Madrid, Valencia, Sevilla, Zaragoza), 50 anuncios repartidos en todas las categorías y ambos tipos, perfiles verificados y no verificados, particulares y profesionales, valoraciones, conversaciones con mensajes, propuestas en varios estados, reservas en todos los estados, una incidencia abierta y una resuelta, suscripciones PRO de prueba.
- Textos de demo realistas, en español correcto (y algunos en catalán), sin lorem ipsum.
- Cuentas de acceso rápido documentadas en el README (`cliente@example.com`, `prestador@example.com`, `moderador@example.com`, `admin@example.com`, contraseña de demo indicada solo para entorno local).
- La interfaz muestra una franja «Entorno de demostración» cuando los datos de demo están cargados.

---

## 28. Diseño visual

### 28.1 Principios

Cercanía, confianza, claridad, comunidad, seguridad y facilidad para personas con poca experiencia digital. Mobile-first.

### 28.2 Sistema de diseño

- Fondo principal claro y cálido; tarjetas blancas con borde suave, esquinas redondeadas (12–16 px), sombras discretas.
- Color principal **original** y color secundario para acciones destacadas. Propuesta inicial (cámbiala si quieres, pero verifica el contraste):
  - Fondo: crema cálido (~`#FBF7F1`).
  - Principal: verde azulado profundo (~`#1F6F6B`) para navegación, enlaces y estados de confianza.
  - Acción: coral tostado (~`#E2633B`) solo para la llamada a la acción principal de cada pantalla.
  - Neutros cálidos para texto (~`#1F1B16` sobre crema).
  - Semánticos: éxito, aviso, error e información, todos con contraste AA.
- Tipografía muy legible (por ejemplo, una sans humanista con licencia OFL), cuerpo de 16 px como mínimo, interlineado 1,5.
- Botones grandes (altura mínima 44 px; 48 px en las acciones principales en móvil).
- Formularios guiados, de una columna, con ayudas breves debajo de cada campo.
- Iconos Lucide con texto (nunca icono solo en acciones importantes).
- Modo oscuro [V2].
- Documenta tokens, componentes, variantes y estados en `DESIGN_SYSTEM.md` y crea una página interna `/dev/ui` (solo en desarrollo) que muestre todos los componentes y estados.

### 28.3 Microcopias

Escribe todos los textos tú, originales, claros y sin jerga. Los errores dicen qué ha pasado y qué hacer («No hemos podido enviar tu mensaje. Revisa tu conexión y vuelve a intentarlo.»). Nada de lorem ipsum en pantallas terminadas.

---

## 29. Rutas

```
PÚBLICAS
/                                   Portada
/explorar                           Búsqueda y listado
/categorias                         Todas las categorías
/categorias/[slug]                  Categoría
/categorias/[slug]/[subslug]        Subcategoría
/anuncios/[slug]                    Detalle de anuncio
/personas/[usuario]                 Perfil público
/como-funciona
/ofrecer-ayuda                      Página para prestadores
/seguridad
/pro                                Planes [V1]
/ayuda, /ayuda/[tema], /ayuda/[tema]/[articulo]
/contacto
/legal/[documento]                  aviso-legal, condiciones, privacidad, cookies, normas-comunidad, como-ordenamos, valoraciones, cancelaciones
/offline

AUTENTICACIÓN
/entrar  /registro  /recuperar  /restablecer  /verificar-correo  /auth/callback

PRIVADAS (requieren sesión)
/publicar                           Nuevo anuncio (asistente)
/publicar/[draftId]                 Continuar borrador
/anuncios/[slug]/editar
/mensajes  /mensajes/[conversationId]
/reservas/[bookingId]
/reservas/[bookingId]/cancelar
/reservas/[bookingId]/incidencia
/notificaciones
/cuenta  y subrutas: perfil, anuncios, borradores, favoritos, reservas, servicios, pagos, cobros,
         valoraciones, verificacion, suscripcion, notificaciones, seguridad, privacidad, eliminar, soporte

ADMINISTRACIÓN (rol + MFA)
/admin  y subrutas: usuarios, anuncios, categorias, denuncias, reservas, pagos, reembolsos, incidencias,
        contracargos, valoraciones, suscripciones, promociones, comisiones, politicas, contenido,
        configuracion, auditoria, salud

API
/api/webhooks/stripe
/api/cron/[job]
/api/push/subscribe
/api/health

DESARROLLO
/dev/ui      (solo NODE_ENV=development)
/dev/mail    (bandeja de correos simulados)
```

Las variantes `/ca/...` y `/en/...` existen para todas las rutas públicas.

---

## 30. Variables de entorno (`.env.example`, sin valores reales)

```
# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_DEFAULT_LOCALE=es
APP_ENV=development            # development | preview | production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # solo servidor

# Stripe (vacío = simulador)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Correo (vacío = consola + /dev/mail)
RESEND_API_KEY=
EMAIL_FROM=

# Push
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=

# Captcha
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Observabilidad
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Tareas
CRON_SECRET=
```

Valida todas las variables al arrancar con un esquema Zod (`src/config/env.ts`), separando las públicas de las de servidor. La aplicación falla al iniciar en producción si falta una variable obligatoria.

---

## 31. Documentación

| Archivo | Contenido |
|---|---|
| `README.md` | Requisitos, instalación, variables, Supabase local, migraciones, semillas, desarrollo, pruebas, Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`), despliegue, **creación del primer administrador** (script `pnpm admin:create <email>`), cuentas de demo |
| `ARCHITECTURE.md` | Capas, flujo de datos, diagramas Mermaid (contexto, contenedores, secuencias de pago y reserva), decisiones principales |
| `ROADMAP.md` | Fases, tareas con casillas, estado, bloqueos, deuda técnica |
| `DATABASE.md` | Ver 24.2 |
| `SECURITY.md` | Ver 25.2 |
| `PAYMENT_FLOW.md` | Modelo de fondos, secuencias, estados, webhooks, comisiones, reembolsos, contracargos, conciliación |
| `MODERATION.md` | Normas, flujos de denuncia, exposición de motivos, reclamaciones, niveles de sanción |
| `DESIGN_SYSTEM.md` | Tokens, componentes, accesibilidad, microcopias |
| `DEPLOYMENT.md` | Vercel, Supabase, dominios, variables, webhooks de producción, cron, copias de seguridad, lista de comprobación previa al lanzamiento |
| `CONTRIBUTING.md` | Convenciones de código, commits, ramas, pruebas, cómo añadir una categoría, un idioma o una notificación |
| `docs/adr/` | Decisiones |
| `docs/legal/` | Borradores legales y `COMPLIANCE.md` (RGPD, LSSI, DSA, DAC7, consumo) |

---

## 32. Plan de fases

Cada fase termina con el **informe de fase** (Anexo B). Al terminar una fase, continúa con la siguiente sin esperar confirmación salvo que haya un bloqueo.

### Fase 0 — Auditoría del repositorio
Inspecciona todo el repositorio. Resume su estado, qué existe y qué es aprovechable, riesgos y deuda. Si está vacío, dilo y continúa.

### Fase 1 — Diseño técnico (sin pantallas todavía)
Guarda `docs/PRODUCT_SPEC.md`. Crea `ARCHITECTURE.md`, `ROADMAP.md`, `DATABASE.md` (con ER), `SECURITY.md`, `PAYMENT_FLOW.md` (borrador), `DESIGN_SYSTEM.md` (borrador) y los primeros ADR (stack, modelo de fondos, ubicación aproximada, i18n). Define árbol de rutas, entidades, roles, permisos y máquinas de estado de anuncio, propuesta, reserva, transacción e incidencia.

### Fase 2 — Cimientos
Proyecto Next.js + TS estricto + Tailwind + shadcn, ESLint/Prettier/Husky, CI, `env.ts`, `brand.ts`, i18n (es/ca/en), Supabase local, migraciones iniciales con RLS y pgTAP, Auth completo (registro, verificación, login, recuperación, cierre, captcha, rate limit), sistema de diseño y `/dev/ui`, layout general (cabecera, pie, menú móvil, barra inferior móvil), páginas públicas estáticas (cómo funciona, seguridad, legal en borrador), banner de cookies, adaptadores con implementaciones de desarrollo, dominio de dinero y comisiones con pruebas.

### Fase 3 — Anuncios y descubrimiento
Perfiles (público y privado), categorías con campos personalizados, asistente de publicación completo, procesamiento de imágenes, moderación automática básica, portada completa, `/explorar` con todos los filtros, detalle de anuncio, perfil público, favoritos, SEO de páginas públicas, semilla de demo.

### Fase 4 — Conversación y contratación
Chat en tiempo real con adjuntos y seguridad, bloqueo y denuncias, propuestas versionadas, reservas con máquina de estados y eventos, notificaciones dentro de la aplicación y por correo.

### Fase 5 — Pagos
Stripe Connect Express en modo test + simulador, alta de prestadores, pago, webhooks idempotentes, confirmación y transferencia, motor de cancelación, reembolsos, incidencias, contracargos, valoraciones ciegas. **E2E del flujo crítico completo en verde.**

### Fase 6 — Plataforma
PWA completa y push, panel de usuario completo, panel de administración (MVP → V1), moderación con exposición de motivos y reclamaciones, auditoría, centro de ayuda y tickets, tareas programadas, PRO y destacados (detrás de *flags*).

### Fase 7 — Preparación para producción
Revisión de seguridad (OWASP ASVS nivel 2 como guía), auditoría de accesibilidad, rendimiento y Lighthouse CI, cobertura de pruebas, revisión de i18n, `DEPLOYMENT.md` y lista de comprobación de lanzamiento, revisión de cumplimiento (lista de lo que necesita validación jurídica o fiscal).

---

## 33. Primera ejecución (empieza ahora)

1. Guarda este documento en `docs/PRODUCT_SPEC.md`.
2. Ejecuta la **Fase 0** y escribe el resumen.
3. Ejecuta la **Fase 1** completa.
4. Empieza la **Fase 2** y avanza hasta tener, funcionando con datos reales de Supabase local y la semilla de demo, una primera versión navegable de: portada, categorías, explorar (con al menos texto, categoría, tipo y municipio), detalle de anuncio, registro e inicio de sesión. (Esto adelanta parte de la Fase 3; está bien, pero sin atajos: la Definición de terminado aplica igual.)
5. Ejecuta lint, comprobación de tipos y pruebas; corrige lo que falle.
6. Entrega el informe de fase y actualiza `ROADMAP.md`.
7. Continúa con la siguiente tarea pendiente del roadmap.

---

## Anexo A — Lo que NO debes hacer

- Crear todo en un único archivo o en una única respuesta.
- Generar decenas de pantallas desconectadas o con datos *hardcodeados*.
- Poner porcentajes de comisión, precios o plazos en componentes.
- Usar `number` decimal para dinero.
- Confiar en el navegador para importes, estados de pago o permisos.
- Exponer `SUPABASE_SERVICE_ROLE_KEY` o cualquier secreto al cliente.
- Mostrar direcciones exactas, teléfonos o correos en páginas públicas.
- Presentar «identidad verificada» o «PRO» como acreditación profesional.
- Llamar «escrow» o «depósito» al pago protegido.
- Mostrar estadísticas inventadas o valoraciones sin reserva.
- Editar o borrar registros de auditoría o eventos.
- Redactar textos legales como si fueran definitivos.
- Mezclar castellano y catalán en una misma pantalla.
- Copiar diseño, textos o recursos de otras plataformas.
- Declarar terminado algo que no cumple la Definición de terminado.

## Anexo B — Plantilla del informe de fase

```
## Informe — Fase N: <nombre>

**Estado:** completada | parcialmente completada (motivo)

### Qué funciona ahora
- …

### Qué está simulado o pendiente
- … (y por qué)

### Comprobaciones
- lint: ✅/❌ · typecheck: ✅/❌ · unit: X/Y · pgTAP: X/Y · integración: X/Y · E2E: X/Y · cobertura dominio: N %

### Archivos principales creados o modificados
- ruta — propósito

### Decisiones tomadas (ADR)
- NNNN — título

### Riesgos y bloqueos
- …

### Siguiente paso
- …
```

## Anexo C — Prompts de continuación para sesiones nuevas

**Continuar el trabajo**
> Lee `docs/PRODUCT_SPEC.md`, `ROADMAP.md` y los ADR de `docs/adr/`. Ejecuta lint, typecheck y pruebas para conocer el estado real. Continúa con la siguiente tarea pendiente del roadmap respetando la Definición de terminado (sección 25.10). No rehagas lo que ya funciona. Termina con el informe de fase (Anexo B) y actualiza `ROADMAP.md`.

**Ejecutar una fase concreta**
> Lee `docs/PRODUCT_SPEC.md` (sobre todo las secciones relacionadas con la Fase N) y `ROADMAP.md`. Ejecuta la Fase N completa. Antes de programar, enumera las tareas de la fase y en qué orden las harás. Al terminar, entrega el informe de fase y actualiza `ROADMAP.md`.

**Corregir y estabilizar**
> Ejecuta lint, typecheck, pruebas unitarias, pgTAP, integración y E2E. Corrige todos los fallos empezando por los de seguridad y por el flujo crítico (sección 1.3). No añadas funcionalidades nuevas. Entrega un informe con lo corregido.

**Revisión de seguridad**
> Revisa el código contra `SECURITY.md`, la sección 25 de `docs/PRODUCT_SPEC.md` y OWASP ASVS nivel 2. Comprueba RLS de todas las tablas, uso de la clave de servicio, validación y autorización de cada Server Action y Route Handler, webhooks, subida de archivos, XSS en el chat y caché del service worker. Lista los hallazgos por gravedad, corrige los críticos y altos, y añade pruebas que los cubran.

**Auditoría de accesibilidad y móvil**
> Recorre con Playwright en viewport de 360 px y en escritorio todas las páginas públicas y el flujo crítico. Ejecuta axe, comprueba navegación por teclado, foco, contraste, tamaños táctiles, lectores de pantalla y `prefers-reduced-motion`. Corrige los problemas y añade las pruebas a la suite E2E.
