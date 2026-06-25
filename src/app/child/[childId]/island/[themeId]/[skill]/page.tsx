import { notFound } from "next/navigation";
import { ListenHut } from "@/components/huts/listen-hut";
import { ReadHut } from "@/components/huts/read-hut";
import { WriteHut } from "@/components/huts/write-hut";
import { SpeakHut } from "@/components/huts/speak-hut";
import { SKILLS, type Skill } from "@/lib/types";

export default async function HutPage({
  params,
}: {
  params: Promise<{ childId: string; themeId: string; skill: string }>;
}) {
  const { childId, themeId, skill } = await params;
  if (!SKILLS.includes(skill as Skill)) notFound();

  // All four huts are built (tasks 08–12).
  switch (skill as Skill) {
    case "listen":
      return <ListenHut childId={childId} themeId={themeId} />;
    case "read":
      return <ReadHut childId={childId} themeId={themeId} />;
    case "write":
      return <WriteHut childId={childId} themeId={themeId} />;
    case "speak":
      return <SpeakHut childId={childId} themeId={themeId} />;
  }
}
