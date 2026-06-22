'use strict';

function classifyWarning(message = '') {
  const text = String(message).toLowerCase();

  if (
    text.includes('deprecated') ||
    text.includes('punycode') ||
    text.includes('node-fetch') ||
    text.includes('whatwg-url')
  ) {
    return 'DEPENDENCY_DRIFT';
  }

  if (
    text.includes('settings') ||
    text.includes('todo-tree.ripgrep') ||
    text.includes('workspace')
  ) {
    return 'CONFIGURATION_CONTRACT';
  }

  if (
    text.includes('commonjs') ||
    text.includes('es module') ||
    text.includes('esm')
  ) {
    return 'MODULE_SYSTEM_MODERNIZATION';
  }

  if (
    text.includes('unknown word') ||
    text.includes('cspell')
  ) {
    return 'DICTIONARY_GOVERNANCE';
  }

  if (
    text.includes('exception') ||
    text.includes('permission') ||
    text.includes('safe')
  ) {
    return 'SAFETY_REVIEW_REQUIRED';
  }

  return 'GENERAL_WARNING';
}

function governWarnings(warnings = []) {
  return {
    system: 'SHEIKHA_WARNING_GOVERNANCE_FABRIC_V1',
    status: 'ACTIVE',
    totalWarnings: warnings.length,
    warnings: warnings.map((warning, index) => ({
      id: `WARNING_${index + 1}`,
      message: String(warning.message || warning),
      category: classifyWarning(warning.message || warning),
      severity: warning.severity || 'WARNING',
      requiresAction: true,
      hideOrSuppress: false
    }))
  };
}

module.exports = {
  classifyWarning,
  governWarnings
};
