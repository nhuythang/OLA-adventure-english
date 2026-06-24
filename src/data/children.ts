// Pre-seeded child profiles (Phase 1 mock — no creation UI). Edit here to add
// or retune children. Per-skill levels let one engine adapt across the 4–7 band.
import type { ChildProfile } from "@/lib/types";

export const CHILDREN: ChildProfile[] = [
  {
    id: "milo",
    name: "Milo",
    avatar: "🦊",
    stickerSet: "boy",
    // ~4yo pre-reader: starter everywhere; writing is the slowest skill.
    skillLevels: {
      listen: "starter",
      speak: "starter",
      read: "starter",
      write: "starter",
    },
  },
  {
    id: "sunny",
    name: "Sunny",
    avatar: "🐰",
    stickerSet: "girl",
    // ~6yo emergent reader: mover on listen/read/speak, starter on write.
    skillLevels: {
      listen: "mover",
      speak: "mover",
      read: "mover",
      write: "starter",
    },
  },
];

export function childById(id: string): ChildProfile | undefined {
  return CHILDREN.find((c) => c.id === id);
}
