import { z } from 'zod';
import { limits } from '../config/limits';

// Mensajes = claves de traducción (namespace «validation»).

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email({ error: 'invalidEmail' }));

export const passwordSchema = z
  .string()
  .min(limits.auth.passwordMin, { error: 'passwordTooShort' })
  .max(limits.auth.passwordMax, { error: 'passwordTooLong' });

export const displayNameSchema = z
  .string()
  .trim()
  .min(limits.profile.displayNameMin, { error: 'nameTooShort' })
  .max(limits.profile.displayNameMax, { error: 'nameTooLong' });

export const signUpSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, { error: 'mustAcceptTerms' }),
});
export type SignUpInput = z.input<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'required' }).max(limits.auth.passwordMax),
});
export type SignInInput = z.input<typeof signInSchema>;

export const recoverSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], error: 'passwordsDontMatch' });

/** Rutas internas seguras para redirigir después de iniciar sesión (evita redirecciones abiertas). */
export function safeRedirectPath(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (/[\r\n]/.test(value)) return fallback;
  return value;
}
