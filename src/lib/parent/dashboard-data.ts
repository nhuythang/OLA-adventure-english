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
  /** `${themeId}-${itemId}` (G4), e.g. "grammar-plurals-cat" — null for older rows. */
  item_id: string | null;
}
export interface GrammarStructureRow {
  id: string;
  title: string;
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
export interface GrammarStat {
  id: string;
  title: string;
  attempts: number;
  /** First-try-correct %, or null when the child hasn't played this structure yet. */
  firstTryPct: number | null;
}
export interface MissedItem {
  structureId: string;
  structureTitle: string;
  /** The item's own slug within its structure, e.g. "cat" (grammar-plurals-cat
   *  with the theme + structure prefix stripped) — not the full sentence/prompt,
   *  so this stays content-agnostic (see the file header). */
  itemSlug: string;
  misses: number;
}
export interface GrammarDashboard {
  structures: GrammarStat[];
  /** Highest-miss-count items first, capped to a short list (G6). */
  mostMissed: MissedItem[];
}
export interface ChildDashboard {
  id: string;
  name: string;
  avatar: string;
  stickerSet: StickerSet;
  skills: Record<Skill, SkillStat>;
  themes: ThemeStat[];
  earnedStickerIds: string[];
  grammar: GrammarDashboard;
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
  /** Grammar structures (with parent-facing titles) to report on, in order. */
  grammarStructures: GrammarStructureRow[];
}

const GRAMMAR_ITEM_PREFIX = "grammar-";
const MOST_MISSED_LIMIT = 5;

// Which known structure a grammar item_id belongs to, e.g.
// "grammar-present-continuous-run" -> structure "present-continuous", item
// slug "run". Structure ids can themselves contain hyphens, so this matches
// against the KNOWN structure list rather than naively splitting on "-".
function parseGrammarItemId(
  itemId: string,
  structures: readonly GrammarStructureRow[],
): { structureId: string; itemSlug: string } | null {
  if (!itemId.startsWith(GRAMMAR_ITEM_PREFIX)) return null;
  const rest = itemId.slice(GRAMMAR_ITEM_PREFIX.length);
  for (const s of structures) {
    if (rest.startsWith(`${s.id}-`)) return { structureId: s.id, itemSlug: rest.slice(s.id.length + 1) };
  }
  return null;
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

    // Grammar (G6): per-structure mastery + most-missed items, from the same
    // attempts already fetched for the skill stats above.
    const grammarAttempts = input.attempts.filter((a) => a.child_id === c.id && a.item_id?.startsWith(GRAMMAR_ITEM_PREFIX));

    const structures = input.grammarStructures.map((s): GrammarStat => {
      const mine = grammarAttempts.filter((a) => parseGrammarItemId(a.item_id!, input.grammarStructures)?.structureId === s.id);
      const correct = mine.filter((a) => a.first_try_correct).length;
      return {
        id: s.id,
        title: s.title,
        attempts: mine.length,
        firstTryPct: mine.length > 0 ? Math.round((100 * correct) / mine.length) : null,
      };
    });

    const missCounts = new Map<string, { structureId: string; itemSlug: string; misses: number }>();
    for (const a of grammarAttempts) {
      if (a.first_try_correct) continue;
      const parsed = parseGrammarItemId(a.item_id!, input.grammarStructures);
      if (!parsed) continue;
      const entry = missCounts.get(a.item_id!) ?? { ...parsed, misses: 0 };
      entry.misses += 1;
      missCounts.set(a.item_id!, entry);
    }
    const mostMissed: MissedItem[] = [...missCounts.values()]
      .sort((a, b) => b.misses - a.misses)
      .slice(0, MOST_MISSED_LIMIT)
      .map((m) => ({
        structureId: m.structureId,
        structureTitle: input.grammarStructures.find((s) => s.id === m.structureId)?.title ?? m.structureId,
        itemSlug: m.itemSlug,
        misses: m.misses,
      }));

    const grammar: GrammarDashboard = { structures, mostMissed };

    return { id: c.id, name: c.name, avatar: c.avatar, stickerSet: c.sticker_set, skills, themes, earnedStickerIds, grammar };
  });

  return { children };
}
