"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { I18nProvider, LOCALES, STORAGE_KEY, type Locale } from "./index";

const codes = LOCALES.map((l) => l.code) as readonly string[];
const CHANGED = "albert-locale-changed";

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && codes.includes(value);
}

/**
 * The device preference lives in localStorage, which React cannot see during
 * render. Subscribing to it — rather than copying it into state on mount —
 * keeps one source of truth and satisfies hydration: the server snapshot is
 * always English.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function deviceLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* private mode */
  }
  const browser = navigator.language.slice(0, 2);
  return isLocale(browser) ? browser : "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { profile, session, refreshProfile } = useAuth();
  const device = useSyncExternalStore(
    subscribe,
    deviceLocale,
    () => "en" as Locale,
  );

  // A choice made in this session wins over everything, because the profile in
  // memory still holds the old value until the write lands and the refresh
  // returns — long enough for a stale profile to overwrite the click that just
  // happened, which is exactly what it did.
  const [chosen, setChosen] = useState<Locale | null>(null);

  // Below that, the profile: the track picked at onboarding is a deliberate
  // statement about which language the student works in. Then the device, then
  // English.
  const locale: Locale =
    chosen ?? (isLocale(profile?.ui_locale) ? profile.ui_locale : device);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const change = useCallback(
    (next: Locale) => {
      setChosen(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the choice just will not persist */
      }
      window.dispatchEvent(new Event(CHANGED));

      if (session) {
        void supabase
          .from("profiles")
          .update({ ui_locale: next })
          .eq("id", session.user.id)
          .then(() => refreshProfile());
      }
    },
    [session, refreshProfile],
  );

  return (
    <I18nProvider locale={locale} onLocaleChange={change}>
      {children}
    </I18nProvider>
  );
}
