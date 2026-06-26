"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { assembled, buildWordTiles, isSentenceComplete, isSentenceCorrect, type WordTile } from "@/lib/engine/sentence";

// Deterministic shuffle for the initial tile order — same on server and client
// (no hydration mismatch). A new round remounts via `key`, so this re-runs.
const FIXED_RNG = () => 0.42;

interface Props {
  /** Target sentence as words; the first is pre-filled as a hint. */
  words: string[];
  emoji: string;
  /** Called when the sentence is built correctly; `misses` = wrong full attempts. */
  onComplete: (misses: number) => void;
}

// Build a sentence (Write hut L3): tap a word tile to drop it in the next slot;
// tap a filled slot to take it back. The first word is pre-filled as a hint. No
// hard fail — a wrong full sentence gently shakes and clears for another try.
export function SentenceTiles({ words, emoji, onComplete }: Props) {
  const [pool, setPool] = useState<WordTile[]>(() => buildWordTiles(words, FIXED_RNG));
  const [slots, setSlots] = useState<(WordTile | null)[]>(() =>
    words.map((w, i) => (i === 0 ? { id: "hint", word: w } : null)),
  );
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState(false);

  function place(tile: WordTile) {
    const slotIndex = slots.findIndex((s, i) => i > 0 && s === null);
    if (slotIndex === -1) return;
    const nextSlots = slots.slice();
    nextSlots[slotIndex] = tile;
    setPool((p) => p.filter((t) => t.id !== tile.id));
    setSlots(nextSlots);

    const placed = nextSlots.map((s) => s?.word ?? null);
    if (isSentenceComplete(placed)) {
      if (isSentenceCorrect(placed, words)) {
        onComplete(misses);
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          const returned = nextSlots.slice(1).filter((t): t is WordTile => t !== null);
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

      <div className={cn("flex flex-wrap justify-center gap-2", shake && "animate-shake")} aria-label={assembled(slots.map((s) => s?.word ?? "_"))}>
        {slots.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => unplace(i)}
            aria-label={s ? `Word ${s.word}` : "Empty slot"}
            className={cn(
              "flex h-14 min-w-[64px] items-center justify-center rounded-2xl border-4 px-3 font-display text-2xl font-semibold",
              i === 0 ? "border-border-soft bg-cream text-ink-muted" : "border-border-soft bg-card text-ink",
            )}
          >
            {s?.word ?? ""}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            data-tile-word={tile.word}
            onClick={() => place(tile)}
            aria-label={`Tile ${tile.word}`}
            className="flex h-14 min-w-[64px] items-center justify-center rounded-2xl px-3 font-display text-2xl font-semibold text-ink bg-card shadow-[0_4px_0_#E7DFD2] transition-transform duration-100 active:translate-y-[2px] active:shadow-[0_2px_0_#E7DFD2] motion-reduce:transition-none"
          >
            {tile.word}
          </button>
        ))}
      </div>
    </div>
  );
}
