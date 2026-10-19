import { fail } from '@ayudacerca/core';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { authenticateBearer, json, unauthorized } from '@/server/api/bearer';
import { rateLimit } from '@/server/security/rate-limit';
import { submitDraft } from '@/server/services/listings';

/** Valida el borrador completo, aplica la moderación y crea el anuncio. */
export async function POST(request: Request, { params }: RouteContext<'/api/v1/drafts/[id]/submit'>) {
  const draftId = (await params).id;
  if (!z.uuid().safeParse(draftId).success) return json(fail('validation'));
  const ctx = await authenticateBearer(request);
  if (!ctx) return unauthorized();
  if (!rateLimit(`publish:${ctx.user.id}`, 10, 60 * 60_000).ok) return json(fail('rate_limited'));
  const result = await submitDraft(ctx, draftId);
  if (result.ok) revalidateTag('catalog', 'max');
  return json(result);
}
