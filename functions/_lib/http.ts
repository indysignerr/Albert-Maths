import type { ProviderEnv } from "./mistral";

export interface Env extends ProviderEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** Comma-separated origins allowed to call the API from a browser in dev. */
  DEV_ORIGINS?: string;
}

/**
 * Trades a round-trip for simplicity: Supabase itself validates the JWT, so
 * nothing here holds a signing key or drifts out of sync with rotated secrets.
 */
export async function authenticate(request: Request, env: Env) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const res = await fetch(
    `${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`,
    { headers: { Authorization: header, apikey: env.SUPABASE_ANON_KEY } },
  );
  if (!res.ok) return null;

  const user = (await res.json()) as { id?: string };
  return user.id ? user : null;
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
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

export function json(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Expected a JSON body");
  }
}
