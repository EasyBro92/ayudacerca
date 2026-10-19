import { limits } from '../config/limits';
import type { ListingKind, Modality, PriceType, SortOption } from '../listings/enums';

/**
 * Filtros de búsqueda. Viajan en la URL con nombres legibles en español
 * (?q=perro&tipo=ofrecen&en=barcelona&radio=10) para poder compartir resultados.
 * Los valores no válidos se ignoran en silencio: una URL manipulada nunca rompe la página.
 */
export interface SearchFilters {
  q: string | null;
  kind: ListingKind | null;
  category: string | null;
  subcategory: string | null;
  municipality: string | null;
  radiusKm: number | null;
  modality: Modality | null;
  priceMinCents: number | null;
  priceMaxCents: number | null;
  priceType: PriceType | null;
  minRating: number | null;
  verifiedOnly: boolean;
  withPhoto: boolean;
  recentOnly: boolean;
  urgentOnly: boolean;
  sort: SortOption;
  page: number;
}

export const DEFAULT_FILTERS: SearchFilters = {
  q: null, kind: null, category: null, subcategory: null, municipality: null, radiusKm: null,
  modality: null, priceMinCents: null, priceMaxCents: null, priceType: null, minRating: null,
  verifiedOnly: false, withPhoto: false, recentOnly: false, urgentOnly: false, sort: 'relevance', page: 1,
};

const KIND_PARAM: Record<string, ListingKind> = { ofrecen: 'offer', necesitan: 'request' };
const MODALITY_PARAM: Record<string, Modality> = {
  online: 'online', presencial: 'in_person', hibrido: 'hybrid', domicilio: 'at_home', acordado: 'agreed_location',
};
const PRICE_TYPE_PARAM: Record<string, PriceType> = {
  fijo: 'fixed', hora: 'hourly', dia: 'daily', presupuesto: 'quote', gratis: 'free', intercambio: 'exchange',
};
const SORT_PARAM: Record<string, SortOption> = {
  relevancia: 'relevance', recientes: 'recent', cercanos: 'nearest', precio: 'price_asc', valoracion: 'rating', respuesta: 'response',
};

const invert = <K extends string, V extends string>(map: Record<K, V>): Record<V, K> =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<V, K>;
const KIND_OUT = invert(KIND_PARAM);
const MODALITY_OUT = invert(MODALITY_PARAM);
const PRICE_TYPE_OUT = invert(PRICE_TYPE_PARAM);
const SORT_OUT = invert(SORT_PARAM);

const SLUG = /^[a-z0-9-]{1,80}$/;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: RawParams, key: string): string | null {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  const single = Array.isArray(value) ? value[0] : value;
  if (single === undefined || single === null) return null;
  const trimmed = single.trim();
  return trimmed === '' ? null : trimmed;
}

function readEurosAsCents(params: RawParams, key: string): number | null {
  const raw = read(params, key);
  if (raw === null || !/^\d{1,6}$/.test(raw)) return null;
  return Number(raw) * 100;
}

function readFlag(params: RawParams, key: string): boolean {
  return read(params, key) === '1';
}

export function parseSearchParams(params: RawParams): SearchFilters {
  const q = read(params, 'q');
  const category = read(params, 'categoria');
  const subcategory = read(params, 'sub');
  const municipality = read(params, 'en');
  const radius = Number(read(params, 'radio'));
  const rating = Number(read(params, 'valoracion'));
  const page = Number(read(params, 'pagina'));
  const sortRaw = read(params, 'orden');

  const filters: SearchFilters = {
    q: q ? q.slice(0, 100) : null,
    kind: KIND_PARAM[read(params, 'tipo') ?? ''] ?? null,
    category: category && SLUG.test(category) ? category : null,
    subcategory: subcategory && SLUG.test(subcategory) ? subcategory : null,
    municipality: municipality && SLUG.test(municipality) ? municipality : null,
    radiusKm: (limits.search.radiusOptionsKm as readonly number[]).includes(radius) ? radius : null,
    modality: MODALITY_PARAM[read(params, 'modalidad') ?? ''] ?? null,
    priceMinCents: readEurosAsCents(params, 'min'),
    priceMaxCents: readEurosAsCents(params, 'max'),
    priceType: PRICE_TYPE_PARAM[read(params, 'precio') ?? ''] ?? null,
    minRating: [3, 4, 4.5].includes(rating) ? rating : null,
    verifiedOnly: readFlag(params, 'verificados'),
    withPhoto: readFlag(params, 'fotos'),
    recentOnly: readFlag(params, 'recientes'),
    urgentOnly: readFlag(params, 'urgentes'),
    sort: SORT_PARAM[sortRaw ?? ''] ?? 'relevance',
    page: Number.isInteger(page) && page >= 1 && page <= 50 ? page : 1,
  };

  if (filters.subcategory && !filters.category) filters.subcategory = null;
  if (filters.radiusKm && !filters.municipality) filters.radiusKm = null;
  if (filters.sort === 'nearest' && !filters.municipality) filters.sort = 'relevance';
  if (filters.priceMinCents !== null && filters.priceMaxCents !== null && filters.priceMinCents > filters.priceMaxCents) {
    [filters.priceMinCents, filters.priceMaxCents] = [filters.priceMaxCents, filters.priceMinCents];
  }
  return filters;
}

/** Serializa en orden estable y omitiendo valores por defecto (URLs canónicas). */
export function toSearchQuery(filters: Partial<SearchFilters>): string {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const out = new URLSearchParams();
  if (f.q) out.set('q', f.q);
  if (f.kind) out.set('tipo', KIND_OUT[f.kind]);
  if (f.category) out.set('categoria', f.category);
  if (f.category && f.subcategory) out.set('sub', f.subcategory);
  if (f.municipality) out.set('en', f.municipality);
  if (f.municipality && f.radiusKm) out.set('radio', String(f.radiusKm));
  if (f.modality) out.set('modalidad', MODALITY_OUT[f.modality]);
  if (f.priceMinCents !== null) out.set('min', String(Math.floor(f.priceMinCents / 100)));
  if (f.priceMaxCents !== null) out.set('max', String(Math.floor(f.priceMaxCents / 100)));
  if (f.priceType) out.set('precio', PRICE_TYPE_OUT[f.priceType]);
  if (f.minRating !== null) out.set('valoracion', String(f.minRating));
  if (f.verifiedOnly) out.set('verificados', '1');
  if (f.withPhoto) out.set('fotos', '1');
  if (f.recentOnly) out.set('recientes', '1');
  if (f.urgentOnly) out.set('urgentes', '1');
  if (f.sort !== 'relevance') out.set('orden', SORT_OUT[f.sort]);
  if (f.page > 1) out.set('pagina', String(f.page));
  return out.toString();
}

/** Número de filtros activos (para el botón «Filtros (3)»). No cuenta texto, orden ni página. */
export function activeFilterCount(f: SearchFilters): number {
  return [
    f.kind, f.category, f.subcategory, f.municipality, f.radiusKm, f.modality, f.priceMinCents,
    f.priceMaxCents, f.priceType, f.minRating,
  ].filter((v) => v !== null).length + [f.verifiedOnly, f.withPhoto, f.recentOnly, f.urgentOnly].filter(Boolean).length;
}

/**
 * Argumentos para la función SQL public.search_listings.
 * Solo incluye los filtros activos: el resto toma los valores por defecto de la función.
 */
export function toSearchRpcArgs(f: SearchFilters, pageSize: number = limits.search.pageSize) {
  const args: {
    p_query?: string; p_kind?: ListingKind; p_category?: string; p_subcategory?: string; p_municipality?: string;
    p_radius_km?: number; p_modality?: Modality; p_price_min?: number; p_price_max?: number; p_price_type?: PriceType;
    p_min_rating?: number; p_verified_only?: boolean; p_with_photo?: boolean; p_recent_days?: number; p_urgent_only?: boolean;
    p_sort: SortOption; p_limit: number; p_offset: number;
  } = {
    p_sort: f.sort,
    p_limit: pageSize,
    p_offset: Math.min((f.page - 1) * pageSize, limits.search.maxOffset),
  };
  if (f.q !== null) args.p_query = f.q;
  if (f.kind !== null) args.p_kind = f.kind;
  if (f.category !== null) args.p_category = f.category;
  if (f.subcategory !== null) args.p_subcategory = f.subcategory;
  if (f.municipality !== null) args.p_municipality = f.municipality;
  if (f.radiusKm !== null) args.p_radius_km = f.radiusKm;
  if (f.modality !== null) args.p_modality = f.modality;
  if (f.priceMinCents !== null) args.p_price_min = f.priceMinCents;
  if (f.priceMaxCents !== null) args.p_price_max = f.priceMaxCents;
  if (f.priceType !== null) args.p_price_type = f.priceType;
  if (f.minRating !== null) args.p_min_rating = f.minRating;
  if (f.verifiedOnly) args.p_verified_only = true;
  if (f.withPhoto) args.p_with_photo = true;
  if (f.recentOnly) args.p_recent_days = 7;
  if (f.urgentOnly) args.p_urgent_only = true;
  return args;
}

/**
 * ¿Debe indexarse esta combinación? Solo la búsqueda base, categoría, subcategoría y municipio.
 * Cualquier otro filtro → noindex (evita indexar combinaciones infinitas).
 */
export function isIndexableSearch(f: SearchFilters): boolean {
  return (
    f.q === null && f.kind === null && f.radiusKm === null && f.modality === null && f.priceMinCents === null &&
    f.priceMaxCents === null && f.priceType === null && f.minRating === null && !f.verifiedOnly && !f.withPhoto &&
    !f.recentOnly && !f.urgentOnly && f.sort === 'relevance' && f.page === 1
  );
}
