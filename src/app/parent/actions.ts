"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PIN_OK_COOKIE, isValidPinFormat } from "@/lib/auth/constants";
import { hashPin, verifyPin } from "@/lib/auth/pin";
import { createClient } from "@/lib/supabase/server";
import { vi } from "@/i18n";

export interface ActionState {
  error?: string;
}

const t = vi.parent;

// Mark the parent PIN-unlocked for this session (httpOnly, cleared on sign-out
// and when entering child mode — see middleware).
async function setPinOk(): Promise<void> {
  const store = await cookies();
  store.set(PIN_OK_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function parentSignIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: t.notConfigured };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: t.signInError };

  redirect("/parent");
}

export async function parentSignOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  (await cookies()).delete(PIN_OK_COOKIE);
  redirect("/parent/login");
}

// Handles both first-time setup (mode=setup, requires matching confirm) and
// re-entry (mode=enter). On success sets the PIN-ok cookie and lands on /parent.
export async function submitPin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: t.notConfigured };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parent/login");

  const pin = String(formData.get("pin") ?? "");
  if (!isValidPinFormat(pin)) return { error: t.pinInvalid };

  if (formData.get("mode") === "setup") {
    const confirm = String(formData.get("confirm") ?? "");
    if (pin !== confirm) return { error: t.pinMismatch };

    const { hash, salt } = hashPin(pin);
    const { error } = await supabase.from("parents").upsert({ id: user.id, pin_hash: hash, pin_salt: salt });
    if (error) return { error: t.notConfigured };
  } else {
    const { data } = await supabase.from("parents").select("pin_hash, pin_salt").eq("id", user.id).single();
    if (!data?.pin_hash || !data.pin_salt || !verifyPin(pin, data.pin_hash, data.pin_salt)) {
      return { error: t.pinWrong };
    }
  }

  await setPinOk();
  redirect("/parent");
}
