/**
 * بسم الله الرحمن الرحيم
 * SHEIKHA INSTRUCTIONS ENGINE — منظومة التعليمات والإجراءات والتعريفات ورحلة المستخدم
 * المالك: سلمان أحمد بن سلمان الراجح
 * "فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ" النحل 43
 */
'use strict';
class SheikhaInstructionsEngine {
    constructor() {
        this.name = 'Sheikha Instructions Engine';
        this.nameAr = 'منظومة شيخة للتعليمات والإجراءات والتعريفات';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }
    _init() {
        this.quranReferences = [
            {ayah:'فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ',surah:'النحل',num:43,topic:'طلب العلم والسؤال'},
            {ayah:'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',surah:'البقرة',num:31,topic:'التعريف والتسمية'},
            {ayah:'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',surah:'العلق',num:1,topic:'القراءة والتعلم'},
            {ayah:'وَقُل رَّبِّ زِدْنِي عِلْمًا',surah:'طه',num:114,topic:'الاستزادة من العلم'}
        ];
        this.definitions = {
            nameAr:'التعريفات',nameEn:'Definitions & Glossary',
            categories:[
                {nameAr:'تعريفات شيخة الأساسية',nameEn:'Core Sheikha Definitions',
                 terms:[
                    {termAr:'شيخة',termEn:'Sheikha',defAr:'منظومة رقمية شاملة مبنية على الكتاب والسنة، تهدف لخدمة الإنسان والمجتمع وفق الشريعة الإسلامية',defEn:'Comprehensive digital ecosystem built on Quran and Sunnah'},
                    {termAr:'المحرك',termEn:'Engine',defAr:'وحدة برمجية متكاملة تؤدي وظيفة محددة ضمن منظومة شيخة',defEn:'Self-contained software module within Sheikha ecosystem'},
                    {termAr:'مؤشر النضج SMI',termEn:'Sheikha Maturity Index',defAr:'مقياس من 0 إلى 100 يحدد مستوى نضج واكتمال المنظومة',defEn:'0-100 score measuring system maturity'},
                    {termAr:'الرقمنة',termEn:'Digitization',defAr:'تحويل المعلومات والخدمات إلى صيغة رقمية متاحة إلكترونياً',defEn:'Converting information to digital format'},
                    {termAr:'الامتثال الشرعي',termEn:'Sharia Compliance',defAr:'التزام كل مكونات المنظومة بأحكام الشريعة الإسلامية',defEn:'Adherence to Islamic Sharia principles'}
                 ]},
                {nameAr:'تعريفات تقنية',nameEn:'Technical Definitions',
                 terms:[
                    {termAr:'API',termEn:'Application Programming Interface',defAr:'واجهة برمجة تطبيقات — طريقة التواصل بين الأنظمة',defEn:'Interface for system communication'},
                    {termAr:'الخادم',termEn:'Server',defAr:'جهاز حاسب يستضيف ويقدم الخدمات للمستخدمين',defEn:'Computer hosting services'},
                    {termAr:'قاعدة البيانات',termEn:'Database',defAr:'مخزن منظم للبيانات يسمح بالحفظ والاسترجاع',defEn:'Organized data storage'},
                    {termAr:'التشفير',termEn:'Encryption',defAr:'تحويل البيانات لصيغة غير مقروءة إلا بمفتاح',defEn:'Data protection via encoding'},
                    {termAr:'السحابة',termEn:'Cloud',defAr:'خوادم بعيدة عبر الإنترنت لتخزين ومعالجة البيانات',defEn:'Remote internet-based computing'}
                 ]},
                {nameAr:'تعريفات شرعية',nameEn:'Islamic Definitions',
                 terms:[
                    {termAr:'الحلال',termEn:'Halal',defAr:'ما أباحه الشرع ولم يرد فيه نهي',defEn:'Permitted by Islamic law'},
                    {termAr:'الحرام',termEn:'Haram',defAr:'ما نهى عنه الشارع نهياً جازماً',defEn:'Prohibited by Islamic law'},
                    {termAr:'الزكاة',termEn:'Zakat',defAr:'ركن من أركان الإسلام — حق مالي معلوم في مال معين',defEn:'Islamic obligatory charity'},
                    {termAr:'الربا',termEn:'Riba (Usury)',defAr:'الزيادة المحرمة في المال — محرم قطعاً',defEn:'Prohibited interest/usury'},
                    {termAr:'الإتقان',termEn:'Itqan (Excellence)',defAr:'إحكام العمل وإجادته — إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',defEn:'Islamic principle of excellence in work'}
                 ]}
            ]
        };
        this.userJourney = {
            nameAr:'رحلة المستخدم الكاملة',nameEn:'Complete User Journey',
            stages:[
                {id:'UJ-01',nameAr:'الاكتشاف',nameEn:'Discovery',desc:'المستخدم يسمع عن شيخة لأول مرة',touchpoints:['محركات البحث','وسائل التواصل','توصية صديق','إعلان','مؤتمر/معرض'],actions:['زيارة الموقع','قراءة التعريف','مشاهدة عرض تقديمي']},
                {id:'UJ-02',nameAr:'التسجيل',nameEn:'Registration',desc:'إنشاء حساب في منظومة شيخة',steps:['إدخال الاسم والبريد','اختيار نوع الحساب (فرد/شركة/حكومة)','تأكيد البريد','إعداد كلمة المرور','قبول الشروط الشرعية'],duration:'3-5 دقائق'},
                {id:'UJ-03',nameAr:'الإعداد الأولي',nameEn:'Onboarding',desc:'تهيئة الحساب والتعريف بالمنظومة',steps:['جولة تعريفية تفاعلية','اختيار اللغة والسمة','تحديد الاهتمامات','إعداد أوقات الصلاة','ربط الحسابات'],duration:'10-15 دقيقة'},
                {id:'UJ-04',nameAr:'الاستخدام الأساسي',nameEn:'Core Usage',desc:'البدء باستخدام الخدمات الأساسية',features:['لوحة التحكم','التصفح','البحث','التجارة','المجتمع'],support:'دعم فوري + دليل تفاعلي'},
                {id:'UJ-05',nameAr:'الاستخدام المتقدم',nameEn:'Advanced Usage',desc:'استكشاف الميزات المتقدمة',features:['APIs للمطورين','تحليلات متقدمة','تخصيص كامل','تكامل أنظمة','أتمتة'],training:'دورات تدريبية + شهادات'},
                {id:'UJ-06',nameAr:'الولاء والتوصية',nameEn:'Loyalty & Advocacy',desc:'المستخدم يصبح سفيراً لشيخة',programs:['برنامج نقاط الولاء','مكافآت التوصية','مجتمع VIP','شريك استراتيجي']}
            ]
        };
        this.procedures = {
            nameAr:'الإجراءات والعمليات',nameEn:'Procedures & Operations',
            categories:[
                {nameAr:'إجراءات الحساب',nameEn:'Account Procedures',items:['إنشاء حساب','تعديل بيانات','تغيير كلمة مرور','استعادة حساب','حذف حساب','ترقية حساب','إدارة صلاحيات']},
                {nameAr:'إجراءات التجارة',nameEn:'Trade Procedures',items:['إضافة منتج','إنشاء طلب','الدفع الإلكتروني','تتبع شحنة','إرجاع منتج','حساب الزكاة','إصدار فاتورة']},
                {nameAr:'إجراءات الدعم',nameEn:'Support Procedures',items:['فتح تذكرة دعم','الدردشة المباشرة','الاتصال الهاتفي','البريد الإلكتروني','قاعدة المعرفة','الأسئلة الشائعة','التصعيد']},
                {nameAr:'إجراءات الأمان',nameEn:'Security Procedures',items:['تفعيل المصادقة الثنائية','إبلاغ عن اختراق','مراجعة النشاط','حظر جهاز','تغيير إعدادات الخصوصية']},
                {nameAr:'إجراءات المطورين',nameEn:'Developer Procedures',items:['الحصول على مفتاح API','إنشاء تطبيق','نشر إضافة','مراجعة كود','إصدار نسخة']}
            ]
        };
        this.guidelines = {
            nameAr:'التوجيهات والإرشادات',nameEn:'Guidelines & Directives',
            categories:[
                {nameAr:'توجيهات الاستخدام',nameEn:'Usage Guidelines',items:['استخدام المنظومة في الحلال فقط','احترام خصوصية الآخرين','عدم نشر محتوى محرم','الصدق في المعاملات','الإبلاغ عن المخالفات']},
                {nameAr:'توجيهات المحتوى',nameEn:'Content Guidelines',items:['لا صور ذوات أرواح — حديث المصورون','لا موسيقى محرمة','لا محتوى إباحي أو فاحش','لا ترويج للربا أو القمار','لا إساءة للدين أو العلماء','محتوى مفيد وبنّاء']},
                {nameAr:'توجيهات التجارة',nameEn:'Trade Guidelines',items:['بيع الحلال فقط','الصدق في وصف المنتج','لا غش ولا تدليس','ضمان الحقوق','الزكاة واجبة']},
                {nameAr:'توجيهات المجتمع',nameEn:'Community Guidelines',items:['الاحترام المتبادل','لا تنمر ولا سخرية','النصيحة بالحسنى','التعاون على البر','حفظ الأعراض']}
            ]
        };
        this.helpCenter = {
            nameAr:'مركز المساعدة',nameEn:'Help Center',
            sections:[
                {nameAr:'الأسئلة الشائعة',nameEn:'FAQ',count:'500+ سؤال وجواب'},
                {nameAr:'أدلة الاستخدام',nameEn:'User Guides',count:'50+ دليل'},
                {nameAr:'دروس مرئية',nameEn:'Video Tutorials',count:'100+ درس',note:'بدون صور ذوات أرواح — استخدام رسوم متحركة هندسية'},
                {nameAr:'قاعدة المعرفة',nameEn:'Knowledge Base',count:'1000+ مقال'},
                {nameAr:'دعم مباشر',nameEn:'Live Support',channels:['دردشة 24/7','هاتف','بريد إلكتروني','WhatsApp']},
                {nameAr:'مجتمع المساعدة',nameEn:'Community Help',desc:'مستخدمون يساعدون مستخدمين'}
            ]
        };
        this.shariaGuidelines = {
            principles:[
                'التعليم والتوضيح واجب — لا يكلف الله نفساً إلا وسعها',
                'استخدام لغة عربية فصحى واضحة',
                'لا صور ذوات أرواح — استخدام أيقونات ورسوم هندسية ونصوص',
                'الصدق والشفافية في كل المعلومات',
                'مراعاة الفروق بين المستخدمين في القدرات',
                'إتاحة المساعدة بكل وسيلة ممكنة',
                'التذكير بأوقات الصلاة حتى أثناء التعلم',
                'البسملة في بداية كل دليل ووثيقة'
            ]
        };
    }
    getDashboard() {
        return {
            engine:this.name,nameAr:this.nameAr,version:this.version,owner:this.owner,activatedAt:this.activatedAt,
            summary:{definitionCategories:this.definitions.categories.length,totalTerms:this.definitions.categories.reduce((s,c)=>s+c.terms.length,0),journeyStages:this.userJourney.stages.length,procedureCategories:this.procedures.categories.length,guidelineCategories:this.guidelines.categories.length,helpSections:this.helpCenter.sections.length,quranRefs:this.quranReferences.length,shariaPrinciples:this.shariaGuidelines.principles.length},
            definitions:this.definitions,userJourney:this.userJourney,procedures:this.procedures,guidelines:this.guidelines,helpCenter:this.helpCenter,quranReferences:this.quranReferences,shariaGuidelines:this.shariaGuidelines
        };
    }
}
module.exports = SheikhaInstructionsEngine;
