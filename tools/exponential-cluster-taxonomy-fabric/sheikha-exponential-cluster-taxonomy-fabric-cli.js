#!/usr/bin/env node
'use strict';

const {
  status,
  analyze
} = require('../../runtime/exponential-cluster-taxonomy-fabric/v1/sheikha-exponential-cluster-taxonomy-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'demo') {
  console.log(JSON.stringify(analyze({
    growthFactor: 1.618,
    maxDepth: 6,
    roots: [
      {
        name: 'Sheikha Root',
        scope: 'ROOT',
        type: 'structured',
        weight: 10,
        children: [
          {
            name: 'AI Cluster',
            scope: 'CLUSTER',
            type: 'semi_structured',
            weight: 8,
            children: [
              { name: 'Live Pipeline', scope: 'PIPELINE', type: 'structured', weight: 5 },
              { name: 'Model Pipeline', scope: 'PIPELINE', type: 'semi_structured', weight: 5 }
            ]
          },
          {
            name: 'Factory Network',
            scope: 'FACTORY',
            type: 'unstructured',
            weight: 7,
            children: [
              { name: 'Factory A', scope: 'FACTORY', type: 'structured', weight: 4 },
              { name: 'Factory B', scope: 'FACTORY', type: 'semi_structured', weight: 4 }
            ]
          }
        ]
      }
    ]
  }), null, 2));
} else {
  console.error('Usage: status | demo');
  process.exit(1);
}
