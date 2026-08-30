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

    // Every endpoint costs quota, so every endpoint needs a real user.
    const user = await authenticate(request, env);
    if (!user) {
      return json({ error: "Sign in to use the tutor" }, 401, cors);
    }

    try {
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
