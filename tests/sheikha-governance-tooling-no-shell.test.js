'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const governedTools = [
  'tools/governance/runtime-integrity-verifier.js',
  'tools/governance/runtime-admission-controller.js',
  'tools/governance/protected-runtime-enforcer.js',
  'tools/governance/runtime-registry-scanner.js',
  'tools/governance/git-context-reader.js',
  'tools/drift/sheikha-runtime-drift-detector.js',
  'tools/heart-core/sheikha-heart-core-v1.js'
];

describe('Sheikha governance tooling command safety', () => {
  test.each(governedTools)('%s avoids shell command execution', relativePath => {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');

    expect(source).not.toMatch(/execSync\s*\(/);
    expect(source).not.toMatch(/spawnSync\s*\(\s*['"]\/bin\/sh/);
  });

  test('captured Git context is consumed without spawning Git', () => {
    const reader = fs.readFileSync(
      path.join(root, 'tools/governance/git-context-reader.js'), 'utf8'
    );

    expect(reader).toContain('SHEIKHA_GIT_STATUS_FILE');
    expect(reader).toContain('SHEIKHA_GIT_TRACKED_FILE');
  });

  test('drift detector evaluates governance modules in-process', () => {
    const drift = fs.readFileSync(
      path.join(root, 'tools/drift/sheikha-runtime-drift-detector.js'), 'utf8'
    );

    expect(drift).toContain('runAdmissionController()');
    expect(drift).toContain('runProtectedRuntime()');
    expect(drift).not.toContain('execFileSync');
  });

  test('security scan artifacts are governed without being treated as stored secrets', () => {
    const {
      evaluateFile,
      isBlocked,
      isSecurityScanArtifact
    } = require('../tools/governance/runtime-admission-controller');
    const {
      isForbidden
    } = require('../tools/governance/protected-runtime-enforcer');

    const report = 'runtime/security/semantic-secret-scan-v1.json';
    const tool = 'tools/security/semantic-secret-scan-v1.js';
    const envSecret = '.env.production';

    expect(isSecurityScanArtifact(report)).toBe(true);
    expect(isBlocked(report)).toBe(false);
    expect(isForbidden(report)).toBe(false);
    expect(evaluateFile(report).decision).toBe('ALLOWED');

    expect(isSecurityScanArtifact(tool)).toBe(true);
    expect(isBlocked(tool)).toBe(false);
    expect(isForbidden(tool)).toBe(false);
    expect(evaluateFile(tool)).toMatchObject({
      decision: 'REVIEW_REQUIRED',
      owner: 'Security Tooling Governance'
    });

    expect(isSecurityScanArtifact(envSecret)).toBe(false);
    expect(isBlocked(envSecret)).toBe(true);
    expect(isForbidden(envSecret)).toBe(true);
  });

  test('activation release and deployment paths have explicit governance owners', () => {
    const {
      evaluateFile
    } = require('../tools/governance/runtime-admission-controller');

    expect(evaluateFile('tools/activation/activate-runtime-safe.sh')).toMatchObject({
      decision: 'REVIEW_REQUIRED',
      owner: 'Activation Governance'
    });
    expect(evaluateFile('release/SHEIKHA-PRODUCTION-LOCK-V1.json')).toMatchObject({
      decision: 'REVIEW_REQUIRED',
      owner: 'Release Governance'
    });
    expect(evaluateFile('deploy_production.sh')).toMatchObject({
      decision: 'REVIEW_REQUIRED',
      owner: 'Deployment Governance'
    });
    expect(evaluateFile('setup_ultimate_ai.sh')).toMatchObject({
      decision: 'REVIEW_REQUIRED',
      owner: 'Runtime Setup Governance'
    });
  });
});
