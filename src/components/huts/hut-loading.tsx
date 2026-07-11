"use client";

import { useRouter } from "next/navigation";
import { TabletShell } from "@/components/game/tablet-shell";
import { ScreenHeader } from "@/components/game/screen-header";

// Shown while a hut's round selection is still deciding which words to target
// (useClientReady gate) — matches HutPlayer's own "…" placeholder so the two
// gates (word selection, then choice order) feel like one continuous wait.
export function HutLoading({ childId, themeId }: { childId: string; themeId: string }) {
  const router = useRouter();
  return (
    <TabletShell>
      <ScreenHeader onBack={() => router.push(`/child/${childId}/island/${themeId}`)} />
      <p className="py-8 text-center text-sm font-semibold text-ink-muted">…</p>
    </TabletShell>
  );
}
