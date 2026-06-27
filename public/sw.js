// Hand-rolled service worker (task 26). This app has no media files to precache
// (stickers are emoji, audio is synthesized), so the strategy is small:
//   - navigations: network-first, falling back to a cached shell when offline;
//   - hashed static assets (/_next, fonts, icons): cache-first (immutable);
// Bump CACHE on any change to this file to retire the old cache on activate.
const CACHE = "ola-v1";
const PRECACHE = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const STATIC = /\.(?:js|css|woff2?|png|svg|ico|webmanifest)$/;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: always try the network first (so auth redirects and fresh deploys
  // win), and fall back to the cached shell only when truly offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match("/")).then((r) => r || caches.match("/offline.html")),
      ),
    );
    return;
  }

  // Hashed/static assets: serve from cache, fetching + caching on a miss.
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icons/") || STATIC.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
  }
});
