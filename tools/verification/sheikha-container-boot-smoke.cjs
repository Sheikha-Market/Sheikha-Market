'use strict';

// Run through stdin inside a disposable --network=none container, not on the host.
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { randomBytes, createHash } = require('node:crypto');
const http = require('node:http');
const assert = require('node:assert/strict');

async function main() {
    if (process.cwd() !== '/app' || !(fs.existsSync('/run/.containerenv') || fs.existsSync('/.dockerenv'))) {
        throw new Error('DISPOSABLE_CONTAINER_REQUIRED');
    }
    const allEngines = process.env.SHEIKHA_SMOKE_ALL_ENGINES || 'true';
    if (!['true', 'false'].includes(allEngines)) throw new Error('INVALID_SMOKE_MODE');
    const report = { schema: 'SHEIKHA_CONTAINER_BOOT_SMOKE_V1', status: 'FAIL', checks: [],
        allEngines, localOnly: true, productionReady: false };
    const manifest = JSON.parse(fs.readFileSync('SHEIKHA-CLOUD-CONTEXT-MANIFEST.json', 'utf8'));
    for (const row of manifest.source_snapshot) {
        if (row.path.startsWith('/') || row.path.split('/').includes('..')) throw new Error('MANIFEST_PATH_REFUSED');
        const bytes = fs.readFileSync(row.path);
        if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw new Error('CONTAINER_SNAPSHOT_MISMATCH');
    }
    report.snapshot = { files: manifest.source_snapshot.length, sha256: manifest.report.inventory_sha256 };
    const jwtSecret = randomBytes(48).toString('hex');
    const jwt = require('/app/node_modules/jsonwebtoken');
    const adminToken = jwt.sign({ id: 'container-smoke-only', role: 'admin' }, jwtSecret,
        { algorithm: 'HS256', expiresIn: '5m' });
    const child = spawn(process.execPath, ['server.js'], {
        env: { ...process.env, NODE_ENV: 'production', PORT: '8080', HOST: '127.0.0.1',
            JWT_SECRET: jwtSecret, DATA_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
            SESSION_SECRET: randomBytes(32).toString('hex'),
            PASSWORD_SALT: randomBytes(32).toString('hex'), SHEIKHA_ENABLE_ALL_ENGINES: allEngines,
            SHEIKHA_LOCALMIND_BOOT: 'false', SHEIKHA_ENABLE_CRON: 'false', SHEIKHA_ENABLE_TEST_ACCOUNTS: 'true',
            SHEIKHA_TEST_CUSTOMER_PASSWORD: randomBytes(24).toString('hex'),
            SHEIKHA_TEST_TRADER_PASSWORD: randomBytes(24).toString('hex') },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let exited = false;
    const exit = new Promise(resolve => {
        child.once('error', () => { exited = true; report.serverSpawnFailed = true; resolve(); });
        child.once('exit', (code, signal) => {
            exited = true; report.serverExitCode = code; report.serverSignal = signal; resolve();
        });
    });
    const missing = new Set();
    for (const stream of [child.stdout, child.stderr]) {
        stream.on('data', chunk => {
            for (const match of chunk.toString().matchAll(/Cannot find module ['"]([^'"\r\n]{1,250})['"]/g)) missing.add(match[1]);
        });
    }
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    function get(path, method = 'GET', authenticated = false, input) {
        return new Promise((resolve, reject) => {
            const headers = authenticated ? { Authorization: 'Bearer ' + adminToken } : {};
            const requestBody = input === undefined ? undefined : JSON.stringify(input);
            if (requestBody !== undefined) {
                headers['Content-Type'] = 'application/json';
                headers['Content-Length'] = Buffer.byteLength(requestBody);
            }
            const request = http.request({ hostname: '127.0.0.1', port: 8080, path, method, headers, timeout: 2000 }, response => {
                let bytes = 0, body = '';
                response.on('data', chunk => {
                    bytes += chunk.length;
                    if (bytes > 1024 * 1024) response.destroy(new Error('BODY_LIMIT'));
                    else body += chunk;
                });
                response.once('error', reject);
                response.once('end', () => resolve({ status: response.statusCode, body, headers: response.headers }));
            });
            request.once('timeout', () => request.destroy(new Error('TIMEOUT')));
            request.once('error', reject);
            request.end(requestBody);
        });
    }
    async function check(path, expected, { method = 'GET', authenticated = false, input, validate } = {}) {
        const result = await get(path, method, authenticated, input);
        const row = { path, method, authenticated, status: result.status, expected, passed: false };
        report.checks.push(row);
        assert.equal(result.status, expected);
        const payload = JSON.parse(result.body);
        if (expected < 300) assert.equal(payload.success, true);
        if (validate) validate(payload, result.headers);
        row.passed = true;
        return payload;
    }
    try {
        let healthy = false;
        const deadline = Date.now() + 45000;
        while (!exited && Date.now() < deadline) {
            try {
                const result = await get('/api/health');
                if (result.status === 200) {
                    const health = JSON.parse(result.body);
                    if (health.success !== true || health.data?.status !== 'ok') throw new Error('INVALID_HEALTH_PAYLOAD');
                    report.checks.push({ path: '/api/health', status: 200, healthStatus: health.data.status, passed: true });
                    healthy = true;
                    break;
                }
            } catch {}
            await sleep(500);
        }
        if (!healthy) throw new Error('HEALTH_CHECK_FAILED');
        const optionalChecks = allEngines === 'true' ? [
            ...['status', 'evidence', 'cycle', 'experiments', 'curriculum']
                .map(suffix => ['/api/research/agi-asi-science-fabric/' + suffix, 200]),
            ...['status', 'units', 'topology', 'sdk-fabric-mcp-map', 'coverage']
                .map(suffix => ['/api/intelligence/integration-fabric/' + suffix, 200]),
            ...['status', 'catalog', 'connector-profiles', 'customer-environments', 'root-neural-governance', 'coverage']
                .map(suffix => ['/api/sdk-fabric-mcp/integration/' + suffix, 200])
        ] : [];
        for (const [path, expected, method = 'GET'] of [
            ...optionalChecks,
            ['/api/virtual-customer', 404],
            ['/api/virtual-customer/login', 404, 'POST']
        ]) {
            await check(path, expected, { method });
        }
        for (const base of ['/api/infinite-agent', '/api/sheikha-kernel']) {
            for (const suffix of ['/', '/status']) {
                await check(base + suffix, 200, { validate: data => {
                    assert.equal(data.schema, 'LOCAL_DESCRIPTOR_MODEL');
                    assert.equal(data.liveNeuralNetwork, false);
                    assert.equal(data.bounded, true);
                } });
            }
            for (const suffix of ['/design', '/full', '/spawn']) await check(base + suffix, 401);
            await check(base + '/spawn', 401, { method: 'POST', input: {} });
        }
        const before = await check('/api/infinite-agent/design', 200, { authenticated: true });
        await check('/api/infinite-agent/spawn', 405, { authenticated: true, validate: (_data, headers) => {
            assert.equal(headers.allow, 'POST');
        } });
        await check('/api/infinite-agent/design', 200, { authenticated: true, validate: data => {
            assert.equal(data.statistics.agents, before.statistics.agents);
        } });
        const root = await check('/api/infinite-agent/spawn', 201, {
            method: 'POST', authenticated: true, input: {}, validate: data => {
                assert.equal(data.created, 1);
                assert.equal(data.externalExecution, false);
                assert.equal(data.persistent, false);
                assert.equal(data.statistics.agents, before.statistics.agents + 1);
            }
        });
        await check('/api/sheikha-kernel/spawn', 201, {
            method: 'POST', authenticated: true, input: { parentId: root.botIds[0], count: 2 }, validate: data => {
                assert.equal(data.created, 2);
                assert.equal(data.statistics.agents, before.statistics.agents + 3);
            }
        });
        for (const input of [{ count: 101 }, { count: 1000000 }, { humanApproved: true }]) {
            await check('/api/infinite-agent/spawn', 400, { method: 'POST', authenticated: true, input });
        }
        await check('/api/infinite-agent/spawn?count=100', 400, {
            method: 'POST', authenticated: true, input: {}
        });
        await check('/api/sheikha-kernel/full', 200, { authenticated: true, validate: data => {
            assert.equal(data.statistics.agents, before.statistics.agents + 3);
            assert.equal(data.liveNeuralNetwork, false);
            assert.equal(data.externalExecution, false);
            assert.equal(data.seal, null);
        } });
        for (const base of ['/api/cosmic-engineering', '/api/cosmic']) {
            for (const suffix of ['/', '/island', '/rasul', '/atoms']) await check(base + suffix, 401);
            for (const suffix of ['/', '/island', '/water']) {
                await check(base + suffix, 200, { authenticated: true, validate: data => assert.equal(data.synthetic, true) });
            }
            await check(base + '/rasul', 200, { authenticated: true, validate: data => {
                assert.equal(data.status, 'REFERENCE_FRAME_ONLY');
                assert.equal(data.biologicalSimulation, false);
            } });
            await check(base + '/atoms', 501, { authenticated: true, validate: data => {
                assert.equal(data.error, 'ATOMIC_SIMULATION_NOT_IMPLEMENTED');
                assert.equal(data.executed, false);
            } });
            await check(base + '/simulate', 401, { method: 'POST', input: { scenario: 'island' } });
            await check(base + '/simulate', 200, {
                method: 'POST', authenticated: true, input: { scenario: 'island', rainMm: 20 }, validate: data => {
                    assert.equal(data.data.synthetic, true);
                    assert.equal(data.data.water.conserved, true);
                    assert.ok(Math.abs(data.data.water.balanceResidualMm) <= data.data.water.balanceToleranceMm);
                    assert.equal(data.externalExecution, false);
                }
            });
            await check(base + '/simulate', 400, { method: 'POST', authenticated: true, input: { rainMm: -1 } });
        }
        if (missing.size) throw new Error('MODULE_NOT_FOUND_OBSERVED');
        report.status = 'PASS';
    } catch (error) {
        report.error = error.name === 'AssertionError' ? 'ENDPOINT_CONTRACT_FAILED' : error.message;
        process.exitCode = 1;
    } finally {
        if (!exited) child.kill('SIGTERM');
        const kill = setTimeout(() => { if (!exited) child.kill('SIGKILL'); }, 3000);
        await exit;
        clearTimeout(kill);
        report.missingModules = [...missing].sort();
        if (report.serverExitCode !== 0 || missing.size) {
            report.status = 'FAIL';
            report.error = report.error || 'UNCLEAN_SHUTDOWN_OR_MISSING_MODULE';
            process.exitCode = 1;
        }
        console.log(JSON.stringify(report, null, 2));
    }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
