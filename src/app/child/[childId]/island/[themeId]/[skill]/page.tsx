import { notFound } from "next/navigation";
import { ListenHut } from "@/components/huts/listen-hut";
import { ReadHut } from "@/components/huts/read-hut";
import { WriteHut } from "@/components/huts/write-hut";
import { SpeakHut } from "@/components/huts/speak-hut";
import { GrammarListenHut } from "@/components/huts/grammar-listen-hut";
import { GrammarReadHut } from "@/components/huts/grammar-read-hut";
import { GrammarWriteHut } from "@/components/huts/grammar-write-hut";
import { GrammarSpeakHut } from "@/components/huts/grammar-speak-hut";
import { isGrammarTheme } from "@/data/grammar";
import { SKILLS, type Skill } from "@/lib/types";

export default async function HutPage({
  params,
}: {
  params: Promise<{ childId: string; themeId: string; skill: string }>;
}) {
  const { childId, themeId, skill } = await params;
  if (!SKILLS.includes(skill as Skill)) notFound();

  // Grammar island: choices are grammatical contrasts of the same referent, so
  // the huts build their rounds differently. Same four skills, same engine.
  if (isGrammarTheme(themeId)) {
    switch (skill as Skill) {
      case "listen":
        return <GrammarListenHut childId={childId} themeId={themeId} />;
      case "read":
        return <GrammarReadHut childId={childId} themeId={themeId} />;
      case "write":
        return <GrammarWriteHut childId={childId} themeId={themeId} />;
      case "speak":
        return <GrammarSpeakHut childId={childId} themeId={themeId} />;
    }
  }

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
