"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { Button } from "@/components/ui/button";
import { PromptVisual } from "@/components/huts/grammar-scene";
import { speak } from "@/lib/speech";
import type { ObserveFrame } from "@/data/grammar/types";

interface Props {
  frames: ObserveFrame[];
  /** Leave the hut entirely (back to the island). */
  onBack: () => void;
  /** All frames narrated, or skipped — show the hut's rounds. */
  onDone: () => void;
}

// The "Observe" beat (G3, the OLA cycle): a few narrated example frames shown
// once before a grammar hut's rounds, with NO rules stated ("one cat… two
// cats… cats!") — priming the pattern before Learn (scaffold-and-reveal) and
// Apply (the rounds). Skippable, auto-advances via speech onEnd (no timer).
export function ObserveIntro({ frames, onBack, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const frame = frames[index];

  useEffect(() => {
    if (!frame) {
      onDone();
      return;
    }
    speak(frame.narration, "en-US", { onEnd: () => setIndex((i) => i + 1) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!frame) return null;

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 } };

  return (
    <TabletShell>
      <ScreenHeader onBack={onBack} right={<Button variant="secondary" onClick={onDone}>Skip</Button>} />
      <motion.div
        key={index}
        {...enter}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-1 flex-col items-center justify-center gap-6 py-10"
      >
        <PromptVisual visual={frame.visual} />
        <p className="max-w-[20ch] text-center font-display text-3xl font-semibold text-ink">
          {frame.narration}
        </p>
      </motion.div>
    </TabletShell>
  );
}
