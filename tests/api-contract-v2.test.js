'use strict';

const { ok, fail } = require('../lib/api-contracts/sheikha-api-response');

describe('Sheikha API Contract V2', () => {
  test('success response must include success, data, and meta', () => {
    const response = ok({ name: 'Sheikha Root' });
    expect(response.success).toBe(true);
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('meta');
    expect(response.meta.contract).toBe('SHEIKHA_API_CONTRACT_V2');
  });

  test('failure response must include success false, error, data null, and meta', () => {
    const response = fail('Missing prompt', 'MISSING_PROMPT', 400);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty('error');
    expect(response.data).toBe(null);
    expect(response).toHaveProperty('meta');
    expect(response.error.status).toBe(400);
  });
});
