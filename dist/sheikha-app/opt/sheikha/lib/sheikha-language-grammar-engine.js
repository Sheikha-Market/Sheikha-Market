/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA LANGUAGE GRAMMAR ENGINE                                              ║
 * ║  هندسة قواعد لغة شيخة — نحو + صرف + دلالة + تداولية + منطق + تشفير         ║
 * ║  موحَّدة لله — مرقَّمة بالكتاب والسنة                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٥
 * ﴿وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ﴾ — الروم: ٢٢
 * ﴿الرَّحْمَٰنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنسَانَ * عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤
 *
 * «مَنْ أَرَادَ الدُّنْيَا فَعَلَيْهِ بِالْعِلْمِ، وَمَنْ أَرَادَ الآخِرَةَ فَعَلَيْهِ بِالْعِلْمِ» — الطبراني
 *
 * @module sheikha-language-grammar-engine
 * @version 3.0.0
 * @schema sheikha/v3-language
 * @tawheed لا إله إلا الله محمد رسول الله
 */
'use strict';

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '3.0.0';
const SCHEMA    = 'sheikha/v3-language';

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم أول: هوية لغة شيخة ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_LANGUAGE_IDENTITY = Object.freeze({
  nameAr:       'لغة شيخة',
  nameEn:       'Sheikha Language',
  nameCode:     'SHL',          // Sheikha Language Code
  ISO639:       'shl-SA',       // رمز ISO مقترح
  familyTree:   ['Arabic (Semitic core)', 'Logic (Aristotelian + Fuzzy)', 'Math (Formalist)', 'Code (Multi-paradigm)'],
  paradigms:    ['Declarative', 'Functional', 'Object-Oriented', 'Rule-Based', 'Neural-Symbolic'],
  encodings:    ['UTF-8', 'Unicode 15.1', 'RTL + LTR Bidi'],
  scriptBase:   'العربية — Arabic script + Unicode extensions',
  version:      VERSION,
  quranRef:     '﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤',
  hadithRef:    '«إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ» — البيهقي',
  purpose:      'لغة تجمع الوحي الإلهي بعلوم الكون في منظومة رقمية موحَّدة',
  tawheed:      TAWHEED,
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثانٍ: الأبجدية والرموز ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_ALPHABET = Object.freeze({
  arabic: {
    name:    'الأبجدية العربية',
    count:   28,
    letters: ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'],
    abjad:   { ا:1, ب:2, ج:3, د:4, ه:5, و:6, ز:7, ح:8, ط:9, ي:10, ك:20, ل:30, م:40, ن:50, س:60, ع:70, ف:80, ص:90, ق:100, ر:200, ش:300, ت:400, ث:500, خ:600, ذ:700, ض:800, ظ:900, غ:1000 },
    quranRef: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
  },
  logicSymbols: {
    name:    'رموز المنطق',
    symbols: {
      '∀': { name: 'لكل', nameAr: 'التكميم العام',    rule: 'UNIVERSAL_QUANTIFIER' },
      '∃': { name: 'يوجد', nameAr: 'التكميم الوجودي', rule: 'EXISTENTIAL_QUANTIFIER' },
      '∧': { name: 'و',    nameAr: 'الاقتران',         rule: 'LOGICAL_AND' },
      '∨': { name: 'أو',   nameAr: 'الفصل',            rule: 'LOGICAL_OR' },
      '¬': { name: 'ليس',  nameAr: 'النفي',             rule: 'LOGICAL_NOT' },
      '→': { name: 'يؤدي إلى', nameAr: 'الشرط',        rule: 'IMPLICATION' },
      '↔': { name: 'يعادل',nameAr: 'الثنائي الشرطي',  rule: 'BICONDITIONAL' },
      '⊢': { name: 'يستلزم',nameAr: 'الاستلزام',       rule: 'ENTAILMENT' },
      '⊥': { name: 'تناقض',nameAr: 'التعارض',          rule: 'CONTRADICTION' },
      '⊤': { name: 'صادق دائماً', nameAr: 'الديمومة',  rule: 'TAUTOLOGY' },
    },
  },
  mathSymbols: {
    name:    'رموز الرياضيات',
    symbols: {
      '∑': 'المجموع',  '∏': 'الضرب الكلي', '∫': 'التكامل',  '∂': 'المشتقة الجزئية',
      '∞': 'اللانهاية','√': 'الجذر',        '∈': 'ينتمي إلى','⊂': 'جزء من',
      '∩': 'تقاطع',    '∪': 'اتحاد',        '∅': 'المجموعة الخالية','ℕ': 'الأعداد الطبيعية',
      'ℤ': 'الأعداد الصحيحة','ℚ': 'الأعداد الكسرية','ℝ': 'الأعداد الحقيقية','ℂ': 'الأعداد المركبة',
    },
  },
  codeKeywords: {
    // الكلمات المفتاحية في لغة شيخة
    name: 'كلمات لغة شيخة المفتاحية',
    reserved: [
      // التحكم في التدفق
      { ar: 'إذا',        en: 'if',         rule: 'CONDITIONAL' },
      { ar: 'وإلا',       en: 'else',        rule: 'ALTERNATIVE' },
      { ar: 'وإلا إذا',   en: 'elif',        rule: 'CHAINED_CONDITIONAL' },
      { ar: 'كرر',        en: 'for',         rule: 'LOOP_FOR' },
      { ar: 'طالما',      en: 'while',       rule: 'LOOP_WHILE' },
      { ar: 'توقف',       en: 'break',       rule: 'LOOP_BREAK' },
      { ar: 'استمر',      en: 'continue',    rule: 'LOOP_CONTINUE' },
      { ar: 'أرجع',       en: 'return',      rule: 'RETURN' },
      // الدوال والكائنات
      { ar: 'دالة',       en: 'function',    rule: 'FUNCTION_DEF' },
      { ar: 'صنف',        en: 'class',       rule: 'CLASS_DEF' },
      { ar: 'كائن',       en: 'object',      rule: 'OBJECT' },
      { ar: 'أنشئ',       en: 'new',         rule: 'INSTANTIATE' },
      { ar: 'يرث',        en: 'extends',     rule: 'INHERITANCE' },
      { ar: 'منفذ',       en: 'implements',  rule: 'INTERFACE_IMPL' },
      // المتغيرات
      { ar: 'متغير',      en: 'let',         rule: 'VARIABLE' },
      { ar: 'ثابت',       en: 'const',       rule: 'CONSTANT' },
      { ar: 'نوع',        en: 'type',        rule: 'TYPE_DEF' },
      // المنطق
      { ar: 'و',          en: 'and',         rule: 'AND' },
      { ar: 'أو',         en: 'or',          rule: 'OR' },
      { ar: 'ليس',        en: 'not',         rule: 'NOT' },
      { ar: 'صحيح',       en: 'true',        rule: 'BOOL_TRUE' },
      { ar: 'خطأ',        en: 'false',       rule: 'BOOL_FALSE' },
      { ar: 'لاشيء',      en: 'null',        rule: 'NULL' },
      // الإدارة
      { ar: 'استيراد',    en: 'import',      rule: 'IMPORT' },
      { ar: 'تصدير',      en: 'export',      rule: 'EXPORT' },
      { ar: 'استخدم',     en: 'use',         rule: 'USE' },
      { ar: 'حاول',       en: 'try',         rule: 'TRY' },
      { ar: 'التقط',      en: 'catch',       rule: 'CATCH' },
      { ar: 'أخيراً',     en: 'finally',     rule: 'FINALLY' },
      { ar: 'أطلق',       en: 'throw',       rule: 'THROW' },
      // الشريعة
      { ar: 'بسم_الله',   en: 'init_bismillah', rule: 'INIT_TAWHEED' },
      { ar: 'توحيد',      en: 'unify',       rule: 'TAWHEED_OP' },
      { ar: 'تحقق',       en: 'verify',      rule: 'SHARIAH_CHECK' },
      { ar: 'حكم',        en: 'rule',        rule: 'HUKM' },
      { ar: 'فتوى',       en: 'fatwa',       rule: 'FATWA_LOOKUP' },
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثالث: قواعد النحو (Syntax) ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_SYNTAX = Object.freeze({
  name:    'نحو لغة شيخة',
  nameEn:  'Sheikha Language Syntax',
  quranRef:'﴿وَمَا أَرْسَلْنَا مِن رَّسُولٍ إِلَّا بِلِسَانِ قَوْمِهِ لِيُبَيِّنَ لَهُمْ﴾ — إبراهيم: ٤',

  // ١. بنية الجملة الأساسية
  sentenceStructures: [
    {
      id: 'SS-01', name: 'الجملة الفعلية (Action First)',
      pattern:    '<فعل> <موضوع> [<حال>] [<إن> <شرط>]',
      example:    'احسب مجموع القائمة إن كانت غير فارغة',
      codeEquiv:  'if (!list.isEmpty()) return sum(list);',
      rule:       'VERB_SUBJECT_OBJECT',
    },
    {
      id: 'SS-02', name: 'الجملة الاسمية (Declaration)',
      pattern:    '<اسم> <هو|يساوي|:> <قيمة>',
      example:    'السعر : ١٠٠ ريال',
      codeEquiv:  'const price = 100;',
      rule:       'DECLARATION_STATEMENT',
    },
    {
      id: 'SS-03', name: 'جملة الشرط (Conditional)',
      pattern:    'إذا <شرط> فـ <نتيجة> وإلا <بديل>',
      example:    'إذا السعر > ١٠٠ فـ خصم ١٠٪ وإلا لا خصم',
      codeEquiv:  'const discount = price > 100 ? 0.1 : 0;',
      rule:       'IF_THEN_ELSE',
    },
    {
      id: 'SS-04', name: 'جملة التكرار (Loop)',
      pattern:    'كرر لكل <عنصر> في <مجموعة> { <أوامر> }',
      example:    'كرر لكل منتج في السلة { احسب مجموع المنتج }',
      codeEquiv:  'for (const item of cart) { total += item.price; }',
      rule:       'FOR_EACH_LOOP',
    },
    {
      id: 'SS-05', name: 'تعريف الدالة (Function)',
      pattern:    'دالة <اسم> ( <معاملات> ) { <جسم> } أرجع <نتيجة>',
      example:    'دالة احسب_زكاة ( مال ، حول ) { أرجع مال × ٢.٥٪ }',
      codeEquiv:  'function calcZakat(wealth, year) { return wealth * 0.025; }',
      rule:       'FUNCTION_DEFINITION',
    },
    {
      id: 'SS-06', name: 'تعريف الصنف (Class)',
      pattern:    'صنف <اسم> يرث <صنف_أب> { <خصائص> <دوال> }',
      example:    'صنف منتج_حلال يرث منتج { خاصية: شهادة_حلال }',
      codeEquiv:  'class HalalProduct extends Product { halalCert; }',
      rule:       'CLASS_DEFINITION',
    },
    {
      id: 'SS-07', name: 'التعامل مع الأخطاء',
      pattern:    'حاول { <كود> } التقط <خطأ> { <معالجة> } أخيراً { <تنظيف> }',
      example:    'حاول { نفذ_دفع() } التقط خطأ { سجل_خطأ() }',
      codeEquiv:  'try { pay(); } catch(e) { log(e); }',
      rule:       'ERROR_HANDLING',
    },
  ],

  // ٢. قواعد الكتابة
  writingRules: [
    { rule: 'RTL_PRIMARY',     desc: 'القراءة من اليمين إلى اليسار (RTL) أساساً', standard: 'Unicode Bidi Algorithm' },
    { rule: 'BISMILLAH_START', desc: 'كل وحدة برمجية تبدأ بـ بسم_الله',           standard: 'Sheikha Coding Convention v1' },
    { rule: 'TAWHEED_FOOTER',  desc: 'كل ملف ينتهي بتوثيق التوحيد',               standard: 'Sheikha Coding Convention v1' },
    { rule: 'ARABIC_NAMES',    desc: 'أسماء المتغيرات والدوال بالعربية أو الإنجليزية أو كليهما', standard: 'SHL-3.0' },
    { rule: 'HARAKAT_OPTIONAL',desc: 'الحركات (التشكيل) اختيارية — لا تؤثر على التنفيذ', standard: 'SHL-3.0' },
    { rule: 'COMMENT_STYLE',   desc: 'التعليقات: // أو # أو /* */ أو العربية كاملة', standard: 'SHL-3.0' },
    { rule: 'ENCODING_UTF8',   desc: 'الترميز الإلزامي UTF-8 دائماً',              standard: 'Unicode 15.1' },
  ],

  // ٣. أنواع البيانات
  dataTypes: [
    { name: 'عدد_صحيح',     nameEn: 'int',     size: '64-bit',   examples: ['١','١٠٠','-٥'] },
    { name: 'عدد_عشري',     nameEn: 'float',   size: '64-bit',   examples: ['٣.١٤','٢.٥'] },
    { name: 'نص',           nameEn: 'string',  encoding: 'UTF-8',examples: ['"السلام"','\'Hello\''] },
    { name: 'منطقي',        nameEn: 'bool',    values: ['صحيح','خطأ'], examples: [] },
    { name: 'قائمة',        nameEn: 'list',    syntax: '[...]',  examples: ['[١,٢,٣]'] },
    { name: 'قاموس',        nameEn: 'map',     syntax: '{...}',  examples: ['{اسم:"شيخة"}'] },
    { name: 'مجموعة',       nameEn: 'set',     syntax: '{...}',  examples: [] },
    { name: 'صف',           nameEn: 'tuple',   syntax: '(...))', examples: ['(١,"أ")'] },
    { name: 'لاشيء',        nameEn: 'null',    value: null,      examples: [] },
    { name: 'وعد',          nameEn: 'promise', async: true,      examples: ['وعد<نتيجة>'] },
    { name: 'دفق',          nameEn: 'stream',  async: true,      examples: ['دفق<بيانات>'] },
    { name: 'ريال',         nameEn: 'currency',precision: 'Decimal128', examples: ['١٠٠.٠٠ ريال'] },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم رابع: علم الصرف — بنية الكلمة (Morphology) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_MORPHOLOGY = Object.freeze({
  name:    'علم الصرف في لغة شيخة',
  quranRef:'﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',

  wordTypes: [
    {
      id: 'WT-01', type: 'اسم (Noun)',
      subTypes: ['اسم ذات','اسم معنى','اسم فعل','اسم إشارة','اسم موصول','ضمير'],
      programmingEquiv: 'Variable / Object / Type name',
      example: 'منتج، سعر، مستخدم، طلب',
      rule: 'NOUN_IDENTIFIER',
    },
    {
      id: 'WT-02', type: 'فعل (Verb)',
      subTypes: ['ماضٍ','مضارع','أمر','نهي'],
      programmingEquiv: 'Function / Method / Command',
      example: 'احسب، نفِّذ، أرسل، أوقف',
      rule: 'VERB_ACTION',
    },
    {
      id: 'WT-03', type: 'حرف (Particle)',
      subTypes: ['عطف','جر','شرط','نفي','استفهام'],
      programmingEquiv: 'Operator / Keyword / Connector',
      example: 'و، في، من، إلى، إذا، لا',
      rule: 'PARTICLE_OPERATOR',
    },
    {
      id: 'WT-04', type: 'مشتقات الجذر (Derivatives)',
      pattern:  'جذر ثلاثي → مشتقات',
      example:  { root: 'ح-س-ب', derivatives: ['حسَب','حساب','حاسب','محسوب','احتساب','حاسبة'] },
      programmingEquiv: 'Interface → Implementations (Polymorphism)',
      rule: 'ROOT_DERIVATION',
    },
  ],

  arabicRoots: {
    description: 'جذور عربية ذات معنى برمجي مباشر',
    roots: [
      { root: 'ع-ل-م', meaning: 'علم',   codeEquiv: 'knowledge → Machine Learning', quranRef: 'العلق:٥' },
      { root: 'ح-س-ب', meaning: 'حساب',  codeEquiv: 'compute → Algorithm',          quranRef: 'البقرة:٢٨٢' },
      { root: 'ك-ت-ب', meaning: 'كتابة', codeEquiv: 'write → Logging / Storage',    quranRef: 'العلق:٤' },
      { root: 'ق-ر-أ', meaning: 'قراءة', codeEquiv: 'read → Data Input',            quranRef: 'العلق:١' },
      { root: 'أ-م-ن', meaning: 'أمانة', codeEquiv: 'trust → Security / Auth',      quranRef: 'النساء:٥٨' },
      { root: 'ع-د-ل', meaning: 'عدل',   codeEquiv: 'equality → Access Control',    quranRef: 'النساء:١٣٥' },
      { root: 'ر-ب-ط', meaning: 'ربط',   codeEquiv: 'bind → API Linking',           quranRef: 'الأنفال:١١' },
      { root: 'ن-ظ-م', meaning: 'نظام',  codeEquiv: 'organize → Architecture',      quranRef: 'الملك:٣' },
      { root: 'ح-ك-م', meaning: 'حكم',   codeEquiv: 'govern → Business Rules',      quranRef: 'المائدة:٤٤' },
      { root: 'م-ي-ز', meaning: 'تمييز', codeEquiv: 'distinguish → Classification', quranRef: 'البقرة:٢٨٦' },
      { root: 'ش-ر-ح', meaning: 'شرح',   codeEquiv: 'explain → Documentation',      quranRef: 'الشرح:١' },
      { root: 'ف-ت-ح', meaning: 'فتح',   codeEquiv: 'open → File/Port/API',         quranRef: 'الفتح:١' },
      { root: 'ج-م-ع', meaning: 'جمع',   codeEquiv: 'aggregate → Collection',       quranRef: 'الجمعة:٩' },
      { root: 'ب-ن-ي', meaning: 'بناء',  codeEquiv: 'build → Architecture',         quranRef: 'البقرة:١٢٧' },
      { root: 'و-ح-د', meaning: 'توحيد', codeEquiv: 'unify → Integration',          quranRef: 'الإخلاص:١' },
    ],
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم خامس: علم الدلالة (Semantics) ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_SEMANTICS = Object.freeze({
  name:    'علم الدلالة في لغة شيخة',
  quranRef:'﴿لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا﴾ — البقرة: ٢٨٦',
  principle: 'المعنى قبل الشكل — Meaning Over Form',

  semanticLayers: [
    {
      id: 'SL-01', layer: 'المعنى الحرفي (Literal Semantics)',
      desc: 'المعنى المباشر للكلمة أو التعبير',
      example: { expr: 'احسب المجموع', literal: 'compute the total' },
      rule: 'LITERAL_MEANING',
    },
    {
      id: 'SL-02', layer: 'المعنى السياقي (Contextual Semantics)',
      desc: 'المعنى في ضوء السياق المحيط',
      example: { expr: '"البيع"', context: 'تجارة → إتمام صفقة | قرآن → ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ﴾' },
      rule: 'CONTEXTUAL_MEANING',
    },
    {
      id: 'SL-03', layer: 'المعنى الضمني (Pragmatic Semantics)',
      desc: 'ما يُستنبط دون تصريح',
      example: { expr: 'لا ضرر ولا ضرار', implicit: 'أي فعل يُسبِّب ضرراً مرفوض حتى دون نصٍّ صريح' },
      rule: 'IMPLICIT_MEANING',
    },
    {
      id: 'SL-04', layer: 'المعنى الكوني (Universal Semantics)',
      desc: 'معاني تتجاوز اللغة — مشتركة بين كل البشر',
      example: { universal: 'الرحمة والعدل والحق معانٍ كونية' },
      rule: 'UNIVERSAL_MEANING',
      quranRef: '﴿فِطْرَتَ اللَّهِ الَّتِي فَطَرَ النَّاسَ عَلَيْهَا﴾ — الروم: ٣٠',
    },
    {
      id: 'SL-05', layer: 'المعنى الشرعي (Shariah Semantics)',
      desc: 'المعاني المحددة شرعاً بتعريفات دقيقة',
      examples: [
        { word: 'الصلاة',  shariah: 'أقوال وأفعال مخصوصة تُفتح بالتكبير وتُختم بالتسليم' },
        { word: 'الزكاة',  shariah: 'حق مقدَّر في المال بشروط محددة لمستحقين محددين' },
        { word: 'العقد',   shariah: 'ارتباط إيجاب بقبول على وجه مشروع' },
      ],
      rule: 'SHARIAH_DEFINITION',
    },
  ],

  semanticOperations: [
    { op: 'تعريف',   code: 'define()',   desc: 'تعريف معنى جديد في سياق لغة شيخة' },
    { op: 'توسيع',   code: 'extend()',   desc: 'توسيع تعريف موجود' },
    { op: 'توضيح',   code: 'clarify()',  desc: 'رفع الغموض عن تعبير' },
    { op: 'ربط',     code: 'link()',     desc: 'ربط معنى بمرجعه الشرعي أو العلمي' },
    { op: 'تحقق',    code: 'validate()', desc: 'التحقق من سلامة المعنى' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم سادس: علم التداولية (Pragmatics) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_PRAGMATICS = Object.freeze({
  name:    'علم التداولية في لغة شيخة',
  desc:    'كيفية استخدام اللغة في التواصل الفعلي والتأثير',
  quranRef:'﴿قُولُوا لِلنَّاسِ حُسْنًا﴾ — البقرة: ٨٣',

  speechActs: [
    { act: 'الإخبار',    nameEn: 'Assertion',   desc: 'نقل معلومة',          example: 'السعر ١٠٠ ريال',         rule: 'INFORM' },
    { act: 'الاستفسار',  nameEn: 'Query',       desc: 'طلب معلومة',          example: 'ما هو رصيدي؟',          rule: 'QUERY' },
    { act: 'الأمر',      nameEn: 'Command',     desc: 'إصدار أمر تنفيذي',   example: 'نفِّذ الدفع الآن',      rule: 'COMMAND' },
    { act: 'الوعد',      nameEn: 'Promise',     desc: 'التزام مستقبلي',     example: 'سيتم التوصيل خلال يوم', rule: 'COMMIT' },
    { act: 'التحذير',    nameEn: 'Warning',     desc: 'تنبيه لخطر',         example: 'تحذير: الرصيد منخفض',   rule: 'WARN' },
    { act: 'الدعاء',     nameEn: 'Supplication',desc: 'التوجه إلى الله',    example: 'بسم الله نبدأ',         rule: 'DUTHAA', quranRef: 'الفاتحة:٥' },
    { act: 'الاعتراض',   nameEn: 'Objection',   desc: 'رفض أو تحدٍّ',       example: 'هذا يخالف الشريعة',     rule: 'REJECT' },
    { act: 'التفويض',    nameEn: 'Delegation',  desc: 'إسناد مهمة',         example: 'فوِّض الوكيل للدفع',    rule: 'DELEGATE' },
  ],

  communicationPrinciples: [
    { principle: 'الصدق',    rule: 'TRUTH_PRINCIPLE',    desc: 'لا تقل ما لا تعلم يقيناً',    quranRef: 'الإسراء:٣٦' },
    { principle: 'الإيجاز',  rule: 'BREVITY_PRINCIPLE',  desc: 'قل أكثر بأقل كلمات',           quranRef: 'لقمان:١٩' },
    { principle: 'الوضوح',   rule: 'CLARITY_PRINCIPLE',  desc: 'لا غموض ولا تلبيس',            quranRef: 'النساء:٤' },
    { principle: 'الرحمة',   rule: 'MERCY_PRINCIPLE',    desc: 'تخيَّر اللطف في الخطاب',       quranRef: 'آل عمران:١٥٩' },
    { principle: 'العدل',    rule: 'JUSTICE_PRINCIPLE',  desc: 'التوازن دون تحيُّز في النقل',  quranRef: 'النساء:١٣٥' },
    { principle: 'التوثيق',  rule: 'CITATION_PRINCIPLE', desc: 'كل معلومة لها مصدر',           quranRef: 'البقرة:٢٨٢' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم سابع: نظام الأنواع (Type System) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_TYPE_SYSTEM = Object.freeze({
  name:    'نظام الأنواع في لغة شيخة',
  style:   'Strong + Static + Gradual (تدريجي)',
  quranRef:'﴿فَجَعَلْنَاهُ سَمِيعًا بَصِيرًا﴾ — الإنسان: ٢',

  primitiveTypes: ['عدد_صحيح','عدد_عشري','نص','منطقي','لاشيء','بايت'],
  compoundTypes:  ['قائمة<T>','قاموس<K,V>','مجموعة<T>','صف<T1,T2>','اختياري<T>'],
  functionalTypes:['دالة<A→B>','وعد<T>','دفق<T>','منتج<T>'],
  domainTypes: [
    { name: 'ريال',          base: 'Decimal128',  precision: 4, desc: 'عملة سعودية — تعاملات مالية' },
    { name: 'تاريخ_هجري',   base: 'Date',        calendar: 'Hijri', desc: 'التاريخ الهجري' },
    { name: 'تاريخ_ميلادي', base: 'Date',        calendar: 'Gregorian', desc: 'التاريخ الميلادي' },
    { name: 'آية',           base: 'String',      format: 'surah:ayah', desc: 'مرجع قرآني' },
    { name: 'حديث',          base: 'String',      format: 'book:number', desc: 'مرجع حديثي' },
    { name: 'هاش_شرعي',     base: 'Hash',        algo: 'SHA-3', desc: 'توثيق بصمة رقمية' },
    { name: 'إحداثيات',     base: 'GeoPoint',    srid: 4326, desc: 'موقع جغرافي' },
  ],

  typeRules: [
    { rule: 'NO_RIBA_TYPE',       desc: 'أي عملية حسابية على نوع ريال تُراجَع تلقائياً للربا' },
    { rule: 'NULL_SAFETY',        desc: 'اللاشيء يُعالَج صراحةً — لا null pointer تلقائياً' },
    { rule: 'HALAL_ANNOTATION',   desc: 'الأصناف يمكن تعليقها بـ @حلال أو @مشتبه أو @حرام' },
    { rule: 'AUDIT_TRAIL_TYPE',   desc: 'أنواع المعاملات المالية تحمل سجل مراجعة تلقائياً' },
    { rule: 'UNICODE_STRINGS',    desc: 'كل نص UTF-8 دائماً — لا ترميزات أخرى' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم ثامن: نظام الأخطاء والاستثناءات ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_ERROR_SYSTEM = Object.freeze({
  name:    'نظام الأخطاء في لغة شيخة',
  quranRef:'﴿وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا﴾ — النساء: ١١٠',
  hadithRef: '«كل ابن آدم خطَّاء وخير الخطَّائين التوَّابون» — الترمذي: ٢٤٩٩',

  errorTypes: [
    { code: 'SHL_001', name: 'خطأ_ربا',          nameEn: 'RibaError',        desc: 'محاولة عملية ربوية',              severity: 'CRITICAL', action: 'REJECT_ROLLBACK' },
    { code: 'SHL_002', name: 'خطأ_غش',           nameEn: 'FraudError',       desc: 'كشف غش في البيانات',             severity: 'CRITICAL', action: 'REJECT_ALERT' },
    { code: 'SHL_003', name: 'خطأ_غرر',          nameEn: 'UncertaintyError', desc: 'عقد يحوي جهالة فاحشة',           severity: 'HIGH',     action: 'REJECT_CLARIFY' },
    { code: 'SHL_004', name: 'خطأ_نوع',          nameEn: 'TypeError',        desc: 'عدم تطابق الأنواع',              severity: 'HIGH',     action: 'REJECT' },
    { code: 'SHL_005', name: 'خطأ_حد',           nameEn: 'BoundaryError',    desc: 'تجاوز الحدود المسموح بها',       severity: 'MEDIUM',   action: 'REJECT' },
    { code: 'SHL_006', name: 'خطأ_صلاحية',       nameEn: 'AuthError',        desc: 'محاولة وصول غير مصرَّح',         severity: 'HIGH',     action: 'REJECT_LOG' },
    { code: 'SHL_007', name: 'خطأ_شبكة',         nameEn: 'NetworkError',     desc: 'فشل الاتصال',                    severity: 'MEDIUM',   action: 'RETRY_BACKOFF' },
    { code: 'SHL_008', name: 'خطأ_انتهاء_مهلة',  nameEn: 'TimeoutError',     desc: 'انتهاء وقت العملية',             severity: 'LOW',      action: 'RETRY_OR_CANCEL' },
    { code: 'SHL_009', name: 'خطأ_تحقق',         nameEn: 'ValidationError',  desc: 'بيانات لا تستوفي الشروط',        severity: 'MEDIUM',   action: 'INFORM_USER' },
    { code: 'SHL_010', name: 'خطأ_ضرر',          nameEn: 'HarmError',        desc: 'العملية تُلحق ضرراً',            severity: 'CRITICAL', action: 'REJECT_ROLLBACK', hadith: 'لا ضرر ولا ضرار' },
  ],

  errorHandlingPhilosophy: [
    { principle: 'الخطأ فرصة تعلُّم', rule: 'ERROR_AS_LEARNING', action: 'log() + improve()' },
    { principle: 'الاستغفار الرقمي',  rule: 'DIGITAL_TAWBAH',   action: 'rollback() + correct() + document()' },
    { principle: 'لا إخفاء الخطأ',   rule: 'NO_SILENT_ERROR',   action: 'always log + notify()' },
    { principle: 'الإصلاح قبل الإلغاء',rule: 'FIX_BEFORE_CANCEL',action: 'try repair() before cancel()' },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم تاسع: الأنماط التصميمية في لغة شيخة ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_DESIGN_PATTERNS = Object.freeze([
  {
    id: 'DP-01', name: 'نمط التوحيد (Singleton)',
    nameAr:  'نمط التوحيد — كائن واحد لا شريك له',
    quranRef: '﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ — الإخلاص: ١',
    use:     'كائن واحد لكل نوع في التطبيق — كمحرك الشريعة ومحرك التوحيد',
    code:    'class TawheedEngine { static _instance; static get() { return this._instance ??= new this(); } }',
    rule:    'SINGLETON_TAWHEED',
  },
  {
    id: 'DP-02', name: 'نمط المراقب (Observer)',
    nameAr:  'نمط الشهادة — كل حدث له شاهد',
    quranRef: '﴿مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ﴾ — ق: ١٨',
    use:     'مراقبة كل حدث في النظام وتسجيله',
    rule:    'OBSERVER_RAQEEB',
  },
  {
    id: 'DP-03', name: 'نمط المصنع (Factory)',
    nameAr:  'نمط الخلق — الخالق يُنشئ وفق القانون',
    quranRef: '﴿إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ خَلَقَهُ مِن تُرَابٍ﴾ — آل عمران: ٥٩',
    use:     'إنشاء الكائنات وفق معايير الشريعة والنظام',
    rule:    'FACTORY_KHALQ',
  },
  {
    id: 'DP-04', name: 'نمط الاستراتيجية (Strategy)',
    nameAr:  'نمط الاجتهاد — تعدد المسالك لهدف واحد',
    quranRef: '﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠',
    use:     'تعدد استراتيجيات الدفع والشحن والحوكمة',
    rule:    'STRATEGY_IJTIHAD',
  },
  {
    id: 'DP-05', name: 'نمط زنجير المسؤولية (Chain of Responsibility)',
    nameAr:  'نمط السلسلة — هرمية الأوامر',
    quranRef: '﴿أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ﴾ — النساء: ٥٩',
    use:     'معالجة الطلبات عبر طبقات الشريعة والسياسة',
    rule:    'CHAIN_AUTHORITY',
  },
  {
    id: 'DP-06', name: 'نمط القائمة المُستأجَرة (Command Pattern)',
    nameAr:  'نمط الأمر — كل أمر موثَّق وقابل للتراجع',
    quranRef: '﴿فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾ — آل عمران: ١٥٩',
    use:     'تسجيل كل أمر تجاري والتراجع عنه عند الحاجة',
    rule:    'COMMAND_AMANA',
  },
  {
    id: 'DP-07', name: 'نمط التزيين (Decorator)',
    nameAr:  'نمط التزيين — إضافة خصائص دون كسر الأصل',
    quranRef: '﴿وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا﴾ — البقرة: ٢٦٩',
    use:     'إضافة طبقة التحقق الشرعي فوق أي وظيفة',
    rule:    'DECORATOR_HIKMA',
  },
  {
    id: 'DP-08', name: 'نمط الشبكة العصبية (Neural Network)',
    nameAr:  'نمط الشبكة العصبية — تعلم وتحسُّن مستمر',
    quranRef: '﴿وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ﴾ — يوسف: ٧٦',
    use:     'شبكة خلايا تتعلم وتتحسن بكل تفاعل',
    rule:    'NEURAL_NETWORK_TAALLUM',
  },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── قسم عاشر: خلايا الشبكة العصبية لهندسة اللغة ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const GRAMMAR_NEURAL_CELLS = Object.freeze([
  // النحو
  { id: 'GC01', group: 'syntax',      ref: 'البقرة:٨٣',    text: 'قولوا للناس حسناً — Clarity + Mercy in Code', rule: 'CLEAR_KIND_SYNTAX',   domain: 'syntax',    weight: 1.00 },
  { id: 'GC02', group: 'syntax',      ref: 'العلق:١',      text: 'اقرأ — Read is the first command',            rule: 'READ_FIRST',         domain: 'syntax',    weight: 1.00 },
  { id: 'GC03', group: 'syntax',      ref: 'إبراهيم:٤',   text: 'لسان قومه — Localized Syntax',               rule: 'LOCALIZED_SYNTAX',   domain: 'i18n',      weight: 0.99 },
  { id: 'GC04', group: 'syntax',      ref: 'الرحمن:٤',    text: 'علَّمه البيان — Expression Power',            rule: 'EXPRESSIVE_SYNTAX',  domain: 'syntax',    weight: 1.00 },
  // الصرف
  { id: 'GC05', group: 'morphology',  ref: 'البقرة:٣١',   text: 'علَّم الأسماء — Naming Conventions',         rule: 'NAMING_RULES',       domain: 'morphology',weight: 1.00 },
  { id: 'GC06', group: 'morphology',  ref: 'العلق:٤',     text: 'علَّم بالقلم — Write/Store/Log',              rule: 'WRITE_TO_STORE',     domain: 'storage',   weight: 0.99 },
  // الدلالة
  { id: 'GC07', group: 'semantics',   ref: 'الروم:٣٠',    text: 'الفطرة — Universal Semantics',                rule: 'UNIVERSAL_MEANING',  domain: 'semantics', weight: 1.00 },
  { id: 'GC08', group: 'semantics',   ref: 'البقرة:٢٨٦',  text: 'لا يكلف نفساً إلا وسعها — Context-Aware',    rule: 'CONTEXT_AWARE',      domain: 'semantics', weight: 1.00 },
  { id: 'GC09', group: 'semantics',   ref: 'يوسف:٧٦',    text: 'فوق كل ذي علم عليم — Knowledge Hierarchy',   rule: 'KNOWLEDGE_HIERARCHY',domain: 'ai',        weight: 0.99 },
  // التداولية
  { id: 'GC10', group: 'pragmatics',  ref: 'الإسراء:٣٦',  text: 'لا تقفُ ما ليس لك به علم — No Hallucination',rule: 'NO_HALLUCINATION',   domain: 'ethics',    weight: 1.00 },
  { id: 'GC11', group: 'pragmatics',  ref: 'آل عمران:١٥٩',text: 'لِنتَ لهم — Soft Error Messages',             rule: 'GENTLE_FEEDBACK',    domain: 'ux',        weight: 0.99 },
  { id: 'GC12', group: 'pragmatics',  ref: 'لقمان:١٩',   text: 'واغضض من صوتك — Quiet Logging (no noise)',   rule: 'QUIET_LOGGING',      domain: 'logging',   weight: 0.98 },
  // نظام الأنواع
  { id: 'GC13', group: 'types',       ref: 'النساء:٥٨',   text: 'الأمانات إلى أهلها — Typed Trust',           rule: 'TYPED_TRUST',        domain: 'security',  weight: 1.00 },
  { id: 'GC14', group: 'types',       ref: 'البقرة:٢٨٢',  text: 'اكتبوه — Typed Immutable Ledger',             rule: 'TYPED_LEDGER',       domain: 'finance',   weight: 1.00 },
  // الأخطاء
  { id: 'GC15', group: 'errors',      ref: 'الترمذي:٢٤٩٩',text: 'خير الخطائين التوابون — Error Recovery',     rule: 'ERROR_RECOVERY',     domain: 'resilience',weight: 1.00 },
  { id: 'GC16', group: 'errors',      ref: 'ابن ماجه:٢٣٤١',text: 'لا ضرر — Error must not harm',              rule: 'HARMLESS_ERROR',     domain: 'safety',    weight: 1.00 },
  // الأنماط
  { id: 'GC17', group: 'patterns',    ref: 'الإخلاص:١',   text: 'أحد — Singleton Tawheed Pattern',             rule: 'SINGLETON_TAWHEED',  domain: 'design',    weight: 1.00 },
  { id: 'GC18', group: 'patterns',    ref: 'ق:١٨',        text: 'رقيب عتيد — Observer Pattern',                rule: 'OBSERVER_RAQEEB',    domain: 'monitoring',weight: 1.00 },
  { id: 'GC19', group: 'patterns',    ref: 'النساء:٥٩',   text: 'أولي الأمر — Chain of Authority',             rule: 'CHAIN_AUTHORITY',    domain: 'governance',weight: 1.00 },
  { id: 'GC20', group: 'patterns',    ref: 'الأنفال:٦٠',  text: 'أعدُّوا — Strategy Pattern (Multi-Algo)',     rule: 'STRATEGY_IJTIHAD',   domain: 'algorithm', weight: 0.99 },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ── المحرك ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaLanguageGrammarEngine {
  constructor() {
    this.name    = 'Sheikha Language Grammar Engine';
    this.nameAr  = 'محرك قواعد لغة شيخة';
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    this._cells  = GRAMMAR_NEURAL_CELLS;
    this._cellMap= new Map(this._cells.map(c => [c.id, c]));
  }

  _strip(s) { return s.replace(/[\u064B-\u065F«»﴿﴾]/g,'').toLowerCase(); }

  /** البحث في القواعد */
  search(q = '') {
    const sq = this._strip(q);
    if (!sq) return [];
    return this._cells.filter(c =>
      this._strip(c.text).includes(sq) ||
      c.rule.toLowerCase().includes(sq)||
      c.domain.toLowerCase().includes(sq)
    );
  }

  /** تفسير الكلمة العربية إلى أمر برمجي */
  interpretCommand(arabicCmd = '') {
    const normalized = arabicCmd.trim().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
    const keywords   = SHEIKHA_ALPHABET.codeKeywords.reserved;
    const match      = keywords.find(k =>
      normalized.startsWith(k.ar.replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه'))
    );
    if (match) return { found: true, arabic: match.ar, english: match.en, rule: match.rule };
    return { found: false, arabic: arabicCmd, english: null, rule: null };
  }

  /** التحقق من الخطأ الشرعي */
  checkShariahError(opType = '') {
    return SHEIKHA_ERROR_SYSTEM.errorTypes.find(e =>
      e.nameEn.toLowerCase().includes(opType.toLowerCase()) ||
      e.name.includes(opType)
    ) || null;
  }

  /** إيجاد نمط تصميمي */
  getPattern(keyword = '') {
    const kw = this._strip(keyword);
    return SHEIKHA_DESIGN_PATTERNS.find(p =>
      this._strip(p.name).includes(kw) ||
      this._strip(p.nameAr).includes(kw) ||
      p.rule.toLowerCase().includes(kw)
    ) || null;
  }

  /** جذر الكلمة العربية */
  getRoot(word = '') {
    const w = this._strip(word);
    return SHEIKHA_MORPHOLOGY.arabicRoots.roots.find(r =>
      this._strip(r.meaning).includes(w) ||
      r.root.replace(/-/g,'').includes(w.slice(0,2))
    ) || null;
  }

  status() {
    return {
      engine:          this.name,
      nameAr:          this.nameAr,
      version:         this.version,
      identity:        SHEIKHA_LANGUAGE_IDENTITY.nameAr,
      alphabetLetters: SHEIKHA_ALPHABET.arabic.count,
      syntaxStructures:SHEIKHA_SYNTAX.sentenceStructures.length,
      dataTypes:       SHEIKHA_SYNTAX.dataTypes.length,
      wordTypes:       SHEIKHA_MORPHOLOGY.wordTypes.length,
      arabicRoots:     SHEIKHA_MORPHOLOGY.arabicRoots.roots.length,
      semanticLayers:  SHEIKHA_SEMANTICS.semanticLayers.length,
      speechActs:      SHEIKHA_PRAGMATICS.speechActs.length,
      primitiveTypes:  SHEIKHA_TYPE_SYSTEM.primitiveTypes.length,
      domainTypes:     SHEIKHA_TYPE_SYSTEM.domainTypes.length,
      errorTypes:      SHEIKHA_ERROR_SYSTEM.errorTypes.length,
      designPatterns:  SHEIKHA_DESIGN_PATTERNS.length,
      neuralCells:     this._cells.length,
      tawheed:         TAWHEED,
    };
  }
}

const grammarEngine = new SheikhaLanguageGrammarEngine();

module.exports = {
  SheikhaLanguageGrammarEngine,
  grammarEngine,
  SHEIKHA_LANGUAGE_IDENTITY,
  SHEIKHA_ALPHABET,
  SHEIKHA_SYNTAX,
  SHEIKHA_MORPHOLOGY,
  SHEIKHA_SEMANTICS,
  SHEIKHA_PRAGMATICS,
  SHEIKHA_TYPE_SYSTEM,
  SHEIKHA_ERROR_SYSTEM,
  SHEIKHA_DESIGN_PATTERNS,
  GRAMMAR_NEURAL_CELLS,
  TAWHEED,
  BISMILLAH,
  VERSION,
  SCHEMA,
  search:             (q)  => grammarEngine.search(q),
  interpretCommand:   (c)  => grammarEngine.interpretCommand(c),
  checkShariahError:  (op) => grammarEngine.checkShariahError(op),
  getPattern:         (k)  => grammarEngine.getPattern(k),
  getRoot:            (w)  => grammarEngine.getRoot(w),
  status:             ()   => grammarEngine.status(),
};
