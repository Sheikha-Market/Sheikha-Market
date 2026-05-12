'use strict';

const { bootstrapRoot, getSystemSnapshot, resolveRuntimeMode } = require('./sheikha-root');
const { getOsStatus, bootSheikhaOS } = require('./sheikha-os');
const { automation } = require('../lib/sheikha-os');

async function executeSheikhaCommand(command, payload = {}) {
    const normalizedCommand = String(command || '').trim().toLowerCase();
    const runtimeMode = resolveRuntimeMode(payload.runtimeMode);

    switch (normalizedCommand) {
        case 'root.bootstrap':
            return {
                success: true,
                command: normalizedCommand,
                data: bootstrapRoot({ runtimeMode })
            };

        case 'root.snapshot':
            return {
                success: true,
                command: normalizedCommand,
                data: getSystemSnapshot({ runtimeMode })
            };

        case 'os.status':
        case 'system.status':
            return {
                success: true,
                command: normalizedCommand,
                data: getOsStatus({ runtimeMode })
            };

        case 'os.boot':
            return {
                success: true,
                command: normalizedCommand,
                data: await bootSheikhaOS({ runtimeMode })
            };

        case 'automation.list':
            return {
                success: true,
                command: normalizedCommand,
                data: automation.list()
            };

        case 'automation.start':
            automation.start();
            return {
                success: true,
                command: normalizedCommand,
                data: { running: automation.running }
            };

        case 'automation.stop':
            automation.stop();
            return {
                success: true,
                command: normalizedCommand,
                data: { running: automation.running }
            };

        default:
            return {
                success: false,
                command: normalizedCommand,
                error: 'unsupported_command',
                message: 'الأمر غير مدعوم في Control Plane الحالي'
            };
    }
}

module.exports = {
    executeSheikhaCommand
};