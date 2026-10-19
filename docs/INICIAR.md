# Cómo iniciar la web y la app en tu ordenador

Necesitas un ordenador (Windows, Mac o Linux) y, para la app, tu móvil en **la misma red wifi**.

## 1. Instala (una sola vez)
1. **Node.js 22** — https://nodejs.org (versión LTS).
2. **pnpm** — en una terminal: `corepack enable`
3. **Docker Desktop** — https://www.docker.com/products/docker-desktop (ábrelo y déjalo en marcha).
4. **Git** — https://git-scm.com
5. En el móvil: **Expo Go** (App Store o Google Play).

## 2. Descarga el proyecto
```bash
git clone https://github.com/<tu-usuario>/ayudacerca.git     # o: git clone ayudacerca-backup.bundle ayudacerca
cd ayudacerca
pnpm install
```

## 3. Arranca la base de datos (la primera vez tarda unos minutos)
```bash
pnpm db:start
pnpm db:reset          # crea las tablas y carga los datos de prueba
pnpm exec supabase status
```
Apunta `ANON_KEY` y `SERVICE_ROLE_KEY` del último comando.

## 4. Arranca la web
Crea el archivo `apps/web/.env.local` con:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEMO_MODE=1
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```
Y ejecuta:
```bash
pnpm dev
```
Abre **http://localhost:3000**. Entra con `cliente@example.com` / `AyudaDemo2026!`.
Los correos (confirmar cuenta, recuperar contraseña) llegan a **http://127.0.0.1:54324**.

## 5. Arranca la app en tu móvil
1. Averigua la IP de tu ordenador en la red (p. ej. `192.168.1.40`):
   - Windows: `ipconfig` → «Dirección IPv4»
   - Mac: Ajustes del sistema → Wifi → Detalles → Dirección IP
2. Crea `apps/mobile/.env` (cambia la IP por la tuya):
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://192.168.1.40:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
   EXPO_PUBLIC_WEB_URL=http://192.168.1.40:3000
   ```
3. Con la web en marcha (paso 4), en **otra** terminal:
   ```bash
   pnpm dev:mobile
   ```
4. Escanea el código QR con la cámara (iPhone) o desde Expo Go (Android).

## Si algo falla
| Problema | Solución |
|---|---|
| La app no carga datos | El móvil y el ordenador deben estar en la misma wifi; revisa la IP en `apps/mobile/.env`; el cortafuegos debe permitir los puertos 3000, 8081 y 54321 |
| «Docker is not running» | Abre Docker Desktop y espera a que arranque |
| El QR no conecta | `pnpm dev:mobile -- --tunnel` |
| Quieres empezar de cero los datos | `pnpm db:reset` |

## Opción B: con tu Supabase en la nube (sin Docker)
Si ya subiste la base de datos (`docs/SUPABASE_NUBE.md`), sáltate el paso 3 y Docker.
Las claves están en Supabase → **Project Settings → API Keys**: la *Publishable key* (`sb_publishable_…`, o la *anon* en «Legacy API keys») y la *Secret key* (`sb_secret_…`, o la *service_role*). La URL es `https://<ref>.supabase.co`.

`apps/web/.env.local`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEMO_MODE=0
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Publishable key>
SUPABASE_SERVICE_ROLE_KEY=<Secret key>
```
`apps/mobile/.env` (la IP es la de tu ordenador, para que el móvil llegue a la web al subir fotos):
```
EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<Publishable key>
EXPO_PUBLIC_WEB_URL=http://192.168.1.40:3000
```
No hay usuarios ni anuncios de demo: regístrate con tu correo (te llega de verdad) y publica el primer anuncio.
