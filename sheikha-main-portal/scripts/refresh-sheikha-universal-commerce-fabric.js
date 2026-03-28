#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataFile = path.join(rootDir, 'data', 'sheikha-universal-commerce-fabric.json');
const mermaidFile = path.join(rootDir, 'docs', 'architecture', 'diagrams', 'sheikha-universal-commerce-fabric.mmd');
const reportFile = path.join(rootDir, 'docs', 'reports', 'SHEIKHA-UNIVERSAL-COMMERCE-FABRIC.md');

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

function buildFabric() {
    const generatedAt = nowIso();
    const domains = [
        {
            id: 'physical-markets',
            name: 'الأسواق المادية',
            scope: 'Global',
            status: 'active',
            governanceScore: 84,
            notes: 'الأسواق المركزية والتقليدية والحديثة'
        },
        {
            id: 'logistics-and-routes',
            name: 'النقل والرحلات التجارية',
            scope: 'Global',
            status: 'active',
            governanceScore: 79,
            notes: 'طرق القوافل والبحر والربط اللوجستي الرقمي'
        },
        {
            id: 'digital-commerce',
            name: 'التجارة الرقمية',
            scope: 'Global',
            status: 'active',
            governanceScore: 82,
            notes: 'التجارة الإلكترونية والمدفوعات والمنصات'
        },
        {
            id: 'knowledge-and-services',
            name: 'تجارة المعرفة والخدمات',
            scope: 'Global',
            status: 'active',
            governanceScore: 88,
            notes: 'الاستشارات والتعليم والخدمات المهنية'
        },
        {
            id: 'industrial-supply',
            name: 'سلاسل الإمداد الصناعية',
            scope: 'Global',
            status: 'active',
            governanceScore: 81,
            notes: 'المواد الخام والتصنيع والتوزيع'
        },
        {
            id: 'future-economies',
            name: 'اقتصاديات العصر الجديد',
            scope: 'Global',
            status: 'active',
            governanceScore: 77,
            notes: 'الذكاء الاصطناعي والأتمتة والاقتصاد المعرفي'
        }
    ];

    const historicalTimeline = [
        {
            periodId: 'adam-era',
            periodName: 'منذ عهد نبي الله آدم عليه السلام',
            highlights: ['قيم الاستخلاف', 'العدل والأمانة'],
            digitalizationFocus: 'نمذجة المبادئ المؤسسة للتبادل العادل'
        },
        {
            periodId: 'prophetic-markets',
            periodName: 'مرحلة النبوات وسوق المدينة',
            highlights: ['الصدق', 'منع الغش', 'العدل في الكيل والميزان'],
            digitalizationFocus: 'حوكمة المعاملات الشرعية ومنع الربا والغرر'
        },
        {
            periodId: 'civilizational-expansion',
            periodName: 'العصور الحضارية الإسلامية',
            highlights: ['شبكات التجارة', 'تلاقي الحضارات', 'التعاقدات المنظمة'],
            digitalizationFocus: 'رقمنة الشبكات التجارية التاريخية وربطها بالحاضر'
        },
        {
            periodId: 'modern-union',
            periodName: 'العصر الحديث والاتحاد الاقتصادي',
            highlights: ['تكامل الأسواق', 'رقمنة الاقتصاد', 'حوكمة عابرة للحدود'],
            digitalizationFocus: 'طبقة حاكمة موحدة للشفافية والعدالة'
        }
    ];

    const nodes = [
        { id: 'sheikha-governance-core', label: 'Sheikha Governance Core', family: 'governance' },
        ...domains.map((domain) => ({ id: domain.id, label: domain.name, family: 'commerce-domain' }))
    ];

    const edges = domains.map((domain) => ({
        from: 'sheikha-governance-core',
        to: domain.id,
        relation: 'unified-commerce-governance',
        mode: 'direct'
    }));

    return {
        version: '1.0.0',
        generatedAt,
        mission: 'Unified global commerce governance across all trade domains under ethical Islamic values',
        islamicIdentity: {
            references: [
                'الكتاب والسنة',
                'الصدق والأمانة في التجارة',
                'منع الربا والغرر والغش والاحتكار',
                'تحقيق العدل وحفظ الحقوق'
            ],
            medinaMarketIdentity: {
                name: 'هوية سوق المدينة الرقمية',
                pillars: ['العدالة', 'الشفافية', 'منع الظلم', 'تمكين التاجر والمستهلك']
            }
        },
        domains,
        historicalTimeline,
        networkGraph: { nodes, edges },
        updatePolicy: {
            mode: 'scheduled',
            recommendedIntervalSeconds: 900,
            refreshCommand: 'node scripts/refresh-sheikha-universal-commerce-fabric.js'
        }
    };
}

function buildMermaid(fabric) {
    const lines = ['graph LR', '  SGC[Sheikha Governance Core]'];

    fabric.domains.forEach((domain) => {
        const key = domain.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        lines.push(`  ${key}[${domain.name}]`);
        lines.push(`  SGC --> ${key}`);
    });

    return `${lines.join('\n')}\n`;
}

function buildReport(fabric) {
    return [
        '# Sheikha Universal Commerce Fabric',
        '',
        `Generated at: ${fabric.generatedAt}`,
        '',
        '## Mission',
        `- ${fabric.mission}`,
        '',
        '## Coverage',
        `- Commerce domains: ${fabric.domains.length}`,
        `- Historical stages: ${fabric.historicalTimeline.length}`,
        '',
        '## Islamic Identity Anchors',
        ...fabric.islamicIdentity.references.map((item) => `- ${item}`),
        '',
        '## API Endpoints',
        '- GET /api/sheikha/universal-commerce/fabric',
        '- GET /api/sheikha/universal-commerce/map',
        '- POST /api/sheikha/connectors/activate-federation',
        '',
        '## Refresh Commands',
        '- npm run -s ops:sheikha:commerce:fabric:refresh',
        '- npm run -s ops:sheikha:commerce:fabric:auto',
        ''
    ].join('\n');
}

function writeOnce() {
    const fabric = buildFabric();

    ensureDirFor(dataFile);
    fs.writeFileSync(dataFile, JSON.stringify(fabric, null, 2));

    ensureDirFor(mermaidFile);
    fs.writeFileSync(mermaidFile, buildMermaid(fabric));

    ensureDirFor(reportFile);
    fs.writeFileSync(reportFile, buildReport(fabric));

    console.log(`OK: universal commerce fabric refreshed at ${fabric.generatedAt}`);
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
            console.error('ERROR: commerce fabric refresh failed', error.message);
        }
    }, safeInterval * 1000);
}

run();
