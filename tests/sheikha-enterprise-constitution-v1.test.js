'use strict';

const {
  PERMANENT_PRINCIPLES,
  CANONICAL_ENTITIES,
  buildConstitutionStandards,
  validateConstitutionStandards,
  buildEnterpriseConstitutionV1
} = require('../core/enterprise-constitution/sheikha-enterprise-constitution-v1');

function enterpriseOs(commercialLaunchReady = false) {
  return {
    status: 'ACTIVE',
    decision: commercialLaunchReady
      ? 'ENTERPRISE_OS_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'ENTERPRISE_OS_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED',
    readiness: { commercialLaunchReady },
    enterpriseReleaseFabric: {
      currentStage: commercialLaunchReady ? 'Controlled Staging' : 'Release Candidate'
    }
  };
}

describe('Sheikha Enterprise Constitution V1', () => {
  test('activates fixed enterprise principles and standards above V11', () => {
    const report = buildEnterpriseConstitutionV1({
      enterpriseOperatingSystem: enterpriseOs(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_CONSTITUTION_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('CONSTITUTION_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED');
    expect(report.permanentPrinciples).toContain('Governance Before Execution');
    expect(report.permanentPrinciples).toContain('No Harm');
    expect(report.standards.moduleStandard.required).toContain('contract.js');
    expect(report.standards.apiStandard.required).toContain('Deprecation Policy');
    expect(report.enforcement.noDuplicateCanonicalEntity).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('validates all standards and canonical entities', () => {
    const standards = buildConstitutionStandards();
    const validation = validateConstitutionStandards(standards);

    expect(validation.status).toBe('PASSED');
    expect(validation.requiredItems).toBeGreaterThan(70);
    expect(PERMANENT_PRINCIPLES).toContain('Audit Everything');
    expect(CANONICAL_ENTITIES).toContain('Payment');
    expect(standards.dataStandard.forbiddenExamples).toContain('Customer2');
  });

  test('promotes constitution decision when commercial evidence is ready', () => {
    const report = buildEnterpriseConstitutionV1({
      enterpriseOperatingSystem: enterpriseOs(true)
    });

    expect(report.decision).toBe('CONSTITUTION_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.linkedLayers.commercialLaunchReady).toBe(true);
    expect(report.executivePrograms.every((program) => program.status === 'ACTIVE')).toBe(true);
  });
});
