// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

// Add this below content to your HTML page inside a <script type="module"></script> tag, or add the js file to your page at the very top to register service worker
// If you get an error about not being able to import, double check that you have type="module" on your <script /> tag

/*
 This code uses the pwa-update web component https://github.com/pwa-builder/pwa-update to register your service worker,
 tell the user when there is an update available and let the user know when your PWA is ready to use offline.
*/

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
  } else {
    // For non-navigation requests, try the cache first, fall back to network
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});