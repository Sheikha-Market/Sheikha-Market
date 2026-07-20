'use strict';

const http = require('node:http');
const { EventEmitter } = require('node:events');

describe('Sheikha live chat governed abort propagation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  function createSseResponse() {
    const response = new EventEmitter();

    response.writableEnded = false;
    response.destroyed = false;

    response.write = jest.fn(() => true);

    response.end = jest.fn(() => {
      response.writableEnded = true;
    });

    return response;
  }

  function createRequestDouble() {
    const request = new EventEmitter();

    request.destroyed = false;
    request.write = jest.fn();
    request.end = jest.fn();

    request.destroy = jest.fn(error => {
      request.destroyed = true;
      request.destroyReason = error;
    });

    return request;
  }

  test(
    'aborts the Ollama signal and destroys the request when SSE closes',
    () => {
      const request = createRequestDouble();

      let capturedOptions;
      let capturedResponseHandler;

      jest
        .spyOn(http, 'request')
        .mockImplementation((options, responseHandler) => {
          capturedOptions = options;
          capturedResponseHandler = responseHandler;
          return request;
        });

      const router = require(
        '../routes/live-realtime-fabric/' +
        'sheikha-live-realtime-fabric-routes'
      );

      const runtime = require(
        '../runtime/live-realtime-fabric/v1/' +
        'sheikha-live-realtime-fabric-v1'
      );

      const response = createSseResponse();

      const profile = {
        ...runtime.resolveLiveProfile(
          'اختبار إلغاء الطلب',
          'general'
        ),
        model: 'sheikha-test-model',
        timeoutMs: 60000,
        firstTokenTargetMs: 60000,
        numPredict: 8
      };

      router.__test.streamOllama({
        message: 'اختبار إلغاء الطلب',
        mode: 'general',
        profile,
        res: response
      });

      expect(http.request).toHaveBeenCalledTimes(1);
      expect(capturedOptions.signal).toBeDefined();
      expect(capturedOptions.signal.aborted).toBe(false);

      response.emit('close');

      expect(capturedOptions.signal.aborted).toBe(true);
      expect(request.destroy).toHaveBeenCalledTimes(1);
      expect(request.destroyed).toBe(true);

      const writesBeforeLateResponse =
        response.write.mock.calls.length;

      const ollamaResponse = new EventEmitter();

      capturedResponseHandler(ollamaResponse);

      ollamaResponse.emit(
        'data',
        Buffer.from(
          '{"response":"نص متأخر","done":false}\n',
          'utf8'
        )
      );

      ollamaResponse.emit('end');

      expect(response.write.mock.calls.length).toBe(
        writesBeforeLateResponse
      );

      expect(response.end).not.toHaveBeenCalled();
    }
  );

  test(
    'does not write SSE events to a destroyed response',
    () => {
      const router = require(
        '../routes/live-realtime-fabric/' +
        'sheikha-live-realtime-fabric-routes'
      );

      const response = createSseResponse();
      response.destroyed = true;

      const written = router.__test.sendSse(
        response,
        'token',
        { text: 'يجب ألا يكتب' }
      );

      expect(written).toBe(false);
      expect(response.write).not.toHaveBeenCalled();
    }
  );

  test(
    'allows SSE writes while the response remains open',
    () => {
      const router = require(
        '../routes/live-realtime-fabric/' +
        'sheikha-live-realtime-fabric-routes'
      );

      const response = createSseResponse();

      const written = router.__test.sendSse(
        response,
        'progress',
        { text: 'جارٍ العمل' }
      );

      expect(written).toBe(true);
      expect(response.write).toHaveBeenCalledTimes(2);
    }
  );
});
