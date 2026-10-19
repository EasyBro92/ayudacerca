/**
 * Configuración de marca. ÚNICO lugar donde aparece el nombre del producto y la paleta.
 * Cambiar el nombre, colores o datos de contacto aquí se refleja en web y app.
 */
export const brand = {
  name: 'AyudaCerca',
  shortName: 'AyudaCerca',
  domain: 'ayudacerca.example',
  supportEmail: 'soporte@ayudacerca.example',
  privacyEmail: 'privacidad@ayudacerca.example',
  /** Identificadores de las apps en las tiendas (deben coincidir con apps/mobile/app.config.ts). */
  appIds: {
    ios: 'com.ayudacerca.app',
    android: 'com.ayudacerca.app',
  },
  social: {
    instagram: null as string | null,
    x: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },
  /** Datos legales: pendientes de completar por la empresa. */
  company: {
    legalName: '[Razón social pendiente]',
    taxId: '[NIF pendiente]',
    address: '[Domicilio pendiente]',
  },
  colors: {
    background: '#F6F7FB',
    surface: '#FFFFFF',
    surfaceMuted: '#ECEEF6',
    border: '#DCE0EC',
    ink: '#161A2E',
    inkMuted: '#4E546B',
    primary: '#4F46E5',
    primaryStrong: '#4338CA',
    primarySoft: '#EEF0FF',
    onPrimary: '#FFFFFF',
    accent: '#C2410C',
    accentStrong: '#9A3412',
    accentSoft: '#FFEDE3',
    onAccent: '#FFFFFF',
    success: '#276B43',
    successSoft: '#E4F2E9',
    warning: '#8A5A00',
    warningSoft: '#FBF0D9',
    danger: '#B3261E',
    dangerSoft: '#FBE4E2',
    focus: '#4F46E5',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
} as const;

export type BrandColors = typeof brand.colors;
