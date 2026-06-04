const fs = require('fs');
const path = require('path');
const {
  normalizeEnvelope,
  validateEnvelope
} = require('../lib/api-contracts/sheikha-api-contracts');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

describe('Sheikha stability layer contracts', () => {
  test('api contract registry locks extension-facing response envelopes', () => {
    const registry = readJson('runtime/api-contract-registry/v1/sheikha-api-contract-registry-v1.json');

    expect(registry.status).toBe('ACTIVE');
    expect(registry.envelope.requiredTopLevel).toEqual(expect.arrayContaining(['success', 'data', 'timestamp']));
    expect(registry.contracts.length).toBeGreaterThanOrEqual(10);
    expect(registry.contracts.every((contract) => contract.owner === 'extension-compatibility')).toBe(true);
  });

  test('legacy top-level status responses normalize into canonical data envelope', () => {
    const registry = readJson('runtime/api-contract-registry/v1/sheikha-api-contract-registry-v1.json');
    const statusContract = registry.contracts.find((contract) => contract.id === 'API-SHEIKHA-STATUS');
    const normalized = normalizeEnvelope({
      success: true,
      name: 'Sheikha',
      version: '1.0.0',
      status: 'active',
      shariaGuardrails: true
    }, {
      contract: registry.envelope.version,
      timestamp: '2026-06-04T00:00:00.000Z'
    });

    expect(normalized.success).toBe(true);
    expect(normalized.data).toEqual(expect.objectContaining({
      name: 'Sheikha',
      version: '1.0.0',
      status: 'active',
      shariaGuardrails: true
    }));
    expect(validateEnvelope(normalized, {
      requiredDataKeys: statusContract.requiredDataKeys
    }).ok).toBe(true);
  });

  test('contract validation rejects successful responses without data', () => {
    const result = validateEnvelope({
      success: true,
      name: 'Sheikha',
      timestamp: '2026-06-04T00:00:00.000Z'
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('data is required');
  });

  test('jest ignores duplicated repository and generated package trees', () => {
    const config = require('../jest.config');

    expect(config.testPathIgnorePatterns).toEqual(expect.arrayContaining([
      '/dist/',
      '/archive/',
      '/infra/docker/compose/prod/',
      '/Sheikha-Market/',
      '/.venv/'
    ]));
    expect(config.modulePathIgnorePatterns).toEqual(expect.arrayContaining([
      '<rootDir>/dist',
      '<rootDir>/archive',
      '<rootDir>/infra/docker/compose/prod',
      '<rootDir>/Sheikha-Market',
      '<rootDir>/.venv'
    ]));
  });
});
