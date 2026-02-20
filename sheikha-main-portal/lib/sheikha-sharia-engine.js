/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SHARIA ENGINE — منظومة شيخة للشريعة الإسلامية الشاملة
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "إِنَّا أَنزَلْنَا إِلَيْكَ الْكِتَابَ بِالْحَقِّ لِتَحْكُمَ بَيْنَ النَّاسِ بِمَا أَرَاكَ اللَّهُ" — النساء ١٠٥
 * "وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا" — الحشر ٧
 * "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي وَرَضِيتُ لَكُمُ الْإِسْلَامَ دِينًا" — المائدة ٣
 *
 * ✅ القرآن الكريم — ١١٤ سورة • ٦٢٣٦ آية • ٣٠ جزء
 * ✅ السنة النبوية — الكتب الستة • المسانيد • الصحاح
 * ✅ أصول الفقه — القواعد الأصولية والاستنباط
 * ✅ الفقه الإسلامي — العبادات والمعاملات والأحوال
 * ✅ مقاصد الشريعة — الضروريات والحاجيات والتحسينيات
 * ✅ العقيدة الإسلامية — أركان الإيمان والتوحيد
 * ✅ الأخلاق والآداب — الآداب النبوية الشاملة
 * ✅ القضاء والحكم — النظام القضائي الإسلامي
 * ✅ المعاملات المالية — البيوع والعقود والتمويل الإسلامي
 * ✅ الرقمنة الشرعية — تقنين ورقمنة كل ما سبق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

class SheikhaShareEngine {
    constructor() {
        this.name = 'Sheikha Islamic Sharia Engine — منظومة الشريعة الإسلامية';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {

        // ══════════════════════════════════════════════════════════════════
        // ١. القرآن الكريم
        // ══════════════════════════════════════════════════════════════════
        this.quran = {
            description: 'كلام الله تعالى المنزل على نبيه محمد ﷺ بالوحي — المصدر الأول للتشريع',
            stats: { surahs: 114, ayahs: 6236, juz: 30, hizb: 60, rub: 240, words: 77437, letters: 323671, sajdah: 15 },
            types: [
                { nameAr: 'مكية', nameEn: 'Meccan', count: 86, characteristics: ['العقيدة والتوحيد', 'قصص الأنبياء', 'اليوم الآخر', 'آيات قصيرة بلاغية'] },
                { nameAr: 'مدنية', nameEn: 'Medinan', count: 28, characteristics: ['التشريعات والأحكام', 'المعاملات', 'الحدود', 'آيات أطول تفصيلية'] }
            ],
            sciences: [
                { nameAr: 'علم التفسير', nameEn: 'Tafsir', description: 'بيان معاني القرآن', types: ['تفسير بالمأثور', 'تفسير بالرأي', 'تفسير موضوعي', 'تفسير لغوي'], scholars: ['ابن كثير', 'الطبري', 'القرطبي', 'السعدي', 'ابن عاشور'] },
                { nameAr: 'علم التجويد', nameEn: 'Tajweed', description: 'إتقان تلاوة القرآن', rulings: ['إظهار', 'إدغام', 'إقلاب', 'إخفاء', 'غنة', 'مد', 'وقف', 'ابتداء'] },
                { nameAr: 'علم القراءات', nameEn: 'Qiraat', description: 'القراءات العشر المتواترة', readers: ['نافع', 'ابن كثير', 'أبو عمرو', 'ابن عامر', 'عاصم', 'حمزة', 'الكسائي', 'أبو جعفر', 'يعقوب', 'خلف'] },
                { nameAr: 'علوم القرآن', nameEn: 'Ulum al-Quran', topics: ['أسباب النزول', 'الناسخ والمنسوخ', 'المحكم والمتشابه', 'المكي والمدني', 'إعجاز القرآن', 'أمثال القرآن', 'قصص القرآن', 'أقسام القرآن'] },
                { nameAr: 'علم الإعراب', nameEn: 'I\'rab al-Quran', description: 'إعراب القرآن الكريم وبيان وجوهه النحوية' },
                { nameAr: 'علم البلاغة القرآنية', nameEn: 'Quranic Rhetoric', branches: ['المعاني', 'البيان', 'البديع'] }
            ],
            themes: [
                { nameAr: 'العقيدة والتوحيد', ayahCount: '≈ 1000', description: 'توحيد الله وأسماؤه وصفاته' },
                { nameAr: 'الأحكام والتشريعات', ayahCount: '≈ 500', description: 'آيات الأحكام الفقهية' },
                { nameAr: 'قصص الأنبياء', ayahCount: '≈ 1500', description: 'قصص ٢٥ نبياً ورسولاً' },
                { nameAr: 'اليوم الآخر', ayahCount: '≈ 1200', description: 'البعث والحساب والجنة والنار' },
                { nameAr: 'الأخلاق والآداب', ayahCount: '≈ 800', description: 'مكارم الأخلاق والسلوك' },
                { nameAr: 'الكون والطبيعة', ayahCount: '≈ 750', description: 'آيات كونية وعلمية' },
                { nameAr: 'الحوار والجدل', ayahCount: '≈ 600', description: 'مناظرات ومحاورات' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٢. السنة النبوية
        // ══════════════════════════════════════════════════════════════════
        this.sunnah = {
            description: 'ما صدر عن النبي ﷺ من قول أو فعل أو تقرير أو صفة — المصدر الثاني للتشريع',
            types: [
                { nameAr: 'سنة قولية', nameEn: 'Verbal Sunnah', description: 'أحاديث النبي ﷺ' },
                { nameAr: 'سنة فعلية', nameEn: 'Practical Sunnah', description: 'أفعال النبي ﷺ وتطبيقاته' },
                { nameAr: 'سنة تقريرية', nameEn: 'Tacit Approval', description: 'ما أقره النبي ﷺ بالسكوت أو الموافقة' },
                { nameAr: 'سنة وصفية', nameEn: 'Descriptive Sunnah', description: 'صفات النبي ﷺ الخَلقية والخُلقية' }
            ],
            majorCollections: [
                { nameAr: 'صحيح البخاري', nameEn: 'Sahih al-Bukhari', compiler: 'الإمام البخاري', hadiths: 7563, status: 'أصح كتاب بعد القرآن' },
                { nameAr: 'صحيح مسلم', nameEn: 'Sahih Muslim', compiler: 'الإمام مسلم', hadiths: 7500, status: 'ثاني أصح كتاب' },
                { nameAr: 'سنن أبي داود', nameEn: 'Sunan Abu Dawud', compiler: 'أبو داود', hadiths: 5274, status: 'أحاديث الأحكام' },
                { nameAr: 'جامع الترمذي', nameEn: 'Jami al-Tirmidhi', compiler: 'الترمذي', hadiths: 3956, status: 'فقه وأحكام' },
                { nameAr: 'سنن النسائي', nameEn: 'Sunan al-Nasai', compiler: 'النسائي', hadiths: 5758, status: 'أقلها ضعفاً بعد الصحيحين' },
                { nameAr: 'سنن ابن ماجه', nameEn: 'Sunan Ibn Majah', compiler: 'ابن ماجه', hadiths: 4341, status: 'تكمل الكتب الستة' }
            ],
            otherCollections: [
                { nameAr: 'مسند أحمد', compiler: 'الإمام أحمد بن حنبل', hadiths: 27647 },
                { nameAr: 'موطأ مالك', compiler: 'الإمام مالك بن أنس', hadiths: 1720 },
                { nameAr: 'صحيح ابن حبان', compiler: 'ابن حبان' },
                { nameAr: 'المستدرك على الصحيحين', compiler: 'الحاكم النيسابوري' },
                { nameAr: 'السنن الكبرى', compiler: 'البيهقي' },
                { nameAr: 'رياض الصالحين', compiler: 'النووي', description: 'مختارات أحاديث في الأخلاق والآداب' },
                { nameAr: 'بلوغ المرام', compiler: 'ابن حجر', description: 'أحاديث الأحكام' },
                { nameAr: 'الأربعون النووية', compiler: 'النووي', hadiths: 42, description: 'أحاديث جامعة لأصول الدين' }
            ],
            sciences: [
                { nameAr: 'علم مصطلح الحديث', nameEn: 'Hadith Terminology', topics: ['صحيح', 'حسن', 'ضعيف', 'موضوع', 'متواتر', 'آحاد', 'مسند', 'مرسل', 'معلق', 'منقطع'] },
                { nameAr: 'علم الرجال (الجرح والتعديل)', nameEn: 'Ilm al-Rijal', description: 'دراسة رواة الحديث وتقييمهم', levels: ['ثقة', 'صدوق', 'مقبول', 'ضعيف', 'متروك', 'كذاب'] },
                { nameAr: 'علم العلل', nameEn: 'Ilm al-Ilal', description: 'اكتشاف العلل الخفية في الأحاديث' },
                { nameAr: 'علم غريب الحديث', nameEn: 'Gharib al-Hadith', description: 'شرح الألفاظ الغريبة في الحديث' },
                { nameAr: 'علم الناسخ والمنسوخ في الحديث', nameEn: 'Nasikh wa Mansukh', description: 'معرفة المنسوخ من الأحاديث' },
                { nameAr: 'علم تخريج الحديث', nameEn: 'Takhrij', description: 'تتبع الحديث في مصادره وبيان درجته' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٣. العقيدة الإسلامية
        // ══════════════════════════════════════════════════════════════════
        this.aqeedah = {
            nameAr: 'العقيدة الإسلامية',
            nameEn: 'Islamic Creed (Aqeedah)',
            arkkanAlIslam: {
                nameAr: 'أركان الإسلام الخمسة',
                pillars: [
                    { nameAr: 'الشهادتان', nameEn: 'Shahada', description: 'شهادة أن لا إله إلا الله وأن محمداً رسول الله' },
                    { nameAr: 'الصلاة', nameEn: 'Salah', description: 'إقامة الصلوات الخمس' },
                    { nameAr: 'الزكاة', nameEn: 'Zakat', description: 'إيتاء الزكاة' },
                    { nameAr: 'الصيام', nameEn: 'Sawm', description: 'صيام رمضان' },
                    { nameAr: 'الحج', nameEn: 'Hajj', description: 'حج البيت لمن استطاع إليه سبيلاً' }
                ]
            },
            arkkanAlIman: {
                nameAr: 'أركان الإيمان الستة',
                pillars: [
                    { nameAr: 'الإيمان بالله', nameEn: 'Belief in Allah', aspects: ['توحيد الربوبية', 'توحيد الألوهية', 'توحيد الأسماء والصفات'] },
                    { nameAr: 'الإيمان بالملائكة', nameEn: 'Belief in Angels', examples: ['جبريل', 'ميكائيل', 'إسرافيل', 'عزرائيل', 'رضوان', 'مالك'] },
                    { nameAr: 'الإيمان بالكتب', nameEn: 'Belief in Holy Books', books: ['القرآن', 'التوراة', 'الإنجيل', 'الزبور', 'صحف إبراهيم وموسى'] },
                    { nameAr: 'الإيمان بالرسل', nameEn: 'Belief in Messengers', count: '٢٥ مذكورون في القرآن', ululAzm: ['نوح', 'إبراهيم', 'موسى', 'عيسى', 'محمد ﷺ'] },
                    { nameAr: 'الإيمان باليوم الآخر', nameEn: 'Belief in Day of Judgment', events: ['علامات الساعة', 'النفخ في الصور', 'البعث', 'الحشر', 'الحساب', 'الميزان', 'الصراط', 'الشفاعة', 'الجنة', 'النار'] },
                    { nameAr: 'الإيمان بالقدر', nameEn: 'Belief in Divine Decree', levels: ['العلم', 'الكتابة', 'المشيئة', 'الخلق'] }
                ]
            },
            tawheed: {
                nameAr: 'أنواع التوحيد',
                types: [
                    { nameAr: 'توحيد الربوبية', nameEn: 'Tawhid al-Rububiyyah', description: 'إفراد الله بالخلق والرزق والتدبير' },
                    { nameAr: 'توحيد الألوهية', nameEn: 'Tawhid al-Uluhiyyah', description: 'إفراد الله بالعبادة' },
                    { nameAr: 'توحيد الأسماء والصفات', nameEn: 'Tawhid al-Asma wal-Sifat', description: 'إثبات ما أثبته الله لنفسه من أسماء وصفات' }
                ]
            },
            namesOfAllah: {
                nameAr: 'أسماء الله الحسنى',
                count: 99,
                evidence: 'إن لله تسعة وتسعين اسماً، مائة إلا واحداً، من أحصاها دخل الجنة — حديث',
                categories: ['أسماء الجلال', 'أسماء الجمال', 'أسماء الكمال']
            }
        };

        // ══════════════════════════════════════════════════════════════════
        // ٤. أصول الفقه — أدلة الأحكام ومناهج الاستنباط
        // ══════════════════════════════════════════════════════════════════
        this.usulAlFiqh = {
            nameAr: 'أصول الفقه',
            nameEn: 'Principles of Islamic Jurisprudence',
            description: 'علم القواعد التي يُتوصّل بها لاستنباط الأحكام الشرعية من أدلتها التفصيلية',
            sources: {
                agreed: [
                    { nameAr: 'القرآن الكريم', nameEn: 'Quran', rank: 1, description: 'المصدر الأول — كلام الله' },
                    { nameAr: 'السنة النبوية', nameEn: 'Sunnah', rank: 2, description: 'المصدر الثاني — تبيين القرآن' },
                    { nameAr: 'الإجماع', nameEn: 'Ijma (Consensus)', rank: 3, description: 'اتفاق المجتهدين من أمة محمد ﷺ على حكم شرعي' },
                    { nameAr: 'القياس', nameEn: 'Qiyas (Analogy)', rank: 4, description: 'إلحاق فرع بأصل في حكم لعلة جامعة بينهما' }
                ],
                disputed: [
                    { nameAr: 'الاستحسان', nameEn: 'Istihsan', school: 'الأحناف', description: 'العدول عن القياس لدليل أقوى' },
                    { nameAr: 'المصالح المرسلة', nameEn: 'Maslaha Mursala', school: 'المالكية', description: 'مراعاة مصلحة لم يشهد لها دليل معين' },
                    { nameAr: 'الاستصحاب', nameEn: 'Istishab', description: 'بقاء ما كان على ما كان حتى يثبت خلافه' },
                    { nameAr: 'العرف', nameEn: 'Urf (Custom)', description: 'ما اعتاده الناس ما لم يخالف الشرع' },
                    { nameAr: 'سد الذرائع', nameEn: 'Sadd al-Dharai', school: 'المالكية والحنابلة', description: 'منع الوسائل المفضية للمحرم' },
                    { nameAr: 'شرع من قبلنا', nameEn: 'Previous Sharia', description: 'شرائع الأنبياء السابقين ما لم ينسخ' },
                    { nameAr: 'قول الصحابي', nameEn: 'Companion\'s Opinion', description: 'رأي صحابي لم يُعارض' },
                    { nameAr: 'الاستقراء', nameEn: 'Istiqra (Induction)', description: 'تتبع الجزئيات لاستنتاج حكم كلي' }
                ]
            },
            ahkam: {
                nameAr: 'الأحكام الشرعية التكليفية',
                nameEn: 'Legal Rulings (Hukm Taklifi)',
                types: [
                    { nameAr: 'الواجب (الفرض)', nameEn: 'Wajib (Obligatory)', description: 'ما طلب الشارع فعله طلباً جازماً — يُثاب فاعله ويُعاقب تاركه' },
                    { nameAr: 'المندوب (المستحب)', nameEn: 'Mandub (Recommended)', description: 'ما طلب الشارع فعله طلباً غير جازم — يُثاب فاعله ولا يُعاقب تاركه' },
                    { nameAr: 'المباح', nameEn: 'Mubah (Permissible)', description: 'ما خيّر الشارع فيه بين الفعل والترك' },
                    { nameAr: 'المكروه', nameEn: 'Makruh (Disliked)', description: 'ما طلب الشارع تركه طلباً غير جازم — يُثاب تاركه ولا يُعاقب فاعله' },
                    { nameAr: 'الحرام', nameEn: 'Haram (Prohibited)', description: 'ما طلب الشارع تركه طلباً جازماً — يُثاب تاركه ويُعاقب فاعله' }
                ]
            },
            qawaidFiqhiyyah: {
                nameAr: 'القواعد الفقهية الكبرى',
                nameEn: 'Major Fiqh Maxims',
                rules: [
                    { nameAr: 'الأمور بمقاصدها', nameEn: 'Matters are judged by intentions', evidence: 'إنما الأعمال بالنيات — حديث' },
                    { nameAr: 'اليقين لا يزول بالشك', nameEn: 'Certainty is not removed by doubt', evidence: 'دعوا ما يريبكم إلى ما لا يريبكم — حديث' },
                    { nameAr: 'المشقة تجلب التيسير', nameEn: 'Hardship brings ease', evidence: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ — البقرة ١٨٥' },
                    { nameAr: 'لا ضرر ولا ضرار', nameEn: 'No harm and no reciprocal harm', evidence: 'لا ضرر ولا ضرار — حديث' },
                    { nameAr: 'العادة محكّمة', nameEn: 'Custom is authoritative', evidence: 'ما رآه المسلمون حسناً فهو عند الله حسن — أثر' }
                ]
            }
        };

        // ══════════════════════════════════════════════════════════════════
        // ٥. الفقه الإسلامي
        // ══════════════════════════════════════════════════════════════════
        this.fiqh = {
            nameAr: 'الفقه الإسلامي',
            nameEn: 'Islamic Jurisprudence (Fiqh)',
            madhahib: [
                { nameAr: 'المذهب الحنفي', nameEn: 'Hanafi', founder: 'الإمام أبو حنيفة (ت ١٥٠هـ)', method: 'الرأي والقياس والاستحسان', spread: 'تركيا، وسط آسيا، شبه القارة، مصر' },
                { nameAr: 'المذهب المالكي', nameEn: 'Maliki', founder: 'الإمام مالك بن أنس (ت ١٧٩هـ)', method: 'عمل أهل المدينة والمصالح المرسلة', spread: 'شمال أفريقيا، غرب أفريقيا، الأندلس' },
                { nameAr: 'المذهب الشافعي', nameEn: 'Shafi\'i', founder: 'الإمام الشافعي (ت ٢٠٤هـ)', method: 'الجمع بين الحديث والقياس المنضبط', spread: 'مصر، اليمن، جنوب شرق آسيا، شرق أفريقيا' },
                { nameAr: 'المذهب الحنبلي', nameEn: 'Hanbali', founder: 'الإمام أحمد بن حنبل (ت ٢٤١هـ)', method: 'التمسك بالنص وقول الصحابي', spread: 'السعودية، قطر، بعض الخليج' }
            ],
            divisions: [
                {
                    nameAr: 'فقه العبادات',
                    nameEn: 'Fiqh of Worship',
                    books: [
                        { nameAr: 'كتاب الطهارة', topics: ['الوضوء', 'الغسل', 'التيمم', 'إزالة النجاسة', 'الحيض والنفاس'] },
                        { nameAr: 'كتاب الصلاة', topics: ['الأذان', 'شروط الصلاة', 'أركان الصلاة', 'واجبات وسنن', 'صلاة الجماعة', 'صلاة الجمعة', 'صلاة العيدين', 'صلاة الجنازة', 'صلاة الاستسقاء', 'صلاة الكسوف', 'سجود السهو'] },
                        { nameAr: 'كتاب الزكاة', topics: ['زكاة المال', 'زكاة الذهب والفضة', 'زكاة الأنعام', 'زكاة الزروع', 'زكاة عروض التجارة', 'زكاة الفطر', 'مصارف الزكاة الثمانية'] },
                        { nameAr: 'كتاب الصيام', topics: ['صيام رمضان', 'صيام التطوع', 'مفسدات الصيام', 'الاعتكاف', 'ليلة القدر'] },
                        { nameAr: 'كتاب الحج والعمرة', topics: ['الإحرام', 'المواقيت', 'الطواف', 'السعي', 'الوقوف بعرفة', 'رمي الجمار', 'الهدي', 'فدية المحظورات'] }
                    ]
                },
                {
                    nameAr: 'فقه المعاملات',
                    nameEn: 'Fiqh of Transactions',
                    books: [
                        { nameAr: 'كتاب البيوع', topics: ['أركان البيع', 'شروط البيع', 'الخيارات', 'البيوع المنهي عنها', 'السلم', 'الاستصناع'] },
                        { nameAr: 'كتاب الإجارة', topics: ['إجارة العين', 'إجارة الذمة', 'إجارة الأشخاص'] },
                        { nameAr: 'كتاب الشركات', topics: ['شركة العنان', 'شركة المضاربة', 'شركة الوجوه', 'شركة الأبدان', 'شركة المفاوضة'] },
                        { nameAr: 'كتاب الرهن', topics: ['أركان الرهن', 'شروطه', 'التصرف في الرهن'] },
                        { nameAr: 'كتاب الوكالة والكفالة', topics: ['الوكالة', 'الكفالة', 'الحوالة', 'الضمان'] },
                        { nameAr: 'كتاب الوقف', topics: ['شروط الوقف', 'أنواعه', 'إدارة الأوقاف'] },
                        { nameAr: 'كتاب الوصايا والمواريث', topics: ['أحكام الوصية', 'علم الفرائض', 'أصحاب الفروض', 'العصبات', 'الحجب'] }
                    ]
                },
                {
                    nameAr: 'فقه الأسرة',
                    nameEn: 'Family Law',
                    books: [
                        { nameAr: 'كتاب النكاح', topics: ['أركان النكاح', 'شروطه', 'الولاية', 'المهر', 'الكفاءة', 'حقوق الزوجين'] },
                        { nameAr: 'كتاب الطلاق', topics: ['أنواع الطلاق', 'العدة', 'الخلع', 'الإيلاء', 'الظهار', 'اللعان'] },
                        { nameAr: 'كتاب النفقات', topics: ['نفقة الزوجة', 'نفقة الأولاد', 'نفقة الأقارب', 'الحضانة', 'الرضاع'] }
                    ]
                },
                {
                    nameAr: 'فقه الجنايات والحدود',
                    nameEn: 'Criminal Law',
                    books: [
                        { nameAr: 'كتاب الحدود', topics: ['حد الزنا', 'حد السرقة', 'حد القذف', 'حد الحرابة', 'حد الردة', 'حد شرب الخمر'] },
                        { nameAr: 'كتاب القصاص', topics: ['القصاص في النفس', 'القصاص فيما دون النفس', 'الدية', 'العاقلة'] },
                        { nameAr: 'كتاب التعزير', topics: ['العقوبات التعزيرية', 'سلطة القاضي'] }
                    ]
                },
                {
                    nameAr: 'فقه القضاء',
                    nameEn: 'Judicial Law',
                    books: [
                        { nameAr: 'كتاب القضاء', topics: ['شروط القاضي', 'آداب القضاء', 'البينات', 'الشهادة', 'اليمين', 'الدعوى'] }
                    ]
                },
                {
                    nameAr: 'الفقه المعاصر',
                    nameEn: 'Contemporary Fiqh',
                    topics: [
                        'فقه المعاملات المالية المعاصرة (بنوك إسلامية، تأمين تعاوني، صكوك)',
                        'فقه التقنية (الذكاء الاصطناعي، البلوكتشين، العملات الرقمية)',
                        'فقه الطب (زراعة أعضاء، أطفال أنابيب، موت دماغي)',
                        'فقه البيئة (حماية الموارد، الاستدامة)',
                        'فقه الأقليات المسلمة',
                        'فقه النوازل والمستجدات',
                        'فقه الأولويات',
                        'فقه الموازنات'
                    ]
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٦. مقاصد الشريعة
        // ══════════════════════════════════════════════════════════════════
        this.maqasid = {
            nameAr: 'مقاصد الشريعة الإسلامية',
            nameEn: 'Objectives of Islamic Sharia (Maqasid)',
            description: 'الحِكم والغايات التي وُضعت الشريعة لتحقيقها — جلب المصالح ودرء المفاسد',
            levels: [
                {
                    nameAr: 'الضروريات الخمس',
                    nameEn: 'Necessities (Daruriyyat)',
                    rank: 1,
                    items: [
                        { nameAr: 'حفظ الدين', nameEn: 'Preservation of Religion', methods: ['إقامة العبادات', 'الجهاد', 'حد الردة', 'الأمر بالمعروف', 'العلم الشرعي'] },
                        { nameAr: 'حفظ النفس', nameEn: 'Preservation of Life', methods: ['تحريم القتل', 'القصاص', 'وجوب النفقة', 'العلاج', 'تحريم الإلقاء بالنفس للتهلكة'] },
                        { nameAr: 'حفظ العقل', nameEn: 'Preservation of Intellect', methods: ['تحريم المسكرات', 'حد شرب الخمر', 'طلب العلم', 'التفكر'] },
                        { nameAr: 'حفظ النسل', nameEn: 'Preservation of Lineage', methods: ['تشريع النكاح', 'تحريم الزنا', 'حد القذف', 'ثبوت النسب'] },
                        { nameAr: 'حفظ المال', nameEn: 'Preservation of Wealth', methods: ['تحريم السرقة', 'حد السرقة', 'تحريم الربا', 'تحريم الغش', 'تشريع الزكاة'] }
                    ]
                },
                {
                    nameAr: 'الحاجيات',
                    nameEn: 'Needs (Hajiyyat)',
                    rank: 2,
                    description: 'ما يُحتاج إليه لرفع الحرج والمشقة',
                    examples: ['رخص السفر', 'إباحة الصيد', 'المساقاة', 'السلم', 'الإجارة']
                },
                {
                    nameAr: 'التحسينيات',
                    nameEn: 'Embellishments (Tahsiniyyat)',
                    rank: 3,
                    description: 'ما يُؤخذ بمكارم الأخلاق ومحاسن العادات',
                    examples: ['آداب الأكل والشرب', 'النظافة', 'ستر العورة', 'الطيب', 'آداب المجلس']
                }
            ],
            scholars: [
                { name: 'الإمام الغزالي', contribution: 'أول من رتّب الضروريات الخمس في "المستصفى"' },
                { name: 'الإمام الشاطبي', contribution: 'أصّل علم المقاصد في "الموافقات"' },
                { name: 'ابن عاشور', contribution: 'طوّر علم المقاصد في العصر الحديث في "مقاصد الشريعة الإسلامية"' },
                { name: 'العز بن عبدالسلام', contribution: '"قواعد الأحكام في مصالح الأنام"' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٧. المعاملات المالية الإسلامية
        // ══════════════════════════════════════════════════════════════════
        this.islamicFinance = {
            nameAr: 'المعاملات المالية الإسلامية',
            nameEn: 'Islamic Financial Transactions',
            principles: [
                { nameAr: 'تحريم الربا', nameEn: 'Prohibition of Riba', evidence: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة ٢٧٥' },
                { nameAr: 'تحريم الغرر', nameEn: 'Prohibition of Gharar', evidence: 'نهى ﷺ عن بيع الغرر — حديث مسلم' },
                { nameAr: 'تحريم الميسر', nameEn: 'Prohibition of Maysir', evidence: 'إِنَّمَا الْخَمْرُ وَالْمَيْسِرُ ... رِجْسٌ — المائدة ٩٠' },
                { nameAr: 'الغنم بالغرم', nameEn: 'Profit with Risk', evidence: 'الخراج بالضمان — حديث' },
                { nameAr: 'تحريم بيع ما لا يُملك', evidence: 'لا تبع ما ليس عندك — حديث' },
                { nameAr: 'التراضي', evidence: 'إلا أن تكون تجارة عن تراض منكم — النساء ٢٩' }
            ],
            contracts: [
                { nameAr: 'المرابحة', nameEn: 'Murabaha', description: 'بيع بثمن التكلفة مع هامش ربح معلوم' },
                { nameAr: 'المشاركة', nameEn: 'Musharakah', description: 'شراكة بين طرفين أو أكثر في رأس المال والربح' },
                { nameAr: 'المضاربة', nameEn: 'Mudarabah', description: 'شراكة بين مال وعمل — صاحب المال والعامل' },
                { nameAr: 'الإجارة', nameEn: 'Ijarah', description: 'عقد منفعة بعوض — تأجير أصول' },
                { nameAr: 'الإجارة المنتهية بالتمليك', nameEn: 'Ijarah Muntahia bil-Tamlik', description: 'إيجار ينتهي بنقل الملكية' },
                { nameAr: 'السلم', nameEn: 'Salam', description: 'بيع موصوف في الذمة مؤجل التسليم معجل الثمن' },
                { nameAr: 'الاستصناع', nameEn: 'Istisna', description: 'عقد تصنيع — طلب صنع شيء بمواصفات محددة' },
                { nameAr: 'الوكالة بالاستثمار', nameEn: 'Wakalah', description: 'توكيل في إدارة الاستثمار' },
                { nameAr: 'الصكوك', nameEn: 'Sukuk', description: 'سندات إسلامية تمثل حصة ملكية في أصل' },
                { nameAr: 'التأمين التعاوني (التكافل)', nameEn: 'Takaful', description: 'تأمين قائم على التبرع والتعاون' },
                { nameAr: 'الوقف', nameEn: 'Waqf', description: 'حبس الأصل وتسبيل المنفعة' }
            ],
            prohibited: [
                'الربا بجميع أنواعه (ربا الفضل وربا النسيئة)',
                'الغرر الفاحش',
                'الميسر والقمار',
                'بيع الدين بالدين',
                'بيعتان في بيعة',
                'بيع العينة',
                'النجش (رفع السعر بدون رغبة شراء)',
                'التلاعب بالأسعار',
                'الاحتكار المضر',
                'الغش والتدليس'
            ],
            standards: [
                { nameEn: 'AAOIFI', nameAr: 'هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية', standards: 'معايير شرعية ومحاسبية' },
                { nameEn: 'IFSB', nameAr: 'مجلس الخدمات المالية الإسلامية', standards: 'معايير تنظيمية ورقابية' },
                { nameEn: 'OIC Fiqh Academy', nameAr: 'مجمع الفقه الإسلامي الدولي', standards: 'فتاوى وقرارات فقهية' },
                { nameEn: 'ISRA', nameAr: 'أكاديمية البحوث الشرعية', standards: 'بحوث مالية إسلامية' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٨. الأخلاق والآداب الإسلامية
        // ══════════════════════════════════════════════════════════════════
        this.akhlaq = {
            nameAr: 'الأخلاق والآداب الإسلامية',
            nameEn: 'Islamic Ethics & Manners',
            evidence: 'إنما بُعثت لأتمم مكارم الأخلاق — حديث',
            categories: [
                { nameAr: 'أخلاق مع الله', examples: ['الإخلاص', 'التوكل', 'الخشية', 'الرجاء', 'الشكر', 'الصبر', 'الرضا', 'التوبة', 'المراقبة'] },
                { nameAr: 'أخلاق مع النفس', examples: ['الصدق', 'الأمانة', 'العفة', 'التواضع', 'الزهد', 'القناعة', 'ضبط النفس'] },
                { nameAr: 'أخلاق مع الناس', examples: ['البر', 'الإحسان', 'العدل', 'الرحمة', 'التسامح', 'الوفاء', 'حسن الجوار', 'صلة الرحم', 'إفشاء السلام'] },
                { nameAr: 'أخلاق التجارة', examples: ['الصدق في البيع', 'البيان وعدم الكتمان', 'السماحة', 'الوفاء بالعقود', 'عدم الغش', 'عدم الاحتكار'] },
                { nameAr: 'آداب عامة', examples: ['آداب الطعام والشراب', 'آداب السلام', 'آداب المجلس', 'آداب السفر', 'آداب النوم', 'آداب اللباس', 'آداب الدعاء'] }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٩. السيرة النبوية
        // ══════════════════════════════════════════════════════════════════
        this.seerah = {
            nameAr: 'السيرة النبوية',
            nameEn: 'Prophetic Biography (Seerah)',
            periods: [
                { nameAr: 'ما قبل البعثة', years: '٥٧٠-٦١٠م', events: ['المولد', 'الرضاعة', 'اليتم', 'رعي الغنم', 'التجارة', 'الزواج من خديجة', 'التحنث في غار حراء'] },
                { nameAr: 'المرحلة المكية', years: '٦١٠-٦٢٢م', duration: '١٣ سنة', events: ['البعثة', 'الدعوة السرية', 'الدعوة الجهرية', 'الأذى والابتلاء', 'الهجرة للحبشة', 'عام الحزن', 'الإسراء والمعراج', 'بيعة العقبة'] },
                { nameAr: 'المرحلة المدنية', years: '٦٢٢-٦٣٢م', duration: '١٠ سنوات', events: ['الهجرة', 'بناء المسجد', 'المؤاخاة', 'الصحيفة', 'غزوة بدر', 'غزوة أحد', 'غزوة الخندق', 'صلح الحديبية', 'فتح مكة', 'حجة الوداع', 'الوفاة ﷺ'] }
            ],
            commerceModel: {
                nameAr: 'النموذج التجاري النبوي',
                nameEn: 'Prophetic Commerce Model',
                principles: [
                    'الصدق والأمانة في المعاملة',
                    'البيان وعدم كتمان العيب',
                    'السماحة في البيع والشراء',
                    'عدم الحلف الكاذب',
                    'تحريم التطفيف في الكيل والميزان',
                    'النهي عن بيع الحاضر للبادي',
                    'النهي عن النجش',
                    'النهي عن تلقي الركبان',
                    'النهي عن الاحتكار',
                    'الإقالة لمن طلب الإقالة'
                ]
            }
        };

        // ══════════════════════════════════════════════════════════════════
        // ١٠. الرقمنة الشرعية
        // ══════════════════════════════════════════════════════════════════
        this.digitalSharia = {
            nameAr: 'الرقمنة الشرعية',
            nameEn: 'Digital Sharia Framework',
            description: 'تحويل العلوم الشرعية والأحكام الفقهية لأنظمة رقمية ذكية',
            systems: [
                {
                    nameAr: 'محرك الفتاوى الذكي',
                    nameEn: 'Smart Fatwa Engine',
                    features: ['بحث في قاعدة بيانات الفتاوى', 'تصنيف آلي للأسئلة', 'اقتراح فتاوى مشابهة', 'ربط بالأدلة الشرعية', 'تتبع المذاهب الأربعة'],
                    techStack: ['NLP عربي', 'قاعدة معرفية فقهية', 'AI Classification']
                },
                {
                    nameAr: 'نظام الامتثال الشرعي الرقمي',
                    nameEn: 'Digital Sharia Compliance System',
                    features: ['فحص آلي للعقود', 'التحقق من حلال المنتجات', 'مراقبة المعاملات المالية', 'تقارير امتثال', 'تنبيهات مخالفات'],
                    techStack: ['Rule Engine', 'Smart Contracts', 'Blockchain']
                },
                {
                    nameAr: 'منصة التعليم الشرعي الرقمي',
                    nameEn: 'Digital Islamic Education Platform',
                    features: ['دورات تفاعلية', 'تحفيظ القرآن بالذكاء الاصطناعي', 'تصحيح التلاوة', 'اختبارات ذكية', 'شهادات رقمية'],
                    techStack: ['Speech Recognition (Arabic)', 'Adaptive Learning', 'Gamification']
                },
                {
                    nameAr: 'قاعدة بيانات القرآن والحديث',
                    nameEn: 'Quran & Hadith Database',
                    features: ['بحث نصي ودلالي', 'تفسير متعدد', 'تخريج أحاديث', 'ربط موضوعي', 'سلسلة رواة', 'إعراب آلي'],
                    techStack: ['Vector Search', 'Knowledge Graph', 'Semantic Search']
                },
                {
                    nameAr: 'حاسبة الزكاة الذكية',
                    nameEn: 'Smart Zakat Calculator',
                    features: ['حساب زكاة المال', 'زكاة الذهب والفضة', 'زكاة الأسهم', 'زكاة العقارات', 'زكاة التجارة', 'تذكير بالحول', 'توزيع على المصارف'],
                    techStack: ['Financial Calculation Engine', 'Reminders', 'Payment Integration']
                },
                {
                    nameAr: 'حاسبة المواريث الذكية',
                    nameEn: 'Smart Inheritance Calculator',
                    features: ['حساب أنصبة الورثة', 'العول والرد', 'الحجب', 'المسائل المشهورة', 'تقرير تفصيلي'],
                    techStack: ['Algorithm based on Fara\'id Rules', 'Decision Tree']
                },
                {
                    nameAr: 'نظام الأوقات الشرعية',
                    nameEn: 'Islamic Times System',
                    features: ['مواقيت الصلاة', 'التقويم الهجري', 'اتجاه القبلة', 'أوقات الصيام', 'مواسم الحج والعمرة'],
                    techStack: ['Astronomical Calculations', 'GPS', 'Solar Position Algorithm']
                },
                {
                    nameAr: 'نظام الرقابة الشرعية الرقمي',
                    nameEn: 'Digital Sharia Supervision',
                    features: ['مراجعة عقود إلكترونية', 'فحص منتجات مالية', 'تقارير مجلس شرعي', 'أرشيف القرارات', 'تتبع التوصيات'],
                    techStack: ['Document Analysis AI', 'Workflow Engine', 'Compliance Dashboard']
                }
            ],
            aiApplications: [
                { nameAr: 'مساعد فقهي ذكي', description: 'إجابة الأسئلة الشرعية بناءً على القرآن والسنة وأقوال العلماء' },
                { nameAr: 'تصحيح التلاوة بالذكاء الاصطناعي', description: 'اكتشاف أخطاء التجويد تلقائياً' },
                { nameAr: 'تحليل النصوص الشرعية', description: 'استخلاص الأحكام والقواعد من كتب الفقه' },
                { nameAr: 'كشف المعاملات المحرمة', description: 'فحص تلقائي للمعاملات المالية' },
                { nameAr: 'ترجمة شرعية ذكية', description: 'ترجمة المصطلحات الشرعية بدقة لكل اللغات' },
                { nameAr: 'تتبع سلسلة الحلال', description: 'تتبع المنتجات من المصدر للمستهلك لضمان الحلال' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ١١. الأذكار والأدعية
        // ══════════════════════════════════════════════════════════════════
        this.adhkar = {
            nameAr: 'الأذكار والأدعية',
            nameEn: 'Supplications & Remembrance',
            categories: [
                { nameAr: 'أذكار الصباح والمساء', count: '≈ 30 ذكر' },
                { nameAr: 'أذكار بعد الصلاة', count: '≈ 15 ذكر' },
                { nameAr: 'أذكار النوم والاستيقاظ', count: '≈ 20 ذكر' },
                { nameAr: 'أدعية الطعام والشراب', count: '≈ 10' },
                { nameAr: 'أدعية السفر', count: '≈ 12' },
                { nameAr: 'أدعية المريض', count: '≈ 8' },
                { nameAr: 'أدعية الاستخارة', count: '1' },
                { nameAr: 'أدعية القرآنية', count: '≈ 50 دعاء' },
                { nameAr: 'أدعية جامعة', count: '≈ 40', featured: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // getDashboard
    // ═══════════════════════════════════════════════════════════════════════
    getDashboard() {
        return {
            engine: this.name,
            version: this.version,
            owner: this.owner,
            activatedAt: this.activatedAt,
            summary: {
                quranSurahs: this.quran.stats.surahs,
                quranAyahs: this.quran.stats.ayahs,
                quranSciences: this.quran.sciences.length,
                sunnahCollections: this.sunnah.majorCollections.length + this.sunnah.otherCollections.length,
                sunnahSciences: this.sunnah.sciences.length,
                aqeedahPillarsIslam: this.aqeedah.arkkanAlIslam.pillars.length,
                aqeedahPillarsIman: this.aqeedah.arkkanAlIman.pillars.length,
                usulSources: this.usulAlFiqh.sources.agreed.length + this.usulAlFiqh.sources.disputed.length,
                usulAhkam: this.usulAlFiqh.ahkam.types.length,
                usulQawaid: this.usulAlFiqh.qawaidFiqhiyyah.rules.length,
                fiqhMadhahib: this.fiqh.madhahib.length,
                fiqhDivisions: this.fiqh.divisions.length,
                maqasidLevels: this.maqasid.levels.length,
                maqasidDaruriyyat: this.maqasid.levels[0].items.length,
                islamicFinanceContracts: this.islamicFinance.contracts.length,
                islamicFinancePrinciples: this.islamicFinance.principles.length,
                akhlaqCategories: this.akhlaq.categories.length,
                seerahPeriods: this.seerah.periods.length,
                digitalShariaSystems: this.digitalSharia.systems.length,
                digitalShariaAI: this.digitalSharia.aiApplications.length,
                adhkarCategories: this.adhkar.categories.length
            },
            quran: this.quran,
            sunnah: this.sunnah,
            aqeedah: this.aqeedah,
            usulAlFiqh: this.usulAlFiqh,
            fiqh: this.fiqh,
            maqasid: this.maqasid,
            islamicFinance: this.islamicFinance,
            akhlaq: this.akhlaq,
            seerah: this.seerah,
            digitalSharia: this.digitalSharia,
            adhkar: this.adhkar
        };
    }
}

module.exports = SheikhaShareEngine;
