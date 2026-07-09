'use strict';

const {
  buildReport
} = require('../tools/activation/activate-sheikha-universal-technology-hpc-fabric-v1');

describe('Sheikha Universal Technology HPC Fabric V1', () => {
  test('activates generic technology families by properties laws and specifications', () => {
    const report = buildReport();

    expect(report.system).toBe('SHEIKHA_UNIVERSAL_TECHNOLOGY_HPC_FABRIC_V1');
    expect(report.sourceAbstraction.tradeNamePolicy).toBe('DESCRIBE_BY_CAPABILITY_PROPERTIES_LAWS_SPECIFICATIONS_NOT_BY_COMMERCIAL_NAME');
    expect(report.sourceAbstraction.attachedNamesUsedAsAuthority).toBe(false);
    expect(report.sourceAbstraction.attachedNamesPersistedInCatalog).toBe(false);
    expect(report.technologyFamilies.length).toBeGreaterThanOrEqual(12);
    expect(report.technologyFamilies.every((family) => (
      family.properties.length > 0 && family.laws.length > 0 && family.specifications.length > 0
    ))).toBe(true);
  });

  test('keeps Quran Sunnah governance above compute and AI', () => {
    const report = buildReport();

    expect(report.governanceRoot.foundation).toBe('TAWHID_OF_ALLAH');
    expect(report.governanceRoot.highestLayer).toBe('HAKIMIYYAH_QURAN_SUNNAH_GOVERNANCE');
    expect(report.governanceRoot.quran).toBe(true);
    expect(report.governanceRoot.authenticSunnah).toBe(true);
    expect(report.governanceRoot.noRevelationClaim).toBe(true);
    expect(report.governanceRoot.noIndependentFatwa).toBe(true);
    expect(report.governanceRoot.humanReviewForHighImpact).toBe(true);
    expect(report.architectureGraph.edges).toEqual(expect.arrayContaining([
      expect.objectContaining({
        from: 'TAWHID_GOVERNANCE_ROOT',
        to: 'AI_ACCELERATION_AND_INDUSTRIAL_OPTIMIZATION',
        relation: 'governs'
      })
    ]));
  });

  test('covers hpc semiconductors conductors supply chain devices recovery and truth gate', () => {
    const report = buildReport();
    const ids = report.technologyFamilies.map((family) => family.id);

    expect(ids).toEqual(expect.arrayContaining([
      'EXASCALE_PARALLEL_COMPUTE',
      'DISTRIBUTED_MEMORY_AND_MESSAGE_FABRIC',
      'PARALLEL_STORAGE_AND_DATA_GRAVITY',
      'CONDUCTOR_POWER_THERMAL_MATERIALS',
      'SEMICONDUCTOR_LOGIC_MEMORY_PACKAGING',
      'SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN',
      'DEVICE_FACTORY_AND_OPERATIONAL_AUTOMATION',
      'SECURITY_RECOVERY_AND_LIVE_REPAIR',
      'OBSERVABILITY_BENCHMARK_AND_TRUTH_GATE'
    ]));
  });

  test('does not grant fastest claims without benchmark evidence', () => {
    const report = buildReport();

    expect(report.fastestSystemPolicy.target).toBe('FASTEST_SHEIKHA_NATIVE_GOVERNED_COMPUTE_FABRIC');
    expect(report.fastestSystemPolicy.fastestUniverseClaimAllowedToday).toBe(false);
    expect(report.fastestSystemPolicy.fastestWorldClaimAllowedToday).toBe(false);
    expect(report.fastestSystemPolicy.benchmarkEvidenceRequired).toBe(true);
    expect(report.fastestSystemPolicy.requiredEvidence).toEqual(expect.arrayContaining([
      'repeatable benchmark suite',
      'truth gate approval'
    ]));
  });

  test('binds every technology family to Sheikha language contracts without host foundation', () => {
    const report = buildReport();

    expect(report.hostIndependenceBoundary.githubRequired).toBe(false);
    expect(report.hostIndependenceBoundary.hostSystemAsFoundation).toBe(false);
    expect(report.hostIndependenceBoundary.currentRepositoryToolingIsFoundation).toBe(false);
    expect(report.hostIndependenceBoundary.bareMetalIndependenceClaimedToday).toBe(false);
    expect(report.sheikhaLanguageBinding.allTechnologyFamiliesRequireSheikhaContract).toBe(true);
    expect(report.sheikhaLanguageBinding.contracts.length).toBe(report.technologyFamilies.length);
  });
});
