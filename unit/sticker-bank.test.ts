import { describe, it, expect } from "vitest";
import {
  BOY_STICKERS,
  GIRL_STICKERS,
  STICKER_BANK,
  stickersForSet,
} from "@/data/stickers/sticker-bank";

describe("sticker bank", () => {
  it("has ~30 stickers per set and 60 total", () => {
    expect(BOY_STICKERS).toHaveLength(30);
    expect(GIRL_STICKERS).toHaveLength(30);
    expect(STICKER_BANK).toHaveLength(60);
  });

  it("has globally unique ids", () => {
    const ids = STICKER_BANK.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tags every sticker with its declared set, prefixed by id", () => {
    for (const s of BOY_STICKERS) {
      expect(s.set).toBe("boy");
      expect(s.id.startsWith("boy-")).toBe(true);
    }
    for (const s of GIRL_STICKERS) {
      expect(s.set).toBe("girl");
      expect(s.id.startsWith("girl-")).toBe(true);
    }
  });

  it("includes a legendary tier in each set for the theme-master milestone", () => {
    expect(BOY_STICKERS.some((s) => s.rarity === "legendary")).toBe(true);
    expect(GIRL_STICKERS.some((s) => s.rarity === "legendary")).toBe(true);
  });

  it("stickersForSet returns the matching set", () => {
    expect(stickersForSet("boy")).toBe(BOY_STICKERS);
    expect(stickersForSet("girl")).toBe(GIRL_STICKERS);
  });
});
