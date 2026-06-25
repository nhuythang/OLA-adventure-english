"use client";

import { useRouter } from "next/navigation";
import { Play, Sticker } from "lucide-react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { StickerBadge } from "@/components/ui/sticker-badge";
import { ViewTransitionLink } from "@/components/game/view-transition-link";
import { LevelToggles } from "@/components/dev/level-toggles";
import { childById } from "@/data/children";
import { stickersForSet } from "@/data/stickers/sticker-bank";
import { useChildProgress } from "@/lib/use-child-progress";

// Tilts repeat so the grid feels hand-placed without per-item data.
const TILTS = [-6, 4, -3, 5, -5, 3];

export function StickerBookHome({ childId }: { childId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const progress = useChildProgress(childId);
  if (!child) return null;

  const stickers = stickersForSet(child.stickerSet);
  const earned = new Set(progress.earnedStickerIds);

  return (
    <TabletShell>
      <ScreenHeader
        onBack={() => router.push("/")}
        backLabel="Go back"
        right={
          <span className="flex items-center gap-2 rounded-[20px] bg-[#FFF1CF] px-4 py-2 font-display text-base font-semibold text-gold-dark">
            <Sticker size={20} aria-hidden />
            {earned.size} / {stickers.length}
          </span>
        }
      />

      <div className="flex items-center gap-3 pt-1">
        <span className="text-5xl" aria-hidden>
          {child.avatar}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{child.name}</h1>
          <p className="text-sm font-semibold text-ink-muted">My sticker book</p>
        </div>
      </div>

      <ViewTransitionLink
        href={`/child/${childId}/map`}
        aria-label="Play"
        className="mt-4 flex items-center justify-between rounded-[24px] bg-coral px-5 py-4 shadow-[0_6px_0_#C9472F] active:translate-y-[2px] active:shadow-[0_4px_0_#C9472F] transition-transform duration-100 motion-reduce:transition-none"
      >
        <span>
          <span className="block font-display text-xl font-semibold text-white">Play</span>
          <span className="block text-xs font-semibold text-[#FAECE7]">Pick an island</span>
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-coral-dark">
          <Play size={26} aria-hidden />
        </span>
      </ViewTransitionLink>

      <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5">
        {stickers.map((s, i) => (
          <StickerBadge
            key={s.id}
            sticker={s}
            earned={earned.has(s.id)}
            size={64}
            tilt={earned.has(s.id) ? (TILTS[i % TILTS.length] ?? 0) : 0}
          />
        ))}
      </div>

      <LevelToggles childId={childId} />
    </TabletShell>
  );
}
