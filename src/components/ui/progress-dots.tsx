import { cn } from "@/lib/cn";

interface Props {
  total: number;
  /** 0-based index of the current question; earlier dots are done. */
  current: number;
}

// Three-state dots, never a % bar (behavior rule): done = green, current =
// amber + larger, upcoming = gray. Round count stays low so dots read at a glance.
export function ProgressDots({ total, current }: Props) {
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`Question ${Math.min(current + 1, total)} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <span
            key={i}
            className={cn(
              "rounded-full",
              active ? "h-3.5 w-3.5 bg-gold" : "h-2.5 w-2.5",
              done && "bg-success",
              !done && !active && "bg-border-soft",
            )}
          />
        );
      })}
    </div>
  );
}
