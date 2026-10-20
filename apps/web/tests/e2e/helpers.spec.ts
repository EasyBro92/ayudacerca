import { expect, test } from '@playwright/test';
import { dismissCookies } from './helpers';

test('«Disponible ahora» y habilidades: se activan en Yo y se ven en la portada', async ({ page }, info) => {
  const user = info.project.name === 'movil' ? { email: 'raul.n@example.com', name: 'Raúl N.' } : { email: 'ines.g@example.com', name: 'Inés G.' };
  await page.goto('/entrar');
  await dismissCookies(page);
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForURL(/\/cuenta/);

  const skill = `Excel avanzado ${info.project.name}`;
  await page.getByLabel(/Hasta 12 habilidades/).fill(`${skill}, WordPress`);
  await page.getByRole('button', { name: 'Guardar habilidades' }).click();
  await expect(page.getByText('Guardado. ¡Gracias por echar una mano!')).toBeVisible();

  const toggle = page.getByRole('button', { name: /Estoy disponible|Ya no estoy disponible/ });
  if ((await toggle.textContent())?.includes('Ya no')) await toggle.click();
  await page.getByRole('button', { name: 'Estoy disponible' }).click();
  await expect(page.getByText(/Disponible hasta las/)).toBeVisible();

  await page.goto('/');
  const card = page.getByRole('region', { name: 'Disponibles ahora' }).getByRole('link', { name: new RegExp(user.name) });
  await expect(card).toBeVisible();
  await expect(card).toContainText(skill);

  await page.goto('/cuenta');
  await page.getByRole('button', { name: 'Ya no estoy disponible' }).click();
  await expect(page.getByRole('button', { name: 'Estoy disponible' })).toBeVisible();
});
