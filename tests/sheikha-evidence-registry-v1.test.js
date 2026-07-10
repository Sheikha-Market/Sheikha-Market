'use strict';

const evidence = require('../runtime/evidence-registry/sheikha-evidence-registry-v1');

describe('Sheikha Evidence Registry V1', () => {
  test('evidence registry is active and governed', () => {
    const result = evidence.status();
    expect(result.system).toBe('SHEIKHA_EVIDENCE_REGISTRY_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.evidenceBeforeDecision).toBe(true);
    expect(result.governance.noSecretExposure).toBe(true);
  });

  test('schema is active', () => {
    const result = evidence.schema();
    expect(result.schema).toBe('SHEIKHA_EVIDENCE_SCHEMA_V1');
    expect(result.fields).toContain('evidenceId');
    expect(result.fields).toContain('decisionRefs');
  });

  test('security evidence requires human review', () => {
    const result = evidence.createEvidence({
      type: 'security-event',
      message: 'API key token leak risk detected'
    });

    expect(result.registry).toBe('SHEIKHA_EVIDENCE_REGISTRY_V1');
    expect(result.evidence.classification.risk).toBe('HIGH');
    expect(result.governance.decision).toBe('HUMAN_REVIEW_REQUIRED');
  });

  test('evidence linker is active', () => {
    const result = evidence.linkEvidence({
      evidenceId: 'ev-test',
      decisions: ['decision-1'],
      audits: ['audit-1']
    });

    expect(result.engine).toBe('SHEIKHA_EVIDENCE_LINKER_V1');
    expect(result.links.decisions).toContain('decision-1');
  });

  test('research planning keeps candidate sources UNKNOWN until human verification', () => {
    const result = evidence.researchPlan({
      query: 'دليل الخلق والعبودية',
      religiousDomain: true,
      requiredEvidence: ['TEXT_SOURCE', 'ISNAD_OR_QURAN_LOCATION'],
      candidateSources: [{
        sourceId: 'quran-51-56',
        sourceKind: 'quran',
        citation: 'سورة الذاريات: 56',
        text: 'وما خلقت الجن والإنس إلا ليعبدون',
        sourceUrl: 'https://quran.com/51/56'
      }]
    });

    expect(result).toMatchObject({
      status: 'CANDIDATE_SOURCES_FOUND_REVIEW_REQUIRED',
      evidenceStatus: 'UNKNOWN',
      candidateSourcesAreVerifiedEvidence: false,
      verifiedEvidenceProduced: false,
      executionAllowed: false,
      humanFinalResponsibility: true,
      searchExecution: {
        localRegisteredSourceSearchExecuted: false,
        externalSearchExecuted: false,
        allAvailableChannelsClaimedAsExecuted: false
      },
      religiousGovernance: {
        automatedAqidahJudgment: false,
        automatedFatwa: false,
        metaphysicalTruthAdjudicatedBySoftware: false,
        qualifiedScholarReviewRequired: true
      }
    });
    expect(result.candidateSources[0]).toMatchObject({
      sourceKind: 'QURAN',
      registeredReferenceOnly: true,
      verifiedEvidenceForDecision: false,
      interpretationReviewed: false
    });
  });
});
