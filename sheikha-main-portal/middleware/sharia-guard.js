/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🛡️ حارس الشريعة — Sharia Guard Middleware
 *  لا ربا والصور والفيديو بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: 275
 *  ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا الرِّبَا أَضْعَافًا مُّضَاعَفَةً﴾ — آل عمران: 130
 *  ﴿وَلَا تَقْرَبُوا الْفَوَاحِشَ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ﴾ — الأنعام: 151
 *  «لعن رسول الله ﷺ آكل الربا وموكله وكاتبه وشاهديه» — رواه مسلم (1598)
 *  «إن الله طيب لا يقبل إلا طيبا» — رواه مسلم (1015)
 *
 *  المهام:
 *   1. منع الربا في المنتجات والطلبات والمعاملات
 *   2. فلترة الصور وفق ضوابط الكتاب والسنة
 *   3. فلترة الفيديو وفق ضوابط الكتاب والسنة
 *   4. رفض أي محتوى مخالف بأدلة شرعية واضحة
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── الأدلة الشرعية على تحريم الربا ──────────────────────────────────────────
const RIBA_EVIDENCE = {
    quran: [
        {
            ref: 'البقرة: 275',
            text: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
            ruling: 'تحريم الربا وإباحة البيع الحلال'
        },
        {
            ref: 'البقرة: 278-279',
            text: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَذَرُوا مَا بَقِيَ مِنَ الرِّبَا إِن كُنتُم مُّؤْمِنِينَ﴾',
            ruling: 'وجوب ترك ما بقي من الربا على الفور'
        },
        {
            ref: 'آل عمران: 130',
            text: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا الرِّبَا أَضْعَافًا مُّضَاعَفَةً﴾',
            ruling: 'تحريم الربا المضاعف'
        },
        {
            ref: 'النساء: 161',
            text: '﴿وَأَخْذِهِمُ الرِّبَا وَقَدْ نُهُوا عَنْهُ﴾',
            ruling: 'ذم آخذي الربا'
        }
    ],
    hadith: [
        {
            ref: 'صحيح مسلم (1598)',
            text: '«لعن رسول الله ﷺ آكل الربا وموكله وكاتبه وشاهديه، وقال: هم سواء»',
            ruling: 'لعن كل من أعان على الربا'
        },
        {
            ref: 'البخاري (2086)',
            text: '«درهم ربا يأكله الرجل وهو يعلم أشد من ستة وثلاثين زنية»',
            ruling: 'عِظَم إثم الربا'
        },
        {
            ref: 'مسلم (1584)',
            text: '«الذهب بالذهب، والفضة بالفضة، والبر بالبر... مثلاً بمثل، سواءً بسواء، يداً بيد»',
            ruling: 'اشتراط التماثل والتقابض في المعادن الربوية'
        }
    ]
};

// ─── الأدلة الشرعية على ضوابط الصور والفيديو ─────────────────────────────────
const MEDIA_EVIDENCE = {
    quran: [
        {
            ref: 'الأنعام: 151',
            text: '﴿وَلَا تَقْرَبُوا الْفَوَاحِشَ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ﴾',
            ruling: 'تحريم الفواحش ظاهرها وباطنها'
        },
        {
            ref: 'النور: 30-31',
            text: '﴿قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ﴾',
            ruling: 'وجوب غض البصر وتحريم ما يُثير الشهوة'
        },
        {
            ref: 'النور: 19',
            text: '﴿إِنَّ الَّذِينَ يُحِبُّونَ أَن تَشِيعَ الْفَاحِشَةُ فِي الَّذِينَ آمَنُوا لَهُمْ عَذَابٌ أَلِيمٌ﴾',
            ruling: 'تحريم نشر الفاحشة والمحتوى المنحل'
        }
    ],
    hadith: [
        {
            ref: 'البخاري (5951)، مسلم (2107)',
            text: '«لُعِنَ الْمُصَوِّرُونَ» — المقصود: تصوير ذوات الأرواح بقصد المضاهاة',
            ruling: 'النهي عن التصوير المحرّم لذوات الأرواح'
        },
        {
            ref: 'مسلم (2569)',
            text: '«إن الله جميل يحب الجمال» — والجمال المباح في السلع والمنتجات والطبيعة',
            ruling: 'إباحة الجمال المشروع في عرض السلع'
        },
        {
            ref: 'أبو داود (4924)',
            text: '«كل مصوِّر في النار، يُجعل له بكل صورة صوَّرها نفسٌ تعذِّبه» — في ذوات الأرواح',
            ruling: 'التحذير الشديد من تصوير ذوات الأرواح'
        }
    ],
    allowedMedia: [
        'صور البضائع والمنتجات (الحديد، النحاس، المعادن، السلع)',
        'صور المناظر الطبيعية (الجبال، البحار، الأراضي الزراعية)',
        'الخطوط العربية والزخارف الإسلامية الهندسية',
        'الرسوم البيانية والإنفوجرافيك الخالي من ذوات الأرواح',
        'صور الآلات والمعدات والبنية التحتية'
    ],
    prohibitedMedia: [
        'صور أجساد الإنسان المكشوفة أو المثيرة',
        'صور الحيوانات بقصد التسلية الخادشة للحياء',
        'فيديوهات الموسيقى الصاخبة والرقص',
        'أي محتوى يروّج للخمر أو القمار أو الفاحشة',
        'صور الأصنام والرموز الوثنية'
    ]
};

// ─── مصطلحات الربا المحظورة ────────────────────────────────────────────────────
const RIBA_TERMS_AR = [
    'ربا', 'فائدة', 'فوائد', 'عائد ثابت', 'نسبة فائدة',
    'سعر الفائدة', 'قرض بفائدة', 'عمولة ربوية', 'زيادة على الدين'
];

const RIBA_TERMS_EN = [
    'interest rate', 'interest-bearing', 'usury', ' riba ', 'fixed interest',
    'annual percentage rate', 'compound interest', 'ribawi', 'with interest'
];

// أسماء حقول تشير إلى الربا
const RIBA_FIELD_NAMES = [
    'interestRate', 'interest', 'riba', 'usury', 'apr', 'fixedInterest',
    'priceWithInterest', 'interestAmount', 'creditInterest', 'loanInterest'
];

// ─── أنماط المحتوى الحرام في روابط الصور ─────────────────────────────────────
const IMAGE_HARAM_PATTERNS = [
    /pornhub|xvideos|redtube|xnxx|onlyfans|playboy/i,
    /nude|naked|porn|xxx|18\+|adult-content|nsfw/i,
    /casino|gambling|slots|roulette/i,
    /alcohol|beer|wine|spirits|liquor/i
];

// نطاقات الصور المعتمدة (مصادر موثوقة)
const IMAGE_TRUSTED_DOMAINS = [
    'sheikha.top',
    'cdn.sheikha.top',
    'images.sheikha.top',
    'unsplash.com',
    'images.unsplash.com',
    'pixabay.com',
    'cdn.pixabay.com',
    'pexels.com',
    'images.pexels.com',
    'freepik.com',
    'cloudinary.com',
    'res.cloudinary.com',
    'amazonaws.com',
    's3.amazonaws.com',
    'storage.googleapis.com',
    'blob.core.windows.net',
    'githubusercontent.com',
    'imgbb.com',
    'postimg.cc'
];

// ─── أنماط المحتوى الحرام في روابط الفيديو ───────────────────────────────────
const VIDEO_HARAM_PATTERNS = [
    /porn|nude|naked|adult|xxx|nsfw/i,
    /casino|gambl|roulette|slot/i,
    /alcohol|beer|wine|liquor|spirits/i,
    /nightclub|stripclub|strip.?club/i,
    /idol.*worship|worship.*idol/i
];

// نطاقات الفيديو المعتمدة
const VIDEO_TRUSTED_DOMAINS = [
    'sheikha.top',
    'cdn.sheikha.top',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'player.vimeo.com',
    'cloudinary.com',
    'res.cloudinary.com',
    'amazonaws.com',
    's3.amazonaws.com',
    'storage.googleapis.com',
    'blob.core.windows.net'
];

// ─── مصطلحات المحتوى الحرام العامة ───────────────────────────────────────────
const HARAM_CONTENT_TERMS = [
    // عربي
    'خمر', 'كحول', 'مسكر', 'قمار', 'ميسر', 'تبرج', 'عري',
    'فاحشة', 'فحش', 'بذاءة', 'صنم', 'وثن', 'دعارة', 'زنا',
    // إنجليزي
    'alcohol', 'gambling', 'casino', 'pornography', 'nudity',
    'obscene', 'prostitution', 'idol worship'
];

// ─── دوال الفحص الشرعي ────────────────────────────────────────────────────────

/**
 * فحص الربا في البيانات المُدخلة
 * ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: 275
 * @param {object} data - البيانات المُرسلة
 * @returns {{ clean: boolean, violations: string[] }}
 */
function checkRiba(data) {
    const violations = [];

    // فحص الحقول المحظورة مباشرة
    for (const field of RIBA_FIELD_NAMES) {
        if (data[field] !== undefined && data[field] !== null) {
            violations.push(
                `حقل ربوي محظور شرعاً: "${field}" — ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾`
            );
        }
    }

    // جمع النصوص للفحص
    const textParts = [
        data.name,
        data.nameEn,
        data.description,
        data.notes,
        data.paymentMethod,
        typeof data.specifications === 'object'
            ? JSON.stringify(data.specifications)
            : String(data.specifications || ''),
        typeof data.payment === 'object'
            ? JSON.stringify(data.payment)
            : String(data.payment || '')
    ].filter(Boolean);

    const combined = textParts.join(' ').toLowerCase();

    for (const term of RIBA_TERMS_AR) {
        if (combined.includes(term)) {
            violations.push(`مصطلح ربوي محظور (عربي): "${term}" — «لعن رسول الله ﷺ آكل الربا وموكله»`);
        }
    }

    for (const term of RIBA_TERMS_EN) {
        if (combined.includes(term.toLowerCase())) {
            violations.push(`مصطلح ربوي محظور (إنجليزي): "${term.trim()}"`);
        }
    }

    return { clean: violations.length === 0, violations };
}

/**
 * فحص الصور وفق ضوابط الكتاب والسنة
 * «لعن المصورون» — المقصود: ما خالف الضوابط الشرعية
 * @param {string[]} images - مصفوفة روابط الصور
 * @returns {{ clean: boolean, violations: string[], warnings: string[] }}
 */
function checkImages(images) {
    if (!Array.isArray(images) || images.length === 0) {
        return { clean: true, violations: [], warnings: [] };
    }

    const violations = [];
    const warnings = [];

    for (const imgUrl of images) {
        if (!imgUrl || typeof imgUrl !== 'string') continue;

        const url = imgUrl.toLowerCase();

        // فحص الأنماط الصريحة للمحتوى الحرام في الرابط
        for (const pattern of IMAGE_HARAM_PATTERNS) {
            if (pattern.test(url)) {
                violations.push(
                    `صورة مرفوضة شرعاً (محتوى محرم في الرابط): ${imgUrl.slice(0, 100)}`
                );
                break;
            }
        }

        // فحص صحة الرابط ومصدره
        try {
            const parsed = new URL(imgUrl);
            // يُسمح بـ data: URLs للصور المضمّنة (base64) — تحتاج فحص إضافي
            if (parsed.protocol === 'data:') {
                warnings.push('صورة مضمّنة (data URL) — يرجى التأكد من خلوها من المحتوى المحظور');
                continue;
            }

            const domain = parsed.hostname.replace(/^www\./, '');
            const isTrusted = IMAGE_TRUSTED_DOMAINS.some(
                d => domain === d || domain.endsWith('.' + d)
            );

            if (!isTrusted) {
                warnings.push(
                    `صورة من نطاق غير مُدرج في المصادر المعتمدة: "${domain}" — ` +
                    'تأكد من توافقها مع الضوابط الشرعية (لا ذوات أرواح مكشوفة، لا محتوى حرام)'
                );
            }
        } catch {
            warnings.push(`رابط صورة غير صالح: ${String(imgUrl).slice(0, 100)}`);
        }
    }

    return { clean: violations.length === 0, violations, warnings };
}

/**
 * فحص الفيديو وفق ضوابط الكتاب والسنة
 * ﴿وَلَا تَقْرَبُوا الْفَوَاحِشَ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ﴾ — الأنعام: 151
 * @param {string|string[]} videos - رابط أو مصفوفة روابط الفيديو
 * @returns {{ clean: boolean, violations: string[], warnings: string[] }}
 */
function checkVideos(videos) {
    if (!videos) return { clean: true, violations: [], warnings: [] };

    const list = Array.isArray(videos) ? videos : [videos];
    const violations = [];
    const warnings = [];

    for (const vidUrl of list) {
        if (!vidUrl || typeof vidUrl !== 'string') continue;

        const url = vidUrl.toLowerCase();

        // فحص الأنماط الصريحة
        for (const pattern of VIDEO_HARAM_PATTERNS) {
            if (pattern.test(url)) {
                violations.push(
                    `فيديو مرفوض شرعاً (محتوى محرم في الرابط): ${vidUrl.slice(0, 100)}`
                );
                break;
            }
        }

        // فحص المصدر
        try {
            const parsed = new URL(vidUrl);
            const domain = parsed.hostname.replace(/^www\./, '');
            const isTrusted = VIDEO_TRUSTED_DOMAINS.some(
                d => domain === d || domain.endsWith('.' + d)
            );

            if (!isTrusted) {
                warnings.push(
                    `فيديو من نطاق غير مُدرج في المصادر المعتمدة: "${domain}" — ` +
                    'تأكد من خلوه من الموسيقى والرقص وكشف العورات'
                );
            }
        } catch {
            warnings.push(`رابط فيديو غير صالح: ${String(vidUrl).slice(0, 100)}`);
        }
    }

    return { clean: violations.length === 0, violations, warnings };
}

/**
 * فحص النصوص العامة للمحتوى الحرام
 * @param {string} text - النص المراد فحصه
 * @returns {{ clean: boolean, violations: string[] }}
 */
function checkTextContent(text) {
    if (!text || typeof text !== 'string') return { clean: true, violations: [] };

    const lower = text.toLowerCase();
    const violations = [];

    for (const term of HARAM_CONTENT_TERMS) {
        if (lower.includes(term.toLowerCase())) {
            violations.push(`مصطلح محظور في المحتوى: "${term}"`);
        }
    }

    return { clean: violations.length === 0, violations };
}

// ─── Middleware: حارس الشريعة للمنتجات ───────────────────────────────────────

/**
 * يُطبَّق على: POST /api/catalog و PUT /api/catalog/:id
 *
 * يفحص:
 *  1. لا ربا في أسماء/أوصاف/حقول المنتج
 *  2. الصور وفق ضوابط الشريعة
 *  3. الفيديو وفق ضوابط الشريعة
 *  4. لا محتوى حرام في النصوص
 */
function productShariaGuard(req, res, next) {
    const data = req.body || {};
    const allViolations = [];
    const allWarnings = [];

    // 1. فحص الربا
    const ribaResult = checkRiba(data);
    if (!ribaResult.clean) allViolations.push(...ribaResult.violations);

    // 2. فحص النصوص العامة
    const textToCheck = [data.name, data.nameEn, data.description]
        .filter(Boolean).join(' ');
    const textResult = checkTextContent(textToCheck);
    if (!textResult.clean) allViolations.push(...textResult.violations);

    // 3. فحص الصور
    const imageResult = checkImages(data.images || []);
    if (!imageResult.clean) allViolations.push(...imageResult.violations);
    allWarnings.push(...imageResult.warnings);

    // 4. فحص الفيديو
    const videos = data.videos || (data.video ? [data.video] : []);
    const videoResult = checkVideos(videos);
    if (!videoResult.clean) allViolations.push(...videoResult.violations);
    allWarnings.push(...videoResult.warnings);

    if (allViolations.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'رُفض المنتج — مخالفة شرعية: لا ربا والصور والفيديو بالكتاب والسنة',
            code: 'SHARIA_VIOLATION',
            shariaViolations: allViolations,
            warnings: allWarnings,
            evidence: {
                riba: RIBA_EVIDENCE,
                media: MEDIA_EVIDENCE
            },
            guidance: 'يرجى مراجعة بيانات المنتج وإزالة أي عنصر مخالف للشريعة الإسلامية. ' +
                      'الصور المقبولة: البضائع والمنتجات والمناظر الطبيعية والزخارف الإسلامية.'
        });
    }

    // تمرير نتيجة الفحص للمسار
    req.shariaCheck = {
        passed: true,
        warnings: allWarnings,
        timestamp: new Date().toISOString()
    };

    next();
}

// ─── Middleware: حارس الشريعة للطلبات (Orders) ───────────────────────────────

/**
 * يُطبَّق على: POST /api/market-orders
 *
 * يفحص:
 *  1. لا ربا في الطلب أو عناصره
 *  2. طريقة الدفع خالية من الربا
 */
function orderShariaGuard(req, res, next) {
    const data = req.body || {};
    const allViolations = [];

    // 1. فحص الربا في الطلب الرئيسي
    const ribaResult = checkRiba(data);
    if (!ribaResult.clean) allViolations.push(...ribaResult.violations);

    // 2. فحص عناصر الطلب
    const items = Array.isArray(data.items) ? data.items : [];
    for (const item of items) {
        const itemRiba = checkRiba(item);
        if (!itemRiba.clean) {
            allViolations.push(
                ...itemRiba.violations.map(v => `[عنصر الطلب] ${v}`)
            );
        }
    }

    // 3. فحص طريقة الدفع
    if (data.paymentMethod) {
        const pm = String(data.paymentMethod).toLowerCase();
        const ribaPaymentKeywords = [
            'interest', 'usury', 'riba', 'credit_interest',
            'loan_interest', 'installment_interest', 'ribawi',
            'with_interest', 'فائدة', 'ربوي'
        ];
        for (const kw of ribaPaymentKeywords) {
            if (pm.includes(kw)) {
                allViolations.push(
                    `طريقة دفع محظورة شرعاً: "${data.paymentMethod}" — ` +
                    '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾'
                );
                break;
            }
        }
    }

    if (allViolations.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'رُفض الطلب — مخالفة شرعية: لا ربا في المعاملات',
            code: 'SHARIA_RIBA_VIOLATION',
            shariaViolations: allViolations,
            evidence: RIBA_EVIDENCE,
            guidance: 'جميع معاملات سوق شيخة يجب أن تخلو من الربا بجميع صوره وأشكاله. ' +
                      '«لعن رسول الله ﷺ آكل الربا وموكله وكاتبه وشاهديه» — رواه مسلم'
        });
    }

    req.shariaCheck = {
        passed: true,
        timestamp: new Date().toISOString()
    };

    next();
}

// ─── دالة الإرشادات الشرعية للوسائط (للمسار العام) ──────────────────────────

/**
 * إرجاع الإرشادات الشرعية الكاملة للصور والفيديو والمعاملات
 * @returns {object} - دليل الضوابط الشرعية
 */
function getMediaGuidelines() {
    return {
        basmala: 'بسم الله الرحمن الرحيم',
        title: 'ضوابط المحتوى الشرعي في سوق شيخة',
        titleEn: 'Sharia Media & Transaction Guidelines — Sheikha Market',

        riba: {
            titleAr: 'لا ربا — أحكام المعاملات',
            prohibited: [
                'الفائدة على القروض (ربا النسيئة)',
                'الزيادة على الأموال الربوية بغير مثل (ربا الفضل)',
                'غرامات التأخير ذات الطابع الربوي',
                'أي شرط يُشترط فيه زيادة مقابل الأجل'
            ],
            allowed: [
                'البيع والشراء بالأثمان المتفق عليها',
                'المرابحة الشرعية (الإفصاح عن الربح)',
                'الإجارة والأجرة الثابتة',
                'السلم والاستصناع وفق الضوابط الشرعية'
            ],
            evidence: RIBA_EVIDENCE
        },

        images: {
            titleAr: 'الصور بالكتاب والسنة',
            allowed: MEDIA_EVIDENCE.allowedMedia,
            prohibited: MEDIA_EVIDENCE.prohibitedMedia,
            trustedDomains: IMAGE_TRUSTED_DOMAINS,
            evidence: MEDIA_EVIDENCE.quran.slice(0, 2)
        },

        videos: {
            titleAr: 'الفيديو بالكتاب والسنة',
            allowed: [
                'فيديوهات عرض المنتجات والبضائع',
                'فيديوهات تعليمية وتوعوية',
                'فيديوهات المصانع والمعامل والمعدات',
                'فيديوهات الخبرات والمهارات المهنية'
            ],
            prohibited: [
                'فيديوهات الموسيقى الصاخبة والرقص',
                'فيديوهات تكشف العورات',
                'فيديوهات تروّج الخمور أو القمار',
                'فيديوهات المحتوى الفاحش أو المنحل',
                'فيديوهات الأصنام والشعائر الوثنية'
            ],
            trustedDomains: VIDEO_TRUSTED_DOMAINS,
            evidence: MEDIA_EVIDENCE.quran.slice(0, 2)
        },

        hadiths: MEDIA_EVIDENCE.hadith,
        quranEvidence: [...RIBA_EVIDENCE.quran, ...MEDIA_EVIDENCE.quran]
    };
}

module.exports = {
    productShariaGuard,
    orderShariaGuard,
    checkRiba,
    checkImages,
    checkVideos,
    checkTextContent,
    getMediaGuidelines,
    RIBA_EVIDENCE,
    MEDIA_EVIDENCE
};
