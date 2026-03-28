#!/usr/bin/env node

/**
 * منظومة شيخة - تفعيل الشبكة العالمية الموحدة
 * يبني تحليل معماري شامل للشبكات والكيانات وسباق الأداء
 */

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

const globalFile = path.join(configDir, 'sheikha-global-country-classifications.json');
const g20File = path.join(configDir, 'sheikha-g20-integration.json');

if (!fs.existsSync(globalFile) || !fs.existsSync(g20File)) {
    console.error('❌ Missing required config files.');
    process.exit(1);
}

const globalConfig = JSON.parse(fs.readFileSync(globalFile, 'utf8'));
const g20Config = JSON.parse(fs.readFileSync(g20File, 'utf8'));

const leaders = Array.isArray(g20Config?.g20Members?.leaders) ? g20Config.g20Members.leaders : [];
const otherMembers = Array.isArray(g20Config?.g20Members?.otherMembers)
    ? g20Config.g20Members.otherMembers
    : [];
const allG20 = [...leaders.map(l => l.countryAr), ...otherMembers.map(m => m.countryAr)].filter(
    Boolean
);

const dimensions = globalConfig.classificationDimensions || {};
const dimensionEntries = Object.entries(dimensions);

function parseTrillion(value) {
    if (typeof value !== 'string') {
        return 0;
    }
    const normalized = value
        .replaceAll('$', '')
        .replaceAll(',', '')
        .replaceAll(' ', '')
        .toUpperCase();
    if (normalized.endsWith('T')) {
        return Number.parseFloat(normalized.replace('T', '')) || 0;
    }
    if (normalized.endsWith('B')) {
        return (Number.parseFloat(normalized.replace('B', '')) || 0) / 1000;
    }
    return Number.parseFloat(normalized) || 0;
}

function listCount(obj) {
    if (!obj || typeof obj !== 'object') {
        return 0;
    }

    const arrays = [
        obj.tiers,
        obj.continents,
        obj.majorReligions,
        obj.mainSects,
        obj.resourceTypes,
        obj.industrialSegments,
        obj.energyTypes,
        obj.levels
    ];

    for (const arr of arrays) {
        if (Array.isArray(arr)) {
            return arr.length;
        }
    }

    return Object.keys(obj).length;
}

const classificationNetworks = dimensionEntries.map(([key, item]) => ({
    id: key,
    nameAr: item.nameAr || key,
    categories: listCount(item),
    priority: item.priority || 99,
    status: item.status || 'active'
}));

const actorNetworks = {
    countries: {
        total: Number(globalConfig?.statistics?.totalCountries || 195),
        g20Members: allG20.length,
        examples: allG20.slice(0, 12)
    },
    organizations: {
        total: 14,
        list: [
            'G20',
            'OIC',
            'UN',
            'WTO',
            'World Bank',
            'IMF',
            'Islamic Development Bank',
            'OPEC',
            'EU',
            'AU',
            'ASEAN',
            'GCC',
            'BRICS+',
            'ICRC'
        ]
    },
    entities: {
        total: 8,
        list: [
            'الوزارات الاقتصادية',
            'هيئات الاستثمار',
            'الهيئات التنظيمية',
            'البنوك المركزية',
            'غرف التجارة',
            'هيئات التعليم والبحث',
            'هيئات الطاقة والبيئة',
            'هيئات التحول الرقمي'
        ]
    },
    traders: {
        total: 7,
        segments: [
            'تجار المعادن والخردة',
            'تجار الطاقة والبتروكيماويات',
            'تجار الحبوب والمواد الغذائية',
            'تجار المعدات الصناعية',
            'تجار الخدمات اللوجستية',
            'تجار الحلول التقنية والذكاء الاصطناعي',
            'تجار الخدمات المالية والتأمين'
        ]
    },
    humans: {
        total: 8,
        classes: [
            'العلماء والباحثون',
            'المهندسون',
            'رواد الأعمال',
            'المستثمرون',
            'الطلاب والمتدربون',
            'المهنيون الحرفيون',
            'العمال المهرة',
            'المستشارون الشرعيون والقانونيون'
        ]
    }
};

const resourceNetworks = [
    {
        id: 'energy-network',
        nameAr: 'شبكة الطاقة',
        driver: 'النفط + الغاز + المتجددة + النووية',
        connectedActors: ['countries', 'organizations', 'entities', 'traders']
    },
    {
        id: 'industry-network',
        nameAr: 'شبكة الصناعة',
        driver: 'التصنيع الثقيل والمتقدم وسلاسل القيمة',
        connectedActors: ['countries', 'entities', 'traders', 'humans']
    },
    {
        id: 'knowledge-network',
        nameAr: 'شبكة التعليم والمعرفة',
        driver: 'الجامعات ومراكز التدريب والبحث',
        connectedActors: ['countries', 'organizations', 'humans']
    },
    {
        id: 'innovation-network',
        nameAr: 'شبكة الابتكار',
        driver: 'البراءات والشركات الناشئة والتحول الرقمي',
        connectedActors: ['countries', 'entities', 'humans', 'traders']
    },
    {
        id: 'trade-network',
        nameAr: 'شبكة التجارة العادلة',
        driver: 'اللوجستيات + الموانئ + المعابر + التحكيم',
        connectedActors: ['countries', 'organizations', 'entities', 'traders']
    }
];

const maxGdp = Math.max(1, ...leaders.map(x => parseTrillion(x.gdp)));
const race = leaders
    .map(leader => {
        const gdpScore = Math.min(100, Math.round((parseTrillion(leader.gdp) / maxGdp) * 100));
        const strengthScore = Math.min(
            100,
            (Array.isArray(leader.strengths) ? leader.strengths.length : 0) * 20
        );

        const innovationText = leader?.classifications?.innovation || '';
        let innovationScore = 55;
        if (innovationText.toLowerCase().includes('leader')) {
            innovationScore = 95;
        } else if (innovationText.toLowerCase().includes('performer')) {
            innovationScore = 80;
        }

        const finalScore = Math.round(
            gdpScore * 0.4 + strengthScore * 0.35 + innovationScore * 0.25
        );

        return {
            countryAr: leader.countryAr,
            role: leader.role,
            gdpScore,
            strengthScore,
            innovationScore,
            finalScore
        };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

const unifiedArchitecture = {
    program: 'SHEIKHA_GLOBAL_UNIFIED_NETWORK_ARCHITECTURE',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    covenant: {
        basisAr: 'الكتاب والسنة',
        justiceAr: 'تحقيق العدل ومنع الظلم والاحتكار',
        guidanceAr: 'نشر القيم بالحكمة والرحمة وبدون إكراه'
    },
    summary: {
        totalDimensions: classificationNetworks.length,
        totalCountries: Number(globalConfig?.statistics?.totalCountries || 195),
        totalG20: Number(g20Config?.g20Members?.count || 20),
        totalResourceNetworks: resourceNetworks.length,
        totalActorFamilies: Object.keys(actorNetworks).length
    },
    classificationNetworks,
    resourceNetworks,
    actorNetworks,
    governanceNetwork: {
        top: 'مجلس شيخة العالمي',
        councils: [
            'المجلس الشرعي والأخلاقي',
            'مجلس التقنية والابتكار',
            'مجلس التجارة العادلة',
            'مجلس التنمية والتعليم',
            'مجلس البيئة والطاقة'
        ],
        operationalLayers: [
            'طبقة عالمية',
            'طبقة قارية',
            'طبقة وطنية',
            'طبقة قطاعية',
            'طبقة محلية تنفيذية'
        ]
    },
    accelerationRace: {
        model: {
            nameAr: 'نموذج سباق التمكين المتوازن',
            weights: {
                gdpScore: 0.4,
                strengthScore: 0.35,
                innovationScore: 0.25
            },
            formula: 'final = 0.4*gdp + 0.35*strength + 0.25*innovation'
        },
        leaderboardTop10: race.slice(0, 10)
    },
    implementationRoadmap: {
        phase1: 'تثبيت الحوكمة والبيانات (0-90 يوم)',
        phase2: 'تشغيل شبكات الموارد والتجارة (3-12 شهر)',
        phase3: 'تسريع الابتكار والبحث والتحول الرقمي (12-36 شهر)',
        phase4: 'مراجعة الأثر والعدالة وتحسين المؤشرات (سنوي)'
    }
};

const jsonOut = path.join(dataDir, 'sheikha-global-unified-network-analysis.json');
fs.writeFileSync(jsonOut, JSON.stringify(unifiedArchitecture, null, 2));

const mdOut = path.join(reportsDir, 'sheikha-global-unified-network-analysis-report.md');
fs.writeFileSync(mdOut, renderMarkdown(unifiedArchitecture));

console.log('🌐 === Sheikha Unified Network Activation ===');
console.log(`✅ Saved: ${path.relative(root, jsonOut)}`);
console.log(`✅ Saved: ${path.relative(root, mdOut)}`);
console.log(
    `📊 Networks: ${unifiedArchitecture.summary.totalDimensions} classification + ${unifiedArchitecture.summary.totalResourceNetworks} resource`
);
console.log(
    `🏁 Race Model Top: ${unifiedArchitecture.accelerationRace.leaderboardTop10[0]?.countryAr || 'N/A'}`
);
console.log('✅ UNIFIED ANALYSIS READY');

function renderMarkdown(architecture) {
    const topRows = architecture.accelerationRace.leaderboardTop10
        .map(
            (x, i) =>
                `${i + 1}. ${x.countryAr} | ${x.finalScore} | GDP:${x.gdpScore} Strength:${x.strengthScore} Innovation:${x.innovationScore}`
        )
        .join('\n');

    const networkRows = architecture.classificationNetworks
        .map(n => `- ${n.nameAr}: ${n.categories} تصنيف فرعي (أولوية ${n.priority})`)
        .join('\n');

    const resourceRows = architecture.resourceNetworks
        .map(n => `- ${n.nameAr}: ${n.driver}`)
        .join('\n');

    return `# تقرير الشبكة العالمية الموحدة - منظومة شيخة

## الملخص التنفيذي
- البرنامج: ${architecture.program}
- الإصدار: ${architecture.version}
- وقت الإنشاء: ${architecture.generatedAt}
- إجمالي الدول: ${architecture.summary.totalCountries}
- أبعاد التصنيف: ${architecture.summary.totalDimensions}
- شبكات الموارد: ${architecture.summary.totalResourceNetworks}

## الأساس القيمي
- المرجعية: ${architecture.covenant.basisAr}
- المبدأ: ${architecture.covenant.justiceAr}
- المنهج: ${architecture.covenant.guidanceAr}

## شبكة التصنيفات
${networkRows}

## شبكة الموارد
${resourceRows}

## شبكة الفاعلين (Actors)
- الدول: ${architecture.actorNetworks.countries.total}
- المنظمات: ${architecture.actorNetworks.organizations.total}
- الجهات: ${architecture.actorNetworks.entities.total}
- قطاعات التجار: ${architecture.actorNetworks.traders.total}
- فئات البشر: ${architecture.actorNetworks.humans.total}

## شبكة الحوكمة الموحدة
- المركز: ${architecture.governanceNetwork.top}
- المجالس: ${architecture.governanceNetwork.councils.join('، ')}
- الطبقات التشغيلية: ${architecture.governanceNetwork.operationalLayers.join('، ')}

## سباق الأداء والتسارع
- النموذج: ${architecture.accelerationRace.model.nameAr}
- المعادلة: ${architecture.accelerationRace.model.formula}
- أفضل 10 دول في مؤشر التسارع المركب:
${topRows}

## خارطة التنفيذ
1. ${architecture.implementationRoadmap.phase1}
2. ${architecture.implementationRoadmap.phase2}
3. ${architecture.implementationRoadmap.phase3}
4. ${architecture.implementationRoadmap.phase4}

## ملاحظات الحوكمة الشرعية
- هذا التقرير إطار حوكمة وتنمية وعدالة وتعاون.
- الالتزام بالأنظمة المحلية والدولية واجب عند التنفيذ.
- تحقيق المصالح ورفع الضرر وتكافؤ الفرص ركن أساسي.
`;
}
