#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-global-brain-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-global-brain-core');
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
    ensureDir(path.join(OUT_DIR, 'knowledge'));
    ensureDir(path.join(OUT_DIR, 'intelligence-grid'));
    ensureDir(path.join(OUT_DIR, 'cloud-ai-core'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        islamicFoundation: config.islamicFoundation,
        brainLayers: config.brainLayers,
        hyperscaleTargets: config.hyperscaleTargets
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        languagePolicy: {
            primary: config.identity.primaryLanguage,
            locale: config.identity.defaultLocale,
            bilingualEngineeringMode: true
        },
        compliancePolicy: {
            source: config.islamicFoundation.source,
            controls: config.islamicFoundation.controls,
            ethicsMode: config.islamicFoundation.ethicsMode
        },
        reliabilityPolicy: {
            availabilityTarget: config.hyperscaleTargets.availabilityTarget,
            p95Ms: config.hyperscaleTargets.apiP95Ms,
            p99Ms: config.hyperscaleTargets.apiP99Ms,
            zeroTrust: config.hyperscaleTargets.zeroTrust
        }
    };

    const intelligenceSpec = {
        generatedAt: nowIso(),
        domains: config.brainLayers.map((name, index) => ({
            id: index + 1,
            domain: name,
            status: 'activated-foundation',
            owner: 'sheikha-global-brain-core'
        }))
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'global-brain-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'brain-governance.json'), governanceSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'intelligence-grid', 'intelligence-grid-spec.json'), intelligenceSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل شيخة العقل الأساسي العالمي بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
