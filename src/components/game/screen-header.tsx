"use client";

import type { ReactNode } from "react";

type Props = {
  /** Back affordance. Omit on the home screen (renders a spacer to keep balance). */
  onBack?: () => void;
  /** Replays the spoken prompt. Only present on activity/round screens. */
  onReplayAudio?: () => void;
  /** Small centered title (optional). */
  title?: string;
  /** Right-hand slot — e.g. a sticker count later. OLA has no star currency. */
  right?: ReactNode;
  // Control labels. Child UI is English; these default in English and can be
  // overridden. TODO(task 03): source from i18n once the string files exist.
  backLabel?: string;
  audioLabel?: string;
};

// Universal header for every kid-facing screen.
// Left: back (first) → audio (coral, second when present).
// Middle: optional title. Right: optional slot (sticker count), else a spacer.
// No star counter — OLA's only currency is stickers (spec §6).
export function ScreenHeader({
  onBack,
  onReplayAudio,
  title,
  right,
  backLabel = "Go back",
  audioLabel = "Hear it again",
}: Props) {
  return (
    <header className="flex items-center justify-between gap-2 py-2">
      <div className="flex gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-border-soft bg-card text-ink transition-transform active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <span className="h-16 w-16" aria-hidden />
        )}
        {onReplayAudio && (
          <button
            type="button"
            onClick={onReplayAudio}
            aria-label={audioLabel}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-coral-dark text-white transition-transform active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>
        )}
      </div>

      {title ? (
        <span className="font-display text-base text-ink-muted">{title}</span>
      ) : (
        <span aria-hidden />
      )}

      {right ?? <span className="h-16 w-16" aria-hidden />}
    </header>
  );
}
