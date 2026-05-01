/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA EARTH RESOURCES ENGINE — منظومة شيخة للزراعة والجغرافيا والمعادن والجيولوجيا
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا وَالْجِبَالَ أَوْتَادًا" — النبأ ٦-٧
 * "وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ أَزْوَاجًا مِّن نَّبَاتٍ شَتَّىٰ" — طه ٥٣
 * "وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ وَجَنَّاتٌ مِّنْ أَعْنَابٍ وَزَرْعٌ وَنَخِيلٌ" — الرعد ٤
 * "وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ" — الحجر ١٩
 *
 * ✅ منظومة الزراعة — المحاصيل والبساتين والأمن الغذائي
 * ✅ منظومة المياه — الأنهار والبحيرات والمياه الجوفية والتحلية
 * ✅ منظومة الجغرافيا — القارات والمناخ والتضاريس
 * ✅ منظومة الجيولوجيا — طبقات الأرض والصخور والزلازل والبراكين
 * ✅ منظومة المعادن — الذهب والفضة والحديد والنحاس وجميع المعادن
 * ✅ منظومة البيئة — المروج والغابات والصحاري والمحميات
 * ✅ الضوابط الشرعية — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaEarthResourcesEngine {
    constructor() {
        this.name = 'منظومة شيخة للزراعة والجغرافيا والمعادن والجيولوجيا';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.quranReferences = this._initQuranReferences();
        this.agriculture = this._initAgriculture();
        this.water = this._initWater();
        this.geography = this._initGeography();
        this.geology = this._initGeology();
        this.minerals = this._initMinerals();
        this.environment = this._initEnvironment();
        this.saudiResources = this._initSaudiResources();
        this.shariaGuidance = this._initShariaGuidance();
    }

    _initQuranReferences() {
        return [
            { id: 'mihad', surah: 'النبأ', ayah: '6-7', text: 'أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا وَالْجِبَالَ أَوْتَادًا', context: 'الأرض مهيأة والجبال رواسي — الجيولوجيا' },
            { id: 'nabat', surah: 'طه', ayah: 53, text: 'وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ أَزْوَاجًا مِّن نَّبَاتٍ شَتَّىٰ', context: 'الزراعة وتنوع النبات بماء المطر' },
            { id: 'qita', surah: 'الرعد', ayah: 4, text: 'وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ وَجَنَّاتٌ مِّنْ أَعْنَابٍ وَزَرْعٌ وَنَخِيلٌ', context: 'تنوع التربة والمحاصيل — الجغرافيا الزراعية' },
            { id: 'mawzun', surah: 'الحجر', ayah: 19, text: 'وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ', context: 'التوازن في موارد الأرض — المعادن والنبات' },
            { id: 'anhar', surah: 'الرعد', ayah: 3, text: 'وَهُوَ الَّذِي مَدَّ الْأَرْضَ وَجَعَلَ فِيهَا رَوَاسِيَ وَأَنْهَارًا', context: 'الأنهار والجبال — نظام الماء الأرضي' },
            { id: 'hadeed', surah: 'الحديد', ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', context: 'الحديد والمعادن — ثروات الأرض' },
            { id: 'maa', surah: 'الأنبياء', ayah: 30, text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ أَفَلَا يُؤْمِنُونَ', context: 'أهمية الماء — أساس الحياة والزراعة' },
            { id: 'nakheel', surah: 'الرحمن', ayah: 11, text: 'فِيهَا فَاكِهَةٌ وَالنَّخْلُ ذَاتُ الْأَكْمَامِ', context: 'النخيل والفاكهة — الزراعة' },
            { id: 'zaitun', surah: 'التين', ayah: 1, text: 'وَالتِّينِ وَالزَّيْتُونِ', context: 'أقسم الله بالتين والزيتون — قيمة المحاصيل' },
            { id: 'harth', surah: 'الواقعة', ayah: '63-64', text: 'أَفَرَأَيْتُم مَّا تَحْرُثُونَ أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ', context: 'الزراعة نعمة من الله' },
            { id: 'jibal', surah: 'النحل', ayah: 15, text: 'وَأَلْقَىٰ فِي الْأَرْضِ رَوَاسِيَ أَن تَمِيدَ بِكُمْ وَأَنْهَارًا وَسُبُلًا لَّعَلَّكُمْ تَهْتَدُونَ', context: 'الجبال رواسي والأنهار سُبل — الجغرافيا والجيولوجيا' },
            { id: 'dhahab', hadith: true, text: 'لا تبيعوا الذهب بالذهب إلا مثلاً بمثل — متفق عليه', context: 'ضوابط تجارة المعادن الثمينة' },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // الزراعة — Agriculture
    // ══════════════════════════════════════════════════════════
    _initAgriculture() {
        return {
            nameAr: 'منظومة الزراعة', nameEn: 'Agriculture System',
            sectors: [
                {
                    id: 'crops', nameAr: 'المحاصيل الزراعية', nameEn: 'Crops', icon: '🌾',
                    categories: [
                        { nameAr: 'حبوب', nameEn: 'Grains', examples: ['قمح', 'أرز', 'شعير', 'ذرة', 'شوفان', 'دخن'] },
                        { nameAr: 'خضروات', nameEn: 'Vegetables', examples: ['طماطم', 'خيار', 'بصل', 'بطاطس', 'جزر', 'كوسة', 'فلفل', 'باذنجان'] },
                        { nameAr: 'فواكه', nameEn: 'Fruits', examples: ['تمر', 'عنب', 'رمان', 'تين', 'زيتون', 'برتقال', 'تفاح', 'موز', 'مانجو'] },
                        { nameAr: 'بقوليات', nameEn: 'Legumes', examples: ['فول', 'عدس', 'حمص', 'فاصوليا', 'بازلاء'] },
                        { nameAr: 'محاصيل صناعية', nameEn: 'Industrial Crops', examples: ['قطن', 'قصب سكر', 'بنجر', 'سمسم', 'عباد شمس'] },
                        { nameAr: 'أعشاب وتوابل', nameEn: 'Herbs & Spices', examples: ['نعناع', 'ريحان', 'زعفران', 'كمون', 'كزبرة', 'حبة سوداء'] },
                        { nameAr: 'أعلاف', nameEn: 'Fodder', examples: ['برسيم', 'رودس', 'ذرة علفية'] },
                    ]
                },
                {
                    id: 'livestock', nameAr: 'الثروة الحيوانية', nameEn: 'Livestock', icon: '🐑',
                    types: [
                        { nameAr: 'أغنام', nameEn: 'Sheep', products: ['لحم', 'صوف', 'جلود'] },
                        { nameAr: 'ماعز', nameEn: 'Goats', products: ['لحم', 'حليب', 'جلود'] },
                        { nameAr: 'إبل', nameEn: 'Camels', products: ['لحم', 'حليب', 'سباق'], note: 'أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ' },
                        { nameAr: 'أبقار', nameEn: 'Cattle', products: ['لحم', 'حليب', 'جلود'] },
                        { nameAr: 'دواجن', nameEn: 'Poultry', products: ['لحم', 'بيض', 'ريش'] },
                        { nameAr: 'أسماك', nameEn: 'Fish/Aquaculture', products: ['لحم', 'زيوت أوميغا'] },
                        { nameAr: 'نحل', nameEn: 'Bees', products: ['عسل', 'شمع', 'غذاء ملكات'], note: 'يَخْرُجُ مِن بُطُونِهَا شَرَابٌ مُّخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِّلنَّاسِ' },
                    ]
                },
                {
                    id: 'irrigation', nameAr: 'أنظمة الري', nameEn: 'Irrigation', icon: '💧',
                    methods: [
                        { nameAr: 'ري بالتنقيط', nameEn: 'Drip Irrigation', efficiency: '90-95%' },
                        { nameAr: 'ري بالرش', nameEn: 'Sprinkler', efficiency: '75-85%' },
                        { nameAr: 'ري محوري', nameEn: 'Center Pivot', efficiency: '80-90%' },
                        { nameAr: 'ري سطحي', nameEn: 'Surface/Flood', efficiency: '40-60%' },
                        { nameAr: 'ري تحت سطحي', nameEn: 'Subsurface', efficiency: '92-97%' },
                        { nameAr: 'زراعة مائية', nameEn: 'Hydroponics', efficiency: '98%' },
                        { nameAr: 'زراعة هوائية', nameEn: 'Aeroponics', efficiency: '99%' },
                    ]
                },
                {
                    id: 'agritech', nameAr: 'التقنية الزراعية', nameEn: 'AgriTech', icon: '🤖',
                    technologies: [
                        { nameAr: 'زراعة دقيقة', nameEn: 'Precision Agriculture', tools: ['GPS', 'أقمار صناعية', 'حساسات تربة'] },
                        { nameAr: 'طائرات بدون طيار', nameEn: 'Agricultural Drones', uses: ['رش', 'مسح', 'مراقبة'] },
                        { nameAr: 'ذكاء اصطناعي', nameEn: 'AI in Agriculture', uses: ['تنبؤ محاصيل', 'كشف أمراض', 'تحسين ري'] },
                        { nameAr: 'زراعة عمودية', nameEn: 'Vertical Farming', features: ['مساحة أقل', 'ماء أقل 95%', 'إنتاج مستمر'] },
                        { nameAr: 'بيوت محمية', nameEn: 'Greenhouses', features: ['تحكم مناخي', 'إنتاج طوال العام'] },
                        { nameAr: 'إنترنت الأشياء الزراعي', nameEn: 'IoT Agriculture', uses: ['حساسات رطوبة', 'محطات طقس', 'تتبع حيوانات'] },
                    ]
                },
            ],
            foodSecurity: {
                nameAr: 'الأمن الغذائي', nameEn: 'Food Security',
                pillars: ['التوفر', 'الوصول', 'الاستخدام', 'الاستقرار'],
                saudiEntity: 'الهيئة العامة للغذاء والدواء (SFDA)',
                programs: ['برنامج فرص الاستثمار الزراعي', 'مبادرة الأمن الغذائي', 'استراتيجية الزراعة المستدامة'],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // المياه — Water Systems
    // ══════════════════════════════════════════════════════════
    _initWater() {
        return {
            nameAr: 'منظومة المياه', nameEn: 'Water System',
            quranRef: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء ٣٠',
            sources: [
                {
                    id: 'rivers', nameAr: 'الأنهار', nameEn: 'Rivers', icon: '🏞️',
                    major: [
                        { name: 'النيل', region: 'أفريقيا', length: '6,650 km', countries: 11 },
                        { name: 'الأمازون', region: 'أمريكا الجنوبية', length: '6,400 km', flow: 'الأكبر في العالم' },
                        { name: 'دجلة', region: 'الشرق الأوسط', length: '1,850 km', countries: ['تركيا', 'العراق'] },
                        { name: 'الفرات', region: 'الشرق الأوسط', length: '2,800 km', countries: ['تركيا', 'سوريا', 'العراق'] },
                        { name: 'الغانج', region: 'آسيا', length: '2,525 km', countries: ['الهند', 'بنغلادش'] },
                        { name: 'المسيسيبي', region: 'أمريكا الشمالية', length: '3,766 km' },
                        { name: 'اليانغتسي', region: 'الصين', length: '6,300 km' },
                        { name: 'الدانوب', region: 'أوروبا', length: '2,850 km', countries: 10 },
                    ],
                    quranRef: 'وَجَعَلَ فِيهَا رَوَاسِيَ وَأَنْهَارًا'
                },
                {
                    id: 'lakes', nameAr: 'البحيرات', nameEn: 'Lakes', icon: '🏔️',
                    major: [
                        { name: 'بحر قزوين', area: '371,000 km²', type: 'أكبر بحيرة (مالحة)' },
                        { name: 'البحيرات العظمى', area: '244,106 km²', location: 'أمريكا الشمالية' },
                        { name: 'فيكتوريا', area: '68,870 km²', location: 'أفريقيا', type: 'أكبر بحيرة استوائية' },
                        { name: 'بايكال', area: '31,722 km²', location: 'روسيا', type: 'أعمق بحيرة — 1,642 م' },
                        { name: 'البحر الميت', area: '605 km²', location: 'الأردن/فلسطين', type: 'أخفض نقطة على الأرض (-430 م)' },
                    ]
                },
                {
                    id: 'groundwater', nameAr: 'المياه الجوفية', nameEn: 'Groundwater', icon: '🕳️',
                    aquifers: [
                        { name: 'طبقة الصاج', location: 'السعودية', type: 'غير متجدد' },
                        { name: 'طبقة أم الرضمة', location: 'السعودية', type: 'غير متجدد' },
                        { name: 'النوبي الرملي', location: 'شمال أفريقيا', type: 'أكبر خزان جوفي' },
                        { name: 'أوغالالا', location: 'أمريكا الشمالية', type: 'أكبر في أمريكا' },
                    ],
                    technologies: ['حفر آبار', 'محطات ضخ', 'تغذية صناعية', 'مراقبة منسوب'],
                },
                {
                    id: 'desalination', nameAr: 'التحلية', nameEn: 'Desalination', icon: '🏭',
                    methods: ['تناضح عكسي (RO)', 'تقطير ومضي (MSF)', 'تقطير متعدد المراحل (MED)', 'كهربائي (ED)'],
                    saudiEntity: 'المؤسسة العامة لتحلية المياه المالحة (SWCC)',
                    note: 'السعودية أكبر منتج للمياه المحلاة في العالم',
                },
                {
                    id: 'rain', nameAr: 'مياه الأمطار', nameEn: 'Rainwater', icon: '🌧️',
                    technologies: ['حصاد مطري', 'سدود', 'خزانات', 'تغذية جوفية'],
                    quranRef: 'وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً بِقَدَرٍ فَأَسْكَنَّاهُ فِي الْأَرْضِ',
                },
                {
                    id: 'seas', nameAr: 'البحار والمحيطات', nameEn: 'Seas & Oceans', icon: '🌊',
                    oceans: ['المحيط الهادئ', 'المحيط الأطلسي', 'المحيط الهندي', 'المحيط المتجمد الشمالي', 'المحيط الجنوبي'],
                    saudiSeas: ['البحر الأحمر', 'الخليج العربي'],
                    quranRef: 'وَهُوَ الَّذِي سَخَّرَ الْبَحْرَ لِتَأْكُلُوا مِنْهُ لَحْمًا طَرِيًّا وَتَسْتَخْرِجُوا مِنْهُ حِلْيَةً تَلْبَسُونَهَا',
                },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الجغرافيا — Geography
    // ══════════════════════════════════════════════════════════
    _initGeography() {
        return {
            nameAr: 'منظومة الجغرافيا', nameEn: 'Geography System',
            continents: [
                { nameAr: 'آسيا', nameEn: 'Asia', area: '44.6M km²', population: '4.7B', countries: 49 },
                { nameAr: 'أفريقيا', nameEn: 'Africa', area: '30.4M km²', population: '1.4B', countries: 54 },
                { nameAr: 'أمريكا الشمالية', nameEn: 'North America', area: '24.7M km²', population: '580M', countries: 23 },
                { nameAr: 'أمريكا الجنوبية', nameEn: 'South America', area: '17.8M km²', population: '430M', countries: 12 },
                { nameAr: 'أوروبا', nameEn: 'Europe', area: '10.2M km²', population: '750M', countries: 44 },
                { nameAr: 'أستراليا/أوقيانوسيا', nameEn: 'Oceania', area: '8.5M km²', population: '45M', countries: 14 },
                { nameAr: 'القارة القطبية الجنوبية', nameEn: 'Antarctica', area: '14.2M km²', population: '~1,000 (باحثون)' },
            ],
            climateZones: [
                { nameAr: 'استوائي', nameEn: 'Tropical', temp: '25-28°C', rainfall: '> 2000 mm' },
                { nameAr: 'جاف/صحراوي', nameEn: 'Arid/Desert', temp: 'متطرف', rainfall: '< 250 mm' },
                { nameAr: 'معتدل', nameEn: 'Temperate', temp: '10-20°C', rainfall: '500-1500 mm' },
                { nameAr: 'قاري', nameEn: 'Continental', temp: 'تفاوت كبير', rainfall: 'متغير' },
                { nameAr: 'قطبي', nameEn: 'Polar', temp: '< 0°C', rainfall: '< 250 mm' },
                { nameAr: 'متوسطي', nameEn: 'Mediterranean', temp: '15-25°C', rainfall: 'شتوي' },
            ],
            landforms: [
                { nameAr: 'جبال', nameEn: 'Mountains', examples: ['الهملايا', 'الألب', 'الأنديز', 'السروات', 'أطلس'] },
                { nameAr: 'سهول', nameEn: 'Plains', examples: ['سهول سيبيريا', 'السهول الكبرى', 'تهامة'] },
                { nameAr: 'هضاب', nameEn: 'Plateaus', examples: ['هضبة نجد', 'هضبة التبت', 'هضبة الأناضول'] },
                { nameAr: 'صحاري', nameEn: 'Deserts', examples: ['الربع الخالي', 'الصحراء الكبرى', 'صحراء النفود', 'صحراء الدهناء'] },
                { nameAr: 'وديان', nameEn: 'Valleys', examples: ['وادي الأردن', 'الأخدود الأفريقي', 'وادي حنيفة'] },
                { nameAr: 'جزر', nameEn: 'Islands', examples: ['فرسان', 'جزر المالديف', 'إندونيسيا'] },
                { nameAr: 'دلتا', nameEn: 'Deltas', examples: ['دلتا النيل', 'دلتا الغانج', 'دلتا الميكونغ'] },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الجيولوجيا — Geology
    // ══════════════════════════════════════════════════════════
    _initGeology() {
        return {
            nameAr: 'منظومة الجيولوجيا', nameEn: 'Geology System',
            quranRef: 'أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا وَالْجِبَالَ أَوْتَادًا — النبأ ٦-٧',
            earthLayers: [
                { nameAr: 'القشرة الأرضية', nameEn: 'Crust', depth: '5-70 km', description: 'الطبقة الخارجية الصلبة — قارية (35-70 km) ومحيطية (5-10 km)' },
                { nameAr: 'الوشاح (الدثار)', nameEn: 'Mantle', depth: '70-2,900 km', description: 'صخور شبه منصهرة — تحرك الصفائح التكتونية' },
                { nameAr: 'اللُّب الخارجي', nameEn: 'Outer Core', depth: '2,900-5,100 km', description: 'حديد ونيكل سائل — يولّد المجال المغناطيسي' },
                { nameAr: 'اللُّب الداخلي', nameEn: 'Inner Core', depth: '5,100-6,371 km', description: 'حديد ونيكل صلب — حرارة 5,400°C' },
            ],
            rockTypes: [
                { nameAr: 'صخور نارية', nameEn: 'Igneous', origin: 'تبريد الصهارة (الماغما)', examples: ['غرانيت', 'بازلت', 'أوبسيديان'] },
                { nameAr: 'صخور رسوبية', nameEn: 'Sedimentary', origin: 'ترسيب وتراص', examples: ['حجر رملي', 'حجر جيري', 'طين', 'ملح صخري'] },
                { nameAr: 'صخور متحولة', nameEn: 'Metamorphic', origin: 'حرارة وضغط شديد', examples: ['رخام', 'إردواز', 'كوارتزيت'] },
            ],
            tectonics: {
                nameAr: 'الصفائح التكتونية', nameEn: 'Plate Tectonics',
                majorPlates: ['الأوراسية', 'الأفريقية', 'الهندية-الأسترالية', 'الهادئ', 'أمريكا الشمالية', 'أمريكا الجنوبية', 'القطبية الجنوبية', 'العربية'],
                boundaries: ['تباعدية (مد)', 'تقاربية (اندساس)', 'تحويلية (انزلاق)', 'صدع البحر الأحمر'],
            },
            phenomena: [
                { nameAr: 'زلازل', nameEn: 'Earthquakes', scale: 'ريختر/ميركالي', description: 'اهتزاز الأرض بحركة الصفائح' },
                { nameAr: 'براكين', nameEn: 'Volcanoes', types: ['درعية', 'مخروطية', 'طبقية', 'حرات'], saudiExample: 'حرة رهط' },
                { nameAr: 'تسونامي', nameEn: 'Tsunami', cause: 'زلزال بحري أو انزلاق' },
                { nameAr: 'تعرية', nameEn: 'Erosion', agents: ['ماء', 'رياح', 'جليد', 'جاذبية'] },
            ],
            geologicTime: [
                { nameAr: 'حقبة ما قبل الكامبري', nameEn: 'Precambrian', age: '4.6B - 541M years' },
                { nameAr: 'حقبة الحياة القديمة', nameEn: 'Paleozoic', age: '541M - 252M years' },
                { nameAr: 'حقبة الحياة المتوسطة', nameEn: 'Mesozoic', age: '252M - 66M years' },
                { nameAr: 'حقبة الحياة الحديثة', nameEn: 'Cenozoic', age: '66M years - الآن' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // المعادن — Minerals
    // ══════════════════════════════════════════════════════════
    _initMinerals() {
        return {
            nameAr: 'منظومة المعادن', nameEn: 'Minerals System',
            quranRef: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ — الحديد ٢٥',
            categories: [
                {
                    id: 'precious', nameAr: 'معادن ثمينة', nameEn: 'Precious Metals', icon: '✨',
                    minerals: [
                        { nameAr: 'ذهب', nameEn: 'Gold (Au)', uses: ['مجوهرات', 'استثمار', 'إلكترونيات', 'طب'], saudiMines: ['منجم مهد الذهب', 'بلغة', 'الصخيبرات', 'الأمار'] },
                        { nameAr: 'فضة', nameEn: 'Silver (Ag)', uses: ['مجوهرات', 'صناعة', 'طاقة شمسية', 'طب'] },
                        { nameAr: 'بلاتين', nameEn: 'Platinum (Pt)', uses: ['محفزات', 'مجوهرات', 'هيدروجين'] },
                        { nameAr: 'بلاديوم', nameEn: 'Palladium (Pd)', uses: ['محفزات سيارات', 'إلكترونيات'] },
                    ]
                },
                {
                    id: 'industrial', nameAr: 'معادن صناعية', nameEn: 'Industrial Metals', icon: '🔩',
                    minerals: [
                        { nameAr: 'حديد', nameEn: 'Iron (Fe)', uses: ['صلب', 'بناء', 'سيارات'], quran: 'وَأَنزَلْنَا الْحَدِيدَ' },
                        { nameAr: 'نحاس', nameEn: 'Copper (Cu)', uses: ['كهرباء', 'أنابيب', 'إلكترونيات'], quran: 'آتُونِي زُبَرَ الْحَدِيدِ حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا حَتَّىٰ إِذَا جَعَلَهُ نَارًا قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا' },
                        { nameAr: 'ألومنيوم', nameEn: 'Aluminum (Al)', uses: ['طائرات', 'تغليف', 'بناء'] },
                        { nameAr: 'زنك', nameEn: 'Zinc (Zn)', uses: ['جلفنة', 'بطاريات', 'سبائك'] },
                        { nameAr: 'قصدير', nameEn: 'Tin (Sn)', uses: ['لحام', 'طلاء', 'سبائك'] },
                        { nameAr: 'رصاص', nameEn: 'Lead (Pb)', uses: ['بطاريات', 'حماية إشعاعية'] },
                        { nameAr: 'نيكل', nameEn: 'Nickel (Ni)', uses: ['صلب مقاوم', 'بطاريات EV'] },
                    ]
                },
                {
                    id: 'critical', nameAr: 'معادن حرجة', nameEn: 'Critical Minerals', icon: '⚠️',
                    minerals: [
                        { nameAr: 'ليثيوم', nameEn: 'Lithium (Li)', uses: ['بطاريات EV', 'إلكترونيات'] },
                        { nameAr: 'كوبالت', nameEn: 'Cobalt (Co)', uses: ['بطاريات', 'سبائك حرارية'] },
                        { nameAr: 'عناصر أرضية نادرة', nameEn: 'Rare Earth Elements', uses: ['مغانط', 'إلكترونيات', 'طاقة متجددة'] },
                        { nameAr: 'تيتانيوم', nameEn: 'Titanium (Ti)', uses: ['طائرات', 'طب', 'بحري'] },
                        { nameAr: 'يورانيوم', nameEn: 'Uranium (U)', uses: ['طاقة نووية'] },
                    ]
                },
                {
                    id: 'non-metallic', nameAr: 'معادن لا فلزية', nameEn: 'Non-Metallic', icon: '💎',
                    minerals: [
                        { nameAr: 'فوسفات', nameEn: 'Phosphate', uses: ['أسمدة', 'كيماويات'], saudiNote: 'منطقة الجلاميد — من أكبر مشاريع الفوسفات' },
                        { nameAr: 'بوكسايت', nameEn: 'Bauxite', uses: ['ألومنيوم'] },
                        { nameAr: 'سيليكا', nameEn: 'Silica', uses: ['زجاج', 'رقائق إلكترونية', 'طاقة شمسية'] },
                        { nameAr: 'جبس', nameEn: 'Gypsum', uses: ['بناء', 'إسمنت'] },
                        { nameAr: 'حجر جيري', nameEn: 'Limestone', uses: ['إسمنت', 'بناء'] },
                        { nameAr: 'ملح', nameEn: 'Salt (NaCl)', uses: ['غذاء', 'صناعة', 'تحلية'] },
                    ]
                },
                {
                    id: 'gems', nameAr: 'أحجار كريمة', nameEn: 'Gemstones', icon: '💎',
                    minerals: [
                        { nameAr: 'ماس', nameEn: 'Diamond' },
                        { nameAr: 'ياقوت', nameEn: 'Ruby' },
                        { nameAr: 'زمرد', nameEn: 'Emerald' },
                        { nameAr: 'زبرجد', nameEn: 'Peridot' },
                        { nameAr: 'عقيق', nameEn: 'Agate' },
                        { nameAr: 'فيروز', nameEn: 'Turquoise' },
                        { nameAr: 'لؤلؤ', nameEn: 'Pearl', quran: 'يَخْرُجُ مِنْهُمَا اللُّؤْلُؤُ وَالْمَرْجَانُ — الرحمن ٢٢' },
                        { nameAr: 'مرجان', nameEn: 'Coral' },
                    ]
                },
            ],
            miningStages: ['استكشاف', 'تقييم', 'تطوير منجم', 'استخراج', 'معالجة', 'صهر/تكرير', 'تسويق', 'إغلاق وإعادة تأهيل'],
        };
    }

    // ══════════════════════════════════════════════════════════
    // البيئة — Environment (مروج، غابات، صحاري، محميات)
    // ══════════════════════════════════════════════════════════
    _initEnvironment() {
        return {
            nameAr: 'منظومة البيئة', nameEn: 'Environment System',
            ecosystems: [
                { id: 'meadows', nameAr: 'مروج ومراعي', nameEn: 'Meadows & Grasslands', icon: '🌿', description: 'أراضي عشبية خصبة للرعي والزراعة' },
                { id: 'forests', nameAr: 'غابات', nameEn: 'Forests', icon: '🌲', types: ['استوائية', 'معتدلة', 'صنوبرية', 'مانغروف (قرم)'] },
                { id: 'deserts', nameAr: 'صحاري', nameEn: 'Deserts', icon: '🏜️', types: ['رملية', 'صخرية', 'حصوية', 'ملحية'] },
                { id: 'wetlands', nameAr: 'أراضي رطبة', nameEn: 'Wetlands', icon: '🦢', types: ['مستنقعات', 'سبخات', 'مانغروف'] },
                { id: 'coral', nameAr: 'شعاب مرجانية', nameEn: 'Coral Reefs', icon: '🐠', saudiNote: 'البحر الأحمر — من أجمل الشعاب في العالم' },
                { id: 'mountains', nameAr: 'بيئات جبلية', nameEn: 'Mountain Ecosystems', icon: '🏔️', saudiExample: 'جبال السروات والحجاز' },
            ],
            saudiProtectedAreas: [
                { name: 'محمية الإمام تركي بن عبدالله الملكية', type: 'ملكية' },
                { name: 'محمية الأمير محمد بن سلمان الملكية', type: 'ملكية' },
                { name: 'محمية حرة الحرة', type: 'طبيعية' },
                { name: 'محمية جزر فرسان', type: 'بحرية' },
                { name: 'محمية عروق بني معارض', type: 'طبيعية — تراث عالمي' },
                { name: 'محمية الوعل', type: 'طبيعية' },
                { name: 'البحر الأحمر (نيوم/ذا لاين)', type: 'سياحية بيئية' },
            ],
            biodiversity: {
                nameAr: 'التنوع الحيوي', nameEn: 'Biodiversity',
                saudiSpecies: { mammals: '+100', birds: '+500', reptiles: '+100', fish: '+1,000', plants: '+2,300' },
                threats: ['تصحر', 'تلوث', 'صيد جائر', 'تغير مناخي', 'فقدان موائل'],
                conservation: ['محميات طبيعية', 'إعادة توطين أنواع', 'بنك بذور', 'برامج تربية'],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // الموارد السعودية — Saudi Arabia Resources
    // ══════════════════════════════════════════════════════════
    _initSaudiResources() {
        return {
            nameAr: 'موارد المملكة العربية السعودية', nameEn: 'Saudi Arabia Resources',
            entities: [
                { name: 'وزارة البيئة والمياه والزراعة', role: 'تنظيم' },
                { name: 'هيئة المساحة الجيولوجية السعودية (SGS)', role: 'مسح جيولوجي ومعدني' },
                { name: 'شركة معادن (Ma\'aden)', role: 'تعدين — ذهب، فوسفات، ألومنيوم' },
                { name: 'المركز الوطني للأرصاد', role: 'أرصاد ومناخ' },
                { name: 'المركز الوطني لتنمية الغطاء النباتي ومكافحة التصحر', role: 'بيئة' },
                { name: 'صندوق التنمية الزراعية', role: 'تمويل زراعي' },
            ],
            regions: [
                { name: 'الرياض', features: ['هضبة نجد', 'وادي حنيفة', 'زراعة نخيل'] },
                { name: 'المنطقة الشرقية', features: ['أكبر حقول نفط', 'واحة الأحساء', 'ساحل خليجي'] },
                { name: 'مكة المكرمة', features: ['سلسلة السروات', 'ساحل البحر الأحمر'] },
                { name: 'المدينة المنورة', features: ['حرات بركانية', 'واحات', 'مزارع'] },
                { name: 'عسير', features: ['أعلى قمم', 'غابات العرعر', 'أمطار موسمية'] },
                { name: 'تبوك', features: ['نيوم', 'جبال', 'سهول زراعية'] },
                { name: 'الجوف', features: ['زيتون', 'واحات', 'آثار'] },
                { name: 'حائل', features: ['جبال أجا وسلمى', 'زراعة قمح'] },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الضوابط الشرعية
    // ══════════════════════════════════════════════════════════
    _initShariaGuidance() {
        return {
            nameAr: 'الضوابط الشرعية', nameEn: 'Sharia Guidance',
            principles: [
                { id: 'istikhlaf', nameAr: 'الاستخلاف في الأرض', description: 'إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً — عمارة الأرض مسؤولية', icon: '🌍' },
                { id: 'la-fasad', nameAr: 'عدم الإفساد', description: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا — حماية البيئة', icon: '🌿' },
                { id: 'ihya', nameAr: 'إحياء الأرض الموات', description: 'من أحيا أرضاً مواتاً فهي له — حديث نبوي', icon: '🌱' },
                { id: 'mawzun', nameAr: 'التوازن والميزان', description: 'وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ — التوازن البيئي', icon: '⚖️' },
                { id: 'shukr', nameAr: 'شكر النعم', description: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ — شكر نعم الماء والزراعة والمعادن', icon: '🤲' },
                { id: 'riba-dhahab', nameAr: 'ضوابط تجارة الذهب والفضة', description: 'لا تبيعوا الذهب بالذهب إلا مثلاً بمثل — ربا البيوع', icon: '⚖️' },
                { id: 'hirz', nameAr: 'حفظ الموارد للأجيال', description: 'حفظ ثروات الأمة والأجيال القادمة — مقصد شرعي', icon: '👶' },
                { id: 'tayyib', nameAr: 'الطيبات في الزراعة', description: 'كُلُوا مِنَ الطَّيِّبَاتِ — زراعة حلال طيبة بلا مبيدات ضارة', icon: '🌾' },
            ],
        };
    }

    getDashboard() {
        return {
            name: this.name, version: this.version, startedAt: this.startedAt,
            summary: {
                agriSectors: this.agriculture.sectors.length,
                waterSources: this.water.sources.length,
                continents: this.geography.continents.length,
                climateZones: this.geography.climateZones.length,
                earthLayers: this.geology.earthLayers.length,
                rockTypes: this.geology.rockTypes.length,
                mineralCategories: this.minerals.categories.length,
                ecosystems: this.environment.ecosystems.length,
                protectedAreas: this.environment.saudiProtectedAreas.length,
                saudiRegions: this.saudiResources.regions.length,
                quranVerses: this.quranReferences.length,
                shariaRules: this.shariaGuidance.principles.length,
            },
            quranReferences: this.quranReferences,
            agriculture: this.agriculture,
            water: this.water,
            geography: this.geography,
            geology: this.geology,
            minerals: this.minerals,
            environment: this.environment,
            saudiResources: this.saudiResources,
            shariaGuidance: this.shariaGuidance,
        };
    }
}

module.exports = SheikhaEarthResourcesEngine;
