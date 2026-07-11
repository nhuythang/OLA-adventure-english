"use client";

import { useState } from "react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { TracePad } from "@/components/huts/trace-pad";
import { LetterTiles } from "@/components/huts/letter-tiles";
import { SentenceTiles } from "@/components/huts/sentence-tiles";
import { HutResult } from "@/components/huts/hut-result";
import { useRouter } from "next/navigation";
import { childById } from "@/data/children";
import { themeContent } from "@/data/themes/content";
import { letterPath } from "@/data/letters";
import { playCorrect } from "@/lib/sounds";
import { meetsMastery } from "@/lib/engine/scoring";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";
import type { Attempt } from "@/lib/types";

const ROUNDS = 3; // writing is effortful — fewer rounds than the tap huts
const ADVANCE_MS = 800;

export function WriteHut({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);
  const content = themeContent(themeId);
  if (!child || !content) return null;

  const level = effectiveLevel(child, progress, "write");
  const isStarter = level === "starter";
  const isFlyer = level === "flyer";
  const words = content.wordsForLevel(level).slice(0, ROUNDS);
  const word = words[index]!;

  function finishRound(misses: number) {
    playCorrect();
    setAttempts((prev) => [
      ...prev,
      {
        skill: "write",
        themeId,
        firstTryCorrect: misses === 0,
        hintsUsed: Math.min(misses, 2),
        itemId: word.word,
      },
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
        skill="write"
        mastered={meetsMastery(attempts)}
        attempts={attempts}
        onPlayAgain={restart}
      />
    );
  }

  const letter = (word.word[0] ?? "").toUpperCase();
  const sentenceWords = content.sentenceWords(word.word);
  const instruction = isStarter
    ? `Trace the letter ${letter}`
    : isFlyer
      ? `Build the sentence: ${sentenceWords.join(" ")}`
      : `Spell ${word.word}`;

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
      ) : isFlyer ? (
        <SentenceTiles key={index} words={sentenceWords} emoji={word.emoji} onComplete={finishRound} />
      ) : (
        <LetterTiles key={index} word={word.word} emoji={word.emoji} onComplete={finishRound} />
      )}
    </TabletShell>
  );
}
