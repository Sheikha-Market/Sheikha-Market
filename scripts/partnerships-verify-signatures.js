#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTRACTS_DIR = path.join(ROOT_DIR, 'reports', 'partnerships', 'contracts');
const MANIFEST_PATH = path.join(
    ROOT_DIR,
    'reports',
    'partnerships',
    'signed-manifests',
    'partnerships-signed-manifest-latest.json'
);

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function hmacSha256(message, key) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
}

function listContractFiles() {
    if (!fs.existsSync(CONTRACTS_DIR)) {
        return [];
    }

    return fs
        .readdirSync(CONTRACTS_DIR)
        .filter((name) => name.startsWith('spa-') && name.endsWith('.json'))
        .sort();
}

function readManifest() {
    if (!fs.existsSync(MANIFEST_PATH)) {
        throw new Error('Signed manifest file not found: reports/partnerships/signed-manifests/partnerships-signed-manifest-latest.json');
    }

    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function verifyEntry(entry, manifestMeta, signingKey, contractsDir = CONTRACTS_DIR) {
    const fail = reason => ({ ok: false, reason, electronicAgreementSigned: false });
    if (!entry || !manifestMeta || typeof entry.fileName !== 'string' || !/^spa-[a-zA-Z0-9_-]+\.json$/.test(entry.fileName)) return fail('invalid-entry');
    if (!['hmac-sha256', 'sha256-audit-seal'].includes(entry.sealType)) return fail('unsupported-seal-type');
    if (entry.sealType === 'hmac-sha256' && !signingKey) return fail('hmac-key-required');
    if (entry.relativePath !== path.join('reports', 'partnerships', 'contracts', entry.fileName)) return fail('scope-mismatch');
    if (typeof entry.fileSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.fileSha256) || typeof entry.digitalSeal !== 'string' || !/^[a-f0-9]{64}$/.test(entry.digitalSeal)) return fail('invalid-digest');
    const absolutePath = path.join(contractsDir, entry.fileName);
    if (fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isSymbolicLink()) return fail('symlink-denied');

    if (!fs.existsSync(absolutePath)) {
        return {
            ok: false,
            fileName: entry.fileName,
            contractId: entry.contractId,
            reason: 'missing-file'
        };
    }

    const raw = fs.readFileSync(absolutePath);
    const computedHash = sha256(raw);

    if (computedHash !== entry.fileSha256) {
        return {
            ok: false,
            fileName: entry.fileName,
            contractId: entry.contractId,
            reason: 'hash-mismatch',
            expected: entry.fileSha256,
            actual: computedHash
        };
    }

    const message = `${entry.contractId}|${entry.fileName}|${entry.fileSha256}|${manifestMeta.signedAt}|${manifestMeta.signer}`;
    const expectedSeal = entry.sealType === 'hmac-sha256'
        ? hmacSha256(message, signingKey)
        : sha256(Buffer.from(message, 'utf8'));

    if (!crypto.timingSafeEqual(Buffer.from(expectedSeal, 'hex'), Buffer.from(entry.digitalSeal, 'hex'))) {
        return {
            ok: false,
            fileName: entry.fileName,
            contractId: entry.contractId,
            reason: 'seal-mismatch'
        };
    }

    return {
        ok: true,
        assurance: 'FILE_INTEGRITY_ONLY',
        electronicAgreementSigned: false,
        fileName: entry.fileName,
        contractId: entry.contractId
    };
}

function main() {
    try {
        const manifest = readManifest();
        const allContracts = listContractFiles();
        const signingKey = process.env.PARTNERSHIPS_SIGNING_KEY || '';

        const checks = manifest.entries.map((entry) => verifyEntry(entry, manifest.metadata, signingKey));

        const manifestFileSet = new Set(manifest.entries.map((entry) => entry.fileName));
        const unsignedFiles = allContracts.filter((fileName) => !manifestFileSet.has(fileName));

        const failedChecks = checks.filter((result) => !result.ok);
        const passedChecks = checks.filter((result) => result.ok).length;

        const status = checks.length > 0 && manifestFileSet.size === checks.length && failedChecks.length === 0 && unsignedFiles.length === 0 ? 'PASS' : 'FAIL';

        console.log('============================================================');
        console.log('SHEIKHA PARTNERSHIP INTEGRITY VERIFICATION ONLY');
        console.log('ELECTRONIC_AGREEMENT_SIGNATURE_VERIFIED=false');
        console.log('============================================================');
        console.log(`Status            : ${status}`);
        console.log(`Manifest Entries  : ${manifest.entries.length}`);
        console.log(`Passed Checks     : ${passedChecks}`);
        console.log(`Failed Checks     : ${failedChecks.length}`);
        console.log(`Unsigned Files    : ${unsignedFiles.length}`);
        console.log(`Seal Mode         : ${manifest.entries[0] ? manifest.entries[0].sealType : 'n/a'}`);
        console.log('============================================================');

        if (unsignedFiles.length > 0) {
            console.log('Unsigned contract files detected:');
            unsignedFiles.forEach((fileName) => {
                console.log(` - ${fileName}`);
            });
        }

        if (failedChecks.length > 0) {
            console.log('Failed entries:');
            failedChecks.forEach((item) => {
                console.log(` - ${item.fileName} [${item.reason}]`);
            });
        }

        if (status === 'FAIL') {
            process.exit(2);
        }
    } catch (error) {
        console.error(`Verification error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) main();
module.exports = { verifyEntry };
