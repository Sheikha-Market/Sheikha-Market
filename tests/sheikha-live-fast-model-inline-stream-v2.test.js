'use strict';

const fs = require('node:fs');
const path = require('node:path');

afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

describe('Sheikha contextual Arabic first token stream V3', () => {
  const root = path.resolve(__dirname, '..');

  const route = fs.readFileSync(
    path.join(
      root,
      'routes/live-realtime-fabric/' +
      'sheikha-live-realtime-fabric-routes-clean-checkout-canonical-v1.js'
    ),
    'utf8'
  );

  const runtime = fs.readFileSync(
    path.join(
      root,
      'runtime/live-realtime-fabric/v1/' +
      'sheikha-live-realtime-fabric-v1.js'
    ),
    'utf8'
  );

  test(
    'sends a contextual token before the real inline model stream',
    () => {
      const defaultGate = route.indexOf(
        'if (fastArabicDefault && ' +
        '!deepStreamRequested)'
      );

      const deepGate = route.indexOf(
        'if (fastArabicDefault && ' +
        'deepStreamRequested)'
      );

      expect(defaultGate).toBeGreaterThan(-1);
      expect(deepGate).toBeGreaterThan(-1);
      expect(defaultGate).toBeLessThan(deepGate);

      const block = route.slice(
        defaultGate,
        deepGate
      );

      expect(block).toContain('streamOllama({');
      expect(block).toContain('profile,');
      expect(block).toContain(
        'writeFastArabicOpening(res, message)'
      );
      expect(block).toContain('initialTokenSent');
      expect(block).not.toContain(
        'writeFastArabicCompletion'
      );
      expect(block).not.toContain(
        'scheduleBackgroundDeepResponse'
      );
    }
  );

  test(
    'reports truthful inline-stream performance flags',
    () => {
      expect(runtime).toContain(
        'fastModelInlineStreaming: true'
      );

      expect(runtime).toContain(
        'fastThenDeepStreaming: true'
      );

      expect(runtime).toContain(
        'firstArabicTokenWithoutModelWait: true'
      );

      expect(runtime).toContain(
        'immediateContextualArabicOpening: true'
      );
    }
  );

  test(
    'retains governed request cancellation',
    () => {
      expect(route).toContain(
        'new AbortController()'
      );

      expect(route).toContain(
        'signal: abortController.signal'
      );

      expect(route).toContain(
        'req.destroy(disconnectError)'
      );

      expect(route).toContain(
        'modelFirstTokenHardTimeoutMs'
      );

      expect(route).toContain(
        'writeGovernedFallbackCompletion'
      );
    }
  );

  test(
    'parses malformed stream frames safely',
    () => {
      const router = require(
        '../routes/live-realtime-fabric/' +
        'sheikha-live-realtime-fabric-routes-clean-checkout-canonical-v1.js'
      );

      expect(router.__test.parseOllamaStreamLine('not-json')).toBeNull();
      expect(
        router.__test.parseOllamaStreamLine('{"response":"مرحبا"}')
      ).toEqual({ response: 'مرحبا' });
    }
  );
});
