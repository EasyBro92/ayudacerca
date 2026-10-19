'use client';

import { brand, type ChatErrorCode, chatErrorCode, chatMessageSchema, conversationReportReasons, dayKey, detectContactInfo, isSameGroup, limits } from '@ayudacerca/core';
import { ArrowLeft, Ban, ExternalLink, Flag, MoreVertical, RotateCcw, SendHorizontal } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { DropdownMenu } from 'radix-ui';
import { type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { Avatar } from '@/components/common/avatar';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { NativeSelect, Textarea } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { Link, useRouter } from '@/i18n/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { reportConversationAction, setBlockAction } from '@/server/actions/chat';

export interface ThreadMessage {
  id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
  /** Solo en mensajes propios aún no confirmados */
  status?: 'sending' | 'failed';
}

interface ChatThreadProps {
  conversationId: string;
  me: string;
  other: { id: string; username: string; displayName: string; avatarPath: string | null } | null;
  listing: { title: string; slug: string | null };
  initialMessages: ThreadMessage[];
  initialHasMore: boolean;
  initiallyBlocked: boolean;
}

function mergeMessages(list: ThreadMessage[], incoming: ThreadMessage[]): ThreadMessage[] {
  const byId = new Map(list.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function ChatThread({ conversationId, me, other, listing, initialMessages, initialHasMore, initiallyBlocked }: ChatThreadProps) {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const format = useFormatter();
  const router = useRouter();
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const otherName = other?.displayName ?? t('deletedUser');

  const markRead = useCallback(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId }).then(() => {
      window.dispatchEvent(new Event('ayudacerca:chat-read'));
    });
  }, [conversationId]);

  // Tiempo real: mensajes nuevos de esta conversación
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    markRead();
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as ThreadMessage;
          setMessages((list) => mergeMessages(list, [{ id: m.id, sender_id: m.sender_id, body: m.body, created_at: m.created_at }]));
          if (m.sender_id !== me) markRead();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, me, markRead]);

  // Mantener la vista abajo cuando llegan mensajes (si ya estaba abajo)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function onScroll() {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  async function loadOlder() {
    const oldest = messages.find((m) => !m.status);
    if (!oldest) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, body, created_at')
      .eq('conversation_id', conversationId)
      .lt('created_at', oldest.created_at)
      .order('created_at', { ascending: false })
      .limit(limits.chat.pageSize + 1);
    const rows = data ?? [];
    stickToBottom.current = false;
    setHasMore(rows.length > limits.chat.pageSize);
    setMessages((list) => mergeMessages(list, rows.slice(0, limits.chat.pageSize)));
    setLoadingOlder(false);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  }

  function errorText(code: ChatErrorCode) {
    return t(`errors.${code}`, { brand: brand.name });
  }

  async function deliver(tempId: string, body: string) {
    const supabase = createSupabaseBrowserClient();
    const { data, error: insertError } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, body })
      .select('id, sender_id, body, created_at')
      .single();
    if (insertError || !data) {
      const code = chatErrorCode(insertError);
      setMessages((list) => list.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)));
      setError(errorText(code));
      return;
    }
    setMessages((list) => mergeMessages(list.filter((m) => m.id !== tempId), [data]));
  }

  function send() {
    const parsed = chatMessageSchema.safeParse(draft);
    if (!parsed.success) return;
    setError(null);
    const tempId = `tmp-${crypto.randomUUID()}`;
    stickToBottom.current = true;
    setMessages((list) => [...list, { id: tempId, sender_id: me, body: parsed.data, created_at: new Date().toISOString(), status: 'sending' }]);
    setDraft('');
    void deliver(tempId, parsed.data);
  }

  function retry(m: ThreadMessage) {
    setError(null);
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, status: 'sending' } : x)));
    void deliver(m.id, m.body);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // En escritorio, Intro envía y Mayús+Intro hace salto de línea
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia('(pointer: fine)').matches) {
      e.preventDefault();
      send();
    }
  }

  function toggleBlock() {
    if (!other) return;
    startTransition(async () => {
      const result = await setBlockAction({ userId: other.id, blocked: !blocked });
      if (result.ok) {
        setBlocked(result.data.blocked);
        setBlockOpen(false);
        router.refresh();
      } else setError(tErrors(result.error.code));
    });
  }

  function submitReport(form: FormData) {
    startTransition(async () => {
      const result = await reportConversationAction({ conversationId, reason: form.get('reason'), details: form.get('details')?.toString() });
      if (result.ok) setReportResult(result.data.status === 'created' ? t('reportDone') : t('reportAlready'));
      else setReportResult(tErrors(result.error.code));
    });
  }

  const contactWarning = draft.length > 6 && detectContactInfo(draft).found;
  const canWrite = Boolean(other) && !blocked;

  return (
    <div className="chat-shell flex flex-col bg-surface md:rounded-[var(--radius-xl)] md:border md:border-border md:shadow-[var(--shadow-raised)]">
      {/* Cabecera */}
      <header className="flex items-center gap-3 border-b border-border px-3 py-2.5">
        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href="/mensajes" aria-label={t('back')}><ArrowLeft aria-hidden /></Link>
        </Button>
        <Avatar name={otherName} path={other?.avatarPath ?? null} size={40} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-tight">
            {other ? <Link href={`/personas/${other.username}`} className="hover:underline">{otherName}</Link> : otherName}
          </h2>
          {listing.slug ? (
            <Link href={`/anuncios/${listing.slug}`} className="flex items-center gap-1 truncate text-sm text-primary hover:underline">
              <span className="truncate">{t('about', { title: listing.title })}</span>
              <ExternalLink aria-hidden className="size-3.5 shrink-0" />
            </Link>
          ) : (
            <p className="truncate text-sm text-ink-muted">{t('about', { title: listing.title })}</p>
          )}
        </div>
        {other ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('moreActions')}><MoreVertical aria-hidden /></Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={6} className="animate-pop z-50 min-w-48 rounded-[var(--radius-md)] border border-border bg-surface p-1 shadow-[var(--shadow-raised)]">
                <DropdownMenu.Item onSelect={() => setBlockOpen(true)} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 font-semibold outline-none data-[highlighted]:bg-surface-muted">
                  <Ban aria-hidden className="size-5" /> {blocked ? t('unblock') : t('block')}
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => { setReportResult(null); setReportOpen(true); }} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 font-semibold text-danger outline-none data-[highlighted]:bg-surface-muted">
                  <Flag aria-hidden className="size-5" /> {t('report')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null}
      </header>

      {/* Mensajes */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5">
        {hasMore ? (
          <div className="mb-4 flex justify-center">
            <Button variant="secondary" size="sm" onClick={() => void loadOlder()} disabled={loadingOlder}>{t('loadOlder')}</Button>
          </div>
        ) : null}
        <p className="mx-auto mb-4 max-w-md rounded-[var(--radius-md)] bg-primary-soft px-3 py-2 text-center text-sm text-primary-strong">{t('safetyNote')}</p>
        <div role="log" aria-live="polite" aria-label={t('messagesLog')}>
        <ol className="flex flex-col">
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const mine = m.sender_id === me;
            const grouped = isSameGroup(prev, m);
            const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
            const time = format.dateTime(new Date(m.created_at), { hour: '2-digit', minute: '2-digit' });
            return (
              <li key={m.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start', grouped ? 'mt-0.5' : 'mt-3')}>
                {newDay ? (
                  <p className="my-3 self-center rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-ink-muted">
                    {format.dateTime(new Date(m.created_at), { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                ) : null}
                <div
                  className={cn(
                    'animate-bubble max-w-[85%] whitespace-pre-wrap break-words px-3.5 py-2 text-[0.975rem] leading-snug sm:max-w-[70%]',
                    mine ? 'origin-bottom-right rounded-2xl rounded-br-md bg-primary text-on-primary' : 'origin-bottom-left rounded-2xl rounded-bl-md bg-surface-muted text-ink',
                    m.status === 'sending' && 'opacity-70',
                    m.status === 'failed' && 'bg-danger-soft text-danger',
                  )}
                >
                  <span className="sr-only">{mine ? t('you') : otherName}: </span>
                  {m.body}
                  <span className={cn('ml-2 inline-block translate-y-0.5 text-[0.7rem]', mine && !m.status ? 'text-on-primary' : 'text-ink-muted')}>
                    <span className="sr-only">{t('sentAt', { time })}</span>
                    <span aria-hidden>{time}</span>
                  </span>
                </div>
                {m.status === 'failed' ? (
                  <button type="button" onClick={() => retry(m)} className="mt-1 flex items-center gap-1 text-sm font-semibold text-danger underline">
                    <RotateCcw aria-hidden className="size-4" /> {tCommon('retry')}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ol>
        </div>
      </div>

      {/* Escribir */}
      <div className="safe-bottom border-t border-border bg-surface px-3 pt-2">
        {error ? <Alert variant="danger" live className="mb-2">{error}</Alert> : null}
        {blocked ? <Alert className="mb-2">{t('blocked')}</Alert> : null}
        {!other ? <Alert className="mb-2">{t('errors.chat_closed', { brand: brand.name })}</Alert> : null}
        {contactWarning ? <Alert variant="warning" className="mb-2">{t('contactWarning')}</Alert> : null}
        {canWrite ? (
          <form
            className="flex items-end gap-2 pb-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">{t('messageLabel')}</label>
            <Textarea
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('placeholder')}
              maxLength={limits.chat.messageMax}
              rows={1}
              enterKeyHint="send"
              className="max-h-36 min-h-12 flex-1 resize-none rounded-3xl py-3 [field-sizing:content]"
            />
            <Button type="submit" size="icon" className="size-12 shrink-0 rounded-full" disabled={!draft.trim()} aria-label={t('send')}>
              <SendHorizontal aria-hidden />
            </Button>
          </form>
        ) : null}
      </div>

      {other ? (
        <Sheet
          open={blockOpen}
          onOpenChange={setBlockOpen}
          title={blocked ? t('unblock') : t('blockTitle', { name: otherName })}
          description={blocked ? undefined : t('blockText')}
          side="center"
          closeLabel={tCommon('close')}
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setBlockOpen(false)}>{tCommon('cancel')}</Button>
              <Button variant={blocked ? 'primary' : 'danger'} disabled={pending} onClick={toggleBlock}>{blocked ? t('unblock') : t('blockConfirm')}</Button>
            </div>
          }
        >
          {null}
        </Sheet>
      ) : null}

      <Sheet open={reportOpen} onOpenChange={setReportOpen} title={t('reportTitle')} description={t('reportIntro')} side="center" closeLabel={tCommon('close')}>
        {reportResult ? (
          <Alert variant="success" live>{reportResult}</Alert>
        ) : (
          <form action={submitReport} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="chat-report-reason" className="font-semibold">{t('report')}</label>
              <NativeSelect id="chat-report-reason" name="reason" defaultValue="" required>
                <option value="" disabled>—</option>
                {conversationReportReasons.map((r) => <option key={r} value={r}>{t(`reasons.${r}`)}</option>)}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="chat-report-details" className="font-semibold">{tCommon('optional')}</label>
              <Textarea id="chat-report-details" name="details" maxLength={2000} />
            </div>
            <Button type="submit" variant="danger" disabled={pending}>{t('report')}</Button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
