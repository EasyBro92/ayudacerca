import { type Database, type SearchFilters, localized, toSearchRpcArgs } from '@ayudacerca/core';
import { supabase } from './supabase';

type SearchRow = Database['public']['Functions']['search_listings']['Returns'][number];

export interface ListingCardData {
  id: string;
  slug: string;
  kind: 'request' | 'offer';
  title: string;
  priceCents: number | null;
  priceType: SearchRow['price_type'];
  modality: SearchRow['modality'];
  isUrgent: boolean;
  publishedAt: string | null;
  municipalityName: string;
  distanceKm: number | null;
  category: { slug: string; name: string; icon: string; color: string };
  coverPath: string | null;
  author: { displayName: string; avatarPath: string | null; identityVerified: boolean; ratingAvg: number; ratingCount: number };
  total: number;
}

export function toCard(r: SearchRow, locale: string): ListingCardData {
  return {
    id: r.id, slug: r.slug, kind: r.kind, title: r.title, priceCents: r.price_cents ?? null, priceType: r.price_type,
    modality: r.modality, isUrgent: r.is_urgent, publishedAt: r.published_at ?? null, municipalityName: r.municipality_name,
    distanceKm: r.distance_km ?? null,
    category: { slug: r.category_slug, name: localized(r.category_name, locale), icon: r.category_icon, color: r.category_color },
    coverPath: r.cover_path ?? null,
    author: { displayName: r.author_display_name, avatarPath: r.author_avatar_path ?? null, identityVerified: r.author_identity_verified, ratingAvg: Number(r.author_rating_avg ?? 0), ratingCount: r.author_rating_count ?? 0 },
    total: Number(r.total_count ?? 0),
  };
}

export async function searchListings(filters: SearchFilters, locale: string, pageSize = 20) {
  const { data, error } = await supabase.rpc('search_listings', toSearchRpcArgs(filters, pageSize));
  if (error) throw error;
  const items = (data ?? []).map((r) => toCard(r, locale));
  return { items, total: items[0]?.total ?? 0 };
}

export async function recentListings(kind: 'offer' | 'request', locale: string) {
  const { data, error } = await supabase.rpc('search_listings', { p_kind: kind, p_sort: 'recent', p_limit: 10 });
  if (error) throw error;
  return (data ?? []).map((r) => toCard(r, locale));
}

export interface CategoryItem { id: number; slug: string; name: string; icon: string; color: string; warnings: string | null; count: number; subcategories: { slug: string; name: string }[] }

export async function getCategories(locale: string): Promise<CategoryItem[]> {
  const [{ data, error }, { data: counts }] = await Promise.all([
    supabase.from('categories').select('id, slug, name, icon, color, warnings, sort_order, subcategories ( slug, name, sort_order )').eq('is_active', true).order('sort_order'),
    supabase.rpc('category_listing_counts'),
  ]);
  if (error) throw error;
  const map = new Map((counts ?? []).map((c) => [c.category_id, Number(c.published_count)]));
  return (data ?? []).map((c) => ({
    id: c.id, slug: c.slug, name: localized(c.name, locale), icon: c.icon, color: c.color,
    warnings: c.warnings ? localized(c.warnings, locale) : null, count: map.get(c.id) ?? 0,
    subcategories: [...c.subcategories].sort((a, b) => a.sort_order - b.sort_order).map((s) => ({ slug: s.slug, name: localized(s.name, locale) })),
  }));
}

export async function getMunicipalities() {
  const { data, error } = await supabase.from('municipalities').select('slug, name, province').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getListing(slug: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`id, slug, kind, title, description, modality, price_cents, price_type, desired_date, is_urgent, status, requirements, published_at, author_id,
      category:categories!inner ( slug, name, icon, color, warnings ),
      municipality:municipalities!inner ( name, province ),
      author:profiles!listings_author_id_fkey ( username, display_name, avatar_path, bio, account_type, identity_verified, professional_verified, rating_avg, rating_count, completed_services, created_at ),
      images:listing_images ( path, position, alt )`)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListing>>>;

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('listing_favorites').select('listing_id').eq('user_id', userId);
  return new Set((data ?? []).map((f) => f.listing_id));
}

export async function setFavorite(userId: string, listingId: string, save: boolean) {
  const { error } = save
    ? await supabase.from('listing_favorites').upsert({ user_id: userId, listing_id: listingId }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true })
    : await supabase.from('listing_favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
  if (error) throw error;
}

export async function getFavoriteListings(userId: string, locale: string) {
  const ids = [...(await getFavoriteIds(userId))];
  if (!ids.length) return [];
  const { data } = await supabase.rpc('search_listings', { p_ids: ids, p_sort: 'recent', p_limit: 50 });
  return (data ?? []).map((r) => toCard(r, locale));
}

export async function reportListing(userId: string, listingId: string, reason: Database['public']['Tables']['listing_reports']['Insert']['reason'], details: string | null) {
  const { error } = await supabase.from('listing_reports').insert({ listing_id: listingId, reporter_id: userId, reason, details });
  if (error && error.code !== '23505') throw error;
  return error?.code === '23505' ? 'already_reported' : 'created';
}
