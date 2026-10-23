const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha runtime input bounds V1', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'server.js'),
    'utf8'
  );

  test('bounds global JSON and form bodies', () => {
    expect(source).toContain("SHEIKHA_HTTP_BODY_LIMIT || '1mb'");
    expect(source).toContain(
      'express.json({ limit: SHEIKHA_HTTP_BODY_LIMIT })'
    );
    expect(source).toContain('parameterLimit: 1000');
    expect(source).not.toContain('app.use(express.json());');
  });

  test('bounds websocket payloads and concurrent clients', () => {
    expect(source).toContain('SHEIKHA_WS_MAX_PAYLOAD_BYTES || 64 * 1024');
    expect(source).toContain('maxPayload: SHEIKHA_WS_MAX_PAYLOAD_BYTES');
    expect(source).toContain('perMessageDeflate: false');
    expect(source).toContain('clients.length >= SHEIKHA_WS_MAX_CLIENTS');
    expect(source).toContain("ws.close(1013, 'Server capacity reached')");
  });
});
