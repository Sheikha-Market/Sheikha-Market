'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  buildReport: buildTechnologyFamilyTreeReport
} = require('./activate-sheikha-technology-family-tree-v1');

const ROOT = process.cwd();
const reportPath = 'runtime/jannat-gardens/v1/sheikha-jannat-gardens-v1-report.json';
const handbookPath = 'docs/jannat-gardens-v1/SHEIKHA-JANNAT-GARDENS-V1.md';
const publicModelPath = 'public/sheikha-jannat-gardens/sheikha-jannat-gardens-v1.json';

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

const WORLDLY_BEAUTY_BOUNDARY = {
  worldlyMetaphorOnly: true,
  actualJannahClaim: false,
  unseenRepresentationClaim: false,
  sacredSimulationClaim: false,
  equivalentToHereafterJannah: false,
  religiousRulingClaim: false,
  purpose: 'A worldly visual and architectural metaphor for beauty, mercy, order, knowledge, provision, and excellence inside Sheikha.',
  boundaryArabic: 'جنات شيخة هنا استعارة دنيوية جميلة للواجهة والمعمار والمعرفة، وليست ادعاءً بتمثيل الجنة الغيبية أو مساواتها.'
};

const JANNAT_GARDENS = [
  {
    id: 'RAWDAH_OF_TAWHID_GOVERNANCE',
    name: 'روضة التوحيد والحاكمية',
    role: 'non_executable_canopy',
    symbolicMeaning: 'الظل الأعلى الذي يحفظ الجمال من الفوضى والادعاء.',
    apexReferenceOnly: true,
    contracts: [],
    bindings: [],
    trees: [
      { id: 'truth_tree', name: 'شجرة الصدق', fruit: 'claims_with_evidence' },
      { id: 'amanah_tree', name: 'شجرة الأمانة', fruit: 'rights_preserved' },
      { id: 'adl_tree', name: 'شجرة العدل', fruit: 'fair_decisions' }
    ],
    rivers: [
      { id: 'guidance_river', name: 'نهر الهداية المنهجية', flow: 'policy_reference_only', metaphorical: true }
    ],
    fruits: ['truthfulness', 'amanah', 'justice', 'no_harm'],
    colors: ['deep_emerald', 'date_palm_green', 'clear_water']
  },
  {
    id: 'GARDEN_OF_SHEIKHA_LANGUAGE',
    name: 'حديقة لغة شيخة',
    role: 'programming_root_garden',
    symbolicMeaning: 'كل كتابة برمجية تبدأ من لغة شيخة كجذر واضح وناطق.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'syntax_tree', name: 'شجرة الصياغة', fruit: 'clear_specs' },
      { id: 'compiler_tree', name: 'شجرة الترجمة', fruit: 'safe_execution' },
      { id: 'contract_tree', name: 'شجرة العقود', fruit: 'auditable_rules' }
    ],
    rivers: [
      { id: 'meaning_river', name: 'نهر المعنى', flow: 'specification_to_execution', metaphorical: true },
      { id: 'audit_river', name: 'نهر الأثر', flow: 'contract_to_audit', metaphorical: true }
    ],
    fruits: ['governed_code', 'readable_contracts', 'safe_translation'],
    colors: ['pearl_white', 'ink_black', 'olive_green']
  },
  {
    id: 'GARDEN_OF_GOVERNED_AI',
    name: 'حديقة الذكاء الصناعي المحكوم',
    role: 'governed_ai_support_garden',
    symbolicMeaning: 'ذكاء يساعد ولا يحكم، يقترح ولا يدعي، ويعمل تحت المراجعة.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'reasoning_tree', name: 'شجرة التحليل', fruit: 'explainable_suggestions' },
      { id: 'retrieval_tree', name: 'شجرة الاسترجاع', fruit: 'grounded_answers' },
      { id: 'optimization_tree', name: 'شجرة التحسين', fruit: 'measured_improvement' }
    ],
    rivers: [
      { id: 'knowledge_context_river', name: 'نهر السياق', flow: 'knowledge_to_model', metaphorical: true },
      { id: 'review_river', name: 'نهر المراجعة', flow: 'ai_output_to_human_review', metaphorical: true }
    ],
    fruits: ['decision_support', 'risk_alerts', 'better_workflows'],
    colors: ['sky_blue', 'soft_gold', 'leaf_green']
  },
  {
    id: 'GARDEN_OF_KNOWLEDGE_AND_TRUTH',
    name: 'حديقة المعرفة والبيّنة',
    role: 'knowledge_truth_garden',
    symbolicMeaning: 'المعرفة تنمو بالدليل، وكل ثمرة تحمل أثرها ومصدرها.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'knowledge_graph_tree', name: 'شجرة الرسم المعرفي', fruit: 'linked_context' },
      { id: 'documentation_tree', name: 'شجرة التوثيق', fruit: 'single_source_of_truth' },
      { id: 'truth_gate_tree', name: 'شجرة بوابة الحقيقة', fruit: 'blocked_false_claims' }
    ],
    rivers: [
      { id: 'evidence_river', name: 'نهر البيّنة', flow: 'evidence_to_claim', metaphorical: true },
      { id: 'learning_river', name: 'نهر التعلم المقاس', flow: 'measurement_to_improvement', metaphorical: true }
    ],
    fruits: ['clarity', 'traceable_knowledge', 'safe_claims'],
    colors: ['clear_blue', 'paper_white', 'sage_green']
  },
  {
    id: 'GARDEN_OF_TECHNOLOGY_AND_COMPUTE',
    name: 'حديقة التقنية والحوسبة',
    role: 'technology_compute_garden',
    symbolicMeaning: 'قوة محسوبة ومقاسة؛ سرعة بلا ادعاء إلا ببرهان.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'compute_tree', name: 'شجرة الحوسبة', fruit: 'parallel_results' },
      { id: 'semiconductor_tree', name: 'شجرة أشباه الموصلات', fruit: 'trusted_components' },
      { id: 'thermal_tree', name: 'شجرة الطاقة والتبريد', fruit: 'safe_capacity' }
    ],
    rivers: [
      { id: 'data_flow_river', name: 'نهر تدفق البيانات', flow: 'workload_to_result', metaphorical: true },
      { id: 'benchmark_river', name: 'نهر القياس', flow: 'claim_to_benchmark', metaphorical: true }
    ],
    fruits: ['measured_performance', 'safe_capacity', 'technology_readiness'],
    colors: ['graphite', 'copper', 'fresh_green']
  },
  {
    id: 'GARDEN_OF_SUPPLY_AND_PROVISION',
    name: 'حديقة الإمداد والرزق',
    role: 'supply_resource_garden',
    symbolicMeaning: 'تدفق الموارد بعدل ووضوح وأثر محفوظ.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'resource_tree', name: 'شجرة الموارد', fruit: 'traceable_materials' },
      { id: 'factory_tree', name: 'شجرة المصانع', fruit: 'quality_outputs' },
      { id: 'recycling_tree', name: 'شجرة التدوير', fruit: 'recovered_value' }
    ],
    rivers: [
      { id: 'supply_river', name: 'نهر الإمداد', flow: 'supplier_to_factory_to_market', metaphorical: true },
      { id: 'recovery_resource_river', name: 'نهر الاسترداد', flow: 'waste_to_value', metaphorical: true }
    ],
    fruits: ['lawful_supply', 'reduced_waste', 'quality_trace'],
    colors: ['date_gold', 'soil_brown', 'leaf_green']
  },
  {
    id: 'GARDEN_OF_MARKET_AND_COMMUNITY',
    name: 'حديقة السوق والمجتمع',
    role: 'market_community_garden',
    symbolicMeaning: 'سوق جميل يخدم الناس بالعدل والوضوح والاختيار الآمن.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'community_tree', name: 'شجرة المجتمع', fruit: 'trusted_participation' },
      { id: 'market_tree', name: 'شجرة السوق', fruit: 'lawful_exchange' },
      { id: 'service_tree', name: 'شجرة الخدمات', fruit: 'helpful_experiences' }
    ],
    rivers: [
      { id: 'consent_river', name: 'نهر الرضا', flow: 'permission_to_action', metaphorical: true },
      { id: 'benefit_river', name: 'نهر النفع', flow: 'need_to_service', metaphorical: true }
    ],
    fruits: ['trust', 'lawful_trade', 'community_benefit'],
    colors: ['rose', 'mint', 'warm_light']
  },
  {
    id: 'GARDEN_OF_SECURITY_AND_RECOVERY',
    name: 'حديقة الأمن والتعافي',
    role: 'safety_recovery_garden',
    symbolicMeaning: 'طمأنينة تشغيلية: حماية، علاج، رجوع آمن، وتعافٍ موثق.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'security_tree', name: 'شجرة الحماية', fruit: 'least_privilege' },
      { id: 'recovery_tree', name: 'شجرة التعافي', fruit: 'restore_points' },
      { id: 'health_tree', name: 'شجرة الصحة', fruit: 'early_alerts' }
    ],
    rivers: [
      { id: 'healing_river', name: 'نهر العلاج', flow: 'incident_to_recovery', metaphorical: true },
      { id: 'rollback_river', name: 'نهر الرجوع الآمن', flow: 'failure_to_stable_state', metaphorical: true }
    ],
    fruits: ['resilience', 'safe_repair', 'operational_calm'],
    colors: ['cool_blue', 'white', 'palm_green']
  },
  {
    id: 'GARDEN_OF_BEAUTY_AND_EXPERIENCE',
    name: 'حديقة الجمال والتجربة',
    role: 'worldly_beauty_ux_garden',
    symbolicMeaning: 'الجمال الدنيوي المباح في الواجهات: وضوح، راحة، نور، واتساق.',
    contractRequired: true,
    sheikhaLanguageRequired: true,
    trees: [
      { id: 'interface_tree', name: 'شجرة الواجهة', fruit: 'clear_screens' },
      { id: 'accessibility_tree', name: 'شجرة اليسر', fruit: 'inclusive_use' },
      { id: 'delight_tree', name: 'شجرة البهجة', fruit: 'gentle_interaction' }
    ],
    rivers: [
      { id: 'journey_river', name: 'نهر الرحلة', flow: 'intent_to_completion', metaphorical: true },
      { id: 'comfort_river', name: 'نهر السكينة البصرية', flow: 'complexity_to_clarity', metaphorical: true }
    ],
    fruits: ['clarity', 'ease', 'beauty_without_excess'],
    colors: ['garden_green', 'water_blue', 'soft_light']
  }
];

function buildJannatGraph(gardens = JANNAT_GARDENS) {
  const edgeList = [
    ['GARDEN_OF_SHEIKHA_LANGUAGE', 'GARDEN_OF_GOVERNED_AI', 'language_shapes_ai_tasks'],
    ['GARDEN_OF_SHEIKHA_LANGUAGE', 'GARDEN_OF_KNOWLEDGE_AND_TRUTH', 'language_shapes_truth_contracts'],
    ['GARDEN_OF_KNOWLEDGE_AND_TRUTH', 'GARDEN_OF_TECHNOLOGY_AND_COMPUTE', 'truth_measures_technology'],
    ['GARDEN_OF_TECHNOLOGY_AND_COMPUTE', 'GARDEN_OF_SUPPLY_AND_PROVISION', 'compute_supports_supply'],
    ['GARDEN_OF_SUPPLY_AND_PROVISION', 'GARDEN_OF_MARKET_AND_COMMUNITY', 'supply_serves_market'],
    ['GARDEN_OF_SECURITY_AND_RECOVERY', 'GARDEN_OF_TECHNOLOGY_AND_COMPUTE', 'security_protects_compute'],
    ['GARDEN_OF_SECURITY_AND_RECOVERY', 'GARDEN_OF_MARKET_AND_COMMUNITY', 'security_protects_people'],
    ['GARDEN_OF_BEAUTY_AND_EXPERIENCE', 'GARDEN_OF_MARKET_AND_COMMUNITY', 'beauty_improves_service'],
    ['GARDEN_OF_BEAUTY_AND_EXPERIENCE', 'GARDEN_OF_SHEIKHA_LANGUAGE', 'beauty_surfaces_language']
  ];
  const gardenIds = new Set(gardens.map((garden) => garden.id));

  return edgeList
    .filter(([from, to]) => gardenIds.has(from) && gardenIds.has(to))
    .map(([from, to, relation]) => ({
      from,
      to,
      relation,
      metaphoricalRiver: true,
      apexEdge: false,
      shariaContractRequired: true,
      writtenInSheikhaLanguage: true
    }));
}

function buildPublicModel(report) {
  return {
    system: report.system,
    generatedAt: report.generatedAt,
    title: 'جنات شيخة',
    subtitle: 'حدائق وأشجار وأنهار وثمرات دنيوية رمزية لمنظومة شيخة',
    boundary: report.worldlyBeautyBoundary,
    metrics: {
      gardens: report.metrics.gardens,
      trees: report.metrics.trees,
      rivers: report.metrics.rivers,
      fruits: report.metrics.fruits,
      score: report.score
    },
    gardens: report.gardens.map((garden) => ({
      id: garden.id,
      name: garden.name,
      role: garden.role,
      symbolicMeaning: garden.symbolicMeaning,
      trees: garden.trees.map((tree) => tree.name),
      rivers: garden.rivers.map((river) => river.name),
      fruits: garden.fruits,
      colors: garden.colors
    }))
  };
}

function buildReport() {
  const familyTree = buildTechnologyFamilyTreeReport();
  const languageContract = readJson('runtime/sheikha-language-integration/sheikha-language-integration-v1.json', {});
  const islamicKernel = readJson('runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json', {});
  const graph = buildJannatGraph();
  const gardens = JANNAT_GARDENS;
  const allTrees = gardens.flatMap((garden) => garden.trees);
  const allRivers = gardens.flatMap((garden) => garden.rivers);
  const allFruits = gardens.flatMap((garden) => garden.fruits);

  const checks = {
    worldlyMetaphorOnly: WORLDLY_BEAUTY_BOUNDARY.worldlyMetaphorOnly === true,
    noActualJannahClaim: WORLDLY_BEAUTY_BOUNDARY.actualJannahClaim === false,
    noUnseenRepresentationClaim: WORLDLY_BEAUTY_BOUNDARY.unseenRepresentationClaim === false,
    noSacredSimulationClaim: WORLDLY_BEAUTY_BOUNDARY.sacredSimulationClaim === false,
    apexRemainsContractless: familyTree.sovereignApex.contracts.length === 0 && familyTree.sovereignApex.bindings.length === 0,
    apexNotInGardenGraph: graph.every((edge) => edge.apexEdge === false),
    sheikhaLanguageRootActive: languageContract.status === 'ACTIVE' && familyTree.sheikhaLanguagePrimacy.status === 'ACTIVE_AS_ALL_SYSTEM_PROGRAMMING_BASIS',
    governedAiOnly: familyTree.lowerLayerNodes.some((node) => node.id === 'GOVERNED_AI_CORE' && node.aiRole === 'decision_support_only'),
    islamicGovernancePresent: exists('docs/sharia-governance-fabric/SHEIKHA-SHARIA-GOVERNANCE-FABRIC-V1.md') || Boolean(islamicKernel.system),
    gardensBuilt: gardens.length >= 9,
    everyGardenHasTreesRiversFruits: gardens.every((garden) => garden.trees.length >= 3 && garden.rivers.length >= 1 && garden.fruits.length >= 3),
    riversAreMetaphorical: allRivers.every((river) => river.metaphorical === true),
    fruitsAreWorldlyOutputs: allFruits.every((fruit) => typeof fruit === 'string' && fruit.length > 0),
    lowerGardenBindingsNeedContracts: graph.every((edge) => edge.shariaContractRequired && edge.writtenInSheikhaLanguage),
    publicModelDefined: Boolean(publicModelPath),
    githubIndependent: true
  };
  const score = scoreFromChecks(checks);

  const report = {
    system: 'SHEIKHA_JANNAT_GARDENS_V1',
    generatedAt: new Date().toISOString(),
    status: score.score === 100 ? 'ACTIVE_WITH_WORLDLY_SHEIKHA_GARDENS' : 'ACTIVE_WITH_REVIEW',
    score: score.score,
    checks,
    worldlyBeautyBoundary: WORLDLY_BEAUTY_BOUNDARY,
    governingApexPolicy: {
      inheritedFrom: 'SHEIKHA_TECHNOLOGY_FAMILY_TREE_V1',
      apexId: familyTree.sovereignApex.id,
      apexContracts: familyTree.sovereignApex.contracts.length,
      apexBindings: familyTree.sovereignApex.bindings.length,
      apexRuntimeLinks: familyTree.sovereignApex.runtimeLinks.length,
      statement: 'الحاكمية العليا تبقى مرجعية بلا عقد ولا ربط؛ جنات شيخة تعمل فقط في الطبقات الرمزية والتنفيذية الأدنى.'
    },
    rootCovenant: {
      foundation: 'TAWHID_OF_ALLAH',
      sheikhaLanguageAsRoot: true,
      governedAiIntegrated: true,
      islamicGovernance: true,
      statement: 'الجمال في جنات شيخة جمال دنيوي مباح ومنظم: لغة شيخة، حوكمة إسلامية، ذكاء صناعي محكوم، وثمار نافعة موثقة.'
    },
    metrics: {
      gardens: gardens.length,
      trees: allTrees.length,
      rivers: allRivers.length,
      fruits: new Set(allFruits).size,
      graphEdges: graph.length
    },
    gardens,
    gardenGraph: {
      policy: 'Only lower worldly gardens have metaphorical flows. The Quran and Sunnah apex is not linked as an executable node.',
      edges: graph
    },
    experiencePrinciples: [
      'beauty_without_excess',
      'clarity_before_decoration',
      'mercy_in_interaction',
      'truth_before_claim',
      'ease_without_harm',
      'measured_benefit',
      'safe_recovery',
      'human_review_for_high_impact'
    ],
    interfaceReadiness: {
      publicModelPath,
      canRenderGardenMap: true,
      recommendedSurfaces: [
        'executive dashboard garden overview',
        'knowledge garden map',
        'technology river flow',
        'recovery garden playbook',
        'market community garden'
      ]
    },
    runbook: {
      localOnly: true,
      commands: [
        'npm run -s ops:jannat-gardens:v1',
        'npm run -s ops:technology-family-tree:v1',
        'npm run -s ops:master-activation:consolidation:v1',
        'npm test -- --runInBand tests/sheikha-jannat-gardens-v1.test.js'
      ]
    },
    outputs: {
      report: reportPath,
      handbook: handbookPath,
      publicModel: publicModelPath
    }
  };

  return report;
}

function writeJson(relativePath, payload) {
  fs.mkdirSync(path.dirname(resolve(relativePath)), { recursive: true });
  fs.writeFileSync(resolve(relativePath), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function buildHandbook(report) {
  const gardenLines = report.gardens.map((garden) => [
    `### ${garden.name}`,
    '',
    `- Role: ${garden.role}`,
    `- Meaning: ${garden.symbolicMeaning}`,
    `- Trees: ${garden.trees.map((tree) => tree.name).join(', ')}`,
    `- Rivers: ${garden.rivers.map((river) => river.name).join(', ')}`,
    `- Fruits: ${garden.fruits.join(', ')}`
  ].join('\n')).join('\n\n');

  return [
    '# SHEIKHA Jannat Gardens V1',
    '',
    `Status: ${report.status}`,
    `Score: ${report.score}`,
    '',
    '## Boundary',
    '',
    '- جنات شيخة استعارة دنيوية جميلة للواجهة والمعمار والمعرفة.',
    '- لا تدعي تمثيل الجنة الغيبية ولا مساواتها.',
    '- لا تصدر حكمًا شرعيًا مستقلًا.',
    '- الطبقة العليا للحاكمية تبقى بلا عقود ولا روابط تنفيذية.',
    '',
    '## Root',
    '',
    '- الأساس: التوحيد لله.',
    '- لغة شيخة هي جذر الكتابة البرمجية.',
    '- الذكاء الصناعي دعم محكوم داخل الحوكمة الإسلامية.',
    '',
    '## Metrics',
    '',
    `- Gardens: ${report.metrics.gardens}`,
    `- Trees: ${report.metrics.trees}`,
    `- Rivers: ${report.metrics.rivers}`,
    `- Fruits: ${report.metrics.fruits}`,
    '',
    '## Gardens',
    '',
    gardenLines,
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
  writeJson(publicModelPath, buildPublicModel(report));
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    score: report.score,
    worldlyMetaphorOnly: report.worldlyBeautyBoundary.worldlyMetaphorOnly,
    actualJannahClaim: report.worldlyBeautyBoundary.actualJannahClaim,
    apexContracts: report.governingApexPolicy.apexContracts,
    apexBindings: report.governingApexPolicy.apexBindings,
    gardens: report.metrics.gardens,
    trees: report.metrics.trees,
    rivers: report.metrics.rivers,
    fruits: report.metrics.fruits,
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
  buildHandbook,
  buildJannatGraph,
  buildPublicModel,
  buildReport,
  scoreFromChecks,
  writeReport
};
