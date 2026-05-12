// Service Worker — منظومة شيخة للمعادن والسكراب
// © 2026 SHEIKHA — ملكية فكرية محفوظة لـ سلمان أحمد بن سلمان الراجح
// v7 — Offline-First
const CACHE_NAME = 'sheikha-cache-v7';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/icons/icon.svg',
    '/css/sheikha-beta-banner.css',
    '/js/safe-api.js',
    '/js/sheikha-offline-db.js',
    '/js/sheikha-neural-engine.js',
    '/سوق-شيخة.html',
    '/لوحة-تحكم-المستخدم.html'
];

function isApiRequest(requestUrl) {
    return requestUrl.pathname.startsWith('/api/');
}

function isStaticAsset(requestUrl) {
    return /\.(css|js|png|jpg|jpeg|svg|webp|gif|woff2?|ttf)$/i.test(requestUrl.pathname);
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (_err) {
        const cached = await cache.match(request);
        return cached || null;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (_err) {
        return null;
    }
}

// Install — تخزين مسبق للأصول الحرجة
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .catch((err) => console.warn('[SW] precache failed:', err.message))
            .finally(() => self.skipWaiting())
    );
});

// Activate — حذف الإصدارات القديمة فقط
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((name) => name.startsWith('sheikha-cache-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
            .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
            .then((clientsList) => {
                clientsList.forEach((client) => {
                    client.postMessage({ type: 'SHEIKHA_FORCE_REFRESH', version: CACHE_NAME });
                });
            })
    );
});

// Fetch — Offline-First Strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    // صفحات HTML — network-first مع fallback إلى offline.html
    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            const networkResponse = await networkFirst(request);
            if (networkResponse) {
                return networkResponse;
            }

            const cache = await caches.open(CACHE_NAME);
            return (await cache.match(OFFLINE_URL)) || Response.error();
        })());
        return;
    }

    // API — network-first مع fallback من الكاش
    if (isApiRequest(requestUrl)) {
        event.respondWith((async () => {
            const response = await networkFirst(request);
            if (response) {
                return response;
            }
            return new Response(
                JSON.stringify({ success: false, offline: true, message: 'لا يوجد اتصال ولا نسخة مخبأة.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
        })());
        return;
    }

    // الأصول الثابتة — cache-first
    if (isStaticAsset(requestUrl)) {
        event.respondWith((async () => {
            const response = await cacheFirst(request);
            return response || Response.error();
        })());
        return;
    }

    // الافتراضي — network-first
    event.respondWith((async () => {
        const response = await networkFirst(request);
        return response || Response.error();
    })());
});

// Background sync — تفويض المزامنة للصفحة
self.addEventListener('sync', (event) => {
    if (event.tag === 'sheikha-sync-queue') {
        event.waitUntil(
            self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
                .then((clientsList) => {
                    clientsList.forEach((client) => {
                        client.postMessage({ type: 'SHEIKHA_SYNC_REQUEST' });
                    });
                })
        );
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'شيخة';
    const options = {
        body: data.body || 'لديك إشعار جديد',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' },
        actions: data.actions || []
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
