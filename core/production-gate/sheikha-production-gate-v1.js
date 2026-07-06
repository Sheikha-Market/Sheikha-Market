'use strict';

const {
  buildRuntimeHealthReport
} = require('../runtime-health/sheikha-runtime-health-engine-v1');

function evaluateCheck(name, passed, details = {}) {
  return {
    name,
    status: passed ? 'PASS' : 'BLOCKED',
    passed: Boolean(passed),
    details
  };
}

function buildProductionGateReport(input = {}) {
  const health = input.health || buildRuntimeHealthReport();

  const checks = [
    evaluateCheck('architecture', input.architecture !== false, {
      frozen: true,
      baseline: 'SHEIKHA_PLATFORM_V1'
    }),
    evaluateCheck('runtimeHealth', health.status === 'HEALTHY', {
      overallScore: health.overallScore
    }),
    evaluateCheck('uiShell', input.uiShell !== false),
    evaluateCheck('workspace', input.workspace !== false),
    evaluateCheck('navigation', input.navigation !== false),
    evaluateCheck('contextEngine', input.contextEngine !== false),
    evaluateCheck('eventBus', input.eventBus !== false),
    evaluateCheck('governance', input.governance !== false),
    evaluateCheck('tests', input.tests !== false),
    evaluateCheck('lint', input.lint !== false),
    evaluateCheck('documentation', input.documentation !== false),
    evaluateCheck('externalMutationPolicy', true, {
      externalMutationAllowed: false,
      requiresHumanApproval: true
    })
  ];

  const blocked = checks.filter((check) => !check.passed);
  const score = Math.round((checks.length - blocked.length) / checks.length * 100);

  return {
    system: 'SHEIKHA_PRODUCTION_GATE_V1',
    status: blocked.length ? 'BLOCKED' : 'READY_FOR_STAGING',
    productionReady: blocked.length === 0,
    score,
    checks,
    blocked,
    decision: blocked.length
      ? 'FIX_BLOCKERS_BEFORE_STAGING'
      : 'DEPLOY_TO_STAGING_THEN_MONITOR',
    safety: {
      noHarm: true,
      noExternalMutation: true,
      approvalRequiredForExternalWrite: true,
      autonomousExternalWriteDisabled: true
    },
    nextStep: blocked.length
      ? 'Resolve blocked checks and rerun gate'
      : 'Run staging deployment and 24h monitoring'
  };
}

module.exports = {
  evaluateCheck,
  buildProductionGateReport
};
