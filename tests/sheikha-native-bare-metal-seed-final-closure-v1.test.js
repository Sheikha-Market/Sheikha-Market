'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), 'utf8')
  );
}

function sha256(relativePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest('hex');
}

describe('Sheikha Native Bare-Metal Seed V1 final closure', () => {
  const product = readJson(
    'runtime/bare-metal/v1/product/' +
    'sheikha-native-bare-metal-seed-v1-product.json'
  );

  const integration = readJson(
    'runtime/gardens-and-trees/v1/' +
    'sheikha-bare-metal-root-integration-v1.json'
  );

  const program = readJson(
    'runtime/bare-metal/v2/' +
    'sheikha-sovereign-bare-metal-os-v2-program.json'
  );

  test('closes the verified Seed product', () => {
    expect(product.productReady).toBe(true);
    expect(product.productClosed).toBe(true);
    expect(product.status).toBe('PRODUCT_READY_AND_CLOSED');
  });

  test('verifies immutable artifact hashes', () => {
    expect(
      sha256(product.artifacts.bootloader.path)
    ).toBe(product.artifacts.bootloader.sha256);

    expect(
      sha256(product.artifacts.bootImage.path)
    ).toBe(product.artifacts.bootImage.sha256);

    expect(
      sha256(product.artifacts.serialEvidence.path)
    ).toBe(product.artifacts.serialEvidence.sha256);
  });

  test('preserves QEMU and ExitBootServices proof', () => {
    const serial = fs.readFileSync(
      path.join(root, product.artifacts.serialEvidence.path),
      'utf8'
    );

    expect(serial).toContain('SHEIKHA_BARE_METAL_BOOT_OK');
    expect(serial).toMatch(
      /boot_services[=:]\s*EXITED|boot_services=EXITED/
    );
  });

  test('links all Gardens and Trees upper layers', () => {
    expect(integration.integrationReady).toBe(true);

    const ids = new Set(
      integration.layers.map((layer) => layer.id)
    );

    for (const id of [
      'BARE_METAL_ROOT',
      'SYSTEM_BUILDER_PLATFORM',
      'ROOT_NEURAL_AND_AI',
      'ENTERPRISE_INSPECTOR',
      'MASTER_LOG',
      'RECOVERY_AND_SELF_HEALING',
      'STUDIO_IDE_WORKBENCH',
    ]) {
      expect(ids).toContain(id);
    }
  });

  test('keeps AI outside the critical boot path', () => {
    expect(
      integration.criticalBootBoundary.aiInsideBootCriticalPath
    ).toBe(false);

    expect(
      integration.criticalBootBoundary
        .systemBuilderInsideBootCriticalPath
    ).toBe(false);
  });

  test('opens V2 without false completion claims', () => {
    expect([
      'EXECUTION_PROGRAM_OPEN',
      'IMPLEMENTATION_ACTIVE'
    ]).toContain(program.status);

    if (program.status === 'IMPLEMENTATION_ACTIVE') {
      expect(program.programOpen).toBe(true);
      expect(program.activationBaselineClosed).toBe(true);
    }
    expect(program.claimComplete).toBe(false);

    expect(
      program.completionGate.generalPurposeOperatingSystemComplete
    ).toBe(false);

    expect(program.completionGate.allDriversComplete)
      .toBe(false);
  });
});
