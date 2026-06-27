// Collectible character sticker bank.
//
// These are ORIGINAL mascot characters in a trendy cartoon style — NOT licensed
// IP (no Disney/Marvel/etc., which we can't ship and the spec forbids external
// art anyway). The `emoji` field is a placeholder visual for Phase 1; each
// character can be replaced with original SVG art later without changing ids.
//
// Stickers are the only reward currency (spec §6). When a child completes a hut
// or masters a theme, the reward flow (task 14) draws the next un-earned sticker
// from the child's chosen set. Rarity tiers add collectible appeal:
//   - common    → routine hut reward
//   - rare/epic → harder huts / review streaks
//   - legendary → theme-master milestone sticker
//
// `set` is the child's DEFAULT collection by gender, but it is meant to be
// child-selectable in settings (a girl can collect the "boy" set and vice
// versa) — not a hard lock.

import type { CharacterSticker, StickerSet } from "@/lib/types";

// ---- Boy default set (30) — heroes, machines, dinos, wild animals ----
export const BOY_STICKERS: CharacterSticker[] = [
  { id: "boy-captain-comet", name: "Captain Comet", emoji: "🦸", set: "boy", rarity: "legendary", tags: ["hero", "space"] },
  { id: "boy-emberon-dragon", name: "Emberon", emoji: "🐉", set: "boy", rarity: "legendary", tags: ["dragon", "fantasy"] },
  { id: "boy-bolt-9", name: "Bolt-9", emoji: "🤖", set: "boy", rarity: "epic", tags: ["robot", "machine"] },
  { id: "boy-rex-thunder", name: "Rex Thunder", emoji: "🦖", set: "boy", rarity: "epic", tags: ["dino"] },
  { id: "boy-shadow-ninja", name: "Shadow", emoji: "🥷", set: "boy", rarity: "epic", tags: ["ninja"] },
  { id: "boy-astro-sam", name: "Astro Sam", emoji: "👨‍🚀", set: "boy", rarity: "epic", tags: ["space"] },
  { id: "boy-merlin-jr", name: "Merlin Jr.", emoji: "🧙", set: "boy", rarity: "epic", tags: ["wizard", "fantasy"] },
  { id: "boy-turbo-dash", name: "Turbo Dash", emoji: "🏎️", set: "boy", rarity: "rare", tags: ["vehicle", "speed"] },
  { id: "boy-blaze-rocket", name: "Blaze", emoji: "🚀", set: "boy", rarity: "rare", tags: ["space", "vehicle"] },
  { id: "boy-sir-brave", name: "Sir Brave", emoji: "🛡️", set: "boy", rarity: "rare", tags: ["knight"] },
  { id: "boy-sparky-bot", name: "Sparky", emoji: "⚡", set: "boy", rarity: "rare", tags: ["robot", "energy"] },
  { id: "boy-zax-alien", name: "Zax", emoji: "👽", set: "boy", rarity: "rare", tags: ["alien", "space"] },
  { id: "boy-sky-eagle", name: "Sky", emoji: "🦅", set: "boy", rarity: "rare", tags: ["animal", "bird"] },
  { id: "boy-kong-mighty", name: "Kong", emoji: "🦍", set: "boy", rarity: "rare", tags: ["animal"] },
  { id: "boy-webster-spider", name: "Webster", emoji: "🕷️", set: "boy", rarity: "rare", tags: ["animal", "bug"] },
  { id: "boy-captain-octo", name: "Captain Octo", emoji: "🐙", set: "boy", rarity: "rare", tags: ["sea"] },
  { id: "boy-moby-whale", name: "Moby", emoji: "🐋", set: "boy", rarity: "rare", tags: ["sea"] },
  { id: "boy-finn-shark", name: "Finn", emoji: "🦈", set: "boy", rarity: "common", tags: ["sea", "animal"] },
  { id: "boy-leo-roar", name: "Leo", emoji: "🦁", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-tiger-bolt", name: "Tiger", emoji: "🐯", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-rusty-fox", name: "Rusty", emoji: "🦊", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-barnaby-bear", name: "Barnaby", emoji: "🐻", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-hopper-frog", name: "Hopper", emoji: "🐸", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-slither-snake", name: "Slither", emoji: "🐍", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-snappy-crab", name: "Snappy", emoji: "🦀", set: "boy", rarity: "common", tags: ["sea"] },
  { id: "boy-max-truck", name: "Max", emoji: "🚜", set: "boy", rarity: "common", tags: ["vehicle"] },
  { id: "boy-kick-striker", name: "Striker", emoji: "⚽", set: "boy", rarity: "common", tags: ["sports"] },
  { id: "boy-ollie-skater", name: "Ollie", emoji: "🛹", set: "boy", rarity: "common", tags: ["sports"] },
  { id: "boy-croc-drake", name: "Drake", emoji: "🐊", set: "boy", rarity: "common", tags: ["animal"] },
  { id: "boy-dash-dog", name: "Dash", emoji: "🐶", set: "boy", rarity: "common", tags: ["animal", "pet"] },
];

// ---- Girl default set (30) — royalty, fairies, magic, cute animals ----
export const GIRL_STICKERS: CharacterSticker[] = [
  { id: "girl-princess-lumi", name: "Princess Lumi", emoji: "👸", set: "girl", rarity: "legendary", tags: ["royalty"] },
  { id: "girl-stella-unicorn", name: "Stella", emoji: "🦄", set: "girl", rarity: "legendary", tags: ["unicorn", "fantasy"] },
  { id: "girl-faye-fairy", name: "Faye", emoji: "🧚", set: "girl", rarity: "epic", tags: ["fairy", "magic"] },
  { id: "girl-marina-mermaid", name: "Marina", emoji: "🧜‍♀️", set: "girl", rarity: "epic", tags: ["mermaid", "sea"] },
  { id: "girl-queen-petal", name: "Queen Petal", emoji: "🌸", set: "girl", rarity: "epic", tags: ["royalty", "flower"] },
  { id: "girl-luna-moon", name: "Luna", emoji: "🌙", set: "girl", rarity: "epic", tags: ["celestial", "magic"] },
  { id: "girl-wanda-wand", name: "Wanda", emoji: "🪄", set: "girl", rarity: "rare", tags: ["magic"] },
  { id: "girl-rosie-rainbow", name: "Rosie", emoji: "🌈", set: "girl", rarity: "rare", tags: ["nature", "color"] },
  { id: "girl-swan-grace", name: "Grace", emoji: "🦢", set: "girl", rarity: "rare", tags: ["animal", "bird"] },
  { id: "girl-della-dolphin", name: "Della", emoji: "🐬", set: "girl", rarity: "rare", tags: ["sea"] },
  { id: "girl-mimi-bird", name: "Mimi", emoji: "🐦", set: "girl", rarity: "rare", tags: ["animal", "bird"] },
  { id: "girl-sparkle-heart", name: "Sparkle", emoji: "💖", set: "girl", rarity: "rare", tags: ["magic", "love"] },
  { id: "girl-bella-butterfly", name: "Bella", emoji: "🦋", set: "girl", rarity: "common", tags: ["nature", "bug"] },
  { id: "girl-kiki-kitten", name: "Kiki", emoji: "🐱", set: "girl", rarity: "common", tags: ["animal", "pet"] },
  { id: "girl-twinkle-star", name: "Twinkle", emoji: "⭐", set: "girl", rarity: "common", tags: ["celestial"] },
  { id: "girl-coco-cupcake", name: "Coco", emoji: "🧁", set: "girl", rarity: "common", tags: ["treat"] },
  { id: "girl-daisy-deer", name: "Daisy", emoji: "🦌", set: "girl", rarity: "common", tags: ["animal"] },
  { id: "girl-bonnie-bunny", name: "Bonnie", emoji: "🐰", set: "girl", rarity: "common", tags: ["animal", "pet"] },
  { id: "girl-penny-pony", name: "Penny", emoji: "🐴", set: "girl", rarity: "common", tags: ["animal"] },
  { id: "girl-pia-panda", name: "Pia", emoji: "🐼", set: "girl", rarity: "common", tags: ["animal"] },
  { id: "girl-blossom-tulip", name: "Blossom", emoji: "🌷", set: "girl", rarity: "common", tags: ["nature", "flower"] },
  { id: "girl-lila-ladybug", name: "Lila", emoji: "🐞", set: "girl", rarity: "common", tags: ["nature", "bug"] },
  { id: "girl-cleo-cloud", name: "Cleo", emoji: "☁️", set: "girl", rarity: "common", tags: ["sky"] },
  { id: "girl-tilly-teacup", name: "Tilly", emoji: "🫖", set: "girl", rarity: "common", tags: ["treat"] },
  { id: "girl-gigi-giraffe", name: "Gigi", emoji: "🦒", set: "girl", rarity: "common", tags: ["animal"] },
  { id: "girl-ellie-elephant", name: "Ellie", emoji: "🐘", set: "girl", rarity: "common", tags: ["animal"] },
  { id: "girl-honey-bee", name: "Honey", emoji: "🐝", set: "girl", rarity: "common", tags: ["nature", "bug"] },
  { id: "girl-polly-penguin", name: "Polly", emoji: "🐧", set: "girl", rarity: "common", tags: ["animal"] },
  { id: "girl-hazel-hamster", name: "Hazel", emoji: "🐹", set: "girl", rarity: "common", tags: ["animal", "pet"] },
  { id: "girl-shelly-shell", name: "Shelly", emoji: "🐚", set: "girl", rarity: "common", tags: ["sea"] },
];

export const STICKER_BANK: CharacterSticker[] = [...BOY_STICKERS, ...GIRL_STICKERS];

export function stickersForSet(set: StickerSet): CharacterSticker[] {
  return set === "boy" ? BOY_STICKERS : GIRL_STICKERS;
}

export function stickerById(id: string): CharacterSticker | undefined {
  return STICKER_BANK.find((s) => s.id === id);
}
