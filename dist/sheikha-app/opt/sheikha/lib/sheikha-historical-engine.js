"use strict";
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════
 * محرك التوثيق التاريخي الشامل — Sheikha Historical Documentation Engine
 * «وكل شيء فصّلناه تفصيلاً» — الإسراء ١٢
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة
 * ═══════════════════════════════════════════════════════════════
 * توثيق كامل لكل المعاملات التجارية والاقتصادية والدولية والمجتمعية
 * منذ عهد النبي ﷺ والصحابة إلى العصر الرقمي — بالتسلسل الزمني
 * ═══════════════════════════════════════════════════════════════
 */
class SheikhaHistoricalEngine {
    constructor() {
        this.id = 'SHEIKHA-HISTORICAL-DOC';
        this.nameAr = 'محرك التوثيق التاريخي الشامل';
        this.nameEn = 'Historical Documentation Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {
        // ══════════════════════════════════════════════════════════════
        // العصر الأول: عهد النبي ﷺ (١–١١ هـ / ٦٢٢–٦٣٢م)
        // ══════════════════════════════════════════════════════════════
        this.era1_Prophet = {
            id: 'ERA-01',
            nameAr: 'عهد النبي محمد ﷺ',
            period: '١–١١ هـ / ٦٢٢–٦٣٢م',
            quran: 'لقد كان لكم في رسول الله أسوة حسنة — الأحزاب ٢١',

            commercial: [
                {id:'PC-01', year:'١ هـ', event:'تأسيس سوق المناخة', type:'تجاري', detail:'أسس النبي ﷺ سوق المدينة الحر غرب المسجد النبوي — بلا خراج ولا بناء دائم', hadith:'هذا سوقكم فلا يُضيَّق ولا يُضرَب عليه خَراج', impact:'تحرير المسلمين من هيمنة أسواق اليهود', code:'SOUQ_FOUNDED'},
                {id:'PC-02', year:'١ هـ', event:'المؤاخاة بين المهاجرين والأنصار', type:'اقتصادي-مجتمعي', detail:'نظام شراكة اقتصادية فريد — الأنصار شاركوا المهاجرين أموالهم وأراضيهم', quran:'والذين تبوءوا الدار والإيمان من قبلهم يحبون من هاجر إليهم — الحشر ٩', impact:'أول نظام ضمان اجتماعي في الإسلام', code:'BROTHERHOOD_SYSTEM'},
                {id:'PC-03', year:'١ هـ', event:'عبدالرحمن بن عوف يبدأ التجارة من الصفر', type:'تجاري', detail:'رفض المعونة وقال دلوني على السوق — بدأ بتجارة الأقط والسمن', hadith:'أولم ولو بشاة بارك الله لك — متفق عليه', impact:'نموذج الاستقلال الاقتصادي والريادة', code:'IBN_AWF_START'},
                {id:'PC-04', year:'٢ هـ', event:'تشريع الزكاة', type:'اقتصادي-تشريعي', detail:'فرض الزكاة كنظام مالي اجتماعي — ٢.٥٪ من المال المدخر', quran:'وأقيموا الصلاة وآتوا الزكاة — البقرة ٤٣', impact:'أول نظام ضريبي اجتماعي عادل في التاريخ', code:'ZAKAT_LEGISLATED'},
                {id:'PC-05', year:'٢ هـ', event:'غزوة بدر — بُعدها الاقتصادي', type:'عسكري-اقتصادي', detail:'اعتراض قافلة أبي سفيان التجارية — تحويل الميزان الاقتصادي', quran:'وإذ يعدكم الله إحدى الطائفتين أنها لكم — الأنفال ٧', impact:'أول ضربة اقتصادية لقريش — إثبات قوة الدولة الإسلامية', code:'BADR_ECONOMIC'},
                {id:'PC-06', year:'٢ هـ', event:'تشريع أحكام البيوع', type:'تشريعي', detail:'نزول آيات البيوع وأحاديث تنظيم التجارة — تحريم الربا والغرر والنجش', quran:'وأحل الله البيع وحرم الربا — البقرة ٢٧٥', impact:'أساس التشريع التجاري الإسلامي', code:'TRADE_LAWS'},
                {id:'PC-07', year:'٣ هـ', event:'إجلاء بني قينقاع', type:'اقتصادي-عسكري', detail:'إجلاء يهود بني قينقاع الذين كانوا يسيطرون على تجارة الذهب والصاغة', impact:'انتقال السيادة التجارية على المعادن للمسلمين', code:'QAYNUQA_EXIT'},
                {id:'PC-08', year:'٤ هـ', event:'إجلاء بني النضير', type:'اقتصادي-عسكري', detail:'إجلاء بني النضير وتوزيع أراضيهم وأموالهم — نظام الفيء', quran:'ما أفاء الله على رسوله من أهل القرى — الحشر ٧', impact:'تعزيز الاستقلال الاقتصادي للمسلمين', code:'NADIR_EXIT'},
                {id:'PC-09', year:'٥ هـ', event:'غزوة الخندق والحصار الاقتصادي', type:'عسكري-اقتصادي', detail:'محاولة حصار اقتصادي وعسكري على المدينة — صمود المسلمين', quran:'يا أيها الذين آمنوا اذكروا نعمة الله عليكم إذ جاءتكم جنود — الأحزاب ٩', impact:'إثبات قدرة الاقتصاد الإسلامي على الصمود', code:'KHANDAQ_SIEGE'},
                {id:'PC-10', year:'٥ هـ', event:'إنهاء سيطرة بني قريظة', type:'اقتصادي-عسكري', detail:'القضاء على آخر قوة يهودية اقتصادية في المدينة', impact:'السيادة الاقتصادية الكاملة للمسلمين', code:'QURAYZA_END'},
                {id:'PC-11', year:'٦ هـ', event:'صلح الحديبية — البُعد التجاري', type:'دولي-تجاري', detail:'معاهدة سلام فتحت طرق التجارة وأمّنت القوافل', impact:'ازدهار تجاري غير مسبوق — دخول الناس في الإسلام أفواجاً', code:'HUDAYBIYYA'},
                {id:'PC-12', year:'٧ هـ', event:'فتح خيبر — الثروة الزراعية', type:'اقتصادي-زراعي', detail:'فتح خيبر ونظام المزارعة — المسلمون يتملكون الأراضي الزراعية الخصبة', impact:'الأمن الغذائي للدولة الإسلامية', code:'KHAYBAR'},
                {id:'PC-13', year:'٧ هـ', event:'رسائل النبي ﷺ للملوك', type:'دولي', detail:'إرسال رسائل لكسرى وقيصر والنجاشي والمقوقس — دبلوماسية دولية', impact:'أول علاقات دولية إسلامية رسمية', code:'LETTERS_TO_KINGS'},
                {id:'PC-14', year:'٧ هـ', event:'شراء بئر رومة', type:'اقتصادي-مائي', detail:'اشتراها عثمان بن عفان من أرباح التجارة وجعلها وقفاً للمسلمين', hadith:'من يشتري بئر رومة فيجعل فيها دلوه مع دلاء المسلمين — البخاري', impact:'الاستقلال المائي — إنهاء سلاح العطش', code:'RUMAH_WELL'},
                {id:'PC-15', year:'٨ هـ', event:'فتح مكة — السيادة الاقتصادية الكاملة', type:'عسكري-اقتصادي', detail:'سقوط مكة المركز التجاري الأكبر في الجزيرة العربية بيد المسلمين', impact:'المسلمون يسيطرون على محور التجارة العالمي بين اليمن والشام', code:'MAKKAH_CONQUEST'},
                {id:'PC-16', year:'٩ هـ', event:'عام الوفود — اتفاقيات تجارية', type:'دولي-تجاري', detail:'وفود القبائل تأتي للمدينة لعقد اتفاقيات سياسية وتجارية', impact:'توسع الشبكة التجارية الإسلامية لتشمل الجزيرة كلها', code:'DELEGATIONS_YEAR'},
                {id:'PC-17', year:'٩ هـ', event:'غزوة تبوك — القوة الاقتصادية', type:'عسكري-اقتصادي', detail:'تجهيز جيش العسرة — عثمان جهز ثلث الجيش من ماله — عبدالرحمن بن عوف تبرع بنصف ماله', hadith:'ما ضر عثمان ما عمل بعد اليوم — الترمذي', impact:'إثبات قدرة الاقتصاد الإسلامي على تمويل الحملات الكبرى', code:'TABUK'},
                {id:'PC-18', year:'١٠ هـ', event:'حجة الوداع — التشريع النهائي', type:'تشريعي', detail:'خطبة الوداع تضمنت تأكيد تحريم الربا والدماء والأموال', hadith:'إن دماءكم وأموالكم حرام عليكم كحرمة يومكم هذا — متفق عليه', impact:'التأسيس النهائي للنظام الاقتصادي الإسلامي', code:'FAREWELL_PILGRIMAGE'}
            ],

            laws: [
                {id:'PL-01', nameAr:'تحريم الربا', quran:'وأحل الله البيع وحرم الربا — البقرة ٢٧٥', code:'RIBA = false'},
                {id:'PL-02', nameAr:'تحريم الغش', hadith:'من غش فليس مني — مسلم', code:'FRAUD = false'},
                {id:'PL-03', nameAr:'تحريم الاحتكار', hadith:'لا يحتكر إلا خاطئ — مسلم', code:'MONOPOLY = false'},
                {id:'PL-04', nameAr:'تحريم الغرر', hadith:'نهى عن بيع الغرر — مسلم', code:'GHARAR = false'},
                {id:'PL-05', nameAr:'تحريم النجش', hadith:'نهى عن النجش — متفق عليه', code:'NAJSH = false'},
                {id:'PL-06', nameAr:'البيع عن تراض', hadith:'إنما البيع عن تراض — ابن ماجه', code:'CONSENT = true'},
                {id:'PL-07', nameAr:'خيار المجلس', hadith:'البيّعان بالخيار ما لم يتفرقا — متفق عليه', code:'SESSION_OPTION = true'},
                {id:'PL-08', nameAr:'التقابض الفوري للمعادن', hadith:'الذهب بالذهب يداً بيد مثلاً بمثل — مسلم', code:'HAND_TO_HAND = true'},
                {id:'PL-09', nameAr:'حرية التسعير', hadith:'إن الله هو المسعّر — أبو داود', code:'FREE_PRICING = true'},
                {id:'PL-10', nameAr:'الوفاء بالعقود', quran:'أوفوا بالعقود — المائدة ١', code:'CONTRACTS = true'},
                {id:'PL-11', nameAr:'الزكاة', quran:'وآتوا الزكاة — البقرة ٤٣', code:'ZAKAT = true'},
                {id:'PL-12', nameAr:'تحريم أكل أموال الناس بالباطل', quran:'لا تأكلوا أموالكم بينكم بالباطل — النساء ٢٩', code:'BATIL = false'}
            ]
        };

        // ══════════════════════════════════════════════════════════════
        // العصر الثاني: الخلافة الراشدة (١١–٤٠ هـ / ٦٣٢–٦٦١م)
        // ══════════════════════════════════════════════════════════════
        this.era2_Rashidun = {
            id: 'ERA-02',
            nameAr: 'عهد الخلفاء الراشدين',
            period: '١١–٤٠ هـ / ٦٣٢–٦٦١م',
            hadith: 'عليكم بسنتي وسنة الخلفاء الراشدين المهديين — أبو داود',

            abuBakr: {
                period: '١١–١٣ هـ',
                events: [
                    {id:'AB-01', year:'١١ هـ', event:'حروب الردة — حماية الاقتصاد', type:'عسكري-اقتصادي', detail:'إجبار القبائل المرتدة على دفع الزكاة — حماية النظام المالي الإسلامي', hadith:'والله لو منعوني عقال بعير كانوا يؤدونه إلى رسول الله لقاتلتهم عليه', impact:'تثبيت النظام المالي الإسلامي', code:'RIDDA_WARS'},
                    {id:'AB-02', year:'١٢ هـ', event:'بداية الفتوحات — العراق والشام', type:'دولي-اقتصادي', detail:'فتح طرق تجارية جديدة نحو العراق والشام', impact:'توسع الشبكة التجارية الإسلامية دولياً', code:'CONQUESTS_BEGIN'},
                    {id:'AB-03', year:'١١ هـ', event:'تنظيم بيت المال', type:'مالي', detail:'إنشاء بيت المال كمؤسسة مالية مركزية للدولة', impact:'أول وزارة مالية في الإسلام', code:'BAYT_MAL'}
                ]
            },

            umar: {
                period: '١٣–٢٣ هـ',
                events: [
                    {id:'UM-01', year:'١٥ هـ', event:'فتح العراق — موارد جديدة', type:'اقتصادي-عسكري', detail:'فتح العراق واكتساب أراض زراعية خصبة ونهري دجلة والفرات', impact:'مضاعفة الموارد الاقتصادية للدولة', code:'IRAQ_CONQUEST'},
                    {id:'UM-02', year:'١٥ هـ', event:'تأسيس الدواوين', type:'إداري', detail:'إنشاء ديوان الجند وديوان العطاء — أول نظام إداري مالي منظم', impact:'تنظيم الرواتب والمصروفات والإيرادات', code:'DIWAN_SYSTEM'},
                    {id:'UM-03', year:'١٦ هـ', event:'تأسيس البصرة والكوفة', type:'عمراني-اقتصادي', detail:'بناء مدن جديدة كمراكز تجارية وإدارية', impact:'إنشاء أقطاب تجارية جديدة', code:'CITIES_FOUNDED'},
                    {id:'UM-04', year:'٢٠ هـ', event:'فتح مصر — سلة غذاء الأمة', type:'اقتصادي-زراعي', detail:'فتح مصر وتأمين إمدادات الحبوب من وادي النيل', impact:'الأمن الغذائي الاستراتيجي للعالم الإسلامي', code:'EGYPT_CONQUEST'},
                    {id:'UM-05', year:'٢٠ هـ', event:'ضرب أول عملة إسلامية', type:'مالي', detail:'بداية سك العملة الإسلامية المستقلة', impact:'الاستقلال النقدي عن الفرس والروم', code:'FIRST_CURRENCY'},
                    {id:'UM-06', year:'١٨ هـ', event:'عام الرمادة — إدارة الأزمة الغذائية', type:'اقتصادي-إنساني', detail:'مجاعة شديدة أدارها عمر بتوزيع عادل — استيراد الغذاء من مصر والشام', impact:'أول نظام إغاثة طوارئ في التاريخ', code:'RAMADA_YEAR'},
                    {id:'UM-07', year:'١٥ هـ', event:'نظام الخراج', type:'ضريبي', detail:'تنظيم الخراج على الأراضي المفتوحة — عدم تقسيمها بل إبقاؤها للمصلحة العامة', impact:'أول نظام ضريبي زراعي عادل', code:'KHARAJ_SYSTEM'},
                    {id:'UM-08', year:'٢٣ هـ', event:'تنظيم الأسواق ورقابة المحتسب', type:'رقابي', detail:'عمر ولّى سمراء بنت نهيك الأسدية محتسبة على أسواق المدينة — أول امرأة محتسبة', impact:'تطوير نظام الحسبة والرقابة', code:'HISBAH_WOMEN'},
                    {id:'UM-09', year:'٢٠ هـ', event:'التقويم الهجري', type:'إداري', detail:'اعتماد التقويم الهجري لتوثيق العقود والمعاملات', impact:'نظام تاريخ موحد للعالم الإسلامي', code:'HIJRI_CALENDAR'}
                ]
            },

            uthman: {
                period: '٢٣–٣٥ هـ',
                events: [
                    {id:'UT-01', year:'٢٥ هـ', event:'الاتساع التجاري الهائل', type:'اقتصادي', detail:'توسع الدولة لتشمل شمال أفريقيا وفارس — ازدهار تجاري غير مسبوق', impact:'أكبر منطقة تجارة حرة في العالم القديم', code:'TRADE_EXPANSION'},
                    {id:'UT-02', year:'٣٠ هـ', event:'بناء أول أسطول بحري إسلامي', type:'عسكري-تجاري', detail:'بناء الأسطول وفتح قبرص — تأمين طرق التجارة البحرية', impact:'السيطرة على التجارة البحرية في المتوسط', code:'NAVAL_FLEET'},
                    {id:'UT-03', year:'٢٦ هـ', event:'توسعة المسجد النبوي', type:'عمراني', detail:'توسعة المسجد من أرباح التجارة — ربط العبادة بالاقتصاد', impact:'التنمية العمرانية من إيرادات التجارة', code:'MOSQUE_EXPANSION'},
                    {id:'UT-04', year:'٣٠ هـ', event:'ازدهار ثروات الصحابة التجار', type:'تجاري', detail:'قافلة عبدالرحمن بن عوف ذات ٧٠٠ ناقة — ثروات عثمان وطلحة والزبير', impact:'تمويل الفتوحات والمشاريع من ثروات التجار', code:'SAHABA_WEALTH'}
                ]
            },

            ali: {
                period: '٣٥–٤٠ هـ',
                events: [
                    {id:'AL-01', year:'٣٦ هـ', event:'نقل العاصمة إلى الكوفة', type:'إداري-اقتصادي', detail:'نقل مركز الثقل الاقتصادي إلى العراق', impact:'تنويع المراكز الاقتصادية', code:'KUFA_CAPITAL'},
                    {id:'AL-02', year:'٣٧ هـ', event:'تنظيم بيت المال في الكوفة', type:'مالي', detail:'إعادة هيكلة بيت المال وتوزيع العطاء بالعدل', impact:'مبدأ العدالة المطلقة في توزيع الثروة', code:'BAYT_MAL_REFORM'}
                ]
            }
        };

        // ══════════════════════════════════════════════════════════════
        // العصر الثالث: الأموي (٤١–١٣٢ هـ / ٦٦١–٧٥٠م)
        // ══════════════════════════════════════════════════════════════
        this.era3_Umayyad = {
            id: 'ERA-03',
            nameAr: 'العصر الأموي',
            period: '٤١–١٣٢ هـ / ٦٦١–٧٥٠م',
            events: [
                {id:'UY-01', year:'٧٤ هـ', event:'تعريب العملة — عبدالملك بن مروان', type:'مالي', detail:'سك أول دينار ذهبي إسلامي خالص بدلاً من العملات البيزنطية والفارسية — كُتب عليه لا إله إلا الله', impact:'الاستقلال النقدي الكامل للعالم الإسلامي', code:'ISLAMIC_CURRENCY'},
                {id:'UY-02', year:'٧٥ هـ', event:'تعريب الدواوين', type:'إداري', detail:'تحويل لغة الدواوين المالية من اليونانية والفارسية إلى العربية', impact:'السيادة الإدارية واللغوية', code:'ARABIC_ADMIN'},
                {id:'UY-03', year:'٩٢ هـ', event:'فتح الأندلس — طرق تجارة أوروبا', type:'دولي-تجاري', detail:'فتح الأندلس وربط العالم الإسلامي بأسواق أوروبا', impact:'إمبراطورية تجارية من الصين إلى إسبانيا', code:'ANDALUS'},
                {id:'UY-04', year:'٩٣ هـ', event:'فتح السند — طريق الحرير', type:'دولي-تجاري', detail:'فتح السند وربط التجارة الإسلامية بالهند والصين', impact:'السيطرة على طريق الحرير', code:'SIND'},
                {id:'UY-05', year:'١٠٠ هـ', event:'عمر بن عبدالعزيز — العدالة الاقتصادية', type:'اقتصادي', detail:'عدالة اقتصادية حتى لم يجد فقيراً يأخذ الزكاة', impact:'النموذج الأمثل للعدالة الاقتصادية الإسلامية', code:'UMAR_II_JUSTICE'}
            ]
        };

        // ══════════════════════════════════════════════════════════════
        // العصر الرابع: العباسي (١٣٢–٦٥٦ هـ / ٧٥٠–١٢٥٨م)
        // ══════════════════════════════════════════════════════════════
        this.era4_Abbasid = {
            id: 'ERA-04',
            nameAr: 'العصر العباسي',
            period: '١٣٢–٦٥٦ هـ / ٧٥٠–١٢٥٨م',
            events: [
                {id:'ABS-01', year:'١٤٥ هـ', event:'تأسيس بغداد — عاصمة التجارة العالمية', type:'عمراني-تجاري', detail:'بناء بغداد كأكبر مركز تجاري في العالم — سوق الكرخ الأشهر عالمياً', impact:'بغداد مركز التجارة العالمية لخمسة قرون', code:'BAGHDAD'},
                {id:'ABS-02', year:'٢٠٠ هـ', event:'ازدهار الصكوك والتحويلات المالية', type:'مالي', detail:'اختراع نظام الصكوك (الشيكات) والحوالات المالية — سبق أوروبا بـ ٦٠٠ سنة', impact:'أول نظام مصرفي منظم في التاريخ', code:'SUKUK_SYSTEM'},
                {id:'ABS-03', year:'٣٠٠ هـ', event:'طريق الحرير الإسلامي', type:'دولي-تجاري', detail:'سيطرة التجار المسلمين على طريق الحرير من الصين إلى الأندلس', impact:'أكبر شبكة تجارية عالمية في التاريخ القديم', code:'SILK_ROAD'},
                {id:'ABS-04', year:'٢٥٠ هـ', event:'كتاب الخراج لأبي يوسف', type:'تشريعي', detail:'أول كتاب متخصص في الاقتصاد المالي والضرائب الإسلامية', impact:'تأسيس علم المالية العامة الإسلامية', code:'KITAB_KHARAJ'},
                {id:'ABS-05', year:'٣٥٠ هـ', event:'ازدهار التجارة البحرية', type:'تجاري-بحري', detail:'سيطرة التجار المسلمين على المحيط الهندي والبحر المتوسط', impact:'القوة البحرية التجارية الأولى عالمياً', code:'MARITIME_TRADE'},
                {id:'ABS-06', year:'٤٠٠ هـ', event:'نظام الأوقاف', type:'اقتصادي-اجتماعي', detail:'انتشار نظام الأوقاف — تمويل المستشفيات والمدارس والمساجد', impact:'أول نظام قطاع ثالث غير ربحي في التاريخ', code:'WAQF_SYSTEM'},
                {id:'ABS-07', year:'٦٥٦ هـ', event:'سقوط بغداد — نهاية العصر الذهبي', type:'عسكري-اقتصادي', detail:'غزو المغول لبغداد — تدمير المركز التجاري العالمي', impact:'ضربة قاسية للاقتصاد الإسلامي — لكن الحضارة استمرت', code:'BAGHDAD_FALL'}
            ]
        };

        // ══════════════════════════════════════════════════════════════
        // العصر الخامس: العثماني والحديث
        // ══════════════════════════════════════════════════════════════
        this.era5_OttomanModern = {
            id: 'ERA-05',
            nameAr: 'العصر العثماني والحديث',
            period: '٩٢٣–١٣٤٢ هـ / ١٥١٧–١٩٢٤م',
            events: [
                {id:'OT-01', year:'٩٢٣ هـ', event:'الدولة العثمانية تتولى حماية الحرمين', type:'دولي', detail:'حماية طرق الحج والتجارة بين الحجاز والشام', impact:'أمن التجارة في الحجاز واستقرار الحج', code:'OTTOMAN_HIJAZ'},
                {id:'OT-02', year:'١١٠٠ هـ', event:'البازارات الكبرى', type:'تجاري', detail:'أسواق إسطنبول والقاهرة ودمشق — امتداد لنموذج سوق المدينة', impact:'استمرار التقاليد التجارية الإسلامية عبر القرون', code:'BAZAARS'},
                {id:'OT-03', year:'١٢٥٠ هـ', event:'بداية التغلغل الاقتصادي الغربي', type:'اقتصادي', detail:'الامتيازات الأجنبية — بداية التبعية الاقتصادية', impact:'ضعف الاستقلال الاقتصادي الإسلامي', code:'WESTERN_INFLUENCE'},
                {id:'OT-04', year:'١٣٤٢ هـ', event:'سقوط الخلافة — بداية التبعية الاقتصادية', type:'سياسي-اقتصادي', detail:'سقوط الخلافة العثمانية وتحول العالم الإسلامي للنظام الاقتصادي الغربي', impact:'فقدان الاستقلال الاقتصادي — بداية عصر التبعية', code:'CALIPHATE_END'}
            ]
        };

        // ══════════════════════════════════════════════════════════════
        // العصر السادس: المعاصر والرقمي
        // ══════════════════════════════════════════════════════════════
        this.era6_Contemporary = {
            id: 'ERA-06',
            nameAr: 'العصر المعاصر والرقمي',
            period: '١٣٤٢ هـ حتى الآن',
            events: [
                {id:'CT-01', year:'١٣٧٥ هـ / ١٩٥٥م', event:'بداية حركة التمويل الإسلامي', type:'مالي', detail:'أولى المحاولات لإنشاء نظام مالي إسلامي بعيداً عن الربا', impact:'بذور عودة الاقتصاد الإسلامي', code:'ISLAMIC_FINANCE_START'},
                {id:'CT-02', year:'١٣٩٥ هـ / ١٩٧٥م', event:'تأسيس البنك الإسلامي للتنمية', type:'مالي-دولي', detail:'إنشاء أول مؤسسة مالية إسلامية دولية بجدة', impact:'عودة التمويل الإسلامي المؤسسي', code:'IDB'},
                {id:'CT-03', year:'١٣٩٥ هـ / ١٩٧٥م', event:'انطلاق الصيرفة الإسلامية', type:'مالي', detail:'تأسيس أول بنك إسلامي تجاري — بنك دبي الإسلامي', impact:'بداية صناعة التمويل الإسلامي العالمية', code:'ISLAMIC_BANKING'},
                {id:'CT-04', year:'١٤١٠ هـ / ١٩٩٠م', event:'نمو صناعة التكافل', type:'مالي', detail:'انتشار التأمين الإسلامي (التكافل) كبديل شرعي', impact:'تكامل منظومة التمويل الإسلامي', code:'TAKAFUL'},
                {id:'CT-05', year:'١٤٢٥ هـ / ٢٠٠٤م', event:'ازدهار الصكوك الإسلامية', type:'مالي', detail:'نمو سوق الصكوك الإسلامية عالمياً لتتجاوز التريليون دولار', impact:'بديل إسلامي ناجح للسندات الربوية', code:'SUKUK_BOOM'},
                {id:'CT-06', year:'١٤٤٠ هـ / ٢٠١٩م', event:'الاقتصاد الرقمي الإسلامي', type:'تقني-مالي', detail:'ظهور منصات التمويل الجماعي الإسلامي والتقنية المالية الشرعية', impact:'دخول الاقتصاد الإسلامي عصر الرقمنة', code:'FINTECH_ISLAMIC'},
                {id:'CT-07', year:'١٤٤٦ هـ / ٢٠٢٥م', event:'تأسيس منظومة شيخة — رقمنة سوق المدينة', type:'تجاري-رقمي', detail:'أول سوق إسلامي رقمي شامل على نهج سوق المناخة — رقمنة كاملة بالكتاب والسنة', quran:'إنا نحن نزلنا الذكر وإنا له لحافظون — الحجر ٩', impact:'عودة روح سوق المدينة في العصر الرقمي', code:'SHEIKHA_FOUNDED'},
                {id:'CT-08', year:'١٤٤٦ هـ / ٢٠٢٥م', event:'محرك التوثيق التاريخي الشامل', type:'تقني', detail:'رقمنة كاملة لكل الأحداث والمعاملات من عهد النبي ﷺ إلى الآن — بالكتاب والسنة', impact:'أول أرشيف رقمي شامل للتاريخ الاقتصادي الإسلامي', code:'HISTORICAL_ENGINE'}
            ]
        };

        // ══════════════════════════════════════════════════════════════
        // القوانين الشرعية الشاملة — من الكتاب
        // ══════════════════════════════════════════════════════════════
        this.lawsFromQuran = [
            {id:'QL-01', text:'وأحل الله البيع وحرم الربا', ref:'البقرة ٢٧٥', principle:'إباحة التجارة وتحريم الربا', code:'HALAL_TRADE'},
            {id:'QL-02', text:'لا تأكلوا أموالكم بينكم بالباطل إلا أن تكون تجارة عن تراض', ref:'النساء ٢٩', principle:'التراضي شرط البيع', code:'MUTUAL_CONSENT'},
            {id:'QL-03', text:'أوفوا بالعقود', ref:'المائدة ١', principle:'وجوب الوفاء بالعقود', code:'HONOR_CONTRACTS'},
            {id:'QL-04', text:'وأقيموا الوزن بالقسط ولا تخسروا الميزان', ref:'الرحمن ٩', principle:'العدل في الموازين', code:'FAIR_WEIGHTS'},
            {id:'QL-05', text:'ويل للمطففين', ref:'المطففين ١', principle:'تحريم التطفيف والغش', code:'NO_CHEATING'},
            {id:'QL-06', text:'وأعدوا لهم ما استطعتم من قوة', ref:'الأنفال ٦٠', principle:'القوة الاقتصادية جزء من إعداد القوة', code:'ECONOMIC_STRENGTH'},
            {id:'QL-07', text:'هو الذي جعل لكم الأرض ذلولاً فامشوا في مناكبها وكلوا من رزقه', ref:'الملك ١٥', principle:'السعي في طلب الرزق واجب', code:'SEEK_LIVELIHOOD'},
            {id:'QL-08', text:'إن تنصروا الله ينصركم ويثبت أقدامكم', ref:'محمد ٧', principle:'نصر الله يجلب النصر في كل المجالات', code:'DIVINE_SUPPORT'},
            {id:'QL-09', text:'ولا تهنوا ولا تحزنوا وأنتم الأعلون إن كنتم مؤمنين', ref:'آل عمران ١٣٩', principle:'العلو والقوة للمؤمنين الصادقين', code:'BELIEVERS_SUPREME'},
            {id:'QL-10', text:'كنتم خير أمة أخرجت للناس تأمرون بالمعروف وتنهون عن المنكر', ref:'آل عمران ١١٠', principle:'الأمر بالمعروف في التجارة والنهي عن المنكر', code:'ENJOIN_GOOD'},
            {id:'QL-11', text:'وكل شيء فصّلناه تفصيلاً', ref:'الإسراء ١٢', principle:'التفصيل والتوثيق الشامل', code:'DETAILED_DOCS'},
            {id:'QL-12', text:'وأشهدوا إذا تبايعتم', ref:'البقرة ٢٨٢', principle:'توثيق المعاملات والإشهاد عليها', code:'DOCUMENTATION'}
        ];

        // ══════════════════════════════════════════════════════════════
        // القوانين الشرعية الشاملة — من السنة
        // ══════════════════════════════════════════════════════════════
        this.lawsFromSunnah = [
            {id:'SL-01', text:'هذا سوقكم فلا يُضيَّق ولا يُضرَب عليه خَراج', ref:'رواه ابن ماجه', principle:'حرية السوق — صفر ضرائب', code:'FREE_MARKET'},
            {id:'SL-02', text:'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء', ref:'الترمذي', principle:'مكانة التاجر الصادق الأمين', code:'HONEST_TRADER'},
            {id:'SL-03', text:'من غش فليس مني', ref:'مسلم', principle:'تحريم الغش المطلق', code:'NO_FRAUD'},
            {id:'SL-04', text:'لا يحتكر إلا خاطئ', ref:'مسلم', principle:'تحريم الاحتكار', code:'NO_MONOPOLY'},
            {id:'SL-05', text:'لا ضرر ولا ضرار', ref:'ابن ماجه', principle:'منع الإضرار بالآخرين', code:'NO_HARM'},
            {id:'SL-06', text:'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف', ref:'مسلم', principle:'طلب القوة بما فيها الاقتصادية', code:'STRONG_BELIEVER'},
            {id:'SL-07', text:'إن الله هو المسعّر القابض الباسط الرزّاق', ref:'أبو داود', principle:'حرية الأسعار والتوكل على الله', code:'FREE_PRICING'},
            {id:'SL-08', text:'رحم الله رجلاً سمحاً إذا باع وإذا اشترى وإذا اقتضى', ref:'البخاري', principle:'السماحة في المعاملات التجارية', code:'LENIENCY'},
            {id:'SL-09', text:'من أقال مسلماً أقاله الله عثرته يوم القيامة', ref:'أبو داود', principle:'إقالة النادم من البيع', code:'RELIEVE_REGRET'},
            {id:'SL-10', text:'إن دماءكم وأموالكم وأعراضكم حرام عليكم', ref:'متفق عليه — خطبة الوداع', principle:'حرمة الأموال والأعراض', code:'SACRED_WEALTH'},
            {id:'SL-11', text:'البيّعان بالخيار ما لم يتفرقا', ref:'متفق عليه', principle:'خيار المجلس', code:'SESSION_OPTION'},
            {id:'SL-12', text:'الذهب بالذهب والفضة بالفضة يداً بيد مثلاً بمثل', ref:'مسلم', principle:'ضوابط تبادل المعادن', code:'METALS_RULES'}
        ];

        // ══════════════════════════════════════════════════════════════
        // المواصفات والخواص
        // ══════════════════════════════════════════════════════════════
        this.specifications = [
            {id:'SP-01', nameAr:'التسلسل الزمني الكامل', detail:'توثيق حسب التسلسل الزمني من ١ هـ إلى ١٤٤٦ هـ', code:'CHRONOLOGICAL'},
            {id:'SP-02', nameAr:'التوثيق بالكتاب والسنة', detail:'كل حدث موثق بآية قرآنية أو حديث نبوي أو مصدر تاريخي موثوق', code:'QURAN_SUNNAH_REF'},
            {id:'SP-03', nameAr:'التصنيف المتعدد', detail:'تصنيف الأحداث إلى: تجاري، اقتصادي، عسكري، دولي، مجتمعي، تشريعي، مالي', code:'MULTI_CATEGORY'},
            {id:'SP-04', nameAr:'تحليل الأثر', detail:'لكل حدث تحليل أثره على الاقتصاد الإسلامي والعالمي', code:'IMPACT_ANALYSIS'},
            {id:'SP-05', nameAr:'الترميز الرقمي', detail:'لكل حدث وقانون رمز رقمي فريد للربط بالأنظمة الأخرى', code:'DIGITAL_CODING'},
            {id:'SP-06', nameAr:'٦ عصور تاريخية', detail:'من النبي ﷺ إلى العصر الرقمي — تغطية شاملة', code:'SIX_ERAS'},
            {id:'SP-07', nameAr:'القوانين المرجعية', detail:'١٢ قانون من القرآن + ١٢ قانون من السنة + ١٢ قانون من عهد النبي ﷺ', code:'REFERENCE_LAWS'},
            {id:'SP-08', nameAr:'التكامل مع محركات شيخة', detail:'ربط مع محرك سوق المدينة ومحرك الحكمة وبقية المحركات', code:'ENGINE_INTEGRATION'}
        ];
    }

    // ══════════════════════════════════════════════════════════════
    // الدوال — Methods
    // ══════════════════════════════════════════════════════════════

    getDashboard() {
        const e1 = this.era1_Prophet.commercial.length;
        const e1l = this.era1_Prophet.laws.length;
        const e2ab = this.era2_Rashidun.abuBakr.events.length;
        const e2um = this.era2_Rashidun.umar.events.length;
        const e2ut = this.era2_Rashidun.uthman.events.length;
        const e2al = this.era2_Rashidun.ali.events.length;
        const e3 = this.era3_Umayyad.events.length;
        const e4 = this.era4_Abbasid.events.length;
        const e5 = this.era5_OttomanModern.events.length;
        const e6 = this.era6_Contemporary.events.length;
        const totalEvents = e1 + e2ab + e2um + e2ut + e2al + e3 + e4 + e5 + e6;
        const ql = this.lawsFromQuran.length;
        const sl = this.lawsFromSunnah.length;

        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            engine: this.nameAr,
            version: this.version,
            owner: this.owner,
            quran: 'وكل شيء فصّلناه تفصيلاً — الإسراء ١٢',
            summary: {
                totalEras: 6,
                totalEvents,
                prophetEraEvents: e1,
                prophetEraLaws: e1l,
                rashidunEvents: e2ab + e2um + e2ut + e2al,
                umayyadEvents: e3,
                abbasidEvents: e4,
                ottomanEvents: e5,
                contemporaryEvents: e6,
                quranicLaws: ql,
                sunnahLaws: sl,
                totalLaws: e1l + ql + sl,
                specifications: this.specifications.length
            },
            eras: [
                { id: 'ERA-01', name: this.era1_Prophet.nameAr, period: this.era1_Prophet.period, events: e1, laws: e1l },
                { id: 'ERA-02', name: this.era2_Rashidun.nameAr, period: this.era2_Rashidun.period, events: e2ab + e2um + e2ut + e2al },
                { id: 'ERA-03', name: this.era3_Umayyad.nameAr, period: this.era3_Umayyad.period, events: e3 },
                { id: 'ERA-04', name: this.era4_Abbasid.nameAr, period: this.era4_Abbasid.period, events: e4 },
                { id: 'ERA-05', name: this.era5_OttomanModern.nameAr, period: this.era5_OttomanModern.period, events: e5 },
                { id: 'ERA-06', name: this.era6_Contemporary.nameAr, period: this.era6_Contemporary.period, events: e6 }
            ]
        };
    }

    getEra(eraId) {
        const map = {
            'ERA-01': this.era1_Prophet,
            'ERA-02': this.era2_Rashidun,
            'ERA-03': this.era3_Umayyad,
            'ERA-04': this.era4_Abbasid,
            'ERA-05': this.era5_OttomanModern,
            'ERA-06': this.era6_Contemporary
        };
        return map[eraId] || null;
    }

    getLaws() {
        return {
            prophetEraLaws: this.era1_Prophet.laws,
            quranicLaws: this.lawsFromQuran,
            sunnahLaws: this.lawsFromSunnah,
            totalCount: this.era1_Prophet.laws.length + this.lawsFromQuran.length + this.lawsFromSunnah.length
        };
    }

    getSpecifications() {
        return this.specifications;
    }

    getAllEvents() {
        const all = [];
        this.era1_Prophet.commercial.forEach(e => all.push({ ...e, era: 'عهد النبي ﷺ' }));
        this.era2_Rashidun.abuBakr.events.forEach(e => all.push({ ...e, era: 'أبو بكر الصديق' }));
        this.era2_Rashidun.umar.events.forEach(e => all.push({ ...e, era: 'عمر بن الخطاب' }));
        this.era2_Rashidun.uthman.events.forEach(e => all.push({ ...e, era: 'عثمان بن عفان' }));
        this.era2_Rashidun.ali.events.forEach(e => all.push({ ...e, era: 'علي بن أبي طالب' }));
        this.era3_Umayyad.events.forEach(e => all.push({ ...e, era: 'العصر الأموي' }));
        this.era4_Abbasid.events.forEach(e => all.push({ ...e, era: 'العصر العباسي' }));
        this.era5_OttomanModern.events.forEach(e => all.push({ ...e, era: 'العصر العثماني والحديث' }));
        this.era6_Contemporary.events.forEach(e => all.push({ ...e, era: 'العصر المعاصر والرقمي' }));
        return all;
    }

    searchEvents(keyword) {
        return this.getAllEvents().filter(e =>
            e.event.includes(keyword) ||
            e.detail.includes(keyword) ||
            (e.impact && e.impact.includes(keyword)) ||
            (e.type && e.type.includes(keyword))
        );
    }

    getTimeline() {
        return this.getAllEvents().map(e => ({
            year: e.year,
            event: e.event,
            type: e.type,
            era: e.era,
            code: e.code
        }));
    }
}

module.exports = SheikhaHistoricalEngine;
