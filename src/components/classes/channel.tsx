"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import type { ChannelMessage, ClassRow, Profile } from "@/lib/database.types";
import { ClassMembers } from "@/components/classes/members";
import { Tex } from "@/components/tex";
import { Button } from "@/components/ui/button";

/** "Léa M." — enough to be accountable, not enough to be a directory. */
function displayName(
  p: Pick<Profile, "first_name" | "last_initial"> | undefined,
) {
  if (!p) return "…";
  return p.last_initial ? `${p.first_name} ${p.last_initial}.` : p.first_name;
}

export function ClassChannel({
  classRow,
  onLeave,
}: {
  classRow: ClassRow;
  onLeave: () => void;
}) {
  const { session } = useAuth();
  const { t } = useT();

  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [authors, setAuthors] = useState<Record<string, Profile>>({});
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);

  const loadAuthors = useCallback(async (ids: string[]) => {
    const missing = [...new Set(ids)];
    if (!missing.length) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", missing);
    if (data) {
      setAuthors((current) => ({
        ...current,
        ...Object.fromEntries(data.map((p) => [p.id, p])),
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const { data } = await supabase
        .from("channel_messages")
        .select("*")
        .eq("class_id", classRow.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!active || !data) return;
      setMessages(data);
      await loadAuthors(data.map((m) => m.profile_id));
    })();

    // Realtime rather than polling: a class channel is only useful if the reply
    // arrives while the other person is still stuck.
    const channel = supabase
      .channel(`class:${classRow.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `class_id=eq.${classRow.id}`,
        },
        (payload) => {
          const message = payload.new as ChannelMessage;
          setMessages((current) =>
            current.some((m) => m.id === message.id)
              ? current
              : [...current, message],
          );
          void loadAuthors([message.profile_id]);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [classRow.id, loadAuthors]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setError(null);
    const { error: insertError } = await supabase
      .from("channel_messages")
      .insert({
        class_id: classRow.id,
        profile_id: session!.user.id,
        content,
      });

    if (insertError) {
      // The moderation trigger raises with this marker; anything else is a real
      // failure and should say so rather than being blamed on the student.
      setError(
        insertError.message.includes("blocked_by_moderation")
          ? t("classes.blocked")
          : insertError.message,
      );
      return;
    }
    setDraft("");
  }

  async function report(id: string) {
    // Optimistic: the reporter stops seeing it immediately. Everyone else keeps
    // it until a second person agrees, so one reader cannot silence a classmate.
    setReported((current) => new Set(current).add(id));
    const { error: rpcError } = await supabase.rpc("report_message", {
      target_message: id,
    });
    if (rpcError) {
      setReported((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setError(t("classes.reportFailed"));
    }
  }

  const visible = messages.filter((m) => !reported.has(m.id));

  return (
    <section className="rounded-2xl border border-border bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-medium">{classRow.name}</h2>
          <p className="mt-0.5 font-mono text-xs tracking-widest text-text-faint">
            {classRow.invite_code}
          </p>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="text-sm text-text-muted underline underline-offset-4 hover:text-text"
        >
          {t("classes.leave")}
        </button>
      </header>

      <ClassMembers classRow={classRow} />

      <div className="max-h-[28rem] min-h-64 space-y-4 overflow-y-auto p-5">
        {visible.length === 0 ? (
          <p className="text-[15px] text-text-muted">{t("classes.empty")}</p>
        ) : (
          visible.map((m) => (
            <div key={m.id} className="group flex items-start gap-3">
              <div className="flex-1">
                <p className="text-[15px] leading-relaxed text-text-muted">
                  <span className="font-medium text-text">
                    {displayName(authors[m.profile_id])}
                  </span>
                  <span className="ml-2 text-xs tabular-nums text-text-faint">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <p className="mt-0.5 text-[15px] leading-relaxed text-text-muted">
                  {m.content}
                </p>
                {m.shared_statement && (
                  <div className="mt-2 rounded-xl border border-border bg-bg-subtle px-4 py-3">
                    <p className="text-xs tracking-wide text-text-faint uppercase">
                      {t("classes.sharedExercise")}
                    </p>
                    <div className="mt-1.5 text-[15px]">
                      <Tex block raw>
                        {m.shared_statement}
                      </Tex>
                    </div>
                  </div>
                )}
              </div>
              {m.profile_id !== session?.user.id && (
                <button
                  type="button"
                  onClick={() => report(m.id)}
                  aria-label={t("classes.report")}
                  title={t("classes.report")}
                  className="shrink-0 rounded p-1 text-text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--color-danger)] focus-visible:opacity-100"
                >
                  <Flag className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
        <label htmlFor="class-message" className="sr-only">
          {t("classes.send")}
        </label>
        <input
          id="class-message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("classes.messagePlaceholder")}
          maxLength={4000}
          className="h-11 flex-1 rounded-xl border border-border bg-bg px-4 text-[15px] placeholder:text-text-faint"
        />
        <Button
          type="submit"
          disabled={!draft.trim()}
          aria-label={t("classes.send")}
        >
          <Send className="size-[18px]" aria-hidden />
        </Button>
      </form>

      {error && (
        <p
          role="alert"
          className="px-5 pb-4 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </section>
  );
}
