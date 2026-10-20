import 'server-only';
import { type Database, type SearchFilters, localized, toSearchRpcArgs } from '@ayudacerca/core';
import { cache } from 'react';
import { createSupabasePublicClient, createSupabaseServerClient } from '@/lib/supabase/server';
import type { ListingCardData } from './types';

type SearchRow = Database['public']['Functions']['search_listings']['Returns'][number];

export function toCard(row: SearchRow, locale: string): ListingCardData {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    priceCents: row.price_cents ?? null,
    priceType: row.price_type,
    modality: row.modality,
    isUrgent: row.is_urgent,
    status: row.status,
    publishedAt: row.published_at ?? null,
    municipalityName: row.municipality_name,
    distanceKm: row.distance_km ?? null,
    category: { slug: row.category_slug, name: localized(row.category_name, locale), icon: row.category_icon, color: row.category_color },
    subcategoryName: row.subcategory_name ? localized(row.subcategory_name, locale) : null,
    coverPath: row.cover_path ?? null,
    author: {
      username: row.author_username,
      displayName: row.author_display_name,
      avatarPath: row.author_avatar_path ?? null,
      identityVerified: row.author_identity_verified,
      ratingAvg: Number(row.author_rating_avg ?? 0),
      ratingCount: row.author_rating_count ?? 0,
    },
  };
}

export interface SearchResult {
  items: ListingCardData[];
  total: number;
  pageSize: number;
}

/** Búsqueda pública. Usa la sesión para respetar bloqueos entre usuarios (RLS). */
export async function searchListings(filters: SearchFilters, locale: string, pageSize = 20): Promise<SearchResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('search_listings', toSearchRpcArgs(filters, pageSize));
  if (error) throw new Error(`search_listings: ${error.message}`);
  const rows = data ?? [];
  return { items: rows.map((r) => toCard(r, locale)), total: Number(rows[0]?.total_count ?? 0), pageSize };
}

export async function getRecentListings(kind: 'offer' | 'request', locale: string, limit = 8): Promise<ListingCardData[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc('search_listings', { p_kind: kind, p_sort: 'recent', p_limit: limit });
  if (error) throw new Error(`recent listings: ${error.message}`);
  return (data ?? []).map((r) => toCard(r, locale));
}

const LISTING_DETAIL_SELECT = `
  id, slug, kind, title, description, modality, price_cents, price_type, currency, availability, desired_date,
  is_urgent, status, tags, requirements, safety_notes, published_at, expires_at, created_at, author_id,
  category:categories!inner ( id, slug, name, icon, color, warnings, restrictions, is_sensitive ),
  subcategory:subcategories ( slug, name ),
  municipality:municipalities!inner ( slug, name, province ),
  author:profiles!listings_author_id_fkey ( id, username, display_name, avatar_path, bio, skills, available_until, account_type, email_verified, identity_verified,
    professional_verified, is_pro, rating_avg, rating_count, completed_services, response_time_minutes, created_at ),
  images:listing_images ( id, path, width, height, alt, position ),
  custom_values:listing_custom_values ( value, field:category_fields!inner ( key, label, field_type, options, is_public, sort_order ) )
`;

export const getListingBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('listings').select(LISTING_DETAIL_SELECT).eq('slug', slug).maybeSingle();
  if (error) throw new Error(`listing detail: ${error.message}`);
  return data;
});

export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingBySlug>>>;

export async function getSimilarListings(listing: ListingDetail, locale: string, limit = 4): Promise<ListingCardData[]> {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase.rpc('search_listings', {
    p_category: listing.category.slug,
    p_municipality: listing.municipality.slug,
    p_radius_km: 50,
    p_sort: 'nearest',
    p_limit: limit + 1,
  });
  let rows = (data ?? []).filter((r) => r.id !== listing.id);
  if (rows.length < limit) {
    const { data: more } = await supabase.rpc('search_listings', { p_category: listing.category.slug, p_limit: limit + 1 });
    rows = [...rows, ...(more ?? []).filter((r) => r.id !== listing.id && !rows.some((x) => x.id === r.id))];
  }
  return rows.slice(0, limit).map((r) => toCard(r, locale));
}

/** Comprueba si existe un anuncio retirado con ese slug (para responder 410 en vez de 404). */
export async function wasListingRemoved(slug: string): Promise<boolean> {
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from('listings').select('status').eq('slug', slug).maybeSingle();
    return data?.status === 'removed' || data?.status === 'rejected';
  } catch {
    return false;
  }
}
