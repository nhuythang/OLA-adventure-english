import { notFound } from "next/navigation";
import Link from "next/link";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { themeById } from "@/data/themes";
import { SKILLS, type Skill } from "@/lib/types";

const HUT_LABEL: Record<Skill, string> = {
  listen: "Listen",
  speak: "Speak",
  read: "Read",
  write: "Write",
};

// Placeholder — the hut's rounds (engine + the per-skill mechanics) arrive in
// tasks 08–12. This keeps island navigation working in the meantime.
export default async function HutPage({
  params,
}: {
  params: Promise<{ childId: string; themeId: string; skill: string }>;
}) {
  const { childId, themeId, skill } = await params;
  if (!SKILLS.includes(skill as Skill)) notFound();
  const theme = themeById(themeId);
  const label = HUT_LABEL[skill as Skill];

  return (
    <TabletShell>
      <ScreenHeader title={`${label} hut`} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {label} hut — {theme?.title}
        </h1>
        <p className="text-sm font-semibold text-ink-muted">
          The rounds for this hut arrive in tasks 08–12.
        </p>
        <Link
          href={`/child/${childId}/island/${themeId}`}
          className="font-display text-base font-semibold text-coral-dark underline"
        >
          Back to the island
        </Link>
      </div>
    </TabletShell>
  );
}
