"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { StickerBadge } from "@/components/ui/sticker-badge";
import { Button } from "@/components/ui/button";
import { RewardOverlay } from "@/components/rewards/reward-overlay";
import { recordHutResult, nextStickerToCollect } from "@/lib/storage";
import type { CharacterSticker, Skill } from "@/lib/types";

const HUT_LABEL: Record<Skill, string> = {
  listen: "Listen",
  speak: "Speak",
  read: "Read",
  write: "Write",
};

interface Props {
  childId: string;
  themeId: string;
  skill: Skill;
  mastered: boolean;
  onPlayAgain: () => void;
}

interface Award {
  sticker: CharacterSticker | null;
  master: CharacterSticker | null;
  next: CharacterSticker | null;
}

// Shown when any hut finishes. Records the result once (awards the next sticker,
// persists progress), celebrates it in the reward overlay, then shows the
// play-again / back screen with the sticker the child just earned.
export function HutResult({ childId, themeId, skill, mastered, onPlayAgain }: Props) {
  const router = useRouter();
  const recorded = useRef(false);
  const [award, setAward] = useState<Award | null>(null);
  const [overlayDone, setOverlayDone] = useState(false);

  useEffect(() => {
    if (recorded.current) return; // guard against StrictMode double-invoke
    recorded.current = true;
    const outcome = recordHutResult(childId, themeId, skill, mastered);
    setAward({
      sticker: outcome.newSticker,
      master: outcome.masterSticker,
      next: nextStickerToCollect(childId),
    });
  }, [childId, themeId, skill, mastered]);

  if (award && (award.sticker || award.master) && !overlayDone) {
    return (
      <RewardOverlay
        sticker={award.sticker}
        master={award.master}
        next={award.next}
        onDismiss={() => setOverlayDone(true)}
      />
    );
  }

  return (
    <TabletShell>
      <ScreenHeader title="All done!" />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        {award?.sticker && <StickerBadge sticker={award.sticker} size={120} tilt={-5} />}
        <h1 className="font-display text-2xl font-semibold text-ink">
          {mastered ? "You earned a sticker!" : "Nice try — sticker earned!"}
        </h1>
        <p className="text-sm font-semibold text-ink-muted">
          {mastered ? `You mastered the ${HUT_LABEL[skill]} hut.` : "Play again to master this hut."}
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
