"use client";

import { memo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

// idle     — tappable, neutral
// correct  — chosen correctly: green + check (flashes within ~200ms)
// dimmed   — a wrong choice dimmed by the 1st-miss scaffold (not tappable)
// revealed — the correct choice highlighted by the 2nd-miss scaffold (tappable)
export type ChoiceState = "idle" | "correct" | "dimmed" | "revealed";

interface Props {
  id: string;
  /** The word, e.g. "sunny". */
  label: string;
  /** Emoji or SVG picture. */
  visual: ReactNode;
  state?: ChoiceState;
  /** Hidden on Level 1 (pre-reader) screens; pictures + audio carry meaning. */
  showLabel?: boolean;
  onSelect?: (id: string) => void;
}

function ChoiceCardBase({
  id,
  label,
  visual,
  state = "idle",
  showLabel = true,
  onSelect,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const interactive = state === "idle" || state === "revealed";

  const states: Record<ChoiceState, string> = {
    idle: "bg-card border-border-soft",
    correct: "bg-[#DCFBE7] border-success",
    revealed: "bg-card border-success ring-4 ring-success/40",
    dimmed: "bg-card border-border-soft opacity-40",
  };

  return (
    <button
      type="button"
      data-choice={id}
      data-state={state}
      aria-label={label}
      aria-disabled={!interactive}
      onPointerDown={() => interactive && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => interactive && onSelect?.(id)}
      className={cn(
        "relative flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-[22px] border-4 p-5",
        "transition-[transform,background-color,opacity,box-shadow] duration-200 motion-reduce:transition-none",
        states[state],
        pressed ? "scale-95" : "scale-100",
      )}
    >
      <span className="text-6xl leading-none" aria-hidden>
        {visual}
      </span>
      {showLabel && (
        <span className="font-display text-lg font-semibold text-ink">{label}</span>
      )}
      {state === "correct" && (
        <span
          className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-success text-white"
          aria-hidden
        >
          <Check size={22} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// Memoized: when one card flips to "correct", siblings must not re-render
// (native-feel rule — keeps the flash jank-free).
export const ChoiceCard = memo(ChoiceCardBase);
