/**
 * CUDA / NVIDIA Routes
 * مسارات التحقق من تكامل NVIDIA و CUDA
 */

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const router = express.Router();

const pickPython = () => {
    const projectVenvPython = path.join(__dirname, '..', '.venv', 'bin', 'python');

    const candidates = [
        projectVenvPython,
        process.env.SHEIKHA_CUDA_PYTHON,
        process.env.SHEIKHA_VENV_PYTHON,
        'python3',
        'python'
    ].filter(Boolean);

    for (const candidate of candidates) {
        try {
            const probe = spawnSync(candidate, ['--version'], {
                encoding: 'utf8',
                timeout: 5000
            });
            if (!probe.error) {
                return candidate;
            }
        } catch (_error) {
            continue;
        }
    }

    return null;
};

router.get('/cuda/verify', (req, res) => {
    const verifyScript = path.join(__dirname, '..', 'scripts', 'cuda-verify.py');

    if (!fs.existsSync(verifyScript)) {
        return res.status(404).json({
            success: false,
            data: null,
            message: 'ملف التحقق CUDA غير موجود',
            timestamp: new Date().toISOString()
        });
    }

    const py = pickPython();
    if (!py) {
        return res.status(503).json({
            success: false,
            data: null,
            message: 'Python غير متاح لتشغيل فحص CUDA',
            timestamp: new Date().toISOString()
        });
    }

    const run = spawnSync(py, [verifyScript], {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        timeout: 30000
    });

    if (run.error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: `فشل تشغيل فحص CUDA: ${run.error.message}`,
            timestamp: new Date().toISOString()
        });
    }

    let parsed;
    try {
        parsed = JSON.parse((run.stdout || '').trim() || '{}');
    } catch (_error) {
        parsed = { raw: run.stdout || '', stderr: run.stderr || '' };
    }

    const ok = !!parsed.cuda_available;
    return res.status(ok ? 200 : 503).json({
        success: ok,
        data: {
            python: py,
            ...parsed
        },
        message: ok ? 'تكامل CUDA مُفعّل' : 'تكامل CUDA غير متاح حالياً',
        timestamp: new Date().toISOString()
    });
});

router.get('/nvidia-cuda/capabilities', (req, res) => {
    const smi = spawnSync(
        'nvidia-smi',
        ['--query-gpu=name,driver_version,memory.total', '--format=csv,noheader'],
        {
            encoding: 'utf8',
            timeout: 15000
        }
    );

    const devices = [];
    if (!smi.error && smi.status === 0) {
        const lines = (smi.stdout || '')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        for (const line of lines) {
            const parts = line.split(',').map(value => value.trim());
            devices.push({
                name: parts[0] || null,
                driverVersion: parts[1] || null,
                memoryTotal: parts[2] || null
            });
        }
    }

    const py = pickPython();
    const pythonInfo = py
        ? spawnSync(
              py,
              [
                  '-c',
                  'import json,platform;print(json.dumps({"python": platform.python_version()}))'
              ],
              {
                  encoding: 'utf8',
                  timeout: 5000
              }
          )
        : null;

    let pythonData = {};
    if (pythonInfo && !pythonInfo.error) {
        try {
            pythonData = JSON.parse((pythonInfo.stdout || '').trim() || '{}');
        } catch (_error) {
            pythonData = {};
        }
    }

    const isAvailable = devices.length > 0;

    return res.status(isAvailable ? 200 : 503).json({
        success: isAvailable,
        data: {
            nvidiaSmiAvailable: !smi.error && smi.status === 0,
            cudaAvailable: isAvailable,
            gpuCount: devices.length,
            devices,
            ...pythonData
        },
        message: isAvailable ? 'قدرات NVIDIA/CUDA متاحة' : 'لا توجد قدرات NVIDIA/CUDA متاحة حالياً',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
