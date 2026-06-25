"use client";

import { useSyncExternalStore } from "react";
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
  type ChildProgress,
} from "@/lib/storage";

// Reads a child's persisted progress via useSyncExternalStore: empty on the
// server/hydration render (so no mismatch), real localStorage value on the
// client, and re-renders when progress changes (e.g. another tab, or a reset).
export function useChildProgress(childId: string): ChildProgress {
  return useSyncExternalStore(
    subscribeProgress,
    () => getProgressSnapshot(childId),
    getServerProgressSnapshot,
  );
}
