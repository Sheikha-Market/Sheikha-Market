'use strict';

const { governWarnings } =
require('../warning-governance/sheikha-warning-governance-fabric');

function proposeRepairForWarning(warning) {
  switch (warning.category) {
    case 'CONFIGURATION_CONTRACT':
      return 'merge_settings_preserve_required_contract_keys';
    case 'DICTIONARY_GOVERNANCE':
      return 'merge_domain_dictionary_without_overwriting_settings';
    case 'DEPENDENCY_DRIFT':
      return 'create_dependency_upgrade_proposal_with_tests';
    case 'MODULE_SYSTEM_MODERNIZATION':
      return 'open_commonjs_to_esm_migration_proposal';
    case 'SAFETY_REVIEW_REQUIRED':
      return 'require_manual_security_review_before_patch';
    default:
      return 'record_warning_and_request_triage';
  }
}

function createSelfHealingPlan(warnings = []) {
  const governed = governWarnings(warnings);

  return {
    system: 'SHEIKHA_SELF_HEALING_FABRIC_V2',
    status: 'ACTIVE',
    mode: 'GOVERNED_REPAIR_PLAN_ONLY',
    noSilentSuppression: true,
    totalWarnings: governed.totalWarnings,
    repairs: governed.warnings.map((warning) => ({
      warningId: warning.id,
      category: warning.category,
      repairPlan: proposeRepairForWarning(warning),
      autoApply: false,
      requiresVerification: true,
      requiresEvidence: true
    }))
  };
}

module.exports = {
  createSelfHealingPlan,
  proposeRepairForWarning
};
