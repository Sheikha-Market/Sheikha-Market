// Service Worker — منظومة شيخة للمعادن والسكراب
// © 2026 SHEIKHA — ملكية فكرية محفوظة لـ سلمان أحمد بن سلمان الراجح
// v5 — وضع PILOT: الشبكة أولاً دائماً — لا تخزين يعترض التنقل
const CACHE_NAME = 'sheikha-cache-v5';

// Install — فوري بدون تخزين مسبق في وضع PILOT
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Sheikha Service Worker v5 (PILOT mode)...');
    self.skipWaiting();
});

// Activate — حذف كل الكاش القديم فوراً
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating v5 — clearing ALL old caches...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    console.log('[SW] Deleting cache:', name);
                    return caches.delete(name);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch — الشبكة مباشرة دائماً في وضع PILOT (لا اعتراض)
self.addEventListener('fetch', (event) => {
    // لا نعترض أي طلب — نتركه يذهب للشبكة مباشرة
    return;
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncPendingOrders());
    }
});

async function syncPendingOrders() {
    try {
        const cache = await caches.open('sheikha-pending');
        const requests = await cache.keys();
        for (const request of requests) {
            const response = await cache.match(request);
            const data = await response.json();
            await fetch(request.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await cache.delete(request);
        }
    } catch (err) {
        console.log('[SW] Sync failed:', err);
    }
}

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
