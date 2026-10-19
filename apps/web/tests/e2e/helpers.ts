import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Acepta (o rechaza) el banner de cookies para que no tape la interfaz. */
export async function dismissCookies(page: Page) {
  // El banner solo aparece tras hidratar (lee la cookie en el navegador): esperamos a que la página esté lista
  await page.waitForLoadState('networkidle');
  const reject = page.getByRole('button', { name: 'Rechazar opcionales' });
  if (await reject.waitFor({ state: 'visible', timeout: 2000 }).then(() => true).catch(() => false)) await reject.click();
}

/** Espera a que React haya hidratado la página antes de interactuar. */
export async function ready(page: Page) {
  await page.waitForLoadState('networkidle');
}

/** Sin violaciones de accesibilidad graves o críticas (WCAG 2.2 AA). */
export async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
}

const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324';

/** Espera el correo más reciente para una dirección y devuelve el primer enlace que contenga `match`. */
export async function linkFromEmail(to: string, match: RegExp): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`);
    const data = (await res.json()) as { messages?: { ID: string }[] };
    const id = data.messages?.[0]?.ID;
    if (id) {
      const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${id}`)).json()) as { HTML: string; Text: string };
      const links = [...(msg.HTML + msg.Text).matchAll(/https?:\/\/[^\s"'<>]+/g)].map((m) => m[0].replace(/&amp;/g, '&'));
      const found = links.find((l) => match.test(l));
      if (found) return found;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No ha llegado el correo para ${to}`);
}
