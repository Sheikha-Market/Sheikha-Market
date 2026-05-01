/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA ARABIC GRAMMAR RULES — منظومة قواعد اللغة العربية الرقمية     ║
 * ║  القواعد العربية = أساسيات البرمجة — رقمنة كاملة بالكتاب والسنة        ║
 * ║  الزمن + العوامل + الإعراب + النحو + الصرف + البلاغة + الشبكة العصبية ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
 * ﴿إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ﴾ — يوسف: ٢
 * «أعربوا الكلام تعرفوا معانيه» — حديث شريف
 *
 * @module sheikha-arabic-grammar-rules
 * @version 1.0.0
 * @schema sheikha/v2
 */
'use strict';

const EventEmitter = require('events');

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const SCHEMA    = 'sheikha/v2';

// ═══════════════════════════════════════════════════════════════════════════
// § 1 — الزمن الكامل: ماضٍ / حاضر / مستقبل
// ═══════════════════════════════════════════════════════════════════════════

const ZAMAN = Object.freeze({

  nameAr: 'منظومة الزمن في اللغة العربية',
  quranRef: '﴿وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ إِلَّا الَّذِينَ آمَنُوا﴾ — العصر: ١-٣',
  hadithRef: '«اغتنم خمسًا قبل خمس: شبابك قبل هرمك...» — الحاكم',

  MADI: {
    nameAr: 'الزمن الماضي',   nameEn: 'Past Tense',
    def_lughawi:  'ما مضى وانقضى وانتهى',
    def_istilahi: 'الفعل الدال على حدث وقع وانتهى قبل زمن التكلم',
    sign:   'فتح آخره أو سكونه عند اتصاله بضمائر الرفع المتحركة',
    example: 'كَتَبَ / كَتَبَتْ / كَتَبُوا',
    quranEx: { text: 'خَلَقَ اللَّهُ السَّمَاوَاتِ وَالْأَرْضَ', ref: 'إبراهيم:١٩', note: 'خلق — فعل ماضٍ دال على حدث مكتمل' },
    programming: {
      equivalent: 'Completed Function / Resolved Promise / PAST_STATE',
      timeStamp:  'createdAt / completedAt / timestamp_past',
      examples:   ['const result = await fetch(url)  // ماضٍ — اكتملت العملية', 'const data = JSON.parse(raw)  // ماضٍ — انتهى التحليل', 'console.log("done")  // ماضٍ — تم التنفيذ'],
      async_equiv: 'Promise.resolve() | await | .then() result',
    },
    subtypes: [
      { nameAr: 'ماضٍ بسيط',      sign: 'كَتَبَ',       note: 'حدث واحد اكتمل' },
      { nameAr: 'ماضٍ مستمر',      sign: 'كَانَ يَكْتُبُ', note: 'استمرارية في الماضي — كان + مضارع' },
      { nameAr: 'ماضٍ تام',        sign: 'كَانَ قَدْ كَتَبَ', note: 'اكتمل قبل حدث ماضٍ آخر' },
      { nameAr: 'ماضٍ شرطي',       sign: 'لَوْ كَتَبَ',  note: 'ماضٍ افتراضي — لو' },
    ],
    programming_rules: [
      'الفعل الماضي = دالة اكتمل تنفيذها (return value موجود)',
      'كان يكتب = async function كانت تُنفَّذ ثم توقفت',
      'لو كتب = counterfactual — افتراض لم يقع (لا يُنفَّذ حالياً)',
      'قد كتب = completed flag = true → Promise resolved',
    ],
  },

  HADIR: {
    nameAr: 'الزمن الحاضر (المضارع)',  nameEn: 'Present Tense',
    def_lughawi:  'ما هو قائم الآن في لحظة الكلام',
    def_istilahi: 'الفعل المضارع الدال على حدث يقع حال التكلم أو يستمر',
    sign:   'يبدأ بأحد حروف المضارعة: أ ن ي ت (أَنَيتُ)',
    example: 'يَكْتُبُ / تَكْتُبُ / أَكْتُبُ / نَكْتُبُ',
    quranEx: { text: 'يُدَبِّرُ الْأَمْرَ مِنَ السَّمَاءِ إِلَى الْأَرْضِ', ref: 'السجدة:٥', note: 'يُدبِّر — مضارع دال على الاستمرار الإلهي' },
    programming: {
      equivalent: 'Running Function / Observable / Stream / CURRENT_STATE',
      timeStamp:  'updatedAt / currentTime / now()',
      examples:   ['while(true) { process() }  // مضارع مستمر', 'setInterval(fn, 1000)  // يكرر الآن', 'observable.subscribe()  // يُراقب الآن', 'generator.next()  // ينتج الآن'],
      async_equiv: 'Observable | Stream | async generator | EventEmitter',
    },
    subtypes: [
      { nameAr: 'مضارع مرفوع',  sign: 'يَكْتُبُ',       note: 'حال أو استقبال — حالة التشغيل الطبيعية', programming: 'RUNNING | ACTIVE' },
      { nameAr: 'مضارع منصوب',  sign: 'لَن يَكْتُبَ',    note: 'مستقبل منفي بلن — Promise.reject()', programming: 'FUTURE_NEGATED' },
      { nameAr: 'مضارع مجزوم',  sign: 'لَمْ يَكْتُبْ',   note: 'نفي في الماضي — await but not resolved', programming: 'PAST_NEGATED | NOT_EXECUTED' },
    ],
    programming_rules: [
      'الفعل المضارع = دالة تُنفَّذ الآن (async running)',
      'المضارع المستمر = Observable / Stream',
      'المضارع المجزوم بلم = فعل لم ينفَّذ في الماضي — !executed',
      'المضارع المنصوب بلن = Promise لن يُحل في المستقبل',
    ],
  },

  MUSTAQBAL: {
    nameAr: 'الزمن المستقبل',  nameEn: 'Future Tense',
    def_lughawi:  'ما سيقع بعد لحظة الكلام',
    def_istilahi: 'الفعل المضارع مع سين أو سوف — للتخصيص بالمستقبل',
    signs:   ['سين التسويف: سَيَكْتُبُ (قريب)', 'سوف: سَوْفَ يَكْتُبُ (بعيد)', 'أن المصدرية: أن يَكْتُبَ (مطلق)'],
    example: 'سَيَكْتُبُ / سَوْفَ يَكْتُبُ',
    quranEx: { text: 'سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا', ref: 'الطلاق:٧', note: 'سيجعل — وعد إلهي مستقبلي حتمي' },
    programming: {
      equivalent: 'Promise / Scheduled Task / Future / PENDING_STATE',
      timeStamp:  'scheduledAt / expiresAt / deadline',
      examples:   ['const p = new Promise(resolve => ...)  // سيكتمل', 'setTimeout(fn, delay)  // سَيُنفَّذ', 'cron.schedule("0 9 * * *", fn)  // سوف يُنفَّذ كل يوم'],
      async_equiv: 'Promise (pending) | setTimeout | cron | Future<T>',
    },
    subtypes: [
      { nameAr: 'مستقبل قريب',   sign: 'سَيَكْتُبُ',      note: 'سين — قريب وحتمي',     programming: 'setTimeout(fn, short)' },
      { nameAr: 'مستقبل بعيد',   sign: 'سَوْفَ يَكْتُبُ', note: 'سوف — بعيد أو مؤكد',   programming: 'cron.schedule() | longTimeout' },
      { nameAr: 'مستقبل شرطي',   sign: 'إِن يَكْتُبْ',    note: 'مشروط بحدوث شرط',      programming: 'Promise.then(cond => ...)' },
      { nameAr: 'مستقبل منفي',   sign: 'لَن يَكْتُبَ',    note: 'مستقبل محال — نفي قاطع', programming: 'Promise.reject() | throw Error' },
    ],
    programming_rules: [
      'السين = setTimeout قصير / انتظار قريب',
      'سوف = cron جدولة مؤكدة بعيدة',
      'لن = Promise.reject مضمون — لا يكتمل أبداً',
      'إن يكتب = Promise.then(condition) — مشروط',
    ],
  },

  MAPPING_TABLE: [
    { arabic: 'فَعَلَ  (ماضٍ بسيط)',       programming: 'const x = fn()',           timeAPI: 'createdAt'  },
    { arabic: 'كَانَ يَفْعَلُ (ماضٍ مستمر)', programming: 'was running... stopped',  timeAPI: 'updatedAt'  },
    { arabic: 'يَفْعَلُ (مضارع حاضر)',      programming: 'fn() — running now',       timeAPI: 'now()'      },
    { arabic: 'يَفْعَلُ (مضارع مستمر)',     programming: 'observable.subscribe()',   timeAPI: 'stream'     },
    { arabic: 'سَيَفْعَلُ (مستقبل قريب)',  programming: 'setTimeout(fn, 100)',      timeAPI: 'scheduledAt'},
    { arabic: 'سَوْفَ يَفْعَلُ (مستقبل بعيد)', programming: 'cron.schedule()',      timeAPI: 'deadline'   },
    { arabic: 'لَمْ يَفْعَلْ (نفي ماضٍ)',  programming: '!executed — skipped',      timeAPI: 'null'       },
    { arabic: 'لَنْ يَفْعَلَ (نفي مستقبل)', programming: 'Promise.reject()',       timeAPI: 'never'      },
    { arabic: 'اِفْعَلْ  (أمر)',           programming: 'await fn() — command',     timeAPI: 'immediate'  },
    { arabic: 'لَا تَفْعَلْ (نهي)',        programming: 'throw Error | guard clause', timeAPI: 'blocked'  },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// § 2 — العوامل والمعمولات (I'rab Governance)
// ═══════════════════════════════════════════════════════════════════════════

const AWAMIL = Object.freeze({

  nameAr: 'العوامل والمعمولات — كيف تؤثر الكلمة فيما قبلها وبعدها',
  def:    'العامل: كل لفظ أو معنى يُحدث في الكلمة التالية أو السابقة أثراً إعرابياً',
  quranRef: '﴿وَمَا يَنطِقُ عَنِ الْهَوَىٰ إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ﴾ — النجم: ٣-٤',
  hadithRef: '«كل عمل بنية» — عوامل الأفعال تحكم معمولاتها',
  programming: 'OPERATOR PRECEDENCE + SCOPE CHAIN + TYPE COERCION',

  RAFI_AWAMIL: {
    nameAr: 'عوامل الرفع — ما يرفع ما بعده',
    desc:   'هذه العوامل تُحدث الضمة (أو ما ينوب عنها) في معمولها',
    programming: 'Declaration / Subject Position / return type',
    awamil: [
      {
        id:    'ibtida',
        nameAr: 'الابتداء',
        def:   'كون الاسم في أول الجملة — يرفع المبتدأ',
        example: 'العِلْمُ نُورٌ',
        note:  'العلم: مرفوع بالابتداء (ضمة ظاهرة)',
        effect: 'يرفع الاسم الذي يبدأ به الكلام',
        programming: 'const / let / var declaration — اسم الجانب الأيسر من التعيين',
        quranEx: { text: 'اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا', ref: 'البقرة:٢٥٧', note: 'لفظ الجلالة: مرفوع بالابتداء' },
      },
      {
        id:    'fail_position',
        nameAr: 'الفعلية — رافع الفاعل',
        def:   'الفعل يرفع فاعله',
        example: 'كَتَبَ الطالِبُ',
        note:  'الطالب: فاعل مرفوع بضمة ظاهرة',
        effect: 'يرفع الاسم الذي قام بالفعل',
        programming: 'Function caller / this context / invoking agent',
        quranEx: { text: 'وَقَالَ رَبُّكَ', ref: 'الإسراء:٢٣', note: 'رَبُّكَ: فاعل مرفوع' },
      },
      {
        id:    'kana_ism',
        nameAr: 'كان وأخواتها — ترفع اسمها',
        def:   'أفعال ناسخة ترفع المبتدأ على أنه اسمها',
        sisters: ['كان', 'أصبح', 'أمسى', 'أضحى', 'ظل', 'بات', 'صار', 'ليس', 'مازال'],
        example: 'كَانَ العِلْمُ نُوراً',
        note:  'العلم: اسم كان مرفوع. نوراً: خبر كان منصوب',
        effect: 'ترفع الاسم وتنصب الخبر',
        programming: 'TYPE_CAST(subject, new_type) — subject stays nominal, predicate changes',
        quranEx: { text: 'وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا', ref: 'النساء:١٧', note: 'الله: اسم كان مرفوع. عليماً: خبر منصوب' },
      },
      {
        id:    'inna_khabar',
        nameAr: 'إن وأخواتها — ترفع الخبر',
        def:   'حروف ناسخة تنصب الاسم وترفع الخبر',
        sisters: ['إن', 'أن', 'كأن', 'لكن', 'ليت', 'لعل'],
        example: 'إِنَّ العِلْمَ نُورٌ',
        note:  'العلم: اسم إن منصوب. نور: خبر إن مرفوع',
        effect: 'تنصب الاسم وترفع الخبر (عكس كان)',
        programming: 'ASSERTION(subject_as_object, predicate_as_subject)',
        quranEx: { text: 'إِنَّ اللَّهَ بِكُلِّ شَيْءٍ عَلِيمٌ', ref: 'البقرة:٢٨٢', note: 'الله: اسم إن منصوب. عليم: خبر مرفوع' },
      },
    ],
  },

  NASIB_AWAMIL: {
    nameAr: 'عوامل النصب — ما ينصب ما بعده أو قبله',
    desc:   'هذه العوامل تُحدث الفتحة (أو ما ينوب عنها) في معمولها',
    programming: 'Parameter / Argument / Object position',
    awamil: [
      {
        id:    'fiil_mafuul',
        nameAr: 'الفعل المتعدي — ينصب مفعوله',
        def:   'الفعل المتعدي ينصب مفعوله به مباشرة',
        example: 'قَرَأَ الطالِبُ الكِتابَ',
        note:  'الكتاب: مفعول به منصوب بفتحة ظاهرة',
        effect: 'ينصب الاسم الواقع عليه الفعل',
        programming: 'function(param) — param is in object position = منصوب',
        quranEx: { text: 'اقْرَأْ بِاسْمِ رَبِّكَ', ref: 'العلق:١', note: 'الضمير المقدر مفعول به' },
      },
      {
        id:    'inna_ism',
        nameAr: 'إن وأخواتها — تنصب اسمها',
        example: 'إِنَّ مُحَمَّداً رَسُولُ اللَّهِ',
        note:  'محمداً: اسم إن منصوب بفتحة ظاهرة',
        effect: 'تنصب الاسم الذي يليها مباشرة',
        programming: 'assert(subject) — subject passed as argument',
        quranEx: { text: 'إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ', ref: 'البقرة:١٧٣', note: 'لفظ الجلالة: اسم إن منصوب' },
      },
      {
        id:    'kana_khabar',
        nameAr: 'كان وأخواتها — تنصب خبرها',
        example: 'كَانَ مُحَمَّدٌ صَادِقاً',
        note:  'صادقاً: خبر كان منصوب',
        effect: 'تنصب الخبر (الجزء الثاني)',
        programming: 'cast.target — target type becomes parameter',
      },
      {
        id:    'nawasib_mudhari',
        nameAr: 'نواصب المضارع (أن/لن/كي/إذن)',
        def:   'حروف تنصب الفعل المضارع',
        chars:  ['أن', 'لن', 'كي', 'إذن', 'لام التعليل', 'لام الجحود', 'حتى'],
        example: 'يريدُ أَن يَكْتُبَ',
        note:  'يكتب: فعل مضارع منصوب بأن بفتحة',
        effect: 'تنصب الفعل المضارع الذي يليها',
        programming: 'Promise.then(fn) — fn is a callback (passed as argument)',
        quranEx: { text: 'وَمَا كَانَ اللَّهُ لِيُعَذِّبَهُمْ', ref: 'الأنفال:٣٣', note: 'يُعذِّب: منصوب بلام الجحود' },
      },
    ],
  },

  JARR_AWAMIL: {
    nameAr: 'عوامل الجر — ما يجر ما بعده',
    desc:   'هذه العوامل تُحدث الكسرة (أو ما ينوب عنها) في معمولها',
    programming: 'Property access / Scope / Namespace / Path',
    awamil: [
      {
        id:    'huruf_jarr',
        nameAr: 'حروف الجر',
        chars:  { 'مِن': 'ابتداء الغاية', 'إِلَى': 'انتهاء الغاية', 'عَن': 'المجاوزة', 'عَلَى': 'الاستعلاء', 'فِي': 'الظرفية', 'بِ': 'الإلصاق', 'لِ': 'الاستحقاق والملك', 'كَ': 'التشبيه', 'وَ': 'القسم', 'تَ': 'القسم' },
        example: 'ذَهَبْتُ إِلَى المَدْرَسَةِ',
        note:  'المدرسة: اسم مجرور بإلى بكسرة ظاهرة',
        effect: 'يجر الاسم الذي يليه مباشرة',
        programming: 'object.property | path/to/file | namespace::member',
        quranEx: { text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', ref: 'الفاتحة:١', note: 'اسم: مجرور بالباء. الله: مجرور بالإضافة' },
      },
      {
        id:    'idafa',
        nameAr: 'الإضافة',
        def:   'إضافة اسم إلى آخر — المضاف إليه مجرور دائماً',
        example: 'كِتَابُ الطَّالِبِ',
        note:  'الطالب: مضاف إليه مجرور بكسرة ظاهرة',
        effect: 'يجر الاسم الثاني في تركيب الإضافة',
        programming: 'object.property | Class.method | module.export',
        quranEx: { text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', ref: 'الفاتحة:٢', note: 'العالمين: مضاف إليه مجرور' },
      },
    ],
  },

  JAZIM_AWAMIL: {
    nameAr: 'عوامل الجزم — ما يجزم الأفعال',
    desc:   'هذه العوامل تُحدث السكون (أو ما ينوب عنه) في الفعل المضارع',
    programming: 'Negation / Conditional / Block / Guard',
    awamil: [
      {
        id:    'lam_jazim',
        nameAr: 'لم — تجزم فعلاً',
        def:   'حرف نفي وجزم وقلب — ينقل المضارع للماضي',
        example: 'لَمْ يَكْتُبْ',
        note:  'يكتب: فعل مضارع مجزوم بلم بسكون ظاهر',
        effect: 'تجزم الفعل المضارع وتقلبه للماضي',
        programming: '!executed — was not run',
        quranEx: { text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', ref: 'الإخلاص:٣', note: 'يلد/يولد: مجزومان بلم' },
      },
      {
        id:    'lamma_jazim',
        nameAr: 'لمّا — تجزم فعلاً (نفي حتى الآن)',
        example: 'لَمَّا يَكْتُبْ بَعدُ',
        note:  'يكتب: فعل مضارع مجزوم بلمّا',
        effect: 'تجزم وتفيد نفياً مستمراً حتى الآن',
        programming: 'not yet completed — pending still',
        quranEx: { text: 'قَالَتِ الْأَعْرَابُ آمَنَّا قُل لَّمْ تُؤْمِنُوا', ref: 'الحجرات:١٤' },
      },
      {
        id:    'la_nahiyya',
        nameAr: 'لا الناهية — تجزم فعلاً',
        def:   'تفيد النهي — طلب الكف عن الفعل',
        example: 'لَا تَكْذِبْ',
        note:  'تكذب: مجزوم بلا الناهية بسكون ظاهر',
        effect: 'تجزم المضارع وتحوله لنهي',
        programming: 'throw new Error("prohibited") | guard clause | validation.reject()',
        quranEx: { text: 'وَلَا تَقْرَبُوا الزِّنَا', ref: 'الإسراء:٣٢', note: 'تقربوا: مجزوم بلا الناهية' },
      },
      {
        id:    'shart_jazim',
        nameAr: 'أدوات الشرط الجازمة (تجزم فعلين)',
        chars:  ['إِن', 'مَن', 'مَا', 'مَهْمَا', 'أَيُّ', 'مَتَى', 'أَيَّانَ', 'أَيْنَ', 'حَيْثُمَا', 'أَنَّى', 'كَيْفَمَا'],
        example: 'إِن تَدْرُسْ تَنجَحْ',
        note:  'تدرس: فعل الشرط مجزوم. تنجح: جواب الشرط مجزوم',
        effect: 'تجزم فعل الشرط وجواب الشرط معاً',
        programming: 'if(condition) { return result } — both condition and result are "jazzm"',
        quranEx: { text: 'مَن يَعْمَلْ سُوءًا يُجْزَ بِهِ', ref: 'النساء:١٢٣', note: 'يعمل/يُجز: مجزومان بمن الشرطية' },
      },
    ],
  },

  // قاعدة "الإعراب بالمحل" — I'rab Position
  IRAAB_MAHAL: {
    nameAr: 'الإعراب المحلي — الإعراب بالمحل',
    def:    'الجمل وشبه الجمل لها محل من الإعراب إذا وقعت موقع المفرد',
    programming: 'Expression evaluates to a value that has a type in context',
    quranRef: '﴿وَأَن تَصُومُوا خَيْرٌ لَّكُمْ﴾ — البقرة: ١٨٤',
    cases: [
      { case: 'في محل رفع',  meaning: 'الجملة تشغل موضع المرفوع',  programming: 'expression returns subject-type value',  example: '﴿يَقُولُ رَبَّنَا﴾ — جملة في محل نصب مقول القول' },
      { case: 'في محل نصب',  meaning: 'الجملة تشغل موضع المنصوب', programming: 'expression passed as argument',           example: '﴿أَنْ تَصُومُوا﴾ — مصدر مؤول في محل رفع مبتدأ' },
      { case: 'في محل جر',   meaning: 'الجملة تشغل موضع المجرور', programming: 'expression as property value',           example: 'مررتُ بمن يكتب — مَن: في محل جر' },
      { case: 'لا محل لها',  meaning: 'جمل ابتدائية أو استئنافية',  programming: 'statement — no return value (void)',    example: 'الجملة الابتدائية — ﴿الْحَمْدُ لِلَّهِ﴾' },
    ],
    types_no_mahal: ['الجملة الابتدائية', 'الجملة المعترضة', 'الجملة الصلة', 'جملة جواب الشرط غير المقترنة بالفاء'],
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// § 3 — جميع القواعد العربية رقمياً
// ═══════════════════════════════════════════════════════════════════════════

const QAWAID_ARABIA = Object.freeze({

  nameAr: 'القواعد العربية الرقمية الكاملة',
  quranRef: '﴿إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ﴾ — يوسف: ٢',

  // ─── قواعد الأسماء ───────────────────────────────────────────────
  ASMA_RULES: [
    { id: 'R_N01', rule: 'كل اسم نكرة يُنوَّن إلا الممنوع من الصرف',          ex: 'كِتَابٌ ← منوَّن. أَحمَدُ ← غير منوَّن',          programming: 'let x: string (nullable) vs const X: ENUM (no null)' },
    { id: 'R_N02', rule: 'المعرفة: المعرَّف بأل / الاسم العلم / الضمير / المضاف لمعرفة', ex: 'الكِتَابُ / مُحَمَّدٌ / هُوَ / كِتَابُ زَيدٍ', programming: 'const (defined binding) vs var (undefined possible)' },
    { id: 'R_N03', rule: 'الاسم المقصور: ينتهي بألف مقصورة — إعرابه تقديري',  ex: 'الهُدَى / الفَتَى — مرفوع بضمة مقدرة على الألف', programming: 'implicit type — compiler infers' },
    { id: 'R_N04', rule: 'الاسم المنقوص: ينتهي بياء مسبوقة بكسرة — إعرابه تقديري في الرفع والجر', ex: 'القَاضِي / الرَّاعِي',  programming: 'generic type with constraint' },
    { id: 'R_N05', rule: 'الممنوع من الصرف لا يُنوَّن ويُجر بالفتحة نيابةً عن الكسرة', ex: 'مررتُ بأَحمَدَ (فتحة نيابة عن كسرة)', programming: 'sealed class — restricted operations' },
    { id: 'R_N06', rule: 'المثنى: يُعرَب بالألف رفعاً وبالياء نصباً وجراً',   ex: 'الكِتَابَانِ (رفع) / الكِتَابَيْنِ (نصب/جر)',      programming: 'Pair<A,B> — typed tuple of exactly 2' },
    { id: 'R_N07', rule: 'جمع المذكر السالم: يُعرَب بالواو رفعاً وبالياء نصباً وجراً', ex: 'المُعَلِّمُونَ / المُعَلِّمِينَ',             programming: 'Array<Person> where all items are same type' },
    { id: 'R_N08', rule: 'جمع المؤنث السالم: يُعرَب بالضمة رفعاً وبالكسرة نصباً وجراً', ex: 'المُعَلِّمَاتُ / المُعَلِّمَاتِ',           programming: 'ReadonlyArray<Female> — special collection' },
    { id: 'R_N09', rule: 'الأسماء الخمسة: تُعرَب بالواو رفعاً والألف نصباً والياء جراً', ex: 'أَبُوكَ / أَبَاكَ / أَبِيكَ',               programming: 'special built-in types with unique operators' },
    { id: 'R_N10', rule: 'المضاف يُحذف تنوينه ونون مثناه وجمعه',              ex: 'كِتَابُ زَيدٍ (لا تنوين) / مُعَلِّمُو المَدرَسَةِ (حُذف نون)', programming: 'destructuring removes outer wrapper' },
  ],

  // ─── قواعد الأفعال ───────────────────────────────────────────────
  AFAL_RULES: [
    { id: 'R_V01', rule: 'الفعل الماضي مبني دائماً (لا يُعرَب)',              ex: 'كَتَبَ — مبني على الفتح',                           programming: 'immutable completed value — no further change' },
    { id: 'R_V02', rule: 'فعل الأمر مبني دائماً على ما يُجزَم به مضارعه',    ex: 'اكتُبْ — مبني على السكون',                          programming: 'command — no return type needed' },
    { id: 'R_V03', rule: 'الفعل المضارع معرَب — يرفع وينصب ويُجزَم',         ex: 'يَكتُبُ / يَكتُبَ / يَكتُبْ',                       programming: 'mutable function — can be in different states' },
    { id: 'R_V04', rule: 'الفعل اللازم: لا يتعدى لمفعول به',                 ex: 'ذَهَبَ / نَامَ / جَلَسَ — لا مفعول',                 programming: 'void function() — returns nothing' },
    { id: 'R_V05', rule: 'الفعل المتعدي: يتعدى لمفعول به واحد أو أكثر',      ex: 'كَتَبَ (كتاباً) / أَعطَى (زيداً كتاباً)',           programming: 'function(param) or function(p1, p2) — has parameters' },
    { id: 'R_V06', rule: 'الفعل المبني للمجهول: يُحذف فاعله ويُقام المفعول مقامه', ex: 'كُتِبَ الدرسُ (فاعل محذوف)',                  programming: 'passive method — caller not exposed (encapsulation)' },
    { id: 'R_V07', rule: 'نون التوكيد تلتزم الفعل في الأمر والمضارع المطلوب', ex: 'اكتُبَنَّ / واللهِ لأَكتُبَنَّ',                   programming: 'assert(condition, "must execute")' },
    { id: 'R_V08', rule: 'الأفعال الخمسة ترفع بثبوت النون وتُجزَم وتُنصَب بحذفها', ex: 'يكتُبُونَ / لن يكتُبُوا / لم يكتُبُوا',        programming: 'Array methods — plural subject modifies syntax' },
    { id: 'R_V09', rule: 'الفعل المعتل الآخر يُجزَم بحذف حرف العلة',         ex: 'لم يَدْعُ / لم يَرْمِ / لم يَخشَ',                 programming: 'optional chaining — lm?.execute() removes tail' },
    { id: 'R_V10', rule: 'كان وأخواتها تدخل على الجملة الاسمية فترفع وتنصب', ex: 'كَانَ العِلمُ نُوراً',                               programming: 'wrapper function that transforms types' },
  ],

  // ─── قواعد الحروف ────────────────────────────────────────────────
  HURUF_RULES: [
    { id: 'R_P01', rule: 'حرف الجر يجر الاسم الذي يليه',                     ex: 'ذَهَبتُ إِلَى المَدرَسَةِ — المدرسة مجرورة',         programming: 'path separator — /path/to/module' },
    { id: 'R_P02', rule: 'الواو العاطفة تُشرِك ما بعدها في حكم ما قبله',     ex: 'جاءَ زَيدٌ وعَمرٌو — عمرو مرفوع مثل زيد',          programming: '&&  join — both operands same type' },
    { id: 'R_P03', rule: 'لا النافية للجنس تنصب نصباً قياسياً',             ex: 'لَا إِلَهَ إِلَّا اللهُ — إله: اسم لا منصوب',         programming: 'isEmpty check — no T exists' },
    { id: 'R_P04', rule: 'الاستفهام بهل للتصديق وبالهمزة للتصور والتصديق',  ex: 'هَل كَتَبتَ؟ / أَأَنتَ كَتَبتَ؟',                   programming: 'boolean query vs value query' },
    { id: 'R_P05', rule: 'لو شرطية لما امتنع لامتناع — تفيد الفرضية الماضية', ex: 'لَو جِئتَ لَأَكرَمتُكَ',                           programming: 'counterfactual — if(false) { unreachable }' },
    { id: 'R_P06', rule: 'أن المصدرية مع فعلها في تأويل مصدر',               ex: 'يُرِيدُ أَن يَكتُبَ = يريدُ الكِتابَةَ',             programming: '() => fn  — lambda as value' },
    { id: 'R_P07', rule: 'لن تنصب المضارع وتنفي المستقبل نفياً قاطعاً',     ex: 'لَن أُشرِكَ بِاللهِ أَحَداً',                        programming: 'Promise.reject — will never resolve' },
    { id: 'R_P08', rule: 'الفاء في جواب الشرط تربط الجواب بالشرط وجوباً',   ex: 'إِن جِئتَ فَأَنتَ مُكرَمٌ',                          programming: 'return statement inside if block' },
    { id: 'R_P09', rule: 'حتى حرف غاية — ما بعدها داخل في الحكم أو خارج منه', ex: 'أَكَلتُ السَّمَكَةَ حَتَّى رَأسَهَا',              programming: 'inclusive range vs exclusive range' },
    { id: 'R_P10', rule: 'البدل يتبع المبدل منه في إعرابه تبعية مقيدة',      ex: 'رَأَيتُ أَخَاكَ مُحَمَّداً — محمداً: بدل منصوب',    programming: 'alias — same reference, same type' },
  ],

  // ─── قواعد الإعراب المحلي والتقديري ─────────────────────────────
  MAHAL_TAQDIRI: [
    { id: 'R_M01', rule: 'الاسم المقصور إعرابه تقديري على الألف (منع ظهور الحركة)',          ex: 'الهُدَى مُبَارَكٌ — الهدى: مرفوع بضمة مقدرة',    programming: 'inferred type — not explicitly written' },
    { id: 'R_M02', rule: 'الاسم المنقوص يُقَدَّر إعرابه في الرفع والجر',                     ex: 'القَاضِي عَادِلٌ — القاضي: مرفوع بضمة مقدرة على الياء', programming: 'implicit return type' },
    { id: 'R_M03', rule: 'المضاف إلى ياء المتكلم يُعرَب بحركة مقدرة منع منها اشتغال المحل', ex: 'كِتَابِي مُفِيدٌ — كتابي: مرفوع بضمة مقدرة',      programming: 'private member — visible but constrained' },
    { id: 'R_M04', rule: 'الجملة الواقعة خبراً في محل رفع',                                   ex: 'الطالبُ يكتُبُ — جملة يكتب في محل رفع خبر',       programming: 'lambda expression as return type annotation' },
    { id: 'R_M05', rule: 'الجملة الواقعة نعتاً في محل جر أو رفع أو نصب',                    ex: 'جاء رجلٌ يكتُبُ — جملة يكتب في محل جر نعت',      programming: 'inline function as type predicate' },
    { id: 'R_M06', rule: 'شبه الجملة (جار ومجرور / ظرف) في محل رفع أو نصب',                 ex: 'العِلمُ في الصَّدرِ — في الصدر: في محل رفع خبر',   programming: 'object literal as value expression' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// § 4 — القواعد العربية = أساسيات البرمجة (تطابق كامل)
// ═══════════════════════════════════════════════════════════════════════════

const ARABIC_IS_PROGRAMMING = Object.freeze({

  nameAr: 'اللغة العربية = أساس البرمجة — التطابق الكامل',
  quranRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
  hadithRef: '«أوتيتُ جوامع الكلم» — البخاري — أعلى مستوى Code Compression',

  COMPLETE_MAPPING: [

    // ─── مستوى الحروف والأصوات (Syntax Level) ──────────────────────
    { arabic: 'الحرف (أ ب ت...)',         programming: 'character / byte / token',              level: 'lexical', quranRef: 'البقرة:١ — الم' },
    { arabic: 'التشكيل (َ ُ ِ ْ)',          programming: 'type annotation / access modifier',    level: 'lexical', quranRef: 'الرحمن:٤ — البيان بالضبط' },
    { arabic: 'الهمزة والمد',             programming: 'special characters / escape sequences',  level: 'lexical' },
    { arabic: 'حروف المضارعة (أ ن ي ت)',  programming: 'function prefix (async/await/get/set)',  level: 'lexical' },

    // ─── مستوى الكلمة (Token Level) ─────────────────────────────────
    { arabic: 'الاسم النكرة (كِتَابٌ)',    programming: 'variable declaration (let x)',           level: 'token',   quranRef: 'البقرة:٣١' },
    { arabic: 'الاسم المعرفة (الكِتَابُ)', programming: 'constant reference (const X)',          level: 'token' },
    { arabic: 'الضمير (هُوَ / هِيَ)',       programming: 'this / self / reference variable',      level: 'token',   quranRef: 'الإخلاص:١' },
    { arabic: 'اسم الإشارة (هَذَا)',        programming: 'pointer / reference (this.target)',     level: 'token' },
    { arabic: 'الاسم الموصول (الَّذِي)',   programming: 'lambda / anonymous function / where',   level: 'token',   quranRef: 'الفاتحة:٧' },
    { arabic: 'الفعل الماضي (كَتَبَ)',     programming: 'sync function call (returned value)',    level: 'token',   programming2: 'const r = fn()' },
    { arabic: 'الفعل المضارع (يَكتُبُ)',  programming: 'running async / observable',             level: 'token' },
    { arabic: 'فعل الأمر (اكتُبْ)',        programming: 'imperative command / await statement',  level: 'token',   quranRef: 'العلق:١ — اقرأ' },
    { arabic: 'حرف الجر (في/على/من)',      programming: 'path separator / access operator (.)',  level: 'token' },
    { arabic: 'حرف العطف (و/ف/ثم)',        programming: 'logical AND / chaining operator (&&, |>)', level: 'token' },
    { arabic: 'حرف الشرط (إن/إذا)',        programming: 'if / conditional operator (?:)',         level: 'token' },
    { arabic: 'حرف النفي (لا/لم/لن/ما)',  programming: '! / NOT / === false',                   level: 'token' },

    // ─── مستوى التركيب (Expression Level) ───────────────────────────
    { arabic: 'جملة اسمية (العِلمُ نُورٌ)', programming: 'const science = light  // assignment', level: 'expr',   quranRef: 'البقرة:٢٥٥ — آية الكرسي' },
    { arabic: 'جملة فعلية (كَتَبَ زَيدٌ)', programming: 'zaid.write()  // method call',          level: 'expr' },
    { arabic: 'الإضافة (كِتَابُ زَيدٍ)',    programming: 'zaid.book  // property access',         level: 'expr',   quranRef: 'الفاتحة:٢ — رب العالمين' },
    { arabic: 'النعت (رَجُلٌ عالِمٌ)',      programming: 'interface Scholar extends Person',      level: 'expr' },
    { arabic: 'التوكيد (جاءَ زَيدٌ نَفسُهُ)', programming: 'assert(zaid === zaid_self)',         level: 'expr' },
    { arabic: 'العطف (زَيدٌ وعَمرٌو)',      programming: '[zaid, amr] // array / Set',            level: 'expr' },
    { arabic: 'البدل (مررتُ بأخِيكَ مُحَمَّدٍ)', programming: 'const brother = Muhammad  // alias', level: 'expr' },

    // ─── مستوى الجملة (Statement Level) ─────────────────────────────
    { arabic: 'أسلوب الشرط (إن تدرُسْ تَنجَحْ)', programming: 'if(study){ return pass }',       level: 'stmt',   quranRef: 'آل عمران:٣١' },
    { arabic: 'أسلوب الأمر (اقرَأ)',              programming: 'command pattern / await',          level: 'stmt',   quranRef: 'العلق:١' },
    { arabic: 'أسلوب النهي (لا تكذِبْ)',          programming: 'throw Error / guard / validate',  level: 'stmt' },
    { arabic: 'أسلوب الاستفهام (هَل/مَن/مَا)',    programming: 'query / request / GET endpoint',  level: 'stmt' },
    { arabic: 'أسلوب النداء (يَا زَيدُ)',          programming: 'function call / event emit',      level: 'stmt' },
    { arabic: 'أسلوب التعجب (مَا أَجمَلَ العِلمَ)', programming: 'console.warn / highlight',     level: 'stmt' },
    { arabic: 'أسلوب القَسَم (وَاللهِ لَأَفعَلَنَّ)', programming: 'assert(true, "will execute")', level: 'stmt' },
    { arabic: 'أسلوب الاستثناء (جاءَ القومُ إلَّا زَيداً)', programming: 'filter(x => x !== zaid)', level: 'stmt' },

    // ─── مستوى البنية (Architecture Level) ──────────────────────────
    { arabic: 'الجذر الثلاثي (ك-ت-ب)',      programming: 'abstract base class / interface',      level: 'arch',   quranRef: 'إبراهيم:٢٤ — شجرة طيبة أصلها ثابت' },
    { arabic: 'الوزن الصرفي (فَعَّلَ)',      programming: 'design pattern / template class',      level: 'arch' },
    { arabic: 'الاشتقاق (كتب→كاتب→مكتوب)', programming: 'inheritance chain / type derivation',   level: 'arch' },
    { arabic: 'المصدر (الكِتَابَة)',          programming: 'abstract base / interface root',       level: 'arch' },
    { arabic: 'اسم الفاعل (كَاتِب)',         programming: 'concrete class / agent worker',         level: 'arch' },
    { arabic: 'اسم المفعول (مَكتُوب)',        programming: 'DTO / value object / result',         level: 'arch' },
    { arabic: 'التصريف الكامل',              programming: 'generics T<U> / method overloading',    level: 'arch' },

    // ─── مستوى البلاغة (Quality Level) ──────────────────────────────
    { arabic: 'الفصاحة',                    programming: 'clean code / readable variable names',  level: 'quality', hadithRef: 'إن الله جميل يحب الجمال — مسلم' },
    { arabic: 'الإيجاز (جوامع الكلم)',       programming: 'DRY principle / code optimization',    level: 'quality', hadithRef: 'أوتيتُ جوامع الكلم — البخاري' },
    { arabic: 'الإطناب (التوضيح)',           programming: 'verbose mode / detailed documentation', level: 'quality' },
    { arabic: 'التشبيه',                    programming: 'analogy / pattern matching',             level: 'quality', quranRef: 'البقرة:١٧' },
    { arabic: 'الاستعارة',                  programming: 'abstraction / interface / generics',     level: 'quality', quranRef: 'مريم:٤' },
    { arabic: 'الكناية',                    programming: 'encapsulation / information hiding',     level: 'quality' },
    { arabic: 'الطباق',                     programming: 'boolean / enum / XOR',                  level: 'quality', quranRef: 'آل عمران:٢٦' },
    { arabic: 'مطابقة الكلام للمقام',       programming: 'context-aware / environment-specific',  level: 'quality' },
  ],

  // ─── رقمنة قواعد البرمجة باللغة العربية ─────────────────────────
  PROGRAMMING_IN_ARABIC: {
    nameAr: 'قواعد البرمجة مُعرَّبة ومرقَّمة بالكتاب والسنة',
    quranRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
    rules: [
      { id: 'PG01', arabic: 'التسمية',      english: 'Naming',           rule: 'كل متغير / دالة / كلاس اسمه يدل على معناه كاسم الفاعل', quranRef: 'البقرة:٣١ — وعلم آدم الأسماء' },
      { id: 'PG02', arabic: 'المسؤولية',    english: 'Responsibility',   rule: 'كل دالة لها مسؤولية واحدة كجملة فعلية واحدة',           hadithRef: 'إنما الأعمال بالنيات — البخاري:١' },
      { id: 'PG03', arabic: 'الإتقان',      english: 'Quality',          rule: 'كل كود مكتوب يُتقَن كما يُتقَن الخط',                   hadithRef: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — البيهقي' },
      { id: 'PG04', arabic: 'الأمانة',      english: 'Trust/Security',   rule: 'حفظ بيانات المستخدم أمانة (تشفير، عدم كشف)',             quranRef: 'النساء:٥٨ — إن الله يأمركم بالأمانات' },
      { id: 'PG05', arabic: 'العدل',        english: 'Justice/Balance',  rule: 'توزيع الحمل بالتساوي، لا احتكار مصادر',                 quranRef: 'الرحمن:٧ — ووضع الميزان' },
      { id: 'PG06', arabic: 'الإيجاز',      english: 'DRY/Conciseness',  rule: 'لا تكرار غير مبرر — كالإعراب لا يُذكر إلا عند الحاجة', hadithRef: 'أوتيتُ جوامع الكلم — البخاري:٢٩٧٧' },
      { id: 'PG07', arabic: 'التوثيق',      english: 'Documentation',    rule: 'كل كلاس ودالة لها تعريف لغوي واصطلاحي',                quranRef: 'الكهف:١٠٩ — لو كان البحر مداداً' },
      { id: 'PG08', arabic: 'النظام',       english: 'Order/Structure',  rule: 'الكود منظم كالجملة: مبتدأ ثم خبر — كلاس ثم ميثود',      quranRef: 'الملك:٣ — ما ترى في خلق الرحمن من تفاوت' },
      { id: 'PG09', arabic: 'دفع الضرر',   english: 'Security/No-Harm', rule: 'لا تُلحق الكود ضرراً بالمستخدم أو النظام',              hadithRef: 'لا ضرر ولا ضرار — ابن ماجه:٢٣٤١' },
      { id: 'PG10', arabic: 'الصدق',        english: 'Honesty/Accuracy', rule: 'لا تزوِّر بيانات، لا تخفِ أخطاء، كن صادقاً في المخرجات', hadithRef: 'عليكم بالصدق — مسلم:٢٦٠٧' },
      { id: 'PG11', arabic: 'التعاون',      english: 'Collaboration',    rule: 'الكود مفتوح المصدر عند الإمكان — الخير يُشار',          hadithRef: 'الله في عون العبد ما كان العبد في عون أخيه — مسلم' },
      { id: 'PG12', arabic: 'الاستمرارية', english: 'Continuity',       rule: 'كل كود يُكتَب يترك أثراً — وثِّق، اختبِر، حافِظ',      hadithRef: 'إذا مات ابن آدم انقطع عمله إلا من ثلاثة... علم ينتفع به — مسلم:١٦٣١' },
      { id: 'PG13', arabic: 'الشورى',       english: 'Code Review',      rule: 'كل كود يُراجَع من آخر — المستشار مؤتمن',               quranRef: 'آل عمران:١٥٩ — وشاورهم في الأمر' },
      { id: 'PG14', arabic: 'التحقق',       english: 'Testing',          rule: 'كل كلمة تُختبَر — الاختبار = الإعراب التطبيقي',         quranRef: 'الحجرات:٦ — فتبينوا' },
      { id: 'PG15', arabic: 'المقاصد',      english: 'Intent/Purpose',   rule: 'كل سكربت له غرض — الغرض يحكم التصميم',                hadithRef: 'إنما الأعمال بالنيات — البخاري:١' },
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// § 5 — محرك الإعراب الكامل مع الزمن والعوامل
// ═══════════════════════════════════════════════════════════════════════════

class FullIraabEngine {

  /**
   * إعراب جملة كاملة مع التحليل الزمني والعوامل
   */
  static analyze(sentence) {
    if (!sentence || typeof sentence !== 'string') return { error: 'الجملة مطلوبة' };
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    const parsed = [];
    let governor = null; // العامل الحالي

    // أدوات التصنيف
    const JARR_CHARS   = new Set(['من','إلى','عن','على','في','ب','بـ','ل','لـ','ك','كـ','حتى','منذ','خلا','عدا','حاشا','رُبَّ','واو القسم','تاء القسم']);
    const NASB_MUD     = new Set(['أن','لن','كي','إذن','لام التعليل','لام الجحود','حتى الناصبة','فاء السببية','واو المعية']);
    const JAZM_MUD     = new Set(['لم','لما','لا الناهية','لام الأمر']);
    const JAZM_SHART   = new Set(['إن','من','ما','مهما','أي','متى','أيان','أين','حيثما','أنى','كيفما','إذ']);
    const KANA_SIS     = new Set(['كان','أصبح','أمسى','أضحى','ظل','بات','صار','ليس','مازال','لازال','مابرح','مافتئ','ماانفك']);
    const INNA_SIS     = new Set(['إن','إنّ','أن','أنّ','كأن','كأنّ','لكن','لكنّ','ليت','لعل','لعلّ']);
    const NAFI         = new Set(['ما','لا','لم','لن','لات','إن','ليس']);

    // هل الكلمة اسم (تبدأ بأل التعريف أو تنتهي بتنوين)؟
    function looksLikeNoun(w) {
      const bare = w.replace(/[\u064B-\u065F\u0670]/g, ''); // حذف التشكيل
      return bare.startsWith('ال') || /[ًٌٍ]/.test(w);
    }

    // كشف الفعل الماضي الثلاثي بنمط فَعَلَ
    function isMadiPattern(w) {
      // فَعَلَ / فَعِلَ / فَعُلَ: ح١+فتحة + ح٢+(فتحة|كسرة|ضمة) + ح٣+(فتحة|سكون)
      if (/^[\u0600-\u064A][\u064E][\u0600-\u064A][\u064E\u0650\u064F][\u0600-\u064A][\u064E\u0652]?$/.test(w)) return true;
      // بدون تشكيل: 3 حروف فقط — قد يكون ماضٍ
      const bare = w.replace(/[\u064B-\u065F\u0670]/g, '');
      return bare.length === 3 && /^[\u0621-\u064A]{3}$/.test(bare) && !/^[أنيت]/.test(bare) && !bare.startsWith('ال');
    }

    // كشف الزمن من الكلمة — لا يعتمد على التشكيل كمؤشر
    function detectTense(w) {
      if (looksLikeNoun(w)) return null; // اسم — لا زمن
      const bare = w.replace(/[\u064B-\u065F\u0670]/g, ''); // بدون تشكيل
      if (KANA_SIS.has(bare) || KANA_SIS.has(w)) return 'ماضٍ (ناسخ)';
      // الماضي: ينتهي بـ ا أو وا أو تَ تِ تُ تا تم تن — بعد حذف التشكيل
      if (/[وا]$/.test(bare) && bare.length >= 3 && !/^[أنيت]/.test(bare)) return 'ماضٍ';
      if (/تَ$|تِ$|تُ$|تا$|نا$/.test(bare)) return 'ماضٍ';
      if (isMadiPattern(w)) return 'ماضٍ';
      if (/^(سَ|سي|سَي|سَت|سَن|سَأ|سن|ست|سأ)/.test(bare)) return 'مستقبل قريب (سين)';
      if (/^سوف/.test(bare)) return 'مستقبل بعيد (سوف)';
      // المضارع: يبدأ بأحد أحرف المضارعة ويبدو فعلاً (لا يبدأ بأل)
      if (/^[أنيت]/.test(bare) && bare.length >= 3 && !bare.startsWith('ال')) return 'مضارع';
      // الأمر: يبدأ بهمزة وصل ويتبعها صوامت
      if (/^[اِاُ][^ل]/.test(bare) && bare.length >= 3 && !JARR_CHARS.has(bare)) return 'أمر';
      return null;
    }

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const tense = detectTense(w);

      let type = 'ism', iraaCase = 'raf', fn = 'غير محدد', note = '', sign = 'ضمة (ُ)';
      let amil = null; // العامل

      // ─ تحديد النوع والإعراب ─
      if (KANA_SIS.has(w.replace(/[\u064B-\u065F]/g, ''))) {
        type = 'fiil_nasikh'; iraaCase = 'mabni'; fn = 'فعل ناسخ (كان وأخواتها)';
        note = 'يرفع اسمه وينصب خبره'; governor = { type: 'kana', rafa: true, nasb: true };
        sign = 'مبني';
      } else if (INNA_SIS.has(w) && i < words.length - 1) {
        type = 'harf_nasikh'; iraaCase = 'mabni'; fn = 'حرف ناسخ (إن وأخواتها)';
        note = 'ينصب الاسم ويرفع الخبر'; governor = { type: 'inna', nasb_next: true };
        sign = 'مبني';
      } else if (JARR_CHARS.has(w)) {
        type = 'harf_jarr'; iraaCase = 'mabni'; fn = 'حرف جر';
        note = `يجر ما بعده (${w})`; governor = { type: 'jarr', next_is_jarr: true };
        sign = 'مبني';
      } else if (JAZM_MUD.has(w)) {
        type = 'harf_jazm'; iraaCase = 'mabni'; fn = 'حرف جازم';
        note = 'يجزم الفعل المضارع بعده'; governor = { type: 'jazm', next_is_jazm: true };
        sign = 'مبني';
      } else if (JAZM_SHART.has(w)) {
        type = 'adat_shart'; iraaCase = 'mabni'; fn = 'أداة شرط جازمة';
        note = 'تجزم فعل الشرط وجوابه'; governor = { type: 'shart', count: 2 };
        sign = 'مبني';
      } else if (NASB_MUD.has(w)) {
        type = 'harf_nasb'; iraaCase = 'mabni'; fn = 'حرف ناصب للمضارع';
        note = 'ينصب الفعل المضارع بعده'; governor = { type: 'nasb_mudhari', next_is_nasb: true };
        sign = 'مبني';
      } else if (NAFI.has(w)) {
        type = 'harf_nafi'; iraaCase = 'mabni'; fn = 'حرف نفي';
        note = `نافية (${w})`; sign = 'مبني';
      } else {
        // ─ اسم أو فعل: الترتيب الصحيح (ماضٍ أولاً ثم أمر ثم مضارع)
        if (tense === 'أمر') {
          type = 'fiil_amr'; iraaCase = 'mabni'; fn = 'فعل أمر مبني'; sign = 'مبني على السكون';
        } else if (tense?.startsWith('ماضٍ')) {
          type = 'fiil_madhi'; iraaCase = 'mabni'; fn = `فعل ماضٍ — ${tense}`; sign = 'مبني على الفتح';
        } else if (tense === 'مضارع' || tense?.startsWith('مستقبل')) {
          // فعل مضارع — يخضع للعوامل
          type = 'fiil_mudhari'; sign = 'ضمة (ُ) — حسب العامل';
          if (governor?.next_is_jazm) {
            iraaCase = 'jazm'; fn = 'فعل مضارع مجزوم'; sign = 'سكون (ْ) أو حذف حرف العلة'; governor = null;
          } else if (governor?.next_is_nasb) {
            iraaCase = 'nasb'; fn = 'فعل مضارع منصوب'; sign = 'فتحة (َ)'; governor = null;
          } else if (governor?.type === 'shart') {
            iraaCase = 'jazm'; fn = governor.count === 2 ? 'فعل الشرط مجزوم' : 'جواب الشرط مجزوم';
            sign = 'سكون (ْ)'; governor = { ...governor, count: governor.count - 1 };
            if (governor.count <= 0) governor = null;
          } else {
            iraaCase = 'raf'; fn = tense?.startsWith('مستقبل') ? `فعل مضارع مرفوع — ${tense}` : 'فعل مضارع مرفوع';
            sign = 'ضمة (ُ)';
          }
        } else {
          // اسم
          if (governor?.next_is_jarr) {
            iraaCase = 'jarr'; fn = 'اسم مجرور'; sign = 'كسرة (ِ)'; governor = null;
          } else if (governor?.nasb_next || governor?.type === 'inna') {
            iraaCase = 'nasb'; fn = governor?.type === 'inna' ? 'اسم إن منصوب' : 'منصوب';
            sign = 'فتحة (َ)'; governor = { ...governor, nasb_next: false, type: governor?.type === 'inna' ? 'inna_khabar' : null };
          } else if (governor?.type === 'inna_khabar') {
            iraaCase = 'raf'; fn = 'خبر إن مرفوع'; sign = 'ضمة (ُ)'; governor = null;
          } else if (governor?.rafa) {
            iraaCase = 'raf'; fn = 'اسم كان مرفوع'; sign = 'ضمة (ُ)'; governor = { ...governor, nasb: true, rafa: false };
          } else if (governor?.nasb) {
            iraaCase = 'nasb'; fn = 'خبر كان منصوب'; sign = 'فتحة (َ)'; governor = null;
          } else {
            iraaCase = i === 0 ? 'raf' : 'raf';
            fn = i === 0 ? 'مبتدأ/فاعل مرفوع' : 'خبر/فاعل مرفوع';
            sign = 'ضمة (ُ)';
          }
          amil = i === 0 ? 'الابتداء' : governor ? governor.type : 'موقعه في الجملة';
        }
      }

      parsed.push({
        pos:    i + 1,
        word:   w,
        type,
        tense:  tense || (type.startsWith('fiil_mad') ? 'ماضٍ' : type.startsWith('fiil_amr') ? 'أمر' : type === 'fiil' ? 'مضارع' : null),
        iraaCase,
        sign,
        function: fn,
        amil:    amil || (type.startsWith('harf') ? 'مبني لا محل له' : null),
        note,
        programming: AWAMIL.RAFI_AWAMIL.awamil.find(a => a.id === 'fail_position')?.programming || 'see AWAMIL',
      });
    }

    const sentenceType = parsed.some(p => p.type?.startsWith('fiil')) ? 'جملة فعلية' : 'جملة اسمية';
    const hasTense = parsed.find(p => p.tense);

    return {
      sentence,
      wordCount: words.length,
      sentenceType,
      dominantTense: hasTense?.tense || 'غير محدد',
      programming_equiv: ZAMAN[hasTense?.tense === 'مضارع' ? 'HADIR' : hasTense?.tense?.startsWith('ماضٍ') ? 'MADI' : 'MUSTAQBAL']?.programming?.equivalent || 'N/A',
      parsed,
      tawheed: TAWHEED,
      quranRef: { ref: 'الرحمن:٤', text: '﴿عَلَّمَهُ الْبَيَانَ﴾' },
      seal: 'والله أعلم وبالله التوفيق',
    };
  }

  /** تصريف فعل كامل في جميع الأزمنة */
  static conjugateFull(root3 = 'كتب') {
    const [f, a, l] = [...root3].filter(c => /[\u0621-\u064A]/.test(c));
    if (!f || !a || !l) return { error: 'الجذر يجب أن يكون ثلاثة أحرف عربية' };
    const r = `${f}${a}${l}`;
    return {
      root: r, root3,
      MADI: {
        nameAr: 'الماضي', tense: 'PAST',
        forms: [
          { pronoun: 'هو',    form: `${f}َ${a}َ${l}َ`,      note: 'مبني على الفتح' },
          { pronoun: 'هي',    form: `${f}َ${a}َ${l}َتْ`,    note: 'مبني على الفتح' },
          { pronoun: 'هما م', form: `${f}َ${a}َ${l}َا`,     note: 'مبني على الفتح' },
          { pronoun: 'هم',    form: `${f}َ${a}َ${l}ُوا`,    note: 'مبني على الضم' },
          { pronoun: 'أنت',   form: `${f}َ${a}َ${l}ْتَ`,    note: 'مبني على السكون' },
          { pronoun: 'أنتِ',  form: `${f}َ${a}َ${l}ْتِ`,    note: 'مبني على السكون' },
          { pronoun: 'أنا',   form: `${f}َ${a}َ${l}ْتُ`,    note: 'مبني على السكون' },
          { pronoun: 'نحن',   form: `${f}َ${a}َ${l}ْنَا`,   note: 'مبني على السكون' },
        ],
      },
      MUDHARI: {
        nameAr: 'المضارع', tense: 'PRESENT/FUTURE',
        marfuu: [
          { pronoun: 'هو',  form: `يَ${f}ْ${a}ُ${l}ُ`, state: 'رفع', sign: 'ضمة' },
          { pronoun: 'هي',  form: `تَ${f}ْ${a}ُ${l}ُ`, state: 'رفع', sign: 'ضمة' },
          { pronoun: 'أنت', form: `تَ${f}ْ${a}ُ${l}ُ`, state: 'رفع', sign: 'ضمة' },
          { pronoun: 'أنا', form: `أَ${f}ْ${a}ُ${l}ُ`, state: 'رفع', sign: 'ضمة' },
          { pronoun: 'نحن', form: `نَ${f}ْ${a}ُ${l}ُ`, state: 'رفع', sign: 'ضمة' },
          { pronoun: 'هم',  form: `يَ${f}ْ${a}ُ${l}ُونَ`, state: 'رفع', sign: 'ثبوت النون' },
        ],
        mansub: { examples: [`أَنْ يَ${f}ْ${a}ُ${l}َ`], sign: 'فتحة', note: 'بعد أن/لن/كي...' },
        majzum: { examples: [`لَمْ يَ${f}ْ${a}ُ${l}ْ`], sign: 'سكون', note: 'بعد لم/لما/لا النهي...' },
      },
      AMR: {
        nameAr: 'الأمر', tense: 'IMPERATIVE',
        forms: [
          { pronoun: 'أنت',  form: `اُ${a}ْ${l}ْ`, sign: 'مبني على السكون' },
          { pronoun: 'أنتِ', form: `اُ${a}ْ${l}ِي`, sign: 'مبني على حذف النون' },
          { pronoun: 'أنتما', form: `اُ${a}ْ${l}َا`, sign: 'مبني على حذف النون' },
        ],
      },
      MUSTAQBAL: {
        nameAr: 'المستقبل', tense: 'FUTURE',
        forms: [
          { pronoun: 'هو',  form: `سَيَ${f}ْ${a}ُ${l}ُ`, note: 'سَ + مضارع مرفوع' },
          { pronoun: 'هو',  form: `سَوفَ يَ${f}ْ${a}ُ${l}ُ`, note: 'سوف + مضارع مرفوع' },
          { pronoun: 'هم',  form: `سَيَ${f}ْ${a}ُ${l}ُونَ`, note: 'جمع مذكر' },
        ],
      },
      tawheed: TAWHEED,
      quranRef: '﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾ — القمر: ٤٩',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// § 6 — شبكة الخلايا العصبية (80+ خلية)
// ═══════════════════════════════════════════════════════════════════════════

class LangNeuralCell {
  constructor({ id, nameAr, layer, weight, quranRef = '', hadithRef = '', programming = '', connections = [] }) {
    this.id = id; this.nameAr = nameAr; this.layer = layer;
    this.weight = weight; this.quranRef = quranRef; this.hadithRef = hadithRef;
    this.programming = programming; this.connections = connections;
    this.activation = 0.0; this.fireCount = 0;
  }
  fire(text = '') {
    this.fireCount++;
    const keywords = {
      tawheed:  ['الله', 'توحيد', 'إله', 'رب', 'رحمن', 'بسم'],
      quran:    ['قرآن', 'آية', 'سورة', 'تلاوة', 'تجويد'],
      sunnah:   ['حديث', 'نبي', 'سنة', 'صحابة', 'محمد', 'رسول'],
      nahw:     ['إعراب', 'مرفوع', 'منصوب', 'مجرور', 'مبتدأ', 'خبر', 'فاعل', 'مفعول'],
      sarf:     ['جذر', 'وزن', 'مصدر', 'اشتقاق', 'تصريف', 'فاعل', 'مفعول'],
      balagha:  ['استعارة', 'تشبيه', 'كناية', 'بيان', 'بديع', 'معاني'],
      zaman:    ['ماضٍ', 'مضارع', 'مستقبل', 'زمن', 'سيفعل', 'كان'],
      awamil:   ['عامل', 'رفع', 'نصب', 'جر', 'جزم', 'حكم', 'أثر'],
      iraab:    ['إعراب', 'حركة', 'ضمة', 'فتحة', 'كسرة', 'سكون', 'محل'],
      programming: ['كود', 'برمجة', 'دالة', 'كلاس', 'متغير', 'سكربت'],
    };
    const keys = keywords[this.layer] || [];
    const hits = keys.filter(k => text.includes(k)).length;
    const score = Math.min(1.0, hits / Math.max(1, keys.length * 0.4));
    this.activation = Math.min(1.0, (this.activation * 0.55) + (score * this.weight * 0.45));
    return this.activation;
  }
  toJSON() {
    return { id: this.id, nameAr: this.nameAr, layer: this.layer, weight: this.weight,
      activation: +this.activation.toFixed(3), fireCount: this.fireCount, programming: this.programming };
  }
}

class ArabicGrammarNeuralNetwork extends EventEmitter {
  constructor() {
    super();
    this.nameAr  = 'شبكة الخلايا العصبية العربية الكاملة — شيخة';
    this.tawheed = TAWHEED;
    this.cells   = new Map();
    this._build();
  }

  _build() {
    const defs = [
      // TAWHEED layer (5)
      { id:'T01', nameAr:'نواة التوحيد',           layer:'tawheed',  weight:1.00, quranRef:'الإخلاص:١',     programming:'ROOT_SINGLETON'                },
      { id:'T02', nameAr:'البسملة — مفتاح الكلام', layer:'tawheed',  weight:1.00, quranRef:'الفاتحة:١',     programming:'INIT_FUNCTION'                 },
      { id:'T03', nameAr:'البيان الإلهي',           layer:'tawheed',  weight:0.99, quranRef:'الرحمن:١-٤',    programming:'LANGUAGE_ENGINE'               },
      { id:'T04', nameAr:'علم الأسماء',             layer:'tawheed',  weight:0.99, quranRef:'البقرة:٣١',     programming:'NAMING_SYSTEM'                 },
      { id:'T05', nameAr:'الكلام الإلهي المعجز',    layer:'tawheed',  weight:0.98, quranRef:'يوسف:٢',        programming:'HIGHEST_QUALITY_CODE'          },

      // QURAN layer (8)
      { id:'Q01', nameAr:'القرآن عربي مبين',        layer:'quran',    weight:0.99, quranRef:'النحل:١٠٣',     programming:'SOURCE_OF_TRUTH'               },
      { id:'Q02', nameAr:'فواتح السور — الأحرف',    layer:'quran',    weight:0.97, quranRef:'البقرة:١',      programming:'SPECIAL_TOKENS'                },
      { id:'Q03', nameAr:'الإعجاز البياني',          layer:'quran',    weight:0.97, quranRef:'البقرة:٢٣',     programming:'BENCHMARK_EXCELLENCE'          },
      { id:'Q04', nameAr:'أسلوب الأمر القرآني',      layer:'quran',    weight:0.97, quranRef:'العلق:١',       programming:'COMMAND_PATTERN'               },
      { id:'Q05', nameAr:'أسلوب الشرط القرآني',      layer:'quran',    weight:0.96, quranRef:'آل عمران:٣١',   programming:'CONDITIONAL_PATTERN'           },
      { id:'Q06', nameAr:'الزمن في القرآن',           layer:'quran',    weight:0.96, quranRef:'العصر:١',       programming:'TIME_SYSTEM'                   },
      { id:'Q07', nameAr:'العوامل في القرآن',         layer:'quran',    weight:0.96, quranRef:'الفاتحة:٢',     programming:'OPERATOR_SYSTEM'               },
      { id:'Q08', nameAr:'الإيجاز القرآني',           layer:'quran',    weight:0.95, quranRef:'الكوثر:١',      programming:'CODE_OPTIMIZATION'             },

      // SUNNAH layer (6)
      { id:'S01', nameAr:'الإعراب — أمر نبوي',       layer:'sunnah',   weight:0.99, hadithRef:'حديث شريف',    programming:'TYPE_ANNOTATION'               },
      { id:'S02', nameAr:'جوامع الكلم',               layer:'sunnah',   weight:0.99, hadithRef:'البخاري:٢٩٧٧', programming:'DRY_PRINCIPLE'                 },
      { id:'S03', nameAr:'الإتقان واجب',               layer:'sunnah',   weight:0.98, hadithRef:'البيهقي',      programming:'QUALITY_STANDARD'              },
      { id:'S04', nameAr:'النية في الكلام',            layer:'sunnah',   weight:0.97, hadithRef:'البخاري:١',    programming:'INTENT_DRIVEN_DESIGN'          },
      { id:'S05', nameAr:'البيان سحر',                 layer:'sunnah',   weight:0.97, hadithRef:'البخاري:٥١٤٦', programming:'EXPRESSIVE_CODE'               },
      { id:'S06', nameAr:'الصدق في الكلام',            layer:'sunnah',   weight:0.97, hadithRef:'مسلم:٢٦٠٧',   programming:'TRUTHFUL_API'                  },

      // ZAMAN layer (9)
      { id:'Z01', nameAr:'الزمن الماضي — فعل ماضٍ',   layer:'zaman',    weight:0.96, quranRef:'إبراهيم:١٩',   programming:'PAST_STATE | completed async'  },
      { id:'Z02', nameAr:'الزمن الحاضر — مضارع حاضر', layer:'zaman',    weight:0.96, quranRef:'السجدة:٥',     programming:'CURRENT_STATE | observable'    },
      { id:'Z03', nameAr:'الزمن المستقبل — سين/سوف',  layer:'zaman',    weight:0.95, quranRef:'الطلاق:٧',     programming:'FUTURE_STATE | Promise pending'},
      { id:'Z04', nameAr:'الأمر — زمن الطلب الفوري',  layer:'zaman',    weight:0.95, quranRef:'العلق:١',       programming:'IMMEDIATE | await command'     },
      { id:'Z05', nameAr:'الماضي المستمر — كان يفعل',  layer:'zaman',    weight:0.94, quranRef:'الكهف:١٨',     programming:'WAS_RUNNING | stopped stream'  },
      { id:'Z06', nameAr:'النفي الماضي — لم يفعل',    layer:'zaman',    weight:0.94, quranRef:'الإخلاص:٣',    programming:'NOT_EXECUTED | !completed'     },
      { id:'Z07', nameAr:'النفي المستقبل — لن يفعل',  layer:'zaman',    weight:0.93, quranRef:'آل عمران:٩١',  programming:'PROMISE_REJECT | never()'      },
      { id:'Z08', nameAr:'المستقبل الشرطي — إن يفعل', layer:'zaman',    weight:0.93, quranRef:'آل عمران:٣١',  programming:'CONDITIONAL_PROMISE | .then()' },
      { id:'Z09', nameAr:'الزمن المحلي — السياق الزمني', layer:'zaman',  weight:0.92, quranRef:'العصر:١',      programming:'TIMESTAMP | Date.now()'        },

      // AWAMIL layer (10)
      { id:'A01', nameAr:'الابتداء — رافع المبتدأ',    layer:'awamil',   weight:0.95, quranRef:'البقرة:٢٥٧',   programming:'LEFT_HAND_SIDE declaration'    },
      { id:'A02', nameAr:'الفعلية — رافع الفاعل',      layer:'awamil',   weight:0.95, quranRef:'الإسراء:٢٣',   programming:'FUNCTION_CALLER | invoker'     },
      { id:'A03', nameAr:'كان — رافعة الاسم ناصبة الخبر', layer:'awamil', weight:0.94, quranRef:'النساء:١٧',  programming:'TYPE_CAST_WRAPPER'             },
      { id:'A04', nameAr:'إن — ناصبة الاسم رافعة الخبر',  layer:'awamil', weight:0.94, quranRef:'البقرة:١٧٣', programming:'ASSERT(subj_as_arg, pred)'     },
      { id:'A05', nameAr:'حروف الجر — جارة الاسم',     layer:'awamil',   weight:0.93, quranRef:'الفاتحة:١',   programming:'PATH_SEPARATOR | . operator'   },
      { id:'A06', nameAr:'الإضافة — جارة المضاف إليه', layer:'awamil',   weight:0.93, quranRef:'الفاتحة:٢',   programming:'OBJECT.PROPERTY accessor'      },
      { id:'A07', nameAr:'لم/لما — جازمة المضارع',     layer:'awamil',   weight:0.92, quranRef:'الإخلاص:٣',   programming:'NOT_EXECUTED | !fn()'          },
      { id:'A08', nameAr:'لا الناهية — جازمة',         layer:'awamil',   weight:0.92, quranRef:'الإسراء:٣٢',  programming:'GUARD_CLAUSE | validation.reject'},
      { id:'A09', nameAr:'أدوات الشرط — جازمة فعلين', layer:'awamil',   weight:0.93, quranRef:'النساء:١٢٣',  programming:'IF_THEN conditional block'     },
      { id:'A10', nameAr:'الإعراب المحلي — موقع الجملة', layer:'awamil', weight:0.91, quranRef:'البقرة:١٨٤',  programming:'EXPRESSION_TYPE_CONTEXT'       },

      // NAHW layer (12)
      { id:'N01', nameAr:'الاسم — المبتدأ والخبر',     layer:'nahw',     weight:0.94, quranRef:'البقرة:٢٥٥',   programming:'SUBJECT_PREDICATE declaration' },
      { id:'N02', nameAr:'الفعل — ماضٍ مضارع أمر',    layer:'nahw',     weight:0.94, quranRef:'العلق:١',       programming:'FUNCTION past/present/future'  },
      { id:'N03', nameAr:'الحرف — الوظيفة في الجملة', layer:'nahw',     weight:0.92, quranRef:'الفاتحة:١',     programming:'OPERATOR/KEYWORD in context'   },
      { id:'N04', nameAr:'الإعراب — الرفع والنصب والجر والجزم', layer:'nahw', weight:0.94, quranRef:'الفاتحة:٥', programming:'TYPE_ANNOTATION 4 states'    },
      { id:'N05', nameAr:'الجملة الاسمية',             layer:'nahw',     weight:0.92, quranRef:'البقرة:٢٥٥',   programming:'const x = y  assignment'       },
      { id:'N06', nameAr:'الجملة الفعلية',             layer:'nahw',     weight:0.92, quranRef:'العلق:١',       programming:'fn(args)  function call'        },
      { id:'N07', nameAr:'الجملة الشرطية',             layer:'nahw',     weight:0.91, quranRef:'آل عمران:٣١',  programming:'if(cond){ result }'            },
      { id:'N08', nameAr:'الإضافة — الملكية والانتماء', layer:'nahw',    weight:0.91, quranRef:'الفاتحة:٢',    programming:'object.property path'         },
      { id:'N09', nameAr:'النعت والصفة',               layer:'nahw',     weight:0.90, quranRef:'الفاتحة:٢',     programming:'interface extends type'        },
      { id:'N10', nameAr:'العطف والربط',               layer:'nahw',     weight:0.90, quranRef:'البقرة:٢٨٢',   programming:'&&  || union intersection'     },
      { id:'N11', nameAr:'أسلوب النداء',               layer:'nahw',     weight:0.89, quranRef:'يس:٦٩',         programming:'function call / event.emit()'  },
      { id:'N12', nameAr:'أسلوب الاستفهام',            layer:'nahw',     weight:0.89, quranRef:'يونس:١٠١',     programming:'query / GET request'           },

      // SARF layer (10)
      { id:'SR01', nameAr:'الجذر الثلاثي',             layer:'sarf',     weight:0.94, quranRef:'إبراهيم:٢٤',   programming:'ABSTRACT_BASE_CLASS'           },
      { id:'SR02', nameAr:'الأوزان الصرفية',           layer:'sarf',     weight:0.93, quranRef:'النمل:٨٨',     programming:'DESIGN_PATTERN template'       },
      { id:'SR03', nameAr:'المصدر',                    layer:'sarf',     weight:0.93, quranRef:'الرحمن:٤',     programming:'INTERFACE root type'           },
      { id:'SR04', nameAr:'اسم الفاعل',                layer:'sarf',     weight:0.92, quranRef:'البقرة:٢٥٥',   programming:'AGENT_CLASS concrete'          },
      { id:'SR05', nameAr:'اسم المفعول',               layer:'sarf',     weight:0.92, quranRef:'الرحمن:٤',     programming:'RESULT_VALUE DTO'              },
      { id:'SR06', nameAr:'التصريف الكامل',            layer:'sarf',     weight:0.91, quranRef:'الفاتحة:٥',    programming:'GENERICS T<U> overloading'     },
      { id:'SR07', nameAr:'أبواب الزيادة',             layer:'sarf',     weight:0.91, quranRef:'العلق:١',       programming:'INHERITANCE layers extend'     },
      { id:'SR08', nameAr:'الاشتقاق',                  layer:'sarf',     weight:0.91, quranRef:'البقرة:٣١',    programming:'TYPE_DERIVATION extends'       },
      { id:'SR09', nameAr:'اسم الزمان والمكان',        layer:'sarf',     weight:0.90, quranRef:'السجدة:٥',     programming:'TIMESTAMP | LOCATION metadata' },
      { id:'SR10', nameAr:'الصفة المشبهة واسم التفضيل', layer:'sarf',   weight:0.90, quranRef:'الكوثر:١',     programming:'IMMUTABLE_PROP | COMPARATOR'   },

      // BALAGHA layer (8)
      { id:'B01', nameAr:'التشبيه',                    layer:'balagha',  weight:0.92, quranRef:'البقرة:١٧',    programming:'ANALOGY | polymorphism'        },
      { id:'B02', nameAr:'الاستعارة',                  layer:'balagha',  weight:0.92, quranRef:'مريم:٤',       programming:'ABSTRACTION | interface'       },
      { id:'B03', nameAr:'الكناية',                    layer:'balagha',  weight:0.91, quranRef:'النساء:٤٣',    programming:'ENCAPSULATION | info hiding'   },
      { id:'B04', nameAr:'المجاز',                     layer:'balagha',  weight:0.90, quranRef:'يوسف:٨٢',     programming:'PROXY | delegate'             },
      { id:'B05', nameAr:'الطباق والمقابلة',           layer:'balagha',  weight:0.90, quranRef:'آل عمران:٢٦', programming:'BOOLEAN | XOR | enum'         },
      { id:'B06', nameAr:'الجناس',                     layer:'balagha',  weight:0.89, quranRef:'الروم:٥٥',    programming:'OVERLOADING | homonym'         },
      { id:'B07', nameAr:'مطابقة الكلام للمقام',       layer:'balagha',  weight:0.91, quranRef:'البقرة:٨٣',   programming:'CONTEXT_AWARE polymorphism'    },
      { id:'B08', nameAr:'الإيجاز البلاغي',            layer:'balagha',  weight:0.91, hadithRef:'البخاري:٢٩٧٧', programming:'DRY | compression | elegance' },

      // PROGRAMMING layer (7)
      { id:'P01', nameAr:'التسمية = الاسم',            layer:'programming', weight:0.93, quranRef:'البقرة:٣١', programming:'naming convention'            },
      { id:'P02', nameAr:'الدالة = الجملة الفعلية',   layer:'programming', weight:0.93, quranRef:'العلق:١',   programming:'function/method definition'   },
      { id:'P03', nameAr:'الكلاس = الجملة الاسمية',   layer:'programming', weight:0.92, quranRef:'البقرة:٢٥٥', programming:'class/struct definition'     },
      { id:'P04', nameAr:'الشرط = الجملة الشرطية',    layer:'programming', weight:0.92, quranRef:'آل عمران:٣١', programming:'if/else conditional'        },
      { id:'P05', nameAr:'المتغير = الاسم النكرة',    layer:'programming', weight:0.91, quranRef:'البقرة:٣١', programming:'variable declaration'        },
      { id:'P06', nameAr:'الثابت = الاسم المعرفة',    layer:'programming', weight:0.91, quranRef:'الإخلاص:١', programming:'constant/readonly'           },
      { id:'P07', nameAr:'الإطار الزمني = الفعل',     layer:'programming', weight:0.92, quranRef:'العصر:١',   programming:'async timeline management'    },
    ];

    for (const d of defs) this.cells.set(d.id, new LangNeuralCell(d));
  }

  process(text) {
    if (typeof text !== 'string') return { error: 'نص مطلوب' };
    const activations = {};
    let total = 0;
    for (const [id, cell] of this.cells) {
      activations[id] = cell.fire(text);
      total += cell.activation;
    }
    const avg = total / this.cells.size;
    const layers = this._layerSummary();
    this.emit('processed', { text: text.slice(0, 40), avg: +avg.toFixed(3) });
    return {
      schema: SCHEMA, tawheed: TAWHEED,
      avgActivation: +avg.toFixed(3),
      dominant: this._dominant(),
      layers,
      totalCells: this.cells.size,
    };
  }

  _dominant() {
    let max = -1, dom = null;
    for (const [,c] of this.cells) if (c.activation > max) { max = c.activation; dom = c.nameAr; }
    return dom;
  }

  _layerSummary() {
    const m = {};
    for (const [,c] of this.cells) {
      if (!m[c.layer]) m[c.layer] = { count:0, total:0 };
      m[c.layer].count++; m[c.layer].total += c.activation;
    }
    return Object.fromEntries(Object.entries(m).map(([k,v]) => [k, { count:v.count, avg: +(v.total/v.count).toFixed(3) }]));
  }

  getStatus() {
    return { nameAr: this.nameAr, totalCells: this.cells.size, layers: this._layerSummary(), tawheed: TAWHEED };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// § 7 — المحرك الرئيسي الجامع
// ═══════════════════════════════════════════════════════════════════════════

class SheikhaArabicGrammarRules extends EventEmitter {

  constructor() {
    super();
    this.name      = 'Sheikha Arabic Grammar Rules Engine';
    this.nameAr    = 'منظومة قواعد اللغة العربية الرقمية — شيخة';
    this.version   = '1.0.0';
    this.schema    = SCHEMA;
    this.tawheed   = TAWHEED;
    this.bismillah = BISMILLAH;
    this.startedAt = new Date().toISOString();

    this.zaman    = ZAMAN;
    this.awamil   = AWAMIL;
    this.qawaid   = QAWAID_ARABIA;
    this.mapping  = ARABIC_IS_PROGRAMMING;
    this.iraab    = FullIraabEngine;
    this.network  = new ArabicGrammarNeuralNetwork();

    console.log(`\n${this.bismillah}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ منظومة قواعد اللغة العربية الرقمية — شيخة           ');
    console.log(`  ⏰ الزمن: ماضٍ + حاضر + مستقبل — ${Object.keys(this.zaman).filter(k=>k!=='nameAr'&&k!=='quranRef'&&k!=='hadithRef'&&k!=='MAPPING_TABLE').length} أنظمة زمنية`);
    console.log(`  ⚙️  العوامل: ${Object.values(this.awamil).filter(v=>v?.awamil).reduce((s,v)=>s+v.awamil.length,0)} عاملاً إعرابياً`);
    console.log(`  📋 القواعد: ${Object.values(this.qawaid).filter(Array.isArray).reduce((s,v)=>s+v.length,0)} قاعدة رقمية`);
    console.log(`  🔗 التطابق: ${this.mapping.COMPLETE_MAPPING.length} تطابقاً عربي↔برمجي`);
    console.log(`  🧠 الشبكة: ${this.network.cells.size} خلية عصبية`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }

  /** إعراب جملة كاملة مع الزمن والعوامل */
  analyze(sentence) {
    this.emit('request', { type: 'analyze', sentence: sentence?.slice(0, 80) });
    const result = FullIraabEngine.analyze(sentence);
    return this._wrap('full_analysis', result);
  }

  /** تصريف فعل في كل الأزمنة */
  conjugate(root) {
    this.emit('request', { type: 'conjugate', root });
    const result = FullIraabEngine.conjugateFull(root);
    return this._wrap('conjugation', result);
  }

  /** استعلام الزمن */
  getZaman(tense) {
    const map = { past:'MADI', present:'HADIR', future:'MUSTAQBAL', ماضٍ:'MADI', حاضر:'HADIR', مستقبل:'MUSTAQBAL' };
    const key = map[tense] || tense;
    return this._wrap('zaman', this.zaman[key] || { error: `الزمن "${tense}" غير معروف`, available: Object.keys(map) });
  }

  /** استعلام العوامل */
  getAwamil(type) {
    const map = { rafi:'RAFI_AWAMIL', nasib:'NASIB_AWAMIL', jarr:'JARR_AWAMIL', jazm:'JAZIM_AWAMIL', mahal:'IRAAB_MAHAL' };
    const key = map[type] || type;
    return this._wrap('awamil', this.awamil[key] || { error: `النوع "${type}" غير معروف`, available: Object.keys(map) });
  }

  /** البحث في جدول التطابق العربي-البرمجي */
  findMapping(term) {
    const results = this.mapping.COMPLETE_MAPPING.filter(m =>
      m.arabic.includes(term) || m.programming.toLowerCase().includes(term.toLowerCase())
    );
    return this._wrap('mapping', { term, results, total: results.length });
  }

  /** قواعد البرمجة المُعرَّبة */
  getProgrammingRules() {
    return this._wrap('programming_rules', this.mapping.PROGRAMMING_IN_ARABIC);
  }

  /** شبكة عصبية */
  processNeural(text) {
    const result = this.network.process(text);
    return this._wrap('neural', result);
  }

  /** حالة المحرك */
  status() {
    return {
      schema: this.schema, tawheed: this.tawheed, name: this.nameAr,
      version: this.version, startedAt: this.startedAt,
      stats: {
        zamanTypes:    3,
        awamilCount:   Object.values(this.awamil).filter(v=>v?.awamil).reduce((s,v)=>s+v.awamil.length,0),
        qawidaRules:   Object.values(this.qawaid).filter(Array.isArray).reduce((s,v)=>s+v.length,0),
        mappings:      this.mapping.COMPLETE_MAPPING.length,
        progRules:     this.mapping.PROGRAMMING_IN_ARABIC.rules.length,
        neuralCells:   this.network.cells.size,
        neuralLayers:  Object.keys(this.network._layerSummary()).length,
      },
    };
  }

  _wrap(type, data) {
    return {
      schema: this.schema, tawheed: this.tawheed, bismillah: this.bismillah,
      type, data, seal: 'والله أعلم وبالله التوفيق', timestamp: new Date().toISOString(),
    };
  }
}

// ─── التصدير ──────────────────────────────────────────────────────────────────

const engine = new SheikhaArabicGrammarRules();

module.exports = {
  TAWHEED, BISMILLAH, SCHEMA,
  ZAMAN, AWAMIL, QAWAID_ARABIA, ARABIC_IS_PROGRAMMING,
  FullIraabEngine, LangNeuralCell, ArabicGrammarNeuralNetwork,
  SheikhaArabicGrammarRules,
  engine,
  analyze:            s => engine.analyze(s),
  conjugate:          r => engine.conjugate(r),
  getZaman:           t => engine.getZaman(t),
  getAwamil:          t => engine.getAwamil(t),
  findMapping:        t => engine.findMapping(t),
  getProgrammingRules: () => engine.getProgrammingRules(),
  processNeural:      t => engine.processNeural(t),
  status:             () => engine.status(),
};
