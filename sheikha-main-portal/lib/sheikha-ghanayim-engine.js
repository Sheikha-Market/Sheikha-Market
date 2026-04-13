/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  منظومة شيخة — محرك الغنائم والثروة الحلال                                ║
 * ║  SHEIKHA GHANAYIM (WEALTH & SPOILS) ENGINE                                ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  اغتنام الفرص + تحقيق الثروات الحلال + أعظم الأغنياء في التاريخ           ║
 * ║  "وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ" — القصص:٧٧        ║
 * ║  "وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا" — القصص:٧٧                       ║
 * ║  "يَا أَيُّهَا الَّذِينَ آمَنُوا هَلْ أَدُلُّكُمْ عَلَى تِجَارَةٍ       ║
 * ║   تُنجِيكُم مِّنْ عَذَابٍ أَلِيمٍ" — الصف:١٠                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  ولا حول ولا قوة إلا بالله العلي العظيم                                    ║
 * ║  اللهم صلّ وسلّم على نبينا محمد والحمد لله رب العالمين                    ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  المالك: سلمان أحمد بن سلمان الراجح | 1031605270 | market@sheikha.top     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
'use strict';

class SheikhaGhanayimEngine {
    constructor() {
        this.name    = 'محرك الغنائم والثروة الحلال — منظومة شيخة';
        this.nameEn  = 'Sheikha Ghanayim Wealth & Spoils Engine';
        this.version = '1.0.0';
        this.owner   = 'سلمان أحمد بن سلمان الراجح — 1031605270';
        this.startedAt = new Date().toISOString();

        this._quranFoundations    = this._initQuranFoundations();
        this._islamicWealthy      = this._initIslamicWealthy();
        this._wealthPillars       = this._initWealthPillars();
        this._opportunityMatrix   = this._initOpportunityMatrix();
        this._wealthStrategies    = this._initWealthStrategies();
        this._zakatEngine         = this._initZakatEngine();
        this._wealthSectors       = this._initWealthSectors();
        this._historicalWealth    = this._initHistoricalWealth();
        this._wealthKPIs          = this._initWealthKPIs();

        // سجل الغنائم الحي
        this._liveGains = [];
        this._totalWealthScore = 0;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. الأساس القرآني والنبوي للغنيمة والثروة الحلال
    // ═══════════════════════════════════════════════════════════════════════
    _initQuranFoundations() {
        return [
            {
                id: 'QF-01',
                type: 'quran',
                surah: 'القصص', ayah: '77',
                text: 'وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ ۖ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا ۖ وَأَحْسِن كَمَا أَحْسَنَ اللَّهُ إِلَيْكَ',
                meaning: 'التوازن بين الدنيا والآخرة — المؤمن يطلب الثروة الحلال ولا يتركها',
                principle: 'BALANCED_WEALTH'
            },
            {
                id: 'QF-02',
                type: 'quran',
                surah: 'الأنفال', ayah: '69',
                text: 'فَكُلُوا مِمَّا غَنِمْتُمْ حَلَالًا طَيِّبًا ۚ وَاتَّقُوا اللَّهَ ۚ إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ',
                meaning: 'إباحة الغنيمة الحلال مع التقوى — الأكل الحلال من الكسب المشروع',
                principle: 'HALAL_GAINS'
            },
            {
                id: 'QF-03',
                type: 'quran',
                surah: 'الصف', ayah: '10-11',
                text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا هَلْ أَدُلُّكُمْ عَلَىٰ تِجَارَةٍ تُنجِيكُم مِّنْ عَذَابٍ أَلِيمٍ ۝ تُؤْمِنُونَ بِاللَّهِ وَرَسُولِهِ',
                meaning: 'أعظم تجارة = الإيمان والجهاد — ثم تجارة الدنيا وسيلة لذلك',
                principle: 'DIVINE_TRADE_FIRST'
            },
            {
                id: 'QF-04',
                type: 'quran',
                surah: 'البقرة', ayah: '275',
                text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
                meaning: 'البيع الحلال مصدر الثروة المباركة — الربا يمحق البركة',
                principle: 'HALAL_TRADE'
            },
            {
                id: 'QF-05',
                type: 'quran',
                surah: 'النساء', ayah: '29',
                text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ',
                meaning: 'التراضي أساس الصفقات — لا إكراه ولا غش في المعاملات',
                principle: 'MUTUAL_CONSENT'
            },
            {
                id: 'QF-06',
                type: 'quran',
                surah: 'الجمعة', ayah: '10',
                text: 'فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ',
                meaning: 'السعي في طلب الرزق عبادة — العمل والتجارة بعد العبادة',
                principle: 'TRADE_AS_WORSHIP'
            },
            {
                id: 'QF-07',
                type: 'quran',
                surah: 'الأنفال', ayah: '1',
                text: 'يَسْأَلُونَكَ عَنِ الْأَنفَالِ ۖ قُلِ الْأَنفَالُ لِلَّهِ وَالرَّسُولِ',
                meaning: 'كل غنيمة ملك لله أولاً — ثم يُعطى ذوي الحقوق حقهم',
                principle: 'DIVINE_OWNERSHIP_FIRST'
            },
            {
                id: 'QF-08',
                type: 'quran',
                surah: 'الحشر', ayah: '7',
                text: 'كَيْ لَا يَكُونَ دُولَةً بَيْنَ الْأَغْنِيَاءِ مِنكُمْ',
                meaning: 'توزيع الثروة على المجتمع — لا تتركز عند فئة واحدة',
                principle: 'WEALTH_DISTRIBUTION'
            },
            {
                id: 'QF-09',
                type: 'hadith',
                narrator: 'البخاري ومسلم',
                text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء',
                meaning: 'التاجر الأمين في درجة الأنبياء والشهداء — الصدق يرفع المرتبة',
                principle: 'HONEST_TRADER'
            },
            {
                id: 'QF-10',
                type: 'hadith',
                narrator: 'البيهقي',
                text: 'إن الله يحب المؤمن المحترف',
                meaning: 'الله يحب صاحب الحرفة والصنعة — العمل والإنتاج محبوب إلى الله',
                principle: 'LOVE_OF_WORK'
            },
            {
                id: 'QF-11',
                type: 'hadith',
                narrator: 'الترمذي',
                text: 'ما أكل أحد طعاماً قط خيراً من أن يأكل من عمل يده',
                meaning: 'أفضل الكسب ما كان من العمل — شرف الكسب بالجهد والمهارة',
                principle: 'EARNED_WEALTH'
            },
            {
                id: 'QF-12',
                type: 'hadith',
                narrator: 'متفق عليه',
                text: 'البيّعان بالخيار ما لم يتفرقا، فإن صَدَقا وبيَّنا بُورِكَ لهما في بيعِهما',
                meaning: 'الصدق في البيع يجلب البركة — البركة = نمو حقيقي ومستدام',
                principle: 'BARAKAH_IN_TRADE'
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. أعظم الأغنياء في التاريخ الإسلامي — نماذج يُحتذى بها
    // ═══════════════════════════════════════════════════════════════════════
    _initIslamicWealthy() {
        return [
            {
                id: 'IW-01',
                name: 'عبدالرحمن بن عوف رضي الله عنه',
                era: 'صدر الإسلام',
                died: '32 هـ',
                wealth: 'أحد أغنى الصحابة — مات عن ذهب قُطِّع بالفؤوس',
                wealthEstimate: '50,000 دينار ذهبي + إبل وغنم بالآلاف',
                sources: ['التجارة', 'المضاربة', 'الزراعة'],
                lessons: [
                    'جاء المدينة مهاجراً بلا شيء — وأصبح أغنى الصحابة',
                    'دخل السوق باستثمار صغير جداً فأضاعفه',
                    'أنفق نصف ثروته في الجيوش الإسلامية',
                    'كان يسبق الصفوف في الصدقة والبذل'
                ],
                islamicModel: 'نموذج التاجر الصادق الجواد — ثروة + سخاء',
                quranRef: 'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ — النور:37'
            },
            {
                id: 'IW-02',
                name: 'خديجة بنت خويلد رضي الله عنها',
                era: 'قبل الإسلام وصدره',
                wealth: 'أغنى امرأة في قريش — أموالها تضاهي أثرياء الجزيرة العربية',
                sources: ['التجارة الدولية', 'رحلة الشتاء والصيف', 'توظيف التجار'],
                lessons: [
                    'امرأة أدارت إمبراطورية تجارية في عصر مهيمن عليه الرجال',
                    'وظّفت النبي ﷺ وأحسنت الاستثمار في الكفاءات',
                    'أنفقت كل مالها في سبيل الإسلام لما يُحتاج إليه',
                    'أول من أسلم وضحّت بثروتها للدعوة'
                ],
                islamicModel: 'نموذج المرأة المديرة الكريمة — ريادة + تضحية',
                quranRef: 'وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ — التوبة:71'
            },
            {
                id: 'IW-03',
                name: 'عثمان بن عفان رضي الله عنه',
                era: 'صدر الإسلام',
                died: '35 هـ',
                wealth: 'أحد أثرى الصحابة — جهّز جيش العسرة وحده',
                wealthEstimate: '30,000 دينار ذهبي + أراضٍ وعقارات',
                sources: ['التجارة', 'العقارات', 'الاستيراد والتصدير'],
                lessons: [
                    'جهّز جيش العسرة (غزوة تبوك) بـ ٩٥٠ ناقة + ٥٠ فرساً + ١٠٠٠ دينار',
                    'اشترى بئر رومة بأمواله الخاصة وجعلها لله',
                    'فتح السوق الإسلامي ووسّع التجارة الدولية',
                    'ثروته كانت وقفاً عاماً على الأمة'
                ],
                islamicModel: 'نموذج المنفق في سبيل الله — ثروة + إنفاق استراتيجي',
                quranRef: 'مَّن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا — البقرة:245'
            },
            {
                id: 'IW-04',
                name: 'الزبير بن العوام رضي الله عنه',
                era: 'صدر الإسلام',
                died: '36 هـ',
                wealth: '٥١.٢ مليون درهم عند وفاته — من أكثر الصحابة مالاً',
                sources: ['التجارة', 'الأراضي', 'الاستثمار العقاري'],
                lessons: [
                    'أول من سلّ السيف في سبيل الله وأول من جمع ثروة ضخمة',
                    'تقدير ثروته عند وفاته: ٥١.٢ مليون درهم',
                    '١١ منزل في المدينة + ٢ في البصرة + ١ في مصر + ١ في الكوفة',
                    'جمع بين الجهاد والتجارة والثروة الحلال'
                ],
                islamicModel: 'نموذج المجاهد التاجر — قوة + ثروة + جهاد',
                quranRef: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ — الأنفال:60'
            },
            {
                id: 'IW-05',
                name: 'طلحة بن عبيدالله رضي الله عنه',
                era: 'صدر الإسلام',
                died: '36 هـ',
                wealth: 'ثروته ٣٠ مليون درهم — بذل في الصدقات والجهاد',
                sources: ['التجارة الدولية', 'الأراضي', 'الاستثمار'],
                lessons: [
                    'كان يُدير تجارة بين العراق والحجاز والشام',
                    'يوزع أرباح التجارة بين فقراء المسلمين',
                    'مات وتركته ٣٠ مليون درهم أنفقت في الخير'
                ],
                islamicModel: 'نموذج التاجر الكريم الجامع — جمع وأنفق بتوازن',
                quranRef: 'الَّذِينَ يُنفِقُونَ أَمْوَالَهُم بِاللَّيْلِ وَالنَّهَارِ — البقرة:274'
            },
            {
                id: 'IW-06',
                name: 'قارون',
                era: 'زمن موسى عليه السلام',
                type: 'نموذج تحذيري',
                wealth: 'مفاتيح كنوزه تُثقل العصبة من الرجال',
                lessons: [
                    'نسب ثروته لنفسه ونسي فضل الله',
                    'أشر وبطر وظلم',
                    'خسف الله به الأرض',
                    'الثروة بلا شكر لله وبلا إنفاق = هلاك'
                ],
                islamicModel: 'نموذج تحذيري — الثروة بلا تقوى = هلاك',
                quranRef: 'إِنَّ قَارُونَ كَانَ مِن قَوْمِ مُوسَىٰ فَبَغَىٰ عَلَيْهِمْ — القصص:76'
            },
            {
                id: 'IW-07',
                name: 'سليمان بن داود عليه السلام',
                era: 'الأنبياء',
                type: 'نموذج المُلك والثروة الممنوحة من الله',
                wealth: 'أعظم ملك في التاريخ — مملكة تشمل الجن والإنس والطير والريح',
                lessons: [
                    'طلب من الله ملكاً لا ينبغي لأحد من بعده — فأعطاه الله',
                    'استخدم ثروته وملكه لعبادة الله وإعمار الأرض',
                    'بنى المسجد الأقصى ونشر الإسلام',
                    'لم يبطر ولم يغترّ — قال "هذا من فضل ربي"'
                ],
                islamicModel: 'نموذج الملك الشاكر — ثروة إلهية + شكر + استخدام أعظم',
                quranRef: 'قَالَ هَٰذَا مِن فَضْلِ رَبِّي لِيَبْلُوَنِي أَأَشْكُرُ أَمْ أَكْفُرُ — النمل:40'
            },
            {
                id: 'IW-08',
                name: 'داود عليه السلام',
                era: 'الأنبياء',
                type: 'نموذج الكسب بالعمل',
                wealth: 'ملك وثروة واسعة — يأكل من عمل يده',
                lessons: [
                    'كان يأكل من عمل يديه (صنعة الدروع)',
                    'الكسب بالعمل والصنعة أفضل أنواع الكسب',
                    'الملك + العمل اليدوي = نموذج التواضع'
                ],
                islamicModel: 'نموذج العامل الملك — كسب العمل + ملك الله',
                hadith: 'ما أكل أحد طعاماً قط خيراً من أن يأكل من عمل يده، وإن نبي الله داود عليه السلام كان يأكل من عمل يده'
            },
            {
                id: 'IW-09',
                name: 'عبدالرحمن بن مهدي (التاجر العالمي الإسلامي)',
                era: 'العصر العباسي',
                type: 'التاجر العالمي',
                wealth: 'امتدت تجارته من الأندلس إلى الصين',
                sources: ['طريق الحرير', 'التوابل', 'الحرير', 'المعادن'],
                lessons: [
                    'أول من وصّل شبكة تجارية من الأطلسي للمحيط الهادئ',
                    'حمل العلم والإسلام مع البضاعة',
                    'دخل كل سوق بالأخلاق قبل السلعة'
                ],
                islamicModel: 'نموذج التاجر العالمي المسلم — انتشار + ثروة + دعوة'
            },
            {
                id: 'IW-10',
                name: 'منسا موسى (سلطان مالي المسلم)',
                era: '1280-1337 م',
                type: 'أغنى شخص في التاريخ',
                wealth: 'يُقدَّر بـ $400 مليار دولار بالقيمة الحالية — أغنى شخص في تاريخ البشرية',
                sources: ['الذهب', 'الملح', 'التجارة عبر الصحراء'],
                lessons: [
                    'بنى مساجد ومدارس في كل مكان زاره',
                    'رحلته للحج أفاضت ذهباً على طريق طوله آلاف الكيلومترات',
                    'الثروة استخدمها في نشر الإسلام والعلم',
                    'أمبراطوريته دولة إسلامية قوية حكمت غرب أفريقيا'
                ],
                islamicModel: 'نموذج السلطان الغني المنفق — أغنى التاريخ + إسلام + إنفاق',
                note: 'أغنى إنسان في تاريخ البشرية كله — وكان مسلماً'
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. أركان الثروة الحلال — Wealth Pillars
    // ═══════════════════════════════════════════════════════════════════════
    _initWealthPillars() {
        return [
            {
                id: 'WP-01', rank: 1,
                nameAr: 'الحلال — النقاء الكامل',
                nameEn: 'Purity (Halal Only)',
                description: 'كل مصدر ثروة يجب أن يكون حلالاً طيباً — صفر ربا + صفر غش + صفر حرام',
                quranRef: 'فَكُلُوا مِمَّا غَنِمْتُمْ حَلَالًا طَيِّبًا — الأنفال:69',
                kpi: { target: 100, unit: '%', name: 'نسبة الحلال' },
                code: 'HALAL_PURITY'
            },
            {
                id: 'WP-02', rank: 2,
                nameAr: 'الإتقان — جودة المنتج',
                nameEn: 'Excellence (Itqan)',
                description: 'إتقان العمل يرفع قيمة المنتج ويجذب الثروة — الجودة = مضاعفة الأرباح',
                hadith: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — البيهقي',
                kpi: { target: 95, unit: '%', name: 'مؤشر الجودة' },
                code: 'ITQAN_QUALITY'
            },
            {
                id: 'WP-03', rank: 3,
                nameAr: 'الصدق — الأمانة التجارية',
                nameEn: 'Truthfulness & Trustworthiness',
                description: 'الصدق يجلب البركة ويبني الثقة = عملاء دائمون = ثروة مستدامة',
                hadith: 'البيّعان إن صدقا وبيّنا بُورِكَ لهما في بيعِهما — متفق عليه',
                kpi: { target: 100, unit: '%', name: 'مؤشر الثقة' },
                code: 'SIDQ_TRUST'
            },
            {
                id: 'WP-04', rank: 4,
                nameAr: 'التنويع — محفظة الثروة المتوازنة',
                nameEn: 'Diversification',
                description: 'لا تضع بيضك في سلة واحدة — تنويع مصادر الدخل = أمان واستدامة',
                principle: 'تجارة + عقارات + معادن + صناعة + زراعة + استثمار شرعي',
                kpi: { target: 7, unit: 'مصادر', name: 'عدد مصادر الدخل' },
                code: 'DIVERSIFICATION'
            },
            {
                id: 'WP-05', rank: 5,
                nameAr: 'الاغتنام — اقتناص الفرص',
                nameEn: 'Opportunity Seizing (Ightinam)',
                description: 'اغتنم الفرص قبل فواتها — المؤمن لا يفوته خيرٌ في متناوله',
                hadith: 'اغتنم خمساً قبل خمس: شبابك قبل هرمك، وصحتك قبل سقمك — الحاكم',
                kpi: { target: 80, unit: '%', name: 'معدل اقتناص الفرص' },
                code: 'IGHTINAM'
            },
            {
                id: 'WP-06', rank: 6,
                nameAr: 'الزكاة — محرك التضخيم الإلهي',
                nameEn: 'Zakat (Divine Multiplier)',
                description: 'الزكاة تُطهر المال وتُنميه — 2.5% زكاة تجلب بركة تفوق الـ 100%',
                quranRef: 'يَمْحَقُ اللَّهُ الرِّبَا وَيُرْبِي الصَّدَقَاتِ — البقرة:276',
                kpi: { target: 2.5, unit: '%', name: 'نسبة الزكاة' },
                code: 'ZAKAT_MULTIPLIER'
            },
            {
                id: 'WP-07', rank: 7,
                nameAr: 'الاستثمار المستدام',
                nameEn: 'Sustainable Investment',
                description: 'استثمار الثروة في مشاريع تنتج قيمة حقيقية — لا مضاربة ولا فقاعات',
                principle: 'القيمة الحقيقية = الإنتاج + الخدمة + العلم + البناء',
                kpi: { target: 15, unit: '%', name: 'عائد الاستثمار السنوي' },
                code: 'SUSTAINABLE_INVESTMENT'
            },
            {
                id: 'WP-08', rank: 8,
                nameAr: 'الإنفاق الاستراتيجي',
                nameEn: 'Strategic Spending',
                description: 'الإنفاق في محله يُضاعف العوائد — جيوش + علم + بنية + إنسان',
                quranRef: 'وَمَا تُنفِقُوا مِنْ خَيْرٍ يُوَفَّ إِلَيْكُمْ وَأَنتُمْ لَا تُظْلَمُونَ — البقرة:272',
                kpi: { target: 30, unit: '%', name: 'نسبة الإنفاق الاستراتيجي' },
                code: 'STRATEGIC_SPENDING'
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. مصفوفة اقتناص الفرص — Opportunity Matrix
    // ═══════════════════════════════════════════════════════════════════════
    _initOpportunityMatrix() {
        return {
            title: 'مصفوفة اقتناص الفرص — غنائم شيخة',
            categories: [
                {
                    id: 'OM-01',
                    nameAr: 'فرص المعادن والسكراب',
                    nameEn: 'Metals & Scrap Opportunities',
                    icon: '⚙️',
                    opportunities: [
                        { name: 'سوق السكراب السعودي', size: '15 مليار ريال/سنة', growth: '8%/سنة', readiness: 'عالية', code: 'SAUDI_SCRAP' },
                        { name: 'معادن نيوم', size: '500+ مليار ريال', growth: 'ضخم', readiness: 'متوسطة', code: 'NEOM_METALS' },
                        { name: 'سوق المعادن الخليجي', size: '80 مليار ريال', growth: '12%/سنة', readiness: 'عالية', code: 'GULF_METALS' },
                        { name: 'تصدير السكراب عالمياً', size: '$700 مليار/سنة', growth: '6%/سنة', readiness: 'متوسطة', code: 'GLOBAL_SCRAP' }
                    ]
                },
                {
                    id: 'OM-02',
                    nameAr: 'فرص رؤية 2030',
                    nameEn: 'Vision 2030 Opportunities',
                    icon: '🏗️',
                    opportunities: [
                        { name: 'مشروع ذا لاين', size: '500 مليار دولار', growth: 'هائل', readiness: 'متوسطة', code: 'THE_LINE' },
                        { name: 'مشروع أمالا', size: '100 مليار دولار', growth: 'كبير', readiness: 'متوسطة', code: 'AMAALA' },
                        { name: 'مشروع البحر الأحمر', size: '50 مليار دولار', growth: 'كبير', readiness: 'عالية', code: 'RED_SEA' },
                        { name: 'تطوير التعدين السعودي', size: '75 مليار دولار', growth: '15%/سنة', readiness: 'عالية', code: 'SAUDI_MINING' }
                    ]
                },
                {
                    id: 'OM-03',
                    nameAr: 'فرص التقنية والذكاء الاصطناعي',
                    nameEn: 'Tech & AI Opportunities',
                    icon: '🤖',
                    opportunities: [
                        { name: 'سوق التجارة الإلكترونية الخليجي', size: '50 مليار دولار', growth: '25%/سنة', readiness: 'عالية', code: 'GULF_ECOM' },
                        { name: 'منصات الدفع الإسلامية', size: '20 مليار دولار', growth: '30%/سنة', readiness: 'عالية', code: 'ISLAMIC_FINTECH' },
                        { name: 'الذكاء الاصطناعي للتجارة', size: '15 مليار دولار', growth: '40%/سنة', readiness: 'متوسطة', code: 'AI_TRADE' }
                    ]
                },
                {
                    id: 'OM-04',
                    nameAr: 'فرص الاقتصاد الإسلامي',
                    nameEn: 'Islamic Economy Opportunities',
                    icon: '☪️',
                    opportunities: [
                        { name: 'سوق المنتجات الحلال العالمي', size: '$2 تريليون/سنة', growth: '8%/سنة', readiness: 'عالية', code: 'HALAL_MARKET' },
                        { name: 'الصيرفة الإسلامية', size: '$3 تريليون أصول', growth: '15%/سنة', readiness: 'متوسطة', code: 'ISLAMIC_BANKING' },
                        { name: 'الصكوك والتمويل الإسلامي', size: '$800 مليار', growth: '12%/سنة', readiness: 'متوسطة', code: 'SUKUK' },
                        { name: 'السياحة الحلال', size: '$300 مليار/سنة', growth: '10%/سنة', readiness: 'عالية', code: 'HALAL_TOURISM' }
                    ]
                },
                {
                    id: 'OM-05',
                    nameAr: 'فرص التجارة الدولية الإسلامية',
                    nameEn: 'International Islamic Trade',
                    icon: '🌍',
                    opportunities: [
                        { name: 'تجارة OIC (57 دولة)', size: '$3 تريليون/سنة', growth: '10%/سنة', readiness: 'متوسطة', code: 'OIC_TRADE' },
                        { name: 'الممر الاقتصادي السعودي-الهندي', size: '$150 مليار', growth: 'ضخم', readiness: 'منخفضة', code: 'INDIA_CORRIDOR' },
                        { name: 'الشراكات الأفريقية', size: '$200 مليار/سنة', growth: '12%/سنة', readiness: 'متوسطة', code: 'AFRICA_TRADE' }
                    ]
                }
            ],
            totalOpportunities: 16,
            totalMarketSize: '$7+ تريليون دولار',
            priorityScore: {
                immediate: ['SAUDI_SCRAP', 'GULF_METALS', 'GULF_ECOM', 'HALAL_MARKET'],
                shortTerm: ['SAUDI_MINING', 'RED_SEA', 'ISLAMIC_FINTECH', 'HALAL_TOURISM'],
                longTerm: ['NEOM_METALS', 'THE_LINE', 'OIC_TRADE', 'INDIA_CORRIDOR']
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. استراتيجيات الثروة الأقوى — Power Wealth Strategies
    // ═══════════════════════════════════════════════════════════════════════
    _initWealthStrategies() {
        return [
            {
                id: 'WS-01',
                nameAr: 'استراتيجية عبدالرحمن بن عوف',
                nameEn: 'Ibn Awf Strategy',
                model: 'ابدأ صغيراً + تاجر بذكاء + ضاعف + تصدق',
                steps: [
                    '1. ابدأ برأس مال صغير — الشراء والبيع في السوق المحلي',
                    '2. ابنِ سمعة الصدق — العملاء يعودون للتاجر الأمين',
                    '3. وسّع شبكة علاقاتك التجارية',
                    '4. استثمر الأرباح في تجارة أكبر',
                    '5. تصدق مما ربحت — البركة تُضاعف ما تبقى'
                ],
                islamicKPI: { wealthGrowth: '100x', barakahScore: 95, zakatRate: 2.5 },
                codePhrase: 'IBNAWF_MODEL'
            },
            {
                id: 'WS-02',
                nameAr: 'استراتيجية المضاربة الإسلامية',
                nameEn: 'Islamic Mudarabah Strategy',
                model: 'جمع رأس المال (ربّ مال) + الكفاءة التجارية (مضارب) = ربح مشترك',
                structure: {
                    rabb_al_mal: 'صاحب المال — يوفر التمويل بلا فائدة',
                    mudarib: 'المضارب — يدير العمل والتجارة',
                    profit_split: 'توزيع الأرباح بحسب الاتفاق (مثلاً: 60% للمضارب / 40% لربّ المال)',
                    loss: 'الخسارة من رأس المال فقط — المضارب يخسر جهده'
                },
                advantages: ['لا ربا', 'توزيع عادل للمخاطر', 'يُطلق الكفاءات المحرومة من رأس المال'],
                codePhrase: 'MUDARABAH_MODEL'
            },
            {
                id: 'WS-03',
                nameAr: 'استراتيجية المرابحة التجارية',
                nameEn: 'Islamic Murabahah Strategy',
                model: 'شراء البضاعة بسعر + إضافة هامش ربح معلوم = بيع حلال',
                steps: [
                    'حدد السلعة التي يحتاجها المشتري',
                    'اشترِها بنفسك وامتلكها فعلاً',
                    'بعها بسعر معلوم للمشتري (نقداً أو أجلاً)',
                    'الهامش = ربحك الحلال'
                ],
                useCases: ['تمويل المعادن والسكراب', 'شراء المعدات والآلات', 'تمويل المشاريع'],
                codePhrase: 'MURABAHAH_MODEL'
            },
            {
                id: 'WS-04',
                nameAr: 'استراتيجية الذهب والفضة',
                nameEn: 'Gold & Silver Reserve Strategy',
                model: 'احتفظ بجزء من ثروتك في ذهب وفضة — الملاذ الآمن الأبدي',
                principles: [
                    'الذهب والفضة: المال الحقيقي منذ الأزل',
                    '10-20% من المحفظة في ذهب = حماية من التضخم',
                    'ذهب المعادن = فرصة تجارية + تخزين قيمة',
                    'الفضة: أرخص من الذهب وفرصة نمو أكبر'
                ],
                islamicRef: 'يَوْمَ يُحْمَىٰ عَلَيْهَا فِي نَارِ جَهَنَّمَ فَتُكْوَىٰ بِهَا جِبَاهُهُمْ — التوبة:35 (تحذير من الكنز بلا زكاة)',
                codePhrase: 'GOLD_SILVER_RESERVE'
            },
            {
                id: 'WS-05',
                nameAr: 'استراتيجية الاقتصاد الدائري',
                nameEn: 'Circular Economy Strategy',
                model: 'السكراب والنفايات = مادة خام = إنتاج = ربح + بيئة',
                cycle: ['جمع السكراب' , 'التصنيف والتقييم', 'التشغيل والإنتاج', 'البيع بسعر أعلى', 'إعادة الاستثمار'],
                opportunity: 'سوق السكراب العالمي $700+ مليار سنوياً — شيخة بوابته الإسلامية',
                codePhrase: 'CIRCULAR_ECONOMY'
            },
            {
                id: 'WS-06',
                nameAr: 'استراتيجية التجميع والتوزيع',
                nameEn: 'Aggregation & Distribution Strategy',
                model: 'اجمع من كثيرين + وزّع على كثيرين = عمولة على كل صفقة',
                formula: 'منظومة شيخة = منصة وساطة = 0.5-2% عمولة على حجم $700B = مليارات',
                steps: [
                    'اجمع عروض المورّدين (سكراب + معادن)',
                    'اعرضها على المشترين (مصانع + مشاريع)',
                    'احصل على عمولة كل صفقة',
                    'ضاعف الصفقات = ضاعف الأرباح'
                ],
                codePhrase: 'AGGREGATION_DISTRIBUTION'
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. محرك الزكاة — حاسبة الزكاة والتطهير المالي
    // ═══════════════════════════════════════════════════════════════════════
    _initZakatEngine() {
        return {
            title: 'محرك الزكاة — تطهير المال وتنميته',
            quranRef: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا — التوبة:103',
            nisab: {
                gold: { grams: 85, description: 'نصاب الذهب: 85 جرام ذهب = حد الزكاة' },
                silver: { grams: 595, description: 'نصاب الفضة: 595 جرام فضة = حد الزكاة' },
                cash: { currency: 'SAR', note: 'تُحسب الزكاة على النقود بمعادل نصاب الفضة' }
            },
            rates: {
                tradingGoods: { rate: 0.025, name: 'عروض التجارة', description: 'زكاة البضائع التجارية = 2.5%' },
                cash: { rate: 0.025, name: 'النقود', description: 'زكاة النقود الحاضرة = 2.5%' },
                gold: { rate: 0.025, name: 'الذهب', description: 'زكاة الذهب = 2.5%' },
                silver: { rate: 0.025, name: 'الفضة', description: 'زكاة الفضة = 2.5%' },
                crops: { rate: 0.05, name: 'الزراعة المروية', description: 'الزراعة المروية = 5%' },
                rainfedCrops: { rate: 0.10, name: 'الزراعة البعلية', description: 'الزراعة البعلية = 10%' },
                minerals: { rate: 0.20, name: 'المعادن والركاز', description: 'زكاة المعادن = 20% (الخُمس)' }
            },
            beneficiaries: [
                { nameAr: 'الفقراء', quran: 'الفقراء والمساكين' },
                { nameAr: 'المساكين', quran: 'الفقراء والمساكين' },
                { nameAr: 'العاملون عليها', quran: 'وَالْعَامِلِينَ عَلَيْهَا' },
                { nameAr: 'المؤلفة قلوبهم', quran: 'وَالْمُؤَلَّفَةِ قُلُوبُهُمْ' },
                { nameAr: 'الرقاب', quran: 'وَفِي الرِّقَابِ' },
                { nameAr: 'الغارمون', quran: 'وَالْغَارِمِينَ' },
                { nameAr: 'في سبيل الله', quran: 'وَفِي سَبِيلِ اللَّهِ' },
                { nameAr: 'ابن السبيل', quran: 'وَابْنِ السَّبِيلِ' }
            ],
            promise: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ — رواه مسلم'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7. قطاعات الثروة — Wealth Sectors
    // ═══════════════════════════════════════════════════════════════════════
    _initWealthSectors() {
        return [
            {
                id: 'WS-SEC-01',
                nameAr: 'المعادن والسكراب',
                nameEn: 'Metals & Scrap',
                globalMarket: '$700B+/year',
                saudiMarket: '~60B SAR/year',
                sheikhaRole: 'بوابة وسوق وتسعير ولوجستيات',
                wealthPotential: 'عالي جداً',
                score: 95
            },
            {
                id: 'WS-SEC-02',
                nameAr: 'العقارات والبنية التحتية',
                nameEn: 'Real Estate & Infrastructure',
                globalMarket: '$326T أصول',
                saudiMarket: '~1.5T SAR',
                sheikhaRole: 'ربط مشاريع البناء بموردي المعادن',
                wealthPotential: 'عالي جداً',
                score: 90
            },
            {
                id: 'WS-SEC-03',
                nameAr: 'التجارة الرقمية',
                nameEn: 'Digital Commerce',
                globalMarket: '$5T+/year',
                saudiMarket: '~50B SAR/year',
                sheikhaRole: 'منصة تجارة ذكية متكاملة',
                wealthPotential: 'عالي',
                score: 85
            },
            {
                id: 'WS-SEC-04',
                nameAr: 'التمويل الإسلامي',
                nameEn: 'Islamic Finance',
                globalMarket: '$3T+ أصول',
                saudiMarket: '~1T SAR',
                sheikhaRole: 'بوابة تمويل شرعي للصفقات',
                wealthPotential: 'عالي',
                score: 88
            },
            {
                id: 'WS-SEC-05',
                nameAr: 'الطاقة والموارد',
                nameEn: 'Energy & Resources',
                globalMarket: '$5T+/year',
                saudiMarket: '~2T SAR/year',
                sheikhaRole: 'تداول موارد الطاقة حلالاً',
                wealthPotential: 'عالي جداً',
                score: 85
            },
            {
                id: 'WS-SEC-06',
                nameAr: 'الزراعة والغذاء',
                nameEn: 'Agriculture & Food',
                globalMarket: '$8T+/year',
                saudiMarket: '~200B SAR/year',
                sheikhaRole: 'أسواق حلال وتوريد غذائي',
                wealthPotential: 'متوسط-عالي',
                score: 75
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 8. أعظم لحظات الثروة في التاريخ — Historical Wealth Moments
    // ═══════════════════════════════════════════════════════════════════════
    _initHistoricalWealth() {
        return [
            {
                id: 'HW-01',
                era: 'عهد النبي ﷺ',
                event: 'غنائم خيبر',
                description: 'غنائم غزوة خيبر — أثرت المسلمين وقوّت الدولة الإسلامية',
                lesson: 'الغنيمة الحلال تُثري الأمة وتُقوّي المجتمع',
                islamicRef: 'فَكُلُوا مِمَّا غَنِمْتُمْ حَلَالًا طَيِّبًا — الأنفال:69'
            },
            {
                id: 'HW-02',
                era: 'الخلافة الراشدة',
                event: 'غنائم القادسية وفتح الفرس',
                description: 'انتقلت ثروة الإمبراطورية الفارسية إلى الدولة الإسلامية',
                lesson: 'القوة تجلب الثروة والثروة تُمكّن من البناء',
                amount: 'مليارات الدراهم والدنانير'
            },
            {
                id: 'HW-03',
                era: '750-1258 م',
                event: 'ثروة العصر العباسي',
                description: 'بغداد أغنى مدينة في العالم — بيت الحكمة + طريق الحرير + تجارة عالمية',
                amount: 'GDP المسلمين = 75% من GDP العالم في ذروة العصر العباسي',
                lesson: 'العلم + التجارة + الحكم العادل = أعظم ثروة في التاريخ'
            },
            {
                id: 'HW-04',
                era: '1280-1337 م',
                event: 'ثروة منسا موسى — أغنى رجل في التاريخ',
                description: 'سلطان مالي المسلم — ثروته المقدرة $400 مليار بالقيمة الحالية',
                amount: '$400B (قيمة حالية)',
                lesson: 'الحاكم المسلم الصالح يُبني أغنى دولة في العالم'
            },
            {
                id: 'HW-05',
                era: 'القرن العشرين',
                event: 'اكتشاف النفط في الجزيرة العربية',
                description: 'تحوّل الجزيرة العربية من أفقر إلى أغنى منطقة في العالم',
                lesson: 'الله أودع الثروة في أرض الحرمين — وجب شكرها وحسن استثمارها',
                islamicRef: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا — الملك:15'
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 9. مؤشرات الثروة — Wealth KPIs
    // ═══════════════════════════════════════════════════════════════════════
    _initWealthKPIs() {
        return {
            title: 'مؤشرات الأداء للثروة الحلال',
            indicators: [
                { id: 'K-01', name: 'مؤشر البركة', current: 86.8, target: 95, unit: '%', status: 'growing', code: 'BARAKAH_INDEX' },
                { id: 'K-02', name: 'نقاء الحلال', current: 100, target: 100, unit: '%', status: 'optimal', code: 'HALAL_PURITY' },
                { id: 'K-03', name: 'نسبة الزكاة المؤداة', current: 100, target: 100, unit: '%', status: 'optimal', code: 'ZAKAT_RATE' },
                { id: 'K-04', name: 'مؤشر الاقتناص (Ightinam)', current: 72, target: 90, unit: '%', status: 'improving', code: 'IGHTINAM_INDEX' },
                { id: 'K-05', name: 'تنوع مصادر الدخل', current: 4, target: 7, unit: 'مصادر', status: 'growing', code: 'INCOME_DIVERSITY' },
                { id: 'K-06', name: 'العائد السنوي على الاستثمار', current: 12, target: 20, unit: '%', status: 'growing', code: 'ROI' },
                { id: 'K-07', name: 'مؤشر الثقة التجارية', current: 95, target: 99, unit: '%', status: 'optimal', code: 'TRUST_INDEX' },
                { id: 'K-08', name: 'حجم الصفقات الشهرية', current: 0, target: 50000000, unit: 'SAR', status: 'building', code: 'MONTHLY_VOLUME' },
                { id: 'K-09', name: 'مؤشر الاستدامة الثروية', current: 78, target: 95, unit: '%', status: 'growing', code: 'WEALTH_SUSTAINABILITY' },
                { id: 'K-10', name: 'مضاعف الغنيمة (Ghanayim Multiplier)', current: 1.0, target: 10.0, unit: 'x', status: 'building', code: 'GHANAYIM_MULTIPLIER' }
            ],
            overallScore: 82.5,
            overallStatus: 'بنيان قوي يُكتمل',
            nextMilestone: 'أول 10 تجار حقيقيين = تفعيل الغنائم الحقيقية'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // الواجهات العامة — Public API Methods
    // ═══════════════════════════════════════════════════════════════════════

    getDashboard() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            لا_حول: 'ولا حول ولا قوة إلا بالله العلي العظيم',
            name: this.name,
            nameEn: this.nameEn,
            owner: this.owner,
            version: this.version,
            startedAt: this.startedAt,
            verse: '"فَكُلُوا مِمَّا غَنِمْتُمْ حَلَالًا طَيِّبًا ۚ وَاتَّقُوا اللَّهَ" — الأنفال:69',
            verse2: '"وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا" — القصص:77',
            summary: {
                quranFoundations:    this._quranFoundations.length,
                islamicWealthyModels: this._islamicWealthy.length,
                wealthPillars:       this._wealthPillars.length,
                opportunityCategories: this._opportunityMatrix.categories.length,
                totalOpportunities:  this._opportunityMatrix.totalOpportunities,
                totalMarketSize:     this._opportunityMatrix.totalMarketSize,
                wealthStrategies:    this._wealthStrategies.length,
                wealthSectors:       this._wealthSectors.length,
                historicalMoments:   this._historicalWealth.length,
                kpis:                this._wealthKPIs.indicators.length
            },
            overallWealthScore: this._wealthKPIs.overallScore,
            barakahIndex:       this._wealthKPIs.indicators.find(k => k.code === 'BARAKAH_INDEX').current,
            nextMilestone:      this._wealthKPIs.nextMilestone,
            power: '⚡ الأقوى والأفضل — بإذن الله',
            timestamp: new Date().toISOString()
        };
    }

    getQuranFoundations()   { return { بسم_الله: 'بسم الله الرحمن الرحيم', total: this._quranFoundations.length, foundations: this._quranFoundations }; }
    getIslamicWealthy()     { return { بسم_الله: 'بسم الله الرحمن الرحيم', total: this._islamicWealthy.length, wealthyModels: this._islamicWealthy }; }
    getWealthPillars()      { return { بسم_الله: 'بسم الله الرحمن الرحيم', total: this._wealthPillars.length, pillars: this._wealthPillars }; }
    getOpportunityMatrix()  { return { بسم_الله: 'بسم الله الرحمن الرحيم', ...this._opportunityMatrix }; }
    getWealthStrategies()   { return { بسم_الله: 'بسم الله الرحمن الرحيم', total: this._wealthStrategies.length, strategies: this._wealthStrategies }; }
    getZakatEngine()        { return { بسم_الله: 'بسم الله الرحمن الرحيم', ...this._zakatEngine }; }
    getWealthSectors()      { return { بسم_الله: 'بسم الله الرحمن الرحيم', total: this._wealthSectors.length, sectors: this._wealthSectors }; }
    getHistoricalWealth()   { return { بسم_الله: 'بسم الله الرحمن الرحيم', total: this._historicalWealth.length, history: this._historicalWealth }; }
    getWealthKPIs()         { return { بسم_الله: 'بسم الله الرحمن الرحيم', ...this._wealthKPIs }; }

    /**
     * حاسبة الزكاة — Zakat Calculator
     * @param {number} amount - المبلغ بالريال
     * @param {string} type   - نوع المال (cash|gold|tradingGoods|minerals)
     */
    calculateZakat(amount, type = 'cash') {
        const rates = this._zakatEngine.rates;
        const validTypes = Object.keys(rates);
        if (!validTypes.includes(type)) {
            return {
                success: false,
                error: 'INVALID_TYPE',
                message: `نوع المال "${type}" غير مدعوم. الأنواع المتاحة: ${validTypes.join(', ')}`,
                validTypes
            };
        }
        const rateInfo    = rates[type];
        // استخدام toFixed + parseFloat لتجنب أخطاء الفاصلة العائمة في الحسابات المالية
        const zakatAmount = parseFloat((amount * rateInfo.rate).toFixed(2));
        const remaining   = parseFloat((amount - zakatAmount).toFixed(2));
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            input: { amount, type },
            rateInfo,
            zakatAmount,
            remaining,
            blessing: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ — رواه مسلم',
            note: 'الزكاة تُطهر المال وتُنميه بإذن الله',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * مصفوفة أولويات الفرص
     */
    getOpportunityPriority() {
        const matrix = this._opportunityMatrix;
        const allOpps = matrix.categories.flatMap(cat =>
            cat.opportunities.map(op => ({ ...op, category: cat.nameAr, categoryId: cat.id }))
        );
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            priority: matrix.priorityScore,
            immediate: allOpps.filter(op => matrix.priorityScore.immediate.includes(op.code)),
            shortTerm: allOpps.filter(op => matrix.priorityScore.shortTerm.includes(op.code)),
            longTerm:  allOpps.filter(op => matrix.priorityScore.longTerm.includes(op.code)),
            totalOpportunities: allOpps.length,
            totalMarketSize: matrix.totalMarketSize,
            principle: 'اغتنم خمساً قبل خمس — الحاكم'
        };
    }

    /**
     * الحصول على النموذج الإسلامي الأنسب للثروة
     * @param {string} goal - الهدف (startSmall|scale|distribute|protect)
     */
    getWealthModel(goal = 'startSmall') {
        const modelMap = {
            startSmall: this._wealthStrategies.find(s => s.id === 'WS-01'),
            scale:      this._wealthStrategies.find(s => s.id === 'WS-06'),
            partner:    this._wealthStrategies.find(s => s.id === 'WS-02'),
            protect:    this._wealthStrategies.find(s => s.id === 'WS-04'),
            circular:   this._wealthStrategies.find(s => s.id === 'WS-05')
        };
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            goal,
            model: modelMap[goal] || modelMap.startSmall,
            allStrategies: this._wealthStrategies.map(s => ({ id: s.id, nameAr: s.nameAr, code: s.codePhrase })),
            advice: 'كل استراتيجية تعمل — بإذن الله — ابدأ بالتي تناسب وضعك الآن'
        };
    }

    /**
     * التقرير الكامل — Full Ghanayim Report
     */
    getFullReport() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            لا_حول: 'ولا حول ولا قوة إلا بالله العلي العظيم',
            dashboard:          this.getDashboard(),
            quranFoundations:   this.getQuranFoundations(),
            islamicWealthy:     this.getIslamicWealthy(),
            wealthPillars:      this.getWealthPillars(),
            opportunityMatrix:  this.getOpportunityMatrix(),
            wealthStrategies:   this.getWealthStrategies(),
            zakatEngine:        this.getZakatEngine(),
            wealthSectors:      this.getWealthSectors(),
            historicalWealth:   this.getHistoricalWealth(),
            wealthKPIs:         this.getWealthKPIs(),
            closing: {
                dua: 'اللهم اجعل هذه الغنائم حلالاً طيباً مباركاً — تُقوّي الإسلام وتُعزّ المسلمين',
                verse: '"يَا أَيُّهَا الَّذِينَ آمَنُوا هَلْ أَدُلُّكُمْ عَلَى تِجَارَةٍ تُنجِيكُم مِّنْ عَذَابٍ أَلِيمٍ" — الصف:10',
                salawat: 'اللهم صلّ وسلّم على نبينا محمد وآله وصحبه أجمعين'
            },
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = SheikhaGhanayimEngine;
