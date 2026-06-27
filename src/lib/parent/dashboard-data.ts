// Pure aggregation for the parent dashboard (task 24). Turns the raw Supabase
// rows into a per-child summary the view renders. Kept IO-free so it's
// unit-tested without a database (the page does the querying).
import { SKILLS, type Level, type Skill, type StickerSet } from "@/lib/types";

// ---- Raw row shapes (match the selected columns) ----
export interface ChildRow {
  id: string;
  name: string;
  avatar: string;
  sticker_set: StickerSet;
}
export interface SkillLevelRow {
  child_id: string;
  skill: Skill;
  level: Level;
}
export interface HutProgressRow {
  child_id: string;
  theme_id: string;
  skill: Skill;
  completed: boolean;
  mastered: boolean;
}
export interface ThemeMasteryRow {
  child_id: string;
  theme_id: string;
}
export interface EarnedStickerRow {
  child_id: string;
  sticker_id: string;
  seq: number;
}
export interface AttemptRow {
  child_id: string;
  hut_id: string; // `${themeId}-${skill}`
  first_try_correct: boolean;
}

// ---- Output ----
export interface SkillStat {
  level: Level;
  attempts: number;
  /** First-try-correct %, or null when the child hasn't played the skill yet. */
  firstTryPct: number | null;
}
export interface ThemeStat {
  themeId: string;
  title: string;
  hutsMastered: number;
  mastered: boolean;
}
export interface ChildDashboard {
  id: string;
  name: string;
  avatar: string;
  stickerSet: StickerSet;
  skills: Record<Skill, SkillStat>;
  themes: ThemeStat[];
  earnedStickerIds: string[];
}
export interface DashboardData {
  children: ChildDashboard[];
}

export interface SummarizeInput {
  children: ChildRow[];
  skillLevels: SkillLevelRow[];
  hutProgress: HutProgressRow[];
  themeMastery: ThemeMasteryRow[];
  earnedStickers: EarnedStickerRow[];
  attempts: AttemptRow[];
  /** Themes (with content) to report on, in display order. */
  themes: { id: string; title: string }[];
}

export function summarize(input: SummarizeInput): DashboardData {
  const children = input.children.map((c): ChildDashboard => {
    const skills = {} as Record<Skill, SkillStat>;
    for (const skill of SKILLS) {
      const level = input.skillLevels.find((r) => r.child_id === c.id && r.skill === skill)?.level ?? "starter";
      const mine = input.attempts.filter((a) => a.child_id === c.id && a.hut_id.endsWith(`-${skill}`));
      const correct = mine.filter((a) => a.first_try_correct).length;
      skills[skill] = {
        level,
        attempts: mine.length,
        firstTryPct: mine.length > 0 ? Math.round((100 * correct) / mine.length) : null,
      };
    }

    const themes = input.themes.map((t): ThemeStat => ({
      themeId: t.id,
      title: t.title,
      hutsMastered: input.hutProgress.filter((h) => h.child_id === c.id && h.theme_id === t.id && h.mastered).length,
      mastered: input.themeMastery.some((m) => m.child_id === c.id && m.theme_id === t.id),
    }));

    const earnedStickerIds = input.earnedStickers
      .filter((s) => s.child_id === c.id)
      .sort((a, b) => a.seq - b.seq)
      .map((s) => s.sticker_id);

    return { id: c.id, name: c.name, avatar: c.avatar, stickerSet: c.sticker_set, skills, themes, earnedStickerIds };
  });

  return { children };
}
