'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const JSON5 = require('json5');
const yaml = require('js-yaml');

const FLOW = 'cfad3ce4-b9eb-40b4-9b7d-a7d7c439d254';
const ROOT = path.resolve(__dirname, '../..');
const SELECTED = Object.freeze([
  'datacloud_alloydb_remote', 'datacloud_bigquery_remote',
  'datacloud_bigtable-admin_remote', 'datacloud_bigtable-data_remote',
  'datacloud_cloud-sql_remote', 'datacloud_gcs_remote',
  'datacloud_knowledge_catalog_remote', 'datacloud_spanner_remote',
  'io.github.github/github-mcp-server'
]);
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');

function noLinks(file) {
  let current = path.resolve(file);
  while (true) {
    try { if (fs.lstatSync(current).isSymbolicLink()) throw new Error('SYMLINK_REJECTED'); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

function convert(server) {
  if (!server || typeof server !== 'object' || Array.isArray(server)) throw new Error('SERVER_OBJECT_REQUIRED');
  const allowed = new Set(['type', 'command', 'args', 'env', 'url', 'headers', 'tools', 'timeout', 'cwd', 'gallery', 'version']);
  if (Object.keys(server).some(k => !allowed.has(k))) throw new Error('UNSUPPORTED_SERVER_FIELD');
  const result = Object.fromEntries(Object.entries(server).filter(([k]) => k !== 'gallery' && k !== 'version'));
  if (result.command) {
    if (result.type && !['stdio', 'local'].includes(result.type)) throw new Error('TRANSPORT_CONFLICT');
    result.type = 'local';
    if (typeof result.command !== 'string' || !Array.isArray(result.args)
        || !result.args.every(a => typeof a === 'string')) throw new Error('INVALID_LOCAL_SERVER');
  } else {
    if (!['http', 'sse'].includes(result.type)) throw new Error('UNSUPPORTED_REMOTE_TRANSPORT');
    const url = new URL(result.url);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('UNSAFE_REMOTE_URL');
  }
  if (/\$\{(?:input:|workspaceFolder|REGION)/.test(JSON.stringify(result))) throw new Error('UNRESOLVED_VARIABLE');
  if (!result.tools) result.tools = ['*'];
  return result;
}

function migrateServers(source, existing = { mcpServers: {} }) {
  if (!source.servers || !existing.mcpServers || Array.isArray(existing.mcpServers)) {
    throw new Error('CONFIG_SHAPE_INVALID');
  }
  const servers = { ...existing.mcpServers };
  for (const name of SELECTED) {
    const candidate = convert(source.servers[name]);
    if (Object.hasOwn(servers, name) && !require('node:util').isDeepStrictEqual(servers[name], candidate)) {
      throw new Error('EXISTING_SERVER_CONFLICT');
    }
    servers[name] = candidate;
  }
  return { ...existing, mcpServers: servers };
}

function migrateInstruction(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!match) throw new Error('INSTRUCTION_FRONTMATTER_REQUIRED');
  let metadata;
  try { metadata = yaml.load(match[1]); }
  catch {
    // The selected source has exactly one malformed, unquoted description line.
    const line = /^description: ([^\r\n]+)$/.exec(match[1]);
    if (!line) throw new Error('UNSUPPORTED_INSTRUCTION_FRONTMATTER');
    metadata = { description: line[1] };
  }
  if (!metadata || typeof metadata.description !== 'string') throw new Error('DESCRIPTION_REQUIRED');
  return '---\n' + yaml.dump(metadata, { lineWidth: -1, quotingType: '"', forceQuotes: true })
    + '---\n' + text.slice(match[0].length);
}

function read(file) {
  noLinks(file);
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error('INPUT_FILE_LIMIT');
    return fs.readFileSync(fd);
  } finally { fs.closeSync(fd); }
}

function publishNew(file, bytes) {
  const temporary = file + '.migration-' + crypto.randomUUID();
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  try { fs.linkSync(temporary, file); }
  finally { fs.unlinkSync(temporary); }
}

function install() {
  const home = os.homedir();
  const code = path.join(home, '.config/Code/User');
  const sourceMcp = path.join(code, 'mcp.json');
  const sourceInstruction = path.join(code, 'prompts/azurecosmosdb.instructions.md');
  const destination = path.join(home, '.copilot/mcp-config.json');
  const instructionsDir = path.join(home, '.copilot/instructions');
  const instructionTarget = path.join(instructionsDir, 'azurecosmosdb.instructions.md');
  const recovery = path.join(code, 'workspaceStorage/customizationMigrations', FLOW, 'copilot-governed-r1');
  const inputs = [sourceMcp, sourceInstruction, path.join(ROOT, '.vscode/mcp.json'), path.join(ROOT, '.mcp.json')];
  for (const file of [...inputs, destination, instructionTarget, recovery]) noLinks(file);
  const source = new Map(inputs.map(file => [file, read(file)]));
  const previous = fs.existsSync(destination) ? read(destination) : null;
  const oldInstruction = fs.existsSync(instructionTarget) ? read(instructionTarget) : null;
  const config = migrateServers(JSON5.parse(source.get(sourceMcp).toString()),
    previous ? JSON5.parse(previous.toString()) : undefined);
  const instruction = Buffer.from(migrateInstruction(source.get(sourceInstruction).toString()));
  const configData = Buffer.from(JSON.stringify(config, null, 2) + '\n');
  if (previous && !previous.equals(configData)) throw new Error('EXISTING_CONFIG_REQUIRES_SEPARATE_REVIEW');
  if (oldInstruction && !oldInstruction.equals(instruction)) throw new Error('EXISTING_INSTRUCTION_CONFLICT');
  const local = JSON5.parse(source.get(path.join(ROOT, '.mcp.json')).toString()).mcpServers?.['sheikha-readonly'];
  if (local?.command !== 'node' || local.args?.length !== 1
      || path.resolve(ROOT, local.args[0]) !== path.join(ROOT, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')) {
    throw new Error('LOCAL_READONLY_MAPPING_REQUIRES_REVIEW');
  }
  fs.mkdirSync(recovery, { mode: 0o700 });
  const backup = [];
  let index = 0;
  for (const [file, data] of source) {
    const name = `input-${++index}.bak`;
    fs.writeFileSync(path.join(recovery, name), data, { flag: 'wx', mode: 0o600 });
    backup.push({ source: file, backup: name, sha256: sha(data) });
  }
  const prepared = [{ destination, bytes: configData, previous },
    { destination: instructionTarget, bytes: instruction, previous: oldInstruction }];
  fs.writeFileSync(path.join(recovery, 'PLAN.json'), JSON.stringify({ flow: FLOW, backup,
    targets: prepared.map(p => ({ path: p.destination, existed: !!p.previous, expectedSha256: sha(p.bytes) })),
    localMcpUnchanged: true, permissionChanges: false, remoteRequests: false }, null, 2) + '\n',
  { flag: 'wx', mode: 0o600 });
  for (const [file, data] of source) if (!read(file).equals(data)) throw new Error('SOURCE_CHANGED');
  if (!fs.existsSync(instructionsDir)) fs.mkdirSync(instructionsDir, { mode: 0o700 });
  for (const item of prepared) {
    if (item.previous) continue;
    noLinks(item.destination);
    publishNew(item.destination, item.bytes);
  }
  for (const item of prepared) if (!read(item.destination).equals(item.bytes)) throw new Error('DESTINATION_VERIFICATION_FAILED');
  const result = { flow: FLOW, status: 'MIGRATED_CONFIGURATION_NOT_REMOTE_EXECUTION',
    userMcpServers: SELECTED, localMcp: 'sheikha-readonly: already configured, unchanged',
    instruction: instructionTarget, instructionBodyPreserved: true, frontmatterRepaired: true,
    deferred: [{ name: 'datacloud_dataproc_remote', reason: 'NOT_SELECTED_AND_REGION_UNRESOLVED' }],
    recovery, remoteRequests: false, permissionsExpanded: false, credentialStoresOpened: false,
    sourcesUnchanged: inputs.every(file => read(file).equals(source.get(file))) };
  fs.writeFileSync(path.join(recovery, 'RESULT.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return result;
}

module.exports = { SELECTED, convert, migrateServers, migrateInstruction, noLinks, publishNew };
if (require.main === module) {
  if (process.argv[2] !== '--execute-migration') {
    console.error('Usage: node tools/migrations/migrate-vscode-copilot-customizations.cjs --execute-migration');
    process.exitCode = 2;
  } else {
    try { console.log(JSON.stringify(install(), null, 2)); }
    catch (error) { console.error(JSON.stringify({ status: 'MIGRATION_STOPPED', code: error.code || error.message })); process.exitCode = 2; }
  }
}
