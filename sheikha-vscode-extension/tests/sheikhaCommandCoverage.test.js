'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  BRIDGE_COMMAND_IDS
} = require('../src/sheikhaCommandBridge');
const {
  CHAT_TOOL_COMMAND_IDS
} = require('../src/ui/sheikhaChatTemplate');

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

  test('exposes every declared command through the governed chat toolbox', () => {
    const declared = packageJson.contributes.commands
      .map((item) => item.command)
      .sort();
    const chatTools = [...CHAT_TOOL_COMMAND_IDS].sort();

    expect(chatTools).toEqual(declared);
    expect(new Set(chatTools).size).toBe(chatTools.length);
  });

  test('uses the governed src entrypoint without an undeclared dependency', () => {
    const entrypoint = fs.readFileSync(
      path.join(ROOT, packageJson.main),
      'utf8'
    );

    expect(packageJson.main).toBe('./src/extension.js');
    expect(entrypoint).not.toContain("require('node-fetch')");
    expect(packageJson.files).not.toContain('extension.js');
  });

  test('activates after startup without the expensive wildcard event', () => {
    expect(packageJson.activationEvents).toContain('onStartupFinished');
    expect(packageJson.activationEvents).not.toContain('*');
  });

  test('packages executable source with explicit backup and test exclusions', () => {
    const vscodeIgnore = fs.readFileSync(
      path.join(ROOT, '.vscodeignore'),
      'utf8'
    );

    expect(packageJson.files).toContain('src/**/*.js');
    expect(packageJson.files).not.toContain('src/**');
    expect(vscodeIgnore).toContain('**/*.bak*');
    expect(vscodeIgnore).toContain('**/*.broken.*');
    expect(vscodeIgnore).toContain('tests/**');
    expect(vscodeIgnore).toContain('dist/**');
  });

  test('keeps GitHub and GitLab integrations optional and user-triggered', () => {
    const bridge = fs.readFileSync(path.join(ROOT, 'src/sheikhaCommandBridge.js'), 'utf8');

    expect(bridge).toContain('تكامل GitHub اختياري وغير مطلوب');
    expect(bridge).toContain('تكامل GitLab اختياري وغير مطلوب');
    expect(bridge).not.toContain('githubRequired: true');
  });
});
