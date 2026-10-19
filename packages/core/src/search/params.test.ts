import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, activeFilterCount, isIndexableSearch, parseSearchParams, toSearchQuery, toSearchRpcArgs } from './params';

describe('parseSearchParams', () => {
  it('lee una URL completa', () => {
    const f = parseSearchParams(new URLSearchParams('q=perro&tipo=ofrecen&categoria=mascotas&sub=paseo-perros&en=valencia&radio=10&modalidad=presencial&min=5&max=20&precio=hora&valoracion=4&verificados=1&fotos=1&recientes=1&urgentes=1&orden=cercanos&pagina=2'));
    expect(f).toEqual({
      q: 'perro', kind: 'offer', category: 'mascotas', subcategory: 'paseo-perros', municipality: 'valencia', radiusKm: 10,
      modality: 'in_person', priceMinCents: 500, priceMaxCents: 2000, priceType: 'hourly', minRating: 4,
      verifiedOnly: true, withPhoto: true, recentOnly: true, urgentOnly: true, sort: 'nearest', page: 2,
    });
  });

  it('ignora valores manipulados sin romperse', () => {
    const f = parseSearchParams({ tipo: 'hack', categoria: '../../etc', radio: '7', min: '-1', valoracion: '9', pagina: '9999', orden: 'drop table', en: '<script>' });
    expect(f).toEqual(DEFAULT_FILTERS);
  });

  it('aplica coherencia entre filtros', () => {
    expect(parseSearchParams({ sub: 'canguro' }).subcategory).toBeNull();
    expect(parseSearchParams({ radio: '10' }).radiusKm).toBeNull();
    expect(parseSearchParams({ orden: 'cercanos' }).sort).toBe('relevance');
    const swapped = parseSearchParams({ min: '50', max: '10' });
    expect([swapped.priceMinCents, swapped.priceMaxCents]).toEqual([1000, 5000]);
  });

  it('admite arrays de Next.js y recorta textos largos', () => {
    expect(parseSearchParams({ q: ['hola', 'adios'] }).q).toBe('hola');
    expect(parseSearchParams({ q: 'x'.repeat(500) }).q).toHaveLength(100);
    expect(parseSearchParams({ q: '   ' }).q).toBeNull();
  });
});

describe('toSearchQuery', () => {
  it('es la inversa de parseSearchParams', () => {
    const query = 'q=perro&tipo=necesitan&categoria=mascotas&sub=paseo-perros&en=valencia&radio=25&modalidad=domicilio&min=5&max=20&precio=fijo&valoracion=4.5&verificados=1&fotos=1&recientes=1&urgentes=1&orden=precio&pagina=3';
    expect(toSearchQuery(parseSearchParams(new URLSearchParams(query)))).toBe(query);
  });
  it('omite valores por defecto', () => expect(toSearchQuery({})).toBe(''));
});

describe('utilidades', () => {
  it('cuenta filtros activos', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, q: 'x', category: 'mascotas', verifiedOnly: true, sort: 'rating' })).toBe(2);
  });

  it('genera argumentos para la función SQL', () => {
    const args = toSearchRpcArgs({ ...DEFAULT_FILTERS, recentOnly: true, page: 3 }, 20);
    expect(args.p_recent_days).toBe(7);
    expect(args.p_offset).toBe(40);
    expect(args.p_limit).toBe(20);
    expect(toSearchRpcArgs({ ...DEFAULT_FILTERS, page: 50 }, 50).p_offset).toBe(1000);
  });

  it('solo indexa combinaciones canónicas', () => {
    expect(isIndexableSearch({ ...DEFAULT_FILTERS, category: 'mascotas', municipality: 'valencia' })).toBe(true);
    expect(isIndexableSearch({ ...DEFAULT_FILTERS, q: 'perro' })).toBe(false);
    expect(isIndexableSearch({ ...DEFAULT_FILTERS, page: 2 })).toBe(false);
  });
});
