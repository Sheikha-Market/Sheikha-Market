#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-production-core');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-production-core.json');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJson(filePath, payload) {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function readConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('[production-core] config not found: ' + CONFIG_PATH);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function shouldSkip(filePath) {
    return !FORCE && fs.existsSync(filePath);
}

function main() {
    const config = readConfig();
    const ts = new Date().toISOString();
    const artifacts = [];

    const subdirs = ['deployment', 'monitoring', 'load-balancing', 'scaling', 'ci-cd', 'governance'];
    subdirs.forEach((d) => ensureDir(path.join(CORE_DIR, d)));

    // 1 — مواصفة نواة الإنتاج
    const specPath = path.join(CORE_DIR, 'production-core-spec.json');
    if (!shouldSkip(specPath)) {
        writeJson(specPath, {
            core: config.core,
            version: config.version,
            title: config.title,
            description: config.description,
            activatedAt: ts,
            governancePolicy: config.governancePolicy,
            productionReadiness: config.productionReadiness
        });
    }
    artifacts.push({ file: specPath, written: !shouldSkip(specPath) || FORCE });

    // 2 — خطة النشر
    const deployPath = path.join(CORE_DIR, 'deployment', 'deployment-blueprint.json');
    if (!shouldSkip(deployPath)) {
        writeJson(deployPath, {
            generatedAt: ts,
            blueprint: config.deploymentBlueprint,
            currentEnvironment: 'production',
            activeVersion: null,
            lastDeployedAt: null,
            rollbackVersion: null
        });
    }
    artifacts.push({ file: deployPath, written: !shouldSkip(deployPath) || FORCE });

    // 3 — سياسة المراقبة والصحة
    const monPath = path.join(CORE_DIR, 'monitoring', 'health-monitoring-policy.json');
    if (!shouldSkip(monPath)) {
        writeJson(monPath, {
            generatedAt: ts,
            monitoring: config.healthMonitoring,
            currentStatus: 'initializing',
            lastHealthCheckAt: null,
            incidents: []
        });
    }
    artifacts.push({ file: monPath, written: !shouldSkip(monPath) || FORCE });

    // 4 — مواصفة موازنة الحمل
    const lbPath = path.join(CORE_DIR, 'load-balancing', 'load-balancing-spec.json');
    if (!shouldSkip(lbPath)) {
        writeJson(lbPath, {
            generatedAt: ts,
            strategy: config.autoScaling.halalLoadBalancing.strategy,
            fairDistribution: config.autoScaling.halalLoadBalancing.fairDistribution,
            healthGating: config.autoScaling.halalLoadBalancing.healthGating,
            description: 'توزيع الحمل عادل وحلال — لا احتكار ولا تفضيل غير مبرر'
        });
    }
    artifacts.push({ file: lbPath, written: !shouldSkip(lbPath) || FORCE });

    // 5 — إطار التوسع التلقائي
    const scalePath = path.join(CORE_DIR, 'scaling', 'auto-scaling-framework.json');
    if (!shouldSkip(scalePath)) {
        writeJson(scalePath, {
            generatedAt: ts,
            autoScaling: config.autoScaling,
            disasterRecovery: config.disasterRecovery
        });
    }
    artifacts.push({ file: scalePath, written: !shouldSkip(scalePath) || FORCE });

    // 6 — حوكمة الإنتاج
    const govPath = path.join(CORE_DIR, 'governance', 'production-governance.json');
    if (!shouldSkip(govPath)) {
        writeJson(govPath, {
            generatedAt: ts,
            policySource: 'quran-and-sunnah',
            governance: config.productionGovernance,
            ciCdPipeline: config.continuousIntegration,
            zeroToleranceViolations: config.productionGovernance.zeroToleranceViolations,
            ownerApprovalRequired: config.productionGovernance.ownerApprovalRequired
        });
    }
    artifacts.push({ file: govPath, written: !shouldSkip(govPath) || FORCE });

    const writtenCount = artifacts.filter((a) => a.written).length;

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة الإنتاج لشيخة',
        data: {
            core: 'sheikha-production-core',
            activatedAt: ts,
            force: FORCE,
            artifacts: artifacts.map((a) => ({
                file: path.relative(ROOT, a.file),
                written: a.written
            })),
            writtenCount
        },
        timestamp: ts
    }, null, 4));
}

main();
