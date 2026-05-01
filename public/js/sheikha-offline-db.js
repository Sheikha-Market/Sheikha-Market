/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA Offline DB — محرك التخزين المحلي الكامل
 * يعمل بدون إنترنت: عمليات، توثيق، مدفوعات، سوق
 *
 * الاستراتيجية:
 *  - IndexedDB لكل البيانات الهيكلية (طلبات، فواتير، مدفوعات، وثائق)
 *  - localStorage للإعدادات السريعة والمستخدم الحالي
 *  - Background Sync لإرسال العمليات المعلّقة عند عودة الاتصال
 *  - Event-driven لإخطار الصفحات بحالة الشبكة والمزامنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function (global) {
    'use strict';

    const DB_NAME    = 'sheikha-offline';
    const DB_VERSION = 2;

    // مخازن البيانات
    const STORES = {
        ORDERS:       'orders',       // الطلبات
        PAYMENTS:     'payments',     // المدفوعات والفواتير
        DOCUMENTS:    'documents',    // التوثيق والوثائق
        MARKET_CACHE: 'market_cache', // بيانات السوق المخبأة
        SYNC_QUEUE:   'sync_queue',   // قائمة الانتظار للمزامنة
        USER_DATA:    'user_data',    // بيانات المستخدم المحلية
        OPERATIONS:   'operations',   // العمليات العامة
    };

    // ═══ فتح قاعدة البيانات ═══
    function openDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in global)) {
                reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
                return;
            }

            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (event) => {
                const db = event.target.result;

                // إنشاء المخازن إذا لم تكن موجودة
                if (!db.objectStoreNames.contains(STORES.ORDERS)) {
                    const os = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
                    os.createIndex('status',    'status',    { unique: false });
                    os.createIndex('createdAt', 'createdAt', { unique: false });
                    os.createIndex('userId',    'userId',    { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
                    const ps = db.createObjectStore(STORES.PAYMENTS, { keyPath: 'id' });
                    ps.createIndex('status',    'status',    { unique: false });
                    ps.createIndex('orderId',   'orderId',   { unique: false });
                    ps.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
                    const ds = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
                    ds.createIndex('type',      'type',      { unique: false });
                    ds.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.MARKET_CACHE)) {
                    const mc = db.createObjectStore(STORES.MARKET_CACHE, { keyPath: 'key' });
                    mc.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    const sq = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
                    sq.createIndex('type',      'type',      { unique: false });
                    sq.createIndex('createdAt', 'createdAt', { unique: false });
                    sq.createIndex('retries',   'retries',   { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
                    db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORES.OPERATIONS)) {
                    const op = db.createObjectStore(STORES.OPERATIONS, { keyPath: 'id' });
                    op.createIndex('type',      'type',      { unique: false });
                    op.createIndex('status',    'status',    { unique: false });
                    op.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            req.onsuccess  = (e) => resolve(e.target.result);
            req.onerror    = (e) => reject(e.target.error);
        });
    }

    // ═══ مساعدات قاعدة البيانات ═══
    function txPut(db, storeName, item) {
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).put(item);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = () => reject(req.error);
        });
    }

    function txGet(db, storeName, key) {
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror   = () => reject(req.error);
        });
    }

    function txGetAll(db, storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const tx    = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            let req;
            if (indexName && value !== undefined) {
                req = store.index(indexName).getAll(value);
            } else {
                req = store.getAll();
            }
            req.onsuccess = () => resolve(req.result || []);
            req.onerror   = () => reject(req.error);
        });
    }

    function txDelete(db, storeName, key) {
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).delete(key);
            req.onsuccess = () => resolve(true);
            req.onerror   = () => reject(req.error);
        });
    }

    // ═══ توليد معرف فريد ═══
    function generateId(prefix) {
        return `${prefix || 'shk'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الواجهة العامة — SheikhaOfflineDB
    // ═══════════════════════════════════════════════════════════════════════════
    const SheikhaOfflineDB = {

        _db: null,
        _ready: false,
        _online: navigator.onLine,

        // ─── تهيئة ────────────────────────────────────────────────────────────
        async init() {
            try {
                this._db    = await openDB();
                this._ready = true;
                this._watchNetwork();
                console.log('☪️ [Sheikha Offline DB] مُفعّل — يعمل بدون إنترنت');
                this._emitEvent('sheikha:db:ready', {});
            } catch (err) {
                console.warn('[Sheikha Offline DB] خطأ في التهيئة:', err);
                this._ready = false;
            }
            return this;
        },

        // ─── مراقبة الشبكة ────────────────────────────────────────────────────
        _watchNetwork() {
            const onOnline = () => {
                this._online = true;
                console.log('[Sheikha Offline DB] 🌐 عاد الاتصال — بدء المزامنة');
                this._emitEvent('sheikha:online', {});
                this.syncAll();
            };
            const onOffline = () => {
                this._online = false;
                console.log('[Sheikha Offline DB] 📵 انقطع الاتصال — الوضع المحلي مُفعّل');
                this._emitEvent('sheikha:offline', {});
            };
            global.addEventListener('online',  onOnline);
            global.addEventListener('offline', onOffline);
        },

        _emitEvent(name, detail) {
            try {
                global.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
            } catch (_) {}
        },

        _require() {
            if (!this._ready) throw new Error('[Sheikha Offline DB] قاعدة البيانات غير جاهزة');
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 🛒 الطلبات — Orders
        // ═══════════════════════════════════════════════════════════════════════

        async saveOrder(orderData) {
            this._require();
            const order = {
                id:        orderData.id || generateId('ORD'),
                createdAt: orderData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                syncStatus: this._online ? 'synced' : 'pending',
                ...orderData,
            };
            await txPut(this._db, STORES.ORDERS, order);

            // إضافة لقائمة المزامنة إذا كنا بدون إنترنت
            if (!this._online) {
                await this._enqueue('order', order.id, {
                    method: 'POST',
                    url: '/api/orders',
                    body: order,
                });
            }
            return order;
        },

        async getOrder(id) {
            this._require();
            return txGet(this._db, STORES.ORDERS, id);
        },

        async getAllOrders(status) {
            this._require();
            if (status) return txGetAll(this._db, STORES.ORDERS, 'status', status);
            return txGetAll(this._db, STORES.ORDERS);
        },

        async updateOrderStatus(id, status, extra = {}) {
            this._require();
            const order = await this.getOrder(id);
            if (!order) return null;
            const updated = { ...order, status, updatedAt: new Date().toISOString(), ...extra };
            await txPut(this._db, STORES.ORDERS, updated);
            return updated;
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 💳 المدفوعات — Payments
        // ═══════════════════════════════════════════════════════════════════════

        async savePayment(paymentData) {
            this._require();
            const payment = {
                id:         paymentData.id || generateId('PAY'),
                createdAt:  paymentData.createdAt || new Date().toISOString(),
                updatedAt:  new Date().toISOString(),
                syncStatus: this._online ? 'synced' : 'pending',
                offlineNote: !this._online
                    ? 'تم التسجيل محلياً — سيُرسَل عند عودة الاتصال'
                    : null,
                ...paymentData,
            };
            await txPut(this._db, STORES.PAYMENTS, payment);

            // قائمة المزامنة للمدفوعات المعلّقة
            if (!this._online) {
                await this._enqueue('payment', payment.id, {
                    method: 'POST',
                    url: '/api/payments',
                    body: payment,
                    priority: 'high', // المدفوعات لها أولوية عالية
                });
                this._emitEvent('sheikha:payment:queued', { payment });
            }
            return payment;
        },

        async getPayment(id) {
            this._require();
            return txGet(this._db, STORES.PAYMENTS, id);
        },

        async getPaymentsByOrder(orderId) {
            this._require();
            return txGetAll(this._db, STORES.PAYMENTS, 'orderId', orderId);
        },

        async getPendingPayments() {
            this._require();
            return txGetAll(this._db, STORES.PAYMENTS, 'status', 'pending');
        },

        // إنشاء فاتورة أوفلاين
        async createOfflineInvoice(invoiceData) {
            const invoice = {
                id:         generateId('INV'),
                type:       'invoice',
                issueDate:  new Date().toISOString(),
                status:     'draft',
                offline:    !this._online,
                ...invoiceData,
            };
            return this.savePayment(invoice);
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 📄 التوثيق — Documents
        // ═══════════════════════════════════════════════════════════════════════

        async saveDocument(docData) {
            this._require();
            const doc = {
                id:        docData.id || generateId('DOC'),
                createdAt: docData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                syncStatus: this._online ? 'synced' : 'pending',
                ...docData,
            };
            await txPut(this._db, STORES.DOCUMENTS, doc);

            if (!this._online) {
                await this._enqueue('document', doc.id, {
                    method: 'POST',
                    url: '/api/documents',
                    body: doc,
                });
            }
            return doc;
        },

        async getDocument(id) {
            this._require();
            return txGet(this._db, STORES.DOCUMENTS, id);
        },

        async getDocumentsByType(type) {
            this._require();
            return txGetAll(this._db, STORES.DOCUMENTS, 'type', type);
        },

        async getAllDocuments() {
            this._require();
            return txGetAll(this._db, STORES.DOCUMENTS);
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 🏪 بيانات السوق — Market Cache
        // ═══════════════════════════════════════════════════════════════════════

        async cacheMarketData(key, data) {
            this._require();
            await txPut(this._db, STORES.MARKET_CACHE, {
                key,
                data,
                updatedAt: new Date().toISOString(),
            });
        },

        async getMarketData(key) {
            this._require();
            const record = await txGet(this._db, STORES.MARKET_CACHE, key);
            return record ? record.data : null;
        },

        // ═══════════════════════════════════════════════════════════════════════
        // ⚙️ العمليات — Operations
        // ═══════════════════════════════════════════════════════════════════════

        async saveOperation(opData) {
            this._require();
            const op = {
                id:        opData.id || generateId('OPS'),
                createdAt: opData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                syncStatus: this._online ? 'synced' : 'pending',
                ...opData,
            };
            await txPut(this._db, STORES.OPERATIONS, op);

            if (!this._online) {
                await this._enqueue('operation', op.id, {
                    method: opData.method || 'POST',
                    url: opData.syncUrl || '/api/operations',
                    body: op,
                });
            }
            return op;
        },

        async getOperation(id) {
            this._require();
            return txGet(this._db, STORES.OPERATIONS, id);
        },

        async getPendingOperations() {
            this._require();
            return txGetAll(this._db, STORES.OPERATIONS, 'syncStatus', 'pending');
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 👤 بيانات المستخدم المحلية — User Data
        // ═══════════════════════════════════════════════════════════════════════

        async setUserData(key, value) {
            this._require();
            await txPut(this._db, STORES.USER_DATA, { key, value, updatedAt: new Date().toISOString() });
        },

        async getUserData(key) {
            this._require();
            const record = await txGet(this._db, STORES.USER_DATA, key);
            return record ? record.value : null;
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 🔄 قائمة المزامنة — Sync Queue
        // ═══════════════════════════════════════════════════════════════════════

        async _enqueue(type, refId, request) {
            if (!this._ready) return;
            const item = {
                type,
                refId,
                request,
                createdAt: new Date().toISOString(),
                retries:   0,
                maxRetries: type === 'payment' ? 10 : 5,
            };
            await txPut(this._db, STORES.SYNC_QUEUE, item);

            // طلب Background Sync من Service Worker إن أمكن
            if ('serviceWorker' in navigator && 'SyncManager' in global) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    await reg.sync.register(`sync-${type}`);
                } catch (_) {}
            }
        },

        async getSyncQueue() {
            this._require();
            return txGetAll(this._db, STORES.SYNC_QUEUE);
        },

        async getPendingQueueCount() {
            const queue = await this.getSyncQueue();
            return queue.length;
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 🌐 المزامنة مع الخادم — Sync All Pending
        // ═══════════════════════════════════════════════════════════════════════

        async syncAll() {
            if (!this._ready || !this._online) return;

            const queue = await this.getSyncQueue();
            if (!queue.length) return;

            console.log(`[Sheikha Sync] بدء مزامنة ${queue.length} عملية معلّقة...`);
            this._emitEvent('sheikha:sync:start', { count: queue.length });

            let synced = 0;
            let failed = 0;

            for (const item of queue) {
                try {
                    const response = await fetch(item.request.url, {
                        method:  item.request.method || 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify(item.request.body),
                    });

                    if (response.ok) {
                        await txDelete(this._db, STORES.SYNC_QUEUE, item.id);
                        // تحديث حالة المزامنة في المخزن الأصلي
                        await this._markSynced(item.type, item.refId);
                        synced++;
                    } else {
                        await this._incrementRetry(item);
                        failed++;
                    }
                } catch (err) {
                    await this._incrementRetry(item);
                    failed++;
                }
            }

            console.log(`[Sheikha Sync] ✅ نجح: ${synced} | ❌ فشل: ${failed}`);
            this._emitEvent('sheikha:sync:complete', { synced, failed });

            if (synced > 0 && global.showToast) {
                global.showToast(`✅ تمت مزامنة ${synced} عملية بنجاح`, 'success');
            }
        },

        async _markSynced(type, refId) {
            const storeMap = {
                order:     STORES.ORDERS,
                payment:   STORES.PAYMENTS,
                document:  STORES.DOCUMENTS,
                operation: STORES.OPERATIONS,
            };
            const storeName = storeMap[type];
            if (!storeName) return;
            const record = await txGet(this._db, storeName, refId);
            if (record) {
                await txPut(this._db, storeName, {
                    ...record,
                    syncStatus: 'synced',
                    syncedAt:   new Date().toISOString(),
                });
            }
        },

        async _incrementRetry(item) {
            const updated = { ...item, retries: (item.retries || 0) + 1 };
            if (updated.retries >= updated.maxRetries) {
                // حذف من القائمة بعد استنفاد المحاولات وتسجيل الفشل
                await txDelete(this._db, STORES.SYNC_QUEUE, item.id);
                await this._markFailed(item.type, item.refId);
                console.warn(`[Sheikha Sync] تجاوز الحد الأقصى للمحاولات: ${item.type}#${item.refId}`);
            } else {
                await txPut(this._db, STORES.SYNC_QUEUE, updated);
            }
        },

        async _markFailed(type, refId) {
            const storeMap = {
                order:     STORES.ORDERS,
                payment:   STORES.PAYMENTS,
                document:  STORES.DOCUMENTS,
                operation: STORES.OPERATIONS,
            };
            const storeName = storeMap[type];
            if (!storeName) return;
            const record = await txGet(this._db, storeName, refId);
            if (record) {
                await txPut(this._db, storeName, {
                    ...record,
                    syncStatus: 'failed',
                    failedAt:   new Date().toISOString(),
                });
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 📊 إحصائيات الوضع — Status
        // ═══════════════════════════════════════════════════════════════════════

        async getStatus() {
            if (!this._ready) return { ready: false };
            const [orders, payments, docs, ops, queue] = await Promise.all([
                txGetAll(this._db, STORES.ORDERS),
                txGetAll(this._db, STORES.PAYMENTS),
                txGetAll(this._db, STORES.DOCUMENTS),
                txGetAll(this._db, STORES.OPERATIONS),
                txGetAll(this._db, STORES.SYNC_QUEUE),
            ]);
            return {
                ready:     true,
                online:    this._online,
                orders:    orders.length,
                payments:  payments.length,
                documents: docs.length,
                operations: ops.length,
                pendingSync: queue.length,
                pendingOrders:   orders.filter(o => o.syncStatus === 'pending').length,
                pendingPayments: payments.filter(p => p.syncStatus === 'pending').length,
            };
        },

        // ═══════════════════════════════════════════════════════════════════════
        // 🗑️ تنظيف — Clear old synced data
        // ═══════════════════════════════════════════════════════════════════════
        async clearSynced(olderThanDays = 30) {
            if (!this._ready) return;
            const cutoff = new Date(Date.now() - olderThanDays * 864e5).toISOString();
            const stores = [STORES.ORDERS, STORES.PAYMENTS, STORES.DOCUMENTS, STORES.OPERATIONS];
            for (const storeName of stores) {
                const records = await txGetAll(this._db, storeName);
                for (const r of records) {
                    if (r.syncStatus === 'synced' && r.createdAt < cutoff) {
                        await txDelete(this._db, storeName, r.id);
                    }
                }
            }
        },
    };

    // ─── تصدير + بدء تلقائي ────────────────────────────────────────────────────
    global.SheikhaOfflineDB = SheikhaOfflineDB;

    // بدء تلقائي عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SheikhaOfflineDB.init());
    } else {
        SheikhaOfflineDB.init();
    }

}(typeof window !== 'undefined' ? window : self));
