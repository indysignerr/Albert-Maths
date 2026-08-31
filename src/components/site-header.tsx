"use client";

import Link from "next/link";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguagePicker } from "@/components/language-picker";
import { useT } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useT();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/85">
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="flex h-11 items-center rounded-md text-lg text-text transition-opacity hover:opacity-80"
        >
          <AlbertLogo />
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] text-text-muted md:flex">
          <a
            href="#how"
            className="flex h-11 items-center transition-colors hover:text-text"
          >
            {t("nav.howItWorks")}
          </a>
          <a
            href="#principles"
            className="flex h-11 items-center transition-colors hover:text-text"
          >
            {t("nav.principles")}
          </a>
          <a
            href="#classes"
            className="flex h-11 items-center transition-colors hover:text-text"
          >
            {t("nav.classes")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguagePicker className="hidden sm:block" />
          <ThemeToggle />
          <Link
            href="/signin/"
            className="inline-flex h-11 items-center rounded-full bg-navy-800 px-5 text-[15px] font-medium text-white transition-colors hover:bg-navy-700 dark:bg-brand-500 dark:text-navy-950 dark:hover:bg-brand-400"
          >
            {t("common.signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
}
