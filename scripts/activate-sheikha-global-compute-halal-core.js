#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-global-compute-halal-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-global-compute-halal-core');
const force = process.argv.includes('--force');

function nowIso() {
    return new Date().toISOString();
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJson(filePath, payload) {
    if (fs.existsSync(filePath) && !force) {
        return { filePath, written: false, reason: 'exists' };
    }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    return { filePath, written: true };
}

function buildGlobalCatalog(config) {
    return {
        generatedAt: nowIso(),
        supercomputers: config.globalCompute.categories,
        dataCenters: config.dataCenters.scope,
        cloudTiers: config.cloudAndServers.cloudTiers,
        serverProfiles: config.cloudAndServers.serverProfiles,
        note: 'Global catalog is policy-driven and requires legal and technical onboarding before live integration.'
    };
}

function buildIntegrationBlueprint(config) {
    return {
        generatedAt: nowIso(),
        activationFlow: config.cloudAndServers.activationFlow,
        integrationModes: config.globalCompute.integrationModes,
        guardrails: config.foundation.controls,
        requirements: config.dataCenters.requirements,
        policy: config.foundation.policy
    };
}

function buildContractingFramework(config) {
    return {
        generatedAt: nowIso(),
        documents: config.digitalContracts.documents,
        channels: config.digitalContracts.channels,
        signing: config.digitalContracts.signing,
        workflow: [
            'prefilter-and-screening',
            'draft-and-review',
            'sharia-gate',
            'dual-approval',
            'electronic-signature',
            'audit-archive'
        ]
    };
}

function buildGovernanceSpec(config) {
    return {
        generatedAt: nowIso(),
        foundation: config.foundation,
        effectiveCompanies: config.effectiveCompanies,
        controls: {
            prohibitedActivities: [
                'riba-based-financing',
                'fraudulent-operations',
                'harmful-or-illegal-workloads'
            ],
            escalation: ['compliance-team', 'sharia-team', 'risk-team']
        }
    };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'catalog'));
    ensureDir(path.join(OUT_DIR, 'integration'));
    ensureDir(path.join(OUT_DIR, 'contracts'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        targets: config.targets,
        scope: {
            globalCompute: config.globalCompute,
            dataCenters: config.dataCenters,
            cloudAndServers: config.cloudAndServers
        }
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'global-compute-halal-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'catalog', 'global-compute-catalog.json'), buildGlobalCatalog(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'integration', 'integration-blueprint.json'), buildIntegrationBlueprint(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'contracts', 'digital-contracting-pack.json'), buildContractingFramework(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'halal-governance-controls.json'), buildGovernanceSpec(config)));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة التكامل العالمي للحوسبة الضخمة ومراكز البيانات وفق ضوابط حلال',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
