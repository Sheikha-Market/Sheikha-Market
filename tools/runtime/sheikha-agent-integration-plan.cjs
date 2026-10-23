'use strict';

const { parseArgs } = require('node:util');
const { buildIntegrationPlan } = require('../../runtime/sheikha-infinite-agent/v1/sheikha-agent-integration-plan');

try {
  const { values } = parseArgs({ options: {
    scenario: { type: 'string' }, 'hs-code': { type: 'string' }, branching: { type: 'string' }
  }, strict: true, allowPositionals: false });
  const input = {};
  if (values.scenario !== undefined) input.scenario = values.scenario;
  if (values['hs-code'] !== undefined) input.hsCode = values['hs-code'];
  if (values.branching !== undefined) {
    if (values.branching.length > 512 || !/^[0-9]+(?:,[0-9]+)*$/.test(values.branching)) {
      throw Object.assign(new Error('INVALID_BRANCHING'), { code: 'INVALID_BRANCHING' });
    }
    input.branching = values.branching.split(',').map(Number);
  }
  const plan = buildIntegrationPlan(input);
  process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
  process.exitCode = plan.hierarchy.fitsLocalDescriptorLimits ? 0 : 1;
} catch (error) {
  const allowed = ['INVALID_BRANCHING', 'INVALID_HS_CODE_FORMAT', 'UNKNOWN_SYNTHETIC_SCENARIO'];
  process.stderr.write(JSON.stringify({ success: false, error: allowed.includes(error.code) ? error.code : 'INVALID_PLAN_ARGUMENTS' }) + '\n');
  process.exitCode = 2;
}
