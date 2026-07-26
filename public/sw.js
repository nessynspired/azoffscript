// AZ Off Script — Service Worker
// Caches the app shell for offline use. Network-first for pages and CSS,
// stale-while-revalidate for images.

const CACHE_VERSION = "azos-v11";
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
          .filter((key) => key.startsWith("azos-") && key !== SHELL_CACHE && key !== ASSET_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// On controller change (new SW took over), force all clients to reload
// so they pick up the new CSS/JS instead of showing stale cached styles.
self.addEventListener("controllerchange", () => {
  // clients will reload themselves via the page-side check below
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

// ===========================================================================
// Push notifications
// ===========================================================================
self.addEventListener("push", (event) => {
  let data = { title: "AZ Off Script", body: "Something new in the room", url: "/portal/notifications" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // If not JSON, treat as text
    if (event.data) data = { title: "AZ Off Script", body: event.data.text(), url: "/portal/notifications" };
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/portal/notifications" },
    vibrate: [100, 50, 100],
    tag: "azos-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click — open the URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/portal/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus an existing window if one is open
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
