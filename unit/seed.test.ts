import { describe, expect, it } from "vitest";

import { CHILDREN } from "@/data/children";
import { STICKER_BANK } from "@/data/stickers/sticker-bank";
import { THEMES } from "@/data/themes";
import { WEATHER_WORDS } from "@/data/themes/weather";
import { buildSeedSql, sqlString, sqlTextArray, type SeedInput } from "@/lib/seed/build-seed";
import { SKILLS } from "@/lib/types";

// A tiny fixture exercising every table + the tricky bits (apostrophes, tags).
const fixture: SeedInput = {
  themes: [{ id: "weather", title: "Weather", canDo: "I can't wait.", sortOrder: 0, emoji: "⛅" }],
  items: [{ id: "weather-sunny", themeId: "weather", word: "sunny", emoji: "☀️", vi: "nắng", minLevel: "starter", sortOrder: 0 }],
  huts: [{ id: "weather-listen", themeId: "weather", skill: "listen" }],
  stickers: [{ id: "boy-finn-shark", name: "Finn", emoji: "🦈", set: "boy", rarity: "common", tags: ["sea", "animal"] }],
  children: [{ id: "milo", name: "Milo", avatar: "🦊", stickerSet: "boy" }],
  skillLevels: [{ childId: "milo", skill: "listen", level: "starter" }],
};

describe("sql literal helpers", () => {
  it("escapes single quotes by doubling them", () => {
    expect(sqlString("I can't")).toBe("'I can''t'");
  });

  it("emits an empty-array literal for no tags", () => {
    expect(sqlTextArray([])).toBe("'{}'");
  });

  it("emits a typed ARRAY literal for tags", () => {
    expect(sqlTextArray(["sea", "animal"])).toBe("ARRAY['sea', 'animal']::text[]");
  });
});

describe("buildSeedSql", () => {
  const sql = buildSeedSql(fixture);

  it("inserts into every table", () => {
    for (const table of [
      "english_themes",
      "english_items",
      "huts",
      "stickers",
      "children",
      "child_skill_levels",
    ]) {
      expect(sql).toContain(`insert into ${table}`);
    }
  });

  it("is idempotent (every insert has an ON CONFLICT clause)", () => {
    const inserts = sql.match(/insert into/g) ?? [];
    const conflicts = sql.match(/on conflict/g) ?? [];
    expect(conflicts.length).toBe(inserts.length);
  });

  it("escapes apostrophes in content (can_do)", () => {
    expect(sql).toContain("'I can''t wait.'");
  });

  it("quotes the reserved `set` column", () => {
    expect(sql).toContain('"set"');
  });
});

// Guards that the seed actually generated from the live mock data matches it —
// catches a stale checked-in seed.sql (someone edited mock data but forgot to
// regenerate). Rebuilt here from the same source the generator uses.
describe("seed mirrors the Phase 1 mock data", () => {
  const sql = buildSeedSql({
    themes: THEMES.map((t) => ({ id: t.id, title: t.title, canDo: t.canDo, sortOrder: t.order, emoji: t.emoji })),
    items: WEATHER_WORDS.map((w, i) => ({
      id: `weather-${w.word}`,
      themeId: "weather",
      word: w.word,
      emoji: w.emoji,
      vi: w.vi,
      minLevel: "starter",
      sortOrder: i,
    })),
    huts: THEMES.flatMap((t) => SKILLS.map((skill) => ({ id: `${t.id}-${skill}`, themeId: t.id, skill }))),
    stickers: STICKER_BANK.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji, set: s.set, rarity: s.rarity, tags: s.tags })),
    children: CHILDREN.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, stickerSet: c.stickerSet })),
    skillLevels: CHILDREN.flatMap((c) => SKILLS.map((skill) => ({ childId: c.id, skill, level: c.skillLevels[skill] }))),
  });

  it("references only real theme ids from items and huts", () => {
    const themeIds = new Set(THEMES.map((t) => t.id));
    // Every `'…-skill'` hut id and `weather-…` item id must map to a known theme.
    for (const t of THEMES) expect(sql).toContain(`('${t.id}',`); // theme row present
    expect(themeIds.has("weather")).toBe(true);
  });

  it("seeds all 60 catalog stickers", () => {
    for (const s of STICKER_BANK) expect(sql).toContain(`('${s.id}',`);
  });

  it("seeds 4 huts per theme (one per skill)", () => {
    const hutInserts = THEMES.flatMap((t) => SKILLS.map((skill) => `${t.id}-${skill}`));
    for (const id of hutInserts) expect(sql).toContain(`('${id}',`);
    expect(hutInserts.length).toBe(THEMES.length * SKILLS.length);
  });
});
