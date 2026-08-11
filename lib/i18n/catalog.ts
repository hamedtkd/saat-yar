import { enCatalog } from "./en.ts";
import { faCatalog, type MessageKey } from "./fa.ts";
import type { Locale } from "./locales.ts";

const catalogs = {
  "fa-IR": faCatalog,
  en: enCatalog,
} satisfies Record<Locale, Record<MessageKey, string>>;

export type MessageParams = Record<string, string | number>;

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const template = catalogs[locale][key] ?? faCatalog[key];
  if (!params) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token: string) => {
    const value = params[token];
    return value === undefined ? match : String(value);
  });
}

export { type MessageKey } from "./fa.ts";
