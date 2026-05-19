#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const now = new Date().toISOString();

function check(relPath) {
    const fullPath = path.join(ROOT, relPath);
    return {
        path: relPath,
        exists: fs.existsSync(fullPath)
    };
}

function main() {
    const checks = [
        check('package.json'),
        check('sheikha-mcp-server.js'),
        check('sheikha-vision-mcp.js'),
        check('start-mcp.sh'),
        check('node_modules/@modelcontextprotocol/sdk')
    ];

    const missing = checks.filter((c) => !c.exists);
    const readinessScore = Math.round(((checks.length - missing.length) / checks.length) * 100);

    const commandPlan = {
        activation: 'npm run activate:ai',
        startAi: 'npm run start:ai',
        startCore: 'npm run start:sheikha',
        startMarket: 'npm run start:market'
    };

    const response = {
        success: missing.length === 0,
        message: missing.length === 0
            ? 'تم تفعيل sheikha-ai بنجاح وجاهز للتشغيل'
            : 'تفعيل sheikha-ai غير مكتمل، توجد متطلبات ناقصة',
        data: {
            component: 'sheikha-ai',
            readinessScore,
            checks,
            missing,
            commandPlan
        },
        timestamp: now
    };

    console.log(JSON.stringify(response, null, 4));
    process.exit(missing.length === 0 ? 0 : 1);
}

main();
