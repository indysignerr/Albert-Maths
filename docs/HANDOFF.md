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

## The platform: Albert Tools

The school has approved the project and the use of its name, so this is the
direction. One portal with tiles for each tool: maths, code, and a lecture
recorder that summarises for a whole class.

### Decided: one application, not several

The tools are sections of this app — `/maths/…`, `/code/…`, `/cours/…` — not
separate deployments.

The wanted behaviour is "sign in at the portal, click a tool, already
authenticated". With one origin that is not a feature, it is what happens by
default. Separate subdomains would mean building single sign-on across them:
the Supabase session lives in localStorage, which is partitioned per origin, so
it would take cookies on the parent domain or a token hand-off — work to solve a
problem the split would have created.

Extracting a tool later stays possible, and would reuse the same Supabase
project either way.

Do not start a new repository. Auth, classes, moderation, i18n, the legal pages
and the deployment are all subject-agnostic already, and `problems.subject`
exists for exactly this. The work is routing and a portal, not a rebuild.

### Shape

```
/                 marketing, unchanged
/app              the portal — tiles for each tool
/maths/solve      today's /solve
/maths/revise     today's /revise
/code/…           reuses the same classes, moderation and chat; subject changes
/cours/…          the lecture recorder
/classes          cross-cutting, not owned by any tool
/settings         cross-cutting
```

### Still open

- **Cross-platform**: the app is already an installable PWA on phone and
  desktop. Native store apps would be a separate project — confirm which is
  meant.
- **Domain**: a subdomain of the school's would also fix email deliverability,
  which currently goes through a personal Gmail account and lands in spam.
- **Consent for the recorder.** Recording a lecture records a teacher's voice.
  They have rights over it and under the GDPR the teacher becomes a data
  subject. The school's approval of the project is not the same as the teachers'
  approval of being recorded; get that before building it.
- **Cost**: transcription runs about €0.38 per two-hour lecture. That holds only
  if one student records and shares to the class — thirty individual recordings
  of the same lecture is thirty times the price, and a worse product.
