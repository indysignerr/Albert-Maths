"use client";

import { useRef, useState } from "react";
import { BookOpen, CornerDownLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { Tex } from "@/components/tex";
import { cn } from "@/lib/utils";

interface Entry {
  question: string;
  notion: string;
  explanation: string;
  deflected: boolean;
}

/**
 * A course reference, kept deliberately separate from the tutor.
 *
 * The request carries a question and a language — never the exercise being
 * worked on. That is the guarantee: this cannot become a route around the hint
 * ladder, because there is no exercise in scope for it to leak. A student who
 * pastes one in gets the underlying notion and a pointer back to the solver.
 *
 * Nothing is stored. The history lives for as long as the page does, which is
 * what "remind me" needs and no more.
 */
export function NotionChat({ compact = false }: { compact?: boolean }) {
  const { profile } = useAuth();
  const { t } = useT();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;

    setBusy(true);
    setError(null);
    try {
      const result = await api.notion({
        question,
        language: profile?.ui_locale ?? "en",
        history: entries.flatMap((e) => [
          { author: "student", content: e.question },
          { author: "tutor", content: e.explanation },
        ]),
      });
      setEntries((current) => [...current, { question, ...result }]);
      setDraft("");
      requestAnimationFrame(() =>
        endRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      {!compact && (
        <div className="border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-medium">
            <BookOpen className="size-[18px] text-accent" aria-hidden />
            {t("notions.title")}
          </h2>
          <p className="mt-1 text-[15px] text-text-muted">
            {t("notions.subtitle")}
          </p>
        </div>
      )}

      <div
        className={cn(
          "space-y-5 overflow-y-auto p-5",
          compact ? "max-h-72" : "max-h-96",
        )}
      >
        {entries.length === 0 ? (
          <p className="text-[15px] leading-relaxed text-text-muted">
            {t("notions.empty")}
          </p>
        ) : (
          entries.map((entry, i) => (
            <article key={i}>
              <p className="text-[15px] text-text-faint">{entry.question}</p>
              <p className="mt-2 text-xs tracking-wide text-accent uppercase">
                {entry.notion}
              </p>
              <p className="mt-1.5 leading-relaxed text-text-muted">
                <Tex>{entry.explanation}</Tex>
              </p>
              {entry.deflected && (
                <p className="mt-2.5 rounded-lg bg-bg-subtle px-3 py-2 text-sm text-text-faint">
                  {t("notions.deflected")}
                </p>
              )}
            </article>
          ))
        )}
        {busy && (
          <p className="text-sm text-text-faint">{t("notions.thinking")}</p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={ask} className="flex gap-2 border-t border-border p-3">
        <label htmlFor="notion-question" className="sr-only">
          {t("notions.title")}
        </label>
        <input
          id="notion-question"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("notions.placeholder")}
          className="h-11 flex-1 rounded-xl border border-border bg-bg px-4 text-[15px] placeholder:text-text-faint"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          aria-label={t("notions.ask")}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-800 text-white disabled:opacity-40 dark:bg-brand-500 dark:text-navy-950"
        >
          <CornerDownLeft className="size-[18px]" aria-hidden />
        </button>
      </form>

      <p className="border-t border-border px-5 py-2.5 text-xs text-text-faint">
        {t("notions.scope")}
      </p>

      {error && (
        <p
          role="alert"
          className="px-5 pb-4 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
