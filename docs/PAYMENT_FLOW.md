# Flujo de pagos (diseño — se implementa en la fase 5)

> ⏸️ **En pausa (19/10/2026).** El propietario ha decidido no usar pagos de momento. Este diseño y `packages/core/src/money/fees.ts` se conservan tal cual; el flag `payments` está desactivado. No borrar.

> Borrador técnico. El modelo de fondos debe validarse con Stripe y con asesoría jurídica (PSD2) antes de activarlo.

## Modelo propuesto
- **Stripe Connect con cuentas Express** para quienes prestan servicios (Stripe hace la verificación de identidad).
- **Cargos separados y transferencias**: la persona cliente paga a la plataforma; cuando confirma el servicio (o pasan 72 h sin incidencia) se crea un `Transfer` a la cuenta conectada con `transfer_group = booking_id`. La plataforma conserva su comisión.
- **No** se llamará «depósito», «escrow» ni «custodia»: es un «pago protegido» con las condiciones explicadas.
- Sin captura diferida para servicios futuros (la autorización caduca en pocos días).

## Comisiones
Ya implementado y probado en `packages/core/src/money/fees.ts`:
- Enteros en céntimos, redondeo «mitad hacia arriba» por línea.
- Comisión al cliente y al prestador (porcentaje + fijo), mínimo/máximo, impuesto sobre comisión, descuento PRO.
- Invariante probada con 2.000 casos aleatorios: `total cliente = neto prestador + ingreso plataforma + impuestos`.
- Cada transacción guardará la regla aplicada (versión).

Ejemplo (40 €, cliente 5 % + 0,50 €, prestador 10 %, IVA 21 % sobre comisión): cliente paga 43,03 €; prestador recibe 35,16 €; plataforma 6,50 € + 1,37 € de IVA.

## Pagos en las apps
Servicios presenciales entre personas → se cobran con Stripe también dentro de la app (permitido por Apple y Google). Ver ADR 0002.

## Webhooks (cuando existan)
Firma verificada con el cuerpo crudo · idempotencia por `stripe_event_id` único · se guardan antes de procesar · reintento seguro · eventos desconocidos registrados · nunca se confía en el navegador.

## Simulador
Sin `STRIPE_SECRET_KEY`, un proveedor simulado con la misma interfaz permitirá recorrer el flujo («MODO DEMO — no se cobra dinero»). Imposible activarlo en producción.
