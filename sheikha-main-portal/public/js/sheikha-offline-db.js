(function() {
    'use strict';

    const DB_NAME = 'sheikha_offline_db';
    const DB_VERSION = 1;
    const STORE_ORDERS = 'orders';
    const STORE_PAYMENTS = 'payments';
    const STORE_DOCUMENTS = 'documents';
    const STORE_MARKET_CACHE = 'market_cache';
    const STORE_OPERATIONS = 'operations';
    const STORE_SYNC_QUEUE = 'sync_queue';

    let dbPromise = null;

    function notify(message, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type || 'info');
            return;
        }
        console.log('[Sheikha Offline]', message);
    }

    function openDb() {
        if (dbPromise) {
            return dbPromise;
        }

        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(STORE_ORDERS)) {
                    db.createObjectStore(STORE_ORDERS, { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains(STORE_PAYMENTS)) {
                    db.createObjectStore(STORE_PAYMENTS, { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
                    db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains(STORE_MARKET_CACHE)) {
                    db.createObjectStore(STORE_MARKET_CACHE, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORE_OPERATIONS)) {
                    db.createObjectStore(STORE_OPERATIONS, { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
                    const queueStore = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
                    queueStore.createIndex('by_status', 'status', { unique: false });
                    queueStore.createIndex('by_priority', 'priority', { unique: false });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return dbPromise;
    }

    async function write(storeName, value) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function add(storeName, value) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.add(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function readAll(storeName) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async function readOne(storeName, key) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async function removeByKey(storeName, key) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    function inferPriority(storeName) {
        if (storeName === STORE_PAYMENTS) {
            return 100;
        }
        if (storeName === STORE_ORDERS || storeName === STORE_DOCUMENTS) {
            return 70;
        }
        return 50;
    }

    async function enqueueSync(payload) {
        const nowIso = new Date().toISOString();
        const storeName = payload.store || STORE_OPERATIONS;
        const item = {
            store: storeName,
            url: payload.url,
            method: (payload.method || 'POST').toUpperCase(),
            headers: payload.headers || { 'Content-Type': 'application/json' },
            body: payload.body || null,
            status: 'pending',
            retries: payload.retries || 0,
            maxRetries: Number.isFinite(payload.maxRetries)
                ? payload.maxRetries
                : (storeName === STORE_PAYMENTS ? 10 : 5),
            priority: payload.priority || inferPriority(storeName),
            createdAt: nowIso,
            updatedAt: nowIso
        };

        await add(STORE_SYNC_QUEUE, item);
        return item;
    }

    async function saveOrder(data) {
        return add(STORE_ORDERS, {
            ...data,
            savedAt: new Date().toISOString(),
            offline: true
        });
    }

    async function savePayment(data) {
        return add(STORE_PAYMENTS, {
            ...data,
            savedAt: new Date().toISOString(),
            offline: true,
            priority: 'high'
        });
    }

    async function saveDocument(data) {
        return add(STORE_DOCUMENTS, {
            ...data,
            savedAt: new Date().toISOString(),
            offline: true
        });
    }

    async function saveOperation(data) {
        return add(STORE_OPERATIONS, {
            ...data,
            savedAt: new Date().toISOString(),
            offline: true
        });
    }

    async function setMarketCache(key, data) {
        return write(STORE_MARKET_CACHE, {
            key,
            data,
            updatedAt: new Date().toISOString()
        });
    }

    async function getMarketCache(key) {
        const record = await readOne(STORE_MARKET_CACHE, key);
        return record ? record.data : null;
    }

    function normalizeUrl(url) {
        try {
            const u = new URL(url, window.location.origin);
            return u.pathname + u.search;
        } catch (_err) {
            return String(url || '');
        }
    }

    function inferStoreFromUrl(url) {
        const normalized = normalizeUrl(url).toLowerCase();

        if (/payment|invoice|فاتورة|دفع/.test(normalized)) {
            return STORE_PAYMENTS;
        }
        if (/document|upload|attachment|وثيقة/.test(normalized)) {
            return STORE_DOCUMENTS;
        }
        if (/order|rfq|طلب/.test(normalized)) {
            return STORE_ORDERS;
        }
        return STORE_OPERATIONS;
    }

    async function syncAll() {
        if (!navigator.onLine) {
            return { synced: 0, pending: 0 };
        }

        const queue = await readAll(STORE_SYNC_QUEUE);
        const pending = queue
            .filter((item) => item.status === 'pending')
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

        let syncedCount = 0;

        for (const item of pending) {
            try {
                const response = await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: item.body
                });

                if (response.ok) {
                    await removeByKey(STORE_SYNC_QUEUE, item.id);
                    syncedCount += 1;
                    continue;
                }

                const nextRetries = (item.retries || 0) + 1;
                const nextStatus = nextRetries >= item.maxRetries ? 'failed' : 'pending';

                await write(STORE_SYNC_QUEUE, {
                    ...item,
                    retries: nextRetries,
                    status: nextStatus,
                    updatedAt: new Date().toISOString()
                });
            } catch (_err) {
                const nextRetries = (item.retries || 0) + 1;
                const nextStatus = nextRetries >= item.maxRetries ? 'failed' : 'pending';

                await write(STORE_SYNC_QUEUE, {
                    ...item,
                    retries: nextRetries,
                    status: nextStatus,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        return { synced: syncedCount, pending: pending.length };
    }

    function queueAndSave(url, method, headers, body) {
        const store = inferStoreFromUrl(url);
        const payload = {
            store,
            url,
            method,
            headers,
            body,
            priority: inferPriority(store)
        };

        return enqueueSync(payload).then(() => {
            if (store === STORE_ORDERS) {
                return saveOrder({ source: 'safe-api', url, body });
            }
            if (store === STORE_PAYMENTS) {
                return savePayment({ source: 'safe-api', url, body });
            }
            if (store === STORE_DOCUMENTS) {
                return saveDocument({ source: 'safe-api', url, body });
            }
            return saveOperation({ source: 'safe-api', url, body });
        });
    }

    function onOnline() {
        notify('🌐 عاد الاتصال — جارٍ مزامنة البيانات', 'info');
        syncAll().then((result) => {
            if (result.synced > 0) {
                notify('✅ مُزامَن: ' + result.synced + ' عملية', 'success');
            }
        }).catch((err) => {
            console.warn('[Sheikha Offline] sync failed:', err.message);
        });
    }

    function onOffline() {
        notify('📵 وضع بلا إنترنت — العمليات تُحفظ محلياً', 'warning');
    }

    window.SheikhaOfflineDB = {
        init: openDb,
        saveOrder,
        savePayment,
        saveDocument,
        saveOperation,
        setMarketCache,
        getMarketCache,
        enqueueSync,
        syncAll,
        queueAndSave,
        inferStoreFromUrl,
        normalizeUrl,
        stores: {
            orders: STORE_ORDERS,
            payments: STORE_PAYMENTS,
            documents: STORE_DOCUMENTS,
            marketCache: STORE_MARKET_CACHE,
            operations: STORE_OPERATIONS,
            syncQueue: STORE_SYNC_QUEUE
        }
    };

    openDb()
        .then(() => {
            if (!navigator.onLine) {
                onOffline();
            }
        })
        .catch((err) => {
            console.warn('[Sheikha Offline] DB init failed:', err.message);
        });

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event && event.data && event.data.type === 'SHEIKHA_SYNC_REQUEST') {
                onOnline();
            }
        });

        navigator.serviceWorker.ready
            .then((registration) => {
                if (registration.sync && navigator.onLine) {
                    registration.sync.register('sheikha-sync-queue').catch(() => {});
                }
            })
            .catch(() => {});
    }
})();
