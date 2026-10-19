import 'server-only';
import { localized } from '@ayudacerca/core';
import { unstable_cache } from 'next/cache';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import type { CategorySummary } from './types';

const loadCatalog = unstable_cache(
  async () => {
    const supabase = createSupabasePublicClient();
    const [categories, counts] = await Promise.all([
      supabase
        .from('categories')
        .select('id, slug, name, description, icon, color, warnings, is_sensitive, sort_order, subcategories ( id, slug, name, sort_order, is_active )')
        .eq('is_active', true)
        .order('sort_order'),
      supabase.rpc('category_listing_counts'),
    ]);
    if (categories.error) throw new Error(`categories: ${categories.error.message}`);
    const countMap = new Map((counts.data ?? []).map((c) => [c.category_id, Number(c.published_count)]));
    return (categories.data ?? []).map((c) => ({ ...c, listingCount: countMap.get(c.id) ?? 0 }));
  },
  ['catalog-v1'],
  { revalidate: 300, tags: ['catalog'] },
);

export async function getCategories(locale: string): Promise<CategorySummary[]> {
  const raw = await loadCatalog();
  return raw.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: localized(c.name, locale),
    description: localized(c.description, locale),
    icon: c.icon,
    color: c.color,
    listingCount: c.listingCount,
    warnings: c.warnings ? localized(c.warnings, locale) : null,
    isSensitive: c.is_sensitive,
    subcategories: [...c.subcategories]
      .filter((s) => s.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ id: s.id, slug: s.slug, name: localized(s.name, locale) })),
  }));
}

export async function getCategory(slug: string, locale: string): Promise<CategorySummary | null> {
  return (await getCategories(locale)).find((c) => c.slug === slug) ?? null;
}

export const getMunicipalities = unstable_cache(
  async () => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from('municipalities').select('slug, name, province').order('name');
    if (error) throw new Error(`municipalities: ${error.message}`);
    return data ?? [];
  },
  ['municipalities-v1'],
  { revalidate: 3600, tags: ['municipalities'] },
);

export interface PlatformStats {
  users: number;
  verified: number;
  completed: number;
  rating: number | null;
  /** Solo se muestran las cifras que superan su umbral (nunca inflamos números) */
  visible: { users: boolean; verified: boolean; completed: boolean; rating: boolean };
}

export const getPlatformStats = unstable_cache(
  async (): Promise<PlatformStats> => {
    const supabase = createSupabasePublicClient();
    const [{ data: stats }, { data: setting }] = await Promise.all([
      supabase.rpc('platform_stats').maybeSingle(),
      supabase.from('platform_settings').select('value').eq('key', 'home.stats_thresholds').maybeSingle(),
    ]);
    const thresholds = (setting?.value ?? {}) as Partial<Record<'users' | 'verified' | 'completed' | 'ratings', number>>;
    const users = Number(stats?.users_count ?? 0);
    const verified = Number(stats?.verified_count ?? 0);
    const completed = Number(stats?.completed_count ?? 0);
    const rating = stats?.rating_avg === null || stats?.rating_avg === undefined ? null : Number(stats.rating_avg);
    return {
      users, verified, completed, rating,
      visible: {
        users: users >= (thresholds.users ?? Infinity),
        verified: verified >= (thresholds.verified ?? Infinity),
        completed: completed >= (thresholds.completed ?? Infinity),
        rating: rating !== null && completed >= (thresholds.ratings ?? Infinity),
      },
    };
  },
  ['platform-stats-v1'],
  { revalidate: 600 },
);
