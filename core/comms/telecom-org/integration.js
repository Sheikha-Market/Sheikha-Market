/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  NETWORK INTEGRATION — التكاملات بين الشبكات                                ║
 * ║                                                                              ║
 * ║  الجسور والبروتوكولات التي تربط:                                             ║
 * ║  أرضي ↔ فضائي  |  طيران ↔ بحر  |  حكومي ↔ تجاري  |  طوارئ ↔ عام          ║
 * ║  Handoff — Roaming — Protocol Bridges — Unified C2                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة:٢
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// جسور التكامل بين الشبكات
// ═══════════════════════════════════════════════════════════════
const INTEGRATION_BRIDGES = {

    // ─── أرضي ↔ فضائي ─────────────────────────────────────────
    TERRESTRIAL_SATELLITE: {
        id:       'TERRESTRIAL_SATELLITE',
        nameAr:   'تكامل الأرضي مع الفضائي',
        nameEn:   'Terrestrial ↔ Satellite Integration',
        icon:     '🌍🛰️',
        flow:     'أرضي ↔ فضائي (ثنائي الاتجاه)',
        scenarios: [
            {
                name:     'الاستمرارية في المناطق النائية',
                nameAr:   'Terrestrial Failover to Satellite',
                trigger:  'انقطاع الشبكة الأرضية',
                from:     '4G/Fiber',
                to:       'LEO Starlink / Inmarsat',
                latency_impact: '+40ms',
                use_case: 'الشاحنات في الصحراء / السفن / القواعد النفطية',
            },
            {
                name:     'Backhaul الجوال عبر فضائي',
                nameAr:   'Mobile Backhaul via Satellite',
                trigger:  'مناطق بلا بنية تحتية أرضية',
                from:     'BTS 4G/5G',
                to:       'VSAT GEO / LEO',
                use_case: 'مواقع البناء، المخيمات، المناطق الحدودية',
            },
            {
                name:     'تحديث GPS من محطات أرضية',
                nameAr:   'SBAS Ground Enhancement',
                flow:     'محطات أرضية → GEO → GPS receivers',
                purpose:  'تحسين دقة GPS إلى 1-3م',
                examples: ['EGNOS (أوروبا)', 'WAAS (أمريكا)', 'GAGAN (الهند)'],
            },
        ],
        protocols: ['3GPP NTN (Non-Terrestrial Networks)', '5G-NR + Satellite', 'DVB-S2 Return Channel'],
        ksa_relevance: 'غطاء الصحراء الكبرى — ربط القرى النائية — حرس الحدود',
        quran_ref: { ref: 'الأنعام:٩٧', text: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا' },
    },

    // ─── طيران ↔ بحر (الشواطئ والمطارات الساحلية) ─────────────
    AVIATION_MARITIME: {
        id:       'AVIATION_MARITIME',
        nameAr:   'تكامل الطيران مع البحر',
        nameEn:   'Aviation ↔ Maritime Integration',
        icon:     '✈️🚢',
        flow:     'طيران ↔ بحر',
        scenarios: [
            {
                name:     'SAR — بحث وإنقاذ مشترك',
                nameAr:   'عمليات البحث والإنقاذ المشتركة',
                actors:   ['مروحيات SAR', 'سفن الإنقاذ', 'خفر السواحل', 'طائرات MRCC'],
                shared_freqs: ['121.5 MHz (طوارئ جوي)', '156.8 MHz (CH16 بحري)', '406 MHz (EPIRB/ELT)'],
                coordination: 'MRCC (مركز التنسيق البحري) + ARCC (مركز تنسيق إنقاذ جوي)',
                ksa_centers:  ['MRCC جدة (البحر الأحمر)', 'MRCC الدمام (الخليج)'],
            },
            {
                name:     'مراقبة الأجواء الساحلية',
                nameAr:   'Coastal Air-Sea Surveillance',
                tech:     'Radar ATC مزدوج (جوي + بحري) في المطارات الساحلية',
                examples: ['مطار جدة — البحر الأحمر مباشرةً'],
            },
            {
                name:     'تزويد بالوقود في البحر (قياس)',
                nameAr:   'Fuel Supply Coordination',
                flow:     'ناقلة وقود (بحر) → ميناء → مطار',
                comm:     'AIS + ACARS + نظام OPIS للوقود',
            },
        ],
        protocols: ['ICAO Annex 12 (SAR)', 'IAMSAR Manual', 'IMO SAR Convention'],
        quran_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },

    // ─── لوجستي متعدد الوسائط ─────────────────────────────────
    MULTIMODAL_LOGISTICS: {
        id:       'MULTIMODAL_LOGISTICS',
        nameAr:   'التكامل اللوجستي متعدد الوسائط',
        nameEn:   'Multimodal Logistics Integration',
        icon:     '📦✈️🚢🚛',
        flow:     'طيران ↔ بحر ↔ بر ↔ سكك',
        description: 'تتبع البضاعة عبر وسائل نقل متعددة بلا انقطاع',
        scenarios: [
            {
                name:    'تتبع الحاوية من المنشأ إلى المقصد',
                journey: 'مصنع → شاحنة → ميناء → سفينة → ميناء → قطار → مستودع → شاحنة → عميل',
                tech:    'RFID + GPS + AIS + EDI (Electronic Data Interchange)',
                standard: 'ISO 6346 (تعريف الحاوية) + EDIFACT',
            },
            {
                name:    'تخليص جمركي إلكتروني',
                tech:    'ملف EDI — تبادل بيانات الجمارك قبل الوصول',
                ksa:     'Fasah — منصة التخليص الجمركي السعودية (ZATCA)',
            },
            {
                name:    'إدارة سلسلة التبريد',
                nameAr:  'Cold Chain Management',
                sensors: 'IoT درجة حرارة + رطوبة — NB-IoT / LoRaWAN',
                realtime: 'تنبيهات فورية عند انحراف درجة الحرارة',
                use_case: 'الأدوية + المواد الغذائية الطازجة',
            },
        ],
        platforms: ['SAP TM', 'Oracle SCM Cloud', 'Maersk TradeLens (blockchain)', 'Fasah KSA'],
        ksa_vision: 'رؤية 2030 — تحويل المملكة إلى مركز لوجستي عالمي',
        quran_ref: { ref: 'سبأ:١٨', text: 'وَجَعَلْنَا بَيْنَهُمْ وَبَيْنَ الْقُرَى الَّتِي بَارَكْنَا فِيهَا قُرًى ظَاهِرَةً' },
    },

    // ─── شبكات الطوارئ المتكاملة ──────────────────────────────
    EMERGENCY_INTEGRATION: {
        id:       'EMERGENCY_INTEGRATION',
        nameAr:   'تكامل شبكات الطوارئ',
        nameEn:   'Integrated Emergency Networks',
        icon:     '🆘📡',
        flow:     'طوارئ ↔ كل شبكة',
        principle: 'في حالة الطوارئ — الأولوية المطلقة على كل الشبكات',
        mechanisms: [
            {
                name:    'Priority Access (QCI-1)',
                nameAr:  'الوصول ذو الأولوية في 4G/5G',
                tech:    'LTE QCI 1 — أقل تأخير + أعلى أولوية',
                use:     'مكالمات الطوارئ من هاتف جوال',
            },
            {
                name:    'MCX (Mission Critical Services)',
                nameAr:  '3GPP MCX — خدمات الاتصال الحرج للمهمة',
                includes: ['MCPTT (صوت)', 'MCVideo (فيديو)', 'MCData (بيانات)'],
                runs_on:  '4G LTE / 5G NR',
                replaces: 'TETRA في المستقبل',
            },
            {
                name:    'PSTN Fallback',
                nameAr:  'الانتقال للشبكة الهاتفية التقليدية',
                when:    'انقطاع الشبكات الرقمية',
                note:    'خط أحمر مباشر بين مراكز القيادة',
            },
            {
                name:    'Satellite Emergency Backup',
                nameAr:  'نسخة احتياطية فضائية للطوارئ',
                tech:    'Iridium GMDSS + COSPAS-SARSAT',
                coverage: 'قطبي كامل — لا نقطة عمياء',
            },
        ],
        ksa_emergency: {
            unified_number: '911',
            platform:       'منظومة 911 المتكاملة (صوت + موقع + فيديو)',
            agencies:       ['الشرطة 999', 'الإسعاف 997', 'الإطفاء 998', 'الدفاع المدني 998'],
        },
        quran_ref: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    },

    // ─── الشبكة الحكومية ↔ التجارية ──────────────────────────
    GOVERNMENT_COMMERCIAL: {
        id:       'GOVERNMENT_COMMERCIAL',
        nameAr:   'تكامل الحكومي مع التجاري',
        nameEn:   'Government ↔ Commercial Integration',
        icon:     '🏛️🏢',
        flow:     'حكومي → تجاري (أحادي الاتجاه للبيانات الحساسة)',
        apis_shared: [
            { name: 'Absher', nameAr: 'أبشر — الهوية الرقمية',         type: 'REST API', auth: 'OAuth2' },
            { name: 'Zatca',  nameAr: 'الزكاة والجمارك — الفاتورة الإلكترونية', type: 'API FATOORAH', auth: 'Certificate' },
            { name: 'Mudad',  nameAr: 'مُدد — حماية الأجور',            type: 'REST', auth: 'API Key' },
            { name: 'Qiwa',   nameAr: 'قوى — سوق العمل',               type: 'REST', auth: 'OAuth2' },
            { name: 'Nafath', nameAr: 'نفاذ — التوثيق الوطني الموحّد', type: 'OIDC/OAuth2', auth: 'Biometric' },
            { name: 'SADAD',  nameAr: 'سداد — المدفوعات الحكومية',       type: 'ISO 8583 / REST', auth: 'Certificate' },
        ],
        security_model: 'API Gateway متخصص + Zero Trust بين القطاعات',
        standards:      ['NDMO', 'NCA ECC', 'ISO 27001', 'PDPL'],
        ksa_platform:   'ZATCA + Saudi Arabia Government Cloud (GCloud)',
        quran_ref:      { ref: 'النساء:٥٩', text: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ' },
    },

    // ─── IoT الشامل ────────────────────────────────────────────
    IOT_INTEGRATION: {
        id:       'IOT_INTEGRATION',
        nameAr:   'تكامل إنترنت الأشياء الشامل',
        nameEn:   'Comprehensive IoT Integration',
        icon:     '🌐📡',
        flow:     'أجهزة → بوابات → السحابة → التطبيقات',
        layers: {
            PERCEPTION:  { nameAr: 'طبقة الاستشعار',   tech: ['مستشعرات', 'RFID', 'كاميرات', 'GPS'] },
            NETWORK:     { nameAr: 'طبقة الشبكة',      tech: ['LoRaWAN', 'NB-IoT', '5G', 'Wi-Fi', 'Zigbee'] },
            MIDDLEWARE:  { nameAr: 'طبقة الوسيط',      tech: ['MQTT', 'CoAP', 'AMQP', 'AWS IoT', 'Azure IoT Hub'] },
            APPLICATION: { nameAr: 'طبقة التطبيق',     tech: ['Dashboards', 'AI Analytics', 'ERP Integration'] },
        },
        protocols: ['MQTT (الأكثر شيوعاً)', 'CoAP', 'AMQP', 'HTTP/REST', 'LwM2M'],
        security:  'TLS 1.3 + PKI للأجهزة + Zero Trust + OTA Updates المشفرة',
        ksa_projects: ['NEOM IoT', 'Aramco Smart Fields', 'SEC Smart Grid', 'مشروع نيوم'],
        quran_ref: { ref: 'الرعد:٨', text: 'اللَّهُ يَعْلَمُ مَا تَحْمِلُ كُلُّ أُنثَىٰ' },
    },
};

// ═══════════════════════════════════════════════════════════════
// مصفوفة التوافق بين الشبكات
// ═══════════════════════════════════════════════════════════════
const COMPATIBILITY_MATRIX = [
    //                        TERRESTRIAL  SATELLITE  AVIATION  MARITIME  RAILWAY  EMERGENCY
    { from: 'TERRESTRIAL', to: 'SATELLITE', bridge: 'NTN (3GPP)',        priority: 'HIGH'     },
    { from: 'TERRESTRIAL', to: 'AVIATION',  bridge: 'VHF Gateway',       priority: 'MEDIUM'   },
    { from: 'TERRESTRIAL', to: 'MARITIME',  bridge: 'AIS over IP',       priority: 'MEDIUM'   },
    { from: 'TERRESTRIAL', to: 'RAILWAY',   bridge: 'GSM-R / IP',        priority: 'HIGH'     },
    { from: 'TERRESTRIAL', to: 'EMERGENCY', bridge: 'TETRA/MCX',         priority: 'CRITICAL' },
    { from: 'SATELLITE',   to: 'AVIATION',  bridge: 'SATCOM ARINC 741',  priority: 'HIGH'     },
    { from: 'SATELLITE',   to: 'MARITIME',  bridge: 'VSAT / Inmarsat',   priority: 'HIGH'     },
    { from: 'SATELLITE',   to: 'EMERGENCY', bridge: 'COSPAS-SARSAT',     priority: 'CRITICAL' },
    { from: 'AVIATION',    to: 'MARITIME',  bridge: 'IAMSAR SAR',        priority: 'CRITICAL' },
    { from: 'AVIATION',    to: 'EMERGENCY', bridge: 'ELT 406 + VHF',     priority: 'CRITICAL' },
    { from: 'MARITIME',    to: 'EMERGENCY', bridge: 'EPIRB + GMDSS',     priority: 'CRITICAL' },
];

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════
function getIntegrations() {
    return {
        nameAr:      'التكاملات بين الشبكات',
        bridges:     Object.values(INTEGRATION_BRIDGES),
        matrix:      COMPATIBILITY_MATRIX,
        summary: {
            bridges_count:     Object.keys(INTEGRATION_BRIDGES).length,
            compatible_pairs:  COMPATIBILITY_MATRIX.length,
            critical_links:    COMPATIBILITY_MATRIX.filter((m) => m.priority === 'CRITICAL').length,
        },
        verse: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    };
}

function getBridge(id) {
    return INTEGRATION_BRIDGES[id.toUpperCase()] || null;
}

function getCompatibleNetworks(networkName) {
    return COMPATIBILITY_MATRIX.filter(
        (m) => m.from.toUpperCase() === networkName.toUpperCase() ||
               m.to.toUpperCase()   === networkName.toUpperCase()
    );
}

module.exports = {
    INTEGRATION_BRIDGES,
    COMPATIBILITY_MATRIX,
    getIntegrations,
    getBridge,
    getCompatibleNetworks,
};
