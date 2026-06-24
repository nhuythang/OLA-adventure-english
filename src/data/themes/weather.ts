// Weather theme vocabulary — the Phase-1 vertical slice. `vi` is for the
// parent/teacher surfaces, never shown on child screens. Task 13 expands this
// (more words, per-level sentence content for Flyer).
export interface VocabWord {
  word: string;
  emoji: string;
  vi: string;
}

export const WEATHER_WORDS: VocabWord[] = [
  { word: "sunny", emoji: "☀️", vi: "nắng" },
  { word: "rainy", emoji: "🌧️", vi: "mưa" },
  { word: "cloudy", emoji: "☁️", vi: "nhiều mây" },
  { word: "windy", emoji: "🌬️", vi: "gió" },
  { word: "snowy", emoji: "❄️", vi: "tuyết" },
  { word: "stormy", emoji: "⛈️", vi: "bão" },
  { word: "hot", emoji: "🥵", vi: "nóng" },
  { word: "cold", emoji: "🥶", vi: "lạnh" },
];
