/**
 * بسم الله الرحمن الرحيم
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA KHULAFA RASHIDEEN NEURAL NETWORK                                    ║
 * ║  شبكة خلايا عصبية سنة الخلفاء الراشدين المهديين                             ║
 * ║  كل خلية = حكمة أو سنة أو منهج = مبدأ برمجي/نظمي موحَّد لله               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * «عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ مِنْ بَعْدِي،
 *   عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ» — أبو داود: ٤٦٠٧ | الترمذي: ٢٦٧٦ | ابن ماجه: ٤٢
 *
 * ﴿وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ وَالَّذِينَ اتَّبَعُوهُم
 *   بِإِحْسَانٍ رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ﴾ — التوبة: ١٠٠
 *
 * الخلفاء الأربعة:
 *   Ⅰ  أبو بكر الصديق   رضي الله عنه  (11-13 هـ)
 *   Ⅱ  عمر بن الخطاب    رضي الله عنه  (13-23 هـ)
 *   Ⅲ  عثمان بن عفان    رضي الله عنه  (23-35 هـ)
 *   Ⅳ  علي بن أبي طالب رضي الله عنه  (35-40 هـ)
 *   Ⅴ  الحكمة المشتركة — المبادئ الجامعة
 *
 * @module sheikha-khulafa-rashideen-neural-network
 * @version 1.0.0
 * @schema sheikha/v2
 * @tawheed لا إله إلا الله محمد رسول الله
 */

'use strict';

const crypto       = require('crypto');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// ── نواة التوحيد ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const SCHEMA    = 'sheikha/v2';
const VERSION   = '1.0.0';

/** الحديث الجامع الآمر باتباع سنة الخلفاء الراشدين */
const HADITH_AL_JAMI = Object.freeze({
  text:   '«عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ مِنْ بَعْدِي، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ»',
  source: 'أبو داود: ٤٦٠٧ | الترمذي: ٢٦٧٦ | ابن ماجه: ٤٢',
  grade:  'صحيح',
  rule:   'FOLLOW_RASHIDEEN_SUNNAH',
  programmingPrinciple: 'أعلى مستوى من Standard Library — يُتَّبع حرفياً كما هو',
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الطبقة I: أبو بكر الصديق رضي الله عنه ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_ABU_BAKR = Object.freeze({
  id:       'I',
  caliph:   'أبو بكر الصديق',
  nameEn:   'Abu Bakr Al-Siddiq',
  titleAr:  'الصدِّيق — أول الخلفاء الراشدين',
  period:   '11-13 هـ | 632-634 م',
  radi:     'رضي الله عنه',
  quranRef: '﴿إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾ — التوبة: ٤٠',

  cells: [
    {
      id: 'AB01', group: 'abu_bakr',
      wisdom: '«أيها الناس، إني قد وُليت عليكم ولست بخيركم، فإن أحسنت فأعينوني، وإن أسأت فقوِّموني»',
      source: 'سيرة ابن هشام',
      rule:   'SERVANT_LEADERSHIP',
      domain: 'governance',
      principle: 'القائد خادم للمستخدم — Servant Leadership Pattern',
      programmingEquiv: 'interface ILeader { serve(); correct(); }  // القيادة خدمة لا استعباد',
      weight: 1.00,
    },
    {
      id: 'AB02', group: 'abu_bakr',
      wisdom: '«أطيعوني ما أطعت الله ورسوله، فإذا عصيت الله ورسوله فلا طاعة لي عليكم»',
      source: 'سيرة ابن هشام',
      rule:   'CONDITIONAL_AUTHORITY',
      domain: 'security',
      principle: 'السلطة مشروطة بالشريعة — Conditional Authorization Token',
      programmingEquiv: 'if (!isCompliantWithShariah(command)) { revokeAuthority(); }',
      weight: 1.00,
    },
    {
      id: 'AB03', group: 'abu_bakr',
      wisdom: 'جمع القرآن الكريم في مصحف واحد بعد معركة اليمامة',
      source: 'البخاري: ٤٩٨٦',
      rule:   'CRITICAL_BACKUP',
      domain: 'storage',
      principle: 'النسخ الاحتياطي الفوري عند الخطر — Emergency Backup Trigger',
      programmingEquiv: 'onCriticalEvent(() => consolidateAndBackup(CANONICAL_SOURCE));',
      weight: 0.99,
    },
    {
      id: 'AB04', group: 'abu_bakr',
      wisdom: 'ثباته يوم وفاة النبي ﷺ وقوله: «من كان يعبد محمداً فإن محمداً قد مات، ومن كان يعبد الله فإن الله حي لا يموت»',
      source: 'البخاري: ١٢٤١',
      rule:   'GRACEFUL_DEGRADATION',
      domain: 'resilience',
      principle: 'التعامل مع وفاة المكوِّن الرئيسي — Graceful Degradation + Single Point of Truth',
      programmingEquiv: 'onPrimaryFailure(() => { separateDependencyFromSource(); continueWithTruth(); });',
      weight: 0.99,
    },
    {
      id: 'AB05', group: 'abu_bakr',
      wisdom: 'محاربة مانعي الزكاة — «والله لو منعوني عِقالاً كانوا يؤدونه إلى رسول الله ﷺ لقاتلتهم عليه»',
      source: 'البخاري: ١٣٩٩',
      rule:   'ZERO_TOLERANCE_CONTRACT',
      domain: 'contracts',
      principle: 'الوفاء بالعقد الكامل — Zero-Tolerance Smart Contract',
      programmingEquiv: 'enforceContractFully({ noPartialCompliance: true, threshold: 100 });',
      weight: 0.99,
    },
    {
      id: 'AB06', group: 'abu_bakr',
      wisdom: 'المبادرة الفورية بتجهيز جيش أسامة رغم الفتن — إتمام ما بدأه النبي ﷺ',
      source: 'سيرة ابن هشام',
      rule:   'COMPLETE_COMMITTED_TASK',
      domain: 'ops',
      principle: 'إكمال المهمة المُبدأة — Complete Committed Transaction',
      programmingEquiv: 'async function executeCommittedMission() { await completeRegardlessOfCircumstance(); }',
      weight: 0.98,
    },
    {
      id: 'AB07', group: 'abu_bakr',
      wisdom: '«لن يُفلح قومٌ ولَّوا أمرهم امرأة» — في سياق القيادة السياسية العليا',
      source: 'البخاري: ٤٤٢٥',
      rule:   'ROLE_CONSTRAINT',
      domain: 'rbac',
      principle: 'تحديد الأدوار وفق الفطرة والشريعة — Role-Based Access Control (RBAC)',
      programmingEquiv: 'enum Role { SUPREME_LEADER = "leader", ... }  // قيود الأدوار',
      weight: 0.97,
    },
    {
      id: 'AB08', group: 'abu_bakr',
      wisdom: 'صدقه المطلق الذي أكسبه لقب «الصدِّيق» — أول من صدَّق بالإسراء والمعراج فوراً',
      source: 'سيرة ابن هشام | البخاري',
      rule:   'TRUTH_AS_CORE_VALUE',
      domain: 'all',
      principle: 'الصدق المطلق كقيمة جوهرية — Immutable Truth Contract',
      programmingEquiv: 'const TRUTH = Object.freeze({ immutable: true, source: "divine" }); // لا يُعدَّل',
      weight: 0.99,
    },
    {
      id: 'AB09', group: 'abu_bakr',
      wisdom: 'التشاور في الأمور العامة وتأسيس مجلس الشورى',
      source: 'تاريخ الطبري',
      rule:   'CONSENSUS_ALGORITHM',
      domain: 'distributed',
      principle: 'البت بالشورى — Consensus Algorithm (Raft-like)',
      programmingEquiv: 'await council.vote(matter, { quorum: MAJORITY, fallback: SUNNAH });',
      weight: 0.97,
    },
    {
      id: 'AB10', group: 'abu_bakr',
      wisdom: '«احرصوا على الموت توهب لكم الحياة»',
      source: 'منسوب إلى أبي بكر',
      rule:   'RISK_COURAGE_PRINCIPLE',
      domain: 'leadership',
      principle: 'الشجاعة أمام الخطر = بقاء النظام — Fail-Fast Courage',
      programmingEquiv: 'if (risk.isWorthTaking()) { act(); } // لا تشلّ بالخوف من الخطأ',
      weight: 0.95,
    },
    {
      id: 'AB11', group: 'abu_bakr',
      wisdom: 'وصيته لعمر: «وإني أوصيك بتقوى الله»',
      source: 'تاريخ الطبري',
      rule:   'SECURE_HANDOVER',
      domain: 'ops',
      principle: 'التسليم الآمن للمسؤولية — Secure State Handover Protocol',
      programmingEquiv: 'async function handoverLeadership(successor) { await verifySuccessor(); transferStateSecurely(); }',
      weight: 0.96,
    },
    {
      id: 'AB12', group: 'abu_bakr',
      wisdom: 'سرعة الحسم في الأزمات مع العدل — لم يتردد في حروب الردة',
      source: 'سيرة ابن هشام',
      rule:   'DECISIVE_ACTION',
      domain: 'crisis',
      principle: 'الحسم السريع في الأزمات — Circuit Breaker Pattern',
      programmingEquiv: 'if (systemIntegrityThreatened()) { circuitBreaker.open(); enforce(LAW); }',
      weight: 0.96,
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الطبقة II: عمر بن الخطاب رضي الله عنه ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_UMAR = Object.freeze({
  id:       'II',
  caliph:   'عمر بن الخطاب',
  nameEn:   'Umar ibn Al-Khattab',
  titleAr:  'الفاروق — ثاني الخلفاء الراشدين',
  period:   '13-23 هـ | 634-644 م',
  radi:     'رضي الله عنه',
  quranRef: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا﴾ — الحجرات: ٦',

  cells: [
    {
      id: 'UM01', group: 'umar',
      wisdom: 'إنشاء الديوان — أول سجل منظَّم للمعلومات والأسماء والأرزاق في الدولة الإسلامية',
      source: 'تاريخ الطبري | فتوح البلدان',
      rule:   'DATABASE_ADMINISTRATION',
      domain: 'db',
      principle: 'أول نظام قواعد بيانات في التاريخ الإسلامي — Structured Record System',
      programmingEquiv: 'class Diwan { register(citizen); lookup(name); allocate(stipend); audit(); }',
      weight: 1.00,
    },
    {
      id: 'UM02', group: 'umar',
      wisdom: 'تأسيس التقويم الهجري — «لا تكتبوا في كتبنا: من شهر كذا إلى شهر كذا»',
      source: 'تاريخ الطبري',
      rule:   'CALENDAR_SYSTEM',
      domain: 'datetime',
      principle: 'نظام التوقيت المرجعي الموحَّد — Universal Timestamp Reference',
      programmingEquiv: 'const EPOCH = new HijriCalendar({ year: 1, event: "HIJRA" }); // مرجع الزمن',
      weight: 0.99,
    },
    {
      id: 'UM03', group: 'umar',
      wisdom: '«متى استعبدتم الناس وقد ولدتهم أمهاتهم أحراراً؟»',
      source: 'تاريخ الطبري',
      rule:   'USER_FREEDOM_BY_DEFAULT',
      domain: 'ux',
      principle: 'الحرية حالة افتراضية — Freedom by Default (Opt-in Constraints)',
      programmingEquiv: 'const userPermissions = { default: "FREE", restrictions: [] }; // الحرية أصل',
      weight: 1.00,
    },
    {
      id: 'UM04', group: 'umar',
      wisdom: '«لو عثرت بغلة في العراق لسُئلت عنها يوم القيامة: هل هيَّأت لها الطريق؟»',
      source: 'تاريخ ابن عساكر',
      rule:   'FULL_ACCOUNTABILITY',
      domain: 'ops',
      principle: 'المساءلة الكاملة على كل شيء — Full Observability & Accountability',
      programmingEquiv: 'monitor.trackEverything({ scope: "ENTIRE_TERRITORY", zeroToleranceFailure: true });',
      weight: 1.00,
    },
    {
      id: 'UM05', group: 'umar',
      wisdom: 'تفتيش الولاة ومحاسبتهم — إرسال المفتشين للتحقق من عدل الحكام',
      source: 'تاريخ الطبري',
      rule:   'GOVERNANCE_AUDIT',
      domain: 'monitoring',
      principle: 'مراقبة وتدقيق القيادة — Runtime Audit + Governor Monitoring',
      programmingEquiv: 'cron.run("audit", "*/3months", () => inspector.checkGovernors({ removeCorrupt: true }));',
      weight: 0.99,
    },
    {
      id: 'UM06', group: 'umar',
      wisdom: 'نظام السوق المنظَّم في المدينة — أول نظام تنظيم تجاري في الإسلام',
      source: 'تاريخ الطبري',
      rule:   'MARKET_REGULATION',
      domain: 'market',
      principle: 'تنظيم السوق لحماية المستهلك — Market Regulation Engine',
      programmingEquiv: 'marketEngine.regulate({ preventMonopoly: true, protectConsumer: true, enforceHalal: true });',
      weight: 0.99,
    },
    {
      id: 'UM07', group: 'umar',
      wisdom: 'الشورى الموسَّعة — مجلس الشورى يضم كبار الصحابة لاتخاذ القرارات الكبرى',
      source: 'تاريخ الطبري',
      rule:   'DISTRIBUTED_CONSENSUS',
      domain: 'distributed',
      principle: 'قرارات موزَّعة بالإجماع — Distributed Consensus (Shura Protocol)',
      programmingEquiv: 'const decision = await shura.reach_consensus({ participants: SENIOR_COMPANIONS, quorum: "majority" });',
      weight: 0.98,
    },
    {
      id: 'UM08', group: 'umar',
      wisdom: 'فتح المدن وتنظيمها — مصر والعراق وفارس والشام — التوسع الأفقي المنظَّم',
      source: 'فتوح البلدان — البلاذري',
      rule:   'HORIZONTAL_SCALING',
      domain: 'infra',
      principle: 'التوسع الأفقي المنظَّم — Horizontal Scaling with Governance',
      programmingEquiv: 'async function expand(region) { govern(); setupDiwan(); ensureJustice(); route(region); }',
      weight: 0.98,
    },
    {
      id: 'UM09', group: 'umar',
      wisdom: 'اجتهاده في المسائل المستجدة — إيقاف سهم المؤلفة قلوبهم حين اكتمل الإسلام',
      source: 'تاريخ الطبري',
      rule:   'ADAPTIVE_IJTIHAD',
      domain: 'logic',
      principle: 'التكيُّف مع الواقع المتغيِّر — Adaptive Algorithm / Context-Aware Logic',
      programmingEquiv: 'if (context.changed()) { rule = reDeriveFromPrinciples(QURAN, SUNNAH, context); }',
      weight: 0.97,
    },
    {
      id: 'UM10', group: 'umar',
      wisdom: '«أنا أبن الخطاب ومن رأى منكم اعوجاجاً فليقوِّمني» — الاستعداد للنقد',
      source: 'تاريخ الطبري',
      rule:   'OPEN_TO_CORRECTION',
      domain: 'quality',
      principle: 'القابلية للتصحيح — Open Feedback Loop / Pull Request Review',
      programmingEquiv: 'leader.acceptFeedback({ source: "any_citizen", action: "correct_immediately" });',
      weight: 0.98,
    },
    {
      id: 'UM11', group: 'umar',
      wisdom: 'بكاؤه على المسلمين الجائعين — تحمَّل الجوع مع رعيته في عام الرمادة',
      source: 'تاريخ الطبري',
      rule:   'EMPATHY_DRIVEN_LEADERSHIP',
      domain: 'ux',
      principle: 'قائد يشاركُ المستخدم همومه — Empathy-First Design',
      programmingEquiv: 'if (users.areInNeed()) { leader.shareTheirBurden(); system.prioritizeRelief(); }',
      weight: 0.97,
    },
    {
      id: 'UM12', group: 'umar',
      wisdom: '«إذا رأيتم العالم يُدهن للسلطان فاعلموا أنه لص» — الاستقلالية عن السلطة',
      source: 'منسوب إلى عمر',
      rule:   'INTELLECTUAL_INDEPENDENCE',
      domain: 'security',
      principle: 'استقلالية المحرك عن الضغوط الخارجية — Independent Validation Layer',
      programmingEquiv: 'validator.isIndependentOf(authority); // لا تحيُّز للسلطة',
      weight: 0.96,
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الطبقة III: عثمان بن عفان رضي الله عنه ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_UTHMAN = Object.freeze({
  id:       'III',
  caliph:   'عثمان بن عفان',
  nameEn:   'Uthman ibn Affan',
  titleAr:  'ذو النورين — ثالث الخلفاء الراشدين',
  period:   '23-35 هـ | 644-656 م',
  radi:     'رضي الله عنه',
  quranRef: '﴿الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ﴾ — البقرة: ٢٦١',

  cells: [
    {
      id: 'UT01', group: 'uthman',
      wisdom: 'جمع الناس على مصحف إمام واحد وإحراق ما سواه — توحيد المصدر الرسمي',
      source: 'البخاري: ٤٩٨٧',
      rule:   'SINGLE_SOURCE_OF_TRUTH',
      domain: 'versioning',
      principle: 'مصدر حقيقة واحد — Single Source of Truth + Canonical Version',
      programmingEquiv: 'git.setCanonical("main"); git.deprecateConflictingBranches(); // توحيد المصدر',
      weight: 1.00,
    },
    {
      id: 'UT02', group: 'uthman',
      wisdom: 'إرسال نسخ المصحف إلى أمصار المسلمين (مكة، الكوفة، البصرة، الشام، اليمن)',
      source: 'البخاري: ٤٩٨٧',
      rule:   'CONTENT_DELIVERY_NETWORK',
      domain: 'cdn',
      principle: 'توزيع المحتوى الموحَّد جغرافياً — Content Delivery Network (CDN)',
      programmingEquiv: 'cdn.distribute(CANONICAL_CONTENT, { regions: ["makkah","kufa","basra","sham","yemen"] });',
      weight: 1.00,
    },
    {
      id: 'UT03', group: 'uthman',
      wisdom: '«ما زنيت في جاهلية ولا إسلام، ولا تمنيت أن لي بديني بدلاً» — الثبات على المبدأ',
      source: 'تاريخ الطبري',
      rule:   'IMMUTABLE_CORE_PRINCIPLE',
      domain: 'all',
      principle: 'الثبات على الهوية — Immutable Core Values',
      programmingEquiv: 'const CORE = Object.freeze({ principle: "IMMUTABLE", cannotBeChanged: true });',
      weight: 0.99,
    },
    {
      id: 'UT04', group: 'uthman',
      wisdom: 'توسيع المسجد الحرام والمسجد النبوي — توسيع البنية التحتية مع النمو',
      source: 'تاريخ الطبري',
      rule:   'INFRASTRUCTURE_SCALING',
      domain: 'infra',
      principle: 'توسيع البنية مع الطلب المتزايد — Proactive Infrastructure Scaling',
      programmingEquiv: 'if (demand.exceeds(capacity)) { infrastructure.expand({ graceful: true }); }',
      weight: 0.98,
    },
    {
      id: 'UT05', group: 'uthman',
      wisdom: 'كرمه الاستثنائي — اشترى بئر رومة للمسلمين وجهَّز جيش العسرة من ماله',
      source: 'البخاري: ٢٧٧٨',
      rule:   'RESOURCE_GENEROSITY',
      domain: 'resources',
      principle: 'توظيف الموارد لخدمة الكل — Resource Pooling for Commons',
      programmingEquiv: 'resources.pool({ provider: "UTHMAN", beneficiary: "ALL_MUSLIMS", openAccess: true });',
      weight: 0.98,
    },
    {
      id: 'UT06', group: 'uthman',
      wisdom: 'اختياره لتوحيد المصحف بمعيار قريش — اتباع المعيار الأعلى والأفصح',
      source: 'البخاري: ٤٩٨٧',
      rule:   'HIGHEST_STANDARD',
      domain: 'quality',
      principle: 'اعتماد أعلى المعايير — ISO Standard Selection',
      programmingEquiv: 'compiler.setStandard(QURAYSH_ARABIC); // أرقى معيار لغوي',
      weight: 0.99,
    },
    {
      id: 'UT07', group: 'uthman',
      wisdom: 'بناء أسطول بحري إسلامي أول — التوسع إلى منافذ جديدة',
      source: 'فتوح البلدان',
      rule:   'NEW_TRANSPORT_LAYER',
      domain: 'network',
      principle: 'فتح طبقات نقل جديدة — New Protocol/Transport Layer',
      programmingEquiv: 'network.addLayer({ protocol: "NAVAL", direction: "MEDITERRANEAN", secure: true });',
      weight: 0.97,
    },
    {
      id: 'UT08', group: 'uthman',
      wisdom: 'حياؤه الشديد الذي وصفه النبي ﷺ: «ألا أستحيي من رجل تستحيي منه الملائكة؟»',
      source: 'مسلم: ٢٤٠١',
      rule:   'GRACEFUL_API',
      domain: 'ux',
      principle: 'الأدب الرفيع في التعامل — Graceful & Polite API Design',
      programmingEquiv: 'api.setStyle({ tone: "GRACEFUL", errors: "gentle", responses: "dignified" });',
      weight: 0.97,
    },
    {
      id: 'UT09', group: 'uthman',
      wisdom: 'مواجهة الفتنة بالصبر واختياره عدم سفك الدماء — الحل السلمي أولاً',
      source: 'تاريخ الطبري',
      rule:   'PEACEFUL_CONFLICT_RESOLUTION',
      domain: 'resilience',
      principle: 'الحل السلمي قبل القوة — Graceful Shutdown before Force Stop',
      programmingEquiv: 'system.resolveConflict({ method: "PEACEFUL_FIRST", avoidBloodshed: true });',
      weight: 0.96,
    },
    {
      id: 'UT10', group: 'uthman',
      wisdom: 'قراءته القرآن كله في ركعة واحدة — العمق والشمولية',
      source: 'تاريخ الطبري',
      rule:   'DEEP_PROCESSING',
      domain: 'performance',
      principle: 'المعالجة العميقة المتكاملة — Deep Processing in Single Pass',
      programmingEquiv: 'processor.deepScan({ source: FULL_QURAN, singlePass: true, depth: "COMPLETE" });',
      weight: 0.95,
    },
    {
      id: 'UT11', group: 'uthman',
      wisdom: 'تحريره للكثير من الرقيق وإنفاقه في الخير — تحرير الموارد المقيَّدة',
      source: 'تاريخ الطبري',
      rule:   'FREE_LOCKED_RESOURCES',
      domain: 'memory',
      principle: 'تحرير الموارد المحجوزة — Memory / Resource Deallocation',
      programmingEquiv: 'gc.free(lockedResources); // تحرير ما كان محجوزاً',
      weight: 0.96,
    },
    {
      id: 'UT12', group: 'uthman',
      wisdom: 'استشارته لكبار الصحابة قبل توحيد المصحف — التحقق من الصحة قبل الإصدار',
      source: 'البخاري: ٤٩٨٧',
      rule:   'PRE_RELEASE_VALIDATION',
      domain: 'quality',
      principle: 'التحقق قبل الإصدار الرسمي — Pre-Release Code Review',
      programmingEquiv: 'await codeReview.approve(CANONICAL_VERSION, { reviewers: SENIOR_SAHABA }); release();',
      weight: 0.98,
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الطبقة IV: علي بن أبي طالب رضي الله عنه ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_ALI = Object.freeze({
  id:       'IV',
  caliph:   'علي بن أبي طالب',
  nameEn:   'Ali ibn Abi Talib',
  titleAr:  'أمير المؤمنين — رابع الخلفاء الراشدين',
  period:   '35-40 هـ | 656-661 م',
  radi:     'رضي الله عنه',
  quranRef: '﴿وَمِنَ النَّاسِ مَن يَشْرِي نَفْسَهُ ابْتِغَاءَ مَرْضَاتِ اللَّهِ﴾ — البقرة: ٢٠٧',

  cells: [
    {
      id: 'AL01', group: 'ali',
      wisdom: '«قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ»',
      source: 'نهج البلاغة | حكم ٨١',
      rule:   'SKILLS_BASED_IDENTITY',
      domain: 'rbac',
      principle: 'قيمة المكوِّن = ما يُتقنه — Skills-based Role Assignment',
      programmingEquiv: 'user.value = user.expertise.getBestSkill(); // الشخص = قدرته',
      weight: 1.00,
    },
    {
      id: 'AL02', group: 'ali',
      wisdom: '«الْحِكْمَةُ ضَالَّةُ الْمُؤْمِنِ، أَنَّى وَجَدَهَا فَهُوَ أَحَقُّ بِهَا»',
      source: 'الترمذي: ٢٦٨٧',
      rule:   'WISDOM_MINING',
      domain: 'ai',
      principle: 'الحكمة لا دين لها — Universal Knowledge Extraction',
      programmingEquiv: 'wisdom = sources.findAll({ type: "WISDOM", origin: "any" }); adopt(wisdom);',
      weight: 0.99,
    },
    {
      id: 'AL03', group: 'ali',
      wisdom: '«مَنِ اسْتَبَدَّ بِرَأْيِهِ هَلَكَ»',
      source: 'نهج البلاغة',
      rule:   'NO_SINGLE_POINT_OF_FAILURE',
      domain: 'resilience',
      principle: 'لا فردية في القرار — No SPOF in Decision Making',
      programmingEquiv: 'if (decision.isSingleSource()) throw new FailureRisk("No single authority"); consult();',
      weight: 0.99,
    },
    {
      id: 'AL04', group: 'ali',
      wisdom: '«لَا تَجْعَلَنَّ أَكْثَرَ هَمِّكَ لِمَا قَدْ ضُمِنَ لَكَ»',
      source: 'نهج البلاغة',
      rule:   'PRIORITY_QUEUE_MANAGEMENT',
      domain: 'performance',
      principle: 'تركيز الطاقة على ما لم يُضمن — Priority Queue Optimization',
      programmingEquiv: 'task.prioritize({ skip: GUARANTEED_TASKS, focus: CRITICAL_UNKNOWNS });',
      weight: 0.98,
    },
    {
      id: 'AL05', group: 'ali',
      wisdom: 'نهج البلاغة — أعلى نص نثري عربي رصانةً وعمقاً بعد القرآن والحديث',
      source: 'نهج البلاغة',
      rule:   'DOCUMENTATION_EXCELLENCE',
      domain: 'docs',
      principle: 'التوثيق الرفيع كفن راقٍ — Documentation as Art',
      programmingEquiv: '/** @masterpiece @eloquence كل دالة توثَّق بأرقى بيان */ function document() {}',
      weight: 0.99,
    },
    {
      id: 'AL06', group: 'ali',
      wisdom: '«أَعْقِلْهَا وَتَوَكَّلْ» — ربط الناقة ثم التوكل على الله',
      source: 'الترمذي: ٢٥١٧',
      rule:   'TRUST_BUT_VERIFY',
      domain: 'resilience',
      principle: 'خذ الأسباب أولاً ثم توكَّل — Trust but Verify / Defense in Depth',
      programmingEquiv: 'system.setup(); system.backup(); system.monitor(); then(trustGod());',
      weight: 0.99,
    },
    {
      id: 'AL07', group: 'ali',
      wisdom: '«كُنْ كَالنَّحْلَةِ؛ إِذَا أَكَلَتْ أَكَلَتْ طَيِّبًا، وَإِذَا وَضَعَتْ وَضَعَتْ طَيِّبًا»',
      source: 'نهج البلاغة',
      rule:   'PURE_INPUT_PURE_OUTPUT',
      domain: 'fp',
      principle: 'إدخال طيِّب = إخراج طيِّب — Pure Function Principle',
      programmingEquiv: 'function pureFunc(input) { require(input.isHalal()); return produce(PURE_OUTPUT); }',
      weight: 0.97,
    },
    {
      id: 'AL08', group: 'ali',
      wisdom: '«اعْرِفِ الْحَقَّ تَعْرِفْ أَهْلَهُ» — الحق معيار الناس لا الناس معيار الحق',
      source: 'نهج البلاغة',
      rule:   'TRUTH_FIRST_IDENTITY',
      domain: 'logic',
      principle: 'الحق هو الكاشف لا المحتاج لكاشف — Type-First Design',
      programmingEquiv: 'const truth = deriveTruth(QURAN, SUNNAH); identify(people).by(truth); // ليس العكس',
      weight: 0.99,
    },
    {
      id: 'AL09', group: 'ali',
      wisdom: 'عدله المطلق — حين أراد استرداد درعه من اليهودي تقاضى أمام القاضي دون تمييز',
      source: 'السنن الكبرى للبيهقي',
      rule:   'EQUAL_JUSTICE',
      domain: 'governance',
      principle: 'المساواة أمام القانون — Equal Justice Under Law',
      programmingEquiv: 'court.rule({ plaintiff: "ALI", defendant: "JEW", bias: null }); // لا تمييز',
      weight: 1.00,
    },
    {
      id: 'AL10', group: 'ali',
      wisdom: '«لَا تَكُنْ عَبْدَ غَيْرِكَ وَقَدْ جَعَلَكَ اللَّهُ حُرًّا»',
      source: 'نهج البلاغة | رسالة ٣١',
      rule:   'AUTONOMY_PRINCIPLE',
      domain: 'all',
      principle: 'استقلالية المكوِّن — Component Autonomy / No Vendor Lock-in',
      programmingEquiv: 'component.setIndependence({ noVendorLockIn: true, freeByDefault: true });',
      weight: 0.98,
    },
    {
      id: 'AL11', group: 'ali',
      wisdom: '«النَّاسُ نِيَامٌ فَإِذَا مَاتُوا انْتَبَهُوا» — الوعي بالحقيقة الكبرى',
      source: 'منسوب لعلي',
      rule:   'RUNTIME_AWARENESS',
      domain: 'philosophy',
      principle: 'الوعي بالسياق الكامل — Runtime Context Awareness',
      programmingEquiv: 'process.on("exit", () => fullAwareness.activate()); // الوعي الكامل عند النهاية',
      weight: 0.95,
    },
    {
      id: 'AL12', group: 'ali',
      wisdom: '«مَنْ أَبَطَّأَ بِهِ عَمَلُهُ لَمْ يُسْرِعْ بِهِ نَسَبُهُ»',
      source: 'مسلم: ٢٦٩٩',
      rule:   'MERIT_OVER_INHERITANCE',
      domain: 'all',
      principle: 'الكفاءة لا النسب — Meritocracy over Inheritance',
      programmingEquiv: 'rank.baseOn(ACTIONS_AND_WORK, { not: "class_inheritance_only" });',
      weight: 0.97,
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── الطبقة V: الحكمة الجماعية — المبادئ المشتركة للخلفاء الأربعة ────────────
// ═══════════════════════════════════════════════════════════════════════════════

const LAYER_SHARED_WISDOM = Object.freeze({
  id:       'V',
  nameAr:   'الحكمة الجماعية — المبادئ المشتركة',
  nameEn:   'Shared Wisdom — Common Principles',
  quranRef: '﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾ — الشورى: ٣٨',

  cells: [
    {
      id: 'SW01', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: الشورى أساس الحكم — لا استبداد',
      source: 'سير أعلام النبلاء',
      rule:   'DEMOCRACY_OF_WISDOM',
      domain: 'governance',
      principle: 'الشورى الحكيمة — Wise Democratic Consensus',
      programmingEquiv: 'const gov = new ShuraGovernance({ members: SENIOR_COUNCIL, mandate: QURAN_SUNNAH });',
      weight: 1.00,
    },
    {
      id: 'SW02', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: العدل أساس الملك حتى مع الأعداء',
      source: 'تاريخ الطبري',
      rule:   'JUSTICE_FOUNDATION',
      domain: 'governance',
      principle: 'العدل أساس — Justice as Foundation Layer',
      programmingEquiv: 'system.foundation = JUSTICE; // لا نظام بلا عدل',
      weight: 1.00,
    },
    {
      id: 'SW03', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: اتباع الكتاب والسنة أولاً قبل الرأي',
      source: 'السنة لابن أبي عاصم',
      rule:   'QURAN_SUNNAH_FIRST',
      domain: 'all',
      principle: 'الكتاب والسنة = أعلى سلطة — Highest Authority Chain',
      programmingEquiv: 'authority.chain = [QURAN, SUNNAH, RASHIDEEN_SUNNAH, IJMA, QIYAS];',
      weight: 1.00,
    },
    {
      id: 'SW04', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: التواضع وخدمة الرعية قبل التمتع بالسلطة',
      source: 'سير أعلام النبلاء',
      rule:   'HUMILITY_LEADERSHIP',
      domain: 'leadership',
      principle: 'تواضع القائد — Servant Leader Pattern',
      programmingEquiv: 'leader.setDefault({ mode: "SERVANT", priority: "PEOPLE_FIRST" });',
      weight: 0.99,
    },
    {
      id: 'SW05', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: القضاء المستقل لا يخضع لسلطة الخليفة',
      source: 'تاريخ ابن الأثير',
      rule:   'INDEPENDENT_JUDICIARY',
      domain: 'governance',
      principle: 'القضاء المستقل — Independent Validation & Oversight',
      programmingEquiv: 'const judiciary = new IndependentModule({ immuneToLeaderOverride: true });',
      weight: 0.99,
    },
    {
      id: 'SW06', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: الأمر بالمعروف والنهي عن المنكر واجب على الجميع',
      source: 'البخاري: ٣٤٤٩',
      rule:   'SYSTEM_WIDE_VALIDATION',
      domain: 'quality',
      principle: 'كل مكوِّن يراقب الآخر — Distributed System Validation',
      programmingEquiv: 'every.component.mustReport({ violations: true, improvements: true });',
      weight: 0.98,
    },
    {
      id: 'SW07', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: الإتقان في العمل وعدم التكاسل',
      source: 'البيهقي: ٤٣٢٧',
      rule:   'CRAFTSMANSHIP',
      domain: 'all',
      principle: 'الإتقان واجب — Craftsmanship & Quality Imperative',
      programmingEquiv: '// كل سطر كود يُعامَل كأنه يُعرَض على الله\nif (!work.isExcellent()) work.redo();',
      weight: 0.99,
    },
    {
      id: 'SW08', group: 'shared',
      wisdom: 'الأربعة اتفقوا على: الصبر في المحن واليقين بوعد الله',
      source: 'تاريخ الطبري',
      rule:   'RESILIENCE_WITH_FAITH',
      domain: 'resilience',
      principle: 'الصمود مع اليقين — Resilience + Optimistic Concurrency',
      programmingEquiv: 'retry({ maxAttempts: Infinity, strategy: "exponential_with_tawakkul" });',
      weight: 0.97,
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── المحرك الرئيسي ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class KhulafaRashideenEngine extends EventEmitter {
  constructor() {
    super();
    this.name    = 'Sheikha Khulafa Rashideen Neural Network';
    this.nameAr  = 'شبكة خلايا عصبية سنة الخلفاء الراشدين المهديين';
    this.version = VERSION;
    this.schema  = SCHEMA;
    this.tawheed = TAWHEED;

    this._layers = [
      LAYER_ABU_BAKR,
      LAYER_UMAR,
      LAYER_UTHMAN,
      LAYER_ALI,
      LAYER_SHARED_WISDOM,
    ];

    this._allCells = this._layers.flatMap(l => l.cells);
    this._cellMap  = new Map(this._allCells.map(c => [c.id, c]));
    this._initialized = false;
  }

  /** تهيئة المحرك */
  init() {
    if (this._initialized) return this;
    this.emit('init', { engine: this.name, cells: this._allCells.length, tawheed: TAWHEED });
    this._initialized = true;
    return this;
  }

  /** إزالة التشكيل للمقارنة */
  _strip(str) {
    return str.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06DC«»]/g, '').toLowerCase();
  }

  /** البحث في الخلايا */
  search(query = '') {
    const q = this._strip(query);
    if (!q) return [];
    return this._allCells.filter(c =>
      this._strip(c.wisdom).includes(q)    ||
      this._strip(c.source).includes(q)    ||
      c.rule.toLowerCase().includes(q)     ||
      c.domain.toLowerCase().includes(q)   ||
      this._strip(c.principle).includes(q) ||
      (c.group && c.group.toLowerCase().includes(q))
    );
  }

  /** استرجاع طبقة بالمعرِّف */
  getLayer(id) {
    return this._layers.find(l => l.id === id || l.caliph === id || l.nameEn === id) || null;
  }

  /** استرجاع خلية بالمعرِّف */
  getCell(id) {
    return this._cellMap.get(id) || null;
  }

  /** استرجاع خلايا حسب المجال */
  getCellsByDomain(domain = '') {
    return this._allCells.filter(c => c.domain === domain);
  }

  /** استرجاع خلايا حسب الخليفة */
  getCellsByCaliph(caliph = '') {
    const groupMap = { 'ابوبكر': 'abu_bakr', 'عمر': 'umar', 'عثمان': 'uthman', 'علي': 'ali', 'مشترك': 'shared' };
    const group = groupMap[caliph] || caliph.toLowerCase().replace(/\s+/g, '_');
    return this._allCells.filter(c => c.group === group);
  }

  /** رقمنة مبدأ أو حكمة */
  digitize(concept = '') {
    const cell = this.search(concept)[0];
    if (!cell) return { found: false, concept, tawheed: TAWHEED };
    return {
      found:     true,
      concept,
      cell:      cell.id,
      caliph:    cell.group,
      wisdom:    cell.wisdom,
      source:    cell.source,
      rule:      cell.rule,
      domain:    cell.domain,
      principle: cell.principle,
      code:      cell.programmingEquiv,
      tawheed:   TAWHEED,
    };
  }

  /** حالة المحرك */
  status() {
    const layerStats = this._layers.map(l => ({
      id:      l.id,
      caliph:  l.caliph || l.nameAr,
      cells:   l.cells.length,
    }));
    return {
      engine:  this.name,
      nameAr:  this.nameAr,
      version: this.version,
      schema:  this.schema,
      stats: {
        totalLayers: this._layers.length,
        totalCells:  this._allCells.length,
        layers:      layerStats,
      },
      hadithJami:   HADITH_AL_JAMI.text,
      hadithSource: HADITH_AL_JAMI.source,
      tawheed:      TAWHEED,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── النسخة المُصدَّرة ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const engine = new KhulafaRashideenEngine();

module.exports = {
  // المحرك
  KhulafaRashideenEngine,
  engine,

  // الطبقات
  LAYER_ABU_BAKR,
  LAYER_UMAR,
  LAYER_UTHMAN,
  LAYER_ALI,
  LAYER_SHARED_WISDOM,

  // الثوابت
  HADITH_AL_JAMI,
  TAWHEED,
  BISMILLAH,
  SCHEMA,
  VERSION,

  // واجهات سريعة
  init:               ()         => engine.init(),
  status:             ()         => engine.status(),
  search:             (q)        => engine.search(q),
  getLayer:           (id)       => engine.getLayer(id),
  getCell:            (id)       => engine.getCell(id),
  getCellsByDomain:   (domain)   => engine.getCellsByDomain(domain),
  getCellsByCaliph:   (caliph)   => engine.getCellsByCaliph(caliph),
  digitize:           (concept)  => engine.digitize(concept),
};
