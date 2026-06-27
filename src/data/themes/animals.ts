// Animals theme vocabulary (second island, task 21). Same shape as weather.ts.
// Words are deliberately all consonant-initial so the Flyer sentence template
// "It is a ___." stays grammatical (no a/an handling needed). `vi` is for the
// parent/teacher surfaces, never shown on child screens.
import type { Level } from "@/lib/types";
import type { VocabWord } from "./weather";

// Full set (11 words). Order matters: huts take the first N as round targets.
export const ANIMALS_WORDS: VocabWord[] = [
  { word: "cat", emoji: "🐱", vi: "mèo" },
  { word: "dog", emoji: "🐶", vi: "chó" },
  { word: "bird", emoji: "🐦", vi: "chim" },
  { word: "fish", emoji: "🐟", vi: "cá" },
  { word: "frog", emoji: "🐸", vi: "ếch" },
  { word: "duck", emoji: "🦆", vi: "vịt" },
  { word: "lion", emoji: "🦁", vi: "sư tử" },
  { word: "tiger", emoji: "🐯", vi: "hổ" },
  { word: "monkey", emoji: "🐵", vi: "khỉ" },
  { word: "bear", emoji: "🐻", vi: "gấu" },
  { word: "pig", emoji: "🐷", vi: "lợn" },
];

// Starter core — 6 everyday pets/farm animals (kept first in the list).
const STARTER_WORDS = ["cat", "dog", "bird", "fish", "frog", "duck"] as const;

export function animalsWordsForLevel(level: Level): VocabWord[] {
  if (level === "starter") {
    return ANIMALS_WORDS.filter((w) => STARTER_WORDS.includes(w.word as (typeof STARTER_WORDS)[number]));
  }
  return ANIMALS_WORDS;
}

// ---- Flyer (L3) sentence content ----
export function animalsSentence(word: string): string {
  return `It is a ${word}.`;
}

export function animalsSentenceWords(word: string): string[] {
  return ["It", "is", "a", word];
}

export const ANIMALS_SPEAK_QUESTION = "What animal is it?";
