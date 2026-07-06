const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), relativePath),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  const registry = readJson(
    'runtime/platform-factories/v1/sheikha-platform-factories-v1.json'
  );
  const report = readJson(
    'runtime/platform-factories/v1/sheikha-platform-factories-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/factories', (_req, res) => {
  const scienceFactory = readJson(
    'runtime/platform-factories/v1/registries/science-factory.json'
  );
  const educationFactory = readJson(
    'runtime/platform-factories/v1/registries/education-factory.json'
  );
  const productFactory = readJson(
    'runtime/platform-factories/v1/registries/product-factory.json'
  );
  const impactFactory = readJson(
    'runtime/platform-factories/v1/registries/impact-factory.json'
  );

  return res.json({
    success: true,
    factories: {
      scienceFactory,
      educationFactory,
      productFactory,
      impactFactory
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/pipeline', (_req, res) => {
  const pipeline = readJson(
    'runtime/platform-factories/v1/registries/factory-pipeline-map.json'
  );

  return res.json({
    success: true,
    pipeline,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
