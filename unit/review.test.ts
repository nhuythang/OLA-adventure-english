import { describe, expect, it } from "vitest";

import { buildPictureRounds, reviewThemeIds } from "@/lib/review";
import type { ItemStats } from "@/lib/progress/review-schedule";

describe("reviewThemeIds", () => {
  it("excludes the current theme and themes without content", () => {
    // animals = current (excluded); "bogus" has no content (excluded).
    expect(reviewThemeIds("animals", ["weather", "animals", "food", "bogus"])).toEqual(["weather", "food"]);
    expect(reviewThemeIds("weather", [])).toEqual([]);
  });
});

describe("buildPictureRounds", () => {
  it("is all current-theme when nothing else is mastered", () => {
    const rounds = buildPictureRounds("weather", [], "starter", 5);
    expect(rounds).toHaveLength(5);
    // Weather starter words only (no animals leaked in).
    const ids = rounds.map((q) => q.id);
    expect(ids.every((id) => ["sunny", "rainy", "cloudy", "windy", "hot", "cold"].includes(id))).toBe(true);
  });

  it("interleaves review items from a mastered theme", () => {
    const rounds = buildPictureRounds("animals", ["weather"], "starter", 5);
    expect(rounds).toHaveLength(5);
    const animalIds = ["cat", "dog", "bird", "fish", "frog", "duck"];
    const reviews = rounds.filter((q) => !animalIds.includes(q.id));
    // ~30% of 5 ≈ 2 review rounds drawn from Weather.
    expect(reviews).toHaveLength(2);
    expect(rounds.filter((q) => animalIds.includes(q.id))).toHaveLength(3);
  });

  it("keeps each review question's choices in its own theme (coherent options)", () => {
    const rounds = buildPictureRounds("animals", ["weather"], "starter", 5);
    const review = rounds.find((q) => !["cat", "dog", "bird", "fish", "frog", "duck"].includes(q.id));
    // A weather review question's distractors are weather words, not animals.
    expect(review?.distractors.every((d) => !["cat", "dog", "bird"].includes(d.id))).toBe(true);
  });

  it("without an rng, keeps the pool's first-N order (deterministic, SSR-safe)", () => {
    const rounds = buildPictureRounds("animals", [], "mover", 5);
    expect(rounds.map((q) => q.id)).toEqual(["cat", "dog", "bird", "fish", "frog"]);
  });

  it("with an rng, rotates which words are targeted instead of always the first N (G4 deepen-pool follow-up)", () => {
    // Animals' Mover/Flyer pool has many more than 5 rounds — a fixed rng seed
    // that doesn't happen to reproduce the first-5 order proves rotation is
    // live, not just reshuffling within an unchanged target set.
    const seed = [0.9, 0.1, 0.8, 0.2, 0.7, 0.05];
    let call = 0;
    const rng = () => seed[call++ % seed.length]!;
    const rounds = buildPictureRounds("animals", [], "mover", 5, {}, "", rng);
    expect(rounds).toHaveLength(5);
    expect(rounds.map((q) => q.id)).not.toEqual(["cat", "dog", "bird", "fish", "frog"]);
  });

  it("review picks the due-and-weak item over fresh-and-strong ones (G5 spaced review)", () => {
    const today = "2026-07-12";
    // Every Weather Starter word gets a stat so none win by the "never seen"
    // sentinel — only "rainy" is actually overdue and weak; the rest were
    // just reviewed and are well-known (not due for a while yet).
    const itemStats: ItemStats = {
      "weather-sunny": { lastSeen: today, correctStreak: 3 },
      "weather-rainy": { lastSeen: "2026-06-01", correctStreak: 0 },
      "weather-cloudy": { lastSeen: today, correctStreak: 3 },
      "weather-windy": { lastSeen: today, correctStreak: 3 },
      "weather-hot": { lastSeen: today, correctStreak: 3 },
      "weather-cold": { lastSeen: today, correctStreak: 3 },
    };
    const rounds = buildPictureRounds("animals", ["weather"], "starter", 5, itemStats, today);
    const reviewIds = rounds.map((q) => q.id).filter((id) => !["cat", "dog", "bird", "fish", "frog", "duck"].includes(id));
    expect(reviewIds).toContain("rainy");
  });

  it("with no itemStats (default), review falls back to the pool's built order — no crash", () => {
    const rounds = buildPictureRounds("animals", ["weather"], "starter", 5);
    expect(rounds).toHaveLength(5);
  });
});
