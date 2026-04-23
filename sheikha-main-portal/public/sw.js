// Service Worker — منظومة شيخة للمعادن والسكراب
// © 2026 SHEIKHA — ملكية فكرية محفوظة لـ سلمان أحمد بن سلمان الراجح
// v8 — Offline-First كامل: يعمل بكل الأحوال (إنترنت، بدون إنترنت، منزل ذكي، بدون منزل)
const CACHE_VERSION = 'v8';
const CACHE_STATIC  = `sheikha-static-${CACHE_VERSION}`;
const CACHE_PAGES   = `sheikha-pages-${CACHE_VERSION}`;
const CACHE_API     = `sheikha-api-${CACHE_VERSION}`;
const CACHE_HOME    = `sheikha-home-${CACHE_VERSION}`;   // كاش بيانات المنزل الذكي

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
    console.log('[SW v8] Installing Sheikha Service Worker v8 (Offline-First — All Conditions)...');
    event.waitUntil(
        caches.open(CACHE_STATIC).then((cache) => {
            // تخزين كل أصل بشكل منفصل — خطأ أصل واحد لا يوقف الباقي
            return Promise.allSettled(
                PRECACHE_ASSETS.map(url =>
                    cache.add(url).catch(err =>
                        console.warn('[SW v8] Precache skip:', url, err.message)
                    )
                )
            );
        }).then(() => self.skipWaiting())
          .catch((err) => {
              console.warn('[SW v8] Precache partial failure (safe):', err);
              return self.skipWaiting();
          })
    );
});

// Activate — حذف الكاش القديم فقط (الإصدارات السابقة)
self.addEventListener('activate', (event) => {
    console.log('[SW v8] Activating — pruning old caches...');
    const CURRENT_CACHES = [CACHE_STATIC, CACHE_PAGES, CACHE_API, CACHE_HOME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !CURRENT_CACHES.includes(name))
                    .map((name) => {
                        console.log('[SW v8] Deleting old cache:', name);
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
                return new Response(JSON.stringify({
                    offline: true,
                    error:   'لا يوجد اتصال بالشبكة',
                    _offlineReady: true,
                }), {
                    status:  503,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                });
            });
        });
    });
}

// ─── Home Network — Stale-While-Revalidate ────────────────────────────────────
// بيانات المنزل الذكي: يُرجع الكاش فوراً ثم يُحدّثه في الخلفية
// إذا كان المنزل متوقفاً (انقطاع كهرباء) → يُرجع آخر بيانات محفوظة
function homeNetworkStrategy(request) {
    return caches.open(CACHE_HOME).then((cache) => {
        return cache.match(request).then((cached) => {
            // تحديث في الخلفية
            const networkPromise = fetch(request, { signal: AbortSignal.timeout(4000) })
                .then((response) => {
                    if (response && response.ok) {
                        cache.put(request, response.clone());
                        // أبلغ النوافذ بتحديث بيانات المنزل
                        self.clients.matchAll({ type: 'window' }).then(clients =>
                            clients.forEach(c => c.postMessage({
                                type: 'SHEIKHA_HOME_UPDATED',
                                url:  request.url,
                            }))
                        );
                    }
                    return response;
                })
                .catch(() => null);

            // أرجع الكاش فوراً إن وُجد، وإلا انتظر الشبكة
            if (cached) {
                networkPromise.catch(() => {}); // لا تكسر الوعد
                return cached;
            }
            return networkPromise.then(res => res || new Response(JSON.stringify({
                offline:   true,
                homeDown:  true,
                message:   'نظام المنزل الذكي غير متاح حالياً — آخر بيانات محفوظة ستُعاد عند الاتصال',
                _offlineReady: true,
            }), {
                status:  200,  // 200 وليس خطأ — النظام يعمل بدون المنزل
                headers: { 'Content-Type': 'application/json; charset=utf-8',
                           'X-Sheikha-Home-Status': 'offline' }
            }));
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

    // مسارات المنزل الذكي → Stale-While-Revalidate
    if (
        url.pathname.startsWith('/api/sheikha/private-home') ||
        url.pathname.startsWith('/api/home-')
    ) {
        if (request.method === 'GET') {
            event.respondWith(homeNetworkStrategy(request));
        }
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
    if (
        event.tag === 'sync-orders'    ||
        event.tag === 'sync-payment'   ||
        event.tag === 'sync-document'  ||
        event.tag === 'sync-operation' ||
        event.tag === 'sheikha-sync'
    ) {
        event.waitUntil(syncFromIndexedDB(event.tag));
    }
});

async function syncFromIndexedDB(tag) {
    // إرسال رسالة لكل النوافذ المفتوحة لتشغيل المزامنة عبر SheikhaOfflineDB
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    allClients.forEach(client => {
        client.postMessage({ type: 'SHEIKHA_SYNC_REQUEST', tag });
    });
    // المزامنة الاحتياطية المباشرة (عندما لا توجد نوافذ مفتوحة)
    return syncPendingOperations();
}

async function syncPendingOperations() {
    try {
        // 1. مزامنة العمليات المعلقة من كاش sheikha-pending
        const pendingCache = await caches.open('sheikha-pending');
        const requests = await pendingCache.keys();
        const ops = [];
        for (const req of requests) {
            try {
                const response = await pendingCache.match(req);
                const data     = await response.json();
                ops.push({ type: 'pending-op', method: req.method, path: new URL(req.url).pathname, payload: data });
                await pendingCache.delete(req);
            } catch (_) {}
        }

        // 2. إرسال دفعة واحدة إلى /api/offline/sync
        if (ops.length > 0) {
            await fetch('/api/offline/sync', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ operations: ops }),
            });
        }

        // 3. إخطار النوافذ بنجاح المزامنة
        const allClients = await self.clients.matchAll({ type: 'window' });
        allClients.forEach(c => c.postMessage({
            type:    'SHEIKHA_SYNC_COMPLETE',
            synced:  ops.length,
        }));
    } catch (err) {
        console.log('[SW v8] Sync failed:', err);
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
