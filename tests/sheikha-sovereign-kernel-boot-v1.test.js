'use strict';

const {
  buildReport
} = require('../tools/activation/activate-sheikha-sovereign-kernel-boot-v1');

describe('Sheikha Sovereign Kernel Boot V1', () => {
  test('fuses kernel with Islamic governance and governed AI boundaries', () => {
    const report = buildReport();

    expect(report.rootCovenant.foundation).toBe('TAWHID_OF_ALLAH');
    expect(report.rootCovenant.highestLayer).toBe('HAKIMIYYAH_QURAN_SUNNAH_GOVERNANCE');
    expect(report.rootCovenant.noLayerAboveGovernance).toBe(true);
    expect(report.governanceKernel.reference.quran).toBe(true);
    expect(report.governanceKernel.reference.authenticSunnah).toBe(true);
    expect(report.governanceKernel.reference.hukmBelongsToAllah).toBe(true);
    expect(report.governanceKernel.reference.noRevelationClaim).toBe(true);
    expect(report.governanceKernel.reference.noIndependentFatwa).toBe(true);
    expect(report.governanceKernel.aiRole).toBe('governed_decision_support_and_coding_runtime');
  });

  test('makes Sheikha Language the foundational programming contract', () => {
    const report = buildReport();

    expect(report.sheikhaLanguagePrimacy.mandatoryForNewSystems).toBe(true);
    expect(report.sheikhaLanguagePrimacy.nativeSystemLanguage).toBe(true);
    expect(report.sheikhaLanguagePrimacy.linuxNodeNotFoundation).toBe(true);
    expect(report.sheikhaLanguagePrimacy.status).toBe('ACTIVE_AS_FOUNDATIONAL_PROGRAMMING_CONTRACT');
    expect(report.sheikhaLanguagePrimacy.integrationTargets).toContain('sheikha_os');
    expect(report.sheikhaLanguagePrimacy.blockedClaims).toContain('language_ready_without_compiler_check');
  });

  test('defines no-host from-scratch foundation while keeping boot evidence truthful', () => {
    const report = buildReport();

    expect(report.rootCovenant.noHostSystemAsFoundation).toBe(true);
    expect(report.rootCovenant.noLinuxNodeAsFoundation).toBe(true);
    expect(report.fromScratchBoundary.constitutionalFoundingFromScratch).toBe(true);
    expect(report.fromScratchBoundary.applicationKernelBuiltFromSheikhaContracts).toBe(true);
    expect(report.fromScratchBoundary.higherBusinessLogicSystemRequired).toBe(false);
    expect(report.fromScratchBoundary.hostSystemFoundationAllowed).toBe(false);
    expect(report.fromScratchBoundary.linuxNodeFoundationAllowed).toBe(false);
    expect(report.fromScratchBoundary.currentRepositoryToolingIsFoundation).toBe(false);
    expect(report.fromScratchBoundary.bareMetalFullyIndependentToday).toBe(false);
    expect(report.fromScratchBoundary.truthPolicy).toContain('bare-metal');
  });

  test('covers frontends stores laptop boot and recovery', () => {
    const report = buildReport();

    expect(report.frontendAndStores.routes.map((item) => item.route)).toEqual(expect.arrayContaining([
      '/',
      '/marketplace',
      '/api/stores',
      '/api/stores-by-specialty'
    ]));
    expect(report.frontendAndStores.surfaces.map((item) => item.name)).toEqual(expect.arrayContaining([
      'website',
      'marketplace',
      'storesApi',
      'arabicPackageManager'
    ]));
    expect(report.laptopBootReadiness.nativeTarget.noHostSystemFoundation).toBe(true);
    expect(report.laptopBootReadiness.commands).toContain('npm run -s ops:sovereign-kernel-boot:v1');
    expect(report.recoveryPlaybook.stages.length).toBeGreaterThan(4);
  });
});
