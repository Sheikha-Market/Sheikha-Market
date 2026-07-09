'use strict';

const {
  buildReport
} = require('../tools/activation/activate-sheikha-sovereign-kernel-boot-v1');

describe('Sheikha Sovereign Kernel Boot V1', () => {
  test('fuses kernel with Islamic governance and governed AI boundaries', () => {
    const report = buildReport();

    expect(report.governanceKernel.reference.quran).toBe(true);
    expect(report.governanceKernel.reference.authenticSunnah).toBe(true);
    expect(report.governanceKernel.reference.noRevelationClaim).toBe(true);
    expect(report.governanceKernel.reference.noIndependentFatwa).toBe(true);
    expect(report.governanceKernel.aiRole).toBe('governed_decision_support_and_coding_runtime');
  });

  test('makes Sheikha Language the foundational programming contract', () => {
    const report = buildReport();

    expect(report.sheikhaLanguagePrimacy.mandatoryForNewSystems).toBe(true);
    expect(report.sheikhaLanguagePrimacy.status).toBe('ACTIVE_AS_FOUNDATIONAL_PROGRAMMING_CONTRACT');
    expect(report.sheikhaLanguagePrimacy.integrationTargets).toContain('sheikha_os');
    expect(report.sheikhaLanguagePrimacy.blockedClaims).toContain('language_ready_without_compiler_check');
  });

  test('keeps from-scratch claims truthful while tracking bare-metal roadmap', () => {
    const report = buildReport();

    expect(report.fromScratchBoundary.applicationKernelBuiltFromSheikhaContracts).toBe(true);
    expect(report.fromScratchBoundary.higherBusinessLogicSystemRequired).toBe(false);
    expect(report.fromScratchBoundary.hostBootstrapRequiredToday).toBe(true);
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
    expect(report.laptopBootReadiness.commands).toContain('npm run -s ops:sovereign-kernel-boot:v1');
    expect(report.recoveryPlaybook.stages.length).toBeGreaterThan(4);
  });
});
