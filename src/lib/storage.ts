// Per-child progress persistence. Phase 1 = localStorage, keyed by child id;
// Supabase replaces this in task 19. SSR-safe: every read returns empty defaults
// on the server, so screens hydrate without a mismatch (load in an effect).
import { childById, CHILDREN } from "@/data/children";
import { stickersForSet } from "@/data/stickers/sticker-bank";
import { pickNextSticker } from "@/lib/engine/award";
import { SKILLS, type CharacterSticker, type ChildProfile, type Level, type Skill } from "@/lib/types";

export interface ChildProgress {
  /** Ordered list of earned sticker ids — drives the one-by-one progression. */
  earnedStickerIds: string[];
  /** Huts that have been finished (and so already granted their sticker). */
  completedHuts: Record<string, Skill[]>;
  /** Huts finished at ≥80% — counts toward the theme-master milestone. */
  masteredHuts: Record<string, Skill[]>;
  /** Themes whose 4 huts are all mastered (master sticker granted, next unlocked). */
  masteredThemes: string[];
  /** Per-skill level overrides (dev/parent toggle); falls back to the profile default. */
  skillLevels: Partial<Record<Skill, Level>>;
}

function empty(): ChildProgress {
  return { earnedStickerIds: [], completedHuts: {}, masteredHuts: {}, masteredThemes: [], skillLevels: {} };
}

const keyFor = (childId: string) => `ola:progress:${childId}`;

function read(childId: string): ChildProgress {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(keyFor(childId));
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<ChildProgress>;
    return {
      earnedStickerIds: parsed.earnedStickerIds ?? [],
      completedHuts: parsed.completedHuts ?? {},
      masteredHuts: parsed.masteredHuts ?? {},
      masteredThemes: parsed.masteredThemes ?? [],
      skillLevels: parsed.skillLevels ?? {},
    };
  } catch {
    return empty();
  }
}

function write(childId: string, progress: ChildProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(childId), JSON.stringify(progress));
  } catch {
    // storage full / unavailable — progress simply doesn't persist this session
  }
  snapshotCache.set(childId, progress);
  notify();
}

export function getProgress(childId: string): ChildProgress {
  return read(childId);
}

export function clearProgress(childId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(keyFor(childId));
  snapshotCache.delete(childId);
  notify();
}

// ---- Reactive snapshot for useSyncExternalStore (see use-child-progress) ----
// A stable empty value for the server/hydration render, and a per-child cache so
// getSnapshot returns a referentially-stable object until progress changes.
const EMPTY_SHARED: ChildProgress = empty();
const snapshotCache = new Map<string, ChildProgress>();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

export function subscribeProgress(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = () => {
    snapshotCache.clear();
    onChange();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function getProgressSnapshot(childId: string): ChildProgress {
  if (typeof window === "undefined") return EMPTY_SHARED;
  if (!snapshotCache.has(childId)) snapshotCache.set(childId, read(childId));
  return snapshotCache.get(childId)!;
}

export function getServerProgressSnapshot(): ChildProgress {
  return EMPTY_SHARED;
}

// Dev affordance — wipe every child's progress.
export function clearAllProgress(): void {
  for (const child of CHILDREN) clearProgress(child.id);
}

export interface HutOutcome {
  /** The sticker granted for finishing this hut (null if already finished before). */
  newSticker: CharacterSticker | null;
  /** The legendary granted if this completion mastered the whole theme. */
  masterSticker: CharacterSticker | null;
  themeMastered: boolean;
}

// Record a finished hut: grant its next sticker (once), mark mastery, and — if
// all 4 huts are now mastered — grant the theme-master legendary. Idempotent:
// replaying a finished hut grants nothing new.
export function recordHutResult(
  childId: string,
  themeId: string,
  skill: Skill,
  mastered: boolean,
): HutOutcome {
  const child = childById(childId);
  if (!child) return { newSticker: null, masterSticker: null, themeMastered: false };
  const set = stickersForSet(child.stickerSet);
  const p = read(childId);

  let newSticker: CharacterSticker | null = null;
  const completed = p.completedHuts[themeId] ?? [];
  if (!completed.includes(skill)) {
    newSticker = pickNextSticker(set, p.earnedStickerIds);
    p.completedHuts[themeId] = [...completed, skill];
    if (newSticker) p.earnedStickerIds = [...p.earnedStickerIds, newSticker.id];
  }

  if (mastered) {
    const m = p.masteredHuts[themeId] ?? [];
    if (!m.includes(skill)) p.masteredHuts[themeId] = [...m, skill];
  }

  let masterSticker: CharacterSticker | null = null;
  let themeMastered = false;
  const mh = p.masteredHuts[themeId] ?? [];
  if (SKILLS.every((s) => mh.includes(s)) && !p.masteredThemes.includes(themeId)) {
    themeMastered = true;
    masterSticker = pickNextSticker(set, p.earnedStickerIds, { milestone: true });
    p.masteredThemes = [...p.masteredThemes, themeId];
    if (masterSticker) p.earnedStickerIds = [...p.earnedStickerIds, masterSticker.id];
  }

  write(childId, p);
  return { newSticker, masterSticker, themeMastered };
}

// The next sticker the child will collect — for the motivation teaser.
export function nextStickerToCollect(childId: string): CharacterSticker | null {
  const child = childById(childId);
  if (!child) return null;
  return pickNextSticker(stickersForSet(child.stickerSet), read(childId).earnedStickerIds);
}

// ---- Read helpers used by the screens ----
export function earnedStickerIds(childId: string): string[] {
  return read(childId).earnedStickerIds;
}
export function masteredHuts(childId: string, themeId: string): Skill[] {
  return read(childId).masteredHuts[themeId] ?? [];
}
export function masteredThemeIds(childId: string): string[] {
  return read(childId).masteredThemes;
}

// ---- Per-skill level override (dev/parent toggle, task 16) ----
export function setSkillLevel(childId: string, skill: Skill, level: Level): void {
  const p = read(childId);
  p.skillLevels = { ...p.skillLevels, [skill]: level };
  write(childId, p);
}

// The level actually in effect for a skill: override if set, else the profile
// default. Pure — given the child and their progress.
export function effectiveLevel(child: ChildProfile, progress: ChildProgress, skill: Skill): Level {
  return progress.skillLevels[skill] ?? child.skillLevels[skill];
}
