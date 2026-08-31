"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { claimDestination } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AlbertLogo } from "@/components/brand/logo";

const MIN_LENGTH = 8;

export default function SetPasswordPage() {
  const { session, profile, ready, refreshProfile } = useAuth();
  const { t } = useT();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) router.replace("/signin/");
  }, [ready, session, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(t("auth.tooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.mismatch"));
      return;
    }

    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      setError(updateError.message);
      return;
    }

    // Recorded on the profile, because the client cannot read from auth.users
    // whether a password exists — and the callback needs to know.
    await supabase
      .from("profiles")
      .update({ password_set_at: new Date().toISOString() })
      .eq("id", session!.user.id);
    await refreshProfile();

    router.replace(profile?.onboarded_at ? claimDestination() : "/onboarding/");
  }

  if (!ready || !session) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-muted">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <main className="mesh-albert flex min-h-dvh flex-col items-center justify-center px-5 py-16">
      <div className="mb-10 text-lg">
        <AlbertLogo />
      </div>

      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
      >
        <h1 className="font-display text-2xl font-light">
          {t("auth.setTitle")}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
          {t("auth.setSubtitle")}
        </p>

        {/* The email is present but hidden so password managers file the saved
            entry against the right account. */}
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={session.user.email ?? ""}
          readOnly
          hidden
        />

        <div className="mt-7 flex flex-col gap-5">
          <Field
            label={t("auth.newPassword")}
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={t("auth.tooShort")}
          />
          <Field
            label={t("auth.confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" disabled={busy}>
            {busy ? t("auth.saving") : t("auth.setSubmit")}
          </Button>
        </div>
      </form>
    </main>
  );
}
