'use strict';

/**
 * sheikha-mobile-hub-engine.js
 * محرك تطبيقات الجوال الشامل — منظومة شيخة
 * المرحلة ٤٢ — شيخة في كل جوال وكل متجر
 * PWA | Google Play (TWA) | App Store | Huawei | Samsung | Windows
 * بسم الله الرحمن الرحيم
 * قُلْ سِيرُوا فِي الْأَرْضِ (الأنعام:11) — التوسع والانتشار
 */

// ─────────────────────────────────────────────────────────────
// الاستراتيجية العامة — Progressive Web App أولاً
// ─────────────────────────────────────────────────────────────
const MOBILE_STRATEGY = {
    phase_1: {
        title: 'PWA الفوري (الآن)',
        tech: 'Service Worker + manifest.json (موجود في المشروع)',
        timeline: 'يعمل الآن — تحسينات 1-3 أيام',
        cost: 'صفر — يعمل على الخادم الحالي',
        reach: 'جميع الأجهزة والمتصفحات',
        stores: 'لا يحتاج متجر — التثبيت من المتصفح مباشرة',
        advantage: 'أسرع وصول — لا موافقة متجر — تحديث فوري'
    },
    phase_2: {
        title: 'Google Play (TWA) — أسبوعان',
        tech: 'Trusted Web Activity — يلف PWA كـ APK',
        timeline: '2-4 أسابيع',
        cost: '25 USD مرة واحدة (Play Console)',
        stores: ['Google Play', 'Huawei AppGallery (نفس APK)', 'Samsung Galaxy Store'],
        advantage: 'حضور في المتاجر — ثقة أكبر من التجار'
    },
    phase_3: {
        title: 'App Store iOS — متقدم',
        tech: 'React Native أو Capacitor لف PWA',
        timeline: '6-12 أسبوع',
        cost: '99 USD/سنة (Apple Developer)',
        advantage: 'وصول لمستخدمي iPhone — الفئة الأعلى إنفاقاً'
    },
    quran_ref: 'قُلْ سِيرُوا فِي الْأَرْضِ — الأنعام:11',
    halal_note: 'وصول للتجار أينما كانوا — تيسير التجارة الحلال'
};

// ─────────────────────────────────────────────────────────────
// إعداد PWA لشيخة
// ─────────────────────────────────────────────────────────────
const PWA_CONFIG = {
    manifest: {
        name: 'شيخة — سوق المعادن الإسلامي',
        short_name: 'شيخة',
        description: 'أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب — الكتاب والسنة',
        description_en: 'First Islamic Digital Economy Platform for Metals & Scrap',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1a1a2e',
        theme_color: '#D4AF37',
        lang: 'ar',
        dir: 'rtl',
        scope: '/',
        categories: ['business', 'finance', 'shopping'],
        screenshots: [
            { src: '/assets/screenshot-home.png', sizes: '1080x1920', type: 'image/png', label: 'الصفحة الرئيسية' },
            { src: '/assets/screenshot-market.png', sizes: '1080x1920', type: 'image/png', label: 'سوق المعادن' }
        ],
        icons: [
            { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
            { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
            { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
            { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
            { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        shortcuts: [
            { name: 'السوق', short_name: 'السوق', description: 'سوق المعادن والسكراب', url: '/سوق-شيخة.html', icons: [{ src: '/icons/market-96x96.png', sizes: '96x96' }] },
            { name: 'حاسبة الزكاة', short_name: 'الزكاة', description: 'احسب زكاة مالك', url: '/شيخة-الزكاة-التجارية.html', icons: [{ src: '/icons/zakat-96x96.png', sizes: '96x96' }] },
            { name: 'أسعار المعادن', short_name: 'الأسعار', description: 'أسعار المعادن اللحظية', url: '/api/market/prices', icons: [{ src: '/icons/price-96x96.png', sizes: '96x96' }] }
        ],
        related_applications: [
            { platform: 'play', url: 'https://play.google.com/store/apps/details?id=top.sheikha.market', id: 'top.sheikha.market' }
        ],
        prefer_related_applications: false
    },

    service_worker_features: {
        offline_pages: ['/', '/سوق-شيخة.html', '/شيخة-الزكاة-التجارية.html', '/offline.html'],
        cache_strategy: {
            static_assets: 'CacheFirst (CSS, JS, icons — نادراً تتغير)',
            api_data: 'NetworkFirst مع StaleWhileRevalidate (أسعار المعادن)',
            html_pages: 'NetworkFirst مع Offline Fallback'
        },
        background_sync: 'إرسال RFQ عند عودة الاتصال (IndexedDB queue)',
        periodic_background_sync: 'تحديث الأسعار في الخلفية (كل 15 دقيقة)'
    },

    installation_prompt: {
        timing: 'بعد 30 ثانية من استخدام فعلي',
        message_ar: 'أضف شيخة لشاشتك الرئيسية للوصول الفوري بدون متصفح',
        show_conditions: ['زار أكثر من مرة', 'لم يرفض من قبل', 'ليس على iOS (يختلف)']
    }
};

// ─────────────────────────────────────────────────────────────
// خطوات نشر TWA في Google Play
// ─────────────────────────────────────────────────────────────
const GOOGLE_PLAY_TWA = {
    id: 'google_play_twa',
    name: 'Google Play — TWA',
    icon: '🤖',
    steps: [
        {
            step: 1, title: 'التحقق من جاهزية PWA',
            commands: [
                'npx lighthouse https://sheikha.top --view (يجب PWA Score ≥ 90)',
                'التأكد من HTTPS، manifest.json، Service Worker'
            ]
        },
        {
            step: 2, title: 'إنشاء مشروع TWA',
            commands: [
                'npx @bubblewrap/cli init --manifest=https://sheikha.top/manifest.json',
                'bubblewrap build',
                'bubblewrap install'
            ],
            output: 'app-release-signed.apk'
        },
        {
            step: 3, title: 'رفع القيود الرقمية (Digital Asset Links)',
            action: 'إضافة ملف /.well-known/assetlinks.json على sheikha.top:',
            file_content: '[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"top.sheikha.market","sha256_cert_fingerprints":["YOUR_SHA256"]}}]'
        },
        {
            step: 4, title: 'نشر في Play Console',
            steps: [
                'play.google.com/apps/publish → New Release → Internal Testing',
                'رفع APK + وصف + Screenshots',
                'مراجعة Google (1-7 أيام)',
                'نشر للعموم'
        ]
        },
        {
            step: 5, title: 'نشر في Huawei AppGallery',
            commands: [
                'نفس APK — developer.huawei.com → My Apps → New App',
                'مراجعة Huawei (1-3 أيام)'
            ]
        }
    ],
    env_vars: {},
    package_name: 'top.sheikha.market',
    store_urls: {
        play: 'https://play.google.com/store/apps/details?id=top.sheikha.market',
        appgallery: 'https://appgallery.huawei.com/app/sheikha',
        galaxy: 'https://galaxystore.samsung.com/sheikha'
    }
};

// ─────────────────────────────────────────────────────────────
// صفحات شيخة للجوال (المحتوى المحسّن)
// ─────────────────────────────────────────────────────────────
const MOBILE_PAGES = [
    {
        url: '/',
        name: 'الرئيسية',
        mobile_priority: 1,
        mobile_features: ['أسعار المعادن اللحظية', 'قائمة بحث سريع', 'ربط سريع للتسجيل'],
        offline: true
    },
    {
        url: '/سوق-شيخة.html',
        name: 'السوق',
        mobile_priority: 1,
        mobile_features: ['فلاتر مدمجة', 'بطاقات المنتجات swiped', 'RFQ بنقرة'],
        offline: true,
        push_trigger: 'new_listing'
    },
    {
        url: '/شيخة-الزكاة-التجارية.html',
        name: 'حاسبة الزكاة',
        mobile_priority: 2,
        mobile_features: ['حاسبة بدون اتصال', 'تذكير بموعد الحول'],
        offline: true,
        push_trigger: 'zakat_reminder'
    },
    {
        url: '/لوحة-تحكم-المستخدم.html',
        name: 'لوحتي',
        mobile_priority: 1,
        mobile_features: ['إشعارات فورية', 'عروضي', 'طلباتي'],
        offline: false,
        auth_required: true
    },
    {
        url: '/تسجيل-الدخول.html',
        name: 'تسجيل الدخول',
        mobile_priority: 1,
        mobile_features: ['Google Sign-in', 'Apple Sign-in', 'OTP SMS', 'نافث'],
        offline: false
    }
];

// ─────────────────────────────────────────────────────────────
// متطلبات السوق السعودي للتطبيقات
// ─────────────────────────────────────────────────────────────
const KSA_APP_REQUIREMENTS = {
    regulatory: [
        'Privacy Policy باللغة العربية على sheikha.top/privacy',
        'Terms of Service محدثة',
        'الامتثال لنظام حماية البيانات الشخصية (PDPL) السعودي',
        'بيانات المستخدمين السعوديين تُخزَّن على خوادم في السعودية أو المنطقة الموافقة',
        'ربط بنافث للتحقق من الهوية الوطنية'
    ],
    arabic: [
        'واجهة كاملة بالعربية RTL',
        'الأرقام بالعربية أو الهندية (٠١٢٣٤٥٦٧٨٩)',
        'التاريخ الهجري جنباً إلى جنب الميلادي'
    ],
    islamic_compliance: [
        'لا محتوى محرم، لا ربا ظاهر في الواجهة',
        'توقيف التنبيهات خلال أوقات الصلاة (خيار للمستخدم)',
        'مؤشر الشريعة واضح لكل معاملة',
        'إشارة "حلال" / "شبهة" / "محرم" على الخدمات'
    ],
    payments: [
        'STC Pay Integration (الأكثر استخداماً في السعودية)',
        'Apple Pay (iOS)',
        'Google Pay (Android)',
        'Mada (البطاقات البنكية السعودية)',
        'SADAD (الفواتير)'
    ]
};

// ─────────────────────────────────────────────────────────────
// الدوال المصدرة
// ─────────────────────────────────────────────────────────────
function getEngineStats() {
    return {
        engine: 'sheikha-mobile-hub-engine',
        version: '1.0.0',
        phase: 42,
        strategy_phases: Object.keys(MOBILE_STRATEGY).filter(k => k.startsWith('phase')).length,
        pwa_manifest_shortcuts: PWA_CONFIG.manifest.shortcuts.length,
        pwa_offline_pages: PWA_CONFIG.service_worker_features.offline_pages.length,
        play_stores: 3,  // Google + Huawei + Samsung
        ios_appstore: 1,
        mobile_pages: MOBILE_PAGES.length,
        ksa_requirements: KSA_APP_REQUIREMENTS.regulatory.length
            + KSA_APP_REQUIREMENTS.arabic.length
            + KSA_APP_REQUIREMENTS.islamic_compliance.length,
        quran_ref: MOBILE_STRATEGY.quran_ref,
        current_status: 'PWA جاهز — يحتاج تحسين manifest + sw.js + اختبار Lighthouse'
    };
}

function getPWAChecklist() {
    return [
        { item: 'HTTPS على sheikha.top', status: '✅ مفعل (Vercel)' },
        { item: 'manifest.json', status: '✅ موجود — يحتاج تحديث بالاختصارات' },
        { item: 'Service Worker (sw.js)', status: '⚠️ يحتاج مراجعة وتحسين' },
        { item: 'Offline page', status: '⚠️ يحتاج إنشاء /offline.html' },
        { item: 'Icons 192x192 و 512x512', status: '⚠️ يحتاج تأكيد وجودها في /icons/' },
        { item: 'Push Notifications', status: '⚠️ يحتاج VAPID keys + FCM' },
        { item: 'Add to Home Screen prompt', status: '⚠️ يحتاج تنفيذ JS' },
        { item: 'Lighthouse PWA Score', status: '⚠️ يحتاج اختبار (هدف ≥ 90)' },
        { item: 'Background Sync', status: '⚠️ للمرحلة التالية' }
    ];
}

function getTWASteps() {
    return GOOGLE_PLAY_TWA;
}

function getMobilePages() {
    return MOBILE_PAGES;
}

function getKSARequirements() {
    return KSA_APP_REQUIREMENTS;
}

module.exports = {
    getEngineStats,
    getPWAChecklist,
    getTWASteps,
    getMobilePages,
    getKSARequirements,
    getPWAManifest: () => PWA_CONFIG.manifest,
    getMobileStrategy: () => MOBILE_STRATEGY,
    MOBILE_STRATEGY,
    PWA_CONFIG
};
