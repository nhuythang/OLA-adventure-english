"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Star } from "lucide-react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { Button } from "@/components/ui/button";
import { HutResult } from "@/components/huts/hut-result";
import { HutLoading } from "@/components/huts/hut-loading";
import { childById } from "@/data/children";
import { themeContent } from "@/data/themes/content";
import { playCorrect } from "@/lib/sounds";
import { meetsMastery } from "@/lib/engine/scoring";
import { shuffle } from "@/lib/engine/choices";
import { useClientReady } from "@/lib/engine/use-client-ready";
import { isAsrAvailable, listenOnce, looseMatch } from "@/lib/asr";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel } from "@/lib/storage";
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
  const progress = useChildProgress(childId);
  const ready = useClientReady();
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);
  const [listening, setListening] = useState(false);
  const [missed, setMissed] = useState(false);
  const content = themeContent(themeId);
  const level = child ? effectiveLevel(child, progress, "speak") : "starter";
  const words = useMemo(
    () => (ready && content ? shuffle(content.wordsForLevel(level), Math.random).slice(0, ROUNDS) : []),
    [ready, content, level],
  );
  if (!child || !content) return null;

  const isFlyer = level === "flyer";
  if (!ready) return <HutLoading childId={childId} themeId={themeId} />;
  const word = words[index]!;
  // Flyer answers a spoken QUESTION in a phrase ("It is sunny"); L1/L2 repeat the
  // word. ASR loose-matches the target word either way (the phrase contains it).
  const promptText = isFlyer ? content.speakQuestion : word.word;
  // ASR only for Mover+ AND where the browser supports it (rarely on iPad).
  const useAsr = level !== "starter" && isAsrAvailable();

  function finish(firstTry: boolean) {
    playCorrect();
    setAttempts((prev) => [
      ...prev,
      { skill: "speak", themeId, firstTryCorrect: firstTry, hintsUsed: firstTry ? 0 : 1, itemId: word.word },
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
        right={<ProgressDots total={words.length} current={index} />}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <span className="text-7xl" aria-hidden>
          {word.emoji}
        </span>
        {isFlyer ? (
          // The scene is the only cue — the child names the weather in a phrase,
          // so the answer word is intentionally not shown.
          <span className="max-w-[20ch] text-center font-display text-2xl font-semibold text-ink">
            {content.speakQuestion}
          </span>
        ) : (
          <span className="font-display text-4xl font-semibold lowercase text-ink">{word.word}</span>
        )}
        <AudioButton key={index} text={promptText} label="Hear it again" />
        <p className="font-display text-lg font-semibold text-ink-muted">
          {isFlyer ? "Answer in a sentence!" : "Now you say it!"}
        </p>

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
