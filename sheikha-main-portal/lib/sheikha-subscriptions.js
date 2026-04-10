/**
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * شيخة — محرك إدارة الاشتراكات والمدفوعات الرقمية
 * "وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا" — الإسراء:٣٤
 * المالك: سلمان أحمد بن سلمان الراجح
 */

'use strict';

// ══════════════════════════════════════════════════════
// الاشتراكات الحالية
// ══════════════════════════════════════════════════════
const SUBSCRIPTIONS = [
    {
        id: 'hostinger',
        name: 'Hostinger Business Web Hosting',
        ar: 'هوستنجر — استضافة الأعمال',
        category: 'hosting',
        status: 'migrating',  // تم الدفع — جارٍ الهجرة لـ Azure
        migration_target: 'azure_container_apps',
        migration_status: 'in_progress',
        paid_on: '2026-04-10',
        domain_keep: 'sheikha.top',  // يبقى النطاق
        email_migrating_to: 'microsoft_365',  // البريد → M365
        url: 'https://www.hostinger.com',
        dashboard: 'https://hpanel.hostinger.com',
        plan: 'Business Web Hosting',
        features: [
            '100 مواقع', '200 GB SSD NVMe',
            'نطاق مجاني', 'SSL مجاني',
            'ذاكرة RAM 256MB / CPU 1 core',
            'CDN Cloudflare مدمج', 'Email مجاني'
        ],
        billing: {
            cycle: 'سنوي',
            currency: 'USD',
            amount_usd: 95.88,
            amount_sar: 359.55,
            next_due: '2027-04-15',  // تم الدفع بالكامل — محدّث
            paid_date: '2026-04-10',
            paid_status: 'PAID_FULL',
            auto_renew: false,  // لن يتجدد — نهاجر قبل الانتهاء
            payment_method: 'بطاقة ائتمان',
            alert_days_before: 60
        },
        sharia_note: 'خدمة استضافة — جائزة شرعاً بلا محظورات',
        rating: 7,
        verdict: 'تم الدفع — جارٍ الهجرة لـ Azure Container Apps (الأقوى)'
    },
    {
        id: 'github_copilot_enterprise',
        name: 'GitHub Copilot Enterprise',
        ar: 'GitHub Copilot Enterprise — الذكاء الاصطناعي للبرمجة',
        category: 'ai_development',
        status: 'active',
        url: 'https://github.com/features/copilot',
        dashboard: 'https://github.com/organizations/Sheikha-top/settings/copilot',
        plan: 'Enterprise',
        features: [
            'Copilot Chat غير محدود',
            'Code completion فوري',
            'Code review بالذكاء الاصطناعي',
            'Copilot Workspace',
            'تكامل كامل مع VS Code + JetBrains',
            'أمان مؤسسي + سياسات المحتوى',
            'تحليل المخاطر الأمنية',
            'دعم مؤسسي مخصص'
        ],
        billing: {
            cycle: 'شهري',
            currency: 'USD',
            amount_per_seat: 39,
            seats: 1,
            amount_usd: 39,
            amount_sar: 146.25,
            next_due: '2026-05-01',
            auto_renew: true,
            payment_method: 'بطاقة ائتمان',
            alert_days_before: 7
        },
        sharia_note: 'أداة برمجة بالذكاء الاصطناعي — جائزة شرعاً',
        rating: 10,
        verdict: 'ممتاز — ضروري ومستمر'
    },
    {
        id: 'azure_subscription',
        name: 'Microsoft Azure Subscription 1',
        ar: 'Azure — اشتراك Microsoft السحابي',
        category: 'cloud',
        status: 'active',
        url: 'https://portal.azure.com',
        dashboard: 'https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade',
        plan: 'Pay-As-You-Go',
        subscription_id: 'a7f53237-9f57-4530-af1d-c4b3751efde8',
        tenant_id: 'Sheikha-top',
        github_enterprise_linked: true,
        features: [
            '200+ خدمة سحابية',
            'AI + ML (Azure OpenAI)',
            'قواعد بيانات + تخزين',
            'شبكات + CDN عالمي',
            'أمان وهوية (Entra ID)',
            'DevOps + GitHub Actions',
            'Compliance + SOC2 + ISO27001'
        ],
        billing: {
            cycle: 'شهري حسب الاستهلاك',
            currency: 'USD',
            model: 'Pay-As-You-Go',
            estimated_monthly_usd: 0,
            free_credits_usd: 200,
            free_services_months: 12,
            is_free_trial: true,
            alert_days_before: 7,
            budget_alert_usd: 50,
            auto_renew: true,
            linked_to_github_enterprise: true,
            next_billing_date: '2026-05-01'
        },
        active_services: [
            'Azure Container Apps: sheikha-portal (في التفعيل)',
            'Azure Container Registry: sheikhaacr',
            'Azure Key Vault: sheikha-production-kv',
            'Azure DNS Zone: sheikha.top',
            'Azure Application Insights: مراقبة كاملة',
            'Azure Log Analytics: سجلات 30 يوم'
        ],
        free_services: [
            'Azure Container Apps (Consumption): مجاني للـ 2M طلب/شهر',
            'Azure Functions: مليون طلب/شهر مجاناً',
            'Azure Static Web Apps: مجاني دائم',
            'Azure Blob Storage: 5 GB مجاناً للسنة الأولى',
            'Azure Cosmos DB: 400 RU/s مجاناً دائم',
            'Azure AI Services: $200 رصيد مبدئي'
        ],
        sharia_note: 'خدمة سحابية — جائزة شرعاً. استخدم فقط ما تحتاجه لتجنب الإسراف',
        rating: 10,
        verdict: 'ممتاز — الأقوى والأكثر مرونة + Container Apps نشط'
    },
    {
        id: 'microsoft_365',
        name: 'Microsoft 365 Business Basic',
        ar: 'Microsoft 365 — البريد الاحترافي + Office',
        category: 'email_productivity',
        status: 'recommended',  // بديل هوستنجر Email
        url: 'https://www.microsoft.com/microsoft-365/business',
        dashboard: 'https://admin.microsoft.com',
        plan: 'Business Basic',
        custom_domain_email: 'market@sheikha.top',
        features: [
            'Exchange Online — بريد احترافي @sheikha.top',
            'Outlook Web + Desktop',
            'Teams للتواصل الداخلي',
            'SharePoint + OneDrive 1TB',
            'Microsoft Forms + Planner',
            'Entra ID للهوية والأمان',
            'Anti-spam + Anti-phishing متقدم',
            'تشفير رسائل E2E',
            'توافق مع Azure AD'
        ],
        billing: {
            cycle: 'شهري',
            currency: 'USD',
            amount_per_user: 6,
            users: 1,
            amount_usd: 6,
            amount_sar: 22.5,
            note: 'أرخص من هوستنجر Email بكثير',
            alert_days_before: 7
        },
        dns_records: {
            mx: 'sheikha-top.mail.protection.outlook.com',
            spf: 'v=spf1 include:spf.protection.outlook.com -all',
            autodiscover: 'autodiscover.outlook.com'
        },
        sharia_note: 'خدمة بريد واتصالات — جائزة شرعاً',
        rating: 10,
        verdict: 'الأفضل — بريد احترافي + تكامل كامل مع Azure'
    },
    {
        id: 'vercel',
        name: 'Vercel (Free/Pro)',
        ar: 'Vercel — نشر تطبيقات الويب',
        category: 'deployment',
        status: 'active',
        url: 'https://vercel.com',
        dashboard: 'https://vercel.com/dashboard',
        plan: 'Hobby (مجاني)',
        features: [
            'نشر تلقائي من GitHub',
            'CDN عالمي Vercel Edge',
            'SSL تلقائي',
            'Serverless Functions',
            'Preview Deployments',
            'Analytics أساسي'
        ],
        billing: {
            cycle: 'مجاني',
            currency: 'USD',
            amount_usd: 0,
            amount_sar: 0,
            is_free: true
        },
        sharia_note: 'خدمة نشر مجانية — جائزة شرعاً',
        rating: 9,
        verdict: 'ممتاز للنشر — مجاني وسريع'
    }
];

// ══════════════════════════════════════════════════════
// بدائل هوستنجر (الأقوى والأرخص)
// ══════════════════════════════════════════════════════
const HOSTINGER_ALTERNATIVES = [
    {
        rank: 1,
        name: 'Azure Static Web Apps + Azure Functions',
        ar: 'Azure — الحل الأمثل',
        cost_usd: 0,
        cost_sar: 0,
        note: 'مجاني لشيخة! لديك اشتراك Azure نشط — ID: a7f53237',
        why_better: [
            'مجاني بالكامل (Container Apps Consumption Free Tier)',
            'CDN عالمي Microsoft في 60+ منطقة',
            'نشر تلقائي من GitHub Actions (يعمل الآن)',
            'SSL + Custom Domain sheikha.top مجاني',
            'Docker + Node.js كامل',
            'Uptime 99.99% SLA مضمون',
            'Auto-scaling 1 → 10 replicas',
            'Key Vault للأسرار + Application Insights للمراقبة'
        ],
        migrate_steps: [
            '١. تشغيل: az group create --name sheikha-rg --location uaenorth',
            '٢. تشغيل: az deployment group create --resource-group sheikha-rg --template-file infra/main.bicep',
            '٣. رفع Docker: GitHub Actions تبني تلقائياً (/github/workflows/azure-deploy.yml جاهز)',
            '٤. توجيه DNS في هوستينجر: CNAME sheikha.top → Azure FQDN',
            '٥. نقل MX للبريد: outlook.com (Microsoft 365)',
            '٦. إيقاف auto-renew هوستينجر — توفير $95.88/سنة'
        ],
        action: 'IN_PROGRESS',
        savings_usd_year: 95.88,
        savings_sar_year: 359.55
    },
    {
        rank: 2,
        name: 'Vercel Pro',
        ar: 'Vercel — النشر الذكي',
        cost_usd: 20,
        cost_sar: 75,
        cycle: 'شهري',
        note: 'مناسب جداً — لديك Vercel مجاني حالياً',
        why_better: [
            'أسرع من هوستنجر (Edge Network)',
            'Analytics متقدم',
            'Cron Jobs',
            'دعم Node.js أفضل',
            'Preview URLs للاختبار'
        ]
    },
    {
        rank: 3,
        name: 'Cloudflare Workers + Pages',
        ar: 'Cloudflare — الأسرع عالمياً',
        cost_usd: 0,
        cost_sar: 0,
        note: 'مجاني تماماً — أسرع CDN في العالم',
        why_better: [
            'أسرع شبكة CDN في العالم (300+ نقطة)',
            'Zero-latency Edge Computing',
            'DDoS Protection مجاني',
            '100,000 طلب/يوم مجاناً',
            'Workers KV للتخزين'
        ]
    },
    {
        rank: 4,
        name: 'Railway.app',
        ar: 'Railway — تشغيل Node.js',
        cost_usd: 5,
        cost_sar: 18.75,
        note: 'أفضل لتشغيل server.js المستمر',
        why_better: [
            'يشغل server.js كعملية دائمة',
            'Auto-deploy من GitHub',
            'PostgreSQL/Redis مدمج',
            'SSL تلقائي',
            '$5/شهر فقط'
        ]
    }
];

// ══════════════════════════════════════════════════════
// تقويم المدفوعات 2026
// ══════════════════════════════════════════════════════
const PAYMENT_CALENDAR = {
    year: 2026,
    currency_rate_usd_sar: 3.75,
    payments: [
        {
            month: 'أبريل 2026',
            due_date: '2026-04-10',
            subscription: 'hostinger',
            amount_usd: 95.88,
            amount_sar: 359.55,
            status: 'PAID',
            paid_date: '2026-04-10',
            note: 'تم الدفع بالكامل — جاري الهجرة لـ Azure Container Apps'
        },
        {
            month: 'مايو 2026',
            due_date: '2026-05-01',
            days_remaining: 21,
            subscription: 'github_copilot_enterprise',
            amount_usd: 39,
            amount_sar: 146.25,
            status: 'UPCOMING',
            alert: 'GitHub Copilot Enterprise — تجديد شهري تلقائي'
        },
        {
            month: 'مايو 2026',
            due_date: '2026-05-01',
            days_remaining: 21,
            subscription: 'microsoft_365',
            amount_usd: 6,
            amount_sar: 22.5,
            status: 'RECOMMENDED',
            note: 'اشتراك Microsoft 365 — بريد market@sheikha.top الاحترافي'
        }
    ],
    annual_summary: {
        current_total_usd: 45,
        after_m365_usd: 51,
        before_migration_usd: 134.88,
        savings_vs_hostinger_usd: 83.88,
        azure_cost_usd: 0,
        vercel_cost_usd: 0
    }
};

// ══════════════════════════════════════════════════════
// توصية المهاجرة الاستراتيجية
// ══════════════════════════════════════════════════════
const MIGRATION_RECOMMENDATION = {
    title: 'توصية شيخة: هاجر من هوستنجر إلى Azure الآن',
    urgency: 'HIGH',
    reason: 'لديك اشتراك Azure نشط مع Free Tier يغطي كل احتياجات شيخة',
    steps: [
        {
            step: 1,
            action: 'تفعيل Azure Static Web Apps',
            url: 'https://portal.azure.com/#create/Microsoft.StaticApp',
            time_minutes: 10,
            cost: 'مجاني'
        },
        {
            step: 2,
            action: 'ربط Repo: Sheikha-top/sheikha-enterprise-portal',
            time_minutes: 5,
            cost: 'مجاني'
        },
        {
            step: 3,
            action: 'إضافة Custom Domain: sheikha.top',
            time_minutes: 15,
            cost: 'مجاني'
        },
        {
            step: 4,
            action: 'اختبار الموقع على Azure URL',
            time_minutes: 5,
            cost: 'مجاني'
        },
        {
            step: 5,
            action: 'تحويل DNS من هوستنجر إلى Azure (TTL 1 ساعة)',
            time_minutes: 5,
            cost: 'مجاني'
        },
        {
            step: 6,
            action: 'إلغاء هوستنجر قبل 2026-04-15 لتوفير $95.88/سنة',
            time_minutes: 5,
            savings: '$95.88/سنة = 359.55 ريال'
        }
    ],
    total_time_minutes: 45,
    annual_savings_usd: 95.88,
    annual_savings_sar: 359.55
};

// ══════════════════════════════════════════════════════
// الوظائف
// ══════════════════════════════════════════════════════
function getSubscriptions() { return SUBSCRIPTIONS; }
function getActiveSubscriptions() { return SUBSCRIPTIONS.filter(s => s.status === 'active'); }
function getSubscription(id) { return SUBSCRIPTIONS.find(s => s.id === id) || null; }
function getHostingerAlternatives() { return HOSTINGER_ALTERNATIVES; }
function getPaymentCalendar() { return PAYMENT_CALENDAR; }
function getMigrationPlan() { return MIGRATION_RECOMMENDATION; }
function getUrgentPayments() {
    return PAYMENT_CALENDAR.payments.filter(p => p.status === 'URGENT' || p.days_remaining <= 14);
}
function getMonthlyTotal() {
    const subs = SUBSCRIPTIONS.filter(s => s.billing && !s.billing.is_free);
    return subs.reduce((acc, s) => acc + (s.billing.amount_usd || 0), 0);
}
function getEngineStats() {
    return {
        total_subscriptions: SUBSCRIPTIONS.length,
        active: SUBSCRIPTIONS.filter(s => s.status === 'active').length,
        monthly_cost_usd: getMonthlyTotal(),
        annual_cost_usd: PAYMENT_CALENDAR.annual_summary.total_usd,
        annual_cost_sar: PAYMENT_CALENDAR.annual_summary.total_sar,
        potential_savings_usd: PAYMENT_CALENDAR.annual_summary.potential_savings_usd,
        urgent_payments: getUrgentPayments().length,
        azure_is_active: true,
        recommendation: 'هاجر من هوستنجر إلى Azure — وفّر 359 ريال/سنة',
        engine: 'SheikhaSubscriptions v1.0 — المرحلة ٤٧',
        quran: 'وَأَوْفُوا بِالْعَهْدِ — الإسراء:٣٤'
    };
}

module.exports = {
    getSubscriptions,
    getActiveSubscriptions,
    getSubscription,
    getHostingerAlternatives,
    getPaymentCalendar,
    getMigrationPlan,
    getUrgentPayments,
    getMonthlyTotal,
    getEngineStats,
    SUBSCRIPTIONS,
    HOSTINGER_ALTERNATIVES,
    PAYMENT_CALENDAR,
    MIGRATION_RECOMMENDATION
};
