'use strict';

const CONTRACT = 'SHEIKHA_API_CONTRACT_V2';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function enforceSuccess(payload = {}, meta = {}) {
  if (isObject(payload) && payload.success === true && hasOwn(payload, 'data') && hasOwn(payload, 'meta')) {
    return payload;
  }

  if (isObject(payload) && payload.success === true && !hasOwn(payload, 'data')) {
    const { success, ...data } = payload;
    return {
      success: true,
      data,
      meta: {
        contract: CONTRACT,
        enforced: true,
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  return {
    success: true,
    data: payload,
    meta: {
      contract: CONTRACT,
      enforced: true,
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

function enforceFailure(payload = {}, meta = {}) {
  if (isObject(payload) && payload.success === false && hasOwn(payload, 'error') && hasOwn(payload, 'data') && hasOwn(payload, 'meta')) {
    return payload;
  }

  const message = isObject(payload) && payload.message ? payload.message : 'Request failed';
  const code = isObject(payload) && payload.code ? payload.code : 'SHEIKHA_ERROR';
  const status = isObject(payload) && payload.status ? payload.status : 400;

  return {
    success: false,
    error: {
      code,
      message,
      status
    },
    data: null,
    meta: {
      contract: CONTRACT,
      enforced: true,
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

function enforce(payload, meta = {}) {
  if (isObject(payload) && payload.success === false) {
    return enforceFailure(payload, meta);
  }
  return enforceSuccess(payload, meta);
}

function sendOk(res, payload = {}, meta = {}, status = 200) {
  return res.status(status).json(enforceSuccess(payload, meta));
}

function sendFail(res, payload = {}, meta = {}, status = 400) {
  return res.status(status).json(enforceFailure({ ...payload, status }, meta));
}

module.exports = {
  CONTRACT,
  enforce,
  enforceSuccess,
  enforceFailure,
  sendOk,
  sendFail
};
