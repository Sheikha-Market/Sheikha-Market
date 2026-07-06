'use strict';

const {
  inspectFederationClosure
} = require('../core/federation-closure/sheikha-federation-of-federations-closure-v1');

describe('Sheikha Federation of Federations Closure V1', () => {
  test('closes federation hierarchy safely from L16 to L23', () => {
    const report = inspectFederationClosure();
    const layerIds = report.closureLayers.map((layer) => layer.id);
    const familyIds = report.federationFamilies.map((family) => family.id);

    expect(report.system).toBe('SHEIKHA_FEDERATION_OF_FEDERATIONS_CLOSURE_V1');
    expect(report.mode).toBe('READ_ONLY_FEDERATION_CLOSURE_MAPPING');
    expect(report.safety.noHarm).toBe(true);
    expect(report.safety.noExternalMutation).toBe(true);
    expect(layerIds).toContain('l16-federation-of-federations');
    expect(layerIds).toContain('l23-global-integration-federation');
    expect(familyIds).toContain('linux-federation');
    expect(familyIds).toContain('windows-federation');
    expect(familyIds).toContain('apple-federation');
    expect(familyIds).toContain('ai-system-federation');
    expect(report.closure.architectureClosed).toBe(true);
  });
});
