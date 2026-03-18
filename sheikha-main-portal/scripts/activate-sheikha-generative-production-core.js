#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-generative-production-core');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-generative-production-core.json');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function writeJson(f, p) { fs.writeFileSync(f, JSON.stringify(p, null, 4) + '\n', 'utf8'); }
function readConfig() {
    if (!fs.existsSync(CONFIG_PATH)) { console.error('[generative-production] config not found'); process.exit(1); }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}
function skip(f) { return !FORCE && fs.existsSync(f); }

function main() {
    const config = readConfig();
    const ts = new Date().toISOString();
    const artifacts = [];

    ['pipeline', 'innovation', 'modes', 'integration', 'governance'].forEach((d) => ensureDir(path.join(CORE_DIR, d)));

    const specPath = path.join(CORE_DIR, 'generative-production-core-spec.json');
    if (!skip(specPath)) writeJson(specPath, { core: config.core, version: config.version, title: config.title, activatedAt: ts, philosophy: config.productionPhilosophy });
    artifacts.push({ file: specPath, written: !skip(specPath) || FORCE });

    const pipelinePath = path.join(CORE_DIR, 'pipeline', 'integrated-production-pipeline.json');
    if (!skip(pipelinePath)) writeJson(pipelinePath, { generatedAt: ts, pipeline: config.integratedPipeline });
    artifacts.push({ file: pipelinePath, written: !skip(pipelinePath) || FORCE });

    const modesPath = path.join(CORE_DIR, 'modes', 'generative-production-modes.json');
    if (!skip(modesPath)) writeJson(modesPath, { generatedAt: ts, modes: config.generativeProductionModes });
    artifacts.push({ file: modesPath, written: !skip(modesPath) || FORCE });

    const innovationPath = path.join(CORE_DIR, 'innovation', 'production-innovation-engine.json');
    if (!skip(innovationPath)) writeJson(innovationPath, { generatedAt: ts, engine: config.innovationEngine });
    artifacts.push({ file: innovationPath, written: !skip(innovationPath) || FORCE });

    const integrationPath = path.join(CORE_DIR, 'integration', 'training-simulation-production-integration.json');
    if (!skip(integrationPath)) writeJson(integrationPath, {
        generatedAt: ts,
        integrationFlow: 'training-core → simulation-testing-core → production-core',
        automatedPromotion: true,
        promotionGates: config.integratedPipeline.stages
            .filter((s) => s.promotionGate || s.regressionMinPassRate)
            .map((s) => ({ stage: s.id, gate: s.promotionGate || ('pass-rate >= ' + s.regressionMinPassRate) }))
    });
    artifacts.push({ file: integrationPath, written: !skip(integrationPath) || FORCE });

    const govPath = path.join(CORE_DIR, 'governance', 'generative-production-governance.json');
    if (!skip(govPath)) writeJson(govPath, {
        generatedAt: ts,
        policySource: 'quran-and-sunnah',
        philosophy: config.productionPhilosophy,
        ownerApprovalRequired: true,
        zeroToleranceViolations: ['riba', 'gharar', 'hallucination', 'sharia-violation']
    });
    artifacts.push({ file: govPath, written: !skip(govPath) || FORCE });

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة الإنتاج التوليدي المتكامل',
        data: { core: config.core, activatedAt: ts, force: FORCE, artifacts: artifacts.map((a) => ({ file: path.relative(ROOT, a.file), written: a.written })), writtenCount: artifacts.filter((a) => a.written).length },
        timestamp: ts
    }, null, 4));
}
main();
