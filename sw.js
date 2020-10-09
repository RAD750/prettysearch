var currentVersion = "0.4";
var cacheName = 'pwa-prettysearch';
var filesToCache = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/backdrops.json',
  './assets/config.json',
  './assets/media/icons/PrettySearch.png',
  './assets/media/icons/PrettySearch.256.png'
];

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  //fetch backdrop json
  fetch('./assets/config.json')
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      if (data.version > currentVersion) {
        console.log(`[Service Worker] Deleting outdated cache: got ${data.version}, current ${currentVersion}`);
        return caches.delete(cacheName);
      }
    })
  .catch((err) => {
    console.log("Error fetching resource: " + err)
  })

fetch('./assets/backdrops.json')
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    var today = new Date();
    var dow = today.getDate() - 1;
    console.log("Current backdrop: " + data[dow].filename)
    filesToCache.push(`./assets/media/backdrops/${data[dow].filename}`)
    caches.open(cacheName).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(filesToCache);
    })

  })
  .catch((err) => {
    console.log("Error fetching resource: " + err)
  })
});

self.addEventListener('fetch', (e) => {
  console.log('[Service Worker] Fetched resource ' + e.request.url);
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      console.log('[Service Worker] Fetching resource: ' + e.request.url);
      return r || fetch(e.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Caching new resource: ' + e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});


