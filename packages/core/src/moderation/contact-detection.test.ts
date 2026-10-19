import { describe, expect, it } from 'vitest';
import { listings } from '../../../../supabase/seed/data/demo.mjs';
import { detectContactInfo } from './contact-detection';

describe('detectContactInfo', () => {
  it.each([
    ['Llámame al 612 345 678', 'phone'],
    ['mi número: 612.34.56.78', 'phone'],
    ['+34 612345678', 'phone'],
    ['seis uno dos tres cuatro cinco seis siete ocho', 'phone'],
    ['fijo 93-123-45-67', 'phone'],
    ['escríbeme a marta@correo.com', 'email'],
    ['marta arroba correo punto com', 'email'],
    ['mira www.mipagina.com', 'url'],
    ['https://example.org/perfil', 'url'],
    ['todo en tienda.es', 'url'],
    ['IBAN ES91 2100 0418 4502 0005 1332', 'iban'],
    ['sígueme @marta_ayuda', 'social'],
    ['escríbeme por WhatsApp', 'social'],
    ['hablamos por telegram', 'social'],
    ['te pago por Bizum', 'external_payment'],
    ['mejor en efectivo y sin comisiones', 'external_payment'],
    ['pagamos fuera de la app', 'external_payment'],
  ])('detecta «%s» como %s', (text, finding) => {
    const result = detectContactInfo(text);
    expect(result.found).toBe(true);
    expect(result.findings).toContain(finding);
  });

  it.each([
    'Te enseño a usar WhatsApp y hacer videollamadas',
    'Piso de 70 m², segundo sin ascensor',
    'Precio: 15 € la hora, mínimo 2 horas',
    'Disponible de 9.30 a 14.00 de lunes a viernes',
    'Fecha límite: 2026-11-30',
    'Tengo un perro y dos gatos',
    'Reviso el ordenador.Es muy rápido',
    'Código postal 08012',
  ])('no marca texto normal: «%s»', (text) => {
    expect(detectContactInfo(text)).toEqual({ found: false, findings: [] });
  });

  it('ninguno de los 50 anuncios de la demo da falso positivo', () => {
    for (const l of listings) {
      const [, , , , , , , , title, description] = l as unknown as string[];
      expect(detectContactInfo(`${title} ${description}`), String(title)).toEqual({ found: false, findings: [] });
    }
  });
});
