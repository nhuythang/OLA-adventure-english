"use client";

import { useActionState } from "react";

import { submitPin, type ActionState } from "@/app/parent/actions";
import { Button } from "@/components/ui/button";
import { PIN_LENGTH } from "@/lib/auth/constants";
import { vi } from "@/i18n";

const t = vi.parent;
const initial: ActionState = {};

const pinField =
  "min-h-[56px] w-full rounded-2xl border-2 border-border-soft bg-card px-4 text-center " +
  "text-2xl tracking-[0.5em] text-ink outline-none focus:border-teal-dark";

const pinProps = {
  type: "password",
  inputMode: "numeric" as const,
  autoComplete: "off",
  pattern: `\\d{${PIN_LENGTH}}`,
  maxLength: PIN_LENGTH,
  required: true,
  className: pinField,
};

// First-time setup (choose + confirm) or re-entry (single field). The mode is
// posted as a hidden field so one server action covers both.
export function PinGate({ mode }: { mode: "setup" | "enter" }) {
  const [state, action, pending] = useActionState(submitPin, initial);
  const isSetup = mode === "setup";

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {isSetup ? t.pinSetupTitle : t.pinEnterTitle}
        </h1>
        <p className="mt-2 text-ink-muted">{isSetup ? t.pinSetupSubtitle : t.pinEnterSubtitle}</p>
      </header>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="mode" value={mode} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-muted">{isSetup ? t.pinSetupTitle : t.pinEnterTitle}</span>
          <input name="pin" aria-label={t.pinEnterTitle} {...pinProps} />
        </label>
        {isSetup ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-muted">{t.pinConfirm}</span>
            <input name="confirm" aria-label={t.pinConfirm} {...pinProps} />
          </label>
        ) : null}

        {state.error ? (
          <p role="alert" className="text-center text-coral-dark">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="mt-2">
          {isSetup ? t.pinSave : t.pinSubmit}
        </Button>
      </form>
    </div>
  );
}
