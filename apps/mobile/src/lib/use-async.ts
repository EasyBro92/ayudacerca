import { useEffect, useRef, useState } from 'react';

/**
 * Carga de datos con estados de carga, error, recarga y «tirar para refrescar».
 * El estado solo se actualiza cuando llega la respuesta (sin renders en cascada) y
 * se ignoran respuestas de peticiones antiguas.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const loadRef = useRef(load);
  useEffect(() => { loadRef.current = load; });

  const [nonce, setNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const key = `${JSON.stringify(deps)}#${nonce}`;
  const [state, setState] = useState<{ key: string | null; data: T | null; error: unknown }>({ key: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => { if (!cancelled) { setState({ key, data, error: null }); setRefreshing(false); } },
      (error: unknown) => { if (!cancelled) { setState((s) => ({ key, data: s.data, error })); setRefreshing(false); } },
    );
    return () => { cancelled = true; };
  }, [key]);

  return {
    data: state.data,
    error: state.key === key ? state.error : null,
    loading: state.key !== key && !refreshing,
    refreshing,
    reload: () => setNonce((n) => n + 1),
    refresh: () => { setRefreshing(true); setNonce((n) => n + 1); },
  };
}
