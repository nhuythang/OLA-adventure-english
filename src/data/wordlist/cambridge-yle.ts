// Cambridge YLE wordlist — the curriculum source of truth (task 25).
//
// Levels are taken from the official "Pre A1 Starters, A1 Movers and A2 Flyers
// Wordlists" (Cambridge English, 2025 edition), by which level's A–Z list a word
// first appears in. Source PDF:
//   https://www.cambridgeenglish.org/Images/739104-starters-movers-flyers-word-list-2025.pdf
//
// Scope: Animals, Weather, Food & drink, and Colours topic vocabulary (the
// themes we ship + their near neighbours). Extend per topic as new themes
// land. NOTE: this is a word-level list — homographs aren't disambiguated
// (e.g. "fly"/"bat" are listed at the level their commonest sense appears),
// which is fine for reconciling the concrete nouns/adjectives our themes
// teach. The official Food & drink table pairs dialectal synonyms (chips/
// fries, candy/sweet(s)) — we only encode the variant we actually teach.
// Multi-word headwords (e.g. "ice cream") are deliberately left out: our
// vocab items are single tokens (the Write hut traces/spells them letter by
// letter), so a space mid-word would need engine changes to handle.
import type { Level } from "@/lib/types";

export type YleLevel = "starters" | "movers" | "flyers";

const YLE_TO_LEVEL: Record<YleLevel, Level> = {
  starters: "starter",
  movers: "mover",
  flyers: "flyer",
};

// word → the level it first appears at in the YLE wordlist.
export const YLE_WORDLIST: Record<string, YleLevel> = {
  // ---- Animals ----
  animal: "starters",
  bear: "starters",
  bee: "starters",
  bird: "starters",
  cat: "starters",
  chicken: "starters",
  cow: "starters",
  crocodile: "starters",
  dog: "starters",
  donkey: "starters",
  duck: "starters",
  elephant: "starters",
  fish: "starters",
  frog: "starters",
  giraffe: "starters",
  goat: "starters",
  hippo: "starters",
  horse: "starters",
  jellyfish: "starters",
  lizard: "starters",
  monkey: "starters",
  mouse: "starters",
  pet: "starters",
  sheep: "starters",
  snake: "starters",
  spider: "starters",
  tiger: "starters",
  zebra: "starters",
  zoo: "starters",
  dolphin: "movers",
  kangaroo: "movers",
  kitten: "movers",
  lion: "movers",
  panda: "movers",
  parrot: "movers",
  penguin: "movers",
  puppy: "movers",
  rabbit: "movers",
  shark: "movers",
  snail: "movers",
  whale: "movers",
  beetle: "flyers",
  butterfly: "flyers",
  camel: "flyers",
  dinosaur: "flyers",
  eagle: "flyers",
  insect: "flyers",
  octopus: "flyers",
  swan: "flyers",
  tortoise: "flyers",

  // ---- Weather / sky ----
  sun: "starters",
  ice: "starters",
  sunny: "movers",
  rain: "movers",
  cloud: "movers",
  cloudy: "movers",
  wind: "movers",
  windy: "movers",
  hot: "movers",
  cold: "movers",
  snow: "movers",
  weather: "movers",
  rainbow: "movers",
  sky: "movers",
  star: "movers",
  storm: "flyers",
  fog: "flyers",
  foggy: "flyers",

  // ---- Food & drink ----
  apple: "starters",
  banana: "starters",
  bread: "starters",
  cake: "starters",
  egg: "starters",
  milk: "starters",
  rice: "starters",
  juice: "starters",
  water: "starters",
  burger: "starters",
  carrot: "starters",
  chocolate: "starters",
  fries: "starters",
  grape: "starters",
  lemon: "starters",
  onion: "starters",
  pineapple: "starters",
  potato: "starters",
  tomato: "starters",
  watermelon: "starters",
  soup: "movers",
  cheese: "movers",
  pasta: "movers",
  salad: "movers",
  sandwich: "movers",

  // ---- Colours ----
  red: "starters",
  blue: "starters",
  green: "starters",
  yellow: "starters",
  black: "starters",
  white: "starters",
  orange: "starters",
  pink: "starters",
  purple: "starters",
  brown: "starters",
};

/** The YLE level a word maps to in our Level scale, or null if not in the list. */
export function yleLevel(word: string): Level | null {
  const entry = YLE_WORDLIST[word.toLowerCase()];
  return entry ? YLE_TO_LEVEL[entry] : null;
}
