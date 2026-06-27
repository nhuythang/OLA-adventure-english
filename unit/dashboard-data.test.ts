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
    { child_id: "milo", hut_id: "weather-listen", first_try_correct: true },
    { child_id: "milo", hut_id: "weather-listen", first_try_correct: true },
    { child_id: "milo", hut_id: "weather-listen", first_try_correct: false },
    { child_id: "milo", hut_id: "weather-write", first_try_correct: true },
  ],
  themes: [
    { id: "weather", title: "Weather" },
    { id: "animals", title: "Animals" },
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
