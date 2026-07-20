'use strict';

const http = require('node:http');
const { EventEmitter } = require('node:events');

describe('Sheikha live request runtime metrics', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  function createResponse() {
    const response = new EventEmitter();

    response.writableEnded = false;
    response.destroyed = false;
    response.write = jest.fn(() => true);

    response.end = jest.fn(() => {
      response.writableEnded = true;
    });

    return response;
  }

  function createRequest() {
    const request = new EventEmitter();

    request.destroyed = false;
    request.write = jest.fn();
    request.end = jest.fn();

    request.destroy = jest.fn(error => {
      request.destroyed = true;
      request.destroyReason = error;
      request.emit('close');
    });

    return request;
  }

  test(
    'tracks an active request and settles it as aborted',
    () => {
      const request = createRequest();

      jest
        .spyOn(http, 'request')
        .mockImplementation(() => request);

      const router = require(
        '../routes/live-realtime-fabric/' +
        'sheikha-live-realtime-fabric-routes'
      );

      const runtime = require(
        '../runtime/live-realtime-fabric/v1/' +
        'sheikha-live-realtime-fabric-v1'
      );

      const before =
        router.__test.snapshotLiveRequestMetrics();

      const response = createResponse();

      router.__test.streamOllama({
        message: 'abort metrics verification',
        mode: 'coding',
        profile: {
          ...runtime.resolveLiveProfile(
            'abort metrics verification',
            'coding'
          ),
          model: 'sheikha-test-model',
          timeoutMs: 60000,
          firstTokenTargetMs: 60000,
          numPredict: 8
        },
        res: response
      });

      const active =
        router.__test.snapshotLiveRequestMetrics();

      expect(active.totalOllamaRequests).toBe(
        before.totalOllamaRequests + 1
      );

      expect(active.activeOllamaRequests).toBe(
        before.activeOllamaRequests + 1
      );

      response.emit('close');

      const after =
        router.__test.snapshotLiveRequestMetrics();

      expect(after.activeOllamaRequests).toBe(
        before.activeOllamaRequests
      );

      expect(after.abortedOllamaRequests).toBe(
        before.abortedOllamaRequests + 1
      );

      expect(after.lastOutcome).toBe('aborted');
      expect(request.destroy).toHaveBeenCalledTimes(1);
    }
  );
});
