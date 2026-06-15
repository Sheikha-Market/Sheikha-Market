'use strict';

const storageGovernance = require(
  '../runtime/storage-governance/v1/sheikha-storage-governance-v1'
);

describe('Sheikha Storage Governance V1', () => {
  test('classifies critical filesystem pressure without mutation', () => {
    const result = storageGovernance.status({
      filesystem: {
        targetPath: '/test',
        totalBytes: 1000,
        usedBytes: 960,
        freeBytes: 40,
        usedPercent: 96
      }
    });

    expect(result.status).toBe('ACTIVE_READ_ONLY_GOVERNANCE');
    expect(result.filesystem.severity).toBe('CRITICAL');
    expect(result.decision).toBe('IMMEDIATE_HUMAN_STORAGE_REVIEW_REQUIRED');
    expect(result.rules.automaticDeletion).toBe(false);
    expect(result.rules.automaticMovement).toBe(false);
  });

  test('produces a governed archival review plan for large assets', () => {
    const result = storageGovernance.plan({
      inventory: [{
        path: 'large-archive.zip',
        sizeBytes: 10 * 1024 ** 3,
        kind: 'file'
      }]
    });

    expect(result.status).toBe('PLAN_READY_FOR_HUMAN_REVIEW');
    expect(result.candidates).toHaveLength(1);
    expect(result.steps).toContain('CALCULATE_AND_RECORD_CHECKSUM');
    expect(result.prohibitedAutomation).toContain('AUTOMATIC_DELETE');
  });

  test('protects canonical runtime paths from automated remediation', () => {
    const result = storageGovernance.plan({
      inventory: [{
        path: 'runtime/large-generated-state.bin',
        sizeBytes: 8 * 1024 ** 3,
        kind: 'file'
      }]
    });

    expect(result.candidates[0].protected).toBe(true);
    expect(result.candidates[0].decision).toBe('PROTECTED_PATH_REVIEW_REQUIRED');
  });

  test('normalizes and sorts inventory safely', () => {
    const result = storageGovernance.normalizeInventory([
      { path: 'small', sizeBytes: 1 },
      { path: 'large', sizeBytes: 9 }
    ]);

    expect(result.map(item => item.path)).toEqual(['large', 'small']);
  });
});
