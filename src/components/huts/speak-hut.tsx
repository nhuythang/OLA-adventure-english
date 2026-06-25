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
import { childById } from "@/data/children";
import { WEATHER_WORDS } from "@/data/themes/weather";
import { playCorrect } from "@/lib/sounds";
import { meetsMastery } from "@/lib/engine/scoring";
import { isAsrAvailable, listenOnce, looseMatch } from "@/lib/asr";
import type { Attempt } from "@/lib/types";

const ROUNDS = 4;
const ADVANCE_MS = 800;

// Self-rate: the child taps a star to say how it sounded. No objective check —
// this is the no-mic, no-pressure path (L1, and the fallback whenever ASR is
// unavailable). Any tap completes the round.
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

// Speak mechanic. Hear the model word, repeat it, then either self-rate (L1 /
// no-ASR fallback) or let best-effort ASR check it with an always-present
// "I said it" override (L2). Nothing is recorded or transmitted.
export function SpeakHut({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);
  const [listening, setListening] = useState(false);
  const [missed, setMissed] = useState(false);
  if (!child) return null;

  const words = WEATHER_WORDS.slice(0, ROUNDS);
  const word = words[index]!;
  // ASR only for Mover+ AND where the browser supports it (rarely on iPad).
  const useAsr = child.skillLevels.speak !== "starter" && isAsrAvailable();

  function finish(firstTry: boolean) {
    playCorrect();
    setAttempts((prev) => [
      ...prev,
      { skill: "speak", themeId, firstTryCorrect: firstTry, hintsUsed: firstTry ? 0 : 1 },
    ]);
    setMissed(false);
    setTimeout(() => {
      if (index + 1 >= words.length) setDone(true);
      else setIndex((i) => i + 1);
    }, ADVANCE_MS);
  }

  async function handleMic() {
    setListening(true);
    const heard = await listenOnce();
    setListening(false);
    if (heard && looseMatch(heard, word.word)) finish(true);
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
        mastered={meetsMastery(attempts)}
        hutLabel="Speak"
        onPlayAgain={restart}
      />
    );
  }

  return (
    <TabletShell>
      <ScreenHeader
        onBack={() => router.push(`/child/${childId}/island/${themeId}`)}
        right={<ProgressDots total={words.length} current={index} />}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <span className="text-7xl" aria-hidden>
          {word.emoji}
        </span>
        <span className="font-display text-4xl font-semibold lowercase text-ink">{word.word}</span>
        <AudioButton key={index} text={word.word} label="Hear it again" />
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
              {listening ? "Listening…" : missed ? "Try again, or tap “I said it”." : "Tap and say the word"}
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
