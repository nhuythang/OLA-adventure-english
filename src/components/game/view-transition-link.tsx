import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

// A plain next/link client navigation. Smooth cross-screen transitions come
// from the `@view-transition { navigation: auto }` rule in globals.css, which
// supporting browsers (Safari 18+/iPadOS, Chrome) apply automatically and which
// degrades to an instant cut elsewhere — no fragile manual startViewTransition
// that can swallow a navigation. (CLAUDE.md "native feel".)
export function ViewTransitionLink({ href, children, className, ...rest }: Props) {
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
