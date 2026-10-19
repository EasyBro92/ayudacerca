# ADR 0006 — Componentes de interfaz propios al estilo shadcn/ui

- Estado: aceptada
- Fecha: 2026-10-19

## Contexto
La especificación pide shadcn/ui. El registro de shadcn no era accesible desde el entorno de desarrollo, y shadcn no es una dependencia sino código que se copia al proyecto.

## Decisión
Los componentes base (`apps/web/src/components/ui`) se escriben siguiendo el mismo patrón (Radix UI + `class-variance-authority` + `tailwind-merge`), con los tokens de `packages/core/src/brand.ts`. En la app móvil, componentes nativos equivalentes en `apps/mobile/src/components/ui.tsx`.

## Consecuencias
- Se pueden añadir componentes oficiales de shadcn más adelante con `pnpm dlx shadcn add …` sin conflicto.
- La accesibilidad la aportan Radix (diálogos, pestañas) y pruebas automáticas con axe.
