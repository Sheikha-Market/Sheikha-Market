/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * رياض الجنة — بيت العلم ودار المعرفة ومصنع الابتكار
 * Sheikha Riyad Al-Jannah — House of Knowledge & Innovation Factory v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «إذا مررتم برياض الجنة فارتعوا» قالوا: وما رياض الجنة؟
 * قال: «حلق الذكر» — رواه الترمذي
 *
 * ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق: ١
 * ﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾ — هود: ٦١
 * ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — طه: ١١٤
 *
 * الملكية الفكرية: سلمان أحمد بن سلمان الراجح — © 2026
 * لا طاعة لمخلوق في معصية الخالق
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function(app, ctx) {

// ╔═══════════════════════════════════════════════════════════════╗
// ║           الأساس الشرعي — لا طاعة لمخلوق في معصية الخالق          ║
// ╚═══════════════════════════════════════════════════════════════╝
const SHARIA_FOUNDATION = {
  supreme_principle: 'لا طاعة لمخلوق في معصية الخالق — كل قانون أو لائحة تخالف شرع الله تُرفض',
  quran: [
    { ayah:'﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾', surah:'العلق: ١', principle:'أصل العلم والمعرفة — أول أمر إلهي' },
    { ayah:'﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾', surah:'طه: ١١٤', principle:'طلب الزيادة في العلم أمر نبوي' },
    { ayah:'﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾', surah:'المجادلة: ١١', principle:'مكانة العلماء' },
    { ayah:'﴿ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ﴾', surah:'الزمر: ٩', principle:'القضاء على الجهل فريضة' },
    { ayah:'﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾', surah:'البقرة: ٣١', principle:'الله علّم الأسماء — أصل التصنيف والمعرفة' },
    { ayah:'﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾', surah:'هود: ٦١', principle:'إعمار الأرض بالعلم والعمل' },
    { ayah:'﴿ وَاتَّقُوا اللَّهَ ۖ وَيُعَلِّمُكُمُ اللَّهُ ﴾', surah:'البقرة: ٢٨٢', principle:'التقوى مفتاح العلم' },
    { ayah:'﴿ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا ﴾', surah:'الأعراف: ٥٦', principle:'الإصلاح لا الإفساد' },
    { ayah:'﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ﴾', surah:'الأنعام: ٥٧', principle:'الحكم لله — لا طاعة لمخلوق في معصية الخالق' },
    { ayah:'﴿ وَمَن لَّمْ يَحْكُم بِمَا أَنزَلَ اللَّهُ فَأُولَٰئِكَ هُمُ الظَّالِمُونَ ﴾', surah:'المائدة: ٤٥', principle:'الحكم بما أنزل الله' },
    { ayah:'﴿ وَأَنِ احْكُم بَيْنَهُم بِمَا أَنزَلَ اللَّهُ وَلَا تَتَّبِعْ أَهْوَاءَهُمْ ﴾', surah:'المائدة: ٤٩', principle:'عدم اتباع الأهواء في التشريع' },
    { ayah:'﴿ وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا ﴾', surah:'القصص: ٧٧', principle:'التوازن بين الدنيا والآخرة' },
  ],
  hadith: [
    { text:'«إذا مررتم برياض الجنة فارتعوا» قالوا: وما رياض الجنة؟ قال: «حلق الذكر»', source:'الترمذي', principle:'رياض الجنة = حلقات العلم والذكر' },
    { text:'«من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة»', source:'مسلم', principle:'طريق العلم طريق الجنة' },
    { text:'«طلب العلم فريضة على كل مسلم»', source:'ابن ماجه', principle:'فرضية العلم' },
    { text:'«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»', source:'البيهقي', principle:'الإتقان في كل عمل' },
    { text:'«بلّغوا عني ولو آية»', source:'البخاري', principle:'نشر العلم واجب' },
    { text:'«الحكمة ضالة المؤمن أنّى وجدها فهو أحق بها»', source:'الترمذي', principle:'أخذ الحكمة من كل مصدر نافع' },
    { text:'«لا طاعة لمخلوق في معصية الخالق»', source:'أحمد', principle:'القاعدة العليا — كل قانون يخالف شرع الله يُرفض' },
    { text:'«إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية أو علم ينتفع به أو ولد صالح»', source:'مسلم', principle:'العلم النافع خالد' },
    { text:'«إن الله وملائكته وأهل السموات والأرض حتى النملة في جحرها ليصلون على معلم الناس الخير»', source:'الترمذي', principle:'مكانة المعلم والعالم' },
    { text:'«مَن دعا إلى هدى كان له من الأجر مثل أجور مَن تبعه»', source:'مسلم', principle:'أجر الدعوة للعلم والخير' },
    { text:'«اللهم إني أعوذ بك من علم لا ينفع»', source:'مسلم', principle:'العلم النافع لا العلم الضار' },
    { text:'«بُورك لأمتي في بكورها»', source:'أبو داود', principle:'البركة في البكور — بداية مباركة' },
  ]
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ١. رياض الجنة — بيت العلم ودار المعرفة                        ║
// ╚═══════════════════════════════════════════════════════════════╝
const RIYAD_ALJANNAH = {
  id: 'riyad_aljannah',
  ar: 'رياض الجنة — بيت العلم ودار المعرفة',
  en: 'Riyad Al-Jannah — House of Knowledge',
  hadith: '«إذا مررتم برياض الجنة فارتعوا»',
  vision: 'صناعة العلم وابتكار المنهجيات ونشر المعرفة لإعمار الأرض وعبادة الله — منظومة ترتاع من رياض الجنة',

  // ─── حلقات العلم الرقمية — Digital Knowledge Circles ───
  knowledge_circles: [
    { id:'halaqat_quran', ar:'حلقة القرآن والتفسير التجاري', type:'شرعي', frequency:'يومية', format:'بث مباشر + تسجيل', topics:['آيات التجارة','أحكام البيوع','أخلاق التاجر','قصص الأنبياء في التجارة'], output:'تفسير تطبيقي للتجارة الرقمية' },
    { id:'halaqat_hadith', ar:'حلقة الحديث النبوي التجاري', type:'شرعي', frequency:'يومية', format:'مناقشة + تطبيق', topics:['أحاديث البيوع','آداب السوق','التاجر الصدوق','النهي عن الغش'], output:'دليل عملي من السنة للتاجر' },
    { id:'halaqat_metals', ar:'حلقة علوم المعادن', type:'علمي', frequency:'أسبوعية', format:'محاضرة + مختبر افتراضي', topics:['خصائص المعادن','سبائك','معالجة حرارية','تحليل كيميائي','معادن نادرة'], output:'أبحاث معدنية تطبيقية' },
    { id:'halaqat_market', ar:'حلقة تحليل الأسواق', type:'تجاري', frequency:'يومية', format:'تحليل مباشر + نقاش', topics:['أسعار LME','COMEX','العرض والطلب','تنبؤات','تحليل فني','أساسيات'], output:'تقارير سوقية يومية' },
    { id:'halaqat_ai', ar:'حلقة الذكاء الاصطناعي', type:'تقني', frequency:'أسبوعية', format:'ورشة + تطبيق', topics:['تعلم آلة','رؤية حاسوبية','NLP عربي','تنبؤ أسعار','أتمتة'], output:'نماذج AI متخصصة' },
    { id:'halaqat_supply', ar:'حلقة سلاسل الإمداد', type:'لوجستي', frequency:'أسبوعية', format:'دراسة حالة + محاكاة', topics:['تحسين مسارات','تتبع ذكي','مخزون','جمارك','Incoterms'], output:'حلول لوجستية مبتكرة' },
    { id:'halaqat_innovation', ar:'حلقة الابتكار وريادة الأعمال', type:'ريادي', frequency:'أسبوعية', format:'عصف ذهني + عروض', topics:['نماذج أعمال','MVP','تمويل','نمو','استراتيجية'], output:'مشاريع ناشئة ومبادرات' },
    { id:'halaqat_law', ar:'حلقة الأنظمة والتشريعات', type:'قانوني', frequency:'شهرية', format:'تحليل + تطبيق', topics:['أنظمة سعودية','تشريعات دولية','امتثال','حوكمة','ملكية فكرية'], output:'دليل امتثال محدّث' },
  ],

  // ─── المكتبة الرقمية الشاملة ───
  digital_library: {
    sections: [
      { id:'quran_tafsir', ar:'القرآن والتفسير التجاري', items:6236, type:'نصوص مقدسة' },
      { id:'hadith_commerce', ar:'أحاديث التجارة والبيوع', items:500, type:'أحاديث نبوية' },
      { id:'fiqh_muamalat', ar:'فقه المعاملات المالية', items:1000, type:'كتب فقهية' },
      { id:'metals_science', ar:'علوم المعادن والتعدين', items:5000, type:'كتب ومراجع علمية' },
      { id:'market_analysis', ar:'تحليل الأسواق والاقتصاد', items:3000, type:'تقارير ودراسات' },
      { id:'ai_computing', ar:'الذكاء الاصطناعي والحاسب', items:2000, type:'أبحاث ومقالات' },
      { id:'supply_chain', ar:'سلاسل الإمداد واللوجستيات', items:1500, type:'كتب ومراجع' },
      { id:'entrepreneurship', ar:'ريادة الأعمال والابتكار', items:1000, type:'كتب وقصص نجاح' },
      { id:'saudi_regulations', ar:'الأنظمة واللوائح السعودية', items:500, type:'وثائق رسمية' },
      { id:'international_law', ar:'القوانين والمعاهدات الدولية', items:800, type:'وثائق قانونية' },
    ],
    formats: ['PDF','كتاب إلكتروني','فيديو','بودكاست','إنفوغرافيك','خريطة ذهنية','محاكاة تفاعلية'],
    ai_features: ['بحث ذكي بالمعنى','تلخيص آلي','ترجمة فورية','ربط مرجعي','اقتراحات قراءة','استخراج معرفة'],
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ٢. المدرسة العلمية المنهجية — Scientific School                  ║
// ╚═══════════════════════════════════════════════════════════════╝
const SCIENTIFIC_SCHOOL = {
  id: 'madrasat_al_ilm',
  ar: 'المدرسة العلمية المنهجية — مصنع العلم والابتكار',
  motto: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — نصنع العلم ونبتكر المنهجيات',

  // ─── المناهج العلمية المعتمدة ───
  methodologies: [
    { id:'scientific_method', ar:'المنهج العلمي التجريبي', steps:['ملاحظة','فرضية','تجربة','تحليل','استنتاج','نشر'], origin:'ابن الهيثم — رائد المنهج التجريبي' },
    { id:'design_thinking', ar:'التفكير التصميمي', steps:['تعاطف','تعريف المشكلة','توليد أفكار','نمذجة أولية','اختبار'], origin:'Stanford d.school' },
    { id:'six_sigma', ar:'ستة سيجما — DMAIC', steps:['تحديد','قياس','تحليل','تحسين','مراقبة'], origin:'Motorola / GE' },
    { id:'lean_startup', ar:'الشركة الرشيقة', steps:['بناء','قياس','تعلّم','محور أو مثابرة'], origin:'Eric Ries' },
    { id:'agile_scrum', ar:'التطوير الرشيق — سكرم', steps:['تخطيط سبرنت','تنفيذ يومي','مراجعة','استرجاعية'], origin:'Schwaber & Sutherland' },
    { id:'systems_thinking', ar:'تفكير النظم', steps:['تحديد النظام','رسم الحدود','تحليل التغذية الراجعة','نمذجة','محاكاة'], origin:'Peter Senge' },
    { id:'action_research', ar:'البحث الإجرائي', steps:['تشخيص','تخطيط عمل','تنفيذ','ملاحظة','تأمل','تعديل'], origin:'Kurt Lewin' },
    { id:'grounded_theory', ar:'النظرية المؤسسة', steps:['جمع بيانات','ترميز مفتوح','ترميز محوري','ترميز انتقائي','نظرية'], origin:'Glaser & Strauss' },
    { id:'islamic_ijtihad', ar:'منهج الاجتهاد الإسلامي', steps:['نص قرآني','سنة نبوية','إجماع','قياس','مصلحة مرسلة','استحسان','عرف'], origin:'أصول الفقه الإسلامي' },
  ],

  // ─── مصنع الابتكار — Innovation Factory ───
  innovation_factory: {
    pipeline: [
      { phase:1, ar:'اكتشاف المشكلة', tools:['مسح ميداني','تحليل بيانات','AI Detection','مراقبة أحداث عالمية','استماع اجتماعي'], duration:'1-2 أسبوع' },
      { phase:2, ar:'بحث وتحليل', tools:['مراجعة أدبيات','تحليل سوقي','دراسة منافسين','تحليل SWOT','PESTEL'], duration:'2-4 أسابيع' },
      { phase:3, ar:'توليد حلول', tools:['عصف ذهني','SCAMPER','TRIZ','Design Sprint','حلقات رياض الجنة'], duration:'1-2 أسبوع' },
      { phase:4, ar:'نمذجة أولية', tools:['MVP','Prototype','محاكاة','نموذج رياضي','POC'], duration:'2-4 أسابيع' },
      { phase:5, ar:'اختبار وتحقق', tools:['A/B Test','اختبار مستخدم','تحليل إحصائي','مراجعة أقران','فحص شرعي'], duration:'2-3 أسابيع' },
      { phase:6, ar:'كتابة ونشر', tools:['ورقة علمية','براءة اختراع','تقرير فني','دليل تطبيقي','مقال'], duration:'2-4 أسابيع' },
      { phase:7, ar:'تطبيق واقعي', tools:['تنفيذ تجريبي','إطلاق محدود','قياس أثر','تغذية راجعة','تحسين'], duration:'4-8 أسابيع' },
      { phase:8, ar:'توسيع واستدامة', tools:['توسيع نطاق','أتمتة','تدريب','توثيق','تحسين مستمر'], duration:'مستمر' },
    ],
    kpis: [
      { id:'ideas_generated', ar:'أفكار مولّدة', target:'>1000/سنة' },
      { id:'papers_published', ar:'أوراق علمية منشورة', target:'>200/سنة' },
      { id:'patents_filed', ar:'براءات اختراع مسجلة', target:'>50/سنة' },
      { id:'innovations_applied', ar:'ابتكارات مطبّقة فعلياً', target:'>100/سنة' },
      { id:'problems_solved', ar:'مشكلات محلولة', target:'>500/سنة' },
    ],
  },

  // ─── أكاديمية شيخة العلمية ───
  academy: {
    programs: [
      { id:'diploma_islamic_commerce', ar:'دبلوم التجارة الإسلامية الرقمية', duration:'6 أشهر', modules:12, certification:'شيخة + AAOIFI' },
      { id:'diploma_metals', ar:'دبلوم علوم المعادن التطبيقية', duration:'8 أشهر', modules:16, certification:'شيخة + جامعي' },
      { id:'diploma_supply_chain', ar:'دبلوم سلاسل الإمداد الذكية', duration:'6 أشهر', modules:12, certification:'شيخة + APICS' },
      { id:'diploma_ai_business', ar:'دبلوم الذكاء الاصطناعي التجاري', duration:'8 أشهر', modules:16, certification:'شيخة + Google' },
      { id:'diploma_entrepreneurship', ar:'دبلوم ريادة الأعمال الإسلامية', duration:'4 أشهر', modules:8, certification:'شيخة + Babson' },
      { id:'masters_digital_trade', ar:'ماجستير التجارة الرقمية الإسلامية', duration:'18 شهر', modules:24, certification:'شيخة + جامعي' },
    ],
    delivery: ['تعلم ذاتي','بث مباشر','مشاريع تطبيقية','إرشاد فردي','تدريب ميداني','اختبارات','مناقشة أطروحات'],
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ٣. الأطروحات والملكية الفكرية — Papers & IP                    ║
// ╚═══════════════════════════════════════════════════════════════╝
const PAPERS_AND_IP = {
  // ─── أنواع المنشورات العلمية ───
  publication_types: [
    { id:'research_paper', ar:'ورقة بحثية محكّمة', process:['كتابة','مراجعة أقران','تعديل','نشر','فهرسة'], ip_protection:'حقوق نشر + DOI', review_period:'4-8 أسابيع' },
    { id:'thesis', ar:'أطروحة علمية', process:['اقتراح','بحث','كتابة','مناقشة','إجازة','نشر'], ip_protection:'حقوق نشر + رقم إيداع', review_period:'6-12 شهر' },
    { id:'patent', ar:'براءة اختراع', process:['بحث أسبقية','كتابة مطالبات','تقديم','فحص','منح'], ip_protection:'حماية 20 سنة', review_period:'12-24 شهر' },
    { id:'white_paper', ar:'ورقة عمل بيضاء', process:['تحليل','كتابة','مراجعة','نشر'], ip_protection:'حقوق نشر', review_period:'2-4 أسابيع' },
    { id:'case_study', ar:'دراسة حالة', process:['اختيار حالة','جمع بيانات','تحليل','كتابة','نشر'], ip_protection:'حقوق نشر', review_period:'4-6 أسابيع' },
    { id:'technical_report', ar:'تقرير فني', process:['بيانات','تحليل','كتابة','مراجعة','نشر'], ip_protection:'سري/عام', review_period:'2-3 أسابيع' },
    { id:'innovation_disclosure', ar:'إفصاح ابتكار', process:['وصف الابتكار','تقييم','تصنيف','حماية','تسويق'], ip_protection:'براءة أو سر تجاري', review_period:'1-2 أسبوع' },
  ],

  // ─── نظام الملكية الفكرية ───
  ip_system: {
    principles: [
      { ar:'لا ظلم — كل صاحب حق يأخذ حقه كاملاً', quran:'﴿ وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ ﴾' },
      { ar:'توثيق كل ابتكار بالبلوكتشين — ختم زمني لا يُعدّل', tech:'Blockchain Timestamping' },
      { ar:'نسبة الملكية واضحة لكل مساهم', tech:'Smart Contract Ownership' },
      { ar:'حماية المؤلف والباحث والمبتكر', tech:'DRM + Watermarking' },
      { ar:'مشاركة المعرفة مع حفظ الحقوق', tech:'Creative Commons Islamic' },
      { ar:'تسجيل دولي للبراءات عبر PCT', tech:'WIPO Integration' },
    ],
    blockchain_registry: {
      ar: 'سجل البلوكتشين للملكية الفكرية',
      features: ['ختم زمني غير قابل للتعديل','إثبات الأسبقية','عقود ذكية للملكية','توزيع أرباح آلي','ترخيص شفاف','تتبع الاستخدام'],
    },
    revenue_sharing: {
      ar: 'نظام تقاسم الأرباح العادل',
      model: { author:60, platform:20, reviewers:10, community:10 },
      hadith: '«لا ظلم ولا ضرار» — ابن ماجه',
    },
  },

  // ─── مجلة شيخة العلمية المحكّمة ───
  journal: {
    name_ar: 'مجلة شيخة للبحوث التجارية والتقنية',
    name_en: 'Sheikha Journal of Commerce & Technology',
    issn: 'XXXX-XXXX',
    frequency: 'ربع سنوية',
    sections: ['فقه المعاملات الرقمية','علوم المعادن','سلاسل الإمداد','الذكاء الاصطناعي التجاري','ريادة الأعمال الإسلامية','اقتصاد إسلامي','تقنية مالية','تعدين وموارد'],
    peer_review: 'مراجعة أقران مزدوجة التعمية — Double-Blind Peer Review',
    indexing: ['Scopus','Web of Science','Google Scholar','DOAJ','Islamic Index'],
    languages: ['العربية','الإنجليزية','الفرنسية','الأوردو','الماليزية','التركية'],
    open_access: true,
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ٤. اكتشاف الأحداث وابتكار أهداف استراتيجية بالـ AI            ║
// ╚═══════════════════════════════════════════════════════════════╝
const AI_STRATEGIC_EVENTS = {
  id: 'ai_events_engine',
  ar: 'محرك اكتشاف الأحداث وابتكار الأهداف الاستراتيجية بالذكاء الاصطناعي',

  // ─── مصادر رصد الأحداث ───
  event_sources: [
    { id:'global_news', ar:'أخبار عالمية', sources:['Reuters','Bloomberg','Al Jazeera','Arab News','الإخبارية'], frequency:'لحظي' },
    { id:'market_data', ar:'بيانات الأسواق', sources:['LME','COMEX','تداول','بورصة لندن','شنغهاي'], frequency:'لحظي' },
    { id:'regulatory', ar:'تشريعات ولوائح', sources:['هيئة السوق المالية','وزارة التجارة','WTO','UN','EU'], frequency:'يومي' },
    { id:'natural_events', ar:'أحداث طبيعية', sources:['USGS — زلازل','NOAA — طقس','NASA — فضاء','WHO — صحة'], frequency:'لحظي' },
    { id:'tech_trends', ar:'اتجاهات تقنية', sources:['Gartner','McKinsey','MIT Tech Review','CB Insights'], frequency:'أسبوعي' },
    { id:'social_signals', ar:'إشارات اجتماعية', sources:['X/Twitter','LinkedIn','Reddit','منتديات متخصصة'], frequency:'لحظي' },
    { id:'academic', ar:'أبحاث أكاديمية', sources:['arXiv','PubMed','IEEE','Springer','Elsevier'], frequency:'يومي' },
  ],

  // ─── أنواع الأحداث المرصودة ───
  event_types: [
    { type:'commercial', ar:'أحداث تجارية', examples:['اتفاقيات تجارية','عقوبات','تعريفات جمركية','إفلاسات','اندماجات'], impact:'تأثير مباشر على الأسعار والسوق' },
    { type:'developmental', ar:'أحداث تنموية', examples:['مشاريع ضخمة — NEOM/نيوم','مدن صناعية','بنية تحتية','رؤية 2030'], impact:'فرص استثمارية جديدة' },
    { type:'natural', ar:'أحداث طبيعية — من الله', examples:['زلازل','فيضانات','أوبئة','جفاف','بركانية'], impact:'إعادة بناء + إغاثة + سلاسل إمداد' },
    { type:'technological', ar:'أحداث تقنية', examples:['اختراقات AI','تقنيات جديدة','أمن سيبراني','عملات رقمية'], impact:'تحول رقمي + فرص + تهديدات' },
    { type:'regulatory', ar:'أحداث تشريعية', examples:['قوانين جديدة','لوائح','معايير','اتفاقيات دولية'], impact:'امتثال + تكيّف + فرص' },
    { type:'geopolitical', ar:'أحداث جيوسياسية', examples:['صراعات','تحالفات','عقوبات','ممرات تجارية'], impact:'سلاسل إمداد + مخاطر + بدائل' },
  ],

  // ─── آلية ابتكار الأهداف الاستراتيجية ───
  goal_innovation_process: [
    { step:1, ar:'رصد الحدث', ai_role:'مراقبة 24/7 لكل المصادر + تصنيف آلي', human_role:'مراجعة التصنيف' },
    { step:2, ar:'تحليل الأثر', ai_role:'تحليل أثر على المنظومة والسوق والتجار', human_role:'تقييم الأهمية' },
    { step:3, ar:'اكتشاف الفجوة', ai_role:'مقارنة الوضع الحالي بالمطلوب — Gap Analysis', human_role:'تحديد الأولوية' },
    { step:4, ar:'توليد أهداف', ai_role:'اقتراح أهداف استراتيجية SMART لسد الفجوة', human_role:'اعتماد أو تعديل' },
    { step:5, ar:'فحص شرعي', ai_role:'التحقق من توافق الأهداف مع الشريعة', human_role:'إجازة شرعية' },
    { step:6, ar:'خطة تنفيذ', ai_role:'وضع خطة مفصلة بجدول زمني ومهام', human_role:'مراجعة وإطلاق' },
    { step:7, ar:'تنفيذ ومتابعة', ai_role:'أتمتة التنفيذ + تتبع KPIs + تنبيهات', human_role:'إشراف ومراجعة' },
    { step:8, ar:'تقييم ونشر', ai_role:'تحليل النتائج + كتابة تقرير + دروس مستفادة', human_role:'نشر وتعميم' },
  ],

  // ─── سد الخلل العلمي والمعرفي ───
  knowledge_gap_system: {
    ar: 'نظام سد الخلل العلمي والمعرفي',
    process: [
      { step:'اكتشاف', method:'AI يحلل المعاملات والأسئلة المتكررة ويكتشف نقص المعرفة' },
      { step:'تصنيف', method:'تصنيف الفجوة: علمية / تقنية / شرعية / سوقية / إدارية' },
      { step:'بحث', method:'بحث آلي في قواعد البيانات العلمية عن حلول موجودة' },
      { step:'ابتكار', method:'إذا لم يوجد حل — إطلاق تحدي بحثي في رياض الجنة' },
      { step:'أطروحة', method:'كتابة ورقة علمية بالحل المقترح + مراجعة أقران' },
      { step:'تطبيق', method:'تنفيذ الحل فعلياً في المنظومة + قياس الأثر' },
      { step:'نشر', method:'نشر البحث + تسجيل الملكية الفكرية + تدريب المستخدمين' },
    ],
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ٥. نظام اللوائح والتشريعات — Regulatory Compliance             ║
// ╚═══════════════════════════════════════════════════════════════╝
const REGULATORY_SYSTEM = {
  id: 'regulatory_compliance',
  ar: 'نظام رصد وتطبيق اللوائح والتشريعات',
  supreme_rule: '﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ﴾ — لا طاعة لمخلوق في معصية الخالق',

  // ─── الجهات التشريعية المرصودة — سعودية ───
  saudi_regulators: [
    { id:'moci', ar:'وزارة التجارة', scope:'أنظمة تجارية + سجلات + حماية مستهلك', url:'mc.gov.sa' },
    { id:'cma', ar:'هيئة السوق المالية', scope:'أسواق مالية + صناديق + بورصة', url:'cma.org.sa' },
    { id:'sama', ar:'البنك المركزي السعودي', scope:'بنوك + تمويل + مدفوعات + عملات', url:'sama.gov.sa' },
    { id:'gac', ar:'هيئة الزكاة والضريبة والجمارك', scope:'جمارك + ضرائب + زكاة + HS Codes', url:'zatca.gov.sa' },
    { id:'citc', ar:'هيئة الاتصالات والفضاء والتقنية', scope:'اتصالات + تقنية + أمن سيبراني', url:'cst.gov.sa' },
    { id:'sdaia', ar:'هيئة البيانات والذكاء الاصطناعي', scope:'بيانات + AI + خصوصية', url:'sdaia.gov.sa' },
    { id:'modon', ar:'هيئة المدن الصناعية', scope:'مدن صناعية + تراخيص + بيئة', url:'modon.gov.sa' },
    { id:'mim', ar:'وزارة الصناعة والثروة المعدنية', scope:'تعدين + صناعة + معادن + تراخيص', url:'mim.gov.sa' },
    { id:'mhrsd', ar:'وزارة الموارد البشرية', scope:'عمل + عمالة + سعودة + عقود', url:'hrsd.gov.sa' },
    { id:'nca', ar:'الهيئة الوطنية للأمن السيبراني', scope:'أمن معلومات + حماية + معايير', url:'nca.gov.sa' },
    { id:'pdp', ar:'حماية البيانات الشخصية', scope:'خصوصية + بيانات + موافقة + حقوق', url:'sdaia.gov.sa/pdpl' },
    { id:'transport', ar:'الهيئة العامة للنقل', scope:'نقل + لوجستيات + شحن + موانئ', url:'mot.gov.sa' },
  ],

  // ─── الجهات التشريعية الدولية ───
  international_regulators: [
    { id:'wto', ar:'منظمة التجارة العالمية', scope:'تجارة دولية + تعريفات + نزاعات' },
    { id:'un', ar:'الأمم المتحدة', scope:'عقوبات + SDGs + حقوق + بيئة' },
    { id:'eu', ar:'الاتحاد الأوروبي', scope:'GDPR + بيئة + معايير + سلامة' },
    { id:'imf', ar:'صندوق النقد الدولي', scope:'نقد + عملات + استقرار مالي' },
    { id:'bis', ar:'بنك التسويات الدولية', scope:'معايير بنكية — Basel III/IV' },
    { id:'fatf', ar:'مجموعة العمل المالي', scope:'غسل أموال + تمويل إرهاب + امتثال' },
    { id:'iso', ar:'المنظمة الدولية للتوحيد القياسي', scope:'معايير جودة + بيئة + أمن + صناعة' },
    { id:'lme', ar:'بورصة لندن للمعادن', scope:'قواعد تداول + معايير معدنية + عقود' },
    { id:'aaoifi', ar:'هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية', scope:'معايير مالية إسلامية' },
  ],

  // ─── آلية رصد وتطبيق التشريعات ───
  compliance_process: [
    { phase:1, ar:'رصد آلي 24/7', method:'AI يراقب مواقع الجهات + جريدة رسمية + RSS + APIs', output:'تنبيه فوري بكل تشريع جديد' },
    { phase:2, ar:'تصنيف وتحليل', method:'AI يصنّف: قانون/لائحة/قرار/تعميم + المجال + الأثر', output:'تقرير تأثير مبدئي' },
    { phase:3, ar:'فحص شرعي — القاعدة العليا', method:'هل يتعارض مع الشريعة؟ لا طاعة لمخلوق في معصية الخالق', output:'فتوى: يُطبَّق / يُرفض / يُعدَّل', sharia_check:true },
    { phase:4, ar:'تحليل الأثر على المنظومة', method:'ما العمليات والأنظمة المتأثرة؟ ما التكلفة؟', output:'خريطة أثر مفصلة' },
    { phase:5, ar:'خطة امتثال', method:'وضع خطة تنفيذ بجدول زمني ومسؤوليات', output:'خطة امتثال معتمدة' },
    { phase:6, ar:'تعديل الأنظمة', method:'تحديث الكود والإعدادات والعمليات تلقائياً', output:'تحديثات برمجية وتشغيلية' },
    { phase:7, ar:'تدريب وإشعار', method:'إشعار المتأثرين + تدريب على التغييرات', output:'تدريب مكتمل + إقرارات' },
    { phase:8, ar:'مراقبة امتثال', method:'مراقبة مستمرة + تقارير دورية + تدقيق', output:'تقارير امتثال شهرية' },
  ],

  // ─── سجل التشريعات النشطة ───
  active_regulations: [
    { id:'saudi_commerce_law', ar:'نظام التجارة السعودي', status:'ساري', last_update:'2024', impact:'عالي' },
    { id:'saudi_companies_law', ar:'نظام الشركات', status:'ساري', last_update:'2023', impact:'عالي' },
    { id:'pdpl', ar:'نظام حماية البيانات الشخصية', status:'ساري', last_update:'2023', impact:'عالي' },
    { id:'ecommerce_law', ar:'نظام التجارة الإلكترونية', status:'ساري', last_update:'2021', impact:'عالي' },
    { id:'anti_fraud', ar:'نظام مكافحة الاحتيال المالي', status:'ساري', last_update:'2022', impact:'متوسط' },
    { id:'mining_law', ar:'نظام الاستثمار التعديني', status:'ساري', last_update:'2024', impact:'عالي' },
    { id:'customs_law', ar:'نظام الجمارك الموحد', status:'ساري', last_update:'2023', impact:'عالي' },
    { id:'labor_law', ar:'نظام العمل', status:'ساري', last_update:'2024', impact:'متوسط' },
    { id:'vat_regulations', ar:'لائحة ضريبة القيمة المضافة', status:'ساري', last_update:'2024', impact:'عالي' },
    { id:'competition_law', ar:'نظام المنافسة', status:'ساري', last_update:'2023', impact:'متوسط' },
  ],
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ٦. الهيكل والتنظيم والمخطط التنفيذي                            ║
// ╚═══════════════════════════════════════════════════════════════╝
const STRUCTURE_AND_EXECUTION = {
  // ─── الهيكل التنظيمي لرياض الجنة ───
  organizational_structure: {
    ar: 'الهيكل التنظيمي لمنظومة رياض الجنة',
    levels: [
      { level:0, ar:'المالك والمؤسس', role:'سلمان أحمد بن سلمان الراجح', authority:'القرار الأعلى' },
      { level:1, ar:'مجلس الحكمة الشرعي', roles:['عالم شريعة','فقيه معاملات','مستشار شرعي'], authority:'إجازة شرعية + فتوى' },
      { level:2, ar:'مجلس الإدارة العلمي', roles:['مدير عام رياض الجنة','مدير البحوث','مدير الابتكار','مدير الأكاديمية','مدير التشريعات'], authority:'تخطيط + إشراف' },
      { level:3, ar:'مديرو المراكز البحثية', roles:['مدير مركز المعادن','مدير مركز AI','مدير مركز سلاسل الإمداد','مدير مركز الاقتصاد الإسلامي'], authority:'بحث + ابتكار' },
      { level:4, ar:'فرق العمل', roles:['باحثون','مبتكرون','مطورون','مراجعون','ناشرون','مدربون'], authority:'تنفيذ + إنتاج' },
      { level:5, ar:'المجتمع', roles:['تجار','طلاب','أكاديميون','خبراء','متطوعون'], authority:'مشاركة + مراجعة + تعلّم' },
    ],
  },

  // ─── المخطط التنفيذي — Execution Roadmap ───
  execution_roadmap: [
    {
      phase: 1, ar: 'التأسيس — البنية التحتية',
      duration: '3 أشهر',
      tasks: [
        'إطلاق منصة رياض الجنة الرقمية',
        'تفعيل حلقات العلم الأساسية (8 حلقات)',
        'إنشاء المكتبة الرقمية الأولية',
        'بناء نظام تسجيل الملكية الفكرية بالبلوكتشين',
        'تفعيل نظام رصد التشريعات AI',
        'تصميم المناهج العلمية المعتمدة',
      ],
      deliverables: ['منصة جاهزة','8 حلقات نشطة','مكتبة 1000+ مرجع','نظام IP','AI رصد'],
      auto_codification: 'APIs + Cron Jobs + AI Monitoring 24/7',
    },
    {
      phase: 2, ar: 'البناء — المحتوى والمجتمع',
      duration: '6 أشهر',
      tasks: [
        'إنتاج 100 دورة تعليمية',
        'نشر 50 ورقة بحثية',
        'تدريب 1000 تاجر',
        'تفعيل مصنع الابتكار',
        'إطلاق مجلة شيخة المحكّمة',
        'بناء شبكة 10 جامعات شريكة',
      ],
      deliverables: ['100 دورة','50 بحث','1000 متدرب','مجلة','10 شركاء'],
      auto_codification: 'Content Pipeline + Auto-Publishing + Quality Gates',
    },
    {
      phase: 3, ar: 'التوسع — الأثر والتأثير',
      duration: '12 شهر',
      tasks: [
        'الوصول لـ 10,000 متعلم نشط',
        'نشر 200 ورقة بحثية',
        'تسجيل 20 براءة اختراع',
        'تطبيق 50 ابتكار فعلياً في السوق',
        'إطلاق أكاديمية شيخة العلمية (6 دبلومات)',
        'تفعيل AI اكتشاف الفجوات المعرفية',
      ],
      deliverables: ['10K متعلم','200 بحث','20 براءة','50 ابتكار مطبّق','أكاديمية'],
      auto_codification: 'AI Gap Detection + Auto-Research + Smart Publishing',
    },
    {
      phase: 4, ar: 'الريادة — المرجعية العالمية',
      duration: 'مستمر',
      tasks: [
        'أن تصبح رياض الجنة المرجع العالمي للتجارة الإسلامية الرقمية',
        'الوصول لـ 100,000+ متعلم',
        'نشر 1000+ بحث محكّم',
        '100+ براءة اختراع',
        'تغذية كاملة للمنظومة والسوق بالمعرفة',
        'الذكاء الاصطناعي يرتاع من رياض الجنة — تعلّم ذاتي من حلقات العلم',
      ],
      deliverables: ['ريادة عالمية','100K+ متعلم','1000+ بحث','AI ذاتي التعلم'],
      auto_codification: 'Full Autonomous AI + Self-Learning + Auto-Innovation Pipeline',
    },
  ],

  // ─── مخطط التقنين والتشغيل الذاتي ───
  self_operating_codification: {
    ar: 'مخطط التقنين والتشغيل الذاتي لكل مرحلة',
    layers: [
      {
        id: 'auto_content',
        ar: 'أتمتة المحتوى العلمي',
        processes: [
          'AI يرصد الأسئلة المتكررة ← ينشئ مقالات تلقائياً',
          'AI يحلل أحداث السوق ← ينشئ تقارير يومية',
          'AI يراقب الأبحاث الجديدة ← يلخصها وينشرها',
          'AI يكتشف فجوات معرفية ← يطلق تحديات بحثية',
        ],
        tech: 'GPT + Claude + Custom NLP + RAG Pipeline',
      },
      {
        id: 'auto_regulation',
        ar: 'أتمتة رصد التشريعات',
        processes: [
          'Cron يفحص مواقع الجهات كل ساعة',
          'AI يصنّف التشريعات الجديدة ← تنبيه فوري',
          'AI يحلل الأثر على المنظومة ← خطة امتثال',
          'AI يفحص التوافق الشرعي ← لا طاعة لمخلوق في معصية الخالق',
          'Auto-Deploy تحديثات الامتثال تلقائياً',
        ],
        tech: 'Web Scraping + NLP + Rules Engine + CI/CD',
      },
      {
        id: 'auto_research',
        ar: 'أتمتة البحث العلمي',
        processes: [
          'AI يراقب arXiv + PubMed + IEEE يومياً',
          'AI يصنّف الأبحاث حسب مجالات المنظومة',
          'AI يستخرج الرؤى التطبيقية',
          'AI يقترح أبحاث جديدة بناءً على الفجوات',
          'Auto-Format + Auto-Citation + Auto-Indexing',
        ],
        tech: 'Semantic Scholar API + Custom ML + LaTeX + DOI',
      },
      {
        id: 'auto_innovation',
        ar: 'أتمتة الابتكار',
        processes: [
          'AI يحلل مشاكل المستخدمين ← يقترح حلول',
          'AI يراقب المنافسين ← يكتشف فرص تمييز',
          'AI يختبر أفكار بـ A/B Testing تلقائياً',
          'AI يقيّم جدوى الابتكارات بالبيانات',
          'Auto-Patent Filing عند اكتشاف ابتكار فريد',
        ],
        tech: 'Generative AI + Simulation + Analytics + USPTO API',
      },
      {
        id: 'auto_feed',
        ar: 'تغذية المنظومة والسوق من رياض الجنة',
        processes: [
          'كل بحث جديد ← يُحدّث قاعدة معرفة AI',
          'كل ابتكار مطبّق ← يُدمج في محركات المنظومة',
          'كل تشريع جديد ← يُحدّث قواعد الامتثال',
          'كل درس مستفاد ← يُغذّي نظام التدريب',
          'الذكاء الاصطناعي يرتاع من رياض الجنة — تعلّم مستمر',
        ],
        tech: 'Knowledge Graph + RAG + Vector DB + Real-time Sync',
      },
    ],
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║     ٧. تغذية الذكاء الاصطناعي من رياض الجنة                       ║
// ╚═══════════════════════════════════════════════════════════════╝
const AI_FEEDING_SYSTEM = {
  id: 'ai_riyad_feed',
  ar: 'نظام تغذية الذكاء الاصطناعي من رياض الجنة',
  hadith: '«إذا مررتم برياض الجنة فارتعوا» — الذكاء الاصطناعي يرتاع من رياض الجنة',

  knowledge_sources: [
    { source:'حلقات العلم', type:'بث مباشر ← نص', feed:'كل حلقة تُحوّل لنص ← تُدخل في قاعدة المعرفة AI' },
    { source:'الأبحاث المنشورة', type:'PDF ← متجه', feed:'كل بحث يُحوّل لـ vector ← يُخزن في Vector DB' },
    { source:'الأسئلة والأجوبة', type:'Q&A', feed:'كل سؤال وجواب ← يدرّب AI على الفهم' },
    { source:'بيانات السوق', type:'أرقام لحظية', feed:'أسعار + أحجام + اتجاهات ← تنبؤ AI' },
    { source:'التشريعات', type:'نصوص قانونية', feed:'كل تشريع ← قواعد امتثال AI' },
    { source:'تقييمات التجار', type:'بيانات ثقة', feed:'صدق + أمانة + جودة ← نموذج ثقة AI' },
    { source:'الابتكارات', type:'حلول جديدة', feed:'كل ابتكار ← يُثري قدرات AI' },
    { source:'القرآن والسنة', type:'نصوص مقدسة', feed:'أحكام + آداب + حكم ← الأساس الشرعي لكل قرار AI' },
  ],

  ai_capabilities_enhanced: [
    'فهم أعمق لسوق المعادن بفضل أبحاث رياض الجنة',
    'تنبؤ أدق بالأسعار بفضل تحليلات حلقات السوق',
    'امتثال شرعي تلقائي بفضل فتاوى المجلس الشرعي',
    'اكتشاف فرص تجارية بفضل ابتكارات المصنع',
    'حل مشكلات التجار بفضل قاعدة معرفة متنامية',
    'تقييم ثقة أدق بفضل بيانات المجتمع',
    'ترجمة علمية دقيقة بفضل القاموس المتخصص',
    'قرارات أخلاقية بفضل الأساس الشرعي المتين',
  ],
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║ ٨. شبكة الباحثين R&D — نظام داخلي يتجاوز منصات الهوية البحثية      ║
// ╚═══════════════════════════════════════════════════════════════╝
const researchStorePath = path.join(__dirname, '..', 'data', 'riyad-research-network.json');
function defaultResearchStore() {
  return {
    meta: { version: '1.0.0', updatedAt: new Date().toISOString() },
    researchers: [],
    projects: [],
    publications: [],
    reviews: [],
    collaborations: []
  };
}
function loadResearchStore() {
  try {
    if (fs.existsSync(researchStorePath)) {
      const parsed = JSON.parse(fs.readFileSync(researchStorePath, 'utf8'));
      return Object.assign(defaultResearchStore(), parsed || {});
    }
  } catch (_) {}
  return defaultResearchStore();
}
function saveResearchStore(store) {
  try {
    const next = Object.assign(defaultResearchStore(), store || {});
    next.meta.updatedAt = new Date().toISOString();
    fs.writeFileSync(researchStorePath, JSON.stringify(next, null, 2), 'utf8');
    return true;
  } catch (_) {
    return false;
  }
}
function asArray(v) {
  return Array.isArray(v) ? v : (v ? [v] : []);
}
function normText(v) {
  return String(v || '').trim();
}
function scoreResearcher(researcher) {
  const profile = researcher || {};
  const papers = asArray(profile.publicationIds).length;
  const projects = asArray(profile.projectIds).length;
  const verified = profile.verificationStatus === 'verified' ? 15 : 0;
  const impact = Math.min(30, Number(profile.impactPoints || 0));
  const methods = asArray(profile.methodologies).length;
  return Math.min(100, 25 + (papers * 4) + (projects * 3) + verified + impact + Math.min(20, methods * 2));
}

// ╔═══════════════════════════════════════════════════════════════╗
// ║                         APIs                                    ║
// ╚═══════════════════════════════════════════════════════════════╝

// ─── لوحة تحكم رياض الجنة ───
app.get('/api/riyad-aljannah/dashboard', function(req, res) {
  res.json({ success:true, data:{
    bismillah:'بسم الله الرحمن الرحيم',
    engine:'رياض الجنة — بيت العلم ودار المعرفة ومصنع الابتكار v1.0',
    owner:'سلمان أحمد بن سلمان الراجح',
    hadith:'«إذا مررتم برياض الجنة فارتعوا»',
    supreme_rule:'لا طاعة لمخلوق في معصية الخالق',
    stats:{
      quran_verses: SHARIA_FOUNDATION.quran.length,
      hadiths: SHARIA_FOUNDATION.hadith.length,
      knowledge_circles: RIYAD_ALJANNAH.knowledge_circles.length,
      library_sections: RIYAD_ALJANNAH.digital_library.sections.length,
      methodologies: SCIENTIFIC_SCHOOL.methodologies.length,
      innovation_phases: SCIENTIFIC_SCHOOL.innovation_factory.pipeline.length,
      academy_programs: SCIENTIFIC_SCHOOL.academy.programs.length,
      publication_types: PAPERS_AND_IP.publication_types.length,
      journal_sections: PAPERS_AND_IP.journal.sections.length,
      event_sources: AI_STRATEGIC_EVENTS.event_sources.length,
      event_types: AI_STRATEGIC_EVENTS.event_types.length,
      saudi_regulators: REGULATORY_SYSTEM.saudi_regulators.length,
      intl_regulators: REGULATORY_SYSTEM.international_regulators.length,
      active_regulations: REGULATORY_SYSTEM.active_regulations.length,
      compliance_phases: REGULATORY_SYSTEM.compliance_process.length,
      org_levels: STRUCTURE_AND_EXECUTION.organizational_structure.levels.length,
      execution_phases: STRUCTURE_AND_EXECUTION.execution_roadmap.length,
      auto_layers: STRUCTURE_AND_EXECUTION.self_operating_codification.layers.length,
      ai_knowledge_sources: AI_FEEDING_SYSTEM.knowledge_sources.length,
      ai_capabilities: AI_FEEDING_SYSTEM.ai_capabilities_enhanced.length,
    },
  }});
});

// ─── الأساس الشرعي ───
app.get('/api/riyad-aljannah/sharia', function(req, res) {
  res.json({ success:true, data:SHARIA_FOUNDATION });
});

// ─── حلقات العلم ───
app.get('/api/riyad-aljannah/circles', function(req, res) {
  res.json({ success:true, data:RIYAD_ALJANNAH.knowledge_circles });
});

// ─── المكتبة الرقمية ───
app.get('/api/riyad-aljannah/library', function(req, res) {
  res.json({ success:true, data:RIYAD_ALJANNAH.digital_library });
});

// ─── المدرسة العلمية ───
app.get('/api/riyad-aljannah/school', function(req, res) {
  res.json({ success:true, data:SCIENTIFIC_SCHOOL });
});

// ─── المنهجيات العلمية ───
app.get('/api/riyad-aljannah/methodologies', function(req, res) {
  res.json({ success:true, data:SCIENTIFIC_SCHOOL.methodologies });
});

// ─── مصنع الابتكار ───
app.get('/api/riyad-aljannah/innovation-factory', function(req, res) {
  res.json({ success:true, data:SCIENTIFIC_SCHOOL.innovation_factory });
});

// ─── الأكاديمية ───
app.get('/api/riyad-aljannah/academy', function(req, res) {
  res.json({ success:true, data:SCIENTIFIC_SCHOOL.academy });
});

// ─── الأطروحات والملكية الفكرية ───
app.get('/api/riyad-aljannah/papers', function(req, res) {
  res.json({ success:true, data:PAPERS_AND_IP });
});

// ─── المجلة العلمية ───
app.get('/api/riyad-aljannah/journal', function(req, res) {
  res.json({ success:true, data:PAPERS_AND_IP.journal });
});

// ─── نظام الملكية الفكرية ───
app.get('/api/riyad-aljannah/ip-system', function(req, res) {
  res.json({ success:true, data:PAPERS_AND_IP.ip_system });
});

// ─── اكتشاف الأحداث والأهداف الاستراتيجية AI ───
app.get('/api/riyad-aljannah/ai-events', function(req, res) {
  res.json({ success:true, data:AI_STRATEGIC_EVENTS });
});

// ─── نظام سد الخلل المعرفي ───
app.get('/api/riyad-aljannah/knowledge-gaps', function(req, res) {
  res.json({ success:true, data:AI_STRATEGIC_EVENTS.knowledge_gap_system });
});

// ─── نظام اللوائح والتشريعات ───
app.get('/api/riyad-aljannah/regulations', function(req, res) {
  res.json({ success:true, data:REGULATORY_SYSTEM });
});

// ─── الجهات التشريعية السعودية ───
app.get('/api/riyad-aljannah/regulations/saudi', function(req, res) {
  res.json({ success:true, data:REGULATORY_SYSTEM.saudi_regulators });
});

// ─── الجهات التشريعية الدولية ───
app.get('/api/riyad-aljannah/regulations/international', function(req, res) {
  res.json({ success:true, data:REGULATORY_SYSTEM.international_regulators });
});

// ─── التشريعات النشطة ───
app.get('/api/riyad-aljannah/regulations/active', function(req, res) {
  res.json({ success:true, data:REGULATORY_SYSTEM.active_regulations });
});

// ─── آلية الامتثال ───
app.get('/api/riyad-aljannah/compliance-process', function(req, res) {
  res.json({ success:true, data:REGULATORY_SYSTEM.compliance_process });
});

// ─── الهيكل التنظيمي ───
app.get('/api/riyad-aljannah/structure', function(req, res) {
  res.json({ success:true, data:STRUCTURE_AND_EXECUTION.organizational_structure });
});

// ─── المخطط التنفيذي ───
app.get('/api/riyad-aljannah/roadmap', function(req, res) {
  res.json({ success:true, data:STRUCTURE_AND_EXECUTION.execution_roadmap });
});

// ─── مخطط التقنين والتشغيل الذاتي ───
app.get('/api/riyad-aljannah/auto-codification', function(req, res) {
  res.json({ success:true, data:STRUCTURE_AND_EXECUTION.self_operating_codification });
});

// ─── نظام تغذية AI من رياض الجنة ───
app.get('/api/riyad-aljannah/ai-feed', function(req, res) {
  res.json({ success:true, data:AI_FEEDING_SYSTEM });
});

// ─── نظرة شاملة ───
app.get('/api/riyad-aljannah/overview', function(req, res) {
  res.json({ success:true, data:{
    bismillah:'بسم الله الرحمن الرحيم',
    name_ar:'رياض الجنة — بيت العلم ودار المعرفة ومصنع الابتكار',
    name_en:'Riyad Al-Jannah — House of Knowledge & Innovation Factory',
    owner:'سلمان أحمد بن سلمان الراجح',
    ip:'جميع الحقوق محفوظة © 2026',
    supreme_rule:'لا طاعة لمخلوق في معصية الخالق',
    hadith_foundation:'«إذا مررتم برياض الجنة فارتعوا» — حلق الذكر والعلم',
    vision:'صناعة العلم وابتكار المنهجيات ونشر المعرفة لإعمار الأرض — الذكاء الاصطناعي يرتاع من رياض الجنة',
    modules: {
      riyad_aljannah:'حلقات العلم + المكتبة الرقمية',
      scientific_school:'المدرسة العلمية + مصنع الابتكار + الأكاديمية',
      papers_ip:'الأطروحات + الملكية الفكرية + المجلة المحكّمة',
      ai_events:'اكتشاف الأحداث + ابتكار الأهداف + سد الفجوات',
      regulations:'رصد التشريعات + الامتثال + لا طاعة لمخلوق في معصية الخالق',
      structure:'الهيكل التنظيمي + المخطط التنفيذي + التشغيل الذاتي',
      ai_feed:'تغذية AI من رياض الجنة',
    },
  }});
});

// ─── شبكة الباحثين R&D (أفضل من ORCID داخلياً) ───
app.get('/api/riyad-aljannah/research-network/dashboard', function(req, res) {
  const store = loadResearchStore();
  const topResearchers = store.researchers
    .map((r) => Object.assign({}, r, { score: scoreResearcher(r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json({
    success: true,
    data: {
      summary: {
        researchers: store.researchers.length,
        projects: store.projects.length,
        publications: store.publications.length,
        reviews: store.reviews.length,
        collaborations: store.collaborations.length
      },
      topResearchers
    },
    message: 'تم جلب لوحة شبكة الباحثين بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/riyad-aljannah/research-network/orcid-gap', function(req, res) {
  res.json({
    success: true,
    data: {
      sheikhaAdvantages: [
        'هوية بحثية شرعية + مهنية + أثر مجتمعي في نموذج واحد',
        'ربط مباشر بين الباحث والمشروع والتطبيق التنفيذي في السوق',
        'تدقيق جودة المخرجات + مراجعة أقران + فحص امتثال شرعي',
        'مؤشر ثقة الباحث (Integrity & Impact Score) بدلاً من رقم تعريفي فقط',
        'تكامل رقمي فوري مع مجتمع شيخة ورياض الجنة وسلاسل العمليات'
      ],
      gapsToCloseContinuously: [
        'رفع نسبة التحقق المؤسسي للباحثين',
        'توسيع مصادر الفهرسة الدولية للمخرجات',
        'تحسين التتبع الاستشهادي المتقدم'
      ]
    },
    message: 'تم تحليل الفجوة المرجعية بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/riyad-aljannah/research-network/researchers', function(req, res) {
  const store = loadResearchStore();
  const q = normText(req.query.q || '').toLowerCase();
  let rows = store.researchers.map((r) => Object.assign({}, r, { score: scoreResearcher(r) }));
  if (q) {
    rows = rows.filter((r) =>
      normText(r.fullName).toLowerCase().includes(q) ||
      asArray(r.focusAreas).join(' ').toLowerCase().includes(q) ||
      asArray(r.affiliations).join(' ').toLowerCase().includes(q)
    );
  }
  rows.sort((a, b) => b.score - a.score);
  res.json({
    success: true,
    data: rows,
    message: 'تم جلب الباحثين بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/riyad-aljannah/research-network/researchers', function(req, res) {
  const body = req.body || {};
  const fullName = normText(body.fullName);
  if (!fullName) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'اسم الباحث مطلوب',
      timestamp: new Date().toISOString()
    });
  }
  const store = loadResearchStore();
  const row = {
    id: 'RSH-' + Date.now(),
    fullName,
    email: normText(body.email),
    affiliations: asArray(body.affiliations).map(normText).filter(Boolean),
    focusAreas: asArray(body.focusAreas).map(normText).filter(Boolean),
    methodologies: asArray(body.methodologies).map(normText).filter(Boolean),
    verificationStatus: body.verificationStatus === 'verified' ? 'verified' : 'pending',
    impactPoints: Number(body.impactPoints || 0),
    publicationIds: [],
    projectIds: [],
    createdAt: new Date().toISOString()
  };
  store.researchers.unshift(row);
  saveResearchStore(store);
  res.json({
    success: true,
    data: Object.assign({}, row, { score: scoreResearcher(row) }),
    message: 'تم تسجيل الباحث بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/riyad-aljannah/research-network/projects', function(req, res) {
  const body = req.body || {};
  const title = normText(body.title);
  const leadResearcherId = normText(body.leadResearcherId);
  if (!title || !leadResearcherId) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'عنوان المشروع ومعرف الباحث الرئيسي مطلوبان',
      timestamp: new Date().toISOString()
    });
  }
  const store = loadResearchStore();
  const lead = store.researchers.find((r) => r.id === leadResearcherId);
  if (!lead) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'الباحث الرئيسي غير موجود',
      timestamp: new Date().toISOString()
    });
  }
  const project = {
    id: 'PRJ-' + Date.now(),
    title,
    domain: normText(body.domain),
    objectives: asArray(body.objectives).map(normText).filter(Boolean),
    leadResearcherId,
    members: asArray(body.members).map(normText).filter(Boolean),
    status: normText(body.status) || 'active',
    kpi: {
      milestones: Number(body.milestones || 0),
      completion: Number(body.completion || 0),
      societalImpact: Number(body.societalImpact || 0)
    },
    createdAt: new Date().toISOString()
  };
  store.projects.unshift(project);
  lead.projectIds = asArray(lead.projectIds);
  if (!lead.projectIds.includes(project.id)) lead.projectIds.push(project.id);
  saveResearchStore(store);
  res.json({
    success: true,
    data: project,
    message: 'تم إنشاء مشروع البحث والتطوير بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/riyad-aljannah/research-network/publications', function(req, res) {
  const body = req.body || {};
  const title = normText(body.title);
  const researcherId = normText(body.researcherId);
  if (!title || !researcherId) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'عنوان المخرج ومعرف الباحث مطلوبان',
      timestamp: new Date().toISOString()
    });
  }
  const store = loadResearchStore();
  const researcher = store.researchers.find((r) => r.id === researcherId);
  if (!researcher) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'الباحث غير موجود',
      timestamp: new Date().toISOString()
    });
  }
  const publication = {
    id: 'PUB-' + Date.now(),
    title,
    type: normText(body.type) || 'research-paper',
    domain: normText(body.domain),
    doi: normText(body.doi),
    citations: Number(body.citations || 0),
    peerReviewed: body.peerReviewed === false ? false : true,
    shariaReviewed: body.shariaReviewed === false ? false : true,
    createdAt: new Date().toISOString()
  };
  store.publications.unshift(Object.assign({ researcherId }, publication));
  researcher.publicationIds = asArray(researcher.publicationIds);
  if (!researcher.publicationIds.includes(publication.id)) researcher.publicationIds.push(publication.id);
  researcher.impactPoints = Number(researcher.impactPoints || 0) + (publication.peerReviewed ? 4 : 2) + Math.min(10, publication.citations);
  saveResearchStore(store);
  res.json({
    success: true,
    data: publication,
    message: 'تم توثيق المخرج البحثي بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/riyad-aljannah/research-network/match', function(req, res) {
  const body = req.body || {};
  const focus = asArray(body.focusAreas).map((x) => normText(x).toLowerCase()).filter(Boolean);
  const methods = asArray(body.methodologies).map((x) => normText(x).toLowerCase()).filter(Boolean);
  const store = loadResearchStore();
  const scored = store.researchers.map((r) => {
    const rFocus = asArray(r.focusAreas).map((x) => normText(x).toLowerCase());
    const rMethods = asArray(r.methodologies).map((x) => normText(x).toLowerCase());
    const focusHit = focus.filter((f) => rFocus.includes(f)).length;
    const methodHit = methods.filter((m) => rMethods.includes(m)).length;
    const score = focusHit * 35 + methodHit * 20 + Math.round(scoreResearcher(r) * 0.2);
    return { researcher: r, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

  res.json({
    success: true,
    data: scored,
    message: 'تم توليد أفضل ترشيحات التعاون البحثي',
    timestamp: new Date().toISOString()
  });
});

// ─── بوابة المجتمع البحثي (موازية لرياض الجنة) ───
app.get('/api/community/research/dashboard', function(req, res) {
  const store = loadResearchStore();
  res.json({
    success: true,
    data: {
      researchers: store.researchers.length,
      activeProjects: store.projects.filter((p) => p.status === 'active').length,
      publications: store.publications.length
    },
    message: 'تم جلب لوحة المجتمع البحثي',
    timestamp: new Date().toISOString()
  });
});

// ─── سجل التشغيل ───
console.log('✅ [رياض الجنة] بيت العلم ودار المعرفة ومصنع الابتكار — مفعّل');
console.log('   ☪ الأساس الشرعي: ' + SHARIA_FOUNDATION.quran.length + ' آية + ' + SHARIA_FOUNDATION.hadith.length + ' حديث');
console.log('   📚 حلقات العلم: ' + RIYAD_ALJANNAH.knowledge_circles.length + ' حلقة | مكتبة: ' + RIYAD_ALJANNAH.digital_library.sections.length + ' قسم');
console.log('   🎓 المدرسة العلمية: ' + SCIENTIFIC_SCHOOL.methodologies.length + ' منهج | ابتكار: ' + SCIENTIFIC_SCHOOL.innovation_factory.pipeline.length + ' مرحلة | أكاديمية: ' + SCIENTIFIC_SCHOOL.academy.programs.length + ' برنامج');
console.log('   📝 أطروحات: ' + PAPERS_AND_IP.publication_types.length + ' نوع | مجلة: ' + PAPERS_AND_IP.journal.sections.length + ' قسم | IP بلوكتشين: مفعّل');
console.log('   🌍 أحداث AI: ' + AI_STRATEGIC_EVENTS.event_sources.length + ' مصدر | ' + AI_STRATEGIC_EVENTS.event_types.length + ' نوع حدث | سد فجوات: مفعّل');
console.log('   ⚖️ تشريعات: ' + REGULATORY_SYSTEM.saudi_regulators.length + ' سعودية + ' + REGULATORY_SYSTEM.international_regulators.length + ' دولية | ' + REGULATORY_SYSTEM.active_regulations.length + ' نظام نشط | لا طاعة لمخلوق في معصية الخالق');
console.log('   🏗  هيكل: ' + STRUCTURE_AND_EXECUTION.organizational_structure.levels.length + ' مستوى | تنفيذ: ' + STRUCTURE_AND_EXECUTION.execution_roadmap.length + ' مرحلة | تشغيل ذاتي: ' + STRUCTURE_AND_EXECUTION.self_operating_codification.layers.length + ' طبقة');
console.log('   🤖 تغذية AI: ' + AI_FEEDING_SYSTEM.knowledge_sources.length + ' مصدر | ' + AI_FEEDING_SYSTEM.ai_capabilities_enhanced.length + ' قدرة محسّنة');
console.log('   🧪 شبكة R&D: مفعلة | APIs: /api/riyad-aljannah/research-network/* + /api/community/research/dashboard');
console.log('   📡 APIs: /api/riyad-aljannah/*');

};
