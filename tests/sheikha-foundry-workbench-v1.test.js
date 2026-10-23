'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {buildFoundryQuote, quoteCosts, MODES, buildFoundryCommercialPolicy} = require('../core/foundry/sheikha-foundry-commercial-v1');
const {buildModelCompositionPlan, HARDWARE_TARGETS} = require('../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1');
const {buildTrainingResultIndex, reviewModelImprovement} = require('../core/foundry/sheikha-foundry-evidence-v1');
const {main, readInput, verifyLocalArtifact, exampleInputs} = require('../tools/training/sheikha-foundry-workbench-v1');

const sha = c => c.repeat(64);
const indexInput = () => ({runId: 'test-run', tenantRef: 'tenant-a', modelRef: 'test-model', objective: 'sft', contractRef: 'test-contract', licenseRef: 'test-license', artifactSha256: sha('a'), baseSha256: sha('b'), tokenizerSha256: sha('c'), recipeSha256: sha('d'), datasetManifestSha256: sha('e'), evaluationSha256: sha('f')});
const evaluationInput = () => ({artifactSha256: sha('a'), holdoutSha256: sha('b'), recipeSha256: sha('c'), sampleCount: 100, taskScore: 0.7, safetyFailureRate: 0.01, p95LatencyMs: 100, costHalalaPer1000Requests: 100});
const improvementInput = () => ({baseline: evaluationInput(), candidate: {...evaluationInput(), artifactSha256: sha('d'), taskScore: 0.8}});

describe('Foundry ownership and cost drafts', () => {
  test('uses integer currency and real margin rather than markup', () => {
    const result = quoteCosts(exampleInputs().quote.pricing);
    expect(result.directCostHalala).toBe(67200);
    expect(result.reservedCostHalala).toBe(80640);
    expect(result.priceExcludingTaxHalala).toBe(115200);
    expect(result.spendingAuthorized).toBe(false);
  });
  test.each(MODES)('preserves Sheikha foundations and upstream rights in %s', mode => {
    const input = {...exampleInputs().quote, mode};
    if (mode === 'FOUNDRY_SOFTWARE_LICENSE') Object.assign(input, {baseKind: 'NONE', artifactKind: 'SOFTWARE_LICENSE'});
    const quote = buildFoundryQuote(input, {now: new Date('2026-09-11T00:00:00Z')});
    expect(quote.ownership.platformTransferIncluded).toBe(false);
    expect(quote.ownership.baseWeightsOwnershipTransferred).toBe(false);
    expect(quote.ownership.sheikhaFoundationTransferIncluded).toBe(false);
    expect(quote.contribution.trainingReuseAllowed).toBe(false);
    expect(quote.signatureVerified).toBe(false);
    expect(quote.productionReady).toBe(false);
    expect(quote.expiresAt).toBe('2026-09-18T00:00:00.000Z');
  });
  test('a contribution proposal never authorizes private training', () => {
    const q = buildFoundryQuote({...exampleInputs().quote, contributionProposal: 'COMPATIBLE_ADAPTER_LICENSE', venue: 'CUSTOMER_CLOUD', customerBudgetHalala: 0});
    expect(q.contribution.authorized).toBe(false);
    expect(q.contribution.serviceConditionalOnGrant).toBe(false);
    expect(q.budgetWithinDraft).toBe(false);
    expect(q.requiredEvidence).toContain('EXTERNAL_PROCESSOR_REGION_AND_CONTRACT_APPROVAL');
    expect(q.requiredEvidence).toContain('SEPARATE_SCOPED_CONTRIBUTION_GRANT');
  });
  test.each([-1, 0.3, Infinity, NaN, '100', 10000000001])('rejects an invalid money input %s', amount => {
    expect(() => quoteCosts({...exampleInputs().quote.pricing, gpuMinutes: amount})).toThrow();
  });
  test('rounds fractional GPU time charges upwards to one halala', () => {
    expect(quoteCosts({...exampleInputs().quote.pricing, gpuMinutes: 1, gpuRateHalalaPerHour: 1}).gpuHalala).toBe(1);
  });
  test('rejects an impossible margin, zero cost, and price overflow', () => {
    const pricing = exampleInputs().quote.pricing;
    expect(() => quoteCosts({...pricing, marginBps: 10000})).toThrow();
    expect(() => quoteCosts(Object.fromEntries(Object.keys(pricing).map(key => [key, 0])))).toThrow();
    expect(() => quoteCosts({...pricing, gpuMinutes: 10000000000, gpuRateHalalaPerHour: 10000000000})).toThrow();
  });
  test('rejects closed API ownership, mismatched sale mode and forged flags', () => {
    const q = exampleInputs().quote;
    expect(() => buildFoundryQuote({...q, baseKind: 'CLOSED_API'})).toThrow('CLOSED_API');
    expect(() => buildFoundryQuote({...q, mode: 'FOUNDRY_SOFTWARE_LICENSE'})).toThrow('MODE_ARTIFACT_MISMATCH');
    expect(() => buildFoundryQuote({...q, approved: true})).toThrow();
    expect(buildFoundryCommercialPolicy().executionEnabled).toBe(false);
  });
});

describe('Model composition review, not resource activation', () => {
  test('compatible declared LoRAs reach review, not production', () => {
    const plan = buildModelCompositionPlan(exampleInputs().composition);
    expect(plan.blockers).toEqual([]);
    expect(plan.tooling).toBe('HuggingFace_PEFT');
    expect(plan.executionAuthorized).toBe(false);
    expect(plan.suppliedEvidenceVerified).toBe(false);
    expect(plan.coverage[0].declaredModels).toEqual(['example-arabic']);
  });
  test.each(['architecture', 'baseSha256', 'tensorSchemaSha256', 'tokenizerSha256', 'format', 'adapterRank', 'adapterTargets'])('blocks incompatible LoRA %s', field => {
    const input = exampleInputs().composition;
    input.models[1][field] = field.endsWith('Sha256') ? sha('f') : field === 'adapterRank' ? 32 : field === 'adapterTargets' ? ['k_proj'] : 'different';
    expect(buildModelCompositionPlan(input).blockers.length).toBeGreaterThan(0);
  });
  test('heterogeneous models can be routed but not averaged', () => {
    const input = exampleInputs().composition;
    input.models[1].architecture = 'another-architecture';
    expect(buildModelCompositionPlan({...input, method: 'ROUTING'}).blockers).toEqual([]);
    expect(buildModelCompositionPlan({...input, method: 'ENSEMBLE'}).blockers).toEqual([]);
    expect(buildModelCompositionPlan({...input, method: 'WEIGHT_MERGE'}).blockers).toContain('WEIGHT_ACCESS_AND_KIND_REQUIRED');
  });
  test('full weight merging requires matching declared structure', () => {
    const input = exampleInputs().composition;
    input.method = 'WEIGHT_MERGE';
    input.models.forEach(model => { model.kind = 'FULL_WEIGHTS'; });
    expect(buildModelCompositionPlan(input).blockers).toEqual([]);
    input.models[0].tokenizerSha256 = null;
    expect(buildModelCompositionPlan(input).blockers).toContain('INCOMPATIBLE_OR_UNKNOWN_TOKENIZERSHA256');
  });
  test('names never imply specialties and no empty task set is accepted', () => {
    const input = exampleInputs().composition;
    input.models[0].id = 'best-arabic-coder';
    input.models[0].capabilities = [];
    expect(buildModelCompositionPlan(input).blockers).toContain('UNSUPPORTED_DECLARED_TASKS');
    expect(() => buildModelCompositionPlan({...input, tasks: []})).toThrow();
  });
  test('distillation needs a trainable student and separate teacher permission', () => {
    const input = exampleInputs().composition;
    input.method = 'DISTILLATION';
    input.models[0].kind = 'API';
    expect(buildModelCompositionPlan(input).blockers).toEqual(expect.arrayContaining(['SEPARATE_TEACHER_TRAINING_RIGHTS_REQUIRED', 'TRAINABLE_STUDENT_WEIGHTS_REQUIRED']));
    input.models[1].kind = 'FULL_WEIGHTS';
    const plan = buildModelCompositionPlan({...input, teacherGrantRef: 'contract-teacher-scope'});
    expect(plan.blockers).toEqual([]);
    expect(plan.executionAuthorized).toBe(false);
  });
  test.each(HARDWARE_TARGETS)('%s is a planning target, not an activated device', hardware => {
    const input = exampleInputs().composition;
    input.target = {hardware, venue: 'EXTERNAL', maxConcurrentJobs: 1000000000, budgetHalala: 0};
    const plan = buildModelCompositionPlan(input);
    expect(plan.availableConcurrentJobs).toBeNull();
    expect(plan.paidProvisioning).toBe(false);
    expect(plan.requiredReviews).toContain('REGION_SUBPROCESSOR_AND_EXPORT_APPROVAL');
  });
  test('bounds work and rejects malformed hashes, duplicates and approval injection', () => {
    const p = exampleInputs().composition;
    expect(() => buildModelCompositionPlan({...p, models: Array(17).fill(p.models[0])})).toThrow();
    expect(() => buildModelCompositionPlan({...p, models: [p.models[0], p.models[0]]})).toThrow('DUPLICATE_MODEL_ID');
    expect(() => buildModelCompositionPlan({...p, productionGatesPassed: true})).toThrow();
    p.models[0].weightsSha256 = 'not-a-hash';
    expect(() => buildModelCompositionPlan(p)).toThrow();
  });
});

describe('Training lineage and improvement', () => {
  test('binds recipe, dataset, artifact, tenant and rights without declaring them verified', () => {
    const input = indexInput();
    const first = buildTrainingResultIndex(input);
    expect(first).toEqual(buildTrainingResultIndex(input));
    expect(buildTrainingResultIndex({...input, tenantRef: 'tenant-b'}).indexSha256).not.toBe(first.indexSha256);
    expect(buildTrainingResultIndex({...input, artifactSha256: sha('f')}).indexSha256).not.toBe(first.indexSha256);
    expect(first.reusableAcrossTenants).toBe(false);
    expect(first.contentVerified).toBe(false);
    expect(() => buildTrainingResultIndex({...input, rightsVerified: true})).toThrow();
  });
  test('strictly better declared metrics only produce a review candidate', () => {
    const result = reviewModelImprovement(improvementInput());
    expect(result.eligibleForHumanReview).toBe(true);
    expect(result.automaticPromotion).toBe(false);
    expect(result.metricsIndependentlyVerified).toBe(false);
    expect(result.statisticallySignificant).toBe(false);
  });
  test.each([['taskScore', 0.6], ['safetyFailureRate', 0.02], ['p95LatencyMs', 101], ['costHalalaPer1000Requests', 101], ['sampleCount', 2], ['holdoutSha256', sha('e')], ['recipeSha256', sha('e')]])('preserves baseline for %s regression or incomparable evidence', (key, value) => {
    const input = improvementInput();
    input.candidate[key] = value;
    expect(reviewModelImprovement(input).status).toBe('KEEP_BASELINE');
  });
  test('rejects unchanged results, NaN and invalid counts', () => {
    const input = improvementInput();
    input.candidate.taskScore = input.baseline.taskScore;
    expect(reviewModelImprovement(input).blockers).toContain('NO_MEASURED_IMPROVEMENT');
    input.candidate.taskScore = NaN;
    expect(() => reviewModelImprovement(input)).toThrow();
    input.candidate = {...evaluationInput(), sampleCount: 0};
    expect(() => reviewModelImprovement(input)).toThrow();
  });
});

describe('Offline workbench CLI and file hashing', () => {
  let temp;
  beforeEach(() => { temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-workbench-test-')); });
  afterEach(() => { fs.rmSync(temp, {recursive: true, force: true}); });
  test('runs the explicitly fictional demo with no execution', async () => {
    const result = await main(['demo']);
    expect(result.networkCalls).toBe(0);
    expect(result.trainingExecuted).toBe(false);
    expect(result.classification).toContain('FICTIONAL');
    expect((await main(['policy'])).executionEnabled).toBe(false);
    await expect(main(['demo', '--approved'])).rejects.toThrow();
    await expect(main(['activate'])).rejects.toThrow();
  });
  test('reads strict bounded JSON and rejects links or extraneous switches', async () => {
    const file = path.join(temp, 'input.json');
    fs.writeFileSync(file, JSON.stringify(exampleInputs().composition));
    expect((await main(['composition', '--input', file])).executionAuthorized).toBe(false);
    await expect(main(['composition', '--input', file, '--artifact', file])).rejects.toThrow();
    const symlink = path.join(temp, 'link.json');
    fs.symlinkSync(file, symlink);
    expect(() => readInput(symlink)).toThrow();
    fs.writeFileSync(file, ' '.repeat(32769));
    expect(() => readInput(file)).toThrow();
  });
  test('verifies private file bytes without loading weights or granting ownership', async () => {
    fs.mkdirSync(path.resolve(__dirname, '../reports/private'), {recursive: true, mode: 0o700});
    const privateDir = fs.mkdtempSync(path.resolve(__dirname, '../reports/private/.workbench-test-'));
    try {
      const file = path.join(privateDir, 'fixture.bin');
      const bytes = Buffer.from('test-only-not-model-weights');
      fs.writeFileSync(file, bytes, {mode: 0o600});
      const record = buildTrainingResultIndex({...indexInput(), artifactSha256: crypto.createHash('sha256').update(bytes).digest('hex')});
      const result = await verifyLocalArtifact(record, file);
      expect(result.artifactFileSha256Verified).toBe(true);
      expect(result.lineageVerified).toBe(false);
      expect(result.rightsVerified).toBe(false);
      expect(result.weightsLoaded).toBe(false);
      await expect(verifyLocalArtifact(buildTrainingResultIndex(indexInput()), file)).rejects.toThrow('ARTIFACT_SHA256_MISMATCH');
      const outside = path.join(temp, 'outside.bin');
      fs.writeFileSync(outside, bytes);
      await expect(verifyLocalArtifact(record, outside)).rejects.toThrow('ARTIFACT_MUST_BE_IN_PRIVATE_REPORTS');
    } finally { fs.rmSync(privateDir, {recursive: true, force: true}); }
  });
});
