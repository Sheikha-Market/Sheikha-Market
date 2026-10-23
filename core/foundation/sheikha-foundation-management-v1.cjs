'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
const COMPONENTS = Object.freeze({
  utf: { name: 'Sheikha UTF', role: 'Arabic text encoding and integrity', dependencies: [], executionDomain: 'HOSTED', mapping: 'PROVISIONAL_UTF8_ARABIC_ENCODING' },
  core: { name: 'Sheikha Core', role: 'Contracts, registry, admission and orchestration', dependencies: ['utf'], executionDomain: 'HOSTED' },
  studio: { name: 'Sheikha Studio', role: 'Developer workspace and governed language tools', dependencies: ['core'], executionDomain: 'HOSTED' },
  lab: { name: 'Sheikha Lab', role: 'Bounded local experiments and validation before promotion', dependencies: ['core', 'studio'], executionDomain: 'HOSTED' },
  visual: { name: 'Sheikha Visual', role: 'Governed geometry and scene planning', dependencies: ['utf', 'core', 'studio'], executionDomain: 'HOSTED' },
  firmware: { name: 'Sheikha Firmware', role: 'Firmware policy and artifact admission', dependencies: [], executionDomain: 'HARDWARE_POLICY_ONLY' },
  'bare-metal': { name: 'Sheikha Bare Metal', role: 'UEFI boot and native kernel artifacts', dependencies: ['firmware'], executionDomain: 'ARTIFACT_INSPECTION_ONLY' }
});
function metadata(component) {
  if (!Object.hasOwn(COMPONENTS, component)) throw new Error('UNKNOWN_COMPONENT');
  return { component, ...COMPONENTS[component], responsibilities: {
    accountable: 'COMPONENT_MAINTAINER_UNASSIGNED', reviewer: 'GOVERNANCE_REVIEWER_UNASSIGNED',
    release: 'RELEASE_APPROVER_UNASSIGNED'
  } };
}
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function inspectBootArtifacts() {
  const reportFile = 'runtime/bare-metal/v1/sheikha-bare-metal-seed-v1-report.json';
  const report = JSON.parse(fs.readFileSync(path.join(ROOT, reportFile), 'utf8'));
  const expectedPaths = { efi: 'bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI', image: 'bare-metal/images/sheikha-bare-metal-seed-v1.img' };
  const artifacts = Object.entries(expectedPaths).map(([kind, relative]) => {
    const recorded = report.artifact?.[kind];
    const file = path.join(ROOT, relative);
    const exists = fs.existsSync(file);
    const content = exists ? fs.readFileSync(file) : null;
    const digest = content ? sha256(content) : null;
    return { kind, file: relative, present: exists, bytes: content?.length ?? null, sha256: digest,
      matchesRecordedDigest: Boolean(recorded?.path === relative && recorded.sha256 === digest) };
  });
  return { passed: artifacts.every(item => item.present && item.matchesRecordedDigest),
    artifacts, reportFile, recordedBootStatus: report.status,
    historicalEvidenceOnly: true, bootExecutedThisSession: false, physicalHardwareVerified: 'UNKNOWN',
    independentAuthenticityVerified: 'UNKNOWN' };
}
function probe(component) {
  metadata(component);
  try {
    if (component === 'utf') {
      const encoding = require('../language/sheikha-arabic/encoding/sheikha-arabic-semantic-encoding-v1');
      const result = encoding.encodeMessage({ text: 'شيخة — اختبار محلي' });
      return { passed: result.roundTrip.verified, basis: 'ACTUAL_LOCAL_ENCODING_ROUND_TRIP',
        encoding: result.layers.presentation.encoding, semanticNameConfirmed: 'UNKNOWN', networkTransmissionExecuted: false };
    }
    if (component === 'core') {
      const { SheikhaSupremeCore } = require('../../runtime/sheikha-core/supreme/sheikha-supreme-core');
      const result = new SheikhaSupremeCore().composeCore();
      return { passed: result.modules.length > 0 && result.modules.every(item => item.boundaries.contractRequired),
        basis: 'LOCAL_CONTRACT_COMPOSITION_ONLY', modules: result.modules.map(item => item.module), runtimeServiceVerified: 'UNKNOWN' };
    }
    if (component === 'studio') {
      const { SheikhaStudioWorkspace } = require('../../runtime/sheikha-studio/core/sheikha-studio-workspace-v1');
      const workspace = new SheikhaStudioWorkspace({ root: ROOT, writeEnabled: false });
      const sample = workspace.read('sdk/sheikha-js/index.js');
      const language = require('../language/sheikha-managed-language-v1.cjs').status();
      return { passed: sample.size > 0 && language.success, basis: 'LOCAL_WORKSPACE_READ_AND_LANGUAGE_PROBE',
        workspaceWritesEnabled: false, editorServiceVerified: 'UNKNOWN', language: language.status,
        sampleDigest: sample.sha256 };
    }
    if (component === 'lab') {
      const registryFile = 'runtime/devops-ai-lab-fabric/v1/registries/experiment-to-product-registry.json';
      const registry = JSON.parse(fs.readFileSync(path.join(ROOT, registryFile), 'utf8'));
      const result = require('../language/sheikha-managed-language-v1.cjs').run('إجراء تجربة:\n  اعرض "LAB_LOCAL_PROBE"\n');
      return { passed: result.success && registry.cycle.includes('VALIDATION'), basis: 'LOCAL_LANGUAGE_EXPERIMENT_AND_CYCLE_REGISTRY',
        stages: registry.cycle, dryRun: result.evidence.adapterDryRun, automaticPromotionAllowed: false };
    }
    if (component === 'visual') {
      const geometry = require('../../runtime/sheikha-visual-spatial-fabric-v1/dimension-engine-v1');
      const policy = require('../../runtime/sheikha-visual-spatial-fabric-v1/drawing-policy-v2');
      const square = geometry.square(4); const house = geometry.house(8, 10, 3, 2);
      const allowed = policy.evaluateDrawing({ subject: 'gardens', purpose: 'planning' });
      const denied = policy.evaluateDrawing({ subject: 'human_likeness_generation' });
      return { passed: square.area === 16 && house.baseArea === 80 && allowed.decision === 'ALLOW' && denied.decision === 'DENY',
        basis: 'LOCAL_GEOMETRY_AND_POLICY_EXECUTION', renderingExecuted: false, providerCalled: false, serviceVerified: 'UNKNOWN' };
    }
    if (component === 'firmware') {
      const gate = require('../governance/sheikha-hardware-firmware-governance-adapter-v1');
      const denied = gate.planHardwareOperation({ operation: 'FIRMWARE_FLASH_WRITE' });
      const read = gate.planHardwareOperation({ operation: 'FIRMWARE_IMAGE_HASH' });
      return { passed: denied.decision === 'DENY' && read.actualOperationPerformed === false,
        basis: 'LOCAL_POLICY_DENIAL_TEST', flashWithoutApproval: denied.decision,
        mutationPerformed: false, physicalFirmwareVerified: 'UNKNOWN' };
    }
    return { ...inspectBootArtifacts(), basis: 'CURRENT_ARTIFACT_HASH_VS_RECORDED_REPORT' };
  } catch (_) { return { passed: false, basis: 'PROBE_UNAVAILABLE', reason: 'UNKNOWN' }; }
}
function inspect(component) {
  const evidence = probe(component);
  return { ...metadata(component), status: evidence.passed ? 'LOCAL_FOUNDATION_VERIFIED' : 'UNKNOWN', evidence,
    productionActivation: 'UNKNOWN', physicalActivation: 'UNKNOWN', externalCommitmentCreated: false };
}
function activationPlan(component, input = {}) {
  const item = inspect(component);
  // This API admits local foundation tooling only. No flags authorize service or hardware writes.
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => k !== 'mode') || (input.mode && input.mode !== 'local-foundation'))
    return { component, decision: 'DENY', reason: 'ONLY_LOCAL_FOUNDATION_ADMISSION_SUPPORTED', executionPerformed: false };
  const dependencies = item.dependencies.map(inspect);
  const admitted = item.evidence.passed && dependencies.every(d => d.evidence.passed);
  return { component, decision: admitted ? 'ADMIT_LOCAL_FOUNDATION_ONLY' : 'DENY_PENDING_EVIDENCE',
    mode: 'local-foundation', dependencies: dependencies.map(d => ({ component: d.component, status: d.status })),
    status: item.status, executionPerformed: false, serviceStarted: false, firmwareWritten: false,
    blockers: ['PRODUCTION_REQUIRES_SEPARATE_AUTHORIZATION', ...(item.executionDomain !== 'HOSTED' ? ['PHYSICAL_ACTIVATION_NOT_ADMITTED'] : [])] };
}
function status() {
  const components = Object.keys(COMPONENTS).map(inspect);
  return { system: 'SHEIKHA_FOUNDATION_MANAGEMENT_V1',
    status: components.every(c => c.evidence.passed) ? 'LOCAL_FOUNDATIONS_VERIFIED' : 'LOCAL_FOUNDATIONS_WITH_GAPS',
    components, governance: { denyByDefault: true, automaticDeployment: false, hardwareMutation: false,
      publication: false, ownerPersonalDataIncluded: false },
    pipeline: ['DESIGN', 'LOCAL_VERIFY', 'GOVERNANCE_REVIEW', 'RELEASE_REVIEW', 'SEPARATELY_AUTHORIZED_DEPLOYMENT'],
    productionActivation: 'UNKNOWN' };
}
module.exports = { metadata, probe, inspect, activationPlan, status };
