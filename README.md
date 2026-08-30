# Albert Maths

A guided maths tutor for Albert School students. You photograph an exercise, work
through it with hints that unlock one at a time, then photograph your own working
so the tutor can point at the step where your reasoning broke.

It is built so that it is **bad at doing your homework and good at teaching you**:
the full solution stays locked until you have attempted the problem, the chat
answers with questions rather than results, and every wrong answer produces a
similar exercise to check the idea actually landed.

Not an official Albert School product.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static export) |
| Styling | Tailwind CSS v4, tokens sampled from the Albert School brand |
| Auth + data + realtime | Supabase |
| Model | provider-agnostic; Mistral (Paris) by default, Kimi K2.6 / Gemini / OpenRouter swappable |
| Symbolic check | SymPy via Pyodide, in the browser — every result the model produces is re-verified |
| Hosting | Cloudflare Pages + Pages Functions |

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values
npm run dev
```

## Build

```bash
npm run build     # emits ./out — the directory Cloudflare Pages serves
```

## Deployment

Cloudflare Pages, build command `npm run build`, output directory `out`,
`NODE_VERSION=20`. Model API keys go in *Settings → Environment variables* as
**encrypted** values so they stay server-side in the Pages Functions.
