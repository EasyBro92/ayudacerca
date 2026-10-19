import 'server-only';
import {
  type ApiResult, type BlockedTerm, type CategoryFieldDef, checkBlockedTerms, fail, fieldErrorsFromIssues, limits,
  listingSubmitSchema, ok, validateCustomValues,
} from '@ayudacerca/core';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CurrentUser } from '@/server/auth/session';
import { log } from '@/server/log';

export interface DraftImage { path: string; width: number; height: number }
export interface DraftData {
  kind?: 'request' | 'offer' | undefined;
  categoryId?: number | undefined;
  subcategoryId?: number | null | undefined;
  title?: string | undefined;
  description?: string | undefined;
  tags?: string[] | undefined;
  customValues?: Record<string, unknown> | undefined;
  modality?: string | undefined;
  municipalityId?: number | undefined;
  radiusKm?: number | null | undefined;
  desiredDate?: string | null | undefined;
  isUrgent?: boolean | undefined;
  availabilityNotes?: string | null | undefined;
  priceType?: string | undefined;
  priceCents?: number | null | undefined;
  images?: DraftImage[] | undefined;
}

export async function getOrCreateDraft(user: CurrentUser, draftId: string | null, initial: DraftData) {
  const supabase = await createSupabaseServerClient();
  if (draftId) {
    const { data } = await supabase.from('listing_drafts').select('id, data, step').eq('id', draftId).maybeSingle();
    if (data) return data as { id: string; data: DraftData; step: number };
  }
  const { data, error } = await supabase.from('listing_drafts').insert({ author_id: user.id, data: initial as never, step: initial.kind ? 2 : 1 }).select('id, data, step').single();
  if (error) throw new Error(`draft create: ${error.message}`);
  return data as { id: string; data: DraftData; step: number };
}

export async function saveDraft(user: CurrentUser, draftId: string, data: DraftData, step: number): Promise<ApiResult<null>> {
  const supabase = await createSupabaseServerClient();
  // Las imágenes solo las gestiona el servidor: nunca se aceptan rutas enviadas por el cliente
  const { data: current } = await supabase.from('listing_drafts').select('data').eq('id', draftId).maybeSingle();
  if (!current) return fail('not_found');
  const images = (current.data as DraftData).images ?? [];
  const { error } = await supabase
    .from('listing_drafts')
    .update({ data: { ...data, images } as never, step: Math.min(Math.max(step, 1), 9) })
    .eq('id', draftId)
    .eq('author_id', user.id);
  if (error) return fail('internal');
  return ok(null);
}

export async function addDraftImage(user: CurrentUser, draftId: string, image: { data: Buffer; width: number; height: number }): Promise<ApiResult<DraftImage>> {
  const supabase = await createSupabaseServerClient();
  const { data: draft } = await supabase.from('listing_drafts').select('data').eq('id', draftId).maybeSingle();
  if (!draft) return fail('not_found');
  const data = draft.data as DraftData;
  const images = data.images ?? [];
  if (images.length >= limits.listing.imagesMax) return fail('conflict', 'tooMany');

  const path = `${user.id}/${crypto.randomUUID()}.webp`;
  const admin = createSupabaseAdminClient();
  const { error: upErr } = await admin.storage.from('listing-images').upload(path, image.data, { contentType: 'image/webp', upsert: false });
  if (upErr) {
    log('error', 'image.upload_failed', { message: upErr.message });
    return fail('internal');
  }
  const entry = { path, width: image.width, height: image.height };
  await supabase.from('listing_drafts').update({ data: { ...data, images: [...images, entry] } as never }).eq('id', draftId);
  return ok(entry);
}

export async function removeDraftImage(user: CurrentUser, draftId: string, path: string): Promise<ApiResult<null>> {
  const supabase = await createSupabaseServerClient();
  const { data: draft } = await supabase.from('listing_drafts').select('data').eq('id', draftId).maybeSingle();
  if (!draft) return fail('not_found');
  const data = draft.data as DraftData;
  if (!(data.images ?? []).some((i) => i.path === path) || !path.startsWith(`${user.id}/`)) return fail('forbidden');
  await createSupabaseAdminClient().storage.from('listing-images').remove([path]);
  await supabase.from('listing_drafts').update({ data: { ...data, images: (data.images ?? []).filter((i) => i.path !== path) } as never }).eq('id', draftId);
  return ok(null);
}

export type SubmitOutcome = { status: 'published' | 'pending_review'; slug: string };

/** Valida el borrador completo y crea el anuncio. Toda la autorización y la moderación ocurren aquí. */
export async function submitDraft(user: CurrentUser, draftId: string): Promise<ApiResult<SubmitOutcome>> {
  if (!user.emailVerified) return fail('email_not_verified', 'emailRequired');
  if (user.status !== 'active') return fail('account_suspended');

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const { data: draft } = await supabase.from('listing_drafts').select('id, data').eq('id', draftId).maybeSingle();
  if (!draft) return fail('not_found');
  const data = draft.data as DraftData;

  const parsed = listingSubmitSchema.safeParse({
    kind: data.kind, categoryId: data.categoryId, subcategoryId: data.subcategoryId ?? null, title: data.title ?? '',
    description: data.description ?? '', tags: data.tags ?? [], customValues: data.customValues ?? {},
    modality: data.modality, municipalityId: data.municipalityId, radiusKm: data.radiusKm ?? null,
    desiredDate: data.desiredDate || null, isUrgent: data.isUrgent ?? false, availabilityNotes: data.availabilityNotes ?? null,
    priceType: data.priceType, priceCents: data.priceCents ?? null,
  });
  if (!parsed.success) return fail('validation', 'fixErrors', fieldErrorsFromIssues(parsed.error.issues));
  const input = parsed.data;
  if (input.priceType === 'exchange') return fail('validation', 'fixErrors', { priceType: 'invalidOption' });

  const [{ data: category }, { data: fields }, { data: terms }, { data: profile }] = await Promise.all([
    admin.from('categories').select('id, is_active, requires_review, allow_photos, required_verifications, subcategories ( id )').eq('id', input.categoryId).maybeSingle(),
    admin.from('category_fields').select('id, key, field_type, is_required, options, validation').eq('category_id', input.categoryId),
    admin.from('blocked_terms').select('term, action'),
    admin.from('profiles').select('identity_verified, professional_verified').eq('id', user.id).single(),
  ]);
  if (!category?.is_active) return fail('validation', 'fixErrors', { categoryId: 'invalidOption' });
  if (input.subcategoryId && !category.subcategories.some((s) => s.id === input.subcategoryId)) return fail('validation', 'fixErrors', { subcategoryId: 'invalidOption' });

  // Verificaciones exigidas por la categoría para OFRECER (p. ej. cuidado de niños)
  if (input.kind === 'offer') {
    const required = category.required_verifications ?? [];
    if ((required.includes('identity') && !profile?.identity_verified) || (required.includes('professional') && !profile?.professional_verified)) {
      return fail('forbidden', 'verificationRequired');
    }
  }

  const custom = validateCustomValues((fields ?? []) as unknown as CategoryFieldDef[], input.customValues);
  if (!custom.ok) return fail('validation', 'fixErrors', Object.fromEntries(Object.entries(custom.errors).map(([k, v]) => [`customValues.${k}`, v])));

  const moderation = checkBlockedTerms(`${input.title} ${input.description} ${input.tags.join(' ')} ${Object.values(custom.values).join(' ')}`, (terms ?? []) as BlockedTerm[]);
  if (moderation?.action === 'reject') {
    log('info', 'listing.auto_rejected', { userId: user.id, terms: moderation.matches.length });
    return fail('forbidden', 'rejectedText');
  }
  const needsReview = category.requires_review || moderation?.action === 'review';
  const images = category.allow_photos ? (data.images ?? []).filter((i) => i.path.startsWith(`${user.id}/`)).slice(0, limits.listing.imagesMax) : [];

  // 1) Se crea como borrador con la sesión de la persona (RLS garantiza que es suya)
  const { data: created, error: insertError } = await supabase
    .from('listings')
    .insert({
      author_id: user.id, kind: input.kind, title: input.title, description: input.description,
      category_id: input.categoryId, subcategory_id: input.subcategoryId, municipality_id: input.municipalityId,
      modality: input.modality, price_type: input.priceType, price_cents: input.priceCents,
      desired_date: input.desiredDate, is_urgent: input.isUrgent, tags: input.tags, radius_km: input.radiusKm,
      availability: input.availabilityNotes ? { notes: input.availabilityNotes } : null, status: 'draft',
    })
    .select('id, slug')
    .single();
  if (insertError || !created) {
    log('error', 'listing.insert_failed', { code: insertError?.code });
    return fail('internal');
  }

  // 2) Campos personalizados e imágenes
  const fieldIds = new Map((fields ?? []).map((f) => [f.key, f.id]));
  const customRows = Object.entries(custom.values).map(([key, value]) => ({ listing_id: created.id, field_id: fieldIds.get(key)!, value: value as never }));
  if (customRows.length) await supabase.from('listing_custom_values').insert(customRows);
  if (images.length) await admin.from('listing_images').insert(images.map((img, position) => ({ listing_id: created.id, path: img.path, width: img.width, height: img.height, position })));

  // 3) El servidor decide el estado (la persona no puede publicar directamente)
  const status = needsReview ? 'pending_review' : 'published';
  const { data: expirySetting } = await admin.from('platform_settings').select('value').eq('key', 'listings.expiry_days').maybeSingle();
  const expiryDays = Number(expirySetting?.value ?? limits.listing.expiryDays);
  const { error: statusError } = await admin
    .from('listings')
    .update({
      status,
      moderation_status: needsReview ? 'pending' : 'approved',
      moderation_reason: moderation ? 'auto:terms' : null,
      ...(status === 'published' ? { published_at: new Date().toISOString(), expires_at: new Date(Date.now() + expiryDays * 86_400_000).toISOString() } : {}),
    })
    .eq('id', created.id);
  if (statusError) {
    log('error', 'listing.status_failed', { code: statusError.code });
    return fail('internal');
  }

  await admin.from('audit_logs').insert({ actor_id: user.id, action: `listing.submitted.${status}`, entity_type: 'listing', entity_id: created.id, after: { status, auto_review: Boolean(moderation) } });
  await supabase.from('listing_drafts').delete().eq('id', draftId);
  log('info', 'listing.submitted', { listingId: created.id, status });
  return ok({ status, slug: created.slug });
}
