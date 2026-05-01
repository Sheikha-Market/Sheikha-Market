#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-root-seed-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-root-seed-core');
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
    ensureDir(path.join(OUT_DIR, 'seed'));
    ensureDir(path.join(OUT_DIR, 'root'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        rootArchitecture: config.rootArchitecture
    };

    const seedSpec = {
        generatedAt: nowIso(),
        layers: config.rootArchitecture.seedLayers.map((name, index) => ({
            id: index + 1,
            layer: name,
            status: 'active-seed'
        }))
    };

    const rootSpec = {
        generatedAt: nowIso(),
        layers: config.rootArchitecture.rootLayers.map((name, index) => ({
            id: index + 1,
            layer: name,
            status: 'active-root'
        })),
        targets: config.rootArchitecture.targets
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        sources: config.foundation.sources,
        coreValues: config.foundation.coreValues,
        controls: config.foundation.controls,
        policy: 'human-in-the-loop'
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'root-seed-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'seed', 'seed-layers.json'), seedSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'root', 'root-layers.json'), rootSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'book-and-sunnah-governance.json'), governanceSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة البذر والجذر بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
