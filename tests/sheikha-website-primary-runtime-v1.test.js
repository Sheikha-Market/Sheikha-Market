'use strict';

const {
  SYSTEM,
  getWebsitePrimaryRuntimeStatus,
  validateWebsitePrimaryRuntime,
} = require(
  '../runtime/website-primary-runtime/v1/' +
  'sheikha-website-primary-runtime-v1'
);

describe('Sheikha Website Primary Runtime V1', () => {
  test('website is the primary product surface under system builder platform', () => {
    const status = getWebsitePrimaryRuntimeStatus();

    expect(status.system).toBe(SYSTEM);
    expect(status.status).toBe('ACTIVE');
    expect(status.foundationPlatform).toBe(
      'system-builder-platform'
    );
    expect(status.foundationPlatform).toBe(
      'system-builder-platform'
    );
    expect(status.primarySurface).toBe('website');
    expect(status.primaryRuntime).toBe('sheikha-main-portal');

    expect(
      status.productSurfaces.website.requiredForProduction
    ).toBe(true);

    expect(
      status.productSurfaces.website.independentlyOperable
    ).toBe(true);

    expect(
      status.operationalMeaning.systemBuilderIsFoundation
    ).toBe(true);

    expect(
      status.operationalMeaning.websiteIsFoundation
    ).toBe(false);

    expect(
      status.operationalMeaning.websiteIsPrimaryProductSurface
    ).toBe(true);

    expect(
      status.operationalMeaning.websiteIsSystemBuilderSurface
    ).toBe(true);

    expect(
      status.operationalMeaning.systemBuilderIsFoundation
    ).toBe(true);

    expect(
      status.operationalMeaning.websiteIsFoundation
    ).toBe(false);

    expect(
      status.operationalMeaning.websiteIsPrimaryProductSurface
    ).toBe(true);

    expect(
      status.operationalMeaning.websiteIsSystemBuilderSurface
    ).toBe(true);
  });

  test('VS Code is a tool and not a production dependency', () => {
    const status = getWebsitePrimaryRuntimeStatus();

    expect(
      status.productSurfaces.vscode.role
    ).toBe(
      'DEVELOPMENT_ADMINISTRATION_AND_DIAGNOSTIC_TOOL_ONLY'
    );

    expect(
      status.productSurfaces.vscode.requiredForProduction
    ).toBe(false);

    expect(
      status.productSurfaces.vscode.requiredForWebsiteStartup
    ).toBe(false);

    expect(
      status.productSurfaces.vscodeExtension.requiredForProduction
    ).toBe(false);

    expect(
      status.operationalMeaning.vscodeIsToolOnly
    ).toBe(true);
  });

  test('slow or unavailable models do not stop the website', () => {
    const status = getWebsitePrimaryRuntimeStatus();

    expect(
      status.availabilityPolicy
        .websiteMustRemainAvailableWhenModelIsSlow
    ).toBe(true);

    expect(
      status.availabilityPolicy
        .websiteMustRemainAvailableWhenDeepModelIsUnavailable
    ).toBe(true);

    expect(
      status.availabilityPolicy.deepAnalysisMode
    ).toBe('EXPLICIT_OR_BACKGROUND_NON_BLOCKING');

    expect(
      status.availabilityPolicy.firstTokenTargetIsSla
    ).toBe(false);
  });

  test('contract validation passes', () => {
    const validation = validateWebsitePrimaryRuntime();

    expect(validation.failedChecks).toEqual([]);
    expect(validation.passed).toBe(true);
  });
});
