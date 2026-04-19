// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌌 شبكة شيخة العصبية الكونية الجامعة — لكل شيء                          ║
 * ║  SHEIKHA UNIVERSAL ENTITY NEURAL ENGINE (UENE)                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ثُمَّ عَرَضَهُمْ عَلَى الْمَلَائِكَةِ"
 *   — البقرة ٣١  (تعليم الأسماء = رقمنة كل شيء بمسمياته)
 *
 * "أَلَمْ تَرَ أَنَّ اللَّهَ يَسْجُدُ لَهُ مَن فِي السَّمَاوَاتِ وَمَن فِي الْأَرْضِ
 *  وَالشَّمْسُ وَالْقَمَرُ وَالنُّجُومُ وَالْجِبَالُ وَالشَّجَرُ وَالدَّوَابُّ"
 *   — الحج ١٨  (كل شيء موحَّد لله)
 *
 * "وَإِن مِّن شَيْءٍ إِلَّا يُسَبِّحُ بِحَمْدِهِ وَلَٰكِن لَّا تَفْقَهُونَ تَسْبِيحَهُمْ"
 *   — الإسراء ٤٤  (كل شيء يُسبِّح ← الغاية الكبرى)
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * الرؤية: رقمنة وتوصيف وربط كل شيء موجود بالكتاب والسنة وتوحيده لله تعالى
 *
 * البنية العصبية (4 طبقات مخفية + توحيد):
 *   طبقة الإدخال     (EntityInput)   — 16 مؤشر لأي كيان في الكون
 *   طبقة الأجناس     (GenusLayer)    — 12 خلية: أجناس الوجود الاثنا عشر
 *   طبقة الأنواع     (TypeLayer)     — 32 خلية: أنواع وأصناف كل جنس
 *   طبقة المقاصد    (MaqasidLayer)  — 5  خلايا: المقاصد الشرعية الخمس
 *   طبقة التوحيد    (TawheedLayer)  — 1  خلية: القرار الموحَّد العليا
 *
 * الأجناس الاثنا عشر (أجناس الوجود):
 *   1.  المنتجات والسلع          (Products & Goods)
 *   2.  المصانع والإنتاج         (Factories & Production)
 *   3.  الكائنات الحية           (Living Organisms)
 *   4.  المواد والعناصر          (Materials & Elements)
 *   5.  الخدمات                  (Services)
 *   6.  المعارف والعلوم          (Knowledge & Sciences)
 *   7.  الوسائل والأدوات         (Means & Tools)
 *   8.  الشبكات والعلاقات        (Networks & Relations)
 *   9.  الغايات والمقاصد         (Goals & Purposes)
 *   10. الأماكن والبيئات         (Places & Environments)
 *   11. الأنظمة والمؤسسات        (Systems & Institutions)
 *   12. الزمن والأحداث           (Time & Events)
 *
 * نظام الترقيم: كل كيان يحمل رقماً جامعاً بالصيغة:
 *   {جنس}-{نوع}-{صنف}-{رقم تسلسلي}
 *   مثال: PRD-FOOD-GRAIN-00001 | FAC-METAL-SMELT-00001
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX — عمليات المصفوفات (أساس الشبكة العصبية)
// ══════════════════════════════════════════════════════════════════════════════

class Matrix {
    constructor(rows, cols, data) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || new Float64Array(rows * cols);
    }

    static zeros(r, c) { return new Matrix(r, c); }

    static fromArray(arr) {
        const m = new Matrix(arr.length, 1);
        for (let i = 0; i < arr.length; i++) m.data[i] = arr[i];
        return m;
    }

    static xavier(r, c) {
        const scale = Math.sqrt(2.0 / (r + c));
        const m = new Matrix(r, c);
        for (let i = 0; i < m.data.length; i++) {
            m.data[i] = (Math.random() * 2 - 1) * scale;
        }
        return m;
    }

    get(r, c) { return this.data[r * this.cols + c]; }
    set(r, c, v) { this.data[r * this.cols + c] = v; }

    static multiply(a, b) {
        if (a.cols !== b.rows) {
            throw new Error(`أبعاد غير متوافقة: ${a.rows}×${a.cols} × ${b.rows}×${b.cols}`);
        }
        const out = new Matrix(a.rows, b.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let k = 0; k < a.cols; k++) {
                const aik = a.data[i * a.cols + k];
                if (aik === 0) continue;
                for (let j = 0; j < b.cols; j++) {
                    out.data[i * b.cols + j] += aik * b.data[k * b.cols + j];
                }
            }
        }
        return out;
    }

    static add(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            throw new Error('أبعاد غير متطابقة للجمع');
        }
        const out = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] + b.data[i];
        return out;
    }

    map(fn) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) out.data[i] = fn(this.data[i]);
        return out;
    }

    toArray() { return Array.from(this.data); }

    toJSON() {
        return { rows: this.rows, cols: this.cols, data: Array.from(this.data) };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. دوال التفعيل
// ══════════════════════════════════════════════════════════════════════════════

const SIGMOID_CLAMP_MIN = -500;
const SIGMOID_CLAMP_MAX =  500;

const Activations = {
    sigmoid:  x => 1 / (1 + Math.exp(-Math.max(SIGMOID_CLAMP_MIN, Math.min(SIGMOID_CLAMP_MAX, x)))),
    relu:     x => Math.max(0, x),
    tanh:     x => Math.tanh(x),
    softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - max));
        const sum  = exps.reduce((a, b) => a + b, 0);
        return exps.map(v => v / (sum || 1e-9));
    },
    linear:   x => x,
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. طبقة كثيفة (DenseLayer)
// ══════════════════════════════════════════════════════════════════════════════

class DenseLayer {
    constructor(inputSize, outputSize, activation = 'sigmoid') {
        this.inputSize  = inputSize;
        this.outputSize = outputSize;
        this.activation = activation;
        this.weights    = Matrix.xavier(outputSize, inputSize);
        this.biases     = Matrix.zeros(outputSize, 1);
    }

    forward(input) {
        const z = Matrix.add(Matrix.multiply(this.weights, input), this.biases);
        if (this.activation === 'softmax') {
            return Matrix.fromArray(Activations.softmax(z.toArray()));
        }
        const fn = Activations[this.activation] || Activations.sigmoid;
        return z.map(fn);
    }

    toJSON() {
        return {
            inputSize:  this.inputSize,
            outputSize: this.outputSize,
            activation: this.activation,
            weights:    this.weights.toJSON(),
            biases:     this.biases.toJSON(),
        };
    }

    static fromJSON(obj) {
        const layer = new DenseLayer(obj.inputSize, obj.outputSize, obj.activation);
        layer.weights = new Matrix(obj.weights.rows, obj.weights.cols, new Float64Array(obj.weights.data));
        layer.biases  = new Matrix(obj.biases.rows,  obj.biases.cols,  new Float64Array(obj.biases.data));
        return layer;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. الأجناس الكونية الاثنا عشر — TWELVE UNIVERSAL GENERA
// ══════════════════════════════════════════════════════════════════════════════

const UNIVERSAL_GENERA = [

    // ── الجنس 1: المنتجات والسلع ────────────────────────────────────────────
    {
        id:       'PRD',
        nameAr:   'المنتجات والسلع',
        nameEn:   'Products & Goods',
        icon:     '📦',
        maqsad:   'MAL',
        quranRef: { surah: 'البقرة', ayah: 168, text: 'يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا', context: 'إباحة الطيبات وحل الانتفاع' },
        asmaRef:  'الرزاق — الله هو الذي يرزق بكل سلعة طيبة',
        types: [
            { id: 'FOOD',  nameAr: 'الغذاء والأغذية',       icon: '🍞', categories: ['حبوب', 'خضار', 'فاكهة', 'لحوم', 'أسماك', 'ألبان', 'زيوت', 'توابل', 'مشروبات'] },
            { id: 'TEXT',  nameAr: 'النسيج والملبوسات',      icon: '👕', categories: ['قطن', 'صوف', 'حرير', 'كتان', 'اصطناعي', 'ملابس جاهزة', 'أقمشة'] },
            { id: 'BLDG',  nameAr: 'مواد البناء',            icon: '🧱', categories: ['إسمنت', 'حديد', 'خشب', 'رخام', 'زجاج', 'دهانات', 'عزل'] },
            { id: 'ELEC',  nameAr: 'الإلكترونيات والكهرباء', icon: '⚡', categories: ['هواتف', 'حواسيب', 'أجهزة منزلية', 'مكونات', 'كابلات', 'بطاريات'] },
            { id: 'CHEM',  nameAr: 'الكيماويات',             icon: '🧪', categories: ['بتروكيماويات', 'أسمدة', 'مبيدات', 'صناعية', 'صيدلانية', 'مطاط', 'بلاستيك'] },
            { id: 'MACH',  nameAr: 'الآلات والمعدات',        icon: '⚙️',  categories: ['معدات صناعية', 'زراعية', 'بناء', 'نقل', 'طبية', 'مكتبية'] },
            { id: 'PHMA',  nameAr: 'الأدوية والمستحضرات',    icon: '💊', categories: ['دواء', 'مكمل غذائي', 'مستحضرات تجميل', 'طبي'] },
            { id: 'ENER',  nameAr: 'منتجات الطاقة',          icon: '🔋', categories: ['نفط', 'غاز', 'فحم', 'بنزين', 'كهرباء', 'طاقة شمسية', 'هيدروجين'] },
            { id: 'AGRI',  nameAr: 'المنتجات الزراعية',      icon: '🌾', categories: ['محاصيل', 'بذور', 'ثمار', 'خضروات', 'أعلاف', 'مبيدات', 'أسمدة طبيعية'] },
            { id: 'META',  nameAr: 'المعادن المُصنَّعة',     icon: '🔩', categories: ['حديد فولاذ', 'نحاس', 'ألمنيوم', 'ذهب', 'فضة', 'تيتانيوم', 'نادرة'] },
        ],
        digitizationPrefix: 'PRD',
    },

    // ── الجنس 2: المصانع والإنتاج ───────────────────────────────────────────
    {
        id:       'FAC',
        nameAr:   'المصانع والإنتاج',
        nameEn:   'Factories & Production',
        icon:     '🏭',
        maqsad:   'ARD',
        quranRef: { surah: 'سبأ', ayah: 10, text: 'وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ وَأَلَنَّا لَهُ الْحَدِيدَ', context: 'التصنيع وتسخير المواد للإنتاج' },
        asmaRef:  'الخالق — الله خلق وأودع في الإنسان القدرة على التصنيع',
        types: [
            { id: 'SMLT',  nameAr: 'مصاهر ومصافٍ',          icon: '🔥', categories: ['مصهرة معادن', 'مصفاة نفط', 'مصهرة زجاج', 'مصهرة ألمنيوم'] },
            { id: 'FOOD',  nameAr: 'مصانع الغذاء',           icon: '🏭', categories: ['تعليب', 'طحن', 'تجميد', 'تعبئة وتغليف', 'مسالخ'] },
            { id: 'TEXT',  nameAr: 'مصانع النسيج',           icon: '🧵', categories: ['غزل', 'نسيج', 'تصبيغ', 'خياطة'] },
            { id: 'CHEM',  nameAr: 'مصانع الكيماويات',       icon: '⚗️',  categories: ['بتروكيماويات', 'أسمدة', 'مبيدات', 'مستحضرات'] },
            { id: 'MACH',  nameAr: 'مصانع الآلات',           icon: '⚙️',  categories: ['هندسية ثقيلة', 'دقيقة', 'إلكترونية', 'سيارات'] },
            { id: 'BLDG',  nameAr: 'مصانع مواد البناء',      icon: '🏗️', categories: ['إسمنت', 'طوب', 'خزف', 'زجاج', 'ألمنيوم'] },
            { id: 'ENER',  nameAr: 'محطات الطاقة',           icon: '⚡', categories: ['بخارية', 'نووية', 'شمسية', 'رياح', 'مائية', 'غاز'] },
            { id: 'TECH',  nameAr: 'مصانع التقنية',          icon: '💻', categories: ['رقائق', 'شاشات', 'بطاريات', 'أدوات إلكترونية'] },
            { id: 'RCYC',  nameAr: 'مصانع إعادة التدوير',    icon: '♻️', categories: ['معادن سكراب', 'ورق', 'بلاستيك', 'زجاج', 'إلكتروني'] },
            { id: 'FARM',  nameAr: 'المزارع والإنتاج الزراعي',icon: '🌱', categories: ['مزرعة حيوانية', 'نباتية', 'سمكية', 'عضوية', 'مائية'] },
        ],
        digitizationPrefix: 'FAC',
    },

    // ── الجنس 3: الكائنات الحية ─────────────────────────────────────────────
    {
        id:       'ORG',
        nameAr:   'الكائنات الحية',
        nameEn:   'Living Organisms',
        icon:     '🌿',
        maqsad:   'NAFS',
        quranRef: { surah: 'الأنبياء', ayah: 30, text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ', context: 'أصل الحياة من الماء — أساس كل كائن حي' },
        asmaRef:  'المحيي — الله مُحيي كل كائن',
        types: [
            { id: 'HUMN',  nameAr: 'الإنسان',                icon: '👤', categories: ['ذكر', 'أنثى', 'طفل', 'شاب', 'كهل', 'شيخ'] },
            { id: 'MMAL',  nameAr: 'الثدييات',               icon: '🐄', categories: ['ماشية', 'خيل', 'إبل', 'غنم', 'بري', 'بحري'] },
            { id: 'BIRD',  nameAr: 'الطيور',                 icon: '🦅', categories: ['دواجن', 'صيد', 'مهاجرة', 'مغردة', 'بحرية'] },
            { id: 'FISH',  nameAr: 'الأسماك والأحياء المائية',icon: '🐟', categories: ['أسماك', 'قشريات', 'رخويات', 'طحالب', 'نبات مائي'] },
            { id: 'REPT',  nameAr: 'الزواحف والبرمائيات',    icon: '🦎', categories: ['تماسيح', 'أفاعي', 'سلاحف', 'ضفادع'] },
            { id: 'INSC',  nameAr: 'الحشرات والمفصليات',     icon: '🐝', categories: ['نحل', 'فراش', 'نمل', 'خنافس', 'حريرية'] },
            { id: 'PLNT',  nameAr: 'النباتات',               icon: '🌱', categories: ['أشجار', 'شجيرات', 'أعشاب', 'نخيل', 'قمح', 'بقوليات'] },
            { id: 'FUNG',  nameAr: 'الفطريات والطحالب',      icon: '🍄', categories: ['فطر مأكول', 'خميرة', 'طحالب', 'لشائيات'] },
            { id: 'MCRO',  nameAr: 'الكائنات الدقيقة',       icon: '🦠', categories: ['بكتيريا نافعة', 'فيروسات', 'بروتوزوا', 'أحياء دقيقة بحرية'] },
        ],
        digitizationPrefix: 'ORG',
    },

    // ── الجنس 4: المواد والعناصر ─────────────────────────────────────────────
    {
        id:       'MAT',
        nameAr:   'المواد والعناصر',
        nameEn:   'Materials & Elements',
        icon:     '⚛️',
        maqsad:   'ARD',
        quranRef: { surah: 'الرحمن', ayah: 19, text: 'مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ', context: 'تنوع مواد الكون وتناسقها' },
        asmaRef:  'المصور — الله صوّر كل مادة بصورتها',
        types: [
            { id: 'ELEM',  nameAr: 'العناصر الكيميائية',     icon: '⚛️', categories: ['فلزات', 'لافلزات', 'أشباه فلزات', 'غازات نبيلة', 'مشعة'] },
            { id: 'METL',  nameAr: 'المعادن الخام',           icon: '🪨', categories: ['حديد', 'نحاس', 'ذهب', 'فضة', 'ألمنيوم', 'زنك', 'رصاص', 'نادرة'] },
            { id: 'MNRL',  nameAr: 'المعادن الصناعية',        icon: '💎', categories: ['ماس', 'كوارتز', 'فلسبار', 'كالسيت', 'جيبسوم', 'كاولين'] },
            { id: 'ROCK',  nameAr: 'الصخور والتربة',          icon: '🏔️', categories: ['نارية', 'رسوبية', 'متحولة', 'طمي', 'رمل', 'طين', 'جير'] },
            { id: 'FUEL',  nameAr: 'الوقود الأحفوري',         icon: '🛢️', categories: ['نفط خام', 'غاز طبيعي', 'فحم', 'زيت صخري'] },
            { id: 'WTER',  nameAr: 'الماء',                   icon: '💧', categories: ['عذب', 'مالح', 'جوفي', 'أمطار', 'ثلوج', 'مقطر'] },
            { id: 'AIRR',  nameAr: 'الهواء والغازات',         icon: '💨', categories: ['نيتروجين', 'أكسجين', 'ثاني أكسيد كربون', 'هيليوم', 'أرجون'] },
            { id: 'POLY',  nameAr: 'البوليمرات والبلاستيك',   icon: '🧴', categories: ['طبيعي', 'اصطناعي', 'مطاط', 'راتنج', 'ألياف'] },
            { id: 'COMP',  nameAr: 'المواد المركبة',          icon: '🔬', categories: ['ألياف كربون', 'زجاج مقوى', 'خلائط معدنية', 'خرسانة'] },
            { id: 'BIOL',  nameAr: 'المواد الحيوية',          icon: '🧬', categories: ['بروتين', 'كربوهيدرات', 'دهون', 'أحماض نووية', 'إنزيمات'] },
        ],
        digitizationPrefix: 'MAT',
    },

    // ── الجنس 5: الخدمات ────────────────────────────────────────────────────
    {
        id:       'SRV',
        nameAr:   'الخدمات',
        nameEn:   'Services',
        icon:     '🤝',
        maqsad:   'MAL',
        quranRef: { surah: 'البقرة', ayah: 282, text: 'وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ', context: 'ضبط التعاقد والخدمات' },
        asmaRef:  'المعين — الله يُعين عباده بالخدمات المتبادلة',
        types: [
            { id: 'FINC',  nameAr: 'الخدمات المالية والمصرفية',icon: '🏦', categories: ['مصرفية إسلامية', 'تأمين تكافلي', 'زكاة', 'وقف', 'صرف', 'استثمار'] },
            { id: 'HLTH',  nameAr: 'الصحة والطب',             icon: '🏥', categories: ['مستشفيات', 'عيادات', 'صيدليات', 'تمريض', 'تشخيص', 'جراحة'] },
            { id: 'EDUC',  nameAr: 'التعليم والتدريب',        icon: '📚', categories: ['مدارس', 'جامعات', 'تدريب مهني', 'تعليم ديني', 'رقمي'] },
            { id: 'TRAN',  nameAr: 'النقل والمواصلات',        icon: '🚗', categories: ['بري', 'بحري', 'جوي', 'سكة حديد', 'توصيل', 'شحن'] },
            { id: 'LOGI',  nameAr: 'اللوجستيات والتخزين',     icon: '🏗️', categories: ['مستودعات', 'تخليص جمركي', '3PL', '4PL', 'توزيع'] },
            { id: 'TECH',  nameAr: 'خدمات التقنية',           icon: '💻', categories: ['سحابة', 'تطوير برمجيات', 'أمن معلومات', 'بيانات', 'AI'] },
            { id: 'GOVT',  nameAr: 'الخدمات الحكومية',        icon: '🏛️', categories: ['جوازات', 'ترخيص', 'ضرائب', 'قضاء', 'شرطة', 'بلدية'] },
            { id: 'CONS',  nameAr: 'الاستشارات',              icon: '💼', categories: ['قانونية', 'مالية', 'هندسية', 'إدارية', 'شرعية', 'تقنية'] },
            { id: 'TOUR',  nameAr: 'السياحة والضيافة',        icon: '🏨', categories: ['فنادق', 'سياحة دينية', 'مطاعم', 'ترفيه حلال', 'سفر'] },
            { id: 'MEDN',  nameAr: 'الإعلام والاتصالات',      icon: '📡', categories: ['تلفزيون', 'راديو', 'صحافة', 'رقمي', 'اتصالات'] },
        ],
        digitizationPrefix: 'SRV',
    },

    // ── الجنس 6: المعارف والعلوم ────────────────────────────────────────────
    {
        id:       'KNW',
        nameAr:   'المعارف والعلوم',
        nameEn:   'Knowledge & Sciences',
        icon:     '📖',
        maqsad:   'AQL',
        quranRef: { surah: 'العلق', ayah: 1, text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', context: 'الأمر بالقراءة والعلم — أول ما نزل' },
        asmaRef:  'العليم — الله هو العليم المطلق وكل علم إنساني نزر مما علَّمه',
        types: [
            { id: 'ISLL',  nameAr: 'العلوم الشرعية الإسلامية', icon: '📿', categories: ['قرآن', 'حديث', 'فقه', 'عقيدة', 'تفسير', 'أصول', 'تزكية'] },
            { id: 'NATL',  nameAr: 'العلوم الطبيعية',          icon: '🔭', categories: ['فيزياء', 'كيمياء', 'أحياء', 'فلك', 'جيولوجيا', 'رياضيات'] },
            { id: 'ENGN',  nameAr: 'الهندسة والتقنية',         icon: '🔧', categories: ['مدنية', 'ميكانيكية', 'كيميائية', 'كهربائية', 'حاسوبية', 'معمارية'] },
            { id: 'MDCL',  nameAr: 'الطب والصحة',              icon: '⚕️',  categories: ['طب سريري', 'صيدلة', 'تمريض', 'طب نبوي', 'تغذية'] },
            { id: 'HUMZ',  nameAr: 'العلوم الإنسانية',         icon: '📜', categories: ['تاريخ', 'جغرافيا', 'فلسفة', 'اجتماع', 'نفس', 'لغة'] },
            { id: 'ECON',  nameAr: 'الاقتصاد والإدارة',        icon: '📊', categories: ['اقتصاد إسلامي', 'تجارة', 'إدارة', 'محاسبة', 'تسويق'] },
            { id: 'ARTT',  nameAr: 'الفنون والإبداع',          icon: '🎨', categories: ['خط عربي', 'عمارة إسلامية', 'موسيقى حلال', 'شعر', 'قصة'] },
            { id: 'LANG',  nameAr: 'اللغات',                   icon: '🗣️', categories: ['عربية', 'إنجليزية', 'فارسية', 'أردية', 'ماليزية', 'سواحيلية'] },
        ],
        digitizationPrefix: 'KNW',
    },

    // ── الجنس 7: الوسائل والأدوات ───────────────────────────────────────────
    {
        id:       'MNS',
        nameAr:   'الوسائل والأدوات',
        nameEn:   'Means & Tools',
        icon:     '🔨',
        maqsad:   'ARD',
        quranRef: { surah: 'الحديد', ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', context: 'تسخير الحديد وسائر الأدوات لمنافع الناس' },
        asmaRef:  'القدير — الله أقدر الإنسان على صنع الوسائل وتطويرها',
        types: [
            { id: 'HNDL',  nameAr: 'أدوات يدوية',             icon: '🔧', categories: ['قطع', 'طرق', 'قياس', 'حفر', 'ربط', 'جمع'] },
            { id: 'MCHP',  nameAr: 'آلات ومعدات ثقيلة',       icon: '🏗️', categories: ['رافعات', 'حفارات', 'جرارات', 'مضخات', 'ضواغط'] },
            { id: 'DGTS',  nameAr: 'أدوات رقمية وتقنية',      icon: '💻', categories: ['حاسوب', 'هاتف', 'شبكة', 'روبوت', 'طابعة ثلاثية'] },
            { id: 'TRNS',  nameAr: 'وسائل النقل',             icon: '🚗', categories: ['سيارة', 'شاحنة', 'طائرة', 'سفينة', 'قطار', 'دراجة'] },
            { id: 'COMM',  nameAr: 'وسائل الاتصال',           icon: '📡', categories: ['هاتف', 'إنترنت', 'بريد', 'تلغراف', 'ساتل'] },
            { id: 'AGRM',  nameAr: 'أدوات الزراعة',           icon: '🌾', categories: ['محراث', 'حصادة', 'مروية', 'بذار', 'رشاش'] },
            { id: 'MEDC',  nameAr: 'أدوات طبية',              icon: '🩺', categories: ['جراحية', 'تشخيصية', 'علاجية', 'مخبرية', 'تصوير'] },
            { id: 'WEPN',  nameAr: 'أسلحة وأدوات الدفاع',     icon: '🛡️', categories: ['دفاعية', 'حربية', 'أمنية'] },
            { id: 'ARTS',  nameAr: 'أدوات الفن والثقافة',     icon: '🎭', categories: ['قلم', 'فرشاة', 'آلات موسيقية', 'كاميرا'] },
        ],
        digitizationPrefix: 'MNS',
    },

    // ── الجنس 8: الشبكات والعلاقات ──────────────────────────────────────────
    {
        id:       'NET',
        nameAr:   'الشبكات والعلاقات',
        nameEn:   'Networks & Relations',
        icon:     '🕸️',
        maqsad:   'NASL',
        quranRef: { surah: 'الحجرات', ayah: 13, text: 'إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', context: 'الشبكات الاجتماعية والتعارف والتآزر' },
        asmaRef:  'الجامع — الله جامع الناس بالروابط والعلاقات',
        types: [
            { id: 'SOCL',  nameAr: 'الشبكات الاجتماعية',     icon: '👥', categories: ['أسرة', 'قبيلة', 'مجتمع', 'صداقة', 'زمالة', 'رقمية'] },
            { id: 'BZNZ',  nameAr: 'الشبكات التجارية',        icon: '🤝', categories: ['شراكة', 'سلسلة توريد', 'تحالف', 'امتياز', 'تعاون'] },
            { id: 'DGTL',  nameAr: 'الشبكات الرقمية',         icon: '💻', categories: ['إنترنت', 'LAN', 'WAN', 'IoT', 'بلوكشين', 'P2P'] },
            { id: 'FINC',  nameAr: 'الشبكات المالية',         icon: '💰', categories: ['مصرفية', 'دفع', 'بورصة', 'صكوك', 'مضاربة', 'تمويل جماعي'] },
            { id: 'KNWN',  nameAr: 'شبكات المعرفة',           icon: '🧠', categories: ['أكاديمية', 'أبحاث', 'براءات', 'فتاوى', 'بيانات مفتوحة'] },
            { id: 'POLT',  nameAr: 'الشبكات السياسية والحوكمة',icon: '🏛️', categories: ['حكومات', 'منظمات دولية', 'شورى', 'حلف', 'معاهدة'] },
            { id: 'LOGI',  nameAr: 'الشبكات اللوجستية',       icon: '🚛', categories: ['موانئ', 'مطارات', 'طرق', 'مستودعات', 'سكك حديد'] },
            { id: 'ENRG',  nameAr: 'شبكات الطاقة',            icon: '⚡', categories: ['كهرباء', 'غاز', 'نفط', 'هيدروجين', 'ذكية'] },
            { id: 'BIOL',  nameAr: 'الشبكات البيولوجية',      icon: '🧬', categories: ['غذائية', 'إيكولوجية', 'جينية', 'عصبية', 'مناعية'] },
        ],
        digitizationPrefix: 'NET',
    },

    // ── الجنس 9: الغايات والمقاصد ───────────────────────────────────────────
    {
        id:       'GHL',
        nameAr:   'الغايات والمقاصد',
        nameEn:   'Goals & Purposes',
        icon:     '🎯',
        maqsad:   'DEEN',
        quranRef: { surah: 'الذاريات', ayah: 56, text: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ', context: 'الغاية العظمى من الخلق: العبادة والتوحيد' },
        asmaRef:  'الحكيم — كل مقصد يرتد إلى حكمة الله الحكيم',
        types: [
            { id: 'DEEN',  nameAr: 'حفظ الدين',              icon: '🕌', categories: ['توحيد', 'صلاة', 'زكاة', 'صوم', 'حج', 'جهاد', 'علم شرعي'] },
            { id: 'NAFS',  nameAr: 'حفظ النفس',              icon: '❤️', categories: ['حياة', 'صحة', 'أمان', 'غذاء', 'مأوى', 'كرامة'] },
            { id: 'AQL',   nameAr: 'حفظ العقل',              icon: '🧠', categories: ['علم', 'تفكر', 'تعليم', 'إبداع', 'تجنب مسكر'] },
            { id: 'NASL',  nameAr: 'حفظ النسل',              icon: '👨‍👩‍👧‍👦', categories: ['نكاح', 'أسرة', 'تربية أولاد', 'صون العرض'] },
            { id: 'MAL',   nameAr: 'حفظ المال',              icon: '💰', categories: ['كسب حلال', 'زكاة', 'إنفاق', 'تجنب ربا', 'حماية ملكية'] },
            { id: 'UMMA',  nameAr: 'بناء الأمة',             icon: '🌍', categories: ['خلافة', 'نهضة', 'عدل', 'أمر بمعروف', 'كفاح فساد'] },
            { id: 'ESTN',  nameAr: 'الاستخلاف في الأرض',    icon: '🌱', categories: ['عمارة أرض', 'بيئة', 'استدامة', 'خدمة خلق'] },
            { id: 'IHSN',  nameAr: 'الإحسان',                icon: '✨', categories: ['إتقان عمل', 'صدقة', 'رحمة', 'وقف', 'خير عام'] },
        ],
        digitizationPrefix: 'GHL',
    },

    // ── الجنس 10: الأماكن والبيئات ──────────────────────────────────────────
    {
        id:       'PLC',
        nameAr:   'الأماكن والبيئات',
        nameEn:   'Places & Environments',
        icon:     '🌍',
        maqsad:   'ARD',
        quranRef: { surah: 'البقرة', ayah: 29, text: 'هُوَ الَّذِي خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا', context: 'تسخير الأرض وبيئاتها للإنسان' },
        asmaRef:  'الواسع — الله الواسع خلق أرضاً واسعة متنوعة البيئات',
        types: [
            { id: 'SACR',  nameAr: 'الأماكن المقدسة',         icon: '🕋', categories: ['مكة', 'المدينة', 'القدس', 'قبور الأنبياء', 'مساجد عريقة'] },
            { id: 'URBN',  nameAr: 'المدن والحضر',            icon: '🏙️', categories: ['مدينة', 'ضاحية', 'حي', 'مركز تجاري', 'منطقة صناعية'] },
            { id: 'RURL',  nameAr: 'الريف والقرى',            icon: '🌾', categories: ['قرية', 'مزرعة', 'بادية', 'واحة', 'غابة'] },
            { id: 'OCEN',  nameAr: 'البحار والمحيطات',        icon: '🌊', categories: ['محيط', 'بحر', 'خليج', 'مضيق', 'جزيرة', 'شعاب مرجانية'] },
            { id: 'MNTN',  nameAr: 'الجبال والسهول',          icon: '🏔️', categories: ['جبل', 'سهل', 'صحراء', 'واد', 'هضبة', 'كهف'] },
            { id: 'RIVR',  nameAr: 'الأنهار والبحيرات',       icon: '🏞️', categories: ['نهر', 'بحيرة', 'نبع', 'شلال', 'دلتا'] },
            { id: 'SPCE',  nameAr: 'الفضاء الخارجي',          icon: '🌌', categories: ['فضاء', 'قمر', 'شمس', 'كواكب', 'نجوم', 'مجرات'] },
            { id: 'INDZ',  nameAr: 'البيئات الصناعية',        icon: '🏭', categories: ['مصنع', 'مستودع', 'ميناء', 'مطار', 'منجم', 'حقل نفط'] },
        ],
        digitizationPrefix: 'PLC',
    },

    // ── الجنس 11: الأنظمة والمؤسسات ────────────────────────────────────────
    {
        id:       'SYS',
        nameAr:   'الأنظمة والمؤسسات',
        nameEn:   'Systems & Institutions',
        icon:     '🏛️',
        maqsad:   'DEEN',
        quranRef: { surah: 'آل عمران', ayah: 110, text: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ تَأْمُرُونَ بِالْمَعْرُوفِ وَتَنْهَوْنَ عَنِ الْمُنكَرِ', context: 'المؤسسات الحاكمة بالحق' },
        asmaRef:  'الملك — الله هو الملك والأنظمة خاضعة لملكه وشرعه',
        types: [
            { id: 'GOVT',  nameAr: 'الحكومات والدول',         icon: '🏛️', categories: ['دولة إسلامية', 'ملكية', 'جمهورية', 'إمارة', 'ولاية'] },
            { id: 'RLGS',  nameAr: 'المؤسسات الدينية',        icon: '🕌', categories: ['مسجد', 'دار إفتاء', 'مدرسة شرعية', 'جمعية إسلامية', 'وقف'] },
            { id: 'EDUC',  nameAr: 'مؤسسات التعليم',          icon: '🎓', categories: ['جامعة', 'مدرسة', 'معهد', 'مركز تدريب', 'دار نشر'] },
            { id: 'HLTH',  nameAr: 'مؤسسات الصحة',            icon: '🏥', categories: ['مستشفى', 'مركز صحي', 'منظمة صحة', 'شركة أدوية'] },
            { id: 'FINC',  nameAr: 'المؤسسات المالية',        icon: '🏦', categories: ['بنك إسلامي', 'تأمين تكافلي', 'صندوق وقف', 'بورصة', 'بنك مركزي'] },
            { id: 'BZNZ',  nameAr: 'الشركات والمؤسسات',       icon: '🏢', categories: ['شركة مساهمة', 'تضامن', 'عائلية', 'تعاونية', 'اجتماعية'] },
            { id: 'CIVI',  nameAr: 'المجتمع المدني',          icon: '🤲', categories: ['جمعية خيرية', 'منظمة حقوق', 'نقابة', 'تجمع مجتمعي'] },
            { id: 'INTL',  nameAr: 'المنظمات الدولية',        icon: '🌐', categories: ['أمم متحدة', 'OIC', 'جامعة عربية', 'WTO', 'WHO', 'رابطة العالم الإسلامي'] },
        ],
        digitizationPrefix: 'SYS',
    },

    // ── الجنس 12: الزمن والأحداث ────────────────────────────────────────────
    {
        id:       'TME',
        nameAr:   'الزمن والأحداث',
        nameEn:   'Time & Events',
        icon:     '⏳',
        maqsad:   'AQL',
        quranRef: { surah: 'العصر', ayah: 1, text: 'وَالْعَصْرِ — إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', context: 'أقسم الله بالزمن — أثمن ما يملك الإنسان' },
        asmaRef:  'الأول والآخر — الله هو الأول والآخر والزمن ملكه',
        types: [
            { id: 'ISLC',  nameAr: 'التقويم الإسلامي',        icon: '🌙', categories: ['محرم', 'صفر', 'ربيع', 'جمادى', 'رجب', 'شعبان', 'رمضان', 'ذو الحجة'] },
            { id: 'GROC',  nameAr: 'التقويم الميلادي',        icon: '📅', categories: ['يومي', 'أسبوعي', 'شهري', 'سنوي', 'عقد', 'قرن'] },
            { id: 'IBDT',  nameAr: 'الأحداث العبادية',        icon: '🕌', categories: ['صلاة', 'رمضان', 'حج', 'ليلة القدر', 'عيد'] },
            { id: 'BZNE',  nameAr: 'الأحداث الاقتصادية',      icon: '📊', categories: ['أسواق', 'ميزانيات', 'عقود', 'مواسم', 'ازدهار', 'كساد'] },
            { id: 'NATR',  nameAr: 'الأحداث الطبيعية',        icon: '🌦️', categories: ['مواسم', 'أمطار', 'زلازل', 'براكين', 'فيضانات', 'جفاف'] },
            { id: 'HIST',  nameAr: 'الأحداث التاريخية',       icon: '📜', categories: ['فتوحات', 'هجرة', 'غزوات', 'حضارات', 'مؤتمرات', 'انقلابات'] },
            { id: 'FUTR',  nameAr: 'المستقبل والأهداف',       icon: '🔭', categories: ['خطط', 'رؤية 2030', 'مشاريع', 'أهداف شرعية', 'آخرة'] },
        ],
        digitizationPrefix: 'TME',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// 5. أسماء الله الحسنى — ربط كل جنس بالاسم الأعظم
// ══════════════════════════════════════════════════════════════════════════════

const ASMA_AL_HUSNA = {
    ALLAH:    { ar: 'الله',      meaning: 'الاسم الجامع الأعظم' },
    RAHMAN:   { ar: 'الرحمن',   meaning: 'الرحمة الشاملة لكل مخلوق' },
    RAHIM:    { ar: 'الرحيم',   meaning: 'الرحمة الخاصة بالمؤمنين' },
    MALIK:    { ar: 'الملك',    meaning: 'المالك المطلق لكل شيء' },
    QUDDUS:   { ar: 'القدوس',   meaning: 'المنزه عن كل نقص' },
    KHALIQ:   { ar: 'الخالق',   meaning: 'خالق كل شيء من عدم' },
    BARI:     { ar: 'البارئ',   meaning: 'المبدع الخالق بلا مثال' },
    MUSAWWIR: { ar: 'المصور',   meaning: 'المصور لكل شيء بصورته' },
    RAZZAQ:   { ar: 'الرزاق',   meaning: 'رازق كل مخلوق بما يحتاج' },
    FATTAH:   { ar: 'الفتاح',   meaning: 'فاتح أبواب الرزق والحل' },
    ALIM:     { ar: 'العليم',   meaning: 'العليم بكل شيء ظاهر وخفي' },
    QADIR:    { ar: 'القدير',   meaning: 'القادر على كل شيء' },
    SAMI:     { ar: 'السميع',   meaning: 'السامع لكل صوت' },
    BASIR:    { ar: 'البصير',   meaning: 'المبصر لكل شيء' },
    LATIF:    { ar: 'اللطيف',   meaning: 'اللطيف بعباده في رزقهم وأحوالهم' },
    HAKIM:    { ar: 'الحكيم',   meaning: 'الحكيم في كل فعل وشرع' },
    WASI:     { ar: 'الواسع',   meaning: 'الواسع رحمةً وعلمًا وقدرةً' },
    MUHYI:    { ar: 'المحيي',   meaning: 'محيي الأرض والأرواح والقلوب' },
    JAMI:     { ar: 'الجامع',   meaning: 'الجامع للخلق يوم الحشر' },
    AWWAL:    { ar: 'الأول',    meaning: 'الأول قبل كل شيء' },
    AKHIR:    { ar: 'الآخر',    meaning: 'الآخر بعد فناء كل شيء' },
};

// ══════════════════════════════════════════════════════════════════════════════
// 6. نظام الترقيم الجامع — UNIVERSAL ENTITY DIGITIZATION SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ينتج رقمًا جامعًا لأي كيان بالصيغة:
 *   {جنس}-{نوع}-{صنف}-{رقم_تسلسلي} مثل PRD-FOOD-GRAIN-00001
 */
function generateEntityId(genusId, typeId, categoryId) {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    const cat = (categoryId || 'GEN').slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
    return `${genusId}-${typeId.slice(0, 4).toUpperCase()}-${cat}-${ts}${rnd}`;
}

/**
 * يربط كيانًا بأقرب آية قرآنية تذكره (جدول الربط الأساسي)
 */
const QURAN_ENTITY_BRIDGE = {
    // المنتجات الغذائية
    'PRD-FOOD': { surah: 'عبس', ayah: 24, text: 'فَلْيَنظُرِ الْإِنسَانُ إِلَىٰ طَعَامِهِ', context: 'الطعام نعمة ومسؤولية' },
    'PRD-META': { surah: 'الحديد', ayah: 25, text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ', context: 'المعادن المُصنَّعة' },
    'PRD-TEXT': { surah: 'النحل', ayah: 81, text: 'وَجَعَلَ لَكُمْ سَرَابِيلَ تَقِيكُمُ الْحَرَّ وَسَرَابِيلَ تَقِيكُم بَأْسَكُمْ', context: 'المنسوجات والملابس' },
    // المصانع
    'FAC-SMLT': { surah: 'سبأ', ayah: 10, text: 'وَأَلَنَّا لَهُ الْحَدِيدَ', context: 'المصاهر' },
    'FAC-FARM': { surah: 'الحجر', ayah: 19, text: 'وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ', context: 'الزراعة والإنتاج' },
    // الكائنات
    'ORG-HUMN': { surah: 'التين', ayah: 4, text: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ', context: 'خلق الإنسان' },
    'ORG-MMAL': { surah: 'النحل', ayah: 66, text: 'وَإِنَّ لَكُمْ فِي الْأَنْعَامِ لَعِبْرَةً', context: 'الأنعام وفوائدها' },
    'ORG-PLNT': { surah: 'الأنعام', ayah: 99, text: 'وَهُوَ الَّذِي أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ نَبَاتَ كُلِّ شَيْءٍ', context: 'النباتات' },
    // المواد
    'MAT-WTER': { surah: 'الأنبياء', ayah: 30, text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ', context: 'الماء' },
    'MAT-METL': { surah: 'الكهف', ayah: 96, text: 'آتُونِي زُبَرَ الْحَدِيدِ', context: 'المعادن الخام' },
    // الخدمات
    'SRV-HLTH': { surah: 'الشعراء', ayah: 80, text: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ', context: 'الشفاء من الله بالطب' },
    'SRV-EDUC': { surah: 'الزمر', ayah: 9, text: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', context: 'التعليم' },
    // الغايات
    'GHL-DEEN': { surah: 'الذاريات', ayah: 56, text: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ', context: 'الغاية العظمى' },
    'GHL-MAL':  { surah: 'البقرة', ayah: 275, text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', context: 'حفظ المال حلالاً' },
    // الشبكات
    'NET-SOCL': { surah: 'الحجرات', ayah: 13, text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', context: 'الشبكات الاجتماعية' },
    // الزمن
    'TME-ISLC': { surah: 'التوبة', ayah: 36, text: 'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا', context: 'التقويم الإسلامي' },
};

// ══════════════════════════════════════════════════════════════════════════════
// 7. المقاصد الشرعية الخمس + التوحيد
// ══════════════════════════════════════════════════════════════════════════════

const MAQASID_NODES = [
    { id: 'DEEN',  nameAr: 'حفظ الدين',  weight: 1.0, asma: 'الله',    surah: 'الذاريات', ayah: 56 },
    { id: 'NAFS',  nameAr: 'حفظ النفس',  weight: 0.9, asma: 'المحيي',  surah: 'المائدة',  ayah: 32 },
    { id: 'AQL',   nameAr: 'حفظ العقل',  weight: 0.8, asma: 'العليم',  surah: 'العلق',    ayah: 1  },
    { id: 'NASL',  nameAr: 'حفظ النسل',  weight: 0.7, asma: 'الجامع',  surah: 'الحجرات',  ayah: 13 },
    { id: 'MAL',   nameAr: 'حفظ المال',  weight: 0.6, asma: 'الرزاق',  surah: 'البقرة',   ayah: 275 },
];

// ══════════════════════════════════════════════════════════════════════════════
// 8. مؤشرات الإدخال العصبية (16 مؤشر لأي كيان)
// ══════════════════════════════════════════════════════════════════════════════

const ENTITY_INPUT_FEATURES = [
    { id: 'genus_encoded',      nameAr: 'رمز الجنس (0-1)' },
    { id: 'type_encoded',       nameAr: 'رمز النوع (0-1)' },
    { id: 'is_living',          nameAr: 'كائن حي؟' },
    { id: 'is_product',         nameAr: 'منتج قابل للتداول؟' },
    { id: 'is_means',           nameAr: 'وسيلة لغاية؟' },
    { id: 'is_network',         nameAr: 'شبكة/علاقة؟' },
    { id: 'has_quran_mention',  nameAr: 'مذكور في القرآن؟' },
    { id: 'halal_status',       nameAr: 'حكم التحليل (0=حرام،1=حلال)' },
    { id: 'tradeable',          nameAr: 'قابل للتجارة؟' },
    { id: 'digitizable',        nameAr: 'قابل للرقمنة؟' },
    { id: 'maqasid_alignment',  nameAr: 'درجة المقصد الشرعي' },
    { id: 'tawheed_distance',   nameAr: 'قرب من التوحيد (0=بعيد، 1=قريب)' },
    { id: 'creation_rank',      nameAr: 'رتبة الخلق (1=مباشر، 0=فرعي)' },
    { id: 'utility_score',      nameAr: 'قيمة النفع العام' },
    { id: 'sustainability',     nameAr: 'الاستدامة والاستمرارية' },
    { id: 'zakat_applicable',   nameAr: 'تجب فيه الزكاة؟' },
];

const ENTITY_INPUT_SIZE = ENTITY_INPUT_FEATURES.length;  // 16
const GENUS_SIZE        = UNIVERSAL_GENERA.length;        // 12
const TYPE_LAYER_SIZE   = 32;
const MAQASID_SIZE      = MAQASID_NODES.length;           // 5
const TAWHEED_SIZE      = 1;

// ══════════════════════════════════════════════════════════════════════════════
// 9. شبكة شيخة العصبية الكونية الجامعة
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaUniversalEntityNeuralNetwork extends EventEmitter {

    constructor() {
        super();
        this.schema    = 'sheikha/uene/v1';
        this.tawheed   = 'لا إله إلا الله محمد رسول الله';
        this.startedAt = new Date().toISOString();

        // ── طبقات الشبكة ───────────────────────────────────────────────────
        this.genusLayer    = new DenseLayer(ENTITY_INPUT_SIZE, GENUS_SIZE,      'tanh');
        this.typeLayer     = new DenseLayer(GENUS_SIZE,        TYPE_LAYER_SIZE, 'relu');
        this.maqasidLayer  = new DenseLayer(TYPE_LAYER_SIZE,   MAQASID_SIZE,    'sigmoid');
        this.tawheedLayer  = new DenseLayer(MAQASID_SIZE,      TAWHEED_SIZE,    'sigmoid');

        // ── فهارس ──────────────────────────────────────────────────────────
        this._generaMap    = new Map(UNIVERSAL_GENERA.map(g => [g.id, g]));
        this._entityCache  = new Map();
        this._stats        = { analyzed: 0, registered: 0, errors: 0 };
    }

    // ── التمرير الأمامي ─────────────────────────────────────────────────────

    forward(inputArr) {
        if (inputArr.length !== ENTITY_INPUT_SIZE) {
            throw new Error(`يجب توفير ${ENTITY_INPUT_SIZE} مؤشر، وُجد: ${inputArr.length}`);
        }
        const input      = Matrix.fromArray(inputArr);
        const genusOut   = this.genusLayer.forward(input);
        const typeOut    = this.typeLayer.forward(genusOut);
        const maqasidOut = this.maqasidLayer.forward(typeOut);
        const tawheedOut = this.tawheedLayer.forward(maqasidOut);

        return {
            genus:   genusOut.toArray(),
            types:   typeOut.toArray(),
            maqasid: maqasidOut.toArray(),
            tawheed: tawheedOut.toArray()[0],
        };
    }

    // ── تعيير المدخلات ──────────────────────────────────────────────────────

    normalizeEntity(entity) {
        const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, isNaN(v) ? 0 : v));
        const e = entity || {};

        const genusIdx = UNIVERSAL_GENERA.findIndex(g => g.id === (e.genusId || 'PRD'));
        const typeIds  = (this._generaMap.get(e.genusId || 'PRD') || {}).types || [];
        const typeIdx  = typeIds.findIndex(t => t.id === (e.typeId || ''));

        return [
            clamp(genusIdx >= 0 ? genusIdx / (UNIVERSAL_GENERA.length - 1) : 0.5),
            clamp(typeIdx  >= 0 ? typeIdx  / Math.max(typeIds.length - 1, 1) : 0.5),
            e.isLiving      ? 1 : 0,
            e.isProduct     ? 1 : 0,
            e.isMeans       ? 1 : 0,
            e.isNetwork     ? 1 : 0,
            e.hasQuranMention ? 1 : (this._hasQuranBridge(e.genusId, e.typeId) ? 0.8 : 0.3),
            e.halalStatus === false ? 0 : (e.halalStatus === true ? 1 : 0.8),
            e.tradeable     ? 1 : 0,
            e.digitizable !== false ? 1 : 0,
            clamp(e.maqasidAlignment   || 0.5),
            clamp(e.tawheedDistance    || 0.5),
            clamp(e.creationRank       || 0.5),
            clamp(e.utilityScore       || 0.5),
            clamp(e.sustainability     || 0.5),
            e.zakatApplicable ? 1 : 0,
        ];
    }

    _hasQuranBridge(genusId, typeId) {
        const key = `${genusId}-${typeId}`;
        return key in QURAN_ENTITY_BRIDGE || genusId in QURAN_ENTITY_BRIDGE;
    }

    // ── التحليل الكامل لأي كيان ─────────────────────────────────────────────

    /**
     * التحليل الشامل لأي كيان: تصنيفه + مقاصده + توحيده
     * @param {object} entity — بيانات الكيان
     * @returns {object} تقرير كامل
     */
    analyze(entity) {
        const traceId = `UENE-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        this._stats.analyzed++;

        try {
            // 1. تعيير المدخلات
            const inputArr = this.normalizeEntity(entity);

            // 2. التمرير عبر الشبكة
            const { genus: genusActs, types: typeActs, maqasid: maqasidActs, tawheed } = this.forward(inputArr);

            // 3. تحديد الجنس: نفضّل genusId الصريح إن وُجد، ونستخدم الشبكة احتياطيًا
            const explicitGenus  = entity.genusId ? this._generaMap.get(entity.genusId) : null;
            const topGenusIdx    = genusActs.indexOf(Math.max(...genusActs));
            const detectedGenus  = explicitGenus || UNIVERSAL_GENERA[topGenusIdx];

            // 4. المقاصد المُفعَّلة
            const maqasidResults = MAQASID_NODES.map((m, i) => ({
                ...m,
                activation: Math.round(maqasidActs[i] * 100) / 100,
                active:     maqasidActs[i] > 0.5,
            }));
            const activeMaqasid = maqasidResults.filter(m => m.active);

            // 5. القرآن والسنة
            const quranRef = this._getQuranRef(entity.genusId || detectedGenus.id, entity.typeId);
            const sunnahRef = this._getSunnahRef(entity.genusId || detectedGenus.id);

            // 6. ربط بأسماء الله
            const asmaLink = this._linkToAsma(detectedGenus.id, activeMaqasid);

            // 7. الحكم الشرعي الأولي
            const islamicRuling = this._getIslamicRuling(entity);

            // 8. رقم الكيان الجامع
            const entityId = entity.id || generateEntityId(
                entity.genusId || detectedGenus.id,
                entity.typeId  || 'GEN',
                entity.categoryId || 'GEN'
            );

            // 9. نقاط التوحيد
            const tawheedScore  = Math.round(tawheed * 100) / 100;
            const tawheedGrade  = tawheedScore >= 0.8 ? 'موحَّد تماماً ✅'
                : tawheedScore >= 0.6 ? 'موحَّد جيد'
                : tawheedScore >= 0.4 ? 'يحتاج توجيه'
                : 'يحتاج تصحيح ⚠️';

            // 10. الملخص التنفيذي
            const summary = this._buildSummary({
                entityId, entity, detectedGenus, activeMaqasid, tawheedScore, tawheedGrade, islamicRuling,
            });

            const result = {
                traceId,
                success:   true,
                schema:    this.schema,
                tawheed:   this.tawheed,
                timestamp: new Date().toISOString(),
                entity: {
                    id:          entityId,
                    name:        entity.name || entity.nameAr || '(غير مسمى)',
                    nameAr:      entity.nameAr || entity.name || '',
                    genusId:     detectedGenus.id,
                    genusNameAr: detectedGenus.nameAr,
                    typeId:      entity.typeId || '',
                    categoryId:  entity.categoryId || '',
                },
                neuralNetwork: {
                    inputs:      ENTITY_INPUT_FEATURES.map((f, i) => ({ ...f, value: Math.round(inputArr[i] * 1000) / 1000 })),
                    genusLayer:  UNIVERSAL_GENERA.map((g, i) => ({
                        id: g.id, nameAr: g.nameAr,
                        activation: Math.round(genusActs[i] * 100) / 100,
                        isDetected: i === topGenusIdx,
                    })),
                    maqasidLayer: maqasidResults,
                    tawheedLayer: { score: tawheedScore, grade: tawheedGrade },
                },
                islamicFramework: {
                    quranRef,
                    sunnahRef,
                    asmaLink,
                    islamicRuling,
                    maqasid:       activeMaqasid,
                    tawheedMsg:    this._tawheedMessage(detectedGenus.id, entity),
                },
                digitization: {
                    entityId,
                    format:  `${detectedGenus.id}-${entity.typeId || 'GEN'}-${entity.categoryId || 'GEN'}-{رقم}`,
                    prefix:  detectedGenus.digitizationPrefix,
                    quranBridge: quranRef,
                    asmaAllah: asmaLink.asmaId,
                },
                summary,
            };

            this._entityCache.set(entityId, { entity, result: { tawheedScore, genusId: detectedGenus.id }, ts: Date.now() });
            this.emit('entity_analyzed', { traceId, entityId, genus: detectedGenus.id, tawheedScore });
            return result;

        } catch (err) {
            this._stats.errors++;
            return { traceId, success: false, error: err.message, tawheed: this.tawheed };
        }
    }

    // ── تسجيل كيان ────────────────────────────────────────────────────────

    /**
     * تسجيل كيان جديد في السجل الجامع وإسناد رقم له
     */
    register(entity) {
        this._stats.registered++;
        const analysis = this.analyze(entity);
        if (!analysis.success) return analysis;
        const registered = {
            ...analysis,
            registeredAt: new Date().toISOString(),
            status: 'مسجّل في سجل شيخة الجامع',
        };
        this.emit('entity_registered', { id: analysis.entity.id, genus: analysis.entity.genusId });
        return registered;
    }

    // ── تصنيف دُفعة كيانات ───────────────────────────────────────────────

    /**
     * تحليل مجموعة من الكيانات دفعةً واحدة
     * @param {object[]} entities
     * @returns {object[]}
     */
    analyzeBatch(entities) {
        return (entities || []).map(e => this.analyze(e));
    }

    // ── توليد رقم الكيان ────────────────────────────────────────────────────

    generateId(genusId, typeId, categoryId) {
        return generateEntityId(genusId, typeId, categoryId);
    }

    // ── قائمة الأجناس ────────────────────────────────────────────────────

    listGenera(withTypes = false) {
        return UNIVERSAL_GENERA.map(g => withTypes ? g : {
            id: g.id, nameAr: g.nameAr, nameEn: g.nameEn,
            icon: g.icon, maqsad: g.maqsad, quranRef: g.quranRef,
            asmaRef: g.asmaRef, typesCount: g.types.length,
        });
    }

    getGenus(genusId) {
        return this._generaMap.get(genusId) || null;
    }

    listTypes(genusId) {
        const genus = this._generaMap.get(genusId);
        if (!genus) return [];
        return genus.types;
    }

    getType(genusId, typeId) {
        const genus = this._generaMap.get(genusId);
        if (!genus) return null;
        return genus.types.find(t => t.id === typeId) || null;
    }

    // ── البحث في السجل الجامع ────────────────────────────────────────────────

    search(query = '') {
        const q = query.toLowerCase().trim();
        const results = [];
        for (const genus of UNIVERSAL_GENERA) {
            if (!q || genus.nameAr.includes(query) || genus.nameEn.toLowerCase().includes(q) || genus.id.toLowerCase().includes(q)) {
                results.push({ id: genus.id, nameAr: genus.nameAr, nameEn: genus.nameEn, icon: genus.icon, match: 'genus' });
            }
            for (const type of genus.types) {
                if (!q || type.nameAr.includes(query) || type.id.toLowerCase().includes(q)) {
                    results.push({ id: `${genus.id}-${type.id}`, nameAr: type.nameAr, icon: type.icon, parentGenus: genus.id, match: 'type' });
                } else if (q && Array.isArray(type.categories)) {
                    // بحث في الأصناف داخل النوع
                    const catMatch = type.categories.find(c => c.includes(query));
                    if (catMatch) {
                        results.push({
                            id: `${genus.id}-${type.id}`, nameAr: type.nameAr, icon: type.icon,
                            parentGenus: genus.id, match: 'category', matchedCategory: catMatch,
                        });
                    }
                }
            }
        }
        return results;
    }

    // ── أسماء الله والرقمنة ────────────────────────────────────────────────

    listAsmaAlHusna() { return ASMA_AL_HUSNA; }
    listMaqasid()     { return MAQASID_NODES; }
    listQuranBridge() { return QURAN_ENTITY_BRIDGE; }

    // ── الحالة والإحصائيات ──────────────────────────────────────────────────

    status() {
        return {
            schema:   this.schema,
            nameAr:   'شبكة شيخة العصبية الكونية الجامعة',
            tawheed:  this.tawheed,
            startedAt: this.startedAt,
            genera:   UNIVERSAL_GENERA.length,
            totalTypes: UNIVERSAL_GENERA.reduce((s, g) => s + g.types.length, 0),
            totalCategories: UNIVERSAL_GENERA.reduce((s, g) =>
                s + g.types.reduce((ss, t) => ss + (t.categories || []).length, 0), 0),
            maqasid:  MAQASID_NODES.length,
            asmaAlHusna: Object.keys(ASMA_AL_HUSNA).length,
            quranBridges: Object.keys(QURAN_ENTITY_BRIDGE).length,
            network: {
                layers: [
                    { name: 'Entity Input',   nodes: ENTITY_INPUT_SIZE,  activation: 'linear' },
                    { name: 'Genus Layer',    nodes: GENUS_SIZE,         activation: 'tanh'   },
                    { name: 'Type Layer',     nodes: TYPE_LAYER_SIZE,    activation: 'relu'   },
                    { name: 'Maqasid Layer',  nodes: MAQASID_SIZE,       activation: 'sigmoid'},
                    { name: 'Tawheed Output', nodes: TAWHEED_SIZE,       activation: 'sigmoid'},
                ],
            },
            stats: this._stats,
        };
    }

    exportWeights() {
        return {
            schema:       this.schema,
            exportedAt:   new Date().toISOString(),
            genusLayer:   this.genusLayer.toJSON(),
            typeLayer:    this.typeLayer.toJSON(),
            maqasidLayer: this.maqasidLayer.toJSON(),
            tawheedLayer: this.tawheedLayer.toJSON(),
        };
    }

    importWeights(data) {
        if (data.schema !== this.schema) throw new Error('مخطط الأوزان غير متوافق');
        this.genusLayer   = DenseLayer.fromJSON(data.genusLayer);
        this.typeLayer    = DenseLayer.fromJSON(data.typeLayer);
        this.maqasidLayer = DenseLayer.fromJSON(data.maqasidLayer);
        this.tawheedLayer = DenseLayer.fromJSON(data.tawheedLayer);
    }

    // ── دوال مساعدة خاصة ──────────────────────────────────────────────────

    _getQuranRef(genusId, typeId) {
        const key = `${genusId}-${typeId}`;
        if (QURAN_ENTITY_BRIDGE[key]) return QURAN_ENTITY_BRIDGE[key];
        const genus = this._generaMap.get(genusId);
        if (genus && genus.quranRef) return genus.quranRef;
        return { surah: 'الإسراء', ayah: 44, text: 'وَإِن مِّن شَيْءٍ إِلَّا يُسَبِّحُ بِحَمْدِهِ', context: 'كل شيء يُسبِّح الله' };
    }

    _getSunnahRef(genusId) {
        const refs = {
            PRD: { text: 'إن الله طيب لا يقبل إلا طيبًا', source: 'صحيح مسلم', context: 'طيب المنتجات وحلها' },
            FAC: { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', source: 'الطبراني — حديث صحيح', context: 'الإتقان في الإنتاج' },
            ORG: { text: 'ما من مسلم يغرس غرسًا إلا كان ما أُكل منه له صدقة', source: 'صحيح البخاري', context: 'الكائنات الحية والزرع' },
            MAT: { text: 'الذهب بالذهب، والفضة بالفضة… يدًا بيد', source: 'صحيح مسلم', context: 'تداول المواد والمعادن' },
            SRV: { text: 'من كان في حاجة أخيه كان الله في حاجته', source: 'صحيح البخاري', context: 'الخدمات وعون الناس' },
            KNW: { text: 'طلب العلم فريضة على كل مسلم', source: 'ابن ماجه — صحيح', context: 'المعارف والعلوم' },
            MNS: { text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ', source: 'القرآن — الأنفال ٦٠', context: 'الوسائل والأدوات' },
            NET: { text: 'المؤمن للمؤمن كالبنيان يشد بعضه بعضًا', source: 'صحيح البخاري', context: 'الشبكات والعلاقات' },
            GHL: { text: 'إنما الأعمال بالنيات', source: 'صحيح البخاري', context: 'الغايات والمقاصد والنيات' },
            PLC: { text: 'البلاد بلاد الله والعباد عباد الله', source: 'حديث شريف', context: 'الأماكن والبيئات' },
            SYS: { text: 'اسمعوا وأطيعوا — وعليكم بالجماعة', source: 'صحيح البخاري', context: 'الأنظمة والمؤسسات' },
            TME: { text: 'اغتنم خمسًا قبل خمس: شبابك قبل هرمك', source: 'المستدرك — صحيح', context: 'الزمن والأحداث' },
        };
        return refs[genusId] || { text: 'كل ميسر لما خُلق له', source: 'صحيح البخاري', context: 'كل كيان ميسَّر لغايته' };
    }

    _linkToAsma(genusId, activeMaqasid) {
        const map = {
            PRD: 'RAZZAQ', FAC: 'KHALIQ', ORG: 'MUHYI', MAT: 'MUSAWWIR',
            SRV: 'LATIF',  KNW: 'ALIM',  MNS: 'QADIR', NET: 'JAMI',
            GHL: 'HAKIM',  PLC: 'WASI',  SYS: 'MALIK', TME: 'AWWAL',
        };
        const asmaId = map[genusId] || 'ALLAH';
        return { asmaId, asma: ASMA_AL_HUSNA[asmaId] || ASMA_AL_HUSNA.ALLAH };
    }

    _getIslamicRuling(entity) {
        if (entity.halalStatus === false || entity.prohibitedGoods) {
            return { ruling: 'حرام', confidence: 'عالية', note: 'محرم شرعًا — لا يجوز تداوله' };
        }
        if (entity.halalStatus === true || entity.shariaCompliant === true) {
            return { ruling: 'حلال', confidence: 'عالية', note: 'مباح شرعًا — يجوز تداوله' };
        }
        if (entity.genusId === 'GHL' && entity.typeId === 'DEEN') {
            return { ruling: 'واجب', confidence: 'قطعية', note: 'العبادة والتوحيد واجبة على كل مكلف' };
        }
        return { ruling: 'مباح بالأصل', confidence: 'متوسطة', note: 'الأصل في الأشياء الإباحة — يُستفتى في الخاص منها' };
    }

    _tawheedMessage(genusId, entity) {
        const messages = {
            PRD: 'هذا المنتج نعمة من الله — اشكر الله واستخدمها في طاعته ﴿كُلُوا مِن رِّزْقِ رَبِّكُمْ وَاشْكُرُوا لَهُ﴾',
            FAC: 'هذا المصنع مُسخَّر من الله — أتقن العمل فيه ووحّد نيتك لله ﴿وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ﴾',
            ORG: 'هذا الكائن يُسبِّح الله — ارعه وأحسن إليه ﴿وَإِن مِّن شَيْءٍ إِلَّا يُسَبِّحُ بِحَمْدِهِ﴾',
            MAT: 'هذه المادة خُلقت لمنافع الناس — استخدمها بميزان الحق ﴿وَأَلَنَّا لَهُ الْحَدِيدَ﴾',
            SRV: 'هذه الخدمة صدقة جارية — قدّمها لوجه الله ﴿وَأَحْسِن كَمَا أَحْسَنَ اللَّهُ إِلَيْكَ﴾',
            KNW: 'هذا العلم أمانة — بلّغه ابتغاء وجه الله ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾',
            MNS: 'هذه الوسيلة أداة — وحّد نيتك في استخدامها لطاعة الله ﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾',
            NET: 'هذه الشبكة رابط — قوّيها بالإخوة الإيمانية ﴿وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا﴾',
            GHL: 'هذه الغاية قصد — اجعل غايتك الكبرى لله وحده ﴿وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ﴾',
            PLC: 'هذا المكان أمانة — أصلح ولا تُفسد ﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾',
            SYS: 'هذا النظام ولاية — أقم العدل فيه وحكّم شريعة الله ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾',
            TME: 'هذا الزمن رصيد — استثمره قبل أن يمضي ﴿وَالْعَصْرِ — إِنَّ الْإِنسَانَ لَفِي خُسْرٍ﴾',
        };
        return messages[genusId] || 'كل شيء خُلق لغاية وكل غاية تُفضي إلى عبادة الله وحده';
    }

    _buildSummary({ entityId, entity, detectedGenus, activeMaqasid, tawheedScore, tawheedGrade, islamicRuling }) {
        const lines = [
            `🌌 الكيان: "${entity.nameAr || entity.name || entityId}"`,
            `📂 الجنس: ${detectedGenus.nameAr} ${detectedGenus.icon}`,
            `🕌 الحكم الشرعي: ${islamicRuling.ruling} — ${islamicRuling.note}`,
            `🎯 المقاصد المُفعَّلة: ${activeMaqasid.map(m => m.nameAr).join('، ') || 'لم تُحدَّد'}`,
            `☝️ نقاط التوحيد: ${Math.round(tawheedScore * 100)}% — ${tawheedGrade}`,
            `📖 القرآن: ${detectedGenus.quranRef.surah} ﴿${detectedGenus.quranRef.text}﴾`,
        ];
        return lines.join('\n');
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. Singleton + تصدير
// ══════════════════════════════════════════════════════════════════════════════

const universalEntityNN = new SheikhaUniversalEntityNeuralNetwork();

module.exports = {
    universalEntityNN,
    SheikhaUniversalEntityNeuralNetwork,
    DenseLayer,
    Matrix,
    Activations,
    UNIVERSAL_GENERA,
    MAQASID_NODES,
    ENTITY_INPUT_FEATURES,
    ASMA_AL_HUSNA,
    QURAN_ENTITY_BRIDGE,
    generateEntityId,
};
