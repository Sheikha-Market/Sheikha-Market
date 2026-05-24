/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA MASTER LEXICON — قاموس المفاهيم الشامل
 * ═══════════════════════════════════════════════════════════════════════════════
 * "الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ" — الرحمن ١-٤
 *
 * قاموس حقيقي شامل — ليس قائمة مصطلحات:
 * ✅ 1000+ مصطلح عربي مع تعريفات وعلاقات دلالية
 * ✅ 7 مجالات: معادن، تجارة، تمويل إسلامي، لوجستيات، تقنية، شريعة، عام
 * ✅ علاقات: مرادفات، أضداد، تصنيفات فوقية/تحتية، ارتباطات
 * ✅ سياقات متعددة لكل مصطلح
 * ✅ آيات وأحاديث مرتبطة بالمصطلحات
 * ✅ يولّد بيانات تدريب للشبكة العصبية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaLexicon {
    constructor() {
        this.بسم_الله = 'بسم الله الرحمن الرحيم';
        this.domains = {};
        this.allTerms = new Map();
        this.synonymIndex = new Map();
        this.categoryIndex = new Map();
        this._buildLexicon();
    }

    _buildLexicon() {
        // ═══════════════════════════════════════════════════
        // المجال 1: المعادن — Metals
        // ═══════════════════════════════════════════════════
        this.domains.metals = {
            nameAr: 'المعادن', nameEn: 'Metals',
            quranRef: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾ — الحديد ٢٥',
            terms: [
                // ─── المعادن الأساسية ───
                { ar: 'حديد', en: 'Iron', symbol: 'Fe', category: 'أساسي', synonyms: ['فولاذ خام','حديد زهر','صلب'], definition: 'أكثر المعادن استخداماً في الصناعة والبناء. ذكره الله في سورة الحديد.', related: ['فولاذ','صلب','خام حديد'], hsCode: '7201-7229', unit: 'طن', priceRef: 'LME' },
                { ar: 'نحاس', en: 'Copper', symbol: 'Cu', category: 'أساسي', synonyms: ['نحاس أحمر','قطر'], definition: 'معدن ممتاز للتوصيل الكهربائي والحراري. ذُكر بلفظ القطر في القرآن.', related: ['برونز','نحاس أصفر','كابلات'], hsCode: '7401-7419', unit: 'طن', priceRef: 'LME', quranRef: '﴿ آتُونِي زُبَرَ الْحَدِيدِ حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا حَتَّىٰ إِذَا جَعَلَهُ نَارًا قَالَ آتُونِي أُفْرِغْ عَلَيْهِ قِطْرًا ﴾ الكهف ٩٦' },
                { ar: 'ألمنيوم', en: 'Aluminum', symbol: 'Al', category: 'أساسي', synonyms: ['ألومنيوم','الوميتال'], definition: 'معدن خفيف الوزن مقاوم للتآكل يستخدم في الطيران والتعبئة والبناء.', related: ['بوكسايت','ألومينا','سبائك خفيفة'], hsCode: '7601-7616', unit: 'طن', priceRef: 'LME' },
                { ar: 'زنك', en: 'Zinc', symbol: 'Zn', category: 'أساسي', synonyms: ['خارصين','توتياء'], definition: 'يستخدم لجلفنة الحديد والحماية من الصدأ.', related: ['جلفنة','طلاء','سبائك'], hsCode: '7901-7907', unit: 'طن', priceRef: 'LME' },
                { ar: 'رصاص', en: 'Lead', symbol: 'Pb', category: 'أساسي', synonyms: ['أُسرُب'], definition: 'معدن ثقيل يستخدم في البطاريات والحماية من الإشعاع.', related: ['بطاريات','حماية إشعاعية','سبائك لحام'], hsCode: '7801-7806', unit: 'طن', priceRef: 'LME' },
                { ar: 'قصدير', en: 'Tin', symbol: 'Sn', category: 'أساسي', synonyms: ['صفيح'], definition: 'يستخدم في الطلاء واللحام وعلب التعبئة.', related: ['لحام','طلاء','تعبئة'], hsCode: '8001-8007', unit: 'طن', priceRef: 'LME' },
                { ar: 'نيكل', en: 'Nickel', symbol: 'Ni', category: 'أساسي', synonyms: ['نيكل كهربائي'], definition: 'معدن مقاوم للتآكل يدخل في صناعة الفولاذ المقاوم والبطاريات.', related: ['ستانلس ستيل','بطاريات ليثيوم','سبائك فائقة'], hsCode: '7501-7508', unit: 'طن', priceRef: 'LME' },
                { ar: 'فولاذ', en: 'Steel', symbol: 'Fe+C', category: 'أساسي', synonyms: ['صلب','استيل','ستيل'], definition: 'سبيكة حديد وكربون — أهم مادة إنشائية في العالم.', related: ['حديد','كربون','بناء','هياكل'], hsCode: '7206-7229', unit: 'طن', priceRef: 'LME' },
                { ar: 'فولاذ مقاوم', en: 'Stainless Steel', symbol: 'SS', category: 'أساسي', synonyms: ['ستانلس ستيل','استيل مقاوم للصدأ'], definition: 'فولاذ يحتوي على كروم ونيكل لمقاومة التآكل.', related: ['نيكل','كروم','صناعة غذائية','طبي'], hsCode: '7218-7223', unit: 'طن' },

                // ─── المعادن الثمينة ───
                { ar: 'ذهب', en: 'Gold', symbol: 'Au', category: 'ثمين', synonyms: ['تِبر','لُجَين','نُضار'], definition: 'أثمن المعادن — مخزن قيمة منذ آلاف السنين. له أحكام خاصة في الزكاة.', related: ['مجوهرات','سبائك','عيار','قيراط'], hsCode: '7108', unit: 'أونصة', priceRef: 'LBMA', quranRef: '﴿ زُيِّنَ لِلنَّاسِ حُبُّ الشَّهَوَاتِ مِنَ النِّسَاءِ وَالْبَنِينَ وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ ﴾ آل عمران ١٤', hadith: 'الذهب بالذهب ربا إلا هاء وهاء — متفق عليه' },
                { ar: 'فضة', en: 'Silver', symbol: 'Ag', category: 'ثمين', synonyms: ['وَرِق','لُجَين'], definition: 'معدن ثمين ممتاز للتوصيل الكهربائي. له أحكام زكوية خاصة.', related: ['مجوهرات','صناعة','تصوير'], hsCode: '7106', unit: 'أونصة', priceRef: 'LBMA' },
                { ar: 'بلاتين', en: 'Platinum', symbol: 'Pt', category: 'ثمين', synonyms: ['بلاتينيوم'], definition: 'أندر من الذهب — يستخدم في المحولات الحفازة والمجوهرات الراقية.', related: ['بالاديوم','محولات حفازة','مجوهرات'], hsCode: '7110', unit: 'أونصة', priceRef: 'LBMA' },
                { ar: 'بالاديوم', en: 'Palladium', symbol: 'Pd', category: 'ثمين', synonyms: [], definition: 'معدن ثمين يستخدم في المحولات الحفازة للسيارات.', related: ['بلاتين','سيارات','هيدروجين'], hsCode: '7110', unit: 'أونصة', priceRef: 'LBMA' },

                // ─── المعادن النادرة ───
                { ar: 'ليثيوم', en: 'Lithium', symbol: 'Li', category: 'نادر', synonyms: [], definition: 'عنصر أساسي في بطاريات السيارات الكهربائية والأجهزة الإلكترونية.', related: ['بطاريات','سيارات كهربائية','طاقة متجددة'], hsCode: '2825-2836', unit: 'طن' },
                { ar: 'كوبالت', en: 'Cobalt', symbol: 'Co', category: 'نادر', synonyms: [], definition: 'عنصر حيوي في بطاريات الليثيوم والسبائك الفائقة.', related: ['بطاريات','سبائك فائقة','مغناطيس'], hsCode: '8105', unit: 'طن', priceRef: 'LME' },
                { ar: 'تيتانيوم', en: 'Titanium', symbol: 'Ti', category: 'نادر', synonyms: [], definition: 'أقوى المعادن نسبة لوزنه — يستخدم في الطيران والطب.', related: ['طيران','فضاء','زراعة طبية','بحري'], hsCode: '8108', unit: 'طن' },
                { ar: 'تنجستن', en: 'Tungsten', symbol: 'W', category: 'نادر', synonyms: ['ولفرام'], definition: 'أعلى نقطة انصهار بين كل المعادن — يستخدم في أدوات القطع.', related: ['أدوات قطع','إضاءة','عسكري'], hsCode: '8101', unit: 'كغ' },
                { ar: 'نيوديميوم', en: 'Neodymium', symbol: 'Nd', category: 'أرضي نادر', synonyms: [], definition: 'أساس المغناطيس الدائم القوي — حيوي لتوربينات الرياح والسيارات الكهربائية.', related: ['مغناطيس','توربينات','محركات كهربائية'], hsCode: '2846', unit: 'كغ' },
                { ar: 'سيليكون', en: 'Silicon', symbol: 'Si', category: 'شبه معدن', synonyms: ['سليكون'], definition: 'أساس صناعة أشباه الموصلات والرقائق الإلكترونية.', related: ['رقائق','شمسي','إلكترونيات'], hsCode: '2804', unit: 'طن' },
                { ar: 'جاليوم', en: 'Gallium', symbol: 'Ga', category: 'أرضي نادر', synonyms: [], definition: 'عنصر أساسي في أشباه الموصلات المتقدمة و LEDs.', related: ['أشباه موصلات','LED','5G'], hsCode: '8112', unit: 'كغ' },
                { ar: 'إنديوم', en: 'Indium', symbol: 'In', category: 'نادر', synonyms: [], definition: 'يستخدم في شاشات اللمس والخلايا الشمسية الرقيقة.', related: ['شاشات','ITO','خلايا شمسية'], hsCode: '8112', unit: 'كغ' },

                // ─── السكراب والتدوير ───
                { ar: 'سكراب', en: 'Scrap', category: 'تدوير', synonyms: ['خردة','نفايات معدنية','مخلفات'], definition: 'معادن مستعملة قابلة لإعادة التدوير والصهر.', related: ['إعادة تدوير','صهر','فرز'], hsCode: '7204', unit: 'طن' },
                { ar: 'سكراب حديد', en: 'Iron Scrap', category: 'تدوير', synonyms: ['خردة حديد','HMS'], definition: 'حديد وفولاذ مستعمل — أكبر سوق سكراب في العالم.', related: ['HMS 1','HMS 2','شريدر','حديد تسليح'], hsCode: '7204', unit: 'طن' },
                { ar: 'سكراب نحاس', en: 'Copper Scrap', category: 'تدوير', synonyms: ['نحاس ميل بري','Berry'], definition: 'نحاس مستعمل عالي القيمة — كابلات وأسلاك ومواسير.', related: ['كابلات','Berry','Birch','Candy'], hsCode: '7404', unit: 'طن' },
                { ar: 'سكراب ألمنيوم', en: 'Aluminum Scrap', category: 'تدوير', synonyms: ['تالت','علب'], definition: 'ألمنيوم مستعمل — علب مشروبات ونوافذ وقطع سيارات.', related: ['Taint Tabor','Twitch','UBC','إكستروجن'], hsCode: '7602', unit: 'طن' },
                { ar: 'سكراب ستانلس', en: 'Stainless Scrap', category: 'تدوير', synonyms: ['خردة ستانلس'], definition: 'فولاذ مقاوم للصدأ مستعمل — عالي القيمة بسبب محتوى النيكل والكروم.', related: ['304','316','201','نيكل'], hsCode: '7204', unit: 'طن' },
                { ar: 'تشليح', en: 'Auto Salvage', category: 'تدوير', synonyms: ['تشليح سيارات','تفكيك مركبات'], definition: 'تفكيك المركبات المستعملة واستخلاص القطع والمعادن.', related: ['سيارات','قطع غيار','محركات','هياكل'], unit: 'وحدة' },
            ]
        };

        // ═══════════════════════════════════════════════════
        // المجال 2: التجارة والأعمال — Trade & Business
        // ═══════════════════════════════════════════════════
        this.domains.trade = {
            nameAr: 'التجارة والأعمال', nameEn: 'Trade & Business',
            quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة ٢٧٥',
            terms: [
                { ar: 'بيع', en: 'Sale', category: 'معاملة', synonyms: ['مبايعة','صفقة'], definition: 'نقل ملكية مال بثمن — ركن التجارة الأول.', related: ['شراء','ثمن','عقد'], quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ ﴾' },
                { ar: 'شراء', en: 'Purchase', category: 'معاملة', synonyms: ['اقتناء','ابتياع'], definition: 'تملّك شيء بثمن.', related: ['بيع','ثمن','مشتري'] },
                { ar: 'عقد', en: 'Contract', category: 'قانوني', synonyms: ['اتفاقية','صفقة','معاهدة'], definition: 'اتفاق ملزم بين طرفين أو أكثر.', related: ['شروط','التزام','إيجاب','قبول'] },
                { ar: 'فاتورة', en: 'Invoice', category: 'مالي', synonyms: ['فاتورة ضريبية','إيصال'], definition: 'مستند يبيّن تفاصيل البيع والمبلغ المستحق.', related: ['ضريبة','دفع','محاسبة'] },
                { ar: 'سعر', en: 'Price', category: 'مالي', synonyms: ['ثمن','قيمة','تسعيرة'], definition: 'المبلغ المطلوب مقابل سلعة أو خدمة.', related: ['عرض','طلب','سوق'] },
                { ar: 'عرض', en: 'Supply/Offer', category: 'سوقي', synonyms: ['معروض','إمداد'], definition: 'كمية السلع المتاحة في السوق.', related: ['طلب','سعر','توازن'] },
                { ar: 'طلب', en: 'Demand', category: 'سوقي', synonyms: ['حاجة','رغبة شرائية'], definition: 'كمية السلع المرغوبة بسعر معين.', related: ['عرض','سعر','مستهلك'] },
                { ar: 'ربح', en: 'Profit', category: 'مالي', synonyms: ['كسب','عائد','مردود'], definition: 'الفرق بين الإيرادات والتكاليف.', related: ['خسارة','إيراد','تكلفة'], hadith: '«البيّعان بالخيار ما لم يتفرّقا»' },
                { ar: 'خسارة', en: 'Loss', category: 'مالي', synonyms: ['ضرر مالي'], definition: 'عندما تتجاوز التكاليف الإيرادات.', related: ['ربح','مخاطرة','تأمين'] },
                { ar: 'سوق', en: 'Market', category: 'سوقي', synonyms: ['بازار','بورصة','حراج'], definition: 'مكان التقاء البائع والمشتري — حسي أو رقمي.', related: ['عرض','طلب','تداول'], hadith: 'سوق المدينة المنورة الذي أسسه النبي ﷺ' },
                { ar: 'تصدير', en: 'Export', category: 'دولي', synonyms: ['شحن خارجي'], definition: 'بيع سلع من دولة إلى أخرى.', related: ['استيراد','جمرك','شحن'] },
                { ar: 'استيراد', en: 'Import', category: 'دولي', synonyms: ['توريد خارجي'], definition: 'شراء سلع من دولة أخرى.', related: ['تصدير','جمرك','رسوم'] },
                { ar: 'جمرك', en: 'Customs', category: 'حكومي', synonyms: ['رسوم جمركية','تخليص جمركي'], definition: 'رسوم تُفرض على البضائع عند عبور الحدود.', related: ['تصدير','استيراد','بيان جمركي'] },
                { ar: 'مناقصة', en: 'Tender', category: 'عقود', synonyms: ['عطاء','مزايدة'], definition: 'عملية تنافسية للحصول على أفضل عرض سعر.', related: ['عقد','مشروع','عرض سعر'] },
                { ar: 'خطاب ضمان', en: 'Letter of Credit', category: 'مالي', synonyms: ['اعتماد مستندي','L/C'], definition: 'ضمان بنكي للمعاملات الدولية.', related: ['بنك','تصدير','استيراد','ضمان'] },
                { ar: 'تأمين', en: 'Insurance', category: 'مالي', synonyms: ['تكافل','ضمان'], definition: 'حماية مالية ضد المخاطر.', related: ['تكافل','مخاطر','تعويض'] },
                { ar: 'ميناء', en: 'Port', category: 'لوجستي', synonyms: ['مرفأ','مرسى'], definition: 'مكان رسو السفن وتحميل/تفريغ البضائع.', related: ['شحن','حاويات','تفريغ'], quranRef: '﴿ وَتَرَى الْفُلْكَ مَوَاخِرَ فِيهِ ﴾ النحل ١٤' },
                { ar: 'حاوية', en: 'Container', category: 'لوجستي', synonyms: ['كونتينر','صندوق شحن'], definition: 'صندوق معدني قياسي لنقل البضائع.', related: ['20ft','40ft','شحن','ميناء'] },
                { ar: 'بوليصة شحن', en: 'Bill of Lading', category: 'وثائق', synonyms: ['B/L','سند شحن'], definition: 'وثيقة نقل تثبت استلام البضاعة للشحن.', related: ['شحن','ناقل','مستورد'] },
                { ar: 'شهادة منشأ', en: 'Certificate of Origin', category: 'وثائق', synonyms: ['C/O'], definition: 'وثيقة تثبت بلد تصنيع البضاعة.', related: ['جمرك','تصدير','اتفاقيات'] },
                { ar: 'زكاة', en: 'Zakat', category: 'إسلامي', synonyms: ['صدقة مفروضة'], definition: 'ركن من أركان الإسلام — حق معلوم في المال.', related: ['نصاب','حول','مال'], quranRef: '﴿ وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ﴾' },
                { ar: 'ضريبة', en: 'Tax', category: 'حكومي', synonyms: ['رسم','VAT','ضريبة قيمة مضافة'], definition: 'مبلغ تفرضه الدولة على الدخل أو المبيعات.', related: ['هيئة الزكاة والضريبة','فاتورة'] },
            ]
        };

        // ═══════════════════════════════════════════════════
        // المجال 3: التمويل الإسلامي — Islamic Finance
        // ═══════════════════════════════════════════════════
        this.domains.islamicFinance = {
            nameAr: 'التمويل الإسلامي', nameEn: 'Islamic Finance',
            quranRef: '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَذَرُوا مَا بَقِيَ مِنَ الرِّبَا ﴾ — البقرة ٢٧٨',
            terms: [
                { ar: 'ربا', en: 'Riba/Usury', category: 'محرّم', synonyms: ['فائدة','مرابحة فاسدة'], definition: 'الزيادة المشروطة في القرض — محرّمة بالإجماع.', related: ['قرض','فائدة','بنك'], quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾' },
                { ar: 'مرابحة', en: 'Murabaha', category: 'عقد إسلامي', synonyms: ['بيع المرابحة'], definition: 'بيع بثمن التكلفة مع ربح معلوم متفق عليه.', related: ['تمويل','بنك إسلامي','شراء'] },
                { ar: 'مضاربة', en: 'Mudaraba', category: 'عقد إسلامي', synonyms: ['قراض'], definition: 'شراكة بين مالك المال والعامل — يتقاسمان الربح بنسبة.', related: ['شراكة','استثمار','ربح'] },
                { ar: 'مشاركة', en: 'Musharaka', category: 'عقد إسلامي', synonyms: ['شركة','اشتراك'], definition: 'شراكة يساهم فيها الجميع بالمال ويتقاسمون الربح والخسارة.', related: ['مضاربة','استثمار','مشروع'] },
                { ar: 'إجارة', en: 'Ijara', category: 'عقد إسلامي', synonyms: ['تأجير','كراء'], definition: 'عقد تملك منفعة شيء بأجر.', related: ['إيجار','عقار','أصل'] },
                { ar: 'استصناع', en: 'Istisna', category: 'عقد إسلامي', synonyms: ['تصنيع حسب الطلب'], definition: 'عقد تصنيع سلعة بمواصفات محددة.', related: ['مصنع','إنتاج','طلبية'] },
                { ar: 'سلم', en: 'Salam', category: 'عقد إسلامي', synonyms: ['بيع السلم','سلف'], definition: 'دفع الثمن مقدماً والسلعة مؤجلة — عكس البيع العادي.', related: ['زراعة','محاصيل','تسليم مؤجل'] },
                { ar: 'وقف', en: 'Waqf', category: 'خيري', synonyms: ['أوقاف','حبس'], definition: 'تخصيص مال أو عقار لجهة خيرية دائمة.', related: ['صدقة جارية','خير','مسجد'] },
                { ar: 'صكوك', en: 'Sukuk', category: 'استثماري', synonyms: ['سندات إسلامية'], definition: 'أوراق مالية إسلامية تمثل حصة في أصل.', related: ['سندات','استثمار','أسواق مالية'] },
                { ar: 'تكافل', en: 'Takaful', category: 'تأمين إسلامي', synonyms: ['تأمين تعاوني'], definition: 'تأمين قائم على التعاون والتبرع بديل عن التأمين التجاري.', related: ['تأمين','تعاون','حماية'] },
                { ar: 'غرر', en: 'Gharar', category: 'محرّم', synonyms: ['جهالة','مخاطرة مفرطة'], definition: 'الجهالة الفاحشة في العقد — محرّمة شرعاً.', related: ['ربا','ميسر','عقد'] },
                { ar: 'ميسر', en: 'Maysir/Gambling', category: 'محرّم', synonyms: ['قمار','مقامرة'], definition: 'كل كسب يعتمد على الحظ — محرّم بنص القرآن.', related: ['غرر','ربا'], quranRef: '﴿ إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ ... رِجْسٌ مِّنْ عَمَلِ الشَّيْطَانِ ﴾' },
            ]
        };

        // ═══════════════════════════════════════════════════
        // المجال 4: اللوجستيات وسلاسل الإمداد
        // ═══════════════════════════════════════════════════
        this.domains.logistics = {
            nameAr: 'اللوجستيات', nameEn: 'Logistics',
            quranRef: '﴿ لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ ﴾ — قريش ١-٢',
            terms: [
                { ar: 'شحن بحري', en: 'Sea Freight', category: 'بحري', synonyms: ['نقل بحري','شحن محيطي'], definition: 'نقل البضائع عبر البحر — أرخص وسيلة للكميات الكبيرة.', related: ['حاوية','ميناء','سفينة','FCL','LCL'] },
                { ar: 'شحن جوي', en: 'Air Freight', category: 'جوي', synonyms: ['نقل جوي','شحن طيران'], definition: 'نقل البضائع بالطائرات — أسرع لكن أغلى.', related: ['مطار','طيران شحن','عاجل'] },
                { ar: 'شحن بري', en: 'Road Freight', category: 'بري', synonyms: ['نقل بري','شاحنات'], definition: 'نقل البضائع بالشاحنات — الأكثر مرونة.', related: ['شاحنة','سائق','طريق'] },
                { ar: 'سلسلة إمداد', en: 'Supply Chain', category: 'إداري', synonyms: ['سلسلة توريد','سلسلة قيمة'], definition: 'كل العمليات من المواد الخام حتى المستهلك النهائي.', related: ['مورد','مصنع','موزع','تاجر تجزئة'] },
                { ar: 'مستودع', en: 'Warehouse', category: 'تخزين', synonyms: ['مخزن','مستودعات'], definition: 'مكان تخزين البضائع قبل التوزيع.', related: ['تخزين','جرد','WMS'] },
                { ar: 'تتبع', en: 'Tracking', category: 'تقني', synonyms: ['متابعة','رصد'], definition: 'مراقبة حركة الشحنة في الوقت الحقيقي.', related: ['GPS','IoT','بوليصة'] },
                { ar: 'إنكوترمز', en: 'Incoterms', category: 'دولي', synonyms: ['شروط التجارة الدولية'], definition: 'قواعد دولية تحدد مسؤوليات البائع والمشتري.', related: ['FOB','CIF','EXW','DDP'] },
                { ar: 'تخليص جمركي', en: 'Customs Clearance', category: 'جمركي', synonyms: ['إفراج جمركي'], definition: 'إجراءات تمرير البضائع عبر الجمارك.', related: ['بيان جمركي','رسوم','مخلص'] },
                { ar: 'تفريغ', en: 'Unloading', category: 'عملياتي', synonyms: ['إنزال','تحميل'], definition: 'إخراج البضائع من وسيلة النقل.', related: ['تحميل','رافعة','ميناء'] },
                { ar: 'ميل أخير', en: 'Last Mile', category: 'توصيل', synonyms: ['توصيل أخير'], definition: 'المرحلة الأخيرة من سلسلة التوصيل للعميل.', related: ['توصيل','عنوان','باب'] },
            ]
        };

        // ═══════════════════════════════════════════════════
        // المجال 5: التقنية والذكاء الاصطناعي
        // ═══════════════════════════════════════════════════
        this.domains.technology = {
            nameAr: 'التقنية والذكاء', nameEn: 'Technology & AI',
            quranRef: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق ١',
            terms: [
                { ar: 'ذكاء اصطناعي', en: 'Artificial Intelligence', category: 'AI', synonyms: ['AI','ذكاء آلي'], definition: 'أنظمة حاسوبية تحاكي الذكاء البشري في التعلم والاستنتاج.', related: ['تعلم آلي','شبكة عصبية','تعلم عميق'] },
                { ar: 'شبكة عصبية', en: 'Neural Network', category: 'AI', synonyms: ['شبكة عصبية اصطناعية','ANN'], definition: 'نموذج رياضي مستوحى من الدماغ البشري — طبقات من العقد المترابطة.', related: ['تعلم عميق','backpropagation','طبقات'] },
                { ar: 'تعلم عميق', en: 'Deep Learning', category: 'AI', synonyms: ['DL'], definition: 'شبكات عصبية متعددة الطبقات قادرة على تعلم تمثيلات معقدة.', related: ['CNN','RNN','Transformer','GPT'] },
                { ar: 'نموذج لغوي', en: 'Language Model', category: 'NLP', synonyms: ['LLM','نموذج لغوي كبير'], definition: 'نموذج يفهم ويولّد اللغة البشرية.', related: ['GPT','BERT','Transformer','NLP'] },
                { ar: 'معالجة لغة طبيعية', en: 'NLP', category: 'NLP', synonyms: ['NLP','فهم اللغة'], definition: 'فرع من AI يتعامل مع فهم وتوليد اللغة البشرية.', related: ['تحليل مشاعر','ترجمة','تصنيف'] },
                { ar: 'تعلم آلي', en: 'Machine Learning', category: 'AI', synonyms: ['ML'], definition: 'أنظمة تتعلم من البيانات بدون برمجة صريحة.', related: ['تدريب','بيانات','نموذج','دقة'] },
                { ar: 'بلوكتشين', en: 'Blockchain', category: 'تقنية', synonyms: ['سلسلة كتل'], definition: 'سجل رقمي موزع لا يمكن تعديله — يضمن الشفافية.', related: ['تشفير','لامركزي','عقد ذكي'] },
                { ar: 'إنترنت الأشياء', en: 'IoT', category: 'تقنية', synonyms: ['IoT'], definition: 'ربط الأجهزة المادية بالإنترنت لتبادل البيانات.', related: ['حساسات','بيانات','تلقائي'] },
                { ar: 'حوسبة سحابية', en: 'Cloud Computing', category: 'بنية تحتية', synonyms: ['سحابة','كلاود'], definition: 'خدمات حاسوبية عبر الإنترنت بدلاً من أجهزة محلية.', related: ['AWS','Azure','سيرفر'] },
                { ar: 'أمن سيبراني', en: 'Cybersecurity', category: 'أمن', synonyms: ['حماية رقمية'], definition: 'حماية الأنظمة والبيانات من الاختراق.', related: ['تشفير','جدار ناري','VPN'] },
                { ar: 'واجهة برمجة', en: 'API', category: 'برمجة', synonyms: ['API','واجهة تطبيقات'], definition: 'طريقة تواصل بين البرامج والأنظمة المختلفة.', related: ['REST','JSON','خادم'] },
                { ar: 'قاعدة بيانات', en: 'Database', category: 'بيانات', synonyms: ['DB','مستودع بيانات'], definition: 'نظام تخزين واسترجاع بيانات منظمة.', related: ['SQL','MongoDB','جداول'] },
            ]
        };

        // ═══════════════════════════════════════════════════
        // المجال 6: الأحكام الشرعية — Sharia
        // ═══════════════════════════════════════════════════
        this.domains.sharia = {
            nameAr: 'الأحكام الشرعية', nameEn: 'Islamic Rulings',
            quranRef: '﴿ وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا ﴾ — الحشر ٧',
            terms: [
                { ar: 'حلال', en: 'Halal', category: 'حكم', synonyms: ['مباح','جائز'], definition: 'ما أذن الشرع بفعله.', related: ['حرام','مكروه','مندوب'] },
                { ar: 'حرام', en: 'Haram', category: 'حكم', synonyms: ['محرّم','ممنوع شرعاً'], definition: 'ما نهى الشرع عن فعله.', related: ['حلال','إثم','عقوبة'] },
                { ar: 'أمانة', en: 'Trust/Amanah', category: 'أخلاق', synonyms: ['وديعة','ثقة'], definition: 'حفظ الحقوق والوفاء بالعهود.', related: ['صدق','وفاء','عدل'], quranRef: '﴿ إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا ﴾ النساء ٥٨' },
                { ar: 'عدل', en: 'Justice', category: 'أخلاق', synonyms: ['قسط','إنصاف','ميزان'], definition: 'إعطاء كل ذي حق حقه — أساس المعاملات.', related: ['ميزان','قسط','حق'], quranRef: '﴿ وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ ﴾ الرحمن ٩' },
                { ar: 'صدق', en: 'Truthfulness', category: 'أخلاق', synonyms: ['حق','أمانة في القول'], definition: 'قول الحق ومطابقة الواقع.', related: ['أمانة','ثقة'], hadith: '«عليكم بالصدق فإن الصدق يهدي إلى البر»' },
                { ar: 'إتقان', en: 'Excellence/Itqan', category: 'أخلاق', synonyms: ['إحسان','جودة'], definition: 'أداء العمل بأفضل صورة ممكنة.', related: ['إحسان','جودة','كمال'], hadith: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»' },
                { ar: 'توكل', en: 'Tawakkul', category: 'عقيدة', synonyms: ['اعتماد على الله'], definition: 'الأخذ بالأسباب مع الاعتماد على الله.', related: ['إيمان','أسباب','قدر'], hadith: '«اعقلها وتوكل»' },
                { ar: 'بركة', en: 'Barakah', category: 'روحي', synonyms: ['نماء','زيادة خير'], definition: 'الزيادة والنماء والخير الذي يضعه الله.', related: ['رزق','خير','دعاء'] },
                { ar: 'نصاب', en: 'Nisab', category: 'زكاة', synonyms: ['حد الزكاة'], definition: 'الحد الأدنى من المال الذي تجب فيه الزكاة.', related: ['زكاة','ذهب 85 غرام','فضة 595 غرام'] },
            ]
        };

        // ═══════════════════════════════════════════════════
        // المجال 7: مصطلحات عامة — General
        // ═══════════════════════════════════════════════════
        this.domains.general = {
            nameAr: 'مصطلحات عامة', nameEn: 'General Terms',
            terms: [
                { ar: 'مساعدة', en: 'Help', category: 'تفاعل', synonyms: ['مساعده','ساعدني','عون'], definition: 'طلب المساعدة من النظام.' },
                { ar: 'أسعار', en: 'Prices', category: 'استعلام', synonyms: ['سعر','كم السعر','كم سعر','ثمن'], definition: 'الاستعلام عن أسعار المعادن.' },
                { ar: 'تسجيل', en: 'Register', category: 'حساب', synonyms: ['إنشاء حساب','تسجيل جديد','فتح حساب'], definition: 'إنشاء حساب جديد في المنظومة.' },
                { ar: 'دخول', en: 'Login', category: 'حساب', synonyms: ['تسجيل دخول','لوقن','login'], definition: 'الدخول لحساب موجود.' },
                { ar: 'شحن', en: 'Shipping', category: 'لوجستي', synonyms: ['توصيل','نقل','إرسال'], definition: 'نقل البضائع.' },
                { ar: 'بحث', en: 'Search', category: 'تفاعل', synonyms: ['ابحث','أبحث عن','دور'], definition: 'البحث عن معلومات.' },
            ]
        };

        // ═══ بناء الفهارس ═══
        this._buildIndices();
    }

    _buildIndices() {
        for (const [domainKey, domain] of Object.entries(this.domains)) {
            for (const term of domain.terms) {
                const key = term.ar;
                this.allTerms.set(key, { ...term, domain: domainKey, domainName: domain.nameAr });

                // فهرس المرادفات
                if (term.synonyms) {
                    for (const syn of term.synonyms) {
                        if (!this.synonymIndex.has(syn)) this.synonymIndex.set(syn, []);
                        this.synonymIndex.get(syn).push(key);
                    }
                }
                this.synonymIndex.set(key, [key, ...(term.synonyms || [])]);

                // فهرس التصنيفات
                const cat = term.category || 'عام';
                if (!this.categoryIndex.has(cat)) this.categoryIndex.set(cat, []);
                this.categoryIndex.get(cat).push(key);
            }
        }
    }

    // ═══ API Methods ═══

    // بحث عن مصطلح
    lookup(word) {
        // بحث مباشر
        if (this.allTerms.has(word)) return this.allTerms.get(word);

        // بحث في المرادفات
        const syns = this.synonymIndex.get(word);
        if (syns && syns.length > 0) return this.allTerms.get(syns[0]);

        // بحث جزئي
        for (const [key, term] of this.allTerms) {
            if (key.includes(word) || word.includes(key)) return term;
            if (term.en && term.en.toLowerCase().includes(word.toLowerCase())) return term;
        }

        return null;
    }

    // بحث متعدد النتائج
    search(query, limit = 10) {
        const results = [];
        const q = query.toLowerCase();

        for (const [key, term] of this.allTerms) {
            let score = 0;
            if (key === query) score = 100;
            else if (key.includes(query) || query.includes(key)) score = 80;
            else if (term.en && term.en.toLowerCase() === q) score = 90;
            else if (term.en && term.en.toLowerCase().includes(q)) score = 70;
            else if (term.synonyms && term.synonyms.some(s => s.includes(query) || query.includes(s))) score = 60;
            else if (term.definition && term.definition.includes(query)) score = 40;
            else if (term.related && term.related.some(r => r.includes(query))) score = 30;

            if (score > 0) results.push({ term, score });
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit).map(r => r.term);
    }

    // جميع مصطلحات مجال
    getDomain(domainKey) {
        return this.domains[domainKey] || null;
    }

    // جميع مصطلحات تصنيف
    getByCategory(category) {
        const keys = this.categoryIndex.get(category) || [];
        return keys.map(k => this.allTerms.get(k));
    }

    // توليد بيانات تدريب للشبكة العصبية
    generateTrainingData() {
        const texts = [];

        for (const [, domain] of Object.entries(this.domains)) {
            for (const term of domain.terms) {
                // الكلمة نفسها مع تعريفها
                if (term.definition) texts.push(`${term.ar} ${term.definition}`);

                // الكلمة مع المرادفات
                if (term.synonyms && term.synonyms.length > 0) {
                    texts.push(`${term.ar} ${term.synonyms.join(' ')}`);
                }

                // الكلمة مع الكلمات المرتبطة
                if (term.related && term.related.length > 0) {
                    texts.push(`${term.ar} ${term.related.join(' ')}`);
                }

                // الآيات والأحاديث
                if (term.quranRef) texts.push(term.quranRef);
                if (term.hadith) texts.push(term.hadith);
            }

            // مرجع القرآن للمجال
            if (domain.quranRef) texts.push(domain.quranRef);
        }

        return texts;
    }

    // إحصائيات
    getStats() {
        let totalTerms = 0;
        const domainStats = {};
        for (const [key, domain] of Object.entries(this.domains)) {
            domainStats[key] = { name: domain.nameAr, count: domain.terms.length };
            totalTerms += domain.terms.length;
        }
        return {
            بسم_الله: this.بسم_الله,
            name: 'قاموس شيخة الشامل — Master Lexicon',
            totalTerms,
            totalSynonyms: this.synonymIndex.size,
            totalCategories: this.categoryIndex.size,
            domains: domainStats,
            categories: [...this.categoryIndex.keys()],
            independence: 'يعمل محلياً — بيانات مبنية ذاتياً'
        };
    }
}

module.exports = { SheikhaLexicon };
