import Link from "next/link";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { themeById } from "@/data/themes";

// Placeholder — the 4-hut island screen is task 07. This keeps map navigation
// from 404-ing while we build toward it.
export default async function IslandPage({
  params,
}: {
  params: Promise<{ childId: string; themeId: string }>;
}) {
  const { childId, themeId } = await params;
  const theme = themeById(themeId);

  return (
    <TabletShell>
      <ScreenHeader title={theme?.title ?? "Island"} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <span className="text-7xl" aria-hidden>
          {theme?.emoji ?? "🏝️"}
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {theme?.title} island
        </h1>
        <p className="text-sm font-semibold text-ink-muted">
          The Listen / Speak / Read / Write huts arrive in task 07.
        </p>
        <Link
          href={`/child/${childId}/map`}
          className="font-display text-base font-semibold text-coral-dark underline"
        >
          Back to the map
        </Link>
      </div>
    </TabletShell>
  );
}
