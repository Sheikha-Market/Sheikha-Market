#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const policyPath = path.join(rootDir, 'data', 'org', 'autonomous-governance-policy.json');

const DEFAULT_POLICY = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    scope: {
        operationalActions: ['run-tests', 'apply-safe-fixes', 'update-docs', 'prepare-release-candidate'],
        criticalActions: ['git-push', 'deploy-staging', 'deploy-production', 'modify-security-controls']
    },
    maturityLevels: {
        L1: { label: 'Observed', minScore: 40, description: 'Can run checks with restricted write actions.' },
        L2: { label: 'Assisted', minScore: 60, description: 'Can propose and apply low-risk operational changes.' },
        L3: { label: 'Governed', minScore: 75, description: 'Can execute governed staging activities.' },
        L4: { label: 'Trusted', minScore: 90, description: 'Can request production deploy when all hard gates pass.' }
    },
    permissionsThresholds: {
        canRunTests: 'L1',
        canCommit: 'L2',
        canPush: 'L3',
        canDeployStaging: 'L3',
        canDeployProduction: 'L4'
    },
    compliance: {
        minimumSuccessRatePercent: 85,
        requiredGateScore: { staging: 75, production: 95 },
        requiredChecks: {
            staging: ['security', 'performance', 'compliance', 'dataSafety', 'rollbackReadiness'],
            production: ['security', 'performance', 'compliance', 'dataSafety', 'rollbackReadiness', 'auditTrail']
        }
    },
    audit: {
        artifactDir: 'reports/operations/autonomy-governance',
        latestFile: 'latest.json',
        retentionDays: 90
    },
    defaults: {
        failClosed: true,
        target: 'staging'
    }
};

function safeReadJson(filePath, fallbackValue) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallbackValue;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        return fallbackValue;
    }
}

function parseArgs(argv) {
    const parsed = {
        target: null,
        enforce: false,
        json: false
    };

    for (const arg of argv) {
        if (arg.startsWith('--target=')) {
            parsed.target = String(arg.split('=')[1] || '').trim().toLowerCase();
        }
        if (arg === '--enforce') {
            parsed.enforce = true;
        }
        if (arg === '--json') {
            parsed.json = true;
        }
    }

    return parsed;
}

function ensureJsonFile(filePath, defaultValue) {
    if (fs.existsSync(filePath)) {
        return;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
}

function getMaturityRank(level) {
    const rank = { L1: 1, L2: 2, L3: 3, L4: 4 };
    return rank[level] || 0;
}

function resolveMaturityLevel(score, levels) {
    const candidates = Object.entries(levels)
        .map(([key, value]) => ({ key, minScore: Number(value.minScore) || 0, label: value.label || key }))
        .sort((a, b) => a.minScore - b.minScore);

    let chosen = candidates[0] || { key: 'L1', minScore: 0, label: 'Observed' };
    for (const candidate of candidates) {
        if (score >= candidate.minScore) {
            chosen = candidate;
        }
    }

    return chosen;
}

function resolvePermissions(policy, maturityLevel) {
    const permissions = {};
    const currentRank = getMaturityRank(maturityLevel);

    Object.entries(policy.permissionsThresholds || {}).forEach(([permission, minLevel]) => {
        permissions[permission] = currentRank >= getMaturityRank(minLevel);
    });

    permissions.canDeploy = Boolean(permissions.canDeployStaging || permissions.canDeployProduction);
    return permissions;
}

function evaluateChecks(policy, metrics) {
    const securityCheck = fs.existsSync(path.join(rootDir, 'SECURITY.md'))
        && fs.existsSync(path.join(rootDir, '.github', 'workflows', 'security-scan.yml'));

    const performanceCheck = (metrics.successRatePercent || 0) >= (policy.compliance.minimumSuccessRatePercent || 85);

    const hasDecisionEvidence = fs.existsSync(path.join(rootDir, 'data', 'decision-log.json'))
        || fs.existsSync(path.join(rootDir, 'data', 'governance-log.json'))
        || fs.existsSync(path.join(rootDir, 'reports', 'operations'));

    const complianceCheck = fs.existsSync(path.join(rootDir, 'CHARTER.md')) && hasDecisionEvidence;

    const dataSafetyCheck = fs.existsSync(path.join(rootDir, 'data'))
        && fs.existsSync(path.join(rootDir, 'scripts', 'sovereign-backup.sh'));

    const rollbackCheck = fs.existsSync(path.join(rootDir, 'scripts', 'rollback-deployment.sh'));

    const auditCheck = fs.existsSync(path.join(rootDir, 'data', 'governance-log.json'))
        || fs.existsSync(path.join(rootDir, 'reports', 'operations'));

    return {
        security: {
            passed: securityCheck,
            details: securityCheck ? 'Security baseline files found.' : 'Missing SECURITY.md or security-scan workflow.'
        },
        performance: {
            passed: performanceCheck,
            details: `Success rate ${(metrics.successRatePercent || 0).toFixed(2)}%.`
        },
        compliance: {
            passed: complianceCheck,
            details: complianceCheck ? 'Compliance charter and decision log found.' : 'Missing CHARTER.md or decision-log.json.'
        },
        dataSafety: {
            passed: dataSafetyCheck,
            details: dataSafetyCheck ? 'Data directory and backup script found.' : 'Missing data directory or backup script.'
        },
        rollbackReadiness: {
            passed: rollbackCheck,
            details: rollbackCheck ? 'Rollback script is ready.' : 'Rollback script not found.'
        },
        auditTrail: {
            passed: auditCheck,
            details: auditCheck ? 'Audit evidence source found.' : 'No audit source found.'
        }
    };
}

function computeGateSummary(target, checks, policy, permissions) {
    const targetKey = target === 'production' ? 'production' : 'staging';
    const requiredChecks = policy.compliance.requiredChecks[targetKey] || [];
    const requiredScore = Number(policy.compliance.requiredGateScore[targetKey] || 100);

    const checkKeys = Object.keys(checks);
    const passedCount = checkKeys.filter((key) => checks[key].passed).length;
    const gateScore = checkKeys.length === 0 ? 0 : Math.round((passedCount / checkKeys.length) * 100);
    const missingRequired = requiredChecks.filter((key) => !checks[key] || !checks[key].passed);

    const permissionAllowed = targetKey === 'production'
        ? Boolean(permissions.canDeployProduction)
        : Boolean(permissions.canDeployStaging);

    const allowed = missingRequired.length === 0 && gateScore >= requiredScore && permissionAllowed;

    return {
        target: targetKey,
        requiredChecks,
        missingRequired,
        requiredScore,
        gateScore,
        permissionAllowed,
        allowed
    };
}

function writeAudit(policy, report) {
    const artifactDir = path.join(rootDir, policy.audit.artifactDir);
    fs.mkdirSync(artifactDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:]/g, '-');
    const reportPath = path.join(artifactDir, `autonomy-governance-${stamp}.json`);
    const latestPath = path.join(artifactDir, policy.audit.latestFile || 'latest.json');

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));

    return { reportPath, latestPath };
}

function collectRunMetrics() {
    const governanceMetricsPath = path.join(rootDir, 'data', 'governance-metrics.json');
    const governanceMetrics = safeReadJson(governanceMetricsPath, {});
    let runs = Number(governanceMetrics.runs || 0);
    let success = Number(governanceMetrics.success || 0);
    let failure = Number(governanceMetrics.failure || 0);
    let stableRuns = Number((governanceMetrics.modes || {}).stable || 0);

    if (runs === 0) {
        const governanceLog = safeReadJson(path.join(rootDir, 'data', 'governance-log.json'), {});
        const entries = Array.isArray(governanceLog.log) ? governanceLog.log : [];

        runs = entries.length;
        success = entries.filter((entry) => String(entry.result || '').toLowerCase() === 'success').length;
        failure = entries.filter((entry) => String(entry.result || '').toLowerCase() !== 'success').length;
        stableRuns = entries.filter((entry) => String(entry.mode || '').toLowerCase() === 'stable').length;
    }
    const successRatePercent = runs > 0 ? (success / runs) * 100 : 0;
    const stableSharePercent = runs > 0 ? (stableRuns / runs) * 100 : 0;

    const score = Math.round(
        (successRatePercent * 0.45)
        + (Math.min(100, runs * 10) * 0.15)
        + (stableSharePercent * 0.2)
        + ((failure === 0 ? 100 : Math.max(0, 100 - (failure * 10))) * 0.2)
    );

    return {
        runs,
        success,
        failure,
        stableRuns,
        successRatePercent,
        stableSharePercent,
        score
    };
}

function main() {
    ensureJsonFile(policyPath, DEFAULT_POLICY);

    const args = parseArgs(process.argv.slice(2));
    const policy = safeReadJson(policyPath, null);

    if (!policy || !policy.maturityLevels || !policy.permissionsThresholds || !policy.compliance) {
        console.error('AUTONOMY_GATE_BLOCKED: governance policy is invalid.');
        process.exit(1);
    }

    const target = args.target || process.env.AUTONOMY_DEPLOY_TARGET || policy.defaults.target || 'staging';
    const metrics = collectRunMetrics();
    const maturity = resolveMaturityLevel(metrics.score, policy.maturityLevels);
    const permissions = resolvePermissions(policy, maturity.key);
    const checks = evaluateChecks(policy, metrics);
    const gate = computeGateSummary(target, checks, policy, permissions);

    const report = {
        success: true,
        timestamp: new Date().toISOString(),
        policyVersion: policy.version || 'unknown',
        maturity: {
            level: maturity.key,
            label: maturity.label,
            score: metrics.score
        },
        metrics,
        permissions,
        checks,
        gate
    };

    const outputs = writeAudit(policy, report);
    report.audit = outputs;

    const enforce = Boolean(args.enforce || args.target);
    const blocked = enforce && !gate.allowed;

    if (args.json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        console.log(`AUTONOMY_MATURITY=${report.maturity.level} SCORE=${report.maturity.score}`);
        console.log(`AUTONOMY_PERMISSIONS=${JSON.stringify(permissions)}`);
        console.log(`AUTONOMY_GATE_TARGET=${gate.target} SCORE=${gate.gateScore}/${gate.requiredScore} ALLOWED=${gate.allowed}`);
        console.log(`AUTONOMY_AUDIT=${outputs.reportPath}`);

        if (gate.missingRequired.length > 0) {
            console.log(`AUTONOMY_MISSING_REQUIRED=${gate.missingRequired.join(',')}`);
        }
    }

    if (blocked) {
        console.error('AUTONOMY_GATE_BLOCKED: deployment gate conditions are not satisfied.');
        process.exit(1);
    }
}

main();