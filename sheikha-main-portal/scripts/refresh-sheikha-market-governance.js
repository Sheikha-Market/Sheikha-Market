#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataFile = path.join(rootDir, 'data', 'sheikha-market-governance-index.json');
const mermaidFile = path.join(rootDir, 'docs', 'architecture', 'diagrams', 'sheikha-market-governance-map.mmd');
const reportFile = path.join(rootDir, 'docs', 'reports', 'SHEIKHA-MARKET-GOVERNANCE-ATLAS.md');

function ensureDirFor(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function nowIso() {
    return new Date().toISOString();
}

function getArgValue(name, fallback) {
    const prefix = `${name}=`;
    const found = process.argv.find((arg) => arg.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
}

function buildMarkets() {
    return [
        {
            id: 'saudi-metals',
            name: 'السوق السعودي للمعادن',
            region: 'Saudi Arabia',
            era: 'Modern',
            digitizationScore: 76,
            governanceScore: 84,
            islamicComplianceScore: 91,
            roadmapPriority: 'high',
            keyNotes: ['توطين سلاسل الإمداد', 'توسيع الرقابة الشرعية', 'تحسين شفافية المزادات']
        },
        {
            id: 'gcc-scrap',
            name: 'سوق الخليج للسكراب',
            region: 'GCC',
            era: 'Modern',
            digitizationScore: 68,
            governanceScore: 73,
            islamicComplianceScore: 85,
            roadmapPriority: 'high',
            keyNotes: ['توحيد تصنيف المواد', 'تتبع لوجستي موحد', 'ربط مزودي الاعتماد']
        },
        {
            id: 'mena-industrial',
            name: 'السوق الصناعي في الشرق الأوسط وشمال أفريقيا',
            region: 'MENA',
            era: 'Modern',
            digitizationScore: 61,
            governanceScore: 66,
            islamicComplianceScore: 79,
            roadmapPriority: 'medium',
            keyNotes: ['رفع جودة البيانات', 'تعزيز الامتثال التعاقدي', 'توحيد KPIs']
        },
        {
            id: 'eu-metals-exchange',
            name: 'السوق الأوروبي للمعادن',
            region: 'Europe',
            era: 'Industrial to Digital',
            digitizationScore: 88,
            governanceScore: 86,
            islamicComplianceScore: 64,
            roadmapPriority: 'medium',
            keyNotes: ['تكامل قانوني متعدد الدول', 'توافق الشريعة في العقود العابرة', 'تقارير ESG موحدة']
        },
        {
            id: 'north-america-industrial',
            name: 'السوق الصناعي في أمريكا الشمالية',
            region: 'North America',
            era: 'Industrial to AI-native',
            digitizationScore: 90,
            governanceScore: 82,
            islamicComplianceScore: 58,
            roadmapPriority: 'medium',
            keyNotes: ['حماية مخاطر التذبذب', 'حوكمة نماذج الذكاء', 'تدقيق شفافية السلاسل']
        },
        {
            id: 'east-asia-manufacturing',
            name: 'سوق شرق آسيا التصنيعي',
            region: 'East Asia',
            era: 'High-volume Industrial',
            digitizationScore: 86,
            governanceScore: 80,
            islamicComplianceScore: 62,
            roadmapPriority: 'high',
            keyNotes: ['تكامل الموردين الضخم', 'حوكمة جودة المواد', 'دقة تتبع التحويلات']
        },
        {
            id: 'africa-growth-metals',
            name: 'سوق أفريقيا للمعادن النامية',
            region: 'Africa',
            era: 'Growth',
            digitizationScore: 49,
            governanceScore: 54,
            islamicComplianceScore: 74,
            roadmapPriority: 'high',
            keyNotes: ['بنية رقمية تدريجية', 'تقليل فجوة البيانات', 'تعزيز العدالة السعرية']
        },
        {
            id: 'latin-america-recycling',
            name: 'سوق أمريكا اللاتينية لإعادة التدوير',
            region: 'Latin America',
            era: 'Growth',
            digitizationScore: 58,
            governanceScore: 57,
            islamicComplianceScore: 67,
            roadmapPriority: 'medium',
            keyNotes: ['مؤشرات موحدة لإعادة التدوير', 'شفافية الطلب والعرض', 'حوكمة العقود']
        }
    ];
}

function buildIndex() {
    const generatedAt = nowIso();
    const markets = buildMarkets();

    const nodes = [{ id: 'sheikha-governance-core', label: 'Sheikha Governance Core', family: 'governance' }]
        .concat(markets.map((market) => ({ id: market.id, label: market.name, family: 'market' })));

    const edges = markets.map((market) => ({
        from: 'sheikha-governance-core',
        to: market.id,
        relation: 'market-governance',
        mode: market.roadmapPriority
    }));

    const averageDigitization = Math.round(markets.reduce((sum, item) => sum + item.digitizationScore, 0) / markets.length);
    const averageGovernance = Math.round(markets.reduce((sum, item) => sum + item.governanceScore, 0) / markets.length);
    const averageSharia = Math.round(markets.reduce((sum, item) => sum + item.islamicComplianceScore, 0) / markets.length);

    return {
        version: '1.0.0',
        generatedAt,
        mission: 'Global market digital governance with Quran and Sunnah aligned ethics',
        islamicFramework: {
            references: [
                'الكتاب والسنة',
                'الصدق في البيع والشراء',
                'منع الربا والغرر والغش والاحتكار',
                'العدل ووضوح المعلومات'
            ],
            policy: 'Human-governed ethical automation'
        },
        summary: {
            markets: markets.length,
            averageDigitization,
            averageGovernance,
            averageSharia
        },
        markets,
        networkGraph: {
            nodes,
            edges
        },
        updatePolicy: {
            mode: 'scheduled',
            recommendedIntervalSeconds: 900,
            refreshCommand: 'node scripts/refresh-sheikha-market-governance.js'
        }
    };
}

function buildMermaid(index) {
    const lines = ['graph LR', '  SGC[Sheikha Governance Core]'];

    index.markets.forEach((market) => {
        const key = market.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        lines.push(`  ${key}[${market.name}]`);
        lines.push(`  SGC --> ${key}`);
    });

    return `${lines.join('\n')}\n`;
}

function buildReport(index) {
    return [
        '# Sheikha Market Governance Atlas',
        '',
        `Generated at: ${index.generatedAt}`,
        '',
        '## Summary',
        `- Markets indexed: ${index.summary.markets}`,
        `- Avg digitization score: ${index.summary.averageDigitization}`,
        `- Avg governance score: ${index.summary.averageGovernance}`,
        `- Avg Islamic compliance score: ${index.summary.averageSharia}`,
        '',
        '## Islamic Governance Reference',
        ...index.islamicFramework.references.map((item) => `- ${item}`),
        '',
        '## API Endpoints',
        '- GET /api/sheikha/market-governance/index',
        '- GET /api/sheikha/market-governance/map',
        '- POST /api/sheikha/market-governance/simulate',
        '',
        '## Refresh Commands',
        '- npm run -s ops:sheikha:markets:refresh',
        '- npm run -s ops:sheikha:markets:auto',
        ''
    ].join('\n');
}

function writeOnce() {
    const index = buildIndex();

    ensureDirFor(dataFile);
    fs.writeFileSync(dataFile, JSON.stringify(index, null, 2));

    const mapMermaid = buildMermaid(index);
    ensureDirFor(mermaidFile);
    fs.writeFileSync(mermaidFile, mapMermaid);

    const report = buildReport(index);
    ensureDirFor(reportFile);
    fs.writeFileSync(reportFile, report);

    console.log(`OK: market governance refreshed at ${index.generatedAt}`);
    console.log(`OK: data=${path.relative(rootDir, dataFile)}`);
    console.log(`OK: map=${path.relative(rootDir, mermaidFile)}`);
    console.log(`OK: report=${path.relative(rootDir, reportFile)}`);
}

function run() {
    const watchMode = process.argv.includes('--watch');
    const intervalSec = Number(getArgValue('--interval', '900'));

    writeOnce();

    if (!watchMode) {
        return;
    }

    const safeInterval = Number.isFinite(intervalSec) && intervalSec >= 30 ? intervalSec : 900;
    console.log(`INFO: watch mode enabled, refresh every ${safeInterval} seconds`);

    setInterval(() => {
        try {
            writeOnce();
        } catch (error) {
            console.error('ERROR: market governance refresh failed', error.message);
        }
    }, safeInterval * 1000);
}

run();
