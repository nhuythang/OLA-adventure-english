import { describe, expect, it } from "vitest";

import { PLURALS } from "@/data/grammar/plurals";
import { PRESENT_CONTINUOUS } from "@/data/grammar/present-continuous";
import { PREPOSITIONS } from "@/data/grammar/prepositions";
import { CAN } from "@/data/grammar/can";
import { THERE_IS_ARE } from "@/data/grammar/there-is-are";
import { grammarRoundItems } from "@/data/grammar";
import { relationForKey } from "@/data/grammar/scenes";
import { buildGrammarQuestions, toEngineQuestion } from "@/lib/engine/grammar-questions";

const STRUCTURE_IDS = ["plurals", "present-continuous", "prepositions", "can", "there-is-are"] as const;
const structureOf = (id: string) => STRUCTURE_IDS.find((s) => id.startsWith(`${s}-`));

describe("grammar content shape", () => {
  it("plurals are a BINARY singular/plural contrast of one referent (the -s is the only difference)", () => {
    for (const item of PLURALS.items) {
      // Exactly one distractor: the singular. Same emoji glyph, different count.
      expect(item.distractors).toHaveLength(1);
      const glyphs = new Set([item.correct, ...item.distractors].map((c) => c.emoji[0]));
      expect(glyphs.size).toBe(1);
      expect(item.correct.emoji.length).toBeGreaterThan(item.distractors[0]!.emoji.length);
      // Prompt is the plural; the singular distractor is genuinely wrong for it.
      expect(item.prompt).toBe(item.correct.label);
      expect(item.prompt).not.toBe(item.distractors[0]!.label);
    }
  });

  it("present-continuous distractors are different actions under the same frame", () => {
    for (const item of PRESENT_CONTINUOUS.items) {
      const ids = [item.correct, ...item.distractors].map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length); // no duplicate option
      expect(item.prompt).toMatch(/^(She|He) is \w+ing\.$/);
      // The write target rebuilds the very sentence frame.
      expect(item.sentenceWords.join(" ") + ".").toBe(item.prompt);
    }
  });

  it("prepositions contrast the SAME referent in different positions (the preposition is the only difference)", () => {
    for (const item of PREPOSITIONS.items) {
      const options = [item.correct, ...item.distractors];
      // Every option is a drawn scene of the ball + box (no emoji here).
      for (const opt of options) expect(relationForKey(opt.emoji)).toBeDefined();
      // Distinct positions, correct not duplicated among distractors.
      const relations = options.map((o) => relationForKey(o.emoji));
      expect(new Set(relations).size).toBe(options.length);
      expect(item.distractors.some((d) => d.id === item.correct.id)).toBe(false);
      // Prompt names the place; the write target rebuilds that very sentence.
      expect(item.prompt).toMatch(/^The ball is .+ the box\.$/);
      expect(item.sentenceWords.join(" ") + ".").toBe(item.prompt);
    }
  });

  it("can-for-ability distractors are different animal+ability pairs under the same frame (G7a)", () => {
    for (const item of CAN.items) {
      const ids = [item.correct, ...item.distractors].map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length); // no duplicate option
      expect(item.prompt).toMatch(/^It can \w+\.$/);
      expect(item.sentenceWords.join(" ") + ".").toBe(item.prompt);
    }
  });

  it("there-is-are is a BINARY singular/plural contrast, alternating which direction is the target (G7a)", () => {
    for (const item of THERE_IS_ARE.items) {
      expect(item.distractors).toHaveLength(1);
      const glyphs = new Set([item.correct, ...item.distractors].map((c) => c.emoji[0]));
      expect(glyphs.size).toBe(1); // same referent, different count
      expect(item.prompt).toMatch(/^There (is a|are) \w+\.$/);
    }
    const isTargets = THERE_IS_ARE.items.filter((i) => i.prompt.startsWith("There is"));
    const areTargets = THERE_IS_ARE.items.filter((i) => i.prompt.startsWith("There are"));
    expect(isTargets.length).toBeGreaterThan(0);
    expect(areTargets.length).toBeGreaterThan(0);
    expect(isTargets.length).toBe(areTargets.length); // one of each per noun
  });
});

describe("grammarRoundItems", () => {
  it("respects the round cap", () => {
    const items = grammarRoundItems(4, "starter");
    expect(items).toHaveLength(4);
  });

  it("the first pass touches every level-eligible structure once before any repeats", () => {
    const items = grammarRoundItems(5, "starter");
    expect(new Set(items.map((i) => structureOf(i.id)))).toEqual(new Set(STRUCTURE_IDS));
  });

  it("is deterministic (SSR-safe — same result every call)", () => {
    expect(grammarRoundItems(5, "starter")).toEqual(grammarRoundItems(5, "starter"));
  });

  it("never exceeds the available item pool for a level", () => {
    const all = grammarRoundItems(999, "starter");
    const total =
      PLURALS.items.length +
      PRESENT_CONTINUOUS.items.length +
      PREPOSITIONS.items.length +
      CAN.items.length +
      THERE_IS_ARE.items.length;
    expect(all.length).toBe(total);
  });

  it("gives vnFocus structures (plurals, present-continuous, there-is-are) a bigger round-share than non-focus ones (G5)", () => {
    const items = grammarRoundItems(16, "starter");
    const count = (id: (typeof STRUCTURE_IDS)[number]) => items.filter((i) => structureOf(i.id) === id).length;
    expect(count("plurals")).toBeGreaterThan(count("prepositions"));
    expect(count("present-continuous")).toBeGreaterThan(count("prepositions"));
    expect(count("there-is-are")).toBeGreaterThan(count("prepositions"));
    expect(count("can")).toBe(count("prepositions")); // both unmarked, same weight
  });

  it("weighted structures still alternate rather than clumping (interleaving rule 6)", () => {
    // A naive "repeat the structure" weighting would put two plurals rounds
    // back to back. The weighted round-robin schedule shouldn't.
    const items = grammarRoundItems(10, "starter");
    for (let i = 1; i < items.length; i++) {
      expect(structureOf(items[i]!.id)).not.toBe(structureOf(items[i - 1]!.id));
    }
  });

  it("G7a's new structures are Starters-tier, so mover/flyer see the exact same pool for now", () => {
    expect(grammarRoundItems(20, "mover")).toEqual(grammarRoundItems(20, "starter"));
    expect(grammarRoundItems(20, "flyer")).toEqual(grammarRoundItems(20, "starter"));
  });
});

describe("buildGrammarQuestions", () => {
  it("maps each item to an EngineQuestion carrying its own contrast set", () => {
    const items = grammarRoundItems(3, "starter");
    const questions = buildGrammarQuestions(items);
    expect(questions).toHaveLength(3);
    questions.forEach((q, i) => {
      const item = items[i]!;
      expect(q.id).toBe(item.id);
      expect(q.prompt).toBe(item.prompt);
      expect(q.correct).toBe(item.correct);
      expect(q.distractors).toBe(item.distractors);
      // correct is never duplicated among its distractors (engine rule 8/9).
      expect(q.distractors.some((d) => d.id === q.correct.id)).toBe(false);
    });
  });

  it("toEngineQuestion strips the write/speak-only fields", () => {
    const q = toEngineQuestion(PLURALS.items[0]!);
    expect(Object.keys(q).sort()).toEqual(["correct", "distractors", "id", "prompt", "reveal"]);
  });
});
