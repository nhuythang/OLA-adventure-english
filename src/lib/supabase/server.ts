import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Server Supabase client for server components, layouts, and server actions.
// Reads/writes the session cookies. Returns null when Supabase isn't configured
// so callers treat the request as signed-out rather than crashing. cookies() is
// async in Next 16 App Router.
export async function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components writes throw; the middleware refreshes the session
        // instead, so swallowing here is the documented Supabase SSR pattern.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // called from a Server Component — safe to ignore.
        }
      },
    },
  });
}
