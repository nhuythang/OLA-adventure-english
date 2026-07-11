"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { SentenceTiles } from "@/components/huts/sentence-tiles";
import { PromptVisual } from "@/components/huts/grammar-scene";
import { ObserveIntro } from "@/components/huts/observe-intro";
import { HutResult } from "@/components/huts/hut-result";
import { childById } from "@/data/children";
import { GRAMMAR_OBSERVE_FRAMES, grammarRoundItems } from "@/data/grammar";
import { playCorrect } from "@/lib/sounds";
import { meetsMastery } from "@/lib/engine/scoring";
import type { Attempt } from "@/lib/types";

const ROUNDS = 3; // building a sentence is effortful — fewer rounds than the tap huts

// Grammar Write: build the target form from word tiles (e.g. "I see three cats",
// "She is running") — the child's own hands place the plural -s / the -ing verb.
// Unlike the vocab Write hut there's no letter-tracing path: grammar is word
// order + form, so every level builds the phrase from tiles.
export function GrammarWriteHut({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const [showObserve, setShowObserve] = useState(true);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);
  if (!child) return null;

  const toIsland = () => router.push(`/child/${childId}/island/${themeId}`);

  if (showObserve) {
    return (
      <ObserveIntro
        frames={GRAMMAR_OBSERVE_FRAMES}
        onBack={toIsland}
        onDone={() => setShowObserve(false)}
      />
    );
  }

  const items = grammarRoundItems(ROUNDS);
  const item = items[index]!;

  function finishRound(misses: number) {
    playCorrect();
    setAttempts((prev) => [
      ...prev,
      {
        skill: "write",
        themeId,
        firstTryCorrect: misses === 0,
        hintsUsed: Math.min(misses, 2),
        itemId: item.id,
      },
    ]);
    setTimeout(() => {
      if (index + 1 >= items.length) setDone(true);
      else setIndex((i) => i + 1);
    }, 800);
  }

  function restart() {
    setIndex(0);
    setAttempts([]);
    setDone(false);
  }

  if (done) {
    return (
      <HutResult
        childId={childId}
        themeId={themeId}
        skill="write"
        mastered={meetsMastery(attempts)}
        attempts={attempts}
        onPlayAgain={restart}
      />
    );
  }

  const sentence = item.sentenceWords.join(" ");

  return (
    <TabletShell>
      <ScreenHeader onBack={toIsland} right={<ProgressDots total={items.length} current={index} />} />

      <div className="flex flex-col items-center gap-2 py-4">
        <AudioButton key={index} text={`Build the sentence: ${sentence}`} label="Hear it again" />
      </div>

      <SentenceTiles
        key={index}
        words={item.sentenceWords}
        visual={<PromptVisual visual={item.correct.emoji} />}
        onComplete={finishRound}
      />
    </TabletShell>
  );
}
