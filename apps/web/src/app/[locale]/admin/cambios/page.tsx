import { ArrowRight, History } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { localizedPath } from '@/lib/seo';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isStaff, requireUser } from '@/server/auth/session';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const PAGE = 50;
const KNOWN_FIELDS = new Set(['display_name', 'username', 'bio', 'avatar_path', 'municipality_id', 'account_type', 'languages', 'skills', 'status', 'first_name', 'last_name', 'phone', 'postal_code']);

export default async function ProfileChangesPage({ params, searchParams }: PageProps<'/[locale]/admin/cambios'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 80) : '';
  const page = Math.max(1, Math.min(200, Number(typeof sp.pagina === 'string' ? sp.pagina : 1) || 1));
  await requireUser(locale, '/admin/cambios');
  // Solo moderación y administración; al resto le respondemos como si no existiera
  if (!(await isStaff())) notFound();

  const supabase = await createSupabaseServerClient();
  const [t, format, { data }] = await Promise.all([
    getTranslations('admin'), getFormatter(),
    supabase.rpc('admin_profile_changes', { p_limit: PAGE + 1, p_offset: (page - 1) * PAGE, ...(q ? { p_query: q } : {}) }),
  ]);
  const rows = (data ?? []).slice(0, PAGE);
  const hasMore = (data ?? []).length > PAGE;
  const href = (p: number) => `/admin/cambios?${new URLSearchParams({ ...(q ? { q } : {}), pagina: String(p) })}`;
  const value = (v: string | null) => (v === null || v === '' ? <span className="italic text-ink-muted">{t('empty')}</span> : <span className="whitespace-pre-wrap break-words">{v}</span>);

  return (
    <div className="container-page py-8">
      <p className="text-sm font-semibold text-ink-muted">{t('title')}</p>
      <h1 className="flex items-center gap-2 text-3xl"><History aria-hidden className="size-7 text-primary" />{t('changesTitle')}</h1>
      <p className="mt-1 max-w-3xl text-ink-muted">{t('changesIntro')}</p>

      <form action={localizedPath('/admin/cambios', locale)} method="get" role="search" className="mt-5 flex max-w-2xl gap-2">
        <label htmlFor="q" className="sr-only">{t('search')}</label>
        <Input id="q" name="q" type="search" defaultValue={q} placeholder={t('search')} className="rounded-full" />
        <Button type="submit" className="rounded-full">{t('searchButton')}</Button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-[var(--radius-xl)] bg-surface p-6 text-ink-muted">{t('noResults')}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th scope="col" className="p-3 font-semibold">{t('when')}</th>
                <th scope="col" className="p-3 font-semibold">{t('person')}</th>
                <th scope="col" className="p-3 font-semibold">{t('field')}</th>
                <th scope="col" className="p-3 font-semibold">{t('before')}</th>
                <th scope="col" className="p-3 font-semibold"><span className="sr-only">→</span></th>
                <th scope="col" className="p-3 font-semibold">{t('after')}</th>
                <th scope="col" className="p-3 font-semibold">{t('by')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="whitespace-nowrap p-3"><time dateTime={r.created_at}>{format.dateTime(new Date(r.created_at), { dateStyle: 'short', timeStyle: 'short' })}</time></td>
                  <td className="p-3">
                    {r.profile_username ? <Link href={`/personas/${r.profile_username}`} className="font-semibold text-primary hover:underline">{r.profile_display_name}</Link> : <span className="italic">{t('deletedAccount')}</span>}
                  </td>
                  <td className="p-3 font-semibold">{KNOWN_FIELDS.has(r.field) ? t(`fields.${r.field}` as 'fields.bio') : r.field}</td>
                  <td className="max-w-xs p-3 text-ink-muted line-through decoration-danger/60">{value(r.old_value)}</td>
                  <td className="p-3" aria-hidden><ArrowRight className="size-4 text-ink-muted" /></td>
                  <td className="max-w-xs p-3 font-semibold">{value(r.new_value)}</td>
                  <td className="p-3">{r.changed_by_self ? t('self') : r.changed_by_display_name ?? t('system')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav aria-label={t('changesTitle')} className="mt-4 flex justify-between gap-3">
        {page > 1 ? <Button asChild variant="outline" className="rounded-full"><Link href={href(page - 1)}>{t('newer')}</Link></Button> : <span />}
        {hasMore ? <Button asChild variant="outline" className="rounded-full"><Link href={href(page + 1)}>{t('older')}</Link></Button> : null}
      </nav>
    </div>
  );
}
