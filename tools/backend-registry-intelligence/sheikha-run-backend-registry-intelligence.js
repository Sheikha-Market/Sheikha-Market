#!/usr/bin/env node
'use strict';

const { inspectBackends } = require('../../runtime/backend-registry-intelligence/sheikha-backend-registry-intelligence-v1');

const report = inspectBackends('/etc/haproxy/haproxy.cfg');
console.log(JSON.stringify(report, null, 2));

process.exit(report.decision === 'HEALTHY' ? 0 : 2);
