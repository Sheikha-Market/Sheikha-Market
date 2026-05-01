/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TELECOM COMMUNITIES — مجتمعات شبكات الاتصالات                              ║
 * ║                                                                              ║
 * ║  كل قطاع = مجتمع متكامل بمعاييره ومنظماته وشبكاته                          ║
 * ║  ✈️ الطيران  🚢 البحر  🚛 البر  🚂 السكك  🏗️ الصناعة  🏛️ الحكومة        ║
 * ║  🆘 الطوارئ  🌾 الزراعة  ⚡ الطاقة  🏙️ المدن الذكية                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا"
 * — الحجرات:١٣
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// مجتمعات الاتصالات
// ═══════════════════════════════════════════════════════════════
const TELECOM_COMMUNITIES = {

    // ─── ✈️ مجتمع الطيران ─────────────────────────────────────
    AVIATION: {
        id:       'AVIATION',
        nameAr:   'مجتمع الطيران',
        nameEn:   'Aviation Community',
        icon:     '✈️',
        description: 'كل من يعمل في الأجواء أو يدير الطيران أو يتعلق به',
        members: {
            airlines:        { nameAr: 'شركات الطيران',           examples: ['سعودية', 'فلاي ناس', 'flynas', 'طيران أديل'] },
            atc:             { nameAr: 'المراقبة الجوية ATC',       examples: ['GACA', 'هيئة الطيران المدني السعودي'] },
            airports:        { nameAr: 'إدارات المطارات',          examples: ['GAC', 'مطار الرياض', 'جدة'] },
            manufacturers:   { nameAr: 'صانعو الطائرات',           examples: ['Boeing', 'Airbus', 'Embraer'] },
            mro:             { nameAr: 'شركات الصيانة MRO',         examples: ['Saudia Technic', 'SR Technics'] },
            ground_handling: { nameAr: 'خدمات الأرض',              examples: ['DNATA', 'Saudia Ground Services'] },
            cargo_aviation:  { nameAr: 'الطيران الشحن',            examples: ['Saudi Cargo', 'Aramex Air', 'DHL Express'] },
        },
        networks_used:   ['VHF Voice', 'HF', 'ACARS', 'ADS-B', 'ATIS', 'FMS/GPS', 'Satellite IFC'],
        freq_bands:      ['VHF 118-137 MHz', 'HF 2-30 MHz', 'L-Band (Satellite)', 'GPS L1/L2'],
        regulators: {
            global:  'ICAO — منظمة الطيران المدني الدولي',
            ksa:     'GACA — الهيئة العامة للطيران المدني',
            region:  'ACAC — مجلس الطيران المدني العربي',
        },
        standards:   ['ICAO Annexes 1-19', 'IATA Resolutions', 'ARP 4761', 'DO-178C'],
        emergency:   'ترددات الطوارئ: 121.5 MHz (صوت) + 406 MHz (ELT)',
        sharia_note: 'الطيران المدني — التجارة الجوية الحلال — نقل الحجاج والمعتمرين',
        quran_ref:   { ref: 'الملك:١٩', text: 'أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ' },
    },

    // ─── 🚢 مجتمع البحر والملاحة ─────────────────────────────
    MARITIME: {
        id:       'MARITIME',
        nameAr:   'مجتمع البحر والملاحة',
        nameEn:   'Maritime Community',
        icon:     '🚢',
        description: 'الملاحة البحرية التجارية والبحث والإنقاذ وصيد الأسماك',
        members: {
            shipping_cos:    { nameAr: 'شركات الشحن',              examples: ['Bahri (NSCSA)', 'CMA CGM', 'Maersk', 'MSC'] },
            ports:           { nameAr: 'إدارات الموانئ',            examples: ['MAWANI', 'ميناء جدة', 'الدمام'] },
            coast_guard:     { nameAr: 'خفر السواحل',               examples: ['حرس الحدود البحري السعودي'] },
            fishermen:       { nameAr: 'مجتمع الصيادين',             examples: ['غرفة الصيد السعودية'] },
            naval:           { nameAr: 'القوات البحرية',             examples: ['القوات البحرية السعودية'] },
            SAR:             { nameAr: 'البحث والإنقاذ البحري',     examples: ['MRCC جدة', 'MRCC الدمام'] },
            pilots:          { nameAr: 'الرباني البحري (Pilot)',     examples: ['موانئ المملكة'] },
        },
        networks_used:   ['AIS', 'VHF CH16', 'GMDSS', 'NAVTEX', 'Inmarsat', 'Starlink Maritime', 'GPS/GNSS', 'VTS'],
        freq_bands:      ['VHF 156-174 MHz', 'MF/HF 2-30 MHz', 'L-Band (Inmarsat)', 'Ku/Ka (VSAT)'],
        regulators: {
            global:  'IMO — المنظمة البحرية الدولية',
            ksa:     'هيئة الموانئ MAWANI + خفر السواحل',
            region:  'AMO — المنظمة العربية البحرية',
        },
        standards:   ['SOLAS', 'MARPOL', 'STCW', 'ISM Code', 'ISPS Code'],
        emergency:   'EPIRB 406 MHz + DSC CH70 + NAVTEX 518 kHz',
        sharia_note: 'التجارة البحرية — ذُكرت السفن في القرآن الكريم في ١٢ موضعاً',
        quran_ref:   { ref: 'يونس:٢٢', text: 'هُوَ الَّذِي يُسَيِّرُكُمْ فِي الْبَرِّ وَالْبَحْرِ' },
    },

    // ─── 🚛 مجتمع النقل البري ─────────────────────────────────
    LAND_TRANSPORT: {
        id:       'LAND_TRANSPORT',
        nameAr:   'مجتمع النقل البري',
        nameEn:   'Land Transport Community',
        icon:     '🚛',
        description: 'الشاحنات والنقل العام والسيارات والطرق الذكية',
        members: {
            trucking:      { nameAr: 'شركات شحن البضائع البري',    examples: ['Bahri Logistics', 'Al-Faris', 'SNAS'] },
            public_transit:{ nameAr: 'النقل العام',                examples: ['هيئة النقل العام الرياض', 'مترو الرياض'] },
            ride_hailing:  { nameAr: 'التنقل الذكي',               examples: ['Uber', 'Careem', 'InDriver'] },
            customs:       { nameAr: 'الجمارك',                    examples: ['Customs KSA — Zatca'] },
            roads_auth:    { nameAr: 'هيئات إدارة الطرق',          examples: ['MOMRA', 'وزارة النقل'] },
        },
        networks_used:   ['4G/5G', 'GPS تتبع', 'ELD', 'DSRC/C-V2X', 'RFID', 'IoT NB-IoT'],
        freq_bands:      ['700 MHz – 3.5 GHz (LTE/5G)', '5.9 GHz (V2X)', 'UHF RFID'],
        regulators: {
            ksa:     'وزارة النقل والخدمات اللوجستية',
            region:  'الاتحاد العربي للنقل البري',
        },
        standards:   ['ISO 15118', 'ETSI ITS', 'SAE J2945'],
        sharia_note: 'النقل والتجارة — الإسلام يشجع التجارة البرية — قوافل قريش (رحلة الصيف والشتاء)',
        quran_ref:   { ref: 'قريش:١-٢', text: 'لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ' },
    },

    // ─── 🚂 مجتمع السكك الحديدية ─────────────────────────────
    RAILWAY: {
        id:       'RAILWAY',
        nameAr:   'مجتمع السكك الحديدية',
        nameEn:   'Railway Community',
        icon:     '🚄',
        description: 'القطارات والمترو وسكك الشحن',
        members: {
            national_rail:   { nameAr: 'السكك الحديدية الوطنية',    examples: ['SAR — الخطوط الحديدية السعودية'] },
            metro:           { nameAr: 'مترو المدن',                 examples: ['مترو الرياض', 'مترو مكة'] },
            haramain:        { nameAr: 'قطار الحرمين السريع',         speed: '300 كم/ساعة', route: 'جدة-مكة-المدينة' },
            freight_rail:    { nameAr: 'شحن بالقطار',               examples: ['SAR شبكة الشرق'] },
        },
        networks_used:   ['GSM-R', 'FRMCS (5G Rail)', 'TETRA', 'Balise (ATP)', 'LAN على المتن', 'CCTV IP'],
        freq_bands:      ['876-915 MHz (GSM-R)', '1.9 GHz (FRMCS)', '380-400 MHz (TETRA)'],
        regulators: {
            ksa:     'هيئة الربط الوطني + وزارة النقل',
        },
        standards:   ['EN 50126 (RAMS)', 'EN 50128 (Software)', 'EN 50129 (Safety)', 'ETSI GSM-R'],
        safety_level: 'SIL-4 (أعلى مستوى أمان)',
        quran_ref:   { ref: 'الإسراء:٣٤', text: 'وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا' },
    },

    // ─── 🆘 مجتمع الطوارئ والأزمات ───────────────────────────
    EMERGENCY: {
        id:       'EMERGENCY',
        nameAr:   'مجتمع الطوارئ والأزمات',
        nameEn:   'Emergency & Crisis Community',
        icon:     '🆘',
        description: 'الخدمات الطارئة التي تعمل في الظروف الاستثنائية',
        members: {
            police:       { nameAr: 'الشرطة',           examples: ['الأمن العام', 'شرطة المنطقة'] },
            civil_defence:{ nameAr: 'الدفاع المدني',    examples: ['الدفاع المدني السعودي'] },
            medical:      { nameAr: 'الإسعاف الطبي',    examples: ['الهلال الأحمر السعودي', '911'] },
            military:     { nameAr: 'القوات المسلحة',   examples: ['وزارة الدفاع'] },
            sar_teams:    { nameAr: 'فرق البحث والإنقاذ', examples: ['فرق الإنقاذ الجبلي', 'الغوص'] },
        },
        networks_used:   ['TETRA P25', 'P25', 'VHF/UHF تناظري', '4G LTE مخصص', 'فضائي SAR', 'مشاة EPIRB'],
        freq_bands:      ['380-400 MHz (TETRA)', '700 MHz (LTE Public Safety)', 'VHF/UHF'],
        priority_access: 'ABSOLUTE — لا يُحجب أبداً',
        regulators: {
            ksa:     'وزارة الداخلية + رئاسة أمن الدولة',
        },
        standards:   ['ETSI TETRA EN 300 392', 'P25 TIA-102', 'FirstNet (مرجع)'],
        encryption:  'MANDATORY — E2E',
        quran_ref:   { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },

    // ─── ⚡ مجتمع الطاقة والصناعة ────────────────────────────
    ENERGY_INDUSTRY: {
        id:       'ENERGY_INDUSTRY',
        nameAr:   'مجتمع الطاقة والصناعة',
        nameEn:   'Energy & Industrial Community',
        icon:     '⚡',
        description: 'النفط والغاز والكهرباء والمصافي والمصانع',
        members: {
            aramco:       { nameAr: 'أرامكو السعودية', role: 'النفط والغاز' },
            sec:          { nameAr: 'الشركة السعودية للكهرباء (SEC)' },
            sabic:        { nameAr: 'SABIC — البتروكيماويات' },
            maaden:       { nameAr: 'معادن — التعدين' },
            sadara:       { nameAr: 'صدارة — مجمع بتروكيماوي' },
        },
        networks_used:   ['SCADA/DCS', 'WirelessHART', 'ISA100.11a', 'OPC-UA', 'IEC 61850', 'IEC 60870', 'TETRA', 'LoRaWAN (حقول النفط)'],
        protocols:       ['Modbus', 'DNP3', 'IEC 61850 GOOSE/MMS', 'OPC-UA'],
        security:        'OT Security — Purdue Model — Zone Segmentation',
        standards:       ['IEC 62443 (OT Security)', 'NERC CIP', 'ISA/IEC 62443'],
        ksa_body:        'الهيئة الوطنية للأمن السيبراني (NCA) — حماية البنية التحتية الحيوية',
        quran_ref:       { ref: 'الملك:١٥', text: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا' },
    },

    // ─── 🌾 مجتمع الزراعة والمياه ────────────────────────────
    AGRI_WATER: {
        id:       'AGRI_WATER',
        nameAr:   'مجتمع الزراعة والمياه',
        nameEn:   'Agriculture & Water Community',
        icon:     '🌾',
        description: 'الزراعة الذكية وإدارة المياه والبيئة',
        members: {
            mewa:    { nameAr: 'وزارة البيئة والمياه والزراعة' },
            nwc:     { nameAr: 'المياه الوطنية NWC' },
            farms:   { nameAr: 'المزارع والمزارعون' },
        },
        networks_used:   ['LoRaWAN', 'NB-IoT', 'GPS تتبع الآليات', 'SCADA الري', 'الطائرات المسيّرة'],
        use_case: ['الري الذكي', 'رصد التربة', 'توزيع المياه', 'الزراعة الدقيقة'],
        quran_ref: { ref: 'الأنعام:٩٩', text: 'وَهُوَ الَّذِي أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ نَبَاتَ كُلِّ شَيْءٍ' },
    },

    // ─── 🏙️ مجتمع المدن الذكية ────────────────────────────────
    SMART_CITIES: {
        id:       'SMART_CITIES',
        nameAr:   'مجتمع المدن الذكية',
        nameEn:   'Smart Cities Community',
        icon:     '🏙️',
        description: 'التحول الرقمي للمدن — رؤية 2030',
        initiatives: {
            NEOM:    { nameAr: 'نيوم — المدينة المستقبلية', tech: ['5G كامل', 'AI', 'IoT', 'روبوتات', 'سيارات ذاتية'] },
            RIYADH:  { nameAr: 'الرياض الذكية', tech: ['مترو', 'شبكة مرور ذكية', 'كاميرات AI'] },
            QIDDIYA: { nameAr: 'القدية — مدينة الترفيه', tech: ['5G', 'XR', 'متصل بالكامل'] },
            DIRIYAH: { nameAr: 'الدرعية — السياحة التراثية الذكية', tech: ['AR/VR', 'إضاءة ذكية', 'تطبيقات مرشد ذكي'] },
        },
        networks_used:   ['5G SA (Standalone)', 'Wi-Fi 6E', 'LoRaWAN', 'NB-IoT', 'V2X', 'فضائي LEO'],
        regulators: {
            ksa: 'هيئة الاتصالات وتقنية المعلومات (CITC) + وزارة الاتصالات MCIT',
        },
        quran_ref: { ref: 'الحج:٤٦', text: 'أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ يَعْقِلُونَ بِهَا' },
    },

    // ─── 🕌 مجتمع الحج والعمرة ────────────────────────────────
    HAJJ_UMRAH: {
        id:       'HAJJ_UMRAH',
        nameAr:   'مجتمع الحج والعمرة',
        nameEn:   'Hajj & Umrah Community',
        icon:     '🕌',
        description: 'إدارة اتصالات أكبر تجمع بشري سنوي في العالم',
        members: {
            ministry:   { nameAr: 'وزارة الحج والعمرة' },
            operators:  { nameAr: 'المشغلون المعتمدون' },
            transport:  { nameAr: 'المشاعة للخدمات — المشاعر المقدسة' },
            security:   { nameAr: 'رئاسة أمن الحرمين' },
        },
        challenges:      ['2.5 مليون حاج في مكة المكرمة', 'أعلى كثافة اتصالات في العالم', 'شبكة مؤقتة سنوية'],
        networks_used:   ['5G كثيفة التوزيع في المشاعر', 'WiFi مكثف', 'تتبع GPS للحجاج', 'TETRA للأمن', 'نظام التعريف الإلكتروني للحجاج'],
        ksa_innovation:  'نظام الحج الذكي — تطبيق نسك + سوار GPS + بوابات RFID',
        quran_ref:       { ref: 'الحج:٢٧', text: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════
function getCommunities() {
    return {
        nameAr:      'مجتمعات شبكات الاتصالات',
        count:       Object.keys(TELECOM_COMMUNITIES).length,
        communities: Object.values(TELECOM_COMMUNITIES),
        verse: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
    };
}

function getCommunity(id) {
    return TELECOM_COMMUNITIES[id.toUpperCase()] || null;
}

function getCommunitiesByNetwork(networkType) {
    return Object.values(TELECOM_COMMUNITIES).filter(
        (c) => c.networks_used && c.networks_used.some(
            (n) => n.toLowerCase().includes(networkType.toLowerCase())
        )
    );
}

module.exports = {
    TELECOM_COMMUNITIES,
    getCommunities,
    getCommunity,
    getCommunitiesByNetwork,
};
