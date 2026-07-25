import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/db";

/**
 * Browser-side Supabase client.
 * Uses the anon key (public) — RLS policies enforce all permissions.
 *
 * During build/prerender (when env vars aren't set) we fall back to
 * placeholder values so the client object can be constructed without
 * throwing. Real API calls will fail at runtime if env vars are still
 * missing — which is the correct behavior (surfacing the config error
 * to the user rather than crashing the build).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

  return createBrowserClient<Database>(url, anonKey);
}

