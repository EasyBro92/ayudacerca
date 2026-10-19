import { expect, test } from '@playwright/test';
import { dismissCookies, expectAccessible, linkFromEmail, ready } from './helpers';

test.describe('cuenta', () => {
  test('registro → confirmación por correo → favorito → cierre de sesión', async ({ page }, info) => {
    const email = `e2e-${info.project.name}-${Date.now()}@example.com`;
    await page.goto('/registro');
    await dismissCookies(page);
    await expectAccessible(page);

    // Validación: sin aceptar condiciones no se puede
    await page.getByLabel('Tu nombre').fill('Prueba E2E');
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill('una frase larga de prueba');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('tienes que aceptar las condiciones')).toBeVisible();

    // Tras un error se conservan nombre y correo, pero la contraseña hay que volver a escribirla
    await expect(page.getByLabel('Correo electrónico')).toHaveValue(email);
    await page.getByLabel('Contraseña', { exact: true }).fill('una frase larga de prueba');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('Revisa tu correo')).toBeVisible();

    const link = await linkFromEmail(email, /verify|auth\/v1/);
    await page.goto(link);
    await expect(page).toHaveURL(/\/cuenta/);
    await expect(page.getByRole('heading', { name: 'Hola, Prueba E2E' })).toBeVisible();

    await page.goto('/anuncios/clases-de-guitarra-para-principiantes-d019');
    await ready(page);
    const title = 'Clases de guitarra para principiantes';
    await page.getByRole('button', { name: new RegExp(`^(Guardar|Guardar en favoritos: ${title})$`) }).first().click();
    await expect(page.getByRole('button', { name: new RegExp(`^(Guardado|Quitar de favoritos: ${title})$`) }).first()).toBeVisible();
    await page.goto('/cuenta');
    await expect(page.getByRole('link', { name: 'Clases de guitarra para principiantes' })).toBeVisible();

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('contraseña incorrecta: mensaje genérico (no revela si la cuenta existe)', async ({ page }) => {
    await page.goto('/entrar');
    await dismissCookies(page);
    await page.getByLabel('Correo electrónico').fill(`paula.i@example.com`);
    await page.getByLabel('Contraseña', { exact: true }).fill('contraseña equivocada');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByText('El correo o la contraseña no son correctos.')).toBeVisible();
  });

  test('iniciar sesión vuelve a la página de origen', async ({ page }) => {
    await page.goto('/entrar?volver=%2Fcategorias');
    await dismissCookies(page);
    await page.getByLabel('Correo electrónico').fill('cliente@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/categorias$/);
  });

  test('redirección abierta bloqueada', async ({ page }) => {
    await page.goto('/entrar?volver=%2F%2Fevil.example');
    await dismissCookies(page);
    await page.getByLabel('Correo electrónico').fill('cliente@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/localhost:3000\/cuenta$/);
  });

  test('recuperar contraseña responde igual exista o no la cuenta', async ({ page }) => {
    await page.goto('/recuperar');
    await dismissCookies(page);
    await page.getByLabel('Correo electrónico').fill('no-existe-nunca@example.com');
    await page.getByRole('button', { name: 'Enviar enlace' }).click();
    await expect(page.getByText('Si existe una cuenta con ese correo')).toBeVisible();
  });

  test('la cuenta exige sesión', async ({ page }) => {
    await page.goto('/cuenta');
    await expect(page).toHaveURL(/\/entrar\?volver=%2Fcuenta/);
  });
});
