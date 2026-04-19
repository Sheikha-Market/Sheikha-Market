/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA UNIVERSAL NETWORKS NEURAL ENGINE
 * المحرك العصبي الكوني الشامل لكل أنواع الشبكات بالكون
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة ٣١
 * "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ" — النور ٣٥
 * "أَوَلَمْ يَرَوْا أَنَّا خَلَقْنَا لَهُم مِّمَّا عَمِلَتْ أَيْدِينَا أَنْعَامًا فَهُمْ لَهَا مَالِكُونَ" — يس ٧١
 * "وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ وَجَنَّاتٌ مِّنْ أَعْنَابٍ وَزَرْعٌ وَنَخِيلٌ صِنْوَانٌ وَغَيْرُ صِنْوَانٍ" — الرعد ٤
 *
 * يشمل هذا المحرك كل جنس ونوع وصفة لكل شبكة في الكون:
 *
 * ✅ الشبكات الرقمية والحاسوبية  (LAN, WAN, MAN, PAN, SAN, VPN, SDN, CDN, IoT, P2P, Mesh, Edge, Fog, Overlay)
 * ✅ شبكات الاتصالات              (PSTN, 2G→6G, الأقمار الصناعية, الراديو, الميكرويف, الألياف الضوئية)
 * ✅ الشبكات العصبية الاصطناعية   (ANN, CNN, RNN, LSTM, GRU, GAN, Transformer, GNN, Diffusion, NeRF)
 * ✅ الشبكات البيولوجية           (العصبية, الأيضية, البروتينية, الجينية, الإيكولوجية, المناعية)
 * ✅ شبكات الطاقة والكهرباء       (الشبكة الكهربائية, الذكية, الميكروشبكة, الهيدروجين, HVDC)
 * ✅ شبكات النقل والمواصلات       (الطرق, السكك, الجو, البحر, الأنابيب, التنقل الذكي)
 * ✅ الشبكات الاجتماعية           (العلاقات, المعلومات, الاقتصادية, الثقافية, العلمية)
 * ✅ الشبكات المالية والاقتصادية  (المصرفية, سلاسل التوريد, البلوكشين, أسواق المال)
 * ✅ شبكات الفضاء والكون          (أقمار, كم, ثقالية, شبكات بين النجوم)
 * ✅ الشبكات الكمية               (QKD, كم-إنترنت, التشابك الكمي)
 * ✅ شبكات المياه والصرف          (الري, الشرب, الصرف, الفيضانات)
 * ✅ شبكات الغاز والنفط           (الأنابيب, الخطوط, التوزيع)
 * ✅ الشبكات البيئية والإيكولوجية  (الغذاء, النظام البيئي, الأنهار, التربة)
 * ✅ شبكات المعرفة والعلم         (الاستشهادات, الأكاديمية, الابتكار, الفكر)
 * ✅ الشبكات اللوجستية            (سلاسل الإمداد, المستودعات, التخليص الجمركي)
 * ✅ الشبكات التجارية الإسلامية   (السوق الحلال, الزكاة, الوقف, المضاربة)
 *
 * + شبكة عصبية مدمجة تصنّف وتحلّل وتتعلم من أي نوع شبكة مُدخلة
 * + تكامل ناجع وابتكار نافع بمنهج الكتاب والسنة
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── استيراد الشبكة العصبية الحقيقية ───────────────────────────────────────
let SheikhaNeural = null;
let NeuralNetwork = null;
try {
    const neuralCore = require('./sheikha-neural-core');
    SheikhaNeural  = neuralCore.SheikhaNeural;
    NeuralNetwork  = neuralCore.NeuralNetwork;
} catch (_) {
    // تعمل بدون الشبكة العصبية إذا لم يكن الملف متاحًا
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. تصنيف الشبكات الكوني الشامل — UNIVERSAL NETWORK TAXONOMY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * كل جنس ونوع وصفة لكل شبكة موجودة في الكون
 * مُرتَّبة بمقياس التوحيد: من الخالق إلى المخلوق
 */
const UNIVERSAL_NETWORK_TAXONOMY = {

    // ══════════════════════════════════════════════════════
    // الجنس الأول: الشبكات الرقمية والحاسوبية
    // ══════════════════════════════════════════════════════
    digital_computer: {
        id: 'digital_computer',
        nameAr: 'الشبكات الرقمية والحاسوبية',
        nameEn: 'Digital & Computer Networks',
        maqsad: 'ARD',
        quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة ٣١',
        icon: '💻',
        types: [
            { id: 'pan',     nameAr: 'شبكة شخصية',              nameEn: 'PAN — Personal Area Network',         scale: '< 10 م',        examples: ['Bluetooth 5', 'NFC', 'ZigBee', 'USB', 'IrDA'] },
            { id: 'bsn',     nameAr: 'شبكة جسم',                nameEn: 'BSN — Body Sensor Network',           scale: '< 2 م',         examples: ['أجهزة طبية قابلة للارتداء', 'EEG', 'ECG wireless'] },
            { id: 'lan',     nameAr: 'شبكة محلية',               nameEn: 'LAN — Local Area Network',            scale: '< 1 كم',        examples: ['Ethernet', 'WiFi 6/6E/7', 'Token Ring'] },
            { id: 'wlan',    nameAr: 'شبكة محلية لاسلكية',        nameEn: 'WLAN — Wireless LAN',                 scale: '< 100 م',       examples: ['IEEE 802.11ax', 'IEEE 802.11be', 'HaLow (802.11ah)'] },
            { id: 'man',     nameAr: 'شبكة مدينية',              nameEn: 'MAN — Metropolitan Area Network',     scale: '5–50 كم',       examples: ['Metro Ethernet', 'WiMAX', 'DQDB'] },
            { id: 'wan',     nameAr: 'شبكة واسعة النطاق',         nameEn: 'WAN — Wide Area Network',             scale: 'قارات',         examples: ['MPLS', 'ATM', 'Frame Relay', 'SD-WAN', 'الإنترنت'] },
            { id: 'san',     nameAr: 'شبكة التخزين',             nameEn: 'SAN — Storage Area Network',          scale: 'مركز بيانات',   examples: ['Fibre Channel', 'iSCSI', 'FCoE', 'NVMe-oF'] },
            { id: 'nas',     nameAr: 'تخزين شبكي',               nameEn: 'NAS — Network Attached Storage',      scale: 'LAN',           examples: ['NFS', 'SMB/CIFS', 'AFP'] },
            { id: 'vpn',     nameAr: 'شبكة خاصة افتراضية',        nameEn: 'VPN — Virtual Private Network',       scale: 'عالمي (مشفّر)', examples: ['WireGuard', 'OpenVPN', 'IPSec/IKEv2', 'L2TP', 'SSTP'] },
            { id: 'vlan',    nameAr: 'شبكة محلية افتراضية',       nameEn: 'VLAN — Virtual LAN',                  scale: 'LAN افتراضي',   examples: ['IEEE 802.1Q', 'QinQ', 'PVLAN'] },
            { id: 'sdn',     nameAr: 'شبكة معرّفة برمجياً',       nameEn: 'SDN — Software Defined Network',      scale: 'مرن',           examples: ['OpenFlow', 'VMware NSX', 'Cisco ACI', 'ONOS'] },
            { id: 'nfv',     nameAr: 'وظائف شبكة افتراضية',      nameEn: 'NFV — Network Functions Virtualization',scale: 'مرن',          examples: ['vFirewall', 'vRouter', 'vLB', 'ETSI-NFV'] },
            { id: 'cdn',     nameAr: 'شبكة توصيل المحتوى',        nameEn: 'CDN — Content Delivery Network',      scale: 'عالمي',         examples: ['Cloudflare', 'Akamai', 'AWS CloudFront', 'Fastly'] },
            { id: 'p2p',     nameAr: 'شبكة نظير لنظير',           nameEn: 'P2P — Peer-to-Peer',                  scale: 'عالمي',         examples: ['BitTorrent', 'Gnutella', 'Kademlia DHT', 'IPFS'] },
            { id: 'mesh',    nameAr: 'شبكة شبكية',               nameEn: 'Mesh Network',                        scale: 'متغير',         examples: ['Meshtastic', 'goTenna', 'Wireless Mesh', 'Bluetooth Mesh'] },
            { id: 'overlay', nameAr: 'شبكة تراكب',               nameEn: 'Overlay Network',                     scale: 'فوق الإنترنت',  examples: ['Tor', 'I2P', 'Freenet', 'Chord', 'Pastry'] },
            { id: 'fog',     nameAr: 'شبكة الضباب الحوسبي',       nameEn: 'Fog Network',                         scale: 'قريب من المستخدم', examples: ['OpenFog Consortium', 'Cisco Fog', 'مركز بيانات صغير'] },
            { id: 'edge',    nameAr: 'شبكة الحافة',              nameEn: 'Edge Network / MEC',                  scale: 'حافة الشبكة',   examples: ['MEC (Multi-access Edge Computing)', 'AWS Wavelength', 'Azure Edge'] },
            { id: 'iot',     nameAr: 'إنترنت الأشياء',            nameEn: 'IoT Network',                         scale: 'متغير',         examples: ['LoRaWAN', 'Sigfox', 'NB-IoT', 'Thread', 'Matter', 'Z-Wave'] },
            { id: 'iiot',    nameAr: 'إنترنت الأشياء الصناعي',    nameEn: 'IIoT — Industrial IoT',               scale: 'مصنع/منشأة',    examples: ['OPC-UA', 'MQTT', 'PROFINET', 'Modbus TCP', 'EtherCAT'] },
            { id: 'scada',   nameAr: 'شبكات التحكم الصناعية',    nameEn: 'SCADA / ICS Networks',               scale: 'منشأة صناعية',  examples: ['DNP3', 'Modbus', 'IEC 60870-5', 'BACnet'] },
            { id: 'dcn',     nameAr: 'شبكة مركز البيانات',        nameEn: 'DCN — Data Centre Network',           scale: 'مركز بيانات',   examples: ['Fat-Tree', 'Spine-Leaf', 'BCube', 'DCell', 'VL2'] },
            { id: 'hpc',     nameAr: 'شبكات الحوسبة العالية الأداء',nameEn: 'HPC Interconnect',                 scale: 'مجموعة حواسيب', examples: ['InfiniBand', 'OmniPath', 'Cray Aries', 'Tofu', 'Dragonfly'] },
            { id: 'quantum_net', nameAr: 'شبكة الكم',            nameEn: 'Quantum Network',                     scale: 'مختبر→دولي',    examples: ['QKD Links', 'Quantum Internet Alliance', 'تشابك الفوتونات'] },
            { id: 'satellite_net', nameAr: 'شبكة الأقمار الصناعية', nameEn: 'Satellite Internet Network',      scale: 'عالمي/فضائي',   examples: ['Starlink', 'OneWeb', 'Amazon Kuiper', 'Iridium NEXT'] },
        ],
        scales: ['< 1 م', '< 10 م', '< 100 م', '< 1 كم', '5–50 كم', 'قاري', 'عالمي', 'فضائي'],
        metrics: ['bandwidth_bps', 'latency_ms', 'packet_loss_%', 'jitter_ms', 'topology', 'protocol', 'security_level'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثاني: شبكات الاتصالات
    // ══════════════════════════════════════════════════════
    telecommunications: {
        id: 'telecommunications',
        nameAr: 'شبكات الاتصالات',
        nameEn: 'Telecommunications Networks',
        maqsad: 'ARD',
        quranRef: '﴿ يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات ١٣',
        icon: '📡',
        types: [
            { id: 'pstn',      nameAr: 'شبكة الهاتف الأرضي',      nameEn: 'PSTN — Public Switched Telephone Network', scale: 'وطني/دولي', examples: ['خطوط POTS', 'ISDN', 'DSL'] },
            { id: '1g',        nameAr: 'الجيل الأول',              nameEn: '1G — Analog Cellular',                   scale: 'مدينة',     examples: ['AMPS', 'NMT', 'TACS'] },
            { id: '2g',        nameAr: 'الجيل الثاني',             nameEn: '2G — GSM / CDMA',                        scale: 'وطني',      examples: ['GSM 900/1800', 'GPRS', 'EDGE', 'CDMA2000 1x'] },
            { id: '3g',        nameAr: 'الجيل الثالث',             nameEn: '3G — UMTS / CDMA2000',                   scale: 'وطني',      examples: ['WCDMA', 'HSPA+', 'EV-DO', 'TD-SCDMA'] },
            { id: '4g',        nameAr: 'الجيل الرابع LTE',          nameEn: '4G — LTE / LTE-A',                       scale: 'وطني',      examples: ['LTE-FDD', 'LTE-TDD', 'LTE-A Pro', 'WiMAX 2'] },
            { id: '5g',        nameAr: 'الجيل الخامس',             nameEn: '5G — NR',                                scale: 'وطني/دولي', examples: ['5G NR Sub-6 GHz', '5G mmWave', 'NSA/SA', 'Network Slicing'] },
            { id: '6g',        nameAr: 'الجيل السادس',             nameEn: '6G — Future (2030+)',                     scale: 'عالمي',     examples: ['THz Band', 'AI-native', 'Holographic', '6G RIS'] },
            { id: 'satellite', nameAr: 'الأقمار الصناعية',          nameEn: 'Satellite Telecom',                      scale: 'عالمي',     examples: ['Intelsat', 'SES', 'Inmarsat', 'Iridium', 'Thuraya'] },
            { id: 'microwave', nameAr: 'شبكات الميكرويف',           nameEn: 'Microwave Backhaul',                     scale: 'خط مباشر',  examples: ['وصلات E-Band', 'وصلات V-Band', 'P-Series'] },
            { id: 'fiber',     nameAr: 'الألياف الضوئية',           nameEn: 'Fiber Optic Network',                    scale: 'عالمي',     examples: ['DWDM', 'SONET/SDH', 'OTN', 'Passive Optical Network (PON)'] },
            { id: 'lmds',      nameAr: 'توزيع متعدد النقاط',        nameEn: 'LMDS / MMDS',                            scale: '5 كم',      examples: ['28 GHz', '31 GHz', 'خدمة إنترنت لاسلكي'] },
            { id: 'hf_radio',  nameAr: 'راديو موجات قصيرة',         nameEn: 'HF Radio Network',                       scale: 'قاري',      examples: ['أجهزة الطيران', 'البحرية', 'الدفاع المدني', 'الهواة'] },
            { id: 'paging',    nameAr: 'شبكة النداء',               nameEn: 'Paging Network',                         scale: 'وطني',      examples: ['POCSAG', 'FLEX', 'ERMES'] },
            { id: 'dect',      nameAr: 'هاتف لاسلكي رقمي',          nameEn: 'DECT — Digital Enhanced Cordless',       scale: '50 م',      examples: ['هاتف منزلي لاسلكي', 'مزارع صناعية'] },
        ],
        scales: ['بناء', 'مدينة', 'وطني', 'إقليمي', 'دولي', 'عالمي', 'فضائي'],
        metrics: ['frequency_hz', 'bandwidth_hz', 'modulation', 'coverage_km2', 'capacity_users', 'latency_ms', 'spectral_efficiency'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثالث: شبكات الإنترنت والبروتوكولات
    // ══════════════════════════════════════════════════════
    internet_protocols: {
        id: 'internet_protocols',
        nameAr: 'شبكات الإنترنت والبروتوكولات',
        nameEn: 'Internet & Protocol Networks',
        maqsad: 'ARD',
        quranRef: '﴿ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴾ — العصر ٣',
        icon: '🌐',
        types: [
            { id: 'ipv4',      nameAr: 'الإنترنت IPv4',           nameEn: 'IPv4 Internet',                   scale: 'عالمي',   examples: ['~4.3 مليار عنوان', 'NAT', 'CIDR', 'BGP-4'] },
            { id: 'ipv6',      nameAr: 'الإنترنت IPv6',           nameEn: 'IPv6 Internet',                   scale: 'عالمي',   examples: ['340 سيكستيليون عنوان', 'NDP', 'SLAAC', 'DHCPv6'] },
            { id: 'web',       nameAr: 'شبكة الويب',              nameEn: 'World Wide Web',                  scale: 'عالمي',   examples: ['HTTP/1.1', 'HTTP/2', 'HTTP/3 (QUIC)', 'WebSockets', 'REST', 'GraphQL'] },
            { id: 'dns',       nameAr: 'نظام أسماء النطاقات',      nameEn: 'DNS Infrastructure',              scale: 'عالمي',   examples: ['Root Servers', 'DNSSEC', 'DoH', 'DoT', 'EDNS'] },
            { id: 'bgp',       nameAr: 'بروتوكول توجيه الحدود',   nameEn: 'BGP — Inter-domain Routing',      scale: 'عالمي',   examples: ['~900 ألف مسار', 'AS Numbers', 'Route Reflectors'] },
            { id: 'cdn_web',   nameAr: 'شبكة الويب التوزيعية',    nameEn: 'Web CDN / Edge',                  scale: 'عالمي',   examples: ['Cloudflare', 'Fastly', 'Akamai', 'PoP Nodes'] },
            { id: 'darkweb',   nameAr: 'الشبكة المظلمة',           nameEn: 'Dark Web / Darknet',              scale: 'عالمي',   examples: ['Tor Network', 'I2P', 'Freenet'] },
            { id: 'web3',      nameAr: 'الويب اللامركزي',          nameEn: 'Web3 / Decentralized Web',        scale: 'عالمي',   examples: ['IPFS', 'Ethereum P2P', 'Filecoin', 'ENS'] },
            { id: 'email_net', nameAr: 'شبكة البريد الإلكتروني',  nameEn: 'Email Network',                   scale: 'عالمي',   examples: ['SMTP', 'IMAP', 'POP3', 'DKIM', 'SPF', 'DMARC'] },
            { id: 'voip',      nameAr: 'شبكة الصوت عبر الإنترنت', nameEn: 'VoIP Network',                    scale: 'عالمي',   examples: ['SIP', 'H.323', 'WebRTC', 'RTP/RTCP', 'Codec: G.711/G.729'] },
        ],
        scales: ['جهاز', 'LAN', 'مؤسسة', 'ISP', 'IXP', 'عالمي'],
        metrics: ['autonomous_systems', 'ip_prefixes', 'throughput_bps', 'rtt_ms', 'ttl', 'mtu_bytes'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الرابع: الشبكات العصبية الاصطناعية وأنواع الذكاء
    // ══════════════════════════════════════════════════════
    artificial_neural: {
        id: 'artificial_neural',
        nameAr: 'الشبكات العصبية الاصطناعية',
        nameEn: 'Artificial Neural Networks (ANN)',
        maqsad: 'AQL',
        quranRef: '﴿ وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ ﴾ — يوسف ٧٦',
        icon: '🧠',
        types: [
            { id: 'ann',          nameAr: 'شبكة عصبية مغذّاة للأمام',   nameEn: 'Feedforward ANN (MLP)',            params: 'المعاملات: أي عدد',   examples: ['تصنيف الصور', 'الاستدلال الشرعي', 'تحليل السوق'] },
            { id: 'cnn',          nameAr: 'شبكة التفافية',               nameEn: 'CNN — Convolutional Neural Network',params: 'نوى + تجميع',         examples: ['ResNet', 'VGG', 'EfficientNet', 'YOLO', 'رؤية حاسوبية'] },
            { id: 'rnn',          nameAr: 'شبكة تكرارية',                nameEn: 'RNN — Recurrent Neural Network',   params: 'ذاكرة زمنية',         examples: ['تسلسلات زمنية', 'نصوص', 'صوت'] },
            { id: 'lstm',         nameAr: 'ذاكرة قصيرة طويلة المدى',     nameEn: 'LSTM',                             params: '4 بوابات لكل خلية',   examples: ['NLP', 'توقع الأسعار', 'الترجمة الآلية'] },
            { id: 'gru',          nameAr: 'وحدة التكرار المبوّبة',       nameEn: 'GRU — Gated Recurrent Unit',       params: '3 بوابات',            examples: ['تشابه LSTM بتعقيد أقل'] },
            { id: 'transformer',  nameAr: 'المحوّل',                     nameEn: 'Transformer (Attention-based)',     params: 'انتباه ذاتي متعدد',   examples: ['BERT', 'GPT', 'T5', 'ViT', 'Whisper'] },
            { id: 'gnn',          nameAr: 'شبكة عصبية على الرسوم البيانية', nameEn: 'GNN — Graph Neural Network',   params: 'رسوم بيانية',         examples: ['GCN', 'GAT', 'GraphSAGE', 'اكتشاف الأدوية'] },
            { id: 'gan',          nameAr: 'شبكة توليدية تنافسية',         nameEn: 'GAN — Generative Adversarial Net', params: 'مولّد + ناقد',        examples: ['DCGAN', 'StyleGAN3', 'CycleGAN', 'تخليق الصور'] },
            { id: 'vae',          nameAr: 'مشفّر ذاتي تباديّ',           nameEn: 'VAE — Variational Autoencoder',    params: 'فضاء كمون',           examples: ['توليد محتوى', 'كشف الشذوذ', 'ضغط البيانات'] },
            { id: 'diffusion',    nameAr: 'نموذج الانتشار',               nameEn: 'Diffusion Model',                  params: 'خطوات انتشار',        examples: ['DALL-E', 'Stable Diffusion', 'Midjourney'] },
            { id: 'nerf',         nameAr: 'شبكة عصبية تمثيل ثلاثي الأبعاد', nameEn: 'NeRF — Neural Radiance Field', params: 'استشعار ضمني',        examples: ['إعادة بناء ثلاثية الأبعاد', 'الواقع الافتراضي'] },
            { id: 'snn',          nameAr: 'شبكة نابضة',                  nameEn: 'SNN — Spiking Neural Network',     params: 'نبضات زمنية',         examples: ['Intel Loihi', 'IBM TrueNorth', 'حوسبة عصبية حيوية'] },
            { id: 'capsnet',      nameAr: 'شبكة الكبسولات',               nameEn: 'CapsNet — Capsule Network',        params: 'كبسولات متجهية',      examples: ['تحليل العلاقات المكانية', 'تمييز الوجوه'] },
            { id: 'esn',          nameAr: 'شبكة حالة الصدى',              nameEn: 'ESN — Echo State Network',         params: 'خزّان عشوائي',        examples: ['معالجة الإشارات', 'ديناميكيات الفوضى'] },
            { id: 'rbm',          nameAr: 'آلة بولتزمان محدودة',           nameEn: 'RBM — Restricted Boltzmann Machine', params: 'طبقتان',           examples: ['تصفية تعاونية', 'تعلم تمثيل'] },
            { id: 'dbn',          nameAr: 'شبكة بيز العميقة',             nameEn: 'DBN — Deep Belief Network',        params: 'طبقات RBM مكدّسة',    examples: ['تعرف على الصوت', 'تصنيف الصور'] },
            { id: 'autoencoder',  nameAr: 'مشفّر ذاتي',                  nameEn: 'Autoencoder',                      params: 'مشفّر + مفكك',        examples: ['تخفيض الأبعاد', 'إزالة الضوضاء', 'كشف الشذوذ'] },
            { id: 'hopfield',     nameAr: 'شبكة هوبفيلد',                nameEn: 'Hopfield Network',                 params: 'ذاكرة تداعوية',       examples: ['تحسين المزاوجة', 'تصحيح الأنماط'] },
            { id: 'kohonen',      nameAr: 'خريطة ذاتية التنظيم',          nameEn: 'Kohonen SOM',                      params: 'خريطة ثنائية الأبعاد',examples: ['تصور البيانات', 'تجميع بيانات السوق'] },
            { id: 'radial',       nameAr: 'شبكة أساس شعاعي',              nameEn: 'RBF Network — Radial Basis Function', params: 'دوال شعاعية',     examples: ['تقريب الدوال', 'السلسلة الزمنية'] },
            { id: 'xai',          nameAr: 'ذكاء اصطناعي قابل للتفسير',   nameEn: 'XAI — Explainable AI',             params: 'SHAP, LIME, Grad-CAM', examples: ['قرارات شرعية موضّحة', 'تدقيق مالي'] },
            { id: 'rl_net',       nameAr: 'شبكة تعلم تعزيزي',            nameEn: 'Reinforcement Learning Network',   params: 'مكافأة + حالة',       examples: ['DQN', 'PPO', 'AlphaGo', 'إدارة المخزون الذكي'] },
            { id: 'federated',    nameAr: 'تعلم موزّع',                   nameEn: 'Federated Learning Network',       params: 'بيانات محلية',        examples: ['Flower', 'PySyft', 'TFF — تعلم بدون مشاركة بيانات خاصة'] },
        ],
        scales: ['perceptron', 'shallow(1-3 layers)', 'deep(4-20)', 'very-deep(21-100)', 'ultra-deep(100+)', 'foundation-model'],
        metrics: ['parameters_count', 'flops', 'accuracy_%', 'loss', 'training_epochs', 'inference_ms', 'model_size_mb'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الخامس: الشبكات البيولوجية
    // ══════════════════════════════════════════════════════
    biological: {
        id: 'biological',
        nameAr: 'الشبكات البيولوجية',
        nameEn: 'Biological Networks',
        maqsad: 'NAFS',
        quranRef: '﴿ وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ ﴾ — الذاريات ٢١',
        icon: '🧬',
        types: [
            { id: 'neural_bio',   nameAr: 'الشبكة العصبية البيولوجية',   nameEn: 'Biological Neural Network',        nodes: '~86 مليار خلية عصبية',  examples: ['الدماغ البشري', 'الجهاز العصبي', 'الشبكة الخلطية'] },
            { id: 'metabolic',    nameAr: 'الشبكة الأيضية',              nameEn: 'Metabolic Network',                nodes: 'آلاف التفاعلات',        examples: ['دورة كربس', 'الجليكوليسيس', 'KEGG Database'] },
            { id: 'protein',      nameAr: 'شبكة تفاعل البروتينات',       nameEn: 'Protein Interaction Network (PIN)', nodes: 'آلاف البروتينات',       examples: ['STRING DB', 'BioGRID', 'ورقة AlphaFold'] },
            { id: 'gene_reg',     nameAr: 'شبكة التنظيم الجيني',          nameEn: 'Gene Regulatory Network (GRN)',    nodes: '~25,000 جين بشري',      examples: ['عوامل النسخ', 'الحمض النووي الريبي غير الرامز'] },
            { id: 'signaling',    nameAr: 'شبكة إشارة الخلية',            nameEn: 'Cell Signaling Network',           nodes: 'مستقبلات + بروتينات',   examples: ['MAPK', 'PI3K', 'EGFR', 'mTOR'] },
            { id: 'immune',       nameAr: 'الشبكة المناعية',              nameEn: 'Immune Network',                   nodes: 'خلايا + أجسام مضادة',   examples: ['التوازن المناعي', 'جيريم نظرية شبكة المناعة'] },
            { id: 'food_web',     nameAr: 'شبكة الغذاء (السلسلة الغذائية)', nameEn: 'Food Web / Ecological Network', nodes: 'أنواع',                 examples: ['بحيرة', 'غابة مطيرة', 'أكوانا البحر الأحمر'] },
            { id: 'mycorrhizal',  nameAr: 'شبكة الفطريات الجذرية',        nameEn: 'Mycorrhizal / Wood Wide Web',      nodes: 'أشجار + فطريات',        examples: ['شبكة الغابات تحت الأرض', 'تبادل المغذيات'] },
            { id: 'vascular',     nameAr: 'الشبكة الوعائية',              nameEn: 'Vascular Network',                 nodes: 'أوعية + شعيرات',        examples: ['القلب والدم', 'النبات الوعائي'] },
            { id: 'pollination',  nameAr: 'شبكة التلقيح',                nameEn: 'Plant-Pollinator Network',          nodes: 'نباتات + ملقّحات',       examples: ['شبكة نحل-أزهار', 'خدمات النظام البيئي'] },
            { id: 'microbiome',   nameAr: 'شبكة الميكروبيوم',             nameEn: 'Microbiome Network',               nodes: 'مليارات الميكروبات',    examples: ['ميكروبيوم الأمعاء', 'التنافس والتعايش'] },
        ],
        scales: ['جزيء', 'خلية', 'نسيج', 'عضو', 'كائن', 'نظام بيئي', 'كوكب'],
        metrics: ['nodes_count', 'edges_count', 'clustering_coefficient', 'path_length', 'modularity', 'hub_proteins'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس السادس: شبكات الطاقة والكهرباء
    // ══════════════════════════════════════════════════════
    energy_power: {
        id: 'energy_power',
        nameAr: 'شبكات الطاقة والكهرباء',
        nameEn: 'Energy & Power Networks',
        maqsad: 'ARD',
        quranRef: '﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ﴾ — النور ٣٥',
        icon: '⚡',
        types: [
            { id: 'transmission',  nameAr: 'شبكة نقل الكهرباء',          nameEn: 'Electricity Transmission Grid',   voltage: '110–1000 كف',      examples: ['HVAC', 'HVDC', 'خطوط الضغط العالي'] },
            { id: 'distribution',  nameAr: 'شبكة توزيع الكهرباء',         nameEn: 'Electricity Distribution Grid',  voltage: '11–33 كف',         examples: ['محطات التحويل', 'خطوط التوزيع المتوسطة والمنخفضة'] },
            { id: 'smart_grid',    nameAr: 'الشبكة الكهربائية الذكية',    nameEn: 'Smart Grid',                     voltage: 'متغير',            examples: ['عداد ذكي AMI', 'استجابة الطلب', 'SCADA الكهربائي'] },
            { id: 'microgrid',     nameAr: 'شبكة الميكرو',               nameEn: 'Microgrid',                       voltage: '400 ف – 11 كف',    examples: ['مجمع سكني', 'جزيرة طاقة', 'معسكر طوارئ'] },
            { id: 'solar_net',     nameAr: 'شبكة الطاقة الشمسية',         nameEn: 'Solar PV Network',               peak_gw: 'أكثر من 1000 جيجا', examples: ['محطة نيوم الشمسية', 'NEOM', 'الرياض'] },
            { id: 'wind_net',      nameAr: 'شبكة طاقة الرياح',            nameEn: 'Wind Power Network',             peak_gw: '>2000 جيجا عالمياً', examples: ['مزارع رياح بحرية وبرية', 'Vestas', 'Siemens Gamesa'] },
            { id: 'hydro_net',     nameAr: 'شبكة الطاقة المائية',          nameEn: 'Hydropower Network',             peak_gw: '>1300 جيجا عالمياً', examples: ['السد العالي', 'Three Gorges', 'إيتيبو'] },
            { id: 'nuclear_net',   nameAr: 'شبكة الطاقة النووية',          nameEn: 'Nuclear Power Network',          peak_gw: '>400 جيجا عالمياً', examples: ['PWR', 'BWR', 'SMR', 'مفاعلات الجيل الرابع'] },
            { id: 'hydrogen_net',  nameAr: 'شبكة الهيدروجين',              nameEn: 'Hydrogen Energy Network',        scale: 'ناشئة',               examples: ['نيوم Green H2', 'خط أنابيب H2', 'خلايا الوقود'] },
            { id: 'geothermal',    nameAr: 'شبكة الطاقة الجوفية',          nameEn: 'Geothermal Network',             scale: 'إقليمي',              examples: ['آيسلندا', 'إندونيسيا', 'كينيا'] },
            { id: 'gas_network',   nameAr: 'شبكة الغاز الطبيعي',           nameEn: 'Natural Gas Network',            pressure: 'ضغط عالٍ-منخفض',  examples: ['Nord Stream', 'Arab Gas Pipeline', 'LNG Terminals'] },
            { id: 'oil_pipeline',  nameAr: 'شبكة أنابيب النفط',            nameEn: 'Oil Pipeline Network',           scale: 'قاري',                examples: ['خط تاب', 'أرامكو', 'كي-ستون'] },
        ],
        scales: ['مبنى', 'مجمع', 'مدينة', 'إقليم', 'وطني', 'قاري', 'عالمي'],
        metrics: ['installed_capacity_gw', 'voltage_kv', 'frequency_hz', 'line_losses_%', 'reliability_saidi', 'renewable_%'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس السابع: شبكات النقل والمواصلات
    // ══════════════════════════════════════════════════════
    transportation: {
        id: 'transportation',
        nameAr: 'شبكات النقل والمواصلات',
        nameEn: 'Transportation Networks',
        maqsad: 'MAL',
        quranRef: '﴿ وَالْخَيْلَ وَالْبِغَالَ وَالْحَمِيرَ لِتَرْكَبُوهَا وَزِينَةً ﴾ — النحل ٨',
        icon: '🚗',
        types: [
            { id: 'road',         nameAr: 'شبكة الطرق',                nameEn: 'Road Network',                    length_km: '>64 مليون كم عالمياً', examples: ['طريق الحج', 'شبكة الطرق السريعة'] },
            { id: 'rail',         nameAr: 'شبكة السكك الحديدية',        nameEn: 'Rail Network',                    length_km: '>1.4 مليون كم',        examples: ['قطار الحرمين', 'الرياض Metro', 'فائق السرعة (HSR)'] },
            { id: 'aviation',     nameAr: 'شبكة الطيران',               nameEn: 'Aviation Network',                routes: '>50,000 مسار يومي',        examples: ['IATA', 'مطار الملك خالد', 'طرق التجارة الجوية'] },
            { id: 'maritime',     nameAr: 'شبكة الملاحة البحرية',        nameEn: 'Maritime Shipping Network',       routes: 'قنوات + ميناء',           examples: ['قناة السويس', 'ميناء جدة', 'طرق الحاويات'] },
            { id: 'pipeline_net', nameAr: 'شبكة الأنابيب العامة',        nameEn: 'Pipeline Transport Network',      length_km: '>3.5 مليون كم',        examples: ['أنابيب الغاز والنفط والماء'] },
            { id: 'urban_transit',nameAr: 'شبكة النقل الحضري',           nameEn: 'Urban Transit Network',           scale: 'مدينة',                    examples: ['المترو', 'BRT', 'الترام', 'الحافلة الذكية'] },
            { id: 'logistic_net', nameAr: 'شبكة الإمداد واللوجستيات',   nameEn: 'Logistics & Supply Chain Network', scale: 'عالمي',                   examples: ['DHL', 'FedEx', 'أرامكس', 'أمازون'] },
            { id: 'hyperloop',    nameAr: 'نفق الهايبرلوب',              nameEn: 'Hyperloop / Vacuum Tube Transit',  scale: 'ناشئة',                    examples: ['Virgin Hyperloop', 'ذا لوب', 'نيوم'] },
            { id: 'drone_net',    nameAr: 'شبكة الطائرات المسيّرة',       nameEn: 'Drone / UAV Network',              scale: 'مدينة',                    examples: ['UTM', 'Amazon Prime Air', 'Wing', 'Zipline'] },
        ],
        scales: ['محلي', 'مدينة', 'إقليمي', 'وطني', 'قاري', 'عالمي'],
        metrics: ['nodes_count', 'edges_km', 'avg_speed_kmh', 'capacity_vehicles_day', 'connectivity_index', 'emissions_co2'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثامن: الشبكات الاجتماعية والإنسانية
    // ══════════════════════════════════════════════════════
    social_human: {
        id: 'social_human',
        nameAr: 'الشبكات الاجتماعية والإنسانية',
        nameEn: 'Social & Human Networks',
        maqsad: 'NAFS',
        quranRef: '﴿ إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ ﴾ — الحجرات ١٠',
        icon: '🤝',
        types: [
            { id: 'kinship',      nameAr: 'شبكة القرابة والنسب',          nameEn: 'Kinship Network',                 scale: 'عائلة→قبيلة',   examples: ['أنساب', 'شجرة العائلة', 'قبائل الجزيرة العربية'] },
            { id: 'friendship',   nameAr: 'شبكة الصداقة والمعارف',         nameEn: 'Friendship Network',              scale: 'مجتمع',          examples: ['دراسة دنكن واتس', 'درجات الانفصال الست'] },
            { id: 'professional', nameAr: 'شبكة مهنية',                   nameEn: 'Professional Network',            scale: 'صناعة',          examples: ['LinkedIn', 'جمعيات مهنية', 'غرف التجارة'] },
            { id: 'religious',    nameAr: 'شبكة دينية',                   nameEn: 'Religious / Ummah Network',       scale: 'عالمي',          examples: ['الأمة الإسلامية 1.8 مليار', 'الحج', 'العلماء'] },
            { id: 'academic',     nameAr: 'شبكة أكاديمية علمية',           nameEn: 'Academic / Citation Network',    scale: 'عالمي',          examples: ['Web of Science', 'Google Scholar', 'Semantic Scholar'] },
            { id: 'info_spread',  nameAr: 'شبكة انتشار المعلومات',          nameEn: 'Information Diffusion Network',  scale: 'عالمي',          examples: ['Twitter/X', 'واتساب', 'تلغرام', 'الأخبار'] },
            { id: 'trade_routes', nameAr: 'شبكة طرق التجارة التاريخية',    nameEn: 'Historic Trade Network',          scale: 'قاري',           examples: ['طريق الحرير', 'طريق البخور', 'قريش'] },
            { id: 'political',    nameAr: 'شبكة التحالفات السياسية',        nameEn: 'Political Alliance Network',     scale: 'دولي',           examples: ['G20', 'الجامعة العربية', 'OIC', 'الأمم المتحدة'] },
            { id: 'language',     nameAr: 'شبكة اللغات',                   nameEn: 'Language Network',               scale: 'عالمي',          examples: ['7000+ لغة', 'الأسرات اللغوية', 'اللغة العربية'] },
        ],
        scales: ['فرد', 'عائلة', 'مجتمع', 'مدينة', 'دولة', 'إقليمي', 'عالمي'],
        metrics: ['nodes_people', 'edges_relations', 'density', 'clustering', 'betweenness_centrality', 'influence_score'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس التاسع: الشبكات المالية والاقتصادية والإسلامية
    // ══════════════════════════════════════════════════════
    financial_economic: {
        id: 'financial_economic',
        nameAr: 'الشبكات المالية والاقتصادية الإسلامية',
        nameEn: 'Financial & Economic Networks (Halal)',
        maqsad: 'MAL',
        quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة ٢٧٥',
        icon: '💰',
        types: [
            { id: 'banking_net',   nameAr: 'شبكة المصارف',               nameEn: 'Banking Network',                 scale: 'وطني/دولي',     examples: ['SWIFT', 'Fedwire', 'CHAPS', 'SEPA', 'سامبا'] },
            { id: 'islamic_fin',   nameAr: 'شبكة التمويل الإسلامي',       nameEn: 'Islamic Finance Network',         scale: 'عالمي',          examples: ['AAOIFI', 'IFSB', 'صكوك', 'مرابحة', 'مضاربة'] },
            { id: 'zakat_net',     nameAr: 'شبكة الزكاة والصدقات',        nameEn: 'Zakat & Sadaqah Network',         scale: 'عالمي',          examples: ['هيئة الزكاة السعودية', 'NZF', 'شيخة-زكاة'] },
            { id: 'waqf_net',      nameAr: 'شبكة الأوقاف',               nameEn: 'Waqf Endowment Network',          scale: 'عالمي',          examples: ['الأوقاف السعودية', 'أوقاف مصر', 'أوقاف ماليزيا'] },
            { id: 'supply_chain',  nameAr: 'سلسلة التوريد الذكية',         nameEn: 'Smart Supply Chain Network',      scale: 'عالمي',          examples: ['Amazon', 'Maersk', 'سلاسل الحلال'] },
            { id: 'blockchain_net',nameAr: 'شبكات البلوكشين',              nameEn: 'Blockchain Network',              scale: 'عالمي',          examples: ['Bitcoin', 'Ethereum', 'Hyperledger', 'شيخة-بلوك'] },
            { id: 'stock_market',  nameAr: 'أسواق الأوراق المالية',        nameEn: 'Stock Market Network',            scale: 'عالمي',          examples: ['تداول السعودية', 'NYSE', 'NASDAQ', 'LSE'] },
            { id: 'trade_network', nameAr: 'شبكة التجارة الدولية',         nameEn: 'International Trade Network',     scale: 'عالمي',          examples: ['WTO', 'مناطق التجارة الحرة', 'مبادرة الحزام والطريق'] },
            { id: 'fintech_net',   nameAr: 'شبكة التقنية المالية',          nameEn: 'FinTech Network',                 scale: 'عالمي',          examples: ['Stripe', 'STC Pay', 'شيخة-مدفوعات'] },
            { id: 'micro_finance', nameAr: 'شبكة التمويل الأصغر',          nameEn: 'Microfinance Network',             scale: 'محلي',           examples: ['قرض حسن', 'Grameen', 'CGAP'] },
        ],
        scales: ['فرد', 'شركة', 'قطاع', 'وطني', 'إقليمي', 'عالمي'],
        metrics: ['transaction_volume_usd', 'nodes_institutions', 'systemic_risk', 'connectivity', 'liquidity', 'sharia_compliance_%'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس العاشر: شبكات الفضاء والكون
    // ══════════════════════════════════════════════════════
    space_cosmic: {
        id: 'space_cosmic',
        nameAr: 'شبكات الفضاء والكون',
        nameEn: 'Space & Cosmic Networks',
        maqsad: 'ARD',
        quranRef: '﴿ وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ وَالنُّجُومُ مُسَخَّرَاتٌ بِأَمْرِهِ ﴾ — النحل ١٢',
        icon: '🌌',
        types: [
            { id: 'leo_sat',      nameAr: 'أقمار المدار المنخفض',          nameEn: 'LEO Satellite Constellation',     altitude: '200–2000 كم',      examples: ['Starlink (~6000)', 'OneWeb', 'Amazon Kuiper'] },
            { id: 'meo_sat',      nameAr: 'أقمار المدار المتوسط',          nameEn: 'MEO Satellite',                   altitude: '2000–35000 كم',    examples: ['GPS', 'Galileo', 'GLONASS', 'Beidou'] },
            { id: 'geo_sat',      nameAr: 'أقمار المدار الثابت',           nameEn: 'GEO Satellite',                   altitude: '35786 كم',         examples: ['Intelsat', 'SES', 'ArabSat', 'Nilesat'] },
            { id: 'deep_space',   nameAr: 'شبكة الفضاء السحيق',            nameEn: 'Deep Space Network (DSN)',        altitude: 'الكواكب+',         examples: ['NASA DSN', 'Goldstone', 'مدريد', 'كانبيرا'] },
            { id: 'interplanetary',nameAr: 'شبكة ما بين الكواكب',          nameEn: 'Interplanetary Internet (DTN)',   altitude: 'كواكب',            examples: ['Bundle Protocol', 'Mars Relay Network'] },
            { id: 'gravitational', nameAr: 'شبكة التثاقل الكونية',          nameEn: 'Gravitational Network',          scale: 'كوني',                examples: ['شبكة المجرات', 'الشعيرات الكونية', 'الويب الكوني'] },
            { id: 'cosmic_web',   nameAr: 'الشبكة الكونية',                nameEn: 'Cosmic Web',                      scale: 'كوني',                examples: ['خيوط المجرات', 'الفراغات الكونية', 'مجموعات المجرات'] },
            { id: 'gnss',         nameAr: 'شبكة الملاحة الفضائية العالمية', nameEn: 'GNSS — Global Navigation Satellite System', accuracy: '< 10 سم', examples: ['GPS', 'Galileo', 'BeiDou', 'نظام الملاحة الحجازي المقترح'] },
        ],
        scales: ['مدار منخفض', 'مدار متوسط', 'مدار ثابت', 'بين الكواكب', 'بين النجوم', 'مجرّة', 'كوني'],
        metrics: ['altitude_km', 'orbital_period_min', 'coverage_%', 'latency_ms', 'bandwidth_gbps', 'revisit_time_h'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الحادي عشر: الشبكات الكمية
    // ══════════════════════════════════════════════════════
    quantum: {
        id: 'quantum',
        nameAr: 'الشبكات الكمية',
        nameEn: 'Quantum Networks',
        maqsad: 'AQL',
        quranRef: '﴿ وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا ﴾ — الإسراء ٨٥',
        icon: '⚛️',
        types: [
            { id: 'qkd',          nameAr: 'توزيع المفاتيح الكمية',          nameEn: 'QKD — Quantum Key Distribution',   protocol: 'BB84/E91',    examples: ['Toshiba QKD', 'ID Quantique', 'شبكة بكين-شنغهاي'] },
            { id: 'q_repeater',   nameAr: 'معيد الإرسال الكمي',             nameEn: 'Quantum Repeater Network',         scale: 'تجريبي',         examples: ['تشابك المحطات', 'تصحيح الأخطاء الكمية'] },
            { id: 'q_internet',   nameAr: 'إنترنت الكم',                    nameEn: 'Quantum Internet',                 scale: 'مستقبلي',        examples: ['QIA Europe', 'US NQIA', 'QuTech'] },
            { id: 'q_computing',  nameAr: 'شبكة الحوسبة الكمية السحابية',   nameEn: 'Quantum Cloud Network',            qubits: '50–1000+ كيوبت', examples: ['IBM Quantum', 'Google Quantum AI', 'IonQ', 'Rigetti'] },
            { id: 'q_sensing',    nameAr: 'شبكة الاستشعار الكمي',           nameEn: 'Quantum Sensing Network',          scale: 'تجريبي',         examples: ['VLBI كمي', 'ساعة ذرية كمية', 'استشعار جاذبية'] },
            { id: 'entanglement', nameAr: 'شبكة التشابك الكمي',             nameEn: 'Entanglement Distribution Network', scale: 'مختبر→مدينة',    examples: ['تشابك فوتوني', 'ذاكرة كمية', 'تجربة دلفت'] },
        ],
        scales: ['جهاز واحد', 'مختبر', 'مبنى', 'مدينة', 'وطني', 'عالمي', 'مستقبلي'],
        metrics: ['qubits_count', 'fidelity_%', 'coherence_time_ms', 'entanglement_rate_Hz', 'quantum_volume', 'error_rate_%'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثاني عشر: شبكات المياه والبيئة
    // ══════════════════════════════════════════════════════
    water_environment: {
        id: 'water_environment',
        nameAr: 'شبكات المياه والبيئة',
        nameEn: 'Water & Environmental Networks',
        maqsad: 'NAFS',
        quranRef: '﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ — الأنبياء ٣٠',
        icon: '💧',
        types: [
            { id: 'drinking_water',  nameAr: 'شبكة مياه الشرب',            nameEn: 'Drinking Water Network',         scale: 'مدينة/وطني',     examples: ['شبكة مياه الرياض', 'البنية التحتية للتحلية'] },
            { id: 'irrigation',      nameAr: 'شبكة الري الزراعي',           nameEn: 'Irrigation Network',             scale: 'حقل→إقليمي',     examples: ['ري بالتنقيط', 'قنوات الري', 'الأفلاج'] },
            { id: 'sewage',          nameAr: 'شبكة الصرف الصحي',            nameEn: 'Sewage / Wastewater Network',    scale: 'مدينة',          examples: ['شبكة مجاري', 'معالجة المياه', 'إعادة الاستخدام'] },
            { id: 'watershed',       nameAr: 'شبكة أحواض التصريف',          nameEn: 'Watershed / River Network',      scale: 'حوض نهر',        examples: ['نهر النيل', 'نهر الأمازون', 'حوض الخليج'] },
            { id: 'flood_control',   nameAr: 'شبكة التحكم بالفيضانات',      nameEn: 'Flood Control Network',          scale: 'مدينة/إقليمي',   examples: ['سدود', 'قنوات تحويل', 'حواجز مد'] },
            { id: 'desal_net',       nameAr: 'شبكة محطات التحلية',           nameEn: 'Desalination Network',           scale: 'إقليمي',         examples: ['أرامكو', 'SWCC', 'NEOM', 'Marafiq'] },
            { id: 'air_quality_net', nameAr: 'شبكة جودة الهواء',             nameEn: 'Air Quality Monitoring Network', scale: 'مدينة/وطني',     examples: ['AQI Sensors', 'IQAir', 'شبكة رصد البيئة'] },
            { id: 'climate_obs',     nameAr: 'شبكة الرصد المناخي',           nameEn: 'Climate Observation Network',    scale: 'عالمي',          examples: ['GCOS', 'WMO', 'محطات أرصاد', 'Argo Floats'] },
        ],
        scales: ['مبنى', 'حي', 'مدينة', 'حوض', 'وطني', 'قاري', 'عالمي'],
        metrics: ['flow_rate_m3_s', 'pressure_bar', 'water_quality_index', 'coverage_%', 'loss_%', 'energy_kwh_m3'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثالث عشر: شبكات المعرفة والابتكار
    // ══════════════════════════════════════════════════════
    knowledge_innovation: {
        id: 'knowledge_innovation',
        nameAr: 'شبكات المعرفة والابتكار',
        nameEn: 'Knowledge & Innovation Networks',
        maqsad: 'AQL',
        quranRef: '﴿ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ﴾ — الزمر ٩',
        icon: '📚',
        types: [
            { id: 'citation_net',   nameAr: 'شبكة الاستشهادات العلمية',   nameEn: 'Scientific Citation Network',      scale: 'عالمي',           examples: ['Web of Science', 'Scopus', 'Google Scholar', 'Semantic Scholar'] },
            { id: 'knowledge_graph',nameAr: 'رسم المعرفة',                nameEn: 'Knowledge Graph',                  scale: 'عالمي',           examples: ['Wikidata', 'Google KG', 'DBpedia', 'شيخة-كوزموس'] },
            { id: 'innovation_net', nameAr: 'شبكة الابتكار والبراءات',     nameEn: 'Innovation & Patent Network',      scale: 'وطني/دولي',       examples: ['USPTO', 'EPO', 'WIPO', 'SAIP (سعودي)'] },
            { id: 'collab_net',     nameAr: 'شبكة التعاون البحثي',          nameEn: 'Research Collaboration Network',   scale: 'عالمي',           examples: ['CERN', 'مشاريع هـ2030', 'نيوم البحثي'] },
            { id: 'edu_net',        nameAr: 'شبكة التعليم الرقمي',          nameEn: 'Digital Education Network',        scale: 'عالمي',           examples: ['Coursera', 'edX', 'منصة مدرستي', 'نور'] },
            { id: 'open_source',    nameAr: 'شبكة المصادر المفتوحة',        nameEn: 'Open Source Network',              scale: 'عالمي',           examples: ['GitHub', 'GitLab', 'npm', 'PyPI'] },
            { id: 'media_net',      nameAr: 'شبكة الإعلام والمحتوى',        nameEn: 'Media & Content Network',          scale: 'عالمي',           examples: ['YouTube', 'Podcast', 'الكتب الرقمية', 'المخطوطات'] },
            { id: 'fatwa_net',      nameAr: 'شبكة الفتاوى والعلم الشرعي',  nameEn: 'Islamic Knowledge & Fatwa Network', scale: 'عالمي',          examples: ['هيئة كبار العلماء', 'IslamQA', 'شبكة الألوكة', 'شيخة-شريعة'] },
        ],
        scales: ['مقالة', 'مجال', 'مؤسسة', 'وطني', 'قاري', 'عالمي'],
        metrics: ['nodes_papers', 'edges_citations', 'h_index', 'impact_factor', 'open_access_%', 'collaboration_index'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الرابع عشر: الشبكات الصحية والطبية
    // ══════════════════════════════════════════════════════
    health_medical: {
        id: 'health_medical',
        nameAr: 'الشبكات الصحية والطبية',
        nameEn: 'Health & Medical Networks',
        maqsad: 'NAFS',
        quranRef: '﴿ وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ ﴾ — الشعراء ٨٠',
        icon: '🏥',
        types: [
            { id: 'hospital_net', nameAr: 'شبكة المستشفيات',              nameEn: 'Hospital Network',                scale: 'وطني',     examples: ['وزارة الصحة', 'HL7 FHIR', 'مستشفى ذكي'] },
            { id: 'epidemic_net', nameAr: 'شبكة انتشار الأوبئة',           nameEn: 'Epidemic Spread Network',         scale: 'عالمي',    examples: ['WHO GOARN', 'ProMED', 'نمذجة SIR/SEIR'] },
            { id: 'drug_net',     nameAr: 'شبكة اكتشاف الدواء',            nameEn: 'Drug Discovery Network',          scale: 'بحثي',     examples: ['AlphaFold', 'Drug-Target Interaction', 'أهداف علاجية جديدة'] },
            { id: 'genomic_net',  nameAr: 'شبكة الجينوم',                  nameEn: 'Genomic / Bioinformatics Network', scale: 'عالمي',    examples: ['1000 Genomes', 'NCBI', 'Ensembl', 'AlphaFold DB'] },
            { id: 'telemedicine', nameAr: 'شبكة الطب عن بُعد',             nameEn: 'Telemedicine Network',            scale: 'وطني',     examples: ['Seha', 'Babylon', 'شيخة-الصحة'] },
            { id: 'wearable_net', nameAr: 'شبكة الأجهزة الصحية الذكية',   nameEn: 'Wearable Health Network',         scale: 'شخصي',     examples: ['Apple Watch', 'Oura', 'Fitbit', 'ضغط ذكي'] },
        ],
        scales: ['خلية', 'شخص', 'عائلة', 'مستشفى', 'مدينة', 'وطني', 'عالمي'],
        metrics: ['beds_count', 'infection_rate', 'mortality_rate', 'vaccination_%', 'bed_occupancy_%', 'DALY'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الخامس عشر: الشبكات الأمنية والدفاعية
    // ══════════════════════════════════════════════════════
    security_defense: {
        id: 'security_defense',
        nameAr: 'الشبكات الأمنية والدفاعية',
        nameEn: 'Security & Defense Networks',
        maqsad: 'NAFS',
        quranRef: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال ٦٠',
        icon: '🛡️',
        types: [
            { id: 'cybersec_net',  nameAr: 'شبكة الأمن السيبراني',         nameEn: 'Cybersecurity Network',           scale: 'وطني/عالمي',  examples: ['SIEM', 'SOC', 'NCA', 'CERT', 'Threat Intel'] },
            { id: 'military_net',  nameAr: 'الشبكة العسكرية المشتركة',      nameEn: 'Military / Tactical Network',     scale: 'وطني',        examples: ['JTRS', 'Link-16', 'شبكة الأوامر والتحكم'] },
            { id: 'border_net',    nameAr: 'شبكة مراقبة الحدود',            nameEn: 'Border Surveillance Network',     scale: 'وطني',        examples: ['رادارات', 'كاميرات حدودية', 'استشعار ذكي'] },
            { id: 'emergency_net', nameAr: 'شبكة الطوارئ والكوارث',          nameEn: 'Emergency & Disaster Network',    scale: 'وطني',        examples: ['LTE-FirstNet', 'TETRA', 'هلال أحمر'] },
            { id: 'law_net',       nameAr: 'شبكة إنفاذ القانون',             nameEn: 'Law Enforcement Network',         scale: 'وطني',        examples: ['Interpol', 'نظام ابشر', 'شبكة المحاكم'] },
        ],
        scales: ['جهاز', 'وحدة', 'مدينة', 'وطني', 'قاري', 'عالمي'],
        metrics: ['coverage_%', 'response_time_s', 'encrypted', 'resilience_score', 'threat_detection_rate_%'],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. محرك التكامل والابتكار النافع — INTEGRATION & INNOVATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * مبادئ التكامل بين أنواع الشبكات
 * كل شبكة يمكن أن تتكامل مع غيرها لتنتج قيمة أعلى
 */
const INTEGRATION_MATRIX = [
    { from: 'digital_computer',    to: 'financial_economic',    synergy: 'FinTech + DeFi الحلال',           benefit: 'مدفوعات فورية، زكاة تلقائية، صكوك رقمية' },
    { from: 'artificial_neural',   to: 'financial_economic',    synergy: 'AI-Finance Halal',                 benefit: 'كشف الربا، توصيات استثمار حلال، تسعير ذكي' },
    { from: 'artificial_neural',   to: 'biological',            synergy: 'NeuroAI',                          benefit: 'اكتشاف أدوية، فهم الدماغ، تطوير لقاحات' },
    { from: 'telecommunications',  to: 'transportation',        synergy: 'C-V2X Connected Vehicles',         benefit: 'سيارات ذاتية القيادة، مرور ذكي، طرق آمنة' },
    { from: 'energy_power',        to: 'digital_computer',      synergy: 'Green Computing',                  benefit: 'مراكز بيانات تعمل بالطاقة الشمسية' },
    { from: 'knowledge_innovation',to: 'social_human',          synergy: 'Open Knowledge Societies',         benefit: 'نشر العلم الحلال، تعليم رقمي للجميع' },
    { from: 'water_environment',   to: 'artificial_neural',     synergy: 'AI for Water Stewardship',         benefit: 'الكشف عن تسريبات، تحسين الري، رصد التلوث' },
    { from: 'space_cosmic',        to: 'digital_computer',      synergy: 'Space-based Internet',             benefit: 'إنترنت عالمي للمناطق النائية، مناطق الحج' },
    { from: 'quantum',             to: 'financial_economic',    synergy: 'Quantum Finance',                  benefit: 'تشفير كمي للمعاملات، حماية الأصول الرقمية' },
    { from: 'biological',         to: 'knowledge_innovation',   synergy: 'Bioinformatics + AI',              benefit: 'طب دقيق، جينوميات إسلامية، اكتشاف حلال' },
    { from: 'transportation',      to: 'financial_economic',    synergy: 'Smart Logistics + Halal Payments',  benefit: 'تتبع البضائع الحلال، فواتير ذكية، زكاة الأرباح' },
    { from: 'health_medical',      to: 'artificial_neural',     synergy: 'AI Healthcare Halal',              benefit: 'تشخيص طبي بالذكاء، رعاية المسنين، تطوير دواء حلال' },
    { from: 'security_defense',    to: 'digital_computer',      synergy: 'Zero Trust Security',              benefit: 'حماية البنية التحتية الحيوية من الهجمات' },
    { from: 'digital_computer',    to: 'water_environment',     synergy: 'Smart Cities + IoT Water',         benefit: 'إدارة موارد المياه بالذكاء الاصطناعي' },
    { from: 'social_human',        to: 'knowledge_innovation',  synergy: 'Collaborative Intelligence',       benefit: 'مجتمعات إسلامية رقمية، نشر الإسلام بالحكمة' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. مقاييس الشبكات الكونية — UNIVERSAL NETWORK METRICS
// ═══════════════════════════════════════════════════════════════════════════════

const NETWORK_GRAPH_METRICS = {
    structural: [
        { id: 'degree_centrality',       nameAr: 'مركزية الدرجة',              formula: 'k_i / (N-1)',                 use: 'قياس أهمية عقدة' },
        { id: 'betweenness_centrality',  nameAr: 'مركزية التوسط',              formula: 'Σ σ_st(i) / σ_st',           use: 'قياس تأثير العقدة على التدفق' },
        { id: 'closeness_centrality',    nameAr: 'مركزية القرب',               formula: '(N-1) / Σ d(i,j)',            use: 'قياس سهولة الوصول' },
        { id: 'eigenvector_centrality',  nameAr: 'مركزية القيمة الذاتية',       formula: 'Ax = λx',                    use: 'قياس الأهمية من المحيط' },
        { id: 'pagerank',                nameAr: 'تقييم الصفحة/العقدة',         formula: 'PR(u) = Σ PR(v)/L(v)',        use: 'Google PageRank + ترتيب الشبكات' },
        { id: 'clustering_coefficient',  nameAr: 'معامل التجمّع',              formula: '2e_i / k_i(k_i-1)',           use: 'قياس تجمّع المجاورين' },
        { id: 'avg_path_length',         nameAr: 'متوسط طول المسار',            formula: 'Σ d(i,j) / N(N-1)',          use: 'قياس فاعلية الشبكة' },
        { id: 'diameter',               nameAr: 'قطر الشبكة',                  formula: 'max d(i,j)',                  use: 'أقصى مسار بين عقدتين' },
        { id: 'modularity',             nameAr: 'المعيارية (المجتمعات)',          formula: 'Q = Σ [A_ij - k_ik_j/2m]',  use: 'كشف التجمعات والمجتمعات' },
        { id: 'assortativity',          nameAr: 'التماثل',                     formula: 'Pearson(k_i, k_j)',           use: 'هل ترتبط العقد بمشابهاتها؟' },
        { id: 'resilience',             nameAr: 'مرونة الشبكة',               formula: 'R = 1 - F_c',                 use: 'قياس الصمود أمام الإزالات' },
        { id: 'small_world',            nameAr: 'خاصية العالم الصغير',          formula: 'σ = (C/C_rand) / (L/L_rand)', use: 'هل الشبكة من نوع Watts-Strogatz؟' },
        { id: 'scale_free',             nameAr: 'خاصية الشبكة الحرة المقياس',   formula: 'P(k) ∝ k^(-γ)',              use: 'توزيع الدرجات طاقياً (Barabási-Albert)' },
        { id: 'entropy',                nameAr: 'إنتروبيا الشبكة',             formula: 'H = -Σ p_i log p_i',          use: 'قياس التنوع والتعقيد' },
    ],
    topologies: [
        { id: 'star',         nameAr: 'نجمة',           nameEn: 'Star',          advantages: 'سهولة الإدارة',   disadvantages: 'نقطة فشل واحدة' },
        { id: 'ring',         nameAr: 'حلقة',           nameEn: 'Ring',          advantages: 'انتقال منتظم',    disadvantages: 'عطل يؤثر على الكل' },
        { id: 'bus',          nameAr: 'حافلة',          nameEn: 'Bus',           advantages: 'بسيطة وزهيدة',   disadvantages: 'ازدحام + عطل محوري' },
        { id: 'mesh',         nameAr: 'شبكية',          nameEn: 'Mesh',          advantages: 'مرونة عالية',     disadvantages: 'تكلفة الأسلاك' },
        { id: 'tree',         nameAr: 'شجرية',          nameEn: 'Tree',          advantages: 'تدرج هرمي',       disadvantages: 'اعتماد على الجذر' },
        { id: 'hybrid',       nameAr: 'هجينة',          nameEn: 'Hybrid',        advantages: 'مرونة تصميمية',   disadvantages: 'تعقيد' },
        { id: 'random',       nameAr: 'عشوائية',         nameEn: 'Random (ER)',   advantages: 'نموذج أولي',      disadvantages: 'غير واقعية تماماً' },
        { id: 'scale_free_t', nameAr: 'حرة المقياس',    nameEn: 'Scale-Free (BA)',advantages: 'تشابه الواقع',   disadvantages: 'عقد محورية حساسة' },
        { id: 'small_world_t',nameAr: 'العالم الصغير',  nameEn: 'Small-World (WS)',advantages: 'مسارات قصيرة', disadvantages: 'هشاشة انتقال' },
        { id: 'lattice',      nameAr: 'شبكية منتظمة',   nameEn: 'Lattice / Grid',advantages: 'منتظمة ومحلية',  disadvantages: 'مسارات طويلة' },
        { id: 'hypercube',    nameAr: 'مكعب فائق',      nameEn: 'Hypercube',     advantages: 'ديناميكية عالية', disadvantages: 'تعقيد توصيل' },
        { id: 'complete',     nameAr: 'متكاملة',         nameEn: 'Complete (K_n)',advantages: 'قصوى الاتصال',   disadvantages: 'تكلفة O(n²)' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. فئات الشبكة المُدرَّبة عصبياً — NEURAL-CLASSIFIED NETWORK FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ميزات يستخرجها المحرك العصبي من وصف أي شبكة
 * تُستخدم لتصنيف الشبكة تلقائياً إلى الجنس والنوع المناسب
 */
const FEATURE_KEYWORDS = {
    digital_computer:    ['LAN', 'WAN', 'IP', 'router', 'switch', 'packet', 'شبكة محلية', 'إنترنت', 'WiFi', 'ethernet', 'protocol', 'TCP', 'UDP', 'IoT', 'VPN'],
    telecommunications: ['GSM', '5G', '4G', 'LTE', 'cellular', 'satellite', 'radio', 'اتصال', 'جوال', 'هاتف', 'spectrum', 'MHz', 'GHz', 'tower', 'basestation'],
    artificial_neural:   ['neural', 'learning', 'training', 'layers', 'CNN', 'RNN', 'LSTM', 'transformer', 'weights', 'activation', 'backprop', 'شبكة عصبية', 'ذكاء', 'تعلم آلة'],
    biological:          ['neuron', 'protein', 'gene', 'metabolic', 'cell', 'brain', 'DNA', 'RNA', 'ecosystem', 'food web', 'خلية', 'جين', 'دماغ', 'بيولوجي'],
    energy_power:        ['electricity', 'grid', 'voltage', 'power', 'solar', 'wind', 'kV', 'MW', 'GW', 'كهرباء', 'طاقة', 'شبكة كهربائية', 'طاقة شمسية', 'تيار'],
    transportation:      ['road', 'rail', 'aviation', 'ship', 'port', 'highway', 'metro', 'طريق', 'سكة', 'مطار', 'ميناء', 'نقل', 'logistics', 'شحن'],
    social_human:        ['social', 'friendship', 'community', 'influence', 'اجتماعي', 'مجتمع', 'علاقة', 'تواصل', 'صداقة', 'قبيلة', 'أمة'],
    financial_economic:  ['bank', 'payment', 'trade', 'finance', 'مال', 'بنك', 'تجارة', 'مدفوعات', 'ربح', 'زكاة', 'حلال', 'بلوكشين', 'عملة'],
    space_cosmic:        ['satellite', 'orbit', 'space', 'GPS', 'فضاء', 'قمر', 'نجم', 'مدار', 'كوكب', 'مجرة', 'كون', 'cosmic', 'celestial'],
    quantum:             ['quantum', 'qubit', 'entanglement', 'QKD', 'كم', 'كيوبت', 'تشابك', 'ميكانيكا الكم', 'فوتون', 'superposition'],
    water_environment:   ['water', 'irrigation', 'sewage', 'river', 'climate', 'ماء', 'مياه', 'ري', 'صرف', 'بيئة', 'طقس', 'مناخ', 'نهر'],
    knowledge_innovation:['research', 'citation', 'patent', 'innovation', 'education', 'علم', 'معرفة', 'بحث', 'براءة', 'ابتكار', 'تعليم', 'نشر'],
    health_medical:      ['hospital', 'disease', 'drug', 'medical', 'health', 'مستشفى', 'مرض', 'دواء', 'صحة', 'طب', 'لقاح', 'علاج'],
    security_defense:    ['security', 'defense', 'military', 'cyber', 'firewall', 'أمن', 'دفاع', 'عسكري', 'سيبراني', 'حماية', 'هجوم'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. الشبكة العصبية الكونية الشاملة — MAIN ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaUniversalNetworksNeuralEngine {

    constructor() {
        this.name      = 'المحرك العصبي الكوني الشامل — شيخة';
        this.version   = '2.0.0';
        this.startedAt = new Date().toISOString();
        this.tawheed   = 'لا إله إلا الله';

        // تهيئة الشبكة العصبية الحقيقية إذا توفّرت
        this._initNeuralBrain();

        // فهرسة سريعة لكل الأنواع
        this._buildTypeIndex();

        console.log(`[UNIVERSAL-NETWORKS] ✅ ${this.name} — جاهز`);
        console.log(`[UNIVERSAL-NETWORKS] 📊 أجناس الشبكات: ${Object.keys(UNIVERSAL_NETWORK_TAXONOMY).length}`);
        console.log(`[UNIVERSAL-NETWORKS] 🔢 إجمالي الأنواع: ${this._totalTypes()}`);
    }

    // ─── تهيئة الدماغ العصبي ──────────────────────────────────────────────────

    _initNeuralBrain() {
        if (!SheikhaNeural) {
            this.neural = null;
            return;
        }
        try {
            this.neural = new SheikhaNeural({
                vocabSize:    2000,
                embeddingDim: 64,
                hiddenSizes:  [256, 128, 64],
                outputSize:   Object.keys(UNIVERSAL_NETWORK_TAXONOMY).length,
                learningRate: 0.001,
            });
            // تدريب سريع على مفردات الشبكات باستخدام word2vec المدمج
            const corpus = this._buildNetworkCorpus();
            if (this.neural.word2vec && typeof this.neural.word2vec.train === 'function') {
                this.neural.word2vec.train(corpus, { epochs: 3, verbose: false });
            }
            console.log('[UNIVERSAL-NETWORKS] 🧠 الشبكة العصبية مُهيَّأة ومُدرَّبة على مفردات الشبكات');
        } catch (err) {
            console.warn('[UNIVERSAL-NETWORKS] ⚠️ تعذّر تهيئة الشبكة العصبية:', err.message);
            this.neural = null;
        }
    }

    _buildNetworkCorpus() {
        const sentences = [];
        for (const [genus, data] of Object.entries(UNIVERSAL_NETWORK_TAXONOMY)) {
            for (const type of data.types) {
                const words = [
                    genus,
                    data.nameAr, data.nameEn,
                    type.id, type.nameAr, type.nameEn,
                    ...(type.examples || []),
                ].join(' ').toLowerCase().replace(/[^a-zأ-ي0-9\s]/g, ' ');
                sentences.push(words);
            }
        }
        // إضافة مفردات المقاييس
        for (const metric of NETWORK_GRAPH_METRICS.structural) {
            sentences.push(`${metric.id} ${metric.nameAr} ${metric.formula} ${metric.use}`.toLowerCase());
        }
        return sentences;
    }

    // ─── فهرسة الأنواع ────────────────────────────────────────────────────────

    _buildTypeIndex() {
        this._typeIndex = new Map(); // typeId → { genus, type }
        for (const [genusId, genus] of Object.entries(UNIVERSAL_NETWORK_TAXONOMY)) {
            for (const type of genus.types) {
                this._typeIndex.set(type.id, { genusId, genus, type });
            }
        }
    }

    _totalTypes() {
        let n = 0;
        for (const g of Object.values(UNIVERSAL_NETWORK_TAXONOMY)) n += g.types.length;
        return n;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الواجهة الرئيسية — handle(req)
    // يُستدعى من الموجّه العصبي لمعالجة أي طلب
    // ═══════════════════════════════════════════════════════════════════════════

    async handle(req) {
        const { intent = '', data = {} } = req || {};

        // تصنيف نوع الطلب
        if (intent.startsWith('network.classify') || data.text || data.query) {
            return this.classifyNetwork(data.text || data.query || intent);
        }

        if (intent.startsWith('network.list') || intent === 'network') {
            const genus = data.genus || null;
            return this.listNetworks(genus);
        }

        if (intent.startsWith('network.metrics')) {
            return this.getMetrics(data.type || null);
        }

        if (intent.startsWith('network.integration') || intent === 'integration') {
            return this.getIntegrations(data.from || null, data.to || null);
        }

        if (intent.startsWith('network.topology')) {
            return this.getTopologies();
        }

        if (intent.startsWith('network.type') && data.id) {
            return this.getTypeById(data.id);
        }

        if (intent.startsWith('network.status') || intent === 'network.info') {
            return this.status();
        }

        // افتراضي: إعطاء ملخص شامل
        return this.status();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // تصنيف الشبكة — يستقبل وصفاً ويُرجع الجنس والنوع والمقاييس
    // ═══════════════════════════════════════════════════════════════════════════

    classifyNetwork(text) {
        if (!text) return { error: 'يرجى تقديم وصف للشبكة', hint: 'مثال: "شبكة LAN في مكتب" أو "شبكة عصبية CNN"' };

        const normalizedText = String(text).toLowerCase();
        const scores = {};

        // ① تصنيف بالكلمات المفتاحية
        for (const [genusId, keywords] of Object.entries(FEATURE_KEYWORDS)) {
            scores[genusId] = 0;
            for (const kw of keywords) {
                if (normalizedText.includes(kw.toLowerCase())) {
                    scores[genusId] += 1;
                }
            }
        }

        // ② تحسين بالشبكة العصبية (إذا توفّرت)
        let neuralScores = null;
        if (this.neural) {
            try {
                const w2v = this.neural.word2vec;
                const vec = (w2v && typeof w2v.getSentenceVector === 'function')
                    ? w2v.getSentenceVector(normalizedText)
                    : null;

                if (vec) {
                    const genusIds = Object.keys(UNIVERSAL_NETWORK_TAXONOMY);
                    const genusVecs = genusIds.map(id => {
                        const data = UNIVERSAL_NETWORK_TAXONOMY[id];
                        return w2v.getSentenceVector(
                            `${data.nameAr} ${data.nameEn} ${id}`
                        );
                    });

                    neuralScores = {};
                    for (let i = 0; i < genusIds.length; i++) {
                        const sim = this._cosineSimilarity(vec, genusVecs[i]);
                        neuralScores[genusIds[i]] = sim;
                        // دمج مع درجة الكلمات المفتاحية
                        scores[genusIds[i]] = (scores[genusIds[i]] || 0) * 0.6 + sim * 10 * 0.4;
                    }
                }
            } catch (_) { /* التراجع إلى التصنيف بالكلمات المفتاحية */ }
        }

        // ③ اختيار أفضل جنس
        const sortedGenera = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .filter(([, s]) => s > 0);

        if (sortedGenera.length === 0) {
            return {
                classified: false,
                message: 'لم يُتعرَّف على نوع الشبكة — حاول وصفاً أدق',
                hint: 'أمثلة: LAN، WiFi، 5G، شبكة عصبية CNN، شبكة كهربائية، شبكة اجتماعية',
            };
        }

        const topGenusId = sortedGenera[0][0];
        const topGenus   = UNIVERSAL_NETWORK_TAXONOMY[topGenusId];

        // ④ البحث عن أنسب نوع داخل الجنس
        let bestType = null;
        let bestTypeScore = -1;
        for (const type of topGenus.types) {
            let typeScore = 0;
            const typeText = `${type.id} ${type.nameAr} ${type.nameEn} ${(type.examples || []).join(' ')}`.toLowerCase();
            for (const word of normalizedText.split(/\s+/)) {
                if (word.length > 2 && typeText.includes(word)) typeScore++;
            }
            if (typeScore > bestTypeScore) {
                bestTypeScore = typeScore;
                bestType = type;
            }
        }

        return {
            classified: true,
            input: text,
            genus: {
                id:     topGenusId,
                nameAr: topGenus.nameAr,
                nameEn: topGenus.nameEn,
                icon:   topGenus.icon,
                maqsad: topGenus.maqsad,
                quranRef: topGenus.quranRef,
            },
            type: bestType || topGenus.types[0],
            scores: sortedGenera.slice(0, 5).map(([id, score]) => ({
                genusId: id,
                nameAr:  UNIVERSAL_NETWORK_TAXONOMY[id].nameAr,
                score:   Math.round(score * 100) / 100,
            })),
            metrics: topGenus.metrics,
            scales:  topGenus.scales,
            neuralEnhanced: !!neuralScores,
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // قائمة الشبكات — listNetworks
    // ═══════════════════════════════════════════════════════════════════════════

    listNetworks(genusId = null) {
        if (genusId) {
            const genus = UNIVERSAL_NETWORK_TAXONOMY[genusId];
            if (!genus) return { error: `جنس غير موجود: ${genusId}`, available: Object.keys(UNIVERSAL_NETWORK_TAXONOMY) };
            return {
                genus,
                types: genus.types,
                metrics: genus.metrics,
                scales:  genus.scales,
                totalTypes: genus.types.length,
            };
        }

        const summary = {};
        for (const [id, genus] of Object.entries(UNIVERSAL_NETWORK_TAXONOMY)) {
            summary[id] = {
                id,
                nameAr:     genus.nameAr,
                nameEn:     genus.nameEn,
                icon:       genus.icon,
                maqsad:     genus.maqsad,
                typesCount: genus.types.length,
                quranRef:   genus.quranRef,
            };
        }

        return {
            totalGenera: Object.keys(UNIVERSAL_NETWORK_TAXONOMY).length,
            totalTypes:  this._totalTypes(),
            genera:      summary,
            tawheed:     this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // المقاييس — getMetrics
    // ═══════════════════════════════════════════════════════════════════════════

    getMetrics(typeFilter = null) {
        if (typeFilter) {
            const entry = this._typeIndex.get(typeFilter);
            if (entry) {
                return {
                    typeId:  typeFilter,
                    genus:   entry.genusId,
                    metrics: entry.genus.metrics,
                    scales:  entry.genus.scales,
                };
            }
        }
        return {
            graphMetrics: NETWORK_GRAPH_METRICS.structural,
            topologies:   NETWORK_GRAPH_METRICS.topologies,
            total: {
                structuralMetrics: NETWORK_GRAPH_METRICS.structural.length,
                topologies:        NETWORK_GRAPH_METRICS.topologies.length,
            },
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // التكامل — getIntegrations
    // ═══════════════════════════════════════════════════════════════════════════

    getIntegrations(fromGenus = null, toGenus = null) {
        let results = INTEGRATION_MATRIX;
        if (fromGenus) results = results.filter(r => r.from === fromGenus || r.to === fromGenus);
        if (toGenus)   results = results.filter(r => r.from === toGenus || r.to === toGenus);
        return {
            integrations:  results,
            totalPairs:    INTEGRATION_MATRIX.length,
            message:       'التكامل بين الشبكات يولّد ابتكاراً نافعاً — "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ"',
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // التوبولوجيات — getTopologies
    // ═══════════════════════════════════════════════════════════════════════════

    getTopologies() {
        return {
            topologies:    NETWORK_GRAPH_METRICS.topologies,
            graphMetrics:  NETWORK_GRAPH_METRICS.structural,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // جلب نوع بالمعرّف — getTypeById
    // ═══════════════════════════════════════════════════════════════════════════

    getTypeById(typeId) {
        const entry = this._typeIndex.get(typeId);
        if (!entry) return { error: `النوع غير موجود: ${typeId}` };
        return {
            typeId,
            genus:   entry.genus.nameAr,
            genusId: entry.genusId,
            type:    entry.type,
            metrics: entry.genus.metrics,
            scales:  entry.genus.scales,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // حالة المحرك — status
    // ═══════════════════════════════════════════════════════════════════════════

    status() {
        return {
            name:           this.name,
            version:        this.version,
            startedAt:      this.startedAt,
            tawheed:        this.tawheed,
            quranRef:       '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة ٣١',
            totalGenera:    Object.keys(UNIVERSAL_NETWORK_TAXONOMY).length,
            totalTypes:     this._totalTypes(),
            totalIntegrations: INTEGRATION_MATRIX.length,
            totalMetrics:   NETWORK_GRAPH_METRICS.structural.length,
            totalTopologies: NETWORK_GRAPH_METRICS.topologies.length,
            neuralEnabled:  !!this.neural,
            genera: Object.entries(UNIVERSAL_NETWORK_TAXONOMY).map(([id, g]) => ({
                id, nameAr: g.nameAr, nameEn: g.nameEn, icon: g.icon,
                types: g.types.length, maqsad: g.maqsad,
            })),
            capabilities: [
                'تصنيف أي شبكة تلقائياً بالذكاء الاصطناعي',
                'قائمة شاملة بكل أجناس الشبكات وأنواعها',
                'مقاييس رياضية لتحليل الشبكات (مركزية، تجمع، مرونة...)',
                'جدول التكامل والابتكار بين الأجناس',
                'شريعة إسلامية مرجعية لكل نوع',
                'دعم عربي وإنجليزي كامل',
            ],
        };
    }

    // ─── دوال مساعدة ─────────────────────────────────────────────────────────

    _cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na  += a[i] * a[i];
            nb  += b[i] * b[i];
        }
        const denom = Math.sqrt(na) * Math.sqrt(nb);
        return denom === 0 ? 0 : dot / denom;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

const engine = new SheikhaUniversalNetworksNeuralEngine();

module.exports = {
    engine,
    SheikhaUniversalNetworksNeuralEngine,
    UNIVERSAL_NETWORK_TAXONOMY,
    INTEGRATION_MATRIX,
    NETWORK_GRAPH_METRICS,
    FEATURE_KEYWORDS,
};
