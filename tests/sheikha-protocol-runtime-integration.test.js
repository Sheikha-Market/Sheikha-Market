'use strict';

const { runSheikhaProtocol } = require('../runtime/protocols/sheikha-protocol/sheikha-protocol');

describe('Sheikha Protocol Runtime Integration', () => {
  test('approves safe runtime action', () => {
    const result = runSheikhaProtocol({
      actor: 'runtime',
      action: 'health_check',
      target: 'universal_api'
    });

    expect(result.protocol).toBe('SHEIKHA_PROTOCOL_V1');
    expect(result.governance.allowed).toBe(true);
    expect(result.decision.decision).toBe('approved');
    expect(result.status).toBe('READY_TO_EXECUTE');
  });

  test('blocks dangerous action', () => {
    const result = runSheikhaProtocol({
      actor: 'unknown',
      action: 'disable_governance',
      target: 'runtime'
    });

    expect(result.governance.allowed).toBe(false);
    expect(result.decision.decision).toBe('rejected');
    expect(result.status).toBe('BLOCKED');
  });
});
