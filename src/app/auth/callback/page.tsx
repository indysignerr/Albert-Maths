"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * The Supabase client is configured with detectSessionInUrl, so by the time the
 * provider reports ready the code in the URL has already been exchanged. All
 * this page decides is where to send the student next.
 */
export default function AuthCallbackPage() {
  const { session, profile, ready } = useAuth();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      setFailed(true);
      return;
    }
    router.replace(profile?.onboarded_at ? "/app/" : "/onboarding/");
  }, [ready, session, profile, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 text-center">
      {failed ? (
        <div>
          <h1 className="font-display text-2xl font-light">
            That link has expired
          </h1>
          <p className="mt-3 text-text-muted">
            Sign-in links are single use and short lived.
          </p>
          <a
            href="/signin/"
            className="mt-6 inline-block text-brand-500 underline underline-offset-4"
          >
            Request a new one
          </a>
        </div>
      ) : (
        <p className="text-text-muted">Signing you in…</p>
      )}
    </main>
  );
}
