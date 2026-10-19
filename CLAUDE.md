# Guía para agentes de IA en este repositorio

> **Decisiones del propietario:** el backend es **Supabase** y debe seguir siéndolo (no usar Firebase ni otro BaaS). Los **pagos (fase 5) están en pausa**: no implementarlos, pero no borrar su diseño, `fees.ts`, el ADR 0002 ni el flag `payments`.

- Fuente de verdad: `docs/PRODUCT_SPEC.md`. Estado y siguiente tarea: `docs/ROADMAP.md`. Decisiones: `docs/adr/`.
- Monorepo pnpm: `apps/web` (Next.js 16 — lee `apps/web/AGENTS.md` y `node_modules/next/dist/docs/` antes de usar APIs de Next), `apps/mobile` (Expo SDK 58 — lee `apps/mobile/AGENTS.md`), `packages/core` (TypeScript puro), `supabase/`.
- Supabase local con Docker: `pnpm db:start` (usa imágenes de Docker Hub). Datos de demo: `pnpm db:reset`.
- Antes de dar algo por terminado: `pnpm check` y las E2E afectadas (`pnpm test:e2e`, `pnpm test:e2e:mobile`).
- Textos de interfaz solo en `packages/core/src/i18n/messages/*.json` (es, ca, en). Dinero en céntimos. RLS + pgTAP en cada tabla nueva.
- No uses `pkill -f` con patrones que aparezcan en tu propia orden (mata el shell); para reiniciar la web, mata el proceso del puerto 3000 con `lsof -t -iTCP:3000 -sTCP:LISTEN`.
