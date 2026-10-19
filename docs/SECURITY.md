# Seguridad

## Modelo de amenazas (resumen STRIDE)

| Amenaza | Ejemplo | Control |
|---|---|---|
| Suplantación | Robo de sesión, fuerza bruta | Supabase Auth, cookies `HttpOnly`+`Secure`+`SameSite=Lax`, verificación de JWT en servidor (`getClaims`), límite de intentos fallidos por IP y por cuenta, contraseñas ≥ 10 caracteres y comprobación de filtradas (Supabase), MFA obligatorio para personal (fase 6) |
| Manipulación | Publicar sin moderar, tocar contadores o insignias | RLS + permisos por columna + trigger de transiciones (probado con pgTAP); validación Zod en servidor; el servidor decide estados |
| Repudio | «Yo no hice eso» | `audit_logs` inmutable con actor, entidad, antes/después, correlación |
| Divulgación | Dirección, teléfono, correo, coordenadas exactas | Perfil público/privado en tablas distintas; ubicación aproximada (~1 km); los correos y la dirección nunca se envían al navegador (test E2E); EXIF/GPS eliminado de fotos |
| Denegación de servicio | Abuso de formularios o subidas | Límites de frecuencia, tamaño máximo de cuerpo, límite de píxeles de imagen, máximo de borradores |
| Elevación de privilegios | Darse rol admin | `user_roles` solo escribible por el servidor (pgTAP); `has_staff_role` como `SECURITY DEFINER` con `search_path` vacío |

## Controles implementados

- **Cabeceras**: CSP con *nonce* por petición y `strict-dynamic`, `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP (`apps/web/src/proxy.ts`, `next.config.ts`).
- **Redirecciones abiertas**: `safeRedirectPath` (probado).
- **XSS**: React escapa todo; nunca se renderiza HTML de usuarios; JSON-LD escapado; Markdown legal sin HTML.
- **Subidas**: tipo real por contenido (`sharp`), formatos permitidos, 10 MB, 40 Mpx, recodificación (sin metadatos), rutas generadas por el servidor; un archivo no válido con extensión `.png` se rechaza (probado).
- **API móvil**: token Bearer verificado; token mal formado → 401; CORS solo para orígenes permitidos (`API_ALLOWED_ORIGINS`).
- **Secretos**: ninguno en el repositorio; `.env*` ignorados; la clave de servicio solo en `server-only`.
- **Anti-enumeración**: misma respuesta en registro, acceso y recuperación exista o no la cuenta.
- **Datos de contacto en anuncios**: detección de teléfonos (también escritos con letras), correos, enlaces, IBAN, redes y pagos externos.

## Pendiente (ver ROADMAP)
- Limitador distribuido (Upstash) en producción con varias instancias.
- Captcha (Turnstile) en registro/recuperación.
- Sentry y alertas.
- Escaneo antivirus de adjuntos del chat (fase 4).
- Revisión OWASP ASVS nivel 2 (fase 7).

## Responder a un incidente
1. Contener (revocar claves, desactivar funciones con *feature flags*).
2. Evaluar datos afectados y registrar en `security_incidents` (fase 6).
3. Notificar a la AEPD en 72 h si procede (RGPD art. 33) y a las personas afectadas si hay alto riesgo.
4. Corregir, añadir prueba que lo cubra y documentar.

## Informar de una vulnerabilidad
Escribe a la dirección de seguridad de `brand.ts` (pendiente de definir). No publiques el fallo hasta que esté corregido.
