import { describe, it, expect } from "vitest";
import { effectiveLevel, type ChildProgress } from "@/lib/storage";
import type { ChildProfile } from "@/lib/types";

const child: ChildProfile = {
  id: "kid",
  name: "Kid",
  avatar: "🦊",
  stickerSet: "boy",
  skillLevels: { listen: "starter", speak: "starter", read: "mover", write: "starter" },
};

function progress(skillLevels: ChildProgress["skillLevels"]): ChildProgress {
  return { earnedStickerIds: [], completedHuts: {}, masteredHuts: {}, masteredThemes: [], skillLevels };
}

describe("effectiveLevel", () => {
  it("uses the profile default when there is no override", () => {
    expect(effectiveLevel(child, progress({}), "listen")).toBe("starter");
    expect(effectiveLevel(child, progress({}), "read")).toBe("mover");
  });

  it("uses the override when set", () => {
    expect(effectiveLevel(child, progress({ listen: "mover" }), "listen")).toBe("mover");
    expect(effectiveLevel(child, progress({ read: "starter" }), "read")).toBe("starter");
  });

  it("overrides are per-skill — others keep their default", () => {
    const p = progress({ write: "mover" });
    expect(effectiveLevel(child, p, "write")).toBe("mover");
    expect(effectiveLevel(child, p, "listen")).toBe("starter");
  });
});
