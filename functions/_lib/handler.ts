import { ProviderError } from "./mistral";
import { authenticate, corsHeaders, json, type Env } from "./http";

/**
 * Shared entry for every /api route: CORS preflight, method check, auth, and
 * uniform error shaping. Each route supplies only the part that differs.
 *
 * Note the `onRequest` export in the route files rather than `onRequestPost`:
 * Cloudflare Pages intermittently fails to register the method-specific
 * signatures, and the route 404s even though it deployed.
 */
export function apiRoute<T>(handle: (request: Request, env: Env) => Promise<T>) {
  return async function onRequest(context: {
    request: Request;
    env: Env;
  }): Promise<Response> {
    const { request, env } = context;
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    // Everything inside the try, authentication included. It was outside, so a
    // missing SUPABASE_URL made fetch() throw on an undefined host and the
    // request died as a Cloudflare 1101 exception page — which is not JSON, so
    // the client could only say "something went wrong".
    try {
      // Only the model key can be missing now — the Supabase values fall back
      // to committed public defaults. A deployment fault should say it is one
      // rather than surfacing as a failed sign-in.
      if (!env.MISTRAL_API_KEY) {
        return json(
          { error: "Server is misconfigured: MISTRAL_API_KEY not set" },
          503,
          cors,
        );
      }

      // Every endpoint costs quota, so every endpoint needs a real user.
      const user = await authenticate(request, env);
      if (!user) {
        return json({ error: "Sign in to use the tutor" }, 401, cors);
      }

      return json(await handle(request, env), 200, cors);
    } catch (err) {
      if (err instanceof ProviderError) {
        return json({ error: err.message }, err.status, cors);
      }
      const message = err instanceof Error ? err.message : "Unexpected error";
      return json({ error: message }, 400, cors);
    }
  };
}
