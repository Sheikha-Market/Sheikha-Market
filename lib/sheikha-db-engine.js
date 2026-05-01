/**
 * بسم الله الرحمن الرحيم
 * =============================================================================
 * محرك قاعدة بيانات شيخة — طبقة التجريد الموحدة
 * SHEIKHA DB ENGINE — Unified Database Abstraction Layer
 * =============================================================================
 * يدعم:
 *   1. MongoDB (عند توفر MONGODB_URI في متغيرات البيئة)
 *   2. JSON Files  (الوضع الافتراضي — متوافق مع الكود الحالي بالكامل)
 *
 * الواجهة موحدة في الحالتين — لا يتغير كود الاستدعاء عند الترقية
 * =============================================================================
 * ولا حول ولا قوة إلا بالله العلي العظيم
 * المالك: سلمان أحمد بن سلمان الراجح | 1031605270 | market@sheikha.top
 */
'use strict';

const fs   = require('fs');
const path = require('path');

/* ── ثوابت ──────────────────────────────────────────────────────── */
const DEFAULT_DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_TTL_MS     = 60_000;   // 60 ثانية — مدة صلاحية الكاش
const WRITE_DEBOUNCE   = 500;      // ms — تأخير الكتابة (منع الطحن)

/* ══════════════════════════════════════════════════════════════════
 * JsonCollection — تمثيل مجموعة في وضع JSON
 * ══════════════════════════════════════════════════════════════════ */
class JsonCollection {
    constructor(filePath, options = {}) {
        this._file    = filePath;
        this._cache   = null;
        this._cacheAt = 0;
        this._dirty   = false;
        this._timer   = null;
        this._lock    = false;
        this._idField = options.idField || 'id';

        // تأكد من وجود الملف
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
    }

    /* ── قراءة ──────────────────────────────────────────────────── */
    _load() {
        const now = Date.now();
        if (this._cache !== null && (now - this._cacheAt) < CACHE_TTL_MS) {
            return this._cache;
        }
        try {
            const raw = fs.readFileSync(this._file, 'utf8');
            this._cache   = JSON.parse(raw || '[]');
            this._cacheAt = now;
        } catch {
            this._cache   = [];
            this._cacheAt = now;
        }
        return this._cache;
    }

    /* ── كتابة مع debounce ──────────────────────────────────────── */
    _scheduleWrite() {
        this._dirty = true;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => this._flush(), WRITE_DEBOUNCE);
    }

    _flush() {
        if (!this._dirty || this._cache === null) return;
        try {
            fs.writeFileSync(this._file, JSON.stringify(this._cache, null, 2), 'utf8');
            this._dirty = false;
        } catch (err) {
            console.error(`[DB] flush error ${this._file}:`, err.message);
        }
    }

    flushSync() { this._flush(); }

    /* ── واجهة MongoDB-compatible ───────────────────────────────── */

    /**
     * إيجاد وثائق
     * @param {Object} filter — كائن المرشح (shallow equality)
     * @param {Object} [options] — { limit, skip, sort }
     */
    async find(filter = {}, options = {}) {
        let data = this._load();
        const keys = Object.keys(filter);
        if (keys.length > 0) {
            data = data.filter(doc =>
                keys.every(k => {
                    const fv = filter[k];
                    // دعم { $regex } و { $gte } و { $lte } بشكل محدود
                    if (fv !== null && typeof fv === 'object') {
                        if ('$regex' in fv) return new RegExp(fv.$regex, fv.$options || 'i').test(doc[k]);
                        if ('$gte'   in fv) return doc[k] >= fv.$gte;
                        if ('$lte'   in fv) return doc[k] <= fv.$lte;
                        if ('$in'    in fv) return Array.isArray(fv.$in) && fv.$in.includes(doc[k]);
                        if ('$ne'    in fv) return doc[k] !== fv.$ne;
                    }
                    return doc[k] === fv;
                })
            );
        }
        if (options.sort) {
            const [field, dir] = Object.entries(options.sort)[0];
            data = [...data].sort((a, b) =>
                dir === -1 || dir === 'desc'
                    ? (b[field] > a[field] ? 1 : -1)
                    : (a[field] > b[field] ? 1 : -1)
            );
        }
        if (options.skip)  data = data.slice(options.skip);
        if (options.limit) data = data.slice(0, options.limit);
        return data;
    }

    /** إيجاد وثيقة واحدة */
    async findOne(filter = {}) {
        const results = await this.find(filter, { limit: 1 });
        return results[0] || null;
    }

    /** إيجاد بالمعرف */
    async findById(id) {
        return this.findOne({ [this._idField]: id });
    }

    /** إضافة وثيقة */
    async insertOne(doc) {
        const data = this._load();
        if (!doc[this._idField]) {
            doc = { [this._idField]: _genId(), ...doc };
        }
        doc.createdAt = doc.createdAt || new Date().toISOString();
        doc.updatedAt = new Date().toISOString();
        data.push(doc);
        this._scheduleWrite();
        return { insertedId: doc[this._idField], ops: [doc] };
    }

    /** إضافة عدة وثائق */
    async insertMany(docs) {
        const results = [];
        for (const doc of docs) results.push(await this.insertOne(doc));
        return results;
    }

    /** تحديث وثيقة */
    async updateOne(filter, update, options = {}) {
        const data = this._load();
        const keys = Object.keys(filter);
        const idx  = data.findIndex(doc =>
            keys.every(k => doc[k] === filter[k])
        );
        if (idx === -1) {
            if (options.upsert) {
                const newDoc = { ...filter, ...(update.$set || update), updatedAt: new Date().toISOString() };
                if (!newDoc[this._idField]) newDoc[this._idField] = _genId();
                data.push(newDoc);
                this._scheduleWrite();
                return { matchedCount: 0, modifiedCount: 0, upsertedId: newDoc[this._idField] };
            }
            return { matchedCount: 0, modifiedCount: 0 };
        }
        const patch = update.$set || update;
        data[idx] = { ...data[idx], ...patch, updatedAt: new Date().toISOString() };
        this._scheduleWrite();
        return { matchedCount: 1, modifiedCount: 1 };
    }

    /** تحديث عدة وثائق */
    async updateMany(filter, update) {
        const data = this._load();
        const keys = Object.keys(filter);
        let count  = 0;
        const patch = update.$set || update;
        data.forEach((doc, i) => {
            if (keys.every(k => doc[k] === filter[k])) {
                data[i] = { ...doc, ...patch, updatedAt: new Date().toISOString() };
                count++;
            }
        });
        if (count > 0) this._scheduleWrite();
        return { matchedCount: count, modifiedCount: count };
    }

    /** حذف وثيقة */
    async deleteOne(filter) {
        const data = this._load();
        const keys = Object.keys(filter);
        const idx  = data.findIndex(doc => keys.every(k => doc[k] === filter[k]));
        if (idx === -1) return { deletedCount: 0 };
        data.splice(idx, 1);
        this._scheduleWrite();
        return { deletedCount: 1 };
    }

    /** حذف عدة وثائق */
    async deleteMany(filter) {
        const data  = this._load();
        const keys  = Object.keys(filter);
        const before = data.length;
        const kept   = data.filter(doc => !keys.every(k => doc[k] === filter[k]));
        const deleted = before - kept.length;
        if (deleted > 0) {
            this._cache = kept;
            this._scheduleWrite();
        }
        return { deletedCount: deleted };
    }

    /** عد الوثائق */
    async countDocuments(filter = {}) {
        const results = await this.find(filter);
        return results.length;
    }

    /** استبدال الكل */
    async replaceAll(docs) {
        this._cache = Array.isArray(docs) ? [...docs] : [];
        this._scheduleWrite();
        return { replacedCount: this._cache.length };
    }

    /** الحصول على كل البيانات الخام */
    async getAll() {
        return this._load();
    }
}

/* ══════════════════════════════════════════════════════════════════
 * SheikhaDB — المحرك الرئيسي
 * ══════════════════════════════════════════════════════════════════ */
class SheikhaDB {
    constructor(options = {}) {
        this.name      = 'محرك قاعدة بيانات شيخة';
        this.nameEn    = 'Sheikha DB Engine';
        this.version   = '1.0.0';
        this.dataDir   = options.dataDir || DEFAULT_DATA_DIR;
        this.mode      = 'json';   // 'json' | 'mongodb'
        this.connected = false;
        this._cols     = new Map();  // cache of JsonCollection instances
        this._mongoDb  = null;

        // إنشاء مجلد البيانات إذا لم يوجد
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

        // محاولة الاتصال بـ MongoDB إذا كان URI متوفراً
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
        if (mongoUri && mongoUri.startsWith('mongodb')) {
            this._tryConnectMongo(mongoUri);
        }
    }

    /* ── الاتصال بـ MongoDB (اختياري) ──────────────────────────── */
    async _tryConnectMongo(uri) {
        try {
            // نحاول require mongoose ديناميكياً — إن لم يكن موجوداً نواصل بـ JSON
            const mongoose = require('mongoose');
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10_000
            });
            this._mongoDb  = mongoose.connection.db;
            this.mode      = 'mongodb';
            this.connected = true;
            console.log('✅ [DB] اتصال MongoDB ناجح —', uri.split('@').pop());
        } catch (err) {
            console.warn('⚠️ [DB] MongoDB غير متاح — الوضع الاحتياطي: JSON files:', err.message);
            this.mode      = 'json';
            this.connected = false;
        }
    }

    /**
     * الحصول على مجموعة
     * @param {string} name — اسم المجموعة / اسم ملف JSON (بدون .json)
     * @param {Object} [options]
     */
    collection(name, options = {}) {
        if (this.mode === 'mongodb' && this._mongoDb) {
            return this._mongoDb.collection(name);
        }
        // وضع JSON
        if (!this._cols.has(name)) {
            const filePath = path.join(this.dataDir, `${name}.json`);
            this._cols.set(name, new JsonCollection(filePath, options));
        }
        return this._cols.get(name);
    }

    /** مجموعة بمسار مخصص */
    collectionFromFile(filePath, options = {}) {
        const key = filePath;
        if (!this._cols.has(key)) {
            this._cols.set(key, new JsonCollection(filePath, options));
        }
        return this._cols.get(key);
    }

    /** تفريغ كل الكاش على القرص فوراً */
    flushAll() {
        for (const col of this._cols.values()) col.flushSync();
    }

    /** معلومات الحالة */
    getStatus() {
        return {
            success:    true,
            name:       this.name,
            version:    this.version,
            mode:       this.mode,
            connected:  this.connected,
            dataDir:    this.dataDir,
            collections: this._cols.size,
            migration: {
                status:      this.mode === 'mongodb' ? 'completed' : 'pending',
                nextStep:    this.mode === 'json'
                    ? 'أضف MONGODB_URI في متغيرات البيئة لتفعيل MongoDB تلقائياً'
                    : 'MongoDB نشط — كل البيانات محفوظة في قاعدة البيانات',
                envRequired: 'MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sheikha'
            },
            timestamp: new Date().toISOString()
        };
    }

    /** إحصائيات ملفات البيانات */
    async getDataStats() {
        const stats = { mode: this.mode, files: [] };
        if (this.mode === 'json') {
            try {
                const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
                for (const f of files) {
                    const fp = path.join(this.dataDir, f);
                    const st = fs.statSync(fp);
                    let count = 0;
                    try {
                        const data = JSON.parse(fs.readFileSync(fp, 'utf8') || '[]');
                        count = Array.isArray(data) ? data.length : 1;
                    } catch { count = -1; }
                    stats.files.push({ name: f, sizeKB: Math.round(st.size / 1024), records: count });
                }
            } catch (err) {
                stats.error = err.message;
            }
        }
        return stats;
    }
}

/* ── مساعدات ──────────────────────────────────────────────────── */
function _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ── تصدير سينجلتون + الكلاسات ─────────────────────────────────── */
const sheikhaDB = new SheikhaDB();

module.exports = sheikhaDB;
module.exports.SheikhaDB         = SheikhaDB;
module.exports.JsonCollection    = JsonCollection;
