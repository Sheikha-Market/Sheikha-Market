'use strict';

const os = require('os');

let nodeLayer = null;
let rootRuntime = null;

try {
    nodeLayer = require('./sheikha-node-layer');
} catch (_) {
    nodeLayer = null;
}

try {
    rootRuntime = require('../lib/sheikha-root-neural-runtime');
} catch (_) {
    rootRuntime = null;
}

const MODULE_ID = {
    module: 'sheikha-ubuntu-upper-layer',
    nameAr: 'طبقة شيخة العليا فوق Ubuntu',
    nameEn: 'Sheikha Ubuntu Upper Layer',
    version: '1.0.0',
};
// Root runtime currently defines 19 foundational root cells (R01..R19).
const MIN_REQUIRED_ROOT_CELLS = 19;

let _ready = false;
let _initAt = null;

function _safeStatus(mod, fallback = {}) {
    if (!mod || typeof mod.status !== 'function') return fallback;
    try {
        return mod.status() || fallback;
    } catch (_) {
        return fallback;
    }
}

function _isIntegrationReady(baseLayerReady, nodeStatus, rootStatus) {
    return Boolean(
        baseLayerReady &&
        nodeStatus.ready === true &&
        rootStatus.ready === true &&
        Number(rootStatus.totalCells || 0) >= MIN_REQUIRED_ROOT_CELLS
    );
}

function init() {
    if (_ready) return status();

    const platform = os.platform();
    const isLinuxBase = platform === 'linux';

    if (nodeLayer && typeof nodeLayer.init === 'function') {
        try {
            nodeLayer.init();
        } catch (_) {
            // ignore optional init failures in mixed environments
        }
    }

    if (rootRuntime && typeof rootRuntime.init === 'function') {
        try {
            rootRuntime.init();
        } catch (_) {
            // ignore optional init failures in mixed environments
        }
    }

    const nodeStatus = _safeStatus(nodeLayer);
    const rootStatus = _safeStatus(rootRuntime);

    _ready = _isIntegrationReady(isLinuxBase, nodeStatus, rootStatus);
    _initAt = new Date().toISOString();

    return status();
}

function status() {
    const nodeStatus = _safeStatus(nodeLayer, { ready: false });
    const rootStatus = _safeStatus(rootRuntime, { ready: false, totalCells: 0 });
    const platform = os.platform();
    const baseLayerReady = platform === 'linux';

    return {
        ...MODULE_ID,
        ready: _ready,
        initAt: _initAt,
        baseLayer: {
            name: 'ubuntu-linux',
            ready: baseLayerReady,
            platform,
            release: os.release(),
        },
        upperNodeLayer: {
            module: nodeStatus.module || 'sheikha-node-layer',
            ready: nodeStatus.ready === true,
        },
        rootNeuralLayer: {
            module: rootStatus.module || 'sheikha-root-neural-runtime',
            ready: rootStatus.ready === true,
            totalCells: Number(rootStatus.totalCells || 0),
            minRequiredCells: MIN_REQUIRED_ROOT_CELLS,
        },
        integrationReady: _isIntegrationReady(baseLayerReady, nodeStatus, rootStatus),
    };
}

module.exports = {
    ...MODULE_ID,
    init,
    status,
};
