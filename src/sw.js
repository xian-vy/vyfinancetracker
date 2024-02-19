importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js");

const broadcastUpdatePlugin = new workbox.broadcastUpdate.BroadcastUpdatePlugin();

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
  plugins: [broadcastUpdatePlugin],
});

// Force the waiting service worker to become the active service worker.
self.addEventListener("install", () => self.skipWaiting());

// Take control of all pages under this service worker's scope immediately.
self.addEventListener("activate", () => self.clients.claim());
