import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import type { Attempt, Skill } from "@/lib/types";
import { emptyProgress, type ChildProgress } from "./types";
import type { HutOutcome } from "./apply";

// Supabase backend for child progress. Used only in the browser, under the
// signed-in parent's session — RLS scopes every row to the parent who owns the
// child. All writes are best-effort: a failure logs but never blocks the child
// (the in-memory cache already reflects the change optimistically).

let cached: SupabaseClient | null = null;
function client(): SupabaseClient | null {
  if (!isSupabaseConfigured || typeof window === "undefined") return null;
  cached ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}

interface StickerRow {
  sticker_id: string;
}
interface HutRow {
  theme_id: string;
  skill: Skill;
  completed: boolean;
  mastered: boolean;
}
interface ThemeRow {
  theme_id: string;
}
interface LevelRow {
  skill: Skill;
  level: ChildProgress["skillLevels"][Skill];
}

// Assemble ChildProgress from the four per-child tables.
export async function loadRemote(childId: string): Promise<ChildProgress> {
  const supabase = client();
  if (!supabase) return emptyProgress();

  const [stickers, huts, themes, levels] = await Promise.all([
    supabase.from("earned_stickers").select("sticker_id").eq("child_id", childId).order("seq"),
    supabase.from("hut_progress").select("theme_id, skill, completed, mastered").eq("child_id", childId),
    supabase.from("theme_mastery").select("theme_id").eq("child_id", childId),
    supabase.from("child_skill_levels").select("skill, level").eq("child_id", childId),
  ]);

  const progress = emptyProgress();
  progress.earnedStickerIds = ((stickers.data ?? []) as StickerRow[]).map((r) => r.sticker_id);

  for (const row of (huts.data ?? []) as HutRow[]) {
    if (row.completed) (progress.completedHuts[row.theme_id] ??= []).push(row.skill);
    if (row.mastered) (progress.masteredHuts[row.theme_id] ??= []).push(row.skill);
  }
  progress.masteredThemes = ((themes.data ?? []) as ThemeRow[]).map((r) => r.theme_id);

  for (const row of (levels.data ?? []) as LevelRow[]) {
    if (row.level) progress.skillLevels[row.skill] = row.level;
  }
  return progress;
}

// Persist the result of one finished hut. `after` is the new full progress, used
// to derive the stable sticker order + final mastered flag (never downgrades).
export async function persistHutResultRemote(
  childId: string,
  themeId: string,
  skill: Skill,
  after: ChildProgress,
  outcome: HutOutcome,
  attempts: readonly Attempt[],
): Promise<void> {
  const supabase = client();
  if (!supabase) return;

  const earned = [outcome.newSticker, outcome.masterSticker].filter((s) => s !== null);
  const stickerRows = earned.map((s) => ({
    child_id: childId,
    sticker_id: s.id,
    theme_id: themeId,
    seq: after.earnedStickerIds.indexOf(s.id),
  }));

  const writes: PromiseLike<unknown>[] = [
    supabase
      .from("hut_progress")
      .upsert(
        {
          child_id: childId,
          theme_id: themeId,
          skill,
          completed: (after.completedHuts[themeId] ?? []).includes(skill),
          mastered: (after.masteredHuts[themeId] ?? []).includes(skill),
        },
        { onConflict: "child_id,theme_id,skill" },
      ),
  ];

  if (stickerRows.length > 0) {
    writes.push(supabase.from("earned_stickers").upsert(stickerRows, { onConflict: "child_id,sticker_id", ignoreDuplicates: true }));
  }
  if (outcome.themeMastered) {
    writes.push(supabase.from("theme_mastery").upsert({ child_id: childId, theme_id: themeId }, { onConflict: "child_id,theme_id", ignoreDuplicates: true }));
  }
  if (attempts.length > 0) {
    writes.push(
      supabase.from("learning_attempts").insert(
        attempts.map((a) => ({
          child_id: childId,
          hut_id: `${themeId}-${skill}`,
          first_try_correct: a.firstTryCorrect,
          hints_used: a.hintsUsed,
        })),
      ),
    );
  }

  const results = await Promise.all(writes);
  for (const r of results) reportError(r);
}

export async function persistSkillLevelRemote(
  childId: string,
  skill: Skill,
  level: NonNullable<ChildProgress["skillLevels"][Skill]>,
): Promise<void> {
  const supabase = client();
  if (!supabase) return;
  const r = await supabase.from("child_skill_levels").upsert({ child_id: childId, skill, level }, { onConflict: "child_id,skill" });
  reportError(r);
}

// Dev reset — wipe earned progress (leaves skill levels, which are settings).
export async function clearRemote(childId: string): Promise<void> {
  const supabase = client();
  if (!supabase) return;
  await Promise.all([
    supabase.from("earned_stickers").delete().eq("child_id", childId),
    supabase.from("hut_progress").delete().eq("child_id", childId),
    supabase.from("theme_mastery").delete().eq("child_id", childId),
    supabase.from("learning_attempts").delete().eq("child_id", childId),
  ]);
}

function reportError(result: unknown): void {
  const error = (result as { error?: { message?: string } } | null)?.error;
  if (error) console.error("[progress] supabase write failed:", error.message);
}
