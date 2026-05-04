// بسم الله الرحمن الرحيم
/**
 * SHARIAH INFERENCE ENGINE — محرك الاستدلال الشرعي
 * يستنبط الأحكام الشرعية من الكتاب والسنة تلقائياً
 *
 * "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل:90
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */
'use strict';

const path = require('path');

// ─── Load Knowledge Base ─────────────────────────────────────────────────────

let quranKG   = null;
let hadithDB  = null;
let maqasid   = null;

try { quranKG  = require('../sovereign-root/quran-knowledge-graph.json'); } catch (_) {}
try { hadithDB = require('../sovereign-root/hadith-embeddings/index'); } catch (_) {}
try { maqasid  = require('../neural-root-network/maqasid-cells/index'); } catch (_) {}

// ─── Inference Rules ─────────────────────────────────────────────────────────

const INFERENCE_RULES = [
    // عقود مالية
    {
        id: 'IR-001', topic: 'عقود',
        pattern: ctx => ctx.type === 'TRANSACTION' || ctx.hasContract,
        quranRef: 'المائدة:1 — أوفوا بالعقود',
        weight: 1.0,
        verdict: 'HALAL',
    },
    // ربا
    {
        id: 'IR-002', topic: 'ربا',
        pattern: ctx => ctx.hasInterest || ctx.interestRate > 0,
        quranRef: 'البقرة:275 — حرّم الربا',
        weight: -2.0,
        verdict: 'HARAM',
    },
    // غرر
    {
        id: 'IR-003', topic: 'غرر',
        pattern: ctx => ctx.hasUncertainty || ctx.priceUnknown,
        quranRef: 'البقرة:275 + مسلم',
        weight: -1.5,
        verdict: 'HARAM',
    },
    // التجارة الحلال
    {
        id: 'IR-004', topic: 'تجارة',
        pattern: ctx => ctx.commodity && !ctx.prohibitedCommodity,
        quranRef: 'البقرة:275 — أحل البيع',
        weight: 1.0,
        verdict: 'HALAL',
    },
    // زكاة
    {
        id: 'IR-005', topic: 'زكاة',
        pattern: ctx => ctx.type === 'ZAKAT' || ctx.zakatCheck,
        quranRef: 'التوبة:103 — خذ من أموالهم',
        weight: 1.5,
        verdict: 'OBLIGATORY',
    },
    // وقف
    {
        id: 'IR-006', topic: 'وقف',
        pattern: ctx => ctx.type === 'WAQF' || ctx.waqfContrib > 0,
        quranRef: 'آل عمران:92 — لن تنالوا البر',
        weight: 1.2,
        verdict: 'RECOMMENDED',
    },
    // عملة رقمية بدون ضمان حقيقي
    {
        id: 'IR-007', topic: 'عملة',
        pattern: ctx => ctx.currency && ctx.backingRatio < 1.0,
        quranRef: 'الرحمن:9 — أقيموا الوزن بالقسط',
        weight: -1.0,
        verdict: 'MAKRUH',
    },
    // عملة مدعومة بذهب/فضة
    {
        id: 'IR-008', topic: 'عملة',
        pattern: ctx => ctx.currency && ctx.goldBacked === true,
        quranRef: 'الرحمن:9 — أقيموا الوزن بالقسط',
        weight: 1.3,
        verdict: 'HALAL',
    },
];

// ─── Main Inference ──────────────────────────────────────────────────────────

/**
 * استدلال الحكم الشرعي
 * @param {object} context — السياق المُبنى من context-builder
 */
function infer(context) {
    const ctx = context || {};
    const matches = [];
    let totalWeight = 0;
    let harmCount   = 0;

    for (const rule of INFERENCE_RULES) {
        try {
            if (rule.pattern(ctx)) {
                matches.push({
                    ruleId:    rule.id,
                    topic:     rule.topic,
                    verdict:   rule.verdict,
                    quranRef:  rule.quranRef,
                    weight:    rule.weight,
                });
                totalWeight += rule.weight;
                if (rule.verdict === 'HARAM') harmCount++;
            }
        } catch (_) {}
    }

    // إذا كان هناك حكم حرام بدليل قطعي → الحكم حرام
    if (harmCount > 0) {
        const harmRules = matches.filter(m => m.verdict === 'HARAM');
        return {
            verdict: 'HARAM',
            confidence: Math.min(0.99, 0.7 + harmCount * 0.15),
            score: -1,
            rulesMatched: matches.length,
            harmRules,
            refs: harmRules.map(r => ({ ruleId: r.ruleId, ref: r.quranRef })),
            processedAt: new Date().toISOString(),
        };
    }

    const avgWeight  = matches.length > 0 ? totalWeight / matches.length : 0;
    const confidence = Math.min(0.95, 0.5 + Math.abs(avgWeight) * 0.2);
    let verdict;
    if (avgWeight > 1.0)  verdict = 'HALAL';
    else if (avgWeight > 0.0) verdict = 'HALAL';
    else if (avgWeight === 0) verdict = 'REVIEW_NEEDED';
    else verdict = 'MAKRUH';

    // ثراء الاستدلال بالكتاب والسنة
    const shariahRefs = matches.slice(0, 3).map(m => ({
        ruleId: m.ruleId,
        ref: m.quranRef,
        topic: m.topic,
    }));

    return {
        verdict,
        confidence: parseFloat(confidence.toFixed(4)),
        score: parseFloat(avgWeight.toFixed(4)),
        rulesMatched: matches.length,
        shariahRefs,
        processedAt: new Date().toISOString(),
    };
}

/**
 * استنباط الفتوى لسؤال
 */
function fatwa(question, context) {
    const ctx = { ...(context || {}), question };
    const result = infer(ctx);

    // البحث في أحاديث ذات الصلة
    let relatedHadiths = [];
    if (hadithDB && question) {
        const words = question.split(/\s+/).filter(w => w.length > 3);
        for (const word of words.slice(0, 3)) {
            relatedHadiths = [...relatedHadiths, ...hadithDB.search(word)];
        }
        relatedHadiths = relatedHadiths.slice(0, 3);
    }

    // البحث في آيات ذات الصلة
    let relatedAyat = [];
    if (quranKG && question) {
        for (const node of (quranKG.economicNodes || [])) {
            if (question.includes(node.topic)) {
                relatedAyat = [...relatedAyat, ...node.ayat.slice(0, 2)];
            }
        }
        relatedAyat = relatedAyat.slice(0, 3);
    }

    return {
        ...result,
        question,
        fatwaType: 'AUTOMATED_DRAFT',
        note: 'هذه فتوى تمهيدية مُولَّدة آلياً — يُلزم مراجعة عالم شرعي متخصص',
        relatedHadiths,
        relatedAyat,
    };
}

module.exports = { infer, fatwa, INFERENCE_RULES };
