/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SCIENCES, INNOVATION & RESEARCH ENGINE
 * منظومة شيخة للعلوم والابتكار والبحث والاستكشاف والتطوير والمختبرات والتقنية والحوسبة
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ● خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ● اقْرَأْ وَرَبُّكَ الْأَكْرَمُ
 *  الَّذِي عَلَّمَ بِالْقَلَمِ ● عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ" — العلق ١-٥
 *
 * ✅ العلوم الطبيعية (فيزياء، كيمياء، أحياء، فلك، أرض)
 * ✅ العلوم التطبيقية (هندسة، حاسب، طب، صيدلة، زراعة)
 * ✅ العلوم الإنسانية والاجتماعية
 * ✅ العلوم الطبية والصحية
 * ✅ الابتكار وبراءات الاختراع
 * ✅ البحث العلمي والمختبرات
 * ✅ التقنية والحوسبة
 * ✅ الاستكشاف (الفضاء، المحيطات، الأرض)
 * ✅ الرقمنة بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

class ShekhaSciencesEngine {
    constructor() {
        this.name = 'Sheikha Sciences, Innovation & Research Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {

        // ══════════════════════════════════════════════════════════════════
        // آيات وأحاديث العلم والبحث والاستكشاف
        // ══════════════════════════════════════════════════════════════════
        this.quranReferences = [
            { ayah: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ● خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ● اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ● الَّذِي عَلَّمَ بِالْقَلَمِ ● عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ', surah: 'العلق', num: '1-5', topic: 'أول أمر إلهي: القراءة والعلم' },
            { ayah: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', surah: 'الزمر', num: 9, topic: 'فضل العلم والعلماء' },
            { ayah: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', surah: 'المجادلة', num: 11, topic: 'رفعة أهل العلم' },
            { ayah: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', num: 114, topic: 'طلب الزيادة في العلم' },
            { ayah: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ', surah: 'آل عمران', num: 190, topic: 'التفكر في الكون — أساس العلوم الطبيعية' },
            { ayah: 'أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ ● وَإِلَى السَّمَاءِ كَيْفَ رُفِعَتْ ● وَإِلَى الْجِبَالِ كَيْفَ نُصِبَتْ ● وَإِلَى الْأَرْضِ كَيْفَ سُطِحَتْ', surah: 'الغاشية', num: '17-20', topic: 'التأمل العلمي في المخلوقات' },
            { ayah: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا', surah: 'الإسراء', num: 85, topic: 'التواضع العلمي — محدودية المعرفة البشرية' },
            { ayah: 'أَلَمْ تَرَ أَنَّ اللَّهَ أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ ثَمَرَاتٍ مُّخْتَلِفًا أَلْوَانُهَا', surah: 'فاطر', num: 27, topic: 'علم النبات والزراعة' },
            { ayah: 'وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ', surah: 'المؤمنون', num: 12, topic: 'علم الأحياء والأجنة' },
            { ayah: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ أَفَلَا يُؤْمِنُونَ', surah: 'الأنبياء', num: 30, topic: 'علم الأحياء — الماء أساس الحياة' },
            { ayah: 'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ', surah: 'يس', num: 38, topic: 'علم الفلك' },
            { ayah: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ ● وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ', surah: 'الذاريات', num: '20-21', topic: 'علوم الأرض والإنسان' },
            { ayah: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', surah: 'البقرة', num: 31, topic: 'أصل العلم — تعليم الله لآدم' },
            { ayah: 'وَلَقَدْ آتَيْنَا دَاوُودَ وَسُلَيْمَانَ عِلْمًا', surah: 'النمل', num: 15, topic: 'العلم نعمة من الله' },
            { ayah: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ', surah: 'الجاثية', num: 13, topic: 'تسخير الكون للإنسان — أساس التقنية' }
        ];

        this.hadithReferences = [
            { hadith: 'من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة', narrator: 'مسلم', topic: 'فضل طلب العلم' },
            { hadith: 'اطلبوا العلم ولو في الصين', narrator: 'ضعيف لكن معناه صحيح', topic: 'السفر في طلب العلم' },
            { hadith: 'إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية أو علم ينتفع به أو ولد صالح يدعو له', narrator: 'مسلم', topic: 'العلم النافع صدقة جارية' },
            { hadith: 'أنتم أعلم بأمور دنياكم', narrator: 'مسلم', topic: 'فضل العلوم الدنيوية والتطبيقية' },
            { hadith: 'الحكمة ضالة المؤمن أنى وجدها فهو أحق الناس بها', narrator: 'الترمذي', topic: 'طلب الحكمة والعلم من أي مصدر' },
            { hadith: 'إن الله لا يقبض العلم انتزاعاً ينتزعه من العباد ولكن يقبض العلم بقبض العلماء', narrator: 'البخاري ومسلم', topic: 'حفظ العلم والعلماء' }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ١. العلوم الطبيعية — Natural Sciences
        // ══════════════════════════════════════════════════════════════════
        this.naturalSciences = {
            nameAr: 'العلوم الطبيعية',
            nameEn: 'Natural Sciences',
            quranRef: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ — آل عمران ١٩٠',
            branches: [
                {
                    nameAr: 'الفيزياء',
                    nameEn: 'Physics',
                    subBranches: [
                        { nameAr: 'الميكانيكا الكلاسيكية', nameEn: 'Classical Mechanics' },
                        { nameAr: 'الديناميكا الحرارية', nameEn: 'Thermodynamics' },
                        { nameAr: 'الكهرومغناطيسية', nameEn: 'Electromagnetism' },
                        { nameAr: 'ميكانيكا الكم', nameEn: 'Quantum Mechanics' },
                        { nameAr: 'النسبية', nameEn: 'Relativity' },
                        { nameAr: 'فيزياء الجسيمات', nameEn: 'Particle Physics' },
                        { nameAr: 'فيزياء المادة المكثفة', nameEn: 'Condensed Matter Physics' },
                        { nameAr: 'فيزياء البلازما', nameEn: 'Plasma Physics' },
                        { nameAr: 'البصريات', nameEn: 'Optics' },
                        { nameAr: 'الصوتيات', nameEn: 'Acoustics' },
                        { nameAr: 'الفيزياء النووية', nameEn: 'Nuclear Physics' },
                        { nameAr: 'الفيزياء الفلكية', nameEn: 'Astrophysics' },
                        { nameAr: 'فيزياء الحوسبة الكمية', nameEn: 'Quantum Computing Physics' }
                    ],
                    pioneers: ['ابن الهيثم (البصريات)', 'نيوتن', 'أينشتاين', 'ماكس بلانك', 'فاينمان'],
                    applications: ['طاقة نووية', 'ليزر', 'أشباه موصلات', 'تصوير طبي', 'GPS', 'حوسبة كمية']
                },
                {
                    nameAr: 'الكيمياء',
                    nameEn: 'Chemistry',
                    subBranches: [
                        { nameAr: 'الكيمياء العضوية', nameEn: 'Organic Chemistry' },
                        { nameAr: 'الكيمياء غير العضوية', nameEn: 'Inorganic Chemistry' },
                        { nameAr: 'الكيمياء الفيزيائية', nameEn: 'Physical Chemistry' },
                        { nameAr: 'الكيمياء التحليلية', nameEn: 'Analytical Chemistry' },
                        { nameAr: 'الكيمياء الحيوية', nameEn: 'Biochemistry' },
                        { nameAr: 'كيمياء البوليمرات', nameEn: 'Polymer Chemistry' },
                        { nameAr: 'الكيمياء الصناعية', nameEn: 'Industrial Chemistry' },
                        { nameAr: 'الكيمياء البيئية', nameEn: 'Environmental Chemistry' },
                        { nameAr: 'كيمياء النانو', nameEn: 'Nanochemistry' },
                        { nameAr: 'الكيمياء الحاسوبية', nameEn: 'Computational Chemistry' }
                    ],
                    pioneers: ['جابر بن حيان (أبو الكيمياء)', 'الرازي', 'لافوازييه', 'مندلييف', 'ماري كوري'],
                    applications: ['أدوية', 'بتروكيماويات', 'أسمدة', 'بلاستيك', 'تحلية مياه', 'بطاريات']
                },
                {
                    nameAr: 'علم الأحياء',
                    nameEn: 'Biology',
                    subBranches: [
                        { nameAr: 'علم الخلية', nameEn: 'Cell Biology' },
                        { nameAr: 'علم الوراثة', nameEn: 'Genetics' },
                        { nameAr: 'علم الأحياء الجزيئي', nameEn: 'Molecular Biology' },
                        { nameAr: 'علم البيئة', nameEn: 'Ecology' },
                        { nameAr: 'علم النبات', nameEn: 'Botany' },
                        { nameAr: 'علم الحيوان', nameEn: 'Zoology' },
                        { nameAr: 'علم الأحياء الدقيقة', nameEn: 'Microbiology' },
                        { nameAr: 'علم الأحياء البحرية', nameEn: 'Marine Biology' },
                        { nameAr: 'علم الأعصاب', nameEn: 'Neuroscience' },
                        { nameAr: 'علم المناعة', nameEn: 'Immunology' },
                        { nameAr: 'علم الجينوم', nameEn: 'Genomics' },
                        { nameAr: 'علم الأجنة', nameEn: 'Embryology' },
                        { nameAr: 'المعلوماتية الحيوية', nameEn: 'Bioinformatics' }
                    ],
                    pioneers: ['الجاحظ', 'ابن سينا', 'داروين', 'مندل', 'واطسون وكريك'],
                    applications: ['أدوية حيوية', 'هندسة وراثية', 'حفظ التنوع البيولوجي', 'زراعة أنسجة']
                },
                {
                    nameAr: 'علم الفلك والفضاء',
                    nameEn: 'Astronomy & Space Science',
                    subBranches: [
                        { nameAr: 'علم الفلك الرصدي', nameEn: 'Observational Astronomy' },
                        { nameAr: 'الفيزياء الفلكية', nameEn: 'Astrophysics' },
                        { nameAr: 'علم الكونيات', nameEn: 'Cosmology' },
                        { nameAr: 'علم الكواكب', nameEn: 'Planetary Science' },
                        { nameAr: 'ميكانيكا المدارات', nameEn: 'Orbital Mechanics' },
                        { nameAr: 'علم الفلك الراديوي', nameEn: 'Radio Astronomy' },
                        { nameAr: 'علم الأحياء الفلكي', nameEn: 'Astrobiology' },
                        { nameAr: 'هندسة الفضاء', nameEn: 'Aerospace Engineering' }
                    ],
                    pioneers: ['البتاني', 'الصوفي', 'البيروني', 'كوبرنيكوس', 'كبلر', 'هابل'],
                    saudiInitiatives: ['الهيئة السعودية للفضاء', 'برنامج رواد الفضاء السعودي', 'نيوم — مدينة ذكية'],
                    applications: ['أقمار صناعية', 'اتصالات فضائية', 'GPS', 'استكشاف المريخ', 'سياحة فضائية']
                },
                {
                    nameAr: 'علوم الأرض',
                    nameEn: 'Earth Sciences',
                    subBranches: [
                        { nameAr: 'الجيولوجيا', nameEn: 'Geology' },
                        { nameAr: 'علم المعادن', nameEn: 'Mineralogy' },
                        { nameAr: 'علم المناخ', nameEn: 'Climatology' },
                        { nameAr: 'علم الأرصاد الجوية', nameEn: 'Meteorology' },
                        { nameAr: 'علم المحيطات', nameEn: 'Oceanography' },
                        { nameAr: 'علم الزلازل', nameEn: 'Seismology' },
                        { nameAr: 'علم البراكين', nameEn: 'Volcanology' },
                        { nameAr: 'الجيوفيزياء', nameEn: 'Geophysics' },
                        { nameAr: 'علم الهيدرولوجيا', nameEn: 'Hydrology' },
                        { nameAr: 'علم الحفريات', nameEn: 'Paleontology' }
                    ],
                    pioneers: ['البيروني', 'ابن سينا (المعادن)', 'هتون', 'فيجنر'],
                    applications: ['تعدين', 'نفط وغاز', 'تنبؤ بالزلازل', 'إدارة مياه', 'بيئة']
                },
                {
                    nameAr: 'الرياضيات',
                    nameEn: 'Mathematics',
                    subBranches: [
                        { nameAr: 'الجبر', nameEn: 'Algebra' },
                        { nameAr: 'التحليل الرياضي', nameEn: 'Mathematical Analysis' },
                        { nameAr: 'الهندسة الرياضية', nameEn: 'Geometry' },
                        { nameAr: 'نظرية الأعداد', nameEn: 'Number Theory' },
                        { nameAr: 'الاحتمالات والإحصاء', nameEn: 'Probability & Statistics' },
                        { nameAr: 'المعادلات التفاضلية', nameEn: 'Differential Equations' },
                        { nameAr: 'الطوبولوجيا', nameEn: 'Topology' },
                        { nameAr: 'الرياضيات المنفصلة', nameEn: 'Discrete Mathematics' },
                        { nameAr: 'الرياضيات التطبيقية', nameEn: 'Applied Mathematics' },
                        { nameAr: 'المنطق الرياضي', nameEn: 'Mathematical Logic' },
                        { nameAr: 'نظرية الرسوم البيانية', nameEn: 'Graph Theory' },
                        { nameAr: 'التحليل العددي', nameEn: 'Numerical Analysis' },
                        { nameAr: 'التحسين الرياضي', nameEn: 'Optimization' }
                    ],
                    pioneers: ['الخوارزمي (أبو الجبر)', 'عمر الخيام', 'ثابت بن قرة', 'إقليدس', 'غاوس', 'أويلر', 'ريمان'],
                    applications: ['تشفير', 'ذكاء اصطناعي', 'هندسة مالية', 'فيزياء نظرية', 'ملاحة']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٢. العلوم التطبيقية والهندسية — Applied & Engineering Sciences
        // ══════════════════════════════════════════════════════════════════
        this.appliedSciences = {
            nameAr: 'العلوم التطبيقية والهندسية',
            nameEn: 'Applied & Engineering Sciences',
            quranRef: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ — الجاثية ١٣',
            branches: [
                {
                    nameAr: 'هندسة الحاسب وعلومه',
                    nameEn: 'Computer Science & Engineering',
                    subBranches: [
                        { nameAr: 'هندسة البرمجيات', nameEn: 'Software Engineering' },
                        { nameAr: 'علوم الحاسب', nameEn: 'Computer Science' },
                        { nameAr: 'هندسة الحاسب', nameEn: 'Computer Engineering' },
                        { nameAr: 'الذكاء الاصطناعي', nameEn: 'Artificial Intelligence' },
                        { nameAr: 'تعلم الآلة', nameEn: 'Machine Learning' },
                        { nameAr: 'التعلم العميق', nameEn: 'Deep Learning' },
                        { nameAr: 'معالجة اللغات الطبيعية', nameEn: 'NLP' },
                        { nameAr: 'الرؤية الحاسوبية', nameEn: 'Computer Vision' },
                        { nameAr: 'الروبوتات', nameEn: 'Robotics' },
                        { nameAr: 'الأمن السيبراني', nameEn: 'Cybersecurity' },
                        { nameAr: 'الحوسبة السحابية', nameEn: 'Cloud Computing' },
                        { nameAr: 'الحوسبة الكمية', nameEn: 'Quantum Computing' },
                        { nameAr: 'إنترنت الأشياء', nameEn: 'IoT' },
                        { nameAr: 'سلسلة الكتل', nameEn: 'Blockchain' },
                        { nameAr: 'هندسة البيانات', nameEn: 'Data Engineering' },
                        { nameAr: 'علم البيانات', nameEn: 'Data Science' },
                        { nameAr: 'الشبكات والاتصالات', nameEn: 'Networking & Telecom' },
                        { nameAr: 'أنظمة التشغيل', nameEn: 'Operating Systems' },
                        { nameAr: 'قواعد البيانات', nameEn: 'Databases' },
                        { nameAr: 'الحوسبة المتوازية والموزعة', nameEn: 'Parallel & Distributed Computing' },
                        { nameAr: 'التفاعل بين الإنسان والحاسب', nameEn: 'HCI' },
                        { nameAr: 'الواقع الافتراضي والمعزز', nameEn: 'VR/AR' },
                        { nameAr: 'الميتافيرس', nameEn: 'Metaverse Technologies' }
                    ],
                    pioneers: ['الخوارزمي (الخوارزميات)', 'تورنغ', 'فون نويمان', 'ديكسترا', 'بيرنرز لي'],
                    programmingParadigms: ['برمجة كائنية', 'برمجة وظيفية', 'برمجة إجرائية', 'برمجة تفاعلية', 'برمجة منطقية'],
                    languages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C/C++', 'Rust', 'Go', 'Swift', 'Kotlin', 'SQL', 'R'],
                    saudiInitiatives: ['SDAIA', 'NCA', 'هيئة الحكومة الرقمية', 'وادي التقنية', 'NEOM Tech']
                },
                {
                    nameAr: 'الهندسة الكهربائية والإلكترونية',
                    nameEn: 'Electrical & Electronic Engineering',
                    subBranches: [
                        { nameAr: 'إلكترونيات', nameEn: 'Electronics' },
                        { nameAr: 'هندسة الطاقة', nameEn: 'Power Engineering' },
                        { nameAr: 'معالجة الإشارات', nameEn: 'Signal Processing' },
                        { nameAr: 'أنظمة التحكم', nameEn: 'Control Systems' },
                        { nameAr: 'هندسة الاتصالات', nameEn: 'Telecommunications' },
                        { nameAr: 'أشباه الموصلات', nameEn: 'Semiconductors' },
                        { nameAr: 'أنظمة مدمجة', nameEn: 'Embedded Systems' },
                        { nameAr: 'تصميم الدوائر المتكاملة', nameEn: 'VLSI Design' }
                    ]
                },
                {
                    nameAr: 'الهندسة الميكانيكية',
                    nameEn: 'Mechanical Engineering',
                    subBranches: [
                        { nameAr: 'ميكانيكا المواد', nameEn: 'Mechanics of Materials' },
                        { nameAr: 'ديناميكا الموائع', nameEn: 'Fluid Dynamics' },
                        { nameAr: 'انتقال الحرارة', nameEn: 'Heat Transfer' },
                        { nameAr: 'التصميم الميكانيكي', nameEn: 'Mechanical Design' },
                        { nameAr: 'هندسة التصنيع', nameEn: 'Manufacturing Engineering' },
                        { nameAr: 'الميكاترونكس', nameEn: 'Mechatronics' },
                        { nameAr: 'هندسة السيارات', nameEn: 'Automotive Engineering' },
                        { nameAr: 'هندسة الفضاء', nameEn: 'Aerospace Engineering' }
                    ]
                },
                {
                    nameAr: 'الهندسة المدنية والمعمارية',
                    nameEn: 'Civil & Architectural Engineering',
                    subBranches: [
                        { nameAr: 'هندسة الإنشاءات', nameEn: 'Structural Engineering' },
                        { nameAr: 'هندسة التربة', nameEn: 'Geotechnical Engineering' },
                        { nameAr: 'هندسة النقل', nameEn: 'Transportation Engineering' },
                        { nameAr: 'هندسة المياه', nameEn: 'Water Resources Engineering' },
                        { nameAr: 'هندسة البيئة', nameEn: 'Environmental Engineering' },
                        { nameAr: 'العمارة', nameEn: 'Architecture' },
                        { nameAr: 'العمارة الإسلامية', nameEn: 'Islamic Architecture' },
                        { nameAr: 'التخطيط الحضري', nameEn: 'Urban Planning' }
                    ]
                },
                {
                    nameAr: 'الهندسة الكيميائية',
                    nameEn: 'Chemical Engineering',
                    subBranches: [
                        { nameAr: 'هندسة البتروكيماويات', nameEn: 'Petrochemical Engineering' },
                        { nameAr: 'هندسة التآكل', nameEn: 'Corrosion Engineering' },
                        { nameAr: 'هندسة المعالجة', nameEn: 'Process Engineering' },
                        { nameAr: 'هندسة المواد', nameEn: 'Materials Engineering' },
                        { nameAr: 'تقنية النانو', nameEn: 'Nanotechnology' },
                        { nameAr: 'هندسة التحلية', nameEn: 'Desalination Engineering' }
                    ]
                },
                {
                    nameAr: 'هندسة الطاقة والطاقة المتجددة',
                    nameEn: 'Energy & Renewable Energy Engineering',
                    subBranches: [
                        { nameAr: 'الطاقة الشمسية', nameEn: 'Solar Energy' },
                        { nameAr: 'طاقة الرياح', nameEn: 'Wind Energy' },
                        { nameAr: 'الطاقة النووية', nameEn: 'Nuclear Energy' },
                        { nameAr: 'الهيدروجين الأخضر', nameEn: 'Green Hydrogen' },
                        { nameAr: 'هندسة البترول', nameEn: 'Petroleum Engineering' },
                        { nameAr: 'شبكات الطاقة الذكية', nameEn: 'Smart Grids' }
                    ],
                    saudiInitiatives: ['نيوم', 'مشروع سكاكا للطاقة الشمسية', 'رؤية 2030 الطاقة النظيفة']
                },
                {
                    nameAr: 'الهندسة الزراعية وعلوم الغذاء',
                    nameEn: 'Agricultural & Food Science Engineering',
                    subBranches: [
                        { nameAr: 'هندسة الري', nameEn: 'Irrigation Engineering' },
                        { nameAr: 'علوم التربة', nameEn: 'Soil Science' },
                        { nameAr: 'تقنية الغذاء', nameEn: 'Food Technology' },
                        { nameAr: 'الزراعة الذكية', nameEn: 'Smart Agriculture' },
                        { nameAr: 'الزراعة المائية', nameEn: 'Hydroponics' },
                        { nameAr: 'الأمن الغذائي', nameEn: 'Food Security' },
                        { nameAr: 'حلال فود تك', nameEn: 'Halal FoodTech' }
                    ]
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٣. العلوم الطبية والصحية — Medical & Health Sciences
        // ══════════════════════════════════════════════════════════════════
        this.medicalSciences = {
            nameAr: 'العلوم الطبية والصحية',
            nameEn: 'Medical & Health Sciences',
            quranRef: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ — الشعراء ٨٠',
            branches: [
                {
                    nameAr: 'الطب البشري',
                    nameEn: 'Medicine',
                    specialties: [
                        'طب باطني', 'جراحة عامة', 'طب أطفال', 'نساء وتوليد', 'طب قلب', 'طب أعصاب',
                        'أورام', 'عظام', 'مسالك بولية', 'جلدية', 'عيون', 'أنف وأذن وحنجرة',
                        'طب نفسي', 'طب طوارئ', 'تخدير', 'أشعة', 'طب مخبري', 'طب وراثي',
                        'طب رياضي', 'طب الأسنان', 'طب نووي', 'طب المسنين'
                    ],
                    pioneers: ['ابن سينا (القانون في الطب)', 'الرازي', 'ابن النفيس (الدورة الدموية الصغرى)', 'الزهراوي (أبو الجراحة)']
                },
                {
                    nameAr: 'الصيدلة',
                    nameEn: 'Pharmacy',
                    subBranches: ['صيدلة إكلينيكية', 'صيدلة صناعية', 'علم الأدوية', 'علم السموم', 'صيدلة المستشفيات', 'طب أعشاب إسلامي'],
                    pioneers: ['جابر بن حيان', 'الرازي', 'ابن البيطار']
                },
                {
                    nameAr: 'التمريض والعلوم الصحية',
                    nameEn: 'Nursing & Health Sciences',
                    subBranches: ['تمريض', 'علاج طبيعي', 'علاج وظيفي', 'تغذية علاجية', 'صحة عامة', 'وبائيات', 'إدارة صحية', 'تقنية مختبرات']
                },
                {
                    nameAr: 'الطب الحيوي والتقنيات الحيوية',
                    nameEn: 'Biomedical & Biotechnology',
                    subBranches: [
                        { nameAr: 'هندسة طبية حيوية', nameEn: 'Biomedical Engineering' },
                        { nameAr: 'تقنية حيوية', nameEn: 'Biotechnology' },
                        { nameAr: 'هندسة الأنسجة', nameEn: 'Tissue Engineering' },
                        { nameAr: 'طب تجديدي', nameEn: 'Regenerative Medicine' },
                        { nameAr: 'علم الجينوم', nameEn: 'Genomics' },
                        { nameAr: 'طب دقيق (شخصي)', nameEn: 'Precision Medicine' },
                        { nameAr: 'ذكاء اصطناعي طبي', nameEn: 'Medical AI' },
                        { nameAr: 'روبوتات جراحية', nameEn: 'Surgical Robotics' },
                        { nameAr: 'طب عن بُعد', nameEn: 'Telemedicine' },
                        { nameAr: 'أجهزة طبية ذكية', nameEn: 'Smart Medical Devices' }
                    ]
                },
                {
                    nameAr: 'الطب النبوي والعلاج بالقرآن',
                    nameEn: 'Prophetic Medicine & Quran Healing',
                    aspects: [
                        { nameAr: 'العسل', evidence: 'يَخْرُجُ مِن بُطُونِهَا شَرَابٌ مُّخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِّلنَّاسِ — النحل ٦٩' },
                        { nameAr: 'الحبة السوداء', evidence: 'في الحبة السوداء شفاء من كل داء إلا السام — البخاري' },
                        { nameAr: 'الحجامة', evidence: 'إن أمثل ما تداويتم به الحجامة — البخاري' },
                        { nameAr: 'زمزم', evidence: 'ماء زمزم لما شُرب له — ابن ماجه' },
                        { nameAr: 'التمر', evidence: 'من تصبح كل يوم سبع تمرات عجوة — البخاري' },
                        { nameAr: 'الرقية الشرعية', evidence: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ — الإسراء ٨٢' }
                    ],
                    note: 'الطب النبوي مكمّل وليس بديلاً عن الطب الحديث'
                }
            ],
            saudiHealthSystem: {
                regulators: ['وزارة الصحة', 'هيئة الغذاء والدواء (SFDA)', 'المجلس الصحي السعودي'],
                institutions: ['مستشفى الملك فيصل التخصصي', 'مدينة الملك عبدالعزيز الطبية', 'مدينة الملك فهد الطبية'],
                initiatives: ['رؤية 2030 — جودة الحياة', 'التحول الصحي', 'الطب الدقيق السعودي', 'المشروع السعودي للجينوم']
            }
        };

        // ══════════════════════════════════════════════════════════════════
        // ٤. العلوم الإنسانية والاجتماعية — Humanities & Social Sciences
        // ══════════════════════════════════════════════════════════════════
        this.humanSciences = {
            nameAr: 'العلوم الإنسانية والاجتماعية',
            nameEn: 'Humanities & Social Sciences',
            quranRef: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ — الحجرات ١٣',
            branches: [
                {
                    nameAr: 'علم الاقتصاد',
                    nameEn: 'Economics',
                    subBranches: ['اقتصاد كلي', 'اقتصاد جزئي', 'اقتصاد إسلامي', 'اقتصاد تنمية', 'اقتصاد قياسي', 'اقتصاد سلوكي', 'اقتصاد رقمي', 'اقتصاد بيئي']
                },
                {
                    nameAr: 'علم الاجتماع',
                    nameEn: 'Sociology',
                    subBranches: ['علم اجتماع حضري', 'علم اجتماع ريفي', 'علم اجتماع ديني', 'علم اجتماع المعرفة', 'علم اجتماع سياسي', 'علم اجتماع رقمي']
                },
                {
                    nameAr: 'علم النفس',
                    nameEn: 'Psychology',
                    subBranches: ['علم نفس عام', 'علم نفس إكلينيكي', 'علم نفس تربوي', 'علم نفس صناعي', 'علم نفس اجتماعي', 'علم نفس معرفي', 'علم نفس إسلامي', 'علم نفس إيجابي']
                },
                {
                    nameAr: 'العلوم السياسية',
                    nameEn: 'Political Science',
                    subBranches: ['نظرية سياسية', 'سياسة مقارنة', 'علاقات دولية', 'سياسة عامة', 'أمن دولي', 'حوكمة', 'نظام الشورى في الإسلام']
                },
                {
                    nameAr: 'القانون والأنظمة',
                    nameEn: 'Law & Legal Studies',
                    subBranches: ['القانون الدولي', 'القانون التجاري', 'قانون الشركات', 'قانون التقنية', 'الفقه الإسلامي المقارن', 'أنظمة سعودية', 'قانون الملكية الفكرية']
                },
                {
                    nameAr: 'إدارة الأعمال',
                    nameEn: 'Business Administration',
                    subBranches: ['إدارة استراتيجية', 'تسويق', 'مالية', 'موارد بشرية', 'سلاسل إمداد', 'ريادة أعمال', 'إدارة مشاريع', 'إدارة جودة', 'إدارة إسلامية']
                },
                {
                    nameAr: 'التربية والتعليم',
                    nameEn: 'Education',
                    subBranches: ['مناهج وطرق تدريس', 'تقنيات تعليم', 'تعليم إلكتروني', 'تعليم خاص', 'إدارة تربوية', 'رياض أطفال', 'تعليم مستمر', 'تعليم إسلامي']
                },
                {
                    nameAr: 'اللغويات والأدب',
                    nameEn: 'Linguistics & Literature',
                    subBranches: ['اللغة العربية', 'علم اللغة', 'الأدب العربي', 'الأدب المقارن', 'الترجمة', 'معالجة اللغات الطبيعية', 'علم الصوتيات اللغوية', 'البلاغة']
                },
                {
                    nameAr: 'التاريخ والحضارة',
                    nameEn: 'History & Civilization',
                    subBranches: ['التاريخ الإسلامي', 'تاريخ الحضارات', 'تاريخ العلوم', 'تاريخ سعودي', 'آثار', 'أنثروبولوجيا', 'تاريخ اقتصادي']
                },
                {
                    nameAr: 'الفلسفة والمنطق',
                    nameEn: 'Philosophy & Logic',
                    subBranches: ['فلسفة إسلامية', 'منطق صوري', 'فلسفة العلم', 'فلسفة الأخلاق', 'فلسفة اللغة', 'نظرية المعرفة (إبستمولوجيا)']
                },
                {
                    nameAr: 'الإعلام والاتصال',
                    nameEn: 'Media & Communication',
                    subBranches: ['إعلام رقمي', 'صحافة', 'علاقات عامة', 'إنتاج مرئي', 'إعلام إسلامي', 'تحليل محتوى']
                },
                {
                    nameAr: 'الجغرافيا',
                    nameEn: 'Geography',
                    subBranches: ['جغرافيا طبيعية', 'جغرافيا بشرية', 'نظم معلومات جغرافية GIS', 'استشعار عن بعد', 'جغرافيا اقتصادية']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٥. التقنية والحوسبة (تفصيلي) — Technology & Computing (Detailed)
        // ══════════════════════════════════════════════════════════════════
        this.technologyAndComputing = {
            nameAr: 'التقنية والحوسبة',
            nameEn: 'Technology & Computing',
            quranRef: 'الَّذِي عَلَّمَ بِالْقَلَمِ — العلق ٤',
            domains: [
                {
                    nameAr: 'الذكاء الاصطناعي والتعلم الآلي',
                    nameEn: 'AI & Machine Learning',
                    topics: ['الشبكات العصبية', 'التعلم المعزز', 'نماذج التأسيس (Foundation Models)', 'الذكاء الاصطناعي التوليدي', 'أنظمة التوصية', 'رؤية حاسوبية', 'NLP العربي', 'AGI', 'AI Ethics (أخلاقيات إسلامية)']
                },
                {
                    nameAr: 'الحوسبة السحابية والبنية التحتية',
                    nameEn: 'Cloud Computing & Infrastructure',
                    topics: ['IaaS / PaaS / SaaS', 'حاويات (Docker/K8s)', 'Serverless', 'DevOps/MLOps', 'مراكز بيانات', 'حوسبة حافة (Edge)'],
                    providers: ['AWS', 'Azure', 'Google Cloud', 'Alibaba Cloud', 'Oracle Cloud', 'Saudi Cloud (STC/Mobily)']
                },
                {
                    nameAr: 'الأمن السيبراني',
                    nameEn: 'Cybersecurity',
                    topics: ['تشفير', 'اختبار اختراق', 'أمن شبكات', 'أمن تطبيقات', 'أمن سحابي', 'استجابة حوادث', 'حوكمة أمنية', 'أمن OT/IoT'],
                    saudiBodies: ['الهيئة الوطنية للأمن السيبراني (NCA)', 'الاتحاد السعودي للأمن السيبراني']
                },
                {
                    nameAr: 'تقنية البلوكتشين والويب 3.0',
                    nameEn: 'Blockchain & Web3',
                    topics: ['العقود الذكية', 'DeFi إسلامي', 'NFTs', 'DAOs', 'عملات رقمية', 'محافظ رقمية', 'تتبع سلاسل إمداد']
                },
                {
                    nameAr: 'الحوسبة الكمية',
                    nameEn: 'Quantum Computing',
                    topics: ['كيوبت', 'خوارزميات كمية', 'تشفير ما بعد الكم', 'محاكاة كمية', 'التعلم الآلي الكمي'],
                    leaders: ['IBM Quantum', 'Google Quantum AI', 'Microsoft Azure Quantum']
                },
                {
                    nameAr: 'إنترنت الأشياء والأنظمة المدمجة',
                    nameEn: 'IoT & Embedded Systems',
                    topics: ['حساسات', 'بروتوكولات IoT (MQTT, CoAP)', 'أنظمة مدمجة', 'IoT صناعي', 'مدن ذكية', 'زراعة ذكية IoT']
                },
                {
                    nameAr: 'الواقع الافتراضي والمعزز والميتافيرس',
                    nameEn: 'VR/AR & Metaverse',
                    topics: ['محركات ثلاثية الأبعاد', 'تتبع حركة', 'تقنيات هابتيك', 'تجارب غامرة', 'تعليم افتراضي', 'تسوق افتراضي', 'حج وعمرة افتراضي']
                },
                {
                    nameAr: 'الروبوتات والأتمتة',
                    nameEn: 'Robotics & Automation',
                    topics: ['روبوتات صناعية', 'روبوتات خدمية', 'مركبات ذاتية القيادة', 'طائرات بدون طيار', 'روبوتات طبية', 'RPA (أتمتة عمليات)', 'كوبوت (تعاونية)']
                },
                {
                    nameAr: 'علم البيانات والتحليلات',
                    nameEn: 'Data Science & Analytics',
                    topics: ['هندسة بيانات', 'تحليل بيانات ضخمة', 'تصور بيانات', 'مستودعات بيانات', 'بحيرات بيانات', 'حوكمة بيانات', 'خصوصية بيانات (إسلامية)']
                },
                {
                    nameAr: 'الاتصالات والشبكات',
                    nameEn: 'Telecommunications & Networks',
                    topics: ['5G / 6G', 'شبكات ألياف ضوئية', 'اتصالات فضائية', 'شبكات SD-WAN', 'Li-Fi', 'اتصالات كمية']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٦. الابتكار وبراءات الاختراع — Innovation & Patents
        // ══════════════════════════════════════════════════════════════════
        this.innovation = {
            nameAr: 'الابتكار وبراءات الاختراع',
            nameEn: 'Innovation & Intellectual Property',
            quranRef: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا — البقرة ٣١',
            innovationFramework: {
                stages: [
                    { nameAr: 'الفكرة', nameEn: 'Ideation', tools: ['عصف ذهني', 'تفكير تصميمي', 'TRIZ', 'SCAMPER'] },
                    { nameAr: 'البحث والتحقق', nameEn: 'Research & Validation', tools: ['بحث سوقي', 'نموذج أولي', 'MVP', 'اختبار A/B'] },
                    { nameAr: 'التطوير', nameEn: 'Development', tools: ['Agile', 'Lean', 'Stage-Gate', 'Design Sprint'] },
                    { nameAr: 'حماية الملكية الفكرية', nameEn: 'IP Protection', tools: ['براءة اختراع', 'علامة تجارية', 'حق مؤلف', 'سر تجاري'] },
                    { nameAr: 'التسويق والإطلاق', nameEn: 'Go-to-Market', tools: ['Product-Market Fit', 'تسعير', 'قنوات توزيع'] },
                    { nameAr: 'التوسع', nameEn: 'Scaling', tools: ['نمو عضوي', 'شراكات', 'تمويل', 'دولي'] }
                ],
                types: [
                    { nameAr: 'ابتكار منتج', nameEn: 'Product Innovation' },
                    { nameAr: 'ابتكار عملية', nameEn: 'Process Innovation' },
                    { nameAr: 'ابتكار نموذج أعمال', nameEn: 'Business Model Innovation' },
                    { nameAr: 'ابتكار تقني', nameEn: 'Technological Innovation' },
                    { nameAr: 'ابتكار اجتماعي', nameEn: 'Social Innovation' },
                    { nameAr: 'ابتكار مفتوح', nameEn: 'Open Innovation' },
                    { nameAr: 'ابتكار مستدام', nameEn: 'Sustainable Innovation' },
                    { nameAr: 'ابتكار تخريبي', nameEn: 'Disruptive Innovation' }
                ]
            },
            intellectualProperty: {
                types: [
                    { nameAr: 'براءة اختراع', nameEn: 'Patent', duration: '20 سنة', office: 'الهيئة السعودية للملكية الفكرية (SAIP)' },
                    { nameAr: 'علامة تجارية', nameEn: 'Trademark', duration: '10 سنوات (قابلة للتجديد)', office: 'SAIP' },
                    { nameAr: 'حق المؤلف', nameEn: 'Copyright', duration: 'حياة المؤلف + 50 سنة', office: 'SAIP' },
                    { nameAr: 'نموذج صناعي', nameEn: 'Industrial Design', duration: '15 سنة', office: 'SAIP' },
                    { nameAr: 'تصميم دوائر متكاملة', nameEn: 'Layout Design', duration: '10 سنوات', office: 'SAIP' },
                    { nameAr: 'أسرار تجارية', nameEn: 'Trade Secrets', duration: 'غير محدد', office: 'حماية ذاتية' },
                    { nameAr: 'أصناف نباتية', nameEn: 'Plant Varieties', duration: '20 سنة', office: 'SAIP' }
                ],
                islamicView: 'حقوق الملكية الفكرية محفوظة في الإسلام ضمن حق الانتفاع وعدم الضرر، والعلم النافع يُحمى ويُشجع نشره',
                globalBodies: ['WIPO', 'EPO', 'USPTO', 'JPO', 'KIPO']
            },
            saudiInnovationEcosystem: {
                entities: [
                    { name: 'الهيئة السعودية للملكية الفكرية (SAIP)', role: 'حماية الملكية الفكرية' },
                    { name: 'مدينة الملك عبدالعزيز للعلوم والتقنية (KACST)', role: 'بحث وتطوير وطني' },
                    { name: 'KAUST', role: 'بحث علمي متقدم' },
                    { name: 'SDAIA', role: 'بيانات وذكاء اصطناعي' },
                    { name: 'وادي الرياض للتقنية', role: 'حاضنة تقنية' },
                    { name: 'بادر (BADIR)', role: 'حاضنة شركات تقنية ناشئة' },
                    { name: 'منشآت (Monsha\'at)', role: 'دعم المنشآت الصغيرة والابتكار' },
                    { name: 'مسك الخيرية', role: 'تمكين الشباب والابتكار' },
                    { name: 'نيوم (NEOM)', role: 'مدينة مبتكرة' }
                ],
                goals2030: ['50 براءة اختراع لكل مليون نسمة', 'ضمن أفضل 15 دولة ابتكاراً', '20% من الناتج في الاقتصاد الرقمي']
            }
        };

        // ══════════════════════════════════════════════════════════════════
        // ٧. البحث العلمي والمختبرات — Research & Laboratories
        // ══════════════════════════════════════════════════════════════════
        this.research = {
            nameAr: 'البحث العلمي والمختبرات',
            nameEn: 'Scientific Research & Laboratories',
            quranRef: 'وَقُل رَّبِّ زِدْنِي عِلْمًا — طه ١١٤',
            researchTypes: [
                { nameAr: 'بحث أساسي (نظري)', nameEn: 'Basic / Fundamental Research', description: 'اكتشاف المعرفة الجديدة دون هدف تطبيقي مباشر' },
                { nameAr: 'بحث تطبيقي', nameEn: 'Applied Research', description: 'حل مشكلة محددة باستخدام المعرفة العلمية' },
                { nameAr: 'بحث تطويري', nameEn: 'Development Research (R&D)', description: 'تحويل نتائج البحث إلى منتجات وخدمات' },
                { nameAr: 'بحث استكشافي', nameEn: 'Exploratory Research', description: 'فهم ظاهرة جديدة' },
                { nameAr: 'بحث تجريبي', nameEn: 'Experimental Research', description: 'اختبار فرضيات بتجارب منهجية' },
                { nameAr: 'بحث كمي', nameEn: 'Quantitative Research', description: 'تحليل بيانات رقمية وإحصائية' },
                { nameAr: 'بحث نوعي (كيفي)', nameEn: 'Qualitative Research', description: 'فهم ظواهر من خلال مقابلات وملاحظات' },
                { nameAr: 'بحث مختلط', nameEn: 'Mixed Methods', description: 'جمع بين الكمي والنوعي' }
            ],
            researchMethodology: {
                steps: [
                    'تحديد المشكلة البحثية',
                    'مراجعة الأدبيات',
                    'صياغة الفرضيات',
                    'تصميم منهجية البحث',
                    'جمع البيانات',
                    'تحليل البيانات',
                    'مناقشة النتائج',
                    'كتابة التقرير / الورقة',
                    'مراجعة الأقران',
                    'النشر'
                ],
                tools: ['SPSS', 'R', 'Python (SciPy, Pandas)', 'MATLAB', 'NVivo', 'Atlas.ti', 'LaTeX', 'Overleaf', 'Zotero', 'Mendeley'],
                ethics: ['موافقة أخلاقية', 'خصوصية المشاركين', 'نزاهة البيانات', 'عدم الانتحال', 'الشفافية', 'ضوابط شرعية']
            },
            laboratories: {
                types: [
                    { nameAr: 'مختبر أبحاث أكاديمي', nameEn: 'Academic Research Lab' },
                    { nameAr: 'مختبر صناعي', nameEn: 'Industrial Lab' },
                    { nameAr: 'مختبر حكومي', nameEn: 'Government Lab' },
                    { nameAr: 'مختبر طبي / سريري', nameEn: 'Clinical / Medical Lab' },
                    { nameAr: 'مختبر فضائي', nameEn: 'Space Lab' },
                    { nameAr: 'مختبر كيميائي', nameEn: 'Chemical Lab' },
                    { nameAr: 'مختبر فيزياء', nameEn: 'Physics Lab' },
                    { nameAr: 'مختبر أحياء وجينوم', nameEn: 'Biology & Genomics Lab' },
                    { nameAr: 'مختبر ذكاء اصطناعي', nameEn: 'AI Research Lab' },
                    { nameAr: 'مختبر أمن سيبراني', nameEn: 'Cybersecurity Lab' },
                    { nameAr: 'مختبر روبوتات', nameEn: 'Robotics Lab' },
                    { nameAr: 'مختبر تقنية نانو', nameEn: 'Nanotechnology Lab' },
                    { nameAr: 'مختبر طاقة', nameEn: 'Energy Lab' },
                    { nameAr: 'مختبر مواد', nameEn: 'Materials Science Lab' },
                    { nameAr: 'مختبر بيئي', nameEn: 'Environmental Lab' },
                    { nameAr: 'مختبر غذاء وسلامة', nameEn: 'Food Safety Lab' },
                    { nameAr: 'مختبر افتراضي (رقمي)', nameEn: 'Virtual / Digital Lab' }
                ],
                equipment: ['مطياف', 'مجهر إلكتروني', 'مسرع جسيمات', 'جهاز PCR', 'حاسب فائق', 'طابعة 3D', 'غرفة نظيفة', 'مفاعل كيميائي', 'حساسات متقدمة'],
                safety: ['معايير ISO 17025', 'إجراءات السلامة الحيوية BSL', 'التخلص من النفايات الخطرة', 'تدريب السلامة', 'معدات وقاية شخصية (PPE)']
            },
            worldResearchCenters: [
                { name: 'CERN', location: 'سويسرا', field: 'فيزياء الجسيمات' },
                { name: 'MIT', location: 'أمريكا', field: 'تقنية متعددة' },
                { name: 'Max Planck Society', location: 'ألمانيا', field: 'علوم متعددة' },
                { name: 'CNRS', location: 'فرنسا', field: 'علوم متعددة' },
                { name: 'RIKEN', location: 'اليابان', field: 'علوم طبيعية' },
                { name: 'NIH', location: 'أمريكا', field: 'علوم صحية' },
                { name: 'Chinese Academy of Sciences', location: 'الصين', field: 'علوم متعددة' }
            ],
            saudiResearchCenters: [
                { name: 'KACST', field: 'بحوث متعددة' },
                { name: 'KAUST', field: 'علوم وتقنية متقدمة' },
                { name: 'SDAIA', field: 'بيانات وذكاء اصطناعي' },
                { name: 'مراكز بحث جامعة الملك سعود', field: 'متعددة' },
                { name: 'معهد الملك عبدالله لتقنية النانو', field: 'نانو' },
                { name: 'مركز الملك فيصل للبحوث والدراسات الإسلامية', field: 'دراسات إسلامية' }
            ],
            publishingAndIndexing: {
                databases: ['Scopus', 'Web of Science', 'PubMed', 'IEEE Xplore', 'Google Scholar', 'DOAJ', 'arXiv'],
                metrics: ['Impact Factor', 'H-Index', 'Citation Count', 'Altmetrics'],
                publishers: ['Elsevier', 'Springer Nature', 'Wiley', 'IEEE', 'ACM', 'MDPI', 'Taylor & Francis']
            }
        };

        // ══════════════════════════════════════════════════════════════════
        // ٨. الاستكشاف — Exploration (الفضاء، المحيطات، الأرض)
        // ══════════════════════════════════════════════════════════════════
        this.exploration = {
            nameAr: 'الاستكشاف',
            nameEn: 'Exploration',
            quranRef: 'قُلْ سِيرُوا فِي الْأَرْضِ فَانظُرُوا كَيْفَ بَدَأَ الْخَلْقَ — العنكبوت ٢٠',
            domains: [
                {
                    nameAr: 'استكشاف الفضاء',
                    nameEn: 'Space Exploration',
                    missions: ['رحلات مدارية', 'محطة الفضاء الدولية', 'استكشاف القمر', 'استكشاف المريخ', 'مسابير فضائية', 'تلسكوبات فضائية'],
                    agencies: ['NASA', 'ESA', 'CNSA', 'ISRO', 'JAXA', 'هيئة الفضاء السعودية'],
                    saudiAchievements: ['رائدة الفضاء ريانة برناوي', 'رائد الفضاء علي القرني', 'الأمير سلطان بن سلمان (أول عربي مسلم في الفضاء)'],
                    islamicAspect: 'الفضاء آية من آيات الله — استكشافه تأمل في عظمة الخالق'
                },
                {
                    nameAr: 'استكشاف المحيطات والبحار',
                    nameEn: 'Ocean & Marine Exploration',
                    topics: ['أعماق المحيطات', 'الشعاب المرجانية', 'البحر الأحمر', 'كائنات بحرية', 'موارد بحرية', 'غواصات بحثية'],
                    saudiInitiatives: ['مشروع البحر الأحمر', 'نيوم — خليج نيوم', 'KAUST بحوث بحرية'],
                    quranRef: 'وَهُوَ الَّذِي سَخَّرَ الْبَحْرَ لِتَأْكُلُوا مِنْهُ لَحْمًا طَرِيًّا — النحل ١٤'
                },
                {
                    nameAr: 'استكشاف باطن الأرض',
                    nameEn: 'Geological Exploration',
                    topics: ['تعدين', 'نفط وغاز', 'مياه جوفية', 'كهوف', 'معادن نادرة', 'جيولوجيا تطبيقية'],
                    saudiResources: ['معادن (Ma\'aden)', 'أرامكو', 'هيئة المساحة الجيولوجية']
                },
                {
                    nameAr: 'استكشاف الحياة البرية والتنوع البيولوجي',
                    nameEn: 'Wildlife & Biodiversity Exploration',
                    topics: ['محميات طبيعية', 'أنواع مهددة', 'تنوع نباتي', 'بيئات صحراوية', 'طيور مهاجرة'],
                    saudiInitiatives: ['الهيئة الملكية لمحافظة العلا', 'محمية الحياة الفطرية', 'مبادرة السعودية الخضراء']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٩. العلوم الإسلامية والتكامل مع العلوم الحديثة
        // ══════════════════════════════════════════════════════════════════
        this.islamicScienceIntegration = {
            nameAr: 'التكامل بين العلوم الإسلامية والحديثة',
            nameEn: 'Islamic-Modern Science Integration',
            principles: [
                { principle: 'العلم فريضة', evidence: 'طلب العلم فريضة على كل مسلم — ابن ماجه', application: 'كل العلوم النافعة مطلوبة شرعاً' },
                { principle: 'لا تعارض بين العلم والدين', application: 'الإسلام يشجع كل علم نافع ولا يتعارض مع الحقائق العلمية' },
                { principle: 'التفكر عبادة', evidence: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ — آل عمران ١٩٠', application: 'البحث العلمي نوع من التفكر المأمور به' },
                { principle: 'الإتقان', evidence: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — حديث', application: 'الجودة والإتقان في البحث العلمي' },
                { principle: 'النفع للناس', evidence: 'خير الناس أنفعهم للناس — حديث', application: 'توجيه العلوم لنفع البشرية' },
                { principle: 'التواضع العلمي', evidence: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا — الإسراء ٨٥', application: 'التواضع أمام عظمة العلم الإلهي' }
            ],
            islamicScientificHeritage: [
                { scholar: 'جابر بن حيان', field: 'الكيمياء', contribution: 'أبو الكيمياء — أسس المنهج التجريبي' },
                { scholar: 'الخوارزمي', field: 'الرياضيات والحاسب', contribution: 'أبو الجبر — الخوارزميات (Algorithms)' },
                { scholar: 'ابن الهيثم', field: 'الفيزياء والبصريات', contribution: 'أبو المنهج العلمي التجريبي' },
                { scholar: 'ابن سينا', field: 'الطب', contribution: 'القانون في الطب — أشهر كتاب طبي في التاريخ' },
                { scholar: 'الرازي', field: 'الطب والكيمياء', contribution: 'الحاوي في الطب — رائد الطب السريري' },
                { scholar: 'الزهراوي', field: 'الجراحة', contribution: 'أبو الجراحة — التصريف لمن عجز عن التأليف' },
                { scholar: 'ابن النفيس', field: 'الطب', contribution: 'اكتشاف الدورة الدموية الصغرى' },
                { scholar: 'البيروني', field: 'فلك وجغرافيا', contribution: 'تحديد محيط الأرض بدقة مذهلة' },
                { scholar: 'البتاني', field: 'الفلك', contribution: 'جداول فلكية دقيقة' },
                { scholar: 'عمر الخيام', field: 'الرياضيات', contribution: 'حل المعادلات التكعيبية' },
                { scholar: 'الإدريسي', field: 'الجغرافيا', contribution: 'خريطة العالم (نزهة المشتاق)' },
                { scholar: 'ابن خلدون', field: 'علم الاجتماع', contribution: 'مؤسس علم الاجتماع — المقدمة' },
                { scholar: 'ابن البيطار', field: 'الصيدلة والنبات', contribution: 'الجامع لمفردات الأدوية والأغذية' },
                { scholar: 'الجزري', field: 'الهندسة الميكانيكية', contribution: 'أبو الروبوتات — كتاب الحيل الجامع' }
            ],
            shariaGuidelines: [
                'كل علم نافع مطلوب شرعاً ومأجور عليه',
                'العلوم التي تحقق المقاصد الشرعية الخمسة مقدمة',
                'تحرم العلوم التي تضر بالإنسان أو البيئة بلا مبرر',
                'يجب مراعاة أخلاقيات البحث الإسلامية',
                'الأبحاث على الأجنة والجينات لها ضوابط فقهية',
                'تحرم الأبحاث التي تنتهك كرامة الإنسان',
                'يُشجع نقل التقنية للدول الإسلامية (التعاون على البر)',
                'براءات الاختراع حق شرعي محمي'
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ١٠. الرقمنة العلمية — Digital Science Platform
        // ══════════════════════════════════════════════════════════════════
        this.digitalScience = {
            nameAr: 'المنصة العلمية الرقمية لشيخة',
            nameEn: 'Sheikha Digital Science Platform',
            systems: [
                { nameAr: 'محرك بحث علمي ذكي', nameEn: 'AI-Powered Scientific Search', features: ['بحث دلالي', 'بحث بالعربية والإنجليزية', 'ربط بـ Scopus & PubMed', 'تلخيص أوراق بحثية بالذكاء الاصطناعي'] },
                { nameAr: 'مختبر افتراضي تفاعلي', nameEn: 'Interactive Virtual Lab', features: ['محاكاة تجارب كيميائية', 'محاكاة فيزيائية', 'تشريح افتراضي', 'مختبر AI تجريبي'] },
                { nameAr: 'منصة براءات الاختراع', nameEn: 'Patent Platform', features: ['تسجيل براءات رقمي', 'بحث براءات عالمي', 'تقييم جدوى الابتكار', 'حماية IP رقمية'] },
                { nameAr: 'منتدى علمي إسلامي', nameEn: 'Islamic Science Forum', features: ['مناقشات بحثية', 'تعاون دولي', 'مراجعة أقران', 'منح بحثية'] },
                { nameAr: 'مكتبة رقمية شاملة', nameEn: 'Comprehensive Digital Library', features: ['كتب علمية', 'أوراق بحثية', 'أطروحات', 'مخطوطات إسلامية علمية'] },
                { nameAr: 'منصة تمويل البحوث', nameEn: 'Research Funding Platform', features: ['منح بحثية', 'رعايات شركات', 'تمويل جماعي للابتكار', 'أوقاف علمية'] },
                { nameAr: 'قاعدة بيانات العلماء', nameEn: 'Scientists Database', features: ['ملفات باحثين', 'شبكة تعاون', 'تقييم أداء بحثي', 'ربط بـ ORCID'] },
                { nameAr: 'نظام إدارة المختبرات (LIMS)', nameEn: 'Lab Information Management System', features: ['إدارة عينات', 'جدولة أجهزة', 'تتبع تجارب', 'تقارير آلية'] },
                { nameAr: 'أكاديمية شيخة العلمية', nameEn: 'Sheikha Science Academy', features: ['دورات علمية', 'شهادات معتمدة', 'تعلم ذاتي', 'إرشاد أكاديمي'] },
                { nameAr: 'منصة الإعجاز العلمي', nameEn: 'Scientific Miracles Platform', features: ['ربط الآيات بالاكتشافات', 'مراجعة علمية دقيقة', 'تفريق بين الحقائق والتأويلات'] }
            ]
        };
    }

    getDashboard() {
        const countBranches = (obj) => {
            if (!obj || !obj.branches) return 0;
            return obj.branches.length;
        };
        const countSubBranches = (obj) => {
            if (!obj || !obj.branches) return 0;
            return obj.branches.reduce((s, b) => {
                if (b.subBranches) return s + b.subBranches.length;
                if (b.specialties) return s + b.specialties.length;
                return s;
            }, 0);
        };

        return {
            engine: this.name, version: this.version, owner: this.owner, activatedAt: this.activatedAt,
            summary: {
                naturalScienceBranches: countBranches(this.naturalSciences),
                naturalScienceSubBranches: countSubBranches(this.naturalSciences),
                appliedScienceBranches: countBranches(this.appliedSciences),
                appliedScienceSubBranches: countSubBranches(this.appliedSciences),
                medicalScienceBranches: countBranches(this.medicalSciences),
                humanScienceBranches: countBranches(this.humanSciences),
                techDomains: this.technologyAndComputing.domains.length,
                innovationTypes: this.innovation.innovationFramework.types.length,
                ipTypes: this.innovation.intellectualProperty.types.length,
                researchTypes: this.research.researchTypes.length,
                labTypes: this.research.laboratories.types.length,
                explorationDomains: this.exploration.domains.length,
                islamicScholars: this.islamicScienceIntegration.islamicScientificHeritage.length,
                digitalSystems: this.digitalScience.systems.length,
                quranReferences: this.quranReferences.length,
                hadithReferences: this.hadithReferences.length
            },
            quranReferences: this.quranReferences,
            hadithReferences: this.hadithReferences,
            naturalSciences: this.naturalSciences,
            appliedSciences: this.appliedSciences,
            medicalSciences: this.medicalSciences,
            humanSciences: this.humanSciences,
            technologyAndComputing: this.technologyAndComputing,
            innovation: this.innovation,
            research: this.research,
            exploration: this.exploration,
            islamicScienceIntegration: this.islamicScienceIntegration,
            digitalScience: this.digitalScience
        };
    }
}

module.exports = ShekhaSciencesEngine;
