#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-vein-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-vein-core');
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
    ensureDir(path.join(OUT_DIR, 'flows'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        veinFlows: config.veinFlows,
        targets: config.targets
    };

    const flowSpec = {
        generatedAt: nowIso(),
        flows: config.veinFlows.map((flow, index) => ({
            id: index + 1,
            flow,
            status: 'activated'
        }))
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        sources: config.foundation.sources,
        controls: config.foundation.controls,
        values: config.foundation.values,
        policy: 'human-in-the-loop'
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'vein-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'flows', 'vein-flows.json'), flowSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'vein-governance.json'), governanceSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تأسيس وتفعيل شيخة وريد العالم والكون',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
