# Publicar la app en Google Play y App Store

La app (`apps/mobile`) es nativa (Expo SDK 58 + React Native 0.88) y se compila en la nube con **EAS**, así que **no hace falta un Mac** para iOS.

## 1. Lo que necesitas (lo da de alta la empresa, no el código)

| Cuenta | Coste | Para qué |
|---|---|---|
| [Expo](https://expo.dev) | Gratis (plan gratuito con colas) | Compilar y enviar (EAS Build / Submit / Update) |
| [Apple Developer Program](https://developer.apple.com/programs/) | 99 USD/año | App Store y TestFlight. Si se publica como empresa, hace falta número D-U-N-S |
| [Google Play Console](https://play.google.com/console) | 25 USD (pago único) | Google Play. Las cuentas personales nuevas deben superar antes una prueba cerrada con testers (comprueba el número y la duración vigentes en Play Console) |

## 2. Antes de la primera build

1. Decide el nombre definitivo y cambia `packages/core/src/brand.ts` y `apps/mobile/app.config.ts` (`NAME`, `BUNDLE_ID`). El identificador (`com.ayudacerca.app`) **no se puede cambiar** después de publicar.
2. `pnpm --filter @ayudacerca/mobile exec eas-cli login` y `eas init` → copia el `projectId` en la variable `EAS_PROJECT_ID`.
3. Crea en EAS (`expo.dev → Project → Environment variables`) las variables `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_WEB_URL` para los entornos *preview* y *production*.
4. Despliega antes la web y Supabase de producción (`docs/DEPLOYMENT.md`): la app los necesita.

## 3. Compilar

```bash
cd apps/mobile
npx eas-cli@latest build --profile development --platform android   # build de desarrollo para tu móvil
npx eas-cli@latest build --profile preview --platform android       # APK para probar sin tienda
npx eas-cli@latest build --profile production --platform all        # AAB (Play) + IPA (App Store)
```

EAS gestiona los certificados y claves de firma (recomendado). **No subas** al repositorio `*.jks`, `*.p8`, `*.p12` ni `*.mobileprovision` (ya están en `.gitignore`).

## 4. Enviar

```bash
npx eas-cli@latest submit --platform android --profile production   # pista interna, como borrador
npx eas-cli@latest submit --platform ios --profile production       # a App Store Connect / TestFlight
```

Rellena antes `submit.production.ios.ascAppId` en `eas.json` y crea la app en App Store Connect y en Play Console.

## 5. Fichas de las tiendas (lo que te pedirán)

- **Política de privacidad pública**: `https://<tu-dominio>/legal/privacy` (hoy es un borrador: revísala con un abogado antes).
- **Eliminación de cuenta**: ya implementada dentro de la app (Cuenta → Eliminar mi cuenta) y en la web (`/cuenta`). Google pide además una URL web para solicitarla: usa `https://<tu-dominio>/cuenta`.
- **Contenido generado por usuarios**: ya hay denuncias de anuncios, normas de la comunidad y bloqueo de contenido (Apple 1.2). El bloqueo de usuarios en el chat llega con la fase 4.
- **Formulario de seguridad de datos (Google) / Etiquetas de privacidad (Apple)**: datos recogidos → nombre, correo, ubicación aproximada (municipio), contenido generado (anuncios, fotos), identificadores (ID de cuenta). Sin rastreo publicitario. El manifiesto de privacidad de iOS ya está en `app.config.ts`.
- **Clasificación por edades**: contenido generado por usuarios y compras de servicios entre personas → probablemente 17+/PEGI 12 o superior según el cuestionario. Las cuentas exigen mayoría de edad.
- **Cuenta de prueba para revisores**: crea una en producción y ponla en las notas de revisión.
- **Notas de revisión sobre pagos** (ADR 0002): los pagos son por **servicios presenciales entre personas**, permitidos fuera de In-App Purchase (Apple 3.1.3(e) / 3.1.5; Google, bienes y servicios físicos). PRO y destacados, cuando existan, no se venderán en la app hasta integrar compras integradas.
- **Capturas**: 6,7" y 6,5" (iPhone), 13" (iPad, `supportsTablet: true`) y teléfono Android. Puedes generarlas con la build de *preview*.

## 6. Actualizaciones

- Cambios solo de JavaScript: `eas update --channel production` (sin pasar por revisión). `runtimeVersion` sigue la versión de la app.
- Cambios nativos (nuevos permisos o módulos): nueva build y envío.
- `platform_settings.app.min_version` permite obligar a actualizar versiones antiguas.

## Comprobaciones automáticas ya incluidas

- `pnpm --filter @ayudacerca/mobile export:check` compila los paquetes de Android e iOS.
- `packages/core/src/brand-sync.test.ts` comprueba nombre, identificadores, colores, cifrado exento y manifiesto de privacidad.
- `pnpm test:e2e:mobile` prueba las pantallas y flujos de la app sobre su exportación web.
