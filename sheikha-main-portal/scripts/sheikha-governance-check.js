#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const {
    SHEIKHA_GOVERNANCE_PROFILE,
    validatePayloadUtf8
} = require('../lib/sheikha-governance-core');

const rootDir = path.resolve(__dirname, '..');
const runtimeDir = path.join(rootDir, 'runtime', 'reports');

const targets = [
    path.join(rootDir, 'config'),
    path.join(rootDir, 'scripts'),
    path.join(rootDir, 'docs')
];

const allowedExt = new Set(['.json', '.js', '.sh', '.md']);

function listFiles(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const result = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...listFiles(fullPath));
            return;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (allowedExt.has(ext)) {
            result.push(fullPath);
        }
    });

    return result;
}

function inspectFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const text = buffer.toString('utf8');

    const hasBom =
        buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;

    const hasReplacementChar = text.includes('\uFFFD');
    const utf8Issues = validatePayloadUtf8(text, filePath);

    return {
        file: path.relative(rootDir, filePath),
        hasBom,
        hasReplacementChar,
        utf8Valid: utf8Issues.length === 0,
        utf8Issues
    };
}

function main() {
    const files = targets.flatMap(target => listFiles(target));
    const inspections = files.map(inspectFile);

    const invalid = inspections.filter(item => !item.utf8Valid || item.hasReplacementChar);
    const withBom = inspections.filter(item => item.hasBom);

    const report = {
        success: invalid.length === 0,
        profile: SHEIKHA_GOVERNANCE_PROFILE,
        summary: {
            scannedFiles: inspections.length,
            invalidFiles: invalid.length,
            bomFiles: withBom.length
        },
        invalidFiles: invalid,
        bomFiles: withBom.map(item => item.file),
        timestamp: new Date().toISOString()
    };

    fs.mkdirSync(runtimeDir, { recursive: true });
    const reportPath = path.join(runtimeDir, `governance-utf8-${Date.now()}.json`);
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 4)}\n`, 'utf8');

    if (report.success) {
        console.log('Governance UTF-8 check passed.');
    } else {
        console.log('Governance UTF-8 check found issues.');
    }
    console.log(`Report: ${reportPath}`);

    process.exit(report.success ? 0 : 1);
}

main();
