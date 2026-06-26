// Weather theme vocabulary. `vi` is for the parent/teacher surfaces, never shown
// on child screens. Per-level pools keep Starter on a small concrete core while
// Mover/Flyer see the full set (Flyer sentence content lands in task 20).
import type { Level } from "@/lib/types";

export interface VocabWord {
  word: string;
  emoji: string;
  vi: string;
}

// Full set (9 words). Order matters: huts take the first N as round targets.
export const WEATHER_WORDS: VocabWord[] = [
  { word: "sunny", emoji: "☀️", vi: "nắng" },
  { word: "rainy", emoji: "🌧️", vi: "mưa" },
  { word: "cloudy", emoji: "☁️", vi: "nhiều mây" },
  { word: "windy", emoji: "🌬️", vi: "gió" },
  { word: "hot", emoji: "🥵", vi: "nóng" },
  { word: "cold", emoji: "🥶", vi: "lạnh" },
  { word: "snowy", emoji: "❄️", vi: "tuyết" },
  { word: "stormy", emoji: "⛈️", vi: "bão" },
  { word: "foggy", emoji: "🌫️", vi: "sương mù" },
];

// Starter core — the 6 most concrete, everyday words (kept first in the list).
const STARTER_WORDS = ["sunny", "rainy", "cloudy", "windy", "hot", "cold"] as const;

// Words to teach at a given level: Starter sees the core; Mover/Flyer the full set.
export function weatherWordsForLevel(level: Level): VocabWord[] {
  if (level === "starter") {
    return WEATHER_WORDS.filter((w) => STARTER_WORDS.includes(w.word as (typeof STARTER_WORDS)[number]));
  }
  return WEATHER_WORDS;
}

// ---- Flyer (L3) sentence content (task 20) ----
// Derived from the words via a simple template so there's no second wordlist to
// keep in sync. Flyer mechanics move from single words to short sentences:
// listen/read a sentence → pick the scene; build the sentence from tiles; answer
// a spoken question in a phrase.

/** Spoken/printed sentence for the listen + read scene-matching rounds. */
export function weatherSentence(word: string): string {
  return `It is ${word} today.`;
}

/** Target word tiles for the Write hut ("It" pre-filled as the hint). */
export function weatherSentenceWords(word: string): string[] {
  return ["It", "is", word];
}

/** The spoken question the child answers in the Speak hut. */
export const WEATHER_SPEAK_QUESTION = "How is the weather today?";
