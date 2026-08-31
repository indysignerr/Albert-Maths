"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, GraduationCap, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { rememberDestination } from "@/lib/auth-redirect";
import { api } from "@/lib/api";
import { answersMatch, evaluateExpression } from "@/lib/verify";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguagePicker } from "@/components/language-picker";
import { Button } from "@/components/ui/button";
import { Tex } from "@/components/tex";
import { cn } from "@/lib/utils";

const DRILL_LENGTH = 8;

interface Item {
  statement_latex: string;
  sympy: string;
  topic: string;
  /** Computed here from `sympy` — never taken from the model. */
  expected: string | null;
}

type Phase = "choosing" | "building" | "drilling" | "done";

export default function RevisePage() {
  const { session, profile, ready } = useAuth();
  const { t } = useT();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("choosing");
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState<
    "checking" | "right" | "wrong" | "unreadable" | null
  >(null);
  const [results, setResults] = useState<{ topic: string; correct: boolean }[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) {
      rememberDestination(window.location.pathname);
      router.replace("/signin/");
    }
  }, [ready, session, router]);

  /**
   * The drill is built from what this student got wrong, not from a syllabus.
   * Nobody photographs thirty exercises on a Sunday evening, and the app already
   * knows which ones broke.
   */
  const loadHistory = useCallback(async () => {
    const { data: failed } = await supabase
      .from("attempts")
      .select("problem_id, error_step, is_correct")
      .eq("is_correct", false)
      .order("created_at", { ascending: false })
      .limit(40);
    if (!failed?.length) return;

    const { data: problems } = await supabase
      .from("problems")
      .select("id, topic")
      .in(
        "id",
        failed.map((a) => a.problem_id),
      );

    const topicOf = new Map(problems?.map((p) => [p.id, p.topic]) ?? []);
    const topics = [
      ...new Set(
        failed
          .map((a) => topicOf.get(a.problem_id))
          .filter((x): x is string => !!x),
      ),
    ];
    setWeakTopics(topics);
    setChosen(new Set(topics));
    setMistakes(
      [
        ...new Set(
          failed.map((a) => a.error_step).filter((x): x is string => !!x),
        ),
      ].slice(0, 8),
    );
  }, []);

  useEffect(() => {
    if (!session) return;
    void (async () => {
      await loadHistory();
    })();
  }, [session, loadHistory]);

  async function start() {
    setPhase("building");
    setError(null);
    try {
      const { exercises } = await api.revision({
        topics: [...chosen],
        mistakes,
        count: DRILL_LENGTH,
        language: profile?.ui_locale ?? "en",
      });

      // Every answer is computed here. The model is never asked for one.
      const built = await Promise.all(
        exercises.map(async (e) => ({
          ...e,
          expected: await evaluateExpression(e.sympy),
        })),
      );
      const usable = built.filter((e) => e.expected);
      if (!usable.length) throw new Error(t("errors.generic"));

      setItems(usable);
      setIndex(0);
      setResults([]);
      setAnswer("");
      setVerdict(null);
      setPhase("drilling");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
      setPhase("choosing");
    }
  }

  async function check() {
    const item = items[index];
    if (!item.expected || !answer.trim()) return;
    setVerdict("checking");
    const result = await answersMatch(answer.trim(), item.expected);
    if (result.status === "verified") {
      setVerdict("right");
      setResults((r) => [...r, { topic: item.topic, correct: true }]);
    } else if (result.status === "contradicted") {
      setVerdict("wrong");
      setResults((r) => [...r, { topic: item.topic, correct: false }]);
    } else {
      setVerdict("unreadable");
    }
  }

  async function next() {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setAnswer("");
      setVerdict(null);
      return;
    }

    const correct = results.filter((r) => r.correct).length;
    await supabase.from("revision_sessions").insert({
      profile_id: session!.user.id,
      topics: [...chosen],
      total: results.length,
      correct,
      results,
    });
    setPhase("done");
  }

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
        <div className="mx-auto flex h-18 w-full max-w-3xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/app/"
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

      <main className="mesh-albert flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
          {phase === "choosing" && (
            <ChoosingStep
              weakTopics={weakTopics}
              chosen={chosen}
              onToggle={(topic) =>
                setChosen((current) => {
                  const next = new Set(current);
                  if (next.has(topic)) next.delete(topic);
                  else next.add(topic);
                  return next;
                })
              }
              onStart={start}
              error={error}
            />
          )}

          {phase === "building" && (
            <p className="text-text-muted">{t("revise.building")}</p>
          )}

          {phase === "drilling" && items[index] && (
            <>
              <p className="text-sm tracking-wide text-text-faint uppercase">
                {t("revise.question", { n: index + 1, total: items.length })}
              </p>
              <div
                className="mt-3 h-1 rounded-full bg-bg-subtle"
                role="progressbar"
                aria-valuenow={index + 1}
                aria-valuemin={1}
                aria-valuemax={items.length}
              >
                <div
                  className="h-1 rounded-full bg-accent transition-all"
                  style={{ width: `${((index + 1) / items.length) * 100}%` }}
                />
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-7">
                <p className="text-xs tracking-wide text-text-faint uppercase">
                  {items[index].topic}
                </p>
                <div className="mt-3 text-lg">
                  <Tex block raw>
                    {items[index].statement_latex}
                  </Tex>
                </div>

                <label
                  htmlFor="drill-answer"
                  className="mt-7 block text-sm font-medium"
                >
                  {t("revise.yourAnswer")}
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="drill-answer"
                    value={answer}
                    autoComplete="off"
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !verdict) void check();
                    }}
                    disabled={verdict === "right" || verdict === "wrong"}
                    className="h-11 flex-1 rounded-xl border border-border bg-bg px-4 font-mono text-sm disabled:opacity-60"
                  />
                  {verdict === "right" || verdict === "wrong" ? (
                    <Button onClick={next}>
                      {index + 1 < items.length
                        ? t("revise.next")
                        : t("revise.finish")}
                    </Button>
                  ) : (
                    <Button
                      onClick={check}
                      disabled={!answer.trim() || verdict === "checking"}
                    >
                      {verdict === "checking"
                        ? t("revise.checking")
                        : t("revise.check")}
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm text-text-faint">
                  {t("revise.answerHint", {
                    examples: "1 - 2*exp(-1), pi/4, sqrt(2)/2",
                  })}
                </p>

                {verdict === "right" && (
                  <p className="mt-4 flex items-center gap-2 text-[15px] text-[var(--color-success)]">
                    <Check className="size-4" aria-hidden />
                    {t("revise.correct")}
                  </p>
                )}
                {verdict === "wrong" && (
                  <p className="mt-4 flex items-center gap-2 text-[15px] text-text-muted">
                    <X
                      className="size-4 text-[var(--color-danger)]"
                      aria-hidden
                    />
                    {t("revise.wrong")}
                  </p>
                )}
                {verdict === "unreadable" && (
                  <p className="mt-4 text-[15px] text-text-muted">
                    {t("revise.unreadable", {
                      example: "2*sin(2) + cos(2) - 1",
                    })}
                  </p>
                )}
              </div>
            </>
          )}

          {phase === "done" && (
            <Report
              results={results}
              onAgain={() => {
                setPhase("choosing");
                setError(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function ChoosingStep({
  weakTopics,
  chosen,
  onToggle,
  onStart,
  error,
}: {
  weakTopics: string[];
  chosen: Set<string>;
  onToggle: (topic: string) => void;
  onStart: () => void;
  error: string | null;
}) {
  const { t } = useT();

  return (
    <>
      <h1 className="font-display text-3xl font-light">{t("revise.title")}</h1>
      <p className="mt-2 text-text-muted">{t("revise.subtitle")}</p>

      {weakTopics.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-7">
          <GraduationCap className="size-5 text-text-faint" aria-hidden />
          <h2 className="mt-4 text-lg font-medium">{t("revise.noHistory")}</h2>
          <p className="mt-2 max-w-lg leading-relaxed text-text-muted">
            {t("revise.noHistoryBody")}
          </p>
        </div>
      ) : (
        <>
          <h2 className="mt-9 text-sm font-medium">{t("revise.pickTopics")}</h2>
          <p className="mt-1 text-sm text-text-faint">
            {t("revise.weakestFirst")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {weakTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onToggle(topic)}
                aria-pressed={chosen.has(topic)}
                className={cn(
                  "h-11 rounded-full border px-4 text-[15px] transition-colors",
                  chosen.has(topic)
                    ? "border-brand-500 bg-brand-500 text-navy-950"
                    : "border-border text-text-muted hover:border-border-strong hover:text-text",
                )}
              >
                {topic}
              </button>
            ))}
          </div>

          <Button onClick={onStart} disabled={!chosen.size} className="mt-8">
            {t("revise.start")}
          </Button>
        </>
      )}

      {error && (
        <p role="alert" className="mt-6 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </>
  );
}

/** Per notion, not per question: the score matters less than which idea broke. */
function Report({
  results,
  onAgain,
}: {
  results: { topic: string; correct: boolean }[];
  onAgain: () => void;
}) {
  const { t } = useT();
  const correct = results.filter((r) => r.correct).length;

  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const entry = byTopic.get(r.topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (r.correct) entry.correct += 1;
    byTopic.set(r.topic, entry);
  }

  return (
    <>
      <h1 className="font-display text-3xl font-light">
        {t("revise.reportTitle")}
      </h1>
      <p className="mt-2 font-display text-5xl font-light tabular-nums text-accent">
        {t("revise.scoreLine", { correct, total: results.length })}
      </p>

      <ul className="mt-8 space-y-3">
        {[...byTopic.entries()].map(([topic, stat]) => {
          const holds = stat.correct === stat.total;
          return (
            <li
              key={topic}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4"
            >
              <span className="font-medium">{topic}</span>
              <span
                className={cn(
                  "flex items-center gap-2 text-[15px]",
                  holds ? "text-[var(--color-success)]" : "text-text-muted",
                )}
              >
                <span className="tabular-nums text-text-faint">
                  {stat.correct}/{stat.total}
                </span>
                {holds ? t("revise.holds") : t("revise.shaky")}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-text-faint">{t("revise.reportNote")}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={onAgain}>{t("revise.again")}</Button>
        <Link
          href="/app/"
          className="inline-flex h-11 items-center rounded-full border border-border-strong px-5 text-[15px] text-text hover:bg-surface"
        >
          {t("revise.backToApp")}
        </Link>
      </div>
    </>
  );
}
