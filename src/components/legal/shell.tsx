"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguagePicker } from "@/components/language-picker";
import { useT } from "@/lib/i18n";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const { t } = useT();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-18 w-full max-w-3xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label={t("common.back")}
              className="flex size-11 items-center justify-center rounded-full text-text-muted hover:text-text"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
            <AlbertLogo className="text-base" />
          </div>
          <div className="flex items-center gap-2">
            <LanguagePicker className="hidden sm:block" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <article className="prose mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
          <h1>{title}</h1>
          <p className="lead">{t("legal.lastUpdated", { date: updated })}</p>
          {children}
        </article>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-3xl gap-6 px-5 py-8 text-sm text-text-faint sm:px-8">
          <Link
            href="/privacy/"
            className="flex h-11 items-center hover:text-text"
          >
            {t("landing.privacy")}
          </Link>
          <Link
            href="/terms/"
            className="flex h-11 items-center hover:text-text"
          >
            {t("landing.terms")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
