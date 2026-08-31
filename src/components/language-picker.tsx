"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LOCALES, useT, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * A native <select> renders the operating system's own menu — white, system
 * font, ignoring every token in this app. This is a plain button and list so it
 * can be styled, at the cost of re-implementing the keyboard behaviour the
 * native control gave for free.
 */
export function LanguagePicker({ className }: { className?: string }) {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Focus goes back where it came from, or the tab order restarts at the
      // top of the page.
      button.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  function choose(code: Locale) {
    setLocale(code);
    setOpen(false);
    button.current?.focus();
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((shown) => !shown)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${t("common.language")}: ${current.label}`}
        className="flex h-11 items-center gap-2 rounded-full border border-border px-4 text-[15px] text-text-muted transition-colors hover:border-border-strong hover:text-text"
      >
        <Globe className="size-4 shrink-0" aria-hidden />
        <span className="tracking-wide uppercase">{current.code}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className="absolute top-full right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[0_18px_40px_-24px_rgba(0,0,0,.6)]"
        >
          {LOCALES.map((option) => {
            const selected = option.code === locale;
            return (
              <li key={option.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(option.code)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px] transition-colors",
                    selected
                      ? "text-text"
                      : "text-text-muted hover:bg-surface-raised hover:text-text",
                  )}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      selected ? "text-accent" : "opacity-0",
                    )}
                    aria-hidden
                  />
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
