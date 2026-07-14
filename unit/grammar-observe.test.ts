import { describe, expect, it } from "vitest";

import { grammarObserveFrames } from "@/data/grammar";
import { PLURALS } from "@/data/grammar/plurals";
import { PRESENT_CONTINUOUS } from "@/data/grammar/present-continuous";
import { PREPOSITIONS } from "@/data/grammar/prepositions";
import { CAN } from "@/data/grammar/can";
import { THERE_IS_ARE } from "@/data/grammar/there-is-are";
import { relationForKey } from "@/data/grammar/scenes";

const STRUCTURES = [PLURALS, PRESENT_CONTINUOUS, PREPOSITIONS, CAN, THERE_IS_ARE];

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
    for (const frame of grammarObserveFrames("starter")) {
      expect(frame.narration).not.toMatch(ruleWords);
    }
  });

  it("grammarObserveFrames concatenates each level-eligible structure's frames, in order", () => {
    const expected = STRUCTURES.flatMap((s) => s.observe);
    expect(grammarObserveFrames("starter")).toEqual(expected);
    expect(grammarObserveFrames("starter")[0]).toEqual(PLURALS.observe[0]);
  });

  it("all G7a structures are starter-tier, so mover/flyer see the exact same frames for now", () => {
    expect(grammarObserveFrames("mover")).toEqual(grammarObserveFrames("starter"));
    expect(grammarObserveFrames("flyer")).toEqual(grammarObserveFrames("starter"));
  });
});
