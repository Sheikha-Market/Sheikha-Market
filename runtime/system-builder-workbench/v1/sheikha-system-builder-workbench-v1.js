'use strict';

const crypto = require('node:crypto');

const {
  getLanguagePlatformStatus
} = require(
  '../../../tools/sheikha-language-platform/' +
    'sheikha-language-platform-v1'
);

const LIFECYCLE = Object.freeze([
  'discover-requirements',
  'define-system-contract',
  'select-programming-language',
  'resolve-capabilities',
  'select-governed-tools',
  'compose-architecture',
  'generate-or-adapt-components',
  'validate-types-and-dependencies',
  'execute-tests-and-governance-gates',
  'package-artifacts',
  'verify-evidence',
  'deploy-through-governed-runtime',
  'observe-and-recover'
]);

function list(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(
    value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  )].slice(0, 50);
}

function normalizeBlueprint(input = {}) {
  return {
    name: String(input.name || '').trim(),
    owner: String(input.owner || '').trim(),
    purpose: String(input.purpose || '').trim(),
    targetEnvironment:
      String(
        input.targetEnvironment || 'development'
      ).trim(),
    programmingLanguage:
      String(
        input.programmingLanguage || 'sheikha'
      ).trim(),
    capabilities: list(input.capabilities),
    tools: list(input.tools),
    integrations: list(input.integrations),
    constraints: list(input.constraints),
    beneficiaries: list(input.beneficiaries)
  };
}

function validateBlueprint(input = {}) {
  const blueprint = normalizeBlueprint(input);

  const checks = {
    name:
      blueprint.name.length >= 3 &&
      blueprint.name.length <= 120,

    owner:
      blueprint.owner.length >= 3 &&
      blueprint.owner.length <= 200,

    purpose:
      blueprint.purpose.length >= 10 &&
      blueprint.purpose.length <= 2000,

    environment:
      [
        'development',
        'test',
        'staging',
        'production'
      ].includes(blueprint.targetEnvironment),

    programmingLanguage:
      [
        'sheikha',
        'javascript',
        'python',
        'php',
        'go',
        'rust',
        'java',
        'csharp'
      ].includes(blueprint.programmingLanguage),

    capabilities:
      blueprint.capabilities.length > 0
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    blueprint,
    checks,
    failedChecks,
    passed: failedChecks.length === 0
  };
}

function createGovernedPlan(input = {}) {
  const validation = validateBlueprint(input);
  const language = getLanguagePlatformStatus();

  const usesSheikha =
    validation.blueprint.programmingLanguage === 'sheikha';

  const languageReady =
    !usesSheikha || language.passed;

  const planId = crypto
    .createHash('sha256')
    .update(JSON.stringify(validation.blueprint))
    .digest('hex')
    .slice(0, 24);

  const stages = LIFECYCLE.map((stage, index) => {
    let status = 'BLOCKED';

    if (stage === 'discover-requirements') {
      status = validation.passed
        ? 'READY'
        : 'REQUIRES_INPUT';
    } else if (stage === 'select-programming-language') {
      status = languageReady
        ? 'VERIFIED'
        : 'BLOCKED';
    } else if (
      validation.passed &&
      languageReady &&
      [
        'define-system-contract',
        'resolve-capabilities',
        'select-governed-tools'
      ].includes(stage)
    ) {
      status = 'VALIDATION_REQUIRED';
    }

    return {
      order: index + 1,
      stage,
      status
    };
  });

  const blockers = [];

  if (!validation.passed) {
    blockers.push(
      ...validation.failedChecks.map(
        (name) => `blueprint:${name}`
      )
    );
  }

  if (!languageReady) {
    blockers.push(
      ...language.failedChecks.map(
        (name) => `language:${name}`
      )
    );
  }

  blockers.push(
    'verified-written-contract-required',
    'capability-registry-match-required',
    'registered-tool-authorization-required',
    'test-and-evidence-gates-required',
    'human-production-approval-required'
  );

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_SYSTEM_BUILDER_WORKBENCH_V1',
    planId,
    blueprint: validation.blueprint,
    validation,
    language: {
      selected:
        validation.blueprint.programmingLanguage,
      sheikhaLanguagePlatformPassed:
        language.passed,
      sourceExtension:
        usesSheikha ? '.shk' : null,
      pipeline:
        usesSheikha ? language.pipeline : []
    },
    lifecycle: stages,
    governance: {
      defaultAuthorization: 'DENY',
      executionAuthorized: false,
      deploymentAuthorized: false,
      automaticExternalChangesAllowed: false,
      humanApprovalRequired: true
    },
    blockers: [...new Set(blockers)],
    nextAction: validation.passed && languageReady
      ? 'CREATE_AND_VERIFY_WRITTEN_SYSTEM_CONTRACT'
      : 'COMPLETE_AND_VALIDATE_BLUEPRINT',
    passed:
      validation.passed && languageReady
  };
}

function getWorkbenchStatus() {
  const language = getLanguagePlatformStatus();

  return {
    system: 'SHEIKHA_SYSTEM_BUILDER_WORKBENCH_V1',
    status: 'ACTIVE',
    mode: 'GOVERNED_PLANNING_AND_VALIDATION',
    firstPartyLanguage: {
      system: language.system,
      arabicName: language.identity.arabicName,
      extension: language.identity.sourceExtension,
      passed: language.passed
    },
    lifecycle: LIFECYCLE,
    execution: {
      commandExecution: false,
      deploymentExecution: false,
      externalModification: false,
      defaultAuthorization: 'DENY'
    },
    passed: language.passed
  };
}

module.exports = {
  LIFECYCLE,
  normalizeBlueprint,
  validateBlueprint,
  createGovernedPlan,
  getWorkbenchStatus
};
