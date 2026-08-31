"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { en, type Dictionary } from "./en";
import { fr, type PartialDictionary } from "./fr";

export const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  // Milan and Madrid follow the same programme; the dictionaries are the only
  // thing missing, and an untranslated key falls back to English.
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const DICTIONARIES: Record<Locale, PartialDictionary> = {
  en,
  fr,
  it: {},
  es: {},
};

export const STORAGE_KEY = "albert-locale";

/** A path into the dictionary, e.g. "solve.findMistake". */
type Section = keyof Dictionary;

interface I18n {
  locale: Locale;
  /** Look up a key, filling {placeholders} from `values`. */
  t: (path: string, values?: Record<string, string | number>) => string;
  /** Look up an array or object leaf, e.g. the four hint level names. */
  list: <T>(path: string) => T;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18n | null>(null);

function lookup(dict: PartialDictionary | Dictionary, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[key]
          : undefined,
      dict,
    );
}

function interpolate(
  template: string,
  values?: Record<string, string | number>,
) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

export function I18nProvider({
  locale,
  onLocaleChange,
  children,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: React.ReactNode;
}) {
  const resolve = useCallback(
    (path: string): unknown => {
      const translated = lookup(DICTIONARIES[locale] ?? {}, path);
      // Falling back per key, not per locale, means a half-finished translation
      // still ships: only the missing strings appear in English.
      return translated ?? lookup(en, path);
    },
    [locale],
  );

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale: onLocaleChange,
      t: (path, values) => {
        const found = resolve(path);
        // Surfacing the key beats rendering an empty element: a typo in a path
        // is then obvious on screen instead of silently blank.
        return typeof found === "string" ? interpolate(found, values) : path;
      },
      list: <T,>(path: string) => resolve(path) as T,
    }),
    [locale, onLocaleChange, resolve],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}

export type { Section };
