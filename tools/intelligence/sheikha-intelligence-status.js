#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '../../runtime/intelligence');
const subdirs = fs.readdirSync(base).filter(f => fs.statSync(path.join(base, f)).isDirectory());

console.log('\n[SHEIKHA] Intelligence Engine Status\n');
subdirs.forEach(sub => {
  const dir = path.join(base, sub);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    const fabric = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log('  System   :', fabric.system);
    console.log('  Status   :', fabric.status);
    console.log('  Principle:', fabric.principle);
    console.log();
  });
});
