'use strict';

const path = require('node:path');
const fs = require('node:fs');
const verifier = require(
  '../runtime/root-architecture/v3/sheikha-root-verifier-v3'
);
const routes = require(
  '../routes/root-architecture/sheikha-root-architecture-v3-routes'
);

const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), 'utf8')
  );
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

describe('Sheikha Root Architecture V3', () => {
  test('places Sheikha above individual project layers', () => {
    const architecture = readJson(
      'runtime/root-architecture/v3/' +
      'sheikha-root-architecture-v3.json'
    );

    expect(architecture.scope).toBe(
      'SHEIKHA_IS_BROADER_THAN_A_SINGLE_PROJECT'
    );

    expect(architecture.status).toBe(
      'ROOT_ARCHITECTURE_ACTIVE'
    );
    expect(
      architecture.hierarchy.some(
        (layer) => layer.id === 'SHEIKHA_LANGUAGE_FOUNDATION'
      )
    ).toBe(true);
    expect(
      architecture.hierarchy.some(
        (layer) => layer.id === 'SHEIKHA_AI_CAPABILITY_ROOTS'
      )
    ).toBe(true);
    expect(
      architecture.truthBoundaries.externalOperatingSystemsAreTools
    ).toBe(true);
    expect(
      architecture.truthBoundaries.universalAiFoundationClaimed
    ).toBe(false);
  });

  test('connects all required root capabilities', () => {
    const graph = readJson(
      'runtime/root-architecture/v3/' +
      'sheikha-root-capability-graph-v3.json'
    );
    const result = verifier.verify(root);

    expect(graph.edges).toContainEqual([
      'LOGIC_GOVERNANCE',
      'SHEIKHA_LANGUAGE_FOUNDATION'
    ]);
    expect(graph.edges).toContainEqual([
      'SHEIKHA_LANGUAGE_FOUNDATION',
      'AI_CAPABILITY_ROOTS'
    ]);
    expect(graph.edges).toContainEqual([
      'UNIFIED_PRODUCT_RUNTIME',
      'GOVERNED_PRODUCTION_FEDERATION'
    ]);
    expect(graph.edges).not.toContainEqual([
      'AI_CAPABILITY_ROOTS',
      'BARE_METAL'
    ]);
    expect(result.status).toBe('VERIFIED');
    expect(result.truthStatus).toBe(
      'BOUNDED_EVIDENCE_VERIFIED_WITH_GAPS'
    );
    expect(result.missing).toEqual([]);
    expect(result.evidenceErrors).toEqual([]);
  });

  test('keeps completion claims fail-closed', () => {
    const result = verifier.verify(root);

    expect(result.allUefiProtocolsImplemented).toBe(false);
    expect(result.allDevicesWorldwideSupported).toBe(false);
    expect(result.physicalHardwareBootVerified).toBe(false);
    expect(result.secureBootVerified).toBe(false);
    expect(result.productionSiteDeployed).toBe(false);
  });

  test('separates registration, artifacts, emulation, and native lifecycle', () => {
    const result = verifier.verify(root);
    const domains = Object.fromEntries(
      result.domains.map((domain) => [domain.id, domain])
    );

    expect(result.evidenceSummary.domainCount).toBe(11);
    expect(result.evidenceSummary.parsedEvidenceCount).toBe(11);
    expect(result.evidenceSummary.artifactBuiltCount).toBeGreaterThanOrEqual(4);
    expect(result.evidenceSummary.qemuVerifiedCount).toBeGreaterThanOrEqual(3);
    expect(result.evidenceSummary.nativeLifecycleVerifiedCount).toBe(1);
    expect(result.evidenceSummary.physicalHardwareVerifiedCount).toBe(0);
    expect(result.evidenceSummary.externallyCertifiedCount).toBe(0);

    expect(
      domains.BARE_METAL_X86_64_PHASE2B.verificationLevel
    ).toBe('QEMU_RUNTIME_VERIFIED_SUBSET');
    expect(
      domains.LINUX_DEB_AMD64.verificationLevel
    ).toBe('NATIVE_LIFECYCLE_VERIFIED');
    expect(
      domains.PHYSICAL_BOOT_TRIAL.verificationLevel
    ).toBe('TRIAL_KIT_READY_PHYSICAL_PENDING');
    expect(
      domains.VSCODE_EXTENSION.verificationLevel
    ).toBe('LIVE_EXTENSION_HOST_INTERACTION_VERIFIED');
    expect(
      domains.VSCODE_EXTENSION.claims.chatInteractionSmokeVerified
    ).toBe(true);
    expect(
      domains.VSCODE_EXTENSION.claims.inspectorInteractionSmokeVerified
    ).toBe(true);
    expect(
      domains.VSCODE_EXTENSION.claims.liveLoadedVersionVerified
    ).toBe(true);
    expect(
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT.verificationLevel
    ).toBe('HOST_BOOTSTRAPPED_LANGUAGE_FOUNDATION_VERIFIED');
    expect(
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT
        .claims.compilerSelfHosted
    ).toBe(false);
    expect(
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT
        .claims.nativeBootContractIdentityVerified
    ).toBe(true);
    expect(
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT
        .claims.universalAiFoundationClaimed
    ).toBe(false);
    expect(
      domains.PRODUCER_PRODUCTION_QUALIFICATION.verificationLevel
    ).toBe('INTERNAL_QUALIFICATION_GATE_ACTIVE');
    expect(
      domains.PRODUCER_PRODUCTION_QUALIFICATION
        .claims.registeredRequirementCount
    ).toBe(31);
    expect(
      domains.PRODUCER_PRODUCTION_QUALIFICATION
        .claims.productionReadyProductCount
    ).toBe(0);
    expect(
      domains.PRODUCER_PRODUCTION_QUALIFICATION
        .claims.productionRuntimeGateReady
    ).toBe(true);
    expect(
      domains.PRODUCER_PRODUCTION_QUALIFICATION
        .claims.governmentLicenseIssuanceAvailable
    ).toBe(false);
    expect(
      domains.PRODUCER_PRODUCTION_QUALIFICATION
        .claims.candidateSensitiveScoringPerformed
    ).toBe(false);
    expect(
      domains.INTELLIGENCE_CAPABILITY_APEX.verificationLevel
    ).toMatch(/^LOCAL_CAPABILITY_ROUTER_/);
    expect(
      domains.INTELLIGENCE_CAPABILITY_APEX.claims.localModelCount
    ).toBe(6);
    expect(
      domains.INTELLIGENCE_CAPABILITY_APEX
        .claims.registeredCapabilityCount
    ).toBe(34);
    expect(
      domains.INTELLIGENCE_CAPABILITY_APEX
        .claims.competitorSuperiorityEstablished
    ).toBe(false);
    expect(
      domains.INTELLIGENCE_CAPABILITY_APEX
        .claims.betterThanAllModelsClaimed
    ).toBe(false);
    expect(
      domains.INTELLIGENCE_CAPABILITY_APEX.claims.githubRequired
    ).toBe(false);
    expect(
      domains.GOVERNED_PRODUCTION_FEDERATION.verificationLevel
    ).toBe(
      'GOVERNED_DUAL_LANE_POLICY_AND_LOCAL_EVIDENCE_VERIFIED'
    );
    expect(
      domains.GOVERNED_PRODUCTION_FEDERATION
        .claims.verifiedInternalCapabilityCount
    ).toBeGreaterThanOrEqual(4);
    expect(
      domains.GOVERNED_PRODUCTION_FEDERATION
        .claims.externalProductionReadyAdapterCount
    ).toBe(0);
    expect(
      domains.GOVERNED_PRODUCTION_FEDERATION
        .claims.externalLaneDefaultDeny
    ).toBe(true);
  });

  test('hashes every evidence input and rejects stale provenance', () => {
    const result = verifier.verify(root);

    for (const domain of result.domains) {
      expect(domain.evidence.parsed).toBe(true);
      expect(domain.evidence.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(domain.evidence.bytes).toBeGreaterThan(0);
    }

    expect(
      result.evidenceSummary.staleProvenanceReferenceCount
    ).toBe(0);
    expect(
      result.staleProvenanceReferences.some(
        (entry) => entry.domain === 'SYSTEM_BUILDER_FABRIC'
      )
    ).toBe(false);
  });

  test('registers UEFI breadth without false implementation', () => {
    const registry = readJson(
      'runtime/uefi-capability-registry/v2/' +
      'sheikha-uefi-capability-registry-v2.json'
    );

    expect(registry.status).toBe(
      'CAPABILITY_REGISTRY_ACTIVE'
    );

    expect(
      registry.implementationPolicy
        .registrationDoesNotMeanImplemented
    ).toBe(true);

    expect(
      registry.completion.allUefiProtocolsImplemented
    ).toBe(false);
  });

  test('serves the bounded evidence matrix through a read-only API', () => {
    const layer = routes.stack.find((entry) =>
      entry.route?.path === '/truth-matrix' &&
      entry.route.methods?.get === true
    );
    const response = createResponse();
    layer.route.stack.at(-1).handle({}, response);

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.evidenceSummary.domainCount).toBe(11);
    expect(
      response.body.data.claimBoundaries
        .registrationDoesNotMeanImplementation
    ).toBe(true);
    expect(
      response.body.data.claimBoundaries.automatedFatwa
    ).toBe(false);
  });
});
