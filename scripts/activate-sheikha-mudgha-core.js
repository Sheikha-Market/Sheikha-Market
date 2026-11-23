#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-mudgha-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-mudgha-core');
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
    ensureDir(path.join(OUT_DIR, 'heart'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        reference: config.reference,
        governance: config.governance,
        heartLayers: config.heartLayers,
        targets: config.targets
    };

    const heartSpec = {
        generatedAt: nowIso(),
        layers: config.heartLayers.map((layer, index) => ({
            id: index + 1,
            layer,
            status: 'activated-heart-core'
        }))
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        controls: config.governance.controls,
        values: config.governance.values,
        rule: 'human-in-the-loop'
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'mudgha-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'heart', 'heart-layers.json'), heartSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'governance-controls.json'), governanceSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل شيخة مضغة العالم والكون',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
