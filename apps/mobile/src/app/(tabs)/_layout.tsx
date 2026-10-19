import { NativeTabs } from 'expo-router/native-tabs';
import { useTranslations } from 'use-intl';
import { colors } from '@/lib/theme';
import { useUnread } from '@/lib/unread';

/** Pestañas nativas: barra de iOS (SF Symbols) y de Android (Material). */
export default function TabsLayout() {
  const t = useTranslations('nav');
  const { count } = useUnread();
  return (
    <NativeTabs
      backgroundColor={colors.surface}
      iconColor={{ default: colors.inkMuted, selected: colors.primary }}
      labelStyle={{ selected: { color: colors.primary } }}
      badgeBackgroundColor={colors.accent}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explorar">
        <NativeTabs.Trigger.Label>{t('explore')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="publicar">
        <NativeTabs.Trigger.Label>{t('publish')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} md="add_circle" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mensajes">
        <NativeTabs.Trigger.Label>{t('messages')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} md="chat" />
        {/* Con «hidden» y un texto la insignia seguiría visible: solo se pinta si hay algo sin leer */}
        {count > 0 ? <NativeTabs.Trigger.Badge>{count > 99 ? '99+' : String(count)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cuenta">
        <NativeTabs.Trigger.Label>{t('account')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
