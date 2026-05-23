/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منصة شيخة التعليمية الجاهزة للانطلاق — محتوى + أدوات + تراخيص + تسويق
 * Sheikha Educational Launchpad — Content + Tools + Licensing + Marketing v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق: ١
 * «من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة» — مسلم
 *
 * الملكية الفكرية: سلمان أحمد بن سلمان الراجح — © 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

module.exports = function(app, ctx) {

// ╔═══════════════════════════════════════════════════════════════╗
// ║                 الأساس الشرعي للتعليم والنشر                       ║
// ╚═══════════════════════════════════════════════════════════════╝
const SHARIA_EDUCATION = {
  quran:[
    {ayah:'﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾',surah:'العلق: ١',principle:'أساس التعلّم'},
    {ayah:'﴿ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ ﴾',surah:'العلق: ٥',principle:'الله مصدر كل علم'},
    {ayah:'﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',surah:'طه: ١١٤',principle:'طلب الاستمرار في التعلم'},
    {ayah:'﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾',surah:'المجادلة: ١١',principle:'رفعة العلماء'},
    {ayah:'﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾',surah:'البقرة: ٣١',principle:'التصنيف والمعرفة من الله'},
    {ayah:'﴿ فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ ﴾',surah:'النحل: ٤٣',principle:'الرجوع لأهل الاختصاص'},
  ],
  hadith:[
    {text:'«من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة»',source:'مسلم'},
    {text:'«طلب العلم فريضة على كل مسلم»',source:'ابن ماجه'},
    {text:'«بلّغوا عني ولو آية»',source:'البخاري'},
    {text:'«إن الله وملائكته وأهل السموات والأرض حتى النملة في جحرها ليصلون على معلم الناس الخير»',source:'الترمذي'},
    {text:'«خيركم من تعلّم القرآن وعلّمه»',source:'البخاري'},
    {text:'«الحكمة ضالة المؤمن أنّى وجدها فهو أحق بها»',source:'الترمذي'},
    {text:'«إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية أو علم يُنتفع به أو ولد صالح»',source:'مسلم'},
    {text:'«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',source:'البيهقي'},
  ]
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║   ١. المحتوى التعليمي الجاهز للانطلاق — Ready-to-Launch         ║
// ╚═══════════════════════════════════════════════════════════════╝
const EDUCATIONAL_CONTENT = {
  // ─── ١.١ المسارات التعليمية — Learning Tracks ───
  tracks:[
    {
      id:'track_metals',ar:'مسار علوم المعادن والتعدين',icon:'⛏',level:'مبتدئ → خبير',
      courses:[
        {id:'met101',ar:'مقدمة في المعادن — الأساسيات',modules:8,hours:16,type:'فيديو + اختبار',status:'جاهز',content_ready:true,
         syllabus:['تعريف المعادن وتصنيفاتها','الخصائص الفيزيائية والكيميائية','المعادن الحديدية وغير الحديدية','المعادن الثمينة — ذهب وفضة وبلاتين','المعادن النادرة والحرجة','السبائك وأنواعها','الاختبارات والفحوصات','معايير الجودة العالمية']},
        {id:'met201',ar:'سوق المعادن العالمي — LME & COMEX',modules:10,hours:20,type:'فيديو + محاكاة',status:'جاهز',content_ready:true,
         syllabus:['بورصة لندن للمعادن LME','بورصة نيويورك COMEX','آلية تسعير المعادن','العقود الآجلة والفورية','التحليل الفني للمعادن','التحليل الأساسي','العرض والطلب العالمي','مؤشرات السوق','إدارة المخاطر السعرية','دراسات حالة']},
        {id:'met301',ar:'السكراب والتدوير — من نفايات لثروة',modules:8,hours:16,type:'فيديو + عملي',status:'جاهز',content_ready:true,
         syllabus:['تصنيف السكراب المعدني','معايير ISRI','تقنيات الفرز والفصل','تسعير السكراب','سلسلة إمداد السكراب','إعادة الصهر والتدوير','الاقتصاد الدائري للمعادن','أنظمة البيئة والسلامة']},
        {id:'met401',ar:'الذهب — من المنجم للمشغولات',modules:12,hours:24,type:'فيديو + مختبر افتراضي',status:'جاهز',content_ready:true,
         syllabus:['جيولوجيا الذهب','طرق الاستخراج','التنقية والتكرير','معايير العيار — 24/22/21/18','صناعة المجوهرات','فحص الأصالة','سوق الذهب العالمي','الاستثمار في الذهب','HS Codes للذهب ومشتقاته','أحكام الذهب في الشريعة','زكاة الذهب','قصة سليمان عليه السلام']},
      ]
    },
    {
      id:'track_supply_chain',ar:'مسار سلاسل الإمداد واللوجستيات',icon:'🚛',level:'مبتدئ → خبير',
      courses:[
        {id:'sc101',ar:'أساسيات سلاسل الإمداد',modules:8,hours:16,type:'فيديو + اختبار',status:'جاهز',content_ready:true,
         syllabus:['مفهوم سلسلة الإمداد','المكونات الأساسية','التخطيط والتنبؤ','المشتريات والتوريد','الإنتاج والتصنيع','التخزين والمستودعات','النقل والتوزيع','خدمة العملاء']},
        {id:'sc201',ar:'الشحن البحري والتخليص الجمركي',modules:10,hours:20,type:'فيديو + محاكاة',status:'جاهز',content_ready:true,
         syllabus:['أنواع السفن والحاويات','Incoterms 2020','بوليصة الشحن B/L','التخليص الجمركي','HS Codes وتطبيقاتها','التأمين البحري','الموانئ السعودية','الرسوم والتعريفات','المستندات المطلوبة','دراسات حالة عملية']},
        {id:'sc301',ar:'التتبع الذكي وبلوكتشين سلاسل الإمداد',modules:8,hours:16,type:'فيديو + تطبيق',status:'جاهز',content_ready:true,
         syllabus:['تقنيات التتبع GPS/RFID','إنترنت الأشياء IoT','البلوكتشين في سلاسل الإمداد','العقود الذكية','الشفافية والتتبع','إدارة المخزون الذكية','التنبؤ بالطلب بالـ AI','أتمتة العمليات اللوجستية']},
      ]
    },
    {
      id:'track_islamic_commerce',ar:'مسار التجارة الإسلامية الرقمية',icon:'🕌',level:'مبتدئ → خبير',
      courses:[
        {id:'ic101',ar:'أحكام البيوع في الإسلام',modules:10,hours:20,type:'فيديو + مناقشة',status:'جاهز',content_ready:true,
         syllabus:['شروط البيع الصحيح','أنواع البيوع المشروعة','البيوع المنهي عنها','الربا — أنواعه وأحكامه','الغرر والغش والتدليس','الاحتكار والنجش','بيع السلم والاستصناع','المرابحة والمشاركة','خيارات البيع','آداب التاجر المسلم']},
        {id:'ic201',ar:'التجارة الإلكترونية الحلال',modules:8,hours:16,type:'فيديو + تطبيق',status:'جاهز',content_ready:true,
         syllabus:['فقه المعاملات الإلكترونية','العقد الإلكتروني في الشريعة','المنتجات الحلال رقمياً','الدفع الإلكتروني الشرعي','حماية المستهلك المسلم','التسويق الأخلاقي','الزكاة في التجارة الإلكترونية','النزاعات والتحكيم الشرعي']},
        {id:'ic301',ar:'التمويل الإسلامي الرقمي',modules:10,hours:20,type:'فيديو + حالات',status:'جاهز',content_ready:true,
         syllabus:['أساسيات التمويل الإسلامي','المرابحة الرقمية','الإجارة الإلكترونية','المضاربة والمشاركة','الصكوك الرقمية','التكافل الإلكتروني','الوقف الرقمي','العملات الرقمية — رؤية شرعية','التقنية المالية الإسلامية — Islamic FinTech','معايير AAOIFI']},
      ]
    },
    {
      id:'track_ai_business',ar:'مسار الذكاء الاصطناعي التجاري',icon:'🤖',level:'مبتدئ → متقدم',
      courses:[
        {id:'ai101',ar:'مقدمة في الذكاء الاصطناعي للتجار',modules:8,hours:16,type:'فيديو + تطبيق',status:'جاهز',content_ready:true,
         syllabus:['ما هو الذكاء الاصطناعي؟','أنواع AI — ML, DL, NLP','تطبيقات AI في التجارة','تنبؤ الأسعار','تحليل السوق الآلي','روبوتات المحادثة التجارية','أتمتة العمليات','أخلاقيات AI الإسلامية']},
        {id:'ai201',ar:'تحليل البيانات التجارية بالـ AI',modules:10,hours:20,type:'فيديو + مختبر',status:'جاهز',content_ready:true,
         syllabus:['أساسيات البيانات','تنظيف وتحضير البيانات','التحليل الاستكشافي','النمذجة التنبؤية','تصنيف العملاء','تحليل السلة — Market Basket','تحليل المشاعر','لوحات المؤشرات الذكية','Python للتحليل التجاري','دراسات حالة بأسواق المعادن']},
      ]
    },
    {
      id:'track_entrepreneurship',ar:'مسار ريادة الأعمال الإسلامية',icon:'🚀',level:'مبتدئ → رائد',
      courses:[
        {id:'ent101',ar:'أساسيات ريادة الأعمال — البدء بالبركة',modules:8,hours:16,type:'فيديو + مشروع',status:'جاهز',content_ready:true,
         syllabus:['الفكرة والفرصة','دراسة السوق','نموذج العمل — Business Model Canvas','الخطة المالية','التسجيل والتراخيص','بناء الفريق','التسويق الأولي','«بُورك لأمتي في بكورها»']},
        {id:'ent201',ar:'نمو المشاريع — من ناشئة لعالمية',modules:10,hours:20,type:'فيديو + إرشاد',status:'جاهز',content_ready:true,
         syllabus:['استراتيجيات النمو','التمويل الإسلامي للمشاريع','التوسع الجغرافي','بناء العلامة التجارية','الشراكات الاستراتيجية','الحوكمة والإدارة','التحول الرقمي','الاستدامة','رؤية 2030 والفرص','قصص نجاح إسلامية']},
      ]
    },
    {
      id:'track_quality_management',ar:'مسار إدارة الجودة والإتقان',icon:'🏅',level:'مبتدئ → خبير',
      courses:[
        {id:'qm101',ar:'إدارة الجودة الشاملة — الإتقان الإسلامي',modules:8,hours:16,type:'فيديو + اختبار',status:'جاهز',content_ready:true,
         syllabus:['مفهوم الجودة — «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»','ISO 9001','Six Sigma','Lean Management','TQM','قياس الأداء KPIs','التحسين المستمر — كايزن','شهادات الجودة الدولية']},
      ]
    },
  ],

  // ─── ١.٢ إحصائيات المحتوى ───
  stats: function(){
    var tc=0,mc=0,hc=0;
    this.tracks.forEach(function(t){
      tc+=t.courses.length;
      t.courses.forEach(function(c){ mc+=c.modules; hc+=c.hours; });
    });
    return {tracks:this.tracks.length, courses:tc, modules:mc, hours:hc};
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║   ٢. الأدوات التعليمية الرقمية — Digital Learning Tools           ║
// ╚═══════════════════════════════════════════════════════════════╝
const DIGITAL_LEARNING_TOOLS = [
  {id:'video_player',ar:'مشغّل الفيديو التعليمي الذكي',features:['سرعة متغيرة','ترجمة فورية 30 لغة','ملاحظات على الفيديو','بحث في المحتوى','تلخيص AI','وضع عدم الاتصال','جودة تكيفية']},
  {id:'virtual_lab',ar:'المختبر الافتراضي',features:['محاكاة فحص معادن','محاكاة صهر','محاكاة تخليص جمركي','محاكاة سوق LME','محاكاة سلسلة إمداد','محاكاة عقود ذكية']},
  {id:'ai_tutor',ar:'المعلم الذكي — AI Tutor',features:['إجابة أسئلة فورية','شرح مفاهيم','اقتراح مسار تعلم','تقييم مستوى','تدريب شخصي','دعم عربي كامل']},
  {id:'quiz_engine',ar:'محرك الاختبارات والتقييم',features:['اختبارات تكيفية','بنك أسئلة 10,000+','تحليل أداء','شهادات آلية','مراجعة أقران','اختبارات عملية']},
  {id:'collaborative_workspace',ar:'مساحة العمل التعاوني',features:['مشاريع جماعية','لوحة بيضاء رقمية','مستندات تشاركية','اجتماعات فيديو','مراجعة أقران','عرض تقديمي']},
  {id:'knowledge_map',ar:'خريطة المعرفة التفاعلية',features:['رسم بياني للمفاهيم','مسارات تعلم مرئية','ربط بين الموضوعات','تتبع التقدم','اكتشاف فجوات','اقتراحات AI']},
  {id:'podcast_studio',ar:'استوديو البودكاست التعليمي',features:['تسجيل','تحرير','نشر تلقائي','نسخ نصي AI','ترجمة','توزيع على منصات']},
  {id:'flashcards_ai',ar:'بطاقات المراجعة الذكية',features:['توليد AI من المحتوى','تكرار متباعد — Spaced Repetition','صور وصوت','مشاركة','إحصائيات حفظ']},
  {id:'simulation_engine',ar:'محرك المحاكاة التجارية',features:['محاكاة سوق معادن','محاكاة مفاوضات','محاكاة إدارة مخزون','محاكاة أزمات','محاكاة قرارات استراتيجية']},
  {id:'certificate_system',ar:'نظام الشهادات المعتمدة',features:['شهادات رقمية بلوكتشين','تحقق فوري','LinkedIn integration','QR Code','سجل دائم','معتمدة من شيخة']},
  {id:'mobile_app',ar:'تطبيق الجوال التعليمي',features:['تعلم أثناء التنقل','تنزيل للأوفلاين','إشعارات ذكية','مزامنة تلقائية','واجهة عربية','وضع ليلي']},
  {id:'gamification',ar:'نظام التلعيب والتحفيز',features:['نقاط XP','شارات إنجاز','لوحة متصدرين','تحديات يومية','مستويات','مكافآت حقيقية']},
];

// ╔═══════════════════════════════════════════════════════════════╗
// ║   ٣. نظام التجديد والاستدامة — Auto-Renewal System               ║
// ╚═══════════════════════════════════════════════════════════════╝
const CONTENT_RENEWAL_SYSTEM = {
  ar:'نظام تجديد المحتوى التعليمي المستمر والمستدام',
  principle:'﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — التعلم لا ينتهي',

  // ─── مصادر التجديد اليومي ───
  daily_sources:[
    {source:'أبحاث علمية',feeds:['arXiv','PubMed','IEEE Xplore','Springer','Elsevier','MDPI'],frequency:'يومي',ai_role:'تلخيص + تصنيف + اقتراح تحديث'},
    {source:'تقارير سوقية',feeds:['LME Daily','COMEX Reports','Bloomberg Metals','Reuters Commodities','S&P Global Platts'],frequency:'يومي',ai_role:'تحديث أسعار + تحليل + إنشاء محتوى'},
    {source:'تشريعات ولوائح',feeds:['الجريدة الرسمية السعودية','WTO','EU Official Journal','FATF'],frequency:'يومي',ai_role:'رصد + تحليل أثر + تحديث دورات'},
    {source:'مؤتمرات وندوات',feeds:['Mining Indaba','LME Week','PDAC','Arab Steel Summit','Islamic Finance Forum'],frequency:'أسبوعي',ai_role:'تسجيل + تلخيص + دمج في المحتوى'},
    {source:'كتب ودور نشر',feeds:['Springer Nature','Wiley','Elsevier','McGraw-Hill','مكتبة الملك فهد','دار العربية'],frequency:'شهري',ai_role:'مراجعة + اقتراح + دمج'},
    {source:'براءات اختراع',feeds:['USPTO','EPO','WIPO','KACST'],frequency:'أسبوعي',ai_role:'رصد ابتكارات + تحديث محتوى تقني'},
  ],

  // ─── آلية التجديد الآلي ───
  auto_renewal_pipeline:[
    {step:1,ar:'رصد',desc:'AI يراقب كل المصادر 24/7',tech:'RSS + API + Web Scraping + NLP'},
    {step:2,ar:'تصنيف',desc:'تصنيف المحتوى الجديد حسب المسار والمستوى',tech:'ML Classification + Taxonomy Mapping'},
    {step:3,ar:'تحليل فجوة',desc:'مقارنة المحتوى الجديد بالموجود — هل يوجد نقص؟',tech:'Gap Analysis AI + Diff Engine'},
    {step:4,ar:'توليد محتوى',desc:'AI ينشئ/يُحدّث المحتوى التعليمي',tech:'GPT + Claude + Custom Templates + RAG'},
    {step:5,ar:'مراجعة جودة',desc:'فحص دقة علمية + فحص شرعي + فحص لغوي',tech:'Expert Review + Sharia Check + Grammar AI'},
    {step:6,ar:'فحص شرعي',desc:'التحقق من توافق المحتوى مع الكتاب والسنة',tech:'Sharia Compliance Engine + Scholar Review'},
    {step:7,ar:'نشر',desc:'نشر تلقائي مع إشعار المتعلمين',tech:'Auto-Publish + Push Notifications + Email'},
    {step:8,ar:'قياس أثر',desc:'تتبع تفاعل المتعلمين مع المحتوى الجديد',tech:'Analytics + A/B Testing + Feedback Loop'},
  ],

  sustainability:{
    ar:'استدامة المحتوى بالكتاب والسنة',
    rules:[
      'كل محتوى يُربط بأصله الشرعي إن وُجد',
      'لا يُنشر محتوى يخالف الشريعة',
      'التحديث لا يمحو الأصل — نظام إصدارات',
      'حفظ حقوق كل مؤلف ومساهم',
      'المحتوى المجاني للفقراء — صدقة جارية',
      'مراجعة شرعية دورية لكل المحتوى',
    ]
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║   ٤. التراخيص والإجراءات — Licensing & Procedures                ║
// ╚═══════════════════════════════════════════════════════════════╝
const LICENSING_SYSTEM = {
  ar:'نظام التراخيص والأنشطة والإجراءات الرقمية',

  // ─── التراخيص المطلوبة في السعودية ───
  saudi_licenses:[
    {
      id:'cr',ar:'السجل التجاري',issuer:'وزارة التجارة',
      type:'تجارة إلكترونية + تعليم',
      steps:['الدخول على portal.mc.gov.sa','اختيار نوع النشاط','تعبئة البيانات','سداد الرسوم','إصدار فوري'],
      cost:'200 ريال/سنة (رئيسي) + 100 ريال/فرعي',
      duration:'إصدار فوري — دقائق',
      renewal:'سنوي — تجديد إلكتروني',
      digital_status:'مرقمن بالكامل ✅',
    },
    {
      id:'freelance',ar:'وثيقة العمل الحر',issuer:'وزارة الموارد البشرية',
      type:'تدريب + استشارات + محتوى رقمي',
      steps:['الدخول على freelance.sa','اختيار التخصص','رفع المؤهلات','إصدار الوثيقة'],
      cost:'مجاني',
      duration:'فوري',
      renewal:'سنوي',
      digital_status:'مرقمن بالكامل ✅',
    },
    {
      id:'maroof',ar:'شهادة معروف',issuer:'وزارة التجارة',
      type:'متجر إلكتروني معتمد',
      steps:['التسجيل في maroof.sa','ربط السجل التجاري','إضافة المنتجات/الخدمات','التوثيق'],
      cost:'مجاني',
      duration:'1-3 أيام',
      renewal:'مستمر',
      digital_status:'مرقمن بالكامل ✅',
    },
    {
      id:'elearning_license',ar:'ترخيص التعليم الإلكتروني',issuer:'المركز الوطني للتعليم الإلكتروني (NELC)',
      type:'منصة تعليمية إلكترونية',
      steps:['التقديم عبر nelc.gov.sa','تقديم خطة تعليمية','معايير الجودة','فحص المحتوى','إصدار الترخيص'],
      cost:'متغير حسب الحجم',
      duration:'2-4 أسابيع',
      renewal:'سنوي',
      digital_status:'مرقمن جزئياً ⚡',
      requirements:['خطة تعليمية مفصلة','معايير جودة المحتوى','سياسة خصوصية','آلية تقييم','فريق تعليمي مؤهل'],
    },
    {
      id:'training_license',ar:'ترخيص التدريب المهني',issuer:'المؤسسة العامة للتدريب التقني والمهني (TVTC)',
      type:'برامج تدريبية مهنية',
      steps:['التقديم عبر tvtc.gov.sa','اعتماد البرامج','توفير المدربين المعتمدين','فحص المرافق/المنصة','الترخيص'],
      cost:'متغير',
      duration:'4-8 أسابيع',
      renewal:'سنوي',
      digital_status:'مرقمن جزئياً ⚡',
    },
    {
      id:'data_protection',ar:'التزام حماية البيانات الشخصية',issuer:'هيئة البيانات والذكاء الاصطناعي (SDAIA)',
      type:'معالجة بيانات المتعلمين',
      steps:['تقييم الأثر على الخصوصية','سياسة خصوصية شاملة','آلية موافقة','تعيين مسؤول حماية بيانات','تسجيل'],
      cost:'مجاني (التزام)',
      duration:'ذاتي + مراجعة',
      renewal:'مستمر',
      digital_status:'مرقمن بالكامل ✅',
    },
    {
      id:'payment_license',ar:'ترخيص خدمات الدفع',issuer:'البنك المركزي السعودي (SAMA)',
      type:'تحصيل رسوم إلكترونية',
      steps:['التقديم عبر بوابة SAMA','متطلبات رأس المال','معايير الأمن PCI-DSS','التدقيق','الترخيص'],
      cost:'حسب النوع',
      duration:'3-6 أشهر',
      renewal:'سنوي',
      digital_status:'مرقمن ⚡',
      alternative:'استخدام بوابة دفع مرخصة (PayTabs, HyperPay, Moyasar) — لا يحتاج ترخيص منفصل',
    },
    {
      id:'vat_registration',ar:'التسجيل في ضريبة القيمة المضافة',issuer:'هيئة الزكاة والضريبة والجمارك',
      type:'إذا تجاوزت الإيرادات 375,000 ريال',
      steps:['التسجيل عبر zatca.gov.sa','تحديد النشاط','إصدار الرقم الضريبي','تقديم إقرارات دورية'],
      cost:'مجاني (ضريبة 15% على الخدمات)',
      duration:'فوري',
      renewal:'مستمر — إقرارات ربع سنوية',
      digital_status:'مرقمن بالكامل ✅',
    },
  ],

  // ─── التراخيص الدولية ───
  international_licenses:[
    {id:'gdpr',ar:'الامتثال لـ GDPR — الاتحاد الأوروبي',scope:'بيانات المستخدمين الأوروبيين',requirement:'إذا كان هناك متعلمون أوروبيون'},
    {id:'copyright',ar:'حماية حقوق المؤلف — اتفاقية بيرن',scope:'حماية المحتوى التعليمي دولياً',requirement:'تلقائية — لا تحتاج تسجيل'},
    {id:'accessibility',ar:'معايير إتاحة المحتوى — WCAG 2.1',scope:'وصول ذوي الاحتياجات الخاصة',requirement:'مطلوب أخلاقياً وقانونياً'},
    {id:'iso_elearning',ar:'ISO 21001 — إدارة المنظمات التعليمية',scope:'معيار جودة تعليمي دولي',requirement:'اختياري — يعزز المصداقية'},
    {id:'scorm',ar:'معيار SCORM / xAPI',scope:'توافق المحتوى مع أنظمة إدارة التعلم',requirement:'مطلوب للتكامل'},
  ],

  // ─── خارطة طريق الترخيص ───
  licensing_roadmap:[
    {priority:1,license:'السجل التجاري',timeline:'فوري',status:'مطلوب أولاً'},
    {priority:2,license:'شهادة معروف',timeline:'1-3 أيام',status:'بعد السجل مباشرة'},
    {priority:3,license:'ترخيص التعليم الإلكتروني NELC',timeline:'2-4 أسابيع',status:'للاعتماد الرسمي'},
    {priority:4,license:'التسجيل الضريبي',timeline:'فوري',status:'عند بلوغ الحد'},
    {priority:5,license:'حماية البيانات',timeline:'ذاتي',status:'التزام مستمر'},
    {priority:6,license:'بوابة دفع',timeline:'أسبوع',status:'عبر مزود مرخص'},
    {priority:7,license:'ترخيص تدريب TVTC',timeline:'4-8 أسابيع',status:'للبرامج المهنية'},
  ],
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║   ٥. التسويق والفئات المستهدفة — Marketing Strategy              ║
// ╚═══════════════════════════════════════════════════════════════╝
const MARKETING_STRATEGY = {
  ar:'استراتيجية تسويق المنصة التعليمية',

  // ─── الفئات المستهدفة ───
  target_segments:[
    {id:'traders',ar:'التجار والمستوردون والمصدّرون',size:'كبيرة',priority:'عالية جداً',
     pain_points:['نقص المعرفة بالمعادن','صعوبة التخليص الجمركي','عدم فهم الأسواق العالمية','مخاطر الاحتيال'],
     channels:['LinkedIn','X/Twitter','واتساب أعمال','إيميل','إعلانات Google'],
     content_fit:['مسار المعادن','مسار سلاسل الإمداد','مسار التجارة الإسلامية']},
    {id:'entrepreneurs',ar:'رواد الأعمال والمشاريع الناشئة',size:'كبيرة',priority:'عالية',
     pain_points:['لا يعرف من أين يبدأ','نقص التمويل','ضعف التسويق','عدم فهم التراخيص'],
     channels:['Instagram','TikTok','YouTube','LinkedIn','Snapchat'],
     content_fit:['مسار ريادة الأعمال','مسار التجارة الإلكترونية']},
    {id:'students',ar:'طلاب الجامعات والدراسات العليا',size:'كبيرة جداً',priority:'عالية',
     pain_points:['محتوى أكاديمي جاف','بعد عن التطبيق','صعوبة الحصول على تدريب','تكلفة الدورات'],
     channels:['TikTok','YouTube','Instagram','Telegram','جامعات'],
     content_fit:['كل المسارات — مع خصم طلابي أو مجاني']},
    {id:'corporates',ar:'الشركات والمؤسسات — B2B',size:'متوسطة',priority:'عالية جداً',
     pain_points:['تدريب الموظفين مكلف','محتوى غير متخصص','قياس الأثر صعب','حاجة لشهادات معتمدة'],
     channels:['LinkedIn','إيميل B2B','مندوبين','مؤتمرات','شراكات'],
     content_fit:['برامج مخصصة','دبلومات','شهادات']},
    {id:'gov_entities',ar:'الجهات الحكومية',size:'متوسطة',priority:'عالية',
     pain_points:['تأهيل الكوادر','التحول الرقمي','الامتثال للأنظمة','بناء القدرات'],
     channels:['مناقصات حكومية','علاقات مباشرة','مؤتمرات','اعتمادات رسمية'],
     content_fit:['برامج حكومية مخصصة','تدريب تنفيذي']},
    {id:'women',ar:'رائدات الأعمال',size:'متنامية',priority:'عالية',
     pain_points:['الحاجة لتمكين اقتصادي','نقص المعرفة التجارية','صعوبة التمويل','بيئة داعمة'],
     channels:['Instagram','Snapchat','LinkedIn','مجموعات نسائية','فعاليات'],
     content_fit:['مسار ريادة الأعمال','مسار التجارة الإلكترونية']},
    {id:'international',ar:'المهتمون دولياً بالتجارة الإسلامية',size:'ضخمة — 2 مليار مسلم',priority:'استراتيجية',
     pain_points:['لا يوجد منصة تعليمية إسلامية تجارية عالمية','حاجز اللغة','الحلال الرقمي'],
     channels:['Google Ads','YouTube','Facebook','LinkedIn','مؤسسات إسلامية'],
     content_fit:['كل المسارات بالإنجليزية + لغات أخرى']},
  ],

  // ─── أدوات التسويق ───
  marketing_tools:[
    {id:'seo',ar:'تحسين محركات البحث — SEO',tactics:['كلمات مفتاحية عربية وإنجليزية','محتوى تعليمي مجاني على المدونة','فيديوهات YouTube','Schema Markup للدورات']},
    {id:'content_marketing',ar:'التسويق بالمحتوى',tactics:['مقالات أسبوعية','إنفوغرافيك','بودكاست','فيديوهات قصيرة','دراسات حالة','تقارير مجانية']},
    {id:'social_media',ar:'التسويق عبر التواصل الاجتماعي',tactics:['محتوى يومي','بث مباشر أسبوعي','تحديات تعليمية','مسابقات','تفاعل مجتمعي']},
    {id:'email_marketing',ar:'التسويق بالبريد الإلكتروني',tactics:['سلسلة ترحيب','نشرة أسبوعية','عروض مخصصة','تذكير بالدورات','متابعة الخريجين']},
    {id:'partnerships',ar:'الشراكات الاستراتيجية',tactics:['جامعات','غرف تجارية','جمعيات مهنية','شركات تدريب','جهات حكومية']},
    {id:'referral',ar:'برنامج الإحالة',tactics:['خصم للمحيل والمُحال','نقاط مكافأة','شارات سفير','مستويات إحالة']},
    {id:'freemium',ar:'نموذج مجاني + مدفوع',tactics:['دورات مجانية للمبتدئين','محتوى مفتوح — صدقة جارية','مميزات متقدمة مدفوعة','اشتراك شهري/سنوي']},
    {id:'events',ar:'الفعاليات والمؤتمرات',tactics:['ورش عمل مجانية','ندوات أون لاين','مؤتمر سنوي','معارض','لقاءات محلية']},
  ],

  // ─── الخطة التسويقية — Marketing Plan ───
  marketing_plan:{
    phases:[
      {phase:1,ar:'الإطلاق — Launch (شهر 1-3)',
        activities:['إطلاق 5 دورات مجانية','حملة سوشيال ميديا','شراكة مع 3 جامعات','بث مباشر أسبوعي','مقالات SEO يومية'],
        budget:'50,000 ريال',target:'5,000 مسجل',kpi:'تكلفة اكتساب < 10 ريال'},
      {phase:2,ar:'النمو — Growth (شهر 4-8)',
        activities:['إطلاق المسارات المدفوعة','إعلانات Google + Meta','شراكات B2B','برنامج إحالة','بودكاست أسبوعي'],
        budget:'150,000 ريال',target:'25,000 مسجل + 2,000 مدفوع',kpi:'معدل تحويل > 8%'},
      {phase:3,ar:'التوسع — Scale (شهر 9-18)',
        activities:['إطلاق بالإنجليزية','شراكات دولية','مؤتمر شيخة التعليمي السنوي','اعتماد NELC','برامج B2B'],
        budget:'500,000 ريال',target:'100,000 مسجل + 10,000 مدفوع',kpi:'إيرادات > 2M ريال'},
      {phase:4,ar:'الريادة — Leadership (سنة 2+)',
        activities:['المنصة التعليمية #1 للتجارة الإسلامية','100+ دورة','30+ لغة','شراكات عالمية','AI tutoring','شهادات معترف بها دولياً'],
        budget:'2,000,000 ريال',target:'1,000,000 متعلم',kpi:'أكبر منصة تجارة إسلامية تعليمية'},
    ],
  },

  // ─── التسعير ───
  pricing:{
    models:[
      {model:'مجاني',ar:'صدقة جارية — محتوى أساسي مجاني للجميع',includes:['5 دورات مقدمة','مقالات ومدونة','بودكاست','منتدى مجتمعي']},
      {model:'فردي',ar:'اشتراك فردي — 99 ريال/شهر أو 799 ريال/سنة',includes:['كل الدورات','شهادات','AI Tutor','مختبر افتراضي','بدون إعلانات']},
      {model:'مؤسسي',ar:'اشتراك مؤسسي — حسب عدد المتدربين',includes:['لوحة تحكم إدارية','تقارير تقدم','محتوى مخصص','دعم مخصص','فوترة شهرية']},
      {model:'حكومي',ar:'برامج حكومية — عقود مخصصة',includes:['برامج مصممة خصيصاً','تدريب المدربين','تقارير مفصلة','اعتمادات رسمية']},
    ],
    zakat_model:'2.5% من الأرباح → صندوق زكاة تعليمي — منح مجانية للمحتاجين',
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║                         APIs                                    ║
// ╚═══════════════════════════════════════════════════════════════╝

// ─── لوحة تحكم المنصة التعليمية ───
app.get('/api/edu-launchpad/dashboard', function(req, res) {
  var s = EDUCATIONAL_CONTENT.stats();
  res.json({ success:true, data:{
    engine:'Sheikha Educational Launchpad v1.0',
    owner:'سلمان أحمد بن سلمان الراجح',
    status:'جاهز للانطلاق ✅',
    content:{tracks:s.tracks,courses:s.courses,modules:s.modules,total_hours:s.hours,all_ready:true},
    tools:DIGITAL_LEARNING_TOOLS.length,
    renewal_sources:CONTENT_RENEWAL_SYSTEM.daily_sources.length,
    licenses:{saudi:LICENSING_SYSTEM.saudi_licenses.length,international:LICENSING_SYSTEM.international_licenses.length},
    marketing:{segments:MARKETING_STRATEGY.target_segments.length,tools:MARKETING_STRATEGY.marketing_tools.length,phases:MARKETING_STRATEGY.marketing_plan.phases.length},
    sharia:{quran:SHARIA_EDUCATION.quran.length,hadith:SHARIA_EDUCATION.hadith.length},
  }});
});

app.get('/api/edu-launchpad/sharia', function(req, res) {
  res.json({success:true,data:SHARIA_EDUCATION});
});

app.get('/api/edu-launchpad/tracks', function(req, res) {
  res.json({success:true,data:EDUCATIONAL_CONTENT.tracks});
});

app.get('/api/edu-launchpad/tracks/:id', function(req, res) {
  var t=EDUCATIONAL_CONTENT.tracks.find(function(t){return t.id===req.params.id;});
  if(!t) return res.status(404).json({success:false,error:'مسار غير موجود'});
  res.json({success:true,data:t});
});

app.get('/api/edu-launchpad/courses/:id', function(req, res) {
  var found=null;
  EDUCATIONAL_CONTENT.tracks.forEach(function(t){
    t.courses.forEach(function(c){ if(c.id===req.params.id) found={track:t.ar,course:c}; });
  });
  if(!found) return res.status(404).json({success:false,error:'دورة غير موجودة'});
  res.json({success:true,data:found});
});

app.get('/api/edu-launchpad/tools', function(req, res) {
  res.json({success:true,data:DIGITAL_LEARNING_TOOLS});
});

app.get('/api/edu-launchpad/renewal-system', function(req, res) {
  res.json({success:true,data:CONTENT_RENEWAL_SYSTEM});
});

app.get('/api/edu-launchpad/licenses', function(req, res) {
  res.json({success:true,data:LICENSING_SYSTEM});
});

app.get('/api/edu-launchpad/licenses/saudi', function(req, res) {
  res.json({success:true,data:LICENSING_SYSTEM.saudi_licenses});
});

app.get('/api/edu-launchpad/licenses/international', function(req, res) {
  res.json({success:true,data:LICENSING_SYSTEM.international_licenses});
});

app.get('/api/edu-launchpad/licenses/roadmap', function(req, res) {
  res.json({success:true,data:LICENSING_SYSTEM.licensing_roadmap});
});

app.get('/api/edu-launchpad/marketing', function(req, res) {
  res.json({success:true,data:MARKETING_STRATEGY});
});

app.get('/api/edu-launchpad/marketing/segments', function(req, res) {
  res.json({success:true,data:MARKETING_STRATEGY.target_segments});
});

app.get('/api/edu-launchpad/marketing/plan', function(req, res) {
  res.json({success:true,data:MARKETING_STRATEGY.marketing_plan});
});

app.get('/api/edu-launchpad/marketing/tools', function(req, res) {
  res.json({success:true,data:MARKETING_STRATEGY.marketing_tools});
});

app.get('/api/edu-launchpad/pricing', function(req, res) {
  res.json({success:true,data:MARKETING_STRATEGY.pricing});
});

// ─── سجل التشغيل ───
var s = EDUCATIONAL_CONTENT.stats();
console.log('✅ [EduLaunchpad] منصة شيخة التعليمية — جاهزة للانطلاق');
console.log('   📚 محتوى: ' + s.tracks + ' مسار | ' + s.courses + ' دورة | ' + s.modules + ' وحدة | ' + s.hours + ' ساعة تعليمية');
console.log('   🛠  أدوات: ' + DIGITAL_LEARNING_TOOLS.length + ' أداة رقمية | تجديد: ' + CONTENT_RENEWAL_SYSTEM.daily_sources.length + ' مصدر يومي');
console.log('   📜 تراخيص: ' + LICENSING_SYSTEM.saudi_licenses.length + ' سعودية + ' + LICENSING_SYSTEM.international_licenses.length + ' دولية | خارطة: ' + LICENSING_SYSTEM.licensing_roadmap.length + ' خطوة');
console.log('   📢 تسويق: ' + MARKETING_STRATEGY.target_segments.length + ' فئة | ' + MARKETING_STRATEGY.marketing_tools.length + ' أداة | ' + MARKETING_STRATEGY.marketing_plan.phases.length + ' مرحلة');
console.log('   ☪ شرعي: ' + SHARIA_EDUCATION.quran.length + ' آية + ' + SHARIA_EDUCATION.hadith.length + ' حديث');
console.log('   📡 APIs: /api/edu-launchpad/*');

};
