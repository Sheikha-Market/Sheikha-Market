'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  getLanguagePlatformStatus
} = require(
  '../tools/sheikha-language-platform/' +
    'sheikha-language-platform-v1'
);

const {
  buildInventory
} = require(
  '../tools/foundational-closure/' +
    'sheikha-activation-inventory-v1'
);

const {
  validateBlueprint,
  createGovernedPlan,
  getWorkbenchStatus
} = require(
  '../runtime/system-builder-workbench/v1/' +
    'sheikha-system-builder-workbench-v1'
);

const charter = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '../governance/foundational-charter/v1/' +
        'sheikha-foundational-charter-v1.json'
    ),
    'utf8'
  )
);

describe('Sheikha Language Platform Foundation V1', () => {
  test('charter establishes system builder and Sheikha language', () => {
    expect(charter.status).toBe('ACTIVE');

    expect(charter.architecture.foundation).toBe(
      'Sheikha System Builder Platform'
    );

    expect(
      charter.architecture.firstPartyProgrammingLanguage
    ).toBe('SHEIKHA_LANGUAGE_PLATFORM_V1');

    expect(
      charter.architecture.firstPartyLanguageExtension
    ).toBe('.shk');

    expect(
      charter.architecture.websiteIsFoundation
    ).toBe(false);

    expect(
      charter.operatingPrinciples
        .defaultExecutionAuthorization
    ).toBe('DENY');

    expect(
      charter.referenceFramework.boundaries
        .systemIssuesFatwa
    ).toBe(false);
  });

  test('existing Sheikha language foundation is complete', () => {
    const status = getLanguagePlatformStatus();

    expect(status.status).toBe('ACTIVE');
    expect(status.identity.arabicName).toBe(
      'لغة شيخة البرمجية'
    );

    expect(status.identity.sourceExtension).toBe('.shk');

    expect(
      Object.values(status.fileChecks).every(Boolean)
    ).toBe(true);

    expect(
      Object.values(status.scriptChecks).every(Boolean)
    ).toBe(true);

    expect(status.failedChecks).toEqual([]);
    expect(status.passed).toBe(true);
  });

  test('workbench selects Sheikha as first-party language', () => {
    const status = getWorkbenchStatus();

    expect(status.status).toBe('ACTIVE');

    expect(
      status.firstPartyLanguage.system
    ).toBe('SHEIKHA_LANGUAGE_PLATFORM_V1');

    expect(
      status.firstPartyLanguage.extension
    ).toBe('.shk');

    expect(
      status.execution.defaultAuthorization
    ).toBe('DENY');

    expect(status.execution.commandExecution).toBe(false);
    expect(status.execution.deploymentExecution).toBe(false);
  });

  test('workbench creates governed Sheikha-language plan', () => {
    const plan = createGovernedPlan({
      name: 'نظام سلسلة الإمداد',
      owner: 'سلمان أحمد سلمان الراجح',
      purpose:
        'تنظيم الطلبات والموردين والتحقق والتوريد.',
      programmingLanguage: 'sheikha',
      targetEnvironment: 'development',
      capabilities: [
        'registry',
        'governance',
        'recovery'
      ],
      tools: [
        'Sheikha VM'
      ],
      integrations: [
        'API'
      ]
    });

    expect(plan.validation.passed).toBe(true);
    expect(plan.language.selected).toBe('sheikha');
    expect(plan.language.sourceExtension).toBe('.shk');

    expect(
      plan.language.sheikhaLanguagePlatformPassed
    ).toBe(true);

    expect(
      plan.governance.executionAuthorized
    ).toBe(false);

    expect(
      plan.governance.deploymentAuthorized
    ).toBe(false);

    expect(plan.lifecycle).toHaveLength(13);
    expect(plan.passed).toBe(true);
  });

  test('incomplete blueprints remain blocked', () => {
    const validation = validateBlueprint({});

    expect(validation.passed).toBe(false);
    expect(validation.failedChecks).toContain('name');
    expect(validation.failedChecks).toContain('owner');
    expect(validation.failedChecks).toContain('purpose');
  });

  test('activation inventory discovers systems and language', () => {
    const inventory = buildInventory();

    expect(inventory.scan.filesInspected).toBeGreaterThan(0);
    expect(inventory.scan.discoveredSystems).toBeGreaterThan(0);

    expect(
      inventory.systems.some(
        (item) =>
          item.system ===
          'SHEIKHA_LANGUAGE_PLATFORM_V1'
      )
    ).toBe(true);

    expect(inventory.passed).toBe(true);
  });
});
