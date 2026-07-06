'use strict';

const {
  resolveTemplate,
  applyTemplateToDna
} = require('../core/universal-template-engine/sheikha-universal-template-engine-v8');

describe('Sheikha Universal Template Engine V8', () => {
  test('resolves PostgreSQL template', () => {
    const template = resolveTemplate('PostgreSQL');
    expect(template).not.toBeNull();
    expect(template.capabilities).toContain('storage');
  });

  test('expands federation through template safely', () => {
    const report = applyTemplateToDna({
      name: 'Template PostgreSQL Federation',
      family: 'PostgreSQL Family',
      blueprint: 'PostgreSQL',
      version: '1.0.0'
    });

    expect(report.system).toBe('SHEIKHA_UNIVERSAL_TEMPLATE_ENGINE_V8');
    expect(report.status).toBe('COMMITTED');
    expect(report.safety.noHarm).toBe(true);
    expect(report.dna.templateVersion).toBe('1.0.0');
  });

  test('blocks unknown template', () => {
    const report = applyTemplateToDna({
      name: 'Unknown Federation',
      family: 'Unknown Family',
      blueprint: 'Unknown',
      version: '1.0.0'
    });

    expect(report.status).toBe('BLOCKED');
    expect(report.error).toBe('TEMPLATE_NOT_FOUND');
  });
});
