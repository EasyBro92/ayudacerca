# ADR 0007 — Borradores del asistente en una tabla propia

- Estado: aceptada
- Fecha: 2026-10-19

## Contexto
`public.listings` tiene restricciones fuertes (longitud de título y descripción, coherencia de precio). Un borrador guardado automáticamente a mitad de rellenar no las cumple.

## Decisión
`public.listing_drafts` guarda el borrador como `jsonb` (con RLS: solo la persona autora). Al enviarlo, el servidor valida todo con los esquemas Zod de `packages/core`, aplica la moderación automática y crea la fila en `listings`. El estado `draft` de `listings` se reserva para anuncios ya creados que vuelven a edición (p. ej., tras un rechazo).

## Consecuencias
- El guardado automático nunca falla por validación.
- Máximo 20 borradores por persona (trigger), contra abusos.
