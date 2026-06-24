// TEMPORARY mock progress for Phase 1 screens, keyed by child id. This stands
// in for real per-child state until localStorage persistence (task 15) and
// Supabase (task 19) replace it. A few earned stickers are seeded so the
// sticker book looks alive while we build; mastered themes are empty so only
// the first island is unlocked.

export const MOCK_EARNED_STICKER_IDS: Record<string, string[]> = {
  milo: ["boy-finn-shark", "boy-leo-roar", "boy-dash-dog"],
  sunny: ["girl-kiki-kitten", "girl-bella-butterfly", "girl-twinkle-star", "girl-bonnie-bunny"],
};

export const MOCK_MASTERED_THEME_IDS: Record<string, string[]> = {
  milo: [],
  sunny: [],
};

export function earnedStickerIds(childId: string): string[] {
  return MOCK_EARNED_STICKER_IDS[childId] ?? [];
}

export function masteredThemeIds(childId: string): string[] {
  return MOCK_MASTERED_THEME_IDS[childId] ?? [];
}
