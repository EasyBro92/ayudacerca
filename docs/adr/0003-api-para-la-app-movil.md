# ADR 0003 — Cómo habla la app móvil con el servidor

- Estado: aceptada
- Fecha: 2026-10-19

## Decisión

- **Lecturas públicas y datos propios** (anuncios publicados, categorías, perfil propio, favoritos, mensajes de mis conversaciones): la app usa directamente Supabase con la clave anónima y la sesión del usuario. La seguridad la garantiza RLS.
- **Operaciones sensibles** (crear o publicar anuncios con moderación, aceptar propuestas, pagos, cancelaciones, reembolsos, subir imágenes con limpieza de EXIF, moderación, borrar cuenta): la app llama a `https://<web>/api/v1/...` con `Authorization: Bearer <access_token de Supabase>`. El servidor valida el token con Supabase, valida la entrada con los mismos esquemas Zod de `packages/core` y ejecuta el servicio correspondiente.
- Las Server Actions de la web llaman a **los mismos servicios** (`apps/web/src/server/services`), así que no hay lógica duplicada.
- Las respuestas siguen el formato `{ ok: true, data } | { ok: false, error: { code, message } }`, tipado en `packages/core`.
- Versionado: el prefijo `/api/v1` permite que versiones antiguas de la app sigan funcionando mientras la gente actualiza. Hay una tabla `platform_settings.min_app_version` para forzar la actualización si hace falta.
