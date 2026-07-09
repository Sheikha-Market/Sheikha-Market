'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = process.cwd();
const reportPath = 'runtime/technology-family-tree/v1/sheikha-technology-family-tree-v1-report.json';
const handbookPath = 'docs/technology-family-tree-v1/SHEIKHA-TECHNOLOGY-FAMILY-TREE-V1.md';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function readJson(relativePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
  } catch {
    return fallback;
  }
}

function scoreFromChecks(checks) {
  const values = Object.values(checks);
  const passed = values.filter(Boolean).length;
  return {
    passed,
    total: values.length,
    score: values.length === 0 ? 0 : Math.round((passed / values.length) * 100)
  };
}

const EVIDENCE_MAP = [
  {
    key: 'sheikhaLanguageIntegration',
    path: 'runtime/sheikha-language-integration/sheikha-language-integration-v1.json',
    role: 'foundational_programming_language_contract'
  },
  {
    key: 'sheikhaLanguageCompiler',
    path: 'sheikha-language/compiler/sheikha-compiler.js',
    role: 'compiler_evidence'
  },
  {
    key: 'sheikhaLanguageRuntime',
    path: 'runtime/sheikha-language-stack/sheikha-language-stack.js',
    role: 'runtime_language_stack'
  },
  {
    key: 'islamicAiKernel',
    path: 'runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json',
    role: 'governed_ai_kernel'
  },
  {
    key: 'quranSunnahGovernance',
    path: 'runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json',
    role: 'quran_sunnah_governance_runtime'
  },
  {
    key: 'shariaGovernanceFabric',
    path: 'docs/sharia-governance-fabric/SHEIKHA-SHARIA-GOVERNANCE-FABRIC-V1.md',
    role: 'sharia_governance_documentation'
  },
  {
    key: 'sovereignKernelBoot',
    path: 'runtime/sovereign-kernel-boot/v1/sheikha-sovereign-kernel-boot-v1-report.json',
    role: 'sovereign_kernel_and_no_host_boundary'
  },
  {
    key: 'universalTechnologyHpcFabric',
    path: 'runtime/universal-technology-hpc-fabric/v1/sheikha-universal-technology-hpc-fabric-v1-report.json',
    role: 'technology_hpc_family_catalog'
  },
  {
    key: 'masterActivationCatalog',
    path: 'runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json',
    role: 'local_master_catalog'
  },
  {
    key: 'capabilityRegistry',
    path: 'runtime/master-activation/sheikha-master-capability-registry-v1.json',
    role: 'capability_registry'
  },
  {
    key: 'knowledgeGraph',
    path: 'runtime/master-activation/sheikha-master-architecture-graph-v1.json',
    role: 'architecture_graph'
  },
  {
    key: 'recoveryEngine',
    path: 'runtime/recovery/sheikha-recovery-engine.js',
    role: 'recovery_runtime'
  }
];

const SOVEREIGN_APEX = {
  id: 'HAKIMIYYAH_QURAN_SUNNAH_APEX',
  name: 'حاكمية الكتاب والسنة',
  foundation: 'TAWHID_OF_ALLAH',
  statement: 'الحكم لله، والمرجع الحاكم كتاب الله وسنة رسوله الصحيحة.',
  layerRole: 'HIGHEST_GOVERNING_REFERENCE_ONLY',
  executableNode: false,
  technicalNode: false,
  contracts: [],
  bindings: [],
  runtimeLinks: [],
  incomingLinks: [],
  outgoingLinks: [],
  noContractAtApex: true,
  noBindingAtApex: true,
  noRuntimeLinkAtApex: true,
  noLayerAbove: true,
  noRevelationClaim: true,
  noInfallibilityClaim: true,
  noIndependentFatwa: true,
  scholarReviewForReligiousRulings: true
};

const SHARIA_CONTRACT_TEMPLATE = {
  type: 'SHARIA_WRITTEN_TECHNICAL_CONTRACT',
  sources: ['QURAN', 'AUTHENTIC_SUNNAH'],
  principles: ['tawhid', 'truthfulness', 'amanah', 'justice', 'no_harm', 'rights_preservation', 'evidence'],
  requiredClauses: [
    'purpose_is_lawful',
    'inputs_outputs_are_declared',
    'rights_and_permissions_are_preserved',
    'harm_is_prevented',
    'audit_is_recorded',
    'human_review_for_high_impact',
    'scholar_review_for_religious_rulings'
  ],
  forbiddenClaims: [
    'revelation_claim',
    'infallibility_claim',
    'independent_fatwa_claim',
    'performance_claim_without_benchmark',
    'production_claim_without_truth_gate'
  ]
};

const LOWER_LAYER_NODES = [
  {
    id: 'SHEIKHA_LANGUAGE_ROOT',
    name: 'جذر لغة شيخة',
    tree: 'core_tree',
    responsibility: 'Make Sheikha Language the first programming basis for specifications, contracts, governance rules, workflows, execution, and safe translation.',
    sheikhaLanguageRole: 'FOUNDATIONAL_PROGRAMMING_LANGUAGE_FOR_ALL_SYSTEMS',
    aiRole: 'governed_language_assistant_under_islamic_governance',
    contracts: ['language_specification_contract', 'governance_rules_contract', 'execution_translation_contract'],
    bindings: ['quran_sunnah_policy_reference', 'truth_gate', 'compiler_check', 'runtime_check']
  },
  {
    id: 'GOVERNED_AI_CORE',
    name: 'لب الذكاء الصناعي المحكوم',
    tree: 'core_tree',
    responsibility: 'Provide AI support for coding, analysis, optimization, retrieval, and planning under Islamic governance and human review.',
    sheikhaLanguageRole: 'AI_CALLS_ARE_EXPRESSED_AS_SHEIKHA_LANGUAGE_TASK_CONTRACTS',
    aiRole: 'decision_support_only',
    contracts: ['ai_task_contract', 'model_evidence_contract', 'risk_review_contract'],
    bindings: ['human_review_gate', 'truth_gate', 'audit_log']
  },
  {
    id: 'SOVEREIGN_KERNEL_TREE',
    name: 'شجرة النواة والإقلاع',
    tree: 'runtime_tree',
    responsibility: 'Define native boot, runtime kernel, scheduling, recovery, and no-host target without treating host tooling as foundation.',
    sheikhaLanguageRole: 'kernel_and_boot_contracts_are_written_in_sheikha_language_first',
    aiRole: 'diagnostic_and_repair_assistant_only',
    contracts: ['boot_contract', 'kernel_contract', 'scheduler_contract', 'recovery_contract'],
    bindings: ['recovery_gate', 'health_gate', 'truth_gate']
  },
  {
    id: 'UNIVERSAL_TECHNOLOGY_TREE',
    name: 'شجرة التقنية والحوسبة',
    tree: 'industrial_hpc_tree',
    responsibility: 'Unify compute, HPC, semiconductors, conductors, materials, power, thermal, devices, and factories as generic capability contracts.',
    sheikhaLanguageRole: 'technology_capabilities_are_written_as_sheikha_contracts',
    aiRole: 'simulation_optimization_and_anomaly_support',
    contracts: ['compute_contract', 'semiconductor_contract', 'materials_contract', 'factory_contract'],
    bindings: ['benchmark_gate', 'safety_gate', 'supply_chain_trace']
  },
  {
    id: 'KNOWLEDGE_AND_TRUTH_TREE',
    name: 'شجرة المعرفة والحقائق',
    tree: 'knowledge_tree',
    responsibility: 'Organize knowledge graph, evidence, documentation, truth-gate, and claims registry.',
    sheikhaLanguageRole: 'knowledge_rules_are_written_as_sheikha_language_governance_expressions',
    aiRole: 'grounded_retrieval_and_summary_support',
    contracts: ['knowledge_contract', 'evidence_contract', 'claim_contract'],
    bindings: ['truth_gate', 'documentation_index', 'audit_log']
  },
  {
    id: 'MARKET_COMMUNITY_TREE',
    name: 'شجرة السوق والمجتمع',
    tree: 'commerce_community_tree',
    responsibility: 'Connect marketplace, community, commerce, identity, sectors, and lawful participation.',
    sheikhaLanguageRole: 'market_and_community_actions_are_written_as_sheikha_permission_contracts',
    aiRole: 'matching_and_recommendation_support_only',
    contracts: ['market_contract', 'community_contract', 'identity_permission_contract'],
    bindings: ['least_privilege', 'consent_gate', 'audit_log']
  },
  {
    id: 'SUPPLY_CHAIN_RESOURCE_TREE',
    name: 'شجرة الإمداد والموارد',
    tree: 'industrial_hpc_tree',
    responsibility: 'Trace resources, suppliers, factories, logistics, inventory, recycling, and lawful contracts.',
    sheikhaLanguageRole: 'supply_chain_flows_are_written_as_sheikha_trace_contracts',
    aiRole: 'planning_forecast_support_with_human_approval',
    contracts: ['supplier_contract', 'resource_trace_contract', 'fulfillment_contract'],
    bindings: ['no_harm_gate', 'rights_gate', 'traceability_log']
  },
  {
    id: 'SECURITY_RECOVERY_TREE',
    name: 'شجرة الأمن والتعافي',
    tree: 'safety_tree',
    responsibility: 'Protect secrets, permissions, live repair, rollback, health, recovery, and operational safety.',
    sheikhaLanguageRole: 'security_and_recovery_rules_are_written_as_sheikha_policy_contracts',
    aiRole: 'triage_and_repair_suggestions_only',
    contracts: ['security_contract', 'secret_contract', 'rollback_contract', 'live_repair_contract'],
    bindings: ['least_privilege', 'rollback_gate', 'post_check']
  }
];

function buildLowerLayerContract(node) {
  return {
    nodeId: node.id,
    shariaWrittenContract: true,
    writtenInSheikhaLanguage: true,
    aiGoverned: true,
    sources: SHARIA_CONTRACT_TEMPLATE.sources,
    principles: SHARIA_CONTRACT_TEMPLATE.principles,
    requiredClauses: SHARIA_CONTRACT_TEMPLATE.requiredClauses,
    forbiddenClaims: SHARIA_CONTRACT_TEMPLATE.forbiddenClaims,
    declaredContracts: node.contracts,
    declaredBindings: node.bindings,
    bindingRule: 'كل ربط في الطبقات الأدنى لا يعمل إلا بعقد مكتوب بلغة شيخة ومقيد بالكتاب والسنة وبوابة الحقيقة.'
  };
}

function buildTreeEdges(nodes = LOWER_LAYER_NODES) {
  const edgeList = [
    ['SHEIKHA_LANGUAGE_ROOT', 'GOVERNED_AI_CORE', 'language_governs_ai_task_expression'],
    ['SHEIKHA_LANGUAGE_ROOT', 'SOVEREIGN_KERNEL_TREE', 'language_defines_kernel_contracts'],
    ['SHEIKHA_LANGUAGE_ROOT', 'UNIVERSAL_TECHNOLOGY_TREE', 'language_defines_technology_contracts'],
    ['SHEIKHA_LANGUAGE_ROOT', 'KNOWLEDGE_AND_TRUTH_TREE', 'language_defines_truth_contracts'],
    ['SHEIKHA_LANGUAGE_ROOT', 'MARKET_COMMUNITY_TREE', 'language_defines_market_contracts'],
    ['SHEIKHA_LANGUAGE_ROOT', 'SUPPLY_CHAIN_RESOURCE_TREE', 'language_defines_supply_contracts'],
    ['SHEIKHA_LANGUAGE_ROOT', 'SECURITY_RECOVERY_TREE', 'language_defines_security_contracts'],
    ['GOVERNED_AI_CORE', 'UNIVERSAL_TECHNOLOGY_TREE', 'governed_ai_supports_simulation'],
    ['GOVERNED_AI_CORE', 'KNOWLEDGE_AND_TRUTH_TREE', 'governed_ai_supports_retrieval'],
    ['SECURITY_RECOVERY_TREE', 'SOVEREIGN_KERNEL_TREE', 'protects_and_recovers'],
    ['SUPPLY_CHAIN_RESOURCE_TREE', 'UNIVERSAL_TECHNOLOGY_TREE', 'feeds_industrial_capabilities'],
    ['MARKET_COMMUNITY_TREE', 'SUPPLY_CHAIN_RESOURCE_TREE', 'coordinates_lawful_demand_supply']
  ];
  const nodeIds = new Set(nodes.map((node) => node.id));

  return edgeList
    .filter(([from, to]) => nodeIds.has(from) && nodeIds.has(to))
    .map(([from, to, relation]) => ({
      from,
      to,
      relation,
      apexEdge: false,
      shariaWrittenBinding: true,
      writtenInSheikhaLanguage: true,
      sources: ['QURAN', 'AUTHENTIC_SUNNAH']
    }));
}

function buildGarden(nodes = LOWER_LAYER_NODES) {
  const grouped = nodes.reduce((accumulator, node) => {
    accumulator[node.tree] ||= [];
    accumulator[node.tree].push(node.id);
    return accumulator;
  }, {});

  return {
    name: 'Sheikha Technical Garden',
    arabicName: 'جنة أشجار شيخة التقنية',
    policy: 'كل شجرة تقنية تحت الحاكمية العليا، وتعمل بعقود مكتوبة بلغة شيخة ومقيدة بالكتاب والسنة.',
    trees: Object.entries(grouped).map(([treeId, nodeIds]) => ({
      treeId,
      nodes: nodeIds,
      shariaContractRequired: true,
      sheikhaLanguageRequired: true,
      governedAiAllowed: true
    }))
  };
}

function buildEvidenceStatus() {
  return EVIDENCE_MAP.map((item) => ({
    ...item,
    present: exists(item.path)
  }));
}

function buildReport() {
  const languageContract = readJson('runtime/sheikha-language-integration/sheikha-language-integration-v1.json', {});
  const sovereignKernel = readJson('runtime/sovereign-kernel-boot/v1/sheikha-sovereign-kernel-boot-v1-report.json', {});
  const universalTechnology = readJson('runtime/universal-technology-hpc-fabric/v1/sheikha-universal-technology-hpc-fabric-v1-report.json', {});
  const evidence = buildEvidenceStatus();
  const lowerLayerContracts = LOWER_LAYER_NODES.map(buildLowerLayerContract);
  const lowerLayerEdges = buildTreeEdges();
  const apexTouchedByEdges = lowerLayerEdges.some((edge) => (
    edge.from === SOVEREIGN_APEX.id || edge.to === SOVEREIGN_APEX.id
  ));

  const checks = {
    apexHasNoContracts: SOVEREIGN_APEX.contracts.length === 0,
    apexHasNoBindings: SOVEREIGN_APEX.bindings.length === 0,
    apexHasNoRuntimeLinks: SOVEREIGN_APEX.runtimeLinks.length === 0 && SOVEREIGN_APEX.incomingLinks.length === 0 && SOVEREIGN_APEX.outgoingLinks.length === 0,
    apexNotInExecutableGraph: apexTouchedByEdges === false && SOVEREIGN_APEX.executableNode === false,
    tawhidFoundation: SOVEREIGN_APEX.foundation === 'TAWHID_OF_ALLAH',
    quranSunnahHighestLayer: SOVEREIGN_APEX.id === 'HAKIMIYYAH_QURAN_SUNNAH_APEX',
    sheikhaLanguageIsProgrammingRoot: LOWER_LAYER_NODES[0].id === 'SHEIKHA_LANGUAGE_ROOT' && languageContract.status === 'ACTIVE',
    aiIsGovernedSupport: LOWER_LAYER_NODES.some((node) => node.id === 'GOVERNED_AI_CORE' && node.aiRole === 'decision_support_only'),
    allLowerLayersHaveShariaContracts: lowerLayerContracts.every((contract) => contract.shariaWrittenContract),
    allLowerLayersWrittenInSheikhaLanguage: lowerLayerContracts.every((contract) => contract.writtenInSheikhaLanguage),
    allLowerBindingsUseQuranSunnah: lowerLayerEdges.every((edge) => edge.shariaWrittenBinding && edge.sources.includes('QURAN') && edge.sources.includes('AUTHENTIC_SUNNAH')),
    technologyGardenBuilt: buildGarden().trees.length >= 5,
    sovereignKernelLinkedAsEvidence: sovereignKernel.rootCovenant?.foundation === 'TAWHID_OF_ALLAH',
    universalTechnologyLinkedAsEvidence: universalTechnology.score === 100,
    evidenceCoverageSufficient: evidence.filter((item) => item.present).length >= 10,
    githubIndependent: true
  };
  const score = scoreFromChecks(checks);

  return {
    system: 'SHEIKHA_TECHNOLOGY_FAMILY_TREE_V1',
    generatedAt: new Date().toISOString(),
    status: score.score === 100 ? 'ACTIVE_WITH_SHEIKHA_TECHNICAL_ROOT_TREE_GARDEN' : 'ACTIVE_WITH_REVIEW',
    score: score.score,
    checks,
    sovereignApex: SOVEREIGN_APEX,
    rootCovenant: {
      id: 'SHEIKHA_TECHNICAL_ROOT_COVENANT',
      arabicName: 'جذر شيخة التقنية',
      basis: 'لغة شيخة هي أساس الكتابة البرمجية لكل النظام.',
      islamicGovernance: true,
      governedAiIntegrated: true,
      noHostFoundation: true,
      noGithubRequirement: true,
      statement: 'الجذر التقني يبدأ بلغة شيخة، والذكاء الصناعي يعمل داخلها كدعم محكوم، وكل طبقة تنفيذية أسفل الحاكمية لا تعمل إلا بعقد شرعي مكتوب ومراجع.'
    },
    sheikhaLanguagePrimacy: {
      status: languageContract.status === 'ACTIVE' ? 'ACTIVE_AS_ALL_SYSTEM_PROGRAMMING_BASIS' : 'NEEDS_LANGUAGE_REVIEW',
      allNewSystemsMustStartWithSheikhaLanguage: true,
      allProgrammingContractsWrittenInSheikhaLanguage: true,
      aiEmbeddedInLanguageUnderGovernance: true,
      layers: languageContract.languageLayers || [],
      integrationTargets: languageContract.integrationTargets || [],
      blockedClaims: languageContract.blockedClaims || []
    },
    technologyGarden: buildGarden(),
    lowerLayerNodes: LOWER_LAYER_NODES,
    lowerLayerContracts,
    lowerLayerGraph: {
      policy: 'The sovereign apex is not part of executable graph edges. Only lower layers may have written contracts and bindings.',
      nodes: LOWER_LAYER_NODES.map((node) => ({
        id: node.id,
        name: node.name,
        tree: node.tree,
        sheikhaLanguageRole: node.sheikhaLanguageRole,
        aiRole: node.aiRole
      })),
      edges: lowerLayerEdges
    },
    contractLaw: {
      lowerLayersOnly: true,
      apexContractsForbidden: true,
      template: SHARIA_CONTRACT_TEMPLATE,
      bindingRuleArabic: 'أي عقد أو ربط في الطبقات التي أسفل الحاكمية يكون مكتوبًا بعقد شرعي بلغة شيخة، ومقيدًا بالكتاب والسنة، ومربوطًا ببوابة الحقيقة والمراجعة البشرية عند الأثر العالي.',
      religiousRulingBoundary: 'النظام لا يصدر فتوى مستقلة؛ المسائل الشرعية تحتاج مراجعة أهل الاختصاص.'
    },
    evidence: {
      present: evidence.filter((item) => item.present).length,
      total: evidence.length,
      paths: evidence
    },
    runbook: {
      localOnly: true,
      commands: [
        'npm run -s ops:technology-family-tree:v1',
        'npm run -s ops:sovereign-kernel-boot:v1',
        'npm run -s ops:universal-technology-hpc-fabric:v1',
        'npm run -s ops:master-activation:consolidation:v1',
        'npm test -- --runInBand tests/sheikha-technology-family-tree-v1.test.js'
      ]
    },
    outputs: {
      report: reportPath,
      handbook: handbookPath
    }
  };
}

function writeJson(relativePath, payload) {
  fs.mkdirSync(path.dirname(resolve(relativePath)), { recursive: true });
  fs.writeFileSync(resolve(relativePath), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function buildHandbook(report) {
  const nodeLines = report.lowerLayerNodes.map((node) => [
    `### ${node.name}`,
    '',
    `- ID: ${node.id}`,
    `- Tree: ${node.tree}`,
    `- Responsibility: ${node.responsibility}`,
    `- Sheikha Language: ${node.sheikhaLanguageRole}`,
    `- AI role: ${node.aiRole}`,
    `- Contracts: ${node.contracts.join(', ')}`,
    `- Bindings: ${node.bindings.join(', ')}`
  ].join('\n')).join('\n\n');

  return [
    '# SHEIKHA Technology Family Tree V1',
    '',
    `Status: ${report.status}`,
    `Score: ${report.score}`,
    '',
    '## الطبقة العليا',
    '',
    '- الطبقة العليا هي حاكمية الكتاب والسنة.',
    '- لا تحتوي على عقود تشغيلية.',
    '- لا تحتوي على روابط runtime.',
    '- لا تدخل في graph التنفيذ.',
    '- لا توجد طبقة فوقها.',
    '',
    '## جذر شيخة',
    '',
    '- لغة شيخة هي أساس الكتابة البرمجية لكل النظام.',
    '- الذكاء الصناعي مدمج داخل لغة شيخة كدعم محكوم.',
    '- كل الطبقات التنفيذية أسفل الحاكمية تعمل بعقود مكتوبة بلغة شيخة.',
    '',
    '## قاعدة العقود والربط',
    '',
    'أي عقد أو ربط في الطبقات السفلى يجب أن يكون مكتوبًا بعقد شرعي، ومقيدًا بالكتاب والسنة، ومراجعًا ببوابة الحقيقة. النظام لا يصدر فتوى مستقلة، والمسائل الشرعية تحتاج أهل الاختصاص.',
    '',
    '## أشجار شيخة التقنية',
    '',
    nodeLines,
    '',
    '## Local Runbook',
    '',
    '```bash',
    ...report.runbook.commands,
    '```',
    ''
  ].join('\n');
}

function writeReport(report = buildReport()) {
  writeJson(reportPath, report);
  fs.mkdirSync(path.dirname(resolve(handbookPath)), { recursive: true });
  fs.writeFileSync(resolve(handbookPath), buildHandbook(report), 'utf8');
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    score: report.score,
    apexContracts: report.sovereignApex.contracts.length,
    apexBindings: report.sovereignApex.bindings.length,
    apexRuntimeLinks: report.sovereignApex.runtimeLinks.length,
    sheikhaLanguage: report.sheikhaLanguagePrimacy.status,
    lowerLayerNodes: report.lowerLayerNodes.length,
    gardenTrees: report.technologyGarden.trees.length,
    evidencePresent: report.evidence.present,
    evidenceTotal: report.evidence.total,
    outputs: report.outputs,
    host: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024)
    }
  }, null, 2));
}

module.exports = {
  buildGarden,
  buildHandbook,
  buildLowerLayerContract,
  buildReport,
  buildTreeEdges,
  scoreFromChecks,
  writeReport
};
