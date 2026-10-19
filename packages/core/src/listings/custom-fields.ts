/** Validación de los campos personalizados que define cada categoría (tabla category_fields). */
export interface CategoryFieldDef {
  key: string;
  field_type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';
  is_required: boolean;
  options: { value: string }[] | null;
  validation: { min?: number; max?: number; maxLength?: number } | null;
}

export type CustomValue = string | number | boolean | string[];

/**
 * Limpia y valida. Devuelve los valores normalizados (sin claves desconocidas ni vacías)
 * y los errores como claves de traducción del namespace «validation».
 */
export function validateCustomValues(fields: readonly CategoryFieldDef[], raw: Record<string, unknown>) {
  const values: Record<string, CustomValue> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = raw[f.key];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (empty) {
      if (f.is_required) errors[f.key] = 'required';
      continue;
    }
    const allowed = new Set((f.options ?? []).map((o) => o.value));
    switch (f.field_type) {
      case 'text':
      case 'textarea': {
        const s = String(v).trim();
        const max = f.validation?.maxLength ?? (f.field_type === 'text' ? 200 : 1000);
        if (s.length > max) errors[f.key] = 'tooLong';
        else values[f.key] = s;
        break;
      }
      case 'number': {
        const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
        if (!Number.isFinite(n)) errors[f.key] = 'invalidNumber';
        else if ((f.validation?.min !== undefined && n < f.validation.min) || (f.validation?.max !== undefined && n > f.validation.max)) errors[f.key] = 'outOfRange';
        else values[f.key] = n;
        break;
      }
      case 'boolean':
        values[f.key] = v === true || v === 'true' || v === 'on';
        break;
      case 'select':
        if (!allowed.has(String(v))) errors[f.key] = 'invalidOption';
        else values[f.key] = String(v);
        break;
      case 'multiselect': {
        const arr = (Array.isArray(v) ? v : [v]).map(String);
        if (arr.some((x) => !allowed.has(x))) errors[f.key] = 'invalidOption';
        else values[f.key] = arr;
        break;
      }
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v)) || Number.isNaN(Date.parse(String(v)))) errors[f.key] = 'invalidDate';
        else values[f.key] = String(v);
        break;
    }
  }
  return { values, errors, ok: Object.keys(errors).length === 0 };
}
