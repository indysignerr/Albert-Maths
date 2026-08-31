# Albert Maths — product decisions

Locked during scoping. Anything not listed here is still open.

## Purpose

Help Albert School students find and understand their own mistakes. Explicitly
*not* a homework accelerator — every design decision below follows from that.

## Pedagogy

- Photographing an exercise never returns the answer directly.
- Four hint levels, unlocked one at a time: (1) restate what is asked,
  (2) which notion applies, (3) the first step, (4) full solution.
- The full solution additionally requires the student to have submitted an attempt.
- A separate optional mode explains the underlying notion without touching the exercise.
- The student can photograph their own working; the tutor localises the failing step.
- After a confirmed error, a similar exercise is generated to check understanding.
- A revision drill before a test is built from the student's own wrong attempts,
  not from a bulk upload of the teacher's exercise sheet — nobody photographs
  thirty exercises on a Sunday evening, and the app already knows which ones
  broke. Answers are written out and checked symbolically, never multiple
  choice: an MCQ can be guessed and, more to the point, it cannot show where the
  reasoning went wrong, which is the one thing this tool is for. The report is
  per notion rather than a score.
- The chat tutor is Socratic: it replies with questions that move the student forward.
- A short reflection delay sits between hint levels.
- A daily cap on new exercises discourages bulk-scanning a problem set.
- Gamification scores *errors understood* and *consolidation exercises passed* —
  never the number of solutions viewed.

## Scope

- **V1: maths only.** The data model carries a "subject" so a coding track can be
  added later without a rewrite.
- No exam-correction feature at launch (no teacher on board yet). The upload path
  is built teacher-gated so it can be switched on the day one joins.

## Curriculum

B1 level, common core across all campuses: algebra, analysis I & II, probability,
statistics, matrix decomposition. Same programme in Paris, Milan, Madrid, Geneva
and Marseille, so content is shared across campuses.

## Roles and groups

- Hierarchy: School → Campus → Cohort → Class → Study group.
- Students join a class with an invite code; multi-group membership allowed.
- Teachers, when present, see **aggregated anonymous class statistics only** —
  never individual conversations. A dedicated teacher channel is the one place a
  teacher and students talk directly.

## Social

- Class channels with realtime chat.
- Students appear as first name + last initial.
- Two layers of moderation. A blocked-term list catches unambiguous slurs —
  including those aimed at religion, ethnicity and sexuality — enforced by a
  database trigger, not the interface. Neutral words for a religion or an origin
  are deliberately absent: a student must be able to say what they are, and a
  list that blocked those would itself discriminate.
- Reporting covers the rest, because most hate speech is built from ordinary
  words and no list can catch it. Two independent reports hide a message; one
  cannot, so a single reader cannot silence a classmate. Hiding is reversible.

## Languages

- Interface in English by default.
- Onboarding asks French track or English track; that choice sets the language.
- Changeable at any time in settings.
- The language of a photographed exercise is auto-detected.

## Accounts and data

- Supabase auth, school email. **Password accounts**: one emailed link at
  sign-up leads to a page where the student chooses a password their browser can
  save; every later sign-in is local, with no email. `profiles.password_set_at`
  records that the step is done, because the client cannot read from
  `auth.users` whether a password exists. The same link serves password reset.
- Sign-up is gated by two tables: `allowed_email_domains` (seeded with
  `albertschool.com`) and `allowed_emails` for individual exceptions during
  development. **Every row in `allowed_emails` must be deleted before students
  are let in.**
- Some students are minors (17): no profiling, no ad tech, data minimisation.
- Uploaded photos are deleted after processing; only the conversation thread persists.

## Model strategy

Provider-agnostic by design — one interface, swappable backends.

1. Default: **Mistral** free tier. Hosted in Paris, GDPR-native, does not train on
   submitted data. The only free tier acceptable for real student work.
2. **BYOK**: a student can supply their own free Gemini key, keeping the app free
   at any scale.
3. Once school-funded: Kimi K2.6 (~$0.005 per exercise) or paid Mistral.

Every final value in a full solution is recomputed from the problem statement by
SymPy running as WebAssembly in the browser. The model supplies both a SymPy
expression for the problem and its own answer; if the two disagree the solution
is still shown, but labelled as unverified with the independently computed value
beside it — the reasoning may be sound even when the arithmetic is not.

This is not belt-and-braces. During prompt testing the model produced confidently
wrong values more than once, and a student cannot tell the difference. Loading is
deferred to the first check, since most sessions never reach a full solution.

## Platform

PWA, **desktop-first** (the primary use is a laptop next to a problem sheet),
fully responsive, offline-capable, dark mode included. Deployed on `.pages.dev`
for now.

## Brand

Sampled from official Albert School assets:

| Token | Value | Source |
| --- | --- | --- |
| Navy | `#202448` | logo mark and site body colour |
| Brand blue | `#2EAEE0` | site CSS variable `--swatch--brand-light` |
| Sky | `#74BEEA` | sphere in the logo |
| Mist | `#EAEFF6` | pale surface on the site |

Body type is **Work Sans**, matching the school site. Headings use **Outfit** —
the school's own display face (*At Textual*) is proprietary and cannot be reused.
