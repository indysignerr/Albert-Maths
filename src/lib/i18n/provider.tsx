"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { I18nProvider, LOCALES, STORAGE_KEY, type Locale } from "./index";

const codes = LOCALES.map((l) => l.code) as readonly string[];

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && codes.includes(value);
}

function stored(): Locale | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Resolution order: the signed-in profile wins, because the track chosen at
 * onboarding is a deliberate statement about which language the student works
 * in. Below that, a previous choice on this device, then the browser, then
 * English.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { profile, session } = useAuth();
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const fromProfile = profile?.ui_locale;
    if (isLocale(fromProfile)) {
      setLocale(fromProfile);
      return;
    }
    const fallback =
      stored() ??
      (isLocale(navigator.language.slice(0, 2))
        ? (navigator.language.slice(0, 2) as Locale)
        : "en");
    setLocale(fallback);
  }, [profile]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const change = useCallback(
    (next: Locale) => {
      setLocale(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the choice just will not persist */
      }
      if (session) {
        void supabase
          .from("profiles")
          .update({ ui_locale: next })
          .eq("id", session.user.id);
      }
    },
    [session],
  );

  return (
    <I18nProvider locale={locale} onLocaleChange={change}>
      {children}
    </I18nProvider>
  );
}
