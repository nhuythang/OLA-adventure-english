import { describe, expect, it } from "vitest";

import { applyHutResult } from "@/lib/progress/apply";
import { emptyProgress, type ChildProgress } from "@/lib/progress/types";
import { stickersForSet } from "@/data/stickers/sticker-bank";
import { SKILLS } from "@/lib/types";

const set = stickersForSet("boy");

describe("applyHutResult", () => {
  it("grants exactly one sticker for finishing a hut", () => {
    const { progress, outcome } = applyHutResult(emptyProgress(), set, "weather", "listen", true);
    expect(outcome.newSticker).not.toBeNull();
    expect(progress.earnedStickerIds).toHaveLength(1);
    expect(progress.completedHuts.weather).toEqual(["listen"]);
    expect(progress.masteredHuts.weather).toEqual(["listen"]);
    expect(outcome.themeMastered).toBe(false);
  });

  it("does not count a non-mastered hut toward mastery, but still grants its sticker", () => {
    const { progress, outcome } = applyHutResult(emptyProgress(), set, "weather", "listen", false);
    expect(outcome.newSticker).not.toBeNull();
    expect(progress.completedHuts.weather).toEqual(["listen"]);
    expect(progress.masteredHuts.weather ?? []).toEqual([]);
  });

  it("is idempotent — replaying a finished hut grants nothing new", () => {
    const first = applyHutResult(emptyProgress(), set, "weather", "listen", true);
    const second = applyHutResult(first.progress, set, "weather", "listen", true);
    expect(second.outcome.newSticker).toBeNull();
    expect(second.progress.earnedStickerIds).toEqual(first.progress.earnedStickerIds);
  });

  it("awards the theme-master legendary once all 4 huts are mastered", () => {
    let p: ChildProgress = emptyProgress();
    let lastOutcome = applyHutResult(p, set, "weather", "listen", true).outcome;
    for (const skill of SKILLS) {
      const res = applyHutResult(p, set, "weather", skill, true);
      p = res.progress;
      lastOutcome = res.outcome;
    }
    expect(lastOutcome.themeMastered).toBe(true);
    expect(lastOutcome.masterSticker).not.toBeNull();
    expect(lastOutcome.masterSticker?.rarity).toBe("legendary");
    expect(p.masteredThemes).toEqual(["weather"]);
    // 4 hut stickers + 1 legendary
    expect(p.earnedStickerIds).toHaveLength(5);
  });

  it("does not re-award the legendary on a later replay", () => {
    let p: ChildProgress = emptyProgress();
    for (const skill of SKILLS) p = applyHutResult(p, set, "weather", skill, true).progress;
    const replay = applyHutResult(p, set, "weather", "listen", true);
    expect(replay.outcome.themeMastered).toBe(false);
    expect(replay.outcome.masterSticker).toBeNull();
  });
});
