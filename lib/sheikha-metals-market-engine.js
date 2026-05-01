/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA METALS MARKET ENGINE — سوق شيخة للمعادن والسكراب والتشليح
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ" — الحديد ٢٥
 *
 * ✅ منظومة الذهب والفضة والمعادن الثمينة
 * ✅ منظومة المعادن الأساسية (الصناعية)
 * ✅ منظومة السكراب — Scrap & Recycling
 * ✅ منظومة التشليح — Auto Dismantling & Salvage
 * ✅ الضوابط الشرعية — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaMetalsMarketEngine {
    constructor() {
        this.name = 'سوق شيخة للمعادن والسكراب والتشليح';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.quranReferences = this._initQuranReferences();
        this.preciousMetals = this._initPreciousMetals();
        this.baseMetals = this._initBaseMetals();
        this.scrap = this._initScrap();
        this.tashleeh = this._initTashleeh();
        this.pricing = this._initPricing();
        this.qualityStandards = this._initQualityStandards();
        this.shariaGuidance = this._initShariaGuidance();
    }

    _initQuranReferences() {
        return [
            { id: 'hadeed', surah: 'الحديد', ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', context: 'الحديد والمعادن لمنافع الناس' },
            { id: 'dhahab', surah: 'آل عمران', ayah: 14, text: 'زُيِّنَ لِلنَّاسِ حُبُّ الشَّهَوَاتِ مِنَ النِّسَاءِ وَالْبَنِينَ وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ', context: 'الذهب والفضة ثروة ونعمة' },
            { id: 'qitr', surah: 'الكهف', ayah: 96, text: 'آتُونِي زُبَرَ الْحَدِيدِ حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا حَتَّىٰ إِذَا جَعَلَهُ نَارًا قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا', context: 'صناعة المعادن والسبائك — ذو القرنين' },
            { id: 'lulu', surah: 'الرحمن', ayah: 22, text: 'يَخْرُجُ مِنْهُمَا اللُّؤْلُؤُ وَالْمَرْجَانُ', context: 'المعادن الثمينة من البحر' },
            { id: 'halya', surah: 'النحل', ayah: 14, text: 'وَتَسْتَخْرِجُوا مِنْهُ حِلْيَةً تَلْبَسُونَهَا', context: 'استخراج الحلي والمعادن الثمينة' },
            { id: 'mizan', surah: 'الرحمن', ayah: 9, text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', context: 'العدل في الوزن والتسعير' },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // الذهب والفضة والمعادن الثمينة
    // ══════════════════════════════════════════════════════════
    _initPreciousMetals() {
        return {
            nameAr: 'المعادن الثمينة', nameEn: 'Precious Metals',
            metals: [
                {
                    id: 'gold', nameAr: 'الذهب', nameEn: 'Gold (Au)', icon: '🥇', atomicNumber: 79,
                    purities: [
                        { karat: 24, purity: '99.9%', nameAr: 'ذهب صافي', use: 'سبائك استثمارية' },
                        { karat: 22, purity: '91.7%', nameAr: 'ذهب 22', use: 'مجوهرات خليجية' },
                        { karat: 21, purity: '87.5%', nameAr: 'ذهب 21', use: 'مجوهرات شائعة' },
                        { karat: 18, purity: '75.0%', nameAr: 'ذهب 18', use: 'مجوهرات عالمية' },
                        { karat: 14, purity: '58.3%', nameAr: 'ذهب 14', use: 'مجوهرات اقتصادية' },
                        { karat: 9, purity: '37.5%', nameAr: 'ذهب 9', use: 'مجوهرات رخيصة' },
                    ],
                    forms: ['سبائك (1g - 1kg)', 'جنيهات ذهبية', 'ليرات', 'أونصات', 'مشغولات', 'ذهب كسر/خردة'],
                    markets: ['LBMA (لندن)', 'COMEX (نيويورك)', 'Shanghai Gold Exchange', 'Dubai Gold & Commodities'],
                    uses: ['مجوهرات (50%)', 'استثمار (25%)', 'بنوك مركزية (15%)', 'صناعة وتقنية (10%)'],
                    units: ['أونصة تروي (31.1g)', 'غرام', 'كيلوغرام', 'تولة (11.66g)', 'مثقال (4.25g)'],
                },
                {
                    id: 'silver', nameAr: 'الفضة', nameEn: 'Silver (Ag)', icon: '🥈', atomicNumber: 47,
                    purities: [
                        { standard: 'Sterling', purity: '92.5%', nameAr: 'فضة إسترليني' },
                        { standard: 'Fine', purity: '99.9%', nameAr: 'فضة صافية' },
                        { standard: 'Britannia', purity: '95.8%', nameAr: 'فضة بريطانية' },
                    ],
                    uses: ['مجوهرات', 'أواني', 'تصوير', 'طاقة شمسية', 'إلكترونيات', 'طبي', 'استثمار'],
                    forms: ['سبائك', 'عملات فضية', 'مشغولات', 'فضة كسر', 'فضة صناعية'],
                },
                {
                    id: 'platinum', nameAr: 'البلاتين', nameEn: 'Platinum (Pt)', icon: '⬜', atomicNumber: 78,
                    uses: ['محفزات سيارات', 'مجوهرات فاخرة', 'صناعة كيميائية', 'طب', 'استثمار'],
                    rarity: 'أندر من الذهب 30 مرة',
                },
                {
                    id: 'palladium', nameAr: 'البلاديوم', nameEn: 'Palladium (Pd)', icon: '⚪', atomicNumber: 46,
                    uses: ['محفزات عوادم', 'إلكترونيات', 'طب أسنان', 'هيدروجين'],
                },
                {
                    id: 'rhodium', nameAr: 'الروديوم', nameEn: 'Rhodium (Rh)', icon: '💠', atomicNumber: 45,
                    uses: ['طلاء مجوهرات', 'محفزات', 'مرايا عاكسة'], note: 'أغلى معدن ثمين',
                },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // المعادن الأساسية (الصناعية)
    // ══════════════════════════════════════════════════════════
    _initBaseMetals() {
        return {
            nameAr: 'المعادن الأساسية', nameEn: 'Base Metals',
            exchange: 'LME — London Metal Exchange',
            metals: [
                { id: 'iron-steel', nameAr: 'حديد وصلب', nameEn: 'Iron & Steel', icon: '🔩',
                  types: ['حديد تسليح (Rebar)', 'حديد مجلفن', 'صلب كربوني', 'صلب مقاوم (Stainless)', 'حديد زهر (Cast)', 'حديد مطاوع'],
                  grades: ['ASTM A36', 'ASTM A615', 'SS304', 'SS316', 'SS430'],
                  saudiEntities: ['حديد (Hadeed/SABIC)', 'الراجحي للصناعة', 'اليمامة للحديد', 'الاتفاق للصلب'] },
                { id: 'copper', nameAr: 'نحاس', nameEn: 'Copper (Cu)', icon: '🟤',
                  types: ['نحاس أحمر نقي', 'نحاس أصفر (Brass)', 'برونز', 'نحاس بريليوم'],
                  uses: ['كابلات كهربائية', 'أنابيب', 'إلكترونيات', 'عملات'] },
                { id: 'aluminum', nameAr: 'ألومنيوم', nameEn: 'Aluminum (Al)', icon: '⬛',
                  types: ['1000 (نقي)', '2000 (نحاس)', '3000 (منغنيز)', '5000 (مغنسيوم)', '6000 (سيليكون)', '7000 (زنك)'],
                  uses: ['بناء', 'سيارات', 'طائرات', 'تعليب', 'كابلات'], saudiEntity: 'معادن للألمنيوم' },
                { id: 'zinc', nameAr: 'زنك', nameEn: 'Zinc (Zn)', icon: '🔘', uses: ['جلفنة', 'سبائك', 'بطاريات'] },
                { id: 'lead', nameAr: 'رصاص', nameEn: 'Lead (Pb)', icon: '⚫', uses: ['بطاريات', 'حماية إشعاعية', 'ذخيرة'] },
                { id: 'tin', nameAr: 'قصدير', nameEn: 'Tin (Sn)', icon: '🟡', uses: ['لحام إلكتروني', 'طلاء', 'سبائك'] },
                { id: 'nickel', nameAr: 'نيكل', nameEn: 'Nickel (Ni)', icon: '⚙️', uses: ['صلب مقاوم', 'بطاريات EV', 'طلاء'] },
                { id: 'titanium', nameAr: 'تيتانيوم', nameEn: 'Titanium (Ti)', icon: '💪', uses: ['طائرات', 'طب', 'بحري'] },
                { id: 'manganese', nameAr: 'منغنيز', nameEn: 'Manganese (Mn)', icon: '🔗', uses: ['سبائك صلب', 'بطاريات'] },
                { id: 'chromium', nameAr: 'كروم', nameEn: 'Chromium (Cr)', icon: '✨', uses: ['صلب مقاوم', 'طلاء كروم'] },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // السكراب — Scrap Metal & Recycling
    // ══════════════════════════════════════════════════════════
    _initScrap() {
        return {
            nameAr: 'منظومة السكراب', nameEn: 'Scrap Metal & Recycling System',
            description: 'إعادة تدوير المعادن — حفظ الموارد وحماية البيئة — لا ضرر ولا ضرار',
            categories: [
                {
                    id: 'ferrous', nameAr: 'سكراب حديدي', nameEn: 'Ferrous Scrap', icon: '🔩',
                    types: [
                        { code: 'HMS1', nameAr: 'خردة ثقيلة درجة 1', nameEn: 'Heavy Melting Scrap #1', thickness: '> 6mm' },
                        { code: 'HMS2', nameAr: 'خردة ثقيلة درجة 2', nameEn: 'Heavy Melting Scrap #2', thickness: '> 3mm' },
                        { code: 'SHRED', nameAr: 'مفروم', nameEn: 'Shredded Scrap', description: 'سكراب مقطع ومفروم' },
                        { code: 'PLATE', nameAr: 'ألواح وقص', nameEn: 'Plate & Structural', description: 'أنقاض صناعية' },
                        { code: 'TURNINGS', nameAr: 'برادة حديد', nameEn: 'Iron Turnings', description: 'مخلفات تصنيع' },
                        { code: 'CAST', nameAr: 'حديد زهر خردة', nameEn: 'Cast Iron Scrap' },
                        { code: 'STAINLESS', nameAr: 'ستانلس خردة', nameEn: 'Stainless Steel Scrap', grades: ['304', '316', '430'] },
                    ],
                },
                {
                    id: 'non-ferrous', nameAr: 'سكراب غير حديدي', nameEn: 'Non-Ferrous Scrap', icon: '🟤',
                    types: [
                        { code: 'CU-WIRE', nameAr: 'نحاس أسلاك', nameEn: 'Copper Wire', grades: ['Bare Bright', '#1 Copper', '#2 Copper'] },
                        { code: 'CU-PIPE', nameAr: 'نحاس أنابيب', nameEn: 'Copper Tube' },
                        { code: 'BRASS', nameAr: 'نحاس أصفر', nameEn: 'Brass Scrap', grades: ['Yellow Brass', 'Red Brass'] },
                        { code: 'AL-EXT', nameAr: 'ألومنيوم بثق', nameEn: 'Aluminum Extrusion' },
                        { code: 'AL-CAN', nameAr: 'علب ألومنيوم', nameEn: 'Aluminum Cans (UBC)' },
                        { code: 'AL-WIRE', nameAr: 'ألومنيوم أسلاك', nameEn: 'Aluminum Wire' },
                        { code: 'AL-CAST', nameAr: 'ألومنيوم سبك', nameEn: 'Cast Aluminum' },
                        { code: 'LEAD-BAT', nameAr: 'بطاريات رصاص', nameEn: 'Lead Batteries' },
                        { code: 'ZINC', nameAr: 'زنك خردة', nameEn: 'Zinc Scrap' },
                    ],
                },
                {
                    id: 'e-waste', nameAr: 'نفايات إلكترونية', nameEn: 'E-Waste', icon: '💻',
                    types: [
                        { nameAr: 'لوحات إلكترونية (PCB)', content: 'ذهب، فضة، نحاس، بلاديوم' },
                        { nameAr: 'كابلات', content: 'نحاس، ألومنيوم' },
                        { nameAr: 'محولات', content: 'نحاس، حديد' },
                        { nameAr: 'محركات كهربائية', content: 'نحاس، حديد، مغانط' },
                        { nameAr: 'بطاريات ليثيوم', content: 'ليثيوم، كوبالت، نيكل' },
                    ],
                },
                {
                    id: 'industrial', nameAr: 'مخلفات صناعية', nameEn: 'Industrial Scrap', icon: '🏭',
                    sources: ['مصانع', 'إنشاءات', 'هدم مباني', 'سفن', 'أنابيب', 'خزانات'],
                },
            ],
            processes: [
                { order: 1, nameAr: 'جمع وشراء', nameEn: 'Collection', icon: '🚛' },
                { order: 2, nameAr: 'فرز وتصنيف', nameEn: 'Sorting', icon: '📋' },
                { order: 3, nameAr: 'تنظيف', nameEn: 'Cleaning', icon: '🧹' },
                { order: 4, nameAr: 'قص وتقطيع', nameEn: 'Cutting/Shearing', icon: '✂️' },
                { order: 5, nameAr: 'فرم/كبس', nameEn: 'Shredding/Baling', icon: '🔨' },
                { order: 6, nameAr: 'فحص جودة', nameEn: 'Quality Testing', icon: '🔬' },
                { order: 7, nameAr: 'وزن وتعبئة', nameEn: 'Weighing/Packing', icon: '⚖️' },
                { order: 8, nameAr: 'تخزين', nameEn: 'Storage', icon: '🏗️' },
                { order: 9, nameAr: 'بيع/تصدير', nameEn: 'Sale/Export', icon: '📊' },
                { order: 10, nameAr: 'صهر وإعادة تدوير', nameEn: 'Smelting/Recycling', icon: '🔥' },
            ],
            equipment: [
                { nameAr: 'مقص هيدروليكي', nameEn: 'Hydraulic Shear' },
                { nameAr: 'ماكينة فرم', nameEn: 'Shredder' },
                { nameAr: 'مكبس سكراب', nameEn: 'Baler/Compactor' },
                { nameAr: 'فرازة مغناطيسية', nameEn: 'Magnetic Separator' },
                { nameAr: 'فرازة تيار دوامي', nameEn: 'Eddy Current Separator' },
                { nameAr: 'ميزان شاحنات', nameEn: 'Truck Scale (Weighbridge)' },
                { nameAr: 'رافعة مغناطيسية', nameEn: 'Magnetic Crane' },
                { nameAr: 'مفكك كابلات', nameEn: 'Wire Stripping Machine' },
                { nameAr: 'محلل معادن XRF', nameEn: 'XRF Analyzer' },
                { nameAr: 'مقشرة حرارية', nameEn: 'Thermal Decoater' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // التشليح — Auto Dismantling & Salvage
    // ══════════════════════════════════════════════════════════
    _initTashleeh() {
        return {
            nameAr: 'منظومة التشليح', nameEn: 'Auto Dismantling & Salvage System',
            description: 'تفكيك المركبات واستخلاص القطع والمعادن القابلة لإعادة الاستخدام والتدوير',
            categories: [
                {
                    id: 'vehicles', nameAr: 'أنواع المركبات', nameEn: 'Vehicle Types', icon: '🚗',
                    types: ['سيارات صغيرة', 'سيارات دفع رباعي', 'شاحنات خفيفة', 'شاحنات ثقيلة', 'حافلات', 'دراجات نارية', 'معدات ثقيلة', 'سفن (Ship Breaking)'],
                },
                {
                    id: 'parts', nameAr: 'قطع الغيار المستعملة', nameEn: 'Used Auto Parts', icon: '🔧',
                    categories: [
                        { nameAr: 'محركات', nameEn: 'Engines', examples: ['محرك كامل', 'رأس محرك', 'بلوك'] },
                        { nameAr: 'ناقل حركة', nameEn: 'Transmission', examples: ['قير أوتوماتيك', 'قير عادي', 'كلتش'] },
                        { nameAr: 'كهرباء', nameEn: 'Electrical', examples: ['دينمو', 'سلف', 'كمبيوتر ECU', 'حساسات'] },
                        { nameAr: 'بدن وهيكل', nameEn: 'Body & Frame', examples: ['أبواب', 'أغطية', 'صدامات', 'أجنحة'] },
                        { nameAr: 'تعليق وفرامل', nameEn: 'Suspension & Brakes', examples: ['مقصات', 'ممتصات', 'أقراص فرامل'] },
                        { nameAr: 'إطارات وجنوط', nameEn: 'Tires & Rims', examples: ['إطارات مستعملة', 'جنوط حديد', 'جنوط ألومنيوم'] },
                        { nameAr: 'تكييف', nameEn: 'AC System', examples: ['كمبروسر', 'مكثف', 'مبخر'] },
                        { nameAr: 'داخلية', nameEn: 'Interior', examples: ['مقاعد', 'طبلون', 'شاشات'] },
                    ],
                },
                {
                    id: 'metals-recovery', nameAr: 'استخلاص المعادن', nameEn: 'Metals Recovery', icon: '♻️',
                    metals: [
                        { metal: 'حديد/صلب', percentage: '65-70%', source: 'هيكل، محرك، ناقل حركة' },
                        { metal: 'ألومنيوم', percentage: '8-10%', source: 'جنوط، رأس محرك، رادياتير' },
                        { metal: 'نحاس', percentage: '1-2%', source: 'أسلاك، رادياتير، محركات كهربائية' },
                        { metal: 'رصاص', percentage: '1%', source: 'بطاريات' },
                        { metal: 'زنك', percentage: '0.5%', source: 'طلاء جلفنة' },
                        { metal: 'بلاتين/بلاديوم', percentage: 'أجزاء من الغرام', source: 'دبة التلوث (Catalytic Converter)' },
                    ],
                },
            ],
            process: [
                { order: 1, nameAr: 'استلام المركبة', nameEn: 'Vehicle Intake', description: 'فحص وتوثيق الحالة' },
                { order: 2, nameAr: 'تفريغ السوائل', nameEn: 'Fluid Drain', description: 'زيت، وقود، سائل فرامل، فريون — بيئي' },
                { order: 3, nameAr: 'فك البطاريات', nameEn: 'Battery Removal', description: 'بطاريات رصاص/ليثيوم — تدوير خاص' },
                { order: 4, nameAr: 'فك القطع القابلة للبيع', nameEn: 'Parts Dismantling', description: 'قطع غيار مستعملة للبيع' },
                { order: 5, nameAr: 'فرم الهيكل', nameEn: 'Body Shredding', description: 'فرم ما تبقى لاستخلاص المعادن' },
                { order: 6, nameAr: 'فرز المعادن', nameEn: 'Metal Sorting', description: 'فصل حديدي وغير حديدي' },
                { order: 7, nameAr: 'بيع المعادن', nameEn: 'Metal Sale', description: 'بيع للمصاهر أو تصدير' },
            ],
            saudiContext: {
                regulator: 'وزارة التجارة + هيئة النقل',
                platforms: ['منصة تشليح إلكترونية', 'حراج السيارات', 'مزادات تشليح'],
                regions: ['حراج الرياض', 'حراج جدة', 'حراج الدمام', 'حراج مكة'],
                regulations: ['رخصة نشاط تشليح', 'اشتراطات بيئية', 'سجل مركبات مشطوبة', 'ضمان قطع مستعملة'],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // التسعير — Pricing System
    // ══════════════════════════════════════════════════════════
    _initPricing() {
        return {
            nameAr: 'منظومة التسعير', nameEn: 'Pricing System',
            pricingMethods: [
                { nameAr: 'سعر بورصة + علاوة', nameEn: 'Exchange Price + Premium', description: 'LME/LBMA + علاوة حسب الجودة والموقع' },
                { nameAr: 'سعر فوري (Spot)', nameEn: 'Spot Price', description: 'السعر الحالي في السوق' },
                { nameAr: 'سعر تعاقدي', nameEn: 'Contract Price', description: 'سعر متفق عليه لفترة محددة' },
                { nameAr: 'مزاد/مناقصة', nameEn: 'Auction/Tender', description: 'أعلى سعر مقدم' },
            ],
            factors: ['نوع المعدن', 'درجة النقاء', 'الحجم والكمية', 'الحالة (نظيف/مخلوط)', 'الموقع', 'العرض والطلب', 'سعر البورصة', 'تكلفة النقل'],
            units: [
                { nameAr: 'طن', nameEn: 'Metric Ton (MT)' },
                { nameAr: 'أونصة تروي', nameEn: 'Troy Ounce (ozt)', grams: 31.1035 },
                { nameAr: 'رطل', nameEn: 'Pound (lb)', grams: 453.6 },
                { nameAr: 'كيلوغرام', nameEn: 'Kilogram (kg)' },
            ],
        };
    }

    _initQualityStandards() {
        return {
            nameAr: 'معايير الجودة', nameEn: 'Quality Standards',
            standards: [
                { name: 'ISRI', fullName: 'Institute of Scrap Recycling Industries', scope: 'تصنيف سكراب عالمي' },
                { name: 'LBMA', fullName: 'London Bullion Market Association', scope: 'معايير الذهب والفضة' },
                { name: 'LME', fullName: 'London Metal Exchange', scope: 'معايير المعادن الأساسية' },
                { name: 'ASTM', fullName: 'American Society for Testing and Materials', scope: 'معايير الحديد والصلب' },
                { name: 'JIS', fullName: 'Japanese Industrial Standards', scope: 'معايير يابانية' },
                { name: 'SASO', fullName: 'الهيئة السعودية للمواصفات والمقاييس', scope: 'معايير سعودية' },
            ],
            testing: ['فحص XRF (تحليل عناصر)', 'فحص كثافة', 'فحص مغناطيسي', 'فحص كيميائي', 'فحص ميكانيكي'],
        };
    }

    _initShariaGuidance() {
        return {
            nameAr: 'الضوابط الشرعية لتجارة المعادن', nameEn: 'Sharia Guidance for Metals Trade',
            principles: [
                { id: 'riba-sarf', nameAr: 'أحكام الصرف', description: 'لا تبيعوا الذهب بالذهب إلا مثلاً بمثل ولا تشفّوا بعضها على بعض — يداً بيد', icon: '⚖️' },
                { id: 'taqabud', nameAr: 'التقابض الفوري', description: 'بيع الذهب والفضة يشترط فيه التقابض في المجلس — متفق عليه', icon: '🤝' },
                { id: 'wazn', nameAr: 'الوزن بالقسط', description: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ — عدالة الميزان والمعايرة', icon: '⚖️' },
                { id: 'bayyan', nameAr: 'البيان والإفصاح', description: 'البيّعان بالخيار... فإن صدقا وبيّنا بورك لهما — كشف عيوب المعدن', icon: '📋' },
                { id: 'la-ghish', nameAr: 'تحريم الغش', description: 'من غشنا فليس منا — تحريم خلط المعادن أو التلاعب بالوزن', icon: '🚫' },
                { id: 'la-ihtikar', nameAr: 'تحريم الاحتكار', description: 'لا يحتكر إلا خاطئ — منع احتكار المعادن لرفع الأسعار', icon: '🚫' },
                { id: 'biah', nameAr: 'حماية البيئة', description: 'التخلص الآمن من المخلفات الخطرة — لا ضرر ولا ضرار', icon: '🌿' },
                { id: 'zakat', nameAr: 'زكاة الذهب والفضة', description: 'نصاب الذهب 85g | نصاب الفضة 595g | 2.5% سنوياً', icon: '💰' },
            ],
        };
    }

    getDashboard() {
        return {
            name: this.name, version: this.version, startedAt: this.startedAt,
            summary: {
                preciousMetals: this.preciousMetals.metals.length,
                baseMetals: this.baseMetals.metals.length,
                scrapCategories: this.scrap.categories.length,
                scrapProcesses: this.scrap.processes.length,
                tashleehSteps: this.tashleeh.process.length,
                qualityStandards: this.qualityStandards.standards.length,
                quranVerses: this.quranReferences.length,
                shariaRules: this.shariaGuidance.principles.length,
            },
            quranReferences: this.quranReferences,
            preciousMetals: this.preciousMetals,
            baseMetals: this.baseMetals,
            scrap: this.scrap,
            tashleeh: this.tashleeh,
            pricing: this.pricing,
            qualityStandards: this.qualityStandards,
            shariaGuidance: this.shariaGuidance,
        };
    }
}

module.exports = SheikhaMetalsMarketEngine;
