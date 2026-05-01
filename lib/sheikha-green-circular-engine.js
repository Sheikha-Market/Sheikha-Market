/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة الخضراء + منظومة الاقتصاد الدائري
 * Sheikha Green System + Circular Economy Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا" — الأعراف 56
 * "وَالْأَرْضَ وَضَعَهَا لِلْأَنَامِ" — الرحمن 10
 * "كُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا" — الأعراف 31
 * 
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaGreenCircularEngine {
    constructor() {
        this.name = 'Sheikha Green & Circular Economy Engine';
        this.nameAr = 'منظومة شيخة الخضراء والاقتصاد الدائري';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {
        // ═══════════════════════════════════════════════════════════════
        // 📗 الأساس الشرعي — القرآن والسنة في حفظ البيئة والاستدامة
        // ═══════════════════════════════════════════════════════════════
        this.islamicFoundation = {
            nameAr: 'الأساس الشرعي للاستدامة',
            principle: 'الإسلام سبق العالم في حماية البيئة والاستدامة — الاستخلاف والإعمار',

            quranVerses: [
                {
                    id: 'Q7:56', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا',
                    surah: 'الأعراف', ayah: 56,
                    principle: 'عدم الإفساد في الأرض',
                    application: 'منع التلوث والتدمير البيئي — أساس منظومة شيخة الخضراء',
                    digitalAction: 'مراقبة تلقائية للانبعاثات والتلوث في كل معاملة'
                },
                {
                    id: 'Q55:10', text: 'وَالْأَرْضَ وَضَعَهَا لِلْأَنَامِ',
                    surah: 'الرحمن', ayah: 10,
                    principle: 'الأرض أمانة للبشر',
                    application: 'الاستخلاف — حفظ الأرض ومواردها للأجيال القادمة',
                    digitalAction: 'تتبع الأثر البيئي لكل منتج عبر سلسلة التوريد'
                },
                {
                    id: 'Q7:31', text: 'كُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ',
                    surah: 'الأعراف', ayah: 31,
                    principle: 'عدم الإسراف',
                    application: 'ترشيد استهلاك الموارد — أساس الاقتصاد الدائري',
                    digitalAction: 'حساب تلقائي لكفاءة استخدام الموارد في كل عقد'
                },
                {
                    id: 'Q2:30', text: 'إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً',
                    surah: 'البقرة', ayah: 30,
                    principle: 'الاستخلاف في الأرض',
                    application: 'المسؤولية عن إعمار الأرض وحفظ مواردها',
                    digitalAction: 'مؤشر الاستخلاف — قياس مساهمة كل مستخدم في إعمار الأرض'
                },
                {
                    id: 'Q11:61', text: 'هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا',
                    surah: 'هود', ayah: 61,
                    principle: 'إعمار الأرض',
                    application: 'التنمية المستدامة — البناء والإعمار دون تدمير',
                    digitalAction: 'ربط كل مشروع بمؤشرات الإعمار المستدام'
                },
                {
                    id: 'Q57:25', text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ',
                    surah: 'الحديد', ayah: 25,
                    principle: 'المعادن نعمة إلهية',
                    application: 'استخدام المعادن بحكمة — إعادة التدوير واجبة لحفظ النعمة',
                    digitalAction: 'تتبع دورة حياة كل معدن من المنجم إلى إعادة التدوير'
                },
                {
                    id: 'Q30:41', text: 'ظَهَرَ الْفَسَادُ فِي الْبَرِّ وَالْبَحْرِ بِمَا كَسَبَتْ أَيْدِي النَّاسِ',
                    surah: 'الروم', ayah: 41,
                    principle: 'الفساد البيئي بفعل الإنسان',
                    application: 'التحذير الإلهي — مسؤولية الإنسان عن التلوث',
                    digitalAction: 'إنذار تلقائي عند تجاوز حدود الانبعاثات'
                },
                {
                    id: 'Q6:141', text: 'وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ',
                    surah: 'الأنعام', ayah: 141,
                    principle: 'تحريم الإسراف',
                    application: 'تقليل الهدر في كل مرحلة من سلسلة التوريد',
                    digitalAction: 'قياس نسبة الهدر وتحفيز تقليله'
                }
            ],

            hadith: [
                {
                    text: 'إن قامت الساعة وفي يد أحدكم فسيلة فإن استطاع أن لا تقوم حتى يغرسها فليغرسها',
                    source: 'رواه أحمد',
                    principle: 'الغرس والإعمار حتى آخر لحظة',
                    application: 'الاستدامة واجب مستمر — لا يتوقف',
                    digitalAction: 'مبادرة "ازرع" — تحويل كل معاملة لمساهمة بيئية'
                },
                {
                    text: 'ما من مسلم يغرس غرساً أو يزرع زرعاً فيأكل منه طير أو إنسان أو بهيمة إلا كان له به صدقة',
                    source: 'متفق عليه',
                    principle: 'الإنتاج المستدام صدقة',
                    application: 'كل إعادة تدوير هي صدقة جارية',
                    digitalAction: 'حساب "ثواب التدوير" — كل طن معاد تدويره = صدقة رقمية'
                },
                {
                    text: 'لا ضرر ولا ضرار',
                    source: 'رواه ابن ماجه',
                    principle: 'منع الضرر البيئي',
                    application: 'القاعدة الذهبية — لا يجوز إضرار البيئة لتحقيق الربح',
                    digitalAction: 'فحص تلقائي لكل عقد — رفض العقود الضارة بيئياً'
                },
                {
                    text: 'من أحيا أرضاً ميتة فهي له',
                    source: 'رواه أبو داود',
                    principle: 'إحياء الأرض',
                    application: 'تحفيز استصلاح الأراضي الملوثة بالمعادن الثقيلة',
                    digitalAction: 'برنامج "إحياء" — عقود خضراء لاستصلاح المواقع الصناعية'
                },
                {
                    text: 'الناس شركاء في ثلاثة: في الماء والكلأ والنار',
                    source: 'رواه أبو داود',
                    principle: 'الموارد الطبيعية مشتركة',
                    application: 'المعادن ملك للأمة — يجب إدارتها بعدل',
                    digitalAction: 'مؤشر العدالة — ضمان توزيع عادل للموارد المعدنية'
                },
                {
                    text: 'نهى رسول الله ﷺ عن إضاعة المال',
                    source: 'متفق عليه',
                    principle: 'حفظ المال والموارد',
                    application: 'تحريم إهدار المعادن القابلة للتدوير',
                    digitalAction: 'تنبيه عند اكتشاف معادن مهدرة قابلة للاسترداد'
                }
            ]
        };

        // ═══════════════════════════════════════════════════════════════
        // 🌿 منظومة شيخة الخضراء — Sheikha Green System
        // ═══════════════════════════════════════════════════════════════
        this.greenSystem = {
            nameAr: 'منظومة شيخة الخضراء',
            nameEn: 'Sheikha Green System',
            motto: '"وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا"',

            pillars: [
                {
                    id: 'green-procurement',
                    nameAr: 'المشتريات الخضراء',
                    nameEn: 'Green Procurement',
                    icon: '🛒🌿',
                    desc: 'شراء المعادن من مصادر مستدامة ومعاد تدويرها',
                    criteria: [
                        'المعدن معاد تدويره أو من منجم مسؤول',
                        'البصمة الكربونية أقل من المعيار',
                        'المورد حاصل على شهادة بيئية',
                        'النقل بأقل انبعاثات ممكنة'
                    ],
                    digitalFeatures: [
                        'تصنيف تلقائي للمنتجات الخضراء',
                        'فلتر "أخضر فقط" في السوق',
                        'شارة خضراء للموردين المستدامين',
                        'خصم أسعار للمنتجات المعاد تدويرها'
                    ]
                },
                {
                    id: 'green-contracts',
                    nameAr: 'العقود الخضراء',
                    nameEn: 'Green Contracts',
                    icon: '📜🌿',
                    desc: 'عقود تتضمن شروط الاستدامة والحفاظ على البيئة',
                    types: [
                        { id: 'recycling', nameAr: 'عقد إعادة تدوير', desc: 'التزام باسترداد المعادن وإعادة تدويرها' },
                        { id: 'carbon-neutral', nameAr: 'عقد محايد كربونياً', desc: 'تعويض الانبعاثات الكربونية' },
                        { id: 'circular-supply', nameAr: 'عقد توريد دائري', desc: 'المعادن تدور في حلقة مغلقة' },
                        { id: 'green-logistics', nameAr: 'عقد لوجستيات خضراء', desc: 'نقل بأقل بصمة كربونية' },
                        { id: 'takeback', nameAr: 'عقد استرداد', desc: 'التزام المورد باسترداد المنتج بعد نهاية عمره' },
                        { id: 'industrial-symbiosis', nameAr: 'عقد تكافل صناعي', desc: 'نفايات مصنع = مدخلات مصنع آخر' }
                    ],
                    shariaClause: 'شرط شرعي: "لا ضرر ولا ضرار" — كل عقد أخضر يتضمن حماية البيئة كشرط أساسي'
                },
                {
                    id: 'green-scoring',
                    nameAr: 'التصنيف الأخضر',
                    nameEn: 'Green Scoring',
                    icon: '⭐🌿',
                    desc: 'نظام تصنيف بيئي لكل مستخدم ومنتج وعقد',
                    levels: [
                        { score: '90-100', label: 'أخضر ذهبي', badge: '🌟🌿', desc: 'قدوة في الاستدامة' },
                        { score: '70-89', label: 'أخضر فضي', badge: '✨🌿', desc: 'ملتزم بالاستدامة' },
                        { score: '50-69', label: 'أخضر برونزي', badge: '🌿', desc: 'في طريق الاستدامة' },
                        { score: '30-49', label: 'مقبول', badge: '🌱', desc: 'يحتاج تحسين' },
                        { score: '0-29', label: 'يحتاج مراجعة', badge: '⚠️', desc: 'بصمة بيئية عالية' }
                    ],
                    factors: [
                        { id: 'recycling_rate', weight: 25, nameAr: 'نسبة إعادة التدوير' },
                        { id: 'carbon_footprint', weight: 20, nameAr: 'البصمة الكربونية' },
                        { id: 'energy_efficiency', weight: 15, nameAr: 'كفاءة الطاقة' },
                        { id: 'waste_reduction', weight: 15, nameAr: 'تقليل النفايات' },
                        { id: 'green_contracts', weight: 15, nameAr: 'نسبة العقود الخضراء' },
                        { id: 'community_impact', weight: 10, nameAr: 'الأثر المجتمعي' }
                    ]
                },
                {
                    id: 'emissions-tracking',
                    nameAr: 'تتبع الانبعاثات',
                    nameEn: 'Emissions Tracking',
                    icon: '🏭📊',
                    desc: 'مراقبة وتقليل الانبعاثات في كل معاملة',
                    scopes: [
                        { id: 'scope1', nameAr: 'النطاق 1 — انبعاثات مباشرة', desc: 'من عمليات الإنتاج والصهر' },
                        { id: 'scope2', nameAr: 'النطاق 2 — انبعاثات الطاقة', desc: 'من استهلاك الكهرباء' },
                        { id: 'scope3', nameAr: 'النطاق 3 — انبعاثات سلسلة التوريد', desc: 'من النقل والموردين' }
                    ],
                    metalEmissions: {
                        steel: { primary: 1.85, recycled: 0.4, saving: '78%', unit: 'طن CO₂/طن معدن' },
                        aluminum: { primary: 11.5, recycled: 0.6, saving: '95%', unit: 'طن CO₂/طن معدن' },
                        copper: { primary: 3.5, recycled: 0.9, saving: '74%', unit: 'طن CO₂/طن معدن' },
                        gold: { primary: 16000, recycled: 37, saving: '99.8%', unit: 'كجم CO₂/كجم معدن' },
                        silver: { primary: 104, recycled: 1.4, saving: '99%', unit: 'كجم CO₂/كجم معدن' }
                    }
                },
                {
                    id: 'green-certification',
                    nameAr: 'الشهادات والاعتمادات الخضراء',
                    nameEn: 'Green Certifications',
                    icon: '🏅🌿',
                    certifications: [
                        { id: 'iso14001', nameAr: 'ISO 14001 — إدارة بيئية', desc: 'نظام إدارة بيئية معتمد' },
                        { id: 'iso50001', nameAr: 'ISO 50001 — إدارة طاقة', desc: 'كفاءة استخدام الطاقة' },
                        { id: 'leed', nameAr: 'LEED — مباني خضراء', desc: 'معيار المباني المستدامة' },
                        { id: 'sheikha-green', nameAr: 'شهادة شيخة الخضراء', desc: 'شهادة شيخة للاستدامة — مبنية على الكتاب والسنة' },
                        { id: 'carbon-neutral', nameAr: 'محايد كربونياً', desc: 'شهادة الحياد الكربوني' },
                        { id: 'responsible-mining', nameAr: 'تعدين مسؤول', desc: 'استخراج مسؤول ومستدام' }
                    ]
                }
            ],

            saudiAlignment: {
                vision2030: [
                    'هدف رؤية 2030: تقليل الانبعاثات 278 مليون طن سنوياً بحلول 2030',
                    'مبادرة السعودية الخضراء: زراعة 10 مليار شجرة',
                    'مبادرة الشرق الأوسط الأخضر: تقليل 60% من الانبعاثات',
                    'NEOM: أول مدينة خالية من الانبعاثات'
                ],
                regulations: [
                    'نظام إدارة النفايات السعودي',
                    'الاستراتيجية الوطنية للبيئة',
                    'نظام التقييم البيئي',
                    'مبادرة الاقتصاد الدائري السعودية'
                ]
            }
        };

        // ═══════════════════════════════════════════════════════════════
        // ♻️ منظومة الاقتصاد الدائري — Circular Economy System
        // ═══════════════════════════════════════════════════════════════
        this.circularEconomy = {
            nameAr: 'منظومة شيخة للاقتصاد الدائري',
            nameEn: 'Sheikha Circular Economy System',
            motto: '"كُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا"',

            // ─── المبادئ الأساسية ───────────────────────
            principles: [
                {
                    id: 'design-for-circularity',
                    nameAr: 'التصميم للتدوير',
                    nameEn: 'Design for Circularity',
                    icon: '🔄',
                    desc: 'تصميم المنتجات المعدنية لسهولة التفكيك وإعادة التدوير',
                    islamicBasis: 'الإتقان في الصنعة — "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه"',
                    metrics: ['نسبة قابلية التدوير', 'عدد دورات الاستخدام', 'سهولة التفكيك']
                },
                {
                    id: 'extend-lifecycle',
                    nameAr: 'إطالة العمر الافتراضي',
                    nameEn: 'Extend Lifecycle',
                    icon: '⏳',
                    desc: 'صيانة وتجديد المنتجات المعدنية بدل استبدالها',
                    islamicBasis: 'عدم الإسراف — "وَلَا تُسْرِفُوا"',
                    metrics: ['متوسط عمر المنتج', 'عدد مرات الإصلاح', 'تكلفة الصيانة vs الاستبدال']
                },
                {
                    id: 'material-recovery',
                    nameAr: 'استرداد المواد',
                    nameEn: 'Material Recovery',
                    icon: '🔧',
                    desc: 'استخلاص المعادن من المنتجات المنتهية الصلاحية',
                    islamicBasis: 'حفظ المال — "نهى النبي ﷺ عن إضاعة المال"',
                    metrics: ['نسبة الاسترداد', 'نقاء المعدن المسترد', 'تكلفة الاسترداد']
                },
                {
                    id: 'regenerative-systems',
                    nameAr: 'الأنظمة التجددية',
                    nameEn: 'Regenerative Systems',
                    icon: '🌱',
                    desc: 'تحويل النفايات إلى موارد — تكافل صناعي',
                    islamicBasis: 'إعمار الأرض — "هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا"',
                    metrics: ['نسبة التحويل', 'عدد الشراكات التكافلية', 'الأثر البيئي الإيجابي']
                },
                {
                    id: 'sharing-economy',
                    nameAr: 'اقتصاد المشاركة',
                    nameEn: 'Sharing Economy',
                    icon: '🤝',
                    desc: 'مشاركة المعدات والأصول بدل التملك الفردي',
                    islamicBasis: 'الناس شركاء — "الناس شركاء في ثلاثة: في الماء والكلأ والنار"',
                    metrics: ['نسبة المشاركة', 'توفير التكاليف', 'الأصول المشتركة']
                },
                {
                    id: 'zero-waste',
                    nameAr: 'صفر نفايات',
                    nameEn: 'Zero Waste',
                    icon: '🎯',
                    desc: 'هدف القضاء على النفايات المعدنية نهائياً',
                    islamicBasis: 'حفظ الموارد — "من أحيا أرضاً ميتة فهي له"',
                    metrics: ['نسبة النفايات', 'معدل التحويل عن المكبات', 'إعادة الاستخدام']
                }
            ],

            // ─── نماذج الأعمال الدائرية ──────────────────
            businessModels: [
                {
                    id: 'product-as-service',
                    nameAr: 'المنتج كخدمة',
                    nameEn: 'Product as a Service',
                    desc: 'تأجير المعدات المعدنية بدل بيعها — المورد يحتفظ بملكية المعدن',
                    example: 'تأجير قوالب صب بدل شرائها',
                    revenueModel: 'إيجار شهري + صيانة',
                    greenImpact: 'تقليل 60% من استخدام المواد الخام'
                },
                {
                    id: 'takeback-programs',
                    nameAr: 'برامج الاسترداد',
                    nameEn: 'Take-Back Programs',
                    desc: 'استرداد المنتجات المعدنية المنتهية لإعادة تدويرها',
                    example: 'استرداد الحديد من مباني مهدومة',
                    revenueModel: 'شراء بسعر مخفض + بيع بعد التدوير',
                    greenImpact: 'استرداد 85%+ من المعادن'
                },
                {
                    id: 'industrial-symbiosis',
                    nameAr: 'التكافل الصناعي',
                    nameEn: 'Industrial Symbiosis',
                    desc: 'نفايات مصنع = مدخلات مصنع آخر — شبكة تكافل',
                    example: 'خبث الحديد → مدخل لصناعة الإسمنت',
                    revenueModel: 'توفير تكاليف المواد + دخل من النفايات',
                    greenImpact: 'تقليل 70% من النفايات الصناعية'
                },
                {
                    id: 'urban-mining',
                    nameAr: 'التعدين الحضري',
                    nameEn: 'Urban Mining',
                    desc: 'استخلاص المعادن الثمينة من النفايات الإلكترونية',
                    example: '1 طن سكراب إلكتروني = 300g ذهب',
                    revenueModel: 'شراء سكراب إلكتروني + استخلاص معادن ثمينة',
                    greenImpact: 'استرداد 99% من المعادن النادرة'
                },
                {
                    id: 'remanufacturing',
                    nameAr: 'إعادة التصنيع',
                    nameEn: 'Remanufacturing',
                    desc: 'تجديد المنتجات المعدنية لحالة "كالجديدة"',
                    example: 'تجديد محركات سيارات بمعادن معاد تدويرها',
                    revenueModel: 'بيع بـ 60-80% من سعر الجديد',
                    greenImpact: 'توفير 80% من الطاقة مقارنة بالإنتاج الجديد'
                }
            ],

            // ─── سلسلة التوريد الدائرية ──────────────────
            circularSupplyChain: {
                nameAr: 'سلسلة التوريد الدائرية',
                stages: [
                    { order: 1, id: 'source', nameAr: 'المصدر', desc: 'منجم مسؤول أو مصنع إعادة تدوير', icon: '⛏️', greenAction: 'تعدين مسؤول / استرداد مواد' },
                    { order: 2, id: 'process', nameAr: 'المعالجة', desc: 'صهر وتكرير بطاقة نظيفة', icon: '🔥', greenAction: 'طاقة متجددة / كفاءة حرارية' },
                    { order: 3, id: 'manufacture', nameAr: 'التصنيع', desc: 'إنتاج بأقل نفايات', icon: '🏭', greenAction: 'تصميم للتدوير / صفر نفايات' },
                    { order: 4, id: 'distribute', nameAr: 'التوزيع', desc: 'نقل بأقل بصمة كربونية', icon: '🚚', greenAction: 'لوجستيات خضراء / تجميع شحنات' },
                    { order: 5, id: 'use', nameAr: 'الاستخدام', desc: 'إطالة عمر المنتج', icon: '🔨', greenAction: 'صيانة دورية / تجديد' },
                    { order: 6, id: 'collect', nameAr: 'التجميع', desc: 'جمع المنتجات المنتهية', icon: '📦', greenAction: 'شبكة استرداد / حوافز' },
                    { order: 7, id: 'recycle', nameAr: 'إعادة التدوير', desc: 'تحويل النفايات إلى موارد', icon: '♻️', greenAction: 'فرز ذكي / صهر نظيف' },
                    { order: 8, id: 'loop', nameAr: 'إغلاق الحلقة', desc: 'العودة للمصدر — دورة كاملة', icon: '🔄', greenAction: 'المعدن يعود لسلسلة التوريد' }
                ],
                kpis: [
                    { id: 'circularity_rate', nameAr: 'معدل الدائرية', target: '80%+', desc: 'نسبة المواد المعاد تدويرها' },
                    { id: 'waste_diversion', nameAr: 'تحويل النفايات', target: '90%+', desc: 'نسبة التحويل عن المكبات' },
                    { id: 'material_efficiency', nameAr: 'كفاءة المواد', target: '95%+', desc: 'نسبة استخدام المواد الخام' },
                    { id: 'energy_from_renewables', nameAr: 'الطاقة المتجددة', target: '50%+', desc: 'نسبة الطاقة من مصادر متجددة' },
                    { id: 'carbon_reduction', nameAr: 'تقليل الكربون', target: '40%+', desc: 'نسبة تقليل الانبعاثات' }
                ]
            },

            // ─── المعادن وإعادة التدوير ──────────────────
            metalRecycling: {
                iron: { nameAr: 'حديد', recyclingRate: 85, energySaving: 74, co2Saving: 78, infiniteRecycle: true },
                aluminum: { nameAr: 'ألمنيوم', recyclingRate: 75, energySaving: 95, co2Saving: 95, infiniteRecycle: true },
                copper: { nameAr: 'نحاس', recyclingRate: 80, energySaving: 85, co2Saving: 74, infiniteRecycle: true },
                gold: { nameAr: 'ذهب', recyclingRate: 90, energySaving: 99, co2Saving: 99.8, infiniteRecycle: true },
                silver: { nameAr: 'فضة', recyclingRate: 85, energySaving: 95, co2Saving: 99, infiniteRecycle: true },
                lead: { nameAr: 'رصاص', recyclingRate: 95, energySaving: 65, co2Saving: 70, infiniteRecycle: true },
                zinc: { nameAr: 'زنك', recyclingRate: 60, energySaving: 60, co2Saving: 60, infiniteRecycle: true },
                platinum: { nameAr: 'بلاتين', recyclingRate: 95, energySaving: 98, co2Saving: 99, infiniteRecycle: true },
                palladium: { nameAr: 'بلاديوم', recyclingRate: 90, energySaving: 97, co2Saving: 98, infiniteRecycle: true },
                eWaste: { nameAr: 'سكراب إلكتروني', recyclingRate: 20, energySaving: 80, co2Saving: 85, infiniteRecycle: false, note: 'يحتوي على 60+ عنصر قابل للاسترداد' }
            },

            islamicCircularEconomy: {
                nameAr: 'الاقتصاد الدائري في الإسلام',
                desc: 'الإسلام سبق العالم في مبادئ الاقتصاد الدائري بـ 14 قرناً',
                examples: [
                    { principle: 'عدم الإسراف', modernEquivalent: 'تقليل النفايات', verse: 'وَلَا تُسْرِفُوا' },
                    { principle: 'حفظ المال', modernEquivalent: 'كفاءة الموارد', hadith: 'نهى عن إضاعة المال' },
                    { principle: 'إعمار الأرض', modernEquivalent: 'التنمية المستدامة', verse: 'وَاسْتَعْمَرَكُمْ فِيهَا' },
                    { principle: 'عدم الإفساد', modernEquivalent: 'حماية البيئة', verse: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ' },
                    { principle: 'الشراكة في الموارد', modernEquivalent: 'اقتصاد المشاركة', hadith: 'الناس شركاء في ثلاثة' },
                    { principle: 'إحياء الأرض', modernEquivalent: 'استصلاح المواقع الملوثة', hadith: 'من أحيا أرضاً ميتة فهي له' },
                    { principle: 'الغرس المستمر', modernEquivalent: 'الاستدامة طويلة الأمد', hadith: 'إن قامت الساعة وفي يد أحدكم فسيلة فليغرسها' }
                ]
            }
        };

        // ═══════════════════════════════════════════════════════════════
        // 📊 النظام الرقمي المتكامل — Digital Integration
        // ═══════════════════════════════════════════════════════════════
        this.digitalIntegration = {
            nameAr: 'الرقمنة المتكاملة بالكتاب والسنة',

            automatedSystems: [
                { id: 'green-score-calc', nameAr: 'حاسبة التصنيف الأخضر', desc: 'حساب تلقائي للمؤشر الأخضر لكل مستخدم ومنتج وعقد', trigger: 'عند كل معاملة' },
                { id: 'carbon-tracker', nameAr: 'متتبع الكربون', desc: 'حساب البصمة الكربونية لكل شحنة ومعاملة', trigger: 'عند كل شحنة' },
                { id: 'circular-monitor', nameAr: 'مراقب الدائرية', desc: 'تتبع نسبة المواد المعاد تدويرها في كل سلسلة توريد', trigger: 'مستمر' },
                { id: 'waste-alert', nameAr: 'منبه الهدر', desc: 'تنبيه عند اكتشاف معادن مهدرة قابلة للاسترداد', trigger: 'عند رصد هدر' },
                { id: 'green-contract-gen', nameAr: 'مولد العقود الخضراء', desc: 'توليد عقود متوافقة بيئياً وشرعياً', trigger: 'عند إنشاء عقد أخضر' },
                { id: 'sharia-env-audit', nameAr: 'تدقيق شرعي بيئي', desc: 'فحص توافق كل معاملة مع الشريعة والبيئة', trigger: 'عند كل معاملة' },
                { id: 'lifecycle-tracker', nameAr: 'متتبع دورة الحياة', desc: 'تتبع المعدن من المنجم إلى إعادة التدوير', trigger: 'مستمر' },
                { id: 'green-report', nameAr: 'تقرير الاستدامة', desc: 'تقرير شهري عن الأداء البيئي', trigger: 'شهري' }
            ],

            apis: [
                { path: '/api/green/score/:userId', method: 'GET', desc: 'مؤشر المستخدم الأخضر' },
                { path: '/api/green/product/:productId', method: 'GET', desc: 'البصمة البيئية للمنتج' },
                { path: '/api/green/contract/:contractId', method: 'GET', desc: 'تقييم العقد الأخضر' },
                { path: '/api/circular/stats', method: 'GET', desc: 'إحصائيات الاقتصاد الدائري' },
                { path: '/api/circular/supply-chain/:userId', method: 'GET', desc: 'موقع المستخدم في الحلقة الدائرية' },
                { path: '/api/carbon/footprint', method: 'POST', desc: 'حساب البصمة الكربونية' },
                { path: '/api/carbon/offset', method: 'POST', desc: 'تعويض الانبعاثات' },
                { path: '/api/green/leaderboard', method: 'GET', desc: 'أفضل المستخدمين استدامة' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // الدوال العامة
    // ═══════════════════════════════════════════════════════════════

    getDashboard() {
        return {
            name: this.nameAr,
            version: this.version,
            summary: {
                quranVerses: this.islamicFoundation.quranVerses.length,
                hadith: this.islamicFoundation.hadith.length,
                greenPillars: this.greenSystem.pillars.length,
                circularPrinciples: this.circularEconomy.principles.length,
                businessModels: this.circularEconomy.businessModels.length,
                supplyChainStages: this.circularEconomy.circularSupplyChain.stages.length,
                metals: Object.keys(this.circularEconomy.metalRecycling).length,
                digitalSystems: this.digitalIntegration.automatedSystems.length,
                apis: this.digitalIntegration.apis.length,
                greenContractTypes: this.greenSystem.pillars.find(p => p.id === 'green-contracts')?.types?.length || 0,
                certifications: this.greenSystem.pillars.find(p => p.id === 'green-certification')?.certifications?.length || 0
            }
        };
    }

    calculateGreenScore(data = {}) {
        const factors = this.greenSystem.pillars.find(p => p.id === 'green-scoring')?.factors || [];
        let total = 0;
        factors.forEach(f => {
            const val = data[f.id] || 0;
            total += (val / 100) * f.weight;
        });
        return Math.round(total);
    }

    calculateCarbonFootprint(metalType, quantity, isRecycled = false) {
        const emissions = this.greenSystem.pillars.find(p => p.id === 'emissions-tracking')?.metalEmissions;
        if (!emissions || !emissions[metalType]) return null;
        const e = emissions[metalType];
        const co2 = isRecycled ? e.recycled * quantity : e.primary * quantity;
        const saved = isRecycled ? (e.primary - e.recycled) * quantity : 0;
        return { metalType, quantity, isRecycled, co2Emitted: co2, co2Saved: saved, saving: e.saving, unit: e.unit };
    }

    getRecyclingInfo(metalType) {
        return this.circularEconomy.metalRecycling[metalType] || null;
    }

    getIslamicBasis(topic) {
        const allBases = [];
        this.islamicFoundation.quranVerses.forEach(v => {
            if (v.principle.includes(topic) || v.application.includes(topic)) allBases.push({ type: 'quran', ...v });
        });
        this.islamicFoundation.hadith.forEach(h => {
            if (h.principle.includes(topic) || h.application.includes(topic)) allBases.push({ type: 'hadith', ...h });
        });
        return allBases;
    }
}

module.exports = SheikhaGreenCircularEngine;
