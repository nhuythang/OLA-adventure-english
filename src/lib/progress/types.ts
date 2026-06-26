import type { Level, Skill } from "@/lib/types";

// A child's full persisted progress. Same shape whether it lives in localStorage
// (dev / unconfigured) or Supabase (production) — the backend is swapped beneath
// this, the consumers never change.
export interface ChildProgress {
  /** Ordered list of earned sticker ids — drives the one-by-one progression. */
  earnedStickerIds: string[];
  /** Huts that have been finished (and so already granted their sticker). */
  completedHuts: Record<string, Skill[]>;
  /** Huts finished at ≥80% — counts toward the theme-master milestone. */
  masteredHuts: Record<string, Skill[]>;
  /** Themes whose 4 huts are all mastered (master sticker granted, next unlocked). */
  masteredThemes: string[];
  /** Per-skill level overrides; falls back to the profile default. */
  skillLevels: Partial<Record<Skill, Level>>;
}

export function emptyProgress(): ChildProgress {
  return { earnedStickerIds: [], completedHuts: {}, masteredHuts: {}, masteredThemes: [], skillLevels: {} };
}
