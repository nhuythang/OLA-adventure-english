"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { childById } from "@/data/children";
import { themeContent } from "@/data/themes/content";
import { buildPictureRounds } from "@/lib/review";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";

const ROUNDS = 5;

// Listen mechanic: hear a prompt → tap the matching picture. Labels are hidden
// (a reader would otherwise just match text), so pictures + audio carry it.
// - Starter (L1): hear a word, 2 choices.   - Mover (L2): hear a word, 3 choices.
// - Flyer  (L3): hear a SENTENCE, tap the scene, 4 choices.
// Rounds interleave ~30% review items from mastered themes (active recall).
export function ListenHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const content = themeContent(themeId);
  const level = child ? effectiveLevel(child, progress, "listen") : "starter";
  const questions = useMemo(
    () => buildPictureRounds(themeId, progress.masteredThemes, level, ROUNDS),
    [themeId, progress.masteredThemes, level],
  );
  if (!child || !content) return null;

  const choiceCount = level === "starter" ? 2 : level === "mover" ? 3 : 4;

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
