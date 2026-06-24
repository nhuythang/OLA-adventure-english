import { IslandScreen } from "@/components/game/island-screen";

export default async function IslandPage({
  params,
}: {
  params: Promise<{ childId: string; themeId: string }>;
}) {
  const { childId, themeId } = await params;
  return <IslandScreen childId={childId} themeId={themeId} />;
}
