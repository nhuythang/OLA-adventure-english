"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { StickerBadge } from "@/components/ui/sticker-badge";
import { Button } from "@/components/ui/button";
import { playReward } from "@/lib/sounds";
import type { CharacterSticker } from "@/lib/types";

interface Props {
  sticker: CharacterSticker | null;
  master: CharacterSticker | null;
  /** The next sticker still to collect — shown as a teaser. */
  next: CharacterSticker | null;
  onDismiss: () => void;
}

// Modal celebration over the activity (behavior rule 8: overlay, not a screen).
// Names the win specifically, celebrates a theme-master legendary if earned, and
// teases the next sticker to keep motivation. Reduced motion → fade, no pop.
export function RewardOverlay({ sticker, master, next, onDismiss }: Props) {
  const reduce = useReducedMotion();
  useEffect(() => {
    playReward();
  }, []);

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-6">
      <motion.div
        {...enter}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[28px] bg-cream px-6 py-8 text-center"
      >
        {sticker && <StickerBadge sticker={sticker} size={128} tilt={-5} />}
        <h2 className="font-display text-2xl font-semibold text-ink">
          {sticker ? `You earned ${sticker.name}!` : "Sticker earned!"}
        </h2>

        {master && (
          <div className="mt-1 flex flex-col items-center gap-2 rounded-[20px] bg-[#FFF1CF] px-4 py-3">
            <StickerBadge sticker={master} size={84} />
            <p className="font-display text-sm font-semibold text-gold-dark">
              Island mastered — new island unlocked!
            </p>
          </div>
        )}

        {next && (
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-dashed border-border-soft text-border-soft"
              aria-hidden
            >
              <Lock size={16} />
            </span>
            Next sticker: keep playing!
          </div>
        )}

        <Button variant="primary" onClick={onDismiss} className="mt-2">
          Keep going
        </Button>
      </motion.div>
    </div>
  );
}
