#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-quranic-science-integration-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-quranic-science-integration-core');
const force = process.argv.includes('--force');

function nowIso() {
    return new Date().toISOString();
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJson(filePath, payload) {
    if (fs.existsSync(filePath) && !force) {
        return { filePath, written: false, reason: 'exists' };
    }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    return { filePath, written: true };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'contemplation'));
    ensureDir(path.join(OUT_DIR, 'methodology'));
    ensureDir(path.join(OUT_DIR, 'fusion'));
    ensureDir(path.join(OUT_DIR, 'sustainability'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'quranic-science-integration-core-spec.json'), {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        targets: config.targets
    }));
    artifacts.push(writeJson(path.join(OUT_DIR, 'contemplation', 'quran-contemplation-cases.json'), {
        generatedAt: nowIso(),
        cases: config.quranContemplationCases
    }));
    artifacts.push(writeJson(path.join(OUT_DIR, 'methodology', 'hujjah-burhan-istidlal-bayan-framework.json'), {
        generatedAt: nowIso(),
        methodology: config.foundation.methodology,
        tracks: config.integrationTracks
    }));
    artifacts.push(writeJson(path.join(OUT_DIR, 'fusion', 'science-fusion-domains.json'), {
        generatedAt: nowIso(),
        domains: config.scienceFusionDomains,
        integrationTracks: config.integrationTracks
    }));
    artifacts.push(writeJson(path.join(OUT_DIR, 'sustainability', 'sustainable-barakah-framework.json'), {
        generatedAt: nowIso(),
        sustainability: config.sustainableDevelopment
    }));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'quranic-science-governance.json'), {
        generatedAt: nowIso(),
        foundation: config.foundation,
        reviewLayers: ['sharia-review', 'scientific-review', 'methodology-review']
    }));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة التكامل القرآني العلمي بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
