'use client';

import { brand, chatMessageSchema, detectContactInfo, limits } from '@ayudacerca/core';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { Link, useRouter } from '@/i18n/navigation';
import { startConversationAction } from '@/server/actions/chat';

interface ContactButtonProps {
  listingId: string;
  listingSlug: string;
  authorName: string;
  signedIn: boolean;
  existingConversationId: string | null;
  size?: 'md' | 'lg';
  className?: string;
}

/** «Contactar»: abre la conversación sobre el anuncio con un primer mensaje. */
export function ContactButton({ listingId, listingSlug, authorName, signedIn, existingConversationId, size = 'lg', className }: ContactButtonProps) {
  const t = useTranslations('chat');
  const tListing = useTranslations('listing');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Button asChild size={size} className={className}>
        <Link href={`/entrar?volver=${encodeURIComponent(`/anuncios/${listingSlug}`)}`}><MessageCircle aria-hidden /> {tListing('contact')}</Link>
      </Button>
    );
  }
  if (existingConversationId) {
    return (
      <Button asChild size={size} className={className}>
        <Link href={`/mensajes/${existingConversationId}`}><MessageCircle aria-hidden /> {t('openConversation')}</Link>
      </Button>
    );
  }

  const warning = body.length > 6 && detectContactInfo(body).found;

  function send() {
    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      setError(t('errors.chat_empty'));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await startConversationAction({ listingId, body: parsed.data });
      if (result.ok) {
        router.push(`/mensajes/${result.data.id}`);
        return;
      }
      if (result.error.code === 'chat') setError(t(`errors.${result.error.chat}`, { brand: brand.name }));
      else if (result.error.code === 'unauthenticated') router.push(`/entrar?volver=${encodeURIComponent(`/anuncios/${listingSlug}`)}`);
      else setError(tErrors(result.error.code));
    });
  }

  return (
    <>
      <Button size={size} className={className} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <MessageCircle aria-hidden /> {tListing('contact')}
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t('contactTitle', { name: authorName })}
        description={t('contactIntro')}
        side="bottom"
        closeLabel={tCommon('close')}
        footer={
          <Button className="w-full" size="lg" disabled={pending} onClick={send}>
            <MessageCircle aria-hidden /> {t('startCta')}
          </Button>
        }
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
          <label htmlFor="first-message" className="font-semibold">{t('messageLabel')}</label>
          <Textarea
            id="first-message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('firstMessagePlaceholder')}
            maxLength={limits.chat.messageMax}
            rows={5}
            autoFocus
            aria-describedby="first-message-help"
          />
          <p id="first-message-help" className="text-sm text-ink-muted">{t('safetyNote')}</p>
          {warning ? <Alert variant="warning">{t('contactWarning')}</Alert> : null}
          {error ? <Alert variant="danger" live>{error}</Alert> : null}
        </div>
      </Sheet>
    </>
  );
}
