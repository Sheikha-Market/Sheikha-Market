#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const NOW = new Date().toISOString();
const DRY_RUN = process.argv.includes('--dry-run');

const TARGETS = [
    'data/healing-logs.ndjson',
    'data/pilot-logs.ndjson',
    'data/notifications.ndjson',
    'data/security-audit.ndjson',
    'data/automation-reports.ndjson'
];

const SAFE_MAX_BYTES = 5 * 1024 * 1024;
const KEEP_LAST_LINES = 4000;

function tailLines(content, maxLines) {
    const lines = content.split('\n');
    if (lines.length <= maxLines) {
        return content;
    }
    return lines.slice(lines.length - maxLines).join('\n');
}

function ensureAuditDir() {
    const dir = path.join(ROOT, 'data', 'security');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function main() {
    const report = {
        timestamp: NOW,
        dryRun: DRY_RUN,
        scanned: 0,
        compacted: 0,
        skipped: 0,
        details: []
    };

    for (const rel of TARGETS) {
        const filePath = path.join(ROOT, rel);
        report.scanned += 1;

        if (!fs.existsSync(filePath)) {
            report.skipped += 1;
            report.details.push({ file: rel, action: 'skip', reason: 'not-found' });
            continue;
        }

        const stat = fs.statSync(filePath);
        if (stat.size <= SAFE_MAX_BYTES) {
            report.skipped += 1;
            report.details.push({ file: rel, action: 'skip', reason: 'below-threshold', size: stat.size });
            continue;
        }

        const original = fs.readFileSync(filePath, 'utf8');
        const compacted = tailLines(original, KEEP_LAST_LINES);
        const compactedBytes = Buffer.byteLength(compacted, 'utf8');

        report.details.push({
            file: rel,
            action: DRY_RUN ? 'would-compact' : 'compact',
            beforeBytes: stat.size,
            afterBytes: compactedBytes
        });

        if (!DRY_RUN) {
            fs.writeFileSync(filePath, compacted.endsWith('\n') ? compacted : compacted + '\n', 'utf8');
            report.compacted += 1;
        }
    }

    const auditDir = ensureAuditDir();
    const auditFile = path.join(auditDir, 'ai-waste-elimination.ndjson');
    fs.appendFileSync(auditFile, JSON.stringify(report) + '\n', 'utf8');

    console.log('AI Waste Elimination');
    console.log('dryRun:', DRY_RUN ? 'true' : 'false');
    console.log('scanned:', report.scanned);
    console.log('compacted:', report.compacted);
    console.log('skipped:', report.skipped);
    console.log('audit:', path.relative(ROOT, auditFile));
}

main();
