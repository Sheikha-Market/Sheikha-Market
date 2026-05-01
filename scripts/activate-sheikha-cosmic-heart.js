#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-cosmic-heart.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-cosmic-heart');
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
    ensureDir(path.join(OUT_DIR, 'pulse-grid'));
    ensureDir(path.join(OUT_DIR, 'cloud-core'));

    const heartSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        coreLayers: config.coreLayers,
        hyperscale: config.hyperscale
    };

    const pulseSpec = {
        generatedAt: nowIso(),
        pulseLayers: config.coreLayers.map((name, index) => ({
            id: index + 1,
            name,
            status: 'activated-foundation',
            priority: index + 1
        })),
        kpiTargets: {
            availability: config.hyperscale.availabilityTarget,
            p95Ms: config.hyperscale.apiP95Ms,
            p99Ms: config.hyperscale.apiP99Ms
        }
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'cosmic-heart-spec.json'), heartSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'pulse-grid', 'global-pulse-spec.json'), pulseSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل شيخة قلب الكون والعالم بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
