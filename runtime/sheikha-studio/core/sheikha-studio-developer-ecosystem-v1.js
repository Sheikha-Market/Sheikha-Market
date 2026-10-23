'use strict';

const crypto = require('node:crypto');

const DEVELOPMENT_SURFACES = Object.freeze([
  { id: 'SHEIKHA_IDE', state: 'ACTIVE_FOUNDATION', role: 'AUTHORING_AND_OPERATIONS' },
  { id: 'SHEIKHA_LMM', state: 'ACTIVE_ROUTER', role: 'GOVERNED_MODEL_INTELLIGENCE' },
  { id: 'SHEIKHA_GIT_LAB_HUB', state: 'CONTRACT_ACTIVE', role: 'SOURCE_AND_EXPERIMENT_FEDERATION' },
  { id: 'SHEIKHA_SDK', state: 'FOUNDATION_AVAILABLE', role: 'APPLICATION_INTEGRATION' },
  { id: 'SHEIKHA_CLI', state: 'FOUNDATION_AVAILABLE', role: 'LOCAL_AUTOMATION' },
  { id: 'SHEIKHA_MCP', state: 'FOUNDATION_AVAILABLE', role: 'TOOL_PROTOCOL_GATEWAY' },
  { id: 'SHEIKHA_PHP_TOOLCHAIN', state: 'ADAPTER_REGISTERED', role: 'PHP_AUTHORING_AND_RUNTIME' },
  { id: 'SHEIKHA_API_CLIENT', state: 'FOUNDATION_AVAILABLE', role: 'HTTP_AND_EVENT_INTEGRATION' },
  { id: 'SHEIKHA_VISUAL', state: 'SOURCE_EVIDENCE_ADAPTER', role: 'DRAWING_COMPONENT_PROVENANCE' },
  { id: 'SHEIKHA_NODE', state: 'LOCAL_VERSION_INSPECTOR', role: 'UPSTREAM_NODE_RUNTIME_INTEGRATION' },
  { id: 'SHEIKHA_DOCKER', state: 'READ_ONLY_PROFILE_PREPARED', role: 'OPTIONAL_CONTAINER_INSPECTION' },
  { id: 'SHEIKHA_TEST_AND_QUALITY', state: 'FOUNDATION_AVAILABLE', role: 'TEST_LINT_SECURITY_EVIDENCE' },
]);

const LANGUAGE_GROUPS = Object.freeze({
  GENERAL: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Dart'],
  WEB_DATA: ['HTML', 'CSS', 'SQL', 'GraphQL', 'JSON', 'YAML', 'XML', 'Markdown'],
  SHELL_BUILD: ['Bash', 'PowerShell', 'Make', 'CMake', 'Nix', 'Dockerfile'],
  SCIENCE_DATA: ['R', 'Julia', 'MATLAB', 'SAS', 'Wolfram Language', 'Fortran'],
  SYSTEMS_HARDWARE: ['Assembly', 'Zig', 'Ada', 'D', 'VHDL', 'Verilog', 'SystemVerilog', 'OpenCL', 'CUDA'],
  FUNCTIONAL_LOGIC: ['Haskell', 'Elixir', 'Erlang', 'F#', 'OCaml', 'Clojure', 'Scala', 'Common Lisp', 'Prolog'],
  ENTERPRISE_LEGACY: ['COBOL', 'PL/SQL', 'ABAP', 'Delphi/Object Pascal', 'Visual Basic .NET'],
  SPECIALIZED: ['Solidity', 'Move', 'Raku', 'Crystal', 'Nim', 'Lua', 'GDScript', 'Sheikha'],
});

const COMMON = new Set(['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C', 'C++', 'Go', 'PHP', 'HTML', 'CSS', 'SQL', 'JSON', 'Bash']);
const RARE = new Set(['Ada', 'D', 'VHDL', 'Verilog', 'SystemVerilog', 'Fortran', 'COBOL', 'ABAP', 'Common Lisp', 'Prolog', 'Raku', 'Crystal', 'Nim', 'Move']);
const VERY_RARE = new Set(['Sheikha']);

function classifyRarity(name) {
  if (VERY_RARE.has(name)) return { tier: 'VERY_RARE', score: 95 };
  if (RARE.has(name)) return { tier: 'RARE', score: 75 };
  if (COMMON.has(name)) return { tier: 'NOT_RARE', score: 15 };
  return { tier: 'SPECIALIZED_OR_MODERATELY_RARE', score: 45 };
}

function primaryUses(group) {
  const map = {
    GENERAL: ['applications', 'services', 'libraries'],
    WEB_DATA: ['web', 'data-contracts', 'documents'],
    SHELL_BUILD: ['automation', 'build', 'delivery'],
    SCIENCE_DATA: ['science', 'statistics', 'numerical-computing'],
    SYSTEMS_HARDWARE: ['systems', 'firmware', 'accelerated-computing'],
    FUNCTIONAL_LOGIC: ['distributed-systems', 'compilers', 'formal-logic'],
    ENTERPRISE_LEGACY: ['enterprise', 'financial-systems', 'modernization'],
    SPECIALIZED: ['domain-specific', 'emerging-platforms', 'sheikha-language'],
  };
  return map[group];
}

function buildLanguageCatalog(query = {}) {
  const languages = Object.entries(LANGUAGE_GROUPS).flatMap(([group, names]) =>
    names.map((name) => ({
      id: name.toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_'),
      name,
      group,
      rarity: classifyRarity(name),
      uses: primaryUses(group),
      registrationState: 'CATALOGED_NOT_RUNTIME_GUARANTEED',
    })));
  const term = String(query.search || '').trim().toLowerCase();
  const tier = String(query.rarity || '').trim().toUpperCase();
  const filtered = languages.filter((language) =>
    (!term || `${language.name} ${language.group} ${language.uses.join(' ')}`.toLowerCase().includes(term))
    && (!tier || language.rarity.tier === tier));
  return {
    system: 'SHEIKHA_PROGRAMMING_LANGUAGE_CATALOG_V1',
    methodology: {
      scope: 'CURATED_EXTENSIBLE_CATALOG_NOT_CLAIMED_AS_ALL_LANGUAGES_IN_EXISTENCE',
      rarityMeaning: 'Relative scarcity of ecosystem, available talent, tooling, and domain adoption',
      rarityIsQualityRanking: false,
      runtimeSupportRequiresIndependentVerification: true,
    },
    totalRegistered: languages.length,
    returned: filtered.length,
    languages: filtered,
  };
}

function buildDeveloperEcosystemStatus() {
  const gitProviderCredentialsConfigured = ['GITHUB_TOKEN', 'GITLAB_TOKEN', 'BITBUCKET_TOKEN']
    .some((key) => Boolean(process.env[key]));
  const base = {
    system: 'SHEIKHA_STUDIO_DEVELOPER_ECOSYSTEM_V1',
    status: 'INTEGRATED_FOUNDATION_ACTIVE',
    surfaces: DEVELOPMENT_SURFACES,
    integrations: {
      ideToLmm: 'ACTIVE_ROUTING_CONTRACT',
      ideToGitLabHub: 'ACTIVE_LOCAL_CONTRACT',
      sdkCliMcpSharedContracts: true,
      phpRegistered: true,
    },
    externalGitProviderCredentialsPresent: gitProviderCredentialsConfigured,
    externalGitProviderLiveConnected: false,
    repositoryInspectionEndpoint: '/api/sheikha/model-hub/v1/integrations/status',
    highImpactActionsRequireApproval: true,
    productionReady: false,
    blockers: [
      'AUTHENTICATED_USER_SESSION_REQUIRED',
      'ISOLATED_COMMAND_RUNNER_REQUIRED',
      'EXTERNAL_GIT_PROVIDER_ROUND_TRIP_REQUIRED',
      'LOAD_SECURITY_AND_RECOVERY_EVIDENCE_REQUIRED',
    ],
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = {
  DEVELOPMENT_SURFACES,
  LANGUAGE_GROUPS,
  buildDeveloperEcosystemStatus,
  buildLanguageCatalog,
};
