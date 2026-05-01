#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-main-artery.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-main-artery');

const force = process.argv.includes('--force');

function nowIso() {
    return new Date().toISOString();
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    if (fs.existsSync(filePath) && !force) {
        return { filePath, written: false, reason: 'exists' };
    }

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    return { filePath, written: true };
}

function buildDomainPlan(config) {
    return config.saasOperatingDomains.map((name, index) => ({
        domain: name,
        priority: index + 1,
        owner: 'sheikha-core-governance',
        status: 'activated-foundation',
        kpi: {
            availabilityTarget: config.cloudHyperscaleTargets.availabilityTarget,
            p95TargetMs: config.cloudHyperscaleTargets.apiP95Ms,
            p99TargetMs: config.cloudHyperscaleTargets.apiP99Ms
        }
    }));
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = readJson(CONFIG_PATH);
    ensureDir(OUT_DIR);

    const layersDir = path.join(OUT_DIR, 'layers');
    const governanceDir = path.join(OUT_DIR, 'governance');
    const cloudDir = path.join(OUT_DIR, 'cloud-saas');
    const rdDir = path.join(OUT_DIR, 'knowledge-rd');

    [layersDir, governanceDir, cloudDir, rdDir].forEach(ensureDir);

    const mainSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        islamicFoundation: config.islamicFoundation,
        globalGovernanceLayers: config.globalGovernanceLayers,
        cloudHyperscaleTargets: config.cloudHyperscaleTargets,
        saasOperatingDomains: buildDomainPlan(config)
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        languagePolicy: {
            primary: config.identity.primaryLanguage,
            locale: config.identity.defaultLocale,
            bilingualEngineeringMode: true
        },
        compliance: {
            source: config.islamicFoundation.sourceOfGovernance,
            mandatoryControls: config.islamicFoundation.mandatoryControls,
            reviewModel: config.islamicFoundation.reviewModel
        },
        operatingModel: {
            sovereignControlPlane: true,
            zeroTrustRequired: true,
            continuousAuditRequired: true
        }
    };

    const cloudSpec = {
        generatedAt: nowIso(),
        topology: config.cloudHyperscaleTargets.topology,
        availabilityTarget: config.cloudHyperscaleTargets.availabilityTarget,
        recovery: config.cloudHyperscaleTargets.disasterRecovery,
        security: config.cloudHyperscaleTargets.security,
        workloads: [
            'trade-economy-core',
            'global-data-fabric',
            'ai-inference-and-training',
            'knowledge-and-rd-pipelines'
        ]
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'main-artery-spec.json'), mainSpec));
    artifacts.push(writeJson(path.join(governanceDir, 'islamic-governance.json'), governanceSpec));
    artifacts.push(writeJson(path.join(cloudDir, 'hyperscale-cloud-saas-spec.json'), cloudSpec));

    const result = {
        success: true,
        message: 'تم تفعيل شيخة الشريان والعصب الرئيسي بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            globalLayers: config.globalGovernanceLayers,
            operatingDomains: config.saasOperatingDomains,
            artifacts
        },
        timestamp: nowIso()
    };

    console.log(JSON.stringify(result, null, 4));
}

main();
