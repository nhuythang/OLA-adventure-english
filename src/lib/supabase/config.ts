// Supabase environment. Both vars are public (anon key is safe client-side; RLS
// is the real guard). They are intentionally EMPTY in dev:demo and the e2e
// harness so the parent area degrades to "not configured" instead of crashing —
// child mode never needs Supabase.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when both vars are set — callers must short-circuit when false. */
export const isSupabaseConfigured = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
