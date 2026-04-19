/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          SHEIKHA ENGINES INDEX — فهرس المحركات الموحدة                     ║
 * ║     يجمع كل المحركات تحت واجهة واحدة ويربطها بالموجّه العصبي              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَنَّ إِلَىٰ رَبِّكَ الْمُنتَهَىٰ" — النجم:٤٢
 *
 * الاستخدام:
 *   const { router } = require('./core/engines');
 *   const res = await router.route({ intent: 'market', data: { ... } });
 */

'use strict';

const path = require('path');
const fs   = require('fs');

const { router, registerEngine, registerRoute, listEngines } = require('./sheikha-neural-router');

// ─── خريطة المحركات الجاهزة للتسجيل ─────────────────────────────────────────
//
// key        → مفتاح التوجيه (intent)
// file       → مسار الملف نسبةً إلى مجلد lib/
// nameAr     → الاسم العربي
// maqsad     → المقصد الشرعي المرتبط
//
const ENGINE_MANIFEST = [
    { key: 'sharia',    file: 'sheikha-sharia-engine.js',          nameAr: 'محرك الشريعة',           maqsad: 'DEEN' },
    { key: 'agents',    file: 'sheikha-islamic-agents-engine.js',   nameAr: 'محرك الوكلاء الإسلاميين',maqsad: 'DEEN' },
    { key: 'quran',     file: 'sheikha-quran-sunnah-engine.js',     nameAr: 'محرك القرآن والسنة',     maqsad: 'AQL'  },
    { key: 'learning',  file: 'sheikha-learning-engine.js',         nameAr: 'محرك التعلم',            maqsad: 'AQL'  },
    { key: 'knowledge', file: 'sheikha-knowledge-engine.js',        nameAr: 'محرك المعرفة',           maqsad: 'AQL'  },
    { key: 'market',    file: 'sheikha-smart-market-engine.js',     nameAr: 'محرك السوق الذكي',       maqsad: 'MAL'  },
    { key: 'trade',     file: 'sheikha-trade-engine.js',            nameAr: 'محرك التجارة',           maqsad: 'MAL'  },
    { key: 'payments',  file: 'sheikha-payments-engine.js',         nameAr: 'محرك المدفوعات',         maqsad: 'MAL'  },
    { key: 'zakat',     file: 'sheikha-barakah-engine.js',          nameAr: 'محرك البركة والزكاة',    maqsad: 'MAL'  },
    { key: 'identity',  file: 'sheikha-digital-identity-engine.js', nameAr: 'محرك الهوية الرقمية',    maqsad: 'DEEN' },
    { key: 'security',  file: 'sheikha-security-engine.js',         nameAr: 'محرك الأمان',            maqsad: 'NAFS' },
    { key: 'medical',   file: 'sheikha-medical-engine.js',          nameAr: 'محرك الصحة',             maqsad: 'NAFS' },
    { key: 'ai',        file: 'sheikha-ai-engine.js',               nameAr: 'محرك الذكاء الاصطناعي', maqsad: 'ARD'  },
    { key: 'cloud',     file: 'sheikha-cloud-engine.js',            nameAr: 'محرك السحابة',           maqsad: 'ARD'  },
    { key: 'lmm',       file: 'sheikha-lmm-engine.js',              nameAr: 'محرك نموذج اللغة',       maqsad: 'ARD'  },
];

// ─── تسجيل المحركات ───────────────────────────────────────────────────────────

const libDir = path.resolve(__dirname, '../../lib');

let registered = 0;

for (const entry of ENGINE_MANIFEST) {
    const filePath = path.join(libDir, entry.file);
    if (!fs.existsSync(filePath)) {
        console.warn(`[ENGINES-INDEX] ⚠️  لم يُعثر على: ${filePath} — تخطّي`);
        continue;
    }
    try {
        const mod = require(filePath);
        registerEngine(entry.key, mod, { nameAr: entry.nameAr, maqsad: entry.maqsad });
        registered++;
    } catch (err) {
        console.error(`[ENGINES-INDEX] ❌ خطأ في تحميل ${entry.file}:`, err.stack || err.message);
    }
}

console.log(`[ENGINES-INDEX] 🚀 المحركات المسجّلة: ${registered}/${ENGINE_MANIFEST.length}`);

// ─── تسجيل محرك المعايير المدمج مباشرةً ─────────────────────────────────────

try {
    const { engine: standardsEngine } = require('../standards');
    registerEngine('standards', standardsEngine, {
        nameAr: 'محرك المعايير والجودة والمقاييس',
        maqsad: 'MAL',
    });
    // مسارات توجيه إضافية لمحرك المعايير
    registerRoute('quality',    'standards', 'MAL');
    registerRoute('compliance', 'standards', 'MAL');
    registerRoute('iso',        'standards', 'MAL');
    registerRoute('law',        'standards', 'DEEN');
    registerRoute('legal',      'standards', 'DEEN');
    registerRoute('treaty',     'standards', 'MAL');
    registerRoute('halal',      'standards', 'DEEN');
    console.log('[ENGINES-INDEX] ✅ محرك المعايير مسجّل');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل محرك المعايير:', err.stack || err.message);
}

// ─── تسجيل محرك الرؤى والاستشارات الدولية ───────────────────────────────────

try {
    const { engine: visionEngine } = require('../visions');
    registerEngine('vision', visionEngine, {
        nameAr: 'محرك الرؤى والاستشارات الدولية',
        maqsad: 'ARD',
    });
    registerRoute('vision',      'vision', 'ARD');
    registerRoute('advisory',    'vision', 'ARD');
    registerRoute('indicator',   'vision', 'ARD');
    registerRoute('dominance',   'vision', 'DEEN');
    registerRoute('supremacy',   'vision', 'DEEN');
    registerRoute('roadmap',     'vision', 'ARD');
    console.log('[ENGINES-INDEX] ✅ محرك الرؤى مسجّل');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل محرك الرؤى:', err.stack || err.message);
}

// ─── تسجيل محرك الاستشارات الكوني ───────────────────────────────────────────

try {
    const { engine: consultingEngine } = require('../consulting');
    registerEngine('consulting', consultingEngine, {
        nameAr: 'محرك شيخة للاستشارات الكونية',
        maqsad: 'ARD',
    });
    registerRoute('consulting', 'consulting', 'ARD');
    registerRoute('consult',    'consulting', 'ARD');
    console.log('[ENGINES-INDEX] ✅ محرك الاستشارات مسجّل');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل محرك الاستشارات:', err.stack || err.message);
}

// ─── تسجيل الحاكمة العليا — أول محرك وأساس كل محرك ─────────────────────────
// ﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ﴾
// تُسجَّل قبل كل شيء لأنها الحاكمة والأساس

let _governor = null;
try {
    const { governor, registerAll } = require('../sheikha-sovereign-governor');
    _governor = governor;

    registerEngine('sovereign', governor, {
        nameAr: 'شيخة — الحاكمة العليا والأساس',
        nameEn: 'Sheikha Sovereign Governor',
        maqsad: 'DEEN',
    });

    // مسارات توجيه الحاكمة العليا
    registerRoute('sovereign',              'sovereign', 'DEEN');
    registerRoute('sovereign.status',       'sovereign', 'DEEN');
    registerRoute('sovereign.enforce',      'sovereign', 'DEEN');
    registerRoute('sovereign.unify',        'sovereign', 'DEEN');
    registerRoute('sovereign.filter',       'sovereign', 'DEEN');
    registerRoute('sovereign.register',     'sovereign', 'DEEN');
    registerRoute('sovereign.subjects',     'sovereign', 'DEEN');
    registerRoute('sovereign.audit',        'sovereign', 'DEEN');
    registerRoute('sovereign.constitution', 'sovereign', 'DEEN');
    registerRoute('govern',                 'sovereign', 'DEEN');
    registerRoute('tawheed',                'sovereign', 'DEEN');

    console.log('[ENGINES-INDEX] 👑 الحاكمة العليا مسجّلة — شيخة تحكم بالكتاب والسنة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل الحاكمة العليا:', err.stack || err.message);
}

// ─── تسجيل شبكة الذكاء الاصطناعي الحية الداخلية ─────────────────────────────

try {
    const { engine: liveAIEngine } = require('../../lib/sheikha-live-ai-network');
    registerEngine('live-ai', liveAIEngine, {
        nameAr: 'شبكة الذكاء الاصطناعي الحية الداخلية',
        maqsad: 'ARD',
    });
    registerRoute('live-ai',   'live-ai', 'ARD');
    registerRoute('live',      'live-ai', 'ARD');
    registerRoute('internal',  'live-ai', 'ARD');
    registerRoute('chat',      'live-ai', 'ARD');
    console.log('[ENGINES-INDEX] ✅ شبكة الذكاء الاصطناعي الحية مسجّلة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل شبكة الذكاء الاصطناعي الحية:', err.stack || err.message);
}

try {
    const { engine: universalNetworksEngine } = require('../../lib/sheikha-universal-networks-neural-engine');
    registerEngine('universal_networks', universalNetworksEngine, {
        nameAr: 'المحرك العصبي الكوني الشامل لكل أنواع الشبكات',
        maqsad: 'ARD',
    });
    // مسارات التوجيه الشاملة للشبكات
    registerRoute('network',              'universal_networks', 'ARD');
    registerRoute('networks',             'universal_networks', 'ARD');
    registerRoute('neural_network',       'universal_networks', 'AQL');
    registerRoute('network.classify',     'universal_networks', 'ARD');
    registerRoute('network.list',         'universal_networks', 'ARD');
    registerRoute('network.metrics',      'universal_networks', 'ARD');
    registerRoute('network.integration',  'universal_networks', 'ARD');
    registerRoute('network.topology',     'universal_networks', 'ARD');
    registerRoute('network.type',         'universal_networks', 'ARD');
    registerRoute('network.info',         'universal_networks', 'ARD');
    registerRoute('integration',          'universal_networks', 'ARD');
    registerRoute('topology',             'universal_networks', 'ARD');
    registerRoute('quantum_network',      'universal_networks', 'ARD');
    registerRoute('biological_network',   'universal_networks', 'NAFS');
    registerRoute('energy_network',       'universal_networks', 'ARD');
    registerRoute('social_network',       'universal_networks', 'NAFS');
    registerRoute('financial_network',    'universal_networks', 'MAL');
    registerRoute('transport_network',    'universal_networks', 'MAL');
    registerRoute('space_network',        'universal_networks', 'ARD');
    console.log('[ENGINES-INDEX] ✅ المحرك العصبي الكوني الشامل مسجّل');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل المحرك العصبي الكوني:', err.stack || err.message);
}

// ─── تسجيل صانعة شيخة الجيل الجديد — تكنولوجيا الصناعة ───────────────────────

try {
    const { engine: nextgenMfgEngine } = require('../../lib/sheikha-nextgen-manufacturer');
    registerEngine('nextgen_manufacturer', nextgenMfgEngine, {
        nameAr: 'صانعة شيخة — الجيل الجديد | تكنولوجيا الصناعة',
        maqsad: 'ARD',
    });
    // مسارات التوجيه لصانعة الجيل الجديد
    registerRoute('nextgen',                 'nextgen_manufacturer', 'ARD');
    registerRoute('nextgen_manufacturer',    'nextgen_manufacturer', 'ARD');
    registerRoute('nextgen_manufacturing',   'nextgen_manufacturer', 'ARD');
    registerRoute('manufacturing_tech',      'nextgen_manufacturer', 'ARD');
    registerRoute('industry5',               'nextgen_manufacturer', 'ARD');
    registerRoute('industry5_0',             'nextgen_manufacturer', 'ARD');
    registerRoute('quantum_manufacturing',   'nextgen_manufacturer', 'ARD');
    registerRoute('nano_manufacturing',      'nextgen_manufacturer', 'ARD');
    registerRoute('bio_manufacturing',       'nextgen_manufacturer', 'ARD');
    registerRoute('space_manufacturing',     'nextgen_manufacturer', 'ARD');
    registerRoute('generative_design',       'nextgen_manufacturer', 'ARD');
    registerRoute('manufacturer_market',     'nextgen_manufacturer', 'MAL');
    registerRoute('nextgen_materials',       'nextgen_manufacturer', 'ARD');
    registerRoute('oee',                     'nextgen_manufacturer', 'ARD');
    registerRoute('distributed_manufacturing','nextgen_manufacturer', 'ARD');
    registerRoute('sharia_manufacturing',    'nextgen_manufacturer', 'DEEN');
    console.log('[ENGINES-INDEX] ✅ صانعة شيخة الجيل الجديد مسجّلة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل صانعة الجيل الجديد:', err.stack || err.message);
}

// ─── تسجيل شبكة شيخة العصبية للصناعة والمصانع والتصنيع والإنتاج الصناعي ──────

try {
    const { engine: industrialNNEngine } = require('../../lib/sheikha-industrial-neural-network');
    registerEngine('industrial_nn', industrialNNEngine, {
        nameAr: 'شبكة شيخة العصبية للصناعة والمصانع والتصنيع والإنتاج الصناعي',
        maqsad: 'ARD',
    });
    // مسارات التوجيه الصناعية الشاملة
    registerRoute('industry',            'industrial_nn', 'ARD');
    registerRoute('industrial',          'industrial_nn', 'ARD');
    registerRoute('factory',             'industrial_nn', 'ARD');
    registerRoute('manufacturing',       'industrial_nn', 'ARD');
    registerRoute('production',          'industrial_nn', 'ARD');
    registerRoute('factory_monitor',     'industrial_nn', 'ARD');
    registerRoute('production_plan',     'industrial_nn', 'ARD');
    registerRoute('quality_control',     'industrial_nn', 'ARD');
    registerRoute('predictive_maint',    'industrial_nn', 'ARD');
    registerRoute('digital_twin',        'industrial_nn', 'ARD');
    registerRoute('energy_optimize',     'industrial_nn', 'ARD');
    registerRoute('robotics_auto',       'industrial_nn', 'ARD');
    registerRoute('workforce_safety',    'industrial_nn', 'NAFS');
    registerRoute('sector_analysis',     'industrial_nn', 'ARD');
    registerRoute('standards_comply',    'industrial_nn', 'ARD');
    registerRoute('industrial_general',  'industrial_nn', 'ARD');
    registerRoute('industry4',           'industrial_nn', 'ARD');
    registerRoute('smart_factory',       'industrial_nn', 'ARD');
    registerRoute('iiot',                'industrial_nn', 'ARD');
    registerRoute('industrial_supply_chain', 'industrial_nn', 'MAL');
    console.log('[ENGINES-INDEX] ✅ شبكة شيخة العصبية للصناعة والمصانع مسجّلة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل الشبكة العصبية الصناعية:', err.stack || err.message);
}

// ─── تسجيل كل المحركات تحت سيادة الحاكمة العليا ─────────────────────────────
// بعد تسجيل الجميع، تفرض شيخة سيادتها على الكل
// ﴿ وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ ﴾ — يوسف ٧٦

if (_governor) {
    try {
        // جدول أسماء المحركات بالعربية
        const ENGINE_ARABIC = {
            sharia:             'محرك الشريعة الإسلامية',
            agents:             'محرك الوكلاء الإسلاميين',
            quran:              'محرك القرآن والسنة',
            learning:           'محرك التعلم والتدريب',
            knowledge:          'محرك المعرفة والعلوم',
            market:             'محرك السوق الذكي',
            trade:              'محرك التجارة',
            payments:           'محرك المدفوعات',
            zakat:              'محرك البركة والزكاة',
            identity:           'محرك الهوية الرقمية',
            security:           'محرك الأمان',
            medical:            'محرك الصحة والطب',
            ai:                 'محرك الذكاء الاصطناعي',
            cloud:              'محرك السحابة',
            lmm:                'محرك نموذج اللغة',
            standards:          'محرك المعايير والجودة',
            vision:             'محرك الرؤى والاستشارات',
            consulting:         'محرك الاستشارات الكونية',
            'live-ai':          'شبكة الذكاء الاصطناعي الحية',
            universal_networks: 'المحرك العصبي الكوني الشامل',
            industrial_nn:      'شبكة شيخة العصبية للصناعة والمصانع والتصنيع والإنتاج الصناعي',
            nextgen_manufacturer: 'صانعة شيخة — الجيل الجديد | تكنولوجيا الصناعة',
        };
        const allEngines = listEngines();
        for (const engineKey of allEngines) {
            if (engineKey === 'sovereign') continue; // الحاكمة مسجّلة مع نفسها مسبقاً
            if (!_governor._subjects || !_governor._subjects.has(engineKey)) {
                _governor.registerSubject(engineKey, 'engine', {
                    nameAr: ENGINE_ARABIC[engineKey] || `محرك ${engineKey}`,
                    maqsad: 'ARD',
                });
            }
        }
        const enfReport = _governor.enforce();
        console.log(`[ENGINES-INDEX] ⚖️  سيادة شيخة مفروضة: ${enfReport.summary}`);
    } catch (err) {
        console.error('[ENGINES-INDEX] ⚠️  تحذير في تطبيق السيادة:', err.message);
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    router,
    registerEngine,
    registerRoute,
    listEngines,
    ENGINE_MANIFEST,
    governor: _governor,
};
