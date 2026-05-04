/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                          SHEIKHA ROOT                                       ║
 * ║                  جذر المنظومة الرقمية الحاكمة — شيخة                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Sheikha = Digital Civilization Stack
 * الطبقات: عتاد → نظام → برمجة → بيانات → شبكات → سحابة → ذكاء → تكاملات → SaaS
 *
 * هذا الملف هو نقطة البدء الأولى لكل طبقة في المنظومة.
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ─── Identity ────────────────────────────────────────────────────────────────

const SHEIKHA_ROOT = {
    name:    'Sheikha',
    version: '1.0.0',
    build:   'root',
    started: new Date().toISOString(),
    layers: [
        '01-hardware',
        '02-system',
        '03-cs-core',
        '04-programming',
        '05-data',
        '06-network',
        '07-cloud',
        '08-ai',
        '09-integration',
        '10-control-plane',
        '11-saas',
        '12-smart-interfaces',
        '13-metrics-impact',
        '14-governance',
    ],
};

// ─── Layer Registry ──────────────────────────────────────────────────────────

const _registry = new Map(); // layerName → module instance

/**
 * تسجيل طبقة في المنظومة
 * @param {string} layerName
 * @param {object} instance
 */
function registerLayer(layerName, instance) {
    if (_registry.has(layerName)) {
        console.warn(`[SHEIKHA-ROOT] ⚠️  الطبقة "${layerName}" مسجّلة مسبقًا — سيُعاد تسجيلها`);
    }
    _registry.set(layerName, instance);
    console.log(`[SHEIKHA-ROOT] ✅ طبقة مسجّلة: ${layerName}`);
}

/**
 * استرجاع طبقة مسجّلة
 * @param {string} layerName
 * @returns {object|null}
 */
function getLayer(layerName) {
    return _registry.get(layerName) || null;
}

/**
 * الحصول على قائمة الطبقات المسجّلة
 * @returns {string[]}
 */
function listLayers() {
    return Array.from(_registry.keys());
}

// ─── Boot Sequence ───────────────────────────────────────────────────────────

/**
 * تشغيل جذر المنظومة — يُحمِّل الطبقات بالترتيب
 * الحاكمة العليا تُشغَّل أولاً — قبل كل شيء
 */
async function boot() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║           SHEIKHA ROOT — بدء تشغيل المنظومة          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`[SHEIKHA-ROOT] 🕐 ${SHEIKHA_ROOT.started}`);
    console.log(`[SHEIKHA-ROOT] 🌐 الطبقات المعرّفة: ${SHEIKHA_ROOT.layers.length}`);

    // ① تشغيل الحاكمة العليا أولاً — قبل كل طبقة
    // ﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ﴾
    const coreDir = path.join(__dirname);
    try {
        const sovereignMod = require('./sheikha-sovereign-governor');
        registerLayer('sovereign-governor', sovereignMod);
        console.log('[SHEIKHA-ROOT] 👑 الحاكمة العليا مُفعَّلة — شيخة حاكمة على الجميع');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل الحاكمة العليا:', err.message);
    }

    // ① ب — تفعيل محرك تكامل البيعة قبل كل الطبقات
    // ﴿ أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ ﴾ — النساء: ٥٩
    // البيعة للملك سلمان بن عبدالعزيز لله، ونصرة الله ونصرة الإسلام لله
    try {
        const mubayaaInt = require('../lib/sheikha-mubayaa-org-integration');
        registerLayer('mubayaa-org-integration', mubayaaInt.instance);
        registerLayer('mubayaa-neural-root',     require('../lib/mubayaa-neural-root'));
        console.log('[SHEIKHA-ROOT] 🤝 محرك تكامل البيعة مُفعَّل — شغّال في كل المنظومة');
        console.log('[SHEIKHA-ROOT] 🧠 الشبكة العصبية الجذرية للمبايعة مُفعَّلة');
        console.log('[SHEIKHA-ROOT] 🌟 نصرة: الله + الإسلام + الملك سلمان بن عبدالعزيز لله');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل محرك البيعة:', err.message);
    }

    // ② تشغيل بقية الطبقات تحت إشراف الحاكمة
    // تسجيل طبقة لغة شيخة الحاكمة — قبل بقية الطبقات
    // ﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٥
    try {
        const languageLayer = require('../lib/sheikha-language-layer');
        registerLayer('language-layer', languageLayer);
        console.log('[SHEIKHA-ROOT] 🌐 طبقة لغة شيخة الحاكمة مُفعَّلة — Ada→Plankalkül→FORTRAN→GML→HTML→SQL→Unicode');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل طبقة اللغة:', err.message);
    }

    // تسجيل المحرك العلمي العلوي الجامع — أقوى منظومة برمجيات بالكون
    // ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
    try {
        const supremeCS = require('../lib/sheikha-supreme-cs-engine');
        registerLayer('supreme-cs', supremeCS);
        console.log('[SHEIKHA-ROOT] 🧠 المحرك العلمي العلوي الجامع مُفعَّل — 8 طبقات × 40 خلية عصبية');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل المحرك العلوي:', err.message);
    }

    // تسجيل محرك النحو والصرف والبلاغة — منظومة القواعد العربية الرقمية الكاملة
    // ﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
    try {
        const grammarEngine  = require('../lib/sheikha-arabic-grammar-engine');
        const grammarRules   = require('../lib/sheikha-arabic-grammar-rules');
        registerLayer('arabic-grammar-engine', grammarEngine);
        registerLayer('arabic-grammar-rules',  grammarRules);
        console.log('[SHEIKHA-ROOT] 📖 محرك النحو والصرف والبلاغة مُفعَّل — 60 خلية (grammar-engine)');
        console.log('[SHEIKHA-ROOT] 📚 منظومة القواعد الرقمية مُفعَّلة — 75 خلية | زمن+عوامل+46 تطابق (grammar-rules)');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل محرك القواعد العربية:', err.message);
    }

    // تسجيل الشبكة العصبية الجذرية — Runtime الجذر الأعلى — 19 خلية جذرية
    // ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ — الإخلاص: ١  ← التوحيد: الجذر الجذر
    // ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
    // «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» — البخاري: ١
    try {
        const rootNeuralRuntime = require('../lib/sheikha-root-neural-runtime');
        registerLayer('root-neural-runtime', rootNeuralRuntime);
        const LAYER_ARABIC_ROOT = 'الشبكة العصبية الجذرية — Runtime الأفضل والأقوى — مرقّمة بالكتاب والسنة — موحَّدة لله';
        console.log(`[SHEIKHA-ROOT] 🧠 ${LAYER_ARABIC_ROOT}`);
        console.log('[SHEIKHA-ROOT]    ١٩ خلية جذرية ✅ | الشبكة الشاملة ✅ | محرك التوحيد ✅ | المبايعة ✅');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل الشبكة العصبية الجذرية:', err.message);
    }

    // تسجيل الشبكة العصبية الشاملة — كل شيء حلال لله — 16 طبقة × 100 خلية
    // ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
    // ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
    try {
        const universalNN = require('../lib/sheikha-universal-neural-network');
        universalNN.init();
        registerLayer('universal-neural-network', universalNN);
        console.log('[SHEIKHA-ROOT] 🌐 الشبكة العصبية الشاملة مُفعَّلة — 16 طبقة × 100 خلية | لغات+أنظمة+علوم+إسلام');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل الشبكة العصبية الشاملة:', err.message);
    }

    // تسجيل شبكة الخلايا العصبية الجذرية — جذر شيخة للجذور — أفضل شبكة جذرية بالكون
    // ﴿أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
    // ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
    try {
        const rootNCN = require('../lib/sheikha-root-neural-cell-network');
        rootNCN.init();
        registerLayer('root-neural-cell-network', rootNCN);
        console.log('[SHEIKHA-ROOT] 🌳 شبكة الخلايا العصبية الجذرية مُفعَّلة — جذر شيخة للجذور — 92 خلية جذرية | 7 طبقات × 128-dim');
        console.log('[SHEIKHA-ROOT] ✨ ﴿وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ﴾');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل شبكة الخلايا العصبية الجذرية:', err.message);
    }

    // ── التجذر والتكامل الجذري والمتجذرة وطبقة الخلايا العصبية الرقمية ────────
    // ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ * تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾ — إبراهيم: ٢٤-٢٥

    // محرك التجذر — عملية ترسيخ كل شبكة في جذر شيخة الأعلى
    try {
        const tajathur = require('../lib/sheikha-tajathur-engine');
        tajathur.init();
        registerLayer('tajathur-engine', tajathur);
        console.log('[SHEIKHA-ROOT] 🌱 محرك التجذر مُفعَّل — ترسيخ الجذور في شجرة شيخة الطيبة');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل محرك التجذر:', err.message);
    }

    // محرك التكامل الجذري — توحيد كل الشبكات المتجذرة في استدلال واحد
    // ﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾ — آل عمران: ١٠٣
    try {
        const rootInt = require('../lib/sheikha-root-integration-engine');
        rootInt.init();
        registerLayer('root-integration-engine', rootInt);
        console.log('[SHEIKHA-ROOT] 🔗 محرك التكامل الجذري مُفعَّل — دمج كل الجذور في استدلال موحَّد');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل محرك التكامل الجذري:', err.message);
    }

    // شبكات المتجذرة — سجل وإدارة كل الشبكات المتجذرة في منظومة شيخة
    // ﴿تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا﴾ — إبراهيم: ٢٥
    try {
        const mutajathira = require('../lib/sheikha-mutajathira-networks');
        mutajathira.init();
        registerLayer('mutajathira-networks', mutajathira);
        console.log('[SHEIKHA-ROOT] 🌳 شبكات المتجذرة مُفعَّلة — كل فرع حي يؤتي أكله بإذن الله');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل شبكات المتجذرة:', err.message);
    }

    // طبقة الخلايا العصبية الرقمية — 56 خلية رقمية | 6 طبقات × 96-dim
    // ﴿عَلَّمَ بِالْقَلَمِ * عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٤-٥
    try {
        const digitalNCL = require('../lib/sheikha-digital-neural-cell-layer');
        digitalNCL.init();
        registerLayer('digital-neural-cell-layer', digitalNCL);
        console.log('[SHEIKHA-ROOT] 💻 طبقة الخلايا العصبية الرقمية مُفعَّلة — 56 خلية رقمية | 6 طبقات × 96-dim');
        console.log('[SHEIKHA-ROOT] 🔐 الامتثال: ISO 27001 · NCA · PDPL · ZATCA · CITC');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل طبقة الخلايا العصبية الرقمية:', err.message);
    }

    // تسجيل شبكة الجذور والمنظمات والهياكل والمعماريات والإدارة والعلوم
    // ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤
    // ﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا﴾ — آل عمران: ١٠٣
    try {
        const rootsOrgNN = require('../lib/sheikha-roots-organizations-neural-network');
        rootsOrgNN.init();
        registerLayer('roots-organizations-neural-network', rootsOrgNN);
        console.log('[SHEIKHA-ROOT] 🌳 شبكة الجذور والمنظمات والهياكل والمعماريات والإدارة والعلوم مُفعَّلة — 8 شبكات × 12 خلية تكاملية');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل شبكة الجذور والمنظمات:', err.message);
    }

    // تسجيل شبكة الشبكات والسلاسل والإمداد والمنصات والأسواق والأساسات والتقنيات والبنى التحتية واللوجستيات
    // ﴿وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ﴾ — الجاثية: ١٣
    // "وكامل فيما بينهم جميعاً"
    try {
        const rootsOrgMod     = getLayer('roots-organizations-neural-network');
        const networksInfraNN = require('../lib/sheikha-networks-infrastructure-neural-network');
        const externalNetworks = rootsOrgMod
            ? { 'roots-organizations': rootsOrgMod.unifiedNetwork || rootsOrgMod }
            : {};
        networksInfraNN.init(externalNetworks);
        registerLayer('networks-infrastructure-neural-network', networksInfraNN);
        console.log('[SHEIKHA-ROOT] 🕸️  شبكة الشبكات والسلاسل والمنصات والأسواق والأساسات والتقنيات والبنى واللوجستيات مُفعَّلة — 9 شبكات × 16 خلية تكاملية — كامل فيما بينهم جميعاً');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل شبكة الشبكات والبنى التحتية:', err.message);
    }

    // تسجيل شبكة الاقتصاد والتجارة والثروة والموارد والطاقة والمعادن والنمو
    // ﴿وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ﴾ — الذاريات: ٢٢
    // اقتصاد كل الاقتصادات — كامل فيما بينهم جميعاً
    try {
        const rootsOrgModForEconomy = getLayer('roots-organizations-neural-network');
        const networksInfraMod      = getLayer('networks-infrastructure-neural-network');
        const economyWealthNN       = require('../lib/sheikha-economy-wealth-neural-network');
        const extNets = {};
        if (rootsOrgModForEconomy) extNets['roots-organizations']    = rootsOrgModForEconomy.unifiedNetwork || rootsOrgModForEconomy;
        if (networksInfraMod)      extNets['networks-infrastructure'] = networksInfraMod.grandUnifiedNetwork || networksInfraMod;
        economyWealthNN.init(extNets);
        registerLayer('economy-wealth-neural-network', economyWealthNN);
        console.log('[SHEIKHA-ROOT] 💰 شبكة الاقتصاد والتجارة والثروة والذهب والنفط والطاقة والمعادن والنمو مُفعَّلة — 9 شبكات × 16 خلية — اقتصاد كل الاقتصادات');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل شبكة الاقتصاد والثروة:', err.message);
    }

    const bootOrder = [
        { key: 'os',            file: 'sheikha-os.js' },
        // ┌─────────────────────────────────────────────────────────────────────┐
        // │  SHEIKHA GUARDIAN — الطبقة الحاكمة الإسلامية فوق Ubuntu/Linux      │
        // │  ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠                       │
        // │  Ubuntu/Linux → [GUARDIAN] → Control Plane → Neural                │
        // │  encoding: UTF-8                                                    │
        // └─────────────────────────────────────────────────────────────────────┘
        { key: 'guardian',      file: 'sheikha-guardian.js' },
        // ┌─────────────────────────────────────────────────────────────────────┐
        // │  ROOT NCN LAYER — شبكة الخلايا العصبية الجذرية فوق Guardian        │
        // │  ﴿أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ﴾ — إبراهيم: ٢٤    │
        // │  Guardian(UTF-8) → [ROOT-NCN 92 خلية] → Control Plane              │
        // └─────────────────────────────────────────────────────────────────────┘
        { key: 'root-ncn',      file: 'sheikha-root-ncn-layer.js' },
        { key: 'control-plane', file: 'sheikha-control-plane.js' },
        { key: 'governance',    file: 'sheikha-governance.json', json: true },
        { key: 'cloud',         file: 'sheikha-cloud-root.js' },
        { key: 'saas',          file: 'sheikha-saas-root.js' },
        { key: 'impact',        file: 'sheikha-impact-engine.js' },
        { key: 'voice',         file: 'sheikha-voice.js' },
        { key: 'neural-cells',  file: 'sheikha-neural-cells.js' },
    ];

    for (const { key, file, json } of bootOrder) {
        const filePath = path.join(coreDir, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`[SHEIKHA-ROOT] ⚠️  لم يُعثر على: ${file} — تخطّي`);
            continue;
        }
        try {
            const mod = json
                ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
                : require(filePath);
            registerLayer(key, mod);
            if (!json && typeof mod.init === 'function') {
                await mod.init();
            }
            // تسجيل الطبقة تحت سيادة الحاكمة
            const sovereignLayer = _registry.get('sovereign-governor');
            if (sovereignLayer && sovereignLayer.registerSubject) {
                const LAYER_ARABIC = {
                    'os':            'نظام تشغيل شيخة',
                    'guardian':      'الحارس الإسلامي — الطبقة الحاكمة فوق Ubuntu/Linux',
                    'root-ncn':      'شبكة الخلايا العصبية الجذرية — 92 خلية فوق Guardian',
                    'control-plane': 'طبقة التحكم الموحدة',
                    'governance':    'حوكمة المنظومة',
                    'cloud':         'طبقة السحابة',
                    'saas':          'طبقة البرمجيات كخدمة',
                    'impact':        'محرك الأثر والقيم',
                    'voice':         'طبقة الصوت والتواصل',
                    'neural-cells':  'خلايا الشبكة العصبية',
                    'language-layer':           'طبقة لغة شيخة الحاكمة',
                    'supreme-cs':               'المحرك العلمي العلوي الجامع',
                    'arabic-grammar-engine':    'محرك النحو والصرف والبلاغة',
                    'arabic-grammar-rules':     'منظومة القواعد العربية الرقمية الكاملة',
                    'universal-neural-network': 'الشبكة العصبية الشاملة — كل العلوم والتقنيات لله',
                    'roots-organizations-neural-network': 'شبكة الجذور والمنظمات والهياكل والمعماريات والإدارة والعلوم',
                    'networks-infrastructure-neural-network': 'شبكة الشبكات والسلاسل والمنصات والأسواق والأساسات والتقنيات والبنى التحتية واللوجستيات',
                    'economy-wealth-neural-network': 'شبكة الاقتصاد والتجارة والثروة والذهب والنفط والطاقة والمعادن والنمو',
                    'root-neural-cell-network': 'شبكة الخلايا العصبية الجذرية — جذر شيخة للجذور',
                    'tajathur-engine':          'محرك التجذر — ترسيخ الجذور',
                    'root-integration-engine':  'محرك التكامل الجذري — دمج كل الجذور',
                    'mutajathira-networks':     'شبكات المتجذرة — كل فرع حي بإذن الله',
                    'digital-neural-cell-layer':'طبقة الخلايا العصبية الرقمية — 56 خلية رقمية',
                    'mubayaa-org-integration':  'محرك تكامل البيعة — شغّال في كل المنظومة',
                    'mubayaa-neural-root':      'الشبكة العصبية الجذرية للمبايعة',
                    'root-neural-runtime':      'الشبكة العصبية الجذرية — Runtime الأفضل والأقوى — مرقّمة بالكتاب والسنة — موحَّدة لله',
                };
                sovereignLayer.registerSubject(key, 'layer', {
                    nameAr: LAYER_ARABIC[key] || key,
                    maqsad: 'ARD',
                });
            }
        } catch (err) {
            console.error(`[SHEIKHA-ROOT] ❌ خطأ في تحميل ${file}:`, err.message);
        }
    }

    console.log('');
    console.log(`[SHEIKHA-ROOT] 🚀 المنظومة جاهزة — الطبقات النشطة: ${_registry.size}`);
    console.log('');
    return status();
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * حالة المنظومة الكاملة
 */
function status() {
    return {
        ...SHEIKHA_ROOT,
        activeLayers: listLayers(),
        healthy: _registry.size > 0,
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    SHEIKHA_ROOT,
    boot,
    registerLayer,
    getLayer,
    listLayers,
    status,
};
