"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import type { ChannelMessage, ClassRow, Profile } from "@/lib/database.types";
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

      <div className="max-h-[28rem] min-h-64 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="text-[15px] text-text-muted">{t("classes.empty")}</p>
        ) : (
          messages.map((m) => (
            <p
              key={m.id}
              className="text-[15px] leading-relaxed text-text-muted"
            >
              <span className="font-medium text-text">
                {displayName(authors[m.profile_id])}
              </span>{" "}
              — {m.content}
            </p>
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
