import { describe, expect, it } from "vitest";

import { reconcileTheme } from "@/lib/wordlist";
import { yleLevel } from "@/data/wordlist/cambridge-yle";

describe("yleLevel", () => {
  it("maps YLE levels onto our scale and returns null when unlisted", () => {
    expect(yleLevel("cat")).toBe("starter");
    expect(yleLevel("lion")).toBe("mover");
    expect(yleLevel("foggy")).toBe("flyer");
    expect(yleLevel("pig")).toBeNull();
  });
});

describe("reconcileTheme — Animals", () => {
  // After swapping pig→horse, every Animals word is a YLE headword taught at or
  // above its YLE level. This guards future Animals edits: a word that isn't in
  // the list (or is taught too early) will fail here.
  it("reconciles cleanly against the Cambridge YLE wordlist", () => {
    const r = reconcileTheme("animals");
    expect(r.notListed).toEqual([]);
    expect(r.belowLevel).toEqual([]);
  });
});

describe("reconcileTheme — Weather (documented deviations)", () => {
  // Weather is the Phase-1 intro theme, hand-seeded before this import. The YLE
  // list shows it's really a *Movers* topic: every weather word is Movers+, and
  // rainy/snowy/stormy aren't headwords (only the nouns rain/snow/storm are).
  // We pin those known deviations so the theme stays playable while any NEW,
  // accidental misalignment (here or in a future theme) trips the test.
  const r = reconcileTheme("weather");

  it("flags the non-headword adjectives", () => {
    expect([...r.notListed].sort()).toEqual(["rainy", "snowy", "stormy"]);
  });

  it("flags the Movers/Flyers words taught below their YLE level", () => {
    expect([...r.belowLevel].map((b) => b.word).sort()).toEqual([
      "cloudy",
      "cold",
      "foggy",
      "hot",
      "sunny",
      "windy",
    ]);
  });
});
