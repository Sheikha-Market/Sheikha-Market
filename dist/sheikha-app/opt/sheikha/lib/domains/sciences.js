/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     lib/domains/sciences.js                                 ║
 * ║   علوم الحاسب والفلك وجميع العلوم والتقنيات — رقمنة بالكتاب والسنة لله     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق ١
 * "وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا" — يس ٣٨
 * "أَوَلَمْ يَرَوْا أَنَّا خَلَقْنَا لَهُم مِّمَّا عَمِلَتْ أَيْدِينَا أَنْعَامًا" — يس ٧١
 * "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" — فصلت ٥٣
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة ٣١
 *
 * الفروع العلمية المدعومة:
 *  ① علوم الحاسب والرياضيات
 *  ② الفلك والفضاء
 *  ③ الفيزياء النظرية والتطبيقية
 *  ④ الكيمياء والمواد
 *  ⑤ علم الأحياء والجينوم
 *  ⑥ علوم الأرض والمناخ
 *  ⑦ الهندسة الكهربائية والميكانيكية
 *  ⑧ الذكاء الصناعي والروبوتيات
 *  ⑨ الكم والفيزياء الجسيمية
 *  ⑩ الرياضيات الإسلامية — إسهام الحضارة
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── الأساس القرآني للعلوم ────────────────────────────────────────────────────

const QURAN_SCIENCE_FOUNDATIONS = {
    astronomy: [
        { verse: 'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ', ref: 'يس:٣٨', science: 'ميكانيكا الكون' },
        { verse: 'وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ حَتَّىٰ عَادَ كَالْعُرْجُونِ الْقَدِيمِ',          ref: 'يس:٣٩', science: 'الفلك التقويمي' },
        { verse: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ',                             ref: 'الذاريات:٤٧', science: 'توسع الكون' },
        { verse: 'أَفَلَمْ يَنظُرُوا إِلَى السَّمَاءِ فَوْقَهُمْ كَيْفَ بَنَيْنَاهَا',                 ref: 'ق:٦', science: 'الفيزياء الفلكية' },
    ],
    physics: [
        { verse: 'وَخَلَقَ كُلَّ شَيْءٍ فَقَدَّرَهُ تَقْدِيرًا',               ref: 'الفرقان:٢',    science: 'نظرية كل شيء' },
        { verse: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ',                   ref: 'الذاريات:٤٩', science: 'ثنائية الجسيمات' },
        { verse: 'كُلٌّ فِي فَلَكٍ يَسْبَحُونَ',                              ref: 'يس:٤٠',       science: 'الحركة المدارية' },
    ],
    mathematics: [
        { verse: 'وَأَحْصَىٰ كُلَّ شَيْءٍ عَدَدًا',                          ref: 'الجن:٢٨',     science: 'الأعداد والإحصاء' },
        { verse: 'عَلَّمَهُ الْبَيَانَ',                                       ref: 'الرحمن:٤',    science: 'المنطق والبيان' },
    ],
    biology: [
        { verse: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',             ref: 'الأنبياء:٣٠', science: 'أصل الحياة' },
        { verse: 'سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ',    ref: 'فصلت:٥٣',   science: 'علم الإنسان' },
    ],
    computing: [
        { verse: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',                     ref: 'البقرة:٣١',   science: 'علم البيانات والأسماء' },
        { verse: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',                   ref: 'العلق:١',     science: 'القراءة والمعالجة' },
    ],
};

// ─── Islamic Mathematics Heritage ─────────────────────────────────────────────

const ISLAMIC_MATH_HERITAGE = {
    scholars: [
        { name: 'الخوارزمي',   contribution: 'الجبر والخوارزميات — أصل كلمة Algorithm', year: '830م' },
        { name: 'ابن الهيثم',  contribution: 'البصريات — الكاميرا وتحليل الضوء',        year: '1021م' },
        { name: 'الكندي',      contribution: 'التشفير وعلم الأعداد',                   year: '873م' },
        { name: 'البيروني',    contribution: 'الرياضيات والفيزياء والفلك',              year: '1048م' },
        { name: 'ابن سينا',    contribution: 'الطب والفلسفة الطبيعية',                 year: '1037م' },
        { name: 'ابن رشد',     contribution: 'المنطق والفيزياء الأرسطية',              year: '1198م' },
        { name: 'الطوسي',      contribution: 'علم المثلثات والفلك',                   year: '1274م' },
        { name: 'ابن الشاطر',  contribution: 'نماذج فلكية — سبقت كوبرنيكوس',          year: '1375م' },
        { name: 'العلاء ابن الشاطر', contribution: 'الساعة الشمسية الدقيقة',           year: '1375م' },
    ],
    contributions: [
        'الجبر والخوارزميات',
        'نظام الأرقام العشرية (الصفر)',
        'المثلثات الكروية',
        'البصريات والضوء',
        'التشفير وعلم الأعداد',
        'الكيمياء والتقطير',
        'الرياضيات التربيعية',
        'نظرية الاحتمالات المبكرة',
    ],
};

// ─── Science Domain Base ──────────────────────────────────────────────────────

class ScienceDomain extends EventEmitter {
    constructor(fieldId, displayName, arabicName) {
        super();
        this.fieldId     = fieldId;
        this.displayName = displayName;
        this.arabicName  = arabicName;
        this._models     = new Map(); // mathematical/computational models
        this._simulations= new Map();
        this._datasets   = new Map();
        this._publications = [];
        this.status_     = 'dormant';
    }

    registerModel(id, spec = {}) {
        const model = {
            id,
            name:         spec.name         || id,
            type:         spec.type         || 'computational',
            equations:    spec.equations    || [],
            parameters:   spec.parameters   || {},
            accuracy:     spec.accuracy     || null,
            hpcRequired:  spec.hpcRequired  || false,
            quranRef:     spec.quranRef     || null,
        };
        this._models.set(id, model);
        console.log(`[${this.fieldId}] 📐 نموذج: ${model.name}`);
        return model;
    }

    async runSimulation(modelId, inputs = {}) {
        const model = this._models.get(modelId);
        if (!model) return { ok: false, error: `النموذج "${modelId}" غير موجود` };

        const simId = crypto.randomBytes(4).toString('hex');
        const sim   = {
            id:        simId,
            modelId,
            inputs,
            status:    'running',
            startedAt: new Date().toISOString(),
            result:    null,
        };
        this._simulations.set(simId, sim);

        // In production: dispatch to HPC
        sim.status = 'completed';
        sim.result = { note: 'محاكاة — يتطلب HPC حقيقي في الإنتاج', inputs };
        sim.finishedAt = new Date().toISOString();

        return { ok: true, simulation: sim };
    }

    addDataset(id, spec = {}) {
        this._datasets.set(id, {
            id,
            name:      spec.name      || id,
            size:      spec.size      || '0 GB',
            type:      spec.type      || 'structured',
            source:    spec.source    || 'internal',
            openData:  spec.openData  || false,
            addedAt:   new Date().toISOString(),
        });
    }

    snapshot() {
        return {
            field:        this.fieldId,
            name:         this.arabicName,
            models:       this._models.size,
            simulations:  this._simulations.size,
            datasets:     this._datasets.size,
            publications: this._publications.length,
            status:       this.status_,
        };
    }

    async init() {
        this.status_ = 'active';
        console.log(`[sciences] ✅ ${this.arabicName} جاهز`);
    }
}

// ─── ① Computer Science & Mathematics ────────────────────────────────────────

class ComputerScienceDomain extends ScienceDomain {
    constructor() {
        super('cs-math', 'Computer Science & Mathematics', 'علوم الحاسب والرياضيات');
        this._algorithms = new Map();
        this._cryptoKeys = new Map();
    }

    registerAlgorithm(id, spec = {}) {
        const algo = {
            id,
            name:        spec.name        || id,
            family:      spec.family      || 'general',
            // families: sorting | searching | graph | ml | crypto | optimization | quantum
            complexity:  { time: spec.time || 'O(n)', space: spec.space || 'O(1)' },
            origin:      spec.origin      || null,
            islamicBase: spec.islamicBase || null,  // ربط بالإسهام الإسلامي
        };
        this._algorithms.set(id, algo);
        return algo;
    }

    async init() {
        await super.init();

        // خوارزميات أساسية مع ربط إسلامي
        this.registerAlgorithm('al-khwarizmi-sort', {
            name:        'الخوارزمي — ترتيب المعلومات',
            family:      'sorting',
            time:        'O(n log n)',
            islamicBase: 'سُمّيت Algorithm نسبةً لأبي عبد الله محمد الخوارزمي (780-850م)',
        });
        this.registerAlgorithm('al-kindi-crypto', {
            name:        'الكندي — التشفير وتحليل التكرار',
            family:      'crypto',
            islamicBase: 'أول من وضع نظرية تحليل الشفرات في رسالة "في استخراج المعمى"',
        });
        this.registerAlgorithm('ibn-al-haytham-optics', {
            name:        'ابن الهيثم — معالجة الصورة',
            family:      'signal-processing',
            islamicBase: 'كتاب المناظر — أساس علم البصريات والكاميرا',
        });

        this.registerModel('neural-net-basic', {
            name:       'شبكة عصبية أساسية',
            type:       'ml',
            quranRef:   'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
        });
        this.registerModel('quantum-circuit', {
            name:       'دائرة كمية',
            type:       'quantum',
            hpcRequired: true,
        });

        // مجموعات بيانات
        this.addDataset('arabic-nlp-corpus', { name: 'مدونة اللغة العربية NLP', size: '50 GB', openData: true });
        this.addDataset('islamic-heritage-texts', { name: 'نصوص التراث الإسلامي الرقمي', size: '10 GB', openData: true });
    }
}

// ─── ② Astronomy & Astrophysics ──────────────────────────────────────────────

class AstronomyDomain extends ScienceDomain {
    constructor() {
        super('astronomy', 'Astronomy & Astrophysics', 'الفلك والفيزياء الفلكية');
        this._celestialBodies = new Map();
        this._observations    = [];
        this._prayerTimes     = new Map(); // ربط الفلك بمواقيت الصلاة
    }

    registerCelestialBody(id, spec = {}) {
        const body = {
            id,
            name:        spec.name       || id,
            nameArabic:  spec.nameArabic || id,
            type:        spec.type       || 'planet', // star | planet | moon | asteroid | galaxy | nebula
            distanceLy:  spec.distanceLy || 0,
            massSolar:   spec.massSolar  || 0,
            quranMention: spec.quranMention || null,
        };
        this._celestialBodies.set(id, body);
        return body;
    }

    calculatePrayerTimes(lat, lon, date) {
        // حساب أوقات الصلاة الفلكية
        const d = date || new Date();
        const key = `${lat.toFixed(2)},${lon.toFixed(2)},${d.toDateString()}`;

        // In production: use proper astronomical calculation (ephemeris)
        const times = {
            fajr:    '05:12',
            sunrise: '06:34',
            dhuhr:   '12:10',
            asr:     '15:42',
            maghrib: '18:46',
            isha:    '20:06',
            date:    d.toISOString().slice(0, 10),
            location: { lat, lon },
            method:  'UMM_AL_QURA', // طريقة أم القرى
            note:    'هذه المنظومة تربط العلوم الفلكية بالفرائض الدينية',
        };
        this._prayerTimes.set(key, times);
        return times;
    }

    async init() {
        await super.init();

        // الأجرام السماوية المذكورة في القرآن
        this.registerCelestialBody('sun', {
            name:        'Sun',
            nameArabic:  'الشمس',
            type:        'star',
            distanceLy:  0.0000158,
            massSolar:   1,
            quranMention: 'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا — يس:٣٨',
        });
        this.registerCelestialBody('moon', {
            name:        'Moon',
            nameArabic:  'القمر',
            type:        'moon',
            distanceLy:  0.000000122,
            quranMention: 'وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ — يس:٣٩',
        });
        this.registerCelestialBody('milky-way', {
            name:        'Milky Way',
            nameArabic:  'درب التبانة',
            type:        'galaxy',
            quranMention: 'وَالسَّمَاءَ ذَاتِ الْبُرُوجِ — البروج:١',
        });

        this.registerModel('kepler-orbit', {
            name:      'قانون كبلر للمدارات',
            type:      'orbital-mechanics',
            quranRef:  'كُلٌّ فِي فَلَكٍ يَسْبَحُونَ — يس:٤٠',
        });
        this.registerModel('dark-energy', {
            name:      'الطاقة المظلمة وتوسع الكون',
            type:      'cosmology',
            hpcRequired: true,
            quranRef:  'وَإِنَّا لَمُوسِعُونَ — الذاريات:٤٧',
        });
        this.registerModel('gravitational-wave', {
            name:      'أمواج الجاذبية',
            type:      'astrophysics',
            hpcRequired: true,
        });

        // حساب مواقيت الصلاة لمكة المكرمة
        this.calculatePrayerTimes(21.389, 39.857);
        console.log('[astronomy] 🌙 مواقيت الصلاة: مرتبطة بالحسابات الفلكية');
    }
}

// ─── ③ Physics ───────────────────────────────────────────────────────────────

class PhysicsDomain extends ScienceDomain {
    constructor() {
        super('physics', 'Physics', 'الفيزياء النظرية والتطبيقية');
    }

    async init() {
        await super.init();

        this.registerModel('quantum-mechanics', {
            name:       'ميكانيكا الكم',
            type:       'quantum',
            hpcRequired: true,
            quranRef:   'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ — الذاريات:٤٩',
        });
        this.registerModel('general-relativity', {
            name:       'النسبية العامة',
            type:       'relativistic',
            equations:  ['G_μν = 8πG/c⁴ T_μν'],
        });
        this.registerModel('standard-model', {
            name:       'النموذج المعياري للجسيمات',
            type:       'particle-physics',
            hpcRequired: true,
        });
        this.registerModel('nuclear-fusion', {
            name:       'الاندماج النووي للطاقة المدنية',
            type:       'nuclear',
            hpcRequired: true,
        });
        this.registerModel('thermodynamics', {
            name:       'الديناميكا الحرارية',
            type:       'classical',
        });

        this.addDataset('cern-particle-data', { name: 'بيانات CERN الجسيمية', size: '100 TB', openData: true });
    }
}

// ─── ④ Chemistry & Materials ─────────────────────────────────────────────────

class ChemistryDomain extends ScienceDomain {
    constructor() {
        super('chemistry', 'Chemistry & Materials', 'الكيمياء وعلوم المواد');
        this._molecules = new Map();
        this._materials = new Map();
    }

    registerMolecule(id, spec = {}) {
        const mol = {
            id,
            name:         spec.name         || id,
            formula:      spec.formula      || '',
            type:         spec.type         || 'organic',
            islamicOrigin: spec.islamicOrigin || null,
            // أمثلة: الكافور (ذُكر في القرآن)، المسك
        };
        this._molecules.set(id, mol);
        return mol;
    }

    async init() {
        await super.init();

        // مواد ذُكرت في القرآن والسنة
        this.registerMolecule('kafur',     { name: 'الكافور',    formula: 'C10H16O',  islamicOrigin: 'الإنسان:٥' });
        this.registerMolecule('musk',      { name: 'المسك',      formula: 'C16H28O',  islamicOrigin: 'حديث الرائحة' });
        this.registerMolecule('honey',     { name: 'العسل',      formula: 'C12H22O11+', islamicOrigin: 'النحل:٦٩' });
        this.registerMolecule('thymoquinone', { name: 'ثيموكينون الحبة السوداء', formula: 'C10H12O2', islamicOrigin: 'حديث الحبة السوداء' });

        this.registerModel('molecular-dynamics', {
            name:       'ديناميكيات جزيئية',
            type:       'molecular-simulation',
            hpcRequired: true,
        });
        this.registerModel('dft-quantum-chem', {
            name:       'نظرية الكثافة الوظيفية DFT',
            type:       'quantum-chemistry',
            hpcRequired: true,
        });
        this.registerModel('drug-discovery-ai', {
            name:       'اكتشاف الأدوية بالذكاء الصناعي',
            type:       'ai-chemistry',
            hpcRequired: true,
        });

        this.addDataset('pubchem-db', { name: 'قاعدة بيانات PubChem', size: '200 GB', openData: true });
    }
}

// ─── ⑤ Biology & Genomics ────────────────────────────────────────────────────

class BiologyDomain extends ScienceDomain {
    constructor() {
        super('biology', 'Biology & Genomics', 'علم الأحياء والجينوم');
    }

    async init() {
        await super.init();

        this.registerModel('dna-folding', {
            name:       'طيّ البروتين AlphaFold',
            type:       'structural-biology',
            hpcRequired: true,
            quranRef:   'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء:٣٠',
        });
        this.registerModel('crispr-design', {
            name:       'تصميم CRISPR للعلاج الجيني',
            type:       'genetic-engineering',
            hpcRequired: true,
        });
        this.registerModel('systems-biology', {
            name:       'بيولوجيا الأنظمة',
            type:       'systems',
            hpcRequired: true,
        });

        this.addDataset('human-genome-ref', { name: 'الجينوم البشري المرجعي', size: '3 GB', openData: true });
        this.addDataset('saudi-genome-project', { name: 'المشروع السعودي للجينوم', size: '50 TB' });
    }
}

// ─── ⑥ Earth & Climate Sciences ──────────────────────────────────────────────

class EarthScienceDomain extends ScienceDomain {
    constructor() {
        super('earth-science', 'Earth & Climate Sciences', 'علوم الأرض والمناخ');
    }

    async init() {
        await super.init();

        this.registerModel('climate-gcm', {
            name:       'نموذج المناخ العام GCM',
            type:       'climate',
            hpcRequired: true,
            quranRef:   'وَأَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ — الحجر:٢٢',
        });
        this.registerModel('seismic-model', {
            name:       'نمذجة الزلازل',
            type:       'geophysics',
            hpcRequired: true,
        });
        this.registerModel('ocean-circulation', {
            name:       'تيارات المحيطات',
            type:       'oceanography',
            hpcRequired: true,
            quranRef:   'وَهُوَ الَّذِي سَخَّرَ الْبَحْرَ — النحل:١٤',
        });
        this.registerModel('water-cycle', {
            name:       'دورة الماء',
            type:       'hydrology',
            quranRef:   'أَلَمْ تَرَ أَنَّ اللَّهَ أَنزَلَ مِنَ السَّمَاءِ مَاءً — الزمر:٢١',
        });

        this.addDataset('copernicus-climate', { name: 'بيانات كوبرنيكوس المناخية', size: '1 PB', openData: true });
        this.addDataset('usgs-earthquake', { name: 'بيانات الزلازل USGS', size: '5 TB', openData: true });
    }
}

// ─── ⑦ Engineering Sciences ──────────────────────────────────────────────────

class EngineeringDomain extends ScienceDomain {
    constructor() {
        super('engineering', 'Engineering Sciences', 'العلوم الهندسية');
    }

    async init() {
        await super.init();

        this.registerModel('fem-structural', {
            name:       'تحليل العناصر المنتهية FEM',
            type:       'structural-analysis',
            hpcRequired: true,
            quranRef:   'وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ — الأنبياء:٨٠',
        });
        this.registerModel('cfd-fluid', {
            name:       'ديناميكيات الموائع الحسابية CFD',
            type:       'fluid-dynamics',
            hpcRequired: true,
        });
        this.registerModel('power-grid', {
            name:       'الشبكة الكهربائية الذكية',
            type:       'electrical',
        });
        this.registerModel('robotics-kinematics', {
            name:       'كينماتيك الروبوت',
            type:       'robotics',
        });
        this.registerModel('semiconductor-design', {
            name:       'تصميم الدوائر المتكاملة',
            type:       'electronics',
            hpcRequired: true,
        });

        this.addDataset('materials-project', { name: 'قاعدة بيانات المواد', size: '10 GB', openData: true });
    }
}

// ─── ⑧ Artificial Intelligence Science ───────────────────────────────────────

class AIScienceDomain extends ScienceDomain {
    constructor() {
        super('ai-science', 'Artificial Intelligence Science', 'علوم الذكاء الصناعي');
        this._researchAreas = new Map();
    }

    registerResearchArea(id, spec = {}) {
        this._researchAreas.set(id, {
            id,
            name:     spec.name     || id,
            active:   spec.active   || true,
            papers:   [],
            quranRef: spec.quranRef || null,
        });
    }

    async init() {
        await super.init();

        // مجالات البحث في الذكاء الصناعي
        this.registerResearchArea('llm', {
            name:     'نماذج اللغة الضخمة',
            quranRef: 'عَلَّمَهُ الْبَيَانَ — الرحمن:٤',
        });
        this.registerResearchArea('computer-vision', {
            name:     'الرؤية الحاسوبية',
            quranRef: 'أَوَلَمْ يَرَوْا إِلَى مَا خَلَقَ اللَّهُ — الأعراف:١٨٥',
        });
        this.registerResearchArea('reinforcement-learning', { name: 'التعلم المعزَّز' });
        this.registerResearchArea('federated-learning',     { name: 'التعلم الموزع' });
        this.registerResearchArea('explainable-ai',         { name: 'الذكاء الاصطناعي المفسَّر' });
        this.registerResearchArea('arabic-nlp',             {
            name:     'معالجة اللغة العربية',
            quranRef: 'إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا — الزخرف:٣',
        });
        this.registerResearchArea('islamic-ai-ethics', {
            name:     'أخلاقيات الذكاء الصناعي الإسلامي',
            quranRef: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالإِحْسَانِ — النحل:٩٠',
        });

        this.registerModel('transformer-architecture', {
            name:       'معمارية المحوّل Transformer',
            type:       'deep-learning',
            hpcRequired: true,
        });
        this.registerModel('rag-pipeline', {
            name:       'RAG — الاسترجاع المعزَّز للتوليد',
            type:       'retrieval-augmented',
        });
        this.registerModel('multimodal', {
            name:       'الذكاء متعدد الأنماط',
            type:       'multimodal',
            hpcRequired: true,
        });
    }
}

// ─── Sciences Manager ─────────────────────────────────────────────────────────

class SciencesManager {
    constructor() {
        this.domains = {
            cs:          new ComputerScienceDomain(),
            astronomy:   new AstronomyDomain(),
            physics:     new PhysicsDomain(),
            chemistry:   new ChemistryDomain(),
            biology:     new BiologyDomain(),
            earth:       new EarthScienceDomain(),
            engineering: new EngineeringDomain(),
            ai:          new AIScienceDomain(),
        };
        this.heritage      = ISLAMIC_MATH_HERITAGE;
        this.quranBases    = QURAN_SCIENCE_FOUNDATIONS;
        this.verse         = 'سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ حَتَّىٰ يَتَبَيَّنَ لَهُمْ أَنَّهُ الْحَقُّ — فصلت:٥٣';
    }

    getDomain(id) { return this.domains[id] || null; }

    snapshot() {
        const snaps = {};
        Object.entries(this.domains).forEach(([id, d]) => { snaps[id] = d.snapshot(); });
        const totalModels = Object.values(this.domains).reduce((s, d) => s + d._models.size, 0);
        const totalDatasets = Object.values(this.domains).reduce((s, d) => s + d._datasets.size, 0);
        return {
            domains:       Object.keys(this.domains).length,
            totalModels,
            totalDatasets,
            islamicScholars: this.heritage.scholars.length,
            details:       snaps,
        };
    }

    async initAll() {
        console.log('[SCIENCES] 🔬 تهيئة منظومة العلوم الكاملة...');
        console.log('[SCIENCES] 📖 "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" — فصلت:٥٣');
        for (const [id, domain] of Object.entries(this.domains)) {
            await domain.init();
        }
        console.log(`[SCIENCES] ✅ جميع العلوم جاهزة — الفروع: ${Object.keys(this.domains).length}`);
        return this.snapshot();
    }
}

// ─── Export ───────────────────────────────────────────────────────────────────

const sciencesManager = new SciencesManager();

module.exports = {
    QURAN_SCIENCE_FOUNDATIONS,
    ISLAMIC_MATH_HERITAGE,
    ScienceDomain,
    ComputerScienceDomain,
    AstronomyDomain,
    PhysicsDomain,
    ChemistryDomain,
    BiologyDomain,
    EarthScienceDomain,
    EngineeringDomain,
    AIScienceDomain,
    SciencesManager,
    sciences: sciencesManager,
    initAll:  () => sciencesManager.initAll(),
};
