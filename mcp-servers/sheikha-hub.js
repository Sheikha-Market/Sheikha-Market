#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function check(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function main() {
    const modules = {
        sheikhaEi: {
            title: 'Sheikha-EI',
            purpose: 'AI activation and readiness',
            command: 'npm run activate:ai',
            ready: check('activate-sheikha-ai.js')
        },
        sheikhaMcp: {
            title: 'sheikha mcp',
            purpose: 'Core MCP server (stdio — Cursor/Claude integration)',
            command: 'npm run start:sheikha',
            ready: check('sheikha-mcp-server.js')
        },
        sheikhaSdk: {
            title: 'sheikha sdk',
            purpose: 'SDK HTTP server — REST API for developers (port 3001)',
            command: 'npm run start:sdk',
            ready: check('sheikha-sdk-server.js')
        },
        sheikhaIde: {
            title: 'sheikha ide',
            purpose: 'IDE HTTP server — code analysis & file management (port 3002)',
            command: 'npm run start:ide',
            ready: check('sheikha-ide-server.js')
        },
        sheikhaCoder: {
            title: 'sheikha coder',
            purpose: 'Vision coder MCP runtime',
            command: 'npm run sheikha:coder',
            ready: check('sheikha-vision-mcp.js')
        },
        sheikhaDoctor: {
            title: 'sheikha doctor',
            purpose: 'System doctor and verification',
            command: 'npm run sheikha:doctor',
            ready: check('sheikha-doctor.js')
        },
        sheikhaVscode: {
            title: 'sheikha visual studio code',
            purpose: 'VS Code command map and status',
            command: 'npm run sheikha:vscode',
            ready: true
        },
        sheikhaHob: {
            title: 'Sheikha Hob',
            purpose: 'Unified control hub',
            command: 'npm run sheikha:hob',
            ready: true
        },
        shikhaLab: {
            title: 'Shikha Lab',
            purpose: 'AI lab runtime',
            command: 'npm run shikha:lab',
            ready: check('sheikha-vision-mcp.js')
        }
    };

    const readiness = Object.values(modules).filter((m) => m.ready).length;
    const score = Math.round((readiness / Object.keys(modules).length) * 100);

    console.log(
        JSON.stringify(
            {
                success: score === 100,
                message: 'Sheikha Hub command map is ready.',
                data: {
                    readinessScore: score,
                    modules
                },
                timestamp: new Date().toISOString()
            },
            null,
            4
        )
    );
}

main();
