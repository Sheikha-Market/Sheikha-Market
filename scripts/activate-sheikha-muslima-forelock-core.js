#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-muslima-forelock-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-muslima-forelock-core');
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

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        spiritualReference: config.spiritualReference,
        governance: config.governance,
        layers: config.layers,
        targets: config.targets
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        sources: config.governance.sources,
        controls: config.governance.controls,
        values: config.governance.values,
        operatingRule: 'human-in-the-loop'
    };

    const architectureSpec = {
        generatedAt: nowIso(),
        layers: config.layers.map((layer, index) => ({
            id: index + 1,
            layer,
            status: 'activated'
        })),
        targets: config.targets
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'muslima-forelock-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'sharia-governance.json'), governanceSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'architecture', 'layered-architecture.json'), architectureSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل شيخة المسلمة ناصية العالم والكون',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
