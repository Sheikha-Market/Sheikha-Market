/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      lib/data/index.js                                      ║
 * ║              طبقة البيانات — التخزين والاسترجاع والتحقق                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * أنواع البيانات في شيخة:
 *  - بيانات تشغيلية
 *  - بيانات سوق (منتجات، أسعار)
 *  - بيانات مستخدمين
 *  - بيانات أحداث
 *  - بيانات تحليلات
 *  - بيانات تكاملات
 *
 * البنى المدعومة: Arrays | Objects | Maps | Queues | Indexes | Caches
 */

'use strict';

const crypto = require('crypto');

// ─── In-Memory Store (طبقة التخزين المؤقت) ───────────────────────────────────

class DataStore {
    constructor(name) {
        this.name      = name;
        this._store    = new Map();
        this._indexes  = new Map(); // fieldName → Map(value → Set(key))
        this._ttls     = new Map(); // key → expireAt ms
        this._created  = new Date().toISOString();
    }

    /** تخزين سجل */
    set(key, value, ttlMs = null) {
        this._store.set(key, {
            key,
            value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        if (ttlMs) {
            this._ttls.set(key, Date.now() + ttlMs);
        }
        this._updateIndexes(key, value);
        return { ok: true, key };
    }

    /** استرجاع سجل */
    get(key) {
        this._evict(key);
        const record = this._store.get(key);
        return record ? record.value : null;
    }

    /** حذف سجل */
    delete(key) {
        this._store.delete(key);
        this._ttls.delete(key);
        return true;
    }

    /** هل السجل موجود؟ */
    has(key) {
        this._evict(key);
        return this._store.has(key);
    }

    /** قائمة المفاتيح */
    keys() {
        this._evictAll();
        return Array.from(this._store.keys());
    }

    /** كل السجلات */
    all() {
        this._evictAll();
        return Array.from(this._store.values()).map(r => r.value);
    }

    /** حجم المخزن */
    size() {
        return this._store.size;
    }

    /** مسح المخزن */
    clear() {
        this._store.clear();
        this._indexes.clear();
        this._ttls.clear();
    }

    /** بناء index على حقل */
    buildIndex(fieldName) {
        const idx = new Map();
        this._store.forEach(({ value }, key) => {
            if (value && value[fieldName] !== undefined) {
                const fieldVal = String(value[fieldName]);
                if (!idx.has(fieldVal)) idx.set(fieldVal, new Set());
                idx.get(fieldVal).add(key);
            }
        });
        this._indexes.set(fieldName, idx);
        return this;
    }

    /** بحث بقيمة حقل */
    findBy(fieldName, fieldValue) {
        const idx = this._indexes.get(fieldName);
        if (!idx) return this.all().filter(v => v[fieldName] == fieldValue);
        const keys = idx.get(String(fieldValue)) || new Set();
        return Array.from(keys).map(k => this.get(k)).filter(Boolean);
    }

    _updateIndexes(key, value) {
        this._indexes.forEach((idx, field) => {
            if (value && value[field] !== undefined) {
                const fv = String(value[field]);
                if (!idx.has(fv)) idx.set(fv, new Set());
                idx.get(fv).add(key);
            }
        });
    }

    _evict(key) {
        const exp = this._ttls.get(key);
        if (exp && Date.now() > exp) {
            this._store.delete(key);
            this._ttls.delete(key);
        }
    }

    _evictAll() {
        const now = Date.now();
        this._ttls.forEach((exp, key) => {
            if (now > exp) {
                this._store.delete(key);
                this._ttls.delete(key);
            }
        });
    }
}

// ─── Queue ────────────────────────────────────────────────────────────────────

class DataQueue {
    constructor(name) {
        this.name   = name;
        this._items = [];
    }

    enqueue(item) {
        this._items.push({ item, enqueuedAt: new Date().toISOString() });
    }

    dequeue() {
        const entry = this._items.shift();
        return entry ? entry.item : null;
    }

    peek() {
        return this._items[0]?.item || null;
    }

    size() {
        return this._items.length;
    }

    isEmpty() {
        return this._items.length === 0;
    }
}

// ─── Cache ────────────────────────────────────────────────────────────────────

class DataCache {
    constructor(name, defaultTtlMs = 60_000) {
        this.name          = name;
        this.defaultTtlMs  = defaultTtlMs;
        this._store        = new DataStore(name + ':cache');
    }

    set(key, value, ttlMs) {
        return this._store.set(key, value, ttlMs || this.defaultTtlMs);
    }

    get(key) {
        return this._store.get(key);
    }

    has(key) {
        return this._store.has(key);
    }

    delete(key) {
        return this._store.delete(key);
    }

    size() {
        return this._store.size();
    }
}

// ─── Sheikha Data Stores ──────────────────────────────────────────────────────

const stores = {
    operational: new DataStore('operational'),
    market:      new DataStore('market'),
    users:       new DataStore('users'),
    products:    new DataStore('products'),
    events:      new DataStore('events'),
    analytics:   new DataStore('analytics'),
    integrations: new DataStore('integrations'),
};

const queues = {
    jobs:    new DataQueue('jobs'),
    events:  new DataQueue('events'),
    alerts:  new DataQueue('alerts'),
};

const caches = {
    api:      new DataCache('api',     30_000),
    sessions: new DataCache('sessions', 3_600_000),
    prices:   new DataCache('prices',   60_000),
};

// ─── ID Generator ─────────────────────────────────────────────────────────────

/**
 * توليد معرّف فريد
 * @param {string} prefix
 */
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * التحقق من مطابقة بيانات لمخطط بسيط
 * @param {object} data
 * @param {object} schema — { field: 'string'|'number'|'boolean'|'required' }
 */
function validate(data, schema) {
    const errors = [];
    Object.entries(schema).forEach(([field, type]) => {
        const val = data[field];
        if (type === 'required' && (val === undefined || val === null || val === '')) {
            errors.push(`الحقل "${field}" مطلوب`);
        } else if (val !== undefined && val !== null) {
            if (type === 'string'  && typeof val !== 'string')  errors.push(`"${field}" يجب أن يكون نصًا`);
            if (type === 'number'  && typeof val !== 'number')  errors.push(`"${field}" يجب أن يكون رقمًا`);
            if (type === 'boolean' && typeof val !== 'boolean') errors.push(`"${field}" يجب أن يكون true/false`);
        }
    });
    return { valid: errors.length === 0, errors };
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        name: 'data-layer',
        stores: Object.fromEntries(
            Object.entries(stores).map(([k, s]) => [k, s.size()])
        ),
        queues: Object.fromEntries(
            Object.entries(queues).map(([k, q]) => [k, q.size()])
        ),
        caches: Object.fromEntries(
            Object.entries(caches).map(([k, c]) => [k, c.size()])
        ),
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    DataStore,
    DataQueue,
    DataCache,
    stores,
    queues,
    caches,
    generateId,
    validate,
    status,
};
