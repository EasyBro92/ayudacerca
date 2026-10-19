import { z } from 'zod';
import { limits } from '../config/limits';
import { detectContactInfo } from '../moderation/contact-detection';
import { LISTING_KINDS, MODALITIES, PRICE_TYPES, PRICED_TYPES } from './enums';

// Los mensajes de error son claves de traducción (namespace «validation»).

const noContactInfo = (value: string) => !detectContactInfo(value).found;

export const listingTitleSchema = z
  .string()
  .trim()
  .min(limits.listing.titleMin, { error: 'titleTooShort' })
  .max(limits.listing.titleMax, { error: 'titleTooLong' })
  .refine(noContactInfo, { error: 'noContactInfo' });

export const listingDescriptionSchema = z
  .string()
  .trim()
  .min(limits.listing.descriptionMin, { error: 'descriptionTooShort' })
  .max(limits.listing.descriptionMax, { error: 'descriptionTooLong' })
  .refine(noContactInfo, { error: 'noContactInfo' });

export const stepKindSchema = z.object({
  kind: z.enum(LISTING_KINDS, { error: 'required' }),
});

export const stepCategorySchema = z.object({
  categoryId: z.number({ error: 'required' }).int().positive({ error: 'required' }),
  subcategoryId: z.number().int().positive().nullable(),
});

export const stepTextSchema = z.object({
  title: listingTitleSchema,
  description: listingDescriptionSchema,
  tags: z
    .array(z.string().trim().min(2).max(limits.listing.tagMaxLength))
    .max(limits.listing.tagsMax, { error: 'tooManyTags' })
    .default([]),
  customValues: z.record(z.string(), z.unknown()).default({}),
});

export const stepPlaceSchema = z.object({
  modality: z.enum(MODALITIES, { error: 'required' }),
  municipalityId: z.number({ error: 'required' }).int().positive({ error: 'required' }),
  radiusKm: z.number().int().min(0).max(200).nullable().default(null),
});

export const stepWhenSchema = z.object({
  desiredDate: z.iso.date({ error: 'invalidDate' }).nullable().default(null),
  isUrgent: z.boolean().default(false),
  availabilityNotes: z.string().trim().max(300).nullable().default(null),
});

export const stepPriceSchema = z
  .object({
    priceType: z.enum(PRICE_TYPES, { error: 'required' }),
    priceCents: z.number().int().min(0).max(limits.listing.priceMaxCents, { error: 'priceTooHigh' }).nullable(),
  })
  .superRefine((value, ctx) => {
    const needsPrice = PRICED_TYPES.includes(value.priceType);
    if (needsPrice && (value.priceCents === null || value.priceCents <= 0)) {
      ctx.addIssue({ code: 'custom', path: ['priceCents'], message: 'priceRequired' });
    }
    if (!needsPrice && value.priceCents !== null) {
      ctx.addIssue({ code: 'custom', path: ['priceCents'], message: 'priceNotAllowed' });
    }
  });

/** Anuncio completo listo para enviar a moderación/publicación. */
export const listingSubmitSchema = z
  .object({
    ...stepKindSchema.shape,
    ...stepCategorySchema.shape,
    ...stepTextSchema.shape,
    ...stepPlaceSchema.shape,
    ...stepWhenSchema.shape,
    priceType: z.enum(PRICE_TYPES),
    priceCents: z.number().int().min(0).max(limits.listing.priceMaxCents).nullable(),
  })
  .superRefine((value, ctx) => {
    const result = stepPriceSchema.safeParse({ priceType: value.priceType, priceCents: value.priceCents });
    if (!result.success) {
      for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message });
    }
  });

export type ListingSubmitInput = z.input<typeof listingSubmitSchema>;
export type ListingSubmit = z.output<typeof listingSubmitSchema>;

export const listingReportSchema = z.object({
  listingId: z.uuid(),
  reason: z.enum(['illegal', 'fraud', 'contact_or_external_payment', 'offensive', 'minors', 'regulated_without_license', 'spam', 'wrong_category', 'other'], { error: 'required' }),
  details: z.string().trim().max(2000).optional(),
});
