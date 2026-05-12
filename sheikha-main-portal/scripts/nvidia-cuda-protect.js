#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.join(__dirname, '..');

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        mode: 'all',
        reportDir: path.join(rootDir, 'reports', 'nvidia')
    };

    for (const arg of args) {
        if (arg.startsWith('--mode=')) {
            options.mode = arg.split('=')[1] || 'all';
        } else if (arg.startsWith('--report-dir=')) {
            options.reportDir = path.resolve(arg.split('=')[1] || options.reportDir);
        }
    }

    return options;
}

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
        if (!line || /^\s*#/.test(line)) {
            continue;
        }

        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) {
            continue;
        }

        const key = match[1];
        if (process.env[key]) {
            continue;
        }

        let value = match[2] || '';
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        process.env[key] = value;
    }
}

function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function hashFile(filePath) {
    return sha256(fs.readFileSync(filePath));
}

function ensureSecureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
    try {
        fs.chmodSync(dirPath, 0o700);
    } catch {
        // ignore chmod errors on restricted filesystems
    }
}

function writeSecureFile(filePath, content, encoding) {
    fs.writeFileSync(filePath, content, encoding ? { encoding, mode: 0o600 } : { mode: 0o600 });
    try {
        fs.chmodSync(filePath, 0o600);
    } catch {
        // ignore chmod errors on restricted filesystems
    }
}

function deriveKeyMaterial() {
    const keyHex = String(process.env.DATA_ENCRYPTION_KEY_HEX || '').trim();
    if (/^[a-fA-F0-9]{64}$/.test(keyHex)) {
        return {
            source: 'DATA_ENCRYPTION_KEY_HEX',
            version: process.env.DATA_ENCRYPTION_KEY_VERSION || 'v1',
            key: Buffer.from(keyHex, 'hex')
        };
    }

    const textKey = String(process.env.DATA_ENCRYPTION_KEY || '').trim();
    if (textKey) {
        return {
            source: 'DATA_ENCRYPTION_KEY',
            version: process.env.DATA_ENCRYPTION_KEY_VERSION || 'v1',
            key: crypto.createHash('sha256').update(textKey, 'utf8').digest()
        };
    }

    const privateHomeKey = String(process.env.SHEIKHA_PRIVATE_HOME_KEY || '').trim();
    if (privateHomeKey) {
        const normalized = privateHomeKey.startsWith('sha256:') ? privateHomeKey.slice(7) : privateHomeKey;
        const key = /^[a-fA-F0-9]{64}$/.test(normalized)
            ? Buffer.from(normalized, 'hex')
            : crypto.createHash('sha256').update(normalized, 'utf8').digest();

        return {
            source: 'SHEIKHA_PRIVATE_HOME_KEY',
            version: process.env.DATA_ENCRYPTION_KEY_VERSION || 'v1',
            key
        };
    }

    throw new Error('لا يوجد مفتاح تشفير صالح لحماية جلسة NVIDIA/CUDA');
}

function buildProtectedArtifacts() {
    const artifacts = [
        'scripts/nvidia-dev-auto.sh',
        'scripts/vscode-cuda-verify.sh',
        'scripts/cuda-verify.py',
        'scripts/cuda-profile.py',
        'package.json',
        'server.js'
    ];

    const items = artifacts
        .map((relativePath) => {
            const absolutePath = path.join(rootDir, relativePath);
            if (!fs.existsSync(absolutePath)) {
                return null;
            }

            const stat = fs.statSync(absolutePath);
            return {
                path: relativePath,
                size: stat.size,
                mtime: stat.mtime.toISOString(),
                sha256: hashFile(absolutePath)
            };
        })
        .filter(Boolean);

    const rootHash = sha256(items.map((item) => `${item.path}:${item.sha256}`).join('\n'));
    return { items, rootHash };
}

function buildPayload(options, protectedArtifacts) {
    return {
        bismillah: 'بسم الله الرحمن الرحيم',
        purpose: 'حماية الملكية الفكرية وتشفير جلسة NVIDIA/CUDA',
        generatedAt: new Date().toISOString(),
        mode: options.mode,
        project: 'SHEIKHA Main Portal',
        owner: 'سلمان أحمد بن سلمان الراجح',
        host: {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            user: os.userInfo().username
        },
        runtime: {
            python: process.env.SHEIKHA_CUDA_PYTHON || '/home/sheikha/codex/venv/bin/python3',
            cudaVisibleDevices: process.env.CUDA_VISIBLE_DEVICES || 'default',
            nodeVersion: process.version
        },
        protectedArtifacts
    };
}

function main() {
    const options = parseArgs();
    loadEnvFile(path.join(rootDir, '.env'));

    const securityDir = path.join(options.reportDir, 'security');
    ensureSecureDir(options.reportDir);
    ensureSecureDir(securityDir);

    const keyMaterial = deriveKeyMaterial();
    const protectedArtifacts = buildProtectedArtifacts();
    const payload = buildPayload(options, protectedArtifacts);
    const payloadRaw = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');

    const sessionId = crypto.randomBytes(12).toString('hex');
    const iv = crypto.randomBytes(12);
    const aad = Buffer.from(`${payload.generatedAt}|${options.mode}|${protectedArtifacts.rootHash}`, 'utf8');

    const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial.key, iv);
    cipher.setAAD(aad);

    const encrypted = Buffer.concat([cipher.update(payloadRaw), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const ciphertextSha256 = sha256(encrypted);
    const sessionSeal = crypto
        .createHmac('sha256', keyMaterial.key)
        .update(`${sessionId}|${payload.generatedAt}|${options.mode}|${protectedArtifacts.rootHash}|${ciphertextSha256}`, 'utf8')
        .digest('hex');

    const meta = {
        bismillah: payload.bismillah,
        sessionId,
        generatedAt: payload.generatedAt,
        mode: options.mode,
        algorithm: 'aes-256-gcm',
        sealType: 'hmac-sha256',
        keySource: keyMaterial.source,
        keyVersion: keyMaterial.version,
        aadSha256: sha256(aad),
        ivHex: iv.toString('hex'),
        authTagHex: authTag.toString('hex'),
        ciphertextSha256,
        protectedRootHash: protectedArtifacts.rootHash,
        sessionSeal,
        encryptedPayload: `security/nvidia-cuda-session-${sessionId}.json.enc`
    };

    const encPath = path.join(securityDir, `nvidia-cuda-session-${sessionId}.json.enc`);
    const metaPath = path.join(securityDir, `nvidia-cuda-session-${sessionId}.meta.json`);
    const latestMetaPath = path.join(securityDir, 'nvidia-cuda-session-latest.meta.json');

    writeSecureFile(encPath, encrypted);
    writeSecureFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
    writeSecureFile(latestMetaPath, JSON.stringify(meta, null, 2), 'utf8');

    console.log('✅ [IP Protection] NVIDIA/CUDA session encrypted and sealed');
    console.log(`- meta: ${path.relative(rootDir, metaPath)}`);
    console.log(`- encrypted: ${path.relative(rootDir, encPath)}`);
    console.log(`- protectedRootHash: ${protectedArtifacts.rootHash}`);
}

try {
    main();
} catch (error) {
    console.error(`❌ فشل تفعيل حماية الملكية والتشفير لـ NVIDIA/CUDA: ${error.message}`);
    process.exit(1);
}