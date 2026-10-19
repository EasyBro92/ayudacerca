type I18n = { es: string; ca: string; en: string };
export declare const categories: ReadonlyArray<{
  slug: string;
  icon: string;
  color: string;
  name: I18n;
  description: I18n;
  warnings?: I18n;
  restrictions?: I18n;
  sensitive?: boolean;
  review?: boolean;
  photos?: boolean;
  verifications?: string[];
  subs: ReadonlyArray<readonly [string, I18n]>;
  fields?: ReadonlyArray<unknown>;
}>;
