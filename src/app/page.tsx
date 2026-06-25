import Link from "next/link";
import { Lock } from "lucide-react";

import { TabletShell } from "@/components/game/tablet-shell";
import { ViewTransitionLink } from "@/components/game/view-transition-link";
import { ResetProgressButton } from "@/components/dev/reset-progress-button";
import { CHILDREN } from "@/data/children";

// Minimal "who's playing?" chooser. The full picker + dev level toggle is task 16.
export default function HomePage() {
  return (
    <TabletShell>
      {/* Discreet parent entry — an icon (not text nav), out of a child's way,
          gated by login + PIN. CLAUDE.md: no text-only navigation in child mode. */}
      <div className="flex justify-end">
        <Link
          href="/parent"
          aria-label="Khu vực phụ huynh"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink-muted shadow-[0_3px_0_#E7DFD2] active:translate-y-[2px]"
        >
          <Lock className="h-5 w-5" aria-hidden />
        </Link>
      </div>
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
        <ResetProgressButton />
      </div>
    </TabletShell>
  );
}
