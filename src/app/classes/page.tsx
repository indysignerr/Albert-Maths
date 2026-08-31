"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { rememberDestination } from "@/lib/auth-redirect";
import { CAMPUSES, type ClassRow } from "@/lib/database.types";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguagePicker } from "@/components/language-picker";
import { Button } from "@/components/ui/button";
import { ClassChannel } from "@/components/classes/channel";
import { cn } from "@/lib/utils";

export default function ClassesPage() {
  const { session, profile, ready } = useAuth();
  const { t } = useT();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) {
      rememberDestination(window.location.pathname);
      router.replace("/signin/");
    }
  }, [ready, session, router]);

  const loadClasses = useCallback(async () => {
    // RLS returns only the classes this student belongs to, so no filter here.
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("created_at");
    const rows = data ?? [];
    setClasses(rows);
    setSelected((current) => current ?? rows[0]?.id ?? null);

    const pairs = await Promise.all(
      rows.map(async (row) => {
        const { data: n } = await supabase.rpc("class_member_count", {
          target_class: row.id,
        });
        return [row.id, n ?? 0] as const;
      }),
    );
    setCounts(Object.fromEntries(pairs));
  }, []);

  useEffect(() => {
    if (!session) return;
    // The await runs before any setState, so nothing here updates state during
    // the effect itself.
    void (async () => {
      await loadClasses();
    })();
  }, [session, loadClasses]);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("join_class", {
      code: code.trim().toUpperCase(),
    });
    setBusy(false);
    if (rpcError) {
      setError(t("classes.joinFailed"));
      return;
    }
    setCode("");
    await loadClasses();
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!profile?.campus || !profile.cohort) return;
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_class", {
      name: newName.trim(),
      campus: profile.campus,
      cohort: profile.cohort,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setNewName("");
    setCreating(false);
    await loadClasses();
    if (data) setSelected(data.id);
  }

  async function leave(id: string) {
    await supabase
      .from("class_members")
      .delete()
      .eq("class_id", id)
      .eq("profile_id", session!.user.id);
    setSelected(null);
    await loadClasses();
  }

  if (!ready || !session) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-muted">{t("common.loading")}</p>
      </main>
    );
  }

  const active = classes.find((c) => c.id === selected) ?? null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
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
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
          <h1 className="font-display text-3xl font-light">
            {t("classes.title")}
          </h1>
          <p className="mt-2 text-text-muted">{t("classes.subtitle")}</p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[20rem_1fr] lg:items-start">
            <aside className="space-y-5">
              {classes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6">
                  <Users className="size-5 text-text-faint" aria-hidden />
                  <h2 className="mt-3 font-medium">{t("classes.none")}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                    {t("classes.noneBody")}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {classes.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(row.id)}
                        aria-current={row.id === selected}
                        className={cn(
                          "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                          row.id === selected
                            ? "border-brand-500 bg-surface"
                            : "border-border hover:border-border-strong",
                        )}
                      >
                        <span className="block font-medium">{row.name}</span>
                        <span className="mt-0.5 block text-sm text-text-muted">
                          {row.cohort} ·{" "}
                          {CAMPUSES.find((c) => c.value === row.campus)?.label}{" "}
                          · {t("classes.members", { n: counts[row.id] ?? 0 })}
                        </span>
                        <span className="mt-1 block font-mono text-xs tracking-widest text-accent">
                          {row.invite_code}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form
                onSubmit={join}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <label htmlFor="join-code" className="text-sm font-medium">
                  {t("classes.join")}
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    id="join-code"
                    autoComplete="off"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-center font-mono tracking-widest"
                  />
                  <Button type="submit" disabled={busy || code.length < 6}>
                    {busy ? t("classes.joining") : t("classes.joinSubmit")}
                  </Button>
                </div>
              </form>

              {creating ? (
                <form
                  onSubmit={create}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <label htmlFor="class-name" className="text-sm font-medium">
                    {t("classes.createName")}
                  </label>
                  <input
                    id="class-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="B1 Analysis II"
                    className="mt-3 h-11 w-full rounded-xl border border-border bg-bg px-4"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="submit"
                      disabled={busy || newName.trim().length < 2}
                    >
                      {t("classes.createSubmit")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCreating(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setCreating(true)}
                  className="w-full"
                >
                  <Plus className="size-[18px]" aria-hidden />
                  {t("classes.create")}
                </Button>
              )}

              {error && (
                <p role="alert" className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              )}
            </aside>

            {active ? (
              <ClassChannel
                key={active.id}
                classRow={active}
                onLeave={() => leave(active.id)}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
                {t("classes.noneBody")}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
