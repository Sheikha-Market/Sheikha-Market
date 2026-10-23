'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {build} = require('../tools/release/build-sheikha-arabic-language-products-v1');

describe('Sheikha Arabic language products release V1', () => {
  test('builds content-addressed hosted products from Arabic Sheikha source', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-language-release-'));
    try {
      const manifest = build(directory);
      expect(manifest.status).toBe('BOUNDED_HOSTED_PRODUCTS_BUILT');
      expect(manifest.targets).toEqual(['BYTECODE_VM', 'JSON_IR', 'JAVASCRIPT', 'PYTHON', 'PHP']);
      expect(manifest.releaseSha256).toMatch(/^[a-f0-9]{64}$/);
      for (const artifact of manifest.artifacts) {
        const data = fs.readFileSync(path.join(directory, artifact.path));
        expect(crypto.createHash('sha256').update(data).digest('hex')).toBe(artifact.sha256);
      }
      expect(fs.readFileSync(path.join(directory, 'source/sheikha-sovereign-architecture-v1.shk'), 'utf8')).toContain('العربية_والعلوم_والاستدلال');
    } finally { fs.rmSync(directory, {recursive: true, force: true}); }
  });

  test('does not include or claim native kernel and firmware artifacts', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-language-release-'));
    try {
      const manifest = build(directory);
      expect(manifest.boundaries).toMatchObject({nativeKernelObjectIncluded: false, firmwareImageIncluded: false, selfHostedCompilerClaimed: false, productionDeploymentPerformed: false});
    } finally { fs.rmSync(directory, {recursive: true, force: true}); }
  });
});
