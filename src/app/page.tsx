import { TabletShell } from "@/components/game/tablet-shell";
import { ViewTransitionLink } from "@/components/game/view-transition-link";
import { CHILDREN } from "@/data/children";

// Minimal "who's playing?" chooser. The full picker + dev level toggle is task 16.
export default function HomePage() {
  return (
    <TabletShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Who&apos;s playing?</h1>
        <div className="grid w-full max-w-md grid-cols-2 gap-5">
          {CHILDREN.map((child) => (
            <ViewTransitionLink
              key={child.id}
              href={`/child/${child.id}`}
              aria-label={child.name}
              className="flex flex-col items-center gap-3 rounded-[24px] bg-card px-4 py-8 shadow-[0_6px_0_#E7DFD2] active:translate-y-[2px] active:shadow-[0_4px_0_#E7DFD2] transition-transform duration-100 motion-reduce:transition-none"
            >
              <span className="text-6xl" aria-hidden>
                {child.avatar}
              </span>
              <span className="font-display text-xl font-semibold text-ink">{child.name}</span>
            </ViewTransitionLink>
          ))}
        </div>
      </div>
    </TabletShell>
  );
}
