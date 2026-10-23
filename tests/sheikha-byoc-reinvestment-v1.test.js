'use strict';

const {buildByocPlan} = require('../core/foundry/sheikha-byoc-plan-v1');
const {planReinvestment} = require('../core/foundry/sheikha-reinvestment-v1');
const {main} = require('../tools/training/sheikha-foundry-workbench-v1');

function index() {
  const value = {runId: 'run', tenantRef: 'tenant', modelRef: 'model', objective: 'sft', contractRef: 'unsigned', licenseRef: 'review'};
  for (const key of ['artifactSha256', 'baseSha256', 'tokenizerSha256', 'recipeSha256', 'datasetManifestSha256', 'evaluationSha256']) value[key] = 'a'.repeat(64);
  return value;
}
function plan() { return {index: index(), venue: 'CUSTOMER_DEVICE', hardware: 'CUDA', deviceRef: 'owned-pc', maxMinutes: 120, checkpointEverySteps: 50, maxArtifactGiB: 32, retentionDays: 30, custodyProposal: 'OWNER_LOCAL_ONLY'}; }
function funds() { return {cashHalala: 10000000, customerObligationsHalala: 2000000, taxAndStatutoryLiabilitiesHalala: 500000, otherPayablesHalala: 500000, restrictedCashHalala: 0, monthlyOperatingCashHalala: 1000000, runwayMonths: 3, unallocatedRealizedProfitAfterTaxHalala: 3000000}; }

test('BYOC binds an index but never invents a signed customer grant or GPU execution', () => {
  const p = buildByocPlan(plan());
  expect(p.index.tenantRef).toBe('tenant');
  expect(p.trainingExecuted).toBe(false);
  expect(p.custody.customerDataReuseAllowed).toBe(false);
  expect(p.custody.sheikhaCopyAuthorized).toBe(false);
});
test.each(['CPU', 'CUDA', 'ROCM', 'TPU', 'TRAINIUM', 'CEREBRAS'])('%s is an explicit planning target, not activated hardware', hardware => {
  const p = buildByocPlan({...plan(), hardware});
  expect(p.providerActivated).toBe(false);
  expect(p.commercialProductionReady).toBe(false);
});
test('external training and custody require separate evidence', () => {
  const p = buildByocPlan({...plan(), venue: 'EXTERNAL_PROVIDER', providerRef: 'provider', regionRef: 'region', custodyProposal: 'SEPARATE_RIGHTS_NEGOTIATION', custodyContractRef: 'draft'});
  expect(p.requiredEvidence).toContain('PROVIDER_CONTRACT_REGION_BUDGET_AND_EGRESS_APPROVAL');
  expect(p.requiredEvidence).toContain('SEPARATE_COMPENSATED_ARTIFACT_REUSE_OR_ASSIGNMENT_AGREEMENT');
  expect(p.custody.backupIsOwnershipTransfer).toBe(false);
  expect(p.custody.externalTransferAuthorized).toBe(false);
});
test.each([
  {approved: true}, {maxMinutes: 0}, {retentionDays: 3651}, {hardware: 'AUTO'},
  {providerRef: 'unexpected'}, {custodyProposal: 'SHEIKHA_BACKUP_ONLY'}, {venue: 'EXTERNAL_PROVIDER'},
])('rejects incomplete or self-authorized plans %j', patch => expect(() => buildByocPlan({...plan(), ...patch})).toThrow());

test('reserves liabilities and runway, then caps investment by realized profit', () => {
  const p = planReinvestment(funds());
  expect(p.protectedCashHalala).toBe(6000000);
  expect(p.freeCashHalala).toBe(4000000);
  expect(p.distributableHalala).toBe(3000000);
  expect(p.allocations.modelTraining).toBe(600000);
  expect(p.spendingAuthorized).toBe(false);
  expect(p.publicBenefitIsZakatAssessment).toBe(false);
});
test.each([0, -100000, -10000000000])('no reinvestment from zero or negative retained profit %i', profit => {
  expect(planReinvestment({...funds(), unallocatedRealizedProfitAfterTaxHalala: profit}).distributableHalala).toBe(0);
});
test('profitable but insolvent does not authorize spending', () => {
  const p = planReinvestment({...funds(), cashHalala: 1});
  expect(p.fundingGapHalala).toBe(5999999);
  expect(p.distributableHalala).toBe(0);
});
test.each([1, 2, 3, 19, 101, 10001])('allocations conserve every halala for %i', amount => {
  const p = planReinvestment({...funds(), unallocatedRealizedProfitAfterTaxHalala: amount});
  expect(Object.values(p.allocations).reduce((a, b) => a + b, 0)).toBe(amount);
});
test.each([{runwayMonths: 0}, {cashHalala: NaN}, {cashHalala: '100'}, {cashHalala: -1}, {cashHalala: 1e11}, {allocationBps: {modelTraining: 10000}}, {spendingAuthorized: true}])('rejects invalid funding assumptions %j', patch => {
  expect(() => planReinvestment({...funds(), ...patch})).toThrow();
});
test('CLI exposes both read-only planners', async () => {
  const help = await main(['help']);
  expect(help.commands).toContain('byoc --input FILE');
  expect(help.commands).toContain('reinvestment --input FILE');
});
