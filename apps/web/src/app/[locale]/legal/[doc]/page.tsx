import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert } from '@/components/ui/alert';
import { alternates } from '@/lib/seo';
import { createSupabasePublicClient } from '@/lib/supabase/server';

const DOCS = ['terms', 'privacy', 'cookies', 'legal_notice', 'community_rules', 'ranking', 'reviews', 'cancellations'] as const;

async function loadDocument(kind: string, locale: string) {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from('legal_documents')
    .select('title, body_md, version, locale, is_draft, published_at')
    .eq('kind', kind)
    .in('locale', [locale, 'es'])
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });
  return (data ?? []).find((d) => d.locale === locale) ?? (data ?? [])[0] ?? null;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/legal/[doc]'>): Promise<Metadata> {
  const { locale, doc } = await params;
  const document = (DOCS as readonly string[]).includes(doc) ? await loadDocument(doc, locale) : null;
  if (!document) return {};
  return { title: document.title, alternates: alternates(`/legal/${doc}`, locale), robots: document.is_draft ? { index: false } : undefined };
}

export default async function LegalPage({ params }: PageProps<'/[locale]/legal/[doc]'>) {
  const { locale, doc } = await params;
  setRequestLocale(locale as 'es');
  if (!(DOCS as readonly string[]).includes(doc)) notFound();
  const document = await loadDocument(doc, locale);
  if (!document) notFound();
  const t = await getTranslations('legal');

  return (
    <div className="container-page max-w-3xl py-10">
      {document.is_draft ? <Alert variant="warning" className="mb-6">{t('draftBanner')}</Alert> : null}
      {document.locale !== locale ? <Alert variant="info" className="mb-6">{t('notTranslated')}</Alert> : null}
      <article lang={document.locale} className="legal-prose">
        {/* react-markdown no renderiza HTML incrustado: el texto es seguro */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{document.body_md}</ReactMarkdown>
      </article>
      <p className="mt-8 text-sm text-ink-muted">v. {document.version}</p>
    </div>
  );
}
