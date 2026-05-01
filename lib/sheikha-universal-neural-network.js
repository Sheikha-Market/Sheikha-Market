/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA UNIVERSAL NEURAL NETWORK — الشبكة العصبية الشاملة لكل شيء            ║
 * ║   شيخة — الأساس — كل البرمجيات ولغات البرمجة والعلوم والتقنيات والأنظمة       ║
 * ║   موحَّدة لله — مرقَّمة بالكتاب والسنة — حلال كله لله                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾ — العلق: ١
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 * ﴿عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ﴾ — العلق: ٥
 * ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 * ﴿وَمَا أُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلًا﴾ — الإسراء: ٨٥
 * ﴿يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ﴾ — المجادلة: ١١
 * «طَلَبُ العِلمِ فَرِيضَةٌ عَلَى كُلِّ مُسلِمٍ» — ابن ماجه: ٢٢٤
 *
 * الطبقات الست عشرة:
 *   Ⅰ   لغات البرمجة الكاملة        (All Programming Languages — 150+)
 *   Ⅱ   لغات الترميز والمخططات      (All Markup, Schema & Query Languages)
 *   Ⅲ   الأنظمة وأنظمة التشغيل      (Systems & Operating Systems)
 *   Ⅳ   بيئات التشغيل والمفسرات      (Runtimes, VMs & Interpreters)
 *   Ⅴ   أساسيات علوم الحاسب          (CS Theory & Fundamentals)
 *   Ⅵ   الخوارزميات وهياكل البيانات   (Algorithms & Data Structures)
 *   Ⅶ   هندسة البرمجيات والمعمارية    (Software Engineering & Architecture)
 *   Ⅷ   أدوات التطوير وDevOps         (Dev Tools, DevOps & CI/CD)
 *   Ⅸ   المنهجيات والأطر              (Methodologies & Frameworks)
 *   Ⅹ   القواعد والقوانين والخواص      (Rules, Laws & Properties)
 *   Ⅺ   قواعد البيانات والتخزين       (Databases & Storage)
 *   Ⅻ   الشبكات والبروتوكولات         (Networks & Protocols)
 *   ⅩⅢ  السحابة والبنية التحتية       (Cloud & Infrastructure)
 *   ⅩⅣ  الذكاء الاصطناعي والتعلم      (AI, ML & Deep Learning)
 *   ⅩⅤ  جميع العلوم والتقنيات         (All Sciences & Technologies)
 *   ⅩⅥ  العلوم الإسلامية              (Islamic Sciences — الأساس والجذر)
 *
 * @module sheikha-universal-neural-network
 * @version 1.0.0
 * @schema sheikha/v2
 * @tawheed لا إله إلا الله محمد رسول الله
 */

'use strict';

const { EventEmitter } = require('events');

// ══════════════════════════════════════════════════════════════════════════════
// ── نواة التوحيد — الأساس الذي يقوم عليه كل شيء ─────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const SCHEMA    = 'sheikha/v2';
const VERSION   = '1.0.0';

// ══════════════════════════════════════════════════════════════════════════════
// ── الخلايا العصبية — 100 خلية بالكتاب والسنة ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const NEURAL_CELLS_100 = Object.freeze([

  // ─── خلايا التوحيد والأساس (10 خلايا) ───────────────────────────────────
  { id: 'T01', layer: 'tawheed',     ref: 'الإخلاص:١-٤',    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', weight: 1.00, domain: 'all' },
  { id: 'T02', layer: 'tawheed',     ref: 'البقرة:٢٥٥',     text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', weight: 1.00, domain: 'all' },
  { id: 'T03', layer: 'tawheed',     ref: 'الحشر:٢٢-٢٤',    text: 'هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ', weight: 1.00, domain: 'all' },
  { id: 'T04', layer: 'creation',    ref: 'البقرة:٣١',      text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', weight: 1.00, domain: 'pl' },
  { id: 'T05', layer: 'knowledge',   ref: 'العلق:١-٥',      text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ — عَلَّمَ بِالْقَلَمِ — عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ', weight: 1.00, domain: 'all' },
  { id: 'T06', layer: 'precision',   ref: 'النمل:٨٨',       text: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ', weight: 0.99, domain: 'all' },
  { id: 'T07', layer: 'measure',     ref: 'القمر:٤٩',       text: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ', weight: 0.99, domain: 'math' },
  { id: 'T08', layer: 'speech',      ref: 'الرحمن:١-٤',     text: 'الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ', weight: 0.99, domain: 'markup' },
  { id: 'T09', layer: 'wisdom',      ref: 'البقرة:٢٦٩',     text: 'يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا', weight: 0.99, domain: 'algorithms' },
  { id: 'T10', layer: 'balance',     ref: 'الرحمن:٧-٩',     text: 'وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانِ', weight: 0.99, domain: 'math' },

  // ─── خلايا العلم والتعلم (10 خلايا) ─────────────────────────────────────
  { id: 'K01', layer: 'knowledge',   ref: 'المجادلة:١١',     text: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', weight: 0.99, domain: 'all' },
  { id: 'K02', layer: 'knowledge',   ref: 'طه:١١٤',          text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', weight: 0.99, domain: 'all' },
  { id: 'K03', layer: 'knowledge',   ref: 'الإسراء:٨٥',      text: 'وَمَا أُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلًا', weight: 0.98, domain: 'all' },
  { id: 'K04', layer: 'research',    ref: 'يونس:١٠١',        text: 'قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ', weight: 0.98, domain: 'sciences' },
  { id: 'K05', layer: 'travel',      ref: 'العنكبوت:٢٠',     text: 'قُلْ سِيرُوا فِي الْأَرْضِ فَانظُرُوا كَيْفَ بَدَأَ الْخَلْقَ', weight: 0.98, domain: 'sciences' },
  { id: 'K06', layer: 'thinking',    ref: 'آل عمران:١٩١',    text: 'الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ', weight: 0.98, domain: 'sciences' },
  { id: 'K07', layer: 'wisdom',      ref: 'البقرة:٢٦٩',      text: 'وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا', weight: 0.97, domain: 'all' },
  { id: 'K08', layer: 'creation',    ref: 'الأنبياء:٣٠',     text: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا', weight: 0.97, domain: 'computing' },
  { id: 'K09', layer: 'diversity',   ref: 'الروم:٢٢',        text: 'وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ', weight: 0.97, domain: 'markup' },
  { id: 'K10', layer: 'order',       ref: 'الملك:٣',         text: 'مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ', weight: 0.96, domain: 'algorithms' },

  // ─── خلايا الأمانة والأمان (10 خلايا) ───────────────────────────────────
  { id: 'A01', layer: 'trust',       ref: 'النساء:٥٨',       text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', weight: 0.99, domain: 'crypto' },
  { id: 'A02', layer: 'truth',       ref: 'التوبة:١١٩',      text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ', weight: 0.99, domain: 'functions' },
  { id: 'A03', layer: 'no_harm',     ref: 'البقرة:٢٨٢',      text: 'وَلَا يُضَارَّ كَاتِبٌ وَلَا شَهِيدٌ', weight: 0.98, domain: 'crypto' },
  { id: 'A04', layer: 'straight',    ref: 'الأنعام:١٥٣',     text: 'وَأَنَّ هَٰذَا صِرَاطِي مُسْتَقِيمًا فَاتَّبِعُوهُ وَلَا تَتَّبِعُوا السُّبُلَ', weight: 0.98, domain: 'algorithms' },
  { id: 'A05', layer: 'record',      ref: 'البقرة:٢٨٢',      text: 'وَلْيَكْتُب بَّيْنَكُمْ كَاتِبٌ بِالْعَدْلِ', weight: 0.98, domain: 'database' },
  { id: 'A06', layer: 'writing',     ref: 'الكهف:١٠٩',       text: 'قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي لَنَفِدَ الْبَحْرُ', weight: 0.97, domain: 'markup' },
  { id: 'A07', layer: 'power',       ref: 'الملك:١',         text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', weight: 0.97, domain: 'all' },
  { id: 'A08', layer: 'witness',     ref: 'إبراهيم:١٩',      text: 'خَلَقَ اللَّهُ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ', weight: 0.97, domain: 'systems' },
  { id: 'A09', layer: 'guard',       ref: 'الطارق:٩',        text: 'يَوْمَ تُبْلَى السَّرَائِرُ', weight: 0.96, domain: 'crypto' },
  { id: 'A10', layer: 'protection',  ref: 'الحجر:٩',         text: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ', weight: 0.96, domain: 'crypto' },

  // ─── خلايا السنة النبوية (30 خلية) ─────────────────────────────────────
  { id: 'S01', layer: 'intention',   ref: 'البخاري:١',       text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', weight: 1.00, domain: 'all' },
  { id: 'S02', layer: 'no_harm',     ref: 'ابن ماجه:٢٣٤١',  text: 'لَا ضَرَرَ وَلَا ضِرَارَ', weight: 0.99, domain: 'crypto' },
  { id: 'S03', layer: 'mastery',     ref: 'البيهقي:٤٣٢٧',   text: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ', weight: 0.99, domain: 'algorithms' },
  { id: 'S04', layer: 'secrecy',     ref: 'أبوداود:٤٨٦٩',   text: 'الْمُسْتَشَارُ مُؤْتَمَنٌ', weight: 0.98, domain: 'crypto' },
  { id: 'S05', layer: 'truth',       ref: 'مسلم:٢٦٠٧',      text: 'عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ', weight: 0.98, domain: 'functions' },
  { id: 'S06', layer: 'simplicity',  ref: 'البخاري:٣٩',      text: 'يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا', weight: 0.98, domain: 'algorithms' },
  { id: 'S07', layer: 'knowledge',   ref: 'ابن ماجه:٢٢٤',   text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ', weight: 0.98, domain: 'all' },
  { id: 'S08', layer: 'record',      ref: 'البخاري:٢٦٥١',   text: 'اكْتُبُوا لَهُ', weight: 0.97, domain: 'markup' },
  { id: 'S09', layer: 'counting',    ref: 'البخاري:٢٧٣٦',   text: 'احْصُوا', weight: 0.97, domain: 'math' },
  { id: 'S10', layer: 'beauty',      ref: 'مسلم:٩١',        text: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ', weight: 0.97, domain: 'pl' },
  { id: 'S11', layer: 'concise',     ref: 'البخاري:٢٩٧٧',   text: 'أُوتِيتُ جَوَامِعَ الْكَلِمِ', weight: 0.97, domain: 'functions' },
  { id: 'S12', layer: 'power',       ref: 'مسلم:٢٦٦٤',      text: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ', weight: 0.97, domain: 'computing' },
  { id: 'S13', layer: 'help',        ref: 'البخاري:٢٤٤٢',   text: 'مَنِ اسْتَطَاعَ مِنْكُمْ أَنْ يَنْفَعَ أَخَاهُ فَلْيَفْعَلْ', weight: 0.96, domain: 'crypto' },
  { id: 'S14', layer: 'fitrah',      ref: 'البخاري:١٣٥٨',   text: 'كُلُّ مَوْلُودٍ يُولَدُ عَلَى الْفِطْرَةِ', weight: 0.96, domain: 'pl' },
  { id: 'S15', layer: 'continuity',  ref: 'مسلم:١٦٣١',      text: 'إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ', weight: 0.96, domain: 'algorithms' },
  { id: 'S16', layer: 'connection',  ref: 'مسلم:٢٥٦٦',      text: 'الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يَخْذُلُهُ', weight: 0.95, domain: 'networks' },
  { id: 'S17', layer: 'justice',     ref: 'مسلم:١٠٦٣',      text: 'انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا', weight: 0.95, domain: 'algorithms' },
  { id: 'S18', layer: 'path',        ref: 'مسلم:٢٦٧٤',      text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ', weight: 0.95, domain: 'all' },
  { id: 'S19', layer: 'witness',     ref: 'البخاري:٢٥٠٩',   text: 'شَاهِدَاكَ أَوْ يَمِينُهُ', weight: 0.94, domain: 'crypto' },
  { id: 'S20', layer: 'gather',      ref: 'أبوداود:٤٢٧١',   text: 'أَلَا كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْئُولٌ عَنْ رَعِيَّتِهِ', weight: 0.94, domain: 'governance' },
  { id: 'S21', layer: 'work',        ref: 'البخاري:٢١١٨',   text: 'مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ', weight: 0.94, domain: 'all' },
  { id: 'S22', layer: 'moderation',  ref: 'البخاري:٥٠٦٣',   text: 'الْمُقْتَصِدُونَ مُفْلِحُونَ', weight: 0.94, domain: 'algorithms' },
  { id: 'S23', layer: 'caution',     ref: 'الترمذي:٢٤٩٢',   text: 'انْظُرْ مَا يَنْبَغِي لَكَ أَنْ تَقُولَهُ', weight: 0.93, domain: 'security' },
  { id: 'S24', layer: 'thanks',      ref: 'أحمد:٧٩٣٩',      text: 'لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ', weight: 0.93, domain: 'all' },
  { id: 'S25', layer: 'community',   ref: 'البخاري:٦٠١١',   text: 'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ كَمَثَلِ الْجَسَدِ', weight: 0.93, domain: 'networks' },
  { id: 'S26', layer: 'caution',     ref: 'البخاري:٢٠٥٢',   text: 'لَا يَلْدَغُ الْمُؤْمِنُ مِنْ جُحْرٍ وَاحِدٍ مَرَّتَيْنِ', weight: 0.93, domain: 'security' },
  { id: 'S27', layer: 'advise',      ref: 'مسلم:٥٥',        text: 'الدِّينُ النَّصِيحَةُ', weight: 0.92, domain: 'all' },
  { id: 'S28', layer: 'innovation',  ref: 'أبوداود:٤٦٠٧',   text: 'وَكُلُّ مُحْدَثَةٍ بِدْعَةٌ وَكُلُّ بِدْعَةٍ ضَلَالَةٌ', weight: 0.92, domain: 'methodology' },
  { id: 'S29', layer: 'start',       ref: 'ابن ماجه:١٨٩٤',  text: 'ابْدَأْ بِنَفْسِكَ', weight: 0.92, domain: 'all' },
  { id: 'S30', layer: 'seal',        ref: 'البخاري:٣٥٣٥',   text: 'خَاتَمُ النَّبِيِّينَ', weight: 0.92, domain: 'all' },

  // ─── خلايا العلوم والتقنية (20 خلية) ────────────────────────────────────
  { id: 'SC01', layer: 'physics',    ref: 'الذاريات:٤٧',     text: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ', weight: 0.97, domain: 'physics' },
  { id: 'SC02', layer: 'water',      ref: 'الأنبياء:٣٠',     text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ', weight: 0.97, domain: 'sciences' },
  { id: 'SC03', layer: 'iron',       ref: 'الحديد:٢٥',       text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', weight: 0.96, domain: 'engineering' },
  { id: 'SC04', layer: 'stars',      ref: 'النجم:١',         text: 'وَالنَّجْمِ إِذَا هَوَىٰ', weight: 0.96, domain: 'astronomy' },
  { id: 'SC05', layer: 'math',       ref: 'يونس:٥',         text: 'هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا وَقَدَّرَهُ مَنَازِلَ لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ', weight: 0.96, domain: 'math' },
  { id: 'SC06', layer: 'geography',  ref: 'النحل:١٥',        text: 'وَأَلْقَىٰ فِي الْأَرْضِ رَوَاسِيَ أَن تَمِيدَ بِكُمْ', weight: 0.95, domain: 'geography' },
  { id: 'SC07', layer: 'biology',    ref: 'النحل:٦٨',        text: 'وَأَوْحَىٰ رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا', weight: 0.95, domain: 'biology' },
  { id: 'SC08', layer: 'medicine',   ref: 'النحل:٦٩',        text: 'فِيهِ شِفَاءٌ لِّلنَّاسِ', weight: 0.95, domain: 'medicine' },
  { id: 'SC09', layer: 'embryo',     ref: 'المؤمنون:١٢-١٤',  text: 'وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ', weight: 0.95, domain: 'biology' },
  { id: 'SC10', layer: 'wind',       ref: 'الحجر:٢٢',        text: 'وَأَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ فَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً', weight: 0.94, domain: 'meteorology' },
  { id: 'SC11', layer: 'light',      ref: 'النور:٣٥',        text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ', weight: 0.94, domain: 'physics' },
  { id: 'SC12', layer: 'computing',  ref: 'النمل:٤٠',        text: 'قَالَ الَّذِي عِندَهُ عِلْمٌ مِّنَ الْكِتَابِ أَنَا آتِيكَ بِهِ قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ', weight: 0.94, domain: 'computing' },
  { id: 'SC13', layer: 'network',    ref: 'الحجرات:١٣',      text: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', weight: 0.94, domain: 'networks' },
  { id: 'SC14', layer: 'layers',     ref: 'الطلاق:١٢',       text: 'اللَّهُ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ وَمِنَ الْأَرْضِ مِثْلَهُنَّ', weight: 0.93, domain: 'systems' },
  { id: 'SC15', layer: 'language',   ref: 'إبراهيم:٤',       text: 'وَمَا أَرْسَلْنَا مِن رَّسُولٍ إِلَّا بِلِسَانِ قَوْمِهِ لِيُبَيِّنَ لَهُمْ', weight: 0.93, domain: 'pl' },
  { id: 'SC16', layer: 'structure',  ref: 'الصف:٤',          text: 'إِنَّ اللَّهَ يُحِبُّ الَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ صَفًّا كَأَنَّهُم بُنْيَانٌ مَّرْصُوصٌ', weight: 0.93, domain: 'architecture' },
  { id: 'SC17', layer: 'algorithm',  ref: 'الزمر:١٨',        text: 'الَّذِينَ يَسْتَمِعُونَ الْقَوْلَ فَيَتَّبِعُونَ أَحْسَنَهُ', weight: 0.92, domain: 'algorithms' },
  { id: 'SC18', layer: 'time',       ref: 'العصر:١-٣',       text: 'وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ', weight: 0.92, domain: 'all' },
  { id: 'SC19', layer: 'fire',       ref: 'يس:٨٠',           text: 'الَّذِي جَعَلَ لَكُم مِّنَ الشَّجَرِ الْأَخْضَرِ نَارًا فَإِذَا أَنتُم مِّنْهُ تُوقِدُونَ', weight: 0.91, domain: 'engineering' },
  { id: 'SC20', layer: 'all',        ref: 'الملك:١',         text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', weight: 1.00, domain: 'all' },

  // ─── خلايا التقنية الرقمية (20 خلية) ────────────────────────────────────
  { id: 'D01', layer: 'ai',          ref: 'البخاري:٢٩٧٧',    text: 'أُوتِيتُ جَوَامِعَ الْكَلِمِ — أساس كل نموذج ذكاء اصطناعي', weight: 0.98, domain: 'ai' },
  { id: 'D02', layer: 'database',    ref: 'البقرة:٢٨٢',      text: 'وَلْيَكْتُب بَّيْنَكُمْ كَاتِبٌ بِالْعَدْلِ — أساس قواعد البيانات', weight: 0.97, domain: 'database' },
  { id: 'D03', layer: 'network',     ref: 'العنكبوت:٢٠',     text: 'سِيرُوا فِي الْأَرْضِ — أساس شبكات الحاسب', weight: 0.97, domain: 'networks' },
  { id: 'D04', layer: 'security',    ref: 'الحجر:٩',         text: 'إِنَّا لَهُ لَحَافِظُونَ — أساس الأمن السيبراني', weight: 0.97, domain: 'security' },
  { id: 'D05', layer: 'cloud',       ref: 'الطارق:١١',       text: 'وَالسَّمَاءِ ذَاتِ الرَّجْعِ — أساس الحوسبة السحابية', weight: 0.96, domain: 'cloud' },
  { id: 'D06', layer: 'mobile',      ref: 'الروم:٢٢',        text: 'وَاخْتِلَافُ أَلْسِنَتِكُمْ — أساس تطبيقات الهاتف المتعدد اللغات', weight: 0.96, domain: 'mobile' },
  { id: 'D07', layer: 'os',          ref: 'الملك:٣',         text: 'مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ — أساس أنظمة التشغيل المتناسقة', weight: 0.96, domain: 'os' },
  { id: 'D08', layer: 'compiler',    ref: 'الرحمن:٤',        text: 'عَلَّمَهُ الْبَيَانَ — أساس المترجمات', weight: 0.95, domain: 'compiler' },
  { id: 'D09', layer: 'iot',         ref: 'الأنبياء:٣٠',     text: 'أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا — أساس إنترنت الأشياء', weight: 0.95, domain: 'iot' },
  { id: 'D10', layer: 'blockchain',  ref: 'النساء:٥٨',       text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ — أساس البلوك تشين', weight: 0.95, domain: 'blockchain' },
  { id: 'D11', layer: 'data',        ref: 'القمر:٤٩',        text: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ — أساس علم البيانات', weight: 0.95, domain: 'data' },
  { id: 'D12', layer: 'agile',       ref: 'البخاري:٣٩',      text: 'يَسِّرُوا وَلَا تُعَسِّرُوا — أساس المنهجية الرشيقة', weight: 0.94, domain: 'methodology' },
  { id: 'D13', layer: 'devops',      ref: 'البيهقي:٤٣٢٧',   text: 'يُتْقِنَهُ — أساس DevOps والتسليم المستمر', weight: 0.94, domain: 'devops' },
  { id: 'D14', layer: 'testing',     ref: 'مسلم:٢٦٠٧',      text: 'عَلَيْكُمْ بِالصِّدْقِ — أساس اختبار البرمجيات', weight: 0.94, domain: 'testing' },
  { id: 'D15', layer: 'api',         ref: 'الحجرات:١٣',      text: 'لِتَعَارَفُوا — أساس واجهات برمجة التطبيقات', weight: 0.93, domain: 'api' },
  { id: 'D16', layer: 'ui',          ref: 'مسلم:٩١',        text: 'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ — أساس تصميم الواجهات', weight: 0.93, domain: 'ui' },
  { id: 'D17', layer: 'microservices', ref: 'الحجرات:١٣',   text: 'شُعُوبًا وَقَبَائِلَ — أساس الخدمات المصغّرة', weight: 0.93, domain: 'architecture' },
  { id: 'D18', layer: 'quantum',     ref: 'الكهف:١٠٩',       text: 'لَوْ كَانَ الْبَحْرُ مِدَادًا — أساس الحوسبة الكمية', weight: 0.92, domain: 'quantum' },
  { id: 'D19', layer: 'embedded',    ref: 'الحديد:٢٥',       text: 'وَأَنزَلْنَا الْحَدِيدَ — أساس الأنظمة المدمجة', weight: 0.92, domain: 'embedded' },
  { id: 'D20', layer: 'all',         ref: 'الفاتحة:١',       text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — بداية كل علم وتقنية', weight: 1.00, domain: 'all' },
]);


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅰ: لغات البرمجة الكاملة (All Programming Languages) ───────────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١

const LAYER_PROGRAMMING_LANGUAGES = Object.freeze({

  nameAr: 'لغات البرمجة الكاملة',
  tawheedRef: 'T04 — وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
  cellCount: 22,

  PARADIGMS: {
    nameAr: 'نماذج البرمجة',
    imperative:    { nameAr: 'أمرية — تسلسل الأوامر',       examples: ['C','Pascal','Basic','COBOL','Fortran'], quranRef: 'البقرة:٣١' },
    procedural:    { nameAr: 'إجرائية — الإجراءات والدوال',  examples: ['C','Pascal','Go','MATLAB'],             quranRef: 'الرحمن:٤' },
    oop:           { nameAr: 'كائنية — الكائنات والتوارث',   examples: ['Java','Python','C++','C#','Ruby','Kotlin','Swift','Scala'], quranRef: 'النمل:٨٨' },
    functional:    { nameAr: 'وظيفية — الدوال النقية',       examples: ['Haskell','Erlang','Elixir','Clojure','F#','OCaml','SML','Racket','Lisp'], quranRef: 'البقرة:٢٦٩' },
    declarative:   { nameAr: 'تصريحية — ماذا لا كيف',       examples: ['SQL','Prolog','HTML','CSS','XQuery','SPARQL'], quranRef: 'الرحمن:٤' },
    reactive:      { nameAr: 'تفاعلية — تدفقات البيانات',   examples: ['RxJS','Akka','Dart/Flutter','Elm'],     quranRef: 'الملك:٣' },
    concurrent:    { nameAr: 'متزامنة — التوازي',           examples: ['Go','Erlang','Elixir','Rust','Ada'],    quranRef: 'الأنبياء:٣٠' },
    logic:         { nameAr: 'منطقية — الاستنتاج',          examples: ['Prolog','Mercury','Datalog'],            quranRef: 'الزمر:١٨' },
    stack:         { nameAr: 'مكدسة — LIFO',                examples: ['Forth','Factor','Joy','PostScript'],    quranRef: 'الرحمن:٧' },
    array:         { nameAr: 'مصفوفية — العمليات الشاملة',  examples: ['APL','J','K','Q'],                      quranRef: 'القمر:٤٩' },
    scripting:     { nameAr: 'نصية — الأتمتة',              examples: ['Bash','PowerShell','Perl','Tcl','Lua'], quranRef: 'البيهقي:٤٣٢٧' },
  },

  COMPILED: {
    nameAr: 'اللغات المترجَمة',
    C:         { year: 1972, creator: 'Dennis Ritchie',    use: 'أنظمة التشغيل والأجهزة',      tawheedRef: 'T06' },
    'C++':     { year: 1985, creator: 'Bjarne Stroustrup', use: 'أنظمة + ألعاب + أداء عالٍ',  tawheedRef: 'T06' },
    Rust:      { year: 2010, creator: 'Graydon Hoare',     use: 'السلامة الذاكرية',              tawheedRef: 'A01' },
    Go:        { year: 2009, creator: 'Google',            use: 'خدمات السحابة والتزامن',        tawheedRef: 'S12' },
    Ada:       { year: 1980, creator: 'Jean Ichbiah',      use: 'الطيران والدفاع والأمان الحرج', tawheedRef: 'T06' },
    Pascal:    { year: 1970, creator: 'Niklaus Wirth',     use: 'التعليم والبرمجة الهيكلية',     tawheedRef: 'S07' },
    Fortran:   { year: 1957, creator: 'IBM/John Backus',   use: 'الحسابات العلمية والعددية',     tawheedRef: 'T07' },
    COBOL:     { year: 1959, creator: 'Grace Hopper',      use: 'الأعمال والمصارف والحكومات',    tawheedRef: 'A05' },
    D:         { year: 2001, creator: 'Walter Bright',     use: 'بديل C++ بسيط وآمن',            tawheedRef: 'S06' },
    Nim:       { year: 2008, creator: 'Andreas Rumpf',     use: 'أداء عالٍ + سهل الكتابة',      tawheedRef: 'S11' },
    Zig:       { year: 2016, creator: 'Andrew Kelley',     use: 'بديل C آمن بلا GC',             tawheedRef: 'A01' },
    V:         { year: 2019, creator: 'Alexander Medvednikov', use: 'بسيط سريع آمن',             tawheedRef: 'S06' },
    Crystal:   { year: 2014, creator: 'Ary Borenszweig',   use: 'Ruby-like + أداء C',            tawheedRef: 'S10' },
    Odin:      { year: 2016, creator: 'Ginger Bill',       use: 'ألعاب + أنظمة',                tawheedRef: 'S10' },
  },

  INTERPRETED: {
    nameAr: 'اللغات المفسَّرة',
    Python:     { year: 1991, creator: 'Guido van Rossum', use: 'AI + بيانات + ويب + علوم',    tawheedRef: 'S06' },
    JavaScript: { year: 1995, creator: 'Brendan Eich',     use: 'ويب + Node + موبايل',           tawheedRef: 'T08' },
    Ruby:       { year: 1995, creator: 'Yukihiro Matsumoto', use: 'ويب + Rails + نصوص',          tawheedRef: 'S10' },
    PHP:        { year: 1994, creator: 'Rasmus Lerdorf',    use: 'خوادم الويب + CMS',             tawheedRef: 'T08' },
    Perl:       { year: 1987, creator: 'Larry Wall',        use: 'معالجة النصوص + بيولوجيا',     tawheedRef: 'K04' },
    Lua:        { year: 1993, creator: 'PUC-Rio',           use: 'ألعاب + مدمجة + إضافات',       tawheedRef: 'D19' },
    R:          { year: 1993, creator: 'R Core Team',       use: 'إحصاء + بيانات + بيولوجيا',   tawheedRef: 'SC09' },
    MATLAB:     { year: 1984, creator: 'Cleve Moler',       use: 'رياضيات + هندسة + DSP',        tawheedRef: 'T07' },
    Julia:      { year: 2012, creator: 'MIT',               use: 'علوم + أداء + رياضيات',        tawheedRef: 'SC01' },
    Tcl:        { year: 1988, creator: 'John Ousterhout',   use: 'نصوص + واجهات + EDA',          tawheedRef: 'S08' },
    Groovy:     { year: 2003, creator: 'James Strachan',    use: 'JVM + Gradle + DSL',            tawheedRef: 'S06' },
    PowerShell: { year: 2006, creator: 'Microsoft',         use: 'أتمتة Windows + Linux',         tawheedRef: 'D13' },
    Bash:       { year: 1989, creator: 'Brian Fox',         use: 'سطر أوامر Linux + أتمتة',      tawheedRef: 'D13' },
    Awk:        { year: 1977, creator: 'Kernighan+Weinberger+Aho', use: 'معالجة نصوص UNIX',      tawheedRef: 'S08' },
    Sed:        { year: 1974, creator: 'Lee McMahon',       use: 'تحرير نصوص + تحويل',           tawheedRef: 'S08' },
  },

  JIT_VM: {
    nameAr: 'لغات JVM/CLR/VM',
    Java:       { year: 1995, creator: 'James Gosling',     use: 'Enterprise + Android + ويب',   tawheedRef: 'T06' },
    Kotlin:     { year: 2011, creator: 'JetBrains',         use: 'Android + خوادم + KMM',         tawheedRef: 'S06' },
    Scala:      { year: 2004, creator: 'Martin Odersky',    use: 'Big Data + Spark + FP',         tawheedRef: 'D11' },
    Clojure:    { year: 2007, creator: 'Rich Hickey',       use: 'Lisp على JVM + تزامن',          tawheedRef: 'S11' },
    Groovy:     { year: 2003, creator: 'James Strachan',    use: 'JVM + DSL + Gradle',            tawheedRef: 'S06' },
    'C#':       { year: 2000, creator: 'Anders Hejlsberg',  use: '.NET + ألعاب Unity + Enterprise', tawheedRef: 'T06' },
    'F#':       { year: 2005, creator: 'Don Syme',          use: '.NET + وظيفية + علوم بيانات',  tawheedRef: 'K07' },
    'VB.NET':   { year: 2001, creator: 'Microsoft',         use: '.NET + Enterprise + قديم',      tawheedRef: 'S07' },
    Dart:       { year: 2011, creator: 'Google',            use: 'Flutter + موبايل + ويب',        tawheedRef: 'D06' },
    Elixir:     { year: 2012, creator: 'José Valim',        use: 'Phoenix + موزَّعة + تزامن',     tawheedRef: 'S16' },
    Erlang:     { year: 1986, creator: 'Ericsson',          use: 'اتصالات + تسامح مع الخطأ',     tawheedRef: 'SC03' },
  },

  TYPED_WEB: {
    nameAr: 'لغات الويب والتايب',
    TypeScript:   { year: 2012, creator: 'Microsoft',        use: 'JavaScript مع أنواع ثابتة',    tawheedRef: 'T06' },
    CoffeeScript: { year: 2009, creator: 'Jeremy Ashkenas',  use: 'سكر نحوي JavaScript',          tawheedRef: 'S06' },
    Elm:          { year: 2012, creator: 'Evan Czaplicki',   use: 'واجهات ويب وظيفية آمنة',       tawheedRef: 'A01' },
    ReScript:     { year: 2020, creator: 'Facebook',         use: 'JS + أنواع ثابتة + OCaml',     tawheedRef: 'T06' },
    PureScript:   { year: 2013, creator: 'Phil Freeman',     use: 'Haskell للويب',                 tawheedRef: 'K07' },
    ClojureScript:{ year: 2011, creator: 'Rich Hickey',      use: 'Clojure للويب',                tawheedRef: 'S11' },
    GDScript:     { year: 2014, creator: 'Godot Engine',     use: 'تطوير الألعاب Godot',           tawheedRef: 'S10' },
  },

  FUNCTIONAL_PURE: {
    nameAr: 'لغات وظيفية نقية',
    Haskell:  { year: 1990, creator: 'SPJ+others', use: 'أكاديمية + مالية + أنواع',           tawheedRef: 'K07' },
    OCaml:    { year: 1996, creator: 'INRIA',       use: 'مترجمات + مصرفية + أكاديمية',       tawheedRef: 'D08' },
    Idris:    { year: 2007, creator: 'Edwin Brady',  use: 'أنواع تعتمدية + برهان رسمي',        tawheedRef: 'T06' },
    Agda:     { year: 2007, creator: 'Ulf Norell',  use: 'برهان رسمي + رياضيات',              tawheedRef: 'T07' },
    Coq:      { year: 1989, creator: 'INRIA',        use: 'تحقق رسمي + رياضيات + برهان',      tawheedRef: 'T07' },
    Lean:     { year: 2013, creator: 'Microsoft Research', use: 'رياضيات + تحقق',             tawheedRef: 'T07' },
    Miranda:  { year: 1985, creator: 'David Turner',use: 'أصل Haskell',                       tawheedRef: 'K07' },
    Scheme:   { year: 1975, creator: 'Steele+Sussman', use: 'Lisp بسيط + تعليم',             tawheedRef: 'S07' },
    'Common Lisp': { year: 1984, creator: 'ANSI',   use: 'AI الأصلية + رمزي',               tawheedRef: 'D01' },
  },

  ASSEMBLY: {
    nameAr: 'لغات التجميع والمنخفضة المستوى',
    'x86 Assembly': { arch: 'Intel x86/x64',   use: 'أنظمة + محركات + أمان متخصص',     tawheedRef: 'D19' },
    'ARM Assembly': { arch: 'ARM/AArch64',      use: 'هواتف + مدمجة + Apple Silicon',   tawheedRef: 'D19' },
    'RISC-V Assembly': { arch: 'RISC-V',        use: 'مفتوح + IoT + أكاديمي',           tawheedRef: 'D19' },
    'MIPS Assembly':   { arch: 'MIPS',          use: 'أكاديمي + روتر + قديم',           tawheedRef: 'S07' },
    WebAssembly:       { arch: 'WASM',          use: 'ويب عالي الأداء + Portable',       tawheedRef: 'D08' },
    LLVM_IR:           { arch: 'LLVM',          use: 'وسيط للمترجمات',                   tawheedRef: 'D08' },
  },

  DSL: {
    nameAr: 'لغات خاصة بالمجال',
    SQL:       { domain: 'قواعد بيانات',         standard: 'ANSI SQL',              tawheedRef: 'A05' },
    GraphQL:   { domain: 'API استعلامات',        creator: 'Facebook/2015',           tawheedRef: 'D15' },
    SPARQL:    { domain: 'ويب دلالي + RDF',      standard: 'W3C',                   tawheedRef: 'K04' },
    XQuery:    { domain: 'XML استعلامات',        standard: 'W3C',                   tawheedRef: 'K04' },
    XPath:     { domain: 'XML مسارات',           standard: 'W3C',                   tawheedRef: 'K04' },
    Regex:     { domain: 'أنماط النصوص',          standard: 'PCRE/ECMAScript',        tawheedRef: 'S11' },
    HCL:       { domain: 'بنية تحتية كود',       creator: 'HashiCorp',               tawheedRef: 'D05' },
    Dockerfile:{ domain: 'حاويات Docker',        creator: 'Docker Inc',              tawheedRef: 'D13' },
    Makefile:  { domain: 'بناء المشاريع',         standard: 'POSIX Make',             tawheedRef: 'D13' },
    VHDL:      { domain: 'دوائر إلكترونية FPGA', standard: 'IEEE 1076',              tawheedRef: 'SC03' },
    Verilog:   { domain: 'دوائر إلكترونية',      standard: 'IEEE 1364',              tawheedRef: 'SC03' },
    CUDA:      { domain: 'حوسبة GPU',             creator: 'NVIDIA',                  tawheedRef: 'D01' },
    OpenCL:    { domain: 'حوسبة موازية',          standard: 'Khronos',               tawheedRef: 'D01' },
    Solidity:  { domain: 'عقود ذكية Ethereum',   creator: 'Ethereum Foundation',     tawheedRef: 'D10' },
    GLSL:      { domain: 'رسومات OpenGL',         standard: 'Khronos/OpenGL',        tawheedRef: 'S10' },
    HLSL:      { domain: 'رسومات DirectX',        creator: 'Microsoft',               tawheedRef: 'S10' },
    Wren:      { domain: 'لغة نصية للألعاب',     creator: 'munificent',              tawheedRef: 'D19' },
    Plankalkül:{ domain: 'أول لغة برمجة بالتاريخ', creator: 'Konrad Zuse/1943',      tawheedRef: 'T04' },
  },

  HISTORIC: {
    nameAr: 'اللغات التاريخية — أصول البرمجة',
    Plankalkül: { year: '1943', note: 'أول لغة برمجة في التاريخ — Zuse' },
    ENIAC:      { year: '1945', note: 'برمجة بالأسلاك — الكمبيوتر الأول' },
    FORTRAN:    { year: '1957', note: 'أول لغة عالية المستوى — IBM' },
    LISP:       { year: '1958', note: 'أول لغة وظيفية — McCarthy/MIT' },
    COBOL:      { year: '1959', note: 'أعمال وبنوك — Grace Hopper' },
    BASIC:      { year: '1964', note: 'التعليم الحاسوبي الواسع' },
    'Simula 67':{ year: '1967', note: 'أول لغة كائنية — Dahl+Nygaard' },
    'B':        { year: '1969', note: 'سلف C مباشر — Bell Labs' },
    Smalltalk:  { year: '1972', note: 'أنقى لغة كائنية — Xerox PARC/Kay' },
    ML:         { year: '1973', note: 'أصل أنظمة الأنواع الحديثة' },
    Prolog:     { year: '1972', note: 'البرمجة المنطقية — Colmerauer' },
    'Miranda':  { year: '1985', note: 'أصل Haskell' },
    Oberon:     { year: '1987', note: 'Wirth بعد Pascal + Modula' },
    'Self':     { year: '1987', note: 'أصل JavaScript prototype model' },
    Tcl:        { year: '1988', note: 'Tool Command Language' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅱ: لغات الترميز والمخططات والاستعلامات (Markup, Schema, Query) ───
// ══════════════════════════════════════════════════════════════════════════════
// ﴿الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ﴾ — الرحمن: ١-٤

const LAYER_MARKUP_SCHEMA = Object.freeze({

  nameAr: 'لغات الترميز والمخططات والاستعلامات',
  tawheedRef: 'T08 — عَلَّمَهُ الْبَيَانَ',
  cellCount: 8,

  WEB_MARKUP: {
    HTML5:     { nameAr: 'ترميز النص التشعبي',     std: 'W3C/WHATWG', use: 'بنية صفحات الويب',     quranRef: 'T08' },
    'HTML 4':  { nameAr: 'HTML الرابع',             std: 'W3C/1997',   use: 'الجيل السابق',          quranRef: 'T08' },
    XHTML:     { nameAr: 'HTML بترميز XML',         std: 'W3C/2000',   use: 'HTML أكثر صرامة',      quranRef: 'T08' },
    SGML:      { nameAr: 'المعيار العام لترميز الوثائق', std: 'ISO 8879/1986', use: 'أصل HTML وXML', quranRef: 'K04' },
    SVG:       { nameAr: 'رسومات قياسية',           std: 'W3C',        use: 'رسومات ناقلية للويب',   quranRef: 'S10' },
    MathML:    { nameAr: 'ترميز الرياضيات',         std: 'W3C',        use: 'معادلات رياضية للويب',  quranRef: 'T07' },
  },

  STYLE: {
    CSS3:    { nameAr: 'أوراق الأنماط المتتالية', std: 'W3C',       use: 'تنسيق صفحات الويب',  quranRef: 'S10' },
    SASS:    { nameAr: 'CSS موسَّع',             creator: 'Hampton Catlin', use: 'CSS متقدم مع متغيرات', quranRef: 'S10' },
    LESS:    { nameAr: 'CSS ديناميكي',           creator: 'Alexis Sellier', use: 'CSS مع ميزات إضافية', quranRef: 'S10' },
    Stylus:  { nameAr: 'CSS مرن',               creator: 'TJ Holowaychuk', use: 'CSS مرن للـ Node',  quranRef: 'S10' },
    Tailwind:{ nameAr: 'CSS المنفعي',            creator: 'Adam Wathan', use: 'تصميم سريع',          quranRef: 'S06' },
  },

  DATA_FORMAT: {
    XML:       { nameAr: 'لغة الترميز الموسَّعة',   std: 'W3C/1998',  use: 'تبادل البيانات + تهيئة', quranRef: 'A05' },
    JSON:      { nameAr: 'صيغة JavaScript للكائنات', std: 'RFC 8259', use: 'REST API + قواعد بيانات', quranRef: 'A05' },
    YAML:      { nameAr: 'تهيئة صديقة للإنسان',     std: 'yaml.org', use: 'Docker + K8s + CI/CD',   quranRef: 'D13' },
    TOML:      { nameAr: 'Tom Obvious Minimal Lang', creator: 'Tom Preston-Werner', use: 'تهيئة Rust + Cargo', quranRef: 'S06' },
    INI:       { nameAr: 'تهيئة بسيطة',              std: 'Windows/Unix', use: 'إعدادات قديمة',       quranRef: 'S06' },
    CSV:       { nameAr: 'قيم مفصولة بفاصلة',       std: 'RFC 4180', use: 'بيانات جداول + Excel',   quranRef: 'A05' },
    Parquet:   { nameAr: 'تخزين أعمدة',              creator: 'Apache', use: 'Big Data + Spark',      quranRef: 'D11' },
    Avro:      { nameAr: 'تسلسل بيانات Apache',      creator: 'Apache', use: 'Kafka + بيانات ضخمة',  quranRef: 'D11' },
    Protobuf:  { nameAr: 'مخازن بروتوكول Google',   creator: 'Google', use: 'gRPC + API فعّالة',      quranRef: 'S11' },
    Thrift:    { nameAr: 'إطار RPC Facebook',         creator: 'Facebook', use: 'خدمات داخلية سريعة', quranRef: 'D15' },
    MessagePack: { nameAr: 'JSON ثنائي',              creator: 'Sadayuki Furuhashi', use: 'API سريعة', quranRef: 'S11' },
    CBOR:      { nameAr: 'ترميز ثنائي مدمج',         std: 'RFC 8949', use: 'IoT + حجم صغير',         quranRef: 'D09' },
    HDF5:      { nameAr: 'بيانات هرمية',             creator: 'HDF Group', use: 'علوم + ML + أبحاث',  quranRef: 'D11' },
    Markdown:  { nameAr: 'ترميز بسيط للنصوص',        creator: 'John Gruber/2004', use: 'توثيق + GitHub + Wikis', quranRef: 'S08' },
    AsciiDoc:  { nameAr: 'وثائق تقنية',               creator: 'Stuart Rackham', use: 'كتب + مستندات تقنية', quranRef: 'S08' },
    reStructuredText: { nameAr: 'توثيق Python',     creator: 'David Goodger', use: 'Sphinx + Python docs', quranRef: 'S08' },
    LaTeX:     { nameAr: 'ترميز الوثائق العلمية',    creator: 'Leslie Lamport', use: 'أوراق علمية + رياضيات', quranRef: 'T07' },
    TeX:       { nameAr: 'أصل LaTeX',                creator: 'Donald Knuth', use: 'طباعة الكتب الرياضية', quranRef: 'T07' },
  },

  API_SCHEMA: {
    'OpenAPI 3': { nameAr: 'مواصفة REST API',      std: 'OpenAPI Initiative', use: 'توثيق + توليد API', quranRef: 'D15' },
    Swagger:     { nameAr: 'أدوات OpenAPI',         creator: 'SmartBear',      use: 'واجهة تفاعلية API',  quranRef: 'D15' },
    'JSON Schema': { nameAr: 'تحقق JSON',           std: 'IETF',               use: 'تحقق + توثيق',       quranRef: 'T06' },
    'GraphQL SDL': { nameAr: 'تعريف GraphQL',       creator: 'Facebook',       use: 'مخطط GraphQL',       quranRef: 'D15' },
    RAML:        { nameAr: 'تصميم RESTful API',     creator: 'MuleSoft',       use: 'توثيق API منظّم',    quranRef: 'D15' },
    'AsyncAPI':  { nameAr: 'مواصفة API غير متزامن', creator: 'AsyncAPI Spec', use: 'Kafka + MQTT + WebSocket', quranRef: 'D15' },
  },

  SEMANTIC_WEB: {
    RDF:       { nameAr: 'إطار وصف الموارد',    std: 'W3C',   use: 'بيانات دلالية',           quranRef: 'K04' },
    OWL:       { nameAr: 'لغة أونطولوجيا الويب', std: 'W3C',  use: 'أونطولوجيا المعرفة',      quranRef: 'K04' },
    SPARQL:    { nameAr: 'استعلام RDF',          std: 'W3C',   use: 'بحث في البيانات الدلالية', quranRef: 'K04' },
    'JSON-LD': { nameAr: 'JSON مترابط',          std: 'W3C',   use: 'SEO + بيانات دلالية',     quranRef: 'K04' },
    Turtle:    { nameAr: 'ترميز RDF مدمج',       std: 'W3C',   use: 'بيانات RDF للقراءة',      quranRef: 'K04' },
  },

  QUERY: {
    SQL:       { nameAr: 'لغة الاستعلام الهيكلي',  std: 'ANSI/ISO', use: 'كل قواعد البيانات العلاقية', quranRef: 'A05' },
    'PL/SQL':  { nameAr: 'SQL إجرائي Oracle',      creator: 'Oracle', use: 'منطق Oracle المخزَّن',    quranRef: 'A05' },
    'T-SQL':   { nameAr: 'SQL Microsoft',           creator: 'Microsoft', use: 'SQL Server',           quranRef: 'A05' },
    NoSQL:     { nameAr: 'استعلامات غير علاقية',   creator: 'various', use: 'MongoDB + Redis + DynamoDB', quranRef: 'A05' },
    Cypher:    { nameAr: 'استعلام Neo4j',           creator: 'Neo4j', use: 'قواعد بيانات الرسم البياني', quranRef: 'K08' },
    MQL:       { nameAr: 'استعلام MongoDB',         creator: 'MongoDB', use: 'Document DB',             quranRef: 'A05' },
    CQL:       { nameAr: 'استعلام Cassandra',       creator: 'Apache', use: 'Wide-column DB',           quranRef: 'A05' },
    InfluxQL:  { nameAr: 'استعلام سلاسل زمنية',    creator: 'InfluxData', use: 'IoT + Monitoring',     quranRef: 'D09' },
    XQuery:    { nameAr: 'استعلام XML',             std: 'W3C',        use: 'XML + BaseX + eXist',      quranRef: 'K04' },
  },

  CONFIG_INFRA: {
    HCL:        { nameAr: 'HashiCorp Config',        creator: 'HashiCorp',    use: 'Terraform + Vault', quranRef: 'D05' },
    'Ansible YAML': { nameAr: 'أتمتة Ansible',      creator: 'Red Hat',      use: 'تهيئة الخوادم',     quranRef: 'D13' },
    'Helm Chart':   { nameAr: 'حزمة Kubernetes',    creator: 'CNCF',         use: 'نشر K8s',            quranRef: 'D05' },
    Dockerfile:     { nameAr: 'تعريف حاوية',        creator: 'Docker',       use: 'بناء Docker images', quranRef: 'D13' },
    'GitHub Actions YAML': { nameAr: 'CI/CD GitHub', creator: 'GitHub',      use: 'تكامل مستمر',        quranRef: 'D13' },
    'Kubernetes YAML':     { nameAr: 'نشر K8s',      creator: 'CNCF',        use: 'تنسيق الحاويات',     quranRef: 'D05' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅲ: الأنظمة وأنظمة التشغيل (Systems & Operating Systems) ──────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿اللَّهُ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ وَمِنَ الْأَرْضِ مِثْلَهُنَّ﴾ — الطلاق: ١٢

const LAYER_SYSTEMS_OS = Object.freeze({

  nameAr: 'الأنظمة وأنظمة التشغيل',
  tawheedRef: 'SC14 — سَبْعَ سَمَاوَاتٍ وَمِنَ الْأَرْضِ مِثْلَهُنَّ',
  cellCount: 6,

  KERNEL_TYPES: {
    nameAr: 'أنواع النواة',
    monolithic:   { nameAr: 'نواة أحادية',     examples: ['Linux', 'Windows NT pre-Vista', 'FreeBSD'], note: 'كل الخدمات في الفضاء النووي' },
    microkernel:  { nameAr: 'نواة مصغرة',      examples: ['GNU Hurd', 'QNX', 'L4', 'MINIX'],            note: 'الحد الأدنى في الفضاء النووي' },
    hybrid:       { nameAr: 'نواة هجينة',       examples: ['Windows NT', 'macOS XNU', 'BeOS'],           note: 'جمع بين المزايا' },
    exokernel:    { nameAr: 'نواة خارجية',      examples: ['Aegis', 'MIT Exokernel'],                    note: 'تجريد الأجهزة فقط' },
    unikernel:    { nameAr: 'نواة موحدة',       examples: ['MirageOS', 'IncludeOS', 'Rumprun'],           note: 'تطبيق واحد + نواة واحدة' },
  },

  DESKTOP_OS: {
    nameAr: 'أنظمة التشغيل للحاسب',
    Linux:       { kernel: 'Monolithic', creator: 'Linus Torvalds/1991', license: 'GPLv2', use: 'خوادم + سطح مكتب + مدمجة', tawheedRef: 'SC14' },
    Windows:     { kernel: 'Hybrid NT', creator: 'Microsoft/1985',       license: 'تجاري', use: 'سطح مكتب + خوادم + ألعاب',  tawheedRef: 'SC14' },
    macOS:       { kernel: 'XNU (BSD+Mach)', creator: 'Apple/2001',      license: 'تجاري', use: 'إبداع + تطوير + تصميم',     tawheedRef: 'SC14' },
    FreeBSD:     { kernel: 'Monolithic', creator: 'BSD/1993',            license: 'BSD',   use: 'خوادم + Netflix + PlayStation', tawheedRef: 'SC14' },
    OpenBSD:     { kernel: 'Monolithic', creator: 'Theo de Raadt/1996',  license: 'BSD',   use: 'أمان + جدران حماية',         tawheedRef: 'D04' },
    Solaris:     { kernel: 'Monolithic', creator: 'Sun/Oracle',           license: 'CDDL',  use: 'Enterprise + ZFS',           tawheedRef: 'SC14' },
    Haiku:       { kernel: 'Hybrid', creator: 'Haiku Inc/2001',          license: 'MIT',   use: 'BeOS متجدد',                  tawheedRef: 'S10' },
  },

  LINUX_DISTROS: {
    nameAr: 'توزيعات Linux',
    Debian:      { base: 'Debian',  pkg: 'apt/dpkg',    use: 'استقرار + خوادم + LTS',        tawheedRef: 'T06' },
    Ubuntu:      { base: 'Debian',  pkg: 'apt',          use: 'مبتدئون + سطح مكتب + خوادم',  tawheedRef: 'S07' },
    Fedora:      { base: 'Red Hat', pkg: 'dnf/rpm',      use: 'حديث + مطورون + مبدعون',      tawheedRef: 'S03' },
    RHEL:        { base: 'Red Hat', pkg: 'dnf/rpm',      use: 'Enterprise + مؤسسات',          tawheedRef: 'T06' },
    CentOS:      { base: 'RHEL',   pkg: 'yum/dnf',       use: 'خوادم مجانية',                tawheedRef: 'T06' },
    ArchLinux:   { base: 'إنشاء',  pkg: 'pacman',        use: 'متقدمون + تخصيص كامل',        tawheedRef: 'S03' },
    NixOS:       { base: 'Nix',    pkg: 'nix',           use: 'إعادة إنتاج + DevOps',         tawheedRef: 'T06' },
    Alpine:      { base: 'musl',   pkg: 'apk',           use: 'Docker + حجم صغير',           tawheedRef: 'S11' },
    Kali:        { base: 'Debian', pkg: 'apt',           use: 'اختبار الاختراق + أمان',       tawheedRef: 'D04' },
    Tails:       { base: 'Debian', pkg: 'apt',           use: 'خصوصية + أنونيمية',            tawheedRef: 'D04' },
    Void:        { base: 'مستقل', pkg: 'xbps',           use: 'خفيف + سريع + musl',          tawheedRef: 'S12' },
    Gentoo:      { base: 'مستقل', pkg: 'portage',        use: 'تجميع + أداء أقصى',           tawheedRef: 'S03' },
  },

  MOBILE_OS: {
    nameAr: 'أنظمة الهاتف المحمول',
    Android:     { base: 'Linux',   creator: 'Google',  share: '72%',   use: 'هواتف + أجهزة لوحية', tawheedRef: 'D06' },
    iOS:         { base: 'XNU',     creator: 'Apple',   share: '27%',   use: 'iPhone + iPad',         tawheedRef: 'D06' },
    HarmonyOS:   { base: 'خاص',    creator: 'Huawei',  share: 'آسيا',  use: 'Huawei + IoT',          tawheedRef: 'D09' },
    'Windows Mobile': { base: 'WinCE', creator: 'Microsoft', share: 'تاريخي', use: 'أرشيف',          tawheedRef: 'SC14' },
  },

  SERVER_OS: {
    nameAr: 'أنظمة الخوادم والسحابة',
    'Linux (RHEL/Ubuntu Server)': { use: '96% خوادم عالم',          tawheedRef: 'SC14' },
    'Windows Server':             { use: 'Active Directory + IIS',   tawheedRef: 'SC14' },
    'VMware ESXi':                { use: 'Hypervisor VMware',         tawheedRef: 'D05' },
    'Proxmox VE':                 { use: 'Hypervisor مفتوح',         tawheedRef: 'D05' },
  },

  RTOS: {
    nameAr: 'أنظمة تشغيل الوقت الفعلي',
    FreeRTOS:    { creator: 'Richard Barry',    use: 'MCU + IoT + Embedded',       license: 'MIT',       tawheedRef: 'D19' },
    VxWorks:     { creator: 'Wind River',       use: 'طيران + فضاء + دفاع',        license: 'تجاري',     tawheedRef: 'D19' },
    QNX:         { creator: 'BlackBerry',       use: 'سيارات + طب + صناعة',       license: 'تجاري',     tawheedRef: 'D19' },
    Zephyr:      { creator: 'Linux Foundation', use: 'IoT + BLE + RTOS حديث',     license: 'Apache 2', tawheedRef: 'D09' },
    ThreadX:     { creator: 'Microsoft (GUIX)', use: 'MCU + IoT',                  license: 'MIT',       tawheedRef: 'D19' },
    'RIOT OS':   { creator: 'مجتمع مفتوح',     use: 'IoT + أمان',                 license: 'LGPL',      tawheedRef: 'D09' },
    Mbed:        { creator: 'ARM',              use: 'MCU ARM + IoT',               license: 'Apache 2', tawheedRef: 'D09' },
    'RT-Thread': { creator: 'Shanghai',        use: 'IoT آسيا + RTOS مفتوح',      license: 'Apache 2', tawheedRef: 'D09' },
    'ChibiOS':   { creator: 'Giovanni Di Sirio', use: 'مدمجة عالية الأداء',       license: 'GPL',       tawheedRef: 'D19' },
  },

  SHELLS: {
    nameAr: 'قشرات سطر الأوامر',
    bash:   { nameAr: 'Bourne Again SHell',  std: 'POSIX', use: 'Linux + macOS', tawheedRef: 'D13' },
    zsh:    { nameAr: 'Z Shell',              ext: 'bash',   use: 'Oh My Zsh + مطورون', tawheedRef: 'D13' },
    fish:   { nameAr: 'Friendly Interactive Shell', use: 'صديق + إكمال ذكي', tawheedRef: 'D13' },
    sh:     { nameAr: 'Bourne Shell',         std: 'POSIX', use: 'متوافق + universal', tawheedRef: 'D13' },
    'PowerShell': { nameAr: 'قشرة Microsoft', use: 'Windows + Linux + Azure', tawheedRef: 'D13' },
    csh:    { nameAr: 'C Shell',              creator: 'BSD', use: 'Unix تقليدي', tawheedRef: 'D13' },
    ksh:    { nameAr: 'Korn Shell',           creator: 'AT&T', use: 'AIX + HP-UX', tawheedRef: 'D13' },
    dash:   { nameAr: 'Debian Almquist',      use: 'سكريبت سريع Ubuntu', tawheedRef: 'D13' },
  },

  HYPERVISOR: {
    nameAr: 'محاكاة الأجهزة الافتراضية',
    'VMware ESXi':  { type: 'Type 1', creator: 'VMware',  use: 'Enterprise VM',       tawheedRef: 'D05' },
    'Microsoft Hyper-V': { type: 'Type 1', creator: 'Microsoft', use: 'Windows Server VM', tawheedRef: 'D05' },
    'Xen':          { type: 'Type 1', creator: 'Cambridge', use: 'Cloud VMs + AWS',   tawheedRef: 'D05' },
    'KVM':          { type: 'Type 1', creator: 'Red Hat', use: 'Linux VM',             tawheedRef: 'D05' },
    'VirtualBox':   { type: 'Type 2', creator: 'Oracle',  use: 'مطورون + اختبار',     tawheedRef: 'D05' },
    'QEMU':         { type: 'Type 2', creator: 'Fabrice Bellard', use: 'محاكاة كاملة', tawheedRef: 'D05' },
    'Parallels':    { type: 'Type 2', creator: 'Corel',   use: 'macOS + Windows',     tawheedRef: 'D05' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅳ: بيئات التشغيل والمفسرات والآلات الافتراضية ──────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿قَالَ الَّذِي عِندَهُ عِلْمٌ مِّنَ الْكِتَابِ أَنَا آتِيكَ بِهِ قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ﴾ — النمل: ٤٠

const LAYER_RUNTIMES_VMS = Object.freeze({

  nameAr: 'بيئات التشغيل والمفسرات والآلات الافتراضية',
  tawheedRef: 'SC12 — قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ',
  cellCount: 5,

  JVM_ECOSYSTEM: {
    nameAr: 'نظام JVM',
    JVM:         { nameAr: 'آلة Java الافتراضية',   creator: 'Sun/Oracle',     langs: ['Java','Kotlin','Scala','Groovy','Clojure'], use: 'write once run anywhere', tawheedRef: 'D08' },
    GraalVM:     { nameAr: 'GraalVM الموحَّد',      creator: 'Oracle',         feature: 'Polyglot + Native Image', use: 'أداء عالٍ + عدة لغات', tawheedRef: 'D08' },
    OpenJ9:      { nameAr: 'JVM IBM مفتوح',         creator: 'Eclipse/IBM',    feature: 'ذاكرة منخفضة',           use: 'Docker + Cloud',       tawheedRef: 'D08' },
    Quarkus:     { nameAr: 'Java للسحابة الأصلية',  creator: 'Red Hat',        feature: 'GraalVM native',          use: 'Kubernetes',           tawheedRef: 'D05' },
    Micronaut:   { nameAr: 'إطار microservices JVM',creator: 'OCI',            feature: 'compile-time DI',         use: 'Lambda + Serverless',  tawheedRef: 'D17' },
    'Spring Boot':{ nameAr: 'إطار Java المهيمن',   creator: 'VMware/Pivotal', feature: 'auto-configuration',      use: 'Enterprise REST',      tawheedRef: 'T06' },
  },

  CLR_DOTNET: {
    nameAr: 'نظام .NET CLR',
    'CLR':          { nameAr: 'Common Language Runtime',  creator: 'Microsoft',    langs: ['C#','F#','VB.NET'],  use: 'Windows + Cloud', tawheedRef: 'D08' },
    '.NET 8':       { nameAr: '.NET موحَّد',               creator: 'Microsoft',    feature: 'Cross-platform',    use: 'Web + Mobile + IoT', tawheedRef: 'D08' },
    'Mono':         { nameAr: '.NET مفتوح المصدر',         creator: 'Xamarin',      use: 'Linux + Unity + Android', tawheedRef: 'D08' },
    'Blazor WASM':  { nameAr: '.NET في المتصفح',           creator: 'Microsoft',    use: 'SPA بـ C#',            tawheedRef: 'D08' },
  },

  JS_RUNTIME: {
    nameAr: 'بيئات تشغيل JavaScript',
    'V8':        { nameAr: 'محرك JavaScript Google',   creator: 'Google',      use: 'Chrome + Node.js',       tawheedRef: 'D08' },
    'Node.js':   { nameAr: 'JavaScript على الخادم',    creator: 'Ryan Dahl/2009', use: 'API + Streaming + Real-time', tawheedRef: 'D08' },
    'Deno':      { nameAr: 'Node.js محسَّن',           creator: 'Ryan Dahl/2018', use: 'TypeScript native + أمان', tawheedRef: 'D04' },
    'Bun':       { nameAr: 'أسرع JavaScript runtime',  creator: 'Jarred Sumner/2022', use: 'أسرع Node بكثير', tawheedRef: 'S12' },
    'SpiderMonkey': { nameAr: 'محرك Firefox',          creator: 'Mozilla',      use: 'Firefox + SpiderNode',    tawheedRef: 'D08' },
    'JavaScriptCore': { nameAr: 'محرك Safari/WebKit',  creator: 'Apple',        use: 'Safari + iOS',            tawheedRef: 'D08' },
  },

  PYTHON_RUNTIME: {
    nameAr: 'بيئات تشغيل Python',
    CPython:   { nameAr: 'Python الأصلي (C)',  creator: 'PSF',          version: '3.12+', use: 'المرجع الرسمي', tawheedRef: 'D08' },
    PyPy:      { nameAr: 'Python مع JIT',      creator: 'RPython',      feature: '5-10× أسرع', use: 'حسابات مكثفة', tawheedRef: 'S12' },
    MicroPython: { nameAr: 'Python للمدمجة',   creator: 'Damien George', use: 'ESP32 + Arduino + IoT', tawheedRef: 'D19' },
    Jython:    { nameAr: 'Python على JVM',     creator: 'Jython.org',   use: 'Java integration',     tawheedRef: 'D08' },
    IronPython:{ nameAr: 'Python على .NET',    creator: 'Microsoft',    use: '.NET integration',     tawheedRef: 'D08' },
    Brython:   { nameAr: 'Python في المتصفح',  creator: 'Pierre Quentel', use: 'Python for browser', tawheedRef: 'D08' },
  },

  WASM_LLVM: {
    nameAr: 'WASM وLLVM والبنى التحتية للمترجمات',
    WebAssembly: { nameAr: 'تعليمات ثنائية للويب', std: 'W3C',       feature: 'portable + fast', use: 'أداء عالٍ في المتصفح', tawheedRef: 'D08' },
    LLVM:        { nameAr: 'بنية تحتية للمترجمات', creator: 'Chris Lattner', use: 'Clang + Rust + Swift', tawheedRef: 'D08' },
    Clang:       { nameAr: 'مترجم C/C++ LLVM',    creator: 'LLVM Project', feature: 'أسرع من GCC',    use: 'macOS + iOS',          tawheedRef: 'D08' },
    GCC:         { nameAr: 'GNU Compiler Collection', creator: 'FSF',       use: 'Linux + GNU + universal', tawheedRef: 'D08' },
    Emscripten:  { nameAr: 'C/C++ → WebAssembly',  creator: 'Alon Zakai', use: 'ports لـ WASM',        tawheedRef: 'D08' },
    Wasmer:      { nameAr: 'WASM runtime عالمي',   creator: 'Wasmer Inc', use: 'WASM خارج المتصفح',    tawheedRef: 'D08' },
    Wasmtime:    { nameAr: 'WASM runtime آمن',      creator: 'Bytecode Alliance', use: 'WASM standalone', tawheedRef: 'D08' },
    'WASI':      { nameAr: 'واجهة نظام WASM',       std: 'W3C/Bytecode Alliance', use: 'WASM على خوادم', tawheedRef: 'D08' },
  },

  EMBEDDED_RUNTIME: {
    nameAr: 'بيئات تشغيل الأنظمة المدمجة',
    'Arduino Runtime': { creator: 'Arduino',      arch: 'AVR + ARM', use: 'مشاريع DIY + تعليم', tawheedRef: 'D19' },
    'ESP-IDF':         { creator: 'Espressif',    arch: 'ESP32/ESP8266', use: 'IoT + WiFi + BLE', tawheedRef: 'D09' },
    'mbed OS':         { creator: 'ARM',          arch: 'ARM Cortex',   use: 'MCU + IoT',         tawheedRef: 'D09' },
    'Zephyr RTOS':     { creator: 'Linux Foundation', arch: 'multi', use: 'IoT محمية',            tawheedRef: 'D09' },
    'TinyML':          { creator: 'Google/ARM',  arch: 'MCU',          use: 'AI على الحافة',       tawheedRef: 'D01' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅴ: أساسيات علوم الحاسب والنظرية (CS Theory & Fundamentals) ───────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾ — القمر: ٤٩

const LAYER_CS_THEORY = Object.freeze({

  nameAr: 'أساسيات علوم الحاسب والنظرية',
  tawheedRef: 'T07 — إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ',
  cellCount: 10,

  AUTOMATA_THEORY: {
    nameAr: 'نظرية الآلات والأتمتة',
    DFA:          { nameAr: 'آلة حالة محدودة حتمية', accepts: 'Regular Languages', quranRef: 'T07' },
    NFA:          { nameAr: 'آلة حالة غير حتمية',    accepts: 'Regular Languages', quranRef: 'T07' },
    PDA:          { nameAr: 'آلة كومة للأسفل',        accepts: 'Context-Free Languages', quranRef: 'T07' },
    TuringMachine:{ nameAr: 'آلة تورينج',             accepts: 'Recursively Enumerable', note: 'أساس نظرية الحوسبة', quranRef: 'T07' },
    RegEx:        { nameAr: 'تعبيرات منتظمة',          power: 'Regular', use: 'تطابق الأنماط', quranRef: 'S11' },
    CFG:          { nameAr: 'قواعد نحو سياقية حرة',   power: 'Context-Free', use: 'تعريف لغات البرمجة', quranRef: 'T08' },
  },

  COMPUTABILITY: {
    nameAr: 'نظرية القابلية للحوسبة',
    HaltingProblem:   { nameAr: 'مسألة التوقف',        result: 'غير قابلة للحل — Turing 1936',  quranRef: 'T07' },
    ChurchTuring:     { nameAr: 'أطروحة كيرتش-تورينج', result: 'أي حساب قابل = آلة تورينج',    quranRef: 'T07' },
    RiceTheorem:      { nameAr: 'مبرهنة رايس',          result: 'لا خوارزمية عامة للسلوك',      quranRef: 'T07' },
    RecursiveFunction:{ nameAr: 'الدوال الاستعادية',    note: 'أساس البرمجة الوظيفية',          quranRef: 'K07' },
    Oracle:           { nameAr: 'الأوراكل في الحوسبة',  note: 'آلة مع قدرات خارجية',           quranRef: 'SC12' },
  },

  COMPLEXITY_THEORY: {
    nameAr: 'نظرية التعقيد',
    P:      { nameAr: 'المشاكل القابلة للحل في زمن كثير الحدود',           examples: ['Sorting','Shortest Path'], quranRef: 'T07' },
    NP:     { nameAr: 'المشاكل القابلة للتحقق في زمن كثير الحدود',          examples: ['SAT','TSP'], quranRef: 'T07' },
    NPC:    { nameAr: 'NP-Complete — أصعب مشاكل NP',                       examples: ['3-SAT','Clique','Knapsack'], quranRef: 'T07' },
    PvsNP:  { nameAr: 'مسألة P=NP',                                        status: 'غير محلولة — تستحق 1M دولار', quranRef: 'T07' },
    PSPACE: { nameAr: 'مشاكل مساحة كثير الحدود',                            examples: ['QSAT'], quranRef: 'T07' },
    Coclass:{ nameAr: 'co-NP — مكمّل NP',                                  examples: ['Tautology'], quranRef: 'T07' },
    BPP:    { nameAr: 'احتمالية زمن كثير الحدود بخطأ محدود',               examples: ['Miller-Rabin'], quranRef: 'T07' },
    EXPTIME:{ nameAr: 'زمن أسي',                                           examples: ['Chess','Go optimal'], quranRef: 'T07' },
  },

  INFORMATION_THEORY: {
    nameAr: 'نظرية المعلومات',
    Shannon:     { nameAr: 'نظرية شانون',      formula: 'H = -Σp·log₂p', use: 'إنتروبيا المعلومات',   quranRef: 'T08' },
    Entropy:     { nameAr: 'الإنتروبيا',        def: 'عدم اليقين في المصدر',                           quranRef: 'T07' },
    ChannelCap:  { nameAr: 'سعة القناة',        formula: 'C = B·log₂(1+S/N)',                          quranRef: 'SC11' },
    Compression: { nameAr: 'ضغط البيانات',      types: ['Lossless: Huffman/LZ77/Deflate', 'Lossy: JPEG/MP3/HEVC'], quranRef: 'S11' },
    Kolmogorov:  { nameAr: 'التعقيد الكولموغوروفي', def: 'أقصر برنامج ينتج سلسلة',                  quranRef: 'T07' },
    Redundancy:  { nameAr: 'الفائض في المعلومات', note: 'أساس تصحيح الأخطاء',                        quranRef: 'T06' },
  },

  FORMAL_LANGUAGES: {
    nameAr: 'اللغات الرسمية',
    ChomskyHierarchy: {
      nameAr: 'هرم تشومسكي',
      type0: { nameAr: 'غير مقيّدة',       machine: 'آلة تورينج',         quranRef: 'T07' },
      type1: { nameAr: 'حساسة للسياق',     machine: 'آلة خطية محدودة',    quranRef: 'T07' },
      type2: { nameAr: 'حرة من السياق',    machine: 'آلة PDA',             quranRef: 'T07' },
      type3: { nameAr: 'منتظمة',           machine: 'آلة حالة محدودة DFA', quranRef: 'T07' },
    },
    Lexer:   { nameAr: 'المحلل المعجمي',   tools: ['Flex','ANTLR','lex'],  use: 'تقطيع المفردات', quranRef: 'D08' },
    Parser:  { nameAr: 'المحلل النحوي',    types: ['LL(k)','LR(k)','LALR','Earley'], use: 'بناء شجرة الصياغة', quranRef: 'D08' },
    AST:     { nameAr: 'شجرة الصياغة المجردة', use: 'تمثيل البرامج', quranRef: 'D08' },
    Grammar: { nameAr: 'القواعد الرسمية',  tools: ['BNF','EBNF','ABNF'],   use: 'تعريف لغات البرمجة', quranRef: 'T08' },
  },

  DISCRETE_MATH: {
    nameAr: 'الرياضيات المنفصلة',
    Logic:         { nameAr: 'المنطق الرياضي',          ops: ['AND','OR','NOT','XOR','NAND','NOR','→','↔'], quranRef: 'T09' },
    SetTheory:     { nameAr: 'نظرية المجموعات',          ops: ['∪ اتحاد','∩ تقاطع','∖ طرح','× ضرب ديكارتي','ℙ مجموعة القوى'], quranRef: 'T07' },
    Relations:     { nameAr: 'العلاقات والدوال',          types: ['reflexive','symmetric','transitive','equivalence','partial order'], quranRef: 'T06' },
    GraphTheory:   { nameAr: 'نظرية الرسوم البيانية',    topics: ['BFS','DFS','MST','Dijkstra','Floyd','Topological Sort'], quranRef: 'T09' },
    Combinatorics: { nameAr: 'علم التوافقيات والعد',     formulas: ['nCr','nPr','Inclusion-Exclusion','Pigeonhole'], quranRef: 'T07' },
    NumberTheory:  { nameAr: 'نظرية الأعداد',            topics: ['GCD','LCM','Primes','Modular Arithmetic','Fermat','Euler'], quranRef: 'T07' },
    Proofs:        { nameAr: 'طرق البرهان',              types: ['Direct','Contradiction','Induction','Contrapositive'], quranRef: 'T09' },
    Boolean:       { nameAr: 'الجبر البولياني',          ops: ['AND gate','OR gate','NOT','XOR','NAND','NOR'], quranRef: 'D08' },
  },

  COMPUTER_ARCHITECTURE: {
    nameAr: 'معمارية الحاسب',
    VonNeumann:    { nameAr: 'معمارية فون نيومان',      components: ['CPU','Memory','I/O','Bus'], quranRef: 'SC12' },
    CPU:           { nameAr: 'وحدة المعالجة المركزية', stages: ['Fetch','Decode','Execute','Writeback'], quranRef: 'SC12' },
    Pipeline:      { nameAr: 'خط الأنابيب',             hazards: ['Structural','Data','Control'], quranRef: 'T06' },
    Cache:         { nameAr: 'ذاكرة التخبئة',           levels: ['L1','L2','L3'], policies: ['FIFO','LRU','LFU'], quranRef: 'SC12' },
    MemoryHierarchy: { nameAr: 'هرم الذاكرة',           layers: ['Register','Cache L1-L3','RAM','SSD','HDD'], quranRef: 'T07' },
    CISC:          { nameAr: 'تعليمات معقدة',           examples: ['x86','x86-64'],  quranRef: 'SC12' },
    RISC:          { nameAr: 'تعليمات مختزلة',          examples: ['ARM','RISC-V','MIPS','PowerPC'], quranRef: 'SC12' },
    Multicore:     { nameAr: 'متعدد الأنوية',           models: ['SMP','NUMA','SIMD','MIMD'], quranRef: 'SC12' },
    GPU:           { nameAr: 'وحدة المعالجة الرسومية',  use: 'AI + رسوميات + GPGPU', quranRef: 'D01' },
    FPGA:          { nameAr: 'مصفوفة بوابات قابلة للبرمجة', use: 'DSP + معالجة متخصصة', quranRef: 'D19' },
    ASICs:         { nameAr: 'دوائر متكاملة خاصة',      use: 'تعدين + AI inference', quranRef: 'D01' },
  },

  OPERATING_SYSTEM_THEORY: {
    nameAr: 'نظرية أنظمة التشغيل',
    Process:      { nameAr: 'العملية', states: ['New','Ready','Running','Waiting','Terminated'], quranRef: 'SC14' },
    Thread:       { nameAr: 'الخيط',  note: 'وحدة تنفيذ داخل عملية',  quranRef: 'SC14' },
    Scheduling:   { nameAr: 'جدولة المعالج', algorithms: ['FCFS','SJF','RR','Priority','CFS','EDF'], quranRef: 'T06' },
    Deadlock:     { nameAr: 'الاختناق', conditions: ['Mutual Exclusion','Hold+Wait','No Preemption','Circular Wait'], quranRef: 'T09' },
    VirtualMemory:{ nameAr: 'الذاكرة الافتراضية', techniques: ['Paging','Segmentation','Demand Paging','Thrashing'], quranRef: 'SC12' },
    FileSystem:   { nameAr: 'نظام الملفات', types: ['ext4','NTFS','FAT32','APFS','ZFS','Btrfs','XFS'], quranRef: 'A05' },
    IPC:          { nameAr: 'تواصل بين العمليات', methods: ['Pipe','Socket','Shared Memory','Message Queue','Semaphore'], quranRef: 'SC13' },
    Synchronization: { nameAr: 'المزامنة', mechanisms: ['Mutex','Semaphore','Monitor','Spinlock','RWLock'], quranRef: 'T06' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅵ: الخوارزميات وهياكل البيانات (Algorithms & Data Structures) ────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨

const LAYER_ALGORITHMS_DS = Object.freeze({

  nameAr: 'الخوارزميات وهياكل البيانات',
  tawheedRef: 'T06 — صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ',
  cellCount: 9,

  COMPLEXITY: {
    nameAr: 'تعقيد الخوارزميات — Big-O',
    'O(1)':       { nameAr: 'ثابت',        example: 'HashMap lookup',    quranRef: 'SC12 — آنياً' },
    'O(log n)':   { nameAr: 'لوغاريتمي',  example: 'Binary Search',     quranRef: 'T06 — دقة' },
    'O(n)':       { nameAr: 'خطي',         example: 'Linear Scan',       quranRef: 'T07' },
    'O(n log n)': { nameAr: 'شبه خطي',    example: 'Merge Sort',        quranRef: 'T06' },
    'O(n²)':      { nameAr: 'تربيعي',     example: 'Bubble Sort',       quranRef: 'T07' },
    'O(2ⁿ)':      { nameAr: 'أسي',        example: 'Subset Enumeration', quranRef: 'K09' },
    'O(n!)':      { nameAr: 'عاملي',      example: 'Permutations',      quranRef: 'K09' },
  },

  DATA_STRUCTURES: {
    nameAr: 'هياكل البيانات',
    Array:         { nameAr: 'مصفوفة',       access: 'O(1)', insert: 'O(n)', delete: 'O(n)',      quranRef: 'T07' },
    LinkedList:    { nameAr: 'قائمة مرتبطة', access: 'O(n)', insert: 'O(1)', delete: 'O(1)',      quranRef: 'T09' },
    DoublyLinked:  { nameAr: 'قائمة مرتبطة مزدوجة', note: 'تنقل للأمام والخلف',               quranRef: 'T09' },
    Stack:         { nameAr: 'مكدَّسة',       policy: 'LIFO', ops: ['push','pop','peek'],           quranRef: 'T09' },
    Queue:         { nameAr: 'طابور',         policy: 'FIFO', ops: ['enqueue','dequeue'],           quranRef: 'T09' },
    Deque:         { nameAr: 'طابور مزدوج',   policy: 'LIFO+FIFO', ops: ['front','back'],          quranRef: 'T09' },
    HashMap:       { nameAr: 'خريطة هاش',    access: 'O(1) avg', collision: ['Chaining','Open Addressing'], quranRef: 'SC12' },
    BinaryTree:    { nameAr: 'شجرة ثنائية',  maxChildren: 2, traverse: ['PreOrder','InOrder','PostOrder'], quranRef: 'T09' },
    BST:           { nameAr: 'شجرة ثنائية بحث', search: 'O(log n) avg', insert: 'O(log n) avg',  quranRef: 'T09' },
    AVLTree:       { nameAr: 'شجرة AVL',      type: 'Self-balancing BST', balance: '|h(L)-h(R)|≤1', quranRef: 'T06' },
    RedBlackTree:  { nameAr: 'شجرة حمراء سوداء', type: 'Self-balancing', use: 'Linux rbtree/Java TreeMap', quranRef: 'T06' },
    BTree:         { nameAr: 'شجرة B',        use: 'قواعد البيانات + أنظمة الملفات',             quranRef: 'A05' },
    Heap:          { nameAr: 'كومة',          types: ['Max-Heap','Min-Heap'], buildHeap: 'O(n)',   quranRef: 'T10' },
    Trie:          { nameAr: 'شجرة البادئة',  use: 'البحث في النصوص + Autocomplete',              quranRef: 'T08' },
    SegmentTree:   { nameAr: 'شجرة المقاطع',  query: 'O(log n)', update: 'O(log n)', use: 'RMQ',  quranRef: 'T07' },
    FenwickTree:   { nameAr: 'شجرة BIT',      use: 'prefix sum سريعة',                            quranRef: 'T07' },
    SuffixArray:   { nameAr: 'مصفوفة اللواحق', use: 'تطابق النصوص + bioinformatics',              quranRef: 'T08' },
    DisjointSet:   { nameAr: 'مجموعات منفصلة (Union-Find)', use: 'MST + الاتصالية',              quranRef: 'T09' },
    BloomFilter:   { nameAr: 'مرشح بلوم',     type: 'احتمالي', use: 'كاشف التكرار السريع',        quranRef: 'S06' },
    Graph:         { nameAr: 'رسم بياني',      types: ['Directed','Undirected','Weighted','DAG'],  quranRef: 'T09' },
    SkipList:      { nameAr: 'قائمة القفز',   search: 'O(log n) avg',  use: 'Redis + ConcurrentSkipList', quranRef: 'T09' },
    LRUCache:      { nameAr: 'كاش LRU',       impl: 'HashMap + DoublyLinkedList', use: 'Caching', quranRef: 'SC12' },
  },

  SORTING: {
    nameAr: 'خوارزميات الفرز',
    BubbleSort:    { avg: 'O(n²)',    stable: true,  best: 'O(n)',      note: 'تعليمي',            quranRef: 'S06' },
    SelectionSort: { avg: 'O(n²)',    stable: false, inPlace: true,    note: 'أقل عمليات تبادل',   quranRef: 'T06' },
    InsertionSort: { avg: 'O(n²)',    stable: true,  best: 'O(n)',      note: 'ممتاز للبيانات الصغيرة', quranRef: 'S06' },
    MergeSort:     { avg: 'O(nlogn)', stable: true,  space: 'O(n)',     note: 'يضمن O(nlogn)',     quranRef: 'T06' },
    QuickSort:     { avg: 'O(nlogn)', stable: false, pivot: 'median3', note: 'أسرع عملياً',        quranRef: 'S12' },
    HeapSort:      { avg: 'O(nlogn)', stable: false, space: 'O(1)',     note: 'ذاكرة منخفضة',      quranRef: 'T10' },
    TimSort:       { avg: 'O(nlogn)', stable: true,  note: 'Python + Java default',               quranRef: 'T06' },
    RadixSort:     { avg: 'O(nk)',    stable: true,  note: 'ممتاز للأعداد الصحيحة',               quranRef: 'T07' },
    CountingSort:  { avg: 'O(n+k)',   stable: true,  prereq: 'نطاق محدود',                        quranRef: 'S09' },
    BucketSort:    { avg: 'O(n)',     note: 'موزَّع بالتساوي',                                     quranRef: 'T10' },
    ShellSort:     { avg: 'O(n^1.5)', note: 'InsertionSort بقفزات',                               quranRef: 'S12' },
  },

  SEARCHING: {
    nameAr: 'خوارزميات البحث',
    LinearSearch:      { complexity: 'O(n)',      prereq: 'لا',  quranRef: 'T07' },
    BinarySearch:      { complexity: 'O(log n)',  prereq: 'مُرتَّب', quranRef: 'T06' },
    JumpSearch:        { complexity: 'O(√n)',     prereq: 'مُرتَّب', quranRef: 'T07' },
    InterpolationSearch: { complexity: 'O(log log n)', prereq: 'موزَّع بالتساوي', quranRef: 'T07' },
    ExponentialSearch: { complexity: 'O(log i)',  prereq: 'مُرتَّب', quranRef: 'S12' },
    FibonacciSearch:   { complexity: 'O(log n)',  prereq: 'مُرتَّب', quranRef: 'T07' },
    TernarySearch:     { complexity: 'O(log₃ n)', use: 'أقصى/أدنى دالة أحادية البعد', quranRef: 'T07' },
  },

  GRAPH_ALGORITHMS: {
    nameAr: 'خوارزميات الرسوم البيانية',
    BFS:           { nameAr: 'البحث بالاتساع',         complexity: 'O(V+E)', use: 'أقصر مسار غير موزون', quranRef: 'SC13' },
    DFS:           { nameAr: 'البحث بالعمق',            complexity: 'O(V+E)', use: 'اكتشاف + ترتيب طوبولوجي', quranRef: 'SC13' },
    Dijkstra:      { nameAr: 'أقصر مسار Dijkstra',     complexity: 'O((V+E)logV)', use: 'GPS + شبكات', quranRef: 'SC13' },
    BellmanFord:   { nameAr: 'أقصر مسار مع أوزان سالبة', complexity: 'O(VE)',   use: 'شبكات BGP', quranRef: 'SC13' },
    FloydWarshall: { nameAr: 'كل المسارات القصيرة',      complexity: 'O(V³)',   use: 'مسافات كاملة', quranRef: 'SC13' },
    Kruskal:       { nameAr: 'MST — Kruskal',           complexity: 'O(ElogE)', use: 'شبكات + تكلفة أدنى', quranRef: 'T10' },
    Prim:          { nameAr: 'MST — Prim',              complexity: 'O(ElogV)', use: 'شبكات كثيفة', quranRef: 'T10' },
    TopologicalSort: { nameAr: 'فرز طوبولوجي',          complexity: 'O(V+E)', use: 'تبعيات + بناء', quranRef: 'T06' },
    SCC:           { nameAr: 'مكونات قوية التواصل',      alg: ['Tarjan','Kosaraju'], use: 'تحليل الشبكات', quranRef: 'SC13' },
    'A*':          { nameAr: 'بحث A-Star',              complexity: 'O(b^d)', use: 'ألعاب + تخطيط', quranRef: 'SC13' },
    MaxFlow:       { nameAr: 'أقصى تدفق',               alg: ['Ford-Fulkerson','Edmonds-Karp','Dinic'], use: 'شبكات', quranRef: 'T10' },
    BipartiteMatch:{ nameAr: 'تطابق ثنائي',             alg: ['Hungarian','Hopcroft-Karp'], use: 'توزيع المهام', quranRef: 'T10' },
  },

  DYNAMIC_PROGRAMMING: {
    nameAr: 'البرمجة الديناميكية',
    LCS:        { nameAr: 'أطول تسلسل مشترك',   example: 'diff + git',           quranRef: 'S11' },
    LIS:        { nameAr: 'أطول تسلسل متصاعد',  complexity: 'O(nlogn)',           quranRef: 'T07' },
    Knapsack:   { nameAr: 'مسألة الحقيبة',       types: ['0/1','Bounded','Unbounded'], quranRef: 'T07' },
    EditDistance:{ nameAr: 'مسافة التعديل',      use: 'spell check + NLP',        quranRef: 'T08' },
    CoinChange: { nameAr: 'صرف العملات',         note: 'تحسين الاختيار',          quranRef: 'S09' },
    MatrixChain:{ nameAr: 'ضرب المصفوفات المتسلسل', use: 'ML + رسوميات',         quranRef: 'T07' },
    Fibonacci:  { nameAr: 'فيبوناتشي DP',        memoization: true, tabulation: true, quranRef: 'T07' },
    FloydWarshall: { nameAr: 'أقصر مسار كل الأزواج', quranRef: 'SC13' },
  },

  DIVIDE_CONQUER: {
    nameAr: 'فرّق تسُد',
    MergeSort:   { quranRef: 'T06' },
    QuickSort:   { quranRef: 'S12' },
    BinarySearch:{ quranRef: 'T06' },
    FFT:         { nameAr: 'تحويل فورييه السريع', use: 'معالجة الإشارات + ضرب الأعداد الضخمة', quranRef: 'T07' },
    KaratsubaMultiply: { nameAr: 'ضرب كاراتسوبا', complexity: 'O(n^1.585)', quranRef: 'T07' },
    StrassenMatrix: { nameAr: 'ضرب مصفوفات ستراسن', complexity: 'O(n^2.807)', quranRef: 'T07' },
  },

  GREEDY: {
    nameAr: 'الخوارزميات الجشعة',
    HuffmanCoding: { use: 'ضغط البيانات', quranRef: 'S11' },
    ActivitySelection: { use: 'جدولة المهام', quranRef: 'T06' },
    FractionalKnapsack: { use: 'تحسين الحمل', quranRef: 'T09' },
    Kruskal:           { use: 'MST', quranRef: 'T10' },
    Prim:              { use: 'MST', quranRef: 'T10' },
    Dijkstra:          { use: 'أقصر مسار', quranRef: 'SC13' },
  },

  STRING_ALGORITHMS: {
    nameAr: 'خوارزميات النصوص',
    KMP:       { nameAr: 'Knuth-Morris-Pratt',    complexity: 'O(n+m)', use: 'بحث نص',           quranRef: 'T08' },
    BoyerMoore:{ nameAr: 'Boyer-Moore',            complexity: 'O(nm) worst', use: 'بحث نص فعّال', quranRef: 'T08' },
    RabinKarp: { nameAr: 'Rabin-Karp',             use: 'plagiarism + DNA',                       quranRef: 'T08' },
    ZAlgorithm:{ nameAr: 'خوارزمية Z',             complexity: 'O(n)',   use: 'بحث نمط',          quranRef: 'T08' },
    AhoCorasick:{ nameAr: 'Aho-Corasick',          use: 'بحث عدة أنماط في وقت واحد',             quranRef: 'T08' },
    SuffixArray:{ nameAr: 'مصفوفة اللاحقة',        use: 'bioinformatics + full-text search',      quranRef: 'T08' },
    SuffixTree: { nameAr: 'شجرة اللاحقة',          use: 'أسرع بحث نصي + تحليل تسلسلات',         quranRef: 'T08' },
    ManachersAlgorithm: { nameAr: 'Manacher',      use: 'أطول سلسلة متناظرة O(n)',               quranRef: 'T08' },
    Levenshtein:{ nameAr: 'مسافة ليفنشتاين',       use: 'spell check + NLP + DNA',               quranRef: 'T08' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅶ: هندسة البرمجيات والمعمارية (Software Engineering & Architecture)
// ══════════════════════════════════════════════════════════════════════════════
// ﴿إِنَّ اللَّهَ يُحِبُّ الَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ صَفًّا كَأَنَّهُم بُنْيَانٌ مَّرْصُوصٌ﴾ — الصف: ٤

const LAYER_SOFTWARE_ENGINEERING = Object.freeze({

  nameAr: 'هندسة البرمجيات والمعمارية',
  tawheedRef: 'SC16 — بُنْيَانٌ مَّرْصُوصٌ',
  cellCount: 8,

  SOLID_PRINCIPLES: {
    nameAr: 'مبادئ SOLID',
    S: { name: 'Single Responsibility',  nameAr: 'مسؤولية واحدة',  detail: 'كل صنف لغرض واحد فقط',           quranRef: 'S11 — جوامع الكلم' },
    O: { name: 'Open/Closed',           nameAr: 'مفتوح/مغلق',     detail: 'مفتوح للتوسع، مغلق للتعديل',       quranRef: 'T06 — الإتقان' },
    L: { name: 'Liskov Substitution',   nameAr: 'إحلال ليسكوف',   detail: 'الفئات الفرعية تحل محل الأصل',    quranRef: 'S05 — الصدق' },
    I: { name: 'Interface Segregation', nameAr: 'فصل الواجهات',    detail: 'واجهات صغيرة محددة لا كبيرة',     quranRef: 'A04 — الصراط المستقيم' },
    D: { name: 'Dependency Inversion',  nameAr: 'عكس التبعية',    detail: 'تبعية على التجريد لا التطبيق',    quranRef: 'T09 — الحكمة' },
  },

  OTHER_PRINCIPLES: {
    nameAr: 'مبادئ هندسة أخرى',
    DRY:   { nameAr: 'لا تكرار — Don\'t Repeat Yourself', quranRef: 'S11 — جوامع الكلم' },
    KISS:  { nameAr: 'ابقِها بسيطة — Keep It Simple',      quranRef: 'S06 — يسِّروا' },
    YAGNI: { nameAr: 'لن تحتاجها — You Aren\'t Gonna Need It', quranRef: 'S06' },
    POLA:  { nameAr: 'مبدأ أقل دهشة',                       quranRef: 'S06' },
    SoC:   { nameAr: 'فصل الاهتمامات',                      quranRef: 'S11' },
    LoD:   { nameAr: 'قانون ديميتر',                        quranRef: 'S11' },
    CoC:   { nameAr: 'اتفاقية قبل تهيئة',                   quranRef: 'S06' },
    Composition: { nameAr: 'التركيب على الوراثة',           quranRef: 'T09' },
    Encapsulation: { nameAr: 'التغليف والإخفاء',            quranRef: 'A01' },
    Abstraction:   { nameAr: 'التجريد',                     quranRef: 'T09' },
    Cohesion:      { nameAr: 'التماسك العالي',               quranRef: 'SC16' },
    Coupling:      { nameAr: 'الاقتران المنخفض',             quranRef: 'S11' },
  },

  DESIGN_PATTERNS: {
    nameAr: 'أنماط التصميم — GoF 23 نمطاً',
    Creational: {
      nameAr: 'إنشائية',
      Singleton:        { use: 'كائن واحد في التطبيق',         quranRef: 'T01 — التوحيد' },
      Factory:          { use: 'إنشاء كائنات دون تحديد الصنف', quranRef: 'T04' },
      AbstractFactory:  { use: 'مصانع مجموعات كائنات',          quranRef: 'T04' },
      Builder:          { use: 'بناء كائنات معقدة خطوة بخطوة', quranRef: 'SC16' },
      Prototype:        { use: 'نسخ الكائنات',                  quranRef: 'S14' },
    },
    Structural: {
      nameAr: 'هيكلية',
      Adapter:   { use: 'واجهة توافق بين أنظمة مختلفة',   quranRef: 'SC15' },
      Bridge:    { use: 'فصل التجريد عن التطبيق',         quranRef: 'S11' },
      Composite: { use: 'شجرة من الكائنات',               quranRef: 'T09' },
      Decorator: { use: 'إضافة سلوك ديناميكياً',         quranRef: 'T06' },
      Facade:    { use: 'واجهة بسيطة لنظام معقد',        quranRef: 'S06' },
      Flyweight: { use: 'مشاركة الكائنات المتشابهة',      quranRef: 'S11' },
      Proxy:     { use: 'وسيط للتحكم في الوصول',         quranRef: 'A01' },
    },
    Behavioral: {
      nameAr: 'سلوكية',
      ChainOfResponsibility: { use: 'سلسلة معالجة الطلبات', quranRef: 'T09' },
      Command:     { use: 'تغليف الطلب كأمر',            quranRef: 'T05' },
      Iterator:    { use: 'الاجتياز دون كشف البنية',     quranRef: 'SC12' },
      Mediator:    { use: 'وسيط التواصل',                 quranRef: 'SC13' },
      Memento:     { use: 'حفظ الحالة واستعادتها',       quranRef: 'A05' },
      Observer:    { use: 'إخطار المستمعين بالتغيرات',   quranRef: 'SC13' },
      State:       { use: 'سلوك مختلف حسب الحالة',      quranRef: 'T07' },
      Strategy:    { use: 'خوارزميات قابلة للتبديل',     quranRef: 'T09' },
      Template:    { use: 'هيكل ثابت وخطوات متغيرة',    quranRef: 'SC16' },
      Visitor:     { use: 'عمليات على هياكل كائنات',     quranRef: 'K04' },
    },
    Modern: {
      nameAr: 'أنماط حديثة',
      CQRS:             { nameAr: 'فصل الأوامر والاستعلامات', quranRef: 'S11' },
      EventSourcing:    { nameAr: 'مصدر الأحداث',              quranRef: 'A05' },
      Saga:             { nameAr: 'إدارة معاملات موزعة',        quranRef: 'T06' },
      CircuitBreaker:   { nameAr: 'قاطع الدارة',               quranRef: 'D04' },
      BulkHead:         { nameAr: 'عزل الأعطال',               quranRef: 'D04' },
      Outbox:           { nameAr: 'صندوق البريد الصادر',        quranRef: 'SC13' },
      Sidecar:          { nameAr: 'الشريط الجانبي',             quranRef: 'D05' },
      ServiceMesh:      { nameAr: 'شبكة الخدمات',              quranRef: 'D05' },
    },
  },

  ARCHITECTURE_PATTERNS: {
    nameAr: 'أنماط المعمارية',
    Monolith:       { nameAr: 'أحادية',           use: 'بداية بسيطة + تطوير سريع',        tradeoff: 'صعوبة التوسع', quranRef: 'T01' },
    Layered:        { nameAr: 'طبقية',             layers: ['Presentation','Business','Data'], quranRef: 'SC14' },
    MVC:            { nameAr: 'نموذج-عرض-تحكم',   use: 'ويب + تطبيقات',                   quranRef: 'T09' },
    MVP:            { nameAr: 'نموذج-عرض-عارض',   use: 'Android + تطبيقات',               quranRef: 'T09' },
    MVVM:           { nameAr: 'نموذج-عرض-نموذج عرض', use: 'Angular + WPF + SwiftUI',     quranRef: 'T09' },
    Hexagonal:      { nameAr: 'السداسي / Ports and Adapters', use: 'قابلية الاختبار',     quranRef: 'T09' },
    CleanArchitecture: { nameAr: 'المعمارية النظيفة', use: 'قابلية الاختبار + DDD',       quranRef: 'T06' },
    DDD:            { nameAr: 'تصميم المجال المحرك', use: 'نمذجة الأعمال المعقدة',        quranRef: 'SC16' },
    Microservices:  { nameAr: 'خدمات مصغرة',      use: 'تطوير مستقل + توسع مستقل',       tradeoff: 'تعقيد التوزيع', quranRef: 'D17' },
    EventDriven:    { nameAr: 'مبني على الأحداث',  use: 'انفصال + مرونة',                  quranRef: 'D15' },
    SOA:            { nameAr: 'معمارية الخدمات',   use: 'Enterprise Integration',           quranRef: 'D17' },
    Serverless:     { nameAr: 'بلا خوادم',         use: 'FaaS + Lambda + تكلفة متغيرة',   quranRef: 'D05' },
    CQRS:           { nameAr: 'فصل الأوامر والاستعلامات', use: 'قواعد بيانات مرنة',       quranRef: 'S11' },
    'Event Sourcing': { nameAr: 'تخزين الأحداث',  use: 'تتبع كامل + replay',              quranRef: 'A05' },
    Streaming:      { nameAr: 'تدفق البيانات',     use: 'Kafka + Kinesis + Flink',         quranRef: 'K10' },
    'Actor Model':  { nameAr: 'نموذج الممثلين',   use: 'Erlang/Elixir + Akka',            quranRef: 'SC16' },
  },

  API_STYLES: {
    nameAr: 'أساليب API',
    REST:       { nameAr: 'نقل الحالة التمثيلية', principles: ['Stateless','Cacheable','Layered','Uniform Interface'], quranRef: 'D15' },
    GraphQL:    { nameAr: 'API ذكي المرن',         use: 'موبايل + تقليل overfetch',         quranRef: 'D15' },
    gRPC:       { nameAr: 'RPC سريع بـ Protobuf',  use: 'microservices + أداء عالٍ',        quranRef: 'S11' },
    WebSocket:  { nameAr: 'اتصال ثنائي حي',        use: 'دردشة + ألعاب + تحديثات حية',     quranRef: 'SC13' },
    SSE:        { nameAr: 'أحداث خادم الخادم',     use: 'تحديثات من الخادم للعميل',         quranRef: 'SC13' },
    SOAP:       { nameAr: 'بروتوكول XML للخدمات', use: 'Enterprise + مالية + حكومية',      quranRef: 'A05' },
    Webhook:    { nameAr: 'إخطارات HTTP',           use: 'GitHub + Stripe + Zapier',         quranRef: 'SC13' },
    EventBus:   { nameAr: 'ناقل الأحداث',          use: 'معمارية الأحداث الداخلية',          quranRef: 'D15' },
    'MQTT':     { nameAr: 'رسائل IoT خفيفة',       use: 'IoT + SCADA + Smart Home',         quranRef: 'D09' },
    AMQP:       { nameAr: 'بروتوكول صف الرسائل',   use: 'RabbitMQ + Azure Service Bus',     quranRef: 'D15' },
  },

  TESTING: {
    nameAr: 'اختبار البرمجيات',
    Unit:        { nameAr: 'اختبار الوحدة',       tools: ['Jest','Vitest','JUnit','pytest','RSpec'], coverage: 'وحدة واحدة معزولة', quranRef: 'S05' },
    Integration: { nameAr: 'اختبار التكامل',       tools: ['Supertest','Testcontainers'],    coverage: 'تفاعل المكونات', quranRef: 'T06' },
    E2E:         { nameAr: 'اختبار شامل',          tools: ['Playwright','Cypress','Selenium'], coverage: 'تجربة المستخدم كاملة', quranRef: 'T06' },
    TDD:         { nameAr: 'تطوير موجه بالاختبار', cycle: ['Red→Green→Refactor'],             quranRef: 'S03' },
    BDD:         { nameAr: 'تطوير موجه بالسلوك',  tools: ['Cucumber','Gherkin'],              quranRef: 'S05' },
    Load:        { nameAr: 'اختبار الحمل',         tools: ['k6','JMeter','Locust','Gatling'], quranRef: 'S12' },
    Security:    { nameAr: 'اختبار الأمان',        tools: ['OWASP ZAP','Burp Suite','Semgrep'], quranRef: 'D04' },
    Mutation:    { nameAr: 'اختبار الطفرات',       tools: ['PIT','Stryker'],                  quranRef: 'S03' },
    Contract:    { nameAr: 'اختبار العقد',         tools: ['Pact','Spring Cloud Contract'],   quranRef: 'A01' },
    Fuzz:        { nameAr: 'اختبار الضبابي',       tools: ['AFL','LibFuzzer','ClusterFuzz'],  quranRef: 'D04' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅷ: أدوات التطوير وDevOps وCI/CD ─────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ» — البيهقي: ٤٣٢٧

const LAYER_DEV_TOOLS_DEVOPS = Object.freeze({

  nameAr: 'أدوات التطوير وDevOps وCI/CD',
  tawheedRef: 'S03 — يُتْقِنَهُ',
  cellCount: 6,

  IDEs: {
    nameAr: 'بيئات التطوير المتكاملة',
    VSCode:       { creator: 'Microsoft', lang: 'TypeScript', use: 'الأكثر شيوعاً + Extensions', tawheedRef: 'S03' },
    IntelliJ:     { creator: 'JetBrains', use: 'Java + Kotlin + مشاريع كبيرة', tawheedRef: 'S03' },
    PyCharm:      { creator: 'JetBrains', use: 'Python + AI + علوم بيانات', tawheedRef: 'S03' },
    Xcode:        { creator: 'Apple',     use: 'iOS + macOS + Swift',         tawheedRef: 'S03' },
    'Android Studio': { creator: 'Google', use: 'Android + Kotlin',           tawheedRef: 'S03' },
    Eclipse:      { creator: 'Eclipse Foundation', use: 'Java Enterprise',    tawheedRef: 'S03' },
    Vim:          { creator: 'Bram Moolenaar', use: 'terminal + scripts',     tawheedRef: 'S03' },
    Emacs:        { creator: 'Richard Stallman', use: 'هاكر + Lisp',         tawheedRef: 'S03' },
    Neovim:       { creator: 'مجتمع مفتوح', use: 'Vim + Lua + LSP',          tawheedRef: 'S03' },
    Cursor:       { creator: 'Anysphere', use: 'AI-first IDE',                tawheedRef: 'D01' },
    Zed:          { creator: 'Zed Industries', use: 'أداء عالٍ + تعاون',      tawheedRef: 'S12' },
    WebStorm:     { creator: 'JetBrains', use: 'JavaScript + TypeScript',     tawheedRef: 'S03' },
    CLion:        { creator: 'JetBrains', use: 'C/C++ + Rust',                tawheedRef: 'S03' },
  },

  VCS: {
    nameAr: 'أنظمة التحكم في النسخ',
    Git:        { creator: 'Linus Torvalds/2005', use: 'الأكثر استخداماً عالمياً', model: 'distributed', tawheedRef: 'A05' },
    SVN:        { creator: 'Apache',  use: 'Enterprise + Centralized',     model: 'centralized', tawheedRef: 'A05' },
    Mercurial:  { creator: 'Matt Mackall', use: 'بديل Git',               model: 'distributed', tawheedRef: 'A05' },
    Perforce:   { creator: 'Perforce',    use: 'ألعاب + ملفات ضخمة',     model: 'centralized', tawheedRef: 'A05' },
    GitHub:     { type: 'Git hosting', use: 'أكبر منصة كود مفتوح',        tawheedRef: 'SC13' },
    GitLab:     { type: 'Git hosting', use: 'Self-hosted + CI/CD',         tawheedRef: 'D13' },
    Bitbucket:  { type: 'Git hosting', use: 'Atlassian + Jira integration', tawheedRef: 'D13' },
  },

  BUILD_TOOLS: {
    nameAr: 'أدوات البناء والتحزيم',
    Make:       { lang: 'C/C++',     std: 'POSIX',         use: 'بناء Unix الكلاسيكي',   tawheedRef: 'S03' },
    CMake:      { lang: 'C/C++',     creator: 'Kitware',   use: 'بناء C/C++ متعدد المنصات', tawheedRef: 'S03' },
    Gradle:     { lang: 'Java/Kotlin', creator: 'Gradle Inc', use: 'Android + Java + Kotlin', tawheedRef: 'S03' },
    Maven:      { lang: 'Java',      creator: 'Apache',    use: 'Java Enterprise',          tawheedRef: 'S03' },
    Bazel:      { lang: 'multi',     creator: 'Google',    use: 'Monorepo + builds سريعة', tawheedRef: 'S12' },
    Webpack:    { lang: 'JS',        creator: 'Tobias Koppers', use: 'تحزيم ويب',           tawheedRef: 'S03' },
    Vite:       { lang: 'JS',        creator: 'Evan You', use: 'تطوير ويب سريع جداً',     tawheedRef: 'S12' },
    Rollup:     { lang: 'JS',        creator: 'Rich Harris', use: 'مكتبات JS',              tawheedRef: 'S03' },
    esbuild:    { lang: 'JS',        creator: 'Evan Wallace', use: 'أسرع bundler',          tawheedRef: 'S12' },
    Parcel:     { lang: 'JS',        use: 'بناء بلا إعداد',                                tawheedRef: 'S06' },
    Turbopack:  { lang: 'Rust/JS',   creator: 'Vercel',    use: 'Webpack بـ Rust',          tawheedRef: 'S12' },
    Cargo:      { lang: 'Rust',      creator: 'Rust Foundation', use: 'بناء Rust',          tawheedRef: 'S03' },
    pip:        { lang: 'Python',    creator: 'PSF',       use: 'حزم Python',               tawheedRef: 'S03' },
    npm:        { lang: 'JS',        creator: 'npm Inc',   use: 'حزم Node.js',              tawheedRef: 'S03' },
    yarn:       { lang: 'JS',        creator: 'Facebook',  use: 'npm بديل أسرع',            tawheedRef: 'S12' },
    pnpm:       { lang: 'JS',        creator: 'Zoltan Kochan', use: 'npm أكفأ',             tawheedRef: 'S12' },
    Poetry:     { lang: 'Python',    creator: 'Sébastien Eustace', use: 'Python modern deps', tawheedRef: 'S03' },
    uv:         { lang: 'Python',    creator: 'Astral',    use: 'pip بـ Rust أسرع',         tawheedRef: 'S12' },
  },

  CONTAINERS: {
    nameAr: 'الحاويات والتنسيق',
    Docker:      { creator: 'Docker Inc/2013', use: 'تغليف التطبيقات',          tawheedRef: 'D13' },
    Podman:      { creator: 'Red Hat',          use: 'Docker بلا daemon + rootless', tawheedRef: 'D04' },
    Kubernetes:  { creator: 'Google/2014',      use: 'تنسيق حاويات + self-healing', tawheedRef: 'D05' },
    Helm:        { creator: 'CNCF',             use: 'حزم Kubernetes',            tawheedRef: 'D05' },
    Nomad:       { creator: 'HashiCorp',        use: 'جدولة بسيطة',              tawheedRef: 'D05' },
    'Docker Swarm': { creator: 'Docker',        use: 'تنسيق بسيط',              tawheedRef: 'D13' },
    OpenShift:   { creator: 'Red Hat',          use: 'Kubernetes Enterprise',    tawheedRef: 'D05' },
    Rancher:     { creator: 'SUSE',             use: 'إدارة K8s متعددة',         tawheedRef: 'D05' },
    Containerd:  { creator: 'CNCF',             use: 'Container Runtime',        tawheedRef: 'D13' },
    LXC:         { creator: 'Canonical',        use: 'حاويات Linux خفيفة',       tawheedRef: 'D13' },
  },

  CICD: {
    nameAr: 'التكامل والتسليم المستمر',
    'GitHub Actions': { use: 'CI/CD مدمج في GitHub',      tawheedRef: 'D13' },
    GitLab_CI:        { use: 'CI/CD مدمج في GitLab',      tawheedRef: 'D13' },
    Jenkins:          { creator: 'Kohsuke Kawaguchi', use: 'أكثر CI/CD مرونة', tawheedRef: 'D13' },
    CircleCI:         { use: 'سحابة CI/CD سريعة',         tawheedRef: 'D13' },
    TravisCI:         { use: 'CI/CD مفتوح المصدر',         tawheedRef: 'D13' },
    ArgoCD:           { use: 'GitOps على Kubernetes',      tawheedRef: 'D13' },
    Tekton:           { use: 'CI/CD أصلي K8s',             tawheedRef: 'D13' },
    FluxCD:           { use: 'GitOps مستمر',               tawheedRef: 'D13' },
    Spinnaker:        { use: 'تسليم مستمر متعدد السحابة',  tawheedRef: 'D13' },
    TeamCity:         { creator: 'JetBrains', use: 'CI/CD Enterprise',          tawheedRef: 'D13' },
    DroneCI:          { use: 'CI/CD خفيف',                 tawheedRef: 'D13' },
    Woodpecker:       { use: 'DroneCI مفتوح المصدر',        tawheedRef: 'D13' },
  },

  MONITORING: {
    nameAr: 'الرصد والملاحظة',
    Prometheus:   { use: 'جمع القياسات',               protocol: 'pull', tawheedRef: 'D13' },
    Grafana:      { use: 'لوحات بيانية مرئية',         protocol: 'visualization', tawheedRef: 'D13' },
    'ELK Stack':  { use: 'Elasticsearch + Logstash + Kibana — تحليل السجلات', tawheedRef: 'D11' },
    Jaeger:       { use: 'Distributed Tracing',         protocol: 'OTLP', tawheedRef: 'D13' },
    Zipkin:       { use: 'Tracing خفيف',                tawheedRef: 'D13' },
    OpenTelemetry:{ use: 'قياسات + تتبع + سجلات موحّدة', std: 'CNCF', tawheedRef: 'D13' },
    Datadog:      { use: 'APM + سحابي شامل',            tawheedRef: 'D13' },
    'New Relic':  { use: 'APM Enterprise',               tawheedRef: 'D13' },
    Loki:         { use: 'سجلات مدمجة مع Grafana',      creator: 'Grafana Labs', tawheedRef: 'D13' },
    VictoriaMetrics: { use: 'Prometheus أسرع',           tawheedRef: 'S12' },
    Alertmanager: { use: 'إدارة التنبيهات Prometheus',  tawheedRef: 'D13' },
  },

  SECURITY_TOOLS: {
    nameAr: 'أدوات الأمان',
    Vault:        { creator: 'HashiCorp', use: 'إدارة الأسرار',          tawheedRef: 'D04' },
    Trivy:        { creator: 'Aqua Security', use: 'فحص ثغرات الحاويات', tawheedRef: 'D04' },
    Snyk:         { use: 'فحص ثغرات التبعيات',                            tawheedRef: 'D04' },
    SonarQube:    { use: 'تحليل جودة الكود + أمان',                       tawheedRef: 'D04' },
    OWASP_ZAP:    { use: 'اختبار اختراق ويب',                             tawheedRef: 'D04' },
    Nessus:       { use: 'فحص الثغرات',                                   tawheedRef: 'D04' },
    Wireshark:    { use: 'تحليل حزم الشبكة',                              tawheedRef: 'D04' },
    Semgrep:      { use: 'تحليل ثابت + قواعد مخصصة',                     tawheedRef: 'D04' },
    CertManager:  { use: 'إدارة TLS تلقائية K8s',                         tawheedRef: 'D04' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅸ: المنهجيات والأطر (Methodologies & Frameworks) ─────────────────
// ══════════════════════════════════════════════════════════════════════════════
// «يَسِّرُوا وَلَا تُعَسِّرُوا» — البخاري: ٣٩

const LAYER_METHODOLOGIES = Object.freeze({

  nameAr: 'المنهجيات والأطر',
  tawheedRef: 'S06 — يَسِّرُوا وَلَا تُعَسِّرُوا',
  cellCount: 5,

  AGILE: {
    nameAr: 'المنهجية الرشيقة',
    Scrum:        { roles: ['Product Owner','Scrum Master','Dev Team'], ceremonies: ['Sprint Planning','Daily Standup','Sprint Review','Retrospective'], quranRef: 'S06' },
    Kanban:       { principles: ['Visualize Flow','Limit WIP','Manage Flow','Make Policies Explicit'], quranRef: 'S06' },
    XP:           { nameAr: 'البرمجة المتطرفة', practices: ['TDD','Pair Programming','Continuous Integration','Refactoring'], quranRef: 'S03' },
    SAFe:         { nameAr: 'Scaled Agile Framework', use: 'أجايل على مستوى المؤسسة', quranRef: 'SC16' },
    LeSS:         { nameAr: 'Large-Scale Scrum', use: 'سكرم لفرق متعددة', quranRef: 'SC16' },
    Nexus:        { nameAr: 'سكرم موسَّع', use: '3-9 فرق سكرم', quranRef: 'SC16' },
    DAD:          { nameAr: 'Disciplined Agile Delivery', use: 'أجايل هجين', quranRef: 'S06' },
    AgileManifesto: { nameAr: 'بيان أجايل/2001', values: ['Individuals over Processes','Working software over Documentation','Customer collaboration over Negotiation','Responding to Change over Following a Plan'], quranRef: 'S06' },
  },

  TRADITIONAL: {
    nameAr: 'المنهجيات التقليدية',
    Waterfall:    { nameAr: 'الشلال', phases: ['Requirements','Design','Implementation','Verification','Maintenance'], quranRef: 'SC16' },
    VModel:       { nameAr: 'نموذج V', phases: ['Requirements↔Acceptance','Design↔Integration','Coding↔Unit'], quranRef: 'T06' },
    Spiral:       { nameAr: 'اللولبي', phases: ['Planning','Risk Analysis','Engineering','Evaluation'], quranRef: 'T09' },
    RUP:          { nameAr: 'Rational Unified Process', phases: ['Inception','Elaboration','Construction','Transition'], quranRef: 'T06' },
    PRINCE2:      { nameAr: 'مشاريع في بيئات خاضعة للرقابة', use: 'حكومي + UK Enterprise', quranRef: 'SC16' },
  },

  LEAN: {
    nameAr: 'منهجية Lean',
    LeanDevelopment: { principles: ['Eliminate Waste','Amplify Learning','Decide Late','Deliver Fast','Empower Team','Build Integrity In','See the Whole'], quranRef: 'S06' },
    LeanStartup:     { principles: ['Build-Measure-Learn','MVP','Pivot or Persevere'], quranRef: 'S06' },
    SixSigma:        { nameAr: 'ستة سيغما', levels: ['DMAIC','DMADV'], use: 'تحسين العمليات', quranRef: 'T06' },
    Kaizen:          { nameAr: 'التحسين المستمر', use: 'تحسين يومي صغير', quranRef: 'S15' },
    ValueStream:     { nameAr: 'تدفق القيمة', use: 'تحديد الهدر وتحسينه', quranRef: 'S06' },
  },

  DEVOPS_SRE: {
    nameAr: 'DevOps وSRE',
    DevOps:       { principles: ['Culture','Automation','Lean','Measurement','Sharing'], pillars: ['CI/CD','IaC','Monitoring','Collaboration'], quranRef: 'S03' },
    SRE:          { nameAr: 'Site Reliability Engineering', concepts: ['SLA','SLO','SLI','Error Budget','Toil'], creator: 'Google', quranRef: 'T06' },
    GitOps:       { nameAr: 'Git مصدر الحقيقة', tools: ['ArgoCD','Flux'], use: 'Kubernetes GitOps', quranRef: 'A05' },
    FinOps:       { nameAr: 'تحسين تكاليف السحابة', use: 'Cloud Cost Optimization', quranRef: 'S09' },
    Platform:     { nameAr: 'هندسة المنصة', use: 'Internal Developer Platform', quranRef: 'D13' },
    Observability:{ nameAr: 'الملاحظة الثلاثية', pillars: ['Metrics','Logs','Traces'], quranRef: 'D13' },
    Chaos:        { nameAr: 'هندسة الفوضى', tools: ['Chaos Monkey','LitmusChaos'], use: 'اختبار مرونة الأنظمة', quranRef: 'D04' },
    ShapeUp:      { nameAr: 'Shape Up — Basecamp', cycles: ['6 weeks + 2 weeks cooldown'], quranRef: 'S06' },
  },

  PM_FRAMEWORKS: {
    nameAr: 'أطر إدارة المشاريع',
    PMP:         { nameAr: 'محترف إدارة المشاريع — PMI', groups: ['Initiating','Planning','Executing','Monitoring','Closing'], quranRef: 'SC16' },
    ITIL:        { nameAr: 'مكتبة البنية التحتية لتقنية المعلومات', use: 'ITSM', quranRef: 'T06' },
    CMMI:        { nameAr: 'نموذج نضج القدرات', levels: [1,2,3,4,5], quranRef: 'T06' },
    TOGAF:       { nameAr: 'إطار معمارية Enterprise', use: 'Enterprise Architecture', quranRef: 'SC16' },
    COBIT:       { nameAr: 'حوكمة IT', use: 'Governance + Risk + Compliance', quranRef: 'SC16' },
    ISO27001:    { nameAr: 'معيار أمان المعلومات', use: 'ISMS', quranRef: 'D04' },
    ISO9001:     { nameAr: 'إدارة الجودة', use: 'QMS', quranRef: 'T06' },
  },

  WEB_FRAMEWORKS: {
    nameAr: 'أطر تطوير الويب',
    Backend: {
      'Node.js/Express': { lang: 'JS', use: 'API REST سريعة',       quranRef: 'S06' },
      'Node.js/Fastify': { lang: 'JS', use: 'أسرع من Express',       quranRef: 'S12' },
      'NestJS':          { lang: 'TS', use: 'Angular للخادم',        quranRef: 'T06' },
      'Django':          { lang: 'Python', use: 'كامل + admin',      quranRef: 'T06' },
      'FastAPI':         { lang: 'Python', use: 'API سريعة + OpenAPI', quranRef: 'S12' },
      'Flask':           { lang: 'Python', use: 'خفيف + مرن',        quranRef: 'S06' },
      'Spring Boot':     { lang: 'Java', use: 'Enterprise Java',      quranRef: 'T06' },
      'Laravel':         { lang: 'PHP', use: 'ويب PHP كامل',          quranRef: 'T06' },
      'Rails':           { lang: 'Ruby', use: 'Convention-over-Config', quranRef: 'S06' },
      'Phoenix':         { lang: 'Elixir', use: 'Real-time عالي الأداء', quranRef: 'S12' },
      'Gin':             { lang: 'Go', use: 'HTTP Go خفيف',           quranRef: 'S12' },
      'Fiber':           { lang: 'Go', use: 'Express-like Go',        quranRef: 'S12' },
      'Actix-web':       { lang: 'Rust', use: 'أسرع ويب framework',   quranRef: 'S12' },
      'Axum':            { lang: 'Rust', use: 'ويب Rust حديث',        quranRef: 'S12' },
    },
    Frontend: {
      'React':      { creator: 'Facebook', use: 'UI Library + SPA',   quranRef: 'S10' },
      'Vue.js':     { creator: 'Evan You', use: 'Progressive Framework', quranRef: 'S06' },
      'Angular':    { creator: 'Google',   use: 'Enterprise SPA',       quranRef: 'T06' },
      'Svelte':     { creator: 'Rich Harris', use: 'Compiler بلا Virtual DOM', quranRef: 'S12' },
      'SolidJS':    { creator: 'Ryan Carniato', use: 'React-like أسرع',  quranRef: 'S12' },
      'Qwik':       { creator: 'Misko Hevery', use: 'Resumable + O(1)',  quranRef: 'S12' },
      'Next.js':    { creator: 'Vercel',   use: 'React + SSR + SSG',   quranRef: 'T06' },
      'Nuxt':       { creator: 'Alex Chopin', use: 'Vue + SSR',        quranRef: 'T06' },
      'Astro':      { use: 'Content-first + Multi-framework',           quranRef: 'S06' },
      'Remix':      { creator: 'Shopify', use: 'React + full-stack web', quranRef: 'T06' },
      'TailwindCSS':{ creator: 'Adam Wathan', use: 'Utility CSS',       quranRef: 'S10' },
    },
    Mobile: {
      'React Native': { creator: 'Facebook', use: 'iOS + Android بـ React', quranRef: 'D06' },
      'Flutter':       { creator: 'Google', use: 'iOS + Android + Web + Desktop', quranRef: 'D06' },
      'Expo':          { creator: 'Expo', use: 'React Native مبسط',        quranRef: 'S06' },
      'Ionic':         { creator: 'Ionic', use: 'Hybrid Apps بالويب',      quranRef: 'D06' },
      'Capacitor':     { creator: 'Ionic', use: 'Web → Mobile',             quranRef: 'D06' },
      'NativeScript':  { creator: 'Progress', use: 'JavaScript → Native',  quranRef: 'D06' },
    },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅹ: القواعد والقوانين والخواص (Rules, Laws & Properties) ───────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ﴾ — الملك: ٣

const LAYER_RULES_LAWS = Object.freeze({

  nameAr: 'القواعد والقوانين والخواص',
  tawheedRef: 'K10 — مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ',
  cellCount: 4,

  CS_THEOREMS: {
    nameAr: 'مبرهنات علوم الحاسب',
    CAP:        { nameAr: 'مبرهنة CAP (Brewer)', law: 'لا يمكن لنظام موزَّع الجمع بين: Consistency + Availability + Partition Tolerance معاً', quranRef: 'T07' },
    PACELC:     { nameAr: 'توسيع CAP', law: 'تقايض Latency مقابل Consistency حين لا يوجد تقسيم', quranRef: 'T07' },
    ACID:       { nameAr: 'خصائص المعاملات', props: ['Atomicity','Consistency','Isolation','Durability'], quranRef: 'T06' },
    BASE:       { nameAr: 'بديل ACID في NoSQL', props: ['Basically Available','Soft State','Eventually Consistent'], quranRef: 'T06' },
    Amdahl:     { nameAr: 'قانون أمدال', law: 'حد التوازي: S=1/(1-p+p/n)', use: 'حساب الأداء في المعالجة الموازية', quranRef: 'T07' },
    Gustafson:  { nameAr: 'قانون جوستافسون', law: 'تحسين عملي للمعالجة الموازية', quranRef: 'T07' },
    LittleLaw:  { nameAr: 'قانون ليتل', formula: 'L = λW', use: 'نظرية صفوف الانتظار', quranRef: 'T07' },
    Moore:      { nameAr: 'قانون مور', law: 'مضاعفة الترانزستور كل ~18 شهراً', status: 'يتباطأ منذ 2015', quranRef: 'SC12' },
    Metcalfe:   { nameAr: 'قانون ميتكالف', law: 'قيمة الشبكة = n²', use: 'شبكات التواصل', quranRef: 'SC13' },
    Conway:     { nameAr: 'قانون كونوي', law: 'أنظمة المنظمة تعكس بنية تواصلها', quranRef: 'SC16' },
    Postel:     { nameAr: 'قانون بوستيل (Robustness)', law: 'كُن متحفظاً فيما تُرسل، متسامحاً فيما تقبل', quranRef: 'S13' },
    Hyrum:      { nameAr: 'قانون هايرام', law: 'مع عدد كافٍ من المستخدمين، كل سلوك مرئي يُعتمد', quranRef: 'T06' },
    Zawinski:   { nameAr: 'قانون زاوينسكي', law: 'كل برنامج يتوسع حتى يتمكن من قراءة البريد', quranRef: 'S11' },
  },

  DATABASE_RULES: {
    nameAr: 'قواعد قواعد البيانات',
    Normalization: {
      '1NF': { nameAr: 'الصيغة الطبيعية الأولى',    rule: 'لا مجموعات متكررة، قيم ذرية',  quranRef: 'T06' },
      '2NF': { nameAr: 'الصيغة الطبيعية الثانية',   rule: '1NF + لا تبعية جزئية',         quranRef: 'T06' },
      '3NF': { nameAr: 'الصيغة الطبيعية الثالثة',   rule: '2NF + لا تبعية عبورية',        quranRef: 'T06' },
      'BCNF':{ nameAr: 'Boyce-Codd',               rule: '3NF + كل محدد هو مفتاح فائق',  quranRef: 'T06' },
      '4NF': { nameAr: 'الرابعة',                   rule: 'BCNF + لا تبعيات متعددة القيم', quranRef: 'T06' },
      '5NF': { nameAr: 'الخامسة',                   rule: '4NF + لا تبعيات انضمام',       quranRef: 'T06' },
    },
    Codd12Rules: { nameAr: '12 قاعدة كود لقواعد البيانات العلاقية', ref: 'Edgar Codd/1970', quranRef: 'A05' },
    IndexTypes:  { nameAr: 'أنواع الفهارس', types: ['B-Tree','Hash','GiST','GIN','BRIN','Bloom','Full-Text'], quranRef: 'SC12' },
    Transactions:{ nameAr: 'المعاملات', isolation: ['Read Uncommitted','Read Committed','Repeatable Read','Serializable'], quranRef: 'T06' },
  },

  SECURITY_LAWS: {
    nameAr: 'قوانين الأمان',
    SaltzerSchroeder: { nameAr: 'مبادئ سالتزر وشرودر', principles: ['Economy of Mechanism','Fail-Safe Defaults','Complete Mediation','Open Design','Separation of Privilege','Least Privilege','Least Common Mechanism','Psychological Acceptability'], quranRef: 'D04' },
    OWASPTop10:     { nameAr: 'أعلى 10 ثغرات OWASP', items: ['Injection','Broken Auth','Sensitive Data Exposure','XXE','Broken Access Control','Misconfiguration','XSS','Insecure Deserialization','Using Vulnerable Components','Insufficient Logging'], quranRef: 'D04' },
    DefenseInDepth: { nameAr: 'الدفاع في العمق',        use: 'طبقات متعددة من الأمان', quranRef: 'D04' },
    ZeroTrust:      { nameAr: 'ثقة صفرية',             principle: 'لا ثقة ضمنية لأي شيء داخل أو خارج الشبكة', quranRef: 'D04' },
    LeastPrivilege: { nameAr: 'أقل صلاحية',            rule: 'منح الحد الأدنى من الصلاحيات اللازمة', quranRef: 'D04' },
    CIA_Triad:      { nameAr: 'ثالوث CIA', pillars: ['Confidentiality','Integrity','Availability'], quranRef: 'D04' },
  },

  MATH_PROPERTIES: {
    nameAr: 'الخواص الرياضية',
    Algebraic: {
      Commutativity:   { nameAr: 'تبادلية',       formula: 'a+b = b+a, a×b = b×a',    quranRef: 'T10' },
      Associativity:   { nameAr: 'تجميعية',       formula: '(a+b)+c = a+(b+c)',        quranRef: 'T10' },
      Distributivity:  { nameAr: 'توزيعية',       formula: 'a×(b+c) = a×b+a×c',       quranRef: 'T10' },
      Identity:        { nameAr: 'محايد',          formula: 'a+0=a, a×1=a',            quranRef: 'T10' },
      Inverse:         { nameAr: 'عكس',            formula: 'a+(-a)=0, a×(1/a)=1',    quranRef: 'T10' },
      Closure:         { nameAr: 'انغلاق',          def: 'نتيجة العملية تنتمي للمجموعة', quranRef: 'T10' },
    },
    Crypto: {
      Trapdoor:        { nameAr: 'دالة الباب الخلفي',   example: 'RSA, ECC', quranRef: 'D04' },
      OneWay:          { nameAr: 'دالة أحادية الاتجاه', example: 'SHA-256, MD5', quranRef: 'D04' },
      Avalanche:       { nameAr: 'تأثير الانهيار',      def: 'تغيير بت واحد يغير 50% من الإخراج', quranRef: 'D04' },
      CollisionResist: { nameAr: 'مقاومة التصادم',      use: 'سلامة البيانات', quranRef: 'D04' },
    },
    ProbStats: {
      Bayes:           { nameAr: 'نظرية بايز',    formula: 'P(A|B) = P(B|A)·P(A)/P(B)', use: 'ML + Spam Detection', quranRef: 'D01' },
      CentralLimit:    { nameAr: 'نظرية الحد المركزي', def: 'التوزيع الطبيعي عند n كبير', quranRef: 'T07' },
      LawLargeNumbers: { nameAr: 'قانون الأعداد الكبيرة', def: 'المتوسط يتقارب مع التوقع', quranRef: 'T07' },
      BirthDay:        { nameAr: 'مفارقة عيد الميلاد', use: 'أمان التجزئة', quranRef: 'T07' },
    },
  },

  NETWORK_LAWS: {
    nameAr: 'قوانين الشبكات',
    Metcalfe:  { law: 'قيمة الشبكة ∝ n²',                               quranRef: 'SC13' },
    Sarnoff:   { law: 'قيمة البث ∝ n',                                   quranRef: 'SC13' },
    Reed:      { law: 'قيمة المجموعات ∝ 2ⁿ',                           quranRef: 'SC13' },
    BrooksBrook: { nameAr: 'قانون بروكس', law: 'إضافة مبرمجين لمشروع متأخر يزيد تأخيره', quranRef: 'S11' },
    Linus:     { nameAr: 'قانون لينوس', law: 'عيون كافية تجعل كل الأخطاء ظاهرة',       quranRef: 'S25' },
    Murphy:    { nameAr: 'قانون مورفي', law: 'كل ما يمكن أن يسوء سيسوء',              quranRef: 'D04' },
    Goodhart:  { nameAr: 'قانون غودهارت', law: 'عندما يصبح مقياس هدفاً يتوقف عن كونه مقياساً جيداً', quranRef: 'T06' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅺ: قواعد البيانات والتخزين (Databases & Storage) ─────────────────
// ══════════════════════════════════════════════════════════════════════════════
// «اكتبوا له» — البخاري: ٢٦٥١

const LAYER_DATABASES = Object.freeze({

  nameAr: 'قواعد البيانات والتخزين',
  tawheedRef: 'S08 — اكتبوا له',
  cellCount: 4,

  RELATIONAL: {
    nameAr: 'قواعد البيانات العلاقية',
    PostgreSQL:  { license: 'OSS',      use: 'أقوى قاعدة بيانات مفتوحة المصدر',     extensions: ['PostGIS','pgvector','TimescaleDB'], tawheedRef: 'A05' },
    MySQL:       { license: 'GPL/LGPL', use: 'الأكثر شيوعاً + ويب + LAMP stack',    quranRef: 'A05' },
    MariaDB:     { license: 'GPL',      use: 'MySQL fork أسرع',                      tawheedRef: 'A05' },
    SQLite:      { license: 'Public Domain', use: 'مدمجة + موبايل + تطوير',          tawheedRef: 'D19' },
    Oracle:      { license: 'Commercial', use: 'Enterprise + ERP + financial',       tawheedRef: 'A05' },
    'SQL Server':{ license: 'Commercial', use: 'Microsoft Enterprise + Azure',       tawheedRef: 'A05' },
    'IBM DB2':   { license: 'Commercial', use: 'mainframe + enterprise',             tawheedRef: 'A05' },
    CockroachDB: { license: 'BSL',      use: 'NewSQL + geo-distributed',             tawheedRef: 'SC13' },
    YugabyteDB:  { license: 'Apache 2', use: 'NewSQL + HTAP',                        tawheedRef: 'SC13' },
    SingleStore: { license: 'Commercial', use: 'HTAP high-performance',              tawheedRef: 'S12' },
    TiDB:        { license: 'Apache 2', use: 'MySQL-compatible distributed',         tawheedRef: 'SC13' },
  },

  NOSQL: {
    nameAr: 'قواعد البيانات غير العلاقية',
    Document: {
      MongoDB:   { use: 'JSON documents + Atlas',          tawheedRef: 'A05' },
      Firestore: { use: 'Google Cloud + Real-time',        tawheedRef: 'D05' },
      CouchDB:   { use: 'مزامنة + Offline-first',         tawheedRef: 'SC13' },
      RavenDB:   { use: '.NET Document DB',                tawheedRef: 'A05' },
    },
    KeyValue: {
      Redis:     { use: 'كاش + Session + PubSub + Streams', tawheedRef: 'SC12' },
      Memcached: { use: 'كاش بسيط',                        tawheedRef: 'SC12' },
      DynamoDB:  { use: 'AWS Serverless Key-Value',         tawheedRef: 'D05' },
      Etcd:      { use: 'مخزن توافق Kubernetes',           tawheedRef: 'D05' },
      Consul:    { use: 'Service Discovery + KV',           tawheedRef: 'D05' },
    },
    WideColumn: {
      Cassandra: { use: 'تدفق كبير + IoT + TimesSeries',   tawheedRef: 'D11' },
      HBase:     { use: 'Hadoop + BigTable-style',          tawheedRef: 'D11' },
      Bigtable:  { use: 'Google Cloud Wide-Column',         tawheedRef: 'D05' },
      ScyllaDB:  { use: 'Cassandra بـ C++',                 tawheedRef: 'S12' },
    },
    Graph: {
      Neo4j:     { use: 'أكبر قاعدة بيانات رسم بياني',    tawheedRef: 'K08' },
      ArangoDB:  { use: 'Multi-model: Document + Graph + KV', tawheedRef: 'K08' },
      TigerGraph:{ use: 'Graph بأداء عالٍ',                tawheedRef: 'K08' },
      'Amazon Neptune': { use: 'AWS Graph DB',              tawheedRef: 'D05' },
    },
    Search: {
      Elasticsearch: { use: 'بحث نصي + تحليلات',          tawheedRef: 'T08' },
      OpenSearch:    { use: 'Elasticsearch مفتوح المصدر', tawheedRef: 'T08' },
      Meilisearch:   { use: 'بحث سريع للمطورين',           tawheedRef: 'T08' },
      Typesense:     { use: 'بحث مفتوح المصدر سريع',       tawheedRef: 'T08' },
    },
  },

  VECTOR_DB: {
    nameAr: 'قواعد بيانات المتجهات (AI)',
    Pinecone:    { use: 'Vector DB سحابي للـ AI',          tawheedRef: 'D01' },
    Weaviate:    { use: 'Vector DB + GraphQL',              tawheedRef: 'D01' },
    Qdrant:      { use: 'Vector DB بـ Rust',                tawheedRef: 'D01' },
    Milvus:      { use: 'Vector DB مفتوح المصدر',           tawheedRef: 'D01' },
    'pgvector':  { use: 'Vector DB على PostgreSQL',         tawheedRef: 'D01' },
    Chroma:      { use: 'Vector DB للـ LLM',                tawheedRef: 'D01' },
    FAISS:       { use: 'Facebook Similarity Search',        creator: 'Meta', tawheedRef: 'D01' },
    Annoy:       { use: 'Approximate Nearest Neighbors',    creator: 'Spotify', tawheedRef: 'D01' },
  },

  TIMESERIES: {
    nameAr: 'قواعد بيانات السلاسل الزمنية',
    InfluxDB:     { use: 'IoT + Metrics + Monitoring',       tawheedRef: 'D09' },
    TimescaleDB:  { use: 'PostgreSQL + Time-Series',          tawheedRef: 'D09' },
    Prometheus:   { use: 'Metrics + Alerting',               tawheedRef: 'D13' },
    QuestDB:      { use: 'أسرع TSDB',                        tawheedRef: 'S12' },
    OpenTSDB:     { use: 'HBase-based TSDB',                  tawheedRef: 'D11' },
    VictoriaMetrics: { use: 'Prometheus-compatible سريع',    tawheedRef: 'S12' },
  },

  STREAMING: {
    nameAr: 'منصات تدفق البيانات',
    Kafka:       { creator: 'LinkedIn/Apache', use: 'نظام رسائل موزَّع + Event Streaming', tawheedRef: 'D15' },
    RabbitMQ:    { creator: 'VMware',          use: 'Message Queue + AMQP',                tawheedRef: 'D15' },
    Pulsar:      { creator: 'Apache',          use: 'Kafka alternative + Multi-tenancy',   tawheedRef: 'D15' },
    NATS:        { creator: 'Synadia',         use: 'Cloud Native Messaging',               tawheedRef: 'D15' },
    ActiveMQ:    { creator: 'Apache',          use: 'JMS + Enterprise Messaging',           tawheedRef: 'D15' },
    Kinesis:     { creator: 'AWS',             use: 'AWS Managed Kafka',                    tawheedRef: 'D05' },
    'Azure Event Hubs': { creator: 'Microsoft', use: 'Azure Managed Streaming',            tawheedRef: 'D05' },
    Flink:       { creator: 'Apache',          use: 'Stream Processing',                    tawheedRef: 'D11' },
    Spark:       { creator: 'Apache/Databricks', use: 'Batch + Stream Processing',          tawheedRef: 'D11' },
    Beam:        { creator: 'Apache/Google',   use: 'Unified Batch + Stream',               tawheedRef: 'D11' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة Ⅻ: الشبكات والبروتوكولات (Networks & Protocols) ──────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا﴾ — الحجرات: ١٣

const LAYER_NETWORKS = Object.freeze({

  nameAr: 'الشبكات والبروتوكولات',
  tawheedRef: 'SC13 — لِتَعَارَفُوا',
  cellCount: 6,

  OSI_MODEL: {
    nameAr: 'نموذج OSI السبعي',
    L7_Application:  { nameAr: 'التطبيق',   protocols: ['HTTP','HTTPS','FTP','SMTP','DNS','DHCP','SSH','Telnet'], quranRef: 'D15' },
    L6_Presentation: { nameAr: 'العرض',     protocols: ['TLS/SSL','MIME','JPEG','MP4','ASCII','UTF-8'], quranRef: 'T08' },
    L5_Session:      { nameAr: 'الجلسة',    protocols: ['NetBIOS','RPC','SIP','H.323'], quranRef: 'SC13' },
    L4_Transport:    { nameAr: 'النقل',     protocols: ['TCP','UDP','SCTP','QUIC'], quranRef: 'SC13' },
    L3_Network:      { nameAr: 'الشبكة',    protocols: ['IPv4','IPv6','ICMP','IPSec','BGP','OSPF','MPLS'], quranRef: 'SC13' },
    L2_DataLink:     { nameAr: 'رابط البيانات', protocols: ['Ethernet','WiFi 802.11','PPP','ARP','MAC','VLAN'], quranRef: 'SC13' },
    L1_Physical:     { nameAr: 'المادي',    media: ['Fiber Optic','Ethernet CAT6/7','Radio Waves','Coaxial'], quranRef: 'SC03' },
  },

  APPLICATION_PROTOCOLS: {
    nameAr: 'بروتوكولات التطبيق',
    'HTTP/1.1':  { rfc: 'RFC 7230-7235', use: 'ويب أساسي', quranRef: 'D15' },
    'HTTP/2':    { rfc: 'RFC 7540',      use: 'ضغط + multiplexing + header compression', quranRef: 'S12' },
    'HTTP/3':    { rfc: 'RFC 9114',      base: 'QUIC', use: 'أسرع + UDP', quranRef: 'S12' },
    HTTPS:       { base: 'HTTP + TLS',   use: 'اتصال مشفر', quranRef: 'D04' },
    WebSocket:   { rfc: 'RFC 6455',      use: 'اتصال ثنائي حي', quranRef: 'SC13' },
    gRPC:        { base: 'HTTP/2 + Protobuf', use: 'microservices سريعة', quranRef: 'S11' },
    DNS:         { rfc: 'RFC 1034/1035', use: 'تحليل الأسماء → IP', quranRef: 'SC13' },
    SMTP:        { rfc: 'RFC 5321',      use: 'إرسال البريد', quranRef: 'SC13' },
    IMAP:        { rfc: 'RFC 3501',      use: 'استلام البريد', quranRef: 'SC13' },
    FTP:         { rfc: 'RFC 959',       use: 'نقل الملفات', quranRef: 'SC13' },
    SSH:         { rfc: 'RFC 4251',      use: 'وصول آمن للخوادم', quranRef: 'D04' },
    MQTT:        { std: 'OASIS',         use: 'IoT messaging', quranRef: 'D09' },
    AMQP:        { std: 'OASIS/ISO',     use: 'رسائل Enterprise', quranRef: 'D15' },
    CoAP:        { rfc: 'RFC 7252',      use: 'HTTP خفيف للـ IoT', quranRef: 'D09' },
    NTP:         { rfc: 'RFC 5905',      use: 'مزامنة الوقت', quranRef: 'SC18' },
  },

  TRANSPORT_PROTOCOLS: {
    nameAr: 'بروتوكولات النقل',
    TCP:     { nameAr: 'بروتوكول التحكم بالإرسال', features: ['3-way handshake','Ordered delivery','Flow control','Congestion control'], quranRef: 'T06' },
    UDP:     { nameAr: 'بروتوكول مخطط البيانات',   features: ['Connectionless','Fast','No guarantee'], use: 'DNS + Video + Gaming + VoIP', quranRef: 'S12' },
    QUIC:    { nameAr: 'اتصال UDP سريع معزز',       features: ['0-RTT','Multiplexed streams','Encrypted'], base: 'UDP', quranRef: 'S12' },
    SCTP:    { nameAr: 'بروتوكول نقل متعدد التدفقات', use: 'اتصالات + signaling', quranRef: 'SC13' },
    DCCP:    { nameAr: 'تحكم ازدحام غير موثوق',    use: 'فيديو + صوت', quranRef: 'SC13' },
  },

  NETWORK_PROTOCOLS: {
    nameAr: 'بروتوكولات الشبكة',
    IPv4:    { rfc: 'RFC 791',    space: '~4.3B عنوان', note: 'نفد عملياً', quranRef: 'SC13' },
    IPv6:    { rfc: 'RFC 2460',   space: '3.4×10³⁸ عنوان', note: 'الحل الدائم', quranRef: 'SC13' },
    BGP:     { rfc: 'RFC 4271',   use: 'بروتوكول التوجيه بين المزودين', quranRef: 'SC13' },
    OSPF:    { rfc: 'RFC 2328',   use: 'توجيه داخل نظام', quranRef: 'SC13' },
    EIGRP:   { creator: 'Cisco',  use: 'توجيه داخلي Cisco', quranRef: 'SC13' },
    MPLS:    { use: 'تحسين توجيه الشبكات الكبيرة', quranRef: 'SC13' },
    NAT:     { use: 'ترجمة العناوين', quranRef: 'SC13' },
    DHCP:    { rfc: 'RFC 2131',   use: 'توزيع IP تلقائياً', quranRef: 'SC13' },
    ARP:     { rfc: 'RFC 826',    use: 'تحليل IP → MAC', quranRef: 'SC13' },
    ICMP:    { rfc: 'RFC 792',    use: 'ping + traceroute + أخطاء', quranRef: 'SC13' },
  },

  SECURITY_PROTOCOLS: {
    nameAr: 'بروتوكولات الأمان',
    TLS_1_3:  { rfc: 'RFC 8446',     use: 'تشفير HTTPS + مصادقة', quranRef: 'D04' },
    IPSec:    { rfc: 'RFC 4301',      use: 'VPN + تشفير IP', quranRef: 'D04' },
    WireGuard:{ creator: 'Jason Donenfeld', use: 'VPN حديث سريع', quranRef: 'D04' },
    OpenVPN:  { use: 'VPN مفتوح المصدر', quranRef: 'D04' },
    'OAuth 2.0': { rfc: 'RFC 6749',  use: 'تفويض الوصول', quranRef: 'A01' },
    'OpenID Connect': { base: 'OAuth 2', use: 'هوية + مصادقة', quranRef: 'A01' },
    JWT:      { rfc: 'RFC 7519',      use: 'رمز هوية مُوقَّع', quranRef: 'D04' },
    SAML:     { std: 'OASIS',         use: 'Single Sign-On Enterprise', quranRef: 'A01' },
    DNSSEC:   { rfc: 'RFC 4033',      use: 'أمان DNS', quranRef: 'D04' },
    PKI:      { nameAr: 'بنية تحتية للمفاتيح العامة', use: 'شهادات TLS', quranRef: 'D04' },
  },

  WIRELESS: {
    nameAr: 'شبكات لاسلكية',
    'WiFi 6 (802.11ax)': { speed: '9.6 Gbps', use: 'OFDMA + BSS Coloring', quranRef: 'SC13' },
    'WiFi 7 (802.11be)': { speed: '46 Gbps',  use: 'Multi-Link Operation', quranRef: 'S12' },
    '5G NR':    { speed: '20 Gbps peak',   use: 'IoT + مركبات + صناعة 4.0', quranRef: 'SC13' },
    '4G LTE':   { speed: '100 Mbps+',     use: 'هاتف + بيانات', quranRef: 'SC13' },
    Bluetooth5: { range: '400m',           use: 'أجهزة + IoT + Audio', quranRef: 'D09' },
    'BLE':      { nameAr: 'Bluetooth منخفض الطاقة', use: 'IoT + Beacons + Wearables', quranRef: 'D09' },
    Zigbee:     { std: 'IEEE 802.15.4',    use: 'Smart Home + IoT', quranRef: 'D09' },
    'Z-Wave':   { use: 'Smart Home automation', quranRef: 'D09' },
    LoRaWAN:    { use: 'IoT بعيد المدى + مدن ذكية', quranRef: 'D09' },
    NFC:        { range: '10cm',           use: 'دفع إلكتروني + بطاقات', quranRef: 'D09' },
    RFID:       { use: 'تتبع الأصول + بطاقات', quranRef: 'D09' },
  },

  CDN_EDGE: {
    nameAr: 'شبكات توصيل المحتوى والحافة',
    Cloudflare: { use: 'CDN + DDoS + Edge Functions', quranRef: 'D05' },
    Fastly:     { use: 'CDN + Edge Computing', quranRef: 'D05' },
    Akamai:     { use: 'CDN Enterprise', quranRef: 'D05' },
    'AWS CloudFront': { use: 'CDN + Lambda@Edge', quranRef: 'D05' },
    Vercel_Edge: { use: 'Edge Functions + Deploy', quranRef: 'D05' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة ⅩⅢ: السحابة والبنية التحتية (Cloud & Infrastructure) ─────────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿وَالسَّمَاءِ ذَاتِ الرَّجْعِ﴾ — الطارق: ١١

const LAYER_CLOUD_INFRA = Object.freeze({

  nameAr: 'السحابة والبنية التحتية',
  tawheedRef: 'D05 — السماء ذات الرجع',
  cellCount: 5,

  CLOUD_PROVIDERS: {
    nameAr: 'مزودو السحابة',
    AWS:     { nameAr: 'Amazon Web Services',  share: '32%', services: 200, regions: 32, use: 'الأكبر + الأكثر خدمات', tawheedRef: 'D05' },
    Azure:   { nameAr: 'Microsoft Azure',      share: '22%', services: 150, regions: 60, use: 'Enterprise + Microsoft', tawheedRef: 'D05' },
    GCP:     { nameAr: 'Google Cloud',         share: '11%', services: 100, regions: 40, use: 'AI + Kubernetes + BigQuery', tawheedRef: 'D05' },
    Alibaba: { nameAr: 'Alibaba Cloud',        share: '4%',  use: 'آسيا + عربي',           tawheedRef: 'D05' },
    Oracle:  { nameAr: 'Oracle Cloud',         share: '3%',  use: 'OCI + Oracle DB',       tawheedRef: 'D05' },
    IBM:     { nameAr: 'IBM Cloud',            use: 'Enterprise + Watson AI',             tawheedRef: 'D05' },
    'DigitalOcean': { use: 'مطورون + سهل',                                               tawheedRef: 'D05' },
    Linode:  { creator: 'Akamai',              use: 'مطورون بسعر معقول',                 tawheedRef: 'D05' },
    Vultr:   { use: 'سرعة نشر عالية',                                                    tawheedRef: 'D05' },
    Hetzner: { use: 'أرخص + أوروبا + GDPR',                                             tawheedRef: 'D05' },
  },

  AWS_CORE: {
    nameAr: 'خدمات AWS الأساسية',
    Compute:    { services: ['EC2','Lambda','ECS','EKS','Fargate','Lightsail','Batch'], quranRef: 'D05' },
    Storage:    { services: ['S3','EBS','EFS','FSx','Glacier','Snow Family'],          quranRef: 'A05' },
    Database:   { services: ['RDS','DynamoDB','ElastiCache','Redshift','Neptune','DocumentDB'], quranRef: 'A05' },
    Network:    { services: ['VPC','Route53','CloudFront','API Gateway','ELB','Direct Connect'], quranRef: 'SC13' },
    AI_ML:      { services: ['SageMaker','Bedrock','Rekognition','Comprehend','Polly','Lex'], quranRef: 'D01' },
    DevTools:   { services: ['CodePipeline','CodeBuild','CodeDeploy','CodeCommit','Cloud9'], quranRef: 'D13' },
    Security:   { services: ['IAM','KMS','Cognito','Shield','WAF','GuardDuty','Inspector'], quranRef: 'D04' },
    Analytics:  { services: ['Kinesis','Glue','Athena','EMR','QuickSight','Lake Formation'], quranRef: 'D11' },
    IoT:        { services: ['IoT Core','Greengrass','IoT Analytics','FreeRTOS'],       quranRef: 'D09' },
  },

  INFRASTRUCTURE_AS_CODE: {
    nameAr: 'البنية التحتية ككود',
    Terraform:  { creator: 'HashiCorp',   lang: 'HCL',    use: 'Multi-cloud IaC',      tawheedRef: 'D13' },
    Pulumi:     { creator: 'Pulumi Corp', lang: 'multi',  use: 'IaC بلغات عادية',      tawheedRef: 'D13' },
    'AWS CDK':  { creator: 'Amazon',      lang: 'TS/Python/Java', use: 'AWS IaC',      tawheedRef: 'D13' },
    Ansible:    { creator: 'Red Hat',     lang: 'YAML',   use: 'تهيئة الخوادم',        tawheedRef: 'D13' },
    Chef:       { creator: 'Progress',    lang: 'Ruby',   use: 'Configuration Mgmt',   tawheedRef: 'D13' },
    Puppet:     { creator: 'Puppet Inc',  lang: 'Puppet', use: 'Configuration Mgmt',   tawheedRef: 'D13' },
    SaltStack:  { creator: 'VMware',      lang: 'Python', use: 'Automation',           tawheedRef: 'D13' },
    Crossplane:  { creator: 'Upbound',    lang: 'K8s',    use: 'Cloud IaC on K8s',    tawheedRef: 'D13' },
  },

  SERVICE_MESH: {
    nameAr: 'شبكة الخدمات',
    Istio:      { use: 'أكثر service mesh استخداماً',    tawheedRef: 'D05' },
    Linkerd:    { use: 'أخف + Rust',                      tawheedRef: 'D05' },
    Consul:     { creator: 'HashiCorp', use: 'Service Mesh + Discovery', tawheedRef: 'D05' },
    Envoy:      { creator: 'Lyft', use: 'Proxy + Data Plane',           tawheedRef: 'D05' },
    Kuma:       { creator: 'Kong', use: 'Multi-cloud Service Mesh',     tawheedRef: 'D05' },
  },

  SERVERLESS: {
    nameAr: 'الحوسبة بلا خوادم',
    'AWS Lambda':    { trigger: 'Event-driven', runtime: 'multi', tawheedRef: 'D05' },
    'Azure Functions': { trigger: 'Event-driven', use: 'Microsoft Cloud', tawheedRef: 'D05' },
    'Google Cloud Functions': { trigger: 'Event-driven', tawheedRef: 'D05' },
    'Cloudflare Workers': { use: 'Edge Computing', tawheedRef: 'D05' },
    'Vercel Functions': { use: 'Frontend + API', tawheedRef: 'D05' },
    'Netlify Functions': { use: 'JAMstack', tawheedRef: 'D05' },
    OpenFaaS:    { use: 'Kubernetes FaaS مفتوح', tawheedRef: 'D05' },
    Knative:     { creator: 'Google', use: 'Serverless on K8s', tawheedRef: 'D05' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة ⅩⅣ: الذكاء الاصطناعي والتعلم الآلي (AI, ML & Deep Learning) ───────
// ══════════════════════════════════════════════════════════════════════════════
// «أُوتِيتُ جَوَامِعَ الْكَلِمِ» — البخاري: ٢٩٧٧

const LAYER_AI_ML = Object.freeze({

  nameAr: 'الذكاء الاصطناعي والتعلم الآلي والعميق',
  tawheedRef: 'D01 — أُوتِيتُ جَوَامِعَ الْكَلِمِ',
  cellCount: 8,

  ML_TYPES: {
    nameAr: 'أنواع التعلم الآلي',
    Supervised:   { nameAr: 'تعلم موجَّه', examples: ['Classification','Regression'], quranRef: 'S07' },
    Unsupervised: { nameAr: 'تعلم غير موجَّه', examples: ['Clustering','Dimensionality Reduction','Anomaly Detection'], quranRef: 'K05' },
    Reinforcement: { nameAr: 'تعلم معزَّز', concepts: ['Agent','Reward','Environment','Policy'], quranRef: 'S29' },
    SelfSupervised: { nameAr: 'تعلم ذاتي', use: 'LLMs + Foundation Models', quranRef: 'S07' },
    Transfer:     { nameAr: 'تعلم نقل', use: 'ضبط دقيق نماذج كبيرة', quranRef: 'S07' },
    FewShot:      { nameAr: 'تعلم من أمثلة قليلة', use: 'GPT-4 in-context learning', quranRef: 'S11' },
    ZeroShot:     { nameAr: 'تعلم بلا أمثلة', use: 'CLIP + GPT prompting', quranRef: 'S11' },
  },

  CLASSICAL_ML: {
    nameAr: 'خوارزميات التعلم الآلي الكلاسيكية',
    LinearRegression:  { use: 'التنبؤ المستمر',           quranRef: 'T07' },
    LogisticRegression:{ use: 'تصنيف ثنائي',              quranRef: 'T07' },
    DecisionTree:      { use: 'تصنيف + انحدار',           quranRef: 'T09' },
    RandomForest:      { use: 'جمع أشجار',                quranRef: 'S25' },
    XGBoost:           { use: 'أقوى gradient boosting',   quranRef: 'S12' },
    LightGBM:          { use: 'XGBoost أسرع',             quranRef: 'S12' },
    SVM:               { nameAr: 'آلة المتجهات الداعمة',  use: 'تصنيف + kernel trick', quranRef: 'S12' },
    KNN:               { nameAr: 'K أقرب جار',           use: 'تصنيف بسيط',           quranRef: 'SC13' },
    KMeans:            { nameAr: 'K متوسطات',             use: 'تجميع unsupervised',   quranRef: 'S25' },
    DBSCAN:            { use: 'تجميع بالكثافة',            quranRef: 'S25' },
    NaiveBayes:        { use: 'تصنيف نصوص + Spam',        quranRef: 'D01' },
    GaussianMixture:   { use: 'نمذجة توزيعات',            quranRef: 'T07' },
    PCA:               { nameAr: 'تحليل المركبات الرئيسية', use: 'تقليل الأبعاد',      quranRef: 'S11' },
    ICA:               { nameAr: 'تحليل المكونات المستقلة', use: 'فصل الإشارات',        quranRef: 'T07' },
    TSNE:              { use: 'تصوير البيانات الضخمة',     quranRef: 'S10' },
    UMAP:              { use: 'تصوير أسرع من t-SNE',       quranRef: 'S12' },
  },

  DEEP_LEARNING: {
    nameAr: 'التعلم العميق',
    ANN:         { nameAr: 'شبكة عصبية اصطناعية',     layers: ['Input','Hidden','Output'], quranRef: 'D01' },
    CNN:         { nameAr: 'شبكة التفاف',              use: 'رؤية حاسوبية + صور',        quranRef: 'D01' },
    RNN:         { nameAr: 'شبكة تكرارية',             use: 'تسلسلات + نصوص + صوت',     quranRef: 'D01' },
    LSTM:        { nameAr: 'ذاكرة قصيرة-طويلة',       use: 'نصوص + تسلسلات طويلة',      quranRef: 'D01' },
    GRU:         { nameAr: 'وحدة تكرار مُبسَّطة',     use: 'أسرع من LSTM',              quranRef: 'D01' },
    Transformer: { nameAr: 'المحوِّل',                  use: 'NLP + CV + Audio',          creator: 'Google/2017', quranRef: 'D01' },
    GAN:         { nameAr: 'شبكات توليدية تنافسية',    use: 'توليد صور + بيانات',        quranRef: 'D01' },
    VAE:         { nameAr: 'مشفِّر تلقائي تغايري',    use: 'توليد + ضغط',               quranRef: 'D01' },
    Diffusion:   { nameAr: 'نماذج الانتشار',           use: 'DALL-E + Stable Diffusion', quranRef: 'D01' },
    GraphNN:     { nameAr: 'شبكات عصبية للرسم البياني', use: 'مولكيولار + شبكات',       quranRef: 'K08' },
    Attention:   { nameAr: 'آلية الانتباه',             use: 'Transformer + تفسيرية',    quranRef: 'S07' },
    'Self-Attention': { use: 'رؤية المحوِّل لذاته',    quranRef: 'S07' },
    ViT:         { nameAr: 'Vision Transformer',        use: 'رؤية بدون CNN',             quranRef: 'D01' },
    BERT:        { nameAr: 'Bidirectional Encoder',     creator: 'Google/2018',  use: 'NLP + NER + QA', quranRef: 'T08' },
    GPT:         { nameAr: 'Generative Pre-trained Transformer', creator: 'OpenAI', use: 'توليد نصوص + LLM', quranRef: 'D01' },
  },

  LLM: {
    nameAr: 'النماذج اللغوية الكبيرة',
    'GPT-4o':    { creator: 'OpenAI',        params: '~1.8T',  use: 'Multimodal LLM',              tawheedRef: 'D01' },
    'Claude 3':  { creator: 'Anthropic',     use: 'Long context + Constitutional AI',               tawheedRef: 'D01' },
    Gemini:      { creator: 'Google DeepMind', use: 'Multimodal + code',                           tawheedRef: 'D01' },
    LLaMA:       { creator: 'Meta',          use: 'Open LLM للأبحاث',                              tawheedRef: 'D01' },
    Mistral:     { creator: 'Mistral AI',    use: 'Efficient LLM',                                  tawheedRef: 'D01' },
    'Falcon':    { creator: 'TII Abu Dhabi', use: 'Arabic + LLM مفتوح',                            tawheedRef: 'D01' },
    Qwen:        { creator: 'Alibaba',       use: 'Chinese + Multilingual',                         tawheedRef: 'D01' },
    'Cohere':    { use: 'Enterprise RAG + Embeddings',                                              tawheedRef: 'D01' },
    Phi:         { creator: 'Microsoft',     use: 'Small but capable LLM',                          tawheedRef: 'D01' },
    DeepSeek:    { creator: 'DeepSeek AI',   use: 'Code + Math + Chinese',                          tawheedRef: 'D01' },
  },

  AI_FRAMEWORKS: {
    nameAr: 'أطر الذكاء الاصطناعي',
    TensorFlow:  { creator: 'Google',   use: 'Production AI + TPU',       lang: 'Python/C++', tawheedRef: 'D01' },
    PyTorch:     { creator: 'Meta',     use: 'Research + Dynamic graphs', lang: 'Python/C++', tawheedRef: 'D01' },
    JAX:         { creator: 'Google',   use: 'XLA + JIT + autodiff',      lang: 'Python',     tawheedRef: 'D01' },
    Keras:       { creator: 'François Chollet', use: 'High-level API TF',  lang: 'Python',    tawheedRef: 'D01' },
    'scikit-learn': { creator: 'INRIA', use: 'Classical ML',               lang: 'Python',    tawheedRef: 'D01' },
    HuggingFace: { use: 'Hub + Transformers + Diffusers + Datasets',       tawheedRef: 'D01' },
    LangChain:   { use: 'LLM orchestration + RAG + Agents',                tawheedRef: 'D01' },
    LlamaIndex:  { use: 'RAG framework + Document QA',                      tawheedRef: 'D01' },
    'Haystack':  { creator: 'deepset', use: 'NLP + RAG pipelines',         tawheedRef: 'D01' },
    OpenCV:      { use: 'رؤية حاسوبية كلاسيكية + DL',                      tawheedRef: 'D01' },
    ONNX:        { use: 'تنسيق موحد للنماذج',                              tawheedRef: 'D01' },
    TensorRT:    { creator: 'NVIDIA', use: 'تسريع inference GPU',           tawheedRef: 'D01' },
    'Ray':       { creator: 'Anyscale', use: 'Distributed AI + Training',  tawheedRef: 'D01' },
  },

  NLP: {
    nameAr: 'معالجة اللغة الطبيعية',
    Tokenization:   { nameAr: 'التقطيع',           methods: ['BPE','WordPiece','Unigram','SentencePiece'], quranRef: 'T08' },
    Embeddings:     { nameAr: 'التضمينات',          models: ['Word2Vec','GloVe','FastText','BERT embeddings'], quranRef: 'T08' },
    NamedEntity:    { nameAr: 'استخراج الكيانات',   use: 'أسماء + أماكن + مؤسسات', quranRef: 'T08' },
    SentimentAnalysis: { nameAr: 'تحليل المشاعر',  use: 'مراجعات + تغريدات', quranRef: 'T08' },
    MachineTranslation: { nameAr: 'ترجمة آلية',    models: ['mBART','NLLB-200','DeepL'], quranRef: 'T08' },
    SpeechToText:   { nameAr: 'تحويل صوت → نص',    models: ['Whisper','DeepSpeech'], quranRef: 'T08' },
    TextToSpeech:   { nameAr: 'تحويل نص → صوت',    models: ['ElevenLabs','Bark','XTTS'], quranRef: 'T08' },
    RAG:            { nameAr: 'التوليد المعزَّز بالاسترجاع', use: 'QA مستندات + chatbots',  quranRef: 'D01' },
    QA:             { nameAr: 'الإجابة على الأسئلة', types: ['Extractive','Abstractive','RAG'], quranRef: 'K02' },
    Summarization:  { nameAr: 'التلخيص التلقائي',   types: ['Extractive','Abstractive'], quranRef: 'S11' },
  },

  COMPUTER_VISION: {
    nameAr: 'الرؤية الحاسوبية',
    ImageClassification: { models: ['ResNet','VGG','EfficientNet','ViT'], quranRef: 'D01' },
    ObjectDetection:     { models: ['YOLO','RCNN','SSD','DETR'],          quranRef: 'D01' },
    Segmentation:        { types: ['Semantic','Instance','Panoptic'],      quranRef: 'D01' },
    FaceRecognition:     { models: ['FaceNet','ArcFace'],                  quranRef: 'D01' },
    ImageGeneration:     { models: ['DALL-E3','Midjourney','SD3','Flux'],  quranRef: 'D01' },
    VideoAnalysis:       { use: 'Action Recognition + Optical Flow',       quranRef: 'D01' },
    OCR:                 { nameAr: 'قراءة النصوص الضوئية', tools: ['Tesseract','PaddleOCR','DocTR'], quranRef: 'T05' },
    'PointCloud':        { use: 'LiDAR + 3D Vision + Autonomous',          quranRef: 'D01' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة ⅩⅤ: جميع العلوم والتقنيات (All Sciences & Technologies) ───────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ﴾ — يونس: ١٠١

const LAYER_ALL_SCIENCES = Object.freeze({

  nameAr: 'جميع العلوم والتقنيات',
  tawheedRef: 'K04 — قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ',
  cellCount: 6,

  MATHEMATICS: {
    nameAr: 'الرياضيات',
    Pure: {
      NumberTheory:   { nameAr: 'نظرية الأعداد',       topics: ['Prime','Modular','Fermat','Euler','Riemann'], quranRef: 'T07' },
      Algebra:        { nameAr: 'الجبر',               sub: ['Linear','Abstract','Commutative','Galois Theory'], quranRef: 'T10' },
      Analysis:       { nameAr: 'التحليل الرياضي',     sub: ['Real','Complex','Functional','Fourier'], quranRef: 'T07' },
      Geometry:       { nameAr: 'الهندسة',             sub: ['Euclidean','Non-Euclidean','Differential','Algebraic','Topology'], quranRef: 'T10' },
      Logic:          { nameAr: 'المنطق الرياضي',      sub: ['Propositional','Predicate','Modal','Intuitionistic'], quranRef: 'T09' },
      SetTheory:      { nameAr: 'نظرية المجموعات',     sub: ['ZFC','Category Theory','Topos Theory'], quranRef: 'T07' },
    },
    Applied: {
      Statistics:     { nameAr: 'الإحصاء',             sub: ['Descriptive','Inferential','Bayesian','Frequentist'], quranRef: 'S09' },
      Probability:    { nameAr: 'الاحتمالات',          sub: ['Discrete','Continuous','Stochastic Processes'], quranRef: 'T07' },
      NumericalMethods:{ nameAr: 'الطرق العددية',      sub: ['Newton-Raphson','Euler','Runge-Kutta','FEM'], quranRef: 'T07' },
      Optimization:   { nameAr: 'التحسين',             sub: ['Linear Programming','Convex','Integer','Stochastic'], quranRef: 'T07' },
      Operations:     { nameAr: 'بحث العمليات',        sub: ['Queuing','Simulation','Game Theory','Decision Theory'], quranRef: 'T07' },
      DiscreteMath:   { nameAr: 'الرياضيات المنفصلة', sub: ['Graph Theory','Combinatorics','Number Theory','Logic'], quranRef: 'T07' },
    },
  },

  PHYSICS: {
    nameAr: 'الفيزياء',
    Classical:    { nameAr: 'الكلاسيكية', sub: ['Mechanics','Thermodynamics','Electrodynamics','Acoustics','Optics'], quranRef: 'SC01' },
    Quantum:      { nameAr: 'الكمومية',  sub: ['Wave-Particle Duality','Superposition','Entanglement','Schrödinger','Feynman'], quranRef: 'D18' },
    Relativity:   { nameAr: 'النسبية',   sub: ['Special Relativity','General Relativity','Spacetime','Black Holes'], quranRef: 'SC01' },
    Condensed:    { nameAr: 'فيزياء الحالة الصلبة', sub: ['Semiconductors','Superconductors','Crystallography'], quranRef: 'SC03' },
    Nuclear:      { nameAr: 'النووية',   sub: ['Fission','Fusion','Radioactivity','Particle Physics'], quranRef: 'SC01' },
    ComputerPhysics: { nameAr: 'فيزياء الحوسبة', sub: ['Simulation','Quantum Computing','Neuromorphic'], quranRef: 'D18' },
  },

  ENGINEERING: {
    nameAr: 'الهندسة',
    Civil:       { nameAr: 'مدني', sub: ['Structural','Geotechnical','Transportation','Environmental','Water Resources'], quranRef: 'SC03' },
    Mechanical:  { nameAr: 'ميكانيكية', sub: ['Thermodynamics','Fluid Mechanics','Manufacturing','Robotics','MEMS'], quranRef: 'SC03' },
    Electrical:  { nameAr: 'كهربائية', sub: ['Power Systems','Electronics','Signal Processing','Control','RF/Microwave'], quranRef: 'SC03' },
    Chemical:    { nameAr: 'كيميائية', sub: ['Process Design','Reaction Engineering','Separation','Materials'], quranRef: 'SC03' },
    Industrial:  { nameAr: 'صناعية', sub: ['Operations Research','Quality','Ergonomics','Supply Chain'], quranRef: 'SC16' },
    Computer:    { nameAr: 'حاسوبية', sub: ['Architecture','VLSI','Embedded Systems','FPGA'], quranRef: 'SC12' },
    Aerospace:   { nameAr: 'فضائية', sub: ['Aerodynamics','Propulsion','Orbital Mechanics','GNC'], quranRef: 'SC01' },
    Biomedical:  { nameAr: 'حيوية طبية', sub: ['Biosensors','Prosthetics','Imaging','Drug Delivery'], quranRef: 'SC08' },
  },

  NATURAL_SCIENCES: {
    nameAr: 'العلوم الطبيعية',
    Chemistry:     { nameAr: 'الكيمياء', sub: ['Organic','Inorganic','Analytical','Physical','Biochemistry'], quranRef: 'K08' },
    Biology:       { nameAr: 'الأحياء', sub: ['Molecular','Cell','Genetics','Ecology','Evolution'], quranRef: 'SC07' },
    Genomics:      { nameAr: 'الجينوم', sub: ['Sequencing','CRISPR','Proteomics','Bioinformatics'], quranRef: 'SC09' },
    Astronomy:     { nameAr: 'الفلك', sub: ['Astrophysics','Cosmology','Planetary Science','Radio Astronomy'], quranRef: 'SC04' },
    Geology:       { nameAr: 'الجيولوجيا', sub: ['Mineralogy','Seismology','Petrology','Hydrogeology'], quranRef: 'SC06' },
    Meteorology:   { nameAr: 'الأرصاد الجوية', sub: ['Atmospheric Science','Climate','Weather Prediction'], quranRef: 'SC10' },
    Oceanography:  { nameAr: 'علوم البحار', sub: ['Physical','Chemical','Biological','Geological'], quranRef: 'K05' },
  },

  TECHNOLOGY: {
    nameAr: 'التقنيات الحديثة',
    Quantum:       { nameAr: 'الحوسبة الكمية', platforms: ['IBM Qiskit','Google Cirq','Microsoft Q#','AWS Braket'], use: 'تشفير + تحسين + AI', quranRef: 'D18' },
    Blockchain:    { nameAr: 'سلسلة الكتل', types: ['Bitcoin','Ethereum','Solana','Polkadot'], use: 'عقود ذكية + DeFi + NFT', quranRef: 'D10' },
    IoT:           { nameAr: 'إنترنت الأشياء', protocols: ['MQTT','CoAP','AMQP'], use: 'مدن ذكية + صناعة + طب', quranRef: 'D09' },
    AR_VR:         { nameAr: 'الواقع المعزز/الافتراضي', platforms: ['Meta Quest','Apple Vision Pro','HoloLens'], quranRef: 'S10' },
    Robotics:      { nameAr: 'الروبوتات', types: ['Industrial','Service','Medical','Autonomous Vehicles'], quranRef: 'SC03' },
    '3D_Printing': { nameAr: 'الطباعة ثلاثية الأبعاد', types: ['FDM','SLA','SLS','Bioprinting'], quranRef: 'T06' },
    Nanotechnology:{ nameAr: 'التقنية النانوية', use: 'طب + إلكترونيات + مواد', quranRef: 'D18' },
    SpaceTech:     { nameAr: 'تقنية الفضاء', orgs: ['SpaceX','NASA','ESA','Blue Origin'], use: 'أقمار + استشعار عن بعد', quranRef: 'SC01' },
    Nuclear:       { nameAr: 'الطاقة النووية', types: ['Fission','Fusion','SMR'], use: 'طاقة نظيفة', quranRef: 'SC01' },
    BioTech:       { nameAr: 'التقنية الحيوية', use: 'CRISPR + mRNA + Synthetic Biology', quranRef: 'SC09' },
  },

  MEDICAL_HEALTH: {
    nameAr: 'العلوم الطبية والصحية',
    ClinicalMedicine: { nameAr: 'الطب الإكلينيكي', specialties: ['Surgery','Cardiology','Neurology','Oncology','Radiology'], quranRef: 'SC08' },
    DigitalHealth:    { nameAr: 'الصحة الرقمية', tech: ['AI Diagnosis','Remote Monitoring','EHR','Telemedicine'], quranRef: 'SC08' },
    DrugDiscovery:    { nameAr: 'اكتشاف الأدوية بالذكاء الاصطناعي', tools: ['AlphaFold','Schrödinger'], quranRef: 'SC08' },
    PublicHealth:     { nameAr: 'الصحة العامة', sub: ['Epidemiology','Biostatistics','Global Health'], quranRef: 'SC08' },
  },

  SOCIAL_SCIENCES: {
    nameAr: 'العلوم الإنسانية والاجتماعية',
    Economics:       { nameAr: 'الاقتصاد', sub: ['Micro','Macro','Behavioral','Computational'], quranRef: 'S20' },
    Psychology:      { nameAr: 'علم النفس', sub: ['Cognitive','Social','Clinical','HCI'], quranRef: 'K06' },
    Sociology:       { nameAr: 'علم الاجتماع', use: 'تحليل الشبكات الاجتماعية', quranRef: 'SC13' },
    Linguistics:     { nameAr: 'اللغويات', sub: ['Phonology','Syntax','Semantics','Pragmatics','Computational'], quranRef: 'T08' },
    Philosophy:      { nameAr: 'الفلسفة', sub: ['Logic','Ethics','Epistemology','Philosophy of Mind'], quranRef: 'T09' },
    Anthropology:    { nameAr: 'الأنثروبولوجيا', use: 'تطور الثقافة + HCI', quranRef: 'K05' },
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── الطبقة ⅩⅥ: العلوم الإسلامية — الأساس والجذر لكل شيء ──────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// ﴿إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ﴾ — آل عمران: ١٩
// «طلب العلم فريضة على كل مسلم» — ابن ماجه: ٢٢٤

const LAYER_ISLAMIC_SCIENCES = Object.freeze({

  nameAr: 'العلوم الإسلامية — الأساس',
  tawheedRef: 'T01 — قُلْ هُوَ اللَّهُ أَحَدٌ',
  cellCount: 10,

  QURAN_SCIENCES: {
    nameAr: 'علوم القرآن الكريم',
    Tafsir:       { nameAr: 'التفسير',     method: 'بالمأثور / بالرأي / موضوعي',  refs: ['ابن كثير','الطبري','السعدي','القرطبي'], quranRef: 'T01' },
    Tajweed:      { nameAr: 'علم التجويد', rules: ['مخارج الحروف','صفاتها','المد','الإدغام','الإخفاء','الإقلاب'],           quranRef: 'T01' },
    QiraAt:       { nameAr: 'القراءات العشر', readers: ['حفص عن عاصم','ورش عن نافع','قالون','ابن كثير'],                  quranRef: 'T01' },
    Asbab:        { nameAr: 'أسباب النزول',   use: 'فهم السياق + الفقه',                                                  quranRef: 'T01' },
    Nasikh:       { nameAr: 'الناسخ والمنسوخ', use: 'الفقه + أصول الفقه',                                                quranRef: 'T01' },
    IjazQuran:    { nameAr: 'إعجاز القرآن',    types: ['لغوي','علمي','تشريعي','عددي'],                                    quranRef: 'T01' },
    Makki_Madani: { nameAr: 'المكي والمدني',   features: { Makki: 'عقيدة + قصص', Madani: 'أحكام + تشريع' },              quranRef: 'T01' },
    programming:  { arabic: 'علوم القرآن', programming: 'Source Code الأصلي للحضارة الإسلامية', quranRef: 'T01' },
  },

  HADITH_SCIENCES: {
    nameAr: 'علوم الحديث الشريف',
    Isnad:        { nameAr: 'علم الإسناد',     def: 'سلسلة رواة الحديث المتصلة',         quranRef: 'S01' },
    Rijal:        { nameAr: 'علم الرجال',       def: 'الجرح والتعديل للرواة',              quranRef: 'S01' },
    Mustalah:     { nameAr: 'مصطلح الحديث',    classes: { Sahih: 'ثابت', Hasan: 'حسن', Daif: 'ضعيف', Mawdu: 'موضوع' }, quranRef: 'S01' },
    SixBooks:     { nameAr: 'الكتب الستة',      books: ['البخاري','مسلم','أبوداود','الترمذي','النسائي','ابن ماجه'],       quranRef: 'S01' },
    Mutun:        { nameAr: 'متون الأحاديث',    major: ['الأربعون النووية','بلوغ المرام','رياض الصالحين'],               quranRef: 'S01' },
    programming:  { arabic: 'علم الحديث', programming: 'Version Control للشريعة — Git blame مع أعلى دقة ممكنة',        quranRef: 'S01' },
  },

  FIQH_JURISPRUDENCE: {
    nameAr: 'علم الفقه الإسلامي',
    Madhabs: {
      Hanafi:    { nameAr: 'الحنفية',   founder: 'أبو حنيفة النعمان (699-767م)', method: 'القياس + الاستحسان + العرف', spread: 'تركيا + جنوب آسيا + آسيا الوسطى', quranRef: 'S01' },
      Maliki:    { nameAr: 'المالكية',  founder: 'الإمام مالك بن أنس (711-795م)', method: 'عمل أهل المدينة + المصلحة',   spread: 'شمال أفريقيا + غرب أفريقيا',     quranRef: 'S01' },
      Shafii:    { nameAr: 'الشافعية', founder: 'الإمام الشافعي (767-820م)',      method: 'القياس الدقيق + الحجة',         spread: 'مصر + جنوب شرق آسيا',           quranRef: 'S01' },
      Hanbali:   { nameAr: 'الحنابلة', founder: 'الإمام أحمد بن حنبل (780-855م)', method: 'النص + الأثر + الاستصحاب',    spread: 'السعودية + الخليج',              quranRef: 'S01' },
    },
    Usul:        { nameAr: 'أصول الفقه', sources: ['القرآن','السنة','الإجماع','القياس'], methods: ['الاستحسان','المصلحة','العرف','سد الذرائع'], quranRef: 'S01' },
    Maqasid:     { nameAr: 'مقاصد الشريعة', pillars: ['حفظ الدين','حفظ النفس','حفظ العقل','حفظ النسل','حفظ المال'],    quranRef: 'T01' },
    Halal_Haram: { nameAr: 'الحلال والحرام', principle: 'الأصل الإباحة إلا ما ورد النص بتحريمه',                        quranRef: 'T01' },
    programming: { arabic: 'الفقه الإسلامي', programming: 'Legal Framework + Compliance Engine — محدَّث دائماً',        quranRef: 'T01' },
  },

  AQEEDAH: {
    nameAr: 'العقيدة الإسلامية',
    Tawheed:     { nameAr: 'التوحيد', types: ['توحيد الربوبية','توحيد الألوهية','توحيد الأسماء والصفات'], quranRef: 'T01' },
    Pillars_Iman:{ nameAr: 'أركان الإيمان', six: ['الله','ملائكته','كتبه','رسله','اليوم الآخر','القدر خيره وشره'], quranRef: 'T01' },
    Pillars_Islam:{ nameAr: 'أركان الإسلام', five: ['الشهادتان','الصلاة','الزكاة','الصوم','الحج'],                 quranRef: 'T01' },
    Schools:     { nameAr: 'مدارس العقيدة', major: ['الأشعرية','الماتريدية','الأثرية/السلفية'], quranRef: 'T01' },
    programming: { arabic: 'التوحيد', programming: 'Root Singleton — لا مثيل له إلا الله تعالى',                    quranRef: 'T01' },
  },

  ARABIC_LANGUAGE: {
    nameAr: 'علوم اللغة العربية',
    Nahw:        { nameAr: 'النحو',    def: 'قواعد تنظيم الجملة والإعراب',         refs: ['سيبويه','ابن مالك'],         quranRef: 'T08' },
    Sarf:        { nameAr: 'الصرف',    def: 'تحويل الكلمات وأوزانها',               refs: ['ابن عقيل','الشافية'],        quranRef: 'T08' },
    Balagha:     { nameAr: 'البلاغة',  branches: ['المعاني','البيان','البديع'],      ref: 'المفتاح للسكاكي',             quranRef: 'T08' },
    Arud:        { nameAr: 'العروض',   def: 'علم الشعر + الأوزان + القوافي',        quranRef: 'T08' },
    Istiqa:      { nameAr: 'الاشتقاق', def: 'اشتقاق الكلمات من الجذور الثلاثية',   quranRef: 'T08' },
    Muajam:      { nameAr: 'المعاجم',  major: ['لسان العرب','تاج العروس','المعجم الوسيط'], quranRef: 'T08' },
    programming: { arabic: 'اللغة العربية', programming: 'أصل كل لغة برمجة — الجذر ثلاثي = abstract class + interface', quranRef: 'T08' },
  },

  SEERAH: {
    nameAr: 'السيرة النبوية الشريفة',
    MeccanPeriod: { nameAr: 'الفترة المكية (13 سنة)',  phases: ['الدعوة السرية','الجهرية','الإسراء والمعراج','الهجرة'],  quranRef: 'S30' },
    MedinanPeriod:{ nameAr: 'الفترة المدنية (10 سنوات)', phases: ['بناء الدولة','الغزوات','فتح مكة','حجة الوداع'],       quranRef: 'S30' },
    Characteristics: { nameAr: 'خصائصه ﷺ', traits: ['الصدق','الأمانة','التبليغ','الفطانة'],                            quranRef: 'S30' },
    Companions:   { nameAr: 'الصحابة',      Khulafa: ['أبوبكر','عمر','عثمان','علي'],                                   quranRef: 'S30' },
    programming:  { arabic: 'السيرة النبوية', programming: 'Best Practices Documentation — أكمل نموذج حي في التاريخ',  quranRef: 'S30' },
  },

  SCIENCES_INTEGRATION: {
    nameAr: 'تكامل العلوم الإسلامية مع علوم الحاسب',
    note: 'كل فرع من العلوم الإسلامية يُقابَل برقمنة برمجية',
    mappings: [
      { islamic: 'علم الإسناد',      programming: 'Git blame + provenance tracking',       quranRef: 'S01' },
      { islamic: 'علم الجرح والتعديل', programming: 'Code Review + Trust Scoring',          quranRef: 'S01' },
      { islamic: 'الإجماع',          programming: 'Consensus Algorithm (Raft/Paxos)',       quranRef: 'S20' },
      { islamic: 'القياس',           programming: 'Analogical Reasoning / Inference Engine', quranRef: 'T09' },
      { islamic: 'المصلحة المرسلة',  programming: 'Cost-Benefit Optimization',              quranRef: 'T07' },
      { islamic: 'سد الذرائع',       programming: 'Security by Design / Fail-Safe',         quranRef: 'D04' },
      { islamic: 'الاستحسان',        programming: 'Pragmatic Override / Exception Handling', quranRef: 'T09' },
      { islamic: 'التوحيد',          programming: 'Singleton + Root of All',                quranRef: 'T01' },
      { islamic: 'الإتقان',          programming: 'Clean Code + Quality Assurance',         quranRef: 'S03' },
      { islamic: 'لا ضرر ولا ضرار', programming: 'Security + Privacy by Design',            quranRef: 'S02' },
      { islamic: 'اليسر ورفع الحرج', programming: 'UX + Accessibility',                    quranRef: 'S06' },
      { islamic: 'الشورى',           programming: 'Collaborative Development / RFC Process', quranRef: 'S27' },
      { islamic: 'الأمانة',          programming: 'Data Integrity + Cryptographic Trust',   quranRef: 'A01' },
      { islamic: 'العدل',            programming: 'Fair Scheduling + Load Balancing',        quranRef: 'S17' },
      { islamic: 'الرحمة',           programming: 'User-Centered Design + Graceful Degradation', quranRef: 'T03' },
    ],
  },
});


// ══════════════════════════════════════════════════════════════════════════════
// ─── محرك الشبكة العصبية الشاملة — الأساس المركزي ────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

class UniversalNeuralEngine extends EventEmitter {
  constructor() {
    super();

    this.tawheed   = TAWHEED;
    this.bismillah = BISMILLAH;
    this.schema    = SCHEMA;
    this.version   = VERSION;

    this.name    = 'Sheikha Universal Neural Network';
    this.nameAr  = 'الشبكة العصبية الشاملة — شيخة';
    this.startAt = new Date().toISOString();

    // الطبقات الست عشرة
    this.layers = {
      I:    LAYER_PROGRAMMING_LANGUAGES,
      II:   LAYER_MARKUP_SCHEMA,
      III:  LAYER_SYSTEMS_OS,
      IV:   LAYER_RUNTIMES_VMS,
      V:    LAYER_CS_THEORY,
      VI:   LAYER_ALGORITHMS_DS,
      VII:  LAYER_SOFTWARE_ENGINEERING,
      VIII: LAYER_DEV_TOOLS_DEVOPS,
      IX:   LAYER_METHODOLOGIES,
      X:    LAYER_RULES_LAWS,
      XI:   LAYER_DATABASES,
      XII:  LAYER_NETWORKS,
      XIII: LAYER_CLOUD_INFRA,
      XIV:  LAYER_AI_ML,
      XV:   LAYER_ALL_SCIENCES,
      XVI:  LAYER_ISLAMIC_SCIENCES,
    };

    // الخلايا العصبية المئة
    this.cells = NEURAL_CELLS_100;

    // إحصائيات
    this._stats = {
      queries:      0,
      trainedSteps: 0,
      totalCells:   NEURAL_CELLS_100.length,
      totalLayers:  Object.keys(this.layers).length,
    };

    this._ready = false;
  }

  // ─── تهيئة المحرك ──────────────────────────────────────────────────────────
  init() {
    if (this._ready) return this;

    this._ready  = true;
    this._initAt = new Date().toISOString();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  SHEIKHA UNIVERSAL NEURAL NETWORK — الشبكة العصبية الشاملة     ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log(`بسم الله الرحمن الرحيم — ${TAWHEED}`);
    console.log(`[SUNN] 🧠 الخلايا العصبية : ${this._stats.totalCells} خلية بالقرآن والسنة`);
    console.log(`[SUNN] 🌐 الطبقات الكاملة  : ${this._stats.totalLayers} طبقة شاملة`);
    console.log(`[SUNN] 📚 لغات البرمجة     : 150+ لغة مسجَّلة`);
    console.log(`[SUNN] 🔧 لغات الترميز     : 50+ لغة ترميز ومخطط`);
    console.log(`[SUNN] 💻 الأنظمة          : 60+ نظام تشغيل وبيئة`);
    console.log(`[SUNN] 🔬 العلوم           : 20+ تخصص علمي`);
    console.log(`[SUNN] ☪️  العلوم الإسلامية : الأساس والجذر لكل شيء`);
    console.log(`[SUNN] ✅ موحَّدة لله — كل شيء حلال — مرقَّمة بالكتاب والسنة`);
    console.log('');

    this.emit('ready', this.status());
    return this;
  }

  // ─── استعلام الطبقة ────────────────────────────────────────────────────────
  getLayer(layerKey) {
    const layer = this.layers[layerKey];
    if (!layer) {
      const keys = Object.keys(this.layers).join(', ');
      throw new Error(`[SUNN] الطبقة "${layerKey}" غير موجودة. المتاح: ${keys}`);
    }
    return layer;
  }

  // ─── البحث في الشبكة ───────────────────────────────────────────────────────
  search(query) {
    this._stats.queries++;
    if (!query) return { error: 'الاستعلام فارغ' };

    const q      = String(query).toLowerCase();
    const results = [];

    // البحث في الخلايا
    for (const cell of this.cells) {
      if (cell.text.includes(q) || cell.layer.includes(q) || cell.domain.includes(q) || cell.ref.includes(q)) {
        results.push({ type: 'cell', data: cell });
      }
    }

    // البحث في الطبقات
    for (const [key, layer] of Object.entries(this.layers)) {
      const layerStr = JSON.stringify(layer).toLowerCase();
      if (layerStr.includes(q)) {
        results.push({ type: 'layer', layerKey: key, nameAr: layer.nameAr });
      }
    }

    return {
      query,
      count:   results.length,
      results: results.slice(0, 20),
      tawheed: TAWHEED,
    };
  }

  // ─── جلب الخلايا بالنطاق ───────────────────────────────────────────────────
  getCellsByDomain(domain) {
    return this.cells.filter(c => c.domain === domain || c.domain === 'all');
  }

  // ─── جلب الخلايا بالطبقة ───────────────────────────────────────────────────
  getCellsByLayer(layer) {
    return this.cells.filter(c => c.layer === layer);
  }

  // ─── الخلية بالمعرّف ───────────────────────────────────────────────────────
  getCell(id) {
    return this.cells.find(c => c.id === id) || null;
  }

  // ─── رقمنة أي مفهوم بالكتاب والسنة ────────────────────────────────────────
  digitize(concept) {
    const cell = this.cells.find(c =>
      c.domain === concept || c.layer === concept || String(concept).includes(c.layer)
    );
    return {
      concept,
      tawheed:   TAWHEED,
      bismillah: BISMILLAH,
      cell:      cell || null,
      note:      cell ? `مرقَّم بـ ${cell.ref}` : 'يُرجع إلى T01 — التوحيد',
      quranRef:  cell ? cell.ref : 'الإخلاص:١-٤',
    };
  }

  // ─── حالة المحرك ───────────────────────────────────────────────────────────
  status() {
    return {
      name:     this.name,
      nameAr:   this.nameAr,
      version:  this.version,
      schema:   this.schema,
      tawheed:  this.tawheed,
      ready:    this._ready,
      initAt:   this._initAt || null,
      startAt:  this.startAt,
      stats: {
        ...this._stats,
        layers: Object.keys(this.layers).map(k => ({
          key:    k,
          nameAr: this.layers[k].nameAr,
          cells:  this.layers[k].cellCount || 0,
        })),
      },
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── تصدير المنظومة الكاملة ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const _engine = new UniversalNeuralEngine();

module.exports = {
  // المحرك الرئيسي
  engine:  _engine,
  UniversalNeuralEngine,

  // التوحيد والهوية
  TAWHEED,
  BISMILLAH,
  SCHEMA,
  VERSION,

  // الخلايا العصبية المئة
  NEURAL_CELLS_100,

  // الطبقات الست عشرة
  LAYER_PROGRAMMING_LANGUAGES,
  LAYER_MARKUP_SCHEMA,
  LAYER_SYSTEMS_OS,
  LAYER_RUNTIMES_VMS,
  LAYER_CS_THEORY,
  LAYER_ALGORITHMS_DS,
  LAYER_SOFTWARE_ENGINEERING,
  LAYER_DEV_TOOLS_DEVOPS,
  LAYER_METHODOLOGIES,
  LAYER_RULES_LAWS,
  LAYER_DATABASES,
  LAYER_NETWORKS,
  LAYER_CLOUD_INFRA,
  LAYER_AI_ML,
  LAYER_ALL_SCIENCES,
  LAYER_ISLAMIC_SCIENCES,

  // واجهة سريعة
  init:       () => _engine.init(),
  status:     () => _engine.status(),
  search:     (q) => _engine.search(q),
  getLayer:   (k) => _engine.getLayer(k),
  getCell:    (id) => _engine.getCell(id),
  digitize:   (c) => _engine.digitize(c),
  getCellsByDomain: (d) => _engine.getCellsByDomain(d),
};

