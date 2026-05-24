/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة — شبكات المعادن العالمية + الإنتاج والعرض والطلب + الخريطة التفاعلية
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات ١٣
 * "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ" — التعارف أساس التجارة
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const METALS_NETWORKS = {

    islamicFoundation: {
        verses: [
            { ref: 'الحجرات:13', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', application: 'الشبكات التجارية = تعارف الشعوب — أساس قرآني' },
            { ref: 'قريش:1-4', text: 'لِإِيلَافِ قُرَيْشٍ ۝ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ', application: 'أقدم شبكة تجارية مذكورة في القرآن — رحلة الشتاء (اليمن) والصيف (الشام)' },
            { ref: 'النساء:29', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', application: 'التراضي أساس كل عقد — لا إكراه في الشبكات' },
            { ref: 'البقرة:282', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ', application: 'توثيق كل عقد وصفقة في الشبكة — أمر إلهي' }
        ],
        hadith: [
            { text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء', source: 'الترمذي', application: 'الصدق في الشبكات التجارية = منزلة عظيمة' },
            { text: 'رحم الله رجلاً سمحاً إذا باع وإذا اشترى وإذا اقتضى', source: 'البخاري', application: 'السماحة في التعامل = جذب الشبكات بالإقناع والتراضي' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════
    // الإنتاج والعرض والطلب — كل المعادن — كل المناطق
    // ═══════════════════════════════════════════════════════════════

    supplyDemand: {
        gold: {
            nameAr: 'ذهب', symbol: 'Au', unit: 'طن/سنة', price2025: '~$93,000/كجم (~$2,900/أونصة)',
            global: { production: 3300, demand: 4900, supply: 4800, recycled: 1200, deficit: 100, reserves: 59000, yearsLeft: '~18 سنة' },
            saudi: { production: 16, demand: 180, imports: 164, reserves: 658, potential: 3300, mines: 5 },
            arabPeninsula: { production: 17, demand: 350, note: 'الإمارات مركز تكرير 75+ طن/سنة' },
            islamicWorld: { production: 636, share: '19%', topProducer: 'إندونيسيا 110 طن' },
            historicalProduction: [
                { era: 'عهد الرسول ﷺ', annual: '~0.5-2 طن', source: 'منجم مهد الذهب + غنائم', total: '~10-20 طن خلال 10 سنوات' },
                { era: 'الدولة الأموية', annual: '~5-15 طن', source: 'مناجم الحجاز + مصر + السودان' },
                { era: 'الدولة العباسية', annual: '~20-50 طن', source: 'أفريقيا + آسيا الوسطى + مناجم متعددة' },
                { era: '1900', annual: '~400 طن عالمياً' },
                { era: '1950', annual: '~1,000 طن' },
                { era: '2000', annual: '~2,600 طن' },
                { era: '2024', annual: '~3,300 طن' }
            ]
        },
        silver: {
            nameAr: 'فضة', symbol: 'Ag', unit: 'طن/سنة', price2025: '~$1,060/كجم (~$33/أونصة)',
            global: { production: 26000, demand: 32000, supply: 31500, recycled: 5500, deficit: 500, reserves: 550000 },
            saudi: { production: 12, demand: 50, note: 'مُنتج ثانوي من مناجم الذهب والنحاس' },
            islamicWorld: { production: 2250, topProducer: 'كازاخستان 1,100 طن' },
            historicalProduction: [
                { era: 'عهد الرسول ﷺ', annual: '~1-5 طن', source: 'دراهم فارسية + مناجم اليمن', note: 'الدرهم الفضي = العملة الأساسية' },
                { era: 'الدولة العباسية', annual: '~100-300 طن', source: 'بنجشير (أفغانستان) — أكبر منجم فضة' },
                { era: '2024', annual: '~26,000 طن' }
            ]
        },
        iron: {
            nameAr: 'حديد وفولاذ', symbol: 'Fe', unit: 'مليون طن/سنة', price2025: 'خام: ~$100/طن | تسليح: ~$600/طن | HRC: ~$650/طن',
            global: { oreProduction: 2500, steelProduction: 1900, demand: 1850, scrapUsed: 600, reserves: '180,000 مليون طن' },
            saudi: { steelProduction: 9, demand: 14, imports: 5, scrapUsed: 5, companies: 6, eafShare: '100%' },
            arabPeninsula: { steelProduction: 19, demand: 25, countries: { uae: 3.5, bahrain: 1.5, oman: 2, qatar: 2.5, kuwait: 0.5 } },
            islamicWorld: { steelProduction: 150, share: '8%', topProducer: 'تركيا 35 مليون طن' },
            historicalProduction: [
                { era: 'عهد الرسول ﷺ', annual: '~50-200 طن', source: 'حدادو المدينة + صهر غنائم', note: 'سيوف + دروع + أدوات زراعية' },
                { era: 'الدولة الأموية', annual: '~2,000-5,000 طن', source: 'الفولاذ الدمشقي + مناجم الأندلس' },
                { era: 'الدولة العباسية', annual: '~10,000-50,000 طن', source: 'بغداد + خراسان + مصر' },
                { era: '1900', annual: '~40 مليون طن فولاذ' },
                { era: '1950', annual: '~200 مليون طن' },
                { era: '2000', annual: '~850 مليون طن' },
                { era: '2024', annual: '~1,900 مليون طن' }
            ]
        },
        copper: {
            nameAr: 'نحاس', symbol: 'Cu', unit: 'ألف طن/سنة', price2025: '~$9,500/طن',
            global: { production: 22000, demand: 26000, supply: 25500, recycled: 4500, deficit: 500, reserves: 870000 },
            saudi: { production: 45, demand: 200, imports: 155, mines: 1, potential: 'كبير — الدرع العربي' },
            arabPeninsula: { production: 85, demand: 400, oman: { production: 40, history: 'مجان — مصدر نحاس العالم القديم' } },
            islamicWorld: { production: 1900, share: '9%', topProducer: 'إندونيسيا 800,000 طن' },
            historicalProduction: [
                { era: 'سليمان عليه السلام', annual: 'عين القطر — نحاس مصهور بمعجزة', source: 'سبأ:12' },
                { era: 'عهد الرسول ﷺ', annual: '~20-100 طن', source: 'عُمان (مجان) + اليمن', note: 'أواني + سلاح + نقود' },
                { era: '2024', annual: '~22,000 ألف طن' }
            ]
        },
        aluminum: {
            nameAr: 'ألمنيوم', symbol: 'Al', unit: 'ألف طن/سنة', price2025: '~$2,600/طن',
            global: { production: 70000, demand: 69000, supply: 70000, recycled: 15000, surplus: 1000, reserves: '30,000,000 (بوكسايت)' },
            saudi: { production: 740, demand: 500, exports: 240, company: 'معادن', rank: '6 عالمياً (مصهر)' },
            arabPeninsula: { production: 6100, share: '8.7% عالمياً', uae: 2700, bahrain: 1600, qatar: 650, oman: 400 },
            islamicWorld: { production: 6700, share: '9.6%', topProducer: 'الإمارات 2,700 ألف طن', note: 'غينيا تملك أكبر احتياطي بوكسايت (7.4 مليار طن)' },
            historicalProduction: [
                { era: 'قبل 1886', note: 'الألمنيوم لم يكن معروفاً — كان أغلى من الذهب!' },
                { era: '1900', annual: '~8 ألف طن' },
                { era: '1950', annual: '~2,000 ألف طن' },
                { era: '2000', annual: '~25,000 ألف طن' },
                { era: '2024', annual: '~70,000 ألف طن' }
            ]
        },
        nickel: {
            nameAr: 'نيكل', symbol: 'Ni', unit: 'ألف طن/سنة', price2025: '~$16,000/طن',
            global: { production: 3300, demand: 3200, reserves: 100000 },
            islamicWorld: { production: 1830, share: '55%!', topProducer: 'إندونيسيا 1,800 ألف طن — المهيمن عالمياً' }
        },
        platinum: {
            nameAr: 'بلاتين', symbol: 'Pt', unit: 'طن/سنة', price2025: '~$34,000/كجم',
            global: { production: 190, demand: 240, deficit: 50, reserves: 69000, note: 'عجز مستمر منذ 2020' }
        },
        lithium: {
            nameAr: 'ليثيوم', symbol: 'Li', unit: 'ألف طن LCE/سنة', price2025: '~$12,000/طن',
            global: { production: 180, demand: 200, deficit: 20, reserves: 28000, note: 'البترول الأبيض — بطاريات السيارات الكهربائية' },
            islamicWorld: { potential: 'أفغانستان تملك احتياطي ضخم غير مستغل' }
        },
        scrap: {
            nameAr: 'سكراب (كل الأنواع)', unit: 'مليون طن/سنة',
            global: { ironScrap: 700, alScrap: 30, cuScrap: 10, eWaste: 62, totalValue: '~$700 مليار/سنة' },
            saudi: { ironScrap: 5, demand: 7, imports: 2.5, alScrap: 0.3, cuScrap: 0.1, eWaste: 0.4 },
            arabPeninsula: { ironScrap: 8, alScrap: 0.5, note: 'مصانع الخليج تستهلك أكثر مما تُنتج من السكراب' },
            islamicWorld: { ironScrapGeneration: 40, note: 'تركيا أكبر مستورد سكراب في العالم — 20 مليون طن/سنة' }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // شبكات الموردين والمصانع والأسواق — بيانات جغرافية
    // ═══════════════════════════════════════════════════════════════

    networks: {

        // ══════════════ شبكة 1: مناجم الذهب ══════════════
        goldMines: {
            id: 'gold-mines',
            nameAr: 'شبكة مناجم الذهب العالمية',
            type: 'mining', metal: 'gold',
            color: '#FFD700',
            nodes: [
                { id: 'gm-sa-1', name: 'منجم الدويحي', nameEn: 'Ad Duwayhi', country: 'السعودية', city: 'مكة المكرمة', lat: 22.85, lng: 40.20, operator: 'معادن', production: '6 طن/سنة', reserves: '~200 طن', status: 'نشط', since: 2008 },
                { id: 'gm-sa-2', name: 'منجم مهد الذهب', nameEn: 'Mahd Ad Dhahab', country: 'السعودية', city: 'المدينة المنورة', lat: 23.49, lng: 40.86, operator: 'معادن', production: '4 طن/سنة', history: 'أقدم منجم — 3000+ سنة — يُعتقد أنه منجم سليمان ﷺ', status: 'نشط' },
                { id: 'gm-sa-3', name: 'منجم بلغة', nameEn: 'Bulghah', country: 'السعودية', city: 'المدينة المنورة', lat: 24.04, lng: 40.04, operator: 'معادن', production: '2 طن/سنة', status: 'نشط' },
                { id: 'gm-sa-4', name: 'منجم الصخيبرات', nameEn: 'As Sukhaybirat', country: 'السعودية', city: 'القصيم', lat: 25.62, lng: 42.32, operator: 'معادن', production: '2 طن/سنة', status: 'نشط' },
                { id: 'gm-sa-5', name: 'منجم منصورة-مسرة', nameEn: 'Mansourah-Massarah', country: 'السعودية', city: 'المدينة المنورة', lat: 22.50, lng: 40.10, operator: 'معادن', production: '2 طن/سنة', since: 2024, status: 'جديد' },
                { id: 'gm-id-1', name: 'منجم جراسبرج', nameEn: 'Grasberg', country: 'إندونيسيا', city: 'بابوا', lat: -4.05, lng: 137.11, operator: 'Freeport / MIND ID', production: '25 طن ذهب + 350,000 طن نحاس/سنة', note: 'أكبر منجم ذهب ونحاس في العالم', status: 'نشط' },
                { id: 'gm-uz-1', name: 'منجم مورونتاو', nameEn: 'Muruntau', country: 'أوزبكستان', city: 'نافوي', lat: 41.55, lng: 64.57, operator: 'Navoi Mining', production: '60 طن/سنة', note: 'أكبر منجم مكشوف في العالم', status: 'نشط' },
                { id: 'gm-eg-1', name: 'منجم السكري', nameEn: 'Sukari', country: 'مصر', city: 'مرسى علم', lat: 24.95, lng: 33.78, operator: 'Centamin', production: '15 طن/سنة', status: 'نشط' },
                { id: 'gm-sd-1', name: 'حزام الذهب السوداني', nameEn: 'Sudan Gold Belt', country: 'السودان', city: 'البحر الأحمر/شمال دارفور', lat: 18.0, lng: 33.5, production: '50-80 طن/سنة', note: 'تعدين أهلي واسع', status: 'نشط' },
                { id: 'gm-ml-1', name: 'مناجم مالي', nameEn: 'Mali Gold Belt', country: 'مالي', city: 'بماكو/كايس', lat: 12.6, lng: -8.0, production: '70 طن/سنة', status: 'نشط' },
                { id: 'gm-au-1', name: 'Super Pit + Boddington', nameEn: 'Kalgoorlie/Boddington', country: 'أستراليا', city: 'غرب أستراليا', lat: -30.78, lng: 121.48, production: '310 طن/سنة (كل أستراليا)', status: 'نشط' },
                { id: 'gm-ru-1', name: 'مناجم سيبيريا', nameEn: 'Siberian Gold Fields', country: 'روسيا', city: 'كراسنويارسك', lat: 56.01, lng: 92.87, production: '310 طن/سنة (كل روسيا)', status: 'نشط' },
                { id: 'gm-cn-1', name: 'مناجم شاندونغ', nameEn: 'Shandong Gold Belt', country: 'الصين', city: 'شاندونغ', lat: 36.67, lng: 117.0, production: '370 طن/سنة (كل الصين)', status: 'نشط' }
            ]
        },

        // ══════════════ شبكة 2: مصاهر الفولاذ ══════════════
        steelSmelters: {
            id: 'steel-smelters',
            nameAr: 'شبكة مصاهر الفولاذ',
            type: 'smelting', metal: 'iron',
            color: '#4A90D9',
            nodes: [
                { id: 'ss-sa-1', name: 'حديد سابك (HADEED)', country: 'السعودية', city: 'الجبيل', lat: 27.01, lng: 49.66, capacity: '6 مليون طن/سنة', type: 'DRI + EAF', scrap: '3 مليون طن/سنة', products: 'تسليح + مسطحات', employees: '~3,500', website: 'hadeed.com.sa' },
                { id: 'ss-sa-2', name: 'الراجحي للصلب', country: 'السعودية', city: 'الرياض', lat: 24.63, lng: 46.72, capacity: '1 مليون طن/سنة', type: 'EAF', products: 'تسليح', website: 'rajhisteel.com' },
                { id: 'ss-sa-3', name: 'الاتفاق للصلب', country: 'السعودية', city: 'الدمام', lat: 26.43, lng: 50.10, capacity: '1 مليون طن/سنة', type: 'EAF', products: 'تسليح' },
                { id: 'ss-sa-4', name: 'SULB حديد الجبيل', country: 'السعودية', city: 'الجبيل', lat: 27.02, lng: 49.68, capacity: '2 مليون طن/سنة', type: 'DRI + EAF', products: 'مسطحات + لفائف' },
                { id: 'ss-sa-5', name: 'حديد وطني', country: 'السعودية', city: 'جدة', lat: 21.49, lng: 39.19, capacity: '500,000 طن/سنة', type: 'EAF' },
                { id: 'ss-ae-1', name: 'إمارات ستيل (أركان)', country: 'الإمارات', city: 'أبوظبي', lat: 24.45, lng: 54.65, capacity: '3.5 مليون طن/سنة', type: 'DRI + EAF' },
                { id: 'ss-bh-1', name: 'SULB البحرين', country: 'البحرين', city: 'حد الصناعية', lat: 26.18, lng: 50.50, capacity: '1.5 مليون طن/سنة', products: 'مسطحات' },
                { id: 'ss-qa-1', name: 'قطر ستيل', country: 'قطر', city: 'مسيعيد', lat: 24.99, lng: 51.55, capacity: '2.5 مليون طن/سنة' },
                { id: 'ss-om-1', name: 'جندل للحديد', country: 'عمان', city: 'صحار', lat: 24.34, lng: 56.73, capacity: '1 مليون طن/سنة' },
                { id: 'ss-tr-1', name: 'مصانع تركيا (EAF)', country: 'تركيا', city: 'إسكندرون/إزمير', lat: 36.58, lng: 36.17, capacity: '35 مليون طن/سنة', note: 'أكبر مستورد سكراب عالمياً' },
                { id: 'ss-eg-1', name: 'حديد عز', country: 'مصر', city: 'السادات/السويس', lat: 30.37, lng: 30.53, capacity: '7 مليون طن/سنة', note: 'أكبر منتج فولاذ في أفريقيا' }
            ]
        },

        // ══════════════ شبكة 3: مصاهر الألمنيوم ══════════════
        aluminumSmelters: {
            id: 'aluminum-smelters',
            nameAr: 'شبكة مصاهر الألمنيوم',
            type: 'smelting', metal: 'aluminum',
            color: '#C0C0C0',
            nodes: [
                { id: 'as-sa-1', name: 'معادن ألمنيوم', country: 'السعودية', city: 'رأس الخير', lat: 27.49, lng: 49.26, capacity: '740,000 طن/سنة', partner: 'Alcoa', products: 'إنجوت + بيليت + سلاب + لفائف', employees: '~3,000', rank: '6 عالمياً' },
                { id: 'as-ae-1', name: 'إمارات غلوبال ألمنيوم (EGA)', country: 'الإمارات', city: 'جبل علي + الطويلة', lat: 24.98, lng: 55.02, capacity: '2,700,000 طن/سنة', rank: '5 عالمياً — أكبر منتج خارج الصين' },
                { id: 'as-bh-1', name: 'ألبا (Alba)', country: 'البحرين', city: 'عسكر', lat: 25.97, lng: 50.60, capacity: '1,600,000 طن/سنة', rank: 'أكبر مصهر بموقع واحد في العالم', since: 1971 },
                { id: 'as-qa-1', name: 'قطر ألمنيوم (Qatalum)', country: 'قطر', city: 'مسيعيد', lat: 24.99, lng: 51.56, capacity: '650,000 طن/سنة', partner: 'Hydro' },
                { id: 'as-om-1', name: 'صحار ألمنيوم', country: 'عمان', city: 'صحار', lat: 24.35, lng: 56.74, capacity: '400,000 طن/سنة' },
                { id: 'as-eg-1', name: 'مصر للألومنيوم (إيجيبت ألوم)', country: 'مصر', city: 'نجع حمادي', lat: 26.05, lng: 32.17, capacity: '350,000 طن/سنة' }
            ]
        },

        // ══════════════ شبكة 4: أسواق ومراكز تداول ══════════════
        tradingCenters: {
            id: 'trading-centers',
            nameAr: 'شبكة أسواق ومراكز التداول',
            type: 'market',
            color: '#D4AF37',
            nodes: [
                { id: 'tc-uk-1', name: 'بورصة لندن للمعادن (LME)', country: 'بريطانيا', city: 'لندن', lat: 51.51, lng: -0.08, metals: 'نحاس + ألمنيوم + زنك + نيكل + رصاص + قصدير', volume: '~$15 تريليون/سنة', note: 'أكبر بورصة معادن في العالم', website: 'lme.com' },
                { id: 'tc-us-1', name: 'COMEX / NYMEX', country: 'أمريكا', city: 'نيويورك', lat: 40.71, lng: -74.01, metals: 'ذهب + فضة + نحاس + بلاتين', volume: '~$5 تريليون/سنة', website: 'cmegroup.com' },
                { id: 'tc-cn-1', name: 'بورصة شنغهاي للعقود (SHFE)', country: 'الصين', city: 'شنغهاي', lat: 31.23, lng: 121.47, metals: 'كل المعادن + سكراب', note: 'ثاني أكبر بورصة معادن' },
                { id: 'tc-ae-1', name: 'بورصة دبي للذهب والسلع (DGCX)', country: 'الإمارات', city: 'دبي', lat: 25.20, lng: 55.27, metals: 'ذهب + فضة', note: 'أكبر بورصة معادن ثمينة في الشرق الأوسط' },
                { id: 'tc-ae-2', name: 'سوق الذهب — ديرة', country: 'الإمارات', city: 'دبي', lat: 25.27, lng: 55.30, note: 'أكبر سوق ذهب فيزيائي في العالم — ~300 متجر' },
                { id: 'tc-sa-1', name: 'تداول (Tadawul) — قطاع المواد', country: 'السعودية', city: 'الرياض', lat: 24.69, lng: 46.69, companies: 'معادن (1211) | سابك (2010) | SPC (1320)', website: 'tadawul.com.sa' },
                { id: 'tc-tr-1', name: 'بورصة إسطنبول للذهب', country: 'تركيا', city: 'إسطنبول', lat: 41.01, lng: 28.98, metals: 'ذهب + فضة', volume: '~500 طن ذهب/سنة' },
                { id: 'tc-in-1', name: 'MCX الهند', country: 'الهند', city: 'مومباي', lat: 19.08, lng: 72.88, metals: 'ذهب + فضة + نحاس', note: 'أكبر سوق ذهب استهلاكي' },
                { id: 'tc-uk-2', name: 'LBMA — سوق لندن للسبائك', country: 'بريطانيا', city: 'لندن', lat: 51.51, lng: -0.09, metals: 'ذهب + فضة', note: 'يحدد السعر المرجعي العالمي يومياً (London Fix)' }
            ]
        },

        // ══════════════ شبكة 5: ساحات السكراب — السعودية ══════════════
        scrapYardsSaudi: {
            id: 'scrap-yards-saudi',
            nameAr: 'شبكة ساحات السكراب — السعودية',
            type: 'scrap', metal: 'mixed',
            color: '#8B4513',
            nodes: [
                { id: 'sy-sa-1', name: 'ساحات سكراب الرياض', city: 'الرياض', lat: 24.63, lng: 46.72, areas: 'الصناعية الثانية + السلي + الخرج', yards: '200+', volume: '1.5 مليون طن/سنة', types: 'حديد + نحاس + ألمنيوم + إلكتروني' },
                { id: 'sy-sa-2', name: 'ساحات سكراب جدة', city: 'جدة', lat: 21.49, lng: 39.19, areas: 'المنطقة الصناعية + بريمان', yards: '150+', volume: '1 مليون طن/سنة' },
                { id: 'sy-sa-3', name: 'ساحات سكراب الدمام', city: 'الدمام/الجبيل', lat: 26.43, lng: 50.10, areas: 'المنطقة الصناعية', yards: '100+', volume: '1.2 مليون طن/سنة' },
                { id: 'sy-sa-4', name: 'ساحات سكراب مكة', city: 'مكة المكرمة', lat: 21.39, lng: 39.86, areas: 'الكعكية', yards: '50+' },
                { id: 'sy-sa-5', name: 'ساحات سكراب القصيم', city: 'بريدة', lat: 26.33, lng: 43.97, yards: '40+', note: 'مركز تجميع وسط السعودية' },
                { id: 'sy-sa-6', name: 'ساحات سكراب المدينة', city: 'المدينة المنورة', lat: 24.47, lng: 39.61, yards: '30+' }
            ]
        },

        // ══════════════ شبكة 6: موانئ التجارة ══════════════
        tradePorts: {
            id: 'trade-ports',
            nameAr: 'شبكة موانئ تجارة المعادن',
            type: 'logistics',
            color: '#1E90FF',
            nodes: [
                { id: 'tp-sa-1', name: 'ميناء جدة الإسلامي', country: 'السعودية', city: 'جدة', lat: 21.48, lng: 39.16, metalsTrade: 'تصدير سكراب + استيراد خام حديد', volume: '~5 مليون طن معادن/سنة', note: 'أكبر ميناء سعودي' },
                { id: 'tp-sa-2', name: 'ميناء الملك عبدالعزيز', country: 'السعودية', city: 'الدمام', lat: 26.47, lng: 50.18, metalsTrade: 'استيراد خام حديد + تصدير ألمنيوم', volume: '~8 مليون طن/سنة' },
                { id: 'tp-sa-3', name: 'ميناء الجبيل التجاري', country: 'السعودية', city: 'الجبيل', lat: 27.02, lng: 49.66, metalsTrade: 'استيراد خام حديد لسابك + DRI', volume: '~10 مليون طن/سنة', note: 'بجوار مصانع سابك ومعادن' },
                { id: 'tp-sa-4', name: 'ميناء رأس الخير', country: 'السعودية', city: 'رأس الخير', lat: 27.49, lng: 49.26, metalsTrade: 'تصدير ألمنيوم + استيراد بوكسايت', note: 'ميناء معادن الخاص' },
                { id: 'tp-ae-1', name: 'ميناء جبل علي', country: 'الإمارات', city: 'دبي', lat: 25.00, lng: 55.06, metalsTrade: 'كل المعادن — مركز إعادة تصدير', volume: '~15 مليون طن/سنة' },
                { id: 'tp-tr-1', name: 'ميناء إسكندرون', country: 'تركيا', city: 'هاتاي', lat: 36.58, lng: 36.16, metalsTrade: 'أكبر ميناء استيراد سكراب في العالم', volume: '~20 مليون طن سكراب/سنة' }
            ]
        },

        // ══════════════ شبكة 7: خطوط التجارة التاريخية ══════════════
        historicalRoutes: {
            id: 'historical-routes',
            nameAr: 'شبكة طرق التجارة التاريخية',
            type: 'historical',
            color: '#8B0000',
            nodes: [
                { id: 'hr-1', name: 'رحلة الشتاء — قريش', from: 'مكة', to: 'اليمن', lat: 21.39, lng: 39.86, metals: 'ذهب + فضة + بخور', ref: 'سورة قريش', era: 'قبل وبعد الإسلام' },
                { id: 'hr-2', name: 'رحلة الصيف — قريش', from: 'مكة', to: 'الشام', lat: 33.51, lng: 36.28, metals: 'نحاس + حديد + فولاذ دمشقي', ref: 'سورة قريش' },
                { id: 'hr-3', name: 'طريق الحرير', from: 'الصين', to: 'بغداد/دمشق', lat: 35.0, lng: 69.0, metals: 'حديد + نحاس + ذهب + فضة', era: 'العصر العباسي' },
                { id: 'hr-4', name: 'طريق البخور — نجران/مأرب/ظفار', from: 'ظفار', to: 'غزة', lat: 17.0, lng: 54.0, metals: 'ذهب + فضة + بخور + لبان', era: '3000 سنة' },
                { id: 'hr-5', name: 'طريق النحاس — عُمان (مجان)', from: 'صحار', to: 'بلاد الرافدين', lat: 24.35, lng: 56.73, metals: 'نحاس', era: '5000+ سنة', note: 'عُمان كانت "مجان" — مصدر نحاس العالم القديم' }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // توزيع المعلومات حسب الأهمية — أدمن / سوق / مستخدم
    // ═══════════════════════════════════════════════════════════════
    visibility: {
        admin: {
            label: 'لوحة الأدمن — كل المعلومات',
            visibleData: [
                'كل الشبكات بالتفصيل الكامل',
                'أسماء الشركات والمسؤولين وأرقام التواصل',
                'كميات الإنتاج والاستهلاك الدقيقة',
                'الأسعار الحقيقية + هوامش الربح',
                'تحليل الفجوات والفرص',
                'بيانات العقود والموردين',
                'الخريطة التفاعلية الكاملة بكل الطبقات',
                'التنبيهات والإنذارات',
                'التقارير التاريخية والتوقعات'
            ]
        },
        market: {
            label: 'السوق — معلومات تجارية',
            visibleData: [
                'أسعار المعادن اللحظية',
                'أنواع المنتجات المتاحة (HS Codes)',
                'الموردون المعتمدون (بدون تفاصيل داخلية)',
                'خريطة المصانع والموانئ',
                'العرض والطلب (ملخص)',
                'كتالوج المنتجات بالمواصفات',
                'نموذج طلب عرض سعر'
            ]
        },
        user: {
            label: 'المستخدم العادي — معلومات عامة',
            visibleData: [
                'أسعار المعادن الرئيسية (ذهب، فضة، حديد)',
                'حاسبة الزكاة (ذهب + فضة)',
                'معلومات ثقافية عن المعادن في القرآن',
                'أقرب ساحة سكراب',
                'سعر اليوم للسكراب',
                'نصائح بيع/شراء'
            ]
        }
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// المحرك
// ═══════════════════════════════════════════════════════════════════════════════
class SheikhaMetalsNetworksMap {
    constructor() {
        this.name = 'منظومة شيخة — شبكات المعادن والخريطة التفاعلية';
        this.version = '1.0.0';
        this.data = METALS_NETWORKS;
    }

    getDashboard() {
        const nk = Object.keys(this.data.networks);
        let totalNodes = 0;
        nk.forEach(k => { totalNodes += this.data.networks[k].nodes.length; });
        const sdk = Object.keys(this.data.supplyDemand);
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            name: this.name,
            networks: nk.length,
            totalNodes: totalNodes,
            metals: sdk.length,
            networkList: nk.map(k => ({ id: this.data.networks[k].id, name: this.data.networks[k].nameAr, nodes: this.data.networks[k].nodes.length, color: this.data.networks[k].color })),
            shariaEvidence: this.data.islamicFoundation.verses.length + this.data.islamicFoundation.hadith.length
        };
    }

    getSupplyDemand(metal) {
        const d = this.data.supplyDemand[metal];
        if (!d) return null;
        return { بسم_الله: 'بسم الله الرحمن الرحيم', المعدن: d.nameAr || metal, ...d };
    }

    getAllSupplyDemand() {
        return { بسم_الله: 'بسم الله الرحمن الرحيم', البيانات: this.data.supplyDemand };
    }

    getNetwork(id) {
        const nk = Object.keys(this.data.networks);
        for (const k of nk) {
            if (this.data.networks[k].id === id) return { بسم_الله: 'بسم الله الرحمن الرحيم', ...this.data.networks[k] };
        }
        return null;
    }

    getAllNetworks() {
        return { بسم_الله: 'بسم الله الرحمن الرحيم', الشبكات: this.data.networks };
    }

    getMapData() {
        // كل النقاط الجغرافية للخريطة التفاعلية
        const allNodes = [];
        Object.values(this.data.networks).forEach(net => {
            net.nodes.forEach(node => {
                allNodes.push({ ...node, networkId: net.id, networkName: net.nameAr, networkColor: net.color, networkType: net.type });
            });
        });
        return { بسم_الله: 'بسم الله الرحمن الرحيم', totalNodes: allNodes.length, nodes: allNodes };
    }

    getVisibility(role) {
        const v = this.data.visibility[role];
        if (!v) return null;
        return { الدور: role, ...v };
    }

    getIslamicFoundation() {
        return { بسم_الله: 'بسم الله الرحمن الرحيم', ...this.data.islamicFoundation };
    }

    searchNodes(query) {
        const results = [];
        const q = query.toLowerCase();
        Object.values(this.data.networks).forEach(net => {
            net.nodes.forEach(node => {
                const searchable = [node.name, node.nameEn, node.country, node.city, node.operator, node.note, node.products].filter(Boolean).join(' ').toLowerCase();
                if (searchable.includes(q)) {
                    results.push({ ...node, networkId: net.id, networkName: net.nameAr });
                }
            });
        });
        return { query, count: results.length, results };
    }

    getNetworkKeys() {
        return Object.keys(this.data.networks).map(k => this.data.networks[k].id);
    }

    getSupplyDemandKeys() {
        return Object.keys(this.data.supplyDemand);
    }
}

module.exports = SheikhaMetalsNetworksMap;
