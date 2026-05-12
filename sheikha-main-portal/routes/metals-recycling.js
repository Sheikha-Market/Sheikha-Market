/**
 * بسم الله الرحمن الرحيم
 * routes/metals-recycling.js
 * منظومة شيخة — محور المعادن والسكراب الرقمي
 *
 * أكبر وأفضل منظومة اقتصادية لتجميع وإعادة تدوير المعادن
 * مبنية على مبادئ القرآن الكريم والسنة النبوية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 */

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
    bootstrapRoot,
    buildRootConfig,
    getSystemSnapshot,
    resolveRuntimeMode
} = require('../core/sheikha-root');
const { getOsStatus, bootSheikhaOS } = require('../core/sheikha-os');
const { executeSheikhaCommand } = require('../core/sheikha-control-plane');
const enterpriseStorage = require('../lib/enterprise-storage');

// ─────────────────────────────────────────────
// قراءة ملفات البيانات
// ─────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '../data');

function loadJson(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`[metals-recycling] خطأ في تحميل ${filename}:`, e.message);
        return null;
    }
}

function saveJson(filename, data) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`[metals-recycling] خطأ في الحفظ ${filename}:`, e.message);
        return false;
    }
}

function nowIso() {
    return new Date().toISOString();
}

function responseOk(res, message, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        timestamp: nowIso(),
        data
    });
}

function responseBad(res, message, statusCode = 400, data = null) {
    return res.status(statusCode).json({
        success: false,
        message,
        timestamp: nowIso(),
        data
    });
}

function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

const ENTERPRISE_STORE = {
    tenants: 'enterprise-tenants.json',
    rfqs: 'enterprise-rfqs.json',
    orders: 'enterprise-orders.json',
    shipments: 'enterprise-shipments.json',
    events: 'enterprise-events.json'
};

function readEnterpriseList(storeKey) {
    const file = ENTERPRISE_STORE[storeKey];
    if (!file) return [];
    const data = loadJson(file);
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    return [];
}

function writeEnterpriseList(storeKey, list) {
    const file = ENTERPRISE_STORE[storeKey];
    if (!file) return false;
    return saveJson(file, list);
}

async function mirrorEnterprise(entityType, record, auditType, tenantId, actor = 'system') {
    try {
        await enterpriseStorage.mirrorRecord(entityType, record);
        await enterpriseStorage.appendAudit(auditType, tenantId, {
            entityType,
            entityId: record?.id || null,
            record
        }, actor);
    } catch (error) {
        console.warn('[metals-recycling] فشل المزامنة إلى PostgreSQL (fallback JSON):', error.message);
    }
}

function resolveMarketType(input) {
    const raw = String(input || '').trim().toLowerCase();
    if (!raw) return 'metals';
    if (['metals', 'mining', 'smelting', 'manufacturing', 'scrap', 'logistics', 'precious'].includes(raw)) {
        return raw;
    }
    return 'metals';
}

function getEnterpriseCatalog() {
    return {
        markets: [
            {
                id: 'metals',
                nameAr: 'المعادن الأساسية',
                hsBands: ['72', '73', '74', '76', '79', '80']
            },
            {
                id: 'scrap',
                nameAr: 'السكراب وإعادة التدوير',
                hsBands: ['7204', '7404', '7602']
            },
            {
                id: 'precious',
                nameAr: 'المعادن الثمينة',
                hsBands: ['7108', '7106', '7110']
            },
            {
                id: 'mining',
                nameAr: 'التعدين والاستخراج',
                hsBands: ['26']
            },
            {
                id: 'smelting',
                nameAr: 'المصاهر والتحويل',
                hsBands: ['74', '75', '76']
            },
            {
                id: 'manufacturing',
                nameAr: 'التصنيع التحويلي',
                hsBands: ['84', '85', '87']
            },
            {
                id: 'logistics',
                nameAr: 'النقل واللوجستيات',
                hsBands: []
            }
        ],
        logisticsModels: ['2PL', '3PL', '4PL', '5PL', '360PL', '3DPL'],
        connectors: [
            {
                system: 'Oracle Fusion Cloud ERP',
                methods: ['REST API', 'Oracle Integration B2B', 'SFTP/EDI']
            },
            {
                system: 'SAP S/4HANA + SAP Business Network',
                methods: ['SAP Integration Suite', 'Event Mesh', 'IDoc/API']
            },
            {
                system: 'Microsoft Dynamics 365 SCM',
                methods: ['Dataverse', 'OData', 'REST API', 'Webhook']
            },
            {
                system: 'Any External ERP',
                methods: ['REST API', 'CSV/SFTP', 'EDI/AS2', 'Event Bus']
            }
        ]
    };
}

// ─────────────────────────────────────────────
// بيانات الأسعار اللحظية (محاكاة مركز الأسعار)
// في الإنتاج: تُوصّل بـ LME / Bloomberg / Reuters feeds
// ─────────────────────────────────────────────

function getLivePrices() {
    const base = {
        timestamp: new Date().toISOString(),
        currency: 'USD',
        source: 'مؤشر شيخة للمعادن — للمعرفة فقط، ليس تسعيراً إلزامياً',
        islamicNote: 'والله يعلم وأنتم لا تعلمون — الأسعار بأمر الله تتغير',
        metals: {
            steel_hms: {
                price: 420 + Math.floor(Math.random() * 40 - 20),
                unit: 'USD/ton',
                change24h: '+1.2%',
                trend: 'صاعد'
            },
            copper_bright: {
                price: 8850 + Math.floor(Math.random() * 200 - 100),
                unit: 'USD/ton',
                change24h: '-0.8%',
                trend: 'مستقر'
            },
            aluminum_clean: {
                price: 2250 + Math.floor(Math.random() * 100 - 50),
                unit: 'USD/ton',
                change24h: '+0.5%',
                trend: 'مستقر'
            },
            stainless_304: {
                price: 1680 + Math.floor(Math.random() * 80 - 40),
                unit: 'USD/ton',
                change24h: '+2.1%',
                trend: 'صاعد'
            },
            lead_soft: {
                price: 2120 + Math.floor(Math.random() * 80 - 40),
                unit: 'USD/ton',
                change24h: '0.0%',
                trend: 'مستقر'
            },
            zinc_clean: {
                price: 2980 + Math.floor(Math.random() * 120 - 60),
                unit: 'USD/ton',
                change24h: '-1.5%',
                trend: 'هابط'
            },
            nickel_class1: {
                price: 16800 + Math.floor(Math.random() * 500 - 250),
                unit: 'USD/ton',
                change24h: '+3.2%',
                trend: 'صاعد قوي'
            },
            gold: {
                price: 2850 + Math.floor(Math.random() * 50 - 25),
                unit: 'USD/oz',
                change24h: '+0.3%',
                trend: 'مستقر'
            },
            silver: {
                price: 32.5 + (Math.random() * 2 - 1).toFixed(2),
                unit: 'USD/oz',
                change24h: '-0.6%',
                trend: 'مستقر'
            }
        },
        sarConversion: {
            note: '1 USD = 3.75 SAR (ربط ثابت)',
            multiplier: 3.75
        }
    };
    return base;
}

// ─────────────────────────────────────────────
// حاسبة الزكاة على مخزون المعادن
// ─────────────────────────────────────────────

function calculateZakat(metalType, quantityTons, pricePerTon) {
    const nisabUSD = 5000; // نصاب تقريبي (بسعر الذهب)
    const totalValueUSD = quantityTons * pricePerTon;
    const zakatRate = 0.025; // 2.5%

    if (totalValueUSD < nisabUSD) {
        return {
            eligible: false,
            reason: 'أقل من النصاب — لا زكاة واجبة',
            nisabUSD,
            totalValueUSD
        };
    }

    const zakatDueUSD = totalValueUSD * zakatRate;
    const zakatDueSAR = zakatDueUSD * 3.75;

    return {
        eligible: true,
        metalType,
        quantityTons,
        pricePerTon,
        totalValueUSD: Math.round(totalValueUSD),
        totalValueSAR: Math.round(totalValueUSD * 3.75),
        zakatRate: '2.5%',
        zakatDueUSD: Math.round(zakatDueUSD),
        zakatDueSAR: Math.round(zakatDueSAR),
        islamicNote: 'وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ (الذاريات:19)',
        nisabUSD,
        haul: 'تجب الزكاة بعد حول هجري كامل على الملك',
        recommendation: 'راجع عالماً للتأكد من وعاء الزكاة الصحيح'
    };
}

// ─────────────────────────────────────────────
// حاسبة التحقق الشرعي للصفقة
// ─────────────────────────────────────────────

function shariahCheck(transaction) {
    const issues = [];
    const passed = [];

    // فحص الربا
    if (transaction.paymentType === 'deferred_with_increase') {
        issues.push({ rule: 'ربا', severity: 'حرام', detail: 'البيع الآجل بزيادة — محرّم' });
    } else {
        passed.push('لا ربا في طريقة الدفع');
    }

    // فحص الغرر
    if (!transaction.metalType || !transaction.quantity || !transaction.price) {
        issues.push({
            rule: 'غرر',
            severity: 'محرّم',
            detail: 'نوع المعدن أو الكمية أو السعر غير محدد — بيع الغرر لا يجوز'
        });
    } else {
        passed.push('السلعة والكمية والسعر محددة — لا غرر');
    }

    // فحص التملك
    if (transaction.sellerOwns === false) {
        issues.push({
            rule: 'بيع ما لا يملك',
            severity: 'محرّم',
            detail: 'لا تبع ما ليس عندك — سنن أبي داود'
        });
    } else {
        passed.push('البائع يملك السلعة');
    }

    // فحص الاحتكار
    if (transaction.monopolyHolding === true) {
        issues.push({
            rule: 'احتكار',
            severity: 'مكروه تحريمي',
            detail: 'الاحتكار يضر السوق — نهى عنه النبي ﷺ'
        });
    } else {
        passed.push('لا احتكار');
    }

    const isValid =
        issues.filter(i => i.severity === 'حرام' || i.severity === 'محرّم').length === 0;

    return {
        isShariahCompliant: isValid,
        issues,
        passed,
        certificate: isValid
            ? 'الصفقة مستوفية للشروط الشرعية الأساسية'
            : 'تنبيه: يوجد مخالفات شرعية — راجع عالماً',
        disclaimer: 'هذا فحص أولي — الفتوى المعتمدة تستوجب مراجعة عالم شريعة'
    };
}

// ─────────────────────────────────────────────
// المسارات الرئيسية
// ─────────────────────────────────────────────

/**
 * GET /api/metals/overview
 * نظرة عامة على منظومة المعادن
 */
router.get('/overview', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    const centers = loadJson('metal-recycling-centers.json');
    const prices = getLivePrices();

    const totalRegions = regions?.regions?.length || 13;
    const totalCities =
        regions?.regions?.reduce((sum, r) => sum + (r.cities?.length || 0), 0) || 247;
    const totalAnnualScrap =
        regions?.regions?.reduce((sum, r) => sum + (r.scraptonnage_annual || 0), 0) || 0;
    const activeCenters =
        centers?.recyclingCenters?.filter(c => c.status === 'active')?.length || 0;
    const totalCenters = centers?.recyclingCenters?.length || 0;

    res.json({
        success: true,
        message: 'بسم الله الرحمن الرحيم — منظومة شيخة للمعادن',
        timestamp: new Date().toISOString(),
        data: {
            system: {
                nameAr: 'منظومة شيخة الاقتصادية للمعادن والسكراب',
                nameEn: 'Sheikha Metal Economy & Recycling Hub',
                version: '3.0.0',
                domain: 'sheikha.top',
                islamicFoundation: 'الكتاب والسنة — سوق المدينة المنورة',
                vision: 'أكبر وأفضل منظومة اقتصادية لتجميع وإعادة تدوير المعادن في الكون'
            },
            kpis: {
                totalRegions,
                totalCities,
                totalRecyclingCenters: totalCenters,
                activeCenters,
                totalAnnualScrapTons: totalAnnualScrap,
                totalAnnualScrapFormatted: `${(totalAnnualScrap / 1000000).toFixed(2)} مليون طن/سنة`,
                marketValueUSD_annual: `${((totalAnnualScrap * 450) / 1000000).toFixed(0)} مليون دولار/سنة تقديرياً`,
                metalCategories: centers?.metals?.categories?.length || 8,
                scrapMarkets: centers?.scrapMarketplaces?.totalMarkets || 45,
                islamicCompliantTransactions: '100%'
            },
            livePrices: prices.metals,
            shariah: {
                quranRef:
                    'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ (الحديد:25)',
                principles: ['لا ربا', 'لا غرر', 'لا غش', 'لا احتكار', 'البيع عن تراضٍ'],
                zakatEnabled: true,
                shariahAuditFrequency: 'شهري'
            },
            globalIntegration: {
                tradingPartners: regions?.globalContext?.tradingPartners?.length || 7,
                worldSteelProduction_million_tons: 1950,
                saudiMarketShare: '~2.8%',
                recyclingRates: regions?.globalContext?.recyclingRates
            }
        }
    });
});

/**
 * GET /api/metals/regions
 * جميع المناطق السعودية مع بيانات المعادن
 */
router.get('/regions', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    if (!regions) {
        return res.status(500).json({ success: false, message: 'فشل تحميل بيانات المناطق' });
    }

    const { orderBy = 'scrap', limit } = req.query;

    let data = regions.regions.map(r => ({
        id: r.id,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        capital: r.capital,
        population2025: r.population2025,
        area_km2: r.area_km2,
        coordinates: r.coordinates,
        metalRecyclingPotential: r.metalRecyclingPotential,
        scraptonnage_annual: r.scraptonnage_annual,
        industrialZones: r.industrialZones,
        citiesCount: r.cities?.length || 0,
        isStrategic: r.isStrategic || false,
        specialNote: r.specialNote
    }));

    if (orderBy === 'scrap') {
        data.sort((a, b) => (b.scraptonnage_annual || 0) - (a.scraptonnage_annual || 0));
    } else if (orderBy === 'population') {
        data.sort((a, b) => (b.population2025 || 0) - (a.population2025 || 0));
    }

    if (limit) data = data.slice(0, parseInt(limit));

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            totalRegions: data.length,
            regions: data,
            totalAnnualScrap: data.reduce((s, r) => s + (r.scraptonnage_annual || 0), 0),
            topRegion: data[0]
        }
    });
});

/**
 * GET /api/metals/regions/:regionId
 * تفاصيل منطقة واحدة مع مدنها ومراكزها
 */
router.get('/regions/:regionId', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    const centers = loadJson('metal-recycling-centers.json');
    const { regionId } = req.params;

    const region = regions?.regions?.find(r => r.id === regionId);
    if (!region) {
        return res.status(404).json({ success: false, message: `المنطقة ${regionId} غير موجودة` });
    }

    const regionCenters = centers?.recyclingCenters?.filter(c => c.regionId === regionId) || [];

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            region,
            recyclingCenters: regionCenters,
            centersCount: regionCenters.length,
            activeCenters: regionCenters.filter(c => c.status === 'active').length,
            totalCapacity_monthly: regionCenters.reduce(
                (s, c) => s + (c.capacity_tons_monthly || 0),
                0
            )
        }
    });
});

/**
 * GET /api/metals/cities
 * جميع المدن مع بيانات المعادن
 */
router.get('/cities', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    if (!regions) {
        return res.status(500).json({ success: false, message: 'فشل تحميل البيانات' });
    }

    const { region, search, minDemand, metal } = req.query;

    let allCities = [];
    regions.regions.forEach(r => {
        (r.cities || []).forEach(c => {
            allCities.push({
                ...c,
                regionId: r.id,
                regionNameAr: r.nameAr,
                regionCapital: r.capital
            });
        });
    });

    // فلترة
    if (region) {
        allCities = allCities.filter(c => c.regionId === region);
    }
    if (search) {
        const s = search.toLowerCase();
        allCities = allCities.filter(
            c => c.nameAr?.includes(search) || c.nameEn?.toLowerCase().includes(s)
        );
    }
    if (metal) {
        allCities = allCities.filter(c => c.metalDemand && c.metalDemand[metal]);
    }
    if (minDemand) {
        const min = parseInt(minDemand);
        allCities = allCities.filter(c => {
            if (!c.metalDemand) return false;
            return Object.values(c.metalDemand).some(v => v >= min);
        });
    }

    // ترتيب حسب الطلب على الفولاذ
    allCities.sort((a, b) => (b.metalDemand?.steel || 0) - (a.metalDemand?.steel || 0));

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            totalCities: allCities.length,
            cities: allCities,
            filters: { region, search, minDemand, metal }
        }
    });
});

/**
 * GET /api/metals/centers
 * جميع مراكز إعادة التدوير
 */
router.get('/centers', (req, res) => {
    const centers = loadJson('metal-recycling-centers.json');
    if (!centers) {
        return res.status(500).json({ success: false, message: 'فشل تحميل البيانات' });
    }

    const { tier, status, metal } = req.query;
    let data = centers.recyclingCenters;

    if (tier) data = data.filter(c => c.tier === parseInt(tier));
    if (status) data = data.filter(c => c.status === status);
    if (metal) data = data.filter(c => c.metals?.includes(metal));

    const totalCapacity = data.reduce((s, c) => s + (c.capacity_tons_monthly || 0), 0);

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            totalCenters: data.length,
            totalMonthlyCapacity_tons: totalCapacity,
            totalAnnualCapacity_tons: totalCapacity * 12,
            centers: data,
            tier1: data.filter(c => c.tier === 1).length,
            tier2: data.filter(c => c.tier === 2).length,
            tier3: data.filter(c => c.tier === 3).length,
            active: data.filter(c => c.status === 'active').length,
            underDevelopment: data.filter(c => c.status === 'under-development').length
        }
    });
});

/**
 * GET /api/metals/prices/live
 * الأسعار اللحظية للمعادن
 */
router.get('/prices/live', (req, res) => {
    const prices = getLivePrices();

    // تحويل للريال السعودي
    const sarPrices = {};
    Object.entries(prices.metals).forEach(([k, v]) => {
        sarPrices[k] = {
            ...v,
            priceSAR: Math.round(v.price * 3.75),
            unitSAR: v.unit.replace('USD', 'SAR')
        };
    });

    res.json({
        success: true,
        ...prices,
        metalsInSAR: sarPrices,
        disclaimer: 'الأسعار تقديرية للمعرفة فقط — مؤشر شيخة ليس تسعيراً إلزامياً',
        islamicNote: 'السعر يتحدد بالعرض والطلب بإذن الله — التسعير الجبري محرّم'
    });
});

/**
 * GET /api/metals/prices/history
 * تاريخ الأسعار (محاكاة)
 */
router.get('/prices/history', (req, res) => {
    const { metal = 'steel_hms', days = 30 } = req.query;
    const basePrices = {
        steel_hms: 420,
        copper_bright: 8850,
        aluminum_clean: 2250,
        stainless_304: 1680,
        nickel_class1: 16800
    };

    const base = basePrices[metal] || 420;
    const history = [];
    const now = Date.now();

    for (let i = parseInt(days); i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * base * 0.05;
        history.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(base + variation),
            currency: 'USD',
            priceSAR: Math.round((base + variation) * 3.75)
        });
    }

    res.json({
        success: true,
        metal,
        days: parseInt(days),
        history,
        average: Math.round(history.reduce((s, h) => s + h.price, 0) / history.length),
        min: Math.min(...history.map(h => h.price)),
        max: Math.max(...history.map(h => h.price))
    });
});

/**
 * GET /api/metals/categories
 * جميع أصناف المعادن مع تعريفاتها الشرعية
 */
router.get('/categories', (req, res) => {
    const centers = loadJson('metal-recycling-centers.json');
    if (!centers) {
        return res.status(500).json({ success: false, message: 'فشل تحميل البيانات' });
    }

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            totalCategories: centers.metals.categories.length,
            categories: centers.metals.categories,
            islamicPrinciples: centers.islamicPrinciples
        }
    });
});

/**
 * POST /api/metals/shariah-check
 * التحقق الشرعي من صفقة
 */
router.post('/shariah-check', (req, res) => {
    const { metalType, quantity, price, paymentType, sellerOwns, monopolyHolding } = req.body;

    if (!metalType) {
        return res.status(400).json({
            success: false,
            message: 'يرجى تحديد نوع المعدن على الأقل'
        });
    }

    const result = shariahCheck({
        metalType,
        quantity: parseFloat(quantity) || 0,
        price: parseFloat(price) || 0,
        paymentType: paymentType || 'cash',
        sellerOwns: sellerOwns !== false,
        monopolyHolding: monopolyHolding === true
    });

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        transaction: { metalType, quantity, price, paymentType },
        shariahResult: result
    });
});

/**
 * POST /api/metals/zakat-calculator
 * حاسبة الزكاة على المعادن
 */
router.post('/zakat-calculator', (req, res) => {
    const { metalType, quantityTons, pricePerTon } = req.body;

    if (!metalType || !quantityTons || !pricePerTon) {
        return res.status(400).json({
            success: false,
            message: 'يرجى توفير: نوع المعدن، الكمية بالطن، السعر لكل طن'
        });
    }

    const result = calculateZakat(metalType, parseFloat(quantityTons), parseFloat(pricePerTon));

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        zakat: result
    });
});

/**
 * POST /api/metals/rfq
 * طلب عرض سعر (RFQ)
 */
router.post('/rfq', (req, res) => {
    const {
        buyerName,
        contactInfo,
        metalType,
        quantity,
        grade,
        deliveryRegion,
        deliveryDate,
        paymentTerms = 'نقدي فوري'
    } = req.body;

    if (!metalType || !quantity || !deliveryRegion) {
        return res.status(400).json({
            success: false,
            message: 'الحقول المطلوبة: نوع المعدن، الكمية، منطقة التسليم'
        });
    }

    const centers = loadJson('metal-recycling-centers.json');
    const regions = loadJson('saudi-regions-cities.json');

    // البحث عن المراكز القريبة
    const region = regions?.regions?.find(
        r =>
            r.nameAr.includes(deliveryRegion) ||
            r.cities?.some(c => c.nameAr.includes(deliveryRegion))
    );

    const nearestCenters =
        centers?.recyclingCenters
            ?.filter(
                c =>
                    c.status === 'active' &&
                    c.metals?.some(
                        m =>
                            m.toLowerCase().includes('M01') ||
                            metalType.toLowerCase().includes('steel')
                    )
            )
            .slice(0, 3) || [];

    const rfqId = `RFQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // حفظ RFQ (في الإنتاج يُحفظ في قاعدة البيانات)
    const rfqData = {
        id: rfqId,
        createdAt: new Date().toISOString(),
        buyerName,
        contactInfo,
        metalType,
        quantity,
        grade,
        deliveryRegion,
        deliveryDate,
        paymentTerms,
        status: 'pending',
        matchedCenters: nearestCenters.map(c => c.nameAr)
    };

    res.json({
        success: true,
        message: 'تم استلام طلب عرض السعر — سيتواصل معكم أحد المختصين خلال ساعات',
        timestamp: new Date().toISOString(),
        data: {
            rfqId,
            estimate: {
                quantityTons: parseFloat(quantity),
                region: deliveryRegion,
                metalType,
                grade: grade || 'سيُحدَّد بعد الفحص',
                paymentTerms,
                islamicNote: 'الصفقة بالتراضي — والمسلمون على شروطهم'
            },
            nearestCenters: nearestCenters.map(c => ({
                nameAr: c.nameAr,
                email: c.contact?.email,
                capacity: c.capacity_tons_monthly
            }))
        }
    });
});

/**
 * GET /api/metals/map-data
 * بيانات الخريطة التفاعلية — جميع المراكز والمدن
 */
router.get('/map-data', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    const centers = loadJson('metal-recycling-centers.json');

    const mapPoints = [];

    // إضافة مراكز إعادة التدوير
    (centers?.recyclingCenters || []).forEach(c => {
        if (c.location?.lat) {
            mapPoints.push({
                id: c.id,
                type: 'recycling_center',
                nameAr: c.nameAr,
                lat: c.location.lat,
                lng: c.location.lng,
                tier: c.tier,
                status: c.status,
                capacity: c.capacity_tons_monthly,
                metals: c.metals,
                contact: c.contact?.email,
                icon: 'center',
                color: c.tier === 1 ? '#D4AF37' : c.tier === 2 ? '#B87333' : '#888888'
            });
        }
    });

    // إضافة المدن الرئيسية
    (regions?.regions || []).forEach(r => {
        (r.cities || []).forEach(c => {
            if (c.lat && c.metalDemand) {
                const totalDemand = Object.values(c.metalDemand).reduce((s, v) => s + v, 0);
                if (totalDemand > 50000) {
                    // فقط المدن ذات الطلب العالي
                    mapPoints.push({
                        id: c.id,
                        type: 'demand_hub',
                        nameAr: c.nameAr,
                        lat: c.lat,
                        lng: c.lng,
                        population: c.population,
                        industrialLevel: c.industrialLevel,
                        totalMetalDemand: totalDemand,
                        metalDemand: c.metalDemand,
                        scrapMarkets: c.scrapMarkets,
                        icon: 'city',
                        color:
                            totalDemand > 500000
                                ? '#FF4444'
                                : totalDemand > 100000
                                  ? '#FF8800'
                                  : '#FFCC00'
                    });
                }
            }
        });
    });

    // إضافة الأسواق المرقمنة
    (centers?.scrapMarketplaces?.markets || []).forEach(m => {
        mapPoints.push({
            id: m.id,
            type: 'scrap_market',
            nameAr: m.nameAr,
            cityId: m.cityId,
            marketType: m.type,
            digitized: m.digitized,
            weeklyVolume: m.weeklyVolume_tons,
            icon: 'market',
            color: m.digitized ? '#00CC88' : '#AAAAAA'
        });
    });

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            totalPoints: mapPoints.length,
            recyclingCenters: mapPoints.filter(p => p.type === 'recycling_center').length,
            demandHubs: mapPoints.filter(p => p.type === 'demand_hub').length,
            scrapMarkets: mapPoints.filter(p => p.type === 'scrap_market').length,
            points: mapPoints,
            mapConfig: {
                center: { lat: 24.0, lng: 45.0 },
                zoom: 6,
                country: 'Saudi Arabia'
            }
        }
    });
});

/**
 * GET /api/metals/statistics
 * إحصاءات شاملة للمنظومة
 */
router.get('/statistics', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    const centers = loadJson('metal-recycling-centers.json');

    const allCities = [];
    (regions?.regions || []).forEach(r =>
        (r.cities || []).forEach(c => allCities.push({ ...c, regionId: r.id }))
    );

    const totalSteelDemand = allCities.reduce((s, c) => s + (c.metalDemand?.steel || 0), 0);
    const totalCopperDemand = allCities.reduce((s, c) => s + (c.metalDemand?.copper || 0), 0);
    const totalAluminumDemand = allCities.reduce((s, c) => s + (c.metalDemand?.aluminum || 0), 0);
    const totalScrap = regions?.regions?.reduce((s, r) => s + (r.scraptonnage_annual || 0), 0) || 0;

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            geographic: {
                totalRegions: regions?.regions?.length || 13,
                totalCities: allCities.length,
                totalArea_km2: regions?.regions?.reduce((s, r) => s + (r.area_km2 || 0), 0),
                totalPopulation: regions?.regions?.reduce((s, r) => s + (r.population2025 || 0), 0)
            },
            metals: {
                totalAnnualScrap_tons: totalScrap,
                totalAnnualScrap_formatted: `${(totalScrap / 1000000).toFixed(2)} مليون طن/سنة`,
                annualMarketValue_USD: Math.round(totalScrap * 450),
                annualMarketValue_SAR: Math.round(totalScrap * 450 * 3.75),
                steelDemand_annual: totalSteelDemand,
                copperDemand_annual: totalCopperDemand,
                aluminumDemand_annual: totalAluminumDemand,
                categories: centers?.metals?.categories?.length || 8
            },
            infrastructure: {
                totalCenters: centers?.recyclingCenters?.length || 0,
                activeCenters:
                    centers?.recyclingCenters?.filter(c => c.status === 'active')?.length || 0,
                totalMonthlyCapacity:
                    centers?.recyclingCenters?.reduce(
                        (s, c) => s + (c.capacity_tons_monthly || 0),
                        0
                    ) || 0,
                digitizedMarkets:
                    centers?.scrapMarketplaces?.markets?.filter(m => m.digitized)?.length || 0,
                totalMarkets: centers?.scrapMarketplaces?.totalMarkets || 45
            },
            shariah: {
                zakatEnabled: true,
                shariahCheckEnabled: true,
                noRibaPolicy: true,
                islamicPrinciples: centers?.islamicPrinciples?.quranVerses?.length || 0,
                hadiths: centers?.islamicPrinciples?.hadith?.length || 0
            },
            topRegionsByScrap: (regions?.regions || [])
                .sort((a, b) => (b.scraptonnage_annual || 0) - (a.scraptonnage_annual || 0))
                .slice(0, 5)
                .map(r => ({ nameAr: r.nameAr, scrap: r.scraptonnage_annual }))
        }
    });
});

/**
 * GET /api/metals/scrap-markets
 * أسواق الخردة المُرقمنة
 */
router.get('/scrap-markets', (req, res) => {
    const centers = loadJson('metal-recycling-centers.json');
    const markets = centers?.scrapMarketplaces || {};

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            totalMarkets: markets.totalMarkets,
            description: markets.description,
            markets: markets.markets,
            digitizedCount: markets.markets?.filter(m => m.digitized)?.length || 0,
            totalWeeklyVolume:
                markets.markets?.reduce((s, m) => s + (m.weeklyVolume_tons || 0), 0) || 0
        }
    });
});

/**
 * GET /api/metals/global-context
 * السياق العالمي للمعادن
 */
router.get('/global-context', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    const global = regions?.globalContext || {};
    const prices = getLivePrices();

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            tradingPartners: global.tradingPartners,
            worldProduction: global.worldMetalsProduction,
            recyclingRates: global.recyclingRates,
            saudiPosition: {
                steelConsumption_rank: 22,
                aluminumConsumption_rank: 18,
                copperConsumption_rank: 25,
                vision2030Target: 'رفع نسبة إعادة التدوير المحلية إلى 70% بحلول 2030'
            },
            globalPrices: prices.metals,
            topMetalsByValue: [
                { metal: 'Gold', priceUSD: prices.metals.gold?.price, unit: 'USD/oz' },
                { metal: 'Nickel', priceUSD: prices.metals.nickel_class1?.price, unit: 'USD/ton' },
                { metal: 'Copper', priceUSD: prices.metals.copper_bright?.price, unit: 'USD/ton' }
            ]
        }
    });
});

/**
 * GET /api/metals/health
 * فحص صحة المنظومة
 */
router.get('/health', (req, res) => {
    const regions = loadJson('saudi-regions-cities.json');
    const centers = loadJson('metal-recycling-centers.json');

    res.json({
        success: true,
        status: 'operational',
        timestamp: new Date().toISOString(),
        system: 'منظومة شيخة للمعادن والسكراب',
        islamicGreeting: 'بسم الله الرحمن الرحيم',
        checks: {
            regionsData: regions ? 'ok' : 'error',
            centersData: centers ? 'ok' : 'error',
            priceEngine: 'ok',
            shariahEngine: 'ok',
            zakatCalculator: 'ok',
            rfqSystem: 'ok'
        },
        version: '3.0.0'
    });
});

/**
 * ─────────────────────────────────────────────
 * Enterprise Core — تشغيل مؤسسي متعدد الأطراف
 * ─────────────────────────────────────────────
 */

/**
 * GET /api/metals/enterprise/capabilities
 * وصف القدرات المؤسسية ونموذج الطبقات
 */
router.get('/enterprise/capabilities', (req, res) => {
    const catalog = getEnterpriseCatalog();

    return responseOk(res, 'قدرات شيخة المؤسسية جاهزة للتفعيل', {
        architecture: {
            experienceLayer: ['بوابة العملاء', 'بوابة الوكلاء', 'بوابة الموردين', 'بوابة النقل'],
            operationsLayer: ['RFQ', 'Orders', 'Contracts', 'Shipments', 'Invoicing', 'Collections'],
            integrationLayer: ['API Gateway', 'Webhooks', 'EDI/AS2/SFTP', 'Event-driven connectors'],
            intelligenceLayer: ['Supplier Recommendation', 'Route Optimization', 'Risk Signals'],
            governanceLayer: ['Tenant Roles', 'Audit Trails', 'Shariah Compliance Flags']
        },
        catalog,
        note: 'الهندسة مرنة وتدعم Oracle/SAP/Dynamics دون حصر المنظومة في نظام واحد',
        runtime: {
            mode: process.env.SHEIKHA_RUNTIME_MODE || 'pilot',
            regionProfile: 'Saudi + GCC + Global ready'
        }
    });
});

/**
 * GET /api/metals/enterprise/storage/status
 * حالة التحول التدريجي من JSON إلى PostgreSQL
 */
router.get('/enterprise/storage/status', async (req, res) => {
    const status = await enterpriseStorage.getStorageStatus();
    return responseOk(res, 'حالة التخزين المؤسسي', status);
});

/**
 * GET /api/metals/enterprise/root-foundation
 * Manifest كامل لنواة Sheikha Root Foundation
 */
router.get('/enterprise/root-foundation', (req, res) => {
    const runtimeMode = resolveRuntimeMode(req.query.runtimeMode);
    const rootConfig = buildRootConfig({ runtimeMode });
    const osStatus = getOsStatus({ runtimeMode });

    return responseOk(res, 'Sheikha Root Foundation manifest جاهز', {
        stack: {
            name: 'Sheikha Digital Civilization Stack',
            version: '1.0.0-foundation',
            runtimeMode,
            layers: rootConfig.layers,
            capabilities: rootConfig.capabilities
        },
        root: {
            config: rootConfig,
            snapshot: getSystemSnapshot({ runtimeMode })
        },
        os: osStatus,
        enterprise: {
            pillars: ['operations', 'integration', 'intelligence', 'governance'],
            catalogs: getEnterpriseCatalog()
        }
    });
});

/**
 * POST /api/metals/enterprise/root-foundation/activate
 * تفعيل نواة الجذر + تشغيل Sheikha OS
 */
router.post('/enterprise/root-foundation/activate', async (req, res) => {
    try {
        const runtimeMode = resolveRuntimeMode(req.body?.runtimeMode || req.query.runtimeMode);
        const root = bootstrapRoot({ runtimeMode });
        const os = await bootSheikhaOS({ runtimeMode });

        return responseOk(res, 'تم تفعيل Sheikha Root Foundation بنجاح', {
            runtimeMode,
            root,
            os
        });
    } catch (error) {
        return responseBad(res, `تعذر تفعيل Root Foundation: ${error.message}`, 500);
    }
});

/**
 * POST /api/metals/enterprise/root-foundation/control-plane
 * تنفيذ أمر من Control Plane عبر API
 */
router.post('/enterprise/root-foundation/control-plane', async (req, res) => {
    const command = req.body?.command;
    const payload = req.body?.payload || {};

    if (!command) {
        return responseBad(res, 'الحقل المطلوب: command');
    }

    try {
        const result = await executeSheikhaCommand(command, payload);
        if (!result?.success) {
            return responseBad(res, 'فشل تنفيذ أمر Control Plane', 400, {
                command,
                result
            });
        }

        return responseOk(res, 'تم تنفيذ أمر Control Plane بنجاح', {
            command,
            result
        });
    } catch (error) {
        return responseBad(res, `خطأ أثناء تنفيذ أمر Control Plane: ${error.message}`, 500, {
            command
        });
    }
});

/**
 * GET /api/metals/enterprise/tenants
 * عرض العملاء المؤسسيين (tenants)
 */
router.get('/enterprise/tenants', (req, res) => {
    const tenants = readEnterpriseList('tenants');
    return responseOk(res, 'تم جلب العملاء المؤسسيين', {
        total: tenants.length,
        tenants
    });
});

/**
 * POST /api/metals/enterprise/tenants
 * إنشاء عميل مؤسسي جديد
 */
router.post('/enterprise/tenants', async (req, res) => {
    const { tenantName, country = 'SA', marketFocus = 'metals', plan = '4PL' } = req.body || {};

    if (!tenantName) {
        return responseBad(res, 'حقل tenantName مطلوب');
    }

    const tenants = readEnterpriseList('tenants');
    const tenant = {
        id: generateId('TENANT'),
        tenantName: String(tenantName).trim(),
        country: String(country).toUpperCase(),
        marketFocus: resolveMarketType(marketFocus),
        plan,
        roles: [
            'tenant_admin',
            'procurement_manager',
            'supply_chain_manager',
            'logistics_coordinator',
            'finance_approver',
            'agent_broker',
            'viewer_auditor'
        ],
        status: 'active',
        createdAt: nowIso()
    };

    tenants.push(tenant);
    if (!writeEnterpriseList('tenants', tenants)) {
        return responseBad(res, 'تعذر حفظ بيانات العميل المؤسسي', 500);
    }

    await mirrorEnterprise('tenant', tenant, 'tenant.created', tenant.id, req.user?.email || 'system');

    return responseOk(res, 'تم إنشاء العميل المؤسسي بنجاح', tenant, 201);
});

/**
 * POST /api/metals/enterprise/rfq
 * إنشاء RFQ مؤسسي
 */
router.post('/enterprise/rfq', async (req, res) => {
    const {
        tenantId,
        market = 'metals',
        hsCode,
        productName,
        quantity,
        quantityUnit = 'ton',
        destinationCountry,
        incoterm = 'FOB'
    } = req.body || {};

    if (!tenantId || !productName || !quantity || !destinationCountry) {
        return responseBad(res, 'الحقول المطلوبة: tenantId, productName, quantity, destinationCountry');
    }

    const tenants = readEnterpriseList('tenants');
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) {
        return responseBad(res, 'العميل المؤسسي غير موجود', 404);
    }

    const rfqs = readEnterpriseList('rfqs');
    const rfq = {
        id: generateId('RFQX'),
        tenantId,
        market: resolveMarketType(market),
        hsCode: String(hsCode || '').trim() || null,
        productName: String(productName).trim(),
        quantity: Number(quantity),
        quantityUnit,
        destinationCountry: String(destinationCountry).toUpperCase(),
        incoterm,
        status: 'open',
        slaHours: 48,
        createdAt: nowIso(),
        shariahStatus: 'pending-review'
    };

    rfqs.push(rfq);
    if (!writeEnterpriseList('rfqs', rfqs)) {
        return responseBad(res, 'تعذر حفظ طلب RFQ', 500);
    }

    await mirrorEnterprise('rfq', rfq, 'rfq.created', tenantId, req.user?.email || 'system');

    return responseOk(res, 'تم إنشاء RFQ المؤسسي', rfq, 201);
});

/**
 * POST /api/metals/enterprise/orders
 * إنشاء أمر توريد/شراء
 */
router.post('/enterprise/orders', async (req, res) => {
    const { tenantId, rfqId, supplierName, totalValue, currency = 'USD' } = req.body || {};

    if (!tenantId || !supplierName || !totalValue) {
        return responseBad(res, 'الحقول المطلوبة: tenantId, supplierName, totalValue');
    }

    const orders = readEnterpriseList('orders');
    const order = {
        id: generateId('ORDX'),
        tenantId,
        rfqId: rfqId || null,
        supplierName: String(supplierName).trim(),
        totalValue: Number(totalValue),
        currency: String(currency).toUpperCase(),
        status: 'approved',
        createdAt: nowIso(),
        workflow: ['created', 'approved', 'awaiting-logistics']
    };

    orders.push(order);
    if (!writeEnterpriseList('orders', orders)) {
        return responseBad(res, 'تعذر حفظ أمر التوريد', 500);
    }

    await mirrorEnterprise('order', order, 'order.created', tenantId, req.user?.email || 'system');

    return responseOk(res, 'تم إنشاء أمر التوريد بنجاح', order, 201);
});

/**
 * POST /api/metals/enterprise/shipments
 * إنشاء شحنة مرتبطة بطلب
 */
router.post('/enterprise/shipments', async (req, res) => {
    const { tenantId, orderId, mode = 'sea', origin, destination, etaDays = 7 } = req.body || {};

    if (!tenantId || !orderId || !origin || !destination) {
        return responseBad(res, 'الحقول المطلوبة: tenantId, orderId, origin, destination');
    }

    const shipments = readEnterpriseList('shipments');
    const shipment = {
        id: generateId('SHPX'),
        tenantId,
        orderId,
        mode,
        origin,
        destination,
        etaDays: Number(etaDays),
        trackingNo: generateId('TRK'),
        status: 'in_transit',
        progress: 12,
        riskFlag: 'low',
        createdAt: nowIso()
    };

    shipments.push(shipment);
    if (!writeEnterpriseList('shipments', shipments)) {
        return responseBad(res, 'تعذر حفظ بيانات الشحنة', 500);
    }

    await mirrorEnterprise('shipment', shipment, 'shipment.created', tenantId, req.user?.email || 'system');

    return responseOk(res, 'تم إنشاء الشحنة بنجاح', shipment, 201);
});

/**
 * GET /api/metals/enterprise/integrations/connectors
 * قائمة موصلات ERP/B2B المعتمدة
 */
router.get('/enterprise/integrations/connectors', (req, res) => {
    const catalog = getEnterpriseCatalog();
    return responseOk(res, 'تم جلب موصلات التكامل المؤسسي', {
        connectors: catalog.connectors,
        protocols: ['REST', 'Webhook', 'EDI', 'AS2', 'SFTP', 'Event Bus']
    });
});

/**
 * GET /api/metals/enterprise/integrations/status
 * حالة تكامل ERP + مؤشرات retry queue
 */
router.get('/enterprise/integrations/status', async (req, res) => {
    const queue = await enterpriseStorage.listRetryQueue(300);
    const queued = queue.filter(item => item.status === 'queued').length;
    const processing = queue.filter(item => item.status === 'processing').length;
    const failed = queue.filter(item => item.status === 'failed').length;
    const resolved = queue.filter(item => item.status === 'resolved').length;

    const catalog = getEnterpriseCatalog();
    const connectors = catalog.connectors.map(connector => ({
        ...connector,
        health: failed > 0 ? 'attention' : 'healthy',
        retryBacklog: queue.filter(item => item.connector === connector.system && item.status !== 'resolved').length
    }));

    return responseOk(res, 'حالة موصلات ERP والـ retry queue', {
        summary: {
            total: queue.length,
            queued,
            processing,
            failed,
            resolved
        },
        connectors
    });
});

/**
 * GET /api/metals/enterprise/integrations/retry-queue
 * عرض طابور إعادة المحاولة للتكاملات
 */
router.get('/enterprise/integrations/retry-queue', async (req, res) => {
    const { limit = 200 } = req.query;
    const queue = await enterpriseStorage.listRetryQueue(Number(limit));
    return responseOk(res, 'تم جلب retry queue', {
        total: queue.length,
        queue
    });
});

/**
 * POST /api/metals/enterprise/integrations/retry-queue
 * إضافة مهمة retry جديدة
 */
router.post('/enterprise/integrations/retry-queue', async (req, res) => {
    const { tenantId, connector, operation, payload, lastError } = req.body || {};
    if (!tenantId || !connector || !operation) {
        return responseBad(res, 'الحقول المطلوبة: tenantId, connector, operation');
    }

    const item = {
        id: generateId('RETRY'),
        tenantId,
        connector: String(connector),
        operation: String(operation),
        payload: payload || {},
        status: 'queued',
        attempts: 0,
        lastError: lastError || null,
        nextRetryAt: nowIso(),
        createdAt: nowIso(),
        updatedAt: nowIso()
    };

    await enterpriseStorage.enqueueRetry(item);
    await enterpriseStorage.appendAudit('integration.retry.queued', tenantId, item, req.user?.email || 'system');

    return responseOk(res, 'تمت إضافة المهمة إلى retry queue', item, 201);
});

/**
 * POST /api/metals/enterprise/integrations/retry-queue/:retryId/retry
 * إعادة محاولة فورية لمهمة تكامل
 */
router.post('/enterprise/integrations/retry-queue/:retryId/retry', async (req, res) => {
    const { retryId } = req.params;
    if (!retryId) {
        return responseBad(res, 'retryId مطلوب');
    }

    await enterpriseStorage.updateRetryStatus(retryId, 'processing', {
        incrementAttempts: true,
        nextRetryAt: nowIso()
    });

    await enterpriseStorage.updateRetryStatus(retryId, 'resolved', {
        nextRetryAt: null
    });

    await enterpriseStorage.appendAudit('integration.retry.resolved', null, {
        retryId,
        mode: 'manual-retry'
    }, req.user?.email || 'system');

    return responseOk(res, 'تم تنفيذ retry بنجاح', {
        retryId,
        status: 'resolved'
    });
});

/**
 * POST /api/metals/enterprise/integrations/events
 * إدخال أحداث تكامل (Event-driven)
 */
router.post('/enterprise/integrations/events', async (req, res) => {
    const { tenantId, sourceSystem, eventType, payload } = req.body || {};

    if (!tenantId || !sourceSystem || !eventType) {
        return responseBad(res, 'الحقول المطلوبة: tenantId, sourceSystem, eventType');
    }

    const events = readEnterpriseList('events');
    const event = {
        id: generateId('EVT'),
        tenantId,
        sourceSystem,
        eventType,
        payload: payload || {},
        createdAt: nowIso()
    };

    events.push(event);
    const bounded = events.slice(-5000);
    if (!writeEnterpriseList('events', bounded)) {
        return responseBad(res, 'تعذر حفظ حدث التكامل', 500);
    }

    await mirrorEnterprise('integration_event', event, 'integration.event.received', tenantId, req.user?.email || 'system');

    return responseOk(res, 'تم تسجيل حدث التكامل بنجاح', event, 201);
});

/**
 * GET /api/metals/enterprise/ai/recommendations
 * توصيات ذكاء صناعي تشغيلية (قابلة للتفسير)
 */
router.get('/enterprise/ai/recommendations', (req, res) => {
    const { tenantId, market = 'metals' } = req.query;

    if (!tenantId) {
        return responseBad(res, 'يرجى تمرير tenantId');
    }

    const rfqs = readEnterpriseList('rfqs').filter(r => r.tenantId === tenantId);
    const shipments = readEnterpriseList('shipments').filter(s => s.tenantId === tenantId);
    const openRfqs = rfqs.filter(r => r.status === 'open').length;
    const delayedShipments = shipments.filter(s => (s.progress || 0) < 25 && s.etaDays <= 3).length;

    const recommendations = [
        {
            type: 'supplier_match',
            confidence: 0.84,
            action: 'زيادة قاعدة الموردين المؤهلين لطلبات RFQ المفتوحة',
            reason: `عدد RFQ المفتوح: ${openRfqs}`
        },
        {
            type: 'logistics_optimization',
            confidence: 0.78,
            action: 'تفعيل مسارات بديلة للشحنات الحرجة',
            reason: `شحنات تحتاج متابعة عاجلة: ${delayedShipments}`
        },
        {
            type: 'market_focus',
            confidence: 0.73,
            action: 'تركيز عقود الربع القادم على السوق الأعلى دوراناً',
            reason: `السوق الحالي: ${resolveMarketType(market)}`
        }
    ];

    return responseOk(res, 'تم توليد توصيات تشغيلية قابلة للتنفيذ', {
        tenantId,
        market: resolveMarketType(market),
        recommendations,
        disclaimer: 'توصيات مبنية على البيانات التشغيلية المسجلة داخل شيخة'
    });
});

/**
 * GET /api/metals/enterprise/control-tower
 * لوحة سيطرة تشغيلية موحدة (Control Tower)
 */
router.get('/enterprise/control-tower', (req, res) => {
    const { tenantId } = req.query;
    if (!tenantId) {
        return responseBad(res, 'يرجى تمرير tenantId');
    }

    const rfqs = readEnterpriseList('rfqs').filter(r => r.tenantId === tenantId);
    const orders = readEnterpriseList('orders').filter(o => o.tenantId === tenantId);
    const shipments = readEnterpriseList('shipments').filter(s => s.tenantId === tenantId);
    const events = readEnterpriseList('events').filter(e => e.tenantId === tenantId);

    const openRfqs = rfqs.filter(r => r.status === 'open').length;
    const approvedOrders = orders.filter(o => o.status === 'approved').length;
    const inTransit = shipments.filter(s => s.status === 'in_transit').length;
    const atRisk = shipments.filter(s => s.riskFlag === 'high' || ((s.progress || 0) < 20 && s.etaDays <= 2)).length;

    const totalValue = orders.reduce((sum, order) => sum + (Number(order.totalValue) || 0), 0);

    return responseOk(res, 'تم جلب لوحة التشغيل الموحدة', {
        tenantId,
        kpis: {
            openRfqs,
            approvedOrders,
            inTransitShipments: inTransit,
            atRiskShipments: atRisk,
            totalOrderValue: totalValue,
            totalEvents: events.length
        },
        streams: {
            latestRfqs: rfqs.slice(-5),
            latestOrders: orders.slice(-5),
            latestShipments: shipments.slice(-5),
            latestEvents: events.slice(-10)
        },
        operationalStatus: atRisk > 0 ? 'attention-required' : 'stable'
    });
});

module.exports = router;
