"use client";

import { useRouter } from "next/navigation";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { AudioButton } from "@/components/ui/audio-button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Button } from "@/components/ui/button";
import { StickerBadge } from "@/components/ui/sticker-badge";
import { useHutEngine } from "@/lib/engine/use-hut-engine";
import { type EngineQuestion } from "@/lib/engine/hut-machine";
import { childById } from "@/data/children";
import { stickersForSet } from "@/data/stickers/sticker-bank";
import type { Skill } from "@/lib/types";

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
  const child = childById(childId);
  const toIsland = () => router.push(`/child/${childId}/island/${themeId}`);

  if (engine.result) {
    // Reward overlay + real sticker persistence are tasks 14/15. For now we
    // celebrate with a placeholder sticker from the child's set.
    const award = child ? stickersForSet(child.stickerSet)[0] : undefined;
    const { mastered } = engine.result;
    return (
      <TabletShell>
        <ScreenHeader title="All done!" />
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          {award && <StickerBadge sticker={award} size={120} tilt={-5} />}
          <h1 className="font-display text-2xl font-semibold text-ink">
            {mastered ? "You earned a sticker!" : "Nice try — sticker earned!"}
          </h1>
          <p className="text-sm font-semibold text-ink-muted">
            {mastered
              ? "You mastered the Listen hut."
              : "Play again to master this hut."}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={engine.restart}>
              Play again
            </Button>
            <Button variant="primary" onClick={toIsland}>
              Back to island
            </Button>
          </div>
        </div>
      </TabletShell>
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
