'use strict';

const {
  sdkTargets,
  universalTemplateLibrary,
  resolveTemplateName,
  validateTemplateRequest,
  buildFederationPackage,
  installFederationTemplatePackage,
  buildPersistentRegistrySnapshot,
  buildFederationTemplateEngineReport
} = require('../core/federation-template-engine/sheikha-federation-template-engine-v8');

describe('Sheikha Federation Template Engine V8', () => {
  test('resolves templates from DNA and blueprint type', () => {
    const linuxTemplate = resolveTemplateName({ blueprint: 'Linux' }, { type: 'OPERATING_SYSTEM' });
    const databaseTemplate = resolveTemplateName({ blueprint: 'PostgreSQL' }, { type: 'DATABASE' });
    const aiTemplate = resolveTemplateName({ blueprint: 'AI' }, { type: 'AI' });

    expect(linuxTemplate).toBe('OperatingSystem');
    expect(databaseTemplate).toBe('Database');
    expect(aiTemplate).toBe('AI');
    expect(universalTemplateLibrary.OperatingSystem.fabrics).toContain('kernel-fabric');
  });

  test('generates federation package, OpenAPI, and SDK descriptors from DNA', () => {
    const result = buildFederationPackage({
      name: 'Template PostgreSQL Federation',
      family: 'PostgreSQL Family',
      blueprint: 'PostgreSQL',
      version: '1.0.0'
    });

    expect(result.system).toBe('SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8');
    expect(result.status).toBe('COMMITTED');
    expect(result.package.template.name).toBe('Database');
    expect(result.package.fabrics).toContain('storage-fabric');
    expect(result.package.capabilities).toContain('storage');
    expect(result.openapi.openapi).toBe('3.1.0');
    expect(Object.keys(result.openapi.paths)).toHaveLength(3);
    expect(result.sdkBundle).toHaveLength(sdkTargets.length);
    expect(result.sdkBundle.every((sdk) => sdk.writeScope === 'DESCRIPTOR_ONLY_NO_FILE_WRITE')).toBe(true);
    expect(result.safety.noExternalMutation).toBe(true);
  });

  test('blocks invalid or external mutation DNA', () => {
    const invalid = validateTemplateRequest({
      name: 'Broken Template Federation'
    });
    const blocked = buildFederationPackage({
      name: 'Unsafe Linux Federation',
      family: 'Linux Family',
      blueprint: 'Linux',
      version: '1.0.0',
      serviceRestart: true
    });

    expect(invalid.valid).toBe(false);
    expect(blocked.status).toBe('BLOCKED');
    expect(blocked.validation.errors).toContain('EXTERNAL_CHANGE_FORBIDDEN_IN_TEMPLATE_ENGINE');
  });

  test('persists installed package descriptors in internal snapshot', () => {
    const installed = installFederationTemplatePackage({
      name: 'Template Linux Federation',
      family: 'Linux Family',
      blueprint: 'Linux',
      version: '1.0.0'
    });
    const snapshot = buildPersistentRegistrySnapshot();
    const report = buildFederationTemplateEngineReport();

    expect(installed.status).toBe('COMMITTED');
    expect(snapshot.system).toBe('SHEIKHA_FEDERATION_TEMPLATE_PERSISTENT_REGISTRY_V8');
    expect(snapshot.summary.records).toBeGreaterThanOrEqual(1);
    expect(snapshot.safety.noGeneratedFilesWritten).toBe(true);
    expect(report.status).toBe('ACTIVE');
    expect(report.governance.externalSystemWriteAllowed).toBe(false);
  });
});
