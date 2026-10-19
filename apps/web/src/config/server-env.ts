import 'server-only';
import { z } from 'zod';

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  CRON_SECRET: z.string().min(16).optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
});

if (process.env.NEXT_PUBLIC_APP_ENV === 'production' && !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en producción');
}
