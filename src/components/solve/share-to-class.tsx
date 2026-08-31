"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import type { ClassRow } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Posts the exercise into a class channel, with a note about what is blocking.
 *
 * Only the statement travels. The hints already unlocked, the attempts and the
 * review stay private: asking the class for help should not publish how far
 * someone got, or how many hints it took them.
 */
export function ShareToClass({
  problemId,
  statement,
}: {
  problemId: string | null;
  statement: string;
}) {
  const { session } = useAuth();
  const { t } = useT();

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("created_at");
    setClasses(data ?? []);
    setTarget((current) => current ?? data?.[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (!session) return;
    void (async () => {
      await load();
    })();
  }, [session, load]);

  if (!classes.length || !problemId) return null;

  async function share(event: React.FormEvent) {
    event.preventDefault();
    if (!target || !note.trim()) return;

    setBusy(true);
    setError(null);
    const { error: insertError } = await supabase
      .from("channel_messages")
      .insert({
        class_id: target,
        profile_id: session!.user.id,
        content: note.trim(),
        problem_id: problemId,
        shared_statement: statement,
      });
    setBusy(false);

    if (insertError) {
      setError(
        insertError.message.includes("blocked_by_moderation")
          ? t("classes.blocked")
          : insertError.message,
      );
      return;
    }
    setNote("");
    setDone(true);
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <Users className="size-[18px] text-accent" aria-hidden />
        {t("classes.shareToClass")}
      </h2>

      {done ? (
        <p className="mt-3 text-[15px] text-[var(--color-success)]">
          {t("classes.shared")}
        </p>
      ) : (
        <form onSubmit={share} className="mt-4 flex flex-col gap-3">
          {classes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {classes.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setTarget(row.id)}
                  aria-pressed={row.id === target}
                  className={cn(
                    "h-11 rounded-full border px-4 text-[15px] transition-colors",
                    row.id === target
                      ? "border-brand-500 bg-brand-500 text-navy-950"
                      : "border-border text-text-muted hover:border-border-strong hover:text-text",
                  )}
                >
                  {row.name}
                </button>
              ))}
            </div>
          )}

          <label htmlFor="share-note" className="sr-only">
            {t("classes.sharePrompt")}
          </label>
          <input
            id="share-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("classes.sharePrompt")}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-[15px] placeholder:text-text-faint"
          />
          <Button type="submit" disabled={busy || !note.trim()}>
            {t("classes.shareSend")}
          </Button>

          {error && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
