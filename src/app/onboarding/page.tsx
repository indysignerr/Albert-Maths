"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  CAMPUSES,
  TRACKS,
  type Campus,
  type Track,
} from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AlbertLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const COHORTS = ["B1", "B2", "B3"];

export default function OnboardingPage() {
  const { session, profile, ready, refreshProfile } = useAuth();
  const router = useRouter();

  const [campus, setCampus] = useState<Campus | null>(null);
  const [cohort, setCohort] = useState("B1");
  const [track, setTrack] = useState<Track | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) router.replace("/signin/");
  }, [ready, session, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("first_name") ?? "").trim();
    const lastInitial = String(form.get("last_initial") ?? "").trim();

    if (!campus || !track || !firstName) {
      setError("Fill in your name, campus and track.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_initial: lastInitial.slice(0, 1).toUpperCase(),
        campus,
        cohort,
        track,
        ui_locale: TRACKS.find((t) => t.value === track)!.locale,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", session!.user.id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    router.replace("/app/");
  }

  // Waiting for the profile means the inputs can be uncontrolled with a real
  // default, instead of being mirrored into state by an effect.
  if (!ready || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mesh-albert flex min-h-dvh flex-col items-center px-5 py-16">
      <div className="mb-10 text-lg">
        <AlbertLogo />
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8"
      >
        <h1 className="font-display text-2xl font-light">
          Set up your account
        </h1>
        <p className="mt-2 text-[15px] text-text-muted">
          Classmates see your first name and one initial — nothing else.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_auto]">
          <Field
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            defaultValue={profile.first_name}
          />
          <Field
            label="Initial"
            name="last_initial"
            maxLength={1}
            className="w-20 text-center uppercase"
            defaultValue={profile.last_initial}
          />
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium text-text">Campus</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {CAMPUSES.map((c) => (
              <Chip
                key={c.value}
                selected={campus === c.value}
                onClick={() => setCampus(c.value)}
              >
                {c.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-sm font-medium text-text">Year</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {COHORTS.map((c) => (
              <Chip
                key={c}
                selected={cohort === c}
                onClick={() => setCohort(c)}
              >
                {c}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-sm font-medium text-text">Track</legend>
          <p className="mt-1 text-sm text-text-muted">
            This sets the language of your explanations. You can change it any
            time in settings.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRACKS.map((t) => (
              <Chip
                key={t.value}
                selected={track === t.value}
                onClick={() => setTrack(t.value)}
              >
                {t.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="mt-6 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving} className="mt-8 w-full">
          {saving ? "Saving…" : "Continue"}
        </Button>
      </form>
    </main>
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
