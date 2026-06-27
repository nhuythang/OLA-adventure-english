"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { childById } from "@/data/children";
import { themeContent } from "@/data/themes/content";
import { buildPictureRounds } from "@/lib/review";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";

const ROUNDS = 5;

// Read mechanic: read the printed prompt → tap the matching picture.
// - Starter (L1): read a word, audio support on, 2 choices.
// - Mover  (L2): read a word independently, NO audio, 3 choices.
// - Flyer  (L3): read a SENTENCE, tap the scene, NO audio, 4 choices.
// Labels on the picture choices stay hidden so the prompt must actually be read.
// Rounds interleave ~30% review items from mastered themes (active recall).
export function ReadHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const content = themeContent(themeId);
  const level = child ? effectiveLevel(child, progress, "read") : "starter";
  const isFlyer = level === "flyer";
  const questions = useMemo(
    () => buildPictureRounds(themeId, progress.masteredThemes, level, ROUNDS),
    [themeId, progress.masteredThemes, level],
  );
  if (!child || !content) return null;

  const isStarter = level === "starter";
  const choiceCount = isStarter ? 2 : level === "mover" ? 3 : 4;

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
      sentencePrompt={isFlyer}
    />
  );
}
