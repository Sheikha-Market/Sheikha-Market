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
    'runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1.json'
  );
  const report = readJson(
    'runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/products', (_req, res) => {
  const products = readJson(
    'runtime/commercial-product-layer/v1/registries/commercial-products-registry.json'
  );
  const productSheets = readJson(
    'runtime/commercial-product-layer/v1/registries/product-sheets-registry.json'
  );

  return res.json({
    success: true,
    products,
    productSheets,
    timestamp: new Date().toISOString()
  });
});

router.get('/readiness', (_req, res) => {
  const readiness = readJson(
    'runtime/commercial-product-layer/v1/registries/commercial-readiness-registry.json'
  );
  const valueProof = readJson(
    'runtime/commercial-product-layer/v1/registries/commercial-value-proof-registry.json'
  );

  return res.json({
    success: true,
    readiness,
    valueProof,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
