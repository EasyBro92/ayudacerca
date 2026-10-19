# Cómo contribuir

1. Lee `docs/PRODUCT_SPEC.md` (fuente de verdad) y `docs/ROADMAP.md`.
2. Rama desde `main`; commits pequeños con [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `docs:`, `test:`…).
3. Antes de abrir un PR: `pnpm check` (tipos, lint, unitarias, pgTAP) y, si tocas pantallas, `pnpm test:e2e`.

## Reglas
- La lógica de negocio va en `packages/core` (TypeScript puro, con pruebas). Dinero siempre en céntimos.
- Ningún texto visible en componentes: todo en `packages/core/src/i18n/messages/{es,ca,en}.json` (el test de paridad falla si falta una traducción).
- Toda tabla nueva con RLS y su prueba pgTAP. Nunca uses la clave de servicio en el navegador ni en la app.
- Operaciones sensibles solo en `apps/web/src/server/services` (servidas a la web por Server Actions y a la app por `/api/v1`).
- Accesibilidad: etiquetas, foco visible, áreas táctiles ≥ 44 px, sin depender del color.
- Decisiones relevantes → nuevo ADR en `docs/adr/`.

## Cómo…
- **Añadir una categoría**: `supabase/seed/data/catalog.mjs` → `pnpm db:seeds` (en producción, desde el panel de administración en la fase 6).
- **Añadir un idioma**: nuevo JSON en `packages/core/src/i18n/messages`, añadirlo a `LOCALES` y a `apps/mobile/app.config.ts` (`locales`).
- **Cambiar la marca**: `packages/core/src/brand.ts`, `apps/mobile/app.config.ts`, `apps/web/src/app/globals.css` (los tests comprueban que coinciden) y `pnpm icons`.
- **Regenerar tipos de la base de datos**: `pnpm db:types`.
