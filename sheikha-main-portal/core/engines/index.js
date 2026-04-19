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

// ─── تسجيل المحرك العصبي الكوني الشامل لكل أنواع الشبكات ────────────────────

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

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    router,
    registerEngine,
    registerRoute,
    listEngines,
    ENGINE_MANIFEST,
};
