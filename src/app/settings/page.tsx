"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, TriangleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { rememberDestination } from "@/lib/auth-redirect";
import {
  CAMPUSES,
  TRACKS,
  type Campus,
  type Track,
} from "@/lib/database.types";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguagePicker } from "@/components/language-picker";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const COHORTS = ["B1", "B2", "B3"];

export default function SettingsPage() {
  const { session, profile, ready, refreshProfile, signOut } = useAuth();
  const { t } = useT();
  const router = useRouter();

  const [campus, setCampus] = useState<Campus | null>(null);
  const [cohort, setCohort] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmWord, setConfirmWord] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (ready && !session) {
      rememberDestination(window.location.pathname);
      router.replace("/signin/");
    }
  }, [ready, session, router]);

  if (!ready || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-muted">{t("common.loading")}</p>
      </main>
    );
  }

  // The saved profile is the default; local state only holds an unsaved change.
  const currentCampus = campus ?? profile.campus;
  const currentCohort = cohort ?? profile.cohort ?? "B1";
  const currentTrack = track ?? profile.track;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: String(form.get("first_name") ?? "").trim(),
        last_initial: String(form.get("last_initial") ?? "")
          .trim()
          .slice(0, 1)
          .toUpperCase(),
        campus: currentCampus,
        cohort: currentCohort,
        track: currentTrack,
      })
      .eq("id", session!.user.id);

    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refreshProfile();
    setSaved(true);
  }

  async function exportData() {
    setExporting(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("export_own_data");
    setExporting(false);
    if (rpcError || !data) {
      setError(rpcError?.message ?? t("errors.generic"));
      return;
    }

    // Built and revoked in the same gesture: nothing is uploaded anywhere, the
    // file is assembled in the student's own browser.
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "albert-maths-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) {
      setBusy(false);
      setError(t("settings.deleteFailed"));
      return;
    }
    await signOut();
    router.replace("/");
  }

  const confirmWordExpected = t("settings.deleteConfirmWord");

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
            <LanguagePicker />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mesh-albert flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
          <h1 className="font-display text-3xl font-light">
            {t("settings.title")}
          </h1>

          <form
            onSubmit={save}
            className="mt-10 rounded-2xl border border-border bg-surface p-7"
          >
            <h2 className="text-lg font-medium">{t("settings.profile")}</h2>
            <p className="mt-1 text-[15px] text-text-muted">
              {t("settings.profileNote")}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto]">
              <Field
                label={t("onboarding.firstName")}
                name="first_name"
                required
                autoComplete="given-name"
                defaultValue={profile.first_name}
              />
              <Field
                label={t("onboarding.initial")}
                name="last_initial"
                maxLength={1}
                className="w-20 text-center uppercase"
                defaultValue={profile.last_initial}
              />
            </div>

            <Group label={t("onboarding.campus")}>
              {CAMPUSES.map((option) => (
                <Chip
                  key={option.value}
                  selected={currentCampus === option.value}
                  onClick={() => setCampus(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </Group>

            <Group label={t("onboarding.year")}>
              {COHORTS.map((option) => (
                <Chip
                  key={option}
                  selected={currentCohort === option}
                  onClick={() => setCohort(option)}
                >
                  {option}
                </Chip>
              ))}
            </Group>

            <Group label={t("onboarding.track")}>
              {TRACKS.map((option) => (
                <Chip
                  key={option.value}
                  selected={currentTrack === option.value}
                  onClick={() => setTrack(option.value)}
                >
                  {t(
                    option.value === "english"
                      ? "onboarding.trackEnglish"
                      : "onboarding.trackFrench",
                  )}
                </Chip>
              ))}
            </Group>

            <div className="mt-7 flex items-center gap-4">
              <Button type="submit" disabled={busy}>
                {t("common.save")}
              </Button>
              {saved && (
                <span
                  role="status"
                  className="text-sm text-[var(--color-success)]"
                >
                  {t("settings.saved")}
                </span>
              )}
            </div>
          </form>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-7">
            <h2 className="text-lg font-medium">{t("settings.yourData")}</h2>
            <h3 className="mt-5 font-medium">{t("settings.exportTitle")}</h3>
            <p className="mt-2 leading-relaxed text-text-muted">
              {t("settings.exportBody")}
            </p>
            <Button
              variant="secondary"
              onClick={exportData}
              disabled={exporting}
              className="mt-4"
            >
              <Download className="size-[18px]" aria-hidden />
              {exporting ? t("settings.exporting") : t("settings.exportButton")}
            </Button>
          </section>

          <section className="mt-8 rounded-2xl border border-[var(--color-danger)] bg-surface p-7">
            <div className="flex items-start gap-3">
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]"
                aria-hidden
              />
              <div>
                <h2 className="text-lg font-medium">
                  {t("settings.deleteTitle")}
                </h2>
                <p className="mt-2 leading-relaxed text-text-muted">
                  {t("settings.deleteBody")}
                </p>
              </div>
            </div>

            {confirming ? (
              <div className="mt-6">
                <label htmlFor="confirm-delete" className="text-sm font-medium">
                  {t("settings.deleteConfirmPrompt", {
                    word: confirmWordExpected,
                  })}
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    id="confirm-delete"
                    value={confirmWord}
                    onChange={(e) =>
                      setConfirmWord(e.target.value.toUpperCase())
                    }
                    autoComplete="off"
                    className="h-11 flex-1 rounded-xl border border-border bg-bg px-4 font-mono tracking-widest"
                  />
                  <Button
                    onClick={deleteAccount}
                    disabled={busy || confirmWord !== confirmWordExpected}
                    className="bg-[var(--color-danger)] text-white hover:opacity-90 dark:bg-[var(--color-danger)] dark:text-white"
                  >
                    {busy
                      ? t("settings.deleting")
                      : t("settings.deleteConfirmButton")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setConfirming(false);
                      setConfirmWord("");
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setConfirming(true)}
                className="mt-6 border-[var(--color-danger)] text-[var(--color-danger)]"
              >
                {t("settings.deleteButton")}
              </Button>
            )}
          </section>

          {error && (
            <p role="alert" className="mt-6 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-medium text-text">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "h-11 rounded-full border px-4 text-[15px] transition-colors",
        selected
          ? "border-brand-500 bg-brand-500 text-navy-950"
          : "border-border text-text-muted hover:border-border-strong hover:text-text",
      )}
    >
      {children}
    </button>
  );
}
