#!/usr/bin/env node
'use strict';

const { collect } = require('../../runtime/continuous-inspector/sheikha-continuous-inspector-v1');

const report = collect();
console.log(JSON.stringify(report, null, 2));

process.exit(report.decision === 'HEALTHY' ? 0 : 2);
