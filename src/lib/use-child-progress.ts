"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  ensureProgressLoaded,
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
  type ChildProgress,
} from "@/lib/storage";

// Reads a child's persisted progress via useSyncExternalStore: empty on the
// server/hydration render (no mismatch), then the cached value once loaded. The
// effect kicks off the backend load (a synchronous localStorage read, or an async
// Supabase fetch under the parent's session); the store notifies on completion so
// this re-renders with the real value.
export function useChildProgress(childId: string): ChildProgress {
  useEffect(() => {
    void ensureProgressLoaded(childId);
  }, [childId]);

  return useSyncExternalStore(
    subscribeProgress,
    () => getProgressSnapshot(childId),
    getServerProgressSnapshot,
  );
}
