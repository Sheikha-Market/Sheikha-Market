/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SIDC ENGINE v1.0.0                                                 ║
 * ║  🪙 العملة الرقمية الإسلامية — Sheikha Islamic Digital Currency             ║
 * ║  1 SIDC = 12.65 USD — مشروعة | شفافة | مزكّاة | بلا ربا                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥
 *    [SIDC-HALAL] العملة حلال — لا ربا في أي معاملة
 *
 * ٢. ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ
 *       إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ﴾ — النساء: ٢٩
 *    [SIDC-CONSENT] كل معاملة بالتراضي — لا إكراه
 *
 * ٣. ﴿وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ﴾ — الأنعام: ١٥٢
 *    [SIDC-JUSTICE] الوزن بالقسط — السعر العادل دائماً
 *
 * ٤. ﴿وَلَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ﴾ — البقرة: ١٨٨
 *    [SIDC-NO-FRAUD] لا غش — لا احتيال — لا غرر
 *
 * ٥. «لا ضرر ولا ضرار» — ابن ماجه
 *    [SIDC-NO-HARM] لا ضرر في كل معاملة
 *
 * ٦. ﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾ — الذاريات: ١٩
 *    [SIDC-ZAKAT] الزكاة مدمجة في كل معاملة
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * معلومات العملة:
 *   الاسم:    Sheikha Islamic Digital Currency
 *   الرمز:    SIDC
 *   السعر:    1 SIDC = 12.65 USD
 *   الطبيعة:  مشروعة | شفافة | قابلة للزكاة | بلا ربا
 *   الوحدة الأدنى: 0.001 SIDC (1 SIDC = 1000 mSIDC)
 *   الزكاة:   2.5% سنوياً على الرصيد الذي بلغ النصاب
 *   النصاب:   ما يعادل 85 جرام ذهب = تقريباً 1800 USD = 142.3 SIDC
 *
 * @module sheikha-sidc-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ─── ثوابت العملة ────────────────────────────────────────────────────────────
const SIDC_RATE_USD    = 12.65;   // 1 SIDC = 12.65 USD
const ZAKAT_RATE       = 0.025;   // 2.5% سنوياً
const NISAB_USD        = 1800;    // نصاب الزكاة بالدولار (تقريباً 85 جرام ذهب)
const NISAB_SIDC       = NISAB_USD / SIDC_RATE_USD;   // ≈ 142.3 SIDC
const MAX_SUPPLY       = 21_000_000;  // الحد الأقصى للإصدار (مثل الذهب — محدود)

// مبادئ الشريعة في العملة
const SIDC_SHARIA_RULES = Object.freeze([
    { id: 'S1', rule: 'لا ربا',          quranRef: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥' },
    { id: 'S2', rule: 'لا غرر',          quranRef: '«نهى النبي ﷺ عن بيع الغرر» — مسلم' },
    { id: 'S3', rule: 'لا قمار',         quranRef: '﴿إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ وَالْأَنصَابُ وَالْأَزْلَامُ رِجْسٌ﴾ — المائدة: ٩٠' },
    { id: 'S4', rule: 'التراضي',         quranRef: '﴿إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ﴾ — النساء: ٢٩' },
    { id: 'S5', rule: 'الشفافية',        quranRef: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ فَاكْتُبُوهُ﴾ — البقرة: ٢٨٢' },
    { id: 'S6', rule: 'الزكاة مدمجة',    quranRef: '﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾ — الذاريات: ١٩' },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: محرك SIDC
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaSidcEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        this._initialized   = false;
        this._startedAt     = null;

        // دفتر الأستاذ (Ledger) — Map من address → balance
        this._ledger        = new Map();
        // سجل المعاملات
        this._txLog         = [];
        // الإصدار الكلي
        this._totalIssued   = 0;
        // سجل الزكاة
        this._zakatLog      = [];

        this._stats = {
            totalTx:       0,
            totalVolume:   0,     // بـ SIDC
            totalVolumeUSD:0,
            blocked:       0,
            zakatCollected:0,
        };
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    initialize() {
        if (this._initialized) return this;

        console.log(`[SIDC] 🪙 ${BISMILLAH}`);
        console.log(`[SIDC] 🌟 العملة الرقمية الإسلامية — v${VERSION}`);
        console.log(`[SIDC] 💱 سعر الصرف: 1 SIDC = ${SIDC_RATE_USD} USD`);
        console.log(`[SIDC] ⚖️  الزكاة: ${ZAKAT_RATE * 100}% سنوياً | النصاب: ${NISAB_SIDC.toFixed(2)} SIDC`);
        console.log(`[SIDC] 📖 ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥`);

        SIDC_SHARIA_RULES.forEach(r => console.log(`[SIDC]   ✅ ${r.rule}`));

        this._initialized = true;
        this._startedAt   = new Date().toISOString();
        console.log(`[SIDC] 📖 ${TAWHEED}`);
        this.emit('initialized', { rate: SIDC_RATE_USD, version: VERSION });
        return this;
    }

    // ─── الفحص الشرعي ────────────────────────────────────────────────────────

    /**
     * فحص شرعي لأي معاملة
     * ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾
     * @param {object} tx
     * @returns {{ compliant: boolean, violations: string[] }}
     */
    shariaCheck(tx = {}) {
        const violations = [];
        if (tx.interestRate > 0 || tx.hasRiba) violations.push('ربا — لا يجوز');
        if (tx.isGambling)                     violations.push('قمار — محرم');
        if (tx.hasGharar)                       violations.push('غرر — لا يجوز');
        if (!tx.consent && tx.amount > 0)       violations.push('لم يُؤكَّد التراضي');
        return { compliant: violations.length === 0, violations, rules: SIDC_SHARIA_RULES };
    }

    // ─── إصدار عملة ──────────────────────────────────────────────────────────

    /**
     * إصدار SIDC لعنوان
     * @param {string} address
     * @param {number} amount — بـ SIDC
     * @param {string} reason
     * @returns {object}
     */
    issue(address, amount, reason = 'إصدار رسمي') {
        if (!this._initialized) this.initialize();
        if (amount <= 0) return { ok: false, error: 'المبلغ يجب أن يكون أكبر من صفر' };
        if (this._totalIssued + amount > MAX_SUPPLY) {
            return { ok: false, error: `تجاوز الحد الأقصى للإصدار: ${MAX_SUPPLY.toLocaleString()} SIDC` };
        }

        const prev = this._ledger.get(address) || 0;
        this._ledger.set(address, prev + amount);
        this._totalIssued += amount;

        const tx = this._recordTx({ type: 'ISSUE', from: 'SYSTEM', to: address, amount, reason });
        this.emit('issued', { address, amount, txId: tx.id });
        return { ok: true, txId: tx.id, address, amount, amountUSD: amount * SIDC_RATE_USD, balance: prev + amount };
    }

    // ─── تحويل ───────────────────────────────────────────────────────────────

    /**
     * تحويل SIDC بين عنوانين
     * ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ فَاكْتُبُوهُ﴾
     * @param {string} from
     * @param {string} to
     * @param {number} amount
     * @param {object} meta — { consent, reason, hasRiba, isGambling, hasGharar }
     * @returns {object}
     */
    transfer(from, to, amount, meta = {}) {
        if (!this._initialized) this.initialize();

        this._stats.totalTx++;

        // الفحص الشرعي
        const sharia = this.shariaCheck({ ...meta, amount, consent: meta.consent !== false });
        if (!sharia.compliant) {
            this._stats.blocked++;
            return {
                ok:         false,
                blocked:    true,
                violations: sharia.violations,
                quranRef:   '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
            };
        }

        const fromBal = this._ledger.get(from) || 0;
        if (fromBal < amount) {
            return { ok: false, error: 'رصيد غير كافٍ', balance: fromBal, required: amount };
        }

        // تحديث الأرصدة
        this._ledger.set(from, fromBal - amount);
        this._ledger.set(to, (this._ledger.get(to) || 0) + amount);

        this._stats.totalVolume   += amount;
        this._stats.totalVolumeUSD += amount * SIDC_RATE_USD;

        const tx = this._recordTx({ type: 'TRANSFER', from, to, amount, reason: meta.reason || 'تحويل' });

        this.emit('transferred', { from, to, amount, txId: tx.id });
        return {
            ok:       true,
            txId:     tx.id,
            from,
            to,
            amount,
            amountUSD:  amount * SIDC_RATE_USD,
            fromBalance: this._ledger.get(from),
            toBalance:   this._ledger.get(to),
            shariaCompliant: true,
            timestamp: tx.timestamp,
        };
    }

    // ─── حساب وتسديد الزكاة ──────────────────────────────────────────────────

    /**
     * حساب الزكاة المستحقة
     * ﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾ — الذاريات: ١٩
     * @param {string} address
     * @returns {object}
     */
    calculateZakat(address) {
        const balance = this._ledger.get(address) || 0;
        if (balance < NISAB_SIDC) {
            return {
                ok: true,
                address,
                balance,
                balanceUSD:   balance * SIDC_RATE_USD,
                nisab:        NISAB_SIDC,
                zakatDue:     0,
                zakatDueUSD:  0,
                reason:       `الرصيد (${balance.toFixed(3)} SIDC) أقل من النصاب (${NISAB_SIDC.toFixed(2)} SIDC)`,
                quranRef:     '﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾',
            };
        }

        const zakatDue    = balance * ZAKAT_RATE;
        const zakatDueUSD = zakatDue * SIDC_RATE_USD;

        return {
            ok:          true,
            address,
            balance,
            balanceUSD:  balance * SIDC_RATE_USD,
            nisab:       NISAB_SIDC,
            zakatRate:   `${ZAKAT_RATE * 100}%`,
            zakatDue:    parseFloat(zakatDue.toFixed(6)),
            zakatDueUSD: parseFloat(zakatDueUSD.toFixed(2)),
            quranRef:    '﴿وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ﴾ — الذاريات: ١٩',
        };
    }

    /**
     * تسديد الزكاة
     * @param {string} address
     * @returns {object}
     */
    payZakat(address) {
        const calc = this.calculateZakat(address);
        if (!calc.ok || calc.zakatDue <= 0) return { ...calc, paid: false };

        const result = this.transfer(address, 'ZAKAT_FUND', calc.zakatDue, {
            consent: true,
            reason:  'دفع الزكاة الواجبة',
        });

        if (result.ok) {
            this._stats.zakatCollected += calc.zakatDue;
            const entry = { address, amount: calc.zakatDue, amountUSD: calc.zakatDueUSD, paidAt: new Date().toISOString() };
            this._zakatLog.push(entry);
            if (this._zakatLog.length > 500) this._zakatLog.shift();
            this.emit('zakat:paid', entry);
            return { ...result, zakatPaid: calc.zakatDue, message: 'الزكاة أُدِّيت — بارك الله فيك' };
        }

        return result;
    }

    // ─── تحويل العملات ───────────────────────────────────────────────────────

    /**
     * تحويل من SIDC إلى USD أو العكس
     * @param {number} amount
     * @param {string} from — 'SIDC'|'USD'
     * @returns {object}
     */
    convert(amount, from = 'SIDC') {
        if (from === 'SIDC') {
            return { from: amount, to: parseFloat((amount * SIDC_RATE_USD).toFixed(2)), fromCurrency: 'SIDC', toCurrency: 'USD', rate: SIDC_RATE_USD };
        }
        return { from: amount, to: parseFloat((amount / SIDC_RATE_USD).toFixed(6)), fromCurrency: 'USD', toCurrency: 'SIDC', rate: `1/${SIDC_RATE_USD}` };
    }

    // ─── رصيد ────────────────────────────────────────────────────────────────

    balance(address) {
        const b = this._ledger.get(address) || 0;
        return { address, balance: b, balanceUSD: parseFloat((b * SIDC_RATE_USD).toFixed(2)), currency: 'SIDC', rate: SIDC_RATE_USD };
    }

    // ─── تسجيل معاملة ────────────────────────────────────────────────────────

    _recordTx({ type, from, to, amount, reason }) {
        const tx = {
            id:        `SIDC-TX-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            type,
            from,
            to,
            amount:    parseFloat(amount.toFixed(6)),
            amountUSD: parseFloat((amount * SIDC_RATE_USD).toFixed(2)),
            reason,
            timestamp: new Date().toISOString(),
            tawheed:   TAWHEED,
        };
        this._txLog.push(tx);
        if (this._txLog.length > 1000) this._txLog.shift();
        return tx;
    }

    // ─── حالة SIDC ───────────────────────────────────────────────────────────

    status() {
        return {
            name:         'Sheikha SIDC Engine',
            nameAr:       '🪙 العملة الرقمية الإسلامية',
            nameEn:       'Sheikha Islamic Digital Currency',
            version:      VERSION,
            initialized:  this._initialized,
            startedAt:    this._startedAt,
            currency: {
                symbol:       'SIDC',
                rateUSD:      SIDC_RATE_USD,
                totalIssued:  parseFloat(this._totalIssued.toFixed(6)),
                maxSupply:    MAX_SUPPLY.toLocaleString(),
                zakatRate:    `${ZAKAT_RATE * 100}%`,
                nisab:        `${NISAB_SIDC.toFixed(2)} SIDC ≈ ${NISAB_USD} USD`,
                halalCertified: true,
                noRiba:       true,
                transparent:  true,
            },
            shariaRules:  SIDC_SHARIA_RULES,
            stats:        { ...this._stats },
            recentTx:     this._txLog.slice(-10),
            recentZakat:  this._zakatLog.slice(-5),
            tawheed:      TAWHEED,
            bismillah:    BISMILLAH,
            quranRef:     '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
            position:     'SDC → [SIDC] → سوق شيخة',
        };
    }

    static getInstance() {
        if (!SheikhaSidcEngine._instance) {
            SheikhaSidcEngine._instance = new SheikhaSidcEngine();
            SheikhaSidcEngine._instance.initialize();
        }
        return SheikhaSidcEngine._instance;
    }
}

SheikhaSidcEngine._instance = null;

function getInstance() { return SheikhaSidcEngine.getInstance(); }

module.exports = {
    SheikhaSidcEngine,
    getInstance,
    SIDC_RATE_USD,
    NISAB_SIDC,
    ZAKAT_RATE,
    MAX_SUPPLY,
    SIDC_SHARIA_RULES,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
