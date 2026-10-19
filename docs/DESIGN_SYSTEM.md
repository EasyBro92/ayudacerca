# Sistema de diseño

## Principios
Cercanía, confianza, claridad. Pensado también para personas mayores o con poca experiencia digital: texto base de 17 px, tipografía **Atkinson Hyperlegible Next** (diseñada para baja visión, licencia OFL), botones de al menos 44–48 px, una acción principal por pantalla, frases cortas sin jerga.

## Tokens (`packages/core/src/brand.ts`)
| Token | Valor | Uso | Contraste |
|---|---|---|---|
| background | #FBF7F1 | Fondo cálido | — |
| surface | #FFFFFF | Tarjetas | — |
| ink / inkMuted | #1F1B16 / #5E564D | Texto | 16:1 / 6,7:1 |
| primary | #1F6F6B | Navegación, enlaces, confianza | 5,9:1 (blanco) |
| accent | #C4472A | Acción principal (Publicar, Buscar) | 4,9:1 (blanco) |
| success / warning / danger | #276B43 / #8A5A00 / #B3261E | Estados | ≥ 4,5:1 sobre su fondo suave |

`packages/core/src/color/contrast.test.ts` falla si cualquier par de colores (incluidos los 15 de categoría sobre su tinte) baja de 4,5:1.

En la web, los tokens son variables CSS en `apps/web/src/app/globals.css` (`@theme` de Tailwind 4); en la app, `apps/mobile/src/lib/theme.ts` los importa directamente.

## Componentes
- Web (`apps/web/src/components/ui`): Button, Input, Textarea, NativeSelect, Field (etiqueta + ayuda + error enlazados por ARIA), Card, Badge, Alert, Sheet (diálogo/cajón con trampa de foco), Skeleton.
- App (`apps/mobile/src/components/ui.tsx`): AppText (respeta el tamaño de letra del sistema, hasta ×2), Button, Card, Badge, TextField, Notice, Chip, CenteredState, Loading.

## Accesibilidad
- Foco visible de 3 px; enlace «Saltar al contenido»; jerarquía de encabezados; `aria-live` en resultados y errores; nunca se transmite información solo con color.
- `prefers-reduced-motion` respetado.
- Las pruebas E2E pasan **axe** (WCAG 2.2 AA) en portada, explorar, detalle y registro sin violaciones graves.
- En la app: roles y etiquetas de accesibilidad, áreas táctiles de 48 pt, tamaño de letra del sistema.
