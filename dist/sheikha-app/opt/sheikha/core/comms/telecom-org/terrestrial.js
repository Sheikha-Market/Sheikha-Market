/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TERRESTRIAL NETWORKS — الشبكات الأرضية                                     ║
 * ║                                                                              ║
 * ║  تصنيف كامل للشبكات الأرضية:                                                ║
 * ║  • الألياف الضوئية  • 5G/4G/3G  • ميكروويف  • Wi-Fi  • سكك حديدية         ║
 * ║  • الطرق البرية    • الشبكات الحكومية  • الطوارئ                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ" — الذاريات:٢٠
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// تصنيفات التقنيات الأرضية
// ═══════════════════════════════════════════════════════════════
const TERRESTRIAL_TECHNOLOGIES = {

    // ─── الألياف الضوئية ──────────────────────────────────────
    FIBER_OPTIC: {
        id:       'FIBER_OPTIC',
        nameAr:   'الألياف الضوئية',
        nameEn:   'Fiber Optic',
        icon:     '🔆',
        category: 'WIRED',
        subtypes: {
            FTTH: { nameAr: 'ألياف حتى المنزل', speed: '10 Gbps+', latency: '< 1ms' },
            FTTB: { nameAr: 'ألياف حتى المبنى', speed: '1 Gbps',   latency: '< 2ms' },
            FTTC: { nameAr: 'ألياف حتى الخزانة', speed: '300 Mbps', latency: '< 5ms' },
            BACKBONE: { nameAr: 'العمود الفقري', speed: '100 Tbps', latency: '< 10ms' },
        },
        standards:   ['ITU-T G.652', 'ITU-T G.655', 'IEEE 802.3'],
        frequency:   'N/A — ضوء مرئي / IR',
        typical_use: ['الإنترنت المنزلي', 'الشركات', 'مراكز البيانات', 'الحكومة'],
        reliability: 0.9999,   // 99.99% uptime
        security:    'HIGH',
        ksa_operator: ['STC', 'Mobily', 'Zain'],
        regulatory:  'CITC — هيئة الاتصالات وتقنية المعلومات',
        quran_ref:   { ref: 'الذاريات:٢٠', text: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ' },
    },

    // ─── الجيل الخامس 5G ──────────────────────────────────────
    CELLULAR_5G: {
        id:       'CELLULAR_5G',
        nameAr:   'الجيل الخامس 5G',
        nameEn:   '5G Cellular',
        icon:     '📶',
        category: 'WIRELESS',
        bands: {
            LOW:  { range: '600 MHz – 1 GHz',   speed: '100 Mbps',  coverage: 'واسع جداً',  latency: '10ms' },
            MID:  { range: '2.5 – 3.7 GHz',     speed: '1 Gbps',    coverage: 'متوسط',      latency: '4ms'  },
            HIGH: { range: '24 – 100 GHz (mmWave)', speed: '10 Gbps', coverage: 'قصير',     latency: '1ms'  },
        },
        usecases: ['الاتصالات المتنقلة', 'إنترنت الأشياء', 'السيارات الذاتية', 'الجراحة عن بُعد'],
        standards:   ['3GPP Release 15/16/17/18', 'IMT-2020'],
        frequency:   'مجموعة من الترددات: Sub-6GHz + mmWave',
        reliability: 0.9995,
        security:    'HIGH',
        ksa_operator: ['STC', 'Mobily', 'Zain'],
        ksa_coverage_2025: '85%',
        regulatory:  'CITC',
        quran_ref:   { ref: 'يونس:٢٤', text: 'زَيَّنَّاهَا وَظَنَّ أَهْلُهَا أَنَّهُمْ قَادِرُونَ عَلَيْهَا' },
    },

    // ─── الجيل الرابع 4G LTE ──────────────────────────────────
    CELLULAR_4G: {
        id:       'CELLULAR_4G',
        nameAr:   'الجيل الرابع 4G/LTE',
        nameEn:   '4G LTE',
        icon:     '📱',
        category: 'WIRELESS',
        speed:    { downlink: '150 Mbps', uplink: '50 Mbps' },
        latency:  '30-50ms',
        frequency: '700MHz / 1800MHz / 2100MHz / 2600MHz',
        standards: ['3GPP Release 8-12', 'LTE-Advanced'],
        reliability: 0.999,
        security:    'MEDIUM-HIGH',
        ksa_operator: ['STC', 'Mobily', 'Zain', 'Virgin Mobile'],
        ksa_coverage_2025: '99%',
        regulatory:  'CITC',
    },

    // ─── الميكروويف الأرضي ────────────────────────────────────
    MICROWAVE_TERRESTRIAL: {
        id:       'MICROWAVE_TERRESTRIAL',
        nameAr:   'الميكروويف الأرضي',
        nameEn:   'Terrestrial Microwave',
        icon:     '📡',
        category: 'WIRELESS_FIXED',
        type:     'Point-to-Point / Point-to-Multipoint',
        frequency: '6 GHz – 86 GHz',
        speed:    { max: '10 Gbps' },
        range:    'حتى 50 كم بين المحطتين',
        latency:  '< 1ms',
        use_case: ['ربط برج الجوال بالشبكة الأساسية', 'الوصلات الاحتياطية', 'المناطق النائية'],
        standards: ['ITU-R F.383', 'ETSI EN 302 217'],
        reliability: 0.9999,
        security:    'MEDIUM',
        regulatory:  'CITC',
        quran_ref:   { ref: 'النمل:٢٧', text: 'قَالَ سَنَنظُرُ أَصَدَقْتَ أَمْ كُنتَ مِنَ الْكَاذِبِينَ' },
    },

    // ─── شبكة اللاسلكي المحلي Wi-Fi ──────────────────────────
    WIFI: {
        id:       'WIFI',
        nameAr:   'شبكة Wi-Fi',
        nameEn:   'Wi-Fi / WLAN',
        icon:     '📶',
        category: 'WIRELESS_LOCAL',
        versions: {
            'WiFi-6 (802.11ax)':  { speed: '9.6 Gbps',  frequency: '2.4/5/6 GHz', latency: '< 5ms' },
            'WiFi-5 (802.11ac)':  { speed: '3.5 Gbps',  frequency: '5 GHz',        latency: '< 10ms' },
            'WiFi-4 (802.11n)':   { speed: '600 Mbps',  frequency: '2.4/5 GHz',    latency: '< 20ms' },
        },
        standards: ['IEEE 802.11', 'WPA3'],
        range:    '30-100م داخلي / حتى 300م خارجي',
        use_case: ['المنازل', 'الشركات', 'المطارات', 'الفنادق', 'المولات'],
        security: 'MEDIUM (مع WPA3: HIGH)',
        regulatory: 'CITC (بدون ترخيص في نطاقات ISM)',
    },

    // ─── شبكات السكك الحديدية (GSM-R / FRMCS) ────────────────
    RAILWAY: {
        id:       'RAILWAY',
        nameAr:   'شبكات السكك الحديدية',
        nameEn:   'Railway Communications (GSM-R / FRMCS)',
        icon:     '🚄',
        category: 'SPECIALIZED_TRANSPORT',
        technologies: {
            GSM_R: {
                nameAr: 'GSM للسكك الحديدية',
                frequency: '876-915 MHz',
                use: 'الاتصال الصوتي بين القطار والتحكم',
                standard: 'EN 301 515',
            },
            FRMCS: {
                nameAr: 'FRMCS — مستقبل السكك الحديدية (5G)',
                frequency: '1.9 GHz + 4.9 GHz',
                use: 'التحكم التلقائي + الفيديو + IoT',
                standard: '3GPP Release 16',
            },
            ATO: {
                nameAr: 'التشغيل التلقائي للقطار',
                type: 'بيانات عالي الموثوقية',
                safety_level: 'SIL-4',
            },
        },
        ksa_networks: ['قطار الحرمين السريع', 'مترو الرياض', 'SAR الخطوط الحديدية'],
        use_case: ['التحكم في القطارات', 'السلامة', 'تذاكر إلكترونية', 'إعلانات المحطات'],
        security: 'CRITICAL',
        reliability: 0.99999,
        quran_ref: { ref: 'الإسراء:٣٤', text: 'وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا' },
    },

    // ─── شبكات الطوارئ (TETRA / P25) ─────────────────────────
    EMERGENCY_TETRA: {
        id:       'EMERGENCY_TETRA',
        nameAr:   'شبكات الطوارئ TETRA',
        nameEn:   'Emergency / TETRA / P25',
        icon:     '🚨',
        category: 'CRITICAL_INFRASTRUCTURE',
        technologies: {
            TETRA: {
                nameAr: 'TETRA — الراديو الرقمي للطوارئ',
                frequency: '380-400 MHz / 870-876 MHz',
                standard: 'ETSI EN 300 392',
                features: ['تشفير E2E', 'اتصال مباشر بدون شبكة', 'مجموعات الاتصال', 'أولوية المكالمات'],
            },
            DMR: {
                nameAr: 'DMR — راديو محمول رقمي',
                frequency: 'VHF / UHF',
                standard: 'ETSI TS 102 361',
            },
        },
        users: ['الشرطة', 'الإطفاء', 'الإسعاف', 'الدفاع المدني', 'وزارة الداخلية'],
        priority: 'ABSOLUTE',
        encryption: 'MANDATORY',
        reliability: 0.99999,
        security: 'CRITICAL',
        ksa_body: 'رئاسة أمن الدولة + وزارة الداخلية',
        quran_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },

    // ─── شبكة IoT الأرضية (LoRaWAN / NB-IoT) ────────────────
    IOT_TERRESTRIAL: {
        id:       'IOT_TERRESTRIAL',
        nameAr:   'إنترنت الأشياء الأرضي',
        nameEn:   'Terrestrial IoT (LoRaWAN / NB-IoT)',
        icon:     '🌐',
        category: 'IOT',
        technologies: {
            LORAWAN: {
                nameAr: 'LoRaWAN — الإنترنت الأشياء بعيد المدى',
                frequency: '863-870 MHz (EU) / 915 MHz (US)',
                range: 'حتى 15 كم ريفي / 3-5 كم حضري',
                speed: '250 bps – 11 kbps',
                battery: 'سنوات',
                standard: 'LoRa Alliance',
            },
            NB_IOT: {
                nameAr: 'NB-IoT — إنترنت الأشياء النطاق الضيق',
                frequency: 'ترددات LTE',
                range: 'حتى 10 كم',
                speed: '200 kbps',
                battery: '10+ سنوات',
                standard: '3GPP Release 13',
            },
        },
        use_case: ['العدادات الذكية', 'الزراعة الذكية', 'التتبع اللوجستي', 'المدن الذكية'],
        security: 'MEDIUM',
        regulatory: 'CITC',
    },

    // ─── الشبكة الحكومية الأرضية (GovNet) ────────────────────
    GOVNET: {
        id:       'GOVNET',
        nameAr:   'الشبكة الحكومية الأرضية',
        nameEn:   'Government Network (GovNet)',
        icon:     '🏛️',
        category: 'GOVERNMENT',
        description: 'شبكة مخصصة للجهات الحكومية السعودية — معزولة عن الإنترنت العام',
        connectivity: ['ألياف ضوئية مخصصة', 'ميكروويف احتياطي', 'MPLS VPN'],
        security: 'CLASSIFIED',
        encryption: 'NATIONAL_CRYPTO',
        users: ['الوزارات', 'هيئات حكومية', 'المحاكم', 'الجيش والأمن'],
        standards: ['NCA ECC', 'NCA CCC', 'ISO 27001'],
        ksa_body: 'الهيئة الوطنية للأمن السيبراني (NCA)',
        reliability: 0.99999,
        quran_ref: { ref: 'النساء:٥٩', text: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// تصنيف حسب الفئة
// ═══════════════════════════════════════════════════════════════
const TERRESTRIAL_CATEGORIES = {
    WIRED:                  { nameAr: 'سلكي',                   techs: ['FIBER_OPTIC'] },
    WIRELESS:               { nameAr: 'لاسلكي متنقل',           techs: ['CELLULAR_5G', 'CELLULAR_4G'] },
    WIRELESS_FIXED:         { nameAr: 'لاسلكي ثابت',            techs: ['MICROWAVE_TERRESTRIAL'] },
    WIRELESS_LOCAL:         { nameAr: 'لاسلكي محلي',            techs: ['WIFI'] },
    SPECIALIZED_TRANSPORT:  { nameAr: 'نقل متخصص',              techs: ['RAILWAY'] },
    CRITICAL_INFRASTRUCTURE:{ nameAr: 'بنية تحتية حرجة',        techs: ['EMERGENCY_TETRA'] },
    IOT:                    { nameAr: 'إنترنت الأشياء',          techs: ['IOT_TERRESTRIAL'] },
    GOVERNMENT:             { nameAr: 'حكومي',                  techs: ['GOVNET'] },
};

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════
function getTerrestrialNetworks() {
    return {
        domain:      'TERRESTRIAL',
        nameAr:      'الشبكات الأرضية',
        icon:        '🗺️',
        count:       Object.keys(TERRESTRIAL_TECHNOLOGIES).length,
        technologies: Object.values(TERRESTRIAL_TECHNOLOGIES),
        categories:   TERRESTRIAL_CATEGORIES,
        verse: { ref: 'الذاريات:٢٠', text: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ' },
    };
}

function getTerrestrialTech(id) {
    return TERRESTRIAL_TECHNOLOGIES[id.toUpperCase()] || null;
}

module.exports = {
    TERRESTRIAL_TECHNOLOGIES,
    TERRESTRIAL_CATEGORIES,
    getTerrestrialNetworks,
    getTerrestrialTech,
};
