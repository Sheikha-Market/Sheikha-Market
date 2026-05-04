/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📖 المُرقمِّن الإسلامي — Sheikha Islamic Digitizer
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * رقمنة المفاهيم التقنية بالكتاب والسنة النبوية الشريفة
 *
 * ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1
 * التوحيد كمبدأ تصميم — كل مكوّن يُرجَع إلى الله
 *
 * الوظائف:
 *   digitize(concept)  — تُعيد أقرب آية أو حديث لأي مفهوم تقني
 *   verify(action)     — تتحقق من توافق أي إجراء مع المبادئ الإسلامية
 *   tag(domain)        — تُعيد آيات مصنّفة بالمجال
 *   getAllDomains()     — قائمة المجالات المتاحة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── قاعدة بيانات الآيات والأحاديث مُصنَّفة بالمجالات ────────────────────────
const ISLAMIC_DB = {
    technology: [
        {
            ref: 'البقرة: 31',
            arabic: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾',
            meaning: 'العلم والتعلم والمعرفة — أساس التقنية',
            keywords: ['تقنية', 'برمجة', 'معرفة', 'علم', 'ذكاء', 'بيانات', 'technology', 'knowledge', 'AI']
        },
        {
            ref: 'الأنبياء: 80',
            arabic: '﴿ وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ ﴾',
            meaning: 'الصناعة والحرفة والتصنيع',
            keywords: ['صناعة', 'تصنيع', 'أتمتة', 'engineering', 'manufacturing', 'automation']
        },
        {
            ref: 'النمل: 40',
            arabic: '﴿ أَنَا آتِيكَ بِهِ قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ ﴾',
            meaning: 'السرعة والإنجاز الفوري — مشابه لسرعة المعالجة',
            keywords: ['سرعة', 'أداء', 'معالجة', 'speed', 'performance', 'processing', 'compute']
        },
        {
            ref: 'الحديد: 25',
            arabic: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾',
            meaning: 'الموارد المادية والأجهزة',
            keywords: ['hardware', 'server', 'أجهزة', 'بنية تحتية', 'infrastructure', 'metal']
        }
    ],
    security: [
        {
            ref: 'الأنفال: 60',
            arabic: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾',
            meaning: 'الاستعداد والحماية والقوة',
            keywords: ['أمان', 'حماية', 'تشفير', 'جدار حماية', 'security', 'encryption', 'firewall', 'defense']
        },
        {
            ref: 'الحجرات: 12',
            arabic: '﴿ وَلَا تَجَسَّسُوا ﴾',
            meaning: 'حماية الخصوصية وعدم التجسس',
            keywords: ['خصوصية', 'privacy', 'zero-trust', 'تجسس', 'surveillance', 'monitoring']
        },
        {
            ref: 'الحجرات: 6',
            arabic: '﴿ فَتَبَيَّنُوا ﴾',
            meaning: 'التحقق والتثبت قبل الحكم',
            keywords: ['تحقق', 'مصادقة', 'authentication', 'verification', 'validation', 'IDS', 'IPS']
        },
        {
            ref: 'الأحزاب: 72',
            arabic: '﴿ إِنَّا عَرَضْنَا الْأَمَانَةَ ﴾',
            meaning: 'الأمانة في حفظ البيانات والمعلومات',
            keywords: ['أمانة', 'بيانات', 'حفظ', 'audit', 'integrity', 'data protection', 'trustworthy']
        }
    ],
    commerce: [
        {
            ref: 'البقرة: 275',
            arabic: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾',
            meaning: 'حِلّ البيع وتحريم الربا',
            keywords: ['بيع', 'تجارة', 'سوق', 'معاملات', 'commerce', 'trade', 'market', 'payment']
        },
        {
            ref: 'المطففين: 1',
            arabic: '﴿ وَيْلٌ لِّلْمُطَفِّفِينَ ﴾',
            meaning: 'العدل في الميزان والكيل — لا غش ولا تلاعب',
            keywords: ['عدل', 'ميزان', 'وزن', 'fairness', 'fraud detection', 'integrity', 'accuracy']
        },
        {
            ref: 'المائدة: 2',
            arabic: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾',
            meaning: 'التعاون والتكامل بين الأطراف',
            keywords: ['تعاون', 'تكامل', 'شراكة', 'integration', 'partnership', 'collaboration', 'API']
        },
        {
            ref: 'الحديث: متفق عليه',
            arabic: '"لا غش في الإسلام"',
            meaning: 'تحريم الغش في التجارة',
            keywords: ['غش', 'fraud', 'تزوير', 'تلاعب', 'manipulation', 'deception']
        }
    ],
    knowledge: [
        {
            ref: 'العلق: 1',
            arabic: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾',
            meaning: 'القراءة والتعلم أول الوحي',
            keywords: ['تعلم', 'قراءة', 'بحث', 'learning', 'reading', 'research', 'education', 'training']
        },
        {
            ref: 'الزمر: 9',
            arabic: '﴿ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ﴾',
            meaning: 'فضل العلم والعلماء',
            keywords: ['علم', 'فضل', 'جودة', 'excellence', 'quality', 'expertise', 'skill']
        },
        {
            ref: 'الحديث: البيهقي',
            arabic: '"إن الله يحب إذا عمل أحدكم عملاً أن يتقنه"',
            meaning: 'الإتقان والجودة في العمل',
            keywords: ['إتقان', 'جودة', 'quality', 'precision', 'excellence', 'CI/CD', 'testing']
        }
    ],
    justice: [
        {
            ref: 'النساء: 58',
            arabic: '﴿ وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ ﴾',
            meaning: 'العدل في الحكم والقرارات',
            keywords: ['عدل', 'حوكمة', 'قرار', 'justice', 'governance', 'decision', 'fairness', 'algorithm']
        },
        {
            ref: 'الرحمن: 7-8',
            arabic: '﴿ وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانَ ﴾',
            meaning: 'التوازن والعدل في كل شيء',
            keywords: ['توازن', 'balance', 'load balancing', 'fairness', 'equilibrium']
        }
    ],
    development: [
        {
            ref: 'التوبة: 105',
            arabic: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ ﴾',
            meaning: 'الشفافية والمساءلة في العمل — كل عمل مرئي لله',
            keywords: ['تطوير', 'عمل', 'تقارير', 'شفافية', 'development', 'reporting', 'transparency', 'logging', 'audit']
        },
        {
            ref: 'هود: 61',
            arabic: '﴿ وَاسْتَعْمَرَكُمْ فِيهَا ﴾',
            meaning: 'الاستعمار والبناء والتطوير',
            keywords: ['تطوير', 'بناء', 'deployment', 'infrastructure', 'build', 'DevOps']
        },
        {
            ref: 'الكهف: 66',
            arabic: '﴿ هَلْ أَتَّبِعُكَ عَلَى أَن تُعَلِّمَنِ مِمَّا عُلِّمْتَ رُشْدًا ﴾',
            meaning: 'التعلم والإرشاد والمنتورينغ',
            keywords: ['تدريب', 'تعلم آلي', 'machine learning', 'training', 'mentoring', 'AI', 'neural']
        }
    ],
    vision: [
        {
            ref: 'الأعراف: 185',
            arabic: '﴿ أَوَلَمْ يَنظُرُوا فِي مَلَكُوتِ السَّمَاوَاتِ وَالْأَرْضِ ﴾',
            meaning: 'النظر والتأمل والرؤية الشاملة',
            keywords: ['رؤية', 'تحليل صور', 'vision', 'computer vision', 'OCR', 'image', 'detection', 'satellite']
        },
        {
            ref: 'النور: 35',
            arabic: '﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ﴾',
            meaning: 'النور والإضاءة والوضوح',
            keywords: ['نور', 'إضاءة', 'light', 'clarity', 'visibility', 'transparency', 'illumination']
        }
    ],
    neural: [
        {
            ref: 'البقرة: 31',
            arabic: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾',
            meaning: 'العلم الشامل — أساس الشبكات العصبية',
            keywords: ['شبكة عصبية', 'neural network', 'AI', 'deep learning', 'machine learning', 'عصبي']
        },
        {
            ref: 'الإخلاص: 1',
            arabic: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
            meaning: 'التوحيد — وحدة النظام ومركزيته',
            keywords: ['توحيد', 'تكامل', 'unification', 'unity', 'centralization', 'root', 'جذر']
        },
        {
            ref: 'فصلت: 53',
            arabic: '﴿ سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ ﴾',
            meaning: 'الاستكشاف والاكتشاف — هدف الذكاء الصناعي',
            keywords: ['اكتشاف', 'استكشاف', 'تحليل', 'discovery', 'exploration', 'analysis', 'inference']
        }
    ],
    communication: [
        {
            ref: 'المائدة: 2',
            arabic: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾',
            meaning: 'التعاون والتواصل البنّاء',
            keywords: ['تواصل', 'اتصالات', 'شبكة', 'communication', 'network', 'API', 'messaging', 'bus']
        },
        {
            ref: 'الحجرات: 13',
            arabic: '﴿ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾',
            meaning: 'التعارف والتواصل بين الأطراف',
            keywords: ['تعارف', 'integration', 'interoperability', 'protocol', 'تكامل']
        }
    ],
    sustainability: [
        {
            ref: 'الأعراف: 31',
            arabic: '﴿ وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ ﴾',
            meaning: 'الاعتدال وعدم الإسراف — كفاءة الموارد',
            keywords: ['كفاءة', 'استدامة', 'efficiency', 'sustainability', 'optimization', 'resource', 'energy']
        },
        {
            ref: 'الحديث: صحيح مسلم',
            arabic: '"إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة: صدقة جارية..."',
            meaning: 'الأثر الدائم والمستدام',
            keywords: ['استدامة', 'sustainability', 'legacy', 'impact', 'long-term', 'باقيات']
        }
    ]
};

// ─── الأفعال المحظورة شرعاً ──────────────────────────────────────────────────
const PROHIBITED_ACTIONS = [
    { action: 'riba', keywords: ['ربا', 'فائدة', 'interest', 'usury'], ref: 'البقرة: 275', verdict: 'محرم' },
    { action: 'gharar', keywords: ['غرر', 'مجهول', 'gambling', 'qimar', 'مقامرة'], ref: 'الحديث', verdict: 'محرم' },
    { action: 'spying', keywords: ['تجسس', 'spy', 'surveillance', 'wiretap'], ref: 'الحجرات: 12', verdict: 'محرم' },
    { action: 'fraud', keywords: ['غش', 'fraud', 'deception', 'manipulation', 'تزوير'], ref: 'الحديث', verdict: 'محرم' },
    { action: 'harm', keywords: ['ضرر', 'إيذاء', 'harm', 'damage', 'attack'], ref: 'الحديث: لا ضرر', verdict: 'محرم' }
];

// ─── المبادئ الإسلامية الخمسة للتحقق ─────────────────────────────────────────
const ISLAMIC_PRINCIPLES = [
    { id: 'no_harm', nameAr: 'لا ضرر ولا ضرار', ref: 'الحديث النبوي', weight: 1.0 },
    { id: 'truthfulness', nameAr: 'الصدق والأمانة', ref: 'الأحزاب: 72', weight: 0.9 },
    { id: 'justice', nameAr: 'العدل والإنصاف', ref: 'النساء: 58', weight: 0.95 },
    { id: 'transparency', nameAr: 'الشفافية والوضوح', ref: 'التوبة: 105', weight: 0.85 },
    { id: 'public_benefit', nameAr: 'المصلحة العامة (مقاصد الشريعة)', ref: 'القواعد الفقهية', weight: 0.9 }
];

// ─── Class المُرقمِّن الإسلامي ────────────────────────────────────────────────
class SheikhaIslamicDigitizer {
    constructor() {
        this.db = ISLAMIC_DB;
        this.prohibitedActions = PROHIBITED_ACTIONS;
        this.principles = ISLAMIC_PRINCIPLES;
        this.version = '1.0.0';
    }

    /**
     * digitize(concept) — تُعيد أقرب آية أو حديث لأي مفهوم تقني
     * @param {string} concept — المفهوم التقني (عربي أو إنجليزي)
     * @returns {{ ref, arabic, meaning, domain, score }}
     */
    digitize(concept) {
        if (!concept || typeof concept !== 'string') {
            return this._fallback();
        }
        const lower = concept.toLowerCase();
        let bestMatch = null;
        let bestScore = -1;
        let bestDomain = null;

        for (const [domain, entries] of Object.entries(this.db)) {
            for (const entry of entries) {
                const score = this._matchScore(lower, entry.keywords);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = entry;
                    bestDomain = domain;
                }
            }
        }

        if (!bestMatch || bestScore === 0) {
            return this._fallback(concept);
        }

        return {
            ref: bestMatch.ref,
            arabic: bestMatch.arabic,
            meaning: bestMatch.meaning,
            domain: bestDomain,
            score: Math.round(bestScore * 100) / 100,
            concept,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * verify(action) — تتحقق من توافق أي إجراء مع المبادئ الإسلامية
     * @param {string|object} action — الإجراء للفحص
     * @returns {{ halal: boolean, score: number, violations: [], recommendations: [] }}
     */
    verify(action) {
        const text = typeof action === 'string' ? action : JSON.stringify(action);
        const lower = text.toLowerCase();
        const violations = [];
        const recommendations = [];

        // فحص الأفعال المحظورة
        for (const prohibited of this.prohibitedActions) {
            const hit = prohibited.keywords.some(k => lower.includes(k.toLowerCase()));
            if (hit) {
                violations.push({
                    action: prohibited.action,
                    verdict: prohibited.verdict,
                    ref: prohibited.ref
                });
            }
        }

        // حساب درجة الامتثال
        const baseScore = violations.length === 0 ? 1.0 : Math.max(0, 1 - violations.length * 0.3);
        const principleScores = this.principles.map(p => ({
            ...p,
            passed: this._checkPrinciple(p.id, lower)
        }));

        const totalWeight = principleScores.reduce((s, p) => s + p.weight, 0);
        const passedWeight = principleScores.filter(p => p.passed).reduce((s, p) => s + p.weight, 0);
        const principleScore = passedWeight / totalWeight;

        const finalScore = (baseScore * 0.6 + principleScore * 0.4);

        if (violations.length > 0) {
            recommendations.push('يرجى مراجعة الإجراء مع العالم المختص قبل التنفيذ');
        }
        if (finalScore > 0.8) {
            recommendations.push('الإجراء يبدو متوافقاً مع المبادئ الإسلامية');
        }

        return {
            halal: violations.length === 0,
            score: Math.round(finalScore * 100) / 100,
            violations,
            principleScores: principleScores.map(p => ({ id: p.id, nameAr: p.nameAr, passed: p.passed })),
            recommendations,
            bismillah: 'بسم الله الرحمن الرحيم',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * tag(domain) — تُعيد كل الآيات في مجال معيّن
     * @param {string} domain
     * @returns {Array}
     */
    tag(domain) {
        const entries = this.db[domain];
        if (!entries) return [];
        return entries.map(e => ({ ...e, domain }));
    }

    /**
     * getAllDomains() — قائمة المجالات المتاحة
     */
    getAllDomains() {
        return Object.keys(this.db);
    }

    /**
     * getRandomVerse(domain?) — آية عشوائية من مجال محدد أو عشوائي
     */
    getRandomVerse(domain = null) {
        const domains = domain ? [domain] : this.getAllDomains();
        const allEntries = domains.flatMap(d => (this.db[d] || []).map(e => ({ ...e, domain: d })));
        if (allEntries.length === 0) return this._fallback();
        return allEntries[Math.floor(Math.random() * allEntries.length)];
    }

    /**
     * getStatus() — حالة المُرقمِّن
     */
    getStatus() {
        const totalVerses = Object.values(this.db).reduce((s, arr) => s + arr.length, 0);
        return {
            name: 'Sheikha Islamic Digitizer',
            nameAr: 'المُرقمِّن الإسلامي',
            version: this.version,
            domains: this.getAllDomains().length,
            totalVerses,
            principles: this.principles.length,
            prohibitedActions: this.prohibitedActions.length,
            quranRef: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1',
            timestamp: new Date().toISOString()
        };
    }

    // ─── دوال مساعدة خاصة ────────────────────────────────────────────────────

    _matchScore(text, keywords) {
        let score = 0;
        for (const kw of keywords) {
            if (text.includes(kw.toLowerCase())) {
                score += 1 / keywords.length;
            }
        }
        return score;
    }

    _checkPrinciple(principleId, text) {
        const harmWords = ['harm', 'ضرر', 'attack', 'exploit', 'destroy'];
        const fraudWords = ['fraud', 'غش', 'fake', 'deception', 'manipulate'];
        switch (principleId) {
            case 'no_harm': return !harmWords.some(w => text.includes(w));
            case 'truthfulness': return !fraudWords.some(w => text.includes(w));
            case 'justice': return true; // افتراضي — يمكن تطويره
            case 'transparency': return true;
            case 'public_benefit': return true;
            default: return true;
        }
    }

    _fallback(concept = '') {
        return {
            ref: 'الإخلاص: 1',
            arabic: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
            meaning: 'التوحيد — أصل كل شيء',
            domain: 'general',
            score: 0,
            concept,
            timestamp: new Date().toISOString()
        };
    }
}

// ─── تصدير نسخة واحدة (Singleton) ────────────────────────────────────────────
const digitizerInstance = new SheikhaIslamicDigitizer();

module.exports = digitizerInstance;
module.exports.SheikhaIslamicDigitizer = SheikhaIslamicDigitizer;
