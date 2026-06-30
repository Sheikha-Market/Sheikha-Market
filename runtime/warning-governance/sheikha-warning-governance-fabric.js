'use strict';

const WARNING_PROFILES = {
  DEPENDENCY_DRIFT: {
    rootCause: 'Runtime dependency or transitive package changed, aged, or uses deprecated APIs.',
    consequences: [
      'future Node.js upgrade can turn the warning into runtime failure',
      'security fixes may be missed because the dependency tree is not understood',
      'packaging tools can emit noisy warnings that hide real failures'
    ],
    historicalFailureModes: [
      'deprecated URL parsing caused malformed callback URLs in connector flows',
      'stale fetch libraries caused ESM/CommonJS incompatibility after a Node upgrade',
      'transitive punycode warnings masked a packaging regression in VSIX builds'
    ],
    safeResolution: [
      'identify direct versus transitive owner with npm ls',
      'upgrade or replace direct dependency when tests cover the path',
      'pin and document transitive warning when upstream fix is not yet available'
    ],
    preventionControls: [
      'dependency guardian before release',
      'lockfile review for warning-producing packages',
      'runtime smoke test after package or Node upgrade'
    ]
  },
  CONFIGURATION_CONTRACT: {
    rootCause: 'Workspace or runtime configuration was overwritten or drifted from the required contract.',
    consequences: [
      'IDE tools disappear or use a slower fallback',
      'validators pass locally but fail in another editor session',
      'missing configuration can silently disable governance checks'
    ],
    historicalFailureModes: [
      'settings file replacement removed todo-tree.ripgrep and broke task discovery',
      'extension activation failed after a command was appended outside activate()',
      'workspace interpreter drift caused different lint and test behavior'
    ],
    safeResolution: [
      'merge configuration instead of replacing whole files',
      'validate required keys before commit',
      'open the affected tool after reload and confirm behavior'
    ],
    preventionControls: [
      'settings validator in governance verify',
      'configuration diff review',
      'reload and smoke test after extension changes'
    ]
  },
  MODULE_SYSTEM_MODERNIZATION: {
    rootCause: 'CommonJS and ES module boundaries are mixed without a migration plan.',
    consequences: [
      'import or require can fail after package type changes',
      'bundlers may duplicate modules or drop default exports',
      'extension runtime can work in tests but fail when packaged'
    ],
    historicalFailureModes: [
      'VS Code extension packaged an entry file that did not match the runtime source',
      'a CommonJS module exposed a shape different from the ESM consumer expectation',
      'dependency ESM-only upgrade broke a synchronous require path'
    ],
    safeResolution: [
      'keep current module boundary stable for hot fixes',
      'migrate one package boundary at a time with package tests',
      'verify node --check, Jest, and packaged extension entrypoints'
    ],
    preventionControls: [
      'module boundary inventory',
      'packaged artifact smoke test',
      'no package type flip without migration issue'
    ]
  },
  DICTIONARY_GOVERNANCE: {
    rootCause: 'Domain-specific Arabic, English, or Sheikha terms are not registered in the project dictionary.',
    consequences: [
      'real spelling errors become harder to notice',
      'reviewers may suppress language tooling entirely',
      'domain vocabulary becomes inconsistent across docs and UI'
    ],
    historicalFailureModes: [
      'project-specific terms were repeatedly marked as typos and ignored',
      'manual spelling fixes changed official product names',
      'unregistered Arabic transliterations diverged across documentation'
    ],
    safeResolution: [
      'add approved domain terms to the dictionary',
      'fix actual typos near the warning',
      'keep official names consistent with canonical docs'
    ],
    preventionControls: [
      'dictionary update with new product names',
      'spellcheck in docs review',
      'canonical terminology registry'
    ]
  },
  SAFETY_REVIEW_REQUIRED: {
    rootCause: 'The warning touches permission, exception, destructive action, or safety boundary behavior.',
    consequences: [
      'unsafe command execution or data exposure can happen if ignored',
      'fallback behavior can bypass intended approvals',
      'incident recovery becomes harder without audit evidence'
    ],
    historicalFailureModes: [
      'permission assumptions caused a command to fail only in managed sandboxes',
      'broad fallback path attempted external access without authorization',
      'missing audit trail made it unclear whether a risky action ran'
    ],
    safeResolution: [
      'reproduce in the same permission mode',
      'add explicit guard or approval boundary',
      'write verification evidence before promotion'
    ],
    preventionControls: [
      'least privilege execution',
      'approval-gated high-risk commands',
      'audit log for safety-related fallback paths'
    ]
  },
  GENERAL_WARNING: {
    rootCause: 'A warning was emitted without a known category and needs triage before suppression.',
    consequences: [
      'unknown warning may hide an early defect',
      'suppression can normalize operational drift',
      'future maintainers lose the reason for accepting risk'
    ],
    historicalFailureModes: [
      'generic warning later mapped to dependency drift',
      'ignored console noise hid a route mount failure',
      'unclassified warning delayed root cause analysis'
    ],
    safeResolution: [
      'capture exact message and source',
      'classify or create a new category',
      'add a regression test when behavior is affected'
    ],
    preventionControls: [
      'warning register review',
      'new category for repeated messages',
      'no blanket suppression'
    ]
  }
};

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

function analyzeWarning(warning = {}, index = 0) {
  const message = String(warning.message || warning);
  const category = classifyWarning(message);
  const profile = WARNING_PROFILES[category] || WARNING_PROFILES.GENERAL_WARNING;

  return {
    id: `WARNING_${index + 1}`,
    message,
    category,
    severity: warning.severity || 'WARNING',
    requiresAction: true,
    hideOrSuppress: false,
    rootCause: profile.rootCause,
    consequences: profile.consequences,
    historicalFailureModes: profile.historicalFailureModes,
    safeResolution: profile.safeResolution,
    preventionControls: profile.preventionControls,
    verification: {
      reproduceBeforeFix: true,
      testAfterFix: true,
      documentAcceptedRisk: true,
      suppressOnlyWithEvidence: true
    }
  };
}

function governWarnings(warnings = []) {
  const analyzed = warnings.map((warning, index) => analyzeWarning(warning, index));

  return {
    system: 'SHEIKHA_WARNING_GOVERNANCE_FABRIC_V1',
    status: 'ACTIVE',
    totalWarnings: warnings.length,
    warningPolicy: {
      doNotMinimizeWarnings: true,
      rootCauseRequired: true,
      consequencesRequired: true,
      safeResolutionRequired: true,
      regressionPreventionRequired: true
    },
    summary: {
      actionRequiredCount: analyzed.filter((item) => item.requiresAction).length,
      suppressibleCount: analyzed.filter((item) => item.hideOrSuppress).length,
      categories: analyzed.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {})
    },
    rootCauseRegister: analyzed.map((item) => ({
      id: item.id,
      category: item.category,
      rootCause: item.rootCause,
      firstConsequence: item.consequences[0],
      firstPreventionControl: item.preventionControls[0]
    })),
    warnings: analyzed
  };
}

module.exports = {
  classifyWarning,
  analyzeWarning,
  WARNING_PROFILES,
  governWarnings
};
