#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const configDir = path.join(root, 'config');
const dataDir = path.join(root, 'data');
const reportsDir = path.join(root, 'reports/architecture');

[dataDir, reportsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const globalConfig = readJson('sheikha-global-country-classifications.json');
const g20Config = readJson('sheikha-g20-integration.json');
const registry = readJson('sheikha-world-country-registry.json');
const unifiedNetwork = readProjectJson(
    path.join(dataDir, 'sheikha-global-unified-network-analysis.json')
);

const aliasMap = {
    مغرب: 'المغرب',
    المكسيكو: 'المكسيك',
    نمسا: 'النمسا',
    السويس: 'سويسرا',
    'كندا، إندونيسيا': ['كندا', 'إندونيسيا'],
    UK: 'بريطانيا',
    USA: 'الولايات المتحدة'
};

const countryToContinent = buildCountryToContinent(registry.continents || {});
const allCountries = Object.keys(countryToContinent);
const years = [2023, 2024, 2025, 2026];
const currentMonth = new Date().toISOString().slice(0, 7);

const categoryMaps = buildCategoryMaps(globalConfig.classificationDimensions || {});
const conflictHotspots = new Set([
    'أفغانستان',
    'اليمن',
    'سوريا',
    'السودان',
    'جنوب السودان',
    'الصومال',
    'مالي',
    'بوركينا فاسو',
    'تشاد',
    'ليبيا',
    'أوكرانيا',
    'هايتي',
    'ميانمار',
    'جمهورية الكونغو الديمقراطية'
]);
const sanctionsPressure = new Set(['إيران', 'سوريا', 'روسيا', 'كوريا الشمالية', 'فنزويلا', 'كوبا']);
const climateStress = new Set([
    'النيجر',
    'تشاد',
    'الصومال',
    'موريتانيا',
    'مالي',
    'السودان',
    'إثيوبيا',
    'كينيا',
    'بنغلاديش',
    'باكستان',
    'اليمن',
    'مدغشقر',
    'موزمبيق',
    'فيجي',
    'توفالو',
    'فانواتو'
]);
const debtDependency = new Set([
    'الأرجنتين',
    'لبنان',
    'سريلانكا',
    'زامبيا',
    'غانا',
    'باكستان',
    'مصر',
    'تونس',
    'كينيا',
    'الإكوادور'
]);

const wealthDefaults = {
    africa: 32,
    asia: 52,
    europe: 78,
    americas: 58,
    oceania: 63
};
const educationDefaults = {
    africa: 38,
    asia: 58,
    europe: 82,
    americas: 64,
    oceania: 68
};
const technologyDefaults = {
    africa: 32,
    asia: 62,
    europe: 78,
    americas: 66,
    oceania: 61
};
const innovationDefaults = {
    africa: 28,
    asia: 58,
    europe: 76,
    americas: 61,
    oceania: 55
};
const supplyDefaults = {
    africa: 34,
    asia: 68,
    europe: 71,
    americas: 59,
    oceania: 48
};
const continentPopulationRangesMillions = {
    africa: [1, 220],
    asia: [1, 1450],
    europe: [0.4, 150],
    americas: [0.1, 350],
    oceania: [0.01, 30]
};

const countryProfiles = allCountries
    .map(country => buildCountryProfile(country))
    .sort((a, b) => b.accelerationIndex - a.accelerationIndex);

const povertyExtremes = [...countryProfiles].sort((a, b) => b.povertyIndex - a.povertyIndex);
const justiceLeaders = [...countryProfiles].sort(
    (a, b) => b.shariaMarketJusticeIndex - a.shariaMarketJusticeIndex
);
const countryProfileMap = new Map(countryProfiles.map(profile => [profile.countryAr, profile]));

const networkDashboard = buildNetworkDashboard(unifiedNetwork, countryProfileMap, currentMonth);
const communityPovertyMatrix = buildCommunityPovertyMatrix();
const individualPovertyArchetypes = buildIndividualPovertyArchetypes();
const redesignBlueprint = buildRedesignBlueprint();
const islamicPovertyKnowledgeBase = buildIslamicPovertyKnowledgeBase();
const globalAggregates = buildGlobalAggregates(countryProfiles);

const fullSpectrum = {
    program: 'SHEIKHA_GLOBAL_FULL_SPECTRUM_ANALYSIS',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    currentMonth,
    ethics: {
        covenantBasis: 'الكتاب والسنة',
        propheticMeasure: 'لا تنظروا إلى من هو فوقكم، وانظروا إلى من هو دونكم',
        designObjective: 'رفع الفقر، نصر المحتاج، تكافؤ الفرص، عدالة السوق، ومنع الاحتكار والظلم'
    },
    summary: {
        totalCountries: countryProfiles.length,
        totalNetworks: Array.isArray(unifiedNetwork?.resourceNetworks)
            ? unifiedNetwork.resourceNetworks.length
            : 0,
        totalActorFamilies: Object.keys(unifiedNetwork?.actorNetworks || {}).length,
        topAccelerationCountry: countryProfiles[0]?.countryAr || null,
        highestPovertyCountry: povertyExtremes[0]?.countryAr || null,
        topJusticeCountry: justiceLeaders[0]?.countryAr || null
    },
    globalAggregates,
    islamicPovertyKnowledgeBase,
    countryProfiles,
    annualLeaderboards: {
        accelerationTop20: countryProfiles.slice(0, 20).map(minifyCountryProfile),
        povertyRiskTop20: povertyExtremes.slice(0, 20).map(minifyCountryProfile),
        justiceTop20: justiceLeaders.slice(0, 20).map(minifyCountryProfile)
    },
    networkDashboard,
    communityPovertyMatrix,
    individualPovertyArchetypes,
    redesignBlueprint
};

const jsonOut = path.join(dataDir, 'sheikha-global-full-spectrum-analysis.json');
const dashboardOut = path.join(dataDir, 'sheikha-global-monthly-network-dashboard.json');
const reportOut = path.join(reportsDir, 'sheikha-global-full-spectrum-analysis-report.md');

fs.writeFileSync(jsonOut, JSON.stringify(fullSpectrum, null, 2));
fs.writeFileSync(dashboardOut, JSON.stringify(networkDashboard, null, 2));
fs.writeFileSync(reportOut, renderMarkdown(fullSpectrum));

console.log('🌍 === Sheikha Global Full Spectrum Activation ===');
console.log(`✅ Countries analyzed: ${fullSpectrum.summary.totalCountries}`);
console.log(`✅ Top acceleration: ${fullSpectrum.summary.topAccelerationCountry}`);
console.log(`✅ Highest poverty index: ${fullSpectrum.summary.highestPovertyCountry}`);
console.log(`✅ Top justice index: ${fullSpectrum.summary.topJusticeCountry}`);
console.log(`✅ Saved: ${path.relative(root, jsonOut)}`);
console.log(`✅ Saved: ${path.relative(root, dashboardOut)}`);
console.log(`✅ Saved: ${path.relative(root, reportOut)}`);

function readJson(relativePath, directPath = false) {
    const filePath = directPath
        ? path.join(root, relativePath)
        : path.join(configDir, relativePath);
    if (!fs.existsSync(filePath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readProjectJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildCountryToContinent(continents) {
    const map = {};
    Object.entries(continents).forEach(([continent, countries]) => {
        countries.forEach(country => {
            map[country] = continent;
        });
    });
    return map;
}

function normalizeCountryName(name) {
    if (typeof name !== 'string') {
        return [];
    }

    const pieces = name
        .split(/[،,]/)
        .map(piece => piece.trim())
        .filter(Boolean);
    const output = [];

    pieces.forEach(piece => {
        const alias = aliasMap[piece] || piece;
        if (Array.isArray(alias)) {
            alias.forEach(item => output.push(item));
            return;
        }
        output.push(alias);
    });

    return output;
}

function buildCategoryMaps(dimensions) {
    return {
        wealth: buildMembershipMap(dimensions.wealth?.tiers || []),
        education: buildMembershipMap(dimensions.education?.tiers || []),
        technology: buildMembershipMap(dimensions.technology?.tiers || []),
        supplyChain: buildMembershipMap(dimensions.supplyChain?.roles || []),
        industry: buildMembershipMap(dimensions.industry?.industrialSegments || []),
        energy: buildMembershipMap(dimensions.energy?.energyTypes || []),
        mediaInfluence: buildMembershipMap(dimensions.mediaInfluence?.influenceTiers || []),
        innovation: buildMembershipMap(dimensions.innovation?.innovationIndexes || []),
        naturalResources: buildMembershipMap(dimensions.naturalResources?.resourceTypes || []),
        religion: buildMembershipMap(dimensions.religion?.majorReligions || [])
    };
}

function buildMembershipMap(items) {
    const map = new Map();

    items.forEach(item => {
        const names = collectCountryNames(item);
        names.forEach(country => {
            map.set(country, item.id || item.nameAr || 'unknown');
        });
    });

    return map;
}

function collectCountryNames(item) {
    const found = new Set();
    const candidateKeys = [
        'examples',
        'countries',
        'topProducers',
        'producers',
        'keyCountries',
        'englishKeyCountries'
    ];

    candidateKeys.forEach(key => {
        const value = item[key];
        if (!Array.isArray(value)) {
            return;
        }

        value.forEach(entry => {
            if (typeof entry !== 'string') {
                return;
            }
            if (/[A-Za-z]{3,}/.test(entry)) {
                return;
            }
            normalizeCountryName(entry).forEach(country => found.add(country));
        });
    });

    return [...found].filter(country => countryToContinent[country]);
}

function findCategoryScore(country, categoryName, defaultScore) {
    const membership = categoryMaps[categoryName]?.get(country);
    if (!membership) {
        return defaultScore;
    }

    const scoreTables = {
        wealth: {
            'high-income': 92,
            'upper-middle-income': 70,
            'lower-middle-income': 45,
            'low-income': 22
        },
        education: {
            'tier-1-education': 90,
            'tier-2-education': 64,
            'tier-3-education': 32
        },
        technology: {
            'tech-leaders': 93,
            'tech-advanced': 78,
            'tech-emerging': 58,
            'tech-developing': 31
        },
        supplyChain: {
            'supply-chain-hub': 86,
            'raw-material-suppliers': 61,
            'manufacturing-hubs': 74,
            'technology-suppliers': 89
        },
        industry: {
            'advanced-manufacturing': 88,
            'mass-manufacturing': 74,
            petrochemical: 70,
            'pharmaceutical-biotech': 84
        },
        energy: {
            'fossil-fuel-producer': 72,
            'renewable-energy-leader': 82,
            'nuclear-energy': 77,
            'energy-importer': 36
        },
        mediaInfluence: {
            'global-media-power': 90,
            'regional-media-power': 68,
            'emerging-media': 48
        },
        innovation: {
            'innovation-leaders': 94,
            'innovation-performers': 78,
            'emerging-innovators': 56,
            'innovation-potential': 34
        },
        naturalResources: {
            'oil-gas-rich': 82,
            'minerals-metals': 74,
            agricultural: 66,
            'forest-water': 63,
            'marine-resources': 61
        },
        religion: {
            islam: 62,
            christianity: 58,
            hinduism: 55,
            buddhism: 57,
            secular: 60
        }
    };

    return scoreTables[categoryName]?.[membership] ?? defaultScore;
}

function buildCountryProfile(country) {
    const continent = countryToContinent[country];
    const wealthScore = findCategoryScore(country, 'wealth', wealthDefaults[continent]);
    const educationScore = findCategoryScore(country, 'education', educationDefaults[continent]);
    const technologyScore = findCategoryScore(country, 'technology', technologyDefaults[continent]);
    const innovationScore = findCategoryScore(country, 'innovation', innovationDefaults[continent]);
    const industryScore = findCategoryScore(country, 'industry', technologyScore - 4);
    const supplyChainScore = findCategoryScore(country, 'supplyChain', supplyDefaults[continent]);
    const energyScore = findCategoryScore(country, 'energy', 52);
    const mediaScore = findCategoryScore(country, 'mediaInfluence', 42);
    const resourceScore = findCategoryScore(country, 'naturalResources', 48);
    const religionContextScore = findCategoryScore(country, 'religion', 58);

    const accelerationIndex = clamp(
        Math.round(
            wealthScore * 0.25 +
                technologyScore * 0.2 +
                innovationScore * 0.15 +
                industryScore * 0.15 +
                supplyChainScore * 0.1 +
                educationScore * 0.1 +
                energyScore * 0.05
        )
    );

    const vulnerabilityBase =
        100 -
        Math.round(
            wealthScore * 0.33 +
                educationScore * 0.22 +
                technologyScore * 0.15 +
                supplyChainScore * 0.1 +
                resourceScore * 0.1 +
                energyScore * 0.1
        );

    const conflictPenalty = conflictHotspots.has(country) ? 18 : 0;
    const sanctionsPenalty = sanctionsPressure.has(country) ? 8 : 0;
    const climatePenalty = climateStress.has(country) ? 10 : 0;
    const debtPenalty = debtDependency.has(country) ? 8 : 0;
    const povertyIndex = clamp(
        vulnerabilityBase + conflictPenalty + sanctionsPenalty + climatePenalty + debtPenalty
    );

    const shariaMarketJusticeIndex = clamp(
        Math.round(
            educationScore * 0.22 +
                (100 - povertyIndex) * 0.28 +
                supplyChainScore * 0.15 +
                resourceScore * 0.1 +
                technologyScore * 0.1 +
                religionContextScore * 0.05 +
                mediaScore * 0.1
        )
    );

    const rootCauses = buildRootCauses({
        country,
        wealthScore,
        educationScore,
        technologyScore,
        supplyChainScore,
        energyScore,
        resourceScore,
        povertyIndex,
        conflictPenalty,
        sanctionsPenalty,
        climatePenalty,
        debtPenalty
    });
    const socioEconomicStats = buildSocioEconomicStats({
        country,
        continent,
        accelerationIndex,
        povertyIndex,
        educationScore,
        technologyScore,
        wealthScore,
        supplyChainScore
    });
    const interventionScenario = buildInterventionScenario(
        {
            country,
            povertyIndex,
            accelerationIndex,
            justiceIndex: shariaMarketJusticeIndex,
            educationScore,
            technologyScore,
            wealthScore
        },
        rootCauses,
        socioEconomicStats
    );

    return {
        countryAr: country,
        continentAr: translateContinent(continent),
        memberships: {
            wealth: categoryMaps.wealth.get(country) || 'default',
            education: categoryMaps.education.get(country) || 'default',
            technology: categoryMaps.technology.get(country) || 'default',
            supplyChain: categoryMaps.supplyChain.get(country) || 'default',
            industry: categoryMaps.industry.get(country) || 'default',
            energy: categoryMaps.energy.get(country) || 'default',
            mediaInfluence: categoryMaps.mediaInfluence.get(country) || 'default',
            innovation: categoryMaps.innovation.get(country) || 'default',
            naturalResources: categoryMaps.naturalResources.get(country) || 'default'
        },
        indexes: {
            wealthScore,
            educationScore,
            technologyScore,
            innovationScore,
            industryScore,
            supplyChainScore,
            energyScore,
            mediaScore,
            resourceScore
        },
        accelerationIndex,
        povertyIndex,
        shariaMarketJusticeIndex,
        socioEconomicStats,
        annualIndicators: buildAnnualIndicators(
            accelerationIndex,
            povertyIndex,
            shariaMarketJusticeIndex
        ),
        rootCauseAnalysis: rootCauses,
        redesignPriorities: buildRedesignPriorities(rootCauses),
        interventionScenario
    };
}

function hashString(value) {
    const input = String(value || '');
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = Math.trunc((hash << 5) - hash + (input.codePointAt(i) || 0));
    }
    return Math.abs(hash);
}

function estimatePopulationMillions(country, continent) {
    const [min, max] = continentPopulationRangesMillions[continent] || [0.2, 40];
    const seed = hashString(country);
    const ratio = (seed % 10000) / 10000;
    const estimated = min + (max - min) * ratio;
    return Number(estimated.toFixed(2));
}

function buildSocioEconomicStats(input) {
    const populationMillions = estimatePopulationMillions(input.country, input.continent);
    const population = Math.round(populationMillions * 1000000);

    const laborForceParticipationRate = clamp(
        Math.round(42 + input.educationScore * 0.32 + input.technologyScore * 0.08)
    );
    const unemploymentRate = clamp(
        Math.round(4 + (input.povertyIndex * 0.28 - input.accelerationIndex * 0.12)),
        2,
        45
    );
    const employmentRate = clamp(100 - unemploymentRate, 55, 98);
    const employed = Math.round(
        population * (laborForceParticipationRate / 100) * (employmentRate / 100)
    );
    const unemployed = Math.round(population * (laborForceParticipationRate / 100) - employed);

    const traderShare = clamp(2 + Math.round(input.supplyChainScore / 8), 1, 18);
    const traders = Math.round(population * (traderShare / 100));

    const educatedRate = clamp(Math.round(input.educationScore * 0.85 + 8), 18, 99);
    const educated = Math.round(population * (educatedRate / 100));

    const debtToGdpPercent = clamp(
        Math.round(24 + input.povertyIndex * 0.9 - input.wealthScore * 0.28),
        5,
        220
    );
    const householdLoanBurdenPercent = clamp(
        Math.round(8 + input.povertyIndex * 0.5 + input.technologyScore * 0.08),
        3,
        75
    );

    const aidNeedRate = clamp(Math.round(4 + input.povertyIndex * 0.52), 1, 70);
    const registeredForAid = Math.round(population * (aidNeedRate / 100));
    const aidCoverageRate = clamp(
        Math.round(76 - input.povertyIndex * 0.35 + input.wealthScore * 0.12),
        15,
        96
    );
    const assistedPeople = Math.round(registeredForAid * (aidCoverageRate / 100));
    const notAssistedPeople = Math.max(0, registeredForAid - assistedPeople);

    const aidAmountUsd = Math.round(assistedPeople * (220 + input.wealthScore * 1.8));
    const charityOrganizations = clamp(
        Math.round(12 + populationMillions * 0.45 + input.educationScore * 0.22),
        4,
        1200
    );

    return {
        population,
        laborForceParticipationRate,
        employmentRate,
        unemploymentRate,
        employed,
        unemployed,
        traders,
        educated,
        educatedRate,
        debtToGdpPercent,
        householdLoanBurdenPercent,
        aidAmountUsd,
        assistedPeople,
        registeredForAid,
        notAssistedPeople,
        charityOrganizations,
        reasonsNotWorking: inferReasonsNotWorking(input)
    };
}

function inferReasonsNotWorking(input) {
    const reasons = [];
    if (input.povertyIndex > 65) reasons.push('غياب فرص العمل الكافية');
    if (input.educationScore < 45) reasons.push('فجوة المهارات والتدريب');
    if (input.technologyScore < 40) reasons.push('ضعف الوصول للوظائف الرقمية');
    if (conflictHotspots.has(input.country)) reasons.push('النزاعات وعدم الاستقرار');
    if (climateStress.has(input.country)) reasons.push('تأثيرات مناخية على الدخل والإنتاج');
    if (debtDependency.has(input.country)) reasons.push('عبء الديون الأسرية أو السيادية');
    if (reasons.length === 0) reasons.push('تحولات سوق العمل والحاجة لإعادة تأهيل');
    return reasons;
}

function buildInterventionScenario(context, rootCauses, stats) {
    const topAxes = new Set(rootCauses.map(item => item.axis));
    const immediate = [];
    const medium = [];
    const annual = [];

    if (topAxes.has('conflict')) {
        immediate.push('إغاثة عاجلة غذاء/دواء/مأوى مع حماية مدنية');
        medium.push('استعادة الخدمات الأساسية والبنية المحلية');
        annual.push('مسار استقرار وتحكيم وعدالة انتقالية');
    }
    if (topAxes.has('income') || topAxes.has('trade')) {
        immediate.push('برنامج تحويل نقدي مشروط للأسر الأشد حاجة');
        medium.push('مشروعات إنتاجية صغيرة وربط بالسوق');
        annual.push('توسيع سلاسل القيمة المحلية والتصدير العادل');
    }
    if (topAxes.has('education') || topAxes.has('technology')) {
        immediate.push('منح تدريب مهني سريع للفئات العاطلة');
        medium.push('مسارات مهارات رقمية وحرفية مع توظيف');
        annual.push('رفع إنتاجية العمل عبر التعليم المستمر');
    }
    if (topAxes.has('debt')) {
        immediate.push('مراجعة الدين عالي المخاطر للأسر الفقيرة');
        medium.push('إعادة هيكلة الديون إلى تمويل إنتاجي');
        annual.push('حماية تنظيمية ضد الإقراض الجائر');
    }
    if (topAxes.has('climate') || topAxes.has('resources') || topAxes.has('energy')) {
        immediate.push('حزم أمن غذائي ومائي ومساندة دخل');
        medium.push('مشروعات تكيف مناخي وطاقة محلية');
        annual.push('بنية مستدامة تقلل صدمات الفقر مستقبلاً');
    }
    if (!immediate.length) immediate.push('تحسين الاستهداف الاجتماعي وتقليل الهدر');
    if (!medium.length) medium.push('رفع كفاءة الإنفاق العام والعدالة في الوصول للخدمات');
    if (!annual.length) annual.push('رفع مؤشر العدالة السوقية الشرعية سنويًا');

    const monthlyBudgetUsd = Math.round((stats.aidAmountUsd * 0.35) / 12);
    const yearlyBudgetUsd = Math.round(stats.aidAmountUsd * 1.25);

    return {
        immediateActions: immediate.slice(0, 4),
        mediumTermActions: medium.slice(0, 4),
        annualTransformationActions: annual.slice(0, 4),
        targetKpis: {
            unemploymentRateTarget: clamp(stats.unemploymentRate - 3, 2, 40),
            povertyIndexTarget: clamp(context.povertyIndex - 6, 0, 100),
            justiceIndexTarget: clamp(context.justiceIndex + 5, 0, 100),
            assistedPeopleTarget: Math.round(stats.assistedPeople * 1.15)
        },
        budgetUsd: {
            monthly: monthlyBudgetUsd,
            yearly: yearlyBudgetUsd
        }
    };
}

function buildIslamicPovertyKnowledgeBase() {
    return {
        quranReferences: [
            {
                source: 'سورة الحشر 59:7',
                theme: 'منع تمركز المال',
                insight: 'كي لا يكون المال دولة بين الأغنياء فقط'
            },
            {
                source: 'سورة البقرة 2:177',
                theme: 'الإنفاق على المحتاجين',
                insight: 'إيتاء المال على حبه لذوي القربى واليتامى والمساكين وابن السبيل'
            },
            {
                source: 'سورة التوبة 9:60',
                theme: 'مصارف الزكاة',
                insight: 'توجيه منظم لدعم الفقراء والمساكين والغارمين'
            },
            {
                source: 'سورة الذاريات 51:19',
                theme: 'حق الفقير والمحروم',
                insight: 'اعتبار نصيب المحتاج حقًا معلومًا'
            }
        ],
        sunnahReferences: [
            {
                source: 'صحيح البخاري ومسلم',
                theme: 'مقارنة النعم بمن دونك',
                insight: 'انظروا إلى من هو أسفل منكم ولا تنظروا إلى من هو فوقكم'
            },
            {
                source: 'متفق عليه',
                theme: 'التكافل',
                insight: 'مثل المؤمنين في توادهم وتراحمهم وتعاطفهم كمثل الجسد الواحد'
            },
            {
                source: 'سنن ابن ماجه',
                theme: 'منع الضرر',
                insight: 'لا ضرر ولا ضرار'
            }
        ],
        mappedRootCauses: [
            { cause: 'الاحتكار وتمركز المال', policy: 'عدالة سوقية وتوزيع فرص وتمويل إنتاجي' },
            { cause: 'الديون المرهقة', policy: 'إغاثة الغارمين وإعادة هيكلة عادلة' },
            { cause: 'ضعف التكافل المؤسسي', policy: 'شبكات زكاة ووقف وتمكين مهني' },
            { cause: 'تعطل العمل المنتج', policy: 'تشغيل وتدريب وربط مهارات بالطلب' }
        ]
    };
}

function buildGlobalAggregates(profiles) {
    const totals = profiles.reduce(
        (acc, profile) => {
            const stats = profile.socioEconomicStats || {};
            acc.population += stats.population || 0;
            acc.employed += stats.employed || 0;
            acc.unemployed += stats.unemployed || 0;
            acc.traders += stats.traders || 0;
            acc.educated += stats.educated || 0;
            acc.assisted += stats.assistedPeople || 0;
            acc.registeredAid += stats.registeredForAid || 0;
            acc.notAssisted += stats.notAssistedPeople || 0;
            acc.charities += stats.charityOrganizations || 0;
            acc.aidUsd += stats.aidAmountUsd || 0;
            return acc;
        },
        {
            population: 0,
            employed: 0,
            unemployed: 0,
            traders: 0,
            educated: 0,
            assisted: 0,
            registeredAid: 0,
            notAssisted: 0,
            charities: 0,
            aidUsd: 0
        }
    );

    const employmentRate = totals.population
        ? Number(((totals.employed / totals.population) * 100).toFixed(2))
        : 0;
    const unemploymentRate =
        totals.employed + totals.unemployed
            ? Number(((totals.unemployed / (totals.employed + totals.unemployed)) * 100).toFixed(2))
            : 0;

    return {
        totals,
        rates: {
            employmentRate,
            unemploymentRate,
            educatedRate: totals.population
                ? Number(((totals.educated / totals.population) * 100).toFixed(2))
                : 0,
            aidCoverageRate: totals.registeredAid
                ? Number(((totals.assisted / totals.registeredAid) * 100).toFixed(2))
                : 0
        },
        disclaimer:
            'هذه مؤشرات نمذجة استراتيجية تشغيلية مبنية على طبقات التصنيف الحالية وليست بديلاً عن الإحصاء الرسمي الميداني.'
    };
}

function buildRootCauses(input) {
    const causes = [];

    if (input.conflictPenalty > 0) {
        causes.push({ cause: 'الحروب والنزاعات وضعف الاستقرار', weight: 92, axis: 'conflict' });
    }
    if (input.sanctionsPenalty > 0) {
        causes.push({ cause: 'العقوبات والعزلة الجيوسياسية', weight: 74, axis: 'geopolitics' });
    }
    if (input.debtPenalty > 0) {
        causes.push({ cause: 'أعباء الدين الخارجي والاعتماد المالي', weight: 72, axis: 'debt' });
    }
    if (input.climatePenalty > 0) {
        causes.push({ cause: 'الهشاشة المناخية والضغط البيئي', weight: 70, axis: 'climate' });
    }
    if (input.wealthScore < 35) {
        causes.push({
            cause: 'ضعف الدخل القومي وقلّة الفرص الاقتصادية',
            weight: 88,
            axis: 'income'
        });
    }
    if (input.educationScore < 45) {
        causes.push({ cause: 'فجوة التعليم والمهارات', weight: 84, axis: 'education' });
    }
    if (input.technologyScore < 40) {
        causes.push({ cause: 'تأخر البنية الرقمية والتقنية', weight: 80, axis: 'technology' });
    }
    if (input.supplyChainScore < 45) {
        causes.push({
            cause: 'الاستبعاد من سلاسل الإمداد والتجارة العالمية',
            weight: 78,
            axis: 'trade'
        });
    }
    if (input.energyScore < 40) {
        causes.push({ cause: 'التبعية الطاقية وارتفاع تكلفة الإمداد', weight: 66, axis: 'energy' });
    }
    if (input.resourceScore < 45) {
        causes.push({ cause: 'ضعف استثمار الموارد أو محدوديتها', weight: 64, axis: 'resources' });
    }
    if (causes.length === 0) {
        causes.push({
            cause: 'تحديات تحسين الكفاءة والعدالة التوزيعية',
            weight: 42,
            axis: 'optimization'
        });
    }

    const sortedCauses = causes.toSorted((a, b) => b.weight - a.weight);
    return sortedCauses.slice(0, 5);
}

function buildRedesignPriorities(rootCauses) {
    const priorities = new Set();
    rootCauses.forEach(item => {
        switch (item.axis) {
            case 'conflict':
                priorities.add('بناء مسار استقرار وتحكيم وحماية مدنية');
                priorities.add('تأمين الغذاء والطاقة والخدمات الأساسية');
                break;
            case 'income':
                priorities.add('توسيع الاستثمار المنتج وفرص العمل');
                priorities.add('إنشاء صناديق تمكين للفقراء والمساكين');
                break;
            case 'education':
                priorities.add('رفع التعليم المهني والمهارات الرقمية');
                break;
            case 'technology':
                priorities.add('إطلاق بنية رقمية وسيادية للبيانات والخدمات');
                break;
            case 'trade':
                priorities.add('ربط الدولة أو المجموعة بمحاور التجارة واللوجستيات');
                break;
            case 'energy':
                priorities.add('تنويع مزيج الطاقة وخفض التبعية');
                break;
            case 'resources':
                priorities.add('تحسين استثمار الموارد ومنع الهدر والاحتكار');
                break;
            case 'debt':
                priorities.add('إعادة هيكلة الديون وربطها بالإنتاج الحقيقي');
                break;
            case 'climate':
                priorities.add('تعزيز التكيف المناخي والأمن المائي والغذائي');
                break;
            default:
                priorities.add('تحسين الحوكمة والكفاءة والعدالة السوقية');
                break;
        }
    });
    return [...priorities].slice(0, 4);
}

function buildAnnualIndicators(accelerationIndex, povertyIndex, justiceIndex) {
    const accelerationTrend = Math.round((accelerationIndex - 50) / 18);
    const povertyTrend = Math.round((50 - povertyIndex) / 20);
    const justiceTrend = Math.round((justiceIndex - 50) / 22);

    return years.map((year, index) => ({
        year,
        accelerationIndex: clamp(
            accelerationIndex - (years.length - 1 - index) * accelerationTrend
        ),
        povertyIndex: clamp(povertyIndex + (years.length - 1 - index) * -povertyTrend),
        shariaMarketJusticeIndex: clamp(justiceIndex - (years.length - 1 - index) * justiceTrend)
    }));
}

function buildNetworkDashboard(unified, profileMap, month) {
    const snapshots = (unified?.resourceNetworks || []).map(network => {
        const countries = pickCountriesForNetwork(network.id, profileMap);
        const leaders = countries.slice(0, 5).map(minifyCountryProfile);
        const vulnerable = [...countries]
            .sort((a, b) => b.povertyIndex - a.povertyIndex)
            .slice(0, 5)
            .map(minifyCountryProfile);
        return {
            networkId: network.id,
            nameAr: network.nameAr,
            month,
            leaderCountries: leaders,
            vulnerableCountries: vulnerable,
            strategicActions: inferStrategicActions(network.id)
        };
    });

    return {
        month,
        topAcceleration: countryProfiles.slice(0, 15).map(minifyCountryProfile),
        highestPovertyRisk: [...countryProfiles]
            .sort((a, b) => b.povertyIndex - a.povertyIndex)
            .slice(0, 15)
            .map(minifyCountryProfile),
        highestJustice: [...countryProfiles]
            .sort((a, b) => b.shariaMarketJusticeIndex - a.shariaMarketJusticeIndex)
            .slice(0, 15)
            .map(minifyCountryProfile),
        networkSnapshots: snapshots
    };
}

function pickCountriesForNetwork(networkId, profileMap) {
    const filters = {
        'energy-network': profile => profile.indexes.energyScore >= 68,
        'industry-network': profile => profile.indexes.industryScore >= 70,
        'knowledge-network': profile => profile.indexes.educationScore >= 68,
        'innovation-network': profile => profile.indexes.innovationScore >= 68,
        'trade-network': profile => profile.indexes.supplyChainScore >= 68
    };

    const filterFn = filters[networkId] || Boolean;
    return countryProfiles.filter(profile => filterFn(profile)).slice(0, 20);
}

function inferStrategicActions(networkId) {
    const actions = {
        'energy-network': [
            'تحالف إنتاج + تخزين + شبكات نقل',
            'خفض التبعية لمصدر طاقة أحادي',
            'ربط الطاقة بالتصنيع المحلي'
        ],
        'industry-network': [
            'تعميق المحتوى المحلي',
            'ربط التمويل بالإنتاج الحقيقي',
            'منع الاحتكار في المدخلات الأساسية'
        ],
        'knowledge-network': [
            'منح للفئات الأضعف',
            'ربط الجامعات بسوق العمل',
            'تعريب المعرفة مع انفتاح عالمي'
        ],
        'innovation-network': [
            'حاضنات وشركات ناشئة',
            'تسريع نقل المعرفة والبراءات',
            'بنية حوسبة وسيادة بيانات'
        ],
        'trade-network': ['ممرات تجارية عادلة', 'خفض كلفة اللوجستيات', 'حوكمة تحكيم وتسوية منازعات']
    };

    return actions[networkId] || ['تحسين الحوكمة', 'رفع الكفاءة', 'تعزيز العدالة'];
}

function buildCommunityPovertyMatrix() {
    return [
        {
            community: 'المناطق الريفية الهشة',
            povertyCategory: 'فقير',
            rootCauses: ['ضعف البنية الأساسية', 'محدودية السوق', 'نقص الخدمات التعليمية والصحية'],
            priorityInterventions: ['الطرق والمياه', 'التمويل الصغير المنتج', 'التمكين الزراعي']
        },
        {
            community: 'الأحياء الحضرية المهمشة',
            povertyCategory: 'مسكين',
            rootCauses: ['دخل غير مستقر', 'غلاء السكن', 'تضخم الخدمات'],
            priorityInterventions: ['مهارات ووظائف', 'سكن ميسر', 'ربط بالنقل والأسواق']
        },
        {
            community: 'النازحون واللاجئون',
            povertyCategory: 'محتاج',
            rootCauses: ['الحروب', 'فقدان الأصول', 'انقطاع الوثائق والخدمات'],
            priorityInterventions: ['حماية ومعيشة', 'هوية وخدمات', 'إدماج اقتصادي']
        },
        {
            community: 'الأسر المثقلة بالديون',
            povertyCategory: 'فقير/مسكين',
            rootCauses: ['قروض استهلاكية', 'دخل محدود', 'ضعف الإنتاجية'],
            priorityInterventions: [
                'إعادة هيكلة',
                'تحويل الديون إلى تمويل إنتاجي',
                'استشارات مالية'
            ]
        },
        {
            community: 'المتضررون من المناخ',
            povertyCategory: 'محتاج',
            rootCauses: ['الجفاف والفيضانات', 'فقدان الدخل الزراعي', 'تعطل الإمدادات'],
            priorityInterventions: ['تكيف مناخي', 'تأمين زراعي', 'أمن غذائي ومائي']
        }
    ];
}

function buildIndividualPovertyArchetypes() {
    return [
        {
            persona: 'عامل يومي متعثر',
            category: 'فقير',
            rootCauses: ['عدم استقرار الدخل', 'مهارات منخفضة', 'غياب الحماية الاجتماعية'],
            supportPath: ['تدريب مهني', 'ربط بوظائف مستقرة', 'صندوق طوارئ معيشي']
        },
        {
            persona: 'أرملة مع مُعالين',
            category: 'محتاج',
            rootCauses: ['عبء إعالة مرتفع', 'ضعف الدخل', 'قيود الرعاية والتنقل'],
            supportPath: ['دخل أساسي مرحلي', 'حضانة ورعاية', 'تمويل صغير منتج']
        },
        {
            persona: 'شاب عاطل في منطقة طرفية',
            category: 'فقير/مسكين',
            rootCauses: ['قلة الفرص', 'فجوة المهارات', 'بعد جغرافي عن السوق'],
            supportPath: ['مسارات رقمية', 'حاضنة أعمال', 'نقل وربط لوجستي']
        },
        {
            persona: 'مزارع صغير مديون',
            category: 'مسكين',
            rootCauses: ['تقلب الأسعار', 'مناخ', 'ضعف التمويل'],
            supportPath: ['شراء مضمون', 'تأمين محصول', 'تمويل أدوات ومدخلات']
        },
        {
            persona: 'نازح فاقد للأصول',
            category: 'محتاج',
            rootCauses: ['نزاع', 'فقدان الملكية', 'انقطاع الشبكات الاجتماعية'],
            supportPath: ['مأوى مؤقت', 'هوية وخدمات', 'إعادة إدماج اقتصادي']
        },
        {
            persona: 'كبير سن محدود الدخل',
            category: 'محتاج',
            rootCauses: ['ضعف القدرة على العمل', 'ارتفاع العلاج', 'قلة المعيل'],
            supportPath: ['رعاية صحية', 'دخل كفاية', 'خدمات منزلية']
        }
    ];
}

function buildRedesignBlueprint() {
    return {
        supremeObjective: 'منع الفقر قبل علاجه وربط الثروة بالإنتاج والعدالة',
        pillars: [
            'شبكة زكاة ووقف وتمكين اقتصادي مرتبطة بالبيانات',
            'محكمة عدالة سوقية ضد الاحتكار والإغراق والهيمنة',
            'مراكز مهارات وعمل وربط مباشر بين التدريب والطلب',
            'صناديق تنمية للبلدان والمجتمعات الأعلى هشاشة',
            'شبكة غذاء وطاقة وماء كحد أدنى للكرامة الإنسانية',
            'طبقة بيانات شهرية للإنذار المبكر بالفقر والبطالة والتهميش'
        ],
        operatingModel: [
            'الرصد الشهري',
            'التدخل السريع',
            'إعادة الهيكلة القطاعية',
            'قياس الأثر السنوي',
            'المراجعة الشرعية والعدلية'
        ]
    };
}

function minifyCountryProfile(profile) {
    return {
        countryAr: profile.countryAr,
        accelerationIndex: profile.accelerationIndex,
        povertyIndex: profile.povertyIndex,
        shariaMarketJusticeIndex: profile.shariaMarketJusticeIndex
    };
}

function translateContinent(continent) {
    const map = {
        africa: 'أفريقيا',
        asia: 'آسيا',
        europe: 'أوروبا',
        americas: 'الأمريكيتان',
        oceania: 'أوقيانوسيا'
    };
    return map[continent] || continent;
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function renderMarkdown(analysis) {
    const topAcceleration = analysis.annualLeaderboards.accelerationTop20
        .slice(0, 10)
        .map(
            (item, index) =>
                `${index + 1}. ${item.countryAr} | تسارع ${item.accelerationIndex} | عدالة ${item.shariaMarketJusticeIndex}`
        )
        .join('\n');
    const topPoverty = analysis.annualLeaderboards.povertyRiskTop20
        .slice(0, 10)
        .map((item, index) => `${index + 1}. ${item.countryAr} | فقر ${item.povertyIndex}`)
        .join('\n');
    const topJustice = analysis.annualLeaderboards.justiceTop20
        .slice(0, 10)
        .map(
            (item, index) =>
                `${index + 1}. ${item.countryAr} | عدالة ${item.shariaMarketJusticeIndex}`
        )
        .join('\n');
    const communityRows = analysis.communityPovertyMatrix
        .map(row => `- ${row.community}: ${row.rootCauses.join('، ')}`)
        .join('\n');
    const personas = analysis.individualPovertyArchetypes
        .map(row => `- ${row.persona} (${row.category}): ${row.rootCauses.join('، ')}`)
        .join('\n');
    const redesign = analysis.redesignBlueprint.pillars.map(item => `- ${item}`).join('\n');

    return `# تقرير التحليل العالمي الشامل - شيخة

## الملخص
- الدول المحللة: ${analysis.summary.totalCountries}
- أفضل دولة في التسارع: ${analysis.summary.topAccelerationCountry}
- أعلى خطر فقر: ${analysis.summary.highestPovertyCountry}
- أفضل عدالة سوقية شرعية: ${analysis.summary.topJusticeCountry}
- الشهر المرجعي: ${analysis.currentMonth}

## مؤشرات كلية (نمذجة تشغيلية)
- إجمالي السكان: ${analysis.globalAggregates.totals.population.toLocaleString('en-US')}
- الموظفون: ${analysis.globalAggregates.totals.employed.toLocaleString('en-US')}
- العاطلون: ${analysis.globalAggregates.totals.unemployed.toLocaleString('en-US')}
- التجار: ${analysis.globalAggregates.totals.traders.toLocaleString('en-US')}
- المتعلمون: ${analysis.globalAggregates.totals.educated.toLocaleString('en-US')}
- إجمالي المساعدات (USD): ${analysis.globalAggregates.totals.aidUsd.toLocaleString('en-US')}
- المستفيدون من المساعدات: ${analysis.globalAggregates.totals.assisted.toLocaleString('en-US')}
- المسجلون للمساعدة: ${analysis.globalAggregates.totals.registeredAid.toLocaleString('en-US')}
- غير المستفيدين بعد التسجيل: ${analysis.globalAggregates.totals.notAssisted.toLocaleString('en-US')}
- عدد جمعيات/جهات المساندة: ${analysis.globalAggregates.totals.charities.toLocaleString('en-US')}

## المعيار القيمي
- المرجعية: ${analysis.ethics.covenantBasis}
- التوجيه النبوي: ${analysis.ethics.propheticMeasure}
- الهدف: ${analysis.ethics.designObjective}

## إطار الكتاب والسنة لأسباب الفقر
- ${analysis.islamicPovertyKnowledgeBase.quranReferences.map(x => `${x.source}: ${x.insight}`).join('\n- ')}
- ${analysis.islamicPovertyKnowledgeBase.sunnahReferences.map(x => `${x.source}: ${x.insight}`).join('\n- ')}

## أفضل 10 في التسارع المركب
${topAcceleration}

## أعلى 10 في خطر الفقر
${topPoverty}

## أفضل 10 في العدالة السوقية الشرعية
${topJustice}

## أسباب الفقر الجذرية المتكررة
- الحروب والنزاعات
- ضعف التعليم والمهارات
- التهميش من شبكات التجارة والإمداد
- الديون والاعتماد المالي
- الهشاشة المناخية
- ضعف استثمار الموارد أو سوء توزيعها
- التبعية الطاقية والتقنية

## مصفوفة المجتمعات الأكثر هشاشة
${communityRows}

## مصفوفة الأفراد/الأنماط البشرية الأكثر احتياجًا
${personas}

## إعادة هندسة الهيكل الصحيح
${redesign}

## ملاحظات منهجية
- المؤشرات هنا نمذجة استراتيجية تشغيلية وليست حكمًا قطعيًا على الأفراد الحقيقيين.
- تقييم الفرد بعينه يحتاج بيانات دخل، صحة، سكن، إعالة، ديون، وتعطل فعلي.
- تقييم الدولة أو المجتمع هنا مزيج من البنية الاقتصادية والتعليمية والتقنية والحوكمة والضغوط الجيوسياسية والمناخية.
`;
}
