import type { ReactNode } from "react";

import { TabletShell } from "@/components/game/tablet-shell";

// Shared shell for parent screens. Auth + PIN gating live in the middleware and
// the page (defense in depth); this is just the centered column. Parent surfaces
// are Vietnamese.
export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <TabletShell className="justify-center">
      {/* lang=vi so screen readers / TTS pick a Vietnamese voice on this surface. */}
      <div lang="vi" className="flex flex-1 flex-col justify-center">
        {children}
      </div>
    </TabletShell>
  );
}
