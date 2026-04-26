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
        const rootsOrgMod    = getLayer('roots-organizations-neural-network');
        const networksInfraNN = require('../lib/sheikha-networks-infrastructure-neural-network');
        // تكامل كامل مع منظومة الجذور والمنظمات
        const externalNetworks = rootsOrgMod
            ? { 'roots-organizations': rootsOrgMod.unifiedNetwork || rootsOrgMod }
            : {};
        networksInfraNN.init(externalNetworks);
        registerLayer('networks-infrastructure-neural-network', networksInfraNN);
        console.log('[SHEIKHA-ROOT] 🕸️  شبكة الشبكات والسلاسل والمنصات والأسواق والأساسات والتقنيات والبنى واللوجستيات مُفعَّلة — 9 شبكات × 16 خلية تكاملية — كامل فيما بينهم جميعاً');
    } catch (err) {
        console.error('[SHEIKHA-ROOT] ❌ خطأ في تحميل شبكة الشبكات والبنى التحتية:', err.message);
    }

    const bootOrder = [
        { key: 'os',            file: 'sheikha-os.js' },
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
                    'control-plane': 'طبقة التحكم الموحدة',
                    'governance':    'حوكمة المنظومة',
                    'cloud':         'طبقة السحابة',
                    'saas':          'طبقة البرمجيات كخدمة',
                    'impact':        'محرك الأثر والقيم',
                    'voice':         'طبقة الصوت والتواصل',
                    'neural-cells':  'خلايا الشبكة العصبية',
                    'language-layer':       'طبقة لغة شيخة الحاكمة',
                    'supreme-cs':           'المحرك العلمي العلوي الجامع',
                    'arabic-grammar-engine':    'محرك النحو والصرف والبلاغة',
                    'arabic-grammar-rules':     'منظومة القواعد العربية الرقمية الكاملة',
                    'universal-neural-network': 'الشبكة العصبية الشاملة — كل العلوم والتقنيات لله',
                    'roots-organizations-neural-network': 'شبكة الجذور والمنظمات والهياكل والمعماريات والإدارة والعلوم',
                    'networks-infrastructure-neural-network': 'شبكة الشبكات والسلاسل والمنصات والأسواق والأساسات والتقنيات والبنى التحتية واللوجستيات',
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
