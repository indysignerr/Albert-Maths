"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

/**
 * The Supabase client is configured with detectSessionInUrl, so by the time the
 * provider reports ready the code in the URL has already been exchanged. All
 * this page decides is where to send the student next.
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
    router.replace(profile?.onboarded_at ? "/app/" : "/onboarding/");
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
