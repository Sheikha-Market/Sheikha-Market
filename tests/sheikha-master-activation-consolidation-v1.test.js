'use strict';

const os = require('node:os');
const path = require('node:path');

const {
  buildComponent,
  buildMethodologyAccreditationReadiness,
  buildReport,
  classifyLayer,
  classifyLifecycleStatus
} = require('../tools/activation/activate-sheikha-master-activation-consolidation-v1');

describe('Sheikha Master Activation Consolidation V1', () => {
  test('classifies layers from real component paths', () => {
    expect(classifyLayer('tools/activation/activate-sheikha-enterprise-integration-verification-layer-v1.js')).toBe('Enterprise');
    expect(classifyLayer('runtime/identity/sheikha-active-identity-v2-report.json')).toBe('Identity');
    expect(classifyLayer('tools/capability-registry/sheikha-capability-registry-v2.js')).toBe('Registry');
  });

  test('classifies lifecycle heuristically', () => {
    expect(classifyLifecycleStatus('runtime/identity/sheikha-active-identity-v2-report.json')).toBe('ACTIVE');
    expect(classifyLifecycleStatus('tools/activation/activate-sheikha-marketplace-operating-system-v1.sh')).toBe('NEEDS_LINKING');
    expect(classifyLifecycleStatus('archive/old/backup-file.json')).toBe('UNUSED');
  });

  test('builds component with dependencies', () => {
    const component = buildComponent('runtime/community/sheikha-community-modeling-report.json');
    expect(component.layer).toBe('Community');
    expect(component.dependencies).toContain('Identity');
    expect(component.inputs.length).toBeGreaterThan(0);
    expect(component.outputs.length).toBeGreaterThan(0);
    expect(component.githubRequired).toBeUndefined();
    expect(component.evidence.githubRequired).toBe(false);
  });

  test('builds repository discovery report', () => {
    const report = buildReport();
    expect(report.system).toBe('SHEIKHA_MASTER_ACTIVATION_CONSOLIDATION_V1');
    expect(report.repositoryDiscovery.discoveredFiles).toBeGreaterThan(0);
    expect(report.capabilityRegistryBuild.scripts.length).toBeGreaterThan(0);
  });

  test('builds the twelve-phase local activation evidence set', () => {
    const report = buildReport();

    expect(report.offlineOperation.githubRequired).toBe(false);
    expect(report.checks.githubIndependent).toBe(true);
    expect(report.checks.bareMetalSeedIntegrated).toBe(true);
    expect(report.checks.computingCognitiveLayersIntegrated).toBe(true);
    expect(report.checks.universalDistributionIntegrated).toBe(true);
    expect(report.capabilityRegistry.componentCount).toBeGreaterThan(0);
    expect(report.architectureGraph.nodes.length).toBeGreaterThan(0);
    expect(report.duplicateAnalysis.policy).toBe('REPORT_ONLY_NO_DELETION');
    expect(report.integrationVerification.score).toBeGreaterThan(0);
    expect(report.runtimeVerification.score).toBeGreaterThan(0);
    expect(report.knowledgeVerification.score).toBeGreaterThan(0);
    expect(report.performanceVerification.score).toBeGreaterThan(0);
    expect(report.securityVerification.score).toBeGreaterThan(0);
    expect(report.methodologyAccreditation.policy.externalAccreditationIssuedBySheikha).toBe(false);
    expect(report.methodologyAccreditation.internalIssuedAttestations.length).toBeGreaterThan(0);
    expect(report.methodologyAccreditation.methodologyFamilies.map((item) => item.familyKey)).toEqual(expect.arrayContaining([
      'SCIENTIFIC',
      'ORGANIZATIONAL',
      'ADMINISTRATIVE',
      'TECHNICAL',
      'ENGINEERING',
      'MATHEMATICAL_ACCOUNTING',
      'COMPUTATIONAL'
    ]));
    expect(report.methodologyAccreditation.externalCertificatesIssued).toBe(0);
    expect(report.documentation.count).toBeGreaterThan(0);
    expect(report.executiveDashboard.indicators.githubRequired).toBe(false);
    expect(report.executiveDashboard.indicators.internalAttestations).toBeGreaterThan(0);
    expect(report.executiveDashboard.indicators.bareMetalFullyIndependentToday).toBe(true);
    expect(report.executiveDashboard.indicators.computingCognitiveLayersActive).toBe(true);
    expect(report.executiveDashboard.indicators.computingCognitiveApexLevel).toBe(24);
    expect(report.executiveDashboard.indicators.highestExecutableTechnicalLayer).toBe(true);
    expect(report.executiveDashboard.indicators.normativeReferenceLayerExecutable).toBe(false);
    expect(report.executiveDashboard.indicators.distributionTargetCount).toBe(27);
    expect(report.executiveDashboard.indicators.distributionBuiltCount).toBeGreaterThanOrEqual(3);
    expect(report.executiveDashboard.indicators.distributionVerifiedCount).toBeGreaterThanOrEqual(1);
    expect(report.executiveDashboard.indicators.distributionLocalRegistryOnly).toBe(true);
    expect(report.executiveDashboard.indicators.reasoningUltraRoleSlots).toBe(4);
    expect(report.executiveDashboard.indicators.reasoningActualIndependentModelProcesses).toBe(false);
    expect(report.executiveDashboard.indicators.reasoningHumanFinalDecision).toBe(true);
    expect(report.executiveDashboard.indicators.safetyFilterEvasionAllowed).toBe(false);
    expect(report.executiveReport.counts.apis).toBeGreaterThan(0);
    expect(report.executiveReport.counts.verifiedBareMetalBoots).toBe(1);
    expect(report.executiveReport.counts.externalCertificatesIssued).toBe(0);
    expect(report.executiveReport.counts.computingCognitiveDomains).toBeGreaterThanOrEqual(7);
    expect(report.executiveReport.counts.reasoningModes).toBe(3);
    expect(report.computingCognitiveLayers).toMatchObject({
      score: 100,
      apexLevel: 24,
      highestExecutableTechnicalLayer: true,
      normativeReferenceLayerExecutable: false,
      humanAuthorityAboveAutomation: true,
      ultraRoleSlots: 4,
      actualIndependentModelProcesses: false,
      humanFinalDecision: true,
      safetyFilterEvasionAllowed: false
    });
    expect(report.universalDistribution).toMatchObject({
      targetCount: 27,
      builtCount: 3,
      verifiedCount: 1,
      nativeVerifiedCount: 1,
      localRegistryPublishedCount: 3,
      localReleasePath: path.join(os.homedir(), 'Sheikha-Local-Registry/releases/1.0.51'),
      localRegistryOnly: true,
      githubRequired: false
    });
  });

  test('builds methodology accreditation readiness without external issuance claims', () => {
    const readiness = buildMethodologyAccreditationReadiness(
      [
        'docs/scientific-methodology.md',
        'docs/enterprise-architecture.md',
        'docs/admin-management.md',
        'routes/api/runtime-routes.js',
        'runtime/compute/hpc-engine.json',
        'runtime/analytics/score-metrics.json',
        'tools/ai-engine/sheikha-worker-engine.js',
        'runtime/security/audit-log.json',
        'tests/quality-readiness.test.js',
        'runtime/licensing-engine/v1/registries/licenses.json'
      ],
      [{ path: 'runtime/security/audit-log.json' }],
      { score: 100 },
      { score: 100 },
      { score: 100, checks: { governance: { evidence: ['runtime/governance/report.json'] } } },
      { score: 100 },
      { score: 100, checks: { auditLogs: { evidence: ['runtime/security/audit-log.json'] } } }
    );

    expect(readiness.policy.internalAttestationsAllowed).toBe(true);
    expect(readiness.policy.externalAccreditationIssuedBySheikha).toBe(false);
    expect(readiness.externalCertificatesIssued).toBe(0);
    expect(readiness.localAccreditationReadinessTargets.length).toBeGreaterThan(0);
    expect(readiness.internationalAccreditationReadinessTargets.length).toBeGreaterThan(0);
  });
});
