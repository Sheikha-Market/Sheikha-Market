'use strict';

const {
  enforce,
  enforceSuccess,
  enforceFailure
} = require('../lib/runtime-contract-enforcer/sheikha-runtime-contract-enforcer');

describe('Sheikha Runtime Contract Enforcer V1', () => {
  test('wraps legacy success response into success data meta', () => {
    const response = enforce({
      success: true,
      name: 'Sheikha',
      status: 'active'
    });

    expect(response.success).toBe(true);
    expect(response).toHaveProperty('data');
    expect(response.data.name).toBe('Sheikha');
    expect(response).toHaveProperty('meta');
    expect(response.meta.contract).toBe('SHEIKHA_API_CONTRACT_V2');
  });

  test('preserves already valid contract response', () => {
    const original = {
      success: true,
      data: { name: 'Sheikha Root' },
      meta: { contract: 'SHEIKHA_API_CONTRACT_V2' }
    };

    const response = enforce(original);
    expect(response).toBe(original);
  });

  test('wraps failure response into failure contract', () => {
    const response = enforceFailure({
      success: false,
      message: 'Missing prompt',
      code: 'MISSING_PROMPT',
      status: 400
    });

    expect(response.success).toBe(false);
    expect(response).toHaveProperty('error');
    expect(response.data).toBe(null);
    expect(response.meta.contract).toBe('SHEIKHA_API_CONTRACT_V2');
  });

  test('wraps primitive success payload', () => {
    const response = enforceSuccess('ok');

    expect(response.success).toBe(true);
    expect(response.data).toBe('ok');
    expect(response.meta.contract).toBe('SHEIKHA_API_CONTRACT_V2');
  });
});
