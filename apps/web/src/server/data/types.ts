import type { ListingKind, ListingStatus, Modality, PriceType } from '@ayudacerca/core';

/** Datos mínimos para pintar una tarjeta de anuncio (salen de public.search_listings). */
export interface ListingCardData {
  id: string;
  slug: string;
  kind: ListingKind;
  title: string;
  priceCents: number | null;
  priceType: PriceType;
  modality: Modality;
  isUrgent: boolean;
  status: ListingStatus;
  publishedAt: string | null;
  municipalityName: string;
  distanceKm: number | null;
  category: { slug: string; name: string; icon: string; color: string };
  subcategoryName: string | null;
  coverPath: string | null;
  author: {
    username: string;
    displayName: string;
    avatarPath: string | null;
    identityVerified: boolean;
    ratingAvg: number;
    ratingCount: number;
  };
}

export interface CategorySummary {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  listingCount: number;
  subcategories: { id: number; slug: string; name: string }[];
  warnings: string | null;
  isSensitive: boolean;
}
