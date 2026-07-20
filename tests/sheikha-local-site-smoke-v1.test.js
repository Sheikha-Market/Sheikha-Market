'use strict';

const {
  assertLoopback,
  parseSseEvents,
} = require('../tools/verification/sheikha-local-site-smoke-v1');

describe('Sheikha local site smoke verifier', () => {
  test('accepts loopback URLs and rejects remote targets', () => {
    expect(assertLoopback('http://127.0.0.1:8080')).toBe(
      'http://127.0.0.1:8080'
    );
    expect(() => assertLoopback('https://example.com')).toThrow(
      'loopback URLs only'
    );
  });

  test('parses ordered SSE events and JSON data', () => {
    const events = parseSseEvents([
      'event: ack',
      'data: {"ok":true}',
      '',
      'event: token',
      'data: {"text":"تم"}',
      '',
      'event: done',
      'data: {"ok":true}',
      '',
    ].join('\n'));

    expect(events.map((entry) => entry.event)).toEqual([
      'ack',
      'token',
      'done',
    ]);
    expect(events[1].data.text).toBe('تم');
  });
});
