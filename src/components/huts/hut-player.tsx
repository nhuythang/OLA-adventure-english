"use client";

import { useRouter } from "next/navigation";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { HutResult } from "@/components/huts/hut-result";
import { useHutEngine } from "@/lib/engine/use-hut-engine";
import { type EngineQuestion } from "@/lib/engine/hut-machine";
import type { Skill } from "@/lib/types";

const HUT_LABEL: Record<Skill, string> = {
  listen: "Listen",
  speak: "Speak",
  read: "Read",
  write: "Write",
};

interface Props {
  childId: string;
  themeId: string;
  skill: Skill;
  questions: EngineQuestion[];
  choiceCount: number;
  /** "audio" = big speaker prompt (Listen). "word" = big printed word (Read). */
  promptMode?: "audio" | "word";
  /** Speak prompts aloud (Listen, Read L1). False for Read L2 (read silently). */
  speakPrompts?: boolean;
  /** Hidden for picture-choice huts (Listen/Read); shown where reading the option is the point. */
  showLabels?: boolean;
}

export function HutPlayer({
  childId,
  themeId,
  skill,
  questions,
  choiceCount,
  promptMode = "audio",
  speakPrompts = true,
  showLabels = false,
}: Props) {
  const router = useRouter();
  const engine = useHutEngine({ questions, choiceCount, skill, themeId, speakPrompts });
  const toIsland = () => router.push(`/child/${childId}/island/${themeId}`);

  if (engine.result) {
    return (
      <HutResult
        childId={childId}
        themeId={themeId}
        mastered={engine.result.mastered}
        hutLabel={HUT_LABEL[skill]}
        onPlayAgain={engine.restart}
      />
    );
  }

  const cols = engine.options.length >= 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <TabletShell>
      <ScreenHeader
        onBack={toIsland}
        right={<ProgressDots total={engine.total} current={engine.index} />}
      />

      <div className="flex flex-col items-center gap-3 py-6">
        {promptMode === "word" ? (
          <>
            <span className="font-display text-5xl font-semibold lowercase text-ink">
              {engine.prompt}
            </span>
            {speakPrompts && (
              <AudioButton key={engine.index} text={engine.prompt} autoPlay={false} label="Hear it again" />
            )}
          </>
        ) : (
          <AudioButton key={engine.index} text={engine.prompt} autoPlay={false} label="Hear it again" />
        )}
      </div>

      {engine.ready ? (
        <div className={`grid gap-3 ${cols}`}>
          {engine.options.map((opt) => (
            <ChoiceCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              visual={opt.emoji}
              showLabel={showLabels}
              correct={opt.id === engine.correctId}
              state={engine.choiceState[opt.id] ?? "idle"}
              onSelect={engine.select}
            />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm font-semibold text-ink-muted">…</p>
      )}
    </TabletShell>
  );
}
