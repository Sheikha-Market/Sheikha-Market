'use strict';

const {
  SheikhaUniversalMasterLogFabric,
  SheikhaUniversalSubMasterLog
} = require('../runtime/sheikha-universal-production-integration/master-log/sheikha-universal-master-log-fabric');

test('activates universal master log with governed sub logs for every inspected system', () => {
  const fabric = new SheikhaUniversalMasterLogFabric();
  const status = fabric.activate();

  expect(status.status).toBe('ACTIVE');
  expect(status.layerRank).toBe('HIGHEST_UNIVERSAL_AUDIT_AND_MASTER_LOG_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.mainLog.length).toBeGreaterThanOrEqual(1);
  expect(status.subLogs.length).toBeGreaterThanOrEqual(20);
  expect(status.subLogs.every((x) => x.status === 'ACTIVE')).toBe(true);
  expect(status.subLogs.every((x) => x.governed)).toBe(true);
  expect(status.subLogs.every((x) => x.audited)).toBe(true);

  expect(status.boundaries.allSubLogsGoverned).toBe(true);
  expect(status.boundaries.allSubLogsAudited).toBe(true);
});

test('sub master log records governed audited entries', () => {
  const log = new SheikhaUniversalSubMasterLog('linux');
  const entry = log.append({
    event: 'LINUX_ADAPTER_HEALTH_CHECK',
    status: 'PASSED',
    evidence: { healthy: true }
  });

  expect(entry.family).toBe('linux');
  expect(entry.governed).toBe(true);
  expect(entry.audited).toBe(true);
  expect(log.getStatus().entries).toHaveLength(1);
});
