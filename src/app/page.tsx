import Link from "next/link";
import {
  Camera,
  Compass,
  MessagesSquare,
  ScanSearch,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AlbertMark } from "@/components/brand/logo";

const steps = [
  {
    icon: Camera,
    title: "Photograph the problem",
    body: "Snap the exercise from your sheet or screen. It is transcribed into clean notation you can check before anything else happens.",
  },
  {
    icon: Compass,
    title: "Work it with guided hints",
    body: "Four levels, unlocked one at a time: what the question is really asking, which result applies, the first move, then the full solution.",
  },
  {
    icon: ScanSearch,
    title: "Show your own attempt",
    body: "Photograph your working. You get the line where it broke and why — not a clean answer that teaches you nothing.",
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "The answer is never the first thing you see",
    body: "Solutions stay locked until you have made an attempt or worked through the hints. The tool is useless for copying and that is the point.",
  },
  {
    icon: MessagesSquare,
    title: "It asks before it tells",
    body: "The tutor replies with questions that move you forward. When you get something wrong it hands you a similar exercise to prove the idea stuck.",
  },
  {
    icon: Users,
    title: "You still talk to each other",
    body: "Every campus shares the same programme. Class channels let you compare approaches with people sitting the same exam.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mesh-albert relative overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 pt-20 pb-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-28 lg:pb-32">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-[13px] tracking-wide text-text-muted">
                <span
                  className="size-1.5 rounded-full bg-brand-500"
                  aria-hidden
                />
                Built for Albert School · Paris · Milan · Madrid · Geneva ·
                Marseille
              </p>

              <h1 className="mt-7 font-display text-[2.75rem] leading-[1.05] font-extralight sm:text-6xl lg:text-[4.25rem]">
                Find out{" "}
                <em className="text-gradient-albert not-italic font-normal">
                  where
                </em>{" "}
                you got it wrong.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
                Albert Maths does not do your homework. It takes the exercise
                you are stuck on, walks you to the answer one hint at a time,
                then reads your own working to show you the exact step that
                broke.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signin/"
                  className="inline-flex h-13 items-center rounded-full bg-navy-800 px-7 text-base font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-brand-500 dark:text-navy-950"
                >
                  Start with an exercise
                </Link>
                <a
                  href="#principles"
                  className="inline-flex h-13 items-center rounded-full border border-border-strong px-7 text-base text-text transition-colors hover:bg-surface"
                >
                  Why it refuses to just answer
                </a>
              </div>

              <p className="mt-6 text-sm text-text-faint">
                Free for students · works in English and French · every campus,
                same programme
              </p>
            </div>

            {/* Illustrative product frame */}
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-[2rem] blur-3xl"
                style={{ background: "var(--glow)" }}
                aria-hidden
              />
              <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_70px_-30px_rgba(32,36,72,0.45)]">
                <div className="flex items-center gap-2.5 border-b border-border pb-4">
                  <AlbertMark className="size-6" />
                  <span className="text-sm text-text-muted">
                    Analysis II · limits
                  </span>
                </div>

                <p className="mt-5 font-mono text-[15px] text-text">
                  lim<sub className="text-text-faint">x→0</sub> (sin&nbsp;3x) /
                  (tan&nbsp;5x)
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                    <p className="text-xs tracking-wide text-text-faint uppercase">
                      Hint 1 of 4
                    </p>
                    <p className="mt-1.5 text-[15px] text-text-muted">
                      Both parts go to zero. Which standard equivalent do you
                      know for small angles?
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3">
                    <span className="text-[15px] text-text-faint">
                      Full solution
                    </span>
                    <span className="rounded-full bg-bg-subtle px-3 py-1 text-xs text-text-faint">
                      locked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <h2 className="max-w-2xl font-display text-3xl leading-tight font-light sm:text-4xl">
              Three moves, in this order
            </h2>

            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span className="font-display text-sm text-brand-500 tabular-nums">
                    0{i + 1}
                  </span>
                  <step.icon
                    className="mt-4 size-6 text-text-muted"
                    aria-hidden
                  />
                  <h3 className="mt-4 text-xl font-medium">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Principles */}
        <section id="principles" className="mesh-albert border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl leading-tight font-light sm:text-4xl">
                A homework machine would be easy to build.
                <br />
                <span className="text-text-muted">
                  This one is deliberately harder to cheat with.
                </span>
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {principles.map((p) => (
                <article
                  key={p.title}
                  className="rounded-2xl border border-border bg-surface/80 p-7"
                >
                  <p.icon className="size-6 text-brand-500" aria-hidden />
                  <h3 className="mt-5 text-lg font-medium">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-muted">
                    {p.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Classes */}
        <section id="classes" className="border-t border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl leading-tight font-light sm:text-4xl">
                Your class, your campus, one programme
              </h2>
              <p className="mt-6 leading-relaxed text-text-muted">
                Join with a class code and you land in a channel with the people
                sitting the same exercises. Compare approaches, post the step
                you cannot get past, and see how someone else framed it.
                Everyone appears under their first name — no anonymous pile-ons,
                and abusive messages are filtered on the way in.
              </p>
              <p className="mt-4 leading-relaxed text-text-muted">
                Milan, Paris, Madrid, Geneva and Marseille follow the same
                curriculum, so a question asked on one campus is worth reading
                on all of them.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-7">
              <p className="text-xs tracking-wide text-text-faint uppercase">
                B1 · Milan · Analysis II
              </p>
              <div className="mt-5 space-y-4 text-[15px]">
                <p className="text-text-muted">
                  <span className="font-medium text-text">Léa M.</span> — I keep
                  losing the sign when I integrate by parts, anyone else?
                </p>
                <p className="text-text-muted">
                  <span className="font-medium text-text">Tomás R.</span> —
                  write u and dv in a column first, it stopped happening to me
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-navy-800 text-white dark:bg-navy-900">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 text-center sm:px-8">
            <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight font-light sm:text-4xl">
              Bring the exercise you have been avoiding.
            </h2>
            <Link
              href="/signin/"
              className="mt-9 inline-flex h-13 items-center rounded-full bg-brand-500 px-8 text-base font-medium text-navy-950 transition-transform hover:-translate-y-0.5"
            >
              Sign in with your school email
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            Albert Maths — a student project, not an official Albert School
            product.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy/"
              className="transition-colors hover:text-text"
            >
              Privacy
            </Link>
            <Link href="/terms/" className="transition-colors hover:text-text">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
