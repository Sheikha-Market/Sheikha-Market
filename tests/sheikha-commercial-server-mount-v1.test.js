'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test(
  'commercial sales mount is installed once before the structural governing 404 handler',
  () => {
    const serverPath = path.resolve(
      __dirname,
      '../server.js'
    );

    const source = fs.readFileSync(
      serverPath,
      'utf8'
    );

    const marker =
      'SHEIKHA_COMMERCIAL_SALES_V1_BEFORE_404';

    const markerCount =
      source.split(marker).length - 1;

    const markerPosition =
      source.indexOf(marker);

    assert.equal(markerCount, 1);
    assert.ok(markerPosition >= 0);

    const handlerPattern =
      /^app\.use\(\(req,\s*res\)\s*=>\s*\{/gm;

    const candidatePositions = [];

    for (
      const match of source.matchAll(handlerPattern)
    ) {
      const context = source.slice(
        match.index,
        match.index + 4000
      );

      const isNotFoundHandler =
        context.includes('status(404)') ||
        context.includes('المسار غير موجود') ||
        context.includes(
          'requested API endpoint'
        );

      if (isNotFoundHandler) {
        candidatePositions.push(match.index);
      }
    }

    assert.ok(
      candidatePositions.length >= 1,
      'No structural Express 404 handler found'
    );

    const governing404Position =
      Math.min(...candidatePositions);

    assert.ok(
      markerPosition < governing404Position,
      'Commercial mount must precede the governing 404 handler'
    );

    const mountRegion = source.slice(
      markerPosition,
      governing404Position
    );

    assert.match(
      mountRegion,
      /sheikha-commercial-sales-mount-v1/
    );

    assert.match(
      mountRegion,
      /mountCommercialSales\(/
    );

    assert.match(
      mountRegion,
      /NODE_ENV === 'production'/
    );

    assert.match(
      mountRegion,
      /throw commercialSalesMountError/
    );

    assert.equal(
      source.split(
        'sheikha-commercial-sales-mount-v1'
      ).length - 1,
      1
    );
  }
);
