import { describe, expect, it } from "vitest";

import { vi } from "@/i18n";
import { SKILLS } from "@/lib/types";

// The placement form maps one option per level to each skill; a missing or
// mis-ordered level would silently break the questionnaire, so guard it here.
describe("placement content", () => {
  it("covers every skill with starter/mover/flyer options in order", () => {
    for (const skill of SKILLS) {
      const q = vi.parent.placement.skills[skill];
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.options.map((o) => o.level)).toEqual(["starter", "mover", "flyer"]);
      for (const o of q.options) expect(o.label.length).toBeGreaterThan(0);
    }
  });
});
