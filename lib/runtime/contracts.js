'use strict';

const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return null;
    }
}

function listNdjsonFilesSafe(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return [];
        }
        return fs.readdirSync(dirPath).filter((name) => name.endsWith('.ndjson'));
    } catch (_) {
        return [];
    }
}

function getFileSizeSafe(filePath) {
    try {
        return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    } catch (_) {
        return 0;
    }
}

function registerRuntimeContracts(app, options = {}) {
    if (!app || typeof app.get !== 'function') {
        return false;
    }

    const cwd = process.cwd();
    const startedAt = options.startedAt || new Date();
    const runtimeBootstrapState = options.runtimeBootstrapState || {
        loaded: false,
        mode: 'static',
        contractsVersion: 'v1',
        ring: 'stable'
    };
    const runtimeFingerprintPath =
        options.runtimeFingerprintPath || path.join(cwd, '.runtime-fingerprint');

    app.get('/api/runtime', (req, res) => {
        const fingerprint = readJsonSafe(runtimeFingerprintPath);

        return res.status(200).json({
            success: true,
            data: {
                mode: runtimeBootstrapState.mode || 'static',
                contractsVersion: runtimeBootstrapState.contractsVersion || 'v1',
                ring: runtimeBootstrapState.ring || 'stable',
                loaded: Boolean(runtimeBootstrapState.loaded),
                startedAt,
                uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
                fingerprint: {
                    status: fingerprint ? 'ok' : 'missing',
                    expectedFiles: Array.isArray(fingerprint?.files) ? fingerprint.files.length : 0,
                    sha256: fingerprint?.sha256 || null,
                    generatedAt: fingerprint?.generatedAt || null
                }
            },
            message: 'تم جلب حالة التشغيل بنجاح',
            timestamp: new Date().toISOString()
        });
    });

    app.get('/api/sheikha-node/status', (req, res) => {
        const uptimeSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
        return res.status(200).json({
            success: true,
            data: {
                status: 'online',
                mode: runtimeBootstrapState.mode || 'static',
                ring: runtimeBootstrapState.ring || 'stable',
                uptimeSeconds,
                startedAt
            },
            message: 'حالة العقدة تعمل',
            timestamp: new Date().toISOString()
        });
    });

    app.get('/api/observability/summary', (req, res) => {
        const metricsDir = path.join(cwd, 'data', 'runtime-metrics');
        const latencyPath = path.join(metricsDir, 'latency.ndjson');
        const errorsPath = path.join(metricsDir, 'errors.ndjson');
        const throughputPath = path.join(metricsDir, 'throughput.ndjson');

        const files = listNdjsonFilesSafe(metricsDir);
        const summary = {
            files,
            latencyBytes: getFileSizeSafe(latencyPath),
            errorsBytes: getFileSizeSafe(errorsPath),
            throughputBytes: getFileSizeSafe(throughputPath)
        };

        return res.status(200).json({
            success: true,
            data: summary,
            message: 'ملخص المراقبة متاح',
            timestamp: new Date().toISOString()
        });
    });

    return true;
}

module.exports = {
    registerRuntimeContracts
};
