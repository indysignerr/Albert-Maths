"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Lock, PencilLine, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { api, ApiError, type Review, type Transcription } from "@/lib/api";
import { verifyAnswer, type Verdict } from "@/lib/verify";
import { Tex } from "@/components/tex";
import { useT } from "@/lib/i18n";
import { TutorChat } from "@/components/solve/tutor-chat";
import { Consolidation } from "@/components/solve/consolidation";
import { Button } from "@/components/ui/button";
import { AlbertLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/** Long enough to break the reflex of unlocking everything at once. */
const REFLECTION_SECONDS = 10;

export default function SolvePage() {
  const { session, profile, ready } = useAuth();
  const { t, list } = useT();
  const levelLabels = list<readonly string[]>("solve.levels");
  const router = useRouter();

  const [problemId, setProblemId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(
    null,
  );
  const [statement, setStatement] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hints, setHints] = useState<Record<number, string>>({});
  const [verdict, setVerdict] = useState<Verdict | "checking" | null>(null);
  const [unlockedAt, setUnlockedAt] = useState<number>(0);
  const [now, setNow] = useState(() => Date.now());

  const [working, setWorking] = useState("");
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    if (ready && !session) router.replace("/signin/");
  }, [ready, session, router]);

  // Drives the reflection countdown without re-rendering when nothing is pending.
  useEffect(() => {
    if (!unlockedAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [unlockedAt]);

  const revealedLevels = Object.keys(hints).map(Number);
  const nextLevel = revealedLevels.length + 1;
  const secondsLeft = Math.max(
    0,
    Math.ceil((unlockedAt + REFLECTION_SECONDS * 1000 - now) / 1000),
  );
  const hasAttempt = working.trim().length > 0 && review !== null;

  const onPhoto = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        const image = await fileToDataUrl(file);
        const result = await api.transcribe(image);
        setTranscription(result);
        setStatement(result.statement_latex || result.statement_plain);
        if (result.student_working?.length) {
          setWorking(result.student_working.join("\n"));
        }

        // The photo itself is never stored: only the transcription persists.
        const { data, error: insertError } = await supabase
          .from("problems")
          .insert({
            owner_id: session!.user.id,
            topic: result.topic,
            source_lang: result.lang,
            statement_latex: result.statement_latex,
            statement_plain: result.statement_plain,
          })
          .select("id")
          .single();

        if (insertError) throw new Error(insertError.message);
        setProblemId(data.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not read that photo",
        );
      } finally {
        setBusy(false);
      }
    },
    [session],
  );

  async function unlock(level: number) {
    if (!problemId) return;
    setBusy(true);
    setError(null);
    try {
      // The insert is the gate: can_reveal_level() in the database rejects an
      // out-of-order level, and rejects level 4 without a submitted attempt.
      const { error: gateError } = await supabase.from("hint_reveals").insert({
        problem_id: problemId,
        profile_id: session!.user.id,
        level: level as 1 | 2 | 3 | 4,
      });

      if (gateError) {
        throw new Error(
          level === 4 ? t("solve.outOfOrder") : gateError.message,
        );
      }

      const { hint, check } = await api.hint({
        statement,
        level,
        language: profile?.ui_locale ?? "en",
        priorHints: revealedLevels.sort().map((l) => hints[l]),
      });

      setHints((h) => ({ ...h, [level]: hint }));
      setUnlockedAt(Date.now());
      setNow(Date.now());

      // The solution is shown either way; the badge says whether an independent
      // computation agreed with it.
      if (check) {
        setVerdict("checking");
        void verifyAnswer(check).then(setVerdict);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not fetch that hint",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitWorking() {
    if (!problemId) return;
    const lines = working
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;

    setBusy(true);
    setError(null);
    try {
      const result = await api.review({ statement, lines });
      setReview(result);

      await supabase.from("attempts").insert({
        problem_id: problemId,
        profile_id: session!.user.id,
        body: working,
        error_step: result.first_bad_line,
        is_correct: result.verdict === "correct",
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not review that working",
      );
    } finally {
      setBusy(false);
    }
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
        <div className="mx-auto flex h-18 w-full max-w-4xl items-center gap-4 px-5 sm:px-8">
          <Link
            href="/app/"
            className="flex size-11 items-center justify-center rounded-full text-text-muted hover:text-text"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <AlbertLogo className="text-base" />
        </div>
      </header>

      <main className="mesh-albert flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
          {!transcription ? (
            <PhotoStep busy={busy} onPhoto={onPhoto} />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <section>
                <h2 className="text-sm tracking-wide text-text-faint uppercase">
                  {t("solve.exercise")}
                </h2>
                <div className="mt-3 rounded-2xl border border-border bg-surface p-6 text-lg">
                  <Tex block raw>
                    {statement}
                  </Tex>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-text-muted">
                    {t("solve.fixTranscription")}
                  </summary>
                  <textarea
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    rows={3}
                    className="mt-3 w-full rounded-xl border border-border bg-surface p-3 font-mono text-sm"
                  />
                </details>

                <h2 className="mt-10 text-sm tracking-wide text-text-faint uppercase">
                  {t("solve.yourWorking")}
                </h2>
                <textarea
                  value={working}
                  onChange={(e) => setWorking(e.target.value)}
                  rows={7}
                  placeholder={`${t("solve.workingPlaceholder")}\nu = x, dv = e^{-x} dx\ndu = dx, v = ...`}
                  className="mt-3 w-full rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-relaxed"
                />
                <Button
                  onClick={submitWorking}
                  disabled={busy || !working.trim()}
                  className="mt-3 w-full"
                >
                  <PencilLine className="size-[18px]" aria-hidden />
                  {busy ? t("solve.reviewing") : t("solve.findMistake")}
                </Button>

                {review && <ReviewCard review={review} working={working} />}

                {review?.verdict === "error" && (
                  <Consolidation
                    statement={statement}
                    misconception={review.why}
                    language={profile?.ui_locale ?? "en"}
                    onPassed={() => {
                      // Progress counts understanding, never solutions viewed.
                      void supabase.from("progress_events").insert({
                        profile_id: session!.user.id,
                        kind: "consolidation_passed",
                        problem_id: problemId,
                      });
                    }}
                  />
                )}

                <TutorChat
                  statement={statement}
                  working={working.trim() || null}
                  unlockedLevels={revealedLevels.length}
                />
              </section>

              <section>
                <h2 className="text-sm tracking-wide text-text-faint uppercase">
                  {t("solve.hints")}
                </h2>
                <ol className="mt-3 space-y-3">
                  {levelLabels.map((label, i) => {
                    const level = i + 1;
                    const revealed = hints[level] !== undefined;
                    const isNext = level === nextLevel;
                    const waiting = isNext && secondsLeft > 0;
                    const needsAttempt = level === 4 && !hasAttempt;

                    return (
                      <li
                        key={label}
                        className={cn(
                          "rounded-2xl border p-5",
                          revealed
                            ? "border-border bg-surface"
                            : "border-dashed border-border",
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p
                            className={cn(
                              "text-[15px]",
                              revealed
                                ? "font-medium text-text"
                                : "text-text-muted",
                            )}
                          >
                            {level}. {label}
                          </p>
                          {!revealed && !isNext && (
                            <Lock
                              className="size-4 text-text-faint"
                              aria-hidden
                            />
                          )}
                        </div>

                        {revealed && (
                          <p className="mt-3 leading-relaxed text-text-muted">
                            <Tex>{hints[level]}</Tex>
                          </p>
                        )}

                        {revealed && level === 4 && verdict && (
                          <VerdictBadge verdict={verdict} />
                        )}

                        {isNext && (
                          <div className="mt-4">
                            <Button
                              variant="secondary"
                              onClick={() => unlock(level)}
                              disabled={busy || waiting || needsAttempt}
                              className="w-full"
                            >
                              {needsAttempt
                                ? t("solve.needsAttempt")
                                : waiting
                                  ? t("solve.waiting", { n: secondsLeft })
                                  : t("solve.unlock", { n: level })}
                            </Button>
                            {needsAttempt && (
                              <p className="mt-2 text-sm text-text-faint">
                                {t("solve.needsAttemptNote")}
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-[var(--color-danger)] px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * States the provenance of the check rather than a bare tick: a student should
 * know the difference between "another system agreed" and "nobody checked".
 */
function VerdictBadge({ verdict }: { verdict: Verdict | "checking" }) {
  const { t } = useT();
  if (verdict === "checking") {
    return (
      <p className="mt-4 text-sm text-text-faint">{t("solve.verifying")}</p>
    );
  }

  if (verdict.status === "verified") {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-[var(--color-success)]">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        {t("solve.verified")}
      </p>
    );
  }

  if (verdict.status === "contradicted") {
    return (
      <p className="mt-4 rounded-xl border border-[var(--color-danger)] px-4 py-3 text-sm text-[var(--color-danger)]">
        <strong>{t("solve.contradictedLead")}</strong>
        {t("solve.contradicted", { value: verdict.computed })}
      </p>
    );
  }

  return (
    <p className="mt-4 text-sm text-text-faint">{t("solve.unverified")}</p>
  );
}

function PhotoStep({
  busy,
  onPhoto,
}: {
  busy: boolean;
  onPhoto: (file: File) => void;
}) {
  const { t } = useT();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="font-display text-3xl font-light">
        {t("solve.photoTitle")}
      </h1>
      <p className="mt-3 leading-relaxed text-text-muted">
        {t("solve.photoBody")}
      </p>

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPhoto(file);
        }}
      />

      <Button
        onClick={() => input.current?.click()}
        disabled={busy}
        className="mt-8 w-full"
      >
        <Camera className="size-[18px]" aria-hidden />
        {busy ? t("solve.reading") : t("solve.choosePhoto")}
      </Button>

      <p className="mt-4 text-sm text-text-faint">{t("solve.photoNote")}</p>
    </div>
  );
}

function ReviewCard({ review, working }: { review: Review; working: string }) {
  const { t } = useT();
  const lines = working
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const index = review.first_bad_line
    ? Number(review.first_bad_line.replace(/\D/g, "")) - 1
    : -1;

  if (review.verdict === "correct") {
    return (
      <div className="mt-5 rounded-2xl border border-[var(--color-success)] bg-surface p-5">
        <p className="font-medium text-[var(--color-success)]">
          {t("solve.allCorrect")}
        </p>
        <p className="mt-2 leading-relaxed text-text-muted">{review.why}</p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm tracking-wide text-text-faint uppercase">
        {t("solve.firstBadLine")}
      </p>
      {index >= 0 && lines[index] && (
        <p className="mt-3 rounded-xl bg-bg-subtle px-4 py-3 font-mono text-sm">
          {lines[index]}
        </p>
      )}
      <p className="mt-4 leading-relaxed text-text-muted">
        <Tex>{review.why}</Tex>
      </p>
      <p className="mt-4 font-medium text-text">
        <Tex>{review.question_back}</Tex>
      </p>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });
}
