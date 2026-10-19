import { expect, type Page, test } from '@playwright/test';
import sharp from 'sharp';
import { dismissCookies, ready } from './helpers';

async function signIn(page: Page, email: string) {
  await page.goto('/entrar');
  await dismissCookies(page);
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForURL(/\/cuenta/);
}

/** Foto JPEG con metadatos EXIF para comprobar que se eliminan al subirla. */
async function photoWithExif(): Promise<Buffer> {
  return sharp({ create: { width: 1200, height: 900, channels: 3, background: '#2b736b' } })
    .jpeg()
    .withExif({ IFD0: { Make: 'TestCam', Model: 'Ubicacion-Secreta', Copyright: 'Calle Falsa 123' } })
    .toBuffer();
}

const next = (page: Page) => page.getByRole('button', { name: 'Continuar' }).click();

test.describe('publicar', () => {
  test('asistente completo: validación, detección de contacto, foto sin metadatos y publicación', async ({ page, request }, info) => {
    test.setTimeout(120_000);
    await signIn(page, info.project.name === 'movil' ? 'oriol.t@example.com' : 'tomas.v@example.com');
    await page.goto('/publicar?nuevo=1&tipo=ofrezco');
    await ready(page);

    // Viene de «Quiero ofrecer ayuda»: el paso 1 ya está hecho y empieza en el 2
    await expect(page.getByRole('heading', { name: '¿Qué tipo de ayuda es?' })).toBeVisible();
    await page.getByRole('button', { name: 'Atrás' }).click();
    await expect(page.getByRole('radio', { name: /Ofrezco ayuda/ })).toBeChecked();
    await next(page);

    // Paso 2: sin categoría no avanza
    await next(page);
    await expect(page.getByText('Revisa los campos marcados antes de continuar.')).toBeVisible();
    await page.locator('main label', { hasText: 'Informática y soporte técnico' }).click();
    await page.getByLabel('Subcategoría', { exact: true }).selectOption({ label: 'Asistencia remota' });
    await next(page);

    // Paso 3: un teléfono en el texto bloquea el avance
    const title = `Asistencia remota para tu ordenador ${info.project.name} ${Date.now() % 100000}`;
    await page.getByLabel('Título', { exact: true }).fill(title);
    await page.getByLabel('Descripción', { exact: true }).fill('Te ayudo con tu ordenador por conexión remota. Llámame al 612 345 678 y lo hablamos.');
    await expect(page.getByText('Parece que has incluido datos de contacto')).toBeVisible();
    await next(page);
    await expect(page.getByText(/Quita teléfonos, correos o enlaces/)).toBeVisible();
    await page.getByLabel('Descripción', { exact: true }).fill('Te ayudo con tu ordenador por conexión remota: programas, correo e impresoras. Te escribo por el chat.');
    await next(page);

    // Paso 4
    await page.getByRole('radio', { name: 'A domicilio' }).check();
    await page.getByLabel('Municipio', { exact: true }).selectOption({ label: 'Tarragona (Tarragona)' });
    await next(page);
    // Paso 5 (opcional)
    await next(page);
    // Paso 6: importe con coma decimal
    await page.getByRole('radio', { name: 'Precio fijo' }).check();
    await page.getByLabel('Importe (€)').fill('12,50');
    await next(page);

    // Paso 7: foto con EXIF → debe guardarse limpia y en WebP
    await page.locator('input[type="file"]').setInputFiles({ name: 'balcon.jpg', mimeType: 'image/jpeg', buffer: await photoWithExif() });
    await expect(page.getByRole('button', { name: 'Quitar la foto 1' })).toBeVisible({ timeout: 20_000 });
    const src = (await page.locator('li img').first().getAttribute('src')) ?? '';
    const proxied = new URL(src, page.url());
    const imageUrl = proxied.searchParams.get('url') ?? proxied.toString();
    const stored = await (await request.get(imageUrl)).body();
    const meta = await sharp(stored).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.exif).toBeUndefined();
    expect(stored.toString('latin1')).not.toContain('Ubicacion-Secreta');
    await next(page);

    // Paso 8: vista previa
    await expect(page.getByText('12,50 €').first()).toBeVisible();
    await next(page);

    // Paso 9: hay que confirmar las normas
    await page.getByRole('button', { name: 'Publicar anuncio' }).click();
    await expect(page.getByText('Tienes que confirmar que el anuncio cumple las normas.').first()).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Publicar anuncio' }).click();
    await expect(page.getByRole('heading', { name: '¡Anuncio publicado!' })).toBeVisible({ timeout: 20_000 });

    await page.getByRole('link', { name: 'Ver mi anuncio' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByText('Este es tu anuncio').filter({ visible: true })).toHaveCount(1);
  });

  test('las categorías con revisión manual envían el anuncio a revisión', async ({ page }, info) => {
    test.setTimeout(90_000);
    await signIn(page, info.project.name === 'movil' ? 'miguel.a@example.com' : 'rosa.d@example.com');
    await page.goto('/publicar?nuevo=1&tipo=necesito');
    await ready(page);
    await page.locator('main label', { hasText: 'Otros servicios' }).click();
    await page.getByLabel('Subcategoría', { exact: true }).selectOption({ label: 'Varios' });
    await next(page);
    await page.getByLabel('Título', { exact: true }).fill('Ayuda para organizar un álbum de fotos digital');
    await page.getByLabel('Descripción', { exact: true }).fill('Busco a alguien que me ayude a ordenar y etiquetar las fotos familiares en un álbum digital compartido.');
    await next(page);
    await page.getByRole('radio', { name: 'Presencial' }).check();
    await page.getByLabel('Municipio', { exact: true }).selectOption({ label: 'Córdoba (Córdoba)' });
    await next(page);
    await next(page);
    await page.getByRole('radio', { name: 'Presupuesto a convenir' }).check();
    await next(page);
    await next(page);
    await next(page);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Publicar anuncio' }).click();
    await expect(page.getByRole('heading', { name: 'Anuncio enviado a revisión' })).toBeVisible({ timeout: 20_000 });
  });

  test('sin sesión, publicar pide entrar y recuerda adónde volver', async ({ page }) => {
    await page.goto('/publicar?tipo=necesito');
    await expect(page).toHaveURL(/\/entrar\?volver=%2Fpublicar%3Ftipo%3Dnecesito/);
  });
});
