import { describe, expect, it } from "vitest";

import { GRAMMAR_OBSERVE_FRAMES } from "@/data/grammar";
import { PLURALS } from "@/data/grammar/plurals";
import { PRESENT_CONTINUOUS } from "@/data/grammar/present-continuous";
import { PREPOSITIONS } from "@/data/grammar/prepositions";
import { relationForKey } from "@/data/grammar/scenes";

const STRUCTURES = [PLURALS, PRESENT_CONTINUOUS, PREPOSITIONS];

describe("grammar observe frames (G3)", () => {
  it("every structure has 2+ frames, each with narration and a resolvable visual", () => {
    for (const structure of STRUCTURES) {
      expect(structure.observe.length).toBeGreaterThanOrEqual(2);
      for (const frame of structure.observe) {
        expect(frame.narration.length).toBeGreaterThan(0);
        // A valid visual is either an ordinary emoji string or a registered scene key.
        expect(frame.visual.length).toBeGreaterThan(0);
        if (frame.visual.startsWith("scene:")) {
          expect(relationForKey(frame.visual)).toBeDefined();
        }
      }
    }
  });

  it("never states a rule — narration is a plain example, not an instruction", () => {
    const ruleWords = /\b(rule|add|always|remember)\b/i;
    for (const frame of GRAMMAR_OBSERVE_FRAMES) {
      expect(frame.narration).not.toMatch(ruleWords);
    }
  });

  it("GRAMMAR_OBSERVE_FRAMES concatenates each structure's frames, in order", () => {
    const expected = STRUCTURES.flatMap((s) => s.observe);
    expect(GRAMMAR_OBSERVE_FRAMES).toEqual(expected);
    expect(GRAMMAR_OBSERVE_FRAMES[0]).toEqual(PLURALS.observe[0]);
  });
});
