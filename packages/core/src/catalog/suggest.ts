/**
 * Sugiere categorías a partir de lo que la persona cuenta en «Cuéntanos tu problema».
 * Coincidencia simple por palabras clave (es/ca/en), sin servicios externos.
 */

const KEYWORDS: Record<string, readonly string[]> = {
  'tecnologia-soporte': [
    'ordenador', 'portatil', 'pc', 'mac', 'windows', 'movil', 'telefono', 'tablet', 'ipad', 'iphone', 'android', 'wifi',
    'router', 'internet', 'impresora', 'virus', 'lento', 'pantalla', 'whatsapp', 'correo', 'email', 'contrasena olvidada',
    'actualizar', 'instalar', 'programa', 'aplicacion', 'app', 'copia de seguridad', 'fotos', 'nube', 'icloud', 'google drive',
    'television', 'tele', 'smart tv', 'bluetooth', 'ordinador', 'mobil', 'computer', 'laptop', 'phone', 'printer', 'slow',
  ],
  'desarrollo-web': [
    'web', 'pagina web', 'wordpress', 'tienda online', 'ecommerce', 'shopify', 'dominio', 'hosting', 'formulario',
    'programar', 'programacion', 'codigo', 'python', 'javascript', 'script', 'automatizar', 'base de datos', 'sql', 'api',
    'website', 'coding', 'database',
  ],
  'diseno-contenido': [
    'logo', 'diseno', 'cartel', 'flyer', 'folleto', 'tarjeta', 'video', 'editar video', 'montaje', 'foto', 'retoque',
    'photoshop', 'canva', 'instagram', 'tiktok', 'redes sociales', 'facebook', 'youtube', 'presentacion', 'powerpoint',
    'disseny', 'design', 'social media',
  ],
  'ofimatica-datos': [
    'excel', 'hoja de calculo', 'word', 'documento', 'pdf', 'escanear', 'escaneo', 'transcribir', 'transcripcion',
    'datos', 'tabla', 'formula', 'grafico', 'google sheets', 'spreadsheet', 'full de calcul',
  ],
  'clases-formacion': [
    'clase', 'clases', 'aprender', 'ensenar', 'curso', 'profesor', 'deberes', 'examen', 'ingles', 'idioma', 'matematicas',
    'guitarra', 'musica', 'repaso', 'refuerzo', 'classe', 'aprendre', 'lesson', 'tutor', 'learn',
  ],
  'tramites-online': [
    'cita previa', 'cita', 'tramite', 'formulario oficial', 'solicitud', 'ayuda publica', 'subvencion', 'seguridad social',
    'hacienda', 'renta', 'sepe', 'paro', 'ayuntamiento', 'reclamacion', 'certificado', 'administracion', 'billete',
    'reserva', 'tramit', 'paperwork', 'appointment',
  ],
  'traduccion-redaccion': [
    'traducir', 'traduccion', 'traductor', 'revisar texto', 'corregir', 'redactar', 'carta', 'curriculum', 'cv',
    'subtitulos', 'articulo', 'blog', 'traduir', 'translate', 'proofread', 'cover letter',
  ],
};

function normalize(text: string): string {
  return ` ${text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

/** Categorías ordenadas por número de coincidencias (máx. `limit`). Vacío si no hay ninguna. */
export function suggestCategories(text: string, limit = 3): string[] {
  const haystack = normalize(text);
  if (haystack.trim().length < 3) return [];
  return Object.entries(KEYWORDS)
    .map(([slug, words]) => ({ slug, score: words.reduce((n, w) => (haystack.includes(` ${w} `) || (w.length > 4 && haystack.includes(` ${w}`)) ? n + (w.includes(' ') ? 2 : 1) : n), 0) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.slug);
}

/** Ejemplos rápidos para la portada (claves i18n en `home.examples.*`) y su categoría. */
export const problemExamples = [
  { key: 'slowComputer', category: 'tecnologia-soporte' },
  { key: 'excel', category: 'ofimatica-datos' },
  { key: 'website', category: 'desarrollo-web' },
  { key: 'appointment', category: 'tramites-online' },
  { key: 'logo', category: 'diseno-contenido' },
  { key: 'lessons', category: 'clases-formacion' },
] as const;
