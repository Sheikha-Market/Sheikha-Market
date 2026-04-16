// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 SHEIKHA GLOBAL MARKETS ENGINE
 * محرك الأسواق العالمية الشامل — كل أسواق الكون في منظومة واحدة
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة ٢٧٥
 * "لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ" — قريش ١-٢
 *
 * الأسواق المُغطاة:
 * ✅ المعادن الأساسية (Base Metals)
 * ✅ المعادن الثمينة (Precious Metals)
 * ✅ المعادن النادرة والصناعية (Rare/Critical Minerals)
 * ✅ السكراب والمواد المُعاد تدويرها (Scrap & Recycled)
 * ✅ الطاقة والنفط والغاز (Energy/Oil/Gas)
 * ✅ الزراعة والغذاء (Agriculture/Food)
 * ✅ الصناعات التحويلية والكيماويات (Chemicals/Polymers)
 * ✅ مواد البناء والإنشاء (Construction Materials)
 * ✅ الصناعات التقنية والإلكترونيات (Technology/Electronics)
 * ✅ اللوجستيات والنقل (Logistics/Transport)
 * ✅ الأسواق المالية للسلع (Commodity Finance)
 * ✅ التعدين والمصاهر (Mining/Smelting)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
// قاعدة بيانات الأسواق العالمية الشاملة
// ═══════════════════════════════════════════════════════════════════════════════

const GLOBAL_MARKETS_DATABASE = {

    // ══════════════════════════════════════════════════════════════════════════
    // 1️⃣ المعادن الأساسية — BASE METALS
    // ══════════════════════════════════════════════════════════════════════════
    base_metals: {
        id: 'base_metals',
        nameAr: 'المعادن الأساسية',
        nameEn: 'Base Metals',
        category: 'metals',
        icon: '⚙️',
        exchanges: ['LME (London Metal Exchange)', 'COMEX', 'SHFE (Shanghai)', 'MCX (India)'],
        priceUnit: 'USD/MT',
        globalMarketSize: '$600B/year',
        islamicCompliance: 'يجوز التداول بشرط التسليم والمواصفات الواضحة',
        products: {
            copper: {
                nameAr: 'نحاس', nameEn: 'Copper', symbol: 'Cu',
                hs_codes: ['7401', '7402', '7403', '7404', '7405', '7406', '7407', '7408', '7409', '7410', '7411'],
                hs_details: {
                    '7401': 'مرادة النحاس وأنود النحاس للتكرير',
                    '7402': 'نحاس غير مكرر',
                    '7403': 'نحاس مكرر وسبائك نحاسية',
                    '7404': 'سكراب النحاس ونحاس الهدم',
                    '7408': 'أسلاك نحاسية',
                    '7409': 'ألواح نحاسية وشرائط',
                    '7411': 'أنابيب نحاسية'
                },
                grades: ['Grade A (99.99%)', 'Grade B (99.9%)', 'Fire Refined', 'Blister'],
                forms: ['cathodes', 'billets', 'rods', 'sheets', 'wire', 'tubes', 'scrap'],
                top_producers: ['Chile', 'Peru', 'China', 'DR Congo', 'USA', 'Australia', 'Russia', 'Zambia'],
                top_consumers: ['China', 'USA', 'Germany', 'Japan', 'South Korea'],
                uses: ['كهرباء وأسلاك', 'سباكة وأنابيب', 'إلكترونيات', 'بناء', 'نقل'],
                price_drivers: ['الطلب الصيني', 'إنتاج تشيلي والبيرو', 'احتياطيات LME', 'أسعار الطاقة'],
                certifications: ['LME Approved', 'REACH Compliant', 'ISO 1337'],
                logistic_considerations: ['حاويات مختصة', 'حماية من الرطوبة', 'تأمين ضروري'],
                minOrderQty: '25 MT',
                typicalLeadTime: '14-45 days',
                incoterms: ['FOB', 'CIF', 'DDP', 'EXW']
            },
            aluminum: {
                nameAr: 'ألمنيوم', nameEn: 'Aluminum', symbol: 'Al',
                hs_codes: ['7601', '7602', '7603', '7604', '7605', '7606', '7607', '7608', '7609', '7610'],
                hs_details: {
                    '7601': 'ألمنيوم خام غير مشغول',
                    '7602': 'سكراب الألمنيوم',
                    '7604': 'قضبان وإطارات ألمنيوم',
                    '7605': 'أسلاك ألمنيوم',
                    '7606': 'ألواح وشرائط ألمنيوم'
                },
                grades: ['P1020 (99.7%)', 'ADC12', 'A356', 'Al 6061', 'Al 7075', 'Al 5052'],
                forms: ['ingots', 'billets', 'slabs', 'wire', 'sheet', 'foil', 'extrusions', 'scrap'],
                top_producers: ['China', 'India', 'Russia', 'Canada', 'UAE', 'Australia'],
                top_consumers: ['China', 'USA', 'Germany', 'Japan', 'South Korea'],
                uses: ['طيران وفضاء', 'سيارات', 'بناء', 'تغليف', 'كهرباء'],
                price_drivers: ['تكلفة الكهرباء', 'الإنتاج الصيني', 'طلب السيارات الكهربائية'],
                minOrderQty: '20 MT',
                typicalLeadTime: '14-30 days',
                incoterms: ['FOB', 'CFR', 'DDP']
            },
            zinc: {
                nameAr: 'زنك', nameEn: 'Zinc', symbol: 'Zn',
                hs_codes: ['7901', '7902', '7903', '7904', '7905'],
                hs_details: {
                    '7901': 'زنك خام غير مشغول',
                    '7902': 'سكراب الزنك',
                    '7903': 'مساحيق الزنك وحبيباته وصفائحه'
                },
                grades: ['SHG 99.995%', 'HG 99.95%', 'Regular 98.5%'],
                forms: ['ingots', 'jumbo blocks', 'alloys', 'dust', 'oxide', 'scrap'],
                top_producers: ['China', 'Peru', 'Australia', 'India', 'USA', 'Canada', 'Bolivia'],
                uses: ['galvanizing', 'die casting', 'brass', 'batteries', 'rubber'],
                minOrderQty: '25 MT',
                typicalLeadTime: '14-30 days'
            },
            lead: {
                nameAr: 'رصاص', nameEn: 'Lead', symbol: 'Pb',
                hs_codes: ['7801', '7802', '7803', '7804'],
                hs_details: {
                    '7801': 'رصاص خام',
                    '7802': 'سكراب الرصاص'
                },
                grades: ['Corroding Lead 99.97%', 'Common Lead 99.94%', 'Battery Grade'],
                forms: ['ingots', 'alloys', 'battery scrap', 'pipe', 'sheet'],
                top_producers: ['China', 'Australia', 'USA', 'Peru', 'Mexico', 'India', 'Russia'],
                uses: ['بطاريات السيارات', 'أحجبة الإشعاع', 'أصباغ', 'ذخيرة', 'رصاص بناء'],
                minOrderQty: '25 MT',
                typicalLeadTime: '14-30 days'
            },
            nickel: {
                nameAr: 'نيكل', nameEn: 'Nickel', symbol: 'Ni',
                hs_codes: ['7501', '7502', '7503', '7504', '7505', '7506'],
                hs_details: {
                    '7501': 'مرادة النيكل وعقد النيكل',
                    '7502': 'نيكل خام',
                    '7503': 'سكراب النيكل',
                    '7504': 'مساحيق وحبيبات النيكل',
                    '7505': 'قضبان وأسلاك النيكل'
                },
                grades: ['Class I (99.8%+)', 'Class II (Ferronickel, NPI)'],
                forms: ['full plate', 'rounds', 'briquettes', 'powder', 'alloys', 'scrap'],
                top_producers: ['Indonesia', 'Philippines', 'Russia', 'New Caledonia', 'Australia'],
                uses: ['فولاذ مقاوم للصدأ', 'بطاريات EV', 'سبائك فائقة', 'طلاء'],
                minOrderQty: '5 MT',
                typicalLeadTime: '14-45 days'
            },
            iron_steel: {
                nameAr: 'حديد وفولاذ', nameEn: 'Iron & Steel',
                hs_codes: ['7201', '7202', '7203', '7204', '7205', '7206', '7207', '7208', '7209', '7210', '7211', '7212', '7213', '7214', '7215', '7216', '7217', '7218', '7219', '7220', '7222', '7225', '7226', '7227', '7228'],
                hs_details: {
                    '7201': 'حديد خام وحديد محول',
                    '7203': 'منتجات حديد مُختزلة مباشرة',
                    '7204': 'سكراب الحديد والفولاذ',
                    '7207': 'منتجات شبه مصنعة من الفولاذ',
                    '7213': 'أسلاك حديدية',
                    '7214': 'قضبان حديدية (حديد التسليح)'
                },
                grades: ['HRC (Hot Rolled Coil)', 'CRC (Cold Rolled)', 'Rebar', 'Wire Rod', 'Billet', 'Slab', 'Bloom'],
                forms: ['coils', 'sheets', 'bars', 'rods', 'pipes', 'sections', 'scrap'],
                top_producers: ['China', 'India', 'Japan', 'USA', 'Russia', 'South Korea', 'Germany', 'Brazil'],
                uses: ['بناء وإنشاء', 'سيارات', 'آلات ومعدات', 'أوعية وخزانات', 'سفن وقوارب'],
                minOrderQty: '50 MT',
                typicalLeadTime: '7-30 days'
            },
            tin: {
                nameAr: 'قصدير', nameEn: 'Tin', symbol: 'Sn',
                hs_codes: ['8001', '8002', '8003', '8004', '8005', '8006', '8007'],
                grades: ['99.85% Min', '99.9%', 'ASTM B339'],
                top_producers: ['China', 'Indonesia', 'Myanmar', 'Peru', 'Bolivia', 'Brazil', 'Australia'],
                uses: ['طلاء (tin plate)', 'لحامات', 'سبائك برونز', 'كيماويات الصيانة'],
                minOrderQty: '5 MT'
            },
            cobalt: {
                nameAr: 'كوبالت', nameEn: 'Cobalt', symbol: 'Co',
                hs_codes: ['8105'],
                top_producers: ['DR Congo', 'Russia', 'Australia', 'Philippines', 'Cuba'],
                uses: ['بطاريات ليثيوم أيون', 'سبائك فائقة', 'أصباغ', 'أدوات قطع'],
                minOrderQty: '1 MT',
                criticalMineral: true
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 2️⃣ المعادن الثمينة — PRECIOUS METALS
    // ══════════════════════════════════════════════════════════════════════════
    precious_metals: {
        id: 'precious_metals',
        nameAr: 'المعادن الثمينة',
        nameEn: 'Precious Metals',
        category: 'metals',
        icon: '✨',
        exchanges: ['LBMA', 'COMEX/NYMEX', 'Zurich Gold Market', 'Dubai Gold Centre'],
        priceUnit: 'USD/troy oz',
        globalMarketSize: '$250B/year',
        islamicCompliance: 'تجارة الذهب والفضة من الأصناف الربوية — يشترط التقابض والتماثل',
        products: {
            gold: {
                nameAr: 'ذهب', nameEn: 'Gold', symbol: 'Au',
                hs_codes: ['7108', '7113', '7114', '7115', '7116'],
                hs_details: {
                    '7108': 'ذهب خام أو نصف مصنوع أو مسحوق',
                    '7113': 'مصنوعات مجوهرات وأجزاؤها',
                    '7108.12': 'ذهب غير نقدي في شكل آخر خام أو نصف مصنوع',
                    '7108.20': 'ذهب نقدي'
                },
                forms: ['bars/bullion', 'coins', 'granules', 'powder', 'jewelry', 'recycled'],
                standards: ['LBMA Good Delivery 400oz bar', 'Dubai Good Delivery', 'ISO 9000'],
                top_miners: ['China', 'Russia', 'Australia', 'Canada', 'USA', 'Ghana', 'South Africa', 'Indonesia'],
                refineries: ['Valcambi (CH)', 'PAMP (CH)', 'Perth Mint (AU)', 'Rand Refinery (ZA)', 'Kaloti (UAE)'],
                sharia_note: 'الذهب صنف ربوي — لا يجوز بيعه بالذهب إلا مثلاً بمثل يداً بيد',
                zakat: '2.5% — نصاب 85 غرام ذهب',
                minOrderQty: '1 kg',
                typicalLeadTime: '1-7 days'
            },
            silver: {
                nameAr: 'فضة', nameEn: 'Silver', symbol: 'Ag',
                hs_codes: ['7106', '7107'],
                hs_details: { '7106': 'فضة خام أو نصف مصنوعة أو مسحوق' },
                forms: ['bars', 'coins', 'granules', 'industrial', 'jewelry', 'recycled'],
                top_miners: ['Mexico', 'Peru', 'China', 'Russia', 'Chile', 'Australia', 'Bolivia', 'Poland'],
                zakat: '2.5% — نصاب 595 غرام فضة',
                minOrderQty: '50 kg'
            },
            platinum: {
                nameAr: 'بلاتين', nameEn: 'Platinum', symbol: 'Pt',
                hs_codes: ['7110.11', '7110.19'],
                hs_details: { '7110': 'البلاتين وفلزات مجموعة البلاتين' },
                top_miners: ['South Africa (75%)', 'Russia', 'Zimbabwe', 'Canada', 'USA'],
                uses: ['محولات حفازة', 'مجوهرات', 'معدات مختبر', 'خلايا وقود'],
                minOrderQty: '100 g'
            },
            palladium: {
                nameAr: 'بلاديوم', nameEn: 'Palladium', symbol: 'Pd',
                hs_codes: ['7110.21', '7110.29'],
                top_miners: ['Russia (40%)', 'South Africa (35%)', 'Canada', 'USA'],
                uses: ['محولات حفازة السيارات', 'إلكترونيات', 'طب الأسنان'],
                minOrderQty: '100 g'
            },
            rhodium: {
                nameAr: 'روديوم', nameEn: 'Rhodium', symbol: 'Rh',
                hs_codes: ['7110.31', '7110.39'],
                rarest: true,
                uses: ['محولات حفازة (تخفيض NOx)', 'طلاء مجوهرات'],
                minOrderQty: '10 g'
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 3️⃣ المعادن النادرة والحيوية — RARE & CRITICAL MINERALS
    // ══════════════════════════════════════════════════════════════════════════
    rare_critical_minerals: {
        id: 'rare_critical_minerals',
        nameAr: 'المعادن النادرة والحيوية',
        nameEn: 'Rare & Critical Minerals',
        category: 'metals',
        icon: '💎',
        globalStrategicImportance: 'بالغة الأهمية — الطاقة النظيفة والتقنية المتقدمة',
        products: {
            lithium: {
                nameAr: 'ليثيوم', nameEn: 'Lithium', symbol: 'Li',
                hs_codes: ['2825.20', '2836.91', '2816.10'],
                hs_details: {
                    '2825.20': 'أكاسيد وهيدروكسيدات الليثيوم',
                    '2836.91': 'كربونات الليثيوم'
                },
                forms: ['lithium carbonate', 'lithium hydroxide', 'spodumene', 'brine'],
                top_producers: ['Australia', 'Chile', 'China', 'Argentina', 'Brazil'],
                uses: ['بطاريات EV وتخزين الطاقة', 'زجاج وسيراميك', 'مواد تشحيم', 'أدوية'],
                supplyChainNote: 'Li Triangle: Chile, Argentina, Bolivia',
                minOrderQty: '1 MT',
                criticalFor: ['EV revolution', 'grid storage', 'consumer electronics']
            },
            rare_earth_elements: {
                nameAr: 'عناصر الأرض النادرة', nameEn: 'Rare Earth Elements (REE)',
                hs_codes: ['2805.30', '2846'],
                hs_details: { '2846': 'مركبات عناصر الأرض النادرة' },
                elements: ['Neodymium', 'Praseodymium', 'Dysprosium', 'Terbium', 'Lanthanum', 'Cerium', 'Erbium', 'Europium'],
                top_producers: ['China (60%)', 'USA', 'Australia', 'Russia', 'Myanmar', 'India'],
                uses: ['مغناطيسات دائمة (رياح وEV)', 'أجهزة كهربائية', 'محفزات تكرير', 'ليزر وأبصار'],
                supplyRisk: 'عالية — هيمنة صينية على التكرير',
                minOrderQty: '500 kg'
            },
            tungsten: {
                nameAr: 'تنغستن', nameEn: 'Tungsten', symbol: 'W',
                hs_codes: ['2611.00', '8101'],
                uses: ['حوامل أدوات القطع', 'أسلاك مصابيح', 'رصاصات', 'سبائك فائقة'],
                top_producers: ['China (80%)', 'Russia', 'Vietnam', 'Bolivia', 'Rwanda'],
                minOrderQty: '1 MT'
            },
            molybdenum: {
                nameAr: 'موليبدنوم', nameEn: 'Molybdenum', symbol: 'Mo',
                hs_codes: ['2613', '8102'],
                uses: ['تقوية الفولاذ', 'محفزات التكرير', 'سبائك درجات حرارة عالية'],
                minOrderQty: '1 MT'
            },
            titanium: {
                nameAr: 'تيتانيوم', nameEn: 'Titanium', symbol: 'Ti',
                hs_codes: ['2614', '8108'],
                uses: ['طيران وفضاء', 'أجهزة طبية', 'معدات كيميائية', 'بناء'],
                minOrderQty: '500 kg'
            },
            graphite: {
                nameAr: 'جرافيت', nameEn: 'Graphite',
                hs_codes: ['2504'],
                forms: ['natural flake', 'synthetic', 'spherical (battery grade)', 'electrodes'],
                top_producers: ['China (65%)', 'Mozambique', 'Madagascar', 'Tanzania', 'Brazil'],
                uses: ['أقطاب بطاريات', 'مواد مقاومة للحرارة', 'تشحيم', 'مسحوق رسم'],
                minOrderQty: '5 MT'
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 4️⃣ السكراب والمواد المُعاد تدويرها — SCRAP & RECYCLED MATERIALS
    // ══════════════════════════════════════════════════════════════════════════
    scrap_recycled: {
        id: 'scrap_recycled',
        nameAr: 'السكراب والمعادن المُعاد تدويرها',
        nameEn: 'Scrap & Recycled Materials',
        category: 'scrap',
        icon: '♻️',
        globalMarketSize: '$400B/year',
        islamicCompliance: 'جائز — إعادة التدوير من باب الإصلاح ومنع الإسراف',
        description: 'سوق عالمي لإعادة تدوير المعادن والمواد — يقلل من استنزاف الموارد الطبيعية',
        products: {
            ferrous_scrap: {
                nameAr: 'سكراب حديدي', nameEn: 'Ferrous Scrap',
                hs_codes: ['7204'],
                hs_details: {
                    '7204.10': 'سكراب الحديد الزهر',
                    '7204.21': 'سكراب الفولاذ المقاوم للصدأ',
                    '7204.29': 'سكراب أصناف أخرى من الفولاذ المسبوك',
                    '7204.30': 'سكراب من الحديد المطلي بالصفيح',
                    '7204.41': 'نثارة وأجزاء خردة أخرى من الحديد أو الفولاذ',
                    '7204.49': 'أصناف أخرى',
                    '7204.50': 'حبيبات ومسحوق'
                },
                grades: {
                    US_standards: ['No.1 Heavy Melt', 'No.2 Heavy Melt', 'Shredded', 'Busheling', 'Bundles', 'Turnings', 'Cast Iron'],
                    EU_standards: ['E1', 'E2', 'E3', 'E8', 'E40', 'E46'],
                    ISRI_codes: ['Busheling', 'Bunny', 'Clip', 'Hanger', 'Honey', 'No.1 HMS', 'No.2 HMS', 'Scle', 'Shred']
                },
                majorTradeFlows: ['USA → Turkey', 'EU → Turkey/Egypt', 'Japan → SE Asia', 'Gulf → India/Pakistan'],
                priceIndex: 'SteelBenchmarker, Fastmarkets AMM',
                averageYield: '95-97% recovery',
                minOrderQty: '500 MT',
                typicalLeadTime: '14-30 days'
            },
            copper_scrap: {
                nameAr: 'سكراب نحاسي', nameEn: 'Copper Scrap',
                hs_codes: ['7404'],
                hs_details: {
                    '7404.00': 'سكراب النحاس والسبائك النحاسية'
                },
                grades: {
                    ISRI_codes: ['Barley', 'Berry', 'Birch', 'Candy', 'Cliff', 'Clove', 'Cobra', 'Cocoa', 'Druid', 'Dream', 'Entia', 'Malar', 'Nickel', 'Pales', 'Talon', 'Telic'],
                    simplified: [
                        { grade: 'Bare Bright Copper Wire', purity: '99.9%+', description: 'أسلاك نحاسية نظيفة' },
                        { grade: '#1 Copper', purity: '99%+', description: 'نحاس نظيف بدون طلاء' },
                        { grade: '#2 Copper', purity: '94-96%', description: 'نحاس مع طلاء أو لحام' },
                        { grade: 'Copper Turnings', purity: '90-98%', description: 'نثارة تشغيل' },
                        { grade: 'Yellow Brass', purity: '60-65% Cu', description: 'سكراب نحاس أصفر' },
                        { grade: 'Red Brass', purity: '80-83% Cu', description: 'نحاس أحمر' },
                        { grade: 'Insulated Wire', purity: 'varies', description: 'أسلاك معزولة' }
                    ]
                },
                majorTradeFlows: ['USA → China', 'EU → China', 'ME → Asia', 'Africa → China'],
                priceIndex: 'LME + premium/discount',
                minOrderQty: '20 MT',
                typicalLeadTime: '14-21 days'
            },
            aluminum_scrap: {
                nameAr: 'سكراب ألمنيوم', nameEn: 'Aluminum Scrap',
                hs_codes: ['7602'],
                grades: {
                    ISRI_codes: ['Clipp', 'Dross', 'Honey', 'Taint', 'Taboo', 'Talc', 'Talk', 'Tense', 'Tepid', 'Terse', 'Tesla', 'Testy', 'Teves', 'Thins'],
                    simplified: [
                        { grade: 'Zorba', purity: 'mixed Al alloys', description: 'سكراب مختلط من السيارات المهروسة' },
                        { grade: 'Taint/Tabor', purity: 'Al alloy sheets', description: 'صفائح ألمنيوم' },
                        { grade: 'Twitch', purity: 'cast aluminum', description: 'ألمنيوم مسبوك من سيارات' },
                        { grade: 'Old Sheet/Cast', purity: 'various', description: 'صفائح ومسبوكات قديمة' },
                        { grade: 'Clips', purity: '99%+', description: 'قصاصات جديدة من المصنع' }
                    ]
                },
                majorTradeFlows: ['Global → India/SE Asia', 'EU → Turkey', 'USA → Mexico/India'],
                minOrderQty: '20 MT'
            },
            stainless_steel_scrap: {
                nameAr: 'سكراب فولاذ مقاوم للصدأ', nameEn: 'Stainless Steel Scrap',
                hs_codes: ['7204.21'],
                grades: ['304 (8% Ni, 18% Cr)', '316 (10% Ni, 16% Cr, 2% Mo)', '310', '430 (No Ni)', '201'],
                majorTradeFlows: ['Global → China/India/Taiwan'],
                minOrderQty: '20 MT'
            },
            lead_battery_scrap: {
                nameAr: 'سكراب بطاريات الرصاص', nameEn: 'Lead Battery Scrap / ULAB',
                hs_codes: ['7802', '8548.10'],
                forms: ['whole batteries', 'broken batteries', 'lead plates', 'drained batteries'],
                environmentalNote: 'تخضع لاتفاقية بازل — يتطلب تصاريح خاصة',
                priceIndex: 'LME Lead - processing discount',
                minOrderQty: '20 MT'
            },
            e_waste: {
                nameAr: 'سكراب إلكتروني (نفايات إلكترونية)', nameEn: 'E-Waste / WEEE',
                hs_codes: ['8549', '8471.70', '8517.12'],
                forms: ['CPUs', 'memory chips', 'PCBs', 'hard drives', 'phones', 'cables'],
                keyMetals: 'ذهب وفضة ونحاس وبلاتين وبلاديوم من PCBs',
                regulatoryNote: 'اتفاقية بازل وStokholmo — تتطلب معالجة بيئية سليمة',
                minOrderQty: '1 MT'
            },
            plastic_scrap: {
                nameAr: 'سكراب بلاستيك', nameEn: 'Plastic Scrap',
                hs_codes: ['3915'],
                hs_details: {
                    '3915.10': 'سكراب بولي إيثيلين',
                    '3915.20': 'سكراب بولي ستيرين',
                    '3915.30': 'سكراب كلوريد البوليفينيل',
                    '3915.90': 'سكراب بلاستيك أخرى'
                },
                grades: ['PET (7)', 'HDPE (2)', 'PVC (3)', 'LDPE (4)', 'PP (5)', 'PS (6)', 'ABS', 'PC', 'Nylon'],
                majorTradeFlows: ['Global → SE Asia/Turkey/India'],
                minOrderQty: '10 MT'
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 5️⃣ الطاقة والنفط والغاز — ENERGY / OIL / GAS
    // ══════════════════════════════════════════════════════════════════════════
    energy: {
        id: 'energy',
        nameAr: 'الطاقة والنفط والغاز',
        nameEn: 'Energy / Oil / Gas',
        category: 'energy',
        icon: '⛽',
        exchanges: ['ICE (Brent)', 'NYMEX (WTI)', 'DME (Dubai)', 'TTF (Gas Europe)'],
        priceUnit: 'USD/barrel (crude) / USD/MMBTU (gas)',
        globalMarketSize: '$2T+/year',
        products: {
            crude_oil: {
                nameAr: 'نفط خام', nameEn: 'Crude Oil',
                hs_codes: ['2709'],
                grades: ['Brent Blend', 'WTI', 'Dubai/Oman', 'Arab Light', 'Urals', 'Bonny Light', 'Basra Light', 'ESPO'],
                specs: ['API gravity', 'Sulfur content (sweet/sour)', 'viscosity', 'pour point'],
                top_producers: ['Saudi Arabia', 'USA', 'Russia', 'Iraq', 'UAE', 'Iran', 'Kuwait', 'Nigeria'],
                incoterms: ['FOB', 'CFR', 'CIF', 'DES', 'DAP'],
                minOrderQty: '25,000 barrels (1 parcel)',
                typicalLeadTime: 'Spot or forward 1-3 months'
            },
            refined_products: {
                nameAr: 'منتجات مكررة', nameEn: 'Refined Products',
                hs_codes: ['2710', '2711'],
                products: [
                    { name: 'Gasoline/Petrol', hs: '2710.12', unit: 'USD/gallon' },
                    { name: 'Diesel/Gasoil', hs: '2710.19.43', unit: 'USD/MT' },
                    { name: 'Jet Fuel/Kerosene', hs: '2710.19.21', unit: 'USD/MT' },
                    { name: 'Fuel Oil / HSFO', hs: '2710.19.61', unit: 'USD/MT' },
                    { name: 'Naphtha', hs: '2710.12.25', unit: 'USD/MT' },
                    { name: 'LPG (Propane/Butane)', hs: '2711.12 / 2711.13', unit: 'USD/MT' },
                    { name: 'Bitumen/Asphalt', hs: '2713.20', unit: 'USD/MT' }
                ]
            },
            natural_gas: {
                nameAr: 'غاز طبيعي', nameEn: 'Natural Gas / LNG',
                hs_codes: ['2711.11', '2711.21'],
                forms: ['pipeline gas', 'LNG', 'CNG'],
                top_producers: ['USA', 'Russia', 'Iran', 'Qatar', 'Australia', 'Canada', 'China'],
                unit: 'USD/MMBTU or USD/MT (LNG)'
            },
            coal: {
                nameAr: 'فحم', nameEn: 'Coal',
                hs_codes: ['2701', '2702', '2703'],
                types: ['thermal coal', 'coking coal (metallurgical)', 'lignite'],
                top_producers: ['China', 'India', 'Indonesia', 'Australia', 'USA', 'Russia', 'South Africa'],
                unit: 'USD/MT'
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 6️⃣ الزراعة والغذاء — AGRICULTURE / AGRI-COMMODITIES
    // ══════════════════════════════════════════════════════════════════════════
    agriculture: {
        id: 'agriculture',
        nameAr: 'الزراعة والغذاء',
        nameEn: 'Agriculture & Food Commodities',
        category: 'agri',
        icon: '🌾',
        exchanges: ['CBOT (Chicago)', 'Euronext (Paris)', 'Dalian (China)', 'SAFEX (South Africa)'],
        globalMarketSize: '$1.5T+/year',
        islamicCompliance: 'جائز مع مراعاة شروط التجارة المشروعة',
        products: {
            grains: {
                nameAr: 'الحبوب', nameEn: 'Grains & Cereals',
                products: [
                    { name: 'Wheat', nameAr: 'قمح', hs: '1001', unit: 'USD/MT', majProd: ['Russia', 'USA', 'Canada', 'Australia', 'France'] },
                    { name: 'Corn/Maize', nameAr: 'ذرة', hs: '1005', unit: 'USD/MT', majProd: ['USA', 'China', 'Brazil', 'Argentina'] },
                    { name: 'Rice', nameAr: 'أرز', hs: '1006', unit: 'USD/MT', majProd: ['China', 'India', 'Bangladesh', 'Thailand', 'Vietnam'] },
                    { name: 'Barley', nameAr: 'شعير', hs: '1003', unit: 'USD/MT', majProd: ['Russia', 'France', 'Germany', 'Australia'] },
                    { name: 'Soybeans', nameAr: 'فول صويا', hs: '1201', unit: 'USD/MT', majProd: ['USA', 'Brazil', 'Argentina'] }
                ]
            },
            oilseeds: {
                nameAr: 'البذور الزيتية وزيوت النباتات', nameEn: 'Oilseeds & Edible Oils',
                products: [
                    { name: 'Palm Oil', nameAr: 'زيت نخيل', hs: '1511', majProd: ['Indonesia', 'Malaysia'] },
                    { name: 'Sunflower Oil', nameAr: 'زيت عباد الشمس', hs: '1512', majProd: ['Ukraine', 'Russia', 'Argentina'] },
                    { name: 'Soybean Oil', nameAr: 'زيت صويا', hs: '1507', majProd: ['USA', 'Brazil', 'Argentina'] },
                    { name: 'Olive Oil', nameAr: 'زيت زيتون', hs: '1509', majProd: ['Spain', 'Italy', 'Greece', 'Tunisia', 'Morocco'] }
                ]
            },
            sugar_coffee_cocoa: {
                nameAr: 'سكر وقهوة وكاكاو', nameEn: 'Softs: Sugar, Coffee, Cocoa',
                products: [
                    { name: 'Raw Sugar', nameAr: 'سكر خام', hs: '1701', majProd: ['Brazil', 'India', 'Thailand', 'China'] },
                    { name: 'Coffee', nameAr: 'قهوة', hs: '0901', majProd: ['Brazil', 'Vietnam', 'Colombia', 'Ethiopia', 'Honduras'] },
                    { name: 'Cocoa', nameAr: 'كاكاو', hs: '1801', majProd: ['Ivory Coast', 'Ghana', 'Ecuador', 'Cameroon'] }
                ]
            },
            animal_feed: {
                nameAr: 'الأعلاف', nameEn: 'Animal Feed',
                hs_codes: ['2302', '2304', '2305', '2306', '2309'],
                products: ['Soybean Meal', 'Fish Meal', 'DDGS', 'Sunflower Meal', 'Corn Gluten Feed'],
                majorConsumers: ['China', 'USA', 'EU', 'Brazil', 'India']
            },
            halal_food: {
                nameAr: 'الغذاء الحلال', nameEn: 'Halal Food',
                hs_codes: ['0201', '0202', '0203', '0207', '0210', '1601', '1602'],
                description: 'سوق الغذاء الحلال العالمي — يتجاوز $2.1 تريليون سنوياً',
                certifyingBodies: ['JAKIM (Malaysia)', 'MUI (Indonesia)', 'SANHA (SA)', 'ESMA (UAE)', 'IFANCA (USA)'],
                majorConsumers: ['OIC countries', 'Muslim-minority countries', 'halal-conscious consumers globally']
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 7️⃣ الكيماويات والبتروكيماويات — CHEMICALS / PETROCHEMICALS
    // ══════════════════════════════════════════════════════════════════════════
    chemicals: {
        id: 'chemicals',
        nameAr: 'الكيماويات والبتروكيماويات والبوليمرات',
        nameEn: 'Chemicals / Petrochemicals / Polymers',
        category: 'chemicals',
        icon: '🧪',
        globalMarketSize: '$5T+/year',
        products: {
            petrochemicals: {
                nameAr: 'بتروكيماويات', nameEn: 'Petrochemicals',
                products: [
                    { name: 'Ethylene', hs: '2901.21', uses: 'بوليمرات وتغليف' },
                    { name: 'Propylene', hs: '2901.22', uses: 'بولي بروبيلين وأكريلاميد' },
                    { name: 'Benzene', hs: '2902.20', uses: 'ستيرين وكيماويات' },
                    { name: 'Methanol', hs: '2905.11', uses: 'وقود وكيماويات' },
                    { name: 'Ammonia', hs: '2814.10', uses: 'أسمدة وبارد' }
                ]
            },
            polymers_plastics: {
                nameAr: 'بوليمرات وبلاستيك', nameEn: 'Polymers & Plastics',
                products: [
                    { name: 'Polyethylene (PE)', hs: '3901', forms: ['HDPE', 'LDPE', 'LLDPE'] },
                    { name: 'Polypropylene (PP)', hs: '3902', forms: ['homopolymer', 'copolymer'] },
                    { name: 'PVC', hs: '3904', forms: ['suspension grade', 'emulsion grade'] },
                    { name: 'PET', hs: '3907.61', uses: 'زجاجات ومنسوجات' },
                    { name: 'Polystyrene (PS)', hs: '3903', forms: ['GPPS', 'HIPS', 'EPS'] },
                    { name: 'ABS', hs: '3903.30', uses: 'سيارات وإلكترونيات' },
                    { name: 'Nylon/PA', hs: '3908', uses: 'نسيج وميكانيك' }
                ]
            },
            fertilizers: {
                nameAr: 'أسمدة', nameEn: 'Fertilizers',
                hs_codes: ['3101', '3102', '3103', '3104', '3105'],
                types: ['Urea', 'Ammonium Nitrate', 'DAP', 'MAP', 'MOP (Potash)', 'SOP', 'NPK Compound'],
                top_producers: ['China', 'Russia', 'USA', 'Saudi Arabia (SABIC)', 'Canada (Nutrien)'],
                top_consumers: ['China', 'India', 'Brazil', 'USA', 'EU']
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 8️⃣ مواد البناء والإنشاء — CONSTRUCTION MATERIALS
    // ══════════════════════════════════════════════════════════════════════════
    construction: {
        id: 'construction',
        nameAr: 'مواد البناء والإنشاء',
        nameEn: 'Construction Materials',
        category: 'construction',
        icon: '🏗️',
        products: {
            cement: {
                nameAr: 'أسمنت', nameEn: 'Cement & Clinker',
                hs_codes: ['2523'],
                hs_details: { '2523.21': 'أسمنت أبيض', '2523.29': 'أسمنت بورتلاند أخرى', '2523.90': 'أسمنت آخر' },
                types: ['OPC (Ordinary Portland)', 'PPC (Pozzolana Portland)', 'SRPC (Sulfate Resistant)', 'White Cement', 'Clinker'],
                top_producers: ['China', 'India', 'Vietnam', 'USA', 'Brazil', 'Turkey'],
                unit: 'USD/MT',
                minOrderQty: '1000 MT'
            },
            steel_construction: {
                nameAr: 'حديد التسليح والمنشآت', nameEn: 'Construction Steel',
                hs_codes: ['7213', '7214', '7216'],
                types: ['Rebar/TMT', 'Wire Rod', 'Structural Sections (I-beam, H-beam, angle)', 'Hollow sections'],
                top_producers: ['China', 'India', 'Turkey', 'South Korea', 'Germany'],
                minOrderQty: '50 MT'
            },
            glass: {
                nameAr: 'زجاج', nameEn: 'Glass (Flat/Float)',
                hs_codes: ['7003', '7004', '7005', '7006'],
                types: ['float glass', 'tempered', 'laminated', 'coated', 'insulated'],
                top_producers: ['China', 'USA', 'Germany', 'India', 'Saudi Arabia'],
                minOrderQty: '20 MT'
            },
            stone_aggregates: {
                nameAr: 'حجارة وركام', nameEn: 'Stone & Aggregates',
                hs_codes: ['2515', '2516', '2517', '2521', '2522'],
                types: ['granite', 'marble', 'limestone', 'basalt', 'crushed stone', 'sand & gravel'],
                unit: 'USD/MT'
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 9️⃣ التعدين والمصاهر — MINING & SMELTING (Industry)
    // ══════════════════════════════════════════════════════════════════════════
    mining_smelting: {
        id: 'mining_smelting',
        nameAr: 'التعدين والمصاهر والمعالجة',
        nameEn: 'Mining, Smelting & Processing',
        category: 'industrial',
        icon: '⛏️',
        products: {
            iron_ore: {
                nameAr: 'خام الحديد', nameEn: 'Iron Ore',
                hs_codes: ['2601'],
                grades: ['Fe 62%', 'Fe 65%', 'Fe 58%', 'Pellets 66%+', 'Sinter Feed', 'Lump Ore'],
                top_producers: ['Australia (BHP, Rio Tinto, FMG)', 'Brazil (Vale)', 'China', 'India', 'South Africa', 'Russia'],
                top_consumers: ['China', 'Japan', 'South Korea', 'Germany', 'India'],
                unit: 'USD/MT CFR China',
                minOrderQty: '50,000 MT (Capesize)',
                typicalShipSize: { panamax: '70-80k MT', capesize: '150-180k MT' }
            },
            copper_concentrate: {
                nameAr: 'مركز النحاس', nameEn: 'Copper Concentrate',
                hs_codes: ['2603'],
                specs: ['Cu grade 20-35%', 'TC/RC (Treatment/Refining Charges)'],
                top_producers: ['Chile (Codelco)', 'Peru', 'DR Congo', 'Indonesia', 'Australia', 'USA'],
                unit: 'Benchmark TC + LME basis'
            },
            zinc_concentrate: { nameAr: 'مركز الزنك', nameEn: 'Zinc Concentrate', hs_codes: ['2608'] },
            lead_concentrate: { nameAr: 'مركز الرصاص', nameEn: 'Lead Concentrate', hs_codes: ['2607'] },
            nickel_ore: { nameAr: 'خام النيكل', nameEn: 'Nickel Ore / Laterite', hs_codes: ['2604'] },
            bauxite_alumina: {
                nameAr: 'بوكسيت وألومينا', nameEn: 'Bauxite & Alumina',
                hs_codes: ['2606', '2818.20'],
                hs_details: { '2606': 'خامات الألمنيوم (بوكسيت)', '2818.20': 'أكسيد الألمنيوم (ألومينا)' },
                process_chain: 'Bauxite → Alumina (Bayer) → Aluminum (Hall-Héroult)',
                top_producers: ['Guinea', 'Australia', 'China', 'Brazil', 'India', 'Jamaica']
            },
            manganese_ore: { nameAr: 'خام المنغنيز', nameEn: 'Manganese Ore', hs_codes: ['2602'], top_producers: ['South Africa', 'Gabon', 'Australia', 'China', 'Ghana'] },
            chromite_ore: { nameAr: 'خام الكروم', nameEn: 'Chromite Ore', hs_codes: ['2610'], top_producers: ['South Africa', 'Kazakhstan', 'India', 'Turkey', 'Finland'] },
            phosphate_rock: { nameAr: 'صخر الفوسفات', nameEn: 'Phosphate Rock', hs_codes: ['2510'], top_producers: ['Morocco (OCP)', 'China', 'Egypt', 'Saudi Arabia', 'Jordan'] }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 🔟 الصناعات التقنية والإلكترونيات — TECHNOLOGY & ELECTRONICS
    // ══════════════════════════════════════════════════════════════════════════
    technology_electronics: {
        id: 'technology_electronics',
        nameAr: 'الصناعات التقنية والإلكترونيات',
        nameEn: 'Technology & Electronics Manufacturing',
        category: 'technology',
        icon: '💻',
        products: {
            semiconductors: {
                nameAr: 'أشباه الموصلات', nameEn: 'Semiconductors & ICs',
                hs_codes: ['8541', '8542'],
                types: ['logic chips', 'memory (DRAM/NAND)', 'microprocessors', 'power semiconductors', 'analog ICs'],
                top_producers: ['TSMC (Taiwan)', 'Samsung (Korea)', 'Intel (USA)', 'SK Hynix (Korea)', 'Micron (USA)']
            },
            ev_batteries: {
                nameAr: 'بطاريات السيارات الكهربائية', nameEn: 'EV Battery Systems',
                hs_codes: ['8507.60', '8507.80'],
                types: ['LFP (Lithium Iron Phosphate)', 'NMC (Nickel Manganese Cobalt)', 'NCA', 'Solid-state'],
                top_producers: ['CATL (China)', 'BYD (China)', 'LG Energy (Korea)', 'Panasonic (Japan)', 'Samsung SDI']
            },
            renewable_energy_equipment: {
                nameAr: 'معدات الطاقة المتجددة', nameEn: 'Renewable Energy Equipment',
                hs_codes: ['8541.40', '8502.31', '8502.39'],
                types: ['solar panels (PV)', 'wind turbines', 'inverters', 'energy storage systems'],
                top_producers: ['China (Longi, JA Solar, Goldwind)', 'Vestas (Denmark)', 'Siemens Gamesa (Germany/Spain)']
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 1️⃣1️⃣ اللوجستيات والخدمات — LOGISTICS & SERVICES
    // ══════════════════════════════════════════════════════════════════════════
    logistics_services: {
        id: 'logistics_services',
        nameAr: 'خدمات اللوجستيات والنقل',
        nameEn: 'Logistics & Transport Services',
        category: 'logistics',
        icon: '🚢',
        globalMarketSize: '$10T+/year',
        products: {
            ocean_freight: {
                nameAr: 'شحن بحري', nameEn: 'Ocean Freight',
                services: ['FCL (Full Container Load)', 'LCL (Less than Container Load)', 'Bulk Cargo', 'Break Bulk', 'RORO', 'Project Cargo'],
                vessel_types: ['Container ship', 'Bulk carrier (Handysize/Panamax/Capesize)', 'Tanker (VLCC/Suezmax/Aframax)', 'RORO', 'LNG carrier'],
                top_carriers: ['MSC', 'Maersk', 'CMA CGM', 'COSCO', 'Evergreen', 'Hapag-Lloyd'],
                indices: ['SCFI (Shanghai Containerized Freight Index)', 'BDI (Baltic Dry Index)', 'WCI (World Container Index)']
            },
            air_freight: {
                nameAr: 'شحن جوي', nameEn: 'Air Freight',
                services: ['general cargo', 'dangerous goods', 'perishables', 'valuable cargo', 'express'],
                top_carriers: ['FedEx Cargo', 'UPS Airlines', 'Amazon Air', 'Qatar Airways Cargo', 'Emirates SkyCargo', 'Cargolux', 'LATAM Cargo'],
                unit: 'USD/kg'
            },
            road_freight: {
                nameAr: 'شحن بري', nameEn: 'Road Freight / Trucking',
                services: ['FTL (Full Truck Load)', 'LTL (Less than Truckload)', 'Flatbed', 'Reefer', 'Tanker Truck', 'Heavy-lift'],
                unit: 'USD/km or USD/load'
            },
            rail_freight: {
                nameAr: 'شحن بالسكة الحديد', nameEn: 'Rail Freight',
                services: ['intermodal containers', 'bulk commodities', 'automotive', 'oversized cargo'],
                key_routes: ['Silk Road (China-Europe)', 'Trans-Siberian', 'North America Class 1', 'African rail corridors']
            },
            ports_terminals: {
                nameAr: 'الموانئ والمحطات', nameEn: 'Ports & Terminals',
                top_container_ports: ['Shanghai', 'Singapore', 'Ningbo-Zhoushan', 'Shenzhen', 'Guangzhou', 'Busan', 'Hong Kong', 'Qingdao', 'Dubai (Jebel Ali)'],
                top_bulk_ports: ['Port Hedland (Australia)', 'Hay Point (Australia)', 'Tubarao (Brazil)', 'Newcastle (Australia)', 'Rotterdam', 'Jeddah', 'Yanbu']
            },
            warehousing: {
                nameAr: 'تخزين ومستودعات', nameEn: 'Warehousing & Distribution',
                types: ['ambient', 'temperature-controlled', 'hazmat', 'bonded warehouse', 'distribution center', 'fulfillment center', 'cross-docking'],
                tech: ['WMS systems', 'RFID', 'automated picking', 'AGV robots', 'IoT sensors']
            }
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 1️⃣2️⃣ التصنيع والصناعات التحويلية — MANUFACTURING
    // ══════════════════════════════════════════════════════════════════════════
    manufacturing: {
        id: 'manufacturing',
        nameAr: 'التصنيع والصناعات التحويلية',
        nameEn: 'Manufacturing & Industrial Processing',
        category: 'manufacturing',
        icon: '🏭',
        subsectors: {
            automotive: { nameAr: 'صناعة السيارات', hs_chapters: ['87'], top_hubs: ['Germany', 'Japan', 'China', 'USA', 'South Korea', 'India'] },
            machinery_equipment: { nameAr: 'آلات ومعدات', hs_chapters: ['84', '85'], top_hubs: ['Germany', 'China', 'Japan', 'USA', 'Italy', 'South Korea'] },
            textiles_apparel: { nameAr: 'منسوجات وملابس', hs_chapters: ['50-63'], top_hubs: ['China', 'Bangladesh', 'India', 'Vietnam', 'Turkey', 'Cambodia'] },
            pharmaceuticals: { nameAr: 'دواء ومستحضرات', hs_chapters: ['30'], top_hubs: ['USA', 'Germany', 'Switzerland', 'India', 'China', 'Ireland'] },
            aerospace_defense: { nameAr: 'طيران ودفاع', hs_codes: ['8801-8805', '8901-8908'], top_hubs: ['USA', 'France', 'UK', 'Germany', 'Russia', 'China'] },
            medical_devices: { nameAr: 'أجهزة طبية', hs_chapters: ['90'], top_hubs: ['USA', 'Germany', 'Japan', 'China', 'Netherlands', 'Ireland'] }
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HS Code Engine — محرك البحث عبر رمز المنتج الجمركي
// ═══════════════════════════════════════════════════════════════════════════════

class HSCodeEngine {
    constructor() {
        this.database = GLOBAL_MARKETS_DATABASE;
        this._buildHSIndex();
    }

    _buildHSIndex() {
        this._hsIndex = {};
        const scan = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj.hs_codes)) {
                obj.hs_codes.forEach(code => {
                    const clean = String(code).replace(/\./g, '');
                    this._hsIndex[clean] = { ...obj, _path: path };
                    // Also index 4-digit prefix
                    const prefix = clean.substring(0, 4);
                    if (!this._hsIndex[prefix]) this._hsIndex[prefix] = { ...obj, _path: path };
                });
            }
            if (typeof obj.hs_codes === 'string') {
                const clean = obj.hs_codes.replace(/\./g, '');
                this._hsIndex[clean] = { ...obj, _path: path };
            }
            Object.entries(obj).forEach(([key, val]) => {
                if (typeof val === 'object' && val !== null && key !== 'hs_details') {
                    scan(val, path ? `${path}.${key}` : key);
                }
            });
        };
        scan(this.database);
    }

    /**
     * البحث بكود HS
     */
    searchByHSCode(code) {
        const clean = String(code).replace(/[\s.,-]/g, '');
        // Exact match
        if (this._hsIndex[clean]) return { found: true, code: clean, data: this._hsIndex[clean] };
        // 4-digit prefix
        const prefix4 = clean.substring(0, 4);
        if (this._hsIndex[prefix4]) return { found: true, code: prefix4, data: this._hsIndex[prefix4] };
        // 2-digit chapter
        const prefix2 = clean.substring(0, 2);
        const chapterResults = Object.entries(this._hsIndex)
            .filter(([k]) => k.startsWith(prefix2))
            .map(([k, v]) => ({ code: k, data: v }));
        if (chapterResults.length > 0) return { found: true, code: prefix2, chapter: true, results: chapterResults };
        return { found: false, code: clean, message: 'رمز HS غير موجود في قاعدة البيانات' };
    }

    /**
     * البحث النصي
     */
    searchByText(query) {
        const q = query.toLowerCase();
        const results = [];
        const scan = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return;
            Object.entries(obj).forEach(([key, val]) => {
                if (typeof val === 'string' && val.toLowerCase().includes(q)) {
                    results.push({ path, key, value: val });
                } else if (typeof val === 'object' && val !== null) {
                    scan(val, path ? `${path}.${key}` : key);
                }
            });
        };
        scan(this.database);
        return results.slice(0, 20);
    }

    /**
     * الحصول على كل معلومات سوق معين
     */
    getMarket(marketId) {
        return this.database[marketId] || null;
    }

    /**
     * قائمة بجميع الأسواق
     */
    getAllMarkets() {
        return Object.entries(this.database).map(([id, market]) => ({
            id,
            nameAr: market.nameAr,
            nameEn: market.nameEn,
            icon: market.icon,
            category: market.category,
            globalMarketSize: market.globalMarketSize || null,
            productsCount: market.products ? Object.keys(market.products).length : 0
        }));
    }

    /**
     * الحصول على منتج محدد
     */
    getProduct(marketId, productId) {
        const market = this.database[marketId];
        if (!market) return null;
        return market.products ? (market.products[productId] || null) : null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Market Intelligence Engine — محرك ذكاء السوق
// ═══════════════════════════════════════════════════════════════════════════════

class MarketIntelligenceEngine extends EventEmitter {
    constructor() {
        super();
        this.hsEngine = new HSCodeEngine();
        this.marketData = GLOBAL_MARKETS_DATABASE;
        this._priceCache = new Map();
        this._alertsRegistry = new Map();
    }

    /**
     * تحليل السوق لمنتج معين
     */
    analyzeMarket(marketId, productId, options = {}) {
        const market = this.marketData[marketId];
        if (!market) return { error: `سوق '${marketId}' غير موجود` };

        const product = market.products ? market.products[productId] : null;

        return {
            market: {
                id: marketId,
                nameAr: market.nameAr,
                nameEn: market.nameEn,
                category: market.category,
                globalMarketSize: market.globalMarketSize,
                exchanges: market.exchanges || [],
                islamicCompliance: market.islamicCompliance || 'يُرجى مراجعة الشريعة'
            },
            product: product ? {
                id: productId,
                nameAr: product.nameAr,
                nameEn: product.nameEn,
                hs_codes: product.hs_codes || [],
                forms: product.forms || [],
                grades: product.grades || [],
                top_producers: product.top_producers || [],
                top_consumers: product.top_consumers || [],
                uses: product.uses || [],
                minOrderQty: product.minOrderQty || 'N/A',
                incoterms: product.incoterms || ['FOB', 'CIF', 'EXW'],
                logistic_considerations: product.logistic_considerations || []
            } : null,
            analysis: {
                marketMaturity: this._assessMaturity(marketId),
                tradingOpportunities: this._findOpportunities(marketId, productId),
                keyRisks: this._assessRisks(marketId, productId),
                recommendedIncoterms: product ? (product.incoterms || ['FOB', 'CIF']) : ['FOB'],
                certificationRequirements: product ? (product.certifications || []) : [],
                timestamp: new Date().toISOString()
            }
        };
    }

    _assessMaturity(marketId) {
        const mature = ['base_metals', 'precious_metals', 'energy', 'agriculture'];
        const growing = ['rare_critical_minerals', 'scrap_recycled', 'technology_electronics'];
        if (mature.includes(marketId)) return 'mature';
        if (growing.includes(marketId)) return 'high-growth';
        return 'established';
    }

    _findOpportunities(marketId, productId) {
        const opportunities = {
            base_metals: ['arbitrage بين مناطق جغرافية', 'تكرير وإضافة قيمة', 'عقود طويلة الأمد مع مصانع'],
            precious_metals: ['تجارة السبائك الاستثمارية', 'إعادة تكرير المجوهرات', 'خدمة الأمانة (Custody)'],
            rare_critical_minerals: ['عقود تأمين إمداد مطوّلة', 'شراكات مع مصنّعي EV والبطاريات'],
            scrap_recycled: ['تجميع وتصدير', 'تطوير منشآت فرز ومعالجة', 'اتفاقيات مع المصانع الكبرى'],
            energy: ['وساطة صفقات LNG / نفط خام', 'خدمات شحن ناقلات'],
            agriculture: ['تصدير حلال', 'ربط مزارعين بمستوردين', 'خدمات تبريد وتخزين'],
            mining_smelting: ['تصدير خامات', 'عقود رسوم معالجة (TC/RC)', 'شراكات مناجم جديدة'],
            logistics_services: ['خدمات تخزين', 'وكالات شحن', 'خدمات 4PL'],
            construction: ['توريد مواد بناء لمشاريع كبرى', 'رسوم معالجة وتحويل'],
            chemicals: ['تجارة خام البتروكيماويات', 'وساطة بوليمرات']
        };
        return opportunities[marketId] || ['التجارة المباشرة', 'الوساطة التجارية', 'خدمات التخزين'];
    }

    _assessRisks(marketId, productId) {
        const risks = {
            base_metals: ['تذبذب أسعار LME', 'تقلبات الطلب الصيني', 'تكاليف الطاقة', 'مخاطر الشحن'],
            precious_metals: ['تقلبات أسعار الذهب', 'قرارات الاحتياطي الفيدرالي', 'مخاطر شرعية (صرف يد بيد)'],
            rare_critical_minerals: ['مخاطر التركّز (China dominance)', 'تقلبات شديدة في الأسعار', 'سياسات تصدير'],
            scrap_recycled: ['تقلبات جودة المواد', 'قرارات استيراد الصين', 'لوائح بيئية', 'تكاليف الفرز'],
            energy: ['أسعار نفط متقلبة', 'مخاطر جيوسياسية', 'لوائح بيئية متشددة'],
            agriculture: ['مخاطر المناخ', 'تقلبات المحصول', 'حواجز جمركية', 'مخاطر العملة'],
            mining_smelting: ['مخاطر التراخيص والمجتمع', 'تكاليف إنشاء المناجم', 'تذبذب أسعار المعادن'],
            logistics_services: ['اضطرابات سلاسل الإمداد', 'تقلبات أسعار الوقود', 'عطل الموانئ', 'لوائح جمركية']
        };
        return risks[marketId] || ['مخاطر سعرية', 'مخاطر تنظيمية', 'مخاطر جودة'];
    }

    /**
     * حساب التكلفة الإجمالية للتجارة (بشكل تقديري)
     */
    estimateTradeCost(params) {
        const {
            product, origin, destination, quantity, unit,
            transport_mode = 'sea', insurance = true
        } = params;

        const baseFreightRates = {
            sea: { short: 25, medium: 45, long: 65 },   // USD/MT
            air: { short: 1.5, medium: 2.5, long: 3.5 }, // USD/kg
            road: { short: 15, medium: 30, long: 50 }     // USD/MT
        };

        const qty_mt = unit === 'kg' ? quantity / 1000 : quantity;
        const rates = baseFreightRates[transport_mode] || baseFreightRates.sea;
        const freight_rate = rates.medium;
        const freight_cost = qty_mt * freight_rate;
        const insurance_cost = insurance ? freight_cost * 0.003 : 0;
        const customs_duty = qty_mt * 5; // تقديري
        const port_charges = qty_mt * 3;
        const total = freight_cost + insurance_cost + customs_duty + port_charges;

        return {
            quantity: `${qty_mt} MT`,
            transport_mode,
            freight_cost: `$${freight_cost.toFixed(2)}`,
            insurance_cost: insurance ? `$${insurance_cost.toFixed(2)}` : '$0',
            customs_estimate: `$${customs_duty.toFixed(2)}`,
            port_charges: `$${port_charges.toFixed(2)}`,
            total_logistics_cost: `$${total.toFixed(2)}`,
            cost_per_mt: `$${(total / qty_mt).toFixed(2)}/MT`,
            note: 'هذه تكاليف تقديرية — الحصول على عروض رسمية من شركات الشحن',
            incoterms_recommendation: 'FOB للصادرات، CIF للواردات'
        };
    }

    /**
     * خريطة التجارة العالمية لمنتج معين
     */
    getTradeFlowMap(marketId, productId) {
        const product = this.hsEngine.getProduct(marketId, productId);
        if (!product) return null;
        return {
            product: product.nameEn || productId,
            exporters: product.top_producers || [],
            importers: product.top_consumers || [],
            majorRoutes: product.majorTradeFlows || [],
            hs_codes: product.hs_codes || [],
            keyExchanges: this.marketData[marketId]?.exchanges || []
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Module Exports
// ═══════════════════════════════════════════════════════════════════════════════

const hsEngine = new HSCodeEngine();
const marketIntelligence = new MarketIntelligenceEngine();

module.exports = {
    GLOBAL_MARKETS_DATABASE,
    HSCodeEngine,
    MarketIntelligenceEngine,
    hsEngine,
    marketIntelligence,

    // Convenience API
    getAllMarkets: () => hsEngine.getAllMarkets(),
    getMarket: (id) => hsEngine.getMarket(id),
    getProduct: (marketId, productId) => hsEngine.getProduct(marketId, productId),
    searchByHSCode: (code) => hsEngine.searchByHSCode(code),
    searchByText: (q) => hsEngine.searchByText(q),
    analyzeMarket: (mId, pId, opts) => marketIntelligence.analyzeMarket(mId, pId, opts),
    estimateTradeCost: (params) => marketIntelligence.estimateTradeCost(params),
    getTradeFlowMap: (mId, pId) => marketIntelligence.getTradeFlowMap(mId, pId)
};
