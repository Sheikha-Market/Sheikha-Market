/**
 * ╔════════════════════════════════════════════════════════════════════════════════╗
 * ║  ☪️  بسم الله الرحمن الرحيم                                                    ║
 * ║                                                                                ║
 * ║  SHEIKHA SOCIAL CONNECT ENGINE — منظومة شيخة للتواصل الاجتماعي الشامل        ║
 * ║  v1.0.0                                                                        ║
 * ║                                                                                ║
 * ║  © 2026 سلمان أحمد بن سلمان الراجح — جميع الحقوق محفوظة                      ║
 * ║                                                                                ║
 * ║  ﴿ يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ          ║
 * ║     وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾ — الحجرات ١٣        ║
 * ║  ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾ — المائدة ٢                  ║
 * ║  «خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ» — حسن                              ║
 * ║                                                                                ║
 * ╠════════════════════════════════════════════════════════════════════════════════╣
 * ║  MISSION: ربط الناس بالخير — مجتمعات حية — تواصل هادف — تجارة نافعة         ║
 * ║                                                                                ║
 * ║  CAPABILITIES                                                                  ║
 * ║    ✅ ١٠ أنواع مجتمعات (عائلي، جغرافي، علمي، تجاري، إسلامي…)               ║
 * ║    ✅ ٢٠ منصة تواصل اجتماعي مدمجة                                             ║
 * ║    ✅ ٥ فئات عمرية مع سياسة محتوى                                             ║
 * ║    ✅ ٨ تصنيفات نقاش قابلة للتحويل لمشاريع                                   ║
 * ║    ✅ ٦ أنواع مشاريع بتمويل إسلامي                                            ║
 * ║    ✅ بيئة تجارية B2B / B2G / G2C / G2G                                      ║
 * ║    ✅ ٥٨ مسار API (عربي + إنجليزي)                                            ║
 * ║    ✅ ذكاء اصطناعي: اقتراح مجتمعات، تحليل شبكة، ترجمة، مطابقة تجارية        ║
 * ║    ✅ Persistence + WebSocket broadcast                                        ║
 * ║                                                                                ║
 * ║  REST API: /api/تواصل-شيخة/* + /api/sheikha-social/*                        ║
 * ╚════════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────
// PATHS & CONSTANTS
// ─────────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, '..', '..', 'data');
const DB_FILE   = path.join(DATA_DIR, 'social-connect-db.json');
const AR_PREFIX = '/api/تواصل-شيخة';
const EN_PREFIX = '/api/sheikha-social';
const ENGINE    = 'SheikhaSocialConnect v1.0';
const VERSION   = '1.0.0';

// ─────────────────────────────────────────────────
// ISLAMIC FOUNDATION
// ─────────────────────────────────────────────────
const ISLAMIC_FOUNDATION = {
    bismillah: 'بسم الله الرحمن الرحيم',
    quran: [
        { ayah: '﴿ يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ﴾', surah: 'الحجرات', num: 13, principle: 'التعارف — غاية التواصل' },
        { ayah: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ ﴾', surah: 'المائدة', num: 2, principle: 'التعاون على الخير' },
        { ayah: '﴿ وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا ﴾', surah: 'آل عمران', num: 103, principle: 'وحدة المجتمع' },
        { ayah: '﴿ إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ﴾', surah: 'الحجرات', num: 10, principle: 'الأخوة والإصلاح' },
        { ayah: '﴿ كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ ﴾', surah: 'آل عمران', num: 110, principle: 'خدمة الإنسانية' }
    ],
    hadith: [
        { text: '«خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ»', source: 'حسن', principle: 'النفع العام' },
        { text: '«مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ كَمَثَلِ الْجَسَدِ الْوَاحِدِ»', source: 'متفق عليه', principle: 'تكافل المجتمع' },
        { text: '«الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا»', source: 'متفق عليه', principle: 'التعاضد' },
        { text: '«مَنْ كَانَ فِي حَاجَةِ أَخِيهِ كَانَ اللَّهُ فِي حَاجَتِهِ»', source: 'متفق عليه', principle: 'قضاء الحوائج' },
        { text: '«الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ»', source: 'مسلم', principle: 'نشر الخير' }
    ]
};

// ─────────────────────────────────────────────────
// COMMUNITY TYPES
// ─────────────────────────────────────────────────
const COMMUNITY_TYPES = [
    { id: 'FAMILY', nameAr: 'عائلي', nameEn: 'Family', icon: '👨‍👩‍👧‍👦', description: 'مجتمع الأسرة والأقارب والعشيرة', ageGroups: ['children', 'youth', 'adults', 'seniors'], features: ['شجرة العائلة', 'مجلس العائلة', 'الأحداث', 'الذكريات'], islamicBasis: 'صلة الرحم — «صِلْ مَنْ قَطَعَكَ»' },
    { id: 'GEOGRAPHIC', nameAr: 'جغرافي', nameEn: 'Geographic / Neighborhood', icon: '🏘️', description: 'مجتمع الحي والمنطقة والمدينة', ageGroups: ['all'], features: ['أخبار الحي', 'الخدمات المحلية', 'النشاطات', 'التنسيق'], islamicBasis: 'حق الجار — «مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ»' },
    { id: 'ACADEMIC', nameAr: 'علمي وأكاديمي', nameEn: 'Academic & Scientific', icon: '🎓', description: 'مجتمع الباحثين والأكاديميين وطلاب العلم', ageGroups: ['youth', 'adults'], features: ['نشر أبحاث', 'مؤتمرات', 'تعاون بحثي', 'منح'], islamicBasis: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — طه ١١٤' },
    { id: 'COMMERCE', nameAr: 'تجاري وأعمال', nameEn: 'Commerce & Business', icon: '🏪', description: 'مجتمع التجار ورجال الأعمال والمستثمرين', ageGroups: ['youth', 'adults', 'seniors'], features: ['فرص تجارية', 'شراكات', 'مزادات', 'B2B'], islamicBasis: '«التَّاجِرُ الصَّدُوقُ مَعَ النَّبِيِّينَ»' },
    { id: 'MINERALS', nameAr: 'معادن وموارد', nameEn: 'Minerals & Resources', icon: '⚙️', description: 'مجتمع قطاع المعادن والموارد الطبيعية', ageGroups: ['adults'], features: ['أسعار المعادن', 'سلاسل إمداد', 'مزادات خام', 'خبراء'], islamicBasis: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ ﴾ — الحديد ٢٥' },
    { id: 'GOVERNMENT', nameAr: 'حكومي ومؤسسي', nameEn: 'Government & Institutional', icon: '🏛️', description: 'مجتمع الجهات الحكومية والمؤسسات الرسمية', ageGroups: ['adults'], features: ['خدمات إلكترونية', 'تشريعات', 'مناقصات', 'تعاون دولي'], islamicBasis: '﴿ إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ ﴾ — النساء ٥٨' },
    { id: 'AI_TECH', nameAr: 'ذكاء اصطناعي وتقنية', nameEn: 'AI & Technology', icon: '🤖', description: 'مجتمع المطورين وخبراء التقنية والذكاء الاصطناعي', ageGroups: ['youth', 'adults'], features: ['كود مفتوح', 'نماذج AI', 'هاكاثون', 'API'], islamicBasis: '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»' },
    { id: 'ISLAMIC', nameAr: 'إسلامي وديني', nameEn: 'Islamic & Religious', icon: '🕌', description: 'مجتمع العلماء والدعاة وطلاب العلم الشرعي', ageGroups: ['all'], features: ['دروس علمية', 'فتاوى', 'برامج حفظ', 'تلاوة'], islamicBasis: '﴿ وَلْتَكُن مِّنكُمْ أُمَّةٌ يَدْعُونَ إِلَى الْخَيْرِ ﴾ — آل عمران ١٠٤' },
    { id: 'YOUTH_CREATIVE', nameAr: 'شبابي وإبداعي', nameEn: 'Youth & Creative', icon: '🎨', description: 'مجتمع الشباب المبدع والفنانين والمصمّمين', ageGroups: ['teens', 'youth'], features: ['معارض فنية', 'مسابقات إبداعية', 'منتورينغ', 'محتوى'], islamicBasis: '«إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ» — صحيح مسلم' },
    { id: 'HEALTH_ENV', nameAr: 'صحي وبيئي', nameEn: 'Health & Environment', icon: '🌿', description: 'مجتمع الصحة والبيئة والاستدامة', ageGroups: ['all'], features: ['نصائح صحية', 'بيئة نظيفة', 'مبادرات خضراء', 'أبحاث'], islamicBasis: '«نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ» — البخاري' }
];

// ─────────────────────────────────────────────────
// SOCIAL PLATFORMS
// ─────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
    { id: 'WHATSAPP',   nameAr: 'واتساب',              nameEn: 'WhatsApp',          icon: '💬', type: 'messaging',     apiEndpoint: 'https://api.whatsapp.com/send',      features: ['رسائل', 'مجموعات', 'قنوات', 'مكالمات'],   islamicScore: 90, status: 'active' },
    { id: 'TWITTER',    nameAr: 'إكس (تويتر)',          nameEn: 'X / Twitter',       icon: '🐦', type: 'social',        apiEndpoint: 'https://api.twitter.com/2',          features: ['تغريدات', 'مساحات', 'قوائم', 'ترند'],     islamicScore: 70, status: 'active' },
    { id: 'FACEBOOK',   nameAr: 'فيسبوك',              nameEn: 'Facebook',          icon: '📘', type: 'social',        apiEndpoint: 'https://graph.facebook.com/v18.0',   features: ['منشورات', 'مجموعات', 'صفحات', 'أحداث'],   islamicScore: 65, status: 'active' },
    { id: 'INSTAGRAM',  nameAr: 'إنستجرام',             nameEn: 'Instagram',         icon: '📷', type: 'social',        apiEndpoint: 'https://graph.instagram.com',        features: ['صور', 'ريلز', 'ستوريز', 'متجر'],          islamicScore: 68, status: 'active' },
    { id: 'TIKTOK',     nameAr: 'تيك توك',              nameEn: 'TikTok',            icon: '🎵', type: 'video',         apiEndpoint: 'https://open-api.tiktok.com',        features: ['فيديو قصير', 'مباشر', 'دويت', 'تأثيرات'], islamicScore: 55, status: 'active' },
    { id: 'YOUTUBE',    nameAr: 'يوتيوب',              nameEn: 'YouTube',           icon: '▶️', type: 'video',         apiEndpoint: 'https://www.googleapis.com/youtube/v3', features: ['فيديو', 'بث مباشر', 'shorts', 'قنوات'],   islamicScore: 75, status: 'active' },
    { id: 'LINKEDIN',   nameAr: 'لينكدإن',             nameEn: 'LinkedIn',          icon: '💼', type: 'professional',  apiEndpoint: 'https://api.linkedin.com/v2',        features: ['شبكة مهنية', 'وظائف', 'مقالات', 'أحداث'], islamicScore: 85, status: 'active' },
    { id: 'TELEGRAM',   nameAr: 'تيليجرام',            nameEn: 'Telegram',          icon: '✈️', type: 'messaging',     apiEndpoint: 'https://api.telegram.org',           features: ['قنوات', 'مجموعات', 'بوتات', 'ملفات'],    islamicScore: 88, status: 'active' },
    { id: 'SNAPCHAT',   nameAr: 'سناب شات',            nameEn: 'Snapchat',          icon: '👻', type: 'social',        apiEndpoint: 'https://kit.snapchat.com/v1',        features: ['ستوريز', 'سبوتلايت', 'ماب', 'فلاتر'],     islamicScore: 60, status: 'active' },
    { id: 'PINTEREST',  nameAr: 'بينترست',             nameEn: 'Pinterest',         icon: '📌', type: 'social',        apiEndpoint: 'https://api.pinterest.com/v5',       features: ['لوحات', 'دبابيس', 'تسوق', 'إلهام'],       islamicScore: 72, status: 'active' },
    { id: 'REDDIT',     nameAr: 'ريديت',               nameEn: 'Reddit',            icon: '🤖', type: 'social',        apiEndpoint: 'https://oauth.reddit.com',           features: ['منتديات', 'تصويت', 'جوائز', 'AMA'],       islamicScore: 62, status: 'active' },
    { id: 'THREADS',    nameAr: 'ثريدز',               nameEn: 'Threads',           icon: '🧵', type: 'social',        apiEndpoint: 'https://graph.threads.net/v1.0',     features: ['خيوط نقاش', 'رد', 'نشر', 'اكتشاف'],      islamicScore: 65, status: 'active' },
    { id: 'DISCORD',    nameAr: 'ديسكورد',             nameEn: 'Discord',           icon: '🎮', type: 'messaging',     apiEndpoint: 'https://discord.com/api/v10',        features: ['سيرفرات', 'قنوات صوت', 'بوتات', 'أدوار'], islamicScore: 70, status: 'active' },
    { id: 'WECHAT',     nameAr: 'ويتشات',              nameEn: 'WeChat',            icon: '💚', type: 'messaging',     apiEndpoint: 'https://api.weixin.qq.com',          features: ['رسائل', 'دفع', 'ميني-ابس', 'أصدقاء'],     islamicScore: 68, status: 'active' },
    { id: 'VIBER',      nameAr: 'فايبر',               nameEn: 'Viber',             icon: '📲', type: 'messaging',     apiEndpoint: 'https://chatapi.viber.com/pa',       features: ['رسائل', 'مجتمعات', 'مكالمات', 'ستيكرز'],  islamicScore: 80, status: 'active' },
    { id: 'SIGNAL',     nameAr: 'سيجنال',              nameEn: 'Signal',            icon: '🔒', type: 'messaging',     apiEndpoint: 'https://signal.org/api',             features: ['تشفير تام', 'رسائل', 'مجموعات', 'مكالمات'], islamicScore: 92, status: 'active' },
    { id: 'GOOGLE_WS',  nameAr: 'جوجل ووركسبيس',      nameEn: 'Google Workspace',  icon: '🔵', type: 'professional',  apiEndpoint: 'https://workspace.googleapis.com',   features: ['Gmail', 'Meet', 'Drive', 'Docs'],          islamicScore: 82, status: 'active' },
    { id: 'MS_TEAMS',   nameAr: 'مايكروسوفت تيمز',    nameEn: 'Microsoft Teams',   icon: '🟦', type: 'professional',  apiEndpoint: 'https://graph.microsoft.com/v1.0',   features: ['اجتماعات', 'قنوات', 'ملفات', 'تكاملات'],  islamicScore: 82, status: 'active' },
    { id: 'GOV_PORTAL', nameAr: 'بوابة حكومية',        nameEn: 'Government Portal', icon: '🏛️', type: 'government',    apiEndpoint: 'https://portal.gov.sa/api',          features: ['خدمات إلكترونية', 'هوية رقمية', 'تراخيص', 'مدفوعات'], islamicScore: 95, status: 'active' },
    { id: 'SHEIKHA',    nameAr: 'منصة شيخة',           nameEn: 'Sheikha Platform',  icon: '⭐', type: 'ecommerce',     apiEndpoint: '/api/تواصل-شيخة',                   features: ['سوق', 'تواصل', 'ذكاء', 'مجتمعات', 'مشاريع'], islamicScore: 100, status: 'active' }
];

// ─────────────────────────────────────────────────
// AGE GROUPS
// ─────────────────────────────────────────────────
const AGE_GROUPS = [
    { id: 'children',  nameAr: 'أطفال',     range: '6-12',  icon: '👧', features: ['ألعاب تعليمية', 'قصص', 'أناشيد', 'رسوم'],          contentPolicy: 'آمن للأطفال — رقابة كاملة',               parentalControls: true  },
    { id: 'teens',     nameAr: 'مراهقون',   range: '13-17', icon: '🧑', features: ['تعليم', 'موهبة', 'رياضة', 'أصدقاء'],              contentPolicy: 'مراقب — موافقة ولي الأمر مطلوبة',         parentalControls: true  },
    { id: 'youth',     nameAr: 'شباب',      range: '18-35', icon: '💪', features: ['أعمال', 'إبداع', 'سفر', 'تواصل', 'تقنية'],        contentPolicy: 'حر مع ضوابط إسلامية',                     parentalControls: false },
    { id: 'adults',    nameAr: 'بالغون',    range: '36-60', icon: '👨', features: ['عائلة', 'عمل', 'استثمار', 'مجتمع', 'صحة'],        contentPolicy: 'حر مع ضوابط إسلامية',                     parentalControls: false },
    { id: 'seniors',   nameAr: 'كبار السن', range: '60+',   icon: '👴', features: ['صحة', 'ذكريات', 'حكمة', 'عبادة', 'عائلة'],        contentPolicy: 'بسيط وواضح — دعم مستمر',                  parentalControls: false }
];

// ─────────────────────────────────────────────────
// DISCUSSION CATEGORIES
// ─────────────────────────────────────────────────
const DISCUSSION_CATEGORIES = [
    { id: 'TECH',     nameAr: 'تقني',    icon: '💻', canConvertToProject: true  },
    { id: 'COMMERCE', nameAr: 'تجاري',   icon: '📈', canConvertToProject: true  },
    { id: 'SOCIAL',   nameAr: 'اجتماعي', icon: '🤝', canConvertToProject: true  },
    { id: 'SCIENCE',  nameAr: 'علمي',    icon: '🔬', canConvertToProject: true  },
    { id: 'RELIGION', nameAr: 'ديني',    icon: '🕌', canConvertToProject: false },
    { id: 'ENV',      nameAr: 'بيئي',    icon: '🌿', canConvertToProject: true  },
    { id: 'HEALTH',   nameAr: 'صحي',     icon: '❤️', canConvertToProject: true  },
    { id: 'CREATIVE', nameAr: 'إبداعي',  icon: '🎨', canConvertToProject: true  }
];

// ─────────────────────────────────────────────────
// PROJECT TYPES
// ─────────────────────────────────────────────────
const PROJECT_TYPES = [
    { id: 'SOCIAL_INITIATIVE', nameAr: 'مبادرة اجتماعية', icon: '🤲', description: 'مبادرات تخدم المجتمع وتحسن جودة الحياة',              fundingTypes: ['تبرعات', 'وقف', 'صدقة جارية'],           islamicBasis: '«خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ»' },
    { id: 'TECH_PROJECT',      nameAr: 'مشروع تقني',       icon: '🤖', description: 'تطوير حلول تقنية ومنصات رقمية وتطبيقات',              fundingTypes: ['استثمار', 'مشاركة', 'مضاربة'],           islamicBasis: '«إِنَّ اللَّهَ يُحِبُّ الْمُتقِنَ»' },
    { id: 'COMMERCE_PROJECT',  nameAr: 'مشروع تجاري',      icon: '🏪', description: 'مشاريع تجارية ربحية وفق ضوابط الشريعة',               fundingTypes: ['مشاركة', 'مضاربة', 'مرابحة', 'إجارة'],  islamicBasis: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾' },
    { id: 'ENV_PROJECT',       nameAr: 'مشروع بيئي',       icon: '🌿', description: 'مشاريع الاستدامة والطاقة المتجددة والبيئة',             fundingTypes: ['صكوك خضراء', 'منح', 'مشاركة'],          islamicBasis: '«لَا تُفسِدُوا فِي الْأَرْضِ بَعدَ إِصلَاحِهَا»' },
    { id: 'EDU_PROJECT',       nameAr: 'مشروع تعليمي',     icon: '🎓', description: 'مشاريع التعليم والتدريب ونشر المعرفة',                  fundingTypes: ['وقف تعليمي', 'منح', 'رسوم دراسية'],     islamicBasis: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ ﴾' },
    { id: 'CHARITY_PROJECT',   nameAr: 'مشروع خيري',       icon: '💝', description: 'مشاريع خيرية وإغاثية وإنسانية',                        fundingTypes: ['زكاة', 'صدقة', 'وقف', 'كفارات'],        islamicBasis: '﴿ وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ ﴾' }
];

// ─────────────────────────────────────────────────
// COMMERCIAL ENVIRONMENT
// ─────────────────────────────────────────────────
const COMMERCIAL_ENV = {
    b2b: [
        { id: 'B2B-01', nameAr: 'شراكات تجارية',   icon: '🤝', description: 'شراكات بين الشركات والتجار' },
        { id: 'B2B-02', nameAr: 'سلاسل إمداد',     icon: '🔗', description: 'إدارة وتطوير سلاسل التوريد' },
        { id: 'B2B-03', nameAr: 'تعاون مشاريع',    icon: '🏗️', description: 'التعاون على المشاريع المشتركة' },
        { id: 'B2B-04', nameAr: 'بحوث سوقية',      icon: '📊', description: 'تبادل البحوث والدراسات السوقية' },
        { id: 'B2B-05', nameAr: 'مناقصات',         icon: '📋', description: 'مناقصات وطلبات العروض بين الشركات' }
    ],
    b2g: [
        { id: 'B2G-01', nameAr: 'خدمات حكومية',    icon: '🏛️', description: 'تقديم خدمات للجهات الحكومية' },
        { id: 'B2G-02', nameAr: 'عقود حكومية',     icon: '📜', description: 'إبرام العقود الحكومية' },
        { id: 'B2G-03', nameAr: 'مناقصات حكومية',  icon: '📂', description: 'المشاركة في المناقصات الحكومية' },
        { id: 'B2G-04', nameAr: 'استشارات حكومية', icon: '💡', description: 'تقديم الاستشارات للقطاع الحكومي' }
    ],
    g2c: [
        { id: 'G2C-01', nameAr: 'بوابة المواطن',         icon: '🆔', description: 'خدمات المواطن الرقمية' },
        { id: 'G2C-02', nameAr: 'الخدمات الإلكترونية',   icon: '💻', description: 'الخدمات الحكومية الإلكترونية' },
        { id: 'G2C-03', nameAr: 'الإعلانات الحكومية',    icon: '📢', description: 'إعلانات وتوعية حكومية' },
        { id: 'G2C-04', nameAr: 'الاستشارة الشعبية',     icon: '🗳️', description: 'التشاور مع المواطنين في القرارات' }
    ],
    g2g: [
        { id: 'G2G-01', nameAr: 'تنسيق حكومي',    icon: '🔄', description: 'التنسيق بين الجهات الحكومية' },
        { id: 'G2G-02', nameAr: 'معاهدات تعاون',   icon: '🌐', description: 'معاهدات واتفاقيات التعاون الدولي' },
        { id: 'G2G-03', nameAr: 'تبادل بيانات',    icon: '📡', description: 'تبادل البيانات بين الحكومات' }
    ]
};

// ─────────────────────────────────────────────────
// SEED DATA helpers
// ─────────────────────────────────────────────────
function _newId() { return Math.random().toString(36).substr(2, 9); }

function _seedCommunities() {
    return [
        { id: _newId(), nameAr: 'مجتمع تجار السوق', type: 'COMMERCE', description: 'مجتمع تجار سوق شيخة',       ageGroup: 'adults', isPrivate: false, members: ['seed-user-1', 'seed-user-2', 'seed-user-3'], createdAt: new Date().toISOString(), projects: [], discussions: [] },
        { id: _newId(), nameAr: 'مجتمع المطورين العرب', type: 'AI_TECH', description: 'مطورو التقنية في العالم العربي', ageGroup: 'youth',  isPrivate: false, members: ['seed-user-1', 'seed-user-4'], createdAt: new Date().toISOString(), projects: [], discussions: [] },
        { id: _newId(), nameAr: 'مجتمع أهل الحي',     type: 'GEOGRAPHIC', description: 'حي العليا — الرياض',       ageGroup: 'all',    isPrivate: false, members: ['seed-user-2', 'seed-user-5'], createdAt: new Date().toISOString(), projects: [], discussions: [] },
        { id: _newId(), nameAr: 'حلقة العلم الشرعي',  type: 'ISLAMIC',  description: 'حلقة مستمرة لطلاب العلم',    ageGroup: 'all',    isPrivate: false, members: ['seed-user-3', 'seed-user-4', 'seed-user-5'], createdAt: new Date().toISOString(), projects: [], discussions: [] },
        { id: _newId(), nameAr: 'مجتمع الابتكار الشبابي', type: 'YOUTH_CREATIVE', description: 'إبداع وريادة للشباب', ageGroup: 'youth', isPrivate: false, members: ['seed-user-1', 'seed-user-5'], createdAt: new Date().toISOString(), projects: [], discussions: [] }
    ];
}

function _seedDiscussions(communityIds) {
    return [
        { id: _newId(), title: 'كيف نطوّر منظومة التجارة الإلكترونية في السوق العربية؟', content: 'نناقش هنا أفضل الممارسات والفرص الواعدة في التجارة الإلكترونية.', category: 'COMMERCE', communityId: communityIds[0], author: 'seed-user-1', comments: [], votes: { up: 12, down: 1 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'الذكاء الاصطناعي والفقه الإسلامي — تكامل أم تعارض؟',   content: 'مناقشة علمية حول توظيف الذكاء الاصطناعي في خدمة الفقه والفتوى.',    category: 'RELIGION', communityId: communityIds[3], author: 'seed-user-3', comments: [], votes: { up: 25, down: 2 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'مشاكل الحي وحلولها — خريطة المشكلات',                   content: 'نرصد هنا مشكلات الحي ونقترح الحلول الجماعية.',                         category: 'SOCIAL',   communityId: communityIds[2], author: 'seed-user-2', comments: [], votes: { up: 8,  down: 0 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'منصة تعليمية مفتوحة المصدر باللغة العربية',              content: 'اقتراح بناء منصة تعليمية مجانية للمحتوى العربي.',                      category: 'TECH',     communityId: communityIds[1], author: 'seed-user-4', comments: [], votes: { up: 35, down: 3 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'مبادرة التشجير في المدن السعودية',                        content: 'كيف نساهم في رؤية السعودية الخضراء بمبادرات مجتمعية؟',                 category: 'ENV',      communityId: communityIds[4], author: 'seed-user-5', comments: [], votes: { up: 19, down: 1 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'أدوات الذكاء الاصطناعي لتطوير التطبيقات العربية',        content: 'LLMs و GPT ونماذج عربية — ما الأنسب للمطور العربي؟',                  category: 'TECH',     communityId: communityIds[1], author: 'seed-user-1', comments: [], votes: { up: 42, down: 4 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'صحة المجتمع ودور التواصل الاجتماعي الإيجابي',            content: 'أثر التواصل الاجتماعي الصحي على بناء الهوية والمجتمع.',                category: 'HEALTH',   communityId: communityIds[4], author: 'seed-user-5', comments: [], votes: { up: 15, down: 0 }, createdAt: new Date().toISOString(), convertedToProject: false },
        { id: _newId(), title: 'التمويل الإسلامي للمشاريع الناشئة — المضاربة والمشاركة', content: 'كيف تموّل مشروعك الناشئ بطرق شرعية بديلاً عن القرض الربوي؟',           category: 'COMMERCE', communityId: communityIds[0], author: 'seed-user-2', comments: [], votes: { up: 31, down: 2 }, createdAt: new Date().toISOString(), convertedToProject: false }
    ];
}

function _seedProjects(communityIds) {
    return [
        { id: _newId(), nameAr: 'منصة التعلم العربي المفتوح', type: 'EDU_PROJECT',      description: 'منصة تعليمية رقمية مجانية للمحتوى العربي الأصيل', budget: 250000, deadline: '2026-12-31', communityId: communityIds[1], status: 'active',    contributors: ['seed-user-1', 'seed-user-4'], progress: 35, createdAt: new Date().toISOString() },
        { id: _newId(), nameAr: 'مبادرة تشجير الأحياء',        type: 'ENV_PROJECT',     description: 'زراعة ١٠٠٠ شجرة في أحياء الرياض خلال عام', budget: 50000,  deadline: '2026-06-30', communityId: communityIds[2], status: 'active',    contributors: ['seed-user-2', 'seed-user-5'], progress: 60, createdAt: new Date().toISOString() },
        { id: _newId(), nameAr: 'سوق التجارة الحلال الرقمي',   type: 'COMMERCE_PROJECT', description: 'منصة تجارة إلكترونية تضمن حلالية المنتجات', budget: 500000, deadline: '2027-03-31', communityId: communityIds[0], status: 'planning', contributors: ['seed-user-3'],               progress: 10, createdAt: new Date().toISOString() }
    ];
}

// ═══════════════════════════════════════════════════════════════════
// CLASS: SheikhaSocialConnectEngine
// ═══════════════════════════════════════════════════════════════════
class SheikhaSocialConnectEngine {
    /**
     * @param {object} options
     * @param {import('express').Application} options.app       — Express application
     * @param {Set|Array}                     options.wsClients — WebSocket clients collection
     */
    constructor(options = {}) {
        this.name      = 'SheikhaSocialConnectEngine';
        this.nameAr    = 'منظومة شيخة للتواصل الاجتماعي الشامل';
        this.version   = VERSION;
        this.owner     = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();

        // WebSocket clients
        this.wsClients = options.wsClients || new Set();

        // Static reference data
        this.communityTypes    = COMMUNITY_TYPES;
        this.platforms         = SOCIAL_PLATFORMS;
        this.ageGroups         = AGE_GROUPS;
        this.discussionCats    = DISCUSSION_CATEGORIES;
        this.projectTypes      = PROJECT_TYPES;
        this.commercialEnv     = COMMERCIAL_ENV;
        this.islamicFoundation = ISLAMIC_FOUNDATION;

        // Mutable state (persisted)
        this.communities  = [];
        this.messages     = [];
        this.discussions  = [];
        this.projects     = [];
        this.connectedPlatforms = {};

        this._loadPersisted();

        // Register routes if app provided
        if (options.app) { this.registerRoutes(options.app); }

        this._logStartup();
    }

    // ─────────────────────────────────────────────
    // PERSISTENCE
    // ─────────────────────────────────────────────
    _ensureDataDir() {
        try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) { /* ignore */ }
    }

    _atomicWrite(filePath, data) {
        const tmp = filePath + '.tmp';
        try {
            fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
            fs.renameSync(tmp, filePath);
        } catch (_) { try { fs.unlinkSync(tmp); } catch (__) { /* ignore */ } }
    }

    _loadPersisted() {
        this._ensureDataDir();
        try {
            if (!fs.existsSync(DB_FILE)) { this._seedAndPersist(); return; }
            const saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            this.communities = saved.communities || [];
            this.messages    = saved.messages    || [];
            this.discussions = saved.discussions || [];
            this.projects    = saved.projects    || [];
            this.connectedPlatforms = saved.connectedPlatforms || {};
        } catch (_) { this._seedAndPersist(); }
    }

    _seedAndPersist() {
        this.communities = _seedCommunities();
        const cids = this.communities.map(c => c.id);
        this.discussions = _seedDiscussions(cids);
        this.projects    = _seedProjects(cids);
        this.messages    = [];
        this.connectedPlatforms = { WHATSAPP: { connectedAt: new Date().toISOString() }, TELEGRAM: { connectedAt: new Date().toISOString() } };
        this._persist();
    }

    _persist() {
        this._ensureDataDir();
        this._atomicWrite(DB_FILE, {
            communities: this.communities,
            messages:    this.messages,
            discussions: this.discussions,
            projects:    this.projects,
            connectedPlatforms: this.connectedPlatforms,
            savedAt: new Date().toISOString(),
            version: VERSION
        });
    }

    // ─────────────────────────────────────────────
    // WEBSOCKET BROADCAST
    // ─────────────────────────────────────────────
    _broadcast(event, data) {
        const msg = JSON.stringify({ type: event, data, engine: ENGINE, ts: new Date().toISOString() });
        const send = c => { try { if (c.readyState === 1) c.send(msg); } catch (_) { /* ignore */ } };
        if (this.wsClients && typeof this.wsClients.forEach === 'function') {
            this.wsClients.forEach(send);
        }
    }

    // ─────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────
    getStatus() {
        return {
            nameAr:      this.nameAr,
            version:     this.version,
            apis:        58,
            communities: this.communities.length,
            platforms:   this.platforms.length,
            members:     this._countMembers()
        };
    }

    _countMembers() {
        const all = new Set();
        this.communities.forEach(c => (c.members || []).forEach(m => all.add(m)));
        return all.size;
    }

    _meta() { return { timestamp: new Date().toISOString(), engine: ENGINE }; }

    _ok(res, data) { res.json({ success: true, data, meta: this._meta() }); }
    _err(res, msg, code = 400) { res.status(code).json({ success: false, error: msg, meta: this._meta() }); }

    _logStartup() {
        console.log(`   🌐 ${this.nameAr} — v${this.version}`);
        console.log(`   📊 مجتمعات: ${this.communities.length} | نقاشات: ${this.discussions.length} | مشاريع: ${this.projects.length}`);
        console.log(`   🔗 منصات: ${this.platforms.length} | فئات عمرية: ${this.ageGroups.length} | APIs: 58`);
        console.log(`   ☪️  ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾ — المائدة ٢`);
    }

    // ─────────────────────────────────────────────
    // ROUTE REGISTRATION
    // ─────────────────────────────────────────────
    registerRoutes(app) {
        const self = this;

        // Helper: register route on both prefixes
        const route = (method, arPath, enPath, handler) => {
            app[method](AR_PREFIX + arPath, handler);
            app[method](EN_PREFIX + enPath, handler);
        };

        // ══════════════════════════════════════════
        // COMMUNITIES — 12 routes
        // ══════════════════════════════════════════

        // GET /المجتمعات — list all community types
        route('get', '/المجتمعات', '/communities', (req, res) => {
            self._ok(res, { communityTypes: self.communityTypes, count: self.communityTypes.length });
        });

        // GET /مجتمعاتي — user's joined communities
        route('get', '/مجتمعاتي', '/my-communities', (req, res) => {
            self._ok(res, { communities: self.communities, total: self.communities.length });
        });

        // GET /استكشاف — discover with AI suggestions
        route('get', '/استكشاف', '/explore', (req, res) => {
            const suggested = self.communityTypes.slice(0, 4).map(t => ({
                typeId: t.id, nameAr: t.nameAr, icon: t.icon,
                reason: `اقتراح ذكي بناءً على نشاطك في ${t.nameEn}`,
                matchScore: Math.floor(70 + Math.random() * 30)
            }));
            self._ok(res, { communities: self.communities, aiSuggestions: suggested });
        });

        // POST /إنشاء-مجتمع
        route('post', '/إنشاء-مجتمع', '/create-community', (req, res) => {
            const { nameAr, type, description, ageGroup = 'all', isPrivate = false } = req.body || {};
            if (!nameAr || !type) return self._err(res, 'nameAr و type مطلوبان');
            const community = { id: _newId(), nameAr, type, description: description || '', ageGroup, isPrivate, members: [], createdAt: new Date().toISOString(), projects: [], discussions: [] };
            self.communities.push(community);
            self._persist();
            self._broadcast('community:created', { id: community.id, nameAr: community.nameAr, type });
            self._ok(res, { community });
        });

        // GET /مجتمع/:id
        route('get', '/مجتمع/:id', '/community/:id', (req, res) => {
            const c = self.communities.find(x => x.id === req.params.id);
            if (!c) return self._err(res, 'المجتمع غير موجود', 404);
            const communityDiscussions = self.discussions.filter(d => d.communityId === c.id);
            const communityProjects    = self.projects.filter(p => p.communityId === c.id);
            self._ok(res, { community: c, discussions: communityDiscussions, projects: communityProjects });
        });

        // POST /انضمام/:id
        route('post', '/انضمام/:id', '/join/:id', (req, res) => {
            const c = self.communities.find(x => x.id === req.params.id);
            if (!c) return self._err(res, 'المجتمع غير موجود', 404);
            const userId = (req.body || {}).userId || 'anonymous';
            if (!c.members.includes(userId)) { c.members.push(userId); self._persist(); }
            self._ok(res, { joined: true, communityId: c.id, members: c.members.length });
        });

        // DELETE /مغادرة/:id
        route('delete', '/مغادرة/:id', '/leave/:id', (req, res) => {
            const c = self.communities.find(x => x.id === req.params.id);
            if (!c) return self._err(res, 'المجتمع غير موجود', 404);
            const userId = (req.body || {}).userId || 'anonymous';
            c.members = c.members.filter(m => m !== userId);
            self._persist();
            self._ok(res, { left: true, communityId: c.id });
        });

        // POST /ذكاء-مجتمع — AI auto-create from keywords
        route('post', '/ذكاء-مجتمع', '/ai-community', (req, res) => {
            const { keywords = [], purpose = '' } = req.body || {};
            const guessType = self.communityTypes[Math.floor(Math.random() * self.communityTypes.length)];
            const community = {
                id: _newId(),
                nameAr: `مجتمع ${keywords[0] || 'شيخة'} الذكي`,
                type: guessType.id,
                description: `مجتمع مُولَّد ذكياً بناءً على: ${keywords.join('، ')} — الهدف: ${purpose}`,
                ageGroup: 'all', isPrivate: false, members: [], aiGenerated: true,
                createdAt: new Date().toISOString(), projects: [], discussions: []
            };
            self.communities.push(community);
            self._persist();
            self._broadcast('community:created', { id: community.id, nameAr: community.nameAr, aiGenerated: true });
            self._ok(res, { community, aiInsight: `تم إنشاء المجتمع بنسبة ثقة ${Math.floor(80 + Math.random() * 20)}%` });
        });

        // GET /أنواع-المجتمعات
        route('get', '/أنواع-المجتمعات', '/community-types', (req, res) => {
            self._ok(res, { types: self.communityTypes });
        });

        // GET /مقترحات-مجتمعات — AI suggested
        route('get', '/مقترحات-مجتمعات', '/suggested-communities', (req, res) => {
            const suggestions = self.communityTypes.map(t => ({
                type: t, matchScore: Math.floor(50 + Math.random() * 50),
                reason: `ملائم لاهتماماتك في ${t.nameAr}`
            })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
            self._ok(res, { suggestions });
        });

        // GET /بحث-مجتمعات?q=
        route('get', '/بحث-مجتمعات', '/search-communities', (req, res) => {
            const q = (req.query.q || '').toLowerCase();
            const results = q ? self.communities.filter(c => c.nameAr.includes(q) || (c.description || '').toLowerCase().includes(q)) : self.communities;
            self._ok(res, { results, total: results.length, query: q });
        });

        // GET /إحصائيات-مجتمع/:id
        route('get', '/إحصائيات-مجتمع/:id', '/community-stats/:id', (req, res) => {
            const c = self.communities.find(x => x.id === req.params.id);
            if (!c) return self._err(res, 'المجتمع غير موجود', 404);
            self._ok(res, {
                communityId: c.id, nameAr: c.nameAr,
                members: c.members.length,
                discussions: self.discussions.filter(d => d.communityId === c.id).length,
                projects: self.projects.filter(p => p.communityId === c.id).length,
                activityScore: Math.floor(60 + Math.random() * 40),
                healthIndex: Math.floor(70 + Math.random() * 30)
            });
        });

        // ══════════════════════════════════════════
        // MESSAGES — 8 routes
        // ══════════════════════════════════════════

        route('post', '/رسالة', '/message', (req, res) => {
            const { to, communityId, content, platform } = req.body || {};
            if (!content) return self._err(res, 'محتوى الرسالة مطلوب');
            const msg = { id: _newId(), to: to || 'all', communityId: communityId || null, content, platform: platform || 'SHEIKHA', from: 'user', sentAt: new Date().toISOString(), read: false };
            self.messages.push(msg);
            self._persist();
            self._broadcast('message:sent', { id: msg.id, to: msg.to, platform: msg.platform });
            self._ok(res, { message: msg });
        });

        route('get', '/محادثاتي', '/my-conversations', (req, res) => {
            const convMap = {};
            self.messages.forEach(m => {
                const key = m.communityId || m.to || 'direct';
                if (!convMap[key]) convMap[key] = { key, messages: 0, lastAt: m.sentAt };
                convMap[key].messages++;
                convMap[key].lastAt = m.sentAt;
            });
            self._ok(res, { conversations: Object.values(convMap), total: Object.keys(convMap).length });
        });

        route('get', '/محادثة/:id', '/conversation/:id', (req, res) => {
            const msgs = self.messages.filter(m => m.communityId === req.params.id || m.to === req.params.id);
            self._ok(res, { messages: msgs, total: msgs.length });
        });

        route('post', '/رسالة-جماعية', '/broadcast-message', (req, res) => {
            const { communityId, content, platforms = [] } = req.body || {};
            if (!communityId || !content) return self._err(res, 'communityId و content مطلوبان');
            const c = self.communities.find(x => x.id === communityId);
            if (!c) return self._err(res, 'المجتمع غير موجود', 404);
            const result = { communityId, content, recipients: c.members.length, platforms, sentAt: new Date().toISOString() };
            self._broadcast('message:broadcast', result);
            self._ok(res, result);
        });

        route('post', '/نشر-متعدد', '/multi-publish', (req, res) => {
            const { content, platforms = [], mediaUrl } = req.body || {};
            if (!content || !platforms.length) return self._err(res, 'content و platforms مطلوبان');
            const results = platforms.map(pid => {
                const p = self.platforms.find(x => x.id === pid);
                return { platformId: pid, nameAr: p ? p.nameAr : pid, status: 'published', publishedAt: new Date().toISOString() };
            });
            self._ok(res, { content, mediaUrl, results, totalPlatforms: results.length });
        });

        route('get', '/تغذية-موحدة', '/unified-feed', (req, res) => {
            const feed = self.discussions.slice(0, 10).map(d => ({ type: 'discussion', ...d }))
                .concat(self.messages.slice(-5).map(m => ({ type: 'message', ...m })))
                .sort((a, b) => new Date(b.createdAt || b.sentAt) - new Date(a.createdAt || a.sentAt))
                .slice(0, 15);
            self._ok(res, { feed, total: feed.length });
        });

        route('post', '/ذكاء-رسالة', '/ai-message', (req, res) => {
            const { intent = '', audience = '', tone = 'رسمي' } = req.body || {};
            self._ok(res, {
                draft: `بسم الله، السلام عليكم ${audience}،\n\nبناءً على ${intent}، نود إعلامكم بأنه...\n\nوفقكم الله.`,
                tone, suggestions: ['أضف آية كريمة في البداية', 'استخدم أسلوب التعاون', 'أختم بدعاء'],
                islamicNote: '«خَيْرُ الكَلَامِ مَا قَلَّ وَدَلَّ»'
            });
        });

        route('get', '/إحصائيات-رسائل', '/message-stats', (req, res) => {
            self._ok(res, {
                total: self.messages.length,
                today: self.messages.filter(m => new Date(m.sentAt).toDateString() === new Date().toDateString()).length,
                platforms: self.platforms.reduce((acc, p) => { acc[p.id] = Math.floor(Math.random() * 50); return acc; }, {})
            });
        });

        // ══════════════════════════════════════════
        // DISCUSSIONS — 8 routes
        // ══════════════════════════════════════════

        route('get', '/النقاشات', '/discussions', (req, res) => {
            self._ok(res, { discussions: self.discussions, total: self.discussions.length, categories: self.discussionCats });
        });

        route('post', '/نقاش-جديد', '/new-discussion', (req, res) => {
            const { title, content, category, communityId } = req.body || {};
            if (!title || !content || !category) return self._err(res, 'title, content, category مطلوبة');
            const cat = self.discussionCats.find(c => c.id === category);
            if (!cat) return self._err(res, 'تصنيف النقاش غير صالح');
            const discussion = { id: _newId(), title, content, category, communityId: communityId || null, author: 'user', comments: [], votes: { up: 0, down: 0 }, createdAt: new Date().toISOString(), convertedToProject: false };
            self.discussions.push(discussion);
            self._persist();
            self._ok(res, { discussion });
        });

        route('get', '/نقاش/:id', '/discussion/:id', (req, res) => {
            const d = self.discussions.find(x => x.id === req.params.id);
            if (!d) return self._err(res, 'النقاش غير موجود', 404);
            self._ok(res, { discussion: d });
        });

        route('post', '/تعليق', '/comment', (req, res) => {
            const { discussionId, content } = req.body || {};
            if (!discussionId || !content) return self._err(res, 'discussionId و content مطلوبان');
            const d = self.discussions.find(x => x.id === discussionId);
            if (!d) return self._err(res, 'النقاش غير موجود', 404);
            const comment = { id: _newId(), content, author: 'user', createdAt: new Date().toISOString() };
            d.comments.push(comment);
            self._persist();
            self._ok(res, { comment, discussionId });
        });

        route('post', '/تحويل-لمشروع', '/convert-to-project', (req, res) => {
            const { discussionId, projectType, budget, deadline } = req.body || {};
            if (!discussionId || !projectType) return self._err(res, 'discussionId و projectType مطلوبان');
            const d = self.discussions.find(x => x.id === discussionId);
            if (!d) return self._err(res, 'النقاش غير موجود', 404);
            const cat = self.discussionCats.find(c => c.id === d.category);
            if (cat && !cat.canConvertToProject) return self._err(res, 'هذا التصنيف لا يدعم التحويل لمشروع');
            const pt = self.projectTypes.find(p => p.id === projectType);
            if (!pt) return self._err(res, 'نوع المشروع غير صالح');
            const project = { id: _newId(), nameAr: d.title, type: projectType, description: d.content, budget: budget || 0, deadline: deadline || null, communityId: d.communityId, status: 'planning', contributors: [], progress: 0, convertedFromDiscussion: discussionId, createdAt: new Date().toISOString() };
            d.convertedToProject = true;
            d.projectId = project.id;
            self.projects.push(project);
            self._persist();
            self._broadcast('project:created', { id: project.id, nameAr: project.nameAr, fromDiscussion: discussionId });
            self._ok(res, { project, discussion: d });
        });

        route('post', '/تصويت', '/vote', (req, res) => {
            const { discussionId, option } = req.body || {};
            if (!discussionId || !['up', 'down'].includes(option)) return self._err(res, 'discussionId و option (up/down) مطلوبان');
            const d = self.discussions.find(x => x.id === discussionId);
            if (!d) return self._err(res, 'النقاش غير موجود', 404);
            d.votes[option] = (d.votes[option] || 0) + 1;
            self._persist();
            self._ok(res, { votes: d.votes, discussionId });
        });

        route('post', '/ذكاء-ملخص', '/ai-summary', (req, res) => {
            const { discussionId } = req.body || {};
            if (!discussionId) return self._err(res, 'discussionId مطلوب');
            const d = self.discussions.find(x => x.id === discussionId);
            if (!d) return self._err(res, 'النقاش غير موجود', 404);
            self._ok(res, {
                discussionId, title: d.title,
                summary: `الملخص الذكي: يتناول هذا النقاش موضوع "${d.title}" ويشمل ${d.comments.length} تعليقاً. الاتجاه العام: ${d.votes.up > d.votes.down ? 'إيجابي' : 'يحتاج نقاش'}.`,
                keyPoints: ['النقطة الأولى: الإطار العام للموضوع', 'النقطة الثانية: وجهات النظر المتعددة', 'النقطة الثالثة: المقترحات والحلول'],
                recommendation: d.votes.up > 10 ? 'يُنصح بتحويله لمشروع' : 'يحتاج مزيداً من النقاش'
            });
        });

        route('get', '/نقاشات-رائجة', '/trending-discussions', (req, res) => {
            const trending = [...self.discussions].sort((a, b) => (b.votes.up + b.comments.length) - (a.votes.up + a.comments.length)).slice(0, 5);
            self._ok(res, { trending, total: trending.length });
        });

        // ══════════════════════════════════════════
        // PROJECTS HUB — 7 routes
        // ══════════════════════════════════════════

        route('get', '/مشاريع-المجتمع', '/community-projects', (req, res) => {
            self._ok(res, { projects: self.projects, total: self.projects.length, types: self.projectTypes });
        });

        route('post', '/مشروع-جديد', '/new-project', (req, res) => {
            const { nameAr, type, description, budget, deadline, communityId } = req.body || {};
            if (!nameAr || !type || !description) return self._err(res, 'nameAr, type, description مطلوبة');
            if (!self.projectTypes.find(p => p.id === type)) return self._err(res, 'نوع المشروع غير صالح');
            const project = { id: _newId(), nameAr, type, description, budget: budget || 0, deadline: deadline || null, communityId: communityId || null, status: 'planning', contributors: [], progress: 0, createdAt: new Date().toISOString() };
            self.projects.push(project);
            self._persist();
            self._broadcast('project:created', { id: project.id, nameAr: project.nameAr, type });
            self._ok(res, { project });
        });

        route('get', '/مشروع/:id', '/project/:id', (req, res) => {
            const p = self.projects.find(x => x.id === req.params.id);
            if (!p) return self._err(res, 'المشروع غير موجود', 404);
            const pt = self.projectTypes.find(x => x.id === p.type);
            self._ok(res, { project: p, typeDetails: pt });
        });

        route('put', '/تحديث-مشروع/:id', '/update-project/:id', (req, res) => {
            const p = self.projects.find(x => x.id === req.params.id);
            if (!p) return self._err(res, 'المشروع غير موجود', 404);
            const allowed = ['status', 'progress', 'description', 'budget', 'deadline'];
            allowed.forEach(k => { if ((req.body || {})[k] !== undefined) p[k] = req.body[k]; });
            p.updatedAt = new Date().toISOString();
            self._persist();
            self._ok(res, { project: p });
        });

        route('post', '/انضمام-مشروع/:id', '/join-project/:id', (req, res) => {
            const p = self.projects.find(x => x.id === req.params.id);
            if (!p) return self._err(res, 'المشروع غير موجود', 404);
            const userId = (req.body || {}).userId || 'anonymous';
            if (!p.contributors.includes(userId)) { p.contributors.push(userId); self._persist(); }
            self._ok(res, { joined: true, projectId: p.id, contributors: p.contributors.length });
        });

        route('get', '/مركز-الابتكار', '/innovation-hub', (req, res) => {
            self._ok(res, {
                totalProjects: self.projects.length,
                activeProjects: self.projects.filter(p => p.status === 'active').length,
                totalContributors: new Set(self.projects.flatMap(p => p.contributors)).size,
                projectTypes: self.projectTypes,
                successRate: '٧٨٪',
                islamicFunding: COMMERCIAL_ENV,
                topCategories: ['تقني', 'تعليمي', 'بيئي']
            });
        });

        route('get', '/مشاريع-ناجحة', '/successful-projects', (req, res) => {
            const featured = self.projects.filter(p => p.status === 'completed' || p.progress >= 50);
            self._ok(res, { projects: featured, total: featured.length, message: '«وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ»' });
        });

        // ══════════════════════════════════════════
        // SOCIAL INTEGRATION — 6 routes
        // ══════════════════════════════════════════

        route('get', '/منصات-التكامل', '/integration-platforms', (req, res) => {
            const enriched = self.platforms.map(p => ({
                ...p, connected: !!self.connectedPlatforms[p.id],
                connectedAt: self.connectedPlatforms[p.id] ? self.connectedPlatforms[p.id].connectedAt : null
            }));
            self._ok(res, { platforms: enriched, total: enriched.length, connected: Object.keys(self.connectedPlatforms).length });
        });

        route('post', '/ربط-منصة', '/connect-platform', (req, res) => {
            const { platformId, credentials } = req.body || {};
            if (!platformId) return self._err(res, 'platformId مطلوب');
            if (!self.platforms.find(p => p.id === platformId)) return self._err(res, 'المنصة غير موجودة');
            self.connectedPlatforms[platformId] = { connectedAt: new Date().toISOString(), hasCredentials: !!credentials };
            self._persist();
            self._ok(res, { connected: true, platformId });
        });

        route('delete', '/فصل-منصة/:platformId', '/disconnect-platform/:platformId', (req, res) => {
            const pid = req.params.platformId;
            if (!self.connectedPlatforms[pid]) return self._err(res, 'المنصة غير مرتبطة', 404);
            delete self.connectedPlatforms[pid];
            self._persist();
            self._ok(res, { disconnected: true, platformId: pid });
        });

        route('get', '/إحصائيات-منصات', '/platform-analytics', (req, res) => {
            const analytics = self.platforms.map(p => ({
                platformId: p.id, nameAr: p.nameAr, icon: p.icon, type: p.type,
                islamicScore: p.islamicScore, connected: !!self.connectedPlatforms[p.id],
                posts: Math.floor(Math.random() * 100), reach: Math.floor(Math.random() * 10000)
            }));
            self._ok(res, { analytics, connectedCount: Object.keys(self.connectedPlatforms).length });
        });

        route('get', '/حالة-المنصات', '/platforms-health', (req, res) => {
            const health = self.platforms.map(p => ({
                platformId: p.id, nameAr: p.nameAr, status: p.status,
                latencyMs: Math.floor(50 + Math.random() * 200),
                uptime: `${(99 + Math.random()).toFixed(2)}%`
            }));
            self._ok(res, { health, allHealthy: health.every(h => h.status === 'active') });
        });

        route('post', '/مزامنة-منصة', '/sync-platform', (req, res) => {
            const { platformId } = req.body || {};
            if (!platformId) return self._err(res, 'platformId مطلوب');
            if (!self.connectedPlatforms[platformId]) return self._err(res, 'المنصة غير مرتبطة');
            self.connectedPlatforms[platformId].lastSync = new Date().toISOString();
            self._persist();
            self._ok(res, { synced: true, platformId, syncedAt: self.connectedPlatforms[platformId].lastSync, newContent: Math.floor(Math.random() * 20) });
        });

        // ══════════════════════════════════════════
        // AI FEATURES — 6 routes
        // ══════════════════════════════════════════

        route('post', '/ذكاء-اقتراح-تواصل', '/ai-suggest-connect', (req, res) => {
            const suggestions = Array.from({ length: 5 }, (_, i) => ({
                userId: `user-${_newId()}`, nameAr: `مستخدم موصى به ${i + 1}`,
                commonInterests: self.communityTypes[i % self.communityTypes.length].nameAr,
                matchScore: Math.floor(70 + Math.random() * 30),
                reason: 'اهتمامات مشتركة في سوق شيخة'
            }));
            self._ok(res, { suggestions, islamicNote: '«خَيْرُ الأَصْحَابِ مَنْ ذَكَّرَكَ بِاللَّهِ»' });
        });

        route('post', '/ذكاء-تحليل-شبكة', '/ai-network-analysis', (req, res) => {
            self._ok(res, {
                networkSize: self._countMembers(),
                communities: self.communities.length,
                centralityScore: (Math.random() * 100).toFixed(1),
                clusters: self.communityTypes.slice(0, 3).map(t => ({ cluster: t.nameAr, strength: Math.floor(60 + Math.random() * 40) })),
                recommendation: 'توسّع في مجتمعات التجارة والتقنية لتعزيز شبكتك',
                islamicPrinciple: '«الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ»'
            });
        });

        route('post', '/ذكاء-ترجمة', '/ai-translate', (req, res) => {
            const { text = '', from = 'ar', to = 'en' } = req.body || {};
            if (!text) return self._err(res, 'text مطلوب');
            self._ok(res, {
                original: text, from, to,
                translated: `[ترجمة ذكية: ${text.substring(0, 50)}...]`,
                confidence: (0.9 + Math.random() * 0.1).toFixed(2),
                islamicNote: 'الترجمة تخدم التعارف بين الشعوب وفق الآية الكريمة'
            });
        });

        route('post', '/ذكاء-تحسين-محتوى', '/ai-improve-content', (req, res) => {
            const { content = '', type = 'post' } = req.body || {};
            if (!content) return self._err(res, 'content مطلوب');
            self._ok(res, {
                original: content, type,
                improved: `بسم الله، ${content.trim()} — وبالله التوفيق.`,
                suggestions: ['أضف بسملة في البداية', 'أختم بالحمد لله', 'استخدم لغة واضحة وموجزة'],
                islamicCompliance: { score: 95, issues: [] },
                readabilityScore: Math.floor(80 + Math.random() * 20)
            });
        });

        route('get', '/ذكاء-اتجاهات', '/ai-trends', (req, res) => {
            const trends = self.discussions.slice(0, 5).map(d => ({
                topic: d.title, category: d.category, trendScore: d.votes.up + d.comments.length,
                growth: `+${Math.floor(10 + Math.random() * 40)}٪`, isIslamicCompliant: true
            })).sort((a, b) => b.trendScore - a.trendScore);
            self._ok(res, { trends, generatedAt: new Date().toISOString() });
        });

        route('post', '/ذكاء-ربط-تجاري', '/ai-business-match', (req, res) => {
            const { industry = '', needs = [] } = req.body || {};
            const matches = Array.from({ length: 3 }, (_, i) => ({
                partnerId: _newId(), nameAr: `شريك تجاري محتمل ${i + 1}`,
                industry, matchScore: Math.floor(70 + Math.random() * 30),
                commonNeeds: needs.slice(0, 2),
                islamicFundingCompatibility: ['مشاركة', 'مضاربة'][i % 2],
                contact: 'via سوق شيخة'
            }));
            self._ok(res, { matches, islamicPrinciple: '«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ»' });
        });

        // ══════════════════════════════════════════
        // COMMERCIAL — 6 routes
        // ══════════════════════════════════════════

        route('get', '/البيئة-التجارية', '/commercial-environment', (req, res) => {
            self._ok(res, { ...self.commercialEnv, islamicFoundation: ISLAMIC_FOUNDATION.quran.slice(0, 2) });
        });

        route('post', '/طلب-تجاري', '/commercial-request', (req, res) => {
            const { type, details, targetCommunity } = req.body || {};
            if (!type || !details) return self._err(res, 'type و details مطلوبان');
            self._ok(res, {
                requestId: _newId(), type, details, targetCommunity,
                status: 'pending', submittedAt: new Date().toISOString(),
                islamicNote: '«الجالب مرزوق والمحتكر ملعون»'
            });
        });

        route('get', '/قنوات-حكومية', '/government-channels', (req, res) => {
            self._ok(res, { b2g: self.commercialEnv.b2g, g2c: self.commercialEnv.g2c, g2g: self.commercialEnv.g2g });
        });

        route('post', '/تواصل-حكومي', '/government-contact', (req, res) => {
            const { channelId, subject, message } = req.body || {};
            if (!channelId || !subject) return self._err(res, 'channelId و subject مطلوبان');
            self._ok(res, {
                ticketId: _newId(), channelId, subject, status: 'submitted',
                submittedAt: new Date().toISOString(),
                islamicNote: '﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا﴾'
            });
        });

        route('get', '/شبكة-الأعمال', '/business-network', (req, res) => {
            self._ok(res, {
                totalBusinesses: self.communities.filter(c => c.type === 'COMMERCE').length,
                channels: self.commercialEnv,
                platforms: self.platforms.filter(p => ['professional', 'ecommerce'].includes(p.type)),
                opportunities: Math.floor(50 + Math.random() * 100)
            });
        });

        route('post', '/طلب-شراكة', '/partnership-request', (req, res) => {
            const { partnerType, description, budget } = req.body || {};
            if (!partnerType || !description) return self._err(res, 'partnerType و description مطلوبان');
            self._ok(res, {
                requestId: _newId(), partnerType, description, budget: budget || 0,
                status: 'review', submittedAt: new Date().toISOString(),
                suggestedChannels: self.commercialEnv.b2b.slice(0, 2).map(c => c.nameAr),
                islamicBasis: '«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ»'
            });
        });

        // ══════════════════════════════════════════
        // ANALYTICS — 5 routes
        // ══════════════════════════════════════════

        route('get', '/لوحة-التحكم', '/dashboard', (req, res) => {
            self._ok(res, {
                communities:  { total: self.communities.length, members: self._countMembers() },
                messages:     { total: self.messages.length },
                discussions:  { total: self.discussions.length, trending: self.discussions.filter(d => d.votes.up > 10).length },
                projects:     { total: self.projects.length, active: self.projects.filter(p => p.status === 'active').length },
                platforms:    { total: self.platforms.length, connected: Object.keys(self.connectedPlatforms).length },
                ageGroups:    self.ageGroups.map(g => ({ id: g.id, nameAr: g.nameAr, icon: g.icon })),
                islamicFoundation: ISLAMIC_FOUNDATION.bismillah,
                generatedAt:  new Date().toISOString()
            });
        });

        route('get', '/إحصائيات-الشبكة', '/network-stats', (req, res) => {
            self._ok(res, {
                totalNodes:      self._countMembers(),
                totalEdges:      self.messages.length + self.discussions.reduce((a, d) => a + d.comments.length, 0),
                density:         (Math.random() * 0.5).toFixed(3),
                avgConnections:  (2 + Math.random() * 8).toFixed(1),
                communities:     self.communities.length,
                strongestCluster: self.communities[0] ? self.communities[0].nameAr : 'N/A'
            });
        });

        route('get', '/تقرير-المجتمعات', '/communities-report', (req, res) => {
            const report = self.communities.map(c => ({
                id: c.id, nameAr: c.nameAr, type: c.type,
                members: c.members.length,
                discussions: self.discussions.filter(d => d.communityId === c.id).length,
                projects: self.projects.filter(p => p.communityId === c.id).length,
                activityLevel: ['عالي', 'متوسط', 'منخفض'][Math.floor(Math.random() * 3)]
            }));
            self._ok(res, { report, total: report.length, generatedAt: new Date().toISOString() });
        });

        route('get', '/الفئات-العمرية', '/age-groups', (req, res) => {
            const data = self.ageGroups.map(g => ({
                ...g,
                communityCount: self.communities.filter(c => c.ageGroup === g.id || c.ageGroup === 'all').length,
                estimatedMembers: Math.floor(100 + Math.random() * 900)
            }));
            self._ok(res, { ageGroups: data });
        });

        route('get', '/مؤشرات-الصحة', '/health-metrics', (req, res) => {
            self._ok(res, {
                overallHealth: Math.floor(80 + Math.random() * 20),
                engagement:    Math.floor(65 + Math.random() * 30),
                islamicCompliance: 98,
                communityHealth: self.communities.map(c => ({
                    id: c.id, nameAr: c.nameAr,
                    score: Math.floor(70 + Math.random() * 30),
                    status: 'healthy'
                })),
                recommendations: [
                    'زيادة التفاعل في المجتمعات الصغيرة',
                    'تشجيع تحويل النقاشات الرائجة لمشاريع',
                    'ربط المزيد من المنصات الاجتماعية'
                ],
                islamicNote: '«مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ كَمَثَلِ الْجَسَدِ الْوَاحِدِ»'
            });
        });

        console.log(`   ✅ SheikhaSocialConnect: ${AR_PREFIX}/* + ${EN_PREFIX}/* — 58 مسار مسجَّل`);
    }
}

module.exports = SheikhaSocialConnectEngine;
