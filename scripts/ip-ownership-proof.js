#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'reports', 'ip');
const strictMode = String(process.env.SHEIKHA_IP_STRICT || '').toLowerCase() === '1';

const includeRoots = [
    'server.js',
    'package.json',
    'config',
    'middleware',
    'routes',
    'lib',
    'public',
    'docs',
    'scripts'
];

const excludedDirNames = new Set([
    '.git',
    '.vscode-server',
    'node_modules',
    'tmp',
    'logs',
    'exports',
    'releases',
    'reports',
    '.cursor'
]);

const excludedFilePatterns = ['.backup-', '.log', '.tmp', '.temp'];

const criticalFiles = [
    'server.js',
    'package.json',
    'LICENSE-PROPRIETARY.md',
    'LICENSE-SHEIKHA.md',
    'README.md',
    'docs/ميثاق-السوق-النبوي-الرقمي-شيخة.md',
    'docs/security/ملكية-فكرية-وترخيص-شيخة.md',
    'docs/security/سياسة-أمن-المعلومات-شيخة.md'
];

function ensureDir(directoryPath) {
    fs.mkdirSync(directoryPath, { recursive: true });
}

function normalizePath(filePath) {
    return filePath.split(path.sep).join('/');
}

function isExcludedFile(filePath) {
    const fileName = path.basename(filePath);
    return excludedFilePatterns.some(pattern => fileName.includes(pattern));
}

function hashFile(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function collectFiles(targetPath, collected = []) {
    const absolutePath = path.join(rootDir, targetPath);
    if (!fs.existsSync(absolutePath)) {
        return collected;
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isFile()) {
        if (!isExcludedFile(absolutePath)) {
            collected.push(normalizePath(path.relative(rootDir, absolutePath)));
        }
        return collected;
    }

    const children = fs.readdirSync(absolutePath, { withFileTypes: true });
    for (const child of children) {
        if (child.isDirectory()) {
            if (excludedDirNames.has(child.name)) {
                continue;
            }
            collectFiles(path.join(targetPath, child.name), collected);
            continue;
        }

        const childPath = path.join(absolutePath, child.name);
        if (!isExcludedFile(childPath)) {
            collected.push(normalizePath(path.relative(rootDir, childPath)));
        }
    }

    return collected;
}

function buildManifest() {
    const files = new Set();

    for (const includeRoot of includeRoots) {
        const collected = collectFiles(includeRoot, []);
        for (const filePath of collected) {
            files.add(filePath);
        }
    }

    const sortedFiles = Array.from(files).sort((a, b) => a.localeCompare(b, 'ar'));
    const items = sortedFiles.map(filePath => {
        const absolutePath = path.join(rootDir, filePath);
        const stat = fs.statSync(absolutePath);
        return {
            path: filePath,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
            sha256: hashFile(absolutePath)
        };
    });

    const rootHash = crypto
        .createHash('sha256')
        .update(items.map(item => `${item.path}:${item.sha256}`).join('\n'))
        .digest('hex');

    const missingCritical = criticalFiles.filter(
        filePath => !fs.existsSync(path.join(rootDir, filePath))
    );

    return {
        bismillah: 'بسم الله الرحمن الرحيم',
        project: 'SHEIKHA Main Portal',
        owner: 'سلمان أحمد بن سلمان الراجح',
        generatedAt: new Date().toISOString(),
        strictMode,
        includeRoots,
        totalFiles: items.length,
        rootHash,
        missingCritical,
        items
    };
}

function writeOutputs(manifest) {
    ensureDir(reportDir);

    const timestamp = manifest.generatedAt.replace(/[:.]/g, '-');
    const jsonPath = path.join(reportDir, `ip-proof-${timestamp}.json`);
    const latestPath = path.join(reportDir, 'ip-proof-latest.json');
    const txtPath = path.join(reportDir, `ip-proof-${timestamp}.txt`);

    fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 4), 'utf8');
    fs.writeFileSync(latestPath, JSON.stringify(manifest, null, 4), 'utf8');

    const summary = [
        'بسم الله الرحمن الرحيم',
        'تقرير إثبات الملكية الرقمية — SHEIKHA',
        `وقت الإنشاء: ${manifest.generatedAt}`,
        `إجمالي الملفات: ${manifest.totalFiles}`,
        `البصمة الجذرية (Root Hash): ${manifest.rootHash}`,
        `ملفات حرجة مفقودة: ${manifest.missingCritical.length}`,
        `وضع صارم: ${manifest.strictMode ? 'مُفعّل' : 'غير مُفعّل'}`,
        '',
        'تنبيه: هذا التقرير إثبات تقني (سلامة/نسبة) ولا يغني عن الإجراءات القانونية النظامية.'
    ].join('\n');

    fs.writeFileSync(txtPath, summary, 'utf8');

    return { jsonPath, latestPath, txtPath };
}

function run() {
    try {
        const manifest = buildManifest();

        if (strictMode && manifest.missingCritical.length > 0) {
            throw new Error(`ملفات حرجة مفقودة: ${manifest.missingCritical.join(', ')}`);
        }

        const output = writeOutputs(manifest);

        console.log('✅ تم توليد إثبات الملكية الرقمية بنجاح');
        console.log(`- latest: ${normalizePath(path.relative(rootDir, output.latestPath))}`);
        console.log(`- json:   ${normalizePath(path.relative(rootDir, output.jsonPath))}`);
        console.log(`- text:   ${normalizePath(path.relative(rootDir, output.txtPath))}`);
        console.log(`- rootHash: ${manifest.rootHash}`);

        if (manifest.missingCritical.length > 0) {
            console.log(`⚠️ ملفات حرجة غير موجودة: ${manifest.missingCritical.join(', ')}`);
        }
    } catch (error) {
        console.error('❌ فشل في توليد إثبات الملكية الرقمية:', error.message);
        process.exit(1);
    }
}

run();
