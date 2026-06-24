import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";

// Placeholder home — exercises the design tokens + chrome from task 02.
// The real sticker-book landing screen is built in task 06.
const SWATCHES = [
  { name: "coral", className: "bg-coral" },
  { name: "teal", className: "bg-teal" },
  { name: "gold", className: "bg-gold" },
  { name: "success", className: "bg-success" },
] as const;

export default function HomePage() {
  return (
    <TabletShell>
      <ScreenHeader title="Design check" />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">
          OLA English Adventure
        </h1>
        <p className="text-lg text-ink-muted">
          Scaffold + design system ready — let the adventure begin.
        </p>
        <div className="flex gap-3">
          {SWATCHES.map((s) => (
            <span
              key={s.name}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${s.className}`}
              aria-label={`${s.name} swatch`}
            />
          ))}
        </div>
      </div>
    </TabletShell>
  );
}
