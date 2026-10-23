const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha commercial nginx routing V1', () => {
  const root = path.join(__dirname, '..', 'deploy', 'nginx', 'live');
  const site = fs.readFileSync(path.join(root, 'sheikha'), 'utf8');
  const api = fs.readFileSync(path.join(root, 'api.sheikha.top'), 'utf8');

  test('routes exact chat locations to the isolated gateway', () => {
    expect((site.match(/location = \/api\/sheikha\/live\/chat\/v1/g) || []).length)
      .toBe(2);
    expect(api).toContain('location = /api/sheikha/live/chat/v1');
    expect(`${site}\n${api}`).toContain('proxy_pass http://127.0.0.1:8083');
  });

  test('overwrites forwarded identity at the trusted proxy boundary', () => {
    const locations = `${site}\n${api}`.split(
      'location = /api/sheikha/live/chat/v1'
    ).slice(1);
    expect(locations).toHaveLength(3);
    locations.forEach((location) => {
      const block = location.split('location /')[0];
      expect(block).toContain('proxy_set_header X-Forwarded-For $remote_addr;');
      expect(block).not.toContain('$proxy_add_x_forwarded_for');
    });
  });
});
