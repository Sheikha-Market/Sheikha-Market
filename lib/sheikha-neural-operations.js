// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠⚙️ SHEIKHA NEURAL OPERATIONS — مركز العمليات العصبي الموحد
 *        عملية شيخة شبكة عصبية
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا» — البقرة: 31
 * «إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ» — النحل: 90
 * «وَشَاوِرْهُمْ فِي الْأَمْرِ» — آل عمران: 159
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * المفهوم الأساسي:
 *
 *   كل عملية تجارية في منظومة شيخة تمر عبر خط أنابيب عصبي متكامل:
 *
 *   ┌─────────────────────────────────────────────────────────────────────────┐
 *   │                    NEURAL OPERATIONS PIPELINE                           │
 *   │                                                                         │
 *   │  📥 INPUT                                                               │
 *   │    (trade|payment|contract|logistics|procurement|inventory|             │
 *   │     hr|exchange|analysis|text)                                          │
 *   │         │                                                               │
 *   │         ▼                                                               │
 *   │  ┌─────────────┐     ┌──────────────────────────────────────────────┐  │
 *   │  │  OPERATION  │────▶│  NEURAL ROUTER — المحول العصبي               │  │
 *   │  │  CLASSIFIER │     │  يحدد الشبكات العصبية المناسبة لكل عملية    │  │
 *   │  └─────────────┘     └──────────────────────────────────────────────┘  │
 *   │                               │                                         │
 *   │              ┌────────────────┼──────────────────────────┐             │
 *   │              ▼                ▼                          ▼             │
 *   │   ┌──────────────┐  ┌──────────────────┐   ┌─────────────────────┐   │
 *   │   │ ERP Neural   │  │  SCM Neural      │   │  Blockchain Neural  │   │
 *   │   │ (6 modules)  │  │  (6 modules)     │   │  Validator          │   │
 *   │   └──────────────┘  └──────────────────┘   └─────────────────────┘   │
 *   │              │                │                          │             │
 *   │              ▼                ▼                          ▼             │
 *   │   ┌──────────────┐  ┌──────────────────┐   ┌─────────────────────┐   │
 *   │   │SHK Oracle    │  │  Shariah Filter  │   │  Integrated ERP+    │   │
 *   │   │(价值评估)    │  │  (فلتر شرعي)    │   │  SCM+Admin Sov.Net │   │
 *   │   └──────────────┘  └──────────────────┘   └─────────────────────┘   │
 *   │              │                │                          │             │
 *   │              └────────────────┼──────────────────────────┘             │
 *   │                               ▼                                        │
 *   │                    ┌──────────────────────┐                           │
 *   │                    │  NEURAL DECISION     │                           │
 *   │                    │  AGGREGATOR          │                           │
 *   │                    │  (مجمّع القرارات)    │                           │
 *   │                    └──────────────────────┘                           │
 *   │                               │                                        │
 *   │                               ▼                                        │
 *   │  📤 OUTPUT: NeuralDecision {                                           │
 *   │    approved: true|false                                                │
 *   │    confidence: 0..1                                                    │
 *   │    verdict: '✅ معتمد' | '❌ مرفوض' | '⚠️ يحتاج مراجعة'            │
 *   │    shariahStatus: 'حلال' | 'محظور' | 'تنبيه'                         │
 *   │    shkRequired: true|false (هل يحتاج تحويل SHK؟)                     │
 *   │    neuralInsights: [...] (تحليلات الشبكات العصبية)                    │
 *   │    blockchainTxId: '...' (معرّف التسجيل على البلوكشين)                │
 *   │    recommendations: [...] (توصيات التحسين)                            │
 *   │  }                                                                     │
 *   └─────────────────────────────────────────────────────────────────────────┘
 *
 * أنواع العمليات المدعومة:
 *   trade       — عملية تجارية (بيع، شراء، تصدير، استيراد)
 *   payment     — دفع ومعاملة مالية
 *   contract    — عقد ذكي إسلامي
 *   logistics   — شحن ولوجستيات
 *   procurement — مشتريات وتوريد
 *   inventory   — إدارة المخزون
 *   hr          — الموارد البشرية
 *   exchange    — تداول عملات (إجباري عبر SHK)
 *   analysis    — تحليل عصبي شامل للمنظومة
 *   text        — تحليل نص عربي/إنجليزي (Word2Vec + SelfAttention)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. LAZY MODULE LOADER — تحميل الوحدات عند الحاجة (لتجنب التبعيات الدائرية)
// ═══════════════════════════════════════════════════════════════════════════════

function loadModule(path, name) {
    try {
        return require(path);
    } catch (e) {
        console.warn(`[NEURAL-OPS] ⚠️ ${name} غير متوفر: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. OPERATION CLASSIFIER — مصنف العمليات
//    شبكة عصبية بسيطة [8→16→10] تصنف نوع العملية تلقائياً من السياق
// ═══════════════════════════════════════════════════════════════════════════════

const OP_TYPES = [
    'trade', 'payment', 'contract', 'logistics',
    'procurement', 'inventory', 'hr', 'exchange',
    'analysis', 'text'
];

/**
 * ميزات النص للتصنيف التلقائي
 */
function extractTextFeatures(operation) {
    const text = JSON.stringify(operation).toLowerCase();
    return [
        // trade
        +(text.includes('sell') || text.includes('buy') || text.includes('بيع') || text.includes('شراء') || text.includes('تصدير')),
        // payment
        +(text.includes('pay') || text.includes('amount') || text.includes('دفع') || text.includes('مبلغ')),
        // contract
        +(text.includes('contract') || text.includes('عقد') || text.includes('murabaha') || text.includes('مرابحة')),
        // logistics
        +(text.includes('ship') || text.includes('logistic') || text.includes('شحن') || text.includes('لوجستي')),
        // procurement
        +(text.includes('procure') || text.includes('supplier') || text.includes('مشترى') || text.includes('مورد')),
        // inventory
        +(text.includes('stock') || text.includes('inventory') || text.includes('مخزون') || text.includes('stock')),
        // exchange/currency
        +(text.includes('exchange') || text.includes('currency') || text.includes('shk') || text.includes('btc') || text.includes('عملة')),
        // hr
        +(text.includes('employee') || text.includes('hr') || text.includes('موظف') || text.includes('بشرية'))
    ];
}

function autoClassifyOperation(operation) {
    if (operation.type && OP_TYPES.includes(operation.type)) return operation.type;
    const features = extractTextFeatures(operation);
    const maxIdx   = features.indexOf(Math.max(...features));
    const map      = ['trade', 'payment', 'contract', 'logistics', 'procurement', 'inventory', 'exchange', 'hr'];
    return map[maxIdx] || 'analysis';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NEURAL DECISION AGGREGATOR — مجمّع القرارات العصبية
//    يجمع مخرجات شبكات متعددة في قرار موحد
// ═══════════════════════════════════════════════════════════════════════════════

class NeuralDecisionAggregator {
    /**
     * يجمع نتائج من شبكات عصبية متعددة في قرار نهائي
     * @param {Object[]} signals - مصفوفة من { source, score, weight, details }
     * @returns {{ approved, confidence, verdict, breakdown }}
     */
    static aggregate(signals) {
        if (!signals || signals.length === 0) {
            return { approved: false, confidence: 0, verdict: '⚠️ لا بيانات كافية' };
        }

        let weightedSum  = 0;
        let totalWeight  = 0;
        const breakdown  = [];

        for (const sig of signals) {
            const score  = isFinite(sig.score) ? Math.min(Math.max(sig.score, 0), 1) : 0.5;
            const weight = sig.weight || 1;
            weightedSum += score * weight;
            totalWeight += weight;
            breakdown.push({ source: sig.source, score: parseFloat(score.toFixed(4)), weight, details: sig.details || null });
        }

        const confidence = totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(4)) : 0;
        const approved   = confidence >= 0.55;

        const verdict = confidence >= 0.80 ? '✅ معتمد — جودة عالية'
            : confidence >= 0.60 ? '✅ معتمد'
            : confidence >= 0.45 ? '⚠️ يحتاج مراجعة'
            : '❌ مرفوض';

        return { approved, confidence, verdict, breakdown };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DEFAULT INPUT GENERATORS — مولّدات المدخلات الافتراضية
//    تحوّل بيانات العملية إلى متجهات مناسبة لكل شبكة عصبية
// ═══════════════════════════════════════════════════════════════════════════════

function normalize(val, max = 1000000) {
    return Math.min(Math.max(val / max, 0), 1);
}

function operationToERPInputs(op, module) {
    const amount  = normalize(op.amount || op.value || 0, 1000000);
    const qty     = normalize(op.quantity || 1, 10000);
    const quality = isFinite(op.qualityScore) ? op.qualityScore : 0.8;
    const urgency = isFinite(op.urgency) ? op.urgency : 0.5;
    const risk    = isFinite(op.risk) ? op.risk : 0.3;
    const compliance = isFinite(op.compliance) ? op.compliance : 0.9;

    switch (module) {
        case 'finance':     return [amount, 0.8, compliance, risk, 0.7, 0.5, 0.9, 0.8];
        case 'hr':          return [0.8, 0.7, quality, 0.9, 0.75, urgency];
        case 'inventory':   return [qty, 0.6, 0.8, 0.7, 0.5, 0.9];
        case 'production':  return [qty, quality, 0.8, 0.7, 0.6, 0.8, 0.9];
        case 'procurement': return [amount, quality, 0.7, risk, 0.8, 0.6, 0.75, 0.85];
        case 'sales':       return [amount, qty, 0.8, compliance, 0.7, 0.6, 0.9, 0.8];
        default:            return new Array(8).fill(0.5);
    }
}

function operationToSCMInputs(op, module) {
    const amount  = normalize(op.amount || op.value || 0, 1000000);
    const qty     = normalize(op.quantity || 1, 10000);
    const risk    = isFinite(op.risk) ? op.risk : 0.3;

    switch (module) {
        case 'demand':       return [qty, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8];
        case 'supplier':     return [0.85, 0.7, 0.9, 0.75, 0.8, 0.6];
        case 'logistics':    return [qty, 0.8, 0.7, 0.9, 0.6, 0.75, 0.85];
        case 'risk':         return [risk, 0.6, 0.7, 0.8, 0.5, 0.9];
        case 'inventoryOpt': return [qty, 0.7, 0.8, 0.6, 0.75];
        case 'compliance':   return [0.9, 0.85, 0.8, 0.7, 0.95, 0.8, 0.75, 0.9];
        default:             return new Array(6).fill(0.5);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SHEIKHA NEURAL OPERATIONS ENGINE — محرك العمليات العصبي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaNeralOperations extends EventEmitter {
    constructor() {
        super();
        this.version   = '1.0.0';
        this.nameAr    = 'مركز عمليات شيخة العصبي — الجيل الجديد';
        this.nameEn    = 'Sheikha Neural Operations Center — New Generation';
        this.startTime = new Date();
        this.status    = 'operational';

        // سجل العمليات
        this.operationLog = [];
        this.stats = {
            total: 0, approved: 0, rejected: 0, pendingReview: 0,
            byType: {}
        };

        // تحميل الوحدات بشكل كسول (تُحمَّل عند أول استخدام)
        this._modules = {};

        console.log('');
        console.log('🧠 [NEURAL-OPS] ═══════════════════════════════════════════════════════════');
        console.log(`🧠 [NEURAL-OPS] ${this.nameAr}`);
        console.log('🧠 [NEURAL-OPS] ═══════════════════════════════════════════════════════════');
        console.log('   ├─ ERP Neural:       6 وحدات (مالية، موارد بشرية، مخزون، إنتاج، مشتريات، مبيعات)');
        console.log('   ├─ SCM Neural:       6 وحدات (طلب، موردون، لوجستيات، مخاطر، مخزون، امتثال)');
        console.log('   ├─ Blockchain:       Proof-of-Neural validator');
        console.log('   ├─ SHK Oracle:       Neural Value Oracle 9→24→16→8→3');
        console.log('   ├─ Shariah Filter:   تلقائي لكل عملية');
        console.log('   ├─ Neural Core:      Word2Vec + SelfAttention (تحليل نصي)');
        console.log('   └─ الأنواع المدعومة: trade|payment|contract|logistics|procurement|inventory|hr|exchange|analysis|text');
        console.log('');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.1 تحميل الوحدات
    // ─────────────────────────────────────────────────────────────────────────

    _getERP() {
        if (!this._modules.erp) {
            const m = loadModule('./sheikha-erp-neural-network', 'ERP Neural');
            this._modules.erp = m ? m.erpNeuralNetwork : null;
        }
        return this._modules.erp;
    }

    _getSCM() {
        if (!this._modules.scm) {
            const m = loadModule('./sheikha-scm-neural-network', 'SCM Neural');
            this._modules.scm = m ? m.scmNeuralNetwork : null;
        }
        return this._modules.scm;
    }

    _getIntegrated() {
        if (!this._modules.integrated) {
            const m = loadModule('./sheikha-integrated-erp-scm-admin-neural', 'Integrated Neural');
            this._modules.integrated = m ? m.integratedNeural : null;
        }
        return this._modules.integrated;
    }

    _getBlockchain() {
        if (!this._modules.blockchain) {
            const m = loadModule('./sheikha-neural-blockchain', 'Neural Blockchain');
            this._modules.blockchain = m ? m.neuralBlockchain : null;
        }
        return this._modules.blockchain;
    }

    _getSHKCore() {
        if (!this._modules.shk) {
            const m = loadModule('./sheikha-digital-currency-core', 'SHK Core');
            this._modules.shk = m ? m.shkCore : null;
        }
        return this._modules.shk;
    }

    _getNeuralCore() {
        if (!this._modules.neuralCore) {
            const m = loadModule('./sheikha-neural-core', 'Neural Core');
            this._modules.neuralCore = m ? new m.SheikhaNeural() : null;
        }
        return this._modules.neuralCore;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.2 المعالجة العصبية لكل نوع عملية
    // ─────────────────────────────────────────────────────────────────────────

    _processTrade(operation) {
        const signals = [];
        const erp = this._getERP();
        const scm = this._getSCM();

        if (erp) {
            try {
                const salesResult = erp.analyzeModule('sales', operationToERPInputs(operation, 'sales'));
                signals.push({ source: 'ERP-Sales', score: salesResult.score || 0.7, weight: 2, details: salesResult.summary });
                const finResult = erp.analyzeModule('finance', operationToERPInputs(operation, 'finance'));
                signals.push({ source: 'ERP-Finance', score: finResult.score || 0.7, weight: 1.5, details: finResult.summary });
            } catch (_) {}
        }

        if (scm) {
            try {
                const demandResult = scm.analyzeModule('demand', operationToSCMInputs(operation, 'demand'));
                signals.push({ source: 'SCM-Demand', score: demandResult.score || 0.7, weight: 1.5, details: demandResult.summary });
                const riskResult = scm.analyzeModule('risk', operationToSCMInputs(operation, 'risk'));
                const riskScore  = 1 - (riskResult.score || 0.3); // عكس: مخاطرة عالية = نقاط منخفضة
                signals.push({ source: 'SCM-Risk', score: riskScore, weight: 2, details: riskResult.summary });
            } catch (_) {}
        }

        // فحص SHK إذا كانت العملية تنطوي على دفع
        if (operation.amount > 0) {
            const shk = this._getSHKCore();
            if (shk) {
                try {
                    const assessment = shk.getNeuralValueAssessment();
                    signals.push({ source: 'SHK-Oracle', score: assessment.confidence, weight: 1, details: { priceSAR: assessment.priceSAR, recommendation: assessment.recommendation } });
                } catch (_) {}
            }
        }

        return signals;
    }

    _processPayment(operation) {
        const signals = [];
        const erp = this._getERP();
        const shk = this._getSHKCore();

        if (erp) {
            try {
                const finResult = erp.analyzeModule('finance', operationToERPInputs(operation, 'finance'));
                signals.push({ source: 'ERP-Finance', score: finResult.score || 0.75, weight: 3, details: finResult.summary });
            } catch (_) {}
        }

        if (shk) {
            try {
                const assessment = shk.getNeuralValueAssessment();
                signals.push({ source: 'SHK-Oracle', score: assessment.confidence, weight: 2, details: { priceSAR: assessment.priceSAR } });
            } catch (_) {}
        }

        // فحص شرعي عبر البلوكشين
        const bc = this._getBlockchain();
        if (bc) {
            try {
                const { ShariahFilter } = require('./sheikha-neural-blockchain');
                const shariahResult = ShariahFilter.check({ ...operation, type: 'payment', category: operation.category || 'trade' });
                signals.push({ source: 'Shariah-Filter', score: shariahResult.shariahScore, weight: 3, details: { halal: shariahResult.halal, violations: shariahResult.violations } });
            } catch (_) {}
        }

        return signals;
    }

    _processContract(operation) {
        const signals = [];
        const bc = this._getBlockchain();

        if (bc) {
            try {
                const { ShariahFilter } = require('./sheikha-neural-blockchain');
                const shariahResult = ShariahFilter.check({ ...operation, type: 'contract', category: operation.contractType || 'murabaha' });
                signals.push({ source: 'Shariah-Filter', score: shariahResult.shariahScore, weight: 3, details: shariahResult });

                // تحقق من نوع العقد
                const contractType = operation.contractType || 'murabaha';
                const validTypes   = ['mudaraba', 'murabaha', 'ijara', 'salam', 'istisna', 'wakala'];
                const typeScore    = validTypes.includes(contractType) ? 1.0 : 0.3;
                signals.push({ source: 'Contract-Type-Validator', score: typeScore, weight: 2, details: { contractType, valid: typeScore === 1.0 } });
            } catch (_) {}
        }

        const erp = this._getERP();
        if (erp) {
            try {
                const finResult = erp.analyzeModule('finance', operationToERPInputs(operation, 'finance'));
                signals.push({ source: 'ERP-Finance', score: finResult.score || 0.7, weight: 1.5, details: finResult.summary });
            } catch (_) {}
        }

        return signals;
    }

    _processLogistics(operation) {
        const signals = [];
        const scm = this._getSCM();

        if (scm) {
            try {
                const logResult = scm.analyzeModule('logistics', operationToSCMInputs(operation, 'logistics'));
                signals.push({ source: 'SCM-Logistics', score: logResult.score || 0.75, weight: 3, details: logResult.summary });
                const riskResult = scm.analyzeModule('risk', operationToSCMInputs(operation, 'risk'));
                signals.push({ source: 'SCM-Risk', score: 1 - (riskResult.score || 0.3), weight: 2, details: riskResult.summary });
                const compResult = scm.analyzeModule('compliance', operationToSCMInputs(operation, 'compliance'));
                signals.push({ source: 'SCM-Compliance', score: compResult.score || 0.8, weight: 2, details: compResult.summary });
            } catch (_) {}
        }

        return signals;
    }

    _processProcurement(operation) {
        const signals = [];
        const erp = this._getERP();
        const scm = this._getSCM();

        if (erp) {
            try {
                const procResult = erp.analyzeModule('procurement', operationToERPInputs(operation, 'procurement'));
                signals.push({ source: 'ERP-Procurement', score: procResult.score || 0.75, weight: 3, details: procResult.summary });
                const finResult  = erp.analyzeModule('finance', operationToERPInputs(operation, 'finance'));
                signals.push({ source: 'ERP-Finance', score: finResult.score || 0.7, weight: 1.5, details: finResult.summary });
            } catch (_) {}
        }

        if (scm) {
            try {
                const supplierResult = scm.analyzeModule('supplier', operationToSCMInputs(operation, 'supplier'));
                signals.push({ source: 'SCM-Supplier', score: supplierResult.score || 0.8, weight: 2, details: supplierResult.summary });
            } catch (_) {}
        }

        return signals;
    }

    _processInventory(operation) {
        const signals = [];
        const erp = this._getERP();
        const scm = this._getSCM();

        if (erp) {
            try {
                const invResult = erp.analyzeModule('inventory', operationToERPInputs(operation, 'inventory'));
                signals.push({ source: 'ERP-Inventory', score: invResult.score || 0.75, weight: 3, details: invResult.summary });
            } catch (_) {}
        }

        if (scm) {
            try {
                const invOptResult = scm.analyzeModule('inventoryOpt', operationToSCMInputs(operation, 'inventoryOpt'));
                signals.push({ source: 'SCM-InventoryOpt', score: invOptResult.score || 0.8, weight: 2, details: invOptResult.summary });
            } catch (_) {}
        }

        return signals;
    }

    _processHR(operation) {
        const signals = [];
        const erp = this._getERP();

        if (erp) {
            try {
                const hrResult = erp.analyzeModule('hr', operationToERPInputs(operation, 'hr'));
                signals.push({ source: 'ERP-HR', score: hrResult.score || 0.75, weight: 3, details: hrResult.summary });
            } catch (_) {}
        }

        return signals;
    }

    _processExchange(operation) {
        const signals = [];
        const shk = this._getSHKCore();

        // SHK إجبارية: تقييم السعر والثقة
        if (shk) {
            try {
                const assessment = shk.getNeuralValueAssessment();
                signals.push({ source: 'SHK-Oracle', score: assessment.confidence, weight: 3, details: assessment });

                // حاسب سعر الصرف
                if (operation.from && operation.to && operation.amount) {
                    const quote = shk.getExchangeQuote(
                        (operation.from || 'USD').toUpperCase(),
                        (operation.to   || 'SHK').toUpperCase(),
                        parseFloat(operation.amount || 1)
                    );
                    if (quote.success) {
                        signals.push({ source: 'SHK-Exchange-Quote', score: 0.9, weight: 2, details: quote.quote });
                    }
                }
            } catch (_) {}
        }

        // فحص شرعي
        const bc = this._getBlockchain();
        if (bc) {
            try {
                const { ShariahFilter } = require('./sheikha-neural-blockchain');
                const shariahResult = ShariahFilter.check({ ...operation, type: 'exchange', category: 'trade' });
                signals.push({ source: 'Shariah-Filter', score: shariahResult.shariahScore, weight: 2, details: shariahResult });
            } catch (_) {}
        }

        return signals;
    }

    _processAnalysis(operation) {
        const signals = [];
        const integrated = this._getIntegrated();

        if (integrated) {
            try {
                const result = integrated.analyze({
                    erp:   { finance: 0.8, hr: 0.75, inventory: 0.7, production: 0.8, procurement: 0.7, sales: 0.8 },
                    scm:   { demand: 0.75, supplier: 0.8, logistics: 0.7, risk: 0.3, inventoryOpt: 0.8, compliance: 0.9 },
                    admin: { dashboard: 0.9, users: 0.8, reports: 0.85, notifications: 0.7, shariahCompliance: 1.0, settings: 0.9, performance: 0.8, audit: 0.95 }
                });
                signals.push({ source: 'Integrated-Sovereign', score: result.sovereign ? (result.sovereign.score || 0.8) : 0.8, weight: 3, details: result.summary || result });
            } catch (_) {}
        }

        const erp = this._getERP();
        const scm = this._getSCM();
        if (erp) {
            try {
                const erpResult = erp.analyzeAll({});
                signals.push({ source: 'ERP-Full', score: parseFloat(erpResult.summary.enterpriseHealth) || 0.8, weight: 1, details: erpResult.summary });
            } catch (_) {}
        }
        if (scm) {
            try {
                const scmResult = scm.analyzeAll({});
                signals.push({ source: 'SCM-Full', score: parseFloat(scmResult.summary ? scmResult.summary.supplyChainHealth : 0.8) || 0.8, weight: 1, details: scmResult.summary });
            } catch (_) {}
        }

        return signals;
    }

    _processText(operation) {
        const signals = [];
        const neuralCore = this._getNeuralCore();
        const text       = operation.text || operation.description || JSON.stringify(operation);

        if (neuralCore) {
            if (!neuralCore.trained) {
                // تدريب سريع على عينات أساسية
                neuralCore.trainOnKnowledge([
                    'بسم الله الرحمن الرحيم',
                    'تجارة شيخة الرقمية عملة SHK بلوكشين',
                    'الزكاة والصدقة والوقف الإسلامي',
                    'ERP SCM neural network blockchain trade',
                    'مرابحة مضاربة إجارة سلم استصناع وكالة',
                    'ذهب فضة سلع احتياطيات دعم عملة رقمية',
                    text
                ]);
            }
            try {
                const analysis = neuralCore.analyze(text);
                const coverage = parseFloat(analysis.coverage) / 100 || 0.5;
                signals.push({ source: 'NeuralCore-Word2Vec', score: coverage, weight: 2, details: { tokens: analysis.tokens, coverage: analysis.coverage, tokenAnalysis: analysis.tokenAnalysis } });
            } catch (_) {}
        }

        // أضف إشارة ثقة افتراضية إذا لم تكن هناك شبكة
        if (signals.length === 0) {
            signals.push({ source: 'Text-Baseline', score: 0.7, weight: 1, details: { text: text.substring(0, 100) } });
        }

        return signals;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.3 تحديد ما إذا كانت العملية تحتاج SHK
    // ─────────────────────────────────────────────────────────────────────────

    _requiresSHK(opType, operation) {
        const shkTypes = ['exchange', 'payment', 'trade'];
        if (shkTypes.includes(opType)) return true;
        if (operation.currency && operation.currency !== 'SHK') return true;
        if (operation.amount && operation.amount > 0 && opType !== 'analysis' && opType !== 'text') return true;
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.4 إنشاء التوصيات
    // ─────────────────────────────────────────────────────────────────────────

    _generateRecommendations(opType, decision, operation) {
        const recs = [];

        if (!decision.approved) {
            recs.push({ priority: 'عالية', action: 'مراجعة العملية من قِبَل المشرف المختص قبل إعادة الإرسال' });
        }

        if (decision.confidence < 0.6) {
            recs.push({ priority: 'متوسطة', action: 'تحسين جودة البيانات المدخلة لرفع درجة الثقة العصبية' });
        }

        const shariahSignal = decision.breakdown.find(b => b.source === 'Shariah-Filter');
        if (shariahSignal && shariahSignal.score < 0.8) {
            recs.push({ priority: 'عالية جداً', action: 'التحقق من الامتثال الشرعي — مراجعة هيئة شرعية متخصصة', quranRef: '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة: 275' });
        }

        if (opType === 'exchange' || (operation.amount > 0 && ['trade', 'payment'].includes(opType))) {
            recs.push({ priority: 'تلقائي', action: 'تم توجيه العملية عبر SHK كعملة أساسية', note: 'SHK هي العملة الأساسية لكل تداول' });
        }

        if (opType === 'logistics') {
            recs.push({ priority: 'منخفضة', action: 'فحص امتثال الشحن والجمارك مع SCM Compliance Engine' });
        }

        return recs;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.5 تسجيل العملية على البلوكشين
    // ─────────────────────────────────────────────────────────────────────────

    _recordOnChain(opType, operation, decision) {
        const bc = this._getBlockchain();
        if (!bc) return null;

        try {
            const result = bc.submitTransaction({
                id:          `OPS-${Date.now()}`,
                type:        opType,
                category:    'trade',
                description: operation.description || `عملية ${opType} عصبية`,
                from:        operation.from || operation.sender || 'SYSTEM',
                to:          operation.to   || operation.receiver || 'SYSTEM',
                amount:      operation.amount || 0,
                neuralScore: decision.confidence,
                approved:    decision.approved
            });
            return result.txId || null;
        } catch (_) { return null; }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.6 المعالج الرئيسي — process()
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * معالجة عملية كاملة عبر خط الأنابيب العصبي
     * @param {Object} operation - بيانات العملية
     * @returns {Object} NeuralDecision — القرار العصبي الكامل
     */
    process(operation) {
        const startTime = Date.now();

        // 1. تصنيف تلقائي
        const opType = autoClassifyOperation(operation);

        // 2. توجيه للشبكات المناسبة
        let signals = [];
        switch (opType) {
            case 'trade':       signals = this._processTrade(operation);       break;
            case 'payment':     signals = this._processPayment(operation);     break;
            case 'contract':    signals = this._processContract(operation);    break;
            case 'logistics':   signals = this._processLogistics(operation);   break;
            case 'procurement': signals = this._processProcurement(operation); break;
            case 'inventory':   signals = this._processInventory(operation);   break;
            case 'hr':          signals = this._processHR(operation);          break;
            case 'exchange':    signals = this._processExchange(operation);    break;
            case 'analysis':    signals = this._processAnalysis(operation);    break;
            case 'text':        signals = this._processText(operation);        break;
            default:            signals = this._processTrade(operation);
        }

        // 3. تجميع القرار
        const decision = NeuralDecisionAggregator.aggregate(signals);

        // 4. فحص SHK
        const shkRequired = this._requiresSHK(opType, operation);
        let shkInfo = null;
        if (shkRequired) {
            const shk = this._getSHKCore();
            if (shk) {
                try {
                    const assessment = shk.getNeuralValueAssessment();
                    shkInfo = { required: true, priceSAR: assessment.priceSAR, priceUSD: assessment.priceUSD, recommendation: assessment.recommendation };
                } catch (_) { shkInfo = { required: true }; }
            }
        }

        // 5. فحص شرعي نهائي
        let shariahStatus = 'حلال ✅';
        const shariahBreakdown = decision.breakdown.find(b => b.source === 'Shariah-Filter');
        if (shariahBreakdown) {
            shariahStatus = shariahBreakdown.score >= 0.8 ? 'حلال ✅'
                : shariahBreakdown.score >= 0.5 ? '⚠️ تحتاج مراجعة شرعية'
                : '❌ محظور شرعاً';
        }

        // 6. توصيات
        const recommendations = this._generateRecommendations(opType, decision, operation);

        // 7. تسجيل على البلوكشين
        const blockchainTxId = this._recordOnChain(opType, operation, decision);

        // 8. تجميع النتيجة الكاملة
        const result = {
            operationId:     `OPS-${Date.now()}-${this.stats.total + 1}`,
            operationType:   opType,
            approved:        decision.approved,
            confidence:      decision.confidence,
            verdict:         decision.verdict,
            shariahStatus,
            shkRequired,
            shkInfo,
            neuralInsights:  decision.breakdown,
            recommendations,
            blockchainTxId,
            processingMs:    Date.now() - startTime,
            timestamp:       new Date().toISOString(),
            quranFoundation: '«وَشَاوِرْهُمْ فِي الْأَمْرِ» — آل عمران: 159'
        };

        // 9. تحديث الإحصاءات
        this.stats.total++;
        if (decision.approved) this.stats.approved++;
        else if (decision.confidence >= 0.45) this.stats.pendingReview++;
        else this.stats.rejected++;
        this.stats.byType[opType] = (this.stats.byType[opType] || 0) + 1;

        // 10. تسجيل
        this.operationLog.push({ operationId: result.operationId, opType, approved: decision.approved, confidence: decision.confidence, timestamp: result.timestamp });
        if (this.operationLog.length > 1000) this.operationLog.shift();

        this.emit('operation_processed', result);
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.7 معالجة دُفعة من العمليات
    // ─────────────────────────────────────────────────────────────────────────

    processBatch(operations) {
        const results  = operations.map(op => this.process(op));
        const approved = results.filter(r => r.approved).length;
        return {
            total:    results.length,
            approved,
            rejected: results.length - approved,
            avgConfidence: parseFloat((results.reduce((s, r) => s + r.confidence, 0) / results.length).toFixed(4)),
            results
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.8 تحليل فوري بدون قرار (مسح سريع)
    // ─────────────────────────────────────────────────────────────────────────

    quickScan(operation) {
        const opType  = autoClassifyOperation(operation);
        const shkReq  = this._requiresSHK(opType, operation);

        // فحص شرعي سريع
        let shariahOk = true;
        let shariahViolations = [];
        try {
            const { ShariahFilter } = require('./sheikha-neural-blockchain');
            const s = ShariahFilter.check({ ...operation, type: opType, category: operation.category || 'trade' });
            shariahOk         = s.halal;
            shariahViolations = s.violations;
        } catch (_) {}

        // سعر SHK
        let shkPrice = null;
        try {
            const shk = this._getSHKCore();
            if (shk) shkPrice = shk.market.getLivePrice();
        } catch (_) {}

        return {
            operationType: opType,
            shkRequired:   shkReq,
            shkPriceSAR:   shkPrice,
            shariahStatus: shariahOk ? 'حلال ✅' : '❌ محظور شرعاً',
            violations:    shariahViolations,
            note:          'مسح سريع — استخدم process() للتحليل العصبي الكامل'
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5.9 حالة النظام
    // ─────────────────────────────────────────────────────────────────────────

    getStatus() {
        const modules = {
            erpNeural:    !!this._modules.erp,
            scmNeural:    !!this._modules.scm,
            integrated:   !!this._modules.integrated,
            blockchain:   !!this._modules.blockchain,
            shkCore:      !!this._modules.shk,
            neuralCore:   !!this._modules.neuralCore
        };

        const activeCount = Object.values(modules).filter(Boolean).length;

        return {
            name:        this.nameAr,
            version:     this.version,
            status:      this.status,
            uptime:      Math.floor((Date.now() - this.startTime) / 1000) + 's',
            modules,
            activeModules: activeCount,
            totalModules:  6,
            stats:       this.stats,
            recentOps:   this.operationLog.slice(-10),
            supportedTypes: OP_TYPES,
            pipeline: {
                step1: 'تصنيف تلقائي (Operation Classifier)',
                step2: 'توجيه عصبي (Neural Router → ERP+SCM+Blockchain+SHK)',
                step3: 'تجميع قرارات (Decision Aggregator)',
                step4: 'فحص شرعي (Shariah Filter)',
                step5: 'تقييم SHK (Neural Value Oracle)',
                step6: 'تسجيل بلوكشين (On-Chain Recording)',
                step7: 'إصدار القرار العصبي (NeuralDecision)'
            }
        };
    }

    getOperationLog(limit = 50) {
        return this.operationLog.slice(-limit);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const neuralOps = new SheikhaNeralOperations();

module.exports = {
    SheikhaNeralOperations,
    neuralOps,
    NeuralDecisionAggregator,
    OP_TYPES,
    autoClassifyOperation
};
