import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Authoritative gate for child mode. Progress now lives in Supabase under the
// parent's session, so when Supabase is configured a signed-in parent is
// required. This runs in the Node runtime (unlike middleware, where NEXT_PUBLIC
// env is unreliable on the Edge), so createClient + the session read are correct.
// When Supabase is unconfigured (dev:demo / e2e) createClient() is null and child
// mode stays open on localStorage.
export default async function ChildLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/parent/login");
  }
  return <>{children}</>;
}
