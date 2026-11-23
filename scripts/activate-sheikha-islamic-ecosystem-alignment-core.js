#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-islamic-ecosystem-alignment-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-islamic-ecosystem-alignment-core');
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

function buildTemplateMap(config, group) {
    return config.entityGoalTemplates[group] || [];
}

function buildEntityCatalog(config) {
    return {
        generatedAt: nowIso(),
        classificationAxes: config.classificationAxes,
        engagementChannels: config.engagementChannels,
        governanceGuardrails: config.governanceGuardrails,
        entityProfiles: config.entityProfiles,
        entities: config.entityGroups.map((group, index) => ({
            id: index + 1,
            group,
            defaultGoals: buildTemplateMap(config, group),
            analysisDimensions: config.analysisDimensions,
            engagementChannels: config.engagementChannels.slice(0, 3),
            defaultStatus: 'ready-for-analysis'
        }))
    };
}

function buildGoalAnalysis(config) {
    return {
        generatedAt: nowIso(),
        templates: config.entityGoalTemplates,
        dimensions: config.analysisDimensions,
        classificationAxes: config.classificationAxes,
        sectorOverlays: config.sectorOverlays,
        note: 'This is a structured analysis framework. Real per-organization analysis requires source data, public reports, or manually curated records.'
    };
}

function buildSharedGoalsMatrix(config) {
    return {
        generatedAt: nowIso(),
        coreGoals: config.sharedGoalsFramework.coreGoals,
        optimizationPrinciples: config.sharedGoalsFramework.optimizationPrinciples,
        collaborationTracks: config.collaborationTracks,
        matrix: config.entityGroups.map((group, index) => ({
            id: index + 1,
            entityGroup: group,
            sharedGoals: config.sharedGoalsFramework.coreGoals,
            recommendedTracks: config.collaborationTracks.slice(0, 4),
            recommendedGoalTemplate: buildTemplateMap(config, group),
            allowedChannels: config.engagementChannels
        }))
    };
}

function buildImprovementFramework(config) {
    return {
        generatedAt: nowIso(),
        deliverables: config.deliverables,
        outreachChannels: config.engagementChannels,
        governanceGuardrails: config.governanceGuardrails,
        improvementLevers: [
            'clearer-governance-charters',
            'better-program-measurement',
            'sharia-audit-routines',
            'digital-service-enablement',
            'cross-entity-coordination',
            'beneficiary-feedback-loops',
            'lawful-cross-border-onboarding',
            'partner-data-quality-controls'
        ],
        targets: config.targets
    };
}

function buildGovernance(config) {
    return {
        generatedAt: nowIso(),
        foundation: config.foundation,
        doctrinalScope: config.identity.manhaj,
        policy: 'human-in-the-loop',
        engagementChannels: config.engagementChannels,
        guardrails: config.governanceGuardrails,
        reviewLayers: ['manhaj-review', 'impact-review', 'governance-review', 'lawful-engagement-review']
    };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'entities'));
    ensureDir(path.join(OUT_DIR, 'analysis'));
    ensureDir(path.join(OUT_DIR, 'shared-goals'));
    ensureDir(path.join(OUT_DIR, 'improvement'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        classificationAxes: config.classificationAxes,
        engagementChannels: config.engagementChannels,
        governanceGuardrails: config.governanceGuardrails,
        targets: config.targets,
        deliverables: config.deliverables
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'islamic-ecosystem-alignment-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'entities', 'entity-catalog.json'), buildEntityCatalog(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'analysis', 'goal-analysis-framework.json'), buildGoalAnalysis(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'shared-goals', 'shared-goals-matrix.json'), buildSharedGoalsMatrix(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'improvement', 'improvement-framework.json'), buildImprovementFramework(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'ecosystem-alignment-governance.json'), buildGovernance(config)));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة مواءمة الجهات الإسلامية والأهداف المشتركة',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
