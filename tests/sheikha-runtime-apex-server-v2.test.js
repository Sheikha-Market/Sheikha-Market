'use strict';

const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha Runtime Apex server V2 convergence', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../runtime/sheikha-apex-v1/server.js'),
    'utf8',
  );

  test('serves V2 as authoritative while preserving legacy routes', () => {
    expect(source).toContain("system: 'SHEIKHA_RUNTIME_APEX_V2'");
    expect(source).toContain("authoritativeRuntime: 'SHEIKHA_RUNTIME_APEX_V2'");
    expect(source).toContain("u.pathname === '/api/apex/status' || u.pathname === '/api/apex/v2/status'");
    expect(source).toContain('buildRuntimeApexStatus().tpm');
    expect(source).toContain("u.pathname === '/api/apex/trust-state' || u.pathname === '/api/apex/v2/trust-state'");
    expect(source).toContain("source: 'CONTENT_ADDRESSED_LOCAL_EVIDENCE'");
    expect(source).toContain("incompatibilityReason: 'V2_QUOTE_CONTRACT_BOUND_TO_PREVIOUS_AK_GENERATION'");
    expect(source).toContain('currentDeviceIdentityV3');
    expect(source).toContain("u.pathname === '/api/apex/visual-intelligence'");
    expect(source).toContain("u.pathname === '/api/apex/visual-intelligence/review'");
    expect(source).toContain('evaluateNonLivingDrawingRequest');
    expect(source).toContain("u.pathname === '/api/apex/visual-fabric/plan'");
    expect(source).toContain('planGovernedVisualScene');
    expect(source).toContain("u.pathname === '/api/apex/visual-fabric/v2'");
    expect(source).toContain("u.pathname === '/api/apex/possibility/plan'");
    expect(source).not.toContain("console.log('SHEIKHA_RUNTIME_APEX_V1_READY=true')");
  });
});
