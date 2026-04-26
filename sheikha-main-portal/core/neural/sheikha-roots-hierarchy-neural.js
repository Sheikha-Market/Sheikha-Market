/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌳 SHEIKHA ROOTS & HIERARCHY NEURAL NETWORK                                 ║
 * ║  الشبكة العصبية للجذور والهياكل الهرمية — منظومة شيخة                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿ أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلاً كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *   أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ ﴾ — إبراهيم: 24
 *
 * الكلمة الطيبة كالشجرة — أصلها ثابت وفرعها في السماء.
 * هذه هي الشبكة العصبية الهرمية لمنظومة شيخة:
 *   • جذور ثابتة (Root Cells) — تحمل المبادئ العليا
 *   • فروع متشعبة (Branch Cells) — تنشر التفعيل والمعرفة
 *   • أوراق منتشرة (Leaf Cells) — تنفذ الوظائف التفصيلية
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * البنية الهرمية لمنظومة شيخة:
 *
 *   ROOT_MASTER          جذر التوحيد (الإخلاص:1)                depth=0
 *   ├── ROOT_LEGISLATIVE  جذر التشريع (المائدة:1)                depth=1
 *   │   ├── sharia        الشريعة الإسلامية                      depth=2
 *   │   ├── governance    الحوكمة والامتثال                      depth=2
 *   │   └── regulations   الأنظمة واللوائح                       depth=2
 *   ├── ROOT_ORG          جذر التنظيم (آل عمران:159)             depth=1
 *   │   ├── structure     الهيكل المؤسسي                         depth=2
 *   │   ├── delegation    تفويض الصلاحيات                        depth=2
 *   │   └── accountability المسؤولية والمحاسبة                   depth=2
 *   ├── ROOT_COMMERCE     جذر التجارة (البقرة:275)               depth=1
 *   │   ├── market        سوق الأسواق                            depth=2
 *   │   ├── contracts     عقود البيع والشراء                     depth=2
 *   │   └── payments      المدفوعات والزكاة                      depth=2
 *   ├── ROOT_KNOWLEDGE    جذر المعرفة (العلق:1)                  depth=1
 *   │   ├── islamic_sci   العلوم الشرعية                         depth=2
 *   │   ├── tech_sci      العلوم التقنية                         depth=2
 *   │   └── innovation    البحث والابتكار                        depth=2
 *   ├── ROOT_TECH         جذر التقنية (البقرة:31)                depth=1
 *   │   ├── ai            الذكاء الاصطناعي                       depth=2
 *   │   ├── networks      الشبكات والاتصالات                     depth=2
 *   │   └── infra         البنية التحتية والسحابة                depth=2
 *   └── ROOT_SOCIAL       جذر الاجتماعي (الحجرات:13)            depth=1
 *       ├── identity      الهوية الرقمية                         depth=2
 *       ├── education     التعليم والتدريب                       depth=2
 *       └── health        الصحة والبيئة                          depth=2
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * الخوارزميات:
 *   ① Forward Pass (Top-Down) — الانتشار من الجذر إلى الأوراق
 *      root → branches → leaves
 *      cell_activation = sigmoid(Σ parent_activation × w_edge + self_input × w_self + bias)
 *
 *   ② Backward Pass (Bottom-Up) — تدفق التدرج من الأوراق إلى الجذر
 *      leaves → branches → root
 *      parent_grad += Σ(child_grad × w_edge)
 *      w_edge -= lr × parent_activation × child_grad
 *
 *   ③ Hierarchical Aggregation — تجميع هرمي
 *      parent_aggregate = weighted_avg(children_activations)
 *      root_score = master_sigmoid(Σ root_activations)
 *
 *   ④ Synaptic Propagation — انتشار سينابتي بين الأخوة
 *      sibling_influence = tanh(sibling_activation × cross_weight × 0.2)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * واجهة الوحدة:
 *   init()                     — تهيئة الشبكة الهرمية
 *   infer(inputMap, context)   — استدلال هرمي (top-down)
 *   train(inputMap, targetMap, lr) — تدريب (bottom-up gradient)
 *   addNode(nodeConfig)        — إضافة عقدة للشجرة
 *   removeNode(nodeId)         — حذف عقدة (تنقل أطفالها لأبيها)
 *   getNode(nodeId)            — جلب عقدة
 *   getTree()                  — الشجرة الكاملة
 *   getPath(nodeId)            — مسار الجذر → العقدة
 *   getSubtree(nodeId)         — الشجرة الفرعية من عقدة
 *   getSynapticMap()           — خريطة الاتصالات
 *   status()                   — حالة الشبكة الكاملة
 *   createRouter()             — Express Router
 */

'use strict';

const path = require('path');

let express;
try { express = require('express'); } catch (_) { express = null; }

// ناقل البيانات (اختياري)
let _transport = null;
try {
    _transport = require('./sheikha-transport-bus');
} catch (_) { /* اختياري */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. دوال التفعيل
// ═══════════════════════════════════════════════════════════════════════════════

const sigmoid  = x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
const dsigmoid = y => y * (1 - y);
const relu     = x => Math.max(0, x);
const tanh     = x => Math.tanh(x);
const clamp    = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

// ═══════════════════════════════════════════════════════════════════════════════
// 2. تعريفات الشجرة الهرمية لمنظومة شيخة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * الشجرة الهرمية الافتراضية لمنظومة شيخة
 * كل عقدة تحمل: id, parentId, depth, type, nameAr, nameEn, ayah, reference, domain
 */
const DEFAULT_HIERARCHY = [

    // ═══ DEPTH 0 — الجذر الأعلى ═══════════════════════════════════════════════
    {
        id: 'root_master', parentId: null, depth: 0, type: 'root',
        nameAr: 'جذر التوحيد — منظومة شيخة',
        nameEn: 'Tawheed Master Root — Sheikha System',
        icon: '☀️',
        domain: 'master',
        ayah: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        reference: 'الإخلاص: 1',
        significance: 'التوحيد — أصل كل شيء وجذر كل منطق في الكون',
        initialWeight: 1.0,
        initialBias:   0.1,
    },

    // ═══ DEPTH 1 — الجذور الست ════════════════════════════════════════════════
    {
        id: 'root_legislative', parentId: 'root_master', depth: 1, type: 'root',
        nameAr: 'الجذر التشريعي',
        nameEn: 'Legislative Root',
        icon: '⚖️',
        domain: 'legislative',
        ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ',
        reference: 'المائدة: 1',
        significance: 'الوفاء بالعقود — الشريعة حاكمة على كل قرار',
        initialWeight: 0.95,
        initialBias:   0.05,
    },
    {
        id: 'root_org', parentId: 'root_master', depth: 1, type: 'root',
        nameAr: 'الجذر التنظيمي',
        nameEn: 'Organizational Root',
        icon: '🏛️',
        domain: 'organizational',
        ayah: 'وَشَاوِرْهُمْ فِي الْأَمْرِ',
        reference: 'آل عمران: 159',
        significance: 'الشورى — التنظيم والتسلسل الهرمي المُشاوَر',
        initialWeight: 0.90,
        initialBias:   0.05,
    },
    {
        id: 'root_commerce', parentId: 'root_master', depth: 1, type: 'root',
        nameAr: 'الجذر التجاري',
        nameEn: 'Commercial Root',
        icon: '🏪',
        domain: 'commercial',
        ayah: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
        reference: 'البقرة: 275',
        significance: 'حِل البيع وحُرمة الربا — التجارة الطاهرة',
        initialWeight: 0.92,
        initialBias:   0.05,
    },
    {
        id: 'root_knowledge', parentId: 'root_master', depth: 1, type: 'root',
        nameAr: 'الجذر المعرفي',
        nameEn: 'Knowledge Root',
        icon: '📚',
        domain: 'knowledge',
        ayah: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
        reference: 'العلق: 1',
        significance: 'الأمر بالقراءة — المعرفة أساس كل تقدم',
        initialWeight: 0.93,
        initialBias:   0.05,
    },
    {
        id: 'root_tech', parentId: 'root_master', depth: 1, type: 'root',
        nameAr: 'الجذر التقني',
        nameEn: 'Technical Root',
        icon: '⚙️',
        domain: 'technical',
        ayah: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
        reference: 'البقرة: 31',
        significance: 'تعليم الأسماء — التقنية والرقمنة أدوات الاستخلاف',
        initialWeight: 0.91,
        initialBias:   0.05,
    },
    {
        id: 'root_social', parentId: 'root_master', depth: 1, type: 'root',
        nameAr: 'الجذر الاجتماعي',
        nameEn: 'Social Root',
        icon: '🤝',
        domain: 'social',
        ayah: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا',
        reference: 'الحجرات: 13',
        significance: 'التعارف والتواصل — الاجتماع الإنساني المثمر',
        initialWeight: 0.88,
        initialBias:   0.05,
    },

    // ═══ DEPTH 2 — الفروع (18 فرع) ══════════════════════════════════════════

    // فروع الجذر التشريعي
    {
        id: 'br_sharia',      parentId: 'root_legislative', depth: 2, type: 'branch',
        nameAr: 'الشريعة الإسلامية', nameEn: 'Islamic Sharia', icon: '📖',
        domain: 'sharia',
        ayah: 'إِنِ الْحُكْمُ إِلَّا لِلَّهِ', reference: 'يوسف: 40',
        significance: 'الحكم لله — المرجعية العليا لكل قرار',
        initialWeight: 0.95, initialBias: 0.0,
    },
    {
        id: 'br_governance',  parentId: 'root_legislative', depth: 2, type: 'branch',
        nameAr: 'الحوكمة والامتثال', nameEn: 'Governance & Compliance', icon: '🛡️',
        domain: 'governance',
        ayah: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', reference: 'النساء: 58',
        significance: 'أداء الأمانات — الحوكمة العادلة',
        initialWeight: 0.90, initialBias: 0.0,
    },
    {
        id: 'br_regulations', parentId: 'root_legislative', depth: 2, type: 'branch',
        nameAr: 'الأنظمة واللوائح', nameEn: 'Regulations & Policies', icon: '📋',
        domain: 'regulations',
        ayah: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ', reference: 'النساء: 59',
        significance: 'طاعة ولاة الأمر — الالتزام باللوائح',
        initialWeight: 0.85, initialBias: 0.0,
    },

    // فروع الجذر التنظيمي
    {
        id: 'br_structure',   parentId: 'root_org', depth: 2, type: 'branch',
        nameAr: 'الهيكل المؤسسي', nameEn: 'Organizational Structure', icon: '🏗️',
        domain: 'structure',
        ayah: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ', reference: 'الملك: 1',
        significance: 'النظام والترتيب — الهيكل الراسخ',
        initialWeight: 0.88, initialBias: 0.0,
    },
    {
        id: 'br_delegation',  parentId: 'root_org', depth: 2, type: 'branch',
        nameAr: 'تفويض الصلاحيات', nameEn: 'Delegation of Authority', icon: '🔑',
        domain: 'delegation',
        ayah: 'كُلٌّ يَعْمَلُ عَلَىٰ شَاكِلَتِهِ', reference: 'الإسراء: 84',
        significance: 'كل يعمل وفق قدرته وتفويضه',
        initialWeight: 0.85, initialBias: 0.0,
    },
    {
        id: 'br_accountability', parentId: 'root_org', depth: 2, type: 'branch',
        nameAr: 'المسؤولية والمحاسبة', nameEn: 'Accountability', icon: '⚖️',
        domain: 'accountability',
        ayah: 'كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْؤُولٌ عَنْ رَعِيَّتِهِ', reference: 'البخاري',
        significance: 'المسؤولية الشاملة — كل راعٍ محاسَب',
        initialWeight: 0.87, initialBias: 0.0,
    },

    // فروع الجذر التجاري
    {
        id: 'br_market',     parentId: 'root_commerce', depth: 2, type: 'branch',
        nameAr: 'سوق الأسواق', nameEn: 'Market of Markets', icon: '🏬',
        domain: 'market',
        ayah: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', reference: 'الرحمن: 9',
        significance: 'العدل في الميزان — عدالة الأسواق',
        initialWeight: 0.90, initialBias: 0.0,
    },
    {
        id: 'br_contracts',  parentId: 'root_commerce', depth: 2, type: 'branch',
        nameAr: 'عقود البيع والشراء', nameEn: 'Trade Contracts', icon: '📝',
        domain: 'contracts',
        ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ', reference: 'النساء: 29',
        significance: 'تحريم أكل المال بالباطل — شروط العقد الصحيح',
        initialWeight: 0.88, initialBias: 0.0,
    },
    {
        id: 'br_payments',   parentId: 'root_commerce', depth: 2, type: 'branch',
        nameAr: 'المدفوعات والزكاة', nameEn: 'Payments & Zakat', icon: '💰',
        domain: 'payments',
        ayah: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ', reference: 'البقرة: 43',
        significance: 'الزكاة ركن — المال الطاهر يُزكَّى',
        initialWeight: 0.92, initialBias: 0.0,
    },

    // فروع الجذر المعرفي
    {
        id: 'br_islamic_sci', parentId: 'root_knowledge', depth: 2, type: 'branch',
        nameAr: 'العلوم الشرعية', nameEn: 'Islamic Sciences', icon: '🕌',
        domain: 'islamic_science',
        ayah: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ', reference: 'ابن ماجه',
        significance: 'طلب العلم فريضة — العلم الشرعي أوله',
        initialWeight: 0.93, initialBias: 0.0,
    },
    {
        id: 'br_tech_sci',   parentId: 'root_knowledge', depth: 2, type: 'branch',
        nameAr: 'العلوم التقنية', nameEn: 'Technical Sciences', icon: '🔬',
        domain: 'tech_science',
        ayah: 'الَّذِي عَلَّمَ بِالْقَلَمِ', reference: 'العلق: 4',
        significance: 'التعليم بالقلم — العلم التقني مكتسَب بالتدوين',
        initialWeight: 0.88, initialBias: 0.0,
    },
    {
        id: 'br_innovation', parentId: 'root_knowledge', depth: 2, type: 'branch',
        nameAr: 'البحث والابتكار', nameEn: 'Research & Innovation', icon: '💡',
        domain: 'innovation',
        ayah: 'وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ', reference: 'المطففين: 26',
        significance: 'التنافس في الخير — الابتكار المبني على القيم',
        initialWeight: 0.85, initialBias: 0.0,
    },

    // فروع الجذر التقني
    {
        id: 'br_ai',         parentId: 'root_tech', depth: 2, type: 'branch',
        nameAr: 'الذكاء الاصطناعي', nameEn: 'Artificial Intelligence', icon: '🤖',
        domain: 'ai',
        ayah: 'عَلَّمَهُ الْبَيَانَ', reference: 'الرحمن: 4',
        significance: 'تعليم البيان — الذكاء الاصطناعي يُبيّن ويُفسّر',
        initialWeight: 0.90, initialBias: 0.0,
    },
    {
        id: 'br_networks',   parentId: 'root_tech', depth: 2, type: 'branch',
        nameAr: 'الشبكات والاتصالات', nameEn: 'Networks & Telecom', icon: '📡',
        domain: 'networks',
        ayah: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ', reference: 'النور: 35',
        significance: 'نور السماوات والأرض — الشبكة تنقل النور',
        initialWeight: 0.87, initialBias: 0.0,
    },
    {
        id: 'br_infra',      parentId: 'root_tech', depth: 2, type: 'branch',
        nameAr: 'البنية التحتية والسحابة', nameEn: 'Infrastructure & Cloud', icon: '☁️',
        domain: 'infrastructure',
        ayah: 'أَوَلَمْ يَرَوْا أَنَّا خَلَقْنَا لَهُم مِّمَّا عَمِلَتْ أَيْدِينَا أَنْعَامًا', reference: 'يس: 71',
        significance: 'تسخير ما خُلق — البنية التحتية أداة تسخير',
        initialWeight: 0.85, initialBias: 0.0,
    },

    // فروع الجذر الاجتماعي
    {
        id: 'br_identity',   parentId: 'root_social', depth: 2, type: 'branch',
        nameAr: 'الهوية الرقمية', nameEn: 'Digital Identity', icon: '🪪',
        domain: 'identity',
        ayah: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ', reference: 'الحشر: 22',
        significance: 'علم الغيب والشهادة — الهوية الكاملة لا تُخفى',
        initialWeight: 0.88, initialBias: 0.0,
    },
    {
        id: 'br_education',  parentId: 'root_social', depth: 2, type: 'branch',
        nameAr: 'التعليم والتدريب', nameEn: 'Education & Training', icon: '🎓',
        domain: 'education',
        ayah: 'الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ', reference: 'الرحمن: 1-2',
        significance: 'الرحمن علّم — التعليم رحمة',
        initialWeight: 0.87, initialBias: 0.0,
    },
    {
        id: 'br_health',     parentId: 'root_social', depth: 2, type: 'branch',
        nameAr: 'الصحة والبيئة', nameEn: 'Health & Environment', icon: '🌱',
        domain: 'health',
        ayah: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا', reference: 'الأعراف: 56',
        significance: 'لا إفساد في الأرض — حفظ الصحة والبيئة',
        initialWeight: 0.82, initialBias: 0.0,
    },

    // ═══ DEPTH 3 — الأوراق (36 ورقة) ════════════════════════════════════════

    // أوراق الشريعة
    { id: 'lf_quran',         parentId: 'br_sharia',       depth: 3, type: 'leaf',
      nameAr: 'القرآن الكريم',          nameEn: 'Holy Quran',         icon: '📖',
      domain: 'quran',           ayah: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ', reference: 'الحجر: 9',
      initialWeight: 1.0, initialBias: 0.0 },
    { id: 'lf_sunnah',        parentId: 'br_sharia',       depth: 3, type: 'leaf',
      nameAr: 'السنة النبوية',           nameEn: 'Prophetic Sunnah',   icon: '🌙',
      domain: 'sunnah',          ayah: 'وَمَا يَنطِقُ عَنِ الْهَوَىٰ ۝ إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ', reference: 'النجم: 3-4',
      initialWeight: 0.98, initialBias: 0.0 },

    // أوراق الحوكمة
    { id: 'lf_charter',       parentId: 'br_governance',   depth: 3, type: 'leaf',
      nameAr: 'الميثاق الشرعي',          nameEn: 'Sharia Charter',      icon: '📜',
      domain: 'charter',         ayah: 'وَأَوْفُوا بِعَهْدِ اللَّهِ إِذَا عَاهَدتُّمْ', reference: 'النحل: 91',
      initialWeight: 0.95, initialBias: 0.0 },
    { id: 'lf_audit',         parentId: 'br_governance',   depth: 3, type: 'leaf',
      nameAr: 'التدقيق والمراجعة',        nameEn: 'Audit & Review',       icon: '🔍',
      domain: 'audit',           ayah: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', reference: 'الحديد: 4',
      initialWeight: 0.90, initialBias: 0.0 },

    // أوراق الهيكل
    { id: 'lf_hierarchy',     parentId: 'br_structure',    depth: 3, type: 'leaf',
      nameAr: 'التسلسل الهرمي',           nameEn: 'Hierarchy Tree',       icon: '🌳',
      domain: 'hierarchy',       ayah: 'وَرَفَعَ بَعْضَكُمْ فَوْقَ بَعْضٍ دَرَجَاتٍ', reference: 'الأنعام: 165',
      initialWeight: 0.88, initialBias: 0.0 },
    { id: 'lf_roles',         parentId: 'br_structure',    depth: 3, type: 'leaf',
      nameAr: 'الأدوار والمسؤوليات',       nameEn: 'Roles & Responsibilities', icon: '👥',
      domain: 'roles',           ayah: 'كُلُّ نَفْسٍ بِمَا كَسَبَتْ رَهِينَةٌ', reference: 'المدثر: 38',
      initialWeight: 0.85, initialBias: 0.0 },

    // أوراق السوق
    { id: 'lf_products',      parentId: 'br_market',       depth: 3, type: 'leaf',
      nameAr: 'المنتجات والخدمات',         nameEn: 'Products & Services',  icon: '📦',
      domain: 'products',        ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَحِلُّوا شَعَائِرَ اللَّهِ', reference: 'المائدة: 2',
      initialWeight: 0.88, initialBias: 0.0 },
    { id: 'lf_pricing',       parentId: 'br_market',       depth: 3, type: 'leaf',
      nameAr: 'الأسعار والتقييم',          nameEn: 'Pricing & Valuation',  icon: '💹',
      domain: 'pricing',         ayah: 'إِنَّ اللَّهَ هُوَ الْمُسَعِّرُ الْقَابِضُ الْبَاسِطُ', reference: 'حديث — رواه أبو داود',
      initialWeight: 0.85, initialBias: 0.0 },

    // أوراق العقود
    { id: 'lf_offer_accept',  parentId: 'br_contracts',    depth: 3, type: 'leaf',
      nameAr: 'الإيجاب والقبول',           nameEn: 'Offer & Acceptance',   icon: '🤝',
      domain: 'offer_accept',    ayah: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ', reference: 'المائدة: 1',
      initialWeight: 0.90, initialBias: 0.0 },
    { id: 'lf_disputes',      parentId: 'br_contracts',    depth: 3, type: 'leaf',
      nameAr: 'النزاعات والتحكيم',          nameEn: 'Disputes & Arbitration', icon: '⚖️',
      domain: 'disputes',        ayah: 'فَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ', reference: 'النساء: 59',
      initialWeight: 0.85, initialBias: 0.0 },

    // أوراق المدفوعات
    { id: 'lf_halal_payment', parentId: 'br_payments',     depth: 3, type: 'leaf',
      nameAr: 'الدفع الحلال',              nameEn: 'Halal Payment',         icon: '💳',
      domain: 'halal_payment',   ayah: 'وَلَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ', reference: 'البقرة: 188',
      initialWeight: 0.92, initialBias: 0.0 },
    { id: 'lf_zakat_calc',    parentId: 'br_payments',     depth: 3, type: 'leaf',
      nameAr: 'حساب الزكاة',               nameEn: 'Zakat Calculator',      icon: '🕌',
      domain: 'zakat',           ayah: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ', reference: 'التوبة: 103',
      initialWeight: 0.95, initialBias: 0.0 },

    // أوراق العلوم الشرعية
    { id: 'lf_fiqh',          parentId: 'br_islamic_sci',  depth: 3, type: 'leaf',
      nameAr: 'الفقه الإسلامي',            nameEn: 'Islamic Jurisprudence',  icon: '📕',
      domain: 'fiqh',            ayah: 'فَلَوْلَا نَفَرَ مِن كُلِّ فِرْقَةٍ مِّنْهُمْ طَائِفَةٌ لِّيَتَفَقَّهُوا فِي الدِّينِ', reference: 'التوبة: 122',
      initialWeight: 0.95, initialBias: 0.0 },
    { id: 'lf_hadith_auth',   parentId: 'br_islamic_sci',  depth: 3, type: 'leaf',
      nameAr: 'علم الحديث وتوثيقه',         nameEn: 'Hadith Authentication',  icon: '📜',
      domain: 'hadith',          ayah: 'فَتَبَيَّنُوا أَن تُصِيبُوا قَوْمًا بِجَهَالَةٍ', reference: 'الحجرات: 6',
      initialWeight: 0.93, initialBias: 0.0 },

    // أوراق العلوم التقنية
    { id: 'lf_algorithms',    parentId: 'br_tech_sci',     depth: 3, type: 'leaf',
      nameAr: 'الخوارزميات والبيانات',       nameEn: 'Algorithms & Data',     icon: '💻',
      domain: 'algorithms',      ayah: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ', reference: 'القمر: 17',
      initialWeight: 0.88, initialBias: 0.0 },
    { id: 'lf_security',      parentId: 'br_tech_sci',     depth: 3, type: 'leaf',
      nameAr: 'الأمن المعلوماتي',            nameEn: 'Information Security',  icon: '🔒',
      domain: 'security',        ayah: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ', reference: 'الأنفال: 60',
      initialWeight: 0.90, initialBias: 0.0 },

    // أوراق الابتكار
    { id: 'lf_research',      parentId: 'br_innovation',   depth: 3, type: 'leaf',
      nameAr: 'البحث العلمي',               nameEn: 'Scientific Research',   icon: '🔭',
      domain: 'research',        ayah: 'أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ يَعْقِلُونَ بِهَا', reference: 'الحج: 46',
      initialWeight: 0.85, initialBias: 0.0 },
    { id: 'lf_patents',       parentId: 'br_innovation',   depth: 3, type: 'leaf',
      nameAr: 'الملكية الفكرية',             nameEn: 'Intellectual Property', icon: '💡',
      domain: 'ip',              ayah: 'وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ', reference: 'هود: 85',
      initialWeight: 0.82, initialBias: 0.0 },

    // أوراق الذكاء الاصطناعي
    { id: 'lf_llm',           parentId: 'br_ai',           depth: 3, type: 'leaf',
      nameAr: 'نماذج اللغة الكبيرة',         nameEn: 'Large Language Models', icon: '🧠',
      domain: 'llm',             ayah: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', reference: 'طه: 114',
      initialWeight: 0.90, initialBias: 0.0 },
    { id: 'lf_ml',            parentId: 'br_ai',           depth: 3, type: 'leaf',
      nameAr: 'التعلم الآلي والعميق',         nameEn: 'Machine & Deep Learning', icon: '📊',
      domain: 'machine_learning', ayah: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ', reference: 'البيهقي',
      initialWeight: 0.88, initialBias: 0.0 },

    // أوراق الشبكات
    { id: 'lf_5g',            parentId: 'br_networks',     depth: 3, type: 'leaf',
      nameAr: 'شبكات الجيل الخامس 5G',       nameEn: '5G Networks',            icon: '📶',
      domain: '5g',              ayah: 'وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ', reference: 'الذاريات: 22',
      initialWeight: 0.87, initialBias: 0.0 },
    { id: 'lf_iot',           parentId: 'br_networks',     depth: 3, type: 'leaf',
      nameAr: 'إنترنت الأشياء',              nameEn: 'Internet of Things',     icon: '🌐',
      domain: 'iot',             ayah: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا', reference: 'الجاثية: 13',
      initialWeight: 0.85, initialBias: 0.0 },

    // أوراق البنية التحتية
    { id: 'lf_cloud',         parentId: 'br_infra',        depth: 3, type: 'leaf',
      nameAr: 'الحوسبة السحابية',             nameEn: 'Cloud Computing',        icon: '☁️',
      domain: 'cloud',           ayah: 'اللَّهُ الَّذِي يُرْسِلُ الرِّيَاحَ فَتُثِيرُ سَحَابًا', reference: 'الروم: 48',
      initialWeight: 0.87, initialBias: 0.0 },
    { id: 'lf_devops',        parentId: 'br_infra',        depth: 3, type: 'leaf',
      nameAr: 'CI/CD والتطوير المستمر',        nameEn: 'CI/CD & DevOps',          icon: '⚙️',
      domain: 'devops',          ayah: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ', reference: 'الرعد: 11',
      initialWeight: 0.85, initialBias: 0.0 },

    // أوراق الهوية
    { id: 'lf_auth',          parentId: 'br_identity',     depth: 3, type: 'leaf',
      nameAr: 'المصادقة والتحقق',             nameEn: 'Authentication',          icon: '🔐',
      domain: 'auth',            ayah: 'لَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا', reference: 'الحجرات: 12',
      initialWeight: 0.90, initialBias: 0.0 },
    { id: 'lf_privacy',       parentId: 'br_identity',     depth: 3, type: 'leaf',
      nameAr: 'الخصوصية وحماية البيانات',      nameEn: 'Privacy & Data Protection', icon: '🛡️',
      domain: 'privacy',         ayah: 'إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا', reference: 'النساء: 1',
      initialWeight: 0.88, initialBias: 0.0 },

    // أوراق التعليم
    { id: 'lf_curriculum',    parentId: 'br_education',    depth: 3, type: 'leaf',
      nameAr: 'المناهج التعليمية',             nameEn: 'Educational Curriculum',  icon: '📚',
      domain: 'curriculum',      ayah: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', reference: 'البخاري',
      initialWeight: 0.88, initialBias: 0.0 },
    { id: 'lf_skills',        parentId: 'br_education',    depth: 3, type: 'leaf',
      nameAr: 'المهارات والكفاءات',             nameEn: 'Skills & Competencies',   icon: '🎯',
      domain: 'skills',          ayah: 'هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', reference: 'الزمر: 9',
      initialWeight: 0.85, initialBias: 0.0 },

    // أوراق الصحة
    { id: 'lf_wellness',      parentId: 'br_health',       depth: 3, type: 'leaf',
      nameAr: 'الصحة والعافية',               nameEn: 'Health & Wellness',       icon: '💚',
      domain: 'wellness',        ayah: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ', reference: 'الشعراء: 80',
      initialWeight: 0.83, initialBias: 0.0 },
    { id: 'lf_sustainability', parentId: 'br_health',      depth: 3, type: 'leaf',
      nameAr: 'الاستدامة البيئية',             nameEn: 'Environmental Sustainability', icon: '🌍',
      domain: 'sustainability',  ayah: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا', reference: 'الأعراف: 56',
      initialWeight: 0.82, initialBias: 0.0 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. RootNeuralCell — الخلية العصبية الهرمية
// ═══════════════════════════════════════════════════════════════════════════════

class RootNeuralCell {
    /**
     * @param {object} def — تعريف العقدة من DEFAULT_HIERARCHY
     */
    constructor(def) {
        // ─── هوية العقدة ───────────────────────────────────────────────────────
        this.id         = def.id;
        this.parentId   = def.parentId;
        this.depth      = def.depth;
        this.type       = def.type;         // 'root' | 'branch' | 'leaf'
        this.nameAr     = def.nameAr;
        this.nameEn     = def.nameEn;
        this.icon       = def.icon;
        this.domain     = def.domain;
        this.ayah       = def.ayah;
        this.reference  = def.reference;
        this.significance = def.significance || '';

        // ─── مؤشرات الشجرة (تُملأ عند بناء الشجرة) ──────────────────────────
        this.children   = [];               // معرفات الأبناء
        this.parentCell = null;             // مرجع لخلية الأب

        // ─── الأوزان الهرمية ──────────────────────────────────────────────────
        // w_parent: الوزن على الحافة من الأب إلى هذه العقدة
        this.w_parent   = def.initialWeight || 0.8;
        // w_self: الوزن الذاتي على الإدخال المباشر لهذه العقدة
        this.w_self     = 0.6;
        // w_children: أوزان الأبناء (تُضاف عند إضافة ابن)
        this.w_children = {};               // childId → weight
        // الانحياز
        this.bias       = def.initialBias  || 0.0;

        // ─── حالة التفعيل ────────────────────────────────────────────────────
        this.activation    = 0;             // قيمة التفعيل الحالية (0–1)
        this.potential     = 0;             // إمكانية التفعيل (قبل sigmoid)
        this.aggregated    = 0;             // تجميع الأبناء (للعقد الأب)
        this.selfInput     = 0;             // إدخال خارجي مباشر لهذه العقدة
        this.fireCount     = 0;
        this.lastFiredAt   = null;

        // ─── لأغراض التدريب (Backprop) ───────────────────────────────────────
        this._grad         = 0;             // التدرج المتراكم
        this._delta        = 0;             // delta = grad × dsigmoid(activation)
    }

    /** تهيئة أوزان الأبناء عند بناء الشجرة */
    initChildWeight(childId, w = 0.8) {
        this.w_children[childId] = w;
    }

    /**
     * حساب التفعيل — Forward Pass لهذه العقدة
     *
     * potential = parentActivation × w_parent + selfInput × w_self + Σ(sibling × w_sibling × 0.1) + bias
     * activation = sigmoid(potential)
     *
     * @param {number}   parentActivation — تفعيل الأب (0 للجذر الأعلى)
     * @param {number[]} siblingSignals    — إشارات الأخوة [(activation, weight), ...]
     * @returns {number} activation
     */
    forward(parentActivation = 0, siblingSignals = []) {
        let raw = this.bias;

        // مساهمة الأب
        raw += parentActivation * this.w_parent;

        // مساهمة الإدخال الذاتي
        raw += this.selfInput * this.w_self;

        // مساهمة الأخوة (weak lateral signal)
        for (const [sAct, sW] of siblingSignals) {
            raw += sAct * sW * 0.15;
        }

        this.potential  = raw;
        this.activation = sigmoid(raw);

        if (this.activation > 0.1) {
            this.fireCount++;
            this.lastFiredAt = new Date().toISOString();
        }

        return this.activation;
    }

    /**
     * حساب التفعيل المُجمَّع من الأبناء (للعقد الأب)
     * aggregated = weighted_avg(children_activations)
     *
     * @param {RootNeuralCell[]} childCells — الخلايا الأبناء
     * @returns {number} قيمة التجميع (0–1)
     */
    aggregateChildren(childCells) {
        if (childCells.length === 0) return this.activation;

        let sumW = 0, sumWA = 0;
        for (const c of childCells) {
            const w = this.w_children[c.id] || 0.8;
            sumWA += c.activation * w;
            sumW  += w;
        }
        this.aggregated = sumW > 0 ? clamp(sumWA / sumW) : 0;
        return this.aggregated;
    }

    /**
     * حساب التدرج للتحديث — Backward Pass
     * @param {number} upstreamGrad — التدرج من الأب
     */
    backward(upstreamGrad = 0) {
        this._grad  += upstreamGrad;
        this._delta  = this._grad * dsigmoid(this.activation);
        return this._delta;
    }

    /**
     * تحديث الأوزان باستخدام Adam مبسّط
     */
    updateWeights(lr = 0.001) {
        const d = this._delta;
        if (Math.abs(d) < 1e-10) { this._grad = 0; return; }

        // تحديث وزن الأب
        this.w_parent = clamp(this.w_parent - lr * d * (this.parentCell ? this.parentCell.activation : 0.5), 0.01, 2.0);

        // تحديث الانحياز
        this.bias    -= lr * d;
        this.bias     = clamp(this.bias, -2, 2);

        // إعادة تعيين
        this._grad = 0;
        this._delta = 0;
    }

    /** تصدير حالة العقدة */
    toJSON() {
        return {
            id:         this.id,
            parentId:   this.parentId,
            depth:      this.depth,
            type:       this.type,
            nameAr:     this.nameAr,
            nameEn:     this.nameEn,
            icon:       this.icon,
            domain:     this.domain,
            ayah:       this.ayah,
            reference:  this.reference,
            activation: +this.activation.toFixed(4),
            potential:  +this.potential.toFixed(4),
            aggregated: +this.aggregated.toFixed(4),
            selfInput:  +this.selfInput.toFixed(4),
            w_parent:   +this.w_parent.toFixed(4),
            w_self:     +this.w_self.toFixed(4),
            bias:       +this.bias.toFixed(4),
            fireCount:  this.fireCount,
            lastFiredAt:this.lastFiredAt,
            children:   this.children,
        };
    }

    reset() {
        this.activation = 0;
        this.potential  = 0;
        this.aggregated = 0;
        this.selfInput  = 0;
        this._grad      = 0;
        this._delta     = 0;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. HierarchyNeuralNetwork — الشبكة العصبية الهرمية الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

class HierarchyNeuralNetwork {
    constructor(definitions = DEFAULT_HIERARCHY) {
        // ─── بناء الخلايا ──────────────────────────────────────────────────────
        this._nodes    = new Map();  // id → RootNeuralCell
        this._root     = null;       // العقدة الجذر العليا
        this._byDepth  = new Map();  // depth → RootNeuralCell[]

        // ─── سجلات ────────────────────────────────────────────────────────────
        this.inferenceLog   = [];
        this.trainedSteps   = 0;
        this.totalInferences= 0;
        this.lossHistory    = [];

        // بناء الشجرة من التعريفات
        this._buildTree(definitions);

        console.log(`[HIERARCHY-NN] 🌳 شجرة هرمية: ${this._nodes.size} عقدة — ${this._byDepth.size} مستويات`);
    }

    // ─── بناء الشجرة ──────────────────────────────────────────────────────────

    _buildTree(definitions) {
        // المرحلة 1: إنشاء الخلايا
        for (const def of definitions) {
            const cell = new RootNeuralCell(def);
            this._nodes.set(def.id, cell);

            if (!this._byDepth.has(def.depth)) this._byDepth.set(def.depth, []);
            this._byDepth.get(def.depth).push(cell);
        }

        // المرحلة 2: ربط الوالدين والأبناء
        for (const [, cell] of this._nodes) {
            if (cell.parentId === null) {
                this._root = cell;
            } else {
                const parent = this._nodes.get(cell.parentId);
                if (parent) {
                    cell.parentCell = parent;
                    parent.children.push(cell.id);
                    parent.initChildWeight(cell.id, cell.w_parent);
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ① FORWARD PASS — الانتشار الأمامي (Top-Down: جذر → أوراق)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * infer — استدلال هرمي
     *
     * يأخذ خريطة إدخال { nodeId: value } ويُشغّل الانتشار الأمامي
     * من الجذر إلى الأوراق مع انتشار سينابتي بين الأخوة.
     *
     * ﴿ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ ﴾ — إبراهيم: 24
     *
     * @param {object} inputMap — { nodeId: activationValue (0–1) }
     * @param {string} context  — وصف السياق للسجل
     * @returns {object} نتيجة الاستدلال مع الشجرة المفعّلة
     */
    infer(inputMap = {}, context = '') {
        // تعيين الإدخالات الذاتية
        for (const [id, val] of Object.entries(inputMap)) {
            const cell = this._nodes.get(id);
            if (cell) cell.selfInput = clamp(Number(val) || 0);
        }

        // إعادة تعيين جميع التفعيلات
        for (const [, cell] of this._nodes) cell.reset();

        // إعادة تعيين الإدخالات الذاتية
        for (const [id, val] of Object.entries(inputMap)) {
            const cell = this._nodes.get(id);
            if (cell) cell.selfInput = clamp(Number(val) || 0);
        }

        // ─── Forward BFS: جذر → فروع → أوراق ───────────────────────────────
        const maxDepth = Math.max(...Array.from(this._byDepth.keys()));

        for (let d = 0; d <= maxDepth; d++) {
            const level = this._byDepth.get(d) || [];
            for (const cell of level) {
                const parentAct = cell.parentCell ? cell.parentCell.activation : 0;

                // إشارات الأخوة
                const siblings = this._getSiblingSignals(cell);

                // تفعيل هذه الخلية
                cell.forward(parentAct, siblings);
            }
        }

        // ─── تجميع الأبناء من الأسفل للأعلى ──────────────────────────────────
        for (let d = maxDepth; d >= 0; d--) {
            const level = this._byDepth.get(d) || [];
            for (const cell of level) {
                const childCells = cell.children.map(id => this._nodes.get(id)).filter(Boolean);
                if (childCells.length > 0) {
                    cell.aggregateChildren(childCells);
                }
            }
        }

        // ─── بناء النتيجة ─────────────────────────────────────────────────────
        const allNodes   = Array.from(this._nodes.values()).map(c => c.toJSON());
        const topActive  = [...allNodes].sort((a, b) => b.activation - a.activation).slice(0, 5);
        const rootScore  = this._root ? this._root.activation : 0;
        const treeScore  = this._computeTreeScore();

        const record = {
            id:          `hinf_${Date.now()}_${this.totalInferences}`,
            context,
            timestamp:   new Date().toISOString(),
            rootScore:   +rootScore.toFixed(4),
            treeScore:   +treeScore.toFixed(4),
            topActive,
            totalNodes:  allNodes.length,
            quran:       '﴿ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ ﴾',
        };

        this.inferenceLog.unshift(record);
        if (this.inferenceLog.length > 100) this.inferenceLog.length = 100;
        this.totalInferences++;

        // إرسال حدث للناقل
        if (_transport) {
            _transport.emit('neural.pulse', { type: 'hierarchy_infer', rootScore, treeScore }, 'hierarchy-nn');
        }

        return record;
    }

    /** إشارات الأخوة لخلية معينة */
    _getSiblingSignals(cell) {
        if (!cell.parentCell) return [];
        const signals = [];
        for (const sibId of cell.parentCell.children) {
            if (sibId === cell.id) continue;
            const sib = this._nodes.get(sibId);
            if (sib && sib.activation > 0) {
                const w = cell.parentCell.w_children[sibId] || 0.5;
                signals.push([sib.activation, w]);
            }
        }
        return signals;
    }

    /** حساب نقاط الشجرة الكاملة — متوسط مُوزَّن بالعمق */
    _computeTreeScore() {
        let sum = 0, count = 0;
        const maxDepth = Math.max(...Array.from(this._byDepth.keys()));
        for (const [d, level] of this._byDepth) {
            // الأوراق العميقة تؤثر أكثر (أهمية تفصيلية)
            const depthWeight = 1 + d / (maxDepth || 1);
            for (const cell of level) {
                sum   += cell.activation * depthWeight;
                count += depthWeight;
            }
        }
        return count > 0 ? clamp(sum / count) : 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ② BACKWARD PASS — التدريب (Bottom-Up: أوراق → جذر)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * train — تدريب الشبكة على مثال هرمي
     *
     * ﴿ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ﴾ — الزلزلة: 7
     * كل وزن يُعدَّل يُعدَّل بدقة مثقال ذرة.
     *
     * @param {object} inputMap  — { nodeId: value } — الإدخال
     * @param {object} targetMap — { nodeId: targetValue } — القيم المستهدفة
     * @param {number} lr        — معدل التعلم
     * @returns {object} { loss, steps }
     */
    train(inputMap = {}, targetMap = {}, lr = 0.001) {
        // Forward
        this.infer(inputMap, 'training');

        const maxDepth = Math.max(...Array.from(this._byDepth.keys()));

        // ─── حساب الخسارة MSE ─────────────────────────────────────────────────
        let loss = 0, count = 0;
        const targets = { ...targetMap };

        for (const [, cell] of this._nodes) {
            const target = targets[cell.id];
            if (target !== undefined) {
                const diff = cell.activation - clamp(Number(target));
                loss += diff * diff;
                count++;
                // تعيين تدرج الخسارة
                cell._grad = 2 * diff;
            }
        }
        loss = count > 0 ? loss / count : 0;

        // ─── Backward BFS: أوراق → جذر ────────────────────────────────────────
        for (let d = maxDepth; d >= 0; d--) {
            const level = this._byDepth.get(d) || [];
            for (const cell of level) {
                const delta = cell.backward(cell._grad);

                // نشر التدرج للأب
                if (cell.parentCell) {
                    cell.parentCell._grad += delta * cell.w_parent;
                }

                // نشر التدرج للأبناء (مساهمة صغيرة)
                for (const cId of cell.children) {
                    const c = this._nodes.get(cId);
                    if (c) c._grad += delta * (cell.w_children[cId] || 0.5) * 0.1;
                }

                // تحديث الأوزان
                cell.updateWeights(lr);
            }
        }

        this.trainedSteps++;
        this.lossHistory.unshift({ step: this.trainedSteps, loss: +loss.toFixed(6), timestamp: new Date().toISOString() });
        if (this.lossHistory.length > 200) this.lossHistory.length = 200;

        return { loss: +loss.toFixed(6), steps: this.trainedSteps };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ③ إدارة الشجرة — إضافة / حذف / استعلام
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * addNode — إضافة عقدة جديدة للشجرة
     */
    addNode(config = {}) {
        const { id, parentId, nameAr, nameEn = nameAr, icon = '🔵', domain = 'custom',
                ayah = '', reference = '', depth, initialWeight = 0.8 } = config;

        if (!id || !parentId) return { success: false, error: 'يلزم id و parentId' };
        if (this._nodes.has(id)) return { success: false, error: `العقدة "${id}" موجودة مسبقاً` };

        const parent = this._nodes.get(parentId);
        if (!parent) return { success: false, error: `الأب "${parentId}" غير موجود` };

        const nodeDepth = depth !== undefined ? depth : parent.depth + 1;
        const type = nodeDepth === 1 ? 'root' : nodeDepth === 2 ? 'branch' : 'leaf';

        const cell = new RootNeuralCell({ id, parentId, depth: nodeDepth, type, nameAr, nameEn, icon, domain, ayah, reference, initialWeight });
        cell.parentCell = parent;
        parent.children.push(id);
        parent.initChildWeight(id, initialWeight);

        this._nodes.set(id, cell);
        if (!this._byDepth.has(nodeDepth)) this._byDepth.set(nodeDepth, []);
        this._byDepth.get(nodeDepth).push(cell);

        return { success: true, node: cell.toJSON() };
    }

    /**
     * removeNode — حذف عقدة (تنقل أطفالها لأبيها)
     */
    removeNode(nodeId) {
        if (nodeId === 'root_master') return { success: false, error: 'لا يمكن حذف الجذر الأعلى' };
        const cell = this._nodes.get(nodeId);
        if (!cell) return { success: false, error: 'العقدة غير موجودة' };

        // نقل الأبناء للأب
        const parent = cell.parentCell;
        if (parent) {
            parent.children = parent.children.filter(c => c !== nodeId);
            for (const childId of cell.children) {
                const child = this._nodes.get(childId);
                if (child) {
                    child.parentId  = parent.id;
                    child.parentCell= parent;
                    parent.children.push(childId);
                    parent.initChildWeight(childId, child.w_parent);
                }
            }
        }

        // إزالة من الطبقة
        const level = this._byDepth.get(cell.depth) || [];
        const idx   = level.indexOf(cell);
        if (idx !== -1) level.splice(idx, 1);

        this._nodes.delete(nodeId);
        return { success: true, removedId: nodeId, childrenReattached: cell.children.length };
    }

    /** جلب عقدة بمعرفها */
    getNode(nodeId) {
        const cell = this._nodes.get(nodeId);
        return cell ? cell.toJSON() : null;
    }

    /**
     * getTree — الشجرة الكاملة بصيغة JSON مُدمَجة
     */
    getTree(nodeId = null) {
        const startId = nodeId || (this._root ? this._root.id : null);
        if (!startId) return null;
        return this._buildTreeJSON(startId);
    }

    _buildTreeJSON(nodeId) {
        const cell = this._nodes.get(nodeId);
        if (!cell) return null;
        const node = cell.toJSON();
        node.childNodes = cell.children.map(cId => this._buildTreeJSON(cId)).filter(Boolean);
        return node;
    }

    /**
     * getPath — مسار من الجذر إلى العقدة
     */
    getPath(nodeId) {
        const path = [];
        let cell = this._nodes.get(nodeId);
        while (cell) {
            path.unshift({ id: cell.id, nameAr: cell.nameAr, depth: cell.depth, activation: +cell.activation.toFixed(4) });
            cell = cell.parentCell;
        }
        return path;
    }

    /**
     * getSubtree — الشجرة الفرعية من عقدة محددة (بدون أبناء أعمق من maxDepth)
     */
    getSubtree(nodeId, maxRelDepth = 3) {
        const root = this._nodes.get(nodeId);
        if (!root) return null;
        return this._buildSubtreeJSON(nodeId, root.depth, maxRelDepth);
    }

    _buildSubtreeJSON(nodeId, baseDepth, maxRelDepth) {
        const cell = this._nodes.get(nodeId);
        if (!cell || cell.depth - baseDepth > maxRelDepth) return null;
        const node = cell.toJSON();
        node.childNodes = cell.children.map(cId => this._buildSubtreeJSON(cId, baseDepth, maxRelDepth)).filter(Boolean);
        return node;
    }

    /**
     * getSynapticMap — خريطة الاتصالات (حواف الشجرة)
     */
    getSynapticMap() {
        const nodes = Array.from(this._nodes.values()).map(c => ({
            id:         c.id,
            nameAr:     c.nameAr,
            icon:       c.icon,
            depth:      c.depth,
            type:       c.type,
            activation: +c.activation.toFixed(4),
            domain:     c.domain,
        }));

        const edges = [];
        for (const [, cell] of this._nodes) {
            if (cell.parentCell) {
                edges.push({
                    source:  cell.parentId,
                    target:  cell.id,
                    weight:  +cell.w_parent.toFixed(4),
                    type:    'parent-child',
                    active:  cell.activation > 0.3 && cell.parentCell.activation > 0.3,
                });
            }
            // إضافة حواف الأخوة
            if (cell.parentCell) {
                for (const sibId of cell.parentCell.children) {
                    if (sibId <= cell.id) continue;  // لا تكرار
                    const sib = this._nodes.get(sibId);
                    if (sib) {
                        edges.push({
                            source: cell.id,
                            target: sibId,
                            weight: +(cell.parentCell.w_children[sibId] || 0.5).toFixed(4) * 0.15,
                            type:   'sibling',
                            active: cell.activation > 0.3 && sib.activation > 0.3,
                        });
                    }
                }
            }
        }

        return { nodes, edges, totalNodes: nodes.length, totalEdges: edges.length };
    }

    /** البحث في الشجرة */
    search(query = '') {
        const q = query.toLowerCase();
        const results = [];
        for (const [, cell] of this._nodes) {
            if (
                cell.id.includes(q) ||
                cell.nameAr.includes(q) ||
                (cell.nameEn || '').toLowerCase().includes(q) ||
                cell.domain.includes(q)
            ) {
                results.push(cell.toJSON());
            }
        }
        return results;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ④ حالة الشبكة
    // ═══════════════════════════════════════════════════════════════════════════

    status() {
        const allCells   = Array.from(this._nodes.values());
        const activeCells= allCells.filter(c => c.activation > 0.3).length;
        const maxDepth   = Math.max(...Array.from(this._byDepth.keys()));

        const byDepth = {};
        for (const [d, level] of this._byDepth) {
            byDepth[d] = { count: level.length, avgActivation: +(level.reduce((s, c) => s + c.activation, 0) / (level.length || 1)).toFixed(4) };
        }

        const topCells = [...allCells]
            .sort((a, b) => b.activation - a.activation)
            .slice(0, 5)
            .map(c => ({ id: c.id, nameAr: c.nameAr, depth: c.depth, activation: +c.activation.toFixed(4) }));

        return {
            module:       'sheikha-roots-hierarchy-neural',
            nameAr:       'الشبكة العصبية للجذور والهياكل الهرمية — منظومة شيخة',
            nameEn:       'Sheikha Roots & Hierarchy Neural Network',
            ready:        true,
            totalNodes:   this._nodes.size,
            activeCells,
            maxDepth,
            trainedSteps: this.trainedSteps,
            totalInferences: this.totalInferences,
            rootActivation: this._root ? +this._root.activation.toFixed(4) : 0,
            treeScore:    +this._computeTreeScore().toFixed(4),
            byDepth,
            topCells,
            lastLoss:     this.lossHistory[0]?.loss || null,
            lastInference:this.inferenceLog[0]   || null,
            quran:        '﴿ كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ ﴾ — إبراهيم: 24',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Singleton — نسخة واحدة مشتركة
// ═══════════════════════════════════════════════════════════════════════════════

let _network = null;

function getNetwork() {
    if (!_network) {
        _network = new HierarchyNeuralNetwork(DEFAULT_HIERARCHY);
    }
    return _network;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Express Router — /api/hierarchy
// ═══════════════════════════════════════════════════════════════════════════════

function createRouter() {
    if (!express) return null;
    const net = getNetwork();
    const router = express.Router();
    router.use(express.json());

    // GET /api/hierarchy/status
    router.get('/status', (_req, res) => res.json({ success: true, status: net.status() }));

    // GET /api/hierarchy/tree — الشجرة الكاملة
    router.get('/tree', (req, res) => {
        const tree = net.getTree(req.query.nodeId || null);
        res.json({ success: true, tree });
    });

    // GET /api/hierarchy/tree/:nodeId — شجرة فرعية
    router.get('/tree/:nodeId', (req, res) => {
        const maxDepth = Number(req.query.maxDepth) || 3;
        const sub = net.getSubtree(req.params.nodeId, maxDepth);
        if (!sub) return res.status(404).json({ success: false, error: 'العقدة غير موجودة' });
        res.json({ success: true, subtree: sub });
    });

    // GET /api/hierarchy/node/:id — عقدة بعينها
    router.get('/node/:id', (req, res) => {
        const node = net.getNode(req.params.id);
        if (!node) return res.status(404).json({ success: false, error: 'العقدة غير موجودة' });
        res.json({ success: true, node });
    });

    // GET /api/hierarchy/path/:id — مسار من الجذر للعقدة
    router.get('/path/:id', (req, res) => {
        const pathArr = net.getPath(req.params.id);
        res.json({ success: true, path: pathArr, length: pathArr.length });
    });

    // GET /api/hierarchy/synaptic — خريطة الاتصالات
    router.get('/synaptic', (_req, res) => res.json({ success: true, ...net.getSynapticMap() }));

    // GET /api/hierarchy/search?q= — بحث
    router.get('/search', (req, res) => {
        const results = net.search(req.query.q || '');
        res.json({ success: true, results, count: results.length });
    });

    // POST /api/hierarchy/infer — استدلال هرمي
    router.post('/infer', (req, res) => {
        const { inputMap = {}, context = '' } = req.body || {};
        const result = net.infer(inputMap, context);
        res.json({ success: true, result });
    });

    // POST /api/hierarchy/train — تدريب
    router.post('/train', (req, res) => {
        const { inputMap = {}, targetMap = {}, lr = 0.001 } = req.body || {};
        const result = net.train(inputMap, targetMap, lr);
        res.json({ success: true, result });
    });

    // POST /api/hierarchy/node — إضافة عقدة
    router.post('/node', (req, res) => {
        const result = net.addNode(req.body || {});
        res.status(result.success ? 201 : 400).json(result);
    });

    // DELETE /api/hierarchy/node/:id — حذف عقدة
    router.delete('/node/:id', (req, res) => {
        const result = net.removeNode(req.params.id);
        res.status(result.success ? 200 : 400).json(result);
    });

    // GET /api/hierarchy/loss — سجل الخسارة
    router.get('/loss', (req, res) => {
        const limit = Number(req.query.limit) || 50;
        res.json({ success: true, history: net.lossHistory.slice(0, limit), steps: net.trainedSteps });
    });

    return router;
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

const _net = getNetwork();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    HierarchyNeuralNetwork,
    RootNeuralCell,
    getNetwork,
    createRouter,
    DEFAULT_HIERARCHY,
    // دوال مباشرة على النسخة الافتراضية
    infer:      (inputMap, context) => _net.infer(inputMap, context),
    train:      (inputMap, targetMap, lr) => _net.train(inputMap, targetMap, lr),
    addNode:    (config) => _net.addNode(config),
    removeNode: (id) => _net.removeNode(id),
    getNode:    (id) => _net.getNode(id),
    getTree:    (id) => _net.getTree(id),
    getPath:    (id) => _net.getPath(id),
    getSubtree: (id, d) => _net.getSubtree(id, d),
    getSynapticMap: () => _net.getSynapticMap(),
    search:     (q) => _net.search(q),
    status:     () => _net.status(),
};
