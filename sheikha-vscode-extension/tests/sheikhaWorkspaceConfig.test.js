'use strict';
const fs = require('node:fs');
const path = require('node:path');
const json5 = require('json5');
const root = path.resolve(__dirname, '../..');
const read = file => json5.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('multi-root tasks and debug launches bind to the named primary folder', () => {
  const w = read('sheikha-main-portal.code-workspace');
  expect(w.folders.find(f => f.name === 'SHEIKHA').path).toBe('.');
  for (const task of w.tasks.tasks) expect(task.options.cwd).toBe('${workspaceFolder:SHEIKHA}');
  for (const launch of w.launch.configurations) expect(launch.cwd).toBe('${workspaceFolder:SHEIKHA}');
  expect(w.tasks.tasks.filter(t => t.group?.isDefault).map(t => t.label)).toEqual(['Sheikha: Local Workspace Verification']);
  expect(JSON.stringify(w)).not.toContain('SECURITY_STRICT_SECRETS');
  expect(w.settings['security.workspace.trust.enabled']).toBeUndefined();
});
test('local tool activation does not enable cloud completions or start workspace tasks automatically', () => {
  const settings = read('.vscode/settings.json');
  expect(settings['sheikha.workspaceLocalTools']).toBe(true);
  expect(settings['sheikha.enableNES']).toBe(false);
  expect(settings['typescript.disableAutomaticTypeAcquisition']).toBe(true);
  expect(settings['terminal.integrated.env.linux'].PATH).toContain('/.cargo/bin:');
  const tasks = read('.vscode/tasks.json').tasks;
  expect(tasks.some(t => t.runOptions?.runOn === 'folderOpen')).toBe(false);
  const lint = tasks.find(t => t.args?.includes('lint'));
  expect(lint.type).toBe('process'); expect(lint.command).toBe('npm');
});
test('MCP local executable follows the folder without embedding a home directory', () => {
  const mcp = read('.vscode/mcp.json');
  expect(mcp.servers['sheikha-readonly'].args).toEqual(['${workspaceFolder}/mcp-servers/sheikha-mcp-readonly-federation.cjs']);
  expect(fs.existsSync(path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs'))).toBe(true);
});
