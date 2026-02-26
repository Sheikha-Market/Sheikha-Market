/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA NETWORKS ENGINE — منظومة الشبكات والاتصالات والطاقة الذكية
 * شبكات الحاسب | الاتصالات | الإنترنت | الجوال | الكهرباء | الطاقة
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات ١٣
 * "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ" — النور ٣٥
 * "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ" — الأنبياء ٣٠
 * "وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ وَالنُّجُومُ مُسَخَّرَاتٌ بِأَمْرِهِ" — النحل ١٢
 *
 * ✅ منظومة شبكات الحاسب — كل أنواع الشبكات (LAN, WAN, MAN, PAN, SAN, VPN, SDN, IoT)
 * ✅ منظومة الاتصالات — الهاتف الثابت والنقال والأقمار الصناعية
 * ✅ منظومة الإنترنت — البنية التحتية والبروتوكولات والخدمات
 * ✅ منظومة الجوال — أجيال الاتصال من 1G إلى 6G
 * ✅ منظومة الكهرباء — التوليد والنقل والتوزيع والشبكات الذكية
 * ✅ منظومة الطاقة — المتجددة والتقليدية والنووية والهيدروجين
 * ✅ منظومة المفاتيح الرقمية — Token, API Key, Webhook, VPS, SSH, SSL/TLS, HTTP, OAuth
 * ✅ الأمن السيبراني — حماية الشبكات والبيانات بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaNetworksEngine {
    constructor() {
        this.name = 'منظومة الشبكات والاتصالات والطاقة — شيخة';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.quranReferences = this._initQuranReferences();
        this.computerNetworks = this._initComputerNetworks();
        this.telecom = this._initTelecom();
        this.internet = this._initInternet();
        this.mobile = this._initMobile();
        this.electricity = this._initElectricity();
        this.energy = this._initEnergy();
        this.digitalKeys = this._initDigitalKeys();
        this.protocols = this._initProtocols();
        this.cyberSecurity = this._initCyberSecurity();
        this.shariaGuidance = this._initShariaGuidance();
    }

    // ══════════════════════════════════════════════════════════
    // الآيات القرآنية المرتبطة بالاتصال والنور والطاقة
    // ══════════════════════════════════════════════════════════
    _initQuranReferences() {
        return [
            { id: 'taaaruf', surah: 'الحجرات', ayah: 13, text: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', context: 'التعارف أساس التواصل والاتصال بين البشر' },
            { id: 'noor', surah: 'النور', ayah: 35, text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ الْمِصْبَاحُ فِي زُجَاجَةٍ', context: 'النور والطاقة — أصل الكهرباء والاتصالات الضوئية' },
            { id: 'taskheer', surah: 'النحل', ayah: 12, text: 'وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ وَالنُّجُومُ مُسَخَّرَاتٌ بِأَمْرِهِ', context: 'تسخير مصادر الطاقة — الشمسية والرياح' },
            { id: 'ard-fasad', surah: 'الروم', ayah: 41, text: 'ظَهَرَ الْفَسَادُ فِي الْبَرِّ وَالْبَحْرِ بِمَا كَسَبَتْ أَيْدِي النَّاسِ', context: 'الحفاظ على البيئة في إنتاج الطاقة' },
            { id: 'mizan', surah: 'الرحمن', ayah: 7, text: 'وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ', context: 'التوازن في استهلاك الطاقة والموارد' },
            { id: 'tawasul', surah: 'العصر', ayah: 3, text: 'وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', context: 'التواصي والتواصل لنقل الحق' },
            { id: 'balagh', surah: 'المائدة', ayah: 67, text: 'يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ', context: 'البلاغ والتبليغ — أساس الاتصال الفعّال' },
            { id: 'hadeed', surah: 'الحديد', ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', context: 'الحديد — أساس البنية التحتية للشبكات والكهرباء' },
            { id: 'riyah', surah: 'الجاثية', ayah: 5, text: 'وَتَصْرِيفِ الرِّيَاحِ وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ', context: 'الرياح — مصدر طاقة متجدد مسخّر' },
            { id: 'maa', surah: 'الأنبياء', ayah: 30, text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ', context: 'الماء — الطاقة المائية والكهرومائية' },
        ];
    }

    // ══════════════════════════════════════════════════════════
    // شبكات الحاسب — Computer Networks
    // ══════════════════════════════════════════════════════════
    _initComputerNetworks() {
        return {
            nameAr: 'شبكات الحاسب', nameEn: 'Computer Networks',
            description: 'جميع أنواع شبكات الحاسب من المحلية إلى العالمية — البنية التحتية الرقمية للمنظومة',
            types: [
                { id: 'pan', nameAr: 'شبكة شخصية', nameEn: 'PAN — Personal Area Network', range: '< 10 م', examples: ['بلوتوث', 'NFC', 'USB', 'ZigBee'], icon: '📱' },
                { id: 'lan', nameAr: 'شبكة محلية', nameEn: 'LAN — Local Area Network', range: '< 1 كم', examples: ['إيثرنت', 'واي فاي', 'Token Ring'], icon: '🏢' },
                { id: 'man', nameAr: 'شبكة مدينية', nameEn: 'MAN — Metropolitan Area Network', range: '5-50 كم', examples: ['WiMAX', 'Metro Ethernet', 'DQDB'], icon: '🏙️' },
                { id: 'wan', nameAr: 'شبكة واسعة', nameEn: 'WAN — Wide Area Network', range: 'عالمي', examples: ['MPLS', 'Frame Relay', 'ATM', 'الإنترنت'], icon: '🌐' },
                { id: 'san', nameAr: 'شبكة تخزين', nameEn: 'SAN — Storage Area Network', range: 'مركز بيانات', examples: ['Fibre Channel', 'iSCSI', 'FCoE'], icon: '💾' },
                { id: 'wlan', nameAr: 'شبكة لاسلكية', nameEn: 'WLAN — Wireless LAN', range: '< 100 م', examples: ['WiFi 6', 'WiFi 6E', 'WiFi 7'], icon: '📶' },
                { id: 'vpn', nameAr: 'شبكة خاصة افتراضية', nameEn: 'VPN — Virtual Private Network', range: 'عالمي (عبر الإنترنت)', examples: ['OpenVPN', 'WireGuard', 'IPSec', 'L2TP'], icon: '🔒' },
                { id: 'sdn', nameAr: 'شبكة معرّفة برمجياً', nameEn: 'SDN — Software Defined Network', range: 'متغير', examples: ['OpenFlow', 'NSX', 'ACI'], icon: '🧠' },
                { id: 'cdn', nameAr: 'شبكة توصيل المحتوى', nameEn: 'CDN — Content Delivery Network', range: 'عالمي', examples: ['Cloudflare', 'Akamai', 'AWS CloudFront'], icon: '⚡' },
                { id: 'iot', nameAr: 'شبكة إنترنت الأشياء', nameEn: 'IoT Network', range: 'متغير', examples: ['LoRaWAN', 'Sigfox', 'NB-IoT', 'Thread', 'Matter'], icon: '🏠' },
                { id: 'mesh', nameAr: 'شبكة شبكية', nameEn: 'Mesh Network', range: 'متغير', examples: ['Zigbee Mesh', 'WiFi Mesh', 'Bluetooth Mesh'], icon: '🕸️' },
                { id: 'p2p', nameAr: 'شبكة نظير لنظير', nameEn: 'P2P — Peer-to-Peer', range: 'عالمي', examples: ['BitTorrent', 'IPFS', 'Blockchain P2P'], icon: '🔄' },
            ],
            topologies: [
                { nameAr: 'نجمية', nameEn: 'Star', description: 'كل جهاز متصل بمركز واحد (Hub/Switch)' },
                { nameAr: 'حلقية', nameEn: 'Ring', description: 'الأجهزة متصلة في حلقة دائرية' },
                { nameAr: 'ناقل', nameEn: 'Bus', description: 'جميع الأجهزة على خط واحد' },
                { nameAr: 'شبكية', nameEn: 'Mesh', description: 'كل جهاز متصل بعدة أجهزة أخرى' },
                { nameAr: 'شجرية', nameEn: 'Tree', description: 'هيكل هرمي متفرع' },
                { nameAr: 'هجينة', nameEn: 'Hybrid', description: 'مزيج من عدة طبولوجيات' },
            ],
            osiModel: [
                { layer: 7, nameAr: 'التطبيقات', nameEn: 'Application', protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH', 'SNMP'] },
                { layer: 6, nameAr: 'التقديم', nameEn: 'Presentation', protocols: ['SSL/TLS', 'JPEG', 'GIF', 'MPEG', 'ASCII'] },
                { layer: 5, nameAr: 'الجلسة', nameEn: 'Session', protocols: ['NetBIOS', 'RPC', 'PPTP'] },
                { layer: 4, nameAr: 'النقل', nameEn: 'Transport', protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'] },
                { layer: 3, nameAr: 'الشبكة', nameEn: 'Network', protocols: ['IP', 'ICMP', 'ARP', 'OSPF', 'BGP', 'IPSec'] },
                { layer: 2, nameAr: 'ربط البيانات', nameEn: 'Data Link', protocols: ['Ethernet', 'WiFi (802.11)', 'PPP', 'VLAN'] },
                { layer: 1, nameAr: 'الفيزيائية', nameEn: 'Physical', protocols: ['كابلات نحاسية', 'ألياف ضوئية', 'موجات راديو', 'Bluetooth'] },
            ],
            devices: [
                { nameAr: 'موجّه', nameEn: 'Router', layer: 3, role: 'توجيه الحزم بين الشبكات' },
                { nameAr: 'مبدّل', nameEn: 'Switch', layer: 2, role: 'ربط الأجهزة في شبكة محلية' },
                { nameAr: 'جدار ناري', nameEn: 'Firewall', layer: '3-7', role: 'حماية الشبكة من التهديدات' },
                { nameAr: 'نقطة وصول', nameEn: 'Access Point', layer: 2, role: 'ربط الأجهزة اللاسلكية' },
                { nameAr: 'موزّع حمل', nameEn: 'Load Balancer', layer: '4-7', role: 'توزيع حركة المرور' },
                { nameAr: 'خادم DNS', nameEn: 'DNS Server', layer: 7, role: 'تحويل أسماء النطاقات' },
                { nameAr: 'خادم DHCP', nameEn: 'DHCP Server', layer: 7, role: 'توزيع عناوين IP تلقائياً' },
                { nameAr: 'وكيل عكسي', nameEn: 'Reverse Proxy', layer: 7, role: 'وساطة بين العميل والخادم' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الاتصالات — Telecommunications
    // ══════════════════════════════════════════════════════════
    _initTelecom() {
        return {
            nameAr: 'الاتصالات', nameEn: 'Telecommunications',
            description: 'منظومة الاتصالات الشاملة — من الهاتف الثابت إلى الأقمار الصناعية',
            sectors: [
                {
                    id: 'fixed', nameAr: 'الاتصالات الثابتة', nameEn: 'Fixed-line',
                    technologies: ['PSTN', 'ISDN', 'DSL', 'FTTH', 'FTTB'],
                    description: 'الهاتف الأرضي وخطوط الإنترنت الثابتة',
                    icon: '📞'
                },
                {
                    id: 'mobile', nameAr: 'الاتصالات النقالة', nameEn: 'Mobile',
                    technologies: ['2G GSM', '3G UMTS', '4G LTE', '5G NR', '5G SA', '6G (R&D)'],
                    description: 'الهاتف النقال وشبكات البيانات اللاسلكية',
                    icon: '📱'
                },
                {
                    id: 'satellite', nameAr: 'اتصالات الأقمار الصناعية', nameEn: 'Satellite',
                    technologies: ['LEO', 'MEO', 'GEO', 'Starlink', 'OneWeb', 'Iridium'],
                    description: 'اتصالات عبر الأقمار الصناعية للمناطق النائية والبحرية',
                    icon: '🛰️'
                },
                {
                    id: 'fiber', nameAr: 'الألياف الضوئية', nameEn: 'Fiber Optics',
                    technologies: ['Single-mode', 'Multi-mode', 'DWDM', 'CWDM', 'PON', 'GPON'],
                    description: 'العمود الفقري لشبكات الاتصالات الحديثة',
                    icon: '🔦'
                },
                {
                    id: 'submarine', nameAr: 'كابلات بحرية', nameEn: 'Submarine Cables',
                    technologies: ['كابلات الألياف البحرية', 'محطات الإنزال', 'مكررات الإشارة'],
                    description: 'الكابلات البحرية التي تربط القارات — 95% من البيانات الدولية',
                    icon: '🌊'
                },
                {
                    id: 'broadcast', nameAr: 'البث', nameEn: 'Broadcasting',
                    technologies: ['راديو FM/AM', 'تلفزيون DVB', 'بث رقمي DAB', 'IPTV', 'OTT'],
                    description: 'بث الصوت والصورة للجمهور',
                    icon: '📡'
                },
            ],
            saudiOperators: [
                { name: 'STC', nameAr: 'الاتصالات السعودية', type: 'شامل' },
                { name: 'Mobily', nameAr: 'موبايلي', type: 'شامل' },
                { name: 'Zain', nameAr: 'زين', type: 'شامل' },
                { name: 'CITC', nameAr: 'هيئة الاتصالات', type: 'تنظيمي' },
                { name: 'Integrated Telecom', nameAr: 'الاتصالات المتكاملة', type: 'بنية تحتية' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الإنترنت — Internet Infrastructure
    // ══════════════════════════════════════════════════════════
    _initInternet() {
        return {
            nameAr: 'الإنترنت', nameEn: 'Internet',
            description: 'البنية التحتية للإنترنت — البروتوكولات والخدمات والمعايير',
            layers: [
                { nameAr: 'طبقة الوصول', nameEn: 'Access Layer', examples: ['WiFi', 'DSL', 'Fiber', '4G/5G'] },
                { nameAr: 'طبقة التجميع', nameEn: 'Aggregation', examples: ['ISP Edge', 'Metro Network'] },
                { nameAr: 'طبقة النواة', nameEn: 'Core/Backbone', examples: ['Tier-1 ISPs', 'IXPs', 'Submarine Cables'] },
                { nameAr: 'مراكز البيانات', nameEn: 'Data Centers', examples: ['Cloud', 'CDN Edge', 'Colocation'] },
            ],
            services: [
                { id: 'web', nameAr: 'الويب', nameEn: 'World Wide Web', protocols: ['HTTP/2', 'HTTP/3 (QUIC)', 'WebSocket', 'WebRTC'] },
                { id: 'email', nameAr: 'البريد الإلكتروني', nameEn: 'Email', protocols: ['SMTP', 'IMAP', 'POP3', 'DKIM', 'SPF', 'DMARC'] },
                { id: 'dns', nameAr: 'نظام أسماء النطاقات', nameEn: 'DNS', protocols: ['DNS', 'DNSSEC', 'DoH', 'DoT'] },
                { id: 'cloud', nameAr: 'الحوسبة السحابية', nameEn: 'Cloud Computing', models: ['IaaS', 'PaaS', 'SaaS', 'FaaS', 'BaaS'] },
                { id: 'streaming', nameAr: 'البث المباشر', nameEn: 'Streaming', protocols: ['HLS', 'DASH', 'RTMP', 'WebRTC'] },
                { id: 'voip', nameAr: 'الاتصال عبر الإنترنت', nameEn: 'VoIP', protocols: ['SIP', 'RTP', 'SRTP', 'WebRTC'] },
            ],
            cloudProviders: [
                { name: 'AWS', region: 'عالمي', services: '+200' },
                { name: 'Azure', region: 'عالمي', services: '+200' },
                { name: 'Google Cloud', region: 'عالمي', services: '+150' },
                { name: 'Alibaba Cloud', region: 'آسيا/عالمي', services: '+100' },
                { name: 'STC Cloud', region: 'السعودية', services: 'سحابة سيادية' },
                { name: 'SDAIA', region: 'السعودية', services: 'بيانات حكومية' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الجوال — Mobile Generations
    // ══════════════════════════════════════════════════════════
    _initMobile() {
        return {
            nameAr: 'أجيال الاتصالات النقالة', nameEn: 'Mobile Generations',
            generations: [
                { gen: '1G', year: 1980, nameAr: 'الجيل الأول', tech: 'AMPS/NMT', speed: '2.4 Kbps', features: ['صوت تماثلي فقط'], icon: '📻' },
                { gen: '2G', year: 1991, nameAr: 'الجيل الثاني', tech: 'GSM/CDMA', speed: '64 Kbps', features: ['رقمي', 'SMS', 'MMS'], icon: '📟' },
                { gen: '2.5G', year: 2000, nameAr: 'الجيل 2.5', tech: 'GPRS', speed: '171 Kbps', features: ['بيانات حزمية', 'WAP'], icon: '📟' },
                { gen: '3G', year: 2001, nameAr: 'الجيل الثالث', tech: 'UMTS/WCDMA', speed: '2 Mbps', features: ['إنترنت', 'فيديو', 'مكالمات مرئية'], icon: '📱' },
                { gen: '3.5G', year: 2006, nameAr: 'الجيل 3.5', tech: 'HSPA+', speed: '42 Mbps', features: ['بيانات سريعة'], icon: '📱' },
                { gen: '4G', year: 2009, nameAr: 'الجيل الرابع', tech: 'LTE/LTE-A', speed: '1 Gbps', features: ['بث عالي الجودة', 'ألعاب', 'VoLTE'], icon: '🌐' },
                { gen: '5G', year: 2020, nameAr: 'الجيل الخامس', tech: 'NR (New Radio)', speed: '20 Gbps', features: ['زمن تأخير 1ms', 'IoT ضخم', 'صناعة 4.0', 'سيارات ذاتية'], icon: '⚡' },
                { gen: '5G-SA', year: 2023, nameAr: 'الجيل الخامس المستقل', tech: '5G Standalone', speed: '20 Gbps+', features: ['شرائح شبكة', 'حوسبة حافة', 'URLLC'], icon: '🚀' },
                { gen: '6G', year: 2030, nameAr: 'الجيل السادس (قيد البحث)', tech: 'THz/AI-Native', speed: '1 Tbps', features: ['ذكاء اصطناعي مدمج', 'هولوغرام', 'تيراهرتز', 'اتصال حسّي'], icon: '🔮' },
            ],
            spectrum: [
                { band: 'Low Band', range: '< 1 GHz', use: 'تغطية واسعة', examples: ['700 MHz', '850 MHz'] },
                { band: 'Mid Band', range: '1-6 GHz', use: 'توازن سرعة/تغطية', examples: ['2.5 GHz', '3.5 GHz', 'C-Band'] },
                { band: 'High Band (mmWave)', range: '24-100 GHz', use: 'سرعة فائقة', examples: ['28 GHz', '39 GHz', '60 GHz'] },
                { band: 'THz (6G)', range: '> 100 GHz', use: 'المستقبل', examples: ['100-300 GHz', '300 GHz-3 THz'] },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الكهرباء — Electricity
    // ══════════════════════════════════════════════════════════
    _initElectricity() {
        return {
            nameAr: 'منظومة الكهرباء', nameEn: 'Electricity System',
            quranRef: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ — النور ٣٥',
            stages: [
                {
                    id: 'generation', nameAr: 'التوليد', nameEn: 'Generation', icon: '⚡',
                    sources: ['محطات غازية', 'محطات بخارية', 'محطات نووية', 'طاقة شمسية', 'طاقة رياح', 'طاقة مائية', 'وقود حيوي'],
                    description: 'تحويل أشكال الطاقة إلى كهرباء'
                },
                {
                    id: 'transmission', nameAr: 'النقل', nameEn: 'Transmission', icon: '🔌',
                    voltages: ['765 kV', '500 kV', '345 kV', '230 kV', '115 kV'],
                    description: 'نقل الكهرباء عبر خطوط الجهد العالي لمسافات طويلة'
                },
                {
                    id: 'distribution', nameAr: 'التوزيع', nameEn: 'Distribution', icon: '🏘️',
                    voltages: ['33 kV', '11 kV', '400V', '230V'],
                    description: 'توزيع الكهرباء للمنازل والمنشآت'
                },
                {
                    id: 'smartgrid', nameAr: 'الشبكة الذكية', nameEn: 'Smart Grid', icon: '🧠',
                    features: ['عدادات ذكية', 'إدارة طلب', 'تخزين طاقة', 'مصادر موزعة', 'استجابة تلقائية للأعطال'],
                    description: 'شبكة كهربائية ذكية متصلة بالإنترنت وتعمل بالذكاء الاصطناعي'
                },
            ],
            saudiEntities: [
                { name: 'SEC', nameAr: 'الشركة السعودية للكهرباء', role: 'توليد ونقل وتوزيع' },
                { name: 'ECRA', nameAr: 'هيئة تنظيم الكهرباء والإنتاج المزدوج', role: 'تنظيم' },
                { name: 'SPPC', nameAr: 'الشركة السعودية لشراء الطاقة', role: 'شراء' },
                { name: 'NGCP', nameAr: 'الشركة الوطنية لنقل الكهرباء', role: 'نقل' },
            ],
            units: [
                { nameAr: 'واط', nameEn: 'Watt (W)', description: 'وحدة القدرة' },
                { nameAr: 'أمبير', nameEn: 'Ampere (A)', description: 'وحدة التيار' },
                { nameAr: 'فولت', nameEn: 'Volt (V)', description: 'وحدة الجهد' },
                { nameAr: 'أوم', nameEn: 'Ohm (Ω)', description: 'وحدة المقاومة' },
                { nameAr: 'كيلوواط ساعة', nameEn: 'kWh', description: 'وحدة الطاقة المستهلكة' },
                { nameAr: 'هرتز', nameEn: 'Hertz (Hz)', description: 'وحدة التردد' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الطاقة — Energy
    // ══════════════════════════════════════════════════════════
    _initEnergy() {
        return {
            nameAr: 'منظومة الطاقة', nameEn: 'Energy System',
            quranRef: 'وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ — النحل ١٢',
            sectors: [
                {
                    id: 'oil-gas', nameAr: 'النفط والغاز', nameEn: 'Oil & Gas', icon: '🛢️',
                    stages: ['استكشاف', 'حفر', 'إنتاج', 'تكرير', 'نقل', 'توزيع', 'تسويق'],
                    entities: ['أرامكو', 'سابك', 'OPEC', 'OPEC+'],
                    description: 'الطاقة التقليدية — المصدر الأساسي حالياً'
                },
                {
                    id: 'solar', nameAr: 'الطاقة الشمسية', nameEn: 'Solar Energy', icon: '☀️',
                    technologies: ['PV (خلايا كهروضوئية)', 'CSP (طاقة شمسية مركزة)', 'خلايا بيروفسكايت', 'خلايا عضوية'],
                    projects: ['نيوم', 'سدير', 'الشعيبة', 'رابغ'],
                    description: 'وَجَعَلَ الشَّمْسَ سِرَاجًا — مصدر طاقة متجدد لا ينضب'
                },
                {
                    id: 'wind', nameAr: 'طاقة الرياح', nameEn: 'Wind Energy', icon: '🌬️',
                    technologies: ['توربينات برية', 'توربينات بحرية', 'طاقة رياح عمودية'],
                    projects: ['دومة الجندل'],
                    description: 'وَتَصْرِيفِ الرِّيَاحِ — طاقة نظيفة ومسخّرة'
                },
                {
                    id: 'nuclear', nameAr: 'الطاقة النووية', nameEn: 'Nuclear Energy', icon: '⚛️',
                    technologies: ['انشطار نووي', 'مفاعلات صغيرة SMR', 'اندماج نووي (مستقبلي)'],
                    entities: ['مدينة الملك عبدالله للطاقة الذرية'],
                    description: 'طاقة عالية الكثافة لتوليد الكهرباء المستمر'
                },
                {
                    id: 'hydrogen', nameAr: 'الهيدروجين', nameEn: 'Hydrogen', icon: '💧',
                    types: ['أخضر (كهرومائي)', 'أزرق (غاز + CCS)', 'رمادي (تقليدي)'],
                    projects: ['نيوم — أكبر مصنع هيدروجين أخضر في العالم'],
                    description: 'وقود المستقبل — نظيف وقابل للتخزين'
                },
                {
                    id: 'geothermal', nameAr: 'الطاقة الحرارية الأرضية', nameEn: 'Geothermal', icon: '🌋',
                    description: 'استخدام حرارة باطن الأرض لتوليد الكهرباء والتدفئة'
                },
                {
                    id: 'hydro', nameAr: 'الطاقة المائية', nameEn: 'Hydropower', icon: '💦',
                    technologies: ['سدود كهرومائية', 'تخزين ضخّي', 'أمواج بحرية', 'مد وجزر'],
                    description: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ'
                },
                {
                    id: 'storage', nameAr: 'تخزين الطاقة', nameEn: 'Energy Storage', icon: '🔋',
                    technologies: ['بطاريات ليثيوم', 'بطاريات حالة صلبة', 'تخزين ضخّي', 'هيدروجين', 'هواء مضغوط', 'حرارة محسوسة'],
                    description: 'تخزين الطاقة الفائضة لاستخدامها وقت الحاجة'
                },
            ],
            vision2030: {
                target: 'مزيج طاقة متنوع — 50% متجددة بحلول 2030',
                entity: 'وزارة الطاقة — المملكة العربية السعودية',
                programs: ['برنامج الطاقة المتجددة', 'مبادرة السعودية الخضراء', 'مبادرة الشرق الأوسط الأخضر'],
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // المفاتيح الرقمية — Digital Keys & Tokens
    // ══════════════════════════════════════════════════════════
    _initDigitalKeys() {
        return {
            nameAr: 'منظومة المفاتيح الرقمية', nameEn: 'Digital Keys System',
            description: 'جميع أنواع المفاتيح والرموز الرقمية للتحقق والتوثيق والتواصل بين الأنظمة',
            categories: [
                {
                    id: 'api-key', nameAr: 'مفتاح API', nameEn: 'API Key', icon: '🔑',
                    description: 'مفتاح فريد يُمنح للتطبيق للوصول إلى واجهة برمجية محددة',
                    usage: 'التحقق من هوية التطبيق عند استدعاء API',
                    examples: ['Google Maps API Key', 'OpenAI API Key', 'Stripe API Key'],
                    security: 'يُخزّن في متغيرات البيئة (.env) — لا يُكشف في الكود',
                    format: 'sk-xxxxxxxxxxxxxxxxxxxx'
                },
                {
                    id: 'token-jwt', nameAr: 'رمز JWT', nameEn: 'JSON Web Token', icon: '🪙',
                    description: 'رمز مشفّر يحمل بيانات المستخدم ويُستخدم للمصادقة بدون جلسة على الخادم',
                    usage: 'مصادقة المستخدم في تطبيقات الويب والجوال',
                    parts: ['Header (الخوارزمية)', 'Payload (البيانات)', 'Signature (التوقيع)'],
                    algorithms: ['HS256', 'HS384', 'RS256', 'RS512', 'ES256'],
                    format: 'eyJhbGciOi...eyJzdWIiOi...SflKxwRJ...'
                },
                {
                    id: 'oauth', nameAr: 'OAuth 2.0', nameEn: 'OAuth 2.0 Token', icon: '🔐',
                    description: 'بروتوكول تفويض يسمح لتطبيق بالوصول لبيانات المستخدم بدون كلمة مروره',
                    flows: ['Authorization Code', 'Client Credentials', 'PKCE', 'Device Code', 'Implicit (مهمل)'],
                    tokens: ['Access Token', 'Refresh Token', 'ID Token (OIDC)'],
                    providers: ['Google', 'Apple', 'Microsoft', 'GitHub', 'Absher (أبشر)']
                },
                {
                    id: 'webhook', nameAr: 'ويب هوك', nameEn: 'Webhook', icon: '🪝',
                    description: 'إشعار HTTP تلقائي يُرسل من نظام لآخر عند حدوث حدث معيّن',
                    usage: 'إخطار الأنظمة بأحداث فورية (دفع مالي، طلب جديد، تحديث حالة)',
                    security: ['HMAC Signature', 'Webhook Secret', 'IP Whitelist', 'Retry Logic'],
                    examples: ['Stripe Webhook', 'GitHub Webhook', 'Shopify Webhook', 'PayPal IPN']
                },
                {
                    id: 'ssh', nameAr: 'مفتاح SSH', nameEn: 'SSH Key', icon: '🔏',
                    description: 'زوج مفاتيح تشفير (عام + خاص) للدخول الآمن إلى الخوادم عن بُعد',
                    usage: 'إدارة الخوادم والنشر الآمن بدون كلمة مرور',
                    types: ['RSA (2048/4096 bit)', 'Ed25519 (أحدث وأسرع)', 'ECDSA'],
                    commands: ['ssh-keygen', 'ssh-copy-id', 'ssh-agent', 'scp', 'sftp'],
                    format: 'ssh-ed25519 AAAAC3NzaC1l...'
                },
                {
                    id: 'ssl-tls', nameAr: 'شهادة SSL/TLS', nameEn: 'SSL/TLS Certificate', icon: '🛡️',
                    description: 'شهادة رقمية تُشفّر الاتصال بين المتصفح والخادم (HTTPS)',
                    types: ['DV (التحقق من النطاق)', 'OV (التحقق من المنظمة)', 'EV (التحقق الموسّع)', 'Wildcard', 'SAN'],
                    providers: ["Let's Encrypt (مجاني)", 'DigiCert', 'Comodo', 'GlobalSign'],
                    versions: ['TLS 1.2', 'TLS 1.3 (الأحدث والأكثر أماناً)']
                },
                {
                    id: 'vps', nameAr: 'خادم افتراضي خاص', nameEn: 'VPS — Virtual Private Server', icon: '🖥️',
                    description: 'خادم افتراضي مستقل بموارد مخصصة على بنية سحابية مشتركة',
                    features: ['Root Access', 'IP مخصص', 'نظام تشغيل كامل', 'جدار ناري', 'نسخ احتياطي'],
                    providers: ['DigitalOcean', 'Linode (Akamai)', 'Vultr', 'Hetzner', 'AWS EC2', 'Azure VM'],
                    management: ['SSH', 'cPanel/WHM', 'Plesk', 'Docker', 'Kubernetes']
                },
                {
                    id: 'http-methods', nameAr: 'طرق HTTP', nameEn: 'HTTP Methods', icon: '🌐',
                    description: 'أوامر بروتوكول HTTP للتواصل بين العميل والخادم',
                    methods: [
                        { method: 'GET', use: 'قراءة بيانات' },
                        { method: 'POST', use: 'إنشاء مورد جديد' },
                        { method: 'PUT', use: 'تحديث كامل' },
                        { method: 'PATCH', use: 'تحديث جزئي' },
                        { method: 'DELETE', use: 'حذف مورد' },
                        { method: 'HEAD', use: 'فحص التوفر' },
                        { method: 'OPTIONS', use: 'الصلاحيات المتاحة (CORS)' },
                    ],
                    statusCodes: [
                        { range: '2xx', meaning: 'نجاح', examples: ['200 OK', '201 Created', '204 No Content'] },
                        { range: '3xx', meaning: 'تحويل', examples: ['301 Moved', '302 Found', '304 Not Modified'] },
                        { range: '4xx', meaning: 'خطأ عميل', examples: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found', '429 Too Many'] },
                        { range: '5xx', meaning: 'خطأ خادم', examples: ['500 Internal', '502 Bad Gateway', '503 Unavailable'] },
                    ],
                },
                {
                    id: 'session', nameAr: 'رمز الجلسة', nameEn: 'Session Token', icon: '🎫',
                    description: 'معرّف فريد يُخزّن في الكوكيز لتتبع جلسة المستخدم',
                    storage: ['Server-side session', 'Redis', 'Database', 'Cookie'],
                },
                {
                    id: 'csrf', nameAr: 'رمز CSRF', nameEn: 'CSRF Token', icon: '🛡️',
                    description: 'رمز حماية ضد هجمات تزوير الطلبات عبر المواقع',
                },
                {
                    id: 'totp', nameAr: 'كلمة مرور لمرة واحدة', nameEn: 'TOTP/OTP', icon: '📲',
                    description: 'رمز مؤقت يُولّد كل 30 ثانية للمصادقة الثنائية (2FA)',
                    apps: ['Google Authenticator', 'Microsoft Authenticator', 'Authy'],
                },
                {
                    id: 'encryption-keys', nameAr: 'مفاتيح التشفير', nameEn: 'Encryption Keys', icon: '🗝️',
                    types: [
                        { type: 'متماثل', nameEn: 'Symmetric', algorithms: ['AES-256', 'ChaCha20', 'Blowfish'] },
                        { type: 'غير متماثل', nameEn: 'Asymmetric', algorithms: ['RSA', 'ECC', 'Ed25519', 'X25519'] },
                        { type: 'تجزئة', nameEn: 'Hashing', algorithms: ['SHA-256', 'SHA-3', 'bcrypt', 'Argon2'] },
                    ],
                },
                {
                    id: 'dns-records', nameAr: 'سجلات DNS', nameEn: 'DNS Records', icon: '📋',
                    types: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'PTR'],
                    description: 'سجلات نظام أسماء النطاقات — خرائط الإنترنت',
                },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // البروتوكولات — Protocols Encyclopedia
    // ══════════════════════════════════════════════════════════
    _initProtocols() {
        return {
            nameAr: 'موسوعة البروتوكولات', nameEn: 'Protocols Encyclopedia',
            categories: [
                {
                    nameAr: 'بروتوكولات الويب', nameEn: 'Web',
                    items: [
                        { name: 'HTTP/1.1', port: 80, description: 'بروتوكول نقل النصوص' },
                        { name: 'HTTPS', port: 443, description: 'HTTP مشفّر بـ TLS' },
                        { name: 'HTTP/2', port: 443, description: 'تعدد الإرسال والضغط' },
                        { name: 'HTTP/3 (QUIC)', port: 443, description: 'أسرع — يعتمد على UDP' },
                        { name: 'WebSocket', port: '80/443', description: 'اتصال ثنائي الاتجاه في الوقت الحقيقي' },
                    ]
                },
                {
                    nameAr: 'بروتوكولات البريد', nameEn: 'Email',
                    items: [
                        { name: 'SMTP', port: 587, description: 'إرسال البريد' },
                        { name: 'IMAP', port: 993, description: 'قراءة البريد (متزامن)' },
                        { name: 'POP3', port: 995, description: 'تحميل البريد' },
                    ]
                },
                {
                    nameAr: 'بروتوكولات النقل', nameEn: 'Transfer',
                    items: [
                        { name: 'FTP', port: 21, description: 'نقل الملفات' },
                        { name: 'SFTP', port: 22, description: 'نقل آمن عبر SSH' },
                        { name: 'SCP', port: 22, description: 'نسخ آمن' },
                        { name: 'rsync', port: 873, description: 'مزامنة ملفات' },
                    ]
                },
                {
                    nameAr: 'بروتوكولات الأمان', nameEn: 'Security',
                    items: [
                        { name: 'SSH', port: 22, description: 'الوصول الآمن للخوادم' },
                        { name: 'TLS 1.3', port: '-', description: 'تشفير الاتصالات' },
                        { name: 'IPSec', port: '-', description: 'تشفير طبقة الشبكة (VPN)' },
                        { name: 'WireGuard', port: 51820, description: 'VPN حديث وسريع' },
                    ]
                },
                {
                    nameAr: 'بروتوكولات الشبكة', nameEn: 'Network',
                    items: [
                        { name: 'TCP', port: '-', description: 'نقل موثوق — يضمن الوصول' },
                        { name: 'UDP', port: '-', description: 'نقل سريع — بدون ضمان' },
                        { name: 'DNS', port: 53, description: 'تحويل الأسماء لعناوين IP' },
                        { name: 'DHCP', port: '67/68', description: 'توزيع عناوين IP' },
                        { name: 'BGP', port: 179, description: 'توجيه بين الشبكات الكبرى' },
                        { name: 'OSPF', port: '-', description: 'توجيه داخلي' },
                    ]
                },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الأمن السيبراني — Cybersecurity
    // ══════════════════════════════════════════════════════════
    _initCyberSecurity() {
        return {
            nameAr: 'الأمن السيبراني', nameEn: 'Cybersecurity',
            hadith: 'لا ضَرَرَ ولا ضِرار — حديث نبوي',
            description: 'حماية الشبكات والأنظمة والبيانات من التهديدات — لا ضرر ولا ضرار',
            domains: [
                { nameAr: 'أمن الشبكات', nameEn: 'Network Security', tools: ['Firewall', 'IDS/IPS', 'WAF', 'DDoS Protection'] },
                { nameAr: 'أمن التطبيقات', nameEn: 'Application Security', tools: ['OWASP Top 10', 'SAST', 'DAST', 'SCA', 'Pen Testing'] },
                { nameAr: 'أمن البيانات', nameEn: 'Data Security', tools: ['تشفير AES-256', 'Tokenization', 'DLP', 'Backup'] },
                { nameAr: 'أمن السحابة', nameEn: 'Cloud Security', tools: ['IAM', 'CSPM', 'CWPP', 'Zero Trust'] },
                { nameAr: 'أمن الهوية', nameEn: 'Identity Security', tools: ['MFA', 'SSO', 'PAM', 'RBAC', 'ABAC'] },
                { nameAr: 'أمن نقاط النهاية', nameEn: 'Endpoint Security', tools: ['EDR', 'XDR', 'MDM', 'Antivirus'] },
                { nameAr: 'استجابة للحوادث', nameEn: 'Incident Response', tools: ['SIEM', 'SOAR', 'SOC', 'Playbooks'] },
            ],
            saudiEntities: [
                { name: 'NCA', nameAr: 'الهيئة الوطنية للأمن السيبراني', role: 'تنظيم وحماية' },
                { name: 'CERT-SA', nameAr: 'المركز الوطني الإرشادي للأمن السيبراني', role: 'إنذارات وتحذيرات' },
                { name: 'NDMO', nameAr: 'مكتب إدارة البيانات الوطنية', role: 'حوكمة البيانات' },
            ],
            frameworks: ['NIST CSF', 'ISO 27001', 'CIS Controls', 'SAMA Cybersecurity', 'NCA ECC', 'SOC 2'],
        };
    }

    // ══════════════════════════════════════════════════════════
    // الضوابط الشرعية للشبكات والاتصالات والطاقة
    // ══════════════════════════════════════════════════════════
    _initShariaGuidance() {
        return {
            nameAr: 'الضوابط الشرعية', nameEn: 'Sharia Guidance',
            principles: [
                { id: 'amana', nameAr: 'الأمانة الرقمية', description: 'حفظ بيانات المستخدمين أمانة شرعية — إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', icon: '🤝' },
                { id: 'khususiya', nameAr: 'حفظ الخصوصية', description: 'لا تجسسوا — حرمة التجسس على بيانات الناس ورسائلهم', icon: '🔒' },
                { id: 'sidq', nameAr: 'الصدق في المعلومات', description: 'عدم نشر معلومات كاذبة أو مضللة عبر الشبكات', icon: '✅' },
                { id: 'la-darar', nameAr: 'لا ضرر ولا ضرار', description: 'منع الضرر في الشبكات — حماية من الاختراق والاحتيال', icon: '🛡️' },
                { id: 'itqan', nameAr: 'الإتقان', description: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — إتقان البنية التحتية', icon: '⭐' },
                { id: 'tawazun', nameAr: 'التوازن في الاستهلاك', description: 'وَلَا تُسْرِفُوا — ترشيد استهلاك الطاقة والموارد', icon: '⚖️' },
                { id: 'taawun', nameAr: 'التعاون على البر', description: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ — التعاون في تطوير الشبكات والبنية التحتية', icon: '🤲' },
                { id: 'halal-content', nameAr: 'المحتوى الحلال', description: 'ضمان خلوّ الشبكة من المحتوى المحرم والضار', icon: '📖' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // لوحة التحكم — Dashboard
    // ══════════════════════════════════════════════════════════
    getDashboard() {
        return {
            name: this.name,
            version: this.version,
            startedAt: this.startedAt,
            summary: {
                networkTypes: this.computerNetworks.types.length,
                telecomSectors: this.telecom.sectors.length,
                mobileGenerations: this.mobile.generations.length,
                electricityStages: this.electricity.stages.length,
                energySectors: this.energy.sectors.length,
                digitalKeyTypes: this.digitalKeys.categories.length,
                protocolCategories: this.protocols.categories.length,
                cyberDomains: this.cyberSecurity.domains.length,
                osiLayers: this.computerNetworks.osiModel.length,
                quranVerses: this.quranReferences.length,
                shariaRules: this.shariaGuidance.principles.length,
            },
            quranReferences: this.quranReferences,
            computerNetworks: this.computerNetworks,
            telecom: this.telecom,
            internet: this.internet,
            mobile: this.mobile,
            electricity: this.electricity,
            energy: this.energy,
            digitalKeys: this.digitalKeys,
            protocols: this.protocols,
            cyberSecurity: this.cyberSecurity,
            shariaGuidance: this.shariaGuidance,
        };
    }

    getNetworks() { return this.computerNetworks; }
    getTelecom() { return this.telecom; }
    getInternet() { return this.internet; }
    getMobile() { return this.mobile; }
    getElectricity() { return this.electricity; }
    getEnergy() { return this.energy; }
    getDigitalKeys() { return this.digitalKeys; }
    getProtocols() { return this.protocols; }
    getCyberSecurity() { return this.cyberSecurity; }
    getShariaGuidance() { return this.shariaGuidance; }
}

module.exports = SheikhaNetworksEngine;
