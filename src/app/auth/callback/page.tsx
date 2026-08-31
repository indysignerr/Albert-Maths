"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { claimDestination } from "@/lib/auth-redirect";

/**
 * The Supabase client is configured with detectSessionInUrl, so by the time the
 * provider reports ready the code in the URL has already been exchanged. All
 * this page decides is where to send the student next.
 *
 * An account without a password goes to set one — that is the whole reason the
 * emailed link exists. After that, signing in is local and no further email is
 * ever sent.
 */
export default function AuthCallbackPage() {
  const { session, profile, ready } = useAuth();
  const { t } = useT();
  const router = useRouter();

  // Failure is derived, not stored: ready with no session means the link was
  // already used or has expired.
  const failed = ready && !session;

  useEffect(() => {
    if (!ready || !session) return;
    // Wait for the profile before deciding: routing on a null profile would
    // send a returning student back through the password step.
    if (!profile) return;

    if (!profile.password_set_at) router.replace("/set-password/");
    else if (!profile.onboarded_at) router.replace("/onboarding/");
    else router.replace(claimDestination());
  }, [ready, session, profile, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 text-center">
      {failed ? (
        <div>
          <h1 className="font-display text-2xl font-light">
            {t("signIn.expiredTitle")}
          </h1>
          <p className="mt-3 text-text-muted">{t("signIn.expiredBody")}</p>
          <a
            href="/signin/"
            className="mt-6 inline-block text-accent underline underline-offset-4"
          >
            {t("signIn.requestNew")}
          </a>
        </div>
      ) : (
        <p className="text-text-muted">{t("signIn.signingIn")}</p>
      )}
    </main>
  );
}
