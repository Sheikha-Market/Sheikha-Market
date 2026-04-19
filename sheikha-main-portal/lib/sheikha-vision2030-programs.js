/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA VISION 2030 PROGRAMS ENGINE — محرك برامج رؤية المملكة ٢٠٣٠
 *
 * المالك: سلمان أحمد بن سلمان الراجح — مستشار دولي
 *
 * "وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ" — الحشر:١٨
 * "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ" — الرعد:١١
 *
 * ✅ ١١ برنامجاً استراتيجياً لرؤية ٢٠٣٠
 * ✅ المستهدفات الرقمية الكبرى بحلول ٢٠٣٠
 * ✅ مساهمة شيخة في كل برنامج
 * ✅ التوافق مع المقاصد الشرعية الخمس
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

class SheikhaVision2030Programs {
    constructor() {
        this.name = 'محرك برامج رؤية ٢٠٣٠ — شيخة';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.vision = {
            id: 'VISION-2030',
            nameAr: 'رؤية المملكة ٢٠٣٠',
            nameEn: 'Saudi Vision 2030',
            headline: 'مجتمع حيوي، اقتصاد مزدهر، وطن طموح',
            pillars: [
                { id: 'P1', nameAr: 'مجتمع حيوي', nameEn: 'A Vibrant Society' },
                { id: 'P2', nameAr: 'اقتصاد مزدهر', nameEn: 'A Thriving Economy' },
                { id: 'P3', nameAr: 'وطن طموح', nameEn: 'An Ambitious Nation' }
            ],
            quranic_ref: { ref: 'الحشر:١٨', text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ' }
        };

        this.programs = this._initPrograms();
        this.targets = this._initTargets();
        this.sheikhaAlignment = this._initSheikhaAlignment();
    }

    // ══════════════════════════════════════════════════════════
    // البرامج التنفيذية الإحدى عشرة
    // ══════════════════════════════════════════════════════════
    _initPrograms() {
        return [
            // ── ١ ──────────────────────────────────────────────
            {
                id: 'QOL',
                code: 'QLP',
                nameAr: 'برنامج جودة الحياة',
                nameEn: 'Quality of Life Program',
                pillar: 'P1',
                maqsad: 'NAFS',
                sponsor: 'مجلس الشؤون الاقتصادية والتنمية',
                objective: 'تحسين نمط حياة الفرد وتطوير قطاعات الثقافة والترفيه والرياضة',
                sectors: ['الثقافة', 'الترفيه', 'الرياضة', 'السياحة الداخلية', 'الأسرة والمجتمع'],
                kpis: [
                    { id: 'QOL-K1', nameAr: 'رفع وقت الترفيه للفرد من 2% إلى 6%', target: 6, unit: '%', baseline: 2 },
                    { id: 'QOL-K2', nameAr: 'رفع نسبة ممارسة الرياضة أسبوعياً من 13% إلى 40%', target: 40, unit: '%', baseline: 13 },
                    { id: 'QOL-K3', nameAr: 'ترتيب عالمي في مؤشر السعادة ضمن أفضل 10 دول', target: 10 },
                    { id: 'QOL-K4', nameAr: 'تأسيس 450 نادياً رياضياً في المملكة', target: 450, unit: 'نادٍ' }
                ],
                quranic_ref: { ref: 'الأعراف:٣٢', text: 'قُلْ مَنْ حَرَّمَ زِينَةَ اللَّهِ الَّتِي أَخْرَجَ لِعِبَادِهِ' },
                sheikha_contribution: ['سوق الترفيه الرقمي', 'منصة الرياضة والصحة', 'تجارة المحتوى الثقافي الحلال', 'برامج الأسرة والمجتمع']
            },

            // ── ٢ ──────────────────────────────────────────────
            {
                id: 'PIF',
                code: 'PIF',
                nameAr: 'برنامج صندوق الاستثمارات العامة',
                nameEn: 'Public Investment Fund Program',
                pillar: 'P2',
                maqsad: 'MAL',
                sponsor: 'صندوق الاستثمارات العامة',
                objective: 'تعزيز دور الصندوق كذراع استثماري ومحرك للنمو الاقتصادي',
                sectors: ['الاستثمار المحلي', 'الاستثمار الدولي', 'المشاريع الكبرى', 'التنويع الاقتصادي'],
                kpis: [
                    { id: 'PIF-K1', nameAr: 'رفع أصول الصندوق من 600 مليار ريال إلى 7.5 تريليون ريال', target: 7500, unit: 'مليار ريال', baseline: 600 },
                    { id: 'PIF-K2', nameAr: 'ضخ 150 مليار ريال سنوياً في الاقتصاد المحلي', target: 150, unit: 'مليار ريال/سنة' },
                    { id: 'PIF-K3', nameAr: 'خلق 1.8 مليون وظيفة مباشرة وغير مباشرة', target: 1800000, unit: 'وظيفة' },
                    { id: 'PIF-K4', nameAr: 'تطوير 13 قطاعاً محورياً محلياً جديداً', target: 13, unit: 'قطاع' }
                ],
                megaProjects: ['نيوم', 'ذا لاين', 'القدية', 'البحر الأحمر الدولية', 'أمالا', 'تروجينا', 'جدة الجديدة', 'درعية'],
                quranic_ref: { ref: 'البقرة:٢٦١', text: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ' },
                sheikha_contribution: ['منصة الاستثمار الحلال', 'ربط الصناديق الاستثمارية', 'تتبع المشاريع الكبرى', 'تحليل العوائد والمخاطر']
            },

            // ── ٣ ──────────────────────────────────────────────
            {
                id: 'NTP',
                code: 'NTP',
                nameAr: 'برنامج التحول الوطني',
                nameEn: 'National Transformation Program',
                pillar: 'P3',
                maqsad: 'ARD',
                sponsor: 'وزارة الاقتصاد والتخطيط',
                objective: 'تطوير البنية التحتية وتعزيز الكفاءة الحكومية',
                sectors: ['البنية التحتية', 'الحوكمة الرقمية', 'تحسين الخدمات الحكومية', 'اللامركزية'],
                kpis: [
                    { id: 'NTP-K1', nameAr: 'تحسين مؤشر فعالية الحكومة من الربع الثالث إلى الربع الأعلى عالمياً', target: 'أفضل 25%' },
                    { id: 'NTP-K2', nameAr: 'رفع رضا المستفيدين عن الخدمات الحكومية إلى 80%', target: 80, unit: '%' },
                    { id: 'NTP-K3', nameAr: 'توفير 200 مليار ريال من الكفاءة التشغيلية', target: 200, unit: 'مليار ريال' },
                    { id: 'NTP-K4', nameAr: 'رقمنة 100% من الخدمات الحكومية', target: 100, unit: '%' }
                ],
                quranic_ref: { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
                sheikha_contribution: ['بوابة الخدمات الحكومية الرقمية', 'منصة التقارير الحكومية', 'تكامل API مع الجهات الحكومية', 'تحليل الكفاءة التشغيلية']
            },

            // ── ٤ ──────────────────────────────────────────────
            {
                id: 'PILGRIM',
                code: 'HAJ',
                nameAr: 'برنامج خدمة ضيوف الرحمن',
                nameEn: 'Serving the Two Holy Mosques Guests Program',
                pillar: 'P1',
                maqsad: 'DIN',
                sponsor: 'وزارة الحج والعمرة',
                objective: 'إتاحة الفرصة لأكبر عدد من المسلمين لأداء الحج والعمرة بأفضل الخدمات',
                sectors: ['الحج', 'العمرة', 'الخدمات الدينية', 'السياحة الدينية', 'الضيافة'],
                kpis: [
                    { id: 'HAJ-K1', nameAr: 'رفع طاقة استيعاب المعتمرين من 8 ملايين إلى مليار معتمر سنوياً', target: 1000000000, unit: 'معتمر', baseline: 8000000 },
                    { id: 'HAJ-K2', nameAr: 'مضاعفة طاقة الحج إلى 5 أضعاف', target: 5, unit: 'مضاعف' },
                    { id: 'HAJ-K3', nameAr: 'رفع رضا الحجاج والمعتمرين إلى 90%', target: 90, unit: '%' },
                    { id: 'HAJ-K4', nameAr: 'رفع مساهمة قطاع الحج والعمرة في الناتج المحلي إلى 3%', target: 3, unit: '%' }
                ],
                quranic_ref: { ref: 'آل عمران:٩٧', text: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلاً' },
                sheikha_contribution: ['منصة خدمات الحج والعمرة', 'سوق المنتجات الدينية', 'تتبع خدمات الضيافة', 'التجارة الإلكترونية الحلال للحجاج']
            },

            // ── ٥ ──────────────────────────────────────────────
            {
                id: 'HCDP',
                code: 'HCD',
                nameAr: 'برنامج تنمية القدرات البشرية',
                nameEn: 'Human Capability Development Program',
                pillar: 'P1',
                maqsad: 'AQL',
                sponsor: 'وزارة الموارد البشرية والتنمية الاجتماعية',
                objective: 'إعداد المواطن لسوق العمل العالمي وتعزيز التعليم المستمر',
                sectors: ['التعليم', 'التدريب', 'التوطين', 'ريادة الأعمال', 'المرأة في سوق العمل'],
                kpis: [
                    { id: 'HCD-K1', nameAr: 'خفض البطالة من 11.6% إلى 7%', target: 7, unit: '%', baseline: 11.6 },
                    { id: 'HCD-K2', nameAr: 'رفع مشاركة المرأة في سوق العمل من 17% إلى 30%', target: 30, unit: '%', baseline: 17 },
                    { id: 'HCD-K3', nameAr: 'ابتعاث 150,000 مواطن للدراسة في الخارج', target: 150000, unit: 'مبتعث' },
                    { id: 'HCD-K4', nameAr: 'رفع نسبة المواطنين الحاصلين على تدريب مهني', target: 50, unit: '%' }
                ],
                quranic_ref: { ref: 'القصص:٢٦', text: 'إِنَّ خَيْرَ مَنِ اسْتَأْجَرْتَ الْقَوِيُّ الْأَمِينُ' },
                sheikha_contribution: ['منصة التدريب والتعليم الإلكتروني', 'سوق الوظائف الحلال', 'ربط الباحثين عن عمل بالشركات', 'برامج تطوير المهارات']
            },

            // ── ٦ ──────────────────────────────────────────────
            {
                id: 'NIDLP',
                code: 'NDL',
                nameAr: 'برنامج تطوير الصناعة الوطنية والخدمات اللوجستية (ندلب)',
                nameEn: 'National Industrial Development and Logistics Program (NIDLP)',
                pillar: 'P2',
                maqsad: 'MAL',
                sponsor: 'وزارة الصناعة والثروة المعدنية',
                objective: 'تحويل المملكة لقوة صناعية ومنصة لوجستية عالمية',
                sectors: ['الصناعة', 'التعدين', 'الطاقة', 'اللوجستيات', 'النقل', 'الموانئ'],
                kpis: [
                    { id: 'NDL-K1', nameAr: 'مضاعفة مساهمة الصناعة في الناتج المحلي من 13% إلى 26%', target: 26, unit: '%', baseline: 13 },
                    { id: 'NDL-K2', nameAr: 'رفع الناتج المحلي للقطاع اللوجستي إلى 200 مليار ريال', target: 200, unit: 'مليار ريال' },
                    { id: 'NDL-K3', nameAr: 'ترتيب المملكة ضمن أفضل 25 دولة في مؤشر الأداء اللوجستي', target: 25 },
                    { id: 'NDL-K4', nameAr: 'رفع الصادرات غير النفطية من 16% إلى 50% من الناتج المحلي', target: 50, unit: '%', baseline: 16 }
                ],
                quranic_ref: { ref: 'سبأ:١٨', text: 'وَجَعَلْنَا بَيْنَهُمْ وَبَيْنَ الْقُرَى الَّتِي بَارَكْنَا فِيهَا قُرًى ظَاهِرَةً' },
                sheikha_contribution: ['منظومة اللوجستيات 3PL/4PL', 'ربط الموردين الصناعيين', 'تتبع سلاسل الإمداد', 'سوق المعادن والمواد الخام']
            },

            // ── ٧ ──────────────────────────────────────────────
            {
                id: 'HSTP',
                code: 'HST',
                nameAr: 'برنامج تحول القطاع الصحي',
                nameEn: 'Health Sector Transformation Program',
                pillar: 'P1',
                maqsad: 'NAFS',
                sponsor: 'وزارة الصحة',
                objective: 'تعزيز الصحة العامة وتسهيل الوصول للخدمات الطبية الرقمية',
                sectors: ['الرعاية الصحية', 'الطب الرقمي', 'التأمين الصحي', 'الصناعات الدوائية', 'الصحة الوقائية'],
                kpis: [
                    { id: 'HST-K1', nameAr: 'رفع معدل العمر المتوقع من 74 إلى 80 عاماً', target: 80, unit: 'سنة', baseline: 74 },
                    { id: 'HST-K2', nameAr: 'خفض وفيات الأمهات من 12 إلى 6 لكل 100,000 ولادة', target: 6, unit: '/100k', baseline: 12 },
                    { id: 'HST-K3', nameAr: 'رفع نسبة السكان المغطّين بالتأمين الصحي إلى 100%', target: 100, unit: '%' },
                    { id: 'HST-K4', nameAr: 'رفع نسبة الخدمات الصحية الرقمية إلى 70%', target: 70, unit: '%' }
                ],
                quranic_ref: { ref: 'الشعراء:٨٠', text: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ' },
                sheikha_contribution: ['منصة الصحة الرقمية', 'سوق المستلزمات الطبية', 'ربط مزودي الرعاية الصحية', 'تتبع سلاسل الدواء']
            },

            // ── ٨ ──────────────────────────────────────────────
            {
                id: 'HOUSING',
                code: 'HSG',
                nameAr: 'برنامج الإسكان',
                nameEn: 'Housing Program',
                pillar: 'P3',
                maqsad: 'NAFS',
                sponsor: 'وزارة الشؤون البلدية والقروية والإسكان',
                objective: 'رفع نسبة تملك المواطنين للمساكن لتصل إلى 70%',
                sectors: ['الإسكان', 'البناء', 'التطوير العقاري', 'التمويل السكني', 'التخطيط العمراني'],
                kpis: [
                    { id: 'HSG-K1', nameAr: 'رفع نسبة تملك المساكن من 47% إلى 70%', target: 70, unit: '%', baseline: 47 },
                    { id: 'HSG-K2', nameAr: 'بناء 1,000,000 وحدة سكنية', target: 1000000, unit: 'وحدة' },
                    { id: 'HSG-K3', nameAr: 'خفض وقت الحصول على التراخيص البنائية', target: 1, unit: 'يوم' },
                    { id: 'HSG-K4', nameAr: 'رفع مساهمة القطاع الخاص في الإسكان إلى 60%', target: 60, unit: '%' }
                ],
                quranic_ref: { ref: 'النحل:٨٠', text: 'وَاللَّهُ جَعَلَ لَكُم مِّن بُيُوتِكُمْ سَكَناً' },
                sheikha_contribution: ['منصة العقارات الحلال', 'سوق مواد البناء', 'ربط المطورين والمقاولين', 'أدوات التمويل السكني الإسلامي']
            },

            // ── ٩ ──────────────────────────────────────────────
            {
                id: 'FSDP',
                code: 'FSD',
                nameAr: 'برنامج تطوير القطاع المالي',
                nameEn: 'Financial Sector Development Program',
                pillar: 'P2',
                maqsad: 'MAL',
                sponsor: 'مؤسسة النقد العربي السعودي (ساما)',
                objective: 'تمكين المؤسسات المالية وتطوير السوق المالية السعودية',
                sectors: ['البنوك', 'التأمين', 'سوق الأوراق المالية', 'التمويل الإسلامي', 'فنتك'],
                kpis: [
                    { id: 'FSD-K1', nameAr: 'رفع نسبة المدفوعات غير النقدية من 18% إلى 70%', target: 70, unit: '%', baseline: 18 },
                    { id: 'FSD-K2', nameAr: 'رفع نسبة المؤمّن عليهم من 62% إلى 90%', target: 90, unit: '%', baseline: 62 },
                    { id: 'FSD-K3', nameAr: 'رفع أصول صناعة التأمين الإسلامي بنسبة 100%', target: 100, unit: '% نمو' },
                    { id: 'FSD-K4', nameAr: 'تأسيس منصة بورصة منافسة عالمياً — ضمن أفضل 10 بورصات', target: 10 }
                ],
                quranic_ref: { ref: 'البقرة:٢٨٢', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ' },
                sheikha_contribution: ['منصة الدفع الإلكتروني الحلال', 'ربط البنوك والمؤسسات المالية', 'سوق الصكوك والأوراق المالية الإسلامية', 'تتبع المعاملات المالية الشرعية']
            },

            // ── ١٠ ─────────────────────────────────────────────
            {
                id: 'PRIV',
                code: 'PRV',
                nameAr: 'برنامج التخصيص',
                nameEn: 'Privatization Program',
                pillar: 'P3',
                maqsad: 'MAL',
                sponsor: 'مجلس الشؤون الاقتصادية والتنمية',
                objective: 'تعزيز دور القطاع الخاص في تقديم الخدمات الحكومية',
                sectors: ['الطاقة', 'المياه', 'الصحة', 'التعليم', 'النقل', 'المطارات', 'الموانئ'],
                kpis: [
                    { id: 'PRV-K1', nameAr: 'رفع مساهمة القطاع الخاص في الناتج المحلي من 40% إلى 65%', target: 65, unit: '%', baseline: 40 },
                    { id: 'PRV-K2', nameAr: 'تخصيص أصول حكومية بقيمة 4.5 تريليون ريال', target: 4500, unit: 'مليار ريال' },
                    { id: 'PRV-K3', nameAr: 'تحقيق مستهدفات FDI بـ 5.7% من الناتج المحلي', target: 5.7, unit: '%' },
                    { id: 'PRV-K4', nameAr: 'تطوير بيئة تنظيمية تنافسية عالمياً', target: 'ضمن أفضل 20 دولة' }
                ],
                quranic_ref: { ref: 'يوسف:٥٥', text: 'قَالَ اجْعَلْنِي عَلَىٰ خَزَائِنِ الْأَرْضِ إِنِّي حَفِيظٌ عَلِيمٌ' },
                sheikha_contribution: ['سوق الاستثمار في الشركات المخصصة', 'منصة الشراكات الحكومية الخاصة', 'تحليل الأصول المطروحة للتخصيص', 'ربط المستثمرين بالفرص']
            },

            // ── ١١ ─────────────────────────────────────────────
            {
                id: 'FSP',
                code: 'FSP',
                nameAr: 'برنامج الاستدامة المالية',
                nameEn: 'Fiscal Sustainability Program',
                pillar: 'P3',
                maqsad: 'MAL',
                sponsor: 'وزارة المالية',
                objective: 'ضمان استقرار المالية العامة وتخطيط الإنفاق بكفاءة',
                sectors: ['الميزانية العامة', 'الإيرادات غير النفطية', 'الديون السيادية', 'الإنفاق الحكومي', 'الكفاءة المالية'],
                kpis: [
                    { id: 'FSP-K1', nameAr: 'رفع الإيرادات غير النفطية من 163 مليار إلى 1 تريليون ريال', target: 1000, unit: 'مليار ريال', baseline: 163 },
                    { id: 'FSP-K2', nameAr: 'الوصول إلى ميزانية متوازنة مستدامة', target: 'توازن مستدام' },
                    { id: 'FSP-K3', nameAr: 'خفض نسبة الدين العام إلى 30% من الناتج المحلي', target: 30, unit: '%' },
                    { id: 'FSP-K4', nameAr: 'ترشيد الإنفاق الحكومي بتوفير 200 مليار ريال', target: 200, unit: 'مليار ريال' }
                ],
                quranic_ref: { ref: 'الفرقان:٦٧', text: 'وَالَّذِينَ إِذَا أَنفَقُوا لَمْ يُسْرِفُوا وَلَمْ يَقْتُرُوا وَكَانَ بَيْنَ ذَٰلِكَ قَوَامًا' },
                sheikha_contribution: ['تحليل الميزانية والإيرادات', 'منصة الشفافية المالية', 'ربط الجهات برقابة الإنفاق', 'نماذج الاستدامة المالية الإسلامية']
            }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // المستهدفات الرقمية الكبرى بحلول ٢٠٣٠
    // ══════════════════════════════════════════════════════════
    _initTargets() {
        return {
            nameAr: 'المستهدفات الرقمية الكبرى بحلول ٢٠٣٠',
            nameEn: 'Key Quantitative Targets by 2030',
            categories: [
                {
                    id: 'ECONOMY',
                    nameAr: 'الاقتصاد الوطني',
                    targets: [
                        { id: 'T-E1', nameAr: 'الاقتصاد', detail: 'الأولى عالمياً كأكبر اقتصاد', kpi: 'GLOBAL_ECONOMY_RANK', target: 1, baseline: null, unit: 'ترتيب عالمي', maqsad: 'MAL', quranic_ref: { ref: 'الرعد:١١', text: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ' } },
                        { id: 'T-E2', nameAr: 'الناتج المحلي', detail: 'رفع الناتج المحلي إلى 5 تريليون ريال', kpi: 'GDP_SAR', target: 5000, unit: 'مليار ريال', maqsad: 'MAL' },
                        { id: 'T-E3', nameAr: 'الإيرادات غير النفطية', detail: 'رفع الإيرادات من 163 مليار إلى 1 تريليون ريال', kpi: 'NON_OIL_REVENUE', target: 1000, baseline: 163, unit: 'مليار ريال', maqsad: 'MAL' },
                        { id: 'T-E4', nameAr: 'القطاع الخاص', detail: 'رفع مساهمة القطاع الخاص في الناتج المحلي من 40% إلى 65%', kpi: 'PRIVATE_SECTOR_GDP', target: 65, baseline: 40, unit: '%', maqsad: 'MAL' }
                    ]
                },
                {
                    id: 'UNEMPLOYMENT',
                    nameAr: 'البطالة والتوظيف',
                    targets: [
                        { id: 'T-U1', nameAr: 'البطالة', detail: 'خفض معدل البطالة من 11.6% إلى 7% (هدف رؤية ٢٠٣٠) وصولاً للقضاء عليها', kpi: 'UNEMPLOYMENT_RATE', target: 7, extreme_target: 0, baseline: 11.6, unit: '%', maqsad: 'MAL', sheikha_role: 'ربط الباحثين عن عمل بالشركات — سوق العمل الحلال' },
                        { id: 'T-U2', nameAr: 'توطين الوظائف', detail: 'رفع السعودة من 24% إلى 45%', kpi: 'SAUDIZATION', target: 45, baseline: 24, unit: '%', maqsad: 'MAL' },
                        { id: 'T-U3', nameAr: 'مشاركة المرأة', detail: 'رفع مشاركة المرأة في سوق العمل من 17% إلى 30%', kpi: 'WOMEN_WORKFORCE', target: 30, baseline: 17, unit: '%', maqsad: 'NASL' }
                    ]
                },
                {
                    id: 'EXPORTS',
                    nameAr: 'الصادرات والتجارة',
                    targets: [
                        { id: 'T-X1', nameAr: 'الصادرات غير النفطية', detail: 'رفع الصادرات غير النفطية من 16% إلى 50% من الناتج المحلي غير النفطي', kpi: 'NON_OIL_EXPORTS_RATIO', target: 50, extreme_target: 100, baseline: 16, unit: '%', maqsad: 'MAL', sheikha_role: 'منصة التصدير الحلال — ربط المنتجين السعوديين بالأسواق العالمية' },
                        { id: 'T-X2', nameAr: 'الاستثمار الأجنبي المباشر', detail: 'رفع الاستثمار الأجنبي المباشر من 3.8% إلى 5.7% من الناتج المحلي', kpi: 'FDI_RATIO', target: 5.7, baseline: 3.8, unit: '%', maqsad: 'MAL' },
                        { id: 'T-X3', nameAr: 'المنافذ اللوجستية', detail: 'ترتيب المملكة ضمن أفضل 25 دولة في مؤشر الأداء اللوجستي', kpi: 'LOGISTICS_RANK', target: 25, maqsad: 'MAL' }
                    ]
                },
                {
                    id: 'TOURISM',
                    nameAr: 'السياحة والضيافة',
                    targets: [
                        { id: 'T-T1', nameAr: 'المعتمرون', detail: 'زيادة المعتمرين السنوي من 8 ملايين إلى مليار معتمر', kpi: 'UMRAH_PILGRIMS_ANNUAL', target: 1000000000, baseline: 8000000, unit: 'معتمر/سنة', maqsad: 'DIN', sheikha_role: 'منصة خدمات الحج والعمرة والتجارة الدينية' },
                        { id: 'T-T2', nameAr: 'السياحة الدولية', detail: 'استقطاب 150 مليون زيارة سياحية سنوياً', kpi: 'INTERNATIONAL_TOURISTS', target: 150000000, unit: 'زيارة/سنة', maqsad: 'MAL' },
                        { id: 'T-T3', nameAr: 'مساهمة السياحة في الناتج', detail: 'رفع مساهمة السياحة من 3% إلى 10% من الناتج المحلي', kpi: 'TOURISM_GDP', target: 10, baseline: 3, unit: '%', maqsad: 'MAL' }
                    ]
                },
                {
                    id: 'DIGITAL',
                    nameAr: 'التحول الرقمي',
                    targets: [
                        { id: 'T-D1', nameAr: 'الحكومة الرقمية', detail: 'الوصول لأفضل 5 حكومات رقمية في العالم', kpi: 'EGOV_RANK', target: 5, maqsad: 'ARD' },
                        { id: 'T-D2', nameAr: 'المدفوعات الرقمية', detail: 'رفع نسبة المدفوعات غير النقدية من 18% إلى 70%', kpi: 'CASHLESS_PAYMENTS', target: 70, baseline: 18, unit: '%', maqsad: 'MAL' },
                        { id: 'T-D3', nameAr: 'الاقتصاد الرقمي', detail: 'رفع مساهمة الاقتصاد الرقمي في الناتج المحلي إلى 24%', kpi: 'DIGITAL_ECONOMY_GDP', target: 24, unit: '%', maqsad: 'AQL' }
                    ]
                },
                {
                    id: 'HOUSING_T',
                    nameAr: 'الإسكان والعمران',
                    targets: [
                        { id: 'T-H1', nameAr: 'تملك المساكن', detail: 'رفع نسبة تملك المساكن من 47% إلى 70%', kpi: 'HOME_OWNERSHIP', target: 70, baseline: 47, unit: '%', maqsad: 'NAFS' },
                        { id: 'T-H2', nameAr: 'الوحدات السكنية', detail: 'بناء 1,000,000 وحدة سكنية', kpi: 'HOUSING_UNITS', target: 1000000, unit: 'وحدة', maqsad: 'NAFS' }
                    ]
                },
                {
                    id: 'ENVIRONMENT',
                    nameAr: 'البيئة والاستدامة',
                    targets: [
                        { id: 'T-ENV1', nameAr: 'صافي الانبعاثات', detail: 'الوصول إلى صافي انبعاثات صفري بحلول ٢٠٦٠', kpi: 'CARBON_NET_ZERO', target: 2060, unit: 'سنة هدف', maqsad: 'ARD', quranic_ref: { ref: 'الأعراف:٥٦', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا' } },
                        { id: 'T-ENV2', nameAr: 'الطاقة المتجددة', detail: 'رفع نسبة الطاقة المتجددة إلى 50% من مزيج الطاقة', kpi: 'RENEWABLE_ENERGY', target: 50, unit: '%', maqsad: 'ARD' },
                        { id: 'T-ENV3', nameAr: 'زراعة الأشجار', detail: 'زراعة 10 مليار شجرة (مبادرة السعودية الخضراء)', kpi: 'TREES_PLANTED', target: 10000000000, unit: 'شجرة', maqsad: 'ARD' }
                    ]
                }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // مساهمة شيخة في رؤية ٢٠٣٠
    // ══════════════════════════════════════════════════════════
    _initSheikhaAlignment() {
        return {
            title: 'مساهمة منظومة شيخة في رؤية ٢٠٣٠',
            consultant: 'سلمان أحمد الراجح — مستشار دولي',
            principles: [
                { ref: 'البقرة:٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', application: 'جميع المنصات المالية في شيخة شرعية إسلامياً' },
                { ref: 'التوبة:١٠٣', text: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا', application: 'نظام الزكاة مدمج في محرك المالية' },
                { ref: 'الحشر:١٨', text: 'وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ', application: 'التخطيط الاستراتيجي طويل المدى — رؤية ٢٠٣٠' }
            ],
            contributions: {
                economy: ['سوق التجارة الإلكترونية الحلال', 'تحليل الأسواق الاقتصادية', 'ربط الموردين والمشترين', 'منصة الاستثمار الإسلامي'],
                employment: ['سوق الوظائف الحلال', 'ربط الباحثين عن عمل بالشركات', 'برامج تطوير المهارات', 'توطين التقنية'],
                exports: ['منصة التصدير العالمي', 'شبكة التوزيع الإقليمي', 'الشراكات التجارية الدولية', 'خدمات الجمارك والامتثال'],
                tourism: ['خدمات الحج والعمرة الرقمية', 'سوق السياحة الحلال', 'ربط مزودي الضيافة', 'تجارة المنتجات الدينية'],
                digital: ['بنية تحتية رقمية متكاملة', 'الذكاء الاصطناعي الإسلامي', 'ربط المنصات الحكومية', 'تحليل البيانات الاقتصادية']
            },
            maqasidAlignment: {
                DIN: 'حفظ الدين — التجارة الإسلامية الحلال',
                NAFS: 'حفظ النفس — جودة الحياة والصحة',
                AQL: 'حفظ العقل — التعليم والابتكار',
                NASL: 'حفظ النسل — بناء الأسرة والمجتمع',
                MAL: 'حفظ المال — الاقتصاد المزدهر والعادل',
                ARD: 'حفظ الأرض — الاستدامة والوطن الطموح'
            }
        };
    }

    // ══════════════════════════════════════════════════════════
    // جلب برنامج بالمعرف
    // ══════════════════════════════════════════════════════════
    getProgramById(id) {
        return this.programs.find(p => p.id === id || p.code === id) || null;
    }

    // ══════════════════════════════════════════════════════════
    // جلب البرامج بالركيزة
    // ══════════════════════════════════════════════════════════
    getProgramsByPillar(pillarId) {
        return this.programs.filter(p => p.pillar === pillarId);
    }

    // ══════════════════════════════════════════════════════════
    // جلب البرامج بالمقصد
    // ══════════════════════════════════════════════════════════
    getProgramsByMaqsad(maqsad) {
        return this.programs.filter(p => p.maqsad === maqsad.toUpperCase());
    }

    // ══════════════════════════════════════════════════════════
    // لوحة التحكم الرئيسية
    // ══════════════════════════════════════════════════════════
    getDashboard() {
        const totalKpis = this.programs.reduce((s, p) => s + p.kpis.length, 0);
        const totalTargets = this.targets.categories.reduce((s, c) => s + c.targets.length, 0);

        return {
            success: true,
            message: 'برامج رؤية المملكة ٢٠٣٠ — شيخة',
            vision: this.vision,
            summary: {
                totalPrograms: this.programs.length,
                totalKpis,
                totalTargetCategories: this.targets.categories.length,
                totalTargets,
                pillars: {
                    P1: { nameAr: 'مجتمع حيوي', count: this.getProgramsByPillar('P1').length },
                    P2: { nameAr: 'اقتصاد مزدهر', count: this.getProgramsByPillar('P2').length },
                    P3: { nameAr: 'وطن طموح', count: this.getProgramsByPillar('P3').length }
                },
                maqasid: {
                    DIN: this.getProgramsByMaqsad('DIN').length,
                    NAFS: this.getProgramsByMaqsad('NAFS').length,
                    AQL: this.getProgramsByMaqsad('AQL').length,
                    NASL: this.getProgramsByMaqsad('NASL').length,
                    MAL: this.getProgramsByMaqsad('MAL').length,
                    ARD: this.getProgramsByMaqsad('ARD').length
                }
            },
            programs: this.programs.map(p => ({
                id: p.id,
                code: p.code,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                pillar: p.pillar,
                maqsad: p.maqsad,
                sponsor: p.sponsor,
                objective: p.objective,
                kpiCount: p.kpis.length,
                sheikha_contribution: p.sheikha_contribution
            })),
            keyTargets: {
                economy: { rank: 1, detail: 'الأولى عالمياً كأكبر اقتصاد' },
                unemployment: { target: 0, baseline: 11.6, detail: 'القضاء على البطالة' },
                nonOilExports: { target: 100, baseline: 16, unit: '%', detail: 'رفع الصادرات غير النفطية' },
                tourism: { target: 1000000000, baseline: 8000000, unit: 'معتمر', detail: 'مليار معتمر سنوياً' }
            },
            sheikhaAlignment: this.sheikhaAlignment
        };
    }
}

module.exports = SheikhaVision2030Programs;
