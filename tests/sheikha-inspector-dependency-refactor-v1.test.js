'use strict';

const path = require('path');

const ROOT = path.join(__dirname, '..');

async function loadModuleWarnings(modulePath) {
  const warnings = [];
  const listener = (warning) => {
    warnings.push([
      warning.name,
      warning.message,
      warning.stack
    ].filter(Boolean).join('\n'));
  };

  process.on('warning', listener);
  jest.resetModules();
  require(path.join(ROOT, modulePath));
  await new Promise((resolve) => setImmediate(resolve));
  process.off('warning', listener);

  return warnings.join('\n');
}

describe('Sheikha Inspector Dependency Refactor V1', () => {
  test.each([
    './core/enterprise/sheikha-enterprise-inspector-v3',
    './runtime/chat-fabric/sheikha-unified-chat-fabric-v1',
    './runtime/conversation-engine/sheikha-conversation-engine-v1',
    './runtime/vital-chat-apex/v1/sheikha-vital-chat-apex-v1'
  ])('loads %s without circular dependency warnings', async (modulePath) => {
    const warnings = await loadModuleWarnings(modulePath);

    expect(warnings).not.toContain('circular dependency');
    expect(warnings).not.toContain('collectEnterpriseInspector');
    expect(warnings).not.toContain('compactInspectorContext');
  });
});
