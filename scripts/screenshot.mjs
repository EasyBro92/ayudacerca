// Uso: node scripts/screenshot.mjs <url> <salida.png> [mobile|desktop] [fullPage]
import { chromium } from '@playwright/test';

const [url, out, device = 'mobile', full = 'full'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium' });
const context = await browser.newContext(
  device === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES' }
    : { viewport: { width: 1366, height: 900 }, locale: 'es-ES' },
);
const page = await context.newPage();
const problems = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
const res = await page.goto(url, { waitUntil: process.env.WAIT ?? 'networkidle' });
if (process.env.DELAY) await page.waitForTimeout(Number(process.env.DELAY));
await page.screenshot({ path: out, fullPage: full === 'full' });
console.log(`HTTP ${res?.status()} ${url}`);
for (const p of problems.slice(0, 15)) console.log(p);
await browser.close();
