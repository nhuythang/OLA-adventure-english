"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { buildTiles, isComplete, isCorrect, type Tile } from "@/lib/engine/spelling";

// Deterministic shuffle for the initial tile order — same on server and client
// (no hydration mismatch). A new round remounts via `key`, so this re-runs.
const FIXED_RNG = () => 0.42;

interface Props {
  word: string;
  emoji: string;
  /** Called when the word is spelled correctly; `misses` = wrong full attempts. */
  onComplete: (misses: number) => void;
}

// Tap a letter tile to drop it in the next slot; tap a filled slot to take it
// back. The first slot is pre-filled as a hint. No hard fail — a wrong full word
// gently shakes and clears for another try.
export function LetterTiles({ word, emoji, onComplete }: Props) {
  const [pool, setPool] = useState<Tile[]>(() => buildTiles(word, 2, FIXED_RNG));
  const [slots, setSlots] = useState<(Tile | null)[]>(() =>
    Array.from({ length: word.length }, (_, i) => (i === 0 ? { id: "hint", letter: word[0] ?? "" } : null)),
  );
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState(false);

  function place(tile: Tile) {
    const slotIndex = slots.findIndex((s, i) => i > 0 && s === null);
    if (slotIndex === -1) return;
    const nextSlots = slots.slice();
    nextSlots[slotIndex] = tile;
    setPool((p) => p.filter((t) => t.id !== tile.id));
    setSlots(nextSlots);

    const letters = nextSlots.map((s) => s?.letter ?? null);
    if (isComplete(letters)) {
      if (isCorrect(letters, word)) {
        onComplete(misses);
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          // Return non-hint tiles to the pool for another try.
          const returned = nextSlots.slice(1).filter((t): t is Tile => t !== null);
          setPool((p) => [...p, ...returned]);
          setSlots(nextSlots.map((s, i) => (i === 0 ? s : null)));
          setMisses((m) => m + 1);
        }, 500);
      }
    }
  }

  function unplace(slotIndex: number) {
    const tile = slots[slotIndex];
    if (slotIndex === 0 || !tile) return;
    setSlots(slots.map((s, i) => (i === slotIndex ? null : s)));
    setPool((p) => [...p, tile]);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <span className="text-7xl" aria-hidden>
        {emoji}
      </span>

      <div className={cn("flex gap-2", shake && "animate-shake")}>
        {slots.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => unplace(i)}
            aria-label={s ? `Letter ${s.letter}` : "Empty slot"}
            className={cn(
              "flex h-16 w-14 items-center justify-center rounded-2xl border-4 font-display text-3xl font-semibold",
              i === 0 ? "border-border-soft bg-cream text-ink-muted" : "border-border-soft bg-card text-ink",
            )}
          >
            {s?.letter ?? ""}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            data-tile-letter={tile.letter}
            onClick={() => place(tile)}
            aria-label={`Tile ${tile.letter}`}
            className="flex h-16 w-14 items-center justify-center rounded-2xl bg-card font-display text-3xl font-semibold text-ink shadow-[0_4px_0_#E7DFD2] transition-transform duration-100 active:translate-y-[2px] active:shadow-[0_2px_0_#E7DFD2] motion-reduce:transition-none"
          >
            {tile.letter}
          </button>
        ))}
      </div>
    </div>
  );
}
