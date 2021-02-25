const cacheName = 'meganmoney-v1.0';
const resourcesToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/util.js',
  '/views2.js',
  '/soothe.js',
  '/views/dashboard/index.html',
  '/views/profile/index.html',
  '/views/profile/index.js',
  '/views/accounts/index.html',
  '/views/accounts/index.js',
  '/views/labels/index.html',
  '/views/labels/index.js',
  '/views/budgets/index.html',
  '/views/budgets/index.js',
  '/views/labels/edit.html',
  '/views/labels/edit.js'
];

self.addEventListener('install', event => {
    // Perform install steps
    console.log("Beginning Install...");
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            console.log('Opened cache');
            return cache.addAll(resourcesToCache);
        })
        .catch(err => {
            console.error(err);
        })
    );
    console.log("install steps finished");
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', event => {
    console.log("Updating service worker")
    const cacheAllowlist = [cacheName];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (cacheAllowlist.indexOf(name) === -1) {
                        return caches.delete(name);
                    }
                })
            );
        })
        .catch(err => {
            console.error('Update failed');
        })
    );
});