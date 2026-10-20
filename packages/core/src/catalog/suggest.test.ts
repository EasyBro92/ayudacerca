import { describe, expect, it } from 'vitest';
import { categories } from '../../../../supabase/seed/data/catalog.mjs';
import { problemExamples, suggestCategories } from './suggest';

describe('sugerencia de categorías', () => {
  it.each([
    ['Mi ordenador va lentísimo y salen anuncios', 'tecnologia-soporte'],
    ['Necesito una página web para mi tienda', 'desarrollo-web'],
    ['No sé hacer fórmulas en Excel', 'ofimatica-datos'],
    ['Quiero pedir cita previa en la Seguridad Social', 'tramites-online'],
    ['Busco a alguien que diseñe un logo', 'diseno-contenido'],
    ['Clases de inglés para mi hijo', 'clases-formacion'],
    ['Traducir mi currículum al inglés', 'traduccion-redaccion'],
    ['El meu ordinador no arrenca', 'tecnologia-soporte'],
    ['My printer is not working', 'tecnologia-soporte'],
  ])('«%s» → %s', (text, slug) => {
    expect(suggestCategories(text)[0]).toBe(slug);
  });
  it('sin pistas no sugiere nada', () => {
    expect(suggestCategories('hola')).toEqual([]);
    expect(suggestCategories('')).toEqual([]);
  });
  it('respeta el límite', () => {
    expect(suggestCategories('excel word web logo clases wifi', 2)).toHaveLength(2);
  });
  it('solo sugiere categorías visibles del catálogo', () => {
    const visible = new Set(categories.filter((c) => c.active !== false).map((c) => c.slug));
    for (const e of problemExamples) expect(visible.has(e.category)).toBe(true);
    expect(suggestCategories('ordenador web logo excel clase cita traducir', 10).every((s) => visible.has(s))).toBe(true);
  });
});
