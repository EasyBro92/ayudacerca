import { brand } from '@ayudacerca/core';
import { getLocale, getTranslations } from 'next-intl/server';
import { Logo } from '@/components/layout/logo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { CookiePreferencesLink } from '@/components/layout/cookie-banner';
import { Link } from '@/i18n/navigation';
import { getCategories } from '@/server/data/catalog';

export async function SiteFooter() {
  const locale = await getLocale();
  const [t, categories] = await Promise.all([getTranslations('footer'), getCategories(locale)]);
  const link = 'rounded-sm py-1 text-ink-muted hover:text-ink hover:underline';

  return (
    <footer className="mt-16 border-t border-border bg-surface pb-24 md:pb-8">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-1">
          <Logo />
          <p className="text-ink-muted">{t('tagline')}</p>
          <LanguageSwitcher />
        </div>
        <nav aria-labelledby="footer-categories">
          <h2 id="footer-categories" className="mb-3 text-base font-bold">{t('categories')}</h2>
          <ul className="flex flex-col">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}><Link className={link} href={`/categorias/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-info">
          <h2 id="footer-info" className="mb-3 text-base font-bold">{t('info')}</h2>
          <ul className="flex flex-col">
            <li><Link className={link} href="/como-funciona">{t('howItWorks')}</Link></li>
            <li><Link className={link} href="/ofrecer-ayuda">{t('about')}</Link></li>
            <li><Link className={link} href="/seguridad">{t('safety')}</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className="mb-3 text-base font-bold">{t('help')}</h2>
          <ul className="flex flex-col">
            <li><Link className={link} href="/seguridad">{t('helpCenter')}</Link></li>
            <li><a className={link} href={`mailto:${brand.supportEmail}`}>{t('contact')}</a></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-legal">
          <h2 id="footer-legal" className="mb-3 text-base font-bold">{t('legal')}</h2>
          <ul className="flex flex-col">
            <li><Link className={link} href="/legal/terms">{t('terms')}</Link></li>
            <li><Link className={link} href="/legal/privacy">{t('privacy')}</Link></li>
            <li><Link className={link} href="/legal/cookies">{t('cookies')}</Link></li>
            <li><Link className={link} href="/legal/legal_notice">{t('legalNotice')}</Link></li>
            <li><Link className={link} href="/legal/community_rules">{t('communityRules')}</Link></li>
            <li><Link className={link} href="/legal/ranking">{t('ranking')}</Link></li>
            <li><Link className={link} href="/legal/reviews">{t('reviews')}</Link></li>
            <li><Link className={link} href="/legal/cancellations">{t('cancellations')}</Link></li>
            <li><CookiePreferencesLink className={link} /></li>
          </ul>
        </nav>
      </div>
      <div className="container-page border-t border-border pt-6 text-sm text-ink-muted">
        {t('rights', { year: new Date().getFullYear(), brand: brand.name })}
      </div>
    </footer>
  );
}
