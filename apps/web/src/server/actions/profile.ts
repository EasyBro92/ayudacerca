'use server';

import { type ApiResult, fail, limits, ok } from '@ayudacerca/core';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/server/auth/session';
import { log } from '@/server/log';

/** Activa «Disponible ahora» durante unas horas (limits.profile.availableHours), o lo apaga. */
export async function setAvailableAction(on: boolean): Promise<ApiResult<{ availableUntil: string | null }>> {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  const availableUntil = on ? new Date(Date.now() + limits.profile.availableHours * 3_600_000).toISOString() : null;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('profiles').update({ available_until: availableUntil }).eq('id', user.id);
  if (error) {
    log('warn', 'profile.available_failed', { code: error.code });
    return fail('internal');
  }
  revalidatePath('/', 'layout');
  return ok({ availableUntil });
}

const skillsSchema = z
  .string()
  .max(600)
  .transform((s) => [...new Set(s.split(',').map((x) => x.trim().replace(/\s+/g, ' ')).filter(Boolean))])
  .pipe(z.array(z.string().min(2).max(30)).max(limits.profile.skillsMax));

export async function saveSkillsAction(raw: unknown): Promise<ApiResult<{ skills: string[] }>> {
  const parsed = skillsSchema.safeParse(typeof raw === 'string' ? raw : '');
  if (!parsed.success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('profiles').update({ skills: parsed.data }).eq('id', user.id);
  if (error) {
    log('warn', 'profile.skills_failed', { code: error.code });
    return fail('internal');
  }
  revalidatePath('/', 'layout');
  return ok({ skills: parsed.data });
}
