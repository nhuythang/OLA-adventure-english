"use client";

import { useActionState } from "react";
import Link from "next/link";

import { parentSignIn, type ActionState } from "@/app/parent/actions";
import { Button } from "@/components/ui/button";
import { vi } from "@/i18n";

const t = vi.parent;
const initial: ActionState = {};

const field =
  "min-h-[52px] w-full rounded-2xl border-2 border-border-soft bg-card px-4 text-lg text-ink " +
  "outline-none focus:border-teal-dark";

export function LoginForm() {
  const [state, action, pending] = useActionState(parentSignIn, initial);

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">{t.loginTitle}</h1>
        <p className="mt-2 text-ink-muted">{t.loginSubtitle}</p>
      </header>

      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-muted">{t.email}</span>
          <input name="email" type="email" autoComplete="email" required className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-muted">{t.password}</span>
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>

        {state.error ? (
          <p role="alert" className="text-center text-coral-dark">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? t.signingIn : t.signIn}
        </Button>
      </form>

      <Link href="/" className="text-center text-ink-muted underline-offset-4 hover:underline">
        {t.backToKids}
      </Link>
    </div>
  );
}
