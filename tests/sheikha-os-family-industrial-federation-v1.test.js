'use strict';

const {
  inspectOsFamilyIndustrialFederation
} = require('../core/os-family-industrial-federation/sheikha-os-family-industrial-federation-v1');

describe('Sheikha OS Family Industrial Federation Fabric V1', () => {
  test('maps every OS family as industrial clusters with safe integration', () => {
    const report = inspectOsFamilyIndustrialFederation();
    const ids = report.families.map((family) => family.id);

    expect(report.system).toBe('SHEIKHA_OS_FAMILY_INDUSTRIAL_FEDERATION_FABRIC_V1');
    expect(report.mode).toBe('READ_ONLY_OS_FAMILY_CLUSTER_MAPPING');
    expect(report.safety.noHarm).toBe(true);
    expect(ids).toContain('linux-industrial-family');
    expect(ids).toContain('windows-industrial-family');
    expect(ids).toContain('apple-industrial-family');
    expect(ids).toContain('bsd-industrial-family');
    expect(ids).toContain('container-industrial-family');
    expect(ids).toContain('virtualization-industrial-family');
    expect(report.relations.length).toBeGreaterThanOrEqual(8);
  });
});
