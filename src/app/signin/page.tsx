"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AlbertLogo } from "@/components/brand/logo";
import { LanguagePicker } from "@/components/language-picker";
import { useT } from "@/lib/i18n";

const SCHOOL_DOMAIN = "albertschool.com";

export default function SignInPage() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // Who may sign up is decided in the database, which also holds the
    // individual exceptions granted during development. Blocking here on the
    // domain alone would lock out those accounts before the request is sent.
    const address = email.trim().toLowerCase();
    setStatus("sending");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback/` },
    });

    if (authError) {
      setStatus("idle");
      // The sign-up trigger raises a database exception for a disallowed
      // address, which Supabase surfaces as an opaque "Database error saving
      // new user".
      setError(
        /not allowed to sign up|Database error saving new user/i.test(
          authError.message,
        )
          ? t("signIn.restricted", { domain: SCHOOL_DOMAIN })
          : authError.message,
      );
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="mesh-albert flex min-h-dvh flex-col items-center justify-center px-5 py-16">
      <div className="mb-10 flex flex-col items-center gap-5">
        <Link href="/" className="text-lg">
          <AlbertLogo />
        </Link>
        <LanguagePicker />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        {status === "sent" ? (
          <div className="text-center">
            <MailCheck className="mx-auto size-8 text-brand-500" aria-hidden />
            <h1 className="mt-5 font-display text-2xl font-light">
              {t("signIn.sentTitle")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
              {t("signIn.sentBody", { email })}
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 text-sm text-text-muted underline underline-offset-4 hover:text-text"
            >
              {t("signIn.useAnother")}
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-light">
              {t("signIn.title")}
            </h1>
            <p className="mt-2 text-[15px] text-text-muted">
              {t("signIn.subtitle")}
            </p>

            <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-5">
              <Field
                label={t("signIn.emailLabel")}
                type="email"
                autoComplete="email"
                required
                placeholder={`you@${SCHOOL_DOMAIN}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending"
                  ? t("signIn.sending")
                  : t("signIn.submit")}
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="mt-8 max-w-sm text-center text-sm text-text-faint">
        {t("common.disclaimer")}
      </p>
    </main>
  );
}
