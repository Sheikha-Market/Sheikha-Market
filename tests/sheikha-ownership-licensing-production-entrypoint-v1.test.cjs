'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const serverFile = path.join(root, 'server.js');
const routeFile = path.join(
  root,
  'routes',
  'ownership-licensing',
  'sheikha-ownership-licensing-routes.cjs'
);

const serverSource = fs.readFileSync(serverFile, 'utf8');

test('production entrypoint mounts ownership licensing routes', () => {
  const appInitialization =
    serverSource.indexOf('const app = express();');

  const marker =
    serverSource.indexOf(
      'SHEIKHA_OWNERSHIP_LICENSING_PRODUCTION_ENTRYPOINT_V1'
    );

  const moduleReference =
    serverSource.indexOf(
      './routes/ownership-licensing/' +
      "' +\n  '" +
      'sheikha-ownership-licensing-routes.cjs'
    );

  const mountPath =
    serverSource.indexOf(
      "'/api/sheikha/ownership-licensing/v1'"
    );

  const appListenCandidates = [
    serverSource.indexOf('app.listen('),
    serverSource.indexOf('server.listen('),
  ].filter((index) => index >= 0);

  assert.ok(appInitialization >= 0);
  assert.ok(marker > appInitialization);
  assert.ok(moduleReference > marker);
  assert.ok(mountPath > moduleReference);
  assert.ok(fs.existsSync(routeFile));

  if (appListenCandidates.length > 0) {
    assert.ok(mountPath < Math.min(...appListenCandidates));
  }
});

test('production entrypoint mount is unique and read-only route exists', () => {
  const markerMatches = serverSource.match(
    /SHEIKHA_OWNERSHIP_LICENSING_PRODUCTION_ENTRYPOINT_V1/g
  ) || [];

  const mountMatches = serverSource.match(
    /\/api\/sheikha\/ownership-licensing\/v1/g
  ) || [];

  assert.equal(markerMatches.length, 1);
  assert.equal(mountMatches.length, 1);

  const router = require(routeFile);

  assert.equal(typeof router, 'function');
});
