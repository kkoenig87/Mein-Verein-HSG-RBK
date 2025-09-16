// sw.js
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "logo_p-180.png" // oder ein kleineres Icon wie "icon-192.png"
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("https://kkoenig87.github.io/Mein-Verein-HSG-RBK/") // Ziel beim Klick
  );
});
