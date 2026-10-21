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

test('inicio: «cuéntanos tu problema», disponibles ahora, peticiones y categorías de la base de datos', async ({ page }) => {
  await open(page, '/');
  await expect(page.getByRole('heading', { name: '¿Se te ha rebelado la tecnología?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Disponibles ahora' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gente que necesita una mano' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Así de fácil' })).toBeVisible();
  // Pestañas nuevas: Inicio · Pedir · Ayudar · Mensajes · Yo
  for (const tab of ['Inicio', 'Pedir', 'Ayudar', 'Mensajes', 'Yo']) await expect(page.getByRole('tab', { name: tab, exact: true })).toBeAttached();
  // Las categorías presenciales están ocultas y no aparecen en la app
  await expect(page.getByRole('button', { name: /^Mascotas,/ })).toHaveCount(0);
  await page.getByRole('button', { name: /^Informática y soporte técnico,/ }).click();
  await expect(page.getByRole('heading', { name: /resultado/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Puesta a punto de ordenadores lentos/ })).toBeVisible();
});

test('inicio: al contar el problema se sugiere la categoría y «Pedir ayuda» abre el asistente ya rellenado', async ({ page }) => {
  await open(page, '/');
  const box = page.getByRole('textbox', { name: 'Cuéntanos tu problema' });
  await box.fill('Mi ordenador va lento');
  await expect(page.getByText('Parece cosa de…')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Informática y soporte técnico', exact: true })).toBeVisible();
  // Un ejemplo rápido rellena el cuadro y elige su categoría
  await page.getByRole('button', { name: 'No me aclaro con Excel' }).click();
  await expect(box).toHaveValue('No me aclaro con Excel');
  await expect(page.getByRole('button', { name: 'Ofimática y datos', exact: true })).toBeVisible();
  // «Ver quién puede ayudarme» lleva a las ayudas que se ofrecen de esa categoría
  await page.getByRole('button', { name: 'Ver quién puede ayudarme' }).click();
  await expect(page.getByRole('heading', { name: /resultado/ })).toBeVisible();
  await expect(page).toHaveURL(/tipo=ofrecen/);
  await expect(page).toHaveURL(/categoria=ofimatica-datos/);

  await signIn(page, 'xavier.c@example.com');
  await open(page, '/');
  await page.getByRole('textbox', { name: 'Cuéntanos tu problema' }).fill('Mi ordenador va lento y salen anuncios raros');
  await page.getByRole('button', { name: 'Pedir ayuda', exact: true }).click();
  await expect(page.getByText(/Paso 2 de 9/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('radio', { name: /Informática y soporte técnico/ })).toBeChecked();
});

test('ayudar: peticiones de gente que necesita una mano e invitación a ofrecer ayuda', async ({ page }) => {
  await open(page, '/ayudar');
  await expect(page.getByRole('heading', { name: 'Gente que necesita una mano' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /resultado/ })).toBeVisible();
  const rows = page.getByRole('link', { name: /^Necesita ayuda\./ });
  await expect(rows.first()).toBeVisible();
  await expect(page.getByRole('link', { name: /^Ofrece ayuda\./ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Quiero ayudar' })).toBeVisible();
});

test('yo: marcarse como disponible ahora, aparecer en Inicio y quitarlo', async ({ page }) => {
  await signIn(page, 'hugo.m@example.com');
  const on = page.getByRole('button', { name: 'Estoy disponible' });
  const off = page.getByRole('button', { name: 'Ya no estoy disponible' });
  await expect(on.or(off)).toBeVisible();
  if (await off.isVisible()) { await off.click(); await expect(on).toBeVisible(); }
  await on.click();
  await expect(page.getByText(/Disponible hasta las \d{2}:\d{2}/)).toBeVisible();
  await expect(off).toBeVisible();
  // Habilidades: separadas por comas, sin repetidos
  const skills = page.getByRole('textbox', { name: 'Lo que se te da bien' });
  await skills.fill('Excel, wifi , excel, x');
  await page.getByRole('button', { name: 'Guardar habilidades' }).click();
  await expect(page.getByText('Guardado. ¡Gracias por echar una mano!')).toBeVisible();
  await expect(skills).toHaveValue('Excel, wifi');

  await open(page, '/');
  const card = page.getByLabel(/^Hugo M\., Disponible ahora, Se le da bien: Excel, wifi$/);
  await expect(card).toBeAttached({ timeout: 15_000 });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();

  await open(page, '/cuenta');
  await page.getByRole('button', { name: 'Ya no estoy disponible' }).click();
  await expect(page.getByRole('button', { name: 'Estoy disponible' })).toBeVisible();
  await expect(page.getByText(/Disponible hasta las/)).toHaveCount(0);
});

test('yo: corregir el nombre visible (queda registrado para administración)', async ({ page }) => {
  await signIn(page, 'claudia.f@example.com');
  const name = page.getByRole('textbox', { name: 'Nombre visible' });
  await name.fill('C');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('El nombre debe tener al menos 2 caracteres.')).toBeVisible();
  const newName = `Claudia ${Date.now() % 100000}`;
  await name.fill(newName);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Hecho. Tu perfil está actualizado.')).toBeVisible();
  await expect(page.getByRole('heading', { name: `Hola, ${newName}` })).toBeVisible({ timeout: 10_000 });
});

test('detalle: información, consejos de seguridad y contacto que pide iniciar sesión', async ({ page }) => {
  await open(page, '/anuncio/ayuda-con-el-movil-y-la-tablet-con-paciencia-d001');
  await expect(page.getByRole('heading', { name: 'Ayuda con el móvil y la tablet, con paciencia' })).toBeVisible();
  await expect(page.getByText('Consejos de seguridad')).toBeVisible();
  await expect(page.getByText('Identidad verificada').first()).toBeVisible();
  // Las propuestas siguen en pausa; el contacto por chat ya funciona
  await expect(page.getByRole('button', { name: 'Pedir propuesta' })).toBeDisabled();
  await expect(page.getByText('Las propuestas con precio y fecha llegarán pronto. De momento, acordadlo por el chat.')).toBeVisible();
  await expect(page.getByText('Inicia sesión para escribir a esta persona o guardar el anuncio.')).toBeVisible();
  await page.getByRole('button', { name: 'Contactar' }).click();
  await expect(page.getByRole('textbox', { name: 'Correo electrónico' })).toBeVisible();
});

test('entrar, guardar un favorito y verlo en la cuenta', async ({ page }) => {
  await signIn(page, 'nuria.f@example.com');
  await open(page, '/anuncio/web-sencilla-en-wordpress-para-tu-negocio-d009');
  const save = page.getByRole('button', { name: 'Guardar en favoritos: Web sencilla en WordPress para tu negocio' });
  const remove = page.getByRole('button', { name: 'Quitar de favoritos: Web sencilla en WordPress para tu negocio' });
  await expect(save.or(remove)).toBeVisible();
  if (await remove.isVisible().catch(() => false)) await remove.click();
  await save.click();
  await expect(remove).toBeVisible();
  await open(page, '/cuenta');
  await expect(page.getByRole('link', { name: /Web sencilla en WordPress para tu negocio/ })).toBeVisible();
});

const LISTING_D001 = '/anuncio/ayuda-con-el-movil-y-la-tablet-con-paciencia-d001';

/** Abre (o crea, si aún no existe) la conversación de la persona cliente sobre el anuncio d001. */
async function openThreadAsClient(page: Page, stamp: number) {
  await open(page, LISTING_D001);
  await expect(page.getByRole('heading', { name: 'Ayuda con el móvil y la tablet, con paciencia' })).toBeVisible();
  const contact = page.getByRole('button', { name: 'Contactar' });
  const existing = page.getByRole('button', { name: 'Ver la conversación' });
  await expect(contact.or(existing)).toBeVisible();
  if (await existing.isVisible()) {
    await existing.click();
  } else {
    await contact.click();
    await page.getByRole('textbox', { name: 'Mensaje' }).fill(`Hola, me interesa tu anuncio (${stamp})`);
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  }
  await expect(page).toHaveURL(/\/conversacion\//, { timeout: 15_000 });
  await expect(page.getByRole('link', { name: 'Ver anuncio: Ayuda con el móvil y la tablet, con paciencia' })).toBeVisible();
  // La hoja de contacto (con su propio cuadro «Mensaje») ya se ha cerrado
  await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Mensaje' })).toBeVisible();
}

/** Mensajes del hilo abierto (en la web, la lista de conversaciones sigue montada debajo con la vista previa). */
const thread = (page: Page) => page.getByLabel('Mensajes de la conversación');

async function sendInThread(page: Page, text: string) {
  const composer = page.getByRole('textbox', { name: 'Mensaje' });
  await composer.fill(text);
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(thread(page).getByText(text, { exact: true })).toBeVisible();
  await expect(composer).toHaveValue('');
}

test('chat: escribir desde un anuncio, ver el mensaje en el hilo y en Mensajes', async ({ page }) => {
  await signIn(page, 'cliente@example.com');
  // Texto único: otras pruebas pueden estar usando la misma base de datos a la vez
  const stamp = Date.now();
  await openThreadAsClient(page, stamp);
  await expect(page.getByText('Nunca compartas contraseñas, códigos SMS ni datos bancarios por el chat.')).toBeVisible();

  const message = `¿Podrías ayudarme el jueves por la tarde? (${stamp})`;
  await sendInThread(page, message);
  // Aviso (no bloqueo) al compartir datos de contacto
  const composer = page.getByRole('textbox', { name: 'Mensaje' });
  await composer.fill('Llámame al 612 345 678');
  await expect(page.getByText('Parece que compartes datos de contacto.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar', exact: true })).toBeEnabled();
  await composer.fill('');

  await open(page, '/mensajes');
  await expect(page.getByRole('tab', { name: /Mensajes/ })).toBeVisible();
  const row = page.getByRole('link', { name: /^Jordi P\., Sobre «Ayuda con el móvil y la tablet, con paciencia»/ });
  await expect(row).toBeVisible({ timeout: 15_000 });
  await expect(row.getByText(`Tú: ${message}`)).toBeVisible();
  await row.click();
  await expect(thread(page).getByText(message, { exact: true })).toBeVisible();
});

test('chat en tiempo real: la otra persona recibe los mensajes sin recargar', async ({ page, browser }, testInfo) => {
  const stamp = Date.now();
  await signIn(page, 'cliente@example.com');
  await openThreadAsClient(page, stamp);

  const ownerContext = await browser.newContext({ ...testInfo.project.use, baseURL: testInfo.project.use.baseURL });
  const owner = await ownerContext.newPage();
  await signIn(owner, 'prestador@example.com');
  await open(owner, '/mensajes');
  await owner.getByRole('link', { name: /^Marta R\., Sobre «Ayuda con el móvil y la tablet, con paciencia»/ }).click();
  await expect(owner.getByRole('textbox', { name: 'Mensaje' })).toBeVisible({ timeout: 15_000 });

  const question = `¿Te va bien por videollamada? (${stamp})`;
  await sendInThread(page, question);
  await expect(thread(owner).getByText(question, { exact: true })).toBeVisible({ timeout: 15_000 });

  const answer = `Sí, perfecto. Te llamo a las seis (${stamp})`;
  await sendInThread(owner, answer);
  await expect(thread(page).getByText(answer, { exact: true })).toBeVisible({ timeout: 15_000 });
  await ownerContext.close();
});

test('publicar desde la app: validación, foto y publicación a través de la API', async ({ page }) => {
  await signIn(page, 'joan.r@example.com');
  await open(page, '/publicar?tipo=ofrezco');
  try {
    await expect(page.getByText(/Paso 2 de 9/)).toBeVisible({ timeout: 20_000 });
  } catch {
    // Diagnóstico para CI: qué hay en pantalla en lugar del paso 2
    const shown = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 600);
    throw new Error(`No aparece «Paso 2 de 9». En pantalla: ${shown}`);
  }
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Revisa los campos marcados antes de continuar.')).toBeVisible();
  await page.getByRole('radio', { name: /Webs y programación/ }).click();
  await page.getByRole('button', { name: 'WordPress' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  const title = `Arreglo y actualizo webs en WordPress ${Date.now() % 100000}`;
  await page.getByLabel('Título').fill(title);
  await page.getByLabel('Descripción').fill('Actualizo plugins, arreglo errores y hago copias de seguridad de tu web en WordPress, todo a distancia.');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Telemático' }).click();
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
