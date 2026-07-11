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

// Listen mechanic: hear a prompt → tap the matching picture. Labels are hidden
// (a reader would otherwise just match text), so pictures + audio carry it.
// - Starter (L1): hear a word, 2 choices.   - Mover (L2): hear a word, 3 choices.
// - Flyer  (L3): hear a SENTENCE, tap the scene, 4 choices.
// Rounds interleave ~30% review items from mastered themes (active recall).
// Round targets are picked randomly from the theme's word pool (client-only,
// useClientReady) rather than always the pool's first N — otherwise a pool
// bigger than ROUNDS would only ever surface as distractors, never taught.
export function ListenHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const content = themeContent(themeId);
  const level = child ? effectiveLevel(child, progress, "listen") : "starter";
  const ready = useClientReady();
  const questions = useMemo(
    () => (ready ? buildPictureRounds(themeId, progress.masteredThemes, level, ROUNDS, Math.random) : []),
    [ready, themeId, progress.masteredThemes, level],
  );
  if (!child || !content) return null;
  if (!ready) return <HutLoading childId={childId} themeId={themeId} />;

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
