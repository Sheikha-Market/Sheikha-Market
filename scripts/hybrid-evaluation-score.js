#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function toNumber(value, fieldName) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        throw new Error(`Invalid number for ${fieldName}: ${value}`);
    }
    return n;
}

function average(list) {
    if (!Array.isArray(list) || list.length === 0) {
        return 0;
    }
    return list.reduce((sum, n) => sum + n, 0) / list.length;
}

function loadInput(filePath) {
    const absolute = path.resolve(process.cwd(), filePath);
    const raw = fs.readFileSync(absolute, 'utf8');
    return JSON.parse(raw);
}

function readScores(payload) {
    const human = payload.human || {};
    const plant = payload.plant || {};
    const hybrid = payload.hybrid || {};

    const h = average([
        toNumber(human.decisionAccuracy ?? 0, 'human.decisionAccuracy'),
        toNumber(human.responseScore ?? 0, 'human.responseScore'),
        toNumber(human.logicScore ?? 0, 'human.logicScore')
    ]);

    const p = average([
        toNumber(plant.rootDepth ?? 0, 'plant.rootDepth'),
        toNumber(plant.nutritionQuality ?? 0, 'plant.nutritionQuality'),
        toNumber(plant.growthStability ?? 0, 'plant.growthStability'),
        toNumber(plant.fruitValue ?? 0, 'plant.fruitValue')
    ]);

    const x = average([
        toNumber(hybrid.scaleResilience ?? 0, 'hybrid.scaleResilience'),
        toNumber(hybrid.faultRecovery ?? 0, 'hybrid.faultRecovery'),
        toNumber(hybrid.valueAlignment ?? 0, 'hybrid.valueAlignment')
    ]);

    const finalScore = (0.35 * h) + (0.35 * p) + (0.30 * x);

    let status = 'rejected';
    if (finalScore >= 85) {
        status = 'ready';
    } else if (finalScore >= 70) {
        status = 'conditional';
    }

    return {
        service: payload.service || 'unknown-service',
        humanScore: Number(h.toFixed(2)),
        plantScore: Number(p.toFixed(2)),
        hybridScore: Number(x.toFixed(2)),
        finalScore: Number(finalScore.toFixed(2)),
        status
    };
}

function main() {
    const fileArg = process.argv[2];
    if (!fileArg) {
        console.error('Usage: node scripts/hybrid-evaluation-score.js <input.json>');
        process.exit(1);
    }

    const payload = loadInput(fileArg);
    const result = readScores(payload);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
