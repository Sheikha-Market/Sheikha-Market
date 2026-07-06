#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packagePath = path.join(rootDir, 'package.json');
const policyPath = path.join(rootDir, 'release-policy.json');
const statePath = path.join(rootDir, '.sheikha-release-state.json');
const reportPath = path.join(rootDir, 'dist', 'release-cycle-report.json');

function readJson(filePath, fallback) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return fallback;
    }
}

function writeJson(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`, 'utf8');
}

function parseArgs() {
    const args = process.argv.slice(2);
    const flags = {
        apply: false,
        reason: 'auto',
        newTech: false,
        newExtension: false,
        innovationGoal: false
    };

    for (const arg of args) {
        if (arg === '--apply') {
            flags.apply = true;
        }
        if (arg.startsWith('--reason=')) {
            flags.reason = arg.split('=')[1] || 'auto';
        }
        if (arg === '--new-tech') {
            flags.newTech = true;
        }
        if (arg === '--new-extension') {
            flags.newExtension = true;
        }
        if (arg === '--innovation-goal') {
            flags.innovationGoal = true;
        }
    }

    return flags;
}

function bumpSemver(version, bump) {
    const parts = String(version || '1.0.0').split('.').map(n => Number(n || 0));
    const [major, minor, patch] = [parts[0] || 1, parts[1] || 0, parts[2] || 0];

    if (bump === 'major') {
        return `${major + 1}.0.0`;
    }
    if (bump === 'minor') {
        return `${major}.${minor + 1}.0`;
    }
    return `${major}.${minor}.${patch + 1}`;
}

function isMonthlyDue(lastReleaseAt, intervalDays) {
    if (!lastReleaseAt) {
        return true;
    }

    const last = new Date(lastReleaseAt).getTime();
    if (Number.isNaN(last)) {
        return true;
    }

    const now = Date.now();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return diffDays >= Number(intervalDays || 30);
}

function chooseBump(reasons) {
    if (reasons.includes('new-technology') || reasons.includes('innovation-goal')) {
        return 'minor';
    }
    return 'patch';
}

function run() {
    const flags = parseArgs();
    const pkg = readJson(packagePath, null);
    const policy = readJson(policyPath, null);
    const state = readJson(statePath, {
        lastVersion: null,
        lastReleaseAt: null,
        history: []
    });

    if (!pkg || !policy) {
        console.error('تعذر قراءة package.json أو release-policy.json');
        process.exit(1);
    }

    const reasons = [];
    const monthlyDue = isMonthlyDue(state.lastReleaseAt, policy.timing && policy.timing.monthlyIntervalDays);

    if (monthlyDue && policy.criteria && policy.criteria.monthlyRenewal && policy.criteria.monthlyRenewal.enabled) {
        reasons.push('monthly-renewal');
    }

    if ((flags.newTech || flags.reason === 'new-tech') && policy.criteria && policy.criteria.newTechnologyDetected && policy.criteria.newTechnologyDetected.enabled) {
        reasons.push('new-technology');
    }

    if ((flags.newExtension || flags.reason === 'new-extension') && policy.criteria && policy.criteria.newExtensionDetected && policy.criteria.newExtensionDetected.enabled) {
        reasons.push('new-extension');
    }

    if ((flags.innovationGoal || flags.reason === 'innovation-goal') && policy.criteria && policy.criteria.innovationGoalActivated && policy.criteria.innovationGoalActivated.enabled) {
        reasons.push('innovation-goal');
    }

    if (flags.reason === 'manual' && reasons.length === 0) {
        reasons.push('manual');
    }

    const shouldRelease = reasons.length > 0;
    const bump = chooseBump(reasons);
    const fromVersion = pkg.version;
    const toVersion = shouldRelease ? bumpSemver(fromVersion, bump) : fromVersion;

    const nowIso = new Date().toISOString();
    const report = {
        owner: policy.owner || 'SHEIKHA',
        generatedAt: nowIso,
        governance: policy.governance || {},
        schedule: policy.timing || {},
        currentVersion: fromVersion,
        targetVersion: toVersion,
        shouldRelease,
        bump,
        reasons,
        applyMode: flags.apply,
        valueGoals: {
            temporal: 'تجديد زمني شهري منضبط',
            standards: 'تجديد معياري عند التقنية الجديدة أو الابتكار',
            ethical: 'تنافس في فعل الخير والمنفعة بلا ضرر أو ضرار'
        }
    };

    if (flags.apply && shouldRelease) {
        pkg.version = toVersion;
        writeJson(packagePath, pkg);

        state.lastVersion = toVersion;
        state.lastReleaseAt = nowIso;
        state.history = Array.isArray(state.history) ? state.history : [];
        state.history.push({ version: toVersion, releasedAt: nowIso, reasons, bump });
        state.history = state.history.slice(-36);
        writeJson(statePath, state);
    }

    writeJson(reportPath, report);

    console.log('Sheikha Release Cycle Report');
    console.log(`from=${fromVersion}`);
    console.log(`to=${toVersion}`);
    console.log(`shouldRelease=${shouldRelease}`);
    console.log(`reasons=${reasons.join(',') || 'none'}`);
    console.log(`mode=${flags.apply ? 'apply' : 'plan'}`);
    console.log(`report=${reportPath}`);
}

run();
