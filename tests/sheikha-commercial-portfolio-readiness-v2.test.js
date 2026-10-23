'use strict';

const { buildCommercialPortfolioReadiness } = require('../runtime/sheikha-studio/core/sheikha-commercial-portfolio-readiness-v2');
const { PRODUCTS } = require('../runtime/sheikha-studio/core/sheikha-unified-ecosystem-v1');

describe('Sheikha commercial portfolio readiness V2', () => {
  test('fails closed for every product when commercial evidence is incomplete', () => {
    const report = buildCommercialPortfolioReadiness({
      production: { checks: { operationalReady: true, productionSecretsReady: true }, git: { clean: false } },
      launch: { readiness: {} },
      audit: { high: 27 },
    });
    expect(report.productCount).toBe(PRODUCTS.length);
    expect(report.products.map((product) => product.id)).toEqual(PRODUCTS.map((product) => product.id));
    expect(report.readyCount).toBe(0);
    expect(report.globalBlockers).toContain('HIGH_SEVERITY_DEPENDENCY_FINDINGS_REQUIRED');
    expect(report.globalBlockers).toContain('HUMAN_APPROVED_COMMERCIAL_CONTRACT_REQUIRED');
    expect(report.products.every((product) => product.commercialDecision === 'COMMERCIAL_RELEASE_DENY')).toBe(true);
  });

  test('keeps product-specific acceptance for immature products after global closure', () => {
    const launch = { checks: [{ id: 'contract-approval', passed: true }], readiness: {
      backupReady: true, rollbackReady: true, monitoringReady: true, revenueReady: true,
      customerLifecycleReady: true, supportReady: true,
    } };
    const report = buildCommercialPortfolioReadiness({
      production: { checks: { operationalReady: true, productionSecretsReady: true, qualityReady: true }, git: { clean: true } },
      launch,
      audit: { high: 0, critical: 0 },
    });
    expect(report.globalBlockers).toEqual([]);
    expect(report.products.find((product) => product.id === 'SHEIKHA_FIRMWARE').blockers)
      .toContain('PRODUCT_SPECIFIC_COMMERCIAL_ACCEPTANCE_REQUIRED');
  });

  test('blocks critical vulnerabilities and unmeasured quality even without high findings', () => {
    const report = buildCommercialPortfolioReadiness({
      production: {checks: {operationalReady: true, productionSecretsReady: true, qualityReady: null}},
      audit: {high: 0, critical: 1}
    });
    expect(report.readyCount).toBe(0);
    expect(report.globalBlockers).toContain('QUALITY_VERIFICATION_REQUIRED');
    expect(report.globalBlockers).toContain('CRITICAL_SEVERITY_DEPENDENCY_FINDINGS_REQUIRED');
  });
});
