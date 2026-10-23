'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const language = require('../language/sheikha-managed-language-v1.cjs');
const foundation = require('./sheikha-language-component-evidence-v1.cjs');
const { runBytecode } = require('../../sheikha-language/compiler/bytecode-vm');
const ROOT = path.resolve(__dirname, '../..');
const SOURCE_FILE = 'sheikha-language/foundations/activated-session-production-v1.shk';
const IDS = require('../../sheikha-language/compiler/local-production-components');
function hash(content) { return crypto.createHash('sha256').update(content).digest('hex'); }
function json(value) { return JSON.stringify(value, null, 2) + '\n'; }
function componentArgument(step) {
  const match = String(step.argument).match(/^"([a-z-]+)"$/);
  if (!match || !IDS.includes(match[1])) throw new Error('INVALID_COMPONENT_ARGUMENT');
  return match[1];
}
function build(source = fs.readFileSync(path.join(ROOT, SOURCE_FILE), 'utf8')) {
  const compiled = language.compile(source);
  if (!compiled.success) throw new Error('TYPECHECK_BLOCKED');
  // This production dialect is deliberately linear; no shell, API, branch or approval commands.
  const procedure = compiled.ast.body.filter(node => node.type === 'ProcedureDeclaration');
  if (procedure.length !== 1 || procedure[0].body.some(step => step.type !== 'CommandStatement' || !['تحقق_وحدة', 'انتج_عقد', 'اعرض'].includes(step.command)))
    throw new Error('PRODUCTION_COMMAND_NOT_ADMITTED');
  const definitions = new Map();
  for (const node of compiled.ast.body.filter(n => n.type === 'EntityDeclaration')) {
    const properties = Object.fromEntries(node.properties.map(p => [p.key, p.value]));
    const id = properties['المعرف'];
    if (!IDS.includes(id) || definitions.has(id)) throw new Error('INVALID_COMPONENT_DEFINITION');
    definitions.set(id, { name: node.name, properties });
  }
  if (definitions.size !== IDS.length) throw new Error('ALL_COMPONENT_DEFINITIONS_REQUIRED');
  // Build artifacts exclude wall-clock metadata; source semantics remain unchanged.
  delete compiled.ir.meta.generatedAt;
  const sourceSha256 = hash(source);
  const verified = new Set(); const contracts = new Map(); const evidence = [];
  const handlers = {
    'تحقق_وحدة': (step, state) => {
      const id = componentArgument(step);
      if (!state.governancePolicies['الانتاج_المحلي'] || verified.has(id)) throw new Error('POLICY_OR_SEQUENCE_DENIED');
      const result = foundation.inspect(id);
      if (!result.evidence.passed) throw new Error('COMPONENT_NOT_VERIFIED');
      verified.add(id); evidence.push({ component: id, basis: result.evidence.basis, passed: true });
      return { ok: true, marker: 'VERIFIED:' + id };
    },
    'انتج_عقد': (step, state) => {
      const id = componentArgument(step);
      if (!verified.has(id) || contracts.has(id)) throw new Error('VERIFY_BEFORE_PRODUCE_REQUIRED');
      const definition = definitions.get(id);
      const dependencies = definition.properties['التبعيات'] === 'لا_شيء' ? [] : definition.properties['التبعيات'].split('،').map(dep => dep.trim());
      if (dependencies.some(dep => !contracts.has(dep))) throw new Error('DEPENDENCY_NOT_PRODUCED');
      if (!state.entities[definition.name]) throw new Error('SOURCE_ENTITY_NOT_EXECUTED');
      contracts.set(id, { schemaVersion: '1.0', component: id, language: 'sheikha', sourceSha256,
        definition, dependencies, status: 'LOCAL_CONTRACT_PRODUCED',
        verificationScope: 'LOCAL_ARTIFACT_OR_PROBE_ONLY',
        verificationBasis: evidence.find(item => item.component === id).basis,
        productionServiceActivated: false, hardwareMutationPerformed: false, deploymentPerformed: false });
      return { ok: true, marker: 'PRODUCED:' + id };
    }
  };
  const execution = runBytecode(compiled.bytecode, {
    live: false, profile: 'local', strictIsolation: true, localProductionHandlers: handlers
  });
  if (!execution.ok || contracts.size !== IDS.length) throw new Error('PRODUCTION_GATE_BLOCKED');
  const files = { 'source.shk': source, 'program.bytecode.json': json(compiled.bytecode), 'program.ir.json': json(compiled.ir),
    'execution.json': json({ status: 'EXECUTED_LOCAL_PRODUCTION', adapterDryRun: execution.state.adapters.dryRun,
      governanceViolations: execution.state.governance.violations.length, output: execution.state.output, evidence }) };
  for (const [id, contract] of contracts) files['contracts/' + id + '.json'] = json(contract);
  const manifest = { schemaVersion: '1.0', status: 'LOCAL_LANGUAGE_PRODUCTION_COMPLETE', sourceFile: SOURCE_FILE,
    sourceSha256, hostRuntime: 'Node.js', selfHostedCompiler: false, fullyMigratedServices: false,
    compilerEvidence: ['sheikha-language/compiler/parser.js', 'sheikha-language/compiler/type-checker.js',
      'sheikha-language/compiler/ir.js', 'sheikha-language/compiler/bytecode.js', 'sheikha-language/compiler/vm.js',
      'core/foundation/sheikha-language-production-v1.cjs'].map(file => ({ file, sha256: hash(fs.readFileSync(path.join(ROOT, file))) })),
    artifacts: Object.entries(files).map(([file, content]) => ({ file, bytes: Buffer.byteLength(content), sha256: hash(content) })),
    deployed: false, servicesStarted: false, physicalDeviceWritten: false };
  files['manifest.json'] = json(manifest);
  return { manifest, files };
}
function writeBuild(result = build()) {
  const parent = path.join(ROOT, 'runtime/sheikha-language-production/v2/builds');
  fs.mkdirSync(parent, { recursive: true });
  const buildId = hash(json(result.manifest));
  const output = path.join(parent, buildId);
  if (fs.existsSync(output)) {
    for (const [file, content] of Object.entries(result.files)) {
      if (!fs.existsSync(path.join(output, file)) || fs.readFileSync(path.join(output, file), 'utf8') !== content)
        throw new Error('EXISTING_BUILD_INTEGRITY_FAILED');
    }
    return { status: 'EXISTING_BUILD_VERIFIED', buildId, output: path.relative(ROOT, output) };
  }
  const staging = fs.mkdtempSync(path.join(parent, '.staging-'));
  for (const [file, content] of Object.entries(result.files)) {
    const target = path.join(staging, file); fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, { flag: 'wx', mode: 0o600 });
  }
  fs.renameSync(staging, output);
  return { status: 'LOCAL_BUILD_WRITTEN', buildId, output: path.relative(ROOT, output) };
}
function status() {
  const result = build();
  const buildId = hash(json(result.manifest));
  const output = 'runtime/sheikha-language-production/v2/builds/' + buildId;
  const persisted = fs.existsSync(path.join(ROOT, output, 'manifest.json'));
  const persistedIntegrityVerified = persisted && Object.entries(result.files).every(([file, content]) =>
    fs.existsSync(path.join(ROOT, output, file)) && fs.readFileSync(path.join(ROOT, output, file), 'utf8') === content);
  return { ...result.manifest, buildId, output, persisted, persistedIntegrityVerified,
    ...(persisted && !persistedIntegrityVerified ? { status: 'PERSISTED_BUILD_INTEGRITY_FAILED' } : {}),
    verificationMode: 'LOCAL_SOURCE_COMPILE_AND_EXECUTE' };
}
module.exports = { build, writeBuild, status, SOURCE_FILE };
