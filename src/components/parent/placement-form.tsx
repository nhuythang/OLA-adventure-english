"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { childById } from "@/data/children";
import { Button } from "@/components/ui/button";
import { effectiveLevel, setSkillLevel } from "@/lib/storage";
import { useChildProgress } from "@/lib/use-child-progress";
import { cn } from "@/lib/cn";
import { SKILLS, type Level, type Skill } from "@/lib/types";
import { vi } from "@/i18n";

const p = vi.parent.placement;

// Parent questionnaire that sets each skill's level (task 22). One question per
// skill, three leveled can-do options; the highlighted option is the level in
// effect. Saving persists each changed skill via setSkillLevel (→ Supabase
// child_skill_levels under the parent session). Also the per-skill editor.
export function PlacementForm({ childId }: { childId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const progress = useChildProgress(childId);
  const [picked, setPicked] = useState<Partial<Record<Skill, Level>>>({});
  if (!child) return null;

  const levelFor = (skill: Skill): Level => picked[skill] ?? effectiveLevel(child, progress, skill);

  function save() {
    for (const skill of SKILLS) {
      const chosen = picked[skill];
      if (chosen && chosen !== effectiveLevel(child!, progress, skill)) setSkillLevel(childId, skill, chosen);
    }
    router.push("/parent");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">{p.title}</h1>
        <p className="mt-2 text-ink-muted">{p.intro}</p>
      </header>

      {SKILLS.map((skill) => {
        const current = levelFor(skill);
        return (
          <fieldset key={skill} className="rounded-3xl border border-border-soft bg-card p-4">
            <legend className="px-1 font-display font-semibold text-ink">{p.skills[skill].question}</legend>
            <div className="mt-2 flex flex-col gap-2">
              {p.skills[skill].options.map((opt) => {
                const selected = opt.level === current;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPicked((prev) => ({ ...prev, [skill]: opt.level }))}
                    className={cn(
                      "min-h-[52px] rounded-2xl border-2 px-4 text-left text-ink transition-transform duration-100 active:translate-y-[1px] motion-reduce:transition-none",
                      selected ? "border-teal-dark bg-teal/15 font-semibold" : "border-border-soft bg-cream",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="flex flex-col items-center gap-3">
        <Button type="button" onClick={save}>
          {p.save}
        </Button>
      </div>
    </div>
  );
}
