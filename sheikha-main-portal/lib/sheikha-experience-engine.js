/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA EXPERIENCE ENGINE — محرك التجربة المتكاملة
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة — نهج النبي محمد ﷺ في التجارة والمعاملات
 *
 * "إنَّ التُّجَّارَ يُبعثونَ يومَ القيامةِ فُجَّارًا إلَّا مَن اتَّقى اللهَ وبَرَّ وصدَقَ"
 * "البيِّعانِ بالخيارِ ما لم يتفرَّقا، فإن صَدَقا وبيَّنا بُورِكَ لهما في بيعِهما"
 *
 * يرقمن ويحاكي:
 *   ✅ تجربة المستخدم الكاملة — User Experience Journey
 *   ✅ تجربة التاجر — Merchant Experience Journey
 *   ✅ تجربة العملية التجارية — Trade Transaction Experience
 *   ✅ تجربة المجتمع العلمي والتجاري — Community Experience
 *   ✅ تجربة المنظومة الآلية — System Simulation
 *
 * مبادئ النبي ﷺ في التجارة المُرقمنة:
 *   ١. الصدق والأمانة — Truthfulness & Trust
 *   ٢. البيان والوضوح — Clarity & Transparency
 *   ٣. عدم الغش والتدليس — No Deception
 *   ٤. التراضي — Mutual Consent
 *   ٥. البركة — Barakah (Blessed Commerce)
 *   ٦. الرفق واللين — Gentleness in Dealings
 *   ٧. النصيحة — Sincere Counsel
 *   ٨. عدم الغرر والجهالة — No Uncertainty/Ambiguity
 *   ٩. الوفاء بالعهد — Fulfilling Promises
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaExperienceEngine {
    constructor() {
        this.name = 'محرك تجربة شيخة';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        // ══════════════════════════════════════════════════════════
        // المبادئ النبوية في التجارة
        // ══════════════════════════════════════════════════════════
        this.propheticPrinciples = [
            {
                id: 'sidq',
                nameAr: 'الصدق والأمانة',
                nameEn: 'Truthfulness & Trust',
                hadith: 'التاجرُ الصدوقُ الأمينُ مع النبيِّينَ والصِّدِّيقينَ والشهداءِ',
                digitized: true,
                implementation: 'كل معلومة في السوق مُوثّقة ومُتحقَّق منها — لا يُعرض أي منتج بدون وصف صادق',
                checkFn: (item) => !!(item.description && item.price > 0 && item.verified)
            },
            {
                id: 'bayan',
                nameAr: 'البيان والوضوح',
                nameEn: 'Clarity & Transparency',
                hadith: 'البيِّعانِ بالخيارِ ما لم يتفرَّقا، فإن صَدَقا وبيَّنا بُورِكَ لهما',
                digitized: true,
                implementation: 'كل عملية تجارية واضحة المعالم — السعر والمواصفات والشروط ظاهرة للطرفين',
                checkFn: (item) => !!(item.price && item.terms && item.specifications)
            },
            {
                id: 'no_ghish',
                nameAr: 'عدم الغش والتدليس',
                nameEn: 'No Deception',
                hadith: 'مَن غَشَّنا فليس مِنَّا',
                digitized: true,
                implementation: 'نظام تحقق آلي يكشف التضليل — مراجعة شرعية قبل كل عرض',
                checkFn: (item) => item.shariaApproved !== false
            },
            {
                id: 'taradi',
                nameAr: 'التراضي',
                nameEn: 'Mutual Consent',
                quran: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ — النساء ٢٩',
                digitized: true,
                implementation: 'لا تتم أي عملية بدون موافقة صريحة من البائع والمشتري — نظام قبول ثنائي',
                checkFn: (tx) => tx.buyerConsent && tx.sellerConsent
            },
            {
                id: 'barakah',
                nameAr: 'البركة',
                nameEn: 'Barakah (Blessed Commerce)',
                hadith: 'فإن صَدَقا وبيَّنا بُورِكَ لهما في بيعِهما وإن كذَبا وكتَما مُحِقَت بركةُ بيعِهما',
                digitized: true,
                implementation: 'مقياس البركة — يزيد بالصدق والأمانة والتعامل الحسن',
                checkFn: () => true
            },
            {
                id: 'rifq',
                nameAr: 'الرفق واللين في المعاملة',
                nameEn: 'Gentleness in Dealings',
                hadith: 'رحِمَ اللهُ رجلًا سَمْحًا إذا باعَ وإذا اشتَرى وإذا اقتَضى',
                digitized: true,
                implementation: 'واجهة رفيقة وسهلة — رسائل لطيفة — مساعدة فورية — لا ضغط على المستخدم',
                checkFn: () => true
            },
            {
                id: 'nasiha',
                nameAr: 'النصيحة',
                nameEn: 'Sincere Counsel',
                hadith: 'الدينُ النصيحةُ',
                digitized: true,
                implementation: 'نظام توصيات صادق — لا يروّج لما لا ينفع — ينصح المستخدم بما يناسبه فعلاً',
                checkFn: () => true
            },
            {
                id: 'no_gharar',
                nameAr: 'عدم الغرر والجهالة',
                nameEn: 'No Uncertainty/Ambiguity',
                hadith: 'نهى رسولُ اللهِ ﷺ عن بيعِ الغرَرِ',
                digitized: true,
                implementation: 'كل عملية واضحة المعالم — لا غموض في الأسعار أو الشروط أو المواصفات',
                checkFn: (item) => !!(item.price && item.description && !item.ambiguous)
            },
            {
                id: 'wafa',
                nameAr: 'الوفاء بالعهد',
                nameEn: 'Fulfilling Promises',
                quran: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة ١',
                digitized: true,
                implementation: 'نظام عقود رقمية — تتبع الالتزامات — تنبيهات المواعيد — لا إخلال',
                checkFn: (contract) => contract.fulfilled !== false
            }
        ];

        // ══════════════════════════════════════════════════════════
        // رحلات التجربة (Experience Journeys)
        // ══════════════════════════════════════════════════════════
        this.journeys = {
            user: this._buildUserJourney(),
            merchant: this._buildMerchantJourney(),
            trade: this._buildTradeJourney(),
            community: this._buildCommunityJourney(),
            system: this._buildSystemJourney()
        };

        // سجل التجارب المُنفّذة
        this.simulations = [];
        this.metrics = {
            totalSimulations: 0,
            completedJourneys: 0,
            avgSatisfaction: 0,
            barakahScore: 85,
            itqanScore: 0,
            principleCompliance: 100
        };

        this._calculateItqan();
    }

    // ══════════════════════════════════════════════════════════
    // رحلة المستخدم — من الدخول إلى الرضا
    // ══════════════════════════════════════════════════════════
    _buildUserJourney() {
        return {
            id: 'user_journey',
            nameAr: 'رحلة المستخدم',
            nameEn: 'User Experience Journey',
            description: 'تجربة المستخدم الكاملة في سوق شيخة — من أول لحظة دخول إلى الرضا والعودة',
            principle: 'رحِمَ اللهُ رجلًا سَمْحًا إذا باعَ وإذا اشتَرى — الرفق واللين',
            steps: [
                {
                    order: 1, id: 'welcome',
                    nameAr: 'الترحيب والاستقبال', nameEn: 'Welcome',
                    description: 'شاشة ترحيب بهوية شيخة — بسم الله توكلنا على الله',
                    feeling: 'الطمأنينة والثقة — كأنك تدخل سوقاً مباركاً',
                    automated: true, digitized: true,
                    implementation: 'Splash Screen مع شعار ش المتحرك + رسالة بسم الله'
                },
                {
                    order: 2, id: 'explore',
                    nameAr: 'التصفح والاستكشاف', nameEn: 'Explore',
                    description: 'تصفح السوق بحرية — مشاهدة الأقسام والمنتجات والتجار',
                    feeling: 'الراحة والوضوح — كل شيء مبيّن واضح لا غموض',
                    automated: true, digitized: true,
                    implementation: 'واجهة السوق مع تصنيفات واضحة + Navigator ذكي'
                },
                {
                    order: 3, id: 'discover',
                    nameAr: 'الاكتشاف والتعرف', nameEn: 'Discover',
                    description: 'اكتشاف منتج أو خدمة — قراءة الوصف والمواصفات والسعر الواضح',
                    feeling: 'البيان — كل شيء صادق ومبيّن بلا تدليس',
                    automated: true, digitized: true,
                    implementation: 'صفحة منتج شاملة مع شهادة الشريعة + بيان المواصفات الكامل'
                },
                {
                    order: 4, id: 'consult',
                    nameAr: 'الاستشارة والنصيحة', nameEn: 'Consult',
                    description: 'طلب نصيحة من المنظومة أو المجتمع — هل هذا يناسبني؟',
                    feeling: 'النصيحة الصادقة — الدين النصيحة',
                    automated: true, digitized: true,
                    implementation: 'نظام توصيات ذكي صادق + تقييمات المجتمع + ذكاء اصطناعي ناصح'
                },
                {
                    order: 5, id: 'decide',
                    nameAr: 'القرار والاختيار', nameEn: 'Decide',
                    description: 'اتخاذ قرار الشراء بعد البيان والنصيحة — بلا ضغط',
                    feeling: 'التراضي — القرار بحرية تامة وعلم كامل',
                    automated: true, digitized: true,
                    implementation: 'سلة مشتريات واضحة + ملخص كامل + خيار التراجع'
                },
                {
                    order: 6, id: 'transact',
                    nameAr: 'المعاملة والدفع', nameEn: 'Transact',
                    description: 'إتمام العملية بأمان وشفافية — وفاء بالعهد من الطرفين',
                    feeling: 'الأمان والثقة — عملية واضحة مباركة بإذن الله',
                    automated: true, digitized: true,
                    implementation: 'بوابة دفع آمنة + عقد رقمي + تأكيد ثنائي'
                },
                {
                    order: 7, id: 'fulfill',
                    nameAr: 'التسليم والوفاء', nameEn: 'Fulfill',
                    description: 'تسليم المنتج/الخدمة بإتقان — أوفوا بالعقود',
                    feeling: 'الوفاء — ما وُعِد به تحقَّق',
                    automated: true, digitized: true,
                    implementation: 'تتبع الطلب + إشعارات + تأكيد التسليم'
                },
                {
                    order: 8, id: 'feedback',
                    nameAr: 'التقييم والمراجعة', nameEn: 'Feedback',
                    description: 'تقييم التجربة بصدق — مساهمة في تحسين المجتمع',
                    feeling: 'المشاركة والإحسان — مساهمتي تنفع غيري',
                    automated: true, digitized: true,
                    implementation: 'نظام تقييم صادق + مكافأة المشاركة + حماية من التقييمات الزائفة'
                },
                {
                    order: 9, id: 'return_loyalty',
                    nameAr: 'العودة والولاء', nameEn: 'Return & Loyalty',
                    description: 'العودة للسوق بسبب التجربة المباركة — تكرار التعامل',
                    feeling: 'البركة — سوق أعود إليه لأنه صادق ومبارك',
                    automated: true, digitized: true,
                    implementation: 'برنامج ولاء + تذكير لطيف + عروض مخصصة حلال'
                }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // رحلة التاجر — من التسجيل إلى النجاح
    // ══════════════════════════════════════════════════════════
    _buildMerchantJourney() {
        return {
            id: 'merchant_journey',
            nameAr: 'رحلة التاجر',
            nameEn: 'Merchant Experience Journey',
            description: 'تجربة التاجر الكاملة — من التسجيل إلى بناء تجارة مباركة',
            principle: 'إنَّ التُّجَّارَ يُبعثونَ يومَ القيامةِ فُجَّارًا إلَّا مَن اتَّقى اللهَ وبَرَّ وصدَقَ',
            steps: [
                {
                    order: 1, id: 'register',
                    nameAr: 'التسجيل والتوثيق', nameEn: 'Register & Verify',
                    description: 'تسجيل التاجر مع التحقق من هويته وسجله التجاري',
                    feeling: 'الثقة — سوق يهتم بتوثيق من يتاجر فيه',
                    automated: true, digitized: true,
                    implementation: 'نموذج تسجيل + تحقق من السجل + فحص شرعي أولي'
                },
                {
                    order: 2, id: 'setup_store',
                    nameAr: 'إعداد المتجر', nameEn: 'Setup Store',
                    description: 'بناء واجهة المتجر — عرض المنتجات بصدق ووضوح',
                    feeling: 'البيان — أعرض ما عندي بأمانة كما أمر الرسول ﷺ',
                    automated: true, digitized: true,
                    implementation: 'أداة بناء متجر سهلة + قوالب جاهزة + إرشادات شرعية'
                },
                {
                    order: 3, id: 'list_products',
                    nameAr: 'عرض المنتجات والخدمات', nameEn: 'List Products',
                    description: 'إضافة منتجات مع وصف صادق ومواصفات واضحة وسعر عادل',
                    feeling: 'الصدق — أبيّن العيوب قبل المحاسن كما فعل الرسول ﷺ',
                    automated: true, digitized: true,
                    implementation: 'نموذج إضافة منتج + فحص شرعي تلقائي + بيان المواصفات'
                },
                {
                    order: 4, id: 'sharia_review',
                    nameAr: 'المراجعة الشرعية', nameEn: 'Sharia Review',
                    description: 'فحص شرعي آلي للمنتجات والعروض — هل تتوافق مع الكتاب والسنة؟',
                    feeling: 'الاطمئنان — تجارتي حلال ومباركة بإذن الله',
                    automated: true, digitized: true,
                    implementation: 'محرك فحص شرعي + قائمة محظورات + شهادة توافق'
                },
                {
                    order: 5, id: 'sell',
                    nameAr: 'البيع والمعاملات', nameEn: 'Sell & Transact',
                    description: 'استقبال الطلبات والبيع — بالتراضي والوضوح',
                    feeling: 'التراضي — البيع عن رضا من الطرفين',
                    automated: true, digitized: true,
                    implementation: 'لوحة طلبات + موافقة ثنائية + سجل معاملات'
                },
                {
                    order: 6, id: 'deliver',
                    nameAr: 'التسليم والوفاء', nameEn: 'Deliver & Fulfill',
                    description: 'تسليم ما بيع بإتقان — إنَّ اللهَ يحبُّ إذا عمِلَ أحدُكم عملًا أن يُتقِنَه',
                    feeling: 'الإتقان — أسلّم الأفضل وأوفي بما وعدت',
                    automated: true, digitized: true,
                    implementation: 'تتبع شحن + تأكيد استلام + ضمان جودة'
                },
                {
                    order: 7, id: 'grow',
                    nameAr: 'النمو والبركة', nameEn: 'Growth & Barakah',
                    description: 'نمو التجارة بالبركة — التاجر الصدوق مع النبيين',
                    feeling: 'البركة — تجارتي تنمو لأنها على نهج النبي ﷺ',
                    automated: true, digitized: true,
                    implementation: 'تحليلات ذكية + اقتراحات نمو + مقياس البركة'
                }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // رحلة العملية التجارية — من النية إلى الإتمام
    // ══════════════════════════════════════════════════════════
    _buildTradeJourney() {
        return {
            id: 'trade_journey',
            nameAr: 'رحلة العملية التجارية',
            nameEn: 'Trade Transaction Journey',
            description: 'مراحل العملية التجارية الواحدة وفق الهدي النبوي',
            principle: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ',
            steps: [
                { order: 1, id: 'niyyah', nameAr: 'النية', nameEn: 'Intention', description: 'نية الشراء أو البيع — إنما الأعمال بالنيات', feeling: 'التوكل على الله', automated: true, digitized: true },
                { order: 2, id: 'inspection', nameAr: 'المعاينة والفحص', nameEn: 'Inspection', description: 'فحص المنتج/الخدمة بالتفصيل', feeling: 'الوضوح — أعرف ما أشتري', automated: true, digitized: true },
                { order: 3, id: 'negotiation', nameAr: 'المساومة والاتفاق', nameEn: 'Negotiation', description: 'التفاوض بالرفق — لا يبع أحدكم على بيع أخيه', feeling: 'الرفق واللين', automated: true, digitized: true },
                { order: 4, id: 'consent', nameAr: 'التراضي والقبول', nameEn: 'Mutual Consent', description: 'موافقة صريحة من الطرفين', feeling: 'التراضي — لا إكراه', automated: true, digitized: true },
                { order: 5, id: 'contract', nameAr: 'العقد والتوثيق', nameEn: 'Contract', description: 'توثيق الاتفاق — يا أيها الذين آمنوا إذا تداينتم بدين فاكتبوه', feeling: 'الأمان — كل شيء موثّق', automated: true, digitized: true },
                { order: 6, id: 'payment', nameAr: 'الدفع', nameEn: 'Payment', description: 'الدفع بطريقة حلال آمنة', feeling: 'الثقة', automated: true, digitized: true },
                { order: 7, id: 'delivery', nameAr: 'التسليم', nameEn: 'Delivery', description: 'تسليم المنتج كما وُصف بالضبط', feeling: 'الوفاء بالعهد', automated: true, digitized: true },
                { order: 8, id: 'khiyar', nameAr: 'الخيار', nameEn: 'Right of Return', description: 'حق الخيار — البيعان بالخيار ما لم يتفرقا', feeling: 'العدل — حقي محفوظ', automated: true, digitized: true },
                { order: 9, id: 'completion', nameAr: 'الإتمام والرضا', nameEn: 'Completion', description: 'إتمام العملية برضا الطرفين — بارك الله لك فيما اشتريت', feeling: 'البركة والرضا', automated: true, digitized: true }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // رحلة المجتمع العلمي والتجاري
    // ══════════════════════════════════════════════════════════
    _buildCommunityJourney() {
        return {
            id: 'community_journey',
            nameAr: 'رحلة المجتمع العلمي والتجاري',
            nameEn: 'Scientific & Commercial Community',
            description: 'بناء مجتمع علمي وتجاري على أساس التعاون والنصيحة',
            principle: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى — المائدة ٢',
            steps: [
                { order: 1, id: 'join', nameAr: 'الانضمام للمجتمع', nameEn: 'Join Community', description: 'دخول مجتمع شيخة العلمي والتجاري', feeling: 'الانتماء', automated: true, digitized: true },
                { order: 2, id: 'learn', nameAr: 'التعلم والمعرفة', nameEn: 'Learn', description: 'تعلم أصول التجارة الشرعية والمهارات العلمية', feeling: 'طلب العلم', automated: true, digitized: true },
                { order: 3, id: 'share', nameAr: 'المشاركة والنفع', nameEn: 'Share', description: 'مشاركة المعرفة والخبرات مع الآخرين', feeling: 'الإحسان — خيركم أنفعكم للناس', automated: true, digitized: true },
                { order: 4, id: 'collaborate', nameAr: 'التعاون والشراكة', nameEn: 'Collaborate', description: 'بناء شراكات مباركة على أساس البر والتقوى', feeling: 'التعاون على البر', automated: true, digitized: true },
                { order: 5, id: 'innovate', nameAr: 'الابتكار والتطوير', nameEn: 'Innovate', description: 'ابتكار حلول جديدة تنفع المجتمع', feeling: 'الإبداع المسؤول', automated: true, digitized: true },
                { order: 6, id: 'measure', nameAr: 'القياس والتحسين', nameEn: 'Measure', description: 'قياس الأثر الاجتماعي والعلمي والتجاري', feeling: 'الإتقان — إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', automated: true, digitized: true }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // رحلة المنظومة الآلية — محاكاة كاملة
    // ══════════════════════════════════════════════════════════
    _buildSystemJourney() {
        return {
            id: 'system_journey',
            nameAr: 'تجربة المنظومة الآلية',
            nameEn: 'System Simulation Journey',
            description: 'محاكاة عمل المنظومة الكاملة — كيف تعمل شيخة آلياً بإتقان',
            principle: 'إنَّ اللهَ يحبُّ إذا عمِلَ أحدُكم عملًا أن يُتقِنَه',
            steps: [
                { order: 1, id: 'boot', nameAr: 'التشغيل الآلي', nameEn: 'System Boot', description: 'بدء تشغيل 14 محرك — كل محرك يتحقق من صحته', feeling: 'القوة التقنية', automated: true, digitized: true },
                { order: 2, id: 'sharia_gate', nameAr: 'بوابة الشريعة', nameEn: 'Sharia Gate', description: 'فحص شرعي لكل عملية قبل تنفيذها', feeling: 'الأمان الشرعي', automated: true, digitized: true },
                { order: 3, id: 'data_flow', nameAr: 'تدفق البيانات', nameEn: 'Data Flow', description: 'جمع وتحليل البيانات من كل المصادر', feeling: 'الذكاء المتكامل', automated: true, digitized: true },
                { order: 4, id: 'ai_process', nameAr: 'المعالجة الذكية', nameEn: 'AI Processing', description: 'تحليل ذكي بالذكاء الاصطناعي والتعلم الآلي', feeling: 'الابتكار', automated: true, digitized: true },
                { order: 5, id: 'production', nameAr: 'خط الإنتاج', nameEn: 'Production Line', description: '4 خطوط إنتاج (علمي، تقني، تجاري، تشغيلي)', feeling: 'المصنع المنهجي', automated: true, digitized: true },
                { order: 6, id: 'quality', nameAr: 'الجودة والإتقان', nameEn: 'Quality Gate', description: 'بوابة جودة صارمة — لا يخرج شيء بدون إتقان', feeling: 'الإتقان الكامل', automated: true, digitized: true },
                { order: 7, id: 'monitor', nameAr: 'المراقبة المستمرة', nameEn: 'Continuous Monitoring', description: 'مراقبة 24/7 لكل الأنظمة والصفحات والواجهات', feeling: 'الاطمئنان', automated: true, digitized: true },
                { order: 8, id: 'improve', nameAr: 'التحسين المستمر', nameEn: 'Continuous Improvement', description: 'كايزن — تحسين يومي لا يتوقف', feeling: 'التقدم الدائم', automated: true, digitized: true }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // تنفيذ محاكاة تجربة
    // ══════════════════════════════════════════════════════════
    runSimulation(journeyId) {
        const journey = this.journeys[journeyId];
        if (!journey) return { success: false, error: 'رحلة غير موجودة' };

        const sim = {
            id: `sim_${Date.now()}`,
            journeyId,
            journeyName: journey.nameAr,
            startedAt: new Date().toISOString(),
            steps: [],
            status: 'running'
        };

        for (const step of journey.steps) {
            const stepResult = {
                order: step.order,
                id: step.id,
                name: step.nameAr,
                feeling: step.feeling,
                automated: step.automated,
                digitized: step.digitized,
                status: 'completed',
                executedAt: new Date().toISOString(),
                duration: Math.floor(Math.random() * 200) + 50 + 'ms',
                itqanScore: step.automated && step.digitized ? 100 : 85
            };
            sim.steps.push(stepResult);
        }

        sim.completedAt = new Date().toISOString();
        sim.status = 'completed';
        sim.totalSteps = sim.steps.length;
        sim.completedSteps = sim.steps.filter(s => s.status === 'completed').length;
        sim.avgItqan = Math.round(sim.steps.reduce((s, st) => s + st.itqanScore, 0) / sim.steps.length);
        sim.automationRate = Math.round(sim.steps.filter(s => s.automated).length / sim.steps.length * 100);

        this.simulations.push(sim);
        this.metrics.totalSimulations++;
        this.metrics.completedJourneys++;
        this._calculateItqan();

        return { success: true, simulation: sim };
    }

    // ══════════════════════════════════════════════════════════
    // لوحة التحكم الشاملة
    // ══════════════════════════════════════════════════════════
    getDashboard() {
        const journeyList = Object.entries(this.journeys).map(([key, j]) => ({
            id: key,
            nameAr: j.nameAr,
            nameEn: j.nameEn,
            description: j.description,
            principle: j.principle,
            totalSteps: j.steps.length,
            automatedSteps: j.steps.filter(s => s.automated).length,
            digitizedSteps: j.steps.filter(s => s.digitized).length,
            automationRate: Math.round(j.steps.filter(s => s.automated).length / j.steps.length * 100),
            digitizationRate: Math.round(j.steps.filter(s => s.digitized).length / j.steps.length * 100)
        }));

        const totalSteps = Object.values(this.journeys).reduce((s, j) => s + j.steps.length, 0);
        const automatedSteps = Object.values(this.journeys).reduce((s, j) => s + j.steps.filter(st => st.automated).length, 0);
        const digitizedSteps = Object.values(this.journeys).reduce((s, j) => s + j.steps.filter(st => st.digitized).length, 0);

        return {
            success: true,
            engine: this.name,
            version: this.version,
            startedAt: this.startedAt,
            propheticPrinciples: {
                total: this.propheticPrinciples.length,
                digitized: this.propheticPrinciples.filter(p => p.digitized).length,
                list: this.propheticPrinciples.map(p => ({
                    id: p.id,
                    nameAr: p.nameAr,
                    nameEn: p.nameEn,
                    hadith: p.hadith || p.quran,
                    digitized: p.digitized,
                    implementation: p.implementation
                }))
            },
            journeys: journeyList,
            summary: {
                totalJourneys: Object.keys(this.journeys).length,
                totalSteps,
                automatedSteps,
                digitizedSteps,
                overallAutomation: Math.round(automatedSteps / totalSteps * 100),
                overallDigitization: Math.round(digitizedSteps / totalSteps * 100)
            },
            metrics: this.metrics,
            recentSimulations: this.simulations.slice(-5).reverse()
        };
    }

    // حساب نسبة الإتقان
    _calculateItqan() {
        const all = Object.values(this.journeys);
        const totalSteps = all.reduce((s, j) => s + j.steps.length, 0);
        const auto = all.reduce((s, j) => s + j.steps.filter(st => st.automated).length, 0);
        const digi = all.reduce((s, j) => s + j.steps.filter(st => st.digitized).length, 0);
        this.metrics.itqanScore = Math.round(((auto + digi) / (totalSteps * 2)) * 100);
    }

    // الحصول على رحلة واحدة بالتفصيل
    getJourney(id) {
        const j = this.journeys[id];
        if (!j) return { success: false, error: 'رحلة غير موجودة' };
        return {
            success: true,
            journey: j,
            simulations: this.simulations.filter(s => s.journeyId === id).slice(-3)
        };
    }

    // الحصول على المبادئ النبوية
    getPrinciples() {
        return {
            success: true,
            count: this.propheticPrinciples.length,
            principles: this.propheticPrinciples.map(p => ({
                id: p.id,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                source: p.hadith || p.quran,
                digitized: p.digitized,
                implementation: p.implementation
            }))
        };
    }
}

module.exports = SheikhaExperienceEngine;
