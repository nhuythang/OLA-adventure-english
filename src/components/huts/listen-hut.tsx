"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { childById } from "@/data/children";
import { WEATHER_WORDS } from "@/data/themes/weather";
import { type EngineQuestion } from "@/lib/engine/hut-machine";

const ROUNDS = 5;

// Listen mechanic: hear a word → tap the matching picture. Labels are hidden
// (a reader would otherwise just match text), so pictures + audio carry it.
function buildListenQuestions(): EngineQuestion[] {
  return WEATHER_WORDS.slice(0, ROUNDS).map((target) => ({
    id: target.word,
    prompt: target.word,
    reveal: `This one is ${target.word}.`,
    correct: { id: target.word, label: target.word, emoji: target.emoji },
    distractors: WEATHER_WORDS.filter((w) => w.word !== target.word).map((w) => ({
      id: w.word,
      label: w.word,
      emoji: w.emoji,
    })),
  }));
}

export function ListenHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const questions = useMemo(() => buildListenQuestions(), []);
  if (!child) return null;

  // Starter = 2 choices, Mover/Flyer = 3 (Flyer sentence-listen is task 20).
  const choiceCount = child.skillLevels.listen === "starter" ? 2 : 3;

  return (
    <HutPlayer
      childId={childId}
      themeId={themeId}
      skill="listen"
      questions={questions}
      choiceCount={choiceCount}
      showLabels={false}
    />
  );
}
