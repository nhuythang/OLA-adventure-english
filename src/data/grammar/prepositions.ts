// Prepositions of place (in / on / under / next to). The choices are the SAME
// referent (a ball + a box) in different spatial relations, so the preposition
// is the only thing that distinguishes the answer. Emoji can't show "under", so
// these use inline-SVG scenes (see grammar-scene.tsx) — the one real new-art need
// in the grammar journey. Prepositions are an early YLE / Starter target.
import type { Choice } from "@/lib/engine/hut-machine";
import { sceneKey, type SceneName } from "./scenes";
import type { GrammarStructure } from "./types";

interface Place {
  prep: string; // the preposition, e.g. "under"
  scene: SceneName;
  /** Key word the Speak hut's ASR loose-matches ("next to" → "next"). */
  asr: string;
}

const PLACES: Place[] = [
  { prep: "in", scene: "ball-in-box", asr: "in" },
  { prep: "on", scene: "ball-on-box", asr: "on" },
  { prep: "under", scene: "ball-under-box", asr: "under" },
  { prep: "next to", scene: "ball-next-to-box", asr: "next" },
];

function choice(p: Place): Choice {
  return { id: `prep-${p.scene}`, label: `the ball is ${p.prep} the box`, emoji: sceneKey(p.scene) };
}

export const PREPOSITIONS: GrammarStructure = {
  id: "prepositions",
  items: PLACES.map((p) => ({
    id: `prepositions-${p.prep.replace(/\s+/g, "-")}`,
    prompt: `The ball is ${p.prep} the box.`,
    reveal: `The ball is ${p.prep} the box.`,
    correct: choice(p),
    // Same referent, the other positions — the preposition is the only difference.
    distractors: PLACES.filter((o) => o.scene !== p.scene).map(choice),
    sentenceWords: ["The", "ball", "is", p.prep, "the", "box"],
    speakTarget: p.asr,
  })),
};
