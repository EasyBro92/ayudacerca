/** Límites por defecto. Los valores efectivos pueden sobrescribirse desde platform_settings. */
export const limits = {
  listing: {
    titleMin: 10,
    titleMax: 80,
    descriptionMin: 40,
    descriptionMax: 4000,
    tagsMax: 10,
    tagMaxLength: 30,
    requirementsMax: 1000,
    imagesMax: 6,
    imagesMaxPro: 12,
    imageMaxBytes: 10 * 1024 * 1024,
    priceMaxCents: 10_000_000,
    expiryDays: 30,
  },
  profile: {
    displayNameMin: 2,
    displayNameMax: 40,
    bioMax: 600,
    availableHours: 2,
    skillsMax: 12,
  },
  auth: {
    passwordMin: 10,
    passwordMax: 128,
  },
  chat: {
    messageMax: 2000,
    pageSize: 50,
    previewMax: 140,
  },
  search: {
    pageSize: 20,
    maxOffset: 1000,
    radiusOptionsKm: [5, 10, 25, 50] as const,
  },
} as const;
