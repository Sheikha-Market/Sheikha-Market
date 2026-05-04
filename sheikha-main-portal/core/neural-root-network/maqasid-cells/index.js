// بسم الله الرحمن الرحيم
/**
 * خلايا المقاصد الشرعية الخمس — Maqasid Cells
 * كل مقصد = شبكة فرعية مستقلة من الخلايا
 *
 * المقاصد: حفظ الدين | النفس | العقل | النسل | المال
 * ﴿وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ﴾ — الإسراء:70
 */
'use strict';

const MAQASID = {
    deen: {
        id: 'deen', name: 'حفظ الدين', nameEn: 'Preservation of Religion',
        priority: 1,
        cells: [
            { id: 'deen-aqeedah',    name: 'خلية العقيدة',     weight: 1.0 },
            { id: 'deen-ibadah',     name: 'خلية العبادة',     weight: 1.0 },
            { id: 'deen-shariah',    name: 'خلية الشريعة',     weight: 1.0 },
            { id: 'deen-knowledge',  name: 'خلية العلم الشرعي',weight: 0.9 },
        ],
        prohibits: ['ربا', 'غرر', 'غش', 'احتكار', 'ضرر'],
        requires:  ['أمانة', 'عدل', 'شفافية'],
    },
    nafs: {
        id: 'nafs', name: 'حفظ النفس', nameEn: 'Preservation of Life',
        priority: 2,
        cells: [
            { id: 'nafs-health',    name: 'خلية الصحة',     weight: 1.0 },
            { id: 'nafs-safety',    name: 'خلية السلامة',   weight: 1.0 },
            { id: 'nafs-dignity',   name: 'خلية الكرامة',   weight: 1.0 },
            { id: 'nafs-food',      name: 'خلية الغذاء',    weight: 0.9 },
        ],
        prohibits: ['ضرر', 'استغلال'],
        requires:  ['سلامة', 'كرامة'],
    },
    aql: {
        id: 'aql', name: 'حفظ العقل', nameEn: 'Preservation of Intellect',
        priority: 3,
        cells: [
            { id: 'aql-education',  name: 'خلية التعليم',   weight: 1.0 },
            { id: 'aql-research',   name: 'خلية البحث',     weight: 0.9 },
            { id: 'aql-innovation', name: 'خلية الابتكار',  weight: 0.9 },
            { id: 'aql-media',      name: 'خلية الإعلام',   weight: 0.8 },
        ],
        prohibits: ['تضليل', 'جهل', 'احتكار المعلومات'],
        requires:  ['تعليم', 'شفافية', 'بحث'],
    },
    nasl: {
        id: 'nasl', name: 'حفظ النسل', nameEn: 'Preservation of Progeny',
        priority: 4,
        cells: [
            { id: 'nasl-family',    name: 'خلية الأسرة',    weight: 1.0 },
            { id: 'nasl-youth',     name: 'خلية الشباب',    weight: 0.9 },
            { id: 'nasl-ethics',    name: 'خلية الأخلاق',   weight: 1.0 },
            { id: 'nasl-social',    name: 'خلية المجتمع',   weight: 0.8 },
        ],
        prohibits: ['فاحشة', 'فساد'],
        requires:  ['أخلاق', 'أسرة'],
    },
    maal: {
        id: 'maal', name: 'حفظ المال', nameEn: 'Preservation of Wealth',
        priority: 5,
        cells: [
            { id: 'maal-trade',     name: 'خلية التجارة',   weight: 1.0 },
            { id: 'maal-property',  name: 'خلية الملكية',   weight: 1.0 },
            { id: 'maal-zakat',     name: 'خلية الزكاة',    weight: 1.0 },
            { id: 'maal-waqf',      name: 'خلية الوقف',     weight: 0.9 },
            { id: 'maal-contract',  name: 'خلية العقود',    weight: 1.0 },
        ],
        prohibits: ['ربا', 'غرر', 'غش', 'احتكار', 'إسراف'],
        requires:  ['زكاة', 'أمانة', 'عدل', 'عقد', 'شفافية'],
    },
};

/**
 * تقييم المعاملة من منظور المقاصد
 */
function assessByMaqasid(tx) {
    const results = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, maqsad] of Object.entries(MAQASID)) {
        const violations = maqsad.prohibits.filter(p => {
            const txStr = JSON.stringify(tx).toLowerCase();
            return txStr.includes(p);
        });
        const satisfied = maqsad.requires.filter(r => {
            const txStr = JSON.stringify(tx).toLowerCase();
            return txStr.includes(r);
        });
        const cellScore = (satisfied.length * 1.0 - violations.length * 1.5) / maqsad.cells.length;
        const weight = 1.0 / maqsad.priority;
        results[key] = {
            maqsad: maqsad.name,
            score: parseFloat(cellScore.toFixed(3)),
            violations,
            satisfied,
            cellCount: maqsad.cells.length,
        };
        totalScore  += cellScore * weight;
        totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    return {
        maqasidScores: results,
        overallScore: parseFloat(overallScore.toFixed(4)),
        dominant: Object.entries(results)
            .sort((a, b) => b[1].score - a[1].score)[0]?.[0],
        assessedAt: new Date().toISOString(),
    };
}

module.exports = { MAQASID, assessByMaqasid };
