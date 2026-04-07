'use strict';
/**
 * lib/sheikha-metals-engine.js
 * المرحلة ٣٦ — محرك المعادن الكوني الشامل
 *
 * ﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾ — الحديد ٢٥
 * ﴿وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ﴾ — الأنبياء ٨٠
 *
 * يشمل: معادن ثمينة — معادن صناعية — معادن نادرة — سكراب — مقارنة بالدينار
 * المالك: سلمان أحمد بن سلمان الراجح | sheikha.top
 * بسم الله الرحمن الرحيم
 */

// تاريخ التحديث وسعر القاعدة
const METALS_BASE_DATE   = '2026-04-07';
const TROY_OZ_G          = 31.1035;
const USD_SAR            = 3.75;
const DINAR_USD          = (3287.50 / TROY_OZ_G) * 4.25;   // ≈ 449.21

// ══════════════════════════════════════════════════════════════════════════════
// ١. المعادن الثمينة — Precious Metals
// ══════════════════════════════════════════════════════════════════════════════
const PRECIOUS_METALS = [
    {
        id: 'gold', symbol: 'XAU', name_ar: 'الذهب', name_en: 'Gold',
        atomic_num: 79, category: 'precious',
        price_usd_oz: 3287.50, unit: 'أوقية تروي',
        price_usd_gram: +(3287.50 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(3287.50 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (3287.50 / TROY_OZ_G))).toFixed(4),
        annual_supply_tons: 4450, world_stock_tons: 208874,
        purity_grades: ['24K (999)', '22K (916)', '18K (750)', '14K (583)'],
        uses: ['مجوهرات', 'بنوك مركزية', 'إلكترونيات', 'أسنان', 'فضاء'],
        islamic_role: 'الدينار الإسلامي = ٤.٢٥ جرام ذهب خالص — ركيزة الاقتصاد الإسلامي',
        verse: '﴿وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ﴾ — التوبة ٣٤',
        source: 'LBMA Fix + CME',
        icon: '🥇', color: '#D4AF37',
    },
    {
        id: 'silver', symbol: 'XAG', name_ar: 'الفضة', name_en: 'Silver',
        atomic_num: 47, category: 'precious',
        price_usd_oz: 38.95, unit: 'أوقية تروي',
        price_usd_gram: +(38.95 / TROY_OZ_G).toFixed(4),
        price_sar_gram: +(38.95 / TROY_OZ_G * USD_SAR).toFixed(4),
        dinar_per_gram: +(1 / (DINAR_USD / (38.95 / TROY_OZ_G))).toFixed(6),
        annual_supply_tons: 31000, world_stock_tons: 1600000,
        purity_grades: ['999 Fine', '925 Sterling', '900 Coin', '800'],
        uses: ['مجوهرات', 'إلكترونيات', 'طاقة شمسية', 'مضادات بيولوجية', 'عملات'],
        islamic_role: 'الدرهم الإسلامي = ٢.٩٧٥ جرام فضة — الفضة مقللة ٨٤٠٪ عن نسبتها التاريخية للذهب',
        verse: '﴿وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ﴾ — التوبة ٣٤',
        source: 'LBMA + CME',
        icon: '🥈', color: '#C0C0C0',
    },
    {
        id: 'platinum', symbol: 'XPT', name_ar: 'البلاتين', name_en: 'Platinum',
        atomic_num: 78, category: 'precious',
        price_usd_oz: 1124.00, unit: 'أوقية تروي',
        price_usd_gram: +(1124.00 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(1124.00 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (1124.00 / TROY_OZ_G))).toFixed(5),
        annual_supply_tons: 210, world_stock_tons: 15000,
        purity_grades: ['950 Pt', '900 Pt', '850 Pt'],
        uses: ['محفزات السيارات', 'مجوهرات', 'أجهزة طبية', 'صناعة الزجاج', 'هيدروجين'],
        islamic_role: 'معدن نبيل — للصنعة والتقنية',
        source: 'LPPM',
        icon: '⬜', color: '#E5E4E2',
    },
    {
        id: 'palladium', symbol: 'XPD', name_ar: 'البلاديوم', name_en: 'Palladium',
        atomic_num: 46, category: 'precious',
        price_usd_oz: 1050.00, unit: 'أوقية تروي',
        price_usd_gram: +(1050.00 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(1050.00 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (1050.00 / TROY_OZ_G))).toFixed(5),
        annual_supply_tons: 220, world_stock_tons: 8000,
        purity_grades: ['999 Fine'],
        uses: ['محولات المحفز', 'إلكترونيات', 'طب الأسنان', 'مجوهرات'],
        source: 'LPPM + JM',
        icon: '🔘', color: '#CED0DD',
    },
    {
        id: 'rhodium', symbol: 'XRH', name_ar: 'الروديوم', name_en: 'Rhodium',
        atomic_num: 45, category: 'precious',
        price_usd_oz: 4200.00, unit: 'أوقية تروي',
        price_usd_gram: +(4200.00 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(4200.00 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (4200.00 / TROY_OZ_G))).toFixed(5),
        annual_supply_tons: 30, world_stock_tons: 500,
        uses: ['محولات المحفز (٨٠%)', 'طلاء المجوهرات', 'مرايا الكاشفات'],
        source: 'JM Precious',
        icon: '🔵', color: '#89C4F4',
    },
    {
        id: 'iridium', symbol: 'IR', name_ar: 'الإيريديوم', name_en: 'Iridium',
        atomic_num: 77, category: 'precious',
        price_usd_oz: 4600.00, unit: 'أوقية تروي',
        price_usd_gram: +(4600.00 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(4600.00 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (4600.00 / TROY_OZ_G))).toFixed(5),
        annual_supply_tons: 10, world_stock_tons: 300,
        uses: ['شمعات الإشعال', 'أقطاب الكيمياء الكهربائية', 'معدات الفضاء'],
        source: 'JM Precious',
        icon: '🟦', color: '#4B8BBE',
    },
    {
        id: 'ruthenium', symbol: 'RU', name_ar: 'الروثينيوم', name_en: 'Ruthenium',
        atomic_num: 44, category: 'precious',
        price_usd_oz: 490.00, unit: 'أوقية تروي',
        price_usd_gram: +(490.00 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(490.00 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (490.00 / TROY_OZ_G))).toFixed(6),
        annual_supply_tons: 35, world_stock_tons: 1000,
        uses: ['قرص الحاسوب', 'الخلايا الكهروكيميائية', 'مجوهرات'],
        source: 'JM Precious',
        icon: '🟫', color: '#A67C52',
    },
    {
        id: 'osmium', symbol: 'OS', name_ar: 'الأوزميوم', name_en: 'Osmium',
        atomic_num: 76, category: 'precious',
        price_usd_oz: 400.00, unit: 'أوقية تروي',
        price_usd_gram: +(400.00 / TROY_OZ_G).toFixed(2),
        price_sar_gram: +(400.00 / TROY_OZ_G * USD_SAR).toFixed(2),
        dinar_per_gram: +(1 / (DINAR_USD / (400.00 / TROY_OZ_G))).toFixed(6),
        annual_supply_tons: 1.5, world_stock_tons: 100,
        uses: ['أقلام الحبر الجاف', 'المحامل الصغيرة', 'المغناطيسات'],
        source: 'JM Precious',
        icon: '⚫', color: '#555555',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٢. المعادن الصناعية الأساسية — Base & Industrial Metals
// ══════════════════════════════════════════════════════════════════════════════
const INDUSTRIAL_METALS = [
    {
        id: 'copper', symbol: 'HG', name_ar: 'النحاس', name_en: 'Copper',
        atomic_num: 29, category: 'industrial',
        price_usd_ton: 9850, price_usd_kg: 9.85, price_sar_kg: +(9.85 * USD_SAR).toFixed(2),
        annual_supply_tons: 22_000_000, world_stock_tons: 890_000_000_000,
        uses: ['أسلاك الكهرباء (٦٥%)', 'السباكة', 'السيارات الكهربائية', 'بناء'],
        verse: '«وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ»',
        islamic_use: 'استخدمه داود ﷺ في صناعة الدروع',
        saudi_reserves_tons: 25_000_000,
        top_producers: [
            { country: 'تشيلي', pct: '26%' }, { country: 'بيرو', pct: '11%' },
            { country: 'الصين', pct: '8%' },  { country: 'الكونغو', pct: '7%' },
        ],
        source: 'LME', icon: '🟤', color: '#B87333',
    },
    {
        id: 'iron', symbol: 'FE', name_ar: 'الحديد (خام)', name_en: 'Iron Ore',
        atomic_num: 26, category: 'industrial',
        price_usd_ton: 105, price_usd_kg: 0.105, price_sar_kg: +(0.105 * USD_SAR).toFixed(3),
        annual_supply_tons: 2_600_000_000, world_stock_tons: null,
        uses: ['فولاذ البناء', 'السيارات', 'سفن', 'جسور', 'كل معادن الحياة'],
        verse: '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾ — الحديد ٢٥',
        islamic_use: 'ذكر الله الحديد في القرآن الكريم — سورة الحديد كاملة',
        saudi_reserves_tons: 3_600_000_000,
        top_producers: [
            { country: 'أستراليا', pct: '38%' }, { country: 'البرازيل', pct: '17%' },
            { country: 'الصين', pct: '14%' },    { country: 'الهند', pct: '7%' },
        ],
        source: 'SGX + CME', icon: '⚙️', color: '#808080',
    },
    {
        id: 'steel', symbol: 'STEEL', name_ar: 'الفولاذ (حديد مصنوع)', name_en: 'Steel',
        atomic_num: null, category: 'industrial',
        price_usd_ton: 490, price_usd_kg: 0.49, price_sar_kg: +(0.49 * USD_SAR).toFixed(2),
        annual_supply_tons: 1_890_000_000, world_stock_tons: null,
        uses: ['بناء (٥١%)', 'ميكانيكا', 'سيارات', 'أنابيب نفط وغاز', 'حاويات'],
        verse: '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾',
        top_producers: [
            { country: 'الصين', pct: '54%' }, { country: 'الهند', pct: '6%' },
            { country: 'اليابان', pct: '5%' },{ country: 'الولايات المتحدة', pct: '4%' },
        ],
        source: 'LME + worldsteel', icon: '🔩', color: '#607080',
    },
    {
        id: 'aluminum', symbol: 'ALI', name_ar: 'الألومنيوم', name_en: 'Aluminum',
        atomic_num: 13, category: 'industrial',
        price_usd_ton: 2510, price_usd_kg: 2.51, price_sar_kg: +(2.51 * USD_SAR).toFixed(2),
        annual_supply_tons: 69_000_000, world_stock_tons: 1_000_000_000,
        uses: ['طائرات', 'سيارات', 'عبوات', 'بناء', 'كهرباء'],
        top_producers: [
            { country: 'الصين', pct: '57%' },   { country: 'الهند', pct: '5%' },
            { country: 'روسيا', pct: '5%' },    { country: 'كندا', pct: '4%' },
        ],
        source: 'LME', icon: '⬜', color: '#C0C8D0',
    },
    {
        id: 'zinc', symbol: 'ZN', name_ar: 'الزنك', name_en: 'Zinc',
        atomic_num: 30, category: 'industrial',
        price_usd_ton: 2760, price_usd_kg: 2.76, price_sar_kg: +(2.76 * USD_SAR).toFixed(2),
        annual_supply_tons: 13_600_000, world_stock_tons: null,
        uses: ['حماية الفولاذ (٥٠%)', 'مصبوبات', 'ألوان', 'إلكترونيات'],
        top_producers: [
            { country: 'الصين', pct: '35%' }, { country: 'أستراليا', pct: '9%' },
            { country: 'بيرو', pct: '8%' },   { country: 'كندا', pct: '5%' },
        ],
        source: 'LME', icon: '🔵', color: '#8899AA',
    },
    {
        id: 'lead', symbol: 'PB', name_ar: 'الرصاص', name_en: 'Lead',
        atomic_num: 82, category: 'industrial',
        price_usd_ton: 1960, price_usd_kg: 1.96, price_sar_kg: +(1.96 * USD_SAR).toFixed(2),
        annual_supply_tons: 12_000_000, world_stock_tons: null,
        uses: ['بطاريات السيارات (٨٥%)', 'ذخائر', 'حماية الإشعاع'],
        top_producers: [
            { country: 'الصين', pct: '42%' }, { country: 'أستراليا', pct: '9%' },
        ],
        source: 'LME', icon: '⬛', color: '#555560',
    },
    {
        id: 'nickel', symbol: 'NI', name_ar: 'النيكل', name_en: 'Nickel',
        atomic_num: 28, category: 'industrial',
        price_usd_ton: 16800, price_usd_kg: 16.80, price_sar_kg: +(16.80 * USD_SAR).toFixed(2),
        annual_supply_tons: 3_300_000, world_stock_tons: 300_000_000,
        uses: ['فولاذ مقاوم (٦٥%)', 'بطاريات كهربائية', 'طلاء', 'عملات'],
        top_producers: [
            { country: 'إندونيسيا', pct: '35%' }, { country: 'الفلبين', pct: '14%' },
            { country: 'روسيا', pct: '10%' },      { country: 'كندا', pct: '6%' },
        ],
        source: 'LME', icon: '🔘', color: '#9999AA',
    },
    {
        id: 'tin', symbol: 'SN', name_ar: 'القصدير', name_en: 'Tin',
        atomic_num: 50, category: 'industrial',
        price_usd_ton: 28900, price_usd_kg: 28.90, price_sar_kg: +(28.90 * USD_SAR).toFixed(2),
        annual_supply_tons: 380_000, world_stock_tons: null,
        uses: ['لحام الإلكترونيات (٥٠%)', 'علب الصفيح', 'طلاء'],
        top_producers: [
            { country: 'الصين', pct: '40%' }, { country: 'إندونيسيا', pct: '20%' },
        ],
        source: 'LME', icon: '🟡', color: '#CCCC88',
    },
    {
        id: 'cobalt', symbol: 'CO', name_ar: 'الكوبالت', name_en: 'Cobalt',
        atomic_num: 27, category: 'industrial',
        price_usd_ton: 26000, price_usd_kg: 26.00, price_sar_kg: +(26.00 * USD_SAR).toFixed(2),
        annual_supply_tons: 210_000, world_stock_tons: 7_600_000,
        uses: ['بطاريات الليثيوم (٤٠%)', 'أقراص صلبة', 'صلب فائق', 'طائرات'],
        top_producers: [
            { country: 'الكونغو', pct: '73%' }, { country: 'إندونيسيا', pct: '5%' },
        ],
        source: 'MB Cobalt', icon: '🔷', color: '#4488CC',
    },
    {
        id: 'titanium', symbol: 'TI', name_ar: 'التيتانيوم', name_en: 'Titanium',
        atomic_num: 22, category: 'industrial',
        price_usd_ton: 11000, price_usd_kg: 11.00, price_sar_kg: +(11.00 * USD_SAR).toFixed(2),
        annual_supply_tons: 220_000, world_stock_tons: null,
        uses: ['طائرات (٥٠%)', 'صواريخ', 'أجهزة طبية (عظام صناعية)', 'سفن حرب'],
        islamic_use: 'من أقوى معادن كوكب الأرض — يُستخدم في الصناعات الدفاعية',
        top_producers: [
            { country: 'الصين', pct: '40%' }, { country: 'روسيا', pct: '18%' },
            { country: 'أستراليا', pct: '17%' },
        ],
        source: 'Metalary', icon: '⚪', color: '#D0D8E0',
    },
    {
        id: 'manganese', symbol: 'MN', name_ar: 'المنغنيز', name_en: 'Manganese',
        atomic_num: 25, category: 'industrial',
        price_usd_ton: 1100, price_usd_kg: 1.10, price_sar_kg: +(1.10 * USD_SAR).toFixed(2),
        annual_supply_tons: 20_000_000, world_stock_tons: null,
        uses: ['الفولاذ (٩٠%)', 'بطاريات', 'صبغات', 'أسمدة'],
        top_producers: [
            { country: 'جنوب أفريقيا', pct: '35%' }, { country: 'أستراليا', pct: '17%' },
        ],
        source: 'CRU', icon: '🟣', color: '#7766AA',
    },
    {
        id: 'molybdenum', symbol: 'MO', name_ar: 'الموليبدينوم', name_en: 'Molybdenum',
        atomic_num: 42, category: 'industrial',
        price_usd_ton: 27000, price_usd_kg: 27.00, price_sar_kg: +(27.00 * USD_SAR).toFixed(2),
        annual_supply_tons: 300_000, world_stock_tons: null,
        uses: ['تقوية الفولاذ', 'أنابيب النفط', 'محركات طائرات', 'أوعية ضغط'],
        top_producers: [
            { country: 'الصين', pct: '46%' }, { country: 'تشيلي', pct: '20%' },
        ],
        source: 'LME', icon: '🔲', color: '#888880',
    },
    {
        id: 'tungsten', symbol: 'W', name_ar: 'التنغستن (الولفرام)', name_en: 'Tungsten',
        atomic_num: 74, category: 'industrial',
        price_usd_ton: 32500, price_usd_kg: 32.50, price_sar_kg: +(32.50 * USD_SAR).toFixed(2),
        annual_supply_tons: 84_000, world_stock_tons: null,
        uses: ['خيوط المصابيح', 'قطع الأدوات', 'أسلحة', 'أقطاب اللحام'],
        top_producers: [
            { country: 'الصين', pct: '82%' }, { country: 'فيتنام', pct: '5%' },
        ],
        source: 'AMG + ITIA', icon: '⬛', color: '#666644',
    },
    {
        id: 'chromium', symbol: 'CR', name_ar: 'الكروم', name_en: 'Chromium',
        atomic_num: 24, category: 'industrial',
        price_usd_ton: 7800, price_usd_kg: 7.80, price_sar_kg: +(7.80 * USD_SAR).toFixed(2),
        annual_supply_tons: 41_000_000, world_stock_tons: null,
        uses: ['فولاذ مقاوم للصدأ (٦٦%)', 'طلاء كروم', 'حراري', 'سبائك'],
        top_producers: [
            { country: 'كازاخستان', pct: '40%' }, { country: 'جنوب أفريقيا', pct: '35%' },
        ],
        source: 'CRU', icon: '🔶', color: '#CC8844',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٣. المعادن النادرة (REE + Critical) — Rare Earth & Critical Minerals
// ══════════════════════════════════════════════════════════════════════════════
const RARE_EARTH_METALS = [
    {
        id: 'lithium',    symbol:'LI',  name_ar:'الليثيوم',   name_en:'Lithium',
        atomic_num:3,     category:'rare_critical',
        price_usd_ton:15000, price_usd_kg:15.00, price_sar_kg:+(15.00*USD_SAR).toFixed(2),
        annual_supply_tons:180_000, world_reserves_tons:98_000_000,
        uses:['بطاريات السيارات الكهربائية (٧٥%)', 'هواتف', 'أجهزة لوحية', 'مساعدة نفسية'],
        top_producers:[{ country:'أستراليا', pct:'47%' },{ country:'تشيلي', pct:'26%' },{ country:'الصين', pct:'18%' }],
        strategic_value:'مادة المستقبل — ثورة الطاقة الكهربائية',
        source:'SMM + Benchmark', icon:'⚡', color:'#FFD700',
    },
    {
        id: 'neodymium', symbol:'ND', name_ar:'النيوديميوم',  name_en:'Neodymium',
        atomic_num:60, category:'rare_earth',
        price_usd_kg:90.00, price_sar_kg:+(90.00*USD_SAR).toFixed(2),
        annual_supply_tons:42_000, world_reserves_tons:8_000_000,
        uses:['مغناطيسات رياح', 'محركات سيارات كهربائية', 'سماعات', 'هارد ديسك'],
        top_producers:[{ country:'الصين', pct:'60%' },{ country:'أستراليا', pct:'12%' }],
        strategic_value:'أقوى مغناطيس دائم في الكون',
        source:'AMR', icon:'🔋', color:'#8866FF',
    },
    {
        id: 'cerium',    symbol:'CE', name_ar:'السيريوم',    name_en:'Cerium',
        atomic_num:58, category:'rare_earth',
        price_usd_kg:4.50, price_sar_kg:+(4.50*USD_SAR).toFixed(2),
        annual_supply_tons:60_000, world_reserves_tons:95_000_000,
        uses:['صقل الزجاج', 'محولات حفازة', 'طلاء خزفي', 'ضوء LED'],
        top_producers:[{ country:'الصين', pct:'70%' }],
        source:'AMR', icon:'🟨', color:'#FFEE88',
    },
    {
        id: 'lanthanum', symbol:'LA', name_ar:'اللانثانوم',   name_en:'Lanthanum',
        atomic_num:57, category:'rare_earth',
        price_usd_kg:5.00, price_sar_kg:+(5.00*USD_SAR).toFixed(2),
        annual_supply_tons:44_000, world_reserves_tons:37_000_000,
        uses:['بطاريات هايبريد', 'عدسات بصرية', 'محطات ضوئية'],
        top_producers:[{ country:'الصين', pct:'65%' }],
        source:'AMR', icon:'🔆', color:'#FFCC44',
    },
    {
        id: 'dysprosium',symbol:'DY', name_ar:'الديسبروسيوم', name_en:'Dysprosium',
        atomic_num:66, category:'rare_earth',
        price_usd_kg:280.00, price_sar_kg:+(280.00*USD_SAR).toFixed(2),
        annual_supply_tons:2600, world_reserves_tons:1_000_000,
        uses:['تقوية مغناطيسات NdFeB في درجات الحرارة العالية', 'محركات طائرات'],
        top_producers:[{ country:'الصين', pct:'95%' }],
        strategic_value:'معدن بالغ الندرة — السيطرة: الصين فقط',
        source:'AMR', icon:'🔴', color:'#FF4444',
    },
    {
        id: 'praseodymium',symbol:'PR', name_ar:'البراسيوديميوم', name_en:'Praseodymium',
        atomic_num:59, category:'rare_earth',
        price_usd_kg:78.00, price_sar_kg:+(78.00*USD_SAR).toFixed(2),
        annual_supply_tons:6400, world_reserves_tons:8_000_000,
        uses:['مغناطيسات', 'لهب خضراء', 'عدسات'],
        top_producers:[{ country:'الصين', pct:'65%' }],
        source:'AMR', icon:'🟩', color:'#44BB44',
    },
    {
        id: 'terbium',   symbol:'TB', name_ar:'التيربيوم',   name_en:'Terbium',
        atomic_num:65, category:'rare_earth',
        price_usd_kg:1150.00, price_sar_kg:+(1150.00*USD_SAR).toFixed(2),
        annual_supply_tons:650, world_reserves_tons:300_000,
        uses:['شاشات ملونة', 'ليزر أخضر', 'أجهزة سونار'],
        top_producers:[{ country:'الصين', pct:'90%' }],
        strategic_value:'بالغ الندرة والقيمة الاستراتيجية',
        source:'AMR', icon:'🟢', color:'#66CC66',
    },
    {
        id: 'scandium',  symbol:'SC', name_ar:'السكانديوم',  name_en:'Scandium',
        atomic_num:21, category:'rare_earth',
        price_usd_kg:3800.00, price_sar_kg:+(3800.00*USD_SAR).toFixed(2),
        annual_supply_tons:35, world_reserves_tons:null,
        uses:['سبائك الألومنيوم للطائرات', 'محركات أوكسيد الصلب'],
        top_producers:[{ country:'الصين', pct:'65%' }],
        strategic_value:'من أغلى المعادن العملية في العالم',
        source:'GeoMega', icon:'✨', color:'#AADDFF',
    },
    {
        id: 'indium',    symbol:'IN', name_ar:'الإنديوم',     name_en:'Indium',
        atomic_num:49, category:'rare_critical',
        price_usd_kg:175.00, price_sar_kg:+(175.00*USD_SAR).toFixed(2),
        annual_supply_tons:900, world_reserves_tons:16_000,
        uses:['شاشات ITO الشفافة', 'ألواح شمسية', 'ليزر', 'شاشات OLED'],
        top_producers:[{ country:'الصين', pct:'58%' }],
        source:'USGS', icon:'📱', color:'#88AAFF',
    },
    {
        id: 'gallium',   symbol:'GA', name_ar:'الغاليوم',     name_en:'Gallium',
        atomic_num:31, category:'rare_critical',
        price_usd_kg:310.00, price_sar_kg:+(310.00*USD_SAR).toFixed(2),
        annual_supply_tons:480, world_reserves_tons:null,
        uses:['رقائق GaAs للاتصالات', 'ليد LED', 'ألواح شمسية'],
        top_producers:[{ country:'الصين', pct:'98%' }],
        strategic_value:'الصين تسيطر على ٩٨٪ — حرب جيوسياسية',
        source:'USGS + Roskill', icon:'💡', color:'#FFAA00',
    },
    {
        id: 'germanium', symbol:'GE', name_ar:'الجرمانيوم',   name_en:'Germanium',
        atomic_num:32, category:'rare_critical',
        price_usd_kg:1550.00, price_sar_kg:+(1550.00*USD_SAR).toFixed(2),
        annual_supply_tons:180, world_reserves_tons:8000,
        uses:['ألياف بصرية', 'نظارات الرؤية الليلية', 'رقائق شمسية فضائية'],
        top_producers:[{ country:'الصين', pct:'72%' }],
        strategic_value:'ممنوع تصديره من الصين منذ ٢٠٢٣',
        source:'USGS', icon:'🔭', color:'#AA8800',
    },
    {
        id: 'tellurium', symbol:'TE', name_ar:'التيلوريوم',   name_en:'Tellurium',
        atomic_num:52, category:'rare_critical',
        price_usd_kg:90.00, price_sar_kg:+(90.00*USD_SAR).toFixed(2),
        annual_supply_tons:500, world_reserves_tons:31_000,
        uses:['خلايا كادميوم تيلوريد الشمسية', 'قرص البلو-راي', 'صهر فولاذ'],
        top_producers:[{ country:'الصين', pct:'40%' }],
        source:'USGS', icon:'☀️', color:'#FFCC00',
    },
    {
        id: 'hafnium',   symbol:'HF', name_ar:'الهافنيوم',    name_en:'Hafnium',
        atomic_num:72, category:'rare_critical',
        price_usd_kg:1550.00, price_sar_kg:+(1550.00*USD_SAR).toFixed(2),
        annual_supply_tons:70, world_reserves_tons:null,
        uses:['قضبان التحكم في المفاعلات النووية', 'محركات نفاثة'],
        top_producers:[{ country:'فرنسا', pct: '30%' },{ country:'الولايات المتحدة', pct:'25%' }],
        source:'USGS', icon:'⚛️', color:'#4488AA',
    },
    {
        id: 'rhenium',   symbol:'RE', name_ar:'الرينيوم',     name_en:'Rhenium',
        atomic_num:75, category:'rare_critical',
        price_usd_kg:3600.00, price_sar_kg:+(3600.00*USD_SAR).toFixed(2),
        annual_supply_tons:55, world_reserves_tons:2500,
        uses:['شفرات توربين الطائرات', 'محفزات تكرير النفط', 'أسلاك الأفران'],
        top_producers:[{ country:'تشيلي', pct:'52%' },{ country:'الولايات المتحدة', pct:'9%' }],
        strategic_value:'من أندر المعادن وأغلاها — جوهر صناعة الطيران',
        source:'USGS', icon:'✈️', color:'#4466BB',
    },
    {
        id: 'beryllium', symbol:'BE', name_ar:'البيريليوم',   name_en:'Beryllium',
        atomic_num:4, category:'rare_critical',
        price_usd_kg:920.00, price_sar_kg:+(920.00*USD_SAR).toFixed(2),
        annual_supply_tons:260, world_reserves_tons:100_000,
        uses:['صواريخ وأقمار اصطناعية', 'نظارات الليزر', 'مفاعلات نووية'],
        top_producers:[{ country:'الولايات المتحدة', pct:'90%' }],
        source:'USGS', icon:'🚀', color:'#88BBEE',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٤. تسعير السكراب والخردة — Scrap Metal Prices
// ══════════════════════════════════════════════════════════════════════════════
const SCRAP_PRICES = [
    {
        id:'copper_scrap',     name_ar:'سكراب النحاس',          name_en:'Copper Scrap',
        grade_ar:'درجة أولى (Bare Bright)',
        price_usd_ton:8950,    price_usd_kg:8.95,  price_sar_kg:+(8.95*USD_SAR).toFixed(2),
        pct_of_lme: 91,
        types: ['Bare Bright','No.1 Copper','No.2 Copper','Birch','Light Copper'],
        note:'أعلى سكراب قيمة بعد الذهب والفضة',
        icon:'🟤',
    },
    {
        id:'copper_scrap_2',   name_ar:'سكراب النحاس درجة ثانية',name_en:'Copper Scrap #2',
        grade_ar:'درجة ثانية (No.2)',
        price_usd_ton:8100,    price_usd_kg:8.10,  price_sar_kg:+(8.10*USD_SAR).toFixed(2),
        pct_of_lme: 82, icon:'🟤',
    },
    {
        id:'aluminum_scrap',   name_ar:'سكراب الألومنيوم',       name_en:'Aluminum Scrap',
        grade_ar:'درجة أولى (Old Sheet)',
        price_usd_ton:1920,    price_usd_kg:1.92,  price_sar_kg:+(1.92*USD_SAR).toFixed(2),
        pct_of_lme: 77,
        types:['Old Sheet','Cast','Turnings','Clips','EC Wire'],
        note:'ثاني أكثر سكراب تداولاً في العالم',
        icon:'⬜',
    },
    {
        id:'steel_scrap',      name_ar:'سكراب الحديد والفولاذ',  name_en:'Steel Scrap',
        grade_ar:'HMS 1&2',
        price_usd_ton:380,     price_usd_kg:0.38,  price_sar_kg:+(0.38*USD_SAR).toFixed(2),
        pct_of_lme: 78,
        types:['HMS 1','HMS 2','Shredded','Busheling','Turnings'],
        note:'الأكثر حجماً — أساس صناعة فولاذ EAF',
        icon:'⚙️',
    },
    {
        id:'stainless_scrap',  name_ar:'سكراب الإنوكس (304)',     name_en:'Stainless Scrap 304',
        grade_ar:'درجة ٣٠٤',
        price_usd_ton:1450,    price_usd_kg:1.45,  price_sar_kg:+(1.45*USD_SAR).toFixed(2),
        pct_of_lme: 92, icon:'🔩',
    },
    {
        id:'brass_scrap',      name_ar:'سكراب النحاس الأصفر',     name_en:'Brass Scrap',
        grade_ar:'Yellow Brass',
        price_usd_ton:4150,    price_usd_kg:4.15,  price_sar_kg:+(4.15*USD_SAR).toFixed(2),
        pct_of_lme: 85,
        types:['Yellow Brass','Red Brass','Radiators','Cartridge'],
        icon:'🟡',
    },
    {
        id:'lead_scrap',       name_ar:'سكراب الرصاص',            name_en:'Lead Scrap',
        grade_ar:'Soft Lead',
        price_usd_ton:1680,    price_usd_kg:1.68,  price_sar_kg:+(1.68*USD_SAR).toFixed(2),
        pct_of_lme: 86, types:['Soft Lead','Battery Plates','Wheel Weights'], icon:'⬛',
    },
    {
        id:'zinc_scrap',       name_ar:'سكراب الزنك',              name_en:'Zinc Scrap',
        grade_ar:'New Zinc',
        price_usd_ton:2490,    price_usd_kg:2.49,  price_sar_kg:+(2.49*USD_SAR).toFixed(2),
        pct_of_lme: 90, icon:'🔵',
    },
    {
        id:'nickel_scrap',     name_ar:'سكراب النيكل',             name_en:'Nickel Scrap',
        grade_ar:'304 Clip',
        price_usd_ton:14500,   price_usd_kg:14.50, price_sar_kg:+(14.50*USD_SAR).toFixed(2),
        pct_of_lme: 86, icon:'🔘',
    },
    {
        id:'gold_scrap',       name_ar:'سكراب الذهب (خردة)',       name_en:'Gold Scrap',
        grade_ar:'9K–22K mixed',
        price_usd_ton:null,    price_usd_gram:100.00, price_sar_gram:+(100.00*USD_SAR).toFixed(2),
        pct_of_lme: 95,
        note:'يُحسب حسب العيار الفعلي — يُختبر بالخضوع',
        icon:'🥇',
    },
    {
        id:'silver_scrap',     name_ar:'سكراب الفضة',              name_en:'Silver Scrap',
        grade_ar:'Sterling 925',
        price_usd_gram:1.15,   price_sar_gram:+(1.15*USD_SAR).toFixed(2),
        price_usd_ton:1150000, pct_of_lme: 92, icon:'🥈',
    },
    {
        id:'e_waste_copper',   name_ar:'سكراب إلكتروني (كمبيوتر)', name_en:'E-Waste Computer',
        grade_ar:'Mixed board',
        price_usd_ton:800,     price_usd_kg:0.80,  price_sar_kg:+(0.80*USD_SAR).toFixed(2),
        note:'يحتوي على ذهب وفضة وبلاتين — يُستخرج بالصهر',
        icon:'💻',
    },
    {
        id:'car_battery_scrap',name_ar:'بطاريات السيارات (سكراب)',  name_en:'Lead-Acid Battery Scrap',
        grade_ar:'Whole Battery',
        price_usd_ton:305,     price_usd_kg:0.305, price_sar_kg:+(0.305*USD_SAR).toFixed(2),
        pct_of_lme: 86, icon:'🔋',
    },
    {
        id:'cat_converter',    name_ar:'محول الحفاز (سيارة)',        name_en:'Catalytic Converter Scrap',
        grade_ar:'Average Grade',
        price_usd_unit:220,    price_usd_kg:null,  price_sar_unit:+(220*USD_SAR).toFixed(0),
        note:'يحتوي بلاتين + بلاديوم + روديوم',
        icon:'🚗',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٥. خوارزمية التحليل — تحليل كل معدن بالدينار والدرهم
// ══════════════════════════════════════════════════════════════════════════════
function analyzeMetalByDinar(metal) {
    const dinarUSD = DINAR_USD;
    const result = { id: metal.id, name_ar: metal.name_ar, category: metal.category };

    // السعر بالدولار لكل كجم
    let priceKgUSD = metal.price_usd_kg || (metal.price_usd_gram ? metal.price_usd_gram * 1000 : null);
    if (!priceKgUSD && metal.price_usd_oz) priceKgUSD = (metal.price_usd_oz / TROY_OZ_G) * 1000;
    if (!priceKgUSD && metal.price_usd_ton) priceKgUSD = metal.price_usd_ton / 1000;

    if (priceKgUSD) {
        result.price_usd_kg      = +priceKgUSD.toFixed(4);
        result.price_sar_kg      = +(priceKgUSD * USD_SAR).toFixed(4);
        result.kg_per_dinar      = +(dinarUSD / priceKgUSD).toFixed(4);
        result.dinars_per_kg     = +(priceKgUSD / dinarUSD).toFixed(6);
        result.gram_per_dinar    = +(dinarUSD / priceKgUSD * 1000).toFixed(2);
        result.dinar_per_100g    = +(priceKgUSD / dinarUSD * 0.1).toFixed(6);

        // تصنيف القيمة
        if      (priceKgUSD > 30000) result.value_class = 'ثمين جداً';
        else if (priceKgUSD > 5000)  result.value_class = 'ثمين';
        else if (priceKgUSD > 500)   result.value_class = 'عالي القيمة';
        else if (priceKgUSD > 50)    result.value_class = 'متوسط';
        else if (priceKgUSD > 5)     result.value_class = 'صناعي';
        else                           result.value_class = 'خام';
    }

    result.verse      = metal.verse || '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾';
    result.uses       = metal.uses;
    result.icon       = metal.icon;
    result.color      = metal.color;
    return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ٦. الجدول الكوني الشامل — كل المعادن مرتبة بالقيمة
// ══════════════════════════════════════════════════════════════════════════════
function getUniversalMetalsTable() {
    const all = [...PRECIOUS_METALS, ...INDUSTRIAL_METALS, ...RARE_EARTH_METALS].map(m => analyzeMetalByDinar(m));
    return all.sort((a, b) => (b.price_usd_kg || 0) - (a.price_usd_kg || 0));
}

// ══════════════════════════════════════════════════════════════════════════════
// ٧. أقوى المعادن الاستراتيجية — Strategic Ranking
// ══════════════════════════════════════════════════════════════════════════════
const STRATEGIC_RANKING = [
    { rank:1,  id:'rhodium',     reason:'أغلى معدن مُعدَّن تجارياً — محولات المحفز' },
    { rank:2,  id:'iridium',     reason:'أندر وأكثف معدن على الأرض' },
    { rank:3,  id:'scandium',    reason:'أغلى المعادن العملية — طيران + طاقة' },
    { rank:4,  id:'rhenium',     reason:'أندر معدن ثابت — قلب محركات الطائرات' },
    { rank:5,  id:'terbium',     reason:'بالغ الندرة — شاشات مستقبل + دفاع' },
    { rank:6,  id:'gold',        reason:'ركيزة الدينار الإسلامي — المعيار الأبدي' },
    { rank:7,  id:'germanium',   reason:'ممنوع التصدير — ألياف بصرية + تجسس' },
    { rank:8,  id:'gallium',     reason:'رقائق الجيل الخامس — الصين تسيطر ٩٨٪' },
    { rank:9,  id:'dysprosium',  reason:'مغناطيسات الطاقة الخضراء — الصين ٩٥٪' },
    { rank:10, id:'lithium',     reason:'نفط القرن ٢١ — بطاريات الثورة الكهربائية' },
    { rank:11, id:'palladium',   reason:'محولات المحفز — بديل البلاتين' },
    { rank:12, id:'platinum',    reason:'هيدروجين + طاقة + مجوهرات' },
    { rank:13, id:'silver',      reason:'الدرهم الإسلامي — مقلل ٨٤٠٪ تاريخياً' },
    { rank:14, id:'cobalt',      reason:'قلب بطاريات الكهرباء — الكونغو ٧٣٪' },
    { rank:15, id:'nickel',      reason:'فولاذ المستقبل + بطاريات EV' },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٨. الناتج الشرعي — قيمة المعادن بالدينار والدرهم
// ══════════════════════════════════════════════════════════════════════════════
function getShariaMetalsValues() {
    const goldGramUSD   = 3287.50 / TROY_OZ_G;
    const silverGramUSD = 38.95   / TROY_OZ_G;
    return {
        verse:    '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ وَلِيَعْلَمَ اللَّهُ مَن يَنصُرُهُ وَرُسُلَهُ بِالْغَيْبِ﴾ — الحديد ٢٥',
        hadith:   '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
        dinar_usd: +DINAR_USD.toFixed(4),
        dirham_usd: +(silverGramUSD * 2.975).toFixed(4),
        gold_gram_usd: +goldGramUSD.toFixed(2),
        silver_gram_usd: +silverGramUSD.toFixed(4),
        gold_silver_ratio: +(goldGramUSD / silverGramUSD).toFixed(2),
        copper_vs_gold_ratio: +((3287.50/TROY_OZ_G) / (9850/1000)).toFixed(2),
        iron_vs_gold_ratio:   +((3287.50/TROY_OZ_G) / (105/1000)).toFixed(1),
        islamic_note: 'الدينار والدرهم هما المعياران الشرعيان — باقي المعادن تُقاس بهما',
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ٩. تصدير
// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
    getPreciousMetals:        ()          => PRECIOUS_METALS,
    getIndustrialMetals:      ()          => INDUSTRIAL_METALS,
    getRareEarthMetals:       ()          => RARE_EARTH_METALS,
    getScrapPrices:           ()          => SCRAP_PRICES,
    getMetalById:             (id)        => {
        return [...PRECIOUS_METALS, ...INDUSTRIAL_METALS, ...RARE_EARTH_METALS]
               .find(m => m.id === id) || null;
    },
    analyzeMetalByDinar,
    getUniversalMetalsTable,
    getStrategicRanking:      ()          => STRATEGIC_RANKING,
    getShariaMetalsValues,
    getMetalsStats:           ()          => ({
        total_metals:        PRECIOUS_METALS.length + INDUSTRIAL_METALS.length + RARE_EARTH_METALS.length,
        precious_count:      PRECIOUS_METALS.length,
        industrial_count:    INDUSTRIAL_METALS.length,
        rare_earth_count:    RARE_EARTH_METALS.length,
        scrap_types:         SCRAP_PRICES.length,
        base_date:           METALS_BASE_DATE,
        dinar_usd:           +DINAR_USD.toFixed(4),
        verse:               '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾',
    }),
};
