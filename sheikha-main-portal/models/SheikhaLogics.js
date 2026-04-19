/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 نموذج المنطق السباعي — منظومة شيخة
 *  SheikhaLogics — Seven Integrated Logic Systems
 *
 *  المنطق السباعي يُفعَّل في ثلاثة نطاقات:
 *    1. شيخة          (platform)     — المنصة الجامعة
 *    2. منظمة شيخة    (organization) — الهيكل المؤسسي
 *    3. سوق شيخة      (market)       — البيئة التجارية
 *
 *  المنطق السباعي:
 *    1. المنطق التنظيمي     (organizational)  — الهيكل والتسلسل والصلاحيات
 *    2. المنطق التشريعي     (legislative)     — التشريع والشريعة والأنظمة
 *    3. المنطق التجاري      (commercial)      — التجارة والعقود والأسواق
 *    4. المنطق العلمي       (scientific)      — المعرفة والمناهج والمعايير
 *    5. المنطق البحثي       (research)        — البحث والتطوير والابتكار
 *    6. المنطق التقني       (technical)       — الهندسة والأنظمة والمعايير
 *    7. المنطق التكنولوجي   (technological)   — الرقمنة والذكاء والأتمتة
 *
 *  القاعدة الحاكمة: الكتاب والسنة — كل منطق يخضع لمراجعة الميثاق الشرعي
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const { v4: uuid } = require('uuid');
const database = require('../config/database');

// ═══════════════════════════════════════════════════════════════════════════════
// 🏷️ الأنواع والثوابت
// ═══════════════════════════════════════════════════════════════════════════════

const LOGIC_TYPES = {
    ORGANIZATIONAL:  'organizational',
    LEGISLATIVE:     'legislative',
    COMMERCIAL:      'commercial',
    SCIENTIFIC:      'scientific',
    RESEARCH:        'research',
    TECHNICAL:       'technical',
    TECHNOLOGICAL:   'technological'
};

const SCOPE_TYPES = {
    PLATFORM:     'platform',     // شيخة (المنصة)
    ORGANIZATION: 'organization', // منظمة شيخة
    MARKET:       'market'        // سوق شيخة
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 تعريف المنطق السباعي الكامل
// ═══════════════════════════════════════════════════════════════════════════════

const SEVEN_LOGICS = [

    // ─── 1. المنطق التنظيمي ──────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.ORGANIZATIONAL,
        nameAr:  'المنطق التنظيمي',
        nameEn:  'Organizational Logic',
        icon:    '🏛️',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم الهيكل المؤسسي والتسلسل الإداري والصلاحيات والعضوية في منظومة شيخة',

        principles: [
            { id: 'hierarchy',    nameAr: 'التسلسل الهرمي',       rule: 'منظمة شيخة الأم → المنظمات المتخصصة → الأسواق' },
            { id: 'delegation',   nameAr: 'تفويض الصلاحيات',       rule: 'كل مستوى يُفوّض ما يلزم ولا يزيد — وفق الشورى' },
            { id: 'accountability', nameAr: 'المسؤولية والمحاسبة',  rule: 'كل صاحب منصب مسؤول أمام الله ثم الميثاق' },
            { id: 'membership',   nameAr: 'شروط العضوية',           rule: 'قبول الميثاق الشرعي إلزامي قبل أي تسجيل' },
            { id: 'shura',        nameAr: 'الشورى في القرار',        rule: 'القرارات الكبرى تُتّخذ بالشورى — آل عمران: 159' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق التنظيمي في منصة شيخة',
                rules: [
                    'تُعرَّف شيخة كمنظمة جذر (root) واحدة لا تتعدد',
                    'تتبعها منظمات متخصصة وفق أنواع ORG_TYPES',
                    'كل كيان يُسجَّل في الشجرة الهرمية /api/organizations/tree',
                    'لا كيان يعمل خارج السلطة الشرعية للمنظمة الأم'
                ],
                apis: ['GET /api/organizations/tree', 'GET /api/organizations', 'POST /api/organizations']
            },
            organization: {
                nameAr: 'المنطق التنظيمي في منظمة شيخة',
                rules: [
                    'كل منظمة تُقبَل بعد قبول الميثاق الشرعي صراحةً',
                    'الهيكل: مجلس إدارة → مدير تنفيذي → أقسام → موظفون',
                    'تعيين الأدوار يتبع مبدأ الكفاءة والأمانة',
                    'قرارات التوسع تمر بمرحلة الشورى والموافقة'
                ],
                apis: ['POST /api/organizations/:id/accept-charter', 'PUT /api/organizations/:id/verify']
            },
            market: {
                nameAr: 'المنطق التنظيمي في سوق شيخة',
                rules: [
                    'كل سوق يتبع منظمة مُفعَّلة ومقبولة الميثاق',
                    'يُعيَّن محتسب (سوق مراقب) في كل سوق',
                    'قوائم البائعين والمشترين تخضع للتحقق الدوري',
                    'الأسواق المعطّلة تُجمَّد لا تُحذف — لضمان الأثر'
                ],
                apis: ['GET /api/markets-of-markets', 'POST /api/organizations/:id/markets']
            }
        },

        shariaRef: {
            primary: 'وَشَاوِرْهُمْ فِي الْأَمْرِ — آل عمران: 159',
            secondary: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا — النساء: 58'
        }
    },

    // ─── 2. المنطق التشريعي ──────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.LEGISLATIVE,
        nameAr:  'المنطق التشريعي',
        nameEn:  'Legislative Logic',
        icon:    '⚖️',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم التشريع والأنظمة واللوائح والامتثال الشرعي وقرارات الحوكمة في منظومة شيخة',

        principles: [
            { id: 'quran-first',   nameAr: 'القرآن أولاً',         rule: 'كل نظام يُعرَض على كتاب الله أولاً' },
            { id: 'sunnah-second', nameAr: 'السنة ثانياً',          rule: 'ما ثبت عن النبي ﷺ حاكم على ما سواه' },
            { id: 'khulafa',       nameAr: 'سنة الخلفاء الراشدين', rule: 'نهج الخلفاء الأربعة مرجع إداري وتشريعي' },
            { id: 'ijmaa',         nameAr: 'الإجماع',               rule: 'إجماع العلماء حجة معتبرة' },
            { id: 'qiyas',         nameAr: 'القياس',                rule: 'إلحاق المسائل المستحدثة بأصولها الشرعية' },
            { id: 'maslaha',       nameAr: 'المصلحة المرسلة',       rule: 'ما فيه مصلحة عامة دون نص مخالف — جائز' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق التشريعي في منصة شيخة',
                rules: [
                    'الميثاق الشرعي حاكم على جميع مكونات المنصة',
                    'كل API تتحقق من عدم التعارض مع المحظورات الشرعية',
                    'نظام الحوكمة /api/governance يمثّل السلطة التشريعية',
                    'اللوائح التشغيلية تُحدَّث بقرار هيئة الشريعة فقط'
                ],
                apis: ['GET /api/governance/charter', 'GET /api/governance/sources', 'POST /api/governance/validate']
            },
            organization: {
                nameAr: 'المنطق التشريعي في منظمة شيخة',
                rules: [
                    'كل منظمة تُصدر نظامها الداخلي الموافق للميثاق',
                    'قرارات المنظمة تمر بمرحلة التحقق الشرعي /governance/validate',
                    'النزاعات الداخلية تُحكم وفق قواعد الشريعة والشورى',
                    'يُلزَم كل موظف بالامتثال لأخلاقيات المنظمة الشرعية'
                ],
                apis: ['GET /api/governance/ethics', 'GET /api/governance/regulations', 'POST /api/governance/decisions']
            },
            market: {
                nameAr: 'المنطق التشريعي في سوق شيخة',
                rules: [
                    'كل عقد يُفحص بـ /api/governance/validate قبل إتمامه',
                    'المحظورات الستة (ربا/غرر/غش/احتكار/ضرر/محرمات) مُفعَّلة آلياً',
                    'التدقيق الشرعي الدوري لكل سوق /markets-of-markets/:id/sharia-audit',
                    'الحكم النهائي في النزاعات للهيئة الشرعية لشيخة'
                ],
                apis: ['GET /api/markets-of-markets/:id/sharia-audit', 'GET /api/governance/prohibitions']
            }
        },

        shariaRef: {
            primary: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة: 1',
            secondary: 'فَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ — النساء: 59'
        }
    },

    // ─── 3. المنطق التجاري ───────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.COMMERCIAL,
        nameAr:  'المنطق التجاري',
        nameEn:  'Commercial Logic',
        icon:    '🏪',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم التجارة والعقود والأسعار والتبادل والمعاملات المالية في منظومة شيخة',

        principles: [
            { id: 'halal-trade',   nameAr: 'التجارة الحلال',       rule: 'أَحَلَّ اللَّهُ الْبَيْعَ — البقرة: 275' },
            { id: 'transparency',  nameAr: 'الشفافية والوضوح',      rule: 'وصف البضاعة صادق تام لا غموض فيه' },
            { id: 'fair-price',    nameAr: 'السعر العادل',           rule: 'لا احتكار ولا تسعير ظالم — بتوازن السوق' },
            { id: 'contract',      nameAr: 'صحة العقد',              rule: 'العقد واضح الإيجاب والقبول والثمن والمثمن' },
            { id: 'trust',         nameAr: 'الأمانة التجارية',       rule: 'التاجر الصدوق الأمين مع النبيين والشهداء' },
            { id: 'competition',   nameAr: 'المنافسة المشروعة',      rule: 'التنافس بالجودة والخدمة لا بالضرر' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق التجاري في منصة شيخة',
                rules: [
                    'شيخة منصة وسيطة — لا تشتري ولا تبيع لنفسها',
                    'العمولات والرسوم محددة ومعلنة وخالية من الربا',
                    'نظام التصنيف (rating) مبني على الأمانة والجودة الموثّقة',
                    'سوق الأسواق /api/markets-of-markets يُوحِّد جميع الأسواق'
                ],
                apis: ['GET /api/markets-of-markets', 'GET /api/markets-of-markets/search']
            },
            organization: {
                nameAr: 'المنطق التجاري في منظمة شيخة',
                rules: [
                    'كل منظمة تُحدد نموذج عملها الحلال بوضوح',
                    'الإيرادات تُصنَّف: تجارة حلال / خدمات / استثمار حلال',
                    'توزيع الأرباح وفق عقود الشركة الشرعية (مضاربة/مشاركة)',
                    'الالتزامات المالية تُسجَّل وتُؤدَّى في مواعيدها'
                ],
                apis: ['GET /api/organizations/:id', 'GET /api/organizations/:id/markets']
            },
            market: {
                nameAr: 'المنطق التجاري في سوق شيخة',
                rules: [
                    'كل سوق يُحدد قطاعه (metals/agriculture/tech/services/science)',
                    'قوائم المنتجات تخضع للتدقيق الشرعي قبل النشر',
                    'نظام العروض والطلبات يعمل بمبدأ التراضي',
                    'الدفع الفوري أفضل — والمؤجل بعقد واضح مكتوب'
                ],
                apis: ['POST /api/organizations/:id/markets', 'GET /api/markets-of-markets/:id/sharia-audit']
            }
        },

        shariaRef: {
            primary: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة: 275',
            secondary: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء — رواه الترمذي'
        }
    },

    // ─── 4. المنطق العلمي ────────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.SCIENTIFIC,
        nameAr:  'المنطق العلمي',
        nameEn:  'Scientific Logic',
        icon:    '🔬',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم المعرفة والمناهج العلمية والمعايير الأكاديمية ونشر العلم في منظومة شيخة',

        principles: [
            { id: 'talab-ilm',   nameAr: 'طلب العلم فريضة',        rule: 'طلب العلم فريضة على كل مسلم — ابن ماجه' },
            { id: 'objectivity', nameAr: 'الموضوعية العلمية',        rule: 'الحكم على الحقائق بالدليل والمنطق السليم' },
            { id: 'citation',    nameAr: 'الاستشهاد والتوثيق',       rule: 'كل معلومة تُنسب لمصدرها — نهياً عن الكذب' },
            { id: 'peer-review', nameAr: 'المراجعة العلمية',         rule: 'التحقق من الأبحاث قبل تعميمها' },
            { id: 'integration', nameAr: 'تكامل العلم والإيمان',     rule: 'العلم لا يتعارض مع الإيمان الصحيح' },
            { id: 'benefit',     nameAr: 'نفع العلم للمجتمع',        rule: 'خير العلم ما نَفَع — فيما فيه مصلحة' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق العلمي في منصة شيخة',
                rules: [
                    'شيخة تُنشئ قاعدة معرفة إسلامية-تجارية-علمية موثّقة',
                    'كل معيار تقني في المنصة يستند لمنهج علمي واضح',
                    'يُتاح الوصول للبيانات العلمية المجمّعة للباحثين',
                    'نتائج الذكاء الاصطناعي تُشرح وتُوثَّق علمياً'
                ],
                apis: ['GET /api/arabic/nlp', 'GET /api/ai/analyze']
            },
            organization: {
                nameAr: 'المنطق العلمي في منظمة شيخة',
                rules: [
                    'منظمة علوم شيخة تُشرف على المعايير العلمية',
                    'الكوادر البشرية تخضع للتدريب والتأهيل المستمر',
                    'تُصدر شيخة تقارير علمية دورية عن أسواقها ومنظماتها',
                    'الشراكات مع الجامعات ومراكز الأبحاث مُفعَّلة'
                ],
                apis: ['GET /api/academic/universities', 'GET /api/academic/research-centers']
            },
            market: {
                nameAr: 'المنطق العلمي في سوق شيخة',
                rules: [
                    'تحليل السوق يستند لبيانات إحصائية موثّقة',
                    'توقعات الأسعار تُبنى على نماذج رياضية وتاريخية',
                    'جودة المنتجات تُقاس بمعايير علمية معتمدة',
                    'تقارير السوق تُنشر للمشتركين مع الاستشهاد بالمصادر'
                ],
                apis: ['GET /api/markets-of-markets/stats/overview']
            }
        },

        shariaRef: {
            primary: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ — العلق: 1',
            secondary: 'طلب العلم فريضة على كل مسلم — رواه ابن ماجه'
        }
    },

    // ─── 5. المنطق البحثي ────────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.RESEARCH,
        nameAr:  'المنطق البحثي',
        nameEn:  'Research Logic',
        icon:    '📚',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم البحث العلمي والتطوير والابتكار وإنتاج المعرفة الجديدة في منظومة شيخة',

        principles: [
            { id: 'innovation',   nameAr: 'الابتكار المسؤول',        rule: 'الجديد مقبول ما لم يُعارض الأصول الشرعية' },
            { id: 'methodology',  nameAr: 'المنهجية البحثية',         rule: 'المشكلة → الفرضية → التجربة → النتيجة' },
            { id: 'ethics',       nameAr: 'أخلاقيات البحث',           rule: 'لا ضرر في البحث على الإنسان أو المجتمع' },
            { id: 'openness',     nameAr: 'الانفتاح العلمي',           rule: 'مشاركة المعرفة الحلال مع الجميع' },
            { id: 'continuity',   nameAr: 'الاستمرارية البحثية',       rule: 'البحث رحلة لا تنتهي — التحسين المستمر' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق البحثي في منصة شيخة',
                rules: [
                    'شيخة تُنشئ وحدة بحث وتطوير (R&D) مدمجة',
                    'بيانات السوق والمعاملات تُحلَّل بحثياً لتحسين المنصة',
                    'تُدار مشاريع بحثية مشتركة مع شركاء أكاديميين',
                    'نتائج البحث تُترجَم لمميزات جديدة في المنصة'
                ],
                apis: ['GET /api/academic/methodologies', 'GET /api/academic/research-centers']
            },
            organization: {
                nameAr: 'المنطق البحثي في منظمة شيخة',
                rules: [
                    'كل منظمة تُخصص جزءاً من ميزانيتها للبحث والتطوير',
                    'أولويات البحث تتوافق مع احتياجات السوق والأمة',
                    'البحوث تُنشر وفق معايير الملكية الفكرية لشيخة',
                    'التعاون البحثي بين المنظمات مُشجَّع وميسَّر'
                ],
                apis: ['GET /api/ip', 'GET /api/academic/universities']
            },
            market: {
                nameAr: 'المنطق البحثي في سوق شيخة',
                rules: [
                    'دراسات السوق تُجرى قبل إطلاق أي سوق جديد',
                    'تحليل السلوك الشرائي يُستخدم لتطوير التجربة',
                    'أبحاث الجودة والمعايير تُطبَّق على المنتجات المسجَّلة',
                    'تقارير بحثية دورية عن كل قطاع سوقي'
                ],
                apis: ['GET /api/markets-of-markets/stats/overview', 'GET /api/market/sectors']
            }
        },

        shariaRef: {
            primary: 'وَقُل رَّبِّ زِدْنِي عِلْمًا — طه: 114',
            secondary: 'من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة — رواه مسلم'
        }
    },

    // ─── 6. المنطق التقني ────────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.TECHNICAL,
        nameAr:  'المنطق التقني',
        nameEn:  'Technical Logic',
        icon:    '⚙️',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم المعايير الهندسية والبنية التحتية التقنية وضمان الجودة في منظومة شيخة',

        principles: [
            { id: 'itqan',        nameAr: 'الإتقان',                 rule: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه' },
            { id: 'standards',    nameAr: 'المعايير التقنية',         rule: 'كل نظام يتبع معايير موثّقة ومُختبَرة' },
            { id: 'security',     nameAr: 'الأمان والحماية',          rule: 'حماية البيانات والأنظمة واجب شرعي وتقني' },
            { id: 'reliability',  nameAr: 'الموثوقية',                rule: 'الأنظمة تعمل بثبات 99.9% — لا ضرر للمستخدم' },
            { id: 'scalability',  nameAr: 'قابلية التوسع',            rule: 'البنية التحتية تنمو مع نمو الأمة' },
            { id: 'maintenance',  nameAr: 'الصيانة المستمرة',         rule: 'المراقبة الدورية وإصلاح الأعطال فوراً' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق التقني في منصة شيخة',
                rules: [
                    'البنية التقنية: Node.js + Express + قاعدة بيانات موزّعة',
                    'كل endpoint موثَّق وآمن ومُختبَر قبل الإنتاج',
                    'نظام المراقبة اللحظية والتنبيه الفوري مُفعَّل',
                    'النسخ الاحتياطية يومية — لا ضياع لبيانات المستخدمين'
                ],
                apis: ['GET /api/health', 'GET /api/governance/architecture']
            },
            organization: {
                nameAr: 'المنطق التقني في منظمة شيخة',
                rules: [
                    'كل منظمة تعمل عبر API موثّقة تتبع معايير REST',
                    'التكامل بين المنظمات يسير عبر بروتوكول موحّد',
                    'دليل المطورين /api متاح للمنظمات المُفعَّلة',
                    'اختبارات الاندماج التقني إلزامية قبل التفعيل'
                ],
                apis: ['GET /api/governance/architecture', 'GET /api/governance/networks']
            },
            market: {
                nameAr: 'المنطق التقني في سوق شيخة',
                rules: [
                    'كل سوق يمتلك نقطة وصول API مستقلة وموثّقة',
                    'معالجة الطلبات في أقل من 200ms — لا ضرر بالتجار',
                    'تشفير البيانات الحسّاسة (AES-256 / TLS 1.3)',
                    'اختبار الحمل قبل إطلاق أي سوق جديد'
                ],
                apis: ['GET /api/markets-of-markets', 'GET /api/health']
            }
        },

        shariaRef: {
            primary: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — رواه البيهقي',
            secondary: 'لا ضرر ولا ضرار — رواه ابن ماجه'
        }
    },

    // ─── 7. المنطق التكنولوجي ────────────────────────────────────────────────
    {
        id:      LOGIC_TYPES.TECHNOLOGICAL,
        nameAr:  'المنطق التكنولوجي',
        nameEn:  'Technological Logic',
        icon:    '🤖',
        version: '1.0.0',
        status:  'active',
        description: 'يحكم الرقمنة والذكاء الاصطناعي والأتمتة والتقنيات المتقدمة في منظومة شيخة',

        principles: [
            { id: 'ai-ethics',    nameAr: 'أخلاقيات الذكاء الاصطناعي', rule: 'الذكاء الاصطناعي أداة — والإنسان هو المسؤول أمام الله' },
            { id: 'automation',   nameAr: 'الأتمتة المسؤولة',           rule: 'أتمتة المتكرر — وإبقاء القرارات الكبرى للإنسان' },
            { id: 'data-privacy', nameAr: 'خصوصية البيانات',            rule: 'حماية بيانات المستخدم فريضة — لا بيع ولا مشاركة بلا إذن' },
            { id: 'halal-ai',     nameAr: 'الذكاء الاصطناعي الحلال',    rule: 'مخرجات الذكاء الاصطناعي تُفلتَر لإزالة المحرمات آلياً' },
            { id: 'innovation',   nameAr: 'التطوير التكنولوجي المستمر', rule: 'التكنولوجيا في خدمة الأمة — لا العكس' },
            { id: 'digital-trust', nameAr: 'الثقة الرقمية',             rule: 'الشهادة الرقمية والتوثيق الإلكتروني بقوة القانون' }
        ],

        scopes: {
            platform: {
                nameAr: 'المنطق التكنولوجي في منصة شيخة',
                rules: [
                    'الذكاء الاصطناعي يُساعد في الكشف عن الغش والتدليس',
                    'معالجة اللغة العربية الطبيعية مُدمجة في قلب المنصة',
                    'تحليل السوق والتوقعات تُقدَّم بالذكاء الاصطناعي',
                    'نظام التوصيات يعمل وفق الميثاق الشرعي — لا يُوصي بحرام'
                ],
                apis: ['GET /api/ai/analyze', 'GET /api/arabic/nlp', 'POST /api/governance/validate']
            },
            organization: {
                nameAr: 'المنطق التكنولوجي في منظمة شيخة',
                rules: [
                    'التحول الرقمي لكل منظمة يسير وفق خطة موثّقة',
                    'الأتمتة تُطبَّق على العمليات الإدارية المتكررة',
                    'منصة MCP تُمكِّن التكامل الرقمي بين المنظمات',
                    'التدريب على التقنيات الحديثة إلزامي لكل كادر'
                ],
                apis: ['GET /api/organizations/tree', 'GET /api/governance/architecture']
            },
            market: {
                nameAr: 'المنطق التكنولوجي في سوق شيخة',
                rules: [
                    'الأسواق الرقمية والإلكترونية والهجينة مدعومة كاملاً',
                    'نظام الدفع الرقمي يعمل بتقنيات آمنة ومعتمدة',
                    'تتبع سلسلة التوريد رقمياً من المنتج إلى المستهلك',
                    'الفاتورة الإلكترونية وفق معايير الجهات الرسمية'
                ],
                apis: ['GET /api/markets-of-markets', 'GET /api/markets-of-markets/search']
            }
        },

        shariaRef: {
            primary: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ — الأنفال: 60',
            secondary: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — رواه البيهقي'
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 نموذج سجل تفعيل المنطق
// ═══════════════════════════════════════════════════════════════════════════════

class LogicActivationRecord {
    constructor(data = {}) {
        this.id         = data.id         || uuid();
        this.logicId    = data.logicId    || null;
        this.scopeId    = data.scopeId    || null;      // platform | organization | market
        this.entityId   = data.entityId   || null;      // معرّف الكيان (منظمة/سوق)
        this.entityType = data.entityType || null;
        this.status     = data.status     || 'active';  // active | suspended | review
        this.activatedBy = data.activatedBy || null;
        this.notes      = data.notes      || '';
        this.createdAt  = data.createdAt  || new Date().toISOString();
        this.updatedAt  = data.updatedAt  || new Date().toISOString();
    }

    save() {
        this.updatedAt = new Date().toISOString();

        let records = database.read('logicActivations') || [];
        if (!Array.isArray(records)) records = Object.values(records);

        const idx = records.findIndex(r => r.id === this.id);
        if (idx >= 0) {
            records[idx] = this;
        } else {
            records.push(this);
        }

        database.write('logicActivations', records);
        return this;
    }

    static findById(id) {
        let records = database.read('logicActivations') || [];
        if (!Array.isArray(records)) records = Object.values(records);
        const data = records.find(r => r.id === id);
        return data ? new LogicActivationRecord(data) : null;
    }

    static find(query = {}) {
        let records = database.read('logicActivations') || [];
        if (!Array.isArray(records)) records = Object.values(records);

        if (Object.keys(query).length === 0) {
            return records.map(r => new LogicActivationRecord(r));
        }

        return records
            .filter(r => Object.entries(query).every(([k, v]) => r[k] === v))
            .map(r => new LogicActivationRecord(r));
    }

    static create(data) {
        const record = new LogicActivationRecord(data);
        return record.save();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 دوال الاستعلام عن المنطق السباعي
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * الحصول على منطق بمعرّفه
 */
function getLogicById(id) {
    return SEVEN_LOGICS.find(l => l.id === id) || null;
}

/**
 * الحصول على جميع المنطق أو فلترة حسب الحالة
 */
function getAllLogics(status = null) {
    if (!status) return SEVEN_LOGICS;
    return SEVEN_LOGICS.filter(l => l.status === status);
}

/**
 * الحصول على تطبيقات منطق معيّن في نطاق معيّن
 */
function getLogicScope(logicId, scopeId) {
    const logic = getLogicById(logicId);
    if (!logic) return null;
    return logic.scopes[scopeId] || null;
}

/**
 * الحصول على جميع تطبيقات نطاق معيّن عبر المنطق السباعي
 */
function getScopeView(scopeId) {
    if (!Object.values(SCOPE_TYPES).includes(scopeId)) return null;

    return SEVEN_LOGICS.map(logic => ({
        logicId:  logic.id,
        nameAr:   logic.nameAr,
        nameEn:   logic.nameEn,
        icon:     logic.icon,
        status:   logic.status,
        scope:    logic.scopes[scopeId] || null
    }));
}

/**
 * إحصائيات المنطق السباعي
 */
function getLogicsStats() {
    const activations = LogicActivationRecord.find();

    return {
        totalLogics:      SEVEN_LOGICS.length,
        activeLogics:     SEVEN_LOGICS.filter(l => l.status === 'active').length,
        totalScopes:      Object.keys(SCOPE_TYPES).length,
        logicTypes:       Object.values(LOGIC_TYPES),
        scopeTypes:       Object.values(SCOPE_TYPES),
        activationRecords: activations.length,
        byLogic: SEVEN_LOGICS.map(l => ({
            id:      l.id,
            nameAr:  l.nameAr,
            status:  l.status,
            activations: activations.filter(a => a.logicId === l.id).length
        }))
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    SEVEN_LOGICS,
    LOGIC_TYPES,
    SCOPE_TYPES,
    LogicActivationRecord,
    getLogicById,
    getAllLogics,
    getLogicScope,
    getScopeView,
    getLogicsStats
};
