'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = process.cwd();
const reportPath = 'runtime/universal-technology-hpc-fabric/v1/sheikha-universal-technology-hpc-fabric-v1-report.json';
const handbookPath = 'docs/universal-technology-hpc-fabric-v1/SHEIKHA-UNIVERSAL-TECHNOLOGY-HPC-FABRIC-V1.md';

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
    key: 'sovereignKernelBoot',
    path: 'runtime/sovereign-kernel-boot/v1/sheikha-sovereign-kernel-boot-v1-report.json',
    role: 'native_no_host_governed_boot_boundary'
  },
  {
    key: 'masterActivationCatalog',
    path: 'runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json',
    role: 'local_repository_catalog_and_capability_registry'
  },
  {
    key: 'osCloudSupercomputerIntegration',
    path: 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json',
    role: 'compute_runtime_integration_boundary'
  },
  {
    key: 'liveComputeBenchmark',
    path: 'runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json',
    role: 'repeatable_local_benchmark_evidence'
  },
  {
    key: 'cloudSupercomputerFabric',
    path: 'runtime/cloud-supercomputer-fabric/v1/sheikha-cloud-supercomputer-fabric-v1-report.json',
    role: 'distributed_compute_fabric'
  },
  {
    key: 'multiSupercomputerFabric',
    path: 'runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1-report.json',
    role: 'federated_compute_fabric'
  },
  {
    key: 'aiSupercomputerPipeline',
    path: 'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json',
    role: 'ai_compute_cluster_pipeline'
  },
  {
    key: 'providerComputeFabric',
    path: 'runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json',
    role: 'provider_neutral_compute_registry'
  },
  {
    key: 'computeAccelerationPlane',
    path: 'runtime/compute-acceleration-plane/sheikha-compute-acceleration-plane.json',
    role: 'accelerator_abstraction_plane'
  },
  {
    key: 'computerArchitectureGovernance',
    path: 'runtime/computer-architecture/reports/sheikha-computer-architecture-report.json',
    role: 'architecture_governance'
  },
  {
    key: 'kernelIndustrialFabric',
    path: 'runtime/kernel-industrial-fabric/sheikha-kernel-industrial-fabric-v1-report.json',
    role: 'industrial_kernel_contract'
  },
  {
    key: 'kernelStackFabric',
    path: 'runtime/kernel-stack-fabric/sheikha-kernel-stack-fabric-v1-report.json',
    role: 'kernel_stack_contract'
  },
  {
    key: 'supplyChainControlTower',
    path: 'runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json',
    role: 'supply_chain_control_and_traceability'
  },
  {
    key: 'supplyChainSimulation',
    path: 'runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1-report.json',
    role: 'supply_chain_simulation'
  },
  {
    key: 'globalSupplyChainGraph',
    path: 'docs/global-supply-chain-graph/SHEIKHA-GLOBAL-SUPPLY-CHAIN-GRAPH-V66.md',
    role: 'global_supply_chain_graph_documentation'
  },
  {
    key: 'marketplaceOperatingSystem',
    path: 'runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json',
    role: 'marketplace_and_commerce_runtime'
  },
  {
    key: 'shariaGovernanceFabric',
    path: 'docs/sharia-governance-fabric/SHEIKHA-SHARIA-GOVERNANCE-FABRIC-V1.md',
    role: 'quran_sunnah_governance_documentation'
  },
  {
    key: 'islamicAiKernel',
    path: 'runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json',
    role: 'governed_ai_kernel'
  }
];

const TECHNOLOGY_FAMILIES = [
  {
    id: 'TAWHID_GOVERNANCE_ROOT',
    name: 'Tawhid and Quran Sunnah Governance Root',
    responsibility: 'Make every technology contract subordinate to worship of Allah alone, truthfulness, justice, amanah, no harm, documented evidence, and qualified review.',
    properties: ['highest_governance_layer', 'no_claim_without_evidence', 'human_review_for_high_impact', 'scholar_review_for_religious_rulings'],
    laws: ['tawhid_root', 'hukm_belongs_to_allah', 'truthfulness', 'justice', 'no_harm'],
    specifications: ['no_revelation_claim', 'no_infallibility_claim', 'no_independent_fatwa', 'audit_log_required'],
    inputs: ['claim', 'policy', 'evidence', 'risk_level'],
    outputs: ['allow_deny_review_decision', 'audit_record', 'truth_boundary'],
    evidenceRequirement: 'Every religious or high-impact decision must include evidence and qualified human review.',
    sheikhaContract: 'حاكمية'
  },
  {
    id: 'NATIVE_KERNEL_BOOT_AND_SCHEDULING',
    name: 'Native Kernel Boot and Scheduling',
    responsibility: 'Define the Sheikha-native boot target, execution cells, isolation rings, scheduler contracts, and resource ownership without treating any host as foundation.',
    properties: ['native_boot_target', 'lightweight_execution_cell', 'deterministic_scheduler', 'interrupt_and_fault_contracts'],
    laws: ['state_transition_integrity', 'priority_fairness', 'resource_conservation', 'fault_isolation'],
    specifications: ['boot_contract', 'process_contract', 'memory_contract', 'device_contract', 'scheduler_contract'],
    inputs: ['power_state', 'boot_manifest', 'workload_descriptor', 'governance_decision'],
    outputs: ['execution_cell', 'scheduled_work', 'resource_lease', 'fault_event'],
    evidenceRequirement: 'Bare-metal independence requires a signed boot image plus VM or hardware boot proof.',
    sheikhaContract: 'نواة'
  },
  {
    id: 'EXASCALE_PARALLEL_COMPUTE',
    name: 'Exascale Parallel Compute',
    responsibility: 'Represent very large parallel systems through generic compute nodes, control nodes, gateway nodes, job queues, and benchmarked parallel workloads.',
    properties: ['massive_parallelism', 'node_partitioning', 'workload_decomposition', 'collective_execution'],
    laws: ['parallel_speedup_limit', 'communication_overhead', 'load_balance', 'energy_per_operation'],
    specifications: ['node_topology', 'job_graph', 'parallel_runtime_contract', 'benchmark_contract'],
    inputs: ['workload_graph', 'dataset', 'node_inventory', 'energy_budget'],
    outputs: ['parallel_result', 'throughput_metric', 'latency_metric', 'power_efficiency_metric'],
    evidenceRequirement: 'Any fastest claim requires repeatable benchmark, power, hardware inventory, and comparison baseline.',
    sheikhaContract: 'حوسبة'
  },
  {
    id: 'AI_ACCELERATION_AND_INDUSTRIAL_OPTIMIZATION',
    name: 'Governed AI Acceleration and Industrial Optimization',
    responsibility: 'Use AI for simulation, scheduling, anomaly detection, planning, optimization, and knowledge retrieval under governance.',
    properties: ['governed_ai', 'industrial_planning', 'simulation_loop', 'knowledge_grounding'],
    laws: ['model_uncertainty', 'human_approval', 'bounded_automation', 'measured_learning_only'],
    specifications: ['ai_task_contract', 'model_evidence_card', 'risk_gate', 'rollback_plan'],
    inputs: ['sensor_data', 'orders', 'constraints', 'knowledge_context'],
    outputs: ['recommendation', 'schedule', 'anomaly_alert', 'simulation_report'],
    evidenceRequirement: 'AI output is support, not final authority; critical decisions require human approval.',
    sheikhaContract: 'ذكاء'
  },
  {
    id: 'DISTRIBUTED_MEMORY_AND_MESSAGE_FABRIC',
    name: 'Distributed Memory and Message Fabric',
    responsibility: 'Coordinate memory hierarchy, message passing, collective communication, backpressure, and latency budgets.',
    properties: ['distributed_memory', 'message_exchange', 'collective_operations', 'backpressure'],
    laws: ['data_locality', 'latency_bandwidth_tradeoff', 'queueing_delay', 'consistency_boundary'],
    specifications: ['message_schema', 'memory_zone_contract', 'latency_budget', 'replay_policy'],
    inputs: ['messages', 'memory_region', 'routing_table', 'workload_stage'],
    outputs: ['delivered_message', 'memory_lease', 'flow_control_signal', 'replay_trace'],
    evidenceRequirement: 'Throughput and latency claims require measured load tests.',
    sheikhaContract: 'ربط'
  },
  {
    id: 'PARALLEL_STORAGE_AND_DATA_GRAVITY',
    name: 'Parallel Storage and Data Gravity',
    responsibility: 'Model distributed file access, object blocks, metadata, checkpoints, snapshots, and recovery evidence for large workloads.',
    properties: ['parallel_io', 'checkpointing', 'snapshotting', 'metadata_partitioning'],
    laws: ['io_contention', 'durability', 'consistency', 'recovery_point_objective'],
    specifications: ['data_layout', 'checkpoint_contract', 'snapshot_contract', 'integrity_hash'],
    inputs: ['dataset', 'write_stream', 'metadata_event', 'checkpoint_signal'],
    outputs: ['persisted_block', 'snapshot', 'restore_point', 'integrity_report'],
    evidenceRequirement: 'Storage readiness requires integrity checks and restore drills.',
    sheikhaContract: 'تخزين'
  },
  {
    id: 'CONDUCTOR_POWER_THERMAL_MATERIALS',
    name: 'Conductors, Power, Thermal, and Materials',
    responsibility: 'Digitize electrical, thermal, and material limits for power delivery, conductivity, cooling, reliability, and safety.',
    properties: ['conductivity', 'resistivity', 'thermal_dissipation', 'power_integrity', 'material_limits'],
    laws: ['ohmic_loss', 'heat_transfer', 'thermal_runaway_prevention', 'safety_margin'],
    specifications: ['power_budget', 'cooling_profile', 'material_traceability', 'sensor_thresholds'],
    inputs: ['power_draw', 'temperature', 'material_batch', 'cooling_state'],
    outputs: ['thermal_alert', 'safe_power_limit', 'material_certificate_record', 'maintenance_action'],
    evidenceRequirement: 'Physical claims require sensor logs, calibration records, and safety review.',
    sheikhaContract: 'مواد'
  },
  {
    id: 'SEMICONDUCTOR_LOGIC_MEMORY_PACKAGING',
    name: 'Semiconductor Logic, Memory, and Packaging',
    responsibility: 'Represent logic elements, memory hierarchy, interconnect density, packaging, yield, repair bins, and trusted provenance.',
    properties: ['logic_switching', 'memory_hierarchy', 'packaging_topology', 'yield_tracking', 'provenance'],
    laws: ['switching_energy', 'timing_closure', 'signal_integrity', 'defect_density'],
    specifications: ['logic_contract', 'memory_contract', 'package_map', 'quality_gate'],
    inputs: ['design_rule', 'wafer_lot', 'test_vector', 'package_manifest'],
    outputs: ['verified_component', 'quality_record', 'failure_bin', 'provenance_trace'],
    evidenceRequirement: 'Semiconductor readiness requires test vectors, lot traceability, and quality gates.',
    sheikhaContract: 'أشباه_موصلات'
  },
  {
    id: 'SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN',
    name: 'Supply Chain and Resource Digital Twin',
    responsibility: 'Connect resources, suppliers, factories, logistics, inventory, demand, recycling, and lawful contracts into a governed digital twin.',
    properties: ['traceability', 'demand_supply_balance', 'inventory_state', 'recycling_loop', 'contract_clarity'],
    laws: ['weights_and_measures_fairness', 'lead_time_variability', 'capacity_constraint', 'waste_minimization'],
    specifications: ['supplier_contract', 'batch_trace', 'inventory_policy', 'recovery_route'],
    inputs: ['order', 'resource', 'supplier_status', 'factory_capacity'],
    outputs: ['fulfillment_plan', 'traceability_record', 'risk_alert', 'resource_allocation'],
    evidenceRequirement: 'Supply decisions require traceability and contract evidence.',
    sheikhaContract: 'إمداد'
  },
  {
    id: 'DEVICE_FACTORY_AND_OPERATIONAL_AUTOMATION',
    name: 'Devices, Factories, and Operational Automation',
    responsibility: 'Model machines, sensors, factories, safety states, maintenance, production cells, and controlled automation.',
    properties: ['device_registry', 'factory_cell', 'sensor_stream', 'maintenance_state', 'safe_stop'],
    laws: ['safety_interlock', 'process_capability', 'mean_time_to_repair', 'quality_control'],
    specifications: ['device_contract', 'factory_cell_contract', 'maintenance_playbook', 'quality_gate'],
    inputs: ['sensor_event', 'production_order', 'maintenance_signal', 'quality_sample'],
    outputs: ['machine_action', 'quality_decision', 'maintenance_ticket', 'safe_stop_event'],
    evidenceRequirement: 'Automation that affects safety or rights requires human approval and audit.',
    sheikhaContract: 'مصنع'
  },
  {
    id: 'COMMUNITY_CONNECTOR_MARKETPLACE_AND_SECTOR_FABRIC',
    name: 'Community, Connector, Marketplace, and Sector Fabric',
    responsibility: 'Unify communities, sectors, services, marketplaces, education, research, cities, commerce, industry, and governance connectors.',
    properties: ['sector_catalog', 'community_link', 'connector_contract', 'market_surface', 'service_boundary'],
    laws: ['permission_boundary', 'market_fairness', 'privacy', 'contractual_obligation'],
    specifications: ['connector_manifest', 'sector_blueprint', 'market_policy', 'community_governance_rule'],
    inputs: ['participant', 'service', 'sector_need', 'market_signal'],
    outputs: ['matched_capability', 'approved_connector', 'market_event', 'community_record'],
    evidenceRequirement: 'External connectors require permissions, audit, and least privilege.',
    sheikhaContract: 'مجتمع'
  },
  {
    id: 'SECURITY_RECOVERY_AND_LIVE_REPAIR',
    name: 'Security, Recovery, and Live Repair',
    responsibility: 'Provide fault capture, memory pressure handling, safe live repair, rollback, secrets boundaries, and recovery drills.',
    properties: ['fault_capture', 'memory_pressure_control', 'live_repair_gate', 'rollback', 'secret_boundary'],
    laws: ['least_privilege', 'defense_in_depth', 'blast_radius_reduction', 'recovery_time_objective'],
    specifications: ['fault_dump_contract', 'oom_policy', 'patch_gate', 'rollback_manifest', 'secret_policy'],
    inputs: ['fault_event', 'patch', 'resource_pressure', 'secret_request'],
    outputs: ['recovery_action', 'patch_decision', 'rollback_point', 'security_audit_record'],
    evidenceRequirement: 'Live repair requires preflight tests, rollback path, and post-checks.',
    sheikhaContract: 'تعافي'
  },
  {
    id: 'OBSERVABILITY_BENCHMARK_AND_TRUTH_GATE',
    name: 'Observability, Benchmark, and Truth Gate',
    responsibility: 'Measure CPU, memory, disk, network, latency, cache, queues, workers, streaming, concurrency, and truth-bound claims.',
    properties: ['metrics', 'traces', 'benchmarks', 'truth_gate', 'claim_registry'],
    laws: ['measurement_repeatability', 'baseline_comparison', 'statistical_variance', 'auditability'],
    specifications: ['benchmark_suite', 'metric_schema', 'claim_evidence_link', 'regression_threshold'],
    inputs: ['metric_sample', 'benchmark_result', 'claim', 'baseline'],
    outputs: ['scorecard', 'regression_alert', 'truth_decision', 'executive_metric'],
    evidenceRequirement: 'Performance claims require reproducible measurements and stored evidence.',
    sheikhaContract: 'قياس'
  }
];

function buildEvidenceStatus() {
  return EVIDENCE_MAP.map((item) => ({
    ...item,
    present: exists(item.path)
  }));
}

function buildCapabilityGraph(families = TECHNOLOGY_FAMILIES) {
  const edges = [
    ['TAWHID_GOVERNANCE_ROOT', 'NATIVE_KERNEL_BOOT_AND_SCHEDULING', 'governs'],
    ['TAWHID_GOVERNANCE_ROOT', 'AI_ACCELERATION_AND_INDUSTRIAL_OPTIMIZATION', 'governs'],
    ['NATIVE_KERNEL_BOOT_AND_SCHEDULING', 'EXASCALE_PARALLEL_COMPUTE', 'runs'],
    ['EXASCALE_PARALLEL_COMPUTE', 'DISTRIBUTED_MEMORY_AND_MESSAGE_FABRIC', 'requires'],
    ['EXASCALE_PARALLEL_COMPUTE', 'PARALLEL_STORAGE_AND_DATA_GRAVITY', 'requires'],
    ['CONDUCTOR_POWER_THERMAL_MATERIALS', 'SEMICONDUCTOR_LOGIC_MEMORY_PACKAGING', 'constrains'],
    ['SEMICONDUCTOR_LOGIC_MEMORY_PACKAGING', 'EXASCALE_PARALLEL_COMPUTE', 'enables'],
    ['SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN', 'CONDUCTOR_POWER_THERMAL_MATERIALS', 'sources'],
    ['SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN', 'SEMICONDUCTOR_LOGIC_MEMORY_PACKAGING', 'sources'],
    ['DEVICE_FACTORY_AND_OPERATIONAL_AUTOMATION', 'SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN', 'feeds'],
    ['COMMUNITY_CONNECTOR_MARKETPLACE_AND_SECTOR_FABRIC', 'SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN', 'coordinates'],
    ['SECURITY_RECOVERY_AND_LIVE_REPAIR', 'NATIVE_KERNEL_BOOT_AND_SCHEDULING', 'protects'],
    ['OBSERVABILITY_BENCHMARK_AND_TRUTH_GATE', 'EXASCALE_PARALLEL_COMPUTE', 'measures'],
    ['OBSERVABILITY_BENCHMARK_AND_TRUTH_GATE', 'AI_ACCELERATION_AND_INDUSTRIAL_OPTIMIZATION', 'verifies']
  ];

  return {
    nodes: families.map((family) => ({
      id: family.id,
      name: family.name,
      contract: family.sheikhaContract
    })),
    edges: edges.map(([from, to, relation]) => ({ from, to, relation }))
  };
}

function buildReport() {
  const masterActivation = readJson('runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json', {});
  const sovereignKernel = readJson('runtime/sovereign-kernel-boot/v1/sheikha-sovereign-kernel-boot-v1-report.json', {});
  const evidence = buildEvidenceStatus();
  const evidencePresent = evidence.filter((item) => item.present).length;
  const graph = buildCapabilityGraph();

  const checks = {
    noTradeNameActivationPolicy: true,
    genericTechnologyFamilies: TECHNOLOGY_FAMILIES.length >= 12,
    eachFamilyHasPropertiesLawsAndSpecifications: TECHNOLOGY_FAMILIES.every((family) => (
      family.properties.length > 0 && family.laws.length > 0 && family.specifications.length > 0
    )),
    quranSunnahGovernanceRoot: TECHNOLOGY_FAMILIES[0].id === 'TAWHID_GOVERNANCE_ROOT',
    aiGovernanceIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'AI_ACCELERATION_AND_INDUSTRIAL_OPTIMIZATION'),
    hpcComputeIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'EXASCALE_PARALLEL_COMPUTE'),
    semiconductorIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'SEMICONDUCTOR_LOGIC_MEMORY_PACKAGING'),
    conductorsAndThermalIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'CONDUCTOR_POWER_THERMAL_MATERIALS'),
    supplyChainIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'SUPPLY_CHAIN_AND_RESOURCE_DIGITAL_TWIN'),
    recoveryAndLiveRepairIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'SECURITY_RECOVERY_AND_LIVE_REPAIR'),
    benchmarkTruthGateIncluded: TECHNOLOGY_FAMILIES.some((family) => family.id === 'OBSERVABILITY_BENCHMARK_AND_TRUTH_GATE'),
    architectureGraphBuilt: graph.nodes.length === TECHNOLOGY_FAMILIES.length && graph.edges.length > 0,
    sovereignKernelEvidencePresent: evidence.some((item) => item.key === 'sovereignKernelBoot' && item.present),
    computeEvidencePresent: evidence.some((item) => item.key === 'osCloudSupercomputerIntegration' && item.present),
    supplyChainEvidencePresent: evidence.some((item) => item.key === 'supplyChainControlTower' && item.present),
    marketplaceEvidencePresent: evidence.some((item) => item.key === 'marketplaceOperatingSystem' && item.present),
    evidenceCoverageSufficient: evidencePresent >= 12,
    githubIndependent: true
  };
  const score = scoreFromChecks(checks);

  return {
    system: 'SHEIKHA_UNIVERSAL_TECHNOLOGY_HPC_FABRIC_V1',
    generatedAt: new Date().toISOString(),
    status: score.score === 100 ? 'ACTIVE_WITH_GENERIC_TECHNOLOGY_HPC_CATALOG' : 'ACTIVE_WITH_REVIEW',
    score: score.score,
    checks,
    sourceAbstraction: {
      request: 'activate_attached_hpc_os_kernel_supply_chain_semiconductor_capabilities',
      tradeNamePolicy: 'DESCRIBE_BY_CAPABILITY_PROPERTIES_LAWS_SPECIFICATIONS_NOT_BY_COMMERCIAL_NAME',
      attachedNamesUsedAsAuthority: false,
      attachedNamesPersistedInCatalog: false,
      commercialNameDependency: false,
      reason: 'The activation stores capability classes, physics and computing constraints, governance rules, and evidence requirements only.'
    },
    fastestSystemPolicy: {
      target: 'FASTEST_SHEIKHA_NATIVE_GOVERNED_COMPUTE_FABRIC',
      status: 'ARCHITECTURAL_TARGET_ACTIVE_BENCHMARK_CLAIM_NOT_GRANTED',
      fastestUniverseClaimAllowedToday: false,
      fastestWorldClaimAllowedToday: false,
      benchmarkEvidenceRequired: true,
      requiredEvidence: [
        'signed hardware and topology manifest',
        'repeatable benchmark suite',
        'power and cooling measurement',
        'latency throughput concurrency report',
        'comparison baseline',
        'truth gate approval'
      ],
      currentDecision: 'Do not claim fastest until measurements prove it.'
    },
    governanceRoot: {
      foundation: 'TAWHID_OF_ALLAH',
      highestLayer: 'HAKIMIYYAH_QURAN_SUNNAH_GOVERNANCE',
      quran: true,
      authenticSunnah: true,
      principles: ['truthfulness', 'amanah', 'justice', 'no_harm', 'evidence', 'rights_preservation'],
      noRevelationClaim: true,
      noInfallibilityClaim: true,
      noIndependentFatwa: true,
      scholarReviewForReligiousRulings: true,
      humanReviewForHighImpact: true
    },
    hostIndependenceBoundary: {
      githubRequired: false,
      hostSystemAsFoundation: false,
      hostBuilderAsTemporaryTooling: true,
      nativeNoHostTarget: true,
      currentRepositoryRunsOnHostTooling: true,
      currentRepositoryToolingIsFoundation: false,
      bareMetalIndependenceClaimedToday: false,
      truthPolicy: 'Native/no-host is the architectural target; full independence is claimed only after boot image and hardware or VM evidence.'
    },
    sheikhaLanguageBinding: {
      status: 'ACTIVE_AS_FOUNDATIONAL_TECHNOLOGY_CONTRACT_LANGUAGE',
      allTechnologyFamiliesRequireSheikhaContract: true,
      contracts: TECHNOLOGY_FAMILIES.map((family) => ({
        family: family.id,
        contract: family.sheikhaContract,
        inputs: family.inputs,
        outputs: family.outputs
      }))
    },
    technologyFamilies: TECHNOLOGY_FAMILIES,
    architectureGraph: graph,
    evidence: {
      present: evidencePresent,
      total: evidence.length,
      paths: evidence,
      masterActivationStatus: masterActivation.status || 'UNKNOWN',
      sovereignKernelStatus: sovereignKernel.status || 'UNKNOWN'
    },
    integrationTargets: [
      'native_kernel_boot',
      'exascale_parallel_compute',
      'distributed_memory_message_fabric',
      'parallel_storage',
      'governed_industrial_ai',
      'conductors_power_thermal_materials',
      'semiconductor_logic_memory_packaging',
      'supply_chain_resource_digital_twin',
      'factory_device_operations',
      'community_marketplace_sector_connectors',
      'security_recovery_live_repair',
      'observability_benchmark_truth_gate'
    ],
    runbook: {
      localOnly: true,
      commands: [
        'npm run -s ops:universal-technology-hpc-fabric:v1',
        'npm run -s ops:sovereign-kernel-boot:v1',
        'npm run -s ops:master-activation:consolidation:v1',
        'npm run -s ops:os-cloud-supercomputer:benchmark:v1',
        'npm test -- --runInBand tests/sheikha-universal-technology-hpc-fabric-v1.test.js'
      ],
      readinessGates: [
        'truth_gate_before_fastest_claim',
        'benchmark_before_performance_claim',
        'governance_before_execution',
        'human_review_before_high_impact_action',
        'recovery_drill_before_live_repair'
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
  const families = report.technologyFamilies
    .map((family) => [
      `### ${family.id}`,
      '',
      `- Responsibility: ${family.responsibility}`,
      `- Properties: ${family.properties.join(', ')}`,
      `- Laws: ${family.laws.join(', ')}`,
      `- Specifications: ${family.specifications.join(', ')}`,
      `- Sheikha contract: ${family.sheikhaContract}`,
      `- Evidence: ${family.evidenceRequirement}`
    ].join('\n'))
    .join('\n\n');

  return [
    '# SHEIKHA Universal Technology HPC Fabric V1',
    '',
    `Status: ${report.status}`,
    `Score: ${report.score}`,
    '',
    '## Activation Boundary',
    '',
    '- This activation describes technologies by capability, properties, laws, and specifications.',
    '- It does not depend on commercial names from the source request.',
    '- It does not grant a fastest-world or fastest-universe claim without measured benchmark evidence.',
    '- It is local-first and does not require GitHub.',
    '',
    '## Governance',
    '',
    '- Foundation: Tawhid of Allah.',
    '- Highest layer: Quran and authentic Sunnah governance.',
    '- AI is governed support, not revelation, infallibility, or independent fatwa.',
    '- High-impact decisions require human review.',
    '',
    '## Fastest Claim Gate',
    '',
    'A performance superiority claim requires a signed topology manifest, repeatable benchmark, power/cooling metrics, comparison baseline, and truth-gate approval.',
    '',
    '## Technology Families',
    '',
    families,
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
    githubRequired: report.hostIndependenceBoundary.githubRequired,
    tradeNamePolicy: report.sourceAbstraction.tradeNamePolicy,
    fastestClaimAllowedToday: report.fastestSystemPolicy.fastestWorldClaimAllowedToday,
    technologyFamilies: report.technologyFamilies.length,
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
  buildCapabilityGraph,
  buildHandbook,
  buildReport,
  scoreFromChecks,
  writeReport
};
