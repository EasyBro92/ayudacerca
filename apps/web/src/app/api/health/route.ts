import { NextResponse } from 'next/server';
import { createSupabasePublicClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Salud básica para monitorización. No expone datos sensibles. */
export async function GET() {
  const started = Date.now();
  const supabase = createSupabasePublicClient();
  const { error } = await supabase.from('categories').select('id', { head: true, count: 'exact' }).limit(1);
  const ok = !error;
  return NextResponse.json(
    { status: ok ? 'ok' : 'degraded', checks: { database: ok ? 'ok' : 'error' }, latencyMs: Date.now() - started },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
