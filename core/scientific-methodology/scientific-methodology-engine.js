'use strict';

const methodologyEngine = Object.freeze({
  system: 'SHEIKHA_SCIENTIFIC_METHODOLOGY_ENGINE_V1',
  status: 'ACTIVE',
  mode: 'READ_ANALYZE_LEARN_MONITOR_MEASURE_TRANSFER_RENEW_IMPROVE',
  note: 'The engine does not possess consciousness or independent knowledge; it processes inputs, records evidence, validates methods, and supports continuous improvement.',
  productionLine: [
    'read',
    'classify',
    'computational-learn',
    'monitor',
    'measure',
    'transfer-knowledge',
    'analyze',
    'extract-evidence',
    'map-methodology',
    'validate',
    'score',
    'record',
    'improve',
    'propose-methodology',
    'renew-science',
    'improve-science'
  ],
  domains: [
    'Islamic values',
    'mathematics',
    'logic',
    'statistics',
    'economics',
    'commerce',
    'supply chain',
    'engineering',
    'computer science',
    'data science',
    'AI governance',
    'quality',
    'risk',
    'law',
    'ethics',
    'management'
  ],
  principles: [
    'quran-and-sunnah-reference',
    'truthfulness',
    'evidence',
    'measurement',
    'repeatability',
    'validation',
    'no harm',
    'benefit',
    'continuous improvement',
    'proofs-and-burhan',
    'knowledge-transfer',
    'science-renewal'
  ]
});

function getScientificMethodologyEngine() {
  return methodologyEngine;
}

function runMethodologyPipeline(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('STRUCTURED_METHODOLOGY_INPUT_REQUIRED');
  const validText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 10000;
  const text = typeof input.text === 'string' ? input.text.trim() : '';
  if (text.length > 10000) throw new RangeError('METHODOLOGY_TEXT_TOO_LONG');
  const domain = validText(input.domain) ? input.domain : 'general';
  const protocol = input.protocol && typeof input.protocol === 'object' && !Array.isArray(input.protocol) ? input.protocol : {};
  const requiredText = ['question', 'hypothesis', 'scope', 'measurement', 'validation', 'limitations', 'ownerId', 'revision'];
  const requiredLists = ['definitions', 'assumptions', 'procedure', 'references'];
  const missingFields = [
    ...requiredText.filter(key => !validText(protocol[key])),
    ...requiredLists.filter(key => !Array.isArray(protocol[key]) || protocol[key].length === 0 || protocol[key].length > 100 || !protocol[key].every(validText))
  ];
  const completenessScore = Math.round(100 * (1 - missingFields.length / (requiredText.length + requiredLists.length)));
  // Structural coverage and keyword presence are not evidence of truth.
  const quranSunnahReference = /quran|sunnah|القرآن|السنة|الكتاب|حديث|آية/i.test(text);

  return {
    system: methodologyEngine.system,
    status: missingFields.length ? 'PROTOCOL_INCOMPLETE' : 'STRUCTURED_DRAFT_REQUIRES_SCIENTIFIC_REVIEW',
    domain,
    steps: methodologyEngine.productionLine,
    record: {
      inputLength: text.length,
      evidenceScore: null,
      completenessScore,
      completenessMeaning: 'REQUIRED_PROTOCOL_FIELD_COVERAGE_ONLY',
      missingFields,
      scientificValidityVerified: false,
      referencesVerified: false,
      religiousRulingIssued: false,
      improvementNeeded: completenessScore < 100,
      quranSunnahReference,
      monitoringStatus: 'NOT_CONNECTED',
      measurementStatus: 'NOT_EXECUTED',
      knowledgeTransferStatus: missingFields.length ? 'DRAFT_INCOMPLETE' : 'DRAFT_REQUIRES_EDUCATOR_REVIEW',
      scienceRenewalStatus: 'CONTROLLED_PROPOSAL_ONLY',
      recommendation:
        completenessScore < 100
          ? 'Complete the explicit protocol fields; adding prose does not supply evidence.'
          : 'Review sources, rights, measurement, reproducibility and educational safety before use.'
    }
  };
}

module.exports = {
  getScientificMethodologyEngine,
  runMethodologyPipeline
};
