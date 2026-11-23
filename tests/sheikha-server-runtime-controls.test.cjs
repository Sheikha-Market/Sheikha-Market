'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../server.js'), 'utf8');
const start = source.indexOf('function governedCronSchedule(');
assert.ok(start > 0);
const wrapper = source.slice(start, source.indexOf('\n}', start) + 2);

function scheduler(env) {
  const calls = [];
  const scheduled = { testOnly: true };
  const fn = vm.runInNewContext(wrapper + '\ngovernedCronSchedule;', {
    process: { env }, cron: { schedule: (...args) => { calls.push(args); return scheduled; } }
  });
  return { fn, calls, scheduled };
}

test('cron is disabled without exact opt-in and never invokes the task', () => {
  for (const flag of [undefined, 'false', 'TRUE', '1', true]) {
    const { fn, calls } = scheduler({ SHEIKHA_ENABLE_CRON: flag });
    const result = fn('* * * * *', () => assert.fail('task must not execute'));
    assert.equal(result.status, 'DISABLED');
    assert.equal(calls.length, 0);
  }
});

test('explicit cron opt-in preserves the scheduler arguments without executing a task inline', () => {
  const { fn, calls, scheduled } = scheduler({ SHEIKHA_ENABLE_CRON: 'true' });
  const task = () => assert.fail('task must not execute inline');
  const options = { timezone: 'Asia/Riyadh' };
  assert.equal(fn('*/15 * * * *', task, options), scheduled);
  assert.deepEqual(calls, [['*/15 * * * *', task, options]]);
});

test('all direct cron registrations use the guard and automation remains opt-in', () => {
  assert.equal((source.match(/cron\.schedule\(/g) || []).length, 1);
  assert.equal((source.match(/governedCronSchedule\('/g) || []).length, 2);
  assert.ok(source.includes("if (process.env.SHEIKHA_ENABLE_CRON === 'true') automationEngine.startScheduler();"));
});

test('server has bounded graceful shutdown for both termination signals', () => {
  assert.ok(source.includes("process.once('SIGTERM', shutdownRuntime)"));
  assert.ok(source.includes("process.once('SIGINT', shutdownRuntime)"));
  assert.ok(source.includes('if (runtimeShutdownRequested) return;'));
  assert.ok(source.includes('setTimeout(() => process.exit(1), 10000)'));
  assert.ok(source.includes('server.close(error =>'));
  assert.ok(source.includes('client.terminate()'));
});

test('server binds all IPv4 interfaces and uses PORT with an 8080 default', () => {
  const declarations = source.match(/^const (?:PORT|HOST) = .*;$/gm);
  assert.equal(declarations.length, 2);
  for (const [env, expectedPort] of [[{}, 8080], [{ PORT: '9080' }, 9080],
    [{ PORT: '8080', HOST: '127.0.0.1', K_SERVICE: 'test-only' }, 8080]]) {
    const result = vm.runInNewContext(declarations.join('\n') + '\n({ port: PORT, host: HOST });', { process: { env } });
    assert.equal(result.port, expectedPort);
    assert.equal(result.host, '0.0.0.0');
  }
  assert.equal((source.match(/\bapp\.listen\(/g) || []).length, 1);
  assert.ok(source.includes('const server = app.listen(PORT, HOST, () => {'));
  assert.ok(source.includes('console.log(`Sheikha listening on http://${HOST}:${PORT}`);'));
  assert.ok(!source.includes('223 weights - 8,080,000 SHK'));
  assert.ok(source.includes('new WebSocket.Server({ server })'));
});
