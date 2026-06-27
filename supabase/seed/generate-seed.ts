// Regenerates supabase/seed.sql from the Phase 1 mock data so the database seed
// can never silently drift from what the app ships. Run after editing any of the
// mock data files (themes, weather words, children, sticker bank):
//
//   npx tsx supabase/seed/generate-seed.ts
//
// tsx resolves the "@/*" tsconfig paths, so this imports the real app data — the
// single source of truth — rather than duplicating it.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { CHILDREN } from "@/data/children";
import { themeContent } from "@/data/themes/content";
import { STICKER_BANK } from "@/data/stickers/sticker-bank";
import { THEMES } from "@/data/themes";
import { buildSeedSql, type SeedInput } from "@/lib/seed/build-seed";
import { SKILLS, type Level } from "@/lib/types";

// Seed items for every theme that has content (Weather, Animals; food/colors are
// still empty). A word's min_level is the lowest level whose pool includes it.
const items = THEMES.flatMap((t) => {
  const content = themeContent(t.id);
  if (!content) return [];
  const starter = new Set(content.wordsForLevel("starter").map((w) => w.word));
  return content.wordsForLevel("flyer").map((w, i) => ({
    id: `${t.id}-${w.word}`,
    themeId: t.id,
    word: w.word,
    emoji: w.emoji,
    vi: w.vi,
    minLevel: (starter.has(w.word) ? "starter" : "mover") as Level,
    sortOrder: i,
  }));
});

const input: SeedInput = {
  themes: THEMES.map((t) => ({
    id: t.id,
    title: t.title,
    canDo: t.canDo,
    sortOrder: t.order,
    emoji: t.emoji,
  })),

  items,

  // Every theme has the same 4 skill huts.
  huts: THEMES.flatMap((t) => SKILLS.map((skill) => ({ id: `${t.id}-${skill}`, themeId: t.id, skill }))),

  stickers: STICKER_BANK.map((s) => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji,
    set: s.set,
    rarity: s.rarity,
    tags: s.tags,
  })),

  children: CHILDREN.map((c) => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    stickerSet: c.stickerSet,
  })),

  skillLevels: CHILDREN.flatMap((c) =>
    SKILLS.map((skill) => ({ childId: c.id, skill, level: c.skillLevels[skill] })),
  ),
};

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "seed.sql");
writeFileSync(outPath, buildSeedSql(input), "utf8");

console.log(
  `Wrote ${outPath}: ${input.themes.length} themes, ${input.items.length} items, ${input.huts.length} huts, ` +
    `${input.stickers.length} stickers, ${input.children.length} children, ${input.skillLevels.length} skill levels.`,
);
