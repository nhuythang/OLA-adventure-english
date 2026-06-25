// Pure sticker-award ordering (engine rule: earned one-by-one, in order).
// Hut completions award the lowest-rarity un-earned sticker (common → rare →
// epic); the theme-master milestone awards a legendary. Pure so it's unit-tested
// without localStorage — the stateful wiring lives in storage.ts.
import type { CharacterSticker, StickerRarity } from "@/lib/types";

const RANK: Record<StickerRarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

export function pickNextSticker(
  set: readonly CharacterSticker[],
  earnedIds: Iterable<string>,
  opts: { milestone?: boolean } = {},
): CharacterSticker | null {
  const earned = new Set(earnedIds);
  const wantLegendary = opts.milestone === true;
  const candidates = set
    .map((sticker, i) => ({ sticker, i }))
    .filter(({ sticker }) => {
      if (earned.has(sticker.id)) return false;
      return wantLegendary ? sticker.rarity === "legendary" : sticker.rarity !== "legendary";
    });

  if (candidates.length === 0) {
    // Fallback: nothing left in the preferred tier — grant any un-earned.
    return set.find((s) => !earned.has(s.id)) ?? null;
  }

  // Lowest rarity first; original array order breaks ties (stable).
  candidates.sort((a, b) => RANK[a.sticker.rarity] - RANK[b.sticker.rarity] || a.i - b.i);
  return candidates[0]!.sticker;
}
