import type { Session } from '@supabase/supabase-js';
import { type ReactNode, createContext, use, useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_path: string | null;
  bio: string | null;
  email_verified: boolean;
  status: string;
  skills: string[];
  available_until: string | null;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null, profile: null, loading: true, refreshProfile: async () => undefined, signOut: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('id, username, display_name, avatar_path, bio, email_verified, status, skills, available_until').eq('id', userId).maybeSingle();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void loadProfile(next?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value: AuthState = {
    session,
    profile,
    loading,
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  return use(AuthContext);
}
