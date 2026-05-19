#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { signPolicies, verifyPolicies } = require('./policy-signatures');

const action = process.argv[2];
const baseDir = process.cwd();
const defaultManifest = 'sheikha-language/policies/policy-signatures.json';
const defaultFiles = [
    'sheikha-language/compiler/sandbox-policy.js',
    'sheikha-language/compiler/governance.js',
];

let manifestPath = defaultManifest;
let keyEnv = 'SHEIKHA_POLICY_SIGNING_KEY';
let files = defaultFiles;
let mode = 'default';

for (let i = 3; i < process.argv.length; i++) {
    if (process.argv[i] === '--manifest' && process.argv[i + 1]) {
        manifestPath = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--key-env' && process.argv[i + 1]) {
        keyEnv = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--files' && process.argv[i + 1]) {
        files = process.argv[i + 1].split(',').map((v) => v.trim()).filter(Boolean);
        i++;
        continue;
    }
    if (process.argv[i] === '--mode' && process.argv[i + 1]) {
        mode = process.argv[i + 1];
        i++;
    }
}

if (mode === 'production') {
    keyEnv = 'SHEIKHA_POLICY_SIGNING_KEY_PROD';
} else if (mode === 'staging') {
    keyEnv = 'SHEIKHA_POLICY_SIGNING_KEY_STAGING';
}

if (action !== 'sign' && action !== 'verify') {
    console.error('Usage: node policy-signatures-cli.js <sign|verify> [--manifest file] [--files a,b,c] [--key-env ENV_KEY] [--mode production|staging]');
    process.exit(1);
}

const key = process.env[keyEnv];

if (action === 'sign') {
    const manifest = signPolicies({
        baseDir,
        files,
        key,
        metadata: {
            basis: 'Quran-and-Sunnah governance baseline',
            tawheed: 'لله وحده',
            keyName: keyEnv,
        },
    });
    const absoluteManifestPath = path.resolve(baseDir, manifestPath);
    fs.mkdirSync(path.dirname(absoluteManifestPath), { recursive: true });
    fs.writeFileSync(absoluteManifestPath, JSON.stringify(manifest, null, 2));
    console.log('SHEIKHA_POLICY_SIGNATURES_SIGNED=' + manifestPath);
    process.exit(0);
}

const absoluteManifestPath = path.resolve(baseDir, manifestPath);
if (!fs.existsSync(absoluteManifestPath)) {
    console.error('Policy signatures manifest not found: ' + manifestPath);
    process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(absoluteManifestPath, 'utf8'));
const verification = verifyPolicies({
    baseDir,
    manifest,
    key,
    requireKey: true,
});

if (!verification.ok) {
    for (const error of verification.errors) {
        console.error('[POLICY:FAIL] ' + error);
    }
    process.exit(2);
}

console.log('SHEIKHA_POLICY_SIGNATURES_VERIFIED=' + manifestPath);
