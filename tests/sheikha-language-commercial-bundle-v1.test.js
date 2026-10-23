'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {build} = require('../tools/release/build-sheikha-language-commercial-bundle-v1');

describe('Sheikha language commercial bundle V1', () => {
  test('builds a licensed checksum-addressed bundle containing only bounded products', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-commercial-language-'));
    try {
      const manifest = build(directory);
      expect(manifest.status).toBe('READY_FOR_CONTRACTED_COMMERCIAL_DISTRIBUTION');
      expect(manifest.license).toMatchObject({
        id: 'SHEIKHA-PGUL-1.0',
        writtenCustomerOrderRequired: true,
        governmentalRegistrationClaimed: false
      });
      expect(manifest.products).toContain('SHEIKHA_LANGUAGE_KERNEL_INTEGRATION_IMAGE');
      expect(manifest.exclusions).toEqual(expect.arrayContaining([
        'COMPLETE_SELF_HOSTED_COMPILER',
        'PRODUCTION_FIRMWARE'
      ]));
      expect(fs.existsSync(path.join(directory, 'SBOM.spdx.json'))).toBe(true);
      expect(fs.existsSync(path.join(directory, 'legal/LICENSE-AR.md'))).toBe(true);
      expect(fs.existsSync(path.join(directory, 'commercial/license-order-form-ar.md'))).toBe(true);
      expect(manifest.artifacts.every((artifact) => /^[a-f0-9]{64}$/.test(artifact.sha256))).toBe(true);
    } finally {
      fs.rmSync(directory, {recursive: true, force: true});
    }
  });

  test('uses deterministic SPDX creation metadata by default', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-commercial-spdx-'));
    try {
      build(directory);
      const sbom = JSON.parse(fs.readFileSync(path.join(directory, 'SBOM.spdx.json'), 'utf8'));
      expect(sbom.creationInfo.created).toBe('1970-01-01T00:00:00.000Z');
      expect(sbom.spdxVersion).toBe('SPDX-2.3');
    } finally {
      fs.rmSync(directory, {recursive: true, force: true});
    }
  });
});
