"use client";

import { Globe } from "lucide-react";
import { LOCALES, useT, type Locale } from "@/lib/i18n";

export function LanguagePicker({ className }: { className?: string }) {
  const { locale, setLocale, t } = useT();

  return (
    <div className={className}>
      <label htmlFor="locale" className="sr-only">
        {t("common.language")}
      </label>
      <div className="relative">
        <Globe
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <select
          id="locale"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="h-11 appearance-none rounded-full border border-border bg-transparent pr-4 pl-9 text-[15px] text-text-muted transition-colors hover:border-border-strong hover:text-text"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
