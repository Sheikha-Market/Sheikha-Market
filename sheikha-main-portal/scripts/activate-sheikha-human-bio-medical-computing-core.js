#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-human-bio-medical-computing-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-human-bio-medical-computing-core');
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

function buildHumanLifecycle(config) {
    return {
        generatedAt: nowIso(),
        lifecycle: config.humanLifecycle,
        coordinationMode: 'family-clinician-educator-supervised'
    };
}

function buildMedicalSciences(config) {
    return {
        generatedAt: nowIso(),
        medicalSciences: config.medicalSciences,
        bodySystems: config.bodySystems.systems,
        activationPolicy: 'assistive-not-autonomous'
    };
}

function buildBloodComputing(config) {
    return {
        generatedAt: nowIso(),
        bloodComputing: config.bloodComputing,
        safetyNote: 'All outputs remain clinician-reviewed and safety constrained.'
    };
}

function buildCellComputing(config) {
    return {
        generatedAt: nowIso(),
        cellularComputing: config.cellularComputing,
        mode: 'knowledge-support-and-modeling'
    };
}

function buildBehaviorEducation(config) {
    return {
        generatedAt: nowIso(),
        behaviorEducation: config.behaviorEducation,
        mission: 'support learning, character, and wellbeing without degrading human agency'
    };
}

function buildCrossScienceFusion(config) {
    return {
        generatedAt: nowIso(),
        fusion: config.crossScienceFusion,
        workflow: ['identify-need', 'map-ethics', 'integrate-sciences', 'review', 'deploy-safely']
    };
}

function buildGovernance(config) {
    return {
        generatedAt: nowIso(),
        foundation: config.foundation,
        privacyIpGovernance: config.privacyIpGovernance,
        reviewLayers: ['medical-review', 'ethics-review', 'privacy-review', 'sharia-review']
    };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'lifecycle'));
    ensureDir(path.join(OUT_DIR, 'medical'));
    ensureDir(path.join(OUT_DIR, 'blood'));
    ensureDir(path.join(OUT_DIR, 'cells'));
    ensureDir(path.join(OUT_DIR, 'behavior'));
    ensureDir(path.join(OUT_DIR, 'fusion'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        scope: {
            humanLifecycle: config.humanLifecycle,
            medicalSciences: config.medicalSciences,
            bodySystems: config.bodySystems,
            bloodComputing: config.bloodComputing,
            cellularComputing: config.cellularComputing,
            behaviorEducation: config.behaviorEducation,
            crossScienceFusion: config.crossScienceFusion
        },
        targets: config.targets
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'human-bio-medical-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'lifecycle', 'human-lifecycle-framework.json'), buildHumanLifecycle(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'medical', 'medical-sciences-map.json'), buildMedicalSciences(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'blood', 'blood-computing-framework.json'), buildBloodComputing(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'cells', 'cellular-computing-framework.json'), buildCellComputing(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'behavior', 'behavior-education-framework.json'), buildBehaviorEducation(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'fusion', 'cross-science-human-fusion.json'), buildCrossScienceFusion(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'human-dignity-governance.json'), buildGovernance(config)));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة حوسبة الإنسان والطب والعلوم السلوكية',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();