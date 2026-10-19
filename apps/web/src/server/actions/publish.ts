'use server';

import { type ApiResult, fail } from '@ayudacerca/core';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/server/auth/session';
import { rateLimit } from '@/server/security/rate-limit';
import { ImageError, processUploadedImage } from '@/server/services/images';
import { type DraftData, type DraftImage, type SubmitOutcome, addDraftImage, removeDraftImage, saveDraft, submitDraft } from '@/server/services/listings';

const draftId = z.uuid();

export async function saveDraftAction(id: string, data: DraftData, step: number): Promise<ApiResult<null>> {
  if (!draftId.safeParse(id).success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  if (!rateLimit(`draft:${user.id}`, 120, 60_000).ok) return fail('rate_limited');
  return saveDraft(user, id, data, step);
}

export async function uploadDraftImageAction(id: string, form: FormData): Promise<ApiResult<DraftImage>> {
  if (!draftId.safeParse(id).success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  if (!rateLimit(`upload:${user.id}`, 30, 10 * 60_000).ok) return fail('rate_limited');
  const file = form.get('file');
  if (!(file instanceof File)) return fail('validation', 'invalidImage');
  try {
    const processed = await processUploadedImage(await file.arrayBuffer());
    return addDraftImage(user, id, processed);
  } catch (error) {
    if (error instanceof ImageError) return fail('validation', error.reason);
    return fail('internal');
  }
}

export async function removeDraftImageAction(id: string, path: string): Promise<ApiResult<null>> {
  if (!draftId.safeParse(id).success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  return removeDraftImage(user, id, path);
}

export async function submitDraftAction(id: string): Promise<ApiResult<SubmitOutcome>> {
  if (!draftId.safeParse(id).success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  if (!rateLimit(`publish:${user.id}`, 10, 60 * 60_000).ok) return fail('rate_limited');
  const result = await submitDraft(user, id);
  if (result.ok) revalidateTag('catalog', 'max');
  return result;
}
