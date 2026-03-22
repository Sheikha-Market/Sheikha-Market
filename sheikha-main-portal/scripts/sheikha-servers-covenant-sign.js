#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT_DIR, 'reports', 'servers', 'unified-server-covenant-latest.json');
const SIGNED_DIR = path.join(ROOT_DIR, 'reports', 'servers', 'signed-seals');

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function hmacSha256(message, key) {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
}

function ensureReportExists() {
    if (!fs.existsSync(REPORT_PATH)) {
        throw new Error('Covenant report not found. Run ops:servers:covenant first.');
    }
}

function buildSealPayload() {
    const raw = fs.readFileSync(REPORT_PATH);
    const reportSha256 = sha256(raw);
    const signedAt = new Date().toISOString();
    const signer = process.env.SHEIKHA_COVENANT_SIGNER || 'Sheikha Server Covenant Office';
    const owner = process.env.SHEIKHA_OWNER || 'Salman Ahmed bin Salman Al-Rajhi';
    const signingKey = process.env.SERVERS_COVENANT_SIGNING_KEY || '';
    const relativeReportPath = path.join('reports', 'servers', 'unified-server-covenant-latest.json');
    const message = `${relativeReportPath}|${reportSha256}|${signedAt}|${signer}`;

    return {
        success: true,
        data: {
            seal: {
                sealType: signingKey ? 'hmac-sha256' : 'sha256-audit-seal',
                digitalSeal: signingKey ? hmacSha256(message, signingKey) : sha256(Buffer.from(message, 'utf8')),
                reportSha256,
                signedAt,
                signer,
                owner,
                reportPath: relativeReportPath,
                note: signingKey
                    ? 'HMAC signature enabled via SERVERS_COVENANT_SIGNING_KEY'
                    : 'Audit seal mode (no private key). Set SERVERS_COVENANT_SIGNING_KEY for HMAC signature.'
            }
        },
        message: 'Unified server covenant report sealed successfully',
        timestamp: signedAt
    };
}

function saveSeal(payload) {
    if (!fs.existsSync(SIGNED_DIR)) {
        fs.mkdirSync(SIGNED_DIR, { recursive: true });
    }

    const stamp = payload.timestamp.replace(/[:.]/g, '-');
    const filePath = path.join(SIGNED_DIR, `unified-server-covenant-seal-${stamp}.json`);
    const latestPath = path.join(SIGNED_DIR, 'unified-server-covenant-seal-latest.json');

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    fs.writeFileSync(latestPath, JSON.stringify(payload, null, 4) + '\n', 'utf8');

    return { filePath, latestPath };
}

function main() {
    try {
        ensureReportExists();

        const payload = buildSealPayload();
        const { filePath, latestPath } = saveSeal(payload);
        const seal = payload.data.seal;

        console.log('============================================================');
        console.log('SHEIKHA UNIFIED SERVER COVENANT DIGITAL SEAL');
        console.log('============================================================');
        console.log(`Seal Type       : ${seal.sealType}`);
        console.log(`Signer          : ${seal.signer}`);
        console.log(`Signed At       : ${seal.signedAt}`);
        console.log(`Report SHA256   : ${seal.reportSha256}`);
        console.log(`Seal File       : ${filePath}`);
        console.log(`Latest Seal     : ${latestPath}`);
        console.log('============================================================');
    } catch (error) {
        console.error(`Seal error: ${error.message}`);
        process.exit(1);
    }
}

main();
