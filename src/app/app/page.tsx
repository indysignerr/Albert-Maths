"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, LogOut, MessagesSquare, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import type { Problem } from "@/lib/database.types";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguagePicker } from "@/components/language-picker";
import { Button } from "@/components/ui/button";
import { Tex } from "@/components/tex";

interface Progress {
  errorsUnderstood: number;
  consolidationsPassed: number;
}

export default function AppHome() {
  const { session, profile, ready, signOut } = useAuth();
  const { t } = useT();
  const router = useRouter();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [progress, setProgress] = useState<Progress>({
    errorsUnderstood: 0,
    consolidationsPassed: 0,
  });
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/signin/");
    else if (profile && !profile.onboarded_at) router.replace("/onboarding/");
  }, [ready, session, profile, router]);

  const load = useCallback(async () => {
    const [recent, events, used, limit] = await Promise.all([
      supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("progress_events").select("kind"),
      supabase.rpc("problems_today"),
      supabase.rpc("daily_problem_limit"),
    ]);

    setProblems(recent.data ?? []);

    const kinds = events.data ?? [];
    setProgress({
      errorsUnderstood: kinds.filter((e) => e.kind === "error_understood")
        .length,
      consolidationsPassed: kinds.filter(
        (e) => e.kind === "consolidation_passed",
      ).length,
    });

    if (typeof used.data === "number" && typeof limit.data === "number") {
      setQuotaLeft(Math.max(0, limit.data - used.data));
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    // The await runs before any setState, so nothing here updates state during
    // the effect itself.
    void (async () => {
      await load();
    })();
  }, [session, load]);

  if (!ready || !session) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-muted">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-18 w-full max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/app/" className="text-lg">
            <AlbertLogo />
          </Link>
          <div className="flex items-center gap-2">
            <LanguagePicker className="hidden sm:block" />
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
            >
              <LogOut className="size-[18px]" aria-hidden />
              <span className="hidden sm:inline">{t("common.signOut")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mesh-albert flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
          <h1 className="font-display text-3xl font-light sm:text-4xl">
            {profile?.first_name
              ? t("dashboard.greeting", { name: profile.first_name })
              : t("dashboard.greetingAnonymous")}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-text-muted">
            {t("dashboard.prompt")}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Link
              href="/solve/"
              className="rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-400"
            >
              <Camera className="size-6 text-accent" aria-hidden />
              <h2 className="mt-5 text-xl font-medium">
                {t("dashboard.newProblem")}
              </h2>
              <p className="mt-2 leading-relaxed text-text-muted">
                {t("dashboard.newProblemBody")}
              </p>
              {quotaLeft !== null && (
                <p className="mt-4 text-sm text-text-faint">
                  {t("dashboard.quotaLeft", { n: quotaLeft })}
                </p>
              )}
            </Link>

            <Link
              href="/classes/"
              className="rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-400"
            >
              <MessagesSquare className="size-6 text-accent" aria-hidden />
              <h2 className="mt-5 text-xl font-medium">
                {t("dashboard.yourClass")}
              </h2>
              <p className="mt-2 leading-relaxed text-text-muted">
                {t("dashboard.yourClassBody")}
              </p>
            </Link>
          </div>

          <section className="mt-12">
            <h2 className="text-sm tracking-wide text-text-faint uppercase">
              {t("dashboard.progressTitle")}
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Stat
                value={progress.errorsUnderstood}
                label={t("dashboard.errorsUnderstood")}
              />
              <Stat
                value={progress.consolidationsPassed}
                label={t("dashboard.consolidationsPassed")}
              />
            </div>
            <p className="mt-3 text-sm text-text-faint">
              {t("dashboard.progressNote")}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-sm tracking-wide text-text-faint uppercase">
              {t("dashboard.recent")}
            </h2>

            {problems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-7">
                <Sparkles className="size-5 text-text-faint" aria-hidden />
                <h3 className="mt-4 text-lg font-medium">
                  {t("dashboard.empty")}
                </h3>
                <p className="mt-2 max-w-lg leading-relaxed text-text-muted">
                  {t("dashboard.emptyBody")}
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {problems.map((problem) => (
                  <li
                    key={problem.id}
                    className="flex items-center justify-between gap-5 rounded-xl border border-border bg-surface px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate">
                        <Tex raw>
                          {problem.statement_latex ??
                            problem.statement_plain ??
                            "…"}
                        </Tex>
                      </div>
                      <p className="mt-1 text-sm text-text-faint">
                        {problem.topic ?? "—"} ·{" "}
                        {new Date(problem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="font-display text-4xl font-light tabular-nums text-accent">
        {value}
      </p>
      <p className="mt-1 text-[15px] text-text-muted">{label}</p>
    </div>
  );
}
