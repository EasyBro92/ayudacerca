import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321');
const isDev = process.env.NODE_ENV !== 'production';

// Cabeceras de seguridad comunes. La CSP con nonce se genera en src/proxy.ts.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  // ADR 0005: Cache Components desactivado hasta que next-intl y @supabase/ssr lo soporten sin fricción.
  cacheComponents: false,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@ayudacerca/core'],
  images: {
    remotePatterns: [
      { protocol: supabaseUrl.protocol.replace(':', '') as 'http' | 'https', hostname: supabaseUrl.hostname, port: supabaseUrl.port, pathname: '/storage/v1/object/public/**' },
    ],
    dangerouslyAllowLocalIP: isDev,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' },
    },
  },
};

export default withNextIntl(nextConfig);
