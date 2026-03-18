#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'reports', 'operations');
const REPORT_PATH = path.join(REPORT_DIR, 'google-identity-alignment.json');
const ADC_PATH = path.join(
    os.homedir(),
    '.config',
    'gcloud',
    'application_default_credentials.json'
);
const KEY_PATH = path.join(ROOT_DIR, 'service-account-key.json');

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return null;
    }
}

function parseEnvFile() {
    const envPath = path.join(ROOT_DIR, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && line.includes('='))
        .reduce((acc, line) => {
            const i = line.indexOf('=');
            acc[line.slice(0, i).trim()] = line
                .slice(i + 1)
                .trim()
                .replace(/^['"]|['"]$/g, '');
            return acc;
        }, {});
}

function detectIdentityMode() {
    const env = parseEnvFile();
    const adc = readJson(ADC_PATH);
    const key = readJson(KEY_PATH);

    const policy = {
        personalAccount: 'salman.alrajrh@gmail.com',
        commercialAccount: 'market@sheikha.top',
        automationIdentity: key?.client_email || 'service-account-key.json',
        operatorEmail: env.GOOGLE_OPERATOR_EMAIL || 'market@sheikha.top'
    };

    const state = {
        adcExists: !!adc,
        adcType: adc?.type || null,
        adcQuotaProject: adc?.quota_project_id || null,
        serviceAccountKeyExists: !!key,
        serviceAccountEmail: key?.client_email || null,
        serviceAccountProject: key?.project_id || null,
        envProject: env.GOOGLE_CLOUD_PROJECT || env.GOOGLE_PROJECT_ID || null,
        envCredentials: env.GOOGLE_APPLICATION_CREDENTIALS || null
    };

    const recommendedMode = key
        ? 'service-account-first'
        : adc
          ? 'adc-commercial-browser'
          : 'not-configured';

    return { policy, state, recommendedMode };
}

function buildGuidance(identity) {
    return {
        rules: [
            'استخدم الحساب الشخصي للتصفح العام فقط.',
            'استخدم market@sheikha.top للدخول على Google Cloud Console وGoogle Workspace المرتبط بالمشروع.',
            'استخدم service account للتشغيل الآلي داخل التطبيق والسكريبتات.',
            'لا تعتمد على الحساب الشخصي في الإنتاج أو الخلفية.',
            'افصل المتصفح إلى Profile شخصي وProfile تجاري.'
        ],
        browserProfiles: {
            personal: 'Chrome Profile: Salman Personal',
            commercial: 'Chrome Profile: Sheikha Business'
        },
        projectSetup: [
            'ضع GOOGLE_CLOUD_PROJECT على project_id الفعلي للمشروع.',
            'إذا وُجد service-account-key.json فاجعله المسار المعتمد للتشغيل الآلي.',
            'اجعل market@sheikha.top هو البريد التشغيلي المرجعي في البيئة.'
        ],
        runbook:
            identity.recommendedMode === 'service-account-first'
                ? [
                      'ضع service-account-key.json في جذر المشروع.',
                      'شغّل npm run sovereign:global-pulse:v2',
                      'اترك الحساب الشخصي خارج مسار التشغيل.'
                  ]
                : identity.recommendedMode === 'adc-commercial-browser'
                  ? [
                        'أعد login في gcloud باستخدام الحساب التجاري فقط.',
                        'وافق على صلاحية cloud-platform كاملة.',
                        'شغّل npm run sovereign:global-pulse:fix'
                    ]
                  : [
                        'أضف service-account-key.json أو فعّل ADC بالحساب التجاري.',
                        'حدّث .env بقيم GOOGLE_CLOUD_PROJECT وGOOGLE_APPLICATION_CREDENTIALS.'
                    ]
    };
}

function computeScore(identity) {
    let score = 0;
    if (identity.state.serviceAccountKeyExists) score += 50;
    if (identity.state.envProject || identity.state.serviceAccountProject) score += 20;
    if (identity.policy.operatorEmail === 'market@sheikha.top') score += 15;
    if (identity.state.adcExists || identity.state.serviceAccountKeyExists) score += 15;
    return score;
}

function main() {
    const identity = detectIdentityMode();
    const guidance = buildGuidance(identity);
    const score = computeScore(identity);

    const report = {
        timestamp: new Date().toISOString(),
        title: 'Google Identity Alignment Report',
        identity,
        guidance,
        summary: {
            score,
            level: score >= 90 ? 'excellent' : score >= 70 ? 'high' : 'needs-alignment',
            preferredIdentity: identity.policy.commercialAccount,
            automationMode: identity.recommendedMode
        }
    };

    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ Google Identity Alignment');
    console.log(`• preferred-commercial: ${report.summary.preferredIdentity}`);
    console.log(`• automation-mode: ${report.summary.automationMode}`);
    console.log(`• score: ${report.summary.score}`);
    console.log(`• level: ${report.summary.level}`);
    console.log('• report: reports/operations/google-identity-alignment.json');
    console.log('═════════════════════════════════════════════════════════════');
}

main();
