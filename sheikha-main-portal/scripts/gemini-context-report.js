#!/usr/bin/env node
'use strict';

const path = require('path');
const GeminiContextBridge = require('../lib/gemini-context-bridge');

function readArg(flag, fallback = null) {
    const exact = process.argv.find(item => item === flag);
    if (exact) {
        return true;
    }

    const prefix = `${flag}=`;
    const found = process.argv.find(item => item.startsWith(prefix));
    if (!found) {
        return fallback;
    }

    return found.slice(prefix.length);
}

function main() {
    const bridge = new GeminiContextBridge({
        rootDir: path.join(__dirname, '..'),
        dataDir: path.join(__dirname, '..', 'data'),
        reportsDir: path.join(__dirname, '..', 'reports'),
        operatorEmail: process.env.SHEIKHA_OPERATOR_EMAIL || 'market@sheikha.top',
        projectId:
            process.env.GOOGLE_PROJECT_ID ||
            process.env.GOOGLE_CLOUD_PROJECT ||
            'sheikha-marketplace'
    });

    const latestOnly = Boolean(readArg('--latest', false));
    const includeMessages = Number(readArg('--messages', 20)) || 20;
    const includeKnowledge = Number(readArg('--knowledge', 10)) || 10;

    const report = latestOnly
        ? bridge.getLatestHandoff() ||
          bridge.createHandoffReport({
              includeMessages,
              includeKnowledge,
              persist: true,
              requestedBy: 'cli-latest-fallback'
          })
        : bridge.createHandoffReport({
              includeMessages,
              includeKnowledge,
              persist: true,
              requestedBy: 'cli'
          });

    console.log('✅ تم تجهيز تقرير Gemini الآمن');
    console.log(`🆔 ${report.id}`);
    console.log(`🕒 ${report.createdAt}`);
    console.log(`🔐 ${report.integrity}`);
    if (report.files) {
        console.log(`📄 JSON: ${report.files.json}`);
        console.log(`📄 MD:   ${report.files.markdown}`);
    }
}

try {
    main();
} catch (error) {
    console.error('❌ فشل إنشاء تقرير Gemini الآمن:', error.message);
    process.exit(1);
}
