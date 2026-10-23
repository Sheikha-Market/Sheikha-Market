'use strict';

const DEFAULT_PORT = 8080;
const DEFAULT_MAX_FALLBACK_ATTEMPTS = 10;
const MAX_PORT = 65535;

function parsePort(value, fallback = DEFAULT_PORT) {
  const candidate = value === undefined || value === null || value === ''
    ? fallback
    : Number(value);

  if (!Number.isSafeInteger(candidate) || candidate < 1 || candidate > MAX_PORT) {
    throw new Error('SHEIKHA_RUNTIME_PORT_INVALID');
  }

  return candidate;
}

function parseFallbackAttempts(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_MAX_FALLBACK_ATTEMPTS;
  }

  const attempts = Number(value);
  if (!Number.isSafeInteger(attempts) || attempts < 1 || attempts > 100) {
    throw new Error('SHEIKHA_PORT_FALLBACK_ATTEMPTS_INVALID');
  }

  return attempts;
}

function resolvePortBindingPolicy(env = process.env) {
  const fallbackRequested = env.SHEIKHA_ALLOW_PORT_FALLBACK === 'true';
  const nativeBindingRequired = env.SHEIKHA_NATIVE_PORT_BINDING !== 'disabled';
  if (fallbackRequested && nativeBindingRequired) {
    throw new Error('SHEIKHA_PORT_FALLBACK_CONFLICTS_WITH_NATIVE_BINDING');
  }
  const fallbackAllowed = fallbackRequested && !nativeBindingRequired;

  return Object.freeze({
    requestedPort: parsePort(env.PORT),
    nativeBindingRequired,
    fallbackAllowed,
    maxFallbackAttempts: fallbackAllowed
      ? parseFallbackAttempts(env.SHEIKHA_MAX_PORT_FALLBACK_ATTEMPTS)
      : 0,
    nativeSafeByDefault: nativeBindingRequired && !fallbackAllowed
  });
}

function nextFallbackPort(error, currentPort, attempt, policy) {
  if (!error || error.code !== 'EADDRINUSE' || !policy.fallbackAllowed) {
    return null;
  }
  if (!Number.isSafeInteger(attempt) || attempt < 0) {
    throw new Error('SHEIKHA_PORT_FALLBACK_ATTEMPT_INVALID');
  }
  if (attempt >= policy.maxFallbackAttempts || currentPort >= MAX_PORT) {
    return null;
  }

  return currentPort + 1;
}

module.exports = {
  DEFAULT_PORT,
  nextFallbackPort,
  parsePort,
  resolvePortBindingPolicy
};
