'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { signPolicies, verifyPolicies } = require('../policy-signatures');

test('policy signatures sign and verify successfully', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-policy-'));
    const policyPath = path.join(tmp, 'policy.js');
    fs.writeFileSync(policyPath, 'module.exports = { allow: true };\n');

    const manifest = signPolicies({
        baseDir: tmp,
        files: ['policy.js'],
        key: 'test-key',
    });

    const verified = verifyPolicies({
        baseDir: tmp,
        manifest,
        key: 'test-key',
        requireKey: true,
    });

    assert.equal(verified.ok, true);
    assert.equal(verified.errors.length, 0);
});

test('policy signatures detect tampering', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-policy-'));
    const policyPath = path.join(tmp, 'policy.js');
    fs.writeFileSync(policyPath, 'module.exports = { allow: true };\n');

    const manifest = signPolicies({
        baseDir: tmp,
        files: ['policy.js'],
        key: 'test-key',
    });

    fs.writeFileSync(policyPath, 'module.exports = { allow: false };\n');

    const verified = verifyPolicies({
        baseDir: tmp,
        manifest,
        key: 'test-key',
        requireKey: true,
    });

    assert.equal(verified.ok, false);
    assert.ok(verified.errors.some((error) => error.includes('mismatch')));
});
