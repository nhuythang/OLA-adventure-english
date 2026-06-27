"use client";

import { useEffect } from "react";

// Registers the service worker (task 26). Production only — registering in dev
// invites the stale-cache headaches the builder flagged (and the e2e dev server
// would otherwise cache itself). Renders nothing.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal — the app works without offline.
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
