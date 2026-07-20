'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha runtime kernel directories', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    test('uses a governed runtime fallback when the log root is read-only', async () => {
        const mkdirSync = jest
            .spyOn(fs, 'mkdirSync')
            .mockImplementation((directory) => {
                if (directory.endsWith(path.join('logs', 'runtime'))) {
                    const error = new Error('read-only log root');
                    error.code = 'EACCES';
                    throw error;
                }
            });
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const kernel = require('../runtime/kernel/sheikha-runtime-kernel');
        await kernel.ensureDirectories();

        expect(kernel.paths.logs).toBe(
            path.join(process.cwd(), 'runtime', 'logs')
        );
        expect(mkdirSync).toHaveBeenCalledWith(
            kernel.paths.logs,
            { recursive: true }
        );
    });
});
