import { describe, expect, it } from 'vitest';
import { listingSubmitSchema, stepPriceSchema, stepTextSchema } from './schemas';

const valid = {
  kind: 'request',
  categoryId: 4,
  subcategoryId: null,
  title: 'Recoger un paquete en correos',
  description: 'Necesito que alguien recoja un paquete a mi nombre en la oficina de correos del barrio.',
  tags: ['correos'],
  customValues: {},
  modality: 'in_person',
  municipalityId: 1,
  radiusKm: null,
  desiredDate: '2026-11-02',
  isUrgent: false,
  availabilityNotes: null,
  priceType: 'fixed',
  priceCents: 1500,
} as const;

describe('listingSubmitSchema', () => {
  it('acepta un anuncio válido', () => expect(listingSubmitSchema.safeParse(valid).success).toBe(true));

  it('rechaza teléfonos en la descripción', () => {
    const r = listingSubmitSchema.safeParse({ ...valid, description: `${valid.description} Llámame al 612345678.` });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe('noContactInfo');
  });

  it('exige precio en precio fijo y lo prohíbe en gratis', () => {
    expect(listingSubmitSchema.safeParse({ ...valid, priceCents: null }).error?.issues[0]?.message).toBe('priceRequired');
    expect(listingSubmitSchema.safeParse({ ...valid, priceType: 'free', priceCents: 100 }).error?.issues[0]?.message).toBe('priceNotAllowed');
    expect(listingSubmitSchema.safeParse({ ...valid, priceType: 'free', priceCents: null }).success).toBe(true);
  });

  it('valida longitudes con claves de traducción', () => {
    const r = stepTextSchema.safeParse({ title: 'Corto', description: 'Muy corto' });
    expect(r.error?.issues.map((i) => i.message)).toEqual(['titleTooShort', 'descriptionTooShort']);
  });

  it('valida el precio por paso', () => {
    expect(stepPriceSchema.safeParse({ priceType: 'hourly', priceCents: 0 }).success).toBe(false);
    expect(stepPriceSchema.safeParse({ priceType: 'quote', priceCents: null }).success).toBe(true);
  });
});
