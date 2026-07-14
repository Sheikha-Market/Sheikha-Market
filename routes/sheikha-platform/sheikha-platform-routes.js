'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const {
  getLanguagePlatformStatus
} = require(
  '../../tools/sheikha-language-platform/' +
    'sheikha-language-platform-v1'
);

const {
  OUTPUT,
  buildInventory
} = require(
  '../../tools/foundational-closure/' +
    'sheikha-activation-inventory-v1'
);

const {
  getWorkbenchStatus,
  validateBlueprint,
  createGovernedPlan
} = require(
  '../../runtime/system-builder-workbench/v1/' +
    'sheikha-system-builder-workbench-v1'
);

const router = express.Router();

const CHARTER_FILE = path.resolve(
  __dirname,
  '../../governance/foundational-charter/v1/' +
    'sheikha-foundational-charter-v1.json'
);

router.use(express.json({
  limit: '256kb',
  strict: true
}));

function readJson(filePath) {
  return JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  );
}

function getInventory() {
  if (!fs.existsSync(OUTPUT)) {
    return buildInventory();
  }

  return readJson(OUTPUT);
}

router.get('/status', (_req, res) => {
  try {
    const charter = readJson(CHARTER_FILE);
    const language = getLanguagePlatformStatus();
    const workbench = getWorkbenchStatus();
    const inventory = getInventory();

    const passed =
      charter.status === 'ACTIVE' &&
      language.passed &&
      workbench.passed &&
      inventory.passed;

    res.status(passed ? 200 : 503).json({
      ok: passed,
      system:
        'SHEIKHA_FOUNDATIONAL_LANGUAGE_PLATFORM_V1',
      data: {
        charter: {
          system: charter.system,
          status: charter.status,
          vision: charter.vision,
          mission: charter.mission
        },
        language,
        workbench,
        inventory: {
          scan: inventory.scan,
          summary: inventory.summary
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: error.message
    });
  }
});

router.get('/charter', (_req, res) => {
  const charter = readJson(CHARTER_FILE);

  res.json({
    ok: true,
    data: charter
  });
});

router.get('/language', (_req, res) => {
  const status = getLanguagePlatformStatus();

  res.status(status.passed ? 200 : 503).json({
    ok: status.passed,
    data: status
  });
});

router.get('/inventory', (_req, res) => {
  res.json({
    ok: true,
    data: getInventory()
  });
});

router.post('/inventory/rebuild', (_req, res) => {
  const inventory = buildInventory();

  res.json({
    ok: inventory.passed,
    data: {
      scan: inventory.scan,
      summary: inventory.summary
    }
  });
});

router.get('/workbench', (_req, res) => {
  const status = getWorkbenchStatus();

  res.status(status.passed ? 200 : 503).json({
    ok: status.passed,
    data: status
  });
});

router.post('/workbench/validate', (req, res) => {
  const validation = validateBlueprint(req.body);

  res.status(validation.passed ? 200 : 422).json({
    ok: validation.passed,
    data: validation
  });
});

router.post('/workbench/plan', (req, res) => {
  const plan = createGovernedPlan(req.body);

  res.status(plan.passed ? 200 : 422).json({
    ok: plan.passed,
    data: plan
  });
});

module.exports = router;
