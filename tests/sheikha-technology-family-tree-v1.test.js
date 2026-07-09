'use strict';

const {
  buildReport
} = require('../tools/activation/activate-sheikha-technology-family-tree-v1');

describe('Sheikha Technology Family Tree V1', () => {
  test('keeps the highest governing layer contractless and linkless', () => {
    const report = buildReport();

    expect(report.sovereignApex.id).toBe('HAKIMIYYAH_QURAN_SUNNAH_APEX');
    expect(report.sovereignApex.foundation).toBe('TAWHID_OF_ALLAH');
    expect(report.sovereignApex.contracts).toEqual([]);
    expect(report.sovereignApex.bindings).toEqual([]);
    expect(report.sovereignApex.runtimeLinks).toEqual([]);
    expect(report.sovereignApex.incomingLinks).toEqual([]);
    expect(report.sovereignApex.outgoingLinks).toEqual([]);
    expect(report.sovereignApex.executableNode).toBe(false);
    expect(report.sovereignApex.noLayerAbove).toBe(true);
  });

  test('does not include the apex in executable graph edges', () => {
    const report = buildReport();
    const apexId = report.sovereignApex.id;

    expect(report.lowerLayerGraph.edges.some((edge) => (
      edge.from === apexId || edge.to === apexId
    ))).toBe(false);
    expect(report.lowerLayerGraph.policy).toContain('sovereign apex is not part of executable graph');
  });

  test('makes Sheikha Language the programming basis for the whole system', () => {
    const report = buildReport();

    expect(report.rootCovenant.basis).toContain('لغة شيخة');
    expect(report.sheikhaLanguagePrimacy.status).toBe('ACTIVE_AS_ALL_SYSTEM_PROGRAMMING_BASIS');
    expect(report.sheikhaLanguagePrimacy.allNewSystemsMustStartWithSheikhaLanguage).toBe(true);
    expect(report.sheikhaLanguagePrimacy.allProgrammingContractsWrittenInSheikhaLanguage).toBe(true);
    expect(report.lowerLayerNodes[0].id).toBe('SHEIKHA_LANGUAGE_ROOT');
  });

  test('requires lower layers to use written Sharia contracts and Quran Sunnah bindings', () => {
    const report = buildReport();

    expect(report.lowerLayerContracts.every((contract) => contract.shariaWrittenContract)).toBe(true);
    expect(report.lowerLayerContracts.every((contract) => contract.writtenInSheikhaLanguage)).toBe(true);
    expect(report.lowerLayerContracts.every((contract) => (
      contract.sources.includes('QURAN') && contract.sources.includes('AUTHENTIC_SUNNAH')
    ))).toBe(true);
    expect(report.lowerLayerGraph.edges.every((edge) => (
      edge.shariaWrittenBinding && edge.sources.includes('QURAN') && edge.sources.includes('AUTHENTIC_SUNNAH')
    ))).toBe(true);
  });

  test('integrates governed AI under Islamic governance without independent fatwa claims', () => {
    const report = buildReport();
    const aiNode = report.lowerLayerNodes.find((node) => node.id === 'GOVERNED_AI_CORE');

    expect(report.rootCovenant.governedAiIntegrated).toBe(true);
    expect(aiNode.aiRole).toBe('decision_support_only');
    expect(report.contractLaw.template.forbiddenClaims).toEqual(expect.arrayContaining([
      'revelation_claim',
      'infallibility_claim',
      'independent_fatwa_claim'
    ]));
    expect(report.contractLaw.religiousRulingBoundary).toContain('لا يصدر فتوى مستقلة');
  });

  test('builds Sheikha technical garden and evidence map', () => {
    const report = buildReport();

    expect(report.status).toBe('ACTIVE_WITH_SHEIKHA_TECHNICAL_ROOT_TREE_GARDEN');
    expect(report.score).toBe(100);
    expect(report.technologyGarden.trees.length).toBeGreaterThanOrEqual(5);
    expect(report.evidence.present).toBeGreaterThanOrEqual(10);
    expect(report.runbook.commands).toContain('npm run -s ops:technology-family-tree:v1');
  });
});
