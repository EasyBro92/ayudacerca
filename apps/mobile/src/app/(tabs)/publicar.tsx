import {
  LISTING_KINDS, MODALITIES, PRICED_TYPES, PRICE_TYPES, detectContactInfo, formatPrice, limits, parseEuros,
  stepCategorySchema, stepKindSchema, stepPlaceSchema, stepPriceSchema, stepTextSchema, validateCustomValues,
} from '@ayudacerca/core';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, ImagePlus, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, type ScrollViewInstance, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale, useTranslations } from 'use-intl';
import { CategoryIcon } from '@/components/category-icon';
import { Screen } from '@/components/screen';
import { AppText, Button, Chip, Loading, Notice, TextField } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { storageUrl } from '@/lib/env';
import { type DraftData, type DraftImage, type WizardCategory, getOrCreateDraft, loadWizardCatalog, saveDraft } from '@/lib/publish-data';
import { MIN_TOUCH, colors, radius, space } from '@/lib/theme';

const TOTAL = 9;
type Errors = Record<string, string>;

export default function PublishTab() {
  const t = useTranslations();
  const { session, profile } = useAuth();
  if (!session || !profile) {
    return (
      <Screen>
        <AppText variant="h1">{t('publish.title')}</AppText>
        <AppText muted>{t('listing.actionsRequireAccount')}</AppText>
        <Button title={t('auth.signInTitle')} onPress={() => router.push('/entrar')} />
        <Button title={t('auth.signUpTitle')} variant="outline" onPress={() => router.push('/registro')} />
      </Screen>
    );
  }
  return <Wizard userId={session.user.id} emailVerified={profile.email_verified} />;
}

function Wizard({ userId, emailVerified }: { userId: string; emailVerified: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const params = useLocalSearchParams<{ tipo?: string }>();
  const kindParam = params.tipo === 'ofrezco' ? 'offer' : params.tipo === 'necesito' ? 'request' : undefined;

  const [catalog, setCatalog] = useState<{ categories: WizardCategory[]; municipalities: { id: number; name: string; province: string }[] } | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [data, setData] = useState<DraftData>({});
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [amountText, setAmountText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [muniQuery, setMuniQuery] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: 'published' | 'pending_review'; slug: string } | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);

  const applyDraft = useCallback((cat: Awaited<ReturnType<typeof loadWizardCatalog>>, draft: Awaited<ReturnType<typeof getOrCreateDraft>>) => {
    setResult(null); setErrors({}); setConfirmed(false);
    setCatalog(cat);
    setDraftId(draft.id);
    setData(draft.data);
    setStep(Math.min(Math.max(draft.step, 1), TOTAL));
    setAmountText(draft.data.priceCents ? String(draft.data.priceCents / 100).replace('.', ',') : '');
    setTagsText((draft.data.tags ?? []).join(', '));
  }, []);

  // «Publicar otro anuncio»: crea un borrador nuevo (lo dispara la persona, no un efecto)
  const start = async (fresh: boolean) => {
    const [cat, draft] = await Promise.all([loadWizardCatalog(locale), getOrCreateDraft(userId, kindParam, fresh)]);
    applyDraft(cat, draft);
  };

  // Carga inicial: recupera el último borrador o crea uno
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadWizardCatalog(locale), getOrCreateDraft(userId, kindParam, false)]).then(
      ([cat, draft]) => { if (!cancelled) applyDraft(cat, draft); },
      () => undefined,
    );
    return () => { cancelled = true; };
  }, [locale, userId, kindParam, applyDraft]);

  // Guardado automático
  useEffect(() => {
    if (!draftId) return;
    const timer = setTimeout(() => { void saveDraft(draftId, data, step).catch(() => undefined); }, 800);
    return () => clearTimeout(timer);
  }, [data, step, draftId]);

  if (!catalog || !draftId) return <Loading label={t('common.loading')} />;
  const category = catalog.categories.find((c) => c.id === data.categoryId) ?? null;
  const update = (patch: Partial<DraftData>) => setData((d) => ({ ...d, ...patch }));
  const tv = (k: string | undefined) => (k ? t(`validation.${k}` as 'validation.required') : null);

  function validate(s: number): Errors {
    const out: Errors = {};
    const collect = (r: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) => {
      for (const i of r.error?.issues ?? []) { const k = i.path.map(String).join('.'); if (!out[k]) out[k] = i.message; }
    };
    if (s === 1) collect(stepKindSchema.safeParse({ kind: data.kind }));
    if (s === 2) {
      collect(stepCategorySchema.safeParse({ categoryId: data.categoryId, subcategoryId: data.subcategoryId ?? null }));
      if (category && category.subcategories.length && !data.subcategoryId) out.subcategoryId = 'required';
    }
    if (s === 3) {
      collect(stepTextSchema.safeParse({ title: data.title ?? '', description: data.description ?? '', tags: data.tags ?? [], customValues: data.customValues ?? {} }));
      if (category) for (const [k, v] of Object.entries(validateCustomValues(category.fields, data.customValues ?? {}).errors)) out[`customValues.${k}`] = v;
    }
    if (s === 4) collect(stepPlaceSchema.safeParse({ modality: data.modality, municipalityId: data.municipalityId, radiusKm: data.radiusKm ?? null }));
    if (s === 6) {
      if (data.priceType && PRICED_TYPES.includes(data.priceType as 'fixed')) { try { parseEuros(amountText); } catch { out.priceCents = 'invalidAmount'; } }
      if (!out.priceCents) collect(stepPriceSchema.safeParse({ priceType: data.priceType, priceCents: data.priceCents ?? null }));
    }
    return out;
  }

  function go(next: number) {
    if (next > step) {
      const e = validate(step);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setStep(next);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  async function pickImages(source: 'library' | 'camera') {
    setNotice(null);
    const remaining = limits.listing.imagesMax - (data.images?.length ?? 0);
    if (remaining <= 0) { setNotice(t('publish.uploadError', { reason: t('publish.tooMany') })); return; }
    const perm = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, exif: false, allowsMultipleSelection: source === 'library', selectionLimit: remaining };
    const picked = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (picked.canceled) return;
    setUploading(true);
    for (const asset of picked.assets.slice(0, remaining)) {
      const form = new FormData();
      form.append('file', { uri: asset.uri, name: asset.fileName ?? 'foto.jpg', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
      const r = await api<DraftImage>(`/drafts/${draftId}/images`, { method: 'POST', body: form });
      if (r.ok) setData((d) => ({ ...d, images: [...(d.images ?? []), r.data] }));
      else setNotice(t('publish.uploadError', { reason: ['invalidImage', 'tooBig', 'tooMany'].includes(r.error.message) ? t(`publish.${r.error.message}` as 'publish.tooBig') : t(`errors.${r.error.code}`) }));
    }
    setUploading(false);
  }

  async function removeImage(img: DraftImage) {
    const r = await api<null>(`/drafts/${draftId}/images?path=${encodeURIComponent(img.path)}`, { method: 'DELETE' });
    if (r.ok) setData((d) => ({ ...d, images: (d.images ?? []).filter((i) => i.path !== img.path) }));
  }

  async function submit() {
    if (!confirmed) { setErrors({ confirm: 'mustConfirm' }); return; }
    for (const s of [1, 2, 3, 4, 6]) { const e = validate(s); if (Object.keys(e).length) { setErrors(e); setStep(s); return; } }
    setSubmitting(true);
    setNotice(null);
    await saveDraft(draftId!, data, TOTAL).catch(() => undefined);
    const r = await api<{ status: 'published' | 'pending_review'; slug: string }>(`/drafts/${draftId}/submit`, { method: 'POST' });
    setSubmitting(false);
    if (r.ok) setResult(r.data);
    else if (['emailRequired', 'verificationRequired', 'rejectedText'].includes(r.error.message)) setNotice(t(`publish.${r.error.message}` as 'publish.emailRequired'));
    else if (r.error.fieldErrors) { setErrors(r.error.fieldErrors); setNotice(t('publish.fixErrors')); }
    else setNotice(t(`errors.${r.error.code}`));
  }

  if (result) {
    return (
      <Screen>
        <CheckCircle2 size={56} color={colors.success} />
        <AppText variant="h1">{result.status === 'published' ? t('publish.publishedTitle') : t('publish.pendingTitle')}</AppText>
        <AppText muted>{result.status === 'published' ? t('publish.publishedText') : t('publish.pendingText')}</AppText>
        {result.status === 'published' ? <Button title={t('publish.viewListing')} onPress={() => router.push({ pathname: '/anuncio/[slug]', params: { slug: result.slug } })} /> : null}
        <Button title={t('publish.newListing')} variant="outline" onPress={() => void start(true)} />
      </Screen>
    );
  }

  const stepName = t(`publish.step${step}` as 'publish.step1');
  const err = (k: string) => (k === 'confirm' && errors.confirm ? t('publish.mustConfirm') : tv(errors[k]));
  const contactFound = detectContactInfo(`${data.title ?? ''} ${data.description ?? ''} ${tagsText}`).found;
  const priceLabel = data.priceType ? formatPrice(data.priceCents ?? null, data.priceType as 'fixed', locale, (k, v) => t(`price.${k}` as 'price.free', v as never)) : '—';
  const muni = catalog.municipalities.find((m) => m.id === data.municipalityId);
  const muniMatches = muniQuery ? catalog.municipalities.filter((m) => m.name.toLowerCase().includes(muniQuery.toLowerCase())).slice(0, 8) : [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.progressWrap}>
          <AppText variant="small" style={{ fontWeight: '700' }}>{t('publish.progress', { step, total: TOTAL, name: stepName })}</AppText>
          <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: TOTAL, now: step }}>
            <View style={[styles.progressFill, { width: `${(step / TOTAL) * 100}%` }]} />
          </View>
        </View>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 3 }} keyboardShouldPersistTaps="handled">
          {!emailVerified ? <Notice tone="warning">{t('publish.emailRequired')}</Notice> : null}
          {Object.keys(errors).length > 0 ? <Notice tone="danger">{t('publish.fixErrors')}</Notice> : null}

          {step === 1 ? (
            <>
              <AppText variant="h1">{t('publish.q1')}</AppText>
              {LISTING_KINDS.map((k) => (
                <Option key={k} selected={data.kind === k} onPress={() => update({ kind: k })} title={k === 'request' ? t('publish.kindRequest') : t('publish.kindOffer')} text={k === 'request' ? t('publish.kindRequestHelp') : t('publish.kindOfferHelp')} />
              ))}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <AppText variant="h1">{t('publish.q2')}</AppText>
              <View style={{ gap: space.sm }}>
                {catalog.categories.map((c) => (
                  <Pressable key={c.id} accessibilityRole="radio" accessibilityState={{ checked: data.categoryId === c.id }} onPress={() => update({ categoryId: c.id, subcategoryId: null, customValues: {} })}
                    style={[styles.option, { flexDirection: 'row', alignItems: 'center', gap: space.md }, data.categoryId === c.id && styles.optionSelected]}>
                    <CategoryIcon icon={c.icon} color={c.color} size={40} />
                    <AppText style={{ fontWeight: '700', flex: 1 }}>{c.name}</AppText>
                  </Pressable>
                ))}
              </View>
              {category && category.subcategories.length ? (
                <View style={{ gap: space.sm }}>
                  <AppText variant="h3">{t('publish.subcategory')}</AppText>
                  <View style={styles.wrap}>{category.subcategories.map((s) => <Chip key={s.id} label={s.name} selected={data.subcategoryId === s.id} onPress={() => update({ subcategoryId: s.id })} />)}</View>
                  {err('subcategoryId') ? <AppText style={styles.error}>{err('subcategoryId')}</AppText> : null}
                </View>
              ) : null}
              {category?.warnings ? <Notice tone="warning">{category.warnings}</Notice> : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <AppText variant="h1">{t('publish.q3')}</AppText>
              <TextField label={t('publish.titleLabel')} help={`${t('publish.titleHelp')} ${t('publish.charCount', { count: (data.title ?? '').length, max: limits.listing.titleMax })}`}
                value={data.title ?? ''} onChangeText={(v) => update({ title: v })} maxLength={limits.listing.titleMax} error={err('title')} />
              <TextField label={t('publish.descriptionLabel')} help={`${t('publish.descriptionHelp')} ${t('publish.charCount', { count: (data.description ?? '').length, max: limits.listing.descriptionMax })}`}
                value={data.description ?? ''} onChangeText={(v) => update({ description: v })} multiline maxLength={limits.listing.descriptionMax} error={err('description')}
                style={{ minHeight: 160, textAlignVertical: 'top', paddingTop: space.md }} />
              <TextField label={`${t('publish.tagsLabel')} (${t('common.optional')})`} help={t('publish.tagsHelp')} value={tagsText}
                onChangeText={(v) => { setTagsText(v); update({ tags: v.split(',').map((s) => s.trim()).filter((s) => s.length >= 2).slice(0, limits.listing.tagsMax) }); }} />
              {contactFound ? <Notice tone="danger">{t('publish.contactWarning')}</Notice> : null}
              {category?.fields.length ? (
                <View style={[styles.option, { gap: space.md }]}>
                  <AppText variant="h3">{t('publish.extraFields')}</AppText>
                  {category.fields.map((f) => (
                    <CustomField key={f.key} field={f} value={data.customValues?.[f.key]} error={err(`customValues.${f.key}`)}
                      onChange={(v) => update({ customValues: { ...(data.customValues ?? {}), [f.key]: v } })} />
                  ))}
                </View>
              ) : null}
              <Notice title={t('publish.tipsTitle')}>
                <AppText>• {t('publish.tip1')}{'\n'}• {t('publish.tip2')}{'\n'}• {t('publish.tip3')}</AppText>
              </Notice>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <AppText variant="h1">{t('publish.q4')}</AppText>
              <AppText variant="h3">{t('publish.modalityLabel')}</AppText>
              <View style={styles.wrap}>{MODALITIES.map((m) => <Chip key={m} label={t(`modalities.${m}`)} selected={data.modality === m} onPress={() => update({ modality: m })} />)}</View>
              {err('modality') ? <AppText style={styles.error}>{err('modality')}</AppText> : null}
              <AppText variant="h3">{t('publish.municipalityLabel')}</AppText>
              {muni ? <Chip label={`${muni.name} ✕`} selected onPress={() => update({ municipalityId: undefined })} /> : (
                <>
                  <TextInput value={muniQuery} onChangeText={setMuniQuery} placeholder={t('publish.chooseOption')} placeholderTextColor={colors.inkMuted}
                    accessibilityLabel={t('publish.municipalityLabel')} style={styles.input} maxFontSizeMultiplier={2} />
                  {muniMatches.map((m) => (
                    <Pressable key={m.id} accessibilityRole="button" onPress={() => { update({ municipalityId: m.id }); setMuniQuery(''); }} style={styles.listItem}>
                      <AppText>{m.name} <AppText muted variant="small">({m.province})</AppText></AppText>
                    </Pressable>
                  ))}
                </>
              )}
              <AppText variant="small" muted>{t('publish.municipalityHelp')}</AppText>
              {err('municipalityId') ? <AppText style={styles.error}>{err('municipalityId')}</AppText> : null}
              {data.kind === 'offer' ? (
                <>
                  <AppText variant="h3">{t('publish.radiusLabel')}</AppText>
                  <View style={styles.wrap}>
                    <Chip label={t('publish.radiusNone')} selected={!data.radiusKm} onPress={() => update({ radiusKm: null })} />
                    {limits.search.radiusOptionsKm.map((km) => <Chip key={km} label={`${km} km`} selected={data.radiusKm === km} onPress={() => update({ radiusKm: km })} />)}
                  </View>
                </>
              ) : null}
            </>
          ) : null}

          {step === 5 ? (
            <>
              <AppText variant="h1">{t('publish.q5')}</AppText>
              <AppText variant="h3">{t('publish.dateLabel')}</AppText>
              <View style={styles.wrap}>
                <Chip label={data.desiredDate ?? t('publish.dateHelp')} selected={!!data.desiredDate} onPress={() => setShowDate(true)} />
                {data.desiredDate ? <Chip label="✕" selected={false} onPress={() => update({ desiredDate: null })} /> : null}
              </View>
              {showDate ? (
                <DateTimePicker value={data.desiredDate ? new Date(data.desiredDate) : new Date()} mode="date" minimumDate={new Date()}
                  onChange={(_, d) => { setShowDate(Platform.OS === 'ios'); if (d) update({ desiredDate: d.toISOString().slice(0, 10) }); }} />
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Switch value={data.isUrgent ?? false} onValueChange={(v) => update({ isUrgent: v })} accessibilityLabel={t('publish.urgentLabel')} trackColor={{ true: colors.primary, false: colors.border }} />
                <View style={{ flex: 1 }}><AppText style={{ fontWeight: '700' }}>{t('publish.urgentLabel')}</AppText><AppText variant="small" muted>{t('publish.urgentHelp')}</AppText></View>
              </View>
              <TextField label={`${t('publish.availabilityLabel')} (${t('common.optional')})`} help={t('publish.availabilityHelp')} value={data.availabilityNotes ?? ''} maxLength={300}
                onChangeText={(v) => update({ availabilityNotes: v || null })} />
            </>
          ) : null}

          {step === 6 ? (
            <>
              <AppText variant="h1">{t('publish.q6')}</AppText>
              <View style={styles.wrap}>
                {PRICE_TYPES.filter((p) => p !== 'exchange').map((p) => (
                  <Chip key={p} label={t(`priceTypes.${p}`)} selected={data.priceType === p} onPress={() => {
                    let cents: number | null = null;
                    if (PRICED_TYPES.includes(p)) { try { cents = parseEuros(amountText); } catch { cents = null; } }
                    update({ priceType: p, priceCents: cents });
                  }} />
                ))}
              </View>
              {err('priceType') ? <AppText style={styles.error}>{err('priceType')}</AppText> : null}
              {data.priceType && PRICED_TYPES.includes(data.priceType as 'fixed') ? (
                <TextField label={t('publish.amountLabel')} help={t('publish.amountHelp')} keyboardType="decimal-pad" value={amountText} error={err('priceCents')}
                  onChangeText={(v) => { setAmountText(v); let c: number | null = null; try { c = parseEuros(v); } catch { c = null; } update({ priceCents: c }); }} />
              ) : null}
            </>
          ) : null}

          {step === 7 ? (
            <>
              <AppText variant="h1">{t('publish.q7')}</AppText>
              {category && !category.allowPhotos ? <Notice>{t('publish.photosNotAllowed')}</Notice> : (
                <>
                  <AppText muted>{t('publish.photosHelp', { max: limits.listing.imagesMax })}</AppText>
                  <Notice tone="warning">{t('publish.photosWarning')}</Notice>
                  <View style={styles.wrap}>
                    {(data.images ?? []).map((img, i) => (
                      <View key={img.path} style={styles.thumb}>
                        <Image source={{ uri: storageUrl('listing-images', img.path) }} style={StyleSheet.absoluteFill} contentFit="cover" />
                        <Pressable accessibilityRole="button" accessibilityLabel={t('publish.removePhoto', { index: i + 1 })} onPress={() => removeImage(img)} style={styles.thumbDelete}>
                          <Trash2 size={20} color={colors.danger} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  <Button title={uploading ? t('publish.uploading') : t('publish.addPhoto')} loading={uploading} variant="outline" icon={<ImagePlus size={20} color={colors.primary} />} onPress={() => pickImages('library')} />
                  {Platform.OS !== 'web' ? <Button title="📷" accessibilityLabel={t('publish.addPhoto')} variant="ghost" onPress={() => pickImages('camera')} /> : null}
                </>
              )}
              {notice ? <Notice tone="danger">{notice}</Notice> : null}
            </>
          ) : null}

          {step === 8 ? (
            <>
              <AppText variant="h1">{t('publish.q8')}</AppText>
              <AppText muted>{t('publish.previewNote')}</AppText>
              <View style={[styles.option, { gap: space.sm }]}>
                {data.images?.[0] ? <Image source={{ uri: storageUrl('listing-images', data.images[0].path) }} style={{ aspectRatio: 16 / 9, borderRadius: radius.md }} contentFit="cover" /> : null}
                {data.kind ? <AppText variant="small" style={{ fontWeight: '700' }}>{t(`kinds.${data.kind}`)}{category ? ` · ${category.name}` : ''}</AppText> : null}
                <AppText variant="h2">{data.title}</AppText>
                <AppText variant="h2">{priceLabel}</AppText>
                {muni ? <AppText muted>{muni.name}{data.modality ? ` · ${t(`modalities.${data.modality as 'online'}`)}` : ''}</AppText> : null}
                <AppText>{data.description}</AppText>
              </View>
            </>
          ) : null}

          {step === 9 ? (
            <>
              <AppText variant="h1">{t('publish.q9')}</AppText>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
                <Switch value={confirmed} onValueChange={setConfirmed} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={t('publish.confirmRules').replace(/<\/?\w+>/g, '')} />
                <AppText style={{ flex: 1 }}>{t('publish.confirmRules').replace(/<\/?\w+>/g, '')}</AppText>
              </View>
              {err('confirm') ? <AppText style={styles.error}>{err('confirm')}</AppText> : null}
              {notice ? <Notice tone="danger">{notice}</Notice> : null}
            </>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          {step > 1 ? <Button title={t('publish.back')} variant="outline" onPress={() => go(step - 1)} style={{ flex: 1 }} /> : null}
          {step < TOTAL ? (
            <Button title={t('publish.next')} onPress={() => go(step + 1)} style={{ flex: 1 }} />
          ) : (
            <Button title={submitting ? t('publish.submitting') : t('publish.submit')} variant="accent" loading={submitting} disabled={!emailVerified} onPress={submit} style={{ flex: 1 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Option({ selected, onPress, title, text }: { selected: boolean; onPress: () => void; title: string; text: string }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.option, selected && styles.optionSelected]}>
      <AppText variant="h3">{title}</AppText>
      <AppText muted>{text}</AppText>
    </Pressable>
  );
}

function CustomField({ field, value, error, onChange }: { field: WizardCategory['fields'][number]; value: unknown; error: string | null; onChange: (v: unknown) => void }) {
  const t = useTranslations();
  const label = field.is_required ? field.label : `${field.label} (${t('common.optional')})`;
  if (field.field_type === 'boolean') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Switch value={value === true} onValueChange={onChange} accessibilityLabel={field.label} trackColor={{ true: colors.primary, false: colors.border }} />
        <AppText style={{ flex: 1, fontWeight: '700' }}>{field.label}</AppText>
      </View>
    );
  }
  if (field.field_type === 'select') {
    return (
      <View style={{ gap: space.sm }}>
        <AppText style={{ fontWeight: '700' }}>{label}</AppText>
        <View style={styles.wrap}>{(field.options ?? []).map((o) => <Chip key={o.value} label={field.optionLabels[o.value] ?? o.value} selected={value === o.value} onPress={() => onChange(o.value)} />)}</View>
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
      </View>
    );
  }
  return (
    <TextField label={label} value={value === undefined || value === null ? '' : String(value)} error={error}
      keyboardType={field.field_type === 'number' ? 'number-pad' : 'default'} multiline={field.field_type === 'textarea'}
      placeholder={field.field_type === 'date' ? 'AAAA-MM-DD' : undefined}
      onChangeText={(v) => onChange(field.field_type === 'number' ? (v === '' ? '' : Number(v)) : v)} />
  );
}

const styles = StyleSheet.create({
  progressWrap: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.xs },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  option: { padding: space.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  error: { color: colors.danger, fontWeight: '700' },
  input: { minHeight: MIN_TOUCH, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: space.md, fontSize: 17, color: colors.ink },
  listItem: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 104, height: 104, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  thumbDelete: { position: 'absolute', top: 4, right: 4, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
