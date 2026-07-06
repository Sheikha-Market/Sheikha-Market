'use strict';

function ok(data = {}, meta = {}) {
  return {
    success: true,
    data,
    meta: {
      contract: 'SHEIKHA_API_CONTRACT_V2',
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

function fail(message = 'Request failed', code = 'SHEIKHA_ERROR', status = 400, meta = {}) {
  return {
    success: false,
    error: {
      code,
      message,
      status
    },
    data: null,
    meta: {
      contract: 'SHEIKHA_API_CONTRACT_V2',
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

module.exports = { ok, fail };
