// Food theme vocabulary (task: fill islands). Same shape as animals.ts. All
// words are Cambridge YLE headwords; the Starter core is YLE Starters. `vi` is
// for the parent/teacher surfaces, never shown on child screens.
import type { Level } from "@/lib/types";
import type { VocabWord } from "./weather";

// Full set (9). Order matters: huts take the first N as round targets.
export const FOOD_WORDS: VocabWord[] = [
  { word: "apple", emoji: "🍎", vi: "táo" },
  { word: "banana", emoji: "🍌", vi: "chuối" },
  { word: "bread", emoji: "🍞", vi: "bánh mì" },
  { word: "cake", emoji: "🍰", vi: "bánh ngọt" },
  { word: "egg", emoji: "🥚", vi: "trứng" },
  { word: "milk", emoji: "🥛", vi: "sữa" },
  { word: "rice", emoji: "🍚", vi: "cơm" },
  { word: "juice", emoji: "🧃", vi: "nước ép" },
  { word: "soup", emoji: "🍲", vi: "súp" },
];

// Starter core — 6 everyday foods (kept first in the list).
const STARTER_WORDS = ["apple", "banana", "bread", "cake", "egg", "milk"] as const;

export function foodWordsForLevel(level: Level): VocabWord[] {
  if (level === "starter") {
    return FOOD_WORDS.filter((w) => STARTER_WORDS.includes(w.word as (typeof STARTER_WORDS)[number]));
  }
  return FOOD_WORDS;
}

// ---- Flyer (L3) sentence content ----
export function foodSentence(word: string): string {
  return `I like ${word}.`;
}

export function foodSentenceWords(word: string): string[] {
  return ["I", "like", word];
}

export const FOOD_SPEAK_QUESTION = "What food do you like?";
