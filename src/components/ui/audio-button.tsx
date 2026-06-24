"use client";

import { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { speak, type Lang } from "@/lib/speech";
import { unlockAudio } from "@/lib/sounds";
import { cn } from "@/lib/cn";

interface Props {
  /** Text to speak (English content by default). */
  text: string;
  lang?: Lang;
  /** Auto-play the prompt on mount (behavior rule 2). Gesture-gated, so it's a
   *  no-op until the child's first interaction — safe to leave on. */
  autoPlay?: boolean;
  label?: string;
  className?: string;
}

// The always-coral speaker. ≥88px tap target (native-feel rule). Replays on
// pointerdown for instant response; also unlocks the Web Audio context.
export function AudioButton({
  text,
  lang = "en-US",
  autoPlay = true,
  label = "Hear it again",
  className,
}: Props) {
  useEffect(() => {
    if (autoPlay) speak(text, lang);
  }, [text, lang, autoPlay]);

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={() => {
        unlockAudio();
        speak(text, lang);
      }}
      className={cn(
        "flex h-[88px] w-[88px] items-center justify-center rounded-full bg-coral-dark text-white",
        "shadow-[0_5px_0_#A33A24] transition-transform duration-100",
        "active:translate-y-[2px] active:shadow-[0_3px_0_#A33A24] motion-reduce:transition-none",
        className,
      )}
    >
      <Volume2 size={40} aria-hidden />
    </button>
  );
}
