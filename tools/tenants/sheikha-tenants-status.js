#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const fabricPath = path.join(__dirname, '../../runtime/tenants');
const files = fs.readdirSync(fabricPath).filter(f => f.endsWith('.json'));

console.log('\n[SHEIKHA] TENANTS Governance Status\n');
files.forEach(file => {
  const fabric = JSON.parse(fs.readFileSync(path.join(fabricPath, file), 'utf8'));
  console.log('  System   :', fabric.system);
  console.log('  Status   :', fabric.status);
  console.log('  Principle:', fabric.principle);
  console.log('  Activated:', fabric.activatedAt);
  if (fabric.modules) {
    const layers = Object.entries(fabric.modules);
    console.log('  Modules  :', layers.map(([k, v]) => k + '=' + v.status).join(' | '));
  }
  console.log();
});
