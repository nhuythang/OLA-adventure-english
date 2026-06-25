"use client";

import { useRouter } from "next/navigation";
import { Ear, Mic, BookOpen, Pencil, Check, Star, type LucideIcon } from "lucide-react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ViewTransitionLink } from "@/components/game/view-transition-link";
import { childById } from "@/data/children";
import { themeById } from "@/data/themes";
import { useChildProgress } from "@/lib/use-child-progress";
import { SKILLS, type Level, type Skill } from "@/lib/types";

const HUT: Record<Skill, { label: string; icon: LucideIcon; accent: string }> = {
  listen: { label: "Listen", icon: Ear, accent: "bg-teal/20 text-teal-dark" },
  speak: { label: "Speak", icon: Mic, accent: "bg-coral/20 text-coral-dark" },
  read: { label: "Read", icon: BookOpen, accent: "bg-gold/25 text-gold-dark" },
  write: { label: "Write", icon: Pencil, accent: "bg-success/20 text-success-dark" },
};

const LEVEL_LABEL: Record<Level, string> = {
  starter: "Starter",
  mover: "Mover",
  flyer: "Flyer",
};

export function IslandScreen({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const theme = themeById(themeId);
  const progress = useChildProgress(childId);
  if (!child || !theme) return null;

  const done = new Set(progress.masteredHuts[themeId] ?? []);
  const allDone = SKILLS.every((s) => done.has(s));

  return (
    <TabletShell>
      <ScreenHeader onBack={() => router.push(`/child/${childId}/map`)} title={`${theme.title} island`} />

      <div className="flex items-center gap-3 pt-1">
        <span className="text-5xl" aria-hidden>
          {theme.emoji}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{theme.title}</h1>
          <p className="text-sm font-semibold text-ink-muted">{theme.canDo}</p>
        </div>
      </div>

      {allDone && (
        <div className="mt-4 flex items-center gap-2 rounded-[20px] bg-[#FFF1CF] px-4 py-3 font-display font-semibold text-gold-dark">
          <Star size={22} aria-hidden />
          Island mastered — you earned the big sticker!
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        {SKILLS.map((skill) => {
          const meta = HUT[skill];
          const Icon = meta.icon;
          const isDone = done.has(skill);
          const level = child.skillLevels[skill];
          return (
            <ViewTransitionLink
              key={skill}
              href={`/child/${childId}/island/${themeId}/${skill}`}
              aria-label={`${meta.label} hut`}
              className="relative flex flex-col items-center gap-3 rounded-[24px] bg-card px-4 py-6 shadow-[0_6px_0_#E7DFD2] active:translate-y-[2px] active:shadow-[0_4px_0_#E7DFD2] transition-transform duration-100 motion-reduce:transition-none"
            >
              <span className={`grid h-20 w-20 place-items-center rounded-full ${meta.accent}`} aria-hidden>
                <Icon size={40} />
              </span>
              <span className="font-display text-xl font-semibold text-ink">{meta.label}</span>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink-muted">
                {LEVEL_LABEL[level]}
              </span>
              {isDone && (
                <span
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-success text-white"
                  aria-label="Hut done"
                >
                  <Check size={20} strokeWidth={3} aria-hidden />
                </span>
              )}
            </ViewTransitionLink>
          );
        })}
      </div>
    </TabletShell>
  );
}
