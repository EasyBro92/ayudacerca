import type { MetadataRoute } from 'next';
import { publicEnv } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
  const isProd = publicEnv.NEXT_PUBLIC_APP_ENV === 'production';
  return {
    rules: isProd
      ? [{ userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/cuenta', '/mensajes', '/reservas', '/publicar', '/admin', '/entrar', '/registro', '/recuperar', '/restablecer', '/*/cuenta', '/*/publicar', '/*/admin'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${publicEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
