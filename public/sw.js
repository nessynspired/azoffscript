// AZ Off Script — Service Worker
// Caches the app shell for offline use. Network-first for pages,
// cache-first for static assets, stale-while-revalidate for images.

const CACHE_VERSION = "azos-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// App shell — the core pages that should work offline
const SHELL_URLS = [
  "/",
  "/login",
  "/portal/lobby",
  "/portal/drop",
  "/portal/run-sheet",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("azos-") && key !== CACHE_VERSION + "-shell" && key !== CACHE_VERSION + "-assets" && key !== CACHE_VERSION + "-images")
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip Supabase API calls — always go to network
  if (url.hostname.includes("supabase.co")) return;

  // Skip Next.js HMR/dev requests
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Static assets (JS, CSS, fonts) — network-first, cache as fallback
  // Next.js hashes these filenames, so stale cached versions must not override new builds.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(?:js|css|woff2?|ttf|otf)$/)) {
    event.respondWith(
      fetch(request)
        .then((fetched) => {
          if (fetched.ok) {
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, fetched.clone()));
          }
          return fetched;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Images (mascots, posters, icons) — stale-while-revalidate
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname.match(/\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((fetched) => {
          if (fetched.ok) cache.put(request, fetched.clone());
          return fetched;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Pages — network-first, fall back to cache (offline support)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((fetched) => {
          const cache = caches.open(SHELL_CACHE);
          if (fetched.ok) cache.then((c) => c.put(request, fetched.clone()));
          return fetched;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }
});
