// Grammar content shapes. Unlike a vocabulary theme (one emoji per word, choices
// = different words), a grammar question's choices are GRAMMATICAL CONTRASTS of
// the SAME referent — e.g. "three cats" 🐱🐱🐱 vs "one cat" 🐱. The contrast set
// IS the teaching, so each item carries its own correct + distractor choices
// rather than drawing them from a shared word pool.
import type { Choice } from "@/lib/engine/hut-machine";
import type { Level } from "@/lib/types";

export interface GrammarItem {
  id: string;
  /** Spoken (Listen/Speak) and printed (Read) prompt, e.g. "three cats" or "She is running." */
  prompt: string;
  /** 2nd-miss reveal narration (engine rule 3), e.g. "This one is three cats. Cats!" */
  reveal: string;
  /** The grammatically-correct choice for this prompt. */
  correct: Choice;
  /** Same-referent contrasts that differ by one grammatical feature (count, verb form). */
  distractors: Choice[];
  /** Write hut tiles — the target form to build; first tile is pre-filled as a hint. */
  sentenceWords: string[];
  /** Keyword the Speak hut's best-effort ASR loose-matches, e.g. "cats" / "running". */
  speakTarget: string;
}

export interface ObserveFrame {
  /** Spoken narration for this frame — a plain example, never a stated rule. */
  narration: string;
  /** Emoji or scene-key visual (same union as Choice.emoji). */
  visual: string;
}

export interface GrammarStructure {
  /** Stable id of the grammar point, e.g. "plurals" | "present-continuous". */
  id: string;
  /**
   * The YLE level this structure is introduced at (G7) — gates which
   * structures a child's round pool draws from, cascading like vocab levels:
   * Starter sees only starter-tier structures, Mover sees starter+mover, etc.
   */
  level: Level;
  items: GrammarItem[];
  /** The "Observe" beat (G3): 2–3 narrated example frames shown once before the
   *  hut's rounds, priming the pattern with no rules stated. */
  observe: ObserveFrame[];
  /**
   * A high-yield Vietnamese-L1 interference point (plural -s, 3rd-person -s,
   * copula "be", articles, tense — see docs/research/grammar-build-roadmap.md)
   * — gets a bigger round-share in grammarRoundItems (G5). Defaults to false
   * (equal share) when omitted.
   */
  vnFocus?: boolean;
}
