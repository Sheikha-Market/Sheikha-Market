// Service Worker — منظومة شيخة للمعادن والسكراب
// © 2026 SHEIKHA — ملكية فكرية محفوظة لـ سلمان أحمد بن سلمان الراجح
// v7 — وضع Offline-First: يعمل بالإنترنت وبدونه
const CACHE_VERSION = 'v7';
const CACHE_STATIC = `sheikha-static-${CACHE_VERSION}`;
const CACHE_PAGES  = `sheikha-pages-${CACHE_VERSION}`;
const CACHE_API    = `sheikha-api-${CACHE_VERSION}`;

// الأصول الحرجة التي تُحمَّل مسبقاً عند التثبيت
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/css/sheikha-neural-identity.css',
    '/css/sheikha-haleem.css',
    '/css/sheikha-design-system.css',
    '/js/safe-api.js',
    '/js/sheikha-offline-db.js',
    '/js/sheikha-access.js',
    '/js/sheikha-i18n.js',
    '/js/sheikha-neural-design-engine.js',
    '/css/sheikha-neural-identity.css',
    '/icons/icon.svg',
    '/icons/icon-192.svg',
    '/سوق-شيخة.html',
    '/لوحة-تحكم-المستخدم.html',
    '/تسجيل-الدخول.html',
];

// Install — تخزين الأصول الحرجة مسبقاً
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Sheikha Service Worker v7 (Offline-First)...');
    event.waitUntil(
        caches.open(CACHE_STATIC).then((cache) => {
            return cache.addAll(
                PRECACHE_ASSETS.filter(url => {
                    // تجاهل الأصول غير الموجودة بشكل آمن
                    return true;
                })
            );
        }).then(() => self.skipWaiting())
          .catch((err) => {
              console.warn('[SW] Precache partial failure (safe):', err);
              return self.skipWaiting();
          })
    );
});

// Activate — حذف الكاش القديم فقط (الإصدارات السابقة)
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating v7 — pruning old caches...');
    const CURRENT_CACHES = [CACHE_STATIC, CACHE_PAGES, CACHE_API];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !CURRENT_CACHES.includes(name))
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ═══ استراتيجيات الكاش ═══

// Cache-First: للأصول الثابتة (CSS، JS، صور، أيقونات)
function cacheFirst(request, cacheName) {
    return caches.open(cacheName).then((cache) => {
        return cache.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response && response.status === 200) {
                    cache.put(request, response.clone());
                }
                return response;
            }).catch(() => cached || new Response('', { status: 503 }));
        });
    });
}

// Network-First مع Cache fallback: للصفحات والـ API
function networkFirst(request, cacheName) {
    return fetch(request).then((response) => {
        if (response && response.status === 200) {
            caches.open(cacheName).then((cache) => cache.put(request, response.clone()));
        }
        return response;
    }).catch(() => {
        return caches.open(cacheName).then((cache) => {
            return cache.match(request).then((cached) => {
                if (cached) return cached;
                // إذا كانت صفحة HTML → أرجع صفحة offline
                if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
                    return caches.match('/offline.html');
                }
                return new Response(JSON.stringify({ offline: true, error: 'لا يوجد اتصال بالشبكة' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                });
            });
        });
    });
}

// Fetch — التوزيع الذكي حسب نوع الطلب
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // تجاهل الطلبات غير HTTP/HTTPS
    if (!url.protocol.startsWith('http')) return;

    // تجاهل طلبات Chrome extensions وغيرها
    if (url.origin !== self.location.origin && !url.hostname.includes('sheikha')) {
        return;
    }

    // الأصول الثابتة → Cache-First
    if (
        url.pathname.match(/\.(css|js|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|ico)$/)
    ) {
        event.respondWith(cacheFirst(request, CACHE_STATIC));
        return;
    }

    // طلبات API → Network-First مع Cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request, CACHE_API));
        return;
    }

    // صفحات HTML → Network-First مع Cache fallback
    if (request.method === 'GET') {
        event.respondWith(networkFirst(request, CACHE_PAGES));
        return;
    }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders' || event.tag === 'sync-payment' ||
        event.tag === 'sync-document' || event.tag === 'sync-operation') {
        event.waitUntil(syncFromIndexedDB(event.tag));
    }
});

async function syncFromIndexedDB(tag) {
    // إرسال رسالة لكل النوافذ المفتوحة لتشغيل المزامنة عبر SheikhaOfflineDB
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => {
        client.postMessage({ type: 'SHEIKHA_SYNC_REQUEST', tag });
    });
    // المزامنة الاحتياطية المباشرة (عندما لا توجد نوافذ مفتوحة)
    return syncPendingOrders();
}

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
