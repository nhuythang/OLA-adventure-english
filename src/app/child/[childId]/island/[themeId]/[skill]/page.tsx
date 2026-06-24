import { notFound } from "next/navigation";
import Link from "next/link";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ListenHut } from "@/components/huts/listen-hut";
import { ReadHut } from "@/components/huts/read-hut";
import { themeById } from "@/data/themes";
import { SKILLS, type Skill } from "@/lib/types";

const HUT_LABEL: Record<Skill, string> = {
  listen: "Listen",
  speak: "Speak",
  read: "Read",
  write: "Write",
};

export default async function HutPage({
  params,
}: {
  params: Promise<{ childId: string; themeId: string; skill: string }>;
}) {
  const { childId, themeId, skill } = await params;
  if (!SKILLS.includes(skill as Skill)) notFound();

  // Listen (08–09) and Read (10) are built. Speak/Write arrive in tasks 11–12.
  if (skill === "listen") {
    return <ListenHut childId={childId} themeId={themeId} />;
  }
  if (skill === "read") {
    return <ReadHut childId={childId} themeId={themeId} />;
  }

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
          This hut arrives in tasks 11–12.
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
