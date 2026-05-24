/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  NEURAL CELL NETWORKS — خلايا الشبكة العصبية للاتصالات                      ║
 * ║                                                                              ║
 * ║  كل شبكة اتصالات = خلية عصبية بـ:                                          ║
 * ║  🔵 المدخلات   🎯 الهدف   ⚙️ المعالجة   📤 الناتج   💥 الأثر              ║
 * ║  🧩 العناصر   🔗 الاتصالات (التشابك مع الخلايا الأخرى)                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * النموذج: خلية عصبية اصطناعية معدّلة لشبكات الاتصالات
 *
 *   [مدخلات] → ⟦ تفعيل ⟧ → [ناتج] → ➜ خلايا أخرى
 *                 ↑
 *            [الهدف + العناصر]
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:٣١
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// نموذج الخلية العصبية الأساسي
// ═══════════════════════════════════════════════════════════════

/**
 * كل خلية تحمل الهيكل التالي:
 * {
 *   id, nameAr, nameEn, icon, domain,
 *   inputs:   [ { id, nameAr, type, source } ]          — المدخلات
 *   goal:     { primary, secondary, kpi }               — الهدف والغاية
 *   elements: [ { id, nameAr, role } ]                  — عناصر الشبكة
 *   process:  { mechanism, protocol, standard }         — المعالجة الداخلية
 *   output:   [ { id, nameAr, type, destination } ]     — الناتج المباشر
 *   effect:   { immediate, short_term, long_term }      — الأثر
 *   synapses: [ { to_cell_id, signal_type, strength } ] — التشابك مع خلايا أخرى
 *   activation: 0–1                                     — مستوى التفعيل
 *   quran_ref, sharia_note
 * }
 */

// ═══════════════════════════════════════════════════════════════
// الخلايا العصبية — الشبكات الأرضية
// ═══════════════════════════════════════════════════════════════
const TERRESTRIAL_CELLS = {

    // ─── خلية الألياف الضوئية ─────────────────────────────────
    CELL_FIBER: {
        id:       'CELL_FIBER',
        nameAr:   'خلية الألياف الضوئية',
        nameEn:   'Fiber Optic Neural Cell',
        icon:     '🔆',
        domain:   'TERRESTRIAL',
        activation: 1.0,

        inputs: [
            { id: 'DATA_RAW',      nameAr: 'بيانات خام من المصادر',         type: 'DATA',    source: 'servers / users' },
            { id: 'LIGHT_SIGNAL',  nameAr: 'إشارة ضوئية (激光)',              type: 'OPTICAL', source: 'DWDM Transmitter' },
            { id: 'POWER_SUPPLY',  nameAr: 'طاقة كهربائية للتضخيم',          type: 'POWER',   source: 'UPS / Grid' },
        ],

        goal: {
            primary:   'نقل البيانات بأقصى سرعة وأدنى تأخير عبر البنية التحتية السلكية',
            secondary: 'توفير العمود الفقري للشبكة الوطنية والدولية',
            kpi:       { speed: '10 Tbps', latency: '< 1ms', availability: '99.99%' },
        },

        elements: [
            { id: 'CABLE',      nameAr: 'كابل الألياف الضوئية',       role: 'ناقل الإشارة الضوئية' },
            { id: 'DWDM',       nameAr: 'نظام DWDM تعدد الإرسال الكثيف', role: 'مضاعفة السعة' },
            { id: 'AMPLIFIER',  nameAr: 'مضخم EDFA',                   role: 'تقوية الإشارة على مسافات طويلة' },
            { id: 'OLT',        nameAr: 'محطة الخط البصري OLT',         role: 'إدارة الاتصالات' },
            { id: 'ONT',        nameAr: 'النهاية البصرية ONT (المنزل)',   role: 'استلام وتوزيع الإشارة' },
        ],

        process: {
            mechanism: 'تحويل البيانات الرقمية إلى نبضات ضوئية بالليزر، انتقالها عبر الألياف بانعكاس داخلي كلي',
            protocol:  'Ethernet / IP / MPLS / DWDM',
            standard:  'ITU-T G.652 / G.655 / IEEE 802.3',
        },

        output: [
            { id: 'BROADBAND',    nameAr: 'إنترنت عريض النطاق',            type: 'SERVICE',  destination: 'المنازل والشركات' },
            { id: 'BACKBONE',     nameAr: 'نقل البيانات بين المدن والدول',  type: 'TRANSIT',  destination: 'Exchange Points / IXP' },
            { id: 'MOBILE_BH',    nameAr: 'Backhaul لأبراج الجوال',         type: 'BACKHAUL', destination: 'CELL_5G / CELL_4G' },
        ],

        effect: {
            immediate:  'اتصال فائق السرعة للأفراد والشركات',
            short_term: 'تمكين الاقتصاد الرقمي والتجارة الإلكترونية',
            long_term:  'البنية التحتية الأساسية لرؤية 2030 والتحول الرقمي',
        },

        synapses: [
            { to_cell_id: 'CELL_5G',       signal_type: 'BACKHAUL',      strength: 1.0 },
            { to_cell_id: 'CELL_4G',       signal_type: 'BACKHAUL',      strength: 1.0 },
            { to_cell_id: 'CELL_GOVNET',   signal_type: 'BACKBONE',      strength: 0.9 },
            { to_cell_id: 'CELL_SATELLITE',signal_type: 'GATEWAY',       strength: 0.6 },
            { to_cell_id: 'CELL_DATAPORT', signal_type: 'CORE_TRANSPORT', strength: 1.0 },
        ],

        quran_ref:   { ref: 'الذاريات:٢٠', text: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ' },
        sharia_note: 'الإنترنت أداة للمعرفة والتجارة — يجب إدارته بما يوافق الشريعة',
    },

    // ─── خلية 5G ──────────────────────────────────────────────
    CELL_5G: {
        id:       'CELL_5G',
        nameAr:   'خلية الجيل الخامس 5G',
        nameEn:   '5G Neural Cell',
        icon:     '📶',
        domain:   'TERRESTRIAL',
        activation: 0.9,

        inputs: [
            { id: 'SPECTRUM',    nameAr: 'طيف ترددي مرخّص',              type: 'SPECTRUM', source: 'CITC تخصيص الطيف' },
            { id: 'FIBER_BH',    nameAr: 'Backhaul ألياف من CELL_FIBER',  type: 'DATA',     source: 'CELL_FIBER' },
            { id: 'USER_DEVICE', nameAr: 'أجهزة المستخدمين (هواتف/IoT)', type: 'REQUEST',  source: 'End Users' },
            { id: 'POWER_5G',    nameAr: 'طاقة كهربائية للأبراج',         type: 'POWER',    source: 'Grid / Solar' },
        ],

        goal: {
            primary:   'توفير اتصال لاسلكي فائق السرعة ومنخفض التأخير للأجهزة المتنقلة',
            secondary: 'تمكين إنترنت الأشياء والسيارات الذاتية والجراحة عن بُعد',
            kpi:       { speed: '10 Gbps peak', latency: '1ms', devices_km2: '1,000,000' },
        },

        elements: [
            { id: 'gNB',        nameAr: 'محطة القاعدة 5G (gNB)',         role: 'إرسال واستقبال اللاسلكي' },
            { id: 'RRU',        nameAr: 'وحدة الراديو عن بُعد (RRU)',     role: 'الإرسال على الأبراج' },
            { id: 'MASSIVE_MIMO', nameAr: 'Massive MIMO 256 هوائي',       role: 'توجيه الحزمة beam-forming' },
            { id: '5G_CORE',    nameAr: 'نواة 5G (5GC)',                  role: 'إدارة الجلسات والمصادقة' },
            { id: 'MEC',        nameAr: 'الحوسبة على الحافة (MEC)',        role: 'تقليل التأخير بالمعالجة المحلية' },
        ],

        process: {
            mechanism: 'OFDM + Massive MIMO + Network Slicing — تقسيم الشبكة لشرائح مخصصة لكل خدمة',
            protocol:  '3GPP NR / NGAP / GTP-U / PFCP',
            standard:  '3GPP Release 15/16/17/18 | IMT-2020',
        },

        output: [
            { id: 'MOBILE_INTERNET', nameAr: 'إنترنت متنقل فائق السرعة',  type: 'SERVICE',    destination: 'المستخدمون' },
            { id: 'IOT_CONNECT',     nameAr: 'اتصال إنترنت الأشياء كثيف',  type: 'IOT',        destination: 'CELL_IOT' },
            { id: 'V2X_SIGNAL',      nameAr: 'إشارات السيارات الذاتية',     type: 'VEHICLE',    destination: 'CELL_SMART_ROAD' },
            { id: 'MISSION_CRIT',    nameAr: 'خدمات حرجة MCPTT',           type: 'EMERGENCY',  destination: 'CELL_EMERGENCY' },
        ],

        effect: {
            immediate:  'اتصال لحظي بين الأشخاص والأجهزة',
            short_term: 'تحول في قطاعات الصحة والنقل والصناعة',
            long_term:  'العمود الفقري للمدن الذكية ونيوم والقدية',
        },

        synapses: [
            { to_cell_id: 'CELL_FIBER',     signal_type: 'BACKHAUL_REQ',  strength: 1.0 },
            { to_cell_id: 'CELL_IOT',       signal_type: 'CONNECT',       strength: 0.9 },
            { to_cell_id: 'CELL_EMERGENCY', signal_type: 'PRIORITY',      strength: 1.0 },
            { to_cell_id: 'CELL_AVIATION',  signal_type: 'GROUND_COMM',   strength: 0.5 },
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'HANDOFF',       strength: 0.7 },
        ],

        quran_ref:   { ref: 'يونس:٢٤', text: 'زَيَّنَّاهَا وَظَنَّ أَهْلُهَا أَنَّهُمْ قَادِرُونَ عَلَيْهَا' },
        sharia_note: 'الاتصال أمانة — ولا يجوز استخدامه في الإضرار',
    },

    // ─── خلية الطوارئ TETRA ───────────────────────────────────
    CELL_EMERGENCY: {
        id:       'CELL_EMERGENCY',
        nameAr:   'خلية شبكة الطوارئ TETRA',
        nameEn:   'Emergency Network Neural Cell',
        icon:     '🚨',
        domain:   'TERRESTRIAL',
        activation: 1.0,

        inputs: [
            { id: 'DISTRESS_CALL',   nameAr: 'نداء استغاثة من الميدان',    type: 'VOICE',    source: 'CELL_AVIATION / CELL_MARITIME / Field Units' },
            { id: 'SENSOR_ALERT',    nameAr: 'إنذار من أجهزة الاستشعار',   type: 'IOT',      source: 'CELL_IOT' },
            { id: 'COMMAND_ORDER',   nameAr: 'أوامر من مركز القيادة',      type: 'COMMAND',  source: 'Control Center' },
            { id: 'SAT_EMERGENCY',   nameAr: 'إشارة استغاثة فضائية',       type: 'SATELLITE',source: 'CELL_SATELLITE' },
        ],

        goal: {
            primary:   'ضمان الاتصال الحرج الموثوق لخدمات الطوارئ في أي ظرف',
            secondary: 'تنسيق الاستجابة الفورية بين الجهات المعنية',
            kpi:       { availability: '99.999%', call_setup: '< 300ms', encryption: 'E2E mandatory' },
        },

        elements: [
            { id: 'TETRA_BS',    nameAr: 'محطة قاعدة TETRA',            role: 'التغطية الراديوية للطوارئ' },
            { id: 'DIMETRA',     nameAr: 'شبكة DIMETRA / SwMI',          role: 'إدارة المكالمات والمجموعات' },
            { id: 'DISPATCH',    nameAr: 'وحدة التحكم والإرسال',          role: 'توزيع المكالمات والتنسيق' },
            { id: 'CRYPTO',      nameAr: 'وحدة التشفير TEA2/TEA3',        role: 'أمان الاتصالات E2E' },
            { id: 'DMO',         nameAr: 'وضع التشغيل المباشر (DMO)',      role: 'الاتصال بدون شبكة' },
        ],

        process: {
            mechanism: 'TDMA 4 فتحات على كل قناة — أولوية مكالمات الطوارئ تلقائياً — تشفير E2E',
            protocol:  'TETRA TEDS / ETSI EN 300 392',
            standard:  'ETSI TETRA | P25 TIA-102 | MCX 3GPP',
        },

        output: [
            { id: 'COORDINATED_RESP', nameAr: 'استجابة طوارئ منسقة',        type: 'COMMAND',  destination: 'ميدان العمليات' },
            { id: 'SITUATION_AWARE',  nameAr: 'صورة عملياتية مشتركة',       type: 'DATA',     destination: 'مراكز القيادة' },
            { id: 'RESCUE_SIGNAL',    nameAr: 'إشارة الإنقاذ للفرق',         type: 'ALERT',    destination: 'فرق الإنقاذ' },
        ],

        effect: {
            immediate:  'إنقاذ الأرواح وحماية الممتلكات',
            short_term: 'سرعة الاستجابة وتقليل الخسائر',
            long_term:  'الحماية المؤسسية للأمن الوطني',
        },

        synapses: [
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'BACKUP_COMMS',   strength: 1.0 },
            { to_cell_id: 'CELL_5G',        signal_type: 'MCX_HANDOFF',    strength: 0.9 },
            { to_cell_id: 'CELL_AVIATION',  signal_type: 'SAR_COORD',      strength: 1.0 },
            { to_cell_id: 'CELL_MARITIME',  signal_type: 'SAR_COORD',      strength: 1.0 },
            { to_cell_id: 'CELL_GOVNET',    signal_type: 'COMMAND_LINK',   strength: 1.0 },
        ],

        quran_ref:   { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        sharia_note: 'حفظ الأنفس — أحد المقاصد الخمسة للشريعة الإسلامية',
    },

    // ─── خلية الشبكة الحكومية ─────────────────────────────────
    CELL_GOVNET: {
        id:       'CELL_GOVNET',
        nameAr:   'خلية الشبكة الحكومية',
        nameEn:   'Government Network Neural Cell',
        icon:     '🏛️',
        domain:   'TERRESTRIAL',
        activation: 1.0,

        inputs: [
            { id: 'CITIZEN_DATA',   nameAr: 'بيانات المواطنين والمقيمين',   type: 'DATA',    source: 'Absher / Nafath / SADAD' },
            { id: 'GOV_REQUESTS',   nameAr: 'طلبات الخدمات الحكومية',       type: 'SERVICE', source: 'Portals / APIs' },
            { id: 'INTER_GOV',      nameAr: 'تدفق بيانات بين الجهات',       type: 'DATA',    source: 'Ministries / Agencies' },
        ],

        goal: {
            primary:   'تأمين التواصل الحكومي وتقديم الخدمات الرقمية للمواطنين',
            secondary: 'حماية البيانات الوطنية الحساسة بأعلى معايير الأمن',
            kpi:       { uptime: '99.999%', response_time: '< 200ms', compliance: 'NCA ECC' },
        },

        elements: [
            { id: 'MPLS_VPN',   nameAr: 'شبكة MPLS VPN المخصصة',          role: 'عزل الحركة الحكومية' },
            { id: 'FIREWALL',   nameAr: 'جدران نارية حكومية متخصصة',       role: 'الحماية من الاختراق' },
            { id: 'PKI_GOV',    nameAr: 'بنية مفاتيح عامة حكومية (PKI)',   role: 'توثيق الهويات والتوقيع الرقمي' },
            { id: 'GDC',        nameAr: 'مراكز البيانات الحكومية (GDC)',    role: 'استضافة البيانات الوطنية' },
            { id: 'NCA_SOC',    nameAr: 'مركز عمليات أمن NCA',             role: 'مراقبة التهديدات السيبرانية' },
        ],

        process: {
            mechanism: 'Zero Trust Architecture — كل طلب يُحقق منه صراحةً، بغض النظر عن المصدر',
            protocol:  'TLS 1.3 + mTLS + SAML/OIDC',
            standard:  'NCA ECC | NDMO | ISO 27001 | PDPL',
        },

        output: [
            { id: 'EGOV_SERVICES', nameAr: 'خدمات حكومية إلكترونية',      type: 'SERVICE', destination: 'المواطنون والشركات' },
            { id: 'SECURE_COMM',   nameAr: 'اتصالات حكومية آمنة',          type: 'SECURE',  destination: 'الوزارات والجهات' },
            { id: 'NATIONAL_DATA', nameAr: 'بيانات وطنية محمية',            type: 'DATA',    destination: 'National Data Center' },
        ],

        effect: {
            immediate:  'خدمة المواطن رقمياً بدون مراجعة مكاتب',
            short_term: 'تحسين كفاءة الجهاز الحكومي',
            long_term:  'الحوكمة الرقمية الكاملة — رؤية 2030',
        },

        synapses: [
            { to_cell_id: 'CELL_FIBER',     signal_type: 'BACKBONE',     strength: 1.0 },
            { to_cell_id: 'CELL_EMERGENCY', signal_type: 'COMMAND_AUTH', strength: 1.0 },
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'BACKUP',       strength: 0.8 },
        ],

        quran_ref:   { ref: 'النساء:٥٩', text: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ' },
        sharia_note: 'حفظ النظام العام — مقصد من مقاصد الشريعة',
    },

    // ─── خلية IoT ─────────────────────────────────────────────
    CELL_IOT: {
        id:       'CELL_IOT',
        nameAr:   'خلية إنترنت الأشياء',
        nameEn:   'IoT Neural Cell',
        icon:     '🌐',
        domain:   'TERRESTRIAL',
        activation: 0.85,

        inputs: [
            { id: 'SENSOR_DATA',  nameAr: 'قراءات المستشعرات',              type: 'TELEMETRY', source: 'الحقول / المدن / المصانع' },
            { id: 'NETWORK_CONN', nameAr: 'اتصال LoRaWAN / NB-IoT',         type: 'NETWORK',   source: 'CELL_5G / LoRa GW' },
            { id: 'COMMANDS',     nameAr: 'أوامر التحكم من السحابة',          type: 'COMMAND',   source: 'IoT Platform' },
        ],

        goal: {
            primary:   'ربط الأشياء المادية بالشبكة الرقمية لتمكين القرارات الذكية',
            secondary: 'تحويل البيانات الفيزيائية إلى رؤى قابلة للتنفيذ',
            kpi:       { devices: '1M+/km² (5G NB-IoT)', battery: '10+ سنوات', latency: '< 1s' },
        },

        elements: [
            { id: 'SENSORS',      nameAr: 'حساسات (حرارة/ضغط/موقع/ضوء)', role: 'جمع البيانات الفيزيائية' },
            { id: 'LORAWAN_GW',   nameAr: 'بوابة LoRaWAN',                role: 'تجميع الإشارات' },
            { id: 'IOT_PLATFORM', nameAr: 'منصة IoT (AWS/Azure)',           role: 'تخزين ومعالجة البيانات' },
            { id: 'ACTUATORS',    nameAr: 'محركات التنفيذ (صمامات/مضخات)', role: 'تنفيذ أوامر التحكم' },
            { id: 'EDGE_COMPUTE', nameAr: 'الحوسبة على الحافة',            role: 'معالجة محلية سريعة' },
        ],

        process: {
            mechanism: 'Sense → Connect → Process → Act — حلقة تحكم مغلقة آلية',
            protocol:  'MQTT / CoAP / LwM2M / AMQP',
            standard:  'IEEE 802.15.4 | LoRa Alliance | 3GPP NB-IoT | IEC 62443',
        },

        output: [
            { id: 'SMART_DATA',   nameAr: 'بيانات ذكية منقحة',              type: 'DATA',    destination: 'AI / Analytics platforms' },
            { id: 'AUTO_CONTROL', nameAr: 'تحكم تلقائي في البيئة المادية',   type: 'ACTION',  destination: 'المصانع / المزارع / المباني' },
            { id: 'ALERTS',       nameAr: 'تنبيهات فورية للحوادث',           type: 'ALERT',   destination: 'CELL_EMERGENCY / Operators' },
        ],

        effect: {
            immediate:  'رصد لحظي وتحكم آلي',
            short_term: 'تحسين الكفاءة التشغيلية',
            long_term:  'المدن الذكية والزراعة الدقيقة والصناعة 4.0',
        },

        synapses: [
            { to_cell_id: 'CELL_5G',       signal_type: 'CONNECTIVITY',  strength: 0.9 },
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'REMOTE_AREAS',  strength: 0.7 },
            { to_cell_id: 'CELL_EMERGENCY', signal_type: 'ALERT_TRIGGER', strength: 0.8 },
            { to_cell_id: 'CELL_LOGISTICS', signal_type: 'TRACKING',      strength: 0.9 },
        ],

        quran_ref:   { ref: 'الرعد:٨', text: 'اللَّهُ يَعْلَمُ مَا تَحْمِلُ كُلُّ أُنثَىٰ' },
        sharia_note: 'العلم بالأشياء — أداة لخدمة الإنسان واستخلافه في الأرض',
    },
};

// ═══════════════════════════════════════════════════════════════
// الخلايا العصبية — الشبكات الفضائية
// ═══════════════════════════════════════════════════════════════
const SATELLITE_CELLS = {

    // ─── خلية الأقمار الصناعية الموحّدة ──────────────────────
    CELL_SATELLITE: {
        id:       'CELL_SATELLITE',
        nameAr:   'خلية الأقمار الصناعية',
        nameEn:   'Satellite Neural Cell',
        icon:     '🛰️',
        domain:   'SATELLITE',
        activation: 0.95,

        inputs: [
            { id: 'UPLINK',       nameAr: 'إشارة صاعدة من الأرض (Uplink)',   type: 'RF',       source: 'محطات أرضية / سفن / طائرات' },
            { id: 'CONTROL_CMD',  nameAr: 'أوامر التحكم بالقمر',              type: 'COMMAND',  source: 'مركز تحكم Arabsat / SpaceX' },
            { id: 'SOLAR_POWER',  nameAr: 'طاقة شمسية في الفضاء',            type: 'POWER',    source: 'Solar Panels on Satellite' },
        ],

        goal: {
            primary:   'توفير تغطية اتصالات عالمية لا تعرف حدوداً جغرافية',
            secondary: 'الاتصال في المناطق النائية والبحر والجو حيث لا بنية أرضية',
            kpi:       { coverage: 'عالمي 100%', latency_LEO: '20-50ms', latency_GEO: '500-700ms' },
        },

        elements: [
            { id: 'SAT_BUS',      nameAr: 'هيكل القمر الصناعي (Bus)',       role: 'الحاوية الهيكلية والطاقة' },
            { id: 'TRANSPONDER',  nameAr: 'جهاز الترحيل (Transponder)',       role: 'استقبال الإشارة وإعادة إرسالها' },
            { id: 'ANTENNA',      nameAr: 'الهوائيات الموجهة (Phased Array)', role: 'تركيز الحزمة beam-forming' },
            { id: 'GROUND_SEG',   nameAr: 'المحطة الأرضية (Hub/Gateway)',    role: 'الربط بالشبكة الأرضية' },
            { id: 'GNSS_PAYLOAD', nameAr: 'حمولة GNSS/GPS',                  role: 'الملاحة وتحديد الموقع' },
        ],

        process: {
            mechanism: 'استقبال الإشارة (Uplink) → معالجة على القمر أو ترحيل شفاف → إرسال (Downlink)',
            protocol:  'DVB-S2X / DVB-RCS2 / CCSDS / Starlink proprietary',
            standard:  'ITU Radio Regulations | CCSDS | 3GPP NTN',
        },

        output: [
            { id: 'BROADBAND_SAT', nameAr: 'إنترنت فضائي عريض النطاق',      type: 'SERVICE',    destination: 'المناطق النائية / السفن / الطائرات' },
            { id: 'GNSS_SIGNAL',   nameAr: 'إشارة الملاحة GPS/GNSS',         type: 'NAVIGATION', destination: 'CELL_AVIATION / CELL_MARITIME / CELL_LOGISTICS' },
            { id: 'SAT_BROADCAST', nameAr: 'بث فضائي تلفزيوني',               type: 'BROADCAST',  destination: 'المنازل عبر طبق' },
            { id: 'SAT_EMERGENCY', nameAr: 'إشارة إنقاذ EPIRB/COSPAS',        type: 'SOS',        destination: 'CELL_EMERGENCY' },
        ],

        effect: {
            immediate:  'ربط المناطق المعزولة بالعالم فوراً',
            short_term: 'سد الفجوة الرقمية بين المدن والأرياف',
            long_term:  'توحيد الاتصالات العالمية وتمكين الاقتصاد الرقمي الشامل',
        },

        synapses: [
            { to_cell_id: 'CELL_FIBER',     signal_type: 'GATEWAY_CONN',   strength: 0.8 },
            { to_cell_id: 'CELL_AVIATION',  signal_type: 'SATCOM_AVIONICS',strength: 1.0 },
            { to_cell_id: 'CELL_MARITIME',  signal_type: 'VSAT_MARITIME',  strength: 1.0 },
            { to_cell_id: 'CELL_LOGISTICS', signal_type: 'GPS_TRACKING',   strength: 1.0 },
            { to_cell_id: 'CELL_EMERGENCY', signal_type: 'SAR_COSPAS',     strength: 1.0 },
            { to_cell_id: 'CELL_5G',        signal_type: 'NTN_HANDOFF',    strength: 0.7 },
        ],

        quran_ref:   { ref: 'الأنعام:٩٧', text: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا' },
        sharia_note: 'التسخير — الله سخّر الكون للإنسان، والفضاء ملك لله وأمانة في يد البشر',
    },
};

// ═══════════════════════════════════════════════════════════════
// الخلايا العصبية — الشبكات اللوجيستية
// ═══════════════════════════════════════════════════════════════
const LOGISTICS_CELLS = {

    // ─── خلية الطيران ─────────────────────────────────────────
    CELL_AVIATION: {
        id:       'CELL_AVIATION',
        nameAr:   'خلية شبكة الطيران',
        nameEn:   'Aviation Neural Cell',
        icon:     '✈️',
        domain:   'LOGISTICS',
        activation: 0.95,

        inputs: [
            { id: 'PILOT_VOICE',   nameAr: 'صوت الطيار عبر VHF/HF',          type: 'VOICE',      source: 'الطائرة' },
            { id: 'ADS_B_DATA',    nameAr: 'بيانات ADS-B لموقع الطائرة',       type: 'POSITION',   source: 'Transponder الطائرة' },
            { id: 'FMS_DATA',      nameAr: 'بيانات خطة الطيران FMS',           type: 'FLIGHTPLAN', source: 'FMS on Board' },
            { id: 'SAT_IFC',       nameAr: 'إنترنت على المتن (SATCOM)',          type: 'DATA',       source: 'CELL_SATELLITE' },
            { id: 'WEATHER_DATA',  nameAr: 'بيانات الطقس والنوام',              type: 'METEO',      source: 'ATIS / SIGMET / VOLMET' },
        ],

        goal: {
            primary:   'ضمان التواصل الآمن والمستمر بين الطائرة والأرض طوال الرحلة',
            secondary: 'توفير ملاحة دقيقة وإدارة الحركة الجوية بكفاءة',
            kpi:       { voice_clarity: '> 90%', position_update: '1s ADS-B', satcom_speed: '100 Mbps' },
        },

        elements: [
            { id: 'VHF_RADIO',   nameAr: 'جهاز VHF (118-137 MHz)',            role: 'الاتصال الصوتي مع ATC' },
            { id: 'ACARS_UNIT',  nameAr: 'وحدة ACARS للبيانات',               role: 'رسائل البيانات الجوية' },
            { id: 'ADS_B_OUT',   nameAr: 'جهاز بث ADS-B',                    role: 'نقل موقع الطائرة لكل من حوله' },
            { id: 'ILS_SYSTEM',  nameAr: 'نظام الهبوط الآلي ILS',             role: 'الهبوط في الضباب' },
            { id: 'SATCOM_UNIT', nameAr: 'وحدة SATCOM (Inmarsat/ViaSat)',      role: 'الاتصال الفضائي والإنترنت' },
            { id: 'FMS_COMP',    nameAr: 'حاسب إدارة الرحلة FMS',             role: 'حساب المسار والوقود' },
        ],

        process: {
            mechanism: 'ACARS data + VHF voice + ADS-B position → ATC processes → safe flight path',
            protocol:  'ARINC 618/629/664 | VDL2 | HF SELCAL | ICAO Doc 9869',
            standard:  'ICAO Annexes 1-19 | RTCA DO-260B | EUROCAE ED-102',
        },

        output: [
            { id: 'SAFE_FLIGHT',   nameAr: 'رحلة آمنة من المنشأ للوجهة',      type: 'TRANSPORT',  destination: 'المسافرون والبضائع' },
            { id: 'ATC_PICTURE',   nameAr: 'صورة جوية كاملة للمراقبة الجوية', type: 'AWARENESS',  destination: 'CELL_ATC (مراقبة جوية)' },
            { id: 'ACARS_REPORTS', nameAr: 'تقارير الرحلة والوقود للشركة',    type: 'DATA',       destination: 'Airline OCC' },
            { id: 'PAX_INTERNET',  nameAr: 'إنترنت للركاب على المتن',          type: 'SERVICE',    destination: 'الركاب' },
        ],

        effect: {
            immediate:  'وصل الركاب والبضائع بسلامة',
            short_term: 'تسهيل التجارة الدولية ونقل الحجاج والمعتمرين',
            long_term:  'ربط المملكة بالعالم — الهدف الاستراتيجي لـ GACA / رؤية 2030',
        },

        synapses: [
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'SATCOM_LINK',    strength: 1.0 },
            { to_cell_id: 'CELL_EMERGENCY', signal_type: 'ELT_121.5',      strength: 1.0 },
            { to_cell_id: 'CELL_MARITIME',  signal_type: 'SAR_JOINT',      strength: 0.8 },
            { to_cell_id: 'CELL_LOGISTICS', signal_type: 'CARGO_HANDOFF',  strength: 0.9 },
            { to_cell_id: 'CELL_5G',        signal_type: 'GROUND_DATA',    strength: 0.5 },
        ],

        quran_ref:   { ref: 'الملك:١٩', text: 'أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ' },
        sharia_note: 'سلامة الأرواح في الطيران أمانة شرعية — لا يجوز التهاون بها',
    },

    // ─── خلية السفن والملاحة البحرية ──────────────────────────
    CELL_MARITIME: {
        id:       'CELL_MARITIME',
        nameAr:   'خلية شبكة السفن والبحر',
        nameEn:   'Maritime Neural Cell',
        icon:     '🚢',
        domain:   'LOGISTICS',
        activation: 0.9,

        inputs: [
            { id: 'AIS_DATA',     nameAr: 'بيانات AIS (موقع + هوية السفينة)', type: 'POSITION',  source: 'Transponder السفينة' },
            { id: 'VHF_CH16',     nameAr: 'اتصال VHF قناة 16 (استغاثة)',       type: 'VOICE',     source: 'البحارة / خفر السواحل' },
            { id: 'EPIRB_SIGNAL', nameAr: 'إشارة EPIRB الاستغاثة 406 MHz',    type: 'SOS',       source: 'طارئ بحري' },
            { id: 'VSAT_DATA',    nameAr: 'إنترنت VSAT فضائي للسفينة',         type: 'DATA',      source: 'CELL_SATELLITE' },
            { id: 'NAVTEX',       nameAr: 'تحذيرات الملاحة والطقس NAVTEX',     type: 'BROADCAST', source: 'NAVTEX Stations' },
        ],

        goal: {
            primary:   'ضمان سلامة الملاحة البحرية والتجارة عبر البحر',
            secondary: 'تنسيق البحث والإنقاذ في حالات الطوارئ البحرية',
            kpi:       { ais_update: '2-10s', distress_relay: '< 60s', vsat_speed: '100 Mbps' },
        },

        elements: [
            { id: 'AIS_TX',      nameAr: 'جهاز AIS Class A/B',               role: 'البث التلقائي للهوية والموقع' },
            { id: 'GMDSS_SUITE', nameAr: 'منظومة GMDSS الكاملة',             role: 'الاتصالات الطارئة الإلزامية' },
            { id: 'VHF_MARINE',  nameAr: 'جهاز VHF البحري 156-174 MHz',      role: 'الاتصال الصوتي للسفينة' },
            { id: 'INMARSAT',    nameAr: 'Inmarsat Fleet Xpress',              role: 'إنترنت + صوت فضائي للسفينة' },
            { id: 'GYROCOMPASS', nameAr: 'بوصلة جيروسكوبية + GPS',            role: 'الملاحة الدقيقة' },
            { id: 'ECDIS',       nameAr: 'نظام خرائط الملاحة الرقمية ECDIS',  role: 'الخرائط البحرية الرقمية' },
        ],

        process: {
            mechanism: 'AIS broadcast ← → VTS tracking ← → GMDSS safety ← → INMARSAT voice/data',
            protocol:  'ITU-R M.1371 / NMEA 0183 / SOLAS Chapter IV',
            standard:  'SOLAS | STCW | ISM Code | IMO | ITU',
        },

        output: [
            { id: 'SAFE_TRANSIT',  nameAr: 'عبور بحري آمن للسفينة',            type: 'TRANSPORT',  destination: 'الموانئ الوجهة' },
            { id: 'PORT_NOTICE',   nameAr: 'إشعار مسبق للوصول للميناء',         type: 'NOTICE',     destination: 'CELL_PORT' },
            { id: 'SAR_RESPONSE',  nameAr: 'استجابة البحث والإنقاذ',            type: 'SAR',        destination: 'CELL_EMERGENCY / MRCC' },
            { id: 'CARGO_DATA',    nameAr: 'بيانات الشحنة الإلكترونية',          type: 'DATA',       destination: 'CELL_LOGISTICS / Customs' },
        ],

        effect: {
            immediate:  'سلامة البحارة والسفن والشحنات',
            short_term: 'انسياب التجارة الدولية عبر الموانئ السعودية',
            long_term:  'تعزيز مكانة المملكة كمركز لوجستي عالمي — رؤية 2030',
        },

        synapses: [
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'VSAT_LINK',      strength: 1.0 },
            { to_cell_id: 'CELL_EMERGENCY', signal_type: 'GMDSS_DISTRESS', strength: 1.0 },
            { to_cell_id: 'CELL_AVIATION',  signal_type: 'SAR_COORD',      strength: 0.8 },
            { to_cell_id: 'CELL_LOGISTICS', signal_type: 'PORT_EDI',       strength: 1.0 },
            { to_cell_id: 'CELL_IOT',       signal_type: 'CONTAINER_TRACK',strength: 0.8 },
        ],

        quran_ref:   { ref: 'يونس:٢٢', text: 'هُوَ الَّذِي يُسَيِّرُكُمْ فِي الْبَرِّ وَالْبَحْرِ' },
        sharia_note: 'التجارة البحرية مباركة — ذُكرت السفن في القرآن الكريم رحمةً للعباد',
    },

    // ─── خلية اللوجستيات البرية ───────────────────────────────
    CELL_LOGISTICS: {
        id:       'CELL_LOGISTICS',
        nameAr:   'خلية اللوجستيات والنقل البري',
        nameEn:   'Land Logistics Neural Cell',
        icon:     '🚛',
        domain:   'LOGISTICS',
        activation: 0.9,

        inputs: [
            { id: 'GPS_POSITION', nameAr: 'موقع GPS للشاحنة / الحاوية',       type: 'POSITION',   source: 'CELL_SATELLITE' },
            { id: 'MANIFEST',     nameAr: 'بيان الشحنة الرقمي',                type: 'DOCUMENT',   source: 'WMS / TMS' },
            { id: 'CUSTOMS_DATA', nameAr: 'بيانات الجمارك والتخليص',           type: 'COMPLIANCE', source: 'Fasah / ZATCA' },
            { id: 'IOT_SENSORS',  nameAr: 'مستشعرات درجة الحرارة والرطوبة',   type: 'TELEMETRY',  source: 'CELL_IOT' },
            { id: 'PORT_RELEASE', nameAr: 'إفراج الميناء عن الحاوية',          type: 'EVENT',      source: 'CELL_MARITIME' },
        ],

        goal: {
            primary:   'تحريك البضائع بكفاءة من المنشأ للمستهلك عبر سلسلة إمداد متكاملة',
            secondary: 'الرؤية الكاملة (visibility) لكل شحنة في كل لحظة',
            kpi:       { tracking_update: '30s', on_time: '> 95%', cold_chain_alert: '< 5min' },
        },

        elements: [
            { id: 'FLEET_MGT',   nameAr: 'نظام إدارة الأسطول',               role: 'تتبع المركبات وجدولتها' },
            { id: 'TMS',         nameAr: 'نظام إدارة النقل TMS',              role: 'تخطيط المسارات والأسعار' },
            { id: 'WMS',         nameAr: 'نظام إدارة المستودع WMS',           role: 'الجرد والتخزين والتوزيع' },
            { id: 'RFID_TRACK',  nameAr: 'تتبع RFID في المستودعات والموانئ', role: 'معرفة موقع الحاوية دون مسح' },
            { id: 'EDI_SYSTEM',  nameAr: 'تبادل بيانات إلكتروني EDI',         role: 'التواصل مع الجمارك والموانئ' },
        ],

        process: {
            mechanism: 'Scan → Track → Route → Deliver → Confirm — حلقة التتبع من الباب للباب',
            protocol:  'EDIFACT / AS2 / REST APIs / ISO 6346',
            standard:  'ISO 28000 Supply Chain Security | Incoterms 2020',
        },

        output: [
            { id: 'DELIVERY',     nameAr: 'تسليم الشحنة في الوقت المحدد',     type: 'SERVICE',  destination: 'المستلم النهائي' },
            { id: 'CHAIN_VIS',    nameAr: 'رؤية سلسلة الإمداد الكاملة',       type: 'DATA',     destination: 'Shipper / Consignee / Customs' },
            { id: 'COLD_CERT',    nameAr: 'شهادة سلسلة التبريد المحفوظة',     type: 'DOCUMENT', destination: 'الجهات الصحية / الصيدلانية' },
        ],

        effect: {
            immediate:  'وصول البضائع للمستهلك',
            short_term: 'تقليل تكاليف الخدمات اللوجستية',
            long_term:  'تحويل المملكة لمركز تبادل بضائع عالمي — رؤية 2030',
        },

        synapses: [
            { to_cell_id: 'CELL_MARITIME',  signal_type: 'PORT_PICKUP',     strength: 1.0 },
            { to_cell_id: 'CELL_AVIATION',  signal_type: 'AIR_CARGO',       strength: 0.9 },
            { to_cell_id: 'CELL_SATELLITE', signal_type: 'GPS_NAVIGATION',  strength: 1.0 },
            { to_cell_id: 'CELL_IOT',       signal_type: 'CONTAINER_IOT',   strength: 0.9 },
            { to_cell_id: 'CELL_GOVNET',    signal_type: 'CUSTOMS_API',     strength: 0.9 },
        ],

        quran_ref:   { ref: 'سبأ:١٨', text: 'وَجَعَلْنَا بَيْنَهُمْ وَبَيْنَ الْقُرَى الَّتِي بَارَكْنَا فِيهَا قُرًى ظَاهِرَةً' },
        sharia_note: 'التجارة البرية — رحلة الصيف والشتاء — بركة الله على التجار الصادقين',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ██████  الخلايا العصبية — طبقات شبكة شيخة (SHEIKHA CELLS)  ██████
//
//  كل طبقة من طبقات شبكة شيخة = خلية عصبية مستقلة
//  التسلسل الهرمي: PAN(1) → LAN(2) → WLAN(3) → CAN(4) → MAN(5)
//                   → WAN(6) → VPN(7) → TCP/IP(8) → HTTP/HTTPS(9)
//                   → 👑 SHTTP/HTTPS(10) ← الطبقة الحاكمة
//
//  الدومين: 'SHEIKHA'
//  "وَاللَّهُ غَالِبٌ عَلَى أَمْرِهِ" — يوسف: 21
// ═══════════════════════════════════════════════════════════════════════════════
const SHEIKHA_CELLS = {

    // ─── خلية 1: Sheikha PAN ──────────────────────────────────────────────────
    CELL_SHEIKHA_PAN: {
        id:         'CELL_SHEIKHA_PAN',
        nameAr:     'خلية Sheikha PAN — الشبكة الشخصية',
        nameEn:     'Sheikha Personal Area Network Cell',
        icon:       '📲',
        domain:     'SHEIKHA',
        layerOrder: 1,
        activation: 0.8,

        inputs: [
            { id: 'DIGITAL_WALLET',   nameAr: 'إشارة المحفظة الرقمية',        type: 'NFC',       source: 'هاتف المستخدم / ساعة ذكية' },
            { id: 'BT_DEVICE',        nameAr: 'اتصال Bluetooth بالجهاز',      type: 'BT',        source: 'سماعة / ساعة / لوحة مفاتيح' },
            { id: 'USER_BIOMETRIC',   nameAr: 'بصمة / وجه لتفعيل المحفظة',   type: 'AUTH',      source: 'حساسات الهاتف' },
        ],

        goal: {
            primary:   'ربط الأجهزة الشخصية للمستخدم بمنظومة سوق شيخة عبر NFC/Bluetooth',
            secondary: 'تمكين الدفع القريب المدى (Tap-to-Pay) الخالي من الربا',
            kpi:       { range: '< 10m', tap_pay_ms: '< 300ms', battery_impact: 'minimal' },
        },

        elements: [
            { id: 'NFC_CHIP',     nameAr: 'شريحة NFC للدفع القريب',           role: 'استقبال وإرسال معاملات الدفع' },
            { id: 'BT_5X',        nameAr: 'Bluetooth 5.x / BLE',              role: 'ربط الأجهزة الطرفية' },
            { id: 'SE_MODULE',    nameAr: 'العنصر الآمن (Secure Element)',     role: 'تخزين مفاتيح الدفع بأمان' },
            { id: 'WALLET_APP',   nameAr: 'تطبيق المحفظة الرقمية شيخة',       role: 'واجهة المستخدم للدفع' },
        ],

        process: {
            mechanism: 'NFC Field Detection → SE Authentication → Token Exchange → Payment Confirmation',
            protocol:  'ISO 14443 (NFC) / ISO 7816 (SE) / EMV Contactless',
            standard:  'PCI DSS | EMVCo | NFC Forum | GSMA',
        },

        output: [
            { id: 'PAYMENT_TOKEN',   nameAr: 'رمز دفع آمن للمعاملة',          type: 'TOKEN',    destination: 'CELL_SHEIKHA_LAN / نقطة البيع' },
            { id: 'AUTH_SIGNAL',     nameAr: 'إشارة تحقق هوية المستخدم',      type: 'AUTH',     destination: 'CELL_SHEIKHA_SHTTP' },
            { id: 'DEVICE_PRESENCE', nameAr: 'تأكيد حضور الجهاز في المتجر',  type: 'PRESENCE', destination: 'CELL_SHEIKHA_WLAN' },
        ],

        effect: {
            immediate:  'دفع لحظي بلمسة واحدة — لا ربا لا غرر',
            short_term: 'تجربة تسوق سلسة في المتاجر والمعارض',
            long_term:  'المحفظة الرقمية الإسلامية الأكثر انتشاراً في المنطقة',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_LAN',   signal_type: 'PAYMENT_TOKEN',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_WLAN',  signal_type: 'DEVICE_BEACON',  strength: 0.8 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'AUTH_REQUEST',   strength: 0.9 },
        ],

        quran_ref:   { ref: 'البقرة:٢٨٢', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ فَاكْتُبُوهُ' },
        sharia_note: 'توثيق المعاملات — كل دفع موثّق ومشفّر وخالٍ من الربا',
    },

    // ─── خلية 2: Sheikha LAN ──────────────────────────────────────────────────
    CELL_SHEIKHA_LAN: {
        id:         'CELL_SHEIKHA_LAN',
        nameAr:     'خلية Sheikha LAN — شبكة المتاجر والمستودعات',
        nameEn:     'Sheikha Local Area Network Cell',
        icon:       '🏪',
        domain:     'SHEIKHA',
        layerOrder: 2,
        activation: 0.95,

        inputs: [
            { id: 'POS_TERMINAL',   nameAr: 'معاملات نقطة البيع',              type: 'COMMERCE',  source: 'CELL_SHEIKHA_PAN / كاشير' },
            { id: 'INVENTORY_DATA', nameAr: 'بيانات الجرد والمخزون',           type: 'INVENTORY', source: 'نظام WMS المستودع' },
            { id: 'STAFF_DEVICE',   nameAr: 'أجهزة موظفي المتجر',             type: 'DEVICE',    source: 'هواتف / لوحات العمل' },
            { id: 'CAMERA_FEED',    nameAr: 'كاميرات المراقبة (CCTV)',          type: 'VIDEO',     source: 'منظومة المراقبة' },
        ],

        goal: {
            primary:   'تشغيل الشبكة الداخلية للمتجر/المستودع بكفاءة وأمان كامل',
            secondary: 'ربط نقاط البيع والمخزون بخوادم سوق شيخة المركزية',
            kpi:       { throughput: '10 Gbps', latency: '< 1ms', availability: '99.9%' },
        },

        elements: [
            { id: 'SWITCH_10G',    nameAr: 'مبدّل شبكة 10 Gbps',             role: 'توجيه الحركة الداخلية' },
            { id: 'POS_SYSTEM',    nameAr: 'منظومة نقطة البيع الشرعية',       role: 'إتمام المعاملات وإصدار الفواتير' },
            { id: 'NAS_SERVER',    nameAr: 'خادم التخزين الشبكي NAS',         role: 'حفظ بيانات المبيعات محلياً' },
            { id: 'FIREWALL_LAN',  nameAr: 'جدار حماية LAN شيخة',            role: 'Waterline حماية الشبكة المحلية' },
            { id: 'BARCODE_SCAN',  nameAr: 'ماسحات الباركود والـ RFID',       role: 'تتبع المنتجات والمخزون' },
        ],

        process: {
            mechanism: 'POS Scan → Inventory Update → Payment Auth → Central Sync → Receipt',
            protocol:  'IEEE 802.3 Ethernet / TCP/IP / TLS 1.3',
            standard:  'PCI DSS Level 1 | ISO 27001 | ZATCA e-Invoice',
        },

        output: [
            { id: 'SALE_RECORD',   nameAr: 'سجل البيع الموثّق شرعياً',        type: 'RECORD',   destination: 'CELL_SHEIKHA_CAN / الخوادم المركزية' },
            { id: 'STOCK_UPDATE',  nameAr: 'تحديث المخزون الفوري',            type: 'DATA',     destination: 'CELL_SHEIKHA_MAN / نظام SCM' },
            { id: 'RECEIPT',       nameAr: 'فاتورة إلكترونية ZATCA',          type: 'DOCUMENT', destination: 'المستخدم / CELL_SHEIKHA_PAN' },
        ],

        effect: {
            immediate:  'إتمام البيع الشرعي وتحديث المخزون آنياً',
            short_term: 'رؤية كاملة لأداء المتجر لحظة بلحظة',
            long_term:  'شبكة متاجر شيخة المتكاملة عبر المملكة',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_WLAN',  signal_type: 'WIFI_BRIDGE',      strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_CAN',   signal_type: 'SALE_SYNC',        strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_TCPIP', signal_type: 'PROTOCOL_STACK',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'AUTH_VERIFY',      strength: 0.9 },
            { to_cell_id: 'CELL_IOT',           signal_type: 'RFID_CONNECT',     strength: 0.8 },
        ],

        quran_ref:   { ref: 'الشعراء:١٨١', text: 'أَوْفُوا الْكَيْلَ وَلَا تَكُونُوا مِنَ الْمُخْسِرِينَ' },
        sharia_note: 'العدل في الكيل والوزن — كل معاملة في المتجر موثّقة ومراجعة شرعياً',
    },

    // ─── خلية 3: Sheikha WLAN ─────────────────────────────────────────────────
    CELL_SHEIKHA_WLAN: {
        id:         'CELL_SHEIKHA_WLAN',
        nameAr:     'خلية Sheikha WLAN — WiFi النقاط التجارية والمعارض',
        nameEn:     'Sheikha Wireless LAN Cell',
        icon:       '📡',
        domain:     'SHEIKHA',
        layerOrder: 3,
        activation: 0.9,

        inputs: [
            { id: 'MOBILE_BUYERS',  nameAr: 'أجهزة المشترين المتجولين',        type: 'DEVICE',   source: 'هواتف الزوار في المعرض / المتجر' },
            { id: 'WIFI_AP',        nameAr: 'نقطة وصول Wi-Fi 6/7',            type: 'RF',       source: 'CELL_SHEIKHA_LAN' },
            { id: 'SMART_DISPLAY',  nameAr: 'شاشات العروض الذكية',             type: 'DISPLAY',  source: 'نظام المعارض' },
        ],

        goal: {
            primary:   'توفير WiFi تجاري سريع وآمن لنقاط البيع والمعارض والأسواق',
            secondary: 'تمكين تجربة التسوق الذكي — عروض مخصصة، دفع بالهاتف، تتبع سلوكي شرعي',
            kpi:       { speed: '9.6 Gbps (Wi-Fi 7)', coverage: '300m²/AP', concurrent_users: 500 },
        },

        elements: [
            { id: 'WIFI7_AP',      nameAr: 'نقطة وصول Wi-Fi 7 (802.11be)',   role: 'البث اللاسلكي الفائق' },
            { id: 'CAPTIVE_PORTAL',nameAr: 'بوابة تسجيل دخول الشيخة',        role: 'مصادقة المستخدمين شرعياً' },
            { id: 'CONTENT_FILTER',nameAr: 'فلتر المحتوى الشرعي',            role: 'Waterline — منع المحتوى الحرام' },
            { id: 'ANALYTICS',     nameAr: 'تحليل سلوك التسوق (مجهّل)',       role: 'تحسين تجربة المستخدم بأمانة' },
        ],

        process: {
            mechanism: 'Device Connect → Captive Auth → Sharia Filter → Personalized Content → Purchase',
            protocol:  'IEEE 802.11be (Wi-Fi 7) / WPA3-Enterprise / HTTPS',
            standard:  'IEEE 802.11 | Wi-Fi Alliance | WPA3',
        },

        output: [
            { id: 'CUSTOMER_SESSION', nameAr: 'جلسة تسوق ذكية مخصصة',         type: 'SESSION',  destination: 'CELL_SHEIKHA_SHTTP / تطبيق شيخة' },
            { id: 'WIFI_ANALYTICS',   nameAr: 'بيانات سلوك التسوق المجهّلة',  type: 'ANALYTICS',destination: 'CELL_SHEIKHA_AI / محرك التوصيات' },
            { id: 'PROMO_DISPLAY',    nameAr: 'عروض ترويجية على الشاشات',       type: 'CONTENT',  destination: 'شاشات المعرض / هاتف الزائر' },
        ],

        effect: {
            immediate:  'تجربة تسوق ذكية وسلسة في كل نقطة بيع',
            short_term: 'زيادة مبيعات المعارض والأسواق',
            long_term:  'شبكة شيخة WiFi — الأوسع في الأسواق التجارية الإسلامية',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_LAN',   signal_type: 'UPLINK_TRAFFIC',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_CAN',   signal_type: 'DATA_SYNC',       strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'SECURE_SESSION',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',signal_type: 'BEHAVIOR_DATA',   strength: 0.8 },
        ],

        quran_ref:   { ref: 'الحجرات:٦', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا' },
        sharia_note: 'التثبت من المعلومات — فلتر الشريعة على كل بيانات الشبكة اللاسلكية',
    },

    // ─── خلية 4: Sheikha CAN ──────────────────────────────────────────────────
    CELL_SHEIKHA_CAN: {
        id:         'CELL_SHEIKHA_CAN',
        nameAr:     'خلية Sheikha CAN — شبكة التكامل بين الفروع',
        nameEn:     'Sheikha Campus Area Network Cell',
        icon:       '🏢',
        domain:     'SHEIKHA',
        layerOrder: 4,
        activation: 0.9,

        inputs: [
            { id: 'BRANCH_DATA',    nameAr: 'بيانات الفروع والمستودعات',       type: 'DATA',     source: 'CELL_SHEIKHA_LAN × N فرع' },
            { id: 'FIBER_BACKBONE', nameAr: 'ألياف بصرية بين الفروع',          type: 'OPTICAL',  source: 'CELL_FIBER' },
            { id: 'SCM_REQUESTS',   nameAr: 'طلبات سلسلة الإمداد',             type: 'COMMERCE', source: 'نظام SCM شيخة' },
        ],

        goal: {
            primary:   'ربط فروع شيخة التجارية ضمن المنطقة الجغرافية الواحدة ببنية بيانات موحّدة',
            secondary: 'مزامنة المخزون والأسعار والعروض عبر كل الفروع آنياً',
            kpi:       { sync_lag: '< 100ms', branch_count: '50+', bandwidth: '10 Gbps' },
        },

        elements: [
            { id: 'CORE_SWITCH',   nameAr: 'مبدّل مركزي للفروع',              role: 'قلب الشبكة بين الفروع' },
            { id: 'MPLS_RING',     nameAr: 'حلقة MPLS بين الفروع',           role: 'ضمان وصول البيانات حتى عند عطل رابط' },
            { id: 'SYNC_ENGINE',   nameAr: 'محرك مزامنة المخزون والأسعار',    role: 'تحديث البيانات عبر الفروع' },
            { id: 'BRANCH_FW',     nameAr: 'جدار حماية CAN شيخة',            role: 'Waterline — عزل حركة الفروع' },
        ],

        process: {
            mechanism: 'MPLS Ring Topology → Branch Sync → Central Aggregation → SCM Update',
            protocol:  'MPLS / BGP / OSPF / TCP/IP / TLS 1.3',
            standard:  'MEF CE 2.0 | IEEE 802.1Q | ISO 27001',
        },

        output: [
            { id: 'UNIFIED_STOCK',  nameAr: 'مخزون موحّد بين الفروع',          type: 'DATA',     destination: 'CELL_SHEIKHA_MAN / SCM' },
            { id: 'PRICE_SYNC',     nameAr: 'تزامن الأسعار العادلة',           type: 'PRICING',  destination: 'كل CELL_SHEIKHA_LAN' },
            { id: 'BRANCH_REPORT',  nameAr: 'تقرير أداء الفروع',               type: 'REPORT',   destination: 'CELL_SHEIKHA_NEURAL / لوحة القيادة' },
        ],

        effect: {
            immediate:  'رؤية موحّدة لمخزون وأسعار كل الفروع',
            short_term: 'تحسين توزيع البضائع ومنع نفاد المخزون',
            long_term:  'شبكة فروع شيخة المتكاملة في كل مدينة',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_MAN',   signal_type: 'METRO_UPLINK',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_LAN',   signal_type: 'BRANCH_DOWNLINK',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_TCPIP', signal_type: 'ROUTING',          strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',signal_type: 'STOCK_ANALYTICS',  strength: 0.9 },
            { to_cell_id: 'CELL_FIBER',         signal_type: 'FIBER_BACKBONE',   strength: 1.0 },
        ],

        quran_ref:   { ref: 'الحشر:٧', text: 'كَيْ لَا يَكُونَ دُولَةً بَيْنَ الْأَغْنِيَاءِ مِنكُمْ' },
        sharia_note: 'توزيع الثروة والبضاعة عادلاً — لا احتكار لا تمييز بين الفروع',
    },

    // ─── خلية 5: Sheikha MAN ──────────────────────────────────────────────────
    CELL_SHEIKHA_MAN: {
        id:         'CELL_SHEIKHA_MAN',
        nameAr:     'خلية Sheikha MAN — شبكة المدينة للمناطق التجارية',
        nameEn:     'Sheikha Metropolitan Area Network Cell',
        icon:       '🏙️',
        domain:     'SHEIKHA',
        layerOrder: 5,
        activation: 0.88,

        inputs: [
            { id: 'CAN_TRAFFIC',    nameAr: 'حركة بيانات CAN الفروع',          type: 'DATA',     source: 'CELL_SHEIKHA_CAN × M منطقة' },
            { id: 'MARKET_FEEDS',   nameAr: 'بيانات أسواق المدينة',            type: 'MARKET',   source: 'أسواق التجزئة والجملة' },
            { id: 'LOGISTICS_IN',   nameAr: 'شحنات اللوجستيات الواردة',        type: 'LOGISTICS',source: 'CELL_LOGISTICS' },
        ],

        goal: {
            primary:   'ربط كل الأسواق والمناطق التجارية داخل المدينة الواحدة بشبكة شيخة المتكاملة',
            secondary: 'مراقبة حركة التجارة في المدينة وتحسين توزيع البضائع',
            kpi:       { coverage: 'المدينة كاملة', latency: '< 5ms', zones: '20+ منطقة تجارية' },
        },

        elements: [
            { id: 'METRO_RING',    nameAr: 'حلقة Metro Ethernet',              role: 'العمود الفقري لشبكة المدينة' },
            { id: 'WIMAX_TOWERS',  nameAr: 'أبراج WiMAX للمناطق البعيدة',    role: 'تغطية المناطق غير المكبّلة' },
            { id: 'CITY_NOC',      nameAr: 'مركز عمليات شبكة المدينة',        role: 'المراقبة والتحكم المركزي' },
            { id: 'MAN_FW',        nameAr: 'جدار حماية MAN شيخة',             role: 'Waterline — حماية شبكة المدينة' },
        ],

        process: {
            mechanism: 'CAN Aggregation → Metro Core → Market Data Fusion → City Dashboard',
            protocol:  'Metro Ethernet (MEF) / SDH / DWDM / TLS 1.3',
            standard:  'MEF 3.0 | ITU-T G.8032 | IEEE 802.17',
        },

        output: [
            { id: 'CITY_COMMERCE',  nameAr: 'بيانات التجارة الموحّدة للمدينة', type: 'DATA',     destination: 'CELL_SHEIKHA_WAN / التقارير' },
            { id: 'LOGISTICS_OPT',  nameAr: 'تحسين مسارات التوصيل المدينة',   type: 'ROUTING',  destination: 'CELL_LOGISTICS' },
            { id: 'MARKET_PULSE',   nameAr: 'نبض سوق المدينة اللحظي',          type: 'ANALYTICS',destination: 'CELL_SHEIKHA_NEURAL' },
        ],

        effect: {
            immediate:  'رؤية تجارية شاملة لكل أسواق المدينة',
            short_term: 'تحسين الكفاءة اللوجستية ورفع مستوى الخدمة',
            long_term:  'المدينة التجارية الذكية — نموذج شيخة للمدن الإسلامية',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'NATIONAL_UPLINK', strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_CAN',   signal_type: 'METRO_DOWNLINK',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',signal_type: 'CITY_DATA',       strength: 0.9 },
            { to_cell_id: 'CELL_LOGISTICS',     signal_type: 'CITY_LOGISTICS',  strength: 0.9 },
            { to_cell_id: 'CELL_5G',            signal_type: 'MOBILE_BACKHAUL', strength: 0.8 },
        ],

        quran_ref:   { ref: 'النور:٣٧', text: 'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ' },
        sharia_note: 'التجارة والعبادة — يجمع سوق شيخة بين التجارة الدنيوية والقيم الإسلامية',
    },

    // ─── خلية 6: Sheikha WAN ──────────────────────────────────────────────────
    CELL_SHEIKHA_WAN: {
        id:         'CELL_SHEIKHA_WAN',
        nameAr:     'خلية Sheikha WAN — الشبكة الواسعة للأسواق الدولية',
        nameEn:     'Sheikha Wide Area Network Cell',
        icon:       '🌍',
        domain:     'SHEIKHA',
        layerOrder: 6,
        activation: 0.85,

        inputs: [
            { id: 'MAN_FEEDS',      nameAr: 'بيانات من كل مدن شيخة',          type: 'DATA',     source: 'CELL_SHEIKHA_MAN × N مدينة' },
            { id: 'INTL_TRADE',     nameAr: 'بيانات التجارة الدولية',          type: 'TRADE',    source: 'منصة التبادل الدولي' },
            { id: 'SAT_LINK',       nameAr: 'اتصال الأقمار الصناعية',          type: 'SAT',      source: 'CELL_SATELLITE' },
        ],

        goal: {
            primary:   'ربط شبكة شيخة التجارية بين المدن والدول والأسواق الدولية',
            secondary: 'تسهيل التجارة العربية والإسلامية الدولية الخالية من الربا',
            kpi:       { countries: '57 دولة إسلامية', latency: '< 50ms (MENA)', bandwidth: '100 Gbps' },
        },

        elements: [
            { id: 'BGP_ROUTER',    nameAr: 'موجّه BGP للتوجيه الدولي',       role: 'اختيار أفضل مسار بين الدول' },
            { id: 'SUBMARINE_GW',  nameAr: 'بوابة الكابلات البحرية',          role: 'الربط القاري بالكابلات' },
            { id: 'IX_PEERING',    nameAr: 'نقاط التبادل (IXP) الإقليمية',   role: 'تبادل الحركة مع الشركاء' },
            { id: 'WAN_FW',        nameAr: 'جدار حماية WAN شيخة',            role: 'Waterline — صد الهجمات الدولية' },
            { id: 'CDN_NODES',     nameAr: 'عقد شبكة توصيل المحتوى (CDN)',   role: 'تقديم محتوى شيخة محلياً' },
        ],

        process: {
            mechanism: 'BGP Route Selection → MPLS Core → Submarine/Satellite Link → Partner Markets',
            protocol:  'BGP-4 / MPLS / IS-IS / TLS 1.3 / QUIC',
            standard:  'RFC 4271 | ITU-T G.709 | ISO 27001',
        },

        output: [
            { id: 'GLOBAL_MARKET',  nameAr: 'وصول للأسواق الدولية',           type: 'COMMERCE', destination: 'شركاء شيخة الدوليون' },
            { id: 'TRADE_DATA',     nameAr: 'بيانات التجارة العالمية',         type: 'DATA',     destination: 'CELL_SHEIKHA_NEURAL / التحليل' },
            { id: 'INTL_PAYMENTS',  nameAr: 'مدفوعات دولية إسلامية',          type: 'PAYMENT',  destination: 'CELL_SHEIKHA_PAY' },
        ],

        effect: {
            immediate:  'وصول المنتجات الإسلامية للمستهلكين حول العالم',
            short_term: 'ترسيخ شيخة كمنصة التجارة الإسلامية الدولية',
            long_term:  'نظام تجارة عالمي خالٍ من الربا ومبني على العدل',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_VPN',   signal_type: 'SECURE_TUNNEL',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_MAN',   signal_type: 'WAN_DOWNLINK',    strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',signal_type: 'GLOBAL_MARKET',   strength: 0.9 },
            { to_cell_id: 'CELL_SATELLITE',     signal_type: 'SAT_BACKUP',      strength: 0.9 },
            { to_cell_id: 'CELL_MARITIME',      signal_type: 'TRADE_VESSEL',    strength: 0.8 },
        ],

        quran_ref:   { ref: 'قريش:٢', text: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ' },
        sharia_note: 'التجارة الدولية سنة نبوية — والمسلمون أمة التجارة العادلة',
    },

    // ─── خلية 7: Sheikha VPN ──────────────────────────────────────────────────
    CELL_SHEIKHA_VPN: {
        id:         'CELL_SHEIKHA_VPN',
        nameAr:     'خلية Sheikha VPN — تشفير الاتصالات التجارية الحساسة',
        nameEn:     'Sheikha Virtual Private Network Cell',
        icon:       '🔒',
        domain:     'SHEIKHA',
        layerOrder: 7,
        activation: 0.95,

        inputs: [
            { id: 'WAN_TRAFFIC',    nameAr: 'حركة البيانات الخام',             type: 'DATA',     source: 'CELL_SHEIKHA_WAN' },
            { id: 'PARTNER_CONN',   nameAr: 'اتصالات الشركاء والموردين',      type: 'B2B',      source: 'شركاء التجارة الدولية' },
            { id: 'SENSITIVE_DATA', nameAr: 'بيانات حساسة (عقود/مدفوعات)',    type: 'SECRET',   source: 'CELL_SHEIKHA_LAN / المركز' },
        ],

        goal: {
            primary:   'تأمين كل الاتصالات التجارية الحساسة بنفق مشفّر غير قابل للاختراق',
            secondary: 'ضمان خصوصية بيانات البائعين والمشترين والعقود التجارية',
            kpi:       { encryption: 'AES-256-GCM', handshake: '< 100ms', throughput: '10 Gbps' },
        },

        elements: [
            { id: 'WIREGUARD',     nameAr: 'نفق WireGuard الخفيف والسريع',   role: 'التشفير الأساسي للاتصالات' },
            { id: 'IPSEC_GW',      nameAr: 'بوابة IPSec IKEv2 للشركاء',     role: 'VPN مع الشركاء التقليديين' },
            { id: 'PKI_SHEIKHA',   nameAr: 'بنية مفاتيح شيخة العامة PKI',    role: 'إصدار الشهادات والتوقيع الرقمي' },
            { id: 'VPN_GATEWAY',   nameAr: 'بوابة VPN المركزية',             role: 'إدارة نفق التشفير' },
            { id: 'ZERO_TRUST_GW', nameAr: 'بوابة Zero-Trust شيخة',          role: 'لا ثقة افتراضية — كل طلب يُتحقق منه' },
        ],

        process: {
            mechanism: 'Mutual Auth (mTLS) → WireGuard Tunnel → AES-256-GCM Encryption → Secure Transit',
            protocol:  'WireGuard / IPSec IKEv2 / TLS 1.3 / mTLS',
            standard:  'NIST SP 800-77 | RFC 8446 | ISO 27001',
        },

        output: [
            { id: 'SECURE_CHANNEL', nameAr: 'قناة اتصال مشفّرة آمنة',         type: 'ENCRYPTED',destination: 'كل طبقات شبكة شيخة' },
            { id: 'B2B_TUNNEL',     nameAr: 'نفق B2B مع الموردين',            type: 'TUNNEL',   destination: 'CELL_SHEIKHA_WAN' },
            { id: 'AUDIT_LOG',      nameAr: 'سجل مراجعة الاتصالات',           type: 'LOG',      destination: 'CELL_SHEIKHA_SHTTP / التدقيق' },
        ],

        effect: {
            immediate:  'حماية كل معاملة تجارية من التنصت والتلاعب',
            short_term: 'ثقة الشركاء التجاريين في منظومة شيخة',
            long_term:  'أأمن منظومة تجارة رقمية إسلامية في العالم',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'TLS_LAYER',      strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'ENCRYPTED_DATA', strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_TCPIP', signal_type: 'ENCAP_PACKETS',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_DNS',   signal_type: 'DNS_OVER_TLS',   strength: 0.9 },
        ],

        quran_ref:   { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
        sharia_note: 'أداء الأمانة — البيانات التجارية أمانة تُؤدّى مشفّرة محمية',
    },

    // ─── خلية 8: Sheikha TCP/IP ───────────────────────────────────────────────
    CELL_SHEIKHA_TCPIP: {
        id:         'CELL_SHEIKHA_TCPIP',
        nameAr:     'خلية Sheikha TCP/IP — الأساس البروتوكولي لكل الاتصالات',
        nameEn:     'Sheikha TCP/IP Protocol Stack Cell',
        icon:       '🔗',
        domain:     'SHEIKHA',
        layerOrder: 8,
        activation: 1.0,

        inputs: [
            { id: 'APP_DATA',       nameAr: 'بيانات التطبيقات (HTTP/WS/…)',   type: 'APP',      source: 'CELL_SHEIKHA_HTTPS / كل التطبيقات' },
            { id: 'RAW_PACKETS',    nameAr: 'حزم بيانات خام',                 type: 'PACKETS',  source: 'كل الطبقات الأدنى' },
            { id: 'NETWORK_STACK',  nameAr: 'مكدس الشبكة من نواة Linux',       type: 'OS',       source: 'خوادم شيخة' },
        ],

        goal: {
            primary:   'توفير ركيزة البروتوكول الشاملة لكل اتصالات شبكة شيخة',
            secondary: 'ضمان وصول البيانات الصحيح والمرتّب عبر كل الطبقات',
            kpi:       { packet_loss: '< 0.01%', retransmission: 'auto', throughput: '100 Gbps' },
        },

        elements: [
            { id: 'TCP_LAYER',     nameAr: 'طبقة TCP — توصيل موثوق',          role: 'ضمان الترتيب وإعادة الإرسال' },
            { id: 'UDP_LAYER',     nameAr: 'طبقة UDP — توصيل سريع',           role: 'البث المباشر والألعاب' },
            { id: 'IPv6_STACK',    nameAr: 'مكدس IPv6 الأساسي',               role: 'عنونة كل جهاز في الشبكة' },
            { id: 'QUIC_PROTO',    nameAr: 'بروتوكول QUIC / HTTP3',            role: 'سرعة اتصال مع تشفير TLS' },
            { id: 'LOAD_BALANCER', nameAr: 'موزّع الحمل بين الخوادم',          role: 'توزيع الطلبات بعدل بين الخوادم' },
        ],

        process: {
            mechanism: 'Segment → Route → Deliver → ACK — دورة حياة الحزمة الكاملة',
            protocol:  'TCP / UDP / QUIC / IPv4 / IPv6 / ICMP',
            standard:  'RFC 793 (TCP) | RFC 768 (UDP) | RFC 2460 (IPv6) | RFC 9000 (QUIC)',
        },

        output: [
            { id: 'RELIABLE_DATA',  nameAr: 'بيانات مرتّبة موثوقة',           type: 'DATA',     destination: 'CELL_SHEIKHA_HTTPS / كل التطبيقات' },
            { id: 'ROUTING_TABLE',  nameAr: 'جدول التوجيه المحدّث',            type: 'ROUTING',  destination: 'CELL_SHEIKHA_WAN / CELL_SHEIKHA_CAN' },
            { id: 'FLOW_METRICS',   nameAr: 'مقاييس تدفق البيانات',            type: 'METRICS',  destination: 'CELL_SHEIKHA_SHTTP / المراقبة' },
        ],

        effect: {
            immediate:  'وصول كل رسالة لوجهتها بسلامة وترتيب',
            short_term: 'استقرار خدمات شيخة التجارية',
            long_term:  'البنية التحتية البروتوكولية لسوق شيخة الكوني',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_HTTPS', signal_type: 'TRANSPORT_UP',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_VPN',   signal_type: 'PACKET_ENCAP',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'IP_ROUTING',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_DNS',   signal_type: 'DNS_QUERY',      strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'FLOW_REPORT',    strength: 0.8 },
        ],

        quran_ref:   { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
        sharia_note: 'كل بروتوكول = لغة — وشيخة تتقن لغة البيانات لخدمة الإنسان',
    },

    // ─── خلية 9: Sheikha HTTP/HTTPS ───────────────────────────────────────────
    CELL_SHEIKHA_HTTPS: {
        id:         'CELL_SHEIKHA_HTTPS',
        nameAr:     'خلية Sheikha HTTP/HTTPS — بروتوكولات التطبيقات والواجهات',
        nameEn:     'Sheikha HTTP/HTTPS Application Layer Cell',
        icon:       '🌐',
        domain:     'SHEIKHA',
        layerOrder: 9,
        activation: 1.0,

        inputs: [
            { id: 'API_REQUEST',    nameAr: 'طلب API من تطبيق أو جهاز',       type: 'HTTP',     source: 'تطبيق شيخة / متصفح / شريك' },
            { id: 'TCP_STREAM',     nameAr: 'تيار TCP من طبقة النقل',          type: 'TCP',      source: 'CELL_SHEIKHA_TCPIP' },
            { id: 'TLS_HANDSHAKE',  nameAr: 'مصافحة TLS 1.3',                 type: 'TLS',      source: 'CELL_SHEIKHA_VPN / المتصفح' },
        ],

        goal: {
            primary:   'توفير واجهات تطبيقات (APIs) سريعة وآمنة لخدمات سوق شيخة',
            secondary: 'تقديم الويب والموبايل وتكاملات B2B عبر HTTPS مع TLS 1.3',
            kpi:       { response: '< 200ms p95', rps: '100,000 req/s', tls: 'TLS 1.3 mandatory' },
        },

        elements: [
            { id: 'API_GATEWAY',   nameAr: 'بوابة API شيخة المركزية',         role: 'التحكم في كل طلبات الـ API' },
            { id: 'HTTP3_SERVER',  nameAr: 'خادم HTTP/3 + QUIC',              role: 'أسرع بروتوكول ويب' },
            { id: 'WEBSOCKET',     nameAr: 'WebSocket للتحديثات الفورية',     role: 'أسعار وطلبات مباشرة' },
            { id: 'GRAPHQL',       nameAr: 'GraphQL لاستعلامات السوق',        role: 'جلب البيانات بمرونة' },
            { id: 'REST_LAYER',    nameAr: 'REST API الكامل لشيخة',           role: 'كل وظائف السوق كـ API' },
        ],

        process: {
            mechanism: 'TLS Handshake → HTTP/3 Request → API Gateway → Service Router → Response',
            protocol:  'HTTP/1.1 / HTTP/2 / HTTP/3 / WebSocket / TLS 1.3 / HSTS',
            standard:  'RFC 9114 (HTTP/3) | RFC 8446 (TLS 1.3) | OWASP API Top 10',
        },

        output: [
            { id: 'API_RESPONSE',   nameAr: 'استجابة API لطلب العميل',        type: 'HTTP',     destination: 'التطبيق / المتصفح / الشريك' },
            { id: 'WS_EVENTS',      nameAr: 'أحداث فورية للأسعار والطلبات',   type: 'EVENT',    destination: 'CELL_SHEIKHA_DBUS / العملاء' },
            { id: 'ACCESS_LOG',     nameAr: 'سجل وصول مراجعة شاملة',          type: 'LOG',      destination: 'CELL_SHEIKHA_SHTTP / الأمان' },
        ],

        effect: {
            immediate:  'خدمة كل طلب من المستخدمين والشركاء في < 200ms',
            short_term: 'تجربة مستخدم سلسة وسريعة',
            long_term:  'منصة API عالمية لسوق شيخة الإسلامي',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'SOVEREIGN_CHECK', strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_TCPIP', signal_type: 'TCP_LAYER_DOWN',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',signal_type: 'REQUEST_FEED',    strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_DBUS',  signal_type: 'EVENT_PUBLISH',   strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_DNS',   signal_type: 'SERVICE_LOOKUP',  strength: 0.9 },
        ],

        quran_ref:   { ref: 'الإسراء:٣٦', text: 'وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ' },
        sharia_note: 'التثبت في المعلومات — كل API يُتحقق من طالبه قبل تقديم البيانات',
    },

    // ─── خلية 10 👑: Sheikha SHTTP/HTTPS — الطبقة الحاكمة ────────────────────
    CELL_SHEIKHA_SHTTP: {
        id:         'CELL_SHEIKHA_SHTTP',
        nameAr:     'خلية Sheikha SHTTP/HTTPS — الطبقة الحاكمة لكل الشبكة',
        nameEn:     'Sheikha Sovereign HTTPS — Governing Neural Cell',
        icon:       '👑',
        domain:     'SHEIKHA',
        layerOrder: 10,
        activation: 1.0,
        sovereign:  true,

        inputs: [
            { id: 'ALL_LAYERS_UP',  nameAr: 'إشارات من كل الطبقات (1–9)',      type: 'MULTI',    source: 'كل CELL_SHEIKHA_*' },
            { id: 'SHARIA_ORACLE',  nameAr: 'حكم الرقابة الشرعية',             type: 'SHARIA',   source: 'محرك الشريعة الإسلامية' },
            { id: 'CERT_CHAIN',     nameAr: 'سلسلة شهادات TLS شيخة',           type: 'PKI',      source: 'PKI شيخة المركزية' },
            { id: 'POLICY_ENGINE',  nameAr: 'محرك سياسة Zero-Trust',            type: 'POLICY',   source: 'CELL_SHEIKHA_WATERLINE' },
        ],

        goal: {
            primary:   'الإشراف الحاكم على كل طبقات شبكة شيخة — الرقابة الشاملة والتشغيل الموحّد',
            secondary: 'ضمان الامتثال الشرعي التام وحماية حقوق كل أطراف المعاملة',
            kpi:       { govern_layers: 9, sharia_compliance: '100%', zero_trust: 'enforced', mtls: 'mandatory' },
        },

        elements: [
            { id: 'SOVEREIGN_CTRL', nameAr: 'وحدة التحكم الحاكمة',            role: 'صنع القرار النهائي لكل الطبقات' },
            { id: 'SHARIA_ENGINE',  nameAr: 'محرك الرقابة الشرعية المركزي',   role: 'الموافقة الشرعية على كل معاملة' },
            { id: 'MTLS_ENFORCER',  nameAr: 'مطبّق mTLS الإلزامي',            role: 'المصادقة المتبادلة في كل اتصال' },
            { id: 'ZERO_TRUST',     nameAr: 'نظام Zero-Trust الكامل',          role: 'لا ثقة بأي طلب حتى يُثبت أحقيته' },
            { id: 'AUDIT_MASTER',   nameAr: 'سجل التدقيق الرئيسي',            role: 'توثيق كل حدث في الشبكة' },
            { id: 'AES256_VAULT',   nameAr: 'خزينة مفاتيح AES-256',           role: 'تخزين وإدارة مفاتيح التشفير' },
            { id: 'CERT_AUTHORITY', nameAr: 'مرجع إصدار شهادات شيخة',         role: 'CA الداخلية لشهادات TLS' },
        ],

        process: {
            mechanism: 'Policy Check → Sharia Verify → mTLS Enforce → AES-256 Transit → Audit Log → Approve',
            protocol:  'TLS 1.3 (mandatory) / mTLS / HSTS / Certificate Pinning / AES-256-GCM',
            standard:  'NIST Zero Trust (SP 800-207) | RFC 8446 | ISO 27001 | OWASP | شريعة إسلامية',
        },

        output: [
            { id: 'GOVERN_SIGNAL',  nameAr: 'إشارة الحوكمة لكل الطبقات',      type: 'GOVERN',   destination: 'كل CELL_SHEIKHA_* (1-9)' },
            { id: 'SHARIA_CERT',    nameAr: 'شهادة الامتثال الشرعي',           type: 'CERT',     destination: 'البائع والمشتري والشريك' },
            { id: 'SECURITY_ALERT', nameAr: 'تنبيه أمني للحوادث',             type: 'ALERT',    destination: 'CELL_SHEIKHA_WATERLINE / الإدارة' },
            { id: 'POLICY_UPDATE',  nameAr: 'تحديث سياسات الأمان',            type: 'POLICY',   destination: 'كل طبقات شبكة شيخة' },
        ],

        effect: {
            immediate:  'حماية فورية لكل معاملة في منظومة شيخة',
            short_term: 'ثقة كاملة من البائعين والمشترين والشركاء',
            long_term:  'أكثر منظومة تجارة رقمية موثوقة في العالم الإسلامي',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_PAN',   signal_type: 'GOVERN_PAN',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_LAN',   signal_type: 'GOVERN_LAN',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_WLAN',  signal_type: 'GOVERN_WLAN',    strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_CAN',   signal_type: 'GOVERN_CAN',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_MAN',   signal_type: 'GOVERN_MAN',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'GOVERN_WAN',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_VPN',   signal_type: 'GOVERN_VPN',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_TCPIP', signal_type: 'GOVERN_TCPIP',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_HTTPS', signal_type: 'GOVERN_HTTPS',   strength: 1.0 },
        ],

        quran_ref:   { ref: 'يوسف:٢١', text: 'وَاللَّهُ غَالِبٌ عَلَى أَمْرِهِ وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ' },
        sharia_note: 'الحاكمية لله وحده — شيخة SHTTP طبقة الحوكمة المبنية على مبادئ الشريعة',
    },

    // ─── خلية مساعدة: Sheikha DNS Neural ─────────────────────────────────────
    CELL_SHEIKHA_DNS: {
        id:         'CELL_SHEIKHA_DNS',
        nameAr:     'خلية Sheikha DNS — توجيه الخدمات الداخلية',
        nameEn:     'Sheikha Internal DNS Neural Cell',
        icon:       '🗂️',
        domain:     'SHEIKHA',
        layerOrder: 0,
        activation: 1.0,

        inputs: [
            { id: 'SERVICE_QUERY',  nameAr: 'استعلام عن اسم خدمة',            type: 'QUERY',    source: 'أي خلية في الشبكة' },
            { id: 'REGISTRY',       nameAr: 'سجل الخدمات المدمج',              type: 'REGISTRY', source: 'BUILT_IN_RECORDS' },
            { id: 'HEALTH_STATUS',  nameAr: 'حالة صحة الخدمات',               type: 'HEALTH',   source: 'Health Check Engine' },
        ],

        goal: {
            primary:   'تحويل أسماء الخدمات إلى عناوين فعلية ضمن منظومة شيخة',
            secondary: 'توجيه الطلبات للخادم الخلفي الأمثل (Load Balancing)',
            kpi:       { resolve_ms: '< 1ms', records: '50+ سجل', zones: '7 مناطق' },
        },

        elements: [
            { id: 'DNS_ZONES',     nameAr: '7 مناطق DNS شيخة',                role: 'تنظيم السجلات حسب الوظيفة' },
            { id: 'TTL_CACHE',     nameAr: 'ذاكرة TTL للسجلات',               role: 'تسريع الاستعلامات المتكررة' },
            { id: 'LB_ENGINE',     nameAr: 'محرك موازنة التحميل Round-Robin', role: 'توزيع الطلبات على الخوادم' },
            { id: 'REVERSE_DNS',   nameAr: 'البحث العكسي IP → اسم',           role: 'تحديد هوية الخادم من عنوانه' },
        ],

        process: {
            mechanism: 'Query → Cache Check → Zone Lookup → CNAME Chain → LB Select → Return SRV',
            protocol:  'Sheikha Internal DNS Protocol v2.0',
            standard:  'RFC 1034/1035 (مُكيَّف داخلياً)',
        },

        output: [
            { id: 'SRV_RECORD',    nameAr: 'سجل SRV للخدمة المطلوبة',        type: 'RECORD',   destination: 'الخلية الطالبة' },
            { id: 'LB_ENDPOINT',   nameAr: 'نقطة نهاية موازنة التحميل',       type: 'ENDPOINT', destination: 'الخادم الخلفي المختار' },
        ],

        effect: {
            immediate:  'توجيه كل طلب للخدمة الصحيحة في < 1ms',
            short_term: 'استقرار كامل لخدمات شيخة',
            long_term:  'DNS داخلي إسلامي مستقل ومحمي',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_TCPIP', signal_type: 'DNS_OVER_TCP',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_VPN',   signal_type: 'DNS_OVER_TLS',   strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'SERVICE_MAP',    strength: 0.9 },
        ],

        quran_ref:   { ref: 'البقرة:١٤٨', text: 'وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا' },
        sharia_note: 'لكل خدمة وجهة — وشيخة DNS يعرف وجهة كل طلب',
    },

    // ─── خلية مساعدة: Sheikha DBUS Neural ────────────────────────────────────
    CELL_SHEIKHA_DBUS: {
        id:         'CELL_SHEIKHA_DBUS',
        nameAr:     'خلية Sheikha DBUS — ناقل الرسائل بين الخدمات',
        nameEn:     'Sheikha D-Bus Microservices Message Bus Cell',
        icon:       '🚌',
        domain:     'SHEIKHA',
        layerOrder: 0,
        activation: 1.0,

        inputs: [
            { id: 'SERVICE_EVENT',  nameAr: 'حدث من خدمة مصدر',               type: 'EVENT',    source: 'أي خدمة في منظومة شيخة' },
            { id: 'MARKET_EVENTS',  nameAr: 'أحداث السوق (سعر/طلب/دفع)',     type: 'MARKET',   source: 'CELL_SHEIKHA_LAN / HTTPS' },
        ],

        goal: {
            primary:   'توصيل الرسائل بين خدمات شيخة المصغرة بسرعة وموثوقية',
            secondary: 'فصل الخدمات (Decoupling) لتمكين التطوير المستقل',
            kpi:       { channels: 21, delivery_ms: '< 5ms', subscribers: 'غير محدود' },
        },

        elements: [
            { id: 'PUB_SUB',       nameAr: 'نظام النشر والاشتراك',             role: 'توصيل الأحداث للمشتركين' },
            { id: 'MSG_QUEUE',     nameAr: 'طابور الرسائل المتحمل للفشل',     role: 'حفظ الرسائل عند الانقطاع' },
            { id: 'SHARIA_FILTER', nameAr: 'فلتر المحتوى الشرعي للرسائل',     role: 'منع الرسائل غير المشروعة' },
        ],

        process: {
            mechanism: 'Publish → Sharia Filter → Queue → Fan-out → Deliver to Subscribers',
            protocol:  'Sheikha DBUS Protocol v1.0 (EventEmitter-based)',
            standard:  'D-Bus Specification (مُكيَّف) | ISO 11898',
        },

        output: [
            { id: 'MSG_DELIVERED',  nameAr: 'رسالة موصلة للمشترك',            type: 'MESSAGE',  destination: 'الخدمة المشتركة' },
            { id: 'DBUS_LOG',       nameAr: 'سجل الرسائل',                    type: 'LOG',      destination: 'CELL_SHEIKHA_SHTTP / التدقيق' },
        ],

        effect: {
            immediate:  'تبادل فوري للأحداث بين خدمات شيخة',
            short_term: 'تطبيق رشيق قابل للتوسع',
            long_term:  'نظام رسائل إسلامي متكامل للمنصات الرقمية',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_HTTPS', signal_type: 'EVENT_BRIDGE',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',signal_type: 'FEED_NEURAL',    strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'AUDIT_FEED',     strength: 0.8 },
        ],

        quran_ref:   { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        sharia_note: 'التعاون الرقمي — الخدمات تتعاون عبر DBUS كما يتعاون المؤمنون',
    },

    // ─── خلية مساعدة: Sheikha Neural Market ──────────────────────────────────
    CELL_SHEIKHA_NEURAL: {
        id:         'CELL_SHEIKHA_NEURAL',
        nameAr:     'خلية Sheikha Neural — الشبكة العصبية للسوق',
        nameEn:     'Sheikha Market Neural Network Cell',
        icon:       '🧠',
        domain:     'SHEIKHA',
        layerOrder: 0,
        activation: 0.95,

        inputs: [
            { id: 'MARKET_DATA',    nameAr: 'بيانات السوق اللحظية',            type: 'MARKET',   source: 'CELL_SHEIKHA_LAN / MAN / WAN' },
            { id: 'USER_BEHAVIOR',  nameAr: 'سلوك المستخدمين',                type: 'BEHAVIOR', source: 'CELL_SHEIKHA_WLAN / PAN' },
            { id: 'SAT_DATA',       nameAr: 'بيانات الأقمار (GPS/طقس/زراعة)', type: 'SAT',      source: 'CELL_SATELLITE' },
            { id: 'PRICE_FEED',     nameAr: 'تغذية الأسعار',                   type: 'PRICE',    source: 'CELL_SHEIKHA_HTTPS / APIs' },
        ],

        goal: {
            primary:   'تحليل بيانات السوق وإنتاج توصيات ذكية وتنبيهات مبكرة',
            secondary: 'ربط العرض بالطلب وتحقيق سعر عادل شرعياً',
            kpi:       { inference_ms: '< 100ms', accuracy: '> 85%', sharia_check: '100%' },
        },

        elements: [
            { id: 'INPUT_LAYER',   nameAr: 'طبقة إدخال البيانات',              role: 'استقبال إشارات السوق' },
            { id: 'HIDDEN_H1',     nameAr: 'طبقة مخفية 1 — تحليل الطلب',      role: 'رصد الأنماط والطلب' },
            { id: 'HIDDEN_H2',     nameAr: 'طبقة مخفية 2 — التنبؤ بالأسعار', role: 'حساب السعر العادل' },
            { id: 'HIDDEN_H3',     nameAr: 'طبقة مخفية 3 — رصد الجودة',      role: 'تصنيف المنتجات' },
            { id: 'OUTPUT_LAYER',  nameAr: 'طبقة الإخراج — التوصيات',        role: 'إنتاج التوصيات والتنبيهات' },
        ],

        process: {
            mechanism: 'Input Normalize → H1 Demand → H2 Price → H3 Quality → Output Recommendations',
            protocol:  'Sheikha Market Neural v1.0',
            standard:  'ISO AI (in progress) + أحكام البيع والشراء الإسلامية',
        },

        output: [
            { id: 'RECOMMENDATIONS',nameAr: 'توصيات ذكية للبائع والمشتري',   type: 'RECO',     destination: 'تطبيق شيخة / CELL_SHEIKHA_HTTPS' },
            { id: 'RISK_ALERTS',    nameAr: 'تنبيهات مخاطر السوق',           type: 'ALERT',    destination: 'CELL_SHEIKHA_DBUS' },
            { id: 'FAIR_PRICE',     nameAr: 'مقترح السعر العادل الشرعي',      type: 'PRICING',  destination: 'CELL_SHEIKHA_LAN / نظام الأسعار' },
        ],

        effect: {
            immediate:  'توصيات فورية لكل مستخدم',
            short_term: 'تحسين مبيعات البائعين وجودة الشراء للمشترين',
            long_term:  'سوق إسلامي ذكي يقترب من العدل الكامل في التسعير',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_HTTPS', signal_type: 'RECO_SERVE',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_DBUS',  signal_type: 'ALERT_PUBLISH',  strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'AUDIT_DECISION', strength: 0.8 },
            { to_cell_id: 'CELL_SATELLITE',     signal_type: 'SAT_ANALYTICS',  strength: 0.8 },
        ],

        quran_ref:   { ref: 'النساء:١١٣', text: 'وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا' },
        sharia_note: 'العلم نور — الذكاء الاصطناعي خادم للتاجر المؤمن، لا سيد عليه',
    },

    // ─── خلية مساعدة: Sheikha Waterline ─────────────────────────────────────
    CELL_SHEIKHA_WATERLINE: {
        id:         'CELL_SHEIKHA_WATERLINE',
        nameAr:     'خلية Sheikha Waterline — خط الأمان الرقمي',
        nameEn:     'Sheikha Waterline Security Cell',
        icon:       '🛡️',
        domain:     'SHEIKHA',
        layerOrder: 0,
        activation: 1.0,

        inputs: [
            { id: 'ALL_REQUESTS',   nameAr: 'كل الطلبات عبر شبكة شيخة',       type: 'REQUEST',  source: 'كل الطبقات' },
            { id: 'THREAT_FEED',    nameAr: 'تغذية بيانات التهديدات',          type: 'THREAT',   source: 'مصادر الأمن الدولية' },
            { id: 'BLOCKLIST',      nameAr: 'قائمة العناوين المحظورة',         type: 'POLICY',   source: 'سياسات شيخة الأمنية' },
        ],

        goal: {
            primary:   'تشكيل خط الأمان (Waterline) لكل طبقة في شبكة شيخة',
            secondary: 'منع الهجمات والحماية من التجسس والحفاظ على الخصوصية',
            kpi:       { attack_block: '> 99%', false_positive: '< 0.1%', latency_added: '< 1ms' },
        },

        elements: [
            { id: 'RATE_LIMITER',  nameAr: 'محدّد معدل الطلبات',              role: 'الحماية من هجمات DoS' },
            { id: 'IP_BLOCKLIST',  nameAr: 'قائمة حظر العناوين',              role: 'منع الجهات الخبيثة' },
            { id: 'AES256_ENC',    nameAr: 'تشفير AES-256-GCM',               role: 'حماية البيانات في الانتقال' },
            { id: 'ZERO_TRUST_EN', nameAr: 'محرك Zero-Trust',                  role: 'لا ثقة افتراضية' },
            { id: 'SHARIA_SCAN',   nameAr: 'مسح شرعي للمحتوى',               role: 'فلترة المحتوى المحرّم' },
        ],

        process: {
            mechanism: 'Request → Rate Check → Blocklist → Body Scan → Sharia Filter → Allow/Block',
            protocol:  'Sheikha Zero-Trust v1.0 / AES-256-GCM / TLS 1.3',
            standard:  'NIST SP 800-207 | OWASP | CIS Controls',
        },

        output: [
            { id: 'ALLOW_REQUEST',  nameAr: 'طلب مُجاز للمرور',               type: 'ALLOW',    destination: 'الخدمة المطلوبة' },
            { id: 'BLOCK_ALERT',    nameAr: 'تنبيه حجب طلب خبيث',            type: 'BLOCK',    destination: 'CELL_SHEIKHA_SHTTP / سجل الحوادث' },
            { id: 'INCIDENT_LOG',   nameAr: 'سجل الحوادث الأمنية',           type: 'LOG',      destination: 'CELL_SHEIKHA_SHTTP' },
        ],

        effect: {
            immediate:  'حماية كل معاملة من الهجمات والتلاعب',
            short_term: 'بيئة تجارية آمنة وموثوقة',
            long_term:  'الحصن الرقمي لمنظومة شيخة الإسلامية',
        },

        synapses: [
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'SECURITY_REPORT', strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_VPN',   signal_type: 'POLICY_FEED',     strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_DBUS',  signal_type: 'INCIDENT_EVENT',  strength: 0.8 },
        ],

        quran_ref:   { ref: 'التحريم:٦', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا' },
        sharia_note: 'الوقاية — حفظ المال والعرض من المقاصد الشرعية الخمس',
    },
};

// ═══════════════════════════════════════════════════════════════
// خريطة الخلايا الكاملة (تشمل الآن خلايا شيخة)
// ═══════════════════════════════════════════════════════════════
const ALL_CELLS = {
    ...TERRESTRIAL_CELLS,
    ...SATELLITE_CELLS,
    ...LOGISTICS_CELLS,
    ...SHEIKHA_CELLS,
};

// ═══════════════════════════════════════════════════════════════
// الشبكة العصبية الكاملة — الطوبولوجيا
// ═══════════════════════════════════════════════════════════════
function buildNeuralTopology() {
    const nodes = Object.values(ALL_CELLS).map((c) => ({
        id:         c.id,
        nameAr:     c.nameAr,
        icon:       c.icon,
        domain:     c.domain,
        activation: c.activation,
        inputs_count:   c.inputs.length,
        outputs_count:  c.output.length,
        elements_count: c.elements.length,
        synapse_count:  c.synapses.length,
    }));

    const edges = [];
    Object.values(ALL_CELLS).forEach((c) => {
        c.synapses.forEach((s) => {
            edges.push({
                from:        c.id,
                to:          s.to_cell_id,
                signal_type: s.signal_type,
                strength:    s.strength,
                critical:    s.strength >= 0.9,
            });
        });
    });

    return {
        nameAr:   'الشبكة العصبية لمنظمة الاتصالات',
        cells:    nodes,
        synapses: edges,
        summary: {
            total_cells:    nodes.length,
            total_synapses: edges.length,
            critical_links: edges.filter((e) => e.critical).length,
            domains: {
                terrestrial: nodes.filter((n) => n.domain === 'TERRESTRIAL').length,
                satellite:   nodes.filter((n) => n.domain === 'SATELLITE').length,
                logistics:   nodes.filter((n) => n.domain === 'LOGISTICS').length,
            },
        },
        verse: { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
    };
}

// ═══════════════════════════════════════════════════════════════
// API — إطلاق إشارة عصبية
// ═══════════════════════════════════════════════════════════════
/**
 * يتتبع تدفق الإشارة من خلية مصدر عبر التشابكات (synapses)
 * @param {string} fromCellId   — الخلية المصدر
 * @param {object} signal       — { type, payload }
 * @param {number} depth        — عمق التدفق (افتراضي 3)
 */
function propagateSignal(fromCellId, signal, depth = 3) {
    const visited = new Set();
    const trace   = [];

    function traverse(cellId, currentSignal, level) {
        if (level > depth || visited.has(cellId)) return;
        visited.add(cellId);

        const cell = ALL_CELLS[cellId];
        if (!cell) return;

        const step = {
            level,
            cell_id:   cell.id,
            nameAr:    cell.nameAr,
            icon:      cell.icon,
            domain:    cell.domain,
            signal:    currentSignal,
            activation:cell.activation,
            effect:    cell.effect.immediate,
            propagates_to: [],
        };

        cell.synapses.forEach((s) => {
            if (!visited.has(s.to_cell_id) && s.strength >= 0.7) {
                step.propagates_to.push({
                    cell_id:     s.to_cell_id,
                    signal_type: s.signal_type,
                    strength:    s.strength,
                });
            }
        });

        trace.push(step);

        cell.synapses.forEach((s) => {
            if (s.strength >= 0.7) {
                traverse(s.to_cell_id, { type: s.signal_type, relay_from: cellId }, level + 1);
            }
        });
    }

    traverse(fromCellId, signal, 0);
    return {
        origin:    fromCellId,
        signal,
        depth,
        steps:     trace.length,
        trace,
        verse: { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
    };
}

function getCell(id) {
    return ALL_CELLS[id] || null;
}

function getCellsByDomain(domain) {
    return Object.values(ALL_CELLS).filter((c) => c.domain === domain.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════
// شبكة شيخة العصبية — طوبولوجيا متخصصة
// ═══════════════════════════════════════════════════════════════

/**
 * يبني طوبولوجيا شبكة شيخة العصبية فقط (SHEIKHA domain)
 * مرتّبة حسب LayerOrder — مع مسار التدفق من PAN إلى SHTTP
 */
function buildSheikhaTopology() {
    const cells = Object.values(SHEIKHA_CELLS)
        .sort((a, b) => (a.layerOrder || 99) - (b.layerOrder || 99));

    const nodes = cells.map((c) => ({
        id:           c.id,
        nameAr:       c.nameAr,
        nameEn:       c.nameEn,
        icon:         c.icon,
        domain:       c.domain,
        layerOrder:   c.layerOrder,
        activation:   c.activation,
        sovereign:    c.sovereign || false,
        synapse_count: c.synapses.length,
        inputs_count:  c.inputs.length,
        outputs_count: c.output.length,
        kpi:          c.goal.kpi,
    }));

    const edges = [];
    cells.forEach((c) => {
        c.synapses.forEach((s) => {
            edges.push({
                from:        c.id,
                to:          s.to_cell_id,
                signal_type: s.signal_type,
                strength:    s.strength,
                critical:    s.strength >= 0.9,
                sheikha_only: s.to_cell_id.startsWith('CELL_SHEIKHA_'),
            });
        });
    });

    // ترتيب الطبقات التسلسلي
    const layerChain = cells
        .filter(c => c.layerOrder > 0)
        .sort((a, b) => a.layerOrder - b.layerOrder)
        .map(c => `${c.layerOrder}. ${c.icon} ${c.nameAr}`);

    const sovereignCell = cells.find(c => c.sovereign);

    return {
        nameAr:   'شبكة شيخة العصبية المتكاملة',
        nameEn:   'Sheikha Integrated Neural Cell Network',
        version:  '1.0.0',
        cells:    nodes,
        synapses: edges,
        layerChain,
        summary: {
            total_cells:        nodes.length,
            total_synapses:     edges.length,
            critical_synapses:  edges.filter(e => e.critical).length,
            internal_synapses:  edges.filter(e => e.sheikha_only).length,
            governing_cell:     sovereignCell ? sovereignCell.id : null,
            avg_activation:     +(nodes.reduce((s, n) => s + n.activation, 0) / nodes.length).toFixed(3),
        },
        verse:  { ref: 'يوسف:٢١', text: 'وَاللَّهُ غَالِبٌ عَلَى أَمْرِهِ وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ' },
    };
}

/**
 * يُفعّل شبكة شيخة العصبية كاملاً ويُعيد تقرير التفعيل
 * — يُشغّل إشارة تفعيل من الطبقة الحاكمة SHTTP إلى كل الطبقات
 * — ويُشغّل إشارة صاعدة من PAN إلى SHTTP
 */
function activateSheikhaNetwork() {
    // إشارة تفعيل نازلة من الحاكمة SHTTP → كل الطبقات
    const topDown = propagateSignal(
        'CELL_SHEIKHA_SHTTP',
        { type: 'ACTIVATION', payload: 'Sheikha Network Full Activation — بسم الله' },
        10
    );

    // إشارة صاعدة من PAN → أعلى الطبقات
    const bottomUp = propagateSignal(
        'CELL_SHEIKHA_PAN',
        { type: 'MARKET_SIGNAL', payload: 'First transaction from PAN layer' },
        5
    );

    const topology = buildSheikhaTopology();
    const allActive = topology.cells.every(c => c.activation > 0);

    return {
        status:       'ACTIVE',
        nameAr:       'شبكة شيخة العصبية — مُفعَّلة',
        nameEn:       'Sheikha Neural Network — ACTIVE',
        activatedAt:  new Date().toISOString(),
        layers:       topology.cells.length,
        synapses:     topology.synapses.length,
        governing:    topology.summary.governing_cell,
        avgActivation: topology.summary.avg_activation,
        allLayersActive: allActive,
        signals: {
            topDown: {
                description: 'إشارة تفعيل من الطبقة الحاكمة ← كل الطبقات',
                stepsReached: topDown.steps,
            },
            bottomUp: {
                description: 'إشارة صاعدة من PAN → SHTTP',
                stepsReached: bottomUp.steps,
            },
        },
        layerChain: topology.layerChain,
        verse:  { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
        hadith: '«إن الله يحب إذا عمل أحدكم عملاً أن يُتقنه» — البيهقي',
    };
}

module.exports = {
    ALL_CELLS,
    TERRESTRIAL_CELLS,
    SATELLITE_CELLS,
    LOGISTICS_CELLS,
    SHEIKHA_CELLS,
    buildNeuralTopology,
    buildSheikhaTopology,
    activateSheikhaNetwork,
    propagateSignal,
    getCell,
    getCellsByDomain,
};
