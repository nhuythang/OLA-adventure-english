"use client";

import { useRouter } from "next/navigation";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { StickerBadge } from "@/components/ui/sticker-badge";
import { Button } from "@/components/ui/button";
import { childById } from "@/data/children";
import { stickersForSet } from "@/data/stickers/sticker-bank";

interface Props {
  childId: string;
  themeId: string;
  mastered: boolean;
  hutLabel: string;
  onPlayAgain: () => void;
}

// Shared end-of-hut screen for every hut type. The reward overlay + real
// one-by-one sticker award/persistence are tasks 14/15 — for now we celebrate
// with a placeholder sticker from the child's set.
export function HutResult({ childId, themeId, mastered, hutLabel, onPlayAgain }: Props) {
  const router = useRouter();
  const child = childById(childId);
  const award = child ? stickersForSet(child.stickerSet)[0] : undefined;

  return (
    <TabletShell>
      <ScreenHeader title="All done!" />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        {award && <StickerBadge sticker={award} size={120} tilt={-5} />}
        <h1 className="font-display text-2xl font-semibold text-ink">
          {mastered ? "You earned a sticker!" : "Nice try — sticker earned!"}
        </h1>
        <p className="text-sm font-semibold text-ink-muted">
          {mastered ? `You mastered the ${hutLabel} hut.` : "Play again to master this hut."}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onPlayAgain}>
            Play again
          </Button>
          <Button variant="primary" onClick={() => router.push(`/child/${childId}/island/${themeId}`)}>
            Back to island
          </Button>
        </div>
      </div>
    </TabletShell>
  );
}
