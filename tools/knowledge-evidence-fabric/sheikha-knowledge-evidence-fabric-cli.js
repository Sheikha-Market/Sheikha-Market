#!/usr/bin/env node
'use strict';

const {
  status,
  createEvidenceRecord
} = require('../../runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'record') {
  console.log(JSON.stringify(createEvidenceRecord({
    message: process.argv.slice(3).join(' ') || 'اختبار دليل معرفة',
    evidence: [{ source: 'local-runtime', type: 'test' }],
    memory: [{ source: 'session' }],
    artifacts: []
  }), null, 2));
} else {
  console.error('Usage: status|record <message>');
  process.exit(1);
}
