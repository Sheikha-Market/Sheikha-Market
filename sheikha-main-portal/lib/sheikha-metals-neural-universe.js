/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — كون الوكلاء المعدنيين العصبيين
 * "شبكة عصبية إدارية للمعادن والسكراب — كل معدن وكيل — كل إجراء وكيل"
 *
 * ﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾ — الحديد:25
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة:31
 * «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — أداء متقن متخصص
 * «لا ضرر ولا ضرار» — رقيب على كل قرار
 *
 * الهيكل:
 *   §1  METALS_UNIVERSE          — 33 معدن × خصائص + 28 تصنيف سكراب + HS codes
 *   §2  SUPPLY_CHAIN_NODES       — 7 عقد × إجراءات (منجم→مصهر→مصنع→موزع→مستخدم)
 *   §3  PRODUCTION_PROCESSES     — 6 مراحل إنتاج × إجراءات تفصيلية
 *   §4  TRANSPORT_MATRIX         — 6 وسائل نقل × إجراءات جمركية وتوثيقية
 *   §5  ADMIN_TECHNIQUES         — 12 تقنية إدارية متخصصة
 *   §6  MetalsNeuralAgent        — وكيل معدني متخصص
 *   §7  MetalsNeuralCluster      — مجموعة وكلاء متخصصة
 *   §8  NeuralAdminNetwork       — الشبكة الإدارية العصبية
 *   §9  SheikhaMetalsNeuralUniverse — المحرك الكبير
 *   §10 التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');
const os           = require('os');

// ══════════════════════════════════════════════════════════════════════════════
// §1 — METALS_UNIVERSE
//      كل معدن بخصائصه الكاملة + تصنيفات السكراب + رموز HS
// ══════════════════════════════════════════════════════════════════════════════

const METALS_UNIVERSE = {

    // ─── المعادن الأساسية ───
    metals: [
        { id:'Fe',  ar:'حديد',       en:'Iron/Steel',    group:'ferrous',    melt:1538, density:7.87, hsCode:'7204', lme:false, comex:false, price:{unit:'USD/ton',  ref:450  }, sharia:'حلال — ﴿وَأَنزَلْنَا الْحَدِيدَ﴾'  },
        { id:'Cu',  ar:'نحاس نقي',   en:'Copper',        group:'non-ferrous',melt:1085, density:8.96, hsCode:'7404', lme:true,  comex:true,  price:{unit:'USD/ton',  ref:9200 }, sharia:'حلال — للتوصيل والبناء'             },
        { id:'Al',  ar:'ألومنيوم',   en:'Aluminium',     group:'non-ferrous',melt:660,  density:2.70, hsCode:'7602', lme:true,  comex:false, price:{unit:'USD/ton',  ref:2350 }, sharia:'حلال — خفيف ومتعدد الاستخدام'       },
        { id:'Zn',  ar:'زنك',        en:'Zinc',          group:'non-ferrous',melt:420,  density:7.13, hsCode:'7902', lme:true,  comex:false, price:{unit:'USD/ton',  ref:2900 }, sharia:'حلال — للطلاء والحماية'             },
        { id:'Pb',  ar:'رصاص',       en:'Lead',          group:'non-ferrous',melt:327,  density:11.3, hsCode:'7802', lme:true,  comex:false, price:{unit:'USD/ton',  ref:2000 }, sharia:'حلال بضوابط — اشتراطات السلامة'    },
        { id:'Ni',  ar:'نيكل',       en:'Nickel',        group:'non-ferrous',melt:1455, density:8.91, hsCode:'7503', lme:true,  comex:false, price:{unit:'USD/ton',  ref:16000}, sharia:'حلال — للصلب المقاوم للصدأ'         },
        { id:'Sn',  ar:'قصدير',      en:'Tin',           group:'non-ferrous',melt:232,  density:7.31, hsCode:'8002', lme:true,  comex:false, price:{unit:'USD/ton',  ref:26000}, sharia:'حلال — للتعليب والحماية'            },
        { id:'Mn',  ar:'منغنيز',     en:'Manganese',     group:'ferrous-alloy',melt:1246,density:7.47,hsCode:'2602', lme:false, comex:false, price:{unit:'USD/ton',  ref:1800 }, sharia:'حلال — لتقوية الصلب'                },
        { id:'Cr',  ar:'كروم',       en:'Chromium',      group:'ferrous-alloy',melt:1907,density:7.19,hsCode:'7112', lme:false, comex:false, price:{unit:'USD/lb',   ref:1.20 }, sharia:'حلال — للصلب المقاوم للصدأ'         },
        { id:'Co',  ar:'كوبالت',     en:'Cobalt',        group:'strategic',  melt:1495, density:8.90, hsCode:'8105', lme:true,  comex:false, price:{unit:'USD/lb',   ref:13   }, sharia:'حلال — للبطاريات والمحركات'         },
        { id:'Mo',  ar:'موليبدينوم', en:'Molybdenum',    group:'strategic',  melt:2623, density:10.2, hsCode:'8102', lme:false, comex:false, price:{unit:'USD/lb',   ref:20   }, sharia:'حلال — للصلب عالي التحمل'          },
        { id:'Ti',  ar:'تيتانيوم',   en:'Titanium',      group:'strategic',  melt:1668, density:4.51, hsCode:'8108', lme:false, comex:false, price:{unit:'USD/kg',   ref:11   }, sharia:'حلال — للطيران والطب'               },
        { id:'W',   ar:'تنغستن',     en:'Tungsten',      group:'strategic',  melt:3422, density:19.3, hsCode:'8101', lme:false, comex:false, price:{unit:'USD/kg',   ref:35   }, sharia:'حلال — لأدوات القطع الصناعي'        },
        { id:'V',   ar:'فاناديوم',   en:'Vanadium',      group:'strategic',  melt:1910, density:6.11, hsCode:'8112', lme:false, comex:false, price:{unit:'USD/lb',   ref:8    }, sharia:'حلال — لبطاريات التدفق وصلب الأداء'},
        { id:'Au',  ar:'ذهب',        en:'Gold',          group:'precious',   melt:1064, density:19.3, hsCode:'7108', lme:false, comex:true,  price:{unit:'USD/troy oz',ref:2300}, sharia:'حلال — معيار المال الصحيح'         },
        { id:'Ag',  ar:'فضة',        en:'Silver',        group:'precious',   melt:962,  density:10.5, hsCode:'7106', lme:false, comex:true,  price:{unit:'USD/troy oz',ref:27  }, sharia:'حلال — معيار المال الصحيح'         },
        { id:'Pt',  ar:'بلاتين',     en:'Platinum',      group:'precious',   melt:1768, density:21.4, hsCode:'7110', lme:false, comex:true,  price:{unit:'USD/troy oz',ref:950 }, sharia:'حلال — للمجوهرات والصناعة'         },
        { id:'Pd',  ar:'بلاديوم',    en:'Palladium',     group:'precious',   melt:1555, density:12.0, hsCode:'7110', lme:false, comex:true,  price:{unit:'USD/troy oz',ref:1000}, sharia:'حلال — للمحولات الحفازة'           },
        // سبائك
        { id:'SS304',ar:'استانلس 304',en:'Stainless 304',group:'alloy',      melt:1400, density:7.93, hsCode:'7204', lme:false, comex:false, price:{unit:'USD/ton',  ref:1800 }, sharia:'حلال — للمطابخ والمستشفيات'         },
        { id:'SS316',ar:'استانلس 316',en:'Stainless 316',group:'alloy',      melt:1400, density:7.98, hsCode:'7204', lme:false, comex:false, price:{unit:'USD/ton',  ref:2200 }, sharia:'حلال — للبيئات الكيميائية'          },
        { id:'SS430',ar:'استانلس 430',en:'Stainless 430',group:'alloy',      melt:1450, density:7.74, hsCode:'7204', lme:false, comex:false, price:{unit:'USD/ton',  ref:1200 }, sharia:'حلال — للأجهزة المنزلية'            },
        { id:'BRASS',ar:'نحاس أصفر', en:'Brass',         group:'alloy',      melt:950,  density:8.50, hsCode:'7404', lme:false, comex:false, price:{unit:'USD/ton',  ref:5500 }, sharia:'حلال — للصنابير والأجهزة'           },
        { id:'BRONZE',ar:'برونز',    en:'Bronze',        group:'alloy',      melt:950,  density:8.90, hsCode:'7404', lme:false, comex:false, price:{unit:'USD/ton',  ref:5800 }, sharia:'حلال — للمحامل والفنون'             },
        // بطاريات وإلكترونيات
        { id:'BAT',  ar:'بطاريات رصاص',en:'Lead Acid Batteries',group:'scrap-complex',melt:327,density:11.3,hsCode:'8548',lme:false,comex:false,price:{unit:'SAR/kg',ref:0.8},  sharia:'حلال — مع اشتراطات التخلص البيئي'  },
        { id:'ECAT', ar:'محول حفازي', en:'Catalytic Converter',group:'precious-scrap',melt:1600,density:8.0,hsCode:'8421',lme:false,comex:false,price:{unit:'USD/piece',ref:120}, sharia:'حلال — يحتوي Pt/Pd/Rh'            },
        { id:'PCB',  ar:'أجزاء إلكترونية',en:'PCB/E-Scrap',group:'e-scrap',melt:0,    density:0,    hsCode:'8548', lme:false, comex:false, price:{unit:'USD/kg',   ref:3    }, sharia:'حلال — مع إجراءات باسل'            },
        { id:'WIRE', ar:'نحاس أسلاك', en:'Copper Wire',   group:'non-ferrous',melt:1085, density:8.96, hsCode:'7408', lme:false, comex:false, price:{unit:'SAR/kg',   ref:28   }, sharia:'حلال — قياس النقاء مطلوب'          },
        { id:'ALU_P',ar:'ألومنيوم بروفيل',en:'Al Profile', group:'non-ferrous',melt:660, density:2.70, hsCode:'7602', lme:false, comex:false, price:{unit:'SAR/kg',   ref:4.5  }, sharia:'حلال — للبناء والتشييد'            },
    ],

    // ─── تصنيفات السكراب (ISRI + محلي) ───
    scrapGrades: [
        // حديدي
        { code:'HMS1',  ar:'حديد ثقيل #1',     isri:'201',  hsCode:'7204.10', purity:98, price:'SAR/ton', priceRef:500  },
        { code:'HMS2',  ar:'حديد ثقيل #2',     isri:'202',  hsCode:'7204.10', purity:95, price:'SAR/ton', priceRef:420  },
        { code:'BALING',ar:'حديد مضغوط',       isri:'205',  hsCode:'7204.10', purity:97, price:'SAR/ton', priceRef:450  },
        { code:'SHRED', ar:'حديد مقطع',        isri:'211',  hsCode:'7204.10', purity:80, price:'SAR/ton', priceRef:380  },
        { code:'CAST',  ar:'حديد زهر',         isri:'231',  hsCode:'7204.50', purity:92, price:'SAR/ton', priceRef:350  },
        { code:'TURNINGS',ar:'برادة حديد',     isri:'241',  hsCode:'7204.30', purity:85, price:'SAR/ton', priceRef:280  },
        // نحاس
        { code:'BIRCH', ar:'نحاس نقي #1',      isri:'102',  hsCode:'7404.00', purity:99, price:'SAR/kg',  priceRef:30   },
        { code:'CLIFF', ar:'نحاس برادة',       isri:'103',  hsCode:'7404.00', purity:96, price:'SAR/kg',  priceRef:27   },
        { code:'CANDY', ar:'نحاس كابل',        isri:'105',  hsCode:'7408.11', purity:99, price:'SAR/kg',  priceRef:29   },
        { code:'CLOVE', ar:'نحاس أصفر مشكل',  isri:'106',  hsCode:'7404.00', purity:65, price:'SAR/kg',  priceRef:19   },
        { code:'DREAM', ar:'نحاس حمام #2',     isri:'107',  hsCode:'7404.00', purity:92, price:'SAR/kg',  priceRef:26   },
        // ألومنيوم
        { code:'TWITCH',ar:'ألومنيوم مقطع',   isri:'406',  hsCode:'7602.00', purity:88, price:'SAR/kg',  priceRef:4.0  },
        { code:'TAINT', ar:'ألومنيوم صفيح',   isri:'410',  hsCode:'7602.00', purity:88, price:'SAR/kg',  priceRef:4.2  },
        { code:'ZORBA', ar:'غير حديدي مختلط', isri:'240',  hsCode:'7602.00', purity:70, price:'SAR/ton', priceRef:1800 },
        // استانلس
        { code:'SS18/8',ar:'استانلس 18/8',     isri:'N/A',  hsCode:'7204.21', purity:99, price:'SAR/kg',  priceRef:3.5  },
        { code:'SS430', ar:'استانلس 430',      isri:'N/A',  hsCode:'7204.21', purity:99, price:'SAR/kg',  priceRef:2.0  },
        // رصاص/زنك
        { code:'WHEELWEIGHTS',ar:'أوزان عجلات',isri:'N/A', hsCode:'7802.00', purity:85, price:'SAR/kg',  priceRef:1.5  },
        { code:'ZINCDROSS',ar:'ثفل زنك',       isri:'N/A',  hsCode:'7902.00', purity:80, price:'SAR/kg',  priceRef:2.5  },
    ],

    // ─── قوانين وخصائص علمية متخصصة ───
    scienceLaws: [
        { id:'HALL_HEROULT',   ar:'قانون هول-هيرولت',      domain:'Al-smelting',   formula:'Al₂O₃ + C → Al + CO₂',         usage:'صهر الألومنيوم كهربائياً' },
        { id:'BESSEMER',       ar:'عملية بيسيمر',          domain:'steel-making',  formula:'Fe + O₂ → FeO + slag',           usage:'تنقية الفولاذ من الكربون' },
        { id:'FARADAY_ELEC',   ar:'قانون فاراداي',         domain:'electrolysis',  formula:'m = (M×I×t)/(n×F)',              usage:'ترسيب معادن كهربائياً'   },
        { id:'POURBAIX',       ar:'مخطط بوربيه',           domain:'corrosion',     formula:'E vs pH diagram',                usage:'تقييم التآكل والحماية'   },
        { id:'FICK_DIFFUSION', ar:'قانون فيك للانتشار',   domain:'heat-treatment',formula:'J = -D × (dC/dx)',               usage:'تحليل الانتشار الحراري'  },
        { id:'HUME_ROTHERY',   ar:'قواعد هيوم-روثيري',    domain:'alloying',      formula:'atomic radius ratio < 15%',      usage:'توقع انحلال السبائك'     },
        { id:'GIBBS_PHASE',    ar:'قاعدة الطور لغيبس',    domain:'phase-diagrams',formula:'F = C - P + 2',                  usage:'رسم مخططات الطور'         },
        { id:'VICKERS',        ar:'اختبار الصلادة فيكرز', domain:'QC',            formula:'HV = 1.854×F/d²',               usage:'قياس صلادة المعادن'       },
        { id:'CHARPY',         ar:'اختبار شاربي',          domain:'QC',            formula:'CVN = impact energy (J)',        usage:'قياس مقاومة الصدمات'     },
        { id:'YIELD_STRESS',   ar:'إجهاد الخضوع',         domain:'mechanical',    formula:'σ_y = F_y / A₀',                usage:'تصميم هياكل فولاذية'     },
        { id:'BERNOULLI_FLOW', ar:'معادلة برنولي (سوائل)',domain:'casting',       formula:'P+½ρv²+ρgh = const',            usage:'تصميم قوالب الصب'        },
        { id:'STERN_GEARY',    ar:'معادلة ستيرن-جيري',    domain:'corrosion-rate',formula:'i_corr = B/(Rp)',               usage:'قياس معدل تآكل المعادن'  },
        { id:'SCHERRER',       ar:'معادلة شيرر',           domain:'metallography', formula:'D = Kλ/(βcosθ)',               usage:'XRD — قياس حجم الحبيبات' },
        { id:'HALL_PETCH',     ar:'قانون هول-بيتش',       domain:'grain-size',    formula:'σ_y = σ₀ + k/√d',             usage:'تأثير حجم الحبيبة على القوة'},
        { id:'AVRAMI',         ar:'معادلة أفرامي',         domain:'phase-transform',formula:'f = 1 - exp(-kt^n)',           usage:'معدل التحول في المعالجة الحرارية'},
    ],

    // ─── معايير دولية ───
    standards: [
        { id:'ISRI_CODES',  body:'ISRI',     region:'Global', scope:'تصنيف السكراب'              },
        { id:'LME_SPECS',   body:'LME',      region:'Global', scope:'مواصفات التسليم في اللندن'  },
        { id:'ASTM_A36',    body:'ASTM',     region:'US',     scope:'صلب هيكلي'                  },
        { id:'ISO_9001',    body:'ISO',      region:'Global', scope:'إدارة الجودة'                },
        { id:'ISO_14001',   body:'ISO',      region:'Global', scope:'إدارة البيئة'                },
        { id:'OHSAS_18001', body:'OHSAS',    region:'Global', scope:'السلامة المهنية'             },
        { id:'SASO',        body:'SASO',     region:'KSA',    scope:'مواصفات سعودية — معادن'     },
        { id:'GSO',         body:'GSO',      region:'GCC',    scope:'الخليج — معادن وسكراب'      },
        { id:'REACH',       body:'EU',       region:'EU',     scope:'المواد الكيميائية والمعادن'  },
        { id:'BASEL_CONV',  body:'UN',       region:'Global', scope:'النفايات الخطرة — سكراب PCB'},
        { id:'HS_2022',     body:'WCO',      region:'Global', scope:'التصنيف الجمركي الدولي'     },
        { id:'INCOTERMS',   body:'ICC',      region:'Global', scope:'بنود التسليم التجارية'       },
    ],
};

// ══════════════════════════════════════════════════════════════════════════════
// §2 — SUPPLY_CHAIN_NODES
//      كل عقدة في السلسلة: المنجم → المطحنة → المصهر → المصنع → الموزع
// ══════════════════════════════════════════════════════════════════════════════

const SUPPLY_CHAIN_NODES = [
    {
        id: 'MINE',       ar: 'المنجم / المحجر',      order: 1,
        subTypes: ['منجم مفتوح', 'منجم تحت الأرض', 'محجر', 'حقل استخراج'],
        procedures: [
            'الاستكشاف الجيولوجي — المساحة والتحليل',
            'الحفر الاختباري — تقييم الاحتياطيات',
            'الحفر والتفجير — استخراج الصخر',
            'التحميل والنقل الداخلي',
            'سحق الخام الأولي — Crushing',
            'إدارة مكب النفايات الصخرية',
            'مراقبة المياه الجوفية',
            'تقرير الاحتياطيات (JORC/NI 43-101)',
            'اشتراطات السلامة — MSHA',
            'مراقبة الغبار والانبعاثات',
        ],
        licenses: ['رخصة تعدين', 'دراسة البيئة EIA', 'موافقة سلطة المياه'],
        islamicNote: '﴿وَفِي الْأَرْضِ قِطَعٌ مُتَجَاوِرَاتٌ﴾ — الأرض أمانة',
    },
    {
        id: 'MILL',       ar: 'مطحنة المعالجة',       order: 2,
        subTypes: ['مطحنة كروية', 'مطحنة نصف ذاتية', 'وحدة ترشيح'],
        procedures: [
            'الطحن الأولي — Rod/Ball Mill',
            'التعويم — Froth Flotation',
            'الفصل المغناطيسي',
            'الترسيب الجاذبي — Gravity',
            'الاستخلاص بالمذيبات — SX-EW',
            'التجفيف والتحبيب',
            'تحليل المختبر — XRF/ICP',
            'إدارة نفايات التعويم (Tailings)',
            'تقارير الانبعاثات البيئية',
            'ضبط جودة التركيز — Grade Control',
        ],
        licenses: ['موافقة بيئية', 'رخصة تصريف المياه'],
        islamicNote: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — إتقان المعالجة',
    },
    {
        id: 'SMELTER',    ar: 'المصهر / المكرر',      order: 3,
        subTypes: ['مصهر كهربائي EAF', 'مصهر القوس BOF', 'مصهر ألومنيوم', 'مكرر نحاس', 'مصهر نفط الرصاص'],
        procedures: [
            'تحميل الشحنة — الإسقاط والوزن',
            'الصهر الكهربائي / البيروميتالرجي',
            'إضافة المصفيات والمنقيات (Flux)',
            'إزالة الخبث — Slag Skimming',
            'التكرير الكيميائي / الكهربائي',
            'الصب في قوالب Ingot / Anode',
            'معالجة حرارية — Annealing / Quenching',
            'مراقبة جودة الذوبان — Spectrometry',
            'إدارة انبعاثات الغاز — DeSOx',
            'شهادة التحليل — CoA',
            'وزن وشهادة البورصة',
            'موافقة LME/COMEX على المنتج',
        ],
        licenses: ['ISO 9001', 'ISO 14001', 'ترخيص وزارة الصناعة'],
        islamicNote: '«دِقَّة الوزن وصِدق المكيال» — دقة الصهر والشهادة',
    },
    {
        id: 'FABRICATOR', ar: 'المصنع / المشكِّل',    order: 4,
        subTypes: ['مصنع لفافات', 'مصنع بثق', 'مصنع سحب أسلاك', 'مصنع قوالب ضغط', 'مصنع تشكيل حر'],
        procedures: [
            'استلام المعدن الأساسي / الإنجوت',
            'فحص المدخلات — Incoming Inspection',
            'التسخين المسبق — Preheating Furnace',
            'اللفافة الساخنة / الباردة — Rolling',
            'البثق — Extrusion',
            'السحب — Drawing',
            'التشكيل بالضغط — Forging / Stamping',
            'الصب بالقوالب — Die Casting',
            'المعالجة الحرارية — T6/T4/Anneal',
            'الطلاء السطحي — Zinc/Chrome Plating',
            'اختبارات الجودة — Tensile/Hardness/Bend',
            'التغليف والتعبئة',
            'إصدار شهادة المطابقة — MTC',
        ],
        licenses: ['ISO 9001', 'SASO', 'شهادة مطابقة GSO'],
        islamicNote: '«إن الله كتب الإحسان على كل شيء» — جودة الإنتاج فريضة',
    },
    {
        id: 'COLLECTOR',  ar: 'جامع السكراب',          order: 2,
        subTypes: ['جامع متجول', 'مستودع سكراب', 'مصقان هدم', 'سيارة إكراك'],
        procedures: [
            'الشراء والاستلام الميداني',
            'الفرز الأولي حسب نوع المعدن',
            'القياس والوزن بالميزان المعتمد',
            'تصوير الاستلام والتوثيق',
            'فحص الإشعاعية — Geiger counter',
            'فصل الخطرة — بطاريات / PCB',
            'الضغط والتكتيل — Baling',
            'التشريد — Shredding',
            'تحليل سريع — XRF للتأكيد',
            'إصدار وصل الاستلام الرسمي',
        ],
        licenses: ['رخصة جمع السكراب', 'سجل تجاري'],
        islamicNote: '«يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ» — الأمانة في الوزن',
    },
    {
        id: 'TRADER',     ar: 'التاجر / الوسيط',      order: 5,
        subTypes: ['وسيط دولي', 'تاجر محلي', 'وكيل شراء', 'وكيل بيع'],
        procedures: [
            'تقييم العرض — Due Diligence',
            'مفاوضة السعر بالمرجع (LME±Premium)',
            'إصدار عرض الأسعار — Offer Sheet',
            'توقيع عقد البيع — Sales Contract',
            'LC / TT / CAD — ضمان الدفع',
            'طلب شهادة التحليل — CoA',
            'ترتيب الشحن والتأمين',
            'إخطار شركة الفحص القائمة',
            'مراقبة التسليم',
            'فض النزاعات — ICC Arbitration',
        ],
        licenses: ['سجل تجاري', 'AML/KYC المصرفي', 'موافقة SAMA للمدفوعات الكبيرة'],
        islamicNote: '«البيعان بالخيار ما لم يتفرقا» — حق الخيار محفوظ',
    },
    {
        id: 'END_USER',   ar: 'المستخدم النهائي',     order: 6,
        subTypes: ['مصنع صلب مدمج', 'مسبك', 'مصنع سيارات', 'شركة بناء', 'مصنع كابلات'],
        procedures: [
            'إصدار RFQ — طلب عرض أسعار',
            'تقييم الموردين',
            'فحص العينة',
            'أمر الشراء PO',
            'استلام الشحنة',
            'فحص الاستلام — Incoming QC',
            'خطاب بنكي LC أو TT',
            'تخليص جمركي',
            'تحليل المختبر الداخلي',
            'المصادقة على الفاتورة',
        ],
        licenses: [],
        islamicNote: '«لا يحل مال امرئ مسلم إلا عن طيب نفسه» — رضا الطرفين شرط',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §3 — PRODUCTION_PROCESSES
//      6 مراحل تفصيلية من الاستخراج حتى المنتج النهائي
// ══════════════════════════════════════════════════════════════════════════════

const PRODUCTION_PROCESSES = [
    {
        stage: 'EXTRACTION',    ar: 'الاستخراج',    order: 1,
        steps: [
            { id:'GEO_SURVEY',    ar:'المسح الجيولوجي',        tools:['XRF field','Rock sampling','Drilling rigs'],          output:'تقرير الاحتياطيات' },
            { id:'BLASTING',      ar:'التفجير والحفر',          tools:['ANFO explosives','Drill & blast design'],              output:'كتل الخام المكسورة'    },
            { id:'LOADING',       ar:'التحميل',                 tools:['Hydraulic shovel','Front-end loader'],                 output:'شاحنات مملوءة'         },
            { id:'HAULING',       ar:'النقل الداخلي',           tools:['Haul trucks 100-400t','Conveyor belts'],               output:'خام عند المطحنة'       },
            { id:'PRIMARY_CRUSH', ar:'السحق الأولي',            tools:['Jaw crusher','Gyratory crusher'],                     output:'خام -150mm'            },
        ],
        kpis: ['نسبة الاسترداد %', 'تكلفة/طن مستخرج', 'معدل إصابات العمل'],
    },
    {
        stage: 'BENEFICIATION', ar: 'تحسين الخام وتركيزه', order: 2,
        steps: [
            { id:'GRINDING',      ar:'الطحن الثانوي',           tools:['Ball mill','Rod mill','SAG mill'],                    output:'لب معدني -75µm'        },
            { id:'FLOTATION',     ar:'التعويم الرغوي',          tools:['Flotation cells','Reagents xanthate'],                output:'تركيز نحاس/رصاص/زنك'   },
            { id:'MAG_SEP',       ar:'الفصل المغناطيسي',        tools:['Low/High intensity magnets','WHIMS'],                 output:'تركيز حديد/استانلس'    },
            { id:'GRAVITY',       ar:'الفصل الجاذبي',           tools:['Jig','Spiral','Shaking table'],                      output:'تركيز ذهب/نحاس ثقيل'   },
            { id:'LEACHING',      ar:'الاستخلاص الرطب',         tools:['Heap leach pad','CIL tanks','SX-EW'],                 output:'محلول معدني نقي'       },
        ],
        kpis: ['درجة التركيز %', 'معدل الاسترداد %', 'استهلاك الكيماويات'],
    },
    {
        stage: 'SMELTING',      ar: 'الصهر والتنقية',  order: 3,
        steps: [
            { id:'CHARGING',      ar:'شحن الفرن',                tools:['EAF','BOF','Blast furnace','Reverb furnace'],        output:'شحنة موزونة ومحللة'    },
            { id:'MELTING',       ar:'الصهر',                    tools:['Electric arc','Oxygen lance','Induction furnace'],   output:'معدن مصهور'             },
            { id:'REFINING',      ar:'التكرير',                  tools:['AOD converter','Electrolytic cell','Fire refining'], output:'معدن نقي >99%'          },
            { id:'CASTING',       ar:'الصب والتشكيل',            tools:['Continuous caster','Ingot moulds','Anode casting'],  output:'إنجوت/أندود/لوح'       },
            { id:'SAMPLING',      ar:'أخذ العينات والتحليل',     tools:['OES spectrometer','XRF','ICP-MS'],                  output:'شهادة تحليل CoA'        },
        ],
        kpis: ['نسبة النقاء %', 'تكلفة الطاقة/طن', 'كفاءة استرداد المعدن'],
    },
    {
        stage: 'FABRICATION',   ar: 'التشكيل والتصنيع', order: 4,
        steps: [
            { id:'HOT_ROLLING',   ar:'اللفافة الساخنة',          tools:['Hot Rolling Mill','Roughing+Finishing stands'],      output:'لوح/قضيب مطلوب'        },
            { id:'COLD_ROLLING',  ar:'اللفافة الباردة',          tools:['Cold Rolling Mill','Skin-pass mill'],                output:'صفيحة رقيقة دقيقة'      },
            { id:'EXTRUSION',     ar:'البثق',                    tools:['Direct/Indirect extrusion press'],                   output:'أنابيب/بروفيلات Al'     },
            { id:'DRAWING',       ar:'السحب',                    tools:['Wire drawing machine','Die boxes'],                  output:'أسلاك/أنابيب دقيقة'     },
            { id:'HEAT_TREAT',    ar:'المعالجة الحرارية',        tools:['Annealing furnace','Quench tank','Aging oven'],      output:'خصائص ميكانيكية مضبوطة'},
        ],
        kpis: ['دقة الأبعاد mm', 'معدل العيوب ppm', 'مردود الإنتاج %'],
    },
    {
        stage: 'QA_QC',         ar: 'ضبط الجودة والاختبارات', order: 5,
        steps: [
            { id:'TENSILE',       ar:'اختبار الشد',              tool:'Universal Testing Machine (UTM)',   std:'ASTM E8',    output:'σ_y, σ_u, الاستطالة'   },
            { id:'HARDNESS',      ar:'اختبار الصلادة',           tool:'Vickers/Brinell/Rockwell Tester',  std:'ASTM E18',   output:'HV/HB/HRC'              },
            { id:'IMPACT',        ar:'اختبار الصدمة',            tool:'Charpy pendulum',                  std:'ASTM E23',   output:'CVN joules'              },
            { id:'CHEMICAL',      ar:'التحليل الكيميائي',        tool:'OES/XRF/ICP',                      std:'ISO 17025',  output:'تركيب العناصر %'        },
            { id:'NDT',           ar:'الفحص غير الإتلافي',       tool:'UT/PT/MT/RT',                      std:'ASME V',     output:'شهادة خلو من العيوب'    },
            { id:'DIMENSION',     ar:'القياسات الأبعادية',       tool:'CMM/Laser scan',                   std:'ISO 2768',   output:'تقرير المقاسات'         },
        ],
        kpis: ['نسبة الرفض %', 'تكرار العيوب ppm', 'مؤشر Cpk'],
    },
    {
        stage: 'ENVIRONMENTAL',  ar: 'البيئة والاستدامة',   order: 6,
        steps: [
            { id:'EMISSION_MON',  ar:'مراقبة الانبعاثات',        tools:['CEMS','Stack sampling'],          regulation:'MEPCO / Basel',  output:'تقرير انبعاثات شهري'   },
            { id:'WASTEWATER',    ar:'معالجة مياه الصرف',        tools:['ETP plant','pH control'],          regulation:'ISO 14001',      output:'مياه مُعالَجة آمنة'    },
            { id:'HAZMAT_HANDLE', ar:'التعامل مع المواد الخطرة', tools:['SDS sheets','PPE','Containment'],  regulation:'GHS/OSHA',       output:'سجل آمن للمواد الخطرة'},
            { id:'CARBON_AUDIT',  ar:'تدقيق البصمة الكربونية',  tools:['GHG protocol','Carbon calculator'],regulation:'ISO 14064',      output:'تقرير GHG سنوي'        },
            { id:'RECYCLING',     ar:'إعادة التدوير الداخلي',   tools:['Scrap sorting bins','Tracking ERP'],regulation:'Circular Economy',output:'معدل إعادة التدوير %'  },
        ],
        kpis: ['كمية CO₂ كغ/طن', 'نسبة إعادة التدوير %', 'مخالفات التفتيش'],
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §4 — TRANSPORT_MATRIX
//      كل وسيلة نقل × إجراءاتها الكاملة
// ══════════════════════════════════════════════════════════════════════════════

const TRANSPORT_MATRIX = [
    {
        id: 'ROAD_TRUCK', ar: 'شاحنة برية',    modes: ['Flatbed','Tipper','Curtainsider','Closed van'],
        procedures: [
            'إصدار أمر التحميل (Loading Order)',
            'وزن الشاحنة — جسر الميزان',
            'تثبيت الحمولة (Securing/Lashing)',
            'فاتورة الشحن CMR / بوليصة برية',
            'شهادة المنشأ (COO)',
            'بيان الخطورة ADR (للمواد الخطرة)',
            'رخصة الثقيل لما يتجاوز 40 طن',
            'تتبع GPS',
            'تأمين الشحنة',
            'تسليم للمستلم مع توقيع',
        ],
        maxLoad: '40 ton', costRef: 'SAR 3-8/km',
    },
    {
        id: 'RAIL',       ar: 'سكة حديد',      modes: ['Open wagon','Flat wagon','Tank wagon','Box car'],
        procedures: [
            'حجز العربات لدى شركة السكك',
            'وزن الصنف في محطة الإرسال',
            'بوليصة سكة حديدية — Consignment Note',
            'تثبيت الحمولة',
            'تأمين البضاعة',
            'تتبع العربة عبر نظام الشركة',
            'التفتيش الجمركي عند الحدود',
            'إشعار الوصول',
        ],
        maxLoad: '60-90 ton per wagon', costRef: 'USD 15-30/ton (cross-border)',
    },
    {
        id: 'SEA_BULK',   ar: 'شحن بحري سائب', modes: ['Bulk carrier','Handysize','Supramax','Panamax','Capesize'],
        procedures: [
            'عقد الإيجار — Voyage/Time Charter',
            'تعيين الوكيل الملاحي',
            'شهادة القباطن (Master Certificate)',
            'بوليصة الشحن B/L',
            'كشف الشحنة (Cargo Manifest)',
            'شهادة الوزن والنوعية (SGS/Bureau Veritas)',
            'شهادة المنشأ COO',
            'خطاب الاعتماد LC / TT',
            'تصريح الجمارك (Export/Import)',
            'وثيقة MSDS للمواد الخطرة',
            'فحص بالأشعة (ISPM 15)',
            'التخليص في الميناء المقصد',
        ],
        maxLoad: '5,000-180,000 ton', costRef: 'USD 25-60/ton (دولياً)',
    },
    {
        id: 'SEA_CONTAINER', ar: 'حاوية بحرية', modes: ['20GP','40GP','40HC','Open Top','Flat Rack'],
        procedures: [
            'حجز الحاوية (Booking Confirmation)',
            'إشعار التحميل (VGM / Weight)',
            'بوليصة الشحن B/L',
            'قائمة التعبئة (Packing List)',
            'الفاتورة التجارية',
            'شهادة المنشأ COO',
            'تصريح جمارك صادر',
            'دفع رسوم الميناء (THC/BAF/CAF)',
            'الافراج الجمركي في الوجهة',
            'التسليم من المستودع',
        ],
        maxLoad: '28 ton (20GP)', costRef: 'USD 1,200-4,000/container',
    },
    {
        id: 'AIR_CARGO',  ar: 'شحن جوي',       modes: ['Freighter','Belly cargo','Charter'],
        procedures: [
            'طلب شهادة DGR (للمواد الخطرة)',
            'بوليصة جوية AWB',
            'قائمة التعبئة',
            'الفاتورة الجمركية',
            'تصريح جمارك صادر',
            'فحص أمني للشحنة',
            'الافراج الجمركي في المطار المقصد',
        ],
        maxLoad: '100 ton', costRef: 'USD 2-8/kg',
    },
    {
        id: 'PIPELINE',   ar: 'خط أنابيب',     modes: ['Slurry pipeline','Gas pipeline','LME warrant transfer'],
        procedures: [
            'تحليل عينة الخام الداخل',
            'قياس معدل التدفق (Flow meter)',
            'مراقبة الضغط',
            'شهادة التحويل الكمية (Metering Certificate)',
            'تقرير التوازن الشهري',
        ],
        maxLoad: 'Unlimited (continuous)',  costRef: 'USD 1-5/ton (أرخص وسيلة)',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §5 — ADMIN_TECHNIQUES
//      12 تقنية إدارية متخصصة في صناعة المعادن والسكراب
// ══════════════════════════════════════════════════════════════════════════════

const ADMIN_TECHNIQUES = [
    { id:'ERP',        ar:'نظام تخطيط موارد المؤسسات',  tools:['SAP','Oracle ERP','Microsoft Dynamics'], scope:'المشتريات والمبيعات والمخزون والتصنيع' },
    { id:'MES',        ar:'نظام تنفيذ التصنيع',         tools:['Siemens MES','Rockwell FactoryTalk'],    scope:'التحكم في الإنتاج اللحظي'              },
    { id:'LIMS',       ar:'نظام إدارة المختبر',         tools:['LabWare','STARLIMS'],                     scope:'إدارة نتائج الاختبارات والشهادات'      },
    { id:'WMS',        ar:'نظام إدارة المستودع',        tools:['Manhattan WMS','SAP EWM'],               scope:'إدارة مواقع المعادن والمخزون'           },
    { id:'TMS',        ar:'نظام إدارة النقل',           tools:['Oracle TMS','SAP TM','Logility'],        scope:'جدولة الشحنات وتتبعها'                 },
    { id:'TRADING_PLATFORM',ar:'منصة التداول المعدني',  tools:['MetalDesk','Fastmarkets','LMEselect'],  scope:'أسعار المعادن والتحوط وإدارة التعرض'   },
    { id:'ISO_QMS',    ar:'نظام إدارة الجودة',          tools:['ISO 9001 software','ISOtrain'],          scope:'الوثائق والتدقيق وعدم المطابقة'        },
    { id:'EHS_MGMT',   ar:'إدارة الصحة والسلامة والبيئة',tools:['Intelex EHS','Cority'],                scope:'حوادث EHS والتدريب والامتثال'          },
    { id:'CONTRACT_MGMT',ar:'إدارة العقود',             tools:['SAP CLM','Icertis','Ironclad'],          scope:'عقود البيع والشراء والتأمين'            },
    { id:'PRICE_RISK', ar:'إدارة مخاطر الأسعار',       tools:['LME Hedging','Futures contracts','Options'],scope:'التحوط بالعقود الآجلة وخيارات LME' },
    { id:'CUSTOMS_MGMT',ar:'إدارة الجمارك والاستيراد',  tools:['Customs declaration SW','HS tariff DB'], scope:'تصنيف HS و ADVالرسوم'                 },
    { id:'CARBON_MGMT',ar:'إدارة الانبعاثات الكربونية',tools:['GHG protocol calc','Carbon credits'],    scope:'قياس وتعويض البصمة الكربونية'          },
];

// ══════════════════════════════════════════════════════════════════════════════
// §6 — MetalsNeuralAgent
//      وكيل معدني متخصص — يعرف كل شيء عن مجاله
// ══════════════════════════════════════════════════════════════════════════════

class MetalsNeuralAgent {
    constructor({ agentType, agentId, domain, specialization, data, layer = 0 }) {
        this.id             = crypto.randomUUID().slice(0, 12);
        this.agentType      = agentType;   // METAL | SCRAP | PROCESS | TRANSPORT | ADMIN | SUPPLY_CHAIN
        this.agentId        = agentId;     // Fe, HMS1, SMELTING, SEA_BULK, ...
        this.domain         = domain;
        this.specialization = specialization;
        this.data           = data;
        this.layer          = layer;
        this.health         = 100;
        this.knowledge      = Math.floor(Math.random() * 50 + 50); // 50-100 عند الإنشاء
        this.tasks          = 0;
        this.connections    = [];  // وكلاء مرتبطون
        this.createdAt      = Date.now();
        this.lastActive     = Date.now();
        this.islamicAnchor  = data?.islamicNote || data?.sharia || '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»';
    }

    // تحليل متخصص — يُعيد رأياً تقنياً
    analyze(query = {}) {
        this.tasks++;
        this.knowledge += Math.floor(Math.random() * 5 + 1);
        this.lastActive = Date.now();

        const result = {
            agent:          this.agentId,
            type:           this.agentType,
            specialization: this.specialization,
            query,
            recommendation: this._generateRecommendation(query),
            islamicAnchor:  this.islamicAnchor,
            confidence:     Math.min(99, 60 + this.tasks * 2),
            ts:             new Date().toISOString(),
        };

        // يُشعَّع للوكلاء المرتبطين
        for (const conn of this.connections) {
            if (conn && conn.health > 40) {
                conn.knowledge += 2;
            }
        }

        return result;
    }

    _generateRecommendation(query) {
        if (this.agentType === 'METAL') {
            const m = this.data;
            return `${m.ar}: نقطة انصهار ${m.melt}°C | كثافة ${m.density} g/cm³ | مرجع السعر ${m.price.ref} ${m.price.unit} | HS: ${m.hsCode}`;
        }
        if (this.agentType === 'SCRAP') {
            const s = this.data;
            return `${s.ar} (${s.code}): نقاء ${s.purity}% | ISRI: ${s.isri} | HS: ${s.hsCode} | سعر: ${s.priceRef} ${s.price}/طن`;
        }
        if (this.agentType === 'PROCESS') {
            const p = this.data;
            return `${p.ar}: الأدوات [${(p.tools||p.tool||[]).toString().slice(0,60)}] | المعيار: ${p.std || 'داخلي'} | الناتج: ${p.output}`;
        }
        if (this.agentType === 'TRANSPORT') {
            return `${this.data.ar}: أقصى حمولة ${this.data.maxLoad} | التكلفة: ${this.data.costRef}`;
        }
        if (this.agentType === 'SUPPLY_CHAIN') {
            const n = this.data;
            return `${n.ar}: ${n.procedures?.length || 0} إجراء | التراخيص: ${(n.licenses||[]).join(', ')||'غير محدد'}`;
        }
        if (this.agentType === 'ADMIN') {
            return `${this.data.ar}: الأدوات [${this.data.tools?.join(', ')}] | النطاق: ${this.data.scope}`;
        }
        if (this.agentType === 'SCIENCE') {
            const s = this.data;
            return `${s.ar}: ${s.formula} | الاستخدام: ${s.usage}`;
        }
        return `تحليل ${this.specialization}: المعرفة المتراكمة ${this.knowledge} وحدة`;
    }

    connect(other) {
        if (!this.connections.includes(other)) {
            this.connections.push(other);
            other.connections.push(this);
        }
    }

    status() {
        return {
            id:             this.id,
            agentId:        this.agentId,
            agentType:      this.agentType,
            specialization: this.specialization,
            layer:          this.layer,
            health:         this.health,
            knowledge:      this.knowledge,
            tasks:          this.tasks,
            connections:    this.connections.length,
            islamicAnchor:  this.islamicAnchor,
            lastActive:     new Date(this.lastActive).toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §7 — MetalsNeuralCluster
//      مجموعة وكلاء متخصصة في نفس المجال — تعمل كوحدة
// ══════════════════════════════════════════════════════════════════════════════

class MetalsNeuralCluster {
    constructor(id, name, description) {
        this.id          = id;
        this.name        = name;
        this.description = description;
        this.agents      = new Map();
        this.tasks       = 0;
    }

    addAgent(agent) {
        this.agents.set(agent.id, agent);
    }

    // تشغيل الكتلة: كل وكيل يُحلِّل
    runAnalysis(query = {}) {
        this.tasks++;
        const results = [];
        for (const agent of this.agents.values()) {
            results.push(agent.analyze(query));
        }
        return {
            cluster:    this.name,
            agentCount: this.agents.size,
            results,
            ts:         new Date().toISOString(),
        };
    }

    // ربط كل وكلاء المجموعة ببعض (شبكة كاملة)
    fullyConnect() {
        const list = [...this.agents.values()];
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                list[i].connect(list[j]);
            }
        }
    }

    status() {
        const agents = [...this.agents.values()];
        return {
            id:          this.id,
            name:        this.name,
            description: this.description,
            agentCount:  this.agents.size,
            avgHealth:   agents.length ? Math.round(agents.reduce((s, a) => s + a.health, 0) / agents.length) : 0,
            totalKnowledge: agents.reduce((s, a) => s + a.knowledge, 0),
            totalTasks:  agents.reduce((s, a) => s + a.tasks, 0),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §8 — NeuralAdminNetwork
//      الشبكة الإدارية العصبية — تنسق بين الكتل والطبقات
// ══════════════════════════════════════════════════════════════════════════════

class NeuralAdminNetwork {
    constructor() {
        this.clusters    = new Map();
        this.layers      = new Map();  // input | metals | scrap | supply | process | transport | admin | output
        this.pulses      = 0;
        this.totalSignals = 0;

        // تعريف الطبقات الإدارية
        const layerDefs = [
            { id:'input',      desc:'طبقة البيانات الواردة — خام الأسعار والطلبات'     },
            { id:'metals',     desc:'طبقة معالجة المعادن — 33 وكيل معدن'              },
            { id:'scrap',      desc:'طبقة السكراب — 28 تصنيف ISRI'                   },
            { id:'supply',     desc:'طبقة سلسلة الإمداد — 7 عقد'                     },
            { id:'process',    desc:'طبقة الإنتاج — 6 مراحل × إجراءات'              },
            { id:'transport',  desc:'طبقة النقل — 6 وسائل × إجراءات'               },
            { id:'science',    desc:'طبقة العلوم والقوانين — 15 قانون'              },
            { id:'admin',      desc:'طبقة الإدارة — 12 تقنية متخصصة'              },
            { id:'decision',   desc:'طبقة القرار — تجميع وترشيح'                  },
            { id:'output',     desc:'طبقة الإخراج — التوصيات النهائية'             },
        ];
        for (const ld of layerDefs) {
            this.layers.set(ld.id, { id: ld.id, desc: ld.desc, agents: new Set() });
        }
    }

    registerCluster(cluster, layerId) {
        this.clusters.set(cluster.id, cluster);
        const layer = this.layers.get(layerId);
        if (layer) {
            for (const agent of cluster.agents.values()) {
                layer.agents.add(agent.id);
            }
        }
    }

    // نبضة شاملة عبر الشبكة
    pulse(value = 1.0) {
        this.pulses++;
        for (const cluster of this.clusters.values()) {
            for (const agent of cluster.agents.values()) {
                agent.knowledge += Math.floor(value * Math.random() * 3);
                this.totalSignals++;
            }
        }
    }

    // استعلام موجَّه لكتلة محددة
    query(clusterId, payload = {}) {
        const cluster = this.clusters.get(clusterId);
        if (!cluster) return { error: `الكتلة ${clusterId} غير موجودة` };
        return cluster.runAnalysis(payload);
    }

    report() {
        const layers  = [...this.layers.values()].map(l => ({
            id:         l.id,
            desc:       l.desc,
            agentCount: l.agents.size,
        }));
        const clusters = [...this.clusters.values()].map(c => c.status());
        const totalAgents    = clusters.reduce((s, c) => s + c.agentCount, 0);
        const totalKnowledge = clusters.reduce((s, c) => s + c.totalKnowledge, 0);
        const avgHealth      = clusters.length
            ? Math.round(clusters.reduce((s, c) => s + c.avgHealth, 0) / clusters.length)
            : 0;
        return { pulses: this.pulses, totalSignals: this.totalSignals, totalAgents, totalKnowledge, avgHealth, layers, clusters };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §9 — SheikhaMetalsNeuralUniverse
//      المحرك الكبير — يبني كل الشبكة ويُشغّلها
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaMetalsNeuralUniverse extends EventEmitter {
    constructor() {
        super();
        this.version       = '1.0.0';
        this.bism          = 'بسم الله الرحمن الرحيم';
        this.ayah          = '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾';
        this.network       = new NeuralAdminNetwork();
        this.isInitialized = false;
        this.cycleCount    = 0;
        this.cycleInterval = null;
        this.totalAgents   = 0;
    }

    async initialize() {
        console.log(`\n${this.bism}`);
        console.log('⚙️  SHEIKHA — كون الوكلاء المعدنيين العصبيين — يتهيأ...\n');

        // بناء كتلة المعادن
        const metalsCluster = new MetalsNeuralCluster('METALS', 'كتلة المعادن', `${METALS_UNIVERSE.metals.length} معدن متخصص`);
        for (const metal of METALS_UNIVERSE.metals) {
            const agent = new MetalsNeuralAgent({ agentType: 'METAL', agentId: metal.id, domain: 'metals', specialization: metal.ar, data: metal, layer: 1 });
            metalsCluster.addAgent(agent);
        }
        metalsCluster.fullyConnect();
        this.network.registerCluster(metalsCluster, 'metals');

        // بناء كتلة السكراب
        const scrapCluster = new MetalsNeuralCluster('SCRAP_GRADES', 'كتلة السكراب', `${METALS_UNIVERSE.scrapGrades.length} تصنيف ISRI`);
        for (const grade of METALS_UNIVERSE.scrapGrades) {
            const agent = new MetalsNeuralAgent({ agentType: 'SCRAP', agentId: grade.code, domain: 'scrap', specialization: grade.ar, data: grade, layer: 1 });
            scrapCluster.addAgent(agent);
        }
        scrapCluster.fullyConnect();
        this.network.registerCluster(scrapCluster, 'scrap');

        // بناء كتلة سلسلة الإمداد
        const supplyCluster = new MetalsNeuralCluster('SUPPLY_CHAIN', 'كتلة سلسلة الإمداد', `${SUPPLY_CHAIN_NODES.length} عقدة`);
        for (const node of SUPPLY_CHAIN_NODES) {
            const agent = new MetalsNeuralAgent({ agentType: 'SUPPLY_CHAIN', agentId: node.id, domain: 'supply', specialization: node.ar, data: node, layer: 2 });
            supplyCluster.addAgent(agent);
            // وكلاء إجراءات لكل عقدة
            for (const proc of (node.procedures || []).slice(0, 5)) {
                const pAgent = new MetalsNeuralAgent({ agentType: 'PROCESS', agentId: `${node.id}_PROC`, domain: 'supply-process', specialization: proc, data: { ar: proc, tools: [], output: proc, islamicNote: node.islamicNote }, layer: 3 });
                supplyCluster.addAgent(pAgent);
                agent.connect(pAgent);
            }
        }
        this.network.registerCluster(supplyCluster, 'supply');

        // بناء كتلة مراحل الإنتاج
        const processCluster = new MetalsNeuralCluster('PRODUCTION', 'كتلة الإنتاج', `${PRODUCTION_PROCESSES.length} مرحلة`);
        for (const stage of PRODUCTION_PROCESSES) {
            const stageAgent = new MetalsNeuralAgent({ agentType: 'PROCESS', agentId: stage.stage, domain: 'production', specialization: stage.ar, data: stage, layer: 3 });
            processCluster.addAgent(stageAgent);
            for (const step of stage.steps) {
                const stepAgent = new MetalsNeuralAgent({ agentType: 'PROCESS', agentId: step.id, domain: 'production-step', specialization: step.ar, data: step, layer: 4 });
                processCluster.addAgent(stepAgent);
                stageAgent.connect(stepAgent);
            }
        }
        this.network.registerCluster(processCluster, 'process');

        // بناء كتلة النقل
        const transportCluster = new MetalsNeuralCluster('TRANSPORT', 'كتلة النقل', `${TRANSPORT_MATRIX.length} وسيلة`);
        for (const mode of TRANSPORT_MATRIX) {
            const modeAgent = new MetalsNeuralAgent({ agentType: 'TRANSPORT', agentId: mode.id, domain: 'transport', specialization: mode.ar, data: mode, layer: 5 });
            transportCluster.addAgent(modeAgent);
            for (const proc of mode.procedures.slice(0, 5)) {
                const procAgent = new MetalsNeuralAgent({ agentType: 'PROCESS', agentId: `${mode.id}_P`, domain: 'transport-proc', specialization: proc, data: { ar: proc, tools: [], output: proc }, layer: 6 });
                transportCluster.addAgent(procAgent);
                modeAgent.connect(procAgent);
            }
        }
        this.network.registerCluster(transportCluster, 'transport');

        // بناء كتلة القوانين العلمية
        const scienceCluster = new MetalsNeuralCluster('SCIENCE_LAWS', 'كتلة القوانين العلمية', `${METALS_UNIVERSE.scienceLaws.length} قانون`);
        for (const law of METALS_UNIVERSE.scienceLaws) {
            const agent = new MetalsNeuralAgent({ agentType: 'SCIENCE', agentId: law.id, domain: 'science', specialization: law.ar, data: law, layer: 7 });
            scienceCluster.addAgent(agent);
        }
        this.network.registerCluster(scienceCluster, 'science');

        // بناء كتلة المعايير
        const stdCluster = new MetalsNeuralCluster('STANDARDS', 'كتلة المعايير الدولية', `${METALS_UNIVERSE.standards.length} معيار`);
        for (const std of METALS_UNIVERSE.standards) {
            const agent = new MetalsNeuralAgent({ agentType: 'ADMIN', agentId: std.id, domain: 'standards', specialization: `${std.body} — ${std.scope}`, data: { ar: std.id, tools: [std.body], scope: std.scope }, layer: 7 });
            stdCluster.addAgent(agent);
        }
        this.network.registerCluster(stdCluster, 'admin');

        // بناء كتلة التقنيات الإدارية
        const adminCluster = new MetalsNeuralCluster('ADMIN_TECH', 'كتلة التقنيات الإدارية', `${ADMIN_TECHNIQUES.length} تقنية`);
        for (const tech of ADMIN_TECHNIQUES) {
            const agent = new MetalsNeuralAgent({ agentType: 'ADMIN', agentId: tech.id, domain: 'admin', specialization: tech.ar, data: tech, layer: 8 });
            adminCluster.addAgent(agent);
        }
        this.network.registerCluster(adminCluster, 'admin');

        // حساب إجمالي الوكلاء
        const report = this.network.report();
        this.totalAgents = report.totalAgents;

        this.isInitialized = true;
        this.emit('initialized', report);

        console.log(`✅ كون الوكلاء المعدنيين جاهز:`);
        console.log(`   إجمالي الوكلاء: ${this.totalAgents}`);
        console.log(`   الكتل: ${this.network.clusters.size}`);
        console.log(`   الطبقات: ${this.network.layers.size}`);
        console.log(`   ${this.ayah}\n`);

        // دورة أولية + تشغيل مستمر
        await this.runCycle();
        this.startContinuousEvolution(60000);
        return this;
    }

    async runCycle() {
        this.cycleCount++;
        this.network.pulse(1.0);
        const report = this.network.report();
        const result = {
            cycle:       this.cycleCount,
            totalAgents: report.totalAgents,
            knowledge:   report.totalKnowledge,
            avgHealth:   report.avgHealth,
            clusters:    report.clusters.length,
            ts:          new Date().toISOString(),
        };
        this.emit('cycle', result);
        return result;
    }

    startContinuousEvolution(ms = 60000) {
        if (this.cycleInterval) return;
        this.cycleInterval = setInterval(() => this.runCycle().catch(() => {}), ms);
        console.log(`🔄 التطور المعدني المستمر: كل ${ms / 1000}ثانية`);
    }

    stopEvolution() {
        if (this.cycleInterval) { clearInterval(this.cycleInterval); this.cycleInterval = null; }
    }

    // استعلام مباشر عن معدن
    queryMetal(metalId) {
        return this.network.query('METALS', { metalId });
    }

    // استعلام عن تصنيف سكراب
    queryScrap(code) {
        return this.network.query('SCRAP_GRADES', { code });
    }

    // استعلام عن مرحلة إنتاج
    queryProcess(stageId) {
        return this.network.query('PRODUCTION', { stageId });
    }

    // استعلام عن وسيلة نقل
    queryTransport(modeId) {
        return this.network.query('TRANSPORT', { modeId });
    }

    // البحث الذكي عبر كل الكتل
    smartSearch(keyword) {
        const results = [];
        for (const [clusterId, cluster] of this.network.clusters) {
            for (const agent of cluster.agents.values()) {
                if (
                    agent.specialization?.includes(keyword) ||
                    agent.agentId?.toLowerCase().includes(keyword.toLowerCase())
                ) {
                    results.push({ cluster: clusterId, ...agent.status() });
                }
            }
        }
        return results;
    }

    getStatus() {
        const report = this.network.report();
        return {
            system:        'SHEIKHA Metals Neural Universe',
            version:       this.version,
            bism:          this.bism,
            ayah:          this.ayah,
            isInitialized: this.isInitialized,
            isEvolving:    !!this.cycleInterval,
            cycles:        this.cycleCount,
            network:       report,
            universe: {
                totalMetals:     METALS_UNIVERSE.metals.length,
                totalScrapGrades:METALS_UNIVERSE.scrapGrades.length,
                totalScienceLaws:METALS_UNIVERSE.scienceLaws.length,
                totalStandards:  METALS_UNIVERSE.standards.length,
                supplyChainNodes:SUPPLY_CHAIN_NODES.length,
                productionStages:PRODUCTION_PROCESSES.length,
                transportModes:  TRANSPORT_MATRIX.length,
                adminTechniques: ADMIN_TECHNIQUES.length,
            },
            timestamp: new Date().toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §10 — التصدير
// ══════════════════════════════════════════════════════════════════════════════

const engineInstance = new SheikhaMetalsNeuralUniverse();

module.exports = {
    SheikhaMetalsNeuralUniverse,
    MetalsNeuralAgent,
    MetalsNeuralCluster,
    NeuralAdminNetwork,
    METALS_UNIVERSE,
    SUPPLY_CHAIN_NODES,
    PRODUCTION_PROCESSES,
    TRANSPORT_MATRIX,
    ADMIN_TECHNIQUES,
    engine: engineInstance,
    async init()         { return await engineInstance.initialize(); },
    async runCycle()     { return await engineInstance.runCycle(); },
    getStatus()          { return engineInstance.getStatus(); },
    queryMetal(id)       { return engineInstance.queryMetal(id); },
    queryScrap(code)     { return engineInstance.queryScrap(code); },
    smartSearch(keyword) { return engineInstance.smartSearch(keyword); },
    version: '1.0.0',
    bism: 'بسم الله الرحمن الرحيم',
};
