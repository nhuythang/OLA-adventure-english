// ALL shared data shapes for OLA English Adventure live here. Never duplicate
// these in components or data files — import from "@/lib/types".

// ---- Skills & levels ----

// The four skill huts inside every theme island.
export type Skill = "listen" | "speak" | "read" | "write";

// Cambridge YLE progression tiers. Tracked PER SKILL, not per child — a child
// can be a flyer at listen but a starter at write (spec §5, risk §9.2).
export type Level = "starter" | "mover" | "flyer";

export const SKILLS: readonly Skill[] = ["listen", "speak", "read", "write"];

// ---- Stickers (the only reward currency, spec §6) ----

export type StickerRarity = "common" | "rare" | "epic" | "legendary";

// A child's default collection, chosen by gender but switchable in settings —
// not a hard lock. See src/data/stickers/sticker-bank.ts.
export type StickerSet = "boy" | "girl";

// An original mascot character sticker. `emoji` is placeholder art for Phase 1;
// original SVG art can replace it later without changing `id`.
export interface CharacterSticker {
  id: string;
  name: string;
  emoji: string;
  set: StickerSet;
  rarity: StickerRarity;
  /** Short descriptors for theming/filtering, never shown to kids. */
  tags: string[];
}

// ---- Themes (map islands) ----

export interface Theme {
  id: string;
  /** English content title shown to the child, e.g. "Weather". */
  title: string;
  /** The mastery target as a can-do statement, e.g. "I can name the weather." */
  canDo: string;
  /** Display order on the map; lower unlocks first. */
  order: number;
  /** Island visual — emoji content (placeholder art), rendered large on the map. */
  emoji: string;
}

// ---- Child profile ----

export interface ChildProfile {
  id: string;
  /** Display name. */
  name: string;
  /** Avatar is emoji content (MVP), rendered large. */
  avatar: string;
  /** Default sticker collection (switchable). */
  stickerSet: StickerSet;
  /** Per-skill level — the heart of adapting one engine to a wide age band. */
  skillLevels: Record<Skill, Level>;
}

// ---- Progress (Phase 1 localStorage; Phase 2 Supabase) ----

// One attempt at a single round item — powers accuracy, mastery, and (Phase 2)
// spaced review.
export interface Attempt {
  skill: Skill;
  themeId: string;
  /** True only when answered correctly on the first try. */
  firstTryCorrect: boolean;
  /** Hints/scaffolds shown before the correct answer (0, 1, or 2). */
  hintsUsed: number;
}

// Per-child progress within one theme island.
export interface ThemeProgress {
  themeId: string;
  /** Skills whose hut has been mastered (≈80%) and earned its sticker. */
  hutsMastered: Skill[];
  /** Sticker ids earned within this theme. */
  earnedStickerIds: string[];
  /** True once all 4 huts are mastered (theme-master milestone). */
  mastered: boolean;
}
