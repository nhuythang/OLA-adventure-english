"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Star } from "lucide-react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { Button } from "@/components/ui/button";
import { HutResult } from "@/components/huts/hut-result";
import { PromptVisual } from "@/components/huts/grammar-scene";
import { childById } from "@/data/children";
import { grammarRoundItems } from "@/data/grammar";
import { playCorrect } from "@/lib/sounds";
import { meetsMastery } from "@/lib/engine/scoring";
import { isAsrAvailable, listenOnce, looseMatch } from "@/lib/asr";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";
import type { Attempt } from "@/lib/types";

const ROUNDS = 4;

// No-mic, no-pressure self-rate path (L1, and the fallback whenever ASR is
// unavailable — the primary path on iPad). Any tap completes the round.
function SelfRate({ onRate }: { onRate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-ink-muted">How did it sound?</p>
      <div className="flex gap-3">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            data-testid="self-rate-star"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            onClick={onRate}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-gold shadow-[0_4px_0_#E7DFD2] transition-transform duration-100 active:translate-y-[2px] active:shadow-[0_2px_0_#E7DFD2] motion-reduce:transition-none"
          >
            <Star size={34} fill="currentColor" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}

// Grammar Speak: hear the model phrase ("She is running." / "three cats"), say
// it, then self-rate (L1 / no-ASR) or let best-effort ASR loose-match the key
// grammatical form (the -ing verb / the plural). Always an "I said it" override.
// Nothing is recorded or transmitted.
export function GrammarSpeakHut({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);
  const [listening, setListening] = useState(false);
  const [missed, setMissed] = useState(false);
  if (!child) return null;

  const level = effectiveLevel(child, progress, "speak");
  const items = grammarRoundItems(ROUNDS);
  const item = items[index]!;
  const useAsr = level !== "starter" && isAsrAvailable();

  function finish(firstTry: boolean) {
    playCorrect();
    setAttempts((prev) => [
      ...prev,
      { skill: "speak", themeId, firstTryCorrect: firstTry, hintsUsed: firstTry ? 0 : 1 },
    ]);
    setMissed(false);
    setTimeout(() => {
      if (index + 1 >= items.length) setDone(true);
      else setIndex((i) => i + 1);
    }, 800);
  }

  async function handleMic() {
    setListening(true);
    const heard = await listenOnce();
    setListening(false);
    if (heard && looseMatch(heard, item.speakTarget)) finish(true);
    else setMissed(true);
  }

  function restart() {
    setIndex(0);
    setAttempts([]);
    setDone(false);
    setMissed(false);
  }

  if (done) {
    return (
      <HutResult
        childId={childId}
        themeId={themeId}
        skill="speak"
        mastered={meetsMastery(attempts)}
        attempts={attempts}
        onPlayAgain={restart}
      />
    );
  }

  return (
    <TabletShell>
      <ScreenHeader
        onBack={() => router.push(`/child/${childId}/island/${themeId}`)}
        right={<ProgressDots total={items.length} current={index} />}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <PromptVisual visual={item.correct.emoji} />
        <span className="max-w-[20ch] text-center font-display text-2xl font-semibold text-ink">
          {item.prompt}
        </span>
        <AudioButton key={index} text={item.prompt} label="Hear it again" />
        <p className="font-display text-lg font-semibold text-ink-muted">Now you say it!</p>

        {useAsr ? (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              aria-label="Tap to speak"
              disabled={listening}
              onClick={() => void handleMic()}
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-teal-dark text-white shadow-[0_5px_0_#176B62] transition-transform duration-100 active:translate-y-[2px] active:shadow-[0_3px_0_#176B62] disabled:opacity-60 motion-reduce:transition-none"
            >
              <Mic size={40} aria-hidden />
            </button>
            <p className="text-sm font-semibold text-ink-muted">
              {listening ? "Listening…" : missed ? "Try again, or tap “I said it”." : "Tap and say it"}
            </p>
            <Button variant="secondary" onClick={() => finish(!missed)}>
              I said it
            </Button>
          </div>
        ) : (
          <SelfRate onRate={() => finish(true)} />
        )}
      </div>
    </TabletShell>
  );
}
