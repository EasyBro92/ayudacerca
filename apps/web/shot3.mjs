import { chromium, devices } from '@playwright/test';
const out = process.argv[2];
const b = await chromium.launch();
for (const [tag, opts] of [['m', devices['Pixel 7']], ['d', { viewport: { width: 1280, height: 900 } }]]) {
  const c = await b.newContext({ ...opts, baseURL: 'http://localhost:3000', locale: 'es-ES' });
  const p = await c.newPage();
  const snap = async (name, full = false) => { await p.waitForLoadState('networkidle'); await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${tag}-${name}.png`, fullPage: full }); };
  await p.goto('/'); await p.waitForLoadState('networkidle'); await p.getByRole('button', { name: 'Rechazar opcionales' }).click().catch(() => {});
  await p.getByLabel('Cuéntanos tu problema').fill('Mi ordenador va lentísimo y salen anuncios');
  await snap('home', tag === 'd');
  if (tag === 'm') { await p.evaluate(() => window.scrollTo(0, 1100)); await snap('home2'); await p.evaluate(() => window.scrollTo(0, 2300)); await snap('home3'); }
  await p.goto('/explorar?tipo=necesitan'); await snap('ayudar');
  await p.goto('/anuncios/ayuda-con-el-movil-y-la-tablet-con-paciencia-d001'); await snap('anuncio', tag === 'd');
  await p.goto('/entrar'); await p.getByLabel('Correo electrónico').fill('prestador@example.com'); await p.getByLabel('Contraseña', { exact: true }).fill('AyudaDemo2026!');
  await p.getByRole('button', { name: 'Entrar', exact: true }).click(); await p.waitForURL(/cuenta/); await snap('cuenta');
  await c.close();
}
await b.close();
