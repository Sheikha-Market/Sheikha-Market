/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║             SHEIKHA ISLAMIC DATABASE — قاعدة بيانات إسلامية موحدة          ║
 * ║         آيات قرآنية + أحاديث نبوية مفهرسة لتغذية محركات الذكاء            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق:١
 *
 * هذه القاعدة هي المرجعية الشرعية لكل قرار تقني في منظومة شيخة.
 * كل محرك ذكاء يُلزَم بالرجوع إليها قبل إصدار أي حكم أو توصية.
 */

'use strict';

// ─── المقاصد الشرعية الخمس + تطوير الأرض ─────────────────────────────────────

const MAQASID = {
    DEEN: {
        id: 'DEEN',
        nameAr: 'حفظ الدين',
        nameEn: 'Preservation of Religion',
        verses: [
            { ref: 'الأنعام:١٥٣',  text: 'وَأَنَّ هَٰذَا صِرَاطِي مُسْتَقِيمًا فَاتَّبِعُوهُ' },
            { ref: 'آل عمران:١٩',  text: 'إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ' },
            { ref: 'المائدة:٣',    text: 'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ' },
        ],
        hadiths: [
            { ref: 'البخاري:١',    text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى' },
            { ref: 'مسلم:٤٩',     text: 'من رأى منكم منكرًا فليغيّره بيده' },
        ],
    },
    NAFS: {
        id: 'NAFS',
        nameAr: 'حفظ النفس',
        nameEn: 'Preservation of Life',
        verses: [
            { ref: 'المائدة:٣٢',   text: 'مَن قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍ فِي الْأَرْضِ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا' },
            { ref: 'البقرة:١٩٥',   text: 'وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ' },
        ],
        hadiths: [
            { ref: 'ابن ماجه:٢٣٤٠', text: 'لا ضرر ولا ضرار' },
        ],
    },
    AQL: {
        id: 'AQL',
        nameAr: 'حفظ العقل',
        nameEn: 'Preservation of Intellect',
        verses: [
            { ref: 'طه:١١٤',       text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا' },
            { ref: 'المجادلة:١١',  text: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ' },
            { ref: 'العلق:١',      text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ' },
        ],
        hadiths: [
            { ref: 'ابن ماجه:٢٢٤', text: 'طلب العلم فريضة على كل مسلم' },
        ],
    },
    NASL: {
        id: 'NASL',
        nameAr: 'حفظ النسل',
        nameEn: 'Preservation of Lineage',
        verses: [
            { ref: 'النساء:٩',     text: 'وَلْيَخْشَ الَّذِينَ لَوْ تَرَكُوا مِنْ خَلْفِهِمْ ذُرِّيَّةً ضِعَافًا خَافُوا عَلَيْهِمْ' },
            { ref: 'الفرقان:٧٤',   text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ' },
        ],
        hadiths: [
            { ref: 'مسلم:١٤٦٧',   text: 'تزوجوا الودود الولود فإني مكاثر بكم الأنبياء يوم القيامة' },
        ],
    },
    MAL: {
        id: 'MAL',
        nameAr: 'حفظ المال',
        nameEn: 'Preservation of Wealth',
        verses: [
            { ref: 'البقرة:٢٧٥',   text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
            { ref: 'النساء:٢٩',    text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ' },
            { ref: 'البقرة:٢٨٠',   text: 'وَإِن كَانَ ذُو عُسْرَةٍ فَنَظِرَةٌ إِلَىٰ مَيْسَرَةٍ' },
        ],
        hadiths: [
            { ref: 'الترمذي:١٢٠٩', text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء' },
            { ref: 'أبو داود:٣٤٥٨', text: 'البيعان بالخيار ما لم يتفرقا' },
        ],
    },
    ARD: {
        id: 'ARD',
        nameAr: 'تطوير الأرض',
        nameEn: 'Development of the Earth',
        verses: [
            { ref: 'البقرة:٣٠',    text: 'إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً' },
            { ref: 'الأنبياء:٨٠',  text: 'وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم' },
            { ref: 'الذاريات:٢٢',  text: 'وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ' },
        ],
        hadiths: [
            { ref: 'البخاري:٢٣٢٠', text: 'إن قامت الساعة وبيد أحدكم فسيلة فإن استطاع ألا تقوم حتى يغرسها فليغرسها' },
            { ref: 'أحمد:١٢٩٠٢',  text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه' },
        ],
    },
};

// ─── مبادئ التجارة الإسلامية ──────────────────────────────────────────────────

const TRADE_PRINCIPLES = [
    {
        id: 'NO_RIBA',
        nameAr: 'تحريم الربا',
        rule: 'يُحظر أي عقد يتضمن فائدة ربوية',
        verse: { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا' },
    },
    {
        id: 'TRANSPARENCY',
        nameAr: 'الشفافية والإفصاح',
        rule: 'يجب الإفصاح الكامل عن حالة البضاعة وسعرها الحقيقي',
        hadith: { ref: 'البخاري:٢٠٨٢', text: 'البيّعان بالخيار ما لم يتفرقا، فإن صدقا وبيّنا بورك لهما في بيعهما' },
    },
    {
        id: 'NO_GHARAR',
        nameAr: 'تحريم الغرر',
        rule: 'يُحظر بيع المجهول أو المبهم',
        hadith: { ref: 'مسلم:١٥١٣', text: 'نهى رسول الله ﷺ عن بيع الغرر' },
    },
    {
        id: 'MUTUAL_CONSENT',
        nameAr: 'التراضي',
        rule: 'كل عقد يجب أن يقوم على الرضا المتبادل',
        verse: { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
    },
    {
        id: 'ZAKAT',
        nameAr: 'الزكاة',
        rule: 'زكاة المال واجبة عند بلوغ النصاب وحولان الحول',
        verse: { ref: 'التوبة:١٠٣', text: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا' },
    },
    {
        id: 'NO_HARM',
        nameAr: 'لا ضرر ولا ضرار',
        rule: 'لا يجوز إلحاق الضرر بالطرف الآخر',
        hadith: { ref: 'ابن ماجه:٢٣٤٠', text: 'لا ضرر ولا ضرار' },
    },
];

// ─── أسماء الله الحسنى المرتبطة بطبقات النظام ────────────────────────────────

const ASMA_HUSNA_SYSTEM = [
    { name: 'العليم',   role: 'AI Knowledge Layer'   },
    { name: 'الخبير',   role: 'Analytics Engine'     },
    { name: 'الحكيم',   role: 'Decision Engine'      },
    { name: 'العدل',    role: 'Compliance Engine'    },
    { name: 'الحفيظ',   role: 'Security Engine'      },
    { name: 'الرقيب',   role: 'Monitoring Engine'    },
    { name: 'الوكيل',   role: 'Agent Framework'      },
    { name: 'الرزاق',   role: 'Trade & Market Engine'},
    { name: 'الشهيد',   role: 'Audit Trail'          },
    { name: 'المحيط',   role: 'Network Layer'        },
];

// ─── دوال البحث والتحقق ───────────────────────────────────────────────────────

/**
 * الحصول على المقصد الشرعي بمعرّفه
 * @param {string} maqsadId  DEEN | NAFS | AQL | NASL | MAL | ARD
 * @returns {object|null}
 */
function getMaqsad(maqsadId) {
    return MAQASID[maqsadId] || null;
}

/**
 * البحث في الآيات بكلمة مفتاحية
 * @param {string} keyword
 * @returns {Array<{maqsad: string, verse: object}>}
 */
function searchVerses(keyword) {
    const results = [];
    for (const [maqsadId, maqsad] of Object.entries(MAQASID)) {
        for (const verse of maqsad.verses) {
            if (verse.text.includes(keyword) || verse.ref.includes(keyword)) {
                results.push({ maqsad: maqsadId, verse });
            }
        }
    }
    return results;
}

/**
 * الحصول على مبدأ تجاري بمعرّفه
 * @param {string} principleId
 * @returns {object|null}
 */
function getTradePrinciple(principleId) {
    return TRADE_PRINCIPLES.find((p) => p.id === principleId) || null;
}

/**
 * التحقق الشرعي السريع للعملية التجارية
 * @param {{ hasRiba?: boolean, hasGharar?: boolean, hasMutualConsent?: boolean }} operation
 * @returns {{ compliant: boolean, violations: string[], references: object[] }}
 */
function verifyCompliance(operation) {
    const violations = [];
    const references = [];

    if (operation.hasRiba) {
        violations.push('ربا');
        references.push(getTradePrinciple('NO_RIBA'));
    }
    if (operation.hasGharar) {
        violations.push('غرر');
        references.push(getTradePrinciple('NO_GHARAR'));
    }
    // undefined أو null تعني غياب التراضي — الأصل اشتراط التراضي الصريح
    if (!operation.hasMutualConsent) {
        violations.push('غياب التراضي');
        references.push(getTradePrinciple('MUTUAL_CONSENT'));
    }

    return {
        compliant: violations.length === 0,
        violations,
        references: references.filter(Boolean),
    };
}

/**
 * توليد مرجع شرعي لاستجابة API
 * @param {string} maqsadId
 * @returns {{ maqsad: string, verse: object, hadith: object|null }|null}
 */
function buildShariaRef(maqsadId) {
    const maqsad = getMaqsad(maqsadId);
    if (!maqsad) return null;
    return {
        maqsad: maqsad.nameAr,
        verse:  maqsad.verses[0],
        hadith: maqsad.hadiths[0] || null,
    };
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    MAQASID,
    TRADE_PRINCIPLES,
    ASMA_HUSNA_SYSTEM,
    getMaqsad,
    searchVerses,
    getTradePrinciple,
    verifyCompliance,
    buildShariaRef,
};
