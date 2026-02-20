/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SHEIKHA AI-COMMS BRIDGE — جسر التكامل بين الذكاء الاصطناعي والاتصالات
 *  «وَشَاوِرْهُمْ فِي الْأَمْرِ» — آل عمران ١٥٩
 *  شات ذكي متعدد القنوات | جمع البيانات | التحليل | التفكير الآلي
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaAICommsBridge {
    constructor(options = {}) {
        this.aiEngine = options.aiEngine || null;       // SheikhaAI
        this.localMind = options.localMind || null;     // SheikhaLocalMind
        this.commsEngine = options.commsEngine || null;  // SheikhaCommsEngine

        this.foundation = this._buildFoundation();
        this.smartChat = this._buildSmartChat();
        this.universalChannels = this._buildUniversalChannels();
        this.dataCollector = this._buildDataCollector();
        this.analyzer = this._buildAnalyzer();
        this.autoThinking = this._buildAutoThinking();
        this.channelAdapters = this._buildChannelAdapters();
        this.sessions = new Map();
        this.analytics = { totalMessages: 0, byChannel: {}, byIntent: {}, avgResponseMs: 0, responseTimes: [] };
        this.collectedData = [];
        this.insights = [];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📖 الأساس الشرعي
    // ═══════════════════════════════════════════════════════════════════════════
    _buildFoundation() {
        return {
            nameAr: 'جسر التكامل — الذكاء الاصطناعي والاتصالات',
            nameEn: 'Sheikha AI-Communications Bridge',
            purpose: 'شات ذكي متعدد القنوات يجمع البيانات ويحلل ويفكر آلياً على منهج الكتاب والسنة',
            quran: [
                { ayah: 'وَشَاوِرْهُمْ فِي الْأَمْرِ', surah: 'آل عمران', num: 159, principle: 'الشورى — الحوار الذكي مع المستخدم' },
                { ayah: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', surah: 'الزمر', num: 9, principle: 'العلم — جمع البيانات والتحليل' },
                { ayah: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ', surah: 'النساء', num: 82, principle: 'التدبّر — التفكير العميق الآلي' },
                { ayah: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', num: 114, principle: 'التعلم المستمر' },
                { ayah: 'فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ', surah: 'النحل', num: 43, principle: 'السؤال والاستفسار الذكي' },
                { ayah: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا', surah: 'الإسراء', num: 85, principle: 'التواضع — لا ادعاء معرفة ما لا نعلم' }
            ],
            hadith: [
                { text: 'من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة', source: 'مسلم', principle: 'طلب العلم عبر كل قناة' },
                { text: 'الحكمة ضالة المؤمن أنى وجدها فهو أحق بها', source: 'الترمذي', principle: 'جمع البيانات من كل مصدر' },
                { text: 'ما خاب من استخار ولا ندم من استشار', source: 'الطبراني', principle: 'الاستشارة الذكية' },
                { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', source: 'البيهقي', principle: 'إتقان الرد والتحليل' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 💬 الشات الذكي متعدد القنوات
    // ═══════════════════════════════════════════════════════════════════════════
    _buildSmartChat() {
        return {
            nameAr: 'الشات الذكي الشامل',
            capabilities: [
                { id: 'multi_channel', nameAr: 'متعدد القنوات', desc: 'يستقبل ويرد عبر SMS / واتساب / إيميل / ويب / صوت' },
                { id: 'context_aware', nameAr: 'واعٍ بالسياق', desc: 'يحفظ سياق المحادثة عبر القنوات' },
                { id: 'intent_detection', nameAr: 'كشف النية', desc: 'يحدد هدف المستخدم تلقائياً' },
                { id: 'language_detect', nameAr: 'كشف اللغة', desc: 'عربي / إنجليزي — تلقائي' },
                { id: 'smart_routing', nameAr: 'توجيه ذكي', desc: 'يوجه للقسم المناسب تلقائياً' },
                { id: 'auto_escalate', nameAr: 'تصعيد تلقائي', desc: 'يصعّد للبشري عند الحاجة' },
                { id: 'sentiment', nameAr: 'تحليل المشاعر', desc: 'يكتشف مزاج المستخدم ويتكيف' },
                { id: 'data_collection', nameAr: 'جمع البيانات', desc: 'يجمع المعلومات ذكياً أثناء المحادثة' },
                { id: 'proactive', nameAr: 'استباقي', desc: 'يبادر بالمعلومات المفيدة' }
            ],
            intents: {
                greeting: { keywords: ['سلام', 'مرحبا', 'اهلا', 'hi', 'hello'], priority: 1, handler: 'handleGreeting' },
                price_inquiry: { keywords: ['سعر', 'اسعار', 'كم', 'price', 'cost'], priority: 2, handler: 'handlePrice' },
                order_status: { keywords: ['طلب', 'حالة', 'تتبع', 'order', 'track'], priority: 2, handler: 'handleOrder' },
                product_info: { keywords: ['معدن', 'حديد', 'نحاس', 'الومنيوم', 'metal', 'iron', 'copper'], priority: 3, handler: 'handleProduct' },
                registration: { keywords: ['تسجيل', 'حساب', 'اشتراك', 'register', 'signup'], priority: 2, handler: 'handleRegistration' },
                support: { keywords: ['مساعدة', 'مشكلة', 'شكوى', 'help', 'support', 'issue'], priority: 1, handler: 'handleSupport' },
                shipping: { keywords: ['شحن', 'توصيل', 'نقل', 'ship', 'deliver'], priority: 3, handler: 'handleShipping' },
                payment: { keywords: ['دفع', 'تحويل', 'فاتورة', 'pay', 'invoice'], priority: 2, handler: 'handlePayment' },
                sharia: { keywords: ['حلال', 'حرام', 'شرعي', 'ربا', 'halal', 'sharia'], priority: 1, handler: 'handleSharia' },
                general: { keywords: [], priority: 10, handler: 'handleGeneral' }
            },
            greeting: {
                muslim: 'وعليكم السلام ورحمة الله وبركاته! أهلاً بك في سوق شيخة. كيف أخدمك؟',
                general: 'بسم الله الرحمن الرحيم — أهلاً بك في سوق شيخة. كيف نساعدك؟'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 القنوات الشاملة — كل وسيلة مشروعة رقمية وغير رقمية
    // «بَلِّغُوا عَنِّي وَلَوْ آيَةً» — البخاري
    // ═══════════════════════════════════════════════════════════════════════════
    _buildUniversalChannels() {
        return {
            // ─── الاتصالات الأساسية ───
            core: [
                { id: 'sms', nameAr: 'الرسائل النصية SMS', type: 'direct', direction: 'bidirectional', ai: true, dataCollection: true },
                { id: 'whatsapp', nameAr: 'واتساب', type: 'messaging', direction: 'bidirectional', ai: true, dataCollection: true },
                { id: 'email', nameAr: 'البريد الإلكتروني', type: 'email', direction: 'bidirectional', ai: true, dataCollection: true },
                { id: 'voice', nameAr: 'المكالمات الهاتفية الآلية', type: 'voice', direction: 'bidirectional', ai: true, dataCollection: true },
                { id: 'web_chat', nameAr: 'شات الموقع', type: 'web', direction: 'bidirectional', ai: true, dataCollection: true },
                { id: 'push', nameAr: 'إشعارات التطبيق', type: 'push', direction: 'outbound', ai: false, dataCollection: true },
                { id: 'in_app', nameAr: 'إشعارات داخل المنظومة', type: 'internal', direction: 'outbound', ai: false, dataCollection: true }
            ],
            // ─── وسائل التواصل الاجتماعي ───
            social: [
                { id: 'twitter_x', nameAr: 'تويتر / X', type: 'social', direction: 'bidirectional', ai: true, dataCollection: true, apiBase: 'https://api.twitter.com/2', envKey: 'TWITTER_BEARER_TOKEN', features: ['post', 'reply', 'dm', 'trends', 'mentions', 'analytics'] },
                { id: 'instagram', nameAr: 'إنستجرام', type: 'social', direction: 'bidirectional', ai: true, dataCollection: true, apiBase: 'https://graph.instagram.com', envKey: 'INSTAGRAM_TOKEN', features: ['post', 'story', 'reel', 'dm', 'comments', 'analytics'] },
                { id: 'facebook', nameAr: 'فيسبوك', type: 'social', direction: 'bidirectional', ai: true, dataCollection: true, apiBase: 'https://graph.facebook.com', envKey: 'FACEBOOK_PAGE_TOKEN', features: ['post', 'messenger', 'comments', 'ads', 'analytics'] },
                { id: 'linkedin', nameAr: 'لينكد إن', type: 'social', direction: 'bidirectional', ai: true, dataCollection: true, apiBase: 'https://api.linkedin.com/v2', envKey: 'LINKEDIN_TOKEN', features: ['post', 'messaging', 'company_page', 'analytics'] },
                { id: 'youtube', nameAr: 'يوتيوب', type: 'social', direction: 'outbound', ai: true, dataCollection: true, apiBase: 'https://www.googleapis.com/youtube/v3', envKey: 'YOUTUBE_API_KEY', features: ['upload', 'comments', 'analytics', 'live'] },
                { id: 'tiktok', nameAr: 'تيك توك', type: 'social', direction: 'outbound', ai: true, dataCollection: true, features: ['post', 'analytics'] },
                { id: 'snapchat', nameAr: 'سناب شات', type: 'social', direction: 'outbound', ai: false, dataCollection: true, features: ['story', 'ads', 'analytics'] },
                { id: 'telegram', nameAr: 'تيليجرام', type: 'messaging', direction: 'bidirectional', ai: true, dataCollection: true, apiBase: 'https://api.telegram.org', envKey: 'TELEGRAM_BOT_TOKEN', features: ['bot', 'channel', 'group', 'inline'] }
            ],
            // ─── التسويق والإعلان ───
            marketing: [
                { id: 'google_ads', nameAr: 'إعلانات قوقل', type: 'advertising', direction: 'outbound', ai: true, dataCollection: true, features: ['search_ads', 'display', 'shopping', 'video', 'analytics', 'conversion_tracking'] },
                { id: 'meta_ads', nameAr: 'إعلانات ميتا (فيسبوك/إنستجرام)', type: 'advertising', direction: 'outbound', ai: true, dataCollection: true, features: ['audience_targeting', 'retargeting', 'lookalike', 'analytics'] },
                { id: 'seo', nameAr: 'تحسين محركات البحث', type: 'organic', direction: 'inbound', ai: true, dataCollection: true, features: ['keyword_research', 'content_optimization', 'backlinks', 'ranking_tracking'] },
                { id: 'email_marketing', nameAr: 'التسويق بالبريد', type: 'email', direction: 'outbound', ai: true, dataCollection: true, features: ['campaigns', 'automation', 'segmentation', 'ab_testing', 'analytics'] },
                { id: 'sms_marketing', nameAr: 'التسويق بالرسائل النصية', type: 'sms', direction: 'outbound', ai: true, dataCollection: true, features: ['bulk_sms', 'personalization', 'scheduling', 'analytics'] },
                { id: 'content_marketing', nameAr: 'التسويق بالمحتوى', type: 'content', direction: 'outbound', ai: true, dataCollection: true, features: ['blog', 'articles', 'infographics', 'video', 'podcast'] },
                { id: 'affiliate', nameAr: 'التسويق بالعمولة', type: 'referral', direction: 'inbound', ai: true, dataCollection: true, features: ['tracking', 'commission', 'referral_links'] }
            ],
            // ─── المبيعات وإدارة العلاقات ───
            sales: [
                { id: 'crm', nameAr: 'إدارة علاقات العملاء CRM', type: 'crm', direction: 'bidirectional', ai: true, dataCollection: true, features: ['lead_tracking', 'pipeline', 'deals', 'contacts', 'tasks', 'reporting'] },
                { id: 'live_chat_sales', nameAr: 'شات المبيعات المباشر', type: 'chat', direction: 'bidirectional', ai: true, dataCollection: true, features: ['real_time', 'product_suggestions', 'quotes', 'follow_up'] },
                { id: 'rfq', nameAr: 'طلبات عروض الأسعار', type: 'form', direction: 'inbound', ai: true, dataCollection: true, features: ['auto_pricing', 'comparison', 'negotiation', 'approval'] },
                { id: 'pos', nameAr: 'نقاط البيع', type: 'transaction', direction: 'bidirectional', ai: true, dataCollection: true, features: ['sales_tracking', 'inventory_sync', 'receipts', 'analytics'] },
                { id: 'b2b_portal', nameAr: 'بوابة الأعمال B2B', type: 'portal', direction: 'bidirectional', ai: true, dataCollection: true, features: ['bulk_orders', 'contracts', 'tenders', 'pricing'] }
            ],
            // ─── الإدارة والعمليات ───
            operations: [
                { id: 'erp', nameAr: 'نظام تخطيط الموارد ERP', type: 'system', direction: 'bidirectional', ai: true, dataCollection: true, features: ['inventory', 'procurement', 'production', 'finance', 'hr'] },
                { id: 'project_management', nameAr: 'إدارة المشاريع', type: 'management', direction: 'bidirectional', ai: true, dataCollection: true, features: ['tasks', 'milestones', 'gantt', 'resources', 'budget'] },
                { id: 'hr', nameAr: 'الموارد البشرية', type: 'management', direction: 'bidirectional', ai: true, dataCollection: true, features: ['recruitment', 'attendance', 'payroll', 'performance'] },
                { id: 'accounting', nameAr: 'المحاسبة والمالية', type: 'finance', direction: 'bidirectional', ai: true, dataCollection: true, features: ['invoicing', 'payments', 'reporting', 'tax', 'reconciliation'] },
                { id: 'document_management', nameAr: 'إدارة المستندات', type: 'document', direction: 'bidirectional', ai: true, dataCollection: true, features: ['upload', 'ocr', 'search', 'versioning', 'signatures'] },
                { id: 'workflow_automation', nameAr: 'أتمتة سير العمل', type: 'automation', direction: 'bidirectional', ai: true, dataCollection: true, features: ['triggers', 'actions', 'conditions', 'approvals'] }
            ],
            // ─── اللوجستيات وسلسلة التوريد ───
            logistics: [
                { id: 'shipping_tracker', nameAr: 'تتبع الشحنات', type: 'tracking', direction: 'inbound', ai: true, dataCollection: true, features: ['real_time', 'gps', 'eta', 'alerts', 'proof_of_delivery'] },
                { id: 'warehouse', nameAr: 'إدارة المستودعات', type: 'wms', direction: 'bidirectional', ai: true, dataCollection: true, features: ['inventory', 'picking', 'packing', 'barcode', 'rfid'] },
                { id: 'fleet', nameAr: 'إدارة الأسطول', type: 'fleet', direction: 'bidirectional', ai: true, dataCollection: true, features: ['tracking', 'routing', 'fuel', 'maintenance', 'driver_management'] },
                { id: 'customs', nameAr: 'الجمارك والتخليص', type: 'customs', direction: 'bidirectional', ai: true, dataCollection: true, features: ['declarations', 'tariffs', 'compliance', 'documents'] },
                { id: 'port_systems', nameAr: 'أنظمة الموانئ', type: 'port', direction: 'inbound', ai: true, dataCollection: true, features: ['vessel_tracking', 'container_status', 'berth_allocation'] },
                { id: 'last_mile', nameAr: 'التوصيل الأخير', type: 'delivery', direction: 'bidirectional', ai: true, dataCollection: true, features: ['routing', 'scheduling', 'notification', 'proof_of_delivery'] }
            ],
            // ─── مصادر المعلومات والبيانات ───
            dataSources: [
                { id: 'lme', nameAr: 'بورصة لندن للمعادن LME', type: 'market_data', direction: 'inbound', ai: true, license: 'subscription', features: ['live_prices', 'historical', 'futures', 'options'] },
                { id: 'comex', nameAr: 'بورصة كومكس COMEX', type: 'market_data', direction: 'inbound', ai: true, license: 'subscription', features: ['gold', 'silver', 'copper', 'futures'] },
                { id: 'shfe', nameAr: 'بورصة شنغهاي SHFE', type: 'market_data', direction: 'inbound', ai: true, license: 'subscription', features: ['metals', 'futures'] },
                { id: 'saudi_exchange', nameAr: 'تداول السعودية', type: 'market_data', direction: 'inbound', ai: true, license: 'open', features: ['stocks', 'indices', 'company_data'] },
                { id: 'customs_data', nameAr: 'بيانات الجمارك السعودية', type: 'government', direction: 'inbound', ai: true, license: 'api_key', features: ['import_export', 'tariffs', 'trade_statistics'] },
                { id: 'mc_gov', nameAr: 'وزارة التجارة', type: 'government', direction: 'inbound', ai: true, license: 'open', features: ['company_registry', 'regulations', 'licenses'] },
                { id: 'gosi', nameAr: 'التأمينات الاجتماعية', type: 'government', direction: 'inbound', ai: true, license: 'api_key', features: ['employee_verification'] },
                { id: 'nafath_api', nameAr: 'نفاذ — الهوية الرقمية', type: 'government', direction: 'inbound', ai: false, license: 'api_key', features: ['identity_verification', 'digital_signing'] },
                { id: 'open_data_sa', nameAr: 'البيانات المفتوحة السعودية', type: 'open_data', direction: 'inbound', ai: true, license: 'open', url: 'https://data.gov.sa', features: ['datasets', 'statistics', 'economic_indicators'] },
                { id: 'world_bank', nameAr: 'البنك الدولي', type: 'open_data', direction: 'inbound', ai: true, license: 'open', features: ['economic_indicators', 'commodity_prices', 'trade_data'] },
                { id: 'news_feeds', nameAr: 'تغذيات الأخبار', type: 'news', direction: 'inbound', ai: true, license: 'mixed', features: ['rss', 'api', 'scraping', 'sentiment_analysis'] },
                { id: 'weather', nameAr: 'بيانات الطقس', type: 'environment', direction: 'inbound', ai: true, license: 'open', features: ['current', 'forecast', 'alerts', 'impact_on_logistics'] },
                { id: 'google_trends', nameAr: 'اتجاهات قوقل', type: 'analytics', direction: 'inbound', ai: true, license: 'open', features: ['search_trends', 'interest_over_time', 'regional'] },
                { id: 'web_scraping', nameAr: 'جمع بيانات الويب', type: 'scraping', direction: 'inbound', ai: true, license: 'requires_permission', features: ['competitor_prices', 'market_analysis', 'content'] }
            ],
            // ─── القنوات غير الرقمية (تُرقمن) ───
            offline: [
                { id: 'walk_in', nameAr: 'زيارة مباشرة', type: 'physical', direction: 'inbound', ai: false, dataCollection: true, digitization: 'يُدخل البيانات يدوياً أو عبر التطبيق' },
                { id: 'phone_call', nameAr: 'مكالمة هاتفية (بشرية)', type: 'voice', direction: 'bidirectional', ai: true, dataCollection: true, digitization: 'تسجيل وتفريغ آلي بالذكاء الاصطناعي' },
                { id: 'fax', nameAr: 'فاكس', type: 'document', direction: 'inbound', ai: true, dataCollection: true, digitization: 'OCR + تحويل لرقمي' },
                { id: 'postal_mail', nameAr: 'البريد الورقي', type: 'physical', direction: 'inbound', ai: false, dataCollection: true, digitization: 'مسح ضوئي + OCR' },
                { id: 'trade_show', nameAr: 'المعارض التجارية', type: 'event', direction: 'bidirectional', ai: false, dataCollection: true, digitization: 'QR + تطبيق + بطاقات رقمية' },
                { id: 'business_card', nameAr: 'بطاقات العمل', type: 'physical', direction: 'inbound', ai: true, dataCollection: true, digitization: 'مسح + OCR + إدخال CRM آلي' }
            ],
            // ─── الأساس الشرعي ───
            shariaFoundation: {
                quran: [
                    'بَلِّغُوا عَنِّي وَلَوْ آيَةً — التبليغ بكل وسيلة',
                    'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ — المائدة ٢',
                    'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ — الأنفال ٦٠ (القوة بكل وسيلة)',
                    'وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ — المطففين ٢٦'
                ],
                hadith: [
                    'الدين النصيحة — مسلم (النصيحة عبر كل قناة)',
                    'بلّغوا عني ولو آية — البخاري',
                    'من دلّ على خير فله مثل أجر فاعله — مسلم'
                ],
                rules: [
                    'لا إزعاج — لا ضرر ولا ضرار',
                    'صدق المحتوى — من غشنا فليس منا',
                    'حماية الخصوصية — وَلَا تَجَسَّسُوا',
                    'استئذان قبل الإرسال — يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَدْخُلُوا بُيُوتًا غَيْرَ بُيُوتِكُمْ حَتَّىٰ تَسْتَأْنِسُوا',
                    'مراعاة أوقات الراحة — لا إشعارات وقت النوم إلا للضرورة',
                    'لا محتوى محرّم — صور أو كلام',
                    'التراخيص المطلوبة — احترام حقوق الغير'
                ]
            },
            // ─── إحصائيات ───
            get summary() {
                const all = [...this.core, ...this.social, ...this.marketing, ...this.sales, ...this.operations, ...this.logistics, ...this.dataSources, ...this.offline];
                return {
                    totalChannels: all.length,
                    coreChannels: this.core.length,
                    socialMedia: this.social.length,
                    marketingChannels: this.marketing.length,
                    salesChannels: this.sales.length,
                    operationsChannels: this.operations.length,
                    logisticsChannels: this.logistics.length,
                    dataSources: this.dataSources.length,
                    offlineChannels: this.offline.length,
                    aiEnabled: all.filter(c => c.ai).length,
                    dataCollectionEnabled: all.filter(c => c.dataCollection).length,
                    shariaRules: this.shariaFoundation.rules.length
                };
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 جمع البيانات الذكي
    // ═══════════════════════════════════════════════════════════════════════════
    _buildDataCollector() {
        return {
            nameAr: 'منظومة جمع البيانات الذكي',
            sources: [
                { id: 'chat_messages', nameAr: 'رسائل المحادثات', auto: true, type: 'text' },
                { id: 'user_behavior', nameAr: 'سلوك المستخدم', auto: true, type: 'behavioral' },
                { id: 'channel_preferences', nameAr: 'تفضيلات القنوات', auto: true, type: 'preference' },
                { id: 'feedback', nameAr: 'التقييمات والملاحظات', auto: true, type: 'feedback' },
                { id: 'market_signals', nameAr: 'إشارات السوق', auto: true, type: 'market' },
                { id: 'support_issues', nameAr: 'مشاكل الدعم', auto: true, type: 'issue' },
                { id: 'transaction_data', nameAr: 'بيانات المعاملات', auto: true, type: 'financial' },
                { id: 'timing_patterns', nameAr: 'أنماط التوقيت', auto: true, type: 'temporal' }
            ],
            privacyRules: [
                'لا تجمع بيانات بدون إذن — «وَلَا تَجَسَّسُوا» الحجرات ١٢',
                'تشفير البيانات الحساسة — أمانة',
                'حق المستخدم في حذف بياناته',
                'لا بيع بيانات لطرف ثالث — «لَا تَخُونُوا اللَّهَ وَالرَّسُولَ وَتَخُونُوا أَمَانَاتِكُمْ» الأنفال ٢٧'
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🧠 المحلل الذكي
    // ═══════════════════════════════════════════════════════════════════════════
    _buildAnalyzer() {
        return {
            nameAr: 'المحلل الذكي',
            analyses: [
                { id: 'sentiment', nameAr: 'تحليل المشاعر', desc: 'إيجابي / محايد / سلبي / غاضب / سعيد' },
                { id: 'intent', nameAr: 'تحليل النية', desc: 'ما يريده المستخدم فعلاً' },
                { id: 'topic', nameAr: 'تحليل الموضوع', desc: 'تصنيف الموضوع تلقائياً' },
                { id: 'urgency', nameAr: 'تحليل الاستعجال', desc: 'عادي / مهم / عاجل / حرج' },
                { id: 'language', nameAr: 'تحليل اللغة', desc: 'عربي / إنجليزي / مختلط' },
                { id: 'pattern', nameAr: 'تحليل الأنماط', desc: 'كشف الأنماط المتكررة' },
                { id: 'trend', nameAr: 'تحليل الاتجاهات', desc: 'اتجاهات الاستفسارات والطلب' },
                { id: 'satisfaction', nameAr: 'تحليل الرضا', desc: 'مستوى رضا المستخدم' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🤔 التفكير الآلي
    // ═══════════════════════════════════════════════════════════════════════════
    _buildAutoThinking() {
        return {
            nameAr: 'منظومة التفكير الآلي',
            modes: [
                { id: 'reactive', nameAr: 'تفاعلي', desc: 'يرد على الرسائل الواردة' },
                { id: 'proactive', nameAr: 'استباقي', desc: 'يبادر بالمعلومات قبل الطلب' },
                { id: 'analytical', nameAr: 'تحليلي', desc: 'يحلل البيانات المجمّعة ويستخلص رؤى' },
                { id: 'predictive', nameAr: 'تنبؤي', desc: 'يتنبأ باحتياجات المستخدم' },
                { id: 'reflective', nameAr: 'تأملي', desc: 'يراجع أداءه ويتحسن — «أَفَلَا يَتَدَبَّرُونَ»' },
                { id: 'creative', nameAr: 'إبداعي', desc: 'يقترح حلولاً جديدة' }
            ],
            decisionTree: {
                newMessage: [
                    'detect_channel → classify_intent → analyze_sentiment → check_context',
                    'generate_response → validate_sharia → adapt_channel → send_response',
                    'collect_data → update_profile → generate_insights'
                ],
                noActivity: [
                    'check_pending_orders → send_reminders',
                    'analyze_market → send_price_alerts',
                    'review_performance → self_improve'
                ]
            },
            quran: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا — محمد ٢٤'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔌 محولات القنوات
    // ═══════════════════════════════════════════════════════════════════════════
    _buildChannelAdapters() {
        return {
            web: {
                id: 'web', nameAr: 'الموقع (شات ويب)', maxLength: 5000,
                format: (text) => text,
                parse: (raw) => ({ text: raw.message, userId: raw.userId, sessionId: raw.sessionId })
            },
            sms: {
                id: 'sms', nameAr: 'رسالة نصية', maxLength: 160,
                format: (text) => text.length > 160 ? text.substring(0, 157) + '...' : text,
                parse: (raw) => ({ text: raw.Body || raw.message, userId: raw.From || raw.phone, phone: raw.From || raw.phone })
            },
            whatsapp: {
                id: 'whatsapp', nameAr: 'واتساب', maxLength: 4096,
                format: (text) => text,
                parse: (raw) => ({ text: raw.Body || raw.message, userId: raw.From || raw.phone, phone: raw.From || raw.phone, media: raw.MediaUrl0 })
            },
            email: {
                id: 'email', nameAr: 'بريد إلكتروني', maxLength: 50000,
                format: (text) => text,
                parse: (raw) => ({ text: raw.body || raw.text, userId: raw.from || raw.email, email: raw.from || raw.email, subject: raw.subject })
            },
            voice: {
                id: 'voice', nameAr: 'مكالمة صوتية', maxLength: 500,
                format: (text) => text.length > 500 ? text.substring(0, 497) + '...' : text,
                parse: (raw) => ({ text: raw.SpeechResult || raw.transcript, userId: raw.From || raw.phone, phone: raw.From || raw.phone })
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 المعالجة الرئيسية — استقبال رسالة من أي قناة
    // ═══════════════════════════════════════════════════════════════════════════
    async processMessage(rawMessage, channel = 'web', metadata = {}) {
        const startTime = Date.now();
        const adapter = this.channelAdapters[channel] || this.channelAdapters.web;
        const parsed = adapter.parse(rawMessage);
        const text = (parsed.text || '').trim();

        if (!text) return { success: false, error: 'رسالة فارغة' };

        const userId = parsed.userId || metadata.userId || 'anonymous';

        // 1. Get or create session
        const session = this._getSession(userId, channel);
        session.lastMessage = text;
        session.lastChannel = channel;
        session.messageCount++;
        session.lastActivity = Date.now();

        // 2. Analyze message
        const analysis = this._analyzeMessage(text, session);

        // 3. Collect data
        this._collectData(userId, channel, text, analysis);

        // 4. Generate AI response
        let reply;
        try {
            reply = await this._generateSmartReply(text, analysis, session, metadata);
        } catch (e) {
            reply = this._getFallbackReply(analysis);
        }

        // 5. Format for channel
        const formatted = adapter.format(reply.text);

        // 6. Log
        session.history.push({ role: 'user', text, channel, at: new Date().toISOString() });
        session.history.push({ role: 'assistant', text: formatted, channel, at: new Date().toISOString() });
        if (session.history.length > 100) session.history = session.history.slice(-100);

        const responseTime = Date.now() - startTime;
        this._updateAnalytics(channel, analysis.intent, responseTime);

        return {
            success: true,
            reply: formatted,
            channel,
            analysis: {
                intent: analysis.intent,
                sentiment: analysis.sentiment,
                urgency: analysis.urgency,
                language: analysis.language,
                topic: analysis.topic
            },
            session: { id: session.id, messageCount: session.messageCount },
            responseTimeMs: responseTime,
            suggestions: reply.suggestions || [],
            source: reply.source || 'sheikha-ai-bridge'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 تحليل الرسالة
    // ═══════════════════════════════════════════════════════════════════════════
    _analyzeMessage(text, session) {
        const lower = text.toLowerCase();

        // Intent detection
        let intent = 'general';
        let intentScore = 0;
        for (const [key, config] of Object.entries(this.smartChat.intents)) {
            if (key === 'general') continue;
            const matches = config.keywords.filter(kw => lower.includes(kw)).length;
            if (matches > intentScore) { intentScore = matches; intent = key; }
        }

        // Sentiment
        const positiveWords = ['شكر', 'ممتاز', 'جميل', 'رائع', 'أحسنت', 'بارك', 'thanks', 'great', 'excellent'];
        const negativeWords = ['مشكلة', 'سيء', 'غلط', 'خطأ', 'زعلان', 'شكوى', 'bad', 'wrong', 'error', 'problem'];
        const posCount = positiveWords.filter(w => lower.includes(w)).length;
        const negCount = negativeWords.filter(w => lower.includes(w)).length;
        const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

        // Urgency
        const urgentWords = ['عاجل', 'فوري', 'ضروري', 'urgent', 'asap', 'immediately'];
        const urgency = urgentWords.some(w => lower.includes(w)) ? 'urgent' : 'normal';

        // Language
        const arabicRatio = (text.match(/[\u0600-\u06FF]/g) || []).length / Math.max(text.length, 1);
        const language = arabicRatio > 0.3 ? 'ar' : 'en';

        // Topic
        const topicMap = {
            'metals': ['معدن', 'حديد', 'نحاس', 'الومنيوم', 'ستانلس', 'سكراب', 'metal', 'iron', 'copper', 'aluminum'],
            'pricing': ['سعر', 'اسعار', 'تكلفة', 'price', 'cost', 'quote'],
            'shipping': ['شحن', 'توصيل', 'نقل', 'حاوية', 'ship', 'deliver'],
            'account': ['حساب', 'تسجيل', 'دخول', 'كلمة مرور', 'account', 'login', 'password'],
            'payment': ['دفع', 'تحويل', 'فاتورة', 'ريال', 'pay', 'invoice'],
            'support': ['مساعدة', 'مشكلة', 'دعم', 'help', 'support']
        };
        let topic = 'general';
        for (const [t, words] of Object.entries(topicMap)) {
            if (words.some(w => lower.includes(w))) { topic = t; break; }
        }

        return { intent, intentScore, sentiment, urgency, language, topic, textLength: text.length };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🤖 توليد الرد الذكي
    // ═══════════════════════════════════════════════════════════════════════════
    async _generateSmartReply(text, analysis, session, metadata) {
        const { intent, language, sentiment } = analysis;
        let replyText = '';
        let source = 'sheikha-ai-bridge';
        let suggestions = [];

        // 1. Handle greetings
        if (intent === 'greeting') {
            const isSalam = /سلام|السلام عليكم/i.test(text);
            replyText = isSalam ? this.smartChat.greeting.muslim : this.smartChat.greeting.general;
            suggestions = ['عرض الأسعار الحية', 'تسجيل حساب', 'تتبع طلب', 'تواصل مع الدعم'];
            return { text: replyText, source, suggestions };
        }

        // 2. Try AI engine first
        if (this.aiEngine && typeof this.aiEngine.generateResponse === 'function') {
            try {
                const aiResponse = await this.aiEngine.generateResponse(text, { user: metadata.user, context: { channel: session.lastChannel, intent } });
                if (aiResponse && aiResponse.text) {
                    replyText = aiResponse.text;
                    source = 'sheikha-ai';
                }
            } catch (e) { /* fallback below */ }
        }

        // 3. Try local mind
        if (!replyText && this.localMind && typeof this.localMind.chat === 'function') {
            try {
                const localResponse = this.localMind.chat(text);
                if (localResponse && localResponse.reply) {
                    replyText = localResponse.reply;
                    source = 'sheikha-local-mind';
                }
            } catch (e) { /* fallback below */ }
        }

        // 4. Intent-based fallback
        if (!replyText) {
            replyText = this._getIntentReply(intent, language);
            source = 'sheikha-intent-engine';
        }

        // 5. Adapt for negative sentiment
        if (sentiment === 'negative' && !replyText.includes('نعتذر')) {
            replyText = 'نأسف لأي إزعاج — «وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ». ' + replyText;
        }

        // 6. Suggestions based on intent
        suggestions = this._getSuggestions(intent);

        return { text: replyText, source, suggestions };
    }

    _getIntentReply(intent, lang) {
        const replies = {
            price_inquiry: 'يمكنك الاطلاع على الأسعار الحية في صفحة السوق. أسعارنا محدّثة لحظياً بإذن الله.\n\n«وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ» — الرحمن ٩',
            order_status: 'لمتابعة طلبك، سجّل دخولك في لوحة التحكم وانتقل لقسم \"طلباتي\". يمكنني مساعدتك إذا أعطيتني رقم الطلب.',
            product_info: 'سوق شيخة متخصص في تجارة المعادن والسكراب — حديد، نحاس، ألمنيوم، ستانلس ستيل، وأكثر. ما المعدن الذي تبحث عنه؟',
            registration: 'التسجيل مجاني وسريع! يمكنك التسجيل كتاجر أو مشتري من صفحة تسجيل الدخول.\n\n«بارك الله لك فيما أعطاك»',
            support: 'فريق الدعم جاهز لمساعدتك! صِف مشكلتك وسأحاول حلها فوراً. أو تواصل مباشرة: market@sheikha.top | 0554942904',
            shipping: 'نوفر خدمات شحن متكاملة — حاويات، نقل بري، وشحن دولي. ما نوع الشحنة؟',
            payment: 'نقبل الدفع عبر: مدى | Apple Pay | STC Pay | تحويل بنكي. جميع المعاملات حلال بدون ربا.\n\n«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا»',
            sharia: 'جميع معاملات شيخة متوافقة مع الشريعة الإسلامية — لا ربا، لا غرر، لا غش. البيع عن تراضٍ.\n\n«يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ»',
            general: 'بسم الله — سوق شيخة هو أول سوق إسلامي رقمي للمعادن. كيف أخدمك اليوم؟'
        };
        return replies[intent] || replies.general;
    }

    _getSuggestions(intent) {
        const map = {
            greeting: ['عرض الأسعار', 'تسجيل حساب', 'تتبع طلب', 'الدعم'],
            price_inquiry: ['أسعار الحديد', 'أسعار النحاس', 'أسعار الألمنيوم', 'طلب عرض سعر'],
            order_status: ['طلباتي', 'تتبع الشحنة', 'إلغاء طلب', 'دعم'],
            product_info: ['حديد', 'نحاس', 'ألمنيوم', 'ستانلس', 'سكراب'],
            support: ['مشكلة تقنية', 'مشكلة في الطلب', 'استفسار عام', 'شكوى'],
            general: ['الأسعار', 'التسجيل', 'الدعم', 'عن شيخة']
        };
        return map[intent] || map.general;
    }

    _getFallbackReply(analysis) {
        return {
            text: 'شكراً لتواصلك مع سوق شيخة. جاري تحويلك لأحد المختصين. يمكنك التواصل مباشرة: market@sheikha.top\n\n«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ»',
            source: 'fallback',
            suggestions: ['الأسعار', 'التسجيل', 'الدعم']
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 جمع البيانات والتحليلات
    // ═══════════════════════════════════════════════════════════════════════════
    _collectData(userId, channel, text, analysis) {
        const entry = {
            userId: String(userId).substring(0, 20),
            channel,
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            urgency: analysis.urgency,
            topic: analysis.topic,
            language: analysis.language,
            textLength: analysis.textLength,
            at: new Date().toISOString()
        };
        this.collectedData.push(entry);
        if (this.collectedData.length > 10000) this.collectedData = this.collectedData.slice(-10000);
    }

    _updateAnalytics(channel, intent, responseTime) {
        this.analytics.totalMessages++;
        this.analytics.byChannel[channel] = (this.analytics.byChannel[channel] || 0) + 1;
        this.analytics.byIntent[intent] = (this.analytics.byIntent[intent] || 0) + 1;
        this.analytics.responseTimes.push(responseTime);
        if (this.analytics.responseTimes.length > 1000) this.analytics.responseTimes = this.analytics.responseTimes.slice(-1000);
        this.analytics.avgResponseMs = Math.round(this.analytics.responseTimes.reduce((a, b) => a + b, 0) / this.analytics.responseTimes.length);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 💡 استخلاص الرؤى (التفكير الآلي)
    // ═══════════════════════════════════════════════════════════════════════════
    generateInsights() {
        const data = this.collectedData;
        if (data.length < 5) return { success: false, message: 'بيانات غير كافية بعد.' };

        const recent = data.slice(-500);

        // Top intents
        const intentCounts = {};
        recent.forEach(d => { intentCounts[d.intent] = (intentCounts[d.intent] || 0) + 1; });
        const topIntents = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Sentiment distribution
        const sentiments = { positive: 0, neutral: 0, negative: 0 };
        recent.forEach(d => { sentiments[d.sentiment] = (sentiments[d.sentiment] || 0) + 1; });

        // Channel distribution
        const channels = {};
        recent.forEach(d => { channels[d.channel] = (channels[d.channel] || 0) + 1; });

        // Peak hours
        const hourCounts = {};
        recent.forEach(d => {
            const h = new Date(d.at).getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
        const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

        const insights = {
            sampleSize: recent.length,
            topIntents: topIntents.map(([intent, count]) => ({ intent, count, percentage: Math.round(count / recent.length * 100) })),
            sentimentDistribution: sentiments,
            sentimentScore: Math.round(((sentiments.positive * 100) + (sentiments.neutral * 50)) / Math.max(recent.length, 1)),
            channelDistribution: channels,
            peakHour: peakHour ? { hour: parseInt(peakHour[0]), count: peakHour[1] } : null,
            avgResponseMs: this.analytics.avgResponseMs,
            recommendations: [],
            quran: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ — الزمر ٩'
        };

        // Auto recommendations
        if (sentiments.negative > sentiments.positive) {
            insights.recommendations.push({ type: 'improvement', text: 'نسبة الشعور السلبي مرتفعة — يجب تحسين جودة الخدمة', priority: 'high' });
        }
        if (topIntents[0] && topIntents[0][0] === 'support') {
            insights.recommendations.push({ type: 'support', text: 'كثرة طلبات الدعم — يجب مراجعة الأسئلة الشائعة وتحسين الواجهة', priority: 'high' });
        }
        if (this.analytics.avgResponseMs > 3000) {
            insights.recommendations.push({ type: 'performance', text: 'زمن الاستجابة مرتفع — يجب تحسين أداء الذكاء الاصطناعي', priority: 'medium' });
        }

        this.insights.push({ ...insights, generatedAt: new Date().toISOString() });
        if (this.insights.length > 100) this.insights = this.insights.slice(-100);

        return { success: true, insights };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 إرسال ذكي عبر الاتصالات (يستخدم commsEngine)
    // ═══════════════════════════════════════════════════════════════════════════
    async sendSmartMessage(userId, message, preferredChannel = null) {
        if (!this.commsEngine) return { success: false, error: 'محرك الاتصالات غير متاح' };

        // Determine best channel
        const session = this.sessions.get(userId);
        const channel = preferredChannel || (session ? session.lastChannel : 'web');

        // Send via comms engine
        const result = await this.commsEngine.sendTemplate('system_alert', { message, to: userId }, [channel]);
        return { success: true, channel, result };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔄 Sessions
    // ═══════════════════════════════════════════════════════════════════════════
    _getSession(userId, channel) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, {
                id: userId,
                channels: [channel],
                history: [],
                messageCount: 0,
                firstContact: Date.now(),
                lastActivity: Date.now(),
                lastChannel: channel,
                context: {},
                preferences: {}
            });
        }
        const session = this.sessions.get(userId);
        if (!session.channels.includes(channel)) session.channels.push(channel);
        return session;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 Dashboard API
    // ═══════════════════════════════════════════════════════════════════════════
    getDashboard() {
        return {
            foundation: {
                nameAr: this.foundation.nameAr,
                nameEn: this.foundation.nameEn,
                quranCount: this.foundation.quran.length,
                hadithCount: this.foundation.hadith.length
            },
            smartChat: {
                capabilities: this.smartChat.capabilities.length,
                intents: Object.keys(this.smartChat.intents).length
            },
            channels: Object.keys(this.channelAdapters).length,
            dataCollector: {
                sources: this.dataCollector.sources.length,
                collectedRecords: this.collectedData.length,
                privacyRules: this.dataCollector.privacyRules.length
            },
            analyzer: {
                analysisTypes: this.analyzer.analyses.length
            },
            autoThinking: {
                modes: this.autoThinking.modes.length
            },
            analytics: {
                totalMessages: this.analytics.totalMessages,
                byChannel: this.analytics.byChannel,
                byIntent: this.analytics.byIntent,
                avgResponseMs: this.analytics.avgResponseMs
            },
            activeSessions: this.sessions.size,
            insightsGenerated: this.insights.length,
            aiConnected: !!(this.aiEngine),
            localMindConnected: !!(this.localMind),
            commsConnected: !!(this.commsEngine),
            universalChannels: this.universalChannels.summary,
            summary: {
                capabilities: this.smartChat.capabilities.length,
                intents: Object.keys(this.smartChat.intents).length,
                chatChannels: Object.keys(this.channelAdapters).length,
                totalUniversalChannels: this.universalChannels.summary.totalChannels,
                socialMedia: this.universalChannels.summary.socialMedia,
                marketingChannels: this.universalChannels.summary.marketingChannels,
                salesChannels: this.universalChannels.summary.salesChannels,
                operationsChannels: this.universalChannels.summary.operationsChannels,
                logisticsChannels: this.universalChannels.summary.logisticsChannels,
                dataSources: this.universalChannels.summary.dataSources,
                offlineChannels: this.universalChannels.summary.offlineChannels,
                aiEnabled: this.universalChannels.summary.aiEnabled,
                analysisTypes: this.analyzer.analyses.length,
                thinkingModes: this.autoThinking.modes.length,
                quranAyat: this.foundation.quran.length,
                hadithCount: this.foundation.hadith.length
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 الحصول على حالة جميع القنوات
    // ═══════════════════════════════════════════════════════════════════════════
    getChannelStatus() {
        const channels = this.universalChannels;
        const allChannels = [
            ...channels.core.map(c => ({ ...c, category: 'core', categoryAr: 'الاتصالات الأساسية' })),
            ...channels.social.map(c => ({ ...c, category: 'social', categoryAr: 'التواصل الاجتماعي' })),
            ...channels.marketing.map(c => ({ ...c, category: 'marketing', categoryAr: 'التسويق والإعلان' })),
            ...channels.sales.map(c => ({ ...c, category: 'sales', categoryAr: 'المبيعات' })),
            ...channels.operations.map(c => ({ ...c, category: 'operations', categoryAr: 'الإدارة والعمليات' })),
            ...channels.logistics.map(c => ({ ...c, category: 'logistics', categoryAr: 'اللوجستيات' })),
            ...channels.dataSources.map(c => ({ ...c, category: 'dataSources', categoryAr: 'مصادر البيانات' })),
            ...channels.offline.map(c => ({ ...c, category: 'offline', categoryAr: 'القنوات غير الرقمية' }))
        ];
        return {
            total: allChannels.length,
            channels: allChannels,
            shariaFoundation: channels.shariaFoundation,
            summary: channels.summary
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔗 استقبال بيانات من أي قناة شاملة
    // ═══════════════════════════════════════════════════════════════════════════
    async processUniversalChannel(channelId, data, context = {}) {
        const start = Date.now();
        const allChannels = [
            ...this.universalChannels.core,
            ...this.universalChannels.social,
            ...this.universalChannels.marketing,
            ...this.universalChannels.sales,
            ...this.universalChannels.operations,
            ...this.universalChannels.logistics,
            ...this.universalChannels.dataSources,
            ...this.universalChannels.offline
        ];
        const channel = allChannels.find(c => c.id === channelId);
        if (!channel) {
            return { success: false, message: 'قناة غير معروفة: ' + channelId };
        }

        // جمع البيانات
        this.collectedData.push({
            channelId,
            channelName: channel.nameAr,
            category: channel.type,
            data,
            context,
            timestamp: new Date().toISOString()
        });

        // تحليل بالذكاء الاصطناعي إذا كانت القناة تدعم
        let aiAnalysis = null;
        if (channel.ai && data.message) {
            try {
                const result = await this.processMessage(
                    { message: data.message, userId: context.userId || 'system', sessionId: context.sessionId || channelId },
                    channelId,
                    context
                );
                aiAnalysis = result;
            } catch (e) {
                aiAnalysis = { error: e.message };
            }
        }

        // تحديث الإحصائيات
        this.analytics.byChannel[channelId] = (this.analytics.byChannel[channelId] || 0) + 1;

        const elapsed = Date.now() - start;
        return {
            success: true,
            channelId,
            channelName: channel.nameAr,
            dataCollected: true,
            aiAnalysis,
            processingMs: elapsed,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SheikhaAICommsBridge;
