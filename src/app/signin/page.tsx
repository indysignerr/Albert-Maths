"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { claimDestination } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AlbertLogo } from "@/components/brand/logo";
import { LanguagePicker } from "@/components/language-picker";
import { useT } from "@/lib/i18n";

const SCHOOL_DOMAIN = "albertschool.com";

type Mode = "signin" | "create" | "reset";

export default function SignInPage() {
  const { t } = useT();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithPassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setBusy(false);
    if (authError) {
      // Supabase returns the same message whether the address is unknown or the
      // password is wrong, and that is the right behaviour — saying which would
      // tell a stranger who has an account here.
      setError(t("auth.wrongCredentials"));
      return;
    }
    router.replace(claimDestination());
  }

  async function sendLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    // Whether this creates an account or recovers one, the link lands in the
    // same place: a page that sets a password. After that there are no more
    // emails.
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: mode === "create",
        emailRedirectTo: `${window.location.origin}/auth/callback/`,
      },
    });

    setBusy(false);
    if (authError) {
      setError(
        /not allowed to sign up|Database error saving new user/i.test(
          authError.message,
        )
          ? t("signIn.restricted", { domain: SCHOOL_DOMAIN })
          : authError.message,
      );
      return;
    }
    setSent(true);
  }

  function switchTo(next: Mode) {
    setMode(next);
    setError(null);
    setSent(false);
    setPassword("");
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
        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto size-8 text-accent" aria-hidden />
            <h1 className="mt-5 font-display text-2xl font-light">
              {t("auth.linkSentTitle")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
              {t("auth.linkSentBody", { email })}
            </p>
            <button
              type="button"
              onClick={() => switchTo(mode)}
              className="mt-6 text-sm text-text-muted underline underline-offset-4 hover:text-text"
            >
              {t("auth.useAnother")}
            </button>
          </div>
        ) : mode === "signin" ? (
          <>
            <h1 className="font-display text-2xl font-light">
              {t("auth.signInTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-text-muted">
              {t("auth.signInSubtitle")}
            </p>

            <form
              onSubmit={signInWithPassword}
              className="mt-7 flex flex-col gap-5"
            >
              <Field
                label={t("auth.email")}
                type="email"
                name="email"
                autoComplete="username"
                required
                placeholder={`you@${SCHOOL_DOMAIN}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                label={t("auth.password")}
                type="password"
                name="password"
                // Tells the browser's password manager this is a returning
                // sign-in, which is what makes it offer the saved entry.
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" disabled={busy}>
                {busy ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={() => switchTo("create")}
                className="text-left text-accent underline underline-offset-4"
              >
                {t("auth.noAccountYet")}
              </button>
              <button
                type="button"
                onClick={() => switchTo("reset")}
                className="text-left text-text-muted underline underline-offset-4 hover:text-text"
              >
                {t("auth.forgot")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-light">
              {t(mode === "create" ? "auth.createTitle" : "auth.resetTitle")}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
              {t(
                mode === "create"
                  ? "auth.createSubtitle"
                  : "auth.resetSubtitle",
              )}
            </p>

            <form onSubmit={sendLink} className="mt-7 flex flex-col gap-5">
              <Field
                label={t("auth.email")}
                type="email"
                autoComplete="email"
                required
                placeholder={`you@${SCHOOL_DOMAIN}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" disabled={busy}>
                {busy ? t("auth.sending") : t("auth.sendLink")}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => switchTo("signin")}
              className="mt-6 text-sm text-accent underline underline-offset-4"
            >
              {t("auth.haveAccount")}
            </button>
          </>
        )}
      </div>

      <p className="mt-8 max-w-sm text-center text-sm text-text-faint">
        {t("common.disclaimer")}
      </p>
    </main>
  );
}
