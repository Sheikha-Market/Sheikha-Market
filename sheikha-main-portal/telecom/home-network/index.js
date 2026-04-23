/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏠 SHEIKHA HOME NETWORK NEURAL ENGINE                                       ║
 * ║  محرك شبكة المنزل الذكي العصبية — الداخلية والخارجية والتكامل الآمن         ║
 * ║                                                                              ║
 * ║  النطاقات:                                                                   ║
 * ║  🏠 HOME_INTERNAL  — شبكة المنزل الداخلية (WiFi، LAN، Hub، IoT)             ║
 * ║  📡 HOME_EXTERNAL  — الشبكة الخارجية (مودم 5G، ISP، الإنترنت)              ║
 * ║  🔐 HOME_SECURITY  — الأمن والحماية (جدار الحماية، VPN، كشف التهديدات)     ║
 * ║  🌉 HOME_BRIDGE    — جسر التكامل الآمن بين الداخلية والخارجية               ║
 * ║  🤖 AI_INTEGRATED  — الذكاء الاصطناعي المدمج في كل طبقة                     ║
 * ║                                                                              ║
 * ║  ﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي
 */

'use strict';

const aiEngine = require('./ai-engine');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. الخلايا العصبية — الشبكة الداخلية (HOME_INTERNAL)
// ═══════════════════════════════════════════════════════════════════════════════

const HOME_INTERNAL_CELLS = {

    CELL_HOME_ROUTER: {
        id: 'CELL_HOME_ROUTER', nameAr: 'خلية الراوتر الرئيسي', nameEn: 'Main Home Router Neural Cell',
        icon: '📶', domain: 'HOME_INTERNAL', activation: 1.0, activation_number: 1,

        inputs: [
            { id: 'WAN_SIGNAL',    nameAr: 'إشارة الإنترنت من مودم 5G/فايبر', type: 'WAN',     source: 'CELL_HOME_5G_MODEM / CELL_HOME_FIBER' },
            { id: 'LAN_REQUESTS',  nameAr: 'طلبات الأجهزة الداخلية',           type: 'LAN',     source: 'الأجهزة المنزلية' },
            { id: 'WIFI_REQUESTS', nameAr: 'طلبات الأجهزة اللاسلكية',          type: 'WIFI',    source: 'الهواتف والحواسيب' },
            { id: 'AI_QOS',        nameAr: 'قرارات جودة الخدمة من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: smartRouteTraffic' },
        ],
        goal: {
            primary:   'توزيع الإنترنت بكفاءة وأمان مدعوم بالذكاء الاصطناعي',
            secondary: 'تطبيق قرارات الذكاء الاصطناعي على إعدادات QoS وتوجيه الحزم',
            kpi: { throughput: '1 Gbps', latency: '< 5ms', ai_qos: 'enabled', wifi: 'Wi-Fi 6E' },
        },
        elements: [
            { id: 'DHCP_SERVER',  nameAr: 'خادم DHCP',             role: 'توزيع عناوين IP تلقائياً' },
            { id: 'NAT_ENGINE',   nameAr: 'محرك NAT',               role: 'ترجمة عناوين الشبكة' },
            { id: 'AI_QOS_ENGINE',nameAr: 'محرك QoS بالذكاء الاصطناعي', role: 'توجيه ذكي — الأذان أولاً' },
            { id: 'WIFI6E_AP',    nameAr: 'نقطة وصول Wi-Fi 6E',     role: 'توزيع لاسلكي 2.4/5/6 GHz' },
            { id: 'GIG_SWITCH',   nameAr: 'مبدّل Gigabit مدمج',     role: 'اتصالات سلكية سريعة' },
        ],
        process: {
            mechanism: 'OFDMA + MU-MIMO (Wi-Fi 6E) + AI QoS (DQN Model) — تحسين مستمر بالتعلم',
            protocol:  'IEEE 802.11ax / 802.3ab / DHCPv4/v6 / NAT44/NAT64',
            standard:  'Wi-Fi Alliance WPA3 | IEEE 802.11ax | RFC 2131',
        },
        output: [
            { id: 'INTERNET_WIFI', nameAr: 'إنترنت لاسلكي للأجهزة',     type: 'WIFI_SERVICE', destination: 'الهواتف والحواسيب' },
            { id: 'INTERNET_LAN',  nameAr: 'إنترنت سلكي عالي السرعة',   type: 'LAN_SERVICE',  destination: 'الحواسيب والتلفاز' },
            { id: 'AI_FEEDBACK',   nameAr: 'بيانات أداء للذكاء الاصطناعي', type: 'AI_TELEMETRY', destination: 'ai-engine: autoOptimize' },
        ],
        effect: {
            immediate:  'اتصال فوري لجميع الأجهزة مع تحسين ذكي مستمر',
            short_term: 'شبكة تتعلم من الاستخدام وتتحسن تلقائياً',
            long_term:  'أساس المنزل الذكي المتكامل والمُدار بالذكاء الاصطناعي',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_5G_MODEM',   signal_type: 'WAN_REQUEST',     strength: 1.0 },
            { to_cell_id: 'CELL_HOME_SMART_HUB',  signal_type: 'LAN_CONNECT',     strength: 0.9 },
            { to_cell_id: 'CELL_HOME_LAN',         signal_type: 'SWITCH_TRAFFIC',  strength: 1.0 },
            { to_cell_id: 'CELL_HOME_FIREWALL',    signal_type: 'TRAFFIC_INSPECT', strength: 1.0 },
            { to_cell_id: 'CELL_HOME_IDS',         signal_type: 'AI_MONITOR',      strength: 0.9 },
            { to_cell_id: 'CELL_HOME_IOT',         signal_type: 'IOT_SUBNET',      strength: 0.8 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.smart_router.nameAr,
            role:   'تحديد QoS وأولويات التوجيه لكل جهاز تلقائياً',
            inputs: ['device_type', 'current_app', 'bandwidth_usage', 'latency_requirements'],
            output: 'optimal_qos_class + routing_decision',
        },
        quran_ref:   { ref: 'النور: 35',  text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ' },
        sharia_note: 'الراوتر أمانة — الذكاء الاصطناعي يمنح الأذان والقرآن أعلى أولوية',
    },

    CELL_HOME_SMART_HUB: {
        id: 'CELL_HOME_SMART_HUB', nameAr: 'خلية المحور الذكي للمنزل', nameEn: 'Smart Home Hub Neural Cell',
        icon: '🏠', domain: 'HOME_INTERNAL', activation: 0.95, activation_number: 2,

        inputs: [
            { id: 'ZIGBEE_SIGNALS', nameAr: 'إشارات Zigbee',    type: 'ZIGBEE', source: 'الإضاءة / القفل / الستائر' },
            { id: 'ZWAVE_SIGNALS',  nameAr: 'إشارات Z-Wave',    type: 'ZWAVE',  source: 'كاميرات / أجراس / حساسات' },
            { id: 'MATTER_SIGNALS', nameAr: 'بروتوكول Matter',  type: 'MATTER', source: 'أجهزة Matter المتوافقة' },
            { id: 'AI_SCENE',       nameAr: 'سيناريو ذكي من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: voice_assistant' },
        ],
        goal: {
            primary:   'التنسيق المركزي لجميع الأجهزة الذكية مع سيناريوهات AI تلقائية',
            secondary: 'الأتمتة الذكية المتكيّفة مع روتين الأسرة وأوقات الصلاة',
            kpi: { devices_supported: '200+', protocols: ['Zigbee', 'Z-Wave', 'Matter', 'BLE'], ai_scenes: 'dynamic' },
        },
        elements: [
            { id: 'ZIGBEE_COORD',   nameAr: 'منسق Zigbee',                role: 'إدارة شبكة Zigbee' },
            { id: 'MATTER_FABRIC',  nameAr: 'نسيج Matter',                 role: 'توافق جميع الأجهزة' },
            { id: 'AI_SCENE_GEN',   nameAr: 'مولّد السيناريوهات الذكية',   role: 'إنشاء أتمتة ذكية تلقائياً بالذكاء الاصطناعي' },
            { id: 'PRAYER_AWARE',   nameAr: 'وعي بأوقات الصلاة',          role: 'تهيئة المنزل تلقائياً لأوقات الصلاة' },
        ],
        process: {
            mechanism: 'معالجة أحداث + محرك قواعد AI + وعي بالسياق (صلاة، نوم، ضيوف)',
            protocol:  'Zigbee 3.0 / Z-Wave Plus / Matter 1.2 / Thread / BLE 5.3',
            standard:  'CSA Matter | Zigbee Alliance | Z-Wave Alliance',
        },
        output: [
            { id: 'DEVICE_COMMANDS', nameAr: 'أوامر للأجهزة الذكية',    type: 'CONTROL', destination: 'CELL_HOME_IOT' },
            { id: 'AI_SCENE_EXEC',   nameAr: 'تنفيذ سيناريو AI',         type: 'EXECUTE', destination: 'أجهزة المنزل' },
        ],
        effect: {
            immediate:  'تحكم مركزي + سيناريوهات ذكية تتكيّف تلقائياً',
            short_term: 'منزل يعرف أوقات الصلاة ويهيئ نفسه لها',
            long_term:  'منزل ذكي يتعلم أنماط الأسرة ويخدمهم',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_ROUTER',   signal_type: 'DATA_SYNC',       strength: 0.9 },
            { to_cell_id: 'CELL_HOME_IOT',      signal_type: 'AI_DEVICE_CTRL',  strength: 1.0 },
            { to_cell_id: 'CELL_HOME_BRIDGE',   signal_type: 'CLOUD_AI_SYNC',   strength: 0.8 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.voice_assistant.nameAr,
            role:   'توليد سيناريوهات أتمتة ذكية وتنفيذ الأوامر الصوتية',
            inputs: ['voice_command', 'prayer_times', 'family_presence', 'home_state'],
            output: 'automation_scene + device_commands',
        },
        quran_ref:   { ref: 'هود: 61', text: 'هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا' },
        sharia_note: 'الذكاء الاصطناعي يُهيئ المنزل لأوقات الصلاة تلقائياً — بيت مسلم حقيقي',
    },

    CELL_HOME_IOT: {
        id: 'CELL_HOME_IOT', nameAr: 'خلية إنترنت الأشياء المنزلية', nameEn: 'Home IoT Neural Cell',
        icon: '💡', domain: 'HOME_INTERNAL', activation: 0.9, activation_number: 3,

        inputs: [
            { id: 'HUB_COMMANDS', nameAr: 'أوامر من المحور الذكي',      type: 'CONTROL', source: 'CELL_HOME_SMART_HUB' },
            { id: 'SENSOR_DATA',  nameAr: 'بيانات الاستشعار',           type: 'SENSOR',  source: 'الحرارة / الحركة / الدخان' },
            { id: 'AI_PREDICT',   nameAr: 'توقعات ذكاء اصطناعي',        type: 'AI',      source: 'ai-engine: anomaly_detector' },
        ],
        goal: {
            primary:   'إدارة ذكية للأجهزة الذكية مع كشف الشذوذ بالذكاء الاصطناعي',
            secondary: 'توفير بيانات دقيقة وفورية لنماذج الذكاء الاصطناعي',
            kpi: { response: '< 200ms', ai_anomaly: 'real-time', energy_saving: '30%+' },
        },
        elements: [
            { id: 'SMART_LIGHTS',    nameAr: 'الإضاءة الذكية',         role: 'تنظيم الإضاءة' },
            { id: 'SMART_THERMOSTAT',nameAr: 'منظم الحرارة الذكي',      role: 'التحكم في الحرارة بالذكاء الاصطناعي' },
            { id: 'SMART_CAMERAS',   nameAr: 'كاميرات رؤية حاسوبية',   role: 'رؤية حاسوبية AI للتعرف على الأشخاص' },
            { id: 'SMART_LOCKS',     nameAr: 'أقفال ذكية بصمة + AI',   role: 'التحكم في الدخول بالبصمة والتعرف على الوجه' },
            { id: 'AI_ENERGY_MGR',   nameAr: 'مدير الطاقة الذكي',      role: 'خفض الاستهلاك تلقائياً بالذكاء الاصطناعي' },
        ],
        process: {
            mechanism: 'IoT event loop + AI anomaly detection + computer vision + energy ML model',
            protocol:  'Zigbee / Z-Wave / Matter / Wi-Fi / BLE / MQTT / CoAP',
            standard:  'CSA Matter | ISO 7240 | EN 62368 | IEC 62443 (IoT Security)',
        },
        output: [
            { id: 'STATUS_DATA',  nameAr: 'بيانات حالة للذكاء الاصطناعي', type: 'AI_TELEMETRY', destination: 'ai-engine: analyzeTraffic' },
            { id: 'ALERT_EVENTS', nameAr: 'إنذارات أمنية',                type: 'ALERT',        destination: 'CELL_HOME_IDS' },
        ],
        effect: {
            immediate:  'استجابة فورية + كشف الشذوذ في سلوك الأجهزة',
            short_term: 'توفير الطاقة تلقائياً بالذكاء الاصطناعي',
            long_term:  'منزل يتعلم ويتحسن مع مرور الوقت',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_SMART_HUB', signal_type: 'AI_TELEMETRY',  strength: 1.0 },
            { to_cell_id: 'CELL_HOME_IDS',        signal_type: 'ANOMALY_DATA',  strength: 0.95 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.anomaly_detector.nameAr,
            role:   'كشف الشذوذ في سلوك الأجهزة وتوقع الأعطال مسبقاً',
            inputs: ['device_telemetry', 'usage_patterns', 'sensor_readings'],
            output: 'anomaly_alert + maintenance_prediction',
        },
        quran_ref:   { ref: 'الملك: 15', text: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا' },
        sharia_note: 'الكاميرات لا تُصوَّب على الجيران — الذكاء الاصطناعي يطبق ذلك تلقائياً',
    },

    CELL_HOME_LAN: {
        id: 'CELL_HOME_LAN', nameAr: 'خلية الشبكة السلكية الداخلية', nameEn: 'Home LAN Neural Cell',
        icon: '🔌', domain: 'HOME_INTERNAL', activation: 0.95, activation_number: 4,

        inputs: [
            { id: 'ROUTER_UPLINK',  nameAr: 'رابط صاعد من الراوتر',    type: 'UPLINK', source: 'CELL_HOME_ROUTER' },
            { id: 'AI_VLAN_POLICY', nameAr: 'سياسة VLAN من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: autoOptimize' },
        ],
        goal: {
            primary:   'شبكة سلكية فائقة السرعة مع تقسيم ذكي بالذكاء الاصطناعي',
            secondary: 'عزل الأجهزة تلقائياً عند كشف سلوك مريب',
            kpi: { speed: '2.5 Gbps', vlan: 'AI-managed', auto_quarantine: 'enabled' },
        },
        elements: [
            { id: 'MANAGED_SWITCH', nameAr: 'مبدّل شبكة مُدار ذكي',  role: 'توجيه مع VLAN ذكي' },
            { id: 'AI_VLAN_ENGINE', nameAr: 'محرك VLAN بالذكاء الاصطناعي', role: 'تقسيم تلقائي حسب سلوك الأجهزة' },
            { id: 'POE_INJECTOR',   nameAr: 'مُضخّ طاقة PoE',          role: 'تغذية الكاميرات ونقاط الوصول' },
        ],
        process: {
            mechanism: 'Layer-2/3 switching + AI-driven VLAN policy + auto-quarantine on anomaly',
            protocol:  'IEEE 802.3bz (2.5GbE) / 802.1Q (VLAN) / 802.1X (Auth)',
            standard:  'IEEE 802.3 | TIA-568 | ISO/IEC 11801',
        },
        output: [
            { id: 'WIRED_NET',  nameAr: 'شبكة سلكية عالية الأداء', type: 'SERVICE',    destination: 'الحواسيب والطابعات' },
            { id: 'AI_SEGMENT', nameAr: 'تقسيم ذكي تلقائي',       type: 'AI_ACTION',  destination: 'VLAN الأجهزة المريبة' },
        ],
        effect: {
            immediate:  'اتصال سلكي مستقر + عزل تلقائي للأجهزة المخترقة',
            short_term: 'أمان شبكي عالٍ مع أداء مثالي',
            long_term:  'بنية تحتية ذاتية الإدارة والحماية',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_ROUTER',   signal_type: 'SWITCH_UPLINK', strength: 1.0 },
            { to_cell_id: 'CELL_HOME_FIREWALL', signal_type: 'TRAFFIC_FEED',  strength: 1.0 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.network_optimizer.nameAr,
            role:   'تقسيم VLAN ذكي وعزل الأجهزة المشبوهة تلقائياً',
            inputs: ['device_behavior', 'anomaly_score', 'traffic_patterns'],
            output: 'vlan_assignment + quarantine_decision',
        },
        quran_ref:   { ref: 'الأنفال: 60', text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ' },
        sharia_note: 'الشبكة القوية أمانة — الذكاء الاصطناعي يحميها وينظمها',
    },

    CELL_HOME_NAS: {
        id: 'CELL_HOME_NAS', nameAr: 'خلية التخزين الشبكي المنزلي', nameEn: 'Home NAS Neural Cell',
        icon: '💾', domain: 'HOME_INTERNAL', activation: 0.85, activation_number: 5,

        inputs: [
            { id: 'LAN_ACCESS',  nameAr: 'طلبات وصول من الشبكة', type: 'ACCESS', source: 'CELL_HOME_LAN' },
            { id: 'AI_BACKUP',   nameAr: 'جدول نسخ احتياطي ذكي', type: 'AI',     source: 'ai-engine: optimizer' },
        ],
        goal: {
            primary:   'تخزين مركزي آمن مع نسخ احتياطي ذكي وتشفير كامل',
            secondary: 'استقلالية رقمية — البيانات في المنزل مشفرة',
            kpi: { capacity: '20 TB+', encryption: 'AES-256', ai_backup: 'smart-scheduled', raid: '5/6' },
        },
        elements: [
            { id: 'RAID_ARRAY',    nameAr: 'مصفوفة RAID',                  role: 'حماية البيانات من فشل الأقراص' },
            { id: 'AES256',        nameAr: 'تشفير AES-256',                role: 'حماية البيانات المخزنة' },
            { id: 'AI_BACKUP_SCH', nameAr: 'جدولة نسخ احتياطي ذكية',      role: 'النسخ في أوقات انخفاض الاستخدام' },
        ],
        process: {
            mechanism: 'RAID 5/6 + AES-256 + AI-scheduled incremental backups',
            protocol:  'SMB 3.0 / NFS 4.1 / HTTPS / DLNA',
            standard:  'ISO/IEC 27001 | RAID Advisory Board',
        },
        output: [
            { id: 'FILE_SHARE',   nameAr: 'مشاركة الملفات',      type: 'SERVICE', destination: 'أجهزة الأسرة' },
            { id: 'BACKUP_SAFE',  nameAr: 'نسخ احتياطية مشفرة', type: 'BACKUP',  destination: 'محلي + سحابة مشفرة' },
        ],
        effect: {
            immediate:  'وصول فوري للملفات + نسخ احتياطي ذكي',
            short_term: 'استقلالية رقمية وأمان البيانات',
            long_term:  'بيانات الأسرة محفوظة إلى الأبد',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_LAN',    signal_type: 'FILE_SERVE',   strength: 1.0 },
            { to_cell_id: 'CELL_HOME_BRIDGE', signal_type: 'BACKUP_SYNC',  strength: 0.6 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.network_optimizer.nameAr,
            role:   'جدولة النسخ الاحتياطي في أوقات انخفاض استخدام الشبكة',
            inputs: ['network_usage_history', 'storage_capacity', 'file_change_rate'],
            output: 'optimal_backup_schedule + deduplication_suggestions',
        },
        quran_ref:   { ref: 'الحجرات: 12', text: 'وَلَا تَجَسَّسُوا' },
        sharia_note: 'بيانات الأسرة أمانة — مشفرة ومحمية، ولا تشاركها أي طرف ثالث',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. الخلايا العصبية — الشبكة الخارجية (HOME_EXTERNAL)
// ═══════════════════════════════════════════════════════════════════════════════

const HOME_EXTERNAL_CELLS = {

    CELL_HOME_5G_MODEM: {
        id: 'CELL_HOME_5G_MODEM', nameAr: 'خلية مودم الجيل الخامس 5G', nameEn: '5G Home Modem Neural Cell',
        icon: '📡', domain: 'HOME_EXTERNAL', activation: 1.0, activation_number: 6,

        inputs: [
            { id: '5G_SIGNAL',   nameAr: 'إشارة 5G من برج الاتصالات', type: 'RF',   source: 'شبكة 5G (STC/Mobily/Zain)' },
            { id: 'SIM_AUTH',    nameAr: 'مصادقة SIM/eSIM',            type: 'AUTH', source: 'شبكة المشغل' },
            { id: 'AI_FAILOVER', nameAr: 'قرار failover من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: optimizer' },
        ],
        goal: {
            primary:   'إنترنت 5G فائق السرعة مع failover ذكي بالذكاء الاصطناعي',
            secondary: 'اختيار أفضل مشغل ونطاق تلقائياً بالذكاء الاصطناعي',
            kpi: { download: '1 Gbps+', latency: '10ms', ai_band_select: 'auto', failover: '< 1s' },
        },
        elements: [
            { id: 'NR_MODEM',     nameAr: 'مودم 5G NR',              role: 'استقبال 5G وتحويله لبيانات' },
            { id: 'AI_BAND_SEL',  nameAr: 'محدد النطاق الذكي',       role: 'الذكاء الاصطناعي يختار أفضل نطاق 5G تلقائياً' },
            { id: 'AI_OPERATOR',  nameAr: 'محدد المشغل الذكي',       role: 'SIM متعددة — الذكاء الاصطناعي يختار الأفضل' },
            { id: 'AI_FAILOVER',  nameAr: 'نظام failover ذكي',       role: 'تحويل تلقائي عند ضعف الإشارة' },
        ],
        process: {
            mechanism: '5G NR + AI band selection + multi-SIM intelligent operator selection + AI failover',
            protocol:  '3GPP NR / NGAP / GTP-U / IPv6',
            standard:  '3GPP Release 16/17 | IMT-2020',
        },
        output: [
            { id: 'INTERNET_WAN', nameAr: 'بوابة 5G للمنزل',     type: 'WAN_SERVICE', destination: 'CELL_HOME_ROUTER' },
            { id: 'AI_METRICS',   nameAr: 'مقاييس الإشارة للـ AI', type: 'AI_DATA',    destination: 'ai-engine: optimizer' },
        ],
        effect: {
            immediate:  '5G فائق السرعة + اختيار ذكي للنطاق',
            short_term: 'إنترنت موثوق لا ينقطع',
            long_term:  'استقلالية عن البنية التحتية السلكية',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_ROUTER',   signal_type: 'WAN_PROVIDE',  strength: 1.0 },
            { to_cell_id: 'CELL_HOME_BRIDGE',   signal_type: 'EXTERNAL_LINK',strength: 1.0 },
            { to_cell_id: 'CELL_HOME_FIREWALL', signal_type: 'EDGE_PROTECT', strength: 1.0 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.smart_router.nameAr,
            role:   'اختيار أفضل نطاق 5G ومشغل + failover تلقائي ذكي',
            inputs: ['signal_strength', 'operator_speeds', 'latency', 'cost'],
            output: 'best_band + best_operator + failover_decision',
        },
        quran_ref:   { ref: 'الذاريات: 22', text: 'وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ' },
        sharia_note: 'الذكاء الاصطناعي يضمن الاتصال المستمر — نعمة يجب توظيفها في الخير',
    },

    CELL_HOME_FIBER_ONT: {
        id: 'CELL_HOME_FIBER_ONT', nameAr: 'خلية بوابة الألياف البصرية (ONT)', nameEn: 'Fiber ONT Neural Cell',
        icon: '🔆', domain: 'HOME_EXTERNAL', activation: 0.9, activation_number: 7,

        inputs: [
            { id: 'FIBER_LIGHT', nameAr: 'إشارة ضوئية من OLT', type: 'OPTICAL', source: 'STC Fiber / Mobily Fiber' },
            { id: 'AI_MONITOR',  nameAr: 'مراقبة الإشارة بالذكاء الاصطناعي', type: 'AI', source: 'ai-engine: anomaly' },
        ],
        goal: {
            primary:   'ألياف بصرية فائقة السرعة مع مراقبة ذكية للجودة',
            secondary: 'كشف تدهور الإشارة مسبقاً بالذكاء الاصطناعي',
            kpi: { speed: '2.5/10 Gbps', latency: '< 2ms', ai_monitoring: 'predictive' },
        },
        elements: [
            { id: 'GPON_MODULE',  nameAr: 'وحدة GPON / XGS-PON', role: 'تحويل ضوئي/كهربائي' },
            { id: 'AI_SIGNAL_MON',nameAr: 'مراقب الإشارة الذكي', role: 'توقع تدهور الإشارة بالذكاء الاصطناعي' },
        ],
        process: {
            mechanism: 'GPON / XGS-PON + AI signal quality monitoring + predictive maintenance',
            protocol:  'ITU-T G.984 / G.9807 / IEEE 802.3',
            standard:  'ITU-T G.984 | G.9807 | G.989',
        },
        output: [
            { id: 'ETHERNET_OUT', nameAr: 'إنترنت فائق السرعة', type: 'WAN_SERVICE', destination: 'CELL_HOME_ROUTER' },
            { id: 'AI_SIGNAL_DATA',nameAr: 'بيانات جودة الإشارة', type: 'AI_DATA',   destination: 'ai-engine: predictor' },
        ],
        effect: {
            immediate:  'إنترنت ثابت بسرعة عالية',
            short_term: 'كشف أعطال قبل وقوعها بالذكاء الاصطناعي',
            long_term:  'بنية تحتية ثابتة تدار بذكاء',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_ROUTER', signal_type: 'WAN_FIBER',    strength: 1.0 },
            { to_cell_id: 'CELL_HOME_BRIDGE', signal_type: 'PRIMARY_LINK', strength: 0.9 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.threat_predictor.nameAr,
            role:   'توقع تدهور إشارة الألياف قبل الانقطاع',
            inputs: ['optical_power_level', 'error_rate', 'temperature'],
            output: 'maintenance_alert + predicted_failure_time',
        },
        quran_ref:   { ref: 'النحل: 78', text: 'وَاللَّهُ أَخْرَجَكُم مِّن بُطُونِ أُمَّهَاتِكُمْ لَا تَعْلَمُونَ شَيْئًا' },
        sharia_note: 'الإنترنت السلكي نعمة والذكاء الاصطناعي يحافظ عليها',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. الخلايا العصبية — الأمن والحماية (HOME_SECURITY) + ذكاء اصطناعي
// ═══════════════════════════════════════════════════════════════════════════════

const HOME_SECURITY_CELLS = {

    CELL_HOME_FIREWALL: {
        id: 'CELL_HOME_FIREWALL', nameAr: 'خلية جدار الحماية الذكي', nameEn: 'AI Smart Firewall Neural Cell',
        icon: '🛡️', domain: 'HOME_SECURITY', activation: 1.0, activation_number: 8,

        inputs: [
            { id: 'WAN_TRAFFIC',   nameAr: 'حركة من الإنترنت',      type: 'INBOUND',  source: 'CELL_HOME_5G_MODEM / CELL_HOME_FIBER_ONT' },
            { id: 'LAN_TRAFFIC',   nameAr: 'حركة من المنزل',         type: 'OUTBOUND', source: 'CELL_HOME_LAN / CELL_HOME_IOT' },
            { id: 'AI_THREAT',     nameAr: 'تحليل تهديدات من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: analyzeTrafficWithAI' },
        ],
        goal: {
            primary:   'جدار حماية مدعوم بالذكاء الاصطناعي يكشف ويصد التهديدات تلقائياً',
            secondary: 'تحديث القواعد تلقائياً من نماذج AI بدون تدخل يدوي',
            kpi: { block_rate: '99.9%+', ai_detection: 'real-time', rule_update: 'auto', latency: '< 1ms' },
        },
        elements: [
            { id: 'AI_FIREWALL',   nameAr: 'جدار حماية بالذكاء الاصطناعي', role: 'تحليل DPI + نماذج ML للكشف' },
            { id: 'THREAT_INTEL',  nameAr: 'استخبارات تهديدات AI',          role: 'قاعدة IP ضارة تتحدث بالذكاء الاصطناعي' },
            { id: 'SHARIA_FW',     nameAr: 'جدار الحماية الشرعي',           role: 'حجب المحتوى المحرم على الفور' },
            { id: 'GEO_BLOCK_AI',  nameAr: 'حجب جغرافي ذكي',               role: 'منع الاتصال من مناطق خطرة تلقائياً' },
        ],
        process: {
            mechanism: 'AI-powered DPI + behavioral analysis + Sharia content gate + geo-intelligence',
            protocol:  'TCP/IP / UDP / ICMP / DNS — Deep Packet Inspection + ML',
            standard:  'NIST SP 800-41 | ISO/IEC 27001 | OWASP',
        },
        output: [
            { id: 'BLOCKED',    nameAr: 'حزم محجوبة',         type: 'DROP',  destination: 'سلة الحجب' },
            { id: 'ALLOWED',    nameAr: 'حزم مسموح بها',       type: 'PASS',  destination: 'CELL_HOME_ROUTER' },
            { id: 'AI_ALERT',   nameAr: 'تنبيه AI للتهديد',   type: 'ALERT', destination: 'CELL_HOME_IDS + تطبيق المنزل' },
        ],
        effect: {
            immediate:  'صد فوري للتهديدات + تعلم مستمر',
            short_term: 'حماية تتحسن كل يوم بالذكاء الاصطناعي',
            long_term:  'جدار حماية لا يحتاج لإدارة يدوية',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_IDS',          signal_type: 'AI_THREAT_SHARE', strength: 1.0 },
            { to_cell_id: 'CELL_HOME_VPN',           signal_type: 'TUNNEL_INSPECT',  strength: 0.9 },
            { to_cell_id: 'CELL_HOME_ROUTER',        signal_type: 'FILTERED_PASS',   strength: 1.0 },
            { to_cell_id: 'CELL_HOME_SHARIA_FILTER', signal_type: 'HARAM_BLOCK',     strength: 1.0 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.anomaly_detector.nameAr,
            role:   'تحليل حركة البيانات وكشف الهجمات في الوقت الفعلي',
            inputs: ['packet_flow', 'connection_state', 'payload_signatures', 'geo_data'],
            output: 'block/allow + threat_category + auto_rule_update',
        },
        quran_ref:   { ref: 'الأنفال: 60', text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ وَمِن رِّبَاطِ الْخَيْلِ' },
        sharia_note: 'الذكاء الاصطناعي يحرس الشبكة كما تحرس السور المدينة',
    },

    CELL_HOME_IDS: {
        id: 'CELL_HOME_IDS', nameAr: 'خلية كشف التهديدات بالذكاء الاصطناعي', nameEn: 'AI IDS/IPS Neural Cell',
        icon: '🔍', domain: 'HOME_SECURITY', activation: 0.95, activation_number: 9,

        inputs: [
            { id: 'MIRRORED_TRAFFIC', nameAr: 'نسخة من حركة الشبكة',   type: 'MIRROR',   source: 'CELL_HOME_ROUTER' },
            { id: 'IOT_BEHAVIOR',     nameAr: 'سلوك أجهزة IoT',         type: 'BEHAVIOR', source: 'CELL_HOME_IOT' },
            { id: 'AI_ANOMALY',       nameAr: 'درجة الشذوذ من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: analyzeTrafficWithAI' },
        ],
        goal: {
            primary:   'كشف التهديدات بالذكاء الاصطناعي + منع الانتشار الجانبي تلقائياً',
            secondary: 'تعلم أنماط الشبكة المنزلية للكشف الدقيق عن الشذوذ',
            kpi: { detection_rate: '99%+', false_positive: '< 0.5%', ai_model: 'LSTM+RF', quarantine: 'auto' },
        },
        elements: [
            { id: 'LSTM_DETECTOR',  nameAr: 'كاشف LSTM العصبي',        role: 'تحليل تسلسلي لأنماط حركة البيانات' },
            { id: 'RF_CLASSIFIER',  nameAr: 'مُصنِّف Random Forest',    role: 'تصنيف نوع الهجوم بدقة عالية' },
            { id: 'AUTO_QUARANTINE',nameAr: 'عزل تلقائي بالذكاء الاصطناعي', role: 'عزل الجهاز المخترق فوراً' },
            { id: 'FEDERATED_LEARN',nameAr: 'تعلم موزع فيدرالي',       role: 'تحسين النموذج دون مشاركة البيانات الخاصة' },
        ],
        process: {
            mechanism: 'LSTM time-series analysis + Random Forest classification + federated learning',
            protocol:  'SNORT/Suricata + ML pipeline | STIX/TAXII',
            standard:  'NIST SP 800-94 | ISO/IEC 27039 | CVE/NVD',
        },
        output: [
            { id: 'AI_THREAT_ALERT', nameAr: 'إنذار تهديد من الذكاء الاصطناعي', type: 'AI_ALERT',  destination: 'تطبيق المنزل + CELL_HOME_FIREWALL' },
            { id: 'AUTO_QUARANTINE', nameAr: 'عزل تلقائي للجهاز المخترق',       type: 'ACTION',    destination: 'CELL_HOME_LAN' },
            { id: 'LEARN_FEEDBACK',  nameAr: 'تغذية راجعة لتحسين النموذج',      type: 'AI_TRAIN',  destination: 'ai-engine: anomaly_detector' },
        ],
        effect: {
            immediate:  'كشف فوري + عزل تلقائي للتهديد',
            short_term: 'نماذج AI تتحسن بالتعلم المستمر',
            long_term:  'شبكة تتعلم من كل هجوم وتقاومه',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_FIREWALL', signal_type: 'AI_RULE_UPDATE', strength: 1.0 },
            { to_cell_id: 'CELL_HOME_LAN',      signal_type: 'QUARANTINE',     strength: 0.9 },
            { to_cell_id: 'CELL_HOME_BRIDGE',   signal_type: 'INCIDENT_REPORT',strength: 0.8 },
        ],
        ai_integration: {
            model:  `${aiEngine.AI_MODELS.anomaly_detector.nameAr} + ${aiEngine.AI_MODELS.threat_predictor.nameAr}`,
            role:   'كشف الشذوذ + توقع الهجمات + تحديث جدار الحماية تلقائياً',
            inputs: ['network_traffic', 'device_profiles', 'threat_intel_feeds'],
            output: 'threat_classification + auto_response + model_improvement',
        },
        quran_ref:   { ref: 'الحجرات: 6', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا' },
        sharia_note: 'التبيّن واجب — الذكاء الاصطناعي يُحقق ذلك في الشبكة تلقائياً',
    },

    CELL_HOME_VPN: {
        id: 'CELL_HOME_VPN', nameAr: 'خلية الشبكة الافتراضية الخاصة', nameEn: 'Home VPN Neural Cell',
        icon: '🔒', domain: 'HOME_SECURITY', activation: 0.9, activation_number: 10,

        inputs: [
            { id: 'APP_TRAFFIC',   nameAr: 'حركة التطبيقات الحساسة', type: 'DATA',   source: 'الحواسيب والهواتف' },
            { id: 'AI_SPLIT',      nameAr: 'قرار split tunnel من الذكاء الاصطناعي', type: 'AI', source: 'ai-engine: smartRouter' },
        ],
        goal: {
            primary:   'تشفير ذكي بالذكاء الاصطناعي يحدد ما يمر عبر VPN تلقائياً',
            secondary: 'وصول آمن للمنزل عن بُعد مع مصادقة متعددة العوامل',
            kpi: { encryption: 'AES-256-GCM', protocol: 'WireGuard', ai_split: 'dynamic', auth: 'MFA+biometric' },
        },
        elements: [
            { id: 'WIREGUARD',    nameAr: 'WireGuard',           role: 'نفق VPN سريع ومشفر' },
            { id: 'AI_SPLIT_TUN', nameAr: 'split tunnel ذكي',    role: 'الذكاء الاصطناعي يقرر ما يمر عبر VPN' },
            { id: 'MFA_BIO',      nameAr: 'مصادقة بصمة + AI',   role: 'تحقق بيومتري + ذكاء اصطناعي' },
            { id: 'ZERO_TRUST',   nameAr: 'نموذج Zero Trust',    role: 'لا ثقة مطلقة — كل طلب يُتحقق منه' },
        ],
        process: {
            mechanism: 'WireGuard + AI dynamic split tunneling + Zero Trust + biometric MFA',
            protocol:  'WireGuard / IKEv2 / IPSec — AES-256-GCM + ChaCha20',
            standard:  'RFC 8446 (TLS 1.3) | FIPS 140-3 | NIST Zero Trust (SP 800-207)',
        },
        output: [
            { id: 'AI_TUNNEL',     nameAr: 'نفق ذكي مشفر',          type: 'TUNNEL',  destination: 'خادم VPN موثوق' },
            { id: 'REMOTE_ACCESS', nameAr: 'وصول آمن للمنزل عن بُعد', type: 'SESSION', destination: 'صاحب المنزل خارجاً' },
        ],
        effect: {
            immediate:  'تشفير ذكي — فقط الحساس يمر عبر VPN',
            short_term: 'أداء أفضل + حماية أكبر',
            long_term:  'خصوصية رقمية تامة',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_FIREWALL', signal_type: 'TUNNEL_PASS',   strength: 0.9 },
            { to_cell_id: 'CELL_HOME_BRIDGE',   signal_type: 'SECURE_TUNNEL', strength: 1.0 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.smart_router.nameAr,
            role:   'split tunnel ذكي — توجيه الحساس عبر VPN فقط',
            inputs: ['traffic_classification', 'sensitivity_level', 'destination'],
            output: 'vpn_tunnel / direct_route decision per-flow',
        },
        quran_ref:   { ref: 'الحجرات: 12', text: 'وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا' },
        sharia_note: 'حماية الخصوصية فريضة — الذكاء الاصطناعي يُنفذها تقنياً',
    },

    CELL_HOME_SHARIA_FILTER: {
        id: 'CELL_HOME_SHARIA_FILTER', nameAr: 'خلية الفلتر الشرعي بالذكاء الاصطناعي', nameEn: 'AI Islamic Content Filter',
        icon: '☪️', domain: 'HOME_SECURITY', activation: 1.0, activation_number: 11,

        inputs: [
            { id: 'DNS_QUERIES',   nameAr: 'استعلامات DNS',                    type: 'DNS',   source: 'جميع أجهزة المنزل' },
            { id: 'HTTP_REQUESTS', nameAr: 'طلبات HTTP/HTTPS',                 type: 'HTTP',  source: 'المتصفحات والتطبيقات' },
            { id: 'AI_CLASSIFY',   nameAr: 'تصنيف محتوى من الذكاء الاصطناعي', type: 'AI',    source: 'ai-engine: classifyContent' },
        ],
        goal: {
            primary:   'فلتر شرعي بالذكاء الاصطناعي يصنف المحتوى عربياً + إنجليزياً',
            secondary: 'حماية الأسرة من كل محتوى محرم مع تحديث تلقائي',
            kpi: { accuracy: '99.5%+', ai_model: 'BERT-Arabic', update: 'real-time', false_positive: '< 0.1%' },
        },
        elements: [
            { id: 'BERT_ARABIC',   nameAr: 'نموذج BERT عربي',           role: 'فهم المحتوى العربي وتصنيفه شرعياً' },
            { id: 'DNS_SINKHOLE',  nameAr: 'DNS سينكهول إسلامي',        role: 'حجب DNS للمواقع المحرمة' },
            { id: 'REALTIME_CLASS',nameAr: 'تصنيف فوري',                role: 'تصنيف المحتوى الجديد في < 100ms' },
            { id: 'PARENT_AI',     nameAr: 'رقابة أبوية بالذكاء الاصطناعي', role: 'إعدادات مخصصة لكل فرد من الأسرة' },
        ],
        process: {
            mechanism: 'BERT-Arabic content classification + DNS-over-HTTPS + AI parent controls',
            protocol:  'DNS over HTTPS (DoH) | DNS over TLS (DoT) | HTTP CONNECT',
            standard:  'Internet Watch Foundation | BERT | CSA IoT Security',
        },
        output: [
            { id: 'HALAL_PASS',  nameAr: 'محتوى حلال يمر',    type: 'ALLOW', destination: 'المتصفحات' },
            { id: 'HARAM_BLOCK', nameAr: 'محتوى محرم محجوب',  type: 'BLOCK', destination: 'صفحة إشعار إسلامية' },
            { id: 'AI_TRAIN',    nameAr: 'تحسين نموذج AI',    type: 'LEARN', destination: 'ai-engine: content_classifier' },
        ],
        effect: {
            immediate:  'حجب فوري للمحتوى المحرم',
            short_term: 'بيئة إنترنت آمنة ونقية بالذكاء الاصطناعي',
            long_term:  'نموذج يتحسن ويتعلم المحتوى الجديد',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_FIREWALL', signal_type: 'AI_POLICY_UPDATE', strength: 1.0 },
            { to_cell_id: 'CELL_HOME_ROUTER',   signal_type: 'DNS_AI_OVERRIDE',  strength: 1.0 },
        ],
        ai_integration: {
            model:  aiEngine.AI_MODELS.content_classifier.nameAr,
            role:   'تصنيف شرعي دقيق بـ BERT-Arabic — حلال/حرام لكل محتوى',
            inputs: ['url', 'page_content', 'metadata', 'arabic_text'],
            output: 'halal_score + sharia_verdict + block/allow',
        },
        quran_ref:   { ref: 'النور: 30', text: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ' },
        sharia_note: 'غض البصر الرقمي — الذكاء الاصطناعي يُنفذه على مستوى الشبكة كاملاً',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. خلية جسر التكامل الذكي (HOME_BRIDGE) + ذكاء اصطناعي
// ═══════════════════════════════════════════════════════════════════════════════

const HOME_BRIDGE_CELL = {

    CELL_HOME_BRIDGE: {
        id: 'CELL_HOME_BRIDGE', nameAr: 'خلية جسر التكامل الذكي (داخلي ↔ خارجي + AI)', nameEn: 'AI Secure Home Integration Bridge',
        icon: '🌉', domain: 'HOME_BRIDGE', activation: 1.0, activation_number: 12,

        inputs: [
            { id: 'INTERNAL_DATA',  nameAr: 'بيانات الشبكة الداخلية المُفلترة',    type: 'INTERNAL', source: 'CELL_HOME_ROUTER / CELL_HOME_SMART_HUB' },
            { id: 'EXTERNAL_DATA',  nameAr: 'بيانات الشبكة الخارجية المُؤمَّنة',   type: 'EXTERNAL', source: 'CELL_HOME_5G_MODEM / CELL_HOME_FIBER_ONT' },
            { id: 'AI_DECISIONS',   nameAr: 'قرارات الذكاء الاصطناعي الموحدة',     type: 'AI',       source: 'ai-engine: جميع النماذج' },
            { id: 'SECURITY_FEED',  nameAr: 'تغذية الأمن والحماية',                type: 'SECURITY', source: 'CELL_HOME_FIREWALL / CELL_HOME_IDS' },
        ],
        goal: {
            primary:   'تنسيق ذكي شامل بالذكاء الاصطناعي بين كل طبقات شبكة المنزل',
            secondary: 'رؤية موحدة + قرارات AI مركزية لكل حركة البيانات',
            kpi: {
                ai_decision_latency:  '< 10ms',
                security_score:       '> 95/100',
                sharia_compliance:    '100%',
                automation_rate:      '> 90%',
            },
        },
        elements: [
            { id: 'AI_ORCHESTRATOR', nameAr: 'منسق الذكاء الاصطناعي المركزي', role: 'يجمع قرارات كل نماذج AI ويطبقها' },
            { id: 'NEURAL_SYNC',     nameAr: 'محرك المزامنة العصبية',         role: 'إرسال الإشارات بين كل الخلايا' },
            { id: 'POLICY_AI',       nameAr: 'محرك السياسات بالذكاء الاصطناعي', role: 'تطبيق الشريعة والأمن تلقائياً' },
            { id: 'AUDIT_AI',        nameAr: 'مدقق AI شامل',                  role: 'تسجيل وتحليل كل حدث' },
            { id: 'SHEIKHA_ENGINE',  nameAr: 'محرك شيخة العصبي',              role: 'LLM إسلامي لاتخاذ القرار السياقي' },
        ],
        process: {
            mechanism: 'AI orchestration + Zero Trust + SASE + Sheikha Neural Engine for policy decisions',
            protocol:  'Zero Trust | SASE | SD-WAN | mTLS | OAuth2/OIDC',
            standard:  'NIST Zero Trust (SP 800-207) | ISO/IEC 27001 | CSA IoT | OWASP IoT',
        },
        output: [
            { id: 'AI_UNIFIED',     nameAr: 'تدفق موحد مدار بالذكاء الاصطناعي', type: 'AI_FLOW',  destination: 'جميع الخلايا' },
            { id: 'AI_REPORT',      nameAr: 'تقرير AI شامل',                     type: 'REPORT',   destination: 'تطبيق شيخة المنزل' },
            { id: 'NEURAL_SIGNALS', nameAr: 'إشارات عصبية للتحديث',             type: 'SIGNAL',   destination: 'جميع الخلايا العصبية' },
        ],
        effect: {
            immediate:  'تكامل فوري ذكي بين كل مكونات الشبكة',
            short_term: 'منزل يُدار بالذكاء الاصطناعي بلا تدخل يدوي',
            long_term:  'نموذج المنزل المسلم الذكي الآمن المتكامل',
        },
        synapses: [
            { to_cell_id: 'CELL_HOME_ROUTER',         signal_type: 'AI_UNIFIED_POLICY', strength: 1.0 },
            { to_cell_id: 'CELL_HOME_FIREWALL',        signal_type: 'AI_POLICY_SYNC',   strength: 1.0 },
            { to_cell_id: 'CELL_HOME_5G_MODEM',        signal_type: 'AI_LINK_MGMT',     strength: 0.9 },
            { to_cell_id: 'CELL_HOME_SMART_HUB',       signal_type: 'AI_HUB_CONTROL',   strength: 0.9 },
            { to_cell_id: 'CELL_HOME_SHARIA_FILTER',   signal_type: 'AI_FILTER_SYNC',   strength: 1.0 },
            { to_cell_id: 'CELL_HOME_VPN',             signal_type: 'AI_TUNNEL_MGMT',   strength: 0.9 },
        ],
        ai_integration: {
            model:  'جميع نماذج ai-engine مُجمَّعة + Sheikha Neural Engine',
            role:   'منسق AI مركزي — يجمع قرارات كل النماذج ويطبقها على الشبكة',
            inputs: ['all_cell_telemetry', 'threat_scores', 'content_classifications', 'qos_demands'],
            output: 'unified_ai_policy + neural_signals + automated_actions',
        },
        quran_ref:   { ref: 'الأنفال: 60', text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ' },
        sharia_note: 'الجسر الذكي الموحّد — بنية منزلية تُجسّد الإتقان والأمانة بإذن الله',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// جمع الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_HOME_CELLS = {
    ...HOME_INTERNAL_CELLS,
    ...HOME_EXTERNAL_CELLS,
    ...HOME_SECURITY_CELLS,
    ...HOME_BRIDGE_CELL,
};

// ═══════════════════════════════════════════════════════════════════════════════
// الدوال الرئيسية
// ═══════════════════════════════════════════════════════════════════════════════

/** لوحة تحكم شاملة تدمج الخلايا العصبية مع الذكاء الاصطناعي */
function getHomeNetworkDashboard() {
    const cells     = Object.values(ALL_HOME_CELLS);
    const activated = cells.filter(c => c.activation >= 0.8).length;
    const aiInsights = aiEngine.getAINetworkInsights();

    return {
        nameAr:         'لوحة تحكم شبكة المنزل الذكي العصبية + الذكاء الاصطناعي',
        nameEn:         'Sheikha Smart Home Neural Network + AI Dashboard',
        icon:           '🏠🧠🤖',
        version:        '2.0.0',
        timestamp:      new Date().toISOString(),
        verse:          '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60',
        hadith:         '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — البيهقي',
        tawheed:        'لا إله إلا الله — وحدها لله',
        totalCells:     cells.length,
        activatedCells: activated,
        activationRate: `${Math.round((activated / cells.length) * 100)}%`,
        domains: {
            HOME_INTERNAL: { nameAr: 'الشبكة الداخلية', icon: '🏠', count: Object.keys(HOME_INTERNAL_CELLS).length, cells: Object.values(HOME_INTERNAL_CELLS).map(_cellSummary) },
            HOME_EXTERNAL: { nameAr: 'الشبكة الخارجية (5G)', icon: '📡', count: Object.keys(HOME_EXTERNAL_CELLS).length, cells: Object.values(HOME_EXTERNAL_CELLS).map(_cellSummary) },
            HOME_SECURITY: { nameAr: 'الأمن والحماية', icon: '🔐', count: Object.keys(HOME_SECURITY_CELLS).length, cells: Object.values(HOME_SECURITY_CELLS).map(_cellSummary) },
            HOME_BRIDGE:   { nameAr: 'جسر التكامل الذكي', icon: '🌉', count: Object.keys(HOME_BRIDGE_CELL).length, cells: Object.values(HOME_BRIDGE_CELL).map(_cellSummary) },
        },
        ai_engine: {
            nameAr:          'محرك الذكاء الاصطناعي المدمج',
            models:          aiInsights.models,
            live_metrics:    aiInsights.live_metrics,
            capabilities:    aiInsights.ai_capabilities,
            integration_status: 'active',
        },
        securityScore:    _calculateSecurityScore(),
        shariaCompliance: { enabled: true, ai_powered: true, verse: '﴿ قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ ﴾ — النور: 30' },
    };
}

/** جلب خلية بمعرّفها */
function getHomeCell(cellId) {
    return ALL_HOME_CELLS[cellId] || null;
}

/** جلب خلايا نطاق معين */
function getHomeDomain(domain) {
    return Object.values(ALL_HOME_CELLS).filter(c => c.domain === domain);
}

/** إطلاق إشارة عصبية من خلية */
function fireHomeSignal(fromCellId, signal = {}, depth = 3) {
    const origin = ALL_HOME_CELLS[fromCellId];
    if (!origin) return { success: false, error: 'cell_not_found', messageAr: `خلية غير موجودة: ${fromCellId}` };

    const propagation = _propagate(fromCellId, signal, depth, new Set());
    return {
        success: true,
        origin:  _cellSummary(origin),
        signal:  { ...signal, type: signal.type || 'HOME_NEURAL_SIGNAL' },
        depth,
        propagation,
        ai_integration: origin.ai_integration || null,
        timestamp:  new Date().toISOString(),
        verse:      origin.quran_ref,
        sharia_note:origin.sharia_note,
        tawheed:    'وحدها لله',
    };
}

/** حالة الأمن الشاملة مع AI */
function getHomeSecurityStatus() {
    const secCells = Object.values(HOME_SECURITY_CELLS);
    return {
        nameAr:         'حالة الأمن والحماية الذكية لشبكة المنزل',
        timestamp:      new Date().toISOString(),
        securityScore:  _calculateSecurityScore(),
        ai_powered:     true,
        cells:          secCells.map(c => ({ ..._cellSummary(c), ai_integration: c.ai_integration, sharia_note: c.sharia_note })),
        active_protections: [
            { id: 'ai_firewall',   nameAr: 'جدار حماية بالذكاء الاصطناعي',        active: true },
            { id: 'ai_ids',        nameAr: 'كشف اختراق LSTM + Random Forest',      active: true },
            { id: 'ai_vpn',        nameAr: 'VPN ذكي مع split tunnel تلقائي',       active: true },
            { id: 'ai_filter',     nameAr: 'فلتر شرعي BERT-Arabic',                active: true },
            { id: 'zero_trust',    nameAr: 'نموذج Zero Trust مع AI',               active: true },
            { id: 'federated_ml',  nameAr: 'تعلم آلي فيدرالي محافظ على الخصوصية', active: true },
        ],
        sharia_principles: [
            { rule: 'لا تجسس',  ref: 'الحجرات: 12', enforced: true, ai_mechanism: 'Zero Trust + encrypted audit logs' },
            { rule: 'لا فحش',   ref: 'النور: 30',   enforced: true, ai_mechanism: 'BERT-Arabic content classifier' },
            { rule: 'الأمانة',  ref: 'الأحزاب: 72', enforced: true, ai_mechanism: 'AES-256 + federated learning' },
            { rule: 'لا ضرر',   ref: 'الحديث',      enforced: true, ai_mechanism: 'AI anomaly detection + auto-quarantine' },
            { rule: 'الإتقان',  ref: 'البيهقي',     enforced: true, ai_mechanism: 'Continuous AI model improvement' },
        ],
        verse:  '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ وَمِن رِّبَاطِ الْخَيْلِ ﴾ — الأنفال: 60',
        hadith: '«الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ» — البخاري',
    };
}

/** حالة التكامل بين الشبكة الداخلية والخارجية مع الذكاء الاصطناعي */
function getIntegrationStatus() {
    const bridge = HOME_BRIDGE_CELL.CELL_HOME_BRIDGE;
    const internalCells = Object.values(HOME_INTERNAL_CELLS);
    const externalCells = Object.values(HOME_EXTERNAL_CELLS);
    return {
        nameAr:         'حالة التكامل الذكي بين الشبكة الداخلية والخارجية',
        timestamp:      new Date().toISOString(),
        bridge:         _cellSummary(bridge),
        ai_orchestration: bridge.ai_integration,
        internal: {
            count:         internalCells.length,
            status:        'نشطة',
            avgActivation: _avg(internalCells.map(c => c.activation)),
            cells:         internalCells.map(_cellSummary),
        },
        external: {
            count:         externalCells.length,
            status:        'نشطة',
            avgActivation: _avg(externalCells.map(c => c.activation)),
            cells:         externalCells.map(_cellSummary),
        },
        ai_security_layer: {
            enabled:    true,
            mechanisms: [
                'جدار حماية AI (DPI + ML)',
                'VPN ذكي (split tunnel تلقائي)',
                'كشف اختراق LSTM + RF',
                'فلتر شرعي BERT-Arabic',
                'DNS آمن إسلامي',
                'Zero Trust Architecture',
                'Federated Learning (حفظ الخصوصية)',
            ],
        },
        synaptic_connections: bridge.synapses,
        verse:  '﴿ وَلِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ﴾ — آل عمران: 109',
        tawheed:'وحدها لله',
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// دوال مساعدة داخلية
// ═══════════════════════════════════════════════════════════════════════════════

function _cellSummary(cell) {
    return {
        id:                cell.id,
        nameAr:            cell.nameAr,
        nameEn:            cell.nameEn,
        icon:              cell.icon,
        domain:            cell.domain,
        activation:        cell.activation,
        activation_number: cell.activation_number,
        synapses_count:    (cell.synapses || []).length,
        status:            cell.activation >= 0.8 ? 'active' : 'partial',
        ai_integrated:     !!cell.ai_integration,
        quran_ref:         cell.quran_ref,
    };
}

function _propagate(cellId, signal, depth, visited) {
    if (depth <= 0 || visited.has(cellId)) return [];
    visited.add(cellId);
    const cell = ALL_HOME_CELLS[cellId];
    if (!cell) return [];
    const result = [{ cellId, nameAr: cell.nameAr, icon: cell.icon, signal, depth, ai_integrated: !!cell.ai_integration }];
    for (const syn of (cell.synapses || [])) {
        if (!visited.has(syn.to_cell_id)) {
            result.push(..._propagate(syn.to_cell_id, { ...signal, via_synapse: syn.signal_type, strength: syn.strength }, depth - 1, visited));
        }
    }
    return result;
}

function _calculateSecurityScore() {
    const secCells = Object.values(HOME_SECURITY_CELLS);
    return Math.round(_avg(secCells.map(c => c.activation)) * 100);
}

function _avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ═══════════════════════════════════════════════════════════════════════════════
// التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    // الخلايا
    HOME_INTERNAL_CELLS,
    HOME_EXTERNAL_CELLS,
    HOME_SECURITY_CELLS,
    HOME_BRIDGE_CELL,
    ALL_HOME_CELLS,
    // الدوال الرئيسية
    getHomeNetworkDashboard,
    getHomeCell,
    getHomeDomain,
    fireHomeSignal,
    getHomeSecurityStatus,
    getIntegrationStatus,
    // تمرير AI engine
    aiEngine,
};
