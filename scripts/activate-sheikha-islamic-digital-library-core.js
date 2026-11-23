#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-islamic-digital-library-core.json');
const OUT_DIR = path.join(ROOT, 'infrastructure', 'sheikha-islamic-digital-library-core');
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

function buildQuranManifest(config) {
    return {
        generatedAt: nowIso(),
        indexing: config.quranIndexing.include,
        assets: config.quranIndexing.digitalAssets,
        corpusPolicy: {
            includeFullTextDirectly: false,
            reason: 'The platform stores lawful indexing and source manifests; ingestion of text depends on verified source rights and approved editions.'
        },
        structure: {
            surahCount: 114,
            juzCount: 30,
            hizbCount: 60
        }
    };
}

function buildTafsirManifest(config) {
    return {
        generatedAt: nowIso(),
        catalogedWorks: config.tafsirCatalog.works,
        indexingModes: config.tafsirCatalog.indexingModes,
        accessPolicy: 'licensed-or-public-domain-or-owner-authorized-only'
    };
}

function buildSciencesTaxonomy(config) {
    return {
        generatedAt: nowIso(),
        manhaj: config.identity.manhaj,
        sciences: config.shariaSciences.map((science, index) => ({
            id: index + 1,
            key: science,
            status: 'indexed'
        })),
        collections: config.knowledgeCollections
    };
}

function buildDigitizationFramework(config) {
    return {
        generatedAt: nowIso(),
        tracks: config.digitizationProgram.tracks,
        workflow: config.digitizationProgram.workflow.map((step, index) => ({
            id: index + 1,
            step,
            status: 'enabled'
        })),
        allowedRights: config.digitizationProgram.allowedRights,
        prohibited: [
            'unauthorized-copying',
            'misattribution',
            'unverified-religious-content-publication'
        ]
    };
}

function buildComputationalIslamicSciences(config) {
    return {
        generatedAt: nowIso(),
        tracks: config.computationalIslamicSciences.tracks,
        deliveryModes: config.computationalIslamicSciences.deliveryModes,
        activationPolicy: 'scholarly-supervised-and-rights-aware'
    };
}

function buildMethodizationFusion(config) {
    return {
        generatedAt: nowIso(),
        matrix: config.methodizationFusionMatrix,
        workflow: [
            'define-domain-goal',
            'map-quran-sunnah-evidence',
            'model-rules-and-ethics',
            'review-by-specialists',
            'release-under-governance'
        ]
    };
}

function buildPrivacyAndRights(config) {
    return {
        generatedAt: nowIso(),
        governance: config.privacyAndRightsGovernance,
        defaultMode: 'private-and-reviewed',
        assetClasses: ['public', 'licensed', 'private-manuscript', 'scholarly-draft']
    };
}

function buildGovernance(config) {
    return {
        generatedAt: nowIso(),
        foundation: config.foundation,
        reviewLayers: ['metadata-review', 'scholarly-review', 'rights-review', 'privacy-review'],
        publishingPolicy: 'human-in-the-loop',
        doctrinalScope: config.identity.manhaj
    };
}

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ missing config:', CONFIG_PATH);
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    ensureDir(OUT_DIR);
    ensureDir(path.join(OUT_DIR, 'taxonomy'));
    ensureDir(path.join(OUT_DIR, 'quran'));
    ensureDir(path.join(OUT_DIR, 'tafsir'));
    ensureDir(path.join(OUT_DIR, 'digitization'));
    ensureDir(path.join(OUT_DIR, 'computing'));
    ensureDir(path.join(OUT_DIR, 'fusion'));
    ensureDir(path.join(OUT_DIR, 'rights'));
    ensureDir(path.join(OUT_DIR, 'governance'));

    const coreSpec = {
        generatedAt: nowIso(),
        program: config.program,
        identity: config.identity,
        foundation: config.foundation,
        targets: config.targets
    };

    const artifacts = [];
    artifacts.push(writeJson(path.join(OUT_DIR, 'islamic-digital-library-core-spec.json'), coreSpec));
    artifacts.push(writeJson(path.join(OUT_DIR, 'taxonomy', 'sharia-sciences-taxonomy.json'), buildSciencesTaxonomy(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'quran', 'quran-corpus-manifest.json'), buildQuranManifest(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'tafsir', 'tafsir-catalog-manifest.json'), buildTafsirManifest(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'digitization', 'digitization-framework.json'), buildDigitizationFramework(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'computing', 'computational-islamic-sciences.json'), buildComputationalIslamicSciences(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'fusion', 'methodization-fusion-matrix.json'), buildMethodizationFusion(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'rights', 'privacy-and-rights-governance.json'), buildPrivacyAndRights(config)));
    artifacts.push(writeJson(path.join(OUT_DIR, 'governance', 'scholarly-governance.json'), buildGovernance(config)));

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة المكتبة الإسلامية الرقمية والرقمنة الشرعية',
        data: {
            outputDirectory: OUT_DIR,
            force,
            artifacts
        },
        timestamp: nowIso()
    }, null, 4));
}

main();
