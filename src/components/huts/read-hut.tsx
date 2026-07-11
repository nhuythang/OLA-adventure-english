"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { HutLoading } from "@/components/huts/hut-loading";
import { childById } from "@/data/children";
import { themeContent } from "@/data/themes/content";
import { buildPictureRounds } from "@/lib/review";
import { useChildProgress } from "@/lib/use-child-progress";
import { useClientReady } from "@/lib/engine/use-client-ready";
import { effectiveLevel } from "@/lib/storage";

const ROUNDS = 5;

// Read mechanic: read the printed prompt → tap the matching picture.
// - Starter (L1): read a word, audio support on, 2 choices.
// - Mover  (L2): read a word independently, NO audio, 3 choices.
// - Flyer  (L3): read a SENTENCE, tap the scene, NO audio, 4 choices.
// Labels on the picture choices stay hidden so the prompt must actually be read.
// Rounds interleave ~30% review items from mastered themes (active recall).
// Round targets are picked randomly from the pool (see listen-hut.tsx).
export function ReadHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const content = themeContent(themeId);
  const level = child ? effectiveLevel(child, progress, "read") : "starter";
  const isFlyer = level === "flyer";
  const ready = useClientReady();
  const questions = useMemo(
    () => (ready ? buildPictureRounds(themeId, progress.masteredThemes, level, ROUNDS, Math.random) : []),
    [ready, themeId, progress.masteredThemes, level],
  );
  if (!child || !content) return null;
  if (!ready) return <HutLoading childId={childId} themeId={themeId} />;

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
