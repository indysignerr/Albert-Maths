import {
  HINT_SYSTEM,
  REVIEW_SYSTEM,
  TRANSCRIBE_SYSTEM,
  reviewUserMessage,
} from "./prompts";
import { ProviderError, completeJson, ocr, type ProviderEnv } from "./mistral";

interface Env extends ProviderEnv {
  ASSETS: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** Comma-separated origins allowed to call the API from a browser in dev. */
  DEV_ORIGINS?: string;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    // Every endpoint costs money and quota, so every endpoint needs a real user.
    const user = await authenticate(request, env);
    if (!user) {
      return json({ error: "Sign in to use the tutor" }, 401, cors);
    }

    try {
      switch (url.pathname) {
        case "/api/transcribe":
          return json(await transcribe(request, env), 200, cors);
        case "/api/hint":
          return json(await hint(request, env), 200, cors);
        case "/api/review":
          return json(await review(request, env), 200, cors);
        default:
          return json({ error: "Not found" }, 404, cors);
      }
    } catch (err) {
      if (err instanceof ProviderError) {
        return json({ error: err.message }, err.status, cors);
      }
      const message = err instanceof Error ? err.message : "Unexpected error";
      return json({ error: message }, 400, cors);
    }
  },
} satisfies ExportedHandler<Env>;

// --- Endpoints -------------------------------------------------------------

interface Transcription {
  statement_latex: string;
  statement_plain: string;
  topic: string;
  lang: string;
  student_working: string[];
}

async function transcribe(request: Request, env: Env) {
  const { image } = await readJson<{ image?: string }>(request);
  if (!image?.startsWith("data:image/")) {
    throw new Error("Send the photo as a data: URL");
  }
  // base64 inflates by 4/3; guard before shipping it to the provider.
  if (image.length > MAX_IMAGE_BYTES * 1.4) {
    throw new Error("That photo is too large — try a tighter crop");
  }

  const markdown = await ocr(env, image);
  if (!markdown) {
    throw new Error("Nothing readable in that photo. Try better light or a closer crop.");
  }

  const parsed = await completeJson<Transcription>(
    env,
    TRANSCRIBE_SYSTEM,
    markdown,
  );
  return { ...parsed, raw_markdown: markdown };
}

async function hint(request: Request, env: Env) {
  const body = await readJson<{
    statement?: string;
    level?: number;
    language?: string;
    priorHints?: string[];
  }>(request);

  const level = Number(body.level);
  if (!body.statement || !Number.isInteger(level) || level < 1 || level > 4) {
    throw new Error("Send a statement and a level between 1 and 4");
  }

  // The database decides whether this level may be revealed at all; by the time
  // a request reaches here the hint_reveals row already exists.
  const prior = body.priorHints?.length
    ? `\n\nHints already given:\n${body.priorHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
    : "";

  return completeJson<{ hint: string }>(
    env,
    HINT_SYSTEM,
    `Language: ${body.language ?? "en"}\nRequested level: ${level}\n\nProblem: ${body.statement}${prior}`,
  );
}

async function review(request: Request, env: Env) {
  const body = await readJson<{ statement?: string; lines?: string[] }>(request);
  const lines = (body.lines ?? []).map((l) => l.trim()).filter(Boolean);

  if (!body.statement || lines.length === 0) {
    throw new Error("Send the problem and at least one line of working");
  }

  return completeJson<{
    verdict: "error" | "correct";
    first_bad_line: string | null;
    why: string;
    question_back: string;
  }>(env, REVIEW_SYSTEM, reviewUserMessage(body.statement, lines));
}

// --- Plumbing --------------------------------------------------------------

/**
 * Trades a round-trip for simplicity: Supabase itself validates the JWT, so the
 * Worker holds no signing key and cannot drift out of sync with rotated secrets.
 */
async function authenticate(request: Request, env: Env) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: header, apikey: env.SUPABASE_ANON_KEY },
  });
  if (!res.ok) return null;

  const user = (await res.json()) as { id?: string };
  return user.id ? user : null;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Expected a JSON body");
  }
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowed = (env.DEV_ORIGINS ?? "").split(",").map((o) => o.trim());
  // Same-origin in production needs no CORS; this exists for `next dev`.
  if (!origin || !allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
