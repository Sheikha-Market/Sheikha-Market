'use strict';

/**
 * sheikha-riba-free-logistics-engine.js
 * محرك منع الربا في اللوجستيات — شحن، تأمين، نقل، يونكوتيرمز
 * المرحلة ٤٠ — منظومة شيخة الاقتصادية الإسلامية
 * الأساس: القرآن الكريم + السنة النبوية + فقه المعاملات
 * بسم الله الرحمن الرحيم
 */

// ───────────────────────────────────────────────
// الأسس الشرعية لتحريم الربا في اللوجستيات
// ───────────────────────────────────────────────
const SHARIA_BASIS = {
    quran: [
        { ref: 'البقرة:275', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', context: 'الأصل في البيع الحل والربا حرام قطعاً' },
        { ref: 'البقرة:278-279', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَذَرُوا مَا بَقِيَ مِنَ الرِّبَا', context: 'وجوب ترك كل ربا في العقود التجارية' },
        { ref: 'آل عمران:130', text: 'لَا تَأْكُلُوا الرِّبَا أَضْعَافًا مُضَاعَفَةً', context: 'تحريم الربا المركب في التمويل والتأمين' },
        { ref: 'النساء:29', text: 'لَا تَأْكُلُوا أَمْوَالَكُمْ بَيْنَكُمْ بِالْبَاطِلِ إِلَّا أَنْ تَكُونَ تِجَارَةً عَنْ تَرَاضٍ', context: 'التجارة الحلال عن تراضٍ دون غرر' }
    ],
    hadith: [
        { ref: 'صحيح مسلم', text: 'لَعَنَ رَسُولُ اللهِ آكِلَ الرِّبَا وَمُؤْكِلَهُ وَكَاتِبَهُ وَشَاهِدَيْهِ', context: 'تحريم كل أطراف العقد الربوي' },
        { ref: 'متفق عليه', text: 'الذهب بالذهب والفضة بالفضة... فإذا اختلفت هذه الأصناف فبيعوا كيف شئتم إذا كان يداً بيد', context: 'ربا الفضل والنسيئة في المعادن والبضائع' },
        { ref: 'سنن أبي داود', text: 'نهى عن بيع ما ليس عندك', context: 'تحريم البيع الآجل على بضاعة غير مقبوضة — أساس في Incoterms' },
        { ref: 'صحيح البخاري', text: 'لا ضرر ولا ضرار', context: 'مبدأ عدم الإضرار في عقود الشحن والنقل' }
    ],
    fiqh_rules: [
        'العقود تابعة للمقاصد',
        'الأصل في المعاملات الإباحة حتى يقوم دليل التحريم',
        'الغرر الكثير مفسد للعقد',
        'الجهالة المفضية للنزاع محرمة',
        'كل قرض جر نفعاً فهو ربا',
        'مآلات الأفعال معتبرة في الأحكام'
    ]
};

// ───────────────────────────────────────────────
// تحليل يونكوتيرمز 2020 شرعياً
// ───────────────────────────────────────────────
const INCOTERMS_ANALYSIS = [
    {
        code: 'EXW',
        name: 'Ex Works — تسليم في مصنع البائع',
        group: 'E',
        risk_transfer: 'عند المصنع — البائع يضع البضاعة فقط',
        sharia_status: 'جائز',
        sharia_issues: [],
        sharia_notes: 'البيع واضح والتسليم محدد — لا غرر ولا ربا',
        halal_conditions: [
            'تحديد موقع المصنع بدقة',
            'تحديد ميعاد الإتاحة',
            'وصف البضاعة وصفاً نافياً للجهالة'
        ],
        risk_level: 'low',
        recommended_for: ['بضائع محددة الموقع', 'مشتري لديه نقل ذاتي']
    },
    {
        code: 'FCA',
        name: 'Free Carrier — تسليم للناقل',
        group: 'F',
        risk_transfer: 'عند تسليم الناقل المعيّن من المشتري',
        sharia_status: 'جائز',
        sharia_issues: [],
        sharia_notes: 'تسليم واضح وناقل معيّن — ينتقل الضمان بالتسليم الفعلي',
        halal_conditions: [
            'تحديد الناقل أو مكان التسليم',
            'التأمين التكافلي للطرف المتحمل للخطر',
            'عدم تأجيل الثمن مع الغرر في التسليم'
        ],
        risk_level: 'low',
        recommended_for: ['شحن جوي', 'شحن بري متعدد الوسائط']
    },
    {
        code: 'FAS',
        name: 'Free Alongside Ship — جانب السفينة',
        group: 'F',
        risk_transfer: 'عند وضع البضاعة جانب السفينة في ميناء الشحن',
        sharia_status: 'جائز بشرط',
        sharia_issues: ['خطر الميناء المزدحم قد يُفضي لغرر في التسليم'],
        sharia_notes: 'يُشترط تحديد الميناء والرصيف بدقة لنفي الغرر',
        halal_conditions: [
            'تحديد الميناء ورقم الرصيف',
            'وثيقة تسليم واضحة (Note of Readiness)',
            'تأمين تكافلي حتى تحميل البضاعة'
        ],
        risk_level: 'medium',
        recommended_for: ['بضائع جزافية السفن الكبيرة (Bulk)']
    },
    {
        code: 'FOB',
        name: 'Free On Board — سطح السفينة',
        group: 'F',
        risk_transfer: 'عند تجاوز البضاعة درابزين السفينة في ميناء الشحن',
        sharia_status: 'جائز',
        sharia_issues: [],
        sharia_notes: 'الأكثر استخداماً — لحظة نقل الضمان محددة شرعاً وعرفاً',
        halal_conditions: [
            'وصف البضاعة قبل التحميل',
            'عدم بيع ما لم يُقبض قبل انتقال الضمان',
            'تأمين تكافلي من لحظة تجاوز الدرابزين'
        ],
        risk_level: 'low',
        recommended_for: ['تجارة الحديد والنحاس والسكراب', 'بضائع التعبئة الجافة']
    },
    {
        code: 'CFR',
        name: 'Cost and Freight — التكلفة والشحن',
        group: 'C',
        risk_transfer: 'الخطر ينتقل في ميناء الشحن — البائع يدفع الشحن فقط',
        sharia_status: 'محل نظر — يُستحسن تجنبه',
        sharia_issues: [
            'انفصال الخطر عن التكلفة: البائع يدفع الشحن لكن الخطر للمشتري بعد التحميل — قد يُفضي لنزاع',
            'البائع يختار الناقل دون رقابة المشتري — غرر محتمل',
            'إدراج سعر شحن مبهم في السعر الإجمالي قد يكون غرراً'
        ],
        sharia_notes: 'المشكلة الشرعية: البيع بثمن يشمل شحناً غير محدد تفصيلاً — شبهة غرر. الحل: تفصيل تكلفة الشحن في العقد',
        halal_conditions: [
            'الإفصاح الكامل عن تكلفة الشحن بالتفصيل',
            'اختيار ناقل موثوق متفق عليه',
            'التأمين التكافلي على عاتق المشتري من الميناء'
        ],
        risk_level: 'medium',
        recommended_for: ['يُفضَّل CIF التكافلي أو FOB البديل']
    },
    {
        code: 'CIF',
        name: 'Cost, Insurance and Freight — التكلفة والتأمين والشحن',
        group: 'C',
        risk_transfer: 'الخطر في ميناء الشحن — البائع يدفع الشحن والتأمين',
        sharia_status: 'محظور بالصيغة التقليدية — يُسمح بديل التكافل',
        sharia_issues: [
            'التأمين التجاري المدرج (Marine Insurance) قائم على الغرر والربا والميسر',
            'البائع يختار شركة التأمين التجاري دون رقابة — الخطر على المشتري والتأمين ربوي',
            'ازدواجية: الخطر على المشتري لكن التأمين الربوي للبائع'
        ],
        sharia_notes: '⚠️ أشد الصيغ إشكالاً شرعياً — الحل: استبدال التأمين التجاري بوثيقة تكافل بحري إسلامية',
        halal_conditions: [
            'استبدال Marine Insurance بوثيقة تكافل بحري من شركة تكافل معتمدة',
            'الإفصاح التام عن قسط التكافل في العقد',
            'تحديد شروط وثيقة التكافل (Institute Cargo Clauses بديل تكافلي)'
        ],
        halal_alternative: 'CIT — Cost, Takaful and Freight',
        risk_level: 'high',
        recommended_for: ['يُستبدل بـ CIT (التكافل بدل التأمين التجاري)']
    },
    {
        code: 'CPT',
        name: 'Carriage Paid To — الشحن مدفوع حتى الوجهة',
        group: 'C',
        risk_transfer: 'الخطر في أول ناقل — البائع يدفع كل الشحن',
        sharia_status: 'جائز بشرط',
        sharia_issues: ['انفصال نقطة الخطر عن نقطة التسليم النهائي — قد يُسبب جهالة'],
        sharia_notes: 'يجب توضيح نقطة انتقال الخطر بوضوح في العقد',
        halal_conditions: [
            'تحديد دقيق لنقطة تسليم الناقل الأول',
            'التأمين التكافلي على عاتق المشتري من نقطة الخطر',
            'توثيق مسار النقل كاملاً'
        ],
        risk_level: 'medium',
        recommended_for: ['شحن متعدد الوسائط']
    },
    {
        code: 'CIP',
        name: 'Carriage and Insurance Paid To — الشحن والتأمين مدفوعان',
        group: 'C',
        risk_transfer: 'الخطر في أول ناقل — البائع يدفع الشحن والتأمين الكامل',
        sharia_status: 'محظور بالصيغة التقليدية — يُسمح بديل التكافل',
        sharia_issues: [
            'يشترط يونكوتيرمز 2020 تأمين ICC-A (أفضل تغطية) — وهو تأمين تجاري ربوي',
            'نفس إشكاليات CIF مع تغطية أوسع'
        ],
        sharia_notes: '⚠️ أشد من CIF خطورة لأنه يشترط ICC-A (الأعلى تكلفة وأكثر غرراً)',
        halal_conditions: [
            'استبدال ICC-A بوثيقة تكافل ICC-A مكافئة من شركة تكافل',
            'اشتراط الإفصاح عن شركة التكافل في العقد'
        ],
        halal_alternative: 'CIT-A — Carriage, All-Risk Takaful Paid To',
        risk_level: 'high',
        recommended_for: ['يُستبدل بـ CPT + تكافل مستقل']
    },
    {
        code: 'DAP',
        name: 'Delivered at Place — التسليم في المكان المتفق عليه',
        group: 'D',
        risk_transfer: 'البائع يتحمل كل الخطر حتى الوجهة المتفق عليها',
        sharia_status: 'جائز',
        sharia_issues: [],
        sharia_notes: 'من أوضح الصيغ شرعاً — التسليم محدد والخطر على البائع كاملاً',
        halal_conditions: [
            'تحديد مكان التسليم بالدقة الكاملة',
            'التأمين التكافلي على عاتق البائع حتى التسليم',
            'تحديد المهلة الزمنية للتسليم'
        ],
        risk_level: 'low',
        recommended_for: ['تجارة السكراب والمعادن دولياً', 'بضائع ذات قيمة عالية']
    },
    {
        code: 'DPU',
        name: 'Delivered at Place Unloaded — التسليم بعد التفريغ',
        group: 'D',
        risk_transfer: 'البائع يتحمل حتى تفريغ البضاعة في الوجهة',
        sharia_status: 'جائز',
        sharia_issues: [],
        sharia_notes: 'واضح شرعاً — البائع مسؤول حتى لحظة اكتمال التفريغ',
        halal_conditions: [
            'تحديد موقع التفريغ بدقة',
            'وثيقة استلام بعد التفريغ',
            'التأمين التكافلي حتى التفريغ'
        ],
        risk_level: 'low',
        recommended_for: ['مستودعات المعادن والسكراب']
    },
    {
        code: 'DDP',
        name: 'Delivered Duty Paid — التسليم مع دفع الرسوم الجمركية',
        group: 'D',
        risk_transfer: 'البائع يتحمل كل شيء بما فيه الجمارك حتى باب المشتري',
        sharia_status: 'جائز مع تحفظات',
        sharia_issues: [
            'تكاليف الجمارك قد تتغير — يُفضي لغرر في الثمن',
            'قد يحتوي على ضرائب ربوية أو غرامات تأخير ربوية'
        ],
        sharia_notes: 'الأصل جائز لكن يجب الاحتراز من الغرامات الجمركية المبهمة',
        halal_conditions: [
            'تثبيت مبلغ الجمارك أو وضع سقف واضح',
            'النص على أن الغرامات —إن وُجدت— لا تُمرَّر للمشتري كفائدة',
            'استخدام ضمان جمركي (Customs Bond) حلال'
        ],
        risk_level: 'medium',
        recommended_for: ['تجارة مع دول ذات جمارك ثابتة']
    }
];

// ───────────────────────────────────────────────
// التأمين التجاري — المشاكل الشرعية والبديل الحلال
// ───────────────────────────────────────────────
const INSURANCE_ANALYSIS = {
    conventional_insurance: {
        name: 'التأمين التجاري البحري',
        types: ['Marine Cargo Insurance', 'ICC-A', 'ICC-B', 'ICC-C', 'War Risk', 'Strike Risk'],
        sharia_problems: [
            {
                issue: 'الغرر الفاحش',
                detail: 'المؤمَّن يدفع قسطاً مقابل مبلغ مجهول وحادث مجهول — جهالة مفضية للنزاع',
                daleel: 'نهى النبي ﷺ عن بيع الغرر — رواه مسلم'
            },
            {
                issue: 'الميسر',
                detail: 'التأمين يعتمد على الاحتمال والضربة الحظية — أحد يكسب والآخر يخسر دائماً',
                daleel: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ... رِجْسٌ — المائدة:90'
            },
            {
                issue: 'الربا في الاستثمار',
                detail: 'أقساط التأمين تُستثمر في سندات الفائدة والبنوك الربوية',
                daleel: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:275'
            },
            {
                issue: 'الجهالة في الاستحقاق',
                detail: 'لا يعلم المؤمَّن هل سيحصل على التعويض أم لا — وقد لا يكون الحادث مشمولاً',
                daleel: 'نهي النبي ﷺ عن بيع ما ليس عندك'
            }
        ],
        verdict: 'محرم — لا يحل الاستعانة به إلا عند الضرورة القصوى مع إزالة الضرورة بأسرع وقت'
    },
    takaful_insurance: {
        name: 'التأمين التكافلي البحري',
        arabic_name: 'وثيقة التكافل البحري',
        mechanism: 'التبرع المشروط — يتبرع المشاركون في صندوق مشترك، والفائض يُوزَّع على المشاركين أو يُنقل للسنة القادمة',
        principles: [
            'التعاون والتكافل — المشاركون يساعد بعضهم',
            'الخلو من الغرر — الصندوق المشترك يُزيل الغرر الفردي',
            'الاستثمار في الحلال فقط — صكوك + أسهم حلال',
            'فائض الصندوق يعود للمشاركين (لا للشركة)'
        ],
        types: [
            { name: 'تكافل وكالة', detail: 'الشركة وكيل عن المشاركين بأجر محدد' },
            { name: 'تكافل مضاربة', detail: 'الشركة مضارب تحصل على نسبة من الفائض' },
            { name: 'تكافل وكالة-مضاربة', detail: 'نموذج هجين — الأكثر شيوعاً اليوم' }
        ],
        approved_companies_examples: [
            'شركة التكافل الإسلامي (Salama)',
            'شركة تكافل للتأمين (ماليزيا)',
            'أبوظبي الوطني للتكافل',
            'شركة إثمار للتأمين التكافلي',
            'MedGulf Takaful'
        ],
        verdict: 'جائز — الأصل المعتمد لدى هيئات الفقه الإسلامي ومجمع الفقه الدولي'
    },
    // شروط وثيقة التكافل البحري
    takaful_cargo_conditions: {
        equivalent_to: {
            'ICC-A التجاري': 'تكافل شامل — All Risks Takaful (جميع الأخطار عدا المستثناة)',
            'ICC-B التجاري': 'تكافل محدود — Named Perils Takaful',
            'ICC-C التجاري': 'تكافل أساسي — Basic Perils Takaful'
        },
        must_include: [
            'مبلغ التكافل المعيّن بوضوح',
            'نوع البضاعة ووصفها',
            'رحلة الشحن كاملة مع الموانئ',
            'مدة الوثيقة',
            'الأخطار المغطاة والمستثناة',
            'آلية التعويض وفق نظام التبرع'
        ]
    }
};

// ───────────────────────────────────────────────
// تمويل التجارة الحلال (بديل الائتمان التجاري الربوي)
// ───────────────────────────────────────────────
const HALAL_TRADE_FINANCE = [
    {
        name: 'خطاب الاعتماد المستندي التكافلي',
        arabic: 'الاعتماد المستندي المقرون بالتكافل',
        english: 'Islamic Letter of Credit (LC)',
        mechanism: 'البنك وكيل عن المشتري — يدفع البائع بمجرد تقديم الوثائق الصحيحة',
        replaces: 'خطاب اعتماد مع تأمين تجاري ربوي',
        sharia_basis: 'عقد الوكالة + عقد الكفالة المشروعة',
        conditions: [
            'اختيار بنك إسلامي أو نافذة إسلامية معتمدة',
            'ربط اعتماد التأمين بوثيقة تكافل',
            'غياب أي فائدة على التأخير (لا late payment interest)'
        ],
        suitable_for: ['استيراد المعادن', 'شحن السكراب الدولي']
    },
    {
        name: 'المرابحة للآمر بالشراء',
        english: 'Murabaha for Importer',
        mechanism: 'البنك الإسلامي يشتري البضاعة بنفسه ثم يبيعها للمستورد بهامش ربح معلوم',
        replaces: 'قرض الاستيراد الربوي (Import Loan)',
        sharia_basis: 'وَأَحَلَّ اللَّهُ الْبَيْعَ — عقد بيع حقيقي مع قبض',
        conditions: [
            'البنك يقبض البضاعة فعلاً أو حكماً',
            'الهامش محدد مقدماً لا يتغير',
            'لا غرامة تأخير ربوية — يُستبدل بالتبرع للخيرات'
        ],
        suitable_for: ['تمويل شراء المعادن والسكراب']
    },
    {
        name: 'الوكالة بالاستثمار في الشحن',
        english: 'Wakala Shipping Finance',
        mechanism: 'المستثمر يوكل شركة شيخة لتشغيل أموال في تجارة الشحن مقابل أجر وكالة معلوم',
        replaces: 'تمويل شحن بفائدة ثابتة',
        sharia_basis: 'عقد الوكالة — الموكل يحتمل الربح والخسارة',
        conditions: [
            'أجر الوكالة محدد بمبلغ ثابت أو نسبة من الربح (ليس من رأس المال)',
            'إفصاح كامل عن المخاطر',
            'لا ضمان للأصل (عدا التعدي أو التفريط)'
        ],
        suitable_for: ['تمويل رحلات الشحن الطويلة']
    },
    {
        name: 'المشاركة المتناقصة في بواخر الشحن',
        english: 'Diminishing Musharaka — Vessel Financing',
        mechanism: 'البنك الإسلامي والمشغّل يمتلكان الباخرة مشتركاً — المشغّل يشتري حصة البنك تدريجياً',
        replaces: 'قرض تمويل سفينة الشحن (Ship Finance Loan)',
        sharia_basis: 'عقد الشركة + عقد البيع المؤجل الحصص',
        conditions: [
            'تحديد ثمن كل حصة مقدماً',
            'الإجارة الحقيقية لحصة البنك خلال فترة المشاركة',
            'التأمين التكافلي على السفينة'
        ],
        suitable_for: ['تملك سفن الشحن والقطر']
    },
    {
        name: 'الصكوك اللوجستية',
        english: 'Logistics Sukuk',
        mechanism: 'أوراق مالية تمثل حصصاً في أصول لوجستية حقيقية (مستودعات، سفن، شاحنات)',
        replaces: 'سندات الشركات الربوية (Corporate Bonds)',
        sharia_basis: 'الاستثمار في الأصول الحقيقية — عقود الإجارة والمشاركة',
        conditions: [
            'الأصل اللوجستي موجود وموصوف',
            'الصك يمثل حصة في الأصل لا دين',
            'الغلة من إيجار أو ربح التشغيل الحقيقي'
        ],
        suitable_for: ['تمويل منظومة شيخة اللوجستية']
    }
];

// ───────────────────────────────────────────────
// عقود النقل الحلال
// ───────────────────────────────────────────────
const HALAL_TRANSPORT_CONTRACTS = [
    {
        type: 'إجارة الناقل',
        english: 'Ijarah Transport',
        mechanism: 'تأجير وسيلة النقل أو خدمة النقل بأجرة معلومة لمدة أو رحلة محددة',
        sharia_basis: 'عقد الإجارة — الأجر في مقابل المنفعة',
        conditions: [
            'تحديد المسافة أو المدة',
            'تحديد الأجرة مقدماً',
            'وصف البضاعة وحالتها',
            'مسؤولية التلف على الناقل إلا بقوة قاهرة'
        ],
        forbidden_clauses: [
            'فائدة تأخير على الأجرة المتأخرة (يُستبدل بشرط جزائي لا فائدة)',
            'تأمين إلزامي تجاري (يُستبدل بتكافل)',
            'غرامة تلف غير محددة مقدماً'
        ]
    },
    {
        type: 'المقاولة اللوجستية',
        english: 'Logistics Muqawala',
        mechanism: 'عقد مقاولة — الناقل يلتزم بتسليم البضاعة سليمة بأجر كلي',
        sharia_basis: 'عقد الصنع (الاستصناع) بامتداده للخدمات',
        conditions: [
            'تحديد المبلغ الكلي للخدمة',
            'تحديد مراحل التسليم',
            'ضمان الجودة والسلامة'
        ]
    },
    {
        type: 'المشاركة في الشحن',
        english: 'Shipping Musharaka',
        mechanism: 'شريكان يتقاسمان تكاليف الشحن وعائداته',
        sharia_basis: 'عقد الشركة — الربح بالنسبة والخسارة بالرأس',
        conditions: [
            'تحديد نسبة المشاركة مقدماً',
            'التحمل المشترك للمخاطر',
            'لا يضمن أحدهما رأس مال الآخر'
        ]
    }
];

// ───────────────────────────────────────────────
// مخطط اتخاذ القرار — أي Incoterm أختار؟
// ───────────────────────────────────────────────
const DECISION_GUIDE = {
    exporter_wants_max_control: {
        recommendation: 'EXW أو FCA',
        reason: 'تسليم مبكر، خطر أقل على البائع، لا تأمين إلزامي'
    },
    importer_wants_delivery_at_door: {
        recommendation: 'DAP أو DPU',
        reason: 'البائع يتحمل كل شيء حتى الباب — واضح شرعاً'
    },
    sea_freight_bulk_metals: {
        recommendation: 'FOB + تكافل مستقل',
        reason: 'FOB الأكثر استخداماً في المعادن — التكافل على عاتق المشتري من الميناء'
    },
    need_exporter_pays_freight: {
        recommendation: 'CPT أو DAP بدل CFR/CIF',
        reason: 'CFR وCIF فيهما غرر في حساب الشحن — CPT أوضح'
    },
    need_all_inclusive_price: {
        recommendation: 'DDP مع Takaful',
        reason: 'البائع مسؤول عن كل شيء — يسهّل التسعير'
    },
    multimodal_transport: {
        recommendation: 'FCA أو CPT',
        reason: 'صُمِّمتا للشحن متعدد الوسائط'
    }
};

// ───────────────────────────────────────────────
// نموذج عقد شحن إسلامي (بنود جوهرية)
// ───────────────────────────────────────────────
const ISLAMIC_SHIPPING_CONTRACT_TEMPLATE = {
    title: 'نموذج عقد نقل بضاعة وفق الشريعة الإسلامية',
    mandatory_clauses: [
        {
            clause: 'الأطراف',
            text: 'يُعرَّف المرسِل والمرسَل إليه والناقل بالبيانات القانونية الكاملة'
        },
        {
            clause: 'وصف البضاعة',
            text: 'يُوصف الوزن والحجم والنوع والحالة وصفاً نافياً للجهالة'
        },
        {
            clause: 'الأجرة',
            text: 'أجرة كلية محددة: [المبلغ] [العملة] — لا تتأثر بالتضخم ولا بأسعار الوقود لاحقاً'
        },
        {
            clause: 'التكافل',
            text: 'يُغطى الشحن بوثيقة تكافل بحري من [شركة التكافل] بقيمة [المبلغ] — ليس بتأمين تجاري'
        },
        {
            clause: 'المسؤولية',
            text: 'الناقل مسؤول عن التلف والضياع إلا بقوة قاهرة مُثبَتة — بلا سقف ربوي'
        },
        {
            clause: 'التأخير',
            text: 'في حال التأخير يُطبَّق خصم من الأجرة [مبلغ يومي محدد] — لا فائدة تأخير'
        },
        {
            clause: 'فض النزاعات',
            text: 'تُفضّ النزاعات وفق أحكام الشريعة الإسلامية أمام [هيئة التحكيم الإسلامية / القضاء السعودي]'
        },
        {
            clause: 'القانون المطبق',
            text: 'يخضع هذا العقد لأحكام الفقه الإسلامي والنظام التجاري للمملكة العربية السعودية'
        }
    ],
    forbidden_clauses: [
        'أي بند يشترط دفع فائدة على التأخير (Interest on Late Payment)',
        'أي بند يلزم بتأمين تجاري دون بديل تكافلي',
        'أي بند يتضمن غرامات مجهولة المقدار',
        'أي بند يحوّل الخسارة لطرف دون مقابل (بغير عقد شركة أو وكالة)'
    ]
};

// ───────────────────────────────────────────────
// API Functions
// ───────────────────────────────────────────────

/**
 * الإحصائيات العامة للمحرك
 */
function getEngineStats() {
    return {
        total_incoterms: INCOTERMS_ANALYSIS.length,
        halal_incoterms: INCOTERMS_ANALYSIS.filter(i => i.sharia_status === 'جائز').length,
        caution_incoterms: INCOTERMS_ANALYSIS.filter(i => i.sharia_status.includes('بشرط')).length,
        problematic_incoterms: INCOTERMS_ANALYSIS.filter(i => i.sharia_status.includes('محظور') || i.sharia_status.includes('محل نظر')).length,
        halal_finance_instruments: HALAL_TRADE_FINANCE.length,
        halal_transport_contracts: HALAL_TRANSPORT_CONTRACTS.length,
        quran_references: SHARIA_BASIS.quran.length,
        hadith_references: SHARIA_BASIS.hadith.length,
        fiqh_rules: SHARIA_BASIS.fiqh_rules.length,
        engine_version: '1.0.0',
        phase: 40
    };
}

/**
 * كل تحليل يونكوتيرمز
 */
function getAllIncoterms() {
    return INCOTERMS_ANALYSIS;
}

/**
 * تحليل Incoterm معيّن
 */
function getIncoterm(code) {
    return INCOTERMS_ANALYSIS.find(i => i.code.toUpperCase() === code.toUpperCase()) || null;
}

/**
 * يونكوتيرمز الحلال فقط
 */
function getHalalIncoterms() {
    return INCOTERMS_ANALYSIS.filter(i => i.sharia_status === 'جائز');
}

/**
 * يونكوتيرمز تحتاج تنبيهاً أو تعديلاً
 */
function getCautionIncoterms() {
    return INCOTERMS_ANALYSIS.filter(i => i.sharia_status !== 'جائز');
}

/**
 * تحليل التأمين الكامل
 */
function getInsuranceAnalysis() {
    return INSURANCE_ANALYSIS;
}

/**
 * أدوات التمويل الحلال
 */
function getHalalFinanceInstruments() {
    return HALAL_TRADE_FINANCE;
}

/**
 * عقود النقل الحلال
 */
function getHalalTransportContracts() {
    return HALAL_TRANSPORT_CONTRACTS;
}

/**
 * دليل اختيار Incoterm
 */
function getDecisionGuide() {
    return DECISION_GUIDE;
}

/**
 * نموذج عقد الشحن
 */
function getContractTemplate() {
    return ISLAMIC_SHIPPING_CONTRACT_TEMPLATE;
}

/**
 * الأسس الشرعية
 */
function getShariaBase() {
    return SHARIA_BASIS;
}

/**
 * تقييم Incoterm محدد مع توصية
 */
function evaluateIncoterm(code) {
    const inc = getIncoterm(code);
    if (!inc) {
        return { success: false, message: `الكود ${code} غير موجود` };
    }
    const risk_map = { low: 'منخفض', medium: 'متوسط', high: 'عالٍ' };
    return {
        success: true,
        code: inc.code,
        name: inc.name,
        sharia_status: inc.sharia_status,
        risk_level: risk_map[inc.risk_level] || inc.risk_level,
        issues: inc.sharia_issues,
        halal_conditions: inc.halal_conditions,
        halal_alternative: inc.halal_alternative || null,
        recommendation: inc.sharia_status === 'جائز'
            ? `✅ ${inc.code} جائز شرعاً — اتبع الشروط الحلال`
            : inc.sharia_status.includes('محظور')
                ? `⛔ ${inc.code} محظور بصيغته — استخدم: ${inc.halal_alternative || 'بديل تكافلي'}`
                : `⚠️ ${inc.code} يحتاج تعديلات — اقرأ الشروط`
    };
}

module.exports = {
    getEngineStats,
    getAllIncoterms,
    getIncoterm,
    getHalalIncoterms,
    getCautionIncoterms,
    getInsuranceAnalysis,
    getHalalFinanceInstruments,
    getHalalTransportContracts,
    getDecisionGuide,
    getContractTemplate,
    getShariaBase,
    evaluateIncoterm
};
