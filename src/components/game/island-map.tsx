"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ViewTransitionLink } from "@/components/game/view-transition-link";
import { childById } from "@/data/children";
import { THEMES, isThemeUnlocked } from "@/data/themes";
import { useChildProgress } from "@/lib/use-child-progress";

export function IslandMap({ childId }: { childId: string }) {
  const router = useRouter();
  const child = childById(childId);
  const progress = useChildProgress(childId);
  if (!child) return null;

  const mastered = progress.masteredThemes;

  return (
    <TabletShell>
      <ScreenHeader
        onBack={() => router.push(`/child/${childId}`)}
        title="Choose an island"
      />

      <div className="mt-2 grid gap-4">
        {THEMES.map((theme) => {
          const unlocked = isThemeUnlocked(theme, mastered);
          const done = mastered.includes(theme.id);

          if (!unlocked) {
            return (
              <div
                key={theme.id}
                aria-label={`${theme.title} island, locked`}
                className="flex items-center gap-4 rounded-[24px] border-4 border-dashed border-border-soft bg-card/50 px-5 py-5 opacity-60"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-cream text-border-soft">
                  <Lock size={26} aria-hidden />
                </span>
                <span className="font-display text-xl font-semibold text-ink-muted">
                  {theme.title}
                </span>
              </div>
            );
          }

          return (
            <ViewTransitionLink
              key={theme.id}
              href={`/child/${childId}/island/${theme.id}`}
              aria-label={`${theme.title} island`}
              className="flex items-center gap-4 rounded-[24px] bg-card px-5 py-5 shadow-[0_6px_0_#E7DFD2] active:translate-y-[2px] active:shadow-[0_4px_0_#E7DFD2] transition-transform duration-100 motion-reduce:transition-none"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-teal/20 text-4xl" aria-hidden>
                {theme.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-display text-xl font-semibold text-ink">
                  {theme.title}
                </span>
                <span className="block text-sm font-semibold text-ink-muted">{theme.canDo}</span>
              </span>
              {done && (
                <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-white">
                  ★
                </span>
              )}
            </ViewTransitionLink>
          );
        })}
      </div>
    </TabletShell>
  );
}
