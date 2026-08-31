"use client";

import Link from "next/link";
import {
  Camera,
  Compass,
  MessagesSquare,
  ScanSearch,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AlbertMark } from "@/components/brand/logo";
import { useT } from "@/lib/i18n";

const STEP_ICONS = [Camera, Compass, ScanSearch];
const PRINCIPLE_ICONS = [ShieldCheck, MessagesSquare, Users];

interface Item {
  title: string;
  body: string;
}

export default function Home() {
  const { t, list } = useT();
  const steps = list<readonly Item[]>("landing.steps");
  const principles = list<readonly Item[]>("landing.principles");

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="mesh-albert relative overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 pt-20 pb-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-28 lg:pb-32">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-[13px] tracking-wide text-text-muted">
                <span
                  className="size-1.5 rounded-full bg-brand-500"
                  aria-hidden
                />
                {t("landing.badge")}
              </p>

              <h1 className="mt-7 font-display text-[2.75rem] leading-[1.05] font-extralight sm:text-6xl lg:text-[4.25rem]">
                {t("landing.titleBefore")}
                <em className="text-gradient-albert font-normal not-italic">
                  {t("landing.titleHighlight")}
                </em>
                {t("landing.titleAfter")}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
                {t("landing.lede")}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signin/"
                  className="inline-flex h-13 items-center rounded-full bg-navy-800 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-brand-500 dark:text-navy-950"
                >
                  {t("landing.ctaPrimary")}
                </Link>
                <a
                  href="#principles"
                  className="inline-flex h-13 items-center rounded-full border border-border-strong px-7 text-base text-text transition-colors hover:bg-surface"
                >
                  {t("landing.ctaSecondary")}
                </a>
              </div>

              <p className="mt-6 text-sm text-text-faint">
                {t("landing.reassurance")}
              </p>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-6 rounded-[2rem] blur-3xl"
                style={{ background: "var(--glow)" }}
                aria-hidden
              />
              <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_70px_-30px_rgba(32,36,72,0.45)]">
                <div className="flex items-center gap-2.5 border-b border-border pb-4">
                  <AlbertMark className="size-6" />
                  <span className="text-sm text-text-muted">Analysis II</span>
                </div>

                <p className="mt-5 font-mono text-[15px] text-text">
                  lim<sub className="text-text-faint">x→0</sub> (sin&nbsp;3x) /
                  (tan&nbsp;5x)
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                    <p className="text-xs tracking-wide text-text-faint uppercase">
                      {t("solve.hints")} 1 / 4
                    </p>
                    <p className="mt-1.5 text-[15px] text-text-muted">
                      {list<readonly string[]>("solve.levels")[0]}
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3">
                    <span className="text-[15px] text-text-faint">
                      {list<readonly string[]>("solve.levels")[3]}
                    </span>
                    <span className="rounded-full bg-bg-subtle px-3 py-1 text-xs text-text-faint">
                      🔒
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <h2 className="max-w-2xl font-display text-3xl leading-tight font-light sm:text-4xl">
              {t("landing.stepsTitle")}
            </h2>

            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <li key={step.title}>
                    <span className="font-display text-sm text-accent tabular-nums">
                      0{i + 1}
                    </span>
                    <Icon className="mt-4 size-6 text-text-muted" aria-hidden />
                    <h3 className="mt-4 text-xl font-medium">{step.title}</h3>
                    <p className="mt-3 leading-relaxed text-text-muted">
                      {step.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="principles" className="mesh-albert border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <h2 className="max-w-2xl font-display text-3xl leading-tight font-light sm:text-4xl">
              {t("landing.principlesTitle")}
              <br />
              <span className="text-text-muted">
                {t("landing.principlesSubtitle")}
              </span>
            </h2>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {principles.map((p, i) => {
                const Icon = PRINCIPLE_ICONS[i];
                return (
                  <article
                    key={p.title}
                    className="rounded-2xl border border-border bg-surface/80 p-7"
                  >
                    <Icon className="size-6 text-accent" aria-hidden />
                    <h3 className="mt-5 text-lg font-medium">{p.title}</h3>
                    <p className="mt-3 leading-relaxed text-text-muted">
                      {p.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="classes" className="border-t border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl leading-tight font-light sm:text-4xl">
                {t("landing.classesTitle")}
              </h2>
              <p className="mt-6 leading-relaxed text-text-muted">
                {t("landing.classesBody1")}
              </p>
              <p className="mt-4 leading-relaxed text-text-muted">
                {t("landing.classesBody2")}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-7">
              <p className="text-xs tracking-wide text-text-faint uppercase">
                B1 · Milan · Analysis II
              </p>
              <div className="mt-5 space-y-4 text-[15px]">
                <p className="text-text-muted">
                  <span className="font-medium text-text">Léa M.</span> — I keep
                  losing the sign when I integrate by parts, anyone else?
                </p>
                <p className="text-text-muted">
                  <span className="font-medium text-text">Tomás R.</span> —
                  write u and dv in a column first, it stopped happening to me
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-navy-800 text-white dark:bg-navy-900">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 text-center sm:px-8">
            <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight font-light sm:text-4xl">
              {t("landing.ctaTitle")}
            </h2>
            <Link
              href="/signin/"
              className="mt-9 inline-flex h-13 items-center rounded-full bg-brand-500 px-8 text-base font-medium text-navy-950 transition-transform hover:-translate-y-0.5"
            >
              {t("landing.ctaButton")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{t("common.disclaimer")}</p>
          <div className="flex gap-6">
            <Link
              href="/privacy/"
              className="flex h-11 items-center transition-colors hover:text-text"
            >
              {t("landing.privacy")}
            </Link>
            <Link
              href="/terms/"
              className="flex h-11 items-center transition-colors hover:text-text"
            >
              {t("landing.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
