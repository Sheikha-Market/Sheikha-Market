'use strict';

const vscode = require('vscode');

const PUBLIC_REGISTRIES = [
  { id: 'github', name: 'GitHub', type: 'source', api: 'https://api.github.com' },
  { id: 'gitlab', name: 'GitLab', type: 'source', api: 'https://gitlab.com/api/v4' },
  { id: 'npm', name: 'npm Registry', type: 'package', api: 'https://registry.npmjs.org' },
  { id: 'pypi', name: 'PyPI', type: 'package', api: 'https://pypi.org/pypi' },
  { id: 'nuget', name: 'NuGet', type: 'package', api: 'https://api.nuget.org/v3/index.json' },
  { id: 'maven', name: 'Maven Central', type: 'package', api: 'https://search.maven.org/solrsearch/select' },
  { id: 'crates', name: 'crates.io', type: 'package', api: 'https://crates.io/api/v1' },
  { id: 'dockerhub', name: 'Docker Hub', type: 'container', api: 'https://hub.docker.com/v2' },
  { id: 'openvsx', name: 'Open VSX', type: 'extension', api: 'https://open-vsx.org/api' },
  { id: 'vscode-marketplace', name: 'VS Code Marketplace', type: 'extension', api: 'marketplace.visualstudio.com' },
  { id: 'google', name: 'Google APIs', type: 'platform', api: 'requires OAuth/API key' },
  { id: 'apple', name: 'Apple Developer APIs', type: 'platform', api: 'requires Apple credentials' },
  { id: 'windows', name: 'Windows Registry', type: 'os', api: 'local Windows only' }
];

async function collectGlobalRegistryFabric() {
  const commands = await vscode.commands.getCommands(true);

  return {
    type: 'SHEIKHA_GLOBAL_REGISTRY_FABRIC_V1',
    generatedAt: new Date().toISOString(),
    accessPolicy: {
      mode: 'read-first',
      externalWrite: 'blocked_until_authorized',
      credentialsRequired: true,
      governance: 'Sheikha approval required before mutation'
    },
    local: {
      vscodeVersion: vscode.version,
      extensions: vscode.extensions.all.map(e => ({
        id: e.id,
        active: e.isActive,
        version: e.packageJSON?.version,
        publisher: e.packageJSON?.publisher,
        displayName: e.packageJSON?.displayName,
        extensionPath: e.extensionPath,
        contributes: Object.keys(e.packageJSON?.contributes || {})
      })),
      commands: {
        count: commands.length,
        sheikha: commands.filter(c => c.toLowerCase().includes('sheikha')),
        ai: commands.filter(c => /copilot|continue|blackbox|claude|openai|chatgpt|ollama|ai|coder/i.test(c))
      },
      workspaceFolders: vscode.workspace.workspaceFolders?.map(f => ({
        name: f.name,
        path: f.uri.fsPath
      })) || [],
      debug: {
        activeSession: vscode.debug.activeDebugSession ? {
          name: vscode.debug.activeDebugSession.name,
          type: vscode.debug.activeDebugSession.type
        } : null,
        breakpoints: vscode.debug.breakpoints.length
      }
    },
    externalRegistries: PUBLIC_REGISTRIES
  };
}

module.exports = { collectGlobalRegistryFabric };
