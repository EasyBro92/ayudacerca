import { z } from 'zod';

const schema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  EXPO_PUBLIC_WEB_URL: z.url(),
});

// Expo solo incrusta las variables EXPO_PUBLIC_* si se leen de forma literal
const parsed = schema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_WEB_URL: process.env.EXPO_PUBLIC_WEB_URL,
});

if (!parsed.success) {
  throw new Error('Faltan variables EXPO_PUBLIC_* (copia apps/mobile/.env.example a apps/mobile/.env)');
}

export const env = parsed.data;

export function storageUrl(bucket: 'listing-images' | 'avatars', path: string): string {
  return `${env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function webUrl(path: string, locale: string): string {
  const prefix = locale === 'es' ? '' : `/${locale}`;
  return `${env.EXPO_PUBLIC_WEB_URL}${prefix}${path}`;
}
