'use strict';

const {
  buildComponent,
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
    expect(report.capabilityRegistry.componentCount).toBeGreaterThan(0);
    expect(report.architectureGraph.nodes.length).toBeGreaterThan(0);
    expect(report.duplicateAnalysis.policy).toBe('REPORT_ONLY_NO_DELETION');
    expect(report.integrationVerification.score).toBeGreaterThan(0);
    expect(report.runtimeVerification.score).toBeGreaterThan(0);
    expect(report.knowledgeVerification.score).toBeGreaterThan(0);
    expect(report.performanceVerification.score).toBeGreaterThan(0);
    expect(report.securityVerification.score).toBeGreaterThan(0);
    expect(report.documentation.count).toBeGreaterThan(0);
    expect(report.executiveDashboard.indicators.githubRequired).toBe(false);
    expect(report.executiveReport.counts.apis).toBeGreaterThan(0);
  });
});
