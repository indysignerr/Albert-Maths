/**
 * Public project values, committed on purpose.
 *
 * Both already ship inside the client bundle — Next inlines them at build time —
 * so requiring them again as dashboard secrets protected nothing and added a
 * configuration step that, when missed, took the whole API down. Access is
 * governed by the RLS policies under supabase/, not by keeping these quiet.
 *
 * The environment still wins when set, so a fork or a staging project can point
 * elsewhere without touching this file.
 *
 * MISTRAL_API_KEY is deliberately absent: that one is a real secret and lives
 * only in the deployment's encrypted variables.
 */
export const PUBLIC_SUPABASE_URL = "https://adkzegihtpehqlvktjbo.supabase.co";
export const PUBLIC_SUPABASE_ANON_KEY =
  "sb_publishable_-ZXqfx5mvaJN9uWYGPDVSQ_nJiTXYsj";
