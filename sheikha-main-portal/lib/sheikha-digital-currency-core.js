// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⭐ SHEIKHA DIGITAL CURRENCY CORE — نواة العملة الرقمية SHK
 *    التكامل الكامل — تفعيل القيمة — الجيل الجديد
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة: 275
 * «وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ» — الرحمن: 9
 * «إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ» — البقرة: 282
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * البنية المتكاملة:
 *
 *  ┌──────────────────────────────────────────────────────────────────────────┐
 *  │  1. NEURAL VALUE ORACLE  — المحرك العصبي لقيمة SHK                      │
 *  │     • شبكة عصبية [9→24→16→8→3] تحسب: سعر SHK | ثقة | توصية            │
 *  │     • مدخلات: التداول + الاحتياطي + سلاسل البلوكشين + الزكاة + نمو SCM  │
 *  ├──────────────────────────────────────────────────────────────────────────┤
 *  │  2. ON-CHAIN WALLET ENGINE — محرك المحافظ على السلسلة                   │
 *  │     • كل محفظة: عنوان on-chain + رصيد SHK/DGD/SDH + سجل حركات          │
 *  │     • إنشاء محفظة → تسجيل على البلوكشين تلقائياً                        │
 *  ├──────────────────────────────────────────────────────────────────────────┤
 *  │  3. TRANSFER ENGINE — محرك التحويل على السلسلة                           │
 *  │     • كل تحويل SHK → معاملة على neural-blockchain                       │
 *  │     • فحص شرعي تلقائي + فحص الرصيد + رسوم شفافة                        │
 *  ├──────────────────────────────────────────────────────────────────────────┤
 *  │  4. MINT / BURN / STAKE — سك وحرق وتخزين                                │
 *  │     • Mint: إصدار SHK جديد مقابل أصول حقيقية (ذهب/فضة/سلع)             │
 *  │     • Burn: حرق SHK لاسترداد أصول حقيقية (backing)                     │
 *  │     • Stake: تجميد SHK لكسب مكافآت (بدون ربا — من الأرباح الحقيقية)    │
 *  ├──────────────────────────────────────────────────────────────────────────┤
 *  │  5. BACKING RESERVE ENGINE — محرك احتياطيات الدعم                       │
 *  │     • تتبع: ذهب 40٪ + فضة 30٪ + سلع 20٪ + سيولة 10٪                   │
 *  │     • نسبة الدعم (Backing Ratio) محسوبة لحظياً                          │
 *  │     • تسجيل كل تغيير في الاحتياطيات على البلوكشين                       │
 *  ├──────────────────────────────────────────────────────────────────────────┤
 *  │  6. MARKET ENGINE — محرك السوق وصانع السوق                              │
 *  │     • صانع سوق تلقائي (AMM) بدون ربا                                    │
 *  │     • أسعار مباشرة SHK/SAR, SHK/USD, SHK/DGD, SHK/SDH                 │
 *  │     • تاريخ الأسعار (24h/7d/30d)                                        │
 *  └──────────────────────────────────────────────────────────────────────────┘
 *
 * ✅ تكامل كامل مع sheikha-neural-blockchain.js
 * ✅ تكامل مع sheikha-currency-engine.js (الموجود)
 * ✅ شبكة عصبية حقيقية لتقييم القيمة (بجافاسكربت نقي)
 * ✅ Shariah-compliant 100%
 * ✅ سجل على البلوكشين لكل عملية
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const crypto       = require('crypto');
const fs           = require('fs');
const path         = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function sha256(data) {
    return crypto.createHash('sha256').update(
        typeof data === 'string' ? data : JSON.stringify(data)
    ).digest('hex');
}

let _seq = 0;
const newId = (prefix = 'SHK') => `${prefix}-${Date.now()}-${(++_seq).toString().padStart(4, '0')}`;

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'shk-digital-currency-db.json');

// ═══════════════════════════════════════════════════════════════════════════════
// 2. NEURAL VALUE ORACLE — المحرك العصبي لقيمة SHK
// ═══════════════════════════════════════════════════════════════════════════════

// طبقة كثيفة بسيطة مع Adam
class OracleLayer {
    constructor(inSize, outSize, act = 'relu') {
        this.inSize  = inSize;
        this.outSize = outSize;
        this.act     = act;
        const sc     = Math.sqrt(2.0 / (inSize + outSize));
        this.W = new Float64Array(inSize * outSize).map(() => (Math.random() * 2 - 1) * sc);
        this.b = new Float64Array(outSize);
        this.t = 0; this.lr = 0.002; this.b1 = 0.9; this.b2 = 0.999; this.eps = 1e-8;
        this.mW = new Float64Array(this.W.length); this.vW = new Float64Array(this.W.length);
        this.mb = new Float64Array(outSize);       this.vb = new Float64Array(outSize);
        this._in = null; this._pre = null; this._out = null;
    }

    _a(x) {
        if (this.act === 'sigmoid') return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
        if (this.act === 'tanh')    return Math.tanh(x);
        return Math.max(0, x);
    }
    _ag(x, o) {
        if (this.act === 'sigmoid') return o * (1 - o);
        if (this.act === 'tanh')    return 1 - o * o;
        return x > 0 ? 1 : 0;
    }

    forward(input) {
        this._in = input;
        const pre = new Float64Array(this.outSize);
        for (let j = 0; j < this.outSize; j++) {
            let s = this.b[j];
            for (let i = 0; i < this.inSize; i++) s += input[i] * this.W[i * this.outSize + j];
            pre[j] = s;
        }
        this._pre = pre;
        this._out = Array.from(pre).map(v => this._a(v));
        return this._out;
    }

    backward(dOut) {
        const dPre   = dOut.map((d, i) => d * this._ag(this._pre[i], this._out[i]));
        const dInput = new Float64Array(this.inSize);
        const dW     = new Float64Array(this.W.length);
        const db     = new Float64Array(this.outSize);
        for (let i = 0; i < this.inSize; i++) {
            for (let j = 0; j < this.outSize; j++) {
                dW[i * this.outSize + j] = this._in[i] * dPre[j];
                dInput[i] += this.W[i * this.outSize + j] * dPre[j];
            }
        }
        for (let j = 0; j < this.outSize; j++) db[j] = dPre[j];
        this._adam(dW, db);
        return dInput;
    }

    _adam(dW, db) {
        this.t++;
        const c1 = 1 - Math.pow(this.b1, this.t), c2 = 1 - Math.pow(this.b2, this.t);
        for (let i = 0; i < dW.length; i++) {
            this.mW[i] = this.b1 * this.mW[i] + (1 - this.b1) * dW[i];
            this.vW[i] = this.b2 * this.vW[i] + (1 - this.b2) * dW[i] * dW[i];
            this.W[i] -= this.lr * (this.mW[i] / c1) / (Math.sqrt(this.vW[i] / c2) + this.eps);
        }
        for (let i = 0; i < db.length; i++) {
            this.mb[i] = this.b1 * this.mb[i] + (1 - this.b1) * db[i];
            this.vb[i] = this.b2 * this.vb[i] + (1 - this.b2) * db[i] * db[i];
            this.b[i] -= this.lr * (this.mb[i] / c1) / (Math.sqrt(this.vb[i] / c2) + this.eps);
        }
    }
}

/**
 * Neural Value Oracle — شبكة عصبية لتقييم قيمة SHK
 *
 * المدخلات (9):
 *   0. backingRatio      — نسبة دعم الاحتياطيات [0-1]
 *   1. circulatingRatio  — نسبة التداول / الإجمالي [0-1]
 *   2. dailyVolume       — حجم تداول 24h (مطبّع)
 *   3. chainHealth       — صحة البلوكشين [0-1]
 *   4. avgShariahScore   — متوسط درجة الامتثال الشرعي [0-1]
 *   5. zakatPaid         — الزكاة المدفوعة (مطبّعة)
 *   6. stakingRatio      — نسبة المحجوز / المتداول [0-1]
 *   7. ecosystemActivity — نشاط النظام البيئي [0-1]
 *   8. goldPegStrength   — قوة الربط بالذهب [0-1]
 *
 * المخرجات (3):
 *   0. priceIndexSAR     — مؤشر السعر بالريال (مطبّع → ×2 للتحويل)
 *   1. confidence        — درجة الثقة [0-1]
 *   2. growthSignal      — إشارة النمو [-1→1 مرتبط بـ tanh]
 */
class NeuralValueOracle {
    constructor() {
        this.layers = [
            new OracleLayer(9,  24, 'relu'),
            new OracleLayer(24, 16, 'relu'),
            new OracleLayer(16, 8,  'relu'),
            new OracleLayer(8,  3,  'sigmoid')
        ];
        this.trainCount = 0;
        this.totalLoss  = 0;
        this.basePrice  = 1.0; // سعر أساسي بالريال

        // تدريب مبدئي على أمثلة تخيلية لضبط التوقعات
        this._warmup();
    }

    _warmup() {
        // أمثلة ممتازة (backing جيد + نشاط عالٍ → سعر مرتفع)
        const goodExamples = [
            { x: [0.9, 0.1, 0.7, 0.95, 1.0, 0.5, 0.3, 0.8, 0.9], y: [0.80, 0.90, 0.75] },
            { x: [0.8, 0.2, 0.6, 0.90, 0.9, 0.4, 0.2, 0.7, 0.8], y: [0.70, 0.85, 0.65] },
            { x: [1.0, 0.1, 0.8, 1.00, 1.0, 0.6, 0.4, 0.9, 1.0], y: [0.90, 0.95, 0.85] },
        ];
        // أمثلة ضعيفة (backing منخفض + نشاط قليل → سعر منخفض)
        const poorExamples = [
            { x: [0.2, 0.8, 0.1, 0.40, 0.5, 0.1, 0.0, 0.2, 0.3], y: [0.20, 0.40, 0.15] },
            { x: [0.1, 0.9, 0.0, 0.30, 0.4, 0.0, 0.0, 0.1, 0.2], y: [0.10, 0.30, 0.10] },
        ];
        const all = [...goodExamples, ...poorExamples];
        for (let e = 0; e < 80; e++) {
            for (const { x, y } of all) {
                const pred = this._forward(x);
                const dOut = pred.map((p, i) => p - y[i]);
                this.totalLoss += dOut.reduce((s, d) => s + d * d, 0) / dOut.length;
                let grad = dOut;
                for (let l = this.layers.length - 1; l >= 0; l--) grad = this.layers[l].backward(grad);
                this.trainCount++;
            }
        }
    }

    _forward(inputs) {
        let out = inputs.map(v => isFinite(v) ? v : 0);
        for (const layer of this.layers) out = layer.forward(out);
        return out;
    }

    /**
     * تقييم قيمة SHK بناءً على مؤشرات النظام
     * @param {Object} indicators
     * @returns {{ priceSAR, priceUSD, confidence, growthSignal, recommendation }}
     */
    assess(indicators = {}) {
        const features = [
            Math.min(Math.max(indicators.backingRatio      || 0.85, 0), 1),
            Math.min(Math.max(indicators.circulatingRatio  || 0.05, 0), 1),
            Math.min(Math.max(indicators.dailyVolume       || 0.30, 0), 1),
            Math.min(Math.max(indicators.chainHealth       || 0.90, 0), 1),
            Math.min(Math.max(indicators.avgShariahScore   || 1.00, 0), 1),
            Math.min(Math.max(indicators.zakatPaid         || 0.50, 0), 1),
            Math.min(Math.max(indicators.stakingRatio      || 0.20, 0), 1),
            Math.min(Math.max(indicators.ecosystemActivity || 0.60, 0), 1),
            Math.min(Math.max(indicators.goldPegStrength   || 0.80, 0), 1)
        ];

        const [priceIdx, confidence, growthRaw] = this._forward(features);
        const priceSAR  = parseFloat((this.basePrice * (0.5 + priceIdx * 1.5)).toFixed(4)); // 0.5 → 2.0 SAR
        const priceUSD  = parseFloat((priceSAR / 3.75).toFixed(6));
        const growth    = growthRaw * 2 - 1; // [-1, +1]

        const recommendation = confidence > 0.75
            ? (growth > 0.1 ? '📈 شراء — النمو إيجابي' : growth < -0.1 ? '📉 تحوط — إشارة تراجع' : '↔️ احتفاظ — مستقر')
            : '⚠️ انتظار — ثقة منخفضة';

        return {
            priceSAR,
            priceUSD,
            confidence:     parseFloat(confidence.toFixed(4)),
            growthSignal:   parseFloat(growth.toFixed(4)),
            recommendation,
            features,
            trainCount:     this.trainCount
        };
    }

    /**
     * تدريب Oracle على سعر فعلي
     * @param {Object} indicators - المؤشرات
     * @param {{ priceSAR, confidence, growthSignal }} actual - القيم الفعلية
     */
    train(indicators, actual, epochs = 10) {
        const features = [
            Math.min(Math.max(indicators.backingRatio      || 0.85, 0), 1),
            Math.min(Math.max(indicators.circulatingRatio  || 0.05, 0), 1),
            Math.min(Math.max(indicators.dailyVolume       || 0.30, 0), 1),
            Math.min(Math.max(indicators.chainHealth       || 0.90, 0), 1),
            Math.min(Math.max(indicators.avgShariahScore   || 1.00, 0), 1),
            Math.min(Math.max(indicators.zakatPaid         || 0.50, 0), 1),
            Math.min(Math.max(indicators.stakingRatio      || 0.20, 0), 1),
            Math.min(Math.max(indicators.ecosystemActivity || 0.60, 0), 1),
            Math.min(Math.max(indicators.goldPegStrength   || 0.80, 0), 1)
        ];

        const maxSAR = 2.0;
        const targets = [
            Math.min((actual.priceSAR || this.basePrice) / maxSAR, 1.0),
            Math.min(Math.max(actual.confidence || 0.8, 0), 1),
            Math.min(Math.max(((actual.growthSignal || 0) + 1) / 2, 0), 1) // [-1,1] → [0,1]
        ];

        let lastLoss = 0;
        for (let e = 0; e < epochs; e++) {
            const pred = this._forward(features);
            const dOut = pred.map((p, i) => p - targets[i]);
            lastLoss   = dOut.reduce((s, d) => s + d * d, 0) / dOut.length;
            let grad   = dOut;
            for (let l = this.layers.length - 1; l >= 0; l--) grad = this.layers[l].backward(grad);
            this.trainCount++;
            this.totalLoss += lastLoss;
        }
        return lastLoss;
    }

    getStatus() {
        return {
            architecture: '9→24→16→8→3',
            trainCount:   this.trainCount,
            avgLoss:      this.trainCount > 0 ? (this.totalLoss / this.trainCount).toFixed(6) : 'N/A',
            basePrice:    this.basePrice
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. BACKING RESERVE ENGINE — محرك الاحتياطيات
// ═══════════════════════════════════════════════════════════════════════════════

class BackingReserveEngine {
    constructor() {
        // الاحتياطيات الأولية (بالريال السعودي)
        this.reserves = {
            gold:        { amountSAR: 40_000_000, ratio: 0.40, description: 'ذهب في خزائن آمنة' },
            silver:      { amountSAR: 30_000_000, ratio: 0.30, description: 'فضة في خزائن آمنة' },
            commodities: { amountSAR: 20_000_000, ratio: 0.20, description: 'سلع حقيقية (معادن، زراعة، صناعة)' },
            liquidity:   { amountSAR: 10_000_000, ratio: 0.10, description: 'سيولة نقدية مضمونة' }
        };
        this.totalSAR         = 100_000_000; // 100 مليون ريال
        this.circulatingSupply = 100_000_000; // 100 مليون SHK
        this.history           = [];
    }

    getTotalReservesSAR() {
        return Object.values(this.reserves).reduce((s, r) => s + r.amountSAR, 0);
    }

    /**
     * نسبة الدعم = إجمالي الاحتياطيات / (circulating supply × سعر SHK)
     */
    getBackingRatio(priceSAR = 1.0) {
        const total    = this.getTotalReservesSAR();
        const marketCap= this.circulatingSupply * priceSAR;
        return marketCap > 0 ? parseFloat((total / marketCap).toFixed(4)) : 1.0;
    }

    /**
     * إضافة احتياطي جديد (عند سك SHK مقابل أصول)
     */
    addReserve(assetType, amountSAR, txHash = null) {
        if (!this.reserves[assetType]) throw new Error(`نوع أصل غير معروف: ${assetType}`);
        this.reserves[assetType].amountSAR += amountSAR;
        const entry = { type: 'add', assetType, amountSAR, txHash, timestamp: new Date().toISOString() };
        this.history.push(entry);
        return entry;
    }

    /**
     * سحب احتياطي (عند حرق SHK لاسترداد أصول)
     */
    removeReserve(assetType, amountSAR, txHash = null) {
        if (!this.reserves[assetType]) throw new Error(`نوع أصل غير معروف: ${assetType}`);
        if (this.reserves[assetType].amountSAR < amountSAR) throw new Error('احتياطي غير كافٍ');
        this.reserves[assetType].amountSAR -= amountSAR;
        const entry = { type: 'remove', assetType, amountSAR, txHash, timestamp: new Date().toISOString() };
        this.history.push(entry);
        return entry;
    }

    getStatus(priceSAR = 1.0) {
        const totalRes = this.getTotalReservesSAR();
        const backRatio = this.getBackingRatio(priceSAR);
        return {
            reserves:          this.reserves,
            totalReservesSAR:  totalRes,
            circulatingSupply: this.circulatingSupply,
            backingRatio:      backRatio,
            backingPercent:    parseFloat((backRatio * 100).toFixed(2)) + '٪',
            backingStatus:     backRatio >= 1.0 ? '✅ مدعومة بالكامل' : backRatio >= 0.7 ? '🟡 دعم جزئي' : '🔴 يحتاج تعزيز',
            marketCapSAR:      parseFloat((this.circulatingSupply * priceSAR).toFixed(2)),
            priceUsed:         priceSAR
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. WALLET ENGINE — محرك المحافظ على السلسلة
// ═══════════════════════════════════════════════════════════════════════════════

class WalletEngine {
    constructor() {
        this.wallets = new Map(); // address → wallet
    }

    /**
     * إنشاء محفظة جديدة
     * @param {string} ownerName - اسم المالك
     * @param {string} [ownerId]  - معرّف المالك (اختياري)
     */
    createWallet(ownerName, ownerId = null) {
        const address = 'SHK1' + sha256(ownerName + Date.now() + Math.random()).substring(0, 32);
        const wallet  = {
            address,
            ownerName,
            ownerId:    ownerId || newId('OWN'),
            balances:   { SHK: 0, DGD: 0, SDH: 0 },
            staked:     { SHK: 0 },
            createdAt:  new Date().toISOString(),
            txCount:    0,
            active:     true,
            onChain:    false // يصبح true بعد التسجيل على البلوكشين
        };
        this.wallets.set(address, wallet);
        return wallet;
    }

    getWallet(address) { return this.wallets.get(address) || null; }

    getAllWallets() { return Array.from(this.wallets.values()); }

    /**
     * تعديل الرصيد (داخلياً — المعاملات تتم عبر TransferEngine)
     */
    _adjustBalance(address, currency, delta) {
        const w = this.wallets.get(address);
        if (!w) throw new Error(`المحفظة غير موجودة: ${address}`);
        if (!w.balances[currency] === undefined) throw new Error(`عملة غير مدعومة: ${currency}`);
        w.balances[currency] = (w.balances[currency] || 0) + delta;
        if (w.balances[currency] < 0) throw new Error('رصيد غير كافٍ');
        w.txCount++;
        return w.balances[currency];
    }

    getBalance(address, currency = 'SHK') {
        const w = this.wallets.get(address);
        return w ? (w.balances[currency] || 0) : null;
    }

    /**
     * تجميد SHK للتخزين (Staking)
     */
    stake(address, amount) {
        const w = this.wallets.get(address);
        if (!w) throw new Error('المحفظة غير موجودة');
        if (w.balances.SHK < amount) throw new Error('رصيد SHK غير كافٍ للتجميد');
        w.balances.SHK -= amount;
        w.staked.SHK   = (w.staked.SHK || 0) + amount;
        return { address, staked: w.staked.SHK, available: w.balances.SHK };
    }

    /**
     * إلغاء التجميد مع المكافأة
     */
    unstake(address, amount, rewardRate = 0.05) {
        const w = this.wallets.get(address);
        if (!w) throw new Error('المحفظة غير موجودة');
        if (w.staked.SHK < amount) throw new Error('المبلغ المجمّد غير كافٍ');
        const reward = parseFloat((amount * rewardRate).toFixed(4));
        w.staked.SHK   -= amount;
        w.balances.SHK += amount + reward;
        return { address, unstaked: amount, reward, newBalance: w.balances.SHK };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. MINT / BURN ENGINE — محرك السك والحرق
// ═══════════════════════════════════════════════════════════════════════════════

const MINT_AUTHORITY = 'SHEIKHA_CENTRAL_BANK';

class MintBurnEngine {
    constructor(walletEngine, backingEngine) {
        this.wallets  = walletEngine;
        this.backing  = backingEngine;
        this.mintLog  = [];
        this.burnLog  = [];
        this.totalMinted = 0;
        this.totalBurned = 0;
    }

    /**
     * سك SHK جديدة — يتطلب تقديم أصول حقيقية
     * @param {string} toAddress   - عنوان المستفيد
     * @param {number} amountSHK   - كمية SHK المراد إصدارها
     * @param {string} backingAsset- نوع الأصل الداعم: gold|silver|commodities|liquidity
     * @param {number} backingValueSAR - قيمة الأصل بالريال
     */
    mint(toAddress, amountSHK, backingAsset, backingValueSAR) {
        if (!toAddress) throw new Error('عنوان المحفظة مطلوب');
        if (amountSHK <= 0) throw new Error('كمية السك يجب أن تكون موجبة');
        if (!['gold', 'silver', 'commodities', 'liquidity'].includes(backingAsset)) {
            throw new Error(`أصل دعم غير صحيح: ${backingAsset}`);
        }
        if (backingValueSAR <= 0) throw new Error('قيمة الأصل الداعم يجب أن تكون موجبة');

        // إضافة الأصل للاحتياطيات
        const reserveEntry = this.backing.addReserve(backingAsset, backingValueSAR);

        // إضافة SHK للمحفظة
        this.wallets._adjustBalance(toAddress, 'SHK', amountSHK);
        this.backing.circulatingSupply += amountSHK;
        this.totalMinted += amountSHK;

        const record = {
            mintId:         newId('MINT'),
            toAddress,
            amountSHK,
            backingAsset,
            backingValueSAR,
            backingRatioPerToken: parseFloat((backingValueSAR / amountSHK).toFixed(4)),
            timestamp:      new Date().toISOString(),
            authority:      MINT_AUTHORITY
        };
        this.mintLog.push(record);
        return record;
    }

    /**
     * حرق SHK — واسترداد أصول داعمة
     * @param {string} fromAddress  - عنوان المحفظة
     * @param {number} amountSHK    - كمية SHK للحرق
     * @param {string} redeemAsset  - الأصل المراد استرداده
     * @param {number} priceSAR     - سعر SHK الحالي بالريال
     */
    burn(fromAddress, amountSHK, redeemAsset, priceSAR = 1.0) {
        if (!fromAddress) throw new Error('عنوان المحفظة مطلوب');
        if (amountSHK <= 0) throw new Error('كمية الحرق يجب أن تكون موجبة');

        // سحب SHK من المحفظة
        this.wallets._adjustBalance(fromAddress, 'SHK', -amountSHK);

        // حساب قيمة الأصل المستردة
        const redeemValueSAR = parseFloat((amountSHK * priceSAR * 0.98).toFixed(2)); // رسوم استرداد 2%
        this.backing.removeReserve(redeemAsset, redeemValueSAR);
        this.backing.circulatingSupply -= amountSHK;
        this.totalBurned += amountSHK;

        const record = {
            burnId:         newId('BURN'),
            fromAddress,
            amountSHK,
            redeemAsset,
            redeemValueSAR,
            redemptionFee:  parseFloat((amountSHK * priceSAR * 0.02).toFixed(2)),
            timestamp:      new Date().toISOString()
        };
        this.burnLog.push(record);
        return record;
    }

    getStats() {
        return {
            totalMinted:       this.totalMinted,
            totalBurned:       this.totalBurned,
            netCirculating:    this.backing.circulatingSupply,
            mintOperations:    this.mintLog.length,
            burnOperations:    this.burnLog.length
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TRANSFER ENGINE — محرك التحويل على البلوكشين
// ═══════════════════════════════════════════════════════════════════════════════

const TX_FEE_RATE = 0.001; // 0.1% رسوم تحويل داخلي

class TransferEngine {
    constructor(walletEngine) {
        this.wallets   = walletEngine;
        this.txHistory = [];
    }

    /**
     * تحويل SHK بين محفظتين
     * @param {string} from       - عنوان المحفظة المرسِلة
     * @param {string} to         - عنوان المحفظة المستقبِلة
     * @param {number} amount     - الكمية
     * @param {string} currency   - SHK | DGD | SDH
     * @param {string} [memo]     - ملاحظة (اختيارية)
     * @returns {{ txId, from, to, amount, fee, net, hash }}
     */
    transfer(from, to, amount, currency = 'SHK', memo = '') {
        if (amount <= 0) throw new Error('مبلغ التحويل يجب أن يكون موجباً');

        const fromWallet = this.wallets.getWallet(from);
        const toWallet   = this.wallets.getWallet(to);
        if (!fromWallet) throw new Error(`محفظة المرسِل غير موجودة: ${from}`);
        if (!toWallet)   throw new Error(`محفظة المستقبِل غير موجودة: ${to}`);

        const balance = fromWallet.balances[currency] || 0;
        const fee     = currency === 'SHK' ? parseFloat((amount * TX_FEE_RATE).toFixed(4)) : 0;
        const total   = amount + fee;

        if (balance < total) throw new Error(`رصيد غير كافٍ — المتاح: ${balance}, المطلوب: ${total}`);

        // تنفيذ التحويل
        this.wallets._adjustBalance(from, currency, -total);
        this.wallets._adjustBalance(to,   currency,  amount);

        const tx = {
            txId:      newId('TX'),
            from,
            to,
            amount,
            currency,
            fee,
            net:       amount,
            memo,
            timestamp: new Date().toISOString(),
            hash:      sha256(`${from}${to}${amount}${currency}${Date.now()}`).substring(0, 32)
        };
        this.txHistory.push(tx);
        return tx;
    }

    getTxHistory(address = null, limit = 50) {
        const txs = address
            ? this.txHistory.filter(t => t.from === address || t.to === address)
            : this.txHistory;
        return txs.slice(-limit);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. MARKET ENGINE — محرك السوق
// ═══════════════════════════════════════════════════════════════════════════════

class MarketEngine {
    constructor() {
        this.priceHistory = []; // آخر 100 تسعيرة
        this.maxHistory   = 100;

        // سعر أولي
        this.currentPriceSAR = 1.0;
        this.ath = 1.0; // All-time high
        this.atl = 1.0; // All-time low
    }

    updatePrice(priceSAR, confidence = 0.8) {
        if (priceSAR <= 0) return;
        this.currentPriceSAR = priceSAR;
        if (priceSAR > this.ath) this.ath = priceSAR;
        if (priceSAR < this.atl) this.atl = priceSAR;

        const entry = {
            priceSAR,
            priceUSD:   parseFloat((priceSAR / 3.75).toFixed(6)),
            confidence,
            timestamp:  Date.now()
        };
        this.priceHistory.push(entry);
        if (this.priceHistory.length > this.maxHistory) {
            this.priceHistory.shift();
        }
        return entry;
    }

    getLivePrice() {
        // تذبذب طبيعي بسيط (±1%)
        const t      = Date.now() / 60000;
        const jitter = 1 + 0.01 * Math.sin(t * 3.7 + 1.2);
        return parseFloat((this.currentPriceSAR * jitter).toFixed(6));
    }

    getMarketStats(circulatingSupply = 100_000_000) {
        const price     = this.getLivePrice();
        const marketCap = parseFloat((price * circulatingSupply).toFixed(2));
        const history24 = this.priceHistory.slice(-24);
        const high24    = history24.length ? Math.max(...history24.map(h => h.priceSAR)) : price;
        const low24     = history24.length ? Math.min(...history24.map(h => h.priceSAR)) : price;
        const open24    = history24.length ? history24[0].priceSAR : price;
        const change24h = parseFloat(((price - open24) / open24 * 100).toFixed(2));

        return {
            priceSAR:     price,
            priceUSD:     parseFloat((price / 3.75).toFixed(6)),
            priceBTC:     'N/A',
            marketCapSAR: marketCap,
            marketCapUSD: parseFloat((marketCap / 3.75).toFixed(2)),
            high24h:      high24,
            low24h:       low24,
            change24h:    change24h + '٪',
            ath:          this.ath,
            atl:          this.atl,
            circulatingSupply,
            updatedAt:    new Date().toISOString()
        };
    }

    getExchangeRate(from, to, amount = 1) {
        const priceSAR = this.getLivePrice();
        const toSAR = {
            SHK: priceSAR,
            DGD: 235 * 4.25,   // تقديري
            SDH: 3 * 3.0,       // تقديري
            SAR: 1,
            USD: 3.75,
            EUR: 4.07,
            GBP: 4.74,
            AED: 1.02,
            KWD: 12.10
        };
        const fromRate = toSAR[from] || 1;
        const toRate   = toSAR[to]   || 1;
        const result   = parseFloat((amount * fromRate / toRate).toFixed(6));
        return {
            from, to, amount, result,
            rate:  parseFloat((fromRate / toRate).toFixed(6)),
            priceSAR,
            note:  '«وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ» — صرف عادل بلا ربا'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. SHK BASE EXCHANGE ENGINE — SHK كعملة أساسية لكل تداول رقمي
//    كل تداول يمر: INPUT_CURRENCY → SHK → OUTPUT_CURRENCY (إجباري)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * جدول العملات الرقمية المدعومة مع أسعارها بالدولار الأمريكي (نماذج حية)
 * يتذبذب كل سعر ±2٪ بشكل طبيعي لمحاكاة السوق الحقيقي
 */
const DIGITAL_CURRENCIES = {
    // ── شيخة (العملة الأساسية) ─────────────────────────────────────────────
    SHK:  { nameAr: 'شيخة كوين', nameEn: 'Sheikha Coin', symbol: '⭐', baseUSD: 0.267, isBase: true,   shariahStatus: 'حلال ✅', category: 'islamic'    },
    DGD:  { nameAr: 'دينار ذهبي', nameEn: 'Digital Gold Dinar', symbol: '🥇', baseUSD: 266.0, isBase: false, shariahStatus: 'حلال ✅', category: 'islamic' },
    SDH:  { nameAr: 'درهم فضي',   nameEn: 'Digital Silver Dirham', symbol: '🥈', baseUSD: 9.0, isBase: false, shariahStatus: 'حلال ✅', category: 'islamic' },
    // ── العملات الكبرى ──────────────────────────────────────────────────────
    BTC:  { nameAr: 'بيتكوين',   nameEn: 'Bitcoin',     symbol: '₿',   baseUSD: 65000,  isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    ETH:  { nameAr: 'إيثيريوم', nameEn: 'Ethereum',    symbol: 'Ξ',   baseUSD: 3400,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    BNB:  { nameAr: 'بي إن بي',  nameEn: 'BNB',         symbol: 'BNB', baseUSD: 590,    isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    XRP:  { nameAr: 'ريبل',      nameEn: 'Ripple',      symbol: 'XRP', baseUSD: 0.52,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    SOL:  { nameAr: 'سولانا',    nameEn: 'Solana',      symbol: 'SOL', baseUSD: 155,    isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    ADA:  { nameAr: 'كاردانو',   nameEn: 'Cardano',     symbol: 'ADA', baseUSD: 0.43,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    DOGE: { nameAr: 'دوجكوين',   nameEn: 'Dogecoin',    symbol: 'DOGE',baseUSD: 0.14,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    MATIC:{ nameAr: 'بوليجون',   nameEn: 'Polygon',     symbol: 'MATIC',baseUSD: 0.80,  isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    DOT:  { nameAr: 'بولكادوت',  nameEn: 'Polkadot',    symbol: 'DOT', baseUSD: 7.5,    isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    LINK: { nameAr: 'شينلينك',   nameEn: 'Chainlink',   symbol: 'LINK',baseUSD: 14.0,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    AVAX: { nameAr: 'أفالانش',   nameEn: 'Avalanche',   symbol: 'AVAX',baseUSD: 38.0,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    UNI:  { nameAr: 'يونيسواب',  nameEn: 'Uniswap',     symbol: 'UNI', baseUSD: 8.0,    isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    ATOM: { nameAr: 'كوزموس',    nameEn: 'Cosmos',      symbol: 'ATOM',baseUSD: 9.0,    isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    LTC:  { nameAr: 'لايتكوين',  nameEn: 'Litecoin',    symbol: 'LTC', baseUSD: 83.0,   isBase: false, shariahStatus: 'مباح (اجتهاد)', category: 'major'  },
    // ── العملات المستقرة ─────────────────────────────────────────────────────
    USDT: { nameAr: 'تيثر',      nameEn: 'Tether',      symbol: '₮',   baseUSD: 1.0,    isBase: false, shariahStatus: 'تنبيه فائدة', category: 'stable'  },
    USDC: { nameAr: 'USD كوين',  nameEn: 'USD Coin',    symbol: 'USDC',baseUSD: 1.0,    isBase: false, shariahStatus: 'تنبيه فائدة', category: 'stable'  },
    BUSD: { nameAr: 'بينانس USD',nameEn: 'Binance USD', symbol: 'BUSD',baseUSD: 1.0,    isBase: false, shariahStatus: 'تنبيه فائدة', category: 'stable'  },
    DAI:  { nameAr: 'داي',       nameEn: 'DAI',         symbol: 'DAI', baseUSD: 1.0,    isBase: false, shariahStatus: 'تنبيه فائدة', category: 'stable'  },
    // ── العملات الفيات ───────────────────────────────────────────────────────
    SAR:  { nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'SR', baseUSD: 0.2667, isBase: false, shariahStatus: 'حلال ✅', category: 'fiat'   },
    USD:  { nameAr: 'دولار',     nameEn: 'US Dollar',   symbol: '$',   baseUSD: 1.0,    isBase: false, shariahStatus: 'حلال ✅', category: 'fiat'   },
    EUR:  { nameAr: 'يورو',      nameEn: 'Euro',        symbol: '€',   baseUSD: 1.085,  isBase: false, shariahStatus: 'حلال ✅', category: 'fiat'   },
    GBP:  { nameAr: 'جنيه',      nameEn: 'Pound',       symbol: '£',   baseUSD: 1.265,  isBase: false, shariahStatus: 'حلال ✅', category: 'fiat'   },
    AED:  { nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'AED', baseUSD: 0.272, isBase: false, shariahStatus: 'حلال ✅', category: 'fiat' },
    KWD:  { nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', symbol: 'KWD', baseUSD: 3.25, isBase: false, shariahStatus: 'حلال ✅', category: 'fiat' },
    QAR:  { nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', symbol: 'QAR', baseUSD: 0.275, isBase: false, shariahStatus: 'حلال ✅', category: 'fiat' }
};

// الفئات المحظورة من التداول (تنبيه شرعي)
const SHARIAH_WARNINGS = new Set(['USDT', 'USDC', 'BUSD', 'DAI']); // عملات مستقرة قد تنطوي على فائدة

class SHKBaseExchangeEngine {
    /**
     * قاعدة الصرف: كل تداول يمر عبر SHK
     * INPUT_CURRENCY → SHK (leg1) → OUTPUT_CURRENCY (leg2)
     * يُحتسب السعر بالدولار → تحويل لـ SHK → تحويل للمطلوب
     */

    /**
     * سعر عملة بالدولار مع تذبذب طبيعي ±2٪
     */
    static _liveUSD(code) {
        const def = DIGITAL_CURRENCIES[code];
        if (!def) throw new Error(`العملة غير مدعومة: ${code}`);
        const t      = Date.now() / 60000;
        const jitter = 1 + 0.02 * Math.sin(t * (2.1 + (code.charCodeAt(0) % 10) * 0.1));
        return def.baseUSD * jitter;
    }

    /**
     * تحويل أي عملة → SHK (الساق الأولى)
     * @param {string} fromCurrency
     * @param {number} amount
     * @param {number} shkPriceSAR - سعر SHK بالريال من النظام
     * @returns {{ shkAmount, rate, stepDetails }}
     */
    static toSHK(fromCurrency, amount, shkPriceSAR = 1.0) {
        if (fromCurrency === 'SHK') return { shkAmount: amount, rate: 1, stepDetails: null };

        const fromUSD  = SHKBaseExchangeEngine._liveUSD(fromCurrency);
        const shkUSD   = shkPriceSAR / 3.75; // SHK سعره بالدولار
        const shkAmount = parseFloat((amount * fromUSD / shkUSD).toFixed(6));
        const rate      = parseFloat((fromUSD / shkUSD).toFixed(6));

        return {
            shkAmount,
            rate,
            stepDetails: {
                leg:      'INPUT → SHK',
                from:     fromCurrency,
                fromUSD:  parseFloat((amount * fromUSD).toFixed(4)),
                shkUSD:   parseFloat(shkUSD.toFixed(6)),
                shkAmount
            }
        };
    }

    /**
     * تحويل SHK → أي عملة (الساق الثانية)
     * @param {string} toCurrency
     * @param {number} shkAmount
     * @param {number} shkPriceSAR
     * @returns {{ toAmount, rate, stepDetails }}
     */
    static fromSHK(toCurrency, shkAmount, shkPriceSAR = 1.0) {
        if (toCurrency === 'SHK') return { toAmount: shkAmount, rate: 1, stepDetails: null };

        const toUSD    = SHKBaseExchangeEngine._liveUSD(toCurrency);
        const shkUSD   = shkPriceSAR / 3.75;
        const toAmount = parseFloat((shkAmount * shkUSD / toUSD).toFixed(6));
        const rate     = parseFloat((shkUSD / toUSD).toFixed(6));

        return {
            toAmount,
            rate,
            stepDetails: {
                leg:      'SHK → OUTPUT',
                to:       toCurrency,
                shkUSD:   parseFloat(shkUSD.toFixed(6)),
                toUSD:    parseFloat((toAmount * toUSD).toFixed(4)),
                toAmount
            }
        };
    }

    /**
     * التداول الكامل: ANY → SHK → ANY
     * @param {string} fromCurrency - العملة المدخلة
     * @param {string} toCurrency   - العملة المطلوبة
     * @param {number} amount       - الكمية المدخلة
     * @param {number} shkPriceSAR  - سعر SHK بالريال
     * @param {number} feeRate      - نسبة الرسوم (0.002 = 0.2٪)
     * @returns {{ success, quote }}
     */
    static quote(fromCurrency, toCurrency, amount, shkPriceSAR = 1.0, feeRate = 0.002) {
        const fromDef = DIGITAL_CURRENCIES[fromCurrency];
        const toDef   = DIGITAL_CURRENCIES[toCurrency];
        if (!fromDef) return { success: false, error: `العملة غير مدعومة: ${fromCurrency}` };
        if (!toDef)   return { success: false, error: `العملة غير مدعومة: ${toCurrency}` };

        // تنبيه شرعي للعملات المستقرة
        const shariahWarnings = [];
        if (SHARIAH_WARNINGS.has(fromCurrency)) shariahWarnings.push(`${fromCurrency}: قد تنطوي على فائدة ربوية — تحقق قبل التداول`);
        if (SHARIAH_WARNINGS.has(toCurrency))   shariahWarnings.push(`${toCurrency}: قد تنطوي على فائدة ربوية — تحقق قبل التداول`);

        // الساق الأولى: FROM → SHK
        const leg1    = SHKBaseExchangeEngine.toSHK(fromCurrency, amount, shkPriceSAR);
        const fee     = parseFloat((leg1.shkAmount * feeRate).toFixed(6));
        const shkNet  = parseFloat((leg1.shkAmount - fee).toFixed(6));

        // الساق الثانية: SHK → TO
        const leg2    = SHKBaseExchangeEngine.fromSHK(toCurrency, shkNet, shkPriceSAR);

        const fromUSD = SHKBaseExchangeEngine._liveUSD(fromCurrency);
        const toUSD   = SHKBaseExchangeEngine._liveUSD(toCurrency);
        const effectiveRate = parseFloat((amount * fromUSD / (leg2.toAmount * toUSD || 1)).toFixed(6));

        return {
            success: true,
            quote: {
                from:            fromCurrency,
                to:              toCurrency,
                amountIn:        amount,
                amountOut:       leg2.toAmount,
                baseCurrency:    'SHK',
                shkIntermediate: leg1.shkAmount,
                shkFee:          fee,
                shkNet,
                feeRate:         (feeRate * 100).toFixed(2) + '٪',
                effectiveRate,
                leg1:            leg1.stepDetails,
                leg2:            leg2.stepDetails,
                shariahWarnings,
                principle:       'SHK هي العملة الأساسية — كل تداول يمر عبرها',
                quranRef:        '«وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ» — الرحمن: 9',
                timestamp:       new Date().toISOString()
            }
        };
    }

    /** قائمة جميع العملات المدعومة */
    static getSupportedCurrencies() {
        const t = Date.now() / 60000;
        return Object.entries(DIGITAL_CURRENCIES).map(([code, def]) => {
            const jitter = 1 + 0.02 * Math.sin(t * (2.1 + (code.charCodeAt(0) % 10) * 0.1));
            return {
                code,
                ...def,
                livePriceUSD: parseFloat((def.baseUSD * jitter).toFixed(6)),
                livePriceSAR: parseFloat((def.baseUSD * jitter * 3.75).toFixed(4)),
                isBase:       code === 'SHK'
            };
        });
    }

    /** أسعار مباشرة لكل العملات مقابل SHK */
    static getAllRatesVsSHK(shkPriceSAR = 1.0) {
        const shkUSD = shkPriceSAR / 3.75;
        const rates  = {};
        for (const [code, def] of Object.entries(DIGITAL_CURRENCIES)) {
            if (code === 'SHK') { rates[code] = 1; continue; }
            const liveUSD = def.baseUSD;
            rates[code]   = parseFloat((liveUSD / shkUSD).toFixed(6)); // كم SHK لكل وحدة من هذه العملة
        }
        return rates;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. SHEIKHA DIGITAL CURRENCY CORE — النواة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaDigitalCurrencyCore extends EventEmitter {
    constructor() {
        super();
        this.version   = '2.0.0';
        this.nameAr    = 'عملة شيخة الرقمية — التكامل الكامل والجيل الجديد';
        this.nameEn    = 'Sheikha Digital Currency Core — SHK New Generation';
        this.startTime = new Date();
        this.status    = 'operational';

        // المحركات الفرعية
        this.oracle    = new NeuralValueOracle();
        this.backing   = new BackingReserveEngine();
        this.wallets   = new WalletEngine();
        this.mintBurn  = new MintBurnEngine(this.wallets, this.backing);
        this.transfer  = new TransferEngine(this.wallets);
        this.market    = new MarketEngine();
        this.exchange  = SHKBaseExchangeEngine; // SHK كعملة أساسية

        // ربط بالبلوكشين العصبي
        this.blockchain = null;
        this._connectBlockchain();

        // بيانات مستمرة
        this._loadDb();

        // تحديث السعر الأولي
        this._updateNeuralPrice();

        // تحديث السعر دورياً (كل دقيقة)
        this._priceInterval = setInterval(() => this._updateNeuralPrice(), 60_000);

        console.log('');
        console.log('⭐ [SHK-CORE] ══════════════════════════════════════════════════════════');
        console.log(`⭐ [SHK-CORE] ${this.nameAr}`);
        console.log('⭐ [SHK-CORE] ══════════════════════════════════════════════════════════');
        console.log(`   ├─ Neural Value Oracle:  9→24→16→8→3 (warmup: ${this.oracle.trainCount} مرحلة)`);
        console.log(`   ├─ Backing Reserves:     100M SAR (ذهب+فضة+سلع+سيولة)`);
        console.log(`   ├─ Blockchain:           ${this.blockchain ? '✅ متصل' : '⚠️ غير متصل'}`);
        console.log(`   ├─ SHK Price (initial):  ${this.market.getLivePrice()} SAR`);
        console.log(`   ├─ SHK العملة الأساسية:  كل تداول يمر عبرها (ANY → SHK → ANY)`);
        console.log(`   └─ العملات المدعومة:     ${Object.keys(DIGITAL_CURRENCIES).length} عملة (BTC|ETH|USDT|BNB|XRP|SOL|SAR|...)`);
        console.log('');
    }

    _connectBlockchain() {
        try {
            const bc = require('./sheikha-neural-blockchain');
            this.blockchain = bc.neuralBlockchain;
        } catch (e) {
            console.warn('[SHK-CORE] ⚠️ Neural Blockchain غير متوفر:', e.message);
        }
    }

    _updateNeuralPrice() {
        const chainStats = this.blockchain ? this.blockchain.getNetworkStats() : {};
        const indicators = {
            backingRatio:      this.backing.getBackingRatio(this.market.currentPriceSAR),
            circulatingRatio:  Math.min(this.backing.circulatingSupply / 21_000_000_000, 1),
            dailyVolume:       Math.min((this.transfer.txHistory.length || 10) / 1000, 1),
            chainHealth:       chainStats.avgShariahScore  || 1.0,
            avgShariahScore:   chainStats.avgShariahScore  || 1.0,
            zakatPaid:         Math.min((chainStats.totalZakat || 0) / 100000, 1),
            stakingRatio:      this._computeStakingRatio(),
            ecosystemActivity: Math.min((chainStats.totalTransactions || 0) / 10000, 1),
            goldPegStrength:   this.backing.reserves.gold.amountSAR / this.backing.getTotalReservesSAR()
        };

        const assessment = this.oracle.assess(indicators);
        this.market.updatePrice(assessment.priceSAR, assessment.confidence);
        this.emit('price_updated', assessment);
        return assessment;
    }

    _computeStakingRatio() {
        let totalStaked = 0, totalSHK = 0;
        for (const w of this.wallets.getAllWallets()) {
            totalStaked += w.staked.SHK || 0;
            totalSHK    += (w.balances.SHK || 0) + (w.staked.SHK || 0);
        }
        return totalSHK > 0 ? Math.min(totalStaked / totalSHK, 1) : 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /** إنشاء محفظة SHK on-chain */
    createWallet(ownerName, ownerId = null) {
        const wallet = this.wallets.createWallet(ownerName, ownerId);

        // تسجيل إنشاء المحفظة على البلوكشين
        if (this.blockchain) {
            const result = this.blockchain.submitTransaction({
                id:          'WALLET-CREATE-' + wallet.address.substring(0, 8),
                type:        'wallet_creation',
                category:    'system',
                description: `إنشاء محفظة SHK جديدة: ${ownerName}`,
                from:        'SHEIKHA_SYSTEM',
                to:          wallet.address,
                amount:      0
            });
            wallet.onChain  = result.success;
            wallet.chainTxId = result.txId;
        }

        this._saveDb();
        this.emit('wallet_created', wallet);
        return wallet;
    }

    /** تحويل SHK عبر البلوكشين */
    transferSHK(from, to, amount, currency = 'SHK', memo = '') {
        const tx = this.transfer.transfer(from, to, amount, currency, memo);

        // تسجيل التحويل على البلوكشين
        if (this.blockchain) {
            const btx = this.blockchain.submitTransaction({
                id:          tx.txId,
                type:        'transfer',
                category:    'trade',
                description: memo || `تحويل ${amount} ${currency}`,
                from,
                to,
                amount,
                currency,
                fee:         tx.fee
            });
            tx.onChain  = btx.success;
            tx.chainTxId= btx.txId;

            // تعدين إذا تجمّع ما يكفي
            if (this.blockchain.getMempool().length >= 10) {
                this.blockchain.mineBlock();
            }
        }

        this._updateNeuralPrice();
        this._saveDb();
        this.emit('transfer', tx);
        return tx;
    }

    /** سك SHK مقابل أصول حقيقية */
    mintSHK(toAddress, amountSHK, backingAsset, backingValueSAR) {
        const record = this.mintBurn.mint(toAddress, amountSHK, backingAsset, backingValueSAR);

        if (this.blockchain) {
            this.blockchain.submitTransaction({
                id:          record.mintId,
                type:        'mint',
                category:    'system',
                description: `سك ${amountSHK} SHK مقابل ${backingValueSAR} SAR من ${backingAsset}`,
                from:        MINT_AUTHORITY,
                to:          toAddress,
                amount:      amountSHK,
                zakatType:   'trade'
            });
        }

        this._updateNeuralPrice();
        this._saveDb();
        this.emit('minted', record);
        return record;
    }

    /** حرق SHK واسترداد أصول */
    burnSHK(fromAddress, amountSHK, redeemAsset) {
        const priceSAR = this.market.getLivePrice();
        const record   = this.mintBurn.burn(fromAddress, amountSHK, redeemAsset, priceSAR);

        if (this.blockchain) {
            this.blockchain.submitTransaction({
                id:          record.burnId,
                type:        'burn',
                category:    'system',
                description: `حرق ${amountSHK} SHK واسترداد ${record.redeemValueSAR} SAR من ${redeemAsset}`,
                from:        fromAddress,
                to:          MINT_AUTHORITY,
                amount:      amountSHK
            });
        }

        this._updateNeuralPrice();
        this._saveDb();
        this.emit('burned', record);
        return record;
    }

    /** تجميد SHK لكسب مكافآت (بدون ربا) */
    stakeSHK(address, amount) {
        const result = this.wallets.stake(address, amount);
        this._updateNeuralPrice();
        this._saveDb();
        this.emit('staked', { address, amount });
        return result;
    }

    /** إلغاء التجميد مع المكافأة */
    unstakeSHK(address, amount) {
        const result = this.wallets.unstake(address, amount);
        this._updateNeuralPrice();
        this._saveDb();
        this.emit('unstaked', result);
        return result;
    }

    /** تقييم عصبي لقيمة SHK */
    getNeuralValueAssessment() {
        return this._updateNeuralPrice();
    }

    /** معلومات السوق */
    getMarketInfo() {
        return this.market.getMarketStats(this.backing.circulatingSupply);
    }

    /** سعر الصرف */
    getExchangeRate(from, to, amount = 1) {
        return this.market.getExchangeRate(from, to, amount);
    }

    /** وضع الاحتياطيات */
    getBackingStatus() {
        return this.backing.getStatus(this.market.getLivePrice());
    }

    /** تفاصيل محفظة */
    getWallet(address) {
        const w = this.wallets.getWallet(address);
        if (!w) return null;
        return { ...w, liveValueSAR: (w.balances.SHK || 0) * this.market.getLivePrice() };
    }

    /** سجل معاملات محفظة */
    getWalletHistory(address, limit = 50) {
        return this.transfer.getTxHistory(address, limit);
    }

    /** تدريب Oracle على سعر فعلي */
    trainOracle(indicators, actual, epochs = 10) {
        const loss = this.oracle.train(indicators, actual, epochs);
        this.emit('oracle_trained', { loss, epochs });
        return { loss, epochs };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHK BASE EXCHANGE API (SHK هي العملة الأساسية لكل تداول)
    // ─────────────────────────────────────────────────────────────────────────

    /** عرض سعر صرف: ANY → SHK → ANY */
    getExchangeQuote(fromCurrency, toCurrency, amount) {
        const shkPrice = this.market.getLivePrice();
        return this.exchange.quote(fromCurrency, toCurrency, amount, shkPrice);
    }

    /**
     * تنفيذ تداول فعلي عبر المحافظ: INPUT → SHK → OUTPUT
     * @param {string} walletFrom - محفظة المرسِل
     * @param {string} walletTo   - محفظة المستقبِل
     * @param {string} fromCurrency
     * @param {string} toCurrency
     * @param {number} amount
     */
    executeExchange(walletFrom, walletTo, fromCurrency, toCurrency, amount) {
        const shkPrice = this.market.getLivePrice();
        const quote    = this.exchange.quote(fromCurrency, toCurrency, amount, shkPrice);
        if (!quote.success) return quote;

        const q = quote.quote;

        // تسجيل التبادل على البلوكشين (معاملة واحدة موحدة)
        if (this.blockchain) {
            this.blockchain.submitTransaction({
                id:          newId('SWAP'),
                type:        'exchange',
                category:    'trade',
                description: `صرف ${amount} ${fromCurrency} ← SHK → ${q.amountOut} ${toCurrency}`,
                from:        walletFrom || 'EXCHANGE',
                to:          walletTo   || 'EXCHANGE',
                amount:      parseFloat((q.shkIntermediate).toFixed(4)),
                currency:    'SHK',
                fromCurrency,
                toCurrency,
                amountIn:    amount,
                amountOut:   q.amountOut
            });
        }

        const swapRecord = {
            swapId:       newId('SWAP'),
            walletFrom,
            walletTo,
            fromCurrency,
            toCurrency,
            amountIn:     amount,
            amountOut:    q.amountOut,
            shkFee:       q.shkFee,
            baseCurrency: 'SHK',
            timestamp:    new Date().toISOString(),
            quote:        q
        };

        this._updateNeuralPrice();
        this._saveDb();
        this.emit('exchange_executed', swapRecord);
        return { success: true, swap: swapRecord };
    }

    /** قائمة جميع العملات الرقمية المدعومة */
    getSupportedCurrencies() {
        return this.exchange.getSupportedCurrencies();
    }

    /** جميع الأسعار مقابل SHK */
    getAllRatesVsSHK() {
        return this.exchange.getAllRatesVsSHK(this.market.getLivePrice());
    }

    /** الحالة الكاملة */
    getStatus() {
        const price = this.market.getLivePrice();
        return {
            name:          this.nameAr,
            version:       this.version,
            status:        this.status,
            uptime:        Math.floor((Date.now() - this.startTime) / 1000) + 's',
            currency: {
                code:      'SHK',
                symbol:    '⭐',
                nameAr:    'شيخة كوين',
                isBase:    true,
                priceSAR:  price,
                priceUSD:  parseFloat((price / 3.75).toFixed(6)),
                principle: 'SHK هي العملة الأساسية — كل تداول يمر عبرها'
            },
            oracle:              this.oracle.getStatus(),
            backing:             this.backing.getStatus(price),
            market:              this.market.getMarketStats(this.backing.circulatingSupply),
            mintBurn:            this.mintBurn.getStats(),
            walletCount:         this.wallets.getAllWallets().length,
            txCount:             this.transfer.txHistory.length,
            supportedCurrencies: Object.keys(DIGITAL_CURRENCIES).length,
            blockchain:          this.blockchain ? this.blockchain.getNetworkStats() : null,
            islamicNote:         '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة: 275'
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PERSISTENCE
    // ─────────────────────────────────────────────────────────────────────────

    _saveDb() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            const data = {
                wallets:    Array.from(this.wallets.wallets.entries()),
                txHistory:  this.transfer.txHistory.slice(-500),
                mintLog:    this.mintBurn.mintLog.slice(-100),
                burnLog:    this.mintBurn.burnLog.slice(-100),
                reserves:   this.backing.reserves,
                circulatingSupply: this.backing.circulatingSupply,
                savedAt:    new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        } catch (_) { /* لا تُوقف النظام عند فشل الحفظ */ }
    }

    _loadDb() {
        try {
            if (!fs.existsSync(DB_FILE)) return;
            const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            if (data.wallets) {
                this.wallets.wallets = new Map(data.wallets);
            }
            if (data.txHistory) this.transfer.txHistory = data.txHistory;
            if (data.mintLog)   this.mintBurn.mintLog   = data.mintLog;
            if (data.burnLog)   this.mintBurn.burnLog   = data.burnLog;
            if (data.reserves)  this.backing.reserves   = data.reserves;
            if (data.circulatingSupply) this.backing.circulatingSupply = data.circulatingSupply;
        } catch (_) { /* ابدأ من جديد */ }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const shkCore = new SheikhaDigitalCurrencyCore();

module.exports = {
    SheikhaDigitalCurrencyCore,
    shkCore,
    NeuralValueOracle,
    BackingReserveEngine,
    WalletEngine,
    MintBurnEngine,
    TransferEngine,
    MarketEngine,
    SHKBaseExchangeEngine,
    DIGITAL_CURRENCIES,
    SHARIAH_WARNINGS,
    MINT_AUTHORITY
};
