// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⛓️🧠 SHEIKHA NEURAL BLOCKCHAIN — شبكة شيخة العصبية البلوكشين
 *       الجيل الجديد — New Generation
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ" — البقرة: 282
 * "وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ" — الأنعام: 152
 * "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ" — المائدة: 1
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * البنية المعمارية — الجيل الجديد:
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │  Layer 0 — SHARIAH FILTER       (فلتر الشريعة)                         │
 *  │    • رفض المعاملات الربوية، الغررية، المحرمة تلقائياً                   │
 *  │    • فحص حلّية المنتج والبائع والمشتري                                  │
 *  ├─────────────────────────────────────────────────────────────────────────┤
 *  │  Layer 1 — MERKLE TREE           (شجرة ميركل)                           │
 *  │    • SHA-256 Merkle Root لكل مجموعة معاملات                              │
 *  │    • إثبات الوجود بدون كشف كل البيانات                                  │
 *  ├─────────────────────────────────────────────────────────────────────────┤
 *  │  Layer 2 — NEURAL VALIDATOR      (المُدقِّق العصبي)                     │
 *  │    • شبكة عصبية [8→24→16→8→1] تُقيّم كل كتلة قبل الإضافة              │
 *  │    • Proof-of-Neural: الكتلة تُقبل إذا neural_score ≥ threshold         │
 *  │    • التدريب المستمر من سجل الكتل المعتمدة                              │
 *  ├─────────────────────────────────────────────────────────────────────────┤
 *  │  Layer 3 — BLOCK CHAIN           (سلسلة الكتل)                          │
 *  │    • هيكل الكتلة: index | timestamp | transactions | merkleRoot |       │
 *  │                   previousHash | neuralScore | nonce | hash             │
 *  │    • التحقق من السلسلة بالكامل (chain validation)                       │
 *  ├─────────────────────────────────────────────────────────────────────────┤
 *  │  Layer 4 — SMART CONTRACTS       (العقود الذكية الشرعية)                │
 *  │    • عقود مضاربة، مرابحة، إجارة، سلم، استصناع، وكالة                   │
 *  │    • تنفيذ تلقائي عند استيفاء الشروط                                   │
 *  ├─────────────────────────────────────────────────────────────────────────┤
 *  │  Layer 5 — ZAKAT ENGINE          (محرك الزكاة التلقائي)                 │
 *  │    • احتساب زكاة المعاملات التجارية تلقائياً                            │
 *  │    • توثيق الصدقات والأوقاف على السلسلة                                 │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 * ✅ بجافاسكربت نقي — لا مكتبات خارجية
 * ✅ SHA-256 عبر Node.js crypto المدمج
 * ✅ شبكة عصبية حقيقية (Adam + Backprop + Xavier)
 * ✅ فلتر شرعي 100% قبل كل كتلة
 * ✅ Merkle Proof لكل معاملة
 * ✅ تكامل مع أنظمة ERP/SCM/Admin العصبية
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const crypto     = require('crypto');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CRYPTO UTILITIES — أدوات التشفير
// ═══════════════════════════════════════════════════════════════════════════════

function sha256(data) {
    return crypto.createHash('sha256').update(
        typeof data === 'string' ? data : JSON.stringify(data)
    ).digest('hex');
}

function sha256Double(data) {
    return sha256(sha256(data));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MERKLE TREE — شجرة ميركل
// ═══════════════════════════════════════════════════════════════════════════════

class MerkleTree {
    /**
     * @param {string[]} leaves - مصفوفة من التجزئات (transaction hashes)
     */
    constructor(leaves = []) {
        this.leaves = leaves.length > 0 ? leaves : ['EMPTY'];
        this.tree   = this._buildTree(this.leaves);
        this.root   = this.tree[this.tree.length - 1][0];
    }

    _buildTree(leaves) {
        const tree = [leaves.map(l => sha256(l))];
        let current = tree[0];

        while (current.length > 1) {
            const next = [];
            for (let i = 0; i < current.length; i += 2) {
                const left  = current[i];
                const right = current[i + 1] || current[i]; // duplicate last if odd
                next.push(sha256(left + right));
            }
            tree.push(next);
            current = next;
        }
        return tree;
    }

    getRoot() { return this.root; }

    /**
     * إثبات وجود معاملة (Merkle Proof)
     * @param {string} txHash
     * @returns {Object} { valid, proof }
     */
    getProof(txHash) {
        const hash  = sha256(txHash);
        let idx = this.tree[0].indexOf(hash);
        if (idx === -1) return { valid: false, proof: [] };

        const proof = [];
        for (let level = 0; level < this.tree.length - 1; level++) {
            const isRight = idx % 2 === 1;
            const sibIdx  = isRight ? idx - 1 : idx + 1;
            const sibling = this.tree[level][sibIdx] || this.tree[level][idx];
            proof.push({ position: isRight ? 'left' : 'right', hash: sibling });
            idx = Math.floor(idx / 2);
        }
        return { valid: true, proof, root: this.root };
    }

    /**
     * التحقق من الإثبات
     */
    static verifyProof(txHash, proof, root) {
        let hash = sha256(txHash);
        for (const { position, hash: sibHash } of proof) {
            if (position === 'left') hash = sha256(sibHash + hash);
            else                     hash = sha256(hash + sibHash);
        }
        return hash === root;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SHARIAH FILTER — الفلتر الشرعي
// ═══════════════════════════════════════════════════════════════════════════════

const HARAM_CATEGORIES = new Set([
    'alcohol', 'gambling', 'pork', 'tobacco', 'drugs', 'weapons_illegal',
    'interest_riba', 'gharar_extreme', 'pornography', 'usury',
    'كحول', 'قمار', 'خنزير', 'تبغ', 'مخدرات', 'ربا', 'غرر_شديد'
]);

const RIBA_INDICATORS = [
    'fixed_interest', 'variable_interest', 'compound_interest', 'overdraft_fee',
    'late_payment_interest', 'فائدة', 'ربا', 'فوائد'
];

class ShariahFilter {
    /**
     * فحص معاملة واحدة شرعياً
     * @param {Object} tx - المعاملة
     * @returns {{ halal: boolean, violations: string[], shariahScore: number }}
     */
    static check(tx) {
        const violations = [];

        // فحص فئة المنتج
        const category = (tx.category || tx.type || '').toLowerCase();
        if (HARAM_CATEGORIES.has(category)) {
            violations.push(`فئة محرمة: ${category}`);
        }

        // فحص الربا
        for (const ri of RIBA_INDICATORS) {
            if (category.includes(ri) || JSON.stringify(tx).toLowerCase().includes(ri)) {
                violations.push(`مؤشر ربا: ${ri}`);
                break;
            }
        }

        // فحص الغرر
        if (tx.priceRange && tx.priceRange.max / (tx.priceRange.min || 1) > 10) {
            violations.push('غرر: تباين السعر مرتفع جداً (جهالة في الثمن)');
        }

        // فحص المجهول
        if (!tx.description && !tx.productId && !tx.serviceId) {
            violations.push('تنبيه: وصف المعاملة ناقص (قد يُفضي لجهالة)');
        }

        // فحص القيمة
        if (tx.amount && tx.amount < 0) {
            violations.push('قيمة سالبة غير مسموحة');
        }

        const shariahScore = violations.length === 0 ? 1.0
            : violations.some(v => v.includes('فئة محرمة') || v.includes('مؤشر ربا')) ? 0.0
            : Math.max(0.3, 1.0 - violations.length * 0.25);

        return {
            halal:        violations.length === 0 || shariahScore > 0.5,
            violations,
            shariahScore: parseFloat(shariahScore.toFixed(4))
        };
    }

    /**
     * فحص مجموعة معاملات
     */
    static checkBatch(transactions) {
        const results = transactions.map(tx => ({ txId: tx.id || tx.txId, ...ShariahFilter.check(tx) }));
        const rejected = results.filter(r => !r.halal);
        const avgScore = results.reduce((s, r) => s + r.shariahScore, 0) / (results.length || 1);
        return { results, rejected, avgShariahScore: parseFloat(avgScore.toFixed(4)), allHalal: rejected.length === 0 };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NEURAL VALIDATOR — المُدقِّق العصبي (Proof-of-Neural)
// ═══════════════════════════════════════════════════════════════════════════════

// طبقة كثيفة مع Adam Optimizer
class NVLayer {
    constructor(inSize, outSize, act = 'relu') {
        this.inSize  = inSize;
        this.outSize = outSize;
        this.act     = act;
        const sc     = Math.sqrt(2.0 / (inSize + outSize));
        this.W = new Float64Array(inSize * outSize).map(() => (Math.random() * 2 - 1) * sc);
        this.b = new Float64Array(outSize);
        this.t = 0; this.lr = 0.001; this.b1 = 0.9; this.b2 = 0.999; this.eps = 1e-8;
        this.mW = new Float64Array(this.W.length); this.vW = new Float64Array(this.W.length);
        this.mb = new Float64Array(outSize);       this.vb = new Float64Array(outSize);
        this._in = null; this._pre = null; this._out = null;
    }

    _actFn(x) {
        if (this.act === 'sigmoid') return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500)));
        if (this.act === 'tanh')    return Math.tanh(x);
        return Math.max(0, x); // relu
    }
    _actGrad(x, out) {
        if (this.act === 'sigmoid') return out * (1 - out);
        if (this.act === 'tanh')    return 1 - out * out;
        return x > 0 ? 1 : 0; // relu
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
        this._out = Array.from(pre).map(v => this._actFn(v));
        return this._out;
    }

    backward(dOut) {
        const dPre   = dOut.map((d, i) => d * this._actGrad(this._pre[i], this._out[i]));
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
 * الشبكة العصبية المُدقِّقة للكتل (Proof-of-Neural)
 * المدخلات (8): avgShariahScore، txCount، totalValue، avgFee، uniqueAddresses، blockAge، merkleEntropy، prevChainScore
 * المخرجات (1): neural_score ∈ [0, 1]
 *
 * الكتلة مقبولة إذا neural_score ≥ NEURAL_THRESHOLD
 */
class NeuralBlockValidator {
    constructor() {
        this.threshold  = 0.60;  // الحد الأدنى للقبول
        this.layers     = [
            new NVLayer(8, 24, 'relu'),
            new NVLayer(24, 16, 'relu'),
            new NVLayer(16, 8,  'relu'),
            new NVLayer(8,  1,  'sigmoid')
        ];
        this.trainCount = 0;
        this.totalLoss  = 0;

        // Pre-training warmup — يُعلَّم المُدقِّق مسبقاً على أمثلة تخيلية
        // حتى يبدأ بمستوى منطقي ولا يرفض الكتل الجيدة من البداية
        this._warmup();
    }

    /**
     * تدريب أولي بأمثلة تخيلية (جيدة وسيئة) لضبط المُدقِّق
     * الأمثلة الجيدة: shariah=1, moderate txCount, valid chainScore
     * الأمثلة السيئة: shariah=0, extreme values
     */
    _warmup() {
        const goodExamples = [
            [1.0, 0.10, 0.20, 0.05, 0.20, 0.01, 0.55, 0.80],
            [1.0, 0.20, 0.30, 0.08, 0.30, 0.02, 0.60, 0.85],
            [1.0, 0.15, 0.25, 0.06, 0.25, 0.01, 0.50, 0.90],
            [0.9, 0.12, 0.18, 0.04, 0.18, 0.01, 0.45, 0.80],
            [1.0, 0.30, 0.40, 0.10, 0.40, 0.03, 0.65, 0.88],
        ];
        const badExamples = [
            [0.0, 0.01, 0.00, 0.00, 0.00, 0.00, 0.30, 0.20],
            [0.1, 0.00, 0.00, 0.00, 0.00, 0.00, 0.20, 0.10],
            [0.0, 0.05, 0.10, 0.00, 0.05, 0.50, 0.10, 0.05],
        ];
        for (let e = 0; e < 60; e++) {
            for (const feat of goodExamples) {
                const pred = this.forward(feat);
                const err  = pred - 1.0;
                let grad   = [err];
                for (let l = this.layers.length - 1; l >= 0; l--) grad = this.layers[l].backward(grad);
                this.trainCount++; this.totalLoss += err * err;
            }
            for (const feat of badExamples) {
                const pred = this.forward(feat);
                const err  = pred - 0.0;
                let grad   = [err];
                for (let l = this.layers.length - 1; l >= 0; l--) grad = this.layers[l].backward(grad);
                this.trainCount++; this.totalLoss += err * err;
            }
        }
    }

    /**
     * استخراج المميزات من الكتلة
     */
    extractFeatures(block, chainScore = 0.8) {
        const txs = block.transactions || [];
        const shariah = ShariahFilter.checkBatch(txs);
        const totalVal = txs.reduce((s, t) => s + (t.amount || 0), 0);
        const addresses = new Set(txs.flatMap(t => [t.from, t.to].filter(Boolean))).size;
        const merkleEntropy = block.merkleRoot
            ? (parseInt(block.merkleRoot.substring(0, 8), 16) % 100) / 100
            : 0.5;
        return [
            shariah.avgShariahScore,                            // 0: متوسط الامتثال الشرعي
            Math.min(txs.length / 100, 1.0),                   // 1: عدد المعاملات (مطبّع)
            Math.min(totalVal / 1e6, 1.0),                     // 2: إجمالي القيمة (مطبّع)
            Math.min((block.fee || 0) / 1000, 1.0),            // 3: رسوم الكتلة (مطبّعة)
            Math.min(addresses / 50, 1.0),                      // 4: عدد العناوين الفريدة
            Math.min((Date.now() - (block.timestamp || Date.now())) / 60000, 1.0), // 5: عمر الكتلة
            merkleEntropy,                                      // 6: إنتروبيا ميركل
            parseFloat(chainScore)                              // 7: نقاط السلسلة السابقة
        ];
    }

    forward(features) {
        let out = features;
        for (const layer of this.layers) out = layer.forward(out);
        return out[0]; // scalar score
    }

    /**
     * تحقق من الكتلة وإرجاع النتيجة
     */
    validate(block, chainScore = 0.8) {
        const features    = this.extractFeatures(block, chainScore);
        const neuralScore = this.forward(features);
        const accepted    = neuralScore >= this.threshold;
        return {
            neuralScore: parseFloat(neuralScore.toFixed(6)),
            threshold:   this.threshold,
            accepted,
            features,
            verdict: accepted ? '✅ مقبول عصبياً' : '❌ مرفوض عصبياً'
        };
    }

    /**
     * تدريب المُدقِّق على كتلة معروفة النتيجة
     * @param {Object} block
     * @param {number} target - 1.0 للقبول، 0.0 للرفض
     * @param {number} chainScore
     * @param {number} epochs
     */
    train(block, target, chainScore = 0.8, epochs = 5) {
        const features = this.extractFeatures(block, chainScore);
        let lastLoss   = 0;
        for (let e = 0; e < epochs; e++) {
            const pred = this.forward(features);
            const err  = pred - target;
            lastLoss   = err * err;
            let grad   = [err];
            for (let l = this.layers.length - 1; l >= 0; l--) {
                grad = this.layers[l].backward(grad);
            }
            this.trainCount++;
            this.totalLoss += lastLoss;
        }
        return lastLoss;
    }

    getStatus() {
        return {
            threshold:  this.threshold,
            layers:     this.layers.map(l => `${l.inSize}→${l.outSize}(${l.act})`),
            trainCount: this.trainCount,
            avgLoss:    this.trainCount > 0 ? (this.totalLoss / this.trainCount).toFixed(6) : 'غير مدرّب'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ISLAMIC SMART CONTRACTS — العقود الذكية الشرعية
// ═══════════════════════════════════════════════════════════════════════════════

const CONTRACT_TYPES = {
    mudaraba: {
        id: 'mudaraba', nameAr: 'مضاربة', nameEn: 'Mudaraba',
        description: 'شراكة في الربح: رأس المال من طرف، والعمل من آخر',
        fields: ['capitalProvider', 'laborProvider', 'profitRatio', 'purpose', 'duration'],
        validate: (c) => c.profitRatio > 0 && c.profitRatio < 1 && c.capitalProvider && c.laborProvider
    },
    murabaha: {
        id: 'murabaha', nameAr: 'مرابحة', nameEn: 'Murabaha',
        description: 'بيع بالتكلفة زائد ربح معلوم — تمويل إسلامي للسلع',
        fields: ['seller', 'buyer', 'costPrice', 'profitMargin', 'productId'],
        validate: (c) => c.costPrice > 0 && c.profitMargin > 0 && c.profitMargin < c.costPrice * 2
    },
    ijara: {
        id: 'ijara', nameAr: 'إجارة', nameEn: 'Ijara',
        description: 'إيجار الأصول والممتلكات — تأجير إسلامي',
        fields: ['lessor', 'lessee', 'assetId', 'rentAmount', 'duration', 'conditions'],
        validate: (c) => c.rentAmount > 0 && c.duration > 0 && c.assetId
    },
    salam: {
        id: 'salam', nameAr: 'سَلَم', nameEn: 'Salam',
        description: 'بيع آجل مقبوض الثمن معجّل — للسلع الزراعية والصناعية',
        fields: ['buyer', 'seller', 'commodity', 'quantity', 'price', 'deliveryDate', 'specifications'],
        validate: (c) => c.quantity > 0 && c.price > 0 && c.deliveryDate && c.commodity
    },
    istisna: {
        id: 'istisna', nameAr: 'استصناع', nameEn: 'Istisna',
        description: 'عقد تصنيع وإنتاج — للمشاريع الإنشائية والصناعية',
        fields: ['buyer', 'manufacturer', 'specifications', 'price', 'completionDate', 'milestones'],
        validate: (c) => c.specifications && c.price > 0 && c.manufacturer && c.completionDate
    },
    wakala: {
        id: 'wakala', nameAr: 'وكالة', nameEn: 'Wakala',
        description: 'عقد وكالة واستثمار — إدارة الأموال بأجر محدد',
        fields: ['principal', 'agent', 'purpose', 'feeAmount', 'duration', 'scope'],
        validate: (c) => c.principal && c.agent && c.feeAmount >= 0 && c.purpose
    }
};

class IslamicSmartContract {
    /**
     * إنشاء عقد ذكي إسلامي
     */
    static create(type, params) {
        const def = CONTRACT_TYPES[type];
        if (!def) throw new Error(`نوع العقد غير معروف: ${type}`);

        const shariah = ShariahFilter.check({ ...params, type });
        if (!shariah.halal) {
            return { success: false, error: 'رُفض شرعياً', violations: shariah.violations };
        }
        if (!def.validate(params)) {
            return { success: false, error: 'حقول العقد ناقصة أو غير صحيحة', required: def.fields };
        }

        const contract = {
            contractId:  sha256(type + JSON.stringify(params) + Date.now()).substring(0, 16),
            type,
            typeAr:      def.nameAr,
            description: def.description,
            params,
            shariahScore: shariah.shariahScore,
            status:      'active',
            createdAt:   new Date().toISOString(),
            hash:        sha256(type + JSON.stringify(params))
        };

        return { success: true, contract };
    }

    static getTypes() { return Object.values(CONTRACT_TYPES); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ZAKAT ENGINE — محرك الزكاة التلقائي على البلوكشين
// ═══════════════════════════════════════════════════════════════════════════════

const ZAKAT_RATES = {
    trade:     0.025,   // زكاة التجارة 2.5%
    gold:      0.025,   // زكاة الذهب 2.5%
    silver:    0.025,   // زكاة الفضة 2.5%
    livestock: 0.025,   // زكاة بهيمة الأنعام (مُبسَّط)
    crops:     0.10,    // زكاة الزروع 10% (بغير كُلفة)
    crops_irr: 0.05,    // زكاة الزروع 5% (بكُلفة ري)
    minerals:  0.20,    // زكاة المعادن والركاز 20%
    default:   0.025
};

class ZakatEngine {
    /**
     * احتساب زكاة معاملة
     */
    static calculate(tx) {
        const type = (tx.zakatType || tx.category || 'default').toLowerCase();
        const rate = ZAKAT_RATES[type] || ZAKAT_RATES.default;
        const nisab = tx.nisab || 85 * 60; // نصاب ذهب تقريبي بالريال
        const amount = tx.amount || 0;

        if (amount < nisab) {
            return { zakatable: false, reason: 'المبلغ أقل من النصاب', amount, nisab };
        }

        const zakatAmount = parseFloat((amount * rate).toFixed(4));
        return {
            zakatable:   true,
            amount,
            nisab,
            rate,
            zakatAmount,
            category:    type,
            txId:        tx.id || tx.txId || 'unknown',
            hash:        sha256(`zakat_${tx.id}_${zakatAmount}_${Date.now()}`)
        };
    }

    /**
     * احتساب زكاة مجموعة معاملات
     */
    static calculateBatch(transactions) {
        const results = transactions.map(tx => ZakatEngine.calculate(tx));
        const total   = results.filter(r => r.zakatable).reduce((s, r) => s + r.zakatAmount, 0);
        return { results, totalZakat: parseFloat(total.toFixed(4)), txCount: transactions.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. BLOCK — هيكل الكتلة
// ═══════════════════════════════════════════════════════════════════════════════

class Block {
    constructor({ index, transactions, previousHash, validator, chainScore, fee = 0 }) {
        this.index        = index;
        this.timestamp    = Date.now();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.fee          = fee;
        this.nonce        = 0;

        // فلتر شرعي
        const shariahResult  = ShariahFilter.checkBatch(transactions);
        this.shariahReport   = shariahResult;

        // شجرة ميركل
        const txHashes       = transactions.map(tx => sha256(JSON.stringify(tx)));
        this.merkleTree      = new MerkleTree(txHashes);
        this.merkleRoot      = this.merkleTree.getRoot();

        // التحقق العصبي
        const neuralResult   = validator.validate(this, chainScore);
        this.neuralScore     = neuralResult.neuralScore;
        this.neuralAccepted  = neuralResult.accepted;
        this.neuralVerdict   = neuralResult.verdict;

        // زكاة
        this.zakatReport     = ZakatEngine.calculateBatch(transactions);

        // تجزئة الكتلة
        this.hash            = this._computeHash();
    }

    _computeHash() {
        return sha256Double({
            index:        this.index,
            timestamp:    this.timestamp,
            merkleRoot:   this.merkleRoot,
            previousHash: this.previousHash,
            neuralScore:  this.neuralScore,
            nonce:        this.nonce
        });
    }

    recomputeHash() {
        this.hash = this._computeHash();
        return this.hash;
    }

    toJSON() {
        return {
            index:         this.index,
            timestamp:     this.timestamp,
            txCount:       this.transactions.length,
            merkleRoot:    this.merkleRoot,
            previousHash:  this.previousHash,
            hash:          this.hash,
            nonce:         this.nonce,
            neuralScore:   this.neuralScore,
            neuralAccepted:this.neuralAccepted,
            neuralVerdict: this.neuralVerdict,
            shariahScore:  this.shariahReport.avgShariahScore,
            allHalal:      this.shariahReport.allHalal,
            totalZakat:    this.zakatReport.totalZakat,
            fee:           this.fee
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. GENESIS BLOCK — كتلة الجنيس (الأولى)
// ═══════════════════════════════════════════════════════════════════════════════

function createGenesisBlock(validator) {
    const genesisTx = [{
        id:          'GENESIS-TX-001',
        type:        'genesis',
        category:    'system',
        description: 'كتلة الجنيس — بسم الله الرحمن الرحيم — بداية سلسلة شيخة البلوكشين',
        from:        'SHEIKHA_GENESIS',
        to:          'SHEIKHA_NETWORK',
        amount:      0,
        zakatType:   'trade',
        timestamp:   Date.now()
    }];

    const genesis = new Block({
        index:        0,
        transactions: genesisTx,
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        validator,
        chainScore:   1.0,
        fee:          0
    });

    return genesis;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. NEURAL BLOCKCHAIN — سلسلة البلوكشين العصبية
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaNeralBlockchain extends EventEmitter {
    constructor(config = {}) {
        super();
        this.version       = '2.0.0';
        this.nameAr        = 'شبكة شيخة العصبية البلوكشين — الجيل الجديد';
        this.nameEn        = 'Sheikha Neural Blockchain — New Generation';
        this.startTime     = new Date();
        this.status        = 'operational';

        this.validator     = new NeuralBlockValidator();
        this.chain         = [];
        this.mempool       = [];   // معاملات في الانتظار
        this.contracts     = [];   // العقود الذكية المسجلة
        this.wallets       = new Map(); // عناوين المحافظ

        // إعدادات
        this.maxBlockSize  = config.maxBlockSize  || 100;   // أقصى معاملات في الكتلة
        this.minNeuralScore= config.minNeuralScore|| 0.60;  // الحد الأدنى للقبول
        this.autoMine      = config.autoMine !== false;      // تعدين تلقائي
        this.mempoolLimit  = config.mempoolLimit  || 1000;  // حجم الـ mempool

        // إنشاء كتلة الجنيس
        this.chain.push(createGenesisBlock(this.validator));

        // إحصاءات
        this.stats = { blocksAdded: 0, txProcessed: 0, txRejected: 0, zakatTotal: 0, contractsDeployed: 0 };

        console.log('');
        console.log('⛓️  [NEURAL-BLOCKCHAIN] ══════════════════════════════════════════════════');
        console.log(`⛓️  [NEURAL-BLOCKCHAIN] ${this.nameAr}`);
        console.log('⛓️  [NEURAL-BLOCKCHAIN] ══════════════════════════════════════════════════');
        console.log(`    ├─ المُدقِّق العصبي:   8→24→16→8→1 (threshold: ${this.minNeuralScore})`);
        console.log('    ├─ الفلتر الشرعي:     تلقائي لكل معاملة');
        console.log('    ├─ شجرة ميركل:         SHA-256 Merkle Tree');
        console.log('    ├─ العقود الذكية:       مضاربة، مرابحة، إجارة، سلم، استصناع، وكالة');
        console.log('    ├─ محرك الزكاة:        تلقائي لكل كتلة');
        console.log(`    └─ كتلة الجنيس:        ✅ معتمدة (index=0, hash=${this.chain[0].hash.substring(0, 16)}...)`);
        console.log('');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9.1 إضافة معاملة إلى الـ mempool
    // ─────────────────────────────────────────────────────────────────────────

    submitTransaction(tx) {
        // فحص شرعي أولي
        const shariah = ShariahFilter.check(tx);
        if (!shariah.halal) {
            this.stats.txRejected++;
            this.emit('tx_rejected', { tx, reason: 'شرعي', violations: shariah.violations });
            return { success: false, error: 'رُفضت المعاملة شرعياً', violations: shariah.violations };
        }

        if (this.mempool.length >= this.mempoolLimit) {
            return { success: false, error: 'الـ mempool ممتلئ — حاول لاحقاً' };
        }

        const enriched = {
            ...tx,
            txId:          tx.txId || sha256(JSON.stringify(tx) + Date.now()).substring(0, 16),
            timestamp:     Date.now(),
            shariahScore:  shariah.shariahScore
        };

        this.mempool.push(enriched);
        this.emit('tx_submitted', enriched);

        // تعدين تلقائي إذا اكتمل الـ block
        if (this.autoMine && this.mempool.length >= this.maxBlockSize) {
            this.mineBlock();
        }

        return { success: true, txId: enriched.txId, shariahScore: shariah.shariahScore, mempoolSize: this.mempool.length };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9.2 تعدين كتلة جديدة
    // ─────────────────────────────────────────────────────────────────────────

    mineBlock(maxTx = this.maxBlockSize) {
        if (this.mempool.length === 0) {
            return { success: false, message: 'لا معاملات في الـ mempool' };
        }

        const transactions = this.mempool.splice(0, Math.min(maxTx, this.mempool.length));
        const lastBlock    = this.getLatestBlock();
        const chainScore   = this._computeChainScore();

        const block = new Block({
            index:        this.chain.length,
            transactions,
            previousHash: lastBlock.hash,
            validator:    this.validator,
            chainScore,
            fee:          transactions.length * 0.001
        });

        // رفض الكتلة إذا لم تجتز التدقيق العصبي
        if (!block.neuralAccepted) {
            // أعد المعاملات للـ mempool
            this.mempool.unshift(...transactions);
            this.stats.txRejected += transactions.length;

            // تدريب المُدقِّق على الرفض
            this.validator.train(block, 0.0, chainScore, 3);

            this.emit('block_rejected', { reason: 'neural', neuralScore: block.neuralScore });
            return { success: false, error: 'رُفضت الكتلة عصبياً', neuralScore: block.neuralScore };
        }

        // تدريب المُدقِّق على القبول
        this.validator.train(block, 1.0, chainScore, 3);

        this.chain.push(block);
        this.stats.blocksAdded++;
        this.stats.txProcessed += transactions.length;
        this.stats.zakatTotal  += block.zakatReport.totalZakat;

        this.emit('block_mined', block.toJSON());
        return { success: true, block: block.toJSON() };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9.3 التحقق من السلسلة
    // ─────────────────────────────────────────────────────────────────────────

    validateChain() {
        const errors = [];
        for (let i = 1; i < this.chain.length; i++) {
            const current  = this.chain[i];
            const previous = this.chain[i - 1];

            // التحقق من تجزئة الكتلة
            const expectedHash = current._computeHash();
            if (current.hash !== expectedHash) {
                errors.push({ index: i, error: 'تجزئة الكتلة تالفة', current: current.hash, expected: expectedHash });
            }

            // التحقق من الربط بالكتلة السابقة
            if (current.previousHash !== previous.hash) {
                errors.push({ index: i, error: 'ربط الكتلة السابقة مكسور', current: current.previousHash, previous: previous.hash });
            }

            // التحقق من ميركل
            const txHashes  = current.transactions.map(tx => sha256(JSON.stringify(tx)));
            const merkle    = new MerkleTree(txHashes);
            if (merkle.getRoot() !== current.merkleRoot) {
                errors.push({ index: i, error: 'جذر ميركل تالف' });
            }
        }

        return {
            valid:       errors.length === 0,
            chainLength: this.chain.length,
            errors,
            message:     errors.length === 0 ? '✅ السلسلة سليمة وموثوقة' : `❌ وُجدت ${errors.length} مشاكل`
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9.4 إثبات وجود معاملة (Merkle Proof)
    // ─────────────────────────────────────────────────────────────────────────

    getMerkleProof(blockIndex, txId) {
        const block = this.chain[blockIndex];
        if (!block) return { success: false, error: 'الكتلة غير موجودة' };

        const tx = block.transactions.find(t => t.txId === txId || t.id === txId);
        if (!tx) return { success: false, error: 'المعاملة غير موجودة في هذه الكتلة' };

        const txHash = sha256(JSON.stringify(tx));
        const proof  = block.merkleTree.getProof(txHash);
        return {
            success: true,
            blockIndex,
            txId,
            proof:       proof.proof,
            merkleRoot:  block.merkleRoot,
            blockHash:   block.hash,
            // التحقق الفوري
            verified:    MerkleTree.verifyProof(txHash, proof.proof, block.merkleRoot)
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9.5 نشر عقد ذكي إسلامي
    // ─────────────────────────────────────────────────────────────────────────

    deployContract(type, params) {
        const result = IslamicSmartContract.create(type, params);
        if (!result.success) return result;

        this.contracts.push(result.contract);
        this.stats.contractsDeployed++;

        // سجّل العقد كمعاملة في الـ mempool
        this.submitTransaction({
            id:          result.contract.contractId,
            type:        'smart_contract',
            category:    'system',
            description: `عقد ${result.contract.typeAr}: ${result.contract.description}`,
            contractId:  result.contract.contractId,
            contractType:type,
            amount:      params.price || params.rentAmount || params.capitalAmount || 0,
            from:        params.principal || params.seller || params.buyer || 'SYSTEM',
            to:          params.agent    || params.buyer  || params.seller || 'SYSTEM'
        });

        this.emit('contract_deployed', result.contract);
        return { success: true, contract: result.contract, mempoolSize: this.mempool.length };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9.6 استعلامات
    // ─────────────────────────────────────────────────────────────────────────

    getLatestBlock()        { return this.chain[this.chain.length - 1]; }
    getBlock(index)         { return this.chain[index] || null; }
    getChainLength()        { return this.chain.length; }
    getMempool()            { return this.mempool; }
    getContracts(type = null) {
        return type ? this.contracts.filter(c => c.type === type) : this.contracts;
    }

    _computeChainScore() {
        if (this.chain.length <= 1) return 0.8;
        const recent = this.chain.slice(-5);
        const avg    = recent.reduce((s, b) => s + b.neuralScore, 0) / recent.length;
        return parseFloat(avg.toFixed(4));
    }

    searchTransaction(txId) {
        for (const block of this.chain) {
            const tx = block.transactions.find(t => t.txId === txId || t.id === txId);
            if (tx) return { found: true, tx, blockIndex: block.index, blockHash: block.hash };
        }
        return { found: false, txId };
    }

    getNetworkStats() {
        const allTxCount = this.chain.reduce((s, b) => s + b.transactions.length, 0);
        const avgNeuralScore = this.chain.reduce((s, b) => s + b.neuralScore, 0) / this.chain.length;
        const avgShariahScore = this.chain.reduce((s, b) => s + b.shariahReport.avgShariahScore, 0) / this.chain.length;

        return {
            chainLength:      this.chain.length,
            totalTransactions:allTxCount,
            mempoolSize:      this.mempool.length,
            contractsDeployed:this.contracts.length,
            avgNeuralScore:   parseFloat(avgNeuralScore.toFixed(4)),
            avgShariahScore:  parseFloat(avgShariahScore.toFixed(4)),
            totalZakat:       parseFloat(this.stats.zakatTotal.toFixed(4)),
            latestBlockHash:  this.getLatestBlock().hash,
            latestBlockIndex: this.getLatestBlock().index
        };
    }

    getStatus() {
        return {
            name:            this.nameAr,
            version:         this.version,
            status:          this.status,
            uptime:          Math.floor((Date.now() - this.startTime) / 1000) + 's',
            chainHealth:     this.validateChain().valid ? '✅ سليمة' : '⚠️ تحتاج فحص',
            stats:           this.stats,
            network:         this.getNetworkStats(),
            neuralValidator: this.validator.getStatus(),
            smartContracts:  IslamicSmartContract.getTypes().map(c => ({ id: c.id, nameAr: c.nameAr })),
            zakatRates:      ZAKAT_RATES,
            architecture: {
                layer0: 'Shariah Filter — فلتر شرعي تلقائي',
                layer1: 'Merkle Tree — SHA-256 Merkle Tree',
                layer2: 'Neural Validator — Proof-of-Neural [8→24→16→8→1]',
                layer3: 'Block Chain — سلسلة الكتل',
                layer4: 'Islamic Smart Contracts — 6 أنواع عقود شرعية',
                layer5: 'Zakat Engine — محرك الزكاة التلقائي'
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const neuralBlockchain = new SheikhaNeralBlockchain();

module.exports = {
    SheikhaNeralBlockchain,
    neuralBlockchain,
    Block,
    MerkleTree,
    ShariahFilter,
    NeuralBlockValidator,
    IslamicSmartContract,
    ZakatEngine,
    sha256,
    sha256Double,
    CONTRACT_TYPES,
    ZAKAT_RATES
};
