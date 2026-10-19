/**
 * Detecta datos de contacto o pagos externos en textos públicos (anuncios) o en el chat antes de reservar.
 * Es una ayuda, no una barrera infalible: los casos dudosos se marcan para revisión.
 */

export type ContactFinding = 'phone' | 'email' | 'url' | 'iban' | 'social' | 'external_payment';

export interface ContactDetectionResult {
  found: boolean;
  findings: ContactFinding[];
}

const WORD_DIGITS: Record<string, string> = {
  cero: '0', zero: '0',
  uno: '1', una: '1', un: '1', one: '1',
  dos: '2', two: '2',
  tres: '3', three: '3',
  cuatro: '4', quatre: '4', four: '4',
  cinco: '5', cinc: '5', five: '5',
  seis: '6', sis: '6', six: '6',
  siete: '7', set: '7', seven: '7',
  ocho: '8', vuit: '8', eight: '8',
  nueve: '9', nou: '9', nine: '9',
};

function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Sustituye números escritos con letras por dígitos para detectar «seis cero cero…». */
function wordsToDigits(text: string): string {
  return stripAccents(text.toLowerCase()).replace(/[a-z]+/g, (w) => WORD_DIGITS[w] ?? w);
}

/** Secuencias de 9+ dígitos separadas solo por espacios, puntos, guiones o paréntesis. */
function hasPhone(text: string): boolean {
  const candidates = wordsToDigits(text).match(/(?:\+|00)?[\d][\d\s().\-/]{7,}\d/g) ?? [];
  return candidates.some((c) => {
    const digits = c.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) return false;
    // Móviles y fijos españoles (6, 7, 8, 9) o internacionales con prefijo
    return /^(?:34)?[6789]\d{8}$/.test(digits) || /^(?:00|\+)/.test(c.trim()) || digits.length >= 11;
  });
}

const EMAIL = /[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\]|\sarroba\s|\sat\s)\s*[a-z0-9.-]+\s*(?:\.|\sdot\s|\spunto\s)\s*[a-z]{2,}/i;
const URL_EXPLICIT = /\b(?:https?:\/\/|www\.)\S+/i;
// Sin bandera «i» a propósito: «ordenador.Es muy…» (falta un espacio) no debe parecer un dominio
const BARE_DOMAIN = /\b[a-z0-9-]{2,}\.(?:com|es|net|org|cat|eus|gal|io|me|info|link|ly)\b(?:\/\S*)?/;
const IBAN = /\bES\d{2}(?:[\s-]?\d{4}){5}\b/i;
const HANDLE = /(?:^|\s)@[a-z0-9_.]{3,}/i;
// Nombrar una app («te enseño a usar WhatsApp») no es dar un contacto; invitar a hablar por ella sí
const SOCIAL_INVITE = /\b(?:escribeme|escribe|contacta(?:me)?|hablame|hablamos|llamame|agregame|anademe|sigueme|buscame|mi|el\s+meu|em\s+trobes|escriu-me)\s+(?:por|al|en|a|per)?\s*(?:whatsapp|wasap|telegram|instagram|insta|facebook|tiktok|signal)\b/i;
const EXTERNAL_PAYMENT = /\b(?:bizum|paypal|por\s+transferencia|transferencia\s+bancaria|en\s+efectivo|pago\s+en\s+mano|fuera\s+de\s+la\s+(?:app|aplicacion|plataforma)|sin\s+comision(?:es)?|en\s+metal.lic|fora\s+de\s+l.app)\b/i;

export function detectContactInfo(text: string): ContactDetectionResult {
  const normalized = stripAccents(text);
  const findings: ContactFinding[] = [];
  if (hasPhone(text)) findings.push('phone');
  if (EMAIL.test(normalized)) findings.push('email');
  const withoutEmails = normalized.replace(new RegExp(EMAIL.source, 'gi'), ' ');
  if (URL_EXPLICIT.test(withoutEmails) || BARE_DOMAIN.test(withoutEmails)) findings.push('url');
  if (IBAN.test(normalized)) findings.push('iban');
  if (HANDLE.test(withoutEmails) || SOCIAL_INVITE.test(normalized)) findings.push('social');
  if (EXTERNAL_PAYMENT.test(normalized)) findings.push('external_payment');
  return { found: findings.length > 0, findings };
}
