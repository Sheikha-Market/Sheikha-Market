/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA TECHNOLOGY & COMPUTING ENGINE
 * منظومة شيخة الشاملة للتقنية والحاسب والجوال والصناعة والسيارات وأنظمة التشغيل
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "الَّذِي عَلَّمَ بِالْقَلَمِ ● عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ" — العلق ٤-٥
 * "وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ" — الجاثية ١٣
 *
 * ✅ أنظمة التشغيل — Apple/macOS/iOS, Microsoft/Windows, Linux, Android, RTOS
 * ✅ أجهزة الحاسب — الشخصي والخوادم والحوسبة الفائقة
 * ✅ أجهزة الجوال والأجهزة المحمولة
 * ✅ تقنيات السيارات والمركبات الذكية
 * ✅ تقنيات الصناعة والتصنيع
 * ✅ الشبكات والاتصالات والبنية التحتية
 * ✅ البرمجيات وقواعد البيانات ولغات البرمجة
 * ✅ التقنيات الناشئة والمستقبلية
 * ✅ الفهرسة الشاملة — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaTechComputingEngine {
    constructor() {
        this.name = 'Sheikha Technology & Computing Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {
        // ══════════════════════════════════════════════════════════════════
        this.quranReferences = [
            { ayah: 'الَّذِي عَلَّمَ بِالْقَلَمِ ● عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ', surah: 'العلق', num: '4-5', topic: 'التعلم والتقنية' },
            { ayah: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ', surah: 'الجاثية', num: 13, topic: 'تسخير التقنية لخدمة الإنسان' },
            { ayah: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ', surah: 'الأنفال', num: 60, topic: 'الإعداد التقني والتطوير' },
            { ayah: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ', topic: 'الإتقان في التقنية', note: 'حديث' }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ١. أنظمة التشغيل — Operating Systems (فهرس شامل)
        // ══════════════════════════════════════════════════════════════════
        this.operatingSystems = {
            nameAr: 'أنظمة التشغيل',
            nameEn: 'Operating Systems',
            categories: [
                {
                    id: 'OS-01', nameAr: 'أنظمة Apple', nameEn: 'Apple Operating Systems',
                    icon: '🍎', company: 'Apple Inc.', founded: 1976, hq: 'كوبرتينو، كاليفورنيا',
                    systems: [
                        { id: 'OS-01-A', name: 'macOS', nameAr: 'ماك أو إس', type: 'حاسب مكتبي/محمول', kernel: 'XNU (Hybrid)', arch: 'ARM64 (Apple Silicon) + x86_64', latest: 'macOS Sequoia 15', filesystem: 'APFS', devices: ['MacBook Pro', 'MacBook Air', 'iMac', 'Mac Pro', 'Mac Studio', 'Mac mini'], features: ['Spotlight', 'Time Machine', 'Siri', 'AirDrop', 'Handoff', 'Universal Control', 'Stage Manager'], devTools: ['Xcode', 'Swift', 'Objective-C', 'Terminal (zsh)', 'Homebrew'] },
                        { id: 'OS-01-B', name: 'iOS', nameAr: 'آي أو إس', type: 'هاتف ذكي', kernel: 'XNU', devices: ['iPhone'], latest: 'iOS 18', features: ['App Store', 'Face ID', 'iMessage', 'Apple Pay', 'Siri', 'Focus Mode', 'WidgetKit'] },
                        { id: 'OS-01-C', name: 'iPadOS', nameAr: 'آيباد أو إس', type: 'لوحي', kernel: 'XNU', devices: ['iPad Pro', 'iPad Air', 'iPad mini', 'iPad'], features: ['Stage Manager', 'Apple Pencil', 'Split View', 'Slide Over'] },
                        { id: 'OS-01-D', name: 'watchOS', nameAr: 'واتش أو إس', type: 'ساعة ذكية', devices: ['Apple Watch Ultra', 'Apple Watch Series'], features: ['صحة', 'لياقة', 'ECG', 'SpO2', 'إشعارات'] },
                        { id: 'OS-01-E', name: 'tvOS', nameAr: 'تي في أو إس', type: 'تلفزيون', devices: ['Apple TV 4K'], features: ['Siri Remote', 'AirPlay', 'HomeKit'] },
                        { id: 'OS-01-F', name: 'visionOS', nameAr: 'فيجن أو إس', type: 'حوسبة مكانية', devices: ['Apple Vision Pro'], features: ['واقع مختلط', 'Eye Tracking', 'Hand Gestures', 'Spatial Audio'] },
                        { id: 'OS-01-G', name: 'audioOS', type: 'سماعة ذكية', devices: ['HomePod'] }
                    ],
                    ecosystem: { name: 'Apple Ecosystem', services: ['iCloud', 'Apple Music', 'Apple TV+', 'Apple Arcade', 'Apple Fitness+', 'Apple Pay', 'Apple Card'], silicon: ['M1', 'M2', 'M3', 'M4', 'A17 Pro', 'S9', 'R1'] }
                },
                {
                    id: 'OS-02', nameAr: 'أنظمة Microsoft', nameEn: 'Microsoft Operating Systems',
                    icon: '🪟', company: 'Microsoft Corp.', founded: 1975, hq: 'ريدموند، واشنطن',
                    systems: [
                        { id: 'OS-02-A', name: 'Windows 11', nameAr: 'ويندوز ١١', type: 'حاسب مكتبي/محمول', kernel: 'NT Hybrid', arch: 'x86_64 + ARM64', filesystem: 'NTFS / ReFS', features: ['Start Menu', 'Snap Layouts', 'Widgets', 'Microsoft Copilot', 'DirectX 12', 'WSL2', 'Android Apps'], editions: ['Home', 'Pro', 'Enterprise', 'Education', 'IoT'] },
                        { id: 'OS-02-B', name: 'Windows Server', nameAr: 'ويندوز سيرفر', type: 'خوادم', latest: 'Windows Server 2025', features: ['Active Directory', 'Hyper-V', 'IIS', 'Azure Integration', 'Failover Clustering'] },
                        { id: 'OS-02-C', name: 'Xbox OS', type: 'ألعاب', devices: ['Xbox Series X|S'], kernel: 'Windows-based' },
                        { id: 'OS-02-D', name: 'Windows IoT', type: 'إنترنت الأشياء', devices: ['Raspberry Pi', 'أجهزة صناعية'], features: ['Headless mode', 'Edge computing'] },
                        { id: 'OS-02-E', name: 'Azure Sphere OS', type: 'IoT أمني', features: ['أمان مدمج', 'تحديثات تلقائية'] }
                    ],
                    history: ['MS-DOS (1981)', 'Windows 1.0 (1985)', 'Windows 95', 'Windows XP (2001)', 'Windows 7 (2009)', 'Windows 10 (2015)', 'Windows 11 (2021)'],
                    ecosystem: { cloud: 'Microsoft Azure', productivity: 'Microsoft 365', ai: 'Microsoft Copilot / Azure AI', dev: ['Visual Studio', 'VS Code', 'GitHub', '.NET', 'C#', 'TypeScript'] }
                },
                {
                    id: 'OS-03', nameAr: 'أنظمة Linux', nameEn: 'Linux Operating Systems',
                    icon: '🐧', creator: 'Linus Torvalds', year: 1991, license: 'GPL (مفتوح المصدر)',
                    kernel: 'Linux (Monolithic)',
                    distributions: [
                        { category: 'خوادم ومؤسسات', distros: [
                            { name: 'Ubuntu Server', org: 'Canonical', based: 'Debian', packageMgr: 'apt' },
                            { name: 'Red Hat Enterprise Linux (RHEL)', org: 'Red Hat/IBM', packageMgr: 'dnf/rpm' },
                            { name: 'CentOS Stream', org: 'Red Hat', based: 'RHEL' },
                            { name: 'Rocky Linux', based: 'RHEL', type: 'Community' },
                            { name: 'AlmaLinux', based: 'RHEL', type: 'Community' },
                            { name: 'SUSE Linux Enterprise', org: 'SUSE', packageMgr: 'zypper' },
                            { name: 'Oracle Linux', org: 'Oracle', based: 'RHEL' },
                            { name: 'Amazon Linux', org: 'AWS', type: 'Cloud-optimized' }
                        ]},
                        { category: 'سطح مكتب', distros: [
                            { name: 'Ubuntu Desktop', desktop: 'GNOME' },
                            { name: 'Linux Mint', desktop: 'Cinnamon', based: 'Ubuntu' },
                            { name: 'Fedora Workstation', desktop: 'GNOME', org: 'Red Hat' },
                            { name: 'Pop!_OS', org: 'System76', based: 'Ubuntu' },
                            { name: 'Manjaro', based: 'Arch Linux' },
                            { name: 'Arch Linux', type: 'Rolling Release' },
                            { name: 'openSUSE', org: 'SUSE' },
                            { name: 'Debian', type: 'Universal', note: 'أب التوزيعات' },
                            { name: 'elementary OS', desktop: 'Pantheon' }
                        ]},
                        { category: 'أمن واختراق', distros: [
                            { name: 'Kali Linux', org: 'Offensive Security', purpose: 'اختبار اختراق' },
                            { name: 'Parrot OS', purpose: 'أمن سيبراني' },
                            { name: 'Tails', purpose: 'خصوصية تامة' },
                            { name: 'Whonix', purpose: 'إخفاء هوية' }
                        ]},
                        { category: 'أنظمة مدمجة وIoT', distros: [
                            { name: 'Raspberry Pi OS', device: 'Raspberry Pi' },
                            { name: 'OpenWrt', purpose: 'أجهزة الشبكات' },
                            { name: 'Yocto Project', purpose: 'بناء أنظمة مدمجة مخصصة' },
                            { name: 'Buildroot', purpose: 'أنظمة Linux مصغرة' }
                        ]},
                        { category: 'حوسبة فائقة', distros: [
                            { name: 'CentOS/RHEL', note: '> 90% من أفضل 500 حاسب فائق عالمياً يعمل بـ Linux' }
                        ]}
                    ],
                    desktopEnvironments: ['GNOME', 'KDE Plasma', 'XFCE', 'Cinnamon', 'MATE', 'LXQt', 'Budgie', 'Hyprland (Wayland)'],
                    packageManagers: ['apt (Debian/Ubuntu)', 'dnf/yum (RHEL/Fedora)', 'pacman (Arch)', 'zypper (SUSE)', 'snap', 'flatpak', 'AppImage', 'nix']
                },
                {
                    id: 'OS-04', nameAr: 'أنظمة Google/Android', nameEn: 'Google/Android Systems',
                    icon: '🤖', company: 'Google/Alphabet',
                    systems: [
                        { id: 'OS-04-A', name: 'Android', nameAr: 'أندرويد', type: 'هاتف/لوحي', kernel: 'Linux (Modified)', latest: 'Android 15', marketShare: '> 72% عالمياً', features: ['Google Play', 'Material You', 'Gemini AI', 'Safety Net'], manufacturers: ['Samsung', 'Xiaomi', 'OnePlus', 'Google Pixel', 'Oppo', 'Vivo', 'Huawei (AOSP)'] },
                        { id: 'OS-04-B', name: 'Wear OS', type: 'ساعة ذكية', devices: ['Samsung Galaxy Watch', 'Google Pixel Watch'] },
                        { id: 'OS-04-C', name: 'Android TV / Google TV', type: 'تلفزيون', devices: ['Chromecast', 'تلفزيونات ذكية'] },
                        { id: 'OS-04-D', name: 'Android Auto', type: 'سيارة', features: ['ملاحة', 'موسيقى', 'اتصالات', 'مساعد Google'] },
                        { id: 'OS-04-E', name: 'ChromeOS', type: 'حاسب محمول', kernel: 'Linux', devices: ['Chromebook'], features: ['تطبيقات Android', 'Linux (Crostini)', 'Web Apps'] },
                        { id: 'OS-04-F', name: 'Fuchsia', type: 'نظام مستقبلي', kernel: 'Zircon (Microkernel)', note: 'يعمل على Google Nest Hub' }
                    ]
                },
                {
                    id: 'OS-05', nameAr: 'أنظمة تشغيل الوقت الحقيقي (RTOS)', nameEn: 'Real-Time Operating Systems',
                    icon: '⚡',
                    systems: [
                        { name: 'FreeRTOS', owner: 'AWS', use: 'IoT + أنظمة مدمجة', license: 'MIT' },
                        { name: 'Zephyr RTOS', owner: 'Linux Foundation', use: 'IoT متقدم' },
                        { name: 'VxWorks', owner: 'Wind River', use: 'طيران + دفاع + فضاء' },
                        { name: 'QNX', owner: 'BlackBerry', use: 'سيارات + طبي + صناعي' },
                        { name: 'AUTOSAR', use: 'معمارية برمجيات السيارات' },
                        { name: 'ThreadX (Azure RTOS)', owner: 'Microsoft', use: 'IoT' },
                        { name: 'Mbed OS', owner: 'ARM', use: 'أجهزة ARM المدمجة' }
                    ]
                },
                {
                    id: 'OS-06', nameAr: 'أنظمة أخرى ملحوظة', nameEn: 'Other Notable Systems',
                    systems: [
                        { name: 'HarmonyOS', owner: 'Huawei', type: 'هاتف + IoT', note: 'بديل أندرويد لهواوي' },
                        { name: 'FreeBSD', type: 'خوادم', license: 'BSD', note: 'أساس PlayStation OS و Netflix CDN' },
                        { name: 'OpenBSD', type: 'أمن', note: 'الأكثر أماناً' },
                        { name: 'Solaris', owner: 'Oracle', type: 'خوادم مؤسسية' },
                        { name: 'IBM AIX', type: 'خوادم Power', owner: 'IBM' },
                        { name: 'z/OS', owner: 'IBM', type: 'حاسبات مركزية (Mainframe)' },
                        { name: 'Tizen', owner: 'Samsung/Linux Foundation', type: 'ساعات + تلفزيونات Samsung' },
                        { name: 'KaiOS', type: 'هواتف ذكية أساسية' }
                    ]
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٢. أجهزة الحاسب — Computer Hardware
        // ══════════════════════════════════════════════════════════════════
        this.computerHardware = {
            nameAr: 'أجهزة الحاسب',
            nameEn: 'Computer Hardware',
            categories: [
                {
                    id: 'HW-01', nameAr: 'حاسبات شخصية ومحمولة', nameEn: 'PCs & Laptops',
                    types: [
                        { nameAr: 'حاسب مكتبي', nameEn: 'Desktop PC', examples: ['Tower', 'Mini PC', 'All-in-One'] },
                        { nameAr: 'حاسب محمول', nameEn: 'Laptop', examples: ['Ultrabook', 'Gaming Laptop', 'Workstation Laptop', 'Chromebook', 'MacBook'] },
                        { nameAr: 'محطة عمل', nameEn: 'Workstation', examples: ['Dell Precision', 'HP Z-Series', 'Lenovo ThinkStation', 'Mac Pro'] }
                    ],
                    components: [
                        { nameAr: 'المعالج (CPU)', nameEn: 'Processor', makers: ['Intel (Core i3-i9, Xeon)', 'AMD (Ryzen, EPYC, Threadripper)', 'Apple (M1-M4)', 'Qualcomm (Snapdragon X)'] },
                        { nameAr: 'معالج رسومات (GPU)', nameEn: 'Graphics Card', makers: ['NVIDIA (GeForce, RTX, Quadro, Tesla, H100)', 'AMD (Radeon, Instinct)', 'Intel (Arc)', 'Apple (Integrated)'] },
                        { nameAr: 'الذاكرة (RAM)', nameEn: 'Memory', types: ['DDR4', 'DDR5', 'LPDDR5X', 'ECC', 'HBM3'] },
                        { nameAr: 'التخزين', nameEn: 'Storage', types: ['NVMe SSD', 'SATA SSD', 'HDD', 'M.2', 'U.2'] },
                        { nameAr: 'اللوحة الأم', nameEn: 'Motherboard', standards: ['ATX', 'Micro-ATX', 'Mini-ITX', 'EATX'] },
                        { nameAr: 'مزود الطاقة', nameEn: 'PSU', certifications: ['80+ Bronze/Silver/Gold/Platinum/Titanium'] },
                        { nameAr: 'الشاشة', nameEn: 'Display', types: ['LCD', 'OLED', 'Mini-LED', 'IPS', '4K', '8K', 'HDR', '120Hz+'] }
                    ]
                },
                {
                    id: 'HW-02', nameAr: 'الخوادم ومراكز البيانات', nameEn: 'Servers & Data Centers',
                    types: [
                        { nameAr: 'خادم Rack', nameEn: 'Rack Server', makers: ['Dell PowerEdge', 'HPE ProLiant', 'Lenovo ThinkSystem', 'Supermicro'] },
                        { nameAr: 'خادم Blade', nameEn: 'Blade Server' },
                        { nameAr: 'خادم Tower', nameEn: 'Tower Server' },
                        { nameAr: 'خادم AI/GPU', nameEn: 'AI/GPU Server', examples: ['NVIDIA DGX', 'Dell XE9680', 'HPE Cray'] },
                        { nameAr: 'خادم تخزين (NAS/SAN)', nameEn: 'Storage Server' }
                    ],
                    dataCenterTiers: [
                        { tier: 'Tier I', uptime: '99.671%', description: 'أساسي' },
                        { tier: 'Tier II', uptime: '99.741%', description: 'مكونات مكررة' },
                        { tier: 'Tier III', uptime: '99.982%', description: 'صيانة متزامنة' },
                        { tier: 'Tier IV', uptime: '99.995%', description: 'تحمل أخطاء كامل' }
                    ]
                },
                {
                    id: 'HW-03', nameAr: 'الحوسبة الفائقة', nameEn: 'Supercomputers',
                    top: ['Frontier (AMD, أمريكا)', 'Aurora (Intel, أمريكا)', 'Fugaku (Fujitsu, اليابان)', 'LUMI (AMD, فنلندا)', 'Leonardo (NVIDIA, إيطاليا)'],
                    saudiSupercomputers: ['شاهين II (KAUST)', 'Aziz (جامعة الملك عبدالعزيز)'],
                    measure: 'FLOPS (عمليات نقطة عائمة في الثانية)',
                    currentPeak: 'Exascale (> 10^18 FLOPS)'
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٣. أجهزة الجوال والمحمولة — Mobile & Portable Devices
        // ══════════════════════════════════════════════════════════════════
        this.mobileDevices = {
            nameAr: 'أجهزة الجوال والمحمولة',
            nameEn: 'Mobile & Portable Devices',
            categories: [
                {
                    id: 'MOB-01', nameAr: 'الهواتف الذكية', nameEn: 'Smartphones',
                    ecosystems: [
                        { name: 'Apple iPhone', os: 'iOS', chipset: 'A-series / Apple Silicon' },
                        { name: 'Samsung Galaxy', os: 'Android (One UI)', chipset: 'Exynos / Snapdragon' },
                        { name: 'Google Pixel', os: 'Android (Stock)', chipset: 'Tensor' },
                        { name: 'Xiaomi / Redmi / POCO', os: 'Android (MIUI/HyperOS)' },
                        { name: 'OnePlus', os: 'Android (OxygenOS)' },
                        { name: 'Huawei', os: 'HarmonyOS', chipset: 'Kirin' },
                        { name: 'Oppo / Vivo / Realme', os: 'Android (ColorOS/FuntouchOS)' }
                    ],
                    components: ['SoC (System on Chip)', 'شاشة AMOLED/OLED', 'كاميرا (Main/Ultra-wide/Telephoto/ToF)', 'بطارية (Li-ion/Li-Po)', '5G Modem', 'NFC', 'بصمة (تحت الشاشة/جانبية)', 'Face ID / Iris']
                },
                {
                    id: 'MOB-02', nameAr: 'الأجهزة اللوحية', nameEn: 'Tablets',
                    devices: ['iPad Pro/Air/mini', 'Samsung Galaxy Tab S', 'Microsoft Surface Pro', 'Lenovo Tab', 'Amazon Fire']
                },
                {
                    id: 'MOB-03', nameAr: 'الأجهزة القابلة للارتداء', nameEn: 'Wearables',
                    types: ['ساعات ذكية (Apple Watch, Galaxy Watch, Garmin)', 'سماعات ذكية (AirPods, Galaxy Buds)', 'نظارات ذكية (Apple Vision Pro, Meta Quest, Google Glass)', 'أجهزة لياقة (Fitbit, Whoop)', 'خواتم ذكية (Oura, Galaxy Ring)']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٤. تقنيات السيارات والمركبات الذكية — Automotive Technology
        // ══════════════════════════════════════════════════════════════════
        this.automotiveTech = {
            nameAr: 'تقنيات السيارات والمركبات الذكية',
            nameEn: 'Automotive & Smart Vehicle Technology',
            domains: [
                {
                    id: 'AUTO-01', nameAr: 'أنظمة المعلومات والترفيه', nameEn: 'Infotainment Systems',
                    systems: [
                        { name: 'Apple CarPlay', integration: 'iPhone' },
                        { name: 'Android Auto', integration: 'Android' },
                        { name: 'Tesla Infotainment', os: 'Linux-based' },
                        { name: 'BMW iDrive', os: 'Linux-based' },
                        { name: 'Mercedes MBUX', ai: 'مساعد صوتي' },
                        { name: 'SYNC (Ford)', os: 'QNX → Android' }
                    ]
                },
                {
                    id: 'AUTO-02', nameAr: 'القيادة الذاتية', nameEn: 'Autonomous Driving',
                    levels: [
                        { level: 0, nameAr: 'بدون أتمتة', nameEn: 'No Automation' },
                        { level: 1, nameAr: 'مساعدة السائق', nameEn: 'Driver Assistance' },
                        { level: 2, nameAr: 'أتمتة جزئية', nameEn: 'Partial Automation', examples: ['Tesla Autopilot', 'GM Super Cruise'] },
                        { level: 3, nameAr: 'أتمتة مشروطة', nameEn: 'Conditional Automation', examples: ['Mercedes Drive Pilot'] },
                        { level: 4, nameAr: 'أتمتة عالية', nameEn: 'High Automation', examples: ['Waymo (مناطق محددة)'] },
                        { level: 5, nameAr: 'أتمتة كاملة', nameEn: 'Full Automation', status: 'لم يتحقق بعد' }
                    ],
                    sensors: ['LiDAR', 'Radar', 'Camera (Computer Vision)', 'Ultrasonic', 'GPS/GNSS', 'IMU'],
                    companies: ['Tesla', 'Waymo (Google)', 'Cruise (GM)', 'Mobileye (Intel)', 'NVIDIA DRIVE', 'Huawei ADS', 'Baidu Apollo']
                },
                {
                    id: 'AUTO-03', nameAr: 'السيارات الكهربائية', nameEn: 'Electric Vehicles (EV)',
                    types: ['BEV (كهربائي بالكامل)', 'HEV (هجين)', 'PHEV (هجين قابل للشحن)', 'FCEV (خلايا وقود هيدروجينية)'],
                    manufacturers: ['Tesla', 'BYD', 'Rivian', 'Lucid (سعودية الاستثمار)', 'NIO', 'BMW iX', 'Mercedes EQ', 'Hyundai Ioniq', 'Ceer (سعودية)'],
                    batteryTech: ['Lithium-ion', 'Solid-state (مستقبلي)', 'LFP', 'NMC', 'Silicon Anode'],
                    chargingStandards: ['CCS (Combined Charging System)', 'CHAdeMO', 'Tesla NACS', 'GB/T (صيني)']
                },
                {
                    id: 'AUTO-04', nameAr: 'أنظمة السيارات المدمجة', nameEn: 'Automotive Embedded Systems',
                    systems: ['ECU (وحدة تحكم إلكترونية)', 'ADAS (أنظمة مساعدة السائق المتقدمة)', 'OBD-II (تشخيص)', 'CAN Bus (شبكة اتصال داخلية)', 'V2X (اتصال سيارة بالبيئة)', 'OTA Updates (تحديثات عبر الهواء)'],
                    osForCars: ['QNX', 'AUTOSAR', 'Android Automotive OS', 'AGL (Automotive Grade Linux)', 'VxWorks']
                },
                {
                    id: 'AUTO-05', nameAr: 'مبادرات سعودية', nameEn: 'Saudi Automotive Initiatives',
                    projects: [
                        { name: 'Ceer', description: 'أول علامة سيارات كهربائية سعودية (بالشراكة مع Foxconn و BMW)', location: 'مدينة الملك عبدالله الاقتصادية' },
                        { name: 'Lucid Motors', description: 'مصنع السيارات الكهربائية الفاخرة في جدة (استثمار PIF)' },
                        { name: 'NEOM Mobility', description: 'نظام نقل ذاتي القيادة في نيوم (The Line)' }
                    ]
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٥. تقنيات الصناعة — Industrial Technology
        // ══════════════════════════════════════════════════════════════════
        this.industrialTech = {
            nameAr: 'تقنيات الصناعة',
            nameEn: 'Industrial Technology',
            domains: [
                {
                    id: 'IND-01', nameAr: 'أنظمة التحكم الصناعي', nameEn: 'Industrial Control Systems (ICS)',
                    systems: ['PLC (متحكم منطقي قابل للبرمجة)', 'SCADA (نظام إشراف وتحكم)', 'DCS (نظام تحكم موزع)', 'HMI (واجهة الإنسان والآلة)', 'RTU (وحدة طرفية بعيدة)'],
                    protocols: ['Modbus', 'PROFINET', 'EtherNet/IP', 'OPC UA', 'MQTT', 'BACnet'],
                    manufacturers: ['Siemens', 'ABB', 'Rockwell/Allen-Bradley', 'Schneider Electric', 'Emerson', 'Honeywell', 'Mitsubishi Electric']
                },
                {
                    id: 'IND-02', nameAr: 'الصناعة ٤.٠ والمصنع الذكي', nameEn: 'Industry 4.0 & Smart Factory',
                    pillars: ['IoT صناعي (IIoT)', 'التوأم الرقمي (Digital Twin)', 'الذكاء الاصطناعي في التصنيع', 'الروبوتات التعاونية (Cobots)', 'الطباعة ثلاثية الأبعاد', 'الحوسبة السحابية/الحافة', 'الواقع المعزز للصيانة', 'Blockchain لسلاسل الإمداد', 'Big Data Analytics']
                },
                {
                    id: 'IND-03', nameAr: 'أنظمة إدارة التصنيع', nameEn: 'Manufacturing Management Systems',
                    systems: [
                        { nameAr: 'نظام تنفيذ التصنيع', nameEn: 'MES (Manufacturing Execution System)' },
                        { nameAr: 'تخطيط موارد المؤسسة', nameEn: 'ERP', examples: ['SAP S/4HANA', 'Oracle ERP Cloud', 'Microsoft Dynamics 365'] },
                        { nameAr: 'إدارة دورة حياة المنتج', nameEn: 'PLM', examples: ['Siemens Teamcenter', 'PTC Windchill', 'Dassault ENOVIA'] },
                        { nameAr: 'التصميم بمساعدة الحاسب', nameEn: 'CAD', examples: ['AutoCAD', 'SolidWorks', 'CATIA', 'Fusion 360', 'NX'] },
                        { nameAr: 'إدارة الجودة', nameEn: 'QMS' },
                        { nameAr: 'إدارة المستودعات', nameEn: 'WMS' },
                        { nameAr: 'إدارة الصيانة', nameEn: 'CMMS' }
                    ]
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٦. البرمجيات ولغات البرمجة — Software & Programming
        // ══════════════════════════════════════════════════════════════════
        this.software = {
            nameAr: 'البرمجيات ولغات البرمجة',
            nameEn: 'Software & Programming Languages',
            programmingLanguages: [
                { name: 'Python', paradigm: 'متعدد', use: 'AI/ML, Web, Data, Automation', rank: 1 },
                { name: 'JavaScript', paradigm: 'متعدد', use: 'Web (Frontend+Backend), Mobile', rank: 2 },
                { name: 'TypeScript', paradigm: 'كائني/وظيفي', use: 'Web (Full-Stack)', rank: 3 },
                { name: 'Java', paradigm: 'كائني', use: 'Enterprise, Android, Backend', rank: 4 },
                { name: 'C/C++', paradigm: 'إجرائي/كائني', use: 'أنظمة, ألعاب, أنظمة مدمجة, أداء عالي', rank: 5 },
                { name: 'C#', paradigm: 'كائني', use: '.NET, Unity Games, Enterprise', rank: 6 },
                { name: 'Go', paradigm: 'إجرائي/متزامن', use: 'Cloud, Microservices, DevOps', rank: 7 },
                { name: 'Rust', paradigm: 'متعدد', use: 'أنظمة آمنة, WebAssembly, أداء عالي', rank: 8 },
                { name: 'Swift', paradigm: 'متعدد', use: 'iOS/macOS (Apple)', rank: 9 },
                { name: 'Kotlin', paradigm: 'متعدد', use: 'Android, Backend (JVM)', rank: 10 },
                { name: 'PHP', paradigm: 'إجرائي/كائني', use: 'Web Backend (WordPress, Laravel)' },
                { name: 'Ruby', paradigm: 'كائني', use: 'Web (Rails)' },
                { name: 'SQL', paradigm: 'تصريحي', use: 'قواعد بيانات' },
                { name: 'R', paradigm: 'وظيفي', use: 'إحصاء وعلم بيانات' },
                { name: 'Dart', paradigm: 'كائني', use: 'Flutter (تطبيقات متعددة المنصات)' },
                { name: 'Scala', paradigm: 'وظيفي/كائني', use: 'Big Data (Spark)' },
                { name: 'Lua', paradigm: 'إجرائي', use: 'ألعاب, أنظمة مدمجة' },
                { name: 'Assembly', paradigm: 'منخفض المستوى', use: 'أنظمة تشغيل, firmware, أمن' },
                { name: 'Solidity', paradigm: 'كائني', use: 'Blockchain/Smart Contracts' },
                { name: 'MATLAB', paradigm: 'مصفوفات', use: 'هندسة, محاكاة, تحكم' }
            ],
            databases: [
                { category: 'علائقية (SQL)', examples: ['PostgreSQL', 'MySQL', 'MariaDB', 'Oracle DB', 'SQL Server', 'SQLite'] },
                { category: 'NoSQL مستندية', examples: ['MongoDB', 'CouchDB', 'Firestore'] },
                { category: 'NoSQL مفتاح-قيمة', examples: ['Redis', 'DynamoDB', 'Memcached'] },
                { category: 'NoSQL عمودية', examples: ['Cassandra', 'HBase', 'ScyllaDB'] },
                { category: 'Graph', examples: ['Neo4j', 'ArangoDB', 'Amazon Neptune'] },
                { category: 'Time-Series', examples: ['InfluxDB', 'TimescaleDB', 'Prometheus'] },
                { category: 'بحث نصي', examples: ['Elasticsearch', 'OpenSearch', 'Solr'] },
                { category: 'Vector (AI)', examples: ['Pinecone', 'Weaviate', 'Milvus', 'Chroma', 'pgvector'] }
            ],
            webFrameworks: {
                frontend: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'SolidJS', 'Astro', 'HTMX'],
                backend: ['Express.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails', 'NestJS', 'Hono'],
                mobile: ['React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'Kotlin Multiplatform', '.NET MAUI']
            },
            devOpsTools: ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'ArgoCD', 'Prometheus', 'Grafana', 'ELK Stack']
        };

        // ══════════════════════════════════════════════════════════════════
        // ٧. التقنيات الناشئة والمستقبلية — Emerging & Future Tech
        // ══════════════════════════════════════════════════════════════════
        this.emergingTech = {
            nameAr: 'التقنيات الناشئة والمستقبلية',
            nameEn: 'Emerging & Future Technologies',
            technologies: [
                { nameAr: 'الحوسبة الكمية', nameEn: 'Quantum Computing', leaders: ['IBM', 'Google', 'Microsoft', 'IonQ', 'Rigetti'], status: 'مبكرة' },
                { nameAr: 'الذكاء الاصطناعي التوليدي', nameEn: 'Generative AI', leaders: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Meta AI', 'Mistral'], status: 'متقدمة' },
                { nameAr: 'الحوسبة العصبية', nameEn: 'Neuromorphic Computing', leaders: ['Intel Loihi', 'IBM TrueNorth'], status: 'بحثية' },
                { nameAr: 'حوسبة DNA', nameEn: 'DNA Computing', status: 'بحثية تجريبية' },
                { nameAr: 'الواقع المكاني', nameEn: 'Spatial Computing', leaders: ['Apple Vision Pro', 'Meta Quest'], status: 'مبكرة' },
                { nameAr: 'واجهة الدماغ-الحاسب', nameEn: 'Brain-Computer Interface (BCI)', leaders: ['Neuralink', 'Synchron'], status: 'تجريبية', shariaNote: 'تخضع لضوابط شرعية صارمة في الزراعة والاستخدام' },
                { nameAr: 'الاتصالات 6G', nameEn: '6G Communications', timeline: '2030+', speed: '> 1 Tbps' },
                { nameAr: 'الحوسبة الضبابية', nameEn: 'Fog Computing', status: 'نامية' },
                { nameAr: 'التوأم الرقمي الشامل', nameEn: 'Comprehensive Digital Twin', applications: ['مدن', 'مصانع', 'جسم الإنسان', 'أرض كاملة'] },
                { nameAr: 'الروبوتات الإنسانية', nameEn: 'Humanoid Robots', leaders: ['Tesla Optimus', 'Boston Dynamics Atlas', 'Figure AI', 'Unitree'] }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٨. الضوابط الشرعية للتقنية
        // ══════════════════════════════════════════════════════════════════
        this.shariaGuidelines = {
            principles: [
                { principle: 'التقنية وسيلة لا غاية', application: 'استخدام التقنية لتحقيق مصالح البشرية لا لإضرارها' },
                { principle: 'الإتقان', evidence: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', application: 'جودة البرمجيات والأنظمة' },
                { principle: 'حفظ الخصوصية', evidence: 'وَلَا تَجَسَّسُوا — الحجرات ١٢', application: 'حماية بيانات المستخدمين' },
                { principle: 'عدم الإسراف', evidence: 'وَلَا تُسْرِفُوا — الأعراف ٣١', application: 'ترشيد استهلاك الطاقة والموارد التقنية' },
                { principle: 'النفع للناس', evidence: 'خير الناس أنفعهم للناس', application: 'تطوير تقنيات تخدم البشرية' },
                { principle: 'تحريم الضرر', evidence: 'لا ضرر ولا ضرار', application: 'تحريم تطوير تقنيات للإضرار أو التجسس المحرم' },
                { principle: 'الملكية الفكرية', application: 'حماية حقوق المبرمجين والمطورين وتحريم القرصنة' },
                { principle: 'أمانة البيانات', evidence: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ — النساء ٥٨', application: 'الأمانة في معالجة البيانات' }
            ],
            prohibited: [
                'استخدام التقنية في التجسس المحرم',
                'تطوير برمجيات للقمار أو المحرمات',
                'نشر المحتوى المخل أو المحرم',
                'القرصنة والاختراق غير المشروع',
                'الاحتيال الإلكتروني',
                'تطوير أسلحة ذاتية بدون رقابة بشرية',
                'إنتاج Deepfakes للتضليل والإفساد',
                'بيع بيانات المستخدمين بدون إذن'
            ]
        };
    }

    getDashboard() {
        const osCount = this.operatingSystems.categories.reduce((s, c) => {
            if (c.systems) return s + c.systems.length;
            if (c.distributions) return s + c.distributions.reduce((ss, d) => ss + d.distros.length, 0);
            return s;
        }, 0);

        return {
            engine: this.name, version: this.version, owner: this.owner, activatedAt: this.activatedAt,
            summary: {
                osCategories: this.operatingSystems.categories.length,
                totalOSSystems: osCount,
                hardwareCategories: this.computerHardware.categories.length,
                mobileCategories: this.mobileDevices.categories.length,
                automotiveDomains: this.automotiveTech.domains.length,
                industrialDomains: this.industrialTech.domains.length,
                programmingLanguages: this.software.programmingLanguages.length,
                databaseCategories: this.software.databases.length,
                emergingTechnologies: this.emergingTech.technologies.length,
                shariaPrinciples: this.shariaGuidelines.principles.length,
                quranReferences: this.quranReferences.length
            },
            quranReferences: this.quranReferences,
            operatingSystems: this.operatingSystems,
            computerHardware: this.computerHardware,
            mobileDevices: this.mobileDevices,
            automotiveTech: this.automotiveTech,
            industrialTech: this.industrialTech,
            software: this.software,
            emergingTech: this.emergingTech,
            shariaGuidelines: this.shariaGuidelines
        };
    }
}

module.exports = SheikhaTechComputingEngine;
