'use strict';

const {
  buildTemplateMapping,
  buildTemplateEngineUnificationReport,
  getTemplateEngineUnificationStatus,
  unifyTemplateExpansion
} = require('../core/template-engine-unification/sheikha-template-engine-unification-v11');

describe('Sheikha Template Engine Unification V11', () => {
  test('maps compatibility templates to the canonical federation template engine', () => {
    const mapping = buildTemplateMapping();

    expect(mapping).toHaveLength(4);
    expect(mapping.every((item) => item.status === 'MAPPED')).toBe(true);
    expect(mapping.map((item) => item.canonicalName)).toEqual(expect.arrayContaining([
      'OperatingSystem',
      'Database',
      'Language',
      'AI'
    ]));
  });

  test('activates canonical engine, compatibility layer, and governed platform together', () => {
    const report = buildTemplateEngineUnificationReport();

    expect(report.system).toBe('SHEIKHA_TEMPLATE_ENGINE_UNIFICATION_V11');
    expect(report.status).toBe('ACTIVE');
    expect(report.canonicalEngine.status).toBe('ACTIVE');
    expect(report.canonicalEngine.templates).toBeGreaterThanOrEqual(11);
    expect(report.compatibilityEngine.status).toBe('ACTIVE');
    expect(report.compatibilityEngine.templates).toBe(4);
    expect(report.platform.status).toBe('ACTIVE_100');
    expect(report.governance.canonicalSourceOfTruth).toBe('SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8');
    expect(report.governance.noExternalMutation).toBe(true);
  });

  test('produces unified expansion with OpenAPI and descriptor-only SDK targets', () => {
    const result = unifyTemplateExpansion();

    expect(result.system).toBe('SHEIKHA_TEMPLATE_ENGINE_UNIFIED_EXPANSION_V11');
    expect(result.status).toBe('COMMITTED');
    expect(result.compatibility.status).toBe('COMMITTED');
    expect(result.canonical.status).toBe('COMMITTED');
    expect(result.canonical.templateName).toBe('Database');
    expect(result.canonical.openapi).toBe('3.1.0');
    expect(result.canonical.sdkTargets).toEqual(expect.arrayContaining([
      'javascript',
      'python',
      'go',
      'rust',
      'java',
      'php',
      'csharp'
    ]));
    expect(result.unification.noExternalMutation).toBe(true);
    expect(result.safety.noHarm).toBe(true);
  });

  test('exposes compact status for routes and inspectors', () => {
    const status = getTemplateEngineUnificationStatus();

    expect(status.system).toBe('SHEIKHA_TEMPLATE_ENGINE_UNIFICATION_V11');
    expect(status.status).toBe('ACTIVE');
    expect(status.mapped).toBe(status.mappings);
    expect(status.governedPlatform).toBe('ACTIVE_100');
    expect(status.governance.compatibilityLayerPreserved).toBe(true);
  });
});
