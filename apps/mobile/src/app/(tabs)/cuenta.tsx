import { brand, limits, profileUpdateSchema } from '@ayudacerca/core';
import { LOCALE_NAMES, LOCALES } from '@ayudacerca/core/i18n';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFormatter, useLocale, useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { OnlineDot, SkillChips } from '@/components/helpers';
import { ListingRow } from '@/components/listing-row';
import { FadeInItem } from '@/components/motion';
import { Screen } from '@/components/screen';
import { AppText, Button, Card, Chip, Notice, TextField } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { confirmAction } from '@/lib/confirm';
import { type ListingCardData, getFavoriteListings, isAvailableNow, parseSkills, updateMyHelperProfile, updateMyProfile } from '@/lib/data';
import { haptics } from '@/lib/haptics';
import { webUrl } from '@/lib/env';
import { useAppLocale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { MIN_TOUCH, colors, soft, space, webTabInset } from '@/lib/theme';

const LEGAL = [['terms', 'terms'], ['privacy', 'privacy'], ['cookies', 'cookies'], ['communityRules', 'community_rules'], ['legalNotice', 'legal_notice']] as const;

export default function AccountScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();
  const { setLocale } = useAppLocale();
  const { session, profile, signOut, refreshProfile } = useAuth();
  const [favorites, setFavorites] = useState<ListingCardData[]>([]);
  const [deletion, setDeletion] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [nonce, setNonce] = useState(0);
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getFavoriteListings(userId, locale).then((f) => { if (!cancelled) setFavorites(f); }, () => undefined);
    supabase.from('account_deletion_requests').select('scheduled_for').eq('status', 'pending').maybeSingle()
      .then(({ data }) => { if (!cancelled) setDeletion(data?.scheduled_for ?? null); });
    return () => { cancelled = true; };
  }, [userId, locale, nonce]);
  const load = () => setNonce((n) => n + 1);

  async function confirmDelete() {
    const ok = await confirmAction(t('account.deleteConfirmTitle'), t('account.deleteText'), t('account.deleteConfirm'), t('common.cancel'));
    if (!ok) return;
    setBusy(true);
    const { data } = await supabase.rpc('request_account_deletion');
    setDeletion(data ?? null);
    await refreshProfile();
    setBusy(false);
  }

  async function cancelDelete() {
    setBusy(true);
    await supabase.rpc('cancel_account_deletion');
    setDeletion(null);
    await refreshProfile();
    setBusy(false);
  }

  const legalLinks = (
    <Card style={{ padding: space.lg, gap: space.xs }}>
      <AppText variant="h3">{t('account.legalTitle')}</AppText>
      {LEGAL.map(([label, doc]) => (
        <Pressable key={doc} accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(webUrl(`/legal/${doc}`, locale))} style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}>
          <AppText style={{ color: colors.primary, fontWeight: '700' }}>{t(`footer.${label}`)}</AppText>
        </Pressable>
      ))}
    </Card>
  );
  const languagePicker = (
    <Card style={{ padding: space.lg, gap: space.sm }}>
      <AppText variant="h3">{t('account.language')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {LOCALES.map((l) => <Chip key={l} label={LOCALE_NAMES[l]} selected={locale === l} onPress={() => setLocale(l)} />)}
      </View>
    </Card>
  );
  const version = <AppText variant="caption" muted style={{ textAlign: 'center' }}>{t('account.version', { version: Constants.expoConfig?.version ?? '' })}</AppText>;

  if (!session || !profile) {
    return (
      <Screen contentStyle={{ paddingTop: space.lg + webTabInset }}>
        <AppText variant="h1">{t('account.welcomeTitle', { brand: brand.name })}</AppText>
        <AppText muted>{t('account.welcomeText')}</AppText>
        <Button title={t('auth.signInTitle')} onPress={() => router.push('/entrar')} />
        <Button title={t('auth.signUpTitle')} variant="outline" onPress={() => router.push('/registro')} />
        {languagePicker}
        {legalLinks}
        {version}
      </Screen>
    );
  }

  return (
    <Screen onRefresh={load} contentStyle={{ paddingTop: space.lg + webTabInset }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Avatar name={profile.display_name} path={profile.avatar_path} size={64} />
        <View style={{ flex: 1 }}>
          <AppText variant="h2">{t('account.hello', { name: profile.display_name })}</AppText>
          <AppText muted variant="small">{session.user.email}</AppText>
        </View>
      </View>
      {!profile.email_verified ? <Notice tone="warning">{t('account.emailPending')}</Notice> : null}
      {deletion ? (
        <Notice tone="danger" title={t('account.deleteTitle')}>
          <AppText>{t('account.deletePending', { date: format.dateTime(new Date(deletion), { dateStyle: 'long' }) })}</AppText>
          <Button title={t('account.cancelDeletion')} variant="outline" loading={busy} onPress={cancelDelete} style={{ marginTop: space.sm }} />
        </Notice>
      ) : null}

      <ProfileCard key={`p-${profile.id}`} userId={profile.id} displayName={profile.display_name} bio={profile.bio ?? null} onSaved={refreshProfile} />

      <HelperCard key={profile.id} userId={profile.id} availableUntil={profile.available_until} skills={profile.skills} onSaved={refreshProfile} />

      <AppText variant="h2">{t('account.favorites')}</AppText>
      {favorites.length === 0 ? <AppText muted>{t('account.noFavorites')}</AppText> : favorites.map((l, i) => <FadeInItem key={l.id} index={i}><ListingRow listing={l} /></FadeInItem>)}

      {languagePicker}
      {legalLinks}
      <Button title={t('nav.signOut')} variant="outline" onPress={signOut} />
      {!deletion ? (
        <Card style={{ padding: space.lg, gap: space.sm, borderColor: colors.danger }}>
          <AppText variant="h3">{t('account.deleteTitle')}</AppText>
          <AppText muted variant="small">{t('account.deleteText')}</AppText>
          <Button title={t('account.deleteTitle')} variant="danger" loading={busy} onPress={confirmDelete} />
        </Card>
      ) : null}
      {version}
    </Screen>
  );
}

/** «¿Puedes ayudar ahora?» (disponible unas horas, se apaga sola) y «Lo que se te da bien». */
function ProfileCard({ userId, displayName, bio, onSaved }: { userId: string; displayName: string; bio: string | null; onSaved: () => Promise<void> }) {
  const t = useTranslations('account');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const [name, setName] = useState(displayName);
  const [about, setAbout] = useState(bio ?? '');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; bio?: string }>({});
  const [message, setMessage] = useState<{ tone: 'success' | 'info' | 'danger'; text: string } | null>(null);

  async function save() {
    setMessage(null);
    const parsed = profileUpdateSchema.safeParse({ displayName: name, bio: about });
    if (!parsed.success) {
      const out: { displayName?: string; bio?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'displayName' | 'bio';
        out[key] ??= tValidation(issue.message as 'nameTooShort');
      }
      setErrors(out);
      haptics.error();
      return;
    }
    setErrors({});
    if (parsed.data.displayName === displayName && parsed.data.bio === (bio ?? null)) {
      setMessage({ tone: 'info', text: t('noChanges') });
      return;
    }
    setBusy(true);
    try {
      await updateMyProfile(userId, { display_name: parsed.data.displayName, bio: parsed.data.bio });
      setName(parsed.data.displayName);
      setMessage({ tone: 'success', text: t('profileSaved') });
      haptics.success();
      void onSaved();
    } catch {
      setMessage({ tone: 'danger', text: tErrors('unavailable') });
      haptics.error();
    }
    setBusy(false);
  }

  return (
    <Card style={{ padding: space.lg, gap: space.sm }}>
      <AppText variant="h3">{t('editTitle')}</AppText>
      <AppText variant="small" muted>{t('editText')}</AppText>
      <TextField label={t('displayName')} help={t('displayNameHelp')} value={name} onChangeText={setName} maxLength={limits.profile.displayNameMax} autoComplete="nickname" error={errors.displayName ?? null} />
      <TextField label={t('bio')} help={t('bioHelp')} value={about} onChangeText={setAbout} maxLength={limits.profile.bioMax} multiline style={{ minHeight: 96, textAlignVertical: 'top' }} error={errors.bio ?? null} />
      <Button title={busy ? tCommon('loading') : t('saveProfile')} loading={busy} onPress={() => void save()} />
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
    </Card>
  );
}

function HelperCard({ userId, availableUntil, skills, onSaved }: { userId: string; availableUntil: string | null; skills: string[]; onSaved: () => Promise<void> }) {
  const t = useTranslations('account');
  const format = useFormatter();
  const [until, setUntil] = useState(availableUntil);
  const [busy, setBusy] = useState(false);
  const [skillsText, setSkillsText] = useState(skills.join(', '));
  const [saved, setSaved] = useState<string[]>(skills);
  const [savingSkills, setSavingSkills] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const available = isAvailableNow(until);

  async function toggle(on: boolean) {
    setBusy(true);
    setMessage(null);
    const next = on ? new Date(Date.now() + limits.profile.availableHours * 3_600_000).toISOString() : null;
    try {
      await updateMyHelperProfile(userId, { available_until: next });
      setUntil(next);
      haptics.success();
      void onSaved();
    } catch {
      setMessage({ tone: 'danger', text: tErrors('unavailable') });
    }
    setBusy(false);
  }

  async function saveSkills() {
    const list = parseSkills(skillsText);
    setSavingSkills(true);
    setMessage(null);
    try {
      await updateMyHelperProfile(userId, { skills: list });
      setSaved(list);
      setSkillsText(list.join(', '));
      setMessage({ tone: 'success', text: t('skillsSaved') });
      haptics.success();
      void onSaved();
    } catch {
      setMessage({ tone: 'danger', text: tErrors('unavailable') });
    }
    setSavingSkills(false);
  }

  return (
    <View style={styles.helper}>
      <View style={styles.availableRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="h3">{t('availableTitle')}</AppText>
          <AppText variant="small">{t('availableText', { hours: limits.profile.availableHours })}</AppText>
        </View>
      </View>
      {available && until ? (
        <View style={styles.until} accessibilityLiveRegion="polite">
          <OnlineDot />
          <AppText style={{ fontWeight: '700', color: colors.success, flex: 1 }}>{t('availableUntil', { time: format.dateTime(new Date(until), { hour: '2-digit', minute: '2-digit' }) })}</AppText>
        </View>
      ) : null}
      <Button
        title={available ? t('availableOff') : t('availableOn')}
        variant={available ? 'outline' : 'primary'}
        loading={busy}
        onPress={() => void toggle(!available)}
      />

      <View style={styles.divider} />
      <TextField
        label={t('skillsTitle')}
        help={t('skillsText')}
        value={skillsText}
        onChangeText={(v) => { setSkillsText(v); setMessage(null); }}
        autoCapitalize="none"
        accessibilityHint={t('skillsText')}
      />
      <SkillChips skills={saved} max={limits.profile.skillsMax} />
      <Button title={savingSkills ? tCommon('loading') : t('skillsSave')} variant="outline" loading={savingSkills} onPress={() => void saveSkills()} />
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  helper: { gap: space.md, padding: space.xl, backgroundColor: colors.primarySoft, borderRadius: soft.block },
  availableRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  until: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, backgroundColor: colors.surface, borderRadius: soft.control },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.xs },
});
