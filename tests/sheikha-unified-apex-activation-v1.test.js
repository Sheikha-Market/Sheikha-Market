'use strict';

const fs = require('fs');
const path = require('path');
const { validate } = require('../tools/activation/sheikha-unified-apex-validator-v1');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Unified Apex Activation V1', () => {
  test('manifest passes deterministic and governance validation', () => {
    const result = validate();

    expect(result.status).toBe('PASSED');
    expect(result.checks.canonicalLayers).toBeGreaterThanOrEqual(8);
    expect(result.checks.activationScripts).toBeGreaterThanOrEqual(11);
    expect(result.checks.governanceReferences).toBeGreaterThanOrEqual(8);
    expect(result.externalState.autonomousFinalAuthority).toBe(false);
  });

  test('strict external validation truthfully rejects unconnected infrastructure', () => {
    const result = validate({ strictExternal: true });

    expect(result.status).toBe('FAILED');
    expect(result.errors.join(' ')).toContain('external infrastructure is not connected');
  });

  test('verification and activation scripts use governed checks', () => {
    const verify = read('tools/verify-sheikha-unified-apex-v1.sh');
    const activate = read('tools/activate-sheikha-unified-apex-v1.sh');
    const compatibility = read('tools/activate-sheikha-civilization-command-plane.sh');
    const common = read('tools/activation/sheikha-activation-common-v1.sh');

    expect(verify).toContain('npm test -- --runInBand');
    expect(verify).toContain('runtime-integrity-verifier.js');
    expect(activate).toContain('activationScripts');
    expect(activate).toContain('--restart-pm2');
    expect(compatibility).toContain('activate-sheikha-unified-apex-v1.sh');
    expect(common).toContain('mktemp');
    expect(common).not.toContain('"$@" 2>&1 | tee');
  });

  test('release script is scoped and rejects destructive git shortcuts', () => {
    const release = read('tools/release-sheikha-unified-apex-v1.sh');

    expect(release).toContain('releasePaths');
    expect(release).toContain('sheikha_assert_no_unstaged_changes');
    expect(release).not.toContain('git add .');
    expect(release).not.toContain('push --force');
    expect(release).not.toContain('reset --hard');
    expect(release).not.toContain('git switch');
  });

  test('package scripts and documentation expose all three workflows', () => {
    const packageJson = require('../package.json');
    const manifest = require('../tools/activation/sheikha-unified-apex-manifest-v1.json');
    const docs = read('docs/activation/SHEIKHA-UNIFIED-APEX-ACTIVATION-V1.md');

    expect(packageJson.scripts['ops:unified-apex:verify']).toBeTruthy();
    expect(packageJson.scripts['ops:unified-apex:activate']).toBeTruthy();
    expect(packageJson.scripts['ops:unified-apex:release']).toBeTruthy();
    expect(docs).toContain('--strict-external');
    expect(manifest.releasePaths).toContain(
      'runtime/runtime-fabric-v5/sheikha-runtime-fabric-v5-report.json'
    );
    expect(manifest.releasePaths).toContain('runtime/storage-governance/v1');
  });
});
