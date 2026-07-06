const {
  loadSheikhaVSCodeProtocol,
  verifySheikhaVSCodeProtocol
} = require('../../runtime/sheikha-vscode-protocol/sheikha-vscode-protocol-runtime');

describe('Sheikha VSCode Protocol V1', () => {
  test('loads active protocol and language contract', () => {
    const protocol = loadSheikhaVSCodeProtocol();

    expect(protocol.status).toBe('ACTIVE');
    expect(protocol.language.id).toBe('sheikha-vscode');
    expect(protocol.language.fileExtensions).toContain('.sheikha');
    expect(protocol.governance.defaultMode).toBe('READ_ONLY_SAFE_BY_DEFAULT');
  });

  test('verifies protocol channels', () => {
    const result = verifySheikhaVSCodeProtocol();

    expect(result.status).toBe('PASSED');
    expect(result.missingChannels.length).toBe(0);
  });
});
