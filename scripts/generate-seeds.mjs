#!/usr/bin/env node
// Genera supabase/seed/01_required.sql (necesario en todos los entornos) y
// supabase/seed/02_demo.sql (SOLO desarrollo). Uso: pnpm db:seeds
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories } from '../supabase/seed/data/catalog.mjs';
import { municipalities } from '../supabase/seed/data/municipalities.mjs';
import { users, listings } from '../supabase/seed/data/demo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replaceAll("'", "''")}'`);
const j = (v) => (v === null || v === undefined ? 'null' : `${q(JSON.stringify(v))}::jsonb`);
const arr = (a, type = 'text') => `array[${a.map(q).join(', ')}]::${type}[]`;

// ---------------------------------------------------------------- requerido
const req = [];
req.push('-- GENERADO por scripts/generate-seeds.mjs — no editar a mano');
req.push('-- Datos imprescindibles en todos los entornos (catálogo, municipios, ajustes, borradores legales).');
req.push('begin;');

req.push('\n-- Municipios');
for (const [slug, name, province, region, lat, lng] of municipalities) {
  req.push(`insert into public.municipalities (slug, name, province, region, center) values (${q(slug)}, ${q(name)}, ${q(province)}, ${q(region)}, public.approximate_point(${lat}, ${lng})) on conflict (slug) do nothing;`);
}

req.push('\n-- Categorías (el catálogo vive en el código: al volver a cargar se actualizan textos, orden y visibilidad)');
categories.forEach((c, i) => {
  req.push(`insert into public.categories (slug, name, description, icon, color, sort_order, is_active, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values (${q(c.slug)}, ${j(c.name)}, ${j(c.description)}, ${q(c.icon)}, ${q(c.color)}, ${i + 1}, ${c.active !== false}, ${!!c.review}, ${!!c.sensitive}, ${c.photos !== false}, ${arr(c.verifications ?? [], 'public.verification_kind')}, ${j(c.warnings)}, ${j(c.restrictions)})
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, color = excluded.color,
  sort_order = excluded.sort_order, is_active = excluded.is_active, requires_review = excluded.requires_review, is_sensitive = excluded.is_sensitive,
  allow_photos = excluded.allow_photos, required_verifications = excluded.required_verifications, warnings = excluded.warnings, restrictions = excluded.restrictions;`);
  c.subs.forEach(([slug, name], k) => {
    req.push(`insert into public.subcategories (category_id, slug, name, sort_order) select id, ${q(slug)}, ${j(name)}, ${k + 1} from public.categories where slug = ${q(c.slug)} on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;`);
  });
  (c.fields ?? []).forEach((f, k) => {
    const options = f.options ? f.options.map(([value, label]) => ({ value, label })) : null;
    req.push(`insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, ${q(f.key)}, ${j(f.label)}, ${q(f.type)}, ${j(options)}, ${!!f.required}, ${j(f.validation)}, ${k + 1} from public.categories where slug = ${q(c.slug)} on conflict (category_id, key) do nothing;`);
  });
});

req.push('\n-- Feature flags (todas las opcionales empiezan apagadas)');
const flags = [
  ['map_view', false, 'Vista de mapa en Explorar'],
  ['exchange_pricing', false, 'Permitir el tipo de precio «intercambio»'],
  ['sms_notifications', false, 'Avisos por SMS para eventos críticos'],
  ['pro_subscription', false, 'Suscripción PRO'],
  ['promoted_listings', false, 'Anuncios destacados de pago'],
  ['ai_help_assistant', false, 'Asistente del centro de ayuda'],
  ['google_login', false, 'Iniciar sesión con Google'],
  ['apple_login', false, 'Iniciar sesión con Apple (obligatorio en iOS si hay login social)'],
  ['payments', false, 'Pagos de reservas — EN PAUSA por decisión del propietario (simulador si no hay claves de Stripe)'],
];
for (const [key, enabled, description] of flags) {
  req.push(`insert into public.feature_flags (key, enabled, description) values (${q(key)}, ${enabled}, ${q(description)}) on conflict (key) do nothing;`);
}

req.push('\n-- Ajustes de plataforma');
const settings = [
  ['listings.expiry_days', 30, 'Días que dura publicado un anuncio', true],
  ['listings.max_images', 6, 'Máximo de fotos por anuncio', true],
  ['bookings.auto_confirm_hours', 72, 'Horas tras «terminado» para confirmar automáticamente si no hay incidencia', true],
  ['proposals.expiry_hours', 72, 'Caducidad por defecto de las propuestas', true],
  ['reviews.window_days', 14, 'Días para valorar tras completar', true],
  ['home.stats_thresholds', { users: 200, verified: 50, completed: 100, ratings: 30 }, 'Por debajo de estos valores no se muestran los indicadores de la portada', true],
  ['app.min_version', { ios: '1.0.0', android: '1.0.0' }, 'Versión mínima de la app; por debajo se pide actualizar', true],
  ['legal.current_versions', { terms: '2026-10-borrador', privacy: '2026-10-borrador', cookies: '2026-10-borrador' }, 'Versiones vigentes que se aceptan al registrarse', true],
];
for (const [key, value, description, isPublic] of settings) {
  req.push(`insert into public.platform_settings (key, value, description, is_public) values (${q(key)}, ${j(value)}, ${q(description)}, ${isPublic}) on conflict (key) do nothing;`);
}

req.push('\n-- Términos que envían un anuncio a revisión manual (lista inicial, ampliable desde administración)');
const terms = [
  ['contraseña', 'review'], ['contrasena', 'review'], ['certificado digital', 'review'], ['clave pin', 'review'], ['cl@ve', 'review'],
  ['código sms', 'review'], ['suplantar', 'reject'], ['hacerme pasar', 'reject'], ['arma', 'review'], ['droga', 'review'],
  ['marihuana', 'reject'], ['cocaína', 'reject'], ['robado', 'reject'], ['préstamo rápido', 'review'], ['criptomoneda', 'review'],
  ['masaje erótico', 'reject'], ['escort', 'reject'], ['receta médica', 'review'], ['instalación de gas', 'review'], ['boletín eléctrico', 'review'],
];
for (const [term, action] of terms) req.push(`insert into public.blocked_terms (term, action) values (${q(term)}, ${q(action)}) on conflict (term) do nothing;`);

req.push('\n-- Documentos legales (BORRADORES pendientes de revisión jurídica)');
const legalDir = join(root, 'docs/legal');
for (const file of readdirSync(legalDir).filter((f) => /^[a-z_]+\.(es|ca|en)\.md$/.test(f)).sort()) {
  const [kind, locale] = file.split('.');
  const body = readFileSync(join(legalDir, file), 'utf8');
  const title = body.split('\n')[0].replace(/^#\s*/, '');
  req.push(`insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values (${q(kind)}, '2026-10-borrador', ${q(locale)}, ${q(title)}, ${q(body)}, true, now()) on conflict (kind, version, locale) do nothing;`);
}
req.push('commit;');
writeFileSync(join(root, 'supabase/seed/01_required.sql'), req.join('\n') + '\n');

// ---------------------------------------------------------------- demo
const uid = (i) => `00000000-0000-4000-a000-${String(i + 1).padStart(12, '0')}`;
const lid = (i) => `00000000-0000-4000-b000-${String(i + 1).padStart(12, '0')}`;
const DEMO_PASSWORD = 'AyudaDemo2026!';

const demo = [];
demo.push('-- GENERADO por scripts/generate-seeds.mjs — no editar a mano');
demo.push('-- DATOS FICTICIOS DE DEMOSTRACIÓN. NO CARGAR NUNCA EN PRODUCCIÓN.');
demo.push(`do $$ begin
  if coalesce(current_setting('app.environment', true), 'development') = 'production' then
    raise exception 'La semilla de demostración no se puede cargar en producción';
  end if;
end $$;`);
demo.push('begin;');

users.forEach(([email, display, first, last, , , , , , , ], i) => {
  const meta = { display_name: display, first_name: first, last_name: last, locale: 'es', accepted_terms_version: '2026-10-borrador', accepted_privacy_version: '2026-10-borrador' };
  demo.push(`insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
values ('00000000-0000-0000-0000-000000000000', ${q(uid(i))}, 'authenticated', 'authenticated', ${q(email)}, extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now() - interval '${60 - i} days', '{"provider":"email","providers":["email"]}', ${j(meta)}, now() - interval '${60 - i} days', now(), '', '', '', '', '', '', '', '');`);
  demo.push(`insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values (gen_random_uuid(), ${q(uid(i))}, ${q(uid(i))}, ${j({ sub: uid(i), email, email_verified: true })}, 'email', now(), now(), now());`);
});

users.forEach(([email, , , , city, type, bio, identity, professional, role, langs], i) => {
  const username = email.split('@')[0].replace(/[^a-z0-9]+/g, '-');
  demo.push(`update public.profiles set username = ${q(username)}, bio = ${q(bio)}, account_type = ${q(type)}, languages = ${arr(langs)}, created_at = now() - interval '${60 - i} days', last_active_at = now() - interval '${i % 5} days', municipality_id = (select id from public.municipalities where slug = ${q(city)}) where id = ${q(uid(i))};`);
  if (identity) demo.push(`insert into public.user_verifications (user_id, kind, status, method, verified_at) values (${q(uid(i))}, 'identity', 'verified', 'demo_seed', now() - interval '20 days');`);
  if (professional) demo.push(`insert into public.user_verifications (user_id, kind, status, method, verified_at, notes) values (${q(uid(i))}, 'professional', 'verified', 'demo_seed', now() - interval '15 days', 'Alta de autónomo revisada (demo)');`);
  if (role) demo.push(`insert into public.user_roles (user_id, role) values (${q(uid(i))}, ${q(role)});`);
});

listings.forEach(([author, kind, cat, sub, city, modality, priceType, euros, title, description, tags, urgent, daysAgo, custom], i) => {
  const authorCity = users[author][4];
  const slug = `${title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}-d${String(i + 1).padStart(3, '0')}`;
  demo.push(`insert into public.listings (id, slug, author_id, kind, title, description, category_id, subcategory_id, municipality_id, modality, price_cents, price_type, is_urgent, tags, status, moderation_status, published_at, expires_at, created_at)
select ${q(lid(i))}, ${q(slug)}, ${q(uid(author))}, ${q(kind)}, ${q(title)}, ${q(description)}, c.id, s.id, m.id, ${q(modality)}, ${euros === null ? 'null' : euros * 100}, ${q(priceType)}, ${urgent}, ${arr(tags)}, 'published', 'approved', now() - interval '${daysAgo} days ${i} minutes', now() - interval '${daysAgo} days' + interval '30 days', now() - interval '${daysAgo} days ${i} minutes'
from public.categories c join public.subcategories s on s.category_id = c.id and s.slug = ${q(sub)}, public.municipalities m
where c.slug = ${q(cat)} and m.slug = ${q(city ?? authorCity)};`);
  for (const [key, value] of Object.entries(custom ?? {})) {
    demo.push(`insert into public.listing_custom_values (listing_id, field_id, value) select ${q(lid(i))}, f.id, ${j(value)} from public.category_fields f join public.categories c on c.id = f.category_id where c.slug = ${q(cat)} and f.key = ${q(key)};`);
  }
});

// Algunos favoritos de la cuenta cliente
for (const i of [0, 3, 7, 13]) demo.push(`insert into public.listing_favorites (user_id, listing_id) values (${q(uid(0))}, ${q(lid(i))});`);

demo.push('commit;');
writeFileSync(join(root, 'supabase/seed/02_demo.sql'), demo.join('\n') + '\n');
console.log(`Semillas generadas: ${municipalities.length} municipios, ${categories.length} categorías, ${users.length} usuarios, ${listings.length} anuncios.`);
