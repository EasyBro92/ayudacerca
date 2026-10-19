import { LOCALES } from '@ayudacerca/core/i18n';
import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { createSupabasePublicClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabasePublicClient();
  const [{ data: categories }, { data: listings }] = await Promise.all([
    supabase.from('categories').select('slug, updated_at').eq('is_active', true),
    supabase.rpc('search_listings', { p_sort: 'recent', p_limit: 50 }),
  ]);
  const entry = (path: string, lastModified?: string, priority = 0.5): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path, 'es'),
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    priority,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(path, l)])) },
  });
  return [
    entry('/', undefined, 1),
    entry('/explorar', undefined, 0.9),
    entry('/categorias', undefined, 0.8),
    entry('/como-funciona'),
    entry('/ofrecer-ayuda'),
    entry('/seguridad'),
    ...(categories ?? []).map((c) => entry(`/categorias/${c.slug}`, c.updated_at, 0.8)),
    ...(listings ?? []).map((l) => entry(`/anuncios/${l.slug}`, l.published_at ?? undefined, 0.6)),
  ];
}
