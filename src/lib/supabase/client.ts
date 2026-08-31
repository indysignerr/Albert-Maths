import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Failing the build is deliberate. These are inlined at build time, so a build
// without them produces a site where every request fails at runtime with a much
// more confusing error. Better to never ship it.
if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "They are committed in .env.production for deploys; locally, copy .env.example to .env.local.",
  );
}

/**
 * The app is a static export, so there is no server session: Supabase holds the
 * session in the browser and RLS does the enforcing. The anon key is public by
 * design — every rule that matters lives in supabase/migrations.
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Implicit, not PKCE. PKCE keeps a verifier in the localStorage of the
    // browser that *asked* for the link, so the link only works if it is opened
    // in that same browser profile — which breaks the ordinary case of reading
    // mail on a phone and working on a laptop, and breaks incognito entirely.
    // The session lands in the URL fragment, which browsers never send to a
    // server, and the client strips it on arrival.
    flowType: "implicit",
  },
});
