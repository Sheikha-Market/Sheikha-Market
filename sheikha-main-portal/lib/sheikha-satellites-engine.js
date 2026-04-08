'use strict';

/**
 * sheikha-satellites-engine.js
 * محرك الأقمار الصناعية الشامل — منظومة شيخة
 * المرحلة ٤٣ — شبكة اتصالات كونية إسلامية
 * Satellites | Networks | Internet | Energy | Telecom
 * بسم الله الرحمن الرحيم
 * وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ (الذاريات:22)
 * فَلَا أُقْسِمُ بِمَوَاقِعِ النُّجُومِ (الواقعة:75)
 */

// ─────────────────────────────────────────────────────────────
// تصنيف الأقمار الصناعية — أنواعها وأصنافها
// ─────────────────────────────────────────────────────────────
const SATELLITE_CATEGORIES = {
    LEO: { name: 'المدار الأرضي المنخفض', altitude_km: '160-2000', period_min: 90, latency_ms: '20-40', use: 'إنترنت عالي السرعة — صور عالية الدقة', examples: ['Starlink', 'OneWeb', 'Iridium'] },
    MEO: { name: 'المدار الأرضي المتوسط', altitude_km: '2000-35786', period_hours: '2-24', latency_ms: '100-600', use: 'GPS — الملاحة — اتصالات المناطق القطبية', examples: ['GPS (US)', 'Galileo (EU)', 'GLONASS (RU)', 'BeiDou (CN)'] },
    GEO: { name: 'المدار الجيوثابت', altitude_km: '35786', period_hours: 24, latency_ms: '500-600', use: 'تلفزيون — طقس — اتصالات تقليدية واسعة', examples: ['Arabsat', 'SES', 'Intelsat', 'ViaSat'] },
    HEO: { name: 'المدار الإهليلجي العالي', altitude_km: 'متغير', use: 'تغطية القطبين — مناطق شمالية', examples: ['Molniya (RU)', 'SIRIUS XM'] },
    SSO: { name: 'المدار الشمسي المتزامن', altitude_km: '600-800', use: 'الاستشعار عن بُعد — صور الأرض', examples: ['Sentinel (EU)', 'Landsat (US)', 'DigitalGlobe'] },
    VLEO: { name: 'المدار المنخفض جداً', altitude_km: '160-450', use: 'مستقبل — تغطية كثيفة جداً', examples: ['Amazon Kuiper (مخطط)'] }
};

// ─────────────────────────────────────────────────────────────
// شبكات الأقمار الرئيسية في العالم (مُرقَّمة)
// ─────────────────────────────────────────────────────────────
const SATELLITE_NETWORKS = {

    // === ١. Starlink — SpaceX ===
    starlink: {
        no: 1, name: 'Starlink', operator: 'SpaceX (Elon Musk)', country: 'USA',
        orbit: 'LEO', altitude_km: '340-560', total_satellites: 6000, operational: 5500,
        internet_speed: { download_mbps: '50-500', upload_mbps: '10-40', latency_ms: '20-40' },
        coverage: 'أكثر من 100 دولة — شبه كامل باستثناء القطبين',
        service_types: ['Starlink Residential', 'Starlink Business', 'Starlink Maritime', 'Starlink Aviation', 'Starlink RV', 'Starlink Cellular (T2G)'],
        hardware: { dish: 'Starlink Dish (Dishy McFlatface)', router: 'Wi-Fi 6 Router', price_usd: 499 },
        monthly_cost_usd: { residential: 120, business: 250, maritime: 5000 },
        tech_specs: {
            frequency: 'Ku-band + Ka-band + V-band (emerging)',
            modulation: 'OFDM',
            encryption: 'AES-256',
            laser_links: 'Inter-satellite laser links (ISLs) — جيل v2',
            constellation_gen: 'Gen2 (Starship deployed)'
        },
        innovations: [
            'Direct-to-Cell: اتصال مباشر بالهاتف بدون dish خاص (T-Mobile شراكة)',
            'Inter-Satellite Links: اتصال بين الأقمار بليزر — شبكة فضائية مستقلة',
            'Flat-panel phased array: بوابة أقل من 10 سم سُمكاً',
            'AI-powered beam forming: توجيه الإشارة تلقائياً',
            'Starship deployment: إطلاق 400+ قمر رحلة واحدة'
        ],
        nasa_contracts: true,
        military_use: 'Ukraine Defense (ثم أُوقف لاحقاً جزئياً)',
        sheikha_opportunity: 'خدمة إنترنت للمناطق النائية في الخليج + Maritime للسفن — ربط بخدمات شيخة'
    },

    // === ٢. OneWeb / Eutelsat ===
    oneweb: {
        no: 2, name: 'OneWeb / Eutelsat', operator: 'Eutelsat (فرنسا) + SoftBank + India', country: 'UK/France',
        orbit: 'LEO', altitude_km: 1200, total_satellites: 648, operational: 600,
        internet_speed: { download_mbps: '50-200', latency_ms: '30-50' },
        coverage: 'عالمي — تغطية قطبية ممتازة',
        service_types: ['B2B فقط حالياً — لمزودي الخدمة', 'Maritime', 'Aviation', 'Defense'],
        monthly_cost_usd: 'يعتمد على الشريك — مئات لآلاف يورو',
        sheikha_opportunity: 'شراكة كمزود خدمة إقليمي'
    },

    // === ٣. Amazon Kuiper ===
    amazon_kuiper: {
        no: 3, name: 'Amazon Kuiper', operator: 'Amazon (Jeff Bezos)', country: 'USA',
        orbit: 'LEO', altitude_km: '590-630', planned_satellites: 3236, operational: 0,
        launch_target: '2025-2026', internet_speed: { download_mbps: '400+', latency_ms: '<30' },
        coverage: 'عالمي (عند اكتمال الكوكبة)',
        integration: 'AWS Cloud — تكامل مباشر مع Amazon Web Services',
        hardware: { terminal_price_usd: 400, monthly_usd: 100 },
        sheikha_opportunity: 'تكامل مع AWS كبديل لـ GCP في بعض الخدمات'
    },

    // === ٤. Iridium ===
    iridium: {
        no: 4, name: 'Iridium NEXT', operator: 'Iridium Communications', country: 'USA',
        orbit: 'LEO (قطبي)', altitude_km: 780, total_satellites: 66, operational: 66,
        internet_speed: { data_kbps: '22-704', latency_ms: '100-300' },
        coverage: '100% الأرض شاملاً القطبين',
        service_types: ['Voice', 'Data 9555', 'Iridium GO!', 'Iridium Certus (L-band broadband)'],
        use_cases: ['البحرية', 'النفط والغاز', 'الطوارئ', 'الصحراء والقطبين'],
        certus_speed: { download_mbps: 1.4, upload_mbps: 0.35 },
        sheikha_opportunity: 'اتصال طوارئ للشحنات في المناطق النائية — تتبع السفن في أعالي البحار'
    },

    // === ٥. Inmarsat ===
    inmarsat: {
        no: 5, name: 'Inmarsat', operator: 'Viasat (استحوذ عليها 2023)', country: 'UK/USA',
        orbit: 'GEO + LEO (الجيل الجديد ORCHESTRA)', total_satellites: 14,
        service_types: ['BGAN (أرضي)', 'FleetBroadband (Maritime)', 'SwiftBroadband (Aviation)', 'IsatPhone Pro', 'ELERA (IoT)'],
        internet_speed: { download_mbps: '25-600' },
        orchestra: 'شبكة هجينة GEO+MEO+LEO — مستقبل',
        sheikha_opportunity: 'تتبع سفن الشحن — اتصال satellite للبواخر التجارية'
    },

    // === ٦. SES (مدار GEO+MEO) ===
    ses: {
        no: 6, name: 'SES + O3b mPOWER', operator: 'SES S.A.', country: 'Luxembourg',
        orbit: 'GEO + MEO (O3b)', total_satellites: 70,
        internet_speed: { download_gbps: '5-10 per beam (GEO)', meo_latency_ms: '150' },
        service_types: ['Video Distribution', 'Data Networks', 'Mobility'],
        sheikha_opportunity: 'بث تلفزيوني إسلامي — قناة شيخة الفضائية مستقبلاً'
    },

    // === ٧. Arabsat ===
    arabsat: {
        no: 7, name: 'Arabsat', operator: 'العرب بالمشاركة (22 دولة)', country: 'Saudi Arabia (مقر الرياض)',
        orbit: 'GEO', total_satellites: 8, altitude_km: 35786,
        coverage: 'العالم العربي + أجزاء من أوروبا وأفريقيا',
        service_types: ['Badr-4/5/6/7', 'BADR-8 (أحدث 2023)', 'TV Broadcasting', 'VSAT', 'Government'],
        frequency_bands: ['C-band', 'Ku-band', 'Ka-band'],
        key_satellite: {
            BADR8: {
                launched: 2023, capacity: 'High Throughput Satellite (HTS)',
                beams: 'Europe + Middle East + Africa', internet: 'Ka-band 100 Gbps+',
                special: 'أقوى أقمار Arabsat — يغطي السعودية بشكل ممتاز'
            }
        },
        sheikha_opportunity: 'شريك استراتيجي سعودي — VSAT للمستودعات في المناطق النائية — بث القناة الإسلامية',
        saudi_ownership: 'السعودية أكبر مساهم — مقر الرياض — القمر قانونياً سعودي'
    },

    // === ٨. Yahsat (الإمارات) ===
    yahsat: {
        no: 8, name: 'Yahsat', operator: 'Mubadala (Abu Dhabi)', country: 'UAE',
        orbit: 'GEO', total_satellites: 5,
        service_types: ['YahClick (كا باند للمناطق النائية)', 'YahLink (VSAT)', 'YahSAT-1A/1B'],
        coverage: 'الشرق الأوسط + أفريقيا + آسيا + جنوب أوروبا',
        internet_speed: { download_mbps: '25-100' },
        sheikha_opportunity: 'إنترنت VSAT للمستودعات السعودية والخليجية'
    },

    // === ٩. نظام GPS (نظام الملاحة الأمريكي) ===
    gps: {
        no: 9, name: 'GPS — Global Positioning System', operator: 'US Air Force', country: 'USA',
        orbit: 'MEO', altitude_km: 20200, total_satellites: 31, operational: 31,
        accuracy: { civilian: '3-5 metres', military: '0.3 metres', differential: '<1 metre' },
        frequency: { L1: '1575.42 MHz (civilian — C/A code)', L2: '1227.60 MHz (encrypted)', L5: '1176.45 MHz (safety-of-life)' },
        new_signals: 'GPS III — L1C للتوافق مع Galileo',
        sheikha_use: 'تتبع الشحنات — تحديد مواقع تجار السكراب — التنقل البري',
        innovations: ['GPS III 3x أدق', 'M-code للعسكري', 'Anti-Jam حماية من التشويش']
    },

    // === ١٠. نظام Galileo (الأوروبي) ===
    galileo: {
        no: 10, name: 'Galileo', operator: 'ESA + European Union', country: 'EU',
        orbit: 'MEO', altitude_km: 23222, total_satellites: 30, operational: 24,
        accuracy: { civilian: '1 metre', commercial_encrypted: '0.1 metre' },
        advantage_over_gps: ['دقة أعلى', 'إشارة مفتوحة للجميع', 'Search & Rescue المدمج'],
        frequency: { E1: '1575.42 MHz', E5: 'wideband' },
        sheikha_use: 'دقة أعلى في تتبع الشحنات — التحقق من المواقع الجغرافية في العقود'
    },

    // === ١١. BeiDou (الصيني) ===
    beidou: {
        no: 11, name: 'BeiDou Navigation Satellite System', operator: 'China', country: 'China',
        orbit: 'MEO + GEO + IGSO', total_satellites: 45, operational: 45,
        coverage: 'عالمي (GEO يغطي آسيا بشكل ممتاز)',
        accuracy: { civilian: '3 metres', precision: '10 cm (مع تعزيز)' },
        unique_features: ['Short Message Service (رسائل قصيرة عبر القمر)', 'RDSS (تحديد موقع + رد)', 'تغطية ممتازة لآسيا'],
        sheikha_use: 'شركاء آسيويون — مستورد المعادن من الصين يستخدمه'
    },

    // === ١٢. GLONASS (الروسي) ===
    glonass: {
        no: 12, name: 'GLONASS', operator: 'Russia (Roscosmos)', country: 'Russia',
        orbit: 'MEO', altitude_km: 19130, total_satellites: 27, operational: 24,
        accuracy: { civilian: '2.8 metres' },
        frequency_division: true,
        sheikha_note: 'الأجهزة الحديثة تستخدم GPS+Galileo+BeiDou+GLONASS معاً'
    },

    // === ١٣. NAVIC (الهندي) ===
    navic: {
        no: 13, name: 'NavIC (Navigation Indian Constellation)', operator: 'ISRO', country: 'India',
        orbit: 'GEO + GSO (هجين)', total_satellites: 7,
        coverage: 'الهند + 1500 كم حولها (تشمل كل الشرق الأوسط جزئياً)',
        accuracy: { civilian: '5 metres', encrypted: '0.5 metres' },
        sheikha_note: 'مفيد لمتابعة الشحنات الهندية (تجارة الهند مع الخليج ضخمة)'
    },

    // === ١٤. Sentinel — Copernicus (الاستشعار عن بُعد) ===
    sentinel: {
        no: 14, name: 'Sentinel — Copernicus Programme', operator: 'ESA + EC', country: 'EU',
        orbit: 'SSO (قطبي شمسي متزامن)', altitude_km: '693-800',
        satellites: {
            sentinel_1: { use: 'رادار SAR — مراقبة السواحل والجليد والفيضانات' },
            sentinel_2: { use: 'صور ضوئية 10-60م — الزراعة والعمران والبيئة' },
            sentinel_3: { use: 'مراقبة المحيطات والبحار — درجة الحرارة' },
            sentinel_5P: { use: 'جودة الهواء — ثاني أكسيد النيتروجين — الأوزون' },
            sentinel_6: { use: 'قياس دقيق لمستوى البحر' }
        },
        data: 'مجانية ومفتوحة (Copernicus Open Access)',
        sheikha_opportunity: 'تحليل الطقس والملاحة البحرية — مراقبة البيئة في المناطق الصناعية — صور للمستودعات والموانئ'
    },

    // === ١٥. Landsat (التاريخ والبيئة) ===
    landsat: {
        no: 15, name: 'Landsat 8 & 9', operator: 'NASA + USGS', country: 'USA',
        orbit: 'SSO', altitude_km: 705, revisit_days: 16,
        resolution: { optical: '15-30 metres', thermal: '100 metres' },
        data: 'مجانية — 1972 حتى الآن (أطول أرشيف صور الأرض)',
        sheikha_use: 'تحليل تغيرات مناطق التعدين والمقالع — رصد المستودعات الكبيرة من الفضاء'
    },

    // === ١٦. GOES + Meteosat (الطقس) ===
    weather_sats: {
        no: 16, name: 'Weather Satellites — GOES + Meteosat + Himawari',
        operators: { GOES: 'NOAA — USA', Meteosat: 'EUMETSAT — EU', Himawari: 'JMA — Japan' },
        orbit: 'GEO', refresh_rate: '10 دقائق — أو كل دقيقة لمناطق عاصفة',
        products: ['صور الغيوم', 'خرائط الحرارة', 'تحذيرات الإعصار', 'خرائط البرق'],
        sheikha_use: 'ربط بمحرك الطقس والفضاء (SHAMS) — تحليل حركة الشحن البحري والجوي — تنبيهات الطقس للتجار'
    },

    // === ١٧. TÜRKSAT ===
    turksat: {
        no: 17, name: 'TÜRKSAT 5A/5B/6A', operator: 'Türksat A.Ş.', country: 'Turkey',
        orbit: 'GEO', coverage: 'الشرق الأوسط + أوروبا + أفريقيا',
        services: ['TV Broadcasting', 'Internet', 'Government VSAT'],
        turksat_6a: { status: '2024 launched', engine: 'محرك تركي أول — إنجاز وطني', note: 'أول قمر تركي الصنع 100%' },
        sheikha_note: 'علاقات تجارية قوية بين السعودية وتركيا — مفيد للاتصال الدولي'
    },

    // === ١٨. Badr (أقمار عربسات) — تفصيل ===
    badr: {
        no: 18, name: 'قمر بدر (Arabsat)', country: 'Saudi Arabia',
        orbit: 'GEO — 26° East', coverage: 'العالم العربي + أوروبا + أفريقيا الشرقية',
        transponders: { C_band: 36, Ku_band: 40 },
        tv_channels: '900+ قناة عربية تبث من بدر-6',
        sheikha_opportunity: 'قناة شيخة التجارية الإسلامية — بث مباشر لأسعار المعادن — البرنامج الاقتصادي الإسلامي'
    },

    // === ١٩. ViaSat-3 ===
    viasat3: {
        no: 19, name: 'ViaSat-3', operator: 'Viasat Inc. + Inmarsat', country: 'USA',
        orbit: 'GEO', total_satellites: 3, capacity_tbps: 1,
        coverage: 'تثليثة توفر تغطية عالمية شاملة',
        internet_speed: { download_mbps: '100-1000' },
        service_types: ['Consumer Broadband', 'Aviation', 'Maritime', 'Military'],
        sheikha_note: 'أصبح جزء من Viasat-Inmarsat المندمجة'
    },

    // === ٢٠. أقمار KACST/PSATSC (سعودية) ===
    saudi_sats: {
        no: 20, name: 'الأقمار السعودية الوطنية', operator: 'KACST / PSATSC', country: 'Saudi Arabia',
        satellites: {
            Saudi_Sat_1: { launched: 2000, use: 'Remote Sensing — أول قمر سعودي' },
            Saudi_Sat_3: { launched: 2007, use: 'Remote Sensing + تجارب علمية' },
            Saudi_Sat_5A_5B: { launched: 2019, use: 'مراقبة الأرض، قدرة تصوير 1م' },
            Vision_Sat: { planned: 2025, use: 'رؤية 2030 — استشعار عن بُعد متطور' }
        },
        authority: 'مركز الأقمار الصناعية التابع لهيئة الفضاء السعودية (ASC)',
        vision_2030: 'استراتيجية الفضاء السعودية — إنتاج أقمار وطنية واستهداف 6 مليار دولار من اقتصاد الفضاء',
        sheikha_opportunity: 'شراكة مع هيئة الفضاء السعودية — بيانات الاستشعار للأراضي الزراعية والمناطق الصناعية'
    }
};

// ─────────────────────────────────────────────────────────────
// شبكة اتصالات شيخة الفضائية — الخدمات المقترحة
// ─────────────────────────────────────────────────────────────
const SHEIKHA_SATELLITE_SERVICES = {
    internet: {
        name: 'شيخة نت — إنترنت الفضاء',
        icon: '🌐',
        provider_partners: ['Starlink (LEO — للسرعة)', 'Arabsat/BADR8 (GEO — للاستقرار)', 'Yahsat (GEO — للمناطق النائية)'],
        packages: [
            { name: 'باقة التاجر الأساسية', speed: '50 Mbps', price_sar: 299, use: 'تجار أفراد في المدن' },
            { name: 'باقة المستودع', speed: '200 Mbps', price_sar: 699, use: 'مستودعات ومصانع — مع VSAT احتياطي' },
            { name: 'باقة السفينة التجارية', speed: '100 Mbps + Iridium طوارئ', price_sar: 2999, use: 'شحن بحري + تتبع' },
            { name: 'باقة الشريان النائي', speed: '25 Mbps (Yahsat VSAT)', price_sar: 899, use: 'مناطق بعيدة بلا شبكة أرضية' }
        ],
        halal_note: 'اتصال مستمر يُتيح التجارة الحلال من أي موقع — رفع الغرر بالتواصل الفوري'
    },
    mobile: {
        name: 'شيخة موبايل — خدمة الجوال الفضائية',
        icon: '📡',
        tech: 'Satellite Direct-to-Cell (Starlink + T-Mobile) + بطاقة SIM مزدوجة',
        coverage: 'أرضي في المدن + فضائي في المناطق المنقطعة',
        packages: [
            { name: 'باقة التاجر', calls_min: 'لا حدود', data_gb: 20, price_sar: 149 },
            { name: 'باقة التاجر بلاس', calls_min: 'لا حدود', data_gb: 100, price_sar: 299, satellite_backup: true },
            { name: 'باقة الجوال الفضائي', data_gb: 10, satellite_only: true, price_sar: 499, use: 'بحارة وأهل البوادي والأنهار' }
        ]
    },
    energy: {
        name: 'شيخة طاقة — الطاقة الشمسية الفضائية',
        icon: '⚡',
        sbsp: {
            name: 'Space-Based Solar Power (SBSP)',
            concept: 'أقمار صناعية تجمع طاقة شمسية خالصة (بلا غلاف جوي) وترسلها بالميكروويف للأرض',
            efficiency: '8x أعلى من الألواح الأرضية (لا غيوم، لا ليل، زاوية ثابتة)',
            leaders: ['JAXA اليابان (تجارب 2025)', 'UK Space Agency', 'ESA (مشروع SOLARIS)', 'Caltech USA'],
            timeline: 'تجاري: 2035-2040',
            potential: 'طاقة نظيفة لا متقطعة للسعودية والخليج'
        },
        current_integration: {
            desc: 'ربط نظام الطاقة الشمسية الأرضي مع البيانات الفضائية',
            use_cases: [
                'بيانات الإشعاع الشمسي من Copernicus/Landsat لإرشاد التجار',
                'تحسين إنتاج الطاقة بتحليلات الطقس الفضائية',
                'تتبع البنية التحتية الطاقوية عبر الصور الفضائية'
            ]
        },
        sheikha_package: {
            name: 'باقة التاجر الشمسية + الفضائية',
            components: ['لوح شمسي 5 كيلو', 'بطارية تخزين', 'إنترنت فضائي 50Mbps', 'شريحة جوال فضائي'],
            price_sar: 15000, monthly_sar: 199,
            saving: 'توفير 70% من فاتورة الطاقة والاتصالات مجتمعة'
        }
    },
    tracking: {
        name: 'شيخة تتبع — GPS/AIS للشحنات',
        icon: '🛰️',
        tech: ['GPS/Galileo للموقع', 'AIS للسفن (Automatic Identification System)', 'Iridium SBD للمناطق البعيدة'],
        packages: [
            { name: 'تتبع الحاوية', price_sar: 49, per: 'شهر/حاوية', update: 'كل 5 دقائق' },
            { name: 'تتبع السفينة', price_sar: 299, per: 'شهر/سفينة', features: ['AIS', 'Iridium طوارئ', 'تقارير الرحلة'] },
            { name: 'جهاز تتبع السكراب', price_sar: 199, device: 'جهاز GPS صغير يُثبَّت على الشاحنة', data: 'لوحة تحكم شيخة' }
        ]
    },
    bundle: {
        name: 'حزمة شيخة الكونية الشاملة',
        icon: '🌍',
        description: 'إنترنت + جوال + طاقة + تتبع — اشتراك واحد',
        packages: [
            {
                name: '🌙 باقة الفجر — التاجر الفرد',
                internet: '50 Mbps فضائي',
                mobile: 'شريحة 20 GB + مكالمات',
                tracking: 'جهاز تتبع',
                price_sar: 599, save_percent: 25
            },
            {
                name: '☀️ باقة الضحى — المستودع',
                internet: '200 Mbps + احتياطي GEO',
                mobile: '5 شرائح للفريق',
                tracking: '5 أجهزة تتبع',
                energy: 'إشارات الطاقة الشمسية',
                price_sar: 1499, save_percent: 30
            },
            {
                name: '🌟 باقة العلياء — السفينة التجارية',
                internet: 'Starlink Maritime 100 Mbps',
                mobile: 'غير محدود للطاقم',
                tracking: 'AIS + Iridium طوارئ',
                energy: 'بيانات الطقس الفضائية',
                price_sar: 4999, save_percent: 20
            }
        ]
    }
};

// ─────────────────────────────────────────────────────────────
// الإطار الشرعي للأقمار الصناعية
// ─────────────────────────────────────────────────────────────
const SHARIA_SATELLITE = {
    quran: [
        { ref: 'الذاريات:22', text: 'وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ', context: 'السماء مصدر للرزق — الأقمار خدمة رزق' },
        { ref: 'الواقعة:75', text: 'فَلَا أُقْسِمُ بِمَوَاقِعِ النُّجُومِ', context: 'تعظيم مواقع النجوم والكواكب' },
        { ref: 'الرحمن:33', text: 'يَا مَعْشَرَ الْجِنِّ وَالْإِنسِ إِنِ اسْتَطَعْتُمْ أَن تَنفُذُوا مِنْ أَقْطَارِ السَّمَاوَاتِ وَالْأَرْضِ فَانفُذُوا لَا تَنفُذُونَ إِلَّا بِسُلْطَانٍ', context: 'التكنولوجيا الفضائية هي السلطان العلمي — مشروعة ومطلوبة' },
        { ref: 'النحل:16', text: 'وَعَلَامَاتٍ وَبِالنَّجْمِ هُمْ يَهْتَدُونَ', context: 'الاهتداء بالنجوم — GPS الفضائي امتداد لهذا' }
    ],
    rulings: {
        internet: 'الإنترنت الفضائي حلال إذا استُخدم في الحلال — مثل سيف الحديد',
        telecom: 'خدمات الاتصال مشروعة وفيها مصلحة ظاهرة',
        imaging: 'التصوير الفضائي للتجارة والزراعة والأمن مباح — يُمنع لهتك الأعراض',
        energy: 'طاقة الفضاء الشمسية طاهرة نظيفة — الاستثمار فيها فيه مصلحة',
        tracking: 'تتبع الشحنات بـ GPS رفع للغرر ومصلحة مشروعة للعاقدين'
    }
};

// ─────────────────────────────────────────────────────────────
// دوال المحرك
// ─────────────────────────────────────────────────────────────
function getEngineStats() {
    return {
        engine: 'sheikha-satellites-engine',
        version: '1.0.0',
        phase: 43,
        satellite_networks: Object.keys(SATELLITE_NETWORKS).length,
        orbit_types: Object.keys(SATELLITE_CATEGORIES).length,
        sheikha_services: Object.keys(SHEIKHA_SATELLITE_SERVICES).length,
        sharia_refs: SHARIA_SATELLITE.quran.length,
        quran_ref: 'وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ — الذاريات:22',
        halal_note: 'تقنية الفضاء في خدمة التجارة الإسلامية'
    };
}

module.exports = {
    getEngineStats,
    getAllNetworks: () => Object.values(SATELLITE_NETWORKS),
    getNetworkById: (id) => SATELLITE_NETWORKS[id] || null,
    getCategories: () => SATELLITE_CATEGORIES,
    getSheikhaServices: () => SHEIKHA_SATELLITE_SERVICES,
    getShariaSatellite: () => SHARIA_SATELLITE,
    getBundles: () => SHEIKHA_SATELLITE_SERVICES.bundle.packages,
    SATELLITE_NETWORKS,
    SATELLITE_CATEGORIES
};
