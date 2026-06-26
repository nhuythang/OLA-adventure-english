// Per-child progress. The PUBLIC API here is unchanged from Phase 1 so the
// screens/huts don't care where data lives. Underneath, the backend is chosen at
// runtime: Supabase when configured (production — read/written under the parent's
// session, RLS-scoped), else localStorage (dev:demo / e2e). Reads stay synchronous
// via an in-memory cache fed by `ensureProgressLoaded`; writes update the cache
// optimistically (instant reward) then persist to the active backend.
import { childById, CHILDREN } from "@/data/children";
import { stickersForSet } from "@/data/stickers/sticker-bank";
import { pickNextSticker } from "@/lib/engine/award";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { applyHutResult, type HutOutcome } from "@/lib/progress/apply";
import { emptyProgress, type ChildProgress } from "@/lib/progress/types";
import {
  clearRemote,
  loadRemote,
  persistHutResultRemote,
  persistSkillLevelRemote,
} from "@/lib/progress/remote";
import { type Attempt, type ChildProfile, type Level, type Skill } from "@/lib/types";

export type { ChildProgress } from "@/lib/progress/types";
export type { HutOutcome } from "@/lib/progress/apply";

// ---- Backend: localStorage (used only when Supabase is not configured) ----

const keyFor = (childId: string) => `ola:progress:${childId}`;

function readLocal(childId: string): ChildProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(keyFor(childId));
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<ChildProgress>;
    return {
      earnedStickerIds: parsed.earnedStickerIds ?? [],
      completedHuts: parsed.completedHuts ?? {},
      masteredHuts: parsed.masteredHuts ?? {},
      masteredThemes: parsed.masteredThemes ?? [],
      skillLevels: parsed.skillLevels ?? {},
    };
  } catch {
    return emptyProgress();
  }
}

function writeLocal(childId: string, progress: ChildProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(childId), JSON.stringify(progress));
  } catch {
    // storage full / unavailable — progress simply doesn't persist this session
  }
}

// ---- Reactive cache for useSyncExternalStore ----
const EMPTY_SHARED: ChildProgress = emptyProgress();
const snapshotCache = new Map<string, ChildProgress>();
const loadPromises = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setCache(childId: string, progress: ChildProgress): void {
  snapshotCache.set(childId, progress);
  notify();
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

// Load a child's progress into the cache from the active backend. Idempotent: the
// localStorage path is synchronous (filled on first read); the Supabase path is
// fetched once and de-duplicated by a per-child promise.
export function ensureProgressLoaded(childId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!isSupabaseConfigured) {
    if (!snapshotCache.has(childId)) setCache(childId, readLocal(childId));
    return Promise.resolve();
  }
  const existing = loadPromises.get(childId);
  if (existing) return existing;
  const promise = loadRemote(childId).then((p) => setCache(childId, p));
  loadPromises.set(childId, promise);
  return promise;
}

export function getProgressSnapshot(childId: string): ChildProgress {
  if (typeof window === "undefined") return EMPTY_SHARED;
  if (!snapshotCache.has(childId)) {
    // Supabase loads async (empty until ready); localStorage reads here, now.
    if (isSupabaseConfigured) return EMPTY_SHARED;
    setCache(childId, readLocal(childId));
  }
  return snapshotCache.get(childId) ?? EMPTY_SHARED;
}

export function getServerProgressSnapshot(): ChildProgress {
  return EMPTY_SHARED;
}

export function getProgress(childId: string): ChildProgress {
  return getProgressSnapshot(childId);
}

export function clearProgress(childId: string): void {
  snapshotCache.delete(childId);
  loadPromises.delete(childId);
  if (isSupabaseConfigured) {
    void clearRemote(childId);
  } else if (typeof window !== "undefined") {
    window.localStorage.removeItem(keyFor(childId));
  }
  notify();
}

export function clearAllProgress(): void {
  for (const child of CHILDREN) clearProgress(child.id);
}

// Record a finished hut: grant its next sticker (once), mark mastery, and — if all
// 4 huts are now mastered — grant the theme-master legendary. Updates the cache
// synchronously (so the reward overlay is instant) and persists to the backend.
// Idempotent: replaying a finished hut grants nothing new.
export function recordHutResult(
  childId: string,
  themeId: string,
  skill: Skill,
  mastered: boolean,
  attempts: readonly Attempt[] = [],
): HutOutcome {
  const child = childById(childId);
  if (!child) return { newSticker: null, masterSticker: null, themeMastered: false };

  const set = stickersForSet(child.stickerSet);
  const current = getProgressSnapshot(childId);
  const { progress, outcome } = applyHutResult(current, set, themeId, skill, mastered);

  setCache(childId, progress);
  if (isSupabaseConfigured) {
    void persistHutResultRemote(childId, themeId, skill, progress, outcome, attempts);
  } else {
    writeLocal(childId, progress);
  }
  return outcome;
}

// The next sticker the child will collect — for the motivation teaser.
export function nextStickerToCollect(childId: string): CharacterStickerOrNull {
  const child = childById(childId);
  if (!child) return null;
  return pickNextSticker(stickersForSet(child.stickerSet), getProgressSnapshot(childId).earnedStickerIds);
}
type CharacterStickerOrNull = ReturnType<typeof pickNextSticker>;

// ---- Read helpers used by the screens ----
export function earnedStickerIds(childId: string): string[] {
  return getProgressSnapshot(childId).earnedStickerIds;
}
export function masteredHuts(childId: string, themeId: string): Skill[] {
  return getProgressSnapshot(childId).masteredHuts[themeId] ?? [];
}
export function masteredThemeIds(childId: string): string[] {
  return getProgressSnapshot(childId).masteredThemes;
}

// ---- Per-skill level override (dev/parent toggle, task 16) ----
export function setSkillLevel(childId: string, skill: Skill, level: Level): void {
  const current = getProgressSnapshot(childId);
  const progress = { ...current, skillLevels: { ...current.skillLevels, [skill]: level } };
  setCache(childId, progress);
  if (isSupabaseConfigured) {
    void persistSkillLevelRemote(childId, skill, level);
  } else {
    writeLocal(childId, progress);
  }
}

// The level actually in effect for a skill: override if set, else the profile
// default. Pure — given the child and their progress.
export function effectiveLevel(child: ChildProfile, progress: ChildProgress, skill: Skill): Level {
  return progress.skillLevels[skill] ?? child.skillLevels[skill];
}
