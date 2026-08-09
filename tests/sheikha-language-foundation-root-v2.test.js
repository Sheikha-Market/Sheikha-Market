'use strict';

const express = require('express');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');

const languageRegistry = require(
  '../sheikha-language/compiler/language-registry'
);
const {
  REQUIRED_ENTITIES,
  REQUIRED_MARKERS,
  compileFoundation,
  buildFoundationStatus
} = require(
  '../runtime/sheikha-language-foundation/v2/' +
  'sheikha-language-foundation-root-v2'
);
const routes = require(
  '../routes/language-foundation/' +
  'sheikha-language-foundation-root-v2-routes'
);

const root = path.resolve(__dirname, '..');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

describe('Sheikha Language Foundation Root V2', () => {
  test('compiles the canonical Sheikha root through the governed VM', () => {
    const compiled = compileFoundation();
    const entityNames = compiled.ast.body
      .filter((node) => node.type === 'EntityDeclaration')
      .map((node) => node.name);

    expect(compiled.sourceProgram.sourceLanguage).toBe('sheikha');
    expect(compiled.sourceProgram.sourceKind).toBe('shk');
    expect(compiled.types.ok).toBe(true);
    expect(compiled.bytecode.instructions.length).toBeGreaterThan(0);
    expect(compiled.run.ok).toBe(true);
    expect(compiled.run.state.governance.violations).toEqual([]);
    expect(entityNames).toEqual(
      expect.arrayContaining(REQUIRED_ENTITIES)
    );
    for (const marker of REQUIRED_MARKERS) {
      expect(
        compiled.run.state.output.some((line) =>
          line.includes(marker)
        )
      ).toBe(true);
    }
  });

  test('binds the hosted language root to truthful native evidence', () => {
    const status = buildFoundationStatus({
      generatedAt: '2026-07-27T00:00:00.000Z'
    });

    expect(status.status).toBe(
      'FOUNDATION_ACTIVE_HOST_BOOTSTRAPPED_NATIVE_MIGRATION_REQUIRED'
    );
    expect(status.passed).toBe(true);
    expect(status.failedChecks).toEqual([]);
    expect(status.nativeStack.bareMetal.qemuBootVerified).toBe(true);
    expect(
      status.nativeStack.languageBinding
        .contractIdentityEmbeddedInNativeArtifact
    ).toBe(true);
    expect(
      status.nativeStack.languageBinding
        .sheikhaSourceFingerprintEmbeddedInNativeArtifact
    ).toBe(false);
    expect(
      status.nativeStack.languageBinding.bytecodeExecutedInsideKernel
    ).toBe(false);
    expect(status.nativeStack.uefi.fullyImplementedCapabilities).toBe(0);
    expect(status.nativeStack.qemu.foundation).toBe(false);
  });

  test('matches the declared provenance to the exact evidence bytes', () => {
    const report = JSON.parse(fs.readFileSync(
      path.join(
        root,
        'runtime/sheikha-language-foundation/v2/' +
        'sheikha-language-foundation-root-v2-report.json'
      ),
      'utf8'
    ));
    const source = fs.readFileSync(
      path.join(root, report.identity.sourcePath)
    );
    const bytecode = fs.readFileSync(
      path.join(root, report.evidence.bytecode)
    );

    expect(sha256(source)).toBe(report.identity.sourceSha256);
    expect(sha256(bytecode)).toBe(report.identity.bytecodeSha256);
  });

  test('keeps AI roots governed and outside the critical boot path', () => {
    const status = buildFoundationStatus();
    const roots = status.aiCapabilityRoots.roots;

    expect(roots).toHaveLength(8);
    expect(
      roots.every((root) =>
        root.criticalBootPath === false &&
        root.independentHighImpactExecution === false &&
        root.humanFinalAuthority === true
      )
    ).toBe(true);
    expect(
      status.aiCapabilityRoots.everyAiSystemInUniverseIntegrated
    ).toBe(false);
    expect(status.governance.aiIsReligiousAuthority).toBe(false);
    expect(status.governance.automatedFatwaAllowed).toBe(false);
  });

  test('uses external operating systems as tools, not foundations', () => {
    const status = buildFoundationStatus();
    const adapters = status.systemToolAdapters.adapters;

    expect(adapters.map((adapter) => adapter.id)).toEqual([
      'LINUX_HOST_ADAPTER',
      'WINDOWS_HOST_ADAPTER',
      'MACOS_HOST_ADAPTER'
    ]);
    expect(
      adapters.every((adapter) =>
        adapter.foundation === false &&
        adapter.mayReplaceSheikhaFoundation === false
      )
    ).toBe(true);
    expect(adapters[0].nativeVerification).toBe(true);
    expect(adapters[1].nativeVerification).toBe(false);
    expect(adapters[2].nativeVerification).toBe(false);
  });

  test('publishes honest language registry roles', () => {
    const sheikha = languageRegistry.getLanguageProfile('sheikha');
    const javascript =
      languageRegistry.getLanguageProfile('javascript');

    expect(sheikha.role).toBe('first-party-foundation-language');
    expect(sheikha.foundation).toBe(true);
    expect(sheikha.runtime).toBe('hosted-bytecode-vm');
    expect(sheikha.selfHostedCompiler).toBe(false);
    expect(javascript.role).toBe('tool-adapter');
    expect(javascript.foundation).toBe(false);
  });

  test('serves status, AI roots, adapters, and native stack read-only', async () => {
    const app = express();
    app.use('/api/sheikha/language-foundation/v2', routes);

    const [status, roots, adapters, native] = await Promise.all([
      request(app).get('/api/sheikha/language-foundation/v2/status'),
      request(app).get('/api/sheikha/language-foundation/v2/ai-roots'),
      request(app).get(
        '/api/sheikha/language-foundation/v2/system-adapters'
      ),
      request(app).get(
        '/api/sheikha/language-foundation/v2/native-stack'
      )
    ]);

    expect(status.status).toBe(200);
    expect(status.body.data.passed).toBe(true);
    expect(roots.body.data.aiCapabilityRoots.count).toBe(8);
    expect(
      adapters.body.data.systemToolAdapters.adapters
    ).toHaveLength(3);
    expect(
      native.body.data.nativeStack.languageBinding
        .bytecodeExecutedInsideKernel
    ).toBe(false);
  });
});
