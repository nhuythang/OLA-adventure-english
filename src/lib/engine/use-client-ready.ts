"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// True only after mount. Gates any client-only randomization (which words a
// round targets, choice order) so the server-rendered markup and the client's
// first hydration pass match exactly — see choices.ts's SSR note. Callers show
// a loading placeholder until this flips, then compute the real (randomized)
// content once.
//
// useSyncExternalStore, not an effect + setState: the server/hydration
// snapshot is false, the client snapshot is true, and React reconciles the
// difference right after hydrating — no cascading-render lint warning (the
// same reason use-child-progress.ts avoids setState-in-effect).
export function useClientReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
