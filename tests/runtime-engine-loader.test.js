'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const runtimeEngineLoader = require('../lib/runtime/core/engine-loader');

describe('runtime engine loader', () => {
    test('loads an engine module from a relative path', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'engine-loader-'));
        const engineFile = path.join(tempDir, 'sample-engine.js');

        fs.writeFileSync(engineFile, 'module.exports = class SampleEngine { static label = "ok"; };');

        const result = runtimeEngineLoader('./sample-engine.js', { baseDir: tempDir });

        expect(result.ok).toBe(true);
        expect(result.loader).toBe('runtime-engine-loader');
        expect(result.engine).toBeDefined();
        expect(result.engine.label).toBe('ok');
    });

    test('reports loader status metadata', () => {
        const status = runtimeEngineLoader.getStatus();

        expect(status.active).toBe(true);
        expect(status.loader).toBe('runtime-engine-loader');
        expect(status.exists).toBe(true);
        expect(status.mode).toBe('safe-require-bridge');
    });
});
