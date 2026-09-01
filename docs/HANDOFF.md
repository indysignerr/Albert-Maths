# Picking this up in a new session

Everything here is live. Read this, then `docs/SPEC.md` for the product
decisions and why they were made.

## What exists

A working study tool at **https://albert-maths.pages.dev**, deployed from
`main` on every push. Repository: `indysignerr/Albert-Maths`.

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, **static export** (`output: "export"`) |
| Styling | Tailwind v4, tokens sampled from the real Albert School brand |
| Server code | Cloudflare **Pages Functions** in `functions/api/` — six endpoints |
| Auth, data, realtime | Supabase, `eu-central-1` (Frankfurt) |
| Model | Mistral (Paris) behind a provider-agnostic layer in `functions/_lib/mistral.ts` |
| Symbolic check | SymPy via Pyodide, in the browser, `src/lib/verify.ts` |

## The rules that must not be broken

These are the product, not implementation details.

1. **The hint ladder is enforced in the database**, not the interface.
   `can_reveal_level()` is called from the RLS policy on `hint_reveals`: hints
   unlock in order, and level 4 requires a submitted attempt. A client that
   skips the UI hits the same wall. Do not move this into React.

2. **The model never supplies an answer.** It returns a SymPy expression and the
   answer is computed. This was learned the hard way: asked directly for one it
   proposed "2" for an integral whose value is about 0.40. Telling a student
   their correct answer is wrong is the one failure this tool cannot recover
   from.

3. **No indefinite integrals in generated exercises.** Verified in Pyodide that a
   student writing the correct antiderivative with "+ C" compares as *different*.
   Both generation prompts require a determinate answer.

4. **The notion chat never receives the current exercise.** That is what stops it
   becoming a route around the hint ladder — not a promise in the prompt.

5. **Moderation is a trigger, not a filter in the client.** Neutral words for a
   religion or an origin are deliberately absent from `blocked_terms`.

## Where things live

```
functions/_lib/prompts.ts     every system prompt, with the reasoning inline
functions/_lib/mistral.ts     the only file that knows which provider is in use
functions/api/*.ts            transcribe · hint · review · chat · notion ·
                              consolidate · revision
src/lib/verify.ts             SymPy in the browser
src/lib/i18n/                 en.ts is the source of truth; fr.ts is a partial
                              overlay; it.ts and es.ts are empty
supabase/migrations/          0001–0008, all applied to the live project
docs/SPEC.md                  every scoping decision
```

## Applying a migration

There is no CLI wired up. Paste the file into the Supabase SQL editor and run
it. Verify from the outside afterwards — a REST call for a new column or RPC
tells you whether it really landed, and more than one migration in this project
was assumed applied when it was not.

## Known gaps

- `it` and `es` dictionaries are empty; they fall back to English per key.
- No way to reopen a past exercise from the dashboard.
- No recurring-mistake journal, though `attempts.error_step` already holds the
  data for one.
- No teacher role. Deferred deliberately: aggregate anonymous class statistics
  only, never individual conversations.
- Two personal addresses sit in `allowed_emails` for testing. **Remove them
  before students are let in.**
- Mistral's free tier caps requests per minute. Thirty students working the same
  evening will hit it.

## If the platform grows

The direction discussed is "Albert Tools": the maths tool, a code tool, and a
lecture recorder that summarises for a whole class.

Do not start a new repository. Auth, classes, moderation, i18n, the legal pages
and the deployment are all subject-agnostic already, and `problems.subject`
exists for exactly this. The work is routing and a dashboard that launches
tools, not a rebuild.

Two things to settle first, neither of them code:

- **The name.** "Albert" is the school's. Using it in a product name and a
  domain, before the school has agreed to anything, is a liability rather than
  an endorsement.
- **Consent for the recorder.** Recording a lecture records a teacher's voice.
  They have rights over it, the school's rules may forbid it, and under the GDPR
  the teacher becomes a data subject. This needs the school's agreement *before*
  it is built, not after.
