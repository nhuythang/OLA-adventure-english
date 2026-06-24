import { Lock } from "lucide-react";
import type { CharacterSticker, StickerRarity } from "@/lib/types";
import { cn } from "@/lib/cn";

// Rarity → ring colour. Common uses a warm tan so it still reads as a "real"
// sticker rather than disabled-gray.
const RARITY_RING: Record<StickerRarity, string> = {
  common: "#C9B79B",
  rare: "#2BB3A3",
  epic: "#FF6B5E",
  legendary: "#FFC53D",
};

interface Props {
  sticker: CharacterSticker;
  /** Earned = puffy die-cut; not earned = dashed empty slot with a lock. */
  earned?: boolean;
  /** Diameter in px. */
  size?: number;
  /** Slight tilt (deg) for the scrapbook feel; pass varying values in a grid. */
  tilt?: number;
}

export function StickerBadge({ sticker, earned = true, size = 72, tilt = 0 }: Props) {
  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1" aria-label="Locked sticker">
        <div
          className="flex items-center justify-center rounded-full border-[3px] border-dashed border-border-soft text-border-soft"
          style={{ width: size, height: size }}
        >
          <Lock size={Math.round(size * 0.34)} aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${sticker.name} sticker`}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-4 border-white bg-white",
        )}
        style={{
          width: size,
          height: size,
          transform: `rotate(${tilt}deg)`,
          boxShadow: `0 0 0 3px ${RARITY_RING[sticker.rarity]}, 0 5px 12px rgba(43,42,51,0.2)`,
        }}
      >
        <span style={{ fontSize: Math.round(size * 0.46) }} aria-hidden>
          {sticker.emoji}
        </span>
      </div>
      <span className="font-display text-[11px] font-medium leading-tight text-ink">
        {sticker.name}
      </span>
    </div>
  );
}
