'use strict';

const path = require('node:path');
const fs = require('node:fs');
const verifier = require(
  '../runtime/root-architecture/v3/sheikha-root-verifier-v3'
);

const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), 'utf8')
  );
}

describe('Sheikha Root Architecture V3', () => {
  test('places Sheikha above individual project layers', () => {
    const architecture = readJson(
      'runtime/root-architecture/v3/' +
      'sheikha-root-architecture-v3.json'
    );

    expect(architecture.scope).toBe(
      'SHEIKHA_IS_BROADER_THAN_A_SINGLE_PROJECT'
    );

    expect(architecture.status).toBe(
      'ROOT_ARCHITECTURE_ACTIVE'
    );
  });

  test('connects all required root capabilities', () => {
    const result = verifier.verify(root);

    expect(result.status).toBe('VERIFIED');
    expect(result.missing).toEqual([]);
  });

  test('keeps completion claims fail-closed', () => {
    const result = verifier.verify(root);

    expect(result.allUefiProtocolsImplemented).toBe(false);
    expect(result.allDevicesWorldwideSupported).toBe(false);
    expect(result.physicalHardwareBootVerified).toBe(false);
    expect(result.secureBootVerified).toBe(false);
    expect(result.productionSiteDeployed).toBe(false);
  });

  test('registers UEFI breadth without false implementation', () => {
    const registry = readJson(
      'runtime/uefi-capability-registry/v2/' +
      'sheikha-uefi-capability-registry-v2.json'
    );

    expect(registry.status).toBe(
      'CAPABILITY_REGISTRY_ACTIVE'
    );

    expect(
      registry.implementationPolicy
        .registrationDoesNotMeanImplemented
    ).toBe(true);

    expect(
      registry.completion.allUefiProtocolsImplemented
    ).toBe(false);
  });
});
