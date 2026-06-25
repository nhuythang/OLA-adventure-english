import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { parentSignOut } from "./actions";
import { PinGate } from "@/components/parent/pin-gate";
import { Button } from "@/components/ui/button";
import { PIN_OK_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { vi } from "@/i18n";

const t = vi.parent;

// Gated parent landing. Order: must be signed in (middleware + here), then must
// pass the PIN (setup the first time, enter thereafter). Real dashboard = task 24.
export default async function ParentHomePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/parent/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parent/login");

  const pinOk = (await cookies()).has(PIN_OK_COOKIE);
  if (!pinOk) {
    const { data } = await supabase.from("parents").select("pin_hash").eq("id", user.id).single();
    return <PinGate mode={data?.pin_hash ? "enter" : "setup"} />;
  }

  return (
    <div className="flex flex-col gap-6 text-center">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">{t.homeTitle}</h1>
        <p className="mt-2 text-ink-muted">{t.homeBlurb}</p>
      </header>

      <div className="flex flex-col items-center gap-4">
        <form action={parentSignOut}>
          <Button type="submit" variant="secondary">
            {t.signOut}
          </Button>
        </form>
        <Link href="/" className="text-ink-muted underline-offset-4 hover:underline">
          {t.backToKids}
        </Link>
      </div>
    </div>
  );
}
