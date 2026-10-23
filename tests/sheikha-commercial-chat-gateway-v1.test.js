const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha commercial chat gateway V1', () => {
  const root = path.join(__dirname, '..', 'commercial-runtime', 'chat-gateway');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  const source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');

  test('has no third-party runtime dependencies', () => {
    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.devDependencies).toBeUndefined();
    expect(source).not.toMatch(/require\(['"](express|ws|uuid|@google-cloud)/);
  });

  test('allows only health and governed chat routes', () => {
    expect(source).toContain("req.url === '/health'");
    expect(source).toContain("req.url === '/api/sheikha/live/chat/v1'");
    expect(source).toContain("error: 'ROUTE_NOT_ALLOWED'");
    expect(source).toContain("server.on('upgrade'");
  });

  test('bounds payload, message, rate, and upstream time', () => {
    expect(source).toContain('64 * 1024');
    expect(source).toContain('parsed.message.length > 16_000');
    expect(source).toContain("error: 'RATE_LIMITED'");
    expect(source).toContain('timeout: 95_000');
    expect(source).toContain("req.headers['x-forwarded-for']");
    expect(source).toContain(".split(',')[0]");
  });
});
