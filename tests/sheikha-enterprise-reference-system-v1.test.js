'use strict';

const {
  REFERENCE_ARCHITECTURE_LAYERS,
  REFERENCE_CONTRACTS,
  REFERENCE_DOMAINS,
  EXTENDED_CANONICAL_DATA,
  buildEnterpriseReferenceSections,
  buildReferenceContractsIndex,
  buildReferenceDomainIndex,
  validateEnterpriseReferenceSystem,
  buildEnterpriseReferenceSystemV1
} = require('../core/enterprise-reference-system/sheikha-enterprise-reference-system-v1');

function enterpriseConstitution(commercialLaunchReady = false) {
  return {
    status: 'ACTIVE',
    decision: commercialLaunchReady
      ? 'CONSTITUTION_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'CONSTITUTION_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED',
    linkedLayers: {
      enterpriseOperatingSystemV11: 'ACTIVE',
      commercialLaunchReady,
      currentReleaseStage: commercialLaunchReady ? 'Controlled Staging' : 'Release Candidate'
    }
  };
}

describe('Sheikha Enterprise Reference System V1', () => {
  test('activates the reference system above the constitution', () => {
    const report = buildEnterpriseReferenceSystemV1({
      enterpriseConstitution: enterpriseConstitution(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_REFERENCE_SYSTEM_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('REFERENCE_SYSTEM_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED');
    expect(report.referenceQuestions).toHaveLength(4);
    expect(report.sections.architecture.items).toEqual(REFERENCE_ARCHITECTURE_LAYERS);
    expect(report.sections.contracts.items).toEqual(REFERENCE_CONTRACTS);
    expect(report.enforcement.everyComponentMustDeclareReferenceLayer).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('validates sections, contracts, domains, and canonical data', () => {
    const sections = buildEnterpriseReferenceSections();
    const validation = validateEnterpriseReferenceSystem(sections);
    const contracts = buildReferenceContractsIndex(sections);
    const domains = buildReferenceDomainIndex(sections);

    expect(validation.status).toBe('PASSED');
    expect(validation.sections).toBe(12);
    expect(validation.requiredItems).toBeGreaterThan(90);
    expect(contracts).toHaveLength(REFERENCE_CONTRACTS.length);
    expect(domains).toHaveLength(REFERENCE_DOMAINS.length);
    expect(EXTENDED_CANONICAL_DATA).toContain('Department');
    expect(EXTENDED_CANONICAL_DATA).toContain('Subscription');
  });

  test('promotes reference decision when commercial evidence is ready', () => {
    const report = buildEnterpriseReferenceSystemV1({
      enterpriseConstitution: enterpriseConstitution(true)
    });

    expect(report.decision).toBe('REFERENCE_SYSTEM_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.linkedLayers.commercialLaunchReady).toBe(true);
    expect(report.roadmap.every((program) => program.status === 'ACTIVE')).toBe(true);
  });
});
