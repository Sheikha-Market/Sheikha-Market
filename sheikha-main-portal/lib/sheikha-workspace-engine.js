'use strict';

// ============================================================
// محرك Google Workspace — شيخة
// دليل التفعيل الكامل لكل خدمات Google Workspace
// يعمل مع خطط: Business Starter / Standard / Plus / Enterprise
// ============================================================

// ---- خدمات Google Workspace الأساسية ----
const workspaceServices = {

    // === التواصل والبريد ===
    gmail: {
        id: 'gmail',
        name: 'Gmail for Work',
        name_ar: 'البريد المؤسسي',
        icon: '📧',
        category: 'تواصل',
        priority: 1,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        storage_gb: { starter: 30, standard: 2000, plus: 5000, enterprise: 'unlimited' },
        sheikha_use: 'بريد @sheikha.top للفريق — عروض أسعار — عقود تجارية — مراسلات العملاء',
        activation_steps: [
            'admin.google.com → Apps → Google Workspace → Gmail → تفعيل',
            'إضافة MX Records في DNS الدومين: sheikha.top',
            'إعداد SPF / DKIM / DMARC للأمان',
            'إنشاء مجموعات البريد: team@, sales@, support@, market@sheikha.top',
            'ضبط فلاتر الرسائل وقواعد الأتمتة',
            'تفعيل Confidential Mode للعقود الحساسة'
        ],
        google_console_path: 'admin.google.com/ac/apps/gmail',
        status_check: 'dns_mx_records + smtp_test',
        security_settings: ['2FA إلزامي', 'منع إعادة التوجيه الخارجي', 'DLP للوثائق'],
        halal_note: 'البريد المؤسسي يُغني عن العناوين الشخصية — يحفظ الأسرار التجارية'
    },

    google_meet: {
        id: 'google_meet',
        name: 'Google Meet',
        name_ar: 'الاجتماعات المرئية',
        icon: '📹',
        category: 'تواصل',
        priority: 2,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        limits: { starter: '100 مشارك / 60 دقيقة', standard: '150 مشارك / بلا حد', plus: '500 مشارك + تسجيل', enterprise: '1000 مشارك + بث مباشر' },
        sheikha_use: 'اجتماعات العملاء + عروض المعادن والسكراب + التفاوض على الصفقات',
        activation_steps: [
            'يُفعَّل تلقائياً مع Gmail — تأكيد من admin.google.com',
            'ضبط Meet Quality Tool لمراقبة جودة الاتصالات',
            'تفعيل التسجيل التلقائي (Standard+)',
            'إضافة خلفية شيخة المخصصة للاجتماعات (Brand Kit)',
            'ضبط Breakout Rooms لاجتماعات الفرق المختلفة',
            'تفعيل Live Captions بالعربية'
        ],
        google_console_path: 'admin.google.com/ac/apps/meet',
        halal_note: 'الاجتماع بالمرئي يُغني عن السفر المكلف — صدق الوجه'
    },

    google_chat: {
        id: 'google_chat',
        name: 'Google Chat',
        name_ar: 'المحادثات الفورية',
        icon: '💬',
        category: 'تواصل',
        priority: 3,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'قنوات: #أسعار-المعادن #الشحن #العملاء #الشريعة #التطوير',
        activation_steps: [
            'admin.google.com → Apps → Google Workspace → Chat → تفعيل',
            'إنشاء Spaces (قنوات) لكل قسم في شيخة',
            'تثبيت Chat Bots: Google Drive Bot + Calendar Bot',
            'ضبط Archive Messages Policy (لأغراض قانونية)',
            'تفعيل External Chat (للتواصل مع العملاء خارج الدومين)',
            'ربط Chat مع Workspace Integrations (Zapier/Make)'
        ],
        google_console_path: 'admin.google.com/ac/apps/chat'
    },

    // === الإنتاجية والمستندات ===
    google_drive: {
        id: 'google_drive',
        name: 'Google Drive',
        name_ar: 'مساحة التخزين',
        icon: '💾',
        category: 'إنتاجية',
        priority: 1,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        storage_gb: { starter: 30, standard: 2000, plus: 5000, enterprise: 'unlimited' },
        sheikha_use: 'عقود المعادن — فواتير الشحن — شهادات التحليل — وثائق الجمارك — تقارير المنظومة',
        activation_steps: [
            'admin.google.com → Drive → الإعدادات: ضبط المشاركة',
            'إنشاء Shared Drives (أقراص مشتركة) لكل قسم',
            'ضبط DLP: منع مشاركة وثائق سرية خارجياً',
            'تفعيل Drive File Stream على أجهزة الفريق',
            'إعداد Retention Policy للوثائق القانونية (٧ سنوات)',
            'تفعيل Priority Page لتروس الملفات الأكثر استخداماً',
            'ربط Drive بـ Google Vault للأرشفة القانونية'
        ],
        google_console_path: 'admin.google.com/ac/apps/drive'
    },

    google_docs: {
        id: 'google_docs',
        name: 'Google Docs / Sheets / Slides',
        name_ar: 'المستندات والجداول والعروض',
        icon: '📄',
        category: 'إنتاجية',
        priority: 2,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'عقود البيع — جداول أسعار المعادن — عروض تقديمية للعملاء — تقارير الشريعة',
        activation_steps: [
            'يُفعَّل تلقائياً — لا يحتاج خطوات إضافية',
            'تثبيت Add-ons المهمة: DocuSign + HelloSign للتوقيع الإلكتروني',
            'إنشاء Templates مخصصة لشيخة (عقود، فواتير، RFQ)',
            'ضبط Version History Policy (احتفاظ بكل الإصدارات)',
            'تفعيل Offline Mode للعمل بدون إنترنت',
            'Add-on: Sheets Data Connector للربط بـ server.js APIs'
        ],
        google_console_path: 'workspace.google.com/marketplace'
    },

    google_forms: {
        id: 'google_forms',
        name: 'Google Forms',
        name_ar: 'النماذج الإلكترونية',
        icon: '📋',
        category: 'إنتاجية',
        priority: 3,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'نموذج تسجيل المشترين — طلب عروض الأسعار (RFQ) — استبيانات رضا العملاء — تقييم تسليم الشحنات',
        activation_steps: [
            'forms.google.com — تفعيل فوري',
            'إنشاء نموذج RFQ مخصص لشيخة مع كل حقول المعادن والسكراب',
            'ربط Forms بـ Google Sheets (جمع الاستجابات تلقائياً)',
            'تفعيل Email Notifications عند وصول طلب جديد',
            'ضبط Conditional Logic (فروع حسب نوع المعدن)',
            'تفعيل File Upload (رفع صور البضاعة مباشرة)'
        ],
        google_console_path: 'forms.google.com'
    },

    // === إدارة المشاريع والجدولة ===
    google_calendar: {
        id: 'google_calendar',
        name: 'Google Calendar',
        name_ar: 'التقويم المؤسسي',
        icon: '📅',
        category: 'جدولة',
        priority: 1,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'مواعيد الشحنات — جلسات التفاوض — مواعيد فحص البضاعة — تقويم فريق شيخة',
        activation_steps: [
            'admin.google.com → Calendar → ضبط إعدادات المشاركة',
            'إنشاء تقويمات مشتركة: شحنات، اجتماعات، مواعيد عملاء',
            'تفعيل Resource Calendars (غرف الاجتماعات)',
            'ضبط Working Hours لكل فرد في الفريق',
            'تفعيل Appointment Scheduling (صفحة حجز مواعيد عامة)',
            'ربط Calendar بـ Google Meet (اجتماع تلقائي مع كل موعد)',
            'تكامل مع timezone العملاء الدوليين (محدد تلقائي)'
        ],
        google_console_path: 'admin.google.com/ac/apps/calendar'
    },

    google_tasks: {
        id: 'google_tasks',
        name: 'Google Tasks + Keep',
        name_ar: 'المهام والملاحظات',
        icon: '✅',
        category: 'جدولة',
        priority: 4,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'متابعة الصفقات المفتوحة — مهام الفريق — ملاحظات اجتماعات العملاء',
        activation_steps: [
            'tasks.google.com — تفعيل فوري',
            'إنشاء قوائم مهام لكل مشروع/صفقة',
            'ربط Tasks بـ Gmail (تحويل الإيميل لمهمة بنقرة)',
            'مزامنة Keep Notes مع Google Drive'
        ],
        google_console_path: 'tasks.google.com'
    },

    // === أمان وإدارة المؤسسة ===
    google_admin: {
        id: 'google_admin',
        name: 'Admin Console',
        name_ar: 'وحدة إدارة المؤسسة',
        icon: '⚙️',
        category: 'إدارة',
        priority: 1,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'إدارة المستخدمين — الصلاحيات — السياسات الأمنية — تتبع النشاط',
        activation_steps: [
            'admin.google.com — تسجيل دخول السوبر أدمن',
            'تفعيل 2-Step Verification إلزامياً لكل المستخدمين',
            'ضبط Password Policies (٨+ حروف + تغيير كل ٩٠ يوم)',
            'إنشاء Organizational Units (OU): إدارة / مبيعات / تقنية / مالية',
            'ضبط الصلاحيات لكل OU (من يرى ماذا)',
            'تفعيل Mobile Device Management (MDM) للأجهزة المحمولة',
            'مراجعة Security Checkup أسبوعياً',
            'تفعيل Context-Aware Access (تقييد الوصول بالموقع/الجهاز)'
        ],
        google_console_path: 'admin.google.com',
        security_priority: 'CRITICAL'
    },

    google_vault: {
        id: 'google_vault',
        name: 'Google Vault',
        name_ar: 'الأرشفة القانونية',
        icon: '🔐',
        category: 'إدارة',
        priority: 2,
        plans: ['business_plus', 'enterprise'],
        sheikha_use: 'أرشفة العقود والمراسلات — التحقيق في النزاعات التجارية — الامتثال النظامي',
        activation_steps: [
            'admin.google.com → Vault → تفعيل',
            'إنشاء Retention Policies: البريد ٧ سنوات، العقود ١٠ سنوات',
            'إعداد Legal Holds للنزاعات القانونية',
            'تفعيل Audit Reports لتتبع كل الوصول',
            'ربط Vault بـ Drive وGmail وChat'
        ],
        google_console_path: 'vault.google.com'
    },

    workspace_security: {
        id: 'workspace_security',
        name: 'Advanced Security',
        name_ar: 'الأمان المتقدم',
        icon: '🛡️',
        category: 'إدارة',
        priority: 3,
        plans: ['standard', 'plus', 'enterprise'],
        sheikha_use: 'حماية بيانات المعادن والأسعار — منع التجسس التجاري — أمان العقود',
        activation_steps: [
            'admin.google.com → Security → Security Dashboard',
            'تفعيل Advanced Phishing & Malware Protection في Gmail',
            'ضبط Data Loss Prevention (DLP) لمنع تسريب الأسعار',
            'تفعيل Alert Center (إنذارات أمنية فورية)',
            'ضبط Access Transparency (سجل من وصل لبياناتك)',
            'تفعيل Google Workspace Protect للملفات الحساسة',
            'إعداد Security Investigation Tool'
        ],
        google_console_path: 'admin.google.com/ac/security'
    },

    // === التعاون والتواصل الخارجي ===
    google_sites: {
        id: 'google_sites',
        name: 'Google Sites',
        name_ar: 'مواقع داخلية',
        icon: '🌐',
        category: 'تعاون',
        priority: 3,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'بوابة داخلية لفريق شيخة — لوحة معلومات الأسعار — دليل الموظفين',
        activation_steps: [
            'sites.google.com — تفعيل فوري',
            'إنشاء موقع داخلي: portal.sheikha.top (intranet)',
            'إضافة: أسعار المعادن اليومية، مواعيد الشحنات، الأخبار',
            'ربط Sites بـ Drive وCalendar وSheets',
            'ضبط الوصول: داخلي فقط (لا يظهر لخارج الدومين)'
        ],
        google_console_path: 'sites.google.com'
    },

    google_groups: {
        id: 'google_groups',
        name: 'Google Groups',
        name_ar: 'مجموعات البريد',
        icon: '👥',
        category: 'تواصل',
        priority: 4,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: 'قوائم توزيع البريد — منتدى سؤال وجواب داخلي — أرشيف المراسلات',
        activation_steps: [
            'admin.google.com → Groups → تفعيل',
            'إنشاء: all@sheikha.top, buyers@sheikha.top, traders@sheikha.top',
            'ضبط Collaborative Inbox للطلبات الواردة من العملاء',
            'تفعيل Moderation للمجموعات الخارجية'
        ],
        google_console_path: 'admin.google.com/ac/groups'
    },

    // === الذكاء الاصطناعي والأتمتة ===
    gemini_workspace: {
        id: 'gemini_workspace',
        name: 'Gemini for Google Workspace',
        name_ar: 'الذكاء الاصطناعي Gemini',
        icon: '🤖',
        category: 'ذكاء اصطناعي',
        priority: 1,
        plans: ['gemini_addon', 'enterprise'],
        price_per_user_month: { business: 20, enterprise: 30 },
        sheikha_use: [
            'كتابة مسودات عقود المعادن بالذكاء الاصطناعي',
            'تلخيص اجتماعات Meet تلقائياً',
            'ترجمة المراسلات التجارية فوراً',
            'تحليل بيانات السوق في Sheets',
            'Gemini in Gmail: رد ذكي على استفسارات العملاء'
        ],
        activation_steps: [
            'admin.google.com → Billing → إضافة Gemini for Workspace Add-on',
            'تعيين التراخيص للمستخدمين المحددين',
            'admin.google.com → Apps → Gemini → ضبط السياسات',
            'تفعيل Gemini in Gmail / Docs / Sheets / Meet / Slides',
            'ضبط Data Governance: لا حفظ بيانات للتدريب (Enterprise)',
            'تدريب الفريق على Prompt Engineering العربي'
        ],
        google_console_path: 'admin.google.com/ac/billing',
        note: 'متاح كإضافة مدفوعة — موصى به بشدة لشيخة'
    },

    google_appscript: {
        id: 'google_appscript',
        name: 'Google Apps Script + AppSheet',
        name_ar: 'أتمتة بدون كود',
        icon: '⚡',
        category: 'ذكاء اصطناعي',
        priority: 2,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        sheikha_use: [
            'أتمتة إرسال عروض الأسعار من Sheets',
            'تقارير يومية تلقائية لأسعار المعادن',
            'تطبيق جوال لفريق شيخة بدون كود (AppSheet)',
            'ربط Google Workspace بـ server.js عبر Apps Script + HTTP'
        ],
        activation_steps: [
            'script.google.com — Apps Script، لا يحتاج تفعيل',
            'إنشاء Script: إرسال تقرير يومي بأسعار المعادن عبر Gmail',
            'إنشاء Script: مزامنة بيانات العملاء بين Sheets وقاعدة بيانات شيخة',
            'AppSheet: تحويل Sheets لتطبيق جوال لمندوبي المبيعات',
            'ضبط Triggers: يومي / أسبوعي / عند تحديث ملف'
        ],
        google_console_path: 'script.google.com'
    },

    // === التكامل والربط ===
    workspace_marketplace: {
        id: 'workspace_marketplace',
        name: 'Google Workspace Marketplace',
        name_ar: 'سوق التطبيقات',
        icon: '🏪',
        category: 'تكامل',
        priority: 2,
        plans: ['starter', 'standard', 'plus', 'enterprise'],
        recommended_apps: [
            { name: 'DocuSign', use: 'توقيع العقود إلكترونياً', icon: '✍️' },
            { name: 'Slack for Google Workspace', use: 'تكامل مع Slack', icon: '💬' },
            { name: 'Zoom for Google Workspace', use: 'اجتماعات بديلة', icon: '📹' },
            { name: 'Salesforce for Gmail', use: 'CRM مع البريد', icon: '📊' },
            { name: 'Trello / Asana for Drive', use: 'إدارة المشاريع', icon: '📋' },
            { name: 'Zapier for Workspace', use: 'ربط ٥٠٠٠+ تطبيق', icon: '⚡' },
            { name: 'HelloSign', use: 'توقيع PDF العقود', icon: '📝' },
            { name: 'Grammarly for Workspace', use: 'تحسين الكتابة الإنجليزية', icon: '✅' }
        ],
        activation_steps: [
            'admin.google.com → Apps → Marketplace → ضبط سياسة التثبيت',
            'السماح بتثبيت التطبيقات الموصى بها فقط',
            'مراجعة صلاحيات كل تطبيق قبل تثبيته',
            'تدريب الفريق على الاستخدام الصحيح'
        ],
        google_console_path: 'workspace.google.com/marketplace'
    }
};

// ---- الخطط والأسعار ----
const workspacePlans = {
    business_starter: {
        id: 'business_starter',
        name: 'Business Starter',
        icon: '🥉',
        price_usd_user_month: 6,
        storage: '30 GB/مستخدم',
        meet_participants: 100,
        highlights: ['Gmail', 'Drive 30GB', 'Meet 100 مشارك', 'تدعم حتى 300 مستخدم'],
        best_for: 'فرق صغيرة ٢-١٠ أشخاص',
        sheikha_verdict: 'كافٍ للبداية — لكن مساحة التخزين محدودة'
    },
    business_standard: {
        id: 'business_standard',
        name: 'Business Standard',
        icon: '🥈',
        price_usd_user_month: 12,
        storage: '2 TB/مستخدم',
        meet_participants: 150,
        highlights: ['كل المميزات + تسجيل Meet', 'Drive 2TB مشترك', 'AppSheet Core', 'Noise cancellation'],
        best_for: 'فرق متوسطة ١٠-٥٠ شخص',
        sheikha_verdict: 'الأنسب لشيخة حالياً — أفضل توازن سعر/قيمة',
        recommended: true
    },
    business_plus: {
        id: 'business_plus',
        name: 'Business Plus',
        icon: '🥇',
        price_usd_user_month: 18,
        storage: '5 TB/مستخدم',
        meet_participants: 500,
        highlights: ['كل Standard + Google Vault', 'eDiscovery', 'Meet 500 مشارك مع تسجيل وحضور'],
        best_for: 'فرق كبيرة مع متطلبات قانونية',
        sheikha_verdict: 'موصى به عند التوسع — يضيف الأرشفة القانونية للعقود'
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        icon: '👑',
        price_usd_user_month: 'تسعير مخصص',
        storage: 'غير محدود',
        meet_participants: 1000,
        highlights: ['كل شيء + S/MIME Encryption', 'Meet 1000 + بث مباشر', 'Data regions', 'Advanced DLP'],
        best_for: 'المؤسسات الكبيرة والحكومات',
        sheikha_verdict: 'للمستقبل عند التوسع الكامل'
    }
};

// ---- قائمة التحقق الأمني للبداية ----
const securityChecklist = [
    { id: 'sc1', priority: 'CRITICAL', task: 'تفعيل التحقق بخطوتين (2FA) لجميع المستخدمين إلزامياً', admin_path: 'admin.google.com → Security → 2-step verification' },
    { id: 'sc2', priority: 'CRITICAL', task: 'إعداد سجلات DNS: MX + SPF + DKIM + DMARC لدومين sheikha.top', admin_path: 'domains.google.com أو سجل DNS الدومين' },
    { id: 'sc3', priority: 'HIGH', task: 'مراجعة التطبيقات التي لها وصول للحساب وإلغاء غير الضرورية', admin_path: 'admin.google.com → Security → API permissions' },
    { id: 'sc4', priority: 'HIGH', task: 'ضبط Context-Aware Access (منع الدخول من مواقع غير موثوقة)', admin_path: 'admin.google.com → Security → Access & data control' },
    { id: 'sc5', priority: 'HIGH', task: 'تشغيل Security Checkup للحساب الشخصي والمؤسسي', admin_path: 'myaccount.google.com/security-checkup' },
    { id: 'sc6', priority: 'MEDIUM', task: 'ضبط سياسة كلمة المرور: ١٢+ حرف + تغيير كل ٩٠ يوم', admin_path: 'admin.google.com → Security → Password management' },
    { id: 'sc7', priority: 'MEDIUM', task: 'ضبط Data Loss Prevention (DLP) لمنع تسريب الملفات الحساسة', admin_path: 'admin.google.com → Rules → DLP rules' },
    { id: 'sc8', priority: 'MEDIUM', task: 'تفعيل Mobile Device Management والمسح عن بُعد عند الضرورة', admin_path: 'admin.google.com → Devices → Mobile & endpoints' },
    { id: 'sc9', priority: 'LOW', task: 'مراجعة Audit Logs أسبوعياً لتتبع كل الأنشطة', admin_path: 'admin.google.com → Reporting → Audit & investigation' },
    { id: 'sc10', priority: 'LOW', task: 'إنشاء Recovery Email و Recovery Phone للسوبر أدمن', admin_path: 'admin.google.com → Account → Admin account recovery' }
];

// ---- خطة تفعيل شيخة (الإعداد المثالي) ----
const sheikhaActivationPlan = {
    phase1_immediate: {
        title: 'المرحلة الأولى — فوري (يوم ١)',
        steps: [
            'تسجيل الدخول admin.google.com بحساب السوبر أدمن',
            'تفعيل 2FA إلزامي لكل المستخدمين',
            'إعداد MX + SPF + DKIM + DMARC لدومين sheikha.top',
            'إنشاء حسابات الفريق: owner@, admin@, sales@, support@sheikha.top',
            'تفعيل Gmail + Calendar + Meet + Drive + Chat',
            'تشغيل Security Checkup والإجراء الآني'
        ]
    },
    phase2_week1: {
        title: 'المرحلة الثانية — الأسبوع الأول',
        steps: [
            'إنشاء Shared Drives لكل قسم بصلاحيات محددة',
            'إعداد Templates: عقود البيع + فواتير الشحن + RFQ شيخة',
            'إنشاء قنوات Chat: #أسعار #شحن #عملاء #تقنية',
            'ضبط Calendar Resources + Appointment Booking',
            'تدريب الفريق: ٢ ساعة Workspace Training',
            'ربط Google Forms بـ Sheets لاستقبال طلبات العملاء'
        ]
    },
    phase3_month1: {
        title: 'المرحلة الثالثة — الشهر الأول',
        steps: [
            'تثبيت DocuSign أو HelloSign للتوقيع الإلكتروني',
            'إنشاء Intranet (موقع داخلي) في Google Sites',
            'Apps Script: تقرير يومي بأسعار المعادن من شيخة API',
            'AppSheet: تطبيق جوال لفريق المبيعات',
            'ضبط DLP للوثائق السرية',
            'مراجعة الأذونات وتدقيق الوصول'
        ]
    },
    phase4_growth: {
        title: 'المرحلة الرابعة — النمو',
        steps: [
            'إضافة Gemini Add-on: الذكاء الاصطناعي في كل Workspace',
            'ترقية لـ Business Plus: إضافة Google Vault للأرشفة القانونية',
            'تكامل Workspace مع server.js شيخة عبر APIs',
            'إعداد Shared Drives للعملاء الخارجيين (Guest Access)',
            'تفعيل Context-Aware Access للأمان الموسع',
            'Google Workspace Training: Advanced للفريق الفني'
        ]
    }
};

// ---- توليد تقرير الإعداد ----
function getWorkspaceStats() {
    const totalServices = Object.keys(workspaceServices).length;
    const categories = [...new Set(Object.values(workspaceServices).map(s => s.category))];
    return {
        total_services: totalServices,
        categories: categories.length,
        category_list: categories,
        plans_count: Object.keys(workspacePlans).length,
        security_checklist_items: securityChecklist.length,
        activation_phases: Object.keys(sheikhaActivationPlan).length,
        recommended_plan: 'business_standard',
        total_marketplace_apps: workspaceServices.workspace_marketplace.recommended_apps.length,
        sheikha_primary_domain: 'sheikha.top',
        halal_note: 'Google Workspace يوفر بيئة عمل نظيفة — أمان كامل — لا ربا في اشتراكه'
    };
}

function getAllServices() { return workspaceServices; }
function getServiceById(id) { return workspaceServices[id] || null; }
function getServicesByCategory(cat) {
    return Object.values(workspaceServices).filter(s => s.category === cat);
}
function getAllPlans() { return workspacePlans; }
function getSecurityChecklist() { return securityChecklist; }
function getActivationPlan() { return sheikhaActivationPlan; }
function getRecommendedPlan() { return workspacePlans.business_standard; }
function getCriticalSecurityItems() {
    return securityChecklist.filter(s => s.priority === 'CRITICAL');
}

module.exports = {
    getWorkspaceStats,
    getAllServices,
    getServiceById,
    getServicesByCategory,
    getAllPlans,
    getSecurityChecklist,
    getActivationPlan,
    getRecommendedPlan,
    getCriticalSecurityItems
};
