'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function sha256File(filePath) {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
}

function signPolicies({ baseDir, files, key, metadata = {} }) {
    const keyName = metadata.keyName || 'SHEIKHA_POLICY_SIGNING_KEY';
    if (!key) {
        throw new Error(`${keyName} is required for signing.`);
    }

    const normalizedFiles = [...files]
        .map((relativePath) => {
            const absolutePath = path.resolve(baseDir, relativePath);
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Policy file not found: ${relativePath}`);
            }
            return {
                path: relativePath,
                sha256: sha256File(absolutePath),
            };
        })
        .sort((a, b) => a.path.localeCompare(b.path));

    const payload = {
        version: 1,
        algorithm: 'HMAC-SHA256',
        signedAt: new Date().toISOString(),
        metadata,
        files: normalizedFiles,
    };

    const canonical = canonicalString(payload);
    const signature = crypto.createHmac('sha256', key).update(canonical).digest('hex');

    return {
        ...payload,
        signature,
    };
}

function verifyPolicies({ baseDir, manifest, key, requireKey = true, keyName }) {
    const errors = [];
    const resolvedKeyName = keyName || manifest?.metadata?.keyName || 'SHEIKHA_POLICY_SIGNING_KEY';

    if (!manifest || !Array.isArray(manifest.files)) {
        return { ok: false, errors: ['Invalid policy signatures manifest.'] };
    }

    if (requireKey && !key) {
        return { ok: false, errors: [`${resolvedKeyName} is required for verification.`] };
    }

    for (const fileEntry of manifest.files) {
        const absolutePath = path.resolve(baseDir, fileEntry.path);
        if (!fs.existsSync(absolutePath)) {
            errors.push(`Missing policy file: ${fileEntry.path}`);
            continue;
        }

        const actual = sha256File(absolutePath);
        if (actual !== fileEntry.sha256) {
            errors.push(`Policy hash mismatch: ${fileEntry.path}`);
        }
    }

    const canonical = canonicalString({
        version: manifest.version,
        algorithm: manifest.algorithm,
        signedAt: manifest.signedAt,
        metadata: manifest.metadata || {},
        files: [...manifest.files].sort((a, b) => a.path.localeCompare(b.path)),
    });

    if (key) {
        const expectedSignature = crypto.createHmac('sha256', key).update(canonical).digest('hex');
        if (manifest.signature !== expectedSignature) {
            errors.push('Policy signature mismatch.');
        }
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}

function canonicalString(payload) {
    return JSON.stringify(payload);
}

module.exports = {
    signPolicies,
    verifyPolicies,
};
