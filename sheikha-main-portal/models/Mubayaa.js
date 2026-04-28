/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🤝 نموذج المبايعة الرقمية
 *  Digital Pledge (Mubayaa) Model
 *
 *  المبايعة: عقد الولاء والطاعة لولي الأمر على السمع والطاعة في المعروف.
 *  المرجع: كتاب الله وسنة النبي ﷺ
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const { v4: uuid } = require('uuid');
const crypto = require('crypto');
const database = require('../config/database');

// ─── نص المبايعة الرسمي ───────────────────────────────────────────────────────

const MUBAYAA_TEXT_AR = `أُبايع الملك سلمان بن عبدالعزيز آل سعود ولي أمري على السمع والطاعة في المعروف،
وأناصر الملك والدولة - المملكة العربية السعودية - لله سبحانه وتعالى،
وأُعادي أعداء الدولة الذين هم أعداء الله، على كتاب الله وسنة نبيه محمد ﷺ.`;

const MUBAYAA_TEXT_EN = `I pledge allegiance to King Salman bin Abdulaziz Al Saud, my guardian,
with obedience in what is right and good, in accordance with the Book of Allah
and the Sunnah of His Prophet Muhammad ﷺ.`;

// ─── المبايعة الرقمية ─────────────────────────────────────────────────────────

class Mubayaa {
    constructor(data = {}) {
        this.id            = data.id            || uuid();
        // بيانات المُبايِع
        this.fullName      = data.fullName      || '';
        this.tribe         = data.tribe         || null;
        this.nationality   = data.nationality   || 'SA';
        this.religion      = data.religion      || 'Islam';
        this.madhhab       = data.madhhab       || null;   // سني | شافعي | حنبلي | مالكي | حنفي
        // ربط بالمستخدم (اختياري — يمكن المبايعة بدون حساب)
        this.userId        = data.userId        || null;
        // نص المبايعة المُستخدَم
        this.textAr        = data.textAr        || MUBAYAA_TEXT_AR;
        this.textEn        = data.textEn        || MUBAYAA_TEXT_EN;
        // الموافقة الصريحة
        this.agreed        = data.agreed        === true;
        // التوقيع الرقمي (بصمة + وقت)
        this.signature     = data.signature     || null;
        // معلومات الجهاز والشبكة (للتوثيق)
        this.ipAddress     = data.ipAddress     || null;
        this.userAgent     = data.userAgent     || null;
        // الحالة
        this.status        = data.status        || 'active'; // active | revoked
        // التوقيت
        this.pledgedAt     = data.pledgedAt     || new Date().toISOString();
        this.createdAt     = data.createdAt     || new Date().toISOString();
        this.updatedAt     = data.updatedAt     || new Date().toISOString();
    }

    // ─── إنشاء التوقيع الرقمي ────────────────────────────────────────────────
    generateSignature() {
        const payload = `${this.id}|${this.fullName}|${this.pledgedAt}`;
        this.signature = crypto
            .createHash('sha256')
            .update(payload)
            .digest('hex');
        return this.signature;
    }

    // ─── حفظ المبايعة ────────────────────────────────────────────────────────
    save() {
        this.updatedAt = new Date().toISOString();
        if (!this.signature) this.generateSignature();

        const records = database.read('mubayaa') || [];
        const index   = records.findIndex(r => r.id === this.id);

        if (index >= 0) {
            records[index] = this;
        } else {
            records.push(this);
        }

        database.write('mubayaa', records);
        return this;
    }

    // ─── البحث بالمعرّف ──────────────────────────────────────────────────────
    static findById(id) {
        const records = database.read('mubayaa') || [];
        const data    = records.find(r => r.id === id);
        return data ? new Mubayaa(data) : null;
    }

    // ─── البحث بمعرّف المستخدم ───────────────────────────────────────────────
    static findByUserId(userId) {
        const records = database.read('mubayaa') || [];
        const data    = records.find(r => r.userId === userId && r.status === 'active');
        return data ? new Mubayaa(data) : null;
    }

    // ─── الحصول على جميع المبايعات ────────────────────────────────────────────
    static findAll(query = {}) {
        const records = database.read('mubayaa') || [];
        let results   = records;

        if (Object.keys(query).length > 0) {
            results = records.filter(r =>
                Object.entries(query).every(([k, v]) => r[k] === v)
            );
        }

        return results.map(d => new Mubayaa(d));
    }

    // ─── الإحصائيات ──────────────────────────────────────────────────────────
    static count(query = {}) {
        return Mubayaa.findAll(query).length;
    }

    // ─── إنشاء مبايعة جديدة ──────────────────────────────────────────────────
    static create(data, meta = {}) {
        const mubayaa       = new Mubayaa(data);
        mubayaa.ipAddress   = meta.ip   || null;
        mubayaa.userAgent   = meta.ua   || null;
        mubayaa.pledgedAt   = new Date().toISOString();
        mubayaa.generateSignature();
        return mubayaa.save();
    }

    // ─── نص المبايعة الرسمي ──────────────────────────────────────────────────
    static get officialTextAr() { return MUBAYAA_TEXT_AR; }
    static get officialTextEn() { return MUBAYAA_TEXT_EN; }
}

module.exports = Mubayaa;
