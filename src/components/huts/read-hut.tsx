"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { childById } from "@/data/children";
import { weatherWordsForLevel } from "@/data/themes/weather";
import { buildPictureQuestions } from "@/lib/engine/picture-questions";

const ROUNDS = 5;

// Read mechanic: read the printed word → tap the matching picture.
// - Starter (L1): sight-word recognition, audio support on (hear the word).
// - Mover  (L2): read independently, NO audio.
// Labels on the picture choices stay hidden so the word must actually be read.
export function ReadHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const level = child?.skillLevels.read ?? "starter";
  const questions = useMemo(() => buildPictureQuestions(weatherWordsForLevel(level), ROUNDS), [level]);
  if (!child) return null;

  const isStarter = level === "starter";
  const choiceCount = isStarter ? 2 : 3;

  return (
    <HutPlayer
      childId={childId}
      themeId={themeId}
      skill="read"
      questions={questions}
      choiceCount={choiceCount}
      promptMode="word"
      speakPrompts={isStarter}
      showLabels={false}
    />
  );
}
