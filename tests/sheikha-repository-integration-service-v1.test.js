'use strict';

const { EventEmitter } = require('node:events');

describe('Bounded repository inspection worker', () => {
  let workers;
  let inspect;
  beforeEach(() => {
    jest.resetModules(); jest.useFakeTimers(); workers = [];
    jest.doMock('node:worker_threads', () => ({ isMainThread: true,
      Worker: jest.fn(function (_file, settings) {
        const worker = new EventEmitter();
        worker.settings = settings; worker.terminate = jest.fn(async () => 0);
        workers.push(worker); return worker;
      }) }));
    inspect = require('../runtime/repository-integration/v1/inspection-service-v1').inspectIntegrationsAsync;
  });
  afterEach(() => { jest.useRealTimers(); jest.dontMock('node:worker_threads'); jest.resetModules(); });

  test('deduplicates concurrent inspection and expires the short-lived snapshot', async () => {
    const first = inspect();
    expect(inspect()).toBe(first);
    expect(workers).toHaveLength(1);
    expect(workers[0].settings.env).toEqual({});
    expect(workers[0].settings.execArgv).toEqual([]);
    workers[0].emit('message', { ok: true, data: { checkedAt: 'test', value: 1 } });
    await expect(first).resolves.toMatchObject({ value: 1 });
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
    await expect(inspect()).resolves.toMatchObject({ value: 1 });
    expect(workers).toHaveLength(1);
    jest.advanceTimersByTime(5001);
    const next = inspect();
    workers[1].emit('message', { ok: true, data: { value: 2 } });
    await expect(next).resolves.toMatchObject({ value: 2 });
  });

  test('bounds different simultaneous registry jobs and releases capacity after timeout', async () => {
    const first = inspect();
    const failure = expect(first).rejects.toThrow('REPOSITORY_INSPECTION_UNAVAILABLE');
    await expect(inspect({ registryFile: '/different' })).rejects.toThrow('REPOSITORY_INSPECTION_BUSY');
    jest.advanceTimersByTime(15000);
    await failure;
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
    const next = inspect();
    workers[1].emit('message', { ok: true, data: {} }); await next;
  });

  test.each(['error', 'exit', 'message'])('worker failure is sanitized and never cached: %s', async event => {
    const first = inspect();
    const failure = expect(first).rejects.toThrow('REPOSITORY_INSPECTION_UNAVAILABLE');
    workers[0].emit(event, event === 'error' ? new Error('/private/secret') : undefined);
    await failure;
    const retry = inspect();
    expect(workers).toHaveLength(2);
    workers[1].emit('message', { ok: true, data: {} }); await retry;
  });
});
