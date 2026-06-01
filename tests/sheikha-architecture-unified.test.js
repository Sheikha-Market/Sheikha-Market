'use strict';

const architecture = require('../lib/sheikha-architecture-unified');

describe('sheikha architecture unified', () => {
    test('exposes repository-backed runtime entry points', () => {
        const initialized = architecture.init();

        expect(initialized.repository.runtimeEntry).toBe('server.js');
        expect(initialized.repository.routeModules).toBe('routes/');
        expect(initialized.repository.runtimeKernel).toBe('runtime/kernel/sheikha-runtime-kernel.js');
    });

    test('validates runtime architecture files that now exist', () => {
        const validation = architecture.validateArchitecture();

        expect(validation.serverEntryExists).toBe(true);
        expect(validation.routesDirectoryExists).toBe(true);
        expect(validation.runtimeKernelExists).toBe(true);
        expect(validation.runtimeEngineLoaderExists).toBe(true);
    });
});
