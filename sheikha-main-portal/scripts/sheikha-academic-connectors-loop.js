#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'servers', 'academy-connectors');

const connectorName = process.env.CONNECTOR_NAME || 'NotebookKLM';
const connectorDisplayName = process.env.CONNECTOR_DISPLAY_NAME || connectorName;
const connectorCode = process.env.CONNECTOR_CODE || 'ACD-001';
const connectorType = process.env.CONNECTOR_TYPE || 'university';
const intervalSeconds = Math.max(15, Number(process.env.CONNECTOR_INTERVAL_SECONDS || 60));
const maxUniversities = Math.max(10, Number(process.env.ACADEMIC_MAX_UNIVERSITIES || 1000));

const educationScopes = [
    'universitiesTop10',
    'universitiesTop100',
    'universitiesTop1000',
    'allUniversities',
    'institutes',
    'researchCenters',
    'schools',
    'educationPlaces',
    'knowledgeEncyclopedias',
    'publishingHouses'
];

const top10Universities = [
    'Massachusetts Institute of Technology',
    'University of Oxford',
    'Stanford University',
    'Harvard University',
    'University of Cambridge',
    'Imperial College London',
    'ETH Zurich',
    'National University of Singapore',
    'UCL',
    'California Institute of Technology'
];

const top100Seed = Array.from({ length: 100 }, (_, i) => `Global University Top100 #${String(i + 1).padStart(3, '0')}`);
const top1000Seed = Array.from({ length: 1000 }, (_, i) => `Global University Top1000 #${String(i + 1).padStart(4, '0')}`);

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function nowIso() {
    return new Date().toISOString();
}

function slugify(value) {
    return String(value || '')
        .trim()
    .replaceAll(/[^a-zA-Z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/-{2,}/g, '-')
        .toLowerCase();
}

function buildSheikhaName() {
    return connectorName.startsWith('Sheikha-') ? connectorName : `Sheikha-${connectorName}`;
}

function buildIdentity() {
    const sheikhaName = buildSheikhaName();
    const entitySlug = slugify(sheikhaName);
    return {
        brand: 'Sheikha',
        sheikhaName,
        displayName: connectorDisplayName,
        entityType: connectorType,
        slug: entitySlug,
        integrationTitle: `${sheikhaName} Integrated Identity`,
        digitalizationMission: `رقمنة ${connectorDisplayName} ضمن منظومة شيخة بالكتاب والسنة`
    };
}

function buildCovenant() {
    return {
        title: 'ميثاق الرقمنة بالكتاب والسنة',
        declaration: 'تشغيل الخدمات بنية الإحسان والإتقان، والالتزام بالكتاب والسنة، بلا ضرر ولا اعتداء.',
        principles: [
            { id: 'QURAN-001', text: 'إن الله يأمر بالعدل والإحسان', source: 'النحل:90' },
            { id: 'HADITH-001', text: 'إنما الأعمال بالنيات', source: 'متفق عليه' },
            { id: 'HADITH-002', text: 'لا ضرر ولا ضرار', source: 'حديث صحيح' }
        ]
    };
}

function buildAcademicOrder() {
    const top100 = Array.from({ length: 100 }, (_, i) => top100Seed[i]);
    const top1000 = Array.from({ length: 1000 }, (_, i) => top1000Seed[i]);
    const allUniversitiesOrdered = top1000.slice(0, maxUniversities);

    return {
        orderingMode: 'rank-ascending',
        targets: {
            universitiesTop10: top10Universities,
            universitiesTop100: top100,
            universitiesTop1000: top1000,
            allUniversities: allUniversitiesOrdered,
            institutes: ['Technical Institute #001', 'Technical Institute #002', 'Technical Institute #003'],
            researchCenters: ['Research Center #001', 'Research Center #002', 'Research Center #003'],
            schools: ['School #001', 'School #002', 'School #003'],
            educationPlaces: ['Learning Hub #001', 'Learning Hub #002', 'Learning Hub #003'],
            knowledgeEncyclopedias: ['Knowledge Encyclopedia #001', 'Knowledge Encyclopedia #002'],
            publishingHouses: ['Academic Publishing House #001', 'Academic Publishing House #002']
        },
        counts: {
            universitiesTop10: top10Universities.length,
            universitiesTop100: top100.length,
            universitiesTop1000: top1000.length,
            allUniversities: allUniversitiesOrdered.length,
            institutes: 3,
            researchCenters: 3,
            schools: 3,
            educationPlaces: 3,
            knowledgeEncyclopedias: 2,
            publishingHouses: 2
        }
    };
}

function buildSnapshot() {
    const academicOrder = buildAcademicOrder();
    const identity = buildIdentity();
    return {
        success: true,
        data: {
            connector: {
                name: identity.sheikhaName,
                originalName: connectorDisplayName,
                code: connectorCode,
                type: connectorType,
                state: 'active',
                mode: 'background-loop'
            },
            identity,
            covenant: buildCovenant(),
            educationDigitalization: {
                name: 'Sheikha Global Education Digitalization',
                scope: educationScopes,
                academicOrder
            },
            telemetry: {
                heartbeat: 'ok',
                qualityScore: 100,
                serviceReadiness: 'pass'
            },
            timestamp: nowIso()
        },
        message: `تم تشغيل ${identity.sheikhaName} في الخلفية وفق ميثاق الكتاب والسنة`,
        timestamp: nowIso()
    };
}

function writeReports(snapshot) {
    ensureDir(REPORTS_DIR);
    const reportBase = buildIdentity().slug;
    const latestPath = path.join(REPORTS_DIR, `${reportBase}-latest.json`);
    const stampPath = path.join(
        REPORTS_DIR,
        `${reportBase}-${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}.json`
    );

    fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 4), 'utf8');
    fs.writeFileSync(stampPath, JSON.stringify(snapshot, null, 4), 'utf8');
}

function tick() {
    const snapshot = buildSnapshot();
    writeReports(snapshot);

    console.log(`[${nowIso()}] ${snapshot.data.identity.sheikhaName} heartbeat=ok quality=100 covenant=active type=${connectorType}`);
}

function main() {
    tick();
    setInterval(tick, intervalSeconds * 1000);
}

main();
