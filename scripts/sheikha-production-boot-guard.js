#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { verifyPolicies } = require('../sheikha-language/compiler/policy-signatures');

const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
if (!isProduction) {
    console.log('SHEIKHA_PROD_BOOT_GUARD=SKIPPED_NON_PRODUCTION');
    process.exit(0);
}

const manifestPath = process.env.SHEIKHA_POLICY_MANIFEST || 'sheikha-language/policies/policy-signatures.json';
const manifestFullPath = path.resolve(process.cwd(), manifestPath);
if (!fs.existsSync(manifestFullPath)) {
    console.error('SHEIKHA_PROD_BOOT_GUARD=FAIL manifest missing: ' + manifestPath);
    process.exit(2);
}

const key = process.env.SHEIKHA_POLICY_SIGNING_KEY_PROD;
const manifest = JSON.parse(fs.readFileSync(manifestFullPath, 'utf8'));
const verification = verifyPolicies({
    baseDir: process.cwd(),
    manifest,
    key,
    requireKey: true,
    keyName: 'SHEIKHA_POLICY_SIGNING_KEY_PROD',
});

if (!verification.ok) {
    for (const error of verification.errors) {
        console.error('[PROD-BOOT-GUARD] ' + error);
    }
    console.error('SHEIKHA_PROD_BOOT_GUARD=BLOCKED');
    process.exit(2);
}

console.log('SHEIKHA_PROD_BOOT_GUARD=PASSED');
