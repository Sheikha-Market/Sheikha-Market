/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SEGMENTS & MARKETING ENGINE
 * منظومة شيخة لتصنيف المستخدمين والفئات المستهدفة وقنوات الوصول والتسويق
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ
 *  لِتَعَارَفُوا" — الحجرات ١٣
 * "ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ" — النحل ١٢٥
 *
 * ✅ تصنيف المستخدمين — ١٢ فئة رئيسية
 * ✅ الفئات المستهدفة لكل مستفيد — Target Audiences
 * ✅ قنوات الوصول الرقمية وغير الرقمية — Marketing Channels
 * ✅ استراتيجيات التسويق — Marketing Strategies
 * ✅ الضوابط الشرعية للتسويق — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

class SheikhaSegmentsEngine {
    constructor() {
        this.name = 'Sheikha Segments & Marketing Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {

        // ══════════════════════════════════════════════════════════════════
        // آيات وأحاديث التسويق والتواصل
        // ══════════════════════════════════════════════════════════════════
        this.quranReferences = [
            { ayah: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', surah: 'الحجرات', num: 13, topic: 'التنوع والتعارف' },
            { ayah: 'ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ وَجَادِلْهُم بِالَّتِي هِيَ أَحْسَنُ', surah: 'النحل', num: 125, topic: 'الحكمة في الدعوة والتسويق' },
            { ayah: 'وَقُولُوا لِلنَّاسِ حُسْنًا', surah: 'البقرة', num: 83, topic: 'حسن التعامل' },
            { ayah: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ', surah: 'المائدة', num: 2, topic: 'التعاون على الخير' },
            { ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', surah: 'النساء', num: 29, topic: 'التجارة بالتراضي' },
            { ayah: 'وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا', surah: 'الإسراء', num: 34, topic: 'الوفاء بالعهود والوعود التسويقية' }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ١. تصنيف المستخدمين الرئيسي — User Segments
        // ══════════════════════════════════════════════════════════════════
        this.userSegments = [
            {
                id: 'GOV_STATE',
                nameAr: 'الدول والحكومات (بصفة دولة/حكومة)',
                nameEn: 'Governments & Sovereign States',
                icon: '🏛️',
                description: 'الدول والحكومات التي تتعامل بصفتها الرسمية — اتفاقيات، أنظمة، رقابة، شراكات استراتيجية',
                subTypes: [
                    { nameAr: 'حكومة المملكة العربية السعودية', nameEn: 'Saudi Government', entities: ['الوزارات', 'الهيئات', 'المؤسسات الحكومية', 'الصناديق السيادية'] },
                    { nameAr: 'حكومات دول مجلس التعاون', nameEn: 'GCC Governments' },
                    { nameAr: 'حكومات الدول العربية والإسلامية', nameEn: 'Arab & Islamic States' },
                    { nameAr: 'حكومات دولية أخرى', nameEn: 'International Governments' },
                    { nameAr: 'منظمات دولية حكومية', nameEn: 'IGOs', examples: ['الأمم المتحدة', 'منظمة التعاون الإسلامي', 'جامعة الدول العربية', 'البنك الدولي'] }
                ],
                services: ['أنظمة حكومية رقمية', 'منصات تجارة إلكترونية حكومية', 'بيانات اقتصادية وتحليلات', 'أنظمة امتثال وتنظيم', 'شراكات استراتيجية'],
                dashboard: 'لوحة تحكم الدولة/الحكومة'
            },
            {
                id: 'GOV_TRADER',
                nameAr: 'الدول والحكومات (بصفة تاجر — بيع وشراء)',
                nameEn: 'Government as Trader (B2G / G2B)',
                icon: '🏛️💰',
                description: 'الدول والشركات الحكومية التي تمارس البيع والشراء كتاجر في السوق',
                subTypes: [
                    { nameAr: 'شركات حكومية بائعة', nameEn: 'State-Owned Enterprises (SOEs) as Sellers', examples: ['أرامكو', 'سابك', 'الاتصالات السعودية', 'الكهرباء', 'المياه'] },
                    { nameAr: 'مشتريات حكومية', nameEn: 'Government Procurement', examples: ['اعتماد', 'منافسات', 'المشتريات الحكومية'] },
                    { nameAr: 'صناديق سيادية مستثمرة', nameEn: 'Sovereign Wealth Funds', examples: ['صندوق الاستثمارات العامة PIF', 'ADIA', 'QIA'] }
                ],
                services: ['منصة مشتريات B2G', 'كتالوج منتجات حكومية', 'نظام مناقصات رقمي', 'تمويل مشاريع'],
                dashboard: 'لوحة تحكم التاجر الحكومي'
            },
            {
                id: 'CORPORATE',
                nameAr: 'الشركات الكبرى',
                nameEn: 'Large Corporations & Enterprises',
                icon: '🏢',
                description: 'الشركات الكبيرة المساهمة والعائلية والدولية',
                subTypes: [
                    { nameAr: 'شركات مساهمة عامة', nameEn: 'Public Companies (Listed)', examples: ['شركات تداول', 'شركات عالمية'] },
                    { nameAr: 'شركات عائلية كبرى', nameEn: 'Large Family Businesses', examples: ['مجموعة الراجحي', 'بن لادن', 'العليان', 'الفوزان'] },
                    { nameAr: 'شركات متعددة الجنسيات', nameEn: 'MNCs', examples: ['فروع الشركات العالمية في السعودية'] },
                    { nameAr: 'شركات تقنية', nameEn: 'Tech Companies' }
                ],
                services: ['حلول B2B', 'سلاسل إمداد ذكية', 'تحليلات بيانات', 'تمويل إسلامي', 'أنظمة ERP'],
                dashboard: 'لوحة تحكم الشركة'
            },
            {
                id: 'SME',
                nameAr: 'المنشآت الصغيرة والمتوسطة',
                nameEn: 'Small & Medium Enterprises (SMEs)',
                icon: '🏪',
                description: 'المؤسسات والشركات الصغيرة والمتوسطة — العمود الفقري للاقتصاد',
                subTypes: [
                    { nameAr: 'مؤسسة فردية', nameEn: 'Sole Proprietorship' },
                    { nameAr: 'شركة ذات مسؤولية محدودة', nameEn: 'LLC' },
                    { nameAr: 'شركة شخص واحد', nameEn: 'Single-Person Company' },
                    { nameAr: 'وثيقة عمل حر (فريلانسر)', nameEn: 'Freelancer Document' },
                    { nameAr: 'متجر إلكتروني (معروف)', nameEn: 'E-Store (Maroof)' }
                ],
                services: ['متجر إلكتروني جاهز', 'أدوات تسويق', 'تمويل ميسر', 'محاسبة ذكية', 'سلسلة إمداد مبسطة'],
                dashboard: 'لوحة تحكم المنشأة'
            },
            {
                id: 'ENTREPRENEUR',
                nameAr: 'رواد الأعمال والشركات الناشئة',
                nameEn: 'Entrepreneurs & Startups',
                icon: '🚀',
                description: 'المبتكرون وأصحاب المشاريع الناشئة والأفكار الجديدة',
                subTypes: [
                    { nameAr: 'شركة ناشئة تقنية', nameEn: 'Tech Startup' },
                    { nameAr: 'مشروع ريادي اجتماعي', nameEn: 'Social Enterprise' },
                    { nameAr: 'صاحب فكرة (ما قبل التأسيس)', nameEn: 'Pre-Seed Idea Owner' },
                    { nameAr: 'مسرّعات وحاضنات أعمال', nameEn: 'Accelerators & Incubators', examples: ['فلات6لابز', 'بادر', 'مسك', 'SVC'] }
                ],
                services: ['دراسة جدوى ذكية', 'تمويل إسلامي للشركات الناشئة', 'إرشاد ومنتورينغ', 'تسويق رقمي', 'بنية تحتية سحابية'],
                dashboard: 'لوحة رائد الأعمال'
            },
            {
                id: 'MERCHANT',
                nameAr: 'التجار الأفراد',
                nameEn: 'Individual Merchants & Traders',
                icon: '🧑‍💼',
                description: 'التجار الأفراد في مختلف القطاعات — بيع وشراء',
                subTypes: [
                    { nameAr: 'تاجر تجزئة', nameEn: 'Retail Trader' },
                    { nameAr: 'تاجر جملة', nameEn: 'Wholesale Trader' },
                    { nameAr: 'تاجر استيراد وتصدير', nameEn: 'Import/Export Trader' },
                    { nameAr: 'تاجر إلكتروني', nameEn: 'E-Commerce Trader' },
                    { nameAr: 'تاجر معادن وذهب', nameEn: 'Metals & Gold Trader' },
                    { nameAr: 'تاجر عقار', nameEn: 'Real Estate Trader' },
                    { nameAr: 'تاجر سكراب وتشليح', nameEn: 'Scrap & Auto Dismantling Trader' }
                ],
                services: ['واجهة متجر رقمية', 'نظام نقاط بيع', 'إدارة مخزون', 'شحن ولوجستيات', 'تمويل تجاري'],
                dashboard: 'لوحة تحكم التاجر'
            },
            {
                id: 'CONSUMER',
                nameAr: 'المستهلكون (الأفراد)',
                nameEn: 'Individual Consumers (B2C)',
                icon: '👤',
                description: 'المستخدمون النهائيون — المشترون الأفراد',
                subTypes: [
                    { nameAr: 'مستهلك عام', nameEn: 'General Consumer' },
                    { nameAr: 'مستهلك حلال واعي', nameEn: 'Halal-Conscious Consumer' },
                    { nameAr: 'مستهلك رقمي (جيل Z)', nameEn: 'Digital Native (Gen Z)' },
                    { nameAr: 'عائلة سعودية', nameEn: 'Saudi Family' },
                    { nameAr: 'مقيم / وافد', nameEn: 'Expat Resident' },
                    { nameAr: 'حاج / معتمر / زائر', nameEn: 'Hajj/Umrah Pilgrim & Visitor' }
                ],
                services: ['تسوق حلال', 'مقارنة أسعار', 'توصيل سريع', 'برنامج ولاء', 'تمويل استهلاكي إسلامي'],
                dashboard: 'لوحة تحكم المستخدم'
            },
            {
                id: 'ACADEMIC',
                nameAr: 'الباحثون والجامعيون والمتخصصون',
                nameEn: 'Researchers, Academics & Specialists',
                icon: '🎓',
                description: 'الأكاديميون والباحثون في الجامعات ومراكز البحث — العلم النافع',
                subTypes: [
                    { nameAr: 'جامعات سعودية', nameEn: 'Saudi Universities', examples: ['جامعة الملك سعود', 'جامعة الملك عبدالعزيز', 'جامعة الملك فهد للبترول', 'جامعة الأميرة نورة', 'جامعة أم القرى', 'الجامعة الإسلامية', 'جامعة الإمام'] },
                    { nameAr: 'جامعات عربية وإسلامية', nameEn: 'Arab & Islamic Universities', examples: ['الأزهر', 'جامعة القرويين', 'IIUM ماليزيا'] },
                    { nameAr: 'جامعات عالمية', nameEn: 'International Universities', examples: ['MIT', 'Stanford', 'Oxford', 'Cambridge'] },
                    { nameAr: 'مراكز بحثية', nameEn: 'Research Centers', examples: ['KACST', 'KAUST', 'مراكز فكرية'] },
                    { nameAr: 'باحث مستقل', nameEn: 'Independent Researcher' },
                    { nameAr: 'طالب دراسات عليا', nameEn: 'Graduate Student' }
                ],
                services: ['بيانات بحثية مفتوحة', 'API أكاديمي', 'منتدى علمي', 'نشر أبحاث', 'تمويل بحوث', 'تعاون بحثي'],
                dashboard: 'لوحة الباحث الأكاديمي'
            },
            {
                id: 'ISLAMIC_ORG',
                nameAr: 'المؤسسات الإسلامية والدعوية والوقفية',
                nameEn: 'Islamic, Da\'wah & Waqf Organizations',
                icon: '🕌',
                description: 'الجهات الدعوية والوقفية والخيرية الإسلامية',
                subTypes: [
                    { nameAr: 'أوقاف', nameEn: 'Awqaf (Endowments)', examples: ['الهيئة العامة للأوقاف', 'وقف الملك عبدالعزيز'] },
                    { nameAr: 'جمعيات خيرية', nameEn: 'Charities', examples: ['إحسان', 'جمعيات تحفيظ القرآن', 'مؤسسة مكة المكرمة'] },
                    { nameAr: 'مؤسسات دعوية', nameEn: 'Da\'wah Organizations' },
                    { nameAr: 'هيئات إسلامية مالية', nameEn: 'Islamic Finance Bodies', examples: ['AAOIFI', 'IFSB', 'مجمع الفقه'] },
                    { nameAr: 'مدارس ومعاهد شرعية', nameEn: 'Islamic Schools & Institutes' }
                ],
                services: ['منصة أوقاف رقمية', 'نظام زكاة وصدقة', 'تبرعات إلكترونية', 'إدارة مشاريع خيرية', 'تعليم شرعي رقمي'],
                dashboard: 'لوحة المؤسسة الإسلامية'
            },
            {
                id: 'INDUSTRIAL',
                nameAr: 'المصنعون والصناعيون',
                nameEn: 'Manufacturers & Industrialists',
                icon: '🏭',
                description: 'أصحاب المصانع والمنشآت الصناعية بجميع أحجامها',
                subTypes: [
                    { nameAr: 'مصنع كبير', nameEn: 'Large Factory' },
                    { nameAr: 'مصنع صغير ومتوسط', nameEn: 'SME Factory' },
                    { nameAr: 'مصنع حرفي / يدوي', nameEn: 'Artisan / Handcraft' },
                    { nameAr: 'مصنع تقني', nameEn: 'Tech Manufacturer' }
                ],
                services: ['سلاسل إمداد ذكية', 'تسويق B2B', 'تمويل صناعي', 'أتمتة وIoT', 'مراقبة جودة'],
                dashboard: 'لوحة المصنّع'
            },
            {
                id: 'INVESTOR',
                nameAr: 'المستثمرون',
                nameEn: 'Investors',
                icon: '💎',
                description: 'المستثمرون الأفراد والمؤسسات وصناديق الاستثمار',
                subTypes: [
                    { nameAr: 'مستثمر فردي', nameEn: 'Individual Investor' },
                    { nameAr: 'مستثمر مؤسسي', nameEn: 'Institutional Investor' },
                    { nameAr: 'صندوق استثماري', nameEn: 'Investment Fund' },
                    { nameAr: 'مستثمر ملائكي', nameEn: 'Angel Investor' },
                    { nameAr: 'رأس مال جريء', nameEn: 'Venture Capital', examples: ['STV', 'Raed Ventures', 'Impact46', 'Vision Ventures'] }
                ],
                services: ['فرص استثمارية حلال', 'صناديق شيخة', 'تقارير تحليلية', 'تقييم مخاطر شرعي', 'محفظة ذكية'],
                dashboard: 'لوحة المستثمر'
            },
            {
                id: 'PROFESSIONAL',
                nameAr: 'المهنيون والمستشارون',
                nameEn: 'Professionals & Consultants',
                icon: '👨‍⚖️',
                description: 'المحامون والمحاسبون والمهندسون والاستشاريون',
                subTypes: [
                    { nameAr: 'محامي / مستشار قانوني', nameEn: 'Lawyer / Legal Advisor' },
                    { nameAr: 'محاسب قانوني', nameEn: 'Certified Accountant' },
                    { nameAr: 'مستشار مالي', nameEn: 'Financial Advisor' },
                    { nameAr: 'مستشار شرعي', nameEn: 'Sharia Advisor' },
                    { nameAr: 'مهندس / استشاري تقني', nameEn: 'Engineer / Tech Consultant' },
                    { nameAr: 'مستشار إداري', nameEn: 'Management Consultant' }
                ],
                services: ['دليل المهنيين', 'حجز استشارات', 'أدوات تحليل', 'مكتبة قانونية', 'تقارير سوقية'],
                dashboard: 'لوحة المهني'
            }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ٢. قنوات الوصول والتسويق — Marketing Channels
        // ══════════════════════════════════════════════════════════════════
        this.marketingChannels = {
            digital: [
                {
                    nameAr: 'وسائل التواصل الاجتماعي',
                    nameEn: 'Social Media',
                    platforms: [
                        { name: 'X (Twitter)', users: '> 15M في السعودية', bestFor: ['GOV_STATE', 'CORPORATE', 'ENTREPRENEUR', 'PROFESSIONAL', 'ACADEMIC'], content: ['أخبار', 'تحليلات', 'ثريدات تعليمية', 'إعلانات'] },
                        { name: 'LinkedIn', users: '> 8M في السعودية', bestFor: ['CORPORATE', 'SME', 'ENTREPRENEUR', 'PROFESSIONAL', 'INVESTOR', 'ACADEMIC'], content: ['محتوى مهني', 'وظائف', 'شراكات B2B', 'مقالات'] },
                        { name: 'Instagram', users: '> 14M في السعودية', bestFor: ['CONSUMER', 'SME', 'MERCHANT', 'ENTREPRENEUR'], content: ['صور منتجات', 'ريلز', 'قصص', 'إعلانات مصورة'] },
                        { name: 'TikTok', users: '> 20M في السعودية', bestFor: ['CONSUMER', 'ENTREPRENEUR', 'SME'], content: ['فيديو قصير', 'تعليمي', 'ترفيهي تسويقي'] },
                        { name: 'Snapchat', users: '> 20M في السعودية', bestFor: ['CONSUMER'], content: ['عروض يومية', 'فلاتر', 'إعلانات'] },
                        { name: 'YouTube', users: '> 25M في السعودية', bestFor: ['ALL'], content: ['فيديو تعليمي', 'مراجعات', 'شروحات', 'إعلانات'] },
                        { name: 'Telegram', users: '> 5M', bestFor: ['MERCHANT', 'INVESTOR', 'ACADEMIC'], content: ['قنوات إخبارية', 'مجموعات متخصصة', 'بوتات'] },
                        { name: 'WhatsApp Business', users: '> 25M في السعودية', bestFor: ['SME', 'MERCHANT', 'CONSUMER'], content: ['خدمة عملاء', 'كتالوج', 'رسائل ترويجية'] }
                    ]
                },
                {
                    nameAr: 'التسويق عبر محركات البحث',
                    nameEn: 'Search Engine Marketing (SEM/SEO)',
                    tools: [
                        { name: 'Google Ads', type: 'مدفوع', bestFor: ['ALL'] },
                        { name: 'Google SEO', type: 'عضوي', bestFor: ['ALL'] },
                        { name: 'Bing Ads', type: 'مدفوع', bestFor: ['CORPORATE', 'PROFESSIONAL'] }
                    ]
                },
                {
                    nameAr: 'التسويق عبر البريد الإلكتروني',
                    nameEn: 'Email Marketing',
                    tools: ['Mailchimp', 'SendGrid', 'HubSpot', 'Brevo'],
                    bestFor: ['CORPORATE', 'SME', 'INVESTOR', 'PROFESSIONAL', 'ACADEMIC'],
                    types: ['نشرات إخبارية', 'عروض مخصصة', 'تقارير دورية', 'دعوات فعاليات']
                },
                {
                    nameAr: 'التسويق عبر التطبيقات',
                    nameEn: 'App Marketing',
                    channels: ['App Store Optimization (ASO)', 'Push Notifications', 'In-App Ads', 'Deep Linking'],
                    bestFor: ['CONSUMER', 'MERCHANT', 'SME']
                },
                {
                    nameAr: 'التسويق بالمحتوى',
                    nameEn: 'Content Marketing',
                    types: [
                        { nameAr: 'مدونة', nameEn: 'Blog', bestFor: ['ALL'] },
                        { nameAr: 'بودكاست', nameEn: 'Podcast', bestFor: ['ENTREPRENEUR', 'PROFESSIONAL', 'INVESTOR'] },
                        { nameAr: 'ندوات عبر الإنترنت', nameEn: 'Webinars', bestFor: ['CORPORATE', 'ACADEMIC', 'PROFESSIONAL'] },
                        { nameAr: 'كتب إلكترونية / تقارير', nameEn: 'E-books & Whitepapers', bestFor: ['CORPORATE', 'INVESTOR', 'ACADEMIC'] },
                        { nameAr: 'إنفوجرافيك', nameEn: 'Infographics', bestFor: ['ALL'] }
                    ]
                },
                {
                    nameAr: 'الإعلان الرقمي',
                    nameEn: 'Digital Advertising',
                    types: ['إعلانات العرض (Display)', 'إعلانات الفيديو', 'إعلانات أصلية (Native)', 'إعادة الاستهداف (Retargeting)', 'إعلانات برمجية (Programmatic)'],
                    platforms: ['Google Display Network', 'Meta Ads', 'TikTok Ads', 'Snapchat Ads', 'DV360']
                },
                {
                    nameAr: 'التسويق بالمؤثرين',
                    nameEn: 'Influencer Marketing',
                    tiers: [
                        { nameAr: 'نانو (1K-10K)', cost: 'منخفض', engagement: 'عالي جداً' },
                        { nameAr: 'مايكرو (10K-100K)', cost: 'متوسط', engagement: 'عالي' },
                        { nameAr: 'ماكرو (100K-1M)', cost: 'مرتفع', engagement: 'متوسط' },
                        { nameAr: 'ميجا (1M+)', cost: 'مرتفع جداً', engagement: 'منخفض' }
                    ],
                    bestFor: ['CONSUMER', 'SME', 'ENTREPRENEUR']
                },
                {
                    nameAr: 'التسويق عبر المنصات الرقمية الحكومية',
                    nameEn: 'Government Digital Platforms',
                    platforms: [
                        { name: 'أبشر', users: '> 25M', bestFor: ['CONSUMER'] },
                        { name: 'منصة اعتماد', bestFor: ['GOV_STATE', 'CORPORATE'] },
                        { name: 'بوابة منافسات', bestFor: ['CORPORATE', 'SME'] },
                        { name: 'منصة قوى', bestFor: ['CORPORATE', 'SME'] }
                    ]
                }
            ],
            nonDigital: [
                {
                    nameAr: 'المعارض والمؤتمرات',
                    nameEn: 'Exhibitions & Conferences',
                    examples: [
                        { name: 'LEAP (تقنية)', location: 'الرياض', bestFor: ['CORPORATE', 'ENTREPRENEUR', 'INVESTOR'] },
                        { name: 'مؤتمر مستقبل الاستثمار (FII)', location: 'الرياض', bestFor: ['INVESTOR', 'GOV_STATE', 'CORPORATE'] },
                        { name: 'جايتكس (GITEX)', location: 'دبي', bestFor: ['CORPORATE', 'ENTREPRENEUR'] },
                        { name: 'معرض الرياض الدولي للكتاب', location: 'الرياض', bestFor: ['ACADEMIC', 'CONSUMER'] },
                        { name: 'معرض الغذاء السعودي', location: 'الرياض', bestFor: ['MERCHANT', 'INDUSTRIAL', 'SME'] },
                        { name: 'ADIPEC (بترول)', location: 'أبوظبي', bestFor: ['INDUSTRIAL', 'INVESTOR'] }
                    ]
                },
                {
                    nameAr: 'الغرف التجارية والصناعية',
                    nameEn: 'Chambers of Commerce & Industry',
                    channels: ['الغرفة التجارية بالرياض', 'غرفة جدة', 'غرفة الشرقية', 'اتحاد الغرف السعودية'],
                    bestFor: ['CORPORATE', 'SME', 'MERCHANT', 'INDUSTRIAL'],
                    activities: ['لقاءات أعمال', 'ورش عمل', 'دورات', 'شبكات علاقات']
                },
                {
                    nameAr: 'الجامعات ومراكز البحث',
                    nameEn: 'Universities & Research Centers',
                    channels: ['شراكات بحثية', 'رعاية فعاليات', 'حاضنات أعمال جامعية', 'محاضرات وورش', 'مسابقات ابتكار'],
                    bestFor: ['ACADEMIC', 'ENTREPRENEUR'],
                    universities: ['جامعة الملك سعود', 'جامعة الملك عبدالعزيز', 'KAUST', 'جامعة الملك فهد', 'جامعة الأميرة نورة']
                },
                {
                    nameAr: 'الإعلام التقليدي',
                    nameEn: 'Traditional Media',
                    channels: [
                        { nameAr: 'تلفزيون', examples: ['MBC', 'روتانا', 'العربية', 'الإخبارية'], bestFor: ['ALL'] },
                        { nameAr: 'إذاعة', examples: ['MBC FM', 'UFM', 'إذاعة القرآن'], bestFor: ['CONSUMER'] },
                        { nameAr: 'صحف ومجلات', examples: ['الاقتصادية', 'الرياض', 'عكاظ', 'أرقام'], bestFor: ['CORPORATE', 'INVESTOR'] }
                    ]
                },
                {
                    nameAr: 'الإعلان الخارجي',
                    nameEn: 'Out-of-Home (OOH) Advertising',
                    types: ['لوحات إعلانية', 'شاشات رقمية في المولات', 'إعلانات المطارات', 'إعلانات الحافلات', 'إعلانات الملاعب'],
                    bestFor: ['CONSUMER', 'ALL']
                },
                {
                    nameAr: 'التسويق المباشر والعلاقات',
                    nameEn: 'Direct Marketing & Networking',
                    methods: ['زيارات ميدانية B2B', 'اتصالات هاتفية', 'بريد مباشر', 'هدايا مؤسسية', 'دعوات VIP', 'مجالس أعمال'],
                    bestFor: ['GOV_STATE', 'CORPORATE', 'INVESTOR']
                },
                {
                    nameAr: 'المساجد والمنابر',
                    nameEn: 'Mosques & Islamic Platforms',
                    activities: ['دروس علمية', 'خطب جمعة ذات صلة', 'ملصقات في المساجد', 'برامج وقفية'],
                    bestFor: ['ISLAMIC_ORG', 'CONSUMER'],
                    shariaNote: 'التسويق في المساجد يجب أن يكون بأدب ووقار وبإذن الجهة المسؤولة'
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٣. مصفوفة التسويق — من المستفيد للفئة المستهدفة
        // ══════════════════════════════════════════════════════════════════
        this.marketingMatrix = [
            {
                beneficiary: 'GOV_STATE',
                nameAr: 'تسويق منتجات/خدمات الحكومات',
                targetAudiences: ['CORPORATE', 'SME', 'MERCHANT', 'CONSUMER', 'INVESTOR', 'INDUSTRIAL'],
                channels: ['المنصات الحكومية', 'LinkedIn', 'X', 'مؤتمرات', 'إعلام تقليدي', 'بريد إلكتروني رسمي'],
                products: ['خدمات حكومية رقمية', 'مناقصات', 'بيانات اقتصادية', 'تراخيص', 'منتجات شركات حكومية']
            },
            {
                beneficiary: 'CORPORATE',
                nameAr: 'تسويق منتجات/خدمات الشركات',
                targetAudiences: ['GOV_STATE', 'SME', 'CONSUMER', 'MERCHANT', 'INDUSTRIAL'],
                channels: ['LinkedIn', 'Google Ads', 'معارض', 'غرف تجارية', 'بريد إلكتروني', 'زيارات B2B'],
                products: ['حلول مؤسسية', 'منتجات صناعية', 'خدمات تقنية', 'استشارات']
            },
            {
                beneficiary: 'SME',
                nameAr: 'تسويق منتجات المنشآت الصغيرة',
                targetAudiences: ['CONSUMER', 'SME', 'CORPORATE'],
                channels: ['Instagram', 'TikTok', 'WhatsApp Business', 'Google Ads', 'مؤثرين'],
                products: ['منتجات استهلاكية', 'خدمات محلية', 'منتجات حرفية', 'أطعمة']
            },
            {
                beneficiary: 'ENTREPRENEUR',
                nameAr: 'تسويق منتجات رواد الأعمال',
                targetAudiences: ['INVESTOR', 'CONSUMER', 'CORPORATE', 'ACADEMIC'],
                channels: ['LinkedIn', 'X', 'TikTok', 'مسرّعات', 'مسابقات', 'بودكاست'],
                products: ['تطبيقات', 'حلول مبتكرة', 'منتجات تقنية', 'خدمات SaaS']
            },
            {
                beneficiary: 'MERCHANT',
                nameAr: 'تسويق بضائع التجار',
                targetAudiences: ['CONSUMER', 'MERCHANT', 'SME'],
                channels: ['Instagram', 'WhatsApp', 'Snapchat', 'سوق شيخة', 'إعلانات محلية'],
                products: ['بضائع تجارية', 'ذهب ومعادن', 'سكراب', 'عقارات', 'سيارات']
            },
            {
                beneficiary: 'ACADEMIC',
                nameAr: 'تسويق مخرجات البحث والجامعات',
                targetAudiences: ['GOV_STATE', 'CORPORATE', 'ENTREPRENEUR', 'ACADEMIC', 'INDUSTRIAL'],
                channels: ['مؤتمرات علمية', 'LinkedIn', 'منصات بحثية', 'جامعات', 'مجلات علمية'],
                products: ['أبحاث', 'براءات اختراع', 'استشارات علمية', 'تدريب', 'برامج أكاديمية']
            },
            {
                beneficiary: 'ISLAMIC_ORG',
                nameAr: 'تسويق خدمات المؤسسات الإسلامية',
                targetAudiences: ['CONSUMER', 'CORPORATE', 'INVESTOR', 'GOV_STATE'],
                channels: ['مساجد', 'X', 'YouTube', 'تلفزيون إسلامي', 'واتساب', 'منصات تبرع'],
                products: ['مشاريع وقفية', 'تبرعات', 'تعليم شرعي', 'كفالات', 'صدقات جارية']
            },
            {
                beneficiary: 'INDUSTRIAL',
                nameAr: 'تسويق منتجات المصانع',
                targetAudiences: ['CORPORATE', 'GOV_STATE', 'MERCHANT', 'SME', 'CONSUMER'],
                channels: ['معارض صناعية', 'LinkedIn', 'زيارات B2B', 'غرف تجارية', 'كتالوجات'],
                products: ['منتجات مصنعة', 'مواد خام', 'قطع غيار', 'معدات', 'منتجات حلال']
            },
            {
                beneficiary: 'INVESTOR',
                nameAr: 'تسويق فرص استثمارية',
                targetAudiences: ['INVESTOR', 'CORPORATE', 'GOV_STATE'],
                channels: ['مؤتمرات FII', 'LinkedIn', 'تقارير مالية', 'علاقات مباشرة', 'منصات استثمار'],
                products: ['صناديق استثمارية', 'فرص شراكة', 'صكوك', 'عقارات استثمارية']
            }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ٤. الضوابط الشرعية للتسويق
        // ══════════════════════════════════════════════════════════════════
        this.shariaMarketing = {
            principles: [
                { principle: 'الصدق في الإعلان', evidence: 'التجار يبعثون يوم القيامة فجاراً إلا من اتقى وبر وصدق — حديث', application: 'عدم المبالغة أو الكذب في وصف المنتجات' },
                { principle: 'تحريم الغش والتدليس', evidence: 'من غشنا فليس منا — حديث مسلم', application: 'عدم إخفاء عيوب المنتج أو تزييف الصور' },
                { principle: 'النهي عن النجش', evidence: 'نهى النبي ﷺ عن النجش — حديث', application: 'عدم رفع الأسعار وهمياً أو استخدام تقييمات مزيفة' },
                { principle: 'احترام الخصوصية', evidence: 'وَلَا تَجَسَّسُوا — الحجرات ١٢', application: 'عدم التجسس على بيانات المستخدمين أو بيعها' },
                { principle: 'الوفاء بالوعود', evidence: 'وَأَوْفُوا بِالْعَهْدِ — الإسراء ٣٤', application: 'الالتزام بكل ما يُعلن عنه من عروض ومزايا' },
                { principle: 'عدم استغلال الضعفاء', evidence: 'ارحموا من في الأرض يرحمكم من في السماء — حديث', application: 'عدم استهداف الأطفال أو المحتاجين بإعلانات مضللة' },
                { principle: 'تحريم إعلانات المحرمات', evidence: 'لعن الله الخمر وبائعها ومشتريها... ومعلنها — حديث', application: 'لا إعلانات لمحرمات' },
                { principle: 'الحكمة في الدعوة', evidence: 'ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ — النحل ١٢٥', application: 'التسويق بالحكمة والأسلوب الحسن' }
            ],
            prohibited: [
                'الكذب والمبالغة في الإعلانات',
                'استخدام صور مخلّة أو محرمة',
                'النجش والتقييمات المزيفة',
                'بيع بيانات المستخدمين بدون إذن',
                'الإعلان عن منتجات محرمة',
                'الإعلانات التي تحتقر المنافسين (الغيبة)',
                'الرسائل المزعجة (Spam) بدون إذن',
                'استغلال المشاعر الدينية للترويج الكاذب',
                'التسويق بالخوف أو التهديد',
                'إخفاء الشروط والتكاليف الحقيقية'
            ]
        };
    }

    getDashboard() {
        return {
            engine: this.name, version: this.version, owner: this.owner, activatedAt: this.activatedAt,
            summary: {
                userSegments: this.userSegments.length,
                totalSubTypes: this.userSegments.reduce((s, u) => s + u.subTypes.length, 0),
                digitalChannelCategories: this.marketingChannels.digital.length,
                nonDigitalChannelCategories: this.marketingChannels.nonDigital.length,
                socialPlatforms: this.marketingChannels.digital[0].platforms.length,
                marketingMatrixEntries: this.marketingMatrix.length,
                shariaRules: this.shariaMarketing.principles.length,
                quranReferences: this.quranReferences.length
            },
            quranReferences: this.quranReferences,
            userSegments: this.userSegments,
            marketingChannels: this.marketingChannels,
            marketingMatrix: this.marketingMatrix,
            shariaMarketing: this.shariaMarketing
        };
    }
}

module.exports = SheikhaSegmentsEngine;
