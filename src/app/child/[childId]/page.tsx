import { StickerBookHome } from "@/components/game/sticker-book-home";

export default async function ChildHomePage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  return <StickerBookHome childId={childId} />;
}
