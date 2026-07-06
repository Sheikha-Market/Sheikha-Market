#!/usr/bin/env node
'use strict';

const { status, analyze } = require('../../runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else {
  console.log(JSON.stringify(analyze({
    factories: [
      {
        name: 'Refinery Cluster',
        type: 'refinery',
        utilities: ['steam', 'water', 'power'],
        materials: [
          { name: 'Crude Oil', stage: 'raw', state: 'liquid', supplierRarity: 'rare', consistency: 'variable' },
          { name: 'Refined Product', stage: 'finished', state: 'liquid', consistency: 'standard' }
        ]
      },
      {
        name: 'Mining Cluster',
        type: 'mining',
        utilities: ['power', 'water'],
        materials: [
          { name: 'Ore', stage: 'raw', state: 'solid', consistency: 'variable' },
          { name: 'Concentrate', stage: 'semi', state: 'powder', consistency: 'standard' }
        ]
      }
    ]
  }), null, 2));
}
