'use strict';

const {
  SOVEREIGN_CORE,
  CANONICAL_DATA_MODEL,
  buildDependencyGraph,
  buildEnterpriseOperatingSystemV11
} = require('../core/enterprise-operating-system/sheikha-enterprise-operating-system-v11');

function platformReady(commercialLaunchReady = false) {
  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_PLATFORM_V9',
    status: 'ACTIVE',
    readiness: {
      productionCandidateReady: true,
      commercialLaunchReady
    }
  };
}

function launchGate(ready = false) {
  return {
    system: 'SHEIKHA_COMMERCIAL_LAUNCH_VALIDATION_V1',
    status: ready ? 'ACTIVE' : 'PENDING_EVIDENCE',
    decision: ready
      ? 'READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'COMMERCIAL_LAUNCH_REMAINS_GATED',
    missingDomains: [],
    pending: ready ? [] : [{ id: 'database-backup' }],
    readiness: {
      commercialLaunchReady: ready
    }
  };
}

describe('Sheikha Enterprise Operating System V11', () => {
  test('activates the governed enterprise operating system foundation', () => {
    const report = buildEnterpriseOperatingSystemV11({
      platformV9: platformReady(false),
      commercialLaunch: launchGate(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_OPERATING_SYSTEM_V11');
    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('ENTERPRISE_OS_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED');
    expect(report.hierarchy.sovereignCore).toEqual(SOVEREIGN_CORE);
    expect(report.unifiedEnterpriseRegistry.sourceOfTruth).toBe(true);
    expect(report.enterpriseDataFabric.canonicalModel).toEqual(CANONICAL_DATA_MODEL);
    expect(report.enterpriseCommercialFabric.status).toBe('EVIDENCE_PENDING');
    expect(report.enterpriseReleaseFabric.currentStage).toBe('Release Candidate');
    expect(report.governance.noHarm).toBe(true);
  });

  test('promotes only to controlled commercial launch when launch evidence is ready', () => {
    const report = buildEnterpriseOperatingSystemV11({
      platformV9: platformReady(true),
      commercialLaunch: launchGate(true)
    });

    expect(report.decision).toBe('ENTERPRISE_OS_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.readiness.commercialLaunchReady).toBe(true);
    expect(report.enterpriseCommercialFabric.status).toBe('READY');
    expect(report.enterpriseReleaseFabric.currentStage).toBe('Controlled Staging');
  });

  test('blocks reverse dependencies from the sovereign core into business layers', () => {
    const graph = buildDependencyGraph();

    expect(graph.reverseDependencyBlocked).toBe(true);
    expect(graph.forbiddenReverseDependencies).toContain('Sovereign Core -> Business Platform');
  });
});
