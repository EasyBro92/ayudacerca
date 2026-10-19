# ADR 0008 — Eliminación de cuenta con plazo de gracia

- Estado: aceptada
- Fecha: 2026-10-19

## Contexto
El RGPD (derecho de supresión) y las normas de App Store (5.1.1(v)) y Google Play obligan a ofrecer la eliminación de la cuenta desde la propia app.

## Decisión
- `public.request_account_deletion()` (RPC): oculta al instante perfil y anuncios y programa el borrado a 14 días.
- `public.cancel_account_deletion()`: la persona puede arrepentirse en ese plazo.
- `private.process_account_deletions()` se ejecuta a diario con `pg_cron` y borra la cuenta (en cascada).
- La auditoría guarda un identificador seudónimo sin clave foránea para seguir siendo inmutable.

## Consecuencias
- Cuando existan pagos, facturas e incidencias, esos registros se anonimizarán en lugar de borrarse (obligaciones legales de conservación). Pendiente para la fase 5.
