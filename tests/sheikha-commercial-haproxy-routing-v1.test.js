const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha commercial HAProxy routing V1', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'config', 'haproxy.cfg'),
    'utf8'
  );

  test('routes exact live chat path before the general API backend', () => {
    const chatRoute = 'use_backend commercial_chat_backend if is_commercial_chat';
    expect(source).toContain('acl is_commercial_chat path -i /api/sheikha/live/chat/v1');
    expect(source).toContain(chatRoute);
    expect(source.indexOf(chatRoute)).toBeLessThan(
      source.indexOf('use_backend api_backend if is_api')
    );
    expect(source).toContain('server commercial_chat 127.0.0.1:8083');
  });

  test('keeps the statistics endpoint local and read-only', () => {
    expect(source).toContain('bind 127.0.0.1:8404');
    expect(source).not.toContain('stats admin if TRUE');
  });
});
