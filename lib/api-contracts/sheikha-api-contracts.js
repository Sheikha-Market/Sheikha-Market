'use strict';

const RESERVED_ENVELOPE_KEYS = new Set([
  'success',
  'data',
  'meta',
  'message',
  'error',
  'errors',
  'timestamp',
  'statusCode'
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function collectLegacyData(payload) {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (!RESERVED_ENVELOPE_KEYS.has(key)) {
      acc[key] = value;
    }

    return acc;
  }, {});
}

function normalizeEnvelope(payload, options = {}) {
  const source = isPlainObject(payload) ? payload : { value: payload };
  const success = typeof source.success === 'boolean' ? source.success : true;
  const legacyData = collectLegacyData(source);
  const hasExplicitData = Object.prototype.hasOwnProperty.call(source, 'data');
  const data = hasExplicitData
    ? source.data
    : (Object.keys(legacyData).length > 0 ? legacyData : null);

  const envelope = {
    success,
    data,
    meta: {
      contract: options.contract || 'SHEIKHA_API_ENVELOPE_V1',
      compatibility: hasExplicitData ? 'canonical' : 'legacy-normalized',
      ...(isPlainObject(source.meta) ? source.meta : {}),
      ...(isPlainObject(options.meta) ? options.meta : {})
    },
    timestamp: source.timestamp || options.timestamp || new Date().toISOString()
  };

  if (source.message) {
    envelope.message = source.message;
  }

  if (source.error) {
    envelope.error = source.error;
  }

  if (options.preserveLegacyMirrors !== false) {
    Object.assign(envelope, legacyData);
  }

  return envelope;
}

function validateEnvelope(payload, contract = {}) {
  const errors = [];

  if (!isPlainObject(payload)) {
    errors.push('response must be an object');
    return { ok: false, errors };
  }

  if (typeof payload.success !== 'boolean') {
    errors.push('success must be boolean');
  }

  if (!Object.prototype.hasOwnProperty.call(payload, 'data')) {
    errors.push('data is required');
  }

  if (contract.requireTimestamp !== false && !payload.timestamp) {
    errors.push('timestamp is required');
  }

  if (Array.isArray(contract.requiredDataKeys) && isPlainObject(payload.data)) {
    contract.requiredDataKeys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(payload.data, key)) {
        errors.push(`data.${key} is required`);
      }
    });
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

module.exports = {
  normalizeEnvelope,
  validateEnvelope
};
