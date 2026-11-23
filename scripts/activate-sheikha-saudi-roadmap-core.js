#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-saudi-roadmap-core.json');
const DATA_PATH = path.join(ROOT, 'data', 'sheikha-saudi-roadmap-sync.json');
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-saudi-roadmap-core');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function readJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function writeJson(f, p) { fs.writeFileSync(f, JSON.stringify(p, null, 4) + '\n', 'utf8'); }
function shouldSkip(f) { return !FORCE && fs.existsSync(f); }

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('[saudi-roadmap-core] config not found');
        process.exit(1);
    }

    const config = readJson(CONFIG_PATH);
    const ts = new Date().toISOString();
    ensureDir(path.join(CORE_DIR, 'timeline'));
    ensureDir(path.join(CORE_DIR, 'projects'));
    ensureDir(path.join(CORE_DIR, 'meetings'));
    ensureDir(path.join(CORE_DIR, 'systems'));
    ensureDir(path.join(CORE_DIR, 'governance'));

    const files = [
        [path.join(CORE_DIR, 'saudi-roadmap-core-spec.json'), {
            core: config.core,
            title: config.title,
            version: config.version,
            activatedAt: ts,
            basis: config.basis
        }],
        [path.join(CORE_DIR, 'timeline', 'timeline-phases.json'), {
            generatedAt: ts,
            phases: config.timelinePhases,
            tracks: config.tracks
        }],
        [path.join(CORE_DIR, 'projects', 'project-governance.json'), {
            generatedAt: ts,
            types: ['government', 'commercial', 'nonCommercial'],
            rule: 'كل مشروع يُفهرس مرحلياً ويرتبط بهدف ومؤشر'
        }],
        [path.join(CORE_DIR, 'meetings', 'meetings-framework.json'), {
            generatedAt: ts,
            required: ['reason', 'agenda', 'participants', 'decisions', 'results'],
            indexing: ['byReason', 'byDate', 'bySector']
        }],
        [path.join(CORE_DIR, 'systems', 'systems-catalog-framework.json'), {
            generatedAt: ts,
            fields: ['name', 'description', 'owner', 'sector', 'status', 'indexCard']
        }],
        [path.join(CORE_DIR, 'governance', 'saudi-roadmap-governance.json'), {
            generatedAt: ts,
            source: 'الكتاب والسنة',
            controls: ['no-harm', 'safety-first', 'official-verification-required']
        }]
    ];

    files.forEach(([f, payload]) => {
        if (!shouldSkip(f)) writeJson(f, payload);
    });

    if (!fs.existsSync(DATA_PATH) || FORCE) {
        const initial = {
            version: '1.0.0',
            updatedAt: ts,
            nationalStatus: {
                country: 'المملكة العربية السعودية',
                peaceAndSafety: true,
                note: 'الوضع الداخلي: أمان واستقرار ومنع الضرر'
            },
            timeline: [],
            projects: { government: [], commercial: [], nonCommercial: [] },
            initiatives: [],
            agreements: [],
            educationAndUniversities: [],
            meetings: [],
            systemsCatalog: [],
            indexes: { projectsByPhase: {}, meetingsByReason: {}, systemsBySector: {} },
            sourcePolicy: { officialOnly: true, noUnverifiedClaims: true, basis: 'الكتاب والسنة' }
        };
        writeJson(DATA_PATH, initial);
    }

    console.log(JSON.stringify({
        success: true,
        data: {
            core: config.core,
            activatedAt: ts,
            force: FORCE,
            files: files.map(([f]) => path.relative(ROOT, f)).concat(['data/sheikha-saudi-roadmap-sync.json'])
        },
        message: 'تم تفعيل نواة الرزنامة السعودية الشاملة',
        timestamp: ts
    }, null, 4));
}

main();
