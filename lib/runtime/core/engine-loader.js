'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = process.cwd();
const ENGINE_LOADER_PATH = path.resolve(__dirname, 'engine-loader.js');

function resolveEnginePath(enginePath, options = {}) {
    const baseDir = path.resolve(options.baseDir || DEFAULT_ROOT);
    return path.isAbsolute(enginePath)
        ? path.resolve(enginePath)
        : path.resolve(baseDir, enginePath);
}

function safeLoadEngine(enginePath, options = {}) {
    if (!enginePath || typeof enginePath !== 'string') {
        return {
            ok: false,
            engine: null,
            error: 'enginePath must be a non-empty string'
        };
    }

    const resolvedPath = resolveEnginePath(enginePath, options);

    try {
        const engine = require(resolvedPath);
        return {
            ok: true,
            engine,
            loader: 'runtime-engine-loader',
            requestedPath: enginePath,
            resolvedPath
        };
    } catch (error) {
        return {
            ok: false,
            engine: null,
            loader: 'runtime-engine-loader',
            requestedPath: enginePath,
            resolvedPath,
            error: error.message
        };
    }
}

safeLoadEngine.resolveEnginePath = resolveEnginePath;
safeLoadEngine.getStatus = function getStatus() {
    return {
        active: true,
        loader: 'runtime-engine-loader',
        loaderPath: ENGINE_LOADER_PATH,
        root: DEFAULT_ROOT,
        exists: fs.existsSync(ENGINE_LOADER_PATH),
        mode: 'safe-require-bridge',
        timestamp: new Date().toISOString()
    };
};

module.exports = safeLoadEngine;
