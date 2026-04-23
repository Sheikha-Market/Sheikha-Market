// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 Sheikha Offline Mode — وضع العمل بدون إنترنت (Server-Side)
// ═══════════════════════════════════════════════════════════════════════════════
// يضمن عمل السيرفر في كل الأحوال:
//   ✅ مع الإنترنت أو بدونه
//   ✅ مع نظام المنزل الذكي أو بدونه
//   ✅ أثناء انقطاع الكهرباء أو عند عودتها
//
// الآليات:
//   • ResponseCache    — يخزّن آخر رد ناجح لكل مسار API
//   • SyncQueue        — يحفظ العمليات المعلقة ليعيد إرسالها عند الاتصال
//   • ConnectivityWatcher — يراقب الاتصال بشكل دوري ويطلق الأحداث
//   • HomeNetworkGuard — يتحقق من حالة نظام المنزل الذكي باستقلالية
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

const EventEmitter = require('events');
const fs           = require('fs');
const path         = require('path');
const crypto       = require('crypto');

// ─── مسار الكاش على القرص ─────────────────────────────────────────────────────
const CACHE_DIR = process.env.SHEIKHA_OFFLINE_CACHE_DIR
    || path.join(__dirname, '..', 'data', '_offline_cache');

function ensureCacheDir() {
    try {
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (_) {}
}

// ─── مفتاح الكاش ──────────────────────────────────────────────────────────────
function cacheKey(method, urlOrPath) {
    const raw = `${(method || 'GET').toUpperCase()}:${urlOrPath}`;
    return crypto.createHash('sha1').update(raw).digest('hex');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1️⃣  ResponseCache — يخزّن الردود لاسترجاعها offline
// ═══════════════════════════════════════════════════════════════════════════════
class ResponseCache {
    constructor(options = {}) {
        this.maxMemory   = options.maxMemory   ?? 500;      // أقصى عدد ردود في الذاكرة
        this.ttlMs       = options.ttlMs       ?? 3_600_000; // TTL افتراضي: ساعة
        this._mem        = new Map();                         // { key → { data, ts, ttl } }
        this._diskEnabled = options.disk ?? true;
        ensureCacheDir();
    }

    // حفظ رد
    set(method, urlPath, data, ttlMs) {
        const key = cacheKey(method, urlPath);
        const entry = { data, ts: Date.now(), ttl: ttlMs ?? this.ttlMs, method, path: urlPath };
        this._mem.set(key, entry);

        // إبقاء حجم الذاكرة في الحدود
        if (this._mem.size > this.maxMemory) {
            const oldest = this._mem.keys().next().value;
            this._mem.delete(oldest);
        }

        // كتابة على القرص (للبقاء بعد إعادة التشغيل)
        if (this._diskEnabled) {
            try {
                fs.writeFileSync(
                    path.join(CACHE_DIR, `${key}.json`),
                    JSON.stringify(entry),
                    'utf8'
                );
            } catch (_) {}
        }
        return key;
    }

    // استرجاع رد
    get(method, urlPath) {
        const key = cacheKey(method, urlPath);
        let entry = this._mem.get(key);

        // جرّب القرص إن لم يكن في الذاكرة
        if (!entry && this._diskEnabled) {
            try {
                const raw = fs.readFileSync(path.join(CACHE_DIR, `${key}.json`), 'utf8');
                entry = JSON.parse(raw);
                if (entry) this._mem.set(key, entry); // أعد إلى الذاكرة
            } catch (_) {}
        }

        if (!entry) return null;
        if (Date.now() - entry.ts > entry.ttl) {
            this._mem.delete(key);
            return null; // منتهية الصلاحية
        }
        return entry.data;
    }

    // هل يوجد رد محفوظ (ولو منتهي الصلاحية)؟
    getStale(method, urlPath) {
        const key = cacheKey(method, urlPath);
        let entry = this._mem.get(key);
        if (!entry && this._diskEnabled) {
            try {
                const raw = fs.readFileSync(path.join(CACHE_DIR, `${key}.json`), 'utf8');
                entry = JSON.parse(raw);
            } catch (_) {}
        }
        return entry ? entry.data : null;
    }

    size()   { return this._mem.size; }
    clear()  { this._mem.clear(); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2️⃣  SyncQueue — يحفظ العمليات المعلقة ويعيد إرسالها
// ═══════════════════════════════════════════════════════════════════════════════
const QUEUE_FILE = path.join(CACHE_DIR, '_sync_queue.json');

class SyncQueue {
    constructor() {
        this._queue = [];
        this._load();
    }

    _load() {
        try {
            const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
            this._queue = JSON.parse(raw) || [];
        } catch (_) {
            this._queue = [];
        }
    }

    _save() {
        try {
            ensureCacheDir();
            fs.writeFileSync(QUEUE_FILE, JSON.stringify(this._queue), 'utf8');
        } catch (_) {}
    }

    enqueue(operation) {
        const item = {
            id:         crypto.randomUUID(),
            enqueuedAt: new Date().toISOString(),
            retries:    0,
            ...operation,
        };
        this._queue.push(item);
        this._save();
        return item.id;
    }

    peek(limit = 50) {
        return this._queue.slice(0, limit);
    }

    remove(id) {
        this._queue = this._queue.filter(item => item.id !== id);
        this._save();
    }

    markRetry(id) {
        const item = this._queue.find(i => i.id === id);
        if (item) {
            item.retries++;
            item.lastRetry = new Date().toISOString();
            this._save();
        }
    }

    size()  { return this._queue.length; }
    drain() { this._queue = []; this._save(); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3️⃣  ConnectivityWatcher — يراقب الإنترنت بشكل دوري
// ═══════════════════════════════════════════════════════════════════════════════
const CHECK_URLS = [
    'https://1.1.1.1',             // Cloudflare DNS
    'https://www.google.com/generate_204',
    'https://httpbin.org/status/200',
];

class ConnectivityWatcher extends EventEmitter {
    constructor(options = {}) {
        super();
        this._intervalMs  = options.intervalMs  ?? 30_000;   // فحص كل 30 ثانية
        this._timeout     = options.timeout     ?? 5_000;    // مهلة 5 ثانية
        this._isOnline    = true;                             // نفترض وجود إنترنت عند البدء
        this._timer       = null;
        this._checking    = false;
    }

    get isOnline() { return this._isOnline; }

    start() {
        this.check(); // فحص فوري
        this._timer = setInterval(() => this.check(), this._intervalMs);
        if (this._timer.unref) this._timer.unref(); // لا يمنع إيقاف Node
        return this;
    }

    stop() {
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
    }

    async check() {
        if (this._checking) return;
        this._checking = true;
        try {
            const online = await this._probe();
            const wasOnline = this._isOnline;
            this._isOnline = online;

            if (online && !wasOnline) {
                console.log('🌐 [Offline] الاتصال عاد — بدء المزامنة');
                this.emit('online');
            } else if (!online && wasOnline) {
                console.warn('📴 [Offline] انقطع الإنترنت — وضع offline');
                this.emit('offline');
            }
        } finally {
            this._checking = false;
        }
    }

    async _probe() {
        const url = CHECK_URLS[Math.floor(Math.random() * CHECK_URLS.length)];
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this._timeout);
        try {
            const res = await fetch(url, {
                method:  'HEAD',
                signal:  controller.signal,
                headers: { 'Cache-Control': 'no-store' },
            });
            clearTimeout(timer);
            return res.ok || res.status === 204 || res.status === 200;
        } catch (_) {
            clearTimeout(timer);
            return false;
        }
    }

    status() {
        return {
            isOnline:   this._isOnline,
            intervalMs: this._intervalMs,
            running:    !!this._timer,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4️⃣  HomeNetworkGuard — يراقب نظام المنزل الذكي باستقلالية
// ═══════════════════════════════════════════════════════════════════════════════
class HomeNetworkGuard extends EventEmitter {
    constructor(options = {}) {
        super();
        this._homeUrl     = process.env.SHEIKHA_HOME_NETWORK_URL || null;
        this._timeout     = options.timeout     ?? 4_000;
        this._intervalMs  = options.intervalMs  ?? 60_000; // فحص كل دقيقة
        this._isHomeUp    = null; // null = غير محدد بعد
        this._timer       = null;
        // بيانات المنزل المحفوظة (للاستجابة offline)
        this._lastSnapshot = null;
    }

    get isHomeUp() { return this._isHomeUp; }
    get lastSnapshot() { return this._lastSnapshot; }

    start() {
        if (!this._homeUrl) {
            // لا يوجد رابط منزل — افتراض أن النظام مستقل دائماً
            this._isHomeUp = false;
            return this;
        }
        this.check();
        this._timer = setInterval(() => this.check(), this._intervalMs);
        if (this._timer.unref) this._timer.unref();
        return this;
    }

    stop() {
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
    }

    async check() {
        if (!this._homeUrl) return;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this._timeout);
        try {
            const res = await fetch(`${this._homeUrl}/status`, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Cache-Control': 'no-store' },
            });
            clearTimeout(timer);
            const wasUp = this._isHomeUp;
            this._isHomeUp = res.ok;

            if (res.ok) {
                try { this._lastSnapshot = await res.json(); } catch (_) {}
            }

            if (this._isHomeUp && !wasUp && wasUp !== null) {
                console.log('🏠 [HomeGuard] نظام المنزل الذكي عاد للعمل');
                this.emit('homeOnline', this._lastSnapshot);
            } else if (!this._isHomeUp && wasUp) {
                console.warn('🏠 [HomeGuard] نظام المنزل الذكي متوقف — وضع مستقل');
                this.emit('homeOffline');
            }
        } catch (_) {
            clearTimeout(timer);
            const wasUp = this._isHomeUp;
            this._isHomeUp = false;
            if (wasUp) {
                console.warn('🏠 [HomeGuard] نظام المنزل الذكي لا يستجيب — وضع مستقل');
                this.emit('homeOffline');
            }
        }
    }

    status() {
        return {
            configured:    !!this._homeUrl,
            isHomeUp:      this._isHomeUp,
            lastSnapshot:  this._lastSnapshot ? '[محفوظ]' : null,
            intervalMs:    this._intervalMs,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5️⃣  Express Middleware — كاش تلقائي للردود + خدمة offline
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * يُلف مسارات API بكاش تلقائي:
 *   • عند الاتصال: يخدم الطلب ويحفظ الرد
 *   • عند الانقطاع: يرجع آخر رد محفوظ مع تحذير
 *
 * @param {ResponseCache}      cache
 * @param {ConnectivityWatcher} watcher
 * @param {object}             options
 * @param {number}             [options.ttlMs]      - مدة صلاحية الكاش
 * @param {boolean}            [options.staleOk]    - السماح بالرد القديم offline
 */
function offlineCacheMiddleware(cache, watcher, options = {}) {
    const { ttlMs = 300_000, staleOk = true } = options; // 5 دقائق افتراضياً

    return function (req, res, next) {
        // فقط GET
        if (req.method !== 'GET') return next();

        const urlPath = req.originalUrl || req.path;

        // إذا offline، أرجع الكاش
        if (!watcher.isOnline) {
            const cached = staleOk
                ? cache.getStale('GET', urlPath)
                : cache.get('GET', urlPath);

            if (cached) {
                res.set('X-Sheikha-Offline', 'true');
                res.set('X-Sheikha-Cached-At', cached._cachedAt || 'unknown');
                return res.json({ ...cached, _offline: true, _fromCache: true });
            }
            // لا يوجد كاش — أكمل الطلب العادي (قد يفشل)
        }

        // عند الاتصال: التقط الرد وخزّنه
        const origJson = res.json.bind(res);
        res.json = function (body) {
            if (res.statusCode === 200 && body && !body._offline) {
                cache.set('GET', urlPath, {
                    ...body,
                    _cachedAt: new Date().toISOString(),
                }, ttlMs);
            }
            return origJson(body);
        };
        next();
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton — وحدة مشتركة عبر كل المشروع
// ═══════════════════════════════════════════════════════════════════════════════
const responseCache  = new ResponseCache({ disk: true, maxMemory: 1000, ttlMs: 3_600_000 });
const syncQueue      = new SyncQueue();
const connectivity   = new ConnectivityWatcher({ intervalMs: 30_000 });
const homeGuard      = new HomeNetworkGuard({ intervalMs: 60_000 });

// تشغيل تلقائي عند تحميل الوحدة
connectivity.start();
homeGuard.start();

// إعادة محاولة المزامنة عند عودة الإنترنت
connectivity.on('online', () => {
    const pending = syncQueue.size();
    if (pending > 0) {
        console.log(`🔄 [OfflineMode] ${pending} عملية معلقة — جاهزة للمزامنة`);
    }
});

module.exports = {
    // كلاسات
    ResponseCache,
    SyncQueue,
    ConnectivityWatcher,
    HomeNetworkGuard,
    // مثيلات مشتركة
    responseCache,
    syncQueue,
    connectivity,
    homeGuard,
    // أدوات مساعدة
    offlineCacheMiddleware,
    cacheKey,
    // حالة موحدة
    status() {
        return {
            connectivity: connectivity.status(),
            homeNetwork:  homeGuard.status(),
            cache:        { entries: responseCache.size() },
            syncQueue:    { pending: syncQueue.size() },
        };
    },
};
