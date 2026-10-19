import { type CategoryFieldDef, localized } from '@ayudacerca/core';
import { supabase } from './supabase';

export interface DraftImage { path: string; width: number; height: number }
export interface DraftData {
  kind?: 'request' | 'offer';
  categoryId?: number;
  subcategoryId?: number | null;
  title?: string;
  description?: string;
  tags?: string[];
  customValues?: Record<string, unknown>;
  modality?: string;
  municipalityId?: number;
  radiusKm?: number | null;
  desiredDate?: string | null;
  isUrgent?: boolean;
  availabilityNotes?: string | null;
  priceType?: string;
  priceCents?: number | null;
  images?: DraftImage[];
}

export interface WizardCategory {
  id: number; name: string; icon: string; color: string; warnings: string | null; allowPhotos: boolean;
  subcategories: { id: number; name: string }[];
  fields: (CategoryFieldDef & { label: string; optionLabels: Record<string, string> })[];
}

export async function loadWizardCatalog(locale: string) {
  const [{ data: cats, error }, { data: munis }] = await Promise.all([
    supabase.from('categories')
      .select('id, name, icon, color, warnings, allow_photos, sort_order, subcategories ( id, name, sort_order, is_active ), category_fields ( key, label, field_type, options, is_required, validation, sort_order )')
      .eq('is_active', true).order('sort_order'),
    supabase.from('municipalities').select('id, name, province').order('name'),
  ]);
  if (error) throw error;
  const categories: WizardCategory[] = (cats ?? []).map((c) => ({
    id: c.id, name: localized(c.name, locale), icon: c.icon, color: c.color, allowPhotos: c.allow_photos,
    warnings: c.warnings ? localized(c.warnings, locale) : null,
    subcategories: [...c.subcategories].filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order).map((s) => ({ id: s.id, name: localized(s.name, locale) })),
    fields: [...c.category_fields].sort((a, b) => a.sort_order - b.sort_order).map((f) => {
      const options = (f.options as { value: string; label: unknown }[] | null) ?? null;
      return {
        key: f.key, field_type: f.field_type as CategoryFieldDef['field_type'], is_required: f.is_required,
        options: options?.map((o) => ({ value: o.value })) ?? null, validation: (f.validation as CategoryFieldDef['validation']) ?? null,
        label: localized(f.label, locale), optionLabels: Object.fromEntries((options ?? []).map((o) => [o.value, localized(o.label, locale)])),
      };
    }),
  }));
  return { categories, municipalities: munis ?? [] };
}

/** Recupera el borrador más reciente o crea uno nuevo (RLS: solo los propios). */
export async function getOrCreateDraft(userId: string, kind: DraftData['kind'] | undefined, fresh: boolean) {
  if (!fresh) {
    const { data } = await supabase.from('listing_drafts').select('id, data, step').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (data) return { id: data.id, data: { ...(data.data as DraftData), ...(kind ? { kind } : {}) }, step: data.step };
  }
  const initial: DraftData = kind ? { kind } : {};
  const { data, error } = await supabase.from('listing_drafts').insert({ author_id: userId, data: initial as never, step: kind ? 2 : 1 }).select('id, data, step').single();
  if (error) throw error;
  return { id: data.id, data: data.data as DraftData, step: data.step };
}

export async function saveDraft(id: string, data: DraftData, step: number) {
  const { error } = await supabase.from('listing_drafts').update({ data: data as never, step }).eq('id', id);
  if (error) throw error;
}
