"use client";

import { useState } from "react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { TracePad } from "@/components/huts/trace-pad";
import { LetterTiles } from "@/components/huts/letter-tiles";
import { HutResult } from "@/components/huts/hut-result";
import { useRouter } from "next/navigation";
import { childById } from "@/data/children";
import { WEATHER_WORDS } from "@/data/themes/weather";
import { letterPath } from "@/data/letters";
import { playCorrect } from "@/lib/sounds";
import { meetsMastery } from "@/lib/engine/scoring";
import type { Attempt } from "@/lib/types";

const ROUNDS = 3; // writing is effortful — fewer rounds than the tap huts
const ADVANCE_MS = 800;

export function WriteHut({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);
  if (!child) return null;

  const isStarter = child.skillLevels.write === "starter";
  const words = WEATHER_WORDS.slice(0, ROUNDS);
  const word = words[index]!;

  function finishRound(misses: number) {
    playCorrect();
    setAttempts((prev) => [
      ...prev,
      { skill: "write", themeId, firstTryCorrect: misses === 0, hintsUsed: Math.min(misses, 2) },
    ]);
    setTimeout(() => {
      if (index + 1 >= words.length) setDone(true);
      else setIndex((i) => i + 1);
    }, ADVANCE_MS);
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
        mastered={meetsMastery(attempts)}
        hutLabel="Write"
        onPlayAgain={restart}
      />
    );
  }

  const letter = (word.word[0] ?? "").toUpperCase();
  const instruction = isStarter ? `Trace the letter ${letter}` : `Spell ${word.word}`;

  return (
    <TabletShell>
      <ScreenHeader
        onBack={() => router.push(`/child/${childId}/island/${themeId}`)}
        right={<ProgressDots total={words.length} current={index} />}
      />

      <div className="flex flex-col items-center gap-2 py-4">
        <AudioButton key={index} text={instruction} label="Hear it again" />
        {isStarter && (
          <span className="font-display text-5xl font-semibold text-ink" aria-hidden>
            {letter}
          </span>
        )}
      </div>

      {isStarter ? (
        <TracePad key={index} pathD={letterPath(word.word)} onComplete={() => finishRound(0)} />
      ) : (
        <LetterTiles key={index} word={word.word} emoji={word.emoji} onComplete={finishRound} />
      )}
    </TabletShell>
  );
}
