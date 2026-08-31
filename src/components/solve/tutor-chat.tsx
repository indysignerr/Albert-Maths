"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api";
import { Tex } from "@/components/tex";
import { cn } from "@/lib/utils";

interface Message {
  author: "student" | "tutor";
  content: string;
}

export function TutorChat({
  statement,
  working,
  unlockedLevels,
}: {
  statement: string;
  working: string | null;
  unlockedLevels: number;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;

    const history = messages;
    setMessages([...history, { author: "student", content: message }]);
    setDraft("");
    setBusy(true);
    setError(null);

    try {
      const { reply } = await api.chat({
        statement,
        working,
        // Talking to the tutor must not be a way around the hint ladder, so the
        // ceiling travels with the request.
        unlockedLevels,
        history,
        message,
      });
      setMessages((m) => [...m, { author: "tutor", content: reply }]);
      requestAnimationFrame(() =>
        endRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The tutor did not reply");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm tracking-wide text-text-faint uppercase">
        Talk it through
      </h2>

      <div className="mt-3 rounded-2xl border border-border bg-surface">
        <div className="max-h-80 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-text-muted">
              Ask what you are actually stuck on. The tutor answers with
              questions — it will not hand you the step, but it will tell you
              straight away if something you wrote is false.
            </p>
          ) : (
            messages.map((m, i) => (
              <p
                key={i}
                className={cn(
                  "text-[15px] leading-relaxed",
                  m.author === "student"
                    ? "text-text"
                    : "rounded-xl bg-bg-subtle px-4 py-3 text-text-muted",
                )}
              >
                {m.author === "student" ? m.content : <Tex>{m.content}</Tex>}
              </p>
            ))
          )}
          {busy && <p className="text-sm text-text-faint">Thinking…</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <label htmlFor="tutor-message" className="sr-only">
            Message the tutor
          </label>
          <input
            id="tutor-message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Why does this step not work?"
            className="h-11 flex-1 rounded-xl border border-border bg-bg px-4 text-[15px] placeholder:text-text-faint"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-800 text-white disabled:opacity-40 dark:bg-brand-500 dark:text-navy-950"
          >
            <Send className="size-[18px]" aria-hidden />
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </section>
  );
}
