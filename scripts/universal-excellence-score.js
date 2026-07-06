#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function num(v, name) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
        throw new Error(`Invalid score ${name} (must be 0..100)`);
    }
    return n;
}

function avg(list) {
    return list.reduce((a, b) => a + b, 0) / list.length;
}

function classify(score) {
    if (score >= 90) return 'excellent-integrated';
    if (score >= 80) return 'strong-ready-to-scale';
    if (score >= 70) return 'conditional-improvement-required';
    return 'redesign-required';
}

function load(fileArg) {
    const p = path.resolve(process.cwd(), fileArg);
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
    const input = process.argv[2];
    if (!input) {
        console.error('Usage: node scripts/universal-excellence-score.js <input.json>');
        process.exit(1);
    }

    const d = load(input);

    const H = avg([
        num(d.human?.decisionQuality, 'human.decisionQuality'),
        num(d.human?.responseEffectiveness, 'human.responseEffectiveness'),
        num(d.human?.learningContinuity, 'human.learningContinuity')
    ]);

    const P = avg([
        num(d.plant?.rootStability, 'plant.rootStability'),
        num(d.plant?.growthStability, 'plant.growthStability'),
        num(d.plant?.fruitImpact, 'plant.fruitImpact')
    ]);

    const I = avg([
        num(d.integration?.systemInteroperability, 'integration.systemInteroperability'),
        num(d.integration?.faultIsolation, 'integration.faultIsolation'),
        num(d.integration?.recoveryReadiness, 'integration.recoveryReadiness')
    ]);

    const V = avg([
        num(d.value?.governanceCompliance, 'value.governanceCompliance'),
        num(d.value?.benefitAlignment, 'value.benefitAlignment'),
        num(d.value?.harmPrevention, 'value.harmPrevention')
    ]);

    const universalScore = (0.30 * H) + (0.25 * P) + (0.25 * I) + (0.20 * V);

    const output = {
        domain: d.domain || 'unknown-domain',
        scores: {
            H: Number(H.toFixed(2)),
            P: Number(P.toFixed(2)),
            I: Number(I.toFixed(2)),
            V: Number(V.toFixed(2))
        },
        universalScore: Number(universalScore.toFixed(2)),
        status: classify(universalScore)
    };

    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main();
