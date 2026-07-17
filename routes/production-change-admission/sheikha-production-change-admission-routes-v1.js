'use strict';

const express = require('express');

const gate = require(
  '../../core/production-safety/'
  + 'sheikha-production-change-admission-gate-v1'
);

const CONTRACT =
  'SHEIKHA_PRODUCTION_CHANGE_ADMISSION_HTTP_ADAPTER_V1';

const BASE_PATH =
  '/api/sheikha/production-change-admission/v1';

function isPlainObject(value) {
  return (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
  );
}

function applyHeaders(res) {
  res.set(
    'X-Sheikha-Contract',
    CONTRACT
  );
  res.set(
    'Cache-Control',
    'no-store, max-age=0'
  );
  res.set(
    'Pragma',
    'no-cache'
  );
}

function sendJson(
  res,
  statusCode,
  payload
) {
  applyHeaders(res);

  return res
    .status(statusCode)
    .json(payload);
}

function methodNotAllowed(req, res) {
  return sendJson(
    res,
    405,
    {
      schemaVersion: '1.0.0',
      contract: CONTRACT,
      error: 'METHOD_NOT_ALLOWED',
      method: req.method,
      path: req.path
    }
  );
}

function createSheikhaProductionChangeAdmissionRoutesV1() {
  const router = express.Router();

  router.use(
    express.json({
      limit: '64kb',
      strict: true
    })
  );

  router.get(
    '/status',
    (req, res) => sendJson(
      res,
      200,
      {
        schemaVersion: '1.0.0',
        contract: CONTRACT,
        result: gate.status()
      }
    )
  );

  router.all(
    '/status',
    methodNotAllowed
  );

  router.get(
    '/verify',
    (req, res) => sendJson(
      res,
      200,
      {
        schemaVersion: '1.0.0',
        contract: CONTRACT,
        result: gate.verify()
      }
    )
  );

  router.all(
    '/verify',
    methodNotAllowed
  );

  router.post(
    '/assess',
    (req, res) => {
      if (!isPlainObject(req.body)) {
        return sendJson(
          res,
          400,
          {
            schemaVersion: '1.0.0',
            contract: CONTRACT,
            error: 'INVALID_REQUEST_BODY',
            required: 'JSON_OBJECT'
          }
        );
      }

      /*
       * Deliberately pass only the external request.
       * No trusted approval context is accepted over HTTP.
       */
      const result =
        gate.assessProductionChangeAdmission(
          req.body
        );

      return sendJson(
        res,
        200,
        {
          schemaVersion: '1.0.0',
          contract: CONTRACT,
          result
        }
      );
    }
  );

  router.all(
    '/assess',
    methodNotAllowed
  );

  router.use(
    (req, res) => sendJson(
      res,
      404,
      {
        schemaVersion: '1.0.0',
        contract: CONTRACT,
        error: 'NOT_FOUND',
        method: req.method,
        path: req.path
      }
    )
  );

  router.use(
    (error, req, res, next) => {
      if (
        error
        && (
          error.type
            === 'entity.parse.failed'
          || error instanceof SyntaxError
        )
      ) {
        return sendJson(
          res,
          400,
          {
            schemaVersion: '1.0.0',
            contract: CONTRACT,
            error: 'MALFORMED_JSON'
          }
        );
      }

      return next(error);
    }
  );

  return router;
}

module.exports = Object.freeze({
  CONTRACT,
  BASE_PATH,
  createSheikhaProductionChangeAdmissionRoutesV1
});
