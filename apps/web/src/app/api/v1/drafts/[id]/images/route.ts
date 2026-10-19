import { fail } from '@ayudacerca/core';
import { z } from 'zod';
import { authenticateBearer, json, unauthorized } from '@/server/api/bearer';
import { rateLimit } from '@/server/security/rate-limit';
import { ImageError, processUploadedImage } from '@/server/services/images';
import { addDraftImage, removeDraftImage } from '@/server/services/listings';

const id = z.uuid();

/** Sube una foto a un borrador (la app la envía como multipart/form-data, campo «file»). */
export async function POST(request: Request, { params }: RouteContext<'/api/v1/drafts/[id]/images'>) {
  const draftId = (await params).id;
  if (!id.safeParse(draftId).success) return json(fail('validation'));
  const ctx = await authenticateBearer(request);
  if (!ctx) return unauthorized();
  if (!rateLimit(`upload:${ctx.user.id}`, 30, 10 * 60_000).ok) return json(fail('rate_limited'));
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json(fail('validation', 'invalidImage'));
  try {
    return json(await addDraftImage(ctx, draftId, await processUploadedImage(await file.arrayBuffer())));
  } catch (error) {
    return json(error instanceof ImageError ? fail('validation', error.reason) : fail('internal'));
  }
}

export async function DELETE(request: Request, { params }: RouteContext<'/api/v1/drafts/[id]/images'>) {
  const draftId = (await params).id;
  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!id.safeParse(draftId).success || !path) return json(fail('validation'));
  const ctx = await authenticateBearer(request);
  if (!ctx) return unauthorized();
  return json(await removeDraftImage(ctx, draftId, path));
}
