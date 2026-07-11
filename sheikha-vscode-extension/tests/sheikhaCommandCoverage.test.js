'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  BRIDGE_COMMAND_IDS
} = require('../src/sheikhaCommandBridge');

const ROOT = path.resolve(__dirname, '..');
const packageJson = require('../package.json');
const CORE_COMMAND_IDS = [
  'sheikha.openChat',
  'sheikha.awareness.scan',
  'sheikha.registry.unified',
  'sheikha.registry.broker',
  'sheikha.registry.global',
  'sheikha.devtools.toggle',
  'sheikha.console.open',
  'sheikha.inspector.devtools'
];

describe('Sheikha extension command coverage', () => {
  test('registers every command declared by the extension manifest', () => {
    const declared = packageJson.contributes.commands
      .map((item) => item.command)
      .sort();
    const implemented = Array.from(new Set([
      ...CORE_COMMAND_IDS,
      ...BRIDGE_COMMAND_IDS
    ])).sort();

    expect(implemented).toEqual(declared);
    expect(implemented).toHaveLength(39);

    const activation = fs.readFileSync(path.join(ROOT, 'src/extension.js'), 'utf8');
    for (const command of CORE_COMMAND_IDS) expect(activation).toContain(command);
  });

  test('uses the governed src entrypoint without an undeclared dependency', () => {
    const entrypoint = fs.readFileSync(path.join(ROOT, 'extension.js'), 'utf8');

    expect(entrypoint).toContain("require('./src/extension')");
    expect(entrypoint).not.toContain("require('node-fetch')");
  });

  test('activates after startup without the expensive wildcard event', () => {
    expect(packageJson.activationEvents).toContain('onStartupFinished');
    expect(packageJson.activationEvents).not.toContain('*');
  });

  test('packages executable source without backup trees or conflicting ignore rules', () => {
    expect(packageJson.files).toContain('src/**/*.js');
    expect(packageJson.files).not.toContain('src/**');
    expect(fs.existsSync(path.join(ROOT, '.vscodeignore'))).toBe(false);
  });

  test('keeps GitHub and GitLab integrations optional and user-triggered', () => {
    const bridge = fs.readFileSync(path.join(ROOT, 'src/sheikhaCommandBridge.js'), 'utf8');

    expect(bridge).toContain('تكامل GitHub اختياري وغير مطلوب');
    expect(bridge).toContain('تكامل GitLab اختياري وغير مطلوب');
    expect(bridge).not.toContain('githubRequired: true');
  });
});
