#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-ecosystem-segmentation-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-ecosystem-segmentation-core');
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

function buildCommunities(config) {
    const communities = [];
    let id = 1;

    config.sectorTaxonomy.forEach((sector) => {
        config.markets.forEach((market) => {
            communities.push({
                id: id++,
                key: sector + '__' + market,
                sector,
                market,
                entityTypes: config.entityTypes,
                communityTypes: config.clusteringPolicy.communityTypes,
                status: 'activated'
            });
        });
    });

    return communities;
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'taxonomy'));
    ensureDir(path.join(OUT_DIR, 'clusters'));
    ensureDir(path.join(OUT_DIR, 'contracts'));
    ensureDir(path.join(OUT_DIR, 'automation'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        markets: config.markets,
        entityTypes: config.entityTypes,
        sectorTaxonomy: config.sectorTaxonomy,
        classificationMetrics: config.classificationMetrics,
        clusteringPolicy: config.clusteringPolicy,
        digitalContracting: config.digitalContracting,
        targets: config.targets
    };

    const taxonomySpec = {
        generatedAt: nowIso(),
        markets: config.markets,
        entityTypes: config.entityTypes,
        sectors: config.sectorTaxonomy,
        metrics: config.classificationMetrics
    };

    const clustersSpec = {
        generatedAt: nowIso(),
        strategy: config.clusteringPolicy.strategy,
        communities: buildCommunities(config)
    };

    const contractsSpec = {
        generatedAt: nowIso(),
        documentTypes: config.digitalContracting.documentTypes,
        deliveryChannels: config.digitalContracting.deliveryChannels,
        templates: config.digitalContracting.documentTypes.map((docType, index) => ({
            id: index + 1,
            docType,
            status: 'ready',
            requiresShariaReview: true,
            requiresDigitalSignature: true
        }))
    };

    const automationSpec = {
        generatedAt: nowIso(),
        workflow: config.digitalContracting.workflow.map((step, index) => ({
            id: index + 1,
            step,
            status: 'enabled'
        })),
        integrationModes: ['manual-review', 'semi-automated', 'fully-automated-with-approval']
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        sources: config.foundation.sources,
        controls: config.foundation.controls,
        values: config.foundation.values,
        policy: 'human-in-the-loop'
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'ecosystem-segmentation-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'taxonomy', 'sector-taxonomy.json'), taxonomySpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'clusters', 'specialist-communities.json'), clustersSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'contracts', 'electronic-contracting-framework.json'), contractsSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'automation', 'digital-integration-workflow.json'), automationSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'ecosystem-governance.json'), governanceSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل منظومة التقسيم والتجمعات والعقود الرقمية بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
