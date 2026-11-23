#!/usr/bin/env node

/**
 * Partnership packages digital sealing
 * Creates an integrity manifest, never a counterparty agreement signature.
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

function buildManifest(files, options = {}) {
    const signedAt = options.createdAt || new Date().toISOString();
    const signer = options.signer || process.env.SHEIKHA_SIGNER || 'UNVERIFIED_OPERATOR';
    const owner = options.owner || process.env.SHEIKHA_OWNER || 'UNVERIFIED_OWNER';
    const signingKey = options.signingKey ?? process.env.PARTNERSHIPS_SIGNING_KEY ?? '';
    const contractsDir = options.contractsDir || CONTRACTS_DIR;

    const entries = files.map((fileName) => {
        if (!/^spa-[a-zA-Z0-9_-]+\.json$/.test(fileName)) throw new Error('INVALID_CONTRACT_FILE_NAME');
        const absPath = path.join(contractsDir, fileName);
        if (fs.lstatSync(absPath).isSymbolicLink()) throw new Error('CONTRACT_SYMLINK_DENIED');
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
            manifestType: 'Sheikha Partnership Integrity Manifest',
            assurance: 'INTEGRITY_ONLY_NOT_ELECTRONIC_AGREEMENT_SIGNATURE',
            electronicAgreementSigned: false,
            signerIdentityVerified: false,
            legalEffectVerified: false,
            legacySignedAtFieldMeaning: 'INTEGRITY_MANIFEST_CREATION_TIME',
            signedAt,
            signer,
            owner,
            contractsCount: entries.length,
            note: signingKey
                ? 'HMAC authenticates integrity under a shared key, not legal identity or agreement consent.'
                : 'Unkeyed audit checksum only; does not authenticate a signer or conclude a contract.'
        },
        entries
    };
}

function saveManifest(manifest) {
    if (!fs.existsSync(SIGNED_DIR)) {
        fs.mkdirSync(SIGNED_DIR, { recursive: true, mode: 0o700 });
    }

    const stamp = manifest.metadata.signedAt.replace(/[:.]/g, '-');
    const outputPath = path.join(SIGNED_DIR, `partnerships-signed-manifest-${stamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), { mode: 0o600, flag: 'wx' });

    const latestPath = path.join(SIGNED_DIR, 'partnerships-signed-manifest-latest.json');
    if (fs.existsSync(latestPath) && (fs.lstatSync(latestPath).isSymbolicLink() || (fs.statSync(latestPath).mode & 0o777) !== 0o600)) throw new Error('UNSAFE_EXISTING_MANIFEST');
    fs.writeFileSync(latestPath, JSON.stringify(manifest, null, 2), { mode: 0o600 });

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
    console.log('SHEIKHA PARTNERSHIP INTEGRITY MANIFEST COMPLETE');
    console.log('ELECTRONIC_AGREEMENT_SIGNED=false');
    console.log('============================================================');
    console.log(`Contracts Sealed : ${manifest.metadata.contractsCount}`);
    console.log(`Signer           : ${manifest.metadata.signer}`);
    console.log(`Mode             : ${manifest.entries[0].sealType}`);
    console.log(`Manifest File    : ${outputPath}`);
    console.log(`Latest Manifest  : ${latestPath}`);
    console.log('============================================================');
}

if (require.main === module) main();
module.exports = { buildManifest };
