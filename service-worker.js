const CACHE_NAME = "hsg-rbk-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/a-jugend.html",
  "/b-jugend.html",
  "/news.html",
  "/style.css", // falls du eine eigene CSS-Datei hast
  "/Mannschaft.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener("push", event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/Mannschaft.png", // Icon für die Notification
    badge: "/Mannschaft.png"
  };
  event.waitUntil(self.registration.showNotification(data.title, options))
