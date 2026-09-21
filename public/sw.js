self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'inspection-sync') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'FLUSH_INSPECTION_QUEUE' }));
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REQUEST_SYNC' && self.registration && self.registration.sync) {
    event.waitUntil(self.registration.sync.register('inspection-sync'));
  }
});
