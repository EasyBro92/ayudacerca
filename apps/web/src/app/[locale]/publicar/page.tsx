import { localized } from '@ayudacerca/core';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PublishWizard, type WizardCategory } from '@/components/publish/publish-wizard';
import { publicEnv } from '@/config/env';
import { createSupabasePublicClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/server/auth/session';
import { type DraftData, getOrCreateDraft } from '@/server/services/listings';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PublishPage({ params, searchParams }: PageProps<'/[locale]/publicar'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const sp = await searchParams;
  const query = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])));
  const user = await requireUser(locale, `/publicar${query.size ? `?${query}` : ''}`);
  const t = await getTranslations('publish');

  const kind: DraftData['kind'] = sp.tipo === 'ofrezco' ? 'offer' : sp.tipo === 'necesito' ? 'request' : undefined;
  let draftId = typeof sp.borrador === 'string' ? sp.borrador : null;
  if (!draftId && sp.nuevo !== '1') {
    const supabase = await createSupabaseServerClient();
    const { data: latest } = await supabase.from('listing_drafts').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    draftId = latest?.id ?? null;
  }
  const draft = await getOrCreateDraft(user, draftId, kind ? { kind } : {});
  if (kind && !draft.data.kind) draft.data.kind = kind;

  const supabase = createSupabasePublicClient();
  const [{ data: cats }, { data: munis }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, slug, name, icon, color, warnings, allow_photos, sort_order, subcategories ( id, name, sort_order, is_active ), category_fields ( id, key, label, field_type, options, is_required, validation, sort_order )')
      .eq('is_active', true)
      .order('sort_order'),
    supabase.from('municipalities').select('id, name, province').order('name'),
  ]);

  const categories: WizardCategory[] = (cats ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: localized(c.name, locale),
    icon: c.icon,
    color: c.color,
    warnings: c.warnings ? localized(c.warnings, locale) : null,
    allowPhotos: c.allow_photos,
    subcategories: [...c.subcategories].filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order).map((s) => ({ id: s.id, name: localized(s.name, locale) })),
    fields: [...c.category_fields].sort((a, b) => a.sort_order - b.sort_order).map((f) => {
      const options = (f.options as { value: string; label: unknown }[] | null) ?? null;
      return {
        id: f.id,
        key: f.key,
        field_type: f.field_type as WizardCategory['fields'][number]['field_type'],
        is_required: f.is_required,
        options: options?.map((o) => ({ value: o.value })) ?? null,
        validation: (f.validation as WizardCategory['fields'][number]['validation']) ?? null,
        label: localized(f.label, locale),
        optionLabels: Object.fromEntries((options ?? []).map((o) => [o.value, localized(o.label, locale)])),
      };
    }),
  }));

  return (
    <div className="container-page py-6">
      <p className="sr-only">{t('title')}</p>
      <PublishWizard
        draft={draft}
        categories={categories}
        municipalities={(munis ?? []).map((m) => ({ id: m.id, name: m.name, province: m.province }))}
        storageBaseUrl={`${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images`}
        emailVerified={user.emailVerified}
      />
    </div>
  );
}
