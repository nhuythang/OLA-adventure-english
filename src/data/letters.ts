// Single-<path> stroke guides for the Write hut L1 trace, in a 0–100 viewBox.
// Multi-stroke letters use multiple subpaths in one `d` (still one path, so
// getPointAtLength samples across them). Stylized but clearly readable as the
// letter — the printed letter label is shown alongside as the reference.
// Only the first letters of the Phase-1 Weather words are needed.
export const LETTER_PATHS: Record<string, string> = {
  S: "M72 30 C44 16 40 46 52 53 C66 60 60 86 30 74",
  R: "M36 78 L36 24 C70 24 70 52 40 52 L66 78",
  C: "M72 30 C40 18 40 84 72 74",
  W: "M24 26 L38 78 L50 44 L62 78 L76 26",
  H: "M32 24 L32 78 M68 24 L68 78 M32 51 L68 51",
};

const FALLBACK = "M25 50 C40 25 60 75 75 50";

// First letter (uppercase) of a word → its trace path, with a wavy fallback.
export function letterPath(word: string): string {
  const letter = (word[0] ?? "").toUpperCase();
  return LETTER_PATHS[letter] ?? FALLBACK;
}
