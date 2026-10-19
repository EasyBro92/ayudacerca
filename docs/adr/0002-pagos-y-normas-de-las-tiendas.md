# ADR 0002 — Pagos dentro de las apps y normas de Apple/Google

- Estado: aceptada (revisar antes de cada envío a las tiendas: las normas cambian)
- Fecha: 2026-10-19

## Contexto

Las tiendas obligan a usar su sistema de compras (In-App Purchase de Apple, Google Play Billing) para **bienes y servicios digitales** consumidos dentro de la app. Los **servicios físicos prestados fuera de la app** entre personas (recados, limpieza, clases presenciales, mudanzas…) pueden cobrarse con otros procesadores de pago (directriz 3.1.3(e) / 3.1.5 de Apple; política de pagos de Google Play para bienes y servicios físicos).

## Decisión

1. **Pago de servicios entre usuarios** (la reserva): Stripe, también dentro de la app (PaymentSheet de `@stripe/stripe-react-native` o Checkout en navegador del sistema). Es un servicio del mundo real → permitido.
2. **Clases telemáticas en directo uno a uno**: Apple las admite fuera de IAP como servicio en tiempo real entre dos personas (3.1.3(d)). Documentar y revisar.
3. **Suscripción PRO y anuncios destacados** (bienes digitales):
   - Fase inicial: **solo se compran en la web**. En la app se muestra el estado (PRO activo, destacado activo) pero no se venden ni se enlaza a la compra donde esté prohibido.
   - Fase posterior: valorar IAP + Google Play Billing (por ejemplo, con RevenueCat) y sincronizar con la tabla `subscriptions`. Las normas sobre enlaces a pagos externos varían por región (UE con la DMA, EE. UU.); comprobarlas en el momento.
4. Nada de esto se oculta a los revisores: las notas de revisión explican el modelo.

## Consecuencias

- `subscriptions.provider` admite `stripe | apple | google`.
- Las *feature flags* `pro` y `promotions` tienen variante por plataforma (`web`, `ios`, `android`).
