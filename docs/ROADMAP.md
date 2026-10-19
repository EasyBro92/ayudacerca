# Hoja de ruta

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente · ⏸️ en pausa. Especificación completa en `docs/PRODUCT_SPEC.md`.

## Informe — Fases 0 a 3 (primera ejecución)

**Estado:** fases 0–2 completadas; fase 3 casi completa; la app móvil para Android/iOS (requisito añadido) ya tiene las mismas funciones que la web.

### Qué funciona ahora
- Monorepo con web (Next.js 16), app nativa (Expo SDK 58) y núcleo compartido.
- Base de datos con RLS en todas las tablas, búsqueda con distancia aproximada, semillas (15 categorías en 3 idiomas, 46 municipios, 30 personas y 50 anuncios ficticios).
- Web: portada completa, explorar con 15 filtros en la URL, categorías, detalle con galería y consejos de seguridad, perfiles públicos, registro con confirmación por correo, acceso, recuperación de contraseña, favoritos, denuncias, asistente de publicación de 9 pasos, cuenta con eliminación, páginas informativas, documentos legales (borradores), banner de cookies conforme a la AEPD, SEO (metadatos, hreflang, sitemap, robots, JSON-LD), PWA básica (manifiesto e iconos), CSP con nonce.
- App: inicio, explorar con filtros y carga infinita, detalle, favoritos, denunciar, compartir, entrar/registro/recuperar, publicar (asistente nativo con fotos de galería o cámara), cuenta (favoritos, idioma, legal, cerrar sesión, **eliminar cuenta**). Configuración lista para EAS (iconos, splash, permisos traducidos, manifiesto de privacidad de iOS).

### Qué está simulado o pendiente
- Chat, propuestas, reservas, pagos, valoraciones, notificaciones: fases 4–6 (los botones «Contactar» y «Pedir propuesta» aparecen deshabilitados con explicación).
- Los indicadores de la portada se ocultan hasta superar umbrales reales.
- Textos legales: borradores marcados, pendientes de revisión jurídica; solo en castellano.

### Comprobaciones
- Tipos: ✅ (3 paquetes, TypeScript estricto) · Lint: ✅
- Unitarias: ✅ 190 (núcleo, 100 % de líneas)
- Base de datos (pgTAP): ✅ 41
- E2E web (Playwright, móvil + escritorio, axe), contra la build de producción: ✅ 40
- E2E app (exportación web): ✅ 5
- Compilación Android e iOS (Hermes): ✅

## Fase 0 — Auditoría ✅
Repositorio vacío: proyecto nuevo.

## Fase 1 — Diseño técnico ✅
- ✅ Especificación, ADR 0001–0008, arquitectura, base de datos, seguridad, pagos (borrador), tiendas, diseño, moderación.

## Fase 2 — Cimientos ✅ / 🟡
- ✅ Monorepo, TypeScript estricto, ESLint, CI (GitHub Actions), variables validadas con Zod, marca centralizada
- ✅ i18n es/ca/en con test de paridad de claves, variables y etiquetas
- ✅ Supabase local, migraciones, RLS, pgTAP
- ✅ Auth completo (registro, confirmación, acceso, recuperación, restablecer, cierre, anti-enumeración, límites)
- ✅ Sistema de diseño accesible (tokens con test de contraste) y layout (cabecera, menú móvil, barra inferior, pie)
- ✅ Páginas informativas y legales (borrador), banner de cookies
- 🟡 Captcha Turnstile (configurado en el plan, falta integrar)
- 🟡 Limitador distribuido (en memoria hoy; Upstash pendiente)
- ⬜ Página `/dev/ui` con todos los componentes

## Fase 3 — Anuncios y descubrimiento 🟡
- ✅ Perfiles público/privado, categorías con campos personalizados
- ✅ Asistente de publicación (web y app): guardado automático, validación por paso, vista previa, fotos sin EXIF, detección de contacto, moderación automática, revisión manual en categorías sensibles
- ✅ Portada, explorar, detalle, perfil público, favoritos, denuncias, SEO
- ⬜ Editar, pausar, renovar y retirar anuncios propios («Mis anuncios»)
- ⬜ Edición del perfil y avatar
- ⬜ Vista de lista/cuadrícula y mapa (flag `map_view`)
- ⬜ Catálogo completo de municipios del INE (hoy 46 ciudades)
- ⬜ Traducción catalana e inglesa de los documentos legales

## Fase 4 — Conversación y contratación ⬜
Chat en tiempo real (Supabase Realtime, canales privados), adjuntos, bloqueo y denuncia de conversaciones, propuestas versionadas, reservas con máquina de estados y eventos, notificaciones en la app y por correo.
Mientras los pagos estén en pausa, las reservas funcionan **sin cobro dentro de la app** (las partes acuerdan el pago entre ellas) y se diseñan para que el pago se pueda enganchar después sin migraciones destructivas.

## Fase 5 — Pagos ⏸️ En pausa
> **Decisión del propietario (19/10/2026):** de momento no se usan pagos. No se implementa esta fase, pero **no se borra nada**: se conservan el diseño (`docs/PAYMENT_FLOW.md`), el cálculo de comisiones probado (`packages/core/src/money/fees.ts`), el ADR 0002 y el flag `payments` (desactivado en las semillas). Para reactivarla: activar el flag y retomar este plan.

Stripe Connect Express (modo test) + simulador, webhooks idempotentes, motor de cancelación, reembolsos, incidencias, contracargos, valoraciones ciegas. Sembrar reservas y valoraciones reales en la demo. Anonimizar en vez de borrar los registros con obligación legal de conservación.

## Fase 6 — Plataforma ⬜
Notificaciones push (Expo Push en la app, Web Push en la web), PWA offline, panel de administración con MFA, moderación con exposición de motivos y reclamaciones, centro de ayuda y tickets, tareas programadas, PRO y destacados (web; en apps tras integrar compras integradas — ADR 0002).

## Fase 7 — Producción ⬜
Entorno de pruebas en marcha (19/10/2026): web en **Vercel (Hobby)** conectada a Supabase en la nube, sin datos de demo. De momento Supabase en el **plan gratuito** (decisión del propietario; ver `docs/SUPABASE_NUBE.md`). Antes de publicar en las tiendas, valorar Pro.
OWASP ASVS nivel 2, auditoría de accesibilidad manual (VoiceOver/TalkBack), rendimiento (Lighthouse CI), Sentry, revisión de cumplimiento (RGPD, DSA, DAC7, LSSI, consumo), fichas de las tiendas.

## Deuda técnica conocida
- `apps/mobile` usa `expo-router` NativeTabs; en la exportación web la barra aparece arriba (solo afecta a las pruebas web).
- Las fotos de anuncios borrados se eliminan cuando exista la tarea de archivos huérfanos (fase 6).
