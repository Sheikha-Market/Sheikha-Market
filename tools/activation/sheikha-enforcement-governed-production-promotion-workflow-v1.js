#!/usr/bin/env node
'use strict';

const workflow = require(
  '../../core/production-safety/sheikha-enforcement-governed-production-promotion-workflow-v1'
);

const verification = workflow.selfVerify();
const current = workflow.status();

const result = {
  system: workflow.SYSTEM,
  status: current.status,
  authority: current.authority,
  executionBoundary: current.executionBoundary,
  workflowPhaseCount: current.phases.length,
  checks: {
    verificationPassed: verification.status === 'VERIFIED',
    humanOnly: current.authority === 'HUMAN_ONLY',
    noExecution:
      current.executesCommands === false
      && current.performsProductionMutation === false,
    externalApprovalDenied:
      current.externalApprovalTrusted === false,
    separateReviewedExecutorRequired:
      current.requiresSeparateReviewedExecutor === true
  },
  failedChecks: verification.failedChecks
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (
  !Object.values(result.checks).every(Boolean)
  || result.failedChecks.length > 0
) {
  process.exit(1);
}

process.stdout.write(
  'ENFORCEMENT_GOVERNED_PRODUCTION_PROMOTION_WORKFLOW_READY\n'
);
