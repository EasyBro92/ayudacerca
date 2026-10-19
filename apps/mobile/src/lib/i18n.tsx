import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Locale, isLocale, messages, pickLocale } from '@ayudacerca/core/i18n';
import { getLocales } from 'expo-localization';
import { type ReactNode, createContext, use, useEffect, useState } from 'react';
import { IntlProvider } from 'use-intl';

const STORAGE_KEY = 'app.locale';

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({ locale: 'es', setLocale: () => undefined });

/** Idioma del dispositivo (es/ca/en) con posibilidad de cambiarlo dentro de la app. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => pickLocale(getLocales().map((l) => l.languageTag)));

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => { if (isLocale(saved)) setLocaleState(saved); }).catch(() => undefined);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    void AsyncStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LocaleContext value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Europe/Madrid"
        onError={() => undefined}
        getMessageFallback={({ key }) => key}
      >
        {children}
      </IntlProvider>
    </LocaleContext>
  );
}

export function useAppLocale() {
  return use(LocaleContext);
}
