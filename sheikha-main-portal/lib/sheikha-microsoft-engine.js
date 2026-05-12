'use strict';

/**
 * sheikha-microsoft-engine.js
 * محرك Microsoft الشامل — منظومة شيخة
 * المرحلة ٤٢ — التكامل الرقمي الشامل
 * Microsoft 365 | Azure | Teams | Power Platform | Windows | Apple
 * بسم الله الرحمن الرحيم
 * وَشَاوِرْهُمْ فِي الْأَمْرِ (آل عمران:159) — التشاور والتعاون الرقمي
 */

// ─────────────────────────────────────────────────────────────
// إعداد Microsoft لشيخة
// ─────────────────────────────────────────────────────────────
const MICROSOFT_CONFIG = {
    tenant_name: 'sheikha',
    tenant_domain: 'sheikha.top',
    azure_ad_tenant_id: process.env.MICROSOFT_TENANT_ID || 'YOUR_TENANT_ID',
    client_id: process.env.MICROSOFT_CLIENT_ID || 'YOUR_CLIENT_ID',
    phase: 42,
    quran_ref: 'وَشَاوِرْهُمْ فِي الْأَمْرِ — آل عمران:159',
    integration_principle: 'التكامل مع أنظمة العالم في خدمة الاقتصاد الإسلامي'
};

// ─────────────────────────────────────────────────────────────
// Microsoft 365 — التكامل مع شيخة
// ─────────────────────────────────────────────────────────────
const MICROSOFT_365 = {
    id: 'microsoft_365',
    name: 'Microsoft 365 — تكامل شيخة',
    icon: '🟦',
    plans_assessment: {
        business_basic: { cost: '8 USD/مستخدم/شهر (~30 SAR)', storage: '1 TB', meet: '300 مشارك', recommended_for: 'التجار الأفراد' },
        business_standard: { cost: '12 USD/مستخدم/شهر (~45 SAR)', storage: '1 TB', meet: '300 مشارك', apps: 'Office Desktop', recommended_for: 'فريق شيخة الأساسي' },
        business_premium: { cost: '22 USD/مستخدم/شهر (~82 SAR)', storage: '1 TB', security: 'Defender + Intune', recommended_for: 'الأعضاء الإداريين' }
    },
    vs_google_workspace: {
        winner_email: 'تعادل (Gmail vs Outlook)',
        winner_collaboration: 'Google (Drive+Docs أسرع)',
        winner_office_desktop: 'Microsoft (Word/Excel/PowerPoint أقوى)',
        winner_security: 'Microsoft (Defender + Intune)',
        winner_arabic_rtl: 'Microsoft (دعم RTL أفضل في Office)',
        winner_cost: 'Google (أرخص عند نفس الإمكانيات)',
        sheikha_recommendation: 'Google Workspace Standard أساسي + Microsoft 365 Business Standard للتجار الذين يحتاجون Office Desktop'
    },
    services_for_sheikha: {
        teams: {
            name: 'Microsoft Teams',
            icon: '💜',
            use: 'اجتماعات الفريق + محادثات + تكامل مع Dynamics',
            sheikha_channels: ['تجار شيخة', 'إدارة السوق', 'الدعم الشرعي', 'اللوجستيات', 'الزكاة والمالية'],
            bots: 'Teams Bot للأسعار الفورية وتنبيهات شيخة',
            activation: 'admin.microsoft.com → Teams Admin Center → تفعيل'
        },
        sharepoint: {
            name: 'SharePoint Online',
            icon: '📂',
            use: 'مستودع وثائق مؤسسي + بوابة Knowledge Base',
            sheikha_use: 'كتالوج المعادن + أدلة شيخة + قوائم الأسعار + عقود الشراكة',
            activation: 'يُفعَّل تلقائياً مع M365 — admin.microsoft.com'
        },
        power_platform: {
            name: 'Power Platform (Power Automate + Power BI + Power Apps)',
            icon: '⚡',
            components: {
                power_automate: {
                    use: 'أتمتة إرسال الفواتير + تحديث قائمة الأسعار تلقائياً + تسلسل الموافقات على الصفقات',
                    flows: ['تنبيه عرض سعر جديد → Teams → WhatsApp', 'موافقة عقد → SharePoint → Email', 'تحديث سعر المعادن → إشعار جماعي']
                },
                power_bi: {
                    use: 'لوحات بيانات مؤشر شيخة + تقارير السوق التفاعلية + إحصائيات الزكاة',
                    dashboards: ['سعر المعادن اللحظي', 'حجم التداولات الأسبوعي', 'خريطة المناطق', 'مؤشر الزكاة']
                },
                power_apps: {
                    use: 'تطبيق جوال مزدوج المنصة بسرعة (iOS + Android)',
                    sheikha_app: 'تطبيق تاجر شيخة البسيط: عرض الأسعار + إضافة إعلان + RFQ'
                }
            },
            activation: 'make.powerplatform.com — يُدمج مع M365 مباشرة'
        },
        azure_ad: {
            name: 'Microsoft Entra ID (Azure AD)',
            icon: '🔐',
            use: 'تسجيل الدخول الموحد (SSO) + MFA + Conditional Access',
            sheikha_integration: {
                oauth_flow: 'تسجيل دخول بحساب Microsoft في شيخة',
                mfa: 'حماية إضافية للحسابات التجارية الكبيرة',
                groups: 'مجموعات: التجار المعتمدون، الإداريون، العلماء الشرعيون'
            },
            activation_steps: [
                'portal.azure.com → Azure Active Directory → App Registrations',
                'New Registration → اسم: Sheikha Market → Redirect URI: https://sheikha.top/auth/microsoft/callback',
                'الحصول على Client ID و Tenant ID',
                'إنشاء Client Secret',
                'ضبط .env: MICROSOFT_CLIENT_ID و MICROSOFT_CLIENT_SECRET و MICROSOFT_TENANT_ID'
            ],
            env_vars: {
                MICROSOFT_CLIENT_ID: 'YOUR_AZURE_APP_CLIENT_ID',
                MICROSOFT_CLIENT_SECRET: 'YOUR_AZURE_APP_CLIENT_SECRET',
                MICROSOFT_TENANT_ID: 'common'
            }
        },
        dynamics_365: {
            name: 'Dynamics 365 — إدارة علاقات العملاء',
            icon: '📊',
            use: 'CRM متكامل لتجار المعادن + إدارة الصفقات + خط الأعمال',
            sheikha_modules: ['Sales (المبيعات)', 'Customer Service (دعم العملاء)', 'Field Service (الزيارات الميدانية)'],
            cost: '65-150 USD/مستخدم/شهر',
            when_to_use: 'عند تجاوز 100 تاجر نشط — مناسب للمرحلة المتقدمة',
            alternative_now: 'استخدم بيانات JSON + Power BI بدلاً منه في المرحلة الحالية'
        }
    }
};

// ─────────────────────────────────────────────────────────────
// Apple — التكامل مع iOS/macOS
// ─────────────────────────────────────────────────────────────
const APPLE_INTEGRATION = {
    id: 'apple',
    name: 'Apple — تكامل iOS/macOS',
    icon: '🍎',
    services: {
        sign_in_with_apple: {
            name: 'Sign in with Apple',
            icon: '🔑',
            why_important: 'إلزامي لنشر تطبيق iOS في App Store إذا يدعم Google/Microsoft Sign-in',
            activation_steps: [
                '١. Apple Developer Account: developer.apple.com (99 USD/سنة)',
                '٢. Certificates, Identifiers & Profiles → Identifiers → Services IDs',
                '٣. إنشاء Service ID: com.sheikha.market',
                '٤. تفعيل Sign In with Apple → Configure → Domains: sheikha.top → Return URL: https://sheikha.top/auth/apple/callback',
                '٥. إنشاء Private Key للتوقيع (يُنزَّل مرة واحدة فقط — احتفظ به)',
                '٦. ضبط .env: APPLE_CLIENT_ID و APPLE_TEAM_ID و APPLE_KEY_ID و APPLE_PRIVATE_KEY'
            ],
            env_vars: {
                APPLE_CLIENT_ID: 'com.sheikha.market',
                APPLE_TEAM_ID: 'YOUR_APPLE_TEAM_ID',
                APPLE_KEY_ID: 'YOUR_APPLE_KEY_ID',
                APPLE_PRIVATE_KEY: 'YOUR_APPLE_PRIVATE_KEY_P8_CONTENT'
            },
            oauth_callback_url: 'https://sheikha.top/auth/apple/callback',
            privacy_note: 'Apple يخفي الإيميل — حفظ رقم هاتف التاجر إلزامي بديلاً'
        },
        apns: {
            name: 'Apple Push Notification Service (APNs)',
            icon: '🔔',
            use: 'Push Notifications لأجهزة iPhone/iPad/Mac',
            activation_steps: [
                'developer.apple.com → Certificates → Push Notifications Key',
                'إنشاء APNs Auth Key (p8 file)',
                'الحصول على: Key ID + Team ID + Bundle ID',
                'ضبط Firebase APNs: console.firebase.google.com → Project Settings → Cloud Messaging → APNs'
            ]
        },
        app_store: {
            name: 'App Store',
            icon: '📱',
            use: 'نشر تطبيق شيخة لـ iPhone/iPad',
            requirements: [
                'Apple Developer Account (99 USD/سنة)',
                'تطوير التطبيق بـ Swift/React Native/Flutter',
                'اجتياز مراجعة App Store (Privacy Policy إلزامية)',
                'دعم Sign in with Apple إن كان هناك تسجيل دخول اجتماعي'
            ],
            timeline: '6-12 أسبوع من البداية للنشر',
            halal_content_note: 'App Store يقبل التطبيقات المالية الإسلامية — يجب وصف واضح للشريعة'
        },
        icloud_drive: {
            name: 'iCloud Drive API',
            use: 'تخزين ومزامنة مستندات شيخة على أجهزة Apple',
            note: 'اختياري — CloudKit للتطبيق إن طُوِّر بـ Swift'
        }
    }
};

// ─────────────────────────────────────────────────────────────
// أنظمة التشغيل الأخرى
// ─────────────────────────────────────────────────────────────
const OS_INTEGRATIONS = {
    windows: {
        id: 'windows',
        name: 'Windows — تكامل شيخة',
        icon: '🪟',
        integrations: {
            windows_notifications: {
                name: 'Windows Toast Notifications',
                via: 'PWA manifest + Web Push',
                use: 'إشعارات Windows لمستخدمي Chrome/Edge على Windows 10/11'
            },
            edge_pwa: {
                name: 'Microsoft Edge PWA',
                use: 'تثبيت شيخة كتطبيق Windows من Edge',
                note: 'Edge يدعم PWA كتطبيق Windows نافذة مستقلة'
            },
            office_addins: {
                name: 'Office Add-ins (Excel + Word)',
                use: 'Add-in لاستيراد أسعار شيخة مباشرة في Excel',
                tech: 'Office.js API',
                use_case: 'التاجر يفتح Excel → Add-in شيخة → يجلب الأسعار الحالية ويحسب الزكاة'
            }
        }
    },
    android: {
        id: 'android',
        name: 'Android — متجر Google Play',
        icon: '🤖',
        app_types: {
            pwa: { name: 'PWA (أسرع وصول)', timeline: 'جاهز الآن', tech: 'service worker + manifest', note: 'يعمل كتطبيق بعد "إضافة للشاشة الرئيسية"' },
            twa: { name: 'Trusted Web Activity (TWA)', timeline: '1-2 أسبوع', tech: 'لف PWA كـ APK ونشره في Play Store', note: 'نفس شيخة.top بغلاف Android — أسرع طريق للـ Play Store' },
            native_rn: { name: 'React Native (مستقبلاً)', timeline: '3-6 أشهر', tech: 'كود مشترك iOS+Android', note: 'للمرحلة المتقدمة عند الحاجة لميزات native' }
        },
        play_store_requirements: [
            'حساب Google Play Developer: 25 USD مرة واحدة',
            'Privacy Policy صفحة على sheikha.top/privacy',
            'وصف العرب والإنجليزي',
            'لقطات شاشة (8 حداً أدنى)',
            'أيقونة 512×512 PNG'
        ],
        rating_target: '4.5+ نجوم — تجربة مستخدم سلسة وسرعة'
    },
    huawei: {
        id: 'huawei',
        name: 'Huawei AppGallery — HMS',
        icon: '🔴',
        importance: 'مهم في السعودية — نسبة أجهزة Huawei كبيرة',
        services_to_integrate: {
            push_kit: { name: 'Push Kit', use: 'بديل FCM لأجهزة Huawei (لا تدعم Google)' },
            account_kit: { name: 'Account Kit', use: 'تسجيل دخول بحساب Huawei ID' },
            map_kit: { name: 'Map Kit', use: 'بديل Google Maps لأجهزة Huawei' },
            ads_kit: { name: 'Ads Kit', use: 'إعلانات مدفوعة في AppGallery' }
        },
        activation_steps: [
            '١. developer.huawei.com → إنشاء حساب مطور (مجاني)',
            '٢. إنشاء مشروع: Sheikha Market',
            '٣. تفعيل Push Kit: agconnect.huawei.com',
            '٤. تحميل agconnect-services.json',
            '٥. نشر APK في AppGallery (مراجعة 1-3 أيام)'
        ],
        note: 'TWA تعمل في AppGallery أيضاً — نفس الـ APK تقريباً'
    },
    samsung: {
        id: 'samsung',
        name: 'Samsung Galaxy Store',
        icon: '💙',
        importance: 'ثاني أكبر متجر Android في العالم',
        app_format: 'نفس APK المستخدم في Google Play (TWA يعمل)',
        activation_steps: [
            '١. seller.samsungapps.com → تسجيل حساب مطور',
            '٢. رفع نفس APK المستخدم في Google Play',
            '٣. مراجعة تستغرق 1-5 أيام'
        ]
    }
};

// ─────────────────────────────────────────────────────────────
// matrix التكامل الشامل
// ─────────────────────────────────────────────────────────────
const INTEGRATION_MATRIX = {
    authentication: {
        google: { status: 'موجود (Phase 39)', env: 'GOOGLE_CLIENT_ID/SECRET', callback: '/auth/google/callback' },
        microsoft: { status: 'يحتاج تفعيل', env: 'MICROSOFT_CLIENT_ID/SECRET/TENANT_ID', callback: '/auth/microsoft/callback' },
        apple: { status: 'يحتاج Apple Dev Account', env: 'APPLE_CLIENT_ID/TEAM_ID/KEY_ID/PRIVATE_KEY', callback: '/auth/apple/callback' },
        nafath: { status: 'موجود (هوية رقمية سعودية)', env: 'NAFATH_CLIENT_ID/SECRET', callback: '/auth/nafath/callback' },
        phone_otp: { status: 'جاهز في محرك التنبيهات', env: 'UNIFONIC_API_KEY', method: 'POST /api/auth/otp' }
    },
    notifications: {
        whatsapp: { status: 'يحتاج Meta Business Verification', env: 'WHATSAPP_TOKEN/PHONE_ID' },
        sms: { status: 'يحتاج Unifonic Account', env: 'UNIFONIC_API_KEY' },
        push_android: { status: 'يحتاج Firebase Setup', env: 'FCM_SERVER_KEY' },
        push_ios: { status: 'يحتاج Apple Dev + APNs', env: 'APNS_KEY_ID/TEAM_ID' },
        push_huawei: { status: 'يحتاج Huawei Dev', env: 'HMS_APP_ID' },
        email: { status: 'يحتاج App Password', env: 'EMAIL_USER/PASS' },
        telegram: { status: 'الأسهل تفعيلاً', env: 'TELEGRAM_BOT_TOKEN' }
    },
    storage: {
        google_drive: { status: 'متاح مع Workspace', notes: 'استخدم Shared Drives للفريق' },
        onedrive: { status: 'يحتاج M365', notes: 'SharePoint + OneDrive للوثائق' },
        gcp_storage: { status: 'يحتاج إنشاء Buckets', notes: 'للصور والفيديوهات ثقيلة الحجم' },
        local_json: { status: 'نشط حالياً', notes: 'data/ في server — مناسب للمرحلة الحالية' }
    },
    ai: {
        gemini: { status: 'يحتاج API Key', env: 'GEMINI_API_KEY', models: '5 نماذج' },
        vertex_ai: { status: 'يحتاج GCP Project + Service Account', env: 'GOOGLE_APPLICATION_CREDENTIALS' },
        openai: { status: 'اختياري', env: 'OPENAI_API_KEY', note: 'بديل عند تعذر Gemini' },
        azure_openai: { status: 'اختياري (Microsoft)', env: 'AZURE_OPENAI_KEY/ENDPOINT', note: 'أفضل لعملاء M365' }
    }
};

// ─────────────────────────────────────────────────────────────
// الإحصائيات
// ─────────────────────────────────────────────────────────────
function getEngineStats() {
    return {
        engine: 'sheikha-microsoft-engine',
        version: '1.0.0',
        phase: 42,
        microsoft_365_services: Object.keys(MICROSOFT_365.services_for_sheikha).length,
        apple_services: Object.keys(APPLE_INTEGRATION.services).length,
        os_integrations: Object.keys(OS_INTEGRATIONS).length,
        auth_providers: Object.keys(INTEGRATION_MATRIX.authentication).length,
        notification_channels: Object.keys(INTEGRATION_MATRIX.notifications).length,
        microsoft_configured: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
        apple_configured: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID),
        quran_ref: MICROSOFT_CONFIG.quran_ref
    };
}

module.exports = {
    getEngineStats,
    getMicrosoft365: () => MICROSOFT_365,
    getAppleIntegration: () => APPLE_INTEGRATION,
    getOSIntegrations: () => OS_INTEGRATIONS,
    getIntegrationMatrix: () => INTEGRATION_MATRIX,
    MICROSOFT_CONFIG
};
