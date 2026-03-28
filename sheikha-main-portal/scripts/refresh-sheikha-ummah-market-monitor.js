#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataFile = path.join(rootDir, 'data', 'sheikha-ummah-market-monitor.json');
const reportFile = path.join(rootDir, 'docs', 'reports', 'SHEIKHA-UMMAH-MARKET-MONITOR.md');

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

function buildPayload() {
    const generatedAt = nowIso();

    const events = [
        {
            id: 'future-investment-initiative',
            title: 'مؤتمر مستقبل الاستثمار',
            type: 'conference',
            region: 'Saudi Arabia',
            status: 'tracked',
            organizer: 'Future Investment Initiative',
            timelineDate: '2026-10-01',
            category: ['investment', 'global-economy', 'innovation'],
            goals: [
                'تعزيز الشراكات الاستثمارية العادلة',
                'رفع كفاءة سلاسل الإمداد',
                'دعم الابتكار الاقتصادي المسؤول'
            ],
            source: {
                label: 'FII Official',
                url: 'https://www.futureinvestmentinitiative.com'
            }
        },
        {
            id: 'saudi-us-investment-forum',
            title: 'المنتدى السعودي الأمريكي للاستثمار',
            type: 'forum',
            region: 'Saudi Arabia / USA',
            status: 'archived-tracked',
            organizer: 'Joint business councils',
            timelineDate: '2025-05-12',
            category: ['investment', 'policy-dialogue'],
            goals: [
                'توسيع الاستثمار الثنائي',
                'تفعيل برامج نقل المعرفة',
                'تعزيز الاستقرار التجاري'
            ],
            source: {
                label: 'Public economic coverage',
                url: 'https://www.spa.gov.sa'
            }
        },
        {
            id: 'global-supply-chain-summit',
            title: 'مؤتمر سلاسل الإمداد والتوريد العالمي',
            type: 'summit',
            region: 'Global',
            status: 'tracked',
            organizer: 'International supply chain networks',
            timelineDate: '2026-09-20',
            category: ['supply-chain', 'logistics', 'trade-resilience'],
            goals: [
                'مرونة سلاسل التوريد',
                'تقليل الهدر والتضخم',
                'رفع شفافية التتبع'
            ],
            source: {
                label: 'Global logistics publications',
                url: 'https://www.weforum.org'
            }
        }
    ];

    return {
        version: '1.0.0',
        generatedAt,
        monitorIdentity: {
            name: 'Sheikha Ummah Market Monitor',
            mission: 'رقمنة ومراقبة المؤتمرات والمنتديات واللقاءات الاقتصادية والتجارية محليا وعالميا',
            governanceReference: 'الكتاب والسنة — العدل ومنع الظلم والفساد'
        },
        taxonomy: {
            eventTypes: ['conference', 'forum', 'summit', 'meeting', 'roundtable'],
            scopes: ['local', 'regional', 'global'],
            trackingSignals: ['inflation', 'conflicts', 'political-negotiations', 'supply-shocks', 'trade-agreements']
        },
        timeline: {
            historicalCoverage: 'منذ عهد الأنبياء إلى العصر الحديث',
            propheticTradeNote: 'رقمنة قيم التجارة في العصور النبوية وشبكات القوافل والرحلات التجارية'
        },
        events,
        goalsLedger: {
            sharedGoals: [
                'تحقيق عدالة تجارية عالمية',
                'رفع الشفافية والامتثال',
                'منع الفساد والغش والاحتكار',
                'تنسيق أهداف اقتصادية مشتركة بين الجهات'
            ],
            lastSyncAt: generatedAt
        },
        updatePolicy: {
            mode: 'scheduled',
            recommendedIntervalSeconds: 900,
            refreshCommand: 'node scripts/refresh-sheikha-ummah-market-monitor.js'
        }
    };
}

function buildReport(payload) {
    return [
        '# Sheikha Ummah Market Monitor',
        '',
        `Generated at: ${payload.generatedAt}`,
        '',
        '## Mission',
        `- ${payload.monitorIdentity.mission}`,
        `- Governance reference: ${payload.monitorIdentity.governanceReference}`,
        '',
        '## Event Coverage',
        `- Total events tracked: ${payload.events.length}`,
        ...payload.events.map((event) => `- ${event.title} (${event.type}) — ${event.timelineDate}`),
        '',
        '## API Endpoints',
        '- GET /api/sheikha/ummah-market-monitor',
        '- GET /api/sheikha/ummah-market-monitor/calendar',
        '- POST /api/sheikha/ummah-market-monitor/register-event',
        '- POST /api/sheikha/ummah-market-monitor/sync-live',
        '',
        '## Refresh Commands',
        '- npm run -s ops:sheikha:ummah:monitor:refresh',
        '- npm run -s ops:sheikha:ummah:monitor:auto',
        ''
    ].join('\n');
}

function writeOnce() {
    const payload = buildPayload();

    ensureDirFor(dataFile);
    fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2));

    ensureDirFor(reportFile);
    fs.writeFileSync(reportFile, buildReport(payload));

    console.log(`OK: ummah market monitor refreshed at ${payload.generatedAt}`);
    console.log(`OK: data=${path.relative(rootDir, dataFile)}`);
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
            console.error('ERROR: ummah monitor refresh failed', error.message);
        }
    }, safeInterval * 1000);
}

run();
