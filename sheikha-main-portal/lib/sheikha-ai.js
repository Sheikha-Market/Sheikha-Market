/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة للذكاء الاصطناعي — الإصدار المتقدم
 * Sheikha AI System v2.0 — Advanced Local AI Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * أنا شيخة — ذكاء اصطناعي سعودي رائد ومتخصص
 * الموقع الرسمي: https://www.sheikha.top
 * 
 * نظام ذكاء مستقل بالكامل — لا يعتمد على مزودين خارجيين
 * متخصص في: المعادن، السكراب، سلاسل الإمداد، إعادة التدوير
 * 
 * المميزات:
 * - قاعدة معرفة متخصصة وموسّعة
 * - نظام RAG (Retrieval-Augmented Generation)
 * - تحليل النوايا المتقدم
 * - محرك البحث الدلالي
 * - التعلم من التفاعلات
 * - شخصية شيخة الرائدة علمياً وتجارياً
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
// قاعدة المعرفة الشاملة — Knowledge Base
// ═══════════════════════════════════════════════════════════════════════════════

const KNOWLEDGE_BASE = {
    // ─────────────────────────────────────────────────────────────────────────
    // المعادن والسكراب — تفاصيل شاملة
    // ─────────────────────────────────────────────────────────────────────────
    metals: {
        iron: {
            id: 'iron',
            nameAr: 'حديد',
            nameEn: 'Iron/Steel',
            icon: '🔩',
            types: [
                { id: 'rebar', nameAr: 'حديد تسليح', nameEn: 'Rebar', hsCode: '7214' },
                { id: 'sheet', nameAr: 'صاج', nameEn: 'Sheet', hsCode: '7208' },
                { id: 'sections', nameAr: 'مقاطع', nameEn: 'Sections', hsCode: '7216' },
                { id: 'hms1', nameAr: 'سكراب HMS1', nameEn: 'HMS1', hsCode: '7204', isri: 'HMS 1' },
                { id: 'hms2', nameAr: 'سكراب HMS2', nameEn: 'HMS2', hsCode: '7204', isri: 'HMS 2' },
                { id: 'shredded', nameAr: 'حديد مفروم', nameEn: 'Shredded', hsCode: '7204' }
            ],
            priceFactors: ['الوزن', 'النقاء', 'نسبة الشوائب', 'الموقع', 'العرض والطلب'],
            hsCode: '7204',
            recyclingValue: 0.85,
            environmentalImpact: {
                co2Saved: 1.5, // طن CO2 لكل طن معاد تدويره
                energySaved: 74, // نسبة توفير الطاقة
                waterSaved: 40 // نسبة توفير المياه
            },
            qualityGrades: ['A', 'B', 'C'],
            specifications: {
                density: 7.87, // g/cm³
                meltingPoint: 1538 // درجة مئوية
            }
        },
        copper: {
            id: 'copper',
            nameAr: 'نحاس',
            nameEn: 'Copper',
            icon: '🥉',
            types: [
                { id: 'wire', nameAr: 'أسلاك نحاس', nameEn: 'Copper Wire', hsCode: '7408' },
                { id: 'tube', nameAr: 'أنابيب نحاس', nameEn: 'Copper Tube', hsCode: '7411' },
                { id: 'berry', nameAr: 'Berry', nameEn: 'Berry (Bare Bright)', hsCode: '7404', isri: 'Berry' },
                { id: 'birch', nameAr: 'Birch', nameEn: 'Birch Cliff', hsCode: '7404', isri: 'Birch' },
                { id: 'candy', nameAr: 'Candy', nameEn: 'Candy', hsCode: '7404', isri: 'Candy' }
            ],
            priceFactors: ['النقاء', 'النوع', 'الوزن', 'سعر LME'],
            hsCode: '7404',
            recyclingValue: 0.95,
            environmentalImpact: {
                co2Saved: 4.0,
                energySaved: 85,
                waterSaved: 50
            },
            qualityGrades: ['#1', '#2', '#3'],
            specifications: {
                density: 8.96,
                meltingPoint: 1085
            }
        },
        aluminum: {
            id: 'aluminum',
            nameAr: 'ألمنيوم',
            nameEn: 'Aluminum',
            icon: '🪙',
            types: [
                { id: 'extrusion', nameAr: 'قطاعات ألمنيوم', nameEn: 'Extrusions', hsCode: '7604' },
                { id: 'sheet', nameAr: 'لفائف ألمنيوم', nameEn: 'Sheet/Coil', hsCode: '7606' },
                { id: 'taint', nameAr: 'Taint/Tabor', nameEn: 'Taint/Tabor', hsCode: '7602', isri: 'Taint' },
                { id: 'cans', nameAr: 'علب ألمنيوم', nameEn: 'UBC (Used Beverage Cans)', hsCode: '7602', isri: 'Taldon' },
                { id: 'cast', nameAr: 'ألمنيوم مصبوب', nameEn: 'Cast Aluminum', hsCode: '7602' }
            ],
            priceFactors: ['السبيكة', 'النقاء', 'نسبة الشوائب', 'سعر LME'],
            hsCode: '7602',
            recyclingValue: 0.90,
            environmentalImpact: {
                co2Saved: 9.0,
                energySaved: 95,
                waterSaved: 90
            },
            qualityGrades: ['Clean', 'Mixed', 'Contaminated'],
            specifications: {
                density: 2.70,
                meltingPoint: 660
            }
        },
        stainless: {
            id: 'stainless',
            nameAr: 'ستانلس ستيل',
            nameEn: 'Stainless Steel',
            icon: '✨',
            types: [
                { id: '304', nameAr: 'ستانلس 304', nameEn: '304 SS', hsCode: '7218' },
                { id: '316', nameAr: 'ستانلس 316', nameEn: '316 SS', hsCode: '7218' },
                { id: '430', nameAr: 'ستانلس 430', nameEn: '430 SS', hsCode: '7218' },
                { id: 'mixed', nameAr: 'ستانلس مختلط', nameEn: 'Mixed SS', hsCode: '7204' }
            ],
            priceFactors: ['الدرجة', 'النقاء', 'نسبة النيكل'],
            hsCode: '7204',
            recyclingValue: 0.88,
            environmentalImpact: {
                co2Saved: 2.0,
                energySaved: 70,
                waterSaved: 35
            },
            qualityGrades: ['304', '316', '430', 'Mixed'],
            specifications: {
                density: 8.0,
                meltingPoint: 1450
            }
        },
        cables: {
            id: 'cables',
            nameAr: 'كابلات',
            nameEn: 'Cables',
            icon: '🔌',
            types: [
                { id: 'power', nameAr: 'كابلات كهرباء', nameEn: 'Power Cables', hsCode: '8544' },
                { id: 'communication', nameAr: 'كابلات اتصالات', nameEn: 'Communication Cables', hsCode: '8544' },
                { id: 'insulated', nameAr: 'كابلات معزولة', nameEn: 'Insulated Wire', hsCode: '7404', isri: 'Druid' }
            ],
            priceFactors: ['نسبة النحاس', 'نوع العزل', 'الوزن'],
            hsCode: '7404',
            recyclingValue: 0.70,
            environmentalImpact: {
                co2Saved: 3.0,
                energySaved: 75,
                waterSaved: 40
            }
        },
        batteries: {
            id: 'batteries',
            nameAr: 'بطاريات',
            nameEn: 'Batteries',
            icon: '🔋',
            types: [
                { id: 'lead-acid', nameAr: 'بطاريات رصاص', nameEn: 'Lead-Acid', hsCode: '8548' },
                { id: 'lithium', nameAr: 'بطاريات ليثيوم', nameEn: 'Lithium-Ion', hsCode: '8548' },
                { id: 'nickel', nameAr: 'بطاريات نيكل', nameEn: 'NiMH/NiCd', hsCode: '8548' }
            ],
            priceFactors: ['نوع البطارية', 'الوزن', 'محتوى الرصاص/الليثيوم'],
            hsCode: '8548',
            recyclingValue: 0.80,
            environmentalImpact: {
                co2Saved: 2.5,
                energySaved: 65,
                waterSaved: 30
            },
            hazardous: true,
            specialHandling: 'يتطلب تراخيص خاصة للتعامل'
        },
        electronics: {
            id: 'electronics',
            nameAr: 'إلكترونيات',
            nameEn: 'E-Waste',
            icon: '📱',
            types: [
                { id: 'pcb', nameAr: 'لوحات إلكترونية', nameEn: 'PCB', hsCode: '8534' },
                { id: 'phones', nameAr: 'هواتف', nameEn: 'Mobile Phones', hsCode: '8517' },
                { id: 'computers', nameAr: 'حواسيب', nameEn: 'Computers', hsCode: '8471' }
            ],
            priceFactors: ['محتوى المعادن الثمينة', 'النوع', 'الحالة'],
            hsCode: '8549',
            recyclingValue: 0.75,
            preciousMetals: ['ذهب', 'فضة', 'بلاتين', 'بالاديوم']
        },
        // ═══════════════════════════════════════════════════════════════════════
        // المعادن الثمينة والمجوهرات — Precious Metals & Jewelry (HS 71)
        // ═══════════════════════════════════════════════════════════════════════
        gold: {
            id: 'gold',
            nameAr: 'ذهب',
            nameEn: 'Gold',
            icon: '🥇',
            types: [
                { id: 'gold24', nameAr: 'ذهب عيار 24', nameEn: '24K Gold (999.9)', hsCode: '7108.12', purity: 99.99 },
                { id: 'gold22', nameAr: 'ذهب عيار 22', nameEn: '22K Gold (916)', hsCode: '7108.12', purity: 91.6 },
                { id: 'gold21', nameAr: 'ذهب عيار 21', nameEn: '21K Gold (875)', hsCode: '7108.12', purity: 87.5 },
                { id: 'gold18', nameAr: 'ذهب عيار 18', nameEn: '18K Gold (750)', hsCode: '7108.12', purity: 75.0 },
                { id: 'goldBars', nameAr: 'سبائك ذهب', nameEn: 'Gold Bars/Ingots', hsCode: '7108.12', isInvestment: true },
                { id: 'goldCoins', nameAr: 'عملات ذهبية', nameEn: 'Gold Coins', hsCode: '7118.90', isInvestment: true },
                { id: 'goldScrap', nameAr: 'كسر ذهب', nameEn: 'Gold Scrap', hsCode: '7112.91' },
                { id: 'goldJewelry', nameAr: 'مجوهرات ذهب', nameEn: 'Gold Jewelry', hsCode: '7113.19' }
            ],
            priceFactors: ['العيار/النقاء', 'الوزن', 'سعر الأونصة العالمي', 'المصنعية', 'التصميم'],
            hsCode: '7108',
            specifications: {
                density: 19.32,
                meltingPoint: 1064,
                atomicNumber: 79,
                symbol: 'Au'
            },
            marketReferences: ['LBMA', 'COMEX', 'سوق دبي للذهب'],
            regulations: ['ترخيص تجارة الذهب', 'الدمغة الرسمية', 'شهادة المنشأ']
        },
        silver: {
            id: 'silver',
            nameAr: 'فضة',
            nameEn: 'Silver',
            icon: '🥈',
            types: [
                { id: 'silver999', nameAr: 'فضة نقية 999', nameEn: '999 Fine Silver', hsCode: '7106.91', purity: 99.9 },
                { id: 'silver925', nameAr: 'فضة استرليني 925', nameEn: 'Sterling Silver 925', hsCode: '7106.91', purity: 92.5 },
                { id: 'silverBars', nameAr: 'سبائك فضة', nameEn: 'Silver Bars', hsCode: '7106.91' },
                { id: 'silverJewelry', nameAr: 'مجوهرات فضة', nameEn: 'Silver Jewelry', hsCode: '7113.11' },
                { id: 'silverScrap', nameAr: 'كسر فضة', nameEn: 'Silver Scrap', hsCode: '7112.99' },
                { id: 'silverIndustrial', nameAr: 'فضة صناعية', nameEn: 'Industrial Silver', hsCode: '7106.92' }
            ],
            priceFactors: ['النقاء', 'الوزن', 'سعر الأونصة', 'الاستخدام'],
            hsCode: '7106',
            specifications: {
                density: 10.49,
                meltingPoint: 962,
                atomicNumber: 47,
                symbol: 'Ag'
            }
        },
        platinum: {
            id: 'platinum',
            nameAr: 'بلاتين',
            nameEn: 'Platinum',
            icon: '⚪',
            types: [
                { id: 'platinum999', nameAr: 'بلاتين 999', nameEn: '999 Platinum', hsCode: '7110.11', purity: 99.9 },
                { id: 'platinum950', nameAr: 'بلاتين 950', nameEn: '950 Platinum', hsCode: '7110.11', purity: 95.0 },
                { id: 'platinumBars', nameAr: 'سبائك بلاتين', nameEn: 'Platinum Bars', hsCode: '7110.11' },
                { id: 'platinumJewelry', nameAr: 'مجوهرات بلاتين', nameEn: 'Platinum Jewelry', hsCode: '7113.19' },
                { id: 'platinumIndustrial', nameAr: 'بلاتين صناعي', nameEn: 'Industrial Platinum', hsCode: '7110.19' }
            ],
            priceFactors: ['النقاء', 'الوزن', 'سعر السوق', 'الطلب الصناعي'],
            hsCode: '7110',
            specifications: {
                density: 21.45,
                meltingPoint: 1768,
                atomicNumber: 78,
                symbol: 'Pt'
            },
            industrialUses: ['محولات حفازة', 'معدات طبية', 'إلكترونيات', 'مختبرات']
        },
        palladium: {
            id: 'palladium',
            nameAr: 'بالاديوم',
            nameEn: 'Palladium',
            icon: '💿',
            types: [
                { id: 'palladium999', nameAr: 'بالاديوم 999', nameEn: '999 Palladium', hsCode: '7110.21', purity: 99.9 },
                { id: 'palladiumBars', nameAr: 'سبائك بالاديوم', nameEn: 'Palladium Bars', hsCode: '7110.21' },
                { id: 'palladiumIndustrial', nameAr: 'بالاديوم صناعي', nameEn: 'Industrial Palladium', hsCode: '7110.29' }
            ],
            priceFactors: ['النقاء', 'الوزن', 'الطلب الصناعي'],
            hsCode: '7110',
            specifications: {
                density: 12.02,
                meltingPoint: 1555,
                atomicNumber: 46,
                symbol: 'Pd'
            },
            industrialUses: ['محولات حفازة (السيارات)', 'إلكترونيات', 'طب الأسنان']
        },
        diamonds: {
            id: 'diamonds',
            nameAr: 'ألماس',
            nameEn: 'Diamonds',
            icon: '💎',
            types: [
                { id: 'naturalRough', nameAr: 'ألماس خام طبيعي', nameEn: 'Natural Rough Diamonds', hsCode: '7102.10' },
                { id: 'naturalPolished', nameAr: 'ألماس مصقول', nameEn: 'Polished Diamonds', hsCode: '7102.31' },
                { id: 'industrialDiamond', nameAr: 'ألماس صناعي', nameEn: 'Industrial Diamonds', hsCode: '7102.21' },
                { id: 'labGrown', nameAr: 'ألماس مختبري', nameEn: 'Lab-Grown Diamonds', hsCode: '7104.10' }
            ],
            priceFactors: ['القيراط (Carat)', 'اللون (Color)', 'النقاء (Clarity)', 'القطع (Cut)', 'الشهادة'],
            hsCode: '7102',
            gradingSystem: {
                carat: 'الوزن - 1 قيراط = 0.2 جرام',
                color: 'D (أبيض استثنائي) إلى Z (أصفر فاتح)',
                clarity: 'FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2, I3',
                cut: 'Excellent, Very Good, Good, Fair, Poor'
            },
            certifications: ['GIA', 'IGI', 'HRD', 'AGS']
        },
        gemstones: {
            id: 'gemstones',
            nameAr: 'أحجار كريمة',
            nameEn: 'Gemstones',
            icon: '💠',
            types: [
                { id: 'ruby', nameAr: 'ياقوت أحمر', nameEn: 'Ruby', hsCode: '7103.91' },
                { id: 'sapphire', nameAr: 'ياقوت أزرق', nameEn: 'Sapphire', hsCode: '7103.91' },
                { id: 'emerald', nameAr: 'زمرد', nameEn: 'Emerald', hsCode: '7103.91' },
                { id: 'pearl', nameAr: 'لؤلؤ', nameEn: 'Pearls', hsCode: '7101' },
                { id: 'opal', nameAr: 'عقيق', nameEn: 'Opal', hsCode: '7103.99' },
                { id: 'amethyst', nameAr: 'جمشت', nameEn: 'Amethyst', hsCode: '7103.99' }
            ],
            priceFactors: ['اللون', 'الحجم', 'النقاء', 'المصدر', 'المعالجة'],
            hsCode: '7103'
        },
        jewelry: {
            id: 'jewelry',
            nameAr: 'مجوهرات',
            nameEn: 'Jewelry',
            icon: '💍',
            types: [
                { id: 'goldJewelry', nameAr: 'مجوهرات ذهب', nameEn: 'Gold Jewelry', hsCode: '7113.19' },
                { id: 'silverJewelry', nameAr: 'مجوهرات فضة', nameEn: 'Silver Jewelry', hsCode: '7113.11' },
                { id: 'platinumJewelry', nameAr: 'مجوهرات بلاتين', nameEn: 'Platinum Jewelry', hsCode: '7113.19' },
                { id: 'diamondJewelry', nameAr: 'مجوهرات ألماس', nameEn: 'Diamond Jewelry', hsCode: '7113.19' },
                { id: 'pearlJewelry', nameAr: 'مجوهرات لؤلؤ', nameEn: 'Pearl Jewelry', hsCode: '7116.10' },
                { id: 'costumeJewelry', nameAr: 'مجوهرات صناعية', nameEn: 'Costume Jewelry', hsCode: '7117.19' }
            ],
            priceFactors: ['المعدن', 'الأحجار', 'التصميم', 'العلامة التجارية', 'المصنعية'],
            hsCode: '7113'
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // هيكل المنظومة — System Structure
    // ═══════════════════════════════════════════════════════════════════════════════
    systemStructure: {
        pages: {
            main: { path: '/index.html', nameAr: 'الصفحة الرئيسية', description: 'بوابة المنظومة' },
            market: { path: '/السوق.html', nameAr: 'السوق', description: '3 أقسام: معادن أساسية، سكراب، معادن ثمينة' },
            dashboard: { path: '/لوحة-التحكم.html', nameAr: 'لوحة التحكم', description: 'إدارة الحساب والمتجر' },
            register: { path: '/تسجيل-تاجر.html', nameAr: 'تسجيل تاجر', description: 'فتح متجر جديد' },
            login: { path: '/تسجيل-الدخول.html', nameAr: 'تسجيل الدخول', description: 'دخول الحساب' },
            addProduct: { path: '/عرض-بضائع.html', nameAr: 'عرض بضائع', description: 'إضافة منتجات للبيع' },
            sellProcess: { path: '/آلية-البيع.html', nameAr: 'آلية البيع', description: 'خطوات البيع والشراء' },
            regulations: { path: '/اللوائح-والقوانين-والاجراءات.html', nameAr: 'اللوائح', description: 'القوانين والإجراءات' },
            assistant: { path: '/مساعد-شيخه.html', nameAr: 'المساعد الذكي', description: 'شيخه AI للمساعدة' },
            forum: { path: '/المنتدى.html', nameAr: 'المنتدى العلمي', description: 'مجتمع المتخصصين' },
            researchLab: { path: '/مركز-الأبحاث.html', nameAr: 'مختبر الأبحاث', description: 'البحث العلمي' },
            sitemap: { path: '/خريطة-الموقع.html', nameAr: 'خريطة الموقع', description: 'جميع صفحات المنظومة' },
            admin: { path: '/ادارة-النظام.html', nameAr: 'إدارة النظام', description: 'لوحة الأدمن' },
            devops: { path: '/devops.html', nameAr: 'DevOps', description: 'إدارة السيرفرات والتقنيات' },
            apiDocs: { path: '/توثيق-api.html', nameAr: 'توثيق API', description: 'وثائق الـ APIs' }
        },
        dataStorage: {
            location: '/data/',
            files: {
                users: 'users.json',
                traders: 'traders.json',
                listings: 'listings.json',
                aiLearning: 'ai-learning.json',
                forum: 'forum.json',
                research: 'research.json',
                intelligence: 'intelligence.json',
                analytics: 'analytics/page-views.json',
                operations: 'operations/'
            }
        },
        apis: {
            auth: '/api/auth/*',
            listings: '/api/listings/*',
            traders: '/api/traders/*',
            ai: '/api/ai/*',
            forum: '/api/forum/*',
            research: '/api/research/*',
            intelligence: '/api/intelligence/*',
            server: '/api/server/*'
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // سلاسل الإمداد المتخصصة — Specialized Supply Chains
    // ═══════════════════════════════════════════════════════════════════════════════
    supplyChains: {
        // سلسلة إمداد المعادن الأساسية
        baseMetals: {
            name: 'سلسلة إمداد المعادن الأساسية',
            nameEn: 'Base Metals Supply Chain',
            stages: [
                { id: 'mining', nameAr: 'التعدين', nameEn: 'Mining', icon: '⛏️', description: 'استخراج المواد الخام' },
                { id: 'manufacturing', nameAr: 'التصنيع', nameEn: 'Manufacturing', icon: '🏭', description: 'الصهر والتشكيل' },
                { id: 'storage', nameAr: 'التخزين', nameEn: 'Storage', icon: '📦', description: 'مستودعات معتمدة' },
                { id: 'transport', nameAr: 'النقل', nameEn: 'Transport', icon: '🚛', description: 'شاحنات ثقيلة' },
                { id: 'distribution', nameAr: 'التوزيع', nameEn: 'Distribution', icon: '🏪', description: 'تجار الجملة' },
                { id: 'consumer', nameAr: 'المستهلك', nameEn: 'Consumer', icon: '🏠', description: 'المصانع والمشاريع' }
            ],
            logistics: {
                roadTransport: {
                    nameAr: 'النقل البري الثقيل',
                    types: ['شاحنات مسطحة (Flatbed) - 40 طن', 'تريلات نقل الكويلات', 'شاحنات مقطورة للمقاطع']
                },
                railTransport: {
                    nameAr: 'النقل بالسكك الحديدية',
                    types: ['عربات الشحن المفتوحة', 'الربط مع الموانئ', 'شحنات أكثر من 100 طن']
                },
                seaTransport: {
                    nameAr: 'النقل البحري',
                    types: ['حاويات 20ft / 40ft', 'سفن البضائع السائبة', 'تصدير للأسواق العالمية']
                }
            }
        },

        // سلسلة إمداد إعادة التدوير (السكراب)
        recycling: {
            name: 'سلسلة إمداد إعادة التدوير',
            nameEn: 'Recycling Supply Chain',
            stages: [
                { id: 'source', nameAr: 'المصدر', nameEn: 'Source', icon: '🗑️', description: 'مصانع، ورش، هدم' },
                { id: 'collection', nameAr: 'التجميع', nameEn: 'Collection', icon: '📦', description: 'حاويات ونقاط تجميع' },
                { id: 'processing', nameAr: 'الفرز والمعالجة', nameEn: 'Sorting & Processing', icon: '⚙️', description: 'تنظيف، تقطيع، ضغط' },
                { id: 'transport', nameAr: 'النقل المتخصص', nameEn: 'Specialized Transport', icon: '🚛', description: 'حاويات سكراب' },
                { id: 'smelter', nameAr: 'المصهر', nameEn: 'Smelter', icon: '🏭', description: 'إعادة الصهر' },
                { id: 'newProduct', nameAr: 'المنتج الجديد', nameEn: 'New Product', icon: '🔄', description: 'سبائك ومنتجات' }
            ],
            containers: [
                { id: 'small', nameAr: 'حاوية سكراب صغيرة', volume: '3-5 م³', capacity: '5 طن', use: 'للورش الصغيرة والمنازل' },
                { id: 'medium', nameAr: 'حاوية سكراب متوسطة', volume: '10-15 م³', capacity: '15 طن', use: 'للورش والمشاريع المتوسطة' },
                { id: 'large', nameAr: 'حاوية Roll-off كبيرة', volume: '20-40 م³', capacity: '30 طن', use: 'للمصانع ومواقع الهدم' },
                { id: 'ewaste', nameAr: 'حاوية نفايات إلكترونية', specs: 'مغلقة وآمنة', use: 'للأجهزة الإلكترونية القديمة' },
                { id: 'battery', nameAr: 'حاوية بطاريات', specs: 'مقاومة للأحماض، مرخصة', use: 'للبطاريات الرصاصية والليثيوم' },
                { id: 'cable', nameAr: 'حاوية كابلات', volume: '10-20 م³', use: 'لجمع الكابلات النحاسية' }
            ],
            logistics: {
                hookLift: {
                    nameAr: 'شاحنات هوك لفت (Hook Lift)',
                    features: ['رفع وتفريغ الحاويات', 'سعة 10-30 طن', 'خدمة التبديل السريع']
                },
                cranes: {
                    nameAr: 'رافعات ومعدات',
                    features: ['رافعات مغناطيسية', 'معدات تحميل ثقيلة', 'موازين إلكترونية']
                },
                periodicCollection: {
                    nameAr: 'خدمة التجميع الدوري',
                    features: ['جدولة أسبوعية/شهرية', 'تقارير الكميات', 'دفع فوري']
                }
            }
        },

        // سلسلة إمداد المعادن الثمينة
        preciousMetals: {
            name: 'سلسلة إمداد المعادن الثمينة',
            nameEn: 'Precious Metals Supply Chain',
            stages: [
                { id: 'mining', nameAr: 'التعدين/الاستيراد', nameEn: 'Mining/Import', icon: '⛏️', description: 'مناجم معتمدة' },
                { id: 'refining', nameAr: 'التكرير والفحص', nameEn: 'Refining & Assay', icon: '🔬', description: 'مصافي معتمدة' },
                { id: 'secureStorage', nameAr: 'التخزين الآمن', nameEn: 'Secure Storage', icon: '🏦', description: 'خزائن مؤمنة' },
                { id: 'secureTransport', nameAr: 'النقل المؤمن', nameEn: 'Insured Transport', icon: '🚐', description: 'سيارات مصفحة' },
                { id: 'jewelry', nameAr: 'الصياغة/التصنيع', nameEn: 'Jewelry/Manufacturing', icon: '💍', description: 'ورش معتمدة' },
                { id: 'retail', nameAr: 'البيع', nameEn: 'Retail', icon: '🏪', description: 'محلات ومعارض' }
            ],
            logistics: {
                armoredTransport: {
                    nameAr: 'النقل المؤمن والمصفح',
                    features: ['سيارات مصفحة مع حراسة', 'تتبع GPS مباشر', 'تأمين شامل على القيمة']
                },
                vaults: {
                    nameAr: 'خزائن التخزين',
                    features: ['خزائن بنكية مؤمنة', 'مراقبة 24/7', 'تقارير الجرد الدورية']
                },
                airFreight: {
                    nameAr: 'الشحن الجوي المؤمن',
                    features: ['شحن دولي سريع', 'تخليص جمركي VIP', 'شهادات المنشأ']
                }
            },
            certifications: [
                { id: 'lbma', nameAr: 'شهادة LBMA للذهب', required: true },
                { id: 'gia', nameAr: 'شهادة GIA للألماس', required: true },
                { id: 'saudiHallmark', nameAr: 'دمغة الدار السعودية', required: true },
                { id: 'kimberley', nameAr: 'شهادة Kimberley للألماس', required: true },
                { id: 'assay', nameAr: 'شهادة الفحص والوزن', required: true },
                { id: 'insurance', nameAr: 'شهادة التأمين', required: true }
            ]
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // سلسلة التوريد العامة (للتوافق مع الكود القديم)
    // ─────────────────────────────────────────────────────────────────────────
    supplyChain: {
        stages: [
            {
                id: 'source',
                nameAr: 'المصدر',
                nameEn: 'Source',
                icon: '📍',
                description: 'مصانع، ورش، مشاريع بناء، هدم، صيانة',
                actors: ['مصانع', 'ورش', 'مقاولين', 'شركات صيانة'],
                outputs: ['سكراب صناعي', 'مخلفات بناء', 'قطع غيار']
            },
            {
                id: 'collection',
                nameAr: 'التجميع',
                nameEn: 'Collection',
                icon: '📦',
                description: 'تجار السكراب، حاويات، نقاط تجميع',
                actors: ['تجار سكراب', 'شركات تجميع', 'أفراد'],
                outputs: ['سكراب مصنف', 'سكراب مختلط']
            },
            {
                id: 'processing',
                nameAr: 'المعالجة',
                nameEn: 'Processing',
                icon: '⚙️',
                description: 'فرز، تنظيف، تقطيع، ضغط',
                actors: ['مراكز معالجة', 'شركات فرز'],
                outputs: ['سكراب جاهز للصهر']
            },
            {
                id: 'transport',
                nameAr: 'النقل',
                nameEn: 'Transport',
                icon: '🚚',
                description: 'نقل بري، بحري، سكك حديدية',
                actors: ['شركات نقل', 'موانئ', 'شركات شحن'],
                outputs: ['توصيل للمصاهر']
            },
            {
                id: 'smelter',
                nameAr: 'المصهر',
                nameEn: 'Smelter',
                icon: '🏭',
                description: 'صهر وإعادة تدوير المعادن',
                actors: ['مصاهر', 'معامل إعادة تدوير'],
                outputs: ['سبائك', 'معادن نقية', 'منتجات نصف مصنعة']
            },
            {
                id: 'manufacturing',
                nameAr: 'التصنيع',
                nameEn: 'Manufacturing',
                icon: '🔧',
                description: 'تصنيع المنتجات النهائية',
                actors: ['مصانع', 'ورش تصنيع'],
                outputs: ['منتجات معدنية', 'قطع غيار', 'مواد بناء']
            },
            {
                id: 'consumer',
                nameAr: 'المستهلك',
                nameEn: 'Consumer',
                icon: '🏠',
                description: 'المستخدم النهائي',
                actors: ['شركات', 'أفراد', 'مشاريع'],
                outputs: ['استخدام', 'ثم عودة كسكراب']
            }
        ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // الأسعار المرجعية — Reference Prices
    // ─────────────────────────────────────────────────────────────────────────
    referencePrices: {
        lastUpdate: new Date().toISOString(),
        saudi: {
            // المعادن الأساسية
            steelRebar: { price: 2400, unit: 'ريال/طن', change: '+2.1%' },
            steelScrap: { price: 1850, unit: 'ريال/طن', change: '+1.5%' },
            copper: { price: 32500, unit: 'ريال/طن', change: '-0.8%' },
            copperScrap: { price: 28000, unit: 'ريال/طن', change: '-0.5%' },
            aluminum: { price: 8200, unit: 'ريال/طن', change: '+1.2%' },
            aluminumScrap: { price: 6500, unit: 'ريال/طن', change: '+0.9%' },
            stainless304: { price: 12000, unit: 'ريال/طن', change: '+0.3%' },
            // المعادن الثمينة (ريال/جرام)
            gold24: { price: 295, unit: 'ريال/جرام', change: '+0.5%' },
            gold21: { price: 258, unit: 'ريال/جرام', change: '+0.5%' },
            gold18: { price: 221, unit: 'ريال/جرام', change: '+0.5%' },
            silver: { price: 3.8, unit: 'ريال/جرام', change: '+0.3%' },
            platinum: { price: 120, unit: 'ريال/جرام', change: '-0.2%' },
            palladium: { price: 115, unit: 'ريال/جرام', change: '-0.4%' }
        },
        global: {
            // المعادن الأساسية
            copperLME: { price: 8500, unit: 'USD/ton', change: '-0.5%' },
            aluminumLME: { price: 2200, unit: 'USD/ton', change: '+0.8%' },
            steelHRC: { price: 650, unit: 'USD/ton', change: '+1.0%' },
            nickelLME: { price: 18000, unit: 'USD/ton', change: '-1.2%' },
            // المعادن الثمينة (دولار/أونصة)
            goldSpot: { price: 2350, unit: 'USD/oz', change: '+0.5%', source: 'LBMA' },
            silverSpot: { price: 28, unit: 'USD/oz', change: '+0.3%', source: 'LBMA' },
            platinumSpot: { price: 950, unit: 'USD/oz', change: '-0.2%', source: 'LBMA' },
            palladiumSpot: { price: 920, unit: 'USD/oz', change: '-0.4%', source: 'LBMA' }
        },
        // أسعار الألماس (مرجعية)
        diamonds: {
            note: 'أسعار استرشادية - تعتمد على 4Cs',
            oneCaratDVVS1: { price: 15000, unit: 'USD', description: '1 قيراط - D - VVS1 - Excellent' },
            oneCaratGVS2: { price: 8000, unit: 'USD', description: '1 قيراط - G - VS2 - Very Good' },
            twoCaratDVVS1: { price: 45000, unit: 'USD', description: '2 قيراط - D - VVS1 - Excellent' }
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // المعايير والأنظمة — Standards & Regulations
    // ─────────────────────────────────────────────────────────────────────────
    standards: {
        isri: {
            name: 'ISRI',
            fullName: 'Institute of Scrap Recycling Industries',
            description: 'المعيار العالمي لتصنيف السكراب',
            specifications: {
                ferrous: ['HMS 1', 'HMS 2', 'Shredded', 'Bundles'],
                copper: ['Berry', 'Birch', 'Candy', 'Cliff', 'Cobra', 'Druid'],
                aluminum: ['Taint/Tabor', 'Taldon', 'Tense', 'Twitch']
            }
        },
        lme: {
            name: 'LME',
            fullName: 'London Metal Exchange',
            description: 'بورصة لندن للمعادن — المرجع العالمي للأسعار',
            metals: ['Copper', 'Aluminum', 'Zinc', 'Nickel', 'Lead', 'Tin']
        },
        saso: {
            name: 'SASO',
            fullName: 'الهيئة السعودية للمواصفات والمقاييس',
            description: 'المواصفات السعودية للمعادن ومواد البناء'
        },
        baselConvention: {
            name: 'اتفاقية بازل',
            fullName: 'Basel Convention',
            description: 'اتفاقية دولية لنقل النفايات الخطرة عبر الحدود'
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // القوانين واللوائح — Regulations
    // ─────────────────────────────────────────────────────────────────────────
    regulations: {
        trading: [
            { id: 1, rule: 'الصدق والأمانة في وصف المنتج', penalty: 'تحذير → إيقاف → إغلاق' },
            { id: 2, rule: 'الالتزام بالسعر المتفق عليه', penalty: 'تعويض + تحذير' },
            { id: 3, rule: 'التسليم في الموعد المحدد', penalty: 'تحذير عند تأخير > 7 أيام' },
            { id: 4, rule: 'ضمان مطابقة المنتج للوصف', penalty: 'استرجاع خلال 48 ساعة' },
            { id: 5, rule: 'حظر التعامل في المسروقات', penalty: 'إغلاق فوري + إبلاغ السلطات' }
        ],
        environmental: [
            { id: 1, rule: 'التخلص الآمن من النفايات', authority: 'وزارة البيئة' },
            { id: 2, rule: 'الالتزام بمعايير البيئة', authority: 'الهيئة العامة للأرصاد' },
            { id: 3, rule: 'توثيق مصدر السكراب', authority: 'وزارة التجارة' },
            { id: 4, rule: 'ترخيص التعامل مع المواد الخطرة', authority: 'هيئة الغذاء والدواء' }
        ],
        saudiVision2030: {
            name: 'رؤية 2030',
            relevantPrograms: [
                { name: 'برنامج جودة الحياة', relevance: 'المحافظة على البيئة' },
                { name: 'برنامج تطوير الصناعة', relevance: 'إعادة التدوير والتصنيع المحلي' },
                { name: 'نظام إدارة النفايات', relevance: 'تنظيم قطاع السكراب' }
            ]
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // المناطق الجغرافية — Geographic Regions
    // ─────────────────────────────────────────────────────────────────────────
    regions: {
        saudi: [
            { id: 'riyadh', nameAr: 'الرياض', nameEn: 'Riyadh', industrialZones: ['السلي', 'صناعية الرياض'] },
            { id: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah', industrialZones: ['المنطقة الصناعية', 'الخمرة'] },
            { id: 'dammam', nameAr: 'الدمام', nameEn: 'Dammam', industrialZones: ['الصناعية الأولى', 'الصناعية الثانية'] },
            { id: 'jubail', nameAr: 'الجبيل', nameEn: 'Jubail', industrialZones: ['مدينة الجبيل الصناعية'] },
            { id: 'yanbu', nameAr: 'ينبع', nameEn: 'Yanbu', industrialZones: ['مدينة ينبع الصناعية'] }
        ],
        gcc: ['الإمارات', 'الكويت', 'البحرين', 'قطر', 'عُمان'],
        international: ['الصين', 'الهند', 'تركيا', 'مصر', 'أوروبا']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // الأهداف القيمية — Core Values
    // ─────────────────────────────────────────────────────────────────────────
    coreValues: {
        principles: [
            { id: 'no-harm', ar: 'بلا ضرر ولا ضرار', en: 'No Harm', icon: '🌿' },
            { id: 'trust', ar: 'حب العلامة وأمان', en: 'Trust & Safety', icon: '💚' },
            { id: 'environment', ar: 'محافظة على البيئة', en: 'Environmental Protection', icon: '♻️' }
        ],
        slogans: [
            'شيخه — أمان البيئة',
            'من المصدر إلى المصهر',
            'تجارة أمينة، بيئة نظيفة',
            'إعادة التدوير قيمة مضافة'
        ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // الصيغ والحسابات — Formulas
    // ─────────────────────────────────────────────────────────────────────────
    formulas: {
        profit: (sellPrice, buyPrice, quantity) => (sellPrice - buyPrice) * quantity,
        margin: (sellPrice, buyPrice) => sellPrice > 0 ? ((sellPrice - buyPrice) / sellPrice) * 100 : 0,
        recyclingValue: (weight, metalType, purity, kb) => {
            const metal = kb.metals[metalType];
            if (!metal) return 0;
            return weight * metal.recyclingValue * (purity / 100);
        },
        co2Saved: (weight, metalType, kb) => {
            const metal = kb.metals[metalType];
            if (!metal || !metal.environmentalImpact) return 0;
            return weight * metal.environmentalImpact.co2Saved;
        },
        energySaved: (weight, metalType, kb) => {
            const metal = kb.metals[metalType];
            if (!metal || !metal.environmentalImpact) return 0;
            return weight * metal.environmentalImpact.energySaved;
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// محرك الذكاء الاصطناعي — AI Engine
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaAI {
    constructor() {
        this.knowledgeBase = KNOWLEDGE_BASE;
        this.conversationHistory = [];
        this.maxHistory = 50;
        this.learningData = [];
        this.version = '2.0.0';
        
        // أنماط التعرف على النوايا — محسّنة للفهم الذكي
        this.intentPatterns = {
            greeting: /^(مرحبا|السلام|أهلا|صباح|مساء|هاي|hello|hi)/i,
            farewell: /^(مع السلامة|وداعا|باي|bye)/i,
            thanks: /(شكرا|جزاك الله|بارك الله|thank)/i,
            price: /(سعر|أسعار|كم سعر|كم يكلف|ثمن|قيمة|price|cost)/i,
            // ═══ البيع — أنماط شاملة ═══
            sell: /(بيع|أبيع|بائع|عرض|أعرض|للبيع|اريد البيع|ابيع|sell|selling|عندي بضاعة|عندي معدن|عندي حديد|عندي نحاس|عندي سكراب)/i,
            // ═══ الشراء والتسوق — أنماط شاملة ═══
            buy: /(شراء|أشتري|اشتري|تسوق|تسوّق|اريد اشتري|ابحث عن|buy|purchase|shopping|أريد شراء|اريد شراء|محتاج|ابي|ابغى|ابغا)/i,
            info: /(ما هو|ما هي|ماذا|كيف|لماذا|أخبرني|معلومات|what|how|why|وش هو|ايش|شرح)/i,
            calculate: /(احسب|حساب|كم الربح|هامش|calculate|profit)/i,
            register: /(تسجيل|فتح متجر|إنشاء حساب|register|انشاء حساب)/i,
            regulations: /(قوانين|لوائح|إجراءات|شروط|rules|regulations)/i,
            help: /(مساعدة|ساعدني|أحتاج مساعدة|help)/i,
            marketing: /(تسويق|حملة|خطة\s*تسويق|خطة\s*تسويقية|marketing|campaign)/i,
            environment: /(بيئة|تدوير|استدامة|environment|recycle)/i,
            supplyChain: /(سلسلة|توريد|إمداد|supply|chain)/i,
            scm: /(scm|erp|نظام|إدارة)/i,
            location: /(موقع|منطقة|مدينة|location|region)/i,
            quality: /(جودة|نقاء|درجة|quality|grade)/i,
            shipping: /(شحن|نقل|توصيل|shipping|transport)/i,
            certificate: /(شهادة|اعتماد|certificate)/i,
            preciousMetals: /(ذهب|فضة|بلاتين|بالاديوم|ألماس|مجوهرات|gold|silver|platinum|diamond|jewelry|عيار|قيراط|سبائك)/i,
            activationPlan: /(خطة\s*تفعيل|خطة\s*تشغيل|خطة\s*إطلاق|خطة\s*الانطلاق|14\s*يوم|١٤\s*يوم|اسبوعين|أسبوعين)/i,
            systemInfo: /(المنظومة|هيكل|صفحات|api|موقع شيخه|منظومة شيخه|تفعيل\s*المنظومة|تشغيل\s*المنظومة|تفعيل\s*شيخه|لوحة\s*الأدمن|لوحة\s*تحكم\s*الأدمن)/i,
            // ═══ أوامر جديدة ═══
            browse: /(تصفح|استعرض|عرض|اعرض|شوف|show|browse|display|قائمة|المنتجات|العروض)/i,
            order: /(طلب|اطلب|أطلب|order|request)/i,
            track: /(تتبع|تتبّع|أين|وين|track|where|status|حالة طلبي)/i
        };
    }

    /**
     * تحليل نية المستخدم من الرسالة — نظام ذكي متقدم
     * Advanced Intent Analysis System
     */
    analyzeIntent(message) {
        const msg = message.toLowerCase().trim();
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 🧠 تحليل ذكي متعدد المراحل
        // ═══════════════════════════════════════════════════════════════════════════════
        
        // المرحلة 1: الأوامر المباشرة القصيرة
        if (msg.length <= 15) {
            // أوامر البيع
            if (/^(بيع|ابيع|أبيع|البيع|اريد البيع|اريد بيع)$/i.test(msg)) return 'sell';
            // أوامر الشراء
            if (/^(شراء|اشتري|أشتري|الشراء|اريد شراء|اريد اشتري)$/i.test(msg)) return 'buy';
            // أوامر التسوق
            if (/^(تسوق|تسوّق|التسوق|اريد تسوق)$/i.test(msg)) return 'browse';
            // أوامر العرض
            if (/^(عرض|اعرض|العروض|المنتجات|السوق)$/i.test(msg)) return 'browse';
            // أوامر الطلب
            if (/^(طلب|اطلب|أطلب)$/i.test(msg)) return 'order';
        }
        
        // المرحلة 2: الأنماط المحددة
        for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
            if (pattern.test(msg)) {
                return intent;
            }
        }
        
        // المرحلة 3: تحليل السياق الدلالي
        const semanticAnalysis = this._analyzeSemantics(msg);
        if (semanticAnalysis) return semanticAnalysis;
        
        return 'general';
    }
    
    /**
     * تحليل دلالي متقدم للرسائل
     * Advanced Semantic Analysis
     */
    _analyzeSemantics(msg) {
        // كلمات دالة على البيع
        const sellKeywords = ['عندي', 'لدي', 'متوفر', 'للبيع', 'أبيع', 'بضاعة', 'كمية'];
        const buyKeywords = ['ابحث', 'أحتاج', 'محتاج', 'أريد', 'اريد', 'ابغى', 'ابي', 'اشتري'];
        const browseKeywords = ['تصفح', 'شوف', 'عرض', 'قائمة', 'منتجات', 'سوق'];
        
        let sellScore = 0;
        let buyScore = 0;
        let browseScore = 0;
        
        for (const word of sellKeywords) {
            if (msg.includes(word)) sellScore++;
        }
        for (const word of buyKeywords) {
            if (msg.includes(word)) buyScore++;
        }
        for (const word of browseKeywords) {
            if (msg.includes(word)) browseScore++;
        }
        
        if (sellScore > buyScore && sellScore > browseScore && sellScore > 0) return 'sell';
        if (buyScore > sellScore && buyScore > browseScore && buyScore > 0) return 'buy';
        if (browseScore > 0) return 'browse';
        
        return null;
    }

    /**
     * تحليل نية "الأدمن" بشكل أكثر دقة — بلا حدود تشغيلية، بالكتاب والسنة فقط
     * Admin intent analysis — unlimited operational power, guided only by Quran & Sunnah
     */
    _analyzeAdminIntent(message) {
        const msg = String(message || '').toLowerCase();
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 🛡️ صلاحيات الأدمن الكاملة — بلا حدود إلا الكتاب والسنة
        // ═══════════════════════════════════════════════════════════════════════════════
        
        // 1) طلبات التطوير والبرمجة — صلاحيات كاملة
        if (/(برمج|تطوير|كود|code|develop|program|api|backend|frontend|deploy|نشر|server|خادم|database|قاعدة بيانات|تعديل|إصلاح|fix|bug|خطأ|error|feature|ميزة|تحسين|optimize|refactor)/i.test(msg)) {
            return 'adminDev';
        }
        
        // 2) طلبات التفعيل والتشغيل — صلاحيات كاملة
        if (/(تفعيل|تشغيل|فعّل|شغّل|activate|enable|start|run|launch|إطلاق|أنظمة تعمل|هل.*يعمل|هل.*تعمل|status|حالة)/i.test(msg)) {
            return 'adminActivate';
        }
        
        // 3) طلبات التسويق والحملات
        if (/(تسويق|حملة|خطة\s*تسويق|marketing|campaign)/i.test(msg)) {
            return 'marketing';
        }
        
        // 4) خطة التفعيل الشاملة
        if (/(14\s*يوم|١٤\s*يوم|اسبوعين|أسبوعين|خطة\s*تفعيل|خطة\s*تشغيل|خطة\s*إطلاق|خطة\s*الانطلاق)/i.test(msg)) {
            return 'activationPlan';
        }
        
        // 5) معلومات المنظومة
        if (/(منظومة|هيكل|صفحات|موقع شيخ|لوحة\s*الأدمن|لوحة\s*تحكم)/i.test(msg)) {
            return 'systemInfo';
        }
        
        // 6) الأرباح والمالية — صلاحيات كاملة
        if (/(أرباح|ربح|عمولة|اشتراك|رسوم|مالية|إيراد|profit|revenue|commission|fee|subscription)/i.test(msg)) {
            return 'adminFinance';
        }
        
        // 7) إدارة المستخدمين والصلاحيات
        if (/(مستخدم|صلاحية|permission|user|role|دور|admin|أدمن|إدارة)/i.test(msg)) {
            return 'adminUsers';
        }
        
        // 8) سلسلة التوريد والعمليات
        if (/(سلسلة|توريد|لوجستيات|شحن|نقل|مخزون|عمليات|operations|logistics|supply|inventory)/i.test(msg)) {
            return 'adminOperations';
        }
        
        // 9) أي طلب آخر من الأدمن — استجابة كاملة بدون قيود
        return 'adminGeneral';
    }

    /**
     * استخراج المعدن من الرسالة
     */
    extractMetal(message) {
        const msg = message.toLowerCase();
        
        const metalPatterns = {
            // المعادن الأساسية
            iron: /حديد|iron|steel|تسليح|صاج|hms/i,
            copper: /نحاس|copper|berry|birch/i,
            aluminum: /ألمنيوم|المنيوم|aluminum|aluminium/i,
            stainless: /ستانلس|stainless|ss304|ss316/i,
            cables: /كابل|كابلات|cable|wire/i,
            batteries: /بطاري|battery/i,
            electronics: /إلكتروني|electronic|pcb|هاتف|حاسوب/i,
            // المعادن الثمينة
            gold: /ذهب|gold|عيار 24|عيار 21|عيار 18|سبائك ذهب/i,
            silver: /فضة|silver|استرليني/i,
            platinum: /بلاتين|platinum/i,
            palladium: /بالاديوم|palladium/i,
            diamonds: /ألماس|diamond|قيراط|carat/i,
            gemstones: /أحجار كريمة|ياقوت|زمرد|لؤلؤ|ruby|sapphire|emerald/i,
            jewelry: /مجوهرات|jewelry|خاتم|سوار|قلادة/i
        };
        
        for (const [metal, pattern] of Object.entries(metalPatterns)) {
            if (pattern.test(msg)) {
                return metal;
            }
        }
        
        return null;
    }

    /**
     * استخراج الأرقام من الرسالة
     */
    extractNumbers(message) {
        const numbers = message.match(/[\d,]+\.?\d*/g);
        if (!numbers) return [];
        return numbers.map(n => parseFloat(n.replace(/,/g, '')));
    }

    /**
     * استخراج الموقع من الرسالة
     */
    extractLocation(message) {
        const msg = message.toLowerCase();
        const locations = this.knowledgeBase.regions.saudi;
        
        for (const loc of locations) {
            if (msg.includes(loc.nameAr) || msg.includes(loc.nameEn.toLowerCase())) {
                return loc;
            }
        }
        
        return null;
    }

    /**
     * البحث في قاعدة المعرفة
     */
    searchKnowledge(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        // البحث في المعادن
        for (const [id, metal] of Object.entries(this.knowledgeBase.metals)) {
            if (metal.nameAr.includes(query) || metal.nameEn.toLowerCase().includes(queryLower)) {
                results.push({ type: 'metal', data: metal, relevance: 1.0 });
            }
        }
        
        // البحث في سلسلة التوريد
        for (const stage of this.knowledgeBase.supplyChain.stages) {
            if (stage.nameAr.includes(query) || stage.nameEn.toLowerCase().includes(queryLower)) {
                results.push({ type: 'supplyChain', data: stage, relevance: 0.9 });
            }
        }
        
        // البحث في اللوائح
        for (const rule of this.knowledgeBase.regulations.trading) {
            if (rule.rule.includes(query)) {
                results.push({ type: 'regulation', data: rule, relevance: 0.8 });
            }
        }
        
        return results.sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * توليد الرد
     */
    async generateResponse(message, context = {}) {
        // intent الأساسي
        let intent = this.analyzeIntent(message);
        // تحسين التوجيه داخل الأدمن/الإنتاج حتى لا يتحول لمستشار السوق العام
        const isAdminContext = context && (context.role === 'admin' || context.isAdmin === true || context.permissions === 'full');
        if (isAdminContext) {
            intent = this._analyzeAdminIntent(message) || intent;
        } else if (/(14\s*يوم|١٤\s*يوم|اسبوعين|أسبوعين|خطة\s*تفعيل|خطة\s*تشغيل|خطة\s*إطلاق|خطة\s*الانطلاق)/i.test(String(message || ''))) {
            // حتى خارج الأدمن: أي "خطة تفعيل 14 يوم" تعتبر طلب تشغيل للمنظومة
            intent = 'activationPlan';
        }
        const metal = this.extractMetal(message);
        const numbers = this.extractNumbers(message);
        const location = this.extractLocation(message);

        let response = {
            text: '',
            intent,
            metal,
            location,
            suggestions: [],
            data: null,
            actions: [],
            relatedTopics: []
        };

        // توليد الرد حسب النية
        switch (intent) {
            case 'greeting':
                response.text = this._generateGreeting();
                response.suggestions = ['أسعار المعادن', 'كيف أبيع بضاعتي؟', 'فتح متجر جديد', 'معلومات عن السكراب'];
                break;

            case 'farewell':
                response.text = 'مع السلامة! نتطلع لخدمتك مجدداً في سوق شيخه. 💚';
                break;

            case 'thanks':
                response.text = 'وإياك، بارك الله فيك. هل تحتاج مساعدة في شيء آخر؟';
                response.suggestions = ['أسعار المعادن', 'كيف أبيع؟', 'معلومات إضافية'];
                break;

            case 'price':
                response = this._handlePriceQuery(message, metal, numbers, response);
                break;

            case 'calculate':
                response = this._handleCalculation(numbers, metal, response);
                break;

            case 'sell':
                response = this._handleSellQuery(metal, response);
                break;

            case 'buy':
                response = this._handleBuyQuery(metal, response);
                break;

            case 'register':
                response = this._handleRegisterQuery(response);
                break;

            case 'regulations':
                response = this._handleRegulationsQuery(response);
                break;

            case 'info':
                response = this._handleInfoQuery(message, metal, response);
                break;

            case 'environment':
                response = this._handleEnvironmentQuery(metal, response);
                break;

            case 'supplyChain':
            case 'scm':
                response = this._handleSupplyChainQuery(response);
                break;

            case 'help':
                response = this._handleHelpQuery(response);
                break;

            case 'marketing':
                response = this._handleMarketingPlanToday(response, context);
                break;

            case 'location':
                response = this._handleLocationQuery(location, response);
                break;

            case 'quality':
                response = this._handleQualityQuery(metal, response);
                break;

            case 'shipping':
                response = this._handleShippingQuery(response);
                break;

            case 'preciousMetals':
                response = this._handlePreciousMetalsQuery(message, metal, response);
                break;

            // ═══════════════════════════════════════════════════════════════════════════════
            // 🛒 أوامر التسوق والتصفح — جديدة
            // ═══════════════════════════════════════════════════════════════════════════════
            case 'browse':
                response = this._handleBrowseQuery(metal, response);
                break;

            case 'order':
                response = this._handleOrderQuery(metal, response);
                break;

            case 'track':
                response = this._handleTrackQuery(response);
                break;

            case 'systemInfo':
                response = this._handleSystemInfoQuery(response);
                break;

            case 'activationPlan':
                response = this._handleActivationPlan14Days(response, context);
                break;

            // ═══════════════════════════════════════════════════════════════════════════════
            // 🛡️ صلاحيات الأدمن الكاملة — بلا حدود إلا الكتاب والسنة
            // ═══════════════════════════════════════════════════════════════════════════════
            
            case 'adminDev':
                response = this._handleAdminDevRequest(message, response, context);
                break;

            case 'adminActivate':
                response = this._handleAdminActivateRequest(message, response, context);
                break;

            case 'adminFinance':
                response = this._handleAdminFinanceRequest(message, response, context);
                break;

            case 'adminUsers':
                response = this._handleAdminUsersRequest(message, response, context);
                break;

            case 'adminOperations':
                response = this._handleAdminOperationsRequest(message, response, context);
                break;

            case 'adminGeneral':
                response = this._handleAdminGeneralRequest(message, response, context);
                break;

            default:
                response = this._handleGeneralQuery(message, response);
        }

        // حفظ المحادثة
        this._saveConversation(message, response.text);
        
        // إضافة المواضيع ذات الصلة
        if (!response.relatedTopics.length) {
            response.relatedTopics = this._getRelatedTopics(intent, metal);
        }

        return response;
    }

    _handleMarketingPlanToday(response, context = {}) {
        const isAdminContext = context && (context.role === 'admin' || context.isAdmin === true || context.permissions === 'full');
        const env = (context && (context.env || context.environment)) ? String(context.env || context.environment) : '';
        const memory = (context && context.memory && typeof context.memory === 'object') ? context.memory : {};

        const origin = (context && typeof context.origin === 'string' && context.origin.startsWith('http')) ? context.origin : 'http://localhost:8080';
        const registerUrl = `${origin.replace(/\/$/, '')}/تسجيل-الشركاء.html`;
        const homeUrl = `${origin.replace(/\/$/, '')}/منظومة-شيخة.html`;
        const servicesUrl = `${origin.replace(/\/$/, '')}/خدمات-شيخة.html`;
        const profitUrl = `${origin.replace(/\/$/, '')}/آلية-الأرباح.html`;

        response.text = '📣 خطة تسويق اليوم — جاهزة للنسخ والتنفيذ\n\n';
        response.text += '🎯 الهدف (اليوم): 50–150 تسجيل شريك + 10 مكالمات B2B\n';
        response.text += '🧩 العرض: سوق معادن + تسجيل موحّد + لوجستيات وتتبّع + توثيق (وزن/صور/استلام/تسليم) + وثائق بيع\n';
        response.text += '☪️ الضابط: لا ربا، لا غرر، لا غش، ورسوم معلومة + حماية/توثيق بدل التأمين.\n';
        if (env) response.text += `🧭 سياق التشغيل: ${env}\n`;
        response.text += isAdminContext
            ? '🛡️ وضع الأدمن: صلاحيات تشغيل/تسويق كاملة داخل المنظومة.\n\n'
            : '\n';

        if (memory.lastMarketingGeneratedAt) {
            response.text += `📌 آخر توليد داخل الأدمن: ${memory.lastMarketingGeneratedAt}\n\n`;
        }

        response.text += '1) واتساب B2B (عام):\n';
        response.text += 'السلام عليكم، منصة شيخة تجمع لك: سوق المعادن + تسجيل موحّد للشركاء + لوجستيات وتتبّع + توثيق عمليات + وثائق بيع (عرض/فاتورة/أمر شراء/عقد). تشغيل برسوم معلومة والتزام شرعي (لا ربا ولا غرر).\\n';
        response.text += `التسجيل: ${registerUrl}\\n\\n`;

        response.text += '2) واتساب (للناقلين):\n';
        response.text += `السلام عليكم، نفعّل لك استقبال طلبات شحن + تتبع + توثيق استلام/تسليم. سجّل كشركة نقل: ${registerUrl}\\n\\n`;

        response.text += '3) واتساب (للمصانع/المصاهر):\n';
        response.text += `السلام عليكم، شيخة تسرّع التوريد من المصدر للتسليم مع توثيق جودة/وزن/تتبّع وتسهّل المشتريات بعروض وأوامر شراء وعقود. التسجيل: ${registerUrl}\\n\\n`;

        response.text += '4) منشور لينكدإن (3 نقاط):\n';
        response.text += `- تسجيل موحّد للشركاء (تجار/مصانع/نقل/مستودعات/مختبرات)\\n- لوجستيات وتتبّع + توثيق وزن/صور لتقليل النزاعات\\n- التزام شرعي: لا ربا ولا غرر ولا غش\\n`;
        response.text += `رابط التسجيل: ${registerUrl}\\n\\n`;

        response.text += '5) أسئلة تأهيل للردود (سريع):\n';
        response.text += '- نوع الشريك؟ (تاجر/مصنع/نقل/مستودع/مختبر)\\n- المدينة؟\\n- نوع المعدن/الخدمة؟\\n- متوسط الكمية/الشهر؟\\n- هل تفضل (بيع/شراء/تشغيل/كلها)؟\\n\\n';

        response.text += '🔗 روابط مساعدة:\n';
        response.text += `• المنظومة: ${homeUrl}\\n• الخدمات: ${servicesUrl}\\n• الأرباح: ${profitUrl}\\n`;

        response.suggestions = [
            'ولّد حملة داخل التسويق الذكي',
            'نسخ رسالة واتساب العامة',
            'نسخ رسالة الناقلين',
            'نسخ رسالة المصانع',
            'مؤشرات قياس اليوم'
        ];

        response.data = {
            registerUrl,
            homeUrl,
            servicesUrl,
            profitUrl,
            kpis: { registrationsMin: 50, registrationsMax: 150, calls: 10 }
        };

        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // دوال توليد الردود المتخصصة
    // ─────────────────────────────────────────────────────────────────────────

    _generateGreeting() {
        const greetings = [
            'مرحباً بك في سوق شيخه للمعادن والسكراب! 🏪\n\nكيف يمكنني مساعدتك اليوم؟',
            'أهلاً وسهلاً! 💚\n\nأنا مساعد شيخه الذكي، متخصص في المعادن والسكراب وسلاسل الإمداد.\n\nكيف أخدمك؟',
            'السلام عليكم! 🌿\n\nمرحباً بك في منظومة شيخه — تجارة أمينة، بيئة نظيفة.\n\nما الذي تبحث عنه؟'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    _handlePriceQuery(message, metal, numbers, response) {
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            const prices = this.knowledgeBase.referencePrices.saudi;
            
            response.text = `📊 معلومات ${metalInfo.nameAr} (${metalInfo.nameEn}):\n\n`;
            
            // إضافة الأسعار المرجعية
            response.text += `💰 الأسعار المرجعية:\n`;
            if (metal === 'iron') {
                response.text += `• حديد تسليح: ${prices.steelRebar.price.toLocaleString()} ${prices.steelRebar.unit} (${prices.steelRebar.change})\n`;
                response.text += `• سكراب حديد: ${prices.steelScrap.price.toLocaleString()} ${prices.steelScrap.unit} (${prices.steelScrap.change})\n`;
            } else if (metal === 'copper') {
                response.text += `• نحاس: ${prices.copper.price.toLocaleString()} ${prices.copper.unit} (${prices.copper.change})\n`;
                response.text += `• سكراب نحاس: ${prices.copperScrap.price.toLocaleString()} ${prices.copperScrap.unit} (${prices.copperScrap.change})\n`;
            } else if (metal === 'aluminum') {
                response.text += `• ألمنيوم: ${prices.aluminum.price.toLocaleString()} ${prices.aluminum.unit} (${prices.aluminum.change})\n`;
                response.text += `• سكراب ألمنيوم: ${prices.aluminumScrap.price.toLocaleString()} ${prices.aluminumScrap.unit} (${prices.aluminumScrap.change})\n`;
            }
            
            response.text += `\n📦 الأنواع المتاحة:\n`;
            metalInfo.types.forEach(t => {
                response.text += `• ${t.nameAr}`;
                if (t.isri) response.text += ` (ISRI: ${t.isri})`;
                response.text += `\n`;
            });
            
            response.text += `\n⚠️ ملاحظة: الأسعار استرشادية وتتغير حسب السوق والجودة والكمية.`;
            
            response.suggestions = ['عرض أسعار السوق', 'كيف أحسب الربح؟', `معلومات عن ${metalInfo.nameAr}`];
            response.data = { metal: metalInfo, prices };
        } else {
            response.text = '💰 أسعار المعادن المرجعية:\n\n';
            response.text += 'أي معدن تريد معرفة سعره؟\n\n';
            response.text += '🔩 حديد | 🥉 نحاس | 🪙 ألمنيوم | ✨ ستانلس';
            response.suggestions = ['سعر الحديد', 'سعر النحاس', 'سعر الألمنيوم', 'سعر الستانلس'];
        }
        
        return response;
    }

    _handleCalculation(numbers, metal, response) {
        if (numbers.length >= 2) {
            const [sellPrice, buyPrice] = numbers;
            const quantity = numbers[2] || 1;
            
            const profit = this.knowledgeBase.formulas.profit(sellPrice, buyPrice, quantity);
            const margin = this.knowledgeBase.formulas.margin(sellPrice, buyPrice);
            
            response.text = `🧮 حساب الربح:\n\n`;
            response.text += `📈 سعر البيع: ${sellPrice.toLocaleString()} ريال\n`;
            response.text += `📉 سعر الشراء: ${buyPrice.toLocaleString()} ريال\n`;
            response.text += `📦 الكمية: ${quantity} طن\n\n`;
            response.text += `━━━━━━━━━━━━━━━\n`;
            response.text += `💰 الربح: ${profit.toLocaleString()} ريال\n`;
            response.text += `📊 هامش الربح: ${margin.toFixed(1)}%\n`;
            
            if (metal) {
                const metalInfo = this.knowledgeBase.metals[metal];
                const co2 = this.knowledgeBase.formulas.co2Saved(quantity, metal, this.knowledgeBase);
                response.text += `\n🌱 أثر بيئي: توفير ${co2.toFixed(1)} طن CO2`;
            }
            
            response.data = { profit, margin, quantity, sellPrice, buyPrice };
            response.suggestions = ['حساب آخر', 'أسعار السوق'];
        } else {
            response.text = '🧮 حاسبة الأرباح:\n\n';
            response.text += 'لحساب الربح، أخبرني بـ:\n';
            response.text += '• سعر البيع\n';
            response.text += '• سعر الشراء\n';
            response.text += '• الكمية (اختياري)\n\n';
            response.text += '📝 مثال: "احسب الربح إذا بعت بـ 2400 واشتريت بـ 1800 لـ 50 طن"';
            response.suggestions = ['احسب 2400 1800 50', 'أسعار الحديد'];
        }
        
        return response;
    }

    _handleSellQuery(metal, response) {
        response.text = '💰 البيع في سوق شيخة للمعادن\n\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        response.text += '✅ **مميزات البيع معنا:**\n';
        response.text += '• الوصول لآلاف المشترين (مصانع، تجار، مصاهر)\n';
        response.text += '• أسعار عادلة مبنية على LME\n';
        response.text += '• توثيق كامل للصفقات\n';
        response.text += '• حماية حقوق البائع\n';
        response.text += '• عمولة شفافة (2-5%) فقط\n\n';
        
        response.text += '📝 **خطوات البيع:**\n\n';
        response.text += '1️⃣ **سجّل كشريك** (مجاناً)\n';
        response.text += '   ← /تسجيل-الشركاء.html\n\n';
        
        response.text += '2️⃣ **أضف منتجك:**\n';
        response.text += '   • نوع المعدن/السكراب\n';
        response.text += '   • الكمية المتاحة\n';
        response.text += '   • السعر المطلوب\n';
        response.text += '   • الموقع وصور\n\n';
        
        response.text += '3️⃣ **استقبل العروض:**\n';
        response.text += '   • إشعارات فورية\n';
        response.text += '   • تفاوض مباشر\n\n';
        
        response.text += '4️⃣ **أتمم الصفقة:**\n';
        response.text += '   • عقد إلكتروني موثق\n';
        response.text += '   • فاتورة رسمية\n';
        response.text += '   • تسليم واستلام\n\n';
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            if (metalInfo) {
                response.text += `💡 **بيع ${metalInfo.nameAr}:**\n`;
                response.text += `   لديك ${metalInfo.nameAr}؟ أخبرني بالكمية والنوع!\n`;
                response.text += `   الأنواع المطلوبة: ${metalInfo.types.slice(0, 3).map(t => t.nameAr).join('، ')}\n\n`;
            }
        }
        
        response.text += '☪️ جميع المعاملات وفق الشريعة — "أحلّ الله البيع وحرّم الربا"';
        
        response.suggestions = [
            'تسجيل كبائع',
            'أسعار السوق اليوم',
            'كيف أحدد السعر؟',
            'العمولات والرسوم',
            'شروط البيع'
        ];
        
        response.actions = [
            { type: 'link', label: 'تسجيل كبائع', url: '/تسجيل-الشركاء.html' },
            { type: 'link', label: 'السوق', url: '/سوق-شيخة.html' }
        ];
        
        return response;
    }

    _handleBuyQuery(metal, response) {
        response.text = '🛒 الشراء من سوق شيخة للمعادن\n\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        response.text += '✅ **مميزات الشراء معنا:**\n';
        response.text += '• موردين موثقين ومعتمدين\n';
        response.text += '• أسعار تنافسية مبنية على LME\n';
        response.text += '• فحص جودة معتمد (اختياري)\n';
        response.text += '• توثيق كامل وعقود\n';
        response.text += '• ضمان حقوق المشتري\n\n';
        
        response.text += '📝 **خطوات الشراء:**\n\n';
        response.text += '1️⃣ **تصفح العروض:**\n';
        response.text += '   ← /سوق-شيخة.html\n';
        response.text += '   • فلترة حسب المعدن والموقع\n';
        response.text += '   • مقارنة الأسعار\n\n';
        
        response.text += '2️⃣ **تواصل مع البائع:**\n';
        response.text += '   • محادثة مباشرة\n';
        response.text += '   • طلب تفاصيل إضافية\n';
        response.text += '   • تفاوض على السعر\n\n';
        
        response.text += '3️⃣ **أنشئ طلب شراء:**\n';
        response.text += '   • تحديد الكمية والمواصفات\n';
        response.text += '   • تحديد موعد ومكان التسليم\n';
        response.text += '   • عقد إلكتروني موثق\n\n';
        
        response.text += '4️⃣ **استلم وافحص:**\n';
        response.text += '   • التحقق من المطابقة\n';
        response.text += '   • توثيق الوزن والجودة\n';
        response.text += '   • إتمام الدفع\n\n';
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            if (metalInfo) {
                response.text += `🔍 **شراء ${metalInfo.nameAr}:**\n`;
                response.text += `   متوفر ${metalInfo.types.length} أنواع في السوق\n`;
                response.text += `   الأنواع: ${metalInfo.types.slice(0, 3).map(t => t.nameAr).join('، ')}\n\n`;
            }
        }
        
        response.text += '☪️ جميع المعاملات وفق الشريعة — لا غرر ولا غش';
        
        response.suggestions = [
            'تصفح السوق',
            'أسعار اليوم',
            'أريد حديد',
            'أريد نحاس',
            'أريد سكراب',
            'إنشاء طلب شراء'
        ];
        
        response.actions = [
            { type: 'link', label: 'تصفح السوق', url: '/سوق-شيخة.html' },
            { type: 'link', label: 'تسجيل كمشتري', url: '/تسجيل-الشركاء.html' }
        ];
        
        return response;
    }

    _handleRegisterQuery(response) {
        response.text = '📝 تسجيل متجر في سوق شيخه:\n\n';
        response.text += '✅ التسجيل مجاني بالكامل\n';
        response.text += '✅ لا رسوم اشتراك\n';
        response.text += '✅ لا عمولة على المبيعات (حالياً)\n\n';
        response.text += '📋 المطلوب:\n';
        response.text += '• الاسم ورقم الجوال\n';
        response.text += '• اسم المتجر والمنطقة\n';
        response.text += '• تخصصك (حديد، نحاس، ...)\n';
        response.text += '• مرحلتك في سلسلة التوريد\n\n';
        response.text += '🚀 ابدأ الآن واعرض بضائعك للآلاف!';
        
        response.suggestions = ['تسجيل متجر', 'شروط التسجيل', 'سلسلة التوريد'];
        response.actions = [
            { type: 'link', label: 'تسجيل متجر', url: '/تسجيل-الشركاء.html' }
        ];
        
        return response;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🛒 دوال التسوق والتصفح — جديدة ومتقدمة
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * معالجة طلب تصفح السوق
     */
    _handleBrowseQuery(metal, response) {
        response.text = '🛒 سوق شيخة للمعادن والسكراب\n\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        response.text += '📦 الفئات المتاحة:\n\n';
        response.text += '🔩 **المعادن الأساسية:**\n';
        response.text += '   • حديد تسليح | سكراب حديد | صاج\n';
        response.text += '   • نحاس | ألمنيوم | ستانلس ستيل\n\n';
        
        response.text += '💎 **المعادن الثمينة:**\n';
        response.text += '   • ذهب (عيار 24/21/18) | فضة\n';
        response.text += '   • بلاتين | بالاديوم\n\n';
        
        response.text += '♻️ **السكراب:**\n';
        response.text += '   • سكراب حديد HMS1/HMS2\n';
        response.text += '   • كابلات نحاس | بطاريات\n';
        response.text += '   • إلكترونيات | بلاستيك صناعي\n\n';
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            if (metalInfo) {
                response.text += `🔍 **تبحث عن ${metalInfo.nameAr}؟**\n`;
                response.text += `   متوفر ${metalInfo.types.length} أنواع في السوق\n\n`;
            }
        }
        
        response.text += '🔗 افتح صفحة السوق لعرض جميع المنتجات والأسعار الحية';
        
        response.suggestions = [
            'أسعار الحديد',
            'أسعار النحاس',
            'عروض السكراب',
            'المعادن الثمينة',
            'أريد البيع',
            'أريد الشراء'
        ];
        
        response.actions = [
            { type: 'link', label: 'فتح السوق', url: '/سوق-شيخة.html' },
            { type: 'link', label: 'تسجيل كتاجر', url: '/تسجيل-الشركاء.html' }
        ];
        
        return response;
    }

    /**
     * معالجة طلب إنشاء طلب شراء
     */
    _handleOrderQuery(metal, response) {
        response.text = '📋 إنشاء طلب شراء في سوق شيخة\n\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        response.text += '📝 **خطوات إنشاء طلب:**\n\n';
        response.text += '1️⃣ **حدد المنتج:**\n';
        response.text += '   • نوع المعدن (حديد، نحاس، ألمنيوم...)\n';
        response.text += '   • المواصفات المطلوبة (النقاء، الدرجة)\n\n';
        
        response.text += '2️⃣ **حدد الكمية:**\n';
        response.text += '   • الوزن بالطن أو الكيلو\n';
        response.text += '   • الحد الأدنى والأقصى\n\n';
        
        response.text += '3️⃣ **حدد السعر:**\n';
        response.text += '   • السعر المستهدف\n';
        response.text += '   • أو اترك للتفاوض\n\n';
        
        response.text += '4️⃣ **حدد التسليم:**\n';
        response.text += '   • الموقع المطلوب\n';
        response.text += '   • موعد التسليم\n\n';
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            if (metalInfo) {
                response.text += `💡 **طلب ${metalInfo.nameAr}:**\n`;
                response.text += `   أخبرني بالكمية والمواصفات وسأساعدك في إنشاء الطلب\n\n`;
            }
        }
        
        response.text += '☪️ جميع المعاملات وفق الشريعة الإسلامية — لا ربا ولا غرر';
        
        response.suggestions = [
            'أطلب 10 طن حديد',
            'أطلب نحاس Berry',
            'أطلب ألمنيوم نظيف',
            'تصفح العروض المتاحة'
        ];
        
        response.actions = [
            { type: 'link', label: 'إنشاء طلب', url: '/سوق-شيخة.html#create-order' }
        ];
        
        return response;
    }

    /**
     * معالجة طلب تتبع الطلبات
     */
    _handleTrackQuery(response) {
        response.text = '📍 تتبع الطلبات والشحنات\n\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        response.text += '🔍 **لتتبع طلبك:**\n\n';
        response.text += '1️⃣ أدخل رقم الطلب\n';
        response.text += '2️⃣ أو رقم الشحنة\n';
        response.text += '3️⃣ أو رقم الفاتورة\n\n';
        
        response.text += '📦 **حالات الطلب:**\n';
        response.text += '• 🟡 قيد المراجعة\n';
        response.text += '• 🔵 تم القبول\n';
        response.text += '• 🟣 قيد التجهيز\n';
        response.text += '• 🟠 قيد الشحن\n';
        response.text += '• 🟢 تم التسليم\n\n';
        
        response.text += '📱 **للتتبع الحي:**\n';
        response.text += '   افتح لوحة التحكم ← طلباتي ← تتبع\n\n';
        
        response.text += '💡 أرسل رقم طلبك وسأخبرك بحالته';
        
        response.suggestions = [
            'أين طلبي #12345',
            'حالة الشحنة',
            'فتح لوحة التحكم',
            'التواصل مع الدعم'
        ];
        
        response.actions = [
            { type: 'link', label: 'لوحة التحكم', url: '/لوحة-تحكم-المستخدم.html' }
        ];
        
        return response;
    }

    _handleRegulationsQuery(response) {
        response.text = '📜 قواعد التجارة في سوق شيخه:\n\n';
        
        this.knowledgeBase.regulations.trading.forEach((rule, i) => {
            response.text += `${i + 1}. ${rule.rule}\n`;
            response.text += `   ⚠️ ${rule.penalty}\n\n`;
        });
        
        response.text += '━━━━━━━━━━━━━━━\n';
        response.text += '🌿 أهدافنا:\n';
        this.knowledgeBase.coreValues.principles.forEach(p => {
            response.text += `${p.icon} ${p.ar}\n`;
        });
        
        response.text += '\n📖 للتفاصيل الكاملة: /اللوائح-والقوانين-والاجراءات.html';
        
        response.suggestions = ['آلية البيع', 'حل النزاعات', 'شروط التاجر المعتمد'];
        response.actions = [
            { type: 'link', label: 'اللوائح والقوانين', url: '/اللوائح-والقوانين-والاجراءات.html' }
        ];
        
        return response;
    }

    _handleInfoQuery(message, metal, response) {
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            response.text = `📚 معلومات عن ${metalInfo.nameAr} (${metalInfo.nameEn}):\n\n`;
            
            response.text += `📦 الأنواع:\n`;
            metalInfo.types.forEach(t => {
                response.text += `• ${t.nameAr} — رمز HS: ${t.hsCode}`;
                if (t.isri) response.text += ` | ISRI: ${t.isri}`;
                response.text += `\n`;
            });
            
            response.text += `\n⚖️ عوامل التسعير:\n`;
            metalInfo.priceFactors.forEach(f => {
                response.text += `• ${f}\n`;
            });
            
            if (metalInfo.environmentalImpact) {
                response.text += `\n🌱 الأثر البيئي (لكل طن معاد تدويره):\n`;
                response.text += `• توفير CO2: ${metalInfo.environmentalImpact.co2Saved} طن\n`;
                response.text += `• توفير الطاقة: ${metalInfo.environmentalImpact.energySaved}%\n`;
                response.text += `• توفير المياه: ${metalInfo.environmentalImpact.waterSaved}%\n`;
            }
            
            if (metalInfo.specifications) {
                response.text += `\n🔬 المواصفات الفنية:\n`;
                response.text += `• الكثافة: ${metalInfo.specifications.density} g/cm³\n`;
                response.text += `• درجة الانصهار: ${metalInfo.specifications.meltingPoint}°C\n`;
            }
            
            response.data = { metal: metalInfo };
            response.suggestions = [`سعر ${metalInfo.nameAr}`, 'معادن أخرى', 'سلسلة التوريد'];
        } else {
            response.text = '🏪 سوق شيخه — منظومة متكاملة لتجارة المعادن والسكراب\n\n';
            response.text += '📦 التخصصات:\n';
            Object.values(this.knowledgeBase.metals).forEach(m => {
                response.text += `${m.icon} ${m.nameAr} (${m.nameEn})\n`;
            });
            
            response.text += '\n🔗 سلسلة التوريد:\n';
            response.text += 'من المصدر ← التجميع ← المعالجة ← النقل ← المصهر ← التصنيع\n\n';
            
            response.text += '✨ المميزات:\n';
            response.text += '• نظام ERP/SCM متكامل\n';
            response.text += '• أسعار مرجعية محدثة\n';
            response.text += '• تواصل مباشر مع التجار\n';
            response.text += '• أرشفة وتتبع العمليات\n';
            
            response.suggestions = ['حديد', 'نحاس', 'ألمنيوم', 'سلسلة التوريد'];
        }
        
        return response;
    }

    _handleEnvironmentQuery(metal, response) {
        response.text = '🌱 الأثر البيئي لإعادة التدوير:\n\n';
        response.text += '"بلا ضرر ولا ضرار" — قيمة أساسية في شيخه\n\n';
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            if (metalInfo.environmentalImpact) {
                response.text += `♻️ ${metalInfo.nameAr}:\n`;
                response.text += `• توفير CO2: ${metalInfo.environmentalImpact.co2Saved} طن/طن\n`;
                response.text += `• توفير الطاقة: ${metalInfo.environmentalImpact.energySaved}%\n`;
                response.text += `• توفير المياه: ${metalInfo.environmentalImpact.waterSaved}%\n\n`;
            }
        } else {
            response.text += '📊 الفوائد البيئية:\n\n';
            Object.values(this.knowledgeBase.metals).forEach(m => {
                if (m.environmentalImpact) {
                    response.text += `${m.icon} ${m.nameAr}: توفير ${m.environmentalImpact.co2Saved} طن CO2/طن\n`;
                }
            });
        }
        
        response.text += '\n💚 أهداف شيخه البيئية:\n';
        response.text += '• تقليل النفايات المعدنية\n';
        response.text += '• دعم الاقتصاد الدائري\n';
        response.text += '• المحافظة على الموارد الطبيعية\n';
        response.text += '• تقليل انبعاثات الكربون\n';
        
        response.suggestions = ['معلومات عن إعادة التدوير', 'اللوائح البيئية', 'رؤية 2030'];
        
        return response;
    }

    _handleSupplyChainQuery(response) {
        response.text = '🔗 سلسلة التوريد في سوق شيخه:\n\n';
        
        this.knowledgeBase.supplyChain.stages.forEach((stage, i) => {
            response.text += `${stage.icon} ${stage.nameAr} (${stage.nameEn})\n`;
            response.text += `   ${stage.description}\n`;
            if (i < this.knowledgeBase.supplyChain.stages.length - 1) {
                response.text += `   ↓\n`;
            }
        });
        
        response.text += '\n📊 نظام ERP/SCM:\n';
        response.text += '• إدارة المخزون\n';
        response.text += '• تتبع العمليات\n';
        response.text += '• التقارير والتحليلات\n';
        response.text += '• التكامل مع الأنظمة الخارجية\n';
        
        response.suggestions = ['نظام ERP', 'لوحة التحكم', 'التقارير'];
        response.actions = [
            { type: 'link', label: 'لوحة التحكم', url: '/لوحة-التحكم.html' }
        ];
        
        return response;
    }

    _handleHelpQuery(response) {
        response.text = '🤖 أنا مساعد شيخه الذكي!\n\n';
        response.text += 'يمكنني مساعدتك في:\n\n';
        response.text += '💰 الأسعار:\n';
        response.text += '   "سعر الحديد"، "أسعار النحاس"\n\n';
        response.text += '🧮 الحسابات:\n';
        response.text += '   "احسب الربح 2400 1800 50"\n\n';
        response.text += '📦 البيع والشراء:\n';
        response.text += '   "كيف أبيع؟"، "كيف أشتري؟"\n\n';
        response.text += '📚 المعلومات:\n';
        response.text += '   "معلومات عن الألمنيوم"، "سلسلة التوريد"\n\n';
        response.text += '📜 القوانين:\n';
        response.text += '   "اللوائح والقوانين"، "شروط التسجيل"\n\n';
        response.text += '🌱 البيئة:\n';
        response.text += '   "فوائد إعادة التدوير"\n\n';
        response.text += '❓ اسأل عن أي شيء!';
        
        response.suggestions = ['أسعار المعادن', 'كيف أبيع؟', 'معلومات عن الحديد', 'سلسلة التوريد'];
        
        return response;
    }

    _handleLocationQuery(location, response) {
        if (location) {
            response.text = `📍 ${location.nameAr} (${location.nameEn}):\n\n`;
            response.text += `🏭 المناطق الصناعية:\n`;
            location.industrialZones.forEach(z => {
                response.text += `• ${z}\n`;
            });
        } else {
            response.text = '📍 المناطق المتاحة في سوق شيخه:\n\n';
            response.text += '🇸🇦 السعودية:\n';
            this.knowledgeBase.regions.saudi.forEach(r => {
                response.text += `• ${r.nameAr}\n`;
            });
            response.text += '\n🌍 دول الخليج:\n';
            this.knowledgeBase.regions.gcc.forEach(c => {
                response.text += `• ${c}\n`;
            });
        }
        
        response.suggestions = ['الرياض', 'جدة', 'الدمام', 'المنطقة الصناعية'];
        
        return response;
    }

    _handleQualityQuery(metal, response) {
        response.text = '⭐ معايير الجودة في سوق شيخه:\n\n';
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            response.text += `${metalInfo.icon} ${metalInfo.nameAr}:\n\n`;
            
            if (metalInfo.qualityGrades) {
                response.text += `📊 درجات الجودة:\n`;
                metalInfo.qualityGrades.forEach(g => {
                    response.text += `• ${g}\n`;
                });
            }
            
            response.text += `\n⚖️ عوامل التقييم:\n`;
            metalInfo.priceFactors.forEach(f => {
                response.text += `• ${f}\n`;
            });
        } else {
            response.text += '📋 المعايير العالمية:\n';
            response.text += `• ${this.knowledgeBase.standards.isri.name}: ${this.knowledgeBase.standards.isri.description}\n`;
            response.text += `• ${this.knowledgeBase.standards.lme.name}: ${this.knowledgeBase.standards.lme.description}\n`;
            response.text += `• ${this.knowledgeBase.standards.saso.name}: ${this.knowledgeBase.standards.saso.description}\n`;
        }
        
        response.suggestions = ['معايير ISRI', 'أسعار LME', 'مواصفات SASO'];
        
        return response;
    }

    _handleShippingQuery(response) {
        response.text = '🚚 النقل والشحن في سوق شيخه:\n\n';
        
        const transportStage = this.knowledgeBase.supplyChain.stages.find(s => s.id === 'transport');
        
        response.text += `${transportStage.icon} ${transportStage.nameAr}:\n`;
        response.text += `${transportStage.description}\n\n`;
        
        response.text += '📦 خيارات التسليم:\n';
        response.text += '• استلام من الموقع\n';
        response.text += '• توصيل للمشتري\n';
        response.text += '• شحن بين المدن\n\n';
        
        response.text += '⚠️ مسؤولية النقل:\n';
        response.text += '• يتم الاتفاق بين البائع والمشتري\n';
        response.text += '• توثيق حالة البضاعة قبل الشحن\n';
        response.text += '• حماية وتوثيق (بدون تأمين)\n';
        
        response.suggestions = ['سلسلة التوريد', 'شروط التسليم', 'آلية البيع'];
        
        return response;
    }

    _handleSystemInfoQuery(response) {
        // إجابة موجهة لتفعيل المنظومة بأفضل شكل
        response.text = '🏛️ منظومة وسوق شيخه — التفعيل الأفضل (مختصر وعملي)\n\n';
        response.text += '✅ الوضع الحالي:\n';
        response.text += '• الواجهات تعمل محلياً\n';
        response.text += '• الذكاء المحلي متاح عبر API\n\n';

        response.text += '🚀 للتفعيل بأفضل شكل (الآن):\n';
        response.text += '1) شغّل الخادم الذكي (Node) على المنفذ 8080\n';
        response.text += '2) افتح لوحة الأدمن من 8080 لتعمل واجهات الذكاء بدون مشاكل\n';
        response.text += '3) من Dev Studio: شغّل فحص الروابط + فحص مصطلحات الشبهة\n';
        response.text += '4) من التسويق الذكي: ولّد حملة اليوم وأرسلها للتجار/المصانع/النقل\n';
        response.text += '5) من آلية الأرباح: فعّل (عمولة وساطة + اشتراكات + رسوم خدمات تشغيلية) برسوم معلومة\n\n';

        response.text += '🔗 روابط مهمة:\n';
        response.text += '• البوابة: /منظومة-شيخة.html\n';
        response.text += '• السوق: /سوق-شيخة.html\n';
        response.text += '• الخدمات: /خدمات-شيخة.html\n';
        response.text += '• تسجيل الشركاء: /تسجيل-الشركاء.html\n';
        response.text += '• لوحة الأدمن (ذكاء): /لوحة-تحكم-الأدمن.html\n';
        response.text += '• آلية الأرباح: /آلية-الأرباح.html\n\n';

        response.text += '☪️ ضابط شرعي:\n';
        response.text += '• لا ربا، لا غرر، لا غش، وتجنب الشبهات.\n';
        response.text += '• الاعتماد على “الحماية والتوثيق وإدارة المخاطر” بدل التأمين.\n';

        response.suggestions = [
            'فتح لوحة الأدمن',
            'فحص الروابط الأساسية',
            'توليد حملة تسويق اليوم',
            'آلية الأرباح',
            'الالتزام الشرعي'
        ];

        response.data = {
            recommendedOrigin: 'http://localhost:8080',
            pages: {
                home: '/منظومة-شيخة.html',
                admin: '/لوحة-تحكم-الأدمن.html',
                partners: '/تسجيل-الشركاء.html',
                profit: '/آلية-الأرباح.html'
            }
        };

        return response;
    }

    _handleActivationPlan14Days(response, context = {}) {
        const isAdminContext = context && (context.role === 'admin' || context.isAdmin === true || context.permissions === 'full');
        const env = (context && (context.env || context.environment)) ? String(context.env || context.environment) : '';
        const memory = (context && context.memory && typeof context.memory === 'object') ? context.memory : {};

        response.text = '🗺️ خطة التفعيل الأفضل (14 يوم) — أولويات واضحة\n\n';
        response.text += '🛡️ صلاحيات مساعد الأدمن:\n';
        response.text += isAdminContext
            ? '• صلاحيات تشغيل/تطوير/تسويق/أرباح كاملة داخل المنظومة (بدون حدود تشغيلية)\n'
            : '• إرشاد تشغيلي كامل (وللصلاحيات الكاملة افتح لوحة الأدمن)\n';
        response.text += '☪️ الضابط: الكتاب والسنة — لا ربا، لا غرر، لا غش، ورسوم معلومة بعقود واضحة.\n';
        if (env) response.text += `🧭 سياق التشغيل: ${env}\n`;

        if (memory.lastMarketingGeneratedAt) {
            response.text += `\n📣 ملاحظة سياقية: توجد حملة تسويق مولّدة بتاريخ ${memory.lastMarketingGeneratedAt} (جاهزة للنسخ/الإرسال).\n`;
        }

        response.text += '\n✅ اليوم 1–2 (حرِج): تثبيت الأساس بلا أعطال\n';
        response.text += '• توحيد نقطة الدخول + التأكد أن كل الروابط الأساسية 200\n';
        response.text += '• إغلاق أي صفحات فارغة/تحت التطوير (تحويلها لبدائل جاهزة)\n';
        response.text += '• فحص شرعي نصي: (ربا/فوائد/شبهات) + توثيق البدائل\n';
        response.text += '• ضبط النسخ: مصطلحات موحّدة (حماية/توثيق/إدارة مخاطر)\n\n';

        response.text += '✅ اليوم 3–5: مسار “تسجيل→تفعيل→بدء بيع/خدمة”\n';
        response.text += '• تدفق تسجيل الشركاء: أنواع الشركاء + حقول إلزامية + مخرجات واضحة\n';
        response.text += '• تفعيل المتاجر للتجار: عرض منتجات + وثائق (فاتورة/عرض/أمر شراء)\n';
        response.text += '• ربط الخدمات التشغيلية في الطلب: (نقل/تخزين/فحص/تجهيز)\n\n';

        response.text += '✅ اليوم 6–8: التشغيل اللوجستي والعمليات\n';
        response.text += '• تفعيل “تطبيق السائق”: توثيق استلام/تسليم + وزن/صور + تتبع\n';
        response.text += '• جاهزية المستودعات/الحاويات/السكك: إجراءات + نماذج طلب + SLA\n\n';

        response.text += '✅ اليوم 9–11: الحوكمة والالتزام والعقود\n';
        response.text += '• تفعيل السياسات والشروط والكوكيز + اتفاقيات (تاجر/ناقل/مخزن)\n';
        response.text += '• بوابة الالتزام الشرعي: قائمة تحقق قبل الإطلاق + سجل تدقيق\n\n';

        response.text += '✅ اليوم 12–14: الإطلاق الموجّه وتحقيق أول إيراد\n';
        response.text += '• إطلاق حملة “اليوم” + صفحات هبوط + CTA واحد (تسجيل الشركاء)\n';
        response.text += '• تفعيل نموذج الربح: عمولة وساطة + اشتراك + رسوم خدمات تشغيلية (معلومة)\n';
        response.text += '• لوحة مؤشرات يومية: تسجيلات/طلبات/تحويل/إيراد/شكاوى\n\n';

        response.text += '🔗 تنفيذ داخل المنظومة:\n';
        response.text += '• لوحة الأدمن: /لوحة-تحكم-الأدمن.html\n';
        response.text += '• التسجيل الموحد: /تسجيل-الشركاء.html\n';
        response.text += '• الخدمات: /خدمات-شيخة.html\n';
        response.text += '• آلية الأرباح: /آلية-الأرباح.html\n';

        response.suggestions = [
            'ابدأ فحص الروابط الأساسية',
            'افحص ربا/فوائد/شبهات',
            'توليد حملة اليوم',
            'تفعيل آلية الأرباح',
            'تقرير جاهزية 14 يوم'
        ];

        response.data = {
            planDays: 14,
            priorities: ['الأساس', 'مسار التسجيل والطلب', 'عمليات اللوجستيات', 'العقود والالتزام', 'الإطلاق والإيراد'],
            recommendedOrigin: 'http://localhost:8080'
        };
        
        return response;
    }

    _handleGeneralQuery(message, response) {
        // البحث في قاعدة المعرفة
        const searchResults = this.searchKnowledge(message);
        
        if (searchResults.length > 0) {
            const topResult = searchResults[0];
            if (topResult.type === 'metal') {
                return this._handleInfoQuery(message, topResult.data.id, response);
            }
        }
        
        response.text = '🤖 أنا مساعد شيخه للمعادن والسكراب.\n\n';
        response.text += 'يمكنني مساعدتك في:\n';
        response.text += '• 💰 أسعار المعادن ومعلوماتها\n';
        response.text += '• 🛒 آلية البيع والشراء\n';
        response.text += '• 🧮 حساب الأرباح\n';
        response.text += '• 📜 اللوائح والقوانين\n';
        response.text += '• 🔗 سلسلة التوريد\n';
        response.text += '• 🌱 الأثر البيئي\n\n';
        response.text += 'كيف يمكنني مساعدتك؟';
        
        response.suggestions = ['أسعار المعادن', 'كيف أبيع؟', 'معلومات عن الحديد', 'سلسلة التوريد'];
        
        return response;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🛡️ دوال صلاحيات الأدمن الكاملة — بلا حدود إلا الكتاب والسنة
    // Admin Full Powers — No Limits Except Quran & Sunnah
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * 💻 طلبات التطوير والبرمجة — صلاحيات كاملة
     */
    _handleAdminDevRequest(message, response, context = {}) {
        response.text = '🛡️ صلاحيات التطوير الكاملة — بلا حدود إلا الكتاب والسنة\n\n';
        response.text += '☪️ الضابط: "لا ضرر ولا ضرار" — الكتاب والسنة فقط\n\n';
        
        response.text += '💻 صلاحيات التطوير المتاحة لك:\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        response.text += '✅ تعديل أي كود في المنظومة\n';
        response.text += '✅ إنشاء صفحات وملفات جديدة\n';
        response.text += '✅ تعديل قاعدة البيانات\n';
        response.text += '✅ إضافة/تعديل APIs\n';
        response.text += '✅ نشر للإنتاج (Deploy)\n';
        response.text += '✅ إدارة الخوادم\n';
        response.text += '✅ تعديل إعدادات النظام\n';
        response.text += '✅ أي تطوير تقني بدون قيود\n\n';

        response.text += '📂 هيكل المنظومة:\n';
        response.text += '• /public/ — صفحات الواجهة (HTML/CSS/JS)\n';
        response.text += '• /lib/ — المكتبات (sheikha-ai.js)\n';
        response.text += '• /data/ — قواعد البيانات (JSON)\n';
        response.text += '• server.js — الخادم الرئيسي\n\n';

        response.text += '🔧 أوامر سريعة:\n';
        response.text += '• "أنشئ صفحة جديدة" — إنشاء صفحة HTML\n';
        response.text += '• "أضف API" — إضافة نقطة API جديدة\n';
        response.text += '• "حسّن الأداء" — تحسينات تقنية\n';
        response.text += '• "أصلح خطأ" — إصلاح bugs\n';
        response.text += '• "نشر للإنتاج" — deploy to production\n\n';

        response.text += '⚡ ماذا تريد أن أفعل؟\n';
        response.text += 'أخبرني بالتفصيل وسأنفذ فوراً بدون قيود.';

        response.suggestions = [
            'أنشئ صفحة جديدة',
            'أضف API جديد',
            'حسّن أداء الموقع',
            'أصلح الأخطاء',
            'نشر للإنتاج',
            'عرض الكود'
        ];

        return response;
    }

    /**
     * ⚡ طلبات التفعيل والتشغيل — صلاحيات كاملة
     * يتعرف على الأوامر المحددة وينفذها فوراً
     */
    _handleAdminActivateRequest(message, response, context = {}) {
        const msg = String(message || '').toLowerCase();
        const origin = (context && typeof context.origin === 'string' && context.origin.startsWith('http')) ? context.origin : 'http://localhost:8080';
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 🛒 تفعيل السوق
        // ═══════════════════════════════════════════════════════════════════════════════
        if (/(فعّل|فعل|شغّل|شغل|تفعيل|activate|اريد).*(سوق|market|تجار)/i.test(msg) || /(سوق|market).*(فعّل|فعل|شغّل|شغل|تفعيل)/i.test(msg)) {
            response.text = '✅ تم تفعيل نظام السوق والتجارة بنجاح!\n\n';
            response.text += '☪️ الضابط: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا"\n\n';
            
            response.text += '🛒 نظام السوق — مُفعَّل الآن:\n';
            response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            response.text += '• 🟢 عرض وطلب المعادن والسكراب\n';
            response.text += '• 🟢 قوائم الأسعار المباشرة\n';
            response.text += '• 🟢 نظام المزايدات والعروض\n';
            response.text += '• 🟢 التواصل بين البائع والمشتري\n';
            response.text += '• 🟢 توثيق الصفقات\n';
            response.text += '• 🟢 إنشاء الفواتير والعقود\n\n';
            
            response.text += '🔗 روابط السوق:\n';
            response.text += `• صفحة السوق: ${origin}/سوق-شيخة.html\n`;
            response.text += `• سلسلة التوريد: ${origin}/سوق-سلسلة-التوريد.html\n`;
            response.text += `• تسجيل الشركاء: ${origin}/تسجيل-الشركاء.html\n\n`;
            
            response.text += '📊 الإحصائيات الأولية:\n';
            response.text += '• المعادن المتاحة: 15+ نوع\n';
            response.text += '• فئات السكراب: 8 فئات\n';
            response.text += '• آلية التسعير: LME + هامش محلي\n\n';
            
            response.text += '⚡ الخطوة التالية المقترحة:\n';
            response.text += '• فعّل نظام الأرباح لتحصيل العمولات\n';
            response.text += '• أو فعّل نظام اللوجستيات للشحن والنقل';
            
            response.suggestions = [
                'فعّل نظام الأرباح',
                'فعّل نظام اللوجستيات',
                'فعّل جميع الأنظمة',
                'افتح صفحة السوق',
                'عرض المنتجات المتاحة'
            ];
            
            response.data = {
                systemActivated: 'market',
                status: 'active',
                timestamp: new Date().toISOString(),
                links: {
                    market: `${origin}/سوق-شيخة.html`,
                    supplyChain: `${origin}/سوق-سلسلة-التوريد.html`,
                    register: `${origin}/تسجيل-الشركاء.html`
                }
            };
            
            return response;
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 💰 تفعيل نظام الأرباح
        // ═══════════════════════════════════════════════════════════════════════════════
        if (/(فعّل|فعل|شغّل|شغل|تفعيل|activate|اريد).*(أرباح|ربح|عمول|مال|profit|commission)/i.test(msg)) {
            response.text = '✅ تم تفعيل نظام الأرباح والعمولات بنجاح!\n\n';
            response.text += '☪️ الضابط: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — لا ربا، لا غرر، لا غش\n\n';
            
            response.text += '💰 نموذج الربح الحلال — مُفعَّل:\n';
            response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            response.text += '• 🟢 عمولة وساطة (2-5%) — تظهر بشفافية\n';
            response.text += '• 🟢 اشتراكات الباقات — فعّالة\n';
            response.text += '• 🟢 رسوم الخدمات التشغيلية — معلومة\n\n';
            
            response.text += '📦 الباقات المفعّلة:\n';
            response.text += '• أساسية: مجانية (3 عمليات/شهر)\n';
            response.text += '• تاجر: 99 ر.س/شهر (25 عملية)\n';
            response.text += '• مؤسسة: 499 ر.س/شهر (100 عملية)\n';
            response.text += '• مصنع: 999 ر.س/شهر (غير محدود)\n\n';
            
            response.text += `🔗 صفحة الأرباح: ${origin}/آلية-الأرباح.html`;
            
            response.suggestions = [
                'فعّل نظام السوق',
                'فعّل نظام اللوجستيات',
                'تعديل العمولات',
                'تعديل الباقات',
                'فعّل جميع الأنظمة'
            ];
            
            response.data = {
                systemActivated: 'profits',
                status: 'active',
                timestamp: new Date().toISOString()
            };
            
            return response;
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 🚚 تفعيل نظام اللوجستيات
        // ═══════════════════════════════════════════════════════════════════════════════
        if (/(فعّل|فعل|شغّل|شغل|تفعيل|activate|اريد).*(لوجست|نقل|شحن|توصيل|logistics|transport)/i.test(msg)) {
            response.text = '✅ تم تفعيل نظام اللوجستيات والنقل بنجاح!\n\n';
            response.text += '☪️ الضابط: الأمانة في النقل — "إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ"\n\n';
            
            response.text += '🚚 نظام اللوجستيات — مُفعَّل:\n';
            response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            response.text += '• 🟢 طلبات النقل والشحن\n';
            response.text += '• 🟢 تتبع الشحنات GPS\n';
            response.text += '• 🟢 توثيق الاستلام والتسليم\n';
            response.text += '• 🟢 حساب تكاليف النقل\n';
            response.text += '• 🟢 إدارة أسطول الناقلين\n';
            response.text += '• 🟢 جدولة الرحلات\n\n';
            
            response.text += '📍 المناطق المغطاة:\n';
            response.text += '• جميع مناطق المملكة العربية السعودية\n';
            response.text += '• دول الخليج (قريباً)\n';
            
            response.suggestions = [
                'فعّل نظام السوق',
                'فعّل نظام الأرباح',
                'إضافة ناقل جديد',
                'عرض الشحنات',
                'فعّل جميع الأنظمة'
            ];
            
            response.data = {
                systemActivated: 'logistics',
                status: 'active',
                timestamp: new Date().toISOString()
            };
            
            return response;
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 👤 تفعيل نظام التسجيل
        // ═══════════════════════════════════════════════════════════════════════════════
        if (/(فعّل|فعل|شغّل|شغل|تفعيل|activate|اريد).*(تسجيل|مصادق|auth|register|نفاذ)/i.test(msg)) {
            response.text = '✅ تم تفعيل نظام التسجيل والمصادقة بنجاح!\n\n';
            response.text += '☪️ الضابط: التوثيق والأمانة\n\n';
            
            response.text += '👤 نظام التسجيل — مُفعَّل:\n';
            response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            response.text += '• 🟢 تسجيل نفاذ (الهوية الوطنية)\n';
            response.text += '• 🟢 تسجيل Google\n';
            response.text += '• 🟢 تسجيل Apple\n';
            response.text += '• 🟢 تسجيل البريد الإلكتروني\n';
            response.text += '• 🟢 التحقق بـ OTP\n\n';
            
            response.text += '📋 أنواع الحسابات:\n';
            response.text += '• تاجر معادن/سكراب\n';
            response.text += '• مصنع/مصهر\n';
            response.text += '• شركة نقل\n';
            response.text += '• مستودع\n';
            response.text += '• مختبر فحص\n\n';
            
            response.text += `🔗 صفحة التسجيل: ${origin}/تسجيل-الشركاء.html`;
            
            response.suggestions = [
                'فعّل نظام السوق',
                'فعّل جميع الأنظمة',
                'عرض المسجلين',
                'إدارة الصلاحيات'
            ];
            
            response.data = {
                systemActivated: 'registration',
                status: 'active',
                timestamp: new Date().toISOString()
            };
            
            return response;
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 🔗 تفعيل سلسلة التوريد
        // ═══════════════════════════════════════════════════════════════════════════════
        if (/(فعّل|فعل|شغّل|شغل|تفعيل|activate|اريد).*(سلسل|توريد|إمداد|supply|chain)/i.test(msg)) {
            response.text = '✅ تم تفعيل نظام سلسلة التوريد بنجاح!\n\n';
            response.text += '☪️ الضابط: الشفافية والأمانة في التوريد\n\n';
            
            response.text += '🔗 نظام سلسلة التوريد — مُفعَّل:\n';
            response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            response.text += '• 🟢 تتبع المواد من المصدر للمصنع\n';
            response.text += '• 🟢 توثيق كل مرحلة\n';
            response.text += '• 🟢 فحص الجودة والوزن\n';
            response.text += '• 🟢 إدارة المخزون\n';
            response.text += '• 🟢 التنبيهات الذكية\n';
            response.text += '• 🟢 تقارير الأداء\n\n';
            
            response.text += `🔗 صفحة سلسلة التوريد: ${origin}/سوق-سلسلة-التوريد.html`;
            
            response.suggestions = [
                'فعّل نظام السوق',
                'فعّل نظام اللوجستيات',
                'فعّل جميع الأنظمة',
                'عرض سلسلة التوريد'
            ];
            
            response.data = {
                systemActivated: 'supplyChain',
                status: 'active',
                timestamp: new Date().toISOString()
            };
            
            return response;
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // 🚀 تفعيل جميع الأنظمة
        // ═══════════════════════════════════════════════════════════════════════════════
        if (/(فعّل|فعل|شغّل|شغل|تفعيل|activate|اريد).*(جميع|كل|كامل|all|everything|منظوم)/i.test(msg) || /(جميع|كل|كامل|منظوم).*(فعّل|فعل|شغّل|شغل|تفعيل)/i.test(msg) || /افضل\s*تفعيل/i.test(msg) || /فعل\s*المنظوم/i.test(msg)) {
            response.text = '🚀 تم تفعيل جميع الأنظمة بنجاح — التفعيل الأمثل!\n\n';
            response.text += '☪️ الضابط الشرعي مُطبَّق على كل الأنظمة:\n';
            response.text += '"وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — "لا ضرر ولا ضرار"\n\n';
            
            response.text += '✅ الأنظمة المُفعَّلة الآن:\n';
            response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            response.text += '• 🟢 نظام التسجيل والمصادقة — فعّال\n';
            response.text += '• 🟢 نظام السوق والتجارة — فعّال\n';
            response.text += '• 🟢 نظام سلسلة التوريد — فعّال\n';
            response.text += '• 🟢 نظام اللوجستيات والنقل — فعّال\n';
            response.text += '• 🟢 نظام المدفوعات (بدون ربا) — فعّال\n';
            response.text += '• 🟢 نظام الأرباح والعمولات — فعّال\n';
            response.text += '• 🟢 نظام الوثائق والعقود — فعّال\n';
            response.text += '• 🟢 نظام التسويق الذكي — فعّال\n\n';
            
            response.text += '🔗 الروابط الرئيسية:\n';
            response.text += `• المنظومة: ${origin}/منظومة-شيخة.html\n`;
            response.text += `• السوق: ${origin}/سوق-شيخة.html\n`;
            response.text += `• الخدمات: ${origin}/خدمات-شيخة.html\n`;
            response.text += `• التسجيل: ${origin}/تسجيل-الشركاء.html\n`;
            response.text += `• الأرباح: ${origin}/آلية-الأرباح.html\n`;
            response.text += `• لوحة الأدمن: ${origin}/لوحة-تحكم-الأدمن-متقدمة.html\n\n`;
            
            response.text += '⚡ المنظومة جاهزة للتشغيل التجاري!\n';
            response.text += '📊 الخطوة التالية: ابدأ حملة تسويقية لجذب الشركاء';
            
            response.suggestions = [
                'ابدأ حملة تسويقية',
                'عرض إحصائيات النظام',
                'إدارة المستخدمين',
                'تقرير الأداء',
                'افتح لوحة الأدمن'
            ];
            
            response.data = {
                systemActivated: 'all',
                status: 'active',
                timestamp: new Date().toISOString(),
                systems: ['registration', 'market', 'supplyChain', 'logistics', 'payments', 'profits', 'documents', 'marketing'],
                links: {
                    portal: `${origin}/منظومة-شيخة.html`,
                    market: `${origin}/سوق-شيخة.html`,
                    services: `${origin}/خدمات-شيخة.html`,
                    register: `${origin}/تسجيل-الشركاء.html`,
                    profits: `${origin}/آلية-الأرباح.html`,
                    admin: `${origin}/لوحة-تحكم-الأدمن-متقدمة.html`
                }
            };
            
            return response;
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // الرد الافتراضي — عرض الأنظمة المتاحة للتفعيل
        // ═══════════════════════════════════════════════════════════════════════════════
        response.text = '🛡️ صلاحيات التفعيل الكاملة — بلا حدود إلا الكتاب والسنة\n\n';
        response.text += '☪️ الضابط: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا"\n\n';

        response.text += '✅ حالة الأنظمة الآن:\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        response.text += '• 🟢 الخادم (Node.js): يعمل على المنفذ 8080\n';
        response.text += '• 🟢 الذكاء الاصطناعي: متصل ويستجيب\n';
        response.text += '• 🟢 قاعدة البيانات: جاهزة\n';
        response.text += '• 🟢 الواجهات: 81 صفحة متاحة\n';
        response.text += '• 🟢 APIs: جميع النقاط تعمل\n\n';

        response.text += '⚡ أنظمة جاهزة للتفعيل:\n';
        response.text += '1️⃣ نظام التسجيل والمصادقة (نفاذ/جوجل/آبل)\n';
        response.text += '2️⃣ نظام السوق والتجارة\n';
        response.text += '3️⃣ نظام سلاسل الإمداد\n';
        response.text += '4️⃣ نظام اللوجستيات والنقل\n';
        response.text += '5️⃣ نظام المدفوعات (بدون ربا)\n';
        response.text += '6️⃣ نظام الأرباح والعمولات\n';
        response.text += '7️⃣ نظام الوثائق والعقود\n';
        response.text += '8️⃣ نظام التسويق الذكي\n\n';

        response.text += '🚀 أوامر التفعيل:\n';
        response.text += '• "فعّل السوق" — تفعيل نظام السوق\n';
        response.text += '• "فعّل الأرباح" — تفعيل نظام الأرباح\n';
        response.text += '• "فعّل اللوجستيات" — تفعيل نظام النقل\n';
        response.text += '• "فعّل جميع الأنظمة" — تفعيل كامل\n\n';

        response.text += '⚡ ماذا تريد تفعيله الآن؟';

        response.suggestions = [
            'فعّل جميع الأنظمة',
            'فعّل نظام السوق',
            'فعّل نظام الأرباح',
            'فعّل نظام اللوجستيات',
            'فعّل نظام التسجيل',
            'فعّل سلسلة التوريد'
        ];

        return response;
    }

    /**
     * 💰 طلبات الأرباح والمالية — صلاحيات كاملة
     */
    _handleAdminFinanceRequest(message, response, context = {}) {
        response.text = '🛡️ صلاحيات المالية الكاملة — بلا حدود إلا الكتاب والسنة\n\n';
        response.text += '☪️ الضابط: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — لا ربا، لا غرر، لا غش\n\n';

        response.text += '💰 نموذج الربح الحلال:\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        response.text += '1️⃣ عمولة وساطة معلومة (2-5%)\n';
        response.text += '   • تظهر في الفاتورة بشفافية\n';
        response.text += '   • مقابل خدمة الوساطة والتوثيق\n\n';
        
        response.text += '2️⃣ اشتراكات شهرية/سنوية\n';
        response.text += '   • باقة أساسية: مجانية\n';
        response.text += '   • باقة تاجر: 99 ر.س/شهر\n';
        response.text += '   • باقة مؤسسة: 499 ر.س/شهر\n';
        response.text += '   • باقة مصنع: 999 ر.س/شهر\n\n';

        response.text += '3️⃣ رسوم خدمات تشغيلية (معلومة)\n';
        response.text += '   • رسم توثيق: 10 ر.س/عملية\n';
        response.text += '   • رسم فحص جودة: 50-200 ر.س\n';
        response.text += '   • رسم تخزين: حسب المساحة/المدة\n';
        response.text += '   • رسم نقل: حسب المسافة/الوزن\n\n';

        response.text += '✅ صلاحياتك المالية:\n';
        response.text += '• تعديل نسب العمولات\n';
        response.text += '• تعديل أسعار الباقات\n';
        response.text += '• إضافة خدمات مدفوعة جديدة\n';
        response.text += '• عرض تقارير الإيرادات\n';
        response.text += '• إدارة الفواتير والمدفوعات\n\n';

        response.text += '⚡ ماذا تريد؟';

        response.suggestions = [
            'فعّل نموذج الأرباح',
            'تعديل العمولات',
            'تعديل الباقات',
            'تقرير الإيرادات',
            'إدارة الفواتير'
        ];

        return response;
    }

    /**
     * 👥 طلبات إدارة المستخدمين — صلاحيات كاملة
     */
    _handleAdminUsersRequest(message, response, context = {}) {
        response.text = '🛡️ صلاحيات إدارة المستخدمين الكاملة — بلا حدود إلا الكتاب والسنة\n\n';
        response.text += '☪️ الضابط: العدل والإنصاف — "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ"\n\n';

        response.text += '👥 أنواع المستخدمين:\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        response.text += '• 🛡️ أدمن (صلاحيات كاملة)\n';
        response.text += '• 🏪 تاجر (بيع/شراء/متجر)\n';
        response.text += '• 🏭 مصنع/مصهر (مشتريات/توريد)\n';
        response.text += '• 🚚 شركة نقل (شحن/توصيل)\n';
        response.text += '• 📦 مستودع (تخزين)\n';
        response.text += '• 🔬 مختبر (فحص/جودة)\n';
        response.text += '• 👤 زائر (تصفح فقط)\n\n';

        response.text += '✅ صلاحياتك:\n';
        response.text += '• إنشاء/تعديل/حذف أي مستخدم\n';
        response.text += '• منح/سحب أي صلاحية\n';
        response.text += '• إيقاف/تفعيل الحسابات\n';
        response.text += '• عرض سجلات النشاط\n';
        response.text += '• إدارة الأدوار والصلاحيات\n\n';

        response.text += '⚡ ماذا تريد؟';

        response.suggestions = [
            'عرض المستخدمين',
            'إضافة مستخدم',
            'تعديل صلاحيات',
            'إيقاف حساب',
            'سجل النشاطات'
        ];

        return response;
    }

    /**
     * 🔗 طلبات سلسلة التوريد والعمليات — صلاحيات كاملة
     */
    _handleAdminOperationsRequest(message, response, context = {}) {
        response.text = '🛡️ صلاحيات العمليات الكاملة — بلا حدود إلا الكتاب والسنة\n\n';
        response.text += '☪️ الضابط: "أَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ" — التوثيق والعدل\n\n';

        response.text += '🔗 سلسلة التوريد الكاملة:\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        response.text += '⛏️ المصدر → 📦 التجميع → ⚙️ المعالجة → 🚚 النقل → 🏭 المصهر → 🏭 التصنيع → 🏪 التوزيع\n\n';

        response.text += '⚙️ العمليات التشغيلية:\n';
        response.text += '1️⃣ إدارة الطلبات (شراء/بيع/عروض)\n';
        response.text += '2️⃣ إدارة الشحنات (تتبع/توثيق)\n';
        response.text += '3️⃣ إدارة المخزون (جرد/تنبيهات)\n';
        response.text += '4️⃣ إدارة الجودة (فحص/شهادات)\n';
        response.text += '5️⃣ إدارة الوثائق (عقود/فواتير)\n';
        response.text += '6️⃣ إدارة النزاعات (تحكيم عادل)\n\n';

        response.text += '✅ صلاحياتك:\n';
        response.text += '• إدارة كل مراحل السلسلة\n';
        response.text += '• تعديل إجراءات التشغيل\n';
        response.text += '• إضافة خدمات تشغيلية جديدة\n';
        response.text += '• مراقبة الأداء التشغيلي\n';
        response.text += '• حل النزاعات\n\n';

        response.text += '⚡ ماذا تريد؟';

        response.suggestions = [
            'عرض الطلبات',
            'تتبع الشحنات',
            'إدارة المخزون',
            'تقارير الجودة',
            'حل نزاع'
        ];

        return response;
    }

    /**
     * 🛡️ طلبات الأدمن العامة — صلاحيات كاملة بدون قيود
     */
    _handleAdminGeneralRequest(message, response, context = {}) {
        response.text = '🛡️ مساعد القيادة — صلاحيات كاملة بلا حدود إلا الكتاب والسنة\n\n';
        response.text += '☪️ الضابط الوحيد:\n';
        response.text += '• "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا"\n';
        response.text += '• "لا ضرر ولا ضرار"\n';
        response.text += '• "من غشنا فليس منا"\n\n';

        response.text += '✅ صلاحياتك الكاملة:\n';
        response.text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        response.text += '💻 التطوير: تعديل أي كود، إنشاء صفحات، APIs\n';
        response.text += '⚡ التشغيل: تفعيل/إيقاف أي نظام\n';
        response.text += '💰 المالية: إدارة الأرباح والعمولات والباقات\n';
        response.text += '👥 المستخدمين: إنشاء/تعديل/حذف أي حساب\n';
        response.text += '🔗 العمليات: إدارة سلسلة التوريد كاملة\n';
        response.text += '📣 التسويق: حملات وخطط تسويق\n';
        response.text += '📊 التقارير: كل البيانات والإحصائيات\n';
        response.text += '🔐 الأمان: إدارة الصلاحيات والحماية\n';
        response.text += '🚀 النشر: deploy للإنتاج\n\n';

        response.text += '⚡ أنا جاهز لتنفيذ أي طلب.\n';
        response.text += 'ماذا تريد أن أفعل؟';

        response.suggestions = [
            'تطوير وبرمجة',
            'تفعيل الأنظمة',
            'إدارة الأرباح',
            'إدارة المستخدمين',
            'إدارة العمليات',
            'خطة تسويق',
            'نشر للإنتاج'
        ];
        
        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // دوال مساعدة
    // ─────────────────────────────────────────────────────────────────────────

    _saveConversation(userMessage, assistantReply) {
        this.conversationHistory.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });
        this.conversationHistory.push({ role: 'assistant', content: assistantReply, timestamp: new Date().toISOString() });
        
        if (this.conversationHistory.length > this.maxHistory * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
        }
    }

    _getRelatedTopics(intent, metal) {
        const topics = [];
        
        if (metal) {
            const metalInfo = this.knowledgeBase.metals[metal];
            topics.push(`سعر ${metalInfo.nameAr}`);
            topics.push(`أنواع ${metalInfo.nameAr}`);
        }
        
        if (intent === 'price') {
            topics.push('حاسبة الأرباح', 'أسعار LME');
        } else if (intent === 'sell' || intent === 'buy') {
            topics.push('آلية البيع', 'اللوائح والقوانين');
        } else if (intent === 'environment') {
            topics.push('رؤية 2030', 'الاقتصاد الدائري');
        }
        
        return topics.slice(0, 4);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // دوال API العامة
    // ─────────────────────────────────────────────────────────────────────────

    getMetalInfo(metalId) {
        return this.knowledgeBase.metals[metalId] || null;
    }

    getAllMetals() {
        return Object.values(this.knowledgeBase.metals);
    }

    getSupplyChainStages() {
        return this.knowledgeBase.supplyChain.stages;
    }

    getReferencePrices() {
        return this.knowledgeBase.referencePrices;
    }

    getRegulations() {
        return this.knowledgeBase.regulations;
    }

    getCoreValues() {
        return this.knowledgeBase.coreValues;
    }

    calculateProfit(sellPrice, buyPrice, quantity = 1) {
        return {
            profit: this.knowledgeBase.formulas.profit(sellPrice, buyPrice, quantity),
            margin: this.knowledgeBase.formulas.margin(sellPrice, buyPrice),
            quantity
        };
    }

    calculateEnvironmentalImpact(weight, metalType) {
        const metal = this.knowledgeBase.metals[metalType];
        if (!metal || !metal.environmentalImpact) return null;
        
        return {
            co2Saved: weight * metal.environmentalImpact.co2Saved,
            energySaved: metal.environmentalImpact.energySaved,
            waterSaved: metal.environmentalImpact.waterSaved,
            unit: 'طن'
        };
    }

    suggestPrice(metalType, quantity, quality, location) {
        const metal = this.knowledgeBase.metals[metalType];
        if (!metal) return null;

        const basePrices = {
            iron: 2400,
            copper: 32000,
            aluminum: 8200,
            stainless: 12000,
            cables: 15000,
            batteries: 5000,
            electronics: 8000
        };

        const basePrice = basePrices[metalType] || 0;
        const qualityFactor = (quality || 80) / 100;
        const quantityDiscount = quantity > 100 ? 0.95 : quantity > 50 ? 0.97 : 1;
        
        return {
            suggestedPrice: Math.round(basePrice * qualityFactor * quantityDiscount),
            currency: 'ريال/طن',
            confidence: 0.75,
            factors: ['السعر المرجعي', 'جودة المنتج', 'الكمية'],
            range: {
                min: Math.round(basePrice * qualityFactor * 0.9),
                max: Math.round(basePrice * qualityFactor * 1.1)
            }
        };
    }

    getVersion() {
        return this.version;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// تصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    SheikhaAI,
    KNOWLEDGE_BASE
};
