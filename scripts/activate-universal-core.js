#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const steps = [
    { name: 'root-seed-core', cmd: ['run', '-s', 'ops:root-seed:activate'] },
    { name: 'foundation-governance', cmd: ['run', '-s', 'ops:foundation:activate'] },
    { name: 'hyperscale', cmd: ['run', '-s', 'ops:hyperscale:activate'] },
    { name: 'main-artery', cmd: ['run', '-s', 'ops:main-artery:activate'] },
    { name: 'cosmic-heart', cmd: ['run', '-s', 'ops:cosmic-heart:activate'] },
    { name: 'global-brain', cmd: ['run', '-s', 'ops:global-brain:activate'] },
    { name: 'muslima-forelock-core', cmd: ['run', '-s', 'ops:muslima-core:activate'] },
    { name: 'mudgha-core', cmd: ['run', '-s', 'ops:mudgha-core:activate'] },
    { name: 'vein-core', cmd: ['run', '-s', 'ops:vein-core:activate'] },
    { name: 'habl-alwarid-core', cmd: ['run', '-s', 'ops:habl-core:activate'] },
    { name: 'deen-completion-core', cmd: ['run', '-s', 'ops:deen-core:activate'] },
    { name: 'data-fabric-core', cmd: ['run', '-s', 'ops:data-fabric:activate'] },
    { name: 'strategic-partnerships-core', cmd: ['run', '-s', 'ops:partnerships-core:activate'] },
    { name: 'ecosystem-segmentation-core', cmd: ['run', '-s', 'ops:ecosystem-segmentation:activate'] },
    { name: 'global-compute-halal-core', cmd: ['run', '-s', 'ops:global-compute-halal:activate'] },
    { name: 'advanced-computing-core', cmd: ['run', '-s', 'ops:advanced-computing:activate'] },
    { name: 'generative-rag-core', cmd: ['run', '-s', 'ops:generative-rag:activate'] },
    { name: 'human-bio-medical-computing-core', cmd: ['run', '-s', 'ops:human-bio-medical:activate'] },
    { name: 'islamic-digital-library-core', cmd: ['run', '-s', 'ops:islamic-library:activate'] },
    { name: 'quranic-science-integration-core', cmd: ['run', '-s', 'ops:quranic-science:activate'] },
    { name: 'islamic-ecosystem-alignment-core', cmd: ['run', '-s', 'ops:islamic-ecosystem:activate'] },
    { name: 'consent-communication-governance-core', cmd: ['run', '-s', 'ops:consent-communication:activate'] },
    { name: 'training-core', cmd: ['run', '-s', 'ops:training:activate'] },
    { name: 'simulation-testing-core', cmd: ['run', '-s', 'ops:simulation:activate'] },
    { name: 'production-core', cmd: ['run', '-s', 'ops:production:activate'] },
    { name: 'generative-production-core', cmd: ['run', '-s', 'ops:generative-production:activate'] },
    { name: 'network-fabric-core', cmd: ['run', '-s', 'ops:network-fabric:activate'] },
    { name: 'neural-production-engine', cmd: ['run', '-s', 'ops:neural-engine:activate'] },
    { name: 'open-markets-core', cmd: ['run', '-s', 'ops:open-markets:activate'] },
    { name: 'universal-core-map', cmd: ['run', '-s', 'ops:universal-core:map'] }
];

function runStep(step) {
    const result = spawnSync('npm', step.cmd, { encoding: 'utf8' });
    const success = result.status === 0;

    return {
        step: step.name,
        success,
        code: result.status,
        stdout: (result.stdout || '').trim(),
        stderr: (result.stderr || '').trim()
    };
}

function main() {
    const startedAt = new Date().toISOString();
    const results = steps.map(runStep);
    const failed = results.filter((r) => !r.success);

    const response = {
        success: failed.length === 0,
        message: failed.length === 0
            ? 'تم تفعيل النواة الشاملة لشيخة بنجاح'
            : 'فشل جزء من تفعيل النواة الشاملة',
        data: {
            startedAt,
            finishedAt: new Date().toISOString(),
            steps: results.map((r) => ({
                step: r.step,
                success: r.success,
                code: r.code
            }))
        },
        timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(response, null, 4));

    if (failed.length > 0) {
        failed.forEach((f) => {
            if (f.stderr) {
                console.error('\n[' + f.step + '] stderr:\n' + f.stderr);
            }
        });
        process.exit(1);
    }
}

main();
