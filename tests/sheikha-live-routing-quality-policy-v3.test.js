'use strict';

const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha live routing, quality and latency policy V3', () => {
  const root = path.resolve(__dirname, '..');

  const runtime = require(
    '../runtime/live-realtime-fabric/v1/' +
    'sheikha-live-realtime-fabric-v1'
  );

  const router = require(
    '../routes/live-realtime-fabric/' +
    'sheikha-live-realtime-fabric-routes'
  );

  const runtimeSource = fs.readFileSync(
    path.join(
      root,
      'runtime/live-realtime-fabric/v1/' +
      'sheikha-live-realtime-fabric-v1.js'
    ),
    'utf8'
  );

  const routeSource = fs.readFileSync(
    path.join(
      root,
      'routes/live-realtime-fabric/' +
      'sheikha-live-realtime-fabric-routes-clean-checkout-canonical-v1.js'
    ),
    'utf8'
  );

  test('detects Arabic input without classifying English as Arabic', () => {
    expect(
      router.__test.containsArabicText('مرحبا بكم')
    ).toBe(true);

    expect(
      router.__test.containsArabicText(
        'Return only this text: LIVE_MODEL_STREAM_OK'
      )
    ).toBe(false);
  });

  test('uses Qwen as the default coding model', () => {
    const profile = runtime.resolveLiveProfile(
      'Return only this text: LIVE_MODEL_STREAM_OK',
      'coding'
    );

    expect(profile.model).toBe('qwen2.5-coder:7b');
  });

  test('creates a strict exact-output prompt contract', () => {
    const prompt = runtime.buildPrompt(
      'Return only this text: LIVE_MODEL_STREAM_OK',
      runtime.resolveLiveProfile(
        'Return only this text: LIVE_MODEL_STREAM_OK',
        'coding'
      )
    );

    expect(prompt).toContain(
      'Output exactly the text below.'
    );

    expect(prompt).toContain(
      'LIVE_MODEL_STREAM_OK'
    );

    expect(prompt).not.toContain(
      'sample response in Arabic'
    );
  });

  test('uses the locally verified Arabic quality model for the extension', () => {
    const base = runtime.resolveLiveProfile(
      'تحليل عميق',
      'general'
    );

    const deep =
      router.__test.createDeepStreamingProfile(base);

    expect(deep.model).toBe('qwen2.5-coder:7b');
  });

  test('declares the first-token target as progress, not SLA', () => {
    const result = runtime.status();

    expect(
      result.performance.firstTokenTargetPurpose
    ).toBe('MODEL_WAIT_PROGRESS_THRESHOLD');

    expect(
      result.performance.firstTokenTargetIsSla
    ).toBe(false);

    expect(
      result.performance.coldStartFirstTokenSlaMs
    ).toBeNull();

    expect(
      result.performance.coldStartPerformanceCertification
    ).toBe('NOT_CERTIFIED_CPU_VARIABLE');
  });

  test('uses a contextual first token and keeps canned completion unreachable', () => {
    const defaultInline = routeSource.indexOf(
      'if (fastArabicDefault && !deepStreamRequested)'
    );

    const deepInline = routeSource.indexOf(
      'if (fastArabicDefault && deepStreamRequested)'
    );

    expect(defaultInline).toBeGreaterThan(-1);
    expect(deepInline).toBeGreaterThan(defaultInline);

    const afterDeepGate = routeSource.slice(deepInline);

    expect(afterDeepGate).not.toContain(
      'writeFastArabicCompletion(res, message)'
    );
    expect(afterDeepGate).toContain(
      'writeFastArabicOpening(res, message)'
    );

    expect(runtimeSource).toContain(
      "'qwen2.5-coder:7b'"
    );
  });
});
