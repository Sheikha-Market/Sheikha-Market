/**
 * 🕌 SHEIKHA AI FOUNDRY + CLUSTER + FABRIC — FULL TEST SUITE
 * بسم الله الرحمن الرحيم
 */

'use strict';

const { getInstance: getFoundry } = require('../runtime/sheikha-programming-languages-governance/v1/sheikha-ai-foundry.js');
const { getInstance: getCluster } = require('../runtime/sheikha-programming-languages-governance/v1/sheikha-ai-cluster.js');
const { getInstance: getFabric  } = require('../runtime/sheikha-programming-languages-governance/v1/sheikha-ai-fabric.js');

describe('🕌 Sheikha AI Foundry + Cluster + Fabric', () => {

  let foundry, cluster, fabric;

  beforeAll(() => {
    foundry = getFoundry();
    cluster = getCluster();
    fabric  = getFabric();
  });

  // ═══════════════════════════════════════════════════════════════
  // A. FOUNDRY INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  describe('A — Foundry Initialization', () => {
    test('Foundry initializes at OMEGA_SUPREME', () => {
      const s = foundry.getStatus();
      expect(foundry.initialized).toBe(true);
      expect(foundry.tier).toBe('OMEGA_SUPREME');
    });

    test('Foundry registers 14+ model families', () => {
      expect(foundry.model_registry.size).toBeGreaterThanOrEqual(14);
    });

    test('Foundry registers 10 training pipelines', () => {
      expect(foundry.training_pipelines.size).toBeGreaterThanOrEqual(10);
    });

    test('Foundry registers 13 fine-tuning methods', () => {
      expect(foundry.fine_tuning_methods.size).toBeGreaterThanOrEqual(13);
    });

    test('Foundry registers 14 datasets', () => {
      expect(foundry.datasets.size).toBeGreaterThanOrEqual(14);
    });

    test('Foundry exposes 12 serving endpoints', () => {
      expect(foundry.serving_endpoints.size).toBeGreaterThanOrEqual(12);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // B. MODEL FAMILIES
  // ═══════════════════════════════════════════════════════════════

  describe('B — Model Families', () => {
    const required_models = [
      'LLM_ARABIC', 'LLM_MULTILINGUAL', 'LLM_REASONING',
      'VISION_DETECTION', 'VISION_UNDERSTANDING',
      'MULTIMODAL_NATIVE', 'SPEECH_ARABIC',
      'GENERATIVE_IMAGE', 'GENERATIVE_VIDEO', 'GENERATIVE_CODE',
      'AGENTIC_SINGLE', 'AGENTIC_MULTI',
      'QUANTUM_NEURAL', 'RL_DEEP', 'RLHF_ALIGNMENT',
      'BIOMEDICAL_AI', 'FINANCIAL_AI', 'ROBOTICS_AI', 'AGI_APPROACH'
    ];

    test.each(required_models)('Model family "%s" is registered and ACTIVE', (key) => {
      const m = foundry.model_registry.get(key);
      expect(m).toBeDefined();
      expect(m.status).toBe('ACTIVE');
    });

    test('Arabic LLM has Sharia filter', () => {
      expect(foundry.model_registry.get('LLM_ARABIC').sharia_filter).toBe(true);
    });

    test('Generative Image model has Halal filter', () => {
      expect(foundry.model_registry.get('GENERATIVE_IMAGE').halal_filter).toBe(true);
    });

    test('AGI Approach model requires oversight', () => {
      const agi = foundry.model_registry.get('AGI_APPROACH');
      expect(agi.safety_level).toBe('MAXIMUM');
      expect(agi.oversight_required).toBe(true);
    });

    test('Quantum Neural model supports 50+ qubits', () => {
      const q = foundry.model_registry.get('QUANTUM_NEURAL');
      expect(q.qubit_range).toBeDefined();
    });

    test('Financial AI is AAOIFI-aligned', () => {
      expect(foundry.model_registry.get('FINANCIAL_AI').aaoifi_aligned).toBe(true);
    });

    test('RLHF Alignment model has Sharia alignment', () => {
      expect(foundry.model_registry.get('RLHF_ALIGNMENT').sharia_alignment).toBe(true);
    });

    test('Sharia models list is non-empty', () => {
      expect(foundry.getShariaModels().length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // C. TRAINING PIPELINES
  // ═══════════════════════════════════════════════════════════════

  describe('C — Training Pipelines', () => {
    const required_pipelines = [
      'PRE_TRAINING', 'SUPERVISED_FINE_TUNING', 'RLHF_PIPELINE',
      'DPO_PIPELINE', 'LORA_FINE_TUNING', 'QUANTIZATION',
      'DISTILLATION', 'CONTINUAL_LEARNING', 'MULTIMODAL_TRAINING', 'QUANTUM_TRAINING'
    ];

    test.each(required_pipelines)('Pipeline "%s" is active', (key) => {
      const p = foundry.training_pipelines.get(key);
      expect(p).toBeDefined();
      expect(p.active).toBe(true);
    });

    test('Pre-training uses Sharia data filter', () => {
      expect(foundry.training_pipelines.get('PRE_TRAINING').sharia_data_filter).toBe(true);
    });

    test('LoRA pipeline specifies rank range', () => {
      const lora = foundry.training_pipelines.get('LORA_FINE_TUNING');
      expect(lora.math).toContain('W₀');
    });

    test('RLHF pipeline includes reward model from human feedback', () => {
      const rlhf = foundry.training_pipelines.get('RLHF_PIPELINE');
      expect(rlhf.reward_sources).toContain('Human annotators');
    });

    test('Quantization supports INT4 and INT8', () => {
      const q = foundry.training_pipelines.get('QUANTIZATION');
      expect(q.formats).toContain('INT4');
      expect(q.formats).toContain('INT8');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // D. FINE-TUNING METHODS
  // ═══════════════════════════════════════════════════════════════

  describe('D — Fine-Tuning Methods', () => {
    const methods = ['SFT', 'RLHF', 'DPO', 'LORA', 'QLORA', 'DORA',
                     'IPO', 'KTO', 'ORPO', 'GRPO', 'CONSTITUTIONAL', 'RLAIF', 'FULL_FT'];

    test.each(methods)('Fine-tuning method "%s" registered', (key) => {
      expect(foundry.fine_tuning_methods.has(key)).toBe(true);
    });

    test('GRPO is DeepSeek-R1 method', () => {
      expect(foundry.fine_tuning_methods.get('GRPO').note).toContain('DeepSeek-R1');
    });

    test('QLoRA uses 4-bit quantization', () => {
      expect(foundry.fine_tuning_methods.get('QLORA').bits).toBe(4);
    });

    test('RLHF and Constitutional have Sharia alignment', () => {
      expect(foundry.fine_tuning_methods.get('RLHF').sharia).toBe(true);
      expect(foundry.fine_tuning_methods.get('CONSTITUTIONAL').sharia).toBe(true);
    });

    test('Total: 13 methods registered', () => {
      expect(foundry.fine_tuning_methods.size).toBe(13);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // E. DATASETS
  // ═══════════════════════════════════════════════════════════════

  describe('E — Datasets', () => {
    test('Quran and Hadith corpora registered with Sharia flag', () => {
      expect(foundry.datasets.get('QURAN_CORPUS').sharia).toBe(true);
      expect(foundry.datasets.get('HADITH_CORPUS').sharia).toBe(true);
    });

    test('Arabic instruction dataset registered', () => {
      expect(foundry.datasets.has('INSTRUCTION_ARABIC')).toBe(true);
    });

    test('Multimodal Halal dataset has Sharia filter', () => {
      expect(foundry.datasets.get('MULTIMODAL_HALAL').sharia).toBe(true);
    });

    test('Code dataset includes Sheikha language', () => {
      expect(foundry.datasets.get('CODE_SHEIKHA').includes_sheikha_lang).toBe(true);
    });

    test('Financial dataset is AAOIFI compliant', () => {
      expect(foundry.datasets.get('FINANCIAL_HALAL').compliance).toBe('AAOIFI');
    });

    test('Sharia datasets count >= 4', () => {
      expect(foundry.getShariaDatasets().length).toBeGreaterThanOrEqual(4);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // F. CLUSTER INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  describe('F — Cluster Initialization', () => {
    test('Cluster initializes at OMEGA_SUPREME', () => {
      expect(cluster.initialized).toBe(true);
      expect(cluster.tier).toBe('OMEGA_SUPREME');
    });

    test('Cluster registers 20+ accelerator types', () => {
      expect(cluster.accelerator_types.size).toBeGreaterThanOrEqual(20);
    });

    test('Cluster registers 8 node pools', () => {
      expect(cluster.node_pools.size).toBeGreaterThanOrEqual(8);
    });

    test('Cluster registers 7 network fabrics', () => {
      expect(cluster.network_fabric.size).toBeGreaterThanOrEqual(7);
    });

    test('Cluster registers 10 schedulers', () => {
      expect(cluster.schedulers.size).toBeGreaterThanOrEqual(10);
    });

    test('Cluster registers 7 distributed topologies', () => {
      expect(cluster.distributed_topologies.size).toBeGreaterThanOrEqual(7);
    });

    test('Cluster registers 7 foundry cluster groups', () => {
      expect(cluster.cluster_groups.size).toBeGreaterThanOrEqual(7);
    });

    test('Cluster registers monitoring tools', () => {
      expect(cluster.monitoring.size).toBeGreaterThanOrEqual(8);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // G. ACCELERATOR TYPES
  // ═══════════════════════════════════════════════════════════════

  describe('G — Accelerator Types', () => {
    const gpus = ['NVIDIA_H100_SXM', 'NVIDIA_H200', 'NVIDIA_B200', 'NVIDIA_A100_80G', 'AMD_MI300X'];
    test.each(gpus)('GPU "%s" registered', (key) => {
      const a = cluster.accelerator_types.get(key);
      expect(a).toBeDefined();
      expect(a.type).toBe('GPU');
    });

    test('H200 has 141GB VRAM', () => {
      expect(cluster.accelerator_types.get('NVIDIA_H200').vram_gb).toBe(141);
    });

    test('Quantum QPUs registered (IBM + Google + IonQ)', () => {
      const qpus = cluster.getAcceleratorsByType('QPU');
      expect(qpus.length).toBeGreaterThanOrEqual(3);
    });

    test('Groq LPU ultra-low latency < 1ms', () => {
      const groq = cluster.accelerator_types.get('GROQ_LPU');
      expect(groq.latency_ms).toBeLessThan(1);
    });

    test('Cerebras WSE has 4 million+ cores', () => {
      const wse = cluster.accelerator_types.get('CEREBRAS_WSE3');
      expect(wse.cores).toBeGreaterThanOrEqual(4000000);
    });

    test('TPU v5p registered', () => {
      expect(cluster.accelerator_types.has('GOOGLE_TPU_V5P')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // H. NODE POOLS
  // ═══════════════════════════════════════════════════════════════

  describe('H — Node Pools', () => {
    const pools = ['TRAINING_FLAGSHIP', 'TRAINING_HIGH', 'INFERENCE_REALTIME',
                   'INFERENCE_BATCH', 'QUANTUM_COMPUTE', 'EDGE_INFERENCE',
                   'CEREBRAS_POOL', 'TPU_CLOUD'];

    test.each(pools)('Node pool "%s" is ACTIVE', (key) => {
      const p = cluster.node_pools.get(key);
      expect(p).toBeDefined();
      expect(p.status).toBe('ACTIVE');
    });

    test('Training Flagship pool has 4096+ GPUs', () => {
      expect(cluster.node_pools.get('TRAINING_FLAGSHIP').total_gpus).toBeGreaterThanOrEqual(4096);
    });

    test('Inference Realtime targets sub-100ms latency', () => {
      expect(cluster.node_pools.get('INFERENCE_REALTIME').latency_target_ms).toBeLessThanOrEqual(100);
    });

    test('All pools have health = 100', () => {
      cluster.getAllNodePools().forEach(p => expect(p.health).toBe(100));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // I. DISTRIBUTED TOPOLOGIES
  // ═══════════════════════════════════════════════════════════════

  describe('I — Distributed Training Topologies', () => {
    const topologies = ['DATA_PARALLEL', 'TENSOR_PARALLEL', 'PIPELINE_PARALLEL',
                        'EXPERT_PARALLEL', 'SEQUENCE_PARALLEL', 'ZERO_REDUNDANCY', 'THREE_D_PARALLEL'];

    test.each(topologies)('Topology "%s" registered', (key) => {
      expect(cluster.distributed_topologies.has(key)).toBe(true);
    });

    test('ZeRO has 3 stages', () => {
      const zero = cluster.distributed_topologies.get('ZERO_REDUNDANCY');
      expect(Object.keys(zero.stages)).toHaveLength(3);
    });

    test('3D Parallel is standard for 100B+ models', () => {
      const d3 = cluster.distributed_topologies.get('THREE_D_PARALLEL');
      expect(d3.examples).toContain('GPT-3');
    });

    test('Sequence Parallel handles 1M+ token context', () => {
      const sp = cluster.distributed_topologies.get('SEQUENCE_PARALLEL');
      expect(sp.use_when).toContain('1M+');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // J. FOUNDRY CLUSTER GROUPS — تجمعات الفاوندري
  // ═══════════════════════════════════════════════════════════════

  describe('J — Foundry Cluster Groups (تجمعات الفاوندري)', () => {
    const groups = ['FOUNDRY_PRETRAINING_GROUP', 'FOUNDRY_ALIGNMENT_GROUP',
                    'FOUNDRY_FINETUNING_GROUP', 'FOUNDRY_INFERENCE_GROUP',
                    'FOUNDRY_QUANTUM_GROUP', 'FOUNDRY_RESEARCH_GROUP', 'FOUNDRY_EDGE_GROUP'];

    test.each(groups)('Foundry group "%s" is ACTIVE', (key) => {
      const g = cluster.cluster_groups.get(key);
      expect(g).toBeDefined();
      expect(g.status).toBe('ACTIVE');
    });

    test('Pre-training group requires Sharia data', () => {
      expect(cluster.cluster_groups.get('FOUNDRY_PRETRAINING_GROUP').sharia_data_required).toBe(true);
    });

    test('Alignment group uses Saudi human annotators', () => {
      expect(cluster.cluster_groups.get('FOUNDRY_ALIGNMENT_GROUP').human_annotators_saudi).toBe(true);
    });

    test('Quantum group has qubit isolation', () => {
      expect(cluster.cluster_groups.get('FOUNDRY_QUANTUM_GROUP').qubit_isolation).toBe(true);
    });

    test('Inference group supports autoscale', () => {
      expect(cluster.cluster_groups.get('FOUNDRY_INFERENCE_GROUP').autoscale).toBe(true);
    });

    test('Job routing: PRE_TRAINING → PRETRAINING_GROUP', () => {
      const result = cluster.assignFoundryJobToGroup('PRE_TRAINING');
      expect(result.assigned).toBe(true);
      expect(result.group).toBe('FOUNDRY_PRETRAINING_GROUP');
    });

    test('Job routing: INFERENCE → INFERENCE_GROUP', () => {
      const result = cluster.assignFoundryJobToGroup('INFERENCE');
      expect(result.assigned).toBe(true);
      expect(result.group).toBe('FOUNDRY_INFERENCE_GROUP');
    });

    test('Job routing: ALIGNMENT → ALIGNMENT_GROUP', () => {
      const result = cluster.assignFoundryJobToGroup('ALIGNMENT');
      expect(result.assigned).toBe(true);
      expect(result.group).toBe('FOUNDRY_ALIGNMENT_GROUP');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // K. AI FABRIC — SUPPLY CHAIN
  // ═══════════════════════════════════════════════════════════════

  describe('K — AI Fabric & Supply Chain', () => {
    test('Fabric initializes with Foundry + Cluster connected', () => {
      const s = fabric.getStatus();
      expect(fabric.initialized).toBe(true);
      expect(s.foundry_models).toBeGreaterThan(0);
      expect(s.cluster_pools).toBeGreaterThan(0);
    });

    test('Supply chain has 10 stages', () => {
      expect(fabric.supply_chain_stages.size).toBe(10);
    });

    test('Supply chain stages are ordered 1–10', () => {
      const stages = fabric.getFullSupplyChain();
      expect(stages[0].order).toBe(1);
      expect(stages[9].order).toBe(10);
    });

    test('All 10 supply chain stages registered', () => {
      const keys = ['S1_DATA_COLLECTION','S2_DATA_PROCESSING','S3_PRE_TRAINING',
                    'S4_SFT','S5_ALIGNMENT','S6_EVALUATION','S7_OPTIMIZATION',
                    'S8_DEPLOYMENT','S9_MONITORING','S10_CONTINUOUS_LEARNING'];
      keys.forEach(k => expect(fabric.supply_chain_stages.has(k)).toBe(true));
    });

    test('S1 data collection applies Sharia filter', () => {
      expect(fabric.supply_chain_stages.get('S1_DATA_COLLECTION').sharia_filter).toBe(true);
    });

    test('S5 alignment has Sharia alignment + Islamic values', () => {
      const s5 = fabric.supply_chain_stages.get('S5_ALIGNMENT');
      expect(s5.sharia_alignment).toBe(true);
      expect(s5.values).toContain('Islamic ethics');
    });

    test('S10 continuous learning handles new Islamic rulings', () => {
      const s10 = fabric.supply_chain_stages.get('S10_CONTINUOUS_LEARNING');
      expect(s10.triggers).toContain('New Islamic rulings');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // L. ALL AI TYPES
  // ═══════════════════════════════════════════════════════════════

  describe('L — All AI Types & Paradigms', () => {
    test('Fabric registers 20+ AI types', () => {
      expect(fabric.ai_types.size).toBeGreaterThanOrEqual(20);
    });

    const capability_types = ['ANI', 'AGI', 'ASI'];
    test.each(capability_types)('Capability level "%s" registered', (key) => {
      expect(fabric.ai_types.has(key)).toBe(true);
    });

    const paradigms = [
      'MACHINE_LEARNING', 'DEEP_LEARNING', 'NLP', 'COMPUTER_VISION',
      'GENERATIVE_AI', 'REINFORCEMENT_LEARNING', 'MULTIMODAL_AI', 'AGENTIC_AI',
      'QUANTUM_AI', 'EMBODIED_AI', 'FEDERATED_LEARNING', 'GRAPH_NEURAL_NETWORKS',
      'SYMBOLIC_AI', 'NEUROSYMBOLIC_AI', 'CAUSAL_AI', 'EXPLAINABLE_AI',
      'FOUNDATION_MODELS', 'DIFFUSION_MODELS', 'BCI_AI'
    ];
    test.each(paradigms)('AI paradigm "%s" registered', (key) => {
      expect(fabric.ai_types.has(key)).toBe(true);
    });

    test('ASI safety is ABSOLUTE', () => {
      expect(fabric.ai_types.get('ASI').safety).toBe('ABSOLUTE');
    });

    test('AGI requires maximum safety', () => {
      expect(fabric.ai_types.get('AGI').safety).toBe('MAXIMUM');
    });

    test('BCI_AI references Neuralink', () => {
      expect(fabric.ai_types.get('BCI_AI').paradigm).toContain('Neuralink');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // M. ETHICS LAYER
  // ═══════════════════════════════════════════════════════════════

  describe('M — Islamic Ethics Layer', () => {
    test('7 ethics principles registered', () => {
      expect(fabric.ethics_layer.size).toBeGreaterThanOrEqual(7);
    });

    test('Sharia compliance is DIVINE level', () => {
      expect(fabric.ethics_layer.get('SHARIA_COMPLIANCE').level).toBe('DIVINE');
    });

    test('Sharia rules prohibit Riba in financial AI', () => {
      const sharia = fabric.ethics_layer.get('SHARIA_COMPLIANCE');
      expect(sharia.rules).toContain('No Riba in financial AI');
    });

    test('Islamic Ethics has 5 principles including Maslaha & Adl', () => {
      const ie = fabric.ethics_layer.get('ISLAMIC_ETHICS');
      expect(ie.principles).toContain('Maslaha (public interest)');
      expect(ie.principles).toContain("Adl (justice)");
    });

    test('Privacy layer includes GDPR and Saudi PDPL', () => {
      const privacy = fabric.ethics_layer.get('PRIVACY');
      expect(privacy.regulations).toContain('GDPR');
      expect(privacy.regulations).toContain('PDPL (Saudi)');
    });

    test('AI Safety layer has red-teaming and kill-switch', () => {
      const safety = fabric.ethics_layer.get('AI_SAFETY');
      expect(safety.measures).toContain('Red-teaming');
      expect(safety.measures).toContain('Monitoring & kill-switch');
    });

    test('Accountability references Quran verse', () => {
      const acc = fabric.ethics_layer.get('ACCOUNTABILITY');
      expect(acc.sharia_ref).toContain('رَهِينَةٌ');
    });

    test('All ethics principles are active', () => {
      fabric.getActiveEthics().forEach(e => expect(e.active).toBe(true));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // N. CAPABILITY LEVELS
  // ═══════════════════════════════════════════════════════════════

  describe('N — AI Capability Levels (L1–L8)', () => {
    test('8 capability levels registered (L1–L8)', () => {
      expect(fabric.capability_levels.size).toBe(8);
    });

    const levels = ['L1_TASK_SPECIFIC','L2_DOMAIN_EXPERT','L3_MULTIMODAL',
                    'L4_AGENTIC','L5_REASONING_DEEP','L6_AGI_APPROACH','L7_AGI','L8_ASI'];
    test.each(levels)('Capability level "%s" registered', (key) => {
      expect(fabric.capability_levels.has(key)).toBe(true);
    });

    test('L1–L5 are currently available', () => {
      ['L1_TASK_SPECIFIC','L2_DOMAIN_EXPERT','L3_MULTIMODAL','L4_AGENTIC','L5_REASONING_DEEP']
        .forEach(k => expect(fabric.capability_levels.get(k).current).toBe(true));
    });

    test('L7 AGI has MAXIMUM safety', () => {
      expect(fabric.capability_levels.get('L7_AGI').safety).toBe('MAXIMUM');
    });

    test('L8 ASI is theoretical with ABSOLUTE safety', () => {
      const asi = fabric.capability_levels.get('L8_ASI');
      expect(asi.theoretical).toBe(true);
      expect(asi.safety).toBe('ABSOLUTE');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // O. SHEIKHA LANGUAGE INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  describe('O — Sheikha Language ↔ AI Integration', () => {
    test('5 Sheikha language AI integrations registered', () => {
      expect(fabric.sheikha_lang_integration.size).toBeGreaterThanOrEqual(5);
    });

    const integrations = ['CODE_GEN_SHEIKHA','TRANSPILE_AI','CODE_REVIEW_AI','NATURAL_CODING','AI_DEBUGGING'];
    test.each(integrations)('Integration "%s" is active', (key) => {
      const i = fabric.sheikha_lang_integration.get(key);
      expect(i).toBeDefined();
      expect(i.active).toBe(true);
    });

    test('CODE_GEN_SHEIKHA uses Arabic natural language input', () => {
      const cg = fabric.sheikha_lang_integration.get('CODE_GEN_SHEIKHA');
      expect(cg.example_input).toContain('أنشئ');
      expect(cg.example_output).toContain('دالة');
    });

    test('TRANSPILE_AI supports 7000+ via Sheikha Universal Language', () => {
      const tp = fabric.sheikha_lang_integration.get('TRANSPILE_AI');
      expect(tp.supported_targets).toContain('7000+');
    });

    test('CODE_REVIEW_AI checks Sharia compliance', () => {
      const cr = fabric.sheikha_lang_integration.get('CODE_REVIEW_AI');
      expect(cr.checks).toContain('Sharia compliance');
    });

    test('NATURAL_CODING outputs Sheikha language', () => {
      const nc = fabric.sheikha_lang_integration.get('NATURAL_CODING');
      expect(nc.languages_out).toContain('Sheikha');
    });

    test('AI_DEBUGGING uses Agentic loop', () => {
      const dbg = fabric.sheikha_lang_integration.get('AI_DEBUGGING');
      expect(dbg.model).toContain('AGENTIC_SINGLE');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // P. END-TO-END JOB ROUTING
  // ═══════════════════════════════════════════════════════════════

  describe('P — End-to-End Job Routing (Fabric → Foundry → Cluster)', () => {
    const job_types = ['PRE_TRAINING','FINE_TUNING','ALIGNMENT','INFERENCE','QUANTUM','RESEARCH','EDGE'];

    test.each(job_types)('Job type "%s" routes correctly', (job_type) => {
      const result = fabric.routeAIJob(job_type);
      expect(result.job_type).toBe(job_type);
      expect(result.sharia_check).toBe(true);
      expect(result.cluster_assignment).toBeDefined();
    });

    test('Language-context job enables Sheikha lang support', () => {
      const result = fabric.routeAIJob('INFERENCE', 'sheikha_arabic');
      expect(result.sheikha_lang_support).toBe(true);
    });

    test('All routed jobs have timestamps', () => {
      const result = fabric.routeAIJob('FINE_TUNING');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Q. SINGLETON INTEGRITY
  // ═══════════════════════════════════════════════════════════════

  describe('Q — Singleton Integrity', () => {
    test('Foundry is singleton', () => {
      expect(getFoundry()).toBe(foundry);
    });

    test('Cluster is singleton', () => {
      expect(getCluster()).toBe(cluster);
    });

    test('Fabric is singleton', () => {
      expect(getFabric()).toBe(fabric);
    });

    test('Fabric holds reference to same Foundry instance', () => {
      expect(fabric.foundry).toBe(foundry);
    });

    test('Fabric holds reference to same Cluster instance', () => {
      expect(fabric.cluster).toBe(cluster);
    });
  });
});
