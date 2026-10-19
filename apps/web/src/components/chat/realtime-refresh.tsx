'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/** Vuelve a pintar la página del servidor cuando cambian mis conversaciones. */
export function RealtimeRefresh({ channel }: { channel: string }) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = supabase
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => router.refresh(), 250);
      })
      .subscribe();
    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(sub);
    };
  }, [channel, router]);
  return null;
}
