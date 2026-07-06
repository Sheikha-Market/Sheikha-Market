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
    'runtime/customer-classification/v1/sheikha-customer-classification-v1.json'
  );
  const report = readJson(
    'runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/taxonomy', (_req, res) => {
  const taxonomy = readJson(
    'runtime/customer-classification/v1/registries/customer-taxonomy-registry.json'
  );

  return res.json({
    success: true,
    taxonomy,
    timestamp: new Date().toISOString()
  });
});

router.get('/segments', (_req, res) => {
  const strategicSegments = readJson(
    'runtime/customer-classification/v1/registries/strategic-segments-registry.json'
  );
  const sectors = readJson(
    'runtime/customer-classification/v1/registries/sector-registry.json'
  );

  return res.json({
    success: true,
    strategicSegments,
    sectors,
    timestamp: new Date().toISOString()
  });
});

router.get('/routing', (_req, res) => {
  const dashboardRouting = readJson(
    'runtime/customer-classification/v1/registries/dashboard-routing-map.json'
  );
  const productValueMap = readJson(
    'runtime/customer-classification/v1/registries/product-value-map.json'
  );

  return res.json({
    success: true,
    dashboardRouting,
    productValueMap,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
