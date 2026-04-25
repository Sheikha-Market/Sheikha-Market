const CACHE_NAME = 'sheikha-unified-shell-v1';
const SHELL_ASSETS = [
    '/dashboard-unified',
    '/manifest.json',
    '/icons/icon-192.svg',
    '/icons/icon.svg'
];

globalThis.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => globalThis.skipWaiting())
    );
});

globalThis.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.map((key) => {
            if (key !== CACHE_NAME) {
                return caches.delete(key);
            }
            return Promise.resolve();
        }))).then(() => globalThis.clients.claim())
    );
});

globalThis.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const isShellRequest = event.request.mode === 'navigate';

    if (isShellRequest) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/dashboard-unified'))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            }).catch(() => cached);
        })
    );
});
