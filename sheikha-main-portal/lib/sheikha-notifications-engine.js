'use strict';

/**
 * sheikha-notifications-engine.js
 * محرك التنبيهات الشامل — منظومة شيخة
 * المرحلة ٤٢ — التواصل الفوري الحلال
 * WhatsApp Business | SMS (OTP) | Push (FCM/APNs) | Email | Telegram
 * بسم الله الرحمن الرحيم
 * وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ (العصر:3)
 */

// ─────────────────────────────────────────────────────────────
// إعدادات عامة
// ─────────────────────────────────────────────────────────────
const NOTIFICATIONS_CONFIG = {
    app_name: 'شيخة — السوق الإسلامي للمعادن',
    app_name_en: 'Sheikha Metals Market',
    sender_id: 'SHEIKHA',          // Sender ID للـ SMS
    whatsapp_number: '966XXXXXXXXX', // رقم WhatsApp Business بعد التفعيل
    email_from: 'market@sheikha.top',
    phase: 42,
    quran_ref: 'وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ — العصر:3',
    halal_principles: [
        'لا رسائل غير مطلوبة (SPAM)',
        'إذن صريح من المستخدم قبل الإرسال',
        'تجنب الرسائل في أوقات الصلاة والراحة',
        'محتوى شرعي — بدون صور محرمة أو موسيقى',
        'سهولة إلغاء الاشتراك فوراً'
    ]
};

// ─────────────────────────────────────────────────────────────
// قنوات التواصل
// ─────────────────────────────────────────────────────────────
const NOTIFICATION_CHANNELS = {

    // ═══════════════════════════════════════
    // ١. WhatsApp Business API
    // ═══════════════════════════════════════
    whatsapp: {
        id: 'whatsapp',
        name: 'WhatsApp Business API',
        icon: '💚',
        provider: 'Meta (Official) — أو Twilio — أو Infobip',
        priority: 1,
        reach: 'السعودية: 95%+ من المستخدمين',
        cost: 'حسب الحجم — 0.005-0.01 USD/رسالة',
        features: [
            'رسائل فردية وجماعية',
            'قوالب رسائل معتمدة (Templates)',
            'صور وملفات PDF (الفواتير، العقود)',
            'أزرار تفاعلية (موافق / رفض / تفاصيل أكثر)',
            'Catalog للمنتجات والأسعار',
            'ردود تلقائية بالذكاء الاصطناعي',
            'قراءة الاستلام (✓✓ أزرق)'
        ],
        sheikha_use_cases: [
            'تأكيد تسجيل التاجر الجديد',
            'إشعار عرض سعر جديد (RFQ)',
            'تنبيه انتهاء صلاحية الإعلان',
            'تذكير موعد الزكاة',
            'إشعار وصول الشحنة',
            'تأكيد الدفع والفاتورة',
            'تنبيهات أسعار المعادن المخصصة',
            'OTP للتحقق من الجوال'
        ],
        activation_steps: [
            '١. إنشاء حساب Meta Business Manager: business.facebook.com',
            '٢. تفعيل WhatsApp Business API: developers.facebook.com/docs/whatsapp',
            '٣. تقديم رقم هاتف جديد مخصص (غير مستخدم في WhatsApp شخصي)',
            '٤. إنشاء قوالب الرسائل وانتظر موافقة Meta (24-48 ساعة)',
            '٥. الحصول على WhatsApp Business Account ID و Phone Number ID و Access Token',
            '٦. إضافة في .env: WHATSAPP_TOKEN و WHATSAPP_PHONE_ID',
            '٧. إعداد Webhook لاستقبال الردود: /api/notifications/whatsapp/webhook'
        ],
        env_vars: {
            WHATSAPP_TOKEN: 'YOUR_META_WHATSAPP_ACCESS_TOKEN',
            WHATSAPP_PHONE_ID: 'YOUR_PHONE_NUMBER_ID',
            WHATSAPP_VERIFY_TOKEN: 'sheikha_webhook_verify_2026'
        },
        api_endpoint: 'https://graph.facebook.com/v18.0/{PHONE_ID}/messages',
        template_examples: {
            welcome: { name: 'sheikha_welcome_ar', body: 'بسم الله — مرحباً {{1}} في منظومة شيخة! تسجيلك مكتمل. رقمك: {{2}}' },
            otp: { name: 'sheikha_otp_ar', body: 'رمز التحقق لمنظومة شيخة: {{1}} صالح لمدة 5 دقائق. لا تشاركه مع أحد.' },
            new_offer: { name: 'sheikha_new_offer_ar', body: 'عرض جديد في شيخة: {{1}} — الكمية: {{2}} طن — السعر: {{3}} ريال. اضغط للمزيد.' },
            zakat_reminder: { name: 'sheikha_zakat_reminder_ar', body: 'تنبيه الزكاة: حل الحول على مخزونك بتاريخ {{1}}. استخدم حاسبة الزكاة في شيخة.' }
        },
        halal_note: 'استئذان صريح قبل الإرسال — لا بريد عشوائي — سهولة الإلغاء'
    },

    // ═══════════════════════════════════════
    // ٢. SMS — الرسائل النصية
    // ═══════════════════════════════════════
    sms: {
        id: 'sms',
        name: 'SMS — الرسائل النصية',
        icon: '📱',
        providers: {
            unifonic: {
                name: 'Unifonic (موصى به — سعودي)',
                website: 'portal.unifonic.com',
                cost: '0.07-0.12 SAR/رسالة',
                otp_support: true,
                sender_id: true,
                coverage: 'السعودية + الخليج + العالم'
            },
            twilio: {
                name: 'Twilio (عالمي)',
                website: 'twilio.com',
                cost: '0.05-0.09 USD/رسالة',
                otp_support: true
            },
            stc_solutions: {
                name: 'STC Solutions (محلي)',
                website: 'stc.com.sa',
                cost: 'حسب العقد',
                coverage: 'السعودية بالدرجة الأولى'
            }
        },
        sheikha_use_cases: [
            'OTP (رمز التحقق عند التسجيل وتسجيل الدخول)',
            'تنبيه فوري لصفقة مهمة',
            'تأكيد بسيط للعملية (دون Smartphone)',
            'تنبيه للمناطق منخفضة الاتصال'
        ],
        otp_config: {
            length: 6,
            expires_minutes: 5,
            max_attempts: 3,
            resend_cooldown_seconds: 60,
            message_template: 'رمز التحقق لمنظومة شيخة: {OTP} صالح 5 دقائق. لا تشاركه.',
            message_template_en: 'Sheikha verification code: {OTP}. Valid 5 mins. Do not share.'
        },
        activation_steps: [
            '١. التسجيل في Unifonic: portal.unifonic.com → Create Account',
            '٢. إضافة Sender ID "SHEIKHA" (يستغرق موافقة 1-3 أيام)',
            '٣. شحن الرصيد (الحد الأدنى 100 SAR)',
            '٤. الحصول على API Key',
            '٥. ضبط .env: UNIFONIC_API_KEY و UNIFONIC_SENDER_ID=SHEIKHA',
            '٦. اختبار: إرسال OTP تجريبي لرقمك'
        ],
        env_vars: {
            UNIFONIC_API_KEY: 'YOUR_UNIFONIC_API_KEY',
            UNIFONIC_SENDER_ID: 'SHEIKHA',
            SMS_PROVIDER: 'unifonic'
        },
        halal_note: 'رسائل موجزة وصادقة — لا إزعاج في أوقات الراحة'
    },

    // ═══════════════════════════════════════
    // ٣. Push Notifications — FCM + APNs
    // ═══════════════════════════════════════
    push: {
        id: 'push',
        name: 'Push Notifications — إشعارات الجوال والمتصفح',
        icon: '🔔',
        providers: {
            fcm: {
                name: 'Firebase Cloud Messaging (FCM)',
                platforms: ['Android', 'Chrome', 'Firefox', 'Edge'],
                cost: 'مجاني',
                setup: 'firebase.google.com → Project Settings → Cloud Messaging'
            },
            apns: {
                name: 'Apple Push Notification Service (APNs)',
                platforms: ['iOS', 'macOS', 'Safari'],
                cost: 'مجاني (يحتاج Apple Developer Account: 99 USD/سنة)',
                setup: 'developer.apple.com → Certificates → Push Notifications'
            },
            web_push: {
                name: 'Web Push (VAPID Protocol)',
                platforms: ['Chrome', 'Firefox', 'Edge', 'Safari 16+'],
                cost: 'مجاني',
                setup: 'توليد VAPID keys: npx web-push generate-vapid-keys'
            }
        },
        sheikha_use_cases: [
            'إشعار عرض سعر جديد بالوقت الفعلي',
            'تنبيه تغيير سعر المعادن (فوق/تحت الحد المحدد)',
            'إشعار قبول الصفقة أو رفضها',
            'تذكير تجديد الاشتراك أو الإعلان',
            'خبر عاجل من سوق المعادن',
            'تنبيه حول الزكاة قبل الحول بـ 30 يوم'
        ],
        pwa_setup: {
            manifest_json: {
                name: 'شيخة — سوق المعادن',
                short_name: 'شيخة',
                background_color: '#1a1a2e',
                theme_color: '#D4AF37',
                icons: [
                    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
                ]
            },
            service_worker_registration: `
// تسجيل Service Worker في index.html
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('Sheikha SW registered'))
    .catch(err => console.error('SW Error:', err));
}`,
            request_permission: `
// طلب إذن الإشعارات
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
    });
    // إرسال subscription للخادم
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
  }
}`
        },
        activation_steps: [
            '١. تفعيل Firebase في console.firebase.google.com',
            '٢. الحصول على Firebase Server Key (Settings → Cloud Messaging)',
            '٣. توليد VAPID keys: npx web-push generate-vapid-keys',
            '٤. إضافة في .env: FCM_SERVER_KEY و VAPID_PUBLIC_KEY و VAPID_PRIVATE_KEY',
            '٥. إنشاء /public/sw.js (Service Worker)',
            '٦. ضبط middleware استقبال اشتراكات Push'
        ],
        env_vars: {
            FCM_SERVER_KEY: 'YOUR_FCM_SERVER_KEY',
            VAPID_PUBLIC_KEY: 'YOUR_VAPID_PUBLIC_KEY',
            VAPID_PRIVATE_KEY: 'YOUR_VAPID_PRIVATE_KEY',
            VAPID_SUBJECT: 'mailto:market@sheikha.top'
        }
    },

    // ═══════════════════════════════════════
    // ٤. البريد الإلكتروني — Gmail Workspace
    // ═══════════════════════════════════════
    email: {
        id: 'email',
        name: 'البريد الإلكتروني — Gmail Workspace',
        icon: '📧',
        provider: 'Google Workspace + Nodemailer',
        sheikha_use_cases: [
            'ترحيب رسمي بالتاجر الجديد',
            'إرسال الفواتير والعقود PDF',
            'تقارير السوق الأسبوعية',
            'إشعار تسجيل الدخول من جهاز جديد',
            'استعادة كلمة المرور',
            'نشرة أسعار المعادن الشهرية'
        ],
        nodemailer_config: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'market@sheikha.top',
                pass: 'GOOGLE_APP_PASSWORD'
            }
        },
        activation_steps: [
            '١. تفعيل 2FA على حساب market@sheikha.top',
            '٢. إنشاء App Password: Google Account → Security → App Passwords',
            '٣. تثبيت Nodemailer: npm install nodemailer',
            '٤. ضبط .env: EMAIL_USER=market@sheikha.top و EMAIL_PASS=الـApp Password',
            '٥. اختبار إرسال بريد تجريبي'
        ],
        env_vars: {
            EMAIL_USER: 'market@sheikha.top',
            EMAIL_PASS: 'YOUR_GOOGLE_APP_PASSWORD',
            EMAIL_FROM_NAME: 'منظومة شيخة للمعادن'
        }
    },

    // ═══════════════════════════════════════
    // ٥. Telegram Bot
    // ═══════════════════════════════════════
    telegram: {
        id: 'telegram',
        name: 'Telegram Bot — شيخة',
        icon: '✈️',
        reach: 'واسع الانتشار في المنطقة',
        sheikha_use_cases: [
            'قناة أسعار المعادن اليومية',
            'تنبيهات الصفقات والعروض',
            'مجموعة تجار شيخة',
            'بوت الاستفسارات الآلي'
        ],
        activation_steps: [
            '١. إنشاء Bot: @BotFather في Telegram → /newbot → sheikha_market_bot',
            '٢. الحصول على Bot Token',
            '٣. إنشاء قناة عامة: @SheikhaMetals',
            '٤. ضبط .env: TELEGRAM_BOT_TOKEN',
            '٥. إعداد Webhook: POST /api/notifications/telegram/webhook'
        ],
        env_vars: { TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN' },
        halal_note: 'قناة علمية نافعة — أسعار شفافة + تذكير بالزكاة'
    }
};

// ─────────────────────────────────────────────────────────────
// منطق OTP الآمن
// ─────────────────────────────────────────────────────────────
const otpStore = new Map(); // في الإنتاج: استخدم Redis

function generateOTP(length = 6) {
    const crypto = require('crypto');
    const digits = '0123456789';
    let otp = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        otp += digits[bytes[i] % 10];
    }
    return otp;
}

function storeOTP(phone, otp) {
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 دقائق
    otpStore.set(phone, { otp, expiresAt, attempts: 0 });
}

function verifyOTP(phone, inputOtp) {
    const stored = otpStore.get(phone);
    if (!stored) return { valid: false, reason: 'لا يوجد رمز طلبت إرساله' };
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(phone);
        return { valid: false, reason: 'انتهت صلاحية الرمز — اطلب رمزاً جديداً' };
    }
    stored.attempts++;
    if (stored.attempts > 3) {
        otpStore.delete(phone);
        return { valid: false, reason: 'تجاوزت عدد المحاولات المسموح بها' };
    }
    if (stored.otp !== inputOtp) {
        return { valid: false, reason: 'الرمز غير صحيح', attempts_left: 3 - stored.attempts };
    }
    otpStore.delete(phone);
    return { valid: true, message: 'تم التحقق بنجاح' };
}

// ─────────────────────────────────────────────────────────────
// قوالب الرسائل
// ─────────────────────────────────────────────────────────────
const MESSAGE_TEMPLATES = {
    otp: (otp, lang = 'ar') => lang === 'ar'
        ? `رمز التحقق لمنظومة شيخة: *${otp}*\nصالح لمدة 5 دقائق\nلا تشاركه مع أحد\nبسم الله`
        : `Sheikha verification code: *${otp}*\nValid for 5 minutes\nDo not share`,

    welcome: (name, traderCode) =>
        `بسم الله الرحمن الرحيم\nمرحباً ${name} 🌟\nأهلاً بك في منظومة شيخة للمعادن والسكراب\nرقمك التجاري: ${traderCode}\nسوق قائم على الكتاب والسنة — لا ربا لا غرر`,

    new_rfq: (product, qty, city) =>
        `📢 طلب عرض سعر جديد في شيخة\nالمنتج: ${product}\nالكمية: ${qty}\nالمنطقة: ${city}\nاضغط للرد على العرض`,

    price_alert: (metal, price, change) =>
        `⚠️ تنبيه سعر ${metal}\nالسعر الحالي: ${price} ريال/طن\nالتغير: ${change}\nمصدر: منظومة شيخة — مؤشر السوق`,

    zakat_reminder: (date, amount_estimate) =>
        `🕋 تنبيه الزكاة\nيستحق حول مخزونك بتاريخ: ${date}\nالتقدير التمهيدي: ${amount_estimate} ريال\nاستخدم حاسبة الزكاة في شيخة لحساب دقيق`,

    shipment_update: (tracking, status, eta) =>
        `📦 تحديث شحنتك\nرقم التتبع: ${tracking}\nالحالة: ${status}\nالوصول المتوقع: ${eta}\nمن منظومة شيخة اللوجستية`
};

// ─────────────────────────────────────────────────────────────
// دوال مساعدة للإرسال (تحتاج مفاتيح في .env)
// ─────────────────────────────────────────────────────────────
async function sendWhatsApp(params) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) {
        return { success: false, error: 'WhatsApp API غير مضبوط — أضف WHATSAPP_TOKEN و WHATSAPP_PHONE_ID في .env' };
    }
    const { to, message, template_name, template_params } = params;
    // في الإنتاج: استخدم fetch أو axios مع Meta API
    return {
        success: true,
        message: `WhatsApp: جاهز للإرسال إلى ${to}`,
        template: template_name || 'free_form',
        note: 'اربط بـ Meta WhatsApp Business API لتفعيل الإرسال الفعلي'
    };
}

async function sendSMS(phone, message) {
    const apiKey = process.env.UNIFONIC_API_KEY;
    const senderId = process.env.UNIFONIC_SENDER_ID || 'SHEIKHA';
    if (!apiKey) {
        return { success: false, error: 'UNIFONIC_API_KEY غير مضبوط في .env' };
    }
    return {
        success: true,
        message: `SMS: جاهز للإرسال إلى ${phone}`,
        sender_id: senderId,
        note: 'اربط بـ Unifonic API لتفعيل الإرسال الفعلي'
    };
}

async function sendOTPSMS(phone) {
    const otp = generateOTP(6);
    storeOTP(phone, otp);
    const msg = MESSAGE_TEMPLATES.otp(otp, 'ar');
    const result = await sendSMS(phone, msg);
    return { ...result, otp_generated: true, expires_in: '5 دقائق' };
}

// ─────────────────────────────────────────────────────────────
// إحصائيات المحرك
// ─────────────────────────────────────────────────────────────
function getEngineStats() {
    return {
        engine: 'sheikha-notifications-engine',
        version: '1.0.0',
        phase: 42,
        channels: Object.keys(NOTIFICATION_CHANNELS).length,
        templates: Object.keys(MESSAGE_TEMPLATES).length,
        whatsapp_configured: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
        sms_configured: !!process.env.UNIFONIC_API_KEY,
        fcm_configured: !!process.env.FCM_SERVER_KEY,
        email_configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        quran_ref: NOTIFICATIONS_CONFIG.quran_ref,
        halal_principles_count: NOTIFICATIONS_CONFIG.halal_principles.length
    };
}

module.exports = {
    getEngineStats,
    getAllChannels: () => Object.values(NOTIFICATION_CHANNELS),
    getChannelById: (id) => NOTIFICATION_CHANNELS[id] || null,
    getMessageTemplates: () => MESSAGE_TEMPLATES,
    generateOTP,
    storeOTP,
    verifyOTP,
    sendOTPSMS,
    sendWhatsApp,
    sendSMS,
    NOTIFICATIONS_CONFIG
};
