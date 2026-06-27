import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PlacementForm } from "@/components/parent/placement-form";
import { childById } from "@/data/children";
import { PIN_OK_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

// Per-skill placement, gated like the dashboard: signed-in parent + passed PIN.
// (Middleware already bounces unauthenticated /parent/* to login; the PIN check
// must be re-done here because it lives outside the /parent landing page.)
export default async function PlacementPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;

  const supabase = await createClient();
  if (!supabase) redirect("/parent/login");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parent/login");
  if (!(await cookies()).has(PIN_OK_COOKIE)) redirect("/parent");

  if (!childById(childId)) notFound();

  return <PlacementForm childId={childId} />;
}
