'use strict';

const EVIDENCE_TYPES = Object.freeze([
  'log',
  'test-result',
  'audit-record',
  'governance-decision',
  'deployment-record',
  'security-event',
  'knowledge-asset',
  'impact-measurement'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  evidenceBeforeDecision: true,
  governanceBeforeExecution: true,
  noSecretExposure: true,
  auditEverySensitiveEvidence: true,
  humanApprovalForHighRisk: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true
});

const RESEARCH_CHANNELS = Object.freeze([
  'LOCAL_REGISTERED_SOURCES',
  'LOCAL_QURAN_INDEX',
  'LOCAL_HADITH_METADATA',
  'QUALIFIED_SCHOLAR_REVIEW',
  'DOMAIN_EXPERT_REVIEW',
  'ACADEMIC_AND_SCIENTIFIC_INDEXES',
  'AUTHORIZED_WEB_RESEARCH'
]);

function cleanText(value, maxLength = 1200) {
  const withoutControlCharacters = Array.from(String(value || ''))
    .map((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127 ? ' ' : character;
    })
    .join('');
  return withoutControlCharacters
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanList(value, maxItems = 40, maxLength = 240) {
  return Array.isArray(value)
    ? value.filter(Boolean).slice(0, maxItems)
      .map((item) => cleanText(item, maxLength))
    : [];
}

function normalizeCandidateSource(source = {}, index = 0) {
  const sourceKind = cleanText(source.sourceKind || source.kind, 80).toUpperCase() ||
    'REFERENCE';
  return {
    sourceId: cleanText(source.sourceId || source.id, 160) || `candidate-${index + 1}`,
    sourceKind,
    title: cleanText(source.title || source.arabicPrinciple, 300),
    citation: cleanText(source.citation || source.reference, 300),
    text: cleanText(source.text || source.arabicText, 1000),
    sourceUrl: cleanText(source.sourceUrl, 500),
    topics: cleanList(source.topics || source.evidenceTopics, 20, 120),
    provenance: {
      registry: cleanText(source.provenance?.registry, 160),
      sourceType: cleanText(source.provenance?.sourceType, 100),
      textIntegrityStatus: cleanText(
        source.provenance?.textIntegrityStatus,
        120
      ) || 'REQUIRES_HUMAN_VERIFICATION',
      retrievedAt: cleanText(source.provenance?.retrievedAt, 80) || null
    },
    isnad: {
      applicable: sourceKind === 'SUNNAH',
      narrator: cleanText(source.isnad?.narrator, 200) || null,
      collection: cleanText(source.isnad?.collection, 200) || null,
      number: cleanText(source.isnad?.number, 80) || null,
      grade: cleanText(source.isnad?.grade, 100) || null,
      grader: cleanText(source.isnad?.grader, 200) || null,
      status: cleanText(source.isnad?.status, 120) ||
        (sourceKind === 'SUNNAH'
          ? 'MISSING_REQUIRES_HADITH_REVIEW'
          : 'NOT_APPLICABLE')
    },
    registeredReferenceOnly: true,
    verifiedEvidenceForDecision: false,
    interpretationReviewed: false
  };
}

function researchPlan(input = {}) {
  const query = cleanText(input.query || input.claim || input.purpose, 1600);
  const requiredEvidence = cleanList(input.requiredEvidence, 40, 200);
  const candidateSources = Array.isArray(input.candidateSources)
    ? input.candidateSources.slice(0, 50).map(normalizeCandidateSource)
    : [];
  const requestedChannels = cleanList(input.availableChannels, 20, 100);
  const enabledChannels = requestedChannels.length > 0
    ? RESEARCH_CHANNELS.filter((channel) => requestedChannels.includes(channel))
    : [...RESEARCH_CHANNELS];
  const networkAvailable = input.networkAvailable === true;
  const externalSearchAuthorized = input.externalSearchAuthorized === true;
  const religiousDomain = input.religiousDomain === true;
  const localSearchExecuted = Boolean(query) && input.localSearchExecuted === true;
  const quranIndexReferenced = candidateSources.some(
    (source) => source.sourceKind === 'QURAN'
  );
  const hadithMetadataReferenced = candidateSources.some(
    (source) => source.sourceKind === 'SUNNAH'
  );

  const channels = RESEARCH_CHANNELS.map((channel) => {
    let status = enabledChannels.includes(channel) ? 'AVAILABLE' : 'NOT_REQUESTED';
    if (channel === 'LOCAL_REGISTERED_SOURCES' && enabledChannels.includes(channel)) {
      status = localSearchExecuted ? 'SEARCH_EXECUTED' : 'AVAILABLE_NOT_EXECUTED';
    } else if (channel === 'LOCAL_QURAN_INDEX' && enabledChannels.includes(channel)) {
      status = quranIndexReferenced
        ? 'REGISTERED_INDEX_REFERENCED'
        : 'AVAILABLE_NOT_EXECUTED';
    } else if (channel === 'LOCAL_HADITH_METADATA' && enabledChannels.includes(channel)) {
      status = hadithMetadataReferenced
        ? 'REGISTERED_METADATA_REFERENCED'
        : 'AVAILABLE_NOT_EXECUTED';
    } else if (channel === 'QUALIFIED_SCHOLAR_REVIEW' && enabledChannels.includes(channel)) {
      status = religiousDomain ? 'REQUIRED_NOT_EXECUTED' : 'AVAILABLE_IF_NEEDED';
    } else if (channel === 'DOMAIN_EXPERT_REVIEW' && enabledChannels.includes(channel)) {
      status = 'REQUIRED_WHEN_DOMAIN_SPECIFIC';
    } else if ([
      'ACADEMIC_AND_SCIENTIFIC_INDEXES',
      'AUTHORIZED_WEB_RESEARCH'
    ].includes(channel) && enabledChannels.includes(channel)) {
      status = networkAvailable && externalSearchAuthorized
        ? 'AUTHORIZED_CONNECTOR_REQUIRED_NOT_EXECUTED'
        : 'DEFERRED_UNAVAILABLE_OR_UNAUTHORIZED';
    }
    return { channel, status };
  });

  return {
    system: 'SHEIKHA_EVIDENCE_RESEARCH_PLAN_V1',
    status: !query
      ? 'RESEARCH_QUERY_REQUIRED'
      : candidateSources.length > 0
        ? 'CANDIDATE_SOURCES_FOUND_REVIEW_REQUIRED'
        : 'EVIDENCE_SEARCH_CONTINUES',
    language: 'ar',
    arabicPrimary: true,
    query,
    evidenceStatus: 'UNKNOWN',
    requiredEvidence,
    candidateSources,
    candidateSourceCount: candidateSources.length,
    channels,
    searchExecution: {
      localRegisteredSourceSearchExecuted: localSearchExecuted,
      externalSearchExecuted: false,
      networkAvailable,
      externalSearchAuthorized,
      allAvailableChannelsClaimedAsExecuted: false
    },
    verificationWorkflow: [
      'ثبت النص والموضع والنسخة دون اقتطاع مخل.',
      'في الحديث: ثبت الراوي والمصدر والرقم والدرجة ومن حكم بها.',
      'افصل النص المنقول عن التفسير والاستنباط والحجة العقلية.',
      'اختبر المقدمات والنتيجة واعرض الاعتراضات والحدود.',
      'تحقق من الدليل التجريبي بمنهج قابل للتكرار عند وجود دعوى تجريبية.',
      'اعرض المسألة الشرعية على عالم مؤهل، والتخصصية على خبير مجال.',
      'لا تحول المرشح إلى VERIFIED إلا بتوقيع مراجعة قابل للتتبع.'
    ],
    epistemicSeparation: {
      quranTextReference: 'PRIMARY_REVELATORY_REFERENCE_REQUIRES_TEXT_INTEGRITY',
      sunnahReference: 'REQUIRES_ISNAD_SOURCE_NUMBER_GRADE_AND_GRADER',
      interpretation: 'HUMAN_SCHOLARLY_INTERPRETATION',
      rationalInference: 'REVIEWABLE_ARGUMENT_NOT_REVELATION',
      empiricalObservation: 'MEASUREMENT_DOES_NOT_BECOME_REVELATION',
      unresolvedClaim: 'UNKNOWN'
    },
    religiousGovernance: {
      religiousDomain,
      automatedAqidahJudgment: false,
      automatedFatwa: false,
      metaphysicalTruthAdjudicatedBySoftware: false,
      beliefCompelledBySoftware: false,
      qualifiedScholarReviewRequired: religiousDomain,
      quranOrSunnahConvertedToExecutableReligiousAuthority: false
    },
    candidateSourcesAreVerifiedEvidence: false,
    verifiedEvidenceProduced: false,
    decisionGranted: false,
    executionAllowed: false,
    humanFinalResponsibility: true,
    sensitiveQueryPersisted: false
  };
}

function status() {
  return {
    system: 'SHEIKHA_EVIDENCE_REGISTRY_V1',
    status: 'ACTIVE',
    level: 'EVIDENCE_FOUNDATION',
    above: 'SHEIKHA_MASTER_LOG_V1',
    connectsTo: [
      'SHEIKHA_MASTER_LOG_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_AUDIT_LEDGER',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1'
    ],
    evidenceTypes: EVIDENCE_TYPES,
    governance: GOVERNANCE,
    research: {
      status: 'ACTIVE_RESEARCH_PLANNING_ONLY',
      channels: RESEARCH_CHANNELS,
      candidateSourceIsVerifiedEvidence: false,
      externalSearchExecutedByRegistry: false,
      humanVerificationRequired: true
    }
  };
}

function schema() {
  return {
    schema: 'SHEIKHA_EVIDENCE_SCHEMA_V1',
    status: 'ACTIVE',
    fields: [
      'evidenceId',
      'timestamp',
      'source',
      'owner',
      'type',
      'classification',
      'sensitivity',
      'retentionClass',
      'message',
      'logRefs',
      'decisionRefs',
      'auditRefs',
      'knowledgeRefs',
      'impactRefs',
      'correlationId'
    ]
  };
}

function classify(input = {}) {
  const message = String(input.message || '').toLowerCase();
  const type = String(input.type || '').toLowerCase();

  const sensitive =
    message.includes('secret') ||
    message.includes('token') ||
    message.includes('api key') ||
    message.includes('password') ||
    type.includes('security');

  const highRisk =
    sensitive ||
    message.includes('leak') ||
    message.includes('breach') ||
    message.includes('critical') ||
    message.includes('production');

  return {
    engine: 'SHEIKHA_EVIDENCE_CLASSIFIER_V1',
    status: 'ACTIVE',
    classification: {
      type: EVIDENCE_TYPES.includes(type) ? type : 'log',
      sensitivity: sensitive ? 'restricted' : 'standard',
      risk: highRisk ? 'HIGH' : 'LOW',
      retentionClass: sensitive ? 'restricted-audit' : 'standard-audit',
      requiresHumanReview: highRisk
    }
  };
}

function createEvidence(input = {}) {
  const result = classify(input);
  const now = new Date().toISOString();

  return {
    registry: 'SHEIKHA_EVIDENCE_REGISTRY_V1',
    status: 'ACCEPTED_REFERENCE',
    evidence: {
      evidenceId: input.evidenceId || `ev-${Date.now()}`,
      timestamp: input.timestamp || now,
      source: input.source || 'sheikha-runtime',
      owner: input.owner || 'system',
      type: result.classification.type,
      message: String(input.message || '').slice(0, 500),
      classification: result.classification,
      refs: {
        logRefs: input.logRefs || [],
        decisionRefs: input.decisionRefs || [],
        auditRefs: input.auditRefs || [],
        knowledgeRefs: input.knowledgeRefs || [],
        impactRefs: input.impactRefs || []
      },
      correlationId: input.correlationId || 'pending-correlation'
    },
    governance: {
      evidenceBeforeDecision: true,
      noSecretExposure: true,
      requiresHumanReview: result.classification.requiresHumanReview,
      decision: result.classification.requiresHumanReview
        ? 'HUMAN_REVIEW_REQUIRED'
        : 'GOVERNED_ACCEPT'
    }
  };
}

function linkEvidence(input = {}) {
  return {
    engine: 'SHEIKHA_EVIDENCE_LINKER_V1',
    status: 'ACTIVE',
    evidenceId: input.evidenceId || 'pending-evidence',
    links: {
      logs: input.logs || [],
      decisions: input.decisions || [],
      audits: input.audits || [],
      knowledge: input.knowledge || [],
      impact: input.impact || []
    },
    rule: 'Evidence must remain traceable from event to decision to audit to impact.'
  };
}

module.exports = {
  status,
  schema,
  classify,
  createEvidence,
  linkEvidence,
  researchPlan
};
