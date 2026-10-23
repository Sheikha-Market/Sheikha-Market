'use strict';
const {buildStorageCustodyPlan} = require('../core/foundry/sheikha-storage-custody-plan-v1');
const {storageInput} = require('./fixtures/sheikha-foundry-sourcing-v1');

test('cloud storage bills versions, copies and operations, without uploading or issuing access', () => {
  const p = buildStorageCustodyPlan(storageInput());
  expect(p.allocatedBytes).toBe('600000000000');
  expect(p.financials.billableUnits).toBe('600');
  expect(p.financials.storageHalala).toBe(10125);
  expect(p.financials.proposedPriceExTaxHalala).toBe(33433);
  expect(p.uploadExecuted).toBe(false);
  expect(p.controls.cloudIamApplied).toBe(false);
  expect(p.ownership.weightsTransferredByStorage).toBe(false);
  p.requestedAccess.forEach(a => { expect(a.granted).toBe(false); expect(a.tenantScope).toBe(p.index.tenantRef); });
});
test.each(['SHEIKHA', 'CUSTOMER', 'THIRD_PARTY'])('storage owner %s does not gain model ownership', storageOwner => {
  const p = buildStorageCustodyPlan({...storageInput(), storageOwner});
  expect(p.ownership.weightsTransferredByStorage).toBe(false);
});
test('customer premises use the same private contract and index without a cloud provider', () => {
  const input = {...storageInput(), location: 'CUSTOMER_SITE'}; delete input.providerRef;
  const p = buildStorageCustodyPlan(input);
  expect(p.providerRef).toBe(null); expect(p.storageContractActivated).toBe(false);
  expect(() => buildStorageCustodyPlan({...input, storageOwner: 'SHEIKHA'})).toThrow();
});
test('capacity must include every retained version and backup copy', () => {
  const p = buildStorageCustodyPlan({...storageInput(), capacityBytes: 100000000000});
  expect(p.blockers).toContain('CAPACITY_INSUFFICIENT_FOR_VERSIONS_AND_COPIES');
});
test('retention must fit the priced period without claiming calendar or backup verification', () => {
  const input = storageInput(); input.retentionDays = 91;
  const p = buildStorageCustodyPlan(input);
  expect(p.blockers).toContain('RETENTION_EXCEEDS_PRICED_PLANNING_PERIOD');
  expect(p.pricedCoverageDays).toBe(90);
  expect(p.artifactSizeVerified).toBe(false);
  expect(p.targets.independentCopyFailureDomainsVerified).toBe(false);
  input.pricing.months = 4;
  expect(buildStorageCustodyPlan(input).blockers).not.toContain('RETENTION_EXCEEDS_PRICED_PLANNING_PERIOD');
});
test.each(['TRAIN_ON_WEIGHTS', 'ANONYMOUS_DOWNLOAD', '*', 'MODIFY_OWNER', 'READ_ALL_TENANTS'])('rejects unscoped access %s', op => {
  const input = storageInput(); input.accessRequests[0].operations.push(op);
  expect(() => buildStorageCustodyPlan(input)).toThrow();
});
test.each(['https://storage.example/x?token=private', '../private', '/home/client/weights', 'user:password@host'])('never accepts live URLs, credentials or paths as a locator %s', value => {
  expect(() => buildStorageCustodyPlan({...storageInput(), locationRef: value})).toThrow('STORAGE_REFERENCE_NOT_URL_PATH_OR_CREDENTIAL');
});
test('forged permissions and duplicate parties cannot become a grant', () => {
  const input = storageInput(); input.accessRequests[0].granted = true;
  expect(() => buildStorageCustodyPlan(input)).toThrow();
  const other = storageInput(); other.accessRequests.push(other.accessRequests[0]);
  expect(() => buildStorageCustodyPlan(other)).toThrow();
});
test('billing rounds up GB usage and never silently switches to GiB', () => {
  const input = storageInput(); input.artifactBytes = 1000000001; input.versionCount = 1; input.copies = 1;
  expect(buildStorageCustodyPlan(input).financials.billableUnits).toBe('2');
  input.pricing.unitBytes = 1073741824;
  expect(buildStorageCustodyPlan(input).financials.billableUnits).toBe('1');
});
test.each([{copies: 0}, {retentionDays: 0}, {artifactBytes: -1}, {versionCount: 1.5}, {rtoHours: Infinity}, {cloudIamApplied: true}])('rejects invalid bounds %j', patch => {
  expect(() => buildStorageCustodyPlan({...storageInput(), ...patch})).toThrow();
});
test('unpriced total storage cost is a hold, not a free managed service', () => {
  const input = storageInput();
  for (const key of ['microSarPerUnitMonth', 'operationsHalala', 'retrievalHalala', 'transferHalala', 'keyManagementHalala', 'supportHalala', 'exitHalala']) input.pricing[key] = 0;
  expect(buildStorageCustodyPlan(input).blockers).toContain('ALL_IN_STORAGE_COSTS_MISSING');
});
