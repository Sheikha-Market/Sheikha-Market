'use strict';

const express = require('express');
const router = express.Router();

const architecture = require('../lib/sheikha-architecture-unified');
const runtimeKernel = require('../runtime/kernel/sheikha-runtime-kernel');
const canonicalRuntime = require('../core/runtime/governance/sheikha-canonical-runtime-loader');
const runtimeEngineLoader = require('../lib/runtime/core/engine-loader');

const ARCHITECTURE_API_ROUTES = [
    '/api/architecture/overview',
    '/api/architecture/tech-stack',
    '/api/architecture/runtime',
    '/api/architecture/routes',
    '/api/root-control-plane',
    '/api/root-neural-network',
    '/api/runtime-root/health',
    '/api/runtime-root/orchestration',
    '/api/runtime-root/canonical-runtime/status'
];

function buildRuntimeUsage() {
    return {
        kernel: runtimeKernel.health(),
        canonicalRuntime: canonicalRuntime.getCanonicalRuntimeStatus(),
        engineLoader: runtimeEngineLoader.getStatus()
    };
}

router.get('/overview', (_req, res) => {
    const initialized = architecture.init();
    res.json({
        success: true,
        data: {
            ...initialized,
            validation: architecture.validateArchitecture(),
            apiRoutes: ARCHITECTURE_API_ROUTES,
            runtime: buildRuntimeUsage()
        }
    });
});

router.get('/tech-stack', (_req, res) => {
    res.json({
        success: true,
        data: {
            timestamp: new Date().toISOString(),
            architecture: architecture.architecture,
            validation: architecture.validateArchitecture(),
            runtime: {
                kernel: runtimeKernel.health().status,
                canonicalRuntime: canonicalRuntime.getCanonicalRuntimeStatus().mode,
                engineLoader: runtimeEngineLoader.getStatus().mode
            }
        }
    });
});

router.get('/runtime', (_req, res) => {
    res.json({
        success: true,
        data: buildRuntimeUsage()
    });
});

router.get('/routes', (_req, res) => {
    res.json({
        success: true,
        count: ARCHITECTURE_API_ROUTES.length,
        routes: ARCHITECTURE_API_ROUTES
    });
});

module.exports = router;
