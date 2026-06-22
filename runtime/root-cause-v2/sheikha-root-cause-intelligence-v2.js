'use strict';

function analyzeRootCause(input = {}) {
  const message = String(input.message || '');

  const category =
    message.includes('CommonJS') || message.includes('ES module')
      ? 'MODULE_SYSTEM_MODERNIZATION'
      : message.includes('Unknown word')
        ? 'DICTIONARY_GOVERNANCE'
        : message.includes('punycode') || message.includes('deprecated')
          ? 'DEPENDENCY_DRIFT'
          : 'GENERAL';

  return {
    system: 'SHEIKHA_ROOT_CAUSE_INTELLIGENCE_V2',
    status: 'ACTIVE',
    category,
    source: input.source || 'unknown',
    message,
    requiresEvidence: true,
    requiresVerification: true,
    suppressWarning: false
  };
}

module.exports = { analyzeRootCause };
