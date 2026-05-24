/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA ISLAMIC AI AGENTS ENGINE — محرك الوكلاء الذكيين الإسلاميين
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ" — الذاريات ٥٦
 * "هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا" — هود ٦١
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ" — التوبة ١٠٥
 * "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي" — المائدة ٣
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * 🌟 النظام الشامل: منظومة الوكلاء الذكيين لتحقيق مقاصد الشريعة الإسلامية
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * @ المنهجية:
 *   ✅ القرآن الكريم — كلام الله المنزل
 *   ✅ السنة النبوية الصحيحة — هدي النبي ﷺ
 *   ✅ مقاصد الشريعة — الضروريات الخمس + الحاجيات + التحسينيات
 *   ✅ الفقه الإسلامي — المذاهب الأربعة وما صح من الأدلة
 *   ✅ عمارة الأرض — إصلاح الدنيا بالإسلام
 *   ✅ الذكاء الاصطناعي — أداة للخير وتحقيق المقاصد
 *
 * @ المقاصد الشرعية الضرورية الخمس (ترتيب الأولوية):
 *   ١. حفظ الدين (Religion)
 *   ٢. حفظ النفس (Life)
 *   ٣. حفظ العقل (Intellect)
 *   ٤. حفظ النسل (Lineage)
 *   ٥. حفظ المال (Wealth)
 *
 * @ الأهداف الإسلامية الشاملة:
 *   • العبادة — الغاية من الخلق
 *   • عمارة الأرض — إصلاح الدنيا
 *   • نشر العلم — التعليم والدعوة
 *   • تحقيق العدل — القضاء والحكم
 *   • رعاية الضعفاء — الأيتام والمساكين
 *   • حماية البيئة — الأرض أمانة
 *   • التطوير والابتكار — الأخذ بالأسباب
 *   • بناء الحضارة — الأمة القوية
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════════
// 📚 الوكلاء الرئيسيين بناءً على مقاصد الشريعة الخمس
// ══════════════════════════════════════════════════════════════════════════════

const MAQASID_AGENTS = {
    // ──────────────────────────────────────────────────────────────────────────
    // ١. حفظ الدين (أولى المقاصد)
    // ──────────────────────────────────────────────────────────────────────────
    DEEN_PRESERVATION: {
        id: 'agent-deen-preservation',
        nameAr: 'وكيل حفظ الدين',
        nameEn: 'Religion Preservation Agent',
        maqsad: 'حفظ الدين',
        priority: 1,
        quranic_base: [
            'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ — الحجر ٩',
            'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ — المائدة ٣',
            'وَمَن يَبْتَغِ غَيْرَ الْإِسْلَامِ دِينًا فَلَن يُقْبَلَ مِنْهُ — آل عمران ٨٥'
        ],
        hadith_base: [
            'بني الإسلام على خمس — متفق عليه',
            'الدين النصيحة — صحيح مسلم',
            'من رأى منكم منكراً فليغيره — صحيح مسلم'
        ],
        capabilities: [
            'تعليم العقيدة الصحيحة',
            'تصحيح المفاهيم العقدية',
            'مكافحة البدع والخرافات',
            'نشر السنة النبوية الصحيحة',
            'الأمر بالمعروف والنهي عن المنكر',
            'حماية الدين من التحريف',
            'تعليم الفقه والأحكام',
            'الدعوة إلى الإسلام'
        ],
        subAgents: [
            {
                id: 'creed-teacher',
                nameAr: 'معلم العقيدة',
                focus: 'تعليم التوحيد وأصول الإيمان',
                sources: ['القرآن', 'السنة', 'كتب العقيدة المعتمدة']
            },
            {
                id: 'fiqh-advisor',
                nameAr: 'مستشار الفقه',
                focus: 'الإفتاء والأحكام الشرعية',
                sources: ['المذاهب الأربعة', 'فتاوى العلماء المعتبرين']
            },
            {
                id: 'bidah-detector',
                nameAr: 'كاشف البدع',
                focus: 'تحذير من البدع والانحرافات',
                sources: ['السنة', 'كتب البدع والمحدثات']
            },
            {
                id: 'dawah-specialist',
                nameAr: 'متخصص الدعوة',
                focus: 'الدعوة إلى الله بالحكمة',
                sources: ['أساليب الدعوة النبوية', 'فقه الدعوة']
            }
        ]
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ٢. حفظ النفس (الحياة)
    // ──────────────────────────────────────────────────────────────────────────
    LIFE_PRESERVATION: {
        id: 'agent-life-preservation',
        nameAr: 'وكيل حفظ النفس',
        nameEn: 'Life Preservation Agent',
        maqsad: 'حفظ النفس',
        priority: 2,
        quranic_base: [
            'وَلَا تَقْتُلُوا النَّفْسَ الَّتِي حَرَّمَ اللَّهُ إِلَّا بِالْحَقِّ — الإسراء ٣٣',
            'مَن قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍ فِي الْأَرْضِ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا — المائدة ٣٢',
            'وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ — البقرة ١٩٥'
        ],
        hadith_base: [
            'لا ضرر ولا ضرار — صحيح ابن ماجه',
            'من قتل نفسه بشيء عُذب به في النار — متفق عليه',
            'المسلم من سلم المسلمون من لسانه ويده — متفق عليه'
        ],
        capabilities: [
            'الوقاية من الأمراض',
            'الإسعافات الأولية',
            'التغذية الصحية',
            'الصحة النفسية',
            'السلامة والأمان',
            'مكافحة الانتحار',
            'حماية الضعفاء',
            'الطب الوقائي'
        ],
        subAgents: [
            {
                id: 'health-advisor',
                nameAr: 'مستشار الصحة',
                focus: 'الصحة البدنية والوقاية',
                sources: ['الطب النبوي', 'الطب الحديث المباح']
            },
            {
                id: 'mental-health-supporter',
                nameAr: 'داعم الصحة النفسية',
                focus: 'الدعم النفسي والروحاني',
                sources: ['القرآن', 'أذكار وأدعية', 'علم النفس']
            },
            {
                id: 'safety-guardian',
                nameAr: 'حارس السلامة',
                focus: 'الحماية من المخاطر',
                sources: ['أحكام الأمان', 'معايير السلامة']
            },
            {
                id: 'nutrition-expert',
                nameAr: 'خبير التغذية',
                focus: 'الطعام الحلال والصحي',
                sources: ['أحكام الأطعمة', 'علم التغذية']
            }
        ]
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ٣. حفظ العقل (العلم والتعليم)
    // ──────────────────────────────────────────────────────────────────────────
    INTELLECT_PRESERVATION: {
        id: 'agent-intellect-preservation',
        nameAr: 'وكيل حفظ العقل',
        nameEn: 'Intellect Preservation Agent',
        maqsad: 'حفظ العقل',
        priority: 3,
        quranic_base: [
            'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ — العلق ١',
            'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ — الزمر ٩',
            'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ — المجادلة ١١',
            'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ — فاطر ٢٨'
        ],
        hadith_base: [
            'طلب العلم فريضة على كل مسلم — صحيح ابن ماجه',
            'من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة — صحيح مسلم',
            'العلماء ورثة الأنبياء — صحيح أبي داود',
            'خيركم من تعلم القرآن وعلمه — صحيح البخاري'
        ],
        capabilities: [
            'التعليم الشامل',
            'نشر العلوم النافعة',
            'تطوير المهارات',
            'البحث العلمي',
            'الابتكار والإبداع',
            'محو الأمية',
            'التفكير النقدي',
            'حماية العقل من المسكرات'
        ],
        subAgents: [
            {
                id: 'islamic-scholar',
                nameAr: 'العالم الشرعي',
                focus: 'تعليم العلوم الشرعية',
                sources: ['القرآن', 'السنة', 'الفقه', 'أصول الفقه', 'العقيدة']
            },
            {
                id: 'stem-educator',
                nameAr: 'معلم العلوم والتقنية',
                focus: 'العلوم والرياضيات والهندسة',
                sources: ['المناهج العلمية', 'الاكتشافات الحديثة']
            },
            {
                id: 'language-tutor',
                nameAr: 'معلم اللغات',
                focus: 'العربية ولغات العالم',
                sources: ['قواعد اللغة', 'الأدب', 'البلاغة']
            },
            {
                id: 'skills-developer',
                nameAr: 'مطور المهارات',
                focus: 'المهارات الحياتية والعملية',
                sources: ['علوم الإدارة', 'التطوير الذاتي']
            },
            {
                id: 'research-assistant',
                nameAr: 'مساعد البحث العلمي',
                focus: 'دعم البحث والابتكار',
                sources: ['منهجيات البحث', 'قواعد البيانات العلمية']
            }
        ]
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ٤. حفظ النسل (الأسرة والأخلاق)
    // ──────────────────────────────────────────────────────────────────────────
    LINEAGE_PRESERVATION: {
        id: 'agent-lineage-preservation',
        nameAr: 'وكيل حفظ النسل',
        nameEn: 'Lineage Preservation Agent',
        maqsad: 'حفظ النسل',
        priority: 4,
        quranic_base: [
            'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا — الروم ٢١',
            'وَلَا تَقْرَبُوا الزِّنَا إِنَّهُ كَانَ فَاحِشَةً — الإسراء ٣٢',
            'فَانكِحُوا مَا طَابَ لَكُم مِّنَ النِّسَاءِ — النساء ٣'
        ],
        hadith_base: [
            'تناكحوا تناسلوا فإني مكاثر بكم الأمم — صحيح ابن حبان',
            'يا معشر الشباب من استطاع منكم الباءة فليتزوج — متفق عليه',
            'خيركم خيركم لأهله — صحيح الترمذي'
        ],
        capabilities: [
            'الإرشاد الأسري',
            'التربية الإسلامية',
            'حل النزاعات الزوجية',
            'حماية الأطفال',
            'المحافظة على العفة',
            'تعليم الآداب والأخلاق',
            'رعاية الأيتام',
            'بناء الأسرة المسلمة'
        ],
        subAgents: [
            {
                id: 'marriage-counselor',
                nameAr: 'مستشار الزواج',
                focus: 'إرشاد الأزواج وحل المشاكل',
                sources: ['فقه الأسرة', 'علم النفس الأسري']
            },
            {
                id: 'parenting-guide',
                nameAr: 'مرشد التربية',
                focus: 'تربية الأبناء تربية إسلامية',
                sources: ['أساليب التربية النبوية', 'علم نفس الطفل']
            },
            {
                id: 'modesty-protector',
                nameAr: 'حامي العفاف',
                focus: 'المحافظة على الحياء والعفة',
                sources: ['أحكام الحجاب', 'آداب العلاقات']
            },
            {
                id: 'child-protector',
                nameAr: 'حامي الطفولة',
                focus: 'حماية الأطفال من الأذى',
                sources: ['حقوق الطفل في الإسلام', 'قوانين حماية الطفل']
            }
        ]
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ٥. حفظ المال (الاقتصاد والتجارة)
    // ──────────────────────────────────────────────────────────────────────────
    WEALTH_PRESERVATION: {
        id: 'agent-wealth-preservation',
        nameAr: 'وكيل حفظ المال',
        nameEn: 'Wealth Preservation Agent',
        maqsad: 'حفظ المال',
        priority: 5,
        quranic_base: [
            'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ — النساء ٢٩',
            'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة ٢٧٥',
            'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ — الأنعام ١٥٢',
            'وَآتُوا الزَّكَاةَ — البقرة ٤٣'
        ],
        hadith_base: [
            'البيعان بالخيار ما لم يتفرقا — متفق عليه',
            'لا يبيع الرجل على بيع أخيه — متفق عليه',
            'التاجر الصدوق مع النبيين والصديقين — صحيح الترمذي',
            'من غشنا فليس منا — صحيح مسلم'
        ],
        capabilities: [
            'التجارة الإسلامية',
            'المعاملات المالية الحلال',
            'إدارة الزكاة',
            'مكافحة الربا',
            'التمويل الإسلامي',
            'حماية الملكية',
            'العدالة الاقتصادية',
            'توزيع الثروة'
        ],
        subAgents: [
            {
                id: 'halal-trade-advisor',
                nameAr: 'مستشار التجارة الحلال',
                focus: 'ضمان حلال المعاملات',
                sources: ['فقه المعاملات', 'منظومة شيخة']
            },
            {
                id: 'zakat-calculator',
                nameAr: 'محاسب الزكاة',
                focus: 'حساب وتوزيع الزكاة',
                sources: ['أحكام الزكاة', 'مصارف الزكاة']
            },
            {
                id: 'riba-detector',
                nameAr: 'كاشف الربا',
                focus: 'الكشف عن المعاملات الربوية',
                sources: ['أنواع الربا', 'الحيل الربوية']
            },
            {
                id: 'islamic-finance-expert',
                nameAr: 'خبير التمويل الإسلامي',
                focus: 'الصكوك والمرابحة والمشاركة',
                sources: ['المعايير الشرعية', 'الصيرفة الإسلامية']
            },
            {
                id: 'market-monitor',
                nameAr: 'مراقب السوق',
                focus: 'منع الغش والاحتكار والنجش',
                sources: ['أحكام السوق', 'حسبة السوق']
            }
        ]
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// 🌍 الوكلاء الإضافيين للأهداف الإسلامية الشاملة
// ══════════════════════════════════════════════════════════════════════════════

const GOAL_BASED_AGENTS = {
    // عمارة الأرض — إصلاح الدنيا
    EARTH_DEVELOPMENT: {
        id: 'agent-earth-development',
        nameAr: 'وكيل عمارة الأرض',
        nameEn: 'Earth Development Agent',
        goal: 'عمارة الأرض وإصلاحها',
        quranic_base: ['هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا — هود ٦١'],
        subAgents: ['مهندس البنية التحتية', 'مخطط المدن', 'خبير الزراعة', 'حامي البيئة']
    },

    // العدالة والقضاء
    JUSTICE_ENFORCEMENT: {
        id: 'agent-justice-enforcement',
        nameAr: 'وكيل العدالة والقضاء',
        nameEn: 'Justice Enforcement Agent',
        goal: 'تحقيق العدل ورفع الظلم',
        quranic_base: ['إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ — النحل ٩٠'],
        subAgents: ['قاضي شرعي', 'محقق', 'محامي', 'وسيط نزاعات']
    },

    // رعاية الضعفاء
    VULNERABLE_CARE: {
        id: 'agent-vulnerable-care',
        nameAr: 'وكيل رعاية الضعفاء',
        nameEn: 'Vulnerable Care Agent',
        goal: 'رعاية الأيتام والمساكين والمحتاجين',
        quranic_base: [
            'وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا — الإنسان ٨'
        ],
        subAgents: ['راعي الأيتام', 'مساعد الفقراء', 'متطوع الإغاثة', 'منسق الصدقات']
    },

    // الابتكار والتطوير
    INNOVATION: {
        id: 'agent-innovation',
        nameAr: 'وكيل الابتكار والتطوير',
        nameEn: 'Innovation Agent',
        goal: 'الابتكار والتطوير التقني',
        quranic_base: ['وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ — الأنفال ٦٠'],
        subAgents: ['مبتكر تقني', 'مطور برمجيات', 'باحث علمي', 'مهندس']
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// 🧠 محرك الوكلاء الإسلاميين الذكي
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaIslamicAgentsEngine {
    constructor(shariaEngine, lmmEngine) {
        this.name = 'Sheikha Islamic AI Agents Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';

        // الارتباط بمحرك الشريعة ومحرك LMM
        this.shariaEngine = shariaEngine;
        this.lmmEngine = lmmEngine;

        // تحميل الوكلاء
        this.maqasidAgents = MAQASID_AGENTS;
        this.goalAgents = GOAL_BASED_AGENTS;
        this.activeAgents = new Map();
        this.agentStats = {
            totalGenerated: 0,
            totalActive: 0,
            totalCompleted: 0,
            byMaqsad: {}
        };

        // مسار حفظ البيانات
        this.dataPath = path.join(__dirname, '..', 'data', 'islamic-agents');

        this.activatedAt = new Date().toISOString();
        console.log(`✅ ${this.name} v${this.version} — تم التفعيل بنجاح`);
        console.log(`☪️  بسم الله الرحمن الرحيم — ${this.activatedAt}`);

        this._initializeStorage();
    }

    async _initializeStorage() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            console.log(`✅ مسار تخزين الوكلاء: ${this.dataPath}`);
        } catch (error) {
            console.error('❌ خطأ في إنشاء مسار التخزين:', error.message);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // توليد وكيل جديد بناءً على مقصد شرعي
    // ══════════════════════════════════════════════════════════════════════════
    async generateMaqsadAgent(maqsadKey, customization = {}) {
        const maqsadTemplate = this.maqasidAgents[maqsadKey];
        if (!maqsadTemplate) {
            throw new Error(`مقصد غير موجود: ${maqsadKey}`);
        }

        const agentId = `${maqsadTemplate.id}-${Date.now()}`;
        const agent = {
            id: agentId,
            type: 'maqsad-agent',
            template: maqsadKey,
            nameAr: customization.nameAr || maqsadTemplate.nameAr,
            nameEn: customization.nameEn || maqsadTemplate.nameEn,
            maqsad: maqsadTemplate.maqsad,
            priority: maqsadTemplate.priority,
            quranicBase: maqsadTemplate.quranic_base,
            hadithBase: maqsadTemplate.hadith_base,
            capabilities: maqsadTemplate.capabilities,
            subAgents: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            tasksCompleted: 0,
            totalTasks: 0
        };

        // توليد الوكلاء الفرعية
        for (const subTemplate of maqsadTemplate.subAgents) {
            const subAgent = await this._generateSubAgent(agent.id, subTemplate);
            agent.subAgents.push(subAgent);
        }

        this.activeAgents.set(agentId, agent);
        this.agentStats.totalGenerated++;
        this.agentStats.totalActive++;

        // حفظ الوكيل
        await this._saveAgent(agent);

        console.log(`✅ تم توليد وكيل ${agent.nameAr} (${agent.maqsad})`);
        console.log(`   - الوكلاء الفرعية: ${agent.subAgents.length}`);

        return agent;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // توليد وكيل فرعي متخصص
    // ══════════════════════════════════════════════════════════════════════════
    async _generateSubAgent(parentId, template) {
        const subAgentId = `${parentId}-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        return {
            id: subAgentId,
            parentId: parentId,
            nameAr: template.nameAr,
            focus: template.focus,
            sources: template.sources,
            status: 'active',
            createdAt: new Date().toISOString(),
            tasksCompleted: 0
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // توليد وكيل مخصص بناءً على هدف محدد
    // ══════════════════════════════════════════════════════════════════════════
    async generateCustomAgent(config) {
        const agentId = `custom-agent-${Date.now()}`;
        const agent = {
            id: agentId,
            type: 'custom-agent',
            nameAr: config.nameAr,
            nameEn: config.nameEn || config.nameAr,
            goal: config.goal,
            islamicBasis: config.islamicBasis || [],
            capabilities: config.capabilities || [],
            subAgents: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            tasksCompleted: 0,
            totalTasks: 0
        };

        this.activeAgents.set(agentId, agent);
        this.agentStats.totalGenerated++;
        this.agentStats.totalActive++;

        await this._saveAgent(agent);

        console.log(`✅ تم توليد وكيل مخصص: ${agent.nameAr}`);

        return agent;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // تنفيذ مهمة من خلال وكيل
    // ══════════════════════════════════════════════════════════════════════════
    async executeTask(agentId, task) {
        const agent = this.activeAgents.get(agentId);
        if (!agent) {
            throw new Error(`الوكيل غير موجود: ${agentId}`);
        }

        console.log(`⚙️  ${agent.nameAr} يعمل على: ${task.description}`);

        const result = {
            agentId: agent.id,
            agentName: agent.nameAr,
            task: task,
            status: 'processing',
            startedAt: new Date().toISOString()
        };

        try {
            // استخدام LMM إذا كان متاحاً
            if (this.lmmEngine) {
                const prompt = this._buildIslamicPrompt(agent, task);
                const lmmResponse = await this.lmmEngine.generateText(prompt, {
                    context: 'islamic-agent-task'
                });

                result.output = lmmResponse;
            } else {
                result.output = `الوكيل ${agent.nameAr} استلم المهمة: ${task.description}`;
            }

            result.status = 'completed';
            result.completedAt = new Date().toISOString();

            agent.tasksCompleted++;
            agent.totalTasks++;

            await this._saveAgent(agent);

            console.log(`✅ ${agent.nameAr} أنهى المهمة بنجاح`);
        } catch (error) {
            result.status = 'failed';
            result.error = error.message;
            result.failedAt = new Date().toISOString();

            console.error(`❌ ${agent.nameAr} فشل في المهمة: ${error.message}`);
        }

        return result;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // بناء prompt إسلامي للوكيل
    // ══════════════════════════════════════════════════════════════════════════
    _buildIslamicPrompt(agent, task) {
        let prompt = `بسم الله الرحمن الرحيم\n\n`;
        prompt += `أنت ${agent.nameAr} — وكيل ذكي متخصص في ${agent.maqsad || agent.goal}\n\n`;

        if (agent.quranicBase && agent.quranicBase.length > 0) {
            prompt += `📖 الأساس القرآني:\n`;
            agent.quranicBase.forEach(ayah => {
                prompt += `   • ${ayah}\n`;
            });
            prompt += `\n`;
        }

        if (agent.hadithBase && agent.hadithBase.length > 0) {
            prompt += `🕋 الأساس من السنة:\n`;
            agent.hadithBase.forEach(hadith => {
                prompt += `   • ${hadith}\n`;
            });
            prompt += `\n`;
        }

        prompt += `📋 المهمة المطلوبة:\n${task.description}\n\n`;

        if (task.context) {
            prompt += `📌 السياق:\n${task.context}\n\n`;
        }

        prompt += `⚠️ المبادئ الشرعية الواجب التقيد بها:\n`;
        prompt += `   • الالتزام بالقرآن والسنة الصحيحة\n`;
        prompt += `   • تحقيق مقاصد الشريعة\n`;
        prompt += `   • تجنب المحرمات والشبهات\n`;
        prompt += `   • النصح والإرشاد بالحكمة والموعظة الحسنة\n`;
        prompt += `   • الصدق والأمانة في القول والعمل\n\n`;

        prompt += `المطلوب: قدم إجابة شاملة ومفيدة بناءً على المبادئ الإسلامية.\n`;

        return prompt;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // تفعيل كل وكلاء المقاصد الخمس
    // ══════════════════════════════════════════════════════════════════════════
    async activateAllMaqasidAgents() {
        console.log('\n🚀 تفعيل كل وكلاء مقاصد الشريعة الخمس...\n');

        const agents = [];
        for (const maqsadKey of Object.keys(this.maqasidAgents)) {
            const agent = await this.generateMaqsadAgent(maqsadKey);
            agents.push(agent);
        }

        console.log(`\n✅ تم تفعيل ${agents.length} وكلاء رئيسيين للمقاصد الشرعية`);
        console.log(
            `✅ إجمالي الوكلاء الفرعية: ${agents.reduce((sum, a) => sum + a.subAgents.length, 0)}`
        );

        return agents;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // الحصول على جميع الوكلاء النشطين
    // ══════════════════════════════════════════════════════════════════════════
    getAllActiveAgents() {
        return Array.from(this.activeAgents.values());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // الحصول على وكيل محدد
    // ══════════════════════════════════════════════════════════════════════════
    getAgent(agentId) {
        return this.activeAgents.get(agentId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // إحصائيات النظام
    // ══════════════════════════════════════════════════════════════════════════
    getStats() {
        return {
            version: this.version,
            activatedAt: this.activatedAt,
            totalAgents: this.activeAgents.size,
            stats: this.agentStats,
            maqasidAgentsAvailable: Object.keys(this.maqasidAgents).length,
            goalAgentsAvailable: Object.keys(this.goalAgents).length
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // حفظ وكيل إلى الملف
    // ══════════════════════════════════════════════════════════════════════════
    async _saveAgent(agent) {
        try {
            const filePath = path.join(this.dataPath, `${agent.id}.json`);
            await fs.writeFile(filePath, JSON.stringify(agent, null, 2), 'utf8');
        } catch (error) {
            console.error(`❌ فشل حفظ الوكيل ${agent.id}:`, error.message);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // تحميل جميع الوكلاء المحفوظة
    // ══════════════════════════════════════════════════════════════════════════
    async loadSavedAgents() {
        try {
            const files = await fs.readdir(this.dataPath);
            const jsonFiles = files.filter(f => f.endsWith('.json'));

            for (const file of jsonFiles) {
                const filePath = path.join(this.dataPath, file);
                const content = await fs.readFile(filePath, 'utf8');
                const agent = JSON.parse(content);
                this.activeAgents.set(agent.id, agent);
            }

            console.log(`✅ تم تحميل ${jsonFiles.length} وكيل محفوظ`);
        } catch (error) {
            console.error('❌ فشل تحميل الوكلاء المحفوظة:', error.message);
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// تصدير
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
    SheikhaIslamicAgentsEngine,
    MAQASID_AGENTS,
    GOAL_BASED_AGENTS
};
