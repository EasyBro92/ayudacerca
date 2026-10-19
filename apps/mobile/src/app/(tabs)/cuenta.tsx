import { brand } from '@ayudacerca/core';
import { LOCALE_NAMES, LOCALES } from '@ayudacerca/core/i18n';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFormatter, useLocale, useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { ListingCard } from '@/components/listing-card';
import { Screen } from '@/components/screen';
import { AppText, Button, Card, Chip, Notice } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { confirmAction } from '@/lib/confirm';
import { type ListingCardData, getFavoriteListings } from '@/lib/data';
import { webUrl } from '@/lib/env';
import { useAppLocale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { MIN_TOUCH, colors, space } from '@/lib/theme';

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
      <Screen>
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
    <Screen onRefresh={load}>
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

      <AppText variant="h2">{t('account.favorites')}</AppText>
      {favorites.length === 0 ? <AppText muted>{t('account.noFavorites')}</AppText> : favorites.map((l) => <ListingCard key={l.id} listing={l} />)}

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
