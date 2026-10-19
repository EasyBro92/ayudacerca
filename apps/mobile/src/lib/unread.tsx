import { type ReactNode, createContext, use, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './auth';
import { subscribeToConversations, unreadConversationsCount } from './chat';

const UnreadContext = createContext<{ count: number; refresh: () => void }>({ count: 0, refresh: () => undefined });

/** Número de conversaciones con mensajes sin leer (insignia de la pestaña «Mensajes»), al día en tiempo real. */
export function UnreadProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [state, setState] = useState<{ userId: string | null; count: number }>({ userId: null, count: 0 });
  const [nonce, setNonce] = useState(0);
  const refresh = () => setNonce((n) => n + 1);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    unreadConversationsCount().then((count) => { if (!cancelled) setState({ userId, count }); }, () => undefined);
    return () => { cancelled = true; };
  }, [userId, nonce]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToConversations(() => setNonce((n) => n + 1));
    const appState = AppState.addEventListener('change', (s) => { if (s === 'active') setNonce((n) => n + 1); });
    return () => { unsubscribe(); appState.remove(); };
  }, [userId]);

  const count = userId && state.userId === userId ? state.count : 0;
  return <UnreadContext value={{ count, refresh }}>{children}</UnreadContext>;
}

export function useUnread() {
  return use(UnreadContext);
}
