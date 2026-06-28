"use client";

import { useMemo } from "react";
import { HutPlayer } from "@/components/huts/hut-player";
import { childById } from "@/data/children";
import { grammarRoundItems } from "@/data/grammar";
import { buildGrammarQuestions } from "@/lib/engine/grammar-questions";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";

const ROUNDS = 5;

// Grammar Listen: hear the prompt ("three cats" / "She is running.") → tap the
// matching picture. Choices are grammatical contrasts of the same referent
// (counts; actions under the same sentence frame). Labels hidden — audio +
// picture carry it. Choice count rises with level (2 → 3 → 4), like the vocab huts.
export function GrammarListenHut({ childId, themeId }: { childId: string; themeId: string }) {
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const level = child ? effectiveLevel(child, progress, "listen") : "starter";
  const questions = useMemo(() => buildGrammarQuestions(grammarRoundItems(ROUNDS)), []);
  if (!child) return null;

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
