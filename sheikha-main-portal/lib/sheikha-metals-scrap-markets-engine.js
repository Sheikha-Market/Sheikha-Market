/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة للمعادن والسكراب والأسواق
 * Sheikha Metals, Scrap & Markets Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ" — الحديد ٢٥
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// ١. منظومة المعادن المتكاملة — METALS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const METALS_DATABASE = {

    // ─── الأساس الشرعي ────────────────────────────────────────────
    islamicFoundation: {
        verses: [
            { ref: 'الحديد:25', text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', principle: 'الحديد نعمة إلهية مُنزّلة — فيه قوة ومنافع' },
            { ref: 'الكهف:96', text: 'آتُونِي زُبَرَ الْحَدِيدِ', principle: 'استخدام الحديد في البناء والتعمير — ذو القرنين' },
            { ref: 'سبأ:10-11', text: 'وَأَلَنَّا لَهُ الْحَدِيدَ * أَنِ اعْمَلْ سَابِغَاتٍ وَقَدِّرْ فِي السَّرْدِ', principle: 'الله ألان الحديد لداود — التصنيع والإتقان' },
            { ref: 'الرحمن:9', text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', principle: 'العدل في الموازين — أساس تجارة المعادن' },
            { ref: 'المطففين:1-3', text: 'وَيْلٌ لِّلْمُطَفِّفِينَ * الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ * وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ', principle: 'تحريم الغش في الأوزان — أساس النقاوة والجودة' },
            { ref: 'الكهف:96', text: 'حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا حَتَّىٰ إِذَا جَعَلَهُ نَارًا قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا', principle: 'صهر النحاس (القطر) — أول عملية تعدين في القرآن' },
            { ref: 'آل عمران:14', text: 'وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ', principle: 'الذهب والفضة من زينة الدنيا — نعمة تتطلب شكراً' }
        ],
        hadith: [
            { text: 'لا تبيعوا الذهب بالذهب إلا مثلاً بمثل ولا تُشِفّوا بعضها على بعض', source: 'متفق عليه', principle: 'حديث الأصناف الستة — أساس تجارة المعادن الثمينة' },
            { text: 'الذهب بالذهب والفضة بالفضة والبر بالبر والشعير بالشعير والتمر بالتمر والملح بالملح مثلاً بمثل يداً بيد', source: 'رواه مسلم', principle: 'القاعدة الذهبية: التماثل والتقابض في الأصناف الربوية' },
            { text: 'من غشنا فليس منا', source: 'رواه مسلم', principle: 'تحريم الغش في المعادن — النقاوة والجودة واجبة' },
            { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', source: 'رواه الطبراني', principle: 'الإتقان في التعدين والتصنيع والفحص' },
            { text: 'البيعان بالخيار ما لم يتفرقا', source: 'متفق عليه', principle: 'حق الخيار في تجارة المعادن' },
            { text: 'نهى عن بيع الغرر', source: 'رواه مسلم', principle: 'تحريم الجهالة — وجوب بيان المواصفات الكاملة للمعدن' }
        ]
    },

    // ─── المعادن الثمينة ─────────────────────────────────────────
    precious: {
        gold: {
            nameAr: 'ذهب', nameEn: 'Gold', symbol: 'Au', atomicNumber: 79,
            category: 'ثمين', group: 'المعادن الانتقالية',
            quranRef: 'آل عمران:14 — "وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ"',
            shariaRule: 'الذهب صنف ربوي — يُباع مثلاً بمثل يداً بيد — لا يجوز التفاضل أو النسيئة',
            zakatRate: '2.5% — نصاب 85 غرام ذهب',
            properties: {
                density: { value: 19.32, unit: 'g/cm³', desc: 'كثافة عالية جداً' },
                meltingPoint: { value: 1064, unit: '°C' },
                boilingPoint: { value: 2856, unit: '°C' },
                hardness: { value: '2.5', scale: 'موس', desc: 'لين — قابل للطرق والسحب' },
                conductivity: { electrical: 'ممتاز — 45.2 MS/m', thermal: 'ممتاز — 318 W/(m·K)' },
                corrosionResistance: 'ممتاز — لا يتأكسد ولا يصدأ',
                color: 'أصفر ذهبي لامع'
            },
            purities: [
                { karat: 24, purity: 99.9, nameAr: 'ذهب 24 قيراط', use: 'سبائك استثمارية', stamp: '999.9' },
                { karat: 22, purity: 91.6, nameAr: 'ذهب 22 قيراط', use: 'مجوهرات راقية', stamp: '916' },
                { karat: 21, purity: 87.5, nameAr: 'ذهب 21 قيراط', use: 'مجوهرات شائعة', stamp: '875' },
                { karat: 18, purity: 75.0, nameAr: 'ذهب 18 قيراط', use: 'مجوهرات وساعات', stamp: '750' },
                { karat: 14, purity: 58.3, nameAr: 'ذهب 14 قيراط', use: 'حلي اقتصادية', stamp: '585' }
            ],
            standards: ['LBMA Good Delivery', 'ISO 9999', 'Dubai Good Delivery'],
            forms: ['سبائك', 'عملات', 'حبيبات', 'أسلاك', 'ألواح', 'مجوهرات'],
            majorProducers: ['الصين', 'روسيا', 'أستراليا', 'كندا', 'الولايات المتحدة'],
            priceUnit: 'دولار/أونصة تروي (31.1g)',
            infiniteRecycle: true
        },
        silver: {
            nameAr: 'فضة', nameEn: 'Silver', symbol: 'Ag', atomicNumber: 47,
            category: 'ثمين', group: 'المعادن الانتقالية',
            quranRef: 'آل عمران:14 — "وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ"',
            shariaRule: 'الفضة صنف ربوي — يُباع مثلاً بمثل يداً بيد',
            zakatRate: '2.5% — نصاب 595 غرام فضة',
            properties: {
                density: { value: 10.49, unit: 'g/cm³' },
                meltingPoint: { value: 961.8, unit: '°C' },
                boilingPoint: { value: 2162, unit: '°C' },
                hardness: { value: '2.5-3', scale: 'موس' },
                conductivity: { electrical: 'الأعلى بين المعادن — 63 MS/m', thermal: 'الأعلى — 429 W/(m·K)' },
                corrosionResistance: 'جيد — يتأكسد ببطء (يسودّ)',
                color: 'أبيض فضي لامع'
            },
            purities: [
                { purity: 99.99, nameAr: 'فضة نقية', stamp: '9999', use: 'استثمار وصناعة' },
                { purity: 99.9, nameAr: 'فضة استرلينية+', stamp: '999', use: 'سبائك' },
                { purity: 92.5, nameAr: 'فضة استرلينية', stamp: '925', use: 'مجوهرات وأواني' }
            ],
            standards: ['LBMA Good Delivery', 'COMEX deliverable'],
            forms: ['سبائك', 'عملات', 'حبيبات', 'أسلاك', 'مسحوق'],
            majorProducers: ['المكسيك', 'البيرو', 'الصين', 'روسيا', 'بولندا'],
            priceUnit: 'دولار/أونصة تروي',
            infiniteRecycle: true
        },
        platinum: {
            nameAr: 'بلاتين', nameEn: 'Platinum', symbol: 'Pt', atomicNumber: 78,
            category: 'ثمين', group: 'مجموعة البلاتين PGM',
            shariaRule: 'يجوز بيعه بالذهب والفضة متفاضلاً — ليس صنفاً ربوياً عند الجمهور',
            properties: {
                density: { value: 21.45, unit: 'g/cm³', desc: 'أثقل من الذهب' },
                meltingPoint: { value: 1768, unit: '°C' },
                hardness: { value: '3.5', scale: 'موس' },
                conductivity: { electrical: 'جيد — 9.43 MS/m' },
                corrosionResistance: 'ممتاز جداً — مقاوم لمعظم الأحماض',
                color: 'أبيض رمادي'
            },
            forms: ['سبائك', 'أسلاك', 'محفزات سيارات', 'مجوهرات'],
            majorProducers: ['جنوب أفريقيا (70%)', 'روسيا', 'زيمبابوي'],
            priceUnit: 'دولار/أونصة تروي',
            infiniteRecycle: true
        },
        palladium: {
            nameAr: 'بلاديوم', nameEn: 'Palladium', symbol: 'Pd', atomicNumber: 46,
            category: 'ثمين', group: 'مجموعة البلاتين PGM',
            properties: {
                density: { value: 12.02, unit: 'g/cm³' },
                meltingPoint: { value: 1555, unit: '°C' },
                hardness: { value: '4.75', scale: 'موس' },
                color: 'أبيض فضي'
            },
            uses: ['محفزات سيارات (80%)', 'إلكترونيات', 'طب أسنان', 'مجوهرات'],
            majorProducers: ['روسيا (40%)', 'جنوب أفريقيا', 'كندا'],
            infiniteRecycle: true
        }
    },

    // ─── المعادن الأساسية (الصناعية) ─────────────────────────────
    base: {
        iron: {
            nameAr: 'حديد', nameEn: 'Iron', symbol: 'Fe', atomicNumber: 26,
            category: 'أساسي', group: 'المعادن الانتقالية',
            quranRef: 'الحديد:25 — "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ"',
            quranFact: 'سورة كاملة باسم الحديد — السورة رقم 57 — العدد الذري للحديد 26 وإذا عددنا "بسم الله الرحمن الرحيم" فالآية 25 هي رقم 26',
            shariaRule: 'ليس صنفاً ربوياً — يجوز بيعه متفاضلاً ونسيئة بشرط عدم الغرر',
            properties: {
                density: { value: 7.874, unit: 'g/cm³' },
                meltingPoint: { value: 1538, unit: '°C' },
                boilingPoint: { value: 2862, unit: '°C' },
                hardness: { value: '4', scale: 'موس' },
                conductivity: { electrical: '10 MS/m', thermal: '80 W/(m·K)' },
                tensileStrength: { value: '540 MPa', desc: 'قوي جداً' },
                corrosionResistance: 'ضعيف — يصدأ بسهولة',
                magnetic: true,
                color: 'رمادي فضي'
            },
            alloys: [
                { name: 'فولاذ كربوني', carbon: '0.2-2.1%', use: 'إنشاءات وهياكل', strength: 'عالي' },
                { name: 'ستانلس 304', composition: 'Fe+18%Cr+8%Ni', use: 'أدوات منزلية ومعمارية', corrosionResist: 'ممتاز' },
                { name: 'ستانلس 316', composition: 'Fe+16%Cr+10%Ni+2%Mo', use: 'بيئات بحرية وكيميائية', corrosionResist: 'ممتاز+' },
                { name: 'حديد زهر', carbon: '2.5-4%', use: 'مواسير ومحركات', castability: 'ممتاز' },
                { name: 'حديد تسليح', carbon: '<0.6%', use: 'خرسانة مسلحة', standards: 'SASO, ASTM A615' }
            ],
            forms: ['سبائك (بيليت)', 'لفائف', 'ألواح', 'حديد تسليح', 'أنابيب', 'كمرات H/I', 'زوايا', 'مسطحات'],
            hsCode: '72xx',
            standards: ['ASTM A36', 'SASO GSO', 'EN 10025', 'JIS G3101'],
            majorProducers: ['الصين (50%+)', 'الهند', 'اليابان', 'الولايات المتحدة', 'روسيا'],
            saudiRelevance: 'حديد سابك (HADEED) — أكبر منتج حديد في الخليج',
            infiniteRecycle: true
        },
        copper: {
            nameAr: 'نحاس', nameEn: 'Copper', symbol: 'Cu', atomicNumber: 29,
            category: 'أساسي', group: 'المعادن الانتقالية',
            quranRef: 'الكهف:96 — "آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا" — القِطر هو النحاس المصهور',
            properties: {
                density: { value: 8.96, unit: 'g/cm³' },
                meltingPoint: { value: 1085, unit: '°C' },
                hardness: { value: '3', scale: 'موس' },
                conductivity: { electrical: 'ممتاز — 59.6 MS/m (المعيار المرجعي)', thermal: 'ممتاز — 401 W/(m·K)' },
                corrosionResistance: 'جيد — يتأكسد لطبقة خضراء واقية (باتينا)',
                antimicrobial: true,
                color: 'أحمر برتقالي'
            },
            grades: [
                { name: 'نحاس كاثود', purity: '99.99%', lmeGrade: 'Grade A', hsCode: '7403' },
                { name: 'نحاس Berry #1', purity: '99%+', isri: 'Berry', hsCode: '7404', desc: 'سكراب نظيف بدون عزل' },
                { name: 'نحاس Birch #2', purity: '96%+', isri: 'Birch', hsCode: '7404', desc: 'سكراب مع بعض الشوائب' },
                { name: 'أسلاك Candy', purity: '75-85%', isri: 'Candy', hsCode: '7404', desc: 'كابلات نحاس معزولة' }
            ],
            forms: ['كاثود', 'أسلاك', 'أنابيب', 'ألواح', 'قضبان', 'سبائك'],
            hsCode: '74xx',
            standards: ['LME Grade A', 'ASTM B115', 'EN 1978'],
            majorProducers: ['تشيلي (28%)', 'البيرو', 'الصين', 'الكونغو', 'الولايات المتحدة'],
            infiniteRecycle: true
        },
        aluminum: {
            nameAr: 'ألمنيوم', nameEn: 'Aluminum', symbol: 'Al', atomicNumber: 13,
            category: 'أساسي', group: 'معادن ما بعد الانتقالية',
            properties: {
                density: { value: 2.70, unit: 'g/cm³', desc: 'خفيف جداً — ثلث وزن الفولاذ' },
                meltingPoint: { value: 660, unit: '°C' },
                hardness: { value: '2.75', scale: 'موس' },
                conductivity: { electrical: 'جيد جداً — 37.7 MS/m', thermal: 'جيد — 237 W/(m·K)' },
                corrosionResistance: 'ممتاز — طبقة أكسيد واقية طبيعية',
                color: 'فضي فاتح'
            },
            alloys: [
                { series: '1xxx', desc: 'ألمنيوم نقي 99%+', use: 'أغذية وكيماويات' },
                { series: '2xxx', desc: 'Al-Cu', use: 'طيران (دورالومين)' },
                { series: '3xxx', desc: 'Al-Mn', use: 'علب مشروبات' },
                { series: '5xxx', desc: 'Al-Mg', use: 'بحري ومعماري' },
                { series: '6xxx', desc: 'Al-Mg-Si', use: 'قطاعات بناء (الأكثر شيوعاً)' },
                { series: '7xxx', desc: 'Al-Zn', use: 'طيران وعسكري (الأقوى)' }
            ],
            forms: ['سبائك (إنجوت)', 'لفائف', 'قطاعات (بروفايل)', 'ألواح', 'رقائق (فويل)', 'علب'],
            hsCode: '76xx',
            standards: ['LME P1020A', 'AA Standards', 'EN 573'],
            majorProducers: ['الصين (57%)', 'الهند', 'روسيا', 'كندا', 'الإمارات (ألبا)'],
            saudiRelevance: 'معادن (Ma\'aden) — مشروع ألمنيوم رأس الخير',
            infiniteRecycle: true,
            energySavingRecycle: '95% توفير طاقة عند إعادة التدوير'
        },
        zinc: {
            nameAr: 'زنك', nameEn: 'Zinc', symbol: 'Zn', atomicNumber: 30,
            category: 'أساسي',
            properties: {
                density: { value: 7.13, unit: 'g/cm³' },
                meltingPoint: { value: 419.5, unit: '°C' },
                hardness: { value: '2.5', scale: 'موس' },
                color: 'أبيض مزرق'
            },
            primaryUse: 'جلفنة الحديد (60%) — حماية من الصدأ',
            forms: ['سبائك', 'ألواح', 'مسحوق', 'طلاء جلفنة'],
            hsCode: '79xx', infiniteRecycle: true
        },
        lead: {
            nameAr: 'رصاص', nameEn: 'Lead', symbol: 'Pb', atomicNumber: 82,
            category: 'أساسي',
            properties: {
                density: { value: 11.34, unit: 'g/cm³', desc: 'ثقيل جداً' },
                meltingPoint: { value: 327.5, unit: '°C', desc: 'نقطة انصهار منخفضة' },
                hardness: { value: '1.5', scale: 'موس', desc: 'لين جداً' },
                toxic: true, toxicNote: 'سام — يتطلب احتياطات صحية صارمة',
                color: 'رمادي مزرق'
            },
            primaryUse: 'بطاريات حمض-رصاص (85%)',
            forms: ['سبائك', 'ألواح', 'أنابيب', 'بطاريات'],
            hsCode: '78xx', infiniteRecycle: true, recyclingRate: '95% — الأعلى بين المعادن'
        },
        tin: {
            nameAr: 'قصدير', nameEn: 'Tin', symbol: 'Sn', atomicNumber: 50,
            category: 'أساسي',
            properties: {
                density: { value: 7.26, unit: 'g/cm³' },
                meltingPoint: { value: 231.9, unit: '°C' },
                corrosionResistance: 'ممتاز — يُستخدم لتغليف الحديد',
                color: 'فضي أبيض'
            },
            primaryUse: 'لحام إلكتروني (50%) + طلاء علب الصفيح',
            hsCode: '80xx', infiniteRecycle: true
        },
        nickel: {
            nameAr: 'نيكل', nameEn: 'Nickel', symbol: 'Ni', atomicNumber: 28,
            category: 'أساسي',
            properties: {
                density: { value: 8.91, unit: 'g/cm³' },
                meltingPoint: { value: 1455, unit: '°C' },
                magnetic: true,
                corrosionResistance: 'ممتاز',
                color: 'فضي أبيض'
            },
            primaryUse: 'سبائك ستانلس ستيل (68%) + بطاريات ليثيوم',
            hsCode: '75xx', infiniteRecycle: true
        }
    },

    // ─── المعادن النادرة والاستراتيجية ──────────────────────────
    strategic: {
        lithium: { nameAr: 'ليثيوم', symbol: 'Li', atomicNumber: 3, use: 'بطاريات السيارات الكهربائية', strategicImportance: 'حرج — "البترول الأبيض"' },
        cobalt: { nameAr: 'كوبالت', symbol: 'Co', atomicNumber: 27, use: 'بطاريات + سبائك فائقة', strategicImportance: 'حرج' },
        titanium: { nameAr: 'تيتانيوم', symbol: 'Ti', atomicNumber: 22, use: 'طيران + طبي + بحري', strategicImportance: 'عالي', properties: { density: 4.51, strengthToWeight: 'الأعلى بين المعادن' } },
        tungsten: { nameAr: 'تنجستن', symbol: 'W', atomicNumber: 74, use: 'أدوات قطع + عسكري', properties: { meltingPoint: 3422, desc: 'أعلى نقطة انصهار بين المعادن' } },
        chromium: { nameAr: 'كروم', symbol: 'Cr', atomicNumber: 24, use: 'ستانلس ستيل + طلاء', properties: { hardness: 8.5 } },
        manganese: { nameAr: 'منجنيز', symbol: 'Mn', atomicNumber: 25, use: 'فولاذ (90%) + بطاريات' },
        molybdenum: { nameAr: 'موليبدينوم', symbol: 'Mo', atomicNumber: 42, use: 'سبائك فولاذ عالية القوة' },
        vanadium: { nameAr: 'فاناديوم', symbol: 'V', atomicNumber: 23, use: 'فولاذ فائق القوة + بطاريات تدفق' },
        rareEarths: { nameAr: 'عناصر أرضية نادرة', count: 17, use: 'مغناطيس دائم + إلكترونيات + طاقة متجددة', strategicImportance: 'حرج جداً — الصين تسيطر على 60%' }
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// ٢. منظومة السكراب المتكاملة — SCRAP SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const SCRAP_DATABASE = {

    islamicBasis: {
        principle: 'حفظ المال — نهى النبي ﷺ عن إضاعة المال — إعادة تدوير السكراب واجبة لحفظ الموارد',
        verses: [
            { ref: 'الأعراف:31', text: 'وَلَا تُسْرِفُوا', principle: 'عدم الإسراف — كل معدن مهدر إسراف' },
            { ref: 'الحديد:25', text: 'وَمَنَافِعُ لِلنَّاسِ', principle: 'المنافع تشمل إعادة الاستخدام' }
        ]
    },

    // ─── تصنيف ISRI (معهد صناعات إعادة التدوير الأمريكي) ───────
    isriGrades: {
        ferrous: [
            { isri: 'HMS 1', nameAr: 'حديد ثقيل #1', desc: 'سمك ¼ بوصة فأكثر — نظيف — بدون صفيح', hsCode: '7204.49', minThickness: '6.35mm', price: 'مرتفع' },
            { isri: 'HMS 2', nameAr: 'حديد ثقيل #2', desc: 'سمك أقل من ¼ بوصة — يقبل بعض الصفيح', hsCode: '7204.49', price: 'متوسط' },
            { isri: 'Shredded', nameAr: 'حديد مفروم', desc: 'مُعالج بالفرامة — نظيف ومتجانس', hsCode: '7204.41', price: 'مرتفع', note: 'الأكثر طلباً عالمياً' },
            { isri: 'P&S', nameAr: 'خراطة حديد', desc: 'برادة ورقائق من التشغيل', hsCode: '7204.41', price: 'منخفض' },
            { isri: 'Busheling', nameAr: 'قصاصات صناعية', desc: 'بقايا تصنيع جديدة — نظيفة جداً', hsCode: '7204.41', price: 'عالي' }
        ],
        copper: [
            { isri: 'Berry', nameAr: 'نحاس #1', desc: 'نحاس نظيف — سُمك ١/١٦ بوصة فأكثر — بدون طلاء', hsCode: '7404.00', purity: '99%+', price: 'أعلى سعر' },
            { isri: 'Birch', nameAr: 'نحاس #2', desc: 'نحاس مع لحام أو طلاء خفيف', hsCode: '7404.00', purity: '96%+', price: 'مرتفع' },
            { isri: 'Candy', nameAr: 'كابلات نحاس', desc: 'أسلاك نحاس معزولة — 70-85% نحاس', hsCode: '7404.00', purity: '70-85%', price: 'متوسط' },
            { isri: 'Cliff', nameAr: 'نحاس أصفر #1', desc: 'سبيكة نحاس+زنك نظيفة', hsCode: '7404.00', price: 'متوسط' }
        ],
        aluminum: [
            { isri: 'Taint/Tabor', nameAr: 'ألمنيوم نظيف', desc: 'ألمنيوم نظيف — بدون حديد', hsCode: '7602.00', price: 'مرتفع' },
            { isri: 'Taldon', nameAr: 'علب ألمنيوم', desc: 'علب مشروبات مضغوطة', hsCode: '7602.00', price: 'متوسط' },
            { isri: 'Tense', nameAr: 'قطاعات ألمنيوم', desc: 'بروفايل بناء نظيف', hsCode: '7602.00', price: 'مرتفع' },
            { isri: 'Twitch', nameAr: 'ألمنيوم مختلط', desc: 'خليط أنواع ألمنيوم', hsCode: '7602.00', price: 'منخفض' }
        ],
        stainless: [
            { isri: '304 SS', nameAr: 'ستانلس 304', desc: 'كروم 18% + نيكل 8%', hsCode: '7204.21', price: 'مرتفع' },
            { isri: '316 SS', nameAr: 'ستانلس 316', desc: 'مع موليبدينوم — بحري', hsCode: '7204.21', price: 'أعلى' }
        ],
        eWaste: [
            { name: 'لوحات إلكترونية PCB', desc: 'تحتوي ذهب + فضة + بلاديوم + نحاس', hsCode: '8549', recovery: 'ذهب: 150-400 g/طن', value: 'مرتفع جداً' },
            { name: 'معالجات CPU', desc: 'أعلى محتوى ذهب في السكراب الإلكتروني', recovery: 'ذهب: 3-10 g/kg', value: 'عالي جداً' },
            { name: 'ذاكرة RAM', desc: 'طبقات ذهب على الموصلات', recovery: 'ذهب: 1-5 g/kg' },
            { name: 'كابلات', desc: 'نحاس معزول — 60-85% نحاس', recovery: 'نحاس: 600-850 g/kg' },
            { name: 'بطاريات ليثيوم', desc: 'ليثيوم + كوبالت + نيكل', recovery: 'كوبالت: 50-150 g/kg', hazardous: true }
        ],
        automotive: [
            { name: 'محركات سيارات', desc: 'حديد زهر + ألمنيوم + نحاس', avgWeight: '150-250 kg', value: 'متوسط-مرتفع' },
            { name: 'هياكل سيارات', desc: 'فولاذ مجلفن — يُعالج بالفرامة', avgWeight: '800-1200 kg' },
            { name: 'محولات نحاس', desc: 'محفزات تحتوي بلاتين/بلاديوم/روديوم', value: 'عالي جداً' },
            { name: 'إطارات ألمنيوم', desc: 'سبائك ألمنيوم عالية الجودة', avgWeight: '8-12 kg/عجلة' },
            { name: 'رادياتير', desc: 'نحاس/ألمنيوم — تبريد المحرك', value: 'متوسط' }
        ]
    },

    // ─── معايير الفحص والجودة ─────────────────────────────────────
    qualityStandards: {
        inspection: [
            { id: 'visual', nameAr: 'فحص بصري', desc: 'تحديد النوع واللون والشكل والنظافة' },
            { id: 'magnetic', nameAr: 'فحص مغناطيسي', desc: 'فصل الحديدي عن غير الحديدي' },
            { id: 'xrf', nameAr: 'تحليل XRF', desc: 'جهاز أشعة سينية لتحليل التركيب — دقة 99%', equipment: 'XRF Analyzer' },
            { id: 'spectrometer', nameAr: 'مطياف ضوئي OES', desc: 'تحليل دقيق للسبائك — يحدد كل العناصر', equipment: 'Optical Emission Spectrometer' },
            { id: 'density', nameAr: 'اختبار الكثافة', desc: 'قياس الكثافة للتحقق من النقاوة' },
            { id: 'weight', nameAr: 'وزن دقيق', desc: 'ميزان معتمد — "وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ"', shariaLink: true }
        ],
        contaminants: [
            { name: 'زيوت وشحوم', maxLevel: '<1%', effect: 'تلوث الصهر' },
            { name: 'صدأ', maxLevel: '<5%', effect: 'يقلل النقاوة' },
            { name: 'طلاء/دهان', maxLevel: '<2%', effect: 'غازات سامة عند الصهر' },
            { name: 'مواد غير معدنية', maxLevel: '<2%', effect: 'تقلل جودة المنتج النهائي' },
            { name: 'رطوبة', maxLevel: '<3%', effect: 'خطر انفجار عند الصهر' },
            { name: 'مواد مشعة', maxLevel: '0%', effect: 'مرفوض نهائياً — خطر صحي' }
        ]
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// ٣. منظومة شيخة للأسواق — MARKETS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const MARKETS_DATABASE = {

    // ─── أسواق المعادن العالمية ──────────────────────────────────
    globalExchanges: [
        {
            id: 'lme', nameAr: 'بورصة لندن للمعادن', nameEn: 'London Metal Exchange',
            location: 'لندن، المملكة المتحدة', founded: 1877,
            metals: ['ألمنيوم', 'نحاس', 'زنك', 'نيكل', 'قصدير', 'رصاص', 'كوبالت', 'سبائك ألمنيوم'],
            tradingHours: '01:00-19:00 GMT', currency: 'USD',
            importance: 'المرجع العالمي لأسعار المعادن الأساسية — 80% من عقود المعادن عالمياً',
            contractSize: { copper: '25 طن', aluminum: '25 طن', zinc: '25 طن' }
        },
        {
            id: 'comex', nameAr: 'كومكس', nameEn: 'COMEX (CME Group)',
            location: 'نيويورك', founded: 1933,
            metals: ['ذهب', 'فضة', 'نحاس', 'بلاتين', 'بلاديوم'],
            importance: 'المرجع العالمي لأسعار المعادن الثمينة',
            contractSize: { gold: '100 أونصة تروي', silver: '5000 أونصة تروي' }
        },
        {
            id: 'shfe', nameAr: 'بورصة شنغهاي للعقود الآجلة', nameEn: 'Shanghai Futures Exchange',
            location: 'شنغهاي، الصين',
            metals: ['نحاس', 'ألمنيوم', 'زنك', 'نيكل', 'قصدير', 'رصاص', 'ذهب', 'فضة'],
            importance: 'ثاني أكبر بورصة معادن — تعكس الطلب الصيني'
        },
        {
            id: 'dgcx', nameAr: 'بورصة دبي للذهب والسلع', nameEn: 'DGCX',
            location: 'دبي', importance: 'مرجع إقليمي — ذهب كيلو بار'
        },
        {
            id: 'lbma', nameAr: 'جمعية سوق السبائك في لندن', nameEn: 'LBMA',
            location: 'لندن', importance: 'المعيار العالمي لأسعار الذهب والفضة — London Fix'
        }
    ],

    // ─── الأسواق الشرعية — سوق المدينة وأحكام البيوع ──────────
    islamicMarkets: {
        nameAr: 'أحكام الأسواق في الإسلام',
        motto: '"هذا سوقكم لا يُنقص ولا يُضرب عليه خراج"',

        foundingPrinciples: [
            { id: 'free-market', nameAr: 'حرية السوق', hadith: 'هذا سوقكم لا يُنقص ولا يُضرب عليه خراج', application: 'لا احتكار — لا ضرائب ظالمة — حرية الدخول والخروج' },
            { id: 'no-fraud', nameAr: 'منع الغش', hadith: 'من غشنا فليس منا', application: 'فحص إلزامي — بيان العيوب — شهادات الجودة' },
            { id: 'fair-pricing', nameAr: 'التسعير العادل', hadith: 'إن الله هو المسعّر القابض الباسط الرازق', application: 'السعر بالعرض والطلب — لا تسعير جبري إلا لمنع الضرر' },
            { id: 'no-monopoly', nameAr: 'منع الاحتكار', hadith: 'لا يحتكر إلا خاطئ', application: 'نظام ذكي لكشف الاحتكار — تنويع الموردين' },
            { id: 'mutual-consent', nameAr: 'التراضي', verse: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', application: 'عقود ذكية — موافقة صريحة — حق الخيار' },
            { id: 'just-weights', nameAr: 'العدل في الموازين', verse: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ', application: 'موازين رقمية معتمدة — تدقيق مستمر' },
            { id: 'no-riba', nameAr: 'تحريم الربا', verse: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', application: 'لا فوائد — تمويل إسلامي — مرابحة وإجارة' },
            { id: 'transparency', nameAr: 'الشفافية', hadith: 'البيعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بُورك لهما', application: 'بيان كامل للمواصفات — لا جهالة' },
            { id: 'hisbah', nameAr: 'الحسبة والرقابة', source: 'عيّن النبي ﷺ سعيد بن سعيد العاص محتسباً على سوق المدينة', application: 'نظام رقابة آلي يعمل 24/7' }
        ],

        prohibitedInTrade: [
            { id: 'riba', nameAr: 'الربا', desc: 'الزيادة في بيع الأصناف الربوية — الذهب بالذهب والفضة بالفضة يداً بيد مثلاً بمثل', severity: 'كبيرة', digitalCheck: 'فحص تلقائي لكل صفقة ذهب/فضة' },
            { id: 'gharar', nameAr: 'الغرر', desc: 'بيع المجهول — جهالة في الصنف أو القدر أو الأجل', severity: 'كبيرة', digitalCheck: 'إلزام بيان المواصفات الكاملة' },
            { id: 'najash', nameAr: 'النجش', desc: 'الزيادة في الثمن بدون نية شراء لخداع الآخرين', severity: 'محرم', digitalCheck: 'كشف أنماط المزايدات الوهمية' },
            { id: 'talaqqi-rukban', nameAr: 'تلقي الركبان', desc: 'استقبال البائع قبل وصوله للسوق ليشتري بأقل من السعر', severity: 'محرم', digitalCheck: 'شفافية الأسعار للجميع' },
            { id: 'ihtikar', nameAr: 'الاحتكار', desc: 'حبس السلعة لرفع سعرها', severity: 'محرم', digitalCheck: 'مراقبة المخزون — إنذار عند الاحتكار' },
            { id: 'ghish', nameAr: 'الغش', desc: 'خلط المعدن الجيد بالرديء أو تزوير النقاوة', severity: 'كبيرة', digitalCheck: 'شهادات فحص إلزامية — XRF' },
            { id: 'bay-ala-bay', nameAr: 'البيع على بيع أخيه', desc: 'أن يسوم على سوم أخيه بعد التراضي', severity: 'محرم' }
        ],

        sixRibaItems: {
            nameAr: 'الأصناف الستة الربوية',
            hadith: 'الذهب بالذهب والفضة بالفضة والبر بالبر والشعير بالشعير والتمر بالتمر والملح بالملح مثلاً بمثل سواء بسواء يداً بيد',
            items: [
                { name: 'ذهب', category: 'نقد', rule: 'مثلاً بمثل يداً بيد', illah: 'الثمنية' },
                { name: 'فضة', category: 'نقد', rule: 'مثلاً بمثل يداً بيد', illah: 'الثمنية' },
                { name: 'بُر (قمح)', category: 'طعام', rule: 'مثلاً بمثل يداً بيد', illah: 'الطعم والكيل' },
                { name: 'شعير', category: 'طعام', rule: 'مثلاً بمثل يداً بيد' },
                { name: 'تمر', category: 'طعام', rule: 'مثلاً بمثل يداً بيد' },
                { name: 'ملح', category: 'طعام', rule: 'مثلاً بمثل يداً بيد' }
            ],
            crossSaleRule: 'إذا اختلفت الأصناف فبيعوا كيف شئتم إذا كان يداً بيد',
            applicationInSheikha: 'بيع ذهب بفضة جائز متفاضلاً بشرط التقابض — بيع ذهب بحديد جائز مطلقاً'
        },

        modernApplication: {
            nameAr: 'التطبيق الرقمي في شيخة',
            systems: [
                { id: 'auto-riba-check', nameAr: 'فحص الربا التلقائي', desc: 'كل صفقة ذهب/فضة تُفحص — التماثل والتقابض' },
                { id: 'quality-gate', nameAr: 'بوابة الجودة', desc: 'لا تُقبل سلعة بدون مواصفات كاملة — "نهى عن بيع الغرر"' },
                { id: 'price-transparency', nameAr: 'شفافية الأسعار', desc: 'أسعار لحظية من LME + LBMA + COMEX — للجميع' },
                { id: 'monopoly-detector', nameAr: 'كاشف الاحتكار', desc: 'يرصد تركز المخزون — ينبّه عند 30%+ من السوق' },
                { id: 'digital-muhtasib', nameAr: 'المحتسب الرقمي', desc: 'نظام رقابة 24/7 — يفحص كل معاملة' },
                { id: 'dispute-resolution', nameAr: 'فض النزاعات', desc: 'آلية ذكية لحل النزاعات حسب الشريعة' },
                { id: 'zakat-calculator', nameAr: 'حاسبة الزكاة', desc: 'حساب زكاة المعادن الثمينة تلقائياً' }
            ]
        }
    },

    // ─── أسواق المعادن السعودية ──────────────────────────────────
    saudiMarkets: {
        companies: [
            { name: 'معادن (Ma\'aden)', type: 'تعدين', metals: ['ذهب', 'ألمنيوم', 'فوسفات', 'نحاس'], listed: 'تداول: 1211', importance: 'أكبر شركة تعدين في الشرق الأوسط' },
            { name: 'سابك (SABIC)', type: 'صناعة', metals: ['فولاذ', 'ألمنيوم'], listed: 'تداول: 2010' },
            { name: 'حديد (HADEED/SABIC)', type: 'حديد', metals: ['حديد تسليح', 'مسطحات فولاذية'], importance: 'أكبر منتج حديد في الخليج' },
            { name: 'التصنيع الوطنية (NIC)', type: 'صناعة', metals: ['فولاذ', 'ستانلس'] },
            { name: 'الراجحي للصناعات', type: 'ألمنيوم', metals: ['قطاعات ألمنيوم'] },
            { name: 'أميانتيت', type: 'أنابيب', metals: ['أنابيب فولاذ', 'حديد دكتايل'] }
        ],
        industrialCities: ['الجبيل', 'ينبع', 'رأس الخير', 'وعد الشمال', 'جازان', 'الرياض (MODON)'],
        regulators: [
            { name: 'وزارة الصناعة والثروة المعدنية', role: 'تنظيم قطاع التعدين والصناعة' },
            { name: 'هيئة المساحة الجيولوجية', role: 'استكشاف الثروات المعدنية' },
            { name: 'SASO — هيئة المواصفات والمقاييس', role: 'معايير الجودة والسلامة' },
            { name: 'هيئة السوق المالية', role: 'تنظيم تداول المعادن كأوراق مالية' }
        ]
    },

    // ─── أنواع العقود في أسواق المعادن ──────────────────────────
    contractTypes: [
        { id: 'spot', nameAr: 'صفقة فورية', desc: 'تسليم فوري — T+2 — الأكثر توافقاً مع الشريعة', shariaStatus: 'جائز بشروط التقابض' },
        { id: 'forward', nameAr: 'عقد آجل', desc: 'تسليم مستقبلي بسعر متفق عليه', shariaStatus: 'جائز إذا كان سلماً صحيحاً' },
        { id: 'futures', nameAr: 'عقود مستقبلية', desc: 'عقود معيارية في البورصة', shariaStatus: 'فيه خلاف — الأكثرية على المنع لعدم التقابض' },
        { id: 'options', nameAr: 'عقود خيارات', desc: 'حق الشراء أو البيع بسعر محدد', shariaStatus: 'محل خلاف — بعض الهيئات أجازته كعربون' },
        { id: 'murabaha', nameAr: 'مرابحة معادن', desc: 'شراء المعدن ثم بيعه بربح معلوم بالتقسيط', shariaStatus: 'جائز — الصيغة الإسلامية الرئيسية', preferred: true },
        { id: 'salam', nameAr: 'سلم معادن', desc: 'دفع الثمن كاملاً مقدماً — تسليم المعدن لاحقاً بمواصفات محددة', shariaStatus: 'جائز — بشروط بيع السلم', preferred: true },
        { id: 'istisna', nameAr: 'استصناع', desc: 'طلب تصنيع معدن بمواصفات محددة', shariaStatus: 'جائز', preferred: true }
    ],

    // ─── وحدات القياس ──────────────────────────────────────────
    units: {
        weight: [
            { id: 'mt', nameAr: 'طن متري', nameEn: 'Metric Ton', kg: 1000, use: 'المعادن الأساسية عالمياً' },
            { id: 'lt', nameAr: 'طن طويل', nameEn: 'Long Ton', kg: 1016.05, use: 'بريطانيا' },
            { id: 'st', nameAr: 'طن قصير', nameEn: 'Short Ton', kg: 907.18, use: 'أمريكا' },
            { id: 'toz', nameAr: 'أونصة تروي', nameEn: 'Troy Ounce', g: 31.1035, use: 'المعادن الثمينة عالمياً' },
            { id: 'tola', nameAr: 'تولة', nameEn: 'Tola', g: 11.664, use: 'جنوب آسيا — الهند وباكستان' },
            { id: 'mithqal', nameAr: 'مثقال', g: 4.25, use: 'الفقه الإسلامي — نصاب الذهب = 20 مثقالاً = 85 غرام', shariaUnit: true },
            { id: 'dirham', nameAr: 'درهم شرعي', g: 2.975, use: 'الفقه الإسلامي — نصاب الفضة = 200 درهم = 595 غرام', shariaUnit: true }
        ],
        purity: [
            { id: 'percent', nameAr: 'نسبة مئوية', example: '99.99%', use: 'عام' },
            { id: 'karat', nameAr: 'قيراط', example: '24K = 99.9%', use: 'ذهب فقط' },
            { id: 'fineness', nameAr: 'عيار', example: '999.9', use: 'سبائك ذهب وفضة' },
            { id: 'sterling', nameAr: 'استرلينية', example: '925', use: 'فضة' }
        ]
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// ٤. المحرك الموحد — Unified Engine
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaMetalsScrapMarketsEngine {
    constructor() {
        this.name = 'منظومة شيخة للمعادن والسكراب والأسواق';
        this.version = '1.0.0';
        this.metals = METALS_DATABASE;
        this.scrap = SCRAP_DATABASE;
        this.markets = MARKETS_DATABASE;
        this.activatedAt = new Date().toISOString();
    }

    getDashboard() {
        const preciousCount = Object.keys(this.metals.precious).length;
        const baseCount = Object.keys(this.metals.base).length;
        const strategicCount = Object.keys(this.metals.strategic).length;
        return {
            name: this.name,
            version: this.version,
            metals: {
                precious: preciousCount,
                base: baseCount,
                strategic: strategicCount,
                total: preciousCount + baseCount + strategicCount,
                quranVerses: this.metals.islamicFoundation.verses.length,
                hadith: this.metals.islamicFoundation.hadith.length
            },
            scrap: {
                ferrousGrades: this.scrap.isriGrades.ferrous.length,
                copperGrades: this.scrap.isriGrades.copper.length,
                aluminumGrades: this.scrap.isriGrades.aluminum.length,
                stainlessGrades: this.scrap.isriGrades.stainless.length,
                eWasteTypes: this.scrap.isriGrades.eWaste.length,
                autoTypes: this.scrap.isriGrades.automotive.length,
                inspectionMethods: this.scrap.qualityStandards.inspection.length
            },
            markets: {
                globalExchanges: this.markets.globalExchanges.length,
                marketPrinciples: this.markets.islamicMarkets.foundingPrinciples.length,
                prohibitedPractices: this.markets.islamicMarkets.prohibitedInTrade.length,
                contractTypes: this.markets.contractTypes.length,
                saudiCompanies: this.markets.saudiMarkets.companies.length,
                digitalSystems: this.markets.islamicMarkets.modernApplication.systems.length,
                weightUnits: this.markets.units.weight.length
            }
        };
    }

    getMetalInfo(symbol) {
        for (const cat of ['precious', 'base', 'strategic']) {
            for (const [key, metal] of Object.entries(this.metals[cat])) {
                if (key === symbol || (metal.symbol && metal.symbol.toLowerCase() === symbol.toLowerCase()) || metal.nameAr === symbol || metal.nameEn?.toLowerCase() === symbol.toLowerCase()) {
                    return { key, category: cat, ...metal };
                }
            }
        }
        return null;
    }

    getProductCard(metalKey) {
        const metal = this.getMetalInfo(metalKey);
        if (!metal) return null;
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            بطاقة_تعريف_المنتج: {
                الاسم: metal.nameAr,
                الاسم_الإنجليزي: metal.nameEn,
                الرمز_الكيميائي: metal.symbol,
                العدد_الذري: metal.atomicNumber,
                التصنيف: metal.category,
                المرجع_القرآني: metal.quranRef || null,
                الحكم_الشرعي: metal.shariaRule || 'ليس صنفاً ربوياً — يجوز بيعه متفاضلاً',
                الزكاة: metal.zakatRate || 'لا زكاة — ليس نقداً'
            },
            الخواص_الفيزيائية: metal.properties || {},
            درجات_النقاوة: metal.purities || metal.grades || [],
            الأشكال_المتوفرة: metal.forms || [],
            المعايير_الدولية: metal.standards || [],
            أكبر_المنتجين: metal.majorProducers || [],
            رمز_الجمارك: metal.hsCode || null,
            قابل_لإعادة_التدوير: metal.infiniteRecycle || false,
            الأهمية_السعودية: metal.saudiRelevance || null
        };
    }

    getScrapGrades(category) {
        return this.scrap.isriGrades[category] || null;
    }

    getMarketPrinciples() {
        return this.markets.islamicMarkets.foundingPrinciples;
    }

    getRibaRules() {
        return this.markets.islamicMarkets.sixRibaItems;
    }

    getProhibitedPractices() {
        return this.markets.islamicMarkets.prohibitedInTrade;
    }

    getAllMetals() {
        const all = [];
        for (const cat of ['precious', 'base', 'strategic']) {
            for (const [key, m] of Object.entries(this.metals[cat])) {
                all.push({ key, category: cat, nameAr: m.nameAr, nameEn: m.nameEn, symbol: m.symbol, atomicNumber: m.atomicNumber });
            }
        }
        return all;
    }
}

module.exports = SheikhaMetalsScrapMarketsEngine;
