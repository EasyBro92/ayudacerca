# ADR 0005 — Cache Components de Next.js desactivado (por ahora)

- Estado: aceptada (revisar en cada actualización menor de Next.js)
- Fecha: 2026-10-19

## Contexto
Next.js 16 ofrece `cacheComponents` (prerenderizado parcial y `use cache`). Con él activado, leer cookies fuera de un `<Suspense>` es un error de compilación, y tanto la sesión de Supabase (`@supabase/ssr`) como la detección de idioma de `next-intl` leen cookies/cabeceras en casi todas las páginas.

## Decisión
`cacheComponents: false`. Los datos públicos caros (catálogo, municipios, indicadores) se cachean con `unstable_cache` y etiquetas (`catalog`), y se invalidan con `revalidateTag` al publicar.

## Consecuencias
- Las páginas se renderizan dinámicamente (necesario de todos modos para la CSP con *nonce*).
- Revisar cuando `next-intl` y `@supabase/ssr` documenten soporte oficial para Cache Components.
