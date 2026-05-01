#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-network-fabric-core');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-network-fabric-core.json');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function writeJson(f, p) { fs.writeFileSync(f, JSON.stringify(p, null, 4) + '\n', 'utf8'); }
function readConfig() {
    if (!fs.existsSync(CONFIG_PATH)) { console.error('[network-fabric] config not found'); process.exit(1); }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}
function skip(f) { return !FORCE && fs.existsSync(f); }

function main() {
    const config = readConfig();
    const ts = new Date().toISOString();
    const artifacts = [];

    ['physical', 'quantum', 'neural', 'logical', 'subsecond', 'governance'].forEach((d) => ensureDir(path.join(CORE_DIR, d)));

    const specPath = path.join(CORE_DIR, 'network-fabric-core-spec.json');
    if (!skip(specPath)) writeJson(specPath, { core: config.core, title: config.title, version: config.version, activatedAt: ts, layers: Object.keys(config.networkLayers || {}).map((k) => ({ id: k, type: (config.networkLayers[k] || {}).type })) });
    artifacts.push({ file: specPath });

    const physPath = path.join(CORE_DIR, 'physical', 'physical-network-layer.json');
    if (!skip(physPath)) writeJson(physPath, { generatedAt: ts, layer: (config.networkLayers || {}).physicalLayer });
    artifacts.push({ file: physPath });

    const qPath = path.join(CORE_DIR, 'quantum', 'quantum-network-layer.json');
    if (!skip(qPath)) writeJson(qPath, { generatedAt: ts, layer: (config.networkLayers || {}).quantumLayer });
    artifacts.push({ file: qPath });

    const nPath = path.join(CORE_DIR, 'neural', 'neural-network-layer.json');
    if (!skip(nPath)) writeJson(nPath, { generatedAt: ts, layer: (config.networkLayers || {}).neuralLayer });
    artifacts.push({ file: nPath });

    const lPath = path.join(CORE_DIR, 'logical', 'logical-network-layer.json');
    if (!skip(lPath)) writeJson(lPath, { generatedAt: ts, layer: (config.networkLayers || {}).logicalLayer });
    artifacts.push({ file: lPath });

    const fabInt = config.networkFabricIntegration || {};
    const ssPath = path.join(CORE_DIR, 'subsecond', 'sub-second-engine.json');
    if (!skip(ssPath)) writeJson(ssPath, {
        generatedAt: ts,
        engine: config.subSecondProcessingEngine,
        allLayersIntegrated: true,
        layerPipeline: 'physical → quantum → neural → logical',
        routingStrategy: fabInt.routingStrategy,
        loadBalancing: fabInt.loadBalancing
    });
    artifacts.push({ file: ssPath });

    const govPath = path.join(CORE_DIR, 'governance', 'network-fabric-governance.json');
    if (!skip(govPath)) writeJson(govPath, {
        generatedAt: ts,
        policySource: 'quran-and-sunnah',
        shariaPolicies: config.governancePolicy,
        networkPhilosophy: config.networkPhilosophy,
        ownerApprovalRequired: true
    });

    console.log(JSON.stringify({
        success: true,
        message: 'تم تفعيل نواة الشبكات الشاملة (فيزيائية + كمية + عصبية + منطقية)',
        data: {
            core: config.core, activatedAt: ts, force: FORCE,
            layers: Object.keys(config.networkLayers || {}),
            subSecondEngine: !!(config.subSecondProcessingEngine),
            artifacts: [...artifacts, { file: govPath }].map((a) => path.relative(ROOT, a.file))
        },
        timestamp: ts
    }, null, 4));
}
main();
