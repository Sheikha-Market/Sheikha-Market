#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { signPolicies, verifyPolicies } = require('../sheikha-language/compiler/policy-signatures');

const argv = new Set(process.argv.slice(2));
const apply = argv.has('--apply');
const target = (process.env.SHEIKHA_POLICY_TARGET || 'production').toLowerCase();

const keyEnvByTarget = {
    production: 'SHEIKHA_POLICY_SIGNING_KEY_PROD',
    staging: 'SHEIKHA_POLICY_SIGNING_KEY_STAGING',
};

const keyEnv = keyEnvByTarget[target] || keyEnvByTarget.production;

const manifestPath = process.env.SHEIKHA_POLICY_MANIFEST || 'sheikha-language/policies/policy-signatures.json';
const manifestFullPath = path.resolve(process.cwd(), manifestPath);
const files = [
    'sheikha-language/compiler/sandbox-policy.js',
    'sheikha-language/compiler/governance.js',
];

const maxAgeDays = Number(process.env.SHEIKHA_POLICY_ROTATION_DAYS || 30);
const alertBeforeDays = Number(process.env.SHEIKHA_POLICY_ROTATION_ALERT_BEFORE_DAYS || 5);
const now = Date.now();

if (!fs.existsSync(manifestFullPath)) {
    console.error('SHEIKHA_POLICY_ROTATION=FAIL manifest missing: ' + manifestPath);
    process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestFullPath, 'utf8'));
const signedAt = Date.parse(manifest.signedAt || 0);
const ageDays = Number.isFinite(signedAt) ? (now - signedAt) / (24 * 60 * 60 * 1000) : Infinity;

const currentKey = process.env[keyEnv];
const verify = verifyPolicies({
    baseDir: process.cwd(),
    manifest,
    key: currentKey,
    requireKey: true,
    keyName: keyEnv,
});
if (!verify.ok) {
    for (const error of verify.errors) {
        console.error('[POLICY-ROTATION] ' + error);
    }
    process.exit(2);
}

if (!apply) {
    const due = ageDays >= maxAgeDays;
    const remainingDays = maxAgeDays - ageDays;
    const alert = remainingDays <= alertBeforeDays;
    console.log('SHEIKHA_POLICY_ROTATION_AUDIT=OK');
    console.log('SHEIKHA_POLICY_TARGET=' + target.toUpperCase());
    console.log('SHEIKHA_POLICY_KEY_ENV=' + keyEnv);
    console.log('SHEIKHA_POLICY_ROTATION_AGE_DAYS=' + ageDays.toFixed(2));
    console.log('SHEIKHA_POLICY_ROTATION_REMAINING_DAYS=' + remainingDays.toFixed(2));
    console.log('SHEIKHA_POLICY_ROTATION_ALERT=' + (alert ? 'YES' : 'NO'));
    console.log('SHEIKHA_POLICY_ROTATION_DUE=' + (due ? 'YES' : 'NO'));
    if (due) {
        process.exit(3);
    }
    process.exit(0);
}

const nextKeyEnv = keyEnv + '_NEXT';
const nextKey = process.env[nextKeyEnv] || crypto.randomBytes(48).toString('hex');
const newManifest = signPolicies({
    baseDir: process.cwd(),
    files,
    key: nextKey,
    metadata: {
        basis: 'Quran-and-Sunnah governance baseline',
        tawheed: 'لله وحده',
        keyName: keyEnv,
        target,
        rotatedFrom: manifest.signedAt || 'unknown',
        rotationCycleDays: maxAgeDays,
    },
});
fs.writeFileSync(manifestFullPath, JSON.stringify(newManifest, null, 2));

const outputPath = process.env.SHEIKHA_POLICY_ROTATION_OUTPUT || '/tmp/sheikha-policy-next-key.txt';
fs.writeFileSync(outputPath, nextKey + '\n', { mode: 0o600 });

console.log('SHEIKHA_POLICY_ROTATION_APPLIED=YES');
console.log('SHEIKHA_POLICY_TARGET=' + target.toUpperCase());
console.log('SHEIKHA_POLICY_KEY_ENV=' + keyEnv);
console.log('SHEIKHA_POLICY_ROTATION_NEW_MANIFEST=' + manifestPath);
console.log('SHEIKHA_POLICY_ROTATION_NEXT_KEY_ENV=' + nextKeyEnv);
console.log('SHEIKHA_POLICY_ROTATION_NEXT_KEY_FILE=' + outputPath);
