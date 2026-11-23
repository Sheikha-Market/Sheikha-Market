'use strict';

const { createSheikhaProvider } = require('../lib/sheikha-ai-router/index.js');

const provider = createSheikhaProvider();
console.log(JSON.stringify(provider.status(), null, 2));
