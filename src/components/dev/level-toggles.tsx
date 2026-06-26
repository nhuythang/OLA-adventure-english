"use client";

import { childById } from "@/data/children";
import { useChildProgress } from "@/lib/use-child-progress";
import { effectiveLevel, setSkillLevel } from "@/lib/storage";
import { SKILLS, type Level, type Skill } from "@/lib/types";

const SKILL_LABEL: Record<Skill, string> = {
  listen: "Listen",
  speak: "Speak",
  read: "Read",
  write: "Write",
};
const LEVEL_LABEL: Record<Level, string> = { starter: "Starter", mover: "Mover", flyer: "Flyer" };
// Cycle Starter → Mover → Flyer → Starter (all three mechanics ship as of task 20).
const NEXT: Record<Level, Level> = { starter: "mover", mover: "flyer", flyer: "starter" };

// Dev/parent affordance to flip a child's per-skill level for testing, without
// editing children.ts. Moves into the PIN-gated parent area in a later phase.
export function LevelToggles({ childId }: { childId: string }) {
  const child = childById(childId);
  const progress = useChildProgress(childId);
  if (!child) return null;

  return (
    <div className="mt-8 border-t border-border-soft pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Levels (dev)</p>
      <div className="flex flex-wrap gap-2">
        {SKILLS.map((skill) => {
          const level = effectiveLevel(child, progress, skill);
          return (
            <button
              key={skill}
              type="button"
              data-testid={`level-${skill}`}
              aria-label={`${SKILL_LABEL[skill]} level ${LEVEL_LABEL[level]}, tap to change`}
              onClick={() => setSkillLevel(childId, skill, NEXT[level])}
              className="flex items-center gap-2 rounded-full border border-border-soft bg-card px-3 py-2 text-xs font-semibold"
            >
              <span className="text-ink-muted">{SKILL_LABEL[skill]}</span>
              <span className="rounded-full bg-cream px-2 py-0.5 text-ink">{LEVEL_LABEL[level]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
