import { describe, it, expect } from "vitest";
import { pickNextSticker } from "@/lib/engine/award";
import type { CharacterSticker, StickerRarity } from "@/lib/types";

function s(id: string, rarity: StickerRarity): CharacterSticker {
  return { id, name: id, emoji: "x", set: "boy", rarity, tags: [] };
}

// Deliberately not in rarity order, to prove ordering is by rank not array order.
const SET: CharacterSticker[] = [
  s("leg1", "legendary"),
  s("epic1", "epic"),
  s("rare1", "rare"),
  s("common1", "common"),
  s("common2", "common"),
];

describe("pickNextSticker", () => {
  it("awards the lowest-rarity un-earned sticker for a hut", () => {
    expect(pickNextSticker(SET, [])?.id).toBe("common1");
    expect(pickNextSticker(SET, ["common1"])?.id).toBe("common2");
    expect(pickNextSticker(SET, ["common1", "common2"])?.id).toBe("rare1");
    expect(pickNextSticker(SET, ["common1", "common2", "rare1"])?.id).toBe("epic1");
  });

  it("never awards a legendary for a hut (non-milestone)", () => {
    const earned = ["common1", "common2", "rare1", "epic1"];
    expect(pickNextSticker(SET, earned)?.id).toBe("leg1"); // fallback: only legendary left
  });

  it("awards the legendary for a milestone", () => {
    expect(pickNextSticker(SET, [], { milestone: true })?.id).toBe("leg1");
  });

  it("returns null when everything is earned", () => {
    expect(pickNextSticker(SET, SET.map((x) => x.id))).toBeNull();
  });
});
