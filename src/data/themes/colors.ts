// Colours theme vocabulary (task: fill islands). The "picture" for each colour
// is a coloured square emoji, so the tap-the-picture huts work without art. All
// words are Cambridge YLE Starters. `vi` is for the parent/teacher surfaces only.
import type { Level } from "@/lib/types";
import type { VocabWord } from "./weather";

// Full set (9). Order matters: huts take the first N as round targets.
export const COLOR_WORDS: VocabWord[] = [
  { word: "red", emoji: "🟥", vi: "đỏ" },
  { word: "blue", emoji: "🟦", vi: "xanh dương" },
  { word: "green", emoji: "🟩", vi: "xanh lá" },
  { word: "yellow", emoji: "🟨", vi: "vàng" },
  { word: "black", emoji: "⬛", vi: "đen" },
  { word: "white", emoji: "⬜", vi: "trắng" },
  { word: "orange", emoji: "🟧", vi: "cam" },
  { word: "purple", emoji: "🟪", vi: "tím" },
  { word: "brown", emoji: "🟫", vi: "nâu" },
];

// Starter core — 6 primary colours (kept first in the list).
const STARTER_WORDS = ["red", "blue", "green", "yellow", "black", "white"] as const;

export function colorsWordsForLevel(level: Level): VocabWord[] {
  if (level === "starter") {
    return COLOR_WORDS.filter((w) => STARTER_WORDS.includes(w.word as (typeof STARTER_WORDS)[number]));
  }
  return COLOR_WORDS;
}

// ---- Flyer (L3) sentence content ----
export function colorsSentence(word: string): string {
  return `It is ${word}.`;
}

export function colorsSentenceWords(word: string): string[] {
  return ["It", "is", word];
}

export const COLORS_SPEAK_QUESTION = "What colour is it?";
