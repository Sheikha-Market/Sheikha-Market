'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const governedTools = [
  'tools/governance/runtime-integrity-verifier.js',
  'tools/governance/runtime-admission-controller.js',
  'tools/governance/protected-runtime-enforcer.js',
  'tools/governance/runtime-registry-scanner.js',
  'tools/drift/sheikha-runtime-drift-detector.js',
  'tools/heart-core/sheikha-heart-core-v1.js'
];

describe('Sheikha governance tooling command safety', () => {
  test.each(governedTools)('%s avoids shell command execution', relativePath => {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');

    expect(source).not.toMatch(/execSync\s*\(/);
    expect(source).not.toMatch(/spawnSync\s*\(\s*['"]\/bin\/sh/);
  });
});
