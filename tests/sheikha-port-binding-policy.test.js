'use strict';

const {
  nextFallbackPort,
  parsePort,
  resolvePortBindingPolicy
} = require('../lib/runtime/sheikha-port-binding-policy');

describe('Sheikha runtime port binding policy', () => {
  test('binds to 8080 and fails closed by default', () => {
    expect(resolvePortBindingPolicy({})).toEqual({
      requestedPort: 8080,
      nativeBindingRequired: true,
      fallbackAllowed: false,
      maxFallbackAttempts: 0,
      nativeSafeByDefault: true
    });
  });

  test('accepts an explicit valid port without enabling fallback', () => {
    expect(resolvePortBindingPolicy({ PORT: '8090' })).toMatchObject({
      requestedPort: 8090,
      fallbackAllowed: false,
      maxFallbackAttempts: 0
    });
  });

  test('requires an explicit exact value to enable fallback', () => {
    expect(resolvePortBindingPolicy({ SHEIKHA_ALLOW_PORT_FALLBACK: 'TRUE' }))
      .toMatchObject({ fallbackAllowed: false });

    expect(() => resolvePortBindingPolicy({
      SHEIKHA_ALLOW_PORT_FALLBACK: 'true'
    })).toThrow('SHEIKHA_PORT_FALLBACK_CONFLICTS_WITH_NATIVE_BINDING');

    const policy = resolvePortBindingPolicy({
      PORT: '8080',
      SHEIKHA_ALLOW_PORT_FALLBACK: 'true',
      SHEIKHA_NATIVE_PORT_BINDING: 'disabled',
      SHEIKHA_MAX_PORT_FALLBACK_ATTEMPTS: '2'
    });
    expect(policy).toMatchObject({
      fallbackAllowed: true,
      nativeBindingRequired: false,
      maxFallbackAttempts: 2,
      nativeSafeByDefault: false
    });
    expect(nextFallbackPort({ code: 'EADDRINUSE' }, 8080, 0, policy)).toBe(8081);
    expect(nextFallbackPort({ code: 'EADDRINUSE' }, 8081, 2, policy)).toBeNull();
  });

  test.each(['0', '65536', '-1', 'not-a-port', '8.5'])(
    'rejects invalid port %s',
    (value) => expect(() => parsePort(value)).toThrow('SHEIKHA_RUNTIME_PORT_INVALID')
  );

  test('never falls back for unrelated errors or past the port ceiling', () => {
    const policy = resolvePortBindingPolicy({
      SHEIKHA_ALLOW_PORT_FALLBACK: 'true',
      SHEIKHA_NATIVE_PORT_BINDING: 'disabled'
    });
    expect(nextFallbackPort({ code: 'EACCES' }, 8080, 0, policy)).toBeNull();
    expect(nextFallbackPort({ code: 'EADDRINUSE' }, 65535, 0, policy)).toBeNull();
  });
});
