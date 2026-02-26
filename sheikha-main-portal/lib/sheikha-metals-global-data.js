/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة — بيانات المعادن العالمية الشاملة
 * المصادر | الإنتاج | الاحتياطي | التكاليف | السعودية | جزيرة العرب | الدول الإسلامية
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ" — الحديد ٢٥
 * "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ" — الملك ١٥
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const METALS_GLOBAL_DATA = {

    islamicFoundation: {
        principle: 'المعادن رزق الله في الأرض — "فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ"',
        verses: [
            { ref: 'الملك:15', text: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ', application: 'استكشاف الثروات المعدنية والاستفادة منها' },
            { ref: 'الحديد:25', text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', application: 'الحديد أُنزل من السماء (حقيقة علمية: نيزكي الأصل)' },
            { ref: 'النحل:13', text: 'وَمَا ذَرَأَ لَكُمْ فِي الْأَرْضِ مُخْتَلِفًا أَلْوَانُهُ', application: 'تنوع المعادن وألوانها — كل معدن بلون وخصائص' },
            { ref: 'الرعد:17', text: 'وَمِمَّا يُوقِدُونَ عَلَيْهِ فِي النَّارِ ابْتِغَاءَ حِلْيَةٍ أَوْ مَتَاعٍ زَبَدٌ مِّثْلُهُ', application: 'الصهر والتنقية — "ابتغاء حلية" (ذهب/فضة) "أو متاع" (حديد/نحاس)' }
        ],
        shariaRulesForMining: [
            { rule: 'المعادن ملك للأمة', source: 'الناس شركاء في ثلاثة — وقاسه بعض العلماء على المعادن', application: 'حق الدولة في تنظيم التعدين' },
            { rule: 'زكاة المعادن', source: 'وَفِي الرِّكَازِ الْخُمُس — متفق عليه', application: 'الركاز (المعدن المستخرج) فيه 20% زكاة عند الجمهور' },
            { rule: 'عدم الإضرار بالبيئة', source: 'لا ضرر ولا ضرار', application: 'التعدين المسؤول — حماية البيئة واجبة' },
            { rule: 'الإتقان في الاستخراج', source: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', application: 'معايير سلامة وجودة صارمة' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // بيانات كل معدن — من المنجم إلى السوق
    // ═══════════════════════════════════════════════════════════════

    gold: {
        nameAr: 'ذهب', symbol: 'Au',
        globalProduction: { annual: '3,300 طن', year: 2024 },
        globalReserves: { total: '59,000 طن', note: 'في باطن الأرض — يُقدّر بـ 20 سنة إنتاج' },
        aboveGroundStock: '208,874 طن — كل الذهب المُستخرج في التاريخ',
        topProducers: [
            { country: 'الصين', production: '370 طن/سنة', share: '11%', reserves: '3,000 طن' },
            { country: 'روسيا', production: '310 طن/سنة', share: '9.4%', reserves: '6,800 طن' },
            { country: 'أستراليا', production: '310 طن/سنة', share: '9.4%', reserves: '12,000 طن (الأكبر)' },
            { country: 'كندا', production: '200 طن/سنة', share: '6%', reserves: '2,300 طن' },
            { country: 'الولايات المتحدة', production: '170 طن/سنة', share: '5%', reserves: '3,000 طن' },
            { country: 'غانا', production: '130 طن/سنة', share: '4%', reserves: '1,000 طن' },
            { country: 'المكسيك', production: '120 طن/سنة', share: '3.6%' },
            { country: 'إندونيسيا 🇮🇩', production: '110 طن/سنة', share: '3.3%', islamic: true },
            { country: 'أوزبكستان 🇺🇿', production: '100 طن/سنة', share: '3%', islamic: true }
        ],
        saudi: {
            production: '16 طن/سنة (2024)',
            reserves: '658 طن احتياطي مؤكد',
            potential: 'يُقدّر بأكثر من 3,300 طن — الدرع العربي غني بالذهب',
            mines: [
                { name: 'منجم مهد الذهب', location: 'المدينة المنورة', production: '4 طن/سنة', operator: 'معادن', history: 'أقدم منجم ذهب في الجزيرة العربية — عمره 3,000+ سنة', note: 'يُعتقد أنه منجم سليمان عليه السلام' },
                { name: 'منجم الدويحي', location: 'مكة المكرمة', production: '6 طن/سنة', operator: 'معادن', note: 'أكبر منجم ذهب في السعودية' },
                { name: 'منجم الصخيبرات', location: 'القصيم', production: '2 طن/سنة', operator: 'معادن' },
                { name: 'منجم بلغة', location: 'المدينة المنورة', production: '2 طن/سنة', operator: 'معادن' },
                { name: 'منجم منصورة-مسرة', location: 'المدينة المنورة', production: '2 طن/سنة', operator: 'معادن', note: 'مشروع جديد — افتُتح 2024' }
            ],
            company: 'شركة معادن (Ma\'aden) — تداول: 1211',
            vision2030: 'هدف رؤية 2030: زيادة إنتاج الذهب إلى 30+ طن/سنة'
        },
        arabPeninsula: {
            uae: { production: '—', note: 'لا إنتاج — مركز تجارة وتكرير عالمي', refineries: ['إمارات غولد (75+ طن/سنة تكرير)'] },
            oman: { production: '0.5 طن/سنة', mines: ['منجم الزهراء — شمال الباطنة'] },
            yemen: { potential: 'احتياطي كبير غير مستغل — وسط البلاد', note: 'الاضطرابات أوقفت التنقيب' }
        },
        islamicCountries: [
            { country: 'إندونيسيا', production: '110 طن/سنة', mine: 'جراسبرج — أكبر منجم ذهب في العالم', note: 'ثروة هائلة' },
            { country: 'أوزبكستان', production: '100 طن/سنة', mine: 'مورونتاو — من أكبر المناجم المكشوفة عالمياً' },
            { country: 'مالي', production: '70 طن/سنة', note: 'ثالث أكبر منتج في أفريقيا' },
            { country: 'السودان', production: '50-80 طن/سنة', note: 'تعدين أهلي واسع — الأرقام الحقيقية أكبر' },
            { country: 'تركيا', production: '35 طن/سنة', note: 'نمو سريع في الإنتاج' },
            { country: 'مصر', production: '15 طن/سنة', mine: 'منجم السكري — أكبر منجم في مصر', potential: 'الصحراء الشرقية غنية' },
            { country: 'كازاخستان', production: '70 طن/سنة' },
            { country: 'بوركينا فاسو', production: '60 طن/سنة' },
            { country: 'غينيا', production: '30 طن/سنة' },
            { country: 'السعودية', production: '16 طن/سنة' }
        ],
        islamicWorldTotal: 'الدول الإسلامية تنتج ~636 طن/سنة = ~19% من الإنتاج العالمي',
        costChain: {
            nameAr: 'سلسلة التكاليف — من المنجم إلى السوق',
            stages: [
                { stage: 'استكشاف', costRange: '50-200 $/أونصة', desc: 'مسوحات جيولوجية + حفر استكشافي', duration: '3-10 سنوات' },
                { stage: 'تطوير المنجم', costRange: '500M-5B $', desc: 'بناء المنجم + البنية التحتية', duration: '2-5 سنوات' },
                { stage: 'استخراج الخام', costRange: '300-600 $/أونصة', desc: 'تفجير + تحميل + نقل — خام يحتوي 1-10 g/طن ذهب', method: 'مكشوف أو تحت أرضي' },
                { stage: 'تكسير وطحن', costRange: '100-200 $/أونصة', desc: 'تحويل الصخر إلى مسحوق ناعم' },
                { stage: 'استخلاص', costRange: '150-300 $/أونصة', desc: 'سيانيد أو جاذبية — نقاوة 70-90%', method: 'CIL / Heap Leach / Gravity' },
                { stage: 'صهر وتكرير', costRange: '20-50 $/أونصة', desc: 'من 90% إلى 99.99% نقاوة', refiners: 'LBMA Good Delivery' },
                { stage: 'تصنيع (سبائك/مجوهرات)', costRange: '10-500 $/أونصة', desc: 'صب سبائك أو صياغة مجوهرات', margin: '3-50% حسب المنتج' },
                { stage: 'نقل وتأمين', costRange: '5-15 $/أونصة', desc: 'شحن مؤمّن + تخزين خزائن' },
                { stage: 'بيع', cost: 'سعر السوق العالمي', desc: 'LBMA Fix أو COMEX', currentApprox: '~2,900 $/أونصة (2025)' }
            ],
            allInSustainingCost: {
                global: '1,100-1,400 $/أونصة (AISC)',
                desc: 'تكلفة الإنتاج الشاملة — استخراج + معالجة + إدارة + صيانة + استكشاف',
                profitMargin: '~50-60% عند السعر الحالي'
            }
        },
        scarcity: { index: 'نادر جداً', earthCrust: '0.004 ppm', oceanConcentration: '0.01 µg/L', miningDepth: 'حتى 4 كم تحت الأرض' }
    },

    silver: {
        nameAr: 'فضة', symbol: 'Ag',
        globalProduction: { annual: '26,000 طن', year: 2024 },
        globalReserves: { total: '550,000 طن' },
        topProducers: [
            { country: 'المكسيك', production: '6,300 طن/سنة', share: '24%' },
            { country: 'الصين', production: '3,400 طن/سنة', share: '13%' },
            { country: 'البيرو', production: '3,100 طن/سنة', share: '12%' },
            { country: 'تشيلي', production: '1,600 طن/سنة' },
            { country: 'بولندا', production: '1,300 طن/سنة' }
        ],
        saudi: { production: '12 طن/سنة (مُنتج ثانوي من مناجم الذهب والنحاس)', company: 'معادن' },
        islamicCountries: [
            { country: 'تركيا', production: '450 طن/سنة' },
            { country: 'إندونيسيا', production: '300 طن/سنة' },
            { country: 'كازاخستان', production: '1,100 طن/سنة' },
            { country: 'المغرب', production: '300 طن/سنة' },
            { country: 'إيران', production: '100 طن/سنة' }
        ],
        costChain: {
            stages: [
                { stage: 'استخراج', costRange: '8-14 $/أونصة', desc: '70% مُنتج ثانوي من مناجم نحاس/ذهب/رصاص' },
                { stage: 'تكرير', costRange: '1-3 $/أونصة', desc: 'تنقية إلى 999.9' },
                { stage: 'تصنيع', costRange: '2-10 $/أونصة', desc: 'سبائك أو صناعي' },
                { stage: 'بيع', currentApprox: '~33 $/أونصة (2025)' }
            ],
            allInSustainingCost: '12-18 $/أونصة'
        },
        scarcity: { index: 'نادر', earthCrust: '0.075 ppm' }
    },

    iron: {
        nameAr: 'حديد', symbol: 'Fe',
        quranNote: 'الحديد أُنزل من السماء حقاً — العلم الحديث أثبت أن كل حديد الأرض أصله نيزكي من انفجارات نجوم عملاقة (سوبرنوفا)',
        globalProduction: { annual: '2.5 مليار طن خام حديد | 1.9 مليار طن فولاذ', year: 2024 },
        globalReserves: { total: '180 مليار طن خام حديد', sufficient: '+70 سنة' },
        topProducers: [
            { country: 'أستراليا', production: '900 مليون طن خام/سنة', share: '36%', reserves: '50 مليار طن' },
            { country: 'البرازيل', production: '380 مليون طن/سنة', share: '15%', reserves: '34 مليار طن' },
            { country: 'الصين', production: '360 مليون طن/سنة', steelProduction: '1,060 مليون طن فولاذ = 54% عالمياً' },
            { country: 'الهند', production: '270 مليون طن/سنة', steelProduction: '140 مليون طن فولاذ' },
            { country: 'روسيا', production: '100 مليون طن/سنة' }
        ],
        saudi: {
            steelProduction: '9 مليون طن فولاذ/سنة',
            imports: 'تستورد ~70% من خام الحديد',
            companies: [
                { name: 'حديد سابك (HADEED)', capacity: '6 مليون طن/سنة', products: 'حديد تسليح + مسطحات', location: 'الجبيل', note: 'أكبر منتج حديد في الخليج' },
                { name: 'شركة الراجحي للصلب', capacity: '1 مليون طن/سنة', location: 'الرياض' },
                { name: 'الاتفاق للصلب', capacity: '1 مليون طن/سنة', location: 'الدمام' },
                { name: 'حديد الجبيل (SULB)', capacity: '2 مليون طن/سنة', location: 'الجبيل', note: 'مسطحات فولاذية' }
            ],
            ironOre: {
                deposits: 'وادي صواوين (تبوك) — 700 مليون طن خام حديد',
                explorationNote: 'هيئة المساحة الجيولوجية تكتشف مواقع جديدة باستمرار'
            }
        },
        arabPeninsula: {
            uae: { steelCapacity: '3.5 مليون طن/سنة', company: 'إمارات ستيل (أركان)' },
            oman: { steelCapacity: '2 مليون طن/سنة', companies: ['جندل للحديد والصلب', 'شركة عمان للصلب'] },
            bahrain: { steelCapacity: '1.5 مليون طن/سنة', company: 'SULB — أكبر مصنع مسطحات في الخليج' },
            qatar: { steelCapacity: '2.5 مليون طن/سنة', company: 'قطر ستيل' },
            kuwait: { steelCapacity: '0.5 مليون طن/سنة' }
        },
        islamicCountries: [
            { country: 'تركيا', steelProduction: '35 مليون طن/سنة', rank: '8 عالمياً' },
            { country: 'إيران', steelProduction: '30 مليون طن/سنة', rank: '10 عالمياً', ironOre: '2.7 مليار طن احتياطي' },
            { country: 'إندونيسيا', steelProduction: '15 مليون طن/سنة', nickelPigIron: 'أكبر منتج' },
            { country: 'مصر', steelProduction: '10 مليون طن/سنة', company: 'حديد عز' },
            { country: 'باكستان', steelProduction: '5 مليون طن/سنة' },
            { country: 'الجزائر', steelProduction: '4 مليون طن/سنة', ironOre: 'غار جبيلات — 3 مليار طن (من أكبر مناجم العالم)' },
            { country: 'موريتانيا', ironOreProduction: '13 مليون طن خام/سنة', reserves: '1.5 مليار طن', note: 'منجم زويرات — العمود الفقري للاقتصاد' },
            { country: 'ماليزيا', steelProduction: '7 مليون طن/سنة' },
            { country: 'كازاخستان', steelProduction: '5 مليون طن/سنة' }
        ],
        islamicWorldTotal: 'الدول الإسلامية تنتج ~150 مليون طن فولاذ/سنة = ~8% من الإنتاج العالمي',
        costChain: {
            stages: [
                { stage: 'استخراج خام الحديد', costRange: '15-40 $/طن', desc: 'منجم مكشوف — نسبة الحديد 58-67%' },
                { stage: 'تكسير وتكوير', costRange: '10-25 $/طن', desc: 'تحويل الخام إلى كريات حديد' },
                { stage: 'نقل بحري', costRange: '10-30 $/طن', desc: 'من أستراليا/البرازيل إلى الخليج', route: 'أستراليا→الجبيل: ~12 يوم' },
                { stage: 'اختزال مباشر (DRI)', costRange: '80-120 $/طن', desc: 'تحويل خام الحديد إلى حديد مختزل — بالغاز الطبيعي', method: 'MIDREX / HYL', note: 'السعودية تستخدم هذه الطريقة (غاز رخيص)' },
                { stage: 'صهر (فرن قوسي)', costRange: '50-80 $/طن', desc: 'إذابة الحديد المختزل + سكراب → فولاذ سائل', energy: '400-500 kWh/طن' },
                { stage: 'صب مستمر', costRange: '20-30 $/طن', desc: 'تحويل الفولاذ السائل إلى بيليت/سلاب' },
                { stage: 'درفلة (تصنيع)', costRange: '50-100 $/طن', desc: 'بيليت → حديد تسليح / سلاب → ألواح / لفائف' },
                { stage: 'نقل محلي', costRange: '10-30 $/طن', desc: 'من المصنع إلى التاجر/المشروع' },
                { stage: 'بيع', currentApprox: 'حديد تسليح: ~550-700 $/طن | لفائف: ~600-800 $/طن' }
            ],
            totalCostDRI: '~350-500 $/طن فولاذ (الطريقة السعودية — DRI + EAF)',
            totalCostBF: '~300-450 $/طن فولاذ (الطريقة الصينية — فرن لافح)',
            saudiAdvantage: 'الغاز الطبيعي الرخيص يعطي ميزة تنافسية في الاختزال المباشر'
        },
        scarcity: { index: 'وفير جداً', earthCrust: '5% من قشرة الأرض — رابع أكثر العناصر', coreComposition: '85% من نواة الأرض حديد' }
    },

    copper: {
        nameAr: 'نحاس', symbol: 'Cu',
        quranNote: 'القِطر في القرآن = النحاس المصهور — "آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا"',
        globalProduction: { annual: '22 مليون طن', year: 2024 },
        globalReserves: { total: '870 مليون طن', sufficient: '~40 سنة بالمعدل الحالي' },
        topProducers: [
            { country: 'تشيلي', production: '5.3 مليون طن/سنة', share: '24%', reserves: '190 مليون طن' },
            { country: 'البيرو', production: '2.7 مليون طن/سنة', share: '12%' },
            { country: 'الكونغو', production: '2.5 مليون طن/سنة', share: '11%' },
            { country: 'الصين', production: '1.9 مليون طن/سنة' },
            { country: 'الولايات المتحدة', production: '1.2 مليون طن/سنة' }
        ],
        saudi: {
            production: '45,000 طن/سنة (2024)',
            mines: [
                { name: 'منجم جبل صايد', location: 'المدينة المنورة', production: '45,000 طن نحاس/سنة', operator: 'معادن + باريك غولد', note: 'أكبر منجم نحاس في السعودية — يحتوي ذهب وفضة أيضاً' }
            ],
            potential: 'الدرع العربي يحتوي احتياطيات نحاس كبيرة غير مستغلة',
            company: 'معادن (Ma\'aden)'
        },
        islamicCountries: [
            { country: 'تركيا', production: '120,000 طن/سنة' },
            { country: 'إندونيسيا', production: '800,000 طن/سنة', mine: 'جراسبرج — أكبر منجم نحاس في العالم' },
            { country: 'كازاخستان', production: '550,000 طن/سنة' },
            { country: 'إيران', production: '300,000 طن/سنة', mine: 'سرچشمه — من أكبر المناجم عالمياً' },
            { country: 'عمان', production: '40,000 طن/سنة', history: 'عُمان كانت مصدر النحاس في العالم القديم — "مجان"' },
            { country: 'أفغانستان', potential: 'عينك — من أكبر مكامن النحاس غير المستغلة (12 مليون طن)', note: 'لم يُستغل بسبب الاضطرابات' }
        ],
        islamicWorldTotal: '~1.9 مليون طن/سنة = ~9% من الإنتاج العالمي',
        costChain: {
            stages: [
                { stage: 'استخراج خام', costRange: '1,500-3,000 $/طن نحاس', desc: 'منجم مكشوف أو تحت أرضي — خام يحتوي 0.5-2% نحاس' },
                { stage: 'تكسير + تركيز', costRange: '500-1,000 $/طن', desc: 'من 1% → 25-35% نحاس (مركز)' },
                { stage: 'صهر', costRange: '300-600 $/طن', desc: 'تحويل المركز إلى نحاس خام 98%' },
                { stage: 'تكرير كهربائي', costRange: '200-400 $/طن', desc: 'من 98% → 99.99% (كاثود LME Grade A)' },
                { stage: 'تصنيع', costRange: '200-800 $/طن', desc: 'كاثود → أسلاك / أنابيب / ألواح' },
                { stage: 'بيع', currentApprox: '~9,500 $/طن (LME 2025)' }
            ],
            allInSustainingCost: '4,000-6,500 $/طن نحاس'
        },
        scarcity: { index: 'محدود', earthCrust: '50 ppm', futureChallenge: 'الطلب سيتضاعف بسبب الطاقة المتجددة والسيارات الكهربائية' }
    },

    aluminum: {
        nameAr: 'ألمنيوم', symbol: 'Al',
        globalProduction: { annual: '70 مليون طن', year: 2024 },
        globalReserves: { total: '30 مليار طن بوكسايت', sufficient: '+100 سنة' },
        topProducers: [
            { country: 'الصين', production: '40 مليون طن/سنة', share: '57%' },
            { country: 'الهند', production: '4.1 مليون طن/سنة' },
            { country: 'روسيا', production: '3.6 مليون طن/سنة' },
            { country: 'كندا', production: '3.1 مليون طن/سنة' },
            { country: 'الإمارات 🇦🇪', production: '2.7 مليون طن/سنة', share: '3.9%', islamic: true }
        ],
        saudi: {
            production: '740,000 طن/سنة',
            company: 'معادن ألمنيوم (Ma\'aden)',
            complex: 'مجمع رأس الخير — يشمل: مصهر + درفلة + مصنع ألومينا',
            capacity: '740,000 طن ألمنيوم + 1.8 مليون طن ألومينا/سنة',
            bauxiteSource: 'منجم الزبيرة (القصيم) — 4 مليون طن بوكسايت/سنة',
            partnership: 'شراكة معادن + ألكوا (Alcoa)',
            note: 'سادس أكبر مصهر ألمنيوم في العالم'
        },
        arabPeninsula: {
            uae: { production: '2.7 مليون طن/سنة', company: 'إمارات غلوبال ألمنيوم (EGA)', note: 'خامس أكبر منتج عالمياً' },
            bahrain: { production: '1.6 مليون طن/سنة', company: 'ألبا (Alba)', note: 'أكبر مصهر ألمنيوم في العالم (موقع واحد)' },
            oman: { production: '400,000 طن/سنة', company: 'صحار ألمنيوم' },
            qatar: { production: '650,000 طن/سنة', company: 'قطر ألمنيوم (Qatalum)' }
        },
        arabPeninsulaTotal: 'جزيرة العرب تنتج ~6.1 مليون طن = ~8.7% من الإنتاج العالمي — قوة إقليمية في الألمنيوم',
        islamicCountries: [
            { country: 'الإمارات', production: '2.7 مليون طن/سنة' },
            { country: 'البحرين', production: '1.6 مليون طن/سنة' },
            { country: 'السعودية', production: '740,000 طن/سنة' },
            { country: 'قطر', production: '650,000 طن/سنة' },
            { country: 'إندونيسيا', production: '500,000 طن/سنة', bauxite: '1.2 مليار طن احتياطي' },
            { country: 'تركيا', production: '100,000 طن/سنة' },
            { country: 'مصر', production: '350,000 طن/سنة', company: 'مصر للألومنيوم (إيجيبت ألوم)' },
            { country: 'غينيا', bauxiteProduction: '100 مليون طن بوكسايت/سنة (خام)', note: 'أكبر احتياطي بوكسايت في العالم — 7.4 مليار طن' },
            { country: 'ماليزيا', bauxiteProduction: '1 مليون طن/سنة' }
        ],
        islamicWorldTotal: '~6.7 مليون طن ألمنيوم/سنة = ~9.6% عالمياً + غينيا تملك أكبر احتياطي بوكسايت',
        costChain: {
            stages: [
                { stage: 'تعدين البوكسايت', costRange: '25-50 $/طن بوكسايت', desc: '~4 طن بوكسايت = 2 طن ألومينا = 1 طن ألمنيوم' },
                { stage: 'تكرير (ألومينا)', costRange: '300-400 $/طن ألومينا', desc: 'عملية باير — بوكسايت → ألومينا (أكسيد الألمنيوم)' },
                { stage: 'صهر كهربائي', costRange: '1,200-1,800 $/طن ألمنيوم', desc: 'عملية هول-إيرو — كهرباء مكثفة (14,000 kWh/طن)', note: 'الكهرباء = 30-40% من التكلفة' },
                { stage: 'سبك', costRange: '50-100 $/طن', desc: 'ألمنيوم سائل → سبائك (إنجوت/بيليت/سلاب)' },
                { stage: 'درفلة/سحب', costRange: '300-800 $/طن', desc: 'تحويل سبائك → لفائف / قطاعات / رقائق' },
                { stage: 'بيع', currentApprox: '~2,600 $/طن (LME 2025)' }
            ],
            allInSustainingCost: '1,800-2,200 $/طن',
            gulfAdvantage: 'الغاز الطبيعي الرخيص → كهرباء رخيصة → ميزة تنافسية ضخمة في الصهر'
        },
        scarcity: { index: 'وفير', earthCrust: '8% — أكثر المعادن وفرة في قشرة الأرض', recycleNote: 'إعادة التدوير توفر 95% من الطاقة' }
    },

    platinum: {
        nameAr: 'بلاتين', symbol: 'Pt',
        globalProduction: { annual: '190 طن', year: 2024 },
        globalReserves: { total: '69,000 طن' },
        topProducers: [
            { country: 'جنوب أفريقيا', production: '130 طن/سنة', share: '68%', reserves: '63,000 طن (91% من العالم)' },
            { country: 'روسيا', production: '22 طن/سنة', share: '12%' },
            { country: 'زيمبابوي', production: '16 طن/سنة', share: '8%' }
        ],
        islamicCountries: [{ country: 'زيمبابوي (جارة)', note: 'لا توجد دول إسلامية منتجة رئيسية — فرصة للاستيراد والتكرير' }],
        costChain: {
            allInSustainingCost: '900-1,100 $/أونصة',
            currentPrice: '~1,050 $/أونصة (2025)',
            note: 'سعره أقل من تكلفة إنتاجه — قطاع يعاني'
        },
        scarcity: { index: 'نادر جداً', earthCrust: '0.005 ppm', note: 'أندر 30 مرة من الذهب' }
    },

    zinc: {
        nameAr: 'زنك', symbol: 'Zn',
        globalProduction: { annual: '13 مليون طن', year: 2024 },
        globalReserves: { total: '250 مليون طن' },
        topProducers: [
            { country: 'الصين', production: '4.2 مليون طن/سنة', share: '32%' },
            { country: 'البيرو', production: '1.5 مليون طن/سنة' },
            { country: 'أستراليا', production: '1.3 مليون طن/سنة' }
        ],
        islamicCountries: [
            { country: 'تركيا', production: '250,000 طن/سنة' },
            { country: 'كازاخستان', production: '300,000 طن/سنة' },
            { country: 'إيران', production: '200,000 طن/سنة' }
        ],
        costChain: { allInSustainingCost: '1,800-2,200 $/طن', currentPrice: '~2,800 $/طن' },
        primaryUse: 'جلفنة الحديد (60%) — حماية من الصدأ'
    },

    nickel: {
        nameAr: 'نيكل', symbol: 'Ni',
        globalProduction: { annual: '3.3 مليون طن', year: 2024 },
        globalReserves: { total: '100 مليون طن' },
        topProducers: [
            { country: 'إندونيسيا 🇮🇩', production: '1.8 مليون طن/سنة', share: '55%', islamic: true, note: 'المهيمن عالمياً' },
            { country: 'الفلبين', production: '330,000 طن/سنة' },
            { country: 'روسيا', production: '200,000 طن/سنة' }
        ],
        islamicCountries: [
            { country: 'إندونيسيا', production: '1,800,000 طن/سنة', note: 'أكبر منتج نيكل في العالم — 55%' },
            { country: 'تركيا', production: '30,000 طن/سنة' }
        ],
        islamicWorldDominance: 'إندونيسيا وحدها تسيطر على أكثر من نصف إنتاج النيكل العالمي',
        costChain: { allInSustainingCost: '12,000-16,000 $/طن', currentPrice: '~16,000 $/طن' }
    },

    lithium: {
        nameAr: 'ليثيوم', symbol: 'Li',
        strategicImportance: 'حرج — "البترول الأبيض" — عصب بطاريات السيارات الكهربائية',
        globalProduction: { annual: '180,000 طن LCE', year: 2024 },
        globalReserves: { total: '28 مليون طن' },
        topProducers: [
            { country: 'أستراليا', production: '86,000 طن/سنة', share: '48%' },
            { country: 'تشيلي', production: '44,000 طن/سنة', share: '24%' },
            { country: 'الصين', production: '33,000 طن/سنة' },
            { country: 'الأرجنتين', production: '10,000 طن/سنة' }
        ],
        islamicCountries: [
            { country: 'أفغانستان', potential: 'احتياطي ضخم غير مستغل — يُقدّر بملايين الأطنان' },
            { country: 'مالي', potential: 'اكتشافات حديثة — مشاريع استكشاف' }
        ],
        costChain: {
            allInSustainingCost: '8,000-15,000 $/طن LCE',
            currentPrice: '~12,000 $/طن LCE (2025) — انخفض من 80,000 في 2022',
            note: 'أسعار متقلبة جداً'
        }
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// المحرك
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaMetalsGlobalData {
    constructor() {
        this.name = 'منظومة شيخة — بيانات المعادن العالمية';
        this.version = '1.0.0';
        this.data = METALS_GLOBAL_DATA;
    }

    getDashboard() {
        const metals = Object.keys(this.data).filter(k => k !== 'islamicFoundation');
        return {
            name: this.name,
            metalsCount: metals.length,
            metals: metals.map(k => ({ key: k, nameAr: this.data[k].nameAr, symbol: this.data[k].symbol })),
            islamicFoundation: {
                verses: this.data.islamicFoundation.verses.length,
                miningRules: this.data.islamicFoundation.shariaRulesForMining.length
            }
        };
    }

    getMetalFullData(key) {
        const metal = this.data[key];
        if (!metal) return null;
        return { بسم_الله: 'بسم الله الرحمن الرحيم', المعدن: key, ...metal };
    }

    getSaudiData(key) {
        const metal = this.data[key];
        if (!metal || !metal.saudi) return null;
        return { المعدن: metal.nameAr, السعودية: metal.saudi, جزيرة_العرب: metal.arabPeninsula || null };
    }

    getIslamicCountriesData(key) {
        const metal = this.data[key];
        if (!metal) return null;
        return {
            المعدن: metal.nameAr,
            الدول_الإسلامية: metal.islamicCountries || [],
            الإجمالي: metal.islamicWorldTotal || metal.islamicWorldDominance || null
        };
    }

    getCostChain(key) {
        const metal = this.data[key];
        if (!metal || !metal.costChain) return null;
        return { المعدن: metal.nameAr, سلسلة_التكاليف: metal.costChain };
    }

    getReserves(key) {
        const metal = this.data[key];
        if (!metal) return null;
        return {
            المعدن: metal.nameAr,
            الإنتاج_العالمي: metal.globalProduction,
            الاحتياطي_العالمي: metal.globalReserves,
            الندرة: metal.scarcity || null
        };
    }

    getAllMetalsKeys() {
        return Object.keys(this.data).filter(k => k !== 'islamicFoundation');
    }
}

module.exports = SheikhaMetalsGlobalData;
