#!/usr/bin/env node
'use strict';

/**
 * حارس التكامل: حفظ المعلومات + لا ضرر ولا ضرار
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function sha256(filePath) {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function main() {
    ensureDir(REPORTS_DIR);

    const requiredFiles = [
        { path: path.join(DATA_DIR, 'sheikha-faith-communities-registry.json'), requireNoHarm: true },
        { path: path.join(DATA_DIR, 'sheikha-arabian-gulf-identity-system.json'), requireNoHarm: true },
        { path: path.join(DATA_DIR, 'sheikha-arabian-organization-governance.json'), requireNoHarm: true },
        { path: path.join(DATA_DIR, 'sheikha-global-consultative-system.json'), requireNoHarm: false },
        { path: path.join(DATA_DIR, 'sheikha-global-unified-objectives.json'), requireNoHarm: false },
    ];

    const results = requiredFiles.map((entry) => {
        const filePath = entry.path;
        const exists = fs.existsSync(filePath);
        let validJson = false;
        let hash = null;
        let hasNoHarmControl = false;
        let errorMessage = null;

        if (exists) {
            try {
                const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                validJson = true;
                hash = sha256(filePath);

                const raw = JSON.stringify(parsed);
                hasNoHarmControl = raw.includes('لا ضرر ولا ضرار') || raw.includes('noHarm') || raw.includes('forbiddenUseCases');
            } catch (error) {
                errorMessage = error.message;
                console.warn(`تعذر قراءة/تحليل ${filePath}: ${error.message}`);
                validJson = false;
            }
        }

        return {
            file: path.relative(ROOT_DIR, filePath),
            exists,
            validJson,
            requireNoHarm: entry.requireNoHarm,
            hasNoHarmControl: entry.requireNoHarm ? hasNoHarmControl : true,
            hash,
            errorMessage,
        };
    });

    const passed = results.every((item) => item.exists && item.validJson && item.hasNoHarmControl);

    const report = {
        generatedAt: new Date().toISOString(),
        title: 'تقرير حارس التكامل - حفظ المعلومات ولا ضرر',
        passed,
        controls: {
            informationPreservation: 'وجود الملفات + صلاحية JSON + بصمة SHA256',
            noHarm: 'وجود عناصر لا ضرر ولا ضرار/منع الإساءة',
        },
        results,
    };

    const reportPath = path.join(REPORTS_DIR, 'sheikha-integration-no-harm-guard-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 4), 'utf8');

    if (!passed) {
        console.error('❌ فشل حارس التكامل: بعض الضوابط غير مستوفاة');
        console.error(`📁 التقرير: ${reportPath}`);
        process.exit(1);
    }

    console.log('✅ حارس التكامل: حفظ المعلومات + لا ضرر ولا ضرار (مستوفى)');
    console.log(`📁 التقرير: ${reportPath}`);
}

if (require.main === module) {
    main();
}
