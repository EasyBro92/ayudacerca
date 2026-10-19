# Supabase en la nube (plan gratuito)

Decisión del propietario (19/10/2026): de momento se usa el **plan gratuito** de Supabase. Para producción en las tiendas se recomienda Pro (no se pausa y tiene copias de seguridad).

## Qué tener en cuenta con el plan gratuito
- **Se pausa tras 7 días sin actividad.** Los datos se conservan; se reactiva desde el panel («Restore project») y tarda unos minutos. Mientras está pausado, la web y la app no funcionan.
- **Límites:** 500 MB de base de datos, 1 GB de archivos (fotos), 50.000 usuarios activos al mes, 2 proyectos.
- **Correos de registro:** el servidor de correo incluido solo envía a los miembros de tu equipo de Supabase y con muy pocos envíos por hora. Para que otras personas reciban el correo de confirmación hace falta un SMTP propio (por ejemplo Resend, que tiene plan gratuito). Ver paso 5.
- Sin copias de seguridad automáticas: no guardes aquí nada que no puedas perder.

## Pasos

### 1. Crear el proyecto (lo haces tú)
1. Entra en supabase.com, crea una cuenta y pulsa **New project**.
2. Nombre: `ayudacerca`. Región: **Central EU (Frankfurt)** o **West EU (Paris)** (datos dentro de la UE).
3. Pon una contraseña de base de datos larga y **guárdala** en tu gestor de contraseñas. No la pegues en ningún chat.

### 2. Guardar la conexión como secreto en GitHub
1. En Supabase: botón **Connect** (arriba) → **Session pooler** → copia la URI. Se parece a
   `postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-0-<región>.pooler.supabase.com:5432/postgres`.
2. Sustituye `[YOUR-PASSWORD]` por tu contraseña. Si tiene símbolos como `@`, `#`, `/` o `%`, cámbiala por una sin símbolos o codifícalos (`@` → `%40`).
3. En GitHub: repositorio → **Settings → Secrets and variables → Actions → New repository secret**. Nombre: `SUPABASE_DB_URL`. Valor: la URI completa.

### 3. Subir la base de datos
GitHub → pestaña **Actions** → **Supabase: subir base de datos** → **Run workflow**.
Crea todas las tablas, reglas de seguridad (RLS), funciones, la tarea de bajas (`pg_cron`), los buckets de fotos y carga el catálogo, municipios y textos legales. **No** carga los usuarios ni anuncios de demo. Puedes lanzarlo otra vez cuando haya migraciones nuevas.

### 4. Ajustes de acceso (Authentication en el panel)
- **URL Configuration → Site URL:** la dirección de la web (de momento `http://localhost:3000`).
- **Redirect URLs:** añade `http://localhost:3000/**`, `ayudacerca://**` y `exp://**`; más adelante, `https://<tu-dominio>/**`.
- **Sign In / Providers → Email:** confirmación de correo activada; longitud mínima de contraseña **10**.

### 5. Correo (solo si van a registrarse otras personas)
Crea una cuenta gratuita en Resend, verifica un dominio y en Supabase → **Authentication → Emails → SMTP Settings** pon sus datos.

### 6. Conectar la web y la app
En Supabase → **Project Settings → API** copia la *Project URL* y la clave **anon** (pública). La clave **service_role** es secreta: solo va en el servidor de la web, nunca en la app ni en GitHub.
- Web (`apps/web/.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- App (`apps/mobile/.env`): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### 7. Primer administrador
No hace falta todavía: el panel de administración llega en la fase 6.
