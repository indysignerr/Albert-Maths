/**
 * Offline support for a study tool used on campus wifi and in the metro.
 *
 * Navigations are network-first: a stale HTML shell would pin students to an old
 * build after a deploy, which is far worse than a slow load. Static assets are
 * cache-first because their filenames are content-hashed, so a cached one is by
 * definition still correct.
 *
 * Nothing under /api/ is ever cached — those responses are personal and often
 * one-shot.
 */
const VERSION = "v1";
const SHELL = `albert-shell-${VERSION}`;
const ASSETS = `albert-assets-${VERSION}`;
const OFFLINE_URLS = ["/", "/app/", "/solve/", "/classes/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(OFFLINE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.endsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(SHELL).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached ?? caches.match("/")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(ASSETS).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
