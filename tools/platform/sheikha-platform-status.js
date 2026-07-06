'use strict';

const fs = require('fs');

const fabric = JSON.parse(
  fs.readFileSync(
    'runtime/platform/sheikha-platform-fabric.json',
    'utf8'
  )
);

const result = {
  platform: fabric.platform,
  status: fabric.status,
  cloud: fabric.layers.cloud.status,
  saas: fabric.layers.saas.status,
  erp: fabric.layers.erp.status,
  scm: fabric.layers.scm.status,
  auth: fabric.layers.auth.status,
  organizations: fabric.layers.organizations.status,
  principle: fabric.principle
};

console.log(JSON.stringify(result, null, 2));
