import { expect, type Page, test } from '@playwright/test';
import { dismissCookies, expectAccessible, ready } from './helpers';

async function signIn(page: Page, email: string) {
  await page.goto('/entrar');
  await dismissCookies(page);
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForURL(/\/cuenta/);
}

const LISTING = '/anuncios/ayuda-con-el-movil-y-la-tablet-con-paciencia-d001'; // de «Jordi P.» (prestador@example.com)

test.describe('chat', () => {
  test('contactar desde un anuncio, respuesta en tiempo real, aviso de contacto y bloqueo', async ({ page, browser }, info) => {
    test.setTimeout(120_000);
    const mobile = info.project.name === 'movil';
    const requester = mobile ? { email: 'paula.i@example.com', name: 'Paula I.' } : { email: 'victor.e@example.com', name: 'Víctor E.' };
    const first = `Hola, ¿me ayudas a configurar el correo? ${info.project.name} ${Date.now()}`;

    // Quien pide ayuda escribe desde el anuncio
    await signIn(page, requester.email);
    await page.goto(LISTING);
    await ready(page);
    const existing = page.getByRole('link', { name: 'Ver la conversación' }).filter({ visible: true });
    if (await existing.count()) {
      await existing.first().click();
      await page.getByLabel('Mensaje', { exact: true }).fill(first);
      await page.getByRole('button', { name: 'Enviar', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'Contactar' }).filter({ visible: true }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Escribe a Jordi P.' });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel('Mensaje', { exact: true }).fill(first);
      await dialog.getByRole('button', { name: 'Enviar mensaje' }).click();
    }
    await page.waitForURL(/\/mensajes\/[0-9a-f-]{36}$/);
    const log = page.getByRole('log', { name: 'Mensajes de la conversación' });
    await expect(log.getByText(first)).toBeVisible();
    await expectAccessible(page);

    // La persona que publicó lo ve como no leído y responde
    const ownerContext = await browser.newContext({ baseURL: info.project.use.baseURL ?? 'http://localhost:3000', locale: 'es-ES' });
    const owner = await ownerContext.newPage();
    await signIn(owner, 'prestador@example.com');
    await owner.goto('/mensajes');
    const row = owner.getByRole('link', { name: new RegExp(requester.name) }).first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(owner.getByRole('log').getByText(first)).toBeVisible();
    const reply = `Claro, ¿te va bien por videollamada? ${Date.now()}`;
    await owner.getByLabel('Mensaje', { exact: true }).fill(reply);
    await owner.getByRole('button', { name: 'Enviar', exact: true }).click();
    await expect(owner.getByRole('log').getByText(reply)).toBeVisible();

    // …y la respuesta llega sin recargar
    await expect(log.getByText(reply)).toBeVisible({ timeout: 20_000 });
    await ownerContext.close();

    // Aviso al escribir datos de contacto (no bloquea)
    await page.getByLabel('Mensaje', { exact: true }).fill('Mi teléfono es 612 345 678');
    await expect(page.getByText('Parece que compartes datos de contacto')).toBeVisible();
    await page.getByLabel('Mensaje', { exact: true }).fill('');

    // Bloquear y desbloquear
    await page.getByRole('button', { name: 'Más opciones' }).click();
    await page.getByRole('menuitem', { name: 'Bloquear' }).click();
    await page.getByRole('button', { name: 'Sí, bloquear' }).click();
    await expect(page.getByText('Has bloqueado a esta persona')).toBeVisible();
    await expect(page.getByLabel('Mensaje', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Más opciones' }).click();
    await page.getByRole('menuitem', { name: 'Desbloquear' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Desbloquear' }).click();
    await expect(page.getByLabel('Mensaje', { exact: true })).toBeVisible();

    // La conversación aparece en la bandeja
    await page.goto('/mensajes');
    await expect(page.getByRole('link', { name: /Jordi P\./ }).first()).toBeVisible();
  });

  test('sin sesión, «Contactar» lleva a entrar y vuelve al anuncio', async ({ page }) => {
    await page.goto(LISTING);
    await dismissCookies(page);
    await page.getByRole('link', { name: 'Contactar' }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/entrar\?volver=%2Fanuncios%2Fayuda-con-el-movil/);
  });

  test('la bandeja de mensajes exige sesión', async ({ page }) => {
    await page.goto('/mensajes');
    await expect(page).toHaveURL(/\/entrar\?volver=%2Fmensajes/);
  });
});
