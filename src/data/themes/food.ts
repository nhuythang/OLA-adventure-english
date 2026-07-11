// Food theme vocabulary (task: fill islands; deepened post-G4 — more words so
// round targets, now randomly rotated across the pool (review.ts), actually
// get taught over time rather than sitting inert as distractors). Same shape
// as animals.ts. All words are Cambridge YLE headwords; the Starter core is
// YLE Starters. `vi` is for the parent/teacher surfaces, never shown on child
// screens.
//
// Sourced from the official Food & drink topic table (2025 wordlist PDF).
// Deliberately excluded:
//  - Multi-word headwords (ice cream): our vocab items are single tokens (the
//    Write hut traces/spells them letter by letter); a mid-word space needs
//    engine changes to handle, not a content-only addition.
//  - Verbs/adjectives/abstract category words (eat, drink, food, hungry,
//    thirsty, fruit, meal): don't fit the "one emoji = one picturable noun"
//    model this theme (and the huts) assume.
//  - YLE Flyers-level words (biscuit, butter, cereal, cookie, honey, jam,
//    pizza, salt, strawberry, sugar, yoghurt, etc.) — same reasoning as
//    animals.ts: our pool is currently a single starter/mover-plus-flyer
//    binary, so teaching these would read as below their real YLE level.
//    Needs a real 3-tier pool to add properly.
import type { Level } from "@/lib/types";
import type { VocabWord } from "./weather";

// Full set. Order matters: huts take the first N as round targets when a
// round isn't randomly rotated (SSR pass / tests without an rng).
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
  // ---- New (deepen-the-pool pass) — YLE Starters ----
  { word: "burger", emoji: "🍔", vi: "bánh burger" },
  { word: "carrot", emoji: "🥕", vi: "cà rốt" },
  { word: "chocolate", emoji: "🍫", vi: "sô cô la" },
  { word: "fries", emoji: "🍟", vi: "khoai tây chiên" },
  { word: "grape", emoji: "🍇", vi: "nho" },
  { word: "lemon", emoji: "🍋", vi: "chanh" },
  { word: "onion", emoji: "🧅", vi: "hành tây" },
  { word: "pineapple", emoji: "🍍", vi: "dứa" },
  { word: "potato", emoji: "🥔", vi: "khoai tây" },
  { word: "tomato", emoji: "🍅", vi: "cà chua" },
  { word: "watermelon", emoji: "🍉", vi: "dưa hấu" },
  // ---- New (deepen-the-pool pass) — YLE Movers ----
  { word: "cheese", emoji: "🧀", vi: "phô mai" },
  { word: "pasta", emoji: "🍝", vi: "mì Ý" },
  { word: "salad", emoji: "🥗", vi: "rau trộn" },
  { word: "sandwich", emoji: "🥪", vi: "bánh sandwich" },
];

// Starter core — everyday foods + the new YLE-Starters additions (kept first
// in the list; the 4 new Movers words join only the full pool).
const STARTER_WORDS = [
  "apple",
  "banana",
  "bread",
  "cake",
  "egg",
  "milk",
  "burger",
  "carrot",
  "chocolate",
  "fries",
  "grape",
  "lemon",
  "onion",
  "pineapple",
  "potato",
  "tomato",
  "watermelon",
] as const;

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
