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
    const { engine: specializedNeuralEngine } = require('../../lib/sheikha-specialized-neural-networks');
    registerEngine('specialized_neural', specializedNeuralEngine, {
        nameAr: 'محرك شيخة للشبكات العصبية المتخصصة',
        nameEn: 'Sheikha Specialized Neural Networks Engine',
        maqsad: 'ARD',
    });
    // الشبكات العصبية المتخصصة — مسارات التوجيه
    registerRoute('computing',        'specialized_neural', 'ARD');
    registerRoute('compute',          'specialized_neural', 'ARD');
    registerRoute('hpc',              'specialized_neural', 'ARD');
    registerRoute('computer_science', 'specialized_neural', 'AQL');
    registerRoute('server',           'specialized_neural', 'ARD');
    registerRoute('servers',          'specialized_neural', 'ARD');
    registerRoute('cloud_server',     'specialized_neural', 'ARD');
    registerRoute('technical',        'specialized_neural', 'ARD');
    registerRoute('technology',       'specialized_neural', 'ARD');
    registerRoute('tech',             'specialized_neural', 'ARD');
    registerRoute('sciences',         'specialized_neural', 'AQL');
    registerRoute('ai_neural',        'specialized_neural', 'AQL');
    registerRoute('ml',               'specialized_neural', 'AQL');
    registerRoute('deep_learning',    'specialized_neural', 'AQL');
    registerRoute('commerce',         'specialized_neural', 'MAL');
    registerRoute('economy',          'specialized_neural', 'MAL');
    registerRoute('gold',             'specialized_neural', 'MAL');
    registerRoute('silver',           'specialized_neural', 'MAL');
    registerRoute('precious_metals',  'specialized_neural', 'MAL');
    registerRoute('scrap',            'specialized_neural', 'ARD');
    registerRoute('recycling',        'specialized_neural', 'ARD');
    registerRoute('dismantling',      'specialized_neural', 'ARD');
    registerRoute('auto_salvage',     'specialized_neural', 'ARD');
    console.log('[ENGINES-INDEX] ✅ محرك الشبكات العصبية المتخصصة مسجّل — ١١ شبكة نشطة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل محرك الشبكات العصبية المتخصصة:', err.stack || err.message);
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

// ─── تسجيل شبكة شيخة العصبية للطاقة ─────────────────────────────────────────
// ﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ﴾ — النور ٣٥

try {
    const { engine: energyNeuralEngine } = require('../../lib/sheikha-energy-neural-network');
    registerEngine('energy', energyNeuralEngine, {
        nameAr: 'شبكة شيخة العصبية للطاقة',
        nameEn: 'Sheikha Energy Neural Network',
        maqsad: 'ARD',
    });
    registerRoute('energy',              'energy', 'ARD');
    registerRoute('energy.classify',     'energy', 'ARD');
    registerRoute('energy.predict',      'energy', 'ARD');
    registerRoute('energy.forecast',     'energy', 'ARD');
    registerRoute('energy.optimize',     'energy', 'ARD');
    registerRoute('energy.score',        'energy', 'ARD');
    registerRoute('energy.evaluate',     'energy', 'ARD');
    registerRoute('energy.trade',        'energy', 'MAL');
    registerRoute('energy.market',       'energy', 'MAL');
    registerRoute('energy.vision2030',   'energy', 'ARD');
    registerRoute('energy.sharia',       'energy', 'DEEN');
    registerRoute('energy.physics',      'energy', 'ARD');
    registerRoute('energy.calc',         'energy', 'ARD');
    registerRoute('energy.list',         'energy', 'ARD');
    registerRoute('energy.info',         'energy', 'ARD');
    registerRoute('renewable',           'energy', 'ARD');
    registerRoute('solar',               'energy', 'ARD');
    registerRoute('wind_energy',         'energy', 'ARD');
    registerRoute('nuclear_energy',      'energy', 'ARD');
    registerRoute('hydrogen_energy',     'energy', 'ARD');
    registerRoute('smart_grid',          'energy', 'ARD');
    console.log('[ENGINES-INDEX] ✅ شبكة شيخة العصبية للطاقة مسجّلة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل شبكة الطاقة العصبية:', err.stack || err.message);
}

// ─── تسجيل شبكة شيخة العصبية للموارد ────────────────────────────────────────

try {
    const { engine: resourcesNeuralEngine } = require('../../lib/sheikha-resources-neural-network');
    registerEngine('resources', resourcesNeuralEngine, {
        nameAr: 'شبكة شيخة العصبية للموارد',
        nameEn: 'Sheikha Resources Neural Network',
        maqsad: 'ARD',
    });
    // مسارات توجيه منظومة الموارد
    registerRoute('resources',              'resources', 'ARD');
    registerRoute('resource',               'resources', 'ARD');
    registerRoute('resources.list',         'resources', 'ARD');
    registerRoute('resources.analyze',      'resources', 'ARD');
    registerRoute('resources.full',         'resources', 'ARD');
    registerRoute('resources.forecast',     'resources', 'ARD');
    registerRoute('resources.optimize',     'resources', 'ARD');
    registerRoute('resources.info',         'resources', 'ARD');
    registerRoute('resources.search',       'resources', 'ARD');
    registerRoute('resources.status',       'resources', 'ARD');
    registerRoute('natural_resources',      'resources', 'ARD');
    registerRoute('energy_resources',       'resources', 'ARD');
    registerRoute('human_resources',        'resources', 'NAFS');
    registerRoute('financial_resources',    'resources', 'MAL');
    registerRoute('agricultural_resources', 'resources', 'NAFS');
    registerRoute('digital_resources',      'resources', 'ARD');
    registerRoute('strategic_resources',    'resources', 'DEEN');
    registerRoute('knowledge_resources',    'resources', 'AQL');
    registerRoute('industry_resources',     'resources', 'ARD');
    registerRoute('supply_lines',           'resources', 'MAL');
    registerRoute('logistics',              'resources', 'MAL');
    registerRoute('logistics_networks',     'resources', 'MAL');
    registerRoute('feasibility',            'resources', 'MAL');
    registerRoute('feasibility_study',      'resources', 'MAL');
    registerRoute('production_lines',       'resources', 'ARD');
    registerRoute('industry_full',          'resources', 'ARD');
    console.log('[ENGINES-INDEX] ✅ شبكة شيخة العصبية للموارد مسجّلة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل شبكة الموارد العصبية:', err.stack || err.message);
}


// ─── تسجيل شبكة شيخة العصبية للإنتاج ────────────────────────────────────────

try {
    const { engine: productionNeuralEngine } = require('../../lib/sheikha-production-neural-network');
    registerEngine('production_neural', productionNeuralEngine, {
        nameAr: 'شبكة شيخة العصبية للإنتاج',
        nameEn: 'Sheikha Production Neural Network',
        maqsad: 'ARD',
    });
    registerRoute('production',              'production_neural', 'ARD');
    registerRoute('production.infer',        'production_neural', 'ARD');
    registerRoute('production.train',        'production_neural', 'ARD');
    registerRoute('production.batch_train',  'production_neural', 'ARD');
    registerRoute('production.status',       'production_neural', 'ARD');
    registerRoute('production.export',       'production_neural', 'ARD');
    registerRoute('production.import',       'production_neural', 'ARD');
    registerRoute('production.reset',        'production_neural', 'ARD');
    registerRoute('production.pipelines',    'production_neural', 'ARD');
    registerRoute('production.encode',       'production_neural', 'ARD');
    registerRoute('prod.infer',              'production_neural', 'ARD');
    registerRoute('prod.train',              'production_neural', 'ARD');
    registerRoute('prod.status',             'production_neural', 'ARD');
    console.log('[ENGINES-INDEX] 🧠 شبكة شيخة العصبية للإنتاج مسجّلة');
} catch (err) {
    console.error('[ENGINES-INDEX] ❌ خطأ في تحميل شبكة الإنتاج العصبية:', err.stack || err.message);
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
            'live-ai':           'شبكة الذكاء الاصطناعي الحية',
            universal_networks:  'المحرك العصبي الكوني الشامل',
            specialized_neural:  'محرك شيخة للشبكات العصبية المتخصصة',
            energy:              'شبكة شيخة العصبية للطاقة',
            resources:           'شبكة شيخة العصبية للموارد (صناعة، جدوى، خطوط، لوجستيات)',
            production_neural:   'شبكة شيخة العصبية للإنتاج',
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
