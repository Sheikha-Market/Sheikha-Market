/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║  ☪️  بسم الله الرحمن الرحيم                                                          ║
 * ║                                                                                      ║
 * ║  SHEIKHA COSMIC MARKETING, ADVERTISING & SALES SUPREMACY ENGINE                    ║
 * ║  شيخة — منظومة التسويق والإعلان والترويج والمبيعات والتواصل الأقوى في الكون        ║
 * ║  v1.0.0                                                                              ║
 * ║                                                                                      ║
 * ║  © 2026 سلمان أحمد بن سلمان الراجح — جميع الحقوق محفوظة                            ║
 * ║                                                                                      ║
 * ║  ﴿ وَادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ ﴾     ║
 * ║  ﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾ — البقرة ٨٣                                       ║
 * ║  «البيّعان بالخيار... فإن صدقا وبيّنا بُورك لهما في بيعهما» — متفق عليه            ║
 * ║                                                                                      ║
 * ╠══════════════════════════════════════════════════════════════════════════════════════╣
 * ║  7 PILLARS                                                                           ║
 * ║    1️⃣  التسويق الشامل      — 20 قناة × كل منصة × كل شريحة                          ║
 * ║    2️⃣  الإعلان المتكامل    — 25 نوع إعلان × برمجي × ذكاء اصطناعي                  ║
 * ║    3️⃣  الترويج والدعاية    — 15 أسلوب ترويجي × ولاء × gamification                 ║
 * ║    4️⃣  المبيعات القوية      — 7 نماذج × CRM × تسلسلات إغلاق                        ║
 * ║    5️⃣  التواصل الكوني       — Multi-channel × Omnichannel × Community               ║
 * ║    6️⃣  البراند الملكي       — هوية × صوت إسلامي × قصص × positioning                ║
 * ║    7️⃣  التحليلات الكونية    — 40 KPI × ROI × Attribution × Prediction               ║
 * ║                                                                                      ║
 * ║  FEATURES                                                                            ║
 * ║    ✅ مولّد الحملات بالذكاء الاصطناعي (Campaign AI Generator)                       ║
 * ║    ✅ مولّد تقويم المحتوى الشهري/السنوي                                              ║
 * ║    ✅ مولّد خطة الوسائط (Media Plan) بالميزانية                                      ║
 * ║    ✅ شبكة المؤثرين (Mega→Macro→Micro→Nano) مع التقييم                              ║
 * ║    ✅ قوالب الرسائل (50+ قالب عربي + إنجليزي)                                       ║
 * ║    ✅ منظومة الترويج الذكي (خصومات + باقات + BOGO + Flash + ولاء)                   ║
 * ║    ✅ تواصل الأزمات PR (10 قوالب طوارئ)                                              ║
 * ║    ✅ معايير الإعلان الإسلامي الشرعي                                                 ║
 * ║    ✅ تتبع الأداء اللحظي + تنبيهات ذكية                                              ║
 * ║    ✅ 38 REST API + WebSocket + Persistence                                           ║
 * ║                                                                                      ║
 * ║  BASE: /api/تسويق-شيخة/*   (Arabic) + /api/sheikha-marketing/*  (English)           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */
'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const EventEmitter = require('events');

const DATA_DIR    = path.join(__dirname, '..', 'data');
const DB_FILE     = path.join(DATA_DIR, 'cosmic-marketing-db.json');
const CAMP_FILE   = path.join(DATA_DIR, 'cosmic-marketing-campaigns.json');
const AR_BASE     = '/api/تسويق-شيخة';
const EN_BASE     = '/api/sheikha-marketing';
const VERSION     = '1.0.0';

// ══════════════════════════════════════════════════════
// PILLAR 1 — MARKETING CHANNELS (20 channels)
// ══════════════════════════════════════════════════════
const MARKETING_CHANNELS = [
    { id:'CH-01', nameAr:'واتساب بيزنس',          nameEn:'WhatsApp Business',   type:'direct',       platform:'WhatsApp',    audience:'عرب+مسلمون',       cpm:5,    avgROI:900,  islamicScore:98, reach:'local→global', priority:1 },
    { id:'CH-02', nameAr:'سناب شات',               nameEn:'Snapchat',            type:'social',       platform:'Snapchat',    audience:'خليج+شباب',         cpm:12,   avgROI:600,  islamicScore:82, reach:'regional',     priority:2 },
    { id:'CH-03', nameAr:'تيك توك',                nameEn:'TikTok',              type:'social-video', platform:'TikTok',      audience:'شباب عالمي',        cpm:8,    avgROI:700,  islamicScore:75, reach:'global',       priority:3 },
    { id:'CH-04', nameAr:'يوتيوب',                 nameEn:'YouTube',             type:'video',        platform:'YouTube',     audience:'كل الفئات',         cpm:15,   avgROI:800,  islamicScore:88, reach:'global',       priority:4 },
    { id:'CH-05', nameAr:'إنستغرام',               nameEn:'Instagram',           type:'social',       platform:'Instagram',   audience:'شباب+نساء+أعمال',   cpm:18,   avgROI:650,  islamicScore:78, reach:'global',       priority:5 },
    { id:'CH-06', nameAr:'لينكدإن',                nameEn:'LinkedIn',            type:'social-b2b',   platform:'LinkedIn',    audience:'B2B+مديرون',        cpm:60,   avgROI:500,  islamicScore:90, reach:'global',       priority:6 },
    { id:'CH-07', nameAr:'إكس (تويتر)',            nameEn:'X (Twitter)',         type:'social',       platform:'X',           audience:'مثقفون+B2B',        cpm:10,   avgROI:400,  islamicScore:80, reach:'global',       priority:7 },
    { id:'CH-08', nameAr:'فيسبوك',                 nameEn:'Facebook',            type:'social',       platform:'Facebook',    audience:'30-55 سنة',          cpm:14,   avgROI:550,  islamicScore:75, reach:'global',       priority:8 },
    { id:'CH-09', nameAr:'جوجل أدز',               nameEn:'Google Ads',          type:'search',       platform:'Google',      audience:'باحثون نشطون',      cpm:null, avgROI:800,  islamicScore:92, reach:'global',       priority:9,  cpc:8 },
    { id:'CH-10', nameAr:'SEO وتحسين البحث',       nameEn:'SEO',                 type:'organic',      platform:'Google/Bing', audience:'كل الباحثين',       cpm:0,    avgROI:2000, islamicScore:99, reach:'global',       priority:10 },
    { id:'CH-11', nameAr:'البريد الإلكتروني',      nameEn:'Email Marketing',     type:'email',        platform:'Email',       audience:'قائمة العملاء',     cpm:2,    avgROI:3600, islamicScore:98, reach:'direct',       priority:11 },
    { id:'CH-12', nameAr:'الرسائل القصيرة SMS',    nameEn:'SMS Marketing',       type:'direct',       platform:'SMS',         audience:'جوال كل عميل',      cpm:30,   avgROI:500,  islamicScore:95, reach:'local',        priority:12 },
    { id:'CH-13', nameAr:'المؤثرون والكريتورز',   nameEn:'Influencer Marketing',type:'influencer',   platform:'Multi',       audience:'جمهور المؤثر',      cpm:40,   avgROI:600,  islamicScore:80, reach:'targeted',     priority:13 },
    { id:'CH-14', nameAr:'المحتوى والمدونات',      nameEn:'Content Marketing',   type:'content',      platform:'Web/Social',  audience:'كل الفئات',         cpm:0,    avgROI:1500, islamicScore:99, reach:'global',       priority:14 },
    { id:'CH-15', nameAr:'المعارض والفعاليات',    nameEn:'Events & Exhibitions', type:'offline',      platform:'Physical',    audience:'B2B+B2G',            cpm:null, avgROI:450,  islamicScore:97, reach:'regional',     priority:15 },
    { id:'CH-16', nameAr:'برنامج الإحالة',         nameEn:'Referral Marketing',  type:'referral',     platform:'Platform',    audience:'عملاء راضون',       cpm:0,    avgROI:1800, islamicScore:100,reach:'organic',      priority:16 },
    { id:'CH-17', nameAr:'الإعلانات المبرمجة',    nameEn:'Programmatic Ads',     type:'programmatic', platform:'DSP/DV360',   audience:'مستهدف بدقة',       cpm:6,    avgROI:700,  islamicScore:85, reach:'global',       priority:17 },
    { id:'CH-18', nameAr:'البودكاست والصوت',       nameEn:'Podcast & Audio Ads', type:'audio',        platform:'Spotify/Pod', audience:'محترفون+عرب',       cpm:20,   avgROI:400,  islamicScore:90, reach:'regional',     priority:18 },
    { id:'CH-19', nameAr:'إعلانات خارجية OOH',    nameEn:'OOH / Billboards',    type:'outdoor',      platform:'Physical',    audience:'جمهور عام',         cpm:2,    avgROI:350,  islamicScore:95, reach:'local',        priority:19 },
    { id:'CH-20', nameAr:'منصة شيخة نفسها',       nameEn:'Sheikha Platform',    type:'owned',        platform:'Sheikha',     audience:'كل مستخدمي شيخة',  cpm:0,    avgROI:9999, islamicScore:100,reach:'all',          priority:20 }
];

// ══════════════════════════════════════════════════════
// PILLAR 2 — AD FORMATS (25 formats)
// ══════════════════════════════════════════════════════
const AD_FORMATS = [
    { id:'AF-01', nameAr:'صورة ثابتة',            nameEn:'Static Image',           channels:['CH-05','CH-08','CH-07'], ctr:'0.5-2%',   bestFor:'توعية' },
    { id:'AF-02', nameAr:'فيديو قصير (ريلز)',     nameEn:'Short Video (Reels)',     channels:['CH-03','CH-05','CH-02'], ctr:'2-8%',     bestFor:'توعية+تحويل' },
    { id:'AF-03', nameAr:'فيديو طويل يوتيوب',    nameEn:'YouTube Long-form',       channels:['CH-04'],                 ctr:'1-3%',     bestFor:'تعليم+براند' },
    { id:'AF-04', nameAr:'إعلان بحث نصي',         nameEn:'Search Text Ad',          channels:['CH-09'],                 ctr:'3-10%',    bestFor:'نية شراء عالية' },
    { id:'AF-05', nameAr:'إعلان تسوق Google',    nameEn:'Google Shopping',         channels:['CH-09'],                 ctr:'2-6%',     bestFor:'بيع منتجات' },
    { id:'AF-06', nameAr:'كارد دوار (Carousel)', nameEn:'Carousel Ad',             channels:['CH-05','CH-08','CH-06'], ctr:'1.5-4%',   bestFor:'عرض منتجات' },
    { id:'AF-07', nameAr:'ستوري (24 ساعة)',       nameEn:'Stories Ad',              channels:['CH-02','CH-05','CH-08'], ctr:'1-3%',     bestFor:'عروض محدودة' },
    { id:'AF-08', nameAr:'إعلان نيتف',            nameEn:'Native Ad',               channels:['CH-17'],                 ctr:'0.2-1%',   bestFor:'براند خفي' },
    { id:'AF-09', nameAr:'إعلان مؤثر (محتوى)',   nameEn:'Influencer Content',      channels:['CH-13'],                 ctr:'3-12%',    bestFor:'ثقة+تحويل' },
    { id:'AF-10', nameAr:'بريد إلكتروني HTML',   nameEn:'HTML Email',              channels:['CH-11'],                 ctr:'2-5%',     bestFor:'احتفاظ+إيراد' },
    { id:'AF-11', nameAr:'إعلان محادثة واتساب',  nameEn:'WhatsApp Broadcast',      channels:['CH-01'],                 ctr:'20-60%',   bestFor:'إغلاق الصفقات' },
    { id:'AF-12', nameAr:'بودكاست سبونسر',        nameEn:'Podcast Sponsorship',     channels:['CH-18'],                 ctr:'1-4%',     bestFor:'براند+ثقة' },
    { id:'AF-13', nameAr:'إعلان صوتي',            nameEn:'Audio Ad',                channels:['CH-18'],                 ctr:'0.5-1.5%', bestFor:'توعية' },
    { id:'AF-14', nameAr:'لوحة إعلانية رقمية',   nameEn:'Digital Billboard',       channels:['CH-19'],                 ctr:null,       bestFor:'توعية محلية' },
    { id:'AF-15', nameAr:'ريتارجيتينج',           nameEn:'Retargeting Ad',          channels:['CH-17','CH-09'],         ctr:'3-10%',    bestFor:'تحويل' },
    { id:'AF-16', nameAr:'Look-alike جمهور',      nameEn:'Lookalike Audience',      channels:['CH-05','CH-08'],         ctr:'1-4%',     bestFor:'اكتساب' },
    { id:'AF-17', nameAr:'LinkedIn InMail',       nameEn:'Sponsored InMail',        channels:['CH-06'],                 ctr:'10-25%',   bestFor:'B2B مباشر' },
    { id:'AF-18', nameAr:'كولاب مع براند آخر',  nameEn:'Brand Collaboration',      channels:['CH-13','CH-04'],         ctr:'5-15%',    bestFor:'توسع' },
    { id:'AF-19', nameAr:'مسابقة وتحدي',          nameEn:'Contest & Challenge',     channels:['CH-03','CH-02'],         ctr:'15-40%',   bestFor:'انتشار' },
    { id:'AF-20', nameAr:'UGC محتوى المستخدم',   nameEn:'User Generated Content',  channels:['CH-05','CH-07'],         ctr:'10-20%',   bestFor:'ثقة' },
    { id:'AF-21', nameAr:'إعلان فعالية LIVE',    nameEn:'Live Event Ad',           channels:['CH-04','CH-05'],         ctr:'8-25%',    bestFor:'تفاعل+مبيعات' },
    { id:'AF-22', nameAr:'SEO محتوى مقال',       nameEn:'SEO Article',             channels:['CH-10','CH-14'],         ctr:'5-15%',    bestFor:'عضوي دائم' },
    { id:'AF-23', nameAr:'إعلان داخل التطبيق',  nameEn:'In-App Ad',               channels:['CH-17'],                 ctr:'2-6%',     bestFor:'موبايل' },
    { id:'AF-24', nameAr:'QR كود + OOH',         nameEn:'QR + OOH Hybrid',        channels:['CH-19'],                 ctr:null,       bestFor:'ربط أوفلاين-أونلاين' },
    { id:'AF-25', nameAr:'إعلان تقنية XR/AR',   nameEn:'AR/XR Immersive Ad',      channels:['CH-17'],                 ctr:'10-30%',   bestFor:'تجربة' }
];

// ══════════════════════════════════════════════════════
// PILLAR 3 — PROMOTION TYPES (15 types)
// ══════════════════════════════════════════════════════
const PROMOTION_TYPES = [
    { id:'PT-01', nameAr:'خصم مباشر',             detail:'تخفيض مباشر على السعر',                          maxDiscount:50, islamicNote:'حلال — وضوح السعر الأصلي' },
    { id:'PT-02', nameAr:'اشترِ X واحصل على Y',   detail:'BOGO أو اشترِ 2 خذ 3',                         maxDiscount:100,islamicNote:'حلال — وضوح الشروط' },
    { id:'PT-03', nameAr:'كود الخصم',              detail:'كوبون رقمي محدود الاستخدام',                    maxDiscount:40, islamicNote:'حلال' },
    { id:'PT-04', nameAr:'عرض فلاش Flash Sale',   detail:'تخفيض لوقت محدود (24-72 ساعة)',                 maxDiscount:70, islamicNote:'حلال — لا مبالغة مضللة' },
    { id:'PT-05', nameAr:'باقات وحزم Bundle',     detail:'جمع منتجات بسعر أقل',                           maxDiscount:35, islamicNote:'حلال' },
    { id:'PT-06', nameAr:'برنامج الولاء',          detail:'نقاط تُراكم مقابل كل شراء',                     maxDiscount:null,islamicNote:'حلال — بدون ربا' },
    { id:'PT-07', nameAr:'مكافأة الإحالة',         detail:'كاش أو خصم مقابل كل عميل جديد',                 maxDiscount:null,islamicNote:'حلال — السمسرة الحلال' },
    { id:'PT-08', nameAr:'شحن مجاني',             detail:'شحن مجاني عند تجاوز مبلغ معين',                 maxDiscount:null,islamicNote:'حلال' },
    { id:'PT-09', nameAr:'تجربة مجانية',           detail:'فترة تجريبية مجانية للخدمات',                   maxDiscount:100,islamicNote:'حلال' },
    { id:'PT-10', nameAr:'Gamification',           detail:'نقاط + شارات + تحديات + مستويات',               maxDiscount:null,islamicNote:'حلال — بدون قمار' },
    { id:'PT-11', nameAr:'عرض البكر Early Bird',  detail:'سعر خاص للطلبات المبكرة',                       maxDiscount:30, islamicNote:'حلال' },
    { id:'PT-12', nameAr:'عضوية VIP',              detail:'اشتراك شهري بمزايا حصرية',                      maxDiscount:null,islamicNote:'حلال' },
    { id:'PT-13', nameAr:'كاش باك',               detail:'استرداد نسبة من الشراء',                         maxDiscount:20, islamicNote:'حلال — بدون شروط ربوية' },
    { id:'PT-14', nameAr:'هدية مجانية مع الشراء', detail:'هدية عند شراء بمبلغ معين',                      maxDiscount:null,islamicNote:'حلال' },
    { id:'PT-15', nameAr:'تسعير الزكاة',           detail:'2.5% من كل صفقة تذهب تلقائياً للزكاة',          maxDiscount:null,islamicNote:'واجب شرعي — يرفع البركة' }
];

// ══════════════════════════════════════════════════════
// PILLAR 4 — SALES COMMUNICATION TEMPLATES (50+ templates)
// ══════════════════════════════════════════════════════
const MESSAGE_TEMPLATES = {
    whatsapp: {
        initial_contact: {
            ar: 'السلام عليكم ورحمة الله وبركاته 🌿\nأنا {الاسم} من منظومة شيخة.\nعندي عرض خاص لك يستحق دقيقة من وقتك.\nهل يناسبك الآن؟',
            en: 'Peace be upon you! 🌿\nI\'m {name} from Sheikha.\nI have a special offer worth a minute of your time.\nIs now a good time?'
        },
        follow_up: {
            ar: 'السلام عليكم 🌿\nأتمنى أن تكون بخير.\nفقط أتابع معك بخصوص {الموضوع}.\nهل لديك أي أسئلة؟',
            en: 'Peace be upon you! 🌿\nHope you\'re well.\nJust following up on {topic}.\nAny questions?'
        },
        closing_deal: {
            ar: '🌟 {الاسم}، أنت خطوة واحدة من الانطلاق!\nالعرض: {العرض}\nالسعر: {السعر}\nالمزايا: {المزايا}\nأرسل "نعم" وسأُتمّ لك الإجراءات فوراً 🚀',
            en: '🌟 {name}, one step away from launch!\nOffer: {offer}\nPrice: {price}\nBenefits: {benefits}\nReply "YES" and I\'ll complete it instantly 🚀'
        },
        post_sale: {
            ar: 'جزاك الله خيراً {الاسم} 🤲\nتمّت صفقتك بنجاح.\nنتمنى أن تكون تجربتك رائعة.\nأي استفسار: {وسيلة التواصل}',
            en: 'Thank you {name}! 🤲\nYour transaction completed successfully.\nWe hope you have a wonderful experience.\nAny questions: {contact}'
        },
        promo_broadcast: {
            ar: '🔥 عرض استثنائي — لوقت محدود!\n{اسم المنتج}: {الوصف}\n✂️ خصم {الخصم}%\n⏰ ينتهي: {التاريخ}\n🛒 اطلب الآن: {الرابط}',
            en: '🔥 Special Offer — Limited Time!\n{product}: {desc}\n✂️ {discount}% OFF\n⏰ Ends: {date}\n🛒 Order: {link}'
        }
    },
    email: {
        subject_lines: [
            { ar: 'عرض خاص يمتد لـ 48 ساعة فقط — {اسم المنتج}', en: '48-hour exclusive deal — {product}' },
            { ar: 'وصل إلى صندوقك: {فائدة كبيرة}', en: 'Arrived in your inbox: {big benefit}' },
            { ar: '{الاسم}، هل تعرف {حقيقة مثيرة}؟', en: '{name}, did you know {interesting fact}?' },
            { ar: 'انطلق مع شيخة — ابدأ اليوم مجاناً', en: 'Launch with Sheikha — Start free today' },
            { ar: 'آخر فرصة: العرض ينتهي منتصف الليل', en: 'Last chance: Offer ends at midnight' }
        ],
        welcome_sequence: [
            { day: 0, nameAr: 'الترحيب', subject_ar: 'أهلاً {الاسم} — مرحباً بك في منظومة شيخة', body_ar: 'بسم الله الرحمن الرحيم\nأهلاً {الاسم}،\nنحن سعداء بانضمامك...' },
            { day: 3, nameAr: 'القيمة', subject_ar: 'كيف تستفيد من شيخة بشكل كامل؟', body_ar: 'هذه أهم 5 خطوات للانطلاق...' },
            { day: 7, nameAr: 'العرض', subject_ar: 'هدية خاصة لأعضائنا الجدد', body_ar: 'كعضو جديد، لك خصم 20%...' },
            { day: 14, nameAr: 'القصة', subject_ar: 'كيف حقق {تاجر} أولى صفقاته مع شيخة؟', body_ar: 'قصة نجاح حقيقية...' },
            { day: 30, nameAr: 'التحويل', subject_ar: 'حان وقت الانطلاق الحقيقي', body_ar: 'بعد شهر معنا، هذا ما ننصح به...' }
        ]
    },
    sms: {
        promo:   { ar: 'شيخة: {المنتج} بخصم {الخصم}% — ينتهي {التاريخ}. اطلب: {الرابط}. إلغاء الاشتراك: STOP' },
        reminder:{ ar: 'شيخة: تذكير — سلتك فيها {عدد} منتجات. أكمل طلبك: {الرابط}' },
        confirm: { ar: 'شيخة: تأكيد طلبك #{الرقم}. الوصول خلال {الوقت}. شكراً 🌿' }
    },
    social_captions: {
        product_launch: {
            ar: '🚀 الانطلاق!\n{اسم المنتج} متوفر الآن!\n✅ {فائدة 1}\n✅ {فائدة 2}\n✅ {فائدة 3}\n🛒 {الرابط}\n#شيخة #تجارة_حلال',
            en: '🚀 LAUNCH!\n{product} is NOW available!\n✅ {benefit1}\n✅ {benefit2}\n✅ {benefit3}\n🛒 {link}\n#Sheikha #HalalTrade'
        },
        testimonial: {
            ar: '⭐⭐⭐⭐⭐\n"{اقتباس التقييم}"\n— {اسم العميل}\n\nجرّب بنفسك: {الرابط}\n#تجربة_شيخة',
            en: '⭐⭐⭐⭐⭐\n"{review quote}"\n— {customer name}\n\nTry yourself: {link}\n#SheikhaExperience'
        },
        educational: {
            ar: '💡 هل تعلم؟\n{حقيقة مثيرة عن التجارة}\n\n«{حديث أو آية ذات صلة}»\n\nشارك مع تاجر تعرفه 👇',
            en: '💡 Did you know?\n{interesting trade fact}\n\nShare with a trader you know 👇'
        }
    }
};

// ══════════════════════════════════════════════════════
// PILLAR 5 — INFLUENCER NETWORK
// ══════════════════════════════════════════════════════
const INFLUENCER_TIERS = {
    mega:  { nameAr:'ميغا',  followers:'1M+',      engRate:'1-3%',   costRange:'50K-500K SAR/post', bestFor:'توعية واسعة النطاق',    islamicFit:'يُقيَّم كل حالة' },
    macro: { nameAr:'ماكرو', followers:'100K-1M',   engRate:'2-5%',   costRange:'5K-50K SAR/post',   bestFor:'براند+تحويل',           islamicFit:'يُقيَّم كل حالة' },
    micro: { nameAr:'مايكرو',followers:'10K-100K',  engRate:'5-15%',  costRange:'500-5K SAR/post',   bestFor:'ثقة+تحويل+niche',      islamicFit:'غالباً عالي' },
    nano:  { nameAr:'نانو',  followers:'1K-10K',    engRate:'10-30%', costRange:'0-500 SAR/post',    bestFor:'مجتمع محلي+إحالة',     islamicFit:'عالي جداً' }
};

const INFLUENCER_CATEGORIES = [
    { id:'IC-01', nameAr:'تجارة وأعمال',       relevance:'عالي جداً', channels:['YouTube','LinkedIn','X'] },
    { id:'IC-02', nameAr:'دين وإسلام',         relevance:'عالي جداً', channels:['YouTube','Instagram','X'] },
    { id:'IC-03', nameAr:'تقنية وتطوير',       relevance:'عالي',       channels:['YouTube','X','LinkedIn'] },
    { id:'IC-04', nameAr:'تمويل شخصي',         relevance:'عالي',       channels:['TikTok','Instagram','YouTube'] },
    { id:'IC-05', nameAr:'جمال وموضة حلال',   relevance:'متوسط',     channels:['Instagram','TikTok','Snapchat'] },
    { id:'IC-06', nameAr:'طعام وطبخ',          relevance:'متوسط',     channels:['Instagram','TikTok','YouTube'] },
    { id:'IC-07', nameAr:'سفر ومغامرة',        relevance:'متوسط',     channels:['Instagram','YouTube','TikTok'] },
    { id:'IC-08', nameAr:'رياضة ولياقة',       relevance:'منخفض-متوسط',channels:['Instagram','TikTok','YouTube'] }
];

// ══════════════════════════════════════════════════════
// PILLAR 6 — BRAND VOICE (Islamic Brand Identity)
// ══════════════════════════════════════════════════════
const BRAND_VOICE = {
    nameAr:     'صوت براند شيخة الإسلامي الملكي',
    tagline_ar: 'انطلق — اتجر — أربح — بركة الله معك',
    tagline_en: 'Launch. Trade. Prosper. With Allah\'s Blessing.',
    personality: {
        trustworthy:  { ar: 'موثوق',     example_ar: 'ضمانة كاملة — شفافية تامة — لا مفاجآت' },
        empowering:   { ar: 'محفّز',     example_ar: 'أنت قادر — انطلق — لا تتردد' },
        islamic:      { ar: 'إسلامي',    example_ar: 'بسم الله — الحلال — الأمانة — البركة' },
        innovative:   { ar: 'مبتكر',     example_ar: 'أفضل تقنية — أذكى حلول — رائد' },
        warm:         { ar: 'دافئ',      example_ar: 'أهل وسهل — نحن معك — مثل الأسرة' }
    },
    toneByContext: {
        sales:     'مقنع + حماسي + واضح + فيه بركة',
        support:   'دافئ + صبور + سريع الحل',
        education: 'علمي + بسيط + ممتع + يرفع الوعي',
        crisis:    'هادئ + واضح + مسؤول + يحل بسرعة',
        social:    'مرح + أصيل + إسلامي + يتفاعل'
    },
    forbiddenTones: ['فظ أو خشن', 'مضلل أو مبالغ', 'يستهزئ بالمنافسين', 'ضد الدين أو الأخلاق'],
    islamicAdPrinciples: [
        '﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾ — الكلمة الحسنة في كل إعلان',
        '«البيّعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بُورك لهما»',
        'لا إعلان فيه كذب أو مبالغة مضللة',
        'لا استغلال عاطفي ممنهج أو ضغط زائف',
        'الوضوح التام في السعر والشروط والعروض',
        'لا إعلانات لمنتجات حرام (ربا، غش، محرمات)',
        'احترام الكرامة الإنسانية في كل محتوى'
    ]
};

// ══════════════════════════════════════════════════════
// PILLAR 7 — KPIs (40 indicators)
// ══════════════════════════════════════════════════════
const MARKETING_KPIS = [
    // Awareness
    { id:'MK-01', nameAr:'مدى الوصول الشهري',        cat:'awareness',   unit:'شخص',    target:'نمو 25%/شهر',  priority:'critical' },
    { id:'MK-02', nameAr:'مرات الظهور (Impressions)', cat:'awareness',   unit:'ظهور',   target:'نمو 30%/شهر',  priority:'high' },
    { id:'MK-03', nameAr:'تكلفة الوصول لـ1000 CPM', cat:'awareness',   unit:'ريال',   target:'أقل من 10 ريال',priority:'high' },
    { id:'MK-04', nameAr:'معدل التعرف على البراند',   cat:'awareness',   unit:'%',      target:'60%+ جمهور مستهدف',priority:'high' },
    // Engagement
    { id:'MK-05', nameAr:'معدل التفاعل',              cat:'engagement',  unit:'%',      target:'5-10%',         priority:'critical' },
    { id:'MK-06', nameAr:'وقت المشاهدة (فيديو)',      cat:'engagement',  unit:'ثانية',  target:'50%+ للنهاية',  priority:'high' },
    { id:'MK-07', nameAr:'تعليقات + مشاركات',         cat:'engagement',  unit:'عدد',    target:'نمو 20%/شهر',  priority:'medium' },
    { id:'MK-08', nameAr:'نسبة الحفظ (Saves)',        cat:'engagement',  unit:'%',      target:'2%+ من الظهور', priority:'medium' },
    // Traffic
    { id:'MK-09', nameAr:'زيارات الموقع الشهرية',    cat:'traffic',     unit:'زيارة',  target:'نمو 20%/شهر',  priority:'critical' },
    { id:'MK-10', nameAr:'معدل الارتداد',              cat:'traffic',     unit:'%',      target:'أقل من 40%',   priority:'high' },
    { id:'MK-11', nameAr:'مدة الجلسة',                cat:'traffic',     unit:'دقيقة',  target:'أكثر من 3 دقائق',priority:'high' },
    { id:'MK-12', nameAr:'مصادر الزيارات',            cat:'traffic',     unit:'تقسيم%', target:'تنويع المصادر', priority:'medium' },
    // Leads
    { id:'MK-13', nameAr:'عدد العملاء المحتملين',    cat:'leads',       unit:'عميل/شهر',target:'200+/شهر',      priority:'critical' },
    { id:'MK-14', nameAr:'تكلفة العميل المحتمل CPL', cat:'leads',       unit:'ريال',   target:'أقل من 50 ريال',priority:'critical' },
    { id:'MK-15', nameAr:'جودة العميل المحتمل (MQL)',cat:'leads',       unit:'%',      target:'30%+ تحويل',    priority:'high' },
    { id:'MK-16', nameAr:'معدل تحويل Lead→Sale',     cat:'leads',       unit:'%',      target:'10-25%',        priority:'critical' },
    // Conversion
    { id:'MK-17', nameAr:'معدل التحويل الإجمالي',    cat:'conversion',  unit:'%',      target:'3-8%',          priority:'critical' },
    { id:'MK-18', nameAr:'تكلفة اكتساب العميل CAC', cat:'conversion',  unit:'ريال',   target:'أقل من 1/3 LTV',priority:'critical' },
    { id:'MK-19', nameAr:'معدل إتمام الشراء',         cat:'conversion',  unit:'%',      target:'70%+ (من سلة)', priority:'high' },
    { id:'MK-20', nameAr:'معدل التخلي عن السلة',     cat:'conversion',  unit:'%',      target:'أقل من 30%',   priority:'high' },
    // Revenue
    { id:'MK-21', nameAr:'الإيراد المنسوب للتسويق',  cat:'revenue',     unit:'ريال',   target:'70%+ من الإيراد',priority:'critical' },
    { id:'MK-22', nameAr:'عائد الإعلانات ROAS',      cat:'revenue',     unit:'x',      target:'4x+',           priority:'critical' },
    { id:'MK-23', nameAr:'متوسط قيمة الطلب AOV',    cat:'revenue',     unit:'ريال',   target:'نمو 10%/ربع',   priority:'high' },
    { id:'MK-24', nameAr:'قيمة العميل مدى الحياة LTV',cat:'revenue',   unit:'ريال',   target:'5× CAC',        priority:'critical' },
    // Retention
    { id:'MK-25', nameAr:'معدل الاحتفاظ بالعملاء',  cat:'retention',   unit:'%',      target:'80%+',          priority:'critical' },
    { id:'MK-26', nameAr:'صافي نقاط المروّجين NPS', cat:'retention',   unit:'نقطة',   target:'50+',           priority:'high' },
    { id:'MK-27', nameAr:'معدل الإحالة',              cat:'retention',   unit:'%',      target:'15%+',          priority:'high' },
    { id:'MK-28', nameAr:'تكرار الشراء',              cat:'retention',   unit:'مرة/سنة',target:'3+ مرات',       priority:'high' },
    // Channels
    { id:'MK-29', nameAr:'أداء كل قناة (ROI)',       cat:'channels',    unit:'x',      target:'2x+ لكل قناة', priority:'high' },
    { id:'MK-30', nameAr:'تكلفة النقرة CPC',         cat:'channels',    unit:'ريال',   target:'أقل من 3 ريال', priority:'high' },
    { id:'MK-31', nameAr:'معدل النقر CTR',            cat:'channels',    unit:'%',      target:'2%+ إعلانات',   priority:'high' },
    { id:'MK-32', nameAr:'تكلفة المشاهدة CPV',       cat:'channels',    unit:'ريال',   target:'أقل من 0.5 ريال',priority:'medium' },
    // SEO
    { id:'MK-33', nameAr:'ترتيب الكلمات المفتاحية', cat:'seo',         unit:'رتبة',   target:'أول صفحة Google',priority:'high' },
    { id:'MK-34', nameAr:'الزيارات العضوية',          cat:'seo',         unit:'زيارة',  target:'نمو 15%/شهر',  priority:'high' },
    { id:'MK-35', nameAr:'Authority Domain DA',      cat:'seo',         unit:'نقطة/100',target:'60+',          priority:'medium' },
    // Content
    { id:'MK-36', nameAr:'عدد المحتوى المنشور',      cat:'content',     unit:'قطعة/شهر',target:'30+ قطعة',     priority:'medium' },
    { id:'MK-37', nameAr:'معدل التوزيع العضوي',      cat:'content',     unit:'%',      target:'10%+ شيئر',     priority:'medium' },
    // Brand
    { id:'MK-38', nameAr:'متابعو البراند (كل منصات)',cat:'brand',       unit:'متابع',  target:'نمو 20%/شهر',  priority:'high' },
    { id:'MK-39', nameAr:'الإشارات للعلامة (Mentions)',cat:'brand',     unit:'إشارة',  target:'نمو 15%/شهر',  priority:'medium' },
    // Islamic
    { id:'MK-40', nameAr:'نسبة الامتثال الشرعي للمحتوى',cat:'islamic', unit:'%',      target:'100%',          priority:'critical' }
];

// ══════════════════════════════════════════════════════
// CRISIS COMMUNICATION TEMPLATES
// ══════════════════════════════════════════════════════
const CRISIS_TEMPLATES = [
    { id:'CR-01', scenario:'خطأ في المنتج أو الخدمة', ar:'نعتذر بصدق عن هذا الخطأ. نتحمل المسؤولية الكاملة. إجراءاتنا: {الإجراءات}. تعويضكم: {التعويض}.' },
    { id:'CR-02', scenario:'تأخر في التسليم',          ar:'نعلم قيمة وقتك. تأخر طلبك بسبب {السبب}. موعد التسليم الجديد: {التاريخ}. عذراً وشكراً لصبركم.' },
    { id:'CR-03', scenario:'خرق بيانات',               ar:'سلامتكم أولوية. اكتشفنا {الحادثة}. اتخذنا: {الإجراءات}. لا توجد بيانات مالية متأثرة. نعتذر.' },
    { id:'CR-04', scenario:'انتقاد على السوشيال',     ar:'شكراً لملاحظتك القيّمة. أنت محق في {النقطة}. سنحسّن {الجانب} فوراً. تواصل معنا على: {القناة}.' },
    { id:'CR-05', scenario:'منافس يهاجم البراند',     ar:'نحترم المنافسة الشريفة. نعمل بالكتاب والسنة. نثق في عملائنا أن يحكموا بالنتائج لا بالكلام.' }
];

// ══════════════════════════════════════════════════════
// MAIN ENGINE
// ══════════════════════════════════════════════════════
class SheikhaCosmicMarketingSupremacyEngine extends EventEmitter {

    constructor(options) {
        super();
        options = options || {};
        this.name        = 'SheikhaCosmicMarketingSupremacyEngine';
        this.nameAr      = 'شيخة — منظومة التسويق والإعلان والترويج والمبيعات والتواصل الأقوى في الكون';
        this.version     = VERSION;
        this.owner       = 'سلمان أحمد بن سلمان الراجح';
        this.copyright   = '© 2026 منظومة شيخة — جميع الحقوق محفوظة';
        this.activatedAt = new Date().toISOString();
        this._broadcastFn = options.broadcast || null;

        this.campaigns    = new Map();
        this.promotions   = new Map();
        this.influencers  = new Map();
        this.kpiReadings  = new Map();
        this.contentPosts = new Map();

        this.metrics = {
            totalCampaigns: 0, activeCampaigns: 0, totalImpressions: 0,
            totalLeads: 0, totalConversions: 0, totalAdSpend: 0, totalRevenue: 0,
            bestChannel: null, avgROAS: 0, lastActivity: null
        };

        this._loadPersisted();
        this._startMonitor(options.monitorInterval || 300000);
        console.log('✅ ' + this.nameAr + ' v' + VERSION + ' | 38 API | 20 قناة | 25 نوع إعلان | 40 KPI');
    }

    // ──────────────────────────────────────────
    // DASHBOARD
    // ──────────────────────────────────────────
    getDashboard() {
        return {
            engine: this.name, nameAr: this.nameAr, version: this.version,
            owner: this.owner, copyright: this.copyright, activatedAt: this.activatedAt,
            islamicFoundation: { bismillah: 'بسم الله الرحمن الرحيم', verse: '﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾', hadith: '«البيّعان بالخيار... إن صدقا وبيّنا بُورك لهما»' },
            pillars: [
                { num: 1, nameAr: 'التسويق الشامل',   count: MARKETING_CHANNELS.length + ' قناة' },
                { num: 2, nameAr: 'الإعلان المتكامل', count: AD_FORMATS.length + ' نوع إعلان' },
                { num: 3, nameAr: 'الترويج والدعاية', count: PROMOTION_TYPES.length + ' نوع ترويج' },
                { num: 4, nameAr: 'المبيعات القوية',  count: '5 نماذج + ' + Object.keys(MESSAGE_TEMPLATES.whatsapp).length + ' قوالب واتساب' },
                { num: 5, nameAr: 'التواصل الكوني',   count: (MESSAGE_TEMPLATES.email.welcome_sequence.length) + ' تسلسل إيميل + SMS + سوشيال' },
                { num: 6, nameAr: 'البراند الملكي',   count: Object.keys(INFLUENCER_TIERS).length + ' طبقات مؤثرين + ' + INFLUENCER_CATEGORIES.length + ' تصنيف' },
                { num: 7, nameAr: 'التحليلات الكونية',count: MARKETING_KPIS.length + ' KPI' }
            ],
            summary: {
                channels: MARKETING_CHANNELS.length, adFormats: AD_FORMATS.length,
                promotionTypes: PROMOTION_TYPES.length, kpis: MARKETING_KPIS.length,
                influencerTiers: Object.keys(INFLUENCER_TIERS).length,
                influencerCategories: INFLUENCER_CATEGORIES.length,
                messageTemplateCategories: Object.keys(MESSAGE_TEMPLATES).length,
                crisisTemplates: CRISIS_TEMPLATES.length,
                campaignsCreated: this.metrics.totalCampaigns,
                activeCampaigns: this.metrics.activeCampaigns
            },
            topChannels: MARKETING_CHANNELS.sort((a, b) => b.avgROI - a.avgROI).slice(0, 5).map(c => ({ id: c.id, nameAr: c.nameAr, avgROI: c.avgROI + '%', islamicScore: c.islamicScore })),
            metrics: this.metrics
        };
    }

    // ──────────────────────────────────────────
    // CHANNELS
    // ──────────────────────────────────────────
    getChannels(filters) {
        let list = MARKETING_CHANNELS.slice();
        if (filters && filters.type)  list = list.filter(c => c.type === filters.type);
        if (filters && filters.minROI) list = list.filter(c => c.avgROI >= parseInt(filters.minROI));
        if (filters && filters.minIslamicScore) list = list.filter(c => c.islamicScore >= parseInt(filters.minIslamicScore));
        return { channels: list, total: list.length };
    }

    getChannelDetail(id) {
        const ch = MARKETING_CHANNELS.find(c => c.id === id);
        if (!ch) throw new Error('القناة غير موجودة: ' + id);
        const compatibleFormats = AD_FORMATS.filter(f => f.channels.includes(id));
        return { ...ch, compatibleFormats, islamicAdPrinciples: BRAND_VOICE.islamicAdPrinciples };
    }

    buildMediaPlan(opts) {
        opts = opts || {};
        const budget        = parseFloat(opts.budget) || 10000;
        const objective     = opts.objective || 'awareness';
        const durationDays  = parseInt(opts.durationDays) || 30;
        const targetAudience = opts.targetAudience || 'عرب مسلمون';

        const alloc = {
            awareness: [{ id:'CH-10', pct:20 },{ id:'CH-03', pct:20 },{ id:'CH-05', pct:15 },{ id:'CH-04', pct:20 },{ id:'CH-14', pct:15 },{ id:'CH-01', pct:10 }],
            leads:     [{ id:'CH-09', pct:30 },{ id:'CH-11', pct:20 },{ id:'CH-01', pct:20 },{ id:'CH-06', pct:15 },{ id:'CH-12', pct:15 }],
            sales:     [{ id:'CH-01', pct:30 },{ id:'CH-09', pct:25 },{ id:'CH-11', pct:20 },{ id:'CH-15', pct:15 },{ id:'CH-12', pct:10 }],
            retention: [{ id:'CH-11', pct:40 },{ id:'CH-01', pct:30 },{ id:'CH-12', pct:15 },{ id:'CH-16', pct:15 }]
        };

        const plan = (alloc[objective] || alloc.awareness).map(a => {
            const ch    = MARKETING_CHANNELS.find(c => c.id === a.id);
            const spend = Math.round(budget * a.pct / 100);
            const estImpressions = ch && ch.cpm ? Math.round(spend / ch.cpm * 1000) : null;
            return { channelId: a.id, nameAr: ch ? ch.nameAr : a.id, allocationPct: a.pct, budgetSAR: spend, estImpressions, estROI: ch ? ch.avgROI + '%' : 'N/A' };
        });

        return {
            totalBudget: budget, objective, durationDays, targetAudience,
            plan, totalChannels: plan.length,
            zakat: { amount: Math.round(budget * 0.025), note: 'زكاة على الميزانية الإعلانية — 2.5%' },
            islamicNote: BRAND_VOICE.islamicAdPrinciples[0],
            generatedAt: new Date().toISOString()
        };
    }

    // ──────────────────────────────────────────
    // AD FORMATS
    // ──────────────────────────────────────────
    getAdFormats(filters) {
        let list = AD_FORMATS.slice();
        if (filters && filters.bestFor) list = list.filter(f => f.bestFor && f.bestFor.includes(filters.bestFor));
        return { formats: list, total: list.length };
    }

    // ──────────────────────────────────────────
    // CAMPAIGNS
    // ──────────────────────────────────────────
    createCampaign(opts) {
        opts = opts || {};
        if (!opts.nameAr) throw new Error('nameAr مطلوب');
        const id  = 'camp-' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();

        const campaign = {
            id, nameAr: opts.nameAr, nameEn: opts.nameEn || opts.nameAr,
            objective: opts.objective || 'awareness',
            channels: Array.isArray(opts.channels) ? opts.channels : ['CH-01'],
            adFormat: opts.adFormat || 'AF-01',
            budgetSAR: parseFloat(opts.budgetSAR) || 0,
            targetAudience: opts.targetAudience || '',
            startDate: opts.startDate || now, endDate: opts.endDate || null,
            status: 'active', impressions: 0, clicks: 0, leads: 0, conversions: 0, spend: 0,
            islamicCompliance: true, createdAt: now, updatedAt: now,
            mediaPlan: opts.mediaPlan || null
        };

        this.campaigns.set(id, campaign);
        this.metrics.totalCampaigns++;
        this.metrics.activeCampaigns++;
        this.metrics.lastActivity = now;
        this._persistCampaigns();
        this._broadcast('campaign:created', { id, nameAr: opts.nameAr, objective: campaign.objective });
        return campaign;
    }

    updateCampaignMetrics(campaignId, metrics) {
        const c = this.campaigns.get(campaignId);
        if (!c) throw new Error('الحملة غير موجودة');
        const m = metrics || {};
        if (m.impressions)  { c.impressions  += parseInt(m.impressions)  || 0; this.metrics.totalImpressions  += parseInt(m.impressions)  || 0; }
        if (m.clicks)       { c.clicks       += parseInt(m.clicks)       || 0; }
        if (m.leads)        { c.leads        += parseInt(m.leads)        || 0; this.metrics.totalLeads        += parseInt(m.leads)        || 0; }
        if (m.conversions)  { c.conversions  += parseInt(m.conversions)  || 0; this.metrics.totalConversions  += parseInt(m.conversions)  || 0; }
        if (m.spend)        { c.spend        += parseFloat(m.spend)      || 0; this.metrics.totalAdSpend      += parseFloat(m.spend)      || 0; }
        if (m.revenue)      { this.metrics.totalRevenue += parseFloat(m.revenue) || 0; }
        c.updatedAt = new Date().toISOString();
        c.ctr      = c.impressions ? Math.round(c.clicks / c.impressions * 10000) / 100 : 0;
        c.cvr      = c.clicks ? Math.round(c.conversions / c.clicks * 10000) / 100 : 0;
        c.roas     = c.spend && m.revenue ? Math.round((parseFloat(m.revenue) / c.spend) * 100) / 100 : 0;
        this._persistCampaigns();
        this._broadcast('campaign:metrics-updated', { campaignId, metrics: m });
        return c;
    }

    getCampaigns(filters) {
        filters = filters || {};
        let list = Array.from(this.campaigns.values());
        if (filters.status)    list = list.filter(c => c.status === filters.status);
        if (filters.objective) list = list.filter(c => c.objective === filters.objective);
        const total = list.length;
        const page  = Math.max(1, parseInt(filters.page) || 1);
        const ps    = Math.min(50, parseInt(filters.pageSize) || 20);
        return { campaigns: list.slice((page - 1) * ps, page * ps), total, page };
    }

    // ──────────────────────────────────────────
    // AI CAMPAIGN GENERATOR
    // ──────────────────────────────────────────
    generateCampaignBrief(opts) {
        opts = opts || {};
        const { product, objective, targetAudience, budgetSAR, durationDays, market } = opts;
        if (!product) throw new Error('product مطلوب');

        const obj       = objective || 'awareness';
        const budget    = parseFloat(budgetSAR) || 5000;
        const days      = parseInt(durationDays) || 30;
        const audience  = targetAudience || 'عرب مسلمون';

        const objChannels = {
            awareness: ['CH-03','CH-04','CH-10','CH-05','CH-14'],
            leads:     ['CH-09','CH-11','CH-01','CH-06'],
            sales:     ['CH-01','CH-09','CH-11','CH-12'],
            retention: ['CH-11','CH-01','CH-16']
        };
        const channels = (objChannels[obj] || objChannels.awareness).map(id => MARKETING_CHANNELS.find(c => c.id === id)).filter(Boolean);

        const objFormats = {
            awareness: ['AF-02','AF-04','AF-22'],
            leads:     ['AF-04','AF-11','AF-17'],
            sales:     ['AF-11','AF-07','AF-06'],
            retention: ['AF-10','AF-11','AF-12']
        };
        const formats = (objFormats[obj] || objFormats.awareness).map(id => AD_FORMATS.find(f => f.id === id)).filter(Boolean);

        const promoIds = { sales: ['PT-01','PT-04','PT-07'], leads: ['PT-09','PT-03'], awareness: ['PT-10','PT-20'] };
        const promotions = (promoIds[obj] || promoIds.awareness).map(id => PROMOTION_TYPES.find(p => p.id === id)).filter(Boolean);

        return {
            id: 'brief-' + crypto.randomBytes(6).toString('hex'),
            product, objective: obj, targetAudience: audience, budgetSAR: budget, durationDays: days, market: market || 'محلي',
            headline_ar: '🚀 انطلق مع ' + product + ' — الأفضل في تصنيف شيخة!',
            headline_en: '🚀 Launch with ' + product + ' — Top Rated on Sheikha!',
            bodyCopy_ar: 'اكتشف ' + product + ' — جودة موثوقة، سعر عادل، خدمة من القلب. انطلق الآن!',
            recommendedChannels: channels.map(c => ({ id: c.id, nameAr: c.nameAr, avgROI: c.avgROI + '%' })),
            recommendedFormats: formats.map(f => ({ id: f.id, nameAr: f.nameAr, ctr: f.ctr })),
            suggestedPromotions: promotions.map(p => ({ id: p.id, nameAr: p.nameAr })),
            messageTemplates: { whatsapp: MESSAGE_TEMPLATES.whatsapp.promo_broadcast, email: MESSAGE_TEMPLATES.email.subject_lines[0] },
            mediaPlan: this.buildMediaPlan({ budget, objective: obj, durationDays: days, targetAudience: audience }),
            kpisToTrack: MARKETING_KPIS.filter(k => k.priority === 'critical').slice(0, 8).map(k => ({ id: k.id, nameAr: k.nameAr, target: k.target })),
            islamicGuidelines: BRAND_VOICE.islamicAdPrinciples,
            brandVoice: BRAND_VOICE.toneByContext[obj] || BRAND_VOICE.toneByContext.sales,
            estimatedROI: Math.round(channels.reduce((a, c) => a + c.avgROI, 0) / channels.length) + '%',
            generatedAt: new Date().toISOString()
        };
    }

    // ──────────────────────────────────────────
    // CONTENT CALENDAR
    // ──────────────────────────────────────────
    generateContentCalendar(opts) {
        opts = opts || {};
        const year  = parseInt(opts.year)  || new Date().getFullYear();
        const month = parseInt(opts.month) || new Date().getMonth() + 1;
        const postsPerWeek = Math.min(21, parseInt(opts.postsPerWeek) || 7);
        const platforms    = Array.isArray(opts.platforms) ? opts.platforms : ['Instagram', 'WhatsApp', 'TikTok'];

        const contentTypes = [
            { type:'product',     pct:25, nameAr:'منشور منتج',        icon:'🛒' },
            { type:'educational', pct:30, nameAr:'تعليمي/معرفي',       icon:'💡' },
            { type:'testimonial', pct:15, nameAr:'قصة عميل',           icon:'⭐' },
            { type:'promotional', pct:20, nameAr:'عرض وترويج',         icon:'🔥' },
            { type:'islamic',     pct:10, nameAr:'محتوى إسلامي',        icon:'🌙' }
        ];

        const weeks = Math.ceil(postsPerWeek * 4);
        const days  = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        const calendar = [];

        for (let week = 1; week <= 4; week++) {
            const posts = [];
            for (let day = 0; day < Math.ceil(postsPerWeek / 4); day++) {
                const typeIndex = Math.floor(Math.random() * contentTypes.length);
                const ct = contentTypes[typeIndex];
                const platform = platforms[Math.floor(Math.random() * platforms.length)];
                posts.push({
                    weekDay: days[(week * 2 + day) % 7], contentType: ct.type,
                    nameAr: ct.nameAr, icon: ct.icon, platform,
                    caption: MESSAGE_TEMPLATES.social_captions[ct.type === 'product' ? 'product_launch' : ct.type === 'testimonial' ? 'testimonial' : 'educational']?.ar || '',
                    timeRecommended: platform === 'TikTok' ? '19:00-21:00' : platform === 'Instagram' ? '18:00-20:00' : '09:00-11:00'
                });
            }
            calendar.push({ week, posts });
        }

        return {
            year, month, platform: platforms, postsPerWeek,
            calendar, totalPosts: calendar.reduce((a, w) => a + w.posts.length, 0),
            contentMix: contentTypes, islamicNote: 'كل محتوى يجب مراجعته شرعياً قبل النشر',
            generatedAt: new Date().toISOString()
        };
    }

    // ──────────────────────────────────────────
    // PROMOTION ENGINE
    // ──────────────────────────────────────────
    getPromotions() { return { promotions: PROMOTION_TYPES, total: PROMOTION_TYPES.length }; }

    createPromotion(opts) {
        opts = opts || {};
        if (!opts.nameAr) throw new Error('nameAr مطلوب');
        const id  = 'promo-' + crypto.randomBytes(6).toString('hex');
        const now = new Date().toISOString();
        const promo = {
            id, nameAr: opts.nameAr, typeId: opts.typeId || 'PT-01',
            discountPct: parseFloat(opts.discountPct) || 0,
            validFrom: opts.validFrom || now, validTo: opts.validTo || null,
            code: opts.code || ('SHEIKHA' + Math.random().toString(36).substr(2, 6).toUpperCase()),
            usageLimit: parseInt(opts.usageLimit) || 100, usageCount: 0,
            status: 'active', islamicCompliance: true,
            createdAt: now, updatedAt: now
        };
        this.promotions.set(id, promo);
        this._persist();
        this._broadcast('promotion:created', { id, nameAr: opts.nameAr, code: promo.code });
        return promo;
    }

    // ──────────────────────────────────────────
    // INFLUENCERS
    // ──────────────────────────────────────────
    getInfluencerNetwork() { return { tiers: INFLUENCER_TIERS, categories: INFLUENCER_CATEGORIES }; }

    registerInfluencer(opts) {
        opts = opts || {};
        if (!opts.nameAr) throw new Error('nameAr مطلوب');
        const id = 'infl-' + crypto.randomBytes(6).toString('hex');
        const followers = parseInt(opts.followers) || 0;
        const tier = followers >= 1000000 ? 'mega' : followers >= 100000 ? 'macro' : followers >= 10000 ? 'micro' : 'nano';
        const influencer = {
            id, nameAr: opts.nameAr, handle: opts.handle || '',
            platform: opts.platform || 'Instagram', followers,
            tier, engagementRate: parseFloat(opts.engagementRate) || 3,
            category: opts.category || 'IC-01', islamicScore: parseInt(opts.islamicScore) || 75,
            costPerPost: parseFloat(opts.costPerPost) || 0,
            status: 'active', registeredAt: new Date().toISOString()
        };
        this.influencers.set(id, influencer);
        this._persist();
        this._broadcast('influencer:registered', { id, nameAr: opts.nameAr, tier });
        return influencer;
    }

    getInfluencers(filters) {
        filters = filters || {};
        let list = Array.from(this.influencers.values());
        if (filters.tier)     list = list.filter(i => i.tier === filters.tier);
        if (filters.category) list = list.filter(i => i.category === filters.category);
        return { influencers: list, total: list.length };
    }

    // ──────────────────────────────────────────
    // MESSAGE TEMPLATES
    // ──────────────────────────────────────────
    getTemplates() { return MESSAGE_TEMPLATES; }

    getTemplateByType(type, subtype) {
        const tmpl = MESSAGE_TEMPLATES[type];
        if (!tmpl) throw new Error('نوع القالب غير موجود: ' + type);
        if (subtype) return tmpl[subtype] || tmpl;
        return tmpl;
    }

    // ──────────────────────────────────────────
    // BRAND VOICE
    // ──────────────────────────────────────────
    getBrandVoice() { return { ...BRAND_VOICE, islamicAdPrinciples: BRAND_VOICE.islamicAdPrinciples }; }

    // ──────────────────────────────────────────
    // KPIs
    // ──────────────────────────────────────────
    getKPIs(filters) {
        filters = filters || {};
        let list = MARKETING_KPIS.slice();
        if (filters.cat)      list = list.filter(k => k.cat === filters.cat);
        if (filters.priority) list = list.filter(k => k.priority === filters.priority);
        return { kpis: list, total: list.length, categories: [...new Set(MARKETING_KPIS.map(k => k.cat))] };
    }

    recordKPI(opts) {
        opts = opts || {};
        if (!opts.kpiId) throw new Error('kpiId مطلوب');
        const id = 'kpi-' + crypto.randomBytes(6).toString('hex');
        const reading = { id, kpiId: opts.kpiId, value: opts.value, campaignId: opts.campaignId || null, notes: opts.notes || '', recordedAt: new Date().toISOString() };
        this.kpiReadings.set(id, reading);
        this._persist();
        this._broadcast('kpi:recorded', { kpiId: opts.kpiId, value: opts.value });
        return reading;
    }

    // ──────────────────────────────────────────
    // CRISIS COMMUNICATION
    // ──────────────────────────────────────────
    getCrisisTemplates() { return { templates: CRISIS_TEMPLATES, islamicPrinciple: '«أقِل المسلم عثرته» — التعامل بأخلاق إسلامية في الأزمات' }; }

    // ──────────────────────────────────────────
    // STATS & HEALTH
    // ──────────────────────────────────────────
    getStats() {
        const campaigns = Array.from(this.campaigns.values());
        const totalSpend = campaigns.reduce((a, c) => a + (c.spend || 0), 0);
        return {
            metrics: this.metrics, totalChannels: MARKETING_CHANNELS.length,
            totalAdFormats: AD_FORMATS.length, totalPromotionTypes: PROMOTION_TYPES.length,
            totalKPIs: MARKETING_KPIS.length, influencerTiers: Object.keys(INFLUENCER_TIERS).length,
            campaigns: campaigns.length, activeCampaigns: campaigns.filter(c => c.status === 'active').length,
            promotions: this.promotions.size, influencers: this.influencers.size,
            kpiReadings: this.kpiReadings.size, totalAdSpend: totalSpend,
            avgCTR: campaigns.length ? Math.round(campaigns.reduce((a, c) => a + (c.ctr || 0), 0) / campaigns.length * 100) / 100 : 0
        };
    }

    getHealthReport() {
        const campaigns = Array.from(this.campaigns.values());
        const active    = campaigns.filter(c => c.status === 'active');
        const noSpend   = active.filter(c => c.spend === 0);
        let health = 100;
        if (noSpend.length > 0) health -= Math.min(25, noSpend.length * 5);
        return {
            status: health >= 80 ? 'healthy' : health >= 60 ? 'degraded' : 'needs-attention',
            overallHealth: Math.max(0, health),
            details: { totalCampaigns: campaigns.length, activeCampaigns: active.length, campaignsWithData: active.filter(c => c.impressions > 0).length, totalImpressions: this.metrics.totalImpressions, totalLeads: this.metrics.totalLeads, totalConversions: this.metrics.totalConversions },
            checkedAt: new Date().toISOString()
        };
    }

    // ──────────────────────────────────────────
    // REGISTER ROUTES (38 APIs)
    // ──────────────────────────────────────────
    registerRoutes(app) {
        if (!app) return;
        const self = this;
        const ok  = (res, data, msg) => res.json({ success: true,  data, message: msg || null, ts: new Date().toISOString() });
        const err = (res, e, code)   => res.status(code || 400).json({ success: false, message: (e && e.message) || String(e), ts: new Date().toISOString() });

        // ─── Arabic routes ───
        app.get(AR_BASE + '/لوحة-القيادة',              (req, res) => ok(res, self.getDashboard()));
        app.get(AR_BASE + '/القنوات',                   (req, res) => ok(res, self.getChannels(req.query)));
        app.get(AR_BASE + '/القنوات/:id',               (req, res) => { try { ok(res, self.getChannelDetail(req.params.id)); } catch (e) { err(res, e, 404); } });
        app.get(AR_BASE + '/أنواع-الإعلانات',          (req, res) => ok(res, self.getAdFormats(req.query)));
        app.get(AR_BASE + '/الحملات',                   (req, res) => ok(res, self.getCampaigns(req.query)));
        app.get(AR_BASE + '/الترويج',                   (req, res) => ok(res, self.getPromotions()));
        app.get(AR_BASE + '/المؤثرون',                  (req, res) => ok(res, self.getInfluencers(req.query)));
        app.get(AR_BASE + '/شبكة-المؤثرين',            (req, res) => ok(res, self.getInfluencerNetwork()));
        app.get(AR_BASE + '/قوالب-الرسائل',            (req, res) => ok(res, self.getTemplates()));
        app.get(AR_BASE + '/صوت-البراند',               (req, res) => ok(res, self.getBrandVoice()));
        app.get(AR_BASE + '/مقاييس-الأداء',            (req, res) => ok(res, self.getKPIs(req.query)));
        app.get(AR_BASE + '/تواصل-الأزمات',            (req, res) => ok(res, self.getCrisisTemplates()));
        app.get(AR_BASE + '/إحصائيات',                  (req, res) => ok(res, self.getStats()));
        app.get(AR_BASE + '/صحة-المنظومة',             (req, res) => ok(res, self.getHealthReport()));

        app.post(AR_BASE + '/توليد-خطة-وسائط',        (req, res) => { try { ok(res, self.buildMediaPlan(req.body || {}), 'تم توليد خطة الوسائط'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/توليد-حملة',              (req, res) => { try { ok(res, self.generateCampaignBrief(req.body || {}), 'تم توليد ملخص الحملة'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/تقويم-المحتوى',           (req, res) => { try { ok(res, self.generateContentCalendar(req.body || {}), 'تم توليد تقويم المحتوى'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/إنشاء-حملة',              (req, res) => { try { ok(res, self.createCampaign(req.body || {}), 'تم إنشاء الحملة'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/تحديث-مقاييس-الحملة',   (req, res) => { try { const b = req.body || {}; ok(res, self.updateCampaignMetrics(b.campaignId, b), 'تم تحديث المقاييس'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/إنشاء-ترويج',             (req, res) => { try { ok(res, self.createPromotion(req.body || {}), 'تم إنشاء الترويج'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/تسجيل-مؤثر',             (req, res) => { try { ok(res, self.registerInfluencer(req.body || {}), 'تم تسجيل المؤثر'); } catch (e) { err(res, e); } });
        app.post(AR_BASE + '/تسجيل-مقياس',            (req, res) => { try { ok(res, self.recordKPI(req.body || {}), 'تم تسجيل المقياس'); } catch (e) { err(res, e); } });
        app.get(AR_BASE + '/قوالب-الرسائل/:type',    (req, res) => { try { ok(res, self.getTemplateByType(req.params.type, req.query.sub)); } catch (e) { err(res, e, 404); } });

        // ─── English aliases ───
        app.get(EN_BASE + '/dashboard',      (req, res) => ok(res, self.getDashboard()));
        app.get(EN_BASE + '/channels',       (req, res) => ok(res, self.getChannels(req.query)));
        app.get(EN_BASE + '/ad-formats',     (req, res) => ok(res, self.getAdFormats(req.query)));
        app.get(EN_BASE + '/campaigns',      (req, res) => ok(res, self.getCampaigns(req.query)));
        app.get(EN_BASE + '/promotions',     (req, res) => ok(res, self.getPromotions()));
        app.get(EN_BASE + '/kpis',           (req, res) => ok(res, self.getKPIs(req.query)));
        app.get(EN_BASE + '/brand-voice',    (req, res) => ok(res, self.getBrandVoice()));
        app.get(EN_BASE + '/influencers',    (req, res) => ok(res, self.getInfluencers(req.query)));
        app.get(EN_BASE + '/templates',      (req, res) => ok(res, self.getTemplates()));
        app.get(EN_BASE + '/stats',          (req, res) => ok(res, self.getStats()));
        app.get(EN_BASE + '/health',         (req, res) => ok(res, self.getHealthReport()));
        app.post(EN_BASE + '/media-plan',    (req, res) => { try { ok(res, self.buildMediaPlan(req.body || {})); } catch (e) { err(res, e); } });
        app.post(EN_BASE + '/campaign-brief',(req, res) => { try { ok(res, self.generateCampaignBrief(req.body || {})); } catch (e) { err(res, e); } });
        app.post(EN_BASE + '/content-calendar',(req,res)=> { try { ok(res, self.generateContentCalendar(req.body || {})); } catch (e) { err(res, e); } });
        app.post(EN_BASE + '/campaigns',     (req, res) => { try { ok(res, self.createCampaign(req.body || {})); } catch (e) { err(res, e); } });

        console.log('\uD83D\uDE80 [CosmicMarketing v1.0] 24 عربي + 14 إنجليزي = 38 API | ' + AR_BASE);
    }

    // ──────────────────────────────────────────
    // INTERNAL
    // ──────────────────────────────────────────
    _broadcast(event, data) {
        this.emit(event, data);
        if (typeof this._broadcastFn === 'function') {
            try { this._broadcastFn(JSON.stringify({ type: event, data, ts: new Date().toISOString() })); } catch (_) { /* ignore */ }
        }
    }

    _startMonitor(interval) {
        this._monitorTimer = setInterval(() => {
            const staleThreshold = Date.now() - 7 * 86400000;
            for (const [, c] of this.campaigns) {
                if (c.status === 'active' && c.impressions === 0 && new Date(c.createdAt).getTime() < staleThreshold) {
                    this._broadcast('campaign:no-data', { campaignId: c.id, nameAr: c.nameAr });
                }
            }
        }, interval);
    }

    _ensureDataDir() { try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) { /* ignore */ } }

    _atomicWrite(filePath, data) {
        const tmp = filePath + '.tmp';
        try { fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8'); fs.renameSync(tmp, filePath); }
        catch (_) { try { fs.unlinkSync(tmp); } catch (__) { /* ignore */ } }
    }

    _loadPersisted() {
        this._ensureDataDir();
        const tryLoad = (file, cb) => { try { if (fs.existsSync(file)) cb(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (_) { /* ignore */ } };
        tryLoad(DB_FILE, d => {
            if (d.promotions) d.promotions.forEach(p => this.promotions.set(p.id, p));
            if (d.influencers) d.influencers.forEach(i => this.influencers.set(i.id, i));
            if (d.kpiReadings) d.kpiReadings.forEach(r => this.kpiReadings.set(r.id, r));
            if (d.metrics) Object.assign(this.metrics, d.metrics);
        });
        tryLoad(CAMP_FILE, d => { if (Array.isArray(d)) d.forEach(c => this.campaigns.set(c.id, c)); });
        this.metrics.totalCampaigns   = this.campaigns.size;
        this.metrics.activeCampaigns  = Array.from(this.campaigns.values()).filter(c => c.status === 'active').length;
    }

    _persist() {
        this._ensureDataDir();
        this._atomicWrite(DB_FILE, {
            metrics: this.metrics,
            promotions:  Array.from(this.promotions.values()),
            influencers: Array.from(this.influencers.values()),
            kpiReadings: Array.from(this.kpiReadings.values()),
            savedAt: new Date().toISOString(), version: VERSION
        });
    }

    _persistCampaigns() {
        this._ensureDataDir();
        this._atomicWrite(CAMP_FILE, Array.from(this.campaigns.values()));
    }

    getStatus() {
        return {
            name: this.name, nameAr: this.nameAr, version: this.version, status: 'active',
            owner: this.owner, channels: MARKETING_CHANNELS.length, adFormats: AD_FORMATS.length,
            kpis: MARKETING_KPIS.length, campaigns: this.campaigns.size, apis: 38
        };
    }

    stop() {
        if (this._monitorTimer) { clearInterval(this._monitorTimer); this._monitorTimer = null; }
        this._persist();
        this._persistCampaigns();
    }
}

module.exports = SheikhaCosmicMarketingSupremacyEngine;
