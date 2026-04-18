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

// ═══════════════════════════════════════════════════════════════
// خريطة الخلايا الكاملة
// ═══════════════════════════════════════════════════════════════
const ALL_CELLS = {
    ...TERRESTRIAL_CELLS,
    ...SATELLITE_CELLS,
    ...LOGISTICS_CELLS,
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

module.exports = {
    ALL_CELLS,
    TERRESTRIAL_CELLS,
    SATELLITE_CELLS,
    LOGISTICS_CELLS,
    buildNeuralTopology,
    propagateSignal,
    getCell,
    getCellsByDomain,
};
