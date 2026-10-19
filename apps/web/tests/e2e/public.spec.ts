import { expect, test } from '@playwright/test';
import { dismissCookies, expectAccessible } from './helpers';

test.describe('páginas públicas', () => {
  test('portada: secciones principales y accesibilidad', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ayuda de confianza');
    await expect(page.getByRole('heading', { name: 'Anuncios recientes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cómo funciona', level: 2 })).toBeVisible();
    await dismissCookies(page);
    await expectAccessible(page);
  });

  test('la búsqueda de la portada lleva a Explorar con los filtros en la URL', async ({ page }) => {
    await page.goto('/');
    await dismissCookies(page);
    await page.getByLabel('¿Qué necesitas?').fill('perro');
    await page.getByLabel('¿Dónde?').selectOption('valencia');
    await page.getByRole('button', { name: 'Buscar ayuda' }).click();
    await expect(page).toHaveURL(/\/explorar\?q=perro&en=valencia/);
    await expect(page.getByRole('heading', { name: /resultado/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Paseos de perros/ })).toBeVisible();
  });

  test('explorar: filtros compartibles, estado vacío útil y accesibilidad', async ({ page }) => {
    await page.goto('/explorar?categoria=mascotas&tipo=ofrecen');
    await dismissCookies(page);
    await expect(page.getByRole('link', { name: /Paseos de perros/ })).toBeVisible();
    await expectAccessible(page);

    await page.goto('/explorar?q=submarinismo');
    await expect(page.getByRole('heading', { name: 'No hay anuncios con estos filtros' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Publicar lo que necesito' })).toBeVisible();
  });

  test('una URL manipulada no rompe la página', async ({ page }) => {
    const res = await page.goto('/explorar?tipo=<script>&radio=999&pagina=-4&orden=drop');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('categoría con advertencia de seguridad', async ({ page }) => {
    await page.goto('/categorias/recados-gestiones');
    await expect(page.getByRole('heading', { level: 1, name: 'Recados y gestiones' })).toBeVisible();
    await expect(page.getByText(/nunca compartas contraseñas, PIN/)).toBeVisible();
  });

  test('detalle: autor, ubicación aproximada, sin datos privados y accesible', async ({ page }) => {
    await page.goto('/anuncios/ayuda-con-el-movil-y-la-tablet-con-paciencia-d001');
    await dismissCookies(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ayuda con el móvil y la tablet, con paciencia');
    await expect(page.getByText('Ubicación aproximada.', { exact: false })).toBeVisible();
    await expect(page.getByText('Identidad verificada').first()).toBeVisible();
    const html = await page.content();
    expect(html).not.toContain('prestador@example.com');
    expect(html).not.toMatch(/"location_public"/);
    await expectAccessible(page);
  });

  test('un anuncio inexistente muestra 404 traducido', async ({ page }) => {
    const res = await page.goto('/anuncios/no-existe-xyz');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
  });

  test('catalán e inglés sin mezclar idiomas', async ({ page }) => {
    await page.goto('/ca');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ajuda de confiança, a la cantonada');
    await page.goto('/en/explorar');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find help or people to help');
  });

  test('documento legal marcado como borrador', async ({ page }) => {
    await page.goto('/legal/terms');
    await expect(page.getByText('Borrador pendiente de revisión jurídica.').first()).toBeVisible();
  });

  test('cabeceras de seguridad y salud', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    const health = await request.get('/api/health');
    expect(health.status()).toBe(200);
    expect((await health.json()).status).toBe('ok');
  });
});
