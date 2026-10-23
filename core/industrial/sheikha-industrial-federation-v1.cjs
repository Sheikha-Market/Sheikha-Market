'use strict';

const { randomUUID } = require('node:crypto');
const { SheikhaIndustrialNetwork } = require('../robotics/sheikha-industrial-network-v1');
const { CULTIVATION_STAGES, evaluatePlot } = require('../gardens-dialogue/sheikha-pastures-orchards-cultivation-runtime-v1');
const { getIndustrialCatalog } = require('./sheikha-industrial-planner-v1.cjs');

const LIMITS = Object.freeze({ clusters: 4, foundriesPerCluster: 3, factoriesPerCluster: 3,
  linesPerFactory: 3, farmsPerCluster: 3, stepsPerRequest: 5, totalSteps: 200, jobs: 8, ttlMs: 1800000 });
const STAGES = ['تهيئة الموارد', 'تسجيل البذرة', 'تجربة المشتل', 'الغرس والتكييف',
  'رعاية وموارد محسوبة', 'فحص وتصحيح', 'حصاد افتراضي', 'حزمة توسع للمراجعة'];
const BOUNDARIES = Object.freeze({ mode: 'SIMULATION_ONLY', sectorCalibrated: false, physicalCommandSent: false,
  physicalAgriculturePerformed: false, realFactoriesBuilt: 0, realHarvestVerified: false,
  productionReady: false, automaticPropagation: false, externalCallsMade: false,
  paymentEnabled: false, publicationEnabled: false, superiorityClaimVerified: false });
const copy = value => JSON.parse(JSON.stringify(value));
function exact(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}
function validConfig(input) {
  if (!exact(input, ['name', 'templateId', 'clusters', 'foundriesPerCluster', 'factoriesPerCluster', 'linesPerFactory', 'farmsPerCluster'])
    || typeof input.name !== 'string' || input.name.trim().length < 3 || input.name.length > 120
    || /[\u0000-\u001f\u007f]/u.test(input.name)
    || !getIndustrialCatalog().templates.some(t => t.id === input.templateId && t.id !== 'space')) return false;
  return ['clusters', 'foundriesPerCluster', 'factoriesPerCluster', 'linesPerFactory', 'farmsPerCluster']
    .every(key => Number.isSafeInteger(input[key]) && input[key] >= 1 && input[key] <= LIMITS[key]);
}

const CONFIG_COUNTS = Object.freeze(['clusters', 'foundriesPerCluster', 'factoriesPerCluster', 'linesPerFactory', 'farmsPerCluster']);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const validNote = value => typeof value === 'string' && value.trim().length >= 3 && value.length <= 1000
  && !/[\u0000-\u0008\u000b-\u001f\u007f]/u.test(value);
function validDerivation(d, config) {
  return exact(d, ['schemaVersion', 'requestId', 'sourceArchiveId', 'sourceRunId', 'sourceRevision', 'sourceGeneration',
    'baselineConfig', 'reviewRevision', 'reviewChainHead', 'requests', 'intent', 'createdAt', 'approvalInherited', 'improvementVerified'])
    && d.schemaVersion === 1 && typeof d.requestId === 'string' && UUID.test(d.requestId)
    && typeof d.sourceArchiveId === 'string' && DIGEST.test(d.sourceArchiveId)
    && typeof d.sourceRunId === 'string' && UUID.test(d.sourceRunId)
    && Number.isSafeInteger(d.sourceRevision) && d.sourceRevision >= 0
    && Number.isSafeInteger(d.sourceGeneration) && d.sourceGeneration >= 0 && d.sourceGeneration <= d.sourceRevision
    && validConfig(d.baselineConfig) && validConfig(config) && d.baselineConfig.templateId === config.templateId
    && CONFIG_COUNTS.some(key => d.baselineConfig[key] !== config[key])
    && Number.isSafeInteger(d.reviewRevision) && d.reviewRevision >= 1 && d.reviewRevision <= 64
    && typeof d.reviewChainHead === 'string' && DIGEST.test(d.reviewChainHead)
    && validNote(d.intent) && typeof d.createdAt === 'string' && Number.isFinite(Date.parse(d.createdAt))
    && d.approvalInherited === false && d.improvementVerified === false
    && Array.isArray(d.requests) && d.requests.length >= 1 && d.requests.length <= 8
    && new Set(d.requests.map(r => r?.targetId)).size === d.requests.length
    && new Set(d.requests.map(r => r?.requestId)).size === d.requests.length
    && new Set(d.requests.map(r => r?.sequence)).size === d.requests.length
    && d.requests.every(r => exact(r, ['requestId', 'targetId', 'sequence', 'sha256', 'note'])
      && typeof r.requestId === 'string' && UUID.test(r.requestId)
      && typeof r.targetId === 'string' && (r.targetId === 'federation'
        || r.targetId.startsWith(`${d.sourceRunId}:${d.sourceGeneration}:`) && r.targetId.length <= 100)
      && Number.isSafeInteger(r.sequence) && r.sequence >= 1 && r.sequence <= d.reviewRevision
      && typeof r.sha256 === 'string' && DIGEST.test(r.sha256) && validNote(r.note));
}

class IndustrialFederation {
  constructor(config) {
    if (!validConfig(config)) throw Error('SIMULATION_INPUT_REJECTED');
    this.id = randomUUID(); this.config = { ...config, name: config.name.trim() };
    this.revision = 0; this.generation = 0; this.initialize();
  }
  initialize() {
    this.state = 'READY'; this.tick = 0; this.events = []; this.artifacts = []; this.clusters = [];
    const node = (id, nameAr, kind) => ({ id, nameAr, kind, engine: new SheikhaIndustrialNetwork(), emitted: false });
    for (let c = 1; c <= this.config.clusters; c++) {
      const id = `c${c}`;
      this.clusters.push({ id, nameAr: `العنقود ${c}`, emitted: false,
        foundries: Array.from({ length: this.config.foundriesPerCluster }, (_, i) => node(`${id}-f${i + 1}`, `فوندري ${i + 1}`, 'foundry')),
        farms: Array.from({ length: this.config.farmsPerCluster }, (_, i) => ({ id: `${id}-p${i + 1}`,
          nameAr: `مزرعة ${i + 1}`, progress: 0, fault: false, emitted: false })),
        factories: Array.from({ length: this.config.factoriesPerCluster }, (_, i) => ({ id: `${id}-m${i + 1}`,
          nameAr: `مصنع ${i + 1}`, lines: Array.from({ length: this.config.linesPerFactory }, (_, j) =>
            node(`${id}-m${i + 1}-l${j + 1}`, `خط ${j + 1}`, 'line')) }))
      });
    }
  }
  record(nodeId, event) {
    this.events.push({ tick: this.tick, nodeId, event });
    if (this.events.length > 160) this.events.shift();
  }
  emit(node, kind) {
    if (node.emitted) return;
    node.emitted = true;
    const cluster = this.clusters.find(c => c.id === node.id.split('-')[0]);
    const template = getIndustrialCatalog().templates.find(t => t.id === this.config.templateId);
    const content = kind === 'SIMULATED_HARVEST_DRAFT'
      ? { cultivationStageIds: [...CULTIVATION_STAGES], biologicalGrowthModel: null, measuredYield: null }
      : { proposedStages: template.stages, unverifiedResources: template.resources,
        engineeringEvidenceRequired: template.evidence, safetyReviewRequired: template.review,
        proposedFactories: cluster.factories.map(f => ({ id: f.id, lineIds: f.lines.map(l => l.id) })) };
    this.artifacts.push({ id: `${this.id}:${this.generation}:${node.id}`, nodeId: node.id,
      kind, tick: this.tick, sectorId: template.id, content,
      designMaturity: 'CONCEPT_NOT_MANUFACTURING_DRAWING',
      reviewStatus: 'DRAFT_REQUIRES_HUMAN_REVIEW', physicalOutput: false });
    this.record(node.id, kind);
  }
  networkNodes() { return this.clusters.flatMap(c => [...c.foundries, ...c.factories.flatMap(f => f.lines)]); }
  step() {
    this.tick++;
    for (const cluster of this.clusters) {
      // Dependencies use the previous step: a downstream line never consumes a same-step result.
      const ready = cluster.foundries.every(n => n.engine.state === 'COMPLETE')
        && cluster.farms.every(p => p.progress === STAGES.length && !p.fault);
      for (const farm of cluster.farms) {
        if (farm.fault || farm.progress === STAGES.length) continue;
        this.record(farm.id, `SIMULATED_${CULTIVATION_STAGES[farm.progress]}`);
        farm.progress++;
        if (farm.progress === STAGES.length) this.emit(farm, 'SIMULATED_HARVEST_DRAFT');
      }
      for (const foundry of cluster.foundries) this.advanceNetwork(foundry, 'FACTORY_AND_LINE_BLUEPRINT_DRAFT');
      if (ready) for (const factory of cluster.factories) for (const line of factory.lines) {
        this.advanceNetwork(line, 'SIMULATED_LINE_OUTPUT_DRAFT');
      }
      if (cluster.factories.every(f => f.lines.every(n => n.engine.state === 'COMPLETE'))) {
        this.emit(cluster, 'CLUSTER_BLUEPRINT_DRAFT');
      }
    }
    if (this.clusters.every(c => c.emitted)) this.state = 'COMPLETE';
    else if (this.tick >= LIMITS.totalSteps) { this.state = 'LIMIT_REACHED'; this.record('federation', 'STEP_BUDGET_EXHAUSTED'); }
  }
  advanceNetwork(node, kind) {
    if (node.engine.state === 'IDLE') { node.engine.begin(); this.record(node.id, 'NETWORK_STARTED'); }
    node.engine.tick();
    if (node.engine.state === 'COMPLETE') this.emit(node, kind);
  }
  act(input) {
    const extra = input?.command === 'step' ? ['steps'] : input?.command === 'fault' ? ['nodeId'] : [];
    if (!exact(input, ['command', 'expectedRevision', ...extra]) || !Number.isSafeInteger(input.expectedRevision)
      || !['start', 'step', 'pause', 'resume', 'stop', 'reset', 'fault'].includes(input.command)) throw Error('SIMULATION_INPUT_REJECTED');
    if (input.expectedRevision !== this.revision) throw Error('SIMULATION_REVISION_CONFLICT');
    const allowed = { start: ['READY'], step: ['RUNNING'], pause: ['RUNNING'], resume: ['PAUSED'],
      stop: ['READY', 'RUNNING', 'PAUSED'], reset: ['READY', 'PAUSED', 'STOPPED', 'COMPLETE', 'LIMIT_REACHED'], fault: ['RUNNING', 'PAUSED'] };
    if (!allowed[input.command].includes(this.state)) throw Error('SIMULATION_STATE_CONFLICT');
    if (input.command === 'step' && (!Number.isSafeInteger(input.steps) || input.steps < 1 || input.steps > LIMITS.stepsPerRequest)) throw Error('SIMULATION_INPUT_REJECTED');
    if (input.command === 'fault') {
      const farm = this.clusters.flatMap(c => c.farms).find(p => p.id === input.nodeId);
      const node = this.networkNodes().find(n => n.id === input.nodeId);
      if ((!farm && !node) || farm && (farm.fault || farm.progress === STAGES.length)
        || node && (node.engine.state === 'COMPLETE' || node.engine.cells.some(c => c.health !== 'NOMINAL'))) throw Error('SIMULATION_INPUT_REJECTED');
      if (farm) farm.fault = true;
      else node.engine.injectFault(node.engine.cells.find(c => c.state !== 'COMPLETE').id);
      this.record(input.nodeId, 'SIMULATED_FAULT_LATCHED');
    } else if (input.command === 'reset') {
      this.generation++; this.initialize(); this.record('federation', 'RESET_WITHOUT_APPROVAL');
    } else if (input.command === 'step') {
      for (let i = 0; i < input.steps && this.state === 'RUNNING'; i++) this.step();
    } else {
      this.state = { start: 'RUNNING', pause: 'PAUSED', resume: 'RUNNING', stop: 'STOPPED' }[input.command];
      if (input.command === 'stop') for (const node of this.networkNodes()) node.engine.emergencyStop();
      this.record('federation', input.command.toUpperCase());
    }
    this.revision++;
    return this.snapshot();
  }
  snapshot() {
    const network = node => {
      const s = node.engine.snapshot();
      return { id: node.id, nameAr: node.nameAr, kind: node.kind,
        state: s.cells.some(c => c.health === 'FAULT_LATCHED') ? 'FAULT_LATCHED' : s.state,
        completedCells: s.cells.filter(c => c.state === 'COMPLETE').length, totalCells: s.cells.length,
        progressPercent: Math.floor(s.cells.reduce((n, c) => n + c.progress, 0) * 100 / (s.cells.length * 3)) };
    };
    const clusters = this.clusters.map(c => ({ id: c.id, nameAr: c.nameAr,
      state: c.emitted ? 'COMPLETE' : 'INCOMPLETE', foundries: c.foundries.map(network),
      farms: c.farms.map(p => ({ id: p.id, nameAr: p.nameAr, kind: 'farm',
        domain: this.config.templateId === 'food' ? 'CONCEPTUAL_CROP_CULTIVATION' : 'INDUSTRIAL_RESOURCE_METAPHOR',
        state: p.fault ? 'FAULT_LATCHED' : p.progress === STAGES.length ? 'COMPLETE' : p.progress ? 'GROWING' : 'WAITING',
        progressPercent: Math.floor(p.progress * 100 / STAGES.length),
        stage: p.progress ? STAGES[p.progress - 1] : 'بذرة مسجلة للمحاكاة',
        // Synthetic progress cannot supply evidence or approvals to the real cultivation gate.
        realReadiness: evaluatePlot({ id: p.id, nameAr: p.nameAr, path: 'SEED_FROM_SCRATCH' }) })),
      factories: c.factories.map(f => ({ id: f.id, nameAr: f.nameAr,
        state: f.lines.every(n => n.engine.state === 'COMPLETE') ? 'COMPLETE' : 'INCOMPLETE', lines: f.lines.map(network) })) }));
    return copy({ id: this.id, revision: this.revision, generation: this.generation, config: this.config,
      state: this.state, tick: this.tick, limits: LIMITS, boundaries: BOUNDARIES,
      engineProfile: 'EXISTING_SEVEN_CELL_DEMO_NOT_A_SECTOR_PHYSICS_MODEL',
      execution: { automaticServerScheduler: false, persistentStorage: false, independentPhysicalSafetyRequired: true },
      clusters, artifacts: this.artifacts, events: this.events });
  }
}

function createFederationStore({ now = Date.now } = {}) {
  const jobs = new Map();
  const prune = () => { for (const [id, job] of jobs) if (now() >= job.expiresAt) jobs.delete(id); };
  const get = id => { prune(); const job = jobs.get(id); if (!job) throw Error('SIMULATION_NOT_FOUND'); return job; };
  const snapshot = job => ({ ...job.run.snapshot(), expiresAt: new Date(job.expiresAt).toISOString(),
    ...(job.derivation ? { derivation: copy(job.derivation) } : {}) });
  function create(input, derivation) {
      if (!validConfig(input)) throw Error('SIMULATION_INPUT_REJECTED');
      prune(); if (jobs.size >= LIMITS.jobs) throw Error('SIMULATION_CAPACITY_LIMIT');
      const job = { run: new IndustrialFederation(input), expiresAt: now() + LIMITS.ttlMs,
        ...(derivation ? { derivation: copy(derivation) } : {}) };
      jobs.set(job.run.id, job); return snapshot(job);
  }
  return {
    create(input) { return create(input); },
    createDerived(input, derivation) {
      if (!validDerivation(derivation, input)) throw Error('SIMULATION_INPUT_REJECTED');
      return create(input, derivation);
    },
    read(id) { return snapshot(get(id)); },
    act(id, input) { const job = get(id); job.run.act(input); return snapshot(job); },
    discard(id, input) {
      const job = get(id);
      if (!exact(input, ['expectedRevision']) || !Number.isSafeInteger(input.expectedRevision)) throw Error('SIMULATION_INPUT_REJECTED');
      if (input.expectedRevision !== job.run.revision) throw Error('SIMULATION_REVISION_CONFLICT');
      jobs.delete(id); return { discarded: true, physicalCommandSent: false };
    }
  };
}
module.exports = { IndustrialFederation, createFederationStore, LIMITS, validConfig, validDerivation, CONFIG_COUNTS, UUID, DIGEST, validNote };
