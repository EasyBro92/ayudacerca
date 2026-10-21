import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface CurrentUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  username: string;
  displayName: string;
  avatarPath: string | null;
  status: string;
}

/** Persona con sesión válida (JWT verificado) o null. Una sola consulta por petición. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const sub = claims?.claims?.sub;
  if (!sub) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_path, status, email_verified')
    .eq('id', sub)
    .maybeSingle();
  if (!profile) return null;
  return {
    id: sub,
    email: typeof claims.claims.email === 'string' ? claims.claims.email : null,
    emailVerified: profile.email_verified,
    username: profile.username,
    displayName: profile.display_name,
    avatarPath: profile.avatar_path,
    status: profile.status,
  };
});

export async function requireUser(locale: string, returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const prefix = locale === 'es' ? '' : `/${locale}`;
    redirect(`${prefix}/entrar?volver=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/** ¿La persona tiene rol de moderación o administración? (lo decide la base de datos) */
export const isStaff = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc('has_staff_role', { required: 'moderator' });
  return data === true;
});
