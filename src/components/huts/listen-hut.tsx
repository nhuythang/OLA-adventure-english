"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { childById } from "@/data/children";
import { weatherWordsForLevel } from "@/data/themes/weather";
import { buildPictureQuestions } from "@/lib/engine/picture-questions";

const ROUNDS = 5;

// Listen mechanic: hear a word → tap the matching picture. Labels are hidden
// (a reader would otherwise just match text), so pictures + audio carry it.
export function ListenHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const level = child?.skillLevels.listen ?? "starter";
  const questions = useMemo(() => buildPictureQuestions(weatherWordsForLevel(level), ROUNDS), [level]);
  if (!child) return null;

  // Starter = 2 choices, Mover/Flyer = 3 (Flyer sentence-listen is task 20).
  const choiceCount = level === "starter" ? 2 : 3;

  return (
    <HutPlayer
      childId={childId}
      themeId={themeId}
      skill="listen"
      questions={questions}
      choiceCount={choiceCount}
      promptMode="audio"
      showLabels={false}
    />
  );
}
