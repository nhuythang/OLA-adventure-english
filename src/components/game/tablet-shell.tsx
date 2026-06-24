import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

// Centered max-width column on cream. Every kid-facing screen wraps in this.
// `min-h-dvh` (not min-h-screen) so it fills the real viewport on mobile
// browsers; safe-area padding keeps content clear of the iPad notch/home bar
// when installed as a standalone PWA (CLAUDE.md "native feel").
export function TabletShell({ children, className }: Props) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-[760px] flex-col px-4 py-4 md:px-6",
        "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </main>
  );
}
