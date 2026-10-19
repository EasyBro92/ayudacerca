# Despliegue a producción

## 1. Supabase
1. Crea un proyecto en la región UE (p. ej. Fráncfort o París).
2. `supabase link --project-ref <ref>` y `supabase db push` (aplica las migraciones). **No** cargues `seed/02_demo.sql`; sí `seed/01_required.sql` (catálogo, municipios, ajustes, borradores legales): `psql "$DATABASE_URL" -f supabase/seed/01_required.sql`.
3. Ejecuta `alter database postgres set app.environment = 'production';` (bloquea la semilla de demo).
4. Auth → URL del sitio y redirecciones: `https://<dominio>/auth/callback`, `ayudacerca://**`. Confirmación de correo activada, contraseña mínima 10, protección de contraseñas filtradas, captcha (Turnstile) y límites de frecuencia.
5. SMTP propio (Resend) para los correos de Auth, con plantillas en los tres idiomas.
6. Comprueba que `pg_cron` está activo (tarea de bajas).

## 2. Web (Vercel)
1. Importa el repositorio; *Root Directory* `apps/web`; *Install* `pnpm install`; *Build* `pnpm build`.
2. Variables (ver `.env.example`): `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV=production`, `NEXT_PUBLIC_DEMO_MODE=0`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo *Production*/*Preview*, nunca expuesta), `CRON_SECRET`.
3. Dominio propio con HTTPS. El `robots.txt` solo permite indexar cuando `NEXT_PUBLIC_APP_ENV=production`.
4. Comprueba `https://<dominio>/api/health`.

## 3. Apps
Ver `docs/MOBILE_STORES.md`.

## 4. Antes de abrir al público (lista mínima)
- [ ] Textos legales revisados por un profesional y datos de la empresa en `brand.ts`
- [ ] Registro de actividades de tratamiento y contratos de encargado (Supabase, Vercel, Expo, Resend…)
- [ ] Captcha y limitador distribuido activos
- [ ] Sentry configurado
- [ ] Primer administrador creado con MFA
- [ ] Copias de seguridad (PITR) activadas en Supabase
