#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-advanced-computing-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-advanced-computing-core');
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

function buildComputingFabric(config) {
    return {
        generatedAt: nowIso(),
        pillars: config.computingSystem.pillars,
        executionProfiles: config.computingSystem.executionProfiles,
        activationPolicy: 'progressive-rollout-with-health-gates'
    };
}

function buildQuantumStack(config) {
    return {
        generatedAt: nowIso(),
        tracks: config.quantumComputingSystem.tracks,
        environments: config.quantumComputingSystem.environments,
        controls: config.quantumComputingSystem.controls,
        note: 'Quantum workloads run under controlled research and compliance gates.'
    };
}

function buildPhysicalStack(config) {
    return {
        generatedAt: nowIso(),
        domains: config.physicalComputingSystem.domains,
        safetyLayers: config.physicalComputingSystem.safetyLayers,
        operationMode: 'defensive-and-safety-first'
    };
}

function buildNeuralNetworkStack(config) {
    return {
        generatedAt: nowIso(),
        capabilities: config.neuralNetworkSystem.capabilities,
        modelClasses: config.neuralNetworkSystem.modelClasses,
        guardrails: config.neuralNetworkSystem.guardrails,
        lifecycle: ['data', 'train', 'evaluate', 'deploy', 'monitor', 'retrain']
    };
}

function buildBranchCatalog(config) {
    return {
        generatedAt: nowIso(),
        taxonomy: config.branchTaxonomy,
        allBranches: config.computingSystem.branches,
        note: 'Comprehensive branch map for classical, AI, quantum, physical, and security computing.'
    };
}

function buildPrecisionBranches(config) {
    return {
        generatedAt: nowIso(),
        precisionBranches: config.precisionBranches,
        branchingModel: {
            vertical: 'deep-specialized-domain-branches',
            horizontal: 'cross-cutting-system-fabrics',
            novel: 'newly-innovated-branches'
        }
    };
}

function buildScienceFusion(config) {
    return {
        generatedAt: nowIso(),
        matrix: config.scienceFusionMatrix,
        orchestration: {
            commandAndControl: 'policy-controlled-fusion-pipelines',
            dataInterchange: 'schema-governed-data-contracts',
            observability: 'cross-domain-risk-and-performance-signals'
        }
    };
}

function buildShariaDigitization(config) {
    return {
        generatedAt: nowIso(),
        framework: config.quranSunnahDigitizationFramework,
        implementationTracks: [
            'quran-sunnah-evidence-linking',
            'maqasid-aware-engineering-controls',
            'usul-rule-traceability-automation',
            'scholarly-approval-workflows'
        ]
    };
}

function buildBranchAutogenesis(config) {
    return {
        generatedAt: nowIso(),
        system: config.branchAutogenesisSystem,
        recommendedPipelines: [
            {
                pipeline: 'islamic-sciences-fusion',
                sourceBranches: ['computing-for-usul-and-governance', 'knowledge-graph-and-reasoning-fabric'],
                targetOutcome: 'new-computational-islamic-subdisciplines'
            },
            {
                pipeline: 'human-medical-fusion',
                sourceBranches: ['federated-neural-learning', 'computing-for-earth-systems'],
                targetOutcome: 'privacy-preserving-human-health-branches'
            },
            {
                pipeline: 'space-logistics-fusion',
                sourceBranches: ['computing-for-space-systems', 'computing-for-logistics-systems'],
                targetOutcome: 'orbital-and-remote-supply-optimization-branches'
            }
        ]
    };
}

function buildIntegrationLinks(config) {
    return {
        generatedAt: nowIso(),
        links: config.integrationMatrix,
        orchestrationPattern: 'event-driven-and-policy-controlled',
        sharedServices: [
            'identity-and-access',
            'workload-scheduler',
            'observability',
            'governance-gates'
        ]
    };
}

function buildGovernance(config) {
    return {
        generatedAt: nowIso(),
        foundation: config.foundation,
        prohibitedUse: {
            offensiveCyberUse: config.foundation.policy.offensiveCyberUse,
            autonomousWeapons: config.foundation.policy.autonomousWeapons,
            unsafeBioComputeWorkloads: config.foundation.policy.unsafeBioComputeWorkloads
        },
        reviewLayers: ['technical-review', 'safety-review', 'compliance-review', 'sharia-review']
    };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'computing'));
    ensureDir(path.join(OUT_DIR, 'quantum'));
    ensureDir(path.join(OUT_DIR, 'physical'));
    ensureDir(path.join(OUT_DIR, 'neural'));
    ensureDir(path.join(OUT_DIR, 'branches'));
    ensureDir(path.join(OUT_DIR, 'integration'));
    ensureDir(path.join(OUT_DIR, 'governance'));
    ensureDir(path.join(OUT_DIR, 'fusion'));
    ensureDir(path.join(OUT_DIR, 'sharia'));
    ensureDir(path.join(OUT_DIR, 'autogenesis'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        scope: {
            computingSystem: config.computingSystem,
            quantumComputingSystem: config.quantumComputingSystem,
            physicalComputingSystem: config.physicalComputingSystem,
            neuralNetworkSystem: config.neuralNetworkSystem,
            precisionBranches: config.precisionBranches,
            scienceFusionMatrix: config.scienceFusionMatrix,
            quranSunnahDigitizationFramework: config.quranSunnahDigitizationFramework,
            branchAutogenesisSystem: config.branchAutogenesisSystem
        },
        targets: config.targets
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'advanced-computing-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'computing', 'computing-fabric.json'), buildComputingFabric(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'quantum', 'quantum-computing-stack.json'), buildQuantumStack(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'physical', 'physical-computing-stack.json'), buildPhysicalStack(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'neural', 'neural-network-stack.json'), buildNeuralNetworkStack(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'branches', 'computing-branches-catalog.json'), buildBranchCatalog(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'branches', 'precision-vertical-horizontal-branches.json'), buildPrecisionBranches(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'integration', 'cross-computing-integration-links.json'), buildIntegrationLinks(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'fusion', 'science-fusion-matrix.json'), buildScienceFusion(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'sharia', 'quran-sunnah-digitization-framework.json'), buildShariaDigitization(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'autogenesis', 'branch-autogenesis-system.json'), buildBranchAutogenesis(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'advanced-computing-governance.json'), buildGovernance(config)));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل منظومة الحوسبة المتقدمة (العامة + الكمية + الفيزيائية + الشبكات العصبية)',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
