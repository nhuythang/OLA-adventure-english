import { describe, expect, it } from "vitest";

import { PLURALS } from "@/data/grammar/plurals";
import { PRESENT_CONTINUOUS } from "@/data/grammar/present-continuous";
import { PREPOSITIONS } from "@/data/grammar/prepositions";
import { grammarRoundItems } from "@/data/grammar";
import { relationForKey } from "@/data/grammar/scenes";
import { buildGrammarQuestions, toEngineQuestion } from "@/lib/engine/grammar-questions";

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
});

describe("grammarRoundItems", () => {
  it("interleaves the two structures and respects the round cap", () => {
    const items = grammarRoundItems(4);
    expect(items).toHaveLength(4);
    // Round-robin across the three structures, then wraps.
    expect(items[0]!.id.startsWith("plurals-")).toBe(true);
    expect(items[1]!.id.startsWith("present-continuous-")).toBe(true);
    expect(items[2]!.id.startsWith("prepositions-")).toBe(true);
    expect(items[3]!.id.startsWith("plurals-")).toBe(true);
  });

  it("is deterministic (SSR-safe — same result every call)", () => {
    expect(grammarRoundItems(5)).toEqual(grammarRoundItems(5));
  });

  it("never exceeds the available item pool", () => {
    const all = grammarRoundItems(999);
    expect(all.length).toBe(PLURALS.items.length + PRESENT_CONTINUOUS.items.length + PREPOSITIONS.items.length);
  });

  it("gives vnFocus structures (plurals, present-continuous) a bigger round-share than prepositions (G5)", () => {
    const items = grammarRoundItems(10);
    const count = (prefix: string) => items.filter((i) => i.id.startsWith(prefix)).length;
    const plurals = count("plurals-");
    const present = count("present-continuous-");
    const prepositions = count("prepositions-");
    expect(plurals).toBeGreaterThan(prepositions);
    expect(present).toBeGreaterThan(prepositions);
  });

  it("weighted structures still alternate rather than clumping (interleaving rule 6)", () => {
    // A naive "repeat the structure" weighting would put two plurals rounds
    // back to back. The weighted round-robin schedule shouldn't.
    const structureOf = (id: string) =>
      (["plurals", "present-continuous", "prepositions"] as const).find((s) => id.startsWith(`${s}-`));
    const items = grammarRoundItems(6);
    for (let i = 1; i < items.length; i++) {
      expect(structureOf(items[i]!.id)).not.toBe(structureOf(items[i - 1]!.id));
    }
  });
});

describe("buildGrammarQuestions", () => {
  it("maps each item to an EngineQuestion carrying its own contrast set", () => {
    const items = grammarRoundItems(3);
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
