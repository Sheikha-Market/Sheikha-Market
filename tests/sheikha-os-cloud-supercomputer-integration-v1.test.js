'use strict';

const contract = require('../runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1.json');

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
});
