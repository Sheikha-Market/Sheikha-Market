'use strict';

const contract = require('../runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1.json');
const {
  buildChecks,
  communityReportPaths,
  hasCommunityReport
} = require('../tools/activation/activate-sheikha-os-cloud-supercomputer-integration-v1');

describe('Sheikha OS Cloud Supercomputer Integration V1', () => {
  test('activates verifiable integration fabric', () => {
    expect(contract.status).toBe('ACTIVE');
    expect(contract.mode).toBe('VERIFIABLE_INTEGRATION_FABRIC');
  });

  test('contains os cloud and supercomputer layers', () => {
    expect(contract.layers.os.required).toBe(true);
    expect(contract.layers.cloud.required).toBe(true);
    expect(contract.layers.supercomputer.required).toBe(true);
  });

  test('blocks unverifiable claims', () => {
    expect(contract.blockedClaims).toContain('supercomputer_ready_without_live_compute_benchmark');
    expect(contract.blockedClaims).toContain('production_ready_without_truth_gate');
  });

  test('accepts every supported community report path', () => {
    expect(communityReportPaths.length).toBeGreaterThan(0);

    for (const allowedPath of communityReportPaths) {
      const checks = buildChecks((filePath) => filePath === allowedPath);
      expect(checks.communityReportPresent).toBe(true);
    }
  });

  test('community report detection stays false when no supported path exists', () => {
    expect(hasCommunityReport(() => false)).toBe(false);
  });
});
