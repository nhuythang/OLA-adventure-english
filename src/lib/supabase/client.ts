"use client";

import { createBrowserClient } from "@supabase/ssr";

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Browser Supabase client for client components (login form). Returns null when
// Supabase isn't configured (dev:demo / e2e) so the UI can show a friendly
// "not configured" state instead of throwing.
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
