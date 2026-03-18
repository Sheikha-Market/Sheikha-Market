#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;

function exists(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function syntaxCheck(relPath) {
    const fullPath = path.join(ROOT, relPath);
    if (!exists(relPath)) {
        return { file: relPath, ok: false, reason: 'missing' };
    }
    const res = spawnSync(process.execPath, ['-c', fullPath], { encoding: 'utf8' });
    return {
        file: relPath,
        ok: res.status === 0,
        reason: res.status === 0 ? 'ok' : 'syntax-error'
    };
}

function main() {
    const checks = [
        { name: 'package.json', ok: exists('package.json') },
        { name: 'sheikha-mcp-server.js', ok: exists('sheikha-mcp-server.js') },
        { name: 'sheikha-vision-mcp.js', ok: exists('sheikha-vision-mcp.js') },
        { name: 'activate-sheikha-ai.js', ok: exists('activate-sheikha-ai.js') },
        { name: 'start-mcp.sh', ok: exists('start-mcp.sh') },
        { name: '@modelcontextprotocol/sdk', ok: exists('node_modules/@modelcontextprotocol/sdk') }
    ];

    const syntax = [
        syntaxCheck('sheikha-mcp-server.js'),
        syntaxCheck('sheikha-vision-mcp.js'),
        syntaxCheck('activate-sheikha-ai.js')
    ];

    const allChecksOk = checks.every((c) => c.ok);
    const allSyntaxOk = syntax.every((s) => s.ok);
    const success = allChecksOk && allSyntaxOk;

    const commandMap = {
        sheikhaEi: 'npm run activate:ai',
        sheikhaMcp: 'npm run start:sheikha',
        sheikhaSdk: 'npm run sheikha:sdk',
        sheikhaIde: 'npm run sheikha:ide',
        sheikhaCoder: 'npm run sheikha:coder',
        sheikhaDoctor: 'npm run sheikha:doctor',
        sheikhaVscode: 'npm run sheikha:vscode',
        sheikhaHub: 'npm run sheikha:hub',
        shikhaLab: 'npm run shikha:lab'
    };

    const response = {
        success,
        message: success
            ? 'Sheikha Doctor: all MCP AI components are ready.'
            : 'Sheikha Doctor: some checks failed. Review missing files or syntax.',
        data: {
            checks,
            syntax,
            commandMap
        },
        timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(response, null, 4));
    process.exit(success ? 0 : 1);
}

main();
