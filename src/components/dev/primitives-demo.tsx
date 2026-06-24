"use client";

import { useEffect, useState } from "react";
import { AudioButton } from "@/components/ui/audio-button";
import { Button } from "@/components/ui/button";
import { ChoiceCard, type ChoiceState } from "@/components/ui/choice-card";
import { ProgressDots } from "@/components/ui/progress-dots";
import { StickerBadge } from "@/components/ui/sticker-badge";
import { buildChoices } from "@/lib/engine/choices";
import { BOY_STICKERS, GIRL_STICKERS } from "@/data/stickers/sticker-bank";

// Task-05 showcase. Not a real screen — the sticker book, island, and huts
// (tasks 06–12) are the real consumers. This exists to verify the primitives
// render and behave (random answer position + scaffold-style dim on a miss).

const EMOJI: Record<string, string> = {
  sunny: "☀️",
  rainy: "🌧️",
  windy: "🌬️",
};
const CORRECT = "sunny";

export function PrimitivesDemo() {
  // Shuffle on the CLIENT after mount, never during SSR — Math.random in render
  // would make server/client HTML differ and break hydration. The server emits a
  // stable order; the client shuffles once on mount and keeps it stable across
  // retries (engine rule 8). The real huts build choices in client state too.
  const [options, setOptions] = useState<string[]>(["sunny", "rainy", "windy"]);
  useEffect(() => {
    setOptions(buildChoices(CORRECT, ["rainy", "windy"], 3));
  }, []);
  const [states, setStates] = useState<Record<string, ChoiceState>>({});

  function onSelect(id: string) {
    setStates((prev) => {
      if (id === CORRECT) return { ...prev, [id]: "correct" };
      // 1st-miss scaffold: dim the wrong choice that was tapped.
      return { ...prev, [id]: "dimmed" };
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3">
        <ProgressDots total={3} current={1} />
        <AudioButton text="Tap the sunny one" autoPlay={false} label="Hear the question" />
      </section>

      <section className="grid grid-cols-3 gap-3">
        {options.map((word) => (
          <ChoiceCard
            key={word}
            id={word}
            label={word}
            visual={EMOJI[word]}
            state={states[word] ?? "idle"}
            onSelect={onSelect}
          />
        ))}
      </section>

      <section className="flex items-end justify-center gap-5">
        <StickerBadge sticker={BOY_STICKERS[0]!} tilt={-6} />
        <StickerBadge sticker={GIRL_STICKERS[0]!} tilt={5} />
        <StickerBadge sticker={GIRL_STICKERS[12]!} earned={false} />
      </section>

      <section className="flex justify-center gap-3">
        <Button variant="secondary">Back</Button>
        <Button variant="primary">Play</Button>
      </section>
    </div>
  );
}
