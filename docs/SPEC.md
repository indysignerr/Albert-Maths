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
- Automatic filtering of insults, harassment patterns and sensitive terms.

## Languages

- Interface in English by default.
- Onboarding asks French track or English track; that choice sets the language.
- Changeable at any time in settings.
- The language of a photographed exercise is auto-detected.

## Accounts and data

- Supabase auth, school email.
- Some students are minors (17): no profiling, no ad tech, data minimisation.
- Uploaded photos are deleted after processing; only the conversation thread persists.

## Model strategy

Provider-agnostic by design — one interface, swappable backends.

1. Default: **Mistral** free tier. Hosted in Paris, GDPR-native, does not train on
   submitted data. The only free tier acceptable for real student work.
2. **BYOK**: a student can supply their own free Gemini key, keeping the app free
   at any scale.
3. Once school-funded: Kimi K2.6 (~$0.005 per exercise) or paid Mistral.

Every numeric result is re-verified client-side with SymPy compiled to WebAssembly,
so an arithmetic slip by the model never reaches the student as fact.

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
