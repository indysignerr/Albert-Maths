"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, LogOut, MessagesSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AlbertLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function AppHome() {
  const { session, profile, ready, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/signin/");
    else if (profile && !profile.onboarded_at) router.replace("/onboarding/");
  }, [ready, session, profile, router]);

  if (!ready || !session) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-18 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/app/" className="text-lg">
            <AlbertLogo />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                router.replace("/");
              }}
            >
              <LogOut className="size-[18px]" aria-hidden />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mesh-albert flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
          <h1 className="font-display text-3xl font-light sm:text-4xl">
            {profile?.first_name ? `Hello, ${profile.first_name}.` : "Hello."}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-text-muted">
            What are you stuck on?
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Link
              href="/solve/"
              className="group rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-400"
            >
              <Camera className="size-6 text-brand-500" aria-hidden />
              <h2 className="mt-5 text-xl font-medium">
                Photograph an exercise
              </h2>
              <p className="mt-2 leading-relaxed text-text-muted">
                Transcribed, then worked through one hint at a time.
              </p>
            </Link>

            <Link
              href="/classes/"
              className="group rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-400"
            >
              <MessagesSquare className="size-6 text-brand-500" aria-hidden />
              <h2 className="mt-5 text-xl font-medium">Your class</h2>
              <p className="mt-2 leading-relaxed text-text-muted">
                Compare approaches with people sitting the same exercises.
              </p>
            </Link>
          </div>

          <section className="mt-14 rounded-2xl border border-dashed border-border p-7">
            <Sparkles className="size-5 text-text-faint" aria-hidden />
            <h2 className="mt-4 text-lg font-medium">Nothing here yet</h2>
            <p className="mt-2 max-w-lg leading-relaxed text-text-muted">
              Once you start working through problems, the exercises you got
              wrong and then understood will collect here.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
