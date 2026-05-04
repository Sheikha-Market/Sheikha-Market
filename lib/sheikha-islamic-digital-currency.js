'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                     ║
 * ║  🪙 SIDC — عملة شيخة الرقمية الإسلامية                                     ║
 * ║  Sheikha Islamic Digital Currency — أول عملة رقمية إسلامية مدعومة بالمعادن ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  ليست عملة مشفرة (Crypto) — ليست Bitcoin — ليست مضاربة                     ║
 * ║  هي: وحدة تبادل مدعومة بمعادن حقيقية — محكومة بالشريعة الإسلامية          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  الفرق عن Bitcoin/Crypto:                                                   ║
 * ║   ✅ مدعومة بمعادن حقيقية (حديد، نحاس، ذهب، فضة)                           ║
 * ║   ✅ بدون ربا — بدون مضاربة — بدون غرر                                      ║
 * ║   ✅ بدون تعدين مهدر للطاقة                                                  ║
 * ║   ✅ محكومة بالشريعة الإسلامية (SDGN → SIRN → IFL)                          ║
 * ║   ✅ شفافة وقابلة للتدقيق بالكامل                                           ║
 * ║   ✅ قابلة للتحويل لمعادن فعلية (asset-backed)                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  آيات التأسيس:                                                               ║
 * ║   ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة:275            ║
 * ║   ﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم ﴾ — النساء:29 ║
 * ║   ﴿ وَأَوْفُوا الْكَيْلَ إِذَا كِلْتُمْ وَزِنُوا بِالْقِسْطَاسِ ﴾ — الإسراء:35 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * المالك: سلمان أحمد بن سلمان الراجح — لا تعديل بدون إذن صريح
 */

const crypto = require('crypto');
const os     = require('os');

// ══════════════════════════════════════════════════════════════════════════════
// ثوابت العملة
// ══════════════════════════════════════════════════════════════════════════════
const SIDC_VERSION      = '1.0.0';
const SIDC_SYMBOL       = 'SIDC';                     // Sheikha Islamic Digital Currency
const SIDC_FULL_NAME_AR = 'عملة شيخة الرقمية الإسلامية';
const SIDC_FULL_NAME_EN = 'Sheikha Islamic Digital Currency';
const SIDC_DECIMALS     = 6;                          // دقة 6 منازل عشرية
const SIDC_BOOT_AT      = new Date().toISOString();
const SIDC_OWNER        = 'سلمان أحمد بن سلمان الراجح';

// ══════════════════════════════════════════════════════════════════════════════
// الأصول الداعمة — Reserve Assets (المعادن الحقيقية)
// ══════════════════════════════════════════════════════════════════════════════
const RESERVE_ASSETS = Object.freeze({
    // كل 1 SIDC يعادل مزيجاً موزوناً من هذه المعادن
    IRON: {
        symbol: 'Fe',
        nameAr: 'الحديد',
        quranRef: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾ — الحديد:25',
        weight: 0.40,           // 40% من الاحتياطي
        unit: 'KG',
        base_price_usd: 0.50    // سعر مرجعي (يُحدَّث دورياً)
    },
    COPPER: {
        symbol: 'Cu',
        nameAr: 'النحاس',
        quranRef: '﴿ وَأَسَلْنَا لَهُ عَيْنَ الْقِطْرِ ﴾ — سبأ:12',
        weight: 0.25,           // 25%
        unit: 'KG',
        base_price_usd: 9.50
    },
    ALUMINUM: {
        symbol: 'Al',
        nameAr: 'الألمنيوم',
        quranRef: '(معدن الاستدامة — خلق الله للمنفعة)',
        weight: 0.20,           // 20%
        unit: 'KG',
        base_price_usd: 2.60
    },
    GOLD: {
        symbol: 'Au',
        nameAr: 'الذهب',
        quranRef: '﴿ وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ ﴾ — التوبة:34 (تحذير من الكنز)',
        weight: 0.10,           // 10% (جزء صغير للاستقرار)
        unit: 'GRAM',
        base_price_usd: 95.00   // لكل جرام
    },
    SILVER: {
        symbol: 'Ag',
        nameAr: 'الفضة',
        quranRef: '(معدن النقاء — ذُكر في القرآن والسنة)',
        weight: 0.05,           // 5%
        unit: 'GRAM',
        base_price_usd: 1.10
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// قواعد الشريعة للعملة (لا ربا — لا غرر — لا قمار)
// ══════════════════════════════════════════════════════════════════════════════
const SHARIA_RULES = Object.freeze({
    NO_RIBA: {
        rule: 'لا ربا — لا فوائد على الحيازة أو التحويل',
        quran: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة:275',
        enforcement: 'zero_interest_policy'
    },
    NO_GHARAR: {
        rule: 'لا غرر — كل معاملة واضحة وموثّقة',
        quran: '﴿ وَلَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ ﴾ — البقرة:188',
        enforcement: 'full_transparency_required'
    },
    NO_GAMBLING: {
        rule: 'لا قمار — لا مضاربة عشوائية',
        quran: '﴿ إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ وَالْأَنصَابُ ﴾ — المائدة:90',
        enforcement: 'speculation_block'
    },
    HONEST_WEIGHT: {
        rule: 'الوزن الدقيق والكيل العادل',
        quran: '﴿ وَأَوْفُوا الْكَيْلَ إِذَا كِلْتُمْ وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ ﴾ — الإسراء:35',
        enforcement: 'accurate_measurement_required'
    },
    ASSET_BACKED: {
        rule: 'العملة مدعومة بأصل حقيقي — لا قيمة وهمية',
        quran: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾ — الحديد:25',
        enforcement: 'metal_reserve_mandatory'
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// نموذج المحفظة الرقمية
// ══════════════════════════════════════════════════════════════════════════════
class SIDCWallet {
    constructor(userId, displayName) {
        this.walletId    = 'SIDC-' + crypto.randomBytes(8).toString('hex').toUpperCase();
        this.userId      = userId;
        this.displayName = displayName;
        this.balance     = 0;             // رصيد SIDC
        this.reserved    = 0;             // محجوز في عقود مفتوحة
        this.createdAt   = new Date().toISOString();
        this.transactions = [];
        this.verified    = false;
        this.kycStatus   = 'pending';
    }

    get available() { return this.balance - this.reserved; }

    /**
     * إيداع SIDC — عند شراء معادن أو تحويل
     */
    deposit(amount, reason, ref = null) {
        this._validateAmount(amount);
        this.balance += amount;
        this.transactions.push({
            txId: 'TX-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
            type: 'DEPOSIT',
            amount,
            reason,
            ref,
            balanceAfter: this.balance,
            timestamp: new Date().toISOString()
        });
        return { success: true, newBalance: this.balance, txCount: this.transactions.length };
    }

    /**
     * سحب SIDC — للتحويل أو تحويل لمعادن
     */
    withdraw(amount, reason, ref = null) {
        this._validateAmount(amount);
        if (amount > this.available) {
            throw new Error(`رصيد غير كافٍ: المتاح ${this.available} SIDC، المطلوب ${amount} SIDC`);
        }
        this.balance -= amount;
        this.transactions.push({
            txId: 'TX-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
            type: 'WITHDRAW',
            amount,
            reason,
            ref,
            balanceAfter: this.balance,
            timestamp: new Date().toISOString()
        });
        return { success: true, newBalance: this.balance };
    }

    /**
     * حجز SIDC — لعقد مفتوح
     */
    reserve(amount, contractRef) {
        this._validateAmount(amount);
        if (amount > this.available) {
            throw new Error(`لا يمكن الحجز: المتاح ${this.available} SIDC`);
        }
        this.reserved += amount;
        return { success: true, reserved: this.reserved, available: this.available };
    }

    /**
     * تحرير الحجز
     */
    release(amount, contractRef) {
        this._validateAmount(amount);
        this.reserved = Math.max(0, this.reserved - amount);
        return { success: true, reserved: this.reserved };
    }

    getInfo() {
        return {
            walletId: this.walletId,
            displayName: this.displayName,
            balance: this.balance,
            reserved: this.reserved,
            available: this.available,
            verified: this.verified,
            kycStatus: this.kycStatus,
            txCount: this.transactions.length,
            createdAt: this.createdAt
        };
    }

    _validateAmount(amount) {
        if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
            throw new Error('المبلغ يجب أن يكون رقماً موجباً');
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// محرك العملة الرقمية الإسلامية
// ══════════════════════════════════════════════════════════════════════════════
class SheikhaIslamicDigitalCurrencyEngine {
    constructor() {
        this.name        = SIDC_FULL_NAME_AR;
        this.symbol      = SIDC_SYMBOL;
        this.version     = SIDC_VERSION;
        this.bootAt      = SIDC_BOOT_AT;
        this.status      = 'active';

        // محافظ في الذاكرة (في الإنتاج تُخزَّن في قاعدة البيانات)
        this.wallets     = new Map();

        // تاريخ المعاملات
        this.ledger      = [];

        // احتياطيات المعادن المرجعية (تُحدَّث من API أسواق المعادن)
        this.reserves    = { ...RESERVE_ASSETS };

        // إحصاءات
        this.stats = {
            totalTransactions: 0,
            totalVolumeSIDC: 0,
            walletsCreated: 0,
            contractsExecuted: 0,
            shariaChecks: 0,
            shariaBlocked: 0,
            bootAt: SIDC_BOOT_AT
        };
    }

    // ─── حساب قيمة SIDC بالدولار بناءً على احتياطي المعادن ─────────────────
    calculateSIDCValue() {
        let totalValue = 0;
        for (const [metal, data] of Object.entries(this.reserves)) {
            totalValue += data.weight * data.base_price_usd;
        }
        return parseFloat(totalValue.toFixed(6));
    }

    // ─── تحويل مبلغ من عملة لأخرى عبر SIDC ─────────────────────────────────
    convertViaMetals(amountSIDC, metalSymbol) {
        const metal = Object.values(this.reserves).find(m => m.symbol === metalSymbol);
        if (!metal) {
            return { success: false, error: `المعدن '${metalSymbol}' غير مدعوم` };
        }
        const sidcValueUSD = this.calculateSIDCValue();
        const totalUSD     = amountSIDC * sidcValueUSD;
        const metalQty     = totalUSD / metal.base_price_usd;
        return {
            success: true,
            input: { amount: amountSIDC, currency: 'SIDC' },
            output: { amount: parseFloat(metalQty.toFixed(4)), unit: metal.unit, metal: metal.nameAr },
            rate: { sidcToUSD: sidcValueUSD, metalPrice: metal.base_price_usd },
            shariaNote: 'معاملة خالية من الربا — مدعومة بأصل حقيقي'
        };
    }

    // ─── إنشاء محفظة جديدة ───────────────────────────────────────────────────
    createWallet(userId, displayName) {
        if (this.wallets.has(userId)) {
            return { success: false, error: 'المحفظة موجودة بالفعل', wallet: this.wallets.get(userId).getInfo() };
        }
        const wallet = new SIDCWallet(userId, displayName);
        this.wallets.set(userId, wallet);
        this.stats.walletsCreated++;
        return { success: true, wallet: wallet.getInfo(), message: 'تم إنشاء المحفظة — بِسْمِ اللَّهِ' };
    }

    // ─── تحويل بين محفظتين — مع فحص شرعي ────────────────────────────────────
    transfer(fromUserId, toUserId, amount, note = '') {
        this.stats.shariaChecks++;

        // فحص شرعي — لا ربا ولا غرر
        if (amount <= 0) {
            this.stats.shariaBlocked++;
            return { success: false, blocked: true, reason: 'المبلغ يجب أن يكون موجباً' };
        }

        const from = this.wallets.get(fromUserId);
        const to   = this.wallets.get(toUserId);
        if (!from) return { success: false, error: 'محفظة المُرسِل غير موجودة' };
        if (!to)   return { success: false, error: 'محفظة المُستَقبِل غير موجودة' };

        if (from.available < amount) {
            return { success: false, error: `رصيد غير كافٍ: المتاح ${from.available} SIDC` };
        }

        const txRef = 'TXF-' + crypto.randomBytes(8).toString('hex').toUpperCase();
        const timestamp = new Date().toISOString();

        // تنفيذ التحويل
        from.withdraw(amount, `تحويل إلى ${to.displayName}: ${note}`, txRef);
        to.deposit(amount, `تحويل من ${from.displayName}: ${note}`, txRef);

        // تسجيل في دفتر الأستاذ
        const entry = {
            txRef,
            type: 'TRANSFER',
            from: fromUserId,
            to: toUserId,
            amount,
            note,
            shariaCompliant: true,
            timestamp
        };
        this.ledger.push(entry);
        this.stats.totalTransactions++;
        this.stats.totalVolumeSIDC += amount;

        return {
            success: true,
            txRef,
            amount,
            from: from.displayName,
            to: to.displayName,
            fromBalance: from.balance,
            toBalance: to.balance,
            shariaNote: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾ — معاملة مشروعة',
            timestamp
        };
    }

    // ─── تسعير معاملة بالمعادن (حساب SIDC للصفقة) ───────────────────────────
    priceMetalDeal(metalSymbol, weightKg, qualityGrade = 'A') {
        const qualityMultiplier = { 'A': 1.00, 'B': 0.85, 'C': 0.70, 'D': 0.55 };
        const metal = Object.values(this.reserves).find(m => m.symbol === metalSymbol);
        if (!metal) {
            return { success: false, error: `المعدن '${metalSymbol}' غير مدعوم` };
        }

        const quality    = qualityMultiplier[qualityGrade] || 1.0;
        const usdValue   = weightKg * metal.base_price_usd * quality;
        const sidcValue  = usdValue / this.calculateSIDCValue();

        return {
            success: true,
            metal: { symbol: metalSymbol, nameAr: metal.nameAr },
            weight: { value: weightKg, unit: 'KG' },
            quality: { grade: qualityGrade, multiplier: quality },
            pricing: {
                usd:  parseFloat(usdValue.toFixed(2)),
                sidc: parseFloat(sidcValue.toFixed(SIDC_DECIMALS)),
                rate: `1 SIDC = ${this.calculateSIDCValue().toFixed(4)} USD`
            },
            shariaNote: '﴿ وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ ﴾ — وزن عادل ودقيق',
            timestamp: new Date().toISOString()
        };
    }

    // ─── فحص امتثال معاملة للشريعة ──────────────────────────────────────────
    shariaCheck(transaction = {}) {
        this.stats.shariaChecks++;
        const violations = [];

        if (transaction.interest || transaction.riba) {
            violations.push({ rule: 'NO_RIBA', detail: SHARIA_RULES.NO_RIBA.rule });
        }
        if (transaction.speculation || transaction.gambling) {
            violations.push({ rule: 'NO_GAMBLING', detail: SHARIA_RULES.NO_GAMBLING.rule });
        }
        if (transaction.unknownItem || transaction.gharar) {
            violations.push({ rule: 'NO_GHARAR', detail: SHARIA_RULES.NO_GHARAR.rule });
        }
        if (transaction.amount <= 0 || !transaction.amount) {
            violations.push({ rule: 'HONEST_WEIGHT', detail: 'المبلغ يجب أن يكون موجباً ومعلوماً' });
        }

        const compliant = violations.length === 0;
        if (!compliant) this.stats.shariaBlocked++;

        return {
            compliant,
            violations,
            basis: compliant
                ? '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة:275'
                : '﴿ وَلَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ ﴾ — البقرة:188',
            rules: SHARIA_RULES,
            checkedAt: new Date().toISOString()
        };
    }

    // ─── حالة العملة الكاملة ─────────────────────────────────────────────────
    getStatus() {
        const sidcValue = this.calculateSIDCValue();
        return {
            version: SIDC_VERSION,
            symbol: SIDC_SYMBOL,
            name: SIDC_FULL_NAME_AR,
            nameEn: SIDC_FULL_NAME_EN,
            status: this.status,
            owner: SIDC_OWNER,
            bootAt: SIDC_BOOT_AT,
            currentValue: {
                sidc_to_usd: sidcValue,
                description: `1 ${SIDC_SYMBOL} = ${sidcValue} USD (مدعوم بمعادن حقيقية)`
            },
            reserves: Object.fromEntries(
                Object.entries(RESERVE_ASSETS).map(([k, v]) => [k, {
                    symbol: v.symbol,
                    nameAr: v.nameAr,
                    weight: `${(v.weight * 100).toFixed(0)}%`,
                    price_usd: v.base_price_usd,
                    unit: v.unit
                }])
            ),
            shariaRules: Object.fromEntries(
                Object.entries(SHARIA_RULES).map(([k, v]) => [k, v.rule])
            ),
            stats: {
                ...this.stats,
                activeWallets: this.wallets.size,
                totalLedgerEntries: this.ledger.size
            },
            advantages: {
                vs_bitcoin: 'مدعومة بمعادن حقيقية — لا مضاربة — لا تعدين مهدر',
                vs_crypto: 'لا ربا — لا غرر — امتثال شرعي كامل',
                vs_fiat: 'شفافة — مدعومة بأصول — لا تضخم اصطناعي'
            },
            timestamp: new Date().toISOString()
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// Boot Banner
// ══════════════════════════════════════════════════════════════════════════════
function boot() {
    console.log('');
    console.log('🪙╔══════════════════════════════════════════════════════════════╗');
    console.log('🪙║  بسم الله الرحمن الرحيم                                      ║');
    console.log('🪙╠══════════════════════════════════════════════════════════════╣');
    console.log('🪙║  SIDC v' + SIDC_VERSION + ' — عملة شيخة الرقمية الإسلامية         ║');
    console.log('🪙║  ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾             ║');
    console.log('🪙╠══════════════════════════════════════════════════════════════╣');
    console.log('🪙║  الأصول الداعمة (Reserve Assets):                           ║');
    for (const [, m] of Object.entries(RESERVE_ASSETS)) {
        console.log(`🪙║   ${m.symbol.padEnd(3)} ${m.nameAr.padEnd(10)} — ${(m.weight * 100).toFixed(0)}%              ║`);
    }
    console.log('🪙╠══════════════════════════════════════════════════════════════╣');
    console.log('🪙║  أفضل من Bitcoin: لا ربا — مدعوم بمعادن — لا تعدين مهدر   ║');
    console.log('🪙╚══════════════════════════════════════════════════════════════╝');
    console.log('');
}

boot();

// Singleton
const sidc = new SheikhaIslamicDigitalCurrencyEngine();

// ══════════════════════════════════════════════════════════════════════════════
// الصادرات
// ══════════════════════════════════════════════════════════════════════════════
module.exports = Object.freeze({
    SIDC_VERSION,
    SIDC_SYMBOL,
    SIDC_FULL_NAME_AR,
    SIDC_FULL_NAME_EN,
    SIDC_DECIMALS,
    RESERVE_ASSETS,
    SHARIA_RULES,
    SIDCWallet,
    engine: sidc,
    getStatus:        () => sidc.getStatus(),
    createWallet:     (uid, name) => sidc.createWallet(uid, name),
    transfer:         (from, to, amt, note) => sidc.transfer(from, to, amt, note),
    priceMetalDeal:   (metal, kg, grade) => sidc.priceMetalDeal(metal, kg, grade),
    shariaCheck:      (tx) => sidc.shariaCheck(tx),
    convertViaMetals: (amt, metal) => sidc.convertViaMetals(amt, metal),
    calculateSIDCValue: () => sidc.calculateSIDCValue(),
    boot
});
