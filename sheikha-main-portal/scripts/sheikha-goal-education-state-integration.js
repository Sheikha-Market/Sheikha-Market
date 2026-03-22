#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_PATH = path.join(DATA_DIR, 'sheikha-cross-sector-goal-integration.json');

function readJson(filePath, fallback = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallback;
    }
}

function uniqueBy(items, keyGetter) {
    const seen = new Set();
    return items.filter((item) => {
        const key = keyGetter(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function pickEducationAnchors(educationEntities) {
    const top10 = educationEntities
        .filter((e) => e.category === 'university-top10')
        .slice(0, 10);

    const local = educationEntities
        .filter((e) => (e.sheikhaName || '').includes('King') || (e.sheikhaName || '').includes('Saudi'))
        .slice(0, 5);

    return uniqueBy([...top10, ...local], (e) => e.sheikhaName).map((e) => ({
        sector: 'education',
        sheikhaName: e.sheikhaName,
        displayName: e.displayName,
        category: e.category
    }));
}

function pickStateAnchors(stateEntities) {
    return (stateEntities || []).map((e) => ({
        sector: 'state-investments',
        sheikhaName: e.sheikhaName,
        displayName: e.sheikhaName,
        category: e.type
    }));
}

function mapGoals(entity) {
    const defaultNational = ['KG-2026-001', 'KG-2026-002', 'KG-2026-003'];

    if (entity.sector === 'education') {
        return {
            nationalGoals: ['KG-2026-002', 'SG-2026-001', 'SG-2026-003'],
            sharedGoals: ['PB-001', 'PB-003', 'PB-005'],
            integrationFocus: 'نقل المعرفة إلى أثر وابتكار مجتمعي'
        };
    }

    return {
        nationalGoals: defaultNational,
        sharedGoals: ['PB-001', 'PB-002', 'PB-004', 'PB-005'],
        integrationFocus: 'تعظيم الأثر الاقتصادي مع حماية المنفعة العامة'
    };
}

function main() {
    const education = readJson(path.join(DATA_DIR, 'sheikha-education-entities-registry.json'), { data: { entities: [] } });
    const state = readJson(path.join(DATA_DIR, 'sheikha-state-investments-registry.json'), { data: { entities: [] } });

    const educationAnchors = pickEducationAnchors(education?.data?.entities || []);
    const stateAnchors = pickStateAnchors(state?.data?.entities || []);
    const anchors = [...educationAnchors, ...stateAnchors];

    const integratedEntities = anchors.map((entity) => ({
        ...entity,
        integration: mapGoals(entity),
        governance: {
            basis: 'الكتاب والسنة',
            controls: ['العدل', 'الأمانة', 'الإحسان', 'لا ضرر ولا ضرار']
        },
        reviewCycle: 'quarterly'
    }));

    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'تكامل التعليم واستثمارات الدولة يوجّه للمنفعة العامة والتنمية العادلة.'
            },
            stats: {
                educationAnchors: educationAnchors.length,
                stateAnchors: stateAnchors.length,
                totalIntegratedEntities: integratedEntities.length
            },
            integratedEntities
        },
        message: 'تم ربط أهداف التعليم واستثمارات الدولة ضمن منظومة الأهداف الموحدة',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 4), 'utf8');
    console.log(`Cross-sector integration written: ${OUT_PATH}`);
    console.log(`Education anchors             : ${educationAnchors.length}`);
    console.log(`State anchors                 : ${stateAnchors.length}`);
    console.log(`Total integrated              : ${integratedEntities.length}`);
}

main();
