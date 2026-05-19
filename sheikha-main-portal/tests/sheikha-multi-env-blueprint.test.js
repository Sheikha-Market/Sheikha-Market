'use strict';

const assert = require('assert');

const blueprint = require('../lib/sheikha-multi-env-blueprint');

function run() {
    const status = blueprint.getStatus();
    const repoBlueprint = blueprint.getBlueprint();
    const valid = blueprint.validateRequest({
        environment: 'staging',
        sector: 'energy',
        adapters: ['github', 'webhook']
    });
    const invalid = blueprint.validateRequest({
        environment: 'unknown-env',
        sector: 'energy'
    });

    assert.ok(status.identity.version, 'Missing identity version');
    assert.ok(Array.isArray(status.environments), 'environments should be array');
    assert.ok(status.environments.length >= 3, 'Expected configured environments');
    assert.ok(Array.isArray(repoBlueprint.services), 'services should be array');
    assert.ok(Array.isArray(repoBlueprint.sprints), 'sprints should be array');
    assert.ok(valid.ok, 'Expected valid environment payload');
    assert.ok(valid.readinessScore > 0, 'Expected positive readiness score');
    assert.ok(!invalid.ok, 'Expected invalid environment payload to fail');

    console.log('✅ sheikha-multi-env-blueprint.test.js passed');
}

run();
