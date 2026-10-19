// Reflejo exacto de los enums de PostgreSQL (supabase/migrations/*_listings.sql).
// Un test compara ambos para que no se desincronicen.

export const LISTING_KINDS = ['request', 'offer'] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const MODALITIES = ['online', 'in_person', 'hybrid', 'at_home', 'agreed_location'] as const;
export type Modality = (typeof MODALITIES)[number];

export const PRICE_TYPES = ['fixed', 'hourly', 'daily', 'quote', 'free', 'exchange'] as const;
export type PriceType = (typeof PRICE_TYPES)[number];
/** Tipos de precio que exigen un importe */
export const PRICED_TYPES: readonly PriceType[] = ['fixed', 'hourly', 'daily'];

export const LISTING_STATUSES = ['draft', 'pending_review', 'published', 'rejected', 'paused', 'reserved', 'completed', 'expired', 'removed'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
/** Estados que cualquiera puede ver en el detalle */
export const PUBLIC_LISTING_STATUSES: readonly ListingStatus[] = ['published', 'paused', 'reserved', 'completed', 'expired'];

export const REPORT_REASONS = ['illegal', 'fraud', 'contact_or_external_payment', 'offensive', 'minors', 'regulated_without_license', 'spam', 'wrong_category', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const SORT_OPTIONS = ['relevance', 'recent', 'nearest', 'price_asc', 'rating', 'response'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
