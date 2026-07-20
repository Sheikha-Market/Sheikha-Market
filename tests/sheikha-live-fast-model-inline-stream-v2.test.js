'use strict';

const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha real fast-model inline stream V2', () => {
  const root = path.resolve(__dirname, '..');

  const route = fs.readFileSync(
    path.join(
      root,
      'routes/live-realtime-fabric/' +
      'sheikha-live-realtime-fabric-routes.js'
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
    'routes default live chat through a real inline model stream',
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
        'fastThenDeepStreaming: false'
      );

      expect(runtime).toContain(
        'backgroundDeepSingleFlight: false'
      );

      expect(runtime).toContain(
        'backgroundDeepDisabledByDefault: true'
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
    }
  );
});
