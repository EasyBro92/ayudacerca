import { expect, type Page, test } from '@playwright/test';
import { dismissCookies } from './helpers';

async function signIn(page: Page, email: string) {
  await page.goto('/entrar');
  await dismissCookies(page);
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForURL(/\/cuenta/);
}

test('cambiar el nombre deja registro y administración lo ve', async ({ page, browser }, info) => {
  test.setTimeout(90_000);
  const email = info.project.name === 'movil' ? 'laia.b@example.com' : 'victor.e@example.com';
  const newName = `Nombre ${info.project.name} ${Date.now() % 100000}`;

  await signIn(page, email);
  await page.getByLabel('Nombre visible').fill('X');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('El nombre debe tener al menos 2 caracteres.')).toBeVisible();
  await page.getByLabel('Nombre visible').fill(newName);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Hecho. Tu perfil está actualizado.')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: `Hola, ${newName}` })).toBeVisible();

  // Una persona sin rol no puede ver la administración
  const res = await page.goto('/admin/cambios');
  expect(res?.status()).toBe(404);

  // Administración ve el cambio
  const adminContext = await browser.newContext({ baseURL: info.project.use.baseURL ?? 'http://localhost:3000', locale: 'es-ES' });
  const admin = await adminContext.newPage();
  await signIn(admin, 'admin@example.com');
  await expect(admin.getByRole('link', { name: 'Administración' })).toBeVisible();
  await admin.goto(`/admin/cambios?q=${encodeURIComponent(newName)}`);
  const row = admin.getByRole('row', { name: new RegExp(newName) }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('Nombre visible');
  await expect(row).toContainText('La propia persona');
  await adminContext.close();
});
