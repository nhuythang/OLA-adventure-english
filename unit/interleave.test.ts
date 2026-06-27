import { describe, expect, it } from "vitest";

import { interleave } from "@/lib/engine/interleave";

const cur = ["c0", "c1", "c2", "c3", "c4"];
const rev = ["r0", "r1", "r2"];

describe("interleave", () => {
  it("returns the first `rounds` current items when there is no review pool", () => {
    expect(interleave(cur, [], 5)).toEqual(["c0", "c1", "c2", "c3", "c4"]);
    expect(interleave(cur, [], 3)).toEqual(["c0", "c1", "c2"]);
  });

  it("mixes ~30% review (2 of 5) with current items", () => {
    const out = interleave(cur, rev, 5);
    expect(out).toHaveLength(5);
    const reviews = out.filter((x) => x.startsWith("r"));
    const currents = out.filter((x) => x.startsWith("c"));
    expect(reviews).toHaveLength(2);
    expect(currents).toHaveLength(3);
  });

  it("spreads review items rather than clumping them at the end", () => {
    const out = interleave(cur, rev, 5);
    // With 2 review of 5, slots are interior (not the last position).
    expect(out[out.length - 1]!.startsWith("c")).toBe(true);
    expect(out.some((x, i) => i < out.length - 1 && x.startsWith("r"))).toBe(true);
  });

  it("caps review at what is available", () => {
    const out = interleave(cur, ["r0"], 5);
    expect(out.filter((x) => x.startsWith("r"))).toHaveLength(1);
    expect(out).toHaveLength(5);
  });

  it("is deterministic (same inputs → same output, SSR-safe)", () => {
    expect(interleave(cur, rev, 5)).toEqual(interleave(cur, rev, 5));
  });
});
