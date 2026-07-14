import { describe, expect, it } from "vitest";

import { summarize, type SummarizeInput } from "@/lib/parent/dashboard-data";

const base: SummarizeInput = {
  children: [{ id: "milo", name: "Milo", avatar: "🦊", sticker_set: "boy" }],
  skillLevels: [
    { child_id: "milo", skill: "listen", level: "mover" },
    { child_id: "milo", skill: "write", level: "starter" },
  ],
  hutProgress: [
    { child_id: "milo", theme_id: "weather", skill: "listen", completed: true, mastered: true },
    { child_id: "milo", theme_id: "weather", skill: "read", completed: true, mastered: false },
  ],
  themeMastery: [],
  earnedStickers: [
    { child_id: "milo", sticker_id: "boy-finn-shark", seq: 1 },
    { child_id: "milo", sticker_id: "boy-leo-roar", seq: 0 },
  ],
  attempts: [
    { child_id: "milo", hut_id: "weather-listen", item_id: "weather-sunny", first_try_correct: true },
    { child_id: "milo", hut_id: "weather-listen", item_id: "weather-rainy", first_try_correct: true },
    { child_id: "milo", hut_id: "weather-listen", item_id: "weather-cloudy", first_try_correct: false },
    { child_id: "milo", hut_id: "weather-write", item_id: "weather-sunny", first_try_correct: true },
  ],
  themes: [
    { id: "weather", title: "Weather" },
    { id: "animals", title: "Animals" },
  ],
  grammarStructures: [
    { id: "plurals", title: "Số nhiều (-s)" },
    { id: "present-continuous", title: "Thì hiện tại tiếp diễn" },
    { id: "prepositions", title: "Giới từ chỉ vị trí" },
  ],
};

describe("summarize", () => {
  it("returns no children for empty input", () => {
    expect(summarize({ ...base, children: [] }).children).toEqual([]);
  });

  it("computes per-skill level and first-try accuracy", () => {
    const child = summarize(base).children[0]!;
    expect(child.skills.listen.level).toBe("mover");
    expect(child.skills.listen.attempts).toBe(3);
    expect(child.skills.listen.firstTryPct).toBe(67); // 2/3 rounded
    expect(child.skills.write.firstTryPct).toBe(100); // 1/1
  });

  it("defaults level to starter and accuracy to null when a skill is untouched", () => {
    const child = summarize(base).children[0]!;
    expect(child.skills.speak.level).toBe("starter");
    expect(child.skills.speak.attempts).toBe(0);
    expect(child.skills.speak.firstTryPct).toBeNull();
  });

  it("summarizes theme progress (huts mastered + mastered flag)", () => {
    const child = summarize(base).children[0]!;
    const weather = child.themes.find((t) => t.themeId === "weather")!;
    expect(weather.hutsMastered).toBe(1); // only listen mastered
    expect(weather.mastered).toBe(false);
    expect(child.themes.find((t) => t.themeId === "animals")!.hutsMastered).toBe(0);
  });

  it("marks a theme mastered when present in theme_mastery", () => {
    const child = summarize({ ...base, themeMastery: [{ child_id: "milo", theme_id: "weather" }] }).children[0]!;
    expect(child.themes.find((t) => t.themeId === "weather")!.mastered).toBe(true);
  });

  it("orders earned stickers by seq", () => {
    const child = summarize(base).children[0]!;
    expect(child.earnedStickerIds).toEqual(["boy-leo-roar", "boy-finn-shark"]);
  });
});

describe("summarize — grammar (G6)", () => {
  // present-continuous's hyphenated id + a hyphenated item slug ("run-fast")
  // are the sharpest test of the KNOWN-structure-list parsing (never a naive
  // split on "-").
  const grammarInput: SummarizeInput = {
    ...base,
    attempts: [
      { child_id: "milo", hut_id: "grammar-listen", item_id: "grammar-plurals-cat", first_try_correct: true },
      { child_id: "milo", hut_id: "grammar-listen", item_id: "grammar-plurals-cat", first_try_correct: false },
      { child_id: "milo", hut_id: "grammar-listen", item_id: "grammar-plurals-cat", first_try_correct: false },
      { child_id: "milo", hut_id: "grammar-listen", item_id: "grammar-plurals-dog", first_try_correct: true },
      {
        child_id: "milo",
        hut_id: "grammar-listen",
        item_id: "grammar-present-continuous-run-fast",
        first_try_correct: false,
      },
      // Not this child — must not leak into milo's stats.
      { child_id: "sunny", hut_id: "grammar-listen", item_id: "grammar-plurals-cat", first_try_correct: false },
    ],
  };

  it("computes per-structure attempts + first-try accuracy, scoped to this child", () => {
    const child = summarize(grammarInput).children[0]!;
    const plurals = child.grammar.structures.find((s) => s.id === "plurals")!;
    expect(plurals.attempts).toBe(4);
    expect(plurals.firstTryPct).toBe(50); // 2/4 first-try-correct (cat's 2 misses don't count)
  });

  it("parses a hyphenated structure id correctly (present-continuous, not naive split)", () => {
    const child = summarize(grammarInput).children[0]!;
    const present = child.grammar.structures.find((s) => s.id === "present-continuous")!;
    expect(present.attempts).toBe(1);
    expect(present.firstTryPct).toBe(0);
  });

  it("reports null accuracy for a structure never attempted", () => {
    const child = summarize(grammarInput).children[0]!;
    const prepositions = child.grammar.structures.find((s) => s.id === "prepositions")!;
    expect(prepositions.attempts).toBe(0);
    expect(prepositions.firstTryPct).toBeNull();
  });

  it("ranks most-missed items by miss count, preserving a hyphenated item slug", () => {
    const child = summarize(grammarInput).children[0]!;
    expect(child.grammar.mostMissed[0]).toEqual({
      structureId: "plurals",
      structureTitle: "Số nhiều (-s)",
      itemSlug: "cat",
      misses: 2,
    });
    const runFast = child.grammar.mostMissed.find((m) => m.itemSlug === "run-fast");
    expect(runFast).toEqual({
      structureId: "present-continuous",
      structureTitle: "Thì hiện tại tiếp diễn",
      itemSlug: "run-fast",
      misses: 1,
    });
  });

  it("excludes items with zero misses from the most-missed list", () => {
    const child = summarize(grammarInput).children[0]!;
    expect(child.grammar.mostMissed.some((m) => m.itemSlug === "dog")).toBe(false);
  });

  it("ignores non-grammar attempts (weather items) in the grammar section", () => {
    const child = summarize(base).children[0]!;
    expect(child.grammar.structures.every((s) => s.attempts === 0)).toBe(true);
    expect(child.grammar.mostMissed).toEqual([]);
  });
});
