// Animals theme vocabulary (second island, task 21; deepened post-G4 — more
// words so round targets, now randomly rotated across the pool (review.ts),
// actually get taught over time rather than sitting inert as distractors).
// Words are deliberately all consonant-initial so the Flyer sentence template
// "It is a ___." stays grammatical (no a/an handling needed). `vi` is for the
// parent/teacher surfaces, never shown on child screens.
//
// Deliberately excluded from this expansion (left for a future pass):
//  - kitten/puppy: same referent-species as cat/dog, a picture alone can't
//    distinguish "young dog" from "dog" for a pre-reader (rule: every choice's
//    picture must be unambiguous).
//  - donkey/jellyfish: real YLE Starters headwords, but their emoji (🫏 🪼) are
//    recent Unicode additions — skipped until verified on the real iPad.
//  - beetle/butterfly/camel/dinosaur/eagle/insect/octopus/swan/tortoise: YLE
//    Flyers-level. Our Mover/Flyer pool is currently a single "mover" tier (see
//    animalsWordsForLevel), so teaching these would read as below their YLE
//    level. Needs a real 3-tier pool (mover ⊂ flyer) to add properly.
// Still available if you want to go deeper: bee, crocodile, goat, hippo,
// lizard, mouse (Starters) plus parrot, rabbit, shark, snail (Movers).
import type { Level } from "@/lib/types";
import type { VocabWord } from "./weather";

// Full set. Order matters: huts take the first N as round targets when a
// round isn't randomly rotated (SSR pass / tests without an rng).
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
  // "horse" not "pig": pig isn't a Cambridge YLE headword; horse is (Starters).
  { word: "horse", emoji: "🐴", vi: "ngựa" },
  // ---- New (deepen-the-pool pass) — YLE Starters ----
  { word: "chicken", emoji: "🐔", vi: "gà" },
  { word: "cow", emoji: "🐮", vi: "bò" },
  { word: "elephant", emoji: "🐘", vi: "voi" },
  { word: "giraffe", emoji: "🦒", vi: "hươu cao cổ" },
  { word: "sheep", emoji: "🐑", vi: "cừu" },
  { word: "zebra", emoji: "🦓", vi: "ngựa vằn" },
  { word: "snake", emoji: "🐍", vi: "rắn" },
  { word: "spider", emoji: "🕷️", vi: "nhện" },
  // ---- New (deepen-the-pool pass) — YLE Movers ----
  { word: "dolphin", emoji: "🐬", vi: "cá heo" },
  { word: "kangaroo", emoji: "🦘", vi: "chuột túi" },
  { word: "panda", emoji: "🐼", vi: "gấu trúc" },
  { word: "penguin", emoji: "🐧", vi: "chim cánh cụt" },
  { word: "whale", emoji: "🐳", vi: "cá voi" },
];

// Starter core — everyday pets/farm animals + the new YLE-Starters additions
// (kept first in the list; the 5 new Movers words join only the full pool).
const STARTER_WORDS = [
  "cat",
  "dog",
  "bird",
  "fish",
  "frog",
  "duck",
  "chicken",
  "cow",
  "elephant",
  "giraffe",
  "sheep",
  "zebra",
  "snake",
  "spider",
] as const;

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
