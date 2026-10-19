import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createIntlMiddleware(routing);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function contentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const supabase = supabaseUrl ? new URL(supabaseUrl).origin : '';
  const supabaseWs = supabase.replace(/^http/, 'ws');
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Radix y next/image usan atributos style; el riesgo de inyección de estilos es bajo frente a romper la interfaz
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' ${supabase} ${supabaseWs}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'self'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

// Orígenes web que pueden llamar a /api/v1 desde el navegador (p. ej. la app exportada a web en pruebas).
// Las apps nativas no envían Origin y no necesitan CORS.
const API_ORIGINS = new Set((process.env.API_ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean));

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !API_ORIGINS.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/v1') && request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });
  }
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce);
  const correlationId = request.headers.get('x-correlation-id') ?? crypto.randomUUID();

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('content-security-policy', csp);
  headers.set('x-correlation-id', correlationId);
  const forwarded = new NextRequest(request, { headers });

  const isApi = request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/auth/');
  const response = isApi ? NextResponse.next({ request: { headers } }) : handleI18n(forwarded);

  // Refresca la sesión de Supabase (rota tokens caducados y actualiza cookies)
  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getClaims();
  }

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-correlation-id', correlationId);
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    for (const [k, v] of Object.entries(corsHeaders(request.headers.get('origin')))) response.headers.set(k, v);
  }
  return response;
}

export const config = {
  // Todo menos estáticos, imágenes optimizadas y archivos con extensión.
  // Las precargas de <Link> TAMBIÉN deben pasar por aquí: necesitan la reescritura de idioma de next-intl.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|robots.txt|sitemap.xml|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp|ico|woff2?)$).*)',
  ],
};
