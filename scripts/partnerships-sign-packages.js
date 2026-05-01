#!/usr/bin/env node

/**
 * Partnership packages digital sealing
 * Creates a signed audit manifest for generated contract packages.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const CONTRACTS_DIR = path.join(ROOT, 'reports', 'partnerships', 'contracts');
const SIGNED_DIR = path.join(ROOT, 'reports', 'partnerships', 'signed-manifests');

function hashBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function hmacSignature(message, key) {
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

function buildManifest(files) {
    const signedAt = new Date().toISOString();
    const signer = process.env.SHEIKHA_SIGNER || 'Sheikha Partnership Office';
    const owner = process.env.SHEIKHA_OWNER || 'Salman Ahmed bin Salman Al-Rajhi';
    const signingKey = process.env.PARTNERSHIPS_SIGNING_KEY || '';

    const entries = files.map((fileName) => {
        const absPath = path.join(CONTRACTS_DIR, fileName);
        const raw = fs.readFileSync(absPath);
        const fileSha256 = hashBuffer(raw);
        const parsed = JSON.parse(raw.toString('utf8'));

        const contractId = parsed?.metadata?.contractId || 'unknown-contract-id';
        const message = `${contractId}|${fileName}|${fileSha256}|${signedAt}|${signer}`;
        const seal = signingKey ? hmacSignature(message, signingKey) : hashBuffer(Buffer.from(message, 'utf8'));

        return {
            contractId,
            fileName,
            relativePath: path.join('reports', 'partnerships', 'contracts', fileName),
            fileSha256,
            sealType: signingKey ? 'hmac-sha256' : 'sha256-audit-seal',
            digitalSeal: seal
        };
    });

    return {
        metadata: {
            manifestType: 'Sheikha Partnership Signed Manifest',
            signedAt,
            signer,
            owner,
            contractsCount: entries.length,
            note: signingKey
                ? 'HMAC signature enabled via PARTNERSHIPS_SIGNING_KEY'
                : 'Audit seal mode (no private key). Set PARTNERSHIPS_SIGNING_KEY for HMAC signature.'
        },
        entries
    };
}

function saveManifest(manifest) {
    if (!fs.existsSync(SIGNED_DIR)) {
        fs.mkdirSync(SIGNED_DIR, { recursive: true });
    }

    const stamp = manifest.metadata.signedAt.replace(/[:.]/g, '-');
    const outputPath = path.join(SIGNED_DIR, `partnerships-signed-manifest-${stamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

    const latestPath = path.join(SIGNED_DIR, 'partnerships-signed-manifest-latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(manifest, null, 2));

    return { outputPath, latestPath };
}

function main() {
    const files = listContractFiles();

    if (files.length === 0) {
        console.error('No contract files found in reports/partnerships/contracts');
        process.exit(1);
    }

    const manifest = buildManifest(files);
    const { outputPath, latestPath } = saveManifest(manifest);

    console.log('============================================================');
    console.log('SHEIKHA PARTNERSHIP DIGITAL SIGNING COMPLETE');
    console.log('============================================================');
    console.log(`Contracts Sealed : ${manifest.metadata.contractsCount}`);
    console.log(`Signer           : ${manifest.metadata.signer}`);
    console.log(`Mode             : ${manifest.entries[0].sealType}`);
    console.log(`Manifest File    : ${outputPath}`);
    console.log(`Latest Manifest  : ${latestPath}`);
    console.log('============================================================');
}

main();
