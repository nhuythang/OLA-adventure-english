import Link from "next/link";
import { SlidersHorizontal, Trophy } from "lucide-react";

import { StickerBadge } from "@/components/ui/sticker-badge";
import { stickerById } from "@/data/stickers/sticker-bank";
import type { ChildDashboard, DashboardData } from "@/lib/parent/dashboard-data";
import { SKILLS, type Level } from "@/lib/types";
import { vi } from "@/i18n";

const d = vi.parent.dashboard;
const LEVEL_LABEL: Record<Level, string> = { starter: "Starter", mover: "Mover", flyer: "Flyer" };

// Read-only parent view: per-child, per-skill level + first-try accuracy, theme
// progress, and the collected sticker book. Vietnamese (parent surface). Pure
// presentation — data is aggregated server-side (lib/parent/dashboard-data.ts).
export function Dashboard({ data }: { data: DashboardData }) {
  if (data.children.length === 0) {
    return <p className="text-center text-ink-muted">{d.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      {data.children.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  );
}

function ChildCard({ child }: { child: ChildDashboard }) {
  const earned = child.earnedStickerIds.map(stickerById).filter((s) => s !== undefined);

  return (
    <section className="rounded-3xl border border-border-soft bg-card p-5 text-left">
      <header className="mb-4 flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {child.avatar}
        </span>
        <h2 className="font-display text-2xl font-semibold text-ink">{child.name}</h2>
        <Link
          href={`/parent/placement/${child.id}`}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-sm font-semibold text-ink-muted active:translate-y-[1px]"
        >
          <SlidersHorizontal size={15} aria-hidden /> {vi.parent.placement.editLink}
        </Link>
      </header>

      {/* Per-skill: level + first-try accuracy */}
      <div className="grid grid-cols-2 gap-2">
        {SKILLS.map((skill) => {
          const s = child.skills[skill];
          return (
            <div key={skill} className="rounded-2xl bg-cream px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-ink">{d.skills[skill]}</span>
                <span className="rounded-full bg-teal/20 px-2 py-0.5 text-xs font-semibold text-teal-dark">
                  {LEVEL_LABEL[s.level]}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {s.firstTryPct === null ? d.noPlay : `${s.firstTryPct}% ${d.accuracyLabel}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Theme progress */}
      <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">{d.themesHeading}</h3>
      <ul className="flex flex-col gap-1.5">
        {child.themes.map((t) => (
          <li key={t.themeId} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2">
            <span className="font-semibold text-ink">{t.title}</span>
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              {t.hutsMastered}/4 {d.hutsSuffix}
              {t.mastered && (
                <span className="flex items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 font-semibold text-gold-dark">
                  <Trophy size={14} aria-hidden /> {d.themeMastered}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Sticker book */}
      <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        {d.stickersHeading} ({earned.length})
      </h3>
      {earned.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {earned.map((sticker, i) => (
            <StickerBadge key={sticker.id} sticker={sticker} size={52} tilt={i % 2 === 0 ? -4 : 4} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">{d.noPlay}</p>
      )}
    </section>
  );
}
