"use client";

import { clearAllProgress } from "@/lib/storage";

// Dev affordance to wipe saved progress (Phase 1). Moves into the PIN-gated
// parent area in a later phase.
export function ResetProgressButton() {
  return (
    <button
      type="button"
      onClick={() => {
        clearAllProgress();
        window.location.reload();
      }}
      className="text-xs font-semibold text-ink-muted underline"
    >
      Reset progress
    </button>
  );
}
