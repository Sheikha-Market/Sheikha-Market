'use strict';

// ════════════════════════════════════════════════════════════════════════
// محرك Microsoft 365 — حساب شيخة الرسمي
// market@sheikhatop.onmicrosoft.com
// وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة:2
// ════════════════════════════════════════════════════════════════════════

// ─── حساب Microsoft الرسمي ────────────────────────────────────────────
const M365_ACCOUNT = {
    upn: 'market@sheikhatop.onmicrosoft.com',
    display_name: 'شيخة للأسواق الإسلامية',
    tenant_domain: 'sheikhatop.onmicrosoft.com',
    custom_domain: 'sheikha.top',
    tenant_id_env: 'MICROSOFT_TENANT_ID',
    client_id_env: 'MICROSOFT_CLIENT_ID',
    client_secret_env: 'MICROSOFT_CLIENT_SECRET',
    purpose: 'الحساب الرسمي لمنظومة شيخة على Microsoft 365',
    plan: 'Microsoft 365 Business Standard',
    services_included: [
        'Microsoft Teams — تواصل الفريق',
        'Exchange Online — البريد الرسمي',
        'SharePoint Online — إدارة الوثائق',
        'OneDrive 1TB — تخزين السحابة',
        'Power Platform — أتمتة العمليات',
        'Azure Active Directory — هوية وأمان',
        'Microsoft Forms — استطلاعات ونماذج',
        'Microsoft Planner — إدارة المهام'
    ]
};

// ─── إعداد Microsoft Teams ────────────────────────────────────────────
const TEAMS_CONFIG = {
    team_name: 'منظومة شيخة — Sheikha Platform',
    channels: [
        { id: 1, name: '📊 أسعار المعادن اليومية', purpose: 'تقارير الأسعار + مؤشر شيخة + تنبيهات السوق', pinned: true },
        { id: 2, name: '🤝 العقود والصفقات', purpose: 'توثيق الصفقات الكبرى + موافقات الإدارة', pinned: true },
        { id: 3, name: '⚖️ الشريعة والاستفتاء', purpose: 'استشارات المعاملات + مراجعة العقود شرعياً' },
        { id: 4, name: '🔔 تنبيهات عاجلة', purpose: 'تغيرات الأسعار الحادة + تسجيلات جديدة' },
        { id: 5, name: '🧮 الزكاة والحول', purpose: 'تذكيرات الزكاة + تقارير حساب المخزون' },
        { id: 6, name: '🛡️ الإدارة فقط', purpose: 'للإدارة العليا — مشفر ومحمي', restricted: true }
    ],
    incoming_webhook_env: 'TEAMS_WEBHOOK_URL',
    bot_token_env: 'TEAMS_BOT_TOKEN',
    setup_steps: [
        '١. افتح Teams → اختر الفريق → More options → Connectors',
        '٢. ابحث عن "Incoming Webhook" → Configure',
        '٣. سمّه "شيخة الذكاء الاصطناعي" → Create',
        '٤. انسخ الـ URL واضبطه في TEAMS_WEBHOOK_URL'
    ]
};

// ─── Exchange Online / البريد ─────────────────────────────────────────
const EXCHANGE_CONFIG = {
    primary_mailbox: 'market@sheikhatop.onmicrosoft.com',
    aliases: [
        'support@sheikhatop.onmicrosoft.com',
        'legal@sheikhatop.onmicrosoft.com',
        'zakat@sheikhatop.onmicrosoft.com'
    ],
    custom_domain_email: 'market@sheikha.top',
    send_mail_api: 'https://graph.microsoft.com/v1.0/me/sendMail',
    signature: `
سلمان أحمد الراجح | مؤسس شيخة
منظومة شيخة للتجارة الإسلامية الرقمية
🌐 sheikha.top | 📧 market@sheikha.top
لا ربا • لا غرر • لا غش • بيع الحلال الطيب
    `.trim(),
    smtp_tls: true,
    anti_spam: 'Microsoft Defender for Office 365'
};

// ─── SharePoint / إدارة الوثائق ───────────────────────────────────────
const SHAREPOINT_CONFIG = {
    site_url: 'https://sheikhatop.sharepoint.com/sites/sheikha-market',
    document_libraries: [
        { name: 'عقود-ومستندات', purpose: 'عقود البيع والشراء — موثقة رسمياً', access: 'الإدارة + محامون' },
        { name: 'فواتير-وأسعار', purpose: 'الفواتير الرسمية + عروض الأسعار', access: 'الفريق المالي' },
        { name: 'تقارير-شهرية', purpose: 'التقارير التشغيلية ومؤشر شيخة', access: 'الإدارة' },
        { name: 'صور-المنتجات', purpose: 'صور المعادن والسكراب عالية الجودة', access: 'عام داخلي' },
        { name: 'الشريعة-والأبحاث', purpose: 'مراجع شرعية وأبحاث الحلال', access: 'الفريق الشرعي' }
    ],
    lists: [
        { name: 'قائمة التجار', purpose: 'CRM التجار المسجلين' },
        { name: 'متابعة الصفقات', purpose: 'Pipeline الصفقات الجارية' }
    ]
};

// ─── Microsoft Graph API ──────────────────────────────────────────────
const GRAPH_API = {
    base_url: 'https://graph.microsoft.com/v1.0',
    endpoints: {
        me: '/me',
        send_mail: '/me/sendMail',
        calendar_events: '/me/calendar/events',
        contacts: '/me/contacts',
        teams_message: '/teams/{teamId}/channels/{channelId}/messages',
        drive_files: '/me/drive/root/children',
        users: '/users'
    },
    auth_flow: 'OAuth 2.0 Client Credentials + Authorization Code',
    scopes_required: [
        'User.Read',
        'Mail.Send',
        'Mail.ReadWrite',
        'Calendars.ReadWrite',
        'Contacts.ReadWrite',
        'Files.ReadWrite',
        'ChannelMessage.Send'
    ],
    token_url: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token'
};

// ─── قدرات المزامنة الكاملة ───────────────────────────────────────────
const SYNC_CAPABILITIES = {
    contacts: {
        status: 'جاهز',
        description: 'مزامنة جهات الاتصال (التجار) مع CRM شيخة',
        direction: 'ثنائي الاتجاه'
    },
    calendar: {
        status: 'جاهز',
        description: 'مزامنة مواعيد السوق والاجتماعات + الحول الهجري',
        direction: 'ثنائي الاتجاه'
    },
    email: {
        status: 'جاهز',
        description: 'استقبال وإرسال رسائل شيخة عبر Exchange',
        direction: 'ثنائي الاتجاه'
    },
    files: {
        status: 'جاهز',
        description: 'مشاركة ملفات العقود والفواتير عبر OneDrive',
        direction: 'رفع من شيخة إلى OneDrive'
    },
    teams_notifications: {
        status: 'يحتاج TEAMS_WEBHOOK_URL',
        description: 'تنبيهات تلقائية للصفقات الجديدة في Teams',
        trigger_events: ['تسجيل تاجر جديد', 'صفقة تجاوزت 100,000 ريال', 'تنبيه سوق عاجل']
    },
    power_automate: {
        status: 'قيد الإعداد',
        description: 'أتمتة: رد تلقائي على استفسارات + تذكيرات الزكاة',
        flows_planned: ['رد OTP Teams', 'تنبيه تقرير يومي', 'موافقة عقد تلقائية']
    }
};

// ─── خطوات التفعيل الكامل ─────────────────────────────────────────────
const ACTIVATION_STEPS = [
    {
        step: 1,
        title: 'إنشاء App Registration في Azure',
        commands: [
            'portal.azure.com → Azure Active Directory → App registrations',
            'New Registration → Name: Sheikha Market API',
            'Redirect URI: https://sheikha.top/auth/microsoft/callback',
            'نسخ: Application (client) ID + Directory (tenant) ID'
        ]
    },
    {
        step: 2,
        title: 'إنشاء Client Secret',
        commands: [
            'Certificates & secrets → New client secret',
            'Description: sheikha-portal → Expires: 24 months',
            'نسخ القيمة فوراً — لا تُعرض مرة أخرى'
        ]
    },
    {
        step: 3,
        title: 'إضافة API Permissions',
        commands: [
            'API permissions → Add permission → Microsoft Graph',
            'Delegated: User.Read, Mail.Send, Calendars.ReadWrite',
            'Application: Mail.Send (للإرسال الآلي)',
            'Grant admin consent (يحتاج Global Admin)'
        ]
    },
    {
        step: 4,
        title: 'ضبط المتغيرات في Secret Manager',
        env_vars: {
            MICROSOFT_CLIENT_ID: 'من app registration → Overview',
            MICROSOFT_CLIENT_SECRET: 'من Certificates & secrets',
            MICROSOFT_TENANT_ID: 'common أو tenant ID الفعلي',
            TEAMS_WEBHOOK_URL: 'من Teams channel → Connectors → Incoming Webhook'
        }
    },
    {
        step: 5,
        title: 'اختبار التكامل',
        commands: [
            'GET /api/m365/profile → تحقق من بيانات الحساب',
            'POST /api/m365/teams/notify → اختبر إرسال Teams',
            'GET /api/m365/sync-status → تأكد من جاهزية المزامنة'
        ]
    }
];

// ─── إرسال تنبيه لـ Teams ─────────────────────────────────────────────
async function sendTeamsNotification(title, message, color) {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
        return { success: false, message: 'TEAMS_WEBHOOK_URL غير مضبوط في البيئة', setup_guide: TEAMS_CONFIG.setup_steps };
    }
    const card = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: title,
        themeColor: color || 'D4AF37',
        title: `شيخة — ${title}`,
        text: message,
        potentialAction: [{ '@type': 'OpenUri', name: 'فتح المنصة', targets: [{ os: 'default', uri: 'https://sheikha.top' }] }]
    };
    try {
        const { default: fetch } = await import('node-fetch').catch(() => ({ default: global.fetch }));
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card)
        });
        return { success: res.ok, status: res.status, message: res.ok ? 'تم الإرسال إلى Teams' : 'فشل الإرسال' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ─── Exports ──────────────────────────────────────────────────────────
module.exports = {
    getAccountProfile: () => M365_ACCOUNT,
    getTeamsConfig: () => TEAMS_CONFIG,
    getExchangeConfig: () => EXCHANGE_CONFIG,
    getSharePointConfig: () => SHAREPOINT_CONFIG,
    getGraphAPI: () => GRAPH_API,
    getSyncCapabilities: () => SYNC_CAPABILITIES,
    getActivationSteps: () => ACTIVATION_STEPS,
    sendTeamsNotification,
    getEngineStats: () => ({
        engine: 'sheikha-m365-engine',
        version: '1.0.0',
        phase: 44,
        account: M365_ACCOUNT.upn,
        services: M365_ACCOUNT.services_included.length,
        teams_channels: TEAMS_CONFIG.channels.length,
        sharepoint_libraries: SHAREPOINT_CONFIG.document_libraries.length,
        sync_capabilities: Object.keys(SYNC_CAPABILITIES).length,
        graph_scopes: GRAPH_API.scopes_required.length,
        quran_ref: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة:2'
    }),
    getFullConfig: () => ({
        account: M365_ACCOUNT,
        teams: TEAMS_CONFIG,
        exchange: EXCHANGE_CONFIG,
        sharepoint: SHAREPOINT_CONFIG,
        graph_api: GRAPH_API,
        sync: SYNC_CAPABILITIES,
        activation: ACTIVATION_STEPS
    })
};
