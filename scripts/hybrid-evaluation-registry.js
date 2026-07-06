#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REGISTRY_PATH = path.resolve(process.cwd(), 'runtime/registry/hybrid-evaluation-registry.json');

function nowIso() {
    return new Date().toISOString();
}

function buildRegistry() {
    return {
        registry: 'sheikha-hybrid-evaluation',
        version: '1.0.0',
        status: 'active',
        generatedAt: nowIso(),
        policy: {
            minReadyScore: 85,
            conditionalMinScore: 70,
            principle: 'la-darar-wa-la-dirar'
        },
        script: 'scripts/hybrid-evaluation-score.js',
        template: 'docs/guides/SHEIKHA-HYBRID-ENGINEERING-EVALUATION-TEMPLATE.md'
    };
}

function generate() {
    const dir = path.dirname(REGISTRY_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(buildRegistry(), null, 2)}\n`, 'utf8');
    console.log(`Generated: ${path.relative(process.cwd(), REGISTRY_PATH)}`);
}

function check() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        generate();
    }

    const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        console.error(`Invalid JSON in registry: ${error.message}`);
        process.exit(1);
    }

    const required = ['registry', 'version', 'status', 'policy', 'script'];
    const missing = required.filter(key => !(key in parsed));
    if (missing.length > 0) {
        console.error(`Registry missing required fields: ${missing.join(', ')}`);
        process.exit(1);
    }

    if (!fs.existsSync(path.resolve(process.cwd(), parsed.script))) {
        console.error(`Referenced script not found: ${parsed.script}`);
        process.exit(1);
    }

    console.log('Hybrid evaluation registry check: OK');
}

function main() {
    const mode = process.argv[2];
    if (mode === 'generate') {
        generate();
        return;
    }
    if (mode === 'check') {
        check();
        return;
    }

    console.error('Usage: node scripts/hybrid-evaluation-registry.js <generate|check>');
    process.exit(1);
}

main();
