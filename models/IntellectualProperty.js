/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ©️ نموذج الملكية الفكرية الكاملة — سوق شيخة
 *  IntellectualProperty Model — Sheikha Market
 *
 *  جميع الحقوق محفوظة لسوق شيخة ©️ 2025
 *  All Rights Reserved — Sheikha Market
 *
 *  أنواع الملكية الفكرية:
 *    trademark    → العلامة التجارية (شيخة / Sheikha)
 *    copyright    → حقوق التأليف والنشر (الكود، المحتوى، البيانات)
 *    trade-secret → الأسرار التجارية (الخوارزميات، قواعد البيانات، الاستراتيجيات)
 *    patent       → براءات الاختراع (الأنظمة، المحركات، الابتكارات)
 *    domain       → النطاقات والهوية الرقمية
 *    data         → ملكية البيانات (بيانات السوق، التحليلات، النماذج)
 *    design       → حقوق التصميم (الواجهات، الشعارات، الهوية البصرية)
 *    methodology  → ملكية المنهجيات (نماذج العمل، الخوارزميات، البروتوكولات)
 *
 *  المرجعية القانونية:
 *    - نظام الملكية الفكرية السعودي (هيئة الملكية الفكرية)
 *    - اتفاقية تريبس (TRIPS) — منظمة التجارة العالمية
 *    - اتفاقية برن لحقوق المؤلف
 *    - اتفاقية باريس للملكية الصناعية
 *    - مبادئ الأمانة والحفاظ على الحق — الكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const { v4: uuid } = require('uuid');
const database = require('../config/database');

// ═══════════════════════════════════════════════════════════════════════════════
// 📜 ميثاق الملكية الفكرية وسريّتها — النص الجامع
// ═══════════════════════════════════════════════════════════════════════════════

const IP_MASTER_CHARTER = {
    version:    '1.0.0',
    effectiveDate: '2025-01-01',
    owner: {
        nameAr:   'سوق شيخة',
        nameEn:   'Sheikha Market',
        entity:   'Sheikha Market Platform',
        country:  'المملكة العربية السعودية'
    },

    // ─── إعلان الملكية الشامل ─────────────────────────────────────────────────
    ownershipDeclaration: {
        ar: [
            'جميع الحقوق الفكرية والتجارية والرقمية لمنظومة سوق شيخة محفوظة بالكامل.',
            'يشمل ذلك: الكود المصدري، الخوارزميات، قواعد البيانات، النماذج، المحتوى،',
            'التصاميم، العلامات التجارية، النطاقات، الأسرار التجارية، البيانات،',
            'المنهجيات، الابتكارات، البروتوكولات، وكل ما أُنتج أو طُوِّر أو اكتُسب',
            'في سياق منظومة سوق شيخة — دون استثناء.',
            'لا يجوز لأي طرف استخدام أو نسخ أو توزيع أو الكشف عن أي منها',
            'دون إذن كتابي صريح من سوق شيخة.'
        ].join(' '),
        en: [
            'All intellectual, commercial and digital rights of the Sheikha Market',
            'platform are fully reserved. This includes: source code, algorithms,',
            'databases, models, content, designs, trademarks, domains, trade secrets,',
            'data, methodologies, innovations, protocols, and everything produced,',
            'developed or acquired in the context of Sheikha Market — without exception.',
            'No party may use, copy, distribute or disclose any of these',
            'without explicit written permission from Sheikha Market.'
        ].join(' ')
    },

    // ─── فئات الملكية الفكرية ────────────────────────────────────────────────
    categories: [
        {
            id:      'trademark',
            nameAr:  'العلامات التجارية',
            nameEn:  'Trademarks',
            icon:    '™️',
            assets: [
                { asset: 'شيخة / Sheikha',             scope: 'الاسم التجاري الرئيسي' },
                { asset: 'سوق شيخة / Sheikha Market',  scope: 'اسم المنصة' },
                { asset: 'Sheikha Codex',               scope: 'محرك الذكاء الاصطناعي' },
                { asset: 'شعار سوق شيخة (Logo)',        scope: 'الهوية البصرية' },
                { asset: 'Sheikha Neural Engine',        scope: 'محرك التعلم العصبي' }
            ],
            protection: 'نظام العلامات التجارية السعودي + اتفاقية مدريد الدولية',
            prohibited: [
                'استخدام الاسم أو الشعار في أي منتج أو خدمة بدون إذن',
                'إنشاء علامات مشابهة قد تسبب لبساً مع سوق شيخة',
                'ترخيص أو التنازل عن حقوق العلامة لأطراف ثالثة'
            ]
        },
        {
            id:      'copyright',
            nameAr:  'حقوق التأليف والنشر',
            nameEn:  'Copyright',
            icon:    '©️',
            assets: [
                { asset: 'الكود المصدري الكامل (Source Code)',   scope: 'كل ملفات المشروع' },
                { asset: 'المحتوى التسويقي والإعلامي',            scope: 'المقالات، الصور، الفيديوهات' },
                { asset: 'وثائق الميثاق والأنظمة',               scope: 'CHARTER.md وكل الوثائق' },
                { asset: 'واجهات المستخدم (UI/UX)',               scope: 'التصاميم والتجربة' },
                { asset: 'بروتوكولات API والتوثيق',               scope: 'كل مسارات ومواصفات API' }
            ],
            protection: 'اتفاقية برن + نظام حق المؤلف السعودي',
            prohibited: [
                'نسخ أو إعادة نشر الكود أو المحتوى كلياً أو جزئياً',
                'الاشتقاق من الكود دون إذن (Derivative Works)',
                'استخدام التوثيق التقني لبناء منافس'
            ]
        },
        {
            id:      'trade-secret',
            nameAr:  'الأسرار التجارية',
            nameEn:  'Trade Secrets',
            icon:    '🔒',
            assets: [
                { asset: 'خوارزميات التوافق الشرعي (Sharia Matching)',   scope: 'سري للغاية' },
                { asset: 'نماذج تسعير السوق وتحليل البيانات',              scope: 'سري للغاية' },
                { asset: 'استراتيجية التوسع والشراكات',                    scope: 'سري' },
                { asset: 'بيانات المستخدمين والتجار المُجمَّعة',           scope: 'سري للغاية' },
                { asset: 'نماذج الذكاء الاصطناعي المدرَّبة',               scope: 'سري للغاية' },
                { asset: 'مفاتيح التشفير والبنية الأمنية',                 scope: 'سري للغاية' }
            ],
            protection: 'نظام الأسرار التجارية السعودي + اتفاقيات السرية (NDA)',
            prohibited: [
                'الكشف عن أي سر تجاري لأي طرف خارجي',
                'استخدام المعلومات السرية لأغراض شخصية أو تنافسية',
                'الاحتفاظ بنسخ من الأسرار التجارية بعد انتهاء العلاقة'
            ]
        },
        {
            id:      'patent',
            nameAr:  'براءات الاختراع',
            nameEn:  'Patents',
            icon:    '🔬',
            assets: [
                { asset: 'نظام الفلترة الشرعية الآلي',          scope: 'اختراع قابل للبراءة' },
                { asset: 'محرك Matchmaking بين المشترين والموردين', scope: 'اختراع قابل للبراءة' },
                { asset: 'بروتوكول التحقق الشرعي للمعاملات',     scope: 'اختراع قابل للبراءة' },
                { asset: 'نظام التقييم الموحّد عبر الأسواق',       scope: 'اختراع قابل للبراءة' }
            ],
            protection: 'هيئة الملكية الفكرية السعودية + PCT الدولي',
            status:     'جاري تسجيل براءات الاختراع'
        },
        {
            id:      'domain',
            nameAr:  'النطاقات والهوية الرقمية',
            nameEn:  'Domains & Digital Identity',
            icon:    '🌐',
            assets: [
                { asset: 'sheikha.market',     scope: 'النطاق الرئيسي' },
                { asset: 'sheikha.com.sa',     scope: 'النطاق السعودي' },
                { asset: 'sheikha-market.com', scope: 'نطاق احتياطي' },
                { asset: '@SheikhaMarket',     scope: 'الهوية على منصات التواصل' }
            ],
            protection: 'ICANN + هيئة الاتصالات السعودية'
        },
        {
            id:      'data',
            nameAr:  'ملكية البيانات',
            nameEn:  'Data Ownership',
            icon:    '📊',
            assets: [
                { asset: 'بيانات أسعار السوق التاريخية',      scope: 'ملكية حصرية' },
                { asset: 'تحليلات سلوك المستخدمين',           scope: 'ملكية حصرية' },
                { asset: 'نتائج الفلترة الشرعية المجمّعة',     scope: 'ملكية حصرية' },
                { asset: 'شبكة العلاقات بين الموردين والمشترين', scope: 'ملكية حصرية' },
                { asset: 'النماذج التنبؤية المدرّبة',          scope: 'ملكية حصرية' }
            ],
            protection: 'نظام حماية البيانات الشخصية السعودي (PDPL) + GDPR للمستخدمين الأوروبيين'
        },
        {
            id:      'design',
            nameAr:  'حقوق التصميم',
            nameEn:  'Design Rights',
            icon:    '🎨',
            assets: [
                { asset: 'الهوية البصرية الكاملة (Brand Identity)', scope: 'الألوان، الخطوط، الأشكال' },
                { asset: 'تصاميم الواجهات (UI/UX Designs)',          scope: 'كل شاشات المنصة' },
                { asset: 'الرسوم التوضيحية والأيقونات',               scope: 'أصول رقمية محمية' }
            ],
            protection: 'نظام التصاميم الصناعية السعودي + اتفاقية لاهاي'
        },
        {
            id:      'methodology',
            nameAr:  'ملكية المنهجيات',
            nameEn:  'Methodology Ownership',
            icon:    '⚙️',
            assets: [
                { asset: 'منهجية سوق الأسواق (Market-of-Markets)',  scope: 'نموذج عمل محمي' },
                { asset: 'منهجية التوافق الشرعي الآلي',               scope: 'نموذج عمل محمي' },
                { asset: 'بروتوكول منظمة المنظمات (Org-of-Orgs)',    scope: 'بروتوكول محمي' },
                { asset: 'معيار الحوكمة الإسلامية للمنصات الرقمية',  scope: 'معيار محمي' }
            ],
            protection: 'أسرار تجارية + براءات الاختراع الإجرائية'
        }
    ],

    // ─── شروط الاستخدام وحدود الترخيص ───────────────────────────────────────
    usageTerms: {
        permittedUses: [
            'استخدام المنصة وفق شروط الخدمة المعتمدة',
            'الاقتباس المرجعي من التوثيق مع نسب الملكية لسوق شيخة',
            'التكامل عبر API المرخّصة وفق اتفاقية المطوّر'
        ],
        prohibitedUses: [
            'إعادة هندسة الكود (Reverse Engineering)',
            'إنشاء أعمال مشتقّة دون إذن كتابي',
            'تأجير أو بيع أو ترخيص حقوق المنصة',
            'استخراج البيانات آلياً (Scraping) دون إذن',
            'استخدام أي جزء من المنظومة لبناء منافس',
            'انتحال الهوية أو التظاهر بالتبعية لسوق شيخة'
        ],
        violations: {
            civil:    'المطالبة بالتعويض الكامل عن الأضرار المباشرة وغير المباشرة',
            criminal: 'الإبلاغ للجهات الجنائية المختصة وفق نظام مكافحة الجرائم المعلوماتية',
            islamic:  'الأمانة واجبة شرعاً — خيانة الأمانة محرّمة: يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَخُونُوا اللَّهَ وَالرَّسُولَ — الأنفال: 27'
        }
    },

    // ─── مبادئ السرية وحماية المعلومات ──────────────────────────────────────
    confidentialityPrinciples: [
        {
            id:       'cp-01',
            title:    'السرية المطلقة للأسرار التجارية',
            desc:     'كل من اطّلع على أسرار سوق شيخة بحكم عمله أو شراكته ملزم بالسرية مدى الحياة',
            evidence: 'حفظ الأمانة واجب: إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا',
            ref:      'النساء: 58'
        },
        {
            id:       'cp-02',
            title:    'حظر الإفصاح لأطراف ثالثة',
            desc:     'لا يجوز مشاركة أي معلومة سرية مع أي طرف لم يوقّع على اتفاقية السرية (NDA)',
            evidence: 'من كتم سراً استودعه إياه — الأمانة لا تُخان'
        },
        {
            id:       'cp-03',
            title:    'حماية بيانات التجار والمستخدمين',
            desc:     'بيانات المستخدمين أمانة — لا تُباع ولا تُشارك ولا تُستخدم إلا لخدمة أصحابها',
            evidence: 'لَا تَخُونُوا اللَّهَ وَالرَّسُولَ وَتَخُونُوا أَمَانَاتِكُمْ — الأنفال: 27',
            regulatory: 'نظام حماية البيانات الشخصية (PDPL) المادة 4'
        },
        {
            id:       'cp-04',
            title:    'تدمير المعلومات عند انتهاء العلاقة',
            desc:     'عند انتهاء أي عقد أو شراكة يجب إعادة أو إتلاف كل المعلومات السرية المحصّلة',
            evidence: 'الواجب ردّ الأمانة لأصحابها'
        },
        {
            id:       'cp-05',
            title:    'الحماية التقنية للمعلومات',
            desc:     'كل المعلومات السرية مشفّرة ومحمية بمعايير AES-256 كحد أدنى',
            standard: 'ISO/IEC 27001 — إدارة أمن المعلومات'
        }
    ],

    // ─── بنود اتفاقية عدم الإفصاح (NDA) الإلزامية ────────────────────────────
    ndaTerms: {
        scope:    'تشمل كل المعلومات التقنية والتجارية والمالية والاستراتيجية التي يطّلع عليها الطرف الثاني',
        duration: 'لا تنتهي بانتهاء العلاقة — السرية مستمرة مدى الحياة للأسرار التجارية الجوهرية',
        remedies: [
            'وقف فوري للنشاط المخالف بأمر قضائي (Injunction)',
            'تعويض عن كامل الأضرار الموثّقة',
            'رسوم إضافية عقابية تصل إلى 3 أضعاف الضرر الفعلي',
            'الإبلاغ الجنائي وفق نظام مكافحة الجرائم المعلوماتية السعودي'
        ],
        islamicBasis: 'الوفاء بالعقود فريضة: يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة: 1'
    },

    // ─── إجراءات الإبلاغ عن الانتهاكات ────────────────────────────────────
    violationReporting: {
        contactAr:    'legal@sheikha.market',
        responseTime: '48 ساعة',
        process: [
            'تقديم بلاغ كتابي مفصّل مع الأدلة',
            'مراجعة قانونية خلال 48 ساعة',
            'إجراء أولي خلال 72 ساعة (إيقاف / إشعار / تفاوض)',
            'التصعيد القضائي عند الاقتضاء'
        ]
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 نموذج تسجيل الأصول الفكرية
// ═══════════════════════════════════════════════════════════════════════════════

class IPAsset {
    constructor(data = {}) {
        this.id           = data.id           || uuid();
        this.title        = data.title        || '';
        this.titleAr      = data.titleAr      || data.title || '';
        this.titleEn      = data.titleEn      || '';
        this.description  = data.description  || '';
        this.category     = data.category     || 'copyright'; // من IP_MASTER_CHARTER.categories[].id
        this.owner        = data.owner        || 'Sheikha Market';
        this.createdBy    = data.createdBy    || null;
        this.confidentiality = data.confidentiality || 'confidential'; // public | internal | confidential | top-secret
        this.version      = data.version      || '1.0.0';
        this.registrationRef = data.registrationRef || null; // رقم التسجيل الرسمي
        this.registrationDate = data.registrationDate || null;
        this.expiryDate   = data.expiryDate   || null;
        this.jurisdiction = data.jurisdiction || ['Saudi Arabia'];
        this.tags         = data.tags         || [];
        this.status       = data.status       || 'active'; // active | expired | disputed | transferred
        this.metadata     = data.metadata     || {};
        this.createdAt    = data.createdAt    || new Date().toISOString();
        this.updatedAt    = data.updatedAt    || new Date().toISOString();
    }

    save() {
        this.updatedAt = new Date().toISOString();
        let assets = database.read('intellectualProperty') || [];
        if (!Array.isArray(assets)) assets = [];
        const index = assets.findIndex(a => a.id === this.id);
        if (index >= 0) assets[index] = this;
        else assets.push(this);
        database.write('intellectualProperty', assets);
        return this;
    }

    getSummary() {
        return {
            id:              this.id,
            title:           this.titleAr || this.title,
            category:        this.category,
            owner:           this.owner,
            confidentiality: this.confidentiality,
            status:          this.status,
            registrationRef: this.registrationRef,
            createdAt:       this.createdAt
        };
    }

    static findById(id) {
        const assets = database.read('intellectualProperty') || [];
        const data = assets.find(a => a.id === id);
        return data ? new IPAsset(data) : null;
    }

    static find(query = {}) {
        let assets = database.read('intellectualProperty') || [];
        if (!Array.isArray(assets)) assets = [];
        if (Object.keys(query).length === 0) return assets.map(a => new IPAsset(a));
        return assets
            .filter(a => Object.entries(query).every(([k, v]) => a[k] === v))
            .map(a => new IPAsset(a));
    }

    static create(data) {
        return new IPAsset(data).save();
    }

    static delete(id) {
        let assets = database.read('intellectualProperty') || [];
        if (!Array.isArray(assets)) assets = [];
        const index = assets.findIndex(a => a.id === id);
        if (index < 0) return false;
        assets.splice(index, 1);
        database.write('intellectualProperty', assets);
        return true;
    }
}

module.exports = { IP_MASTER_CHARTER, IPAsset };
