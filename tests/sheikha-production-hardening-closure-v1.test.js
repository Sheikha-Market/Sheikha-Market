'use strict';

const {
  buildProductionHardeningClosure,
  checkDomainDataContracts,
  checkEngineRegistrationMigration,
  checkOptionalEngineSegments,
  checkRuntimeBootstrapValidation
} = require('../core/production-hardening/sheikha-production-hardening-closure-v1');

describe('Sheikha Production Hardening Closure V1', () => {
  test('validates production hardening checks with clean logs', async () => {
    const report = await buildProductionHardeningClosure({
      logLines: [{ file: 'ok.log', line: 'service online health ok' }]
    });

    expect(report.system).toBe('SHEIKHA_PRODUCTION_HARDENING_CLOSURE_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('PRODUCTION_CANDIDATE_READY');
    expect(report.readiness.noBlockers).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('keeps cron missed execution as production candidate review', async () => {
    const report = await buildProductionHardeningClosure({
      logLines: [{
        file: 'error.log',
        line: '[NODE-CRON] missed execution at Sun Jul 05 2026'
      }]
    });

    expect(report.status).toBe('REVIEW');
    expect(report.decision).toBe('PRODUCTION_CANDIDATE_REVIEW');
    expect(report.productionGate.candidateReady).toBe(true);
  });

  test('checks contracts, migration, segments, and bootstrap directly', () => {
    expect(checkDomainDataContracts().status).toBe('ACTIVE');
    expect(checkEngineRegistrationMigration().status).toBe('ACTIVE');
    expect(checkOptionalEngineSegments().status).toBe('ACTIVE');
    expect(checkRuntimeBootstrapValidation().status).toBe('ACTIVE');
  });
});
