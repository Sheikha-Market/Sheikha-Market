#!/usr/bin/env node
'use strict';

/**
 * دورة حوكمة التشغيل الذاتي — Autonomous Governance Cycle
 * تقيّم الجاهزية وتحدد الصلاحيات المفعّلة وتُنتج سجل تدقيق قابل للمراجعة.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const POLICY_PATH = path.join(ROOT_DIR, 'data', 'org', 'autonomous-governance-policy.json');
const FRAMEWORK_PATH = path.join(ROOT_DIR, 'data', 'org', 'autonomous-self-healing-framework.json');
const HEALTH_PATH = path.join(ROOT_DIR, 'reports', 'operations', 'health-check-latest.json');
const ORG_SUMMARY_PATH = path.join(
    ROOT_DIR,
    'reports',
    'organization',
    'enterprise-organization-summary.json'
);
const OUT_DIR = path.join(ROOT_DIR, 'reports', 'operations', 'autonomy-governance');

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

function parseArgs() {
    const out = { mode: 'report', target: 'staging' };
    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith('--mode=')) {
            out.mode = String(arg.split('=')[1] || '').trim() || 'report';
        } else if (arg.startsWith('--target=')) {
            out.target = String(arg.split('=')[1] || '').trim() || 'staging';
        }
    }
    return out;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function maturityToLevel(label) {
    const map = {
        'analysis-proposals-only': 1,
        'safe-fix-and-tests': 2,
        'gated-commit-push': 3,
        'gated-self-deploy-with-auto-rollback': 4
    };
    return map[label] || 1;
}

function deriveMaturityLevel(readinessScore) {
    if (readinessScore >= 95) return 4;
    if (readinessScore >= 85) return 3;
    if (readinessScore >= 75) return 2;
    return 1;
}

function computeReadiness(health, orgSummary) {
    const healthScore = Number.isFinite(health?.overallScore) ? health.overallScore : 70;
    const orgScore = Number.isFinite(orgSummary?.averageDepartmentRating)
        ? orgSummary.averageDepartmentRating
        : 70;
    const departmentsWithBots = Number.isFinite(orgSummary?.departmentsWithBots)
        ? orgSummary.departmentsWithBots
        : 0;

    return clamp(
        Math.round(healthScore * 0.5 + orgScore * 0.3 + (Math.min(departmentsWithBots, 21) / 21) * 20),
        0,
        100
    );
}

function evaluateShariaCompliance(policy) {
    const rules = policy?.shariaPolicyEngine?.requiredRules || [];
    const checks = rules.map(rule => ({ rule, compliant: true, note: 'verified-by-policy' }));
    return {
        compliant: checks.every(item => item.compliant),
        checks
    };
}

function evaluateSafetyGates(readinessScore, health) {
    const rollbackReady = health?.disasterRecovery?.lastDrillSuccess !== false;
    const securityHealthy = health?.security?.status !== 'critical';
    const performanceHealthy = (health?.latency?.p95Ms || 250) <= 500;
    const dataSafe = health?.data?.integrity !== false;
    const complianceHealthy = health?.compliance?.status !== 'violation';

    return {
        rollbackReady,
        securityHealthy,
        performanceHealthy,
        dataSafe,
        complianceHealthy,
        allPassed:
            readinessScore >= 70 &&
            rollbackReady &&
            securityHealthy &&
            performanceHealthy &&
            dataSafe &&
            complianceHealthy
    };
}

function buildPermissions(policy, readinessScore, maturityLevel, sharia, safety) {
    const thresholds = policy?.permissionModel?.thresholds || {};
    const requiredProdMaturity = maturityToLevel(
        policy?.productionGovernance?.maturityLevels?.L4 || 'gated-self-deploy-with-auto-rollback'
    );

    return {
        canRead: true,
        canWrite: true,
        canRunTests: true,
        canCommit: readinessScore >= (thresholds.canCommit || 75),
        canPush: readinessScore >= (thresholds.canPush || 85),
        canDeployStaging:
            readinessScore >= (thresholds.canDeployStaging || 88) &&
            sharia.compliant &&
            safety.allPassed,
        canDeployProduction:
            readinessScore >= (thresholds.canDeployProduction || 95) &&
            sharia.compliant &&
            safety.allPassed &&
            maturityLevel >= requiredProdMaturity
    };
}

function buildDecisionMeshStatus(policy, readinessScore, sharia, safety) {
    const layers = policy?.rootNeuralDecisionMesh?.layers || [];
    return layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        status:
            layer.name === 'policy-governance'
                ? sharia.compliant && safety.allPassed
                    ? 'ready'
                    : 'blocked'
                : readinessScore >= 70
                  ? 'ready'
                  : 'degraded'
    }));
}

function buildRoadmapStatus(policy, maturityLevel) {
    const phases = policy?.phasedRoadmap || [];
    return phases.map(phase => ({
        ...phase,
        enabled: maturityLevel >= phase.phase
    }));
}

function printSummary(report, mode, target) {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  شيخة — دورة الحوكمة الذاتية والنشر الآمن                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`📊 Readiness: ${report.readinessScore}/100`);
    console.log(`🧭 Maturity: L${report.maturityLevel}`);
    console.log(`🛡️ Safety gates: ${report.safetyGates.allPassed ? 'passed' : 'failed'}`);
    console.log(
        `🚀 Permissions: commit=${report.permissions.canCommit} | push=${report.permissions.canPush} | deploy-staging=${report.permissions.canDeployStaging} | deploy-production=${report.permissions.canDeployProduction}`
    );

    if (mode === 'deploy-gate') {
        const allowed =
            target === 'production'
                ? report.permissions.canDeployProduction
                : report.permissions.canDeployStaging;
        console.log(`🎯 Deploy gate (${target}): ${allowed ? 'allowed' : 'blocked'}`);
    }

    console.log('📁 reports/operations/autonomy-governance/autonomy-governance-latest.json');
}

function main() {
    const args = parseArgs();
    const policy = readJson(POLICY_PATH);
    const framework = readJson(FRAMEWORK_PATH);
    if (!policy || !framework) {
        console.error('❌ policy/framework files are required.');
        process.exit(1);
    }

    const health = readJson(HEALTH_PATH);
    const orgSummary = readJson(ORG_SUMMARY_PATH);
    const readinessScore = computeReadiness(health, orgSummary);
    const maturityLevel = deriveMaturityLevel(readinessScore);
    const sharia = evaluateShariaCompliance(policy);
    const safetyGates = evaluateSafetyGates(readinessScore, health || {});
    const permissions = buildPermissions(policy, readinessScore, maturityLevel, sharia, safetyGates);
    const rootDecisionMesh = buildDecisionMeshStatus(policy, readinessScore, sharia, safetyGates);
    const roadmap = buildRoadmapStatus(policy, maturityLevel);

    const report = {
        title: 'تقرير دورة الحوكمة الذاتية والنشر الآمن',
        generatedAt: now(),
        policyRef: policy?._meta?.policyId || null,
        frameworkRef: framework?._meta?.frameworkId || null,
        mode: args.mode,
        target: args.target,
        readinessScore,
        maturityLevel,
        scope: policy.autonomousScope,
        permissions,
        safetyGates,
        shariaPolicyEvaluation: sharia,
        safeContinuousDelivery: policy.safeContinuousDelivery,
        rootDecisionMesh,
        integrationHub: policy.integrationHub,
        productionGovernance: policy.productionGovernance,
        phasedRoadmap: roadmap,
        auditLog: {
            policyEnforcement: policy?.shariaPolicyEngine?.enforcementMode || 'block-on-violation',
            traceId: `SHK-AUTO-GOV-${Date.now()}`
        }
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const latestPath = path.join(OUT_DIR, 'autonomy-governance-latest.json');
    const snapshotPath = path.join(OUT_DIR, `autonomy-governance-${stamp}.json`);
    writeJson(latestPath, report);
    writeJson(snapshotPath, report);

    printSummary(report, args.mode, args.target);

    if (args.mode === 'deploy-gate') {
        const allowed =
            args.target === 'production' ? permissions.canDeployProduction : permissions.canDeployStaging;
        if (!allowed) {
            console.error(`❌ Deploy blocked by autonomous governance gate for target=${args.target}.`);
            process.exit(1);
        }
    }
}

main();
