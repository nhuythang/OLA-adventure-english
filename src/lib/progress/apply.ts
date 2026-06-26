import { pickNextSticker } from "@/lib/engine/award";
import { SKILLS, type CharacterSticker, type Skill } from "@/lib/types";
import type { ChildProgress } from "./types";

// The outcome of finishing a hut: which sticker(s) it granted and whether it
// completed the whole theme. Drives the reward overlay.
export interface HutOutcome {
  /** The sticker granted for finishing this hut (null if already finished before). */
  newSticker: CharacterSticker | null;
  /** The legendary granted if this completion mastered the whole theme. */
  masterSticker: CharacterSticker | null;
  themeMastered: boolean;
}

// PURE transition: given the current progress, produce the next progress + the
// reward outcome. No IO — the backend (localStorage or Supabase) persists the
// result separately. Awards one sticker at a time, in order, idempotently:
// replaying a finished hut grants nothing new (rule 7 / spec §6).
export function applyHutResult(
  current: ChildProgress,
  stickerSet: CharacterSticker[],
  themeId: string,
  skill: Skill,
  mastered: boolean,
): { progress: ChildProgress; outcome: HutOutcome } {
  const p: ChildProgress = {
    earnedStickerIds: [...current.earnedStickerIds],
    completedHuts: { ...current.completedHuts },
    masteredHuts: { ...current.masteredHuts },
    masteredThemes: [...current.masteredThemes],
    skillLevels: { ...current.skillLevels },
  };

  let newSticker: CharacterSticker | null = null;
  const completed = p.completedHuts[themeId] ?? [];
  if (!completed.includes(skill)) {
    newSticker = pickNextSticker(stickerSet, p.earnedStickerIds);
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
    masterSticker = pickNextSticker(stickerSet, p.earnedStickerIds, { milestone: true });
    p.masteredThemes = [...p.masteredThemes, themeId];
    if (masterSticker) p.earnedStickerIds = [...p.earnedStickerIds, masterSticker.id];
  }

  return { progress: p, outcome: { newSticker, masterSticker, themeMastered } };
}
