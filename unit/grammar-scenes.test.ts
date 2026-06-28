import { describe, expect, it } from "vitest";

import { SCENE_RELATIONS, relationForKey, sceneKey } from "@/data/grammar/scenes";
import { resolveChoiceVisual } from "@/components/huts/grammar-scene";

describe("scene keys", () => {
  it("round-trip: sceneKey(name) resolves back to its relation", () => {
    for (const name of Object.keys(SCENE_RELATIONS) as (keyof typeof SCENE_RELATIONS)[]) {
      expect(relationForKey(sceneKey(name))).toBe(SCENE_RELATIONS[name]);
    }
  });

  it("ordinary emoji strings are not scenes", () => {
    expect(relationForKey("🐱🐱🐱")).toBeUndefined();
    expect(relationForKey("🏃")).toBeUndefined();
  });
});

describe("resolveChoiceVisual", () => {
  it("returns the emoji string unchanged (stable primitive → ChoiceCard memo safe)", () => {
    expect(resolveChoiceVisual("🐱🐱🐱")).toBe("🐱🐱🐱");
  });

  it("returns a STABLE element identity per scene key (so memoized cards don't re-render)", () => {
    const key = sceneKey("ball-under-box");
    const first = resolveChoiceVisual(key);
    const second = resolveChoiceVisual(key);
    expect(typeof first).not.toBe("string");
    expect(first).toBe(second); // same reference, not just deep-equal
  });
});
