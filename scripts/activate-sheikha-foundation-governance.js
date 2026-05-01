#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-foundation-governance.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-foundation-governance');
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
    ensureDir(path.join(OUT_DIR, 'governance'));
    ensureDir(path.join(OUT_DIR, 'architecture'));
    ensureDir(path.join(OUT_DIR, 'rules'));

    const charter = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        sources: config.sources,
        targets: config.targets
    };

    const axes = {
        generatedAt: nowIso(),
        axes: config.coreAxes.map((axis, index) => ({
            id: index + 1,
            axis,
            status: 'active-foundation'
        }))
    };

    const rules = {
        generatedAt: nowIso(),
        foundationalRules: config.foundationalRules
    };

    const architecture = {
        generatedAt: nowIso(),
        layers: config.architectureLayers.map((layer, index) => ({
            order: index + 1,
            layer,
            status: 'baseline-defined'
        }))
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'charter.json'), charter));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'axes.json'), axes));
    artifacts.push(writeJson(path.join(OUT_DIR, 'rules', 'foundational-rules.json'), rules));
    artifacts.push(writeJson(path.join(OUT_DIR, 'architecture', 'layers.json'), architecture));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل محور وقواعد وهيكل شيخة الحاكم الأساسي',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
