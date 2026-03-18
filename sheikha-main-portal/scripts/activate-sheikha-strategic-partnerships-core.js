#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-strategic-partnerships-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-strategic-partnerships-core');
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

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'bands'));
    ensureDir(path.join(OUT_DIR, 'ecosystem'));
    ensureDir(path.join(OUT_DIR, 'metrics'));
    ensureDir(path.join(OUT_DIR, 'governance'));
    ensureDir(path.join(OUT_DIR, 'academia'));
    ensureDir(path.join(OUT_DIR, 'research'));
    ensureDir(path.join(OUT_DIR, 'training'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        partnerBands: config.partnerBands,
        ecosystemDomains: config.ecosystemDomains,
        collaborationTracks: config.collaborationTracks || [],
        targetInstitutions: config.targetInstitutions || {},
        evaluationMetrics: config.evaluationMetrics,
        targets: config.targets
    };

    const bandsSpec = {
        generatedAt: nowIso(),
        bands: Object.entries(config.partnerBands).map(([key, value], index) => ({
            id: index + 1,
            key,
            ...value,
            status: 'activated'
        }))
    };

    const ecosystemSpec = {
        generatedAt: nowIso(),
        domains: config.ecosystemDomains.map((domain, index) => ({
            id: index + 1,
            domain,
            status: 'activated'
        }))
    };

    const metricsSpec = {
        generatedAt: nowIso(),
        metrics: config.evaluationMetrics.map((metric, index) => ({
            id: index + 1,
            metric,
            status: 'enabled'
        }))
    };

    const governanceSpec = {
        generatedAt: nowIso(),
        sources: config.foundation.sources,
        controls: config.foundation.controls,
        values: config.foundation.values,
        policy: 'human-in-the-loop'
    };

    const academiaSpec = {
        generatedAt: nowIso(),
        localUniversities: (config.targetInstitutions && config.targetInstitutions.localUniversities) || [],
        globalUniversities: (config.targetInstitutions && config.targetInstitutions.globalUniversities) || []
    };

    const researchSpec = {
        generatedAt: nowIso(),
        researchCenters: (config.targetInstitutions && config.targetInstitutions.researchCenters) || [],
        collaborationTracks: config.collaborationTracks || []
    };

    const trainingSpec = {
        generatedAt: nowIso(),
        tracks: config.collaborationTracks || [],
        qualityMetrics: [
            'learning-outcomes',
            'skills-development',
            'knowledge-transfer',
            'innovation-readiness'
        ]
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'strategic-partnerships-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'bands', 'partner-bands.json'), bandsSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'ecosystem', 'ecosystem-domains.json'), ecosystemSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'metrics', 'evaluation-metrics.json'), metricsSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'partnership-governance.json'), governanceSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'academia', 'target-universities.json'), academiaSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'research', 'target-research-centers.json'), researchSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'training', 'training-development-framework.json'), trainingSpec));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل منظومة الشركات والتعاون الاستراتيجي بنجاح',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
