'use client';

import {
  LISTING_KINDS, MODALITIES, PRICE_TYPES, PRICED_TYPES, detectContactInfo, formatPrice, limits, parseEuros,
  stepCategorySchema, stepKindSchema, stepPlaceSchema, stepPriceSchema, stepTextSchema, stepWhenSchema, validateCustomValues,
  type CategoryFieldDef,
} from '@ayudacerca/core';
import { CheckCircle2, ImagePlus, Lightbulb, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useTransition } from 'react';
import { CategoryIcon } from '@/components/common/category-icon';
import { compressImage } from '@/components/publish/compress';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { removeDraftImageAction, saveDraftAction, submitDraftAction, uploadDraftImageAction } from '@/server/actions/publish';
import type { DraftData, DraftImage } from '@/server/services/listings';

export interface WizardCategory {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  warnings: string | null;
  allowPhotos: boolean;
  subcategories: { id: number; name: string }[];
  fields: (CategoryFieldDef & { id: number; label: string; optionLabels: Record<string, string> })[];
}

interface Props {
  draft: { id: string; data: DraftData; step: number };
  categories: WizardCategory[];
  municipalities: { id: number; name: string; province: string }[];
  storageBaseUrl: string;
  emailVerified: boolean;
}

const TOTAL = 9;
type Errors = Record<string, string>;

export function PublishWizard({ draft, categories, municipalities, storageBaseUrl, emailVerified }: Props) {
  const t = useTranslations('publish');
  const tv = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const tKinds = useTranslations('kinds');
  const tMod = useTranslations('modalities');
  const tPriceTypes = useTranslations('priceTypes');
  const tPrice = useTranslations('price');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [data, setData] = useState<DraftData>(draft.data);
  const [step, setStep] = useState(Math.min(Math.max(draft.step, 1), TOTAL));
  const [errors, setErrors] = useState<Errors>({});
  const [amountText, setAmountText] = useState(draft.data.priceCents ? String(draft.data.priceCents / 100).replace('.', ',') : '');
  const [tagsText, setTagsText] = useState((draft.data.tags ?? []).join(', '));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const [result, setResult] = useState<{ status: 'published' | 'pending_review'; slug: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const category = categories.find((c) => c.id === data.categoryId) ?? null;
  const update = (patch: Partial<DraftData>) => setData((d) => ({ ...d, ...patch }));

  // Guardado automático (con espera de 800 ms tras el último cambio)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const timer = setTimeout(async () => {
      setSaveState('saving');
      const r = await saveDraftAction(draft.id, data, step);
      setSaveState(r.ok ? 'saved' : 'error');
    }, 800);
    return () => clearTimeout(timer);
  }, [data, step, draft.id]);

  // Al cambiar de paso, el foco va al título del paso (lectores de pantalla y teclado)
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  function validate(current: number): Errors {
    const out: Errors = {};
    const collect = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) => {
      for (const i of r.error?.issues ?? []) { const k = i.path.map(String).join('.'); if (!out[k]) out[k] = i.message; }
    };
    if (current === 1) collect(stepKindSchema.safeParse({ kind: data.kind }));
    if (current === 2) {
      collect(stepCategorySchema.safeParse({ categoryId: data.categoryId, subcategoryId: data.subcategoryId ?? null }));
      if (category && category.subcategories.length > 0 && !data.subcategoryId) out.subcategoryId = 'required';
    }
    if (current === 3) {
      collect(stepTextSchema.safeParse({ title: data.title ?? '', description: data.description ?? '', tags: data.tags ?? [], customValues: data.customValues ?? {} }));
      if (category) for (const [k, v] of Object.entries(validateCustomValues(category.fields, data.customValues ?? {}).errors)) out[`customValues.${k}`] = v;
    }
    if (current === 4) collect(stepPlaceSchema.safeParse({ modality: data.modality, municipalityId: data.municipalityId, radiusKm: data.radiusKm ?? null }));
    if (current === 5) collect(stepWhenSchema.safeParse({ desiredDate: data.desiredDate || null, isUrgent: data.isUrgent ?? false, availabilityNotes: data.availabilityNotes || null }));
    if (current === 6) {
      if (data.priceType && PRICED_TYPES.includes(data.priceType as 'fixed')) {
        try { parseEuros(amountText); } catch { out.priceCents = 'invalidAmount'; }
      }
      if (!out.priceCents) collect(stepPriceSchema.safeParse({ priceType: data.priceType, priceCents: data.priceCents ?? null }));
    }
    return out;
  }

  function go(next: number) {
    if (next > step) {
      for (let s = step; s < next; s++) {
        const e = validate(s);
        if (Object.keys(e).length) { setErrors(e); setStep(s); return; }
      }
    }
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setUploadError(null);
    setUploading(true);
    for (const file of Array.from(files)) {
      if ((data.images?.length ?? 0) >= limits.listing.imagesMax) { setUploadError(t('uploadError', { reason: t('tooMany') })); break; }
      if (file.size > limits.listing.imageMaxBytes) { setUploadError(t('uploadError', { reason: t('tooBig') })); continue; }
      const form = new FormData();
      form.append('file', await compressImage(file), file.name);
      const r = await uploadDraftImageAction(draft.id, form);
      if (r.ok) setData((d) => ({ ...d, images: [...(d.images ?? []), r.data] }));
      else setUploadError(t('uploadError', { reason: ['invalidImage', 'tooBig', 'tooMany'].includes(r.error.message) ? t(r.error.message as 'tooBig') : tErrors(r.error.code) }));
    }
    setUploading(false);
  }

  async function removeImage(img: DraftImage) {
    const r = await removeDraftImageAction(draft.id, img.path);
    if (r.ok) setData((d) => ({ ...d, images: (d.images ?? []).filter((i) => i.path !== img.path) }));
  }

  function submit() {
    if (!confirmed) { setErrors({ confirm: 'mustConfirm' }); return; }
    for (let s = 1; s <= 6; s++) { const e = validate(s); if (Object.keys(e).length) { setErrors(e); setStep(s); return; } }
    setSubmitError(null);
    startSubmit(async () => {
      await saveDraftAction(draft.id, data, 9);
      const r = await submitDraftAction(draft.id);
      if (r.ok) setResult(r.data);
      else if (r.error.code === 'validation' && r.error.fieldErrors) { setErrors(r.error.fieldErrors); setSubmitError(t('fixErrors')); }
      else if (['emailRequired', 'verificationRequired', 'rejectedText'].includes(r.error.message)) setSubmitError(t(r.error.message as 'emailRequired'));
      else setSubmitError(tErrors(r.error.code));
    });
  }

  const err = (key: string) => (errors[key] ? (key === 'confirm' ? t('mustConfirm') : tv(errors[key] as 'required')) : null);
  const stepName = (n: number) => t(`step${n}` as 'step1');
  const textForCheck = `${data.title ?? ''} ${data.description ?? ''} ${tagsText}`;
  const contactFound = detectContactInfo(textForCheck).found;

  if (result) {
    return (
      <div className="flex flex-col items-start gap-4">
        <CheckCircle2 aria-hidden className="size-14 text-success" />
        <h1 className="text-3xl" tabIndex={-1} ref={headingRef}>{result.status === 'published' ? t('publishedTitle') : t('pendingTitle')}</h1>
        <p role="status" className="text-lg text-ink-muted">{result.status === 'published' ? t('publishedText') : t('pendingText')}</p>
        <div className="flex flex-wrap gap-3">
          {result.status === 'published' ? <Button asChild size="lg"><Link href={`/anuncios/${result.slug}`}>{t('viewListing')}</Link></Button> : null}
          <Button asChild size="lg" variant="outline"><Link href="/publicar?nuevo=1">{t('newListing')}</Link></Button>
        </div>
      </div>
    );
  }

  const choice = 'flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border-2 border-border bg-surface p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus';

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* Progreso */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <p className="font-semibold">{t('progress', { step, total: TOTAL, name: stepName(step) })}</p>
            <p aria-live="polite" className="text-ink-muted">
              {saveState === 'saving' ? t('saving') : saveState === 'saved' ? t('saved') : saveState === 'error' ? t('saveError') : ''}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step} aria-label={t('progress', { step, total: TOTAL, name: stepName(step) })}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </div>

        {!emailVerified ? <Alert variant="warning">{t('emailRequired')}</Alert> : null}
        {Object.keys(errors).length > 0 ? <Alert variant="danger" live>{t('fixErrors')}</Alert> : null}

        <form onSubmit={(e) => { e.preventDefault(); if (step < TOTAL) go(step + 1); else submit(); }} className="flex flex-col gap-6" noValidate>
          {step === 1 ? (
            <fieldset className="flex flex-col gap-3">
              <legend><h1 ref={headingRef} tabIndex={-1} className="mb-4 text-3xl focus:outline-none">{t('q1')}</h1></legend>
              {LISTING_KINDS.map((k) => (
                <label key={k} className={choice}>
                  <input type="radio" name="kind" value={k} checked={data.kind === k} onChange={() => update({ kind: k })} className="mt-1 size-5 accent-primary" />
                  <span><span className="block text-lg font-bold">{k === 'request' ? t('kindRequest') : t('kindOffer')}</span><span className="text-ink-muted">{k === 'request' ? t('kindRequestHelp') : t('kindOfferHelp')}</span></span>
                </label>
              ))}
              {err('kind') ? <p className="font-semibold text-danger">{err('kind')}</p> : null}
            </fieldset>
          ) : null}

          {step === 2 ? (
            <>
              <fieldset>
                <legend><h1 ref={headingRef} tabIndex={-1} className="mb-4 text-3xl focus:outline-none">{t('q2')}</h1></legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((c) => (
                    <label key={c.id} className={cn(choice, 'items-center')}>
                      <input type="radio" name="category" className="sr-only" checked={data.categoryId === c.id} onChange={() => update({ categoryId: c.id, subcategoryId: null, customValues: {} })} />
                      <CategoryIcon icon={c.icon} color={c.color} />
                      <span className="font-semibold">{c.name}</span>
                    </label>
                  ))}
                </div>
                {err('categoryId') ? <p className="mt-2 font-semibold text-danger">{err('categoryId')}</p> : null}
              </fieldset>
              {category && category.subcategories.length > 0 ? (
                <Field id="subcategory" label={t('subcategory')} error={err('subcategoryId')}>
                  {(aria) => (
                    <NativeSelect {...aria} value={data.subcategoryId ?? ''} onChange={(e) => update({ subcategoryId: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">{t('chooseOption')}</option>
                      {category.subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </NativeSelect>
                  )}
                </Field>
              ) : null}
              {category?.warnings ? <Alert variant="warning">{category.warnings}</Alert> : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q3')}</h1>
              <Field id="title" label={t('titleLabel')} help={`${t('titleHelp')} ${t('charCount', { count: (data.title ?? '').length, max: limits.listing.titleMax })}`} error={err('title')}>
                {(aria) => <Input {...aria} value={data.title ?? ''} maxLength={limits.listing.titleMax} onChange={(e) => update({ title: e.target.value })} />}
              </Field>
              <Field id="description" label={t('descriptionLabel')} help={`${t('descriptionHelp')} ${t('charCount', { count: (data.description ?? '').length, max: limits.listing.descriptionMax })}`} error={err('description')}>
                {(aria) => <Textarea {...aria} rows={8} value={data.description ?? ''} maxLength={limits.listing.descriptionMax} onChange={(e) => update({ description: e.target.value })} />}
              </Field>
              <Field id="tags" label={t('tagsLabel')} help={t('tagsHelp')} optionalLabel={tCommon('optional')} error={err('tags')}>
                {(aria) => (
                  <Input {...aria} value={tagsText} onChange={(e) => {
                    setTagsText(e.target.value);
                    update({ tags: e.target.value.split(',').map((s) => s.trim()).filter((s) => s.length >= 2).slice(0, limits.listing.tagsMax) });
                  }} />
                )}
              </Field>
              {contactFound ? <Alert variant="danger" live>{t('contactWarning')}</Alert> : null}
              {category && category.fields.length > 0 ? (
                <fieldset className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <legend className="px-1 font-bold">{t('extraFields')}</legend>
                  {category.fields.map((f) => <CustomField key={f.key} field={f} value={data.customValues?.[f.key]} error={err(`customValues.${f.key}`)} optionalLabel={tCommon('optional')} chooseLabel={t('chooseOption')}
                    onChange={(v) => update({ customValues: { ...(data.customValues ?? {}), [f.key]: v } })} yes={tCommon('yes')} />)}
                </fieldset>
              ) : null}
              <aside className="rounded-[var(--radius-lg)] bg-primary-soft p-4">
                <p className="mb-2 flex items-center gap-2 font-bold text-primary-strong"><Lightbulb aria-hidden className="size-5" />{t('tipsTitle')}</p>
                <ul className="list-disc space-y-1 pl-5"><li>{t('tip1')}</li><li>{t('tip2')}</li><li>{t('tip3')}</li></ul>
              </aside>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q4')}</h1>
              <fieldset>
                <legend className="mb-2 font-semibold">{t('modalityLabel')}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {MODALITIES.map((m) => (
                    <label key={m} className={choice}>
                      <input type="radio" name="modality" checked={data.modality === m} onChange={() => update({ modality: m })} className="mt-1 size-5 accent-primary" />
                      <span className="font-semibold">{tMod(m)}</span>
                    </label>
                  ))}
                </div>
                {err('modality') ? <p className="mt-2 font-semibold text-danger">{err('modality')}</p> : null}
              </fieldset>
              <Field id="municipality" label={t('municipalityLabel')} help={t('municipalityHelp')} error={err('municipalityId')}>
                {(aria) => (
                  <NativeSelect {...aria} value={data.municipalityId ?? ''} onChange={(e) => update({ municipalityId: e.target.value ? Number(e.target.value) : undefined })}>
                    <option value="">{t('chooseOption')}</option>
                    {municipalities.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.province})</option>)}
                  </NativeSelect>
                )}
              </Field>
              {data.kind === 'offer' ? (
                <Field id="radius" label={t('radiusLabel')} optionalLabel={tCommon('optional')}>
                  {(aria) => (
                    <NativeSelect {...aria} value={data.radiusKm ?? ''} onChange={(e) => update({ radiusKm: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">{t('radiusNone')}</option>
                      {limits.search.radiusOptionsKm.map((km) => <option key={km} value={km}>{km} km</option>)}
                    </NativeSelect>
                  )}
                </Field>
              ) : null}
            </>
          ) : null}

          {step === 5 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q5')}</h1>
              <Field id="date" label={t('dateLabel')} help={t('dateHelp')} optionalLabel={tCommon('optional')} error={err('desiredDate')}>
                {(aria) => <Input {...aria} type="date" min={new Date().toISOString().slice(0, 10)} value={data.desiredDate ?? ''} onChange={(e) => update({ desiredDate: e.target.value || null })} />}
              </Field>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={data.isUrgent ?? false} onChange={(e) => update({ isUrgent: e.target.checked })} className="mt-1 size-5 accent-primary" />
                <span><span className="font-semibold">{t('urgentLabel')}</span><br /><span className="text-ink-muted">{t('urgentHelp')}</span></span>
              </label>
              <Field id="availability" label={t('availabilityLabel')} help={t('availabilityHelp')} optionalLabel={tCommon('optional')} error={err('availabilityNotes')}>
                {(aria) => <Input {...aria} maxLength={300} value={data.availabilityNotes ?? ''} onChange={(e) => update({ availabilityNotes: e.target.value || null })} />}
              </Field>
            </>
          ) : null}

          {step === 6 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q6')}</h1>
              <fieldset>
                <legend className="mb-2 font-semibold">{t('priceTypeLabel')}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PRICE_TYPES.filter((p) => p !== 'exchange').map((p) => (
                    <label key={p} className={choice}>
                      <input type="radio" name="priceType" checked={data.priceType === p} className="mt-1 size-5 accent-primary"
                        onChange={() => update({ priceType: p, priceCents: PRICED_TYPES.includes(p) ? (amountText ? safeCents(amountText) : null) : null })} />
                      <span className="font-semibold">{tPriceTypes(p)}</span>
                    </label>
                  ))}
                </div>
                {err('priceType') ? <p className="mt-2 font-semibold text-danger">{err('priceType')}</p> : null}
              </fieldset>
              {data.priceType && PRICED_TYPES.includes(data.priceType as 'fixed') ? (
                <Field id="amount" label={t('amountLabel')} help={t('amountHelp')} error={err('priceCents')}>
                  {(aria) => <Input {...aria} inputMode="decimal" value={amountText} onChange={(e) => { setAmountText(e.target.value); update({ priceCents: safeCents(e.target.value) }); }} />}
                </Field>
              ) : null}
            </>
          ) : null}

          {step === 7 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q7')}</h1>
              {category && !category.allowPhotos ? <Alert variant="info">{t('photosNotAllowed')}</Alert> : (
                <>
                  <p className="text-ink-muted">{t('photosHelp', { max: limits.listing.imagesMax })}</p>
                  <Alert variant="warning">{t('photosWarning')}</Alert>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(data.images ?? []).map((img, i) => (
                      <li key={img.path} className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-surface-muted">
                        <Image src={`${storageBaseUrl}/${img.path}`} alt="" fill sizes="200px" className="object-cover" />
                        <button type="button" onClick={() => removeImage(img)} aria-label={t('removePhoto', { index: i + 1 })} className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full bg-surface shadow">
                          <Trash2 aria-hidden className="size-5 text-danger" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {(data.images?.length ?? 0) < limits.listing.imagesMax ? (
                    <label className={cn(choice, 'justify-center border-dashed')}>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="sr-only" disabled={uploading} onChange={(e) => { void onFiles(e.target.files); e.target.value = ''; }} />
                      {uploading ? <Loader2 aria-hidden className="size-6 animate-spin" /> : <ImagePlus aria-hidden className="size-6" />}
                      <span className="font-semibold">{uploading ? t('uploading') : t('addPhoto')}</span>
                    </label>
                  ) : null}
                  {uploadError ? <Alert variant="danger" live>{uploadError}</Alert> : null}
                </>
              )}
            </>
          ) : null}

          {step === 8 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q8')}</h1>
              <p className="text-ink-muted">{t('previewNote')}</p>
              <Preview />
            </>
          ) : null}

          {step === 9 ? (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl focus:outline-none">{t('q9')}</h1>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 size-5 shrink-0 accent-primary" aria-invalid={errors.confirm ? true : undefined} aria-describedby={errors.confirm ? 'confirm-error' : undefined} />
                  <span>{t.rich('confirmRules', { rules: (c) => <Link href="/legal/community_rules" target="_blank" className="font-semibold text-primary underline">{c}</Link> })}</span>
                </label>
                {errors.confirm ? <p id="confirm-error" className="font-semibold text-danger">{t('mustConfirm')}</p> : null}
              </div>
              {submitError ? <Alert variant="danger" live>{submitError}</Alert> : null}
            </>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {step > 1 ? <Button variant="outline" size="lg" onClick={() => go(step - 1)}>{t('back')}</Button> : <span />}
            {step < TOTAL ? (
              <Button type="submit" size="lg">{t('next')}</Button>
            ) : (
              <Button type="submit" size="lg" variant="accent" disabled={submitting || !emailVerified}>{submitting ? t('submitting') : t('submit')}</Button>
            )}
          </div>
        </form>
      </div>

      {/* Vista previa en tiempo real (escritorio) */}
      <aside aria-label={t('step8')} className="hidden lg:block">
        <div className="sticky top-20"><Preview compact /></div>
        <ol className="mt-6 flex flex-col gap-1 text-sm">
          {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
            <li key={n}>
              <button type="button" onClick={() => (n < step ? go(n) : undefined)} disabled={n >= step} aria-current={n === step ? 'step' : undefined} aria-label={t('goToStep', { name: stepName(n) })}
                className={cn('w-full rounded-md px-2 py-1.5 text-left', n === step ? 'bg-primary-soft font-bold text-primary-strong' : n < step ? 'hover:bg-surface-muted' : 'text-ink-muted')}>
                {n}. {stepName(n)}
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );

  function Preview({ compact = false }: { compact?: boolean }) {
    const cover = data.images?.[0];
    const price = data.priceType ? formatPrice(data.priceCents ?? null, data.priceType as 'fixed', locale, (k, v) => tPrice(k as 'free', v as never)) : '—';
    const muni = municipalities.find((m) => m.id === data.municipalityId);
    return (
      <article className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="relative aspect-[4/3] bg-surface-muted">
          {cover ? <Image src={`${storageBaseUrl}/${cover.path}`} alt="" fill sizes="320px" className="object-cover" /> : category ? (
            <div className="flex h-full items-center justify-center"><CategoryIcon icon={category.icon} color={category.color} size="lg" /></div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 p-4">
          {data.kind ? <p className="text-sm font-semibold">{tKinds(data.kind)}{category ? ` · ${category.name}` : ''}</p> : null}
          <p className="text-lg font-bold">{data.title || '…'}</p>
          <p className="text-xl font-bold">{price}</p>
          {muni ? <p className="text-sm text-ink-muted">{muni.name}{data.modality ? ` · ${tMod(data.modality as 'online')}` : ''}</p> : null}
          {!compact && data.description ? <p className="whitespace-pre-line">{data.description}</p> : null}
        </div>
      </article>
    );
  }
}

function safeCents(text: string): number | null {
  try { return parseEuros(text); } catch { return null; }
}

function CustomField({ field, value, error, onChange, optionalLabel, chooseLabel, yes }: {
  field: WizardCategory['fields'][number]; value: unknown; error: string | null; onChange: (v: unknown) => void; optionalLabel: string; chooseLabel: string; yes: string;
}) {
  const id = `cf-${field.key}`;
  const optional = field.is_required ? undefined : optionalLabel;
  if (field.field_type === 'boolean') {
    return (
      <label className="flex items-center gap-3">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-primary" />
        <span className="font-semibold">{field.label}</span><span className="sr-only">{yes}</span>
      </label>
    );
  }
  return (
    <Field id={id} label={field.label} error={error} {...(optional ? { optionalLabel: optional } : {})}>
      {(aria) => field.field_type === 'select' ? (
        <NativeSelect {...aria} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          <option value="">{chooseLabel}</option>
          {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{field.optionLabels[o.value] ?? o.value}</option>)}
        </NativeSelect>
      ) : field.field_type === 'textarea' ? (
        <Textarea {...aria} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} maxLength={field.validation?.maxLength ?? 1000} />
      ) : (
        <Input {...aria} type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'} value={String(value ?? '')}
          onChange={(e) => onChange(field.field_type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          {...(field.validation?.min !== undefined ? { min: field.validation.min } : {})} {...(field.validation?.max !== undefined ? { max: field.validation.max } : {})} />
      )}
    </Field>
  );
}
