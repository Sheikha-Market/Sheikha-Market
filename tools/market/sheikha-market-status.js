'use strict';

const fs = require('fs');

const fabric = JSON.parse(
  fs.readFileSync('runtime/market/sheikha-market-fabric.json', 'utf8')
);

console.log(JSON.stringify({
  market: fabric.fabric,
  status: fabric.status,
  marketProduct: fabric.layers.marketProduct.status,
  materialsIntelligence: fabric.layers.materialsIntelligence.status,
  productCodes: fabric.layers.productCodes.status,
  community: fabric.layers.community.status,
  riyadAlJannah: fabric.layers.riyadAlJannah.status,
  principle: fabric.principle
}, null, 2));
