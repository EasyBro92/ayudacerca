import { safeRedirectPath } from '@ayudacerca/core';
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Destino de los enlaces de confirmación de correo y recuperación de contraseña (flujo PKCE). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeRedirectPath(url.searchParams.get('next'), '/cuenta');
  const code = url.searchParams.get('code');
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  // El correo puede quedar confirmado aunque el enlace se abra en otro navegador: pedimos iniciar sesión
  const login = new URL('/entrar', url.origin);
  login.searchParams.set('aviso', code ? 'enlace' : 'error');
  return NextResponse.redirect(login);
}
