// Theme content registry — maps a themeId to its per-level word pool and the
// Flyer (L3) sentence/question templates. Lets the huts and the seed generator
// work for ANY theme instead of hardcoding Weather. Themes without content yet
// (food, colors) are simply absent; their islands stay locked.
import type { Level } from "@/lib/types";
import type { VocabWord } from "./weather";
import { WEATHER_SPEAK_QUESTION, weatherSentence, weatherSentenceWords, weatherWordsForLevel } from "./weather";
import { ANIMALS_SPEAK_QUESTION, animalsSentence, animalsSentenceWords, animalsWordsForLevel } from "./animals";
import { FOOD_SPEAK_QUESTION, foodSentence, foodSentenceWords, foodWordsForLevel } from "./food";
import { COLORS_SPEAK_QUESTION, colorsSentence, colorsSentenceWords, colorsWordsForLevel } from "./colors";

export interface ThemeContent {
  wordsForLevel: (level: Level) => VocabWord[];
  /** Flyer listen/read prompt, e.g. "It is sunny today." */
  sentence: (word: string) => string;
  /** Flyer write tiles (first word pre-filled as the hint). */
  sentenceWords: (word: string) => string[];
  /** Scaffold reveal narration, e.g. "It is sunny." / "It is a lion." */
  reveal: (word: string) => string;
  /** Flyer speak question, e.g. "How is the weather today?" */
  speakQuestion: string;
}

const REGISTRY: Record<string, ThemeContent> = {
  weather: {
    wordsForLevel: weatherWordsForLevel,
    sentence: weatherSentence,
    sentenceWords: weatherSentenceWords,
    reveal: (w) => `It is ${w}.`,
    speakQuestion: WEATHER_SPEAK_QUESTION,
  },
  animals: {
    wordsForLevel: animalsWordsForLevel,
    sentence: animalsSentence,
    sentenceWords: animalsSentenceWords,
    reveal: (w) => `It is a ${w}.`,
    speakQuestion: ANIMALS_SPEAK_QUESTION,
  },
  food: {
    wordsForLevel: foodWordsForLevel,
    sentence: foodSentence,
    sentenceWords: foodSentenceWords,
    reveal: (w) => `I like ${w}.`,
    speakQuestion: FOOD_SPEAK_QUESTION,
  },
  colors: {
    wordsForLevel: colorsWordsForLevel,
    sentence: colorsSentence,
    sentenceWords: colorsSentenceWords,
    reveal: (w) => `It is ${w}.`,
    speakQuestion: COLORS_SPEAK_QUESTION,
  },
};

export function themeContent(themeId: string): ThemeContent | undefined {
  return REGISTRY[themeId];
}

/** Theme ids that have playable content (used to seed items + gate review). */
export function contentThemeIds(): string[] {
  return Object.keys(REGISTRY);
}
