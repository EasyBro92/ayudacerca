import { expect, type Page, test } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

async function signIn(page: Page, email: string) {
  await open(page, '/entrar');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('AyudaDemo2026!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: /^Hola, / })).toBeVisible({ timeout: 15_000 });
}

test('inicio: buscador, accesos rápidos y anuncios recientes', async ({ page }) => {
  await open(page, '/');
  await expect(page.getByRole('heading', { name: 'Ayuda de confianza, a la vuelta de la esquina' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Anuncios recientes' })).toBeVisible();
  await page.getByRole('button', { name: /^Mascotas,/ }).click();
  await expect(page.getByRole('heading', { name: /resultado/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Paseos de perros de una hora por Russafa/ })).toBeVisible();
});

test('detalle: información, consejos de seguridad y contacto deshabilitado con explicación', async ({ page }) => {
  await open(page, '/anuncio/ayuda-con-el-movil-y-la-tablet-con-paciencia-d001');
  await expect(page.getByRole('heading', { name: 'Ayuda con el móvil y la tablet, con paciencia' })).toBeVisible();
  await expect(page.getByText('Consejos de seguridad')).toBeVisible();
  await expect(page.getByText('Identidad verificada').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Contactar' })).toBeDisabled();
  await expect(page.getByText('El chat estará disponible en la próxima versión.')).toBeVisible();
});

test('entrar, guardar un favorito y verlo en la cuenta', async ({ page }) => {
  await signIn(page, 'nuria.f@example.com');
  await open(page, '/anuncio/paseos-de-perros-de-una-hora-por-russafa-d006');
  const save = page.getByRole('button', { name: 'Guardar en favoritos: Paseos de perros de una hora por Russafa' });
  const remove = page.getByRole('button', { name: 'Quitar de favoritos: Paseos de perros de una hora por Russafa' });
  if (await remove.isVisible().catch(() => false)) await remove.click();
  await save.click();
  await expect(remove).toBeVisible();
  await open(page, '/cuenta');
  await expect(page.getByRole('link', { name: /Paseos de perros de una hora por Russafa/ })).toBeVisible();
});

test('publicar desde la app: validación, foto y publicación a través de la API', async ({ page }) => {
  await signIn(page, 'joan.r@example.com');
  await open(page, '/publicar?tipo=ofrezco');
  await expect(page.getByText(/Paso 2 de 9/)).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Revisa los campos marcados antes de continuar.')).toBeVisible();
  await page.getByRole('radio', { name: /Montaje y reparaciones/ }).click();
  await page.getByRole('button', { name: 'Montaje de muebles' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  const title = `Monto muebles de piso nuevo ${Date.now() % 100000}`;
  await page.getByLabel('Título').fill(title);
  await page.getByLabel('Descripción').fill('Monto armarios, camas y estanterías. Llevo herramientas propias y dejo todo recogido.');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'A domicilio' }).click();
  await page.getByLabel('Municipio').fill('Llei');
  await page.getByRole('button', { name: /^Lleida/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Por hora' }).click();
  await page.getByLabel('Importe (€)').fill('18');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(/Fotos \(opcional\)/)).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('18 €/hora').filter({ visible: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('switch').click();
  await page.getByRole('button', { name: 'Publicar anuncio' }).click();
  await expect(page.getByText('¡Anuncio publicado!')).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Ver mi anuncio' }).click();
  await expect(page.getByRole('heading', { name: title }).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('Este es tu anuncio').filter({ visible: true }).first()).toBeVisible();
});

test('eliminar la cuenta y cancelarlo dentro del plazo', async ({ page }) => {
  await signIn(page, 'paula.i@example.com');
  page.on('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Eliminar mi cuenta' }).last().click();
  // En la versión web, Alert.alert se muestra como confirm() del navegador
  await expect(page.getByText(/Tu cuenta se eliminará el/)).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cancelar la eliminación' }).click();
  await expect(page.getByText(/Tu cuenta se eliminará el/)).toBeHidden();
});
