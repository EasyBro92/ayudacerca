# ADR 0001 — Monorepo con web (Next.js) y app nativa (Expo)

- Estado: aceptada
- Fecha: 2026-10-19

## Contexto

La especificación original pedía una web Next.js instalable como PWA. El propietario del producto ha añadido un requisito nuevo: **la app debe publicarse en Google Play y en la App Store**.

Opciones evaluadas:

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. PWA envuelta en Capacitor | Un solo código de interfaz | Apple rechaza con frecuencia apps que son «una web empaquetada» (directriz 4.2, funcionalidad mínima); experiencia menos nativa; Server Actions de Next no funcionan en exportación estática |
| B. Expo para todo (iOS, Android y web) | Un solo código de interfaz | SEO y renderizado en servidor de la web más limitados que Next; panel de administración incómodo en React Native |
| **C. Monorepo: Next.js (web) + Expo (móvil) + paquete compartido** | Web con SEO y administración de primera; apps realmente nativas; lógica de negocio, validaciones, marca y textos compartidos | Dos capas de interfaz que mantener |

## Decisión

Opción **C**, con pnpm workspaces:

```
apps/web       Next.js App Router — web pública (SEO), zona de usuario web, /admin, API /api/v1 para la app, webhooks, cron
apps/mobile    Expo + Expo Router — app Android/iOS publicada en las tiendas
packages/core  TypeScript puro — dominio (dinero, comisiones, cancelaciones, máquinas de estado), esquemas Zod,
               marca, categorías, detección de datos de contacto, textos i18n (es/ca/en)
supabase/      migraciones, políticas RLS, pruebas pgTAP, semillas
```

- La interfaz se escribe dos veces (web y nativa), pero **toda regla de negocio vive una sola vez** en `packages/core` o en la base de datos.
- Las operaciones sensibles se exponen como servicios de servidor en `apps/web/src/server/services`, consumidos por Server Actions (web) y por Route Handlers `/api/v1/*` (app móvil, con token Bearer de Supabase).
- La web mantiene la PWA como canal secundario.

## Consecuencias

- Las builds de iOS se hacen con **EAS Build** (en la nube de Expo), así que no hace falta un Mac.
- Hace falta una cuenta de Expo, una cuenta de Apple Developer (99 USD/año) y una de Google Play Console (25 USD, pago único). Ver `docs/MOBILE_STORES.md`.
- Las notificaciones push de la app usan APNs/FCM a través de Expo Notifications; las de la web, Web Push (VAPID).
