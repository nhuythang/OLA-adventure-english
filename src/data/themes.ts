// Theme islands. Weather is the Phase-1 vertical slice; the rest are visible
// but locked, so the map shows where the adventure goes next. `emoji` is
// placeholder island art (content), replaceable with SVG scenes later.
import type { Theme } from "@/lib/types";

export const THEMES: Theme[] = [
  { id: "weather", title: "Weather", canDo: "I can name the weather.", order: 0, emoji: "⛅" },
  { id: "animals", title: "Animals", canDo: "I can name farm and wild animals.", order: 1, emoji: "🦁" },
  { id: "food", title: "Food", canDo: "I can name food I like.", order: 2, emoji: "🍎" },
  { id: "colors", title: "Colors", canDo: "I can name the colors.", order: 3, emoji: "🌈" },
  // Grammar island (G1 MVP): plurals + present continuous. Always unlocked (see
  // isThemeUnlocked) so it can be handed straight to the kids, independent of the
  // vocab islands' sequential progression.
  { id: "grammar", title: "Grammar", canDo: "I can show one and many, and what's happening.", order: 4, emoji: "🪄" },
];

export function themeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

// An island is unlocked if it's the first one or the previous island is
// mastered. Phase 1 has no mastery yet, so only Weather is open. Real progress
// arrives with persistence (task 15).
export function isThemeUnlocked(theme: Theme, masteredThemeIds: readonly string[]): boolean {
  // The Grammar island is always open (G1 MVP) — not gated behind vocab mastery.
  if (theme.id === "grammar") return true;
  if (theme.order === 0) return true;
  const prev = THEMES.find((t) => t.order === theme.order - 1);
  return prev ? masteredThemeIds.includes(prev.id) : false;
}
