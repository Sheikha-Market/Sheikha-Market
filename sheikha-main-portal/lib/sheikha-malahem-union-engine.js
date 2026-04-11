/**
 * بسم الله الرحمن الرحيم
 * =============================================================================
 * منظومة شيخة الشاملة لأحداث آخر الزمان — تثقيف شرعي معرفي
 * SHEIKHA COMPREHENSIVE AKHIR ALZAMAN ENGINE v2.0
 * =============================================================================
 * المنظومة الأولى  : اتحاد المسلمين والروم ضد العدو من الخلف
 * المنظومة الثانية : عيسى بن مريم (ص) وقتل المسيح الدجال
 * المنظومة الثالثة : يأجوج ومأجوج والقضاء عليهم
 * المنظومة الرابعة : علامات الساعة الكبرى العشر
 * المنظومة الخامسة : علامات الساعة الصغرى واشراط الساعة
 * المنظومة السادسة : التواصل والوصول لكل مسلم وكل رومي للاتحاد الامن
 * =============================================================================
 * للتثقيف الشرعي والمعرفي فقط - لا جزم بتوقيت - العلم عند الله
 * ولا حول ولا قوة إلا بالله العلي العظيم
 * المالك: سلمان احمد بن سلمان الراجح | 1031605270 | market@sheikha.top
 */
'use strict';

class SheikhaMalahemUnionEngine {
    constructor() {
        this.name      = 'منظومة شيخة الشاملة لاحداث اخر الزمان';
        this.nameEn    = 'Sheikha Comprehensive Akhir Alzaman Engine';
        this.version   = '2.0.0';
        this.mode      = 'educational';
        this.owner     = 'سلمان احمد بن سلمان الراجح - 1031605270';
        this.startedAt = new Date().toISOString();
        this.disclaimer = [
            'هذا المحرك للتثقيف الشرعي والمعرفي فقط - لا يقدم توقيتا ولا جزما',
            'العلم بوقت الاحداث عند الله وحده - لا يعلم متى تقوم الساعة الا الله',
            'الواجب: الثبات على الكتاب والسنة والاستعداد بالتقوى والعمل الصالح',
            'لا يجوز استخدام هذا العلم لتبرير اعمال غير مشروعة او اثارة فتنة'
        ];
        this._allianceHadiths   = this._initAllianceHadiths();
        this._malahemSequence   = this._initMalahemSequence();
        this._islamicUnionModel = this._initIslamicUnionModel();
        this._ghanayimMalahem   = this._initGhanayimMalahem();
        this._isaDescend        = this._initIsaDescend();
        this._dajjalSystem      = this._initDajjalSystem();
        this._yajujMajuj        = this._initYajujMajuj();
        this._majorSigns        = this._initMajorSigns();
        this._minorSigns        = this._initMinorSigns();
        this._ashratAlSaah      = this._initAshratAlSaah();
        this._outreachSystem    = this._initOutreachSystem();
        this._preparednessGuide = this._initPreparednessGuide();
        this._scholarlyNotes    = this._initScholarlyNotes();
    }

    /* ======= 1. اتحاد المسلمين والروم ======= */
    _initAllianceHadiths() {
        return {
            title: 'احاديث الصلح والاتحاد بين المسلمين والروم',
            overview: 'احاديث نبوية صحيحة تبشر بتحالف امن بين المسلمين والروم ضد عدو مشترك',
            hadiths: [
                {
                    id: 'AH-01', grade: 'حسن صحيح',
                    source: 'ابو داود 4292 - صححه الارناؤوط',
                    narrator: 'ذو مخبر رضي الله عنه',
                    text: 'ستصالحون الروم صلحا امنا، وتغزون انتم وهم عدوا من ورائكم، فتنصرون، وتغنمون، وتسلمون...',
                    meaning: 'صلح امن + حرب مشتركة ضد عدو ثالث + نصر وغنيمة وسلامة',
                    stages: [
                        { n: 1, event: 'الصلح الامن مع الروم - هدنة وسلام متبادل' },
                        { n: 2, event: 'جهاد مشترك ضد عدو من الخلف (الثالث)' },
                        { n: 3, event: 'النصر والغنيمة والسلامة للفريقين' },
                        { n: 4, event: 'خيانة احد الروم - رفع صليب او قول كفر - غضب المسلمين' },
                        { n: 5, event: 'القتال بين المسلمين والروم - الملحمة الكبرى' }
                    ]
                },
                {
                    id: 'AH-02', grade: 'صحيح',
                    source: 'صحيح مسلم 2897',
                    narrator: 'ابو هريرة رضي الله عنه',
                    text: 'لا تقوم الساعة حتى ينزل الروم بالاعماق او بدابق، فيخرج اليهم جيش من المدينة...',
                    meaning: 'ملحمة دابق / الاعماق - معركة كبرى في اخر الزمان',
                    notes: 'يخرج جيش ايماني خير اهل الارض يومئذ'
                },
                {
                    id: 'AH-03', grade: 'صحيح',
                    source: 'البخاري 3057، مسلم',
                    narrator: 'عبدالله بن عمرو رضي الله عنهما',
                    text: 'لتفتحن القسطنطينية، فلنعم الامير اميرها، ولنعم الجيش ذلك الجيش',
                    meaning: 'بشارة بفتح القسطنطينية - تحققت 857 هجري / 1453م',
                    historicalFulfillment: 'تحقق - السلطان محمد الفاتح عمره 21 سنة'
                }
            ]
        };
    }

    _initMalahemSequence() {
        return {
            title: 'تسلسل احداث الملاحم الكبرى',
            note: 'الترتيب استنباطي - قد يختلف العلماء في التفاصيل',
            events: [
                { id:'MS-01', order:1,  nameAr:'الصلح الامن مع الروم',              source:'ابو داود 4292' },
                { id:'MS-02', order:2,  nameAr:'الجهاد المشترك ضد العدو من الخلف', source:'ابو داود 4292' },
                { id:'MS-03', order:3,  nameAr:'النصر والغنيمة والسلامة',           source:'ابو داود 4292' },
                { id:'MS-04', order:4,  nameAr:'خيانة بعض الروم وانتقاض التحالف', source:'ابو داود 4292' },
                { id:'MS-05', order:5,  nameAr:'ملحمة الاعماق / دابق الكبرى',      source:'مسلم 2897'    },
                { id:'MS-06', order:6,  nameAr:'فتح القسطنطينية الثاني',            source:'ابو داود، ابن ماجه' },
                { id:'MS-07', order:7,  nameAr:'خروج المسيح الدجال',               source:'متواتر'       },
                { id:'MS-08', order:8,  nameAr:'نزول عيسى بن مريم (ص)',            source:'مسلم 2937'    },
                { id:'MS-09', order:9,  nameAr:'قتل الدجال عند باب لد',            source:'مسلم 2937'    },
                { id:'MS-10', order:10, nameAr:'خروج ياجوج وماجوج',               source:'مسلم 2937'    },
                { id:'MS-11', order:11, nameAr:'هلاك ياجوج وماجوج بالدعاء',       source:'مسلم 2937'    },
                { id:'MS-12', order:12, nameAr:'عصر الخلافة الراشدة والبركة',      source:'احمد - صحيح'  }
            ]
        };
    }

    _initIslamicUnionModel() {
        return {
            title: 'نموذج الاتحاد الاسلامي - دروس استراتيجية',
            quranBase: 'واعدوا لهم ما استطعتم من قوة - الانفال:60',
            pillars: [
                { id:'UI-01', nameAr:'الاتحاد عند الضرورة',
                  principle:'يجوز التحالف مع غير المسلمين لدفع عدو اشد ضررا',
                  basis:'حلف الفضول، المعاهدات النبوية، صلح الحديبية' },
                { id:'UI-02', nameAr:'الاعداد قبل الاتحاد',
                  principle:'القوة شرط الشراكة المحترمة',
                  basis:'واعدوا لهم ما استطعتم من قوة - الانفال:60' },
                { id:'UI-03', nameAr:'الثبات على الهوية الاسلامية',
                  principle:'التعاون لا يعني ذوبان الهوية',
                  basis:'لا تنازل في امر الدين مهما كانت المصالح' },
                { id:'UI-04', nameAr:'الغنيمة الحلال من النصر',
                  principle:'النصر المشروع يتبعه غنيمة حلال',
                  basis:'فكلوا مما غنمتم حلالا طيبا - الانفال:69' },
                { id:'UI-05', nameAr:'التوكل على الله مع الاسباب',
                  principle:'النصر من الله والاسباب واجب شرعي',
                  basis:'ان تنصروا الله ينصركم - محمد:7' }
            ]
        };
    }

    _initGhanayimMalahem() {
        return {
            title: 'الغنائم في سياق الملاحم',
            quranRef: 'واعلموا انما غنمتم من شيء فان لله خمسه - الانفال:41',
            types: [
                { id:'GM-01', nameAr:'غنائم الحرب المشروعة',        ruling:'حلال بعد الخمس',       basis:'الانفال:41' },
                { id:'GM-02', nameAr:'غنائم النصر الاقتصادي',       ruling:'حلال - ارباح الفتوحات', basis:'تاريخ الفتوحات' },
                { id:'GM-03', nameAr:'الفيء',                        ruling:'لبيت المال',            basis:'الحشر:7' },
                { id:'GM-04', nameAr:'غنائم المعرفة والحضارة',       ruling:'حلال - الحكمة ضالة المؤمن', basis:'حديث الحكمة' },
                { id:'GM-05', nameAr:'الغنيمة الروحية: انتشار الاسلام', ruling:'اعظم الغنائم',     basis:'ويدخلون في دين الله افواجا - النصر:2' }
            ],
            distribution: {
                khums: 'الخمس = 20% لله وللرسول ولذوي القربى واليتامى والمساكين وابن السبيل',
                remainder: 'اربعة اخماس للمقاتلين بالعدل'
            }
        };
    }

    /* ======= 2. عيسى (ص) وقتل الدجال ======= */
    _initIsaDescend() {
        return {
            title: 'نزول عيسى بن مريم (ص) - علامة كبرى من علامات الساعة',
            grade: 'متواتر - اجماع اهل السنة والجماعة',
            mainHadith: {
                text: 'والذي نفسي بيده، ليوشكن ان ينزل فيكم ابن مريم حكما عدلا، فيكسر الصليب، ويقتل الخنزير، ويضع الجزية، ويفيض المال حتى لا يقبله احد',
                source: 'البخاري 2222، مسلم 155'
            },
            characteristics: [
                { id:'IS-01', trait:'حكما عدلا',                      detail:'يحكم بالقران والسنة' },
                { id:'IS-02', trait:'يكسر الصليب',                    detail:'يعلن بطلان عبادة الصليب' },
                { id:'IS-03', trait:'يقتل الخنزير',                   detail:'يحرمه ويمنع اكله' },
                { id:'IS-04', trait:'يضع الجزية',                    detail:'لا تقبل الا الاسلام في اخر الزمان' },
                { id:'IS-05', trait:'يفيض المال',                     detail:'رخاء وبركة عظيمة' },
                { id:'IS-06', trait:'ينزل بالمنارة البيضاء شرقي دمشق', detail:'المكان المذكور' },
                { id:'IS-07', trait:'يصلي خلف امام المسلمين',          detail:'اتباعه للشريعة المحمدية' },
                { id:'IS-08', trait:'يقتل الدجال عند باب لد',          detail:'نهاية اكبر فتنة' },
                { id:'IS-09', trait:'يدعو على ياجوج وماجوج فيهلكهم',  detail:'سلاحه الدعاء لا السيف' },
                { id:'IS-10', trait:'يمكث اربعين سنة ثم يموت',         detail:'مسلم - ثم يصلى عليه' }
            ],
            islamicCreed: {
                point1: 'عيسى (ص) عبد الله ورسوله - مسلم موحد لا يدعي الالوهية',
                point2: 'لم يصلب ولم يقتل - رفعه الله اليه - النساء:158',
                point3: 'يعود في اخر الزمان - خبر متواتر قطعي',
                point4: 'نزوله تاكيد لصدق نبوة محمد (ص) وصحة الاسلام'
            },
            quranRef: 'وانه لعلم للساعة فلا تمترن بها - الزخرف:61'
        };
    }

    _initDajjalSystem() {
        return {
            title: 'منظومة المسيح الدجال - الفتنة الكبرى ونهايتها',
            mainHadith: {
                text: 'ما بين خلق ادم الى قيام الساعة خلق اكبر من الدجال',
                source: 'صحيح مسلم 2946'
            },
            characteristics: [
                { id:'DJ-01', trait:'اعور العين اليمنى',          detail:'عينه اليسرى كالعنبة الطافية' },
                { id:'DJ-02', trait:'مكتوب بين عينيه: ك ف ر',    detail:'يقراها كل مؤمن حتى الامي' },
                { id:'DJ-03', trait:'يدعي الالوهية',              detail:'يقول انا ربكم الاعلى' },
                { id:'DJ-04', trait:'معه جنة ونار',               detail:'جنته نار وناره جنة في الحقيقة' },
                { id:'DJ-05', trait:'يسير بسرعة كالغيث',          detail:'يجوب الارض في اربعين يوم' },
                { id:'DJ-06', trait:'لا يدخل مكة والمدينة',       detail:'محميتان بالملائكة' },
                { id:'DJ-07', trait:'يجري معجزات زائفة',          detail:'يحيي ويميت - فتنة عظيمة' },
                { id:'DJ-08', trait:'اكثر اتباعه اليهود والنساء', detail:'من احاديث ذكر اتباعه' }
            ],
            protection: [
                { method:'حفظ اوائل الكهف',        hadith:'من حفظ عشر ايات من اول سورة الكهف عصم من الدجال - مسلم 809' },
                { method:'الاستعاذة في كل صلاة',   hadith:'اللهم اني اعوذ بك من عذاب جهنم...ومن شر فتنة المسيح الدجال - متفق عليه' },
                { method:'الايمان الراسخ والعلم',  detail:'من عرف صفاته لم يفتن به' },
                { method:'السكن في مكة او المدينة', detail:'لا يدخلهما' },
                { method:'الفرار منه',              hadith:'من سمع بالدجال فلينا عنه - ابو داود' }
            ],
            end: {
                killer: 'عيسى بن مريم (ص)',
                location: 'باب لد (لود - فلسطين)',
                hadith: 'فيدركه عيسى ابن مريم عند باب لد الشرقي فيقتله - مسلم 2937',
                method: 'يطعنه بالرمح فيذوب كما يذوب الملح في الماء',
                meaning: 'انتصار الحق المطلق على اكذب خلق الله'
            }
        };
    }

    /* ======= 3. ياجوج وماجوج ======= */
    _initYajujMajuj() {
        return {
            title: 'منظومة ياجوج وماجوج - الفتنة الكبرى والقضاء عليهم',
            quranMentions: [
                { surah:'الكهف', ayah:'94-99',
                  text:'قالوا يا ذا القرنين ان ياجوج وماجوج مفسدون في الارض...',
                  context:'ذو القرنين يبني السد الحديدي ليمنع خروجهم' },
                { surah:'الانبياء', ayah:96,
                  text:'حتى اذا فتحت ياجوج وماجوج وهم من كل حدب ينسلون',
                  context:'يفتح السد في اخر الزمان فينتشرون' }
            ],
            hadith: {
                text: 'ان ياجوج وماجوج يحفرون السد كل يوم، حتى اذا كادوا يخرقونه قال الذي عليهم: ارجعوا فستخرقونه غدا... ولا يقال ان شاء الله، فيعود كما كان اشد ما يكون',
                source: 'الترمذي 3153 - حسن'
            },
            characteristics: [
                { id:'YM-01', trait:'خلق عظيم الكثرة',           detail:'من ولد ادم - كثيرون جدا' },
                { id:'YM-02', trait:'يفسدون في الارض',           detail:'يلحقون دمارا عظيما' },
                { id:'YM-03', trait:'يشربون بحيرة طبرية كاملة', detail:'من احاديث وصفهم' },
                { id:'YM-04', trait:'يرمون سهامهم الى السماء',   detail:'تعاليهم وبطرهم' },
                { id:'YM-05', trait:'لا يهزمون بالسلاح',         detail:'يقول عيسى (ص): لا طاقة لي بقتالهم' }
            ],
            theEnd: {
                method: 'دعاء عيسى بن مريم (ص)',
                hadith: 'فيدعو عيسى واصحابه، فيرسل الله عليهم النغف في رقابهم فيصبحون فرسى كموت نفس واحدة - مسلم 2937',
                instrument: 'النغف: دود ياكل في الرقاب - يهلكهم الله باصغر مخلوقاته',
                afterDestruction: [
                    'ينزل الله مطرا يطهر الارض',
                    'تخرج الارض بركتها وتبارك فيها',
                    'الزيتونة الواحدة تظل الرهط',
                    'ينعم اهل الارض بالرخاء والبركة'
                ],
                lesson: 'النصر الحقيقي بيد الله - الدعاء اعظم سلاح'
            },
            islamicLessons: [
                'القران والسنة يخبران بحقائق عظيمة قبل وقوعها تصديقا لله ورسوله',
                'لا قوة في الكون تعجز الله - ما يعجز البشر يفعله الله باصغر مخلوق',
                'الدعاء سلاح المؤمن - يسخر الله به ما لا يسخره السيف',
                'السد الحديدي لذي القرنين اية في الارض على قدرة الله'
            ]
        };
    }

    /* ======= 4. علامات الساعة الكبرى العشر ======= */
    _initMajorSigns() {
        return {
            title: 'علامات الساعة الكبرى العشر',
            mainHadith: {
                text: 'لا تقوم الساعة حتى تروا عشر ايات: الدخان، والدجال، والدابة، وطلوع الشمس من مغربها، ونزول عيسى ابن مريم، وياجوج وماجوج، وثلاثة خسوف: خسف بالمشرق، وخسف بالمغرب، وخسف بجزيرة العرب، واخر ذلك نار تخرج من اليمن تطرد الناس الى محشرهم',
                source: 'صحيح مسلم 2901 - حذيفة بن اسيد رضي الله عنه'
            },
            signs: [
                { id:'KS-01', order:1,  nameAr:'الدخان',
                  quran:'فارتقب يوم تاتي السماء بدخان مبين - الدخان:10',
                  description:'دخان عظيم يملا السماء يصيب المؤمن كالزكام ويصيب الكافر كالمخمور',
                  lesson:'يميز المؤمن من الكافر' },
                { id:'KS-02', order:2,  nameAr:'الدجال',
                  description:'اكبر فتنة في تاريخ البشرية - راجع المنظومة الثانية',
                  protection:'حفظ اوائل الكهف + الاستعاذة' },
                { id:'KS-03', order:3,  nameAr:'الدابة',
                  quran:'واذا وقع القول عليهم اخرجنا لهم دابة من الارض تكلمهم - النمل:82',
                  description:'دابة تخرج من الارض تكلم الناس وتميز المؤمن من الكافر' },
                { id:'KS-04', order:4,  nameAr:'طلوع الشمس من مغربها',
                  hadith:'لا تقوم الساعة حتى تطلع الشمس من مغربها فاذا طلعت امن الناس اجمعون وذلك حين لا ينفع نفسا ايمانها',
                  source:'البخاري 4635',
                  lesson:'يغلق باب التوبة - المبادرة بالتوبة قبل فوات الاوان' },
                { id:'KS-05', order:5,  nameAr:'نزول عيسى بن مريم (ص)',
                  description:'راجع المنظومة الثانية للتفاصيل',
                  key:'ينزل حكما عدلا - يقتل الدجال - يهلك ياجوج وماجوج' },
                { id:'KS-06', order:6,  nameAr:'ياجوج وماجوج',
                  description:'راجع المنظومة الثالثة للتفاصيل',
                  key:'يهلكهم الله بالنغف بدعاء عيسى (ص)' },
                { id:'KS-07', order:7,  nameAr:'الخسف بالمشرق',
                  source:'مسلم 2901',
                  lesson:'الارض كلها لله - لا امان الا بامان الله' },
                { id:'KS-08', order:8,  nameAr:'الخسف بالمغرب',
                  source:'مسلم 2901',
                  lesson:'لا ملجا من الله الا اليه' },
                { id:'KS-09', order:9,  nameAr:'الخسف بجزيرة العرب',
                  source:'مسلم 2901',
                  lesson:'حتى ارض الحرمين لا تنجو الا بامان الله' },
                { id:'KS-10', order:10, nameAr:'النار من اليمن تسوق الناس',
                  source:'مسلم 2901',
                  description:'نار تخرج من اليمن تسوق الناس الى ارض المحشر',
                  meaning:'بداية يوم القيامة وحشر الناس' }
            ]
        };
    }

    /* ======= 5. علامات الساعة الصغرى ======= */
    _initMinorSigns() {
        return {
            title: 'علامات الساعة الصغرى',
            note: 'علامات كثيرة ذكرها النبي (ص) - منها ما تحقق ومنها ما يتحقق',
            categories: [
                {
                    id:'SS-CAT-01', nameAr:'علامات في الدين والعلم',
                    signs: [
                        { id:'SS-01', text:'رفع العلم وظهور الجهل',          source:'البخاري 81، مسلم 2671' },
                        { id:'SS-02', text:'كثرة الفتن والشبهات',            source:'احاديث كثيرة' },
                        { id:'SS-03', text:'ضياع الامانة',                   source:'البخاري 59' },
                        { id:'SS-04', text:'كثرة العلماء الضالين',           source:'احاديث الفتن' },
                        { id:'SS-05', text:'نزع الخشوع من القلوب',           source:'الترمذي' }
                    ]
                },
                {
                    id:'SS-CAT-02', nameAr:'علامات في الاخلاق والمجتمع',
                    signs: [
                        { id:'SS-06', text:'كثرة الزنا وانتشاره علنا',      source:'البخاري 81' },
                        { id:'SS-07', text:'كثرة شرب الخمر',                source:'البخاري 81' },
                        { id:'SS-08', text:'انقطاع الارحام',                 source:'احاديث صحيحة' },
                        { id:'SS-09', text:'عقوق الوالدين',                  source:'احاديث الفتن' },
                        { id:'SS-10', text:'الاستخفاف بالحرمات',             source:'احاديث الفتن' }
                    ]
                },
                {
                    id:'SS-CAT-03', nameAr:'علامات في الاقتصاد والعمران',
                    signs: [
                        { id:'SS-11', text:'انتشار الربا واكله',             source:'البيهقي - صحيح' },
                        { id:'SS-12', text:'التطاول في البنيان - رعاة الابل يتباهون',  source:'حديث جبريل - مسلم 8' },
                        { id:'SS-13', text:'كثرة المال مع قلة البركة',       source:'احاديث صحيحة' },
                        { id:'SS-14', text:'ان تلد الامة ربتها',             source:'حديث جبريل - مسلم 8' }
                    ]
                },
                {
                    id:'SS-CAT-04', nameAr:'علامات في القتال والفتن',
                    signs: [
                        { id:'SS-15', text:'كثرة الهرج (القتل)',              source:'البخاري 85، مسلم 2672' },
                        { id:'SS-16', text:'يكثر السلاح حتى لا يعرف المسالم', source:'احاديث الفتن' },
                        { id:'SS-17', text:'تقارب الزمان حتى تكون السنة كالشهر', source:'الترمذي 2332' },
                        { id:'SS-18', text:'فتنة بني فلان بالحجاز',          source:'احاديث صحيحة' }
                    ]
                },
                {
                    id:'SS-CAT-05', nameAr:'علامات تحققت بالفعل',
                    note: 'علامات يذكر العلماء انها تحققت',
                    signs: [
                        { id:'SS-19', text:'بعثة النبي (ص) علامة',          source:'الانعام:19، البخاري 4936' },
                        { id:'SS-20', text:'وفاة النبي (ص)',                 source:'حديث قبيصة' },
                        { id:'SS-21', text:'فتح بيت المقدس',                 source:'البخاري 3176 - تحقق 15هـ' },
                        { id:'SS-22', text:'طاعون عمواس',                   source:'البخاري 5290 - تحقق 18هـ' },
                        { id:'SS-23', text:'فتح القسطنطينية',               source:'البخاري 3057 - تحقق 857هـ' }
                    ]
                }
            ]
        };
    }

    _initAshratAlSaah() {
        return {
            title: 'اشراط الساعة من القران الكريم والسنة النبوية',
            quranVerses: [
                { id:'QS-01', surah:'محمد', ayah:18,
                  text:'فهل ينظرون الا الساعة ان تاتيهم بغتة فقد جاء اشراطها',
                  lesson:'الساعة تاتي بغتة - اشراطها قد بدات ببعثة النبي (ص)' },
                { id:'QS-02', surah:'القمر', ayah:1,
                  text:'اقتربت الساعة وانشق القمر',
                  lesson:'انشقاق القمر علامة حدثت في زمن النبي (ص)' },
                { id:'QS-03', surah:'الزلزلة', ayah:'1-2',
                  text:'اذا زلزلت الارض زلزالها واخرجت الارض اثقالها',
                  lesson:'اول احداث يوم القيامة' },
                { id:'QS-04', surah:'الكهف', ayah:99,
                  text:'وتركنا بعضهم يومئذ يموج في بعض',
                  lesson:'ياجوج وماجوج في القران' },
                { id:'QS-05', surah:'الروم', ayah:'1-5',
                  text:'الم غلبت الروم في ادنى الارض وهم من بعد غلبهم سيغلبون',
                  lesson:'القران يذكر الروم - اخبار غيبية تحققت' }
            ],
            hadithCategories: [
                { id:'HS-01', category:'احاديث جبريل',
                  hadith:'بينما نحن عند رسول الله اذ طلع علينا رجل...',
                  source:'مسلم 8',
                  signs:['الامة تلد ربتها','الحفاة العراة رعاة الشاء يتطاولون في البنيان'] },
                { id:'HS-02', category:'حديث العشر الايات الكبرى',
                  hadith:'لا تقوم الساعة حتى تروا عشر ايات...',
                  source:'مسلم 2901',
                  lesson:'راجع المنظومة الرابعة' },
                { id:'HS-03', category:'احاديث رفع العلم',
                  hadith:'ان الله لا يقبض العلم انتزاعا ينتزعه من العباد، ولكن يقبض العلم بقبض العلماء',
                  source:'البخاري 100، مسلم 2673',
                  lesson:'اهمية العلماء الربانيين - موتهم من اشراط الساعة' },
                { id:'HS-04', category:'حديث تقارب الزمان والهرج',
                  hadith:'يتقارب الزمان وينقص العمل، ويلقى الشح، ويكثر الهرج',
                  source:'البخاري 6037',
                  lesson:'تسارع الاحداث وقصر الاعمار' }
            ],
            keyPrinciple: {
                arabic: 'الواجب: الاستعداد للساعة بالعمل الصالح - لا معرفة وقتها',
                quran: 'يسالونك عن الساعة ايان مرساها قل انما علمها عند ربي - الاعراف:187',
                hadith: 'ما المسؤول عنها باعلم من السائل - مسلم 8'
            }
        };
    }

    /* ======= 6. منظومة التواصل والاتحاد الامن ======= */
    _initOutreachSystem() {
        return {
            title: 'منظومة التواصل والاتحاد الامن - الوصول لكل مسلم وكل رومي',
            vision: 'بناء قنوات تواصل فعالة لنشر الحق والوحدة والتحالف الامن حتى يتم النصر بامر الله',
            quranBase: [
                { verse:'ادع الى سبيل ربك بالحكمة والموعظة الحسنة - النحل:125',
                  principle:'الدعوة بالحكمة والحسنى' },
                { verse:'وجادلهم بالتي هي احسن - النحل:125',
                  principle:'الحوار بالاسلوب الاحسن' },
                { verse:'قل يا اهل الكتاب تعالوا الى كلمة سواء بيننا وبينكم - ال عمران:64',
                  principle:'دعوة اهل الكتاب للكلمة المشتركة' },
                { verse:'لا ينهاكم الله عن الذين لم يقاتلوكم في الدين...ان تبروهم وتقسطوا اليهم - الممتحنة:8',
                  principle:'العدل مع غير المسلمين المسالمين' }
            ],
            muslimOutreach: {
                title: 'الوصول لكل مسلم في العالم',
                totalMuslims: '~1.9 مليار مسلم في اكثر من 57 دولة',
                channels: [
                    { id:'MO-01', channel:'المنابر والمساجد',
                      reach:'مليار مسلم اسبوعيا',
                      method:'خطب الجمعة + الدروس + الحلقات',
                      message:'الاستعداد للملاحم بالتقوى والاعداد والوحدة',
                      platform:'شيخة تقدم المحتوى الشرعي للائمة والخطباء' },
                    { id:'MO-02', channel:'وسائل التواصل الاجتماعي',
                      reach:'1.5 مليار مسلم رقميا',
                      platforms:['X (تويتر)','يوتيوب','انستغرام','تيك توك','تيليغرام','واتساب'],
                      message:'محتوى اسلامي اصيل موثق بالكتاب والسنة',
                      platform:'منظومة شيخة الرقمية' },
                    { id:'MO-03', channel:'التعليم والمدارس الاسلامية',
                      reach:'500 مليون طالب',
                      method:'مناهج دراسية + دورات تدريبية',
                      message:'العقيدة الصحيحة + علامات الساعة + الاستعداد',
                      platform:'منظومة شيخة التعليمية' },
                    { id:'MO-04', channel:'العلماء والمشايخ',
                      reach:'مئات الالاف يصلون للملايين',
                      method:'تزويدهم بالمحتوى الموثق والمراجع الشرعية',
                      message:'فهم الملاحم + الوحدة الاسلامية + الاستعداد الحقيقي',
                      platform:'قاعدة بيانات شيخة للمحتوى الشرعي' },
                    { id:'MO-05', channel:'منظمات العالم الاسلامي',
                      reach:'57 دولة اسلامية',
                      method:'تعاون رسمي + وثائق مشتركة',
                      message:'الوحدة الاسلامية في مواجهة التحديات',
                      platform:'شراكات شيخة مع المنظمات الدولية' }
                ],
                unityMessage: {
                    arabic: 'يا معشر المسلمين - الوحدة فريضة، والتفرق حرام، والاتحاد في مواجهة العدو المشترك واجب شرعي',
                    quran: 'واعتصموا بحبل الله جميعا ولا تفرقوا - ال عمران:103',
                    hadith: 'مثل المؤمنين في توادهم وتراحمهم وتعاطفهم كمثل الجسد الواحد - مسلم 2586'
                }
            },
            romanOutreach: {
                title: 'الوصول لكل رومي - الحوار والتواصل بالحكمة',
                whoAreRooms: 'الروم في الاحاديث = الغرب الاوروبي والمسيحي - اهل الكتاب والحضارة الغربية',
                islamicApproach: 'الاسلام يدعو للتعاون المشروع والحوار الحضاري - لا الصدام الحتمي',
                quranCall: 'قل يا اهل الكتاب تعالوا الى كلمة سواء بيننا وبينكم الا نعبد الا الله - ال عمران:64',
                channels: [
                    { id:'RO-01', channel:'الحوار الديني بين الحضارات',
                      approach:'لقاءات الحوار الاسلامي-المسيحي',
                      message:'نقاط التوافق: التوحيد، الاخلاق، العدل، محاربة الظلم',
                      basis:'ادع الى سبيل ربك بالحكمة - النحل:125' },
                    { id:'RO-02', channel:'الدبلوماسية والعلاقات الدولية',
                      approach:'المعاهدات والصلح الامن - كما في حديث ابي داود 4292',
                      message:'التعاون ضد العدو المشترك (الارهاب، الظلم، الفقر)',
                      basis:'صلح الحديبية نموذج للتعاهد مع غير المسلمين' },
                    { id:'RO-03', channel:'التبادل الاقتصادي والتجاري',
                      approach:'التجارة مع الروم مذكورة في القران والسنة',
                      message:'التعاون الاقتصادي يبني جسور الثقة',
                      basis:'لايلاف قريش رحلة الشتاء (الشام-الروم) والصيف - قريش:1-2' },
                    { id:'RO-04', channel:'وسائل التواصل متعددة اللغات',
                      approach:'محتوى اسلامي بلغات العالم',
                      languages:['English','French','German','Spanish','Russian','Chinese','Italian'],
                      message:'تعريف الروم بالاسلام الحقيقي - رفع الشبهات',
                      platform:'محرك ترجمة شيخة متعدد اللغات' },
                    { id:'RO-05', channel:'الاتحاد ضد العدو المشترك',
                      approach:'كما في حديث ابو داود 4292 - حرب مشتركة ضد الخطر الثالث',
                      commonEnemies:['الارهاب والتطرف','الظلم والاستبداد','الفقر والجهل','تدمير البيئة'],
                      message:'المسلم والمسيحي والانسان العاقل متفقون على رفض الظلم',
                      basis:'لا ينهاكم الله عن الذين لم يقاتلوكم...ان تبروهم - الممتحنة:8' }
                ]
            },
            allianceProtocol: {
                title: 'بروتوكول الاتحاد الامن - ضمانات الامان',
                quranGuarantee: 'وان جنحوا للسلم فاجنح لها وتوكل على الله - الانفال:61',
                principles: [
                    { id:'AP-01', principle:'الوضوح الكامل',         detail:'تحديد العدو المشترك بوضوح' },
                    { id:'AP-02', principle:'الاحترام المتبادل',      detail:'كل طرف يحترم دين وقيم الاخر' },
                    { id:'AP-03', principle:'الشفافية في الاتفاقيات', detail:'عقود مكتوبة واضحة - لا غموض ولا خداع' },
                    { id:'AP-04', principle:'الافادة المتبادلة',      detail:'الاتحاد يخدم مصلحة الطرفين' },
                    { id:'AP-05', principle:'خطوط حمراء واضحة',      detail:'الهوية الاسلامية خط احمر - لا تنازل عن الدين' },
                    { id:'AP-06', principle:'اليات حل النزاع',        detail:'جهات تحكيم محايدة لحل الخلافات بالعدل' },
                    { id:'AP-07', principle:'الامان للمدنيين',         detail:'حماية المدنيين من الطرفين' }
                ],
                safetyGuarantees: [
                    'واوفوا بالعهد ان العهد كان مسؤولا - الاسراء:34',
                    'والذين هم لاماناتهم وعهدهم راعون - المؤمنون:8',
                    'النبي (ص) وفى بعهد الحديبية حتى عندما بدا في غير صالح المسلمين'
                ]
            },
            sheikhaRole: {
                title: 'دور منظومة شيخة في التواصل والاتحاد',
                role: 'شيخة = المنصة الرقمية الاسلامية للتجارة والتواصل والوحدة',
                tools: [
                    { id:'SR-01', tool:'محرك الترجمة متعدد اللغات',     purpose:'نشر المحتوى الاسلامي الصحيح بجميع لغات العالم' },
                    { id:'SR-02', tool:'منصة التجارة الاسلامية',         purpose:'بناء الجسور الاقتصادية مع المسلمين والروم' },
                    { id:'SR-03', tool:'مركز المحتوى الشرعي',            purpose:'تزويد العلماء والدعاة بالمحتوى الصحيح الموثق' },
                    { id:'SR-04', tool:'شبكة التواصل الاسلامية',         purpose:'ربط المسلمين في 57 دولة + مع الروم المتعاونين' },
                    { id:'SR-05', tool:'منظومة الاستخبارات التجارية',    purpose:'رصد الفرص الاقتصادية المشتركة' },
                    { id:'SR-06', tool:'نظام الاتفاقيات الذكي',          purpose:'ادارة المعاهدات والشراكات بالشفافية والعدل' }
                ],
                vision: 'شيخة = جسر بين المسلمين والروم في التجارة والتواصل والاتحاد الامن - حتى يتم النصر بامر الله'
            }
        };
    }

    _initPreparednessGuide() {
        return {
            title: 'دليل الاستعداد الشامل',
            verse: 'واعدوا لهم ما استطعتم من قوة ومن رباط الخيل - الانفال:60',
            dimensions: [
                { id:'PR-01', nameAr:'القوة الايمانية',    actions:['اتقان القران وحفظه','معرفة علامات الساعة','التمسك بالسنة','الاستعاذة من الدجال','حفظ اوائل الكهف'] },
                { id:'PR-02', nameAr:'القوة العلمية',      actions:['طلب العلم الشرعي والدنيوي','التفكير النقدي','فهم تاريخ الملاحم'] },
                { id:'PR-03', nameAr:'القوة الاقتصادية',  actions:['الاكتفاء الذاتي','الاستثمار الحلال','ادخار الذهب والفضة','الاستقلال عن الربا'] },
                { id:'PR-04', nameAr:'القوة التقنية',      actions:['التفوق في العلوم','الذكاء الاصطناعي للاسلام','الامن السيبراني'] },
                { id:'PR-05', nameAr:'القوة الاجتماعية',  actions:['تماسك الاسرة المسلمة','وحدة الامة على الحق','التكافل الاجتماعي'] },
                { id:'PR-06', nameAr:'قوة التواصل',        actions:['اتقان لغات الروم','بناء شبكات تواصل اسلامية','الدبلوماسية الشرعية','التجارة مع الروم كجسر للدعوة'] }
            ]
        };
    }

    _initScholarlyNotes() {
        return {
            title: 'ضوابط العلماء في فهم احاديث الملاحم وعلامات الساعة',
            notes: [
                { id:'SN-01', note:'التمييز بين الصحيح والضعيف - لا يبنى موقف على حديث ضعيف' },
                { id:'SN-02', note:'لا جزم بتوقيت - لا يعلم وقت الساعة الا الله وحده' },
                { id:'SN-03', note:'لا اسقاط مباشر على احداث معاصرة بعينها بلا علم شرعي' },
                { id:'SN-04', note:'لا تبرير لاعمال غير مشروعة باسم الملاحم والفتن' },
                { id:'SN-05', note:'الاتحاد مع الروم ظرفي مشروط - لا يعني التنازل عن الدين' },
                { id:'SN-06', note:'الاستعداد الحق: التقوى والعمل الصالح - لا التكاسل بانتظار الاحداث' }
            ],
            policy: 'هذا المحرك للتثقيف الشرعي - لا يصدر فتاوى ولا يحرض - العلم عند الله'
        };
    }

    /* ======= Public API ======= */
    getStatus() {
        return {
            success: true, name: this.name, version: this.version, mode: this.mode,
            disclaimer: this.disclaimer[0],
            summary: {
                allianceHadiths:        this._allianceHadiths.hadiths.length,
                malahemEvents:          this._malahemSequence.events.length,
                unionPillars:           this._islamicUnionModel.pillars.length,
                dajjalProtections:      this._dajjalSystem.protection.length,
                yajujLessons:           this._yajujMajuj.islamicLessons.length,
                majorSigns:             this._majorSigns.signs.length,
                minorSignCategories:    this._minorSigns.categories.length,
                ashratQuranVerses:      this._ashratAlSaah.quranVerses.length,
                muslimChannels:         this._outreachSystem.muslimOutreach.channels.length,
                romanChannels:          this._outreachSystem.romanOutreach.channels.length,
                allianceProtocols:      this._outreachSystem.allianceProtocol.principles.length,
                sheikhaTools:           this._outreachSystem.sheikhaRole.tools.length,
                prepDimensions:         this._preparednessGuide.dimensions.length
            },
            note: 'العلم عند الله - هذا المحتوى للتذكير والتثقيف الشرعي فقط',
            timestamp: new Date().toISOString()
        };
    }

    getDashboard() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            laHawl: 'ولا حول ولا قوة إلا بالله العلي العظيم',
            name: this.name, owner: this.owner, version: this.version,
            systems: [
                { num:1, name:'اتحاد المسلمين والروم ضد العدو من الخلف',  api:'/api/malahem/alliance-hadiths' },
                { num:2, name:'عيسى بن مريم (ص) وقتل المسيح الدجال',     api:'/api/malahem/dajjal-system'    },
                { num:3, name:'ياجوج وماجوج والقضاء عليهم',               api:'/api/malahem/yajuj-majuj'       },
                { num:4, name:'علامات الساعة الكبرى العشر',                api:'/api/malahem/major-signs'       },
                { num:5, name:'علامات الساعة الصغرى واشراط الساعة',        api:'/api/malahem/minor-signs'       },
                { num:6, name:'التواصل والوصول لكل مسلم وكل رومي',         api:'/api/malahem/outreach'          }
            ],
            disclaimer: this.disclaimer,
            verse: 'واعدوا لهم ما استطعتم من قوة ومن رباط الخيل - الانفال:60',
            timestamp: new Date().toISOString()
        };
    }

    getAllianceHadiths()    { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._allianceHadiths }; }
    getMalahemSequence()   { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._malahemSequence }; }
    getIslamicUnionModel() { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._islamicUnionModel }; }
    getGhanayimMalahem()   { return { bismillah:'بسم الله الرحمن الرحيم', ...this._ghanayimMalahem }; }
    getIsaDescend()        { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._isaDescend }; }
    getDajjalSystem()      { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._dajjalSystem }; }
    getYajujMajuj()        { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._yajujMajuj }; }
    getMajorSigns()        { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._majorSigns }; }
    getMinorSigns()        { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._minorSigns }; }
    getAshratAlSaah()      { return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], ...this._ashratAlSaah }; }
    getOutreachSystem()    { return { bismillah:'بسم الله الرحمن الرحيم', ...this._outreachSystem }; }
    getPreparednessGuide() { return { bismillah:'بسم الله الرحمن الرحيم', ...this._preparednessGuide }; }
    getScholarlyNotes()    { return { bismillah:'بسم الله الرحمن الرحيم', ...this._scholarlyNotes }; }

    getMalahemEvent(eventId) {
        const ev = this._malahemSequence.events.find(e => e.id === eventId);
        if (!ev) return { success:false, message:'الحدث غير موجود', validIds:this._malahemSequence.events.map(e=>e.id) };
        return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], event:ev };
    }

    getMajorSign(signId) {
        const sign = this._majorSigns.signs.find(s => s.id === signId);
        if (!sign) return { success:false, message:'العلامة غير موجودة', validIds:this._majorSigns.signs.map(s=>s.id) };
        return { bismillah:'بسم الله الرحمن الرحيم', disclaimer:this.disclaimer[0], sign };
    }

    getFullReport() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            laHawl: 'ولا حول ولا قوة إلا بالله العلي العظيم',
            disclaimer:         this.disclaimer,
            dashboard:          this.getDashboard(),
            system1_alliance:   this.getAllianceHadiths(),
            system1_sequence:   this.getMalahemSequence(),
            system1_union:      this.getIslamicUnionModel(),
            system1_ghanayim:   this.getGhanayimMalahem(),
            system2_isa:        this.getIsaDescend(),
            system2_dajjal:     this.getDajjalSystem(),
            system3_yajuj:      this.getYajujMajuj(),
            system4_majorSigns: this.getMajorSigns(),
            system5_minorSigns: this.getMinorSigns(),
            system5_ashrat:     this.getAshratAlSaah(),
            system6_outreach:   this.getOutreachSystem(),
            preparedness:       this.getPreparednessGuide(),
            scholarlyNotes:     this.getScholarlyNotes(),
            closing: {
                dua: 'اللهم ارنا الحق حقا وارزقنا اتباعه، وارنا الباطل باطلا وارزقنا اجتنابه',
                verse: 'ان تنصروا الله ينصركم ويثبت اقدامكم - محمد:7',
                salawat: 'اللهم صل وسلم على نبينا محمد واله وصحبه اجمعين'
            },
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = SheikhaMalahemUnionEngine;
