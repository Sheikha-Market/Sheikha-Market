'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const {
  buildIntegratedHabitatBlueprint,
  buildHabitatResourceBalance,
  buildWorldlyEngineeringPlan,
  buildWorldlyCosmicScope,
  SACRED_UNSEEN_BOUNDARY
} = require(
  '../../core/gardens-dialogue/' +
    'sheikha-pastures-orchards-cultivation-runtime-v1'
);
const {
  compileCultivationSource
} = require('../../sheikha-language/compiler/cultivation-compiler');

const router = express.Router();
const REPORT = path.resolve(
  __dirname,
  '../../runtime/jannat-gardens/v4/' +
    'sheikha-pastures-orchards-cultivation-v1.json'
);

router.use(express.json({
  limit: '16kb',
  strict: true,
  type: 'application/json'
}));

function send(res, operation) {
  try {
    return res.json({ ok: true, data: operation() });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'CULTIVATION_EVIDENCE_UNAVAILABLE',
      message: error.message
    });
  }
}

router.get('/status', (_req, res) => {
  return send(res, () => JSON.parse(fs.readFileSync(REPORT, 'utf8')));
});

router.get('/worldly-cosmic-scope', (_req, res) => {
  return send(res, buildWorldlyCosmicScope);
});

router.get('/sacred-references', (_req, res) => {
  return send(res, () => SACRED_UNSEEN_BOUNDARY);
});

router.post('/habitat/blueprint', (req, res) => {
  return send(res, () => buildIntegratedHabitatBlueprint(req.body || {}));
});

router.post('/habitat/resource-balance', (req, res) => {
  try {
    const data = buildHabitatResourceBalance(req.body || {});
    const invalid = data.status === 'INVALID_PLANNING_INPUT';
    return res.status(invalid ? 422 : 200).json({
      ok: !invalid,
      data
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_RESOURCE_BALANCE_INPUT',
      message: error.message
    });
  }
});

router.post('/engineering/plan', (req, res) => {
  return send(res, () => buildWorldlyEngineeringPlan(req.body || {}));
});

router.post('/language/compile', (req, res) => {
  try {
    if (typeof req.body?.source !== 'string' || !req.body.source.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'SHEIKHA_SOURCE_REQUIRED',
        message: 'الحقل source مطلوب ويجب أن يحتوي برنامج لغة شيخة.'
      });
    }
    const data = compileCultivationSource(req.body.source, {
      execute: false
    });
    return res.json({ ok: true, data });
  } catch (error) {
    return res.status(422).json({
      ok: false,
      error: error.code || 'SHEIKHA_CULTIVATION_COMPILE_FAILED',
      message: error.message,
      diagnostics: error.diagnostics || []
    });
  }
});

module.exports = router;
