/**
 * بسم الله الرحمن الرحيم
 * منظومة شيخة للتحسين والتدريب والتعلم والمعرفة والتطوير الرقمي المستمر الآلي
 * «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي
 * ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق: ١
 * الملكية الفكرية: سلمان أحمد بن سلمان الراجح — © 2026
 */
'use strict';
module.exports = function(app, ctx) {

// ═══ الأساس الشرعي للعلم والتعلم ═══
const SHARIA_LEARNING = {
  quran: [
    {ayah:'﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾',surah:'العلق: ١',principle:'أساس العلم والقراءة'},
    {ayah:'﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',surah:'طه: ١١٤',principle:'طلب الزيادة في العلم'},
    {ayah:'﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾',surah:'المجادلة: ١١',principle:'مكانة أهل العلم'},
    {ayah:'﴿ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ﴾',surah:'الزمر: ٩',principle:'تفاضل العلم'},
    {ayah:'﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾',surah:'البقرة: ٣١',principle:'أصل تعليم المعرفة'},
    {ayah:'﴿ وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ ﴾',surah:'البقرة: ٢٨٢',principle:'التقوى طريق العلم'},
  ],
  hadith: [
    {text:'«من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة»',source:'مسلم',principle:'فضل طلب العلم'},
    {text:'«طلب العلم فريضة على كل مسلم»',source:'ابن ماجه',principle:'وجوب التعلم'},
    {text:'«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',source:'البيهقي',principle:'الإتقان'},
    {text:'«بلّغوا عني ولو آية»',source:'البخاري',principle:'نشر العلم'},
    {text:'«خيركم من تعلّم القرآن وعلّمه»',source:'البخاري',principle:'التعليم'},
    {text:'«الحكمة ضالة المؤمن أنّى وجدها فهو أحق بها»',source:'الترمذي',principle:'الحكمة من أي مصدر'},
  ]
};

// ═══ ١. منظومة التحسين المستمر الرقمي — Kaizen الإسلامي ═══
const CONTINUOUS_IMPROVEMENT = {
  id: 'kaizen_islami',
  ar: 'التحسين المستمر — كايزن الإسلامي',
  philosophy: '«خير الأعمال أدومها وإن قل» — متفق عليه',
  cycles: [
    {id:'pdca', ar:'دورة التحسين PDCA', steps:[
      {s:'Plan — خطط',  ar:'حدد المشكلة وخطط الحل', tools:['تحليل السبب الجذري','مخطط إيشيكاوا','5 لماذا']},
      {s:'Do — نفّذ',    ar:'طبّق الحل على نطاق صغير', tools:['تجربة محدودة','A/B Testing','MVP']},
      {s:'Check — تحقق', ar:'قِس النتائج وقارن بالمتوقع', tools:['KPIs','لوحة مؤشرات','تحليل إحصائي']},
      {s:'Act — اعتمد',  ar:'اعتمد التحسين أو أعد الدورة', tools:['توثيق','تعميم','تدريب']},
    ]},
    {id:'six_sigma', ar:'ستة سيجما — DMAIC', steps:[
      {s:'Define',  ar:'حدد المشكلة والهدف'},
      {s:'Measure', ar:'قِس الوضع الحالي'},
      {s:'Analyze', ar:'حلل الأسباب الجذرية'},
      {s:'Improve', ar:'حسّن العملية'},
      {s:'Control', ar:'راقب واستدم التحسين'},
    ]},
  ],
  auto_improvement: {
    ar: 'التحسين الآلي المستمر',
    triggers: [
      {trigger:'أداء API أبطأ من 500ms', action:'تحسين الاستعلام تلقائياً', frequency:'لحظي'},
      {trigger:'نسبة خطأ > 1%', action:'تفعيل نظام الإصلاح الذاتي', frequency:'لحظي'},
      {trigger:'انخفاض تقييم التجار', action:'تحليل الأسباب + تنبيه', frequency:'يومي'},
      {trigger:'تغيّر أسعار السوق > 5%', action:'تحديث التنبؤات + إشعارات', frequency:'لحظي'},
      {trigger:'محرك جديد متاح', action:'اختبار + دمج تلقائي', frequency:'أسبوعي'},
      {trigger:'ثغرة أمنية مكتشفة', action:'ترقيع فوري + تقرير', frequency:'لحظي'},
    ],
    metrics: ['وقت الاستجابة','نسبة التشغيل','رضا المستخدم','دقة التنبؤ','أمن المنظومة','كفاءة المحركات'],
  }
};

// ═══ ٢. منظومة التدريب الرقمي ═══
const DIGITAL_TRAINING = {
  programs: [
    {id:'onboarding', ar:'برنامج التأهيل', target:'موظفين جدد', duration:'2 أسبوع', modules:[
      'مقدمة عن شيخة والرؤية','الأساس الشرعي للمنظومة','هيكل المنظومة التقني','أدوات العمل اليومية','أمن المعلومات','خدمة العملاء'
    ]},
    {id:'merchant', ar:'تدريب التجار', target:'تجار مسجلون', duration:'3 أيام', modules:[
      'كيف تضيف منتجك','تسعير المنتجات','التقييم والسمعة','أدوات التسويق','إدارة الطلبات','اللوجستيات والشحن'
    ]},
    {id:'technical', ar:'تدريب تقني', target:'فريق التقنية', duration:'مستمر', modules:[
      'بنية المنظومة — 128 محرك','Node.js/Express المتقدم','أمن التطبيقات','الذكاء الاصطناعي','DevOps وCI/CD','اختبار الجودة'
    ]},
    {id:'leadership', ar:'تطوير القيادة', target:'الإدارة', duration:'6 أشهر', modules:[
      'القيادة في الإسلام','التفكير الاستراتيجي','إدارة الفريق','صنع القرار','إدارة الأزمات','الابتكار'
    ]},
    {id:'sharia', ar:'التأهيل الشرعي', target:'الجميع', duration:'مستمر', modules:[
      'أحكام البيوع','الربا والغرر','عقود التجارة الإسلامية','الزكاة التجارية','آداب التاجر المسلم','الحلال والحرام في التجارة الرقمية'
    ]},
    {id:'market', ar:'تدريب السوق', target:'فريق المبيعات', duration:'1 شهر', modules:[
      'سوق المعادن السعودي','أسعار LME','أنواع السكراب وتصنيفاتها','HS Codes','سلسلة الإمداد','المنافسون'
    ]},
  ],
  delivery_methods: ['تعلم ذاتي رقمي','ورش عمل افتراضية','فيديوهات تعليمية','محاكاة تفاعلية','اختبارات إلكترونية','مشاريع تطبيقية','إرشاد فردي'],
  certification: {
    levels: ['مبتدئ','متوسط','متقدم','خبير','معتمد من شيخة'],
    badges: ['تاجر معتمد','خبير معادن','محلل سوق','مدير لوجستيات','مستشار شرعي'],
  },
};

// ═══ ٣. منظومة التعلم الرقمي — Knowledge Management ═══
const DIGITAL_KNOWLEDGE = {
  domains: [
    {id:'metals', ar:'علم المعادن', topics:['خصائص المعادن','السبائك','المعالجة الحرارية','الاختبارات','التآكل','المعادن النادرة']},
    {id:'market', ar:'أسواق المعادن', topics:['LME','COMEX','أسعار السكراب','العرض والطلب','التحليل الفني','التحليل الأساسي']},
    {id:'logistics', ar:'اللوجستيات', topics:['الشحن البحري','الشحن البري','التخليص الجمركي','Incoterms','التأمين','التتبع']},
    {id:'sharia', ar:'الفقه التجاري', topics:['البيوع','العقود','الزكاة','الصرف','المرابحة','الاستصناع','السلم']},
    {id:'technology', ar:'التقنية', topics:['تطوير الويب','الذكاء الاصطناعي','البلوكتشين','IoT','الأمن السيبراني','الحوسبة السحابية']},
    {id:'business', ar:'إدارة الأعمال', topics:['التخطيط الاستراتيجي','التسويق','المحاسبة','إدارة المشاريع','ريادة الأعمال','التمويل']},
    {id:'quality', ar:'الجودة', topics:['ISO 9001','Six Sigma','Lean','TQM','معايير المعادن','فحص واختبار']},
    {id:'environment', ar:'البيئة', topics:['الاقتصاد الدائري','إعادة التدوير','البصمة الكربونية','ISO 14001','الاستدامة']},
  ],
  knowledge_base: {
    types: ['مقالات','أدلة إرشادية','فيديوهات','حالات دراسية','أسئلة شائعة','مسارد مصطلحات','قوالب جاهزة','تقارير سوقية'],
    auto_generation: {
      ar: 'توليد محتوى تعليمي آلي بالذكاء الاصطناعي',
      capabilities: ['تحويل بيانات السوق لمقالات','إنشاء أدلة من الأسئلة المتكررة','توليد تقارير تعليمية','ترجمة المحتوى لـ15 لغة','تلخيص التقارير الطويلة'],
    },
  },
  ai_tutor: {
    ar: 'المعلم الذكي',
    features: ['إجابة أسئلة فورية','شرح مفاهيم معقدة','اقتراح مسارات تعلم','تقييم المستوى','تدريب تفاعلي','اختبارات ذكية'],
    languages: ['ar','en','fr','es','de','tr','ur','zh','ja','ko','id','ms','pt','ru','hi'],
  },
};

// ═══ ٤. التطوير الآلي المستمر — DevOps + CI/CD ═══
const AUTO_DEVELOPMENT = {
  pipeline: [
    {stage:'كود', tools:['Git','GitHub','VS Code','Cursor AI'], auto:'إكمال ذكي + مراجعة آلية'},
    {stage:'بناء', tools:['Node.js','Webpack','npm'], auto:'بناء تلقائي عند كل commit'},
    {stage:'اختبار', tools:['Jest','Supertest','Playwright'], auto:'اختبار تلقائي — وحدة + تكامل + E2E'},
    {stage:'أمن', tools:['SAST','DAST','SCA','Secrets scan'], auto:'فحص أمني تلقائي'},
    {stage:'نشر', tools:['Docker','PM2','Nginx'], auto:'نشر تلقائي بدون توقف'},
    {stage:'مراقبة', tools:['Prometheus','Grafana','Sentry'], auto:'مراقبة لحظية + تنبيهات'},
    {stage:'تحسين', tools:['A/B Testing','Feature Flags','Analytics'], auto:'تحسين مستمر بالبيانات'},
  ],
  self_healing: {
    ar: 'الإصلاح الذاتي',
    capabilities: [
      'كشف الأخطاء تلقائياً وإصلاحها',
      'إعادة تشغيل الخدمات المتوقفة',
      'تحويل الحمل عند الضغط العالي',
      'تحديث الاعتماديات الأمنية تلقائياً',
      'تنظيف الذاكرة والملفات المؤقتة',
      'نسخ احتياطي تلقائي يومي',
    ],
  },
  evolution: {
    ar: 'التطور الذاتي',
    levels: [
      {level:1, ar:'يدوي', desc:'تطوير بإشراف بشري كامل'},
      {level:2, ar:'شبه آلي', desc:'أدوات مساعدة + مراجعة بشرية'},
      {level:3, ar:'آلي مُراقب', desc:'AI يقترح + بشري يوافق'},
      {level:4, ar:'آلي مستقل', desc:'AI ينفذ + بشري يراجع دورياً'},
      {level:5, ar:'متطور ذاتياً', desc:'AI يحسّن نفسه + حوكمة شرعية'},
    ],
    current_level: 3,
    hadith: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
  }
};

// ═══ ٥. مقاييس الأداء والنضج الرقمي ═══
const MATURITY_MODEL = {
  dimensions: [
    {id:'strategy', ar:'الاستراتيجية الرقمية', levels:['غير موجودة','أولية','محددة','متقدمة','رائدة'], current:4},
    {id:'technology', ar:'البنية التقنية', levels:['أساسية','متكاملة','ذكية','متطورة','متقدمة ذاتياً'], current:4},
    {id:'data', ar:'البيانات والتحليلات', levels:['يدوية','مهيكلة','تحليلية','تنبؤية','توليدية'], current:3},
    {id:'process', ar:'العمليات', levels:['يدوية','رقمية جزئياً','مؤتمتة','ذكية','ذاتية التحسين'], current:3},
    {id:'people', ar:'الكوادر البشرية', levels:['تقليدية','واعية رقمياً','ماهرة','خبيرة','رائدة'], current:3},
    {id:'customer', ar:'تجربة العميل', levels:['أساسية','رقمية','شخصية','تنبؤية','استباقية'], current:3},
    {id:'innovation', ar:'الابتكار', levels:['تفاعلي','تكيفي','استباقي','توليدي','تحولي'], current:4},
    {id:'sharia', ar:'الامتثال الشرعي', levels:['أساسي','مراجع','متكامل','آلي','مرجعي'], current:4},
  ],
  overall_score: function() {
    return Math.round(this.dimensions.reduce((s,d) => s + d.current, 0) / this.dimensions.length * 20);
  }
};

// ═══ APIs ═══
app.get('/api/learning/dashboard', (req, res) => {
  res.json({ success: true,
    overview: {
      trainingPrograms: DIGITAL_TRAINING.programs.length,
      knowledgeDomains: DIGITAL_KNOWLEDGE.domains.length,
      improvementCycles: CONTINUOUS_IMPROVEMENT.cycles.length,
      devPipelineStages: AUTO_DEVELOPMENT.pipeline.length,
      maturityScore: MATURITY_MODEL.overall_score.call(MATURITY_MODEL) + '%',
      evolutionLevel: AUTO_DEVELOPMENT.evolution.current_level + '/5',
    },
    shariaFoundation: { quranCount: SHARIA_LEARNING.quran.length, hadithCount: SHARIA_LEARNING.hadith.length },
  });
});

app.get('/api/learning/sharia', (req, res) => {
  res.json({ success: true, quran: SHARIA_LEARNING.quran, hadith: SHARIA_LEARNING.hadith });
});

app.get('/api/learning/improvement', (req, res) => {
  res.json({ success: true, kaizen: CONTINUOUS_IMPROVEMENT });
});

app.get('/api/learning/training', (req, res) => {
  res.json({ success: true, programs: DIGITAL_TRAINING.programs, methods: DIGITAL_TRAINING.delivery_methods, certification: DIGITAL_TRAINING.certification });
});

app.get('/api/learning/training/:id', (req, res) => {
  const p = DIGITAL_TRAINING.programs.find(t => t.id === req.params.id);
  if (!p) return res.status(404).json({ success: false });
  res.json({ success: true, program: p });
});

app.get('/api/learning/knowledge', (req, res) => {
  res.json({ success: true, domains: DIGITAL_KNOWLEDGE.domains, knowledgeBase: DIGITAL_KNOWLEDGE.knowledge_base, aiTutor: DIGITAL_KNOWLEDGE.ai_tutor });
});

app.get('/api/learning/knowledge/:domain', (req, res) => {
  const d = DIGITAL_KNOWLEDGE.domains.find(k => k.id === req.params.domain);
  if (!d) return res.status(404).json({ success: false });
  res.json({ success: true, domain: d });
});

app.get('/api/learning/devops', (req, res) => {
  res.json({ success: true, pipeline: AUTO_DEVELOPMENT.pipeline, selfHealing: AUTO_DEVELOPMENT.self_healing, evolution: AUTO_DEVELOPMENT.evolution });
});

app.get('/api/learning/maturity', (req, res) => {
  res.json({ success: true, dimensions: MATURITY_MODEL.dimensions, overallScore: MATURITY_MODEL.overall_score.call(MATURITY_MODEL) + '%' });
});

app.get('/api/learning/overview', (req, res) => {
  res.json({ success: true,
    training: DIGITAL_TRAINING.programs.length + ' برنامج',
    knowledge: DIGITAL_KNOWLEDGE.domains.length + ' مجال معرفي',
    improvement: CONTINUOUS_IMPROVEMENT.cycles.length + ' دورة تحسين',
    autoTriggers: CONTINUOUS_IMPROVEMENT.auto_improvement.triggers.length + ' محفز آلي',
    pipeline: AUTO_DEVELOPMENT.pipeline.length + ' مرحلة',
    selfHealing: AUTO_DEVELOPMENT.self_healing.capabilities.length + ' قدرة إصلاح ذاتي',
    evolutionLevel: AUTO_DEVELOPMENT.evolution.current_level + '/5',
    maturity: MATURITY_MODEL.overall_score.call(MATURITY_MODEL) + '%',
    quran: '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾',
    hadith: '«من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة»',
    ip: 'سلمان أحمد بن سلمان الراجح — © 2026',
  });
});

console.log('✅ [Learning] منظومة التحسين والتعلم والتطوير الرقمي المستمر — مفعّلة');
console.log('   📚 تدريب: ' + DIGITAL_TRAINING.programs.length + ' برنامج | معرفة: ' + DIGITAL_KNOWLEDGE.domains.length + ' مجال');
console.log('   🔄 تحسين: ' + CONTINUOUS_IMPROVEMENT.auto_improvement.triggers.length + ' محفز آلي | تطوير: مستوى ' + AUTO_DEVELOPMENT.evolution.current_level + '/5');
console.log('   📊 نضج رقمي: ' + MATURITY_MODEL.overall_score.call(MATURITY_MODEL) + '% | شرعي: ' + SHARIA_LEARNING.quran.length + ' آية + ' + SHARIA_LEARNING.hadith.length + ' حديث');
console.log('   📡 APIs: /api/learning/*');
};
