import { describe, expect, it } from "vitest";

import {
  assembled,
  buildWordTiles,
  isSentenceComplete,
  isSentenceCorrect,
} from "@/lib/engine/sentence";
import { buildPictureQuestions } from "@/lib/engine/picture-questions";
import { weatherSentence, weatherSentenceWords } from "@/data/themes/weather";

const seed = () => 0.42;

describe("sentence tiles engine", () => {
  it("builds tiles for every word after the hint (first word)", () => {
    const tiles = buildWordTiles(["It", "is", "sunny"], seed);
    expect(tiles).toHaveLength(2);
    expect(tiles.map((t) => t.word).sort()).toEqual(["is", "sunny"]);
    // ids are unique
    expect(new Set(tiles.map((t) => t.id)).size).toBe(2);
  });

  it("detects completeness and correctness", () => {
    const words = ["It", "is", "sunny"];
    expect(isSentenceComplete(["It", null, "sunny"])).toBe(false);
    expect(isSentenceComplete(["It", "is", "sunny"])).toBe(true);
    expect(isSentenceCorrect(["It", "is", "sunny"], words)).toBe(true);
    expect(isSentenceCorrect(["It", "sunny", "is"], words)).toBe(false);
  });

  it("assembles slots into a spaced string", () => {
    expect(assembled(["It", "is", "sunny"])).toBe("It is sunny");
  });
});

describe("weather sentence content", () => {
  it("templates a sentence and tile words", () => {
    expect(weatherSentence("sunny")).toBe("It is sunny today.");
    expect(weatherSentenceWords("rainy")).toEqual(["It", "is", "rainy"]);
  });
});

describe("buildPictureQuestions with sentence prompt override", () => {
  const words = [
    { word: "sunny", emoji: "☀️" },
    { word: "rainy", emoji: "🌧️" },
  ];

  it("uses the bare word by default", () => {
    const [q] = buildPictureQuestions(words, 1);
    expect(q?.prompt).toBe("sunny");
  });

  it("uses the sentence prompt/reveal when provided, keeping picture choices", () => {
    const [q] = buildPictureQuestions(words, 1, {
      prompt: (w) => weatherSentence(w.word),
      reveal: (w) => `It is ${w.word}.`,
    });
    expect(q?.prompt).toBe("It is sunny today.");
    expect(q?.reveal).toBe("It is sunny.");
    expect(q?.correct.emoji).toBe("☀️");
    expect(q?.distractors.map((d) => d.label)).toEqual(["rainy"]);
  });
});
