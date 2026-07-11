"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HutPlayer } from "@/components/huts/hut-player";
import { ObserveIntro } from "@/components/huts/observe-intro";
import { childById } from "@/data/children";
import { GRAMMAR_OBSERVE_FRAMES, grammarRoundItems } from "@/data/grammar";
import { buildGrammarQuestions } from "@/lib/engine/grammar-questions";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";

const ROUNDS = 5;

// Grammar Read: read the printed prompt → tap the matching picture. Starter keeps
// audio support on; Mover+ read silently. Prompts are short phrases/sentences, so
// they render in sentence style (normal case). Labels hidden so the prompt must
// actually be read.
export function GrammarReadHut({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const [showObserve, setShowObserve] = useState(true);
  const level = child ? effectiveLevel(child, progress, "read") : "starter";
  const questions = useMemo(() => buildGrammarQuestions(grammarRoundItems(ROUNDS)), []);
  if (!child) return null;

  if (showObserve) {
    return (
      <ObserveIntro
        frames={GRAMMAR_OBSERVE_FRAMES}
        onBack={() => router.push(`/child/${childId}/island/${themeId}`)}
        onDone={() => setShowObserve(false)}
      />
    );
  }

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
      sentencePrompt
    />
  );
}
