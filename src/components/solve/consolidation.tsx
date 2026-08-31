"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { answersMatch, evaluateExpression } from "@/lib/verify";
import { Tex } from "@/components/tex";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface Exercise {
  statement_latex: string;
  sympy: string | null;
  targets: string;
}

type Outcome = "checking" | "passed" | "failed" | "unknown";

/**
 * Offered once a mistake has been located: a fresh exercise that fails the same
 * way if the misconception survives. The answer is never taken from the model —
 * it is computed from the SymPy expression the model supplies, because a tool
 * that marks a correct answer wrong destroys the trust it needs.
 */
export function Consolidation({
  statement,
  misconception,
  language,
  onPassed,
}: {
  statement: string;
  misconception: string;
  language: string;
  onPassed: () => void;
}) {
  const { t } = useT();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [truth, setTruth] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const next = await api.consolidate({
        statement,
        misconception,
        language,
      });
      setExercise(next);
      setAnswer("");
      setOutcome(null);
      setTruth(next.sympy ? await evaluateExpression(next.sympy) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    if (!truth || !answer.trim()) return;
    setOutcome("checking");
    const verdict = await answersMatch(answer.trim(), truth);
    if (verdict.status === "verified") {
      setOutcome("passed");
      onPassed();
    } else {
      setOutcome(verdict.status === "contradicted" ? "failed" : "unknown");
    }
  }

  if (!exercise) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-border p-5">
        <h3 className="font-medium">{t("solve.consolidationTitle")}</h3>
        <p className="mt-2 leading-relaxed text-text-muted">
          {t("solve.consolidationBody")}
        </p>
        <Button
          variant="secondary"
          onClick={generate}
          disabled={busy}
          className="mt-4"
        >
          <RefreshCw className="size-[18px]" aria-hidden />
          {busy
            ? t("solve.consolidationWriting")
            : t("solve.consolidationGenerate")}
        </Button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-sm tracking-wide text-text-faint uppercase">
        {t("solve.consolidationNow")}
      </h3>
      <p className="mt-3 text-lg">
        <Tex block raw>
          {exercise.statement_latex}
        </Tex>
      </p>

      {truth ? (
        <>
          <label
            htmlFor="consolidation-answer"
            className="mt-5 block text-sm font-medium"
          >
            {t("solve.yourAnswer")}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="consolidation-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="1 - 2*exp(-1)"
              className="h-11 flex-1 rounded-xl border border-border bg-bg px-4 font-mono text-sm"
            />
            <Button
              onClick={check}
              disabled={!answer.trim() || outcome === "checking"}
            >
              {t("solve.check")}
            </Button>
          </div>
          <p className="mt-2 text-sm text-text-faint">
            {t("solve.answerHint", {
              examples: "1 - 2*exp(-1), pi/4, sqrt(2)/2",
            })}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-text-faint">{t("solve.onPaper")}</p>
      )}

      {outcome === "passed" && (
        <p className="mt-4 text-[15px] text-[var(--color-success)]">
          {t("solve.passed")}
        </p>
      )}
      {outcome === "failed" && (
        <p className="mt-4 text-[15px] text-text-muted">
          {t("solve.failedAgain")}
        </p>
      )}
      {outcome === "unknown" && (
        <p className="mt-4 text-[15px] text-text-muted">
          {t("solve.unreadable", { example: "2*sin(2) + cos(2) - 1" })}
        </p>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="mt-4 text-sm text-text-muted underline underline-offset-4 hover:text-text"
      >
        {t("solve.another")}
      </button>
    </div>
  );
}
