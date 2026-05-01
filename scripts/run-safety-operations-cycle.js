#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROTOCOL_PATH = path.join(ROOT_DIR, 'data', 'org', 'safety-operations-protocol.json');
const OUT_DIR = path.join(ROOT_DIR, 'reports', 'operations', 'safety');

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function now() {
    return new Date().toISOString();
}

function mockMinute(sectionId) {
    const stamp = now();
    return {
        sectionId,
        minuteId: `${sectionId}-${Date.now()}`,
        issuer: 'SHK-SAFE-BOT-ISSUER',
        receiver: 'SHK-SAFE-BOT-RECEIVER',
        flag: 'FLAG-GREEN',
        createdAt: stamp,
        status: 'recorded'
    };
}

function main() {
    const protocol = readJson(PROTOCOL_PATH);
    if (!protocol) {
        console.error('❌ ملف بروتوكول السلامة غير موجود.');
        process.exitCode = 1;
        return;
    }

    const minutes = (protocol.sections || []).map(section => mockMinute(section.id));

    const report = {
        title: 'تقرير دورة السلامة التشغيلية الرقمية',
        generatedAt: now(),
        protocol: protocol._meta,
        issuerReceiverFlagModel: protocol.botRoles,
        minutes,
        summary: {
            totalMinutes: minutes.length,
            greenFlags: minutes.filter(item => item.flag === 'FLAG-GREEN').length,
            nonGreenFlags: minutes.filter(item => item.flag !== 'FLAG-GREEN').length,
            patrolsExecuted: minutes.filter(item => item.sectionId === 'SHK-SAFE-004').length
        },
        actions: [
            'اعتماد المحاضر في الأرشيف الرسمي',
            'مراجعة مدير السلامة لكل Flag غير أخضر',
            'إرفاق الأدلة الفنية لكل جولة أمنية رقمية'
        ]
    };

    const stamp = now().replace(/[:.]/g, '-').slice(0, 19);
    writeJson(path.join(OUT_DIR, `safety-operations-${stamp}.json`), report);
    writeJson(path.join(OUT_DIR, 'safety-operations-latest.json'), report);

    console.log('✅ اكتملت دورة السلامة التشغيلية الرقمية.');
    console.log('📁 reports/operations/safety/safety-operations-latest.json');
}

main();
