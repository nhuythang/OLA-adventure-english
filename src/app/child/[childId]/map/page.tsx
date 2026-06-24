import { IslandMap } from "@/components/game/island-map";

export default async function MapPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  return <IslandMap childId={childId} />;
}
