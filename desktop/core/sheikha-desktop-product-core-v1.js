'use strict';

const crypto = require('node:crypto');

const MAX_PAYLOAD_BYTES = 64 * 1024;

function clonePlainValue(value, depth = 0) {
  if (depth > 20) throw new Error('Desktop intent payload exceeds the maximum depth.');
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((item) => clonePlainValue(item, depth + 1));
  if (typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error('Desktop intent payload must contain JSON-compatible plain values only.');
  }
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new Error('Desktop intent payload contains a prohibited key.');
    }
    output[key] = clonePlainValue(item, depth + 1);
  }
  return output;
}

function createDesktopIntent(input = {}) {
  const capability = String(input.capability || '').trim();
  if (!capability) throw new Error('Desktop intent capability is required.');
  const payload = clonePlainValue(input.payload || {});
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload));
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    throw new Error(`Desktop intent payload exceeds ${MAX_PAYLOAD_BYTES} bytes.`);
  }
  const actorId = String(input.actor?.id || '').trim();
  if (!actorId) throw new Error('Desktop intent actor.id is required.');

  return Object.freeze({
    schemaVersion: '1.0.0',
    requestId: String(input.requestId || crypto.randomUUID()),
    requestedAt: String(input.requestedAt || new Date().toISOString()),
    capability,
    actor: Object.freeze({
      id: actorId,
      type: String(input.actor?.type || 'human')
    }),
    payload: Object.freeze(payload),
    humanApproval: input.humanApproval ? Object.freeze(clonePlainValue(input.humanApproval)) : null,
    aiApproval: input.aiApproval === true
  });
}

function createDesktopProductCore({ bridge }) {
  if (!bridge || typeof bridge.execute !== 'function') {
    throw new Error('A governed desktop capability bridge is required.');
  }
  return Object.freeze({
    createIntent: createDesktopIntent,
    dispatch(input, context = {}) {
      return bridge.execute(createDesktopIntent(input), context);
    }
  });
}

module.exports = {
  MAX_PAYLOAD_BYTES,
  createDesktopIntent,
  createDesktopProductCore
};
