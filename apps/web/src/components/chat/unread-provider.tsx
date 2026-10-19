'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const UnreadContext = createContext(0);

/**
 * Número de conversaciones con mensajes sin leer, en tiempo real.
 * Una sola suscripción compartida por la cabecera y la barra inferior.
 */
export function UnreadProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    const load = async () => {
      const { data } = await supabase.rpc('unread_conversations_count');
      if (active) setCount(data ?? 0);
    };
    void load();
    const channel = supabase
      .channel(`unread:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => void load())
      .subscribe();
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('ayudacerca:chat-read', onFocus);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('ayudacerca:chat-read', onFocus);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return <UnreadContext value={userId ? count : 0}>{children}</UnreadContext>;
}

export function useUnreadCount(): number {
  return useContext(UnreadContext);
}

/** Insignia numérica (máx. «9+»). El texto accesible lo pone quien la usa. */
export function UnreadDot({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span aria-hidden className={`animate-pop inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.7rem] font-bold leading-5 text-on-accent ${className}`}>
      {count > 9 ? '9+' : count}
    </span>
  );
}
