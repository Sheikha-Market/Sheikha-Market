'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const http = require('node:http');
const integration = require('../runtime/repository-integration/v1/sheikha-repository-integration-v1');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');

describe('Registered repository integration', () => {
  let root;
  let registryFile;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-repository-test-'));
    execFileSync('/usr/bin/git', ['init', '-q', root], { stdio: 'ignore' });
    registryFile = path.join(root, 'registry.json');
    fs.writeFileSync(registryFile, JSON.stringify({ schemaVersion: 1, repositories: [{ id: 'test-repo', root: '.' }] }));
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ engines: { node: '^22' },
      scripts: { postinstall: 'THIS_SCRIPT_MUST_NOT_RUN' } }));
    fs.writeFileSync(path.join(root, 'package-lock.json'), '{}');
    fs.writeFileSync(path.join(root, '.env'), 'PRIVATE_SENTINEL=DO_NOT_DISCLOSE_THIS');
  });
  afterEach(() => { jest.restoreAllMocks(); fs.rmSync(root, { recursive: true, force: true }); });
  const options = () => ({ workspaceRoot: root, registryFile });

  test('reads registered sources without exposing environment, paths or executing project code', () => {
    const configBefore = fs.readFileSync(path.join(root, '.git/config'));
    const result = integration.inspectIntegrations(options());
    expect(result.registeredCount).toBe(1);
    expect(result.status).toBe('REGISTERED_LOCAL_REPOSITORIES_INSPECTED');
    expect(result.repositories[0].git.headSha).toBeNull();
    expect(result.repositories[0].git.clean).toBe(false);
    expect(result.repositories[0].nodeProject.declaredEngine).toBe('^22');
    expect(result.repositories[0].nodeProject.scriptsExecuted).toBe(false);
    expect(result.tools.sheikhaDocker.daemonContacted).toBe(false);
    expect(JSON.stringify(result)).not.toContain('DO_NOT_DISCLOSE_THIS');
    expect(JSON.stringify(result)).not.toContain(root);
    expect(JSON.stringify(result)).not.toContain('THIS_SCRIPT_MUST_NOT_RUN');
    expect(fs.readFileSync(path.join(root, '.git/config'))).toEqual(configBefore);
    expect(fs.existsSync(path.join(root, '.git/index'))).toBe(false);
    expect(fs.existsSync(path.join(root, '.git/index.lock'))).toBe(false);
  });

  test('hashes source bytes, not a claimed hash or runtime readiness', () => {
    const result = integration.inspectIntegrations(options());
    const component = result.repositories[0].components.find(item => item.id === 'SHEIKHA_NODE');
    expect(component.state).toBe('SOURCES_PRESENT_NOT_RUNTIME_PROOF');
    expect(component.runtimeVerified).toBe(false);
    expect(component.evidence[0].sha256).toBe(crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(root, 'package.json'))).digest('hex'));
    expect(result.commercialProductionReady).toBe(false);
  });

  test('supports multiple registered repositories and preserves unavailable entries', () => {
    const second = path.join(root, 'second');
    execFileSync('/usr/bin/git', ['init', '-q', '--bare', second], { stdio: 'ignore' });
    fs.writeFileSync(registryFile, JSON.stringify({ schemaVersion: 1, repositories: [
      { id: 'first', root: '.' }, { id: 'second', root: 'second' }, { id: 'missing', root: 'absent' }
    ] }));
    const result = integration.inspectIntegrations(options());
    expect(result.status).toBe('REGISTERED_REPOSITORIES_INCOMPLETE');
    expect(result.repositories[1].git.bare).toBe(true);
    expect(result.repositories[1].git.clean).toBeNull();
    expect(result.repositories[2].state).toBe('UNAVAILABLE');
  });

  test('does not mistake an unregistered subdirectory for the parent repository', () => {
    fs.mkdirSync(path.join(root, 'subdir'));
    expect(integration.inspectRepository({ id: 'nested', root: 'subdir' }, root).state).toBe('UNAVAILABLE');
  });

  test('rejects duplicate IDs and command-shaped IDs', () => {
    for (const repositories of [
      [{ id: 'same', root: '.' }, { id: 'same', root: '.' }],
      [{ id: 'bad;echo-private', root: '.' }],
      [{ id: 'valid', root: 'x\0y' }]
    ]) {
      fs.writeFileSync(registryFile, JSON.stringify({ schemaVersion: 1, repositories }));
      expect(() => integration.loadRegistry(registryFile)).toThrow('INVALID_REPOSITORY_REGISTRY');
    }
  });

  test('rejects source symlinks and FIFOs without following or blocking', () => {
    fs.unlinkSync(path.join(root, 'package.json'));
    fs.symlinkSync(path.join(root, '.env'), path.join(root, 'package.json'));
    let result = integration.inspectIntegrations(options());
    expect(result.repositories[0].nodeProject).toBeNull();
    expect(result.repositories[0].components.find(item => item.id === 'SHEIKHA_NODE').state).toBe('SOURCES_INCOMPLETE');
    fs.unlinkSync(path.join(root, 'package.json'));
    execFileSync('/usr/bin/mkfifo', [path.join(root, 'package.json')]);
    result = integration.inspectIntegrations(options());
    expect(result.repositories[0].nodeProject).toBeNull();
  });

  test('parses NUL-delimited status including renames and conflicts without leaking names', () => {
    const counts = integration.worktreeCounts('R  new\0old\0 M edit\0?? folder/\0UU conflict\0');
    expect(counts).toEqual({ changedEntries: 4, staged: 2, unstaged: 2, untrackedEntries: 1, conflicts: 1 });
  });

  test('rejects oversized registry and source files', () => {
    fs.writeFileSync(path.join(root, 'package.json'), ' '.repeat(5 * 1024 * 1024 + 1));
    expect(integration.inspectIntegrations(options()).repositories[0].components
      .find(item => item.id === 'SHEIKHA_NODE').state).toBe('SOURCES_INCOMPLETE');
    fs.writeFileSync(registryFile, ' '.repeat(64 * 1024 + 1));
    expect(() => integration.loadRegistry(registryFile)).toThrow('SOURCE_UNSUPPORTED');
  });

  test('SDK uses authenticated existing transport for integration and Visual checks', async () => {
    const calls = [];
    const client = createSheikhaApiClient({ baseUrl: 'http://127.0.0.1:8080', token: 'test-only',
      fetchImpl: async (...args) => { calls.push(args); return { ok: true, json: async () => ({ success: true }) }; } });
    await client.repositoryIntegrations.status();
    await client.repositoryIntegrations.visualHealth();
    expect(calls.map(item => item[0])).toEqual([
      'http://127.0.0.1:8080/api/sheikha/model-hub/v1/integrations/status',
      'http://127.0.0.1:8080/api/sheikha/model-hub/v1/integrations/visual-health'
    ]);
    expect(calls.every(item => item[1].headers.Authorization === 'Bearer test-only')).toBe(true);
  });

  test.each([200, 302, 500])('Visual probe checks contract and refuses redirects: %s', async code => {
    jest.spyOn(http, 'get').mockImplementation((settings, receive) => {
      expect(settings.hostname).toBe('127.0.0.1'); expect(settings.port).toBe(8093);
      const req = new EventEmitter(); req.destroy = () => {};
      process.nextTick(() => {
        const response = new EventEmitter(); response.statusCode = code;
        response.headers = { 'content-type': 'application/json' }; response.destroy = () => {};
        receive(response);
        if (code === 200) {
          response.emit('data', Buffer.from(JSON.stringify({ system: 'SHEIKHA_DRAWING_MOTION_SPATIAL_FABRIC_V2',
            status: 'ACTIVE_GOVERNED_DRAWING_MOTION_LAYER', supportedDimensions: ['2D', '3D'] })));
          response.emit('end');
        }
      });
      return req;
    });
    const result = await integration.probeVisualRuntime();
    expect(result.contractVerified).toBe(code === 200);
    expect(result.renderedOutputVerified).toBe(false);
  });

  test.each(['invalid-json', 'wrong-contract', 'oversized', 'wrong-type', 'aborted'])(
    'Visual probe fails closed for %s', async scenario => {
      jest.spyOn(http, 'get').mockImplementation((_settings, receive) => {
        const req = new EventEmitter(); req.destroy = () => {};
        process.nextTick(() => {
          const response = new EventEmitter(); response.statusCode = 200; response.destroy = () => {};
          response.headers = { 'content-type': scenario === 'wrong-type' ? 'text/html' : 'application/json' };
          receive(response);
          if (scenario === 'wrong-type') return;
          if (scenario === 'aborted') { response.emit('aborted'); return; }
          const body = scenario === 'oversized' ? 'x'.repeat(32769) : scenario === 'invalid-json' ? '[' : '{}';
          response.emit('data', Buffer.from(body)); response.emit('end');
        });
        return req;
      });
      expect((await integration.probeVisualRuntime()).contractVerified).toBe(false);
    });

  test('Visual probe times out and closes a stalled connection', async () => {
    jest.useFakeTimers();
    try {
      const req = new EventEmitter(); req.destroy = jest.fn();
      jest.spyOn(http, 'get').mockReturnValue(req);
      const result = integration.probeVisualRuntime();
      jest.advanceTimersByTime(1500);
      expect((await result).contractVerified).toBe(false);
      expect(req.destroy).toHaveBeenCalledTimes(1);
    } finally { jest.useRealTimers(); }
  });
});
