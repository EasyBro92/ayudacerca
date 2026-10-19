# ADR 0009 — Enfoque en ayuda telemática e informática

- Estado: aceptada
- Fecha: 2026-10-19

## Contexto
El propietario quiere que AyudaCerca se centre, de momento, en ayudas que se pueden hacer a distancia y en la parte informática. Los servicios presenciales (acompañar al médico, mascotas, limpieza, mudanzas…) quedan para más adelante.

## Decisión
- Las categorías presenciales se **ocultan** (`categories.is_active = false`), no se borran: se reactivan cambiando `active` en `supabase/seed/data/catalog.mjs` y volviendo a cargar la semilla.
- Categorías visibles: Informática y soporte técnico, Webs y programación, Diseño y contenido digital, Ofimática y datos, Clases online y formación, Trámites online, Traducción y redacción y Otros servicios.
- La RLS de `categories` ya oculta las inactivas, así que sus anuncios desaparecen de búsquedas, portada y detalle sin más cambios.
- La semilla del catálogo pasa a ser *upsert*: el catálogo vive en el código.
- Textos de la portada y de «Cómo funciona» reescritos para lo telemático; desaparecen las menciones a pagos protegidos mientras los pagos estén en pausa (ver ROADMAP).

## Consecuencias
- Los anuncios existentes en categorías ocultas dejan de verse (no se borran).
- La modalidad «Online» pasa a ser la más habitual; la ubicación sigue pidiéndose para quien quiera ayuda presencial en informática.
