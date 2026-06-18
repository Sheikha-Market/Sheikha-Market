'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'industrial-material-lifecycle-fabric');

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MATERIAL_STATES = ['SOLID', 'LIQUID', 'GAS', 'POWDER', 'SLURRY', 'ENERGY', 'DATA'];
const MATERIAL_STAGE = ['RAW_MATERIAL', 'SEMI_FINISHED', 'FINISHED', 'BYPRODUCT', 'WASTE', 'RECYCLED'];
const FACTORY_TYPES = [
  'PETROCHEMICAL',
  'CHEMICAL',
  'MECHANICAL',
  'REFINERY',
  'MINING',
  'ENERGY_OIL_GAS',
  'ENERGY_RENEWABLE',
  'UTILITIES',
  'MANUFACTURING',
  'LOGISTICS'
];

function status() {
  return {
    success: true,
    system: 'SHEIKHA_INDUSTRIAL_MATERIAL_LIFECYCLE_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 54,
    role: 'INDUSTRIAL_MATERIAL_ROOT_CLASSIFICATION_STORAGE_TRANSPORT_PRODUCTION_FABRIC',
    standardsAlignment: ['DATA_CLASSIFICATION', 'ISO_15926_LIFECYCLE_DATA', 'ISA_95_ENTERPRISE_CONTROL_INTEGRATION'],
    materialStates: MATERIAL_STATES,
    materialStages: MATERIAL_STAGE,
    factoryTypes: FACTORY_TYPES,
    governance: {
      principle: 'لا ضرر ولا ضرار',
      safeClassificationOnly: true,
      noHazardousRecipeGeneration: true,
      noDangerousOperatingParameters: true,
      noSecretExposure: true,
      envProtected: true,
      calculationOnly: true,
      noFuturePredictionClaim: true
    }
  };
}

function normalizeArabic(text = '') {
  return String(text)
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyInputKind(item = {}) {
  const t = normalizeArabic(`${item.name || ''} ${item.description || ''} ${item.inputKind || ''}`);
  if (/لقيط|مختلط|غير معروف|unknown|mixed/i.test(t)) return 'ORPHAN_OR_MIXED_INPUT';
  if (/خام|اولي|اوليه|raw/i.test(t)) return 'RAW_INPUT';
  if (/نصف مصنع|semi/i.test(t)) return 'SEMI_FINISHED_INPUT';
  if (/مصنع|finished/i.test(t)) return 'FINISHED_INPUT';
  return 'UNCLASSIFIED_INPUT';
}

function classifyConsistency(item = {}) {
  const t = normalizeArabic(`${item.consistency || ''} ${item.quality || ''} ${item.description || ''}`);
  if (/غير متسق|متغير|mixed|variable|inconsistent/i.test(t)) return 'INCONSISTENT';
  if (/متسق|مطابق|standard|consistent/i.test(t)) return 'CONSISTENT';
  return item.specification ? 'CONSISTENT' : 'UNKNOWN_CONSISTENCY';
}

function classifySupplier(item = {}) {
  const t = normalizeArabic(`${item.supplierRarity || ''} ${item.supplier || ''} ${item.description || ''}`);
  if (/نادر|rare|single source|وحيد/i.test(t)) return 'RARE_SUPPLIER';
  if (/متعدد|متوفر|common|available/i.test(t)) return 'NON_RARE_SUPPLIER';
  return 'SUPPLIER_RARITY_UNKNOWN';
}

function classifyState(item = {}) {
  const t = normalizeArabic(`${item.state || ''} ${item.description || ''}`);
  if (/صلب|solid|حديد|steel|خام/i.test(t)) return 'SOLID';
  if (/سائل|liquid|زيت|نفط|ماء/i.test(t)) return 'LIQUID';
  if (/غاز|gas|هواء|بخار|steam/i.test(t)) return 'GAS';
  if (/بودره|مسحوق|powder|barite|cement/i.test(t)) return 'POWDER';
  if (/معلق|slurry/i.test(t)) return 'SLURRY';
  if (/طاقه|كهرباء|energy|power/i.test(t)) return 'ENERGY';
  return 'UNKNOWN_STATE';
}

function classifyStage(item = {}) {
  const t = normalizeArabic(`${item.stage || ''} ${item.description || ''}`);
  if (/خام|اولي|اوليه|ore|crude|raw/i.test(t)) return 'RAW_MATERIAL';
  if (/نصف مصنع|semi/i.test(t)) return 'SEMI_FINISHED';
  if (/مصنع|منتج نهائي|finished/i.test(t)) return 'FINISHED';
  if (/ناتج جانبي|byproduct/i.test(t)) return 'BYPRODUCT';
  if (/نفايات|waste/i.test(t)) return 'WASTE';
  if (/معاد تدوير|recycled|scrap/i.test(t)) return 'RECYCLED';
  return 'RAW_MATERIAL';
}

function classifyFactory(factory = {}) {
  const t = normalizeArabic(`${factory.type || ''} ${factory.name || ''} ${factory.description || ''}`);
  if (/بتروكيم|petro/i.test(t)) return 'PETROCHEMICAL';
  if (/كيميائ|chemical/i.test(t)) return 'CHEMICAL';
  if (/ميكانيك|mechanical|machine/i.test(t)) return 'MECHANICAL';
  if (/تكرير|refinery|refining/i.test(t)) return 'REFINERY';
  if (/تعدين|منجم|mine|mining|ore/i.test(t)) return 'MINING';
  if (/بترول|نفط|غاز|oil|gas/i.test(t)) return 'ENERGY_OIL_GAS';
  if (/متجدد|شمسي|رياح|renewable|solar|wind/i.test(t)) return 'ENERGY_RENEWABLE';
  if (/مرافق|بخار|ماء|كهرباء|utility|steam|water/i.test(t)) return 'UTILITIES';
  return 'MANUFACTURING';
}

function storageMethod(material = {}) {
  const state = classifyState(material);
  const stage = classifyStage(material);
  const supplier = classifySupplier(material);

  if (state === 'SOLID' || state === 'POWDER') return 'PACKET_CONTAINER_WITH_LOT_NUMBER';
  if (state === 'LIQUID' || state === 'SLURRY') return 'TANK_BATCH_WITH_SAMPLE_TRACE';
  if (state === 'GAS') return 'CONTROLLED_STREAM_METERED_LINE';
  if (state === 'ENERGY') return 'METERED_ENERGY_LEDGER';
  if (supplier === 'RARE_SUPPLIER') return 'CONTROLLED_RESERVED_STORAGE_WITH_APPROVAL';
  if (stage === 'FINISHED') return 'FINISHED_GOODS_BIN_AND_SERIAL';
  return 'CLASSIFIED_GENERAL_STORAGE';
}

function transportMethod(material = {}) {
  const state = classifyState(material);
  if (state === 'SOLID' || state === 'POWDER') return 'PACKET_CONTAINER';
  if (state === 'LIQUID' || state === 'SLURRY') return 'LIQUID_STREAM_OR_TANKER';
  if (state === 'GAS') return 'METERED_PIPELINE_OR_CYLINDER';
  if (state === 'ENERGY') return 'GRID_OR_ENERGY_CONTRACT_LEDGER';
  return 'GOVERNED_TRANSFER_RECORD';
}

function indexCode(material = {}, factory = {}, seq = 1) {
  const factoryType = classifyFactory(factory).slice(0, 3);
  const state = classifyState(material).slice(0, 3);
  const stage = classifyStage(material).slice(0, 3);
  const input = classifyInputKind(material).slice(0, 3);
  const n = String(seq).padStart(5, '0');
  return `SHK-${factoryType}-${stage}-${state}-${input}-${n}`;
}

function arabicGrammarTags(material = {}) {
  const name = String(material.name || 'مادة');
  return {
    اسم: name,
    نوع: 'اسم مادة/أصل صناعي',
    حالة: classifyState(material),
    مرحلة: classifyStage(material),
    صفة: material.properties || [],
    قانون: material.rules || [],
    علاقة_نحوية: {
      المادة: 'مبتدأ صناعي',
      الحالة: 'خبر وصفي',
      المصنع: 'متعلق تشغيلي',
      التحويل: 'فعل صناعي محكوم'
    }
  };
}

function conversionPlan(material = {}, target = {}) {
  const fromState = classifyState(material);
  const toState = classifyState(target);
  const fromStage = classifyStage(material);
  const toStage = classifyStage(target);

  return {
    allowedAsPlan: true,
    fromState,
    toState,
    fromStage,
    toStage,
    transformationClass: `${fromStage}_TO_${toStage}`,
    requiredControls: [
      'SPECIFICATION_CHECK',
      'QUALITY_GATE',
      'LOT_TRACEABILITY',
      'SAFETY_REVIEW',
      'ENVIRONMENTAL_REVIEW',
      'HUMAN_APPROVAL_FOR_CRITICAL_PROCESS'
    ],
    blockedDetails: [
      'NO_HAZARDOUS_RECIPE',
      'NO_DANGEROUS_OPERATING_PARAMETERS',
      'NO_UNVERIFIED_CHEMICAL_INSTRUCTIONS'
    ]
  };
}

function classifyMaterial(material = {}, factory = {}, seq = 1) {
  return {
    inputKind: classifyInputKind(material),
    consistency: classifyConsistency(material),
    supplierClass: classifySupplier(material),
    state: classifyState(material),
    stage: classifyStage(material),
    storage: storageMethod(material),
    transport: transportMethod(material),
    indexCode: indexCode(material, factory, seq),
    arabicGrammar: arabicGrammarTags(material),
    properties: material.properties || [],
    laws: material.rules || material.laws || [],
    conversion: material.target ? conversionPlan(material, material.target) : null
  };
}

function clusterGoal(factoryType) {
  return {
    PETROCHEMICAL: 'POLYMER_AND_DERIVATIVE_VALUE_CHAIN',
    CHEMICAL: 'SAFE_REACTION_AND_PRODUCT_CLASSIFICATION',
    MECHANICAL: 'FABRICATION_ASSEMBLY_MAINTENANCE',
    REFINERY: 'FRACTIONATION_REFINING_AND_PRODUCT_STREAMS',
    MINING: 'ORE_EXTRACTION_BENEFICIATION_RAW_MATERIAL_SUPPLY',
    ENERGY_OIL_GAS: 'HYDROCARBON_ENERGY_PRODUCTION_AND_SUPPLY',
    ENERGY_RENEWABLE: 'RENEWABLE_GENERATION_STORAGE_AND_GRID_INTEGRATION',
    UTILITIES: 'STEAM_WATER_POWER_SUPPORT_SERVICES',
    MANUFACTURING: 'GENERAL_PRODUCTION_AND_QUALITY',
    LOGISTICS: 'STORAGE_TRANSPORT_AND_DISTRIBUTION'
  }[factoryType] || 'GENERAL_INDUSTRIAL_CLUSTER';
}

function analyze(input = {}) {
  ensureData();

  const factories = Array.isArray(input.factories) ? input.factories : [];
  const results = [];
  let seq = 1;

  for (const factory of factories) {
    const factoryType = classifyFactory(factory);
    const materials = Array.isArray(factory.materials) ? factory.materials : [];

    const classifiedMaterials = materials.map((m) => classifyMaterial(m, factory, seq++));
    const byState = {};
    const byStage = {};
    const bySupplier = {};

    for (const m of classifiedMaterials) {
      byState[m.state] = (byState[m.state] || 0) + 1;
      byStage[m.stage] = (byStage[m.stage] || 0) + 1;
      bySupplier[m.supplierClass] = (bySupplier[m.supplierClass] || 0) + 1;
    }

    results.push({
      factoryId: factory.id || factory.name,
      factoryName: factory.name || 'Factory',
      factoryType,
      clusterGoal: clusterGoal(factoryType),
      utilities: factory.utilities || [],
      facilities: factory.facilities || [],
      classifiedMaterials,
      productionExponentialPotential: Number((classifiedMaterials.length * Math.pow(1.618, Math.max(1, classifiedMaterials.length))).toFixed(6)),
      byState,
      byStage,
      bySupplier,
      integrationTargets: [
        'MATERIAL_LEDGER',
        'QUALITY_GATE',
        'STORAGE_INDEX',
        'TRANSPORT_ROUTE',
        'PRODUCTION_PIPELINE',
        'KNOWLEDGE_GRAPH',
        'VECTOR_INDEX',
        'GOVERNANCE_AUDIT'
      ]
    });
  }

  const output = {
    success: true,
    system: 'SHEIKHA_INDUSTRIAL_MATERIAL_LIFECYCLE_FABRIC_V1',
    status: 'ANALYZED',
    totalFactories: results.length,
    totalMaterials: results.reduce((s, f) => s + f.classifiedMaterials.length, 0),
    factories: results,
    governance: status().governance
  };

  fs.writeFileSync(path.join(DATA_DIR, 'latest-analysis.json'), JSON.stringify(output, null, 2));
  return output;
}

module.exports = {
  status,
  analyze,
  classifyMaterial,
  classifyFactory,
  classifyState,
  classifyStage,
  storageMethod,
  transportMethod
};
