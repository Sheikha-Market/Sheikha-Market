// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     SHEIKHA NEURAL ROOT NETWORK (SNRN) — شبكة الخلايا الجذرية العصبية     ║
 * ║     المخ الرقمي السيادي المتجذّر في الكتاب والسنة                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:31
 *
 * المكونات:
 *   • خلايا القرآن الكريم  — 8 خلايا (اقتصاد + عدل + أمانة + زكاة + وقف + عقود + ربا + غرر)
 *   • خلايا السنة النبوية  — 5 خلايا (تجارة + قبض + ضرر + صدق + أمانة)
 *   • خلايا المقاصد الخمس — 5 خلايا (دين + نفس + عقل + نسل + مال)
 *   • خلية التوحيد العليا  — 1 خلية سيادية (الجذر الحاكم)
 *
 * أعلى طبقةً من: Bitcoin AI / Siren AI / Crypto Networks
 * المرجع: الكتاب والسنة — لا قانون فوقهما
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ─── Load Dependencies ────────────────────────────────────────────────────────

let quranGraph = null;
let hadithDB   = null;
let maqasid    = null;
let halalValidator = null;

try {
    quranGraph = require('../sovereign-root/quran-knowledge-graph.json');
} catch (_) { console.warn('[SNRN] ⚠️ Quran KG not loaded'); }

try {
    hadithDB = require('../sovereign-root/hadith-embeddings/index');
} catch (_) { console.warn('[SNRN] ⚠️ Hadith DB not loaded'); }

try {
    maqasid = require('./maqasid-cells/index');
} catch (_) { console.warn('[SNRN] ⚠️ Maqasid cells not loaded'); }

try {
    halalValidator = require('./halal-validator');
} catch (_) { console.warn('[SNRN] ⚠️ Halal Validator not loaded'); }

// ─── Cell Definitions ─────────────────────────────────────────────────────────

const QURAN_CELLS = [
    { id: 'qc-riba',     name: 'خلية الربا',      rule: 'PROHIBITED', nodeRef: 'node:riba',       weight: 1.0 },
    { id: 'qc-trade',    name: 'خلية التجارة',    rule: 'PERMITTED',  nodeRef: 'node:trade',      weight: 1.0 },
    { id: 'qc-gharar',   name: 'خلية الغرر',      rule: 'PROHIBITED', nodeRef: 'node:gharar',     weight: 1.0 },
    { id: 'qc-justice',  name: 'خلية العدل',      rule: 'REQUIRED',   nodeRef: 'node:justice',    weight: 1.0 },
    { id: 'qc-zakat',    name: 'خلية الزكاة',     rule: 'OBLIGATORY', nodeRef: 'node:zakat',      weight: 1.0 },
    { id: 'qc-waqf',     name: 'خلية الوقف',      rule: 'RECOMMENDED',nodeRef: 'node:waqf',       weight: 0.9 },
    { id: 'qc-gold',     name: 'خلية الذهب والفضة',rule: 'STANDARD',  nodeRef: 'node:gold-silver',weight: 0.9 },
    { id: 'qc-contract', name: 'خلية العقود',     rule: 'REQUIRED',   nodeRef: 'node:contract',   weight: 1.0 },
];

const SUNNAH_CELLS = [
    { id: 'sc-trade',   name: 'خلية التجارة النبوية', topic: 'تجارة', weight: 1.0 },
    { id: 'sc-gharar',  name: 'خلية الغرر النبوية',   topic: 'غرر',   weight: 1.0 },
    { id: 'sc-riba',    name: 'خلية الربا النبوية',   topic: 'ربا',   weight: 1.0 },
    { id: 'sc-zakat',   name: 'خلية الزكاة النبوية',  topic: 'زكاة',  weight: 1.0 },
    { id: 'sc-honesty', name: 'خلية الأمانة',         topic: 'أمانة', weight: 1.0 },
];

const MAQASID_CELLS = [
    { id: 'mc-deen', name: 'حفظ الدين',  maqsad: 'deen',  weight: 1.0 },
    { id: 'mc-nafs', name: 'حفظ النفس',  maqsad: 'nafs',  weight: 1.0 },
    { id: 'mc-aql',  name: 'حفظ العقل',  maqsad: 'aql',   weight: 1.0 },
    { id: 'mc-nasl', name: 'حفظ النسل',  maqsad: 'nasl',  weight: 0.8 },
    { id: 'mc-maal', name: 'حفظ المال',  maqsad: 'maal',  weight: 1.0 },
];

const SUPREME_CELL = {
    id: 'supreme-tawheed',
    name: 'خلية التوحيد العليا',
    principle: 'لا إله إلا الله — كل شيء لله',
    weight: 2.0,
    overrides: true,
};

// ─── State ────────────────────────────────────────────────────────────────────

let _ready     = false;
let _callCount = 0;
let _startedAt = null;

// ─── Neural Activation Function ──────────────────────────────────────────────

/**
 * دالة التفعيل العصبي الإسلامية
 * تعطي وزناً أعلى للمحظورات (للحماية) ووزناً إيجابياً للواجبات
 */
function activate(cell, input) {
    const base = typeof input === 'number' ? input : 1.0;
    switch (cell.rule || 'PERMITTED') {
        case 'PROHIBITED':  return base * cell.weight * -1.5;   // إشارة سلبية قوية
        case 'OBLIGATORY':  return base * cell.weight * 1.5;    // واجب — تعزيز قوي
        case 'REQUIRED':    return base * cell.weight * 1.2;    // مطلوب
        case 'RECOMMENDED': return base * cell.weight * 0.8;    // مستحب
        case 'STANDARD':    return base * cell.weight * 1.0;    // معيار
        default:            return base * cell.weight * 1.0;
    }
}

// ─── Core Inference ──────────────────────────────────────────────────────────

/**
 * تشغيل الاستدلال العصبي الشرعي
 * @param {object} context — سياق المعاملة أو الاستفسار
 * @returns {object} — النتيجة الشرعية مع الدرجة والمراجع
 */
function infer(context) {
    _callCount++;

    const ctx = context || {};
    const signals = [];
    const refs = [];

    // ① تفعيل خلايا القرآن
    // الخلايا المحظورة تُفعَّل فقط إذا كان السياق يحمل تلك الصفة
    const prohibitionFlags = {
        'qc-riba':   !!(ctx.hasInterest || ctx.riba   === true || (ctx.interestRate > 0)),
        'qc-gharar': !!(ctx.hasUncertainty || ctx.gharar === true || ctx.priceUnknown === true),
    };

    for (const cell of QURAN_CELLS) {
        const relevant = quranGraph
            ? quranGraph.economicNodes.find(n => n.id === cell.nodeRef)
            : null;

        // الخلايا المحظورة: تُفعَّل فقط عند وجود المشكلة في السياق
        let input;
        if (cell.rule === 'PROHIBITED') {
            input = prohibitionFlags[cell.id] ? 1.0 : 0.0;
        } else {
            input = relevant ? 1.0 : 0.5;
        }

        if (input === 0.0) continue;   // تجاهل — لا دليل على المشكلة

        const signal = activate(cell, input);
        signals.push(signal);
        if (Math.abs(signal) > 0.5) {
            refs.push({ type: 'quran', cell: cell.name, signal: signal.toFixed(3),
                ayahCount: relevant ? relevant.ayat.length : 0 });
        }
    }

    // ② تفعيل خلايا السنة
    // خلايا المحظورات تُفعَّل فقط عند وجود المشكلة في السياق
    const sunnahProhibitionTopics = { 'غرر': prohibitionFlags['qc-gharar'], 'ربا': prohibitionFlags['qc-riba'] };
    for (const cell of SUNNAH_CELLS) {
        const isProhibition = sunnahProhibitionTopics[cell.topic] !== undefined;
        if (isProhibition && !sunnahProhibitionTopics[cell.topic]) continue; // لا توجد مشكلة

        const hadiths = hadithDB ? hadithDB.byTopic(cell.topic) : [];
        const input = hadiths.length > 0 ? 1.0 : 0.5;
        // إشارة سلبية لخلايا المحظورات في السنة
        const signal = isProhibition ? -(cell.weight * input * 1.5) : (cell.weight * input);
        signals.push(signal);
        if (hadiths.length > 0) {
            refs.push({ type: 'hadith', cell: cell.name, hadithCount: hadiths.length,
                signal: signal.toFixed(3) });
        }
    }

    // ③ تفعيل خلايا المقاصد
    for (const cell of MAQASID_CELLS) {
        const maqNodes = quranGraph ? quranGraph.maqasidIndex[cell.maqsad] : [];
        const input = maqNodes && maqNodes.length > 0 ? 1.0 : 0.5;
        const signal = cell.weight * input;
        signals.push(signal);
    }

    // ④ تفعيل الخلية العليا — التوحيد
    signals.push(SUPREME_CELL.weight);

    // ⑤ حساب الدرجة الكلية
    const positiveSum = signals.filter(s => s > 0).reduce((a, b) => a + b, 0);
    const negativeSum = Math.abs(signals.filter(s => s < 0).reduce((a, b) => a + b, 0));
    const score = (positiveSum - negativeSum) / signals.length;
    const normalized = Math.max(-1, Math.min(1, score));

    // ⑥ الحكم الشرعي
    // إذا وُجد ربا أو غرر → حرام قطعاً بصرف النظر عن باقي الإشارات
    const hasRibaOrGharar = prohibitionFlags['qc-riba'] || prohibitionFlags['qc-gharar'];
    let verdict, confidence;
    if (hasRibaOrGharar || negativeSum > 2.0) {
        verdict = 'HARAM';
        confidence = hasRibaOrGharar ? 0.99 : Math.min(0.99, negativeSum / (positiveSum + negativeSum + 0.001));
    } else if (normalized > 0.5) {
        verdict = 'HALAL';
        confidence = Math.min(0.99, normalized);
    } else if (normalized > 0.0) {
        verdict = 'MAKRUH';
        confidence = 0.5 + normalized * 0.3;
    } else {
        verdict = 'REVIEW_NEEDED';
        confidence = 0.3;
    }

    return {
        verdict,
        confidence: parseFloat(confidence.toFixed(4)),
        score: parseFloat(normalized.toFixed(4)),
        cellsActivated: signals.length,
        quranCells: QURAN_CELLS.length,
        sunnahCells: SUNNAH_CELLS.length,
        maqasidCells: MAQASID_CELLS.length,
        refs: refs.slice(0, 5),
        supremeCell: SUPREME_CELL.principle,
        processedAt: new Date().toISOString(),
    };
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

function init() {
    if (_ready) return status();
    _startedAt = new Date().toISOString();
    _ready = true;
    console.info('[SNRN] 🧠 شبكة الخلايا الجذرية العصبية جاهزة —',
        QURAN_CELLS.length + SUNNAH_CELLS.length + MAQASID_CELLS.length + 1, 'خلية نشطة');
    return status();
}

function status() {
    return {
        network: 'SNRN — Sheikha Neural Root Network',
        version: '1.0.0',
        ready: _ready,
        totalCells: QURAN_CELLS.length + SUNNAH_CELLS.length + MAQASID_CELLS.length + 1,
        layers: {
            quran:   { cells: QURAN_CELLS.length,   description: 'خلايا القرآن الكريم' },
            sunnah:  { cells: SUNNAH_CELLS.length,   description: 'خلايا السنة النبوية' },
            maqasid: { cells: MAQASID_CELLS.length,  description: 'خلايا المقاصد الشرعية' },
            supreme: { cells: 1,                     description: 'خلية التوحيد العليا' },
        },
        callCount: _callCount,
        startedAt: _startedAt,
        superiority: 'أعلى من Bitcoin + Siren AI — المرجع: الكتاب والسنة',
    };
}

module.exports = { init, infer, status, QURAN_CELLS, SUNNAH_CELLS, MAQASID_CELLS, SUPREME_CELL };
