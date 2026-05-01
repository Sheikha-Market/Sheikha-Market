/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  LOGISTICS NETWORKS — الشبكات اللوجيستية                                    ║
 * ║                                                                              ║
 * ║  شبكات الاتصالات لكل وسائل النقل:                                           ║
 * ║  ✈️ الطيران  🚢 السفن  🚛 النقل البري  🚂 السكك  🚁 المروحيات             ║
 * ║  🏗️ الموانئ  🛣️ الطرق السريعة  📦 سلاسل الإمداد                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَخُلِقَ الْإِنسَانُ ضَعِيفًا — اللَّهُ يَعْلَمُ مَا تَحْمِلُ كُلُّ أُنثَىٰ"
 * "وَاللَّهُ يَعْلَمُ مَا تُبْدُونَ وَمَا تَكْتُمُونَ" — البقرة:٢٨٣
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ✈️ شبكات الطيران المدني
// ═══════════════════════════════════════════════════════════════
const AVIATION_NETWORKS = {

    // ─── ACARS — نظام بيانات الطيران ─────────────────────────
    ACARS: {
        id:      'ACARS',
        nameAr:  'ACARS — نظام الاتصالات والإبلاغ بالطائرات',
        nameEn:  'Aircraft Communications Addressing and Reporting System',
        icon:    '📟',
        type:    'DATA_LINK',
        variants: {
            VHF_ACARS: { nameAr: 'ACARS على VHF', freq: '129.125 MHz', range: 'خط بصري ~300 كم', speed: '2.4 kbps' },
            HF_ACARS:  { nameAr: 'ACARS على HF',   freq: '2-30 MHz',   range: 'عالمي', speed: '1.8 kbps' },
            SAT_ACARS: { nameAr: 'ACARS الفضائي',   freq: 'L-Band/Ku',  range: 'عالمي', speed: 'حتى 128 kbps' },
        },
        messages: ['ATIS (معلومات الجو)', 'تصاريح ATC', 'قوائم الطعام', 'بيانات أداء المحرك', 'تقارير الوقود'],
        standard: 'ARINC 618/619/620/623',
        use_in_ksa: 'مطار الملك خالد + مطار جدة + مطار الدمام',
        quran_ref: { ref: 'الملك:١٩', text: 'أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ' },
    },

    // ─── ADS-B — تحديد الموقع التلقائي ───────────────────────
    ADS_B: {
        id:      'ADS_B',
        nameAr:  'ADS-B — البث التلقائي لتحديد الموقع',
        nameEn:  'Automatic Dependent Surveillance – Broadcast',
        icon:    '📡',
        type:    'SURVEILLANCE',
        frequency: '1090 MHz (ES) / 978 MHz (UAT)',
        range:    'خط بصري — ~300 كم',
        update:   'كل ثانية (1 Hz)',
        data:     ['خط العرض/الطول', 'الارتفاع', 'السرعة', 'هوية الطائرة', 'رمز ICAO 24-bit'],
        mandatory: '2020+ في معظم الأجواء المراقبة',
        standard:  'ICAO Annex 10 / DO-260B',
        receiver_networks: ['FlightRadar24', 'FlightAware', 'OpenSky'],
        ksa_mandate: 'GACA SIR 91 — إلزامي على الطائرات في الأجواء السعودية',
    },

    // ─── VHF — الاتصال الصوتي الجوي ─────────────────────────
    VHF_VOICE: {
        id:      'VHF_VOICE',
        nameAr:  'VHF — الاتصال الصوتي بالمراقبة الجوية',
        nameEn:  'VHF Aviation Voice Communications',
        icon:    '🎙️',
        type:    'VOICE',
        band:    'VHF',
        frequency: '118.000 – 136.975 MHz',
        channel_spacing: '25 kHz (or 8.33 kHz in Europe)',
        range:   'خط بصري — يتسع بالارتفاع',
        use_case: ['ATC clearances', 'بلاغات الطيار', 'إرشادات المناورة', 'حالات الطوارئ 121.5 MHz'],
        emergency_freq: '121.500 MHz — الطوارئ الدولية (ICAO)',
        standard:  'ICAO Annex 10 Volume II',
    },

    // ─── HF — الاتصال طويل المدى ──────────────────────────────
    HF_AVIATION: {
        id:      'HF_AVIATION',
        nameAr:  'HF — اتصالات الطيران طويلة المدى',
        nameEn:  'HF Aviation Communications',
        icon:    '🌊',
        type:    'VOICE_AND_DATA',
        band:    'HF',
        frequency: '2 – 30 MHz',
        range:   'عالمي (بالانعكاس الأيونوسفيري)',
        use_case: ['الطيران فوق المحيطات', 'رسائل SELCAL', 'HFDL (data link)'],
        standard: 'ICAO Annex 10',
    },

    // ─── ATIS — معلومات المطار التلقائية ─────────────────────
    ATIS: {
        id:      'ATIS',
        nameAr:  'ATIS — معلومات المطار التلقائية',
        nameEn:  'Automatic Terminal Information Service',
        icon:    '🔊',
        type:    'BROADCAST',
        medium:  ['VHF (صوت)', 'D-ATIS (رقمي عبر ACARS/بيانات)'],
        content: ['حالة الطقس', 'المدرج النشط', 'الضغط الجوي', 'أي إعلانات NOTAMs'],
        update:  'كل ساعة أو عند تغيير الظروف',
        ksa_airports: ['OEDF — الرياض', 'OEJN — جدة', 'OEAH — الأحساء'],
    },

    // ─── RNAV / FMS — الملاحة الجوية ────────────────────────
    FMS_RNAV: {
        id:      'FMS_RNAV',
        nameAr:  'FMS/RNAV — نظام إدارة الرحلة والملاحة المنطقية',
        nameEn:  'Flight Management System / Area Navigation',
        icon:    '🧭',
        type:    'NAVIGATION',
        inputs:  ['GPS', 'VOR/DME', 'IRS/INS', 'قواعد بيانات المطارات AIRAC'],
        outputs: ['مسار الطيران المحسوب', 'الوقود المتوقع', 'التوجيهات للطيار الآلي'],
        database_cycle: 'AIRAC 28 يوماً',
    },
};

// ═══════════════════════════════════════════════════════════════
// 🚢 شبكات السفن والملاحة البحرية
// ═══════════════════════════════════════════════════════════════
const MARITIME_NETWORKS = {

    // ─── AIS — نظام التعريف التلقائي ─────────────────────────
    AIS: {
        id:      'AIS',
        nameAr:  'AIS — نظام التعريف التلقائي للسفن',
        nameEn:  'Automatic Identification System',
        icon:    '📡',
        type:    'SURVEILLANCE',
        frequency: 'VHF 161.975 MHz + 162.025 MHz',
        range:   '20-40 نوتيح بحرية (ساحلي) / عالمي (فضائي SAT-AIS)',
        data:    ['موقع السفينة', 'السرعة', 'الاتجاه', 'هوية MMSI', 'اسم السفينة', 'نوع البضاعة', 'وجهة السفر'],
        classes: {
            A: 'سفن تجارية > 300 طن / ناقلات',
            B: 'سفن أصغر / يخوت / صيد',
            SAT: 'استقبال AIS من الفضاء (تغطية عالمية)',
        },
        standard: 'ITU-R M.1371 / SOLAS Chapter V',
        ksa_authority: 'هيئة الموانئ السعودية + الرئاسة العامة للأرصاد',
        quran_ref: { ref: 'يونس:٢٢', text: 'هُوَ الَّذِي يُسَيِّرُكُمْ فِي الْبَرِّ وَالْبَحْرِ' },
    },

    // ─── GMDSS — نظام الاستغاثة العالمي ─────────────────────
    GMDSS: {
        id:      'GMDSS',
        nameAr:  'GMDSS — نظام نجدة الاستغاثة البحري العالمي',
        nameEn:  'Global Maritime Distress and Safety System',
        icon:    '🆘',
        type:    'SAFETY_CRITICAL',
        components: {
            EPIRB:  { nameAr: 'EPIRB — إشارة الاستغاثة (تعمل تلقائياً عند الغرق)', freq: '406 MHz', sat: 'COSPAS-SARSAT' },
            SART:   { nameAr: 'SART — محدد موقع الإنقاذ', freq: '9 GHz (radar)' },
            PLB:    { nameAr: 'PLB — إشارة تحديد الموقع الشخصي', freq: '406 MHz' },
            DSC:    { nameAr: 'DSC — النداء الرقمي الانتقائي', freq: 'VHF CH70 / MF/HF', use: 'استدعاء طوارئ أوتوماتيكي' },
            NAVTEX: { nameAr: 'NAVTEX — إشعارات سلامة البحر', freq: '518 kHz', use: 'تحذيرات الطقس والملاحة' },
            INMARSAT_C: { nameAr: 'Inmarsat-C', use: 'رسائل بيانات + صوت + SafetyNet' },
        },
        mandatory: 'إلزامي بموجب اتفاقية SOLAS لكل السفن التجارية',
        standard: 'SOLAS Chapter IV + ITU Radio Regulations',
        ksa_enforcement: 'هيئة الموانئ + خفر السواحل السعودي',
    },

    // ─── VHF البحري ───────────────────────────────────────────
    VHF_MARITIME: {
        id:      'VHF_MARITIME',
        nameAr:  'VHF البحري — الاتصال الصوتي للسفن',
        nameEn:  'Maritime VHF Radio',
        icon:    '🎙️',
        type:    'VOICE',
        band:    'VHF',
        frequency: '156 – 174 MHz (قنوات 01-88)',
        key_channels: {
            CH16: 'قناة الاستغاثة الدولية — المراقبة الإلزامية',
            CH70: 'DSC — النداء الرقمي الانتقائي',
            CH13: 'التواصل بين الجسور (navigational safety)',
            CH22A: 'التواصل مع خفر السواحل الأمريكي',
            CH06: 'عمليات بين السفن (ship-to-ship safety)',
        },
        range:   '5-25 نوتية بحرية (مرتفعات الصارية تزيد المدى)',
        standard: 'ITU-R M.493 / GMDSS',
    },

    // ─── AtoN — علامات الملاحة الإلكترونية ───────────────────
    ATON: {
        id:      'ATON',
        nameAr:  'AtoN — علامات المساعدة في الملاحة الإلكترونية',
        nameEn:  'Aids to Navigation — AIS AtoN',
        icon:    '🚦',
        type:    'NAVIGATION_AIDS',
        description: 'منارات وعوامات تبث بياناتها عبر AIS',
        data:    ['موقع المنارة', 'حالة الضوء', 'الطقس المحلي', 'البيانات الهيدروغرافية'],
        ksa_ports: ['ميناء جدة الإسلامي', 'ميناء الملك عبدالعزيز (الدمام)', 'ميناء رابغ', 'ميناء ينبع'],
    },

    // ─── e-Navigation ─────────────────────────────────────────
    E_NAVIGATION: {
        id:      'E_NAVIGATION',
        nameAr:  'الملاحة الإلكترونية (e-Navigation)',
        nameEn:  'e-Navigation',
        icon:    '🖥️',
        type:    'DIGITAL_NAVIGATION',
        description: 'دمج المعلومات الرقمية لتحسين سلامة الملاحة البحرية',
        components: ['ECDIS (خرائط رقمية)', 'AIS', 'GMDSS', 'VTS (خدمة حركة السفن)', 'محطات الطقس البحري'],
        standard: 'IMO MSC.1/Circ.1595',
        ksa_vts: 'مراكز خدمة حركة السفن في موانئ المملكة',
        quran_ref: { ref: 'الشعراء:١٢٨', text: 'أَتَبْنُونَ بِكُلِّ رِيعٍ آيَةً تَعْبَثُونَ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// 🚛 شبكات النقل البري واللوجيستيات
// ═══════════════════════════════════════════════════════════════
const LAND_LOGISTICS_NETWORKS = {

    // ─── تتبع الشاحنات ────────────────────────────────────────
    FLEET_TRACKING: {
        id:      'FLEET_TRACKING',
        nameAr:  'تتبع الأسطول والشاحنات',
        nameEn:  'Fleet & Truck Tracking',
        icon:    '🚛',
        type:    'TELEMATICS',
        technologies: {
            GPS_4G:   { nameAr: 'GPS + 4G/5G', use: 'تتبع لحظي عبر الجوال', update: '30 ثانية' },
            SATELLITE_TRACKER: { nameAr: 'تتبع فضائي', use: 'المناطق النائية بدون جوال', provider: 'Iridium / Inmarsat' },
            RFID:     { nameAr: 'RFID', use: 'تتبع البضاعة في المستودعات والموانئ' },
            ELD:      { nameAr: 'سجل القيادة الإلكتروني (ELD)', use: 'تتبع ساعات السائق والامتثال' },
        },
        platforms: ['SAP TM', 'Oracle TMS', 'CargoWise', 'محلي: مصر للبرمجيات / Navixy عربي'],
        ksa_mandate: 'وزارة النقل والخدمات اللوجستية — نظام تتبع الشاحنات',
        quran_ref: { ref: 'البقرة:٢٨٣', text: 'وَإِن كُنتُمْ عَلَىٰ سَفَرٍ وَلَمْ تَجِدُوا كَاتِبًا فَرِهَانٌ مَّقْبُوضَةٌ' },
    },

    // ─── الطرق الذكية ─────────────────────────────────────────
    SMART_ROADS: {
        id:      'SMART_ROADS',
        nameAr:  'الطرق الذكية — ITS',
        nameEn:  'Intelligent Transportation Systems',
        icon:    '🛣️',
        type:    'INFRASTRUCTURE_COMMS',
        components: {
            V2X: { nameAr: 'V2X — المركبة للبنية التحتية', standards: ['C-V2X', 'DSRC 5.9GHz'], use: 'تفادي الحوادث وإشارات المرور' },
            TOLLING: { nameAr: 'نظام جمع الرسوم الإلكترونية RFID', use: 'بوابات Saher / Nol / السداد التلقائي' },
            CCTV_AI: { nameAr: 'كاميرات ذكية + AI', use: 'رصد المخالفات والتعرف على لوحات السيارات' },
            TMC: { nameAr: 'مركز إدارة المرور', comm: ['IP فيبر', 'LTE مخصص'], use: 'التحكم المركزي في حركة المرور' },
        },
        ksa_initiative: 'نظام سهل — SAMA + وزارة النقل',
        smart_cities: ['NEOM', 'القدية', 'الرياض 2030'],
    },

    // ─── الموانئ الذكية ──────────────────────────────────────
    SMART_PORTS: {
        id:      'SMART_PORTS',
        nameAr:  'الموانئ الذكية',
        nameEn:  'Smart Port Communications',
        icon:    '⚓',
        type:    'PORT_COMMS',
        systems: {
            PCS:  { nameAr: 'نظام تبادل معلومات الميناء (PCS)', standard: 'IMO FAL', use: 'التخليص الجمركي الإلكتروني' },
            TOS:  { nameAr: 'نظام تشغيل المحطة (TOS)', use: 'إدارة الحاويات والرافعات' },
            VTS:  { nameAr: 'خدمة حركة السفن (VTS)', use: 'التحكم بدخول وخروج السفن' },
            RFID_CONTAINER: { nameAr: 'RFID تتبع الحاويات', use: 'موقع الحاوية داخل الميناء' },
            WIFI_5G: { nameAr: 'Wi-Fi صناعي + 5G خاص', use: 'اتصالات الرافعات والآليات' },
        },
        ksa_ports: {
            JEDDAH:   { nameAr: 'ميناء جدة الإسلامي', capacity: '7.3M TEU', operator: 'MAWANI + MSC' },
            DAMMAM:   { nameAr: 'ميناء الملك عبدالعزيز', capacity: '2.2M TEU' },
            JUBAIL:   { nameAr: 'ميناء الملك فهد الصناعي' },
             YANBU:    { nameAr: 'ميناء ينبع الصناعي' },
            RIYADH_DRY: { nameAr: 'ميناء الرياض الجاف', type: 'ICD' },
        },
        quran_ref: { ref: 'الإسراء:٧٠', text: 'وَحَمَلْنَاهُمْ فِي الْبَرِّ وَالْبَحْرِ' },
    },

    // ─── مراكز توزيع اللوجستيات ──────────────────────────────
    WAREHOUSE_COMMS: {
        id:      'WAREHOUSE_COMMS',
        nameAr:  'اتصالات المستودعات ومراكز التوزيع',
        nameEn:  'Warehouse & Distribution Center Comms',
        icon:    '📦',
        type:    'WAREHOUSE',
        technologies: {
            WIFI6: { nameAr: 'Wi-Fi 6 صناعي', use: 'الرافعات، الماسحات، الروبوتات' },
            BARCODE_SCANNER: { nameAr: 'ماسحات الباركود / QR', protocol: 'Bluetooth / Wi-Fi' },
            RFID_UHF: { nameAr: 'RFID UHF', range: 'حتى 12 متر', use: 'قراءة حاويات بدون مسح بصري' },
            WMS_ERP: { nameAr: 'WMS + ERP تكامل', use: 'SAP WM / Oracle WMS / Infor' },
            AGV: { nameAr: 'الروبوتات المتنقلة (AGV/AMR)', comm: 'Wi-Fi 6 + LiDAR' },
        },
        ksa_hubs: ['الرياض للوجستيكس', 'مركز الاتصالات الوطني (NTC)', 'Aramex الرياض', 'DHL الرياض'],
    },
};

// ═══════════════════════════════════════════════════════════════
// ✈️🚢 مطارات + موانئ — التكامل الكامل
// ═══════════════════════════════════════════════════════════════
const HUBS_INTEGRATION = {

    AIRPORTS: {
        nameAr: 'شبكات اتصالات المطارات',
        icon:   '🛫',
        systems: ['VHF ATC', 'ACARS', 'ADS-B', 'ATIS', 'Radar (PSR+SSR)', 'ILS/VOR/DME', 'PAPI', 'Ground comms UHF', 'FIDS boards', 'BHS RFID baggage'],
        ksa_airports: {
            RUH: { nameAr: 'مطار الملك خالد الدولي — الرياض', iata: 'RUH', runways: 4 },
            JED: { nameAr: 'مطار الملك عبدالعزيز الدولي — جدة', iata: 'JED', terminal: 'الجديد 2018' },
            DMM: { nameAr: 'مطار الملك فهد الدولي — الدمام', iata: 'DMM', area: '780 km² (الأكبر عالمياً)' },
            MED: { nameAr: 'مطار الأمير محمد بن عبدالعزيز — المدينة المنورة', iata: 'MED' },
            TIF: { nameAr: 'مطار الطائف الدولي', iata: 'TIF' },
        },
        regulatory: 'GACA — الهيئة العامة للطيران المدني السعودي',
    },

    SEAPORTS: {
        nameAr: 'شبكات اتصالات الموانئ',
        icon:   '⚓',
        systems: ['AIS', 'VHF CH16', 'GMDSS', 'NAVTEX', 'VTS Radar', 'PCS', 'TOS', 'RFID', 'CCTV'],
        ksa_ports: ['جدة الإسلامي', 'الملك عبدالعزيز دمام', 'ينبع', 'جازان', 'رابغ'],
        regulatory: 'الموانئ السعودية MAWANI + خفر السواحل',
    },
};

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════
function getLogisticsNetworks() {
    return {
        domain:   'LOGISTICS',
        nameAr:   'الشبكات اللوجيستية',
        icon:     '🌐',
        aviation: { count: Object.keys(AVIATION_NETWORKS).length,  systems: Object.values(AVIATION_NETWORKS) },
        maritime: { count: Object.keys(MARITIME_NETWORKS).length,  systems: Object.values(MARITIME_NETWORKS) },
        land:     { count: Object.keys(LAND_LOGISTICS_NETWORKS).length, systems: Object.values(LAND_LOGISTICS_NETWORKS) },
        hubs:     HUBS_INTEGRATION,
        verse: { ref: 'الإسراء:٧٠', text: 'وَحَمَلْنَاهُمْ فِي الْبَرِّ وَالْبَحْرِ' },
    };
}

function getAviationSystems() { return Object.values(AVIATION_NETWORKS); }
function getMaritimeSystems()  { return Object.values(MARITIME_NETWORKS); }
function getLandSystems()      { return Object.values(LAND_LOGISTICS_NETWORKS); }

module.exports = {
    AVIATION_NETWORKS,
    MARITIME_NETWORKS,
    LAND_LOGISTICS_NETWORKS,
    HUBS_INTEGRATION,
    getLogisticsNetworks,
    getAviationSystems,
    getMaritimeSystems,
    getLandSystems,
};
