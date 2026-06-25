import { describe, it, expect } from "vitest";
import { WEATHER_WORDS, weatherWordsForLevel } from "@/data/themes/weather";

describe("weather content", () => {
  it("every word has an emoji and a Vietnamese gloss", () => {
    for (const w of WEATHER_WORDS) {
      expect(w.word).toBeTruthy();
      expect(w.emoji).toBeTruthy();
      expect(w.vi).toBeTruthy();
    }
  });

  it("has unique words", () => {
    const words = WEATHER_WORDS.map((w) => w.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("Starter sees a smaller core than Mover/Flyer", () => {
    const starter = weatherWordsForLevel("starter");
    const mover = weatherWordsForLevel("mover");
    expect(starter.length).toBeLessThan(mover.length);
    expect(mover).toEqual(WEATHER_WORDS);
    // The Starter core is a subset of the full set, keeping list order.
    const full = WEATHER_WORDS.map((w) => w.word);
    for (const w of starter) expect(full).toContain(w.word);
  });

  it("Flyer gets the full set (sentence content arrives in task 20)", () => {
    expect(weatherWordsForLevel("flyer")).toEqual(WEATHER_WORDS);
  });
});
