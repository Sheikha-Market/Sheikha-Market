// بسم الله الرحمن الرحيم
/**
 * CONTEXT BUILDER — بانٍ السياق الشرعي الذكي
 * يحوّل أي طلب إلى سياق شرعي غني بالآيات والأحاديث
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */
'use strict';

let quranKG  = null;
let hadithDB = null;

try { quranKG  = require('../sovereign-root/quran-knowledge-graph.json'); } catch (_) {}
try { hadithDB = require('../sovereign-root/hadith-embeddings/index'); } catch (_) {}

/**
 * بناء السياق الشرعي من الطلب
 */
function build(type, payload) {
    const p = payload || {};
    const ctx = {
        type,
        ...p,
        shariahRefs:   [],
        quranNodes:    [],
        hadithMatches: [],
        builtAt:       new Date().toISOString(),
    };

    // تحديد الخصائص من نوع الطلب
    if (type === 'TRANSACTION' || type === 'CURRENCY') {
        ctx.hasInterest    = p.interestRate > 0 || p.riba === true;
        ctx.hasUncertainty = p.gharar === true || p.priceUnknown === true;
        ctx.hasContract    = p.contractRef !== undefined || p.type === 'TRANSFER';
        ctx.goldBacked     = p.backingAsset === 'gold' || p.currency === 'SDN';
        ctx.silverBacked   = p.backingAsset === 'silver' || p.currency === 'SDH';
        ctx.backingRatio   = p.backingRatio !== undefined ? p.backingRatio : 1.0;
    }

    if (type === 'ZAKAT') {
        ctx.zakatCheck = true;
    }

    if (type === 'WAQF') {
        ctx.waqfContrib = p.amount || 1;
    }

    // إضافة الآيات ذات الصلة من مستودع المعرفة القرآنية
    if (quranKG) {
        const topics = getTopicsForType(type, ctx);
        for (const topic of topics) {
            const node = quranKG.economicNodes.find(n =>
                n.topic.includes(topic) || n.topicEn?.toLowerCase().includes(topic.toLowerCase())
            );
            if (node) {
                ctx.quranNodes.push(node);
                ctx.shariahRefs.push({
                    source: 'quran',
                    topic: node.topic,
                    ref: node.ayat[0] ? `${getSurahName(node.ayat[0].surah)}:${node.ayat[0].ayah}` : '',
                    text: node.ayat[0]?.text || '',
                    rule: node.rule,
                });
            }
        }
    }

    // إضافة الأحاديث ذات الصلة
    if (hadithDB) {
        const hdTopics = getHadithTopicsForType(type, ctx);
        for (const topic of hdTopics) {
            const hadiths = hadithDB.byTopic(topic);
            if (hadiths.length > 0) {
                ctx.hadithMatches.push(hadiths[0]);
                ctx.shariahRefs.push({
                    source: 'hadith',
                    topic: hadiths[0].topic,
                    ref: hadiths[0].source,
                    text: hadiths[0].arabic,
                    narrator: hadiths[0].narrator,
                });
            }
        }
    }

    ctx.shariahRefs = ctx.shariahRefs.slice(0, 5);  // أقصى 5 مراجع
    return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTopicsForType(type, ctx) {
    const map = {
        TRANSACTION: ctx.hasInterest ? ['الربا'] : ['التجارة الحلال', 'العقود والوفاء'],
        CURRENCY:    ctx.goldBacked ? ['الذهب والفضة'] : ['التجارة الحلال'],
        FATWA:       ['التجارة الحلال', 'العدل والميزان'],
        MARKET:      ['التجارة الحلال', 'العقود والوفاء'],
        ZAKAT:       ['الزكاة'],
        WAQF:        ['الوقف'],
    };
    return map[type] || ['التجارة الحلال'];
}

function getHadithTopicsForType(type, ctx) {
    const map = {
        TRANSACTION: ctx.hasInterest ? ['ربا'] : ['تجارة'],
        CURRENCY:    ['تجارة', 'زكاة'],
        FATWA:       ['تجارة', 'أمانة'],
        MARKET:      ['تجارة'],
        ZAKAT:       ['زكاة'],
        WAQF:        ['أمانة'],
    };
    return map[type] || ['تجارة'];
}

function getSurahName(num) {
    const names = {
        2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
        9: 'التوبة', 17: 'الإسراء', 55: 'الرحمن', 62: 'الجمعة',
    };
    return names[num] || `سورة ${num}`;
}

module.exports = { build };
