# AyudaCerca

Marketplace local de ayuda entre personas: recados, gestiones, tecnología, hogar, mascotas, clases y más.
Web (Next.js) + app nativa para **Android e iOS** (Expo) + Supabase (PostgreSQL, Auth, Storage, Realtime).

> El nombre es provisional y se cambia en un solo sitio: `packages/core/src/brand.ts` (y `apps/mobile/app.config.ts`, comprobado por un test).

## Estado

Primera versión funcional (fases 0–3 de `docs/ROADMAP.md`): portada, categorías, búsqueda con filtros, detalle de anuncio, perfiles públicos, registro/acceso, favoritos, denuncias, **asistente de publicación** (web y app), eliminación de cuenta, textos en castellano, catalán e inglés. Chat, propuestas, reservas y pagos llegan en las fases 4–5.

## Estructura

```
apps/web        Next.js 16 (App Router) — web pública, cuenta, API /api/v1 para la app
apps/mobile     Expo SDK 58 (Expo Router) — app Android/iOS
packages/core   TypeScript puro compartido: dinero, comisiones, estados, validación (Zod), búsqueda, marca, textos (es/ca/en)
supabase/       migraciones SQL, políticas RLS, pruebas pgTAP, semillas
docs/           especificación, decisiones (ADR), arquitectura, seguridad, tiendas, legal (borradores)
scripts/        generación de semillas e iconos, alta de administración, capturas
```

## Requisitos

- Node.js ≥ 22.12 y pnpm 10 (`corepack enable`)
- Docker (para Supabase local)
- Para probar la app en tu móvil: la app gratuita **Expo Go** (todos los módulos nativos que usa están incluidos). Guía paso a paso: `docs/INICIAR.md`

## Puesta en marcha (local)

```bash
pnpm install
pnpm db:start                 # Supabase local (Postgres, Auth, Storage, Realtime, Mailpit)
pnpm db:reset                 # aplica migraciones + semillas (catálogo + datos de demo ficticios)
cp .env.example apps/web/.env.local     # y rellena las claves que muestra `pnpm exec supabase status`
pnpm dev                      # web en http://localhost:3000
```

Correos de prueba (confirmación de cuenta, recuperar contraseña): **Mailpit** en http://127.0.0.1:54324.

### Cuentas de demostración (solo local)

Contraseña de todas: `AyudaDemo2026!`

| Correo | Papel |
|---|---|
| cliente@example.com | Persona que pide ayuda (tiene favoritos) |
| prestador@example.com | Ofrece servicios, identidad verificada |
| moderador@example.com | Moderación |
| admin@example.com | Administración |

Los 30 perfiles y 50 anuncios de demo son **ficticios** y la semilla se niega a cargarse en producción.

### App móvil

```bash
cp apps/mobile/.env.example apps/mobile/.env   # en un móvil físico usa la IP de tu ordenador, no 127.0.0.1
pnpm dev:mobile                                # muestra un QR: escanéalo con Expo Go
```

## Comprobaciones

```bash
pnpm typecheck        # TypeScript estricto en los 3 paquetes
pnpm lint
pnpm test             # 189 pruebas unitarias del núcleo (100 % de líneas)
pnpm db:test          # 41 pruebas pgTAP de seguridad de la base de datos (RLS, inmutabilidad, bajas)
pnpm test:e2e         # 40 pruebas Playwright de la web (móvil + escritorio, con auditoría axe)
pnpm test:e2e:mobile  # 5 pruebas de la app sobre su exportación web
pnpm --filter @ayudacerca/mobile export:check   # compila los paquetes de Android e iOS
```

## Variables de entorno

Ver `.env.example` (todas documentadas, ninguna con valor real). Sin claves de Stripe/Resend/Web Push la app funciona en modo demo.

## Primer administrador

1. Regístrate normalmente y confirma el correo.
2. `DATABASE_URL=postgres://… pnpm admin:create tu@correo.es`
3. Activa MFA en esa cuenta (obligatorio para el panel, fase 6).

## Despliegue

Web en Vercel + Supabase gestionado; apps con EAS Build/Submit. Paso a paso en `docs/DEPLOYMENT.md` y `docs/MOBILE_STORES.md`.

## Documentación

| Documento | Contenido |
|---|---|
| `docs/PRODUCT_SPEC.md` | Especificación completa (fuente de verdad) |
| `docs/ROADMAP.md` | Fases, estado y pendientes |
| `docs/ARCHITECTURE.md` | Capas, flujos, decisiones |
| `docs/DATABASE.md` | Tablas, RLS, funciones |
| `docs/SECURITY.md` | Amenazas y controles |
| `docs/MOBILE_STORES.md` | Cómo publicar en Google Play y App Store |
| `docs/PAYMENT_FLOW.md` | Diseño de pagos (fase 5) |
| `docs/MODERATION.md` | Moderación y obligaciones de la DSA |
| `docs/DESIGN_SYSTEM.md` | Tokens, componentes, accesibilidad |
| `docs/DEPLOYMENT.md` | Producción |
| `docs/legal/` | Borradores legales — **pendientes de revisión jurídica** |
| `docs/adr/` | Decisiones de arquitectura |
