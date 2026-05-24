/**
 * بسم الله الرحمن الرحيم
 * SHEIKHA DASHBOARD ENGINE — منظومة لوحة التحكم الشاملة
 * المالك: سلمان أحمد بن سلمان الراجح
 * "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ" الذاريات 56
 */
'use strict';
class SheikhaDashboardEngine {
    constructor() {
        this.name = 'Sheikha Dashboard Engine';
        this.nameAr = 'منظومة لوحة تحكم شيخة الشاملة';
        this.nameEn = 'Sheikha Command & Control Dashboard';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }
    _init() {
        this.quranReferences = [
            {ayah:'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',surah:'الذاريات',num:56,topic:'غاية المنظومة'},
            {ayah:'وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ كِتَابًا',surah:'النبأ',num:29,topic:'الإحصاء والتوثيق'},
            {ayah:'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',surah:'القمر',num:49,topic:'النظام والترتيب'},
            {ayah:'وَأَنَّ إِلَى رَبِّكَ الْمُنتَهَى',surah:'النجم',num:42,topic:'المرجعية'},
            {ayah:'فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ',surah:'القارعة',num:6,topic:'الميزان والتقييم'}
        ];

        // ====== لوحات التحكم الفرعية ======
        this.dashboardPanels = [
            // === الطبقة 1: الشريعة والأساس ===
            {id:'PNL-001',nameAr:'لوحة الشريعة الإسلامية',nameEn:'Sharia Foundation Panel',
             layer:'الشريعة والأساس',engineRef:'sheikha-sharia-engine',
             widgets:[
                {type:'counter',label:'آيات قرآنية مرجعية',dataKey:'quranVerses'},
                {type:'counter',label:'أحاديث نبوية مرجعية',dataKey:'hadithRefs'},
                {type:'gauge',label:'نسبة الامتثال الشرعي',dataKey:'shariaCompliance',unit:'%'},
                {type:'list',label:'أحكام شرعية نشطة',dataKey:'activeRulings'},
                {type:'chart',label:'توزيع الأحكام حسب الفقه',dataKey:'rulingsBySchool'},
                {type:'alert',label:'تنبيهات شرعية',dataKey:'shariaAlerts'}
             ]},
            // === الطبقة 2: الحوكمة والقانون ===
            {id:'PNL-002',nameAr:'لوحة الحوكمة والقانون',nameEn:'Governance & Law Panel',
             layer:'الحوكمة والقانون',engineRef:'sheikha-legal-engine',
             widgets:[
                {type:'counter',label:'قوانين سعودية',dataKey:'saudiLawsCount'},
                {type:'counter',label:'معاهدات دولية',dataKey:'treatiesCount'},
                {type:'counter',label:'منظمات دولية',dataKey:'orgsCount'},
                {type:'status',label:'حالة الامتثال القانوني',dataKey:'legalCompliance'},
                {type:'chart',label:'توزيع القوانين حسب المجال',dataKey:'lawsByDomain'},
                {type:'timeline',label:'آخر التحديثات القانونية',dataKey:'legalUpdates'}
             ]},
            // === الطبقة 3: العلوم والابتكار ===
            {id:'PNL-003',nameAr:'لوحة العلوم والابتكار',nameEn:'Sciences & Innovation Panel',
             layer:'العلوم والابتكار',engineRef:'sheikha-sciences-engine',
             widgets:[
                {type:'counter',label:'فروع علمية',dataKey:'scienceBranches'},
                {type:'counter',label:'مختبرات نشطة',dataKey:'activeLabs'},
                {type:'counter',label:'أبحاث جارية',dataKey:'ongoingResearch'},
                {type:'counter',label:'براءات اختراع',dataKey:'patents'},
                {type:'chart',label:'توزيع الأبحاث حسب المجال',dataKey:'researchByField'},
                {type:'progress',label:'تقدم مشاريع الابتكار',dataKey:'innovationProgress'}
             ]},
            // === الطبقة 4: التقنية والحاسب ===
            {id:'PNL-004',nameAr:'لوحة التقنية والحاسب',nameEn:'Technology & Computing Panel',
             layer:'التقنية والحاسب',engineRef:'sheikha-tech-computing-engine',
             widgets:[
                {type:'counter',label:'أنظمة تشغيل',dataKey:'osCount'},
                {type:'counter',label:'لغات برمجة',dataKey:'progLangs'},
                {type:'counter',label:'تقنيات ناشئة',dataKey:'emergingTech'},
                {type:'status',label:'حالة البنية التحتية',dataKey:'infraStatus'},
                {type:'gauge',label:'استخدام الموارد',dataKey:'resourceUsage',unit:'%'},
                {type:'chart',label:'توزيع التقنيات',dataKey:'techDistribution'}
             ]},
            // === الطبقة 5: الاقتصاد والمالية ===
            {id:'PNL-005',nameAr:'لوحة الاقتصاد والمالية',nameEn:'Economy & Finance Panel',
             layer:'الاقتصاد والمالية',engineRef:'sheikha-economics-engine',
             widgets:[
                {type:'currency',label:'سعر الريال / الدولار',dataKey:'sarUsd'},
                {type:'counter',label:'معاملات مالية اليوم',dataKey:'todayTransactions'},
                {type:'gauge',label:'مؤشر السوق',dataKey:'marketIndex'},
                {type:'chart',label:'حركة الأسعار',dataKey:'priceMovement'},
                {type:'counter',label:'حسابات زكاة نشطة',dataKey:'zakatAccounts'},
                {type:'alert',label:'تنبيهات مالية',dataKey:'financeAlerts'}
             ]},
            // === الطبقة 6: التجارة والسوق ===
            {id:'PNL-006',nameAr:'لوحة التجارة والسوق',nameEn:'Trade & Market Panel',
             layer:'التجارة والسوق',engineRef:'sheikha-trade-engine',
             widgets:[
                {type:'counter',label:'منتجات نشطة',dataKey:'activeProducts'},
                {type:'counter',label:'طلبات اليوم',dataKey:'todayOrders'},
                {type:'revenue',label:'إيرادات اليوم',dataKey:'todayRevenue',unit:'SAR'},
                {type:'chart',label:'مبيعات الأسبوع',dataKey:'weekSales'},
                {type:'gauge',label:'رضا العملاء',dataKey:'customerSatisfaction',unit:'%'},
                {type:'map',label:'توزيع المبيعات الجغرافي',dataKey:'salesMap'}
             ]},
            // === الطبقة 7: الصناعة والإنتاج ===
            {id:'PNL-007',nameAr:'لوحة الصناعة والإنتاج',nameEn:'Industry & Production Panel',
             layer:'الصناعة والإنتاج',engineRef:'sheikha-industry-engine',
             widgets:[
                {type:'counter',label:'مصانع نشطة',dataKey:'activeFactories'},
                {type:'gauge',label:'كفاءة الإنتاج',dataKey:'productionEfficiency',unit:'%'},
                {type:'gauge',label:'جودة المنتجات',dataKey:'productQuality',unit:'%'},
                {type:'counter',label:'شهادات جودة',dataKey:'qualityCerts'},
                {type:'chart',label:'إنتاج شهري',dataKey:'monthlyProduction'},
                {type:'alert',label:'تنبيهات الإنتاج',dataKey:'productionAlerts'}
             ]},
            // === الطبقة 8: سلسلة الإمداد ===
            {id:'PNL-008',nameAr:'لوحة سلسلة الإمداد واللوجستيات',nameEn:'Supply Chain & Logistics Panel',
             layer:'سلسلة الإمداد',engineRef:'sheikha-supply-chain-engine',
             widgets:[
                {type:'counter',label:'شحنات نشطة',dataKey:'activeShipments'},
                {type:'gauge',label:'كفاءة التسليم',dataKey:'deliveryEfficiency',unit:'%'},
                {type:'map',label:'تتبع الشحنات',dataKey:'shipmentTracking'},
                {type:'counter',label:'مستودعات',dataKey:'warehouses'},
                {type:'chart',label:'حركة المخزون',dataKey:'inventoryMovement'},
                {type:'alert',label:'تنبيهات المخزون',dataKey:'inventoryAlerts'}
             ]},
            // === الطبقة 9: الموارد والفضاء ===
            {id:'PNL-009',nameAr:'لوحة الموارد والطاقة والفضاء',nameEn:'Resources & Cosmos Panel',
             layer:'الموارد والفضاء',engineRef:'sheikha-resources-engine',
             widgets:[
                {type:'gauge',label:'إنتاج الطاقة',dataKey:'energyProduction',unit:'MW'},
                {type:'gauge',label:'طاقة متجددة',dataKey:'renewableEnergy',unit:'%'},
                {type:'counter',label:'أقمار صناعية نشطة',dataKey:'activeSatellites'},
                {type:'counter',label:'مهمات فضائية',dataKey:'spaceMissions'},
                {type:'chart',label:'استهلاك الطاقة',dataKey:'energyConsumption'},
                {type:'status',label:'حالة المحطات',dataKey:'stationsStatus'}
             ]},
            // === الطبقة 10: المجتمع والتجربة ===
            {id:'PNL-010',nameAr:'لوحة المجتمع والتجربة',nameEn:'Community & Experience Panel',
             layer:'المجتمع والتجربة',engineRef:'sheikha-community-engine',
             widgets:[
                {type:'counter',label:'مجتمعات نشطة',dataKey:'activeCommunities'},
                {type:'counter',label:'أعضاء فاعلون',dataKey:'activeMembers'},
                {type:'gauge',label:'رضا المجتمع',dataKey:'communitySatisfaction',unit:'%'},
                {type:'chart',label:'نمو المجتمعات',dataKey:'communityGrowth'},
                {type:'counter',label:'فعاليات هذا الشهر',dataKey:'monthEvents'},
                {type:'list',label:'أحدث النشاطات',dataKey:'recentActivities'}
             ]},
            // === الطبقة 11: التشغيل والمراقبة ===
            {id:'PNL-011',nameAr:'لوحة التشغيل والمراقبة',nameEn:'Operations & Monitoring Panel',
             layer:'التشغيل والمراقبة',engineRef:'sheikha-ops-systems-engine',
             widgets:[
                {type:'counter',label:'أنظمة تشغيلية',dataKey:'operationalSystems'},
                {type:'gauge',label:'وقت التشغيل',dataKey:'uptime',unit:'%'},
                {type:'counter',label:'قطاعات نشطة',dataKey:'activeSectors'},
                {type:'status',label:'حالة الأنظمة',dataKey:'systemsHealth'},
                {type:'chart',label:'أداء الأنظمة',dataKey:'systemsPerformance'},
                {type:'alert',label:'تنبيهات تشغيلية',dataKey:'opsAlerts'}
             ]},
            // === الطبقة 12: الجودة والتميز ===
            {id:'PNL-012',nameAr:'لوحة الجودة والتميز',nameEn:'Quality & Excellence Panel',
             layer:'الجودة والتميز',engineRef:'sheikha-quality-engine',
             widgets:[
                {type:'gauge',label:'مؤشر النضج SMI',dataKey:'smiScore',unit:'/100'},
                {type:'gauge',label:'جودة شاملة',dataKey:'overallQuality',unit:'%'},
                {type:'counter',label:'شهادات جودة',dataKey:'certifications'},
                {type:'chart',label:'تحسينات الشهر',dataKey:'monthlyImprovements'},
                {type:'progress',label:'أهداف الجودة',dataKey:'qualityGoals'},
                {type:'list',label:'توصيات التحسين',dataKey:'improvements'}
             ]},
            // === الطبقة 13: الفئات والتسويق ===
            {id:'PNL-013',nameAr:'لوحة الفئات والتسويق',nameEn:'Segments & Marketing Panel',
             layer:'الفئات والتسويق',engineRef:'sheikha-segments-engine',
             widgets:[
                {type:'counter',label:'فئات مستخدمين',dataKey:'userSegments'},
                {type:'counter',label:'قنوات تسويق',dataKey:'marketingChannels'},
                {type:'chart',label:'توزيع المستخدمين',dataKey:'userDistribution'},
                {type:'gauge',label:'فعالية التسويق',dataKey:'marketingEffectiveness',unit:'%'},
                {type:'counter',label:'حملات نشطة',dataKey:'activeCampaigns'},
                {type:'chart',label:'أداء القنوات',dataKey:'channelPerformance'}
             ]},
            // === الطبقة 14: نظام التشغيل شيخة ===
            {id:'PNL-014',nameAr:'لوحة نظام التشغيل شيخة',nameEn:'Sheikha OS Panel',
             layer:'نظام التشغيل',engineRef:'sheikha-os-engine',
             widgets:[
                {type:'counter',label:'إصدارات نشطة',dataKey:'activeEditions'},
                {type:'counter',label:'تطبيقات مدمجة',dataKey:'builtInApps'},
                {type:'gauge',label:'استقرار النظام',dataKey:'systemStability',unit:'%'},
                {type:'counter',label:'أجهزة متصلة',dataKey:'connectedDevices'},
                {type:'progress',label:'خارطة الطريق',dataKey:'roadmapProgress'},
                {type:'status',label:'حالة النواة',dataKey:'kernelStatus'}
             ]},
            // === الطبقة 15: المتصفح ===
            {id:'PNL-015',nameAr:'لوحة متصفح شيخة',nameEn:'Sheikha Browser Panel',
             layer:'المتصفح',engineRef:'sheikha-browser-engine',
             widgets:[
                {type:'counter',label:'ميزات أساسية',dataKey:'coreFeatures'},
                {type:'counter',label:'طبقات أمان',dataKey:'securityLayers'},
                {type:'counter',label:'منصات مدعومة',dataKey:'platforms'},
                {type:'gauge',label:'أداء المتصفح',dataKey:'browserPerformance',unit:'ms'},
                {type:'counter',label:'إضافات مثبتة',dataKey:'installedExtensions'},
                {type:'status',label:'حالة فلتر المحتوى',dataKey:'contentFilterStatus'}
             ]},
            // === الطبقة 16: التطوير والإتقان ===
            {id:'PNL-016',nameAr:'لوحة التطوير والإتقان',nameEn:'DevOps & Excellence Panel',
             layer:'التطوير والإتقان',engineRef:'sheikha-devops-engine',
             widgets:[
                {type:'counter',label:'مراحل CI/CD',dataKey:'cicdStages'},
                {type:'gauge',label:'تغطية الاختبارات',dataKey:'testCoverage',unit:'%'},
                {type:'gauge',label:'وقت التشغيل',dataKey:'uptime',unit:'%'},
                {type:'counter',label:'نشرات اليوم',dataKey:'todayDeployments'},
                {type:'chart',label:'معدل النشر الأسبوعي',dataKey:'weeklyDeployments'},
                {type:'alert',label:'تنبيهات البناء',dataKey:'buildAlerts'}
             ]},
            // === الطبقة 17: الرزنامة والتزامن ===
            {id:'PNL-017',nameAr:'لوحة الرزنامة والتزامن',nameEn:'Calendar & Sync Panel',
             layer:'الرزنامة والتزامن',engineRef:'sheikha-calendar-engine',
             widgets:[
                {type:'date',label:'التاريخ الهجري',dataKey:'hijriDate'},
                {type:'date',label:'التاريخ الميلادي',dataKey:'gregorianDate'},
                {type:'prayer',label:'أوقات الصلاة',dataKey:'prayerTimes'},
                {type:'counter',label:'أحداث اليوم',dataKey:'todayEvents'},
                {type:'list',label:'فعاليات قادمة',dataKey:'upcomingEvents'},
                {type:'timeline',label:'الجدول الزمني',dataKey:'timeline'}
             ]},
            // === الطبقة 18: الفهرسة والتوثيق ===
            {id:'PNL-018',nameAr:'لوحة الفهرسة والتوثيق',nameEn:'Catalog & Documentation Panel',
             layer:'الفهرسة والتوثيق',engineRef:'sheikha-master-catalog',
             widgets:[
                {type:'counter',label:'إجمالي المحركات',dataKey:'totalEngines'},
                {type:'counter',label:'طبقات معمارية',dataKey:'architecturalLayers'},
                {type:'gauge',label:'اكتمال التوثيق',dataKey:'documentationCompleteness',unit:'%'},
                {type:'status',label:'حالة المحركات',dataKey:'enginesStatus'},
                {type:'chart',label:'محركات حسب الطبقة',dataKey:'enginesByLayer'},
                {type:'list',label:'آخر التحديثات',dataKey:'recentUpdates'}
             ]}
        ];

        // ====== التخطيط والعرض ======
        this.layout = {
            nameAr:'تخطيط لوحة التحكم',nameEn:'Dashboard Layout',
            views:[
                {id:'VIEW-01',nameAr:'نظرة عامة تنفيذية',nameEn:'Executive Overview',
                 desc:'عرض ملخص لكل المنظومات بمؤشرات رئيسية',
                 panels:['PNL-001','PNL-005','PNL-006','PNL-011','PNL-012']},
                {id:'VIEW-02',nameAr:'العمليات والتشغيل',nameEn:'Operations View',
                 desc:'مراقبة حية لكل الأنظمة التشغيلية',
                 panels:['PNL-004','PNL-007','PNL-008','PNL-011','PNL-016']},
                {id:'VIEW-03',nameAr:'المالية والتجارة',nameEn:'Finance & Trade View',
                 desc:'مؤشرات مالية وتجارية مباشرة',
                 panels:['PNL-005','PNL-006','PNL-008','PNL-013']},
                {id:'VIEW-04',nameAr:'البحث والابتكار',nameEn:'Research & Innovation View',
                 desc:'حالة البحث العلمي ومشاريع الابتكار',
                 panels:['PNL-003','PNL-004','PNL-009']},
                {id:'VIEW-05',nameAr:'المجتمع والفئات',nameEn:'Community & Segments View',
                 desc:'نشاط المجتمعات وتحليل الفئات المستهدفة',
                 panels:['PNL-010','PNL-013','PNL-017']},
                {id:'VIEW-06',nameAr:'الأمان والامتثال',nameEn:'Security & Compliance View',
                 desc:'حالة الأمان والامتثال الشرعي والقانوني',
                 panels:['PNL-001','PNL-002','PNL-012','PNL-015']},
                {id:'VIEW-07',nameAr:'التقنية والتطوير',nameEn:'Tech & DevOps View',
                 desc:'حالة البنية التحتية وعمليات التطوير',
                 panels:['PNL-004','PNL-014','PNL-015','PNL-016']},
                {id:'VIEW-08',nameAr:'لوحة شاملة',nameEn:'Full Dashboard',
                 desc:'عرض كل اللوحات معاً',
                 panels:this.dashboardPanels ? this.dashboardPanels.map(p=>p.id) : []}
            ],
            themes:[
                {id:'THEME-01',nameAr:'فاتح كلاسيكي',nameEn:'Classic Light',primary:'#1a5276',secondary:'#2ecc71',bg:'#f8f9fa'},
                {id:'THEME-02',nameAr:'داكن عصري',nameEn:'Modern Dark',primary:'#00b894',secondary:'#6c5ce7',bg:'#1a1a2e'},
                {id:'THEME-03',nameAr:'إسلامي ذهبي',nameEn:'Islamic Gold',primary:'#c9a42c',secondary:'#2d5016',bg:'#faf7f0'},
                {id:'THEME-04',nameAr:'سعودي أخضر',nameEn:'Saudi Green',primary:'#006c35',secondary:'#c9a42c',bg:'#f0f8f0'},
                {id:'THEME-05',nameAr:'عالي التباين',nameEn:'High Contrast',primary:'#ffffff',secondary:'#ffcc00',bg:'#000000'}
            ]
        };

        // ====== الوصول والأمان ======
        this.accessControl = {
            nameAr:'التحكم بالوصول',nameEn:'Access Control',
            roles:[
                {id:'ROLE-01',nameAr:'المالك',nameEn:'Owner',permissions:'كامل — كل الصلاحيات',user:'سلمان أحمد بن سلمان الراجح'},
                {id:'ROLE-02',nameAr:'مدير تنفيذي',nameEn:'CEO',permissions:'عرض كل اللوحات + تقارير + إعدادات'},
                {id:'ROLE-03',nameAr:'مدير قسم',nameEn:'Department Manager',permissions:'عرض لوحات القسم + تقارير القسم'},
                {id:'ROLE-04',nameAr:'محلل',nameEn:'Analyst',permissions:'عرض + تحليل + تقارير (بدون تعديل)'},
                {id:'ROLE-05',nameAr:'مراقب',nameEn:'Monitor',permissions:'عرض فقط — مراقبة حية'},
                {id:'ROLE-06',nameAr:'مراجع شرعي',nameEn:'Sharia Reviewer',permissions:'مراجعة الامتثال الشرعي + تنبيهات + توصيات'},
                {id:'ROLE-07',nameAr:'مطور',nameEn:'Developer',permissions:'عرض لوحات DevOps + APIs + سجلات'},
                {id:'ROLE-08',nameAr:'ضيف',nameEn:'Guest',permissions:'عرض محدود — لوحة عامة فقط'}
            ],
            security:['مصادقة ثنائية (2FA)','تسجيل دخول بيومتري','جلسة مؤقتة (Session Timeout)','تشفير طرف لطرف','سجل تدقيق كامل (Audit Log)','حظر IP مشبوه','إشعار دخول غير معتاد']
        };

        // ====== الإشعارات والتنبيهات ======
        this.notifications = {
            nameAr:'نظام الإشعارات',nameEn:'Notification System',
            channels:['إشعار داخلي (In-App)','البريد الإلكتروني','SMS','WhatsApp','تطبيق شيخة','Slack/Teams','إشعار صوتي','أذان (أوقات الصلاة)'],
            types:[
                {type:'critical',nameAr:'حرج',nameEn:'Critical',color:'#e74c3c',sound:true,desc:'عطل نظام / اختراق أمني / خسارة مالية'},
                {type:'warning',nameAr:'تحذير',nameEn:'Warning',color:'#f39c12',sound:true,desc:'أداء منخفض / قرب الحد الأقصى'},
                {type:'info',nameAr:'معلومة',nameEn:'Info',color:'#3498db',sound:false,desc:'تحديث / تقرير جاهز / إحصائية'},
                {type:'success',nameAr:'نجاح',nameEn:'Success',color:'#27ae60',sound:false,desc:'عملية ناجحة / هدف محقق'},
                {type:'sharia',nameAr:'شرعي',nameEn:'Sharia',color:'#c9a42c',sound:true,desc:'تنبيه شرعي / وقت صلاة / تذكير ديني'},
                {type:'prayer',nameAr:'صلاة',nameEn:'Prayer',color:'#2d5016',sound:true,desc:'أذان / إقامة / تذكير صلاة'}
            ],
            smartRules:[
                'تجميع الإشعارات المتشابهة',
                'عدم الإزعاج وقت الصلاة (إلا التنبيه الشرعي)',
                'تصعيد تلقائي إذا لم يُستجب خلال 15 دقيقة',
                'ملخص يومي بالإنجازات والتحديات',
                'تقرير أسبوعي شامل'
            ]
        };

        // ====== التقارير ======
        this.reports = {
            nameAr:'نظام التقارير',nameEn:'Reporting System',
            types:[
                {id:'RPT-01',nameAr:'تقرير تنفيذي يومي',nameEn:'Daily Executive Report',freq:'يومي',sections:['ملخص عام','مؤشرات رئيسية','تنبيهات','إنجازات','تحديات']},
                {id:'RPT-02',nameAr:'تقرير مالي أسبوعي',nameEn:'Weekly Financial Report',freq:'أسبوعي',sections:['إيرادات','مصروفات','أرباح','زكاة','مقارنة']},
                {id:'RPT-03',nameAr:'تقرير عمليات شهري',nameEn:'Monthly Operations Report',freq:'شهري',sections:['أداء الأنظمة','وقت التشغيل','حوادث','تحسينات']},
                {id:'RPT-04',nameAr:'تقرير امتثال ربعي',nameEn:'Quarterly Compliance Report',freq:'ربع سنوي',sections:['امتثال شرعي','امتثال قانوني','تدقيق أمني','توصيات']},
                {id:'RPT-05',nameAr:'تقرير نضج سنوي',nameEn:'Annual Maturity Report',freq:'سنوي',sections:['SMI Score','إنجازات السنة','خطة العام القادم','مقارنة']},
                {id:'RPT-06',nameAr:'تقرير فوري',nameEn:'Real-time Report',freq:'لحظي',sections:['حالة مباشرة','مقاييس لحظية','تنبيهات نشطة']}
            ],
            formats:['PDF','Excel','Word','HTML تفاعلي','JSON API','Power BI','عرض تقديمي'],
            distribution:['بريد إلكتروني تلقائي','رابط مشترك','طباعة','تنزيل','API']
        };

        // ====== البحث والتحليل ======
        this.analytics = {
            nameAr:'التحليلات المتقدمة',nameEn:'Advanced Analytics',
            features:[
                {nameAr:'تحليل وصفي',nameEn:'Descriptive Analytics',desc:'ماذا حدث؟ — إحصائيات ورسوم بيانية'},
                {nameAr:'تحليل تشخيصي',nameEn:'Diagnostic Analytics',desc:'لماذا حدث؟ — تحليل السبب الجذري'},
                {nameAr:'تحليل تنبؤي',nameEn:'Predictive Analytics',desc:'ماذا سيحدث؟ — نماذج تنبؤية بالذكاء الاصطناعي'},
                {nameAr:'تحليل توجيهي',nameEn:'Prescriptive Analytics',desc:'ماذا يجب أن نفعل؟ — توصيات ذكية'}
            ],
            visualizations:['رسم بياني خطي','رسم بياني شريطي','دائري (Pie)','حراري (Heatmap)','خريطة جغرافية','شجرة (Treemap)','شبكة (Network Graph)','جدول زمني (Timeline)','لوحة Kanban','مخطط Sankey'],
            ai:['كشف الأنماط التلقائي','تنبؤ الاتجاهات','تحليل المشاعر','توصيات ذكية','كشف الشذوذ (Anomaly Detection)']
        };

        // ====== التخصيص ======
        this.customization = {
            nameAr:'التخصيص',nameEn:'Customization',
            options:[
                'سحب وإفلات الويدجات',
                'تغيير حجم الويدجات',
                'إنشاء لوحات مخصصة',
                'حفظ واستعادة التخطيطات',
                'اختيار السمة (Theme)',
                'تعديل الألوان',
                'اختيار اللغة (عربي/إنجليزي)',
                'تخصيص الإشعارات',
                'إنشاء ويدجات مخصصة',
                'تثبيت المفضلة',
                'اختصارات لوحة المفاتيح'
            ]
        };

        // ====== ضوابط شرعية ======
        this.shariaGuidelines = {
            principles:[
                'لوحة التحكم أداة للإتقان — "إن الله يحب إذا عمل أحدكم عملا أن يتقنه"',
                'الشفافية والصدق في عرض البيانات — لا تزييف ولا تجميل',
                'حماية الخصوصية — البيانات الشخصية أمانة',
                'أوقات الصلاة مدمجة — التذكير بالعبادة أولوية',
                'الامتثال الشرعي مؤشر رئيسي — ليس ثانوياً',
                'المحاسبة والمراقبة من مبادئ الإسلام — "حاسبوا أنفسكم قبل أن تحاسبوا"',
                'عدم التجسس على المستخدمين — المراقبة للأنظمة لا للأشخاص',
                'العدل في التقارير — "كُونُوا قَوَّامِينَ بِالْقِسْطِ"'
            ]
        };
    }

    getDashboard() {
        return {
            engine:this.name,nameAr:this.nameAr,nameEn:this.nameEn,
            version:this.version,owner:this.owner,activatedAt:this.activatedAt,
            summary:{
                totalPanels:this.dashboardPanels.length,
                totalWidgets:this.dashboardPanels.reduce((sum,p)=>sum+p.widgets.length,0),
                totalViews:this.layout.views.length,
                themes:this.layout.themes.length,
                roles:this.accessControl.roles.length,
                notificationTypes:this.notifications.types.length,
                reportTypes:this.reports.types.length,
                analyticsFeatures:this.analytics.features.length,
                customizationOptions:this.customization.options.length,
                shariaPrinciples:this.shariaGuidelines.principles.length,
                quranReferences:this.quranReferences.length
            },
            dashboardPanels:this.dashboardPanels,layout:this.layout,
            accessControl:this.accessControl,notifications:this.notifications,
            reports:this.reports,analytics:this.analytics,
            customization:this.customization,
            quranReferences:this.quranReferences,shariaGuidelines:this.shariaGuidelines
        };
    }

    getPanel(panelId) {
        return this.dashboardPanels.find(p => p.id === panelId) || null;
    }

    getView(viewId) {
        const view = this.layout.views.find(v => v.id === viewId);
        if (!view) return null;
        return {
            ...view,
            panels: view.panels.map(pid => this.dashboardPanels.find(p => p.id === pid)).filter(Boolean)
        };
    }

    getPanelsByLayer(layer) {
        return this.dashboardPanels.filter(p => p.layer === layer);
    }
}
module.exports = SheikhaDashboardEngine;
