'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
const REGISTRY = 'config/integrations/sheikha-provider-federation-v1.json';
const RESOURCE = 'sheikha://integration/providers';
const DOC = 'docs/canonical/environment/SHEIKHA-PROVIDER-FEDERATION.md';
const BRIDGE = 'mcp-servers/sheikha-mcp-readonly-federation.cjs';
const IDS = ['google-cloud', 'firebase', 'google-workspace', 'cloudflare', 'github', 'github-copilot', 'chatgpt', 'codex'];

function readBounded(file) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > 1048576) throw Error('INPUT_UNAVAILABLE');
    const buffer = Buffer.alloc(1048577);
    let length = 0, count;
    while (length < buffer.length && (count = fs.readSync(fd, buffer, length, buffer.length - length, null))) length += count;
    if (length > 1048576) throw Error('INPUT_UNAVAILABLE');
    return buffer.toString('utf8', 0, length);
  } finally { fs.closeSync(fd); }
}

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function validateRegistry(r) {
  const reject = () => { throw Error('REGISTRY_INVALID'); };
  if (!exactKeys(r, ['schemaVersion', 'platform', 'governanceReference', 'mode', 'productionAdmission',
    'automaticSync', 'sharedCredentials', 'providers', 'links']) || r.schemaVersion !== 1 ||
    r.platform !== 'SHEIKHA UGIT-RP' || r.mode !== 'READ_ONLY_REFERENCE_FEDERATION' ||
    r.governanceReference !== 'docs/canonical/environment/SHEIKHA-ASSISTANT-GOVERNANCE.md' ||
    r.productionAdmission !== 'HOLD' || r.automaticSync !== false || r.sharedCredentials !== false ||
    !exactKeys(r.providers, IDS)) reject();
  const p = r.providers;
  for (const id of ['google-cloud', 'firebase']) {
    if (!exactKeys(p[id], ['projectId', 'projectNumber']) || typeof p[id].projectId !== 'string' ||
      !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(p[id].projectId) ||
      typeof p[id].projectNumber !== 'string' || !/^\d{6,20}$/.test(p[id].projectNumber)) reject();
  }
  if (p.firebase.projectId !== p['google-cloud'].projectId || p.firebase.projectNumber !== p['google-cloud'].projectNumber) reject();
  const w = p['google-workspace'];
  if (!exactKeys(w, ['domain', 'customerId']) ||
    !(w.domain === null || (typeof w.domain === 'string' && w.domain.length <= 253 &&
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(w.domain))) ||
    !(w.customerId === null || (typeof w.customerId === 'string' && /^C[a-zA-Z0-9]{2,30}$/.test(w.customerId)))) reject();
  if (!exactKeys(p.cloudflare, ['accountId', 'mcpUrl']) || typeof p.cloudflare.accountId !== 'string' ||
    !/^[a-f0-9]{32}$/.test(p.cloudflare.accountId) || p.cloudflare.mcpUrl !== 'https://mcp.cloudflare.com/mcp') reject();
  if (!exactKeys(p.github, ['repository']) || typeof p.github.repository !== 'string' ||
    !/^[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/.test(p.github.repository) || p.github.repository.length > 200 ||
    !exactKeys(p['github-copilot'], ['repository', 'instructions']) ||
    p['github-copilot'].repository !== p.github.repository || p['github-copilot'].instructions !== '.github/copilot-instructions.md') reject();
  for (const [id, instructions] of [['chatgpt', 'CHATGPT-INSTRUCTIONS.md'], ['codex', 'AGENTS.md']]) {
    if (!exactKeys(p[id], ['instructions', 'bridge']) || p[id].instructions !== instructions || p[id].bridge !== 'sheikha-readonly') reject();
  }
  const purposes = new Set(['SHARED_PROJECT_ID', 'IDENTITY_REVIEW_REQUIRED', 'OIDC_DEPLOYMENT_REVIEW_REQUIRED',
    'PUBLIC_EDGE_REVIEW_REQUIRED', 'REPOSITORY_CONTEXT', 'SHARED_GOVERNANCE_NOT_SHARED_AUTH']);
  const seen = new Set();
  if (!Array.isArray(r.links) || r.links.length > 32) reject();
  for (const link of r.links) {
    if (!exactKeys(link, ['from', 'to', 'purpose', 'syncEnabled']) || !IDS.includes(link.from) ||
      !IDS.includes(link.to) || link.from === link.to || !purposes.has(link.purpose) || link.syncEnabled !== false) reject();
    const id = `${link.from}:${link.to}`;
    if (seen.has(id)) reject();
    seen.add(id);
  }
  return r;
}

function loadRegistry(root = ROOT) {
  return validateRegistry(JSON.parse(readBounded(path.join(root, REGISTRY))));
}

function inspect({ root = ROOT } = {}) {
  const result = { schemaVersion: 1, scope: 'LOCAL_CONFIGURATION_ONLY', resource: RESOURCE,
    productionAdmission: 'HOLD', automaticSync: false, credentialsShared: false, remoteOperations: false,
    status: 'REVIEW_REQUIRED', issues: [], providers: [] };
  let registry;
  try { registry = loadRegistry(root); }
  catch (_) { return { ...result, status: 'BLOCKED', issues: ['REGISTRY_UNAVAILABLE_OR_INVALID'] }; }
  result.registrySha256 = crypto.createHash('sha256').update(JSON.stringify(registry)).digest('hex');
  result.providers = IDS.map(id => ({ id, expected: registry.providers[id], state: 'REGISTERED_NOT_VERIFIED', liveVerified: false }));
  result.links = registry.links;
  for (const [file, key] of [['.mcp.json', 'mcpServers'], ['.vscode/mcp.json', 'servers']]) {
    try {
      const config = JSON.parse(readBounded(path.join(root, file)));
      const server = config[key]?.['sheikha-readonly'];
      const args = server?.args;
      const configured = server?.command === 'node' && Array.isArray(args) && args.length === 1 &&
        typeof args[0] === 'string' && path.resolve(root, args[0].replaceAll('${workspaceFolder}', root)) === path.join(root, BRIDGE) &&
        (server.type === undefined || server.type === 'stdio') &&
        (server.cwd === undefined || (typeof server.cwd === 'string' &&
          path.resolve(root, server.cwd.replaceAll('${workspaceFolder}', root)) === root)) &&
        Object.keys(server).every(k => ['command', 'args', 'type', 'cwd'].includes(k));
      if (!configured) result.issues.push(`${file}:SHARED_BRIDGE_DRIFT`);
      if (file === '.vscode/mcp.json') {
        if (Object.hasOwn(config, 'mcpServers')) result.issues.push('VSCODE_EXTRA_MCP_SERVERS_REVIEW_REQUIRED');
        const cf = config.servers?.cloudflare;
        result.cloudflareEditorConfigured = cf?.type === 'http' && cf?.url === registry.providers.cloudflare.mcpUrl &&
          Object.keys(cf).every(k => ['type', 'url'].includes(k));
        if (!result.cloudflareEditorConfigured) result.issues.push('CLOUDFLARE_EDITOR_CONFIG_REVIEW_REQUIRED');
      }
    } catch (_) { result.issues.push(`${file}:CONFIG_UNAVAILABLE`); }
  }
  for (const id of ['chatgpt', 'codex', 'github-copilot']) {
    try {
      if (!readBounded(path.join(root, registry.providers[id].instructions)).includes(DOC)) result.issues.push(`${id}:GOVERNANCE_REFERENCE_MISSING`);
    } catch (_) { result.issues.push(`${id}:INSTRUCTIONS_UNAVAILABLE`); }
  }
  if (!registry.providers['google-workspace'].domain || !registry.providers['google-workspace'].customerId) {
    result.issues.push('WORKSPACE_IDENTITY_CONFIRMATION_REQUIRED');
  }
  try {
    const aliases = JSON.parse(readBounded(path.join(root, '.firebaserc'))).projects;
    result.firebaseAliasConfigured = !!aliases && Object.values(aliases).includes(registry.providers.firebase.projectId);
    if (aliases?.default && aliases.default !== registry.providers.firebase.projectId) result.issues.push('FIREBASE_DEFAULT_PROJECT_MISMATCH');
  } catch (_) { result.firebaseAliasConfigured = false; }
  // A complete configuration is still not a live identity or authorization check.
  if (result.issues.length === 0) result.status = 'CONFIGURED_NOT_VERIFIED';
  return result;
}

module.exports = { ROOT, REGISTRY, RESOURCE, DOC, IDS, readBounded, validateRegistry, loadRegistry, inspect };
