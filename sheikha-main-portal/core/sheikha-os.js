'use strict';

const { SHEIKHA_SYSTEM, automation } = require('../lib/sheikha-os');

function getOsStatus({ runtimeMode } = {}) {
    const status = SHEIKHA_SYSTEM.getSystemStatus();

    return {
        ...status,
        runtimeMode: runtimeMode || process.env.SHEIKHA_RUNTIME_MODE || 'pilot'
    };
}

async function bootSheikhaOS({ runtimeMode } = {}) {
    if (!automation.running) {
        automation.start();
    }

    return {
        success: true,
        runtimeMode: runtimeMode || process.env.SHEIKHA_RUNTIME_MODE || 'pilot',
        status: getOsStatus({ runtimeMode }),
        bootedAt: new Date().toISOString()
    };
}

module.exports = {
    getOsStatus,
    bootSheikhaOS
};