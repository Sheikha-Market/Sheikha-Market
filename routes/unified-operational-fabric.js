'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const router = express.Router();
const rootDir = path.join(__dirname, '..');
const runtimeDir = path.join(rootDir, 'runtime');
const historyDir = path.join(runtimeDir, 'history');
const auditsDir = path.join(runtimeDir, 'audits');
const timelineFile = path.join(runtimeDir, 'timeline', 'latest.json');
const recoveryFile = path.join(runtimeDir, 'recovery', 'latest.json');

function safeReadJson(filePath, fallbackValue = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallbackValue;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallbackValue;
    }
}

function listJsonFiles(dirPath, limit = 20) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    return fs.readdirSync(dirPath)
        .filter((name) => name.endsWith('.json'))
        .sort((a, b) => (a < b ? 1 : -1))
        .slice(0, limit)
        .map((name) => {
            const full = path.join(dirPath, name);
            return {
                file: name,
                path: full,
                updatedAt: fs.statSync(full).mtime.toISOString()
            };
        });
}

function runFabricCycle() {
    try {
        const output = execSync('node scripts/unified-operational-fabric-cycle.js --json', {
            cwd: rootDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf8'
        });
        return { ok: true, result: JSON.parse(output) };
    } catch (error) {
        return { ok: false, error: error.message };
    }
}

router.get('/', (_req, res) => {
    return res.json({
        success: true,
        data: {
            name: 'Sheikha Unified Operational Fabric',
            endpoints: [
                '/api/operational-fabric/status',
                '/api/operational-fabric/timeline',
                '/api/operational-fabric/audits',
                '/api/operational-fabric/history',
                '/api/operational-fabric/recovery'
            ]
        },
        message: 'واجهة نسيج التشغيل الموحد جاهزة',
        timestamp: new Date().toISOString()
    });
});

router.get('/status', (_req, res) => {
    const latestHistory = listJsonFiles(historyDir, 1)[0];
    const latestPayload = latestHistory ? safeReadJson(latestHistory.path, {}) : {};

    return res.json({
        success: true,
        data: latestPayload,
        message: 'تم جلب حالة نسيج التشغيل الموحد',
        timestamp: new Date().toISOString()
    });
});

router.get('/timeline', (_req, res) => {
    return res.json({
        success: true,
        data: safeReadJson(timelineFile, {}),
        message: 'تم جلب الخط الزمني التشغيلي',
        timestamp: new Date().toISOString()
    });
});

router.get('/audits', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const files = listJsonFiles(auditsDir, limit).map((entry) => ({
        file: entry.file,
        updatedAt: entry.updatedAt,
        payload: safeReadJson(entry.path, {})
    }));

    return res.json({
        success: true,
        data: files,
        message: 'تم جلب سجلات التدقيق',
        timestamp: new Date().toISOString()
    });
});

router.get('/history', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const files = listJsonFiles(historyDir, limit).map((entry) => ({
        file: entry.file,
        updatedAt: entry.updatedAt,
        payload: safeReadJson(entry.path, {})
    }));

    return res.json({
        success: true,
        data: files,
        message: 'تم جلب الذاكرة التاريخية التشغيلية',
        timestamp: new Date().toISOString()
    });
});

router.get('/recovery', (_req, res) => {
    return res.json({
        success: true,
        data: safeReadJson(recoveryFile, {}),
        message: 'تم جلب حالة الاسترجاع التشغيلي',
        timestamp: new Date().toISOString()
    });
});

router.post('/cycle', (_req, res) => {
    const result = runFabricCycle();
    if (!result.ok) {
        return res.status(500).json({
            success: false,
            message: 'تعذر تشغيل دورة نسيج التشغيل الموحد',
            error: result.error,
            timestamp: new Date().toISOString()
        });
    }

    return res.json({
        success: true,
        data: result.result,
        message: 'تم تشغيل دورة نسيج التشغيل الموحد بنجاح',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
