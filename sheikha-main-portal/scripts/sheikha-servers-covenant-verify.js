#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT_DIR, 'reports', 'servers', 'unified-server-covenant-latest.json');
const SEAL_PATH = path.join(ROOT_DIR, 'reports', 'servers', 'signed-seals', 'unified-server-covenant-seal-latest.json');

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function hmacSha256(message, key) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
}

function ensureFiles() {
    if (!fs.existsSync(REPORT_PATH)) {
        throw new Error('Covenant report not found. Run ops:servers:covenant first.');
    }

    if (!fs.existsSync(SEAL_PATH)) {
        throw new Error('Covenant seal not found. Run ops:servers:covenant:sign first.');
    }
}

function verify() {
    const reportRaw = fs.readFileSync(REPORT_PATH);
    const reportSha256 = sha256(reportRaw);
    const sealDoc = JSON.parse(fs.readFileSync(SEAL_PATH, 'utf8'));
    const seal = sealDoc?.data?.seal;

    if (!seal) {
        throw new Error('Invalid seal file format.');
    }

    const relativeReportPath = path.join('reports', 'servers', 'unified-server-covenant-latest.json');
    const message = `${relativeReportPath}|${seal.reportSha256}|${seal.signedAt}|${seal.signer}`;
    const signingKey = process.env.SERVERS_COVENANT_SIGNING_KEY || '';

    const hashMatch = reportSha256 === seal.reportSha256;

    let expectedSeal = '';
    let keyRequiredButMissing = false;

    if (seal.sealType === 'hmac-sha256') {
        if (!signingKey) {
            keyRequiredButMissing = true;
        } else {
            expectedSeal = hmacSha256(message, signingKey);
        }
    } else {
        expectedSeal = sha256(Buffer.from(message, 'utf8'));
    }

    const sealMatch = keyRequiredButMissing ? false : expectedSeal === seal.digitalSeal;
    const status = hashMatch && sealMatch ? 'PASS' : 'FAIL';

    return {
        status,
        sealType: seal.sealType,
        reportSha256,
        sealedReportSha256: seal.reportSha256,
        hashMatch,
        sealMatch,
        keyRequiredButMissing
    };
}

function main() {
    try {
        ensureFiles();
        const result = verify();

        console.log('============================================================');
        console.log('SHEIKHA UNIFIED SERVER COVENANT SEAL VERIFICATION');
        console.log('============================================================');
        console.log(`Status              : ${result.status}`);
        console.log(`Seal Type           : ${result.sealType}`);
        console.log(`Hash Match          : ${result.hashMatch ? 'yes' : 'no'}`);
        console.log(`Seal Match          : ${result.sealMatch ? 'yes' : 'no'}`);
        console.log(`Key Missing (HMAC)  : ${result.keyRequiredButMissing ? 'yes' : 'no'}`);
        console.log('============================================================');

        if (result.status !== 'PASS') {
            process.exit(2);
        }
    } catch (error) {
        console.error(`Verification error: ${error.message}`);
        process.exit(1);
    }
}

main();
