#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-generative-rag-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-generative-rag-core');
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

function buildModelRouter(config) {
    return {
        generatedAt: nowIso(),
        router: config.modelOrchestration.router,
        generationModes: config.modelOrchestration.generationModes,
        qualityControls: config.modelOrchestration.qualityControls
    };
}

function buildRagPipeline(config) {
    return {
        generatedAt: nowIso(),
        pipeline: config.ragPipeline,
        operationMode: 'grounded-response-first'
    };
}

function buildKnowledgeSources(config) {
    return {
        generatedAt: nowIso(),
        sources: config.knowledgeSources,
        synchronization: ['scheduled-refresh', 'event-driven-refresh', 'human-validation-refresh']
    };
}

function buildIntegration(config) {
    return {
        generatedAt: nowIso(),
        integration: config.computingRagIntegration,
        sharedServices: ['identity-and-access', 'observability', 'policy-enforcement', 'audit-ledger']
    };
}

function buildSmartModelBlueprint(config) {
    return {
        generatedAt: nowIso(),
        smartModel: config.smartModelInnovation,
        deploymentPattern: 'staged-rollout-with-human-review-gates'
    };
}

function buildGovernance(config) {
    return {
        generatedAt: nowIso(),
        foundation: config.foundation,
        policyLayers: ['retrieval-policy', 'generation-policy', 'citation-policy', 'privacy-policy']
    };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'models'));
    ensureDir(path.join(OUT_DIR, 'rag'));
    ensureDir(path.join(OUT_DIR, 'knowledge'));
    ensureDir(path.join(OUT_DIR, 'integration'));
    ensureDir(path.join(OUT_DIR, 'innovation'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        scope: {
            modelOrchestration: config.modelOrchestration,
            ragPipeline: config.ragPipeline,
            knowledgeSources: config.knowledgeSources,
            computingRagIntegration: config.computingRagIntegration,
            smartModelInnovation: config.smartModelInnovation
        },
        targets: config.targets
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'generative-rag-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'models', 'model-router.json'), buildModelRouter(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'rag', 'rag-retrieval-pipeline.json'), buildRagPipeline(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'knowledge', 'knowledge-sources-map.json'), buildKnowledgeSources(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'integration', 'computing-rag-integration.json'), buildIntegration(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'innovation', 'smart-model-blueprint.json'), buildSmartModelBlueprint(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'generative-rag-governance.json'), buildGovernance(config)));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة الذكاء التوليدي وRAG والتكامل الذكي مع الحوسبة',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();