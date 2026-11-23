#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 *
 * شيخة — مزامنة غرفة العمليات للمحادثات
 * يجهز حزمة سياق آمنة ومحلية يمكن فتحها عند الطلب
 * أو إرسالها كتقرير يدوي إلى أي غرفة محادثة خارجية.
 *
 * ملاحظة:
 * هذا السكربت لا يستطيع الوصول تلقائياً إلى محادثات Gemini الخاصة
 * أو مزامنتها بدون تكامل رسمي ومفاتيح وصول صريحة.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'synchronization');
const STATE_FILE = path.join(DATA_DIR, 'chat-war-room-state.json');
const CONTEXT_ENGINE_PATH = path.join(ROOT_DIR, 'lib', 'context-integration-engine.js');

function parseArgs(argv) {
    const args = {
        action: 'sync',
        channel: 'manual',
        open: false,
        reportOnly: false,
        note: '',
        message: '',
        requestedBy: process.env.SHEIKHA_OPERATOR_EMAIL || 'market@sheikha.top'
    };

    for (let index = 0; index < argv.length; index += 1) {
        const current = argv[index];
        if (current === '--open') {
            args.open = true;
        } else if (current === '--report') {
            args.reportOnly = true;
            args.action = 'report';
        } else if (current.startsWith('--channel=')) {
            args.channel = current.split('=')[1] || args.channel;
        } else if (current === '--channel' && argv[index + 1]) {
            args.channel = argv[index + 1];
            index += 1;
        } else if (current.startsWith('--note=')) {
            args.note = current.slice('--note='.length).trim();
        } else if (current === '--note' && argv[index + 1]) {
            args.note = String(argv[index + 1]).trim();
            index += 1;
        } else if (current.startsWith('--message=')) {
            args.message = current.slice('--message='.length).trim();
        } else if (current === '--message' && argv[index + 1]) {
            args.message = String(argv[index + 1]).trim();
            index += 1;
        } else if (current.startsWith('--requested-by=')) {
            args.requestedBy = current.slice('--requested-by='.length).trim();
        } else if (current === '--requested-by' && argv[index + 1]) {
            args.requestedBy = String(argv[index + 1]).trim();
            index += 1;
        } else if (current === '--help' || current === '-h') {
            args.action = 'help';
        }
    }

    return args;
}

function printHelp() {
    console.log('Sheikha Chat War Room Sync');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/chat-war-room-sync.js');
    console.log('  node scripts/chat-war-room-sync.js --open');
    console.log('  node scripts/chat-war-room-sync.js --report --channel gemini');
    console.log('  node scripts/chat-war-room-sync.js --message "ملخص الطلب"');
    console.log('');
    console.log('Options:');
    console.log('  --open                 إنشاء الحزمة وفتح مسارها في المخرجات');
    console.log('  --report               إنشاء تقرير فقط بدون تعديل إضافي');
    console.log('  --channel <name>       اسم قناة المحادثة المستهدفة (مثال: gemini)');
    console.log('  --note <text>          ملاحظة تشغيل داخلية');
    console.log('  --message <text>       رسالة أو طلب يراد تضمينه في التقرير');
    console.log('  --requested-by <mail>  البريد الذي طلب العملية');
}

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function safeReadJson(filePath, fallbackValue) {
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        return fallbackValue;
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

async function findLatestReport(prefix) {
    try {
        const reportsRoot = path.join(ROOT_DIR, 'reports');
        const names = await fs.readdir(reportsRoot);
        const matches = names
            .filter(name => name.startsWith(prefix))
            .sort((left, right) => right.localeCompare(left));

        if (!matches.length) {
            return null;
        }

        return path.join(reportsRoot, matches[0]);
    } catch (error) {
        return null;
    }
}

async function readLatestActivationSummary() {
    const latest = await findLatestReport('google-engines-activation-');
    if (!latest) {
        return null;
    }

    const payload = await safeReadJson(latest, null);
    if (!payload) {
        return {
            file: latest,
            summary: null
        };
    }

    return {
        file: latest,
        summary: payload.summary || payload.results || payload
    };
}

async function readPackageSummary() {
    const packagePath = path.join(ROOT_DIR, 'package.json');
    const packageJson = await safeReadJson(packagePath, {});
    return {
        name: packageJson.name || 'unknown',
        version: packageJson.version || '0.0.0',
        scripts: Object.keys(packageJson.scripts || {}),
        dependenciesCount: Object.keys(packageJson.dependencies || {}).length,
        devDependenciesCount: Object.keys(packageJson.devDependencies || {}).length
    };
}

async function readContextSnapshot() {
    try {
        if (!(await fileExists(CONTEXT_ENGINE_PATH))) {
            return null;
        }

        const ContextIntegrationEngine = require(CONTEXT_ENGINE_PATH);
        const engine = new ContextIntegrationEngine();
        const snapshot = await engine.readFullContext();
        return {
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            recommendations: snapshot.snapshot?.recommendations || [],
            systems: Object.keys(snapshot.snapshot?.systems || {})
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}

function buildIntegrityHash(payload) {
    const secretSeed = [
        process.env.JWT_SECRET,
        process.env.SHEIKHA_SYNC_SECRET,
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_PROJECT_ID,
        'sheikha-war-room'
    ]
        .filter(Boolean)
        .join('|');

    return crypto
        .createHash('sha256')
        .update(JSON.stringify(payload))
        .update(secretSeed)
        .digest('hex');
}

async function saveState(payload) {
    await ensureDir(DATA_DIR);
    await fs.writeFile(STATE_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

async function buildPayload(args) {
    const activation = await readLatestActivationSummary();
    const packageSummary = await readPackageSummary();
    const contextSnapshot = await readContextSnapshot();
    const previousState = await safeReadJson(STATE_FILE, {
        sessions: [],
        lastRequestedChannel: null,
        latestReport: null
    });

    const payload = {
        timestamp: new Date().toISOString(),
        requestedBy: args.requestedBy,
        channel: args.channel,
        mode: args.reportOnly ? 'report' : 'sync',
        privacy: {
            localOnly: true,
            autoSendExternalChats: false,
            note: 'لا يتم إرسال أي محتوى تلقائياً إلى Gemini أو أي مزود خارجي بدون إجراء صريح.'
        },
        workspace: {
            root: ROOT_DIR,
            package: packageSummary
        },
        latestGoogleActivation: activation,
        contextSnapshot,
        operatorMessage: args.message || '',
        operatorNote: args.note || '',
        previousState: {
            lastRequestedChannel: previousState.lastRequestedChannel || null,
            lastReport: previousState.latestReport || null,
            sessionsCount: Array.isArray(previousState.sessions) ? previousState.sessions.length : 0
        }
    };

    payload.integrity = {
        algorithm: 'sha256',
        hash: buildIntegrityHash(payload)
    };

    return payload;
}

function buildMarkdownReport(payload, reportJsonPath) {
    const latestActivation = payload.latestGoogleActivation || {};
    const activationFile = latestActivation.file || 'غير متوفر';
    const contextSystems = Array.isArray(payload.contextSnapshot?.systems)
        ? payload.contextSnapshot.systems.join(', ')
        : 'غير متوفر';
    const recommendations = Array.isArray(payload.contextSnapshot?.recommendations)
        ? payload.contextSnapshot.recommendations.slice(0, 5)
        : [];

    return [
        '# Sheikha Secure War Room Report',
        '',
        `- Timestamp: ${payload.timestamp}`,
        `- Requested By: ${payload.requestedBy}`,
        `- Channel: ${payload.channel}`,
        `- Mode: ${payload.mode}`,
        `- Integrity Hash: ${payload.integrity.hash}`,
        `- JSON Report: ${reportJsonPath}`,
        '',
        '## Privacy',
        `- Local Only: ${payload.privacy.localOnly ? 'Yes' : 'No'}`,
        `- Auto Send To External Chats: ${payload.privacy.autoSendExternalChats ? 'Yes' : 'No'}`,
        `- Note: ${payload.privacy.note}`,
        '',
        '## Workspace',
        `- Root: ${payload.workspace.root}`,
        `- Package: ${payload.workspace.package.name}@${payload.workspace.package.version}`,
        `- Scripts Count: ${payload.workspace.package.scripts.length}`,
        '',
        '## Latest Google Activation',
        `- Source File: ${activationFile}`,
        '',
        '## Context Snapshot',
        `- Systems: ${contextSystems}`,
        `- Snapshot Time: ${payload.contextSnapshot?.timestamp || 'غير متوفر'}`,
        '',
        '## Operator Message',
        payload.operatorMessage || 'لا يوجد',
        '',
        '## Operator Note',
        payload.operatorNote || 'لا يوجد',
        '',
        '## Top Recommendations',
        ...(recommendations.length
            ? recommendations.map(
                  (item, index) =>
                      `- ${index + 1}. ${item.action || item.issue || JSON.stringify(item)}`
              )
            : ['- لا توجد توصيات متاحة حالياً']),
        '',
        '## Manual Gemini Handoff',
        '- افتح التقرير فقط عند الطلب.',
        '- انسخ الملخص أو الرسالة يدوياً إلى غرفة المحادثة الخارجية إذا رغبت.',
        '- لا توجد مزامنة خفية أو إرسال تلقائي.',
        ''
    ].join('\n');
}

async function appendSessionState(payload, reportJsonPath, reportMdPath) {
    const state = await safeReadJson(STATE_FILE, {
        sessions: [],
        lastRequestedChannel: null,
        latestReport: null
    });

    const sessionEntry = {
        timestamp: payload.timestamp,
        channel: payload.channel,
        requestedBy: payload.requestedBy,
        mode: payload.mode,
        reportJsonPath,
        reportMdPath,
        integrityHash: payload.integrity.hash,
        operatorMessage: payload.operatorMessage,
        operatorNote: payload.operatorNote
    };

    state.sessions = Array.isArray(state.sessions) ? state.sessions : [];
    state.sessions.push(sessionEntry);
    state.sessions = state.sessions.slice(-50);
    state.lastRequestedChannel = payload.channel;
    state.latestReport = {
        json: reportJsonPath,
        markdown: reportMdPath,
        timestamp: payload.timestamp
    };

    await saveState(state);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.action === 'help') {
        printHelp();
        return;
    }

    await ensureDir(REPORTS_DIR);

    const payload = await buildPayload(args);
    const stamp = payload.timestamp.replace(/[:.]/g, '-');
    const reportJsonPath = path.join(REPORTS_DIR, `chat-war-room-${stamp}.json`);
    const reportMdPath = path.join(REPORTS_DIR, `chat-war-room-${stamp}.md`);

    await fs.writeFile(reportJsonPath, JSON.stringify(payload, null, 2), 'utf8');
    await fs.writeFile(reportMdPath, buildMarkdownReport(payload, reportJsonPath), 'utf8');
    await appendSessionState(payload, reportJsonPath, reportMdPath);

    console.log('✅ تم إنشاء حزمة غرفة العمليات الآمنة');
    console.log(`📄 JSON: ${reportJsonPath}`);
    console.log(`📄 Markdown: ${reportMdPath}`);
    console.log(`🔐 Integrity: ${payload.integrity.hash}`);
    console.log(`🔒 Local Only: ${payload.privacy.localOnly ? 'yes' : 'no'}`);
    console.log(
        `🚫 Auto Send External Chats: ${payload.privacy.autoSendExternalChats ? 'yes' : 'no'}`
    );

    if (args.open) {
        console.log('📂 افتح التقرير من المسار التالي عند الحاجة:');
        console.log(reportMdPath);
    }

    if (args.channel.toLowerCase() === 'gemini') {
        console.log(
            'ℹ️ تكامل Gemini هنا يدوي وآمن فقط: تم تجهيز تقرير جاهز للنسخ عند الطلب، بدون إرسال تلقائي.'
        );
    }
}

main().catch(error => {
    console.error('❌ فشل إنشاء حزمة غرفة العمليات:', error.message);
    process.exit(1);
});
