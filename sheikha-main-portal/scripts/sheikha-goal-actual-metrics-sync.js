#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TRACKING_DIR = path.join(DATA_DIR, 'tracking');
const ENTITY_GOALS_PATH = path.join(DATA_DIR, 'sheikha-entity-specific-goals.json');
const INPUT_PATH = path.join(TRACKING_DIR, 'sheikha-entity-execution-input.json');
const OUTPUT_PATH = path.join(TRACKING_DIR, 'sheikha-goal-actual-metrics-overrides.json');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath, fallback = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.warn(`Unable to read ${filePath}: ${error.message}`);
        return fallback;
    }
}

function normalizePercent(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(100, value));
}

function buildTemplate(entityGoalsPayload) {
    const entities = entityGoalsPayload?.entities || [];
    const rows = [];

    entities.forEach((entity) => {
        (entity.goals || []).forEach((goal) => {
            rows.push({
                goalId: goal.id,
                entity: entity.entity,
                metricName: goal.metrics?.[0]?.name || 'execution-rate',
                current: 0,
                target: 100,
                evidenceRef: 'update-with-official-report-id',
                updatedAt: new Date().toISOString(),
                notes: 'قم بإدخال نسبة التنفيذ الفعلية أو القيم الفعلية المعتمدة.'
            });
        });
    });

    return {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'تعبئة بيانات التنفيذ الفعلية أمانة شرعية وإدارية لصدق القياس.'
            },
            rows
        },
        message: 'نموذج إدخال التنفيذ الفعلي للجهات',
        timestamp: new Date().toISOString()
    };
}

function main() {
    ensureDir(TRACKING_DIR);

    const entityGoals = readJson(ENTITY_GOALS_PATH, { entities: [] });
    if (!fs.existsSync(INPUT_PATH)) {
        const template = buildTemplate(entityGoals);
        fs.writeFileSync(INPUT_PATH, JSON.stringify(template, null, 4), 'utf8');
    }

    const input = readJson(INPUT_PATH, { data: { rows: [] } });
    const rows = input?.data?.rows || [];

    const overrides = rows
        .map((row) => {
            const current = Number(row.current);
            const target = Number(row.target);
            if (!row.goalId || !Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
                return null;
            }
            const actualPercent = normalizePercent((current / target) * 100);
            return {
                goalId: row.goalId,
                entity: row.entity || 'unknown',
                actualPercent: Number(actualPercent.toFixed(2)),
                evidenceRef: row.evidenceRef || 'n/a',
                updatedAt: row.updatedAt || new Date().toISOString(),
                notes: row.notes || ''
            };
        })
        .filter(Boolean);

    const payload = {
        success: true,
        data: {
            generatedAt: new Date().toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'اعتماد القياس الفعلي الموثق كمرجع رئيس لتتبع إنجاز الأهداف.'
            },
            sourceInput: INPUT_PATH,
            overrides
        },
        message: 'تمت مزامنة نسب التنفيذ الفعلية للأهداف',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 4), 'utf8');

    console.log(`Actual execution input template : ${INPUT_PATH}`);
    console.log(`Actual metrics overrides written: ${OUTPUT_PATH}`);
    console.log(`Overrides count                : ${overrides.length}`);
}

main();